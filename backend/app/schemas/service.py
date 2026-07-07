"""Pydantic schemas for services/schemes."""

from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ServiceSchemeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    short_description: str
    simplified_description: str
    category: str
    target_groups: List[str] = []
    state_applicability: List[str] = []
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    income_constraints: Optional[str] = None
    occupation_constraints: Optional[str] = None
    student_required: Optional[bool] = None
    farmer_required: Optional[bool] = None
    senior_citizen_required: Optional[bool] = None
    woman_required: Optional[bool] = None
    required_documents: List[str] = []
    benefits: List[str] = []
    application_steps: List[str] = []
    official_source_url: Optional[str] = None
    source_title: Optional[str] = None
    source_metadata: Optional[dict[str, Any]] = None
    last_reviewed_at: Optional[datetime] = None
    is_active: bool = True
    is_demo_data: bool = True
    disclaimer: str = Field(
        default="Prototype demo record. Verify eligibility with official sources before applying."
    )


class ServiceListResponse(BaseModel):
    items: List[ServiceSchemeOut]
    total: int
