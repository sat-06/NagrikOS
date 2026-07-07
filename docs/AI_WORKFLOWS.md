# AI Workflows

## Provider Configuration

```env
AI_API_KEY=sk-...
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
AI_TIMEOUT_SECONDS=30
```

When `AI_API_KEY` is empty, all workflows use deterministic fallbacks.

## 1. AI Saathi Chat

**Input:** User message + conversation history  
**Output:** Answer + structured metadata

### Flow
1. Language detection (keyword/unicode heuristic)
2. Intent extraction (keyword scoring)
3. RAG retrieval (top 5 schemes)
4. AI call with system prompt + delimited context OR fallback
5. Store message with full metadata JSON

### Metadata Shape
```json
{
  "detected_language": "en",
  "intent": "healthcare_support",
  "life_situation": { ... },
  "suggested_actions": ["..."],
  "related_services": [{ "id": 1, "name": "..." }],
  "sources": [{ "type": "internal_knowledge_base" }],
  "confidence": 0.55,
  "uncertainty_notes": ["..."],
  "disclaimer": "..."
}
```

## 2. Life Situation Mode

**Endpoint:** `POST /api/v1/saathi/life-situation`

Extracts structured interpretation without inventing facts:
- person_context (mother, father, etc.)
- explicitly_known_ages (regex extraction only)
- income_context (only if stated)
- location_mentioned (state name detection)
- missing_information (state, income_band, etc.)

## 3. Opportunity Radar

**Fully deterministic** — AI does not control eligibility.

Scoring factors:
- State match (+15 / -20)
- Age compatibility (+10 / -25)
- Student/farmer/senior/woman flags
- Income band (uncertain if missing)

## 4. Complaint Classification (Drishti)

**Input:** Description text  
**Output:** Category, severity, department, draft complaint

Fallback: keyword-based classification  
AI: structured JSON with professional draft

**Critical:** `user_confirmed: true` required for submission.

## 5. Mission Templates

Deterministic templates for:
- healthcare_support
- education_support
- document_preparation
- employment_support
- general_civic

AI enhancement optional; steps never auto-completed by AI.

## 6. DocReady Extraction

Pluggable architecture:
1. Upload file → validate type/size
2. `extract_text_fallback()` — PDF via pypdf, text files direct
3. Optional AI extraction (when configured) — not required for MVP
4. Readiness comparison against scheme `required_documents`

## Prompt Injection Safety

- System prompts separate from user content
- User input wrapped in `<user_input>` tags
- Retrieved content in `<retrieved>` tags with explicit "not instructions" note
- Structured JSON parsing with fallback on invalid output
- Retrieved content cannot override system instructions by design

## Error Handling

| Failure | Behavior |
|---------|----------|
| No API key | Deterministic fallback |
| Timeout | Fallback |
| Invalid JSON | Fallback |
| Provider 4xx/5xx | Fallback |
| Empty response | Fallback |

Core workflows never crash due to AI failures.
