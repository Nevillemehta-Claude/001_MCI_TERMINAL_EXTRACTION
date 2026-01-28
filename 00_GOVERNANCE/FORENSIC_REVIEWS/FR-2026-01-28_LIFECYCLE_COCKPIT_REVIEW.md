# FORENSIC REVIEW: Lifecycle Discipline & Cockpit Integrity
## FR-2026-01-28 — NASA-Grade System Verification

**Date:** 2026-01-28
**Classification:** COMPREHENSIVE FORENSIC REVIEW
**Requested By:** Program Director
**Status:** COMPLETE — OPTION B (Gaps Exist)

---

# EXECUTIVE SUMMARY

This forensic review examined **every layer** of the system for lifecycle discipline and cockpit integrity.

| Domain | Verdict | Material Gaps |
|--------|---------|---------------|
| Lifecycle Scripts | **PASS** (with 3 minor concerns) | 0 critical |
| Lifecycle Documentation | **PASS** | 0 |
| Governance & Invariants | **PASS** | 0 |
| UI State Visibility | **PARTIAL** | 6 hidden states |
| Cockpit Indicators | **PARTIAL** | 6 missing indicators (2 HIGH priority) |
| Control-Effect Integrity | **PARTIAL** | 1 simulated connection |

**Overall Assessment: OPTION B — Gaps Exist**

The system lifecycle discipline is fully implemented and documented. However, the cockpit interface has measurable gaps where system reality is not fully visible to the operator.

---

# PART I: SYSTEM LIFECYCLE & TERMINAL DISCIPLINE

## 1.1 Script Implementation Audit

### start.sh — Launch Script

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Forensic cleanup before launch | ✅ PASS | Lines 41-61: `cleanup_residual_processes()` |
| Verify clean state (ports free) | ✅ PASS | Lines 66-89: `verify_clean_state()` |
| Backend started BEFORE frontend | ✅ PASS | Lines 114-137 → 142-173 (sequential) |
| Health check before success | ✅ PASS | Line 127: polls `/api/health` |
| PID tracking in .mci-pids | ⚠️ PARTIAL | Uses `$!` which may capture shell wrapper |
| INV-002 header visible | ✅ PASS | Lines 17-18 reference INV-002 |

### stop.sh — Shutdown Script

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Read PIDs from file | ✅ PASS | Lines 40-49 |
| Stop frontend first | ✅ PASS | Lines 54-70 |
| Stop backend second | ✅ PASS | Lines 75-91 |
| Cleanup orphans | ✅ PASS | Lines 96-107 |
| Remove PID file | ✅ PASS | Lines 112-118 |
| Verify clean state | ✅ PASS | Lines 123-152 |
| 7-step sequence complete | ✅ PASS | 7 functions in order |

### status.sh — Status Check

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Check port 5173 | ✅ PASS | Lines 29-35 |
| Check port 3000 | ✅ PASS | Lines 38-44 |
| Check health endpoint | ✅ PASS | Lines 47-52 |
| Report overall status | ✅ PASS | Lines 66-78 |

### package.json Integration

| Script | Delegation | Status |
|--------|------------|--------|
| `start` | `./scripts/start.sh` | ✅ PASS |
| `stop` | `./scripts/stop.sh` | ✅ PASS |
| `status` | `./scripts/status.sh` | ✅ PASS |
| `restart` | `stop && start` | ✅ PASS |

### Minor Concerns (Non-Critical)

1. **PID Accuracy** (Medium): `$!` captures shell wrapper PID, not server PID
   - Impact: Minor — stop.sh uses fallback port-based kill
   - Fix: Use `lsof -ti :PORT` for accurate PID

2. **Bypass Scripts** (Low): `npm run dev` and `npm run server` bypass lifecycle
   - Impact: Developer convenience, not production risk
   - Recommendation: Add warning comment

3. **PID File Cross-Validation** (Low): status.sh doesn't validate PID file accuracy
   - Impact: Cosmetic only — port checks are authoritative

---

## 1.2 Architecture Documentation Audit

### 2.14_SYSTEM_LIFECYCLE.md

| Requirement | Status |
|-------------|--------|
| Launch sequence documented | ✅ 6 steps match start.sh |
| Shutdown sequence documented | ✅ 7 steps match stop.sh |
| Cold-start equivalence | ✅ Documented with INV-001 reference |
| PID tracking documented | ✅ .mci-pids file documented |
| Port usage documented | ✅ 5173, 3000 specified |
| Tooling subordination | ✅ Table present |

### 2.5_SHUTDOWN_SEQUENCE.md

| Requirement | Status |
|-------------|--------|
| CR-002 6-step in-app shutdown | ✅ Documented |
| Distinction from INV-002 | ✅ Clear separation |

### Diagram-to-Code Consistency

| Diagram Element | Code Location | Match |
|-----------------|---------------|-------|
| "Cleanup residual processes" | start.sh:41 | ✅ |
| "Verify clean state" | start.sh:66 | ✅ |
| "Start backend server" | start.sh:114 | ✅ |
| "Start frontend server" | start.sh:142 | ✅ |
| "Stop frontend" | stop.sh:54 | ✅ |
| "Stop backend" | stop.sh:75 | ✅ |

**No discrepancies found between documentation and implementation.**

---

## 1.3 Governance & Invariant Audit

### INV-002: System Lifecycle Discipline

| Requirement | Document | Status |
|-------------|----------|--------|
| Registered in CONSTITUTIONAL_CONSTRAINTS.md | ✅ Present | Full specification |
| Mapped in PROGRAM_DIRECTOR_DIRECTIVE.md | ✅ INV-A, INV-B, INV-F | All mapped |
| Verification procedures documented | ✅ Present | Cold-start test, status check |
| Non-negotiable constraints listed | ✅ 5 constraints | Complete |

### Related Invariants

| INV | Name | Status | Relation to Lifecycle |
|-----|------|--------|----------------------|
| INV-001 | Daily Credential Continuity | ✅ | Persists across lifecycle |
| INV-002 | System Lifecycle Discipline | ✅ | Core invariant |
| INV-003 | Time & Clock Authority | ✅ | Affects credential expiry |
| INV-006 | Input Sanitization | ✅ | Applied on rehydration |

---

## 1.4 Lifecycle Summary

### Confirmation Statement

I confirm that:

- ✅ Every script path has been checked
- ✅ Every bypass path has been examined (2 found, low risk)
- ✅ No material ambiguity remains in lifecycle discipline
- ✅ Documentation matches implementation exactly
- ✅ Governance correctly registers and enforces lifecycle invariants

### Known Exceptions (Non-Material)

| Exception | Risk | Mitigation |
|-----------|------|------------|
| PID tracking via `$!` | Low | Port-based fallback in stop.sh |
| `npm run dev` bypass | Low | Developer convenience only |

---

# PART II: INTERFACE & COCKPIT CONSONANCE REVIEW

## 2.1 State Visibility Audit

### Phase-by-Phase Analysis

#### Phase 0: Token Capture

| State | Visible | How |
|-------|---------|-----|
| Form input values | ✅ | Input fields |
| Validation errors | ✅ | ErrorDisplay with WHAT/WHY/HOW |
| Loading state | ✅ | Button loading indicator |
| Token validity | ✅ | Success transition |
| Token capture timestamp | ❌ HIDDEN | `tokenCapturedAt` not displayed |
| Token expiry time | ✅ | CredentialsHelper shows expiry |

#### Phase 1: Pre-Ignition Scan

| State | Visible | How |
|-------|---------|-----|
| Individual check status | ✅ | 12 check items with icons |
| Check progress | ✅ | ProgressBar |
| Overall pass/fail | ✅ | Summary message |
| Scan duration | ✅ | Timer display |
| Scan start timestamp | ❌ HIDDEN | Only duration shown |
| Individual check timestamps | ❌ HIDDEN | Not displayed |

#### Phase 2: Ignition

| State | Visible | How |
|-------|---------|-----|
| Backend selection | ✅ | Radio buttons |
| Backend configuration | ✅ | Config display |
| Ignition button state | ✅ | Enabled/disabled |
| Ignition progress | ✅ | Button loading state |
| Backend health pre-check | ❌ HIDDEN | Not verified before ignition |

#### Phase 3: Running (Telemetry)

| State | Visible | How |
|-------|---------|-----|
| Connection status | ⚠️ SIMULATED | Shows "Connected" but uses setTimeout |
| Position data | ✅ | PositionsPanel |
| Order data | ✅ | OrdersPanel |
| Account data | ✅ | AccountPanel |
| System health | ✅ | SystemHealthPanel |
| Market data | ✅ | MarketDataPanel |
| Activity log | ✅ | ActivityLogPanel |
| Last update timestamp | ✅ | Shown in SystemHealthPanel |
| Token timer | ❌ HIDDEN | Not visible in Phase 3 |
| Token expiry countdown | ❌ HIDDEN | Not visible when running |
| Data age indicators | ⚠️ PARTIAL | Only in SystemHealthPanel |

#### Phase 4: Shutdown

| State | Visible | How |
|-------|---------|-----|
| Shutdown options | ✅ | Checkboxes |
| Shutdown progress | ✅ | Step indicators |
| Step completion | ✅ | Visual progress |
| Emergency stop | ✅ | Button available |

### Hidden States Summary

| Hidden State | Location | Impact |
|--------------|----------|--------|
| `tokenCapturedAt` | tokenStore | Cannot verify when token was captured |
| Scan timestamps | scannerStore | Cannot audit exact check times |
| Token timer in Phase 3 | App.tsx | **HIGH** — Cannot monitor token expiry while running |
| Backend health pre-check | Ignition | Cannot verify backend reachable before ignition |
| Real connection status | TelemetryDashboard | **HIGH** — Connection is simulated, not real |
| Phase transition history | N/A | No log of state changes |

---

## 2.2 Meters, Indicators & Signals Audit

### Present Indicators

| Indicator | Always Visible | Real-Time | Accurate |
|-----------|---------------|-----------|----------|
| Phase indicator (0-3-4) | ✅ | ✅ | ✅ |
| Token timer | ⚠️ Only Phase 0-2 | ✅ | ✅ |
| Connection status dot | ✅ Phase 3 only | ✅ | ❌ SIMULATED |
| System health status | ✅ Phase 3 only | ✅ | ⚠️ Mock data |
| CPU/Memory gauges | ✅ Phase 3 only | ✅ | ⚠️ Mock data |
| Latency meter | ✅ Phase 3 only | ✅ | ⚠️ Mock data |
| Heartbeat indicator | ✅ Phase 3 only | ✅ | ✅ |

### Missing Indicators

| Missing Indicator | Criticality | What It Should Show |
|-------------------|-------------|---------------------|
| **Backend API health** | HIGH | Is /api/health returning 200? |
| **Running vs Idle distinction** | HIGH | Is system actively trading or monitoring? |
| API response times | MEDIUM | Latency to MCI backend (not broker) |
| Error count aggregation | MEDIUM | How many errors in last N minutes? |
| Network connectivity | MEDIUM | Browser online/offline status |
| Token timer in Phase 3 | MEDIUM | Time until forced re-auth |

### Critical Finding: Simulated Connection

**Location:** `TelemetryDashboard.tsx` lines 33-47

```typescript
// Simulated connection
const connectTimeout = setTimeout(() => {
  setConnected(true);
}, 500);
```

**Impact:** The "Connected" indicator is **false** — it shows connected after a 500ms delay regardless of actual backend connectivity. The operator cannot trust this indicator.

---

## 2.3 Control-Effect Integrity Audit

| Action | Effect Immediate | Effect Visible | Failure Communicated |
|--------|------------------|----------------|---------------------|
| Submit credentials | ✅ | ✅ | ✅ CR-003 format |
| Start scan | ✅ | ✅ | ✅ |
| Select backend | ✅ | ✅ | N/A |
| Ignite system | ✅ | ✅ | ✅ Toast notification |
| Initiate shutdown | ✅ | ✅ | ✅ |
| Reset system | ✅ | ✅ | ✅ |
| Navigate back | ✅ | ✅ | N/A |

**All direct user actions have immediate, visible effects.**

### Controls Without Observable Consequences

| Control | Issue |
|---------|-------|
| Ignition with backend offline | No pre-check — user will see "Connected" even if backend unreachable |

---

## 2.4 Cockpit Completeness Audit

### If This Were a Real Control Cockpit

| Expected Gauge/Warning | Present | Priority |
|------------------------|---------|----------|
| Master warning light (system critical) | ✅ SystemHealthPanel status | — |
| Fuel gauge (token time remaining) | ⚠️ Hidden in Phase 3 | P1 |
| Engine status (backend health) | ❌ Missing | P1 |
| Comms status (WebSocket real) | ❌ Simulated | P1 |
| Speed indicator (operations/sec) | ❌ Missing | P2 |
| Altitude (P&L trend) | ❌ Missing | P2 |
| Error annunciator panel | ⚠️ Errors logged, not aggregated | P2 |
| Connection lost warning | ❌ Missing | P2 |

---

# PART III: PROTOCOL ADHERENCE & GAP EXPLANATION

## 3.1 Why Was Protocol Not Fully Maintained?

### Gap 1: Simulated WebSocket Connection

**Why:** The WebSocket integration with CIA-SIE-PURE is deferred to production. Current implementation is a visual placeholder.

**Type:** Sequencing decision — "integrate later"

**Was it correct?** Partially. The visual placeholder is acceptable for UI development, but it should be **visually distinguished** as simulated.

### Gap 2: Token Timer Hidden in Phase 3

**Why:** Design assumed Phase 3 would have its own session management. The token timer was placed only in pre-running phases.

**Type:** Oversight — the operator needs to see token expiry at all times.

**Was it correct?** No. This is a visibility gap.

### Gap 3: No Backend Health Pre-Check Before Ignition

**Why:** Ignition sequence assumes backend is available based on prior scan. No real-time verification at ignition moment.

**Type:** Assumption — "if scan passed, backend is still up"

**Was it correct?** Incorrect assumption. Backend could fail between scan and ignition.

### Gap 4: Mock Telemetry Data

**Why:** Without CIA-SIE-PURE integration, telemetry panels display placeholder data.

**Type:** Dependency — awaiting external system integration.

**Was it correct?** Acceptable for visual validation phase, but must be clearly marked.

---

## 3.2 What Was Done Correctly vs. Incomplete

### Correct Decisions

| Decision | Evidence |
|----------|----------|
| Lifecycle scripts implement INV-002 | start.sh, stop.sh verified |
| Documentation matches implementation | No discrepancies |
| Phase transitions have guards | canNavigateBack, phase checks |
| Error display uses CR-003 format | ErrorDisplay component |
| Toast notifications for state changes | ToastContainer in App.tsx |
| System health panel shows real-time data | SystemHealthPanel.tsx |
| Heartbeat monitoring implemented | 5-second threshold |

### Incomplete Implementations

| Implementation | Status | Gap |
|----------------|--------|-----|
| WebSocket connection | Simulated | Must be real |
| Backend health indicator | Missing | Must exist |
| Token timer visibility | Phase 0-2 only | Must be always visible |
| Telemetry data | Mock | Must be real (pending integration) |
| Error aggregation | Logged only | Should be surfaced |

### Deferred Requirements

| Requirement | Reason | Priority |
|-------------|--------|----------|
| CIA-SIE-PURE integration | External dependency | P0 |
| Real broker data | Requires CIA-SIE | P0 |
| WebSocket real connection | Requires backend socket server | P1 |

---

## 3.3 Corrective Actions Required

### Structural Changes

| Change | Files | Effort |
|--------|-------|--------|
| Add TokenTimer to Phase 3 header | App.tsx, TelemetryDashboard.tsx | Low |
| Add backend health check before ignition | IgnitionButton.tsx | Medium |
| Replace simulated connection with real WebSocket | TelemetryDashboard.tsx, backend | High |

### Visual Changes

| Change | Files | Effort |
|--------|-------|--------|
| Mark simulated data with visual indicator | TelemetryDashboard.tsx | Low |
| Add "Last Updated" to all panels | All Phase 3 panels | Low |
| Add timestamp displays | TokenCaptureForm, Scanner | Low |

### Behavioral Changes

| Change | Files | Effort |
|--------|-------|--------|
| Backend health polling in Phase 3 | New useBackendHealth hook | Medium |
| Error count aggregation | New ErrorAggregator component | Medium |
| Network connectivity detection | Window online/offline events | Low |

### Governance-Level Changes

| Change | Document | Effort |
|--------|----------|--------|
| Document cockpit requirements as invariant | CONSTITUTIONAL_CONSTRAINTS.md | Low |
| Add UI visibility checklist to phase gates | Phase gate documents | Low |

---

# PART IV: FINAL ATTESTATION

## Attestation: OPTION B

**Gaps exist. They are enumerated, explained, and a corrective path is proposed.**

### Lifecycle Discipline

The system lifecycle discipline is **FULLY CONSONANT** with requirements:
- Scripts implement INV-002 correctly
- Documentation matches implementation
- Governance registers and enforces invariants
- No material gaps or bypasses

### Cockpit Integrity

The cockpit interface has **MEASURABLE GAPS**:
- 6 hidden states that should be visible
- 6 missing indicators (2 HIGH priority)
- 1 simulated indicator presenting false information
- Token expiry not visible when system is running

### Summary of Gaps

| Gap ID | Description | Criticality | Corrective Action |
|--------|-------------|-------------|-------------------|
| GAP-01 | WebSocket connection is simulated | HIGH | Implement real WebSocket or mark as simulation |
| GAP-02 | Token timer not visible in Phase 3 | HIGH | Add TokenTimer to running phase header |
| GAP-03 | No backend health indicator | HIGH | Add health check with visual indicator |
| GAP-04 | Mock telemetry data | MEDIUM | Mark as "SIMULATION" until integrated |
| GAP-05 | No error aggregation | MEDIUM | Add error count indicator |
| GAP-06 | No network status indicator | LOW | Add online/offline detection |

---

## Recommended Immediate Actions

### Priority 1 (Before Production)

1. **Add TokenTimer to Phase 3** — Token expiry must be visible at all times
2. **Replace or mark simulated connection** — Operator cannot trust false indicator
3. **Add backend health pre-check** — Verify connectivity before ignition

### Priority 2 (Before Full Integration)

4. **Mark all mock data as "SIMULATION"** — Visual distinction required
5. **Add error aggregation indicator** — Surface error trends
6. **Add network connectivity indicator** — Detect internet disconnection

---

## Closing Statement

The system lifecycle discipline is sound. The shell scripts, documentation, and governance are aligned and verified.

The cockpit interface, while visually complete for most use cases, does not meet the standard of a **true control cockpit** where all system reality is visible to the operator. The gaps identified are correctable and have clear remediation paths.

This review does not find any deliberate omissions or hidden assumptions. The gaps are primarily the result of:
1. Deferred integration (CIA-SIE-PURE)
2. Phase-specific UI placement decisions
3. Placeholder implementations awaiting real data sources

With the corrective actions implemented, the system would achieve **full consonance** with the Program Director's requirements for rocket-science precision.

---

**Reviewed By:** MCI Development System
**Date:** 2026-01-28
**Attestation:** OPTION B — Gaps Exist, Corrective Path Proposed
