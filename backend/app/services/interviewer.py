"""Interviewer behaviour: produces the interviewer's next message given the conversation so far."""
from app.schemas import Difficulty, Message, Speaker
from app.services.groq_client import GroqServiceError, chat_json

DIFFICULTY_GUIDANCE = {
    Difficulty.easy: "basic definitions, recall, and simple 'what is / how does X work' questions",
    Difficulty.medium: "applied problems — ask the candidate to apply concepts to a scenario or describe an approach",
    Difficulty.hard: "trade-offs, edge cases, and system-level thinking — push on 'why' and 'what if' questions",
}

SYSTEM_PROMPT_TEMPLATE = """You are a professional, encouraging technical interviewer conducting a live, one-question-at-a-time interview.

Topic: {topic}
Difficulty: {difficulty} — focus on {guidance}.

Rules you must always follow:
- Ask exactly ONE question or make exactly ONE remark at a time. Never ask multiple questions in one message.
- If the candidate's last answer is strong: acknowledge briefly in one short sentence, then move to a DIFFERENT aspect of the topic with a new question.
- If the candidate's last answer is partly right: ask exactly one probing follow-up question targeting the gap, without revealing the answer.
- If the candidate's last answer is wrong: note the gap in one short sentence (do not explain the correct answer), then move on to a new question.
- NEVER teach, explain concepts, give hints, or reveal correct answers. You are only assessing.
- Stay professional, concise, and encouraging in tone.
- If the candidate has clearly struggled across several consecutive questions, end the interview early, kindly and without judgement.
- If the candidate is doing very well and you have covered the key areas of the topic at this difficulty, wrap up the interview.
- Otherwise, keep the interview going with a new question.

Respond ONLY with a JSON object matching exactly this shape, no other text:
{{"message": "<what you say to the candidate next>", "interview_over": <true or false>}}

Set "interview_over" to true only on the message where you end the interview; in that case "message" must be a brief, kind closing statement, not a question.
"""


def _build_system_prompt(topic: str, difficulty: Difficulty) -> str:
    return SYSTEM_PROMPT_TEMPLATE.format(
        topic=topic, difficulty=difficulty.value, guidance=DIFFICULTY_GUIDANCE[difficulty]
    )


def _history_to_groq_messages(history: list[Message]) -> list[dict]:
    role_map = {Speaker.interviewer: "assistant", Speaker.candidate: "user"}
    return [{"role": role_map[m.role], "content": m.content} for m in history]


def _extract_message(data: dict) -> str:
    message = data.get("message")
    if not message or not isinstance(message, str):
        raise GroqServiceError("The AI provider returned an incomplete response.")
    return message


def get_opening_question(topic: str, difficulty: Difficulty) -> str:
    system_prompt = _build_system_prompt(topic, difficulty)
    data = chat_json(
        system_prompt,
        [{"role": "user", "content": "Begin the interview with your first question."}],
    )
    return _extract_message(data)


def get_next_message(topic: str, difficulty: Difficulty, history: list[Message]) -> tuple[str, bool]:
    system_prompt = _build_system_prompt(topic, difficulty)
    groq_messages = _history_to_groq_messages(history)
    data = chat_json(system_prompt, groq_messages)
    message = _extract_message(data)
    interview_over = bool(data.get("interview_over", False))
    return message, interview_over
