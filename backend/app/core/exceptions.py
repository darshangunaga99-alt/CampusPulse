"""Application exceptions mapped to the standard error envelope."""
from typing import Any


class AppError(Exception):
    def __init__(self, status_code: int, code: str, message: str, details: dict[str, Any] | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or {}


class NotFoundError(AppError):
    def __init__(self, code: str, message: str, details: dict | None = None):
        super().__init__(404, code, message, details)


class ForbiddenError(AppError):
    def __init__(self, message: str = "You do not have permission to perform this action.", details: dict | None = None):
        super().__init__(403, "FORBIDDEN", message, details)


class AuthRequiredError(AppError):
    def __init__(self, message: str = "Authentication required."):
        super().__init__(401, "AUTH_REQUIRED", message)


class ConflictError(AppError):
    def __init__(self, code: str, message: str, details: dict | None = None):
        super().__init__(409, code, message, details)


class BadRequestError(AppError):
    def __init__(self, code: str, message: str, details: dict | None = None):
        super().__init__(400, code, message, details)
