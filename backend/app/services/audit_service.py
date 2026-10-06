"""Append-only audit logging."""
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def log(db: Session, action: str, entity: str, entity_id: str | None, actor_id: str | None = None,
        meta: dict | None = None) -> AuditLog:
    entry = AuditLog(actor_id=actor_id, action=action, entity=entity, entity_id=entity_id, meta=meta or {})
    db.add(entry)
    return entry
