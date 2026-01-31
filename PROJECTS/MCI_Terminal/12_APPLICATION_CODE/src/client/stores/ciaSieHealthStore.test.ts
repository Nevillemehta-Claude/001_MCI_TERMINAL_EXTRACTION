/**
 * CIA-SIE-PURE Health Store Tests
 * 
 * BLOCK-002: External supervision assumption and health state tracking
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  useCiaSieHealthStore,
  selectCiaSieAvailable,
  selectFeatureAvailability,
  selectStatusMessage,
  type CiaSieSubsystemHealth,
} from './ciaSieHealthStore';

describe('BLOCK-002: CIA-SIE-PURE Health Store', () => {
  beforeEach(() => {
    useCiaSieHealthStore.getState().reset();
  });

  describe('Initial State', () => {
    it('starts with unknown overall health', () => {
      const state = useCiaSieHealthStore.getState();
      expect(state.overall).toBe('unknown');
    });

    it('starts with all subsystems unknown', () => {
      const state = useCiaSieHealthStore.getState();
      expect(state.subsystems.process).toBe('unknown');
      expect(state.subsystems.database).toBe('unknown');
      expect(state.subsystems.ai).toBe('unknown');
      expect(state.subsystems.webhook).toBe('unknown');
    });

    it('starts not in degraded mode', () => {
      const state = useCiaSieHealthStore.getState();
      expect(state.isDegradedMode).toBe(false);
    });

    it('starts with zero consecutive failures', () => {
      const state = useCiaSieHealthStore.getState();
      expect(state.consecutiveFailures).toBe(0);
    });
  });

  describe('completeCheck', () => {
    it('sets all subsystems healthy → overall healthy', () => {
      const healthySubsystems: CiaSieSubsystemHealth = {
        process: 'healthy',
        database: 'healthy',
        ai: 'healthy',
        webhook: 'healthy',
      };

      useCiaSieHealthStore.getState().completeCheck(healthySubsystems);

      const state = useCiaSieHealthStore.getState();
      expect(state.overall).toBe('healthy');
      expect(state.isDegradedMode).toBe(false);
    });

    it('sets process healthy, DB unhealthy → overall degraded', () => {
      const degradedSubsystems: CiaSieSubsystemHealth = {
        process: 'healthy',
        database: 'unhealthy',
        ai: 'healthy',
        webhook: 'healthy',
      };

      useCiaSieHealthStore.getState().completeCheck(degradedSubsystems);

      const state = useCiaSieHealthStore.getState();
      expect(state.overall).toBe('degraded');
      expect(state.isDegradedMode).toBe(true);
    });

    it('sets process healthy, AI unhealthy → overall degraded', () => {
      const degradedSubsystems: CiaSieSubsystemHealth = {
        process: 'healthy',
        database: 'healthy',
        ai: 'unhealthy',
        webhook: 'healthy',
      };

      useCiaSieHealthStore.getState().completeCheck(degradedSubsystems);

      const state = useCiaSieHealthStore.getState();
      expect(state.overall).toBe('degraded');
      expect(state.isDegradedMode).toBe(true);
    });

    it('sets process unhealthy → overall unhealthy', () => {
      const unhealthySubsystems: CiaSieSubsystemHealth = {
        process: 'unhealthy',
        database: 'unknown',
        ai: 'unknown',
        webhook: 'unknown',
      };

      useCiaSieHealthStore.getState().completeCheck(unhealthySubsystems);

      const state = useCiaSieHealthStore.getState();
      expect(state.overall).toBe('unhealthy');
      expect(state.isDegradedMode).toBe(true);
    });

    it('records lastCheckAt timestamp', () => {
      const before = Date.now();
      
      useCiaSieHealthStore.getState().completeCheck({
        process: 'healthy',
        database: 'healthy',
        ai: 'healthy',
        webhook: 'healthy',
      });

      const after = Date.now();
      const state = useCiaSieHealthStore.getState();
      
      expect(state.lastCheckAt).toBeGreaterThanOrEqual(before);
      expect(state.lastCheckAt).toBeLessThanOrEqual(after);
    });

    it('resets consecutive failures on success', () => {
      // First fail a few times
      useCiaSieHealthStore.getState().failCheck('error 1');
      useCiaSieHealthStore.getState().failCheck('error 2');
      expect(useCiaSieHealthStore.getState().consecutiveFailures).toBe(2);

      // Then succeed
      useCiaSieHealthStore.getState().completeCheck({
        process: 'healthy',
        database: 'healthy',
        ai: 'healthy',
        webhook: 'healthy',
      });

      expect(useCiaSieHealthStore.getState().consecutiveFailures).toBe(0);
    });

    it('clears lastError on success', () => {
      useCiaSieHealthStore.getState().failCheck('some error');
      expect(useCiaSieHealthStore.getState().lastError).toBe('some error');

      useCiaSieHealthStore.getState().completeCheck({
        process: 'healthy',
        database: 'healthy',
        ai: 'healthy',
        webhook: 'healthy',
      });

      expect(useCiaSieHealthStore.getState().lastError).toBe(null);
    });
  });

  describe('failCheck', () => {
    it('increments consecutive failures', () => {
      useCiaSieHealthStore.getState().failCheck('error 1');
      expect(useCiaSieHealthStore.getState().consecutiveFailures).toBe(1);

      useCiaSieHealthStore.getState().failCheck('error 2');
      expect(useCiaSieHealthStore.getState().consecutiveFailures).toBe(2);

      useCiaSieHealthStore.getState().failCheck('error 3');
      expect(useCiaSieHealthStore.getState().consecutiveFailures).toBe(3);
    });

    it('marks process unhealthy after 3 consecutive failures', () => {
      useCiaSieHealthStore.getState().failCheck('error 1');
      expect(useCiaSieHealthStore.getState().subsystems.process).toBe('unknown');

      useCiaSieHealthStore.getState().failCheck('error 2');
      expect(useCiaSieHealthStore.getState().subsystems.process).toBe('unknown');

      useCiaSieHealthStore.getState().failCheck('error 3');
      expect(useCiaSieHealthStore.getState().subsystems.process).toBe('unhealthy');
    });

    it('records lastError', () => {
      useCiaSieHealthStore.getState().failCheck('connection refused');
      expect(useCiaSieHealthStore.getState().lastError).toBe('connection refused');
    });

    it('records lastFailureAt timestamp', () => {
      const before = Date.now();
      useCiaSieHealthStore.getState().failCheck('error');
      const after = Date.now();

      const state = useCiaSieHealthStore.getState();
      expect(state.lastFailureAt).toBeGreaterThanOrEqual(before);
      expect(state.lastFailureAt).toBeLessThanOrEqual(after);
    });

    it('enters degraded mode after 3 failures', () => {
      useCiaSieHealthStore.getState().failCheck('error 1');
      useCiaSieHealthStore.getState().failCheck('error 2');
      expect(useCiaSieHealthStore.getState().isDegradedMode).toBe(false);

      useCiaSieHealthStore.getState().failCheck('error 3');
      expect(useCiaSieHealthStore.getState().isDegradedMode).toBe(true);
    });
  });

  describe('startCheck', () => {
    it('sets isChecking to true', () => {
      useCiaSieHealthStore.getState().startCheck();
      expect(useCiaSieHealthStore.getState().isChecking).toBe(true);
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', () => {
      // Modify state
      useCiaSieHealthStore.getState().completeCheck({
        process: 'healthy',
        database: 'healthy',
        ai: 'healthy',
        webhook: 'healthy',
      });
      useCiaSieHealthStore.getState().failCheck('error');

      // Reset
      useCiaSieHealthStore.getState().reset();

      const state = useCiaSieHealthStore.getState();
      expect(state.overall).toBe('unknown');
      expect(state.consecutiveFailures).toBe(0);
      expect(state.lastError).toBe(null);
      expect(state.isDegradedMode).toBe(false);
    });
  });

  describe('Selectors', () => {
    describe('selectCiaSieAvailable', () => {
      it('returns true when healthy', () => {
        useCiaSieHealthStore.getState().completeCheck({
          process: 'healthy',
          database: 'healthy',
          ai: 'healthy',
          webhook: 'healthy',
        });
        expect(selectCiaSieAvailable(useCiaSieHealthStore.getState())).toBe(true);
      });

      it('returns true when degraded (partially available)', () => {
        useCiaSieHealthStore.getState().completeCheck({
          process: 'healthy',
          database: 'unhealthy',
          ai: 'healthy',
          webhook: 'healthy',
        });
        expect(selectCiaSieAvailable(useCiaSieHealthStore.getState())).toBe(true);
      });

      it('returns false when unhealthy', () => {
        useCiaSieHealthStore.getState().completeCheck({
          process: 'unhealthy',
          database: 'unknown',
          ai: 'unknown',
          webhook: 'unknown',
        });
        expect(selectCiaSieAvailable(useCiaSieHealthStore.getState())).toBe(false);
      });

      it('returns false when unknown', () => {
        expect(selectCiaSieAvailable(useCiaSieHealthStore.getState())).toBe(false);
      });
    });

    describe('selectFeatureAvailability', () => {
      it('returns correct feature availability', () => {
        useCiaSieHealthStore.getState().completeCheck({
          process: 'healthy',
          database: 'healthy',
          ai: 'unhealthy',
          webhook: 'healthy',
        });

        const availability = selectFeatureAvailability(useCiaSieHealthStore.getState());
        expect(availability.signals).toBe(true);
        expect(availability.narratives).toBe(false);
        expect(availability.webhooks).toBe(true);
        expect(availability.any).toBe(true);
      });

      it('returns all false when process unhealthy', () => {
        useCiaSieHealthStore.getState().completeCheck({
          process: 'unhealthy',
          database: 'healthy',
          ai: 'healthy',
          webhook: 'healthy',
        });

        const availability = selectFeatureAvailability(useCiaSieHealthStore.getState());
        expect(availability.any).toBe(false);
      });
    });

    describe('selectStatusMessage', () => {
      it('returns operational message when healthy', () => {
        useCiaSieHealthStore.getState().completeCheck({
          process: 'healthy',
          database: 'healthy',
          ai: 'healthy',
          webhook: 'healthy',
        });
        expect(selectStatusMessage(useCiaSieHealthStore.getState())).toBe('CIA-SIE-PURE operational');
      });

      it('returns degraded message with details', () => {
        useCiaSieHealthStore.getState().completeCheck({
          process: 'healthy',
          database: 'unhealthy',
          ai: 'healthy',
          webhook: 'healthy',
        });
        expect(selectStatusMessage(useCiaSieHealthStore.getState())).toContain('degraded');
        expect(selectStatusMessage(useCiaSieHealthStore.getState())).toContain('database');
      });

      it('returns unavailable message when unhealthy', () => {
        useCiaSieHealthStore.getState().completeCheck({
          process: 'unhealthy',
          database: 'unknown',
          ai: 'unknown',
          webhook: 'unknown',
        });
        expect(selectStatusMessage(useCiaSieHealthStore.getState())).toBe('CIA-SIE-PURE unavailable');
      });

      it('returns unknown message when unknown', () => {
        expect(selectStatusMessage(useCiaSieHealthStore.getState())).toBe('CIA-SIE-PURE status unknown');
      });
    });
  });
});

// ============================================================================
// SILO 3: Engine State Handshake Model Tests
// ============================================================================

import {
  toEngineObservation,
  selectEngineObservation,
  formatStateTransition,
  type EngineStateTransition,
} from './ciaSieHealthStore';

describe('SILO 3: Engine State Handshake Model', () => {
  beforeEach(() => {
    useCiaSieHealthStore.getState().reset();
  });

  describe('toEngineObservation', () => {
    it('converts healthy state to connected observation', () => {
      useCiaSieHealthStore.getState().completeCheck({
        process: 'healthy',
        database: 'healthy',
        ai: 'healthy',
        webhook: 'healthy',
      });

      const observation = toEngineObservation(useCiaSieHealthStore.getState());

      expect(observation.status).toBe('connected');
      expect(observation.isDegradedMode).toBe(false);
      expect(observation.subsystems.process).toBe(true);
      expect(observation.subsystems.database).toBe(true);
      expect(observation.subsystems.ai).toBe(true);
      expect(observation.subsystems.webhook).toBe(true);
      expect(observation.statusMessage).toContain('reachable');
    });

    it('converts degraded state to degraded observation', () => {
      useCiaSieHealthStore.getState().completeCheck({
        process: 'healthy',
        database: 'unhealthy',
        ai: 'healthy',
        webhook: 'healthy',
      });

      const observation = toEngineObservation(useCiaSieHealthStore.getState());

      expect(observation.status).toBe('degraded');
      expect(observation.isDegradedMode).toBe(true);
      expect(observation.subsystems.database).toBe(false);
      expect(observation.statusMessage).toContain('partially available');
      expect(observation.statusMessage).toContain('database');
    });

    it('converts unhealthy state to disconnected observation', () => {
      useCiaSieHealthStore.getState().completeCheck({
        process: 'unhealthy',
        database: 'unknown',
        ai: 'unknown',
        webhook: 'unknown',
      });

      const observation = toEngineObservation(useCiaSieHealthStore.getState());

      expect(observation.status).toBe('disconnected');
      expect(observation.isDegradedMode).toBe(true);
      expect(observation.statusMessage).toContain('not responding');
    });

    it('converts unknown state to unknown observation', () => {
      const observation = toEngineObservation(useCiaSieHealthStore.getState());

      expect(observation.status).toBe('unknown');
      expect(observation.statusMessage).toContain('unknown');
    });

    it('shows checking status when isChecking is true', () => {
      useCiaSieHealthStore.getState().startCheck();

      const observation = toEngineObservation(useCiaSieHealthStore.getState());

      expect(observation.status).toBe('checking');
      expect(observation.statusMessage).toContain('Checking');
    });

    it('tracks consecutive failures', () => {
      useCiaSieHealthStore.getState().failCheck('error 1');
      useCiaSieHealthStore.getState().failCheck('error 2');

      const observation = toEngineObservation(useCiaSieHealthStore.getState());

      expect(observation.consecutiveFailures).toBe(2);
    });

    it('includes lastSeenAt when available', () => {
      useCiaSieHealthStore.getState().completeCheck({
        process: 'healthy',
        database: 'healthy',
        ai: 'healthy',
        webhook: 'healthy',
      });

      const observation = toEngineObservation(useCiaSieHealthStore.getState());

      expect(observation.lastSeenAt).toBeTruthy();
      expect(typeof observation.lastSeenAt).toBe('number');
    });

    it('shows last seen time in disconnected message', () => {
      // First connect
      useCiaSieHealthStore.getState().completeCheck({
        process: 'healthy',
        database: 'healthy',
        ai: 'healthy',
        webhook: 'healthy',
      });

      // Then disconnect
      useCiaSieHealthStore.getState().failCheck('error 1');
      useCiaSieHealthStore.getState().failCheck('error 2');
      useCiaSieHealthStore.getState().failCheck('error 3');

      const observation = toEngineObservation(useCiaSieHealthStore.getState());

      expect(observation.status).toBe('disconnected');
      expect(observation.statusMessage).toContain('Last seen:');
    });
  });

  describe('selectEngineObservation', () => {
    it('returns same result as toEngineObservation', () => {
      useCiaSieHealthStore.getState().completeCheck({
        process: 'healthy',
        database: 'healthy',
        ai: 'healthy',
        webhook: 'healthy',
      });

      const state = useCiaSieHealthStore.getState();
      const fromFunction = toEngineObservation(state);
      const fromSelector = selectEngineObservation(state);

      expect(fromSelector.status).toBe(fromFunction.status);
      expect(fromSelector.isDegradedMode).toBe(fromFunction.isDegradedMode);
      expect(fromSelector.statusMessage).toBe(fromFunction.statusMessage);
    });
  });

  describe('formatStateTransition', () => {
    it('formats transition with all details', () => {
      const transition: EngineStateTransition = {
        from: 'connected',
        to: 'disconnected',
        trigger: 'health_check_failure',
        timestamp: 1738157000000,
      };

      const formatted = formatStateTransition(transition);

      expect(formatted).toContain('[ENGINE]');
      expect(formatted).toContain('connected');
      expect(formatted).toContain('disconnected');
      expect(formatted).toContain('health_check_failure');
    });

    it('includes ISO timestamp', () => {
      const transition: EngineStateTransition = {
        from: 'unknown',
        to: 'connected',
        trigger: 'health_check_success',
        timestamp: Date.now(),
      };

      const formatted = formatStateTransition(transition);

      // Should contain a timestamp pattern like 2026-01-29T...
      expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('SILO 3: Lifecycle Constraints', () => {
    it('store does NOT expose start method', () => {
      const store = useCiaSieHealthStore.getState();
      // @ts-expect-error - Verifying no start method exists
      expect(store.start).toBeUndefined();
    });

    it('store does NOT expose stop method', () => {
      const store = useCiaSieHealthStore.getState();
      // @ts-expect-error - Verifying no stop method exists
      expect(store.stop).toBeUndefined();
    });

    it('store does NOT expose restart method', () => {
      const store = useCiaSieHealthStore.getState();
      // @ts-expect-error - Verifying no restart method exists
      expect(store.restart).toBeUndefined();
    });

    it('store does NOT expose pause method', () => {
      const store = useCiaSieHealthStore.getState();
      // @ts-expect-error - Verifying no pause method exists
      expect(store.pause).toBeUndefined();
    });

    it('store does NOT expose resume method', () => {
      const store = useCiaSieHealthStore.getState();
      // @ts-expect-error - Verifying no resume method exists
      expect(store.resume).toBeUndefined();
    });

    it('only exposes observation methods', () => {
      const store = useCiaSieHealthStore.getState();
      
      // These methods SHOULD exist
      expect(typeof store.updateHealth).toBe('function');
      expect(typeof store.startCheck).toBe('function');
      expect(typeof store.completeCheck).toBe('function');
      expect(typeof store.failCheck).toBe('function');
      expect(typeof store.reset).toBe('function');
    });
  });

  describe('SILO 3: State Transition Semantics', () => {
    it('UNKNOWN → CONNECTED on first successful check', () => {
      expect(useCiaSieHealthStore.getState().overall).toBe('unknown');

      useCiaSieHealthStore.getState().completeCheck({
        process: 'healthy',
        database: 'healthy',
        ai: 'healthy',
        webhook: 'healthy',
      });

      expect(useCiaSieHealthStore.getState().overall).toBe('healthy');
      expect(toEngineObservation(useCiaSieHealthStore.getState()).status).toBe('connected');
    });

    it('CONNECTED → DISCONNECTED after 3 failures', () => {
      useCiaSieHealthStore.getState().completeCheck({
        process: 'healthy',
        database: 'healthy',
        ai: 'healthy',
        webhook: 'healthy',
      });
      expect(toEngineObservation(useCiaSieHealthStore.getState()).status).toBe('connected');

      useCiaSieHealthStore.getState().failCheck('error 1');
      useCiaSieHealthStore.getState().failCheck('error 2');
      useCiaSieHealthStore.getState().failCheck('error 3');

      expect(toEngineObservation(useCiaSieHealthStore.getState()).status).toBe('disconnected');
    });

    it('DISCONNECTED → CONNECTED on recovery', () => {
      // Fail to disconnected
      useCiaSieHealthStore.getState().failCheck('error 1');
      useCiaSieHealthStore.getState().failCheck('error 2');
      useCiaSieHealthStore.getState().failCheck('error 3');
      expect(toEngineObservation(useCiaSieHealthStore.getState()).status).toBe('disconnected');

      // Recover
      useCiaSieHealthStore.getState().completeCheck({
        process: 'healthy',
        database: 'healthy',
        ai: 'healthy',
        webhook: 'healthy',
      });

      expect(toEngineObservation(useCiaSieHealthStore.getState()).status).toBe('connected');
      expect(useCiaSieHealthStore.getState().consecutiveFailures).toBe(0);
    });

    it('CONNECTED → DEGRADED on subsystem failure', () => {
      useCiaSieHealthStore.getState().completeCheck({
        process: 'healthy',
        database: 'healthy',
        ai: 'healthy',
        webhook: 'healthy',
      });
      expect(toEngineObservation(useCiaSieHealthStore.getState()).status).toBe('connected');

      useCiaSieHealthStore.getState().completeCheck({
        process: 'healthy',
        database: 'unhealthy',
        ai: 'healthy',
        webhook: 'healthy',
      });

      expect(toEngineObservation(useCiaSieHealthStore.getState()).status).toBe('degraded');
    });

    it('DEGRADED → CONNECTED when all subsystems recover', () => {
      useCiaSieHealthStore.getState().completeCheck({
        process: 'healthy',
        database: 'unhealthy',
        ai: 'healthy',
        webhook: 'healthy',
      });
      expect(toEngineObservation(useCiaSieHealthStore.getState()).status).toBe('degraded');

      useCiaSieHealthStore.getState().completeCheck({
        process: 'healthy',
        database: 'healthy',
        ai: 'healthy',
        webhook: 'healthy',
      });

      expect(toEngineObservation(useCiaSieHealthStore.getState()).status).toBe('connected');
    });
  });
});
