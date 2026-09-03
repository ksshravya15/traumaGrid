import json
from backend.app.schemas.schemas import TelemetryPayload
from backend.app.utils.telemetry_encoder import encode_telemetry


def test_telemetry_encoding_and_size():
    payload = TelemetryPayload(
        incident_id="test-incident-123",
        timestamp="2026-09-03T12:00:00Z",
        lat=28.61393,
        lng=77.20902,
        priority="RED",
        injuries=["severe_bleeding", "possible_fracture"],
        heart_rate=118.0,
        confidence=0.88,
        triage_score=3.5,
        is_demo=True,
    )
    raw_str, byte_size = encode_telemetry(payload)
    
    # Must be valid json
    parsed = json.loads(raw_str)
    assert parsed["incident_id"] == "test-incident-123"
    assert parsed["priority"] == "RED"
    assert parsed["heart_rate"] == 118.0

    # Ultra-low bandwidth check: should be comfortably under 500 bytes
    assert byte_size < 500
    assert byte_size == len(raw_str.encode("utf-8"))
