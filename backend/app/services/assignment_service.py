"""Smart assignment engine.

Considers:
- Department boundary (never assign outside department)
- Staff availability (`is_available` flag)
- Working hours (campus-local time)
- Skill matching (subcategory or category in `skills` list)
- Location proximity (`home_building` matches request building)
- Current workload (number and priority of open tickets assigned)

Assignment types: 'automatic' | 'manual'.
"""
from sqlalchemy.orm import Session

from app.core.exceptions import AppError, BadRequestError, ForbiddenError, NotFoundError
from app.models.enums import AssignmentType, NotificationType, UserRole
from app.models.request import Request
from app.models.user import User
from app.repositories import user_repository
from app.services import audit_service, history_service, notification_service
from app.utils.time import to_campus_local, utcnow


def pick_best_staff(db: Session, request: Request) -> User | None:
    """Algorithm scoring available staff members within the request's department."""
    candidates = user_repository.list_staff(db, department_id=request.department_id)
    if not candidates:
        return None

    now_local = to_campus_local(utcnow())
    current_hour = now_local.hour

    staff_ids = [s.id for s in candidates]
    workloads = user_repository.open_workload(db, staff_ids)

    scored: list[tuple[float, User]] = []
    for staff in candidates:
        score = 100.0

        # Availability check
        if not staff.is_available:
            score -= 60.0

        # Working hours check
        if not (staff.working_hours_start <= current_hour < staff.working_hours_end):
            score -= 30.0

        # Skill match
        skills = [sk.lower() for sk in (staff.skills or [])]
        req_sub = (request.subcategory or "").lower()
        req_cat = request.category.value.lower()
        if req_sub and req_sub in skills:
            score += 40.0
        elif req_cat in skills:
            score += 20.0

        # Location proximity
        if staff.home_building and request.building:
            if staff.home_building.strip().lower() == request.building.strip().lower():
                score += 25.0

        # Workload penalty
        current_active = workloads.get(staff.id, [])
        score -= len(current_active) * 15.0

        scored.append((score, staff))

    scored.sort(key=lambda x: x[0], reverse=True)
    best_score, best_staff = scored[0]

    # Return best staff even if score is lower than normal, unless all are disabled/unavailable
    return best_staff if best_staff.is_active else None


def assign_request(
    db: Session,
    request: Request,
    staff_id: str | None = None,
    actor: User | None = None,
) -> tuple[Request, User, AssignmentType]:
    """Assigns the request to a staff member either manually or automatically."""
    assignment_type = AssignmentType.manual if staff_id else AssignmentType.automatic

    target_staff: User | None = None
    if staff_id:
        target_staff = user_repository.get_user(db, staff_id)
        if not target_staff:
            raise NotFoundError("USER_NOT_FOUND", f"Staff user {staff_id} was not found.")
        if target_staff.role != UserRole.staff:
            raise BadRequestError("ASSIGNMENT_FAILED", f"User {staff_id} is not a staff member.")

        # Permission / boundary check
        if actor and actor.role == UserRole.department_head:
            if target_staff.department_id != actor.department_id:
                raise ForbiddenError("Department heads can only assign within their department.")
        elif actor and actor.role == UserRole.staff:
            raise ForbiddenError("Staff members cannot reassign tickets.")
        elif actor and actor.role == UserRole.student:
            raise ForbiddenError("Students cannot assign tickets.")
    else:
        target_staff = pick_best_staff(db, request)
        if not target_staff:
            raise AppError(400, "ASSIGNMENT_FAILED", "No available staff found in this department for assignment.")

    request.assigned_to_id = target_staff.id
    request.assignment_type = assignment_type
    if request.status.value == "pending":
        from app.models.enums import RequestStatus
        request.status = RequestStatus.assigned

    actor_id = actor.id if actor else None
    history_service.record(
        db,
        request,
        event_type="REQUEST_ASSIGNED",
        actor_id=actor_id,
        comment=f"Assigned to {target_staff.name} ({assignment_type.value}).",
    )

    audit_service.log(
        db,
        action="REQUEST_ASSIGNED",
        entity="request",
        entity_id=request.id,
        actor_id=actor_id,
        meta={"assigned_to": target_staff.id, "type": assignment_type.value},
    )

    # Notify assigned staff
    notification_service.notify(
        db,
        user_id=target_staff.id,
        title="New Request Assigned",
        message=f"You have been assigned to request {request.ticket_number}: {request.title}",
        type_=NotificationType.assignment,
        entity_type="request",
        entity_id=request.id,
    )

    # Notify student
    notification_service.notify(
        db,
        user_id=request.student_id,
        title="Request Assigned",
        message=f"Your request {request.ticket_number} has been assigned to {target_staff.name}.",
        type_=NotificationType.request_update,
        entity_type="request",
        entity_id=request.id,
    )

    db.flush()
    return request, target_staff, assignment_type
