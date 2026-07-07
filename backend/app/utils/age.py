"""Age calculation utilities."""

from datetime import date
from typing import Optional


def calculate_age(dob: Optional[date]) -> Optional[int]:
    if not dob:
        return None
    today = date.today()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    return age
