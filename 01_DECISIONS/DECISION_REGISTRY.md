# MCI DECISION REGISTRY

**Extracted from:** Session b8937bc2-ac10-4287-8ced-af96ac5f6f0b
**Extraction Date:** 2026-01-25
**Classification:** DECISIONS

---

## MAJOR ARCHITECTURAL DECISIONS

### D-001: RETROFIT vs FRESH BUILD

**Date:** 2026-01-24
**Status:** DECIDED

**Decision:** RETROFIT (not Fresh Build)

**Context:**
After discovering code was built against wrong specification, team evaluated whether to rebuild from scratch or retrofit existing code.

**Decision Matrix:**

| Factor | Fresh Build | Retrofit | Winner |
|--------|-------------|----------|--------|
| Time to Production | HIGH | LOW | Retrofit |
| Risk of Regression | MEDIUM | LOW | Retrofit |
| Code Quality | N/A | 97% | Retrofit |
| CR Compliance | REBUILD | MET | Retrofit |

**Rationale:**
- UXMI components already CR-005 compliant
- Would redo all 5 stores already working correctly
- Risk of introducing NEW bugs vs fixing 3 cosmetic issues
- Existing code aligns with design at 97% quality

**Principle:**
> Clean Slate = Design supersession, not code destruction

---

### D-002: SUPERVISED vs AUTONOMOUS EXECUTION

**Date:** 2026-01-23
**Status:** DECIDED

**Decision:** SUPERVISED execution model

**Context:**
The project transitioned from autonomous to supervised execution model.

**Key Changes:**
- All autonomous references purged from codebase
- SUPERVISED_MISSION_DIRECTIVE_v1.0.md is now IRONCLAD
- Claude operates as EXECUTOR under user supervision

**Rationale:**
- User maintains control over all decisions
- AI suggests, user approves
- No autonomous trading decisions
- Audit trail required for all actions

**Files Updated:**
- KITE_EXECUTION_GUIDE.md (46 occurrences updated)
- KITE_IMPLEMENTATION_REPORT.md (22 occurrences updated)
- SESSION_SUMMARY_2026-01-20.md
- IMPLEMENTATION_REPORT.md
- Multiple session archives

---

### D-003: MCI AS DECISION-SUPPORT (NOT DECISION-MAKING)

**Date:** Foundational
**Status:** CONSTITUTIONAL

**Decision:** MCI provides decision-support but NEVER makes trading decisions

**The Distinction:**

```
┌────────────────────────────────────────────────────────────────┐
│   MCI = DECISION-SUPPORT                                        │
│   ─────────────────────                                         │
│   • Shows data                                                  │
│   • Displays metrics                                            │
│   • Provides insights                                           │
│   • NEVER decides                                               │
│                                                                 │
│   CIA-SIE-PURE = DECISION-MAKING                                │
│   ─────────────────────────────                                 │
│   • Executes trades                                             │
│   • Makes trading decisions                                     │
│   • Connects to brokers                                         │
│   • Does the actual work                                        │
└────────────────────────────────────────────────────────────────┘
```

**Rationale:**
- Clear separation of concerns
- MCI is the COCKPIT, not the ENGINE
- Dashboard shows but doesn't drive
- User maintains control via MCI

---

### D-004: INDIAN BROKERS ONLY (NOT [OUT-OF-SCOPE-BROKER]/[OUT-OF-SCOPE-DATA-PROVIDER])

**Date:** Foundational
**Status:** CONSTITUTIONAL

**Decision:** Support 4 Indian brokers, NOT US brokers

**Supported Backends:**
1. Zerodha Kite (Primary)
2. ICICI Direct
3. HDFC Sky
4. Kotak Neo

**NOT Supported:**
- [Out-of-Scope-Broker] (US)
- [Out-of-Scope-Data-Provider] (US)

**Rationale:**
- Indian market focus
- Kite API integration
- 6:00 AM IST token expiry (CR-004)
- NSE/BSE market hours

---

### D-005: BUN/HONO OVER NODE/EXPRESS

**Date:** Architecture Phase
**Status:** DECIDED

**Decision:** Use Bun runtime with Hono framework

**Rationale:**
- Bun is faster than Node.js
- Hono is lightweight and TypeScript-native
- Better performance for real-time telemetry
- Modern stack alignment

---

### D-006: ZUSTAND FOR STATE MANAGEMENT

**Date:** Architecture Phase
**Status:** DECIDED

**Decision:** Use Zustand instead of Redux

**Rationale:**
- Simpler API
- Less boilerplate
- Better TypeScript support
- Suitable for 5-store architecture
- Session persistence support

---

## DECISION PRINCIPLES

### The Clean Slate Principle
> Previous DECISIONS are superseded by new specifications
> Previous CODE that ALIGNS → RETAIN
> Previous CODE that VIOLATES → REMOVE
> New Use Case Specification is the SINGLE SOURCE OF TRUTH

### The Traceability Principle
> REQUIREMENT → SPECIFICATION → VERIFICATION
> (What Must Be) → (What It Means) → (Did We Do It?)

---

## CROSS-REFERENCES

- **Architecture:** See `02_ARCHITECTURE/SYSTEM_OVERVIEW.md`
- **Governance:** See `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md`
