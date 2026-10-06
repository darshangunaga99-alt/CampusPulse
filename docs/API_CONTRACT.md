# CampusPulse API Contract

**Version:** 1.0.0  
**Project:** CampusPulse — Intelligent Campus Incident & Service Operations Platform  
**API Version:** v1  
**Base Path:** `/api/v1`

---

## 1. Purpose

This document is the single source of truth for communication between the CampusPulse frontend and backend.

Both frontend and backend developers must follow this contract.

### Rules

1. Do not rename API fields without agreement.
2. Do not change response structures without updating this document.
3. Do not change enum values without updating this document.
4. Use `snake_case` for JSON fields.
5. Use ISO 8601 UTC timestamps.
6. IDs are strings.
7. Frontend must not assume undocumented fields.
8. Backend must return the documented response structure.
9. Authentication is handled using Bearer JWT tokens.
10. Business logic remains on the backend.

---

# 2. Environment

## Development

```text
http://localhost:8000/api/v1
```

## Production

```text
https://<BACKEND-DOMAIN>/api/v1
```

Frontend environment variable:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

FastAPI Swagger documentation:

```text
http://localhost:8000/docs
```

---

# 3. Standard Response Format

## Success

All successful API responses should follow:

```json
{
  "success": true,
  "data": {}
}
```

## Error

All errors should follow:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {}
  }
}
```

---

# 4. HTTP Status Codes

<<<<<<< HEAD
| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 204 | Successful request with no response body |
| 400 | Bad request |
| 401 | Authentication required/invalid token |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict |
| 422 | Validation error |
| 429 | Too many requests |
| 500 | Internal server error |
| 503 | External service/AI temporarily unavailable |
=======
| Status | Meaning                                     |
| ------ | ------------------------------------------- |
| 200    | Successful request                          |
| 201    | Resource created                            |
| 204    | Successful request with no response body    |
| 400    | Bad request                                 |
| 401    | Authentication required/invalid token       |
| 403    | Insufficient permissions                    |
| 404    | Resource not found                          |
| 409    | Conflict                                    |
| 422    | Validation error                            |
| 429    | Too many requests                           |
| 500    | Internal server error                       |
| 503    | External service/AI temporarily unavailable |
>>>>>>> 842545cf49e48dba61ba3d909f5314c67a0bdf49

---

# 5. Authentication

## Roles

```text
student
staff
department_head
admin
auditor
```

## Authorization Header

Protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# 6. Enums

## Request Status

```text
pending
assigned
in_progress
completed
rejected
cancelled
escalated
```

## Priority

```text
low
medium
high
critical
```

## Category

```text
academic
maintenance
lab_equipment
it_support
library
administration
hostel
transport
other
```

## Incident Status

```text
detected
investigating
confirmed
in_progress
resolved
closed
```

## Assignment Type

```text
automatic
manual
```

---

# 7. Common Data Types

## User

```json
{
  "id": "usr_123",
  "name": "Rahul Kumar",
  "email": "rahul@example.com",
  "role": "student"
}
```

## Location

```json
{
  "building": "CSE Block",
  "floor": 2,
  "room": "Lab 2",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

---

# 8. Authentication APIs

## 8.1 Register

### Endpoint

```http
POST /auth/register
```

### Request

```json
{
  "name": "Rahul Kumar",
  "email": "rahul@example.com",
  "password": "SecurePassword123",
  "role": "student"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123",
      "name": "Rahul Kumar",
      "email": "rahul@example.com",
      "role": "student"
    },
    "access_token": "jwt_token",
    "token_type": "bearer"
  }
}
```

---

# 8.2 Login

### Endpoint

```http
POST /auth/login
```

### Request

```json
{
  "email": "rahul@example.com",
  "password": "SecurePassword123"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "access_token": "jwt_token",
    "token_type": "bearer",
    "user": {
      "id": "usr_123",
      "name": "Rahul Kumar",
      "email": "rahul@example.com",
      "role": "student"
    }
  }
}
```

---

# 8.3 Current User

### Endpoint

```http
GET /auth/me
```

### Authentication

Required.

### Response

```json
{
  "success": true,
  "data": {
    "id": "usr_123",
    "name": "Rahul Kumar",
    "email": "rahul@example.com",
    "role": "student"
  }
}
```

---

# 9. Service Catalog

## 9.1 Get Services

### Endpoint

```http
GET /services
```

### Query Parameters

```text
category
active
```

Example:

```http
GET /services?category=maintenance&active=true
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "srv_001",
      "name": "Electrical Maintenance",
      "description": "Report electrical problems",
      "category": "maintenance",
      "department": "Facilities",
      "active": true
    }
  ]
}
```

---

# 10. AI Request Analysis

This endpoint analyzes a student's natural-language request before submission.

## 10.1 Analyze Request

### Endpoint

```http
POST /requests/analyze
```

### Request

```json
{
  "description": "Projector in CSE Lab 2 is not working and we have a presentation tomorrow.",
  "location": {
    "building": "CSE Block",
    "floor": 2,
    "room": "Lab 2"
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "category": "lab_equipment",
    "subcategory": "projector",
    "priority": "high",
    "department": "IT",
    "location": {
      "building": "CSE Block",
      "floor": 2,
      "room": "Lab 2"
    },
    "summary": "Projector failure in CSE Lab 2 before a presentation.",
    "confidence": 0.94,
    "reason": [
      "Equipment failure detected",
      "Presentation deadline increases urgency"
    ]
  }
}
```

---

# 11. Request Management

## 11.1 Create Request

### Endpoint

```http
POST /requests
```

### Request

```json
{
  "title": "Projector not working",
  "description": "Projector in CSE Lab 2 is not working.",
  "category": "lab_equipment",
  "priority": "high",
  "location": {
    "building": "CSE Block",
    "floor": 2,
    "room": "Lab 2"
  },
  "service_id": "srv_001"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "req_123",
    "ticket_number": "REQ-2026-000123",
    "status": "pending",
    "priority": "high",
    "category": "lab_equipment",
    "department": "IT",
    "created_at": "2026-10-06T10:30:00Z",
    "sla_deadline": "2026-10-06T18:30:00Z"
  }
}
```

---

# 12. Duplicate Detection

This is one of the main CampusPulse features.

## 12.1 Check Duplicate Requests

### Endpoint

```http
POST /requests/check-duplicates
```

### Request

```json
{
  "description": "WiFi is not working in Block B.",
  "category": "it_support",
  "location": {
    "building": "Block B",
    "floor": 2,
    "room": "B204"
  }
}
```

### Response — Duplicate Found

```json
{
  "success": true,
  "data": {
    "duplicate_found": true,
    "confidence": 0.93,
    "matching_requests": [
      {
        "id": "req_101",
        "ticket_number": "REQ-2026-000101",
        "title": "Internet not working",
        "status": "in_progress",
        "created_at": "2026-10-06T10:10:00Z"
      }
    ],
    "incident": {
      "id": "inc_001",
      "incident_number": "INC-2026-0001",
      "title": "WiFi outage - Block B",
      "affected_students": 18
    }
  }
}
```

### Response — No Duplicate

```json
{
  "success": true,
  "data": {
    "duplicate_found": false,
    "confidence": 0.12,
    "matching_requests": [],
    "incident": null
  }
}
```

---

# 13. Student Requests

## 13.1 Get My Requests

### Endpoint

```http
GET /requests/my
```

### Query Parameters

```text
status
category
priority
search
sort
page
limit
```

Example:

```http
GET /requests/my?status=in_progress&page=1&limit=20
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "req_123",
        "ticket_number": "REQ-2026-000123",
        "title": "Projector not working",
        "status": "in_progress",
        "priority": "high",
        "category": "lab_equipment",
        "created_at": "2026-10-06T10:30:00Z",
        "updated_at": "2026-10-06T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

---

# 14. Request Details

## 14.1 Get Request

### Endpoint

```http
GET /requests/{request_id}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "req_123",
    "ticket_number": "REQ-2026-000123",
    "title": "Projector not working",
    "description": "Projector in CSE Lab 2 is not working.",
    "status": "in_progress",
    "priority": "high",
    "category": "lab_equipment",
    "department": "IT",
    "assigned_to": {
      "id": "usr_456",
      "name": "Anil Kumar"
    },
    "location": {
      "building": "CSE Block",
      "floor": 2,
      "room": "Lab 2"
    },
    "estimated_completion": "2026-10-06T16:00:00Z",
    "sla_deadline": "2026-10-06T18:30:00Z",
    "created_at": "2026-10-06T10:30:00Z",
    "updated_at": "2026-10-06T12:00:00Z"
  }
}
```

---

# 15. Request Timeline

## 15.1 Get Timeline

### Endpoint

```http
GET /requests/{request_id}/timeline
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "hist_001",
      "action": "Request created",
      "status": "pending",
      "actor": {
        "id": "usr_123",
        "name": "Rahul Kumar"
      },
      "timestamp": "2026-10-06T10:30:00Z",
      "comment": null
    },
    {
      "id": "hist_002",
      "action": "Request assigned",
      "status": "assigned",
      "actor": {
        "id": "usr_456",
        "name": "Anil Kumar"
      },
      "timestamp": "2026-10-06T11:00:00Z",
      "comment": "Assigned to IT support."
    }
  ]
}
```

---

# 16. Update Request Status

## Endpoint

```http
PATCH /requests/{request_id}/status
```

### Request

```json
{
  "status": "in_progress",
  "comment": "Technician has started working on the issue."
}
```

### Response

```json
{
  "success": true,
  "data": {
    "request_id": "req_123",
    "status": "in_progress",
    "updated_at": "2026-10-06T12:00:00Z"
  }
}
```

---

# 17. Assign Request

## Endpoint

```http
POST /requests/{request_id}/assign
```

### Request

```json
{
  "staff_id": "usr_456"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "request_id": "req_123",
    "assigned_to": {
      "id": "usr_456",
      "name": "Anil Kumar"
    },
    "assignment_type": "automatic"
  }
}
```

---

# 18. Staff Request Queue

## Endpoint

```http
GET /staff/requests
```

### Query Parameters

```text
status
priority
category
department
assigned_to
search
sort
page
limit
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "total_pages": 0
    }
  }
}
```

---

# 19. Incidents

## 19.1 Get Incidents

### Endpoint

```http
GET /incidents
```

### Query Parameters

```text
status
priority
department
building
search
page
limit
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "inc_001",
        "incident_number": "INC-2026-0001",
        "title": "WiFi outage - Block B",
        "status": "in_progress",
        "priority": "high",
        "affected_students": 18,
        "department": "IT",
        "created_at": "2026-10-06T10:15:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

---

# 20. Incident Details

## Endpoint

```http
GET /incidents/{incident_id}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "inc_001",
    "incident_number": "INC-2026-0001",
    "title": "WiFi outage - Block B",
    "status": "in_progress",
    "priority": "high",
    "department": "IT",
    "affected_students": 18,
<<<<<<< HEAD
    "linked_requests": [
      "req_101",
      "req_102",
      "req_103"
    ],
=======
    "linked_requests": ["req_101", "req_102", "req_103"],
>>>>>>> 842545cf49e48dba61ba3d909f5314c67a0bdf49
    "location": {
      "building": "Block B",
      "floor": 2,
      "room": null
    },
    "created_at": "2026-10-06T10:15:00Z"
  }
}
```

---

# 21. Follow Incident

## Endpoint

```http
POST /incidents/{incident_id}/follow
```

### Response

```json
{
  "success": true,
  "data": {
    "incident_id": "inc_001",
    "following": true
  }
}
```

---

# 22. Analytics Dashboard

## Endpoint

```http
GET /analytics/dashboard
```

### Response

```json
{
  "success": true,
  "data": {
    "total_requests": 1250,
    "pending": 120,
    "in_progress": 210,
    "completed": 850,
    "overdue": 70,
    "sla_compliance": 94.2,
    "average_resolution_hours": 18.5,
    "satisfaction_score": 4.4,
    "campus_health_score": 87
  }
}
```

---

# 23. Department Analytics

## Endpoint

```http
GET /analytics/departments
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "department": "IT",
      "open_requests": 45,
      "overdue": 5,
      "average_resolution_hours": 10.5,
      "sla_compliance": 93.4
    },
    {
      "department": "Facilities",
      "open_requests": 32,
      "overdue": 3,
      "average_resolution_hours": 14.2,
      "sla_compliance": 95.1
    }
  ]
}
```

---

# 24. Campus Issue Map

## Endpoint

```http
GET /analytics/map
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "building": "CSE Block",
      "latitude": 12.9716,
      "longitude": 77.5946,
      "active_requests": 18,
      "critical": 2,
      "high": 6,
      "health_score": 82
    }
  ]
}
```

---

# 25. Feedback

## Endpoint

```http
POST /requests/{request_id}/feedback
```

### Request

```json
{
  "rating": 5,
  "comment": "Issue was resolved quickly.",
  "resolved": true
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "feedback_001",
    "request_id": "req_123",
    "rating": 5,
    "comment": "Issue was resolved quickly.",
    "resolved": true,
    "created_at": "2026-10-06T16:00:00Z"
  }
}
```

---

# 26. Notifications

## 26.1 Get Notifications

### Endpoint

```http
GET /notifications
```

### Query Parameters

```text
unread
page
limit
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "notif_001",
        "title": "Request Updated",
        "message": "Your request REQ-2026-000123 is now in progress.",
        "type": "request_update",
        "read": false,
        "created_at": "2026-10-06T12:00:00Z"
      }
    ],
    "unread_count": 1
  }
}
```

---

# 27. Mark Notification as Read

## Endpoint

```http
PATCH /notifications/{notification_id}/read
```

### Response

```json
{
  "success": true,
  "data": {
    "notification_id": "notif_001",
    "read": true
  }
}
```

---

# 28. QR Location

QR codes can contain a location code.

Example:

```text
CSE-BLOCK-F2-LAB2
```

## Get Location

### Endpoint

```http
GET /locations/{location_code}
```

### Response

```json
{
  "success": true,
  "data": {
    "code": "CSE-BLOCK-F2-LAB2",
    "building": "CSE Block",
    "floor": 2,
    "room": "Lab 2",
    "latitude": 12.9716,
    "longitude": 77.5946
  }
}
```

The frontend can use this information to pre-fill a service request.

---

# 29. Pagination

List endpoints should use:

```text
page
limit
```

Example:

```http
GET /requests/my?page=1&limit=20
```

Response:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

Default:

```text
page = 1
limit = 20
```

Maximum:

```text
limit = 100
```

---

# 30. Search / Filter / Sort

Supported list endpoints should support appropriate combinations of:

```text
search
status
priority
category
department
assigned_to
building
sort
page
limit
```

Example:

```http
GET /staff/requests?status=pending&priority=high&sort=created_at_desc&page=1&limit=20
```

---

# 31. SLA Rules

The backend is the source of truth for SLA calculations.

Each request may contain:

```text
sla_deadline
```

SLA states:

```text
normal
warning
at_risk
overdue
```

Recommended thresholds:

```text
70% elapsed → warning
90% elapsed → at_risk
100% elapsed → overdue/escalated
```

The frontend should display the SLA state but must not calculate the official SLA status itself.

---

# 32. AI Rules

AI is used for:

- Request categorization
- Priority recommendation
- Department recommendation
- Request summarization
- Duplicate detection
- Incident correlation
- ETA recommendation
- Recurring issue detection

The backend remains responsible for final validation.

AI must not directly bypass:

- Authentication
- Authorization
- SLA rules
- Status transition rules
- Data validation

If the AI provider is unavailable, the backend should provide a rule-based fallback where possible.

---

# 33. Duplicate Detection Rules

Duplicate detection should not depend only on exact text matching.

The backend should consider:

```text
description similarity
category
location
building
time window
existing incident
```

Example:

```text
Student 1:
"WiFi not working in Block B"

Student 2:
"Internet connection is down in B Block"

Student 3:
"No network access in Block B"
```

These may represent one underlying incident.

Original requests must never be deleted.

They should instead be linked to a master incident.

---

# 34. Smart Assignment

Automatic assignment may consider:

```text
department
request category
staff skills
staff availability
current workload
priority
location
working hours
```

The backend returns:

```json
{
  "assignment_type": "automatic"
}
```

Manual assignment returns:

```json
{
  "assignment_type": "manual"
}
```

---

# 35. Priority Rules

Priority can consider:

```text
urgency
deadline
affected students
safety impact
location
service criticality
```

Final priority must be validated by backend business rules.

Allowed values:

```text
low
medium
high
critical
```

---

# 36. Request Lifecycle

Normal lifecycle:

```text
pending
    ↓
assigned
    ↓
in_progress
    ↓
completed
```

Other possible states:

```text
rejected
cancelled
escalated
```

Backend must validate allowed status transitions.

---

# 37. Frontend API Structure

Frontend should keep API calls outside UI components.

Recommended:

```text
src/
├── api/
│   ├── client.ts
│   ├── auth.ts
│   ├── requests.ts
│   ├── incidents.ts
│   ├── services.ts
│   ├── analytics.ts
│   ├── notifications.ts
│   ├── feedback.ts
│   └── locations.ts
```

Example:

```typescript
export const getMyRequests = async () => {
  const response = await api.get("/requests/my");
  return response.data;
};
```

UI components should not directly call:

```typescript
axios.get(...)
```

or:

```typescript
fetch(...)
```

Instead they should use the API service layer.

---

# 38. Backend Structure

Recommended:

```text
backend/
├── app/
│   ├── main.py
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── api/
│   ├── services/
│   ├── repositories/
│   └── utils/
├── tests/
├── alembic/
├── requirements.txt
├── .env.example
├── Dockerfile
└── README.md
```

---

# 39. Backend Business Services

Recommended services:

```text
ai_service.py
duplicate_service.py
incident_service.py
assignment_service.py
priority_service.py
sla_service.py
notification_service.py
analytics_service.py
preventive_service.py
```

These services contain business logic rather than placing everything inside route handlers.

---

# 40. Database Entities

Recommended core entities:

```text
User
Department
Service
Request
RequestHistory
Incident
IncidentRequest
Attachment
Notification
Feedback
Location
SLARule
AuditLog
```

---

# 41. Security Requirements

Backend must enforce:

- Password hashing
- JWT authentication
- Role-based authorization
- Input validation
- SQL injection protection
- CORS configuration
- Environment-based secrets
- Request ownership checks
- Rate limiting where appropriate
- Audit logging for important actions

Never expose:

```text
JWT secret
database password
AI API keys
SMTP credentials
```

to the frontend.

---

# 42. Frontend Security Rules

Frontend may store:

```text
API base URL
public configuration
```

Frontend must never contain:

```text
DATABASE_URL
JWT_SECRET
GEMINI_API_KEY
OPENAI_API_KEY
SMTP_PASSWORD
```

---

# 43. Error Codes

Recommended error codes:

```text
AUTH_REQUIRED
INVALID_CREDENTIALS
FORBIDDEN
USER_NOT_FOUND
REQUEST_NOT_FOUND
INCIDENT_NOT_FOUND
SERVICE_NOT_FOUND
VALIDATION_ERROR
DUPLICATE_REQUEST
INVALID_STATUS_TRANSITION
ASSIGNMENT_FAILED
SLA_ERROR
AI_SERVICE_UNAVAILABLE
RATE_LIMITED
INTERNAL_ERROR
```

Example:

```json
{
  "success": false,
  "error": {
    "code": "REQUEST_NOT_FOUND",
    "message": "Request REQ-2026-000123 was not found.",
    "details": {}
  }
}
```

---

# 44. Date and Time

All timestamps must use ISO 8601 format.

Example:

```text
2026-10-06T10:30:00Z
```

Backend should store timestamps consistently in UTC.

Frontend converts them to the user's local timezone for display.

---

# 45. API Contract Change Policy

Any API change must update this document.

### Breaking changes

Examples:

- Renaming a field
- Removing a field
- Changing a field type
- Changing an endpoint
- Changing an enum
- Changing authentication requirements

Breaking changes require agreement between frontend and backend developers.

### Non-breaking changes

Examples:

- Adding optional response fields
- Adding a new endpoint
- Adding optional query parameters

Even non-breaking changes should be documented.

---

# 46. Frontend ↔ Backend Development Workflow

## Step 1

Frontend and backend agree on this document.

```text
API_CONTRACT.md
```

## Step 2

Backend implements the endpoints.

## Step 3

Backend exposes Swagger:

```text
/docs
```

## Step 4

Frontend creates TypeScript types based on this contract.

## Step 5

Frontend connects API service functions.

## Step 6

Both teams test using the same request/response examples.

## Step 7

Before integration, verify:

```text
Endpoint
HTTP method
Request body
Response body
Status codes
Authentication
Enum values
Error structure
```

---

# 47. Minimum MVP API Set

If hackathon time becomes limited, implement these first:

### Authentication

```text
POST /auth/register
POST /auth/login
GET /auth/me
```

### Requests

```text
POST /requests/analyze
POST /requests/check-duplicates
POST /requests
GET /requests/my
GET /requests/{request_id}
GET /requests/{request_id}/timeline
PATCH /requests/{request_id}/status
POST /requests/{request_id}/assign
```

### Incidents

```text
GET /incidents
GET /incidents/{incident_id}
POST /incidents/{incident_id}/follow
```

### Dashboard

```text
GET /analytics/dashboard
GET /analytics/departments
GET /analytics/map
```

### Supporting features

```text
GET /services
GET /notifications
PATCH /notifications/{notification_id}/read
POST /requests/{request_id}/feedback
GET /locations/{location_code}
```

---

# 48. Ownership

## Frontend Developer

Responsible for:

```text
UI
React components
routing
forms
validation display
API client
TanStack Query
loading states
error states
charts
maps
notifications UI
```

## Backend Developer

Responsible for:

```text
FastAPI
database
authentication
authorization
business logic
AI services
duplicate detection
incident engine
assignment
SLA
notifications
analytics
audit logs
API validation
```

## Shared Responsibility

Both developers must coordinate on:

```text
API_CONTRACT.md
authentication flow
request/response schemas
enum values
error codes
integration testing
environment variables
deployment configuration
```

---

# 49. Definition of Done

An endpoint is considered complete only when:

- [ ] Route exists
- [ ] Authentication is implemented if required
- [ ] Authorization is implemented
- [ ] Request schema exists
- [ ] Response schema exists
- [ ] Validation exists
- [ ] Error handling exists
- [ ] Database operation works
- [ ] Swagger documentation works
- [ ] Example request tested
- [ ] Example response tested
- [ ] Frontend integration tested
- [ ] API contract matches implementation

---

# 50. Final Rule

> **API_CONTRACT.md is the single source of truth for CampusPulse frontend/backend integration.**

If the frontend expects a field that is not documented here, it should not be assumed to exist.

<<<<<<< HEAD
If the backend changes a documented field, the contract must be updated and both developers must agree before integration.
=======
If the backend changes a documented field, the contract must be updated and both developers must agree before integration.
>>>>>>> 842545cf49e48dba61ba3d909f5314c67a0bdf49
