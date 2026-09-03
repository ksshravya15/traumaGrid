# TraumaGrid API Documentation

Interactive OpenAPI documentation is hosted at `http://localhost:8000/docs`.

## Base URL
- Local: `http://localhost:8000`
- WebSocket: `ws://localhost:8000/ws/dashboard`

---

## 1. System Health

### `GET /health`
Returns the status of the TraumaGrid backend.
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2026-09-03T12:50:00.000Z",
  "database": "sqlite",
  "service": "traumagrid-backend"
}
```

---

## 2. Analysis & Triage

### `POST /api/analyze/injury`
Modular computer vision inference for trauma analysis.
- **Request Body**:
```json
{
  "image_base64": "data:image/jpeg;base64,...",
  "scenario_hint": "highway_accident"
}
```
- **Response**: `200 OK`
```json
{
  "detections": [
    {
      "label": "severe_bleeding",
      "confidence": 0.88,
      "bounding_box": [0.35, 0.42, 0.28, 0.32],
      "is_simulated": true
    },
    {
      "label": "possible_fracture",
      "confidence": 0.74,
      "bounding_box": [0.55, 0.60, 0.22, 0.28],
      "is_simulated": true
    }
  ],
  "person_detected": true,
  "summary": "DEMO MODE: Severe bleeding and suspected lower-limb fracture detected via scene pattern.",
  "model_mode": "DEMO_DETECTION",
  "disclaimer": "AI-assisted assessment — not a medical diagnosis. Prototype running in DEMO mode."
}
```

### `POST /api/analyze/rppg`
Remote photoplethysmography pulse estimation from face ROI.
- **Request Body**:
```json
{
  "image_base64": "data:image/jpeg;base64,...",
  "fps": 30.0,
  "simulated_bpm": 118.0
}
```
- **Response**: `200 OK`
```json
{
  "heart_rate": 118.0,
  "confidence": 0.88,
  "status": "estimated",
  "waveform": [0.12, 0.45, 0.89, ...],
  "disclaimer": "Estimated pulse — Experimental optical measurement — verify clinically."
}
```

### `POST /api/triage`
Rule-based triage engine evaluating primary survey & detections.
- **Request Body**:
```json
{
  "is_scene_safe": true,
  "is_responsive": false,
  "is_breathing": true,
  "has_severe_bleeding": true,
  "detected_injuries": ["severe_bleeding", "possible_fracture"],
  "estimated_pulse": 118.0,
  "pulse_confidence": 0.88
}
```
- **Response**: `200 OK`
```json
{
  "priority": "RED",
  "triage_score": 3.5,
  "triage_category": "Immediate Priority (Code Red)",
  "reason": "Patient is unconscious | Severe visible external bleeding | Tachycardia",
  "recommended_action": "IMMEDIATE EMERGENCY RESPONSE REQUIRED. Dispatch ALS ambulance with trauma kit.",
  "immediate_first_aid": [
    "Apply firm direct pressure with clean cloth or sterile gauze",
    "Keep patient still, protect cervical spine, monitor breathing closely"
  ]
}
```

---

## 3. Ultra-Low-Bandwidth Telemetry

### `POST /api/telemetry`
Ingests compact emergency packet and broadcasts to WebSocket subscribers.
- **Request Body**:
```json
{
  "incident_id": "inc-highway-demo-01",
  "timestamp": "2026-09-03T12:50:00Z",
  "lat": 28.6139,
  "lng": 77.2090,
  "priority": "RED",
  "injuries": ["severe_bleeding", "possible_fracture"],
  "heart_rate": 118.0,
  "confidence": 0.88,
  "triage_score": 3.5,
  "is_demo": true
}
```
- **Response**: `200 OK`
```json
{
  "incident_id": "inc-highway-demo-01",
  "payload_bytes": 284,
  "payload_json": "{\"incident_id\":\"inc-highway-demo-01\",...}",
  "status": "received_and_broadcast",
  "transmitted_via": "websocket/rest",
  "timestamp": "2026-09-03T12:50:00Z"
}
```

---

## 4. Incidents & Dispatch

### `POST /api/incidents`
Creates an incident record and dispatches real-time notification.

### `GET /api/incidents`
Lists all active incidents with optional `priority` and `status` query filters.

### `GET /api/incidents/{incident_id}`
Fetches full incident history, detections, and raw telemetry packet.

### `PATCH /api/incidents/{incident_id}/status?status=acknowledged`
Updates incident status (`acknowledged`, `dispatched`, `resolved`) and triggers WebSocket push.

---

## 5. Real-Time WebSocket

### `ws://localhost:8000/ws/dashboard`
Live duplex event channel for responder operations centers.
- Emits:
  - `NEW_INCIDENT`
  - `TELEMETRY_PACKET`
  - `STATUS_UPDATE`
