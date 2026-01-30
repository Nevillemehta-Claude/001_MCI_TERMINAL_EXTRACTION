/**
 * Activation Governance Module - Central Export
 * 
 * LEAP 3: Governed Activation & Irreversibility Control
 * 
 * ⚠️  CRITICAL: THIS MODULE GOVERNS ACTIVATION BUT DOES NOT ACTIVATE
 * ============================================================================
 * 
 * This module provides the complete governance infrastructure for integration
 * activation. It ensures:
 * 
 * 1. Activation can only occur via explicit, traceable authorization
 * 2. All runtime contracts are frozen and sealed
 * 3. Kill-switch can abort activation at any millisecond
 * 4. Activation is fully observable
 * 5. Rollback is provably possible
 * 
 * NOTHING in this module activates integration.
 * EVERYTHING in this module makes activation safe when authorized.
 */

// ============================================================================
// GLOBAL ACTIVATION STATE
// ============================================================================

/**
 * MASTER ACTIVATION LOCK
 * 
 * This is the single source of truth for activation state.
 * It is FALSE and will remain FALSE until Principal authorization.
 */
export const ACTIVATION_LOCKED = true as const;

/**
 * KILL SWITCH STATE
 * 
 * When true, all integration paths are immediately terminated.
 * This is independent of ACTIVATION_LOCKED.
 */
export const KILL_SWITCH_ENGAGED = true as const;

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // SILO 8: Activation Governance
  type ActivationGate,
  type ActivationPreCondition,
  type ActivationAuthorization,
  type ActivationStage,
  ACTIVATION_PRECONDITIONS,
  createActivationGate,
  validatePreconditions,
  generateAuthorizationRecord,
} from './governance';

export {
  // SILO 9: Runtime Boundary Contracts
  type RuntimeContract,
  type ContractViolation,
  type DataFlowDirection,
  RUNTIME_CONTRACTS,
  validateRuntimeContract,
  rejectUnknownFields,
  getContractFingerprint,
} from './contracts';

export {
  // SILO 10: Kill Switch & Abort
  type KillSwitchState,
  type AbortPhase,
  type AbortResult,
  isKillSwitchEngaged,
  engageKillSwitch,
  executeAbort,
  getAbortSemantics,
} from './killSwitch';

export {
  // SILO 11: Activation Observability
  type ActivationBaseline,
  type ActivationMetrics,
  type ObservabilityState,
  captureBaseline,
  getObservabilityState,
  createActivationMetrics,
} from './observability';

export {
  // SILO 12: Rollback Proof
  type RollbackProof,
  type ActivationDiff,
  type RollbackStep,
  generateRollbackProof,
  executeRollback,
  verifyRollbackComplete,
} from './rollback';
