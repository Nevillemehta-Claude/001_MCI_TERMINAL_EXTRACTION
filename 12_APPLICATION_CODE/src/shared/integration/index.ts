/**
 * Dark Integration Module - Central Export
 * 
 * SILO 7: Integration scaffolding that is OFF by default.
 * 
 * ⚠️  CRITICAL CONSTRAINT: EVERYTHING IN THIS MODULE IS DISABLED BY DEFAULT
 * ============================================================================
 * 
 * This module provides interfaces, adapters, and hooks for future integration
 * with CIA-SIE-PURE. ALL components are:
 * 
 * 1. DISABLED by default (DARK_MODE = true)
 * 2. Interface-only (no runtime behavior until enabled)
 * 3. Explicitly gated by feature flags that are OFF
 * 4. Removable in <60 seconds
 * 
 * NOTHING in this module activates without explicit configuration change.
 * 
 * See: 00_GOVERNANCE/ROLLBACK_PLAYBOOK.md
 */

// ============================================================================
// DARK MODE CONFIGURATION
// ============================================================================

/**
 * DARK MODE FLAG: When true, all integration is disabled.
 * 
 * CONSTRAINT: This MUST default to true.
 * Changing this to false REQUIRES explicit Principal authorization.
 */
export const DARK_MODE = true as const;

/**
 * Feature flags for granular integration control.
 * ALL flags are OFF by default.
 */
export const INTEGRATION_FLAGS = {
  /** Enable health polling to CIA-SIE-PURE */
  HEALTH_POLLING_ENABLED: false,
  /** Enable telemetry fetching */
  TELEMETRY_ENABLED: false,
  /** Enable signal display */
  SIGNALS_ENABLED: false,
  /** Enable narrative display */
  NARRATIVES_ENABLED: false,
  /** Enable WebSocket connection (ALWAYS FALSE) */
  WEBSOCKET_ENABLED: false,
  /** Enable SSE streaming (ALWAYS FALSE) */
  SSE_ENABLED: false,
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Adapter interfaces (interface only, no implementation)
  type CiaSieAdapter,
  type AdapterConfig,
  type AdapterStatus,
  createDarkAdapter,
} from './adapters';

export {
  // Integration hooks (disabled by default)
  type IntegrationHook,
  type IntegrationState,
  useIntegrationStatus,
  useDarkModeGuard,
} from './hooks';

export {
  // Contract stubs (interface only)
  type TelemetryFetcher,
  type SignalFetcher,
  type NarrativeFetcher,
  createNullFetcher,
} from './fetchers';

export {
  // Integration guards
  isIntegrationEnabled,
  assertDarkMode,
  guardedExecution,
} from './guards';
