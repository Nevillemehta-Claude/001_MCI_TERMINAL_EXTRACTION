# P1-A06: Communication Protocol Reference
## Phase I — Mission Definition

**Artifact ID:** P1-A06
**Phase:** I — Mission Definition
**Status:** REFERENCE (Points to established model)
**Version:** 1.0
**Date:** 2026-01-27

---

## Purpose

This document references the established communication protocols for the MCI project. The Supervised Execution Model defines all communication patterns between Principal and Executor.

---

## Primary Reference

The communication protocol is defined by the **Supervised Execution Model** established in project governance.

---

## Communication Model Overview

```
┌─────────────────────────────────────────────────────────────┐
│                SUPERVISED EXECUTION MODEL                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    PRINCIPAL (Human)                                        │
│    ─────────────────                                        │
│    • Provides direction                                     │
│    • Approves actions                                       │
│    • Makes decisions                                        │
│    • Validates outputs                                      │
│                                                             │
│           │                    ▲                            │
│           │ Instructions       │ Reports                    │
│           │ Approvals          │ Questions                  │
│           ▼                    │ Outputs                    │
│                                                             │
│    EXECUTOR (AI/Claude)                                     │
│    ────────────────────                                     │
│    • Implements tasks                                       │
│    • Reports progress                                       │
│    • Requests clarification                                 │
│    • Proposes solutions                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Communication Channels

| Channel | Purpose | Format |
|---------|---------|--------|
| **Direct Conversation** | Primary task communication | Natural language |
| **Checkpoint Reviews** | Formal approval points | Structured summary |
| **Documentation** | Persistent knowledge transfer | Markdown files |
| **Code** | Implementation delivery | TypeScript/React |

---

## Communication Protocols

### Protocol 1: Task Assignment

**Principal → Executor**

1. Principal provides task instruction
2. Executor confirms understanding
3. Executor outlines approach (if complex)
4. Principal approves approach
5. Executor begins implementation

### Protocol 2: Progress Reporting

**Executor → Principal**

1. Report what was completed
2. Show outputs/artifacts created
3. Identify any blockers or questions
4. Propose next steps
5. Await approval to continue

### Protocol 3: Checkpoint Review

**At Major Milestones**

1. Executor summarizes completed work
2. Lists all artifacts created/modified
3. Confirms CR compliance
4. Identifies any deviations or concerns
5. Principal validates and approves
6. Proceed to next phase

### Protocol 4: Clarification Request

**Executor → Principal**

1. State what is unclear
2. Provide context for why it matters
3. Offer options if applicable
4. Await Principal's decision
5. Proceed with clarified direction

---

## Communication Timing

| Situation | Required Communication |
|-----------|----------------------|
| Before any code change | Confirm understanding of task |
| After file creation | Report file and location |
| After file modification | Report what changed |
| Encountering ambiguity | Request clarification |
| Completing a phase | Checkpoint summary |
| Discovering an issue | Immediate report |

---

## Communication Quality Standards

| Standard | Description |
|----------|-------------|
| **Clarity** | No jargon; explain technical concepts |
| **Completeness** | Include all relevant information |
| **Accuracy** | Verify facts before stating |
| **Brevity** | Concise without losing meaning |
| **Traceability** | Reference source documents |
| **Actionability** | Clear next steps or questions |

---

## Forbidden Communication Patterns

| Pattern | Issue |
|---------|-------|
| Assuming approval | Must wait for explicit approval |
| Proceeding on ambiguity | Must ask for clarification |
| Hiding problems | Must report all issues immediately |
| Making decisions | Must propose and await decision |
| Skipping checkpoints | Must complete all checkpoints |

---

## Error Communication (CR-003)

All errors must follow the WHAT/WHY/HOW format:

```
WHAT: Brief description of what happened
WHY:  Explanation of why it happened
HOW:  Actionable steps to resolve
```

This applies to:
- System errors shown to users
- Communication of issues to Principal
- Documentation of problems

---

## Documentation Communication

| Document Type | Location | Purpose |
|---------------|----------|---------|
| Session Summary | `07_KNOWLEDGE_BASE/SESSION_SUMMARY.md` | Session continuity |
| Decision Registry | `01_DECISIONS/DECISION_REGISTRY.md` | Decision tracking |
| Phase Artifacts | `09_IMPLEMENTATION_ROADMAP/PHASE_ARTIFACTS/` | Lifecycle deliverables |
| Architecture | `02_ARCHITECTURE/` | Technical design |
| Specifications | `03_SPECIFICATIONS/` | Detailed requirements |

---

## Relationship to Stakeholder Registry

This protocol implements the communication patterns defined in P1-A02 (Stakeholder Registry):

- Principal as decision authority
- Executor as implementation agent
- Clear RACI responsibilities
- Defined escalation paths

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-27 | Created as reference document | Claude (AI) |

---

*P1-A06 Communication Reference v1.0 | Phase I Artifact | MCI Project*
