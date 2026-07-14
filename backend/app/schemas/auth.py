"""Pydantic schemas for authentication."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime

    @classmethod
    def model_validate(cls, user):
        profile = getattr(user, "profile", None)
        full_name_val = None
        if profile is not None:
            try:
                full_name_val = profile.full_name
            except Exception:
                full_name_val = None

        return cls(
            id=user.id,
            email=user.email,
            full_name=full_name_val,
            is_active=user.is_active,
            created_at=user.created_at,
        )


class AuthResponse(BaseModel):
    user: UserOut
    access_token: str
    token_type: str = "bearer"  