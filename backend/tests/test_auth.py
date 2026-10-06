"""Tests for Authentication endpoints (API_CONTRACT §8)."""
from tests.conftest import auth_header


def test_register_student_success(client, seed_data):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "New Student",
            "email": "newstudent@test.com",
            "password": "Password123!",
            "role": "student",
        },
    )
    assert res.status_code == 201
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["name"] == "New Student"
    assert data["user"]["email"] == "newstudent@test.com"
    assert data["user"]["role"] == "student"


def test_register_duplicate_email(client, seed_data):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Duplicate Student",
            "email": "student1@test.com",
            "password": "Password123!",
            "role": "student",
        },
    )
    assert res.status_code == 409
    body = res.json()
    assert body["success"] is False
    assert body["error"]["code"] == "EMAIL_ALREADY_EXISTS"


def test_register_disallowed_role(client, seed_data):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Malicious Admin",
            "email": "badadmin@test.com",
            "password": "Password123!",
            "role": "admin",
        },
    )
    assert res.status_code == 400
    body = res.json()
    assert body["success"] is False
    assert body["error"]["code"] == "ROLE_NOT_ALLOWED"


def test_login_success(client, seed_data):
    res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "student1@test.com",
            "password": "Password123!",
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert "access_token" in body["data"]
    assert body["data"]["user"]["email"] == "student1@test.com"


def test_login_invalid_password(client, seed_data):
    res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "student1@test.com",
            "password": "WrongPassword!",
        },
    )
    assert res.status_code == 400
    body = res.json()
    assert body["success"] is False
    assert body["error"]["code"] == "INVALID_CREDENTIALS"


def test_get_me_success(client, seed_data):
    headers = auth_header(seed_data["student1"])
    res = client.get("/api/v1/auth/me", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert body["data"]["id"] == seed_data["student1"].id
    assert body["data"]["role"] == "student"


def test_get_me_unauthorized(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401
    body = res.json()
    assert body["success"] is False
    assert body["error"]["code"] == "AUTH_REQUIRED"


def test_update_student_profile_success(client, seed_data):
    headers = auth_header(seed_data["student1"])
    res = client.patch(
        "/api/v1/auth/me",
        headers=headers,
        json={
            "first_name": "Rahul",
            "middle_name": "Kumar",
            "last_name": "Sharma",
            "usn": "4XX22CS001",
            "course": "B.E. Computer Science",
            "department": "Computer Science & Engineering",
            "phone_number": "+91 98765 43210",
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert data["name"] == "Rahul Kumar Sharma"
    assert data["first_name"] == "Rahul"
    assert data["middle_name"] == "Kumar"
    assert data["last_name"] == "Sharma"
    assert data["usn"] == "4XX22CS001"
    assert data["course"] == "B.E. Computer Science"
    assert data["department"] == "Computer Science & Engineering"
    assert data["phone_number"] == "+91 98765 43210"


def test_update_student_profile_first_name_required(client, seed_data):
    headers = auth_header(seed_data["student1"])
    res = client.patch(
        "/api/v1/auth/me",
        headers=headers,
        json={
            "first_name": "   ",
        },
    )
    assert res.status_code == 400
    body = res.json()
    assert body["success"] is False
    assert body["error"]["code"] == "INVALID_NAME"


def test_update_student_profile_clear_last_name(client, seed_data):
    headers = auth_header(seed_data["student1"])

    # 1. Set full name
    res1 = client.patch(
        "/api/v1/auth/me",
        headers=headers,
        json={
            "first_name": "Rahul",
            "middle_name": "Kumar",
            "last_name": "Sharma",
        },
    )
    assert res1.status_code == 200
    assert res1.json()["data"]["name"] == "Rahul Kumar Sharma"

    # 2. Clear middle_name
    res2 = client.patch(
        "/api/v1/auth/me",
        headers=headers,
        json={
            "first_name": "Rahul",
            "middle_name": "",
            "last_name": "Sharma",
        },
    )
    assert res2.status_code == 200
    assert res2.json()["data"]["name"] == "Rahul Sharma"
    assert res2.json()["data"]["middle_name"] is None
    assert res2.json()["data"]["last_name"] == "Sharma"

    # 3. Clear last_name
    res3 = client.patch(
        "/api/v1/auth/me",
        headers=headers,
        json={
            "first_name": "Rahul",
            "middle_name": "",
            "last_name": "",
        },
    )
    assert res3.status_code == 200
    assert res3.json()["data"]["name"] == "Rahul"
    assert res3.json()["data"]["first_name"] == "Rahul"
    assert res3.json()["data"]["middle_name"] is None
    assert res3.json()["data"]["last_name"] is None

    # 4. Verify GET /me confirms persistence of cleared fields
    res4 = client.get("/api/v1/auth/me", headers=headers)
    assert res4.status_code == 200
    data4 = res4.json()["data"]
    assert data4["name"] == "Rahul"
    assert data4["first_name"] == "Rahul"
    assert data4["middle_name"] is None
    assert data4["last_name"] is None
