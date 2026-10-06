"""SLA and ETA calculation engine.

SLA Rules matching precedence:
1. service_id + priority
2. service_id
3. category + priority
4. category
5. priority only
6. global default (24h resolution, 4h first response)

SLA States:
- 70% consumed: WARNING
- 90% consumed: AT_RISK
- 100% consumed: OVERDUE / ESCALATED

ETA (estimated_completion):
- Computes historical median/average resolution time for service/category
- Adjusts for current department backlog
- Falls back to configured SLA deadline if insufficient history.
"""
from datetime import datetime, timedelta
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.enums import Category, NotificationType, Priority, RequestStatus, SLAState
from app.models.request import Request
from app.models.sla_rule import SLARule
from app.repositories import user_repository
from app.services import audit_service, history_service, notification_service
from app.utils.time import add_working_minutes, utcnow


def find_matching_sla_rule(
    db: Session,
    service_id: str | None,
    category: Category,
    priority: Priority,
) -> SLARule | None:
    rules = list(db.scalars(select(SLARule).where(SLARule.active.is_(True))))
    
    # 1. service + priority
    if service_id:
        for r in rules:
            if r.service_id == service_id and r.priority == priority:
                return r
        # 2. service only
        for r in rules:
            if r.service_id == service_id and r.priority is None:
                return r

    # 3. category + priority
    for r in rules:
        if r.category == category and r.priority == priority:
            return r

    # 4. category only
    for r in rules:
        if r.category == category and r.priority is None:
            return r

    # 5. priority only
    for r in rules:
        if r.category is None and r.priority == priority:
            return r

    return None


def calculate_sla_deadlines(
    db: Session,
    start_time: datetime,
    service_id: str | None,
    category: Category,
    priority: Priority,
) -> tuple[datetime, datetime]:
    rule = find_matching_sla_rule(db, service_id, category, priority)
    
    # Default minutes if no rule matches
    first_resp_min = 240  # 4 hours
    res_min = 1440        # 24 hours
    working_days = False

    if rule:
        first_resp_min = rule.first_response_minutes
        res_min = rule.resolution_minutes
        working_days = rule.working_days_only

    if working_days:
        first_resp = add_working_minutes(start_time, first_resp_min)
        deadline = add_working_minutes(start_time, res_min)
    else:
        first_resp = start_time + timedelta(minutes=first_resp_min)
        deadline = start_time + timedelta(minutes=res_min)

    return first_resp, deadline


def calculate_estimated_completion(
    db: Session,
    request: Request,
) -> datetime | None:
    """Calculates realistic ETA based on historical resolution times and current department workload."""
    # Look up completed requests in the same category or service
    stmt = select(Request).where(
        Request.status == RequestStatus.completed,
        Request.resolved_at.is_not(None),
    )
    if request.service_id:
        stmt = stmt.where(Request.service_id == request.service_id)
    else:
        stmt = stmt.where(Request.category == request.category)

    completed_samples = list(db.scalars(stmt.order_by(Request.resolved_at.desc()).limit(30)))

    if len(completed_samples) >= 3:
        durations = [
            (c.resolved_at - c.created_at).total_seconds()
            for c in completed_samples
            if c.resolved_at and c.resolved_at > c.created_at
        ]
        if durations:
            durations.sort()
            median_seconds = durations[len(durations) // 2]

            # Workload multiplier based on open department requests
            open_count = db.scalar(
                select(func.count(Request.id)).where(
                    Request.department_id == request.department_id,
                    Request.status.in_([RequestStatus.pending, RequestStatus.assigned, RequestStatus.in_progress]),
                )
            ) or 1

            multiplier = 1.0 + (min(open_count, 50) * 0.01)  # 1% added per active ticket in dept, capped at 50%
            eta_seconds = median_seconds * multiplier
            return request.created_at + timedelta(seconds=eta_seconds)

    # Fallback to configured SLA deadline
    return request.sla_deadline


def evaluate_request_sla(db: Session, request: Request, now: datetime | None = None) -> SLAState:
    """Evaluates the SLA consumption and updates state/triggers notifications if thresholds are crossed."""
    if request.status in (RequestStatus.completed, RequestStatus.rejected, RequestStatus.cancelled):
        return request.sla_state

    if not request.sla_deadline:
        return SLAState.normal

    now = now or utcnow()
    total_duration = (request.sla_deadline - request.created_at).total_seconds()
    if total_duration <= 0:
        return SLAState.overdue

    elapsed = (now - request.created_at).total_seconds()
    ratio = elapsed / total_duration

    old_state = request.sla_state
    new_state = SLAState.normal

    if ratio >= 1.0:
        new_state = SLAState.overdue
    elif ratio >= settings.SLA_AT_RISK_THRESHOLD:
        new_state = SLAState.at_risk
    elif ratio >= settings.SLA_WARNING_THRESHOLD:
        new_state = SLAState.warning

    if new_state != old_state:
        request.sla_state = new_state
        
        if new_state == SLAState.warning:
            history_service.record(db, request, "SLA_WARNING", comment="70% of SLA time consumed.")
            if request.assigned_to_id:
                notification_service.notify(
                    db,
                    user_id=request.assigned_to_id,
                    title="SLA Warning",
                    message=f"Request {request.ticket_number} is at 70% SLA limit.",
                    type_=NotificationType.sla_warning,
                    entity_type="request",
                    entity_id=request.id,
                )

        elif new_state == SLAState.at_risk:
            history_service.record(db, request, "SLA_AT_RISK", comment="90% of SLA time consumed. At risk of breach.")
            if request.assigned_to_id:
                notification_service.notify(
                    db,
                    user_id=request.assigned_to_id,
                    title="SLA At Risk",
                    message=f"Request {request.ticket_number} is approaching SLA breach (90% elapsed).",
                    type_=NotificationType.sla_warning,
                    entity_type="request",
                    entity_id=request.id,
                )

        elif new_state == SLAState.overdue:
            request.status = RequestStatus.escalated
            request.escalated_at = now
            history_service.record(db, request, "ESCALATED", comment="SLA breached. Escalated to department head.")
            audit_service.log(db, "REQUEST_ESCALATED", "request", request.id, meta={"sla_ratio": ratio})

            # Notify staff and department heads
            dept_heads = user_repository.list_department_heads(db, request.department_id)
            head_ids = [h.id for h in dept_heads]
            target_ids = head_ids + ([request.assigned_to_id] if request.assigned_to_id else [])
            notification_service.notify_many(
                db,
                user_ids=target_ids,
                title="Request Escalated (SLA Breach)",
                message=f"Request {request.ticket_number} has breached SLA and is escalated.",
                type_=NotificationType.escalation,
                entity_type="request",
                entity_id=request.id,
            )

    return new_state


def monitor_all_open_slas(db: Session) -> int:
    """Periodic job inspecting all open requests."""
    from app.models.enums import OPEN_STATUSES
    open_requests = list(db.scalars(select(Request).where(Request.status.in_(OPEN_STATUSES))))
    count = 0
    now = utcnow()
    for req in open_requests:
        evaluate_request_sla(db, req, now)
        count += 1
    db.commit()
    return count
