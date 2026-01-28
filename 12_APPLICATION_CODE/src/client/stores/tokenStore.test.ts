/**
 * Token Store Tests
 * Tests for Kite Connect token management
 * CR-001: Token Validity | CR-004: Token Expiry at 6:00 AM IST
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useTokenStore } from './tokenStore';

// Mock fetch for API calls
global.fetch = vi.fn();

describe('tokenStore', () => {
  beforeEach(() => {
    useTokenStore.getState().clearTokens();
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should have empty Kite API key initially', () => {
      const state = useTokenStore.getState();
      expect(state.kiteApiKey).toBe('');
    });

    it('should have empty access token initially', () => {
      const state = useTokenStore.getState();
      expect(state.kiteAccessToken).toBe('');
    });

    it('should have null expiry initially', () => {
      const state = useTokenStore.getState();
      expect(state.tokenExpiresAt).toBeNull();
    });

    it('should not be valid initially', () => {
      const state = useTokenStore.getState();
      expect(state.isTokenValid).toBe(false);
    });
  });

  describe('setKiteCredentials', () => {
    it('should set Kite credentials', () => {
      const { setKiteCredentials } = useTokenStore.getState();
      
      setKiteCredentials('api_key_123', 'access_token_456', 'USER001');
      
      const state = useTokenStore.getState();
      expect(state.kiteApiKey).toBe('api_key_123');
      expect(state.kiteAccessToken).toBe('access_token_456');
      expect(state.kiteUserId).toBe('USER001');
    });

    it('should set tokenCapturedAt timestamp', () => {
      const { setKiteCredentials } = useTokenStore.getState();
      const before = Date.now();
      
      setKiteCredentials('api_key', 'access_token', 'USER001');
      
      const state = useTokenStore.getState();
      expect(state.tokenCapturedAt).toBeGreaterThanOrEqual(before);
    });

    it('should calculate expiry at 6:00 AM IST (CR-004)', () => {
      const { setKiteCredentials } = useTokenStore.getState();
      
      setKiteCredentials('api_key', 'access_token', 'USER001');
      
      const state = useTokenStore.getState();
      expect(state.tokenExpiresAt).not.toBeNull();
      
      // Verify expiry is in the future
      expect(state.tokenExpiresAt).toBeGreaterThan(Date.now());
      
      // Verify expiry is at 00:30 UTC (6:00 AM IST)
      const expiryDate = new Date(state.tokenExpiresAt!);
      expect(expiryDate.getUTCHours()).toBe(0);
      expect(expiryDate.getUTCMinutes()).toBe(30);
    });
  });

  describe('CR-004: Token Expiry', () => {
    it('should calculate next expiry time correctly', () => {
      const { setKiteCredentials } = useTokenStore.getState();
      
      setKiteCredentials('api_key', 'access_token', 'USER001');
      
      const state = useTokenStore.getState();
      const expiryDate = new Date(state.tokenExpiresAt!);
      
      // 6:00 AM IST = 00:30 UTC
      expect(expiryDate.getUTCHours()).toBe(0);
      expect(expiryDate.getUTCMinutes()).toBe(30);
    });

    it('should report expired when past expiry time', () => {
      const { setKiteCredentials, isTokenExpired } = useTokenStore.getState();
      
      setKiteCredentials('api_key', 'access_token', 'USER001');
      
      // Advance time past expiry (25 hours to be safe)
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);
      
      expect(isTokenExpired()).toBe(true);
    });

    it('should report not expired before expiry time', () => {
      const { setKiteCredentials, isTokenExpired } = useTokenStore.getState();
      
      setKiteCredentials('api_key', 'access_token', 'USER001');
      
      // Don't advance time
      expect(isTokenExpired()).toBe(false);
    });
  });

  describe('getTimeUntilExpiry', () => {
    it('should return null when no token set', () => {
      const { getTimeUntilExpiry } = useTokenStore.getState();
      expect(getTimeUntilExpiry()).toBeNull();
    });

    it('should return positive value when token is valid', () => {
      const { setKiteCredentials, getTimeUntilExpiry } = useTokenStore.getState();
      
      setKiteCredentials('api_key', 'access_token', 'USER001');
      
      const timeUntilExpiry = getTimeUntilExpiry();
      expect(timeUntilExpiry).toBeGreaterThan(0);
    });

    it('should return 0 when token is expired', () => {
      const { setKiteCredentials, getTimeUntilExpiry } = useTokenStore.getState();
      
      setKiteCredentials('api_key', 'access_token', 'USER001');
      
      // Advance past expiry
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);
      
      expect(getTimeUntilExpiry()).toBe(0);
    });
  });

  describe('getTokenAge', () => {
    it('should return null when no token set', () => {
      const { getTokenAge } = useTokenStore.getState();
      expect(getTokenAge()).toBeNull();
    });

    it('should return token age in ms', () => {
      const { setKiteCredentials, getTokenAge } = useTokenStore.getState();
      
      setKiteCredentials('api_key', 'access_token', 'USER001');
      
      // Advance time by 5 minutes
      vi.advanceTimersByTime(5 * 60 * 1000);
      
      const age = getTokenAge();
      expect(age).toBeGreaterThanOrEqual(5 * 60 * 1000);
    });
  });

  describe('clearTokens', () => {
    it('should clear all token data', () => {
      const { setKiteCredentials, clearTokens } = useTokenStore.getState();
      
      setKiteCredentials('api_key', 'access_token', 'USER001');
      clearTokens();
      
      const state = useTokenStore.getState();
      expect(state.kiteApiKey).toBe('');
      expect(state.kiteAccessToken).toBe('');
      expect(state.kiteUserId).toBe('');
      expect(state.tokenExpiresAt).toBeNull();
      expect(state.isTokenValid).toBe(false);
    });
  });

  describe('setCapturing', () => {
    it('should set capturing state', () => {
      const { setCapturing } = useTokenStore.getState();
      
      setCapturing(true);
      expect(useTokenStore.getState().isCapturing).toBe(true);
      
      setCapturing(false);
      expect(useTokenStore.getState().isCapturing).toBe(false);
    });
  });

  describe('setCaptureError', () => {
    it('should set capture error', () => {
      const { setCaptureError } = useTokenStore.getState();
      
      setCaptureError('Test error');
      expect(useTokenStore.getState().captureError).toBe('Test error');
      
      setCaptureError(null);
      expect(useTokenStore.getState().captureError).toBeNull();
    });
  });
});
