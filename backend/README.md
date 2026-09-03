# TraumaGrid Backend Service

FastAPI-powered emergency triage backend providing:
- Multimodal injury detection (ONNX runtime or deterministic demo mode)
- Remote Photoplethysmography (rPPG) contactless pulse estimation
- START / RTS inspired rule-based trauma severity triage engine
- Ultra-low-bandwidth emergency telemetry packet encoder
- WebSocket broadcasting to responder dashboards
- SQLite local database (SQLAlchemy decoupled for PostgreSQL)

## Setup & Run Locally

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Running Tests

```bash
python -m pytest backend/tests/ -v
```

## API Documentation
Interactive OpenAPI docs are available at `http://localhost:8000/docs`.
