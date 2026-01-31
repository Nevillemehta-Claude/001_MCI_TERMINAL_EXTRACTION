/**
 * CIA-SIE-PURE Deep Health Probe Service
 * 
 * BLOCK-004 Resolution: MCI deep health probes for CIA-SIE-PURE.
 * 
 * This service performs periodic health checks against CIA-SIE-PURE
 * to determine subsystem availability for truthful cockpit display.
 * 
 * PROBE LEVELS:
 * 1. Shallow (Process): Can we reach the /health endpoint?
 * 2. Database: Does /health/db respond healthy?
 * 3. AI: Does /health/ai respond healthy?
 * 4. Webhook: Does /health/webhook respond healthy?
 * 
 * MCI does NOT restart CIA-SIE-PURE — only DETECTS and REPORTS.
 */

import { sanitizeCiaSieResponse } from '../../shared/validation';
import { translateNetworkError, formatMciErrorForLog } from '../../shared/errors';
import type { CiaSieSubsystemHealth } from '../../client/stores/ciaSieHealthStore';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CIA_SIE_BASE_URL = process.env.CIA_SIE_URL || 'http://localhost:8000';

/** Timeout for health check requests in milliseconds */
const HEALTH_CHECK_TIMEOUT_MS = 5000;

/** Interval between health checks in milliseconds */
export const HEALTH_CHECK_INTERVAL_MS = 30000;

// ============================================================================
// TYPES
// ============================================================================

/**
 * Response from CIA-SIE-PURE health endpoint
 */
interface CiaSieHealthResponse {
  status: 'ok' | 'error' | 'degraded';
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Result of a single subsystem probe
 */
interface ProbeResult {
  healthy: boolean;
  latencyMs: number;
  error?: string;
}

/**
 * Result of a complete health check
 */
export interface HealthCheckResult {
  subsystems: CiaSieSubsystemHealth;
  latencies: {
    process: number;
    database: number;
    ai: number;
    webhook: number;
  };
  timestamp: number;
  overallLatencyMs: number;
  errors: string[];
}

// ============================================================================
// PROBE FUNCTIONS
// ============================================================================

/**
 * Execute a fetch with timeout
 */
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Probe a single health endpoint
 */
async function probeEndpoint(endpoint: string): Promise<ProbeResult> {
  const url = `${CIA_SIE_BASE_URL}${endpoint}`;
  const start = Date.now();
  
  try {
    const response = await fetchWithTimeout(url, HEALTH_CHECK_TIMEOUT_MS);
    const latencyMs = Date.now() - start;
    
    if (!response.ok) {
      return {
        healthy: false,
        latencyMs,
        error: `HTTP ${response.status}`,
      };
    }
    
    const data = await response.json() as CiaSieHealthResponse;
    const sanitized = sanitizeCiaSieResponse(data, `health${endpoint}`);
    
    return {
      healthy: sanitized.status === 'ok',
      latencyMs,
      error: sanitized.status === 'error' ? sanitized.message : undefined,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    const mciError = translateNetworkError(error as Error);
    
    return {
      healthy: false,
      latencyMs,
      error: formatMciErrorForLog(mciError),
    };
  }
}

/**
 * Convert ProbeResult to SubsystemHealth
 */
function probeResultToHealth(result: ProbeResult): 'healthy' | 'unhealthy' {
  return result.healthy ? 'healthy' : 'unhealthy';
}

// ============================================================================
// MAIN HEALTH CHECK
// ============================================================================

/**
 * Execute a complete health check against CIA-SIE-PURE.
 * 
 * This probes all subsystems and returns a comprehensive result.
 * 
 * @returns HealthCheckResult with all subsystem statuses
 */
export async function executeHealthCheck(): Promise<HealthCheckResult> {
  const start = Date.now();
  const errors: string[] = [];
  
  // Execute all probes in parallel for efficiency
  const [processResult, dbResult, aiResult, webhookResult] = await Promise.all([
    probeEndpoint('/health'),
    probeEndpoint('/health/db'),
    probeEndpoint('/health/ai'),
    probeEndpoint('/health/webhook'),
  ]);
  
  // Collect errors
  if (processResult.error) errors.push(`process: ${processResult.error}`);
  if (dbResult.error) errors.push(`database: ${dbResult.error}`);
  if (aiResult.error) errors.push(`ai: ${aiResult.error}`);
  if (webhookResult.error) errors.push(`webhook: ${webhookResult.error}`);
  
  return {
    subsystems: {
      process: probeResultToHealth(processResult),
      database: probeResultToHealth(dbResult),
      ai: probeResultToHealth(aiResult),
      webhook: probeResultToHealth(webhookResult),
    },
    latencies: {
      process: processResult.latencyMs,
      database: dbResult.latencyMs,
      ai: aiResult.latencyMs,
      webhook: webhookResult.latencyMs,
    },
    timestamp: Date.now(),
    overallLatencyMs: Date.now() - start,
    errors,
  };
}

/**
 * Execute a quick shallow health check (process only).
 * 
 * Use this for fast connectivity verification.
 * 
 * @returns boolean indicating if CIA-SIE-PURE is reachable
 */
export async function executeShallowHealthCheck(): Promise<boolean> {
  const result = await probeEndpoint('/health');
  return result.healthy;
}

// ============================================================================
// HEALTH CHECK MANAGER (Polling)
// ============================================================================

type HealthCheckCallback = (result: HealthCheckResult) => void;

/**
 * Health check manager that runs periodic checks.
 */
export class HealthCheckManager {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private callback: HealthCheckCallback | null = null;
  private isRunning = false;
  
  /**
   * Start periodic health checks.
   * 
   * @param callback - Function to call with each health check result
   * @param intervalMs - Check interval (default: HEALTH_CHECK_INTERVAL_MS)
   */
  start(callback: HealthCheckCallback, intervalMs = HEALTH_CHECK_INTERVAL_MS): void {
    if (this.isRunning) {
      return;
    }
    
    this.callback = callback;
    this.isRunning = true;
    
    // Execute immediately
    void this.executeAndNotify();
    
    // Then periodically
    this.intervalId = setInterval(() => {
      void this.executeAndNotify();
    }, intervalMs);
  }
  
  /**
   * Stop periodic health checks.
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.callback = null;
  }
  
  /**
   * Check if the manager is running.
   */
  get running(): boolean {
    return this.isRunning;
  }
  
  /**
   * Execute a health check and notify the callback.
   */
  private async executeAndNotify(): Promise<void> {
    try {
      const result = await executeHealthCheck();
      this.callback?.(result);
    } catch (error) {
      // If even the health check itself fails, report complete failure
      const errorResult: HealthCheckResult = {
        subsystems: {
          process: 'unhealthy',
          database: 'unhealthy',
          ai: 'unhealthy',
          webhook: 'unhealthy',
        },
        latencies: {
          process: 0,
          database: 0,
          ai: 0,
          webhook: 0,
        },
        timestamp: Date.now(),
        overallLatencyMs: 0,
        errors: [`Health check failed: ${(error as Error).message}`],
      };
      this.callback?.(errorResult);
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let healthCheckManager: HealthCheckManager | null = null;

/**
 * Get or create the health check manager singleton.
 */
export function getHealthCheckManager(): HealthCheckManager {
  if (!healthCheckManager) {
    healthCheckManager = new HealthCheckManager();
  }
  return healthCheckManager;
}

export default HealthCheckManager;
