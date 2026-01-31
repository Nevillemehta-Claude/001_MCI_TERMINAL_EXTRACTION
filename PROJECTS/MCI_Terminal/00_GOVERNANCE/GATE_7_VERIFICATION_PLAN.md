# SILO 6: Gate 7 Verification Plan
## Pre-Staged Verification Suite (No Execution)

**Document ID:** SILO-6-GATE7-001  
**Date:** 2026-01-29  
**Classification:** PLAN ONLY — NO TEST EXECUTION AUTHORIZED  
**Execution Status:** 🔒 DOCUMENTATION ONLY

---

## Governing Constraints

| Constraint | Status |
|------------|--------|
| Test execution | ❌ PROHIBITED |
| CI changes | ❌ PROHIBITED |
| Code changes | ❌ PROHIBITED |

---

## 1. GATE 7 PURPOSE

### Definition

Gate 7 is the **Integration Verification Gate** — the final checkpoint before live MCI-to-CIA-SIE-PURE connectivity is authorized.

### Gate 7 Success Criteria

| Criterion | Requirement |
|-----------|-------------|
| All unit tests pass | 100% pass rate |
| All integration tests pass | 100% pass rate |
| No invariant violations | All 6 invariants verified |
| No lifecycle contamination | Zero control commands |
| Latency within bounds | All thresholds met |
| Rollback verified | < 60 second restoration |

---

## 2. TEST CATEGORIES

### Category 1: Boundary Sanitization Tests

**Purpose:** Verify INV-006 compliance at MCI boundary

| Test ID | Test Description | Pass Criteria |
|---------|------------------|---------------|
| BS-001 | NULL byte in response causes rejection | Error thrown |
| BS-002 | Control characters stripped from strings | Clean output |
| BS-003 | CRLF normalized to LF | Consistent line endings |
| BS-004 | Nested object sanitization | All string fields cleaned |
| BS-005 | Array element sanitization | All elements processed |
| BS-006 | Empty/null values handled | No crash |
| BS-007 | Non-string types pass through | Numbers, booleans unchanged |
| BS-008 | Error messages sanitized | No control chars in errors |

**Test File:** `src/shared/validation/sanitize.test.ts` (BLOCK-001 section)

**Invariants Covered:** INV-006

---

### Category 2: Health State Tracking Tests

**Purpose:** Verify external supervision model

| Test ID | Test Description | Pass Criteria |
|---------|------------------|---------------|
| HS-001 | Initial state is UNKNOWN | Status = 'unknown' |
| HS-002 | Successful check → CONNECTED | Status = 'connected' |
| HS-003 | Failed check increments failures | Counter increments |
| HS-004 | 3 failures → UNHEALTHY | Status = 'unhealthy' |
| HS-005 | Recovery resets failure count | Counter = 0 |
| HS-006 | Degraded mode calculated correctly | Based on subsystem health |
| HS-007 | No restart commands issued | No POST requests |
| HS-008 | No lifecycle control exposed | No start/stop methods |

**Test File:** `src/client/stores/ciaSieHealthStore.test.ts`

**Invariants Covered:** INV-002

---

### Category 3: Error Translation Tests

**Purpose:** Verify CR-003 compliant error handling

| Test ID | Test Description | Pass Criteria |
|---------|------------------|---------------|
| ET-001 | HTTP 400 → validation error code | Correct mapping |
| ET-002 | HTTP 500 → internal error code | Correct mapping |
| ET-003 | HTTP 503 → unavailable code | Correct mapping |
| ET-004 | Network error → network code | Correct mapping |
| ET-005 | All errors have WHAT | Non-empty string |
| ET-006 | All errors have WHY | Non-empty string |
| ET-007 | All errors have HOW | Non-empty string |
| ET-008 | Unavailable errors trigger degraded | isUnavailable = true |
| ET-009 | Recoverable errors have retry delay | delay > 0 |
| ET-010 | Non-recoverable have no retry | delay = 0 |

**Test File:** `src/shared/errors/ciaSieErrorTranslator.test.ts`

**Invariants Covered:** INV-005, CR-003

---

### Category 4: Deep Health Probe Tests

**Purpose:** Verify health check implementation

| Test ID | Test Description | Pass Criteria |
|---------|------------------|---------------|
| HP-001 | All healthy → overall healthy | Status = 'healthy' |
| HP-002 | Process unhealthy → overall unhealthy | Status = 'unhealthy' |
| HP-003 | Subsystem unhealthy → degraded | Status = 'degraded' |
| HP-004 | Latency recorded | latencyMs >= 0 |
| HP-005 | Timeout handled | Error returned, no crash |
| HP-006 | Network error handled | Error returned, no crash |
| HP-007 | Response sanitized | No control characters |
| HP-008 | Only GET /health called | No other endpoints |

**Test File:** `src/server/services/ciaSieHealthProbe.test.ts`

**Invariants Covered:** INV-002, INV-005

---

### Category 5: Health Visibility Hook Tests

**Purpose:** Verify minimal integration hook

| Test ID | Test Description | Pass Criteria |
|---------|------------------|---------------|
| HV-001 | Returns UNKNOWN before first check | status = 'UNKNOWN' |
| HV-002 | Returns CONNECTED on success | status = 'CONNECTED' |
| HV-003 | Returns DISCONNECTED on failure | status = 'DISCONNECTED' |
| HV-004 | Only /health endpoint called | No other URLs |
| HV-005 | No WebSocket connections | WebSocket not used |
| HV-006 | No EventSource/SSE | EventSource not used |
| HV-007 | Only GET method used | method = 'GET' |
| HV-008 | Polling stops on unmount | No orphan intervals |
| HV-009 | checkNow function works | Manual refresh succeeds |

**Test File:** `src/client/hooks/useCiaSieHealth.test.ts`

**Invariants Covered:** INV-002, Minimal Integration constraints

---

### Category 6: Engine Status Indicator Tests

**Purpose:** Verify cockpit display component

| Test ID | Test Description | Pass Criteria |
|---------|------------------|---------------|
| ES-001 | Displays CONNECTED when healthy | Text visible |
| ES-002 | Displays DISCONNECTED when unhealthy | Text visible |
| ES-003 | Shows green indicator when connected | Green color |
| ES-004 | Shows red indicator when disconnected | Red color |
| ES-005 | Shows latency when connected | Xms displayed |
| ES-006 | No control buttons rendered | No buttons |
| ES-007 | No telemetry data displayed | No positions/orders |
| ES-008 | No lifecycle controls displayed | No start/stop |
| ES-009 | Compact mode works | Abbreviated display |

**Test File:** `src/client/components/cockpit/EngineStatusIndicator.test.tsx`

**Invariants Covered:** CR-003 (Truthfulness), Minimal Integration constraints

---

### Category 7: Lifecycle Contamination Tests

**Purpose:** Verify no hidden lifecycle coupling

| Test ID | Test Description | Pass Criteria |
|---------|------------------|---------------|
| LC-001 | No 'start' in health hook | grep returns 0 |
| LC-002 | No 'stop' in health hook | grep returns 0 |
| LC-003 | No 'ignit' in health hook | grep returns 0 |
| LC-004 | No 'shutdown' in health hook | grep returns 0 |
| LC-005 | No WebSocket in health hook | grep returns 0 |
| LC-006 | No EventSource in health hook | grep returns 0 |
| LC-007 | No POST methods in health hook | Only GET |
| LC-008 | No state sync in health store | No sync methods |

**Test Method:** Static analysis (grep/search)

**Invariants Covered:** All lifecycle constraints

---

### Category 8: Invariant Regression Tests

**Purpose:** Verify all 6 invariants remain intact

| Test ID | Invariant | Test Description | Pass Criteria |
|---------|-----------|------------------|---------------|
| IR-001 | INV-001 | Token store is single source of truth | No duplicate stores |
| IR-002 | INV-002 | Lifecycle is deterministic | No random behavior |
| IR-003 | INV-003 | Graceful degradation works | Features degrade safely |
| IR-004 | INV-004 | State persists correctly | Zustand persist works |
| IR-005 | INV-005 | Failures are visible | Errors surface to UI |
| IR-006 | INV-006 | Inputs are sanitized | Boundary cleaning works |

**Test Method:** Existing test suite + manual verification

---

### Category 9: Rollback Verification Tests

**Purpose:** Verify rollback procedures work

| Test ID | Test Description | Pass Criteria |
|---------|------------------|---------------|
| RV-001 | Minimal integration rollback | < 60 seconds |
| RV-002 | BLOCK-001 rollback | < 60 seconds |
| RV-003 | BLOCK-002 rollback | < 60 seconds |
| RV-004 | BLOCK-003 rollback | < 60 seconds |
| RV-005 | BLOCK-004 rollback | < 60 seconds |
| RV-006 | Complete rollback | < 60 seconds |
| RV-007 | Post-rollback tests pass | 100% pass |
| RV-008 | Post-rollback app runs | No errors |

**Test Method:** Manual execution of rollback procedures

---

## 3. REQUIRED FIXTURES

### Mock Fixtures

| Fixture | Purpose | Location |
|---------|---------|----------|
| `mockFetch` | Mock HTTP requests | Test setup |
| `mockWebSocket` | Verify no WS usage | Test setup |
| `mockEventSource` | Verify no SSE usage | Test setup |
| `healthyResponse` | Simulate healthy engine | Test data |
| `unhealthyResponse` | Simulate unhealthy engine | Test data |
| `errorResponses` | Simulate various errors | Test data |

### Health Response Fixtures

```typescript
// Healthy response
const healthyResponse = {
  status: 'ok',
  app: 'cia-sie-pure',
  version: '1.0.0',
};

// Subsystem responses
const dbHealthy = { status: 'ok' };
const dbUnhealthy = { status: 'error', message: 'Connection failed' };
const aiHealthy = { status: 'ok' };
const aiUnhealthy = { status: 'error', message: 'Budget exhausted' };
```

### Error Response Fixtures

```typescript
// HTTP error responses
const error400 = { detail: 'Validation failed' };
const error401 = { detail: 'Authentication required' };
const error404 = { detail: 'Resource not found' };
const error500 = { detail: 'Internal server error' };
const error503 = { detail: 'Service unavailable' };
```

---

## 4. PASS/FAIL CRITERIA

### Individual Test Level

| Result | Definition |
|--------|------------|
| PASS | Assertion succeeds |
| FAIL | Assertion fails |
| SKIP | Test intentionally skipped |
| ERROR | Test throws unexpected error |

### Category Level

| Result | Definition |
|--------|------------|
| PASS | All tests in category pass |
| FAIL | Any test in category fails |
| PARTIAL | Some tests pass, some fail |

### Gate Level

| Result | Definition |
|--------|------------|
| PASS | All categories pass |
| FAIL | Any category fails |

### Gate 7 Pass Requirements

| Requirement | Threshold |
|-------------|-----------|
| Overall pass rate | 100% |
| Critical test pass rate | 100% |
| Non-critical test pass rate | 100% |
| Invariant verification | All 6 pass |
| Lifecycle contamination | Zero violations |

---

## 5. INVARIANTS COVERED

### Invariant Coverage Matrix

| Invariant | Categories | Tests |
|-----------|------------|-------|
| INV-001: Single Source of Truth | 8 | IR-001 |
| INV-002: System Lifecycle Discipline | 2, 4, 5 | HS-*, HP-*, HV-* |
| INV-003: Graceful Degradation | 8 | IR-003 |
| INV-004: State Persistence | 8 | IR-004 |
| INV-005: Failure Visibility | 3, 4 | ET-*, HP-* |
| INV-006: Input Sanitization | 1 | BS-* |

### Constitutional Requirements Covered

| Requirement | Categories | Tests |
|-------------|------------|-------|
| CR-001: No Aggregation | N/A | Not in scope |
| CR-002: Expose Contradictions | N/A | Not in scope |
| CR-003: Descriptive AI Only | 3, 6 | ET-*, ES-* |
| CR-004: Token Lifecycle | N/A | Existing tests |
| CR-005: User Experience | 6 | ES-* |

---

## 6. EXECUTION ORDER

### Pre-Gate Verification

1. Run existing MCI test suite
2. Verify baseline test count
3. Verify TypeScript compilation
4. Verify application builds

### Gate 7 Execution Order

1. **Category 1:** Boundary Sanitization (BLOCK-001)
2. **Category 2:** Health State Tracking (BLOCK-002)
3. **Category 3:** Error Translation (BLOCK-003)
4. **Category 4:** Deep Health Probes (BLOCK-004)
5. **Category 5:** Health Visibility Hook (Minimal Integration)
6. **Category 6:** Engine Status Indicator (Minimal Integration)
7. **Category 7:** Lifecycle Contamination (Static Analysis)
8. **Category 8:** Invariant Regression
9. **Category 9:** Rollback Verification

### Post-Gate Verification

1. Run full test suite
2. Verify final test count
3. Generate coverage report
4. Produce verification certificate

---

## 7. VERIFICATION COMMAND (NOT TO BE EXECUTED)

```bash
# DO NOT EXECUTE - FOR DOCUMENTATION ONLY

# Pre-Gate
npm run typecheck
npm run build

# Gate 7 (Full Suite)
npm test

# Gate 7 (Specific Categories)
npm test -- --grep "BLOCK-001"
npm test -- --grep "BLOCK-002"
npm test -- --grep "BLOCK-003"
npm test -- --grep "BLOCK-004"
npm test -- --grep "useCiaSieHealth"
npm test -- --grep "EngineStatusIndicator"

# Lifecycle Contamination Check
grep -r "start\|stop\|ignit\|shutdown" src/client/hooks/useCiaSieHealth.ts
grep -r "WebSocket\|EventSource" src/client/hooks/useCiaSieHealth.ts

# Coverage Report
npm run test:coverage
```

---

## 8. GATE 7 VERIFICATION CERTIFICATE TEMPLATE

```markdown
# Gate 7 Verification Certificate

**Date:** YYYY-MM-DD
**Executed By:** [Name]
**Authorization:** [Principal Authorization Reference]

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | XXX |
| Tests Passed | XXX |
| Tests Failed | 0 |
| Pass Rate | 100% |

## Category Results

| Category | Tests | Passed | Failed | Result |
|----------|-------|--------|--------|--------|
| Boundary Sanitization | XX | XX | 0 | ✅ PASS |
| Health State Tracking | XX | XX | 0 | ✅ PASS |
| Error Translation | XX | XX | 0 | ✅ PASS |
| Deep Health Probes | XX | XX | 0 | ✅ PASS |
| Health Visibility Hook | XX | XX | 0 | ✅ PASS |
| Engine Status Indicator | XX | XX | 0 | ✅ PASS |
| Lifecycle Contamination | XX | XX | 0 | ✅ PASS |
| Invariant Regression | XX | XX | 0 | ✅ PASS |
| Rollback Verification | XX | XX | 0 | ✅ PASS |

## Invariant Verification

| Invariant | Status |
|-----------|--------|
| INV-001 | ✅ VERIFIED |
| INV-002 | ✅ VERIFIED |
| INV-003 | ✅ VERIFIED |
| INV-004 | ✅ VERIFIED |
| INV-005 | ✅ VERIFIED |
| INV-006 | ✅ VERIFIED |

## Lifecycle Contamination Check

| Check | Result |
|-------|--------|
| No start commands | ✅ CLEAN |
| No stop commands | ✅ CLEAN |
| No WebSocket usage | ✅ CLEAN |
| No EventSource usage | ✅ CLEAN |

## Rollback Verification

| Rollback | Time | Result |
|----------|------|--------|
| Minimal Integration | XX s | ✅ PASS |
| Complete Rollback | XX s | ✅ PASS |

## Gate 7 Result

> **✅ GATE 7 PASSED**
>
> All verification criteria met. Integration may proceed with Principal authorization.

---

Signed: ________________
Date: YYYY-MM-DD
```

---

## 9. ASSUMPTIONS (EXPLICIT)

| Assumption | Basis | Risk |
|------------|-------|------|
| Tests are comprehensive | Test coverage analysis | MEDIUM |
| Invariants are correctly defined | Governance documents | LOW |
| Pass criteria are sufficient | Industry standards | MEDIUM |
| Lifecycle contamination is detectable | Static analysis | LOW |

---

## 10. NON-ASSUMPTIONS (EXPLICIT)

| Non-Assumption | Statement |
|----------------|-----------|
| Tests guarantee correctness | We do NOT assume passing tests mean bug-free code |
| Coverage means completeness | We do NOT assume high coverage means all cases tested |
| Gate 7 is final | We do NOT assume no issues will be found post-Gate 7 |
| Automation catches all | We do NOT assume manual verification is unnecessary |

---

## ATTESTATION

This Gate 7 Verification Plan was prepared under the Multi-Silo Execution Directive dated 2026-01-29.

**Compliance Verification:**

| Prohibition | Status |
|-------------|--------|
| ❌ No test execution | ✅ COMPLIANT |
| ❌ No CI changes | ✅ COMPLIANT |
| ❌ No code changes | ✅ COMPLIANT |

**Plan Summary:**

> This verification plan defines 9 test categories with 70+ individual tests covering all 6 invariants and minimal integration constraints. Required fixtures, pass/fail criteria, execution order, and a certificate template are provided. Verification commands are documented but NOT executed. The plan is ready for instant execution upon Principal authorization.

---

*End of Gate 7 Verification Plan*
