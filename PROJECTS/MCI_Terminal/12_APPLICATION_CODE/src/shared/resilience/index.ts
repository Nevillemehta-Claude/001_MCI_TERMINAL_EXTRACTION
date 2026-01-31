/**
 * Resilience Module - Central Export
 * 
 * SILO 4: Latency, Timeout & Degradation Enforcement
 * SILO 5: Circuit Breaker & Failure Containment
 * 
 * CONSTRAINT: All components are DECLARED but NOT ACTIVATED.
 * This module provides production-grade resilience primitives
 * that remain dark until explicitly enabled.
 * 
 * See: 00_GOVERNANCE/LATENCY_AND_DEGRADATION_POLICY.md
 */

export {
  // SILO 4: Latency & Degradation
  type LatencyThresholds,
  type LatencyMeasurement,
  type DegradationLevel,
  type DegradationState,
  DEFAULT_LATENCY_THRESHOLDS,
  measureLatency,
  classifyLatencyMeasurement,
  getDegradationLevel,
  getFeatureAvailability,
  formatLatencyForDisplay,
} from './latency';

export {
  // SILO 4: Timeout Configuration
  type TimeoutConfig,
  type TimeoutResult,
  DEFAULT_TIMEOUT_CONFIG,
  withTimeout,
  createTimeoutController,
} from './timeout';

export {
  // SILO 5: Circuit Breaker (INACTIVE)
  type CircuitBreakerConfig,
  type CircuitBreakerState,
  type CircuitState,
  DEFAULT_CIRCUIT_BREAKER_CONFIG,
  CircuitBreaker,
  createCircuitBreaker,
} from './circuitBreaker';

export {
  // SILO 5: Retry Policy (DECLARED, NOT USED)
  type RetryConfig,
  type RetryResult,
  DEFAULT_RETRY_CONFIG,
  calculateBackoff,
  shouldRetry,
  withRetry,
} from './retry';

export {
  // SILO 5: Failure Containment
  type FailureRecord,
  type FailureContainmentState,
  FailureContainment,
  createFailureContainment,
} from './failureContainment';
