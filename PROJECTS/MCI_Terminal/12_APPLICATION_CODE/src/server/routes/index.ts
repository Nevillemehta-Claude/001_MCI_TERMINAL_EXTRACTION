/**
 * MCI API Routes Index
 *
 * Routes:
 * - /api/auth     - Token validation and session management
 * - /api/scan     - Pre-ignition system checks
 * - /api/ignition - Backend selection and system startup
 * - /api/shutdown - Graceful and emergency shutdown
 * - /api/telemetry - Real-time system data
 */

export { authRoutes } from './auth';
export { scanRoutes } from './scan';
export { ignitionRoutes } from './ignition';
export { shutdownRoutes } from './shutdown';
export { telemetryRoutes } from './telemetry';
