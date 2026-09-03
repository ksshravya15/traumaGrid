from typing import List, Optional, Tuple
from backend.app.schemas.schemas import TriageInput, TriageResult
from backend.app.services.trauma_score import calculate_start_rts_score


def evaluate_triage(data: TriageInput) -> TriageResult:
    """
    Transparent rule-based trauma triage engine implementing START/RTS principles.
    Evaluates primary survey (airway, breathing, circulation, disability)
    and computer-vision injury indicators to categorize into:
      - RED (Immediate / Critical)
      - YELLOW (Delayed / Urgent)
      - GREEN (Minor / Walking Wounded)
    """
    reasons: List[str] = []
    immediate_actions: List[str] = []
    
    # Priority assessment flags
    is_red = False
    is_yellow = False

    # 1. Primary Vital Survey Checks
    if not data.is_responsive and not data.is_breathing:
        is_red = True
        reasons.append("Unresponsive patient with abnormal/absent breathing (Possible Cardiac/Respiratory Arrest)")
        immediate_actions.append("Call emergency dispatch (108/112/911) immediately")
        immediate_actions.append("Begin CPR: 30 chest compressions followed by 2 rescue breaths if trained")
    elif not data.is_breathing:
        is_red = True
        reasons.append("Abnormal or obstructed breathing detected")
        immediate_actions.append("Check and clear airway obstruction without flexing neck")
    elif not data.is_responsive:
        is_red = True
        reasons.append("Patient is unconscious / unresponsive to verbal or physical stimuli")
        immediate_actions.append("Keep patient still, protect cervical spine, monitor breathing closely")

    # 2. Severe Bleeding (Massive Hemorrhage)
    has_bleeding_detection = any(
        inj in ["severe_bleeding", "massive_bleeding"] for inj in data.detected_injuries
    )
    if data.has_severe_bleeding or has_bleeding_detection:
        is_red = True
        reasons.append("Severe visible external bleeding / massive hemorrhage identified")
        immediate_actions.append("Apply firm direct pressure with clean cloth or sterile gauze")
        immediate_actions.append("If arterial limb bleeding does not stop and trained, consider tourniquet application above wound")

    # 3. Airway Obstruction Detection
    if "airway_obstruction" in data.detected_injuries:
        is_red = True
        reasons.append("Suspected airway obstruction or trauma to neck/face")
        immediate_actions.append("Maintain clear airway; do not move head/neck unless trained")

    # 4. Vital Signs (Estimated rPPG Pulse) Check
    if data.estimated_pulse is not None and (data.pulse_confidence or 0.0) >= 0.5:
        pulse = data.estimated_pulse
        if pulse > 130:
            is_red = True
            reasons.append(f"Severe tachycardia (Estimated pulse {pulse:.0f} BPM) - possible hemorrhagic shock")
            immediate_actions.append("Keep patient warm and calm, elevate legs slightly if no pelvic/spinal injury")
        elif pulse < 40:
            is_red = True
            reasons.append(f"Severe bradycardia (Estimated pulse {pulse:.0f} BPM) - hemodynamic collapse risk")
        elif 100 <= pulse <= 130 or 40 <= pulse < 55:
            is_yellow = True
            reasons.append(f"Abnormal pulse rate (Estimated pulse {pulse:.0f} BPM)")

    # 5. Secondary Injuries (Wounds & Fractures)
    has_fracture = "possible_fracture" in data.detected_injuries
    has_open_wound = "open_wound" in data.detected_injuries

    if has_fracture:
        is_yellow = True
        reasons.append("Possible bone fracture / deformity observed")
        immediate_actions.append("Immobilize injured limb; do not attempt to straighten or realign bone")

    if has_open_wound and not (data.has_severe_bleeding or has_bleeding_detection):
        is_yellow = True
        reasons.append("Open wound without catastrophic hemorrhage")
        immediate_actions.append("Cover wound with clean dressing to prevent contamination")

    # 6. Final Priority Determination
    if is_red:
        priority = "RED"
        triage_category = "Immediate Priority (Code Red)"
        recommended_action = "IMMEDIATE EMERGENCY RESPONSE REQUIRED. Dispatch ALS (Advanced Life Support) ambulance with trauma kit."
    elif is_yellow:
        priority = "YELLOW"
        triage_category = "Delayed / Urgent Priority (Code Yellow)"
        recommended_action = "URGENT RESPONSE REQUIRED. Patient requires prompt clinical stabilization and secondary transport."
    else:
        priority = "GREEN"
        triage_category = "Minor / Stable (Code Green)"
        reasons.append("Patient is responsive, breathing normally, with no visible catastrophic bleeding or acute deformity")
        recommended_action = "MONITOR AND COMFORT. Re-evaluate if condition deteriorates; non-urgent transport as needed."
        immediate_actions.append("Keep patient calm and seated in a safe location away from traffic")
        immediate_actions.append("Regularly re-check breathing and responsiveness every 2 minutes")

    # Calculate START/RTS Trauma Score
    score, score_category, score_explanation = calculate_start_rts_score(
        is_responsive=data.is_responsive,
        is_breathing=data.is_breathing,
        has_severe_bleeding=data.has_severe_bleeding or has_bleeding_detection,
        estimated_pulse=data.estimated_pulse,
        detected_injuries=data.detected_injuries,
    )

    full_reason = " | ".join(reasons) if reasons else "Standard automated assessment completed."

    return TriageResult(
        priority=priority,
        triage_score=score,
        triage_category=triage_category,
        reason=full_reason,
        recommended_action=recommended_action,
        immediate_first_aid=immediate_actions,
    )
