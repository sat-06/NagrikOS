import base64, os

fixes = {
    "backend/app/ai/fallback.py": {
        "old": '"document_guidance": ["identity/certificates"],',
        "new": '"document_guidance": ["identity/certificates", "general"],',
    },
    "backend/app/ai/provider.py": {
        "old": '            return json.loads(content)\n        except json.JSONDecodeError:\n            logger.warning("AI returned invalid JSON")\n            return None',
        "new": '            parsed = json.loads(content)\n            if not isinstance(parsed, dict):\n                logger.warning("AI returned non-dict JSON: %s", type(parsed).__name__)\n                return None\n            return parsed\n        except json.JSONDecodeError:\n            logger.warning("AI returned invalid JSON, content preview: %.200s", content)\n            return None',
    },
    "backend/app/ai/rag.py": {
        "old": 'if score > 0 or normalize_text(query) in self._corpus_text(s):',
        "new": 'if score > 0.01 or normalize_text(query) in self._corpus_text(s):',
    },
}

for path, patches in fixes.items():
    with open(path, 'r') as f:
        content = f.read()
    old = patches["old"]
    new = patches["new"]
    if old in content:
        content = content.replace(old, new)
        with open(path, 'w') as f:
            f.write(content)
        print(f"PATCHED: {path}")
    else:
        print(f"SKIPPED: {path} (pattern not found)")

print("Phase 1 done")
