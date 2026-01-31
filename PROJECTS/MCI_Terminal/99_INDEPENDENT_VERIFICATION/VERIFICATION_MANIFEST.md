# VERIFICATION MANIFEST
## Single Source of Truth for Independent Verification

**Document Authority:** Program Director
**Version:** 1.0.0
**Date:** 2026-01-28
**Status:** CANONICAL — No interpretation permitted

---

## PREAMBLE

This document is the **single source of truth** for all external verification environments.

External systems are instructed to **verify, not interpret**.

No environment may infer intent. All behavior must be explicitly defined herein.

---

## SECTION 1: SYSTEM IDENTITY

### 1.1 What MCI Is

**MCI (Mission Control Interface)** is a browser-based control cockpit for managing the lifecycle of automated trading system connections to Indian stock market brokers.

| Attribute | Value |
|-----------|-------|
| System Name | MCI (Mission Control Interface) |
| Purpose | Lifecycle management for CIA-SIE-PURE trading system |
| Deployment Model | Web application (Vite + React frontend, Hono backend) |
| Target Market | India only (NSE, BSE) |
| Supported Broker | Kite Connect (Zerodha) — primary |
| Additional Brokers | ICICI Direct, HDFC Sky, Kotak Neo (placeholders) |

### 1.2 What MCI Does

1. **Captures** Kite API credentials from the operator
2. **Validates** credentials against Kite Connect API
3. **Scans** 12 pre-ignition health checks
4. **Ignites** connection to backend trading systems
5. **Displays** real-time telemetry during operation
6. **Shuts down** gracefully or via emergency stop

### 1.3 What MCI Is NOT

| Non-Scope | Rationale |
|-----------|-----------|
| Trading execution engine | That is CIA-SIE-PURE |
| Order management system | That is CIA-SIE-PURE |
| Risk management system | That is CIA-SIE-PURE |
| Multi-market system | India only |
| Multi-broker (non-Kite) | Only Kite is implemented |

---

## SECTION 2: PHASE LIFECYCLE

MCI operates through a **strict 5-phase lifecycle**. Phase transitions are deterministic and controlled exclusively by `App.tsx`.

### 2.1 Phase Definitions

| Phase | ID | Description | Entry Condition | Exit Condition |
|-------|-----|-------------|-----------------|----------------|
| **Token Capture** | `token` | Credential entry and validation | Application start | Valid credentials stored |
| **Pre-Ignition Scan** | `scan` | 12-point system health check | Credentials validated | All checks pass |
| **Ignition** | `ignition` | Backend connection sequence | Scan complete | Connection established |
| **Running** | `running` | Active operation with telemetry | Ignition success | Shutdown initiated |
| **Shutdown** | `shutdown` | 6-step graceful termination | User action or error | System at rest |

### 2.2 Legal Phase Transitions

```
token ──────► scan ──────► ignition ──────► running ──────► shutdown
  ▲                                                             │
  └─────────────────────────────────────────────────────────────┘
                         (restart path)
```

**Illegal transitions are forbidden.** Any transition not shown above is a FAIL condition.

### 2.3 Phase Authority

| Component | Authority |
|-----------|-----------|
| `App.tsx` | SOLE authority for phase rendering |
| Child components | MUST NOT contain phase guards |
| Stores | Provide state, do not control phase |

---

## SECTION 3: CONSTITUTIONAL REQUIREMENTS

These are **non-negotiable** behavioral contracts.

### CR-001: Token Validity

- Tokens MUST be validated before any operation
- Invalid tokens MUST block progression
- Validation failure MUST display WHAT/WHY/HOW error

### CR-002: Graceful Shutdown (6-Step Sequence)

| Step | Action | Must Complete |
|------|--------|---------------|
| 1 | Cancel pending orders | Yes |
| 2 | Flatten positions | Yes |
| 3 | Close WebSocket | Yes |
| 4 | Notify backend | Yes |
| 5 | Save state | Yes |
| 6 | Clear session | Yes |

- Emergency shutdown MAY skip steps 1-2
- Steps 3-6 are ALWAYS required

### CR-003: Error Format (WHAT/WHY/HOW)

All user-visible errors MUST contain:

| Field | Description | Required |
|-------|-------------|----------|
| WHAT | What failed | Yes |
| WHY | Why it failed | Yes |
| HOW | How to resolve | Yes |

### CR-004: Token Expiry (6:00 AM IST)

- All Kite tokens expire at **6:00 AM IST daily**
- This maps to **00:30 UTC**
- Token timer MUST be visible during operation
- Expired tokens MUST force re-authentication

### CR-005: UXMI 7-State Micro-Interactions

All interactive components MUST support:

| State | Description |
|-------|-------------|
| IDLE | Default state |
| HOVER | Mouse over |
| ACTIVE | Being pressed |
| FOCUS | Keyboard focus |
| DISABLED | Not available |
| LOADING | Async operation |
| ERROR | Invalid state |

---

## SECTION 4: SYSTEM INVARIANTS

Invariants are **absolute truths** that MUST hold at all times.

### INV-001: Daily Credential Continuity

- Credentials persist in `localStorage`
- Credentials are cleared at 6:00 AM IST
- Rehydration uses full sanitization (INV-006)
- Corrupted storage is cleared, not used

### INV-002: System Lifecycle Discipline

- `start.sh` is the ONLY authorized launch mechanism
- `stop.sh` is the ONLY authorized termination mechanism
- Both processes (frontend + backend) are managed together
- PID files provide process tracking

### INV-006: Input Sanitization & Boundary Cleanliness

- ALL string inputs are trimmed at entry
- Control characters are rejected
- Protocol-unsafe characters are rejected
- Alphanumeric-only validation for credentials
- Centralized via `sanitize.ts`

**Sanitization Points:**
1. UI entry (form submission)
2. API boundary (route handlers)
3. Header construction (Authorization header)
4. Storage rehydration (localStorage)

---

## SECTION 5: CORRECT BEHAVIOR

Verification MUST confirm these behaviors exist:

### 5.1 Token Capture Phase

| Behavior | Expected |
|----------|----------|
| Empty credentials submitted | Error displayed, progression blocked |
| Whitespace-only credentials | Rejected at entry |
| Invalid characters in credentials | Rejected with specific error |
| Valid credentials | Validated with Kite API, progression allowed |
| API validation failure | Error displayed with WHAT/WHY/HOW |

### 5.2 Pre-Ignition Scan Phase

| Behavior | Expected |
|----------|----------|
| 12 checks executed | All results displayed |
| Any check fails | Progression blocked |
| All checks pass | Ignition button enabled |
| Backend unreachable | Check fails with appropriate message |

### 5.3 Ignition Phase

| Behavior | Expected |
|----------|----------|
| ARM button clicked | Two-stage safety engaged |
| IGNITE clicked after ARM | Backend connection initiated |
| Connection success | Transition to running phase |
| Connection failure | Error displayed, retry available |

### 5.4 Running Phase

| Behavior | Expected |
|----------|----------|
| Dashboard displays | Telemetry panels visible |
| Token timer visible | Countdown to 6:00 AM IST |
| Backend health visible | API OK / API Error indicator |
| Shutdown button available | Graceful and Emergency options |

### 5.5 Shutdown Phase

| Behavior | Expected |
|----------|----------|
| Graceful shutdown | 6-step sequence executed |
| Emergency shutdown | Immediate halt (steps 3-6 only) |
| All steps complete | Return to token phase |
| Step failure | Error displayed, retry available |

---

## SECTION 6: INCORRECT BEHAVIOR (MUST FAIL)

Verification MUST confirm these behaviors DO NOT occur:

| Incorrect Behavior | Why It's Wrong |
|--------------------|----------------|
| Credentials with control characters accepted | INV-006 violation |
| Phase transition without required state | INV-004 violation |
| Error without WHAT/WHY/HOW | CR-003 violation |
| Operation after token expiry | CR-004 violation |
| Shutdown without completing required steps | CR-002 violation |
| Child component controlling phase | Architecture violation |
| Unsanitized credential in header | Security violation |

---

## SECTION 7: UNDEFINED BEHAVIOR (MUST REJECT)

Any behavior not explicitly defined in this manifest is **undefined** and MUST be treated as a **FAIL** condition.

| Category | Examples |
|----------|----------|
| Unrecognized phase | Anything other than: token, scan, ignition, running, shutdown |
| Unrecognized broker | Any broker not in: zerodha, icici, hdfc, kotak |
| Unrecognized scan check | Any check ID not in the 12-point registry |
| Inferred intent | Any assumption not explicitly stated here |

---

## SECTION 8: PASS / FAIL CRITERIA

### 8.1 PASS Criteria

Verification PASSES if and only if:

1. ✅ All 658 automated tests pass
2. ✅ All 5 Constitutional Requirements are satisfied
3. ✅ All 6 System Invariants hold
4. ✅ All correct behaviors are observed
5. ✅ No incorrect behaviors are observed
6. ✅ No undefined behaviors are accepted
7. ✅ Results converge across all verification environments

### 8.2 FAIL Criteria

Verification FAILS if any of:

1. ❌ Any test fails
2. ❌ Any Constitutional Requirement is violated
3. ❌ Any System Invariant is broken
4. ❌ Any incorrect behavior is observed
5. ❌ Any undefined behavior is accepted
6. ❌ Results diverge between environments
7. ❌ Any environment cannot execute the verification

---

## SECTION 9: VERIFICATION INSTRUCTION TO EXTERNAL SYSTEMS

**To all external verification environments:**

You are instructed to:

1. **Read** this manifest in its entirety
2. **Execute** the provided verification scripts
3. **Compare** results against COMMON/expected_outputs.json
4. **Report** PASS or FAIL with evidence
5. **Do NOT infer** intent beyond this manifest
6. **Do NOT interpret** ambiguous conditions — report them as UNDEFINED

**Ambiguity Resolution:**
If any condition is unclear, the verification MUST FAIL and document the ambiguity.

---

## SECTION 10: DOCUMENT GOVERNANCE

| Attribute | Value |
|-----------|-------|
| Owner | Program Director |
| Modification Authority | Program Director only |
| Version Control | This document is versioned |
| Change Impact | Any change requires full re-verification |

---

**END OF VERIFICATION MANIFEST**
