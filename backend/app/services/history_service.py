"""Request timeline events."""
from sqlalchemy.orm import Session

from app.models.request import Request
from app.models.request_history import RequestHistory

# event_type -> human readable action label shown in the timeline (API_CONTRACT §15)
ACTION_LABELS = {
    "REQUEST_CREATED": "Request created",
    "AI_ANALYZED": "Request analyzed",
    "PRIORITY_CALCULATED": "Priority calculated",
    "REQUEST_ASSIGNED": "Request assigned",
    "STATUS_CHANGED": "Status changed",
    "SLA_WARNING": "SLA warning",
    "SLA_AT_RISK": "SLA at risk",
    "ESCALATED": "Request escalated",
    "REQUEST_COMPLETED": "Request completed",
    "FEEDBACK_SUBMITTED": "Feedback submitted",
    "REQUEST_REOPENED": "Request reopened",
    "INCIDENT_LINKED": "Linked to incident",
}


def record(db: Session, request: Request, event_type: str, *, actor_id: str | None = None,
           comment: str | None = None, status=None, meta: dict | None = None) -> RequestHistory:
    st = status if status is not None else request.status
    ev = RequestHistory(
        request_id=request.id,
        event_type=event_type,
        action=ACTION_LABELS.get(event_type, event_type.replace("_", " ").capitalize()),
        status=getattr(st, "value", st),
        actor_id=actor_id,
        comment=comment,
        meta=meta or {},
    )
    db.add(ev)
    return ev
