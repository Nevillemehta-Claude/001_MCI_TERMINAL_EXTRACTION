/**
 * CIA-SIE-PURE Health Check Hook
 * 
 * MINIMAL INTEGRATION: Health visibility ONLY.
 * 
 * This hook provides TRUTHFUL engine connectivity status for cockpit display.
 * It polls the CIA-SIE-PURE health endpoint and reports:
 * - ENGINE: CONNECTED (process reachable, API responsive)
 * - ENGINE: DISCONNECTED (process unreachable or API unresponsive)
 * 
 * EXPLICITLY PROHIBITED:
 * - ❌ No telemetry streaming
 * - ❌ No WebSocket/SSE data flow
 * - ❌ No ignition/start commands
 * - ❌ No shutdown/stop commands
 * - ❌ No lifecycle coupling
 * - ❌ No state synchronization
 * 
 * OPERATIONAL MODE:
 * - MCI remains in SIMULATION-SAFE MODE
 * - CIA-SIE-PURE is treated as externally supervised
 * - This hook ONLY checks connectivity — nothing more
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// CONFIGURATION
// ============================================================================

/** Default health check interval in milliseconds */
const DEFAULT_POLL_INTERVAL_MS = 10000;

/** Health check timeout in milliseconds */
const HEALTH_CHECK_TIMEOUT_MS = 5000;

/** CIA-SIE-PURE base URL from environment or default */
const CIA_SIE_BASE_URL = typeof window !== 'undefined' 
  ? (window as unknown as { CIA_SIE_URL?: string }).CIA_SIE_URL || 'http://localhost:8000'
  : 'http://localhost:8000';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Engine connection status for cockpit display
 */
export type EngineConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'CHECKING' | 'UNKNOWN';

/**
 * Complete health state returned by the hook
 */
export interface CiaSieHealthState {
  /** Simple connection status for cockpit display */
  status: EngineConnectionStatus;
  /** Whether the engine is reachable (process running, API responding) */
  isConnected: boolean;
  /** Whether a health check is currently in progress */
  isChecking: boolean;
  /** Response latency in milliseconds (null if not connected) */
  latencyMs: number | null;
  /** Timestamp of last successful check */
  lastCheckAt: number | null;
  /** Error message from last failed check (null if connected) */
  lastError: string | null;
  /** Number of consecutive failures */
  consecutiveFailures: number;
  /** Manually trigger a health check */
  checkNow: () => Promise<void>;
}

/**
 * Hook configuration options
 */
export interface UseCiaSieHealthOptions {
  /** Polling interval in milliseconds (default: 10000) */
  pollInterval?: number;
  /** Whether polling is enabled (default: true) */
  enabled?: boolean;
}

// ============================================================================
// HEALTH CHECK FUNCTION
// ============================================================================

/**
 * Execute a single health check against CIA-SIE-PURE.
 * 
 * This function ONLY checks if the process is reachable and the API responds.
 * It does NOT initiate any commands, stream any data, or create any coupling.
 */
async function checkEngineHealth(): Promise<{ connected: boolean; latencyMs: number; error?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);
  
  const start = Date.now();
  
  try {
    const response = await fetch(`${CIA_SIE_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      // CRITICAL: No credentials, no body, no side effects
      mode: 'cors',
      cache: 'no-store',
    });
    
    const latencyMs = Date.now() - start;
    
    if (response.ok) {
      return { connected: true, latencyMs };
    } else {
      return { 
        connected: false, 
        latencyMs,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    const latencyMs = Date.now() - start;
    const err = error as Error;
    
    // Detect specific error types
    let errorMessage: string;
    if (err.name === 'AbortError') {
      errorMessage = 'Timeout';
    } else if (err.message.includes('Failed to fetch')) {
      errorMessage = 'Unreachable';
    } else {
      errorMessage = err.message || 'Unknown error';
    }
    
    return { 
      connected: false, 
      latencyMs,
      error: errorMessage,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for CIA-SIE-PURE health visibility.
 * 
 * MINIMAL INTEGRATION: Provides ONLY connection status for cockpit display.
 * 
 * @example
 * ```tsx
 * const { status, isConnected, latencyMs } = useCiaSieHealth();
 * 
 * return (
 *   <div>
 *     ENGINE: {status}
 *     {isConnected && <span>({latencyMs}ms)</span>}
 *   </div>
 * );
 * ```
 */
export function useCiaSieHealth(options: UseCiaSieHealthOptions = {}): CiaSieHealthState {
  const { 
    pollInterval = DEFAULT_POLL_INTERVAL_MS, 
    enabled = true,
  } = options;
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastCheckAt, setLastCheckAt] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  
  // Ref to track mounted state
  const isMountedRef = useRef(true);
  
  // Derive status from state
  const status: EngineConnectionStatus = isChecking 
    ? 'CHECKING' 
    : isConnected 
    ? 'CONNECTED' 
    : lastCheckAt === null 
    ? 'UNKNOWN' 
    : 'DISCONNECTED';
  
  // Health check function
  const performHealthCheck = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setIsChecking(true);
    
    try {
      const result = await checkEngineHealth();
      
      if (!isMountedRef.current) return;
      
      setIsConnected(result.connected);
      setLatencyMs(result.connected ? result.latencyMs : null);
      setLastCheckAt(Date.now());
      
      if (result.connected) {
        setLastError(null);
        setConsecutiveFailures(0);
      } else {
        setLastError(result.error || 'Check failed');
        setConsecutiveFailures(prev => prev + 1);
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      
      setIsConnected(false);
      setLatencyMs(null);
      setLastCheckAt(Date.now());
      setLastError((error as Error).message || 'Check failed');
      setConsecutiveFailures(prev => prev + 1);
    } finally {
      if (isMountedRef.current) {
        setIsChecking(false);
      }
    }
  }, []);
  
  // Set up polling
  useEffect(() => {
    isMountedRef.current = true;
    
    if (!enabled) {
      return;
    }
    
    // Initial check
    void performHealthCheck();
    
    // Set up interval
    const intervalId = setInterval(() => {
      void performHealthCheck();
    }, pollInterval);
    
    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [enabled, pollInterval, performHealthCheck]);
  
  return {
    status,
    isConnected,
    isChecking,
    latencyMs,
    lastCheckAt,
    lastError,
    consecutiveFailures,
    checkNow: performHealthCheck,
  };
}

export default useCiaSieHealth;
