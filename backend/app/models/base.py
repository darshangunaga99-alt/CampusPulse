"""Portable column types and mixins shared by all models."""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import TypeDecorator

from app.utils.time import ensure_utc, utcnow


class UTCDateTime(TypeDecorator):
    """Timezone-aware datetime that always round-trips as UTC (also on SQLite)."""

    impl = DateTime(timezone=True)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        return ensure_utc(value) if value is not None else None

    def process_result_value(self, value, dialect):
        return ensure_utc(value) if value is not None else None


def enum_col(enum_cls, **kw):
    """Store enums as VARCHAR + CHECK constraint (portable, migration-friendly)."""
    return SAEnum(
        enum_cls,
        native_enum=False,
        length=32,
        values_callable=lambda e: [m.value for m in e],
        validate_strings=True,
        **kw,
    )


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def id_column(prefix: str) -> Mapped[str]:
    return mapped_column(String(40), primary_key=True, default=lambda: new_id(prefix))


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow, nullable=False, index=True)
    updated_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow, onupdate=utcnow, nullable=False)
