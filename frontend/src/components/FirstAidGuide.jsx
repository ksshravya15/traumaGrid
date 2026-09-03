import React, { useState, useEffect } from 'react';
import { FIRST_AID_MODULES, MEDICAL_SAFETY_DISCLAIMER } from '../data/firstAidData';
import { ShieldAlert, AlertTriangle, PhoneCall, Volume2, VolumeX, Play, Square, Heart } from 'lucide-react';

export function FirstAidGuide({ highlightedModule = null }) {
  const [activeTab, setActiveTab] = useState(highlightedModule || 'severe_bleeding');
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [metronomeBeat, setMetronomeBeat] = useState(false);

  // Sync if highlightedModule changes from triage engine
  useEffect(() => {
    if (highlightedModule) {
      setActiveTab(highlightedModule);
    }
  }, [highlightedModule]);

  // CPR Metronome Effect (110 BPM -> ~545ms per beat)
  useEffect(() => {
    let interval = null;
    if (isMetronomeActive) {
      interval = setInterval(() => {
        setMetronomeBeat((b) => !b);
      }, 545);
    } else {
      setMetronomeBeat(false);
    }
    return () => clearInterval(interval);
  }, [isMetronomeActive]);

  const currentModule = FIRST_AID_MODULES.find((m) => m.id === activeTab) || FIRST_AID_MODULES[0];

  return (
    <div className="bg-trauma-panel border border-trauma-border rounded-2xl p-4 sm:p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-white">Emergency First-Aid Protocols</h3>
            <p className="text-xs text-slate-400">Essential actions while waiting for paramedics</p>
          </div>
        </div>

        <a
          href="tel:112"
          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-red-600/30"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>CALL 112 / 108</span>
        </a>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {FIRST_AID_MODULES.map((mod) => (
          <button
            key={mod.id}
            type="button"
            onClick={() => setActiveTab(mod.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === mod.id
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {mod.title}
          </button>
        ))}
      </div>

      {/* Module Content */}
      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-base font-extrabold text-white">{currentModule.title}</h4>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white ${currentModule.badgeColor}`}>
            {currentModule.severity}
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-4 font-medium">{currentModule.summary}</p>

        {/* Steps List */}
        <div className="space-y-3">
          {currentModule.steps.map((item) => (
            <div
              key={item.step}
              className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80"
            >
              <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-red-500/40">
                {item.step}
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-white">{item.action}</h5>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CPR Metronome Box */}
        {currentModule.id === 'cpr' && (
          <div className="mt-4 p-3.5 bg-red-950/40 rounded-xl border border-red-800/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                  metronomeBeat ? 'scale-125 bg-red-500 text-white shadow-[0_0_15px_#ef4444]' : 'scale-100 bg-red-900/60 text-red-300'
                }`}
              >
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">CPR Rhythm Beat (110 BPM)</span>
                <span className="text-[11px] text-slate-300">Target: 100–120 compressions/min</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMetronomeActive(!isMetronomeActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                isMetronomeActive ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {isMetronomeActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isMetronomeActive ? 'STOP BEAT' : 'START BEAT'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Mandatory Repeated Medical Disclaimer */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200 block mb-0.5">Critical Emergency Reminder:</strong>
          <p className="mb-1">{MEDICAL_SAFETY_DISCLAIMER}</p>
          <span className="text-amber-400 font-medium block">
            Follow professional emergency-dispatch instructions. TraumaGrid is an assistive prototype and does not replace trained medical personnel.
          </span>
        </div>
      </div>
    </div>
  );
}
