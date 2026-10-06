"""Tests for Incident Engine and Multi-Request Clustering (API_CONTRACT §19, §20, §21 & Prompt #48)."""
from tests.conftest import auth_header


def test_incident_demo_clustering(client, seed_data):
    s1_headers = auth_header(seed_data["student1"])
    s2_headers = auth_header(seed_data["student2"])

    # 1. Student 1 reports WiFi outage in Block B
    r1 = client.post(
        "/api/v1/requests",
        headers=s1_headers,
        json={
            "title": "WiFi not working in Block B",
            "description": "WiFi is not working in Block B second floor.",
            "category": "it_support",
            "location": {"building": "Block B", "floor": 2, "room": "B204"},
        },
    )
    assert r1.status_code == 201
    req1_id = r1.json()["data"]["id"]

    # 2. Student 2 reports Internet connection down in Block B
    r2 = client.post(
        "/api/v1/requests",
        headers=s2_headers,
        json={
            "title": "Internet is down in Block B",
            "description": "Internet connection is down in Block B second floor.",
            "category": "it_support",
            "location": {"building": "Block B", "floor": 2, "room": "B204"},
        },
    )
    assert r2.status_code == 201
    req2_id = r2.json()["data"]["id"]

    # 3. Third report: WiFi failure in Block B
    r3 = client.post(
        "/api/v1/requests",
        headers=s1_headers,
        json={
            "title": "Cannot connect to college WiFi",
            "description": "WiFi network failure in Block B room 204.",
            "category": "it_support",
            "location": {"building": "Block B", "floor": 2, "room": "B204"},
        },
    )
    assert r3.status_code == 201
    data3 = r3.json()["data"]

    # At report 3 (threshold reached), incident should be detected and linked!
    assert data3["incident"] is not None
    inc_id = data3["incident"]["id"]
    inc_num = data3["incident"]["incident_number"]
    assert inc_num.startswith("INC-")

    # Fetch incident list
    list_res = client.get("/api/v1/incidents")
    assert list_res.status_code == 200
    items = list_res.json()["data"]["items"]
    assert any(i["id"] == inc_id for i in items)

    # Fetch incident detail
    detail_res = client.get(f"/api/v1/incidents/{inc_id}", headers=s1_headers)
    assert detail_res.status_code == 200
    inc_detail = detail_res.json()["data"]
    assert inc_detail["department"] == "IT Support"
    assert len(inc_detail["linked_requests"]) >= 2
    assert req1_id in inc_detail["linked_requests"] or req2_id in inc_detail["linked_requests"]

    # Follow incident
    follow_res = client.post(f"/api/v1/incidents/{inc_id}/follow", headers=s2_headers)
    assert follow_res.status_code == 200
    assert follow_res.json()["data"]["following"] is True

    # Traceability rule: original requests must still exist in the database!
    chk_r1 = client.get(f"/api/v1/requests/{req1_id}", headers=s1_headers)
    assert chk_r1.status_code == 200
    chk_r2 = client.get(f"/api/v1/requests/{req2_id}", headers=s2_headers)
    assert chk_r2.status_code == 200
