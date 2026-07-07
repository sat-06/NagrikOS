"""Profile API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import CitizenProfile, User
from app.schemas.profile import ProfileOut, ProfileUpdate
from app.utils.age import calculate_age

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", response_model=ProfileOut)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == current_user.id).first()
    if not profile:
        profile = CitizenProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return ProfileOut.model_validate(profile)


@router.put("", response_model=ProfileOut)
def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == current_user.id).first()
    if not profile:
        profile = CitizenProfile(user_id=current_user.id)
        db.add(profile)
        db.flush()

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    age = calculate_age(profile.date_of_birth)
    if age and age >= 60:
        profile.is_senior_citizen = True

    db.commit()
    db.refresh(profile)
    return ProfileOut.model_validate(profile)
