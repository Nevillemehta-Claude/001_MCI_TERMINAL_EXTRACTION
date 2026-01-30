/**
 * CIA-SIE-PURE Error Translator Tests
 * 
 * BLOCK-003: MCI error translation layer for CIA-SIE-PURE errors
 */

import { describe, it, expect } from 'vitest';
import {
  translateCiaSieError,
  translateNetworkError,
  translateError,
  formatMciErrorForLog,
  formatMciErrorForDisplay,
  shouldEnterDegradedMode,
  getRetryDelay,
  type CiaSieNativeError,
} from './ciaSieErrorTranslator';

describe('BLOCK-003: CIA-SIE-PURE Error Translation', () => {
  describe('translateCiaSieError', () => {
    it('translates 400 validation error', () => {
      const native: CiaSieNativeError = {
        detail: 'Missing required field: webhook_id',
        status: 400,
      };

      const result = translateCiaSieError(native);

      expect(result.code).toBe('CIA_SIE_VALIDATION_ERROR');
      expect(result.what).toBe('Request validation failed');
      expect(result.why).toBe('Missing required field: webhook_id');
      expect(result.how).toContain('Check the request format');
      expect(result.httpStatus).toBe(400);
      expect(result.isUnavailable).toBe(false);
      expect(result.isRecoverable).toBe(false);
    });

    it('translates 401 auth error', () => {
      const native: CiaSieNativeError = {
        detail: 'Invalid webhook signature',
        status: 401,
      };

      const result = translateCiaSieError(native);

      expect(result.code).toBe('CIA_SIE_AUTH_FAILED');
      expect(result.what).toBe('Authentication failed');
      expect(result.why).toBe('Invalid webhook signature');
      expect(result.how).toContain('Verify webhook credentials');
    });

    it('translates 404 not found error', () => {
      const native: CiaSieNativeError = {
        detail: 'Instrument with id xyz not found',
        status: 404,
      };

      const result = translateCiaSieError(native);

      expect(result.code).toBe('CIA_SIE_NOT_FOUND');
      expect(result.what).toBe('Resource not found');
      expect(result.why).toBe('Instrument with id xyz not found');
    });

    it('translates 429 rate limit error', () => {
      const native: CiaSieNativeError = {
        detail: 'Rate limit exceeded. Please try again later.',
        status: 429,
      };

      const result = translateCiaSieError(native);

      expect(result.code).toBe('CIA_SIE_RATE_LIMITED');
      expect(result.what).toBe('Rate limit exceeded');
      expect(result.how).toContain('Wait at least 60 seconds');
      expect(result.isRecoverable).toBe(true);
    });

    it('translates 500 internal error', () => {
      const native: CiaSieNativeError = {
        detail: 'Database connection failed',
        status: 500,
      };

      const result = translateCiaSieError(native);

      expect(result.code).toBe('CIA_SIE_INTERNAL_ERROR');
      expect(result.what).toBe('CIA-SIE-PURE internal error');
      expect(result.isRecoverable).toBe(true);
    });

    it('translates 503 unavailable error', () => {
      const native: CiaSieNativeError = {
        detail: 'Service temporarily unavailable',
        status: 503,
      };

      const result = translateCiaSieError(native);

      expect(result.code).toBe('CIA_SIE_UNAVAILABLE');
      expect(result.what).toBe('CIA-SIE-PURE is unavailable');
      expect(result.isUnavailable).toBe(true);
      expect(result.isRecoverable).toBe(true);
    });

    it('translates unknown status to unknown error', () => {
      const native: CiaSieNativeError = {
        detail: 'Some weird error',
        status: 999,
      };

      const result = translateCiaSieError(native);

      expect(result.code).toBe('CIA_SIE_UNKNOWN_ERROR');
      expect(result.what).toBe('Unknown error occurred');
      expect(result.httpStatus).toBe(999);
    });

    it('handles empty detail', () => {
      const native: CiaSieNativeError = {
        detail: '',
        status: 500,
      };

      const result = translateCiaSieError(native);

      expect(result.why).toBe('No additional details available');
    });

    it('preserves original details in details object', () => {
      const native: CiaSieNativeError = {
        detail: 'Original message',
        status: 400,
      };

      const result = translateCiaSieError(native);

      expect(result.details?.originalStatus).toBe(400);
      expect(result.details?.originalDetail).toBe('Original message');
    });
  });

  describe('translateNetworkError', () => {
    it('translates generic network error', () => {
      const error = new Error('Failed to fetch');

      const result = translateNetworkError(error);

      expect(result.code).toBe('CIA_SIE_NETWORK_ERROR');
      expect(result.what).toBe('Network connection failed');
      expect(result.why).toBe('Failed to fetch');
      expect(result.isUnavailable).toBe(true);
      expect(result.isRecoverable).toBe(true);
      expect(result.httpStatus).toBe(0);
    });

    it('detects timeout from AbortError', () => {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';

      const result = translateNetworkError(error);

      expect(result.code).toBe('CIA_SIE_TIMEOUT');
      expect(result.what).toBe('CIA-SIE-PURE request timed out');
    });

    it('detects timeout from message content', () => {
      const error = new Error('Request timeout after 30s');

      const result = translateNetworkError(error);

      expect(result.code).toBe('CIA_SIE_TIMEOUT');
    });

    it('detects timeout from "timed out" in message', () => {
      const error = new Error('Connection timed out');

      const result = translateNetworkError(error);

      expect(result.code).toBe('CIA_SIE_TIMEOUT');
    });

    it('preserves error details', () => {
      const error = new TypeError('Network request failed');

      const result = translateNetworkError(error);

      expect(result.details?.errorName).toBe('TypeError');
      expect(result.details?.errorMessage).toBe('Network request failed');
    });
  });

  describe('translateError', () => {
    it('translates Error with status code in message', () => {
      const error = new Error('Engine error: 500');

      const result = translateError(error);

      expect(result.code).toBe('CIA_SIE_INTERNAL_ERROR');
      expect(result.httpStatus).toBe(500);
    });

    it('translates Error without status as network error', () => {
      const error = new Error('Connection refused');

      const result = translateError(error);

      expect(result.code).toBe('CIA_SIE_NETWORK_ERROR');
      expect(result.isUnavailable).toBe(true);
    });

    it('translates non-Error to unknown error', () => {
      const result = translateError('just a string');

      expect(result.code).toBe('CIA_SIE_INTERNAL_ERROR');
      expect(result.why).toBe('just a string');
    });

    it('uses default status when provided', () => {
      const result = translateError('error', 503);

      expect(result.code).toBe('CIA_SIE_UNAVAILABLE');
      expect(result.httpStatus).toBe(503);
    });
  });

  describe('formatMciErrorForLog', () => {
    it('formats error for logging', () => {
      const error = translateCiaSieError({ detail: 'Test error', status: 400 });
      const formatted = formatMciErrorForLog(error);

      expect(formatted).toBe('[CIA_SIE_VALIDATION_ERROR] Request validation failed: Test error');
    });
  });

  describe('formatMciErrorForDisplay', () => {
    it('formats error for UI display', () => {
      const error = translateCiaSieError({ detail: 'Missing field', status: 400 });
      const display = formatMciErrorForDisplay(error);

      expect(display.title).toBe('Request validation failed');
      expect(display.body).toBe('Missing field');
      expect(display.action).toContain('Check the request format');
    });
  });

  describe('shouldEnterDegradedMode', () => {
    it('returns true for unavailable errors', () => {
      const error = translateCiaSieError({ detail: 'down', status: 503 });
      expect(shouldEnterDegradedMode(error)).toBe(true);
    });

    it('returns true for network errors', () => {
      const error = translateNetworkError(new Error('no connection'));
      expect(shouldEnterDegradedMode(error)).toBe(true);
    });

    it('returns false for validation errors', () => {
      const error = translateCiaSieError({ detail: 'bad input', status: 400 });
      expect(shouldEnterDegradedMode(error)).toBe(false);
    });

    it('returns false for auth errors', () => {
      const error = translateCiaSieError({ detail: 'unauthorized', status: 401 });
      expect(shouldEnterDegradedMode(error)).toBe(false);
    });
  });

  describe('getRetryDelay', () => {
    it('returns 0 for non-recoverable errors', () => {
      const error = translateCiaSieError({ detail: 'bad input', status: 400 });
      expect(getRetryDelay(error)).toBe(0);
    });

    it('returns 60s for rate limit', () => {
      const error = translateCiaSieError({ detail: 'rate limited', status: 429 });
      expect(getRetryDelay(error)).toBe(60000);
    });

    it('returns 5s for timeout', () => {
      const error = translateCiaSieError({ detail: 'timeout', status: 504 });
      expect(getRetryDelay(error)).toBe(5000);
    });

    it('returns 10s for unavailable', () => {
      const error = translateCiaSieError({ detail: 'down', status: 503 });
      expect(getRetryDelay(error)).toBe(10000);
    });

    it('returns 30s for internal error', () => {
      const error = translateCiaSieError({ detail: 'internal', status: 500 });
      expect(getRetryDelay(error)).toBe(30000);
    });
  });

  describe('WHAT/WHY/HOW completeness', () => {
    const statusCodes = [400, 401, 403, 404, 409, 429, 500, 502, 503, 504];

    statusCodes.forEach((status) => {
      it(`provides complete WHAT/WHY/HOW for status ${status}`, () => {
        const error = translateCiaSieError({ detail: 'Test', status });

        expect(error.what).toBeTruthy();
        expect(error.what.length).toBeGreaterThan(5);
        expect(error.why).toBeTruthy();
        expect(error.how).toBeTruthy();
        expect(error.how.length).toBeGreaterThan(10);
      });
    });
  });
});

// ============================================================================
// SILO 2: Enhanced Error Semantics Tests
// ============================================================================

import {
  translateCiaSieErrorEnhanced,
  getUserFacingMessage,
  getErrorSeverity,
  formatErrorForOperatorLog,
} from './ciaSieErrorTranslator';

describe('SILO 2: Enhanced Error Semantics', () => {
  describe('translateCiaSieErrorEnhanced', () => {
    it('detects instrument not found from detail', () => {
      const native: CiaSieNativeError = {
        detail: 'Instrument RELIANCE not found in database',
        status: 404,
      };

      const result = translateCiaSieErrorEnhanced(native);

      expect(result.code).toBe('CIA_SIE_INSTRUMENT_NOT_FOUND');
      expect(result.what).toBe('Instrument not found');
      expect(result.how).toContain('Verify the instrument symbol');
    });

    it('detects webhook invalid from detail', () => {
      const native: CiaSieNativeError = {
        detail: 'Webhook signature verification failed - HMAC mismatch',
        status: 401,
      };

      const result = translateCiaSieErrorEnhanced(native);

      expect(result.code).toBe('CIA_SIE_WEBHOOK_INVALID');
      expect(result.what).toBe('Invalid webhook payload');
    });

    it('detects database error from detail', () => {
      const native: CiaSieNativeError = {
        detail: 'Database connection failed: SQLite error',
        status: 500,
      };

      const result = translateCiaSieErrorEnhanced(native);

      expect(result.code).toBe('CIA_SIE_DATABASE_ERROR');
      expect(result.what).toBe('Database operation failed');
    });

    it('detects AI unavailable from detail', () => {
      const native: CiaSieNativeError = {
        detail: 'Claude API returned error: budget exhausted',
        status: 503,
      };

      const result = translateCiaSieErrorEnhanced(native);

      expect(result.code).toBe('CIA_SIE_AI_UNAVAILABLE');
      expect(result.what).toBe('AI service unavailable');
    });

    it('detects constitutional violation from detail', () => {
      const native: CiaSieNativeError = {
        detail: 'Constitutional violation detected: prohibited content in response',
        status: 500,
      };

      const result = translateCiaSieErrorEnhanced(native);

      expect(result.code).toBe('CIA_SIE_CONSTITUTIONAL_VIOLATION');
      expect(result.what).toBe('AI response validation failed');
      expect(result.isSilentToUser).toBe(true);
    });

    it('detects aggregation attempt from detail', () => {
      const native: CiaSieNativeError = {
        detail: 'Aggregation attempt blocked: cannot aggregate signals',
        status: 500,
      };

      const result = translateCiaSieErrorEnhanced(native);

      expect(result.code).toBe('CIA_SIE_AGGREGATION_BLOCKED');
      expect(result.isSilentToUser).toBe(true);
    });

    it('detects recommendation attempt from detail', () => {
      const native: CiaSieNativeError = {
        detail: 'Recommendation attempt blocked: prescriptive language detected - you should buy',
        status: 500,
      };

      const result = translateCiaSieErrorEnhanced(native);

      expect(result.code).toBe('CIA_SIE_RECOMMENDATION_BLOCKED');
      expect(result.isSilentToUser).toBe(true);
    });

    it('detects contradiction resolution attempt from detail', () => {
      const native: CiaSieNativeError = {
        detail: 'Cannot resolve contradiction between signals',
        status: 500,
      };

      const result = translateCiaSieErrorEnhanced(native);

      expect(result.code).toBe('CIA_SIE_CONTRADICTION_RESOLUTION_BLOCKED');
      expect(result.isSilentToUser).toBe(true);
    });

    it('classifies user-facing errors correctly', () => {
      const native: CiaSieNativeError = {
        detail: 'Validation error',
        status: 400,
      };

      const result = translateCiaSieErrorEnhanced(native);

      expect(result.audience).toBe('user');
    });

    it('classifies operator-facing errors correctly', () => {
      const native: CiaSieNativeError = {
        detail: 'Database error: connection pool exhausted',
        status: 500,
      };

      const result = translateCiaSieErrorEnhanced(native);

      expect(result.audience).toBe('operator');
    });

    it('includes detectedExceptionType in details', () => {
      const native: CiaSieNativeError = {
        detail: 'Instrument XYZ not found',
        status: 404,
      };

      const result = translateCiaSieErrorEnhanced(native);

      expect(result.details?.detectedExceptionType).toBe('CIA_SIE_INSTRUMENT_NOT_FOUND');
    });
  });

  describe('getUserFacingMessage', () => {
    it('returns null for silent errors', () => {
      const error = translateCiaSieErrorEnhanced({
        detail: 'Constitutional violation detected',
        status: 500,
      });

      const message = getUserFacingMessage(error);

      expect(message).toBeNull();
    });

    it('returns special message for constitutional violations when not silent', () => {
      const error = {
        code: 'CIA_SIE_CONSTITUTIONAL_VIOLATION',
        what: 'AI response validation failed',
        why: 'Prohibited content',
        how: 'Retry',
        httpStatus: 500,
        isUnavailable: false,
        isRecoverable: true,
        isSilentToUser: false, // Force not silent for testing
      };

      const message = getUserFacingMessage(error);

      expect(message?.title).toBe('AI narrative is being regenerated');
      expect(message?.body).toContain('quality standards');
    });

    it('returns WHAT/WHY/HOW for normal errors', () => {
      const error = translateCiaSieError({
        detail: 'Validation failed',
        status: 400,
      });

      const message = getUserFacingMessage(error);

      expect(message?.title).toBe('Request validation failed');
      expect(message?.body).toBe('Validation failed');
    });
  });

  describe('getErrorSeverity', () => {
    it('returns critical for unavailable errors', () => {
      const error = translateCiaSieError({ detail: 'down', status: 503 });
      expect(getErrorSeverity(error)).toBe('critical');
    });

    it('returns error for database errors', () => {
      const error = translateCiaSieErrorEnhanced({
        detail: 'Database error occurred',
        status: 500,
      });
      expect(getErrorSeverity(error)).toBe('error');
    });

    it('returns warning for AI unavailable', () => {
      const error = translateCiaSieErrorEnhanced({
        detail: 'Claude API error',
        status: 503,
      });
      expect(getErrorSeverity(error)).toBe('warning');
    });

    it('returns info for constitutional violations', () => {
      const error = translateCiaSieErrorEnhanced({
        detail: 'Constitutional violation in response',
        status: 500,
      });
      expect(getErrorSeverity(error)).toBe('info');
    });
  });

  describe('formatErrorForOperatorLog', () => {
    it('formats error with full context', () => {
      const error = translateCiaSieError({ detail: 'Test error', status: 500 });
      const formatted = formatErrorForOperatorLog(error, {
        endpoint: '/api/v1/charts',
        requestId: 'req-123',
      });

      expect(formatted).toContain('[ERROR]');
      expect(formatted).toContain('[CIA_SIE_INTERNAL_ERROR]');
      expect(formatted).toContain('Status: 500');
      expect(formatted).toContain('Endpoint: /api/v1/charts');
      expect(formatted).toContain('Request ID: req-123');
      expect(formatted).toContain('Timestamp:');
    });

    it('works without context', () => {
      const error = translateCiaSieError({ detail: 'Test', status: 400 });
      const formatted = formatErrorForOperatorLog(error);

      expect(formatted).toContain('[WARNING]');
      expect(formatted).not.toContain('Endpoint:');
    });
  });

  describe('SILO 2: Exception pattern completeness', () => {
    const exceptionPatterns = [
      { detail: 'Instrument ABC not found', expectedCode: 'CIA_SIE_INSTRUMENT_NOT_FOUND' },
      { detail: 'Validation error: missing field', expectedCode: 'CIA_SIE_VALIDATION_ERROR' },
      { detail: 'Webhook HMAC verification failed', expectedCode: 'CIA_SIE_WEBHOOK_INVALID' },
      { detail: 'Unknown webhook source', expectedCode: 'CIA_SIE_WEBHOOK_NOT_FOUND' },
      { detail: 'SQLite database error', expectedCode: 'CIA_SIE_DATABASE_ERROR' },
      { detail: 'Anthropic API unavailable', expectedCode: 'CIA_SIE_AI_UNAVAILABLE' },
      { detail: 'Constitutional violation in AI output', expectedCode: 'CIA_SIE_CONSTITUTIONAL_VIOLATION' },
      { detail: 'Cannot aggregate signals together', expectedCode: 'CIA_SIE_AGGREGATION_BLOCKED' },
      { detail: 'You should buy - prescriptive blocked', expectedCode: 'CIA_SIE_RECOMMENDATION_BLOCKED' },
      { detail: 'Resolve contradiction attempt blocked', expectedCode: 'CIA_SIE_CONTRADICTION_RESOLUTION_BLOCKED' },
    ];

    exceptionPatterns.forEach(({ detail, expectedCode }) => {
      it(`detects ${expectedCode} from pattern`, () => {
        const result = translateCiaSieErrorEnhanced({ detail, status: 500 });
        expect(result.code).toBe(expectedCode);
        expect(result.what).toBeTruthy();
        expect(result.how).toBeTruthy();
      });
    });
  });
});
