/**
 * Live Activation Module - Central Export
 * 
 * LEAP 5: Authorized Live Activation & Operational Assumption
 * 
 * ⚠️  THIS MODULE TRANSITIONS THE SYSTEM FROM READINESS TO LIVE
 * ============================================================================
 * 
 * This module provides the complete live activation infrastructure:
 * 
 * PHASE A: Executive Unlock (activatable, not active)
 * PHASE B: Live Connectivity Enablement (health checks only)
 * PHASE C: Controlled Data Ignition (telemetry under governance)
 * PHASE D: Operator Truth Confirmation (cockpit verification)
 * PHASE E: Operational Assumption (live with governance)
 * 
 * CONSTRAINTS:
 * - Kill-switch supremacy remains absolute
 * - Abort must dominate at every millisecond
 * - Rollback must remain < 60 seconds
 * - No invariant weakening
 * - Cockpit truth is sacred
 */

// ============================================================================
// LIVE STATE FLAGS (Mutable Runtime State)
// ============================================================================

/**
 * Central live state object.
 * This is mutable at runtime under governance.
 */
export const LIVE_STATE = {
  /** ACTIVATION STATE - Controlled by PHASE A */
  ACTIVATION_UNLOCKED: false,
  
  /** CONNECTIVITY STATE - Controlled by PHASE B */
  LIVE_CONNECTIVITY_ENABLED: false,
  
  /** DATA FLOW STATE - Controlled by PHASE C */
  DATA_FLOW_ENABLED: false,
  
  /** OPERATIONAL STATE - Controlled by PHASE E */
  OPERATIONALLY_LIVE: false,
};

// Legacy exports for backward compatibility
export const ACTIVATION_UNLOCKED = false;
export const LIVE_CONNECTIVITY_ENABLED = false;
export const DATA_FLOW_ENABLED = false;
export const OPERATIONALLY_LIVE = false;

/**
 * Reset all live state (for testing).
 */
export function resetLiveState(): void {
  LIVE_STATE.ACTIVATION_UNLOCKED = false;
  LIVE_STATE.LIVE_CONNECTIVITY_ENABLED = false;
  LIVE_STATE.DATA_FLOW_ENABLED = false;
  LIVE_STATE.OPERATIONALLY_LIVE = false;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // PHASE A: Executive Unlock
  type ExecutiveUnlockResult,
  type PreActivationBaseline,
  executePhaseA,
  capturePreActivationBaseline,
  generateAuthorizationFingerprint,
} from './phaseA';

export {
  // PHASE B: Live Connectivity
  type ConnectivityCheckResult,
  type LiveHealthStatus,
  executePhaseB,
  performLiveHealthCheck,
  classifyLiveLatency,
} from './phaseB';

export {
  // PHASE C: Controlled Data Ignition
  type DataIgnitionResult,
  type TelemetryIngestionState,
  executePhaseC,
  enableTelemetryIngestion,
  enforceContractImmunity,
} from './phaseC';

export {
  // PHASE D: Operator Truth Confirmation
  type TruthConfirmationResult,
  type LiveTruthReport,
  executePhaseD,
  confirmOperatorTruth,
  verifyNoFalseReadiness,
} from './phaseD';

export {
  // PHASE E: Operational Assumption
  type OperationalAssumptionResult,
  type LiveOperationalCertificate,
  executePhaseE,
  assumeOperationalState,
  generateLiveOperationalCertificate,
} from './phaseE';

export {
  // Full LEAP 5 Orchestration
  type Leap5ExecutionResult,
  type PhaseStatus,
  executeLeap5,
  getLeap5Status,
  abortLeap5,
} from './orchestrator';
