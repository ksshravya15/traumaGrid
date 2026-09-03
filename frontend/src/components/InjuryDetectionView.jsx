import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { getInjuryBadge } from '../utils/formatters';

export function InjuryDetectionView({ detectionResult }) {
  if (!detectionResult) return null;

  const { detections = [], summary, model_mode, disclaimer } = detectionResult;
  const hasCritical = detections.some((d) => d.label === 'severe_bleeding' || d.label === 'airway_obstruction');
  const hasUrgent = detections.some((d) => d.label === 'open_wound' || d.label === 'possible_fracture');
  const isDemo = model_mode === 'DEMO_DETECTION';

  return (
    <div className="bg-trauma-panel border border-trauma-border rounded-2xl p-4 sm:p-5 shadow-xl mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {hasCritical ? (
            <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
          ) : hasUrgent ? (
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          )}
          <h4 className="font-extrabold text-sm sm:text-base text-white">Possible AI Findings</h4>
        </div>

        {/* Model Mode Pill */}
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
            isDemo
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
          }`}
        >
          {isDemo ? 'DEMO MODE AI' : 'REAL ONNX ACTIVE'}
        </span>
      </div>

      {/* Summary Narrative */}
      <p className="text-xs text-slate-200 mb-3.5 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
        {summary}
      </p>

      {/* Findings List */}
      <div className="space-y-2 mb-4">
        {detections.length === 0 ? (
          <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/40">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>🟢 No major visible external injury detected</span>
          </div>
        ) : (
          detections.map((det, index) => {
            const badge = getInjuryBadge(det.label);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-base">{badge.icon}</span>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-white block">
                      {badge.label}
                    </span>
                    {det.is_simulated && (
                      <span className="text-[9px] font-mono text-amber-400 uppercase">
                        [Demo Data]
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono text-slate-400">
                    {Math.round(det.confidence * 100)}% conf
                  </span>
                  <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full"
                      style={{ width: `${Math.round(det.confidence * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Legal & Medical Integrity Notice */}
      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200/90 flex items-start space-x-2">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>Safety Notice:</strong> {disclaimer || 'AI-assisted assessment — not a medical diagnosis.'}
        </span>
      </div>
    </div>
  );
}
