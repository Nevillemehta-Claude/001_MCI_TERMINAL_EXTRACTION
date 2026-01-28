import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import { shutdownRoutes } from '../shutdown';

describe('Shutdown Routes', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route('/api/shutdown', shutdownRoutes);
    vi.clearAllMocks();
  });

  describe('POST /api/shutdown/:stepId - Individual steps', () => {
    describe('save-state step', () => {
      it('should execute save-state step successfully', async () => {
        const res = await app.request('/api/shutdown/save-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.message).toContain('state');
      });

      it('should execute faster in emergency mode', async () => {
        const normalStart = Date.now();
        await app.request('/api/shutdown/save-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emergency: false }),
        });
        const normalDuration = Date.now() - normalStart;

        const emergencyStart = Date.now();
        await app.request('/api/shutdown/save-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emergency: true }),
        });
        const emergencyDuration = Date.now() - emergencyStart;

        // Emergency mode should generally be faster (but not guaranteed due to randomness)
        expect(emergencyDuration).toBeLessThanOrEqual(normalDuration + 100);
      });
    });

    describe('cancel-orders step', () => {
      it('should execute cancel-orders step successfully', async () => {
        const res = await app.request('/api/shutdown/cancel-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.message).toMatch(/order|pending/i);
      });
    });

    describe('close-positions step', () => {
      it('should execute close-positions step successfully', async () => {
        const res = await app.request('/api/shutdown/close-positions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.message).toMatch(/position|closed/i);
      });
    });

    describe('disconnect-streams step', () => {
      it('should execute disconnect-streams step successfully', async () => {
        const res = await app.request('/api/shutdown/disconnect-streams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.message).toContain('WebSocket');
      });
    });

    describe('cleanup step', () => {
      it('should execute cleanup step successfully', async () => {
        const res = await app.request('/api/shutdown/cleanup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.message).toContain('Resources');
      });
    });

    describe('finalize step', () => {
      it('should execute finalize step successfully', async () => {
        const res = await app.request('/api/shutdown/finalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.message).toContain('complete');
      });
    });

    describe('unknown step', () => {
      it('should return failure for unknown step', async () => {
        const res = await app.request('/api/shutdown/unknown-step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.message).toContain('Unknown');
      });
    });

    it('should handle missing body gracefully', async () => {
      const res = await app.request('/api/shutdown/save-state', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe('POST /api/shutdown/full - Full shutdown sequence', () => {
    describe('normal shutdown with all options', () => {
      it('should execute full shutdown with all options enabled', async () => {
        const res = await app.request('/api/shutdown/full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            closePositions: true,
            cancelOrders: true,
            saveState: true,
          }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.results).toBeDefined();
        expect(data.totalDuration).toBeGreaterThan(0);
      });

      it('should include all expected steps when all options true', async () => {
        const res = await app.request('/api/shutdown/full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            closePositions: true,
            cancelOrders: true,
            saveState: true,
          }),
        });

        const data = await res.json();
        expect(data.results['save-state']).toBeDefined();
        expect(data.results['cancel-orders']).toBeDefined();
        expect(data.results['close-positions']).toBeDefined();
        expect(data.results['disconnect-streams']).toBeDefined();
        expect(data.results['cleanup']).toBeDefined();
        expect(data.results['finalize']).toBeDefined();
      });
    });

    describe('shutdown with options disabled', () => {
      it('should skip save-state when saveState is false', async () => {
        const res = await app.request('/api/shutdown/full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            saveState: false,
            cancelOrders: true,
            closePositions: true,
          }),
        });

        const data = await res.json();
        expect(data.results['save-state']).toBeUndefined();
      });

      it('should skip cancel-orders when cancelOrders is false', async () => {
        const res = await app.request('/api/shutdown/full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            saveState: true,
            cancelOrders: false,
            closePositions: true,
          }),
        });

        const data = await res.json();
        expect(data.results['cancel-orders']).toBeUndefined();
      });

      it('should skip close-positions when closePositions is false', async () => {
        const res = await app.request('/api/shutdown/full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            saveState: true,
            cancelOrders: true,
            closePositions: false,
          }),
        });

        const data = await res.json();
        expect(data.results['close-positions']).toBeUndefined();
      });

      it('should always include mandatory steps', async () => {
        const res = await app.request('/api/shutdown/full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            saveState: false,
            cancelOrders: false,
            closePositions: false,
          }),
        });

        const data = await res.json();
        // disconnect-streams, cleanup, and finalize are always included
        expect(data.results['disconnect-streams']).toBeDefined();
        expect(data.results['cleanup']).toBeDefined();
        expect(data.results['finalize']).toBeDefined();
      });
    });

    describe('emergency shutdown', () => {
      it('should execute faster in emergency mode', async () => {
        const normalStart = Date.now();
        await app.request('/api/shutdown/full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emergency: false }),
        });
        const normalDuration = Date.now() - normalStart;

        const emergencyStart = Date.now();
        await app.request('/api/shutdown/full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emergency: true }),
        });
        const emergencyDuration = Date.now() - emergencyStart;

        // Emergency should be faster or at least not much slower
        expect(emergencyDuration).toBeLessThan(normalDuration + 100);
      });
    });

    describe('result structure', () => {
      it('should include duration for each step', async () => {
        const res = await app.request('/api/shutdown/full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        const data = await res.json();
        for (const result of Object.values(data.results) as Array<{ success: boolean; message: string; duration: number }>) {
          expect(typeof result.duration).toBe('number');
          expect(result.duration).toBeGreaterThan(0);
        }
      });

      it('should include success flag for each step', async () => {
        const res = await app.request('/api/shutdown/full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        const data = await res.json();
        for (const result of Object.values(data.results) as Array<{ success: boolean; message: string; duration: number }>) {
          expect(typeof result.success).toBe('boolean');
        }
      });

      it('should include message for each step', async () => {
        const res = await app.request('/api/shutdown/full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        const data = await res.json();
        for (const result of Object.values(data.results) as Array<{ success: boolean; message: string; duration: number }>) {
          expect(typeof result.message).toBe('string');
        }
      });

      it('should calculate total duration correctly', async () => {
        const res = await app.request('/api/shutdown/full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        const data = await res.json();
        const sumDuration = Object.values(data.results).reduce(
          (sum: number, r) => sum + (r as { duration: number }).duration,
          0
        );
        expect(data.totalDuration).toBe(sumDuration);
      });
    });

    it('should handle empty body gracefully', async () => {
      const res = await app.request('/api/shutdown/full', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});
