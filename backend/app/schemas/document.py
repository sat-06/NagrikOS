"""Pydantic schemas for documents."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    document_type: str
    original_filename: str
    mime_type: Optional[str] = None
    file_size: int
    extracted_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime


class ReadinessRequest(BaseModel):
    service_id: int


class DocumentReadinessItem(BaseModel):
    document_type: str
    status: str
    notes: Optional[str] = None


class ReadinessResponse(BaseModel):
    service_id: int
    service_name: str
    available_documents: List[DocumentReadinessItem] = []
    missing_documents: List[str] = []
    uncertain_documents: List[str] = []
    readiness_percentage: float
    next_actions: List[str] = []
    disclaimer: str = (
        "DocReady provides document readiness guidance only. "
        "This is not official document verification."
    )
