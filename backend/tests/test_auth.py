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
