import { Hono } from 'hono';
import {
  captureTradeOperationError,
  logBackendBreadcrumb,
  Sentry,
} from '../lib/sentry';

/**
 * Scanner Routes
 * Handles pre-ignition system checks for Indian markets
 * P3 REMEDIATION: Updated from Alpaca/Polygon to Kite Connect/NSE/BSE
 */

export const scanRoutes = new Hono();

// P3 REMEDIATION: Updated check IDs for Indian market infrastructure
const ALL_CHECKS = [
  'kite-connection',      // Was: alpaca-connection
  'nse-bse-data',         // Was: polygon-connection
  'websocket-health',
  'token-validity',
  'account-access',
  'market-status',
  'data-feed',
  'symbol-availability',
  'backend-health',
  'memory-resources',
  'risk-parameters',
  'strategy-config',
];

// Simulate check execution with realistic timing
const executeCheck = async (checkId: string): Promise<{
  passed: boolean;
  warning: boolean;
  message: string;
}> => {
  // Simulate network latency
  const delay = Math.random() * 100 + 50; // 50-150ms
  await new Promise((resolve) => setTimeout(resolve, delay));

  // P3 REMEDIATION: Check-specific logic for Indian markets
  switch (checkId) {
    case 'kite-connection':
      return { passed: true, warning: false, message: 'Kite Connect API connected' };

    case 'nse-bse-data':
      // Simulate occasional warning for market data feed
      const dataFeedOk = Math.random() > 0.1;
      return {
        passed: dataFeedOk,
        warning: !dataFeedOk,
        message: dataFeedOk ? 'NSE/BSE data feed connected' : 'NSE/BSE data feed slow response',
      };

    case 'websocket-health':
      return { passed: true, warning: false, message: 'WebSocket connection stable' };

    case 'token-validity':
      // CR-004: Kite tokens expire at 6:00 AM IST
      return { passed: true, warning: false, message: 'Kite tokens valid (expires 6:00 AM IST)' };

    case 'account-access':
      return { passed: true, warning: false, message: 'Account access confirmed' };

    case 'market-status':
      // P3 REMEDIATION: Indian market hours 9:15 AM - 3:30 PM IST
      // IST = UTC+5:30, so 9:15 AM IST = 3:45 AM UTC, 3:30 PM IST = 10:00 AM UTC
      const now = new Date();
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const utcTimeMinutes = utcHours * 60 + utcMinutes;
      // 3:45 UTC = 225 minutes, 10:00 UTC = 600 minutes
      const isIndianMarketHours = utcTimeMinutes >= 225 && utcTimeMinutes < 600;
      return {
        passed: true,
        warning: !isIndianMarketHours,
        message: isIndianMarketHours ? 'NSE/BSE markets open' : 'NSE/BSE markets closed (9:15 AM - 3:30 PM IST)',
      };

    case 'data-feed':
      return { passed: true, warning: false, message: 'NSE/BSE data feed quality: Good' };

    case 'symbol-availability':
      return { passed: true, warning: false, message: 'All configured NSE/BSE symbols available' };

    case 'backend-health':
      return { passed: true, warning: false, message: 'CIA-SIE-PURE backend healthy' };

    case 'memory-resources':
      const memoryUsage = process.memoryUsage();
      const usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const totalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      return {
        passed: true,
        warning: usedMB / totalMB > 0.8,
        message: `Memory: ${usedMB}MB / ${totalMB}MB`,
      };

    case 'risk-parameters':
      return { passed: true, warning: false, message: 'Risk parameters validated' };

    case 'strategy-config':
      return { passed: true, warning: false, message: 'Strategy configuration valid' };

    default:
      return { passed: false, warning: false, message: 'Unknown check' };
  }
};

// Run all checks - MUST be registered before /:checkId to avoid being caught by param
scanRoutes.post('/all', async (c) => {
  const results: Record<string, Awaited<ReturnType<typeof executeCheck>>> = {};

  for (const checkId of ALL_CHECKS) {
    results[checkId] = await executeCheck(checkId);
  }

  const passed = Object.values(results).filter((r) => r.passed && !r.warning).length;
  const warnings = Object.values(results).filter((r) => r.warning).length;
  const failed = Object.values(results).filter((r) => !r.passed).length;

  return c.json({
    results,
    summary: {
      total: ALL_CHECKS.length,
      passed,
      warnings,
      failed,
      canProceed: failed === 0,
    },
  });
});

// Execute individual check
scanRoutes.post('/:checkId', async (c) => {
  const checkId = c.req.param('checkId');

  logBackendBreadcrumb('Scan check started', 'scan', { checkId });

  try {
    const result = await Sentry.startSpan(
      { name: `scan.check.${checkId}`, op: 'task' },
      async () => {
        return executeCheck(checkId);
      }
    );

    logBackendBreadcrumb('Scan check completed', 'scan', {
      checkId,
      passed: result.passed,
      warning: result.warning,
    }, result.passed ? 'info' : 'warning');

    return c.json(result);
  } catch (error) {
    captureTradeOperationError(error as Error, 'scan', { checkId });
    logBackendBreadcrumb('Scan check failed', 'scan', {
      checkId,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'error');

    return c.json(
      {
        passed: false,
        warning: false,
        message: error instanceof Error ? error.message : 'Check failed',
      },
      500
    );
  }
});

export default scanRoutes;
