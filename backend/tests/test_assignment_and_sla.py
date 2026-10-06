"""Tests for Smart Assignment and SLA Engine (API_CONTRACT §17, §31, §34)."""
from datetime import timedelta

from app.models.enums import RequestStatus, SLAState
from app.models.request import Request
from app.services import sla_service
from app.utils.time import utcnow
from tests.conftest import auth_header


def test_manual_assignment_by_dept_head(client, seed_data):
    s_headers = auth_header(seed_data["student1"])
    head_headers = auth_header(seed_data["head"])

    create_res = client.post(
        "/api/v1/requests",
        headers=s_headers,
        json={
            "title": "Need assignment",
            "description": "Please assign a technician.",
            "category": "it_support",
        },
    )
    req_id = create_res.json()["data"]["id"]

    # Dept head assigns to staff
    assign_res = client.post(
        f"/api/v1/requests/{req_id}/assign",
        headers=head_headers,
        json={"staff_id": seed_data["staff"].id},
    )
    assert assign_res.status_code == 200
    body = assign_res.json()
    assert body["success"] is True
    assert body["data"]["assigned_to"]["id"] == seed_data["staff"].id
    assert body["data"]["assignment_type"] == "manual"


def test_assignment_permission_denied_for_student(client, seed_data):
    s_headers = auth_header(seed_data["student1"])
    create_res = client.post(
        "/api/v1/requests",
        headers=s_headers,
        json={
            "title": "Student assign attempt",
            "description": "Student tries assigning.",
            "category": "it_support",
        },
    )
    req_id = create_res.json()["data"]["id"]

    # Student cannot assign
    bad_res = client.post(
        f"/api/v1/requests/{req_id}/assign",
        headers=s_headers,
        json={"staff_id": seed_data["staff"].id},
    )
    assert bad_res.status_code == 403
    assert bad_res.json()["error"]["code"] == "FORBIDDEN"


def test_sla_threshold_escalation(db, seed_data):
    now = utcnow()
    created_at = now - timedelta(hours=10)
    deadline = now - timedelta(hours=2)  # Overdue by 2 hours

    req = Request(
        ticket_number="REQ-2026-999999",
        title="Breached SLA Ticket",
        description="Ticket should be escalated due to elapsed SLA.",
        category=seed_data["service"].category,
        priority=seed_data["service"].default_priority,
        status=RequestStatus.in_progress,
        student_id=seed_data["student1"].id,
        department_id=seed_data["dept_it"].id,
        assigned_to_id=seed_data["staff"].id,
        created_at=created_at,
        sla_deadline=deadline,
        sla_state=SLAState.normal,
    )
    db.add(req)
    db.commit()

    # Evaluate SLA
    new_state = sla_service.evaluate_request_sla(db, req, now=now)
    db.commit()

    assert new_state == SLAState.overdue
    assert req.status == RequestStatus.escalated
    assert req.escalated_at is not None
