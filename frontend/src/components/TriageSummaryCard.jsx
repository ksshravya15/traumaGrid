import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, FileText, ArrowRightCircle } from 'lucide-react';
import { getPriorityTheme } from '../utils/formatters';

export function TriageSummaryCard({ triageResult }) {
  if (!triageResult) return null;

  const { priority, triage_score, triage_category, reason, recommended_action, immediate_first_aid = [] } = triageResult;
  const theme = getPriorityTheme(priority);

  return (
    <div className={`border-2 rounded-2xl p-4 sm:p-6 shadow-2xl mt-4 transition-all ${theme.border} ${theme.bg}`}>
      {/* Priority Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${theme.badge}`}>
            {priority === 'RED' && <AlertCircle className="w-7 h-7 animate-pulse text-white" />}
            {priority === 'YELLOW' && <AlertTriangle className="w-7 h-7 text-slate-900" />}
            {priority === 'GREEN' && <ShieldCheck className="w-7 h-7 text-slate-900" />}
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300 block">
              TRAUMA SEVERITY CLASSIFICATION
            </span>
            <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${theme.text}`}>
              {theme.label}
            </h3>
          </div>
        </div>

        {/* START / RTS Score Badge */}
        <div className="bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center space-x-2 self-start sm:self-center">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">START / RTS Score</span>
            <span className="text-xs font-mono font-bold text-white">
              {triage_score !== undefined ? `${triage_score} / 12.0` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Transparent Reasoning */}
      <div className="mb-4 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2 mb-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Automated Clinical Reasoning
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
          {reason}
        </p>
      </div>

      {/* Recommended Emergency Action */}
      <div className="mb-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700">
        <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider block mb-1">
          RECOMMENDED DISPATCH PROTOCOL
        </span>
        <p className="text-xs sm:text-sm font-semibold text-white">
          {recommended_action}
        </p>
      </div>

      {/* Immediate Bystander Actions */}
      {immediate_first_aid.length > 0 && (
        <div>
          <span className="text-xs font-mono font-bold uppercase text-slate-300 block mb-2">
            Immediate Next Actions for Bystander:
          </span>
          <div className="space-y-1.5">
            {immediate_first_aid.map((action, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2 text-xs sm:text-sm text-slate-200 bg-slate-900/40 p-2 rounded-lg"
              >
                <ArrowRightCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
