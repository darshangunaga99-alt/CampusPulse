"""Authentication routes.

POST /auth/register
POST /auth/login
GET  /auth/me
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user, rate_limit
from app.core.exceptions import BadRequestError, ConflictError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.enums import UserRole
from app.models.user import User
from app.repositories import user_repository
from app.schemas.auth import AuthData, LoginRequest, RegisterRequest, UserOut, user_out
from app.schemas.common import ApiResponse, ERROR_RESPONSES, ok
from app.services import audit_service

router = APIRouter(prefix="/auth", tags=["Authentication"], responses=ERROR_RESPONSES)


@router.post(
    "/register",
    response_model=ApiResponse[AuthData],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit("auth", "RATE_LIMIT_AUTH_PER_MINUTE"))],
)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = user_repository.get_user_by_email(db, body.email)
    if existing:
        raise ConflictError("EMAIL_ALREADY_EXISTS", "A user with this email address already exists.")

    # Restrict self-registration to allowed roles (default: student only)
    if body.role.value not in settings.self_register_roles:
        raise BadRequestError(
            "ROLE_NOT_ALLOWED",
            f"Registration for role '{body.role.value}' is restricted. Contact a campus administrator.",
        )

    # Optional department lookup if provided
    dept_id = None
    if body.department:
        dept = user_repository.find_department(db, body.department)
        if dept:
            dept_id = dept.id

    user = User(
        name=body.name,
        email=body.email.lower(),
        password_hash=hash_password(body.password),
        role=body.role,
        department_id=dept_id,
        is_active=True,
    )
    db.add(user)
    db.flush()

    audit_service.log(db, "USER_REGISTERED", "user", user.id, actor_id=user.id)
    token = create_access_token(user_id=user.id, role=user.role.value)
    db.commit()

    return ok(
        AuthData(
            access_token=token,
            token_type="bearer",
            user=user_out(user),
        )
    )


@router.post(
    "/login",
    response_model=ApiResponse[AuthData],
    dependencies=[Depends(rate_limit("auth", "RATE_LIMIT_AUTH_PER_MINUTE"))],
)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = user_repository.get_user_by_email(db, body.email)
    if not user or not verify_password(body.password, user.password_hash):
        raise BadRequestError("INVALID_CREDENTIALS", "Invalid email or password.")

    if not user.is_active:
        raise BadRequestError("ACCOUNT_INACTIVE", "Your account has been deactivated.")

    token = create_access_token(user_id=user.id, role=user.role.value)
    audit_service.log(db, "USER_LOGIN", "user", user.id, actor_id=user.id)
    db.commit()

    return ok(
        AuthData(
            access_token=token,
            token_type="bearer",
            user=user_out(user),
        )
    )


@router.get(
    "/me",
    response_model=ApiResponse[UserOut],
)
def me(current_user: User = Depends(get_current_user)):
    return ok(user_out(current_user))
