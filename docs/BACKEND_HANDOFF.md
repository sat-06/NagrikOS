# Backend Handoff — Frontend Integration Guide

This document is the primary reference for the frontend agent building NagrikOS UI.

## Quick Start

```bash
# Terminal 1 — from repo root
cp .env.example .env
cd backend
python -m venv .venv
.\.venv\Scripts\activate        # Windows
pip install -r requirements.txt
python -m app.db.seed
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

| Item | Value |
|------|-------|
| Base URL | `http://localhost:8000` |
| API Prefix | `/api/v1` |
| Swagger/OpenAPI | `http://localhost:8000/docs` |
| ReDoc | `http://localhost:8000/redoc` |
| Health Check | `GET http://localhost:8000/health` |

## Demo Credentials

| Email | Password |
|-------|----------|
| `demo@nagrikos.in` | `Demo@12345` |

The demo account has a populated profile, active mission, and sample complaints including two nearby pothole reports for duplicate detection demo.

## Authentication Flow

1. **Register** or **Login** to get `access_token`
2. Store token (localStorage recommended for hackathon)
3. Send on all protected requests:

```
Authorization: Bearer <access_token>
```

### Register Example

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "citizen@example.com",
  "password": "SecurePass1",
  "full_name": "Rahul Verma"
}
```

Response:
```json
{
  "user": { "id": 2, "email": "citizen@example.com", "is_active": true, "created_at": "..." },
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### Login Example

```http
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=demo@nagrikos.in&password=Demo@12345
```

**Note:** OAuth2 form uses `username` field for email.

## CORS Setup

Configure in `.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

Frontend dev servers on these ports are pre-configured.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | No | SQLite | PostgreSQL connection string |
| JWT_SECRET_KEY | Yes (prod) | dev default | JWT signing secret |
| JWT_ALGORITHM | No | HS256 | JWT algorithm |
| ACCESS_TOKEN_EXPIRE_MINUTES | No | 1440 | Token TTL |
| CORS_ORIGINS | No | localhost ports | Comma-separated origins |
| AI_API_KEY | No | empty | Enables AI provider |
| AI_BASE_URL | No | OpenAI URL | Compatible API base |
| AI_MODEL | No | gpt-4o-mini | Model name |
| UPLOAD_DIR | No | uploads | Document storage |
| MAX_UPLOAD_SIZE | No | 5242880 | 5MB max upload |

## Error Format

```json
{ "detail": "Error message string" }
```

Status codes: 400, 401, 403, 404, 201, 204.

---

## Endpoint Reference

### Health

```http
GET /health
```

```json
{ "status": "ok", "app": "NagrikOS", "version": "1.0.0", "ai_enabled": false, "database": "sqlite" }
```

### Profile

```http
GET /api/v1/profile
PUT /api/v1/profile
```

Update body (all optional):
```json
{
  "full_name": "Priya Sharma",
  "preferred_language": "en",
  "state": "Maharashtra",
  "district": "Pune",
  "date_of_birth": "1990-05-15",
  "occupation": "Teacher",
  "income_band": "3l_to_5l",
  "is_student": false,
  "is_farmer": false,
  "is_senior_citizen": false,
  "is_woman": true
}
```

`preferred_language`: `en` | `hi` | `mr`  
`income_band`: `below_1l` | `1l_to_3l` | `3l_to_5l` | `5l_to_10l` | `above_10l` | `unknown`

### Services / Schemes

```http
GET /api/v1/services
GET /api/v1/services/search?q=scholarship&category=education&state=Maharashtra
GET /api/v1/services/{slug}
```

List response:
```json
{
  "items": [{ "id": 1, "name": "...", "slug": "...", "category": "healthcare", ... }],
  "total": 18
}
```

Every service includes `disclaimer` and `is_demo_data: true`.

### Recommendations (Opportunity Radar)

```http
GET /api/v1/recommendations
POST /api/v1/recommendations/explain
```

Response shape:
```json
{
  "recommendations": [
    {
      "service": { "id": 1, "name": "...", ... },
      "match_score": 82.0,
      "matched_criteria": ["State/residency appears compatible", "Age requirement appears compatible"],
      "uncertain_criteria": ["Income band not confirmed"],
      "missing_information": ["income_band"],
      "possible_mismatches": [],
      "explanation": "Matches: ... | Uncertain: ...",
      "disclaimer": "This is an indicative match only..."
    }
  ],
  "profile_completeness": 71.4,
  "disclaimer": "Recommendations are based on profile data..."
}
```

**UI guidance:** Display match_score as percentage. Never show "officially eligible".

### AI Saathi Chat

#### Create session
```http
POST /api/v1/saathi/sessions
{ "title": "Healthcare help" }
```

#### Send message
```http
POST /api/v1/saathi/sessions/1/messages
{ "content": "My widowed mother is 62 and needs healthcare support." }
```

Response:
```json
{
  "user_message": { "id": 1, "role": "user", "content": "...", "metadata": null, "created_at": "..." },
  "assistant_message": { "id": 2, "role": "assistant", "content": "...", "metadata": { ... }, "created_at": "..." },
  "metadata": {
    "detected_language": "en",
    "intent": "healthcare_support",
    "life_situation": {
      "intent": "healthcare_support",
      "person_context": "mother",
      "explicitly_known_ages": [62],
      "income_context": "unknown",
      "location_mentioned": null,
      "missing_information": ["state", "income_band"]
    },
    "suggested_actions": ["Complete your citizen profile...", "..."],
    "related_services": [{ "id": 1, "name": "Ayushman Bharat...", "retrieval_score": 0.15 }],
    "sources": [{ "type": "internal_knowledge_base" }],
    "confidence": 0.55,
    "uncertainty_notes": ["AI provider not configured..."],
    "disclaimer": "AI Saathi provides guidance only..."
  }
}
```

#### Life Situation (standalone)
```http
POST /api/v1/saathi/life-situation
{ "text": "Mala scholarship sathi konti documents lagtil?" }
```

### Civic Missions

```http
POST /api/v1/missions
{
  "title": "Find education assistance",
  "description": "Optional",
  "category": "education",
  "template_key": "education_support",
  "related_service_ids": [2]
}
```

Template keys: `healthcare_support`, `education_support`, `document_preparation`, `employment_support`, `general_civic`

Response:
```json
{
  "id": 1,
  "title": "Find education assistance",
  "status": "active",
  "progress_percentage": 0,
  "source_type": "manual",
  "related_service_ids": [2],
  "steps": [
    { "id": 1, "order": 1, "title": "List matching scholarships", "status": "pending", "action_type": "research" }
  ],
  "created_at": "...",
  "updated_at": "..."
}
```

Complete step: `POST /api/v1/missions/{id}/steps/{step_id}/complete`  
Progress auto-recalculates from step states.

### Documents (DocReady)

#### Upload
```http
POST /api/v1/documents/upload
Content-Type: multipart/form-data

document_type=identity_proof
file=<binary>
```

Allowed types: `identity_proof`, `income_certificate`, `domicile_certificate`, `age_proof`, `education_documents`  
Allowed files: pdf, jpg, jpeg, png, webp, txt (max 5MB)

#### Readiness check
```http
POST /api/v1/documents/readiness
{ "service_id": 1 }
```

Response:
```json
{
  "service_id": 1,
  "service_name": "Ayushman Bharat – PM-JAY (Demo)",
  "available_documents": [
    { "document_type": "identity_proof", "status": "available", "notes": "..." }
  ],
  "missing_documents": ["income_certificate", "ration_card"],
  "uncertain_documents": [],
  "readiness_percentage": 33.3,
  "next_actions": ["Obtain or upload: income_certificate, ration_card"],
  "disclaimer": "DocReady provides document readiness guidance only..."
}
```

### Complaints (Drishti)

#### Recommended UX Flow

1. User describes issue → `POST /complaints/analyze`
2. Show AI draft + category → user edits
3. `POST /complaints/duplicates` → show similar issues
4. User chooses: submit new OR join existing
5. `POST /complaints` with `user_confirmed: true`

#### Analyze
```http
POST /api/v1/complaints/analyze
{
  "description": "Large pothole on FC Road causing accidents",
  "address": "FC Road, Pune",
  "latitude": 18.5204,
  "longitude": 73.8567
}
```

Response:
```json
{
  "predicted_category": "pothole_road",
  "severity_suggestion": "high",
  "suggested_department": "Municipal Roads Department",
  "generated_draft": "Subject: Civic issue report...",
  "confidence": 0.6,
  "uncertainty_notes": ["Rule-based classification..."],
  "disclaimer": "AI-generated draft for your review..."
}
```

#### Duplicate search
```http
POST /api/v1/complaints/duplicates
{
  "description": "Pothole on FC Road",
  "category": "pothole_road",
  "latitude": 18.5205,
  "longitude": 73.8568
}
```

Response:
```json
{
  "candidates": [
    {
      "complaint_id": 1,
      "title": "Large pothole on FC Road",
      "similarity_score": 72.5,
      "distance_km": 0.02,
      "supporter_count": 1,
      "explanation": "Text similarity: 65%; Distance: 0.02 km"
    }
  ]
}
```

#### Submit complaint
```http
POST /api/v1/complaints
{
  "title": "Pothole on FC Road",
  "description": "...",
  "category": "pothole_road",
  "severity": "high",
  "suggested_department": "Municipal Roads Department",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "address": "FC Road, Pune",
  "ai_draft": "...",
  "user_confirmed": true
}
```

To join existing: `"join_existing_id": 1` (instead of new complaint fields)

#### Resolution verification
```http
POST /api/v1/complaints/1/resolution
{ "action": "confirmed", "note": "Road was repaired" }
```

Actions: `confirmed` | `disputed`

#### Timeline
```http
GET /api/v1/complaints/1/timeline
```

Statuses: `reported` → `ai_classified` → `routed` → `acknowledged` → `in_progress` → `citizen_verification` → `resolved`

---

## Known Limitations

1. **No AI key required** — fallbacks always work; set `AI_API_KEY` for enhanced responses
2. **Demo scheme data** — all records have `is_demo_data: true`
3. **No real govt integration** — complaint routing is simulated
4. **Document verification** — readiness only, not official validation
5. **Login uses form-urlencoded** — not JSON (OAuth2 standard)
6. **SQLite default** — file `backend/nagrikos.db` created on first run

## Prototype Boundaries

- Never display "officially eligible" — use "may be relevant" / "appears compatible"
- Always show disclaimers on AI responses, recommendations, readiness checks
- Require explicit user confirmation before complaint submission
- Do not auto-submit AI-generated complaint text

## Suggested Frontend Pages

| Page | Key APIs |
|------|----------|
| Login/Register | auth |
| Dashboard | profile, recommendations, missions |
| AI Saathi Chat | saathi sessions/messages |
| Services Browser | services, search |
| Opportunity Radar | recommendations |
| Missions | missions CRUD + steps |
| DocReady | documents upload + readiness |
| Report Issue | complaints analyze → duplicates → submit |
| My Complaints | complaints list, timeline, resolution |

## Seed Command

```bash
cd backend && python -m app.db.seed
# Force reseed:
python -m app.db.seed --force
```

## Test Command

```bash
cd backend && pytest tests/ -v
```

22 tests covering auth, profile, recommendations, AI, missions, documents, complaints.
