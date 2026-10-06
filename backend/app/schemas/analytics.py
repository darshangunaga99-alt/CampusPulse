from typing import Literal

from pydantic import BaseModel

from app.models.enums import Category, Priority


class DashboardStats(BaseModel):
    total_requests: int
    pending: int
    in_progress: int
    completed: int
    overdue: int
    sla_compliance: float
    average_resolution_hours: float
    satisfaction_score: float
    campus_health_score: int


class DepartmentStats(BaseModel):
    department: str
    open_requests: int
    overdue: int
    average_resolution_hours: float
    sla_compliance: float


class MapPoint(BaseModel):
    building: str
    latitude: float | None
    longitude: float | None
    active_requests: int
    critical: int
    high: int
    health_score: int


class MonthlyCount(BaseModel):
    month: str  # YYYY-MM
    count: int


class RecurringIssue(BaseModel):
    category: Category
    subcategory: str | None
    building: str | None
    room: str | None
    total_occurrences: int
    monthly_counts: list[MonthlyCount]
    trend: Literal["increasing", "stable", "decreasing"]
    insight: str
    recommendation: str


class PreventiveRecommendation(BaseModel):
    task: str
    category: Category
    building: str | None
    room: str | None
    priority: Priority
    suggested_frequency: str
    reason: str
