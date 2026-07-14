"""OpenAI-compatible AI provider abstraction."""

import json
import logging
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class AIProvider:
    def __init__(self) -> None:
        self.settings = get_settings()

    @property
    def enabled(self) -> bool:
        return self.settings.ai_enabled

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        response_format: Optional[Dict[str, str]] = None,
        temperature: float = 0.3,
    ) -> Optional[str]:
        if not self.enabled:
            return None
        url = f"{self.settings.AI_BASE_URL.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.settings.AI_API_KEY}",
            "Content-Type": "application/json",
        }
        payload: Dict[str, Any] = {
            "model": self.settings.AI_MODEL,
            "messages": messages,
            "temperature": temperature,
        }
        if response_format:
            payload["response_format"] = response_format
        try:
            async with httpx.AsyncClient(timeout=self.settings.AI_TIMEOUT_SECONDS) as client:
                resp = await client.post(url, headers=headers, json=payload)
                resp.raise_for_status()
                data = resp.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.warning("AI provider error: %s", e)
            return None

    async def structured_json(
        self,
        system: str,
        user: str,
        schema_hint: str = "",
    ) -> Optional[Dict[str, Any]]:
        messages = [
            {"role": "system", "content": system},
            {
                "role": "user",
                "content": f"<user_input>\n{user}\n</user_input>\n\n{schema_hint}",
            },
        ]
        content = await self.chat_completion(
            messages,
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        if not content:
            return None
        try:
            parsed = json.loads(content)
            if not isinstance(parsed, dict):
                logger.warning("AI returned non-dict JSON: %s", type(parsed).__name__)
                return None
            return parsed
        except json.JSONDecodeError:
            logger.warning("AI returned invalid JSON, content preview: %.200s", content)
            return None


def get_ai_provider() -> AIProvider:
    return AIProvider()
