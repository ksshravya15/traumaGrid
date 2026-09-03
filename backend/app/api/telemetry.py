import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.schemas.schemas import TelemetryPayload, TelemetryResponse
from backend.app.models.models import Incident, TelemetryRecord
from backend.app.utils.telemetry_encoder import encode_telemetry
from backend.app.websocket.manager import manager

router = APIRouter(prefix="/api", tags=["Telemetry"])


@router.post("/telemetry", response_model=TelemetryResponse)
async def ingest_telemetry(payload: TelemetryPayload, db: Session = Depends(get_db)):
    """
    Ingests ultra-low-bandwidth emergency telemetry packet (~200-500 bytes).
    Broadcasts real-time alert to responder dashboard via WebSocket.
    """
    payload_str, size_bytes = encode_telemetry(payload)

    # Save to telemetry records in DB
    # Check if parent incident exists
    existing_incident = db.query(Incident).filter(Incident.id == payload.incident_id).first()
    if existing_incident:
        # Upsert telemetry record
        record = db.query(TelemetryRecord).filter(TelemetryRecord.incident_id == payload.incident_id).first()
        if not record:
            record = TelemetryRecord(
                incident_id=payload.incident_id,
                payload_raw=payload_str,
                payload_bytes=size_bytes,
                transmitted_via="websocket/rest",
                created_at=datetime.utcnow(),
            )
            db.add(record)
        else:
            record.payload_raw = payload_str
            record.payload_bytes = size_bytes
        db.commit()

    # Broadcast to connected dashboard clients
    broadcast_data = {
        "event": "TELEMETRY_PACKET",
        "incident_id": payload.incident_id,
        "timestamp": payload.timestamp,
        "priority": payload.priority,
        "lat": payload.lat,
        "lng": payload.lng,
        "injuries": payload.injuries,
        "heart_rate": payload.heart_rate,
        "triage_score": payload.triage_score,
        "payload_bytes": size_bytes,
        "is_demo": payload.is_demo,
    }
    await manager.broadcast(broadcast_data)

    return TelemetryResponse(
        incident_id=payload.incident_id,
        payload_bytes=size_bytes,
        payload_json=payload_str,
        status="received_and_broadcast",
        transmitted_via="websocket/rest",
        timestamp=payload.timestamp,
    )
