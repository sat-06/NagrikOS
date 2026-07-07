#!/usr/bin/env python3
"""Run database seed from project root."""

import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.db.seed import seed  # noqa: E402

if __name__ == "__main__":
    force = "--force" in sys.argv
    seed(force=force)
