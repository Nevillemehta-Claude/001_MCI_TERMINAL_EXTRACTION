/**
 * useNetworkStatus Hook
 * 
 * COCKPIT INTEGRITY: Provides REAL browser network connectivity status.
 * 
 * GAP-06: Surfaces online/offline status to the operator.
 */

import { useState, useEffect } from 'react';

export interface NetworkStatus {
  /** Is the browser currently online? */
  isOnline: boolean;
  /** When did the status last change? */
  lastChangeAt: number | null;
  /** How long in current state (ms) */
  durationInState: number;
}

/**
 * Hook to monitor browser network connectivity.
 * Uses the Navigator.onLine API and online/offline events.
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastChangeAt: null,
    durationInState: 0,
  });

  useEffect(() => {
    const handleOnline = () => {
      setStatus({
        isOnline: true,
        lastChangeAt: Date.now(),
        durationInState: 0,
      });
    };

    const handleOffline = () => {
      setStatus({
        isOnline: false,
        lastChangeAt: Date.now(),
        durationInState: 0,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update duration every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setStatus(prev => {
        if (prev.lastChangeAt === null) return prev;
        return {
          ...prev,
          durationInState: Date.now() - prev.lastChangeAt,
        };
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return status;
}

export default useNetworkStatus;
