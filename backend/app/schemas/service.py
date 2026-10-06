from pydantic import BaseModel, Field

from app.models.enums import Category, Priority


class ServiceOut(BaseModel):
    id: str = Field(examples=["srv_001"])
    name: str = Field(examples=["Electrical Maintenance"])
    description: str | None = None
    category: Category
    department: str = Field(examples=["Facilities"])
    active: bool
    # Additive fields (v1.1)
    default_priority: Priority
    sla_hours: int
    requires_document: bool


def service_out(s) -> ServiceOut:
    return ServiceOut(
        id=s.id,
        name=s.name,
        description=s.description,
        category=s.category,
        department=s.department.name,
        active=s.active,
        default_priority=s.default_priority,
        sla_hours=s.sla_hours,
        requires_document=s.requires_document,
    )
