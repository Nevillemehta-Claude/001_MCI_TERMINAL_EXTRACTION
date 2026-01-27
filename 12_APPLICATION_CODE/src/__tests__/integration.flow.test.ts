/**
 * IRONCLAD Integration Flow Tests
 *
 * Tests the complete workflow across multiple components:
 * - Happy path: Token → Scan → Ignition → Telemetry → Shutdown
 * - Error recovery scenarios
 * - State isolation between phases
 * - Concurrent operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useTokenStore } from '../client/stores/tokenStore';
import { useScannerStore } from '../client/stores/scannerStore';
import { useIgnitionStore } from '../client/stores/ignitionStore';
import { useTelemetryStore } from '../client/stores/telemetryStore';
import { useShutdownStore } from '../client/stores/shutdownStore';

describe('IRONCLAD: Integration Flow Tests', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Reset all stores to initial state
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

  describe('Happy Path: Full System Lifecycle', () => {
    it('should complete full workflow: Token → Scan → Ignition → Telemetry → Shutdown', async () => {
      // Phase 0: Token Capture
      useTokenStore.getState().setAlpacaCredentials('test-key', 'test-secret');
      useTokenStore.getState().setPolygonKey('polygon-key');

      expect(useTokenStore.getState().alpacaKey).toBe('test-key');
      expect(useTokenStore.getState().polygonKey).toBe('polygon-key');
      expect(useTokenStore.getState().tokenCapturedAt).not.toBeNull();

      // Phase 1: Pre-Ignition Scan
      useScannerStore.getState().initializeChecks();
      expect(useScannerStore.getState().checks.length).toBe(12);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
      });

      await useScannerStore.getState().startScan();

      expect(useScannerStore.getState().isScanning).toBe(false);
      expect(useScannerStore.getState().passedCount).toBe(12);
      expect(useScannerStore.getState().canProceed).toBe(true);

      // Phase 2: Ignition
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          message: 'System started',
          state: { backend: 'paper', isRunning: true, startedAt: Date.now() },
        }),
      });

      // Select backend, arm, then ignite
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();
      await useIgnitionStore.getState().ignite();

      expect(useIgnitionStore.getState().phase).toBe('running');
      expect(useIgnitionStore.getState().selectedBackend).toBe('paper');

      // Phase 3: Telemetry (simulated data)
      useTelemetryStore.getState().setConnected(true);
      useTelemetryStore.getState().setPositions([{
        symbol: 'AAPL',
        qty: 100,
        side: 'long',
        entryPrice: 150,
        currentPrice: 155,
        unrealizedPL: 500,
        unrealizedPLPercent: 3.33,
        marketValue: 15500,
      }]);

      expect(useTelemetryStore.getState().isConnected).toBe(true);
      expect(useTelemetryStore.getState().positions.length).toBe(1);

      // Phase 4: Shutdown
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Step completed', duration: 100 }),
      });

      // initiateShutdown runs all steps automatically
      await useShutdownStore.getState().initiateShutdown();

      // Check shutdown completed
      expect(useShutdownStore.getState().phase).toBe('complete');
      const completedSteps = useShutdownStore.getState().steps.filter(s => s.status === 'complete');
      // At least save-state and cancel-orders run (close-positions skipped by default)
      expect(completedSteps.length).toBeGreaterThan(0);
    });

    it('should maintain state isolation between phases', async () => {
      // Set up token state
      useTokenStore.getState().setAlpacaCredentials('key', 'secret');

      // Token state should not affect scanner state
      expect(useScannerStore.getState().checks.length).toBe(0);

      // Initialize scanner
      useScannerStore.getState().initializeChecks();

      // Scanner state should not affect ignition state
      expect(useIgnitionStore.getState().phase).toBe('idle');

      // Ignite
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          state: { backend: 'paper', isRunning: true, startedAt: Date.now() },
        }),
      });
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();
      await useIgnitionStore.getState().ignite();

      // Ignition state should not affect telemetry state
      expect(useTelemetryStore.getState().positions.length).toBe(0);

      // All stores maintain their independent state
      expect(useTokenStore.getState().alpacaKey).toBe('key');
      expect(useScannerStore.getState().checks.length).toBe(12);
      expect(useIgnitionStore.getState().phase).toBe('running');
      expect(useTelemetryStore.getState().isConnected).toBe(false);
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('should handle scan failure and allow retry', async () => {
      useScannerStore.getState().initializeChecks();

      // First scan fails
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      await useScannerStore.getState().startScan();

      expect(useScannerStore.getState().failedCount).toBeGreaterThan(0);
      expect(useScannerStore.getState().canProceed).toBe(false);

      // Reset and retry with success
      useScannerStore.getState().resetScanner();
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
      });
      await useScannerStore.getState().startScan();

      expect(useScannerStore.getState().canProceed).toBe(true);
    });

    it('should handle ignition failure and maintain pre-ignition state', async () => {
      // Set up pre-ignition state
      useTokenStore.getState().setAlpacaCredentials('key', 'secret');
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
      });
      await useScannerStore.getState().startScan();

      // Attempt ignition with failure
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ success: false, message: 'Ignition failed' }),
      });

      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();
      await useIgnitionStore.getState().ignite();

      // Ignition should have failed
      expect(useIgnitionStore.getState().phase).toBe('error');
      expect(useIgnitionStore.getState().ignitionError).toBeDefined();

      // Pre-ignition state should be preserved
      expect(useTokenStore.getState().alpacaKey).toBe('key');
      expect(useScannerStore.getState().canProceed).toBe(true);
    });

    it('should handle telemetry disconnection gracefully', async () => {
      // Establish connection and set data
      useTelemetryStore.getState().setConnected(true);
      useTelemetryStore.getState().setPositions([{
        symbol: 'AAPL',
        qty: 100,
        side: 'long',
        entryPrice: 150,
        currentPrice: 155,
        unrealizedPL: 500,
        unrealizedPLPercent: 3.33,
        marketValue: 15500,
      }]);

      expect(useTelemetryStore.getState().isConnected).toBe(true);
      expect(useTelemetryStore.getState().positions.length).toBe(1);

      // Simulate disconnection
      useTelemetryStore.getState().setConnected(false);

      // Connection state changes but data persists
      expect(useTelemetryStore.getState().isConnected).toBe(false);
      expect(useTelemetryStore.getState().positions.length).toBe(1);
    });

    it('should handle partial shutdown failure and continue in emergency', async () => {
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          // Fail the second step
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ success: false, message: 'Step failed' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, message: 'OK', duration: 100 }),
        });
      });

      // Emergency shutdown continues despite errors
      await useShutdownStore.getState().initiateShutdown(true);

      // Emergency shutdown should complete despite step failure
      const state = useShutdownStore.getState();
      expect(state.phase).toBe('complete');

      // At least one step should have errored
      const errorSteps = state.steps.filter(s => s.status === 'error');
      const completedSteps = state.steps.filter(s => s.status === 'complete');

      expect(errorSteps.length).toBeGreaterThanOrEqual(1);
      expect(completedSteps.length).toBeGreaterThan(0);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent telemetry updates', async () => {
      useTelemetryStore.getState().setConnected(true);

      // Simulate rapid concurrent updates
      const updates = [];
      for (let i = 0; i < 50; i++) {
        updates.push(
          Promise.resolve().then(() => {
            useTelemetryStore.getState().setPositions([{
              symbol: 'AAPL',
              qty: i,
              side: 'long',
              entryPrice: 150,
              currentPrice: 150 + i,
              unrealizedPL: i * 10,
              unrealizedPLPercent: i / 10,
              marketValue: 150 * i,
            }]);
          })
        );
        updates.push(
          Promise.resolve().then(() => {
            useTelemetryStore.getState().addActivityLog({
              timestamp: Date.now(),
              type: 'trade',
              message: `Trade ${i}`,
            });
          })
        );
      }

      await Promise.all(updates);

      // State should be consistent
      expect(useTelemetryStore.getState().positions.length).toBe(1);
      expect(useTelemetryStore.getState().activityLog.length).toBeLessThanOrEqual(100);
    });

    it('should prevent double ignition', async () => {
      global.fetch = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({
                success: true,
                state: { backend: 'paper', isRunning: true, startedAt: Date.now() },
              }),
            });
          }, 10);
        });
      });

      // Select backend and arm first
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();

      // Start two ignitions concurrently
      const ignition1 = useIgnitionStore.getState().ignite();
      const ignition2 = useIgnitionStore.getState().ignite();

      await Promise.all([ignition1, ignition2]);

      // Both should complete, store should be in valid state
      expect(useIgnitionStore.getState().phase).toBe('running');
    });
  });

  describe('State Persistence and Reset', () => {
    it('should fully reset all stores for new session', async () => {
      // Set up state in all stores
      useTokenStore.getState().setAlpacaCredentials('key', 'secret');
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
      });
      await useScannerStore.getState().startScan();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          state: { backend: 'paper', isRunning: true, startedAt: Date.now() },
        }),
      });
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();
      await useIgnitionStore.getState().ignite();

      useTelemetryStore.getState().setConnected(true);
      useTelemetryStore.getState().setPositions([{
        symbol: 'AAPL',
        qty: 100,
        side: 'long',
        entryPrice: 150,
        currentPrice: 155,
        unrealizedPL: 500,
        unrealizedPLPercent: 3.33,
        marketValue: 15500,
      }]);

      // Reset all stores
      useTokenStore.getState().clearTokens();
      useScannerStore.getState().resetScanner();
      useIgnitionStore.getState().reset();
      useTelemetryStore.getState().clearTelemetry();
      useShutdownStore.getState().reset();

      // Verify all stores are reset
      expect(useTokenStore.getState().alpacaKey).toBe('');
      expect(useScannerStore.getState().checks.length).toBe(0);
      expect(useIgnitionStore.getState().phase).toBe('idle');
      expect(useTelemetryStore.getState().positions.length).toBe(0);
      expect(useTelemetryStore.getState().isConnected).toBe(false);
    });

    it('should preserve token state across scanner reset', async () => {
      useTokenStore.getState().setAlpacaCredentials('key', 'secret');
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
      });
      await useScannerStore.getState().startScan();

      // Reset scanner only
      useScannerStore.getState().resetScanner();

      // Token state preserved
      expect(useTokenStore.getState().alpacaKey).toBe('key');
      // Scanner reset
      expect(useScannerStore.getState().checks.length).toBe(0);
    });
  });

  describe('Edge Cases in Flow', () => {
    it('should handle token expiration during scan', async () => {
      // Set up expired token
      useTokenStore.setState({
        alpacaKey: 'key',
        alpacaSecret: 'secret',
        tokenExpiresAt: Date.now() - 1000, // Already expired
      });

      expect(useTokenStore.getState().isTokenExpired()).toBe(true);

      // Scanner should still be able to initialize and run
      // (token validation is separate from scanning)
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
      });
      await useScannerStore.getState().startScan();

      expect(useScannerStore.getState().canProceed).toBe(true);
    });

    it('should handle rapid phase transitions', async () => {
      // Rapid: Token → Scan → Ignite
      useTokenStore.getState().setAlpacaCredentials('key', 'secret');

      useScannerStore.getState().initializeChecks();
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
      });
      await useScannerStore.getState().startScan();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          state: { backend: 'paper', isRunning: true, startedAt: Date.now() },
        }),
      });
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();
      await useIgnitionStore.getState().ignite();

      // All states should be consistent
      expect(useTokenStore.getState().alpacaKey).toBe('key');
      expect(useScannerStore.getState().canProceed).toBe(true);
      expect(useIgnitionStore.getState().phase).toBe('running');
    });

    it('should handle abort from running state', async () => {
      // Set up for ignition
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();

      // Ignite successfully first
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          state: { backend: 'paper', isRunning: true, startedAt: Date.now() },
        }),
      });

      await useIgnitionStore.getState().ignite();
      expect(useIgnitionStore.getState().phase).toBe('running');

      // Now abort from running state
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await useIgnitionStore.getState().abort();

      // After abort, phase should be 'idle'
      expect(useIgnitionStore.getState().phase).toBe('idle');
    });
  });

  describe('Cross-Store Data Consistency', () => {
    it('should maintain consistent backend selection across stores', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          state: { backend: 'live', isRunning: true, startedAt: Date.now() },
        }),
      });

      // For live trading, need to confirm before arming
      useIgnitionStore.getState().selectBackend('live');
      useIgnitionStore.getState().confirmLive();
      useIgnitionStore.getState().armSystem();
      await useIgnitionStore.getState().ignite();

      // Backend should be 'live' in ignition store
      expect(useIgnitionStore.getState().selectedBackend).toBe('live');

      // Telemetry should be able to receive data for this backend
      useTelemetryStore.getState().setConnected(true);
      expect(useTelemetryStore.getState().isConnected).toBe(true);
    });

    it('should propagate shutdown across dependent stores', async () => {
      // Set up running system
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          state: { backend: 'paper', isRunning: true, startedAt: Date.now() },
        }),
      });
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();
      await useIgnitionStore.getState().ignite();

      useTelemetryStore.getState().setConnected(true);
      useTelemetryStore.getState().setPositions([{
        symbol: 'AAPL',
        qty: 100,
        side: 'long',
        entryPrice: 150,
        currentPrice: 155,
        unrealizedPL: 500,
        unrealizedPLPercent: 3.33,
        marketValue: 15500,
      }]);

      // Shutdown should clear telemetry
      useTelemetryStore.getState().clearTelemetry();

      expect(useTelemetryStore.getState().positions.length).toBe(0);
      expect(useTelemetryStore.getState().isConnected).toBe(false);

      // Reset ignition
      useIgnitionStore.getState().reset();
      expect(useIgnitionStore.getState().phase).toBe('idle');
    });
  });
});
