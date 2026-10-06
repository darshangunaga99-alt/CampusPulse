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
from app.schemas.auth import AuthData, LoginRequest, RegisterRequest, UpdateProfileRequest, UserOut, user_out
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


@router.patch(
    "/me",
    response_model=ApiResponse[UserOut],
)
def update_profile(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fields_set = body.model_fields_set

    if "first_name" in fields_set:
        fn = (body.first_name or "").strip()
        if not fn:
            raise BadRequestError("INVALID_NAME", "First name is required.")
        current_user.first_name = fn

    if "middle_name" in fields_set:
        mn = (body.middle_name or "").strip()
        current_user.middle_name = mn or None

    if "last_name" in fields_set:
        ln = (body.last_name or "").strip()
        current_user.last_name = ln or None

    # Sync full name from components whenever any name field is updated
    if any(k in fields_set for k in ("first_name", "middle_name", "last_name")):
        name_parts = [p for p in [current_user.first_name, current_user.middle_name, current_user.last_name] if p]
        current_user.name = " ".join(name_parts) if name_parts else (current_user.first_name or "")
    elif "name" in fields_set and body.name:
        current_user.name = body.name.strip()

    if "usn" in fields_set:
        current_user.usn = (body.usn or "").strip().upper() or None

    if "course" in fields_set:
        current_user.course = (body.course or "").strip() or None

    if "phone_number" in fields_set:
        current_user.phone_number = (body.phone_number or "").strip() or None

    if "email" in fields_set and body.email:
        new_email = body.email.lower().strip()
        if new_email != current_user.email.lower():
            existing = user_repository.get_user_by_email(db, new_email)
            if existing and existing.id != current_user.id:
                raise ConflictError("EMAIL_ALREADY_EXISTS", "A user with this email address already exists.")
            current_user.email = new_email

    if "department" in fields_set:
        dept_name = (body.department or "").strip()
        if dept_name:
            dept = user_repository.find_department(db, dept_name)
            if not dept:
                from app.models.department import Department
                dept_code = "".join([w[0] for w in dept_name.split() if w])[:10].upper() or "DEPT"
                dept = Department(name=dept_name, code=dept_code, description=f"{dept_name} Department")
                db.add(dept)
                db.flush()
            current_user.department_id = dept.id
            current_user.department = dept
        else:
            current_user.department_id = None
            current_user.department = None

    if "skills" in fields_set and body.skills is not None:
        current_user.skills = body.skills
    if "is_available" in fields_set and body.is_available is not None:
        current_user.is_available = body.is_available
    if "home_building" in fields_set:
        current_user.home_building = (body.home_building or "").strip() or None

    db.commit()
    db.refresh(current_user)
    audit_service.log(db, "PROFILE_UPDATED", "user", current_user.id, actor_id=current_user.id)
    return ok(user_out(current_user))

