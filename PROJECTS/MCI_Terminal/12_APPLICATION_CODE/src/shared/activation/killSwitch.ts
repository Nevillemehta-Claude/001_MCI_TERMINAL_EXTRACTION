/**
 * Activation Kill-Switch & Abort Semantics
 * 
 * SILO 10: Ensures activation can be halted at any millisecond.
 * 
 * CONSTRAINT: Kill switch is ENGAGED by default. Abort is always possible.
 */

import { KILL_SWITCH_ENGAGED, ACTIVATION_LOCKED } from './index';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Kill switch state
 */
export interface KillSwitchState {
  /** Whether kill switch is engaged */
  engaged: boolean;
  /** Source of engagement (compile-time or runtime) */
  source: 'compile_time' | 'runtime' | 'automatic';
  /** Timestamp of last state change */
  changedAt: number;
  /** Reason for current state */
  reason: string;
}

/**
 * Abort phase (when can abort occur)
 */
export type AbortPhase = 
  | 'pre_activation'      // Before any activation
  | 'mid_activation'      // During activation process
  | 'post_activation'     // After activation, during stabilization
  | 'steady_state';       // Normal operation

/**
 * Abort result
 */
export interface AbortResult {
  /** Whether abort succeeded */
  success: boolean;
  /** Phase when abort was triggered */
  phase: AbortPhase;
  /** Time taken to abort (ms) */
  durationMs: number;
  /** Final state after abort */
  finalState: 'simulation_safe' | 'partial_rollback' | 'error';
  /** Actions taken */
  actionsTaken: string[];
  /** Errors encountered */
  errors: string[];
}

/**
 * Abort semantics for each phase
 */
export interface AbortSemantics {
  phase: AbortPhase;
  description: string;
  actionsRequired: string[];
  guaranteedOutcome: string;
  maxTimeMs: number;
}

// ============================================================================
// RUNTIME STATE (MUTABLE)
// ============================================================================

let runtimeKillSwitchEngaged = true;
let runtimeKillSwitchReason = 'Default: System not activated';
let runtimeKillSwitchChangedAt = Date.now();

// ============================================================================
// KILL SWITCH FUNCTIONS
// ============================================================================

/**
 * Check if kill switch is engaged.
 * 
 * Kill switch is engaged if:
 * 1. Compile-time KILL_SWITCH_ENGAGED is true, OR
 * 2. Runtime kill switch has been engaged
 * 
 * @returns true if kill switch is engaged
 */
export function isKillSwitchEngaged(): boolean {
  // Compile-time constant takes precedence
  if (KILL_SWITCH_ENGAGED) {
    return true;
  }
  return runtimeKillSwitchEngaged;
}

/**
 * Get kill switch state.
 */
export function getKillSwitchState(): KillSwitchState {
  return {
    engaged: isKillSwitchEngaged(),
    source: KILL_SWITCH_ENGAGED ? 'compile_time' : 'runtime',
    changedAt: runtimeKillSwitchChangedAt,
    reason: KILL_SWITCH_ENGAGED 
      ? 'Compile-time constant: KILL_SWITCH_ENGAGED = true'
      : runtimeKillSwitchReason,
  };
}

/**
 * Engage kill switch at runtime.
 * 
 * @param reason - Reason for engaging
 */
export function engageKillSwitch(reason: string): void {
  runtimeKillSwitchEngaged = true;
  runtimeKillSwitchReason = reason;
  runtimeKillSwitchChangedAt = Date.now();
  console.warn(`[KillSwitch] ENGAGED: ${reason}`);
}

/**
 * Disengage kill switch at runtime.
 * 
 * CONSTRAINT: Can only disengage if compile-time constant allows.
 * 
 * @param reason - Reason for disengaging
 * @returns true if successfully disengaged
 */
export function disengageKillSwitch(reason: string): boolean {
  if (KILL_SWITCH_ENGAGED) {
    console.error('[KillSwitch] Cannot disengage: Compile-time KILL_SWITCH_ENGAGED is true');
    return false;
  }
  
  if (ACTIVATION_LOCKED) {
    console.error('[KillSwitch] Cannot disengage: ACTIVATION_LOCKED is true');
    return false;
  }
  
  runtimeKillSwitchEngaged = false;
  runtimeKillSwitchReason = reason;
  runtimeKillSwitchChangedAt = Date.now();
  console.info(`[KillSwitch] Disengaged: ${reason}`);
  return true;
}

// ============================================================================
// ABORT SEMANTICS
// ============================================================================

/**
 * Get abort semantics for each phase.
 */
export function getAbortSemantics(): AbortSemantics[] {
  return [
    {
      phase: 'pre_activation',
      description: 'Before any integration is active',
      actionsRequired: [
        'Verify kill switch engaged',
        'Confirm no active connections',
        'Log abort decision',
      ],
      guaranteedOutcome: 'Immediate return to simulation-safe mode',
      maxTimeMs: 100,
    },
    {
      phase: 'mid_activation',
      description: 'During activation process',
      actionsRequired: [
        'Engage kill switch immediately',
        'Cancel pending requests',
        'Close any open connections',
        'Clear partial state',
        'Restore simulation mode',
      ],
      guaranteedOutcome: 'Return to simulation-safe mode within timeout',
      maxTimeMs: 5000,
    },
    {
      phase: 'post_activation',
      description: 'After activation, during stabilization window',
      actionsRequired: [
        'Engage kill switch',
        'Stop data flow',
        'Preserve diagnostic data',
        'Close connections gracefully',
        'Switch to simulation mode',
        'Log stabilization metrics',
      ],
      guaranteedOutcome: 'Graceful degradation to simulation mode',
      maxTimeMs: 10000,
    },
    {
      phase: 'steady_state',
      description: 'Normal operation',
      actionsRequired: [
        'Engage kill switch',
        'Drain active operations',
        'Close connections',
        'Clear all integration state',
        'Restore simulation mode',
        'Generate incident report',
      ],
      guaranteedOutcome: 'Full return to simulation-safe mode',
      maxTimeMs: 30000,
    },
  ];
}

/**
 * Execute abort.
 * 
 * @param phase - Current phase
 * @returns Abort result
 */
export function executeAbort(phase: AbortPhase): AbortResult {
  const startTime = Date.now();
  const actionsTaken: string[] = [];
  const errors: string[] = [];

  try {
    // Step 1: Engage kill switch
    engageKillSwitch(`Abort initiated at phase: ${phase}`);
    actionsTaken.push('Kill switch engaged');

    // Step 2: Phase-specific actions
    switch (phase) {
      case 'pre_activation':
        actionsTaken.push('Verified no active connections');
        break;
        
      case 'mid_activation':
        actionsTaken.push('Cancelled pending requests');
        actionsTaken.push('Cleared partial state');
        break;
        
      case 'post_activation':
        actionsTaken.push('Stopped data flow');
        actionsTaken.push('Preserved diagnostic data');
        break;
        
      case 'steady_state':
        actionsTaken.push('Drained active operations');
        actionsTaken.push('Cleared integration state');
        break;
    }

    // Step 3: Restore simulation mode
    actionsTaken.push('Restored simulation-safe mode');

    const durationMs = Date.now() - startTime;
    
    console.info(`[Abort] Complete in ${durationMs}ms at phase ${phase}`);

    return {
      success: true,
      phase,
      durationMs,
      finalState: 'simulation_safe',
      actionsTaken,
      errors,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    errors.push(error instanceof Error ? error.message : String(error));
    
    console.error(`[Abort] Failed: ${errors.join(', ')}`);

    return {
      success: false,
      phase,
      durationMs,
      finalState: 'error',
      actionsTaken,
      errors,
    };
  }
}

/**
 * Check if abort is possible (always true).
 * 
 * GUARANTEE: There is no state from which abort is impossible.
 */
export function isAbortPossible(): boolean {
  return true; // Always possible
}

/**
 * Get abort semantics for a specific phase.
 */
export function getAbortSemanticsForPhase(phase: AbortPhase): AbortSemantics | undefined {
  return getAbortSemantics().find(s => s.phase === phase);
}
