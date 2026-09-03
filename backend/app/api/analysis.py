from fastapi import APIRouter, HTTPException
from backend.app.schemas.schemas import (
    InjuryDetectionRequest,
    InjuryDetectionResult,
    RppgInput,
    RppgResult,
    TriageInput,
    TriageResult,
)
from backend.app.ai.injury_detector import injury_detector
from backend.app.ai.rppg import rppg_estimator
from backend.app.services.triage_engine import evaluate_triage

router = APIRouter(prefix="/api", tags=["Analysis & Triage"])


@router.post("/analyze/injury", response_model=InjuryDetectionResult)
async def analyze_injury(request: InjuryDetectionRequest):
    """
    Modular AI Injury Detection.
    Runs ONNX model if installed, otherwise safe deterministic DEMO mode.
    """
    if not request.image_base64:
        raise HTTPException(status_code=400, detail="image_base64 is required")
    return injury_detector.detect(request.image_base64, scenario_hint=request.scenario_hint)


@router.post("/analyze/rppg", response_model=RppgResult)
async def analyze_rppg(request: RppgInput):
    """
    Contactless pulse estimation prototype (rPPG).
    Extracts face ROI, analyzes facial skin green channel intensity over time.
    """
    return rppg_estimator.estimate(request)


@router.post("/triage", response_model=TriageResult)
async def triage_assessment(request: TriageInput):
    """
    START/RTS inspired rule-based trauma severity triage engine.
    Categorizes into RED, YELLOW, or GREEN with reasoning and immediate first-aid protocols.
    """
    return evaluate_triage(request)
