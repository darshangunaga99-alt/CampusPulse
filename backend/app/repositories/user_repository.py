from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.department import Department
from app.models.enums import OPEN_STATUSES, Category, UserRole
from app.models.request import Request
from app.models.service import Service
from app.models.user import User

# Fallback category -> department routing when no catalog service matches.
CATEGORY_DEPARTMENT_DEFAULTS: dict[Category, str] = {
    Category.it_support: "IT",
    Category.lab_equipment: "IT",
    Category.maintenance: "Facilities",
    Category.library: "Library",
    Category.academic: "Academic Affairs",
    Category.administration: "Administration",
    Category.hostel: "Hostel",
    Category.transport: "Transport",
    Category.other: "Administration",
}


def get_user(db: Session, user_id: str) -> User | None:
    return db.get(User, user_id)


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(func.lower(User.email) == email.lower()))


def find_department(db: Session, name_or_id: str) -> Department | None:
    return db.scalar(
        select(Department).where(
            or_(Department.id == name_or_id, func.lower(Department.name) == name_or_id.lower(),
                func.lower(Department.code) == name_or_id.lower())
        )
    )


def department_for_category(db: Session, category: Category, subcategory: str | None = None) -> Department | None:
    """Business routing rule: catalog service for the category wins, else static default map."""
    stmt = select(Service).where(Service.category == category, Service.active.is_(True))
    services = list(db.scalars(stmt))
    if subcategory:
        for s in services:
            if s.subcategory == subcategory:
                return s.department
    if services:
        return services[0].department
    return find_department(db, CATEGORY_DEPARTMENT_DEFAULTS.get(category, "Administration"))


def list_staff(db: Session, department_id: str | None = None) -> list[User]:
    stmt = select(User).where(User.role == UserRole.staff, User.is_active.is_(True))
    if department_id:
        stmt = stmt.where(User.department_id == department_id)
    return list(db.scalars(stmt.order_by(User.id)))


def list_department_heads(db: Session, department_id: str) -> list[User]:
    return list(
        db.scalars(
            select(User).where(
                User.role == UserRole.department_head,
                User.department_id == department_id,
                User.is_active.is_(True),
            )
        )
    )


def list_admins(db: Session) -> list[User]:
    return list(db.scalars(select(User).where(User.role == UserRole.admin, User.is_active.is_(True))))


def open_workload(db: Session, staff_ids: list[str]) -> dict[str, list[Request]]:
    if not staff_ids:
        return {}
    rows = db.scalars(
        select(Request).where(Request.assigned_to_id.in_(staff_ids), Request.status.in_(OPEN_STATUSES))
    )
    out: dict[str, list[Request]] = {sid: [] for sid in staff_ids}
    for r in rows:
        out[r.assigned_to_id].append(r)
    return out
