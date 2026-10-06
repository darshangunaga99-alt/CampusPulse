from sqlalchemy import JSON, Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, enum_col, id_column
from app.models.department import Department
from app.models.enums import UserRole


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = id_column("usr")
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(enum_col(UserRole, name="user_role"), nullable=False, index=True)
    department_id: Mapped[str | None] = mapped_column(ForeignKey("departments.id"), index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Assignment-engine attributes (staff)
    skills: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    working_hours_start: Mapped[int] = mapped_column(Integer, default=9, nullable=False)  # campus-local hour
    working_hours_end: Mapped[int] = mapped_column(Integer, default=18, nullable=False)
    home_building: Mapped[str | None] = mapped_column(String(120))

    department: Mapped[Department | None] = relationship(lazy="joined")
