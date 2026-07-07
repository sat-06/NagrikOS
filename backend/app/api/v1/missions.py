"""Civic missions API routes."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.mission import MissionCreate, MissionOut, MissionStepOut, MissionUpdate, StepNoteUpdate
from app.services.mission import MissionService
from app.utils.json_helpers import parse_list

router = APIRouter(prefix="/missions", tags=["Civic Missions"])


def _mission_out(mission) -> MissionOut:
    return MissionOut(
        id=mission.id,
        title=mission.title,
        description=mission.description,
        category=mission.category,
        status=mission.status,
        progress_percentage=mission.progress_percentage,
        source_type=mission.source_type,
        related_service_ids=parse_list(mission.related_service_ids),
        steps=[MissionStepOut.model_validate(s) for s in mission.steps],
        created_at=mission.created_at,
        updated_at=mission.updated_at,
    )


@router.post("", response_model=MissionOut, status_code=201)
def create_mission(
    data: MissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = MissionService(db)
    mission = svc.create(current_user.id, data)
    return _mission_out(mission)


@router.get("", response_model=List[MissionOut])
def list_missions(
    status: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = MissionService(db)
    missions = svc.list_missions(current_user.id, status=status)
    return [_mission_out(m) for m in missions]


@router.get("/{mission_id}", response_model=MissionOut)
def get_mission(
    mission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = MissionService(db)
    mission = svc.get_mission(mission_id, current_user.id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    return _mission_out(mission)


@router.patch("/{mission_id}", response_model=MissionOut)
def update_mission(
    mission_id: int,
    data: MissionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = MissionService(db)
    mission = svc.get_mission(mission_id, current_user.id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    mission = svc.update_mission(mission, data)
    return _mission_out(mission)


@router.post("/{mission_id}/steps/{step_id}/complete", response_model=MissionStepOut)
def complete_step(
    mission_id: int,
    step_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = MissionService(db)
    mission = svc.get_mission(mission_id, current_user.id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    step = svc.complete_step(mission, step_id)
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    return MissionStepOut.model_validate(step)


@router.post("/{mission_id}/steps/{step_id}/uncomplete", response_model=MissionStepOut)
def uncomplete_step(
    mission_id: int,
    step_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = MissionService(db)
    mission = svc.get_mission(mission_id, current_user.id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    step = svc.uncomplete_step(mission, step_id)
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    return MissionStepOut.model_validate(step)
