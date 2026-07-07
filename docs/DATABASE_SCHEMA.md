# Database Schema

## Entity Relationship Summary

```
User 1──1 CitizenProfile
User 1──* ChatSession 1──* ChatMessage
User 1──* CivicMission 1──* MissionStep
User 1──* UserDocument
User 1──* Complaint 1──* ComplaintTimelineEvent
Complaint 1──* ComplaintSupporter
Complaint 1──* ResolutionVerification
ServiceScheme (standalone knowledge base)
```

## Tables

### users
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| email | VARCHAR(255) UNIQUE | |
| hashed_password | VARCHAR(255) | bcrypt |
| is_active | BOOLEAN | default true |
| created_at, updated_at | DATETIME | |

### citizen_profiles
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| user_id | FK → users.id | UNIQUE, CASCADE |
| full_name | VARCHAR(255) | |
| preferred_language | VARCHAR(10) | en, hi, mr |
| state, district | VARCHAR | indexed state |
| date_of_birth | DATE | |
| occupation | VARCHAR(100) | |
| income_band | VARCHAR(50) | below_1l, 1l_to_3l, etc. |
| gender | VARCHAR(20) | optional |
| is_student, is_farmer, is_senior_citizen, is_woman | BOOLEAN | |
| extra_attributes | TEXT | JSON string |

### service_schemes
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name, slug | VARCHAR | slug UNIQUE |
| short_description, simplified_description | TEXT | |
| category | VARCHAR(100) | indexed |
| target_groups, state_applicability | TEXT | JSON arrays |
| age_min, age_max | INTEGER | nullable |
| income_constraints, occupation_constraints | TEXT | |
| student_required, farmer_required, etc. | BOOLEAN | nullable |
| required_documents, benefits, application_steps | TEXT | JSON arrays |
| official_source_url, source_title | VARCHAR | |
| source_metadata | TEXT | JSON |
| last_reviewed_at | DATETIME | |
| is_active, is_demo_data | BOOLEAN | |

### chat_sessions / chat_messages
- Sessions belong to users
- Messages have role (user/assistant), content, optional metadata_json

### civic_missions / mission_steps
- Mission: title, status (active/completed/archived), progress_percentage
- Steps: order, title, status, action_type, related_document, completed_at

### user_documents
- document_type, stored_filename (UUID-based), file_path
- extracted_metadata (minimal JSON, no raw content)

### complaints
- Full issue details + geo coordinates
- status lifecycle field
- ai_draft, ai_confidence

### complaint_supporters
- UNIQUE(complaint_id, user_id) — prevents duplicate joins

### complaint_timeline_events
- event_type, status, note, evidence_metadata

### resolution_verifications
- action: confirmed | disputed
- user note

## Indexes

- users.email
- citizen_profiles.state
- service_schemes.category, slug, is_active
- complaints.category, status, created_at
- Foreign keys on all relationship columns

## Cascades

- Deleting a user cascades to profile, sessions, missions, documents, complaints
- Deleting a mission cascades to steps
- Deleting a complaint cascades to timeline, supporters, verifications
