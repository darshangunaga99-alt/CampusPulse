"""Enum values shared by models and schemas. Values MUST match docs/API_CONTRACT.md."""
from enum import Enum


class StrEnum(str, Enum):
    def __str__(self) -> str:  # pragma: no cover
        return self.value


class UserRole(StrEnum):
    student = "student"
    staff = "staff"
    department_head = "department_head"
    admin = "admin"
    auditor = "auditor"


class RequestStatus(StrEnum):
    pending = "pending"
    assigned = "assigned"
    in_progress = "in_progress"
    completed = "completed"
    rejected = "rejected"
    cancelled = "cancelled"
    escalated = "escalated"


class Priority(StrEnum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class Category(StrEnum):
    academic = "academic"
    maintenance = "maintenance"
    lab_equipment = "lab_equipment"
    it_support = "it_support"
    library = "library"
    administration = "administration"
    hostel = "hostel"
    transport = "transport"
    other = "other"


class IncidentStatus(StrEnum):
    detected = "detected"
    investigating = "investigating"
    confirmed = "confirmed"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class AssignmentType(StrEnum):
    automatic = "automatic"
    manual = "manual"


class SLAState(StrEnum):
    normal = "normal"
    warning = "warning"
    at_risk = "at_risk"
    overdue = "overdue"


class AttachmentType(StrEnum):
    image = "image"
    video = "video"
    audio = "audio"
    document = "document"


class NotificationType(StrEnum):
    request_created = "request_created"
    request_update = "request_update"
    assignment = "assignment"
    sla_warning = "sla_warning"
    escalation = "escalation"
    completion = "completion"
    incident_update = "incident_update"
    feedback_request = "feedback_request"


OPEN_STATUSES = (
    RequestStatus.pending,
    RequestStatus.assigned,
    RequestStatus.in_progress,
    RequestStatus.escalated,
)
TERMINAL_STATUSES = (RequestStatus.completed, RequestStatus.rejected, RequestStatus.cancelled)
OPEN_INCIDENT_STATUSES = (
    IncidentStatus.detected,
    IncidentStatus.investigating,
    IncidentStatus.confirmed,
    IncidentStatus.in_progress,
)

PRIORITY_RANK = {Priority.low: 1, Priority.medium: 2, Priority.high: 3, Priority.critical: 4}
SLA_STATE_RANK = {SLAState.normal: 0, SLAState.warning: 1, SLAState.at_risk: 2, SLAState.overdue: 3}
