/**
 * Gate-7 Verification Machinery
 * 
 * SILO 6: Pre-wired verification infrastructure for integration gate.
 * 
 * CONSTRAINT: This machinery is DEFINED but NOT EXECUTED.
 * All verification functions return structures that describe what
 * WOULD be verified, but do not execute actual tests.
 * 
 * Actual test execution happens only via `npm test` with proper authorization.
 * 
 * See: 00_GOVERNANCE/GATE_7_VERIFICATION_PLAN.md
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Verification category from Gate-7 plan
 */
export type VerificationCategory =
  | 'boundary_sanitization'
  | 'health_state_tracking'
  | 'error_translation'
  | 'deep_health_probes'
  | 'health_visibility_hook'
  | 'engine_status_indicator'
  | 'lifecycle_contamination'
  | 'invariant_regression'
  | 'rollback_verification';

/**
 * Individual verification test
 */
export interface VerificationTest {
  /** Test ID (e.g., BS-001) */
  id: string;
  /** Test description */
  description: string;
  /** Category */
  category: VerificationCategory;
  /** Pass criteria */
  passCriteria: string;
  /** Invariants covered */
  invariantsCovered: string[];
  /** Whether this test is critical (blocks gate) */
  critical: boolean;
}

/**
 * Verification result
 */
export interface VerificationResult {
  test: VerificationTest;
  status: 'pass' | 'fail' | 'skip' | 'error';
  message?: string;
  durationMs?: number;
  timestamp: number;
}

/**
 * Complete verification suite
 */
export interface VerificationSuite {
  name: string;
  description: string;
  categories: VerificationCategory[];
  tests: VerificationTest[];
  createdAt: number;
}

/**
 * Gate-7 Certificate (generated after successful verification)
 */
export interface Gate7Certificate {
  /** Certificate ID */
  id: string;
  /** Verification date */
  date: string;
  /** Total tests */
  totalTests: number;
  /** Passed tests */
  passedTests: number;
  /** Failed tests */
  failedTests: number;
  /** Pass rate */
  passRate: number;
  /** Invariants verified */
  invariantsVerified: string[];
  /** Lifecycle contamination clean */
  lifecycleClean: boolean;
  /** Rollback verified */
  rollbackVerified: boolean;
  /** Gate result */
  gateResult: 'PASS' | 'FAIL';
  /** Execution authorized */
  executionAuthorized: boolean;
}

// ============================================================================
// VERIFICATION CATEGORIES
// ============================================================================

/**
 * All verification categories with metadata
 */
export const VERIFICATION_CATEGORIES: Record<VerificationCategory, {
  name: string;
  description: string;
  testPrefix: string;
  invariants: string[];
}> = {
  boundary_sanitization: {
    name: 'Boundary Sanitization',
    description: 'Verify INV-006 compliance at MCI boundary',
    testPrefix: 'BS',
    invariants: ['INV-006'],
  },
  health_state_tracking: {
    name: 'Health State Tracking',
    description: 'Verify external supervision model',
    testPrefix: 'HS',
    invariants: ['INV-002'],
  },
  error_translation: {
    name: 'Error Translation',
    description: 'Verify CR-003 compliant error handling',
    testPrefix: 'ET',
    invariants: ['INV-005', 'CR-003'],
  },
  deep_health_probes: {
    name: 'Deep Health Probes',
    description: 'Verify health check implementation',
    testPrefix: 'HP',
    invariants: ['INV-002', 'INV-005'],
  },
  health_visibility_hook: {
    name: 'Health Visibility Hook',
    description: 'Verify minimal integration hook',
    testPrefix: 'HV',
    invariants: ['INV-002'],
  },
  engine_status_indicator: {
    name: 'Engine Status Indicator',
    description: 'Verify cockpit display component',
    testPrefix: 'ES',
    invariants: ['CR-003'],
  },
  lifecycle_contamination: {
    name: 'Lifecycle Contamination',
    description: 'Verify no hidden lifecycle coupling',
    testPrefix: 'LC',
    invariants: ['INV-002'],
  },
  invariant_regression: {
    name: 'Invariant Regression',
    description: 'Verify all 6 invariants remain intact',
    testPrefix: 'IR',
    invariants: ['INV-001', 'INV-002', 'INV-003', 'INV-004', 'INV-005', 'INV-006'],
  },
  rollback_verification: {
    name: 'Rollback Verification',
    description: 'Verify rollback procedures work',
    testPrefix: 'RV',
    invariants: [],
  },
};

// ============================================================================
// INVARIANT TESTS (CATALOG)
// ============================================================================

/**
 * Complete catalog of invariant tests.
 * 
 * CONSTRAINT: This is a CATALOG only. Tests are not executed here.
 * Actual tests exist in *.test.ts files.
 */
export const INVARIANT_TESTS: VerificationTest[] = [
  // Boundary Sanitization (BS-*)
  {
    id: 'BS-001',
    description: 'NULL byte in response causes rejection',
    category: 'boundary_sanitization',
    passCriteria: 'Error thrown',
    invariantsCovered: ['INV-006'],
    critical: true,
  },
  {
    id: 'BS-002',
    description: 'Control characters stripped from strings',
    category: 'boundary_sanitization',
    passCriteria: 'Clean output',
    invariantsCovered: ['INV-006'],
    critical: true,
  },
  {
    id: 'BS-003',
    description: 'CRLF normalized to LF',
    category: 'boundary_sanitization',
    passCriteria: 'Consistent line endings',
    invariantsCovered: ['INV-006'],
    critical: false,
  },
  
  // Health State Tracking (HS-*)
  {
    id: 'HS-001',
    description: 'Initial state is UNKNOWN',
    category: 'health_state_tracking',
    passCriteria: 'Status = unknown',
    invariantsCovered: ['INV-002'],
    critical: true,
  },
  {
    id: 'HS-002',
    description: 'Successful check → CONNECTED',
    category: 'health_state_tracking',
    passCriteria: 'Status = connected',
    invariantsCovered: ['INV-002'],
    critical: true,
  },
  {
    id: 'HS-003',
    description: '3 failures → UNHEALTHY',
    category: 'health_state_tracking',
    passCriteria: 'Status = unhealthy',
    invariantsCovered: ['INV-002'],
    critical: true,
  },
  
  // Error Translation (ET-*)
  {
    id: 'ET-001',
    description: 'HTTP 400 → validation error code',
    category: 'error_translation',
    passCriteria: 'Correct mapping',
    invariantsCovered: ['INV-005', 'CR-003'],
    critical: true,
  },
  {
    id: 'ET-002',
    description: 'All errors have WHAT',
    category: 'error_translation',
    passCriteria: 'Non-empty string',
    invariantsCovered: ['CR-003'],
    critical: true,
  },
  {
    id: 'ET-003',
    description: 'All errors have HOW',
    category: 'error_translation',
    passCriteria: 'Non-empty string',
    invariantsCovered: ['CR-003'],
    critical: true,
  },
  
  // Lifecycle Contamination (LC-*)
  {
    id: 'LC-001',
    description: 'No start in health hook',
    category: 'lifecycle_contamination',
    passCriteria: 'grep returns 0',
    invariantsCovered: ['INV-002'],
    critical: true,
  },
  {
    id: 'LC-002',
    description: 'No stop in health hook',
    category: 'lifecycle_contamination',
    passCriteria: 'grep returns 0',
    invariantsCovered: ['INV-002'],
    critical: true,
  },
  {
    id: 'LC-003',
    description: 'No WebSocket in health hook',
    category: 'lifecycle_contamination',
    passCriteria: 'grep returns 0',
    invariantsCovered: ['INV-002'],
    critical: true,
  },
  
  // Invariant Regression (IR-*)
  {
    id: 'IR-001',
    description: 'INV-001: Token store is single source of truth',
    category: 'invariant_regression',
    passCriteria: 'No duplicate stores',
    invariantsCovered: ['INV-001'],
    critical: true,
  },
  {
    id: 'IR-002',
    description: 'INV-002: Lifecycle is deterministic',
    category: 'invariant_regression',
    passCriteria: 'No random behavior',
    invariantsCovered: ['INV-002'],
    critical: true,
  },
  {
    id: 'IR-003',
    description: 'INV-003: Graceful degradation works',
    category: 'invariant_regression',
    passCriteria: 'Features degrade safely',
    invariantsCovered: ['INV-003'],
    critical: true,
  },
  {
    id: 'IR-004',
    description: 'INV-004: State persists correctly',
    category: 'invariant_regression',
    passCriteria: 'Zustand persist works',
    invariantsCovered: ['INV-004'],
    critical: true,
  },
  {
    id: 'IR-005',
    description: 'INV-005: Failures are visible',
    category: 'invariant_regression',
    passCriteria: 'Errors surface to UI',
    invariantsCovered: ['INV-005'],
    critical: true,
  },
  {
    id: 'IR-006',
    description: 'INV-006: Inputs are sanitized',
    category: 'invariant_regression',
    passCriteria: 'Boundary cleaning works',
    invariantsCovered: ['INV-006'],
    critical: true,
  },
  
  // Rollback Verification (RV-*)
  {
    id: 'RV-001',
    description: 'Minimal integration rollback < 60s',
    category: 'rollback_verification',
    passCriteria: '< 60 seconds',
    invariantsCovered: [],
    critical: true,
  },
  {
    id: 'RV-002',
    description: 'Post-rollback tests pass',
    category: 'rollback_verification',
    passCriteria: '100% pass',
    invariantsCovered: [],
    critical: true,
  },
];

// ============================================================================
// VERIFICATION UTILITIES
// ============================================================================

/**
 * Create a verification suite definition.
 * 
 * CONSTRAINT: Creates a DEFINITION only. Does NOT execute tests.
 */
export function createVerificationSuite(
  name: string,
  categories: VerificationCategory[]
): VerificationSuite {
  const tests = INVARIANT_TESTS.filter(t => categories.includes(t.category));
  
  return {
    name,
    description: `Verification suite for ${name}`,
    categories,
    tests,
    createdAt: Date.now(),
  };
}

/**
 * Format verification result for logging.
 */
export function formatVerificationResult(result: VerificationResult): string {
  const status = result.status.toUpperCase();
  const duration = result.durationMs ? `(${result.durationMs}ms)` : '';
  const message = result.message ? `: ${result.message}` : '';
  
  return `[${status}] ${result.test.id}: ${result.test.description} ${duration}${message}`;
}

/**
 * Generate a Gate-7 certificate template.
 * 
 * CONSTRAINT: Generates a TEMPLATE only. Certificate is populated
 * by actual test execution through npm test.
 * 
 * @param executionAuthorized - Whether execution was authorized
 * @returns Certificate template (unfilled if not executed)
 */
export function generateGate7Certificate(
  executionAuthorized: boolean = false
): Gate7Certificate {
  return {
    id: `GATE7-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    totalTests: INVARIANT_TESTS.length,
    passedTests: executionAuthorized ? 0 : -1, // -1 indicates not executed
    failedTests: executionAuthorized ? 0 : -1,
    passRate: executionAuthorized ? 0 : -1,
    invariantsVerified: [],
    lifecycleClean: false,
    rollbackVerified: false,
    gateResult: 'FAIL', // Default to FAIL until proven otherwise
    executionAuthorized,
  };
}

/**
 * Get all tests for a specific invariant.
 */
export function getTestsForInvariant(invariant: string): VerificationTest[] {
  return INVARIANT_TESTS.filter(t => t.invariantsCovered.includes(invariant));
}

/**
 * Get all critical tests.
 */
export function getCriticalTests(): VerificationTest[] {
  return INVARIANT_TESTS.filter(t => t.critical);
}
