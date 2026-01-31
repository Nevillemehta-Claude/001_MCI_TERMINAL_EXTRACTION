import { Hono } from 'hono';
import {
  captureTradeOperationError,
  logBackendBreadcrumb,
  Sentry,
} from '../lib/sentry';

/**
 * Ignition Routes
 * Handles system startup and backend management
 */

export const ignitionRoutes = new Hono();

// P2 REMEDIATION: Indian broker backend types
type BackendType = 'icici' | 'hdfc' | 'kotak' | 'zerodha';
const VALID_BACKENDS: BackendType[] = ['icici', 'hdfc', 'kotak', 'zerodha'];

// System state
let systemState = {
  isRunning: false,
  backend: null as BackendType | null,
  startedAt: null as number | null,
};

// Reset system state (for testing)
export function resetSystemState() {
  systemState = {
    isRunning: false,
    backend: null,
    startedAt: null,
  };
}

// Start the trading system
ignitionRoutes.post('/start', async (c) => {
  logBackendBreadcrumb('Ignition start request received', 'ignition');

  const body = await c.req.json();
  const { backend, timestamp } = body;

  if (!backend || !VALID_BACKENDS.includes(backend)) {
    logBackendBreadcrumb('Ignition rejected - invalid backend', 'ignition', { backend }, 'warning');
    return c.json(
      {
        success: false,
        message: `Invalid backend type. Must be one of: ${VALID_BACKENDS.join(', ')}`,
      },
      400
    );
  }

  if (systemState.isRunning) {
    logBackendBreadcrumb('Ignition rejected - already running', 'ignition', {}, 'warning');
    return c.json(
      {
        success: false,
        message: 'System is already running',
      },
      409
    );
  }

  // Set Sentry tag for trading mode
  Sentry.setTag('trading.mode', backend);

  try {
    // Simulate startup sequence with Sentry span
    await Sentry.startSpan(
      { name: 'ignition.startup', op: 'task' },
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    );

    systemState = {
      isRunning: true,
      backend,
      startedAt: timestamp || Date.now(),
    };

    console.log(`🚀 System ignited in ${backend} mode`);
    logBackendBreadcrumb('Ignition completed - system running', 'ignition', {
      backend,
      startedAt: systemState.startedAt,
    });

    return c.json({
      success: true,
      message: `System started in ${backend} trading mode`,
      state: systemState,
    });
  } catch (error) {
    captureTradeOperationError(error as Error, 'ignition', { backend });
    logBackendBreadcrumb('Ignition failed', 'ignition', {
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'error');

    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Ignition failed',
      },
      500
    );
  }
});

// Abort/stop the system
ignitionRoutes.post('/abort', async (c) => {
  logBackendBreadcrumb('Abort request received', 'ignition', { wasRunning: systemState.isRunning });

  if (!systemState.isRunning) {
    logBackendBreadcrumb('Abort - system was not running', 'ignition');
    return c.json({
      success: true,
      message: 'System was not running',
    });
  }

  try {
    // Simulate abort sequence
    await new Promise((resolve) => setTimeout(resolve, 200));

    const previousState = { ...systemState };

    systemState = {
      isRunning: false,
      backend: null,
      startedAt: null,
    };

    // Clear trading mode tag
    Sentry.setTag('trading.mode', 'unknown');

    console.log('🛑 System aborted');
    logBackendBreadcrumb('System aborted successfully', 'ignition', {
      previousBackend: previousState.backend,
      runDuration: previousState.startedAt ? Date.now() - previousState.startedAt : 0,
    }, 'warning');

    return c.json({
      success: true,
      message: 'System aborted successfully',
      previousState,
    });
  } catch (error) {
    captureTradeOperationError(error as Error, 'ignition', { operation: 'abort' });
    logBackendBreadcrumb('Abort failed', 'ignition', {
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'error');

    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Abort failed',
      },
      500
    );
  }
});

// Get current system status
ignitionRoutes.get('/status', (c) => {
  return c.json({
    ...systemState,
    uptime: systemState.startedAt ? Date.now() - systemState.startedAt : 0,
  });
});

// Backend health check
ignitionRoutes.get('/backend/:type', async (c) => {
  const type = c.req.param('type') as BackendType;

  if (!VALID_BACKENDS.includes(type)) {
    return c.json({ error: `Invalid backend type. Must be one of: ${VALID_BACKENDS.join(', ')}` }, 400);
  }

  // P2 REMEDIATION: Indian broker endpoints
  const endpoints: Record<BackendType, string> = {
    icici: 'https://api.icicidirect.com/apiuser',
    hdfc: 'https://api.hdfcsec.com/openapi',
    kotak: 'https://tradeapi.kotaksecurities.com/apim',
    zerodha: 'https://api.kite.trade',
  };

  return c.json({
    type,
    endpoint: endpoints[type],
    available: true,
    message: `${type.toUpperCase()} backend available`,
  });
});

export default ignitionRoutes;
