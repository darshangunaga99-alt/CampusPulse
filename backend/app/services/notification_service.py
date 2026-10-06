"""Notification creation and retrieval."""
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.enums import NotificationType
from app.models.notification import Notification


def notify(db: Session, user_id: str | None, title: str, message: str, type_: NotificationType,
           entity_type: str | None = None, entity_id: str | None = None) -> Notification | None:
    if not user_id:
        return None
    n = Notification(user_id=user_id, title=title, message=message, type=type_,
                     entity_type=entity_type, entity_id=entity_id)
    db.add(n)
    return n


def notify_many(db: Session, user_ids, title: str, message: str, type_: NotificationType,
                entity_type: str | None = None, entity_id: str | None = None) -> None:
    for uid in dict.fromkeys(u for u in user_ids if u):  # de-duplicate, keep order
        notify(db, uid, title, message, type_, entity_type, entity_id)


def list_for_user(db: Session, user_id: str, unread: bool | None, page: int, limit: int):
    stmt = select(Notification).where(Notification.user_id == user_id)
    if unread is True:
        stmt = stmt.where(Notification.read.is_(False))
    elif unread is False:
        stmt = stmt.where(Notification.read.is_(True))
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = list(
        db.scalars(stmt.order_by(Notification.created_at.desc(), Notification.id.desc())
                   .offset((page - 1) * limit).limit(limit))
    )
    unread_count = db.scalar(
        select(func.count()).where(Notification.user_id == user_id, Notification.read.is_(False))
    ) or 0
    return items, total, unread_count


def mark_read(db: Session, user_id: str, notification_id: str) -> Notification:
    n = db.get(Notification, notification_id)
    # Return 404 (not 403) for other users' notifications to avoid leaking existence.
    if n is None or n.user_id != user_id:
        raise NotFoundError("NOTIFICATION_NOT_FOUND", f"Notification {notification_id} was not found.")
    n.read = True
    db.commit()
    return n
