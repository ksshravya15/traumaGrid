import os
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database.session import engine, Base, SessionLocal
from backend.app.models.models import Incident, Detection, TelemetryRecord
from backend.app.api.incidents import router as incidents_router
from backend.app.api.analysis import router as analysis_router
from backend.app.api.telemetry import router as telemetry_router
from backend.app.websocket.manager import manager
from backend.app.utils.telemetry_encoder import encode_telemetry
from backend.app.schemas.schemas import TelemetryPayload


def seed_demo_data():
    """Seeds realistic demonstration incidents if database is fresh."""
    db = SessionLocal()
    try:
        count = db.query(Incident).count()
        if count == 0:
            print("[TraumaGrid] Seeding initial demonstration incident...")
            demo_id = "inc-highway-demo-01"
            inc = Incident(
                id=demo_id,
                latitude=28.6139,
                longitude=77.2090,
                location_label="National Highway 48, KM 42",
                is_scene_safe=True,
                is_responsive=False,
                is_breathing=True,
                has_severe_bleeding=True,
                priority="RED",
                triage_score=3.5,
                triage_category="Immediate Priority (Code Red)",
                triage_reason="Unresponsive patient | Severe visible external bleeding / massive hemorrhage identified | Tachycardia",
                recommended_action="IMMEDIATE EMERGENCY RESPONSE REQUIRED. Dispatch ALS ambulance with trauma kit.",
                estimated_pulse=118.0,
                pulse_confidence=0.88,
                pulse_status="estimated",
                status="active",
                is_demo=True,
                created_at=datetime.utcnow(),
            )
            db.add(inc)

            # Detections
            d1 = Detection(incident_id=demo_id, label="severe_bleeding", confidence=0.89, is_simulated=True)
            d2 = Detection(incident_id=demo_id, label="possible_fracture", confidence=0.76, is_simulated=True)
            d3 = Detection(incident_id=demo_id, label="person", confidence=0.95, is_simulated=True)
            db.add_all([d1, d2, d3])

            # Telemetry
            payload = TelemetryPayload(
                incident_id=demo_id,
                timestamp=datetime.utcnow().isoformat(),
                lat=28.6139,
                lng=77.2090,
                priority="RED",
                injuries=["severe_bleeding", "possible_fracture"],
                heart_rate=118.0,
                confidence=0.88,
                triage_score=3.5,
                is_demo=True,
            )
            raw, bsize = encode_telemetry(payload)
            tr = TelemetryRecord(
                incident_id=demo_id,
                payload_raw=raw,
                payload_bytes=bsize,
                transmitted_via="websocket",
                created_at=datetime.utcnow(),
            )
            db.add(tr)
            db.commit()
            print("[TraumaGrid] Seeded Highway Accident (RED) demo incident.")
    except Exception as e:
        print(f"[TraumaGrid] Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()


# Ensure tables are created
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables & demo data
    Base.metadata.create_all(bind=engine)
    seed_demo_data()
    yield
    # Shutdown
    print("[TraumaGrid] Server shutting down.")


app = FastAPI(
    title="TraumaGrid API",
    description=(
        "AI-Powered Golden-Hour Trauma Triage Engine. "
        "Processes multimodal bystander trauma inputs, estimates vitals (rPPG), "
        "computes START/RTS severity score, and generates ultra-low-bandwidth emergency telemetry."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for all origins (Mobile PWA & local dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(incidents_router)
app.include_router(analysis_router)
app.include_router(telemetry_router)


@app.get("/", tags=["System"])
def root():
    return {
        "system": "TraumaGrid Emergency Triage API",
        "version": "1.0.0",
        "tagline": "Edge AI • Contactless Vitals • Ultra-Low-Bandwidth Emergency Telemetry",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "incidents": "/api/incidents",
            "analyze_injury": "/api/analyze/injury",
            "analyze_rppg": "/api/analyze/rppg",
            "triage": "/api/triage",
            "telemetry": "/api/telemetry",
            "websocket_dashboard": "/ws/dashboard",
        },
    }


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "sqlite",
        "service": "traumagrid-backend",
    }


@app.websocket("/ws/dashboard")
async def websocket_dashboard_endpoint(websocket: WebSocket):
    """
    WebSocket channel for responder dashboard.
    Streams real-time incident creation, telemetry updates, and dispatch changes.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and accept client commands if any
            data = await websocket.receive_text()
            # Client can send ping
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"[WebSocket] Disconnect or exception: {e}")
        manager.disconnect(websocket)
