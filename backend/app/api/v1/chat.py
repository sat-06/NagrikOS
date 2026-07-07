"""AI Saathi chat API routes."""

import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.ai.saathi import SaathiService
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.chat import ChatMessage, ChatSession
from app.models.user import User
from app.schemas.chat import (
    ChatMessageOut,
    ChatSessionCreate,
    ChatSessionOut,
    LifeSituationRequest,
    LifeSituationResponse,
    SaathiMetadata,
    SendMessageRequest,
    SendMessageResponse,
)

router = APIRouter(prefix="/saathi", tags=["AI Saathi"])


def _message_out(msg: ChatMessage) -> ChatMessageOut:
    meta = None
    if msg.metadata_json:
        try:
            meta = json.loads(msg.metadata_json)
        except json.JSONDecodeError:
            meta = None
    return ChatMessageOut(id=msg.id, role=msg.role, content=msg.content, metadata=meta, created_at=msg.created_at)


@router.post("/sessions", response_model=ChatSessionOut, status_code=201)
def create_session(
    data: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = ChatSession(user_id=current_user.id, title=data.title or "New conversation")
    db.add(session)
    db.commit()
    db.refresh(session)
    return ChatSessionOut.model_validate(session)


@router.get("/sessions", response_model=List[ChatSessionOut])
def list_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )
    return [ChatSessionOut.model_validate(s) for s in sessions]


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageOut])
def get_messages(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return [_message_out(m) for m in session.messages]


@router.post("/sessions/{session_id}/messages", response_model=SendMessageResponse)
async def send_message(
    session_id: int,
    data: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    user_msg = ChatMessage(session_id=session.id, role="user", content=data.content)
    db.add(user_msg)
    db.flush()

    history = [{"role": m.role, "content": m.content} for m in session.messages]
    saathi = SaathiService(db)
    result = await saathi.respond(data.content, history)

    assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=result["answer"],
        metadata_json=json.dumps(result, ensure_ascii=False),
    )
    db.add(assistant_msg)
    if not session.title or session.title == "New conversation":
        session.title = data.content[:80]
    db.commit()
    db.refresh(user_msg)
    db.refresh(assistant_msg)

    metadata = SaathiMetadata(
        detected_language=result.get("detected_language", "en"),
        intent=result.get("intent"),
        life_situation=result.get("life_situation"),
        suggested_actions=result.get("suggested_actions", []),
        related_services=result.get("related_services", []),
        sources=result.get("sources", []),
        confidence=result.get("confidence", 0.5),
        uncertainty_notes=result.get("uncertainty_notes", []),
        disclaimer=result.get("disclaimer", ""),
    )
    return SendMessageResponse(
        user_message=_message_out(user_msg),
        assistant_message=_message_out(assistant_msg),
        metadata=metadata,
    )


@router.post("/life-situation", response_model=LifeSituationResponse)
async def analyze_life_situation(
    data: LifeSituationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    saathi = SaathiService(db)
    result = await saathi.analyze_life_situation(data.text)
    return LifeSituationResponse(**result)
