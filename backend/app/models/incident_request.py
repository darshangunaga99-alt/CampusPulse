from datetime import datetime

from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import UTCDateTime
from app.utils.time import utcnow


class IncidentRequest(Base):
    """Many-to-many link between incidents and the original student requests."""

    __tablename__ = "incident_requests"

    incident_id: Mapped[str] = mapped_column(ForeignKey("incidents.id"), primary_key=True)
    request_id: Mapped[str] = mapped_column(ForeignKey("requests.id"), primary_key=True, index=True)
    similarity: Mapped[float | None] = mapped_column(Float)
    linked_by: Mapped[str] = mapped_column(String(40), default="system", nullable=False)
    linked_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow, nullable=False)
