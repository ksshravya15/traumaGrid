# TraumaGrid AI Models & Edge Inference Directory

This directory contains instructions and model weights for edge and server-side computer vision inference in TraumaGrid.

## Architecture

TraumaGrid uses a modular pluggable architecture:
- Model Loader: `backend/app/ai/injury_detector.py`
- Target Model: YOLOv8 Nano or Custom Injury Classification/Detection Model exported to ONNX format.
- Default Expected Weight File: `models/injury_detector.onnx`

## Running with Real ONNX Weights

To supply a custom trained model:
1. Train a YOLOv8-Nano model on your emergency trauma dataset (detecting `severe_bleeding`, `open_wound`, `possible_fracture`, `airway_obstruction`, `person`).
2. Export the model to ONNX:
   ```bash
   yolo export model=yolov8n-trauma.pt format=onnx imgsz=640
   ```
3. Place `yolov8n-trauma.onnx` into this directory named as `injury_detector.onnx`:
   ```bash
   models/injury_detector.onnx
   ```
4. When TraumaGrid backend initializes, `injury_detector.py` automatically detects the ONNX file, starts an `onnxruntime.InferenceSession`, and sets `model_mode = "REAL_ONNX"`.

## Deterministic Demo / Safe Fallback Mode

If `models/injury_detector.onnx` is not present:
- TraumaGrid **does NOT fail** or throw broken errors.
- TraumaGrid **does NOT create fake results and claim a real YOLO model was executed**.
- Instead, the backend activates **DEMO_DETECTION** mode.
- In DEMO mode, the service applies deterministic heuristics (including red-saturation color clustering for visible blood staining) or evaluates predefined demonstration scenarios (e.g. `highway_accident`), while clearly returning:
  - `model_mode: "DEMO_DETECTION"`
  - `is_simulated: true`
  - `disclaimer: "AI-assisted assessment — not a medical diagnosis. Prototype running in DEMO mode."`

This ensures 100% honesty and transparency during hackathon presentations and testing without requiring GPU hardware or proprietary commercial APIs.
