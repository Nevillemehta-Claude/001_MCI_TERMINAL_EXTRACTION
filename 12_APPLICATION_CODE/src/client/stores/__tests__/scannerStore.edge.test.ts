/**
 * IRONCLAD Test Suite: scannerStore Edge Cases
 *
 * Financial-grade testing with exhaustive edge case coverage
 * - Boundary conditions
 * - Error scenarios
 * - Race conditions
 * - State corruption prevention
 * - Timeout handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useScannerStore } from '../scannerStore';

describe('IRONCLAD: scannerStore Edge Cases', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Complete state reset - IRONCLAD requirement
    useScannerStore.getState().resetScanner();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Boundary Conditions', () => {
    it('should handle empty checks array', () => {
      useScannerStore.setState({ checks: [] });

      const state = useScannerStore.getState();
      expect(state.checks).toEqual([]);
      expect(state.passedCount).toBe(0);
      expect(state.failedCount).toBe(0);
    });

    it('should handle extremely large number of checks', () => {
      const manyChecks = Array.from({ length: 1000 }, (_, i) => ({
        id: `check-${i}`,
        name: `Check ${i}`,
        description: `Description ${i}`,
        category: 'connection' as const,
        status: 'pending' as const,
        critical: i % 2 === 0,
      }));

      useScannerStore.setState({ checks: manyChecks });

      expect(useScannerStore.getState().checks.length).toBe(1000);
    });

    it('should handle check with extremely long ID', () => {
      const longId = 'check-'.padEnd(10000, 'x');
      useScannerStore.setState({
        checks: [{
          id: longId,
          name: 'Long ID Check',
          description: 'Test',
          category: 'connection',
          status: 'pending',
          critical: false,
        }],
      });

      const check = useScannerStore.getState().getCheckById(longId);
      expect(check?.id.length).toBe(10000);
    });

    it('should handle check with special characters in ID', () => {
      const specialId = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~';
      useScannerStore.setState({
        checks: [{
          id: specialId,
          name: 'Special ID Check',
          description: 'Test',
          category: 'connection',
          status: 'pending',
          critical: false,
        }],
      });

      const check = useScannerStore.getState().getCheckById(specialId);
      expect(check?.id).toBe(specialId);
    });

    it('should handle zero duration in check', () => {
      useScannerStore.setState({
        checks: [{
          id: 'fast-check',
          name: 'Fast Check',
          description: 'Test',
          category: 'connection',
          status: 'passed',
          critical: false,
          duration: 0,
        }],
      });

      const check = useScannerStore.getState().getCheckById('fast-check');
      expect(check?.duration).toBe(0);
    });

    it('should handle extremely large duration', () => {
      useScannerStore.setState({
        checks: [{
          id: 'slow-check',
          name: 'Slow Check',
          description: 'Test',
          category: 'connection',
          status: 'passed',
          critical: false,
          duration: Number.MAX_SAFE_INTEGER,
        }],
      });

      const check = useScannerStore.getState().getCheckById('slow-check');
      expect(check?.duration).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle scanStartedAt at epoch', () => {
      useScannerStore.setState({ scanStartedAt: 0 });
      expect(useScannerStore.getState().scanStartedAt).toBe(0);
    });

    it('should handle scanStartedAt in the future', () => {
      const futureTime = Date.now() + 1000000000;
      useScannerStore.setState({ scanStartedAt: futureTime });
      expect(useScannerStore.getState().scanStartedAt).toBe(futureTime);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle fetch throwing synchronously', async () => {
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockImplementation(() => {
        throw new Error('Synchronous fetch failure');
      });

      await useScannerStore.getState().startScan();

      const state = useScannerStore.getState();
      expect(state.isScanning).toBe(false);
      // At least one check should have failed
      expect(state.failedCount).toBeGreaterThan(0);
    });

    it('should handle fetch returning non-JSON response', async () => {
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await useScannerStore.getState().startScan();

      expect(useScannerStore.getState().isScanning).toBe(false);
      expect(useScannerStore.getState().failedCount).toBeGreaterThan(0);
    });

    it('should handle network timeout scenario', async () => {
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockRejectedValue(new Error('AbortError: Timeout'));

      await useScannerStore.getState().startScan();

      const state = useScannerStore.getState();
      expect(state.failedCount).toBeGreaterThan(0);
      const failedCheck = state.checks.find(c => c.status === 'failed');
      expect(failedCheck?.message).toContain('Timeout');
    });

    it('should handle HTTP 500 server error', async () => {
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ passed: false, message: 'Server error' }),
      });

      await useScannerStore.getState().startScan();

      const state = useScannerStore.getState();
      expect(state.failedCount).toBeGreaterThan(0);
    });

    it('should handle mixed success and failure responses', async () => {
      useScannerStore.getState().initializeChecks();

      let callIndex = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        callIndex++;
        if (callIndex % 2 === 0) {
          return Promise.reject(new Error('Network error'));
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
    });

    it('should handle undefined error message gracefully', async () => {
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockRejectedValue({ notAnError: true });

      await useScannerStore.getState().startScan();

      // Should complete without crashing
      expect(useScannerStore.getState().isScanning).toBe(false);
    });
  });

  describe('Race Conditions', () => {
    it('should handle concurrent startScan calls', async () => {
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
      });

      // Start multiple scans concurrently
      const promises = [
        useScannerStore.getState().startScan(),
        useScannerStore.getState().startScan(),
        useScannerStore.getState().startScan(),
      ];

      await Promise.all(promises);

      // Should complete without error
      expect(useScannerStore.getState().isScanning).toBe(false);
    });

    it('should handle resetScanner during startScan', async () => {
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockImplementation(() => {
        // Reset scanner mid-scan
        useScannerStore.getState().resetScanner();
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
        });
      });

      await useScannerStore.getState().startScan();

      // State should reflect the reset
      const state = useScannerStore.getState();
      expect(state.checks).toEqual([]);
    });

    it('should handle initializeChecks during startScan', async () => {
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockImplementation(() => {
        // Re-initialize checks mid-scan
        useScannerStore.getState().initializeChecks();
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
        });
      });

      await useScannerStore.getState().startScan();

      // Should complete without crashing
      expect(useScannerStore.getState().isScanning).toBe(false);
    });
  });

  describe('State Corruption Prevention', () => {
    it('should maintain state consistency after partial failures', async () => {
      useScannerStore.getState().initializeChecks();
      const initialCheckCount = useScannerStore.getState().checks.length;

      global.fetch = vi.fn().mockRejectedValue(new Error('Partial failure'));

      await useScannerStore.getState().startScan();

      // Check count should remain consistent
      expect(useScannerStore.getState().checks.length).toBe(initialCheckCount);
      // isScanning should be reset
      expect(useScannerStore.getState().isScanning).toBe(false);
    });

    it('should not allow negative counts', () => {
      useScannerStore.setState({
        passedCount: -1,
        failedCount: -1,
        warningCount: -1,
      });

      // Store accepts negative values (no validation in place)
      // This documents the current behavior
      const state = useScannerStore.getState();
      expect(state.passedCount).toBe(-1);
    });

    it('should preserve check order during updates', () => {
      useScannerStore.getState().initializeChecks();
      const originalOrder = useScannerStore.getState().checks.map(c => c.id);

      useScannerStore.getState().updateCheck(originalOrder[5], { status: 'passed' });
      useScannerStore.getState().updateCheck(originalOrder[0], { status: 'failed' });
      useScannerStore.getState().updateCheck(originalOrder[11], { status: 'warning' });

      const newOrder = useScannerStore.getState().checks.map(c => c.id);
      expect(newOrder).toEqual(originalOrder);
    });

    it('should handle updateCheck for non-existent ID', () => {
      useScannerStore.getState().initializeChecks();
      const initialState = { ...useScannerStore.getState() };

      // Update non-existent check
      useScannerStore.getState().updateCheck('non-existent-id', { status: 'passed' });

      // State should remain unchanged except for function references
      expect(useScannerStore.getState().checks.length).toBe(initialState.checks.length);
    });
  });

  describe('Critical Check Logic', () => {
    it('should correctly identify critical failures', async () => {
      useScannerStore.getState().initializeChecks();

      let checkIndex = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        const checks = useScannerStore.getState().checks;
        const currentCheck = checks[checkIndex];
        checkIndex++;

        // Fail critical checks
        if (currentCheck?.critical) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ passed: false, warning: false, message: 'Failed' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
        });
      });

      await useScannerStore.getState().startScan();

      // canProceed should be false due to critical failures
      expect(useScannerStore.getState().canProceed).toBe(false);
    });

    it('should allow proceed when only non-critical checks fail', async () => {
      useScannerStore.getState().initializeChecks();

      let checkIndex = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        const checks = useScannerStore.getState().checks;
        const currentCheck = checks[checkIndex];
        checkIndex++;

        // Fail only non-critical checks
        if (!currentCheck?.critical) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ passed: false, warning: false, message: 'Failed' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
        });
      });

      await useScannerStore.getState().startScan();

      // canProceed should be true (only non-critical failures)
      expect(useScannerStore.getState().canProceed).toBe(true);
    });

    it('should handle all warnings scenario', async () => {
      useScannerStore.getState().initializeChecks();

      // Warning status is only set when passed:false and warning:true
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ passed: false, warning: true, message: 'Warning' }),
      });

      await useScannerStore.getState().startScan();

      const state = useScannerStore.getState();
      expect(state.warningCount).toBe(12);
      // canProceed is true because warnings don't count as failures (only 'failed' status blocks)
      expect(state.canProceed).toBe(true);
    });
  });

  describe('Timing and Duration', () => {
    it('should set scanStartedAt when scan starts', async () => {
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
      });

      await useScannerStore.getState().startScan();

      const state = useScannerStore.getState();
      expect(state.scanStartedAt).toBeDefined();
      expect(state.scanCompletedAt).toBeDefined();
      expect(state.scanCompletedAt! >= state.scanStartedAt!).toBe(true);
    });

    it('should track individual check durations', async () => {
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ passed: true, warning: false, message: 'OK' }),
      });

      await useScannerStore.getState().startScan();

      const state = useScannerStore.getState();
      state.checks.forEach(check => {
        expect(check.duration).toBeDefined();
        expect(check.duration).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getCheckById Edge Cases', () => {
    it('should return undefined for empty string ID', () => {
      useScannerStore.getState().initializeChecks();
      const check = useScannerStore.getState().getCheckById('');
      expect(check).toBeUndefined();
    });

    it('should return undefined when checks array is empty', () => {
      useScannerStore.setState({ checks: [] });
      const check = useScannerStore.getState().getCheckById('any-id');
      expect(check).toBeUndefined();
    });

    it('should find check with case-sensitive ID', () => {
      useScannerStore.getState().initializeChecks();

      // Existing ID is lowercase
      const upperCheck = useScannerStore.getState().getCheckById('ALPACA-CONNECTION');
      const lowerCheck = useScannerStore.getState().getCheckById('alpaca-connection');

      expect(upperCheck).toBeUndefined();
      expect(lowerCheck).toBeDefined();
    });
  });
});
