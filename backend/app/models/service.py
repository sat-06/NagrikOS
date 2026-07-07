"""Government service/scheme knowledge base models."""

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ServiceScheme(Base):
    __tablename__ = "service_schemes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    short_description: Mapped[str] = mapped_column(Text, nullable=False)
    simplified_description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    target_groups: Mapped[str] = mapped_column(Text, default="[]")
    state_applicability: Mapped[str] = mapped_column(Text, default="[]")
    age_min: Mapped[Optional[int]] = mapped_column(Integer)
    age_max: Mapped[Optional[int]] = mapped_column(Integer)
    income_constraints: Mapped[Optional[str]] = mapped_column(Text)
    occupation_constraints: Mapped[Optional[str]] = mapped_column(Text)
    student_required: Mapped[Optional[bool]] = mapped_column(Boolean)
    farmer_required: Mapped[Optional[bool]] = mapped_column(Boolean)
    senior_citizen_required: Mapped[Optional[bool]] = mapped_column(Boolean)
    woman_required: Mapped[Optional[bool]] = mapped_column(Boolean)
    required_documents: Mapped[str] = mapped_column(Text, default="[]")
    benefits: Mapped[str] = mapped_column(Text, default="[]")
    application_steps: Mapped[str] = mapped_column(Text, default="[]")
    official_source_url: Mapped[Optional[str]] = mapped_column(String(500))
    source_title: Mapped[Optional[str]] = mapped_column(String(255))
    source_metadata: Mapped[Optional[str]] = mapped_column(Text)
    last_reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    is_demo_data: Mapped[bool] = mapped_column(Boolean, default=True)
