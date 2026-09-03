const API_BASE = '/api';

export async function checkHealth() {
  try {
    const res = await fetch('/health');
    return await res.json();
  } catch (err) {
    console.warn('API health check failed:', err);
    return { status: 'offline' };
  }
}

export async function analyzeInjury(imageBase64, scenarioHint = null) {
  const res = await fetch(`${API_BASE}/analyze/injury`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_base64: imageBase64, scenario_hint: scenarioHint }),
  });
  if (!res.ok) throw new Error(`Injury analysis failed: ${res.statusText}`);
  return await res.json();
}

export async function analyzeRppg(payload) {
  const res = await fetch(`${API_BASE}/analyze/rppg`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`rPPG analysis failed: ${res.statusText}`);
  return await res.json();
}

export async function evaluateTriage(payload) {
  const res = await fetch(`${API_BASE}/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Triage calculation failed: ${res.statusText}`);
  return await res.json();
}

export async function createIncident(incidentData) {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(incidentData),
  });
  if (!res.ok) throw new Error(`Failed to create incident: ${res.statusText}`);
  return await res.json();
}

export async function listIncidents(priority = null, status = null) {
  const params = new URLSearchParams();
  if (priority) params.append('priority', priority);
  if (status) params.append('status', status);
  const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch incidents: ${res.statusText}`);
  return await res.json();
}

export async function getIncident(incidentId) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}`);
  if (!res.ok) throw new Error(`Failed to fetch incident ${incidentId}: ${res.statusText}`);
  return await res.json();
}

export async function updateIncidentStatus(incidentId, newStatus) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/status?status=${newStatus}`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error(`Failed to update status: ${res.statusText}`);
  return await res.json();
}

export async function sendTelemetry(payload) {
  const res = await fetch(`${API_BASE}/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to transmit telemetry: ${res.statusText}`);
  return await res.json();
}
