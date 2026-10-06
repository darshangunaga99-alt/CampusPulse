from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.enums import UserRole


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(examples=["usr_123"])
    name: str = Field(examples=["Rahul Kumar"])
    email: str = Field(examples=["rahul@example.com"])
    role: UserRole
    department: str | None = Field(default=None, description="Department name (additive field, v1.1)")


def user_out(user) -> UserOut:
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        department=user.department.name if user.department else None,
    )


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
