"""Notification routes.

GET   /notifications
PATCH /notifications/{notification_id}/read
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.common import ApiResponse, ERROR_RESPONSES, make_pagination, ok
from app.schemas.notification import NotificationList, NotificationOut, NotificationReadResult
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"], responses=ERROR_RESPONSES)


@router.get(
    "",
    response_model=ApiResponse[NotificationList],
)
def get_my_notifications(
    unread: bool | None = Query(default=None, description="Filter unread notifications only"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items, total, unread_count = notification_service.list_for_user(
        db=db,
        user_id=current_user.id,
        unread=unread,
        page=page,
        limit=limit,
    )

    out_items = [
        NotificationOut(
            id=n.id,
            title=n.title,
            message=n.message,
            type=n.type,
            read=n.read,
            created_at=n.created_at,
            entity_type=n.entity_type,
            entity_id=n.entity_id,
        )
        for n in items
    ]

    return ok(
        NotificationList(
            items=out_items,
            unread_count=unread_count,
            pagination=make_pagination(page=page, limit=limit, total=total),
        )
    )


@router.patch(
    "/{notification_id}/read",
    response_model=ApiResponse[NotificationReadResult],
)
def mark_notification_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    n = notification_service.mark_read(db=db, user_id=current_user.id, notification_id=notification_id)
    return ok(
        NotificationReadResult(
            notification_id=n.id,
            read=True,
        )
    )
