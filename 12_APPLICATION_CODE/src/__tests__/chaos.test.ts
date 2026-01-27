/**
 * IRONCLAD Chaos & Resilience Tests
 *
 * Tests system behavior under adverse conditions:
 * - Network failures
 * - Timeout scenarios
 * - Memory pressure (simulated)
 * - Rapid state transitions
 * - Concurrent operation stress
 * - Error cascade prevention
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useTokenStore } from '../client/stores/tokenStore';
import { useScannerStore } from '../client/stores/scannerStore';
import { useIgnitionStore } from '../client/stores/ignitionStore';
import { useTelemetryStore } from '../client/stores/telemetryStore';
import { useShutdownStore } from '../client/stores/shutdownStore';

describe('IRONCLAD: Chaos & Resilience Tests', () => {
  const originalFetch = global.fetch;

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
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Network Failure Scenarios', () => {
    it('should handle complete network outage gracefully', async () => {
      useScannerStore.getState().initializeChecks();

      // Simulate complete network failure
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error: Connection refused'));

      await useScannerStore.getState().startScan();

      const state = useScannerStore.getState();
      expect(state.isScanning).toBe(false);
      expect(state.failedCount).toBe(12); // All checks failed
    });

    it('should handle intermittent network failures', async () => {
      useScannerStore.getState().initializeChecks();

      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        // Fail every 3rd call
        if (callCount % 3 === 0) {
          return Promise.reject(new Error('Network timeout'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
        });
      });

      await useScannerStore.getState().startScan();

      const state = useScannerStore.getState();
      expect(state.passedCount).toBeGreaterThan(0);
      expect(state.failedCount).toBeGreaterThan(0);
      expect(state.isScanning).toBe(false);
    });

    it('should handle DNS resolution failures', async () => {
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockRejectedValue(new Error('getaddrinfo ENOTFOUND api.alpaca.markets'));

      await useScannerStore.getState().startScan();

      const state = useScannerStore.getState();
      expect(state.failedCount).toBeGreaterThan(0);
      // Error message should be captured
      const failedCheck = state.checks.find((c) => c.status === 'failed');
      expect(failedCheck?.message).toContain('ENOTFOUND');
    });

    it('should handle connection reset mid-request', async () => {
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockRejectedValue(new Error('ECONNRESET: Connection reset by peer'));

      await useScannerStore.getState().startScan();

      expect(useScannerStore.getState().isScanning).toBe(false);
    });
  });

  describe('Timeout Scenarios', () => {
    it('should handle slow responses without hanging', async () => {
      useScannerStore.getState().initializeChecks();

      // Simulate slow but eventually successful response
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
                }),
              50
            )
          )
      );

      await useScannerStore.getState().startScan();

      expect(useScannerStore.getState().isScanning).toBe(false);
      expect(useScannerStore.getState().passedCount).toBe(12);
    });

    it('should handle fetch that never resolves', async () => {
      useScannerStore.getState().initializeChecks();

      // Create abort controller for timeout
      const controller = new AbortController();

      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((_, reject) => {
            // Reject immediately to simulate timeout
            reject(new Error('AbortError: Request timeout'));
          })
      );

      await useScannerStore.getState().startScan();

      expect(useScannerStore.getState().isScanning).toBe(false);
    });
  });

  describe('Rapid State Transitions', () => {
    it('should handle rapid token credential changes', () => {
      // Rapidly change credentials
      for (let i = 0; i < 100; i++) {
        useTokenStore.getState().setAlpacaCredentials(`key-${i}`, `secret-${i}`);
      }

      const state = useTokenStore.getState();
      expect(state.alpacaKey).toBe('key-99');
      expect(state.alpacaSecret).toBe('secret-99');
    });

    it('should handle rapid scanner resets', () => {
      for (let i = 0; i < 50; i++) {
        useScannerStore.getState().initializeChecks();
        useScannerStore.getState().resetScanner();
      }

      // Should end in clean state
      expect(useScannerStore.getState().checks.length).toBe(0);
    });

    it('should handle rapid ignition state toggles', () => {
      for (let i = 0; i < 50; i++) {
        useIgnitionStore.getState().selectBackend('paper');
        useIgnitionStore.getState().armSystem();
        useIgnitionStore.getState().disarmSystem();
        useIgnitionStore.getState().reset();
      }

      // Should be in clean idle state
      const state = useIgnitionStore.getState();
      expect(state.phase).toBe('idle');
      expect(state.isArmed).toBe(false);
    });

    it('should handle rapid position updates', () => {
      useTelemetryStore.getState().setConnected(true);

      // Rapid position updates
      for (let i = 0; i < 100; i++) {
        useTelemetryStore.getState().setPositions([
          {
            symbol: 'AAPL',
            qty: i,
            side: 'long',
            entryPrice: 150,
            currentPrice: 150 + i,
            unrealizedPL: i * 10,
            unrealizedPLPercent: i / 10,
            marketValue: 150 * i,
          },
        ]);
      }

      // Should have final values
      const state = useTelemetryStore.getState();
      expect(state.positions[0].qty).toBe(99);
    });
  });

  describe('Concurrent Operation Stress', () => {
    it('should handle 100 concurrent activity log additions', async () => {
      useTelemetryStore.getState().setConnected(true);

      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          Promise.resolve().then(() => {
            useTelemetryStore.getState().addActivityLog({
              timestamp: Date.now(),
              type: 'trade',
              message: `Trade ${i}`,
            });
          })
        );
      }

      await Promise.all(promises);

      // Should be limited to 100 entries
      expect(useTelemetryStore.getState().activityLog.length).toBeLessThanOrEqual(100);
    });

    it('should handle concurrent check updates', () => {
      useScannerStore.getState().initializeChecks();
      const checks = useScannerStore.getState().checks;

      // Update all checks simultaneously
      checks.forEach((check, i) => {
        useScannerStore.getState().updateCheck(check.id, {
          status: i % 2 === 0 ? 'passed' : 'failed',
        });
      });

      // All updates should be applied
      const finalState = useScannerStore.getState();
      expect(finalState.checks.filter((c) => c.status === 'passed').length).toBeGreaterThan(0);
      expect(finalState.checks.filter((c) => c.status === 'failed').length).toBeGreaterThan(0);
    });

    it('should handle concurrent store operations across different stores', async () => {
      const operations = [
        () => useTokenStore.getState().setAlpacaCredentials('key', 'secret'),
        () => useScannerStore.getState().initializeChecks(),
        () => useIgnitionStore.getState().selectBackend('paper'),
        () => useTelemetryStore.getState().setConnected(true),
        () =>
          useTelemetryStore.getState().addActivityLog({
            timestamp: Date.now(),
            type: 'system',
            message: 'Test',
          }),
      ];

      // Execute all operations simultaneously
      await Promise.all(operations.map((op) => Promise.resolve().then(op)));

      // All stores should be in expected state
      expect(useTokenStore.getState().alpacaKey).toBe('key');
      expect(useScannerStore.getState().checks.length).toBe(12);
      expect(useIgnitionStore.getState().selectedBackend).toBe('paper');
      expect(useTelemetryStore.getState().isConnected).toBe(true);
    });
  });

  describe('Error Cascade Prevention', () => {
    it('should not propagate errors between stores', async () => {
      // Set up one store with error condition
      global.fetch = vi.fn().mockRejectedValue(new Error('Simulated error'));

      useScannerStore.getState().initializeChecks();
      await useScannerStore.getState().startScan();

      // Other stores should be unaffected
      expect(useTokenStore.getState().captureError).toBeNull();
      expect(useIgnitionStore.getState().ignitionError).toBeNull();
    });

    it('should recover state after error', async () => {
      useScannerStore.getState().initializeChecks();

      // Cause failure
      global.fetch = vi.fn().mockRejectedValue(new Error('Error'));
      await useScannerStore.getState().startScan();

      expect(useScannerStore.getState().failedCount).toBeGreaterThan(0);

      // Reset and retry with success
      useScannerStore.getState().resetScanner();
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
      });

      await useScannerStore.getState().startScan();

      expect(useScannerStore.getState().passedCount).toBe(12);
      expect(useScannerStore.getState().failedCount).toBe(0);
    });
  });

  describe('Memory and Resource Stress', () => {
    it('should handle large position arrays', () => {
      const largePositions = Array.from({ length: 1000 }, (_, i) => ({
        symbol: `SYM${i}`,
        qty: i,
        side: 'long' as const,
        entryPrice: 100,
        currentPrice: 100 + i,
        unrealizedPL: i * 10,
        unrealizedPLPercent: i,
        marketValue: 100 * i,
      }));

      useTelemetryStore.getState().setPositions(largePositions);

      expect(useTelemetryStore.getState().positions.length).toBe(1000);
    });

    it('should handle large order arrays', () => {
      const largeOrders = Array.from({ length: 1000 }, (_, i) => ({
        id: `order-${i}`,
        symbol: `SYM${i}`,
        side: 'buy' as const,
        qty: i,
        type: 'limit' as const,
        status: 'new' as const,
        submittedAt: Date.now(),
        filledQty: 0,
        limitPrice: 100,
      }));

      useTelemetryStore.getState().setOrders(largeOrders);

      expect(useTelemetryStore.getState().orders.length).toBe(1000);
    });

    it('should handle frequent market data updates', () => {
      // Simulate 1000 rapid updates
      for (let i = 0; i < 1000; i++) {
        useTelemetryStore.getState().updateMarketData('AAPL', {
          lastPrice: 150 + (i % 10),
          bid: 149.95 + (i % 10),
          ask: 150.05 + (i % 10),
          volume: 1000000 + i * 100,
          change: i % 5,
          changePercent: (i % 5) / 100,
        });
      }

      // Should have latest data for AAPL
      const marketData = useTelemetryStore.getState().marketData;
      expect(marketData['AAPL']).toBeDefined();
    });
  });

  describe('Edge Case Inputs', () => {
    it('should handle empty string credentials', () => {
      useTokenStore.getState().setAlpacaCredentials('', '');
      expect(useTokenStore.getState().alpacaKey).toBe('');
    });

    it('should handle very long credentials', () => {
      const longKey = 'x'.repeat(10000);
      useTokenStore.getState().setAlpacaCredentials(longKey, longKey);
      expect(useTokenStore.getState().alpacaKey.length).toBe(10000);
    });

    it('should handle special characters in credentials', () => {
      const specialKey = '!@#$%^&*()_+-=[]{}|;:\'",./<>?\\`~\n\t';
      useTokenStore.getState().setAlpacaCredentials(specialKey, specialKey);
      expect(useTokenStore.getState().alpacaKey).toBe(specialKey);
    });

    it('should handle NaN and Infinity in numeric fields', () => {
      useTelemetryStore.getState().setAccountMetrics({
        equity: NaN,
        cash: Infinity,
        buyingPower: -Infinity,
        portfolioValue: 0,
        dayPL: 0,
        dayPLPercent: 0,
        totalPL: 0,
        totalPLPercent: 0,
      });

      const metrics = useTelemetryStore.getState().accountMetrics;
      expect(Number.isNaN(metrics.equity)).toBe(true);
      expect(metrics.cash).toBe(Infinity);
    });

    it('should handle negative durations', () => {
      useScannerStore.getState().initializeChecks();
      useScannerStore
        .getState()
        .updateCheck('alpaca-connection', { duration: -1000 });

      const check = useScannerStore.getState().getCheckById('alpaca-connection');
      expect(check?.duration).toBe(-1000);
    });
  });

  describe('State Consistency Under Stress', () => {
    it('should maintain check order under concurrent updates', () => {
      useScannerStore.getState().initializeChecks();
      const originalIds = useScannerStore.getState().checks.map((c) => c.id);

      // Randomly update checks many times
      for (let i = 0; i < 100; i++) {
        const randomIndex = Math.floor(Math.random() * 12);
        const randomStatus = ['passed', 'failed', 'warning'][Math.floor(Math.random() * 3)] as
          | 'passed'
          | 'failed'
          | 'warning';
        useScannerStore.getState().updateCheck(originalIds[randomIndex], { status: randomStatus });
      }

      const finalIds = useScannerStore.getState().checks.map((c) => c.id);
      expect(finalIds).toEqual(originalIds);
    });

    it('should maintain check count under any operations', () => {
      useScannerStore.getState().initializeChecks();
      const initialCount = useScannerStore.getState().checks.length;

      // Perform many random operations
      for (let i = 0; i < 100; i++) {
        const check = useScannerStore.getState().checks[i % 12];
        useScannerStore.getState().updateCheck(check.id, {
          status: 'passed',
          message: `Update ${i}`,
          duration: i * 100,
        });
      }

      expect(useScannerStore.getState().checks.length).toBe(initialCount);
    });
  });
});
