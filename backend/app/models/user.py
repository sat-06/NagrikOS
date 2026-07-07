"""User and citizen profile models."""

import enum
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class IncomeBand(str, enum.Enum):
    BELOW_1L = "below_1l"
    L1_TO_3L = "1l_to_3l"
    L3_TO_5L = "3l_to_5l"
    L5_TO_10L = "5l_to_10l"
    ABOVE_10L = "above_10l"
    UNKNOWN = "unknown"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    profile: Mapped[Optional["CitizenProfile"]] = relationship(
        "CitizenProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    chat_sessions: Mapped[list["ChatSession"]] = relationship(  # noqa: F821
        "ChatSession", back_populates="user", cascade="all, delete-orphan"
    )
    missions: Mapped[list["CivicMission"]] = relationship(  # noqa: F821
        "CivicMission", back_populates="user", cascade="all, delete-orphan"
    )
    documents: Mapped[list["UserDocument"]] = relationship(  # noqa: F821
        "UserDocument", back_populates="user", cascade="all, delete-orphan"
    )
    complaints: Mapped[list["Complaint"]] = relationship(  # noqa: F821
        "Complaint", back_populates="user", cascade="all, delete-orphan"
    )


class CitizenProfile(Base):
    __tablename__ = "citizen_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    preferred_language: Mapped[str] = mapped_column(String(10), default="en")
    state: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    district: Mapped[Optional[str]] = mapped_column(String(100))
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date)
    occupation: Mapped[Optional[str]] = mapped_column(String(100))
    income_band: Mapped[Optional[str]] = mapped_column(String(50))
    gender: Mapped[Optional[str]] = mapped_column(String(20))
    is_student: Mapped[bool] = mapped_column(Boolean, default=False)
    is_farmer: Mapped[bool] = mapped_column(Boolean, default=False)
    is_senior_citizen: Mapped[bool] = mapped_column(Boolean, default=False)
    is_woman: Mapped[bool] = mapped_column(Boolean, default=False)
    extra_attributes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    user: Mapped["User"] = relationship("User", back_populates="profile")
