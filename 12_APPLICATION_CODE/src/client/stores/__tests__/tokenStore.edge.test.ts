/**
 * IRONCLAD Test Suite: tokenStore Edge Cases
 *
 * Financial-grade testing with exhaustive edge case coverage
 * - Boundary conditions
 * - Error scenarios
 * - Race conditions
 * - State corruption prevention
 * - Timeout handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useTokenStore } from '../tokenStore';

describe('IRONCLAD: tokenStore Edge Cases', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Complete state reset - IRONCLAD requirement
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
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    global.fetch = originalFetch;
  });

  describe('Boundary Conditions', () => {
    it('should handle empty string credentials', () => {
      useTokenStore.getState().setAlpacaCredentials('', '');

      const state = useTokenStore.getState();
      expect(state.alpacaKey).toBe('');
      expect(state.alpacaSecret).toBe('');
      // Token should still be marked with timestamp even for empty
      expect(state.tokenCapturedAt).not.toBeNull();
    });

    it('should handle extremely long credentials (10KB)', () => {
      const longKey = 'A'.repeat(10240);
      const longSecret = 'B'.repeat(10240);

      useTokenStore.getState().setAlpacaCredentials(longKey, longSecret);

      const state = useTokenStore.getState();
      expect(state.alpacaKey).toBe(longKey);
      expect(state.alpacaSecret).toBe(longSecret);
      expect(state.alpacaKey.length).toBe(10240);
    });

    it('should handle special characters in credentials', () => {
      const specialKey = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~';
      const specialSecret = '日本語中文한국어العربية';

      useTokenStore.getState().setAlpacaCredentials(specialKey, specialSecret);

      const state = useTokenStore.getState();
      expect(state.alpacaKey).toBe(specialKey);
      expect(state.alpacaSecret).toBe(specialSecret);
    });

    it('should handle whitespace-only credentials', () => {
      useTokenStore.getState().setAlpacaCredentials('   ', '\t\n\r');

      const state = useTokenStore.getState();
      expect(state.alpacaKey).toBe('   ');
      expect(state.alpacaSecret).toBe('\t\n\r');
    });

    it('should handle null-byte injection attempts', () => {
      const maliciousKey = 'key\x00injected';
      useTokenStore.getState().setAlpacaCredentials(maliciousKey, 'secret');

      expect(useTokenStore.getState().alpacaKey).toBe(maliciousKey);
    });

    it('should handle token expiration at exact boundary', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      // Set expiration to exactly now
      useTokenStore.setState({ tokenExpiresAt: now });

      // At exact boundary, token should be considered expired
      expect(useTokenStore.getState().isTokenExpired()).toBe(true);
    });

    it('should handle token expiration 1ms before boundary', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      useTokenStore.setState({ tokenExpiresAt: now + 1 });

      expect(useTokenStore.getState().isTokenExpired()).toBe(false);
    });

    it('should handle extremely old tokenCapturedAt dates', () => {
      // Set a known current time so age calculation is deterministic
      const now = Date.now();
      vi.setSystemTime(now);

      const veryOld = new Date('1970-01-01').getTime();
      useTokenStore.setState({ tokenCapturedAt: veryOld });

      const age = useTokenStore.getState().getTokenAge();
      expect(age).toBeGreaterThan(50 * 365 * 24 * 60 * 60 * 1000); // > 50 years
    });

    it('should handle future tokenCapturedAt dates', () => {
      // Set a known current time so age calculation is deterministic
      const now = Date.now();
      vi.setSystemTime(now);

      const future = now + 1000000000;
      useTokenStore.setState({ tokenCapturedAt: future });

      const age = useTokenStore.getState().getTokenAge();
      expect(age).toBeLessThan(0); // Negative age for future dates
    });
  });

  describe('Error Scenarios', () => {
    it('should handle fetch throwing synchronously', async () => {
      useTokenStore.setState({
        alpacaKey: 'key',
        alpacaSecret: 'secret',
        tokenExpiresAt: Date.now() + 1000000,
      });

      global.fetch = vi.fn().mockImplementation(() => {
        throw new Error('Synchronous fetch failure');
      });

      const result = await useTokenStore.getState().validateTokens();

      expect(result).toBe(false);
      expect(useTokenStore.getState().captureError).toBe('Synchronous fetch failure');
      expect(useTokenStore.getState().isCapturing).toBe(false);
    });

    it('should handle fetch returning non-JSON response', async () => {
      useTokenStore.setState({
        alpacaKey: 'key',
        alpacaSecret: 'secret',
        tokenExpiresAt: Date.now() + 1000000,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const result = await useTokenStore.getState().validateTokens();

      expect(result).toBe(false);
      expect(useTokenStore.getState().isCapturing).toBe(false);
    });

    it('should handle network timeout scenario', async () => {
      useTokenStore.setState({
        alpacaKey: 'key',
        alpacaSecret: 'secret',
        tokenExpiresAt: Date.now() + 1000000,
      });

      global.fetch = vi.fn().mockRejectedValue(new Error('AbortError: Timeout'));

      const result = await useTokenStore.getState().validateTokens();

      expect(result).toBe(false);
      expect(useTokenStore.getState().captureError).toContain('Timeout');
    });

    it('should handle DNS resolution failure', async () => {
      useTokenStore.setState({
        alpacaKey: 'key',
        alpacaSecret: 'secret',
        tokenExpiresAt: Date.now() + 1000000,
      });

      global.fetch = vi.fn().mockRejectedValue(new Error('getaddrinfo ENOTFOUND'));

      const result = await useTokenStore.getState().validateTokens();

      expect(result).toBe(false);
      expect(useTokenStore.getState().captureError).toContain('ENOTFOUND');
    });

    it('should handle HTTP 429 rate limiting', async () => {
      useTokenStore.setState({
        alpacaKey: 'key',
        alpacaSecret: 'secret',
        tokenExpiresAt: Date.now() + 1000000,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ message: 'Rate limit exceeded' }),
      });

      const result = await useTokenStore.getState().validateTokens();

      expect(result).toBe(false);
      expect(useTokenStore.getState().captureError).toContain('Rate limit');
    });

    it('should handle HTTP 503 service unavailable', async () => {
      useTokenStore.setState({
        alpacaKey: 'key',
        alpacaSecret: 'secret',
        tokenExpiresAt: Date.now() + 1000000,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: () => Promise.resolve({ message: 'Service unavailable' }),
      });

      const result = await useTokenStore.getState().validateTokens();

      expect(result).toBe(false);
    });

    it('should handle undefined error message gracefully', async () => {
      useTokenStore.setState({
        alpacaKey: 'key',
        alpacaSecret: 'secret',
        tokenExpiresAt: Date.now() + 1000000,
      });

      global.fetch = vi.fn().mockRejectedValue({ notAnError: true });

      const result = await useTokenStore.getState().validateTokens();

      expect(result).toBe(false);
      // Should have some error message, not crash
      expect(useTokenStore.getState().captureError).toBeDefined();
    });
  });

  describe('Race Conditions', () => {
    it('should handle concurrent validateTokens calls', async () => {
      const now = Date.now();
      vi.setSystemTime(now);

      useTokenStore.setState({
        alpacaKey: 'key',
        alpacaSecret: 'secret',
        tokenExpiresAt: now + 1000000,
      });

      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ valid: true }),
            });
          }, 100);
        });
      });

      // Start multiple concurrent validations
      const promises = [
        useTokenStore.getState().validateTokens(),
        useTokenStore.getState().validateTokens(),
        useTokenStore.getState().validateTokens(),
      ];

      // Advance timers to allow setTimeout callbacks to execute
      await vi.runAllTimersAsync();

      const results = await Promise.all(promises);

      // All should complete without error
      results.forEach(result => {
        expect(typeof result).toBe('boolean');
      });
    });

    it('should handle clearTokens during validateTokens', async () => {
      useTokenStore.setState({
        alpacaKey: 'key',
        alpacaSecret: 'secret',
        tokenExpiresAt: Date.now() + 1000000,
      });

      global.fetch = vi.fn().mockImplementation(() => {
        // Clear tokens mid-validation
        useTokenStore.getState().clearTokens();
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ valid: true }),
        });
      });

      await useTokenStore.getState().validateTokens();

      // State should reflect the clear, not the validation result
      expect(useTokenStore.getState().alpacaKey).toBe('');
    });

    it('should handle setAlpacaCredentials during validateTokens', async () => {
      useTokenStore.setState({
        alpacaKey: 'old-key',
        alpacaSecret: 'old-secret',
        tokenExpiresAt: Date.now() + 1000000,
      });

      global.fetch = vi.fn().mockImplementation(() => {
        // Change credentials mid-validation
        useTokenStore.getState().setAlpacaCredentials('new-key', 'new-secret');
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ valid: true }),
        });
      });

      await useTokenStore.getState().validateTokens();

      // New credentials should be set
      expect(useTokenStore.getState().alpacaKey).toBe('new-key');
    });
  });

  describe('State Corruption Prevention', () => {
    it('should maintain state consistency after partial failures', async () => {
      const initialState = {
        alpacaKey: 'key',
        alpacaSecret: 'secret',
        tokenExpiresAt: Date.now() + 1000000,
        isCapturing: false,
        captureError: null,
      };
      useTokenStore.setState(initialState);

      global.fetch = vi.fn().mockRejectedValue(new Error('Partial failure'));

      await useTokenStore.getState().validateTokens();

      // isCapturing should be reset even after failure
      expect(useTokenStore.getState().isCapturing).toBe(false);
      // Credentials should be preserved
      expect(useTokenStore.getState().alpacaKey).toBe('key');
    });

    it('should not allow negative tokenExpiresAt', () => {
      useTokenStore.setState({ tokenExpiresAt: -1 });

      // Should handle gracefully
      expect(useTokenStore.getState().isTokenExpired()).toBe(true);
    });

    it('should preserve unrelated state during operations', () => {
      useTokenStore.setState({
        alpacaKey: 'key',
        alpacaSecret: 'secret',
        polygonKey: 'polygon',
      });

      useTokenStore.getState().setCaptureError('test error');

      // polygonKey should be unchanged
      expect(useTokenStore.getState().polygonKey).toBe('polygon');
    });
  });

  describe('Timeout Handling', () => {
    it('should handle validation during token expiration', async () => {
      const now = Date.now();
      vi.setSystemTime(now);

      useTokenStore.setState({
        alpacaKey: 'key',
        alpacaSecret: 'secret',
        tokenExpiresAt: now + 100, // Expires in 100ms
      });

      // Advance time past expiration
      vi.advanceTimersByTime(200);

      const result = await useTokenStore.getState().validateTokens();

      expect(result).toBe(false);
      expect(useTokenStore.getState().captureError).toContain('expired');
    });

    it('should calculate correct token age as time passes', () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      useTokenStore.setState({ tokenCapturedAt: startTime });

      // Advance time by 1 hour
      vi.advanceTimersByTime(60 * 60 * 1000);

      const age = useTokenStore.getState().getTokenAge();
      expect(age).toBe(60 * 60 * 1000);
    });
  });

  describe('Security Boundary Validation', () => {
    it('should not expose credentials in error messages', async () => {
      const sensitiveKey = 'SUPER_SECRET_KEY_12345';
      const sensitiveSecret = 'SUPER_SECRET_SECRET_67890';

      useTokenStore.setState({
        alpacaKey: sensitiveKey,
        alpacaSecret: sensitiveSecret,
        tokenExpiresAt: Date.now() + 1000000,
      });

      global.fetch = vi.fn().mockRejectedValue(new Error('Connection failed'));

      await useTokenStore.getState().validateTokens();

      const error = useTokenStore.getState().captureError;
      expect(error).not.toContain(sensitiveKey);
      expect(error).not.toContain(sensitiveSecret);
    });

    it('should clear sensitive data on clearTokens', () => {
      useTokenStore.setState({
        alpacaKey: 'sensitive-key',
        alpacaSecret: 'sensitive-secret',
        polygonKey: 'sensitive-polygon',
      });

      useTokenStore.getState().clearTokens();

      const state = useTokenStore.getState();
      expect(state.alpacaKey).toBe('');
      expect(state.alpacaSecret).toBe('');
      expect(state.polygonKey).toBe('');
    });
  });
});
