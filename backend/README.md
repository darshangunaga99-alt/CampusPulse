# CampusPulse — Intelligent Campus Incident & Service Operations Platform (Backend)

The production-style REST API and Business Intelligence Engine for **CampusPulse**.

Built with:
- **FastAPI** + **Uvicorn**
- **PostgreSQL** / **SQLite** (via **SQLAlchemy 2.0**)
- **Alembic** migrations
- **Pydantic v2**
- **JWT** authentication + **Bcrypt** password hashing
- **Pytest** automated integration suite

---

## Architecture Overview

```text
React Frontend (Vite @ :5173)
       │
       ▼ REST API (/api/v1) [docs/API_CONTRACT.md]
┌─────────────────────────────────────────────────────────────┐
│                       FastAPI Application                   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Auth / RBAC  │  │   Catalog    │  │ Request Engine   │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                 │                   │             │
│  ┌──────▼─────────────────▼───────────────────▼──────────┐  │
│  │                 Business Intelligence Layers          │  │
│  │  • AI Request Analyzer (Gemini/OpenAI + Rules Engine) │  │
│  │  • Duplicate Detection (Jaccard + Location Cluster)   │  │
│  │  • Incident Engine (Traceable multi-request cluster)  │  │
│  │  • Smart Assignment (Workload, Skills, Proximity)     │  │
│  │  • SLA Engine (Precedence rules, Real-time monitor)   │  │
│  │  • Campus Health Analytics & Issue Maps               │  │
│  │  • Recurring Issue & Preventative Maintenance Engine  │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                 │
│                    SQLAlchemy Models                        │
└───────────────────────────┼─────────────────────────────────┘
                            ▼
              PostgreSQL / SQLite Database
```

---

## Quickstart

### 1. Environment Setup

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 3. Database Migration & Seeding

```bash
# Run migrations
alembic upgrade head

# Seed initial departments, users, services, demo incidents, and analytics data
python -m app.seed
```

### 4. Run the Dev Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **API Base URL**: `http://localhost:8000/api/v1`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

---

## Seed Accounts (for Frontend Development & Testing)

| Role | Email | Password | Scope |
|---|---|---|---|
| **Admin** | `admin@campuspulse.edu` | `Admin123!` | Global administration & settings |
| **Dept Head (IT)** | `it.head@campuspulse.edu` | `Head123!` | IT department queue & staff assignment |
| **Dept Head (Facilities)** | `facilities.head@campuspulse.edu` | `Head123!` | Facilities department queue & analytics |
| **Staff (IT Network)** | `anil.kumar@campuspulse.edu` | `Staff123!` | Assigned to Block B network tickets |
| **Staff (Hardware)** | `priya.sharma@campuspulse.edu` | `Staff123!` | Assigned to CSE lab hardware tickets |
| **Staff (Electrician)** | `ramesh.patel@campuspulse.edu` | `Staff123!` | Assigned to electrical & plumbing |
| **Student (Rahul)** | `rahul@example.com` | `Student123!` | Demo reporter for Block B WiFi |
| **Student (Ananya)** | `ananya@example.com` | `Student123!` | Demo reporter for Block B Internet |
| **Auditor** | `auditor@campuspulse.edu` | `Auditor123!` | Read-only reports & audit logs |

---

## Demo Scenario (Prompt #48 & API Contract)

1. **Student Rahul** reports *"WiFi is not working in Block B"*.
2. **Student Ananya** reports *"Internet is down in Block B"*.
3. **Student Vikram** reports *"Cannot connect to college WiFi"*.
4. The **CampusPulse Duplicate & Incident Engine** calculates a >85% correlation and clusters them into master incident **`INC-2026-0001`**:
   - **Title**: `WiFi outage - Block B`
   - **Department**: `IT Support`
   - **Status**: `in_progress`
   - **Affected Students**: 3
   - **Assigned Staff**: `Anil Kumar` (auto-assigned based on skills & location)
5. Individual requests remain completely traceable and linked.

---

## Running Automated Tests

```bash
pytest -v
```
