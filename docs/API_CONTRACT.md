# API Contract

Base URL: `http://localhost:8000`  
API Prefix: `/api/v1`  
OpenAPI: `http://localhost:8000/docs`

## Error Format

All errors return:
```json
{ "detail": "Human-readable error message" }
```

HTTP status codes: 400 (validation), 401 (unauthorized), 403 (forbidden), 404 (not found), 201 (created).

## Authentication

### Register
`POST /api/v1/auth/register`
```json
{ "email": "user@example.com", "password": "Min8Chars", "full_name": "Optional" }
```
Response: `{ "user": {...}, "access_token": "...", "token_type": "bearer" }`

### Login
`POST /api/v1/auth/login` (form-urlencoded)
```
username=user@example.com&password=Min8Chars
```

### Current User
`GET /api/v1/auth/me` — requires Bearer token

## Profile

`GET /api/v1/profile` — get profile  
`PUT /api/v1/profile` — partial update

## Services

`GET /api/v1/services?category=&state=&skip=0&limit=50`  
`GET /api/v1/services/search?q=scholarship&category=&state=`  
`GET /api/v1/services/{slug}`

## Recommendations

`GET /api/v1/recommendations`  
`POST /api/v1/recommendations/explain` — `{ "service_id": 1 }`

## AI Saathi

`POST /api/v1/saathi/sessions` — `{ "title": "optional" }`  
`GET /api/v1/saathi/sessions`  
`GET /api/v1/saathi/sessions/{id}/messages`  
`POST /api/v1/saathi/sessions/{id}/messages` — `{ "content": "..." }`  
`POST /api/v1/saathi/life-situation` — `{ "text": "..." }`

## Missions

`POST /api/v1/missions`  
`GET /api/v1/missions?status=`  
`GET /api/v1/missions/{id}`  
`PATCH /api/v1/missions/{id}`  
`POST /api/v1/missions/{id}/steps/{step_id}/complete`  
`POST /api/v1/missions/{id}/steps/{step_id}/uncomplete`

## Documents

`POST /api/v1/documents/upload` — multipart: `document_type`, `file`  
`GET /api/v1/documents`  
`DELETE /api/v1/documents/{id}`  
`POST /api/v1/documents/readiness` — `{ "service_id": 1 }`

## Complaints

`POST /api/v1/complaints/analyze`  
`POST /api/v1/complaints/duplicates`  
`POST /api/v1/complaints` — requires `user_confirmed: true`  
`GET /api/v1/complaints`  
`GET /api/v1/complaints/{id}`  
`POST /api/v1/complaints/{id}/join`  
`GET /api/v1/complaints/{id}/timeline`  
`POST /api/v1/complaints/{id}/resolution` — `{ "action": "confirmed|disputed", "note": "" }`

## Health

`GET /health` — no auth required
