"""Tests for AI Request Analysis, Duplicate Detection, Creation, Timeline, Status, and Feedback."""
from tests.conftest import auth_header


def test_ai_request_analysis(client, seed_data):
    res = client.post(
        "/api/v1/requests/analyze",
        json={
            "description": "Projector in CSE Lab 2 is not working and we have a presentation tomorrow.",
            "location": {
                "building": "CSE Block",
                "floor": 2,
                "room": "Lab 2",
            },
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert data["category"] == "lab_equipment"
    assert data["subcategory"] == "projector"
    assert data["priority"] in ["high", "medium", "critical"]
    assert data["confidence"] > 0.5
    assert len(data["reason"]) >= 1


def test_check_duplicates_empty(client, seed_data):
    res = client.post(
        "/api/v1/requests/check-duplicates",
        json={
            "description": "WiFi is down in Block B second floor.",
            "category": "it_support",
            "location": {"building": "Block B"},
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert body["data"]["duplicate_found"] is False


def test_create_request_success(client, seed_data):
    headers = auth_header(seed_data["student1"])
    res = client.post(
        "/api/v1/requests",
        headers=headers,
        json={
            "title": "WiFi not connecting in CSE Block",
            "description": "Cannot connect to college internet in CSE Lab 2.",
            "category": "it_support",
            "service_id": seed_data["service"].id,
            "location": {
                "building": "CSE Block",
                "floor": 2,
                "room": "Lab 2",
            },
        },
    )
    assert res.status_code == 201
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert data["id"].startswith("req_")
    assert data["ticket_number"].startswith("REQ-")
    assert data["status"] in ["pending", "assigned"]
    assert data["sla_deadline"] is not None
    assert data["department"] == "IT Support"


def test_get_my_requests(client, seed_data):
    headers1 = auth_header(seed_data["student1"])
    headers2 = auth_header(seed_data["student2"])

    # Create request for student 1
    client.post(
        "/api/v1/requests",
        headers=headers1,
        json={
            "title": "Broken fan",
            "description": "Ceiling fan making strange noise in Lab 2.",
            "category": "maintenance",
        },
    )

    # Student 1 sees 1 request
    res1 = client.get("/api/v1/requests/my", headers=headers1)
    assert res1.status_code == 200
    assert res1.json()["data"]["pagination"]["total"] == 1

    # Student 2 sees 0 requests
    res2 = client.get("/api/v1/requests/my", headers=headers2)
    assert res2.status_code == 200
    assert res2.json()["data"]["pagination"]["total"] == 0


def test_request_ownership_authorization(client, seed_data):
    headers1 = auth_header(seed_data["student1"])
    headers2 = auth_header(seed_data["student2"])

    create_res = client.post(
        "/api/v1/requests",
        headers=headers1,
        json={
            "title": "Private student ticket",
            "description": "Student 1 ticket details.",
            "category": "it_support",
        },
    )
    req_id = create_res.json()["data"]["id"]

    # Student 1 can access
    ok_res = client.get(f"/api/v1/requests/{req_id}", headers=headers1)
    assert ok_res.status_code == 200

    # Student 2 is forbidden
    forbidden_res = client.get(f"/api/v1/requests/{req_id}", headers=headers2)
    assert forbidden_res.status_code == 403
    assert forbidden_res.json()["error"]["code"] == "FORBIDDEN"


def test_request_timeline(client, seed_data):
    headers = auth_header(seed_data["student1"])
    create_res = client.post(
        "/api/v1/requests",
        headers=headers,
        json={
            "title": "Timeline check",
            "description": "Checking timeline event logging.",
            "category": "it_support",
        },
    )
    req_id = create_res.json()["data"]["id"]

    t_res = client.get(f"/api/v1/requests/{req_id}/timeline", headers=headers)
    assert t_res.status_code == 200
    events = t_res.json()["data"]
    assert len(events) >= 2
    actions = [e["action"] for e in events]
    assert "Request created" in actions


def test_status_update_and_feedback_reopen(client, seed_data):
    s_headers = auth_header(seed_data["student1"])
    staff_headers = auth_header(seed_data["staff"])

    create_res = client.post(
        "/api/v1/requests",
        headers=s_headers,
        json={
            "title": "Status lifecycle ticket",
            "description": "Testing transitions and resolution feedback.",
            "category": "it_support",
        },
    )
    req_id = create_res.json()["data"]["id"]

    # Staff marks in_progress
    patch1 = client.patch(
        f"/api/v1/requests/{req_id}/status",
        headers=staff_headers,
        json={"status": "in_progress", "comment": "Started diagnostic inspection."},
    )
    assert patch1.status_code == 200
    assert patch1.json()["data"]["status"] == "in_progress"

    # Staff marks completed
    patch2 = client.patch(
        f"/api/v1/requests/{req_id}/status",
        headers=staff_headers,
        json={"status": "completed", "comment": "Issue fixed successfully."},
    )
    assert patch2.status_code == 200
    assert patch2.json()["data"]["status"] == "completed"

    # Student submits negative feedback (resolved=False) -> should trigger auto-reopen!
    fb_res = client.post(
        f"/api/v1/requests/{req_id}/feedback",
        headers=s_headers,
        json={"rating": 1, "comment": "Still not working after technician left.", "resolved": False},
    )
    assert fb_res.status_code == 200

    # Verify request was reopened to in_progress
    req_res = client.get(f"/api/v1/requests/{req_id}", headers=s_headers)
    assert req_res.json()["data"]["status"] == "in_progress"
