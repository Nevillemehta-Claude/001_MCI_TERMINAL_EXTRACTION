import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import { authRoutes } from '../auth';

describe('Auth Routes', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route('/api/auth', authRoutes);
    vi.clearAllMocks();
  });

  describe('POST /api/auth/validate', () => {
    it('should return 400 when alpacaKey is missing', async () => {
      const res = await app.request('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alpacaSecret: 'secret' }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.valid).toBe(false);
      expect(data.message).toContain('Missing');
    });

    it('should return 400 when alpacaSecret is missing', async () => {
      const res = await app.request('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alpacaKey: 'key' }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.valid).toBe(false);
    });

    it('should validate credentials with Alpaca API', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'account-123',
            status: 'ACTIVE',
            currency: 'USD',
            trading_blocked: false,
            account_blocked: false,
          }),
      });

      const res = await app.request('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alpacaKey: 'valid-key',
          alpacaSecret: 'valid-secret',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.valid).toBe(true);
      expect(data.account.id).toBe('account-123');
      expect(data.account.status).toBe('ACTIVE');
    });

    it('should return 401 for invalid credentials', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Unauthorized' }),
      });

      const res = await app.request('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alpacaKey: 'invalid-key',
          alpacaSecret: 'invalid-secret',
        }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.valid).toBe(false);
    });

    it('should validate Polygon key when provided', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 'account-123',
              status: 'ACTIVE',
              currency: 'USD',
              trading_blocked: false,
              account_blocked: false,
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
        });

      const res = await app.request('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alpacaKey: 'valid-key',
          alpacaSecret: 'valid-secret',
          polygonKey: 'polygon-key',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.valid).toBe(true);
      expect(data.polygonValid).toBe(true);
    });

    it('should report invalid Polygon key', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 'account-123',
              status: 'ACTIVE',
              currency: 'USD',
              trading_blocked: false,
              account_blocked: false,
            }),
        })
        .mockResolvedValueOnce({
          ok: false,
        });

      const res = await app.request('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alpacaKey: 'valid-key',
          alpacaSecret: 'valid-secret',
          polygonKey: 'invalid-polygon-key',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.valid).toBe(true); // Alpaca is valid
      expect(data.polygonValid).toBe(false); // But Polygon is not
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const res = await app.request('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alpacaKey: 'key',
          alpacaSecret: 'secret',
        }),
      });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.valid).toBe(false);
      expect(data.message).toBe('Network error');
    });

    it('should call correct Alpaca API endpoint', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'account-123',
            status: 'ACTIVE',
            currency: 'USD',
            trading_blocked: false,
            account_blocked: false,
          }),
      });

      await app.request('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alpacaKey: 'test-key',
          alpacaSecret: 'test-secret',
        }),
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://paper-api.alpaca.markets/v2/account',
        expect.objectContaining({
          headers: {
            'APCA-API-KEY-ID': 'test-key',
            'APCA-API-SECRET-KEY': 'test-secret',
          },
        })
      );
    });
  });

  describe('GET /api/auth/session', () => {
    it('should return unauthenticated status', async () => {
      const res = await app.request('/api/auth/session');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.authenticated).toBe(false);
      expect(data.message).toContain('No active session');
    });
  });
});
