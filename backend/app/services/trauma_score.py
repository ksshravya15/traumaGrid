from typing import List, Optional, Tuple

"""
START / RTS Inspired Trauma Scoring Engine
==========================================
DISCLAIMER:
This scoring module is a prototype inspired by emergency medical triage protocols
including START (Simple Triage and Rapid Treatment) and Revised Trauma Score (RTS).
It is NOT an officially validated clinical score and must NOT replace clinical judgment.

Scoring Mechanics (0 to 12 scale):
- Neurological Responsiveness (0-4 pts):
    Responsive / Follows commands = 4 pts
    Unresponsive = 0 pts
- Respiratory Status (0-4 pts):
    Normal breathing (approx. 12-20 bpm) = 4 pts
    Abnormal / labored / shallow = 1 pt
    Absent / stopped = 0 pts
- Perfusion & Hemorrhage Control (0-4 pts):
    No severe bleeding & pulse normal (60-100) = 4 pts
    No severe bleeding & pulse mildly elevated (100-120) = 3 pts
    Fracture or open wound present = 2 pts
    Severe bleeding / pulse > 130 or < 40 = 0 pts

Total Trauma Score:
- 0 to 4: Critical Trauma (Immediate Life Threat / Priority 1)
- 5 to 8: Moderate / Urgent Trauma (Priority 2)
- 9 to 12: Minor / Stable (Priority 3)
"""


def calculate_start_rts_score(
    is_responsive: bool,
    is_breathing: bool,
    has_severe_bleeding: bool,
    estimated_pulse: Optional[float] = None,
    detected_injuries: Optional[List[str]] = None,
) -> Tuple[float, str, str]:
    injuries = detected_injuries or []
    
    # 1. Neurological / GCS-equivalent component (0 - 4)
    neuro_pts = 4.0 if is_responsive else 0.0

    # 2. Respiratory component (0 - 4)
    if not is_breathing:
        resp_pts = 0.0
    elif "airway_obstruction" in injuries:
        resp_pts = 1.0
    else:
        resp_pts = 4.0

    # 3. Hemodynamics & Perfusion component (0 - 4)
    if has_severe_bleeding or "severe_bleeding" in injuries:
        perf_pts = 0.0
    elif estimated_pulse is not None and (estimated_pulse > 130 or estimated_pulse < 40):
        perf_pts = 1.0
    elif "open_wound" in injuries or "possible_fracture" in injuries:
        perf_pts = 2.0
    elif estimated_pulse is not None and (100 <= estimated_pulse <= 130):
        perf_pts = 3.0
    else:
        perf_pts = 4.0

    total_score = neuro_pts + resp_pts + perf_pts

    if total_score <= 4.0:
        category = "Critical (Priority 1)"
        explanation = (
            f"Score {total_score:.1f}/12.0: Significant physiological compromise detected "
            f"(Neuro: {neuro_pts}, Resp: {resp_pts}, Perfusion: {perf_pts}). Immediate resuscitation required."
        )
    elif total_score <= 8.0:
        category = "Urgent (Priority 2)"
        explanation = (
            f"Score {total_score:.1f}/12.0: Moderate trauma compromise detected "
            f"(Neuro: {neuro_pts}, Resp: {resp_pts}, Perfusion: {perf_pts}). Prompt transport and stabilization needed."
        )
    else:
        category = "Stable (Priority 3)"
        explanation = (
            f"Score {total_score:.1f}/12.0: Normal baseline vitals and no severe external hemorrhage observed "
            f"(Neuro: {neuro_pts}, Resp: {resp_pts}, Perfusion: {perf_pts})."
        )

    return total_score, category, explanation
