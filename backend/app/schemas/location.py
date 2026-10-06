from pydantic import BaseModel, Field


class LocationCodeOut(BaseModel):
    code: str = Field(examples=["CSE-BLOCK-F2-LAB2"])
    building: str
    floor: int | None = None
    room: str | None = None
    latitude: float | None = None
    longitude: float | None = None
