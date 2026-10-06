"""Main FastAPI application for CampusPulse.

Base path: /api/v1
Docs:      /docs
OpenAPI:   /openapi.json
"""
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request as HttpRequest, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.analytics import router as analytics_router
from app.api.auth import router as auth_router
from app.api.incidents import router as incidents_router
from app.api.locations import router as locations_router
from app.api.notifications import router as notifications_router
from app.api.requests import router as requests_router
from app.api.services import router as services_router
from app.api.staff import router as staff_router
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.exceptions import AppError
from app.schemas.common import ErrorBody, ErrorResponse
from app.services import sla_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
log = logging.getLogger("campuspulse")


async def sla_monitor_background_loop():
    """Background task running every N seconds to check for approaching SLA breaches."""
    if not settings.SLA_MONITOR_ENABLED:
        return
    log.info("Starting SLA background monitor...")
    while True:
        try:
            await asyncio.sleep(settings.SLA_MONITOR_INTERVAL_SECONDS)
            db = SessionLocal()
            try:
                sla_service.monitor_all_open_slas(db)
            finally:
                db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            log.exception("Error in SLA monitor cycle: %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables if running with SQLite in dev
    if settings.AUTO_CREATE_TABLES or settings.is_sqlite:
        log.info("Initializing database tables...")
        Base.metadata.create_all(bind=engine)

    # Start SLA monitor loop in background
    monitor_task = asyncio.create_task(sla_monitor_background_loop())
    yield
    monitor_task.cancel()
    try:
        await monitor_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="CampusPulse — Intelligent Campus Incident & Service Operations Platform",
    description="Production REST API and Business Intelligence Engine for CampusPulse.",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Standard Error Envelopes (API_CONTRACT §3 & §7)
@app.exception_handler(AppError)
async def app_error_handler(request: HttpRequest, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            success=False,
            error=ErrorBody(
                code=exc.code,
                message=exc.message,
                details=exc.details,
            ),
        ).model_dump(),
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: HttpRequest, exc: RequestValidationError):
    errors = {}
    for err in exc.errors():
        loc = ".".join(str(p) for p in err.get("loc", []) if p != "body")
        errors[loc or "body"] = err.get("msg", "Invalid value")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            success=False,
            error=ErrorBody(
                code="VALIDATION_ERROR",
                message="Invalid request data.",
                details=errors,
            ),
        ).model_dump(),
    )


@app.exception_handler(HTTPException)
async def http_error_handler(request: HttpRequest, exc: HTTPException):
    code_map = {
        400: "BAD_REQUEST",
        401: "AUTH_REQUIRED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
        429: "RATE_LIMITED",
    }
    code = code_map.get(exc.status_code, "HTTP_ERROR")
    msg = str(exc.detail) if exc.detail else "An HTTP error occurred."
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            success=False,
            error=ErrorBody(
                code=code,
                message=msg,
                details={},
            ),
        ).model_dump(),
    )


@app.exception_handler(Exception)
async def general_error_handler(request: HttpRequest, exc: Exception):
    log.exception("Unhandled server exception: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            success=False,
            error=ErrorBody(
                code="INTERNAL_ERROR",
                message="An unexpected internal server error occurred.",
                details={},
            ),
        ).model_dump(),
    )


# Mount all API routers under /api/v1
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(services_router, prefix=settings.API_PREFIX)
app.include_router(requests_router, prefix=settings.API_PREFIX)
app.include_router(staff_router, prefix=settings.API_PREFIX)
app.include_router(incidents_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(notifications_router, prefix=settings.API_PREFIX)
app.include_router(locations_router, prefix=settings.API_PREFIX)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
