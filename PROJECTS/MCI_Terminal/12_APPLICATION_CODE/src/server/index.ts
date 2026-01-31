import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth';
import { scanRoutes } from './routes/scan';
import { ignitionRoutes } from './routes/ignition';
import { shutdownRoutes } from './routes/shutdown';
import { telemetryRoutes } from './routes/telemetry';
import { initSentry, sentryMiddleware, flushSentry, Sentry } from './lib/sentry';

/**
 * MCI Backend Server
 *
 * Hono-based API server for Mission Control Interface
 * Bun runtime optimized
 */

// Initialize Sentry FIRST
initSentry();

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());
app.use('*', sentryMiddleware());

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: Date.now(),
    version: '1.0.0',
    runtime: 'bun',
  });
});

// Route modules
app.route('/api/auth', authRoutes);
app.route('/api/scan', scanRoutes);
app.route('/api/ignition', ignitionRoutes);
app.route('/api/shutdown', shutdownRoutes);
app.route('/api/telemetry', telemetryRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Error handler with Sentry
app.onError((err, c) => {
  console.error('Server error:', err);

  // Capture error in Sentry
  Sentry.captureException(err, {
    extra: {
      path: c.req.path,
      method: c.req.method,
    },
  });

  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
    },
    500
  );
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, flushing Sentry...');
  await flushSentry();
  process.exit(0);
});

// Start server
const port = process.env.PORT || 3000;

console.log(`🚀 MCI Server starting on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
