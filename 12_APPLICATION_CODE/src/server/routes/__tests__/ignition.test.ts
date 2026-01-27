import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import { ignitionRoutes, resetSystemState } from '../ignition';

describe('Ignition Routes', () => {
  let app: Hono;

  beforeEach(() => {
    // Reset system state before each test
    resetSystemState();
    app = new Hono();
    app.route('/api/ignition', ignitionRoutes);
    vi.clearAllMocks();
  });

  describe('POST /api/ignition/start', () => {
    describe('paper backend', () => {
      it('should start system in paper mode', async () => {
        const res = await app.request('/api/ignition/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backend: 'paper' }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.message).toContain('paper');
        expect(data.state.backend).toBe('paper');
        expect(data.state.isRunning).toBe(true);
      });

      it('should include timestamp in start response', async () => {
        const timestamp = Date.now();
        const res = await app.request('/api/ignition/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backend: 'paper', timestamp }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.state.startedAt).toBe(timestamp);
      });
    });

    describe('live backend', () => {
      it('should start system in live mode', async () => {
        const res = await app.request('/api/ignition/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backend: 'live' }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.message).toContain('live');
        expect(data.state.backend).toBe('live');
      });
    });

    describe('error handling', () => {
      it('should return 400 for missing backend', async () => {
        const res = await app.request('/api/ignition/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.message).toContain('Invalid backend');
      });

      it('should return 400 for invalid backend type', async () => {
        const res = await app.request('/api/ignition/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backend: 'demo' }),
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
      });

      it('should return 409 when system is already running', async () => {
        // Start first
        await app.request('/api/ignition/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backend: 'paper' }),
        });

        // Try to start again
        const res = await app.request('/api/ignition/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backend: 'paper' }),
        });

        expect(res.status).toBe(409);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.message).toContain('already running');
      });
    });
  });

  describe('POST /api/ignition/abort', () => {
    it('should abort running system', async () => {
      // Start first
      await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'paper' }),
      });

      // Then abort
      const res = await app.request('/api/ignition/abort', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('aborted');
      expect(data.previousState).toBeDefined();
      expect(data.previousState.isRunning).toBe(true);
    });

    it('should return success even when not running', async () => {
      const res = await app.request('/api/ignition/abort', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('not running');
    });

    it('should reset system state after abort', async () => {
      // Start
      await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'paper' }),
      });

      // Abort
      await app.request('/api/ignition/abort', {
        method: 'POST',
      });

      // Check status
      const statusRes = await app.request('/api/ignition/status');
      const statusData = await statusRes.json();

      expect(statusData.isRunning).toBe(false);
      expect(statusData.backend).toBeNull();
    });
  });

  describe('GET /api/ignition/status', () => {
    it('should return idle status initially', async () => {
      const res = await app.request('/api/ignition/status');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isRunning).toBe(false);
      expect(data.backend).toBeNull();
      expect(data.uptime).toBe(0);
    });

    it('should return running status after start', async () => {
      await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'paper' }),
      });

      const res = await app.request('/api/ignition/status');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isRunning).toBe(true);
      expect(data.backend).toBe('paper');
      // Uptime may be 0 if checked immediately after start
      expect(data.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should calculate uptime correctly', async () => {
      const timestamp = Date.now() - 1000; // 1 second ago
      await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'paper', timestamp }),
      });

      const res = await app.request('/api/ignition/status');
      const data = await res.json();

      expect(data.uptime).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('GET /api/ignition/backend/:type', () => {
    it('should return paper backend info', async () => {
      const res = await app.request('/api/ignition/backend/paper');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.type).toBe('paper');
      expect(data.available).toBe(true);
      expect(data.endpoint).toContain('paper-api');
    });

    it('should return live backend info', async () => {
      const res = await app.request('/api/ignition/backend/live');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.type).toBe('live');
      expect(data.available).toBe(true);
      expect(data.endpoint).toContain('api.alpaca');
    });

    it('should return 400 for invalid backend type', async () => {
      const res = await app.request('/api/ignition/backend/invalid');

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Invalid backend');
    });
  });

  describe('State transitions', () => {
    it('should allow start after abort', async () => {
      // Start
      await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'paper' }),
      });

      // Abort
      await app.request('/api/ignition/abort', {
        method: 'POST',
      });

      // Start again
      const res = await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'live' }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.state.backend).toBe('live');
    });

    it('should allow switching backends after abort', async () => {
      // Start paper
      await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'paper' }),
      });

      // Abort
      await app.request('/api/ignition/abort', {
        method: 'POST',
      });

      // Start live
      const res = await app.request('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'live' }),
      });

      const data = await res.json();
      expect(data.state.backend).toBe('live');
    });
  });
});
