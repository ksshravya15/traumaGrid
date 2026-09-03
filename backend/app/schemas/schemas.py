from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class DetectionItem(BaseModel):
    label: str  # severe_bleeding, open_wound, possible_fracture, airway_obstruction, person
    confidence: float = Field(ge=0.0, le=1.0)
    bounding_box: Optional[List[float]] = None  # [x, y, w, h] normalized 0-1
    is_simulated: bool = False


class InjuryDetectionRequest(BaseModel):
    image_base64: str
    scenario_hint: Optional[str] = None  # e.g., "highway_accident", "fracture", "stable"


class InjuryDetectionResult(BaseModel):
    detections: List[DetectionItem]
    person_detected: bool = True
    summary: str
    model_mode: str = "DEMO_DETECTION"  # "REAL_ONNX" or "DEMO_DETECTION"
    disclaimer: str = "AI-assisted assessment — not a medical diagnosis."


class RppgInput(BaseModel):
    image_base64: Optional[str] = None
    frames_base64: Optional[List[str]] = None
    fps: float = 30.0
    simulated_bpm: Optional[float] = None  # For demo scenarios


class RppgResult(BaseModel):
    heart_rate: Optional[float] = None
    confidence: Optional[float] = None
    status: str = "estimated"  # "estimated" or "Pulse estimation unavailable"
    waveform: Optional[List[float]] = None
    disclaimer: str = "Estimated pulse — Experimental optical measurement — verify clinically."


class TriageInput(BaseModel):
    is_scene_safe: bool = True
    is_responsive: bool = True
    is_breathing: bool = True
    has_severe_bleeding: bool = False
    detected_injuries: List[str] = []
    estimated_pulse: Optional[float] = None
    pulse_confidence: Optional[float] = None


class TriageResult(BaseModel):
    priority: str  # RED, YELLOW, GREEN
    triage_score: float
    triage_category: str
    reason: str
    recommended_action: str
    immediate_first_aid: List[str]


class TelemetryPayload(BaseModel):
    incident_id: str
    timestamp: str
    lat: float
    lng: float
    priority: str
    injuries: List[str] = []
    heart_rate: Optional[float] = None
    confidence: float = 0.85
    triage_score: float = 0.0
    is_demo: bool = False


class TelemetryResponse(BaseModel):
    incident_id: str
    payload_bytes: int
    payload_json: str
    status: str = "received"
    transmitted_via: str = "websocket"
    timestamp: str


class IncidentCreate(BaseModel):
    id: Optional[str] = None
    latitude: float
    longitude: float
    location_label: Optional[str] = "Accident Location"
    is_scene_safe: bool = True
    is_responsive: bool = True
    is_breathing: bool = True
    has_severe_bleeding: bool = False
    priority: str = "YELLOW"
    triage_score: float = 0.0
    triage_category: str = "Standard"
    triage_reason: str = ""
    recommended_action: str = ""
    estimated_pulse: Optional[float] = None
    pulse_confidence: Optional[float] = None
    pulse_status: str = "unavailable"
    detections: List[DetectionItem] = []
    is_demo: bool = False


class IncidentResponse(BaseModel):
    id: str
    timestamp: datetime
    priority: str
    latitude: float
    longitude: float
    location_label: Optional[str]
    is_scene_safe: bool
    is_responsive: bool
    is_breathing: bool
    has_severe_bleeding: bool
    triage_score: float
    triage_category: str
    triage_reason: str
    recommended_action: str
    estimated_pulse: Optional[float]
    pulse_confidence: Optional[float]
    pulse_status: str
    status: str
    is_demo: bool
    created_at: datetime
    detections: List[DetectionItem] = []
    payload_bytes: Optional[int] = None

    model_config = {"from_attributes": True}
