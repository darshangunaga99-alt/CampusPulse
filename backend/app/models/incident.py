from datetime import datetime

from sqlalchemy import JSON, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UTCDateTime, enum_col, id_column
from app.models.department import Department
from app.models.enums import Category, IncidentStatus, Priority
from app.utils.time import utcnow


class Incident(Base, TimestampMixin):
    """A campus incident groups many related student requests (never deletes them)."""

    __tablename__ = "incidents"

    id: Mapped[str] = id_column("inc")
    incident_number: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[IncidentStatus] = mapped_column(
        enum_col(IncidentStatus, name="incident_status"), default=IncidentStatus.detected, nullable=False, index=True
    )
    priority: Mapped[Priority] = mapped_column(enum_col(Priority, name="incident_priority"), nullable=False, index=True)
    priority_reason: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    category: Mapped[Category] = mapped_column(enum_col(Category, name="incident_category"), nullable=False)
    subcategory: Mapped[str | None] = mapped_column(String(50))
    department_id: Mapped[str] = mapped_column(ForeignKey("departments.id"), nullable=False, index=True)
    building: Mapped[str | None] = mapped_column(String(120), index=True)
    floor: Mapped[int | None] = mapped_column(Integer)
    room: Mapped[str | None] = mapped_column(String(120))
    affected_students: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(UTCDateTime())

    department: Mapped[Department] = relationship(lazy="selectin")


class IncidentFollower(Base):
    __tablename__ = "incident_followers"

    incident_id: Mapped[str] = mapped_column(ForeignKey("incidents.id"), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow, nullable=False)
