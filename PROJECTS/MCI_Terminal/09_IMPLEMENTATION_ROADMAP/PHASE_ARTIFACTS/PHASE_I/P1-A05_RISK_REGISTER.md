# P1-A05: Risk Register
## Phase I — Mission Definition

**Artifact ID:** P1-A05
**Phase:** I — Mission Definition
**Status:** CREATED (Gap Fill)
**Version:** 1.0
**Date:** 2026-01-27

---

## Purpose

This document identifies, assesses, and provides mitigation strategies for all known risks to the MCI project.

---

## Risk Assessment Matrix

```
┌─────────────────────────────────────────────────────────────┐
│                    RISK SEVERITY MATRIX                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  IMPACT      │ Low Prob  │ Med Prob  │ High Prob │         │
│  ────────────┼───────────┼───────────┼───────────┤         │
│  Critical    │  MEDIUM   │   HIGH    │  CRITICAL │         │
│  High        │   LOW     │  MEDIUM   │   HIGH    │         │
│  Medium      │   LOW     │   LOW     │  MEDIUM   │         │
│  Low         │ MINIMAL   │   LOW     │   LOW     │         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Risk Categories

| Category | Description |
|----------|-------------|
| **TECHNICAL** | Technology, implementation, integration risks |
| **OPERATIONAL** | Runtime, availability, performance risks |
| **EXTERNAL** | Third-party dependencies, broker risks |
| **COMPLIANCE** | CR violation risks |
| **PROJECT** | Schedule, scope, resource risks |

---

## Risk Register

### TECHNICAL RISKS

#### R-T01: Token Expiry Handling Failure

| Attribute | Value |
|-----------|-------|
| **ID** | R-T01 |
| **Category** | Technical |
| **Description** | Token expires at 6 AM IST but system fails to detect/handle |
| **Probability** | Medium |
| **Impact** | Critical (all operations fail) |
| **Severity** | HIGH |
| **CR Impact** | CR-004 violation |
| **Mitigation** | Implement countdown timer with 15-min warning; auto-redirect to Phase 0 |
| **Contingency** | Force session clear on any auth error |
| **Owner** | Executor |
| **Status** | Mitigated in code |

#### R-T02: WebSocket Connection Instability

| Attribute | Value |
|-----------|-------|
| **ID** | R-T02 |
| **Category** | Technical |
| **Description** | WebSocket drops during telemetry, data becomes stale |
| **Probability** | Medium |
| **Impact** | High (operator makes decisions on stale data) |
| **Severity** | MEDIUM |
| **Mitigation** | Exponential backoff reconnection (5 attempts); stale data indicator |
| **Contingency** | Fall back to REST polling at 5-second intervals |
| **Owner** | Executor |
| **Status** | Mitigated in code |

#### R-T03: State Management Corruption

| Attribute | Value |
|-----------|-------|
| **ID** | R-T03 |
| **Category** | Technical |
| **Description** | Zustand store becomes inconsistent across phases |
| **Probability** | Low |
| **Impact** | High (incorrect UI state) |
| **Severity** | LOW |
| **Mitigation** | Immutable updates; state validation; phase transition guards |
| **Contingency** | Force full state reset via browser refresh |
| **Owner** | Executor |
| **Status** | Mitigated by design |

---

### OPERATIONAL RISKS

#### R-O01: Shutdown Sequence Interruption

| Attribute | Value |
|-----------|-------|
| **ID** | R-O01 |
| **Category** | Operational |
| **Description** | User closes browser mid-shutdown, leaving orders/positions open |
| **Probability** | Medium |
| **Impact** | Critical (financial exposure) |
| **Severity** | HIGH |
| **CR Impact** | CR-002 violation |
| **Mitigation** | `beforeunload` warning; persist shutdown state; resume on reconnect |
| **Contingency** | CIA-SIE-PURE has independent timeout-based cleanup |
| **Owner** | Executor + Engine team |
| **Status** | Partially mitigated |

#### R-O02: High Latency During Market Volatility

| Attribute | Value |
|-----------|-------|
| **ID** | R-O02 |
| **Category** | Operational |
| **Description** | Telemetry updates slow during high market activity |
| **Probability** | Medium |
| **Impact** | Medium (delayed decision-making) |
| **Severity** | MEDIUM |
| **Mitigation** | Data throttling; priority queue for positions over market data |
| **Contingency** | Display latency warning to operator |
| **Owner** | Executor |
| **Status** | Design consideration |

---

### EXTERNAL RISKS

#### R-E01: Kite API Downtime

| Attribute | Value |
|-----------|-------|
| **ID** | R-E01 |
| **Category** | External |
| **Description** | Zerodha Kite API unavailable during market hours |
| **Probability** | Low |
| **Impact** | Critical (no authentication possible) |
| **Severity** | MEDIUM |
| **Mitigation** | Scan check detects before ignition; clear messaging to operator |
| **Contingency** | Switch to alternate broker if configured |
| **Owner** | External (Zerodha) |
| **Status** | Monitoring only |

#### R-E02: Broker API Rate Limiting

| Attribute | Value |
|-----------|-------|
| **ID** | R-E02 |
| **Category** | External |
| **Description** | Exceed Kite API rate limits, requests rejected |
| **Probability** | Low |
| **Impact** | High (telemetry stops) |
| **Severity** | LOW |
| **Mitigation** | Request batching; rate limit tracking; exponential backoff |
| **Contingency** | Reduce polling frequency automatically |
| **Owner** | Executor |
| **Status** | Mitigated in design |

#### R-E03: Broker API Breaking Changes

| Attribute | Value |
|-----------|-------|
| **ID** | R-E03 |
| **Category** | External |
| **Description** | Kite updates API without notice, breaking integration |
| **Probability** | Low |
| **Impact** | Critical (authentication/data fails) |
| **Severity** | MEDIUM |
| **Mitigation** | Pin API versions; monitor Kite changelog; abstraction layer |
| **Contingency** | Emergency patch deployment |
| **Owner** | Executor |
| **Status** | Monitoring required |

---

### COMPLIANCE RISKS

#### R-C01: CR-003 Error Format Violation

| Attribute | Value |
|-----------|-------|
| **ID** | R-C01 |
| **Category** | Compliance |
| **Description** | Developer introduces error without WHAT/WHY/HOW format |
| **Probability** | Medium |
| **Impact** | Medium (user confusion) |
| **Severity** | MEDIUM |
| **CR Impact** | CR-003 violation |
| **Mitigation** | Lint rule for error format; code review checklist; ErrorDisplay component |
| **Contingency** | Error wrapper catches and reformats |
| **Owner** | Executor |
| **Status** | Mitigated by tooling |

#### R-C02: UXMI State Implementation Gap

| Attribute | Value |
|-----------|-------|
| **ID** | R-C02 |
| **Category** | Compliance |
| **Description** | UI component missing one or more of 7 required states |
| **Probability** | Medium |
| **Impact** | Medium (inconsistent UX) |
| **Severity** | MEDIUM |
| **CR Impact** | CR-005 violation |
| **Mitigation** | UXMI component library with all states built-in; component audit |
| **Contingency** | Visual regression testing |
| **Owner** | Executor |
| **Status** | Mitigated by library |

---

### PROJECT RISKS

#### R-P01: Specification Drift

| Attribute | Value |
|-----------|-------|
| **ID** | R-P01 |
| **Category** | Project |
| **Description** | Implementation diverges from documented specifications |
| **Probability** | Medium |
| **Impact** | High (incorrect behavior) |
| **Severity** | MEDIUM |
| **Mitigation** | Checkpoint reviews; LTT traceability; test-driven development |
| **Contingency** | Forensic audit and correction cycle |
| **Owner** | Principal + Executor |
| **Status** | Active mitigation |

#### R-P02: Context Loss Between Sessions

| Attribute | Value |
|-----------|-------|
| **ID** | R-P02 |
| **Category** | Project |
| **Description** | AI loses context of previous decisions/work between sessions |
| **Probability** | High |
| **Impact** | Medium (duplicated work, inconsistency) |
| **Severity** | MEDIUM |
| **Mitigation** | Comprehensive documentation; session summaries; knowledge base |
| **Contingency** | Re-ingestion of session transcripts |
| **Owner** | Principal + Executor |
| **Status** | Active mitigation |

#### R-P03: Quarantined Document Contamination

| Attribute | Value |
|-----------|-------|
| **ID** | R-P03 |
| **Category** | Project |
| **Description** | Accidentally reference quarantined ([Out-of-Scope-Broker]/[Out-of-Scope-Data-Provider]) documents |
| **Probability** | Low |
| **Impact** | High (incorrect implementation) |
| **Severity** | LOW |
| **Mitigation** | Clear quarantine markers; document registry; explicit exclusion |
| **Contingency** | Code review catches incorrect references |
| **Owner** | Executor |
| **Status** | Mitigated by documentation |

---

## Risk Summary Dashboard

| Severity | Count | Trend |
|----------|-------|-------|
| CRITICAL | 0 | - |
| HIGH | 2 | Stable |
| MEDIUM | 8 | Stable |
| LOW | 3 | Stable |
| MINIMAL | 0 | - |

---

## Risk Review Schedule

| Review Type | Frequency | Responsible |
|-------------|-----------|-------------|
| Risk identification | Per feature/phase | Executor |
| Risk assessment update | Weekly | Executor + Principal |
| Mitigation status | Per checkpoint | Executor |
| Full register review | Monthly | Principal |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-27 | Initial creation (Gap Fill) | Claude (AI) |

---

*P1-A05 Risk Register v1.0 | Phase I Artifact | MCI Project*
