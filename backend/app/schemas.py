"""Pydantic request/response schemas for the interview API."""
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class Difficulty(str, Enum):
    easy = "Easy"
    medium = "Medium"
    hard = "Hard"


class Speaker(str, Enum):
    interviewer = "interviewer"
    candidate = "candidate"


class Message(BaseModel):
    role: Speaker
    content: str


def _validate_topic(topic: str) -> str:
    topic = topic.strip()
    if not topic:
        raise ValueError("Topic must not be empty")
    if len(topic) > 200:
        raise ValueError("Topic must be 200 characters or fewer")
    return topic


class StartRequest(BaseModel):
    topic: str
    difficulty: Difficulty

    @field_validator("topic")
    @classmethod
    def topic_not_empty(cls, v: str) -> str:
        return _validate_topic(v)


class StartResponse(BaseModel):
    history: list[Message]
    done: bool = False


class AnswerRequest(BaseModel):
    topic: str
    difficulty: Difficulty
    history: list[Message] = Field(default_factory=list)
    answer: str

    @field_validator("topic")
    @classmethod
    def topic_not_empty(cls, v: str) -> str:
        return _validate_topic(v)

    @field_validator("answer")
    @classmethod
    def answer_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Answer must not be empty")
        return v


class AnswerResponse(BaseModel):
    history: list[Message]
    done: bool


class ReportRequest(BaseModel):
    topic: str
    difficulty: Difficulty
    history: list[Message] = Field(default_factory=list)

    @field_validator("topic")
    @classmethod
    def topic_not_empty(cls, v: str) -> str:
        return _validate_topic(v)

    @field_validator("history")
    @classmethod
    def history_not_empty(cls, v: list[Message]) -> list[Message]:
        if not v:
            raise ValueError("History must not be empty")
        return v


class Report(BaseModel):
    score: int = Field(ge=0, le=100)
    strengths: list[str]
    weaknesses: list[str]
    topics_to_revise: list[str]
    verdict: str
    result: Literal["Pass", "Fail"]
