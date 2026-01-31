/**
 * Ignition Routes Tests
 * Tests for Phase 2 ignition sequence
 * Supports 4 Indian brokers: Zerodha, ICICI, HDFC, Kotak
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { ignitionRoutes, resetSystemState } from '../ignition';

// Mock the sentry module
vi.mock('../../lib/sentry', () => ({
  captureTradeOperationError: vi.fn(),
  logBackendBreadcrumb: vi.fn(),
  Sentry: {
    startSpan: vi.fn((_, fn) => fn()),
    setTag: vi.fn(),
  },
}));

describe('ignition routes', () => {
  let app: Hono;

  beforeEach(() => {
    // Reset system state before each test to avoid test pollution
    resetSystemState();
    app = new Hono();
    app.route('/api/ignition', ignitionRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/ignition/start', () => {
    it('should accept zerodha backend', async () => {
      const res = await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'zerodha' }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.state.backend).toBe('zerodha');
      expect(data.state.isRunning).toBe(true);
      expect(data.message).toContain('zerodha');
    });

    it('should accept icici backend', async () => {
      const res = await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'icici' }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.state.backend).toBe('icici');
    });

    it('should accept hdfc backend', async () => {
      const res = await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'hdfc' }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.state.backend).toBe('hdfc');
    });

    it('should accept kotak backend', async () => {
      const res = await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'kotak' }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.state.backend).toBe('kotak');
    });

    it('should return state with startedAt timestamp on success', async () => {
      const beforeTime = Date.now();
      
      const res = await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'zerodha' }),
      });

      const data = await res.json();
      expect(data.state.startedAt).toBeDefined();
      expect(typeof data.state.startedAt).toBe('number');
      expect(data.state.startedAt).toBeGreaterThanOrEqual(beforeTime);
    });

    it('should accept optional timestamp in request', async () => {
      const customTimestamp = 1700000000000;
      
      const res = await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'zerodha', timestamp: customTimestamp }),
      });

      const data = await res.json();
      expect(data.state.startedAt).toBe(customTimestamp);
    });

    it('should reject invalid backend', async () => {
      const res = await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'invalid' }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain('Invalid backend type');
      expect(data.message).toContain('icici');
      expect(data.message).toContain('hdfc');
      expect(data.message).toContain('kotak');
      expect(data.message).toContain('zerodha');
    });

    it('should reject missing backend', async () => {
      const res = await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('should return 409 if system is already running', async () => {
      // First start
      await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'zerodha' }),
      });

      // Second start should conflict
      const res = await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'icici' }),
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('System is already running');
    });
  });

  describe('GET /api/ignition/status', () => {
    it('should return current ignition status when not running', async () => {
      const res = await app.request('/api/ignition/status', {
        method: 'GET',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isRunning).toBe(false);
      expect(data.backend).toBeNull();
      expect(data.startedAt).toBeNull();
      expect(data.uptime).toBe(0);
    });

    it('should include backend and uptime when running', async () => {
      // First start ignition
      await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'zerodha' }),
      });

      const res = await app.request('/api/ignition/status', {
        method: 'GET',
      });

      const data = await res.json();
      expect(data.isRunning).toBe(true);
      expect(data.backend).toBe('zerodha');
      expect(data.startedAt).toBeDefined();
      expect(typeof data.uptime).toBe('number');
    });
  });

  describe('POST /api/ignition/abort', () => {
    it('should abort running ignition', async () => {
      // First start ignition
      await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'zerodha' }),
      });

      const res = await app.request('/api/ignition/abort', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('System aborted successfully');
      expect(data.previousState).toBeDefined();
      expect(data.previousState.backend).toBe('zerodha');
    });

    it('should return success even if not running', async () => {
      const res = await app.request('/api/ignition/abort', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('System was not running');
    });

    it('should reset system state after abort', async () => {
      // Start ignition
      await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'hdfc' }),
      });

      // Abort
      await app.request('/api/ignition/abort', {
        method: 'POST',
      });

      // Check status
      const res = await app.request('/api/ignition/status', {
        method: 'GET',
      });

      const data = await res.json();
      expect(data.isRunning).toBe(false);
      expect(data.backend).toBeNull();
    });
  });

  describe('GET /api/ignition/backend/:type', () => {
    it('should return info for zerodha backend', async () => {
      const res = await app.request('/api/ignition/backend/zerodha', {
        method: 'GET',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.type).toBe('zerodha');
      expect(data.endpoint).toBe('https://api.kite.trade');
      expect(data.available).toBe(true);
    });

    it('should return info for icici backend', async () => {
      const res = await app.request('/api/ignition/backend/icici', {
        method: 'GET',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.type).toBe('icici');
      expect(data.endpoint).toBe('https://api.icicidirect.com/apiuser');
      expect(data.available).toBe(true);
    });

    it('should return info for hdfc backend', async () => {
      const res = await app.request('/api/ignition/backend/hdfc', {
        method: 'GET',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.type).toBe('hdfc');
      expect(data.endpoint).toBe('https://api.hdfcsec.com/openapi');
      expect(data.available).toBe(true);
    });

    it('should return info for kotak backend', async () => {
      const res = await app.request('/api/ignition/backend/kotak', {
        method: 'GET',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.type).toBe('kotak');
      expect(data.endpoint).toBe('https://tradeapi.kotaksecurities.com/apim');
      expect(data.available).toBe(true);
    });

    it('should return 400 for invalid backend type', async () => {
      const res = await app.request('/api/ignition/backend/invalid', {
        method: 'GET',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Invalid backend type');
    });
  });
});
