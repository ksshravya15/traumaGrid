import { useState, useEffect, useCallback } from 'react';
import { getOfflineIncidents, syncOfflineQueue } from '../services/offlineStorage';

export function useNetworkStatus() {
  const [isBrowserOnline, setIsBrowserOnline] = useState(navigator.onLine);
  const [simulatedMode, setSimulatedMode] = useState('online'); // 'online' | 'weak_2g' | 'offline'
  const [offlineCount, setOfflineCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const updateQueueCount = useCallback(() => {
    const queue = getOfflineIncidents();
    setOfflineCount(queue.length);
  }, []);

  useEffect(() => {
    updateQueueCount();

    const handleOnline = () => {
      setIsBrowserOnline(true);
      if (simulatedMode === 'online') {
        triggerAutoSync();
      }
    };
    const handleOffline = () => {
      setIsBrowserOnline(false);
    };
    const handleQueueUpdated = () => {
      updateQueueCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('traumagrid_queue_updated', handleQueueUpdated);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('traumagrid_queue_updated', handleQueueUpdated);
    };
  }, [simulatedMode, updateQueueCount]);

  const triggerAutoSync = async () => {
    setIsSyncing(true);
    try {
      await syncOfflineQueue();
    } finally {
      setIsSyncing(false);
      updateQueueCount();
    }
  };

  const effectiveStatus = simulatedMode !== 'online' ? simulatedMode : (isBrowserOnline ? 'online' : 'offline');

  return {
    status: effectiveStatus,
    simulatedMode,
    setSimulatedMode,
    offlineCount,
    isSyncing,
    triggerAutoSync,
  };
}
