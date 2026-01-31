/**
 * Activation Governance & Authorization Lock
 * 
 * SILO 8: Ensures integration can only activate via explicit,
 * traceable, irreversible authorization.
 * 
 * CONSTRAINT: This module GOVERNS activation but DOES NOT activate.
 */

import { ACTIVATION_LOCKED } from './index';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Activation stages (multi-stage confirmation)
 */
export type ActivationStage = 
  | 'locked'           // Default: Activation not possible
  | 'intent_declared'  // Stage 1: Intent to activate declared
  | 'readiness_confirmed' // Stage 2: Readiness verified
  | 'executing'        // Stage 3: Activation in progress
  | 'active'           // Stage 4: Integration active
  | 'aborting'         // Abort in progress
  | 'rolled_back';     // Rolled back to safe state

/**
 * Pre-condition for activation
 */
export interface ActivationPreCondition {
  /** Condition ID */
  id: string;
  /** Human-readable description */
  description: string;
  /** Category */
  category: 'safety' | 'readiness' | 'authorization' | 'verification';
  /** Whether this is blocking */
  blocking: boolean;
  /** Verification function (returns true if satisfied) */
  verify: () => boolean | Promise<boolean>;
}

/**
 * Authorization record (human-readable + machine-verifiable)
 */
export interface ActivationAuthorization {
  /** Authorization ID */
  id: string;
  /** Timestamp of authorization */
  timestamp: number;
  /** ISO date string */
  date: string;
  /** Principal identifier */
  principal: string;
  /** Authorization type */
  type: 'intent' | 'readiness' | 'execute';
  /** Pre-conditions verified */
  preconditionsVerified: string[];
  /** Pre-conditions failed */
  preconditionsFailed: string[];
  /** Authorization hash (for verification) */
  hash: string;
  /** Human-readable summary */
  summary: string;
  /** Whether authorization is valid */
  valid: boolean;
}

/**
 * Activation Gate - Central control point
 */
export interface ActivationGate {
  /** Current stage */
  stage: ActivationStage;
  /** Whether gate is locked */
  locked: boolean;
  /** Pre-conditions */
  preconditions: ActivationPreCondition[];
  /** Authorization records */
  authorizations: ActivationAuthorization[];
  /** Check if activation is possible */
  canActivate(): boolean;
  /** Advance to next stage */
  advanceStage(authorization: ActivationAuthorization): boolean;
  /** Abort activation */
  abort(): void;
  /** Get current status */
  getStatus(): GateStatus;
}

/**
 * Gate status for display
 */
export interface GateStatus {
  stage: ActivationStage;
  locked: boolean;
  preconditionsMet: number;
  preconditionsTotal: number;
  blockersFailed: string[];
  readyToAdvance: boolean;
}

// ============================================================================
// PRE-CONDITIONS CATALOG
// ============================================================================

/**
 * Complete pre-conditions checklist for activation.
 * ALL blocking conditions must be met before activation.
 */
export const ACTIVATION_PRECONDITIONS: ActivationPreCondition[] = [
  // Safety Pre-conditions
  {
    id: 'SAFE-001',
    description: 'ACTIVATION_LOCKED flag is false (requires code change)',
    category: 'safety',
    blocking: true,
    verify: () => !ACTIVATION_LOCKED,
  },
  {
    id: 'SAFE-002',
    description: 'KILL_SWITCH_ENGAGED is false',
    category: 'safety',
    blocking: true,
    verify: () => {
      // Import dynamically to avoid circular dependency
      const { KILL_SWITCH_ENGAGED } = require('./index');
      return !KILL_SWITCH_ENGAGED;
    },
  },
  {
    id: 'SAFE-003',
    description: 'All 6 invariants verified intact',
    category: 'safety',
    blocking: true,
    verify: () => {
      // This would be verified by test suite
      return false; // Default to false until explicitly verified
    },
  },
  
  // Readiness Pre-conditions
  {
    id: 'READY-001',
    description: 'CIA-SIE-PURE health endpoint reachable',
    category: 'readiness',
    blocking: true,
    verify: async () => {
      // Would check health endpoint
      return false; // Default to false
    },
  },
  {
    id: 'READY-002',
    description: 'All subsystems report healthy',
    category: 'readiness',
    blocking: true,
    verify: () => false,
  },
  {
    id: 'READY-003',
    description: 'Latency baseline within acceptable range',
    category: 'readiness',
    blocking: true,
    verify: () => false,
  },
  {
    id: 'READY-004',
    description: 'No active errors in error aggregator',
    category: 'readiness',
    blocking: false, // Warning only
    verify: () => false,
  },
  
  // Authorization Pre-conditions
  {
    id: 'AUTH-001',
    description: 'Principal authorization record exists',
    category: 'authorization',
    blocking: true,
    verify: () => false,
  },
  {
    id: 'AUTH-002',
    description: 'Intent declaration confirmed',
    category: 'authorization',
    blocking: true,
    verify: () => false,
  },
  {
    id: 'AUTH-003',
    description: 'Readiness confirmation received',
    category: 'authorization',
    blocking: true,
    verify: () => false,
  },
  
  // Verification Pre-conditions
  {
    id: 'VERIFY-001',
    description: 'All tests passing (994/994)',
    category: 'verification',
    blocking: true,
    verify: () => false,
  },
  {
    id: 'VERIFY-002',
    description: 'Gate-7 verification complete',
    category: 'verification',
    blocking: true,
    verify: () => false,
  },
  {
    id: 'VERIFY-003',
    description: 'Rollback procedure verified',
    category: 'verification',
    blocking: true,
    verify: () => false,
  },
];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate all pre-conditions.
 * 
 * @returns Validation result with satisfied/failed lists
 */
export async function validatePreconditions(): Promise<{
  allSatisfied: boolean;
  blockersCleared: boolean;
  satisfied: string[];
  failed: string[];
  blockersFailed: string[];
}> {
  const satisfied: string[] = [];
  const failed: string[] = [];
  const blockersFailed: string[] = [];

  for (const condition of ACTIVATION_PRECONDITIONS) {
    try {
      const result = await condition.verify();
      if (result) {
        satisfied.push(condition.id);
      } else {
        failed.push(condition.id);
        if (condition.blocking) {
          blockersFailed.push(condition.id);
        }
      }
    } catch {
      failed.push(condition.id);
      if (condition.blocking) {
        blockersFailed.push(condition.id);
      }
    }
  }

  return {
    allSatisfied: failed.length === 0,
    blockersCleared: blockersFailed.length === 0,
    satisfied,
    failed,
    blockersFailed,
  };
}

/**
 * Generate a simple hash for authorization verification.
 */
function generateHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Generate an authorization record.
 * 
 * @param type - Authorization type
 * @param principal - Principal identifier
 * @param preconditionsVerified - List of verified pre-conditions
 * @param preconditionsFailed - List of failed pre-conditions
 * @returns Authorization record
 */
export function generateAuthorizationRecord(
  type: ActivationAuthorization['type'],
  principal: string,
  preconditionsVerified: string[],
  preconditionsFailed: string[]
): ActivationAuthorization {
  const timestamp = Date.now();
  const id = `AUTH-${type.toUpperCase()}-${timestamp}`;
  const date = new Date(timestamp).toISOString();
  
  const dataToHash = `${id}:${principal}:${type}:${preconditionsVerified.join(',')}:${timestamp}`;
  const hash = generateHash(dataToHash);
  
  const blockingFailed = preconditionsFailed.filter(id => {
    const condition = ACTIVATION_PRECONDITIONS.find(c => c.id === id);
    return condition?.blocking;
  });
  
  const valid = blockingFailed.length === 0;
  
  const summary = valid
    ? `Authorization granted: ${type} by ${principal} at ${date}`
    : `Authorization DENIED: ${blockingFailed.length} blocking condition(s) failed`;

  return {
    id,
    timestamp,
    date,
    principal,
    type,
    preconditionsVerified,
    preconditionsFailed,
    hash,
    summary,
    valid,
  };
}

// ============================================================================
// ACTIVATION GATE IMPLEMENTATION
// ============================================================================

/**
 * Create an Activation Gate.
 * 
 * CONSTRAINT: Gate starts LOCKED. Cannot unlock without code change.
 */
export function createActivationGate(): ActivationGate {
  let stage: ActivationStage = 'locked';
  const authorizations: ActivationAuthorization[] = [];

  return {
    get stage() { return stage; },
    get locked() { return ACTIVATION_LOCKED; },
    preconditions: ACTIVATION_PRECONDITIONS,
    authorizations,

    canActivate(): boolean {
      if (ACTIVATION_LOCKED) return false;
      return stage === 'readiness_confirmed';
    },

    advanceStage(authorization: ActivationAuthorization): boolean {
      if (ACTIVATION_LOCKED) {
        console.warn('[ActivationGate] Cannot advance: ACTIVATION_LOCKED is true');
        return false;
      }

      if (!authorization.valid) {
        console.warn('[ActivationGate] Cannot advance: Authorization invalid');
        return false;
      }

      authorizations.push(authorization);

      const stageTransitions: Record<ActivationStage, ActivationStage | null> = {
        locked: 'intent_declared',
        intent_declared: 'readiness_confirmed',
        readiness_confirmed: 'executing',
        executing: 'active',
        active: null,
        aborting: 'rolled_back',
        rolled_back: 'locked',
      };

      const nextStage = stageTransitions[stage];
      if (nextStage) {
        console.info(`[ActivationGate] Stage transition: ${stage} → ${nextStage}`);
        stage = nextStage;
        return true;
      }

      return false;
    },

    abort(): void {
      console.warn('[ActivationGate] ABORT initiated');
      stage = 'aborting';
      // Abort logic would go here
      stage = 'rolled_back';
      console.info('[ActivationGate] Rolled back to safe state');
    },

    getStatus(): GateStatus {
      const met = ACTIVATION_PRECONDITIONS.filter(() => false).length; // All fail in locked state
      const blockers = ACTIVATION_PRECONDITIONS
        .filter(c => c.blocking)
        .map(c => c.id);

      return {
        stage,
        locked: ACTIVATION_LOCKED,
        preconditionsMet: met,
        preconditionsTotal: ACTIVATION_PRECONDITIONS.length,
        blockersFailed: blockers,
        readyToAdvance: false,
      };
    },
  };
}
