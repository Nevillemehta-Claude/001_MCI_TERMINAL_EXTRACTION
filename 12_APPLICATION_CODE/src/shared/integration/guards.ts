/**
 * Integration Guards
 * 
 * SILO 7: Safety guards to prevent accidental integration activation.
 * 
 * CONSTRAINT: Guards BLOCK any integration when DARK_MODE is true.
 * They are the last line of defense against accidental activation.
 */

import { DARK_MODE, INTEGRATION_FLAGS } from './index';

// ============================================================================
// GUARD FUNCTIONS
// ============================================================================

/**
 * Check if any integration is enabled.
 * 
 * CONSTRAINT: Returns false when DARK_MODE is true.
 * 
 * @returns false when DARK_MODE is true (always in production)
 */
export function isIntegrationEnabled(): boolean {
  if (DARK_MODE) {
    return false;
  }
  
  // Check if any integration flag is enabled
  return Object.values(INTEGRATION_FLAGS).some(v => v === true);
}

/**
 * Assert that dark mode is active.
 * 
 * CONSTRAINT: Throws if DARK_MODE is false.
 * Use this at critical integration points.
 * 
 * @throws Error if DARK_MODE is false
 */
export function assertDarkMode(): void {
  if (!DARK_MODE) {
    const error = new Error(
      '[SECURITY] Dark mode is disabled. Integration is active without authorization.'
    );
    console.error(error);
    throw error;
  }
}

/**
 * Guard a function to only execute when integration is enabled.
 * 
 * CONSTRAINT: When DARK_MODE is true, returns null/empty result.
 * 
 * @param fn - Function to guard
 * @param fallback - Fallback value when disabled
 * @returns Guarded function
 */
export function guardedExecution<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  fallback: T
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    if (DARK_MODE) {
      console.debug('[GuardedExecution] Returning fallback due to DARK_MODE');
      return fallback;
    }
    
    // This branch is unreachable when DARK_MODE = true
    return fn(...args);
  };
}

/**
 * Guard a synchronous function.
 * 
 * @param fn - Function to guard
 * @param fallback - Fallback value when disabled
 * @returns Guarded function
 */
export function guardedSync<T, Args extends unknown[]>(
  fn: (...args: Args) => T,
  fallback: T
): (...args: Args) => T {
  return (...args: Args): T => {
    if (DARK_MODE) {
      return fallback;
    }
    return fn(...args);
  };
}

/**
 * Create a guard that logs attempts to access disabled features.
 * 
 * @param featureName - Name of the feature
 * @returns Guard function
 */
export function createFeatureGuard(featureName: string): () => boolean {
  return (): boolean => {
    const enabled = !DARK_MODE && isIntegrationEnabled();
    
    if (!enabled) {
      console.debug(
        `[FeatureGuard] Feature '${featureName}' is disabled (DARK_MODE: ${DARK_MODE})`
      );
    }
    
    return enabled;
  };
}

// ============================================================================
// PRE-BUILT GUARDS
// ============================================================================

/**
 * Guard for telemetry features.
 */
export const telemetryGuard = createFeatureGuard('telemetry');

/**
 * Guard for signal features.
 */
export const signalGuard = createFeatureGuard('signals');

/**
 * Guard for narrative features.
 */
export const narrativeGuard = createFeatureGuard('narratives');

/**
 * Guard for WebSocket features.
 * 
 * CONSTRAINT: ALWAYS returns false. WebSocket is NEVER enabled.
 */
export function websocketGuard(): boolean {
  // WebSocket is NEVER enabled in this phase
  return false;
}

/**
 * Guard for SSE features.
 * 
 * CONSTRAINT: ALWAYS returns false. SSE is NEVER enabled.
 */
export function sseGuard(): boolean {
  // SSE is NEVER enabled in this phase
  return false;
}

// ============================================================================
// INTEGRATION STATUS
// ============================================================================

/**
 * Get a summary of integration status for debugging.
 * 
 * @returns Status summary object
 */
export function getIntegrationStatus(): {
  darkMode: boolean;
  integrationEnabled: boolean;
  flags: typeof INTEGRATION_FLAGS;
  message: string;
} {
  return {
    darkMode: DARK_MODE,
    integrationEnabled: isIntegrationEnabled(),
    flags: INTEGRATION_FLAGS,
    message: DARK_MODE
      ? 'Integration is disabled (DARK_MODE = true)'
      : 'WARNING: Integration may be enabled',
  };
}
