/**
 * Live Activation Module Tests
 * 
 * LEAP 5: Authorized Live Activation & Operational Assumption
 * Tests for PHASE A, B, C, D, E and orchestration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Phase A
import {
  executePhaseA,
  rollbackPhaseA,
  getPhaseAStatus,
  capturePreActivationBaseline,
  generateAuthorizationFingerprint,
} from './phaseA';

// Phase B
import {
  executePhaseB,
  rollbackPhaseB,
  getPhaseBStatus,
  performLiveHealthCheck,
  classifyLiveLatency,
  setMockHealthResponse,
  resetMockHealthResponses,
} from './phaseB';

// Phase C
import {
  executePhaseC,
  rollbackPhaseC,
  getPhaseCStatus,
  enableTelemetryIngestion,
  disableTelemetryIngestion,
  enforceContractImmunity,
  ingestTelemetryRecord,
  getIngestionState,
  resetIngestionCounters,
} from './phaseC';

// Phase D
import {
  executePhaseD,
  rollbackPhaseD,
  getPhaseDStatus,
  confirmOperatorTruth,
  verifyLiveIndicators,
  verifyNoFalseReadiness,
} from './phaseD';

// Phase E
import {
  executePhaseE,
  rollbackPhaseE,
  getPhaseEStatus,
  getOperationalState,
  assumeOperationalState,
  generateLiveOperationalCertificate,
} from './phaseE';

// Orchestrator
import {
  executeLeap5,
  abortLeap5,
  getLeap5Status,
  resetLeap5State,
} from './orchestrator';

// Dependencies
import { isKillSwitchEngaged } from '../activation/killSwitch';
import { DARK_MODE } from '../integration';

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

describe('LEAP 5: Authorized Live Activation', () => {
  beforeEach(() => {
    // Reset all state before each test
    resetLeap5State();
    resetMockHealthResponses();
    resetIngestionCounters();
  });

  afterEach(() => {
    // Cleanup after each test
    resetLeap5State();
  });

  // ==========================================================================
  // PHASE A TESTS
  // ==========================================================================

  describe('PHASE A: Executive Unlock', () => {
    it('generates unique authorization fingerprint', () => {
      const fp1 = generateAuthorizationFingerprint();
      const fp2 = generateAuthorizationFingerprint();
      
      expect(fp1).toMatch(/^AUTH-PAD-QL5-/);
      expect(fp2).toMatch(/^AUTH-PAD-QL5-/);
      expect(fp1).not.toBe(fp2); // Unique
    });

    it('captures pre-activation baseline', () => {
      const baseline = capturePreActivationBaseline();
      
      expect(baseline.timestamp).toBeGreaterThan(0);
      expect(baseline.systemState).toBeDefined();
      expect(baseline.authorizationFingerprint).toMatch(/^AUTH-PAD-QL5-/);
    });

    it('executes Phase A successfully', () => {
      const result = executePhaseA();
      
      expect(result.success).toBe(true);
      expect(result.phase).toBe('A');
      expect(result.unlocked).toBe(true);
      expect(result.killSwitchRetained).toBe(true);
      expect(result.darkModeRetained).toBe(true);
      expect(result.baseline).toBeDefined();
    });

    it('tracks Phase A execution status', () => {
      expect(getPhaseAStatus().executed).toBe(false);
      
      executePhaseA();
      
      expect(getPhaseAStatus().executed).toBe(true);
      expect(getPhaseAStatus().baseline).not.toBeNull();
    });

    it('rollback Phase A clears state', () => {
      executePhaseA();
      expect(getPhaseAStatus().executed).toBe(true);
      
      rollbackPhaseA();
      
      expect(getPhaseAStatus().executed).toBe(false);
      expect(getPhaseAStatus().baseline).toBeNull();
    });
  });

  // ==========================================================================
  // PHASE B TESTS
  // ==========================================================================

  describe('PHASE B: Live Connectivity Enablement', () => {
    beforeEach(() => {
      executePhaseA(); // Phase A required
    });

    it('classifies latency correctly', () => {
      expect(classifyLiveLatency(50)).toBe('ok');
      expect(classifyLiveLatency(200)).toBe('warn');
      expect(classifyLiveLatency(1000)).toBe('slow');
      expect(classifyLiveLatency(3000)).toBe('fail');
      expect(classifyLiveLatency(null)).toBe('unreachable');
    });

    it('performs live health check', async () => {
      const health = await performLiveHealthCheck();
      
      expect(health.overall).toBeDefined();
      expect(health.subsystems.length).toBe(4);
      expect(health.timestamp).toBeGreaterThan(0);
    });

    it('executes Phase B successfully', async () => {
      const result = await executePhaseB();
      
      expect(result.success).toBe(true);
      expect(result.phase).toBe('B');
      expect(result.externalRealityConfirmed).toBe(true);
      expect(result.dataFlowEnabled).toBe(false); // Must be false
    });

    it('detects unhealthy subsystems', async () => {
      setMockHealthResponse('process', { reachable: false, latencyMs: 0 });
      setMockHealthResponse('database', { reachable: false, latencyMs: 0 });
      
      const health = await performLiveHealthCheck();
      
      expect(health.overall).not.toBe('healthy');
    });

    it('tracks Phase B execution status', async () => {
      expect(getPhaseBStatus().executed).toBe(false);
      
      await executePhaseB();
      
      expect(getPhaseBStatus().executed).toBe(true);
      expect(getPhaseBStatus().healthStatus).not.toBeNull();
    });
  });

  // ==========================================================================
  // PHASE C TESTS
  // ==========================================================================

  describe('PHASE C: Controlled Data Ignition', () => {
    beforeEach(async () => {
      executePhaseA();
      await executePhaseB();
    });

    it('enables telemetry ingestion', () => {
      const result = enableTelemetryIngestion();
      
      expect(result.enabled).toBe(true);
      expect(result.config.readOnly).toBe(true); // Always read-only
    });

    it('enforces contract immunity', () => {
      enableTelemetryIngestion();
      
      const validResult = enforceContractImmunity(
        { status: 'ok', timestamp: Date.now() },
        'CONTRACT-HEALTH-001'
      );
      
      // Valid data should be accepted (may have violations for missing fields)
      expect(validResult.contractId).toBe('CONTRACT-HEALTH-001');
    });

    it('rejects malformed data', () => {
      enableTelemetryIngestion();
      
      const invalidResult = enforceContractImmunity(
        { __invalid: true, secrets: 'bad' },
        'CONTRACT-HEALTH-001'
      );
      
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.violations.length).toBeGreaterThan(0);
    });

    it('tracks ingestion state', () => {
      executePhaseC();
      
      const state = getIngestionState();
      expect(state.active).toBe(true);
      expect(state.recordsReceived).toBe(0);
    });

    it('executes Phase C successfully', () => {
      const result = executePhaseC();
      
      expect(result.success).toBe(true);
      expect(result.phase).toBe('C');
      expect(result.contractImmunityEnforced).toBe(true);
      expect(result.errorTranslationActive).toBe(true);
      expect(result.degradationDominanceActive).toBe(true);
    });

    it('tracks Phase C execution status', () => {
      expect(getPhaseCStatus().executed).toBe(false);
      
      executePhaseC();
      
      expect(getPhaseCStatus().executed).toBe(true);
      expect(getPhaseCStatus().ingestionState.active).toBe(true);
    });
  });

  // ==========================================================================
  // PHASE D TESTS
  // ==========================================================================

  describe('PHASE D: Operator Truth Confirmation', () => {
    beforeEach(async () => {
      executePhaseA();
      await executePhaseB();
      executePhaseC();
    });

    it('verifies live indicators', () => {
      const indicators = verifyLiveIndicators();
      
      expect(indicators.length).toBeGreaterThan(3);
      expect(indicators.every(i => i.indicator !== '')).toBe(true);
    });

    it('verifies no false readiness', () => {
      const result = verifyNoFalseReadiness();
      
      expect(result.passed).toBe(true);
      expect(result.evidence.length).toBeGreaterThan(0);
    });

    it('confirms operator truth', () => {
      const report = confirmOperatorTruth();
      
      expect(report.id).toMatch(/^LIVE-TRUTH-/);
      expect(report.indicators.length).toBeGreaterThan(0);
    });

    it('executes Phase D successfully', () => {
      const result = executePhaseD();
      
      expect(result.phase).toBe('D');
      expect(result.truthReport).toBeDefined();
      expect(result.truthReport.noFalseReadiness).toBe(true);
      expect(result.truthReport.noSilentFailures).toBe(true);
    });

    it('tracks Phase D execution status', () => {
      expect(getPhaseDStatus().executed).toBe(false);
      
      executePhaseD();
      
      expect(getPhaseDStatus().executed).toBe(true);
      expect(getPhaseDStatus().truthReport).not.toBeNull();
    });
  });

  // ==========================================================================
  // PHASE E TESTS
  // ==========================================================================

  describe('PHASE E: Operational Assumption', () => {
    beforeEach(async () => {
      executePhaseA();
      await executePhaseB();
      executePhaseC();
      executePhaseD();
    });

    it('gets operational state', () => {
      const state = getOperationalState();
      
      expect(state.observable).toBe(true);
      expect(state.governed).toBe(true);
      expect(state.abortable).toBe(true);
    });

    it('generates live operational certificate', () => {
      const cert = generateLiveOperationalCertificate();
      
      expect(cert.id).toMatch(/^LIVE-CERT-/);
      expect(cert.rollbackGuarantee).toBe('< 60 seconds');
      expect(cert.abortDominance).toContain('ABSOLUTE');
    });

    it('executes Phase E successfully', () => {
      const result = executePhaseE();
      
      expect(result.success).toBe(true);
      expect(result.phase).toBe('E');
      expect(result.operationalState.live).toBe(true);
      expect(result.certificate.certification).toBe('LIVE');
    });

    it('fails Phase E if prerequisites missing', () => {
      // Reset and try Phase E without other phases
      resetLeap5State();
      
      const result = executePhaseE();
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Phase A not executed');
    });

    it('tracks Phase E execution status', () => {
      expect(getPhaseEStatus().executed).toBe(false);
      
      executePhaseE();
      
      expect(getPhaseEStatus().executed).toBe(true);
      expect(getPhaseEStatus().certificate).not.toBeNull();
    });
  });

  // ==========================================================================
  // ORCHESTRATOR TESTS
  // ==========================================================================

  describe('LEAP 5 Orchestrator', () => {
    it('executes complete LEAP 5 sequence', async () => {
      const result = await executeLeap5();
      
      expect(result.success).toBe(true);
      expect(result.completed).toBe(true);
      expect(result.aborted).toBe(false);
      expect(result.phases.A).not.toBeNull();
      expect(result.phases.B).not.toBeNull();
      expect(result.phases.C).not.toBeNull();
      expect(result.phases.D).not.toBeNull();
      expect(result.phases.E).not.toBeNull();
      expect(result.certificate).not.toBeNull();
      expect(result.message).toContain('SYSTEM IS LIVE');
    });

    it('tracks LEAP 5 status', async () => {
      const beforeStatus = getLeap5Status();
      expect(beforeStatus.phasesExecuted.length).toBe(0);
      
      await executeLeap5();
      
      const afterStatus = getLeap5Status();
      expect(afterStatus.phasesExecuted).toContain('A');
      expect(afterStatus.phasesExecuted).toContain('B');
      expect(afterStatus.phasesExecuted).toContain('C');
      expect(afterStatus.phasesExecuted).toContain('D');
      expect(afterStatus.phasesExecuted).toContain('E');
      expect(afterStatus.currentPhase).toBe('COMPLETE');
    });

    it('aborts LEAP 5 and rolls back all phases', async () => {
      await executeLeap5();
      
      const abortResult = abortLeap5();
      
      expect(abortResult.aborted).toBe(true);
      expect(abortResult.phasesRolledBack).toContain('E');
      expect(abortResult.phasesRolledBack).toContain('D');
      expect(abortResult.phasesRolledBack).toContain('C');
      expect(abortResult.phasesRolledBack).toContain('B');
      expect(abortResult.phasesRolledBack).toContain('A');
    });

    it('measures execution duration', async () => {
      const result = await executeLeap5();
      
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.completedAt).toBeGreaterThanOrEqual(result.startedAt);
    });
  });

  // ==========================================================================
  // CONSTRAINT VERIFICATION TESTS
  // ==========================================================================

  describe('LEAP 5: Constraint Verification', () => {
    it('kill switch remains engaged during execution', async () => {
      expect(isKillSwitchEngaged()).toBe(true);
      
      await executeLeap5();
      
      expect(isKillSwitchEngaged()).toBe(true);
    });

    it('dark mode compile-time constant is true', () => {
      expect(DARK_MODE).toBe(true);
    });

    it('abort is always possible', async () => {
      await executeLeap5();
      
      const result = abortLeap5();
      
      expect(result.aborted).toBe(true);
    });

    it('rollback clears all state', async () => {
      await executeLeap5();
      abortLeap5();
      
      expect(getPhaseAStatus().executed).toBe(false);
      expect(getPhaseBStatus().executed).toBe(false);
      expect(getPhaseCStatus().executed).toBe(false);
      expect(getPhaseDStatus().executed).toBe(false);
      expect(getPhaseEStatus().executed).toBe(false);
    });

    it('certificate shows live status after completion', async () => {
      const result = await executeLeap5();
      
      expect(result.certificate?.certification).toBe('LIVE');
      expect(result.certificate?.operationalState.live).toBe(true);
      expect(result.certificate?.operationalState.abortable).toBe(true);
    });

    it('data flow only enabled in Phase C', async () => {
      const { LIVE_STATE } = await import('./index');
      
      executePhaseA();
      expect(LIVE_STATE.DATA_FLOW_ENABLED).toBe(false);
      
      await executePhaseB();
      expect(LIVE_STATE.DATA_FLOW_ENABLED).toBe(false);
      
      executePhaseC();
      expect(LIVE_STATE.DATA_FLOW_ENABLED).toBe(true);
    });
  });

  // ==========================================================================
  // POST-ACTIVATION GUARANTEE TESTS
  // ==========================================================================

  describe('LEAP 5: Post-Activation Guarantees', () => {
    it('complete LEAP 5 verifies all guarantees', async () => {
      // Execute full LEAP 5
      const result = await executeLeap5();
      
      // Verify success
      expect(result.success).toBe(true);
      expect(result.completed).toBe(true);
      
      // Verify status
      const status = getLeap5Status();
      expect(status.currentPhase).toBe('COMPLETE');
      
      // Verify certificate
      expect(result.certificate).not.toBeNull();
      expect(result.certificate?.certification).toBe('LIVE');
      expect(result.certificate?.invariantsPreserved).toBe(true);
      expect(result.certificate?.rollbackGuarantee).toBe('< 60 seconds');
      expect(result.certificate?.abortDominance).toContain('ABSOLUTE');
      
      // Verify abort dominance
      const abort = abortLeap5();
      expect(abort.aborted).toBe(true);
      expect(abort.phasesRolledBack.length).toBe(5);
    });

    it('rollback executes in under 60 seconds', async () => {
      // Execute full LEAP 5
      const result = await executeLeap5();
      expect(result.success).toBe(true);
      
      // Measure rollback time
      const startTime = Date.now();
      abortLeap5();
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(60000);
    });

    it('abort is always possible even after completion', async () => {
      // Execute full LEAP 5
      const result = await executeLeap5();
      expect(result.success).toBe(true);
      
      // Verify we can abort
      const abort = abortLeap5();
      expect(abort.aborted).toBe(true);
      
      // Verify state is cleared
      const status = getLeap5Status();
      expect(status.aborted).toBe(true);
    });
  });
});
