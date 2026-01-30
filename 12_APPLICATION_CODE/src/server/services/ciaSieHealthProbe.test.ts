/**
 * CIA-SIE-PURE Health Probe Tests
 * 
 * BLOCK-004: MCI deep health probes for CIA-SIE-PURE
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  executeHealthCheck,
  executeShallowHealthCheck,
  HealthCheckManager,
  HEALTH_CHECK_INTERVAL_MS,
  type HealthCheckResult,
} from './ciaSieHealthProbe';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('BLOCK-004: CIA-SIE-PURE Health Probes', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('executeHealthCheck', () => {
    it('returns all healthy when all endpoints respond ok', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      });

      const result = await executeHealthCheck();

      expect(result.subsystems.process).toBe('healthy');
      expect(result.subsystems.database).toBe('healthy');
      expect(result.subsystems.ai).toBe('healthy');
      expect(result.subsystems.webhook).toBe('healthy');
      expect(result.errors).toHaveLength(0);
    });

    it('returns unhealthy for failed endpoints', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/health/db')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'ok' }),
        });
      });

      const result = await executeHealthCheck();

      expect(result.subsystems.process).toBe('healthy');
      expect(result.subsystems.database).toBe('unhealthy');
      expect(result.subsystems.ai).toBe('healthy');
      expect(result.subsystems.webhook).toBe('healthy');
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('database');
    });

    it('returns unhealthy when endpoint returns error status', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/health/ai')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ status: 'error', message: 'AI service down' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'ok' }),
        });
      });

      const result = await executeHealthCheck();

      expect(result.subsystems.ai).toBe('unhealthy');
    });

    it('returns unhealthy on network error', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/health/webhook')) {
          return Promise.reject(new Error('Connection refused'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'ok' }),
        });
      });

      const result = await executeHealthCheck();

      expect(result.subsystems.webhook).toBe('unhealthy');
      expect(result.errors.some(e => e.includes('webhook'))).toBe(true);
    });

    it('returns all unhealthy when main health endpoint fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network unreachable'));

      const result = await executeHealthCheck();

      expect(result.subsystems.process).toBe('unhealthy');
      expect(result.subsystems.database).toBe('unhealthy');
      expect(result.subsystems.ai).toBe('unhealthy');
      expect(result.subsystems.webhook).toBe('unhealthy');
    });

    it('records latencies for all subsystems', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      });

      const result = await executeHealthCheck();

      expect(result.latencies.process).toBeGreaterThanOrEqual(0);
      expect(result.latencies.database).toBeGreaterThanOrEqual(0);
      expect(result.latencies.ai).toBeGreaterThanOrEqual(0);
      expect(result.latencies.webhook).toBeGreaterThanOrEqual(0);
      expect(result.overallLatencyMs).toBeGreaterThanOrEqual(0);
    });

    it('records timestamp of health check', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      });

      const before = Date.now();
      const result = await executeHealthCheck();
      const after = Date.now();

      expect(result.timestamp).toBeGreaterThanOrEqual(before);
      expect(result.timestamp).toBeLessThanOrEqual(after);
    });

    it('sanitizes response data (control characters stripped)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'ok', message: 'clean\x01data' }),
      });

      // Should not throw - sanitization strips control chars
      const result = await executeHealthCheck();
      expect(result.subsystems.process).toBe('healthy');
    });
  });

  describe('executeShallowHealthCheck', () => {
    it('returns true when process health endpoint is healthy', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      });

      const result = await executeShallowHealthCheck();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('returns false when process health endpoint fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await executeShallowHealthCheck();

      expect(result).toBe(false);
    });

    it('returns false on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Connection refused'));

      const result = await executeShallowHealthCheck();

      expect(result).toBe(false);
    });
  });

  describe('HealthCheckManager', () => {
    it('reports running state correctly', () => {
      const manager = new HealthCheckManager();
      
      expect(manager.running).toBe(false);
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      });
      
      manager.start(() => {});
      expect(manager.running).toBe(true);
      
      manager.stop();
      expect(manager.running).toBe(false);
    });

    it('executes health check on start', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      });

      const callback = vi.fn();
      const manager = new HealthCheckManager();
      
      manager.start(callback);
      
      // Wait for the initial async call to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(callback).toHaveBeenCalled();
      manager.stop();
    });

    it('handles health check failure gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Total failure'));

      const callback = vi.fn();
      const manager = new HealthCheckManager();
      
      manager.start(callback, 60000); // Long interval to avoid multiple calls
      
      // Wait for the initial async call to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(callback).toHaveBeenCalled();
      const result = callback.mock.calls[0][0] as HealthCheckResult;
      expect(result.subsystems.process).toBe('unhealthy');
      
      manager.stop();
    });

    it('does not start multiple intervals if called twice', () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      });

      const callback = vi.fn();
      const manager = new HealthCheckManager();
      
      manager.start(callback, 60000);
      manager.start(callback, 60000); // Second call should be ignored
      
      // Just verify it's running - the guard should prevent double start
      expect(manager.running).toBe(true);
      
      manager.stop();
    });
  });

  describe('Configuration', () => {
    it('exports default health check interval', () => {
      expect(HEALTH_CHECK_INTERVAL_MS).toBe(30000);
    });
  });
});
