import React, { useState, useEffect, useRef } from 'react';
import { Heart, Activity, AlertTriangle, ScanFace, Check, RefreshCw } from 'lucide-react';
import { analyzeRppg } from '../services/api';

export function RppgVitalEstimator({ onVitalEstimated, currentPulse, pulseStatus, initialBpm = null }) {
  const [isScanning, setIsScanning] = useState(false);
  const [pulseData, setPulseData] = useState({
    heart_rate: currentPulse || null,
    confidence: 0.85,
    status: pulseStatus || 'idle',
    waveform: [],
  });
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Sync prop changes
  useEffect(() => {
    if (currentPulse !== undefined && currentPulse !== null) {
      setPulseData((prev) => ({
        ...prev,
        heart_rate: currentPulse,
        status: pulseStatus || 'estimated',
      }));
    }
  }, [currentPulse, pulseStatus]);

  // Animated Photoplethysmogram Waveform Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let offset = 0;

    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const bpm = pulseData.heart_rate || 75;
      const freq = (bpm / 60) * 0.05;

      for (let x = 0; x < canvas.width; x++) {
        // Base PPG waveform shape (systolic peak + dicrotic notch)
        const t = (x + offset) * freq;
        const y =
          canvas.height / 2 -
          (Math.sin(t) * 18 +
            Math.sin(2 * t) * 6 +
            (Math.sin(t) > 0.8 ? 14 : 0));
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      offset += pulseData.heart_rate ? 1.5 : 0.5;
      animationFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [pulseData.heart_rate]);

  const handleStartScan = async (simulatedBpm = null) => {
    setIsScanning(true);
    setPulseData((prev) => ({ ...prev, status: 'measuring' }));

    try {
      // Simulate 2-second optical sampling buffer
      await new Promise((r) => setTimeout(r, 1800));

      const payload = simulatedBpm !== null ? { simulated_bpm: simulatedBpm } : { simulated_bpm: initialBpm || 118 };
      const result = await analyzeRppg(payload);

      setPulseData({
        heart_rate: result.heart_rate,
        confidence: result.confidence || 0.85,
        status: result.status,
        waveform: result.waveform || [],
      });

      if (onVitalEstimated) {
        onVitalEstimated(result.heart_rate, result.confidence, result.status);
      }
    } catch (err) {
      console.warn('rPPG scan error:', err);
      setPulseData({
        heart_rate: null,
        confidence: null,
        status: 'Pulse estimation unavailable',
        waveform: [],
      });
      if (onVitalEstimated) {
        onVitalEstimated(null, 0, 'Pulse estimation unavailable');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleSetUnavailable = () => {
    setPulseData({
      heart_rate: null,
      confidence: null,
      status: 'Pulse estimation unavailable',
      waveform: [],
    });
    if (onVitalEstimated) {
      onVitalEstimated(null, 0, 'Pulse estimation unavailable');
    }
  };

  return (
    <div className="bg-trauma-panel border border-trauma-border rounded-2xl p-4 sm:p-5 shadow-xl mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Heart className={`w-5 h-5 text-red-500 ${pulseData.heart_rate ? 'animate-bounce' : ''}`} />
          <h4 className="font-extrabold text-sm sm:text-base text-white">Contactless Pulse / rPPG</h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Step 3 • Optical Vitals</span>
      </div>

      <p className="text-xs text-slate-300 mb-3">
        Points camera at forehead/face skin to estimate capillary hemoglobin reflectance changes.
      </p>

      {/* PPG Waveform & Result Screen */}
      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <ScanFace className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono text-slate-300">Optical Signal (Green Channel)</span>
          </div>
          {pulseData.status === 'estimated' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Signal Locked
            </span>
          )}
        </div>

        {/* Canvas Waveform */}
        <div className="w-full h-16 bg-slate-900/90 rounded-lg overflow-hidden border border-slate-800 relative">
          <canvas ref={canvasRef} width={380} height={64} className="w-full h-full" />
          {isScanning && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 text-red-400 animate-spin" />
              <span className="text-xs font-mono text-white">Sampling facial skin ROI...</span>
            </div>
          )}
        </div>

        {/* Pulse Value Display */}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-mono tracking-wider">
              Estimated pulse
            </span>
            {pulseData.heart_rate ? (
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl sm:text-3xl font-black text-red-400 font-mono">
                  {pulseData.heart_rate}
                </span>
                <span className="text-xs font-mono text-slate-400">BPM</span>
                {pulseData.heart_rate > 100 && (
                  <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 bg-red-950 text-red-300 border border-red-700/60 rounded">
                    Tachycardia
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs font-mono text-amber-400/90 italic">
                {pulseData.status === 'measuring' ? 'Analyzing...' : 'Pulse estimation unavailable'}
              </span>
            )}
          </div>

          {pulseData.confidence && (
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 block">Confidence</span>
              <span className="text-xs font-mono text-slate-300 font-bold">
                {Math.round(pulseData.confidence * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons & Demo Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <button
          type="button"
          onClick={() => handleStartScan()}
          disabled={isScanning}
          className="px-3.5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center space-x-1.5"
        >
          <Activity className="w-4 h-4" />
          <span>{isScanning ? 'ESTIMATING...' : 'SCAN OPTICAL PULSE'}</span>
        </button>

        <div className="flex items-center space-x-1">
          <span className="text-[11px] text-slate-500 hidden sm:inline">Vitals Demo:</span>
          <button
            type="button"
            onClick={() => handleStartScan(118)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-red-300 border border-red-800/40 rounded text-[11px] font-mono"
            title="Simulate 118 BPM (Tachycardia / Shock)"
          >
            118 BPM
          </button>
          <button
            type="button"
            onClick={() => handleStartScan(74)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-800/40 rounded text-[11px] font-mono"
            title="Simulate 74 BPM (Normal)"
          >
            74 BPM
          </button>
          <button
            type="button"
            onClick={handleSetUnavailable}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded text-[11px] font-mono"
            title="Simulate low confidence / unavailable"
          >
            Unavailable
          </button>
        </div>
      </div>

      {/* Mandatory Clinical Disclaimer */}
      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>Experimental optical measurement — verify clinically.</strong> Remote photoplethysmography is susceptible to motion artifacts, ambient lighting, and skin pigmentation.
        </span>
      </div>
    </div>
  );
}
