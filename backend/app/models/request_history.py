from datetime import datetime

from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import UTCDateTime, id_column
from app.models.user import User
from app.utils.time import utcnow


class RequestHistory(Base):
    """Immutable timeline event for a request. actor_id NULL means "System"."""

    __tablename__ = "request_history"

    id: Mapped[str] = id_column("hist")
    request_id: Mapped[str] = mapped_column(ForeignKey("requests.id"), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(40), nullable=False)  # e.g. REQUEST_CREATED
    action: Mapped[str] = mapped_column(String(120), nullable=False)  # human readable
    status: Mapped[str | None] = mapped_column(String(32))
    actor_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"))
    comment: Mapped[str | None] = mapped_column(Text)
    meta: Mapped[dict] = mapped_column("metadata", JSON, default=dict, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow, nullable=False, index=True)

    actor: Mapped[User | None] = relationship(lazy="selectin")
