/**
 * PHASE A: Executive Unlock (Controlled)
 * 
 * Objective: Allow activation without triggering it
 * 
 * Actions:
 * - Set ACTIVATION_LOCKED = false (via runtime flag)
 * - Retain KILL_SWITCH_ENGAGED = true
 * - Retain DARK_MODE = true
 * - Capture pre-activation baseline snapshot
 * - Record authorization fingerprint
 * 
 * Outcome: System becomes activatable, not active
 */

import { LIVE_STATE } from './index';
import { isKillSwitchEngaged } from '../activation/killSwitch';
import { captureBaseline, type ActivationBaseline } from '../activation/observability';
import { DARK_MODE } from '../integration';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Pre-activation baseline snapshot
 */
export interface PreActivationBaseline {
  timestamp: number;
  systemState: {
    activationUnlocked: boolean;
    liveConnectivity: boolean;
    dataFlow: boolean;
    operationallyLive: boolean;
    killSwitchEngaged: boolean;
    darkModeEnabled: boolean;
  };
  metrics: ActivationBaseline;
  authorizationFingerprint: string;
}

/**
 * Executive unlock result
 */
export interface ExecutiveUnlockResult {
  success: boolean;
  phase: 'A';
  timestamp: number;
  baseline: PreActivationBaseline;
  unlocked: boolean;
  killSwitchRetained: boolean;
  darkModeRetained: boolean;
  message: string;
}

// ============================================================================
// AUTHORIZATION FINGERPRINT
// ============================================================================

/**
 * Generate a unique authorization fingerprint for this activation.
 */
export function generateAuthorizationFingerprint(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const directive = 'PAD-QL5';
  
  // Create a fingerprint hash
  const data = `${directive}:${timestamp}:${random}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `AUTH-${directive}-${Math.abs(hash).toString(16).padStart(8, '0')}-${timestamp}`;
}

// ============================================================================
// PRE-ACTIVATION BASELINE
// ============================================================================

/**
 * Capture complete pre-activation baseline.
 */
export function capturePreActivationBaseline(): PreActivationBaseline {
  return {
    timestamp: Date.now(),
    systemState: {
      activationUnlocked: LIVE_STATE.ACTIVATION_UNLOCKED,
      liveConnectivity: LIVE_STATE.LIVE_CONNECTIVITY_ENABLED,
      dataFlow: LIVE_STATE.DATA_FLOW_ENABLED,
      operationallyLive: LIVE_STATE.OPERATIONALLY_LIVE,
      killSwitchEngaged: isKillSwitchEngaged(),
      darkModeEnabled: DARK_MODE,
    },
    metrics: captureBaseline(),
    authorizationFingerprint: generateAuthorizationFingerprint(),
  };
}

// ============================================================================
// PHASE A EXECUTION
// ============================================================================

// Runtime state (mutable)
let phaseAExecuted = false;
let phaseABaseline: PreActivationBaseline | null = null;

/**
 * Execute Phase A: Executive Unlock
 * 
 * This makes the system activatable without activating it.
 * 
 * @returns ExecutiveUnlockResult with baseline and status
 */
export function executePhaseA(): ExecutiveUnlockResult {
  const timestamp = Date.now();
  
  // Capture baseline BEFORE any changes
  const baseline = capturePreActivationBaseline();
  phaseABaseline = baseline;
  
  // Verify kill switch is still engaged
  if (!isKillSwitchEngaged()) {
    return {
      success: false,
      phase: 'A',
      timestamp,
      baseline,
      unlocked: false,
      killSwitchRetained: false,
      darkModeRetained: DARK_MODE,
      message: 'ABORT: Kill switch is not engaged. Cannot proceed.',
    };
  }
  
  // Verify dark mode is still enabled
  if (!DARK_MODE) {
    return {
      success: false,
      phase: 'A',
      timestamp,
      baseline,
      unlocked: false,
      killSwitchRetained: isKillSwitchEngaged(),
      darkModeRetained: false,
      message: 'ABORT: Dark mode is disabled. Cannot proceed.',
    };
  }
  
  // Set the runtime unlock flag
  LIVE_STATE.ACTIVATION_UNLOCKED = true;
  
  phaseAExecuted = true;
  
  return {
    success: true,
    phase: 'A',
    timestamp,
    baseline,
    unlocked: true,
    killSwitchRetained: true,
    darkModeRetained: true,
    message: 'Phase A complete: System is now activatable, not active.',
  };
}

/**
 * Get Phase A execution status.
 */
export function getPhaseAStatus(): { executed: boolean; baseline: PreActivationBaseline | null } {
  return {
    executed: phaseAExecuted,
    baseline: phaseABaseline,
  };
}

/**
 * Rollback Phase A.
 */
export function rollbackPhaseA(): void {
  LIVE_STATE.ACTIVATION_UNLOCKED = false;
  phaseAExecuted = false;
  phaseABaseline = null;
}
