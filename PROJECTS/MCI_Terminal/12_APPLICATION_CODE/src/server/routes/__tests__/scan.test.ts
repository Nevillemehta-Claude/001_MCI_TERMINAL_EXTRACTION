/**
 * Scan Routes Tests
 * Tests for 12-point pre-ignition scanner
 * Phase 1: Pre-Ignition checks for Indian markets (NSE/BSE)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { scanRoutes } from '../scan';

describe('scan routes', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route('/api/scan', scanRoutes);
    vi.clearAllMocks();
  });

  describe('POST /api/scan/all', () => {
    it('should return 12 check results', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Object.keys(data.results)).toHaveLength(12);
    });

    it('should include kite-connection check', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      expect(data.results['kite-connection']).toBeDefined();
      expect(data.results['kite-connection'].passed).toBe(true);
      expect(data.results['kite-connection'].message).toContain('Kite Connect');
    });

    it('should include nse-bse-data check', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      expect(data.results['nse-bse-data']).toBeDefined();
      expect(data.results['nse-bse-data'].message).toMatch(/NSE\/BSE/);
    });

    it('should include token-validity check', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      expect(data.results['token-validity']).toBeDefined();
      expect(data.results['token-validity'].passed).toBe(true);
      expect(data.results['token-validity'].message).toContain('Kite tokens');
    });

    it('should return summary with pass/fail counts', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      expect(data.summary).toBeDefined();
      expect(data.summary.total).toBe(12);
      expect(typeof data.summary.passed).toBe('number');
      expect(typeof data.summary.warnings).toBe('number');
      expect(typeof data.summary.failed).toBe('number');
      expect(typeof data.summary.canProceed).toBe('boolean');
    });

    it('should include all 12 expected checks', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      const expectedChecks = [
        'kite-connection',
        'nse-bse-data',
        'websocket-health',
        'token-validity',
        'account-access',
        'market-status',
        'data-feed',
        'symbol-availability',
        'backend-health',
        'memory-resources',
        'risk-parameters',
        'strategy-config',
      ];

      expectedChecks.forEach((checkId) => {
        expect(data.results[checkId]).toBeDefined();
      });
    });

    it('should return passed/warning/message for each check', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      Object.values(data.results).forEach((result: unknown) => {
        const r = result as { passed: boolean; warning: boolean; message: string };
        expect(typeof r.passed).toBe('boolean');
        expect(typeof r.warning).toBe('boolean');
        expect(typeof r.message).toBe('string');
      });
    });

    it('should calculate canProceed correctly when no failures', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      // If there are no failures, canProceed should be true
      if (data.summary.failed === 0) {
        expect(data.summary.canProceed).toBe(true);
      } else {
        expect(data.summary.canProceed).toBe(false);
      }
    });
  });

  describe('POST /api/scan/:checkId - Individual checks', () => {
    it('should return single check result for kite-connection', async () => {
      const res = await app.request('/api/scan/kite-connection', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.passed).toBe(true);
      expect(data.warning).toBe(false);
      expect(data.message).toContain('Kite Connect');
    });

    it('should return single check result for websocket-health', async () => {
      const res = await app.request('/api/scan/websocket-health', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.passed).toBe(true);
      expect(data.message).toContain('WebSocket');
    });

    it('should return single check result for token-validity', async () => {
      const res = await app.request('/api/scan/token-validity', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.passed).toBe(true);
      expect(data.message).toContain('Kite tokens');
    });

    it('should return single check result for market-status', async () => {
      const res = await app.request('/api/scan/market-status', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.passed).toBe(true);
      expect(data.message).toMatch(/NSE\/BSE/);
    });

    it('should return single check result for backend-health', async () => {
      const res = await app.request('/api/scan/backend-health', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.passed).toBe(true);
      expect(data.message).toContain('CIA-SIE-PURE');
    });

    it('should return single check result for memory-resources', async () => {
      const res = await app.request('/api/scan/memory-resources', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.passed).toBe(true);
      expect(data.message).toContain('Memory');
    });

    it('should return failure for unknown check ID', async () => {
      const res = await app.request('/api/scan/invalid-check', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.passed).toBe(false);
      expect(data.message).toBe('Unknown check');
    });
  });

  describe('Indian market compliance', () => {
    it('should only have Indian broker connection checks (Kite Connect)', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      
      // Verify Kite (Indian broker) connection check exists
      expect(data.results['kite-connection']).toBeDefined();
      expect(data.results['kite-connection'].message).toContain('Kite Connect');
    });

    it('should only have Indian market data checks (NSE/BSE)', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      
      // Verify NSE/BSE data check exists
      expect(data.results['nse-bse-data']).toBeDefined();
      expect(data.results['nse-bse-data'].message).toMatch(/NSE\/BSE/);
      
      // Verify data-feed references NSE/BSE
      expect(data.results['data-feed']).toBeDefined();
      expect(data.results['data-feed'].message).toMatch(/NSE\/BSE/);
    });

    it('should have market-status check for Indian market hours', async () => {
      const res = await app.request('/api/scan/market-status', {
        method: 'POST',
      });

      const data = await res.json();
      expect(data.passed).toBe(true);
      expect(data.message).toMatch(/NSE\/BSE/);
    });

    it('should have symbol-availability check for NSE/BSE symbols', async () => {
      const res = await app.request('/api/scan/symbol-availability', {
        method: 'POST',
      });

      const data = await res.json();
      expect(data.passed).toBe(true);
      expect(data.message).toMatch(/NSE\/BSE/);
    });
  });
});
