# TraumaGrid System Architecture

## Overview

TraumaGrid is designed to solve the critical "blind dispatch" and "golden-hour bandwidth collapse" problem during road traffic accidents. By combining edge-assisted visual triage, contactless rPPG pulse estimation, structured START/RTS triage heuristics, and ultra-compact micro-telemetry packets, TraumaGrid provides pre-arrival trauma visibility to dispatchers even when cellular connectivity degrades to 2G or intermittent LoRa-like conditions.

```
[ Accident Scene: Bystander Smartphone ]
  │
  ├── 1. Scene Safety & Primary Survey (Voice/Tap)
  ├── 2. Camera Capture / Upload (RGB Frame)
  ├── 3. Edge Computer Vision (Bleeding, Fractures, Airway)
  ├── 4. Contactless rPPG Pulse Estimation (Face ROI, Green signal FFT)
  └── 5. START / RTS Trauma Severity Rule Engine
         │
         ▼
[ Micro-Telemetry Encoder ]
  │  Payload: ~200 - 450 bytes (JSON / UTF-8)
  │  (Transmitted over WebSocket / REST / Offline Sync Queue)
  │
  ▼
[ TraumaGrid FastAPI Backend & WebSocket Hub ]
  │
  ├── Ingestion & SQLite / Postgres Persistence
  ├── Low-Latency Broadcast Engine
  └── Real-time WebSocket Dispatcher
         │
         ▼
[ Emergency Responder Command Dashboard ]
  ├── Real-time Active Incident Alert Feed (Zero Refresh)
  ├── Leaflet / OpenStreetMap Spatial Positioning
  ├── Code RED / YELLOW / GREEN Priority Visualizer
  ├── Trauma Score & Vital Diagnostics Drawer
  └── Simulated CAD (108 / 112) Dispatch Bridge
```

## Micro-Telemetry Packet Structure

Instead of saturating bandwidth with high-definition video streams (which require 1.5–5 Mbps and consistently fail in remote highway corridors), TraumaGrid compresses critical clinical findings into an ultra-low-bandwidth structured packet:

```json
{
  "incident_id": "8f3b6c2a-9e1d-4876-b924-a74e9f54312c",
  "timestamp": "2026-09-03T12:45:00Z",
  "lat": 28.61393,
  "lng": 77.20902,
  "priority": "RED",
  "injuries": ["severe_bleeding", "possible_fracture"],
  "heart_rate": 118.0,
  "confidence": 0.88,
  "triage_score": 3.5,
  "is_demo": true
}
```

- **Transmission Footprint**: Typically **240 to 380 bytes** (minified JSON).
- **Network Compatibility**: Can transmit over GSM SMS, 2G EDGE, LoRaWAN (with base64 packing), satellite messengers, or standard WebSockets.

## Modular AI & Safe Fallback Architecture

1. **Injury Detector (`backend/app/ai/injury_detector.py`)**:
   - Primary: Attempts to load local ONNX model `models/injury_detector.onnx`.
   - Fallback: Transparently defaults to deterministic demo heuristics (`DEMO_DETECTION`) with explicit user-facing disclaimers and flags `is_simulated: true`.
2. **Contactless rPPG (`backend/app/ai/rppg.py`)**:
   - Detects facial skin ROI using Haar cascades.
   - Measures subtle green-channel optical reflectance fluctuations synchronized with cardiac systole.
   - Employs 2nd order Butterworth bandpass filtering (0.75 Hz – 3.0 Hz, 45 – 180 BPM) followed by Fast Fourier Transform (FFT) peak detection.
   - If optical signal quality is insufficient, explicitly returns `"Pulse estimation unavailable"` rather than fabricating clinical vitals.

## Offline & Weak Network Resilience

1. **Client-Side Queue**: Unsent incidents are stored in the browser's `localStorage` / `IndexedDB` when network status is offline.
2. **PWA Service Worker**: Static shell and assets are cached locally for instantaneous offline startup.
3. **Automatic Reconnection**: The telemetry manager monitors `navigator.onLine` and automatically flushes pending incident queues as soon as network ping succeeds.
