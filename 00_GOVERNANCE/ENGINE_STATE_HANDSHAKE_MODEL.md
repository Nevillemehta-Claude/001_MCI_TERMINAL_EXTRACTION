# SILO 3: Engine State Handshake Model
## Observable State Relationship Without Lifecycle Coupling

**Document ID:** SILO-3-HANDSHAKE-001  
**Date:** 2026-01-29  
**Classification:** MODEL ONLY — NO IMPLEMENTATION AUTHORIZED  
**Execution Status:** 🔒 DOCUMENTATION ONLY

---

## Governing Constraints

| Constraint | Status |
|------------|--------|
| Start/stop commands | ❌ PROHIBITED |
| Lifecycle authority transfer | ❌ PROHIBITED |
| Runtime coupling | ❌ PROHIBITED |
| Code changes | ❌ PROHIBITED |

---

## 1. FOUNDATIONAL PRINCIPLE

### MCI-to-CIA-SIE-PURE Relationship

```
MCI (COCKPIT)         ↔         CIA-SIE-PURE (ENGINE)
───────────────────────────────────────────────────────
OBSERVES                        OPERATES INDEPENDENTLY
DISPLAYS                        EXECUTES
DOES NOT CONTROL                SELF-GOVERNED
```

**Axiom:** MCI SHALL observe CIA-SIE-PURE state. MCI SHALL NOT govern CIA-SIE-PURE lifecycle.

---

## 2. STATE OBSERVATION MODEL

### Observable States (DETECT-ONLY)

| State | Observation Method | MCI Responsibility |
|-------|-------------------|-------------------|
| RUNNING | Health check responds HTTP 200 | Display: ENGINE: CONNECTED |
| STOPPED | Health check fails (connection refused) | Display: ENGINE: DISCONNECTED |
| DEGRADED | Health check responds but subsystems fail | Display: ENGINE: DEGRADED |
| UNKNOWN | No health check performed yet | Display: ENGINE: UNKNOWN |

### Observable Substates (DETECT-ONLY)

| Substate | Probe Endpoint | MCI Responsibility |
|----------|---------------|-------------------|
| Process healthy | `GET /health` | Track availability |
| Database healthy | `GET /health/db` | Track feature availability |
| AI healthy | `GET /health/ai` | Track narrative availability |
| Webhook healthy | `GET /health/webhook` | Track signal ingestion |

---

## 3. ALLOWED SIGNALS (OBSERVE-ONLY)

### Health Signals

| Signal | Source | Direction | MCI Action |
|--------|--------|-----------|------------|
| `health_check_success` | HTTP 200 from `/health` | PURE → MCI | Update status to CONNECTED |
| `health_check_failure` | HTTP error or timeout | PURE → MCI | Update status to DISCONNECTED |
| `subsystem_degraded` | Subsystem probe failure | PURE → MCI | Update specific feature availability |
| `latency_measured` | Health check response time | PURE → MCI | Track and display latency |

### Data Signals (Future — NOT YET AUTHORIZED)

| Signal | Source | Direction | MCI Action |
|--------|--------|-----------|------------|
| `signal_received` | Signal data from `/api/v1/signals` | PURE → MCI | Display in cockpit |
| `narrative_received` | Narrative from `/api/v1/narrative` | PURE → MCI | Display in cockpit |
| `contradiction_detected` | Contradiction data | PURE → MCI | Display in cockpit (CR-002) |

---

## 4. FORBIDDEN SIGNALS (NO CONTROL)

### Lifecycle Control Signals

| Signal | Reason Forbidden | MCI Alternative |
|--------|------------------|-----------------|
| `start_engine` | MCI has no lifecycle authority | Display: "Engine must be started externally" |
| `stop_engine` | MCI has no lifecycle authority | Display: "Engine must be stopped externally" |
| `restart_engine` | MCI has no restart authority | Display: "Engine restart requires external action" |
| `pause_engine` | MCI has no pause authority | NONE — Display observation only |
| `resume_engine` | MCI has no resume authority | NONE — Display observation only |

### State Mutation Signals

| Signal | Reason Forbidden | MCI Alternative |
|--------|------------------|-----------------|
| `set_strategy` | MCI has no configuration authority | Display current strategy (read-only) |
| `modify_webhook` | MCI has no webhook authority | Display webhook status (read-only) |
| `adjust_budget` | MCI has no AI budget authority | Display budget status (read-only) |
| `clear_signals` | MCI has no data authority | NONE |

---

## 5. STARTUP SEMANTICS

### CIA-SIE-PURE Startup (External)

```
[External Trigger: systemd/Docker/K8s/Manual]
           │
           ▼
    ┌─────────────────┐
    │  STARTING       │ ← MCI cannot observe this phase
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  /health check  │ ← First observable point
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  RUNNING        │ ← MCI observes: ENGINE: CONNECTED
    └─────────────────┘
```

### MCI Observation During Startup

| Phase | MCI Observability | MCI Action |
|-------|-------------------|------------|
| Process not started | Cannot observe | Display: ENGINE: UNKNOWN |
| Process starting | Cannot observe | Display: ENGINE: UNKNOWN (polling continues) |
| Health check responding | Observable | Display: ENGINE: CONNECTED |

### MCI Startup Behavior

```
[MCI Startup]
      │
      ▼
[Initialize Health Polling]
      │
      ▼
[First Health Check]
      │
      ├─── Success ──► ENGINE: CONNECTED
      │
      └─── Failure ──► ENGINE: DISCONNECTED
                       (Continue polling)
```

---

## 6. RESTART SEMANTICS

### CIA-SIE-PURE Restart (External)

```
[RUNNING] ──► [SIGTERM] ──► [STOPPING] ──► [STOPPED] ──► [STARTING] ──► [RUNNING]
                             (brief)       (brief)       (brief)
```

### MCI Observation During Restart

| Phase | MCI Observability | MCI Display |
|-------|-------------------|-------------|
| RUNNING → SIGTERM | Still appears CONNECTED | ENGINE: CONNECTED |
| STOPPING | Health check may fail | ENGINE: DISCONNECTED |
| STOPPED | Health check fails | ENGINE: DISCONNECTED |
| STARTING | Health check fails | ENGINE: DISCONNECTED |
| RUNNING (again) | Health check succeeds | ENGINE: CONNECTED |

### MCI Behavior During Restart

| Observation | MCI Action |
|-------------|------------|
| Health check starts failing | Increment consecutive failure counter |
| After 3 failures | Display: ENGINE: DISCONNECTED |
| Health check succeeds again | Reset failure counter, display: ENGINE: CONNECTED |
| Log | "Engine recovered after N failures" |

**Non-Action:** MCI does NOT attempt to restart CIA-SIE-PURE.

---

## 7. CRASH SEMANTICS

### CIA-SIE-PURE Crash (Unhandled)

```
[RUNNING] ──► [UNHANDLED EXCEPTION] ──► [CRASH] ──► [STOPPED]
                                                      │
                                                      ▼
                                              [External Recovery]
                                              (systemd/Docker/K8s)
```

### MCI Observation During Crash

| Observation | MCI Action |
|-------------|------------|
| Health check fails abruptly | Increment failure counter |
| Consecutive failures ≥ 3 | Display: ENGINE: DISCONNECTED |
| Failure persists | Continue polling at configured interval |
| External supervisor restarts | Health check succeeds → ENGINE: CONNECTED |

### MCI Non-Actions During Crash

| Non-Action | Reason |
|------------|--------|
| ❌ Do NOT restart CIA-SIE-PURE | No lifecycle authority |
| ❌ Do NOT alert external supervisor | Out of scope |
| ❌ Do NOT assume data is lost | May have persisted to DB |
| ❌ Do NOT assume recovery will occur | External responsibility |

### MCI Display During Crash

```
┌─────────────────────────────────────────────────────────┐
│  ENGINE: DISCONNECTED                                   │
│  ────────────────────                                   │
│  Status: CIA-SIE-PURE is not responding                │
│  Last seen: 2026-01-29 12:34:56 (5 min ago)           │
│  Consecutive failures: 15                               │
│                                                         │
│  [ℹ] MCI does not control engine lifecycle.            │
│  [ℹ] Engine restart requires external action.          │
└─────────────────────────────────────────────────────────┘
```

---

## 8. EXPLICIT NON-ASSUMPTIONS

### Process State Non-Assumptions

| Non-Assumption | Statement |
|----------------|-----------|
| CIA-SIE-PURE is running | MCI does NOT assume CIA-SIE-PURE is running at any time |
| Health = fully functional | MCI does NOT assume HTTP 200 means all features work |
| Crash is temporary | MCI does NOT assume CIA-SIE-PURE will automatically recover |
| Restart is instant | MCI does NOT assume restarts complete within any timeframe |

### Lifecycle Non-Assumptions

| Non-Assumption | Statement |
|----------------|-----------|
| MCI can start engine | MCI CANNOT start CIA-SIE-PURE under any circumstance |
| MCI can stop engine | MCI CANNOT stop CIA-SIE-PURE under any circumstance |
| MCI can restart engine | MCI CANNOT restart CIA-SIE-PURE under any circumstance |
| MCI can pause/resume | MCI CANNOT pause or resume CIA-SIE-PURE |

### Data Non-Assumptions

| Non-Assumption | Statement |
|----------------|-----------|
| Data persists across restart | MCI does NOT assume in-flight data survived crash |
| State is consistent | MCI does NOT assume CIA-SIE-PURE state is consistent |
| Cache is warm | MCI does NOT assume CIA-SIE-PURE caches are populated after restart |

---

## 9. HANDSHAKE PROTOCOL

### Initial Handshake (MCI Startup)

```
Step 1: MCI starts health polling
Step 2: MCI sends GET /health to CIA-SIE-PURE
Step 3: Response determines initial state:
        - 200 OK → ENGINE: CONNECTED
        - Connection refused → ENGINE: DISCONNECTED
        - Timeout → ENGINE: DISCONNECTED
Step 4: MCI displays truthful state in cockpit
```

### Continuous Handshake (Steady State)

```
Every 10 seconds (configurable):
  Step 1: MCI sends GET /health
  Step 2: MCI records latency and result
  Step 3: MCI updates cockpit display
  Step 4: If status changed, log transition
```

### Recovery Handshake (After Disconnect)

```
While DISCONNECTED:
  Step 1: Continue polling at configured interval
  Step 2: On first successful response:
          - Reset failure counter
          - Update status to CONNECTED
          - Log: "Engine connection restored"
  Step 3: Resume normal operation
```

---

## 10. STATE TRANSITION TABLE

### MCI-Observed State Transitions

| From State | To State | Trigger | MCI Action |
|------------|----------|---------|------------|
| UNKNOWN | CONNECTED | First successful health check | Display connected, log |
| UNKNOWN | DISCONNECTED | First failed health check (3x) | Display disconnected, log |
| CONNECTED | DISCONNECTED | 3 consecutive health check failures | Display disconnected, log |
| CONNECTED | DEGRADED | Subsystem probe failure | Display degraded, log |
| DISCONNECTED | CONNECTED | Successful health check | Display connected, log recovery |
| DEGRADED | CONNECTED | All subsystem probes succeed | Display connected, log |
| DEGRADED | DISCONNECTED | Process health check fails | Display disconnected, log |

---

## 11. COCKPIT DISPLAY REQUIREMENTS

### Engine Status Indicator

| State | Visual | Text | Tooltip |
|-------|--------|------|---------|
| CONNECTED | 🟢 | ENGINE: CONNECTED | "CIA-SIE-PURE is reachable. Latency: Xms" |
| DEGRADED | 🟡 | ENGINE: DEGRADED | "CIA-SIE-PURE is partially available. [details]" |
| DISCONNECTED | 🔴 | ENGINE: DISCONNECTED | "CIA-SIE-PURE is not responding. Last seen: [time]" |
| UNKNOWN | ⚪ | ENGINE: UNKNOWN | "Checking CIA-SIE-PURE status..." |

### Information Disclosure

| Information | Disclosed to User | Reason |
|-------------|-------------------|--------|
| Connection status | ✅ YES | User needs to know system state |
| Latency | ✅ YES | Performance visibility |
| Last seen time | ✅ YES | Truthful reporting |
| Consecutive failures | ⚠️ OPTIONAL | May cause anxiety |
| Internal error details | ❌ NO | Operator-only information |
| Restart instructions | ❌ NO | User cannot act on this |

---

## 12. BOUNDARY ENFORCEMENT

### MCI Shall

| Responsibility | Implementation |
|----------------|----------------|
| Poll health at configured interval | Health check manager |
| Display truthful connection status | EngineStatusIndicator |
| Log state transitions | Standard logging |
| Track consecutive failures | Health store |
| Calculate and display latency | Health hook |

### MCI Shall NOT

| Prohibition | Enforcement |
|-------------|-------------|
| Send start commands | No endpoint exists in MCI |
| Send stop commands | No endpoint exists in MCI |
| Send configuration commands | No endpoint exists in MCI |
| Attempt automatic recovery | No recovery logic exists |
| Assume any default state | Initial state is UNKNOWN |

---

## ATTESTATION

This Engine State Handshake Model was prepared under the Multi-Silo Execution Directive dated 2026-01-29.

**Compliance Verification:**

| Prohibition | Status |
|-------------|--------|
| ❌ No start/stop commands | ✅ COMPLIANT |
| ❌ No lifecycle authority transfer | ✅ COMPLIANT |
| ❌ No runtime coupling | ✅ COMPLIANT |
| ❌ No code changes | ✅ COMPLIANT |

**Model Summary:**

> This handshake model defines a strict OBSERVE-ONLY relationship between MCI and CIA-SIE-PURE. MCI monitors engine health through periodic polling of the `/health` endpoint. All lifecycle operations (start, stop, restart) are explicitly prohibited and delegated to external supervision (systemd/Docker/K8s). The model includes explicit non-assumptions to prevent hidden coupling and ensures truthful cockpit display at all times.

---

*End of Engine State Handshake Model*
