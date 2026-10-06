"""Test fixtures and test client setup."""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Force testing configuration
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["JWT_SECRET"] = "test-secret-key-1234567890-super-secret-high-entropy-64-bytes-long!"
os.environ["SLA_MONITOR_ENABLED"] = "false"
os.environ["RATE_LIMIT_ENABLED"] = "false"

from app.core.database import Base, get_db
from app.core.security import create_access_token, hash_password
from app.main import app
from app.models.department import Department
from app.models.enums import Category, Priority, UserRole
from app.models.location import Location
from app.models.service import Service
from app.models.sla_rule import SLARule
from app.models.user import User

test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=test_engine, autoflush=False, expire_on_commit=False)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def seed_data(db):
    # Departments
    dept_it = Department(id="dept_it", name="IT Support", code="IT")
    dept_fac = Department(id="dept_fac", name="Facilities", code="FAC")
    db.add_all([dept_it, dept_fac])
    db.flush()

    # Users
    admin = User(
        id="usr_admin",
        name="Admin Test",
        email="admin@test.com",
        password_hash=hash_password("Password123!"),
        role=UserRole.admin,
        department_id=dept_it.id,
    )
    dept_head = User(
        id="usr_head",
        name="Head Test",
        email="head@test.com",
        password_hash=hash_password("Password123!"),
        role=UserRole.department_head,
        department_id=dept_it.id,
    )
    staff_it = User(
        id="usr_staff",
        name="Staff Test",
        email="staff@test.com",
        password_hash=hash_password("Password123!"),
        role=UserRole.staff,
        department_id=dept_it.id,
        skills=["network", "wifi"],
        home_building="Block B",
    )
    student1 = User(
        id="usr_student1",
        name="Student One",
        email="student1@test.com",
        password_hash=hash_password("Password123!"),
        role=UserRole.student,
    )
    student2 = User(
        id="usr_student2",
        name="Student Two",
        email="student2@test.com",
        password_hash=hash_password("Password123!"),
        role=UserRole.student,
    )
    auditor = User(
        id="usr_auditor",
        name="Auditor Test",
        email="auditor@test.com",
        password_hash=hash_password("Password123!"),
        role=UserRole.auditor,
    )
    db.add_all([admin, dept_head, staff_it, student1, student2, auditor])
    db.flush()

    # Location
    loc = Location(code="CSE-BLOCK-F2-LAB2", building="CSE Block", floor=2, room="Lab 2", latitude=12.9716, longitude=77.5946)
    db.add(loc)

    # Service
    srv = Service(
        id="srv_001",
        name="WiFi Support",
        category=Category.it_support,
        department_id=dept_it.id,
        default_priority=Priority.medium,
        sla_hours=8,
        active=True,
    )
    db.add(srv)

    # SLA Rule
    sla = SLARule(
        name="IT Standard",
        service_id=srv.id,
        category=Category.it_support,
        priority=Priority.medium,
        first_response_minutes=60,
        resolution_minutes=480,
        active=True,
    )
    db.add(sla)

    db.commit()
    return {
        "dept_it": dept_it,
        "dept_fac": dept_fac,
        "admin": admin,
        "head": dept_head,
        "staff": staff_it,
        "student1": student1,
        "student2": student2,
        "auditor": auditor,
        "service": srv,
        "location": loc,
    }


def auth_header(user: User) -> dict[str, str]:
    token = create_access_token(user.id, user.role.value)
    return {"Authorization": f"Bearer {token}"}
