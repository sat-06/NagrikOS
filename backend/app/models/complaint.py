"""Drishti complaint and timeline models."""

import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ComplaintCategory(str, enum.Enum):
    POTHOLE_ROAD = "pothole_road"
    GARBAGE = "garbage"
    STREETLIGHT = "streetlight"
    WATER_LEAKAGE = "water_leakage"
    DRAINAGE = "drainage"
    PUBLIC_SAFETY = "public_safety"
    OTHER = "other"


class ComplaintStatus(str, enum.Enum):
    DRAFT = "draft"
    REPORTED = "reported"
    AI_CLASSIFIED = "ai_classified"
    ROUTED = "routed"
    ACKNOWLEDGED = "acknowledged"
    IN_PROGRESS = "in_progress"
    CITIZEN_VERIFICATION = "citizen_verification"
    RESOLVED = "resolved"


class TimelineEventType(str, enum.Enum):
    REPORTED = "reported"
    AI_CLASSIFIED = "ai_classified"
    ROUTED = "routed"
    ACKNOWLEDGED = "acknowledged"
    IN_PROGRESS = "in_progress"
    CITIZEN_VERIFICATION = "citizen_verification"
    RESOLVED = "resolved"
    NOTE = "note"


class ResolutionAction(str, enum.Enum):
    CONFIRMED = "confirmed"
    DISPUTED = "disputed"


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), index=True)
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    suggested_department: Mapped[Optional[str]] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(30), default=ComplaintStatus.REPORTED.value, index=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float)
    longitude: Mapped[Optional[float]] = mapped_column(Float)
    address: Mapped[Optional[str]] = mapped_column(String(500))
    image_metadata: Mapped[Optional[str]] = mapped_column(Text)
    ai_draft: Mapped[Optional[str]] = mapped_column(Text)
    ai_confidence: Mapped[Optional[float]] = mapped_column(Float)
    is_confirmed: Mapped[bool] = mapped_column(default=True)
    parent_complaint_id: Mapped[Optional[int]] = mapped_column(ForeignKey("complaints.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    user: Mapped["User"] = relationship("User", back_populates="complaints")  # noqa: F821
    timeline_events: Mapped[list["ComplaintTimelineEvent"]] = relationship(
        "ComplaintTimelineEvent", back_populates="complaint", cascade="all, delete-orphan",
        order_by="ComplaintTimelineEvent.created_at"
    )
    supporters: Mapped[list["ComplaintSupporter"]] = relationship(
        "ComplaintSupporter", back_populates="complaint", cascade="all, delete-orphan"
    )
    resolution_verifications: Mapped[list["ResolutionVerification"]] = relationship(
        "ResolutionVerification", back_populates="complaint", cascade="all, delete-orphan"
    )


class ComplaintSupporter(Base):
    __tablename__ = "complaint_supporters"
    __table_args__ = (UniqueConstraint("complaint_id", "user_id", name="uq_complaint_supporter"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    complaint_id: Mapped[int] = mapped_column(ForeignKey("complaints.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    complaint: Mapped["Complaint"] = relationship("Complaint", back_populates="supporters")


class ComplaintTimelineEvent(Base):
    __tablename__ = "complaint_timeline_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    complaint_id: Mapped[int] = mapped_column(ForeignKey("complaints.id", ondelete="CASCADE"), index=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[Optional[str]] = mapped_column(String(30))
    note: Mapped[Optional[str]] = mapped_column(Text)
    evidence_metadata: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    complaint: Mapped["Complaint"] = relationship("Complaint", back_populates="timeline_events")


class ResolutionVerification(Base):
    __tablename__ = "resolution_verifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    complaint_id: Mapped[int] = mapped_column(ForeignKey("complaints.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    action: Mapped[str] = mapped_column(String(20), nullable=False)
    note: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    complaint: Mapped["Complaint"] = relationship("Complaint", back_populates="resolution_verifications")
