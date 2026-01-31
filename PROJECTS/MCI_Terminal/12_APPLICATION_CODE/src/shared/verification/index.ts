/**
 * Verification Module - Central Export
 * 
 * SILO 6: Gate-7 Verification Machinery
 * 
 * CONSTRAINT: This module provides verification infrastructure that is
 * PRE-WIRED but NOT EXECUTED. Verification runs only when explicitly
 * triggered by authorized test execution.
 * 
 * See: 00_GOVERNANCE/GATE_7_VERIFICATION_PLAN.md
 */

export {
  // Verification types
  type VerificationCategory,
  type VerificationTest,
  type VerificationResult,
  type VerificationSuite,
  type Gate7Certificate,
  
  // Verification registry
  VERIFICATION_CATEGORIES,
  INVARIANT_TESTS,
  
  // Verification utilities (NOT auto-executed)
  createVerificationSuite,
  formatVerificationResult,
  generateGate7Certificate,
} from './gate7';

export {
  // Invariant checkers
  type InvariantCheck,
  type InvariantResult,
  INVARIANT_DEFINITIONS,
  checkInvariant,
  checkAllInvariants,
} from './invariants';

export {
  // Contract validators
  type ContractValidation,
  type ContractValidationResult,
  validateTelemetryContract,
  validateErrorContract,
  validateHealthContract,
} from './contracts';
