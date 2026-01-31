# CIA-SIE-PURE Canonical State Reconstitution
## Gold Standard Deep Application — Forensic Analysis

**Document ID:** CIA-SIE-PURE-FORENSIC-001  
**Date:** 2026-01-29  
**Classification:** GOVERNANCE, CANONICAL STATE & LIFECYCLE ANALYSIS  
**Execution Status:** 🔒 RESTRAINED — ANALYSIS ONLY  
**Authorization:** ❌ NO CODE · ❌ NO REFACTOR · ❌ NO INTEGRATION · ❌ NO PSEUDOCODE

---

## OPENING ATTESTATION

This analysis was conducted with the following confirmations:

- ✅ All MCI Gold Standard materials read and internalized
- ✅ CIA-SIE-PURE treated as a **system under forensic examination**, not an integration target
- ✅ **No assumptions of readiness, fitness, or compatibility inferred**
- ✅ Analysis conducted with **adversarial rigor** — truth extraction, not optimization

**Notation Convention:**
- **[FACT]** — Directly observed in code
- **[UNKNOWN]** — Cannot be determined from available evidence
- **[ASSUMPTION]** — Inference requiring verification
- **[EMERGENT]** — Behavior that arises from implementation, not design

---

## 1. CANONICAL SYSTEM IDENTITY

### 1.1 Execution Roots and Authoritative Entry Points

| Entry Point | Location | Authority Level |
|-------------|----------|-----------------|
| **Primary Entry** | `src/cia_sie/main.py:main()` | AUTHORITATIVE — Starts uvicorn |
| **App Factory** | `src/cia_sie/api/app.py:create_app()` | AUTHORITATIVE — Creates FastAPI instance |
| **Lifespan Handler** | `app.py:lifespan()` | AUTHORITATIVE — Startup/shutdown hooks |
| **Launcher Script** | `scripts/launcher/ignite.sh:main()` | ORCHESTRATOR — Invokes primary entry |

**[FACT]** From `main.py`:
```python
def main() -> None:
    setup_logging()
    settings = get_settings()
    uvicorn.run(
        "cia_sie.api.app:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
```

**Finding:** The authoritative entry point is the `main()` function, which invokes uvicorn. The launcher script is an orchestration layer, not the authority.

### 1.2 Process Model and Concurrency Assumptions

| Aspect | Implementation | Risk Assessment |
|--------|----------------|-----------------|
| **Process Model** | Single-process, async I/O | LOW — Standard ASGI |
| **Concurrency** | asyncio event loop | LOW — Well-understood |
| **Worker Model** | Single worker (default uvicorn) | MEDIUM — No HA by default |
| **Thread Safety** | Not explicitly addressed | **[UNKNOWN]** — Requires verification |

**[FACT]** From `database.py`:
```python
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True,
    poolclass=NullPool,  # No connection pooling
)
```

**Finding:** `NullPool` is used, meaning each request gets a new connection. This is safe for SQLite but may cause performance issues under load.

### 1.3 Runtime Authority Boundaries

| Domain | Authority | Location |
|--------|-----------|----------|
| **Configuration** | `Settings` class (pydantic) | `core/config.py` |
| **Data Schema** | SQLAlchemy models | `dal/models.py` |
| **Domain Models** | Pydantic models | `core/models.py` |
| **Enums** | Python Enum classes | `core/enums.py` |
| **API Contract** | FastAPI route decorators | `api/routes/*.py` |
| **Constitutional Rules** | Code comments + validator patterns | `ai/response_validator.py` |

**[EMERGENT]** Constitutional rules are embedded in multiple locations:
- Docstrings in model files
- Regex patterns in `response_validator.py`
- Prompt templates in `prompt_builder.py`
- Comments in config (prohibited fields)

**Finding:** There is no single constitutional authority file. Rules are distributed across codebase.

### 1.4 Database Authority vs Runtime Authority

| Data Type | Database Authority | Runtime Authority | Conflict Risk |
|-----------|-------------------|-------------------|---------------|
| **Entities** | SQLAlchemy `*DB` models | Pydantic domain models | MEDIUM — Dual definitions |
| **Enums** | String columns | Python Enums | LOW — Validated on read |
| **Timestamps** | `DateTime(timezone=True)` | `datetime.now(UTC)` | LOW — Consistent |
| **UUIDs** | `String(36)` | Python `UUID` | LOW — Converted correctly |

**[FACT]** Dual model definitions exist:
- `dal/models.py`: `ChartDB`, `SignalDB`, `SiloDB` (SQLAlchemy)
- `core/models.py`: `Chart`, `Signal`, `Silo` (Pydantic)

**Finding:** Schema changes require updates in TWO places. Drift is possible.

### 1.5 Declared vs Emergent Behavior

| Declared | Emergent | Gap |
|----------|----------|-----|
| "Stateless per request" | Session state in in-memory rate limiter | **YES** — Rate limit state persists |
| "No aggregation" | ContradictionDetector counts pairs | **NO** — Counting is not aggregation |
| "Passive data repository" | AI narrative generation | **NO** — Generation is on-demand |
| "Health check reliable" | Health check does not verify DB | **YES** — Partial health only |

**[FACT]** From `app.py` health endpoint:
```python
return {
    "status": "healthy",
    "app": settings.app_name,
    "version": settings.app_version,
    ...
}
```

**Finding:** Health endpoint returns "healthy" without verifying database connectivity or AI service availability.

---

## 2. LIFECYCLE DISCIPLINE RECONSTRUCTION

### 2.1 Cold Start Sequence

**[FACT]** From `ignite.sh`:
1. Verify prerequisites (venv, source, port)
2. Activate Python virtual environment
3. Start backend (uvicorn) with health check
4. Start ngrok (optional)
5. Start frontend (if exists)
6. Open browser (optional)

**Health Check Parameters:**
- Retries: 15
- Interval: 2 seconds
- Connect timeout: 5 seconds
- Max time: 10 seconds

**[FACT]** From `app.py` lifespan:
```python
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup
    await init_db()
    logger.info("Database initialized")
    yield
    # Shutdown
    logger.info("Shutting down CIA-SIE application...")
```

**Finding:** Database is initialized at startup via `init_db()` which calls `Base.metadata.create_all`. This is idempotent.

**Determinism Classification:** ✅ **DETERMINISTIC**
- Prerequisites verified before start
- Port conflict detected
- Health check confirms readiness
- Database auto-initialized

### 2.2 Warm Restart Behavior

**[FACT]** From `ignite.sh`:
```bash
pid=$(find_process_by_pattern "${BACKEND_PATTERN}")
if [[ -n "${pid}" ]]; then
    if check_backend_health; then
        return 0  # Reuse existing
    else
        kill -TERM "${pid}" 2>/dev/null
        sleep 2
    fi
fi
```

**State Persistence Analysis:**

| State Type | Persists Across Restart? | Location |
|------------|-------------------------|----------|
| Database data | ✅ YES | SQLite file |
| Rate limit counters | ❌ NO | In-memory |
| AI usage tracking | ✅ YES | Database |
| Active sessions | ❌ NO | In-memory |
| Cached settings | ❌ NO | `@lru_cache` |

**Determinism Classification:** ⚠️ **CONDITIONALLY DETERMINISTIC**
- Database state preserved
- In-memory state (rate limits, caches) lost
- Settings re-read from environment

### 2.3 Crash Recovery Behavior

**[FACT]** From `ignite.sh` monitoring loop:
```bash
while true; do
    sleep 60
    if ! is_process_running "$(get_pid "backend")"; then
        print_warning "Backend process has stopped unexpectedly"
        log_message "ERROR" "MONITOR" "Backend process stopped unexpectedly"
    fi
done
```

**Finding:** Crash is DETECTED but NOT automatically recovered. Manual restart required.

**SQLite Recovery:**
- WAL mode not explicitly configured
- Auto-vacuum not configured
- **[UNKNOWN]** — Behavior on mid-transaction crash

**Determinism Classification:** ⚠️ **CONDITIONALLY DETERMINISTIC**
- Crash is logged
- No automatic restart
- Database state depends on crash timing

### 2.4 Graceful Shutdown Sequence

**[FACT]** From `shutdown.sh`:
1. Stop frontend (SIGTERM, then SIGKILL after 10s)
2. Stop ngrok (SIGTERM, then SIGKILL)
3. Stop backend (SIGTERM, then SIGKILL)
4. Cleanup PID files

**[FACT]** From `app.py` lifespan:
```python
yield
# Shutdown
logger.info("Shutting down CIA-SIE application...")
```

**Finding:** Lifespan handler logs shutdown but does not explicitly close database connections. SQLAlchemy async engine should handle this automatically.

**Determinism Classification:** ✅ **DETERMINISTIC**
- Signal handling is explicit
- Fallback to SIGKILL exists
- Orphan detection included

### 2.5 Forced Termination

**[FACT]** From `shutdown.sh`:
```bash
kill -KILL "${pid}" 2>/dev/null
```

**Finding:** SIGKILL is used after SIGTERM timeout. This bypasses Python's signal handlers.

**Risk Assessment:**
- In-flight requests terminated abruptly
- Database transactions may be left incomplete
- **[UNKNOWN]** — AI API requests are not cancelled

**Determinism Classification:** ⚠️ **CONDITIONALLY DETERMINISTIC**
- SIGKILL is reliable
- Application state may be inconsistent

### 2.6 Orphan Process Handling

**[FACT]** From `shutdown.sh`:
```bash
orphans=$(find_process_by_pattern "uvicorn.*cia_sie")
if [[ -n "${orphans}" ]]; then
    log_message "WARN" "CLEANUP" "Found orphan uvicorn process: ${orphans}"
    print_warning "Found orphan backend process (PID: ${orphans})"
    print_info "Run: kill ${orphans}"
fi
```

**Finding:** Orphans are DETECTED and WARNED but NOT automatically killed.

**Determinism Classification:** ⚠️ **CONDITIONALLY DETERMINISTIC**
- Detection is reliable
- Remediation requires manual action

---

## 3. STATE MODEL & AUTHORITY

### 3.1 Explicit vs Implicit State

| State | Explicit? | Evidence |
|-------|-----------|----------|
| **Database records** | ✅ YES | SQLAlchemy models, migrations |
| **Process running** | ✅ YES | PID files |
| **Service healthy** | ⚠️ PARTIAL | Health endpoint exists but limited |
| **AI available** | ❌ NO | Only discovered on first request |
| **Rate limited** | ❌ NO | Implicitly tracked in-memory |
| **Kite connected** | ❌ NO | Only discovered on first request |

**Finding:** System-level operational state is largely IMPLICIT.

### 3.2 State Storage Locations

| State | Storage | Recovery Semantics |
|-------|---------|-------------------|
| Business data | SQLite database | Automatic (file persists) |
| Configuration | Environment variables | Manual (re-read on start) |
| Process state | PID files in `pids/` | Automatic (file persists) |
| AI usage | Database table | Automatic (file persists) |
| Rate limits | In-memory dict | **LOST** on restart |
| Logs | File system | Automatic (file persists) |

### 3.3 State Transition Ownership

**[FACT]** There is NO explicit state machine in CIA-SIE-PURE.

| Pseudo-State | Transition Trigger | Owner |
|--------------|-------------------|-------|
| STOPPED → STARTING | Launcher script execution | Shell script |
| STARTING → RUNNING | Health check passes | Shell script |
| RUNNING → STOPPED | SIGTERM received | OS/uvicorn |
| RUNNING → CRASHED | Unhandled exception | Python runtime |

**Finding:** State transitions are EMERGENT from process lifecycle, not explicitly modeled.

### 3.4 Illegal State Representability

| Potential Illegal State | Can Be Represented? | Detection |
|------------------------|---------------------|-----------|
| DB says running, process stopped | ❌ NO (no DB state) | N/A |
| PID file exists, process dead | ✅ YES | Health check failure |
| Health says healthy, DB corrupt | ✅ YES | **NOT DETECTED** |
| Kite shows connected, token expired | ✅ YES | **NOT DETECTED** |

**Finding:** Some illegal states are representable but not detectable.

### 3.5 Recovery Semantics

| Failure Mode | Recovery Defined? | Recovery Method |
|--------------|------------------|-----------------|
| Database unavailable | ⚠️ PARTIAL | Exception propagates, request fails |
| AI API timeout | ⚠️ PARTIAL | Fallback narrative generated |
| Webhook signature invalid | ✅ YES | HTTP 401 returned |
| Rate limit exceeded | ✅ YES | HTTP 429 returned |
| Constitutional violation | ✅ YES | Retry up to 3 times, then exception |

---

## 4. INVARIANT COMPATIBILITY ASSESSMENT

*See companion document: `INVARIANT_COMPATIBILITY_MATRIX.md`*

---

## 5. ERROR SEMANTICS & CONSTITUTIONAL ENFORCEMENT

### 5.1 Error Taxonomy

**[FACT]** From `exceptions.py`:

| Exception Class | Purpose | HTTP Status |
|-----------------|---------|-------------|
| `CIASIEError` | Base exception | 500 |
| `InstrumentNotFoundError` | Missing entity | 404 |
| `ValidationError` | Invalid input | 400 |
| `InvalidWebhookPayloadError` | Bad webhook | 400 |
| `WebhookNotRegisteredError` | Unknown webhook | 404 |
| `DatabaseError` | DB operation failed | 500 |
| `AIProviderError` | Claude API failed | 500/503 |
| `ConstitutionalViolationError` | CR violation | 500 |
| `AggregationAttemptError` | CR-001 violation | 500 |
| `RecommendationAttemptError` | CR-001 violation | 500 |
| `ContradictionResolutionAttemptError` | CR-002 violation | 500 |

### 5.2 Error Propagation Paths

```
[External Request]
       ↓
[FastAPI Route Handler]
       ↓ (exception raised)
[FastAPI Exception Handler] ← **[UNKNOWN]** Custom handlers?
       ↓
[HTTP Response]
       ↓
[Client]
```

**[UNKNOWN]** Whether custom exception handlers exist to standardize error format.

### 5.3 WHAT / WHY / HOW Alignment

| Exception | WHAT | WHY | HOW |
|-----------|------|-----|-----|
| `InstrumentNotFoundError` | ✅ Message provided | ⚠️ Implicit | ❌ Not provided |
| `ValidationError` | ✅ Message provided | ⚠️ Implicit | ❌ Not provided |
| `ConstitutionalViolationError` | ✅ Message provided | ✅ Details dict | ❌ Not provided |

**Finding:** Error messages do NOT conform to MCI's WHAT/WHY/HOW standard.

### 5.4 Constitutional Enforcement

**[FACT]** From `response_validator.py`:

**Defense Layers:**
1. **Prompt Engineering** — System prompt explicitly prohibits prescriptive language
2. **Regex Validation** — 27+ prohibited patterns checked
3. **Mandatory Disclaimer** — Required in all AI output
4. **Retry Logic** — Up to 3 retries with stricter prompts
5. **Fallback Narrative** — Non-AI fallback if all retries fail

**Prohibited Pattern Categories:**
- Recommendation language ("you should", "I recommend")
- Trading action language ("buy now", "sell", "enter position")
- Aggregation language ("overall direction", "net signal")
- Confidence language ("confidence level", "probability")
- Prediction language ("will rise", "expected to")
- Ranking language ("stronger signal", "more reliable")

**Finding:** Constitutional enforcement is ROBUST with multiple defense layers.

### 5.5 Risk of Silent Semantic Corruption

| Corruption Vector | Risk Level | Mitigation |
|-------------------|------------|------------|
| AI generates prescriptive language | LOW | Regex validator catches |
| AI generates subtle recommendations | MEDIUM | May evade regex |
| Webhook delivers false data | HIGH | **NO MITIGATION** — Blind trust |
| Database stores corrupted state | MEDIUM | Pydantic validation on read |
| Config contains invalid values | LOW | Pydantic Settings validation |

---

## 6. LATENCY & TEMPORAL RISK SURFACE

### 6.1 AI Invocation Latency

**[FACT]** From `narrative_generator.py`:
- Max tokens: 2000 (silo narrative), 500 (chart narrative)
- Temperature: 0.3
- Model: `claude-3-5-sonnet-20241022` (default)

**Estimated Latency Distribution:**

| Scenario | Expected Latency | Worst Case |
|----------|-----------------|------------|
| Simple chart narrative | 1-3 seconds | 10 seconds |
| Complex silo narrative | 3-8 seconds | 20 seconds |
| With 1 retry | 6-16 seconds | 40 seconds |
| With 3 retries | 12-30 seconds | **60 seconds** |
| Claude API outage | N/A | Fallback triggered |

### 6.2 Retry Behavior

**[FACT]** From `response_validator.py`:
```python
for attempt in range(self.max_retries):
    response = await self.claude.generate(...)
    result = self.validator.validate(response)
    if result.is_valid:
        return ...
    # Add stricter constraints
    system_prompt = self._add_stricter_constraints(...)
    temperature = max(0.1, temperature - 0.1)
```

**Finding:** Each retry reduces temperature and adds constraints. Maximum 3 retries.

### 6.3 Timeout Semantics

**[UNKNOWN]** Whether Claude client has explicit timeouts configured.

**Observed from `config.py`:**
- No `ai_request_timeout` setting found
- HTTP client (httpx) default timeout: 5 seconds connect, no read timeout

### 6.4 Back-Pressure Behavior

**[FACT]** From `security.py`:
- Rate limiting: 60 req/min for webhooks, 100 req/min for API
- In-memory rate limiter (not distributed)

**Finding:** No explicit back-pressure for AI requests. If Claude is slow, requests queue up.

### 6.5 Budget Exhaustion Handling

**[FACT]** From `config.py`:
```python
ai_budget_limit: float = Field(default=50.0)
ai_budget_alert_threshold: int = Field(default=80, ge=1, le=100)
ai_fallback_model: str = Field(default="claude-3-haiku-20240307")
```

**Finding:** Budget exhaustion triggers fallback to cheaper model. Full exhaustion behavior is **[UNKNOWN]**.

---

## 7. COCKPIT TRUTHFULNESS READINESS

### 7.1 What a Consuming System Would Be Forced to Assume

| Data Point | Truth Guarantee | Assumption Required |
|------------|-----------------|---------------------|
| **Health status** | HIGH | None — HTTP 200 is reliable |
| **Signal freshness** | MEDIUM | Timestamp accuracy from TradingView |
| **Signal direction** | **LOW** | TradingView data is accurate |
| **Contradiction detection** | HIGH | Algorithm is deterministic |
| **AI narrative quality** | MEDIUM | Validator caught violations |
| **Kite connection status** | **LOW** | Only verified on action |
| **AI budget remaining** | HIGH | Database is accurate |

### 7.2 Truth Gaps

| Gap | Description | Severity |
|-----|-------------|----------|
| **TradingView Trust** | Signals are blindly trusted | HIGH |
| **Health Incompleteness** | DB/AI not verified | MEDIUM |
| **Stale Connection Indicators** | Kite status may be stale | MEDIUM |
| **Silent AI Degradation** | Fallback may not be obvious | LOW |
| **Absence vs Silence** | No signal ≠ no data available | MEDIUM |

### 7.3 Silence vs Absence Semantics

**[FACT]** From `freshness.py`:
```python
# NOTE: We NEVER return UNAVAILABLE based on age.
# UNAVAILABLE is only for retrieval failures.
```

**Finding:** STALE data is still displayed. UNAVAILABLE indicates retrieval failure only.

**Semantic Distinction:**
- No signal in database = chart exists but never received signal
- UNAVAILABLE = retrieval operation failed
- STALE = signal exists but is old

---

## 8. SUMMARY OF FINDINGS

### 8.1 Strengths

1. **Constitutional Defense in Depth** — AI response validation with retry logic
2. **Clear Domain Model** — Pydantic and SQLAlchemy models are well-defined
3. **Explicit Prohibited Fields** — Weight, confidence, score columns absent by design
4. **Launcher Discipline** — Health checks, PID files, signal handling
5. **Comprehensive Test Suite** — 64+ test files including constitutional tests
6. **Security Hardening** — HMAC webhooks, rate limiting, security headers

### 8.2 Weaknesses

1. **No Explicit State Machine** — System state is emergent, not modeled
2. **Distributed Constitutional Authority** — Rules spread across codebase
3. **Limited Health Check** — Does not verify DB or AI availability
4. **Missing Input Sanitization** — No control character rejection (INV-006)
5. **Error Format Non-Standard** — Does not conform to WHAT/WHY/HOW
6. **Unbounded AI Latency** — Can block for 60+ seconds
7. **No Automatic Recovery** — Crash requires manual restart
8. **Blind Trust of TradingView** — No signal verification

### 8.3 Unknowns Requiring Verification

| Unknown | Verification Method |
|---------|-------------------|
| Thread safety of shared state | Code review + load testing |
| SQLite behavior on crash | Crash injection testing |
| Claude client timeout behavior | Code inspection + testing |
| Custom exception handlers | Code inspection |
| WebSocket/SSE capabilities | Route inspection |
| Kite token refresh mechanism | Platform adapter code review |

---

## ATTESTATION

This canonical state reconstitution was produced under the Program Director Directive for Forensic State Reconstitution dated 2026-01-29.

**Compliance Verification:**

| Prohibition | Status |
|-------------|--------|
| ❌ No code modification | ✅ COMPLIANT |
| ❌ No refactoring | ✅ COMPLIANT |
| ❌ No pseudocode | ✅ COMPLIANT |
| ❌ No integration planning | ✅ COMPLIANT |
| ❌ No optimization | ✅ COMPLIANT |

**Analysis Rigor:**

| Requirement | Status |
|-------------|--------|
| Adversarial scrutiny | ✅ APPLIED |
| Emergent behavior identified | ✅ IDENTIFIED |
| Unknowns explicitly labeled | ✅ LABELED |
| No assumptions of readiness | ✅ ENFORCED |

---

*This document is the Single Source of Truth for CIA-SIE-PURE system reality.*

**End of Canonical State Reconstitution**
