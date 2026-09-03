import uuid
import json
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.models import Incident, Detection, TelemetryRecord
from backend.app.schemas.schemas import IncidentCreate, IncidentResponse, DetectionItem, TelemetryPayload
from backend.app.utils.telemetry_encoder import encode_telemetry
from backend.app.websocket.manager import manager

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])


def incident_to_response(inc: Incident) -> IncidentResponse:
    detections = []
    for d in inc.detections:
        bbox = None
        if d.bounding_box:
            try:
                bbox = json.loads(d.bounding_box)
            except Exception:
                bbox = None
        detections.append(
            DetectionItem(
                label=d.label,
                confidence=d.confidence,
                bounding_box=bbox,
                is_simulated=d.is_simulated,
            )
        )
    return IncidentResponse(
        id=inc.id,
        timestamp=inc.timestamp,
        priority=inc.priority,
        latitude=inc.latitude,
        longitude=inc.longitude,
        location_label=inc.location_label,
        is_scene_safe=inc.is_scene_safe,
        is_responsive=inc.is_responsive,
        is_breathing=inc.is_breathing,
        has_severe_bleeding=inc.has_severe_bleeding,
        triage_score=inc.triage_score,
        triage_category=inc.triage_category,
        triage_reason=inc.triage_reason,
        recommended_action=inc.recommended_action,
        estimated_pulse=inc.estimated_pulse,
        pulse_confidence=inc.pulse_confidence,
        pulse_status=inc.pulse_status,
        status=inc.status,
        is_demo=inc.is_demo,
        created_at=inc.created_at,
        detections=detections,
        payload_bytes=inc.telemetry.payload_bytes if inc.telemetry else None,
    )


@router.post("", response_model=IncidentResponse)
async def create_incident(data: IncidentCreate, db: Session = Depends(get_db)):
    incident_id = data.id or str(uuid.uuid4())
    
    # Check if incident already exists (idempotency / offline sync)
    existing = db.query(Incident).filter(Incident.id == incident_id).first()
    if existing:
        return incident_to_response(existing)

    new_incident = Incident(
        id=incident_id,
        latitude=data.latitude,
        longitude=data.longitude,
        location_label=data.location_label or "Accident Location",
        is_scene_safe=data.is_scene_safe,
        is_responsive=data.is_responsive,
        is_breathing=data.is_breathing,
        has_severe_bleeding=data.has_severe_bleeding,
        priority=data.priority,
        triage_score=data.triage_score,
        triage_category=data.triage_category,
        triage_reason=data.triage_reason,
        recommended_action=data.recommended_action,
        estimated_pulse=data.estimated_pulse,
        pulse_confidence=data.pulse_confidence,
        pulse_status=data.pulse_status,
        status="active",
        is_demo=data.is_demo,
        created_at=datetime.utcnow(),
    )
    db.add(new_incident)

    # Add detection items
    injury_labels = []
    for d in data.detections:
        injury_labels.append(d.label)
        det_obj = Detection(
            incident_id=incident_id,
            label=d.label,
            confidence=d.confidence,
            bounding_box=json.dumps(d.bounding_box) if d.bounding_box else None,
            is_simulated=d.is_simulated,
        )
        db.add(det_obj)

    # Encode compact telemetry packet
    telemetry_payload = TelemetryPayload(
        incident_id=incident_id,
        timestamp=datetime.utcnow().isoformat(),
        lat=data.latitude,
        lng=data.longitude,
        priority=data.priority,
        injuries=injury_labels,
        heart_rate=data.estimated_pulse,
        confidence=data.pulse_confidence or 0.85,
        triage_score=data.triage_score,
        is_demo=data.is_demo,
    )
    payload_str, size_bytes = encode_telemetry(telemetry_payload)

    # Store telemetry record
    telemetry_record = TelemetryRecord(
        incident_id=incident_id,
        payload_raw=payload_str,
        payload_bytes=size_bytes,
        transmitted_via="websocket",
        created_at=datetime.utcnow(),
    )
    db.add(telemetry_record)
    db.commit()
    db.refresh(new_incident)

    # Broadcast to all connected responder dashboards
    broadcast_data = {
        "event": "NEW_INCIDENT",
        "incident": {
            "id": new_incident.id,
            "timestamp": new_incident.timestamp.isoformat(),
            "priority": new_incident.priority,
            "lat": new_incident.latitude,
            "lng": new_incident.longitude,
            "location_label": new_incident.location_label,
            "triage_score": new_incident.triage_score,
            "triage_category": new_incident.triage_category,
            "triage_reason": new_incident.triage_reason,
            "recommended_action": new_incident.recommended_action,
            "estimated_pulse": new_incident.estimated_pulse,
            "pulse_status": new_incident.pulse_status,
            "injuries": injury_labels,
            "payload_bytes": size_bytes,
            "status": new_incident.status,
            "is_demo": new_incident.is_demo,
        }
    }
    await manager.broadcast(broadcast_data)

    return incident_to_response(new_incident)


@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    priority: str = Query(None, description="Filter by priority: RED, YELLOW, GREEN"),
    status: str = Query(None, description="Filter by status: active, acknowledged, dispatched, resolved"),
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(Incident)
    if priority:
        query = query.filter(Incident.priority == priority.upper())
    if status:
        query = query.filter(Incident.status == status)

    incidents = query.order_by(Incident.created_at.desc()).limit(limit).all()
    return [incident_to_response(inc) for inc in incidents]


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident_to_response(inc)


@router.patch("/{incident_id}/status")
async def update_incident_status(incident_id: str, status: str = Query(..., description="New status"), db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    inc.status = status
    db.commit()
    
    # Broadcast status change
    await manager.broadcast({
        "event": "STATUS_UPDATE",
        "incident_id": incident_id,
        "status": status,
    })
    return {"incident_id": incident_id, "status": status}
