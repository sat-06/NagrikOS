"""Pydantic schemas for complaints."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ComplaintAnalyzeRequest(BaseModel):
    description: str = Field(min_length=10, max_length=5000)
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ComplaintAnalysisResponse(BaseModel):
    predicted_category: str
    severity_suggestion: str
    suggested_department: str
    generated_draft: str
    confidence: float
    uncertainty_notes: List[str] = []
    disclaimer: str = (
        "AI-generated draft for your review. You must confirm before submission."
    )


class DuplicateSearchRequest(BaseModel):
    description: str
    category: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class DuplicateCandidate(BaseModel):
    complaint_id: int
    title: str
    description: str
    category: str
    similarity_score: float
    distance_km: Optional[float] = None
    supporter_count: int
    created_at: datetime
    explanation: str


class DuplicateSearchResponse(BaseModel):
    candidates: List[DuplicateCandidate]
    disclaimer: str = "Similarity scores are indicative. Review before joining an existing issue."


class ComplaintCreateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=10)
    category: str
    severity: str = "medium"
    suggested_department: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    ai_draft: Optional[str] = None
    user_confirmed: bool = Field(
        description="Must be true — user explicitly confirms submission"
    )
    join_existing_id: Optional[int] = None


class TimelineEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_type: str
    status: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime


class ComplaintOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    category: str
    severity: str
    suggested_department: Optional[str] = None
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    supporter_count: int = 0
    is_confirmed: bool = True
    created_at: datetime
    updated_at: datetime
    timeline: List[TimelineEventOut] = []


class ResolutionVerificationRequest(BaseModel):
    action: str = Field(pattern="^(confirmed|disputed)$")
    note: Optional[str] = None


class JoinIssueResponse(BaseModel):
    complaint_id: int
    supporter_count: int
    message: str
