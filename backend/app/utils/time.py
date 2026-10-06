"""Time helpers. All timestamps are stored and returned in UTC."""
from datetime import datetime, timedelta, timezone

from app.core.config import settings


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(microsecond=0)


def ensure_utc(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def to_campus_local(dt: datetime) -> datetime:
    """Convert a UTC datetime to naive campus-local time (fixed offset)."""
    return (ensure_utc(dt) + timedelta(minutes=settings.CAMPUS_UTC_OFFSET_MINUTES)).replace(tzinfo=None)


def add_working_minutes(start: datetime, minutes: int) -> datetime:
    """Add `minutes` of elapsed time counting only working days (Mon–Fri, campus local).

    A "working day" is 24h of a weekday, so "2 working days" == 2880 minutes that
    skip Saturdays and Sundays. Deterministic and timezone-aware.
    """
    offset = timedelta(minutes=settings.CAMPUS_UTC_OFFSET_MINUTES)
    cur = ensure_utc(start) + offset  # campus local (still tz-tagged UTC for arithmetic)
    remaining = timedelta(minutes=minutes)
    while remaining > timedelta(0):
        next_midnight = (cur + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        if cur.weekday() >= 5:
            cur = next_midnight
            continue
        chunk = min(remaining, next_midnight - cur)
        cur += chunk
        remaining -= chunk
    return (cur - offset).replace(microsecond=0)
