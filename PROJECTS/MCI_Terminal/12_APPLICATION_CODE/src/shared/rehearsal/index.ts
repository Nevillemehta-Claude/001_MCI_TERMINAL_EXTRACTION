/**
 * Rehearsal Module - Central Export
 * 
 * LEAP 4: Governed Activation Rehearsal & Live-Readiness Certification
 * 
 * ⚠️  THIS MODULE EXERCISES ACTIVATION WITHOUT ENABLING IT
 * ============================================================================
 * 
 * This module provides complete rehearsal infrastructure that:
 * 
 * 1. Exercises every activation pathway (SILO 13)
 * 2. Stress-tests abort and rollback (SILO 14)
 * 3. Simulates contract violations (SILO 15)
 * 4. Validates indicator truthfulness (SILO 16)
 * 5. Certifies live-readiness (SILO 17)
 * 
 * NOTHING in this module enables live integration.
 * EVERYTHING in this module proves the system works.
 */

// ============================================================================
// REHEARSAL MODE FLAG
// ============================================================================

/**
 * REHEARSAL_MODE: When true, activation gates can be exercised
 * without actually enabling integration.
 */
export const REHEARSAL_MODE = true as const;

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // SILO 13: Activation Rehearsal
  type RehearsalResult,
  type RehearsalStep,
  type ActivationRehearsalReport,
  executeActivationRehearsal,
  verifySystemUnchanged,
} from './activationRehearsal';

export {
  // SILO 14: Abort & Rollback Stress
  type AbortStressResult,
  type RollbackStressResult,
  type StressReport,
  executeAbortStress,
  executeRollbackStress,
  measureRollbackTime,
  verifyZeroResidue,
} from './abortStress';

export {
  // SILO 15: Contract Violation Simulation
  type ViolationSimulation,
  type ViolationResult,
  type ImmunityProof,
  simulateMalformedSchema,
  simulateUnknownEnum,
  simulateForbiddenField,
  simulateTimingAnomaly,
  generateImmunityProof,
} from './contractViolation';

export {
  // SILO 16: Observability Certification
  type IndicatorState,
  type TruthCertification,
  exerciseIndicators,
  verifyCockpitTruth,
  checkNoFalseReadiness,
  checkNoSilentFailure,
} from './observabilityCertification';

export {
  // SILO 17: Live-Readiness Certification
  type ReadinessMatrix,
  type ReadinessCertificate,
  generateReadinessMatrix,
  signActivationChecklist,
  signRollbackChecklist,
  generateLiveReadinessCertificate,
} from './liveReadiness';
