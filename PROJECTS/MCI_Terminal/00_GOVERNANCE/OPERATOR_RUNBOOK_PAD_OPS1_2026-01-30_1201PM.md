# OPERATOR RUNBOOK — AUTOPILOT-GRADE STEADY-STATE OPERATIONS

**Authority:** PAD-OPS1 — OPERATOR RUNBOOK DIRECTIVE
**Classification:** NASA / FAA / NSA-GRADE EXECUTION STANDARD
**Issue Date:** 2026-01-30T11:57:13+0530 (IST)
**Certification Basis:** PAD-AUTO1 (39,160 tests, 0 failures)
**Agent:** Claude Opus 4.5

---

```
╔═══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                    ║
║                         OPERATOR RUNBOOK — PAD-OPS1                                ║
║                                                                                    ║
║   Classification:    AUTOPILOT-GRADE STEADY-STATE OPERATIONS                       ║
║   Standard:          NASA / FAA / NSA-GRADE                                        ║
║   System Coverage:   MCI + CIA-SIE-PURE (Integrated)                              ║
║                                                                                    ║
║   "We do not assume correctness. We continuously prove it.                         ║
║    When in doubt, we abort."                                                       ║
║                                                                                    ║
╚═══════════════════════════════════════════════════════════════════════════════════╝
```

---

## TABLE OF CONTENTS

1. [Section 0: Operator Prerequisites](#section-0--operator-prerequisites-mandatory)
2. [Section 1: System Start-of-Day Check](#section-1--system-start-of-day-check-daily-non-negotiable)
3. [Section 2: Continuous Verification Loop](#section-2--continuous-verification-loop-automated-observed)
4. [Section 3: Drift & Decay Surveillance](#section-3--drift--decay-surveillance-passive-but-critical)
5. [Section 4: Live Operation Monitoring](#section-4--live-operation-monitoring-real-time)
6. [Section 5: Incident Handling](#section-5--incident-handling-when-things-go-wrong)
7. [Section 6: Rectification](#section-6--rectification-when-code-is-touched)
8. [Section 7: Change Governance](#section-7--change-governance-normal-time)
9. [Section 8: Operator Cognitive Safety](#section-8--operator-cognitive-safety)
10. [Section 9: Periodic Re-Certification](#section-9--periodic-re-certification)
11. [Section 10: End-State Guarantee](#section-10--end-state-guarantee)
12. [Appendix A: Quick Reference Cards](#appendix-a--quick-reference-cards)
13. [Appendix B: Contact Escalation Matrix](#appendix-b--contact-escalation-matrix)
14. [Appendix C: Verification Commands](#appendix-c--verification-commands)

---

## SECTION 0 — OPERATOR PREREQUISITES (MANDATORY)

### Purpose
Establish that the operator has the authority, access, and knowledge to safely operate the system.

### Prerequisites Checklist

Before assuming operational authority, the operator **MUST** confirm:

#### ✅ Access Requirements

| System | Access Level | Verification |
|--------|--------------|--------------|
| GitHub Repository | Read + Workflow visibility | Can view Actions tab |
| MCI Cockpit UI | Operator mode | Can access all phases |
| CIA-SIE-PURE Dashboard | Read access | Can view health endpoint |
| Deployment Environment | Dashboard visibility | Can view status |
| Monitoring System | Alert visibility | Can receive notifications |

#### ✅ Knowledge Requirements

| Knowledge Area | Location | Verification |
|----------------|----------|--------------|
| Abort Authority | Section 5.2 of this runbook | Can locate in < 30 seconds |
| Rollback Procedure | Section 5.3 of this runbook | Can recite steps |
| Incident Classification | Section 5.1 of this runbook | Can classify examples |
| Emergency Contacts | Appendix B | Has contact information |

#### ❌ Operator Prohibitions

The operator **MUST NOT**:

| Prohibited Action | Reason | Exception |
|-------------------|--------|-----------|
| Modify code | Violates change governance | Section 6 Rectification only |
| Restart services | May mask underlying issues | Section 5 Incident only |
| Toggle feature flags | Uncontrolled state change | Documented rollback only |
| Bypass verification gates | Compromises certification | NEVER |
| Ignore alerts | Silent failure risk | NEVER |

### Gate Decision

```
┌─────────────────────────────────────────────────────────────────┐
│                    PREREQUISITE GATE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   All prerequisites met?                                         │
│                                                                  │
│   ✅ YES → Proceed to Section 1                                  │
│   ❌ NO  → STOP. Escalate to supervisor immediately.            │
│                                                                  │
│   Missing prerequisite is a BLOCKING condition.                  │
│   Do not proceed. Do not improvise.                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## SECTION 1 — SYSTEM START-OF-DAY CHECK (DAILY, NON-NEGOTIABLE)

### Purpose
Confirm the system has not silently decayed overnight.

### Execution Time
**Daily at market open minus 30 minutes** (08:45 IST for NSE)

### Step 1.1 — Global Status Snapshot

**Action:** Open cockpit UI and record system state.

| Indicator | Expected Value | Location | Record Value |
|-----------|----------------|----------|--------------|
| Engine State | `IDLE` or `RUNNING` | Main dashboard | __________ |
| Health Status | `HEALTHY` | Status bar | __________ |
| Degradation Level | `NONE` | Health panel | __________ |
| Last Verification | < 24 hours ago | Footer | __________ |
| Token Status | `VALID` or `ABSENT` | Phase 0 | __________ |

**Decision Logic:**

```
IF any indicator shows UNKNOWN or STALE:
    → Classify system as DEGRADED
    → Proceed to Section 5 (Incident Handling)
    → Do NOT proceed with normal operations

IF all indicators nominal:
    → Proceed to Step 1.2
```

### Step 1.2 — Health Endpoint Verification

**Action:** Verify each system's health endpoint independently.

#### MCI Health Check

```bash
# Execute health check
curl -w "\n%{http_code} %{time_total}s" http://localhost:3000/api/health

# Expected response:
# {"status":"healthy","timestamp":"..."}
# 200 0.050s
```

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| HTTP Status | 200 | ______ | ☐ PASS ☐ FAIL |
| Latency | < 100ms | ______ | ☐ PASS ☐ FAIL |
| Response Body | `status: healthy` | ______ | ☐ PASS ☐ FAIL |

#### CIA-SIE-PURE Health Check

```bash
# Execute health check
curl -w "\n%{http_code} %{time_total}s" http://localhost:8000/health

# Expected response:
# {"status":"healthy","app":"cia-sie","version":"1.0.0",...}
# 200 0.100s
```

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| HTTP Status | 200 | ______ | ☐ PASS ☐ FAIL |
| Latency | < 200ms | ______ | ☐ PASS ☐ FAIL |
| Response Body | `status: healthy` | ______ | ☐ PASS ☐ FAIL |

**Decision Logic:**

```
IF endpoint unreachable:
    → Status: FAILURE
    → Proceed immediately to Section 5

IF endpoint reachable but partial response:
    → Status: DEGRADED
    → Proceed to Section 5

IF both endpoints fully healthy:
    → Proceed to Step 1.3
```

### Step 1.3 — Verification Heartbeat Check

**Action:** Confirm automated verification is running.

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Last scheduled verification | < 24 hours ago | ______ | ☐ PASS ☐ FAIL |
| Skipped workflows | 0 | ______ | ☐ PASS ☐ FAIL |
| Muted failures | 0 | ______ | ☐ PASS ☐ FAIL |
| Test pass rate | 100% | ______ | ☐ PASS ☐ FAIL |

**GitHub Actions Check:**

```bash
# Check latest workflow run
gh run list --workflow=ci.yml --limit=1

# Expected: ✓ completed success
```

**Decision Logic:**

```
IF verification has not run in 24 hours:
    → System status: UNVERIFIED
    → Trigger manual verification
    → Do NOT proceed until verification passes

IF verification ran but failed:
    → System status: VERIFICATION_FAILED
    → Proceed to Section 5
```

### Start-of-Day Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                 START-OF-DAY CHECK COMPLETE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Date: ________________  Time: ________________                 │
│                                                                  │
│   Global Status:     ☐ NOMINAL  ☐ DEGRADED  ☐ FAILURE           │
│   MCI Health:        ☐ PASS     ☐ FAIL                          │
│   CIA-SIE Health:    ☐ PASS     ☐ FAIL                          │
│   Verification:      ☐ CURRENT  ☐ STALE    ☐ FAILED             │
│                                                                  │
│   Overall:           ☐ PROCEED  ☐ INVESTIGATE  ☐ ESCALATE       │
│                                                                  │
│   Operator: ________________  Signature: ________________        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## SECTION 2 — CONTINUOUS VERIFICATION LOOP (AUTOMATED, OBSERVED)

### Purpose
Ensure correctness is continuously re-earned, not assumed.

### Step 2.1 — Nightly Verification (Automated)

**Schedule:** Daily at 02:00 IST (market closed)

**Scope:**
- Full test suite execution
- Determinism variance measurement
- Schema fingerprint comparison
- Dependency vulnerability scan

**Operator Responsibility:**

| Action | Frequency | Trigger |
|--------|-----------|---------|
| Review summary | Daily (morning) | Part of Section 1 |
| Investigate | On alert only | Alert fires |
| Intervene | Never (automated) | N/A |

**Alert Conditions:**

| Condition | Severity | Action |
|-----------|----------|--------|
| Any test failure | CRITICAL | Immediate investigation |
| CV > 10% | WARNING | Log and monitor |
| CV > 15% | CRITICAL | Section 5 |
| Schema drift | CRITICAL | Section 5 |

### Step 2.2 — Weekly Deep Verification

**Schedule:** Sunday 02:00 IST

**Scope:**
- Repeated cycle testing (20 iterations)
- Fault-injection replay
- Latency stress testing
- Integration boundary testing

**Operator Action:**

```
1. Read final verdict
2. Confirm no red flags
3. Sign weekly verification log
4. File report
```

**Weekly Verification Log:**

```
┌─────────────────────────────────────────────────────────────────┐
│                 WEEKLY VERIFICATION SUMMARY                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Week Ending: ________________                                  │
│                                                                  │
│   MCI Tests:         ______ passed / ______ total               │
│   CIA-SIE Tests:     ______ passed / ______ total               │
│   Repeated Cycles:   ______ / 20                                │
│   Fault Injection:   ☐ PASS  ☐ FAIL                             │
│   Latency Stress:    ☐ PASS  ☐ FAIL                             │
│                                                                  │
│   MCI CV:            ______%  (threshold: <10%)                 │
│   CIA-SIE CV:        ______%  (threshold: <10%)                 │
│                                                                  │
│   Verdict:           ☐ CERTIFIED  ☐ DEGRADED  ☐ FAILED          │
│                                                                  │
│   Operator: ________________  Date: ________________             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step 2.3 — Determinism Threshold Enforcement

**Thresholds:**

| Metric | OK | WARNING | CRITICAL |
|--------|-----|---------|----------|
| MCI CV | ≤5% | 5-10% | >10% |
| CIA-SIE CV | ≤7% | 7-12% | >12% |
| Duration Variance | ≤10% | 10-20% | >20% |

**Enforcement:**

```
IF CV exceeds CRITICAL threshold:
    1. Classify as STABILITY DEGRADATION
    2. Proceed to Section 5 (Incident Handling)
    3. Investigate root cause
    4. Execute Section 6 (Rectification) if needed

IF CV in WARNING zone:
    1. Log observation
    2. Increase monitoring frequency
    3. Prepare contingency
```

---

## SECTION 3 — DRIFT & DECAY SURVEILLANCE (PASSIVE BUT CRITICAL)

### Purpose
Detect decay before failure. Prevention > reaction.

### Drift Signals Monitored

| Signal | Detection Method | Threshold | Action |
|--------|------------------|-----------|--------|
| Schema Drift | Fingerprint comparison | Any mismatch | CRITICAL |
| Contract Violation | API response validation | Any violation | CRITICAL |
| Latency Slope | Trend analysis | >10% weekly increase | WARNING |
| Error Distribution | Log analysis | Pattern change | WARNING |
| Memory Usage | Metrics | >80% baseline | WARNING |
| Dependency Age | Package audit | >30 days stale | INFO |

### Operator Rules

```
┌─────────────────────────────────────────────────────────────────┐
│                    DRIFT RESPONSE MATRIX                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   SINGLE BLIP (one occurrence):                                  │
│   → Log with timestamp                                           │
│   → Note context                                                 │
│   → Continue monitoring                                          │
│   → No immediate action                                          │
│                                                                  │
│   TREND (3+ occurrences in 7 days):                             │
│   → Classify as DRIFT                                           │
│   → Increase monitoring                                          │
│   → Prepare investigation                                        │
│   → Alert supervisor                                             │
│                                                                  │
│   ACCELERATION (trend worsening):                                │
│   → Classify as ACTIVE DECAY                                    │
│   → Proceed to Section 5                                        │
│   → Consider preemptive abort                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Drift Log Template

```
┌─────────────────────────────────────────────────────────────────┐
│                      DRIFT OBSERVATION LOG                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Timestamp: ________________                                    │
│   Signal Type: ________________                                  │
│   Observed Value: ________________                               │
│   Expected Value: ________________                               │
│   Deviation: ________________                                    │
│                                                                  │
│   Classification:  ☐ BLIP  ☐ TREND  ☐ ACCELERATION              │
│                                                                  │
│   Context: ________________________________________________     │
│   __________________________________________________________    │
│                                                                  │
│   Action Taken: ____________________________________________    │
│                                                                  │
│   Operator: ________________                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## SECTION 4 — LIVE OPERATION MONITORING (REAL-TIME)

### Purpose
Maintain truthful situational awareness at all times.

### Step 4.1 — Indicator Truth Rule

**The Cardinal Rules:**

```
╔═══════════════════════════════════════════════════════════════════╗
║                    INDICATOR TRUTH HIERARCHY                       ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║   1. GREEN ≠ HEALTHY unless verified                              ║
║      → Green indicator alone is INSUFFICIENT                       ║
║      → Must be supported by health check evidence                  ║
║                                                                    ║
║   2. YELLOW dominates GREEN                                        ║
║      → Any yellow indicator → system is DEGRADED                  ║
║      → Even if other indicators are green                          ║
║                                                                    ║
║   3. RED dominates ALL                                             ║
║      → Any red indicator → system is UNHEALTHY                    ║
║      → Immediate investigation required                            ║
║                                                                    ║
║   4. INDICATORS vs LOGS                                            ║
║      → If indicators contradict logs → INDICATORS ARE WRONG       ║
║      → Escalate immediately                                        ║
║      → Do not trust the UI                                         ║
║                                                                    ║
╚═══════════════════════════════════════════════════════════════════╝
```

**Indicator Verification Matrix:**

| Indicator Color | Meaning | Verification Required | Trust Level |
|-----------------|---------|----------------------|-------------|
| 🟢 GREEN | Nominal | Health check + logs | VERIFY |
| 🟡 YELLOW | Degraded | Immediate investigation | SUSPECT |
| 🔴 RED | Unhealthy | Section 5 immediately | ALERT |
| ⚫ GRAY/UNKNOWN | Stale | Treat as RED | ALERT |

### Step 4.2 — Simulation vs Live Clarity

**Absolute Requirement:**

```
┌─────────────────────────────────────────────────────────────────┐
│              SIMULATION / LIVE CLARITY RULE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ✅ Simulation MUST be explicitly labeled                       │
│      → Amber "SIMULATION" badge visible                          │
│      → No ambiguity permitted                                    │
│                                                                  │
│   ✅ Live MUST be explicitly labeled                             │
│      → Green "CONNECTED" indicator                               │
│      → No simulation badge present                               │
│                                                                  │
│   ❌ AMBIGUITY = FAILURE                                         │
│      → If unclear whether simulation or live                     │
│      → TREAT AS LIVE                                             │
│      → Escalate immediately                                      │
│      → Verify system state                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Real-Time Monitoring Checklist

| Check | Frequency | Method |
|-------|-----------|--------|
| UI responsiveness | Continuous | Visual |
| Indicator colors | Continuous | Visual |
| Log stream | Every 5 min | Log viewer |
| Health endpoint | Every 1 min | Automated |
| Latency metrics | Every 1 min | Dashboard |

---

## SECTION 5 — INCIDENT HANDLING (WHEN THINGS GO WRONG)

### Purpose
Contain failure without panic. Structured response > improvisation.

### Step 5.1 — Incident Classification

**IMMEDIATELY classify using this taxonomy:**

| Severity | Name | Definition | Example | Response Time |
|----------|------|------------|---------|---------------|
| **SEV-1** | Cosmetic | UI/display issue, no data impact | Badge misaligned | 24 hours |
| **SEV-2** | Degraded | Reduced capability, still functional | Latency elevated | 4 hours |
| **SEV-3** | Unsafe | Incorrect behavior possible | Validation bypassed | 1 hour |
| **SEV-4** | Abort-worthy | Data integrity at risk | State corruption | IMMEDIATE |

**Classification Decision Tree:**

```
START
  │
  ├─ Is data integrity at risk?
  │   └─ YES → SEV-4 (Abort immediately)
  │
  ├─ Is incorrect behavior possible?
  │   └─ YES → SEV-3 (1 hour response)
  │
  ├─ Is capability reduced?
  │   └─ YES → SEV-2 (4 hour response)
  │
  └─ Is it purely cosmetic?
      └─ YES → SEV-1 (24 hour response)

NO CLASSIFICATION → NO ACTION
Classify first. Always.
```

### Step 5.2 — Abort Authority

```
╔═══════════════════════════════════════════════════════════════════╗
║                                                                    ║
║                      🛑 ABORT AUTHORITY 🛑                         ║
║                                                                    ║
║   ABORT MUST ALWAYS SUCCEED.                                       ║
║                                                                    ║
║   ABORT IF:                                                        ║
║   ├─ Truth is lost (indicators contradict reality)                ║
║   ├─ Control is ambiguous (unclear who/what is in control)        ║
║   ├─ Operator confidence drops (gut feeling of wrongness)         ║
║   ├─ State corruption suspected                                    ║
║   └─ Any SEV-4 condition                                          ║
║                                                                    ║
║   ABORT IS NOT FAILURE.                                            ║
║   DELAY IS.                                                        ║
║                                                                    ║
║   ABORT COMMAND:                                                   ║
║   ┌─────────────────────────────────────────────────────────────┐ ║
║   │  MCI:       Click "ABORT" button in Cockpit UI              │ ║
║   │  CLI:       curl -X POST localhost:3000/api/ignition/abort  │ ║
║   │  Emergency: Kill process: pkill -f "bun.*server"            │ ║
║   └─────────────────────────────────────────────────────────────┘ ║
║                                                                    ║
╚═══════════════════════════════════════════════════════════════════╝
```

### Step 5.3 — Rollback Procedure

**Rollback Execution:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROLLBACK PROCEDURE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   TIME LIMIT: Complete within 60 seconds                         │
│                                                                  │
│   STEP 1: Execute documented rollback                            │
│   ┌───────────────────────────────────────────────────────────┐ │
│   │  git checkout <last-known-good-commit>                    │ │
│   │  npm run stop                                             │ │
│   │  npm run start                                            │ │
│   └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│   STEP 2: Verify rollback completed                              │
│   ┌───────────────────────────────────────────────────────────┐ │
│   │  curl localhost:3000/api/health                           │ │
│   │  Expect: 200 OK, status: healthy                          │ │
│   └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│   STEP 3: Confirm clean state                                    │
│   ┌───────────────────────────────────────────────────────────┐ │
│   │  npm run test                                             │ │
│   │  Expect: All tests pass                                   │ │
│   └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│   IF ROLLBACK FAILS:                                             │
│   → ESCALATE IMMEDIATELY                                         │
│   → Do not attempt further recovery                              │
│   → Contact on-call engineer                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Incident Log Template

```
┌─────────────────────────────────────────────────────────────────┐
│                      INCIDENT REPORT                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Incident ID: INC-________                                      │
│   Timestamp: ________________                                    │
│   Severity: ☐ SEV-1  ☐ SEV-2  ☐ SEV-3  ☐ SEV-4                 │
│                                                                  │
│   Description:                                                   │
│   __________________________________________________________    │
│   __________________________________________________________    │
│                                                                  │
│   Detection Method:                                              │
│   ☐ Automated alert  ☐ Manual observation  ☐ User report        │
│                                                                  │
│   Actions Taken:                                                 │
│   ☐ Abort  ☐ Rollback  ☐ Investigation  ☐ Escalation           │
│                                                                  │
│   Resolution:                                                    │
│   __________________________________________________________    │
│                                                                  │
│   Root Cause:                                                    │
│   __________________________________________________________    │
│                                                                  │
│   Prevention:                                                    │
│   __________________________________________________________    │
│                                                                  │
│   Operator: ________________  Resolved: ________________         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## SECTION 6 — RECTIFICATION (WHEN CODE IS TOUCHED)

### Purpose
Define the ONLY conditions under which code may be modified.

### Rectification Triggers (Exhaustive List)

Rectification occurs **ONLY** if triggered by:

| Trigger | Severity | Evidence Required |
|---------|----------|-------------------|
| Test failure | Any | Test output showing failure |
| Drift breach | CRITICAL | Drift log with trend |
| Determinism variance breach | CV > threshold | Variance report |
| Incident ≥ SEV-2 | SEV-2, SEV-3, SEV-4 | Incident report |

**No other trigger justifies code modification.**

### Rectification Rules (ABSOLUTE)

```
╔═══════════════════════════════════════════════════════════════════╗
║                     RECTIFICATION RULES                            ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║   1. SMALLEST POSSIBLE CHANGE                                      ║
║      → Fix the issue, nothing more                                 ║
║      → No scope creep                                              ║
║      → No "while I'm here" additions                               ║
║                                                                    ║
║   2. TEST FIRST                                                    ║
║      → Write failing test that reproduces issue                    ║
║      → Implement fix                                               ║
║      → Verify test passes                                          ║
║                                                                    ║
║   3. NO "CLEANUP"                                                  ║
║      → Do not refactor unrelated code                              ║
║      → Do not rename variables                                     ║
║      → Do not restructure                                          ║
║                                                                    ║
║   4. NO OPPORTUNISTIC REFACTORS                                    ║
║      → If you see something else to fix                            ║
║      → Log it separately                                           ║
║      → Address in separate, planned change                         ║
║                                                                    ║
╚═══════════════════════════════════════════════════════════════════╝
```

### Rectification Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                  RECTIFICATION WORKFLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   STEP 1: EVIDENCE CAPTURED                                      │
│   ├─ Screenshot/log of failure                                   │
│   ├─ Reproduction steps documented                               │
│   └─ Timestamp recorded                                          │
│                                                                  │
│   STEP 2: HYPOTHESIS DOCUMENTED                                  │
│   ├─ Root cause theory                                           │
│   ├─ Affected components identified                              │
│   └─ Fix approach outlined                                       │
│                                                                  │
│   STEP 3: CHANGE IMPLEMENTED                                     │
│   ├─ Smallest possible change                                    │
│   ├─ Code reviewed                                               │
│   └─ Committed with clear message                                │
│                                                                  │
│   STEP 4: FULL VERIFICATION RERUN                                │
│   ├─ All tests pass                                              │
│   ├─ No new warnings                                             │
│   └─ Determinism verified                                        │
│                                                                  │
│   STEP 5: CERTIFICATION RE-ISSUED                                │
│   ├─ Update certification document                               │
│   ├─ Record new verification results                             │
│   └─ Close rectification ticket                                  │
│                                                                  │
│   ❌ NO STEP MAY BE SKIPPED                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## SECTION 7 — CHANGE GOVERNANCE (NORMAL TIME)

### Purpose
Prevent entropy. Maintain certification validity.

### Change Rules

| Rule | Requirement | Enforcement |
|------|-------------|-------------|
| Verification Gate | All changes pass full test suite | CI/CD blocks on failure |
| Reversibility | All changes must be revertable | Rollback plan required |
| Metadata Update | All changes update certification metadata | PR template enforces |
| Documentation | All changes documented | Review checklist |

### Forbidden Practices

```
╔═══════════════════════════════════════════════════════════════════╗
║                     FORBIDDEN PRACTICES                            ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║   ❌ Hotfixes without rollback proof                               ║
║   ❌ Bypassing CI/CD pipeline                                      ║
║   ❌ Force-pushing to main                                         ║
║   ❌ Merging without review                                        ║
║   ❌ Deploying without verification                                ║
║   ❌ Muting failing tests                                          ║
║   ❌ Commenting out assertions                                     ║
║   ❌ Skipping pre-commit hooks                                     ║
║                                                                    ║
║   Violation of any practice → Incident SEV-3 minimum              ║
║                                                                    ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## SECTION 8 — OPERATOR COGNITIVE SAFETY

### Purpose
Prevent human error. The operator is the last line of defense.

### Cognitive Safety Rules

```
╔═══════════════════════════════════════════════════════════════════╗
║                   OPERATOR COGNITIVE SAFETY                        ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║   RULE 1: IF UNSURE → STOP                                        ║
║   ├─ Do not guess                                                  ║
║   ├─ Do not assume                                                 ║
║   └─ Seek clarification                                            ║
║                                                                    ║
║   RULE 2: IF TIRED → ESCALATE                                     ║
║   ├─ Fatigue impairs judgment                                      ║
║   ├─ Hand off to fresh operator                                    ║
║   └─ Do not power through                                          ║
║                                                                    ║
║   RULE 3: IF CONFUSED → ABORT                                     ║
║   ├─ Confusion indicates system misbehavior                        ║
║   ├─ Abort is safe                                                 ║
║   └─ Investigation can follow abort                                ║
║                                                                    ║
║   THE SYSTEM IS DESIGNED TO SURVIVE ABORTS,                        ║
║   NOT HESITATION.                                                  ║
║                                                                    ║
╚═══════════════════════════════════════════════════════════════════╝
```

### Operator Fitness Check

Before critical operations, confirm:

| Check | Self-Assessment |
|-------|-----------------|
| Alertness | ☐ Alert ☐ Tired |
| Focus | ☐ Focused ☐ Distracted |
| Confidence | ☐ Confident ☐ Uncertain |
| Time pressure | ☐ None ☐ Moderate ☐ High |

**If any concern → hand off or defer.**

---

## SECTION 9 — PERIODIC RE-CERTIFICATION

### Purpose
Certification decays. It must be continuously re-earned.

### Re-Certification Schedule

| Frequency | Scope | Owner | Deliverable |
|-----------|-------|-------|-------------|
| **Monthly** | Operational recertification | Operator | Operations Report |
| **Quarterly** | Adversarial re-audit | Security Team | Audit Report |
| **Annual** | Gold-Standard re-benchmark | Architecture Team | Benchmark Report |

### Monthly Operational Recertification

```
┌─────────────────────────────────────────────────────────────────┐
│              MONTHLY RECERTIFICATION CHECKLIST                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Month: ________________  Year: ________________                │
│                                                                  │
│   Test Verification:                                             │
│   ☐ All tests passing                                           │
│   ☐ Test count unchanged or justified                           │
│   ☐ No muted/skipped tests                                      │
│                                                                  │
│   Determinism Verification:                                      │
│   ☐ MCI CV < 10%: Actual ______%                                │
│   ☐ CIA-SIE CV < 12%: Actual ______%                            │
│                                                                  │
│   Incident Review:                                               │
│   ☐ All incidents closed                                        │
│   ☐ Root causes identified                                      │
│   ☐ Preventions implemented                                     │
│                                                                  │
│   Drift Review:                                                  │
│   ☐ No unresolved drift signals                                 │
│   ☐ Schema fingerprint unchanged                                │
│                                                                  │
│   Certification Status:                                          │
│   ☐ CERTIFIED  ☐ DEGRADED  ☐ REVOKED                           │
│                                                                  │
│   Certifier: ________________  Date: ________________            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Failure to Recertify

```
IF recertification fails:
    → Operational status DOWNGRADED
    → System operates in LIMITED mode
    → Escalation to management required
    → Rectification plan mandatory
```

---

## SECTION 10 — END-STATE GUARANTEE

### Purpose
Define the absolute guarantees this runbook provides.

### Guarantees

```
╔═══════════════════════════════════════════════════════════════════╗
║                    END-STATE GUARANTEE                             ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║   IF THIS RUNBOOK IS FOLLOWED:                                     ║
║                                                                    ║
║   ✅ No silent failure is possible                                 ║
║      → All failures produce visible indicators                     ║
║      → No green state hides degradation                            ║
║                                                                    ║
║   ✅ No unsafe activation is possible                              ║
║      → Phase gates enforce prerequisites                           ║
║      → Human authority required for ignition                       ║
║                                                                    ║
║   ✅ No integration drift is undetected                            ║
║      → Continuous schema monitoring                                ║
║      → Contract validation on every call                           ║
║                                                                    ║
║   ✅ No human is misled                                            ║
║      → Indicators match reality                                    ║
║      → Simulation clearly marked                                   ║
║      → Errors explain WHAT/WHY/HOW                                 ║
║                                                                    ║
║   ✅ No regression survives unnoticed                              ║
║      → Continuous verification                                     ║
║      → Determinism monitoring                                      ║
║      → Immediate alert on deviation                                ║
║                                                                    ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## FINAL OPERATOR MANTRA (NASA-STYLE)

```
╔═══════════════════════════════════════════════════════════════════╗
║                                                                    ║
║                                                                    ║
║           "We do not assume correctness.                           ║
║            We continuously prove it.                               ║
║            When in doubt, we abort."                               ║
║                                                                    ║
║                                                                    ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## APPENDIX A — QUICK REFERENCE CARDS

### Card 1: Start-of-Day Sequence

```
08:45 IST — START-OF-DAY CHECK
├─ 1. Open cockpit, record status
├─ 2. Check MCI /health
├─ 3. Check CIA-SIE /health  
├─ 4. Verify nightly tests passed
└─ 5. Sign start-of-day log
```

### Card 2: Abort Decision

```
🛑 ABORT IF:
├─ Truth is lost
├─ Control is ambiguous
├─ Confidence drops
├─ State corruption suspected
└─ Any SEV-4 condition

ABORT IS NOT FAILURE.
DELAY IS.
```

### Card 3: Severity Classification

```
SEV-1: Cosmetic     → 24 hours
SEV-2: Degraded     → 4 hours
SEV-3: Unsafe       → 1 hour
SEV-4: Abort-worthy → IMMEDIATE
```

### Card 4: Indicator Colors

```
🟢 GREEN  → Verify before trust
🟡 YELLOW → Degraded, investigate
🔴 RED    → Unhealthy, Section 5
⚫ GRAY   → Treat as RED
```

---

## APPENDIX B — CONTACT ESCALATION MATRIX

| Level | Condition | Contact | Method |
|-------|-----------|---------|--------|
| L1 | SEV-1, SEV-2 | On-call operator | Slack |
| L2 | SEV-3 | Engineering lead | Phone |
| L3 | SEV-4 | System owner | Phone + Page |
| L4 | Data breach | Security + Legal | Immediate |

---

## APPENDIX C — VERIFICATION COMMANDS

### MCI Commands

```bash
# Health check
curl http://localhost:3000/api/health

# Run tests
cd /path/to/MCI && npm run test

# Run 20-cycle verification
for i in {1..20}; do npm run test -- --silent; done

# Abort
curl -X POST http://localhost:3000/api/ignition/abort

# Stop
npm run stop

# Start
npm run start
```

### CIA-SIE-PURE Commands

```bash
# Health check
curl http://localhost:8000/health

# Activate virtual environment
cd /path/to/CIA-SIE-PURE
source .venv/bin/activate

# Run tests
PYTHONPATH="./06_SOURCE_CODE/src" python -m pytest 07_TESTING/tests/ -v

# Run 20-cycle verification
for i in {1..20}; do python -m pytest 07_TESTING/tests/unit/ -q; done
```

---

## DOCUMENT CONTROL

| Field | Value |
|-------|-------|
| Document ID | PAD-OPS1-RUNBOOK |
| Version | 1.0.0 |
| Issue Date | 2026-01-30T11:57:13+0530 (IST) |
| Authority | PAD-OPS1 Directive |
| Certification Basis | PAD-AUTO1 (39,160 tests, 0 failures) |
| Next Review | 2026-02-28 |

---

*This Operator Runbook fulfills PAD-OPS1 requirements and establishes NASA/FAA/NSA-grade steady-state operations protocol.*
