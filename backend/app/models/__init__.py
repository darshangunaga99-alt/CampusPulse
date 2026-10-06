"""Import all models so SQLAlchemy metadata (and Alembic) sees every table."""
from app.models.department import Department
from app.models.user import User
from app.models.service import Service
from app.models.location import Location
from app.models.sla_rule import SLARule
from app.models.attachment import Attachment
from app.models.request import Request
from app.models.request_history import RequestHistory
from app.models.incident import Incident, IncidentFollower
from app.models.incident_request import IncidentRequest
from app.models.notification import Notification
from app.models.feedback import Feedback
from app.models.audit_log import AuditLog

__all__ = [
    "Department",
    "User",
    "Service",
    "Location",
    "SLARule",
    "Attachment",
    "Request",
    "RequestHistory",
    "Incident",
    "IncidentFollower",
    "IncidentRequest",
    "Notification",
    "Feedback",
    "AuditLog",
]
