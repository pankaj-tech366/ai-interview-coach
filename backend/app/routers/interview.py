"""API routes for running an interview: start, answer, report."""
from fastapi import APIRouter, HTTPException

from app.schemas import (
    AnswerRequest,
    AnswerResponse,
    Message,
    Report,
    ReportRequest,
    Speaker,
    StartRequest,
    StartResponse,
)
from app.services import interviewer
from app.services import report as report_service
from app.services.groq_client import GroqServiceError

router = APIRouter(prefix="/api/interview", tags=["interview"])


@router.post("/start", response_model=StartResponse)
def start_interview(payload: StartRequest) -> StartResponse:
    try:
        question = interviewer.get_opening_question(payload.topic, payload.difficulty)
    except GroqServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    history = [Message(role=Speaker.interviewer, content=question)]
    return StartResponse(history=history, done=False)


@router.post("/answer", response_model=AnswerResponse)
def submit_answer(payload: AnswerRequest) -> AnswerResponse:
    history = [*payload.history, Message(role=Speaker.candidate, content=payload.answer)]

    try:
        message, done = interviewer.get_next_message(payload.topic, payload.difficulty, history)
    except GroqServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    history = [*history, Message(role=Speaker.interviewer, content=message)]
    return AnswerResponse(history=history, done=done)


@router.post("/report", response_model=Report)
def get_report(payload: ReportRequest) -> Report:
    try:
        return report_service.generate_report(payload.topic, payload.difficulty, payload.history)
    except GroqServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
