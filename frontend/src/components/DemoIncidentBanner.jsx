import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';

export function DemoIncidentBanner({ onLoadDemo, isLoading }) {
  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-red-500/15 to-amber-500/15 border border-amber-500/30 rounded-xl p-3 sm:p-4 mb-4 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 shrink-0">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                JUDGES DEMO SCENARIO
              </h3>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-400 text-slate-950 uppercase">
                DEMO DATA
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Scenario: <em>"Highway Collision — Unresponsive Victim, Massive Hemorrhage"</em>
            </p>
          </div>
        </div>

        <button
          onClick={onLoadDemo}
          disabled={isLoading}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-extrabold text-xs sm:text-sm rounded-lg shadow-md shadow-amber-500/20 transition-all transform active:scale-95 flex items-center justify-center space-x-2 shrink-0 border border-amber-400/40"
        >
          <Zap className="w-4 h-4 text-white" />
          <span>{isLoading ? 'LOADING SCENARIO...' : 'LOAD DEMO INCIDENT'}</span>
        </button>
      </div>
    </div>
  );
}
