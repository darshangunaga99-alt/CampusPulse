"""Tests for Analytics, Department Breakdown, Map, and Preventive Intelligence (API_CONTRACT §22, §23, §24 & Prompt #35-#40)."""
from tests.conftest import auth_header


def test_dashboard_analytics(client, seed_data):
    admin_headers = auth_header(seed_data["admin"])
    res = client.get("/api/v1/analytics/dashboard", headers=admin_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    data = body["data"]

    assert "total_requests" in data
    assert "pending" in data
    assert "in_progress" in data
    assert "completed" in data
    assert "overdue" in data
    assert "sla_compliance" in data
    assert "average_resolution_hours" in data
    assert "satisfaction_score" in data
    assert "campus_health_score" in data
    assert 0 <= data["campus_health_score"] <= 100


def test_departments_analytics(client, seed_data):
    head_headers = auth_header(seed_data["head"])
    res = client.get("/api/v1/analytics/departments", headers=head_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    depts = body["data"]
    assert len(depts) >= 2
    dept_names = [d["department"] for d in depts]
    assert "IT Support" in dept_names
    assert "Facilities" in dept_names


def test_campus_map_analytics(client, seed_data):
    s_headers = auth_header(seed_data["student1"])
    res = client.get("/api/v1/analytics/map", headers=s_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    points = body["data"]
    assert len(points) >= 1
    p = points[0]
    assert "building" in p
    assert "health_score" in p
    assert "active_requests" in p


def test_auditor_read_only_access(client, seed_data):
    auditor_headers = auth_header(seed_data["auditor"])

    # Auditor can view analytics dashboard
    res = client.get("/api/v1/analytics/dashboard", headers=auditor_headers)
    assert res.status_code == 200

    # Auditor can view departments breakdown
    dept_res = client.get("/api/v1/analytics/departments", headers=auditor_headers)
    assert dept_res.status_code == 200

    # Auditor can view recurring issues
    rec_res = client.get("/api/v1/analytics/recurring-issues", headers=auditor_headers)
    assert rec_res.status_code == 200

    # Auditor cannot create or modify requests
    bad_res = client.post(
        "/api/v1/requests/req_dummy/assign",
        headers=auditor_headers,
        json={"staff_id": seed_data["staff"].id},
    )
    assert bad_res.status_code == 403


def test_preventive_maintenance_recommendations(client, seed_data):
    admin_headers = auth_header(seed_data["admin"])
    res = client.get("/api/v1/analytics/preventive-recommendations", headers=admin_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    recs = body["data"]
    assert len(recs) >= 1
    assert "task" in recs[0]
    assert "reason" in recs[0]
