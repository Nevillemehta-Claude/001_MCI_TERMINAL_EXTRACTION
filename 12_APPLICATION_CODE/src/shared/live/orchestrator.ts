/**
 * LEAP 5 Orchestrator
 * 
 * Orchestrates the complete live activation sequence:
 * PHASE A → PHASE B → PHASE C → PHASE D → PHASE E
 * 
 * Maintains abort dominance throughout.
 * Provides rollback capability at every phase.
 */

import { executePhaseA, rollbackPhaseA, getPhaseAStatus, type ExecutiveUnlockResult } from './phaseA';
import { executePhaseB, rollbackPhaseB, getPhaseBStatus, type ConnectivityCheckResult } from './phaseB';
import { executePhaseC, rollbackPhaseC, getPhaseCStatus, type DataIgnitionResult } from './phaseC';
import { executePhaseD, rollbackPhaseD, getPhaseDStatus, type TruthConfirmationResult } from './phaseD';
import { executePhaseE, rollbackPhaseE, getPhaseEStatus, type OperationalAssumptionResult, type LiveOperationalCertificate } from './phaseE';
import { isKillSwitchEngaged, executeAbort, engageKillSwitch } from '../activation/killSwitch';
import { resetLiveState } from './index';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Phase execution status
 */
export interface PhaseStatus {
  phase: 'A' | 'B' | 'C' | 'D' | 'E';
  executed: boolean;
  success: boolean;
  timestamp: number | null;
  message: string;
}

/**
 * Complete LEAP 5 execution result
 */
export interface Leap5ExecutionResult {
  success: boolean;
  completed: boolean;
  aborted: boolean;
  phases: {
    A: ExecutiveUnlockResult | null;
    B: ConnectivityCheckResult | null;
    C: DataIgnitionResult | null;
    D: TruthConfirmationResult | null;
    E: OperationalAssumptionResult | null;
  };
  certificate: LiveOperationalCertificate | null;
  startedAt: number;
  completedAt: number | null;
  duration: number | null;
  message: string;
}

// ============================================================================
// ORCHESTRATION STATE
// ============================================================================

// Runtime state
let leap5InProgress = false;
let leap5Aborted = false;
let leap5Result: Leap5ExecutionResult | null = null;

/**
 * Get current LEAP 5 execution status.
 */
export function getLeap5Status(): {
  inProgress: boolean;
  aborted: boolean;
  phasesExecuted: string[];
  currentPhase: 'A' | 'B' | 'C' | 'D' | 'E' | 'COMPLETE' | 'NOT_STARTED';
  result: Leap5ExecutionResult | null;
} {
  const phaseAStatus = getPhaseAStatus();
  const phaseBStatus = getPhaseBStatus();
  const phaseCStatus = getPhaseCStatus();
  const phaseDStatus = getPhaseDStatus();
  const phaseEStatus = getPhaseEStatus();
  
  const phasesExecuted: string[] = [];
  let currentPhase: 'A' | 'B' | 'C' | 'D' | 'E' | 'COMPLETE' | 'NOT_STARTED' = 'NOT_STARTED';
  
  if (phaseAStatus.executed) phasesExecuted.push('A');
  if (phaseBStatus.executed) phasesExecuted.push('B');
  if (phaseCStatus.executed) phasesExecuted.push('C');
  if (phaseDStatus.executed) phasesExecuted.push('D');
  if (phaseEStatus.executed) phasesExecuted.push('E');
  
  if (phaseEStatus.executed) {
    currentPhase = 'COMPLETE';
  } else if (phaseDStatus.executed) {
    currentPhase = 'E';
  } else if (phaseCStatus.executed) {
    currentPhase = 'D';
  } else if (phaseBStatus.executed) {
    currentPhase = 'C';
  } else if (phaseAStatus.executed) {
    currentPhase = 'B';
  } else if (leap5InProgress) {
    currentPhase = 'A';
  }
  
  return {
    inProgress: leap5InProgress,
    aborted: leap5Aborted,
    phasesExecuted,
    currentPhase,
    result: leap5Result,
  };
}

// ============================================================================
// ABORT HANDLING
// ============================================================================

/**
 * Abort LEAP 5 execution immediately.
 * 
 * Rollbacks are executed in reverse order.
 */
export function abortLeap5(): {
  aborted: boolean;
  phasesRolledBack: string[];
  message: string;
} {
  const phasesRolledBack: string[] = [];
  
  // Engage kill switch immediately
  engageKillSwitch();
  
  // Rollback in reverse order
  const phaseEStatus = getPhaseEStatus();
  if (phaseEStatus.executed) {
    rollbackPhaseE();
    phasesRolledBack.push('E');
  }
  
  const phaseDStatus = getPhaseDStatus();
  if (phaseDStatus.executed) {
    rollbackPhaseD();
    phasesRolledBack.push('D');
  }
  
  const phaseCStatus = getPhaseCStatus();
  if (phaseCStatus.executed) {
    rollbackPhaseC();
    phasesRolledBack.push('C');
  }
  
  const phaseBStatus = getPhaseBStatus();
  if (phaseBStatus.executed) {
    rollbackPhaseB();
    phasesRolledBack.push('B');
  }
  
  const phaseAStatus = getPhaseAStatus();
  if (phaseAStatus.executed) {
    rollbackPhaseA();
    phasesRolledBack.push('A');
  }
  
  leap5InProgress = false;
  leap5Aborted = true;
  
  return {
    aborted: true,
    phasesRolledBack,
    message: `LEAP 5 aborted. Rolled back phases: ${phasesRolledBack.join(', ')}`,
  };
}

// ============================================================================
// MAIN ORCHESTRATION
// ============================================================================

/**
 * Execute complete LEAP 5 sequence.
 * 
 * Executes all phases in order: A → B → C → D → E
 * Aborts on any failure.
 * 
 * @returns Leap5ExecutionResult with all phase results
 */
export async function executeLeap5(): Promise<Leap5ExecutionResult> {
  const startedAt = Date.now();
  
  leap5InProgress = true;
  leap5Aborted = false;
  
  const result: Leap5ExecutionResult = {
    success: false,
    completed: false,
    aborted: false,
    phases: {
      A: null,
      B: null,
      C: null,
      D: null,
      E: null,
    },
    certificate: null,
    startedAt,
    completedAt: null,
    duration: null,
    message: '',
  };
  
  try {
    // =========================================================================
    // PHASE A: Executive Unlock
    // =========================================================================
    console.log('[LEAP 5] Executing Phase A: Executive Unlock...');
    const phaseAResult = executePhaseA();
    result.phases.A = phaseAResult;
    
    if (!phaseAResult.success) {
      result.message = `Phase A failed: ${phaseAResult.message}`;
      leap5InProgress = false;
      return result;
    }
    
    console.log('[LEAP 5] Phase A complete.');
    
    // =========================================================================
    // PHASE B: Live Connectivity Enablement
    // =========================================================================
    console.log('[LEAP 5] Executing Phase B: Live Connectivity...');
    const phaseBResult = await executePhaseB();
    result.phases.B = phaseBResult;
    
    if (!phaseBResult.success) {
      result.message = `Phase B failed: ${phaseBResult.message}`;
      abortLeap5();
      result.aborted = true;
      leap5InProgress = false;
      return result;
    }
    
    console.log('[LEAP 5] Phase B complete.');
    
    // =========================================================================
    // PHASE C: Controlled Data Ignition
    // =========================================================================
    console.log('[LEAP 5] Executing Phase C: Controlled Data Ignition...');
    const phaseCResult = executePhaseC();
    result.phases.C = phaseCResult;
    
    if (!phaseCResult.success) {
      result.message = `Phase C failed: ${phaseCResult.message}`;
      abortLeap5();
      result.aborted = true;
      leap5InProgress = false;
      return result;
    }
    
    console.log('[LEAP 5] Phase C complete.');
    
    // =========================================================================
    // PHASE D: Operator Truth Confirmation
    // =========================================================================
    console.log('[LEAP 5] Executing Phase D: Operator Truth Confirmation...');
    const phaseDResult = executePhaseD();
    result.phases.D = phaseDResult;
    
    // Phase D may succeed with warnings
    console.log('[LEAP 5] Phase D complete.');
    
    // =========================================================================
    // PHASE E: Operational Assumption
    // =========================================================================
    console.log('[LEAP 5] Executing Phase E: Operational Assumption...');
    const phaseEResult = executePhaseE();
    result.phases.E = phaseEResult;
    
    if (!phaseEResult.success) {
      result.message = `Phase E failed: ${phaseEResult.message}`;
      abortLeap5();
      result.aborted = true;
      leap5InProgress = false;
      return result;
    }
    
    console.log('[LEAP 5] Phase E complete.');
    
    // =========================================================================
    // SUCCESS
    // =========================================================================
    const completedAt = Date.now();
    
    result.success = true;
    result.completed = true;
    result.certificate = phaseEResult.certificate;
    result.completedAt = completedAt;
    result.duration = completedAt - startedAt;
    result.message = 'LEAP 5 COMPLETE: SYSTEM IS LIVE.';
    
    leap5InProgress = false;
    leap5Result = result;
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(' LEAP 5 COMPLETE: SYSTEM IS LIVE ');
    console.log(`═══════════════════════════════════════════════════════════════`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Certificate: ${result.certificate?.id}`);
    console.log('═══════════════════════════════════════════════════════════════');
    
    return result;
    
  } catch (error) {
    // Unexpected error - abort immediately
    console.error('[LEAP 5] Unexpected error:', error);
    abortLeap5();
    
    result.aborted = true;
    result.message = `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
    leap5InProgress = false;
    
    return result;
  }
}

/**
 * Reset LEAP 5 state for testing.
 */
export function resetLeap5State(): void {
  abortLeap5();
  resetLiveState();
  leap5InProgress = false;
  leap5Aborted = false;
  leap5Result = null;
}
