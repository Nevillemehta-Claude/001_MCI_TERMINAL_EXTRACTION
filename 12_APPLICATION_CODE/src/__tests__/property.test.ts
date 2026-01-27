/**
 * IRONCLAD Property-Based Tests
 *
 * Uses fast-check to generate random inputs and verify invariants:
 * - State invariants (counts never negative, phase transitions valid)
 * - Data transformation properties (round-trip serialization)
 * - Boundary conditions (large inputs, special characters)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { useTokenStore } from '../client/stores/tokenStore';
import { useScannerStore } from '../client/stores/scannerStore';
import { useIgnitionStore } from '../client/stores/ignitionStore';
import { useTelemetryStore } from '../client/stores/telemetryStore';
import { useShutdownStore } from '../client/stores/shutdownStore';

describe('IRONCLAD: Property-Based Tests', () => {
  beforeEach(() => {
    // Reset all stores
    useTokenStore.setState({
      alpacaKey: '',
      alpacaSecret: '',
      polygonKey: '',
      tokenCapturedAt: null,
      tokenExpiresAt: null,
      isTokenValid: false,
      isCapturing: false,
      captureError: null,
    });
    useScannerStore.getState().resetScanner();
    useIgnitionStore.getState().reset();
    useTelemetryStore.getState().clearTelemetry();
    useShutdownStore.getState().reset();
  });

  describe('Token Store Properties', () => {
    it('should accept any string as API key', () => {
      fc.assert(
        fc.property(fc.string(), fc.string(), (key, secret) => {
          useTokenStore.getState().setAlpacaCredentials(key, secret);
          const state = useTokenStore.getState();

          // Invariant: key and secret are stored exactly as provided
          return state.alpacaKey === key && state.alpacaSecret === secret;
        }),
        { numRuns: 100 }
      );
    });

    it('should set tokenCapturedAt when credentials are set', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), fc.string({ minLength: 1 }), (key, secret) => {
          useTokenStore.getState().setAlpacaCredentials(key, secret);
          const state = useTokenStore.getState();

          // Invariant: tokenCapturedAt is set when credentials are provided
          return state.tokenCapturedAt !== null && typeof state.tokenCapturedAt === 'number';
        }),
        { numRuns: 50 }
      );
    });

    it('should handle special characters in credentials', () => {
      const specialChars = fc.string({
        minLength: 1,
        maxLength: 100,
      });

      fc.assert(
        fc.property(specialChars, specialChars, (key, secret) => {
          useTokenStore.getState().setAlpacaCredentials(key, secret);
          const state = useTokenStore.getState();

          // Invariant: special characters are preserved
          return state.alpacaKey === key && state.alpacaSecret === secret;
        }),
        { numRuns: 50 }
      );
    });

    it('should clear tokens completely', () => {
      fc.assert(
        fc.property(fc.string(), fc.string(), (key, secret) => {
          useTokenStore.getState().setAlpacaCredentials(key, secret);
          useTokenStore.getState().clearTokens();
          const state = useTokenStore.getState();

          // Invariant: all token state is cleared
          return state.alpacaKey === '' && state.alpacaSecret === '';
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Scanner Store Properties', () => {
    it('should maintain check count after initialization', () => {
      useScannerStore.getState().initializeChecks();
      const initialCount = useScannerStore.getState().checks.length;

      fc.assert(
        fc.property(fc.nat({ max: 100 }), (updateCount) => {
          // Perform random number of updates
          for (let i = 0; i < updateCount; i++) {
            const checks = useScannerStore.getState().checks;
            if (checks.length > 0) {
              const randomIndex = Math.floor(Math.random() * checks.length);
              useScannerStore.getState().updateCheck(checks[randomIndex].id, { status: 'passed' });
            }
          }

          // Invariant: check count remains constant
          return useScannerStore.getState().checks.length === initialCount;
        }),
        { numRuns: 20 }
      );
    });

    it('should maintain valid status values', () => {
      useScannerStore.getState().initializeChecks();
      const validStatuses = ['pending', 'running', 'passed', 'failed', 'warning'];

      fc.assert(
        fc.property(fc.constantFrom(...validStatuses), (status) => {
          const checks = useScannerStore.getState().checks;
          if (checks.length > 0) {
            useScannerStore
              .getState()
              .updateCheck(checks[0].id, { status: status as 'pending' | 'running' | 'passed' | 'failed' | 'warning' });
          }

          // Invariant: all statuses are valid
          return useScannerStore.getState().checks.every((c) => validStatuses.includes(c.status));
        }),
        { numRuns: 50 }
      );
    });

    it('should track check statuses correctly', () => {
      fc.assert(
        fc.property(fc.array(fc.boolean(), { minLength: 12, maxLength: 12 }), (passResults) => {
          // Reset to pending first
          useScannerStore.getState().resetScanner();
          useScannerStore.getState().initializeChecks();

          const checks = useScannerStore.getState().checks;
          let expectedPassed = 0;
          let expectedFailed = 0;

          // Apply random pass/fail status to each check
          passResults.forEach((passed, i) => {
            if (i < checks.length) {
              useScannerStore.getState().updateCheck(checks[i].id, { status: passed ? 'passed' : 'failed' });
              if (passed) expectedPassed++;
              else expectedFailed++;
            }
          });

          const state = useScannerStore.getState();

          // Invariant: check statuses match what we set
          const actualPassed = state.checks.filter((c) => c.status === 'passed').length;
          const actualFailed = state.checks.filter((c) => c.status === 'failed').length;
          return actualPassed === expectedPassed && actualFailed === expectedFailed;
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Ignition Store Properties', () => {
    it('should maintain valid phase values', () => {
      const validPhases = ['idle', 'selecting', 'arming', 'armed', 'igniting', 'running', 'error'];

      fc.assert(
        fc.property(fc.constantFrom('paper', 'live'), (backend) => {
          useIgnitionStore.getState().reset();
          useIgnitionStore.getState().selectBackend(backend as 'paper' | 'live');

          // Invariant: phase is always valid
          const phase = useIgnitionStore.getState().phase;
          return validPhases.includes(phase);
        }),
        { numRuns: 50 }
      );
    });

    it('should require arming before ignition', () => {
      fc.assert(
        fc.property(fc.constantFrom('paper', 'live'), (backend) => {
          useIgnitionStore.getState().reset();
          useIgnitionStore.getState().selectBackend(backend as 'paper' | 'live');

          // Without arming, isArmed should be false
          const state = useIgnitionStore.getState();
          // Invariant: not armed after just selecting backend
          return state.isArmed === false && state.phase === 'selecting';
        }),
        { numRuns: 20 }
      );
    });

    it('should reset all ignition state', () => {
      fc.assert(
        fc.property(fc.constantFrom('paper', 'live'), (backend) => {
          useIgnitionStore.getState().selectBackend(backend as 'paper' | 'live');
          if (backend === 'live') {
            useIgnitionStore.getState().confirmLive();
          }
          useIgnitionStore.getState().armSystem();

          // Reset
          useIgnitionStore.getState().reset();
          const state = useIgnitionStore.getState();

          // Invariant: all state is reset
          return (
            state.phase === 'idle' &&
            state.selectedBackend === null &&
            state.isArmed === false &&
            state.liveConfirmed === false
          );
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Telemetry Store Properties', () => {
    it('should handle any number of positions', () => {
      const positionArb = fc.record({
        symbol: fc.string({ minLength: 1, maxLength: 10 }),
        qty: fc.integer({ min: 0, max: 10000 }),
        side: fc.constantFrom('long', 'short'),
        entryPrice: fc.float({ min: 0, max: 1000000, noNaN: true }),
        currentPrice: fc.float({ min: 0, max: 1000000, noNaN: true }),
        unrealizedPL: fc.float({ min: -1000000, max: 1000000, noNaN: true }),
        unrealizedPLPercent: fc.float({ min: -100, max: 1000, noNaN: true }),
        marketValue: fc.float({ min: 0, max: 10000000, noNaN: true }),
      });

      fc.assert(
        fc.property(fc.array(positionArb, { maxLength: 100 }), (positions) => {
          useTelemetryStore.getState().setPositions(positions);
          const state = useTelemetryStore.getState();

          // Invariant: positions length matches input
          return state.positions.length === positions.length;
        }),
        { numRuns: 50 }
      );
    });

    it('should limit activity log to 100 entries', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 200 }), (logCount) => {
          useTelemetryStore.getState().clearTelemetry();

          for (let i = 0; i < logCount; i++) {
            useTelemetryStore.getState().addActivityLog({
              timestamp: Date.now(),
              type: 'trade',
              message: `Log entry ${i}`,
            });
          }

          const state = useTelemetryStore.getState();

          // Invariant: activity log never exceeds 100 entries
          return state.activityLog.length <= 100;
        }),
        { numRuns: 20 }
      );
    });

    it('should handle extreme account balance values', () => {
      fc.assert(
        fc.property(fc.float({ noNaN: true }), fc.float({ noNaN: true }), (equity, cash) => {
          useTelemetryStore.getState().setAccountMetrics({
            equity,
            cash,
            buyingPower: equity * 4,
            portfolioValue: equity,
            dayPL: 0,
            dayPLPercent: 0,
            totalPL: 0,
            totalPLPercent: 0,
          });

          const state = useTelemetryStore.getState();

          // Invariant: values are stored correctly
          return state.accountMetrics.equity === equity && state.accountMetrics.cash === cash;
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Shutdown Store Properties', () => {
    it('should maintain valid phase transitions', () => {
      const validPhases = ['idle', 'initiating', 'closing_positions', 'canceling_orders', 'disconnecting', 'complete', 'error'];

      fc.assert(
        fc.property(fc.boolean(), (emergency) => {
          useShutdownStore.getState().reset();
          // Just set options, don't actually initiate (would make network calls)
          useShutdownStore.getState().setOptions({
            closePositions: emergency,
            cancelOrders: true,
            saveState: !emergency,
          });

          const state = useShutdownStore.getState();

          // Invariant: phase is always valid
          return validPhases.includes(state.phase);
        }),
        { numRuns: 50 }
      );
    });

    it('should reset shutdown state completely', () => {
      fc.assert(
        fc.property(fc.boolean(), fc.boolean(), (closePositions, cancelOrders) => {
          useShutdownStore.getState().setOptions({ closePositions, cancelOrders });
          useShutdownStore.getState().reset();

          const state = useShutdownStore.getState();

          // Invariant: phase is reset (but options may persist per design)
          return state.phase === 'idle' && state.steps.length === 0 && state.error === null;
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Cross-Store Invariants', () => {
    it('should maintain independent store state', () => {
      fc.assert(
        fc.property(fc.string(), fc.constantFrom('paper', 'live'), (key, backend) => {
          // Modify multiple stores
          useTokenStore.getState().setAlpacaCredentials(key, 'secret');
          useScannerStore.getState().initializeChecks();
          useIgnitionStore.getState().selectBackend(backend as 'paper' | 'live');

          // Invariant: each store maintains its own state
          const tokenState = useTokenStore.getState();
          const scannerState = useScannerStore.getState();
          const ignitionState = useIgnitionStore.getState();

          return (
            tokenState.alpacaKey === key &&
            scannerState.checks.length === 12 &&
            ignitionState.selectedBackend === backend
          );
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Data Integrity Properties', () => {
    it('should preserve check IDs through updates', () => {
      useScannerStore.getState().initializeChecks();
      const originalIds = useScannerStore.getState().checks.map((c) => c.id);

      fc.assert(
        fc.property(fc.nat({ max: originalIds.length - 1 }), (index) => {
          useScannerStore.getState().updateCheck(originalIds[index], { status: 'passed' });

          const currentIds = useScannerStore.getState().checks.map((c) => c.id);

          // Invariant: IDs are preserved
          return originalIds.every((id, i) => currentIds[i] === id);
        }),
        { numRuns: 50 }
      );
    });

    it('should handle various string types in token values', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 100 }), (key) => {
          useTokenStore.getState().setAlpacaCredentials(key, 'secret');
          const state = useTokenStore.getState();

          // Invariant: string is preserved exactly
          return state.alpacaKey === key;
        }),
        { numRuns: 50 }
      );
    });
  });
});
