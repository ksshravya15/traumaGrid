import json
from typing import Dict, Any, Tuple
from backend.app.schemas.schemas import TelemetryPayload, TelemetryResponse


def encode_telemetry(payload: TelemetryPayload) -> Tuple[str, int]:
    """
    Serializes a compact emergency telemetry packet.
    Computes exact UTF-8 payload byte length.
    Separators=(',', ':') removes whitespace to minimize bytes.
    """
    data: Dict[str, Any] = {
        "incident_id": payload.incident_id,
        "timestamp": payload.timestamp,
        "lat": round(payload.lat, 5),
        "lng": round(payload.lng, 5),
        "priority": payload.priority,
        "injuries": payload.injuries,
        "heart_rate": payload.heart_rate,
        "confidence": round(payload.confidence, 2),
        "triage_score": round(payload.triage_score, 1),
        "is_demo": payload.is_demo,
    }
    
    # Compact minified JSON
    json_bytes = json.dumps(data, separators=(",", ":")).encode("utf-8")
    payload_str = json_bytes.decode("utf-8")
    size_in_bytes = len(json_bytes)

    return payload_str, size_in_bytes


def format_telemetry_response(payload: TelemetryPayload, transmitted_via: str = "websocket") -> TelemetryResponse:
    json_str, size_bytes = encode_telemetry(payload)
    return TelemetryResponse(
        incident_id=payload.incident_id,
        payload_bytes=size_bytes,
        payload_json=json_str,
        status="transmitted",
        transmitted_via=transmitted_via,
        timestamp=payload.timestamp,
    )
