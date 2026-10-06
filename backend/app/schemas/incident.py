from datetime import datetime

from pydantic import BaseModel

from app.models.enums import IncidentStatus, Priority
from app.schemas.common import LocationOut


class IncidentListItem(BaseModel):
    id: str
    incident_number: str
    title: str
    status: IncidentStatus
    priority: Priority
    affected_students: int
    department: str
    created_at: datetime
    # Additive (v1.1)
    building: str | None = None
    updated_at: datetime


class IncidentDetail(BaseModel):
    id: str
    incident_number: str
    title: str
    status: IncidentStatus
    priority: Priority
    department: str
    affected_students: int
    linked_requests: list[str]
    location: LocationOut
    created_at: datetime
    # Additive (v1.1)
    description: str | None = None
    priority_reason: list[str]
    updated_at: datetime
    resolved_at: datetime | None = None
    following: bool


class FollowResult(BaseModel):
    incident_id: str
    following: bool
