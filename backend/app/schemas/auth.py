from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.enums import UserRole


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(examples=["usr_123"])
    name: str = Field(examples=["Rahul Kumar"])
    first_name: str | None = Field(default=None, examples=["Rahul"])
    middle_name: str | None = Field(default=None, examples=[""])
    last_name: str | None = Field(default=None, examples=["Kumar"])
    usn: str | None = Field(default=None, examples=["4XX22CS001"])
    course: str | None = Field(default=None, examples=["B.E."])
    phone_number: str | None = Field(default=None, examples=["+91 98765 43210"])
    email: str = Field(examples=["rahul@example.com"])
    role: UserRole
    department: str | None = Field(default=None, description="Department name (additive field, v1.1)")
    skills: list[str] = Field(default_factory=list)
    is_available: bool = True
    home_building: str | None = None


def user_out(user) -> UserOut:
    first_name = getattr(user, "first_name", None)
    middle_name = getattr(user, "middle_name", None)
    last_name = getattr(user, "last_name", None)

    # Only derive fallback if first_name, middle_name, and last_name are ALL None
    if first_name is None and middle_name is None and last_name is None and getattr(user, "name", None):
        parts = user.name.strip().split()
        if len(parts) == 1:
            first_name = parts[0]
        elif len(parts) == 2:
            first_name, last_name = parts[0], parts[1]
        elif len(parts) >= 3:
            first_name, middle_name, last_name = parts[0], " ".join(parts[1:-1]), parts[-1]

    return UserOut(
        id=user.id,
        name=user.name,
        first_name=first_name,
        middle_name=middle_name,
        last_name=last_name,
        usn=getattr(user, "usn", None),
        course=getattr(user, "course", None),
        phone_number=getattr(user, "phone_number", None),
        email=user.email,
        role=user.role,
        department=user.department.name if getattr(user, "department", None) else None,
        skills=getattr(user, "skills", []) or [],
        is_available=getattr(user, "is_available", True),
        home_building=getattr(user, "home_building", None),
    )


class UpdateProfileRequest(BaseModel):
    first_name: str | None = Field(default=None, max_length=60)
    middle_name: str | None = Field(default=None, max_length=60)
    last_name: str | None = Field(default=None, max_length=60)
    name: str | None = Field(default=None, min_length=1, max_length=120)
    usn: str | None = Field(default=None, max_length=30)
    course: str | None = Field(default=None, max_length=100)
    department: str | None = Field(default=None, max_length=100)
    email: EmailStr | None = None
    phone_number: str | None = Field(default=None, max_length=30)
    skills: list[str] | None = None
    is_available: bool | None = None
    home_building: str | None = None


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120, examples=["Rahul Kumar"])
    email: EmailStr = Field(examples=["rahul@example.com"])
    password: str = Field(min_length=8, max_length=72, examples=["SecurePassword123"])
    role: UserRole = UserRole.student
    department: str | None = Field(
        default=None, description="Department name or id. Only honoured for admin-created staff accounts."
    )

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr = Field(examples=["rahul@example.com"])
    password: str = Field(min_length=1, max_length=72, examples=["SecurePassword123"])


class AuthData(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
