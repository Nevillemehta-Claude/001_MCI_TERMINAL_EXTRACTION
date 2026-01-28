/**
 * INV-006: Input Sanitization & Boundary Cleanliness - Test Suite
 *
 * These tests verify the centralized sanitization module behavior.
 * They are MANDATORY per CONSTITUTIONAL_CONSTRAINTS.md
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  sanitizeRequiredString,
  validateHeaderSafe,
  sanitizeApiKey,
  sanitizeAccessToken,
  sanitizeUserId,
  sanitizeKiteCredentials,
  buildKiteAuthHeader,
  sanitizeCredentialsFromRequest,
} from './sanitize';

describe('INV-006: Input Sanitization & Boundary Cleanliness', () => {
  // ==========================================================================
  // MANDATORY TEST CASES (AUTH-WS-001 through AUTH-WS-006)
  // ==========================================================================

  describe('AUTH-WS-001: Leading whitespace', () => {
    it('trims leading space from API key', () => {
      expect(sanitizeApiKey(' APIKEY123456')).toBe('APIKEY123456');
    });

    it('trims leading space from access token', () => {
      expect(sanitizeAccessToken(' TOKEN12345678901234567890')).toBe('TOKEN12345678901234567890');
    });
  });

  describe('AUTH-WS-002: Trailing whitespace', () => {
    it('trims trailing space from API key', () => {
      expect(sanitizeApiKey('APIKEY123456 ')).toBe('APIKEY123456');
    });

    it('trims trailing space from access token', () => {
      expect(sanitizeAccessToken('TOKEN12345678901234567890 ')).toBe('TOKEN12345678901234567890');
    });
  });

  describe('AUTH-WS-003: Both leading and trailing whitespace', () => {
    it('trims both spaces from API key', () => {
      expect(sanitizeApiKey(' APIKEY123456 ')).toBe('APIKEY123456');
    });

    it('trims both spaces from access token', () => {
      expect(sanitizeAccessToken(' TOKEN12345678901234567890 ')).toBe('TOKEN12345678901234567890');
    });
  });

  describe('AUTH-WS-004: Multiple spaces', () => {
    it('trims multiple leading/trailing spaces from API key', () => {
      expect(sanitizeApiKey('  APIKEY123456  ')).toBe('APIKEY123456');
    });

    it('trims multiple spaces from access token', () => {
      expect(sanitizeAccessToken('   TOKEN12345678901234567890   ')).toBe('TOKEN12345678901234567890');
    });
  });

  describe('AUTH-WS-005: Tab characters', () => {
    it('trims tab characters from API key', () => {
      expect(sanitizeApiKey('\tAPIKEY123456\t')).toBe('APIKEY123456');
    });

    it('trims tab characters from access token', () => {
      expect(sanitizeAccessToken('\tTOKEN12345678901234567890\t')).toBe('TOKEN12345678901234567890');
    });

    it('trims mixed whitespace', () => {
      expect(sanitizeApiKey(' \t APIKEY123456 \t ')).toBe('APIKEY123456');
    });
  });

  describe('AUTH-WS-006: Control characters', () => {
    it('rejects API key with null character', () => {
      expect(() => sanitizeApiKey('API\x00KEY')).toThrow('invalid control characters');
    });

    it('rejects access token with control character', () => {
      expect(() => sanitizeAccessToken('TOKEN\x1FVALUE')).toThrow('invalid control characters');
    });

    it('rejects newline characters', () => {
      // Note: Newline (\n = 0x0A) is caught by control character check first
      expect(() => validateHeaderSafe('VALUE\nINJECT', 'test')).toThrow('invalid control characters');
    });

    it('rejects carriage return characters', () => {
      // Note: Carriage return (\r = 0x0D) is caught by control character check first
      expect(() => validateHeaderSafe('VALUE\rINJECT', 'test')).toThrow('invalid control characters');
    });
  });

  // ==========================================================================
  // Core Sanitization Function Tests
  // ==========================================================================

  describe('sanitizeString', () => {
    it('returns empty string for null', () => {
      expect(sanitizeString(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(sanitizeString(undefined)).toBe('');
    });

    it('returns empty string for number', () => {
      expect(sanitizeString(123)).toBe('');
    });

    it('trims string input', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('handles empty string', () => {
      expect(sanitizeString('')).toBe('');
    });

    it('handles whitespace-only string', () => {
      expect(sanitizeString('   ')).toBe('');
    });
  });

  describe('sanitizeRequiredString', () => {
    it('throws for empty string', () => {
      expect(() => sanitizeRequiredString('', 'fieldName')).toThrow('fieldName is required');
    });

    it('throws for whitespace-only string', () => {
      expect(() => sanitizeRequiredString('   ', 'fieldName')).toThrow('fieldName is required');
    });

    it('returns trimmed value for valid input', () => {
      expect(sanitizeRequiredString('  value  ', 'fieldName')).toBe('value');
    });
  });

  // ==========================================================================
  // Credential Validation Tests
  // ==========================================================================

  describe('sanitizeApiKey', () => {
    it('throws for empty API key', () => {
      expect(() => sanitizeApiKey('')).toThrow('API Key is required');
    });

    it('throws for non-alphanumeric characters', () => {
      expect(() => sanitizeApiKey('API-KEY-123')).toThrow('alphanumeric');
    });

    it('accepts valid alphanumeric API key', () => {
      expect(sanitizeApiKey('abcDEF123')).toBe('abcDEF123');
    });
  });

  describe('sanitizeAccessToken', () => {
    it('throws for empty access token', () => {
      expect(() => sanitizeAccessToken('')).toThrow('Access Token is required');
    });

    it('throws for non-alphanumeric characters', () => {
      expect(() => sanitizeAccessToken('TOKEN_WITH_UNDERSCORE')).toThrow('alphanumeric');
    });

    it('accepts valid alphanumeric access token', () => {
      expect(sanitizeAccessToken('abc123DEF456xyz789')).toBe('abc123DEF456xyz789');
    });
  });

  describe('sanitizeUserId', () => {
    it('throws for empty user ID', () => {
      expect(() => sanitizeUserId('')).toThrow('User ID is required');
    });

    it('throws for invalid format', () => {
      expect(() => sanitizeUserId('12345')).toThrow('format is invalid');
    });

    it('accepts 2-letter prefix', () => {
      expect(sanitizeUserId('AB123')).toBe('AB123');
    });

    it('accepts 3-letter prefix', () => {
      expect(sanitizeUserId('UYW879')).toBe('UYW879');
    });

    it('trims whitespace from user ID', () => {
      expect(sanitizeUserId(' AB123 ')).toBe('AB123');
    });
  });

  describe('sanitizeKiteCredentials', () => {
    it('sanitizes all three credentials', () => {
      const result = sanitizeKiteCredentials({
        apiKey: ' APIKEY12345 ',
        accessToken: ' TOKEN12345678901234567890 ',
        userId: ' AB123 ',
      });

      expect(result.apiKey).toBe('APIKEY12345');
      expect(result.accessToken).toBe('TOKEN12345678901234567890');
      expect(result.userId).toBe('AB123');
    });

    it('throws if any credential is invalid', () => {
      expect(() =>
        sanitizeKiteCredentials({
          apiKey: '',
          accessToken: 'TOKEN',
          userId: 'AB123',
        })
      ).toThrow('API Key is required');
    });
  });

  // ==========================================================================
  // Protocol Construction Tests
  // ==========================================================================

  describe('buildKiteAuthHeader', () => {
    it('constructs valid header format', () => {
      const header = buildKiteAuthHeader('APIKEY123', 'TOKEN456');
      expect(header).toBe('token APIKEY123:TOKEN456');
    });

    it('has exactly one space after "token"', () => {
      const header = buildKiteAuthHeader('APIKEY', 'TOKEN');
      const match = header.match(/^token (\S+):(\S+)$/);
      expect(match).not.toBeNull();
    });

    it('throws for empty API key', () => {
      expect(() => buildKiteAuthHeader('', 'TOKEN')).toThrow('empty credentials');
    });

    it('throws for empty access token', () => {
      expect(() => buildKiteAuthHeader('APIKEY', '')).toThrow('empty credentials');
    });

    it('trims inputs even if passed with whitespace', () => {
      const header = buildKiteAuthHeader(' APIKEY ', ' TOKEN ');
      expect(header).toBe('token APIKEY:TOKEN');
    });
  });

  // ==========================================================================
  // API Boundary Tests
  // ==========================================================================

  describe('sanitizeCredentialsFromRequest', () => {
    it('extracts and sanitizes credentials from request body', () => {
      const body = {
        kiteApiKey: ' APIKEY12345 ',
        kiteAccessToken: ' TOKEN12345678901234567890 ',
        kiteUserId: ' AB123 ',
      };

      const result = sanitizeCredentialsFromRequest(body);

      expect(result.kiteApiKey).toBe('APIKEY12345');
      expect(result.kiteAccessToken).toBe('TOKEN12345678901234567890');
      expect(result.kiteUserId).toBe('AB123');
    });

    it('throws for null body', () => {
      expect(() => sanitizeCredentialsFromRequest(null)).toThrow('Invalid request body');
    });

    it('throws for non-object body', () => {
      expect(() => sanitizeCredentialsFromRequest('string')).toThrow('Invalid request body');
    });

    it('throws for missing credentials', () => {
      expect(() => sanitizeCredentialsFromRequest({})).toThrow('API Key is required');
    });
  });
});
