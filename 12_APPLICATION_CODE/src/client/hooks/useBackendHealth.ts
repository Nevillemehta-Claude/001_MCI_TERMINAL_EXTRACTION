/**
 * useBackendHealth Hook
 * 
 * COCKPIT INTEGRITY: This hook provides REAL backend health status.
 * It polls the actual /api/health endpoint and reports truthful connectivity.
 * 
 * GAP-01: Replaces simulated connection with real health check
 * GAP-03: Provides backend health visibility
 */

import { useState, useEffect, useCallback } from 'react';

export interface BackendHealthStatus {
  /** Is the backend reachable right now? */
  isReachable: boolean;
  /** Last successful health check timestamp */
  lastCheckAt: number | null;
  /** Time since last successful check (ms) */
  timeSinceLastCheck: number | null;
  /** Is the health check currently in progress? */
  isChecking: boolean;
  /** Last error message if any */
  lastError: string | null;
  /** Backend-reported status if available */
  backendStatus: 'healthy' | 'degraded' | 'unknown';
  /** Response latency in ms */
  latency: number | null;
}

interface UseBackendHealthOptions {
  /** Polling interval in ms (default: 5000) */
  pollInterval?: number;
  /** Enable polling (default: true) */
  enabled?: boolean;
  /** Timeout for health check in ms (default: 5000) */
  timeout?: number;
}

/**
 * Hook to monitor backend health with real connectivity checks.
 * 
 * This is the SINGLE SOURCE OF TRUTH for backend connectivity.
 * The indicator it provides is REAL, not simulated.
 */
export function useBackendHealth(options: UseBackendHealthOptions = {}): BackendHealthStatus & { checkNow: () => Promise<void> } {
  const {
    pollInterval = 5000,
    enabled = true,
    timeout = 5000,
  } = options;

  const [status, setStatus] = useState<BackendHealthStatus>({
    isReachable: false,
    lastCheckAt: null,
    timeSinceLastCheck: null,
    isChecking: false,
    lastError: null,
    backendStatus: 'unknown',
    latency: null,
  });

  const checkHealth = useCallback(async () => {
    if (status.isChecking) return;

    setStatus(prev => ({ ...prev, isChecking: true }));
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch('/api/health', {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const latency = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        setStatus({
          isReachable: true,
          lastCheckAt: Date.now(),
          timeSinceLastCheck: 0,
          isChecking: false,
          lastError: null,
          backendStatus: data.status === 'healthy' ? 'healthy' : 'degraded',
          latency,
        });
      } else {
        setStatus(prev => ({
          ...prev,
          isReachable: false,
          isChecking: false,
          lastError: `Backend returned ${response.status}`,
          backendStatus: 'unknown',
          latency,
        }));
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      setStatus(prev => ({
        ...prev,
        isReachable: false,
        isChecking: false,
        lastError: error instanceof Error 
          ? (error.name === 'AbortError' ? 'Request timeout' : error.message)
          : 'Unknown error',
        backendStatus: 'unknown',
        latency,
      }));
    }
  }, [timeout, status.isChecking]);

  // Initial check
  useEffect(() => {
    if (enabled) {
      checkHealth();
    }
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      checkHealth();
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [enabled, pollInterval, checkHealth]);

  // Update timeSinceLastCheck every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setStatus(prev => {
        if (prev.lastCheckAt === null) return prev;
        return {
          ...prev,
          timeSinceLastCheck: Date.now() - prev.lastCheckAt,
        };
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return {
    ...status,
    checkNow: checkHealth,
  };
}

export default useBackendHealth;
