# VERBATIM CONSTITUTIONAL REQUIREMENTS DEFINITIONS

**Source:** b8937bc2-ac10-4287-8ced-af96ac5f6f0b.jsonl
**Extraction Date:** 2026-01-25
**Purpose:** Preserve exact wording from source session

---

## CR-001 REFERENCES

- CR-001    │ Token Validity      │ tokenStore.ts    │ ✅ PASS │          │
- CR-001  │ (Token Validity)   │   │  ┌─────────────────────────────────┐   │ │
- CR-001 (token), CR-004 (6AM IST expiry), CR-002 (shutdown)
- CR-001 Token Validity                                        │
- CR-001 | Token Validity | `validateToken()` before API calls | tokenStore.ts | ✅ 100% |
- CR-001 | Token Validity | `validateTokens()` | tokenStore.ts:108 | ✅ |
- CR-001 ──────────│───│──> TokenStore    │   │ tokenStore.ts    │                │
- CR-001: Token   │          │    BACKEND      │          │ P1: No Assume   │
- CR-001: Token Validity     → tokenStore.ts:108 validateTokens()            │
- CR-001: Token Validity (validate before execution)
- CR-001: Token Validity** - COMPLIANT
- CR-001: Token-based authentication
- CR-001: Validate token | CR-004: Calculate 6AM IST expiry  │

---

## CR-002 REFERENCES

- CR-002    │ Graceful Shutdown   │ shutdownStore.ts │ ✅ PASS │          │
- CR-002    │ ✅ 6-step shutdown          │          │
- CR-002 (Shutdown): shutdownStore.ts, ShutdownPanel.tsx, shutdown.ts
- CR-002 6-step Shutdown Sequence diagram
- CR-002 Graceful Shutdown                                     │
- CR-002 Shutdown Sequence - Steps 1-5 of 6 visible:
- CR-002 Shutdown Sequence diagram in Architecture Schematics tab. Next batch should start at line 5001 to complete remaining ~733 lines.
- CR-002 | Graceful Shutdown | 6-step DEFAULT_STEPS | shutdownStore.ts:47-78 | ✅ |
- CR-002 | Graceful Shutdown | 6-step sequence | shutdownStore.ts | ✅ 100% |
- CR-002: 6-step graceful shutdown                     │
- CR-002: GRACEFUL SHUTDOWN (6 STEPS)                              │
- CR-002: Graceful Shutdown  → shutdownStore.ts:47-78 (6 steps)             │
- CR-002: Graceful Shutdown (6-step sequence)
- CR-002: Graceful Shutdown** - COMPLIANT
- CR-002: Shutdown│          │    FRONTEND     │          │ P2: Transparent │

---

## CR-003 REFERENCES

- CR-003    │ Error WHAT/WHY/HOW  │ ErrorDisplay.tsx │ ✅ PASS │          │
- CR-003 (Errors): ErrorDisplay.tsx, ActivityLogPanel.tsx, sentry.ts
- CR-003 Error Format (WHAT/WHY/HOW)                           │
- CR-003 compliance (WHAT/WHY/HOW error format)
- CR-003 | Error Format | ErrorDetails type | types.ts:174-179 | ✅ |
- CR-003 | Error Format | WHAT/WHY/HOW | ErrorDisplay.tsx | ✅ 100% |
- CR-003: Error   │          │    INTEGRATION  │          │ P3: Checkpoint  │
- CR-003: Error Format (WHAT/WHY/HOW)
- CR-003: Error Format (WHAT/WHY/HOW)** - COMPLIANT
- CR-003: WHAT/WHY/HOW       → ErrorDisplay.tsx (what, why, how props)      │
- CR-003: WHAT/WHY/HOW error format
- CR-003:** Error Format (WHAT/WHY/HOW)

---

## CR-004 REFERENCES

- CR-004    │ 6:00 AM IST Expiry  │ tokenStore.ts    │ ✅ PASS │          │
- CR-004 (6AM IST expiry), CR-002 (shutdown)
- CR-004 (Token Lifecycle Accuracy / 6 AM IST expiry) implementation details.
- CR-004 Implementation**: `expiry.setUTCHours(0, 30, 0, 0); // 6 AM IST = 00:30 UTC`
- CR-004 Implementation: `expiry.setUTCHours(0, 30, 0, 0); // 6 AM IST = 00:30 UTC`
- CR-004 SACRED: 6:00 AM IST token expiry (00:30 UTC)
- CR-004 Token Expiry 6AM IST                                  │
- CR-004 Token Expiry Fix (foundation)                        │       │
- CR-004 Token Expiry Fix** - Change 24h to 6:00 AM IST in `tokenStore.ts`
- CR-004 Token Expiry Fix]                │
- CR-004 compliance verification (6:00 AM IST Expiry) was partially read - the table showing implementation checks was being displayed.
- CR-004 is SACRED: 6:00 AM IST token expiry
- CR-004 requires token expiry at       │ │
- CR-004 | 6AM IST Expiry | `setUTCHours(0, 30, 0, 0)` | tokenStore.ts:23-33 | ✅ 100% |
- CR-004 | 6AM IST Expiry | `setUTCHours(0, 30, 0, 0)` | tokenStore.ts:49 | ✅ |

---

## CR-005 REFERENCES

- CR-005    │ Spec:118-124        │ /uxmi/*.tsx      │ ✅ PASS │          │
- CR-005    │ UXMI 7 States       │ /uxmi/*.tsx      │ ✅ PASS │          │
- CR-005 (UXMI tools), All CRs (Claude Code)
- CR-005 (UXMI): ADDENDUM_002_UX_MICRO_INTERACTIONS.md, uxmi/*
- CR-005 (UXMI): uxmi/*.tsx (7 components)
- CR-005 UXMI - Seven States table: Default, Hover (300ms tooltip), Focus (2px cyan ring), Active (<100ms feedback), Loading (spinner), Disabled begins.
- CR-005 UXMI 7-State Components                               │
- CR-005 UXMI 7-State compliance verification complete - all components verified compliant. PART V Prototype Review Checklist in progress - Design System, Component Library, and Wireframes sections all checked. Continuing.
- CR-005 UXMI Components section starting: Seven States of Every Interactive Element. Continuing.
- CR-005 UXMI Constitutional Requirement
- CR-005 UXMI Retrofit Audit ✅ → COWORK
- CR-005 UXMI | `01_SOURCE_DOCUMENTS/ADDENDUM_002_UX_MICRO_INTERACTIONS.md` |
- CR-005 UXMI)            │       │
- CR-005 established, ADDENDUM_002 (UXMI)
- CR-005 | UXMI 7-State Components | 300ms tooltip, WHAT/WHY/HOW |

---

## COMPLETE CR BLOCK (VERBATIM)

```
Constitutional Requirements (CRs):**
   - CR-001: Token-based authentication
   - CR-002: Equal visual weight (no bias toward bullish/bearish)
   - CR-003: WHAT/WHY/HOW error format
   - CR-004: 6:00 AM IST token expiry (SACRED)
   - CR-005: UXMI 7-state micro-interactions
```

```
CONSTITUTIONAL REQUIREMENTS (REDEFINED):**
- **CR-001**: DECISION-SUPPORT, NOT DECISION-MAKING (display info, don't recommend)
- **CR-002**: EXPOSE CONTRADICTIONS, NEVER RESOLVE (show conflicts, don't hide)
- **CR-003**: DESCRIPTIVE AI, NOT PRESCRIPTIVE AI (describe IS, not SHOULD)
- **CR-004**: TOKEN LIFECYCLE ACCURACY (accurate state, expiry tracking)
- **CR-005**: USER EXPERIENCE MICRO-INTERACTIONS (7 states, tooltips, helpful errors)
```

```
Constitutional Requirements:**
  - CR-001: Decision-Support, NOT Decision-Making
  - CR-002: Expose Contradictions, NEVER Resolve
  - CR-003: Descriptive AI, NOT Prescriptive AI
  - CR-004: Token Lifecycle Accuracy (6:00 AM IST expiry - SACRED)
  - CR-005: UXMI 7-state micro-interactions
```

