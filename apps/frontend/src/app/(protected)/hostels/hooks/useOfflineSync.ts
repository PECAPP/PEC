import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface QueuedRequest {
  id: string;
  url: string;
  method: 'POST' | 'PATCH';
  payload: any;
  timestamp: number;
}

export function useOfflineSync(syncCallback: (req: QueuedRequest) => Promise<void>) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [queuedRequests, setQueuedRequests] = useState<QueuedRequest[]>([]);

  useEffect(() => {
    // Load existing queue
    const saved = localStorage.getItem('offline_queue');
    if (saved) {
      try {
        setQueuedRequests(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse offline queue', e);
      }
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && queuedRequests.length > 0) {
      flushQueue();
    }
  }, [isOnline, queuedRequests.length]);

  const addToQueue = (url: string, method: 'POST' | 'PATCH', payload: any) => {
    const newReq: QueuedRequest = {
      id: crypto.randomUUID(),
      url,
      method,
      payload,
      timestamp: Date.now(),
    };
    const updated = [...queuedRequests, newReq];
    setQueuedRequests(updated);
    localStorage.setItem('offline_queue', JSON.stringify(updated));
    toast.info('You are offline. Request queued to sync later.');
  };

  const flushQueue = async () => {
    if (queuedRequests.length === 0) return;
    
    toast.info(`Syncing ${queuedRequests.length} queued requests...`);
    const remaining = [...queuedRequests];
    
    for (const req of queuedRequests) {
      try {
        await syncCallback(req);
        // Remove from queue
        const idx = remaining.findIndex(r => r.id === req.id);
        if (idx !== -1) remaining.splice(idx, 1);
      } catch (error) {
        console.error('Failed to sync request:', req, error);
      }
    }
    
    setQueuedRequests(remaining);
    localStorage.setItem('offline_queue', JSON.stringify(remaining));
    if (remaining.length === 0) {
      toast.success('Offline queue synced successfully!');
    }
  };

  return { isOnline, queuedRequests, addToQueue };
}
