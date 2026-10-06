"""Staff queue routes.

GET /staff/requests
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.enums import Category, Priority, RequestStatus, UserRole
from app.models.request import Request
from app.models.user import User
from app.repositories import request_repository
from app.schemas.common import ApiResponse, ERROR_RESPONSES, LocationOut, Paginated, UserRef, make_pagination, ok
from app.schemas.request import RequestListItem, SortOption

router = APIRouter(prefix="/staff", tags=["Staff"], responses=ERROR_RESPONSES)


@router.get(
    "/requests",
    response_model=ApiResponse[Paginated[RequestListItem]],
)
def get_staff_requests(
    status: RequestStatus | None = Query(default=None),
    priority: Priority | None = Query(default=None),
    category: Category | None = Query(default=None),
    department: str | None = Query(default=None),
    assigned_to: str | None = Query(default=None),
    search: str | None = Query(default=None),
    sort: SortOption = Query(default="created_at_desc"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_roles(UserRole.staff, UserRole.department_head, UserRole.admin, UserRole.auditor)),
    db: Session = Depends(get_db),
):
    stmt = select(Request)

    # Scoping by role:
    # - Staff: default to assigned to them unless specifically filtering
    # - Department Head: scoped to their department unless admin
    # - Admin / Auditor: global view
    if current_user.role == UserRole.staff:
        if not assigned_to:
            stmt = stmt.where(Request.assigned_to_id == current_user.id)
    elif current_user.role == UserRole.department_head:
        if current_user.department_id and not department:
            stmt = stmt.where(Request.department_id == current_user.department_id)

    stmt = request_repository.apply_filters(
        stmt,
        status=status,
        priority=priority,
        category=category,
        department=department,
        assigned_to=assigned_to,
        search=search,
    )

    items, total = request_repository.paginate(db, stmt, sort=sort, page=page, limit=limit)

    out_items = [
        RequestListItem(
            id=r.id,
            ticket_number=r.ticket_number,
            title=r.title,
            status=r.status,
            priority=r.priority,
            category=r.category,
            department=r.department.name if r.department else "",
            assigned_to=UserRef.model_validate(r.assigned_to) if r.assigned_to else None,
            location=LocationOut(
                building=r.building,
                floor=r.floor,
                room=r.room,
                latitude=r.latitude,
                longitude=r.longitude,
            ),
            sla_deadline=r.sla_deadline,
            sla_state=r.sla_state,
            created_at=r.created_at,
            updated_at=r.updated_at,
        )
        for r in items
    ]

    return ok(
        Paginated[RequestListItem](
            items=out_items,
            pagination=make_pagination(page=page, limit=limit, total=total),
        )
    )
