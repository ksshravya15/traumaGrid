import React, { useState } from 'react';
import { Send, CheckCircle, Copy, Radio, Zap, Layers, FileCode } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export function TelemetryCard({ telemetryData, isTransmitting, onTransmit, transmissionStatus }) {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  if (!telemetryData) return null;

  const { jsonString, byteCount, base64 } = telemetryData;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Video comparison math (assuming 4.5 MB for 10-second compressed video)
  const videoBytes = 4.5 * 1024 * 1024;
  const compressionRatio = Math.round(videoBytes / (byteCount || 1));

  return (
    <div className="bg-trauma-panel border border-trauma-border rounded-2xl p-4 sm:p-5 shadow-2xl mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
          <h4 className="font-extrabold text-sm sm:text-base text-white">Ultra-Low-Bandwidth Telemetry</h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Step 4 • Micro-Packet</span>
      </div>

      <p className="text-xs text-slate-300 mb-3">
        Instead of saturating networks with 4K/HD video streams, TraumaGrid encodes vital triage data into an ultra-compact packet.
      </p>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Exact Payload Size</span>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {formatBytes(byteCount)}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">UTF-8 Encoded</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Bandwidth Saving</span>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-blue-400 font-mono">
              {compressionRatio}x
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">vs. 10s Video (4.5 MB)</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Transmission</span>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-base sm:text-lg font-bold text-white font-mono">
              WebSocket / 2G
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">LoRa / SMS Ready</span>
        </div>
      </div>

      {/* Payload Viewer */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <button
            type="button"
            onClick={() => setShowJson(!showJson)}
            className="text-[11px] font-mono text-blue-400 hover:text-blue-300 flex items-center space-x-1"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{showJson ? 'Hide JSON Payload' : 'View Raw Telemetry Packet'}</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <Copy className="w-3 h-3" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {showJson && (
          <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
            {jsonString}
          </pre>
        )}
      </div>

      {/* Action Button */}
      {onTransmit && (
        <button
          type="button"
          onClick={onTransmit}
          disabled={isTransmitting || transmissionStatus === 'transmitted'}
          className={`w-full py-3.5 px-4 rounded-xl text-sm sm:text-base font-extrabold flex items-center justify-center space-x-2 transition-all shadow-xl ${
            transmissionStatus === 'transmitted'
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 active:scale-98'
          }`}
        >
          {transmissionStatus === 'transmitted' ? (
            <>
              <CheckCircle className="w-5 h-5 text-white" />
              <span>TELEMETRY DELIVERED TO RESPONDER HUB</span>
            </>
          ) : isTransmitting ? (
            <>
              <Radio className="w-5 h-5 text-white animate-spin" />
              <span>TRANSMITTING VIA WEBSOCKET...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 text-white" />
              <span>TRANSMIT TELEMETRY TO RESPONDER DASHBOARD</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
