"""Service catalog routes.

GET /services
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.enums import Category
from app.models.service import Service
from app.schemas.common import ApiResponse, ERROR_RESPONSES, ok
from app.schemas.service import ServiceOut, service_out

router = APIRouter(prefix="/services", tags=["Services"], responses=ERROR_RESPONSES)


@router.get(
    "",
    response_model=ApiResponse[list[ServiceOut]],
)
def list_services(
    category: Category | None = Query(default=None, description="Filter by service category"),
    active: bool | None = Query(default=None, description="Filter by active status"),
    db: Session = Depends(get_db),
):
    stmt = select(Service)
    if category is not None:
        stmt = stmt.where(Service.category == category)
    if active is not None:
        stmt = stmt.where(Service.active == active)

    items = list(db.scalars(stmt.order_by(Service.name)))
    return ok([service_out(s) for s in items])
