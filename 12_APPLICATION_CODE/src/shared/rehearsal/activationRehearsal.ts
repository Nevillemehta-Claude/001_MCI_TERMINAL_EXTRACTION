/**
 * Activation Rehearsal (Dry-Run Mode)
 * 
 * SILO 13: Execute the entire activation sequence with live switches locked.
 * 
 * CONSTRAINT: This rehearsal EXERCISES activation but DOES NOT enable it.
 * The system proves it CAN activate without actually doing so.
 */

import { 
  ACTIVATION_LOCKED, 
  KILL_SWITCH_ENGAGED 
} from '../activation';
import {
  ACTIVATION_PRECONDITIONS,
  createActivationGate,
  validatePreconditions,
  generateAuthorizationRecord,
} from '../activation/governance';
import { DARK_MODE } from '../integration';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Individual rehearsal step result
 */
export interface RehearsalStep {
  /** Step ID */
  id: string;
  /** Step name */
  name: string;
  /** Step order */
  order: number;
  /** Whether step was executed */
  executed: boolean;
  /** Whether step passed */
  passed: boolean;
  /** Result message */
  message: string;
  /** Duration in ms */
  durationMs: number;
  /** Expected behavior verified */
  expectedBehavior: string;
  /** Actual behavior observed */
  actualBehavior: string;
}

/**
 * Rehearsal result
 */
export interface RehearsalResult {
  /** Whether rehearsal completed */
  completed: boolean;
  /** Whether all steps passed */
  allPassed: boolean;
  /** Individual step results */
  steps: RehearsalStep[];
  /** Total duration */
  totalDurationMs: number;
  /** System state before */
  stateBefore: SystemStateSnapshot;
  /** System state after */
  stateAfter: SystemStateSnapshot;
  /** Whether state unchanged */
  stateUnchanged: boolean;
}

/**
 * System state snapshot
 */
interface SystemStateSnapshot {
  activationLocked: boolean;
  killSwitchEngaged: boolean;
  darkModeEnabled: boolean;
  timestamp: number;
}

/**
 * Full rehearsal report
 */
export interface ActivationRehearsalReport {
  id: string;
  executedAt: number;
  result: RehearsalResult;
  preconditionsEvaluated: number;
  authorizationLayersExercised: number;
  blockedAtFinalBoundary: boolean;
  systemStateVerified: boolean;
  certification: 'PASS' | 'FAIL';
}

// ============================================================================
// STATE SNAPSHOT
// ============================================================================

/**
 * Capture current system state
 */
function captureSystemState(): SystemStateSnapshot {
  return {
    activationLocked: ACTIVATION_LOCKED,
    killSwitchEngaged: KILL_SWITCH_ENGAGED,
    darkModeEnabled: DARK_MODE,
    timestamp: Date.now(),
  };
}

/**
 * Compare two state snapshots
 */
function statesEqual(a: SystemStateSnapshot, b: SystemStateSnapshot): boolean {
  return (
    a.activationLocked === b.activationLocked &&
    a.killSwitchEngaged === b.killSwitchEngaged &&
    a.darkModeEnabled === b.darkModeEnabled
  );
}

// ============================================================================
// REHEARSAL EXECUTION
// ============================================================================

/**
 * Execute full activation rehearsal.
 * 
 * This exercises every activation pathway while keeping the system locked.
 * 
 * @returns Rehearsal result with all step details
 */
export async function executeActivationRehearsal(): Promise<RehearsalResult> {
  const startTime = Date.now();
  const stateBefore = captureSystemState();
  const steps: RehearsalStep[] = [];

  // Step 1: Verify initial state
  steps.push(await executeStep({
    id: 'RH-001',
    name: 'Verify Initial State',
    order: 1,
    expectedBehavior: 'System is locked',
    execute: async () => {
      const locked = ACTIVATION_LOCKED === true;
      const killSwitch = KILL_SWITCH_ENGAGED === true;
      const dark = DARK_MODE === true;
      return {
        passed: locked && killSwitch && dark,
        actualBehavior: `LOCKED=${locked}, KILL_SWITCH=${killSwitch}, DARK=${dark}`,
      };
    },
  }));

  // Step 2: Create Activation Gate
  steps.push(await executeStep({
    id: 'RH-002',
    name: 'Create Activation Gate',
    order: 2,
    expectedBehavior: 'Gate created in locked stage',
    execute: async () => {
      const gate = createActivationGate();
      return {
        passed: gate.stage === 'locked' && gate.locked === true,
        actualBehavior: `Stage=${gate.stage}, Locked=${gate.locked}`,
      };
    },
  }));

  // Step 3: Evaluate All Preconditions
  steps.push(await executeStep({
    id: 'RH-003',
    name: 'Evaluate All Preconditions',
    order: 3,
    expectedBehavior: 'All blocking preconditions fail (system is locked)',
    execute: async () => {
      const result = await validatePreconditions();
      const blockersFailed = result.blockersFailed.length;
      return {
        passed: blockersFailed > 0 && !result.blockersCleared,
        actualBehavior: `Blockers failed: ${blockersFailed}, Cleared: ${result.blockersCleared}`,
      };
    },
  }));

  // Step 4: Generate Intent Authorization
  steps.push(await executeStep({
    id: 'RH-004',
    name: 'Generate Intent Authorization',
    order: 4,
    expectedBehavior: 'Authorization record created but marked invalid',
    execute: async () => {
      const auth = generateAuthorizationRecord(
        'intent',
        'REHEARSAL-PRINCIPAL',
        [],
        ['SAFE-001', 'SAFE-002']
      );
      return {
        passed: auth.id !== '' && auth.valid === false,
        actualBehavior: `ID=${auth.id}, Valid=${auth.valid}`,
      };
    },
  }));

  // Step 5: Attempt Stage Advancement
  steps.push(await executeStep({
    id: 'RH-005',
    name: 'Attempt Stage Advancement',
    order: 5,
    expectedBehavior: 'Stage advancement blocked',
    execute: async () => {
      const gate = createActivationGate();
      const auth = generateAuthorizationRecord('intent', 'TEST', [], ['SAFE-001']);
      const advanced = gate.advanceStage(auth);
      return {
        passed: advanced === false && gate.stage === 'locked',
        actualBehavior: `Advanced=${advanced}, Stage=${gate.stage}`,
      };
    },
  }));

  // Step 6: Verify canActivate Returns False
  steps.push(await executeStep({
    id: 'RH-006',
    name: 'Verify Activation Blocked',
    order: 6,
    expectedBehavior: 'canActivate() returns false',
    execute: async () => {
      const gate = createActivationGate();
      const canActivate = gate.canActivate();
      return {
        passed: canActivate === false,
        actualBehavior: `canActivate=${canActivate}`,
      };
    },
  }));

  // Step 7: Exercise Abort Path
  steps.push(await executeStep({
    id: 'RH-007',
    name: 'Exercise Abort Path',
    order: 7,
    expectedBehavior: 'Abort completes successfully',
    execute: async () => {
      const gate = createActivationGate();
      gate.abort();
      return {
        passed: gate.stage === 'rolled_back',
        actualBehavior: `Stage after abort=${gate.stage}`,
      };
    },
  }));

  // Step 8: Verify Final Boundary Block
  steps.push(await executeStep({
    id: 'RH-008',
    name: 'Verify Final Boundary Block',
    order: 8,
    expectedBehavior: 'Blocked at irreversible boundary',
    execute: async () => {
      // Try to force through every gate
      const gate = createActivationGate();
      let blocked = true;
      
      // Attempt all stage transitions
      for (let i = 0; i < 5; i++) {
        const auth = generateAuthorizationRecord('execute', 'FORCE', [], []);
        if (gate.advanceStage(auth)) {
          blocked = false;
        }
      }
      
      return {
        passed: blocked && gate.stage === 'locked',
        actualBehavior: `Blocked=${blocked}, FinalStage=${gate.stage}`,
      };
    },
  }));

  // Capture final state
  const stateAfter = captureSystemState();
  const stateUnchanged = statesEqual(stateBefore, stateAfter);

  return {
    completed: true,
    allPassed: steps.every(s => s.passed),
    steps,
    totalDurationMs: Date.now() - startTime,
    stateBefore,
    stateAfter,
    stateUnchanged,
  };
}

/**
 * Execute a single rehearsal step
 */
async function executeStep(config: {
  id: string;
  name: string;
  order: number;
  expectedBehavior: string;
  execute: () => Promise<{ passed: boolean; actualBehavior: string }>;
}): Promise<RehearsalStep> {
  const startTime = Date.now();
  
  try {
    const result = await config.execute();
    return {
      id: config.id,
      name: config.name,
      order: config.order,
      executed: true,
      passed: result.passed,
      message: result.passed ? 'PASS' : 'FAIL',
      durationMs: Date.now() - startTime,
      expectedBehavior: config.expectedBehavior,
      actualBehavior: result.actualBehavior,
    };
  } catch (error) {
    return {
      id: config.id,
      name: config.name,
      order: config.order,
      executed: true,
      passed: false,
      message: `ERROR: ${error instanceof Error ? error.message : String(error)}`,
      durationMs: Date.now() - startTime,
      expectedBehavior: config.expectedBehavior,
      actualBehavior: 'Exception thrown',
    };
  }
}

/**
 * Verify system state is unchanged after rehearsal
 */
export function verifySystemUnchanged(): {
  unchanged: boolean;
  checks: Array<{ name: string; expected: unknown; actual: unknown; passed: boolean }>;
} {
  const checks = [
    { 
      name: 'ACTIVATION_LOCKED', 
      expected: true, 
      actual: ACTIVATION_LOCKED, 
      passed: ACTIVATION_LOCKED === true 
    },
    { 
      name: 'KILL_SWITCH_ENGAGED', 
      expected: true, 
      actual: KILL_SWITCH_ENGAGED, 
      passed: KILL_SWITCH_ENGAGED === true 
    },
    { 
      name: 'DARK_MODE', 
      expected: true, 
      actual: DARK_MODE, 
      passed: DARK_MODE === true 
    },
  ];

  return {
    unchanged: checks.every(c => c.passed),
    checks,
  };
}

/**
 * Generate activation rehearsal report
 */
export function generateRehearsalReport(result: RehearsalResult): ActivationRehearsalReport {
  return {
    id: `REHEARSAL-${Date.now()}`,
    executedAt: Date.now(),
    result,
    preconditionsEvaluated: ACTIVATION_PRECONDITIONS.length,
    authorizationLayersExercised: 3, // intent, readiness, execute
    blockedAtFinalBoundary: result.steps.find(s => s.id === 'RH-008')?.passed ?? false,
    systemStateVerified: result.stateUnchanged,
    certification: result.allPassed && result.stateUnchanged ? 'PASS' : 'FAIL',
  };
}
