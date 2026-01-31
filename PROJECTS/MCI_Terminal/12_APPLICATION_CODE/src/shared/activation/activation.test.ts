/**
 * Activation Governance Module Tests
 * 
 * LEAP 3: Governed Activation & Irreversibility Control
 * Tests for SILO 8, 9, 10, 11, 12
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  // Core flags
  ACTIVATION_LOCKED,
  KILL_SWITCH_ENGAGED,
} from './index';

import {
  // SILO 8: Governance
  ACTIVATION_PRECONDITIONS,
  createActivationGate,
  validatePreconditions,
  generateAuthorizationRecord,
  type ActivationGate,
} from './governance';

import {
  // SILO 9: Contracts
  RUNTIME_CONTRACTS,
  validateRuntimeContract,
  rejectUnknownFields,
  getContractFingerprint,
} from './contracts';

import {
  // SILO 10: Kill Switch
  isKillSwitchEngaged,
  getKillSwitchState,
  engageKillSwitch,
  executeAbort,
  getAbortSemantics,
  isAbortPossible,
} from './killSwitch';

import {
  // SILO 11: Observability
  captureBaseline,
  getObservabilityState,
  createActivationMetrics,
  OPERATOR_TELEMETRY_PATHS,
} from './observability';

import {
  // SILO 12: Rollback
  generateRollbackProof,
  generateActivationDiff,
  executeRollback,
  verifyRollbackComplete,
  getNuclearRollbackCommand,
  getRollbackTimeEstimate,
} from './rollback';

// ============================================================================
// SILO 8: ACTIVATION GOVERNANCE TESTS
// ============================================================================

describe('SILO 8: Activation Governance & Authorization Lock', () => {
  describe('ACTIVATION_LOCKED flag', () => {
    it('ACTIVATION_LOCKED is true', () => {
      expect(ACTIVATION_LOCKED).toBe(true);
    });

    it('ACTIVATION_LOCKED is const (compile-time)', () => {
      // TypeScript enforces this at compile time
      expect(ACTIVATION_LOCKED).toBe(true);
    });
  });

  describe('ACTIVATION_PRECONDITIONS', () => {
    it('defines multiple preconditions', () => {
      expect(ACTIVATION_PRECONDITIONS.length).toBeGreaterThan(10);
    });

    it('all preconditions have required fields', () => {
      for (const condition of ACTIVATION_PRECONDITIONS) {
        expect(condition.id).toBeTruthy();
        expect(condition.description).toBeTruthy();
        expect(condition.category).toBeTruthy();
        expect(typeof condition.blocking).toBe('boolean');
        expect(typeof condition.verify).toBe('function');
      }
    });

    it('has safety preconditions', () => {
      const safetyConditions = ACTIVATION_PRECONDITIONS.filter(
        c => c.category === 'safety'
      );
      expect(safetyConditions.length).toBeGreaterThan(0);
    });

    it('has authorization preconditions', () => {
      const authConditions = ACTIVATION_PRECONDITIONS.filter(
        c => c.category === 'authorization'
      );
      expect(authConditions.length).toBeGreaterThan(0);
    });

    it('SAFE-001 verifies ACTIVATION_LOCKED is false', () => {
      const safe001 = ACTIVATION_PRECONDITIONS.find(c => c.id === 'SAFE-001');
      expect(safe001).toBeDefined();
      expect(safe001!.verify()).toBe(false); // Should fail when LOCKED
    });
  });

  describe('validatePreconditions', () => {
    it('returns all blockers failed when locked', async () => {
      const result = await validatePreconditions();
      expect(result.blockersCleared).toBe(false);
      expect(result.blockersFailed.length).toBeGreaterThan(0);
    });

    it('SAFE-001 is in blockers failed', async () => {
      const result = await validatePreconditions();
      expect(result.blockersFailed).toContain('SAFE-001');
    });
  });

  describe('generateAuthorizationRecord', () => {
    it('generates record with ID and timestamp', () => {
      const record = generateAuthorizationRecord(
        'intent',
        'PRINCIPAL',
        [],
        ['SAFE-001']
      );
      expect(record.id).toMatch(/^AUTH-INTENT-\d+$/);
      expect(record.timestamp).toBeGreaterThan(0);
    });

    it('marks record invalid when blocking conditions fail', () => {
      const record = generateAuthorizationRecord(
        'intent',
        'PRINCIPAL',
        [],
        ['SAFE-001']
      );
      expect(record.valid).toBe(false);
    });

    it('includes hash for verification', () => {
      const record = generateAuthorizationRecord(
        'intent',
        'PRINCIPAL',
        [],
        []
      );
      expect(record.hash).toBeTruthy();
      expect(record.hash.length).toBeGreaterThan(0);
    });
  });

  describe('createActivationGate', () => {
    let gate: ActivationGate;

    beforeEach(() => {
      gate = createActivationGate();
    });

    it('starts in locked stage', () => {
      expect(gate.stage).toBe('locked');
    });

    it('reports locked when ACTIVATION_LOCKED is true', () => {
      expect(gate.locked).toBe(true);
    });

    it('cannot activate when locked', () => {
      expect(gate.canActivate()).toBe(false);
    });

    it('cannot advance stage when locked', () => {
      const auth = generateAuthorizationRecord('intent', 'TEST', [], []);
      const result = gate.advanceStage(auth);
      expect(result).toBe(false);
    });

    it('abort resets to rolled_back', () => {
      gate.abort();
      expect(gate.stage).toBe('rolled_back');
    });

    it('getStatus returns all blockers failed', () => {
      const status = gate.getStatus();
      expect(status.locked).toBe(true);
      expect(status.readyToAdvance).toBe(false);
    });
  });
});

// ============================================================================
// SILO 9: RUNTIME BOUNDARY CONTRACTS TESTS
// ============================================================================

describe('SILO 9: Runtime Boundary Contract Finalization', () => {
  describe('RUNTIME_CONTRACTS', () => {
    it('defines multiple contracts', () => {
      expect(RUNTIME_CONTRACTS.length).toBeGreaterThan(0);
    });

    it('all contracts have required fields', () => {
      for (const contract of RUNTIME_CONTRACTS) {
        expect(contract.id).toBeTruthy();
        expect(contract.name).toBeTruthy();
        expect(contract.version).toBeTruthy();
        expect(contract.direction).toBeTruthy();
        expect(Array.isArray(contract.allowedFields)).toBe(true);
        expect(Array.isArray(contract.requiredFields)).toBe(true);
        expect(contract.fingerprint).toBeTruthy();
      }
    });

    it('health contract exists', () => {
      const health = RUNTIME_CONTRACTS.find(c => c.id === 'CONTRACT-HEALTH-001');
      expect(health).toBeDefined();
    });

    it('all contracts have forbidden fields', () => {
      for (const contract of RUNTIME_CONTRACTS) {
        expect(contract.forbiddenFields.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateRuntimeContract', () => {
    it('passes valid health response', () => {
      const healthContract = RUNTIME_CONTRACTS.find(c => c.id === 'CONTRACT-HEALTH-001')!;
      const validData = { status: 'ok', app: 'cia-sie-pure', version: '1.0.0' };
      const result = validateRuntimeContract(validData, healthContract);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('fails for missing required fields', () => {
      const healthContract = RUNTIME_CONTRACTS.find(c => c.id === 'CONTRACT-HEALTH-001')!;
      const invalidData = { app: 'test' }; // Missing 'status'
      const result = validateRuntimeContract(invalidData, healthContract);
      expect(result.valid).toBe(false);
      expect(result.violations.some(v => v.type === 'missing_required')).toBe(true);
    });

    it('fails for forbidden fields', () => {
      const healthContract = RUNTIME_CONTRACTS.find(c => c.id === 'CONTRACT-HEALTH-001')!;
      const dataWithForbidden = { status: 'ok', secrets: 'leaked' };
      const result = validateRuntimeContract(dataWithForbidden, healthContract);
      expect(result.valid).toBe(false);
      expect(result.violations.some(v => v.type === 'forbidden_field')).toBe(true);
    });

    it('fails for unknown fields', () => {
      const healthContract = RUNTIME_CONTRACTS.find(c => c.id === 'CONTRACT-HEALTH-001')!;
      const dataWithUnknown = { status: 'ok', unknownField: 'value' };
      const result = validateRuntimeContract(dataWithUnknown, healthContract);
      expect(result.violations.some(v => v.type === 'unknown_field')).toBe(true);
    });

    it('fails for wrong types', () => {
      const healthContract = RUNTIME_CONTRACTS.find(c => c.id === 'CONTRACT-HEALTH-001')!;
      const wrongType = { status: 123 }; // Should be string
      const result = validateRuntimeContract(wrongType, healthContract);
      expect(result.violations.some(v => v.type === 'type_mismatch')).toBe(true);
    });
  });

  describe('rejectUnknownFields', () => {
    it('returns empty for valid data', () => {
      const unknown = rejectUnknownFields({ status: 'ok' }, ['status', 'app']);
      expect(unknown).toHaveLength(0);
    });

    it('returns unknown fields', () => {
      const unknown = rejectUnknownFields(
        { status: 'ok', extra: 'field' },
        ['status']
      );
      expect(unknown).toContain('extra');
    });
  });

  describe('getContractFingerprint', () => {
    it('returns fingerprint for contract', () => {
      const healthContract = RUNTIME_CONTRACTS.find(c => c.id === 'CONTRACT-HEALTH-001')!;
      const fingerprint = getContractFingerprint(healthContract);
      expect(fingerprint).toBe('HEALTH-v1.0.0-2026-01-29');
    });
  });
});

// ============================================================================
// SILO 10: KILL SWITCH & ABORT TESTS
// ============================================================================

describe('SILO 10: Activation Kill-Switch & Abort Semantics', () => {
  describe('KILL_SWITCH_ENGAGED flag', () => {
    it('KILL_SWITCH_ENGAGED is true', () => {
      expect(KILL_SWITCH_ENGAGED).toBe(true);
    });
  });

  describe('isKillSwitchEngaged', () => {
    it('returns true when KILL_SWITCH_ENGAGED is true', () => {
      expect(isKillSwitchEngaged()).toBe(true);
    });
  });

  describe('getKillSwitchState', () => {
    it('returns engaged state', () => {
      const state = getKillSwitchState();
      expect(state.engaged).toBe(true);
      expect(state.source).toBe('compile_time');
    });
  });

  describe('engageKillSwitch', () => {
    it('engages with reason', () => {
      engageKillSwitch('Test engagement');
      const state = getKillSwitchState();
      expect(state.engaged).toBe(true);
    });
  });

  describe('getAbortSemantics', () => {
    it('returns semantics for all phases', () => {
      const semantics = getAbortSemantics();
      expect(semantics.length).toBe(4);
      expect(semantics.map(s => s.phase)).toContain('pre_activation');
      expect(semantics.map(s => s.phase)).toContain('mid_activation');
      expect(semantics.map(s => s.phase)).toContain('post_activation');
      expect(semantics.map(s => s.phase)).toContain('steady_state');
    });

    it('all phases have actions and guarantees', () => {
      for (const semantic of getAbortSemantics()) {
        expect(semantic.actionsRequired.length).toBeGreaterThan(0);
        expect(semantic.guaranteedOutcome).toBeTruthy();
        expect(semantic.maxTimeMs).toBeGreaterThan(0);
      }
    });
  });

  describe('isAbortPossible', () => {
    it('ALWAYS returns true', () => {
      expect(isAbortPossible()).toBe(true);
    });
  });

  describe('executeAbort', () => {
    it('returns success for pre_activation', () => {
      const result = executeAbort('pre_activation');
      expect(result.success).toBe(true);
      expect(result.finalState).toBe('simulation_safe');
    });

    it('includes actions taken', () => {
      const result = executeAbort('mid_activation');
      expect(result.actionsTaken.length).toBeGreaterThan(0);
    });

    it('works for all phases', () => {
      const phases = ['pre_activation', 'mid_activation', 'post_activation', 'steady_state'] as const;
      for (const phase of phases) {
        const result = executeAbort(phase);
        expect(result.success).toBe(true);
      }
    });
  });
});

// ============================================================================
// SILO 11: ACTIVATION OBSERVABILITY TESTS
// ============================================================================

describe('SILO 11: Activation-Time Observability (Dormant)', () => {
  describe('OPERATOR_TELEMETRY_PATHS', () => {
    it('defines multiple paths', () => {
      expect(OPERATOR_TELEMETRY_PATHS.length).toBeGreaterThan(0);
    });

    it('all paths are DISABLED', () => {
      for (const path of OPERATOR_TELEMETRY_PATHS) {
        expect(path.enabled).toBe(false);
      }
    });

    it('paths have correct visibility', () => {
      for (const path of OPERATOR_TELEMETRY_PATHS) {
        expect(['operator_only', 'admin_only', 'public']).toContain(path.visibility);
      }
    });
  });

  describe('captureBaseline', () => {
    it('returns baseline with ID', () => {
      const baseline = captureBaseline();
      expect(baseline.id).toMatch(/^BASELINE-\d+$/);
    });

    it('captures system state correctly', () => {
      const baseline = captureBaseline();
      expect(baseline.systemState.activationLocked).toBe(true);
      expect(baseline.systemState.killSwitchEngaged).toBe(true);
    });

    it('has null latencies in dormant mode', () => {
      const baseline = captureBaseline();
      expect(baseline.latency.healthCheck).toBeNull();
      expect(baseline.latency.telemetryFetch).toBeNull();
    });

    it('includes degradation thresholds', () => {
      const baseline = captureBaseline();
      expect(baseline.degradationThresholds.latencyWarn).toBeGreaterThan(0);
      expect(baseline.degradationThresholds.latencyFail).toBeGreaterThan(0);
    });
  });

  describe('getObservabilityState', () => {
    it('returns inactive when locked', () => {
      const state = getObservabilityState();
      expect(state.active).toBe(false);
    });

    it('indicators are wired but not enabled', () => {
      const state = getObservabilityState();
      expect(state.indicatorsWired).toBe(true);
      expect(state.indicatorsEnabled).toBe(false);
    });
  });

  describe('createActivationMetrics', () => {
    it('creates metrics with ID', () => {
      const metrics = createActivationMetrics();
      expect(metrics.id).toMatch(/^METRICS-\d+$/);
    });

    it('has null activation times', () => {
      const metrics = createActivationMetrics();
      expect(metrics.activationStartedAt).toBeNull();
      expect(metrics.activationCompletedAt).toBeNull();
    });

    it('starts with normal degradation', () => {
      const metrics = createActivationMetrics();
      expect(metrics.degradationLevel).toBe('normal');
    });
  });
});

// ============================================================================
// SILO 12: ROLLBACK PROOF TESTS
// ============================================================================

describe('SILO 12: Irreversibility & Rollback Boundary Proof', () => {
  describe('generateActivationDiff', () => {
    it('shows current state as pre-activation', () => {
      const diff = generateActivationDiff();
      expect(diff.preActivation.activationLocked).toBe(true);
      expect(diff.preActivation.killSwitchEngaged).toBe(true);
    });

    it('shows expected post-activation state', () => {
      const diff = generateActivationDiff();
      expect(diff.postActivation.activationLocked).toBe(false);
      expect(diff.postActivation.killSwitchEngaged).toBe(false);
    });

    it('lists all changes', () => {
      const diff = generateActivationDiff();
      expect(diff.changes.length).toBeGreaterThan(0);
    });

    it('all changes are reversible', () => {
      const diff = generateActivationDiff();
      for (const change of diff.changes) {
        expect(change.reversible).toBe(true);
      }
    });

    it('WebSocket and SSE remain false', () => {
      const diff = generateActivationDiff();
      expect(diff.postActivation.integrationFlags.WEBSOCKET_ENABLED).toBe(false);
      expect(diff.postActivation.integrationFlags.SSE_ENABLED).toBe(false);
    });

    it('blast radius is bounded', () => {
      const diff = generateActivationDiff();
      expect(diff.blastRadius.filesModified).toBeLessThan(10);
      expect(diff.blastRadius.stateChanges).toBeLessThan(20);
    });
  });

  describe('generateRollbackProof', () => {
    it('generates proof with ID', () => {
      const proof = generateRollbackProof();
      expect(proof.id).toMatch(/^ROLLBACK-PROOF-\d+$/);
    });

    it('includes rollback steps', () => {
      const proof = generateRollbackProof();
      expect(proof.steps.length).toBeGreaterThan(0);
    });

    it('time guarantee is under 60 seconds', () => {
      const proof = generateRollbackProof();
      expect(proof.timeGuarantee.target).toBe(60000);
    });

    it('nuclear rollback is available', () => {
      const proof = generateRollbackProof();
      expect(proof.nuclearRollbackAvailable).toBe(true);
    });

    it('is verified', () => {
      const proof = generateRollbackProof();
      expect(proof.verified).toBe(true);
    });
  });

  describe('executeRollback', () => {
    it('succeeds when already in safe state', () => {
      const result = executeRollback();
      expect(result.success).toBe(true);
    });

    it('completes quickly', () => {
      const result = executeRollback();
      expect(result.durationMs).toBeLessThan(1000);
    });
  });

  describe('verifyRollbackComplete', () => {
    it('confirms system is in safe state', () => {
      const verification = verifyRollbackComplete();
      expect(verification.complete).toBe(true);
      expect(verification.checks.every(c => c.passed)).toBe(true);
    });
  });

  describe('getNuclearRollbackCommand', () => {
    it('returns shell command', () => {
      const command = getNuclearRollbackCommand();
      expect(command).toContain('sed');
      expect(command).toContain('ACTIVATION_LOCKED = true');
      expect(command).toContain('DARK_MODE = true');
    });
  });

  describe('getRollbackTimeEstimate', () => {
    it('normal is under 60 seconds', () => {
      const estimate = getRollbackTimeEstimate();
      expect(estimate.normal).toBeLessThan(60000);
    });

    it('nuclear is fastest', () => {
      const estimate = getRollbackTimeEstimate();
      expect(estimate.nuclear).toBeLessThan(estimate.normal);
    });

    it('worst case is 60 seconds', () => {
      const estimate = getRollbackTimeEstimate();
      expect(estimate.worstCase).toBe(60000);
    });
  });
});

// ============================================================================
// CONSTRAINT VERIFICATION TESTS
// ============================================================================

describe('LEAP 3: Constraint Verification', () => {
  it('integration cannot activate accidentally', () => {
    expect(ACTIVATION_LOCKED).toBe(true);
    expect(KILL_SWITCH_ENGAGED).toBe(true);
  });

  it('activation gate cannot advance', () => {
    const gate = createActivationGate();
    expect(gate.canActivate()).toBe(false);
  });

  it('all preconditions fail when locked', async () => {
    const result = await validatePreconditions();
    expect(result.blockersCleared).toBe(false);
  });

  it('abort is always possible', () => {
    expect(isAbortPossible()).toBe(true);
  });

  it('rollback is provably possible', () => {
    const proof = generateRollbackProof();
    expect(proof.verified).toBe(true);
    expect(proof.timeGuarantee.target).toBe(60000);
  });

  it('no WebSocket or SSE in post-activation state', () => {
    const diff = generateActivationDiff();
    expect(diff.postActivation.integrationFlags.WEBSOCKET_ENABLED).toBe(false);
    expect(diff.postActivation.integrationFlags.SSE_ENABLED).toBe(false);
  });

  it('all operator paths are disabled', () => {
    for (const path of OPERATOR_TELEMETRY_PATHS) {
      expect(path.enabled).toBe(false);
    }
  });

  it('observability is dormant', () => {
    const state = getObservabilityState();
    expect(state.active).toBe(false);
  });
});
