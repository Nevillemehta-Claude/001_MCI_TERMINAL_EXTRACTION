# MCI CROSS-REFERENCE INDEX

**Source:** b8937bc2-ac10-4287-8ced-af96ac5f6f0b.jsonl
**Extraction Date:** 2026-01-25
**Purpose:** Enable navigation between related content

---

## TOPIC-TO-DOCUMENT MAPPING

### Constitutional Requirements (CR)

| Topic | Primary Document | Verbatim Source |
|-------|------------------|-----------------|
| CR-001 Token Validity | `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md` | `00_GOVERNANCE/VERBATIM_CR_DEFINITIONS.md` |
| CR-002 Graceful Shutdown | `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md` | `00_GOVERNANCE/VERBATIM_CR_DEFINITIONS.md` |
| CR-003 Error Format | `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md` | `00_GOVERNANCE/VERBATIM_CR_DEFINITIONS.md` |
| CR-004 Token Expiry | `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md` | `00_GOVERNANCE/VERBATIM_CR_DEFINITIONS.md` |
| CR-005 UXMI 7-States | `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md` | `00_GOVERNANCE/VERBATIM_CR_DEFINITIONS.md` |

### Runtime Phases

| Topic | Primary Document | Verbatim Source |
|-------|------------------|-----------------|
| Phase 0 Token Capture | `02_ARCHITECTURE/PHASE_0_TOKEN_CAPTURE/DESIGN.md` | `02_ARCHITECTURE/VERBATIM_DIAGRAMS.md` |
| Phase 1 Scanner | `02_ARCHITECTURE/PHASE_1_PRE_IGNITION/DESIGN.md` | `02_ARCHITECTURE/VERBATIM_DIAGRAMS.md` |
| Phase 2 Ignition | `02_ARCHITECTURE/PHASE_2_IGNITION/DESIGN.md` | `02_ARCHITECTURE/VERBATIM_DIAGRAMS.md` |
| Phase 3 Telemetry | `02_ARCHITECTURE/PHASE_3_TELEMETRY/DESIGN.md` | `02_ARCHITECTURE/VERBATIM_DIAGRAMS.md` |
| Phase 4 Shutdown | `02_ARCHITECTURE/PHASE_4_SHUTDOWN/DESIGN.md` | `02_ARCHITECTURE/VERBATIM_DIAGRAMS.md` |

### Components

| Topic | Primary Document | Verbatim Source |
|-------|------------------|-----------------|
| UXMI Library | `02_ARCHITECTURE/UXMI/COMPONENT_LIBRARY.md` | `04_IMPLEMENTATION/CODE_SNIPPETS/VERBATIM_CODE.md` |
| Zustand Stores | `04_IMPLEMENTATION/PATTERNS/IMPLEMENTATION_PATTERNS.md` | `04_IMPLEMENTATION/CODE_SNIPPETS/VERBATIM_CODE.md` |
| Server Routes | `03_SPECIFICATIONS/FEATURE_REGISTRY.md` | `04_IMPLEMENTATION/CODE_SNIPPETS/VERBATIM_CODE.md` |

### Decisions

| Topic | Primary Document | Verbatim Source |
|-------|------------------|-----------------|
| RETROFIT Decision | `01_DECISIONS/DECISION_REGISTRY.md` | `07_KNOWLEDGE_BASE/VERBATIM_EXTRACTIONS.md` |
| SUPERVISED Model | `01_DECISIONS/DECISION_REGISTRY.md` | `07_KNOWLEDGE_BASE/VERBATIM_EXTRACTIONS.md` |
| Technology Stack | `02_ARCHITECTURE/SYSTEM_OVERVIEW.md` | `07_KNOWLEDGE_BASE/VERBATIM_EXTRACTIONS.md` |

---

## VERBATIM CONTENT LOCATIONS

All verbatim (exact wording) content is preserved in:

| File | Content Type | Location |
|------|--------------|----------|
| VERBATIM_EXTRACTIONS.md | 20 spec-rich message blocks | `07_KNOWLEDGE_BASE/` |
| VERBATIM_CR_DEFINITIONS.md | Constitutional Requirements | `00_GOVERNANCE/` |
| VERBATIM_DIAGRAMS.md | ASCII architecture diagrams | `02_ARCHITECTURE/` |
| VERBATIM_CODE.md | Code snippets and interfaces | `04_IMPLEMENTATION/CODE_SNIPPETS/` |

---

## SOURCE LINE REFERENCES

Key content in source JSONL can be found at:

| Content | Approximate Location |
|---------|---------------------|
| Session start | Lines 1-50 |
| MCI Architecture | Messages 15-50 |
| CR Definitions | Messages 50-100 |
| Phase Descriptions | Messages 100-150 |
| UXMI Specifications | Messages 150-200 |
| Decisions | Messages 200-250 |
| Implementation Status | Messages 250-300 |

---

## CONCEPT-TO-CODE MAPPING

| Concept | Specification | Implementation |
|---------|---------------|----------------|
| Token Validity (CR-001) | `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md` | `tokenStore.ts:108` |
| 6-Step Shutdown (CR-002) | `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md` | `shutdownStore.ts:47-78` |
| WHAT/WHY/HOW (CR-003) | `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md` | `ErrorDisplay.tsx` |
| 6 AM IST Expiry (CR-004) | `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md` | `tokenStore.ts:49` |
| 7-State Components (CR-005) | `02_ARCHITECTURE/UXMI/COMPONENT_LIBRARY.md` | 7 UXMI component files |

---

## NAVIGATION AIDS

### By Topic
- **Governance** → Start at `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md`
- **Architecture** → Start at `02_ARCHITECTURE/SYSTEM_OVERVIEW.md`
- **Decisions** → Start at `01_DECISIONS/DECISION_REGISTRY.md`
- **Features** → Start at `03_SPECIFICATIONS/FEATURE_REGISTRY.md`
- **Code** → Start at `04_IMPLEMENTATION/PATTERNS/IMPLEMENTATION_PATTERNS.md`
- **Problems** → Start at `05_PROBLEMS_SOLVED/BUG_REGISTRY.md`
- **TODOs** → Start at `06_ACTION_ITEMS/TODOS.md`

### By Need
- **"What is MCI?"** → `07_KNOWLEDGE_BASE/SESSION_SUMMARY.md`
- **"What are the CRs?"** → `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md`
- **"How does Phase X work?"** → `02_ARCHITECTURE/PHASE_X_*/DESIGN.md`
- **"What decisions were made?"** → `01_DECISIONS/DECISION_REGISTRY.md`
- **"What's the exact wording?"** → `*/VERBATIM_*.md` files
- **"What's still TODO?"** → `06_ACTION_ITEMS/TODOS.md`
- **"What bugs were fixed?"** → `05_PROBLEMS_SOLVED/BUG_REGISTRY.md`
