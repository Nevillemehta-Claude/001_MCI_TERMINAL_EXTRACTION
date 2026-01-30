/**
 * Dark Integration Adapters
 * 
 * SILO 7: Adapter interfaces for CIA-SIE-PURE integration.
 * 
 * CONSTRAINT: All adapters are DISABLED by default.
 * The `createDarkAdapter` factory returns a no-op adapter.
 */

import { DARK_MODE, INTEGRATION_FLAGS } from './index';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Adapter status
 */
export type AdapterStatus = 
  | 'disabled'    // Dark mode, adapter is off
  | 'initializing' // Starting up
  | 'connected'   // Active connection
  | 'disconnected' // Lost connection
  | 'error';      // Error state

/**
 * Adapter configuration
 */
export interface AdapterConfig {
  /** Base URL for CIA-SIE-PURE */
  baseUrl: string;
  /** Request timeout in ms */
  timeoutMs: number;
  /** Health check interval in ms */
  healthCheckIntervalMs: number;
  /** Enable debug logging */
  debug: boolean;
}

/**
 * CIA-SIE-PURE adapter interface.
 * 
 * This interface defines the contract for CIA-SIE-PURE communication.
 * Implementations are provided but DISABLED by default.
 */
export interface CiaSieAdapter {
  /** Get current adapter status */
  getStatus(): AdapterStatus;
  
  /** Check if adapter is enabled */
  isEnabled(): boolean;
  
  /** Initialize adapter (no-op if disabled) */
  initialize(): Promise<void>;
  
  /** Shutdown adapter */
  shutdown(): Promise<void>;
  
  /** Perform health check */
  healthCheck(): Promise<{ healthy: boolean; latencyMs: number }>;
  
  /** Get configuration */
  getConfig(): AdapterConfig;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

/**
 * Default adapter configuration.
 * 
 * These values are only used when integration is enabled,
 * which is NEVER by default.
 */
export const DEFAULT_ADAPTER_CONFIG: AdapterConfig = {
  baseUrl: 'http://localhost:8000',
  timeoutMs: 5000,
  healthCheckIntervalMs: 10000,
  debug: false,
};

// ============================================================================
// DARK ADAPTER IMPLEMENTATION
// ============================================================================

/**
 * Dark (disabled) adapter implementation.
 * 
 * This adapter does NOTHING. It always reports as disabled.
 * This is the default adapter when DARK_MODE is true.
 */
class DarkAdapter implements CiaSieAdapter {
  private config: AdapterConfig;

  constructor(config: Partial<AdapterConfig> = {}) {
    this.config = { ...DEFAULT_ADAPTER_CONFIG, ...config };
  }

  getStatus(): AdapterStatus {
    return 'disabled';
  }

  isEnabled(): boolean {
    return false;
  }

  async initialize(): Promise<void> {
    // No-op: Dark mode adapter does nothing
    console.debug('[DarkAdapter] Initialize called but adapter is disabled');
  }

  async shutdown(): Promise<void> {
    // No-op: Nothing to shut down
    console.debug('[DarkAdapter] Shutdown called but adapter is disabled');
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    // Dark mode: Always return unhealthy (not connected)
    return { healthy: false, latencyMs: 0 };
  }

  getConfig(): AdapterConfig {
    return this.config;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a dark (disabled) adapter.
 * 
 * CONSTRAINT: This ALWAYS returns a disabled adapter when DARK_MODE is true.
 * There is no way to get an active adapter without modifying DARK_MODE.
 * 
 * @param config - Optional configuration (ignored in dark mode)
 * @returns Disabled adapter
 */
export function createDarkAdapter(
  config: Partial<AdapterConfig> = {}
): CiaSieAdapter {
  if (!DARK_MODE) {
    // This branch is unreachable when DARK_MODE = true (as const)
    console.warn('[Integration] DARK_MODE is disabled - this should not happen!');
  }
  
  return new DarkAdapter(config);
}

/**
 * Type guard to check if integration is truly enabled.
 * 
 * CONSTRAINT: Returns false when DARK_MODE is true.
 */
export function isAdapterEnabled(): boolean {
  return !DARK_MODE && INTEGRATION_FLAGS.HEALTH_POLLING_ENABLED;
}
