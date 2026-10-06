from datetime import datetime

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import UTCDateTime, id_column
from app.utils.time import utcnow


class AuditLog(Base):
    """Append-only audit trail. No API exists to modify or delete rows."""

    __tablename__ = "audit_logs"

    id: Mapped[str] = id_column("audit")
    actor_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), index=True)  # NULL = System
    action: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    entity: Mapped[str] = mapped_column(String(40), nullable=False)
    entity_id: Mapped[str | None] = mapped_column(String(40), index=True)
    timestamp: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow, nullable=False, index=True)
    meta: Mapped[dict] = mapped_column("metadata", JSON, default=dict, nullable=False)
