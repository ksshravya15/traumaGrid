# TraumaGrid Hackathon Demonstration Guide

This guide describes the recommended 3-minute presentation script and live demonstration workflow for judges.

---

## 3-Minute Hackathon Demo Script

### 1. Problem Introduction (30 seconds)
> "When a catastrophic highway collision occurs, emergency dispatch receives blind audio calls with no clinical visibility. Streaming video sounds great in theory, but in real-world disaster zones and highway dead-zones, bandwidth collapses to 2G or zero.
>
> We built **TraumaGrid: AI-Powered Golden-Hour Trauma Triage — Even When Networks Fail**."

### 2. Bystander Emergency Triage Walkthrough (60 seconds)
1. Open the **TraumaGrid Bystander Mobile PWA** (`http://localhost:5173/`).
2. Point out the zero-login, high-contrast, emergency-optimized interface.
3. Click **[ START EMERGENCY ASSESSMENT ]**.
4. Step 1: Rapid Scene Safety & Primary Survey:
   - "Is the scene safe?" → **YES**
   - "Is victim responsive?" → **NO**
   - "Is victim breathing normally?" → **YES**
   - "Is there severe visible bleeding?" → **YES**
5. Step 2: Camera & Computer Vision Assessment:
   - Click **[ Take Photo / Upload ]** or click **[ LOAD DEMO INCIDENT: Highway Collision ]**.
   - Show the scanning animation and detected findings:
     - 🔴 Severe bleeding (Confidence: 88%)
     - 🟠 Possible fracture (Confidence: 74%)
   - **Show the transparent badge**: *"AI-assisted assessment — not a medical diagnosis. DEMO MODE."*
6. Step 3: Contactless Pulse / rPPG Estimator:
   - Point the camera at a face or view the estimated vital waveform.
   - Highlights: *Estimated Pulse: 118 BPM (Tachycardia)* with clinical disclaimer.
7. Step 4: Transparent Triage Engine & START/RTS Score:
   - Shows **CODE RED — Immediate Priority (Score: 3.5 / 12.0)**.
   - Shows full reasoning breakdown: Unconscious + Massive External Bleeding.

### 3. Ultra-Low-Bandwidth Telemetry In Action (45 seconds)
1. Point to the **Micro-Telemetry Packet Card**:
   - Highlight the exact dynamic payload size: **284 bytes!**
   - Contrast this with a 5 MB video stream: **TraumaGrid is 18,000× smaller**, meaning it delivers life-saving telemetry in milliseconds across 2G, SMS, or LoRa.
2. Toggle the **Simulate Low-Bandwidth / 2G** switch to show instantaneous delivery.
3. Show the **First-Aid Guidance** for bystanders:
   - Direct firm pressure on wound
   - Cervical spine precautions
   - Interactive CPR rhythm cadence metronome.

### 4. Responder Emergency Operations Center (45 seconds)
1. Switch to the **Responder Dashboard** (`http://localhost:5173/dashboard`).
2. Show that the incident popped up in **real-time via WebSocket** without refreshing.
3. View the interactive **Leaflet / OpenStreetMap** with pulsing RED marker on NH 48.
4. Click the incident card to inspect telemetry diagnostics:
   - Exact lat/long, detected injuries, pulse vitals, and payload footprint.
5. Demonstrate CAD simulation:
   - Click **[ ACKNOWLEDGE ]** or **[ DISPATCH ALS AMBULANCE ]**.
   - Shows status change synced across systems.

### 5. Offline & Resilience Demo (optional / bonus)
1. In Bystander view, toggle the network indicator to **Simulate Offline**.
2. Complete an assessment; show the telemetry queued in local browser storage.
3. Toggle back to **Online**; show the pending incident auto-synchronize to the dashboard.
