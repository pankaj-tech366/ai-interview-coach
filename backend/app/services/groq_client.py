"""Thin wrapper around the Groq chat completions API with JSON-mode parsing."""
import json
import logging
from functools import lru_cache

from groq import Groq
from groq import GroqError

from app.config import get_settings

logger = logging.getLogger(__name__)


class GroqServiceError(Exception):
    """Raised when the Groq API call fails or returns something unusable."""


@lru_cache
def get_client() -> Groq:
    settings = get_settings()
    if not settings.groq_api_key:
        raise GroqServiceError(
            "The server is missing a GROQ_API_KEY. Set it in backend/.env and restart the server."
        )
    return Groq(api_key=settings.groq_api_key)


def chat_json(system_prompt: str, messages: list[dict], *, temperature: float = 0.4) -> dict:
    """Call the Groq chat completion endpoint and parse the JSON object it returns."""
    settings = get_settings()
    client = get_client()

    try:
        completion = client.chat.completions.create(
            model=settings.groq_model,
            messages=[{"role": "system", "content": system_prompt}, *messages],
            temperature=temperature,
            response_format={"type": "json_object"},
        )
    except GroqError as exc:
        logger.exception("Groq API call failed")
        raise GroqServiceError("The AI provider failed to respond. Please try again.") from exc
    except Exception as exc:  # network errors, timeouts, etc.
        logger.exception("Unexpected error calling Groq")
        raise GroqServiceError("Could not reach the AI provider. Please try again.") from exc

    raw = completion.choices[0].message.content if completion.choices else None
    if not raw:
        raise GroqServiceError("The AI provider returned an empty response.")

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        logger.exception("Failed to parse Groq JSON response: %s", raw)
        raise GroqServiceError("The AI provider returned an unexpected response.") from exc

    if not isinstance(parsed, dict):
        raise GroqServiceError("The AI provider returned an unexpected response.")

    return parsed
