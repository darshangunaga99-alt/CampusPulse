"""Incident routes.

GET  /incidents
GET  /incidents/{incident_id}
POST /incidents/{incident_id}/follow
PATCH /incidents/{incident_id}/status
"""
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_user, require_roles
from app.core.exceptions import NotFoundError
from app.models.enums import IncidentStatus, Priority, UserRole
from app.models.user import User
from app.repositories import incident_repository
from app.schemas.common import ApiResponse, ERROR_RESPONSES, LocationOut, Paginated, make_pagination, ok
from app.schemas.incident import FollowResult, IncidentDetail, IncidentListItem
from app.services import incident_service

router = APIRouter(prefix="/incidents", tags=["Incidents"], responses=ERROR_RESPONSES)


class IncidentStatusUpdate(BaseModel):
    status: IncidentStatus
    comment: str | None = None


@router.get(
    "",
    response_model=ApiResponse[Paginated[IncidentListItem]],
)
def list_incidents(
    status: IncidentStatus | None = Query(default=None),
    priority: Priority | None = Query(default=None),
    department: str | None = Query(default=None),
    building: str | None = Query(default=None),
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = incident_repository.list_incidents(
        db,
        status=status,
        priority=priority,
        department=department,
        building=building,
        search=search,
        page=page,
        limit=limit,
    )

    out_items = [
        IncidentListItem(
            id=i.id,
            incident_number=i.incident_number,
            title=i.title,
            status=i.status,
            priority=i.priority,
            affected_students=i.affected_students,
            department=i.department.name if i.department else "IT",
            created_at=i.created_at,
            building=i.building,
            updated_at=i.updated_at,
        )
        for i in items
    ]

    return ok(
        Paginated[IncidentListItem](
            items=out_items,
            pagination=make_pagination(page=page, limit=limit, total=total),
        )
    )


@router.get(
    "/{incident_id}",
    response_model=ApiResponse[IncidentDetail],
)
def get_incident(
    incident_id: str,
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    inc = incident_repository.get_incident(db, incident_id)
    if not inc:
        raise NotFoundError("INCIDENT_NOT_FOUND", f"Incident '{incident_id}' was not found.")

    linked_ids = incident_repository.linked_request_ids(db, inc.id)
    following = incident_repository.is_following(db, inc.id, current_user.id) if current_user else False

    return ok(
        IncidentDetail(
            id=inc.id,
            incident_number=inc.incident_number,
            title=inc.title,
            status=inc.status,
            priority=inc.priority,
            department=inc.department.name if inc.department else "IT",
            affected_students=inc.affected_students,
            linked_requests=linked_ids,
            location=LocationOut(
                building=inc.building,
                floor=inc.floor,
                room=inc.room,
            ),
            created_at=inc.created_at,
            description=inc.description,
            priority_reason=inc.priority_reason,
            updated_at=inc.updated_at,
            resolved_at=inc.resolved_at,
            following=following,
        )
    )


@router.post(
    "/{incident_id}/follow",
    response_model=ApiResponse[FollowResult],
)
def follow_incident(
    incident_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    incident_service.follow_incident(db, incident_id=incident_id, user_id=current_user.id)
    return ok(
        FollowResult(
            incident_id=incident_id,
            following=True,
        )
    )


@router.patch(
    "/{incident_id}/status",
    response_model=ApiResponse[IncidentDetail],
)
def update_status(
    incident_id: str,
    body: IncidentStatusUpdate,
    current_user: User = Depends(require_roles(UserRole.staff, UserRole.department_head, UserRole.admin)),
    db: Session = Depends(get_db),
):
    inc = incident_service.update_incident_status(
        db,
        incident_id=incident_id,
        status=body.status,
        actor_id=current_user.id,
        comment=body.comment,
    )
    linked_ids = incident_repository.linked_request_ids(db, inc.id)

    return ok(
        IncidentDetail(
            id=inc.id,
            incident_number=inc.incident_number,
            title=inc.title,
            status=inc.status,
            priority=inc.priority,
            department=inc.department.name if inc.department else "IT",
            affected_students=inc.affected_students,
            linked_requests=linked_ids,
            location=LocationOut(
                building=inc.building,
                floor=inc.floor,
                room=inc.room,
            ),
            created_at=inc.created_at,
            description=inc.description,
            priority_reason=inc.priority_reason,
            updated_at=inc.updated_at,
            resolved_at=inc.resolved_at,
            following=incident_repository.is_following(db, inc.id, current_user.id),
        )
    )
