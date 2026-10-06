"""Analytics and Intelligence routes.

GET /analytics/dashboard
GET /analytics/departments
GET /analytics/map
GET /analytics/recurring-issues
GET /analytics/preventive-recommendations
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.analytics import DashboardStats, DepartmentStats, MapPoint, PreventiveRecommendation, RecurringIssue
from app.schemas.common import ApiResponse, ERROR_RESPONSES, ok
from app.services import analytics_service, preventive_service

router = APIRouter(prefix="/analytics", tags=["Analytics"], responses=ERROR_RESPONSES)


@router.get(
    "/dashboard",
    response_model=ApiResponse[DashboardStats],
)
def get_dashboard(
    current_user: User = Depends(require_roles(UserRole.department_head, UserRole.admin, UserRole.auditor, UserRole.staff)),
    db: Session = Depends(get_db),
):
    stats = analytics_service.get_dashboard_stats(db)
    return ok(stats)


@router.get(
    "/departments",
    response_model=ApiResponse[list[DepartmentStats]],
)
def get_departments_breakdown(
    current_user: User = Depends(require_roles(UserRole.department_head, UserRole.admin, UserRole.auditor, UserRole.staff)),
    db: Session = Depends(get_db),
):
    stats = analytics_service.get_department_stats(db)
    return ok(stats)


@router.get(
    "/map",
    response_model=ApiResponse[list[MapPoint]],
)
def get_campus_map(
    current_user: User = Depends(require_roles(UserRole.department_head, UserRole.admin, UserRole.auditor, UserRole.staff, UserRole.student)),
    db: Session = Depends(get_db),
):
    points = analytics_service.get_campus_map_points(db)
    return ok(points)


@router.get(
    "/recurring-issues",
    response_model=ApiResponse[list[RecurringIssue]],
)
def get_recurring_issues(
    current_user: User = Depends(require_roles(UserRole.department_head, UserRole.admin, UserRole.auditor)),
    db: Session = Depends(get_db),
):
    issues = preventive_service.detect_recurring_issues(db)
    return ok(issues)


@router.get(
    "/preventive-recommendations",
    response_model=ApiResponse[list[PreventiveRecommendation]],
)
def get_preventive_recommendations(
    current_user: User = Depends(require_roles(UserRole.department_head, UserRole.admin, UserRole.auditor)),
    db: Session = Depends(get_db),
):
    recs = preventive_service.generate_preventive_recommendations(db)
    return ok(recs)
