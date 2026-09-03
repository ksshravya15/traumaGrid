import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

export function IncidentMap({
  lat = 28.6139,
  lng = 77.2090,
  priority = 'RED',
  locationLabel = 'Incident Location',
  isDemo = false,
  allIncidents = null,
  onSelectIncident = null,
  height = '260px',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map if not already done
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: allIncidents && allIncidents.length > 1 ? 12 : 14,
        zoomControl: true,
        attributionControl: true,
      });

      // Dark theme OpenStreetMap tiles via CartoDB Dark Matter
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([lat, lng]);
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Helper to create pulsing HTML marker
    const createPulsingIcon = (prio) => {
      const color = prio === 'RED' ? '#ef4444' : prio === 'YELLOW' ? '#f59e0b' : '#10b981';
      const pulseClass = prio === 'RED' ? 'pulse-red' : prio === 'YELLOW' ? 'pulse-yellow' : 'pulse-green';
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; width: 26px; height: 26px;">
            <div class="${pulseClass}" style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.9; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
              <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #ffffff;"></div>
            </div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
    };

    if (allIncidents && allIncidents.length > 0) {
      // Multiple incidents mode (Responder Dashboard)
      allIncidents.forEach((inc) => {
        const marker = L.marker([inc.latitude, inc.longitude], {
          icon: createPulsingIcon(inc.priority),
        }).addTo(map);

        marker.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; min-width: 160px;">
            <strong style="color: ${inc.priority === 'RED' ? '#dc2626' : inc.priority === 'YELLOW' ? '#d97706' : '#059669'}; font-size: 13px;">
              [CODE ${inc.priority}] ${inc.location_label || 'Accident Site'}
            </strong>
            <div style="margin-top: 4px; font-size: 11px;">
              <div><strong>Vitals:</strong> ${inc.estimated_pulse ? `${inc.estimated_pulse} BPM` : 'N/A'}</div>
              <div><strong>Injuries:</strong> ${inc.detections?.map((d) => d.label).join(', ') || 'None noted'}</div>
              <div><strong>Status:</strong> ${inc.status}</div>
            </div>
          </div>
        `);

        if (onSelectIncident) {
          marker.on('click', () => onSelectIncident(inc));
        }

        markersRef.current.push(marker);
      });
    } else {
      // Single incident mode (Bystander Triage)
      const marker = L.marker([lat, lng], {
        icon: createPulsingIcon(priority),
      }).addTo(map);

      marker.bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px;">
          <strong style="color: #dc2626;">[CODE ${priority}] ${locationLabel}</strong>
          <div style="font-size: 11px; margin-top: 4px;">Approximate accident coordinates</div>
        </div>
      `);

      markersRef.current.push(marker);
    }

    // Invalidate size after layout renders
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Cleanup on unmount handled by ref
    };
  }, [lat, lng, priority, locationLabel, allIncidents, onSelectIncident]);

  return (
    <div className="bg-trauma-panel border border-trauma-border rounded-2xl overflow-hidden shadow-xl">
      {/* Map Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-red-400" />
          <span className="font-bold text-slate-200">{locationLabel}</span>
          {isDemo && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              DEMO LOCATION
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-400">
          <Navigation className="w-3.5 h-3.5 text-blue-400" />
          <span>
            {Number(lat).toFixed(4)}°, {Number(lng).toFixed(4)}°
          </span>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} style={{ height }} className="w-full relative z-10" />
    </div>
  );
}
