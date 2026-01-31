/**
 * Sentry Client Configuration
 * MCI Frontend Error Monitoring
 *
 * DSN is loaded from VITE_SENTRY_DSN environment variable
 * See .env.example for configuration
 */

import * as Sentry from '@sentry/react';

// Environment detection
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Sentry DSN - REQUIRED for error monitoring
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

/**
 * Initialize Sentry for the MCI frontend
 */
export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] VITE_SENTRY_DSN not configured - error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment configuration
    environment: isDevelopment ? 'development' : 'production',

    // Release tracking (set via CI/CD)
    release: import.meta.env.VITE_APP_VERSION || 'mci@1.0.0',

    // Sample rates
    tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in prod, 100% in dev
    replaysSessionSampleRate: isProduction ? 0.1 : 0, // Session replay
    replaysOnErrorSampleRate: 1.0, // Always capture replays on error

    // Integrations
    integrations: [
      // Browser tracing for performance monitoring
      Sentry.browserTracingIntegration(),

      // Replay for session recording on errors
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Filtering
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (isDevelopment && !import.meta.env.VITE_SENTRY_DEBUG) {
        console.log('[Sentry Dev] Would send event:', event);
        return null;
      }

      // Filter out known non-critical errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Filter network errors that are expected
        if (error.message.includes('Failed to fetch') &&
            error.message.includes('/api/telemetry')) {
          return null; // Telemetry polling failures are expected during shutdown
        }
      }

      return event;
    },

    // Additional configuration
    debug: Boolean(isDevelopment),
    autoSessionTracking: true,

    // Tags for filtering
    initialScope: {
      tags: {
        component: 'mci-frontend',
        'trading.mode': 'unknown', // Updated at runtime
      },
    },
  });
}

/**
 * Set the trading mode context
 * P2 REMEDIATION: Now supports Indian broker types
 */
export function setTradingMode(mode: 'icici' | 'hdfc' | 'kotak' | 'zerodha' | 'unknown') {
  Sentry.setTag('trading.mode', mode);
  Sentry.setContext('trading', {
    mode,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Set user context when authenticated
 */
export function setUserContext(accountId: string, accountStatus: string) {
  Sentry.setUser({
    id: accountId,
    // Don't include PII
  });
  Sentry.setContext('account', {
    status: accountStatus,
    authenticatedAt: new Date().toISOString(),
  });
}

/**
 * Clear user context on logout/session end
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Capture a trading-specific error with context
 */
export function captureTradeError(
  error: Error,
  context: {
    action: 'ignition' | 'shutdown' | 'order' | 'scan';
    phase?: string;
    backend?: 'icici' | 'hdfc' | 'kotak' | 'zerodha';
    details?: Record<string, unknown>;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag('trade.action', context.action);
    if (context.phase) scope.setTag('trade.phase', context.phase);
    if (context.backend) scope.setTag('trade.backend', context.backend);
    if (context.details) scope.setContext('trade_details', context.details);

    Sentry.captureException(error);
  });
}

/**
 * Log a breadcrumb for trading actions
 */
export function logTradingBreadcrumb(
  message: string,
  category: 'ignition' | 'shutdown' | 'scan' | 'telemetry' | 'auth',
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = 'info'
) {
  Sentry.addBreadcrumb({
    message,
    category: `trading.${category}`,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Start a performance transaction for key operations
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startSpan({ name, op }, () => {});
}

// Export Sentry for direct access if needed
export { Sentry };
