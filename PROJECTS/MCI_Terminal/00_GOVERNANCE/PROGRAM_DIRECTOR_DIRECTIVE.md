# PROGRAM DIRECTOR DIRECTIVE
## System-Wide Integrity, Determinism, and Operational Discipline Mandate

**Authority:** Program Director
**Status:** OPERATING LAW — BINDING
**Version:** 1.1
**Date:** 2026-01-28
**Classification:** GOVERNANCE - SUPREME

---

## PREAMBLE

This directive institutionalizes system-wide correctness, determinism, and operational integrity across the entire MCI application lifecycle. It is binding across:

- Source code
- Architecture diagrams
- Flowcharts and state machines
- Governance and constraints
- Development, testing, and review procedures

This directive ensures the application behaves with **rocket-science precision**, not merely functional adequacy.

---

## I. NON-NEGOTIABLE SYSTEM PRINCIPLE

> **The application shall behave as one coherent, deterministic system, not as a collection of loosely coupled tools, processes, documents, or developer assumptions.**

### Prohibited Behaviors

No part of the system may:

| Prohibition | Meaning |
|-------------|---------|
| Depend on hidden state | All state must be explicitly documented and verifiable |
| Rely on "warm" environments | Behavior must be identical on cold start |
| Assume human memory or tribal knowledge | Everything must be documented |
| Exhibit non-reproducible behavior | Every run must produce the same result given the same inputs |
| Behave differently based on context | Who runs it, when, or what was previously running is irrelevant |

---

## II. GLOBAL INVARIANTS

The following invariants are globally binding and must be reflected uniformly across all system layers.

### Mapping to Implementation

| Directive Invariant | MCI Implementation | Document Reference |
|---------------------|-------------------|-------------------|
| INV-A | INV-002: System Lifecycle Discipline | CONSTITUTIONAL_CONSTRAINTS.md |
| INV-B | INV-002 + INV-001 | CONSTITUTIONAL_CONSTRAINTS.md |
| INV-C | INV-003: Time & Clock Authority | This document |
| INV-D | INV-004: State Legality & Transition Control | This document |
| INV-E | INV-005: Failure Visibility & Recoverability | This document |
| INV-F | INV-002: Tooling Subordination | CONSTITUTIONAL_CONSTRAINTS.md |
| INV-G | INV-006: Input Sanitization & Boundary Cleanliness | CONSTITUTIONAL_CONSTRAINTS.md |

---

## INV-A: DETERMINISTIC LAUNCH & SHUTDOWN

**Implementation:** INV-002 (System Lifecycle Discipline)

### Requirements

| Requirement | Implementation |
|-------------|----------------|
| One authoritative startup path | `bun run start` / `./scripts/start.sh` |
| Launch implies all processes running | Backend + Frontend started with health checks |
| Shutdown implies all processes terminated | All PIDs killed, ports released |
| No orphaned processes | Forensic cleanup on launch, verification on shutdown |

### Cause → Effect Control

| If... | Then... | Status |
|-------|---------|--------|
| Startup is ambiguous | Behavior is non-deterministic | **UNACCEPTABLE** |
| Shutdown is incomplete | Stale state leaks | **UNACCEPTABLE** |

**Verification:** `bun run status` after any lifecycle operation

---

## INV-B: COLD-START EQUIVALENCE

**Implementation:** INV-002 + INV-001

### Requirements

| Requirement | Implementation |
|-------------|----------------|
| Every launch equivalent to cold start | Forensic cleanup executes first |
| Only documented persistence survives | INV-001 daily credentials only |
| All other state recreated | Stores initialize fresh |

### Forward Risks Prevented

| Risk | Prevention |
|------|------------|
| "Works on my machine" | Deterministic environment via scripts |
| Heisenbugs | No hidden state dependencies |
| Irreproducible failures | Same inputs → same outputs |

**Verification:** `bun run stop && bun run start` produces identical behavior

---

## INV-C: TIME & CLOCK AUTHORITY

**Status:** SYSTEM INVARIANT | REQUIRES PRINCIPAL APPROVAL TO MODIFY

### Definition

All time-dependent behavior derives from a single authoritative model. Expiry, rollover, and validity boundaries are explicit and documented. Manual clock changes, timezone drift, and restart scenarios do not produce undefined behavior.

### Technical Details

| Aspect | Authority |
|--------|-----------|
| **Expiry Time** | 6:00 AM IST (00:30 UTC) — CR-004 |
| **Timezone** | All calculations use UTC internally, display in IST |
| **Clock Source** | `Date.now()` — system clock |
| **Expiry Calculation** | `calculateNextExpiry()` in tokenStore.ts |

### Behavioral Guarantees

| Scenario | Behavior |
|----------|----------|
| Clock moves forward past expiry | Credentials cleared immediately |
| Clock moves backward before expiry | Session continues (no phantom expiry) |
| Timezone change | Expiry calculated in UTC, unaffected |
| System restart at 5:59 AM IST | Session continues for 1 minute |
| System restart at 6:01 AM IST | Forced re-authentication |

### Backward Risks Prevented

| Risk | Prevention |
|------|------------|
| Retroactive invalidation | Forward-only expiry check |
| Phantom expiry | UTC-based calculation |
| Silent acceptance of invalid state | Explicit validation on rehydration |

### Implementation Requirements

1. All time comparisons use UTC timestamps
2. `tokenExpiresAt` stored as Unix timestamp (ms)
3. `isTokenExpired()` is the single source of truth for validity
4. No time-based operations without explicit expiry check
5. Clock skew handling: treat future timestamps as suspicious but valid

### Verification

```typescript
// Single source of truth
const isExpired = Date.now() >= tokenExpiresAt;
```

---

## INV-D: STATE LEGALITY & TRANSITION CONTROL

**Status:** SYSTEM INVARIANT | REQUIRES PRINCIPAL APPROVAL TO MODIFY

### Definition

All application phases have defined entry conditions, exit conditions, and explicitly forbidden transitions. Illegal states are unrepresentable or immediately rejected.

### Phase Transition Matrix

| From Phase | To Phase | Condition | Allowed |
|------------|----------|-----------|---------|
| Token (0) | Scan (1) | Token valid, API validated | ✅ |
| Scan (1) | Ignition (2) | All 12 checks passed | ✅ |
| Scan (1) | Token (0) | Any check failed (user choice) | ✅ |
| Ignition (2) | Running (3) | Ignition sequence complete | ✅ |
| Ignition (2) | Scan (1) | Back navigation | ✅ |
| Running (3) | Shutdown (4) | User initiates shutdown | ✅ |
| Running (3) | Token (0) | Token expired (CR-004) | ✅ |
| Shutdown (4) | Token (0) | 6-step sequence complete | ✅ |
| Any | Any (skip) | Direct navigation bypassing gates | ❌ **FORBIDDEN** |

### Illegal State Prevention

| Illegal State | Prevention Mechanism |
|---------------|---------------------|
| Running without valid token | CR-001 validation on every API call |
| Ignition without passed scan | `canProceed` gate in scannerStore |
| Shutdown without running | Phase guard in App.tsx |
| Token capture while running | Phase guard prevents backward skip |

### Interruption Handling

| Interruption | Resolution |
|--------------|------------|
| Browser refresh | Rehydrate to last valid phase (via stores) |
| Browser close/reopen | INV-001 restores credentials, phase resets to Token |
| Network failure | Error displayed (CR-003), retry available |
| Partial execution | Transaction-like: complete or rollback |

### Implementation Requirements

1. Phase transitions MUST go through `setCurrentPhase()` in App.tsx
2. Each phase component MUST verify entry conditions on mount
3. Navigation guards MUST prevent illegal transitions
4. Error states MUST be recoverable (back to last valid state)

### Verification

```typescript
// Phase guard example
if (currentPhase === 'running' && !isTokenValid) {
  setCurrentPhase('token'); // CR-004 enforcement
}
```

---

## INV-E: FAILURE VISIBILITY & RECOVERABILITY

**Status:** SYSTEM INVARIANT | REQUIRES PRINCIPAL APPROVAL TO MODIFY

### Definition

No failure may be silent. Every failure must produce a visible signal, a deterministic outcome, and a known recovery path.

### Requirements

| Requirement | Implementation |
|-------------|----------------|
| Visible signal | Toast notification + ErrorDisplay component |
| Deterministic outcome | Defined error state, not undefined behavior |
| Known recovery path | HOW field in CR-003 format |

### Failure Classification

| Failure Type | Signal | Outcome | Recovery |
|--------------|--------|---------|----------|
| Token expired | Toast + redirect | Return to Phase 0 | Re-authenticate |
| API call failed | ErrorDisplay | Operation cancelled | Retry button |
| Network error | Toast | Graceful degradation | Retry when connected |
| Validation error | Inline error | Form stays open | Correct input |
| System error | Full-screen error | Halt operations | Restart application |

### Prohibited Behaviors

| Behavior | Why Forbidden |
|----------|---------------|
| Silent failure | User cannot respond to unknown problems |
| "Best effort" without notification | User assumes success |
| Swallowed exceptions | Debugging impossible |
| Retry without visibility | User doesn't know something failed |

### Implementation Requirements

1. All `try/catch` blocks MUST surface errors (log + UI)
2. All API calls MUST handle error responses explicitly
3. All async operations MUST have loading/success/error states
4. No `catch (e) {}` without error handling
5. Console errors are insufficient — UI notification required

### Verification

```typescript
// CORRECT
try {
  await apiCall();
  addToast({ type: 'success', title: 'Operation complete' });
} catch (error) {
  addToast({ type: 'error', title: 'Operation failed', message: error.message });
  console.error('[API]', error); // For debugging
}

// FORBIDDEN
try {
  await apiCall();
} catch (e) {
  // Silent failure
}
```

---

## INV-F: TOOLING SUBORDINATION

**Implementation:** INV-002 (System Lifecycle Discipline)

### Requirements

| Requirement | Implementation |
|-------------|----------------|
| Tools subordinate to lifecycle | All spawned by start.sh, killed by stop.sh |
| Tool behavior doesn't influence correctness | No state carried in terminals |
| Tools assist, never define truth | Scripts execute, don't interpret |

### Subordinate Tools

| Tool | Subordination Rule |
|------|-------------------|
| Vite dev server | Spawned/killed by lifecycle scripts only |
| Bun backend | Spawned/killed by lifecycle scripts only |
| Terminal sessions | Must not outlive application |
| Browser DevTools | Read-only observation |
| Test runners | Isolated environment, no production impact |

**Verification:** After `bun run stop`, no MCI processes remain

---

## INV-G: INPUT SANITIZATION & BOUNDARY CLEANLINESS

**Implementation:** INV-006

**Origin:** Incident INC-2026-01-28-001 (Credential Whitespace Validation Failure)

### Requirements

| Requirement | Implementation |
|-------------|----------------|
| Entry point sanitization | `sanitizeKiteCredentials()` in form submission |
| API boundary sanitization | `sanitizeCredentialsFromRequest()` in auth route |
| Protocol construction safety | `buildKiteAuthHeader()` for header building |
| Rehydration sanitization | `sanitizeString()` in localStorage merge |

### Behavioral Guarantees

| Guarantee | Enforcement |
|-----------|-------------|
| No raw user input reaches protocol construction | Centralized sanitization module |
| Whitespace trimmed at all boundaries | Defense in depth |
| Control characters rejected | Validation throws error |
| Empty-after-trim detected | Explicit error message |

### Cause → Effect Control

| If... | Then... | Status |
|-------|---------|--------|
| User pastes credential with space | Whitespace trimmed before storage | **ENFORCED** |
| localStorage contains dirty data | Sanitized on rehydration | **ENFORCED** |
| API receives unsanitized input | Re-sanitized at boundary | **ENFORCED** |
| Header contains malformed value | Never constructed (throws) | **ENFORCED** |

### Centralized Module

All sanitization logic resides in one authoritative location:

```
src/shared/validation/sanitize.ts
├── sanitizeString()              - Base trimming
├── sanitizeApiKey()              - API key validation
├── sanitizeAccessToken()         - Access token validation
├── sanitizeUserId()              - User ID format validation
├── sanitizeKiteCredentials()     - All three at once
├── sanitizeCredentialsFromRequest() - API boundary
└── buildKiteAuthHeader()         - Safe header construction
```

### Verification

```bash
# Run INV-006 test suite
bun test src/shared/validation/sanitize.test.ts

# Expected: 46 tests pass, 0 fail
```

**Prevention:** This invariant prevents the entire class of "dirty input" bugs from ever recurring.

---

## III. ARCHITECTURAL ENFORCEMENT

All architecture artifacts MUST explicitly encode:

| Aspect | Required Documentation |
|--------|----------------------|
| Startup flow | 2.14_SYSTEM_LIFECYCLE.md |
| Shutdown flow | 2.5_SHUTDOWN_SEQUENCE.md, 2.14_SYSTEM_LIFECYCLE.md |
| State persistence boundaries | 2.7_STATE_MANAGEMENT_FLOW.md |
| Time and expiry behavior | 2.1_TOKEN_FLOW.md |
| Phase transitions | 2.8_ROUTING_FLOW.md |
| Error propagation | 2.12_ERROR_PROPAGATION.md |

### Completeness Criteria

Any diagram that does not explicitly show:
- What persists
- What resets  
- What is forbidden

...is **incomplete by definition**.

---

## IV. CHANGE CONTROL

### Change Impact Discipline

Every change MUST be evaluated for:

| Impact Type | Questions |
|-------------|-----------|
| Forward | What does this enable? |
| Backward | What assumptions does this break? |
| Cross-layer | Does this affect code ↔ architecture ↔ governance? |

### Prohibited Changes

No change may:
- Introduce hidden state
- Bypass an invariant
- Create behavior unexplainable from first principles

### Escalation Rule

Any proposed deviation from a registered invariant:

1. MUST be surfaced explicitly
2. MUST state the reason
3. MUST receive explicit Program Director approval

---

## V. VERIFICATION & RECOVERY

### Deterministic Verification

The system MUST support verification from a cold start:

```bash
# Complete verification sequence
bun run stop              # Ensure clean state
bun run status            # Verify stopped
bun run start             # Cold start
bun run status            # Verify running
curl localhost:3000/api/health  # Verify backend
open http://localhost:5173      # Verify frontend
bun run test              # Verify test suite
bun run stop              # Clean shutdown
bun run status            # Verify stopped
```

### Failure Recovery Guarantee

| In Event Of | System Response |
|-------------|----------------|
| Failure | Fail loudly (visible error) |
| Cause | Traceable (logs + error details) |
| Intended behavior | Provable (from documentation) |

---

## VI. PERFORMANCE & NON-STALL GUARANTEE

This directive prevents stalls, not creates them.

### Enforcement Mechanism

| Mechanism | Effect |
|-----------|--------|
| Structure and clarity | Eliminate ambiguity |
| Explicit documentation | Reduce decision friction |
| Deterministic scripts | Automate repetitive verification |

### Development Velocity

Once institutionalized, these rules INCREASE development speed because:
- No time wasted debugging hidden state
- No time wasted on "works for me" issues
- No time wasted on ambiguous requirements
- Clear verification procedures

---

## VII. INVARIANT REGISTRY

### Complete Invariant List

| ID | Name | Scope | Document |
|----|------|-------|----------|
| INV-001 | Daily Credential Continuity | Persistence | CONSTITUTIONAL_CONSTRAINTS.md |
| INV-002 | System Lifecycle Discipline | Launch/Shutdown | CONSTITUTIONAL_CONSTRAINTS.md |
| INV-003 | Time & Clock Authority | Temporal | PROGRAM_DIRECTOR_DIRECTIVE.md |
| INV-004 | State Legality & Transition Control | Navigation | PROGRAM_DIRECTOR_DIRECTIVE.md |
| INV-005 | Failure Visibility & Recoverability | Error Handling | PROGRAM_DIRECTOR_DIRECTIVE.md |
| INV-006 | Input Sanitization & Boundary Cleanliness | Data Integrity | CONSTITUTIONAL_CONSTRAINTS.md |

### Cross-Reference to Directive

| Directive INV | MCI INV |
|---------------|---------|
| INV-A | INV-002 |
| INV-B | INV-002 + INV-001 |
| INV-C | INV-003 |
| INV-D | INV-004 |
| INV-E | INV-005 |
| INV-F | INV-002 |
| INV-G | INV-006 |

---

## VIII. ATTESTATION REQUIREMENTS

Before proceeding beyond any phase, attestation is required that:

1. All invariants are reflected consistently across:
   - Code
   - Architecture
   - Governance
   - Diagrams
   - Procedures

2. No document, flow, or implementation contradicts these principles

3. No known bypass paths exist

---

## INTENT STATEMENT

The intent of this directive is to ensure the application:

| Behavior | Guarantee |
|----------|-----------|
| Starts cleanly | INV-A, INV-B |
| Runs deterministically | INV-C, INV-D |
| Stops cleanly | INV-A |
| Recovers predictably | INV-E |
| Evolves without regression | Change Control |
| Functions with rocket-science precision | All invariants |

---

## LEGAL STATUS

> This is not optional.
> This is not aspirational.
> This is the operating law of the system.

---

## CROSS-REFERENCES

- **Constitutional Framework:** `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md`
- **System Lifecycle:** `02_ARCHITECTURE/FLOWCHARTS/2.14_SYSTEM_LIFECYCLE.md`
- **Token Flow:** `02_ARCHITECTURE/FLOWCHARTS/2.1_TOKEN_FLOW.md`
- **State Management:** `02_ARCHITECTURE/FLOWCHARTS/2.7_STATE_MANAGEMENT_FLOW.md`
- **Error Propagation:** `02_ARCHITECTURE/FLOWCHARTS/2.12_ERROR_PROPAGATION.md`
- **Routing Flow:** `02_ARCHITECTURE/FLOWCHARTS/2.8_ROUTING_FLOW.md`

---

*This document represents the supreme operating law of the MCI system.*
*All other documents are subordinate to this directive.*
*Any modification requires explicit Program Director approval.*
