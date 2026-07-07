"""Pydantic schemas for citizen profile."""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    preferred_language: Optional[str] = Field(None, pattern="^(en|hi|mr)$")
    state: Optional[str] = None
    district: Optional[str] = None
    date_of_birth: Optional[date] = None
    occupation: Optional[str] = None
    income_band: Optional[str] = None
    gender: Optional[str] = None
    is_student: Optional[bool] = None
    is_farmer: Optional[bool] = None
    is_senior_citizen: Optional[bool] = None
    is_woman: Optional[bool] = None


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    full_name: Optional[str] = None
    preferred_language: str = "en"
    state: Optional[str] = None
    district: Optional[str] = None
    date_of_birth: Optional[date] = None
    occupation: Optional[str] = None
    income_band: Optional[str] = None
    gender: Optional[str] = None
    is_student: bool = False
    is_farmer: bool = False
    is_senior_citizen: bool = False
    is_woman: bool = False
    created_at: datetime
    updated_at: datetime
