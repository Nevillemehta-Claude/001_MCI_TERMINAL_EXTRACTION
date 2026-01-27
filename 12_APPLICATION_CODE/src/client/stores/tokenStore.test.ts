import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTokenStore } from './tokenStore';

describe('tokenStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTokenStore.setState({
      alpacaKey: '',
      alpacaSecret: '',
      polygonKey: '',
      tokenCapturedAt: null,
      tokenExpiresAt: null,
      isTokenValid: false,
      isCapturing: false,
      captureError: null,
    });
    vi.clearAllMocks();
  });

  describe('setAlpacaCredentials', () => {
    it('should store alpaca credentials and set timestamps', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      useTokenStore.getState().setAlpacaCredentials('test-key', 'test-secret');

      const state = useTokenStore.getState();
      expect(state.alpacaKey).toBe('test-key');
      expect(state.alpacaSecret).toBe('test-secret');
      expect(state.tokenCapturedAt).toBe(now);
      expect(state.tokenExpiresAt).toBe(now + 24 * 60 * 60 * 1000); // 24 hours
      expect(state.captureError).toBeNull();
    });

    it('should clear any existing capture error', () => {
      useTokenStore.setState({ captureError: 'Previous error' });
      useTokenStore.getState().setAlpacaCredentials('key', 'secret');

      expect(useTokenStore.getState().captureError).toBeNull();
    });
  });

  describe('setPolygonKey', () => {
    it('should store polygon key', () => {
      useTokenStore.getState().setPolygonKey('polygon-api-key');

      expect(useTokenStore.getState().polygonKey).toBe('polygon-api-key');
    });
  });

  describe('clearTokens', () => {
    it('should reset all token-related state', () => {
      // Set up some state
      useTokenStore.setState({
        alpacaKey: 'key',
        alpacaSecret: 'secret',
        polygonKey: 'polygon',
        tokenCapturedAt: Date.now(),
        tokenExpiresAt: Date.now() + 1000,
        isTokenValid: true,
        captureError: 'some error',
      });

      useTokenStore.getState().clearTokens();

      const state = useTokenStore.getState();
      expect(state.alpacaKey).toBe('');
      expect(state.alpacaSecret).toBe('');
      expect(state.polygonKey).toBe('');
      expect(state.tokenCapturedAt).toBeNull();
      expect(state.tokenExpiresAt).toBeNull();
      expect(state.isTokenValid).toBe(false);
      expect(state.captureError).toBeNull();
    });
  });

  describe('setCapturing', () => {
    it('should set isCapturing flag', () => {
      useTokenStore.getState().setCapturing(true);
      expect(useTokenStore.getState().isCapturing).toBe(true);

      useTokenStore.getState().setCapturing(false);
      expect(useTokenStore.getState().isCapturing).toBe(false);
    });
  });

  describe('setCaptureError', () => {
    it('should set capture error message', () => {
      useTokenStore.getState().setCaptureError('Validation failed');
      expect(useTokenStore.getState().captureError).toBe('Validation failed');
    });

    it('should clear error when null is passed', () => {
      useTokenStore.setState({ captureError: 'Previous error' });
      useTokenStore.getState().setCaptureError(null);
      expect(useTokenStore.getState().captureError).toBeNull();
    });
  });

  describe('getTokenAge', () => {
    it('should return null when no token captured', () => {
      expect(useTokenStore.getState().getTokenAge()).toBeNull();
    });

    it('should return age in milliseconds', () => {
      const capturedAt = Date.now() - 5000; // 5 seconds ago
      useTokenStore.setState({ tokenCapturedAt: capturedAt });

      const age = useTokenStore.getState().getTokenAge();
      expect(age).toBeGreaterThanOrEqual(5000);
      expect(age).toBeLessThan(6000);
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when no expiration set', () => {
      expect(useTokenStore.getState().isTokenExpired()).toBe(true);
    });

    it('should return true when token is expired', () => {
      useTokenStore.setState({ tokenExpiresAt: Date.now() - 1000 });
      expect(useTokenStore.getState().isTokenExpired()).toBe(true);
    });

    it('should return false when token is still valid', () => {
      useTokenStore.setState({ tokenExpiresAt: Date.now() + 1000000 });
      expect(useTokenStore.getState().isTokenExpired()).toBe(false);
    });
  });

  describe('validateTokens', () => {
    it('should return false when credentials are missing', async () => {
      const result = await useTokenStore.getState().validateTokens();

      expect(result).toBe(false);
      expect(useTokenStore.getState().isTokenValid).toBe(false);
      expect(useTokenStore.getState().isCapturing).toBe(false);
    });

    it('should return false and set error when tokens are expired', async () => {
      useTokenStore.setState({
        alpacaKey: 'key',
        alpacaSecret: 'secret',
        tokenExpiresAt: Date.now() - 1000, // Expired
      });

      const result = await useTokenStore.getState().validateTokens();

      expect(result).toBe(false);
      expect(useTokenStore.getState().captureError).toContain('expired');
    });

    it('should validate successfully with backend', async () => {
      useTokenStore.setState({
        alpacaKey: 'valid-key',
        alpacaSecret: 'valid-secret',
        tokenExpiresAt: Date.now() + 1000000,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ valid: true }),
      });

      const result = await useTokenStore.getState().validateTokens();

      expect(result).toBe(true);
      expect(useTokenStore.getState().isTokenValid).toBe(true);
      expect(useTokenStore.getState().isCapturing).toBe(false);
    });

    it('should handle validation failure from backend', async () => {
      useTokenStore.setState({
        alpacaKey: 'invalid-key',
        alpacaSecret: 'invalid-secret',
        tokenExpiresAt: Date.now() + 1000000,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });

      const result = await useTokenStore.getState().validateTokens();

      expect(result).toBe(false);
      expect(useTokenStore.getState().isTokenValid).toBe(false);
      expect(useTokenStore.getState().captureError).toBe('Invalid credentials');
    });

    it('should handle network errors', async () => {
      useTokenStore.setState({
        alpacaKey: 'key',
        alpacaSecret: 'secret',
        tokenExpiresAt: Date.now() + 1000000,
      });

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await useTokenStore.getState().validateTokens();

      expect(result).toBe(false);
      expect(useTokenStore.getState().captureError).toBe('Network error');
    });
  });
});
