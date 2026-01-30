/**
 * Invariant Definitions and Checkers
 * 
 * SILO 6: Codified invariant definitions for verification.
 * 
 * CONSTRAINT: These checkers DESCRIBE invariants but do not
 * enforce them at runtime. Enforcement is through tests.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Invariant check definition
 */
export interface InvariantCheck {
  /** Invariant ID (e.g., INV-001) */
  id: string;
  /** Human-readable name */
  name: string;
  /** Full description */
  description: string;
  /** How to verify */
  verificationMethod: string;
  /** What constitutes a violation */
  violationCriteria: string;
  /** Severity of violation */
  severity: 'critical' | 'high' | 'medium';
}

/**
 * Result of invariant check
 */
export interface InvariantResult {
  invariant: InvariantCheck;
  passed: boolean;
  message: string;
  evidence?: Record<string, unknown>;
  checkedAt: number;
}

// ============================================================================
// INVARIANT DEFINITIONS
// ============================================================================

/**
 * Complete invariant definitions from MCI governance.
 */
export const INVARIANT_DEFINITIONS: InvariantCheck[] = [
  {
    id: 'INV-001',
    name: 'Single Source of Truth',
    description: 'Token store is the single source of truth for authentication state',
    verificationMethod: 'Verify no duplicate token storage exists across codebase',
    violationCriteria: 'Any token stored outside tokenStore.ts',
    severity: 'critical',
  },
  {
    id: 'INV-002',
    name: 'System Lifecycle Discipline',
    description: 'System lifecycle transitions are deterministic and observable',
    verificationMethod: 'Verify state machine transitions follow defined rules',
    violationCriteria: 'Random or unpredictable state transitions',
    severity: 'critical',
  },
  {
    id: 'INV-003',
    name: 'Graceful Degradation',
    description: 'System degrades gracefully when dependencies fail',
    verificationMethod: 'Verify features disable cleanly without cascade failure',
    violationCriteria: 'Cascade failures or unhandled exceptions',
    severity: 'high',
  },
  {
    id: 'INV-004',
    name: 'State Persistence',
    description: 'Critical state persists across sessions',
    verificationMethod: 'Verify Zustand persist middleware is configured',
    violationCriteria: 'State lost on page refresh',
    severity: 'medium',
  },
  {
    id: 'INV-005',
    name: 'Failure Visibility',
    description: 'All failures are visible to users and operators',
    verificationMethod: 'Verify errors surface to UI with WHAT/WHY/HOW',
    violationCriteria: 'Silent failures or swallowed exceptions',
    severity: 'critical',
  },
  {
    id: 'INV-006',
    name: 'Input Sanitization',
    description: 'All external inputs are sanitized at MCI boundary',
    verificationMethod: 'Verify boundary cleaning for all external data',
    violationCriteria: 'Unsanitized data reaching UI or stores',
    severity: 'critical',
  },
];

// ============================================================================
// INVARIANT CHECKERS
// ============================================================================

/**
 * Check a specific invariant.
 * 
 * CONSTRAINT: This is a DECLARATIVE check that describes what to verify.
 * Actual verification happens in tests.
 * 
 * @param invariantId - ID of invariant to check
 * @returns Invariant result (always pending in declarative mode)
 */
export function checkInvariant(invariantId: string): InvariantResult {
  const invariant = INVARIANT_DEFINITIONS.find(i => i.id === invariantId);
  
  if (!invariant) {
    throw new Error(`Unknown invariant: ${invariantId}`);
  }
  
  // In declarative mode, we return a pending result
  return {
    invariant,
    passed: false, // Unknown until verified
    message: `Invariant ${invariantId} requires verification via test suite`,
    checkedAt: Date.now(),
  };
}

/**
 * Check all invariants.
 * 
 * CONSTRAINT: Returns pending results. Actual checks happen in tests.
 */
export function checkAllInvariants(): InvariantResult[] {
  return INVARIANT_DEFINITIONS.map(invariant => ({
    invariant,
    passed: false,
    message: `Invariant ${invariant.id} requires verification via test suite`,
    checkedAt: Date.now(),
  }));
}

/**
 * Get invariant by ID.
 */
export function getInvariant(id: string): InvariantCheck | undefined {
  return INVARIANT_DEFINITIONS.find(i => i.id === id);
}

/**
 * Get all critical invariants.
 */
export function getCriticalInvariants(): InvariantCheck[] {
  return INVARIANT_DEFINITIONS.filter(i => i.severity === 'critical');
}

/**
 * Format invariant for display.
 */
export function formatInvariant(invariant: InvariantCheck): string {
  return `[${invariant.id}] ${invariant.name}: ${invariant.description}`;
}
