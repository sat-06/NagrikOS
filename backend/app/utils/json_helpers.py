"""JSON serialization helpers."""

import json
from typing import Any, List, Optional


def to_json(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False, default=str)


def from_json(text: Optional[str], default: Any = None) -> Any:
    if not text:
        return default if default is not None else []
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return default if default is not None else []


def parse_list(text: Optional[str]) -> List[Any]:
    result = from_json(text, [])
    return result if isinstance(result, list) else []
