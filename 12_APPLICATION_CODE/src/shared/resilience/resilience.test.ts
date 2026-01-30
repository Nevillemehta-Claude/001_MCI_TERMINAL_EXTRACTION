/**
 * Resilience Module Tests
 * 
 * SILO 4: Latency, timeout, and degradation enforcement
 * SILO 5: Circuit breaker, retry, and failure containment
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  // SILO 4: Latency
  DEFAULT_LATENCY_THRESHOLDS,
  classifyLatencyMeasurement,
  getDegradationLevel,
  getFeatureAvailability,
  formatLatencyForDisplay,
  measureLatency,
} from './latency';

import {
  // SILO 4: Timeout
  DEFAULT_TIMEOUT_CONFIG,
  createTimeoutController,
  withTimeout,
} from './timeout';

import {
  // SILO 5: Circuit Breaker
  CircuitBreaker,
  DEFAULT_CIRCUIT_BREAKER_CONFIG,
  CircuitOpenError,
  createCircuitBreaker,
} from './circuitBreaker';

import {
  // SILO 5: Retry
  DEFAULT_RETRY_CONFIG,
  calculateBackoff,
  shouldRetry,
  withRetry,
} from './retry';

import {
  // SILO 5: Failure Containment
  FailureContainment,
  createFailureContainment,
} from './failureContainment';

// ============================================================================
// SILO 4: LATENCY TESTS
// ============================================================================

describe('SILO 4: Latency & Degradation', () => {
  describe('classifyLatencyMeasurement', () => {
    it('classifies 0-100ms as ok', () => {
      expect(classifyLatencyMeasurement(50).classification).toBe('ok');
      expect(classifyLatencyMeasurement(100).classification).toBe('ok');
    });

    it('classifies 101-500ms as warn', () => {
      expect(classifyLatencyMeasurement(101).classification).toBe('warn');
      expect(classifyLatencyMeasurement(500).classification).toBe('warn');
    });

    it('classifies 501-2000ms as slow', () => {
      expect(classifyLatencyMeasurement(501).classification).toBe('slow');
      expect(classifyLatencyMeasurement(2000).classification).toBe('slow');
    });

    it('classifies 2001-5000ms as fail', () => {
      expect(classifyLatencyMeasurement(2001).classification).toBe('fail');
      expect(classifyLatencyMeasurement(5000).classification).toBe('fail');
    });

    it('classifies >5000ms as timeout', () => {
      expect(classifyLatencyMeasurement(5001).classification).toBe('timeout');
    });

    it('marks slow+ as degraded', () => {
      expect(classifyLatencyMeasurement(50).isDegraded).toBe(false);
      expect(classifyLatencyMeasurement(300).isDegraded).toBe(false);
      expect(classifyLatencyMeasurement(1000).isDegraded).toBe(true);
      expect(classifyLatencyMeasurement(3000).isDegraded).toBe(true);
    });

    it('includes timestamp', () => {
      const before = Date.now();
      const result = classifyLatencyMeasurement(100);
      const after = Date.now();
      expect(result.measuredAt).toBeGreaterThanOrEqual(before);
      expect(result.measuredAt).toBeLessThanOrEqual(after);
    });
  });

  describe('getDegradationLevel', () => {
    it('returns disconnected when process unhealthy', () => {
      expect(getDegradationLevel(false, 4, 0)).toBe('disconnected');
    });

    it('returns disconnected after 3 consecutive failures', () => {
      expect(getDegradationLevel(true, 4, 3)).toBe('disconnected');
    });

    it('returns normal when all subsystems healthy', () => {
      expect(getDegradationLevel(true, 4, 0)).toBe('normal');
    });

    it('returns partial when 3 subsystems healthy', () => {
      expect(getDegradationLevel(true, 3, 0)).toBe('partial');
    });

    it('returns significant when 2 subsystems healthy', () => {
      expect(getDegradationLevel(true, 2, 0)).toBe('significant');
    });

    it('returns severe when <2 subsystems healthy', () => {
      expect(getDegradationLevel(true, 1, 0)).toBe('severe');
      expect(getDegradationLevel(true, 0, 0)).toBe('severe');
    });
  });

  describe('getFeatureAvailability', () => {
    it('all features available at normal level', () => {
      const state = getFeatureAvailability('normal');
      expect(state.features.healthVisibility).toBe(true);
      expect(state.features.signalDisplay).toBe(true);
      expect(state.features.narrativeDisplay).toBe(true);
    });

    it('health always available even when disconnected', () => {
      const state = getFeatureAvailability('disconnected');
      expect(state.features.healthVisibility).toBe(true);
      expect(state.features.signalDisplay).toBe(false);
    });

    it('narratives disabled at significant level', () => {
      const state = getFeatureAvailability('significant');
      expect(state.features.narrativeDisplay).toBe(false);
    });
  });

  describe('formatLatencyForDisplay', () => {
    it('formats ok latency with green', () => {
      const result = formatLatencyForDisplay(classifyLatencyMeasurement(50));
      expect(result.color).toBe('green');
      expect(result.text).toBe('50ms');
    });

    it('formats timeout with TIMEOUT text', () => {
      const result = formatLatencyForDisplay(classifyLatencyMeasurement(6000));
      expect(result.color).toBe('red');
      expect(result.text).toBe('TIMEOUT');
    });
  });

  describe('measureLatency', () => {
    it('measures successful operation', async () => {
      const operation = async () => {
        await new Promise(r => setTimeout(r, 10));
        return 'success';
      };

      const { result, measurement } = await measureLatency(operation);
      expect(result).toBe('success');
      expect(measurement.latencyMs).toBeGreaterThanOrEqual(10);
      expect(measurement.classification).toBe('ok');
    });
  });
});

// ============================================================================
// SILO 4: TIMEOUT TESTS
// ============================================================================

describe('SILO 4: Timeout', () => {
  describe('DEFAULT_TIMEOUT_CONFIG', () => {
    it('has 5 second default timeout', () => {
      expect(DEFAULT_TIMEOUT_CONFIG.timeoutMs).toBe(5000);
    });
  });

  describe('createTimeoutController', () => {
    it('creates controller with signal', () => {
      const { controller, signal, cleanup } = createTimeoutController(1000);
      expect(controller).toBeInstanceOf(AbortController);
      expect(signal).toBe(controller.signal);
      expect(typeof cleanup).toBe('function');
      cleanup();
    });
  });

  describe('withTimeout', () => {
    it('returns success for fast operations', async () => {
      const result = await withTimeout(
        async () => 'success',
        { timeoutMs: 1000 }
      );
      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.timedOut).toBe(false);
    });

    it('returns timeout for slow operations', async () => {
      const result = await withTimeout(
        async (signal) => {
          await new Promise((_, reject) => {
            signal.addEventListener('abort', () => reject(signal.reason));
          });
        },
        { timeoutMs: 50 }
      );
      expect(result.success).toBe(false);
      expect(result.timedOut).toBe(true);
    });

    it('includes duration in result', async () => {
      const result = await withTimeout(
        async () => 'success',
        { timeoutMs: 1000 }
      );
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });
  });
});

// ============================================================================
// SILO 5: CIRCUIT BREAKER TESTS
// ============================================================================

describe('SILO 5: Circuit Breaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({ name: 'test' });
  });

  describe('initial state', () => {
    it('starts in closed state', () => {
      expect(breaker.getState().state).toBe('closed');
    });

    it('starts with zero failures', () => {
      expect(breaker.getState().failures).toBe(0);
    });

    it('allows requests initially', () => {
      expect(breaker.isAllowed()).toBe(true);
    });
  });

  describe('failure tracking', () => {
    it('increments failures on recordFailure', () => {
      breaker.recordFailure();
      expect(breaker.getState().failures).toBe(1);
    });

    it('opens after threshold failures', () => {
      for (let i = 0; i < DEFAULT_CIRCUIT_BREAKER_CONFIG.failureThreshold; i++) {
        breaker.recordFailure();
      }
      expect(breaker.getState().state).toBe('open');
    });

    it('rejects requests when open', () => {
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure();
      }
      expect(breaker.isAllowed()).toBe(false);
    });
  });

  describe('recovery', () => {
    it('resets failures on success in closed state', () => {
      breaker.recordFailure();
      breaker.recordFailure();
      breaker.recordSuccess();
      expect(breaker.getState().failures).toBe(0);
    });
  });

  describe('execute', () => {
    it('executes operation and records success', async () => {
      const result = await breaker.execute(() => Promise.resolve('success'));
      expect(result).toBe('success');
      expect(breaker.getState().successes).toBe(0); // Only counts in half-open
    });

    it('throws CircuitOpenError when open', async () => {
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure();
      }

      await expect(
        breaker.execute(() => Promise.resolve('success'))
      ).rejects.toThrow(CircuitOpenError);
    });
  });

  describe('reset', () => {
    it('resets to initial state', () => {
      breaker.recordFailure();
      breaker.recordFailure();
      breaker.reset();
      expect(breaker.getState().state).toBe('closed');
      expect(breaker.getState().failures).toBe(0);
    });
  });

  describe('createCircuitBreaker factory', () => {
    it('creates circuit breaker with config', () => {
      const cb = createCircuitBreaker({ name: 'factory-test' });
      expect(cb.getState().state).toBe('closed');
    });
  });
});

// ============================================================================
// SILO 5: RETRY TESTS
// ============================================================================

describe('SILO 5: Retry', () => {
  describe('calculateBackoff', () => {
    it('calculates exponential backoff', () => {
      const config = { ...DEFAULT_RETRY_CONFIG, jitter: false };
      expect(calculateBackoff(1, config)).toBe(1000);
      expect(calculateBackoff(2, config)).toBe(2000);
      expect(calculateBackoff(3, config)).toBe(4000);
    });

    it('caps at maxDelayMs', () => {
      const config = { 
        ...DEFAULT_RETRY_CONFIG, 
        jitter: false,
        maxDelayMs: 3000 
      };
      expect(calculateBackoff(10, config)).toBe(3000);
    });

    it('adds jitter when enabled', () => {
      const config = { ...DEFAULT_RETRY_CONFIG, jitter: true };
      const delays = new Set<number>();
      for (let i = 0; i < 10; i++) {
        delays.add(calculateBackoff(1, config));
      }
      // With jitter, we should get some variation
      // (statistically very unlikely to get same value 10 times)
      expect(delays.size).toBeGreaterThan(1);
    });
  });

  describe('shouldRetry', () => {
    it('returns true for network errors', () => {
      expect(shouldRetry(new Error('network error'))).toBe(true);
    });

    it('returns true for timeout errors', () => {
      expect(shouldRetry(new Error('request timeout'))).toBe(true);
    });

    it('returns true for 503 errors', () => {
      expect(shouldRetry(new Error('503 Service Unavailable'))).toBe(true);
    });

    it('returns false for other errors', () => {
      expect(shouldRetry(new Error('validation failed'))).toBe(false);
    });
  });

  describe('withRetry', () => {
    it('returns success on first try', async () => {
      const result = await withRetry(() => Promise.resolve('success'));
      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(1);
    });

    it('retries on retryable errors', async () => {
      let attempts = 0;
      const result = await withRetry(
        async () => {
          attempts++;
          if (attempts < 2) {
            throw new Error('network error');
          }
          return 'success';
        },
        { ...DEFAULT_RETRY_CONFIG, initialDelayMs: 10 }
      );
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
    });

    it('fails after max attempts', async () => {
      const result = await withRetry(
        async () => {
          throw new Error('network error');
        },
        { ...DEFAULT_RETRY_CONFIG, maxAttempts: 2, initialDelayMs: 10 }
      );
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(2);
    });
  });
});

// ============================================================================
// SILO 5: FAILURE CONTAINMENT TESTS
// ============================================================================

describe('SILO 5: Failure Containment', () => {
  let containment: FailureContainment;

  beforeEach(() => {
    containment = new FailureContainment({
      containmentThreshold: 3,
      windowMs: 60000,
    });
  });

  describe('recordFailure', () => {
    it('records failure with ID and timestamp', () => {
      const record = containment.recordFailure({
        source: 'test-service',
        code: 'ERR001',
        message: 'Test error',
        recoverable: true,
      });
      expect(record.id).toBeTruthy();
      expect(record.timestamp).toBeTruthy();
      expect(record.source).toBe('test-service');
    });

    it('increments failure count', () => {
      containment.recordFailure({
        source: 'test',
        code: 'ERR',
        message: 'error',
        recoverable: true,
      });
      expect(containment.getState().totalFailures).toBe(1);
    });
  });

  describe('containment', () => {
    it('contains source after threshold failures', () => {
      for (let i = 0; i < 3; i++) {
        containment.recordFailure({
          source: 'bad-service',
          code: 'ERR',
          message: 'error',
          recoverable: true,
        });
      }
      expect(containment.isContained('bad-service')).toBe(true);
    });

    it('does not contain source below threshold', () => {
      containment.recordFailure({
        source: 'ok-service',
        code: 'ERR',
        message: 'error',
        recoverable: true,
      });
      expect(containment.isContained('ok-service')).toBe(false);
    });
  });

  describe('releaseContainment', () => {
    it('manually releases contained source', () => {
      for (let i = 0; i < 3; i++) {
        containment.recordFailure({
          source: 'contained',
          code: 'ERR',
          message: 'error',
          recoverable: true,
        });
      }
      expect(containment.isContained('contained')).toBe(true);
      
      containment.releaseContainment('contained');
      expect(containment.isContained('contained')).toBe(false);
    });
  });

  describe('recordSuccess', () => {
    it('decrements failure count', () => {
      containment.recordFailure({
        source: 'test',
        code: 'ERR',
        message: 'error',
        recoverable: true,
      });
      containment.recordSuccess('test');
      expect(containment.getState().failuresBySource.get('test')).toBe(0);
    });
  });

  describe('reset', () => {
    it('clears all tracking', () => {
      containment.recordFailure({
        source: 'test',
        code: 'ERR',
        message: 'error',
        recoverable: true,
      });
      containment.reset();
      expect(containment.getState().totalFailures).toBe(0);
      expect(containment.getState().recentFailures).toHaveLength(0);
    });
  });

  describe('createFailureContainment factory', () => {
    it('creates containment with config', () => {
      const fc = createFailureContainment({ containmentThreshold: 10 });
      expect(fc.getState().totalFailures).toBe(0);
    });
  });
});
