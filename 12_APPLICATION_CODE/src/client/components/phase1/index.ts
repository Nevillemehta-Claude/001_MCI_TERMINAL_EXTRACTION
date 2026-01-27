/**
 * Phase 1: Pre-Ignition Scanner
 *
 * 12-point diagnostic system that must complete in <500ms:
 *
 * Connection Checks (1-3):
 * - Alpaca API Connection
 * - Polygon Data Connection
 * - WebSocket Health
 *
 * Authentication Checks (4-5):
 * - Token Validity
 * - Account Access
 *
 * Market Checks (6-8):
 * - Market Status
 * - Data Feed Quality
 * - Symbol Availability
 *
 * System Checks (9-10):
 * - Backend Health
 * - System Resources
 *
 * Configuration Checks (11-12):
 * - Risk Parameters
 * - Strategy Configuration
 */

export { PreIgnitionScanner } from './PreIgnitionScanner';
export { ScanCheckItem } from './ScanCheckItem';
