/**
 * Activation-Time Observability (Dormant)
 * 
 * SILO 11: Ensures the moment of activation is fully visible.
 * 
 * CONSTRAINT: Observability infrastructure is WIRED but OFF.
 * Baselines are captured but not used until activation.
 */

import { ACTIVATION_LOCKED, KILL_SWITCH_ENGAGED } from './index';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Baseline measurements captured before activation
 */
export interface ActivationBaseline {
  /** Baseline ID */
  id: string;
  /** Capture timestamp */
  capturedAt: number;
  /** Latency baseline (ms) */
  latency: {
    healthCheck: number | null;
    telemetryFetch: number | null;
    signalFetch: number | null;
    narrativeFetch: number | null;
  };
  /** Error rate baseline (per minute) */
  errorRate: {
    total: number;
    byCategory: Record<string, number>;
  };
  /** Degradation thresholds */
  degradationThresholds: {
    latencyWarn: number;
    latencyFail: number;
    errorRateWarn: number;
    errorRateFail: number;
  };
  /** System state at capture */
  systemState: {
    activationLocked: boolean;
    killSwitchEngaged: boolean;
    testsPassing: boolean;
    invariantsIntact: boolean;
  };
}

/**
 * Activation metrics (captured during/after activation)
 */
export interface ActivationMetrics {
  /** Metrics ID */
  id: string;
  /** Activation start time */
  activationStartedAt: number | null;
  /** Activation completed time */
  activationCompletedAt: number | null;
  /** Current latency measurements */
  currentLatency: {
    healthCheck: number | null;
    telemetryFetch: number | null;
    signalFetch: number | null;
    narrativeFetch: number | null;
  };
  /** Latency delta from baseline */
  latencyDelta: {
    healthCheck: number | null;
    telemetryFetch: number | null;
    signalFetch: number | null;
    narrativeFetch: number | null;
  };
  /** Current error count */
  errorCount: number;
  /** Errors since activation */
  errorsSinceActivation: number;
  /** Degradation level */
  degradationLevel: 'normal' | 'partial' | 'significant' | 'severe' | 'disconnected';
  /** Whether thresholds exceeded */
  thresholdsExceeded: boolean;
}

/**
 * Observability state
 */
export interface ObservabilityState {
  /** Whether observability is active */
  active: boolean;
  /** Current baseline */
  baseline: ActivationBaseline | null;
  /** Current metrics */
  metrics: ActivationMetrics | null;
  /** Cockpit indicators wired */
  indicatorsWired: boolean;
  /** Indicators enabled */
  indicatorsEnabled: boolean;
}

/**
 * Operator telemetry path (declared but not activated)
 */
export interface OperatorTelemetryPath {
  /** Path ID */
  id: string;
  /** Path name */
  name: string;
  /** Endpoint */
  endpoint: string;
  /** Method */
  method: 'GET' | 'POST';
  /** Whether path is enabled */
  enabled: boolean;
  /** Visibility level */
  visibility: 'operator_only' | 'admin_only' | 'public';
}

// ============================================================================
// OPERATOR TELEMETRY PATHS (DECLARED)
// ============================================================================

/**
 * Operator-only telemetry paths.
 * 
 * CONSTRAINT: All paths are DECLARED but DISABLED.
 */
export const OPERATOR_TELEMETRY_PATHS: OperatorTelemetryPath[] = [
  {
    id: 'OP-001',
    name: 'Activation Status',
    endpoint: '/api/operator/activation-status',
    method: 'GET',
    enabled: false,
    visibility: 'operator_only',
  },
  {
    id: 'OP-002',
    name: 'Latency Metrics',
    endpoint: '/api/operator/latency',
    method: 'GET',
    enabled: false,
    visibility: 'operator_only',
  },
  {
    id: 'OP-003',
    name: 'Error Rates',
    endpoint: '/api/operator/errors',
    method: 'GET',
    enabled: false,
    visibility: 'operator_only',
  },
  {
    id: 'OP-004',
    name: 'Degradation Status',
    endpoint: '/api/operator/degradation',
    method: 'GET',
    enabled: false,
    visibility: 'operator_only',
  },
  {
    id: 'OP-005',
    name: 'Kill Switch Control',
    endpoint: '/api/operator/kill-switch',
    method: 'POST',
    enabled: false,
    visibility: 'admin_only',
  },
];

// ============================================================================
// BASELINE CAPTURE
// ============================================================================

/**
 * Default degradation thresholds
 */
const DEFAULT_THRESHOLDS = {
  latencyWarn: 500,     // 500ms
  latencyFail: 2000,    // 2000ms
  errorRateWarn: 1,     // 1 error/minute
  errorRateFail: 10,    // 10 errors/minute
};

/**
 * Capture a baseline before activation.
 * 
 * CONSTRAINT: Baseline is captured but not used until activation.
 * 
 * @returns Captured baseline
 */
export function captureBaseline(): ActivationBaseline {
  const id = `BASELINE-${Date.now()}`;
  
  // In dormant mode, all latencies are null (not measured)
  const baseline: ActivationBaseline = {
    id,
    capturedAt: Date.now(),
    latency: {
      healthCheck: null,
      telemetryFetch: null,
      signalFetch: null,
      narrativeFetch: null,
    },
    errorRate: {
      total: 0,
      byCategory: {},
    },
    degradationThresholds: { ...DEFAULT_THRESHOLDS },
    systemState: {
      activationLocked: ACTIVATION_LOCKED,
      killSwitchEngaged: KILL_SWITCH_ENGAGED,
      testsPassing: true, // Assumed from test results
      invariantsIntact: true, // Assumed from verification
    },
  };

  console.debug(`[Observability] Baseline captured: ${id}`);
  return baseline;
}

/**
 * Capture baseline with actual measurements (for when CIA-SIE-PURE is available).
 * 
 * CONSTRAINT: This function is DECLARED but not called until activation.
 */
export async function captureBaselineWithMeasurements(
  measureHealthCheck: () => Promise<number>,
  measureTelemetry: () => Promise<number>,
  measureSignal: () => Promise<number>,
  measureNarrative: () => Promise<number>
): Promise<ActivationBaseline> {
  const baseline = captureBaseline();
  
  if (!ACTIVATION_LOCKED && !KILL_SWITCH_ENGAGED) {
    try {
      baseline.latency.healthCheck = await measureHealthCheck();
      baseline.latency.telemetryFetch = await measureTelemetry();
      baseline.latency.signalFetch = await measureSignal();
      baseline.latency.narrativeFetch = await measureNarrative();
    } catch (error) {
      console.warn('[Observability] Failed to capture measurements:', error);
    }
  }
  
  return baseline;
}

// ============================================================================
// OBSERVABILITY STATE
// ============================================================================

/**
 * Get current observability state.
 * 
 * CONSTRAINT: State reflects dormant mode when locked.
 */
export function getObservabilityState(): ObservabilityState {
  return {
    active: !ACTIVATION_LOCKED && !KILL_SWITCH_ENGAGED,
    baseline: null, // No baseline until captured
    metrics: null, // No metrics until activation
    indicatorsWired: true, // Indicators are wired
    indicatorsEnabled: false, // But not enabled
  };
}

/**
 * Create activation metrics structure.
 * 
 * CONSTRAINT: Metrics are created but not populated until activation.
 */
export function createActivationMetrics(): ActivationMetrics {
  return {
    id: `METRICS-${Date.now()}`,
    activationStartedAt: null,
    activationCompletedAt: null,
    currentLatency: {
      healthCheck: null,
      telemetryFetch: null,
      signalFetch: null,
      narrativeFetch: null,
    },
    latencyDelta: {
      healthCheck: null,
      telemetryFetch: null,
      signalFetch: null,
      narrativeFetch: null,
    },
    errorCount: 0,
    errorsSinceActivation: 0,
    degradationLevel: 'normal',
    thresholdsExceeded: false,
  };
}

/**
 * Calculate latency delta from baseline.
 */
export function calculateLatencyDelta(
  baseline: ActivationBaseline,
  current: ActivationMetrics['currentLatency']
): ActivationMetrics['latencyDelta'] {
  return {
    healthCheck: 
      baseline.latency.healthCheck !== null && current.healthCheck !== null
        ? current.healthCheck - baseline.latency.healthCheck
        : null,
    telemetryFetch:
      baseline.latency.telemetryFetch !== null && current.telemetryFetch !== null
        ? current.telemetryFetch - baseline.latency.telemetryFetch
        : null,
    signalFetch:
      baseline.latency.signalFetch !== null && current.signalFetch !== null
        ? current.signalFetch - baseline.latency.signalFetch
        : null,
    narrativeFetch:
      baseline.latency.narrativeFetch !== null && current.narrativeFetch !== null
        ? current.narrativeFetch - baseline.latency.narrativeFetch
        : null,
  };
}

/**
 * Check if thresholds are exceeded.
 */
export function checkThresholdsExceeded(
  baseline: ActivationBaseline,
  metrics: ActivationMetrics
): boolean {
  const { degradationThresholds } = baseline;
  
  // Check latency thresholds
  const latencies = Object.values(metrics.currentLatency).filter(l => l !== null) as number[];
  const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;
  
  if (maxLatency > degradationThresholds.latencyFail) {
    return true;
  }
  
  // Check error rate
  // (Would calculate errors per minute in real implementation)
  if (metrics.errorCount > degradationThresholds.errorRateFail) {
    return true;
  }
  
  return false;
}

/**
 * Format observability state for display.
 */
export function formatObservabilityState(state: ObservabilityState): string {
  if (!state.active) {
    return 'Observability: DORMANT (activation locked)';
  }
  if (state.indicatorsEnabled) {
    return 'Observability: ACTIVE (indicators enabled)';
  }
  return 'Observability: READY (indicators wired but disabled)';
}
