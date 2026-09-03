import React from 'react';
import { Wifi, WifiOff, Signal, RefreshCw } from 'lucide-react';

export function NetworkBanner({ status, simulatedMode, onSetMode, offlineCount, onSync, isSyncing }) {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center space-x-2 text-slate-300">
        {status === 'online' && <Wifi className="w-4 h-4 text-emerald-400" />}
        {status === 'weak_2g' && <Signal className="w-4 h-4 text-amber-400" />}
        {status === 'offline' && <WifiOff className="w-4 h-4 text-red-400" />}
        <span>
          {status === 'online' && (
            <span className="text-slate-300">
              Network active. Telemetry transmits via <strong className="text-emerald-400">WebSocket</strong>.
            </span>
          )}
          {status === 'weak_2g' && (
            <span className="text-amber-300">
              Simulating <strong>2G / LoRa</strong> network (High latency, ultra-compact packets prioritized).
            </span>
          )}
          {status === 'offline' && (
            <span className="text-red-300">
              <strong>Offline Mode</strong>: Triage functions locally. Telemetry will queue in storage.
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-[11px] text-slate-400 hidden sm:inline">Simulate Bandwidth:</span>
        <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
          <button
            onClick={() => onSetMode('online')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              simulatedMode === 'online' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Online
          </button>
          <button
            onClick={() => onSetMode('weak_2g')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              simulatedMode === 'weak_2g' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            2G / LoRa
          </button>
          <button
            onClick={() => onSetMode('offline')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              simulatedMode === 'offline' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Offline
          </button>
        </div>

        {offlineCount > 0 && (
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] flex items-center space-x-1"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync ({offlineCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}
