"""Shared response envelopes and common data types (see API_CONTRACT §3, §7, §29)."""
from typing import Any, Generic, Literal, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    success: Literal[True] = True
    data: T


class ErrorBody(BaseModel):
    code: str = Field(examples=["VALIDATION_ERROR"])
    message: str = Field(examples=["Invalid request data"])
    details: dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    success: Literal[False] = False
    error: ErrorBody


class Pagination(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int


class Paginated(BaseModel, Generic[T]):
    items: list[T]
    pagination: Pagination


class UserRef(BaseModel):
    """Minimal user reference (actor / assignee)."""

    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str


class LocationIn(BaseModel):
    building: str | None = Field(default=None, max_length=120)
    floor: int | None = Field(default=None, ge=-5, le=200)
    room: str | None = Field(default=None, max_length=120)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


class LocationOut(BaseModel):
    building: str | None = None
    floor: int | None = None
    room: str | None = None
    latitude: float | None = None
    longitude: float | None = None


def ok(data: Any) -> dict:
    return {"success": True, "data": data}


def make_pagination(page: int, limit: int, total: int) -> Pagination:
    return Pagination(page=page, limit=limit, total=total, total_pages=(total + limit - 1) // limit if limit else 0)


ERROR_RESPONSES: dict[int | str, dict[str, Any]] = {
    400: {"model": ErrorResponse, "description": "Bad request"},
    401: {"model": ErrorResponse, "description": "Authentication required / invalid token"},
    403: {"model": ErrorResponse, "description": "Insufficient permissions"},
    404: {"model": ErrorResponse, "description": "Resource not found"},
    409: {"model": ErrorResponse, "description": "Conflict"},
    422: {"model": ErrorResponse, "description": "Validation error"},
}
