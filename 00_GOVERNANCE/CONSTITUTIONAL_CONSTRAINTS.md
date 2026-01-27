# MCI CONSTITUTIONAL CONSTRAINTS (CR-001 through CR-005)

**Extracted from:** Session b8937bc2-ac10-4287-8ced-af96ac5f6f0b
**Extraction Date:** 2026-01-25
**Classification:** GOVERNANCE - SACRED

---

## OVERVIEW

The Mission Control Interface (MCI) operates under five Constitutional Requirements (CRs) that form the inviolable foundation of the system. These constraints govern all operations and cannot be bypassed.

---

## CR-001: TOKEN VALIDITY

**Status:** SACRED | NON-NEGOTIABLE

### Definition
Every operation must validate token before execution. Invalid token = STOP everything. No token = No operation.

### Implementation Requirements
- Token validation MUST occur before any API call
- Failed validation MUST halt all operations immediately
- No fallback or retry without valid token
- Token state must be verifiable at all times

### Phase Applicability
- **Phase 0**: Token Capture - Initial acquisition and validation
- **All Phases**: Continuous validation requirement

---

## CR-002: GRACEFUL SHUTDOWN (6-Step Sequence)

**Status:** SACRED | NON-NEGOTIABLE

### Definition
All system shutdowns must follow the prescribed 6-step sequence to ensure data integrity and clean exit.

### The 6 Steps

| Step | Action | Purpose |
|------|--------|---------|
| 1 | Stop accepting new operations | Prevent new work entering system |
| 2 | Complete all pending transactions | Ensure no orphaned operations |
| 3 | Close all WebSocket connections | Clean network teardown |
| 4 | Clear all sensitive data from memory | Security requirement |
| 5 | Log final application state | Audit trail preservation |
| 6 | Exit process cleanly (code 0) | Clean OS-level termination |

### Implementation Requirements
- Sequence MUST execute in order (1 → 2 → 3 → 4 → 5 → 6)
- Each step must complete before next begins
- Emergency mode supported but must still follow sequence
- Phase 4 (Shutdown) enforces this requirement

---

## CR-003: ERROR FORMAT (WHAT/WHY/HOW)

**Status:** SACRED | NON-NEGOTIABLE

### Definition
Every error must be logged in the standardized three-part format to ensure actionable error handling.

### The Format

```
WHAT: [What went wrong]
WHY:  [Root cause]
HOW:  [Recovery action taken]
```

### Implementation Requirements
- All error handlers MUST use this format
- Technical details toggle available for expanded information
- User-facing errors must be human-readable
- Logs must capture full technical context

### Example
```
WHAT: Token validation failed
WHY:  Token expired at 06:00 AM IST (daily expiry)
HOW:  Redirecting user to token capture flow
```

---

## CR-004: TOKEN EXPIRY AT 6:00 AM IST (SACRED)

**Status:** SACRED | NON-NEGOTIABLE

### Definition
Kite tokens expire at 6:00 AM IST daily. This timing is NON-NEGOTIABLE.

### Technical Details
- **6:00 AM IST = 00:30 UTC** (IST is UTC+5:30)
- Tokens are issued by Kite Connect (Zerodha)
- New token must be acquired after expiry
- System must handle transition gracefully

### Implementation Requirements
- Token timer must display countdown to expiry
- Automatic logout/redirect at expiry
- No operations permitted with expired token
- Phase 0 re-engagement required after expiry

### Phase Applicability
- **Phase 0**: Token Capture - Acquires new token
- **Phase 4**: May trigger if expiry occurs during session

---

## CR-005: UXMI 7-STATE MICRO-INTERACTIONS

**Status:** SACRED | NON-NEGOTIABLE

### Definition
All interactive UI components must implement the 7-state micro-interaction standard for consistent user experience.

### The 7 Components
1. **Button** - Interactive action trigger
2. **ErrorDisplay** - Error presentation with WHAT/WHY/HOW
3. **Input** - Text/data entry fields
4. **ProgressBar** - Progress visualization
5. **Spinner** - Loading indicator
6. **Toast** - Notification messages
7. **Tooltip** - Contextual help

### The 7 States
1. **idle** - Default resting state
2. **hover** - Mouse hover feedback
3. **active** - Click/press feedback
4. **loading** - Operation in progress
5. **success** - Operation completed successfully
6. **error** - Operation failed
7. **disabled** - Interaction not available

### Timing Constants (SACRED)
| Transition | Duration | Purpose |
|------------|----------|---------|
| Hover | 150ms | Visual hover feedback |
| Active | 100ms | Button press feedback |
| Tooltip Delay | 300ms | Delay before tooltip shows |
| Toast Duration | 5000ms | Auto-dismiss notification |

### Implementation Code Reference
```typescript
const TIMING = {
  hover: 150,    // ms - transition to hover state
  active: 100,   // ms - button press feedback
  tooltip: 300,  // ms - delay before tooltip shows
  toast: 5000    // ms - auto-dismiss duration
};
```

---

## COMPLIANCE MATRIX

| CR | Name | Status | Verification |
|----|------|--------|--------------|
| CR-001 | Token Validity | IMPLEMENTED | All API calls validate token |
| CR-002 | Graceful Shutdown | IMPLEMENTED | 6-step sequence in shutdownStore |
| CR-003 | Error Format | IMPLEMENTED | WHAT/WHY/HOW in ErrorDisplay |
| CR-004 | Token Expiry | IMPLEMENTED | TokenTimer with 6:00 AM IST |
| CR-005 | UXMI 7-States | IMPLEMENTED | All 7 components × 7 states |

---

## AUDIT STATUS

**Last Audit:** 2026-01-24
**Compliance Rating:** 97%
**Auditor Verdict:** 3 cosmetic fixes only, all CRs fully implemented

### Known Gaps
- Phase 3.5 (UXMI) governance gap in LIFECYCLE_DEFINITION.md (documentation only)
- All functional requirements MET

---

## CROSS-REFERENCES

- **Architecture:** See `02_ARCHITECTURE/` for phase-specific implementation
- **Implementation:** See `04_IMPLEMENTATION/CODE_SNIPPETS/` for code
- **Audit Reports:** See `08_CERTIFICATION/` for compliance verification

---

*This document represents the inviolable foundation of MCI operations.*
*Any modification requires formal governance review.*
