from datetime import datetime

from pydantic import BaseModel, Field


class FeedbackRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)
    resolved: bool


class FeedbackOut(BaseModel):
    id: str
    request_id: str
    rating: int
    comment: str | None
    resolved: bool
    created_at: datetime
