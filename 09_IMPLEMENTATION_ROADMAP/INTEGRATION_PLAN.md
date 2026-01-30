# MCI INTEGRATION PLAN

**Document ID:** MCI-INTPLAN-2026-01-27  
**Version:** 1.2.0  
**Status:** ACTIVE  
**Classification:** IRONCLAD — SINGLE SOURCE OF TRUTH  
**Created:** January 27, 2026  
**Approver:** Neville Mehta

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Governing Lifecycle](#2-governing-lifecycle)
3. [Artifact-to-Phase Mapping](#3-artifact-to-phase-mapping)
4. [Gaps, Redundancies, Misalignments](#4-gaps-redundancies-misalignments)
5. [Housing Map](#5-housing-map)
6. [Transition Path to Phase I](#6-transition-path-to-phase-i)
7. [Activity Log](#7-activity-log)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Purpose

This document integrates the **Master Development Agenda (MDA)** — the NASA-grade, 8-phase systems engineering lifecycle — with the existing **MCI Terminal Extraction knowledge base**. It establishes:

- A **single governing lifecycle** for all MCI development
- **Explicit traceability** from artifacts to lifecycle phases
- A **canonical housing map** for all deliverables (docs, code, flowcharts, upgrades)
- A clear **transition path** to Phase I expansion

### 1.2 Integration Objectives

| Objective | Description |
|-----------|-------------|
| **Unified Lifecycle** | MDA governs; Briefing v2 8-phase SDLC is mapped into MDA |
| **Single Source of Truth** | All artifacts have one canonical location; no parallel tracks |
| **Full Traceability** | Every artifact → lifecycle phase (forward); every phase → artifacts (backward) |
| **Explicit Gaps** | 13 architecture gaps, LTT reconciliation, Gold Standard deviations documented |
| **Controlled Transition** | Phase I expansion only after alignment checklist approved |

### 1.3 Key References

| Reference | Location |
|-----------|----------|
| Master Development Agenda | User-provided in session (8 phases: I–VIII) |
| MCI Complete Development Briefing v2 | `09_IMPLEMENTATION_ROADMAP/MCI_COMPLETE_DEVELOPMENT_BRIEFING_v2.html` |
| Constitutional Constraints (CRs) | `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md` |
| Decision Registry | `01_DECISIONS/DECISION_REGISTRY.md` |
| Housing Map | Section 5 of this document |

---

## 2. GOVERNING LIFECYCLE

### 2.1 Master Development Agenda (MDA) — The Governing Framework

The MDA defines 8 phases for NASA-grade systems engineering:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    MASTER DEVELOPMENT AGENDA (MDA)                          │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ MDA Phase    │ Focus                                                        │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ Phase I      │ Mission Definition & System Boundaries                       │
│ Phase II     │ Requirements Decomposition (Top-Down)                        │
│ Phase III    │ System Architecture (Structural Intelligence)                │
│ Phase IV     │ Backend Engineering (Core Intelligence)                      │
│ Phase V      │ Frontend Systems & Visual Logic                              │
│ Phase VI     │ Annotation & Deep Traceability                               │
│ Phase VII    │ Integration, Cross-Verification & Loop Closure               │
│ Phase VIII   │ Release, Observability & Control                             │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

**Principle:** No phase advances without closure of the previous loop.

### 2.2 Briefing v2 SDLC — Mapped to MDA

The MCI Complete Development Briefing v2 defines an 8-phase SDLC. This is **not** a parallel framework; it is **mapped into** MDA:

| Briefing Phase | Briefing Name | Maps to MDA Phase | Status |
|----------------|---------------|-------------------|--------|
| Phase 1 | Requirements | Phase II | 100% |
| Phase 2 | Architecture | Phase III | 100% (flowcharts pending) |
| Phase 2.5 | UI/UX Validation | Phase V (subset) | NEW — 0% |
| Phase 3 | UI Design | Phase V | 100% |
| Phase 4 | Specifications | Phase II + III | RETROFIT — 0% |
| Phase 5 | Implementation | Phase IV + V | 97% |
| Phase 6 | Testing | Phase VII | 75% |
| Phase 7 | Deployment | Phase VIII | 80% |
| Phase 8 | Operations | Phase VIII | PENDING |

### 2.3 User Approval Gates

Three gates require explicit user (Neville) sign-off:

| Gate | When | Status |
|------|------|--------|
| Gate 1: UI Prototype Approval | After Phase 2.5 | NOT STARTED |
| Gate 2: Specifications Review | After Phase 4 | PENDING RETROFIT |
| Gate 3: Final Production Sign-off | After Phase 7 | NOT REACHED |

---

## 3. ARTIFACT-TO-PHASE MAPPING

### 3.1 Forward Mapping: Artifact → Phase

| Folder | Key Artifacts | MDA Phase | Briefing Phase |
|--------|---------------|-----------|----------------|
| `00_GOVERNANCE/` | CONSTITUTIONAL_CONSTRAINTS, CRs, LTT, checkpoints, protocols, quality gates | Phase I (Mission Definition) | Phase 1 |
| `01_DECISIONS/` | DECISION_REGISTRY | Phase I, II | Phase 1, 2 |
| `02_ARCHITECTURE/` | SYSTEM_OVERVIEW, phase designs (0–4), UXMI | Phase III | Phase 2 |
| `02_ARCHITECTURE/FLOWCHARTS/` | (13 flowcharts to be created) | Phase III | Phase 4 (Specs) |
| `03_SPECIFICATIONS/` | FEATURE_REGISTRY, API, scanner, shutdown | Phase II | Phase 1, 4 |
| `04_IMPLEMENTATION/` | Patterns, code snippets (docs only) | Phase IV | Phase 5 |
| `05_PROBLEMS_SOLVED/` | BUG_REGISTRY, error handling | Phase VI | Phase 5, 6 |
| `06_ACTION_ITEMS/` | TODOS | All phases | All |
| `07_KNOWLEDGE_BASE/` | MASTER_INDEX, glossary, verbatim extractions | Phase VI | N/A (meta) |
| `08_CERTIFICATION/` | EXTRACTION_CERTIFICATE, SOURCE_DISPOSITION | Phase VIII | Phase 7, 8 |
| `09_IMPLEMENTATION_ROADMAP/` | ROADMAP, QUICK_START, Briefing v2, INTEGRATION_PLAN | Phase I, VI | Phase 1, meta |
| `10_QA_EXCHANGES/` | COMPLETE_QA_CHRONICLE | Phase VI | N/A (meta) |
| `11_MCI_FORENSIC_AUDIT...` | Audit annotations | Phase VI | N/A (meta) |
| `12_APPLICATION_CODE/` | src/, tests, configs, CI/CD | Phase IV, V | Phase 5 |

### 3.2 Backward Mapping: Phase → Artifacts

| MDA Phase | Required Artifacts | Location |
|-----------|-------------------|----------|
| Phase I | Mission Definition Spec, CRs, LTT, Decision Registry | 00, 01, 09 |
| Phase II | SRS, Feature Registry, API specs | 03 |
| Phase III | Architecture Design Doc, 13 flowcharts | 02 |
| Phase IV | Backend code, Kite service, routes | 12_APPLICATION_CODE/src/server/ |
| Phase V | Frontend code, UXMI components, stores | 12_APPLICATION_CODE/src/client/ |
| Phase VI | Annotation ledger, traceability, knowledge base | 07, 10, 11 |
| Phase VII | Test suites, integration validation | 12_APPLICATION_CODE/src/__tests__/, e2e/ |
| Phase VIII | Deployment configs, monitoring, certification | 08, 12_APPLICATION_CODE/.github/ |

---

## 4. GAPS, REDUNDANCIES, MISALIGNMENTS

### 4.1 The 13 Architecture Gaps (Layer 2 = 0%)

These flowcharts must be created to close the gap from 69% to 100% LTT:

| Node | Document | Category | CR Impact | Priority | Tool |
|------|----------|----------|-----------|----------|------|
| 2.1 | Token Flow | Backend | CR-001, CR-004 | P1 | Eraser.io |
| 2.2 | Scanner Logic | Backend | Phase 1 | P1 | Eraser.io |
| 2.3 | Ignition Sequence | Backend | Phase 2 | P1 | Eraser.io |
| 2.4 | Telemetry Pipeline | Backend | Phase 3 | P1 | Eraser.io |
| 2.5 | Shutdown Sequence | Backend | CR-002 SACRED | **P0** | Eraser.io |
| 2.6 | Component Tree | Frontend | CR-005 | P2 | Mermaid |
| 2.7 | State Management | Frontend | Zustand | P2 | Mermaid |
| 2.8 | Routing Flow | Frontend | Navigation | P2 | Mermaid |
| 2.9 | UXMI States | Frontend | CR-005 SACRED | **P0** | v0/Vercel |
| 2.10 | API Contract | Integration | Backend↔Frontend | P2 | Eraser.io |
| 2.11 | WebSocket Events | Integration | Real-time | P2 | Mermaid |
| 2.12 | Error Propagation | Integration | CR-003 SACRED | **P0** | Eraser.io |
| 2.13 | Data Flow Lifecycle | Integration | End-to-End | P2 | Eraser.io |

**Flowchart destination:** `02_ARCHITECTURE/FLOWCHARTS/` (to be created)

### 4.2 LTT Percentage Reconciliation

| Source | LTT % | Definition |
|--------|-------|------------|
| QUICK_START.md, ROADMAP_v1.0 | 69% | 34/49 nodes complete |
| Briefing v2 HTML | 96% | Different calculation (may exclude Layer 2 or count differently) |

**Resolution:** Use **69%** as the authoritative figure. 13 gaps (Layer 2) = 0%. Once all 13 flowcharts are created, LTT = 100%.

### 4.3 Redundancies

| Artifact | Overlaps With | Resolution |
|----------|---------------|------------|
| ROADMAP_v1.0.md | QUICK_START.md | Both retained; QUICK_START is entry point, ROADMAP is detailed |
| ROADMAP_v1.0.md | Briefing v2 HTML | Both retained; Briefing is visual dashboard, ROADMAP is text reference |
| Phase designs in 02_ARCHITECTURE | Briefing v2 phases | Aligned; no action needed |

### 4.4 Misalignments (Quarantined Content)

| Item | Issue | Status |
|------|-------|--------|
| COMPLETE_EXECUTION_GUIDE.md | [Out-of-Scope-Broker]/[Out-of-Scope-Data-Provider] contamination | QUARANTINED — never reference |
| SECTION_N_SENTRY_OPERATIONS.md | [Out-of-Scope-Broker] contamination | QUARANTINED — never reference |
| Test files (various) | Still reference [Out-of-Scope-Broker]/[Out-of-Scope-Data-Provider]/paper/live | TO BE FIXED in 12_APPLICATION_CODE |
| telemetry.ts, TelemetryDashboard.tsx | US symbols (RELIANCE, TCS) | TO BE FIXED → RELIANCE, TCS |
| App.tsx footer | Wrong branding | TO BE FIXED |

### 4.5 Gold Standard Deviations

| Aspect | Gold Standard Expectation | MCI Current State | Gap |
|--------|--------------------------|-------------------|-----|
| Full SDLC before code | Specs → then Impl | Code first, specs retrofitted | RETROFIT underway |
| UI Prototype approval | Before implementation | Implemented in code | Phase 2.5 retrofitted |
| Flowchart documentation | Before architecture approval | 13 flowcharts missing | Layer 2 = 0% |
| Test coverage from specs | Tests written from specs | Tests written alongside code | Aligned, 75% coverage |

---

## 5. HOUSING MAP

### 5.1 Visual Project Tree (Annotated)

```
001_MCI_TERMINAL_EXTRACTION/
│
├── 00_GOVERNANCE/                          ─────────────────────────────────────────────────────────
│   ├── CONSTITUTIONAL_CONSTRAINTS.md       │ MDA Phase I: Mission Definition                       │
│   ├── VERBATIM_CR_DEFINITIONS.md          │ Contains: 5 Sacred CRs (CR-001 to CR-005)             │
│   ├── VERBATIM_LTT.md                     │ Contains: Lifecycle Traceability Tree (49 nodes)     │
│   ├── VERBATIM_CHECKPOINTS.md             │ Contains: Quality gates, protocols                    │
│   ├── VERBATIM_PROTOCOLS.md               │ Status: 100% COMPLETE                                 │
│   ├── VERBATIM_QUALITY_GATES.md           ─────────────────────────────────────────────────────────
│   └── VERBATIM_GOVERNANCE_COMPLETE.md
│
├── 01_DECISIONS/                           ─────────────────────────────────────────────────────────
│   ├── DECISION_REGISTRY.md                │ MDA Phase I + II                                      │
│   └── VERBATIM_DECISIONS_COMPLETE.md      │ Contains: All architectural decisions                 │
│                                           │ Status: 100% COMPLETE                                 │
│                                           ─────────────────────────────────────────────────────────
│
├── 02_ARCHITECTURE/                        ─────────────────────────────────────────────────────────
│   ├── SYSTEM_OVERVIEW.md                  │ MDA Phase III: System Architecture                    │
│   ├── PHASE_0_TOKEN_CAPTURE/              │ Contains: Phase designs (0-4), UXMI, tech stack       │
│   │   └── DESIGN.md                       │ Status: 100% COMPLETE (but...)                        │
│   ├── PHASE_1_PRE_IGNITION/               │                                                       │
│   │   └── DESIGN.md                       │  ⚠️  CRITICAL GAP: Layer 2 = 0%                       │
│   ├── PHASE_2_IGNITION/                   │      13 flowcharts MISSING (see FLOWCHARTS/)          │
│   │   └── DESIGN.md                       ─────────────────────────────────────────────────────────
│   ├── PHASE_3_TELEMETRY/
│   │   └── DESIGN.md
│   ├── PHASE_4_SHUTDOWN/
│   │   └── DESIGN.md
│   ├── UXMI/
│   │   ├── COMPONENT_LIBRARY.md
│   │   ├── VERBATIM_STATES.md
│   │   └── VERBATIM_UXMI_COMPLETE.md
│   ├── VERBATIM_*.md (various)
│   │
│   └── FLOWCHARTS/                         ─────────────────────────────────────────────────────────
│       │                                   │ ⚠️  TO BE CREATED — 13 DOCUMENTS                      │
│       ├── [2.1] Token_Flow.md             │ Priority:                                             │
│       ├── [2.2] Scanner_Logic.md          │   P0 (SACRED): 2.5, 2.9, 2.12                         │
│       ├── [2.3] Ignition_Sequence.md      │   P1: 2.1, 2.2, 2.3, 2.4                              │
│       ├── [2.4] Telemetry_Pipeline.md     │   P2: 2.6, 2.7, 2.8, 2.10, 2.11, 2.13                 │
│       ├── [2.5] Shutdown_Sequence.md  ◀── │ CR-002 SACRED                                         │
│       ├── [2.6] Component_Tree.md         │                                                       │
│       ├── [2.7] State_Management.md       │ LTT: 69% → 100% when all 13 done                      │
│       ├── [2.8] Routing_Flow.md           ─────────────────────────────────────────────────────────
│       ├── [2.9] UXMI_States.md        ◀── CR-005 SACRED
│       ├── [2.10] API_Contract.md
│       ├── [2.11] WebSocket_Events.md
│       ├── [2.12] Error_Propagation.md ◀── CR-003 SACRED
│       └── [2.13] Data_Flow_Lifecycle.md
│
├── 03_SPECIFICATIONS/                      ─────────────────────────────────────────────────────────
│   ├── FEATURE_REGISTRY.md                 │ MDA Phase II: Requirements Decomposition              │
│   ├── VERBATIM_API.md                     │ Contains: Features, API specs, scanner, shutdown      │
│   ├── VERBATIM_LISTS.md                   │ Status: RETROFIT in progress (specs from code)        │
│   ├── VERBATIM_SCANNER.md                 ─────────────────────────────────────────────────────────
│   ├── VERBATIM_SHUTDOWN.md
│   ├── VERBATIM_TABLES.md
│   └── VERBATIM_SPECIFICATIONS_COMPLETE.md
│
├── 04_IMPLEMENTATION/                      ─────────────────────────────────────────────────────────
│   ├── PATTERNS/                           │ MDA Phase IV + V (DOCS ONLY)                          │
│   │   └── IMPLEMENTATION_PATTERNS.md      │ Contains: Patterns, code snippets (reference)         │
│   ├── CODE_SNIPPETS/                      │ ⚠️  NOT runnable code — docs only                     │
│   │   └── VERBATIM_CODE.md                │ Actual code lives in 12_APPLICATION_CODE/             │
│   ├── VERBATIM_FILE_REFERENCES.md         ─────────────────────────────────────────────────────────
│   └── VERBATIM_IMPLEMENTATION_COMPLETE.md
│
├── 05_PROBLEMS_SOLVED/                     ─────────────────────────────────────────────────────────
│   ├── BUG_REGISTRY.md                     │ MDA Phase VI: Annotation & Traceability               │
│   ├── VERBATIM_ERROR_HANDLING.md          │ Contains: Bugs fixed, error handling patterns         │
│   └── VERBATIM_PROBLEMS_COMPLETE.md       │ Status: 100% COMPLETE                                 │
│                                           ─────────────────────────────────────────────────────────
│
├── 06_ACTION_ITEMS/                        ─────────────────────────────────────────────────────────
│   └── TODOS.md                            │ ALL PHASES                                            │
│                                           │ Contains: Pending, completed, future tasks            │
│                                           ─────────────────────────────────────────────────────────
│
├── 07_KNOWLEDGE_BASE/                      ─────────────────────────────────────────────────────────
│   ├── MASTER_INDEX.md                     │ MDA Phase VI: Deep Traceability (META)                │
│   ├── CROSS_REFERENCE.md                  │ Contains: Index, glossary, verbatim extractions       │
│   ├── GLOSSARY.md                         │ Status: 100% COMPLETE                                 │
│   ├── SESSION_SUMMARY.md                  ─────────────────────────────────────────────────────────
│   └── VERBATIM_*.md (various)
│
├── 08_CERTIFICATION/                       ─────────────────────────────────────────────────────────
│   ├── EXTRACTION_CERTIFICATE.md           │ MDA Phase VIII: Release & Control                     │
│   └── SOURCE_DISPOSITION.md               │ Contains: Extraction completeness, source auth        │
│                                           │ Status: IRONCLAD CERTIFIED                            │
│                                           ─────────────────────────────────────────────────────────
│
├── 09_IMPLEMENTATION_ROADMAP/              ─────────────────────────────────────────────────────────
│   ├── ROADMAP_v1.0.md                     │ MDA Phase I + VI (PLANNING)                           │
│   ├── QUICK_START.md                      │ Contains: Roadmap, briefing, integration plan         │
│   ├── 00_ANNOTATED_FILE_GUIDE.md          │                                                       │
│   ├── MCI_COMPLETE_DEVELOPMENT_           │ ★ INTEGRATION_PLAN.md ← YOU ARE HERE                  │
│   │     BRIEFING_v2.html                  │   (Single source of truth for integration)            │
│   └── INTEGRATION_PLAN.md  ◀──────────────┤                                                       │
│                                           ─────────────────────────────────────────────────────────
│
├── 10_QA_EXCHANGES/                        ─────────────────────────────────────────────────────────
│   ├── COMPLETE_QA_CHRONICLE.html          │ MDA Phase VI (META)                                   │
│   └── COMPLETE_QA_CHRONICLE.md            │ Contains: All Q&A from sessions                       │
│                                           ─────────────────────────────────────────────────────────
│
├── 11_MCI_FORENSIC_AUDIT.../               ─────────────────────────────────────────────────────────
│   ├── MCI_FORENSIC_AUDIT_ANNOTATED.md     │ MDA Phase VI (META)                                   │
│   └── ...ANNOTATED.html                   │ Contains: Forensic audit of code transfer             │
│                                           ─────────────────────────────────────────────────────────
│
└── 12_APPLICATION_CODE/                    ═════════════════════════════════════════════════════════
    │                                       ║ MDA Phase IV + V: THE ACTUAL APPLICATION              ║
    │                                       ║ ★ ALL CODE, UPGRADES, REPAIRS HAPPEN HERE             ║
    │                                       ═════════════════════════════════════════════════════════
    │
    ├── src/
    │   ├── client/                         ─────────────────────────────────────────────────────────
    │   │   ├── components/                 │ FRONTEND (React)                                      │
    │   │   │   ├── phase0/                 │ Contains: 5 phase components + UXMI library           │
    │   │   │   ├── phase1/                 │ Status: 97% complete                                  │
    │   │   │   ├── phase2/                 │                                                       │
    │   │   │   ├── phase3/                 │ ⚠️  TO FIX: US symbols → Indian symbols               │
    │   │   │   ├── phase4/                 │ ⚠️  TO FIX: USD → INR currency                        │
    │   │   │   └── uxmi/                   │ ⚠️  TO FIX: App.tsx footer text                       │
    │   │   │       ├── Button.tsx          ─────────────────────────────────────────────────────────
    │   │   │       ├── Input.tsx
    │   │   │       ├── Toast.tsx
    │   │   │       ├── Tooltip.tsx
    │   │   │       ├── Spinner.tsx
    │   │   │       ├── ProgressBar.tsx
    │   │   │       └── ErrorDisplay.tsx
    │   │   ├── stores/                     │ Zustand state management
    │   │   ├── lib/
    │   │   ├── App.tsx
    │   │   └── main.tsx
    │   │
    │   ├── server/                         ─────────────────────────────────────────────────────────
    │   │   ├── routes/                     │ BACKEND (Hono + Bun)                                  │
    │   │   │   ├── auth.ts                 │ Contains: API routes, Kite service                    │
    │   │   │   ├── scan.ts                 │ Status: 97% complete                                  │
    │   │   │   ├── ignition.ts             │                                                       │
    │   │   │   ├── telemetry.ts            │ ⚠️  TO FIX: US symbols → Indian symbols               │
    │   │   │   └── shutdown.ts             ─────────────────────────────────────────────────────────
    │   │   ├── services/
    │   │   │   └── kite.ts
    │   │   └── index.ts
    │   │
    │   └── shared/
    │       └── types.ts
    │
    ├── e2e/                                ─────────────────────────────────────────────────────────
    │   └── mci.spec.ts                     │ E2E TESTS (Playwright)                                │
    │                                       │ ⚠️  TO FIX: [Out-of-Scope-Broker]/[Out-of-Scope-Data-Provider] refs → Kite                │
    │                                       ─────────────────────────────────────────────────────────
    │
    ├── .github/workflows/                  ─────────────────────────────────────────────────────────
    │   ├── ci.yml                          │ CI/CD (GitHub Actions)                                │
    │   ├── deploy.yml                      │ Status: 100% complete                                 │
    │   └── pr-checks.yml                   ─────────────────────────────────────────────────────────
    │
    ├── package.json
    ├── vite.config.ts
    ├── vitest.config.ts
    └── [other configs]
```

### 5.2 Legend & Key Relationships

```
═══════════════════════════════════════════════════════════════════════════════════════════════════
                                    LEGEND & KEY RELATIONSHIPS
═══════════════════════════════════════════════════════════════════════════════════════════════════

     ★  = Current focus / Single source of truth
    ◀── = SACRED (CR-linked, highest priority)
     ⚠️  = Action required / Gap to close

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    USER APPROVAL GATES                                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Gate 1: UI Prototype Approval        → After Phase 2.5 (UI/UX Validation)       [NOT STARTED] │
│  Gate 2: Specifications Review        → After Phase 4 (Specifications)           [PENDING]     │
│  Gate 3: Final Production Sign-off    → After Phase 7 (Deployment)               [NOT REACHED] │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    QUARANTINED (NEVER USE)                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ☠️  COMPLETE_EXECUTION_GUIDE.md        — [Out-of-Scope-Broker]/[Out-of-Scope-Data-Provider] contamination                         │
│  ☠️  SECTION_N_SENTRY_OPERATIONS.md     — [Out-of-Scope-Broker] contamination                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    LTT HEALTH SCORECARD                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Layer 1 (Governance)      : 100%  ████████████████████                                         │
│  Layer 2 (Architecture)    :   0%  ░░░░░░░░░░░░░░░░░░░░  ← 13 flowcharts needed                │
│  Layer 3 (Specifications)  : 100%  ████████████████████                                         │
│  Layer 4 (Implementation)  :  97%  ███████████████████░                                         │
│  Layer 5 (Testing)         :  75%  ███████████████░░░░░                                         │
│  Layer 6 (Deployment)      :  80%  ████████████████░░░░                                         │
│  ─────────────────────────────────────────────────────────                                      │
│  OVERALL LTT               :  69%  → 100% when Layer 2 complete                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    MDA → FOLDER MAPPING                                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Phase I   (Mission Definition)     → 00_GOVERNANCE, 01_DECISIONS, 09_ROADMAP                   │
│  Phase II  (Requirements)           → 03_SPECIFICATIONS                                         │
│  Phase III (Architecture)           → 02_ARCHITECTURE (+ FLOWCHARTS to create)                  │
│  Phase IV  (Backend)                → 12_APPLICATION_CODE/src/server/                           │
│  Phase V   (Frontend)               → 12_APPLICATION_CODE/src/client/                           │
│  Phase VI  (Annotation)             → 05, 07, 10, 11                                            │
│  Phase VII (Integration/Testing)    → 12_APPLICATION_CODE/e2e/, src/__tests__/                  │
│  Phase VIII (Release/Ops)           → 08_CERTIFICATION, 12_APPLICATION_CODE/.github/            │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Canonical Locations (Table Format)

**Root:** `/Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION`

| Category | Canonical Path | What Lives There |
|----------|----------------|------------------|
| **Governance** | `00_GOVERNANCE/` | CRs, LTT, checkpoints, protocols, quality gates |
| **Decisions** | `01_DECISIONS/` | DECISION_REGISTRY, verbatim decisions |
| **Architecture** | `02_ARCHITECTURE/` | SYSTEM_OVERVIEW, phase designs, UXMI, verbatim arch docs |
| **Flowcharts (to be created)** | `02_ARCHITECTURE/FLOWCHARTS/` | 2.1–2.13 architecture flowcharts |
| **Specifications** | `03_SPECIFICATIONS/` | Feature registry, API, scanner, shutdown specs |
| **Implementation patterns** | `04_IMPLEMENTATION/` | Patterns, code snippets (docs only, NOT runnable code) |
| **Problems solved** | `05_PROBLEMS_SOLVED/` | Bug registry, error handling docs |
| **Action items** | `06_ACTION_ITEMS/` | TODOS.md |
| **Knowledge base** | `07_KNOWLEDGE_BASE/` | Master index, glossary, verbatim extractions |
| **Certification** | `08_CERTIFICATION/` | Extraction certificate, source disposition |
| **Roadmap & planning** | `09_IMPLEMENTATION_ROADMAP/` | ROADMAP, QUICK_START, Briefing v2, **this INTEGRATION_PLAN** |
| **QA exchanges** | `10_QA_EXCHANGES/` | Complete Q&A chronicle |
| **Forensic audit** | `11_MCI_FORENSIC_AUDIT...` | Audit annotations |
| **Application code** | `12_APPLICATION_CODE/` | **The actual MCI application: src/, tests, configs, CI/CD** |

### 5.4 Application Code Structure

```
12_APPLICATION_CODE/
├── src/
│   ├── client/          ← React frontend (components, stores, lib)
│   ├── server/          ← Hono backend (routes, services)
│   └── shared/          ← Shared types
├── e2e/                 ← Playwright E2E tests
├── .github/workflows/   ← CI/CD (ci.yml, deploy.yml, pr-checks.yml)
├── package.json         ← Dependencies
├── vite.config.ts       ← Build config
├── vitest.config.ts     ← Test config
└── [other configs]
```

### 5.5 Invariants

| Category | Where It Lives | Never Lives Elsewhere |
|----------|---------------|----------------------|
| All runnable code, upgrades, repairs | `12_APPLICATION_CODE/` | Not in 04_IMPLEMENTATION (docs only) |
| All new flowcharts | `02_ARCHITECTURE/FLOWCHARTS/` | Not scattered in 09_IMPLEMENTATION_ROADMAP |
| All planning docs | `09_IMPLEMENTATION_ROADMAP/` | Not in 00_GOVERNANCE (reserved for CRs/LTT) |
| This integration plan | `09_IMPLEMENTATION_ROADMAP/INTEGRATION_PLAN.md` | Single authoritative location |

### 5.6 Gold Standard Reference

**Location:** `/Users/nevillemehta/Downloads/PROJECTS/02_CIA-SIE-PURE/01_GOLD_STANDARD`

**Usage:** Reference baseline only. **No MCI deliverables are written into it.** Used to calibrate lifecycle phases and artifact types.

---

## 6. TRANSITION PATH TO PHASE I

### 6.1 Prerequisites for Phase I Expansion

Before expanding MDA Phase I (Mission Definition & System Boundaries) in full depth:

| # | Prerequisite | Status | Verification |
|---|--------------|--------|--------------|
| 1 | Integration plan approved | PENDING | This document signed off by Neville |
| 2 | Housing map agreed | PENDING | Section 5 confirmed as canonical |
| 3 | 13 gaps acknowledged | DONE | Section 4.1 lists all 13 |
| 4 | LTT % reconciled | DONE | 69% is authoritative (Section 4.2) |
| 5 | Quarantined content confirmed | DONE | Section 4.4 lists items |
| 6 | Gold Standard reviewed | PENDING | 01_GOLD_STANDARD to be read in full |

### 6.2 Alignment Checklist

| Item | Question | Answer |
|------|----------|--------|
| Governing lifecycle | MDA or Briefing? | **MDA governs; Briefing maps into it** |
| Artifact housing | Single or multiple locations? | **Single canonical location per category** |
| Code location | Where do upgrades/repairs go? | **`12_APPLICATION_CODE/` only** |
| Flowchart location | Where do 13 new flowcharts go? | **`02_ARCHITECTURE/FLOWCHARTS/`** |
| Approval gates | Who approves? | **Neville at 3 gates** |

### 6.3 Transition Gate

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   TRANSITION GATE: INTEGRATION PLAN → PHASE I EXPANSION                     │
│                                                                              │
│   Condition:   All prerequisites in 6.1 marked DONE                         │
│   Approver:    Neville Mehta                                                 │
│   Sign-off:    _____________________________ Date: ___________              │
│                                                                              │
│   Once approved, proceed to Phase I expansion with full depth.              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.4 Phase I Expansion Scope

Upon approval, Phase I will produce:

| Deliverable | Description | Location |
|-------------|-------------|----------|
| Mission Definition Specification (MDS) | Primary mission, secondary objectives, scope containment | `00_GOVERNANCE/` or `09_IMPLEMENTATION_ROADMAP/` |
| Stakeholder & Actor Enumeration | Human users, machine actors, external systems | Same |
| System Boundary Diagram | Inputs, outputs, control signals, failure interfaces | `02_ARCHITECTURE/` |

---

## 7. ACTIVITY LOG

### 7.1 This Session (January 27, 2026)

| # | Date/Time | Activity | Output | Location | After-effect |
|---|-----------|----------|--------|----------|--------------|
| 1 | 2026-01-27 | Read MCI_COMPLETE_DEVELOPMENT_BRIEFING_v2.html in batches | Ingested 1,104 lines; understood 8-phase SDLC, 13 gaps, retrofit, UI/UX validation, 3 approval gates | Session context | Enabled alignment of MDA with existing artifacts |
| 2 | 2026-01-27 | Confirmed quarantined content | Listed COMPLETE_EXECUTION_GUIDE, SECTION_N_SENTRY_OPERATIONS, [Out-of-Scope-Broker]/[Out-of-Scope-Data-Provider] refs | Session context | No contaminated references will be used |
| 3 | 2026-01-27 | Created NASA-grade plan | Housing map, artifact mapping, after-effects | `.cursor/plans/` | Defined structure for INTEGRATION_PLAN |
| 4 | 2026-01-27 | Created INTEGRATION_PLAN.md | This document | `09_IMPLEMENTATION_ROADMAP/INTEGRATION_PLAN.md` | Single source of truth for integration, housing, gaps, transition |

### 7.1b Implementation Verification (January 29, 2026)

| # | Date/Time | Activity | Output | Location | After-effect |
|---|-----------|----------|--------|----------|--------------|
| 5 | 2026-01-29 | Implement plan as specified | Verified all 7 sections present and complete | `09_IMPLEMENTATION_ROADMAP/INTEGRATION_PLAN.md` | Plan implementation confirmed; Housing Map (5), Artifact-to-Phase Mapping (3), Gaps (4), Transition Path (6), Activity Log (7) all embedded |
| 6 | 2026-01-29 | Activity Log update | Added 7.1b verification entries | Same file | Audit trail extended for implementation verification |

### 7.2 Future Activities (Template)

| # | Date/Time | Activity | Output | Location | After-effect |
|---|-----------|----------|--------|----------|--------------|
| 5 | TBD | Review 01_GOLD_STANDARD in full | Gold Standard deviation report | Section 4.5 update | Calibration complete |
| 6 | TBD | Approve INTEGRATION_PLAN | Sign-off at Section 6.3 | This document | Phase I expansion unblocked |
| 7 | TBD | Expand Phase I | Mission Definition Specification | `00_GOVERNANCE/` or `09_IMPLEMENTATION_ROADMAP/` | MDA Phase I complete |
| 8 | TBD | Create 13 flowcharts | 2.1–2.13 docs | `02_ARCHITECTURE/FLOWCHARTS/` | LTT 69% → 100% |
| 9 | TBD | Apply cosmetic fixes | Code changes | `12_APPLICATION_CODE/src/` | Symbols, footer corrected |
| 10 | TBD | Update test files | Code changes | `12_APPLICATION_CODE/src/__tests__/`, `e2e/` | [Out-of-Scope-Broker] refs removed |

---

## DOCUMENT CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-27 | Claude (Supervised) | Initial creation |
| 1.1.0 | 2026-01-27 | Claude (Supervised) | Added visual project tree with annotations (Section 5.1), legend & key relationships (Section 5.2), LTT health scorecard, MDA→folder mapping |
| 1.2.0 | 2026-01-29 | Claude (Supervised) | Implementation verification: added Activity Log 7.1b (2026-01-29), confirmed all 7 sections present and complete per plan |

---

**End of Integration Plan**

*Awaiting Neville's approval to proceed to Phase I expansion.*
