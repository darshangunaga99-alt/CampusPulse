"""FastAPI dependencies: authentication, role checks and rate limiting."""
from collections.abc import Callable

from fastapi import Depends, Request as HttpRequest
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import AppError, AuthRequiredError, ForbiddenError
from app.core.security import decode_access_token
from app.models.enums import UserRole
from app.models.user import User
from app.utils.rate_limit import limiter

bearer_scheme = HTTPBearer(auto_error=False, description="JWT access token from /auth/login")


def _resolve_user(credentials: HTTPAuthorizationCredentials | None, db: Session) -> User | None:
    if credentials is None or credentials.scheme.lower() != "bearer":
        return None
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise AuthRequiredError("Invalid or expired token.")
    user = db.get(User, payload["sub"])
    if user is None or not user.is_active:
        raise AuthRequiredError("User account is not active.")
    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    user = _resolve_user(credentials, db)
    if user is None:
        raise AuthRequiredError()
    return user


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    return _resolve_user(credentials, db)


def require_roles(*roles: UserRole) -> Callable[..., User]:
    allowed = set(roles)

    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed:
            raise ForbiddenError(
                "Your role is not permitted to access this resource.",
                {"required_roles": sorted(r.value for r in allowed), "role": user.role.value},
            )
        return user

    return checker


# Roles that may write operational data (auditors are strictly read-only)
WRITE_ROLES = (UserRole.student, UserRole.staff, UserRole.department_head, UserRole.admin)
ANALYTICS_ROLES = (UserRole.department_head, UserRole.admin, UserRole.auditor)
OPERATOR_ROLES = (UserRole.staff, UserRole.department_head, UserRole.admin, UserRole.auditor)


def rate_limit(bucket: str, per_minute_setting: str) -> Callable[..., None]:
    def dependency(request: HttpRequest) -> None:
        if not settings.RATE_LIMIT_ENABLED:
            return
        client = request.client.host if request.client else "unknown"
        limit = getattr(settings, per_minute_setting)
        if not limiter.hit(f"{bucket}:{client}", limit, 60):
            raise AppError(429, "RATE_LIMITED", "Too many requests. Please try again shortly.")

    return dependency
