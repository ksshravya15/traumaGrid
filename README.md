# TraumaGrid: AI-Powered Golden-Hour Trauma Triage — Even When Networks Fail

> **Tagline**: Edge AI • Contactless Vitals • Ultra-Low-Bandwidth Emergency Telemetry  
> **Status**: Prototype & Runnable Demonstration MVP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/Frontend-React_18-61DAFB.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Bundler-Vite_5-646CFF.svg)](https://vitejs.dev)
[![PWA](https://img.shields.io/badge/PWA-Offline_Ready-purple.svg)](https://web.dev/progressive-web-apps/)

---

## 1. The Core Problem

During road traffic collisions and mass-casualty incidents:
1. **Blind Audio Emergency Dispatch**: Callers in panic cannot accurately describe internal trauma, arterial hemorrhage, or airway patency over phone audio.
2. **Bandwidth Collapse**: Streaming real-time 1080p/4K video requires 1.5–5 Mbps. In remote highway corridors, cellular data frequently degrades to 2G (EDGE) or suffers complete packet loss.
3. **Bystander Hesitation**: Civilians without medical training freeze or hesitate during the vital first 10 minutes of the "Golden Hour".
4. **Zero Pre-Arrival Telemetry**: Trauma centers and ambulance crews arrive blind without vital trends or triage classification.

---

## 2. The TraumaGrid Solution

TraumaGrid empowers any bystander with a standard mobile browser to perform a rapid multimodal trauma survey in under 60 seconds:
- **Instant PWA Access**: Zero app-store downloads, zero login friction, high-contrast emergency touch targets.
- **Rapid Scene Survey & Computer Vision**: Detects severe bleeding, suspected fractures, and airway compromise using modular edge AI.
- **Contactless Optical Vitals (rPPG)**: Estimates heart rate via facial skin green-channel micro-reflectance fluctuations.
- **START / RTS Severity Engine**: Categorizes patients transparently into **CODE RED**, **CODE YELLOW**, or **CODE GREEN**.
- **Micro-Telemetry Generator**: Serializes life-critical diagnostics into a compact **~200–400 byte** packet (over **16,000× smaller** than streaming video) that transmits across 2G, SMS, or LoRa to the responder dashboard.
- **Real-Time Responder Command Center**: Ingests packets via WebSockets and updates live tactical OpenStreetMap plots without page reload.

---

## 3. System Architecture

```
                                  [ ACCIDENT SCENE ]
                               Bystander Smartphone PWA
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
         [ Primary Survey ]                             [ Camera / Sensor ]
      • Scene Safety Validation                     • RGB Frame Capture
      • Responsiveness Tap                          • Facial ROI Green Channel
      • Breathing & Bleeding                        • Optical Waveform Analysis
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         ▼
                             [ Edge Analysis Pipeline ]
                      ┌──────────────────────────────────────┐
                      │ 1. Modular Injury Detector (CV/ONNX) │
                      │ 2. Contactless rPPG Pulse Estimator  │
                      │ 3. START / RTS Trauma Severity Rules │
                      └──────────────────┬───────────────────┘
                                         ▼
                         [ Micro-Telemetry Serializer ]
                            Payload: ~200 - 450 Bytes
                                         │
                       ┌─────────────────┴─────────────────┐
                       ▼ (Online / WebSocket)              ▼ (Offline / 2G)
             [ FastAPI Backend Hub ]              [ LocalStorage Queue ]
                       │                            (Auto-sync on reconnect)
                       ▼
          [ Responder Command Center ]
       • Real-time WebSocket Dispatch Feed
       • Leaflet / OpenStreetMap Positioning
       • Simulated CAD (112 / 108) Escalation
```

---

## 4. Key Features

- **Mobile-First High Contrast UI**: Accessible in glaring sunlight and stress scenarios with large buttons and minimal cognitive load.
- **Modular AI & Honest Fallback**:
  - Automatically loads `models/injury_detector.onnx` if present.
  - If trained weights are unavailable, transparently operates in **DEMO_DETECTION** mode with clear labels and disclaimers.
- **rPPG Contactless Pulse Estimator**: Implements face ROI skin segmentation and Butterworth bandpass filtering (0.75 Hz – 3.0 Hz) to estimate pulse from capillary absorption. If signal quality is inadequate, explicitly reports `"Pulse estimation unavailable"`.
- **Dynamic Byte-Accurate Telemetry**: Computes UTF-8 byte length dynamically (e.g. 284 bytes) so judges and responders see exact transmission footprints.
- **Simulated Bandwidth Switcher**: Demonstrates performance in **Online**, **2G / LoRa**, and **Offline Disconnected** modes with local queueing and automatic sync.
- **Interactive First-Aid Guidance**: Actionable steps for hemorrhage control, airway protection, and an interactive **110 BPM CPR rhythm beat metronome**.
- **1-Click Hackathon Demo Scenario**: `[ LOAD DEMO INCIDENT ]` instantly populates a highway collision with severe hemorrhage, tachycardic vitals, and Code Red priority.

---

## 5. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS, Lucide React, Leaflet, PWA (Service Worker) |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, WebSockets, Pydantic v2 |
| **Database** | SQLite (SQLAlchemy 2.0 ORM, decoupled for PostgreSQL) |
| **Computer Vision** | OpenCV (Headless), NumPy, SciPy (Signal Processing / FFT), PIL |
| **Mapping** | Leaflet, OpenStreetMap / CartoDB Dark Matter (100% Free, No API Keys) |
| **DevOps** | Docker, Docker Compose, Pytest |

---

## 6. Project Monorepo Structure

```
traumagrid/
│
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components (Camera, Map, Vitals, Telemetry, First-Aid)
│   │   ├── pages/            # BystanderTriagePage, ResponderDashboardPage, FirstAidPage
│   │   ├── services/         # api.js, websocket.js, offlineStorage.js, telemetryEncoder.js
│   │   ├── hooks/            # useCamera.js, useGeolocation.js, useNetworkStatus.js
│   │   ├── utils/            # formatters.js
│   │   ├── data/             # firstAidData.js
│   │   ├── App.jsx           # Top-level routing & layout
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Tailwind & custom emergency styling
│   ├── public/               # manifest.json, sw.js, icons
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application, startup seeding, routers
│   │   ├── api/              # analysis.py, incidents.py, telemetry.py
│   │   ├── models/           # SQLAlchemy models (Incident, Detection, TelemetryRecord)
│   │   ├── schemas/          # Pydantic v2 schemas
│   │   ├── services/         # triage_engine.py, trauma_score.py
│   │   ├── ai/               # injury_detector.py, rppg.py
│   │   ├── websocket/        # manager.py (ConnectionManager)
│   │   ├── database/         # session.py
│   │   └── utils/            # telemetry_encoder.py
│   ├── tests/                # test_triage.py, test_telemetry.py, test_api.py
│   ├── requirements.txt
│   └── README.md
│
├── models/
│   └── README.md             # ONNX weights placement instructions & fallback explanation
│
├── docs/
│   ├── architecture.md       # Detailed technical architecture
│   ├── api.md                # REST & WebSocket endpoint specifications
│   └── demo.md               # 3-minute presentation script for judges
│
├── docker-compose.yml
├── .gitignore
├── .env.example
└── README.md
```

---

## 7. How to Run Locally

### Prerequisites
- **Python 3.11+** installed
- **Node.js 18+ & npm** installed

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/traumagrid.git
cd traumagrid
```

### Step 2: Backend Setup
```bash
# In first terminal:
cd backend
python -m pip install -r requirements.txt
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API root: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### Step 3: Frontend Setup
```bash
# In second terminal:
cd frontend
npm install
npm run dev
```
- Bystander Triage PWA: `http://localhost:5173`
- Responder Command Dashboard: `http://localhost:5173/dashboard`

---

## 8. Running with Docker Compose

To start both services with a single command:
```bash
docker compose up --build
```
Access the application at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## 9. Running Automated Tests

Run the backend test suite:
```bash
python -m pytest backend/tests/ -v
```
Tests cover:
- Rule-based triage engine priorities (RED, YELLOW, GREEN)
- START / RTS score calculation mechanics
- Micro-telemetry encoding and byte size accuracy
- API health, triage, and incident lifecycle endpoints

---

## 10. Live Hackathon Demonstration Flow

1. Open `http://localhost:5173` on mobile or desktop browser.
2. In a second browser tab or monitor, open `http://localhost:5173/dashboard`.
3. On the bystander page, click **[ LOAD DEMO INCIDENT ]**:
   - Primary survey automatically populates.
   - Computer vision scans and identifies **Severe Bleeding** (89% conf) and **Suspected Fracture**.
   - Contactless pulse estimator locks onto **118 BPM (Tachycardia)**.
   - Triage engine categorizes as **CODE RED** with full clinical reasoning.
   - Telemetry card displays payload size (**~284 bytes**) and transmits via WebSocket.
4. Switch to the Responder Dashboard tab:
   - Notice the new incident popped up **in real time without page reload**.
   - Inspect the Leaflet map showing the pulsing red marker on NH 48.
   - Click **[ DISPATCH ALS AMBULANCE (108) ]** to simulate CAD status escalation.

---

## 11. Known Limitations & Prototype Boundaries

- **Not Clinically Approved**: TraumaGrid is an educational hackathon prototype. It is not approved by the FDA, CDSCO, or CE for emergency medical diagnostics.
- **Optical Vital Constraints**: Remote photoplethysmography is sensitive to ambient lighting, subject motion, and camera sensor frame rates.
- **Simulated CAD Integration**: Government 112/108 dispatch systems are simulated via WebSocket dispatch triggers rather than direct government APNs.

---

## 12. Medical Safety Disclaimer

> **IMPORTANT**:
> TraumaGrid is an assistive triage prototype and has not been clinically validated or approved for emergency medical decision-making. In any real-world emergency, always dial local emergency dispatch (108 / 112 / 911) immediately and follow professional dispatcher guidance.
