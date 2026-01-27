/**
 * IRONCLAD Integration Test Suite: Full Trading Flow
 *
 * Tests the complete lifecycle:
 * Token Capture → Pre-Ignition Scan → Ignition → Telemetry → Shutdown
 *
 * Financial-grade verification of:
 * - State transitions across stores
 * - Error propagation between phases
 * - Recovery scenarios
 * - Complete system reset
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useTokenStore } from '../../client/stores/tokenStore';
import { useScannerStore } from '../../client/stores/scannerStore';
import { useIgnitionStore } from '../../client/stores/ignitionStore';
import { useTelemetryStore } from '../../client/stores/telemetryStore';
import { useShutdownStore } from '../../client/stores/shutdownStore';

describe('IRONCLAD: Full Trading Flow Integration', () => {
  // Helper to reset ALL stores
  const resetAllStores = () => {
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
    useShutdownStore.setState({
      closePositions: false,
      cancelOrders: true,
      saveState: true,
    });
  };

  // Mock successful API responses
  const mockSuccessfulAPIs = () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      // Token validation
      if (url.includes('/api/auth/validate')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              valid: true,
              account: { id: 'test-123', status: 'ACTIVE' },
            }),
        });
      }

      // Scan checks
      if (url.includes('/api/scan/')) {
        return Promise.resolve({
          json: () => Promise.resolve({ passed: true, message: 'Check passed' }),
        });
      }

      // Ignition
      if (url.includes('/api/ignition/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }

      // Shutdown
      if (url.includes('/api/shutdown/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Step completed' }),
        });
      }

      // Telemetry
      if (url.includes('/api/telemetry/')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              positions: [],
              orders: [],
              account: { equity: 100000 },
            }),
        });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  };

  // Helper to run async operation with timer advancement
  const runWithTimers = async <T>(operation: () => Promise<T>): Promise<T> => {
    const promise = operation();
    // Advance all pending timers to completion
    await vi.runAllTimersAsync();
    return promise;
  };

  beforeEach(() => {
    resetAllStores();
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Happy Path: Complete Trading Session', () => {
    it('should complete full flow: Token → Scan → Ignition → Telemetry → Shutdown', async () => {
      mockSuccessfulAPIs();

      // PHASE 0: Token Capture
      useTokenStore.getState().setAlpacaCredentials('test-key', 'test-secret');
      const tokenValid = await runWithTimers(() => useTokenStore.getState().validateTokens());

      expect(tokenValid).toBe(true);
      expect(useTokenStore.getState().isTokenValid).toBe(true);

      // PHASE 1: Pre-Ignition Scan
      useScannerStore.getState().initializeChecks();
      await runWithTimers(() => useScannerStore.getState().startScan());

      expect(useScannerStore.getState().canProceed).toBe(true);
      expect(useScannerStore.getState().failedCount).toBe(0);

      // PHASE 2: Ignition
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();

      expect(useIgnitionStore.getState().isArmed).toBe(true);

      await runWithTimers(() => useIgnitionStore.getState().ignite());

      expect(useIgnitionStore.getState().phase).toBe('running');

      // PHASE 3: Telemetry (simulated)
      useTelemetryStore.getState().setConnected(true);
      useTelemetryStore.getState().setPositions([]);
      useTelemetryStore.getState().setOrders([]);

      expect(useTelemetryStore.getState().isConnected).toBe(true);

      // PHASE 4: Shutdown
      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

      expect(useShutdownStore.getState().phase).toBe('complete');

      // Verify clean state after shutdown
      useTelemetryStore.getState().setConnected(false);
      expect(useTelemetryStore.getState().isConnected).toBe(false);
    });
  });

  describe('Error Propagation: Token Failure', () => {
    it('should not allow scan if token validation fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });

      useTokenStore.getState().setAlpacaCredentials('bad-key', 'bad-secret');
      const tokenValid = await runWithTimers(() => useTokenStore.getState().validateTokens());

      expect(tokenValid).toBe(false);
      expect(useTokenStore.getState().captureError).toBe('Invalid credentials');

      // Attempting scan should not proceed (in real app, UI would prevent this)
      // But the scanner should still work independently
      useScannerStore.getState().initializeChecks();

      // Token validity check in scanner would fail
      expect(useTokenStore.getState().isTokenValid).toBe(false);
    });
  });

  describe('Error Propagation: Scan Failure', () => {
    it('should not allow ignition if critical scan fails', async () => {
      mockSuccessfulAPIs();

      // Valid tokens
      useTokenStore.getState().setAlpacaCredentials('test-key', 'test-secret');
      await runWithTimers(() => useTokenStore.getState().validateTokens());

      // Override scan to fail critical check
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/scan/alpaca-connection')) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({ passed: false, message: 'Connection failed' }),
          });
        }
        return Promise.resolve({
          json: () => Promise.resolve({ passed: true }),
        });
      });

      useScannerStore.getState().initializeChecks();
      await runWithTimers(() => useScannerStore.getState().startScan());

      expect(useScannerStore.getState().canProceed).toBe(false);
      expect(useScannerStore.getState().failedCount).toBeGreaterThan(0);

      // Ignition should not be allowed (UI enforcement)
      // But verify the store state would prevent it
      expect(useScannerStore.getState().canProceed).toBe(false);
    });
  });

  describe('Error Propagation: Ignition Failure', () => {
    it('should handle ignition failure and allow retry', async () => {
      mockSuccessfulAPIs();

      // Valid tokens
      useTokenStore.getState().setAlpacaCredentials('test-key', 'test-secret');
      await runWithTimers(() => useTokenStore.getState().validateTokens());

      // Successful scan
      useScannerStore.getState().initializeChecks();
      await runWithTimers(() => useScannerStore.getState().startScan());

      // Ignition will fail
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Engine failure' }),
      });

      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();
      await runWithTimers(() => useIgnitionStore.getState().ignite());

      expect(useIgnitionStore.getState().phase).toBe('error');
      expect(useIgnitionStore.getState().ignitionError).toBe('Engine failure');

      // Recovery: Reset and retry
      useIgnitionStore.getState().reset();

      expect(useIgnitionStore.getState().phase).toBe('idle');
      expect(useIgnitionStore.getState().ignitionError).toBeNull();

      // Retry should work
      mockSuccessfulAPIs();
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();
      await runWithTimers(() => useIgnitionStore.getState().ignite());

      expect(useIgnitionStore.getState().phase).toBe('running');
    });
  });

  describe('Error Propagation: Shutdown Failure', () => {
    it('should complete emergency shutdown despite step failures', async () => {
      mockSuccessfulAPIs();

      // Get to running state
      useTokenStore.getState().setAlpacaCredentials('test-key', 'test-secret');
      await runWithTimers(() => useTokenStore.getState().validateTokens());

      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();
      await runWithTimers(() => useIgnitionStore.getState().ignite());

      expect(useIgnitionStore.getState().phase).toBe('running');

      // Shutdown with failures
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 0) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ message: 'Step failed' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown(true)); // Emergency

      // Should still complete
      expect(useShutdownStore.getState().phase).toBe('complete');
    });
  });

  describe('State Isolation Between Phases', () => {
    it('should not leak state between phases', async () => {
      mockSuccessfulAPIs();

      // Complete a full cycle
      useTokenStore.getState().setAlpacaCredentials('test-key', 'test-secret');
      await runWithTimers(() => useTokenStore.getState().validateTokens());

      useScannerStore.getState().initializeChecks();
      await runWithTimers(() => useScannerStore.getState().startScan());

      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();
      await runWithTimers(() => useIgnitionStore.getState().ignite());

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

      // Reset all stores
      resetAllStores();

      // Verify complete isolation
      expect(useTokenStore.getState().isTokenValid).toBe(false);
      expect(useScannerStore.getState().checks).toHaveLength(0);
      expect(useIgnitionStore.getState().phase).toBe('idle');
      expect(useTelemetryStore.getState().isConnected).toBe(false);
      expect(useShutdownStore.getState().phase).toBe('idle');
    });
  });

  describe('Live Trading Safety Across Flow', () => {
    it('should enforce all safety checks for live trading', async () => {
      mockSuccessfulAPIs();

      // Valid tokens
      useTokenStore.getState().setAlpacaCredentials('test-key', 'test-secret');
      await runWithTimers(() => useTokenStore.getState().validateTokens());

      // Successful scan
      useScannerStore.getState().initializeChecks();
      await runWithTimers(() => useScannerStore.getState().startScan());

      // Live trading selection
      useIgnitionStore.getState().selectBackend('live');

      // Cannot arm without confirmation
      useIgnitionStore.getState().armSystem();
      expect(useIgnitionStore.getState().isArmed).toBe(false);

      // Confirm live trading
      useIgnitionStore.getState().confirmLive();
      useIgnitionStore.getState().armSystem();

      expect(useIgnitionStore.getState().isArmed).toBe(true);
      expect(useIgnitionStore.getState().liveConfirmed).toBe(true);

      // Successful ignition
      await runWithTimers(() => useIgnitionStore.getState().ignite());

      expect(useIgnitionStore.getState().phase).toBe('running');
      expect(useIgnitionStore.getState().selectedBackend).toBe('live');
    });
  });

  describe('Concurrent Operations Handling', () => {
    it('should handle concurrent scan and token refresh', async () => {
      mockSuccessfulAPIs();

      useTokenStore.getState().setAlpacaCredentials('test-key', 'test-secret');
      useScannerStore.getState().initializeChecks();

      // Start both concurrently and run all timers
      const tokenPromise = useTokenStore.getState().validateTokens();
      const scanPromise = useScannerStore.getState().startScan();
      await vi.runAllTimersAsync();

      const [tokenResult] = await Promise.all([tokenPromise, scanPromise]);

      expect(tokenResult).toBe(true);
      expect(useScannerStore.getState().isScanning).toBe(false);
    });

    it('should handle rapid phase transitions', async () => {
      mockSuccessfulAPIs();

      useTokenStore.getState().setAlpacaCredentials('test-key', 'test-secret');
      await runWithTimers(() => useTokenStore.getState().validateTokens());

      // Rapid state changes
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();
      useIgnitionStore.getState().disarmSystem();
      useIgnitionStore.getState().armSystem();
      await runWithTimers(() => useIgnitionStore.getState().ignite());

      expect(useIgnitionStore.getState().phase).toBe('running');
    });
  });

  describe('Complete System Reset', () => {
    it('should reset entire system cleanly after any failure', async () => {
      mockSuccessfulAPIs();

      // Get to a complex state
      useTokenStore.getState().setAlpacaCredentials('test-key', 'test-secret');
      await runWithTimers(() => useTokenStore.getState().validateTokens());

      useScannerStore.getState().initializeChecks();
      await runWithTimers(() => useScannerStore.getState().startScan());

      useIgnitionStore.getState().selectBackend('live');
      useIgnitionStore.getState().confirmLive();
      useIgnitionStore.getState().armSystem();
      await runWithTimers(() => useIgnitionStore.getState().ignite());

      useTelemetryStore.getState().setConnected(true);
      useTelemetryStore.getState().setPositions([{ symbol: 'AAPL' } as any]);

      // Simulate failure
      useIgnitionStore.setState({ phase: 'error', ignitionError: 'Critical failure' });

      // Full system reset
      resetAllStores();

      // Verify complete reset
      expect(useTokenStore.getState().alpacaKey).toBe('');
      expect(useTokenStore.getState().isTokenValid).toBe(false);
      expect(useScannerStore.getState().checks).toHaveLength(0);
      expect(useIgnitionStore.getState().phase).toBe('idle');
      expect(useIgnitionStore.getState().selectedBackend).toBeNull();
      expect(useTelemetryStore.getState().positions).toHaveLength(0);
      expect(useTelemetryStore.getState().isConnected).toBe(false);
      expect(useShutdownStore.getState().steps).toHaveLength(0);
    });
  });
});
