# P3-A05: Architecture Decision Records
## Phase III — System Architecture

**Artifact ID:** P3-A05
**Phase:** III — System Architecture
**Status:** CREATED
**Version:** 1.0
**Date:** 2026-01-27

---

## Purpose

This document records significant architecture decisions with context and consequences.

---

## ADR-001: Monorepo Structure

**Status:** Accepted

**Context:**
MCI has both frontend and backend components that share types and could benefit from unified tooling.

**Decision:**
Use a monorepo structure with shared `/src/shared/` directory for types.

**Consequences:**
- ✅ Shared types between frontend and backend
- ✅ Single package.json for dependencies
- ✅ Unified test and build scripts
- ⚠️ Larger repository
- ⚠️ Need to manage separate build outputs

---

## ADR-002: Zustand for State Management

**Status:** Accepted

**Context:**
Need client-side state management for 5 operational phases with persistence requirements.

**Decision:**
Use Zustand with 5 separate stores (tokenStore, scannerStore, ignitionStore, telemetryStore, shutdownStore).

**Consequences:**
- ✅ Minimal boilerplate
- ✅ Easy persistence to sessionStorage
- ✅ TypeScript-friendly
- ✅ No provider wrapper needed
- ⚠️ Less structure than Redux

---

## ADR-003: Session Storage for Tokens

**Status:** Accepted

**Context:**
Token and ignition state must persist across page refreshes but not across browser sessions (CR-001, CR-004).

**Decision:**
Use localStorage for tokenStore (daily credential continuity per INV-001) and sessionStorage for ignitionStore.

**Update (2026-01-28):** tokenStore changed from sessionStorage to localStorage to enable daily credential continuity across browser/system restarts. Credentials are cleared on token expiry (6:00 AM IST) per CR-004 enforcement.

**Consequences:**
- ✅ State survives page refresh
- ✅ State cleared on browser close
- ✅ Token not persisted beyond session
- ⚠️ State lost if user opens new tab

---

## ADR-004: Component Library (UXMI)

**Status:** Accepted

**Context:**
CR-005 mandates 7-state micro-interactions for all interactive components.

**Decision:**
Create dedicated UXMI component library with 7 components implementing all 7 states.

**Consequences:**
- ✅ Consistent UX across application
- ✅ Centralized state management
- ✅ Easy CR-005 compliance verification
- ✅ Reusable across phases
- ⚠️ Custom components require maintenance

---

## ADR-005: REST + WebSocket Hybrid

**Status:** Accepted

**Context:**
Telemetry requires real-time updates while other operations can use request/response.

**Decision:**
Use REST for auth, scan, ignition, shutdown. Use WebSocket for real-time telemetry.

**Consequences:**
- ✅ Appropriate protocol for each use case
- ✅ WebSocket for low-latency updates
- ✅ REST for simple operations
- ⚠️ Two communication patterns to maintain
- ⚠️ Fallback needed if WebSocket fails

---

## ADR-006: Hono for Backend

**Status:** Accepted

**Context:**
Need lightweight HTTP framework optimized for Bun runtime.

**Decision:**
Use Hono instead of Express for backend routes.

**Consequences:**
- ✅ Optimized for Bun performance
- ✅ Smaller bundle than Express
- ✅ Web standard APIs
- ⚠️ Smaller ecosystem than Express
- ⚠️ Some Express middleware not compatible

---

## ADR-007: WHAT/WHY/HOW Error Format

**Status:** Accepted (Constitutional — CR-003)

**Context:**
CR-003 mandates all errors use WHAT/WHY/HOW format.

**Decision:**
Implement ErrorDisplay component and createMCIError utility that enforce format.

**Consequences:**
- ✅ Consistent error presentation
- ✅ Actionable error messages
- ✅ CR-003 compliance
- ⚠️ All errors must go through utility
- ⚠️ Technical details require separate toggle

---

## ADR-008: 6:00 AM IST Token Expiry

**Status:** Accepted (Constitutional — CR-004)

**Context:**
Kite tokens expire at 6:00 AM IST daily. This is external constraint.

**Decision:**
Calculate expiry as next 00:30 UTC (6:00 AM IST). Implement countdown timer with warning states.

**Consequences:**
- ✅ Accurate expiry tracking
- ✅ User awareness of remaining time
- ✅ Automatic redirect on expiry
- ⚠️ No token refresh mechanism (Kite limitation)

---

## ADR-009: Indian Brokers Only

**Status:** Accepted

**Context:**
MCI is designed for Indian markets (NSE/BSE). US brokers are not supported.

**Decision:**
Support only Zerodha, ICICI, HDFC, Kotak. Explicitly reject [Out-of-Scope-Broker]/[Out-of-Scope-Data-Provider].

**Consequences:**
- ✅ Focused implementation
- ✅ No US regulatory concerns
- ✅ INR-only currency handling
- ⚠️ Cannot expand to US markets
- ⚠️ Kite is primary integration point

---

## ADR-010: Two-Stage Ignition

**Status:** Accepted

**Context:**
Real trading requires additional safety to prevent accidental execution.

**Decision:**
Implement ARM → IGNITE sequence with confirmation phrase for real trading.

**Consequences:**
- ✅ Prevents accidental ignition
- ✅ Explicit user confirmation
- ✅ Aligned with PP-001 (Decision-Support)
- ⚠️ Additional steps for user

---

## ADR-011: 6-Step Shutdown Sequence

**Status:** Accepted (Constitutional — CR-002)

**Context:**
CR-002 mandates graceful shutdown with specific steps.

**Decision:**
Implement exactly 6 steps: Cancel orders → Close positions → Disconnect → Stop telemetry → Clear session → Log complete.

**Consequences:**
- ✅ Data integrity preserved
- ✅ No orphaned operations
- ✅ Clean exit
- ⚠️ Shutdown takes time
- ⚠️ Emergency mode still follows steps (faster)

---

## ADR-012: Sentry for Error Tracking

**Status:** Accepted

**Context:**
Need production error monitoring with trading context.

**Decision:**
Use Sentry for both frontend and backend with custom trading breadcrumbs.

**Consequences:**
- ✅ Full stack visibility
- ✅ Source maps for debugging
- ✅ Trading context in errors
- ⚠️ Third-party dependency
- ⚠️ Cost for high volume

---

## ADR-013: Decision-Support Only (PP-001)

**Status:** Accepted (Constitutional — PP-001)

**Context:**
MCI must inform, never decide. It's a COCKPIT, not an ENGINE.

**Decision:**
UI displays information only. No recommendations, no auto-actions.

**Consequences:**
- ✅ Human remains in control
- ✅ No liability for AI decisions
- ✅ Clear separation of concerns
- ⚠️ All actions require user initiation

---

## Decision Log

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| ADR-001 | Monorepo Structure | Accepted | 2026-01-27 |
| ADR-002 | Zustand State | Accepted | 2026-01-27 |
| ADR-003 | Session Storage | Accepted | 2026-01-27 |
| ADR-004 | UXMI Library | Accepted | 2026-01-27 |
| ADR-005 | REST + WebSocket | Accepted | 2026-01-27 |
| ADR-006 | Hono Backend | Accepted | 2026-01-27 |
| ADR-007 | Error Format | Accepted (CR-003) | 2026-01-27 |
| ADR-008 | Token Expiry | Accepted (CR-004) | 2026-01-27 |
| ADR-009 | Indian Brokers | Accepted | 2026-01-27 |
| ADR-010 | Two-Stage Ignition | Accepted | 2026-01-27 |
| ADR-011 | 6-Step Shutdown | Accepted (CR-002) | 2026-01-27 |
| ADR-012 | Sentry Monitoring | Accepted | 2026-01-27 |
| ADR-013 | Decision-Support Only | Accepted (PP-001) | 2026-01-27 |

---

*P3-A05 Architecture Decision Records v1.0 | Phase III Artifact | MCI Project*
