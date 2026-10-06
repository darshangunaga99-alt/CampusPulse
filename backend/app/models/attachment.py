from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import UTCDateTime, enum_col, id_column
from app.models.enums import AttachmentType
from app.utils.time import utcnow

if TYPE_CHECKING:
    from app.models.request import Request


class Attachment(Base):
    """Attachment metadata only. Binaries live in object storage (S3/GCS/etc.)."""

    __tablename__ = "attachments"

    id: Mapped[str] = id_column("att")
    request_id: Mapped[str] = mapped_column(ForeignKey("requests.id"), nullable=False, index=True)
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    type: Mapped[AttachmentType] = mapped_column(enum_col(AttachmentType, name="attachment_type"), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str | None] = mapped_column(String(100))
    size_bytes: Mapped[int | None] = mapped_column(Integer)
    uploaded_by: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow, nullable=False)

    request: Mapped["Request"] = relationship(back_populates="attachments")
