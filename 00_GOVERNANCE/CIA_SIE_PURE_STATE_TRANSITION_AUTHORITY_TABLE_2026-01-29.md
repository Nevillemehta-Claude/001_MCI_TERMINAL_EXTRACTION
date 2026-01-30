# CIA-SIE-PURE STATE TRANSITION AUTHORITY TABLE

**Document ID:** PURE-STAT-001  
**Generated:** 2026-01-29 22:37:54 IST  
**Classification:** FORENSIC DESIGN VERIFICATION  
**System:** CIA-SIE-PURE (External Engine)  
**Source:** Canonical State Reconstitution Document

---

## CRITICAL FINDING

**CIA-SIE-PURE does NOT have an explicit state machine.**

State transitions are EMERGENT from process lifecycle, not deliberately designed. This table documents the inferred states based on forensic analysis.

---

## 1. PROCESS LIFECYCLE (EMERGENT STATE MACHINE)

### 1.1 Inferred States

| State | Description | Observable By | Definitive? |
|-------|-------------|---------------|-------------|
| `STOPPED` | Process not running | No PID file / process | ✅ YES |
| `STARTING` | Process launching, not ready | PID exists, health fails | ⚠️ INFERRED |
| `RUNNING` | Process healthy, accepting requests | Health returns 200 | ⚠️ PARTIAL (see 1.4) |
| `CRASHED` | Process exited unexpectedly | No process, PID stale | ⚠️ INFERRED |
| `STOPPING` | Graceful shutdown in progress | SIGTERM sent | ⚠️ TRANSIENT |

### 1.2 State Transition Table

| From | Event | To | Owner | Evidence |
|------|-------|-----|-------|----------|
| `STOPPED` | `ignite.sh` executed | `STARTING` | Shell script | ignite.sh |
| `STARTING` | Health check passes (15 retries, 2s interval) | `RUNNING` | Shell script | ignite.sh |
| `STARTING` | Health check fails after retries | `STOPPED` | Shell script | ignite.sh |
| `RUNNING` | SIGTERM received | `STOPPING` | uvicorn/OS | app.py lifespan |
| `RUNNING` | Unhandled exception | `CRASHED` | Python runtime | (emergent) |
| `STOPPING` | Lifespan handler completes | `STOPPED` | uvicorn | app.py lifespan |
| `STOPPING` | SIGKILL after 10s timeout | `STOPPED` | shutdown.sh | shutdown.sh |
| `CRASHED` | (No automatic recovery) | `CRASHED` | — | **GAP** |
| `CRASHED` | Manual restart | `STARTING` | Shell script | (manual action) |

### 1.3 Forbidden Transitions

| From | To | Reason |
|------|-----|--------|
| `STOPPED` | `RUNNING` | Must go through `STARTING` |
| `RUNNING` | `STARTING` | Cannot regress without stop |
| `CRASHED` | `RUNNING` | No automatic recovery exists |

### 1.4 State Detection Limitations

| State | Detection Method | Reliability |
|-------|------------------|-------------|
| `STOPPED` | `pgrep uvicorn` returns empty | HIGH |
| `STARTING` | PID exists, health fails | MEDIUM |
| `RUNNING` | Health returns 200 | **LOW** (does not verify DB/AI) |
| `CRASHED` | PID stale, process absent | MEDIUM |
| `STOPPING` | SIGTERM sent, waiting | LOW (transient) |

---

## 2. HEALTH STATUS (OBSERVABLE, NOT CONTROLLED)

### 2.1 Health Endpoint Behavior

| Endpoint | Returns | What It Verifies | What It DOES NOT Verify |
|----------|---------|------------------|-------------------------|
| `/health` | `{"status": "healthy", ...}` | Process is alive | Database, AI, Webhook |
| `/health/db` | DB status | Database connection | (if implemented) |
| `/health/ai` | AI status | Anthropic API | (if implemented) |
| `/health/webhook` | Webhook status | Webhook config | (if implemented) |

### 2.2 Health Status States

| Status | Meaning | How Determined |
|--------|---------|----------------|
| `healthy` | Everything working | HTTP 200 (BLIND) |
| `degraded` | Some issues | **NOT IMPLEMENTED** |
| `unhealthy` | Critical failure | HTTP 500 or connection refused |
| `unknown` | Cannot determine | Network timeout |

### 2.3 Gap: Health Does Not Reflect Reality

| Scenario | Actual State | Health Reports | Gap |
|----------|--------------|----------------|-----|
| DB corrupt | UNHEALTHY | `healthy` | **CRITICAL** |
| AI API down | DEGRADED | `healthy` | **HIGH** |
| Process running, DB locked | UNUSABLE | `healthy` | **CRITICAL** |

---

## 3. APPLICATION ROUTES (REQUEST/RESPONSE FLOWS)

### 3.1 API Routes

| Route | Method | Purpose | State Required |
|-------|--------|---------|----------------|
| `/api/v1/instruments` | GET | List instruments | `RUNNING` |
| `/api/v1/silos` | GET | List silos | `RUNNING` |
| `/api/v1/charts` | GET | List charts | `RUNNING` |
| `/api/v1/signals/{chart_id}/latest` | GET | Get latest signal | `RUNNING` |
| `/api/v1/webhook` | POST | Receive TradingView alert | `RUNNING` |
| `/api/v1/ai/models` | GET | List Claude models | `RUNNING` |
| `/api/v1/chat/{scrip_id}` | POST | Send chat message | `RUNNING` |
| `/api/v1/narratives/silo/{silo_id}` | POST | Generate AI narrative | `RUNNING` |
| `/health` | GET | Health check | ANY (but misleading) |

### 3.2 Request Flow State Machine

```
[Request] → [Rate Limiter] → [Route Handler] → [Service] → [DAL] → [DB] → [Response]
                ↓                  ↓              ↓           ↓
           [429 Reject]      [Exception]    [AI Call]    [SQLite]
                                  ↓              ↓
                             [Error Handler] [Claude API]
                                  ↓              ↓
                             [HTTP 4xx/5xx] [Retry + Validate]
```

---

## 4. AI NARRATIVE GENERATION FLOW

### 4.1 Constitutional Validation State Machine

| State | Description | Next State Trigger |
|-------|-------------|-------------------|
| `GENERATING` | Claude API call in progress | Response received |
| `VALIDATING` | Regex validation running | Patterns checked |
| `VALID` | All checks passed | Return narrative |
| `INVALID` | Pattern violation detected | Retry or fail |
| `RETRYING` | Retry with stricter prompt | Max 3 retries |
| `FALLBACK` | All retries failed | Return fallback |
| `FAILED` | Unrecoverable error | Raise exception |

### 4.2 Validation Transitions

| From | Condition | To | Action |
|------|-----------|-----|--------|
| `GENERATING` | Response OK | `VALIDATING` | Run regex checks |
| `GENERATING` | API Error | `RETRYING` or `FALLBACK` | Retry or give up |
| `VALIDATING` | All patterns pass | `VALID` | Return narrative |
| `VALIDATING` | Pattern fails | `INVALID` | Log violation |
| `INVALID` | Retries < 3 | `RETRYING` | Reduce temp, add constraints |
| `INVALID` | Retries >= 3 | `FALLBACK` | Use non-AI narrative |
| `RETRYING` | New response | `VALIDATING` | Re-validate |
| `FALLBACK` | Always | Return | Static narrative |

### 4.3 Constitutional Enforcement Points

| Layer | Mechanism | Catches | Evidence |
|-------|-----------|---------|----------|
| Prompt | System prompt prohibition | Obvious violations | prompt_builder.py |
| Regex | 27+ forbidden patterns | Explicit violations | response_validator.py |
| Retry | Temperature reduction | Edge cases | response_validator.py |
| Fallback | Static narrative | All failures | narrative_generator.py |

---

## 5. SIGNAL FRESHNESS STATE MACHINE

### 5.1 Freshness Statuses

| Status | Age | Meaning |
|--------|-----|---------|
| `CURRENT` | < 5 minutes | Fresh signal |
| `RECENT` | 5-60 minutes | Slightly stale |
| `STALE` | > 60 minutes | Old data |
| `UNAVAILABLE` | Retrieval failed | Cannot determine |

### 5.2 Key Design Decision

**STALE data IS still returned. UNAVAILABLE indicates retrieval failure only.**

This is intentional: absence of fresh data ≠ absence of data.

---

## 6. DATABASE STATE

### 6.1 Entity States

| Entity | States | Transitions |
|--------|--------|-------------|
| Chart | Exists / Not Exists | Created via migration, cannot delete |
| Signal | Active / Stale | Created via webhook, ages over time |
| Silo | Exists / Not Exists | Created via migration |
| Instrument | Exists / Not Exists | Created via migration |
| AIUsage | Created | Budget tracking, accumulates |

### 6.2 No Explicit State Column

**There is no `status` or `state` column on any entity.**

All state is inferred from:
- Existence (record present or absent)
- Timestamps (age calculation)
- Computed properties (freshness)

---

## 7. FORBIDDEN BEHAVIORS (BY DESIGN)

| Behavior | Why Forbidden | Evidence |
|----------|---------------|----------|
| AI aggregation | Constitutional violation | CR-001 |
| AI recommendations | Constitutional violation | CR-001 |
| AI contradiction resolution | Constitutional violation | CR-002 |
| Weight/confidence/score columns | Removed by design | Database schema |
| Signal combination | Constitutional violation | CR-001 |

---

## 8. GAPS IN STATE MACHINE DESIGN

| Gap ID | Description | Severity | Impact |
|--------|-------------|----------|--------|
| STAT-GAP-001 | No explicit state machine exists | CRITICAL | State is emergent, not controlled |
| STAT-GAP-002 | Health endpoint does not verify subsystems | HIGH | False "healthy" status |
| STAT-GAP-003 | No crash recovery mechanism | HIGH | Manual restart required |
| STAT-GAP-004 | Orphan processes not auto-killed | MEDIUM | Manual cleanup needed |
| STAT-GAP-005 | No state persistence across restarts | MEDIUM | Rate limits lost |

---

## ATTESTATION

This State Transition Authority Table represents a forensic reconstruction of CIA-SIE-PURE's state behavior based on available documentation.

| Property | Status | Notes |
|----------|--------|-------|
| Explicit state machine exists | ❌ NO | State is emergent |
| All states inferred | ✅ YES | From process lifecycle |
| Forbidden transitions identified | ✅ YES | — |
| Gaps documented | ✅ YES | 5 critical gaps |
| Evidence from code | ⚠️ PARTIAL | Based on reconstitution doc |

---

**END OF CIA-SIE-PURE STATE TRANSITION AUTHORITY TABLE**
