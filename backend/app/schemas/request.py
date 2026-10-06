import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.models.enums import (
    AssignmentType,
    AttachmentType,
    Category,
    Priority,
    RequestStatus,
    SLAState,
)
from app.schemas.common import LocationIn, LocationOut, UserRef


# ---------- AI analysis (§10) ----------
class AnalyzeRequest(BaseModel):
    description: str = Field(min_length=5, max_length=5000)
    location: LocationIn | None = None


class AnalyzeResult(BaseModel):
    category: Category
    subcategory: str | None = None
    priority: Priority
    department: str
    location: LocationOut
    summary: str
    confidence: float = Field(ge=0, le=1)
    reason: list[str]


# ---------- Duplicate detection (§12) ----------
class CheckDuplicatesRequest(BaseModel):
    description: str = Field(min_length=5, max_length=5000)
    category: Category | None = None
    location: LocationIn | None = None


class DuplicateMatch(BaseModel):
    id: str
    ticket_number: str
    title: str
    status: RequestStatus
    created_at: datetime
    similarity: float = Field(description="Additive (v1.1): match confidence for this request")


class IncidentRef(BaseModel):
    id: str
    incident_number: str
    title: str
    affected_students: int


class DuplicateCheckResult(BaseModel):
    duplicate_found: bool
    confidence: float
    matching_requests: list[DuplicateMatch]
    incident: IncidentRef | None = None


# ---------- Attachments ----------
_ALLOWED_EXT = {
    AttachmentType.image: {".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic"},
    AttachmentType.video: {".mp4", ".mov", ".webm", ".mkv"},
    AttachmentType.audio: {".mp3", ".wav", ".m4a", ".ogg", ".aac", ".webm"},
    AttachmentType.document: {".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg"},
}


class AttachmentIn(BaseModel):
    """Metadata for a file already uploaded to object storage."""

    url: str = Field(max_length=1000)
    type: AttachmentType
    filename: str = Field(min_length=1, max_length=255)
    content_type: str | None = Field(default=None, max_length=100)
    size_bytes: int = Field(ge=1)

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not re.match(r"^https?://[^\s]+$", v):
            raise ValueError("url must be an http(s) URL pointing to object storage")
        return v

    @field_validator("filename")
    @classmethod
    def validate_filename(cls, v: str) -> str:
        if "/" in v or "\\" in v or ".." in v:
            raise ValueError("filename must not contain path separators")
        return v

    def extension_ok(self) -> bool:
        ext = "." + self.filename.rsplit(".", 1)[-1].lower() if "." in self.filename else ""
        return ext in _ALLOWED_EXT[self.type]


class AttachmentOut(BaseModel):
    id: str
    request_id: str
    url: str
    type: AttachmentType
    filename: str
    created_at: datetime


# ---------- Create request (§11) ----------
class CreateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5, max_length=5000)
    category: Category | None = Field(default=None, description="If omitted, the AI/rule engine infers it")
    priority: Priority | None = Field(
        default=None, description="Requested priority (hint). Final priority is decided by the backend."
    )
    location: LocationIn | None = None
    service_id: str | None = None
    location_code: str | None = Field(default=None, max_length=60, description="Additive (v1.1): QR location code")
    attachments: list[AttachmentIn] = Field(default_factory=list, description="Additive (v1.1)")


class CreateRequestResult(BaseModel):
    id: str
    ticket_number: str
    status: RequestStatus
    priority: Priority
    category: Category
    department: str
    created_at: datetime
    sla_deadline: datetime | None
    # Additive (v1.1)
    priority_reason: list[str]
    assigned_to: UserRef | None = None
    sla_state: SLAState
    incident: IncidentRef | None = None


# ---------- List / detail (§13, §14, §18) ----------
class RequestListItem(BaseModel):
    id: str
    ticket_number: str
    title: str
    status: RequestStatus
    priority: Priority
    category: Category
    created_at: datetime
    updated_at: datetime
    # Additive (v1.1)
    department: str
    assigned_to: UserRef | None = None
    location: LocationOut
    sla_deadline: datetime | None = None
    sla_state: SLAState


class RequestDetail(BaseModel):
    id: str
    ticket_number: str
    title: str
    description: str
    status: RequestStatus
    priority: Priority
    category: Category
    department: str
    assigned_to: UserRef | None = None
    location: LocationOut
    estimated_completion: datetime | None = None
    sla_deadline: datetime | None = None
    created_at: datetime
    updated_at: datetime
    # Additive (v1.1)
    subcategory: str | None = None
    priority_reason: list[str]
    sla_state: SLAState
    assignment_type: AssignmentType | None = None
    service_id: str | None = None
    student: UserRef
    incident: IncidentRef | None = None
    attachments: list[AttachmentOut]
    resolved_at: datetime | None = None


# ---------- Timeline (§15) ----------
class TimelineItem(BaseModel):
    id: str
    action: str
    status: RequestStatus | None = None
    actor: UserRef
    timestamp: datetime
    comment: str | None = None
    event_type: str = Field(description="Additive (v1.1): machine-readable event e.g. REQUEST_ASSIGNED")


# ---------- Status / assign (§16, §17) ----------
class StatusUpdateRequest(BaseModel):
    status: RequestStatus
    comment: str | None = Field(default=None, max_length=2000)


class StatusUpdateResult(BaseModel):
    request_id: str
    status: RequestStatus
    updated_at: datetime


class AssignRequest(BaseModel):
    staff_id: str | None = Field(
        default=None, description="Staff user id. Omit/null to let the smart-assignment engine choose."
    )


class AssignResult(BaseModel):
    request_id: str
    assigned_to: UserRef
    assignment_type: AssignmentType


SortOption = Literal[
    "created_at_desc", "created_at_asc", "updated_at_desc", "priority_desc", "priority_asc", "sla_deadline_asc"
]
