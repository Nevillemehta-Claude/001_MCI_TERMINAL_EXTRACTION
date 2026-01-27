import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import { scanRoutes } from '../scan';

describe('Scan Routes', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route('/api/scan', scanRoutes);
    vi.clearAllMocks();
  });

  describe('POST /api/scan/:checkId - Individual checks', () => {
    const checkIds = [
      'alpaca-connection',
      'polygon-connection',
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

    describe('alpaca-connection check', () => {
      it('should return passed status for alpaca-connection', async () => {
        const res = await app.request('/api/scan/alpaca-connection', {
          method: 'POST',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.passed).toBe(true);
        expect(data.warning).toBe(false);
        expect(data.message).toContain('Alpaca');
      });
    });

    describe('polygon-connection check', () => {
      it('should return a result for polygon-connection', async () => {
        const res = await app.request('/api/scan/polygon-connection', {
          method: 'POST',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(typeof data.passed).toBe('boolean');
        expect(typeof data.warning).toBe('boolean');
        expect(data.message).toContain('Polygon');
      });
    });

    describe('websocket-health check', () => {
      it('should return passed status for websocket-health', async () => {
        const res = await app.request('/api/scan/websocket-health', {
          method: 'POST',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.passed).toBe(true);
        expect(data.message).toContain('WebSocket');
      });
    });

    describe('token-validity check', () => {
      it('should return passed status for token-validity', async () => {
        const res = await app.request('/api/scan/token-validity', {
          method: 'POST',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.passed).toBe(true);
        expect(data.message).toContain('valid');
      });
    });

    describe('account-access check', () => {
      it('should return passed status for account-access', async () => {
        const res = await app.request('/api/scan/account-access', {
          method: 'POST',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.passed).toBe(true);
        expect(data.message).toContain('Account');
      });
    });

    describe('market-status check', () => {
      it('should return market status based on current time', async () => {
        const res = await app.request('/api/scan/market-status', {
          method: 'POST',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.passed).toBe(true);
        expect(typeof data.warning).toBe('boolean');
        expect(data.message).toContain('Market');
      });
    });

    describe('data-feed check', () => {
      it('should return passed status for data-feed', async () => {
        const res = await app.request('/api/scan/data-feed', {
          method: 'POST',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.passed).toBe(true);
        expect(data.message).toContain('Data feed');
      });
    });

    describe('symbol-availability check', () => {
      it('should return passed status for symbol-availability', async () => {
        const res = await app.request('/api/scan/symbol-availability', {
          method: 'POST',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.passed).toBe(true);
        expect(data.message).toContain('symbol');
      });
    });

    describe('backend-health check', () => {
      it('should return passed status for backend-health', async () => {
        const res = await app.request('/api/scan/backend-health', {
          method: 'POST',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.passed).toBe(true);
        expect(data.message).toContain('backend');
      });
    });

    describe('memory-resources check', () => {
      it('should return memory status with usage info', async () => {
        const res = await app.request('/api/scan/memory-resources', {
          method: 'POST',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.passed).toBe(true);
        expect(data.message).toContain('Memory');
        expect(data.message).toMatch(/\d+MB/);
      });
    });

    describe('risk-parameters check', () => {
      it('should return passed status for risk-parameters', async () => {
        const res = await app.request('/api/scan/risk-parameters', {
          method: 'POST',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.passed).toBe(true);
        expect(data.message).toContain('Risk');
      });
    });

    describe('strategy-config check', () => {
      it('should return passed status for strategy-config', async () => {
        const res = await app.request('/api/scan/strategy-config', {
          method: 'POST',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.passed).toBe(true);
        expect(data.message).toContain('Strategy');
      });
    });

    describe('unknown check', () => {
      it('should return failed for unknown check ID', async () => {
        const res = await app.request('/api/scan/unknown-check', {
          method: 'POST',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.passed).toBe(false);
        expect(data.message).toContain('Unknown');
      });
    });

    it('should execute all defined checks without error', async () => {
      for (const checkId of checkIds) {
        const res = await app.request(`/api/scan/${checkId}`, {
          method: 'POST',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(typeof data.passed).toBe('boolean');
        expect(typeof data.warning).toBe('boolean');
        expect(typeof data.message).toBe('string');
      }
    });
  });

  describe('POST /api/scan/all - Batch scan', () => {
    it('should execute all 12 checks', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary.total).toBe(12);
      expect(data.results).toBeDefined();
      expect(Object.keys(data.results).length).toBe(12);
    });

    it('should return summary with counts', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(typeof data.summary.passed).toBe('number');
      expect(typeof data.summary.warnings).toBe('number');
      expect(typeof data.summary.failed).toBe('number');
      expect(data.summary.passed + data.summary.warnings + data.summary.failed).toBeLessThanOrEqual(12);
    });

    it('should include canProceed flag in summary', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(typeof data.summary.canProceed).toBe('boolean');
    });

    it('should have canProceed true when no failures', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      // Most checks should pass in normal conditions
      if (data.summary.failed === 0) {
        expect(data.summary.canProceed).toBe(true);
      }
    });

    it('should include all expected check IDs in results', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      const expectedChecks = [
        'alpaca-connection',
        'polygon-connection',
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

      for (const checkId of expectedChecks) {
        expect(data.results[checkId]).toBeDefined();
      }
    });

    it('should have proper structure for each check result', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      for (const result of Object.values(data.results) as Array<{ passed: boolean; warning: boolean; message: string }>) {
        expect(typeof result.passed).toBe('boolean');
        expect(typeof result.warning).toBe('boolean');
        expect(typeof result.message).toBe('string');
      }
    });
  });
});
