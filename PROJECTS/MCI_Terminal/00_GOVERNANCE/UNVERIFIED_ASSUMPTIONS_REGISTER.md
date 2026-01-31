# UNVERIFIED ASSUMPTIONS REGISTER

**Document ID:** UAR-2026-01-29  
**Generated:** 2026-01-29 22:58:12 IST  
**Classification:** FORENSIC VERIFICATION  
**Purpose:** Catalog all assumptions not backed by verified evidence

---

## CLASSIFICATION KEY

| Status | Meaning |
|--------|---------|
| **VERIFIED** | Confirmed by test execution or direct observation |
| **UNVERIFIED** | Assumed but not confirmed |
| **UNVERIFIABLE** | Cannot be confirmed with available access/tooling |

---

# SYSTEM A: 001_MCI_TERMINAL_EXTRACTION

## Verified Assumptions

| ID | Assumption | Verification Method | Evidence |
|----|------------|---------------------|----------|
| V-MCI-001 | Test suite passes | `npm test -- --run` | 1,177 tests pass |
| V-MCI-002 | TypeScript compiles | `npm run typecheck` | No errors |
| V-MCI-003 | CR-004 6AM IST calculation correct | Unit tests | tokenStore.test.ts |
| V-MCI-004 | State machines transition correctly | Unit tests | All store tests |
| V-MCI-005 | Error translation works | Unit tests | ciaSieErrorTranslator.test.ts |
| V-MCI-006 | Sanitization rejects control chars | Unit tests | sanitize.test.ts |
| V-MCI-007 | Kill-switch blocks activation | Unit tests | activation.test.ts |
| V-MCI-008 | Rollback steps defined | Unit tests | activation.test.ts |

## Unverified Assumptions

| ID | Assumption | Why Unverified | Risk Level | Mitigation |
|----|------------|----------------|------------|------------|
| U-MCI-001 | CIA-SIE-PURE responds within 5s | No live connection | MEDIUM | Timeout wrapper exists |
| U-MCI-002 | CIA-SIE-PURE error format matches translator | No live response | HIGH | Translator handles unknowns |
| U-MCI-003 | Kite API token format stable | No live validation | LOW | Validation catches invalid |
| U-MCI-004 | Sentry DSN works in production | No live Sentry | LOW | Sentry SDK well-tested |
| U-MCI-005 | Browser fetch has reasonable timeout | Browser-specific | MEDIUM | Should add AbortController |
| U-MCI-006 | Single-tab usage model holds | Not tested | LOW | Multi-tab would desync |
| U-MCI-007 | CIA-SIE-PURE health endpoint truthful | Cannot verify | **HIGH** | MCI trusts blindly |
| U-MCI-008 | E2E Playwright tests pass | Not executed | MEDIUM | Tests exist, not run |
| U-MCI-009 | WebSocket/SSE disabled at runtime | Not tested live | LOW | DARK_MODE enforces |
| U-MCI-010 | localStorage always available | Not tested cross-browser | LOW | Standard API |

## Unverifiable Assumptions

| ID | Assumption | Why Unverifiable | Permanent? | Workaround |
|----|------------|------------------|------------|------------|
| X-MCI-001 | Production traffic patterns | No production | YES | Load testing before launch |
| X-MCI-002 | Kite Connect API uptime | External service | YES | Monitor in production |
| X-MCI-003 | TradingView data accuracy | External source | YES | Accept as given |
| X-MCI-004 | Anthropic Claude availability | External service | YES | Fallback exists in CIA-SIE |
| X-MCI-005 | Network latency in production | Unknown infra | YES | Monitor post-deploy |

---

# SYSTEM B: CIA-SIE-PURE

## Verified Assumptions

| ID | Assumption | Verification Method | Evidence |
|----|------------|---------------------|----------|
| V-PURE-001 | Source code readable | File access | Full repository visible |
| V-PURE-002 | Exception classes defined | Code read | exceptions.py exists |
| V-PURE-003 | Constitutional validation exists | Code read | response_validator.py |
| V-PURE-004 | Health endpoint exists | Code read | app.py:165-183 |
| V-PURE-005 | FastAPI structure standard | Code read | Standard FastAPI patterns |

## Unverified Assumptions

| ID | Assumption | Why Unverified | Risk Level | Mitigation |
|----|------------|----------------|------------|------------|
| U-PURE-001 | 51 test files all pass | Cannot execute pytest | **CRITICAL** | Must install and run |
| U-PURE-002 | Constitutional tests catch all violations | Cannot run tests | HIGH | Tests exist, need execution |
| U-PURE-003 | Health endpoint returns "healthy" when DB corrupt | Cannot test | **CRITICAL** | Known design flaw |
| U-PURE-004 | Rate limiting works as configured | Cannot load test | MEDIUM | Code looks correct |
| U-PURE-005 | SQLite handles concurrent writes | Cannot stress test | MEDIUM | NullPool reduces risk |
| U-PURE-006 | AI retry logic (3 attempts) works | Cannot test | MEDIUM | Code looks correct |
| U-PURE-007 | Fallback narrative triggers on AI failure | Cannot test | MEDIUM | Code path exists |
| U-PURE-008 | Webhook HMAC validation works | Cannot test | HIGH | Security-critical |
| U-PURE-009 | Database migrations run correctly | Cannot run alembic | MEDIUM | alembic.ini exists |
| U-PURE-010 | Process supervision works | Cannot test | HIGH | Requires docker/systemd |
| U-PURE-011 | SIGTERM graceful shutdown works | Cannot test | MEDIUM | Lifespan handler exists |
| U-PURE-012 | CORS configuration correct | Cannot test | LOW | Code looks standard |

## Unverifiable Assumptions

| ID | Assumption | Why Unverifiable | Permanent? | Workaround |
|----|------------|------------------|------------|------------|
| X-PURE-001 | Anthropic Claude API stable | External service | YES | Monitor in production |
| X-PURE-002 | TradingView webhook format stable | External source | YES | Validation at ingestion |
| X-PURE-003 | Production SQLite performance | No prod env | YES | Monitor post-deploy |
| X-PURE-004 | AI response quality | Subjective | YES | Constitutional validation |
| X-PURE-005 | Signal freshness accuracy | TradingView timing | YES | Accept as given |

---

# CROSS-SYSTEM ASSUMPTIONS

## Unverified Integration Assumptions

| ID | Assumption | Why Unverified | Risk Level | Mitigation |
|----|------------|----------------|------------|------------|
| U-INT-001 | MCI can reach CIA-SIE-PURE health endpoint | No live test | **CRITICAL** | Must verify before OPS |
| U-INT-002 | CIA-SIE-PURE telemetry format matches MCI types | No live data | HIGH | Canonical types defined |
| U-INT-003 | Error codes map correctly | No live errors | MEDIUM | Translator handles unknowns |
| U-INT-004 | Latency classification works live | No live metrics | MEDIUM | Thresholds defined |
| U-INT-005 | Degraded mode triggers correctly | No live failures | MEDIUM | Store logic tested |
| U-INT-006 | Kill-switch stops integration | Not tested E2E | HIGH | Unit tests verify |
| U-INT-007 | Rollback restores MCI to safe state | Not tested E2E | HIGH | Unit tests verify |
| U-INT-008 | Schema drift does not exist | No comparison tool | MEDIUM | Types defined, not compared |

---

# RISK SUMMARY

## By Risk Level

| Level | MCI Count | CIA-SIE-PURE Count | Integration Count | Total |
|-------|-----------|-------------------|-------------------|-------|
| CRITICAL | 0 | 2 | 1 | 3 |
| HIGH | 1 | 2 | 3 | 6 |
| MEDIUM | 3 | 6 | 3 | 12 |
| LOW | 4 | 2 | 0 | 6 |

## Critical Items Requiring Closure

| ID | Assumption | Action Required |
|----|------------|-----------------|
| U-PURE-001 | Test files pass | Execute `pytest` on CIA-SIE-PURE |
| U-PURE-003 | Health lies when DB corrupt | Accept risk OR fix health endpoint |
| U-INT-001 | Systems can communicate | Start both, verify handshake |

---

# ACCEPTANCE RECOMMENDATIONS

## Must Verify Before PAD-OPS1

| ID | Action |
|----|--------|
| U-PURE-001 | Install pytest, run CIA-SIE-PURE tests |
| U-INT-001 | Start both systems, curl health endpoints |

## Accept as Documented Risk

| ID | Risk | Rationale |
|----|------|-----------|
| U-PURE-003 | Health endpoint lies | Document in ops guide, plan to fix |
| U-MCI-007 | MCI trusts CIA-SIE-PURE health | Consequence of above |
| X-PURE-001 | External API stability | Cannot control, monitor instead |
| X-MCI-003 | TradingView accuracy | External data, inform users |

## Defer to Production Monitoring

| ID | Risk | Monitor How |
|----|------|-------------|
| U-MCI-001 | CIA-SIE-PURE latency | Sentry latency metrics |
| U-PURE-005 | SQLite concurrency | Database lock monitoring |
| X-MCI-005 | Network latency | APM tooling |

---

**END OF UNVERIFIED ASSUMPTIONS REGISTER**
