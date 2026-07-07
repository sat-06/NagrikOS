"""Civic mission service."""

from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.ai.mission_templates import build_steps_from_template, get_mission_template
from app.models.mission import CivicMission, MissionSourceType, MissionStatus, MissionStep, StepStatus
from app.schemas.mission import MissionCreate, MissionUpdate
from app.utils.json_helpers import parse_list, to_json


def compute_progress(steps: List[MissionStep]) -> int:
    if not steps:
        return 0
    completed = sum(1 for s in steps if s.status == StepStatus.COMPLETED.value)
    return int((completed / len(steps)) * 100)


class MissionService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, data: MissionCreate) -> CivicMission:
        template = get_mission_template(data.template_key, data.category)
        title = data.title or template.get("title", "Civic Mission")
        category = data.category or template.get("category")

        mission = CivicMission(
            user_id=user_id,
            title=title,
            description=data.description,
            category=category,
            source_type=data.source_type or MissionSourceType.MANUAL.value,
            related_service_ids=to_json(data.related_service_ids),
        )
        self.db.add(mission)
        self.db.flush()

        steps_data = build_steps_from_template(template)
        for sd in steps_data:
            step = MissionStep(
                mission_id=mission.id,
                order=sd["order"],
                title=sd["title"],
                description=sd.get("description"),
                action_type=sd.get("action_type"),
                related_document=sd.get("related_document"),
                status=StepStatus.PENDING.value,
            )
            self.db.add(step)

        self.db.commit()
        self.db.refresh(mission)
        return mission

    def list_missions(self, user_id: int, status: Optional[str] = None) -> List[CivicMission]:
        q = self.db.query(CivicMission).filter(CivicMission.user_id == user_id)
        if status:
            q = q.filter(CivicMission.status == status)
        return q.order_by(CivicMission.updated_at.desc()).all()

    def get_mission(self, mission_id: int, user_id: int) -> Optional[CivicMission]:
        return (
            self.db.query(CivicMission)
            .filter(CivicMission.id == mission_id, CivicMission.user_id == user_id)
            .first()
        )

    def update_mission(self, mission: CivicMission, data: MissionUpdate) -> CivicMission:
        if data.title is not None:
            mission.title = data.title
        if data.description is not None:
            mission.description = data.description
        if data.category is not None:
            mission.category = data.category
        if data.status is not None:
            mission.status = data.status
        mission.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(mission)
        return mission

    def complete_step(self, mission: CivicMission, step_id: int) -> Optional[MissionStep]:
        step = next((s for s in mission.steps if s.id == step_id), None)
        if not step:
            return None
        step.status = StepStatus.COMPLETED.value
        step.completed_at = datetime.utcnow()
        mission.progress_percentage = compute_progress(mission.steps)
        if mission.progress_percentage == 100:
            mission.status = MissionStatus.COMPLETED.value
        mission.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(step)
        return step

    def uncomplete_step(self, mission: CivicMission, step_id: int) -> Optional[MissionStep]:
        step = next((s for s in mission.steps if s.id == step_id), None)
        if not step:
            return None
        step.status = StepStatus.PENDING.value
        step.completed_at = None
        mission.progress_percentage = compute_progress(mission.steps)
        if mission.status == MissionStatus.COMPLETED.value:
            mission.status = MissionStatus.ACTIVE.value
        mission.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(step)
        return step

    def mission_to_dict(self, mission: CivicMission) -> dict:
        return {
            "id": mission.id,
            "title": mission.title,
            "description": mission.description,
            "category": mission.category,
            "status": mission.status,
            "progress_percentage": mission.progress_percentage,
            "source_type": mission.source_type,
            "related_service_ids": parse_list(mission.related_service_ids),
            "steps": mission.steps,
            "created_at": mission.created_at,
            "updated_at": mission.updated_at,
        }
