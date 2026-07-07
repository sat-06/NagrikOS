# Security & Privacy

## Authentication

- Passwords hashed with **bcrypt** via passlib
- JWT tokens (HS256) with configurable expiry
- Protected routes require `Authorization: Bearer <token>`
- Ownership checks on missions, documents, complaints, chat sessions

## Authorization Model

| Resource | Rule |
|----------|------|
| Profile | Own user only |
| Chat sessions | Own user only |
| Missions | Own user only |
| Documents | Own user only |
| Complaints | Owner or supporter |
| Services | Public read |

## File Upload Security

- Allowed extensions: `.pdf`, `.jpg`, `.jpeg`, `.png`, `.webp`, `.txt`
- Max size: configurable (`MAX_UPLOAD_SIZE`, default 5MB)
- Filenames sanitized; stored as UUID + extension
- Path traversal prevention via `safe_join()`
- Uploaded files in `UPLOAD_DIR` (gitignored)

## Data Privacy

- **No raw document content logged**
- Extracted metadata minimal (text length, has_text flag)
- Users can delete uploaded documents
- No demo auth bypass — real JWT required
- Sensitive profile fields minimized (gender optional)

## AI Safety

- Prompt injection boundaries (tag delimiting)
- No official eligibility claims in prompts or outputs
- User must confirm complaints before submission
- AI never auto-completes civic mission steps

## CORS

Configured via `CORS_ORIGINS` environment variable (comma-separated).

## Secrets Management

- All secrets via environment variables
- `.env` gitignored
- `.env.example` contains placeholders only

## Error Responses

Safe error messages — no stack traces in production responses.

## Recommendations for Production

1. Use HTTPS everywhere
2. Rotate `JWT_SECRET_KEY` regularly
3. Rate limit auth and upload endpoints
4. Use PostgreSQL with encrypted connections
5. Scan uploads with antivirus
6. Implement refresh tokens for longer sessions
7. Add audit logging for complaint submissions

## Prototype Boundaries

- No real government API integration
- No official document verification
- Scheme data is demo-labeled (`is_demo_data: true`)
- Simulated complaint routing/timeline progression
