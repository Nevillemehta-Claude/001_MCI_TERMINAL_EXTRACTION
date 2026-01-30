# PRE-OPS GAP CLOSURE REQUIREMENTS

**Document ID:** POGCR-2026-01-29  
**Generated:** 2026-01-29 22:58:12 IST  
**Classification:** BLOCKING ASSESSMENT  
**Purpose:** Enumerate all items requiring closure before PAD-OPS1

---

## CLASSIFICATION

| Priority | Meaning | Action |
|----------|---------|--------|
| **P0** | Blocking PAD-OPS1 | MUST close before proceeding |
| **P1** | High priority | SHOULD close or formally accept risk |
| **P2** | Medium priority | CAN defer with documentation |
| **P3** | Low priority | DEFER to post-commissioning |

---

# P0 — BLOCKING ITEMS

These items **MUST** be closed before PAD-OPS1 authorization.

## P0-001: CIA-SIE-PURE Test Suite Not Executed

| Field | Value |
|-------|-------|
| **Description** | 51 test files exist but pytest is not installed; tests have not been run |
| **Impact** | Cannot verify CIA-SIE-PURE code correctness |
| **Owner** | Agent/Environment |
| **Action Required** | Install pytest, execute `pytest 07_TESTING/tests/ -v` |
| **Verification** | All 51 test files pass |
| **Time Estimate** | 30 minutes |

### Closure Steps
1. `cd /Users/nevillemehta/Downloads/PROJECTS/02_CIA-SIE-PURE`
2. `python3 -m venv .venv`
3. `source .venv/bin/activate`
4. `pip install -e ".[dev]"`
5. `pytest 07_TESTING/tests/ -v --tb=short`
6. Capture output, verify all pass

---

## P0-002: Live E2E Handshake Not Verified

| Field | Value |
|-------|-------|
| **Description** | MCI and CIA-SIE-PURE have never communicated in a live test |
| **Impact** | Cannot verify network path, schema compatibility, or error handling |
| **Owner** | Agent/Environment |
| **Action Required** | Start both systems, verify health handshake |
| **Verification** | MCI health probe returns CIA-SIE-PURE as "connected" |
| **Time Estimate** | 1 hour |

### Closure Steps
1. Start CIA-SIE-PURE: `./scripts/launcher/ignite.sh`
2. Verify: `curl http://localhost:8000/health`
3. Start MCI backend: `cd 12_APPLICATION_CODE && npm run server`
4. Start MCI frontend: `npm run dev`
5. Observe EngineStatusIndicator shows "ENGINE: CONNECTED"
6. Capture screenshot as evidence

---

## P0-003: CIA-SIE-PURE Health Endpoint Does Not Verify DB/AI

| Field | Value |
|-------|-------|
| **Description** | Health endpoint returns "healthy" without verifying database or AI subsystems |
| **Impact** | MCI cannot trust "connected" status; false positives possible |
| **Owner** | CIA-SIE-PURE or Acceptance |
| **Action Required** | EITHER fix health endpoint OR formally accept risk |
| **Verification** | If fix: deep health checks added. If accept: documented in ops guide |
| **Time Estimate** | 2 hours (fix) or 30 minutes (accept) |

### Option A: Fix (Recommended)
1. Modify `/health` endpoint to call `/health/db`, `/health/ai`
2. Aggregate results: all pass = "healthy", any fail = "degraded"
3. Add tests for new behavior
4. Deploy and verify

### Option B: Accept Risk
1. Document in operational guide: "CIA-SIE-PURE health may be false positive"
2. Add to monitoring requirements: "Verify DB/AI separately"
3. Principal signs off on risk acceptance

---

# P1 — HIGH PRIORITY ITEMS

These items **SHOULD** be closed or have formal risk acceptance.

## P1-001: CIA-SIE-PURE Has No Explicit State Machine

| Field | Value |
|-------|-------|
| **Description** | State is emergent from process lifecycle, not explicitly modeled |
| **Impact** | Forbidden transitions not enforced; illegal states representable |
| **Owner** | Acceptance (structural limitation) |
| **Action Required** | Document as architectural limitation in operational guide |
| **Verification** | Documented with mitigation strategy |
| **Time Estimate** | 30 minutes |

### Acceptance Criteria
- Document in ops guide that CIA-SIE-PURE has no state machine
- Note that process supervision (systemd/Docker) provides lifecycle control
- Recommend external health monitoring as compensating control

---

## P1-002: CIA-SIE-PURE Has No Crash Recovery

| Field | Value |
|-------|-------|
| **Description** | Crash is detected but not automatically recovered |
| **Impact** | Downtime until manual restart |
| **Owner** | Operations |
| **Action Required** | Deploy with process supervisor (systemd, Docker, Kubernetes) |
| **Verification** | Restart policy documented and tested |
| **Time Estimate** | 1 hour |

### Closure Steps
1. Create systemd service file OR Docker compose with restart policy
2. Test crash recovery: `kill -9 $(pgrep uvicorn)` → verify restart
3. Document in deployment guide

---

## P1-003: No Automated Schema Comparison

| Field | Value |
|-------|-------|
| **Description** | MCI types and CIA-SIE-PURE models not compared automatically |
| **Impact** | Schema drift possible, silent failures |
| **Owner** | CI/CD |
| **Action Required** | Add schema comparison to verification gate |
| **Verification** | CI job compares schemas on every PR |
| **Time Estimate** | 2 hours |

### Closure Steps
1. Extract MCI TypeScript types to JSON schema
2. Extract CIA-SIE-PURE Pydantic models to JSON schema
3. Write comparison script
4. Add to GitHub Actions workflow

---

## P1-004: MCI Network Timeout Not Integrated

| Field | Value |
|-------|-------|
| **Description** | Fetch calls lack explicit timeout; browser defaults used |
| **Impact** | Long hangs possible if CIA-SIE-PURE is slow |
| **Owner** | MCI |
| **Action Required** | Integrate timeout wrapper from resilience module |
| **Verification** | All fetch calls use withTimeout() |
| **Time Estimate** | 1 hour |

### Closure Steps
1. Import `withTimeout` from `src/shared/resilience/timeout.ts`
2. Wrap fetch calls in stores and services
3. Add tests for timeout behavior
4. Run full test suite

---

# P2 — MEDIUM PRIORITY ITEMS

These items **CAN** be deferred with documentation.

## P2-001: E2E Playwright Tests Not Executed

| Field | Value |
|-------|-------|
| **Description** | Playwright tests exist but have not been run |
| **Impact** | Browser behavior not verified |
| **Owner** | MCI |
| **Action Required** | Document as deferred; plan to run before production |
| **Deferral Rationale** | Unit tests provide coverage; E2E is supplementary |

---

## P2-002: Multi-Tab Behavior Not Tested

| Field | Value |
|-------|-------|
| **Description** | MCI behavior with multiple browser tabs unknown |
| **Impact** | State desync possible |
| **Owner** | MCI |
| **Action Required** | Document as known limitation |
| **Deferral Rationale** | Single-user system; multi-tab is edge case |

---

## P2-003: Sentry Integration Not Verified Live

| Field | Value |
|-------|-------|
| **Description** | Sentry SDK integrated but DSN not configured for live test |
| **Impact** | Error monitoring not verified |
| **Owner** | Operations |
| **Action Required** | Configure DSN in staging, verify error capture |
| **Deferral Rationale** | Can be done post-commissioning before production |

---

# P3 — LOW PRIORITY ITEMS

These items are **DEFERRED** to post-commissioning.

## P3-001: Toast Auto-Dismiss

| Field | Value |
|-------|-------|
| **Description** | Toast notifications do not auto-dismiss |
| **Impact** | Minor UX issue |
| **Deferral Rationale** | Does not affect functionality |

---

## P3-002: CIA-SIE-PURE Constitutional Rules Not Centralized

| Field | Value |
|-------|-------|
| **Description** | Constitutional rules scattered across multiple files |
| **Impact** | Maintenance burden |
| **Deferral Rationale** | Refactoring task, not blocking |

---

## P3-003: Rate Limit State Lost on CIA-SIE-PURE Restart

| Field | Value |
|-------|-------|
| **Description** | In-memory rate limiter clears on restart |
| **Impact** | Rate limits temporarily reset |
| **Deferral Rationale** | Acceptable for low-traffic system |

---

# CLOSURE TRACKING

## Summary Table

| ID | Priority | Status | Owner | Due |
|----|----------|--------|-------|-----|
| P0-001 | P0 | ⏳ OPEN | Agent | Before PAD-OPS1 |
| P0-002 | P0 | ⏳ OPEN | Agent | Before PAD-OPS1 |
| P0-003 | P0 | ⏳ OPEN | Principal Decision | Before PAD-OPS1 |
| P1-001 | P1 | ⏳ OPEN | Acceptance | Before PAD-OPS1 |
| P1-002 | P1 | ⏳ OPEN | Operations | Before PAD-OPS1 |
| P1-003 | P1 | ⏳ OPEN | CI/CD | Post-PAD-OPS1 OK |
| P1-004 | P1 | ⏳ OPEN | MCI | Post-PAD-OPS1 OK |
| P2-001 | P2 | DEFERRED | — | Pre-Production |
| P2-002 | P2 | DEFERRED | — | Post-Production |
| P2-003 | P2 | DEFERRED | — | Pre-Production |
| P3-001 | P3 | DEFERRED | — | Backlog |
| P3-002 | P3 | DEFERRED | — | Backlog |
| P3-003 | P3 | DEFERRED | — | Backlog |

## PAD-OPS1 Readiness Checklist

| Requirement | Status |
|-------------|--------|
| All P0 items closed | ❌ NO |
| All P1 items closed or accepted | ❌ NO |
| P2/P3 items documented for deferral | ✅ YES |
| Principal sign-off on accepted risks | ⏳ PENDING |

---

# RECOMMENDED SEQUENCE

1. **NOW**: Execute CIA-SIE-PURE tests (P0-001)
2. **NOW**: Decide on health endpoint (P0-003): fix or accept
3. **NEXT**: Start both systems, verify handshake (P0-002)
4. **THEN**: Document state machine limitation (P1-001)
5. **THEN**: Configure process supervisor (P1-002)
6. **OPTIONAL**: Integrate timeout wrapper (P1-004)
7. **POST-OPS**: Add schema comparison to CI (P1-003)

---

**END OF PRE-OPS GAP CLOSURE REQUIREMENTS**
