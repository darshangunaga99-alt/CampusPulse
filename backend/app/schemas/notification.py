from datetime import datetime

from pydantic import BaseModel

from app.models.enums import NotificationType
from app.schemas.common import Pagination


class NotificationOut(BaseModel):
    id: str
    title: str
    message: str
    type: NotificationType
    read: bool
    created_at: datetime
    # Additive (v1.1): lets the UI deep-link to the related entity
    entity_type: str | None = None
    entity_id: str | None = None


class NotificationList(BaseModel):
    items: list[NotificationOut]
    unread_count: int
    pagination: Pagination  # Additive (v1.1)


class NotificationReadResult(BaseModel):
    notification_id: str
    read: bool
