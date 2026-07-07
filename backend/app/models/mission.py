"""Civic mission models."""

import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class MissionStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class StepStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class MissionSourceType(str, enum.Enum):
    MANUAL = "manual"
    AI_SAATHI = "ai_saathi"
    RECOMMENDATION = "recommendation"


class CivicMission(Base):
    __tablename__ = "civic_missions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[Optional[str]] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(20), default=MissionStatus.ACTIVE.value, index=True)
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0)
    source_type: Mapped[str] = mapped_column(String(30), default=MissionSourceType.MANUAL.value)
    related_service_ids: Mapped[Optional[str]] = mapped_column(Text, default="[]")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    user: Mapped["User"] = relationship("User", back_populates="missions")  # noqa: F821
    steps: Mapped[list["MissionStep"]] = relationship(
        "MissionStep", back_populates="mission", cascade="all, delete-orphan", order_by="MissionStep.order"
    )


class MissionStep(Base):
    __tablename__ = "mission_steps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    mission_id: Mapped[int] = mapped_column(ForeignKey("civic_missions.id", ondelete="CASCADE"), index=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default=StepStatus.PENDING.value)
    action_type: Mapped[Optional[str]] = mapped_column(String(50))
    related_document: Mapped[Optional[str]] = mapped_column(String(100))
    user_note: Mapped[Optional[str]] = mapped_column(Text)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    mission: Mapped["CivicMission"] = relationship("CivicMission", back_populates="steps")
