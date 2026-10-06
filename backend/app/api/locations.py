"""Location routes (QR Code lookups).

GET /locations/{location_code}
"""
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import NotFoundError
from app.models.location import Location
from app.schemas.common import ApiResponse, ERROR_RESPONSES, ok
from app.schemas.location import LocationCodeOut

router = APIRouter(prefix="/locations", tags=["Locations"], responses=ERROR_RESPONSES)


@router.get(
    "/{location_code}",
    response_model=ApiResponse[LocationCodeOut],
)
def get_location_by_code(location_code: str, db: Session = Depends(get_db)):
    code_clean = location_code.strip()
    loc = db.scalar(select(Location).where(func.lower(Location.code) == code_clean.lower()))
    if not loc:
        raise NotFoundError("LOCATION_NOT_FOUND", f"Location code '{location_code}' was not found.")

    return ok(
        LocationCodeOut(
            code=loc.code,
            building=loc.building,
            floor=loc.floor,
            room=loc.room,
            latitude=loc.latitude,
            longitude=loc.longitude,
        )
    )
