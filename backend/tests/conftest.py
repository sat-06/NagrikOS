"""Pytest configuration."""

import os
import sys
from pathlib import Path

import pytest

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_nagrikos.db")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault("UPLOAD_DIR", "test_uploads")


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    from app.db.session import init_db
    from app.db.seed import seed

    init_db()
    seed(force=True)
    yield
    test_db = backend_dir / "test_nagrikos.db"
    if test_db.exists():
        try:
            test_db.unlink()
        except OSError:
            pass
