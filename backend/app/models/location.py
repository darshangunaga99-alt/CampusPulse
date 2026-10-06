from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, id_column


class Location(Base, TimestampMixin):
    """Physical campus location. `code` is the safe identifier embedded in QR codes."""

    __tablename__ = "locations"

    id: Mapped[str] = id_column("loc")
    code: Mapped[str] = mapped_column(String(60), unique=True, index=True, nullable=False)
    building: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    floor: Mapped[int | None] = mapped_column(Integer)
    room: Mapped[str | None] = mapped_column(String(120))
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
