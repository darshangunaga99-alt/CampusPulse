from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, enum_col, id_column
from app.models.enums import Category, Priority


class SLARule(Base, TimestampMixin):
    """SLA rule. Matching precedence (most specific wins):

    service+priority > service > category+priority > category > priority-only > global default.
    """

    __tablename__ = "sla_rules"

    id: Mapped[str] = id_column("sla")
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    service_id: Mapped[str | None] = mapped_column(ForeignKey("services.id"), index=True)
    category: Mapped[Category | None] = mapped_column(enum_col(Category, name="sla_category"))
    priority: Mapped[Priority | None] = mapped_column(enum_col(Priority, name="sla_priority"))
    first_response_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    resolution_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    working_days_only: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
