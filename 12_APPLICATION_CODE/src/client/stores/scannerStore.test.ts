import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useScannerStore } from './scannerStore';

describe('scannerStore', () => {
  beforeEach(() => {
    useScannerStore.getState().resetScanner();
    vi.clearAllMocks();
  });

  describe('initializeChecks', () => {
    it('should initialize all 12 pre-ignition checks', () => {
      useScannerStore.getState().initializeChecks();

      const state = useScannerStore.getState();
      expect(state.checks).toHaveLength(12);
      expect(state.passedCount).toBe(0);
      expect(state.failedCount).toBe(0);
      expect(state.warningCount).toBe(0);
      expect(state.canProceed).toBe(false);
    });

    it('should set all checks to pending status', () => {
      useScannerStore.getState().initializeChecks();

      const state = useScannerStore.getState();
      state.checks.forEach((check) => {
        expect(check.status).toBe('pending');
      });
    });

    it('should include all required check categories', () => {
      useScannerStore.getState().initializeChecks();

      const state = useScannerStore.getState();
      const categories = new Set(state.checks.map((c) => c.category));

      expect(categories.has('connection')).toBe(true);
      expect(categories.has('auth')).toBe(true);
      expect(categories.has('market')).toBe(true);
      expect(categories.has('system')).toBe(true);
      expect(categories.has('config')).toBe(true);
    });

    it('should have critical checks properly marked', () => {
      useScannerStore.getState().initializeChecks();

      const state = useScannerStore.getState();
      const criticalChecks = state.checks.filter((c) => c.critical);

      // Expected critical checks: alpaca-connection, websocket-health, token-validity,
      // account-access, symbol-availability, backend-health, risk-parameters, strategy-config
      expect(criticalChecks.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe('updateCheck', () => {
    it('should update a specific check by id', () => {
      useScannerStore.getState().initializeChecks();
      useScannerStore.getState().updateCheck('alpaca-connection', {
        status: 'passed',
        message: 'Connection successful',
        duration: 150,
      });

      const check = useScannerStore.getState().getCheckById('alpaca-connection');
      expect(check?.status).toBe('passed');
      expect(check?.message).toBe('Connection successful');
      expect(check?.duration).toBe(150);
    });

    it('should not affect other checks when updating one', () => {
      useScannerStore.getState().initializeChecks();
      useScannerStore.getState().updateCheck('alpaca-connection', { status: 'passed' });

      const otherCheck = useScannerStore.getState().getCheckById('polygon-connection');
      expect(otherCheck?.status).toBe('pending');
    });
  });

  describe('getCheckById', () => {
    it('should return the correct check', () => {
      useScannerStore.getState().initializeChecks();

      const check = useScannerStore.getState().getCheckById('token-validity');
      expect(check).toBeDefined();
      expect(check?.name).toBe('Token Validity');
      expect(check?.critical).toBe(true);
    });

    it('should return undefined for non-existent check', () => {
      useScannerStore.getState().initializeChecks();

      const check = useScannerStore.getState().getCheckById('non-existent');
      expect(check).toBeUndefined();
    });
  });

  describe('resetScanner', () => {
    it('should reset all scanner state', () => {
      // Set up some state
      useScannerStore.getState().initializeChecks();
      useScannerStore.setState({
        isScanning: true,
        scanStartedAt: Date.now(),
        scanCompletedAt: Date.now(),
        passedCount: 5,
        failedCount: 2,
        warningCount: 1,
        canProceed: true,
      });

      useScannerStore.getState().resetScanner();

      const state = useScannerStore.getState();
      expect(state.checks).toHaveLength(0);
      expect(state.isScanning).toBe(false);
      expect(state.scanStartedAt).toBeNull();
      expect(state.scanCompletedAt).toBeNull();
      expect(state.passedCount).toBe(0);
      expect(state.failedCount).toBe(0);
      expect(state.warningCount).toBe(0);
      expect(state.canProceed).toBe(false);
    });
  });

  describe('startScan', () => {
    it('should set scanning state and timestamps', async () => {
      useScannerStore.getState().initializeChecks();

      // Mock all fetch calls to return passed
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ passed: true, message: 'OK' }),
      });

      const scanPromise = useScannerStore.getState().startScan();

      // Check immediate state change
      expect(useScannerStore.getState().isScanning).toBe(true);
      expect(useScannerStore.getState().scanStartedAt).not.toBeNull();

      await scanPromise;

      expect(useScannerStore.getState().isScanning).toBe(false);
      expect(useScannerStore.getState().scanCompletedAt).not.toBeNull();
    });

    it('should calculate passed/failed/warning counts', async () => {
      useScannerStore.getState().initializeChecks();

      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        // First 8 pass, next 2 fail, last 2 warn
        if (callCount <= 8) {
          return Promise.resolve({ json: () => Promise.resolve({ passed: true }) });
        } else if (callCount <= 10) {
          return Promise.resolve({ json: () => Promise.resolve({ passed: false }) });
        } else {
          return Promise.resolve({
            json: () => Promise.resolve({ passed: false, warning: true }),
          });
        }
      });

      await useScannerStore.getState().startScan();

      const state = useScannerStore.getState();
      expect(state.passedCount).toBe(8);
      expect(state.failedCount).toBe(2);
      expect(state.warningCount).toBe(2);
    });

    it('should set canProceed to false when critical checks fail', async () => {
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockImplementation((url: string) => {
        // Fail a critical check
        if (url.includes('alpaca-connection')) {
          return Promise.resolve({
            json: () => Promise.resolve({ passed: false, message: 'Connection failed' }),
          });
        }
        return Promise.resolve({
          json: () => Promise.resolve({ passed: true }),
        });
      });

      await useScannerStore.getState().startScan();

      expect(useScannerStore.getState().canProceed).toBe(false);
    });

    it('should set canProceed to true when all critical checks pass', async () => {
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ passed: true }),
      });

      await useScannerStore.getState().startScan();

      expect(useScannerStore.getState().canProceed).toBe(true);
    });

    it('should handle network errors gracefully', async () => {
      useScannerStore.getState().initializeChecks();

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await useScannerStore.getState().startScan();

      const state = useScannerStore.getState();
      expect(state.failedCount).toBe(12);
      expect(state.canProceed).toBe(false);

      // All checks should have error messages
      state.checks.forEach((check) => {
        expect(check.status).toBe('failed');
        expect(check.message).toBe('Network error');
      });
    });
  });

  describe('check definitions', () => {
    it('should have unique IDs for all checks', () => {
      useScannerStore.getState().initializeChecks();

      const ids = useScannerStore.getState().checks.map((c) => c.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have descriptive names and descriptions', () => {
      useScannerStore.getState().initializeChecks();

      useScannerStore.getState().checks.forEach((check) => {
        expect(check.name.length).toBeGreaterThan(3);
        expect(check.description.length).toBeGreaterThan(10);
      });
    });
  });
});
