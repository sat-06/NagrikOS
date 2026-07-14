"""Public stats API for landing page and dashboard."""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_optional_user
from app.db.session import get_db
from app.models.complaint import Complaint
from app.models.mission import CivicMission
from app.models.service import ServiceScheme
from app.models.user import User

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/public")
def public_stats(db: Session = Depends(get_db)):
    """Public stats for the landing page — no auth required."""
    scheme_count = db.query(func.count(ServiceScheme.id)).filter(ServiceScheme.is_active.is_(True)).scalar() or 0

    categories = db.query(ServiceScheme.category, func.count(ServiceScheme.id)).filter(
        ServiceScheme.is_active.is_(True)
    ).group_by(ServiceScheme.category).all()

    return {
        "total_schemes": scheme_count,
        "total_categories": len(categories),
        "categories": [{"name": c, "count": n} for c, n in categories],
    }


@router.get("/dashboard")
def dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Personal stats for the dashboard."""
    active_missions = db.query(func.count(CivicMission.id)).filter(
        CivicMission.user_id == current_user.id,
        CivicMission.status == "active",
    ).scalar() or 0

    completed_missions = db.query(func.count(CivicMission.id)).filter(
        CivicMission.user_id == current_user.id,
        CivicMission.status == "completed",
    ).scalar() or 0

    active_complaints = db.query(func.count(Complaint.id)).filter(
        Complaint.user_id == current_user.id,
        Complaint.status != "resolved",
    ).scalar() or 0

    resolved_complaints = db.query(func.count(Complaint.id)).filter(
        Complaint.user_id == current_user.id,
        Complaint.status == "resolved",
    ).scalar() or 0

    # Average mission progress
    missions = db.query(CivicMission).filter(
        CivicMission.user_id == current_user.id,
        CivicMission.status == "active",
    ).all()

    avg_progress = round(
        sum(m.progress_percentage for m in missions) / max(len(missions), 1), 1
    )

    # Schemes matched (via recommendations needs profile)
    from app.models.user import CitizenProfile
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == current_user.id).first()
    profile_completeness = 0.0
    if profile:
        fields = [profile.full_name, profile.state, profile.district, profile.date_of_birth,
                  profile.income_band, profile.occupation]
        profile_completeness = round(sum(1 for f in fields if f) / len(fields) * 100, 1)

    return {
        "active_missions": active_missions,
        "completed_missions": completed_missions,
        "active_complaints": active_complaints,
        "resolved_complaints": resolved_complaints,
        "avg_mission_progress": avg_progress,
        "profile_completeness": profile_completeness,
        "total_missions": active_missions + completed_missions,
        "total_complaints": active_complaints + resolved_complaints,
    }
