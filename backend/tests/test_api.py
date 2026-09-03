from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["system"] == "TraumaGrid Emergency Triage API"


def test_triage_api_endpoint():
    payload = {
        "is_scene_safe": True,
        "is_responsive": True,
        "is_breathing": True,
        "has_severe_bleeding": True,
        "detected_injuries": ["severe_bleeding"],
        "estimated_pulse": 115.0,
        "pulse_confidence": 0.85,
    }
    response = client.post("/api/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["priority"] == "RED"
    assert "Severe visible external bleeding" in data["reason"]


def test_incident_creation_and_listing():
    incident_data = {
        "latitude": 12.9716,
        "longitude": 77.5946,
        "location_label": "Test City Highway",
        "is_scene_safe": True,
        "is_responsive": True,
        "is_breathing": True,
        "has_severe_bleeding": False,
        "priority": "YELLOW",
        "triage_score": 6.0,
        "triage_category": "Urgent Priority",
        "triage_reason": "Suspected fracture",
        "recommended_action": "Immobilize limb",
        "detections": [
            {
                "label": "possible_fracture",
                "confidence": 0.82,
                "is_simulated": True,
            }
        ],
        "is_demo": True,
    }
    create_resp = client.post("/api/incidents", json=incident_data)
    assert create_resp.status_code == 200
    created = create_resp.json()
    assert created["priority"] == "YELLOW"
    assert created["id"] is not None

    list_resp = client.get("/api/incidents")
    assert list_resp.status_code == 200
    incidents = list_resp.json()
    assert len(incidents) >= 1
    found = any(i["id"] == created["id"] for i in incidents)
    assert found
