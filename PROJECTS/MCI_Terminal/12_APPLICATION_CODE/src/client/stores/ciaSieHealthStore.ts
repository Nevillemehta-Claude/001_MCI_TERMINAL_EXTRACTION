/**
 * CIA-SIE-PURE Health State Store
 * 
 * BLOCK-002 Resolution + SILO 3 Enhancement: Engine State Handshake Model
 * 
 * This store tracks the availability of CIA-SIE-PURE for truthful cockpit display.
 * MCI does NOT restart CIA-SIE-PURE — it only DETECTS and REPORTS unavailability.
 * 
 * SILO 3: ENGINE STATE HANDSHAKE MODEL
 * =====================================
 * MCI OBSERVES CIA-SIE-PURE state. MCI does NOT CONTROL CIA-SIE-PURE lifecycle.
 * 
 * Allowed Signals (OBSERVE-ONLY):
 * - health_check_success → Update status to CONNECTED
 * - health_check_failure → Update status to DISCONNECTED
 * - subsystem_degraded → Update specific feature availability
 * - latency_measured → Track and display latency
 * 
 * Forbidden Signals (NO CONTROL):
 * - start_engine ❌
 * - stop_engine ❌
 * - restart_engine ❌
 * - pause_engine ❌
 * - resume_engine ❌
 * 
 * EXTERNAL SUPERVISION REQUIREMENT:
 * CIA-SIE-PURE MUST be deployed with external process supervision:
 * - Docker with restart policy: `restart: unless-stopped`
 * - systemd with `Restart=on-failure`
 * - Kubernetes with `restartPolicy: Always`
 * 
 * MCI SHALL NOT implement restart authority.
 * 
 * See: 00_GOVERNANCE/ENGINE_STATE_HANDSHAKE_MODEL.md
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Health status for individual subsystems
 */
export type SubsystemHealth = 'healthy' | 'unhealthy' | 'unknown';

/**
 * Overall health status
 */
export type OverallHealth = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

/**
 * Detailed health status for CIA-SIE-PURE subsystems
 */
export interface CiaSieSubsystemHealth {
  /** FastAPI process responding */
  process: SubsystemHealth;
  /** Database accessible */
  database: SubsystemHealth;
  /** AI service configured and accessible */
  ai: SubsystemHealth;
  /** Webhook subsystem operational */
  webhook: SubsystemHealth;
}

/**
 * Complete CIA-SIE-PURE health state
 */
export interface CiaSieHealthState {
  /** Overall health status */
  overall: OverallHealth;
  /** Individual subsystem health */
  subsystems: CiaSieSubsystemHealth;
  /** Timestamp of last successful health check */
  lastCheckAt: number | null;
  /** Timestamp of last failure */
  lastFailureAt: number | null;
  /** Whether a health check is currently in progress */
  isChecking: boolean;
  /** Error message from last failed check */
  lastError: string | null;
  /** Consecutive failure count */
  consecutiveFailures: number;
  /** Whether MCI is operating in degraded mode due to CIA-SIE-PURE */
  isDegradedMode: boolean;
}

/**
 * Store actions
 */
export interface CiaSieHealthActions {
  /** Update health state from a health check result */
  updateHealth: (health: Partial<CiaSieSubsystemHealth>) => void;
  /** Mark a health check as started */
  startCheck: () => void;
  /** Mark a health check as completed successfully */
  completeCheck: (subsystems: CiaSieSubsystemHealth) => void;
  /** Mark a health check as failed */
  failCheck: (error: string) => void;
  /** Reset health state to unknown */
  reset: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialSubsystems: CiaSieSubsystemHealth = {
  process: 'unknown',
  database: 'unknown',
  ai: 'unknown',
  webhook: 'unknown',
};

const initialState: CiaSieHealthState = {
  overall: 'unknown',
  subsystems: initialSubsystems,
  lastCheckAt: null,
  lastFailureAt: null,
  isChecking: false,
  lastError: null,
  consecutiveFailures: 0,
  isDegradedMode: false,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate overall health from subsystem health.
 * 
 * Rules:
 * - If process is unhealthy → overall is unhealthy
 * - If any other subsystem is unhealthy → overall is degraded
 * - If all subsystems are healthy → overall is healthy
 * - If any subsystem is unknown → overall is unknown (until verified)
 */
function calculateOverallHealth(subsystems: CiaSieSubsystemHealth): OverallHealth {
  // Process unhealthy = completely unavailable
  if (subsystems.process === 'unhealthy') {
    return 'unhealthy';
  }
  
  // Process unknown = we don't know yet
  if (subsystems.process === 'unknown') {
    return 'unknown';
  }
  
  // Check for any unhealthy subsystem (degraded mode)
  const otherSubsystems = [subsystems.database, subsystems.ai, subsystems.webhook];
  if (otherSubsystems.some(s => s === 'unhealthy')) {
    return 'degraded';
  }
  
  // Check for any unknown subsystem
  if (otherSubsystems.some(s => s === 'unknown')) {
    return 'unknown';
  }
  
  return 'healthy';
}

/**
 * Determine if MCI should operate in degraded mode.
 * 
 * Degraded mode means CIA-SIE-PURE dependent features are disabled
 * but MCI continues to function with local features.
 */
function shouldEnterDegradedMode(overall: OverallHealth): boolean {
  return overall === 'degraded' || overall === 'unhealthy';
}

// ============================================================================
// STORE DEFINITION
// ============================================================================

export const useCiaSieHealthStore = create<CiaSieHealthState & CiaSieHealthActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      updateHealth: (health) => {
        set((state) => {
          const newSubsystems = { ...state.subsystems, ...health };
          const overall = calculateOverallHealth(newSubsystems);
          return {
            subsystems: newSubsystems,
            overall,
            isDegradedMode: shouldEnterDegradedMode(overall),
          };
        });
      },

      startCheck: () => {
        set({ isChecking: true });
      },

      completeCheck: (subsystems) => {
        const overall = calculateOverallHealth(subsystems);
        set({
          subsystems,
          overall,
          lastCheckAt: Date.now(),
          isChecking: false,
          lastError: null,
          consecutiveFailures: 0,
          isDegradedMode: shouldEnterDegradedMode(overall),
        });
      },

      failCheck: (error) => {
        set((state) => {
          const newFailures = state.consecutiveFailures + 1;
          // After 3 consecutive failures, mark process as unhealthy
          const processHealth: SubsystemHealth = newFailures >= 3 ? 'unhealthy' : 'unknown';
          const newSubsystems = {
            ...state.subsystems,
            process: processHealth,
          };
          const overall = calculateOverallHealth(newSubsystems);
          
          return {
            subsystems: newSubsystems,
            overall,
            lastFailureAt: Date.now(),
            isChecking: false,
            lastError: error,
            consecutiveFailures: newFailures,
            isDegradedMode: shouldEnterDegradedMode(overall),
          };
        });
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: 'cia-sie-health-store' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

/**
 * Select whether CIA-SIE-PURE is available for operations
 */
export const selectCiaSieAvailable = (state: CiaSieHealthState): boolean => {
  return state.overall === 'healthy' || state.overall === 'degraded';
};

/**
 * Select whether specific features are available based on subsystem health
 */
export const selectFeatureAvailability = (state: CiaSieHealthState) => ({
  signals: state.subsystems.database === 'healthy',
  narratives: state.subsystems.ai === 'healthy',
  webhooks: state.subsystems.webhook === 'healthy',
  any: state.subsystems.process === 'healthy',
});

/**
 * Select human-readable status message for cockpit display
 */
export const selectStatusMessage = (state: CiaSieHealthState): string => {
  switch (state.overall) {
    case 'healthy':
      return 'CIA-SIE-PURE operational';
    case 'degraded':
      const degradedServices: string[] = [];
      if (state.subsystems.database === 'unhealthy') degradedServices.push('database');
      if (state.subsystems.ai === 'unhealthy') degradedServices.push('AI');
      if (state.subsystems.webhook === 'unhealthy') degradedServices.push('webhooks');
      return `CIA-SIE-PURE degraded: ${degradedServices.join(', ')} unavailable`;
    case 'unhealthy':
      return 'CIA-SIE-PURE unavailable';
    case 'unknown':
    default:
      return 'CIA-SIE-PURE status unknown';
  }
};

// ============================================================================
// SILO 3: ENGINE STATE OBSERVATION TYPES
// ============================================================================

import type { 
  CiaSieEngineStatus, 
  CiaSieLatencyStatus, 
  CiaSieEngineObservation 
} from '../../shared/types';

/**
 * SILO 3: Convert internal health state to engine observation format.
 * This provides the canonical observation type for cockpit display.
 * 
 * CONSTRAINT: This function OBSERVES state. It does NOT CONTROL lifecycle.
 */
export function toEngineObservation(state: CiaSieHealthState): CiaSieEngineObservation {
  // Map overall health to engine status
  const statusMap: Record<OverallHealth, CiaSieEngineStatus> = {
    healthy: 'connected',
    degraded: 'degraded',
    unhealthy: 'disconnected',
    unknown: 'unknown',
  };
  
  const status: CiaSieEngineStatus = state.isChecking 
    ? 'checking' 
    : statusMap[state.overall];
  
  // Calculate latency status
  const latencyMs = state.lastCheckAt 
    ? Date.now() - state.lastCheckAt 
    : null;
  
  let latencyStatus: CiaSieLatencyStatus;
  if (latencyMs === null) {
    latencyStatus = 'timeout';
  } else if (latencyMs <= 100) {
    latencyStatus = 'ok';
  } else if (latencyMs <= 500) {
    latencyStatus = 'warn';
  } else if (latencyMs <= 2000) {
    latencyStatus = 'slow';
  } else {
    latencyStatus = 'fail';
  }
  
  // Generate status message
  let statusMessage: string;
  switch (status) {
    case 'connected':
      statusMessage = 'CIA-SIE-PURE is reachable.';
      break;
    case 'degraded':
      const degraded: string[] = [];
      if (state.subsystems.database === 'unhealthy') degraded.push('database');
      if (state.subsystems.ai === 'unhealthy') degraded.push('AI');
      if (state.subsystems.webhook === 'unhealthy') degraded.push('webhooks');
      statusMessage = `CIA-SIE-PURE is partially available. ${degraded.join(', ')} unavailable.`;
      break;
    case 'disconnected':
      statusMessage = state.lastCheckAt
        ? `CIA-SIE-PURE is not responding. Last seen: ${new Date(state.lastCheckAt).toLocaleTimeString()}`
        : 'CIA-SIE-PURE is not responding.';
      break;
    case 'checking':
      statusMessage = 'Checking CIA-SIE-PURE status...';
      break;
    case 'unknown':
    default:
      statusMessage = 'CIA-SIE-PURE status unknown.';
  }
  
  return {
    status,
    lastSeenAt: state.lastCheckAt,
    latencyMs,
    latencyStatus,
    consecutiveFailures: state.consecutiveFailures,
    isDegradedMode: state.isDegradedMode,
    statusMessage,
    subsystems: {
      process: state.subsystems.process === 'healthy',
      database: state.subsystems.database === 'healthy',
      ai: state.subsystems.ai === 'healthy',
      webhook: state.subsystems.webhook === 'healthy',
    },
  };
}

/**
 * SILO 3: Selector to get engine observation from store state.
 */
export const selectEngineObservation = (state: CiaSieHealthState): CiaSieEngineObservation => {
  return toEngineObservation(state);
};

// ============================================================================
// SILO 3: STATE TRANSITION LOGGING
// ============================================================================

/**
 * Log format for state transitions.
 * Used for observability and debugging.
 */
export interface EngineStateTransition {
  from: CiaSieEngineStatus;
  to: CiaSieEngineStatus;
  trigger: 'health_check_success' | 'health_check_failure' | 'subsystem_change' | 'manual_reset';
  timestamp: number;
  details?: Record<string, unknown>;
}

/**
 * Format a state transition for logging.
 */
export function formatStateTransition(transition: EngineStateTransition): string {
  const timestamp = new Date(transition.timestamp).toISOString();
  return `[ENGINE] ${timestamp} | ${transition.from} → ${transition.to} | Trigger: ${transition.trigger}`;
}

export default useCiaSieHealthStore;
