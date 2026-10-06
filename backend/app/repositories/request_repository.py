from datetime import datetime

from sqlalchemy import Select, case, func, or_, select
from sqlalchemy.orm import Session

from app.models.department import Department
from app.models.enums import OPEN_STATUSES, Priority
from app.models.request import Request
from app.models.request_history import RequestHistory
from app.utils.text import escape_like

_PRIORITY_ORDER = case(
    (Request.priority == Priority.critical, 4),
    (Request.priority == Priority.high, 3),
    (Request.priority == Priority.medium, 2),
    else_=1,
)

SORTS = {
    "created_at_desc": [Request.created_at.desc()],
    "created_at_asc": [Request.created_at.asc()],
    "updated_at_desc": [Request.updated_at.desc()],
    "priority_desc": [_PRIORITY_ORDER.desc(), Request.created_at.asc()],
    "priority_asc": [_PRIORITY_ORDER.asc(), Request.created_at.asc()],
    "sla_deadline_asc": [Request.sla_deadline.asc(), Request.created_at.asc()],
}


def get_request(db: Session, id_or_ticket: str) -> Request | None:
    return db.scalar(select(Request).where(or_(Request.id == id_or_ticket, Request.ticket_number == id_or_ticket)))


def next_ticket_number(db: Session, year: int) -> str:
    prefix = f"REQ-{year}-"
    last = db.scalar(
        select(Request.ticket_number)
        .where(Request.ticket_number.like(f"{prefix}%"))
        .order_by(Request.ticket_number.desc())
        .limit(1)
    )
    seq = int(last.rsplit("-", 1)[1]) + 1 if last else 1
    return f"{prefix}{seq:06d}"


def apply_filters(
    stmt: Select,
    *,
    status=None,
    priority=None,
    category=None,
    department: str | None = None,
    assigned_to: str | None = None,
    building: str | None = None,
    search: str | None = None,
) -> Select:
    if status:
        stmt = stmt.where(Request.status == status)
    if priority:
        stmt = stmt.where(Request.priority == priority)
    if category:
        stmt = stmt.where(Request.category == category)
    if department:
        stmt = stmt.join(Department, Department.id == Request.department_id).where(
            or_(Department.id == department, func.lower(Department.name) == department.lower())
        )
    if assigned_to == "unassigned":
        stmt = stmt.where(Request.assigned_to_id.is_(None))
    elif assigned_to:
        stmt = stmt.where(Request.assigned_to_id == assigned_to)
    if building:
        stmt = stmt.where(func.lower(Request.building) == building.lower())
    if search:
        term = f"%{escape_like(search.strip().lower())}%"
        stmt = stmt.where(
            or_(
                func.lower(Request.title).like(term, escape="\\"),
                func.lower(Request.description).like(term, escape="\\"),
                func.lower(Request.ticket_number).like(term, escape="\\"),
            )
        )
    return stmt


def paginate(db: Session, stmt: Select, sort: str, page: int, limit: int) -> tuple[list[Request], int]:
    total = db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery())) or 0
    rows = db.scalars(stmt.order_by(*SORTS.get(sort, SORTS["created_at_desc"])).offset((page - 1) * limit).limit(limit))
    return list(rows), total


def recent_open_requests(db: Session, since: datetime, exclude_id: str | None = None, limit: int = 300) -> list[Request]:
    stmt = select(Request).where(Request.status.in_(OPEN_STATUSES), Request.created_at >= since)
    if exclude_id:
        stmt = stmt.where(Request.id != exclude_id)
    return list(db.scalars(stmt.order_by(Request.created_at.desc()).limit(limit)))


def timeline(db: Session, request_id: str) -> list[RequestHistory]:
    return list(
        db.scalars(
            select(RequestHistory)
            .where(RequestHistory.request_id == request_id)
            .order_by(RequestHistory.timestamp.asc(), RequestHistory.id.asc())
        )
    )
