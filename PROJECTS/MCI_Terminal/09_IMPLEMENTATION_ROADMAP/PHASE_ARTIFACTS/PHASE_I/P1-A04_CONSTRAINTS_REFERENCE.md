# P1-A04: Constraints Catalog Reference
## Phase I — Mission Definition

**Artifact ID:** P1-A04
**Phase:** I — Mission Definition
**Status:** REFERENCE (Points to existing artifacts)
**Version:** 1.0
**Date:** 2026-01-27

---

## Purpose

This document serves as the Phase I reference to the MCI Constraints Catalog. The constraints are already fully documented in the Governance folder and do not require duplication.

---

## Primary Reference

**Canonical Document:** `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md`

This document contains the complete definition of all 5 Constitutional Requirements (CRs).

---

## Constitutional Requirements Summary

| CR | Name | One-Line Summary | Sacred |
|----|------|------------------|--------|
| **CR-001** | Token Validity | Every operation validates token first | ✅ |
| **CR-002** | Graceful Shutdown | 6-step shutdown sequence always | ✅ SACRED |
| **CR-003** | Error Format | WHAT/WHY/HOW error structure | ✅ SACRED |
| **CR-004** | Token Expiry | Daily expiry at 6:00 AM IST (00:30 UTC) | ✅ SACRED |
| **CR-005** | UXMI 7-States | All UI components implement 7 states | ✅ SACRED |

---

## Supporting Governance Documents

| Document | Location | Content |
|----------|----------|---------|
| CR Definitions | `00_GOVERNANCE/VERBATIM_CR_DEFINITIONS.md` | Verbatim CR text |
| Quality Gates | `00_GOVERNANCE/VERBATIM_QUALITY_GATES.md` | Stage gate definitions |
| Protocols | `00_GOVERNANCE/VERBATIM_PROTOCOLS.md` | Operational protocols |
| LTT | `00_GOVERNANCE/VERBATIM_LTT.md` | Lifecycle Traceability Tree |
| Checkpoints | `00_GOVERNANCE/VERBATIM_CHECKPOINTS.md` | Approval checkpoints |

---

## Constraint Categories

### Technical Constraints

| Constraint | Description | Source |
|------------|-------------|--------|
| Token expiry timing | 6:00 AM IST daily | CR-004 |
| Shutdown steps | Exactly 6 steps | CR-002 |
| UI states | Exactly 7 states | CR-005 |
| Error format | WHAT/WHY/HOW | CR-003 |
| Token validation | Before every operation | CR-001 |

### Technology Constraints

| Constraint | Value | Rationale |
|------------|-------|-----------|
| Runtime | Bun | Performance requirement |
| Backend Framework | Hono | Lightweight, Bun-optimized |
| Frontend Framework | React 18 | Standard, ecosystem |
| State Management | Zustand | Lightweight, no boilerplate |
| Styling | Tailwind CSS | Utility-first, consistent |
| Language | TypeScript (strict) | Type safety |

### Broker Constraints

| Constraint | Description |
|------------|-------------|
| Supported Brokers | Zerodha Kite, ICICI Direct, HDFC Sky, Kotak Neo |
| Excluded Brokers | [Out-of-Scope-Broker], [Out-of-Scope-Data-Provider], Interactive Brokers, all US brokers |
| Market | Indian equities only (NSE, BSE) |
| Currency | INR only |

### Operational Constraints

| Constraint | Description |
|------------|-------------|
| Execution Model | Supervised (AI under human approval) |
| Decision Authority | Principal (human) only |
| Trading Execution | MCI does NOT execute trades (CIA-SIE-PURE does) |
| Role | Decision-support, not decision-making |

---

## Constraint Enforcement

| CR | Enforcement Point | Implementation |
|----|-------------------|----------------|
| CR-001 | Every API route | Middleware validates token |
| CR-002 | Shutdown initiation | ShutdownService enforces steps |
| CR-003 | Every error throw | `createMCIError()` utility |
| CR-004 | Token storage | Expiry check on every access |
| CR-005 | Every UI component | UXMI component library |

---

## Quarantined Constraints (DO NOT USE)

The following documents contain incorrect constraints and are **QUARANTINED**:

| Document | Issue | Status |
|----------|-------|--------|
| `COMPLETE_EXECUTION_GUIDE.md` | [Out-of-Scope-Broker]/[Out-of-Scope-Data-Provider] references | ☠️ QUARANTINED |
| `SECTION_N_SENTRY_OPERATIONS.md` | Incorrect broker integration | ☠️ QUARANTINED |

These documents should never be referenced for constraint information.

---

## Relationship to Other Phase I Artifacts

| Artifact | Relationship |
|----------|--------------|
| P1-A01 Mission Charter | Constraints support mission execution |
| P1-A02 Stakeholder Registry | Stakeholders bound by constraints |
| P1-A03 Success Metrics | Metrics measure constraint compliance |
| P1-A05 Risk Register | Risks include constraint violations |
| P1-A06 Communication Protocol | Communications follow constraint awareness |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-27 | Created as reference document | Claude (AI) |

---

*P1-A04 Constraints Reference v1.0 | Phase I Artifact | MCI Project*
