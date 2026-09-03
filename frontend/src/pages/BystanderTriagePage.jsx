import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, RotateCcw, AlertTriangle, PhoneCall, Zap } from 'lucide-react';
import { DemoIncidentBanner } from '../components/DemoIncidentBanner';
import { SceneSafetyModal } from '../components/SceneSafetyModal';
import { CameraAssessment } from '../components/CameraAssessment';
import { InjuryDetectionView } from '../components/InjuryDetectionView';
import { RppgVitalEstimator } from '../components/RppgVitalEstimator';
import { TriageSummaryCard } from '../components/TriageSummaryCard';
import { TelemetryCard } from '../components/TelemetryCard';
import { IncidentMap } from '../components/IncidentMap';
import { FirstAidGuide } from '../components/FirstAidGuide';
import { analyzeInjury, evaluateTriage, createIncident, sendTelemetry } from '../services/api';
import { encodeClientTelemetry } from '../services/telemetryEncoder';
import { saveIncidentOffline } from '../services/offlineStorage';
import { useGeolocation } from '../hooks/useGeolocation';

export function BystanderTriagePage({ onNavigate, networkStatus }) {
  const { coords } = useGeolocation();
  const [step, setStep] = useState('home'); // 'home' | 'survey' | 'assessment' | 'complete'

  // Survey state
  const [isSceneSafe, setIsSceneSafe] = useState(true);
  const [isResponsive, setIsResponsive] = useState(true);
  const [isBreathing, setIsBreathing] = useState(true);
  const [hasSevereBleeding, setHasSevereBleeding] = useState(false);

  // Vision & AI state
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);

  // Vital state
  const [estimatedPulse, setEstimatedPulse] = useState(null);
  const [pulseConfidence, setPulseConfidence] = useState(0.85);
  const [pulseStatus, setPulseStatus] = useState('unavailable');

  // Triage state
  const [triageResult, setTriageResult] = useState(null);

  // Telemetry & transmission state
  const [telemetryData, setTelemetryData] = useState(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmissionStatus, setTransmissionStatus] = useState('idle'); // 'idle' | 'transmitting' | 'transmitted'
  const [activeIncidentId, setActiveIncidentId] = useState(null);
  const [isDemoIncident, setIsDemoIncident] = useState(false);

  // Trigger evaluation
  const runTriageEvaluation = async (
    injuries = [],
    pulse = estimatedPulse,
    conf = pulseConfidence,
    responsive = isResponsive,
    breathing = isBreathing,
    bleeding = hasSevereBleeding
  ) => {
    try {
      const triage = await evaluateTriage({
        is_scene_safe: isSceneSafe,
        is_responsive: responsive,
        is_breathing: breathing,
        has_severe_bleeding: bleeding,
        detected_injuries: injuries,
        estimated_pulse: pulse,
        pulse_confidence: conf,
      });
      setTriageResult(triage);

      // Generate compact micro-telemetry packet
      const incId = activeIncidentId || `inc-${Date.now()}`;
      if (!activeIncidentId) setActiveIncidentId(incId);

      const encoded = encodeClientTelemetry({
        incident_id: incId,
        timestamp: new Date().toISOString(),
        lat: coords.lat,
        lng: coords.lng,
        priority: triage.priority,
        injuries: injuries,
        heart_rate: pulse,
        confidence: conf,
        triage_score: triage.triage_score,
        is_demo: isDemoIncident,
      });
      setTelemetryData(encoded);
    } catch (err) {
      console.warn('Triage evaluation error:', err);
    }
  };

  // Image Captured from Camera
  const handleImageCaptured = async (dataUrl, scenarioHint = null) => {
    setIsAnalyzing(true);
    setCapturedImage(dataUrl);

    try {
      const result = await analyzeInjury(dataUrl, scenarioHint);
      setDetectionResult(result);
      const injuryLabels = result.detections.map((d) => d.label);

      // Re-evaluate triage with findings
      await runTriageEvaluation(injuryLabels);
    } catch (err) {
      console.warn('Image analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // rPPG Vital Estimated
  const handleVitalEstimated = async (pulse, conf, status) => {
    setEstimatedPulse(pulse);
    setPulseConfidence(conf);
    setPulseStatus(status);

    const injuryLabels = detectionResult ? detectionResult.detections.map((d) => d.label) : [];
    await runTriageEvaluation(injuryLabels, pulse, conf);
  };

  // Transmit Telemetry
  const handleTransmitTelemetry = async () => {
    if (!telemetryData) return;
    setIsTransmitting(true);

    try {
      const payload = {
        incident_id: activeIncidentId,
        latitude: coords.lat,
        longitude: coords.lng,
        location_label: coords.label,
        is_scene_safe: isSceneSafe,
        is_responsive: isResponsive,
        is_breathing: isBreathing,
        has_severe_bleeding: hasSevereBleeding,
        priority: triageResult?.priority || 'YELLOW',
        triage_score: triageResult?.triage_score || 5.0,
        triage_category: triageResult?.triage_category || 'Standard',
        triage_reason: triageResult?.reason || 'Automated Assessment',
        recommended_action: triageResult?.recommended_action || 'Emergency Care',
        estimated_pulse: estimatedPulse,
        pulse_confidence: pulseConfidence,
        pulse_status: pulseStatus,
        detections: detectionResult?.detections || [],
        is_demo: isDemoIncident,
      };

      if (networkStatus === 'offline') {
        // Queue in local storage
        saveIncidentOffline(payload);
        setTransmissionStatus('transmitted');
        console.log('[TraumaGrid] Packet stored in offline queue');
      } else {
        // Send to backend via REST / WebSocket broadcast
        await createIncident(payload);
        setTransmissionStatus('transmitted');
      }
    } catch (err) {
      console.warn('Transmission failed; queueing offline:', err);
      saveIncidentOffline(telemetryData);
      setTransmissionStatus('transmitted');
    } finally {
      setIsTransmitting(false);
    }
  };

  // Load Hackathon Demo Incident
  const handleLoadDemoIncident = async () => {
    setIsDemoIncident(true);
    setIsSceneSafe(true);
    setIsResponsive(false);
    setIsBreathing(true);
    setHasSevereBleeding(true);
    setEstimatedPulse(118.0);
    setPulseConfidence(0.88);
    setPulseStatus('estimated');
    setStep('assessment');

    const demoDetections = {
      detections: [
        { label: 'severe_bleeding', confidence: 0.89, bounding_box: [0.35, 0.42, 0.28, 0.32], is_simulated: true },
        { label: 'possible_fracture', confidence: 0.76, bounding_box: [0.55, 0.60, 0.22, 0.28], is_simulated: true },
        { label: 'person', confidence: 0.95, bounding_box: [0.12, 0.08, 0.76, 0.85], is_simulated: true },
      ],
      person_detected: true,
      summary: 'DEMO MODE: Severe bleeding and suspected lower-limb fracture detected via scene pattern.',
      model_mode: 'DEMO_DETECTION',
      disclaimer: 'AI-assisted assessment — not a medical diagnosis. Prototype running in DEMO mode.',
    };
    setDetectionResult(demoDetections);

    // Run triage
    await runTriageEvaluation(
      ['severe_bleeding', 'possible_fracture'],
      118.0,
      0.88,
      false, // unresponsive
      true, // breathing
      true // severe bleeding
    );
  };

  const handleReset = () => {
    setStep('home');
    setIsSceneSafe(true);
    setIsResponsive(true);
    setIsBreathing(true);
    setHasSevereBleeding(false);
    setCapturedImage(null);
    setDetectionResult(null);
    setEstimatedPulse(null);
    setTriageResult(null);
    setTelemetryData(null);
    setTransmissionStatus('idle');
    setIsDemoIncident(false);
    setActiveIncidentId(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      {/* 1-Click Demo Scenario Banner */}
      <DemoIncidentBanner onLoadDemo={handleLoadDemoIncident} />

      {/* VIEW 1: HOME LANDING */}
      {step === 'home' && (
        <div className="text-center py-6 sm:py-10">
          <div className="inline-flex items-center justify-center p-4 bg-red-600/10 text-red-500 rounded-3xl mb-6 ring-1 ring-red-500/20 shadow-2xl">
            <ShieldAlert className="w-16 h-16 animate-pulse" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
            TRAUMAGRID
          </h1>
          <p className="text-sm sm:text-base text-red-400 font-semibold mb-2">
            AI-Powered Golden-Hour Trauma Triage — Even When Networks Fail
          </p>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-8">
            Edge AI • Contactless Vitals • Ultra-Low-Bandwidth Emergency Telemetry for Rapid Bystander Assessment
          </p>

          {/* Large Emergency Start Button */}
          <button
            type="button"
            onClick={() => setStep('survey')}
            className="w-full max-w-md mx-auto py-5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-black text-lg sm:text-xl tracking-wide shadow-2xl shadow-red-600/40 transform active:scale-95 transition-all flex items-center justify-center space-x-3 border border-red-400/40"
          >
            <span>START EMERGENCY ASSESSMENT</span>
            <ArrowRight className="w-6 h-6" />
          </button>

          {/* Secondary Action Buttons */}
          <div className="mt-8 flex items-center justify-center space-x-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
            >
              Responder Dashboard
            </button>
            <button
              onClick={() => onNavigate('first-aid')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
            >
              First Aid Guide
            </button>
          </div>

          <div className="mt-12 p-3 bg-slate-900/60 rounded-xl border border-slate-800 max-w-md mx-auto text-[11px] text-slate-400">
            🔒 No sign-in required. No data stored without consent. Optimized for 2G / low-bandwidth mobile devices.
          </div>
        </div>
      )}

      {/* VIEW 2: STEP 1 - SCENE SAFETY MODAL */}
      {step === 'survey' && (
        <SceneSafetyModal
          isSceneSafe={isSceneSafe}
          setIsSceneSafe={setIsSceneSafe}
          isResponsive={isResponsive}
          setIsResponsive={setIsResponsive}
          isBreathing={isBreathing}
          setIsBreathing={setIsBreathing}
          hasSevereBleeding={hasSevereBleeding}
          setHasSevereBleeding={setHasSevereBleeding}
          onProceed={() => {
            setStep('assessment');
            runTriageEvaluation([], null, 0.85, isResponsive, isBreathing, hasSevereBleeding);
          }}
          onBack={() => setStep('home')}
        />
      )}

      {/* VIEW 3: MULTIMODAL ASSESSMENT & RESULTS */}
      {step === 'assessment' && (
        <div className="space-y-4">
          {/* Action Ribbon */}
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                ACTIVE TRIAGE SESSION
              </span>
              {isDemoIncident && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-400 text-slate-950 uppercase">
                  DEMO DATA
                </span>
              )}
            </div>

            <button
              onClick={handleReset}
              className="text-xs font-medium text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Camera Component */}
          <CameraAssessment
            onImageCaptured={handleImageCaptured}
            isAnalyzing={isAnalyzing}
            capturedImage={capturedImage}
            setCapturedImage={setCapturedImage}
          />

          {/* AI Findings List */}
          <InjuryDetectionView detectionResult={detectionResult} />

          {/* rPPG Contactless Pulse Estimator */}
          <RppgVitalEstimator
            onVitalEstimated={handleVitalEstimated}
            currentPulse={estimatedPulse}
            pulseStatus={pulseStatus}
            initialBpm={isDemoIncident ? 118 : 78}
          />

          {/* Triage Decision Card */}
          {triageResult && <TriageSummaryCard triageResult={triageResult} />}

          {/* Telemetry Transmission Card */}
          {telemetryData && (
            <TelemetryCard
              telemetryData={telemetryData}
              isTransmitting={isTransmitting}
              onTransmit={handleTransmitTelemetry}
              transmissionStatus={transmissionStatus}
            />
          )}

          {/* Incident Location Map */}
          <IncidentMap
            lat={coords.lat}
            lng={coords.lng}
            priority={triageResult?.priority || 'RED'}
            locationLabel={coords.label}
            isDemo={coords.isDemo || isDemoIncident}
          />

          {/* First-Aid Guidance */}
          <FirstAidGuide
            highlightedModule={
              hasSevereBleeding || detectionResult?.detections?.some((d) => d.label === 'severe_bleeding')
                ? 'severe_bleeding'
                : !isBreathing
                ? 'cpr'
                : !isResponsive
                ? 'airway'
                : 'fracture'
            }
          />
        </div>
      )}
    </div>
  );
}
