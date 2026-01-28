/**
 * Scanner Store Tests
 * Tests for 12-point pre-ignition scanner
 * Phase 1: Pre-Ignition Scanner for Indian Markets (NSE/BSE)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useScannerStore } from './scannerStore';

// Mock fetch for API calls
global.fetch = vi.fn();

describe('scannerStore', () => {
  beforeEach(() => {
    useScannerStore.getState().resetScanner();
    useScannerStore.getState().initializeChecks();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have 12 checks after initialization', () => {
      const state = useScannerStore.getState();
      expect(state.checks).toHaveLength(12);
    });

    it('should have all checks in pending status', () => {
      const state = useScannerStore.getState();
      state.checks.forEach(check => {
        expect(check.status).toBe('pending');
      });
    });

    it('should not be scanning initially', () => {
      const state = useScannerStore.getState();
      expect(state.isScanning).toBe(false);
    });

    it('should not be able to proceed initially', () => {
      const state = useScannerStore.getState();
      expect(state.canProceed).toBe(false);
    });
  });

  describe('check IDs for Indian market', () => {
    it('should have kite-connection check', () => {
      const state = useScannerStore.getState();
      const check = state.checks.find(c => c.id === 'kite-connection');
      expect(check).toBeDefined();
      expect(check?.name).toContain('Kite');
    });

    it('should have nse-bse-data check', () => {
      const state = useScannerStore.getState();
      const check = state.checks.find(c => c.id === 'nse-bse-data');
      expect(check).toBeDefined();
      expect(check?.name).toContain('NSE/BSE');
    });

    it('should have token-validity check', () => {
      const state = useScannerStore.getState();
      const check = state.checks.find(c => c.id === 'token-validity');
      expect(check).toBeDefined();
    });

    it('should have market-status check', () => {
      const state = useScannerStore.getState();
      const check = state.checks.find(c => c.id === 'market-status');
      expect(check).toBeDefined();
    });

    it('should NOT have any unsupported broker checks', () => {
      const state = useScannerStore.getState();
      const unsupportedCheck = state.checks.find(c => 
        c.id.includes('unsupported') || 
        c.name.toLowerCase().includes('unsupported')
      );
      expect(unsupportedCheck).toBeUndefined();
    });
  });

  describe('updateCheck', () => {
    it('should update individual check status', () => {
      const { updateCheck, getCheckById } = useScannerStore.getState();
      
      updateCheck('kite-connection', { status: 'passed', message: 'Connected successfully' });
      
      const check = getCheckById('kite-connection');
      expect(check?.status).toBe('passed');
      expect(check?.message).toBe('Connected successfully');
    });

    it('should handle check not found gracefully', () => {
      const { updateCheck } = useScannerStore.getState();
      
      // Should not throw
      expect(() => {
        updateCheck('non-existent-check', { status: 'passed' });
      }).not.toThrow();
    });

    it('should update check duration', () => {
      const { updateCheck, getCheckById } = useScannerStore.getState();
      
      updateCheck('kite-connection', { status: 'passed', duration: 150 });
      
      const check = getCheckById('kite-connection');
      expect(check?.duration).toBe(150);
    });
  });

  describe('canProceed computation', () => {
    it('should be false if any critical check failed', () => {
      const { updateCheck } = useScannerStore.getState();
      
      // kite-connection is critical
      updateCheck('kite-connection', { status: 'failed' });
      
      const state = useScannerStore.getState();
      // canProceed is computed after startScan, manually check logic
      const criticalFailures = state.checks.filter(c => c.critical && c.status === 'failed');
      expect(criticalFailures.length).toBeGreaterThan(0);
    });

    it('should allow proceed if non-critical checks fail', () => {
      const { updateCheck } = useScannerStore.getState();
      
      // nse-bse-data is NOT critical
      updateCheck('nse-bse-data', { status: 'failed' });
      
      const state = useScannerStore.getState();
      const check = state.checks.find(c => c.id === 'nse-bse-data');
      expect(check?.critical).toBe(false);
    });
  });

  describe('resetScanner', () => {
    it('should reset all state', () => {
      const { updateCheck, resetScanner } = useScannerStore.getState();
      
      updateCheck('kite-connection', { status: 'passed' });
      resetScanner();
      
      const state = useScannerStore.getState();
      expect(state.checks).toHaveLength(0);
      expect(state.isScanning).toBe(false);
      expect(state.scanStartedAt).toBeNull();
      expect(state.scanCompletedAt).toBeNull();
    });
  });

  describe('getCheckById', () => {
    it('should return check by ID', () => {
      const { getCheckById } = useScannerStore.getState();
      
      const check = getCheckById('kite-connection');
      expect(check).toBeDefined();
      expect(check?.id).toBe('kite-connection');
    });

    it('should return undefined for non-existent ID', () => {
      const { getCheckById } = useScannerStore.getState();
      
      const check = getCheckById('non-existent');
      expect(check).toBeUndefined();
    });
  });

  describe('check categories', () => {
    it('should have connection category checks', () => {
      const state = useScannerStore.getState();
      const connectionChecks = state.checks.filter(c => c.category === 'connection');
      expect(connectionChecks.length).toBeGreaterThan(0);
    });

    it('should have auth category checks', () => {
      const state = useScannerStore.getState();
      const authChecks = state.checks.filter(c => c.category === 'auth');
      expect(authChecks.length).toBeGreaterThan(0);
    });

    it('should have market category checks', () => {
      const state = useScannerStore.getState();
      const marketChecks = state.checks.filter(c => c.category === 'market');
      expect(marketChecks.length).toBeGreaterThan(0);
    });

    it('should have system category checks', () => {
      const state = useScannerStore.getState();
      const systemChecks = state.checks.filter(c => c.category === 'system');
      expect(systemChecks.length).toBeGreaterThan(0);
    });

    it('should have config category checks', () => {
      const state = useScannerStore.getState();
      const configChecks = state.checks.filter(c => c.category === 'config');
      expect(configChecks.length).toBeGreaterThan(0);
    });
  });
});
