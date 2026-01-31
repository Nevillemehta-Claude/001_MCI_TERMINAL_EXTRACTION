# P1-A01: MCI Mission Charter
## Phase I — Mission Definition

**Artifact ID:** P1-A01
**Phase:** I — Mission Definition
**Status:** FORMALIZED
**Version:** 1.0
**Date:** 2026-01-27

---

## Executive Summary

The Mission Control Interface (MCI) is a NASA-grade decision-support trading dashboard for Indian equity markets. It provides real-time monitoring, control, and situational awareness for algorithmic trading operations without executing trades directly.

---

## Mission Statement

> **MCI exists to provide the human operator with complete situational awareness and control authority over the CIA-SIE-PURE algorithmic trading engine, ensuring safe, informed, and timely decision-making in Indian equity markets.**

---

## Core Identity

| Attribute | Definition |
|-----------|------------|
| **Name** | Mission Control Interface (MCI) |
| **Codename** | The COCKPIT |
| **Role** | Decision-Support Dashboard |
| **Domain** | Indian Equity Markets |
| **Relationship** | Controls CIA-SIE-PURE (The ENGINE) |

---

## Singularity of Purpose

MCI is **NOT** a trading system. MCI is a **monitoring and control interface**.

```
┌─────────────────────────────────────────────────────────────┐
│                    ENGINE vs COCKPIT                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CIA-SIE-PURE (ENGINE)          MCI (COCKPIT)              │
│  ───────────────────            ─────────────              │
│  • Executes trades              • Displays status           │
│  • Manages positions            • Shows positions           │
│  • Places orders                • Shows orders              │
│  • Runs algorithms              • Monitors health           │
│  • Connects to brokers          • Controls ignition         │
│  • Headless operation           • Human interface           │
│                                                             │
│  Python/FastAPI                 React/TypeScript            │
│  DOES the trading               WATCHES the trading         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Phases

MCI operates through 5 sequential phases:

| Phase | Name | Purpose |
|-------|------|---------|
| **0** | Token Capture | Authenticate with Kite API |
| **1** | Pre-Ignition Scanner | Validate 12-point system readiness |
| **2** | Ignition | Connect to broker backend |
| **3** | Telemetry | Real-time monitoring dashboard |
| **4** | Shutdown | Graceful 6-step termination |

---

## Constitutional Requirements (SACRED)

MCI is governed by 5 inviolable Constitutional Requirements:

| CR | Name | Mandate |
|----|------|---------|
| **CR-001** | Token Validity | Every operation validates token first |
| **CR-002** | Graceful Shutdown | 6-step shutdown sequence always |
| **CR-003** | Error Format | WHAT/WHY/HOW error structure |
| **CR-004** | Token Expiry | Daily expiry at 6:00 AM IST |
| **CR-005** | UXMI 7-States | All UI components implement 7 states |

**Reference:** `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md`

---

## Supported Brokers

MCI supports Indian brokers exclusively:

| Broker | API | Status |
|--------|-----|--------|
| Zerodha Kite | Kite Connect API | Primary |
| ICICI Direct | Breeze API | Supported |
| HDFC Sky | Sky API | Supported |
| Kotak Neo | Neo API | Supported |

**Explicitly Excluded:** [Out-of-Scope-Broker], [Out-of-Scope-Data-Provider], Interactive Brokers, or any US/International brokers.

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | Bun | High-performance JavaScript runtime |
| Backend | Hono | Lightweight web framework |
| Frontend | React 18 | UI component library |
| State | Zustand | Lightweight state management |
| Styling | Tailwind CSS | Utility-first CSS |
| Build | Vite | Fast build tooling |
| Language | TypeScript | Type-safe JavaScript |
| Testing | Vitest, Playwright, Stryker | Unit, E2E, Mutation |
| Monitoring | Sentry | Error tracking |

---

## Development Model

MCI follows a **Supervised Execution Model**:

| Role | Responsibility |
|------|----------------|
| **Principal** (Human) | Approves all actions, makes decisions |
| **Executor** (AI/Claude) | Implements under explicit approval |

**Key Principle:** No autonomous action. Every step requires checkpoint approval.

---

## Success Criteria

MCI is successful when:

1. ✅ Operator can authenticate with Kite in < 30 seconds
2. ✅ Pre-ignition scan completes in < 10 seconds
3. ✅ Telemetry updates display within 100ms of receipt
4. ✅ Shutdown completes all 6 steps reliably
5. ✅ All errors display WHAT/WHY/HOW format
6. ✅ All UI components implement 7 UXMI states

---

## Philosophical Principles

| PP | Principle | Meaning |
|----|-----------|---------|
| **PP-001** | Decision-Support NOT Decision-Making | MCI informs, never decides |
| **PP-002** | Expose Contradictions | Show conflicting signals clearly |
| **PP-003** | Descriptive AI | AI describes, human prescribes |

---

## Document References

| Document | Location | Relevance |
|----------|----------|-----------|
| Constitutional Requirements | `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md` | SACRED rules |
| Architecture Overview | `02_ARCHITECTURE/SYSTEM_OVERVIEW.md` | Technical design |
| Layer 2 Flowcharts | `02_ARCHITECTURE/FLOWCHARTS/` | 13 architecture diagrams |
| Application Code | `12_APPLICATION_CODE/` | Implementation |

---

## Approval

| Role | Status |
|------|--------|
| Principal | ⏳ Pending formal sign-off |
| Document Author | Claude (AI Executor) |
| Creation Date | 2026-01-27 |

---

*P1-A01 Mission Charter v1.0 | Phase I Artifact | MCI Project*
