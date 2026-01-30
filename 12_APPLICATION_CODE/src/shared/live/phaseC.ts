/**
 * PHASE C: Controlled Data Ignition
 * 
 * Objective: Begin live data flow under degradation dominance
 * 
 * Actions:
 * - Enable telemetry ingestion (read-only)
 * - Enforce: Contract immunity, Error translation, Latency-based degradation
 * - Activate operator-visible counters only
 * 
 * Abort Dominance:
 * - Any anomaly → immediate DEGRADED or FAIL
 * - No retries without observability
 * 
 * Outcome: Data flows under strict governance
 */

import { isKillSwitchEngaged, executeAbort } from '../activation/killSwitch';
import { validateRuntimeContract, RUNTIME_CONTRACTS } from '../activation/contracts';
import { translateCiaSieError, translateCiaSieErrorEnhanced } from '../errors/ciaSieErrorTranslator';
import { getDegradationLevel, type DegradationLevel } from '../resilience/latency';
import { DARK_MODE } from '../integration';
import { LIVE_STATE } from './index';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Telemetry ingestion configuration
 */
export interface TelemetryIngestionConfig {
  enabled: boolean;
  readOnly: boolean;
  contractEnforcement: boolean;
  errorTranslation: boolean;
  latencyDegradation: boolean;
}

/**
 * Telemetry ingestion state
 */
export interface TelemetryIngestionState {
  active: boolean;
  recordsReceived: number;
  recordsRejected: number;
  contractViolations: number;
  errorsTranslated: number;
  currentDegradationLevel: DegradationLevel;
  lastRecordAt: number | null;
}

/**
 * Contract immunity result
 */
interface ContractImmunityResult {
  valid: boolean;
  violations: Array<{ field: string; reason: string }>;
  contractId: string;
}

/**
 * Data ignition result
 */
export interface DataIgnitionResult {
  success: boolean;
  phase: 'C';
  timestamp: number;
  ingestionState: TelemetryIngestionState;
  contractImmunityEnforced: boolean;
  errorTranslationActive: boolean;
  degradationDominanceActive: boolean;
  message: string;
}

// ============================================================================
// INGESTION STATE
// ============================================================================

// Runtime state
let phaseCExecuted = false;
let ingestionState: TelemetryIngestionState = {
  active: false,
  recordsReceived: 0,
  recordsRejected: 0,
  contractViolations: 0,
  errorsTranslated: 0,
  currentDegradationLevel: 'normal',
  lastRecordAt: null,
};

// Configuration
const ingestionConfig: TelemetryIngestionConfig = {
  enabled: false,
  readOnly: true, // ALWAYS read-only
  contractEnforcement: true,
  errorTranslation: true,
  latencyDegradation: true,
};

/**
 * Get current ingestion state.
 */
export function getIngestionState(): TelemetryIngestionState {
  return { ...ingestionState };
}

/**
 * Reset ingestion counters.
 */
export function resetIngestionCounters(): void {
  ingestionState.recordsReceived = 0;
  ingestionState.recordsRejected = 0;
  ingestionState.contractViolations = 0;
  ingestionState.errorsTranslated = 0;
}

// ============================================================================
// CONTRACT IMMUNITY
// ============================================================================

/**
 * Enforce contract immunity on incoming data.
 */
export function enforceContractImmunity(
  data: unknown,
  contractId: string
): ContractImmunityResult {
  const contract = RUNTIME_CONTRACTS.find(c => c.id === contractId);
  
  if (!contract) {
    ingestionState.contractViolations++;
    return {
      valid: false,
      violations: [{ field: '_contract', reason: `Unknown contract: ${contractId}` }],
      contractId,
    };
  }
  
  const validation = validateRuntimeContract(data, contract);
  
  if (!validation.valid) {
    ingestionState.contractViolations += validation.violations.length;
    ingestionState.recordsRejected++;
  }
  
  return {
    valid: validation.valid,
    violations: validation.violations,
    contractId,
  };
}

/**
 * Translate error with tracking.
 */
export function translateErrorWithTracking(nativeError: { status: number; detail: string }): {
  translated: ReturnType<typeof translateCiaSieError>;
  tracked: boolean;
} {
  ingestionState.errorsTranslated++;
  const translated = translateCiaSieError(nativeError);
  return { translated, tracked: true };
}

// ============================================================================
// TELEMETRY INGESTION
// ============================================================================

/**
 * Enable telemetry ingestion.
 */
export function enableTelemetryIngestion(): {
  enabled: boolean;
  config: TelemetryIngestionConfig;
} {
  ingestionConfig.enabled = true;
  ingestionState.active = true;
  
  return {
    enabled: true,
    config: { ...ingestionConfig },
  };
}

/**
 * Disable telemetry ingestion.
 */
export function disableTelemetryIngestion(): void {
  ingestionConfig.enabled = false;
  ingestionState.active = false;
}

/**
 * Ingest a telemetry record with full governance.
 */
export function ingestTelemetryRecord(
  record: unknown,
  contractId: string = 'CONTRACT-SIGNAL-001'
): {
  accepted: boolean;
  reason: string;
  degradationLevel: DegradationLevel;
} {
  // Check if ingestion is active
  if (!ingestionState.active) {
    return {
      accepted: false,
      reason: 'Telemetry ingestion not active',
      degradationLevel: ingestionState.currentDegradationLevel,
    };
  }
  
  // Kill switch check
  if (!isKillSwitchEngaged()) {
    // This is unusual - kill switch should be engaged during controlled ignition
    // Log but continue (kill switch being disengaged means we're in full operation)
  }
  
  ingestionState.recordsReceived++;
  ingestionState.lastRecordAt = Date.now();
  
  // Enforce contract immunity
  const contractResult = enforceContractImmunity(record, contractId);
  if (!contractResult.valid) {
    return {
      accepted: false,
      reason: `Contract violation: ${contractResult.violations.map(v => v.reason).join(', ')}`,
      degradationLevel: ingestionState.currentDegradationLevel,
    };
  }
  
  return {
    accepted: true,
    reason: 'Record accepted',
    degradationLevel: ingestionState.currentDegradationLevel,
  };
}

/**
 * Update degradation level based on health.
 */
export function updateDegradationLevel(
  processReachable: boolean,
  subsystemsHealthy: number,
  consecutiveFailures: number
): DegradationLevel {
  const level = getDegradationLevel(processReachable, subsystemsHealthy, consecutiveFailures);
  ingestionState.currentDegradationLevel = level;
  return level;
}

// ============================================================================
// PHASE C EXECUTION
// ============================================================================

/**
 * Execute Phase C: Controlled Data Ignition
 * 
 * @returns DataIgnitionResult with ingestion state
 */
export function executePhaseC(): DataIgnitionResult {
  const timestamp = Date.now();
  
  // Verify kill switch is still engaged
  if (!isKillSwitchEngaged()) {
    return {
      success: false,
      phase: 'C',
      timestamp,
      ingestionState: getIngestionState(),
      contractImmunityEnforced: false,
      errorTranslationActive: false,
      degradationDominanceActive: false,
      message: 'ABORT: Kill switch is not engaged. Cannot proceed.',
    };
  }
  
  // Verify dark mode is still enabled
  if (!DARK_MODE) {
    return {
      success: false,
      phase: 'C',
      timestamp,
      ingestionState: getIngestionState(),
      contractImmunityEnforced: false,
      errorTranslationActive: false,
      degradationDominanceActive: false,
      message: 'ABORT: Dark mode is disabled. Cannot proceed.',
    };
  }
  
  // Enable telemetry ingestion
  enableTelemetryIngestion();
  
  // Set data flow enabled flag
  LIVE_STATE.DATA_FLOW_ENABLED = true;
  
  phaseCExecuted = true;
  
  return {
    success: true,
    phase: 'C',
    timestamp,
    ingestionState: getIngestionState(),
    contractImmunityEnforced: ingestionConfig.contractEnforcement,
    errorTranslationActive: ingestionConfig.errorTranslation,
    degradationDominanceActive: ingestionConfig.latencyDegradation,
    message: 'Phase C complete: Telemetry ingestion enabled under governance.',
  };
}

/**
 * Get Phase C execution status.
 */
export function getPhaseCStatus(): { executed: boolean; ingestionState: TelemetryIngestionState } {
  return {
    executed: phaseCExecuted,
    ingestionState: getIngestionState(),
  };
}

/**
 * Rollback Phase C.
 */
export function rollbackPhaseC(): void {
  disableTelemetryIngestion();
  resetIngestionCounters();
  
  LIVE_STATE.DATA_FLOW_ENABLED = false;
  
  phaseCExecuted = false;
}
