export function encodeClientTelemetry(payload) {
  const data = {
    incident_id: payload.incident_id,
    timestamp: payload.timestamp,
    lat: Number(Number(payload.lat || 0).toFixed(5)),
    lng: Number(Number(payload.lng || 0).toFixed(5)),
    priority: payload.priority,
    injuries: payload.injuries || [],
    heart_rate: payload.heart_rate !== null && payload.heart_rate !== undefined ? Math.round(payload.heart_rate) : null,
    confidence: Number(Number(payload.confidence || 0.85).toFixed(2)),
    triage_score: Number(Number(payload.triage_score || 0).toFixed(1)),
    is_demo: Boolean(payload.is_demo),
  };

  const jsonString = JSON.stringify(data);
  // Accurate UTF-8 byte count using TextEncoder
  const encoder = new TextEncoder();
  const byteCount = encoder.encode(jsonString).length;

  return {
    jsonString,
    byteCount,
    minified: jsonString,
    base64: btoa(jsonString),
  };
}
