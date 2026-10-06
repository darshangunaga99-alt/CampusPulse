from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, enum_col, id_column
from app.models.department import Department
from app.models.enums import Category, Priority


class Service(Base, TimestampMixin):
    __tablename__ = "services"

    id: Mapped[str] = id_column("srv")
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[Category] = mapped_column(enum_col(Category, name="service_category"), nullable=False, index=True)
    subcategory: Mapped[str | None] = mapped_column(String(50))
    department_id: Mapped[str] = mapped_column(ForeignKey("departments.id"), nullable=False)
    default_priority: Mapped[Priority] = mapped_column(
        enum_col(Priority, name="service_priority"), default=Priority.medium, nullable=False
    )
    sla_hours: Mapped[int] = mapped_column(Integer, default=24, nullable=False)
    requires_document: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    department: Mapped[Department] = relationship(lazy="joined")
