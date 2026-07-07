"""Pydantic schemas for recommendations."""

from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.service import ServiceSchemeOut


class RecommendationItem(BaseModel):
    service: ServiceSchemeOut
    match_score: float = Field(ge=0, le=100)
    matched_criteria: List[str] = []
    uncertain_criteria: List[str] = []
    missing_information: List[str] = []
    possible_mismatches: List[str] = []
    explanation: str
    disclaimer: str = (
        "This is an indicative match only. Official eligibility must be verified "
        "with the relevant government department."
    )


class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationItem]
    profile_completeness: float
    disclaimer: str = (
        "Recommendations are based on profile data and demo scheme records. "
        "They do not constitute official eligibility confirmation."
    )


class ExplainRecommendationRequest(BaseModel):
    service_id: int
