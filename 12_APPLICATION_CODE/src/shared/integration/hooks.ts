/**
 * Dark Integration Hooks
 * 
 * SILO 7: React hooks for integration status (disabled by default).
 * 
 * CONSTRAINT: All hooks return "disabled" state when DARK_MODE is true.
 */

import { DARK_MODE, INTEGRATION_FLAGS } from './index';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Integration hook interface
 */
export interface IntegrationHook<T> {
  /** Current data (null when disabled) */
  data: T | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether integration is enabled */
  isEnabled: boolean;
  /** Refresh function (no-op when disabled) */
  refresh: () => void;
}

/**
 * Integration state
 */
export interface IntegrationState {
  /** Overall integration status */
  status: 'disabled' | 'enabled' | 'error';
  /** Which features are enabled */
  features: {
    healthPolling: boolean;
    telemetry: boolean;
    signals: boolean;
    narratives: boolean;
  };
  /** Dark mode flag */
  darkMode: boolean;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to get integration status.
 * 
 * CONSTRAINT: Always returns disabled state when DARK_MODE is true.
 * 
 * Usage:
 * ```typescript
 * const { status, features, darkMode } = useIntegrationStatus();
 * if (status === 'disabled') {
 *   // Show simulation mode
 * }
 * ```
 */
export function useIntegrationStatus(): IntegrationState {
  // DARK_MODE is a compile-time constant (true)
  // This function always returns disabled state
  
  return {
    status: DARK_MODE ? 'disabled' : 'enabled',
    features: {
      healthPolling: !DARK_MODE && INTEGRATION_FLAGS.HEALTH_POLLING_ENABLED,
      telemetry: !DARK_MODE && INTEGRATION_FLAGS.TELEMETRY_ENABLED,
      signals: !DARK_MODE && INTEGRATION_FLAGS.SIGNALS_ENABLED,
      narratives: !DARK_MODE && INTEGRATION_FLAGS.NARRATIVES_ENABLED,
    },
    darkMode: DARK_MODE,
  };
}

/**
 * Hook to guard against accidental integration activation.
 * 
 * CONSTRAINT: Throws if DARK_MODE is somehow false.
 * This is a safety mechanism.
 * 
 * Usage:
 * ```typescript
 * function MyComponent() {
 *   useDarkModeGuard(); // Throws if integration is accidentally enabled
 *   // ... rest of component
 * }
 * ```
 */
export function useDarkModeGuard(): void {
  if (!DARK_MODE) {
    console.error('[INTEGRATION GUARD] DARK_MODE is false - integration is active!');
    // In development, this would throw
    // In production, we just log
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        'Integration is enabled without authorization. ' +
        'Set DARK_MODE = true in src/shared/integration/index.ts'
      );
    }
  }
}

/**
 * Create a disabled integration hook.
 * 
 * CONSTRAINT: Returns a hook that always reports disabled state.
 * 
 * @returns Hook that returns disabled state
 */
export function createDisabledHook<T>(): () => IntegrationHook<T> {
  return () => ({
    data: null,
    isLoading: false,
    error: null,
    isEnabled: false,
    refresh: () => {
      console.debug('[DisabledHook] Refresh called but integration is disabled');
    },
  });
}

/**
 * Hook factory that respects dark mode.
 * 
 * CONSTRAINT: When DARK_MODE is true, returns disabled hook.
 * 
 * @param enabledHook - Hook to use when integration is enabled
 * @returns Disabled hook (always, when DARK_MODE = true)
 */
export function createGuardedHook<T>(
  enabledHook: () => IntegrationHook<T>
): () => IntegrationHook<T> {
  return () => {
    if (DARK_MODE) {
      return {
        data: null,
        isLoading: false,
        error: null,
        isEnabled: false,
        refresh: () => {},
      };
    }
    
    // This branch is unreachable when DARK_MODE = true
    return enabledHook();
  };
}
