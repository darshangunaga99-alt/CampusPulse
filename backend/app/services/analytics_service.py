"""Analytics calculation engine.

Calculates real values from database records:
- Dashboard KPI cards
- Department breakdown
- Campus map health score per building
- Transparent campus health score formula:
  Starts at 100, then:
  - SLA Compliance weight: 35%
  - Satisfaction score weight: 25%
  - Overdue penalty: -2 points per overdue ticket (up to -20)
  - Critical active tickets penalty: -5 points per critical active ticket (up to -20)
"""
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.department import Department
from app.models.enums import Priority, RequestStatus, SLAState
from app.models.feedback import Feedback
from app.models.location import Location
from app.models.request import Request
from app.schemas.analytics import DashboardStats, DepartmentStats, MapPoint


def calculate_campus_health_score(
    sla_compliance: float,
    satisfaction_score: float,
    overdue_count: int,
    critical_active: int,
) -> int:
    """Deterministic, transparent campus health score formula (0 - 100).

    Base score calculation:
    - SLA factor: (sla_compliance / 100.0) * 40 points
    - Satisfaction factor: (satisfaction_score / 5.0) * 30 points
    - Base operational health: 30 points
    Penalties:
    - Overdue tickets: -2 points each (capped at 15 points)
    - Active critical tickets: -4 points each (capped at 15 points)
    """
    sla_points = (min(100.0, max(0.0, sla_compliance)) / 100.0) * 40.0
    sat_points = (min(5.0, max(1.0, satisfaction_score)) / 5.0) * 30.0
    base_ops = 30.0

    penalties = min(15.0, overdue_count * 2.0) + min(15.0, critical_active * 4.0)
    score = int(round(sla_points + sat_points + base_ops - penalties))
    return max(0, min(100, score))


def get_dashboard_stats(db: Session) -> DashboardStats:
    total_requests = db.scalar(select(func.count(Request.id))) or 0
    pending = db.scalar(select(func.count(Request.id)).where(Request.status == RequestStatus.pending)) or 0
    in_progress = db.scalar(select(func.count(Request.id)).where(Request.status == RequestStatus.in_progress)) or 0
    completed = db.scalar(select(func.count(Request.id)).where(Request.status == RequestStatus.completed)) or 0

    # Overdue count: requests with sla_state == overdue or (open and sla_deadline < now)
    overdue = db.scalar(
        select(func.count(Request.id)).where(
            Request.status.in_([RequestStatus.pending, RequestStatus.assigned, RequestStatus.in_progress, RequestStatus.escalated]),
            Request.sla_state == SLAState.overdue,
        )
    ) or 0

    # Completed requests SLA compliance
    completed_rows = list(
        db.scalars(
            select(Request).where(
                Request.status == RequestStatus.completed,
                Request.resolved_at.is_not(None),
            )
        )
    )

    if completed_rows:
        within_sla = sum(
            1 for r in completed_rows if r.sla_deadline and r.resolved_at and r.resolved_at <= r.sla_deadline
        )
        sla_compliance = round((within_sla / len(completed_rows)) * 100.0, 1)

        durations_hours = [
            (r.resolved_at - r.created_at).total_seconds() / 3600.0
            for r in completed_rows
            if r.resolved_at and r.resolved_at > r.created_at
        ]
        avg_res_hours = round(sum(durations_hours) / len(durations_hours), 1) if durations_hours else 0.0
    else:
        sla_compliance = 100.0 if total_requests == 0 else 0.0
        avg_res_hours = 0.0

    # Student satisfaction score
    avg_rating = db.scalar(select(func.avg(Feedback.rating)))
    satisfaction_score = round(float(avg_rating), 1) if avg_rating is not None else 4.5

    # Critical active tickets
    critical_active = db.scalar(
        select(func.count(Request.id)).where(
            Request.status.in_([RequestStatus.pending, RequestStatus.assigned, RequestStatus.in_progress, RequestStatus.escalated]),
            Request.priority == Priority.critical,
        )
    ) or 0

    campus_health = calculate_campus_health_score(
        sla_compliance=sla_compliance,
        satisfaction_score=satisfaction_score,
        overdue_count=overdue,
        critical_active=critical_active,
    )

    return DashboardStats(
        total_requests=total_requests,
        pending=pending,
        in_progress=in_progress,
        completed=completed,
        overdue=overdue,
        sla_compliance=sla_compliance,
        average_resolution_hours=avg_res_hours,
        satisfaction_score=satisfaction_score,
        campus_health_score=campus_health,
    )


def get_department_stats(db: Session) -> list[DepartmentStats]:
    departments = list(db.scalars(select(Department).order_by(Department.name)))
    results: list[DepartmentStats] = []

    for dept in departments:
        open_requests = db.scalar(
            select(func.count(Request.id)).where(
                Request.department_id == dept.id,
                Request.status.in_([RequestStatus.pending, RequestStatus.assigned, RequestStatus.in_progress, RequestStatus.escalated]),
            )
        ) or 0

        dept_overdue = db.scalar(
            select(func.count(Request.id)).where(
                Request.department_id == dept.id,
                Request.status.in_([RequestStatus.pending, RequestStatus.assigned, RequestStatus.in_progress, RequestStatus.escalated]),
                Request.sla_state == SLAState.overdue,
            )
        ) or 0

        completed = list(
            db.scalars(
                select(Request).where(
                    Request.department_id == dept.id,
                    Request.status == RequestStatus.completed,
                    Request.resolved_at.is_not(None),
                )
            )
        )

        if completed:
            within_sla = sum(
                1 for r in completed if r.sla_deadline and r.resolved_at and r.resolved_at <= r.sla_deadline
            )
            sla_comp = round((within_sla / len(completed)) * 100.0, 1)

            durations = [
                (r.resolved_at - r.created_at).total_seconds() / 3600.0
                for r in completed
                if r.resolved_at and r.resolved_at > r.created_at
            ]
            avg_res = round(sum(durations) / len(durations), 1) if durations else 0.0
        else:
            sla_comp = 100.0 if open_requests == 0 else 0.0
            avg_res = 0.0

        results.append(
            DepartmentStats(
                department=dept.name,
                open_requests=open_requests,
                overdue=dept_overdue,
                average_resolution_hours=avg_res,
                sla_compliance=sla_comp,
            )
        )

    return results


def get_campus_map_points(db: Session) -> list[MapPoint]:
    # Distinct buildings from Location registry and Request history
    buildings_loc = {
        loc.building: (loc.latitude, loc.longitude)
        for loc in db.scalars(select(Location))
        if loc.building
    }

    # All active requests
    active_requests = list(
        db.scalars(
            select(Request).where(
                Request.status.in_([RequestStatus.pending, RequestStatus.assigned, RequestStatus.in_progress, RequestStatus.escalated])
            )
        )
    )

    # Group by building
    grouped: dict[str, list[Request]] = {}
    for r in active_requests:
        b = r.building or "Main Campus"
        grouped.setdefault(b, []).append(r)

    # Ensure registered buildings show up even if 0 requests
    for b in buildings_loc.keys():
        if b not in grouped:
            grouped[b] = []

    points: list[MapPoint] = []
    for building, reqs in grouped.items():
        lat, lon = buildings_loc.get(building, (None, None))
        if lat is None and reqs:
            # Check if any request in that building had lat/lon
            for r in reqs:
                if r.latitude is not None and r.longitude is not None:
                    lat, lon = r.latitude, r.longitude
                    break

        active_count = len(reqs)
        critical_count = sum(1 for r in reqs if r.priority == Priority.critical)
        high_count = sum(1 for r in reqs if r.priority == Priority.high)

        # Health score for this building (100 down based on active incidents and criticals)
        health = 100 - (critical_count * 15) - (high_count * 8) - (active_count * 2)
        health = max(10, min(100, health))

        points.append(
            MapPoint(
                building=building,
                latitude=lat,
                longitude=lon,
                active_requests=active_count,
                critical=critical_count,
                high=high_count,
                health_score=health,
            )
        )

    points.sort(key=lambda p: p.building)
    return points
