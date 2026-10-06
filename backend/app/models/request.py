from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UTCDateTime, enum_col, id_column
from app.models.department import Department
from app.models.enums import AssignmentType, Category, Priority, RequestStatus, SLAState
from app.models.service import Service
from app.models.user import User

if TYPE_CHECKING:
    from app.models.attachment import Attachment


class Request(Base, TimestampMixin):
    __tablename__ = "requests"

    id: Mapped[str] = id_column("req")
    ticket_number: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[Category] = mapped_column(enum_col(Category, name="request_category"), nullable=False, index=True)
    subcategory: Mapped[str | None] = mapped_column(String(50))
    priority: Mapped[Priority] = mapped_column(enum_col(Priority, name="request_priority"), nullable=False, index=True)
    priority_reason: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    status: Mapped[RequestStatus] = mapped_column(
        enum_col(RequestStatus, name="request_status"), default=RequestStatus.pending, nullable=False, index=True
    )

    student_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    service_id: Mapped[str | None] = mapped_column(ForeignKey("services.id"), index=True)
    department_id: Mapped[str] = mapped_column(ForeignKey("departments.id"), nullable=False, index=True)
    assigned_to_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), index=True)
    assignment_type: Mapped[AssignmentType | None] = mapped_column(enum_col(AssignmentType, name="assignment_type"))

    # Location snapshot (denormalised so history survives location edits)
    building: Mapped[str | None] = mapped_column(String(120), index=True)
    floor: Mapped[int | None] = mapped_column(Integer)
    room: Mapped[str | None] = mapped_column(String(120))
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    location_code: Mapped[str | None] = mapped_column(String(60))

    ai_summary: Mapped[str | None] = mapped_column(Text)
    ai_confidence: Mapped[float | None] = mapped_column(Float)

    # SLA
    first_response_deadline: Mapped[datetime | None] = mapped_column(UTCDateTime())
    sla_deadline: Mapped[datetime | None] = mapped_column(UTCDateTime(), index=True)
    first_response_at: Mapped[datetime | None] = mapped_column(UTCDateTime())
    sla_state: Mapped[SLAState] = mapped_column(
        enum_col(SLAState, name="sla_state"), default=SLAState.normal, nullable=False
    )
    escalated_at: Mapped[datetime | None] = mapped_column(UTCDateTime())
    resolved_at: Mapped[datetime | None] = mapped_column(UTCDateTime(), index=True)

    reopened_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    flagged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    student: Mapped[User] = relationship(foreign_keys=[student_id], lazy="selectin")
    assigned_to: Mapped[User | None] = relationship(foreign_keys=[assigned_to_id], lazy="selectin")
    department: Mapped[Department] = relationship(lazy="selectin")
    service: Mapped[Service | None] = relationship(lazy="selectin")
    attachments: Mapped[list["Attachment"]] = relationship(
        back_populates="request", lazy="selectin", cascade="all, delete-orphan"
    )
