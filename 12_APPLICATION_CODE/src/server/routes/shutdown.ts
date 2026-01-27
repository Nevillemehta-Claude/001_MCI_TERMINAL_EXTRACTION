import { Hono } from 'hono';
import {
  captureTradeOperationError,
  logBackendBreadcrumb,
  Sentry,
} from '../lib/sentry';

/**
 * Shutdown Routes
 * Handles graceful and emergency shutdown procedures
 */

export const shutdownRoutes = new Hono();

// Full shutdown sequence - MUST be registered before /:stepId to avoid being caught by param
shutdownRoutes.post('/full', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { emergency, closePositions, cancelOrders, saveState } = body;

  const steps = [
    saveState !== false && 'save-state',
    cancelOrders !== false && 'cancel-orders',
    closePositions && 'close-positions',
    'disconnect-streams',
    'cleanup',
    'finalize',
  ].filter(Boolean) as string[];

  const results: Record<string, { success: boolean; message: string; duration: number }> = {};

  for (const step of steps) {
    const startTime = Date.now();
    try {
      const delay = emergency ? 50 : 200;
      await new Promise((resolve) => setTimeout(resolve, delay));
      results[step] = {
        success: true,
        message: `${step} completed`,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      results[step] = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed',
        duration: Date.now() - startTime,
      };
      if (!emergency) break;
    }
  }

  const allSuccess = Object.values(results).every((r) => r.success);

  return c.json({
    success: allSuccess,
    results,
    totalDuration: Object.values(results).reduce((sum, r) => sum + r.duration, 0),
    message: allSuccess ? 'Shutdown complete' : 'Shutdown completed with errors',
  });
});

// Execute shutdown step
shutdownRoutes.post('/:stepId', async (c) => {
  const stepId = c.req.param('stepId');
  const body = await c.req.json().catch(() => ({}));
  const { emergency } = body;

  logBackendBreadcrumb('Shutdown step started', 'shutdown', { stepId, emergency });

  // Simulate step execution with timing
  const executeStep = async (): Promise<{ success: boolean; message: string }> => {
    const baseDelay = emergency ? 50 : 200;
    const delay = Math.random() * baseDelay + baseDelay;
    await new Promise((resolve) => setTimeout(resolve, delay));

    switch (stepId) {
      case 'save-state':
        return { success: true, message: 'System state saved to storage' };

      case 'cancel-orders':
        // Simulate canceling orders
        const orderCount = Math.floor(Math.random() * 5);
        return {
          success: true,
          message: orderCount > 0 ? `Canceled ${orderCount} pending orders` : 'No pending orders',
        };

      case 'close-positions':
        // Simulate closing positions
        const positionCount = Math.floor(Math.random() * 3);
        return {
          success: true,
          message:
            positionCount > 0
              ? `Closed ${positionCount} positions at market`
              : 'No open positions',
        };

      case 'disconnect-streams':
        return { success: true, message: 'WebSocket connections closed' };

      case 'cleanup':
        return { success: true, message: 'Resources released' };

      case 'finalize':
        return { success: true, message: 'Shutdown complete' };

      default:
        return { success: false, message: 'Unknown shutdown step' };
    }
  };

  try {
    const result = await Sentry.startSpan(
      { name: `shutdown.step.${stepId}`, op: 'task' },
      executeStep
    );

    logBackendBreadcrumb('Shutdown step completed', 'shutdown', {
      stepId,
      success: result.success,
      emergency,
    });

    return c.json(result);
  } catch (error) {
    captureTradeOperationError(error as Error, 'shutdown', { stepId, emergency });
    logBackendBreadcrumb('Shutdown step failed', 'shutdown', {
      stepId,
      error: error instanceof Error ? error.message : 'Unknown error',
      emergency,
    }, 'error');

    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Step failed',
      },
      500
    );
  }
});

export default shutdownRoutes;
