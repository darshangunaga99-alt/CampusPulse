"""Application configuration loaded from environment variables / .env file."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "CampusPulse API"
    APP_VERSION: str = "1.1.0"
    ENVIRONMENT: str = "development"
    API_PREFIX: str = "/api/v1"

    # Database. PostgreSQL is the production target; SQLite is supported for
    # zero-setup local development and the automated test-suite.
    DATABASE_URL: str = "sqlite:///./campuspulse_dev.db"
    AUTO_CREATE_TABLES: bool = False

    # Auth
    JWT_SECRET: str = "change-me-in-env-this-is-not-a-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    # Roles anyone may self-register as. Other roles require an admin token.
    SELF_REGISTER_ROLES: str = "student"

    # CORS – comma separated list
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174"

    # AI provider: none | gemini | openai
    AI_PROVIDER: str = "none"
    AI_API_KEY: str = ""
    AI_MODEL: str = ""
    AI_TIMEOUT_SECONDS: float = 8.0

    # SLA monitor
    SLA_MONITOR_ENABLED: bool = True
    SLA_MONITOR_INTERVAL_SECONDS: int = 60
    SLA_WARNING_THRESHOLD: float = 0.70
    SLA_AT_RISK_THRESHOLD: float = 0.90

    # Duplicate / incident engine
    DUPLICATE_WINDOW_HOURS: int = 72
    DUPLICATE_CONFIDENCE_THRESHOLD: float = 0.60
    INCIDENT_MIN_REPORTS: int = 3

    # Campus local time (used for working hours / working days). Default IST.
    CAMPUS_UTC_OFFSET_MINUTES: int = 330

    # Attachments (metadata only – binaries live in object storage)
    MAX_UPLOAD_SIZE_MB: int = 20
    MAX_ATTACHMENTS_PER_REQUEST: int = 5

    # Rate limiting (in-memory, per process)
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_AUTH_PER_MINUTE: int = 10
    RATE_LIMIT_AI_PER_MINUTE: int = 30

    @property
    def allowed_origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    @property
    def self_register_roles(self) -> set[str]:
        return {r.strip() for r in self.SELF_REGISTER_ROLES.split(",") if r.strip()}

    @property
    def is_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
