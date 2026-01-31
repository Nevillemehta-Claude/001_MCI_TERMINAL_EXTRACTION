import { Hono } from 'hono';
import {
  captureApiError,
  logBackendBreadcrumb,
  Sentry,
} from '../lib/sentry';
import {
  sanitizeCredentialsFromRequest,
  buildKiteAuthHeader,
} from '../../shared/validation';

/**
 * Authentication Routes
 * Handles token validation with Kite Connect API
 *
 * CR-004 COMPLIANCE: Kite tokens expire at 6:00 AM IST daily
 * INV-006 COMPLIANCE: All inputs sanitized at boundary via centralized module
 */

export const authRoutes = new Hono();

// Validate Kite API credentials
authRoutes.post('/validate', async (c) => {
  logBackendBreadcrumb('Kite auth validation request received', 'auth');

  const body = await c.req.json();

  // INV-006: Sanitize all credentials at API boundary using centralized module
  let kiteApiKey: string;
  let kiteAccessToken: string;
  let kiteUserId: string;

  try {
    const sanitized = sanitizeCredentialsFromRequest(body);
    kiteApiKey = sanitized.kiteApiKey;
    kiteAccessToken = sanitized.kiteAccessToken;
    kiteUserId = sanitized.kiteUserId;
  } catch (sanitizeError) {
    logBackendBreadcrumb('Auth validation failed - credential sanitization error', 'auth', {
      error: sanitizeError instanceof Error ? sanitizeError.message : 'Unknown',
    }, 'warning');
    return c.json(
      {
        valid: false,
        message: sanitizeError instanceof Error ? sanitizeError.message : 'Invalid credentials format',
      },
      400
    );
  }

  try {
    // Validate with Kite Connect API with Sentry span
    const kiteResult = await Sentry.startSpan(
      { name: 'kite.api.profile', op: 'http.client' },
      async () => {
        // Kite Connect API endpoint for user profile
        // INV-006: Use centralized header builder for safe protocol construction
        const response = await fetch('https://api.kite.trade/user/profile', {
          headers: {
            'X-Kite-Version': '3',
            'Authorization': buildKiteAuthHeader(kiteApiKey, kiteAccessToken),
          },
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          logBackendBreadcrumb('Kite API validation failed', 'auth', {
            status: response.status,
          }, 'warning');

          // Check if token expired (Kite returns specific error for expired tokens)
          const errorMessage = error.message || 'Invalid Kite credentials';
          const isExpired = response.status === 403 || errorMessage.includes('expired');

          return {
            ok: false,
            status: response.status,
            error: isExpired
              ? 'Kite token expired. Tokens expire at 6:00 AM IST daily. Please re-authenticate.'
              : errorMessage
          };
        }

        const profileData = await response.json();
        return { ok: true, profile: profileData.data };
      }
    );

    // Handle authentication failure
    if (!kiteResult.ok) {
      return c.json(
        {
          valid: false,
          message: kiteResult.error,
        },
        401
      );
    }

    const profile = kiteResult.profile;

    // Verify user ID matches if provided
    if (kiteUserId && profile.user_id !== kiteUserId) {
      logBackendBreadcrumb('Kite user ID mismatch', 'auth', {}, 'warning');
      return c.json(
        {
          valid: false,
          message: 'User ID does not match authenticated user',
        },
        401
      );
    }

    logBackendBreadcrumb('Kite auth validation success', 'auth', {
      userId: profile.user_id,
      broker: profile.broker,
    });

    return c.json({
      valid: true,
      account: {
        id: profile.user_id,
        name: profile.user_name,
        email: profile.email,
        broker: profile.broker,
        userType: profile.user_type,
        exchanges: profile.exchanges,
      },
      accountId: profile.user_id,
      message: 'Kite credentials validated successfully',
      // CR-004: Include expiry reminder
      expiryNote: 'Token expires at 6:00 AM IST tomorrow',
    });
  } catch (error) {
    console.error('Kite auth validation error:', error);

    // Capture error to Sentry with sanitized context
    captureApiError(error as Error, {
      route: '/api/auth/validate',
      method: 'POST',
      body: { kiteApiKey: '[REDACTED]', kiteAccessToken: '[REDACTED]', kiteUserId },
    });

    return c.json(
      {
        valid: false,
        message: error instanceof Error ? error.message : 'Kite validation failed',
      },
      500
    );
  }
});

// Get current session info
authRoutes.get('/session', (c) => {
  // In a real implementation, this would check session tokens
  return c.json({
    authenticated: false,
    message: 'No active session',
  });
});

export default authRoutes;
