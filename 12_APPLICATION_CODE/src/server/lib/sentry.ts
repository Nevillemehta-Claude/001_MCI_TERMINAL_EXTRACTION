/**
 * Sentry Server Configuration
 * MCI Backend Error Monitoring
 *
 * DSN is loaded from SENTRY_DSN environment variable
 * See .env.example for configuration
 */

import * as Sentry from '@sentry/bun';

// Environment detection
const isDevelopment = process.env.NODE_ENV !== 'production';
const isProduction = process.env.NODE_ENV === 'production';

// Sentry DSN - REQUIRED for error monitoring
const SENTRY_DSN = process.env.SENTRY_DSN;

/**
 * Initialize Sentry for the MCI backend
 */
export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] SENTRY_DSN not configured - error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment configuration
    environment: isDevelopment ? 'development' : 'production',

    // Release tracking
    release: process.env.APP_VERSION || 'mci-backend@1.0.0',

    // Sample rates
    tracesSampleRate: isProduction ? 0.1 : 1.0,

    // Integrations
    integrations: [
      // HTTP integration for tracing requests
      Sentry.httpIntegration(),
    ],

    // Filtering
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (isDevelopment && !process.env.SENTRY_DEBUG) {
        console.log('[Sentry Dev] Would send event:', event.message || event.exception);
        return null;
      }

      // Filter expected errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Don't report validation errors as they're expected
        if (error.message.includes('Missing required credentials')) {
          return null;
        }
      }

      return event;
    },

    // Additional configuration
    debug: isDevelopment,

    // Tags for filtering
    initialScope: {
      tags: {
        component: 'mci-backend',
        runtime: 'bun',
      },
    },
  });
}

/**
 * Create Sentry middleware for Hono
 */
export function sentryMiddleware() {
  return async (c: any, next: () => Promise<void>) => {
    await Sentry.startSpan(
      {
        name: `${c.req.method} ${c.req.path}`,
        op: 'http.server',
      },
      async () => {
        try {
          // Add request context
          Sentry.setContext('request', {
            method: c.req.method,
            url: c.req.url,
            headers: Object.fromEntries(c.req.raw.headers),
          });

          await next();

          // Log response status
          Sentry.addBreadcrumb({
            category: 'http',
            message: `${c.req.method} ${c.req.path} -> ${c.res.status}`,
            level: c.res.status >= 400 ? 'error' : 'info',
          });
        } catch (error) {
          Sentry.captureException(error);
          throw error;
        }
      }
    );
  };
}

/**
 * Capture an API error with request context
 */
export function captureApiError(
  error: Error,
  context: {
    route: string;
    method: string;
    body?: Record<string, unknown>;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag('api.route', context.route);
    scope.setTag('api.method', context.method);
    if (context.body) {
      // Sanitize sensitive data - Kite Connect credentials
      const sanitizedBody = { ...context.body };
      if ('kiteApiKey' in sanitizedBody) sanitizedBody.kiteApiKey = '[REDACTED]';
      if ('kiteAccessToken' in sanitizedBody) sanitizedBody.kiteAccessToken = '[REDACTED]';
      if ('kiteApiSecret' in sanitizedBody) sanitizedBody.kiteApiSecret = '[REDACTED]';

      scope.setContext('request_body', sanitizedBody);
    }

    Sentry.captureException(error);
  });
}

/**
 * Capture a trading operation error
 */
export function captureTradeOperationError(
  error: Error,
  operation: 'ignition' | 'shutdown' | 'scan' | 'order',
  details?: Record<string, unknown>
) {
  Sentry.withScope((scope) => {
    scope.setTag('trade.operation', operation);
    scope.setLevel('error');

    if (details) {
      scope.setContext('operation_details', details);
    }

    Sentry.captureException(error);
  });
}

/**
 * Log a backend breadcrumb
 */
export function logBackendBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = 'info'
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Flush Sentry events before shutdown
 */
export async function flushSentry(timeout = 2000) {
  await Sentry.close(timeout);
}

// Export Sentry for direct access
export { Sentry };
