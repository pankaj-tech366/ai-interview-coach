"""Report generation: turns a full interview transcript into a structured scorecard."""
from app.schemas import Difficulty, Message, Report, Speaker
from app.services.groq_client import GroqServiceError, chat_json

REPORT_SYSTEM_PROMPT = """You are an expert technical interview assessor. You will receive the full transcript of a \
technical interview on a specific topic and difficulty. Produce a structured performance report.

Topic: {topic}
Difficulty: {difficulty}

Scoring guide (score is an integer 0-100):
- 85-100: excellent
- 70-84: good
- 55-69: adequate
- below 55: weak

Base "strengths" and "weaknesses" ONLY on things the candidate actually said in the transcript — reference their \
own words or ideas, do not invent examples they did not give.

Respond ONLY with a JSON object matching exactly this shape, no other text:
{{
  "score": <integer 0-100>,
  "strengths": ["<specific strength referencing what the candidate said>", ...],
  "weaknesses": ["<specific weakness referencing what the candidate said>", ...],
  "topics_to_revise": ["<specific sub-topic the candidate should study more>", ...],
  "verdict": "<one paragraph overall verdict>",
  "result": "Pass" or "Fail"
}}

Use "Pass" for scores 55 and above, "Fail" for scores below 55.
"""


def _transcript_text(topic: str, difficulty: Difficulty, history: list[Message]) -> str:
    lines = [f"Interview transcript — topic: {topic}, difficulty: {difficulty.value}", ""]
    for m in history:
        speaker = "Interviewer" if m.role == Speaker.interviewer else "Candidate"
        lines.append(f"{speaker}: {m.content}")
    return "\n".join(lines)


def generate_report(topic: str, difficulty: Difficulty, history: list[Message]) -> Report:
    system_prompt = REPORT_SYSTEM_PROMPT.format(topic=topic, difficulty=difficulty.value)
    transcript = _transcript_text(topic, difficulty, history)
    data = chat_json(system_prompt, [{"role": "user", "content": transcript}], temperature=0.3)

    try:
        return Report(**data)
    except Exception as exc:
        raise GroqServiceError("The AI provider returned a report in an unexpected format.") from exc
