"""Tests for Services Catalog and QR Location lookup (API_CONTRACT §9, §28)."""


def test_get_services(client, seed_data):
    res = client.get("/api/v1/services")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert isinstance(body["data"], list)
    assert len(body["data"]) >= 1
    srv = body["data"][0]
    assert srv["name"] == "WiFi Support"
    assert srv["category"] == "it_support"


def test_get_services_filter(client, seed_data):
    res = client.get("/api/v1/services?category=maintenance")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert len(body["data"]) == 0


def test_get_qr_location_success(client, seed_data):
    res = client.get("/api/v1/locations/CSE-BLOCK-F2-LAB2")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    data = body["data"]
    assert data["code"] == "CSE-BLOCK-F2-LAB2"
    assert data["building"] == "CSE Block"
    assert data["floor"] == 2
    assert data["room"] == "Lab 2"


def test_get_qr_location_not_found(client, seed_data):
    res = client.get("/api/v1/locations/UNKNOWN-LOCATION-CODE")
    assert res.status_code == 404
    body = res.json()
    assert body["success"] is False
    assert body["error"]["code"] == "LOCATION_NOT_FOUND"
