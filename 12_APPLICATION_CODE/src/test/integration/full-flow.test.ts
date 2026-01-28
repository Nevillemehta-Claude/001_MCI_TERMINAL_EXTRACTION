/**
 * Full Flow Integration Tests
 * Tests complete MCI flow: Token → Scan → Ignite → Telemetry → Shutdown
 * CR-001, CR-002, CR-003, CR-004, CR-005 compliance
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

// Import all route modules
import { authRoutes } from '../../server/routes/auth';
import { scanRoutes } from '../../server/routes/scan';
import { ignitionRoutes, resetSystemState } from '../../server/routes/ignition';
import { telemetryRoutes } from '../../server/routes/telemetry';
import { shutdownRoutes } from '../../server/routes/shutdown';

describe('Full MCI Flow Integration', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route('/api/auth', authRoutes);
    app.route('/api/scan', scanRoutes);
    app.route('/api/ignition', ignitionRoutes);
    app.route('/api/telemetry', telemetryRoutes);
    app.route('/api/shutdown', shutdownRoutes);
    resetSystemState();
    vi.clearAllMocks();
  });

  describe('Phase 0: Token Capture', () => {
    it('should reject missing Kite credentials (INV-006)', async () => {
      const res = await app.request('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.valid).toBe(false);
      // INV-006: Now returns specific field error instead of generic message
      expect(data.message).toContain('required');
    });

    it('should validate credential format (CR-004, INV-006)', async () => {
      // INV-006: Credentials must be alphanumeric - underscores are rejected
      // This tests that sanitization is working correctly
      const res = await app.request('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kiteApiKey: 'testApiKey12345',  // Valid alphanumeric
          kiteAccessToken: 'Dl81D7apaLi3mpCCx0vrTa3gJeRRZ5GO',  // Valid alphanumeric
        }),
      });

      // Will get 401 (invalid credentials) or 500 (network error) in test env
      // but NOT 400 (format error) since credentials are valid format
      expect([200, 401, 500]).toContain(res.status);
    });
  });

  describe('Phase 1: Pre-Ignition Scanner', () => {
    it('should run 12-point scan via /all endpoint', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.results).toBeDefined();
      expect(data.summary.total).toBe(12);
    });

    it('should have kite-connection check (Indian broker only)', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
      });

      const data = await res.json();
      expect(data.results['kite-connection']).toBeDefined();
      // Verify no unsupported broker connections exist
      expect(data.results['unsupported-broker']).toBeUndefined();
    });

    it('should have nse-bse-data check', async () => {
      const res = await app.request('/api/scan/all', {
        method: 'POST',
      });

      const data = await res.json();
      expect(data.results['nse-bse-data']).toBeDefined();
    });
  });

  describe('Phase 2: Ignition', () => {
    it('should connect to Zerodha backend', async () => {
      const res = await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'zerodha' }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.state.backend).toBe('zerodha');
    });

    it('should support all 4 Indian brokers', async () => {
      const brokers = ['zerodha', 'icici', 'hdfc', 'kotak'];
      
      for (const broker of brokers) {
        resetSystemState();
        const res = await app.request('/api/ignition/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backend: broker }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.state.backend).toBe(broker);
      }
    });

    it('should reject unsupported backend', async () => {
      const res = await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'unsupported-broker' }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('Phase 3: Telemetry', () => {
    it('should return positions with Indian symbols', async () => {
      const res = await app.request('/api/telemetry/positions', {
        method: 'GET',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.positions).toBeDefined();
      
      // Verify Indian symbols
      const symbols = data.positions.map((p: any) => p.symbol);
      const indianSymbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN'];
      
      symbols.forEach((symbol: string) => {
        expect(indianSymbols).toContain(symbol);
      });
    });

    it('should return system health', async () => {
      const res = await app.request('/api/telemetry/health', {
        method: 'GET',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBeDefined();
    });
  });

  describe('Phase 4: Shutdown (CR-002)', () => {
    it('should execute full shutdown sequence', async () => {
      // First start the system
      await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'zerodha' }),
      });

      const res = await app.request('/api/shutdown/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emergency: false }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.results).toBeDefined();
    });

    it('should support emergency shutdown', async () => {
      // First start the system
      await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'zerodha' }),
      });

      const res = await app.request('/api/shutdown/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emergency: true }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('should execute individual shutdown steps', async () => {
      const res = await app.request('/api/shutdown/save-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Ignition Status', () => {
    it('should return status after ignition', async () => {
      await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'zerodha' }),
      });

      const res = await app.request('/api/ignition/status', {
        method: 'GET',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isRunning).toBe(true);
      expect(data.backend).toBe('zerodha');
    });
  });
});
