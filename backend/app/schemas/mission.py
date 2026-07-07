"""Pydantic schemas for civic missions."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class MissionStepOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order: int
    title: str
    description: Optional[str] = None
    status: str
    action_type: Optional[str] = None
    related_document: Optional[str] = None
    user_note: Optional[str] = None
    completed_at: Optional[datetime] = None


class MissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    status: str
    progress_percentage: int
    source_type: str
    related_service_ids: List[int] = []
    steps: List[MissionStepOut] = []
    created_at: datetime
    updated_at: datetime


class MissionCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    source_type: str = "manual"
    related_service_ids: List[int] = []
    template_key: Optional[str] = None


class MissionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None


class StepNoteUpdate(BaseModel):
    user_note: Optional[str] = None
