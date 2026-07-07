"""Pydantic schemas for AI Saathi chat."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ChatSessionCreate(BaseModel):
    title: Optional[str] = None


class ChatSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: str
    content: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime


class SendMessageRequest(BaseModel):
    content: str = Field(min_length=1, max_length=8000)


class SaathiMetadata(BaseModel):
    detected_language: str = "en"
    intent: Optional[str] = None
    life_situation: Optional[Dict[str, Any]] = None
    suggested_actions: List[str] = []
    related_services: List[Dict[str, Any]] = []
    sources: List[Dict[str, Any]] = []
    confidence: float = Field(ge=0, le=1, default=0.5)
    uncertainty_notes: List[str] = []
    disclaimer: str = (
        "AI Saathi provides guidance only. This is not official government advice or approval."
    )


class SendMessageResponse(BaseModel):
    user_message: ChatMessageOut
    assistant_message: ChatMessageOut
    metadata: SaathiMetadata


class LifeSituationRequest(BaseModel):
    text: str = Field(min_length=1, max_length=8000)


class LifeSituationResponse(BaseModel):
    detected_language: str
    intent: Optional[str] = None
    life_situation: Dict[str, Any]
    relevant_categories: List[str] = []
    missing_information: List[str] = []
    suggested_next_actions: List[str] = []
    disclaimer: str
