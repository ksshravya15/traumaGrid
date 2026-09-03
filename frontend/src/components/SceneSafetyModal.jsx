import React from 'react';
import { AlertOctagon, CheckCircle2, XCircle, ShieldCheck, ArrowRight } from 'lucide-react';

export function SceneSafetyModal({
  isSceneSafe,
  setIsSceneSafe,
  isResponsive,
  setIsResponsive,
  isBreathing,
  setIsBreathing,
  hasSevereBleeding,
  setHasSevereBleeding,
  onProceed,
  onBack,
}) {
  return (
    <div className="bg-trauma-panel border border-trauma-border rounded-2xl p-4 sm:p-6 shadow-2xl max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-5 pb-4 border-b border-slate-800">
        <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30">
          <AlertOctagon className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <span className="text-[11px] font-mono tracking-widest text-red-400 uppercase font-bold">
            STEP 1 • PRIMARY SURVEY
          </span>
          <h2 className="text-xl font-extrabold text-white">Scene Safety & Status</h2>
        </div>
      </div>

      {/* Question 1: Scene Safety */}
      <div className="mb-5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-100">1. Is the scene safe to approach?</span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Check for incoming highway traffic, fire, exposed electrical wires, or chemical spills.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsSceneSafe(true)}
            className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
              isSceneSafe
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>YES — SAFE</span>
          </button>
          <button
            type="button"
            onClick={() => setIsSceneSafe(false)}
            className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
              !isSceneSafe
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-2 ring-red-400'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <XCircle className="w-5 h-5" />
            <span>NO — HAZARD</span>
          </button>
        </div>
        {!isSceneSafe && (
          <div className="mt-2.5 p-2 rounded bg-red-900/30 border border-red-700/50 text-[11px] text-red-200">
            ⚠️ <strong>DO NOT PUT YOURSELF AT RISK:</strong> Move to a secure distance and call emergency dispatch (108/112) immediately.
          </div>
        )}
      </div>

      {/* Question 2: Responsiveness */}
      <div className="mb-4 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <span className="block text-sm font-bold text-slate-100 mb-1">
          2. Is the victim responsive?
        </span>
        <p className="text-xs text-slate-400 mb-2.5">
          Tap shoulders and shout: "Are you okay?" Does the victim speak, blink, or move?
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsResponsive(true)}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isResponsive
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            YES — RESPONSIVE
          </button>
          <button
            type="button"
            onClick={() => setIsResponsive(false)}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              !isResponsive
                ? 'bg-red-600 text-white ring-2 ring-red-400 shadow-md shadow-red-600/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            NO — UNCONSCIOUS
          </button>
        </div>
      </div>

      {/* Question 3: Breathing */}
      <div className="mb-4 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <span className="block text-sm font-bold text-slate-100 mb-1">
          3. Is the victim breathing normally?
        </span>
        <p className="text-xs text-slate-400 mb-2.5">
          Look at the chest. Is it rising and falling rhythmically? Listen for gasping/wheezing.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsBreathing(true)}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isBreathing
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            YES — BREATHING
          </button>
          <button
            type="button"
            onClick={() => setIsBreathing(false)}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              !isBreathing
                ? 'bg-red-600 text-white ring-2 ring-red-400 shadow-md shadow-red-600/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            NO — ABNORMAL / STOPPED
          </button>
        </div>
      </div>

      {/* Question 4: Severe Bleeding */}
      <div className="mb-6 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <span className="block text-sm font-bold text-slate-100 mb-1">
          4. Is there severe, spurting, or soaking bleeding?
        </span>
        <p className="text-xs text-slate-400 mb-2.5">
          Look for pooling blood or active spurting wounds on limbs or torso.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setHasSevereBleeding(true)}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              hasSevereBleeding
                ? 'bg-red-600 text-white ring-2 ring-red-400 shadow-md shadow-red-600/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            YES — SEVERE BLEEDING
          </button>
          <button
            type="button"
            onClick={() => setHasSevereBleeding(false)}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              !hasSevereBleeding
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            NO — CONTROLLED / NONE
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-1/3 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={onProceed}
          className="flex-1 py-3.5 px-4 rounded-xl text-sm sm:text-base font-extrabold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-xl shadow-red-600/30 transition-all flex items-center justify-center space-x-2 active:scale-98"
        >
          <span>PROCEED TO CAMERA SCAN</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
