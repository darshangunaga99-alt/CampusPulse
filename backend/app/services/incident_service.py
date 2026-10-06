"""Incident engine.

Correlates requests, clusters similar reports, creates/updates incidents,
manages subscriptions (following), and updates incident priority and student count.
Traceability: original requests are never deleted.
"""
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import NotFoundError
from app.models.department import Department
from app.models.enums import IncidentStatus, NotificationType, Priority
from app.models.incident import Incident, IncidentFollower
from app.models.incident_request import IncidentRequest
from app.models.request import Request
from app.repositories import incident_repository
from app.services import audit_service, history_service, notification_service, priority_service
from app.utils.time import utcnow


def create_or_link_incident(
    db: Session,
    request: Request,
    matched_requests: list[Request],
    similarity_score: float = 0.85,
) -> Incident | None:
    """When a new request arrives, check if it should join an existing incident or form a new one."""
    year = utcnow().year
    
    # 1. Check if any matched request is already in an open incident
    all_req_ids = [request.id] + [r.id for r in matched_requests]
    existing_map = incident_repository.incidents_for_requests(db, [r.id for r in matched_requests])
    
    target_incident: Incident | None = None
    if existing_map:
        target_incident = next(iter(existing_map.values()))

    # 2. If no existing incident, but count of matching requests >= threshold, create one!
    if not target_incident and (len(matched_requests) + 1) >= settings.INCIDENT_MIN_REPORTS:
        title = f"{request.category.value.replace('_', ' ').title()} Outage - {request.building or 'Campus'}"
        inc_num = incident_repository.next_incident_number(db, year)
        
        pr = priority_service.calculate(
            description=request.description,
            category=request.category,
            location_text=f"{request.building or ''} {request.room or ''}",
            affected_students=len(matched_requests) + 1,
        )
        
        target_incident = Incident(
            incident_number=inc_num,
            title=title,
            description=f"Correlated incident from multiple student reports regarding {request.title}.",
            status=IncidentStatus.detected,
            priority=pr.priority,
            priority_reason=pr.reason,
            category=request.category,
            subcategory=request.subcategory,
            department_id=request.department_id,
            building=request.building,
            floor=request.floor,
            room=request.room,
            affected_students=0,
        )
        db.add(target_incident)
        db.flush()

        audit_service.log(
            db,
            action="INCIDENT_CREATED",
            entity="incident",
            entity_id=target_incident.id,
            meta={"incident_number": inc_num, "initial_requests": len(matched_requests) + 1},
        )

        # Link all previously matching requests
        for mr in matched_requests:
            link = IncidentRequest(
                incident_id=target_incident.id,
                request_id=mr.id,
                similarity=similarity_score,
                linked_by="system",
            )
            db.add(link)
            history_service.record(
                db,
                mr,
                event_type="INCIDENT_LINKED",
                comment=f"Linked to incident {target_incident.incident_number}",
            )

    if not target_incident:
        return None

    # Link the current request if not already linked
    existing_link = db.get(IncidentRequest, (target_incident.id, request.id))
    if not existing_link:
        link = IncidentRequest(
            incident_id=target_incident.id,
            request_id=request.id,
            similarity=similarity_score,
            linked_by="system",
        )
        db.add(link)
        history_service.record(
            db,
            request,
            event_type="INCIDENT_LINKED",
            comment=f"Linked to incident {target_incident.incident_number}",
        )

    db.flush()

    # Recalculate unique affected students
    unique_students_count = db.scalar(
        select(func.count(func.distinct(Request.student_id)))
        .join(IncidentRequest, IncidentRequest.request_id == Request.id)
        .where(IncidentRequest.incident_id == target_incident.id)
    ) or 1

    target_incident.affected_students = unique_students_count

    # Re-evaluate priority based on rising student impact
    pr_updated = priority_service.calculate(
        description=target_incident.title,
        category=target_incident.category,
        location_text=target_incident.building or "",
        affected_students=unique_students_count,
    )
    if pr_updated.priority != target_incident.priority:
        target_incident.priority = pr_updated.priority
        target_incident.priority_reason = pr_updated.reason

    return target_incident


def follow_incident(db: Session, incident_id: str, user_id: str) -> bool:
    inc = incident_repository.get_incident(db, incident_id)
    if not inc:
        raise NotFoundError("INCIDENT_NOT_FOUND", f"Incident {incident_id} was not found.")

    follower = db.get(IncidentFollower, (inc.id, user_id))
    if follower:
        # Already following
        return True

    new_follower = IncidentFollower(incident_id=inc.id, user_id=user_id)
    db.add(new_follower)
    db.commit()
    return True


def update_incident_status(
    db: Session,
    incident_id: str,
    status: IncidentStatus,
    actor_id: str | None = None,
    comment: str | None = None,
) -> Incident:
    inc = incident_repository.get_incident(db, incident_id)
    if not inc:
        raise NotFoundError("INCIDENT_NOT_FOUND", f"Incident {incident_id} was not found.")

    inc.status = status
    if status in (IncidentStatus.resolved, IncidentStatus.closed) and not inc.resolved_at:
        inc.resolved_at = utcnow()

    audit_service.log(
        db,
        action="INCIDENT_UPDATED",
        entity="incident",
        entity_id=inc.id,
        actor_id=actor_id,
        meta={"status": status.value, "comment": comment},
    )

    # Notify followers
    follower_ids = incident_repository.follower_ids(db, inc.id)
    notification_service.notify_many(
        db,
        user_ids=follower_ids,
        title=f"Incident Update: {inc.incident_number}",
        message=f"{inc.title} is now {status.value.replace('_', ' ')}." + (f" Details: {comment}" if comment else ""),
        type_=NotificationType.incident_update,
        entity_type="incident",
        entity_id=inc.id,
    )

    db.commit()
    return inc
