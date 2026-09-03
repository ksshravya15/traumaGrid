import React from 'react';
import { FirstAidGuide } from '../components/FirstAidGuide';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function FirstAidPage({ onNavigate }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('bystander')}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Triage</span>
        </button>

        <span className="text-xs font-mono text-slate-400">Emergency Protocol Manual</span>
      </div>

      <FirstAidGuide />
    </div>
  );
}
