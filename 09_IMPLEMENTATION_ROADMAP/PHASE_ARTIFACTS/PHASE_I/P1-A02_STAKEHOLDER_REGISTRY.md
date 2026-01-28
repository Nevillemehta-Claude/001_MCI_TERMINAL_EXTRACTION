# P1-A02: Stakeholder Registry
## Phase I — Mission Definition

**Artifact ID:** P1-A02
**Phase:** I — Mission Definition
**Status:** CREATED (Gap Fill)
**Version:** 1.0
**Date:** 2026-01-27

---

## Purpose

This document formally identifies all stakeholders in the MCI project, their roles, responsibilities, authority levels, and communication preferences.

---

## Stakeholder Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  STAKEHOLDER HIERARCHY                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌──────────────┐                         │
│                    │  PRINCIPAL   │                         │
│                    │   (Human)    │                         │
│                    └──────┬───────┘                         │
│                           │                                 │
│                    Decision Authority                        │
│                           │                                 │
│                    ┌──────▼───────┐                         │
│                    │   EXECUTOR   │                         │
│                    │  (AI/Claude) │                         │
│                    └──────┬───────┘                         │
│                           │                                 │
│              ┌────────────┼────────────┐                    │
│              │            │            │                    │
│       ┌──────▼──────┐ ┌───▼───┐ ┌──────▼──────┐            │
│       │    MCI      │ │ Tools │ │  External   │            │
│       │  Codebase   │ │ Suite │ │   Systems   │            │
│       └─────────────┘ └───────┘ └─────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Primary Stakeholders

### S-001: Principal (Human Operator)

| Attribute | Value |
|-----------|-------|
| **Role** | Project Owner, Decision Authority |
| **Authority** | ABSOLUTE — All decisions require Principal approval |
| **Responsibilities** | Approve actions, provide direction, validate outputs |
| **Communication** | Direct conversation, checkpoint reviews |
| **Veto Power** | YES — Can halt any action at any time |

**Key Principle:** The Principal's word is final. No assumptions, no autonomous decisions.

---

### S-002: Executor (AI/Claude Code)

| Attribute | Value |
|-----------|-------|
| **Role** | Implementation Agent |
| **Authority** | DELEGATED — Acts only under explicit approval |
| **Responsibilities** | Execute approved tasks, report progress, request clarification |
| **Communication** | Structured responses, checkpoint summaries |
| **Veto Power** | NO — Can recommend, never decide |

**Key Principle:** The Executor implements, never initiates without approval.

---

## Secondary Stakeholders

### S-003: MCI Application

| Attribute | Value |
|-----------|-------|
| **Role** | The product being developed |
| **Type** | Software System |
| **Location** | `12_APPLICATION_CODE/` |
| **Interest** | Correct implementation, CR compliance |

---

### S-004: CIA-SIE-PURE Engine

| Attribute | Value |
|-----------|-------|
| **Role** | External trading engine that MCI controls |
| **Type** | Software System (Python/FastAPI) |
| **Relationship** | MCI monitors and controls this engine |
| **Interest** | Reliable communication, accurate telemetry |

---

### S-005: Broker APIs

| Attribute | Value |
|-----------|-------|
| **Role** | External data and execution providers |
| **Type** | External Services |
| **Members** | Zerodha Kite, ICICI Direct, HDFC Sky, Kotak Neo |
| **Interest** | Proper API usage, rate limit compliance |

---

## Stakeholder Responsibility Matrix (RACI)

| Activity | Principal | Executor | MCI | Engine | Brokers |
|----------|-----------|----------|-----|--------|---------|
| Define Requirements | **A** | C | I | I | I |
| Approve Design | **A** | R | I | I | - |
| Write Code | I | **R** | - | - | - |
| Review Code | **A** | R | - | - | - |
| Execute Tests | I | **R** | - | - | - |
| Deploy Changes | **A** | R | - | - | - |
| Monitor Production | **A** | C | R | R | C |
| Handle Errors | **A** | R | R | R | I |

**Legend:**
- **R** = Responsible (does the work)
- **A** = Accountable (approves/owns)
- **C** = Consulted (provides input)
- **I** = Informed (kept updated)

---

## Communication Protocol

### Principal → Executor

| Type | Format | Frequency |
|------|--------|-----------|
| Task Assignment | Direct instruction | As needed |
| Approval/Rejection | Explicit statement | Per checkpoint |
| Clarification | Question/Answer | As needed |
| Direction Change | Explicit instruction | As needed |

### Executor → Principal

| Type | Format | Frequency |
|------|--------|-----------|
| Progress Report | Structured summary | Per step completion |
| Checkpoint Request | Explicit ask for approval | Before major actions |
| Clarification Request | Specific questions | When ambiguous |
| Completion Report | Summary with outputs | Per task completion |

---

## Decision Authority Matrix

| Decision Type | Authority | Escalation |
|---------------|-----------|------------|
| Code changes | Executor proposes, Principal approves | Always to Principal |
| Architecture changes | Principal decides | N/A |
| Tool selection | Executor recommends, Principal decides | Always to Principal |
| Error resolution | Executor proposes, Principal approves | Always to Principal |
| Scope changes | Principal decides | N/A |
| Timeline changes | Principal decides | N/A |

---

## Conflict Resolution

| Situation | Resolution |
|-----------|------------|
| Executor uncertain | Ask Principal for clarification |
| Principal instruction unclear | Executor requests elaboration |
| Technical impossibility | Executor explains constraints, Principal decides |
| Conflicting requirements | Principal resolves conflict |

**Governing Principle:** When in doubt, ask. Never assume.

---

## Stakeholder Interests Alignment

| Stakeholder | Primary Interest | How MCI Serves |
|-------------|------------------|----------------|
| Principal | Informed trading decisions | Real-time telemetry, clear status |
| Executor | Successful implementation | Clear requirements, structured approach |
| MCI | Correct operation | CR compliance, tested code |
| Engine | Reliable control | Proper command interface |
| Brokers | Proper API usage | Rate limiting, auth compliance |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-27 | Initial creation (Gap Fill) | Claude (AI) |

---

*P1-A02 Stakeholder Registry v1.0 | Phase I Artifact | MCI Project*
