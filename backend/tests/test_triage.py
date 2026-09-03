from backend.app.schemas.schemas import TriageInput
from backend.app.services.triage_engine import evaluate_triage
from backend.app.services.trauma_score import calculate_start_rts_score


def test_triage_unresponsive_abnormal_breathing_is_red():
    """Unresponsive + abnormal breathing must trigger RED priority."""
    input_data = TriageInput(
        is_scene_safe=True,
        is_responsive=False,
        is_breathing=False,
        has_severe_bleeding=False,
        detected_injuries=[],
    )
    result = evaluate_triage(input_data)
    assert result.priority == "RED"
    assert "Unresponsive" in result.reason
    assert result.triage_score <= 4.0


def test_triage_severe_bleeding_is_red():
    """Severe bleeding triggers RED priority immediately."""
    input_data = TriageInput(
        is_scene_safe=True,
        is_responsive=True,
        is_breathing=True,
        has_severe_bleeding=True,
        detected_injuries=["severe_bleeding"],
    )
    result = evaluate_triage(input_data)
    assert result.priority == "RED"
    assert "Severe visible external bleeding" in result.reason
    assert any("pressure" in action.lower() for action in result.immediate_first_aid)


def test_triage_fracture_only_is_yellow():
    """Fracture without catastrophic hemorrhage or unconsciousness is YELLOW."""
    input_data = TriageInput(
        is_scene_safe=True,
        is_responsive=True,
        is_breathing=True,
        has_severe_bleeding=False,
        detected_injuries=["possible_fracture"],
    )
    result = evaluate_triage(input_data)
    assert result.priority == "YELLOW"
    assert "Possible bone fracture" in result.reason
    assert result.triage_score > 4.0


def test_triage_normal_is_green():
    """Responsive patient with normal breathing and no injuries is GREEN."""
    input_data = TriageInput(
        is_scene_safe=True,
        is_responsive=True,
        is_breathing=True,
        has_severe_bleeding=False,
        detected_injuries=[],
    )
    result = evaluate_triage(input_data)
    assert result.priority == "GREEN"
    assert result.triage_score >= 8.0
