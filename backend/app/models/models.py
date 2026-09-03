import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=datetime.utcnow)
    priority = Column(String(10), nullable=False, default="YELLOW")  # RED, YELLOW, GREEN
    latitude = Column(Float, nullable=False, default=0.0)
    longitude = Column(Float, nullable=False, default=0.0)
    location_label = Column(String(255), nullable=True, default="Accident Location")
    
    # Scene safety & primary survey
    is_scene_safe = Column(Boolean, default=True)
    is_responsive = Column(Boolean, default=True)
    is_breathing = Column(Boolean, default=True)
    has_severe_bleeding = Column(Boolean, default=False)
    
    # Triage decision
    triage_score = Column(Float, default=0.0)
    triage_category = Column(String(50), default="Standard")
    triage_reason = Column(Text, default="")
    recommended_action = Column(Text, default="")
    
    # Vitals (rPPG contactless pulse)
    estimated_pulse = Column(Float, nullable=True)
    pulse_confidence = Column(Float, nullable=True)
    pulse_status = Column(String(50), default="unavailable")
    
    # Status & metadata
    status = Column(String(20), default="active")  # active, acknowledged, dispatched, resolved
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    detections = relationship("Detection", back_populates="incident", cascade="all, delete-orphan")
    telemetry = relationship("TelemetryRecord", back_populates="incident", uselist=False, cascade="all, delete-orphan")


class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    label = Column(String(50), nullable=False)  # severe_bleeding, open_wound, possible_fracture, airway_obstruction, person
    confidence = Column(Float, default=0.85)
    bounding_box = Column(String(255), nullable=True)  # JSON [x, y, w, h] normalized
    is_simulated = Column(Boolean, default=False)

    incident = relationship("Incident", back_populates="detections")


class TelemetryRecord(Base):
    __tablename__ = "telemetry_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    payload_raw = Column(Text, nullable=False)
    payload_bytes = Column(Integer, nullable=False)
    transmitted_via = Column(String(50), default="websocket")
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="telemetry")
