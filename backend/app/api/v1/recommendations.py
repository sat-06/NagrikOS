"""Recommendation API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import CitizenProfile, User
from app.schemas.recommendation import ExplainRecommendationRequest, RecommendationResponse
from app.services.recommendation import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Opportunity Radar"])


@router.get("", response_model=RecommendationResponse)
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == current_user.id).first()
    svc = RecommendationService(db)
    items, completeness = svc.recommend(profile)
    return RecommendationResponse(recommendations=items, profile_completeness=completeness)


@router.post("/explain", response_model=RecommendationResponse)
def explain_recommendation(
    data: ExplainRecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == current_user.id).first()
    svc = RecommendationService(db)
    item = svc.explain(profile, data.service_id)
    if not item:
        raise HTTPException(status_code=404, detail="Service not found")
    completeness = 100.0 if profile and profile.state else 50.0
    return RecommendationResponse(recommendations=[item], profile_completeness=completeness)
