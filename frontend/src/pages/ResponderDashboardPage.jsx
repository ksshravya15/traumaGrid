import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Heart,
  Clock,
  Send,
  Layers,
  CheckCircle2,
  Ambulance,
  PhoneCall,
  FileCode,
  X,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { listIncidents, updateIncidentStatus, getIncident } from '../services/api';
import { dashboardWs } from '../services/websocket';
import { IncidentMap } from '../components/IncidentMap';
import { formatBytes, formatTime, formatDate, getPriorityTheme, getInjuryBadge } from '../utils/formatters';

export function ResponderDashboardPage() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [newIncidentAlert, setNewIncidentAlert] = useState(null);

  // Fetch initial incidents
  const loadIncidents = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await listIncidents();
      setIncidents(data);
      if (data.length > 0 && !selectedIncident) {
        setSelectedIncident(data[0]);
      }
    } catch (err) {
      console.warn('Failed to load incidents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedIncident]);

  useEffect(() => {
    loadIncidents();

    // Subscribe to real-time WebSocket events
    const unsubscribe = dashboardWs.subscribe((msg) => {
      if (msg.event === 'CONNECTION_STATUS') {
        setWsConnected(msg.connected);
      } else if (msg.event === 'NEW_INCIDENT') {
        console.log('[Dashboard WS] New incident received:', msg.incident);
        // Prepend to incidents list
        setIncidents((prev) => {
          const exists = prev.some((i) => i.id === msg.incident.id);
          if (exists) return prev;
          return [
            {
              ...msg.incident,
              latitude: msg.incident.lat,
              longitude: msg.incident.lng,
              detections: msg.incident.injuries?.map((inj) => ({ label: inj, confidence: 0.88, is_simulated: true })) || [],
            },
            ...prev,
          ];
        });
        setNewIncidentAlert(msg.incident);
        setTimeout(() => setNewIncidentAlert(null), 5000);
      } else if (msg.event === 'STATUS_UPDATE') {
        setIncidents((prev) =>
          prev.map((inc) => (inc.id === msg.incident_id ? { ...inc, status: msg.status } : inc))
        );
        if (selectedIncident?.id === msg.incident_id) {
          setSelectedIncident((prev) => (prev ? { ...prev, status: msg.status } : prev));
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loadIncidents, selectedIncident]);

  // Handle status update (Simulated CAD Dispatch)
  const handleUpdateStatus = async (incidentId, newStatus) => {
    try {
      await updateIncidentStatus(incidentId, newStatus);
      setIncidents((prev) =>
        prev.map((i) => (i.id === incidentId ? { ...i, status: newStatus } : i))
      );
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.warn('Failed to update status:', err);
    }
  };

  // Metrics
  const redCount = incidents.filter((i) => i.priority === 'RED').length;
  const yellowCount = incidents.filter((i) => i.priority === 'YELLOW').length;
  const greenCount = incidents.filter((i) => i.priority === 'GREEN').length;

  // Filtered List
  const filteredIncidents = incidents.filter((inc) => {
    if (filterPriority !== 'ALL' && inc.priority !== filterPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = inc.id.toLowerCase().includes(q);
      const matchLoc = (inc.location_label || '').toLowerCase().includes(q);
      const matchInj = inc.detections?.some((d) => d.label.toLowerCase().includes(q));
      return matchId || matchLoc || matchInj;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Banner / EOC Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              Emergency Response Control Center
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              CAD 112 / 108 BRIDGE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-Time AI Trauma Feed • Ultra-Low-Bandwidth Pre-Arrival Telemetry
          </p>
        </div>

        {/* Live WebSocket Status & Refresh */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
              }`}
            ></span>
            <span className="text-slate-300">
              {wsConnected ? 'LIVE FEED CONNECTED' : 'WEBSOCKET RECONNECTING...'}
            </span>
          </div>

          <button
            onClick={loadIncidents}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Refresh Incident Feed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* New Incident Flash Alert */}
      {newIncidentAlert && (
        <div className="mb-6 p-4 rounded-xl bg-red-600/20 border-2 border-red-500 text-white shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-400 animate-pulse" />
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-400 block">
                🚨 NEW INCOMING TELEMETRY PACKET
              </span>
              <span className="text-sm font-extrabold">
                [CODE {newIncidentAlert.priority}] {newIncidentAlert.location_label || 'Highway Accident'} —{' '}
                {newIncidentAlert.injuries?.join(', ')}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedIncident(newIncidentAlert);
              setNewIncidentAlert(null);
            }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold text-white shadow"
          >
            Inspect Incident
          </button>
        </div>
      )}

      {/* Operations Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Active Incidents</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-white font-mono">{incidents.length}</span>
            <span className="text-[11px] text-slate-500 font-mono">in queue</span>
          </div>
        </div>

        <div className="bg-red-950/20 p-3.5 rounded-xl border border-red-800/40">
          <span className="text-[10px] font-mono uppercase text-red-400 block">Code Red (Immediate)</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-red-400 font-mono">{redCount}</span>
            <span className="text-[11px] text-red-500 font-mono">Critical Trauma</span>
          </div>
        </div>

        <div className="bg-amber-950/20 p-3.5 rounded-xl border border-amber-800/40">
          <span className="text-[10px] font-mono uppercase text-amber-400 block">Code Yellow (Urgent)</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-amber-400 font-mono">{yellowCount}</span>
            <span className="text-[11px] text-amber-500 font-mono">Prompt Transport</span>
          </div>
        </div>

        <div className="bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-800/40">
          <span className="text-[10px] font-mono uppercase text-emerald-400 block">Code Green (Minor)</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-emerald-400 font-mono">{greenCount}</span>
            <span className="text-[11px] text-emerald-500 font-mono">Stable / Non-Urgent</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout: Left Incident Feed, Right Map & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACTIVE INCIDENTS LIST (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Filter & Search Bar */}
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
            {/* Priority Filter Pills */}
            <div className="flex items-center space-x-1">
              {['ALL', 'RED', 'YELLOW', 'GREEN'].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterPriority === p
                      ? p === 'RED'
                        ? 'bg-red-600 text-white'
                        : p === 'YELLOW'
                        ? 'bg-amber-600 text-slate-950'
                        : p === 'GREEN'
                        ? 'bg-emerald-600 text-slate-950'
                        : 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[130px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search incident..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-slate-950 text-xs text-slate-200 border border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Incidents Feed */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredIncidents.length === 0 ? (
              <div className="text-center p-8 bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
                No active incidents matching criteria.
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const theme = getPriorityTheme(inc.priority);
                const isSelected = selectedIncident?.id === inc.id;

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-850 border-blue-500 ring-2 ring-blue-500/30 shadow-lg'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top row: Priority badge + timestamp */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${theme.badge}`}>
                          CODE {inc.priority}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {inc.id.substring(0, 14)}...
                        </span>
                        {inc.is_demo && (
                          <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-400 text-slate-950">
                            DEMO
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(inc.timestamp)}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-semibold mb-2">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="truncate">{inc.location_label || 'Highway Collision Site'}</span>
                    </div>

                    {/* Injuries & Vitals */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                      <div className="flex flex-wrap gap-1">
                        {inc.detections?.length > 0 ? (
                          inc.detections.map((d, i) => {
                            const b = getInjuryBadge(d.label);
                            return (
                              <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${b.color}`}>
                                {b.label}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-slate-500">No external injuries</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 font-mono">
                        {inc.estimated_pulse ? (
                          <span className="text-red-400 font-bold flex items-center space-x-0.5">
                            <Heart className="w-3 h-3 fill-current inline" />
                            <span>{inc.estimated_pulse} BPM</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">Pulse N/A</span>
                        )}

                        <span className="text-[10px] text-slate-400">
                          {formatBytes(inc.payload_bytes || 284)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL DRAWER & MAP (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Leaflet Tactical Overview Map */}
          <IncidentMap
            lat={selectedIncident ? selectedIncident.latitude : 28.6139}
            lng={selectedIncident ? selectedIncident.longitude : 77.2090}
            priority={selectedIncident ? selectedIncident.priority : 'RED'}
            locationLabel={selectedIncident?.location_label || 'NH 48 KM 42'}
            isDemo={selectedIncident?.is_demo || false}
            allIncidents={incidents}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            height="320px"
          />

          {/* Selected Incident Detail Card */}
          {selectedIncident ? (
            <div className="bg-trauma-panel border border-trauma-border rounded-2xl p-4 sm:p-5 shadow-xl">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-lg text-white">Incident Overview</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono font-black ${
                        getPriorityTheme(selectedIncident.priority).badge
                      }`}
                    >
                      CODE {selectedIncident.priority}
                    </span>
                    {selectedIncident.is_demo && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-slate-950 uppercase">
                        DEMO DATA
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400 block mt-0.5">
                    ID: {selectedIncident.id} • Telemetry Received: {formatTime(selectedIncident.timestamp)}
                  </span>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Status:</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase bg-slate-800 text-slate-200 border border-slate-700">
                    {selectedIncident.status}
                  </span>
                </div>
              </div>

              {/* Grid: Diagnostics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* AI Findings */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    AI Multimodal Findings
                  </span>
                  <div className="space-y-1">
                    {selectedIncident.detections?.length > 0 ? (
                      selectedIncident.detections.map((d, idx) => {
                        const badge = getInjuryBadge(d.label);
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs text-slate-200">
                            <span>{badge.icon} {badge.label}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {Math.round((d.confidence || 0.85) * 100)}% conf
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400">No severe external findings</span>
                    )}
                  </div>
                </div>

                {/* Optical Vitals */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Estimated Vitals (rPPG)
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <Heart className="w-4 h-4 text-red-400 animate-pulse fill-current" />
                    <span className="text-xl font-bold font-mono text-white">
                      {selectedIncident.estimated_pulse ? `${selectedIncident.estimated_pulse} BPM` : 'Unavailable'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({selectedIncident.pulse_status || 'optical'})
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400/80 block mt-1">
                    Experimental optical estimation — verify clinically.
                  </span>
                </div>
              </div>

              {/* Triage Reason & Recommendation */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 mb-4 text-xs">
                <span className="text-[10px] font-mono uppercase text-red-400 block font-bold mb-1">
                  Automated Triage Assessment ({selectedIncident.triage_category || 'START/RTS'})
                </span>
                <p className="text-slate-300 mb-2 leading-relaxed">
                  {selectedIncident.triage_reason || 'Automated rule survey completed.'}
                </p>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-semibold text-white">
                  {selectedIncident.recommended_action || 'Immediate paramedic dispatch recommended.'}
                </div>
              </div>

              {/* CAD Simulation Actions */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] font-mono text-slate-500">
                  Payload Footprint: <strong className="text-emerald-400">{formatBytes(selectedIncident.payload_bytes || 284)}</strong>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedIncident.id, 'acknowledged')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-colors flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Acknowledge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedIncident.id, 'dispatched')}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-md shadow-red-600/30 transition-all flex items-center space-x-1.5"
                  >
                    <Ambulance className="w-4 h-4" />
                    <span>DISPATCH ALS AMBULANCE (108)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
              Select an incident from the left feed to inspect telemetry and dispatch response.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
