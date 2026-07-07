"""FastAPI dependencies."""

from typing import Generator, Optional

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.exceptions import forbidden, unauthorized
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise unauthorized()
    user = db.query(User).filter(User.id == int(payload["sub"]), User.is_active.is_(True)).first()
    if not user:
        raise unauthorized()
    return user


def get_optional_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)),
) -> Optional[User]:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    return db.query(User).filter(User.id == int(payload["sub"]), User.is_active.is_(True)).first()
