from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.department import Department
from app.models.enums import OPEN_INCIDENT_STATUSES
from app.models.incident import Incident, IncidentFollower
from app.models.incident_request import IncidentRequest
from app.models.request import Request
from app.utils.text import escape_like


def get_incident(db: Session, id_or_number: str) -> Incident | None:
    return db.scalar(
        select(Incident).where(or_(Incident.id == id_or_number, Incident.incident_number == id_or_number))
    )


def next_incident_number(db: Session, year: int) -> str:
    prefix = f"INC-{year}-"
    last = db.scalar(
        select(Incident.incident_number)
        .where(Incident.incident_number.like(f"{prefix}%"))
        .order_by(Incident.incident_number.desc())
        .limit(1)
    )
    seq = int(last.rsplit("-", 1)[1]) + 1 if last else 1
    return f"{prefix}{seq:04d}"


def linked_request_ids(db: Session, incident_id: str) -> list[str]:
    return list(
        db.scalars(
            select(IncidentRequest.request_id)
            .where(IncidentRequest.incident_id == incident_id)
            .order_by(IncidentRequest.linked_at, IncidentRequest.request_id)
        )
    )


def linked_requests(db: Session, incident_id: str) -> list[Request]:
    return list(
        db.scalars(
            select(Request)
            .join(IncidentRequest, IncidentRequest.request_id == Request.id)
            .where(IncidentRequest.incident_id == incident_id)
        )
    )


def incident_for_request(db: Session, request_id: str, open_only: bool = False) -> Incident | None:
    stmt = (
        select(Incident)
        .join(IncidentRequest, IncidentRequest.incident_id == Incident.id)
        .where(IncidentRequest.request_id == request_id)
        .order_by(Incident.created_at.desc())
    )
    if open_only:
        stmt = stmt.where(Incident.status.in_(OPEN_INCIDENT_STATUSES))
    return db.scalar(stmt.limit(1))


def incidents_for_requests(db: Session, request_ids: list[str]) -> dict[str, Incident]:
    if not request_ids:
        return {}
    rows = db.execute(
        select(IncidentRequest.request_id, Incident)
        .join(Incident, Incident.id == IncidentRequest.incident_id)
        .where(IncidentRequest.request_id.in_(request_ids))
    ).all()
    return {rid: inc for rid, inc in rows}


def open_incidents(db: Session, category=None, building_norm_match=None) -> list[Incident]:
    stmt = select(Incident).where(Incident.status.in_(OPEN_INCIDENT_STATUSES))
    if category:
        stmt = stmt.where(Incident.category == category)
    return list(db.scalars(stmt))


def is_following(db: Session, incident_id: str, user_id: str) -> bool:
    return db.get(IncidentFollower, (incident_id, user_id)) is not None


def follower_ids(db: Session, incident_id: str) -> list[str]:
    return list(db.scalars(select(IncidentFollower.user_id).where(IncidentFollower.incident_id == incident_id)))


def list_incidents(db: Session, *, status=None, priority=None, department=None, building=None, search=None,
                   page: int = 1, limit: int = 20) -> tuple[list[Incident], int]:
    stmt = select(Incident)
    if status:
        stmt = stmt.where(Incident.status == status)
    if priority:
        stmt = stmt.where(Incident.priority == priority)
    if department:
        stmt = stmt.join(Department, Department.id == Incident.department_id).where(
            or_(Department.id == department, func.lower(Department.name) == department.lower())
        )
    if building:
        stmt = stmt.where(func.lower(Incident.building) == building.lower())
    if search:
        term = f"%{escape_like(search.strip().lower())}%"
        stmt = stmt.where(
            or_(func.lower(Incident.title).like(term, escape="\\"),
                func.lower(Incident.incident_number).like(term, escape="\\"))
        )
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(stmt.order_by(Incident.created_at.desc()).offset((page - 1) * limit).limit(limit))
    return list(rows), total
