# Activation Observability Schema
## SILO 11: Activation Visibility Framework

**Document ID:** OBSERVABILITY-001  
**Date:** 2026-01-29  
**Directive:** PAD-QL3 (LEAP 3)  
**Status:** ✅ **WIRED (DORMANT)**

---

## Purpose

This document defines the observability framework that ensures the moment of activation is fully visible. The system cannot "silently" enter live mode.

---

## Current State

| Component | Status |
|-----------|--------|
| Observability Infrastructure | ✅ WIRED |
| Indicators | ✅ WIRED but OFF |
| Baselines | ✅ CAPTURABLE |
| Metrics | ✅ DEFINED |
| Operator Paths | ✅ DECLARED (DISABLED) |

---

## Baseline Capture

### What Gets Captured

Before activation, the system captures:

| Metric | Description | Current |
|--------|-------------|---------|
| Health check latency | Time to reach `/health` | null (dormant) |
| Telemetry fetch latency | Time to fetch telemetry | null (dormant) |
| Signal fetch latency | Time to fetch signals | null (dormant) |
| Narrative fetch latency | Time to fetch narratives | null (dormant) |
| Error rate (total) | Errors per minute | 0 |
| Error rate (by category) | Errors by type | {} |

### Baseline Structure

```typescript
interface ActivationBaseline {
  id: string;              // "BASELINE-1706566800000"
  capturedAt: number;      // Timestamp
  latency: {
    healthCheck: number | null;
    telemetryFetch: number | null;
    signalFetch: number | null;
    narrativeFetch: number | null;
  };
  errorRate: {
    total: number;
    byCategory: Record<string, number>;
  };
  degradationThresholds: {
    latencyWarn: number;   // 500ms
    latencyFail: number;   // 2000ms
    errorRateWarn: number; // 1/minute
    errorRateFail: number; // 10/minute
  };
  systemState: {
    activationLocked: boolean;
    killSwitchEngaged: boolean;
    testsPassing: boolean;
    invariantsIntact: boolean;
  };
}
```

---

## Degradation Thresholds

### Pre-Calculated Thresholds

| Metric | Warn | Fail |
|--------|------|------|
| Latency (any) | > 500ms | > 2000ms |
| Error rate | > 1/min | > 10/min |
| Consecutive failures | > 2 | > 3 |

### Threshold Actions

| Threshold Exceeded | Action |
|--------------------|--------|
| Latency WARN | Yellow indicator |
| Latency FAIL | Red indicator, alert |
| Error WARN | Yellow indicator |
| Error FAIL | Kill switch trigger |
| Consecutive failures | Automatic abort |

---

## Activation Metrics

During/after activation, the system tracks:

```typescript
interface ActivationMetrics {
  id: string;
  activationStartedAt: number | null;
  activationCompletedAt: number | null;
  currentLatency: {
    healthCheck: number | null;
    telemetryFetch: number | null;
    signalFetch: number | null;
    narrativeFetch: number | null;
  };
  latencyDelta: {          // Difference from baseline
    healthCheck: number | null;
    telemetryFetch: number | null;
    signalFetch: number | null;
    narrativeFetch: number | null;
  };
  errorCount: number;
  errorsSinceActivation: number;
  degradationLevel: DegradationLevel;
  thresholdsExceeded: boolean;
}
```

---

## Cockpit Indicators

### Indicator States

| Indicator | State | Meaning |
|-----------|-------|---------|
| ENGINE | DISCONNECTED | CIA-SIE-PURE not reached |
| ENGINE | CONNECTED | Health check passing |
| LATENCY | OK (green) | ≤ 100ms |
| LATENCY | WARN (yellow) | ≤ 500ms |
| LATENCY | SLOW (orange) | ≤ 2000ms |
| LATENCY | FAIL (red) | > 2000ms |
| INTEGRATION | OFF | DARK_MODE = true |
| INTEGRATION | READY | Activation possible |
| INTEGRATION | ACTIVE | Integration running |

### Current Indicator State

| Indicator | Current |
|-----------|---------|
| ENGINE | DISCONNECTED |
| LATENCY | N/A |
| INTEGRATION | OFF |

**All indicators correctly reflect DORMANT state.**

---

## Operator Telemetry Paths

### Declared Paths (ALL DISABLED)

| ID | Path | Method | Visibility | Enabled |
|----|------|--------|------------|---------|
| OP-001 | `/api/operator/activation-status` | GET | Operator | ❌ NO |
| OP-002 | `/api/operator/latency` | GET | Operator | ❌ NO |
| OP-003 | `/api/operator/errors` | GET | Operator | ❌ NO |
| OP-004 | `/api/operator/degradation` | GET | Operator | ❌ NO |
| OP-005 | `/api/operator/kill-switch` | POST | Admin | ❌ NO |

### Visibility Levels

| Level | Who Can Access |
|-------|----------------|
| `operator_only` | System operators |
| `admin_only` | System administrators |
| `public` | Anyone (not used for sensitive data) |

---

## Observable Events

When activation occurs, these events are observable:

| Event | Observable By | How |
|-------|---------------|-----|
| Baseline captured | Operator | Log + API |
| Activation started | Operator | Log + Indicator |
| Health check passed | User + Operator | Indicator |
| Data flow started | Operator | Log |
| Thresholds exceeded | User + Operator | Indicator + Alert |
| Abort triggered | User + Operator | Indicator + Log |
| Rollback complete | Operator | Log |

---

## Silent Entry Prevention

The system CANNOT silently enter live mode because:

| Mechanism | Prevents |
|-----------|----------|
| Compile-time constants | Accidental activation |
| Multi-stage gates | Implicit activation |
| Cockpit indicators | Unnoticed activation |
| Operator telemetry | Hidden state |
| Error rate zero-baseline | Masked failures |
| Latency baselines | Performance regression |

---

## Observability State

```typescript
function getObservabilityState(): ObservabilityState {
  return {
    active: false,           // Dormant
    baseline: null,          // Not captured
    metrics: null,           // Not tracking
    indicatorsWired: true,   // Infrastructure ready
    indicatorsEnabled: false // But not displaying
  };
}
```

---

## Attestation

Activation-time observability is WIRED but DORMANT:

| Guarantee | Status |
|-----------|--------|
| Latency baselines capturable | ✅ READY |
| Error rate zero-baseline established | ✅ READY |
| Degradation thresholds pre-calculated | ✅ DEFINED |
| Cockpit indicators wired | ✅ WIRED |
| Cockpit indicators OFF | ✅ VERIFIED |
| Operator telemetry paths declared | ✅ DECLARED |
| Operator telemetry paths DISABLED | ✅ VERIFIED |
| System cannot silently enter live mode | ✅ GUARANTEED |

---

*End of Activation Observability Schema*
