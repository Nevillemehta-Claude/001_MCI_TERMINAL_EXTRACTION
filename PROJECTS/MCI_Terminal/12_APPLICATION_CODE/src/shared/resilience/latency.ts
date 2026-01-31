/**
 * Latency & Degradation Enforcement
 * 
 * SILO 4: Production-grade latency classification and degradation tiers.
 * 
 * CONSTRAINT: This module provides measurement and classification only.
 * It does NOT automatically degrade the system — that decision is made
 * by consuming components based on these classifications.
 * 
 * See: 00_GOVERNANCE/LATENCY_AND_DEGRADATION_POLICY.md
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Latency thresholds in milliseconds
 */
export interface LatencyThresholds {
  /** Latency ≤ this is OK (green) */
  ok: number;
  /** Latency ≤ this is WARN (yellow) */
  warn: number;
  /** Latency ≤ this is SLOW (orange) */
  slow: number;
  /** Latency > slow is FAIL (red) */
  /** Latency > this triggers TIMEOUT */
  timeout: number;
}

/**
 * Latency measurement result
 */
export interface LatencyMeasurement {
  /** Measured latency in milliseconds */
  latencyMs: number;
  /** Classification based on thresholds */
  classification: 'ok' | 'warn' | 'slow' | 'fail' | 'timeout';
  /** Whether this measurement indicates degradation */
  isDegraded: boolean;
  /** Timestamp of measurement */
  measuredAt: number;
}

/**
 * Degradation levels (SILO 4 policy)
 */
export type DegradationLevel = 
  | 'normal'      // Level 0: All systems operational
  | 'partial'     // Level 1: Some features degraded
  | 'significant' // Level 2: Core features affected
  | 'severe'      // Level 3: Most features unavailable
  | 'disconnected'; // Level 4: Engine unreachable

/**
 * Degradation state with feature availability
 */
export interface DegradationState {
  level: DegradationLevel;
  message: string;
  features: {
    healthVisibility: boolean;
    signalDisplay: boolean;
    narrativeDisplay: boolean;
    positionDisplay: boolean;
    orderDisplay: boolean;
    contradictionDetection: boolean;
  };
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default latency thresholds for health checks
 * Based on SILO 4 policy document
 */
export const DEFAULT_LATENCY_THRESHOLDS: LatencyThresholds = {
  ok: 100,      // ≤ 100ms = OK
  warn: 500,    // ≤ 500ms = WARN
  slow: 2000,   // ≤ 2000ms = SLOW
  timeout: 5000, // > 5000ms = TIMEOUT
};

/**
 * Latency thresholds for telemetry operations
 */
export const TELEMETRY_LATENCY_THRESHOLDS: LatencyThresholds = {
  ok: 500,
  warn: 2000,
  slow: 5000,
  timeout: 10000,
};

/**
 * Latency thresholds for AI narrative generation
 */
export const AI_LATENCY_THRESHOLDS: LatencyThresholds = {
  ok: 3000,
  warn: 10000,
  slow: 30000,
  timeout: 60000,
};

// ============================================================================
// MEASUREMENT FUNCTIONS
// ============================================================================

/**
 * Measure latency of an async operation.
 * 
 * @param operation - Async function to measure
 * @param thresholds - Latency thresholds to use
 * @returns Measurement result with classification
 */
export async function measureLatency<T>(
  operation: () => Promise<T>,
  thresholds: LatencyThresholds = DEFAULT_LATENCY_THRESHOLDS
): Promise<{ result: T; measurement: LatencyMeasurement }> {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);
    
    const measurement = classifyLatencyMeasurement(latencyMs, thresholds);
    
    return { result, measurement };
  } catch (error) {
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);
    
    // Even failed operations get measured
    const measurement = classifyLatencyMeasurement(latencyMs, thresholds);
    
    throw Object.assign(error as Error, { measurement });
  }
}

/**
 * Classify a latency value against thresholds.
 * 
 * @param latencyMs - Latency in milliseconds
 * @param thresholds - Thresholds to use
 * @returns Latency measurement with classification
 */
export function classifyLatencyMeasurement(
  latencyMs: number,
  thresholds: LatencyThresholds = DEFAULT_LATENCY_THRESHOLDS
): LatencyMeasurement {
  let classification: LatencyMeasurement['classification'];
  
  if (latencyMs > thresholds.timeout) {
    classification = 'timeout';
  } else if (latencyMs > thresholds.slow) {
    classification = 'fail';
  } else if (latencyMs > thresholds.warn) {
    classification = 'slow';
  } else if (latencyMs > thresholds.ok) {
    classification = 'warn';
  } else {
    classification = 'ok';
  }
  
  return {
    latencyMs,
    classification,
    isDegraded: classification !== 'ok' && classification !== 'warn',
    measuredAt: Date.now(),
  };
}

// ============================================================================
// DEGRADATION FUNCTIONS
// ============================================================================

/**
 * Determine degradation level based on system state.
 * 
 * @param processHealthy - Is the engine process reachable?
 * @param subsystemsHealthy - Count of healthy subsystems (0-4)
 * @param consecutiveFailures - Number of consecutive health check failures
 * @returns Degradation level
 */
export function getDegradationLevel(
  processHealthy: boolean,
  subsystemsHealthy: number,
  consecutiveFailures: number
): DegradationLevel {
  // Process unreachable = disconnected
  if (!processHealthy || consecutiveFailures >= 3) {
    return 'disconnected';
  }
  
  // All subsystems healthy = normal
  if (subsystemsHealthy === 4) {
    return 'normal';
  }
  
  // Based on how many subsystems are down
  if (subsystemsHealthy >= 3) {
    return 'partial';
  }
  
  if (subsystemsHealthy >= 2) {
    return 'significant';
  }
  
  return 'severe';
}

/**
 * Get feature availability based on degradation level.
 * 
 * @param level - Current degradation level
 * @returns Degradation state with feature availability
 */
export function getFeatureAvailability(level: DegradationLevel): DegradationState {
  switch (level) {
    case 'normal':
      return {
        level,
        message: 'All systems operational',
        features: {
          healthVisibility: true,
          signalDisplay: true,
          narrativeDisplay: true,
          positionDisplay: true,
          orderDisplay: true,
          contradictionDetection: true,
        },
      };
    
    case 'partial':
      return {
        level,
        message: 'Some features may be slow',
        features: {
          healthVisibility: true,
          signalDisplay: true,
          narrativeDisplay: true, // May be slow
          positionDisplay: true,
          orderDisplay: true,
          contradictionDetection: true,
        },
      };
    
    case 'significant':
      return {
        level,
        message: 'Reduced functionality',
        features: {
          healthVisibility: true,
          signalDisplay: true, // May be stale
          narrativeDisplay: false, // Fallback only
          positionDisplay: true, // May be stale
          orderDisplay: true, // May be stale
          contradictionDetection: true, // Limited
        },
      };
    
    case 'severe':
      return {
        level,
        message: 'Operating in limited mode',
        features: {
          healthVisibility: true,
          signalDisplay: false,
          narrativeDisplay: false,
          positionDisplay: false,
          orderDisplay: false,
          contradictionDetection: false,
        },
      };
    
    case 'disconnected':
      return {
        level,
        message: 'Engine disconnected',
        features: {
          healthVisibility: true, // Always show health status
          signalDisplay: false,
          narrativeDisplay: false,
          positionDisplay: false,
          orderDisplay: false,
          contradictionDetection: false,
        },
      };
  }
}

// ============================================================================
// DISPLAY UTILITIES
// ============================================================================

/**
 * Format latency measurement for cockpit display.
 * 
 * @param measurement - Latency measurement
 * @returns Display object with color, text, and tooltip
 */
export function formatLatencyForDisplay(measurement: LatencyMeasurement): {
  color: string;
  text: string;
  tooltip: string;
} {
  const latencyText = `${measurement.latencyMs}ms`;
  
  switch (measurement.classification) {
    case 'ok':
      return {
        color: 'green',
        text: latencyText,
        tooltip: `Health check: ${latencyText} (Excellent)`,
      };
    case 'warn':
      return {
        color: 'yellow',
        text: latencyText,
        tooltip: `Health check: ${latencyText} (Acceptable)`,
      };
    case 'slow':
      return {
        color: 'orange',
        text: latencyText,
        tooltip: `Health check: ${latencyText} (Slow - may affect responsiveness)`,
      };
    case 'fail':
      return {
        color: 'red',
        text: latencyText,
        tooltip: `Health check: ${latencyText} (Critical - significant delays expected)`,
      };
    case 'timeout':
      return {
        color: 'red',
        text: 'TIMEOUT',
        tooltip: 'Health check timed out - engine may be unavailable',
      };
  }
}
