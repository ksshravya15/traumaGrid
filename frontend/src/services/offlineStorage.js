import { createIncident } from './api';

const OFFLINE_QUEUE_KEY = 'traumagrid_offline_incidents';

export function getOfflineIncidents() {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveIncidentOffline(incidentData) {
  const queue = getOfflineIncidents();
  // Add unique id if not present
  const record = {
    ...incidentData,
    id: incidentData.id || `offline-${Date.now()}`,
    queued_at: new Date().toISOString(),
    sync_status: 'pending_sync',
  };
  queue.push(record);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new Event('traumagrid_queue_updated'));
  return record;
}

export async function syncOfflineQueue() {
  const queue = getOfflineIncidents();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  console.log(`[Offline Sync] Attempting to sync ${queue.length} incidents...`);
  const remaining = [];
  let syncedCount = 0;

  for (const item of queue) {
    try {
      await createIncident(item);
      syncedCount++;
      console.log(`[Offline Sync] Synced incident ${item.id}`);
    } catch (err) {
      console.warn(`[Offline Sync] Failed to sync ${item.id}:`, err);
      remaining.push(item);
    }
  }

  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  window.dispatchEvent(new Event('traumagrid_queue_updated'));
  return { synced: syncedCount, remaining: remaining.length };
}

export function clearOfflineQueue() {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
  window.dispatchEvent(new Event('traumagrid_queue_updated'));
}
