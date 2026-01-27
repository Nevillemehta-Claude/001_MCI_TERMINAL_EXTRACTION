# VERBATIM TABLES - COMPLETE EXTRACTION

**Source:** b8937bc2-ac10-4287-8ced-af96ac5f6f0b.jsonl
**Extraction Date:** 2026-01-25

---

## ALL MARKDOWN TABLES FROM SESSION


### TABLE 1

| Metric | Before | After |
|--------|--------|-------|
| Files with "autonomous" | 22 | 1 |
| Total occurrences | 123 | 7 |

---

### TABLE 2

| Issue | Before | After | Status |
|-------|--------|-------|--------|
| Q&A Entry Count | 11 | 16 | FIXED |
| 00_MASTER_DOCUMENTS file count | 12 | 10 | FIXED |
| Incorrectly listed files | 3 wrong files | Removed | FIXED |
| Missing file in list | `MCI_MASTER_USE_CASE_SPECIFICATION.html` | Added | FIXED |

---

### TABLE 3

| Batch Size | Total Batches | Thoroughness |
|------------|---------------|--------------|
| 10 lines | 158 batches | Maximum detail |
| 25 lines | 63 batches | High detail |
| 50 lines | 32 batches | Balanced |
| 100 lines | 16 batches | Efficient |

---

### TABLE 4

| Task | Status | Details |
|------|--------|---------|
| Document Classification | ✅ | Completed all 12 documents |
| Folder Reorganization | ✅ | Moved files to proper directories |
| MCI_COMPLETE_PROJECT_SYNTHESIS.md | ✅ | Created |
| MCI_INTERACTIVE_PROJECT_TREE.html | ✅ | Created with expand/collapse |
| MCI_MASTER_USE_CASE_SPECIFICATION | ✅ | Both .md and .html versions |
| MCI_MASTER_LIFECYCLE_CONTROL_MAP.html | ✅ | 220KB, 6 tabs, LTT |
| Q&A Knowledge System | ✅ | Q1-Q16 integrated |
| Forensic Verification | ⚠️ | Interrupted mid-check |

---

### TABLE 5

| Issue | Session 03 Finding | Current Status |
|-------|-------------------|----------------|
| Q&A header shows "11 Entries" | Found at L1571 | **FIXED** (now shows 16) |
| 00_MASTER_DOCUMENTS showed 12 files | Found in verification | **FIXED** (now shows 10) |
| 3 phantom files listed | IRONCLAD, KITE, Roadmap.html | **REMOVED** |

---

### TABLE 6

| Document | Location | Lines |
|----------|----------|-------|
| MCI_COMPLETE_PROJECT_SYNTHESIS.md | 00_MASTER_DOCUMENTS | ~300 |
| MCI_INTERACTIVE_PROJECT_TREE.html | 00_MASTER_DOCUMENTS | ~200 |
| MCI_MASTER_USE_CASE_SPECIFICATION.md | 00_MASTER_DOCUMENTS | ~400 |
| MCI_MASTER_USE_CASE_SPECIFICATION.html | 00_MASTER_DOCUMENTS | ~500 |
| MCI_MASTER_LIFECYCLE_CONTROL_MAP.html | 00_MASTER_DOCUMENTS | 4197 |

---

### TABLE 7

| Q# | Topic |
|----|-------|
| Q1 | Document Classification |
| Q2 | Folder Reorganization |
| Q3-4 | Project Structure |
| Q5-7 | Code Audit Findings |
| Q8-10 | Architecture Decisions |
| Q11-14 | LTT Design |
| Q15 | UI/UX Specification Fidelity |
| Q16 | 9-Tool Arsenal |

---

### TABLE 8

| Issue | Before | After |
|-------|--------|-------|
| Q&A Header | "11 Entries" | "16 Entries" |
| 00_MASTER_DOCUMENTS count | 12 files | 10 files |
| Phantom files | 3 listed | Removed |

---

### TABLE 9

| Component | Status |
|-----------|--------|
| LTT 5-Layer Structure | ✅ COMPLETE |
| Present/Ideal State Tabs | ✅ COMPLETE |
| Health Scorecard | ✅ COMPLETE |
| 49 Nodes with Status | ✅ COMPLETE |
| Sample Auth Flowchart | ✅ COMPLETE |
| **Full Backend Flowcharts** | ❌ **GAP (0%)** |
| **Full Frontend Flowcharts** | ❌ **GAP (0%)** |

---

### TABLE 10

| # | Diagram | Type |
|---|---------|------|
| **BACKEND (5)** | | |
| 2.1 | Authentication Sequence | Sequence Diagram |
| 2.2 | Ignition Sequence | Sequence Diagram |
| 2.3 | Telemetry Pipeline | Flowchart |
| 2.4 | Shutdown Sequence (CR-002) | Sequence Diagram |
| 2.5 | Backend State Machine | State Diagram |
| **FRONTEND (4)** | | |
| 2.6 | Component Hierarchy | Tree Diagram |
| 2.7 | State Management Flow | Flowchart |
| 2.8 | Phase Progression | Flow Diagram |
| 2.9 | User Interaction Flow | Flowchart |
| **INTEGRATION (4)** | | |
| 2.10 | API Contract | Endpoint Spec |
| 2.11 | WebSocket Events | Event Schema |
| 2.12 | Error Propagation (CR-003) | Flow Diagram |
| 2.13 | Data Flow Lifecycle | DFD |

---

### TABLE 11

| Section | Diagrams |
|---------|----------|
| **PART 1: LTT Design** | 1.1 Node Inventory (49 nodes), 1.2 Tree Structure, 1.3 Health Scorecard |
| **PART 2A: Backend** | 2.1 Auth Sequence, 2.2 Ignition, 2.3 Telemetry Pipeline, 2.4 Shutdown (CR-002), 2.5 State Machine |
| **PART 2B: Frontend** | 2.6 Component Hierarchy, 2.7 State Management, 2.8 Phase Progression, 2.9 User Interaction (CR-005) |
| **PART 2C: Integration** | 2.10 API Contract, 2.11 WebSocket Events, 2.12 Error Propagation (CR-003), 2.13 Data Flow Lifecycle |

---

### TABLE 12

| Component | What Happens |
|-----------|--------------|
| **Browser** | Reads the HTML file once, loads it into memory, renders it. Does NOT lock the file. |
| **My Edit** | Writes directly to the file on disk via the filesystem. |
| **Result** | File on disk = updated correctly. Browser = still showing old cached version. |

---

### TABLE 13

| Location | Contains | Safe to Delete? |
|----------|----------|-----------------|
| `~/.claude/` | Settings, sessions, project configs | ⚠️ PARTIAL - see below |
| `~/.claude/projects/` | **Conversation histories (JSONL files)** | ⚠️ THIS IS YOUR "MEMORY" |
| Project `.claude/` folders | Local project settings | ⚠️ Loses project-specific config |

---

### TABLE 14

| Action | Risk |
|--------|------|
| Delete `~/.claude/projects/*.jsonl` | **Lose all conversation history** |
| Delete `~/.claude/settings.json` | Lose preferences (minor) |
| Delete project `.claude/` folders | Lose project-specific memory |

---

### TABLE 15

| Item | Location |
|------|----------|
| **Session Archive** | `/Users/nevillemehta/Downloads/PROJECTS/01_MCI/SESSION_ARCHIVE_TAB7_SCHEMATICS_2026-01-24.md` |
| **Live Session JSONL** | `~/.claude/projects/-Users-nevillemehta/fd34613b-138c-4308-bda4-2a72dae89b53.jsonl` (~33MB) |
| **Updated HTML** | `00_MASTER_DOCUMENTS/MCI_MASTER_LIFECYCLE_CONTROL_MAP.html` (5,733 lines) |

---

### TABLE 16

| Status | Description |
|--------|-------------|
| **DONE** | 16 diagrams **DESIGNED** and **DISPLAYED** in HTML Tab 7 |
| **NOT DONE** | 13 architecture documents **DON'T EXIST** as standalone files |

---

### TABLE 17

| Reason | Explanation |
|--------|-------------|
| **The Constitution** | Supreme authority per project governance |
| **Defines CRs** | CR-001 to CR-005 that all architecture must comply with |
| **Defines Phases** | Phase 0-4 runtime behavior |
| **Defines Requirements** | What each component MUST do |

---

### TABLE 18

| Document | Purpose |
|----------|---------|
| `_MASTER_EXECUTION_ROADMAP_2026-01-22.md` | Execution sequence and gates |
| `SUPERVISED_MISSION_DIRECTIVE_v1.0.md` | Governance framework |
| `04_IMPLEMENTATION/mci/src/` | Existing code to document |

---

### TABLE 19

| Step | Subset | Purpose |
|------|--------|---------|
| **NOW** | Create 13 Architecture Docs | Fill Layer 2 gap |
| **NEXT** | Gate 2: Architecture Review | Principal approval |
| **THEN** | Architecture Audit | Compare code vs docs |
| **THEN** | Code Remediation (if needed) | Align code to architecture |
| **THEN** | Phase 6: Testing | Verify everything works |

---

### TABLE 20

| Step | Reason |
|------|--------|
| **Backend First** | Defines WHAT data exists |
| **Integration Second** | Defines HOW data is transmitted |
| **UI/UX Third** | Designs HOW data is DISPLAYED (needs to know what data exists) |
| **Frontend Fourth** | Documents HOW UI is BUILT (needs approved UI design) |

---

### TABLE 21

| Order | Step | Your Approval Needed? |
|-------|------|----------------------|
| 1 | Backend Architecture (5 docs) | Review |
| 2 | Integration Architecture (4 docs) | Review |
| 3 | **GATE 0.5: UI/UX Visual Design** | **YES - MANDATORY APPROVAL** |
| 4 | Frontend Architecture (4 docs) | Review |
| 5 | Gate 2: Full Architecture Approval | **YES - MANDATORY APPROVAL** |
| 6 | Implementation/Audit | Review |

---

### TABLE 22

| Your Command | My Action |
|--------------|-----------|
| "Proceed with Option A" | Begin reading Master Use Case, create Backend docs first |
| "Proceed with Option B" | Create UI/UX mockups for your approval first |
| "Rest" | Save session, stop work |
| Something else | Tell me what you want |

---

### TABLE 23

| # | TOOL | ROLE | USE FOR |
|---|------|------|---------|
| **7** | **CLAUDE CODE** ⭐ | Component Generation Engine | Bulk UI generation, Architecture docs, Code writing |
| **1** | **CLAUDE** | Strategist & Architect | Planning, Design patterns, Specifications |

---

### TABLE 24

| # | TOOL | ROLE | USE FOR |
|---|------|------|---------|
| **2** | **CURSOR** | Refinement & Debugging | Cmd+K refinements, Debug visual issues, Add missing states |
| **8** | **COWORK** | Parallel Execution (3x Speed) | Multi-agent builds, Parallel component generation |

---

### TABLE 25

| # | TOOL | ROLE | USE FOR |
|---|------|------|---------|
| **3** | **REPLIT** | Rapid Prototyping | Isolated experiments, Animation testing, Color validation |
| **4** | **VERCEL** | Staging & E2E Validation | Preview URLs, Visual regression, User approval gate |

---

### TABLE 26

| # | TOOL | ROLE | USE FOR |
|---|------|------|---------|
| **5** | **GITHUB** | Automation Backbone | CI/CD pipelines, Version control, Branch protection |
| **6** | **SENTRY** | Runtime Monitoring | Error tracking, Performance metrics, Session replay |
| **9** | **DOCKER** | Environment Parity | Consistent dev environments, Containerization |

---

### TABLE 27

| Document | Path | Purpose |
|----------|------|---------|
| **Constitution** | `00_MASTER_DOCUMENTS/MCI_MASTER_USE_CASE_SPECIFICATION.md` | CRs, Requirements |
| **Lifecycle Map** | `00_MASTER_DOCUMENTS/MCI_MASTER_LIFECYCLE_CONTROL_MAP.html` | Visual reference (7 tabs) |
| **Directive** | `00_MASTER_DOCUMENTS/SUPERVISED_MISSION_DIRECTIVE_v1.0.md` | Governance framework |
| **Synthesis** | `00_MASTER_DOCUMENTS/MCI_COMPLETE_PROJECT_SYNTHESIS.md` | Complete project overview |
| **Ecosystem** | `00_MASTER_DOCUMENTS/CIA-SIE_ECOSYSTEM_ARCHITECTURE.md` | System architecture |

---

### TABLE 28

| Document | Path |
|----------|------|
| CR-005 UXMI | `01_SOURCE_DOCUMENTS/ADDENDUM_002_UX_MICRO_INTERACTIONS.md` |
| UI Design System | `UI_UX_DESIGN_SYSTEM.md` |
| UI Functional Spec | `UI_FUNCTIONAL_SPECIFICATION.md` |
| Prototype Review | `PROTOTYPE_REVIEW.md` |

---

### TABLE 29

| Date | Archive |
|------|---------|
| 2026-01-20 | `MASTER_SESSION_ARCHIVE_2026-01-20.md` |
| 2026-01-21 | `SESSION_ARCHIVE_UI_SPECIFICATION_TREE_2026-01-21.md` |
| 2026-01-22 | `SESSION_ARCHIVE_MASTER_ROADMAP_2026-01-22.md` |
| 2026-01-23 | `SESSION_ARCHIVE_PHASE_3.5_REMEDIATION_2026-01-23.md` |
| 2026-01-24 | `SESSION_ARCHIVE_TAB7_SCHEMATICS_2026-01-24.md` |

---

### TABLE 30

| Tool | Can Create Diagrams? | Limitation |
|------|---------------------|------------|
| Claude Code | ✅ Text-based (Mermaid, ASCII) | Cannot create visual graphics files |
| Cursor | ✅ Text-based | Same as Claude Code |
| Cowork | ✅ Parallel text generation | Same limitation |
| Replit | ❌ Code prototyping | Not for diagrams |
| Vercel | ❌ Deployment | Not for creation |
| GitHub | ✅ **Renders Mermaid natively** | Display only, not creation |
| Docker | ❌ Infrastructure | Not relevant |
| Sentry | ❌ Monitoring | Not relevant |

---

### TABLE 31

| Tool | Type | Best For |
|------|------|----------|
| **Draw.io** | Free, VS Code integration | Technical flowcharts, exports PNG/SVG |
| **Lucidchart** | Paid, cloud-based | Enterprise architecture diagrams |
| **Figma** | Free tier available | UI mockups + flowcharts |
| **Miro** | Collaborative whiteboard | Team architecture sessions |

---

### TABLE 32

| Scenario | Best Approach |
|----------|---------------|
| **Speed + Good Enough** | Claude Code → Mermaid → GitHub renders |
| **Professional + Polished** | Claude Code → Spec → Draw.io → PNG/SVG |
| **Maximum Quality** | Add Figma/Lucidchart to arsenal |

---

### TABLE 33

| Option | Action |
|--------|--------|
| **A** | Proceed with Claude Code + Mermaid (fast, text-based, Git-friendly) |
| **B** | I generate specifications, you create visuals in Draw.io |
| **C** | Add a visual tool to your arsenal first, then proceed |

---

### TABLE 34

| Standard | What It Says | Your Approach |
|----------|--------------|---------------|
| **ISO/IEC 12207** | Software lifecycle must document tools per phase | ✅ Correct |
| **IEEE 1074** | Tool selection must be traceable to activities | ✅ Correct |
| **PMBOK** | Project tools must be catalogued with usage guidelines | ✅ Correct |
| **TOGAF** | Architecture tools must be mapped to deliverables | ✅ Correct |

---

### TABLE 35

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total Lines | 5,867 | 6,584 | **+717 lines** |
| Total Tabs | 7 | 8 | **+1 tab** |

---

### TABLE 36

| Tier | Category | Tools |
|------|----------|-------|
| 1 | Primary Development | Claude Code, Claude (Web), Cursor |
| 2 | Development Infrastructure | Replit, Docker, GitHub |
| 3 | Deployment & Validation | Vercel, Sentry |
| 4 | Session Orchestration | Cowork |

---

### TABLE 37

| Icon | Tool | Use For |
|------|------|---------|
| Arrow | Select | Moving objects |
| Hand | Pan | Navigating canvas |
| Marker | Draw | Freehand drawing |
| Shapes | **Shapes** | Flowchart boxes |
| Connector | **Lines** | Connecting boxes |
| Text | Text | Labels |
| Sticky | Sticky notes | Comments |
| Stamp | Stamps | Reactions |

---

### TABLE 38

| File | Location | Contents |
|------|----------|----------|
| BACKEND_FLOWCHARTS_MERMAID.md | `/01_MCI/04_ARCHITECTURE/` | 5 flowcharts with full code |

---

### TABLE 39

| Section | Flowcharts | CR Compliance |
|---------|------------|---------------|
| **BACKEND** | 5 diagrams | CR-001, CR-002, CR-004 |
| **FRONTEND** | 4 diagrams | CR-005 |
| **INTEGRATION** | 4 diagrams | CR-003 |
| **TOTAL** | **13 flowcharts** | All 5 CRs covered |

---

### TABLE 40

| Document | Size | Purpose |
|----------|------|---------|
| PROJECT_BRIEF_BCI_001.md | 146 KB | Original project brief - THE GENESIS |
| TECHNOLOGY_SELECTION_LIFECYCLE_SPECIFICATION.md | 34 KB | Golden State standards |
| ADDENDUM_001_TOKEN_CAPTURE_MODULE.md | 84 KB | Phase 0: Token Capture (6 modules) |
| ADDENDUM_002_UX_MICRO_INTERACTIONS.md | 90 KB | CR-005: UXMI specification |

---

### TABLE 41

| ID | Constraint | Enforcement |
|----|------------|-------------|
| CR-001 | Decision-Support, NOT Decision-Making | ZERO trading signal access |
| CR-002 | Expose Contradictions, NEVER Resolve | Display conflicting states |
| CR-003 | Descriptive AI, NOT Prescriptive AI | Observations only |
| CR-004 | Token Lifecycle Accuracy | **6:00 AM IST hardcoded** |
| CR-005 | User Experience Micro-Interactions | Seven States, Tooltips |

---

### TABLE 42

| Entity | Role | Responsibilities |
|--------|------|------------------|
| USER | Project Owner | Vision, decisions, approvals, constraints, daily token |
| COWORK (Claude Web) | Architect & Analyst | Requirements, specs, architecture, governance, audit |
| CLAUDE CODE (Local) | Implementer | Source code, file creation, testing, build, UXMI library |

---

### TABLE 43

| ID | Constraint | Enforcement Point | Verification |
|----|------------|-------------------|--------------|
| CR-001 | Decision-Support Only | guard.ts middleware | No trading API calls |
| CR-002 | Expose Contradictions | PositionsPanel.tsx | Side-by-side conflict |
| CR-003 | Descriptive AI Only | AILogPanel.tsx | No recommendations |
| CR-004 | Token Accuracy | TokenTimer.tsx | 6:00 AM IST hardcoded |
| CR-005 | UXMI Compliance | All components | Seven States, tooltips, errors |

---

### TABLE 44

| # | Document | Size | Purpose |
|---|----------|------|---------|
| 1 | ADDENDUM_001_TOKEN_CAPTURE_MODULE.md | 84 KB | Phase 0 spec |
| 2 | ADDENDUM_002_UX_MICRO_INTERACTIONS.md | 90 KB | CR-005 UXMI spec |
| 3 | CR-005_UXMI_RETROFIT_AUDIT_REPORT.md | 17 KB | Retrofit audit |
| 4 | MCI_PRODUCTION_LIFECYCLE_MASTER_MANIFEST.md | 55 KB | Master manifest |
| 5 | MASTER_SYNTHESIS_CIA-SIE_ECOSYSTEM.md | 18 KB | Ecosystem synthesis |
| 6 | PROJECT_STATUS_EXECUTION_AUTHORITY.md | THIS | Status & authority |
| 7 | FILE_INDEX.md (updated) | 12 KB | Project index |

---

### TABLE 45

| Phase | Status | Authority |
|-------|--------|-----------|
| 0: Genesis & Governance | ✅ COMPLETE | USER + COWORK |
| 1: Requirements & Specifications | ✅ COMPLETE | COWORK |
| 2: Architecture | ✅ COMPLETE | COWORK |
| 3: Audits & Governance | ✅ COMPLETE | COWORK |
| 4: Implementation | ⏳ PENDING | **CLAUDE CODE** |
| 5: Testing | ⏳ PENDING | **CLAUDE CODE** |
| 6: Deployment | ⏳ PENDING | USER + CLAUDE CODE |

---

### TABLE 46

| Role | Entity | Responsibility |
|------|--------|----------------|
| Project Owner | User | Final approval on ALL decisions |
| Architect | Cowork AI | Specs & design (completed) |
| Executor | Claude Code | Implementation UNDER supervision |
| Reviewer | User | Approval at EVERY checkpoint |

---

### TABLE 47

| Gate | Name | Sub-Checkpoints |
|------|------|-----------------|
| A | Project Initialization | 1 |
| B | Dependency Installation | 1 |
| C | Directory Structure | 1 |
| D | UXMI Component Library | 7 (D-1 to D-7) |
| E | Token Capture Module | 6 (E-1 to E-6) |
| F | Constitutional Guard | 1 (CRITICAL) |
| G | Dashboard Panels | 6 (G-1 to G-6) |
| H | Final Verification | 1 |

---

### TABLE 48

| Section | Content |
|---------|---------|
| 1 | Project Definition - Problem/Solution/Scope |
| 2 | Pre-Ignition Verification Protocol (PIVP) - <500ms, 14 checks |
| 3 | Anthropic Model Selection - 4 models, budget display |
| 4 | Sequential Ignition Protocol - 5 phases with progress bars |
| 5 | Mission Control Dashboard Design - 4 subsystem cards |
| 6 | Telemetry & Monitoring - Real-time metrics |
| 7 | Shutdown & Recovery Protocols - Graceful + Emergency |
| 8 | Visual Design Specifications - Dark theme, NASA-inspired |
| 9 | Creative Feature Enhancements - GO/NO-GO poll, MET, heartbeat |
| 10 | Technical Architecture - Web-based (FastAPI+HTML) recommended |
| 11 | Gold Standard Compliance - 12 stages, 10 gates |
| 12 | Acceptance Criteria - 20 functional, 8 non-functional, 7 constitutional |
| 13 | Authorization |

---

### TABLE 49

| Check | Status | Time |
|-------|--------|------|
| Port 8000 (Backend API) | CLEAR | 0.003s |
| Port 8001 (Health Monitor) | CLEAR | 0.002s |
| Existing uvicorn Process | NONE | 0.015s |
| Python Environment | VALID | 0.045s |
| Virtual Environment | ACTIVE | 0.012s |
| Database File | EXISTS | 0.001s |
| Disk Space | 45.2 GB | 0.008s |
| Available Memory | 8.4 GB | 0.005s |
| KITE_API_KEY | SET | 0.001s |
| KITE_API_SECRET | SET | 0.001s |
| ANTHROPIC_API_KEY | VALID | 0.002s |
| Kite Token File | EXISTS | 0.001s |
| Token Expiry Status | VALID 14h | 0.003s |

---

### TABLE 50

| Model | Badge | Cost (Input/Output) | Use Case |
|-------|-------|---------------------|----------|
| claude-3-5-sonnet-20241022 | RECOMMENDED | $3.00/$15.00 per 1M | Complex analysis |
| claude-3-opus-20240229 | MOST CAPABLE | $15.00/$75.00 per 1M | Most complex reasoning |
| claude-3-5-haiku-20241022 | FASTEST | $0.25/$1.25 per 1M | Quick queries |
| claude-3-haiku-20240307 | MOST ECONOMICAL | $0.25/$1.25 per 1M | High-volume |

---

### TABLE 51

| Card | Metrics |
|------|---------|
| FASTAPI | Port: 8000, Uptime: 2:45, Req/min: 12, Latency: 45ms |
| DATABASE | Size: 4.2 MB, Tables: 13, Queries: 847, Avg: 3ms |
| KITE ZERODHA | Token: VALID, Expiry: 14:22, User: NM****, Rate: OK |
| ANTHROPIC | Model: sonnet, Budget: $42.50, Calls: 23, Tokens: 12.4K |

---

### TABLE 52

| Component | Update Frequency | Data Source |
|-----------|------------------|-------------|
| Mission Status Banner | Real-time | Composite health |
| MET (Mission Elapsed Time) | 1 second | Local timer |
| Subsystem Cards (4) | 5 seconds | Health endpoints |
| Kite Token Countdown | **1 second** | Calculated from token |
| AI Budget Display | After each call | UsageTracker |
| Activity Log | Real-time | Event stream |
| Request/Latency Metrics | 5 seconds | Internal counters |

---

### TABLE 53

| Component | Poll Interval | Timeout | Failure Action |
|-----------|---------------|---------|----------------|
| FastAPI /health | 5 seconds | 3 seconds | Mark DEGRADED |
| Database SELECT 1 | 30 seconds | 5 seconds | Mark DEGRADED |
| Kite Token Expiry | **1 second** | N/A | Update countdown |
| Kite /user/profile | 5 minutes | 10 secs | Mark DEGRADED |
| Anthropic Ping | 5 minutes | 30 secs | Mark DEGRADED |
| System Resources | 30 seconds | N/A | Show warning |

---

### TABLE 54

| Level | Color | Trigger |
|-------|-------|---------|
| INFO | Blue | Normal events |
| SUCCESS | Green | Successful operations |
| WARNING | Amber | Token <2h, Budget >80%, Latency >1s |
| ERROR | Red | Component failure, Token expired |
| CRITICAL | Red+Pulse | Multiple failures, unrecoverable |

---

### TABLE 55

| Scenario | Detection | Recovery |
|----------|-----------|----------|
| Server crashed | Health check fail | Auto-restart |
| Database locked | Query timeout | Force reconnect |
| Kite token expired | 401 response | OAuth prompt |
| Anthropic rate limited | 429 response | Fallback model |
| Anthropic budget exceeded | Budget check | Fallback model |
| Port conflict | Bind failure | Kill or relocate |
| Memory exhaustion | psutil check | Graceful restart |

---

### TABLE 56

| Artifact | Format | Gate |
|----------|--------|------|
| C4 Level 1: System Context | Mermaid | Gate 3 |
| C4 Level 2: Container | Mermaid | Gate 3 |
| C4 Level 3: Component | Mermaid | Gate 3 |
| Pre-Ignition Screen Wireframe | Figma/HTML | Gate 4 |
| Model Selection Screen Wireframe | Figma/HTML | Gate 4 |
| Ignition Sequence Animation | Figma/HTML | Gate 4 |
| Operational Dashboard Wireframe | Figma/HTML | Gate 4 |
| Token Countdown States (4) | Figma/HTML | Gate 4 |
| Shutdown Sequence Wireframe | Figma/HTML | Gate 4 |
| Error/Recovery Wireframes | Figma/HTML | Gate 4 |
| System State Machine | Mermaid | Gate 4 |
| Kite Token State Machine | Mermaid | Gate 4 |
| Ignition Flowchart | Mermaid | Gate 4 |
| OAuth Flow Sequence | Mermaid | Gate 4 |
| Component Interaction | Mermaid | Gate 4 |

---

### TABLE 57

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + I | Ignite sequence |
| Ctrl/Cmd + S | Shutdown |
| Ctrl/Cmd + R | Refresh health |
| Ctrl/Cmd + L | Focus activity log |
| Ctrl/Cmd + E | Export diagnostics |
| Ctrl/Cmd + K | Re-authenticate Kite |
| Ctrl/Cmd + / | Show shortcuts |
| Escape | Cancel operation |

---

### TABLE 58

| Stage | Name | Key Deliverables |
|-------|------|------------------|
| I | GENESIS | Vision, feasibility, stakeholders |
| II | CONSTITUTION | MCI constitutional rules, prohibited features |
| III | ARCHITECTURE | C4 diagrams, ADRs, layer definitions |
| IV | SPECIFICATION | ICDs, state machines, wireframes |
| V | IMPLEMENTATION | Source code with constitutional markers |
| VI | VALIDATION | Unit, integration, E2E tests (90%+ coverage) |
| VII | INTEGRATION | MCI + CIA-SIE integration verification |
| VIII | VERIFICATION | Forensic audit, constitutional compliance |
| IX | RECONCILIATION | Variance accounting |
| X | REMEDIATION | HITL process, remediation log |
| XI | CERTIFICATION | Certification checklist, launch readiness |
| XII | OPERATION | Monitoring plan, incident procedures |

---

### TABLE 59

| ID | Criterion |
|----|-----------|
| AC-01 | Pre-ignition scan completes in <500ms |
| AC-02 | All 14 pre-ignition checks execute and display |
| AC-03 | Port conflicts detected with resolution options |
| AC-04 | Anthropic model selection with 4+ options |
| AC-05 | Model capabilities and cost displayed |
| AC-06 | Selected model persists to session |
| AC-07 | Ignition displays progress for all 5 phases |
| AC-08 | Each phase shows progress bar, status, timing |
| AC-09 | GO/NO-GO status for each subsystem |
| AC-10 | Abort sequence available during ignition |
| AC-11 | Kite OAuth opens browser and completes |
| AC-12 | **Token expiry countdown accurate to 6 AM IST (±1 minute)** |
| AC-13 | Re-auth prompt when token <2 hours |
| AC-14 | Anthropic budget with visual progress bar |
| AC-15 | MET counter visible and accurate |
| AC-16 | All 4 subsystem telemetry cards updating |
| AC-17 | Activity log captures all events |
| AC-18 | Graceful shutdown within 10 seconds |
| AC-19 | Emergency stop terminates immediately |
| AC-20 | Session state persists across restarts |

---

### TABLE 60

| ID | Criterion |
|----|-----------|
| NF-01 | Memory footprint <150MB |
| NF-02 | CPU usage <5% during idle |
| NF-03 | Startup time <3 seconds |
| NF-04 | Pre-ignition scan <500ms (target: <200ms) |
| NF-05 | UI updates at 60fps during animations |
| NF-06 | Works on macOS 12+ |
| NF-07 | Graceful degradation when APIs unavailable |
| NF-08 | Token expiry accurate across timezones |

---

### TABLE 61

| ID | Criterion |
|----|-----------|
| CC-01 | Zero access to trading signals or analysis |
| CC-02 | Zero access to database content beyond health |
| CC-03 | All messages descriptive, not prescriptive |
| CC-04 | No automated decision-making in error recovery |
| CC-05 | Constitutional markers in all source files |
| CC-06 | No conflict auto-resolution |
| CC-07 | **6 AM IST token rule correctly implemented** |

---

### TABLE 62

| Error Type | Recovery Action |
|------------|-----------------|
| Invalid URL format | Return to form, highlight input |
| Missing request_token | Return to form, explain what to copy |
| Token expired (60s limit) | Return to form, emphasize speed |
| Network error | Show retry button, check connection |
| API rate limit | Show countdown timer, auto-retry |
| Invalid credentials | Return to form, verify Kite account |
| Storage permission error | Warn but continue with in-memory |
| Verification failed | Restart entire sequence |

---

### TABLE 63

| UXMI Failure | Potential Consequence |
|--------------|----------------------|
| No loading indicator | User clicks again, duplicate action |
| Ambiguous button purpose | Wrong action taken |
| No error explanation | User cannot recover, abandons task |
| No disabled state explanation | User confused, wastes time |
| No keyboard navigation | Accessibility failure, exclusion |
| Jarring transitions | Disorientation, missed information |
| No success confirmation | Uncertainty, repeated actions |
| No progress indication | Assumes frozen, force-closes app |

---

### TABLE 64

| Element Type | Tooltip Content |
|--------------|-----------------|
| Button | Action description + keyboard shortcut |
| Input Field | Expected format + validation rules |
| Link | Destination + opens in new tab indicator |
| Icon Button | Action description (icons MUST have tooltips) |
| Toggle | Current state + what toggling will do |
| Disabled Element | WHY disabled + how to enable |
| Status Indicator | Detailed status + timestamp |
| Progress Bar | Percentage + estimated time remaining |

---

### TABLE 65

| Expected Duration | Warning At | Message |
|------------------|------------|---------|
| < 1 second | 3 seconds | "Taking longer than expected..." |
| 1-5 seconds | 10 seconds | "Still working. Network may be slow." |
| 5-30 seconds | 45 seconds | "This is taking longer than usual. [Retry]" |
| > 30 seconds | 60 seconds | "Operation may have stalled. [Retry] [Cancel]" |

---

### TABLE 66

| Element | Required ARIA |
|---------|---------------|
| Icon Button | aria-label="Description" |
| Loading State | aria-busy="true" |
| Disabled Element | aria-disabled="true" |
| Expandable | aria-expanded="true/false" |
| Progress Bar | aria-valuenow, aria-valuemin, aria-valuemax |
| Alert/Toast | role="alert", aria-live="polite" |
| Modal | role="dialog", aria-modal="true" |

---

### TABLE 67

| Animation Type | Duration | Easing |
|---------------|----------|--------|
| Hover effects | 150ms | ease-out |
| Button press | 100ms | ease-in-out |
| Focus ring | 150ms | ease-out |
| Tooltip appear | 150ms | ease-out |
| Modal open | 200ms | ease-out |
| Toast slide in | 200ms | ease-out |
| Expand/Collapse | 250ms | ease-in-out |
| Page transitions | 300ms | ease-in-out |
| Spinner rotation | 1000ms | linear (infinite) |

---

### TABLE 68

| # | Document | Lines | Status |
|---|----------|-------|--------|
| 1-16 | (Previous session) | Various | Complete |
| 17 | TECHNOLOGY_SELECTION_LIFECYCLE_SPECIFICATION.md | 908 | Complete |
| 18 | CLAUDE_CODE_SUPERVISED_MISSION_DIRECTIVE.pdf | 10 pages | Complete |
| 19 | MCI_MASTER_SPECIFICATION_v1.0.0.html | 1892 | Complete |
| 20 | PROTOTYPE_REVIEW.md | 1026 | Complete |

---

### TABLE 69

| # | Document | Lines | Status |
|---|----------|-------|--------|
| 1-16 | (Previous session) | Various | Complete |
| 17 | TECHNOLOGY_SELECTION_LIFECYCLE_SPECIFICATION.md | 908 | Complete |
| 18 | CLAUDE_CODE_SUPERVISED_MISSION_DIRECTIVE.pdf | 10 pages | Complete |
| 19 | MCI_MASTER_SPECIFICATION_v1.0.0.html | 1892 | Complete |
| 20 | PROTOTYPE_REVIEW.md | 1026 | Complete |
| 21 | UI_FUNCTIONAL_SPECIFICATION.md | 1073 | Complete |

---

### TABLE 70

| # | Document | Lines | Status |
|---|----------|-------|--------|
| 1-16 | (Previous session) | Various | Complete |
| 17 | TECHNOLOGY_SELECTION_LIFECYCLE_SPECIFICATION.md | 908 | Complete |
| 18 | CLAUDE_CODE_SUPERVISED_MISSION_DIRECTIVE.pdf | 10 pages | Complete |
| 19 | MCI_MASTER_SPECIFICATION_v1.0.0.html | 1892 | Complete |
| 20 | PROTOTYPE_REVIEW.md | 1026 | Complete |
| 21 | UI_FUNCTIONAL_SPECIFICATION.md | 1073 | Complete |
| 22 | UI_UX_DESIGN_SYSTEM.md | 944 | Complete |

---

### TABLE 71

| # | Document | Lines | Status |
|---|----------|-------|--------|
| 1-16 | (Previous session) | Various | Complete |
| 17 | TECHNOLOGY_SELECTION_LIFECYCLE_SPECIFICATION.md | 908 | Complete |
| 18 | CLAUDE_CODE_SUPERVISED_MISSION_DIRECTIVE.pdf | 10 pages | Complete |
| 19 | MCI_MASTER_SPECIFICATION_v1.0.0.html | 1892 | Complete |
| 20 | PROTOTYPE_REVIEW.md | 1026 | Complete |
| 21 | UI_FUNCTIONAL_SPECIFICATION.md | 1073 | Complete |
| 22 | UI_UX_DESIGN_SYSTEM.md | 944 | Complete |
| 23 | MCI_C4_ARCHITECTURE.html | 1549 | Complete |

---

### TABLE 72

| # | Document | Lines | Status |
|---|----------|-------|--------|
| 1-16 | (Previous session) | Various | Complete |
| 17 | TECHNOLOGY_SELECTION_LIFECYCLE_SPECIFICATION.md | 908 | Complete |
| 18 | CLAUDE_CODE_SUPERVISED_MISSION_DIRECTIVE.pdf | 10 pages | Complete |
| 19 | MCI_MASTER_SPECIFICATION_v1.0.0.html | 1892 | Complete |
| 20 | PROTOTYPE_REVIEW.md | 1026 | Complete |
| 21 | UI_FUNCTIONAL_SPECIFICATION.md | 1073 | Complete |
| 22 | UI_UX_DESIGN_SYSTEM.md | 944 | Complete |
| 23 | MCI_C4_ARCHITECTURE.html | 1549 | Complete |
| 24 | COMPLETE_EXECUTION_GUIDE.md | 1861 | Complete |

---

### TABLE 73

| Attribute | Value |
|-----------|-------|
| **Threat Level** | ☠️ MAXIMUM |
| **Color Code** | 🔴 RED / BLACK |
| **Reference Permission** | ABSOLUTELY NEVER |
| **Content Trust** | ZERO |
| **Contamination Scope** | 1,861 lines, 25 batches |
| **Quarantine Status** | PERMANENT |

---

### TABLE 74

| Batch | Lines | Count |
|-------|-------|-------|
| 1 | 1-75 | 75 lines |
| 2 | 76-142 | 67 lines |

---

### TABLE 75

| Tool | Role | Purpose |
|------|------|---------|
| 1. Claude | STRATEGIST & ARCHITECT | Strategy, planning, test design patterns |
| 2. Cursor | REFINEMENT & DEBUGGING | Rapid test refinement, inline editing |
| 3. Replit | RAPID PROTOTYPING | Isolated experimentation, validation |
| 4. Vercel | STAGING & E2E VALIDATION | Preview deployments, visual regression |
| 5. GitHub | AUTOMATION BACKBONE | CI/CD pipelines, GitHub Actions |
| 6. Sentry | RUNTIME VERIFICATION | Error tracking, performance monitoring |
| 7. Claude Code | TEST GENERATION ENGINE (80%) | Bulk test generation - PRIMARY TOOL |
| 8. Cowork | PARALLEL EXECUTION | Multi-agent simultaneous work |
| 9. Figma | DESIGN & PROTOTYPING | UI/UX, design systems, Dev Mode handoff |

---

### TABLE 76

| Type | Current | Target |
|------|---------|--------|
| Unit Tests | 43 | 92 |
| Integration Tests | 3 | 20 |
| E2E Tests | 0 | 10 |
| Mutation Tests | 0 | 5 |
| Fault Injection | 0 | 8 |
| Performance Tests | 0 | 3 |
| **TOTAL** | **43** | **138** |

---

### TABLE 77

|                                                                                                    |
|   SESSION CHECKPOINT                                                                               |
|   ==================                                                                               |
|                                                                                                    |
|   Project: MCI (Mission Control Interface)                                                         |
|   Location: /Users/nevillemehta/Downloads/PROJECTS/01_MCI                                          |
|   Date: 2026-01-24                                                                                 |
|   Session ID: DOCUMENT_INGESTION_SURGICAL_CORRECTION                                               |
|   Checkpoint ID: CHECKPOINT_28_DOCS_COMPLETE                                                       |
|                                                                                                    |

---

### TABLE 78

| Category | Count |
|----------|-------|
| **Valid Documents Ingested** | 28 |
| **Quarantined (Contaminated)** | 2 |
| **Total Processed** | 30 |

---

### TABLE 79

| Doc # | File | Lines | Key Content |
|-------|------|-------|-------------|
| 1-19 | (Previous session) | - | Pre-summary documents |
| 20 | PROTOTYPE_REVIEW.md | 1,026 | High-fidelity mockups, CR compliance |
| 21 | UI_FUNCTIONAL_SPECIFICATION.md | 1,073 | 5 screens, 4 modals, 12 scanner checks |
| 22 | UI_UX_DESIGN_SYSTEM.md | 944 | CSS properties, Tailwind config, typography |
| 23 | MCI_C4_ARCHITECTURE.html | 1,549 | C1-C3 diagrams, Token Capture 6-Module Flow |
| 26 | _IRONCLAD_SYSTEM_PREFIX.md | 142 | 8 rules, quality thresholds, triggers |
| 27 | _KITE_EXECUTION_GUIDE.md | 842 | **AUTHORITATIVE** - Replaces Doc 24, 47 requirements, Kite API |
| 28 | IRONCLAD_TOOL-ARSENAL_DEPLOYMENT_GUIDE.txt | ~500 | 9-tool arsenal, 6-phase deployment |
| 29 | IRONCLAD_DOCUMENT_PARSING_PROTOCOL.md | 288 | Three-pass verification, zero-tolerance |
| 30 | NASA_GRADE_TESTING_STRATEGY.txt | ~600 | 150% coverage target, 6-phase testing |

---

### TABLE 80

| CR | Requirement | Key Detail |
|----|-------------|------------|
| CR-001 | Decision-Support, NOT Decision-Making | ZERO trading signals |
| CR-002 | Expose Contradictions, NEVER Resolve | Side-by-side display |
| CR-003 | Descriptive AI, NOT Prescriptive AI | "Position is X" only |
| CR-004 | Token Lifecycle Accuracy | **6:00 AM IST SACRED** |
| CR-005 | UXMI 7-State Components | 300ms tooltip, WHAT/WHY/HOW |

---

### TABLE 81

|                                                                                                    |
|   CHECKPOINT COMPLETE                                                                              |
|                                                                                                    |
|   Valid Documents: 28                                                                              |
|   Quarantined: 2 (COMPLETE_EXECUTION_GUIDE.md, SECTION_N_SENTRY_OPERATIONS.md)                     |
|   Status: READY FOR CONTINUED INGESTION OR SYNTHESIS                                               |
|                                                                                                    |
|   Next Steps:                                                                                      |
|   1. Continue document ingestion (provide next path), OR                                           |
|   2. Begin synthesis and forensic analysis, OR                                                     |
|   3. Start surgical correction planning                                                            |
|                                                                                                    |

---

### TABLE 82

| Aspect | Specification | Implementation |
|--------|---------------|----------------|
| Token Expiry | **6:00 AM IST** | 24-hour countdown ❌ |
| File | Line 114 spec | `tokenStore.ts` Line 38 |
| Evidence | "6:00 AM IST is SACRED" | `24 * 60 * 60 * 1000` |

---

### TABLE 83

| Should Be | Currently Is |
|-----------|--------------|
| Zerodha Kite | Alpaca Markets ❌ |
| NSE/BSE (India) | NYSE/NASDAQ (US) ❌ |
| api.kite.trade | paper-api.alpaca.markets ❌ |
| Kite Access Token | Alpaca Key/Secret ❌ |

---

### TABLE 84

| Check | Component | Function | Critical |
|-------|-----------|----------|----------|
| SCAN-01 | Kite Token | validateToken() | ✅ |
| SCAN-02 | API Connectivity | pingKiteAPI() | ✅ |
| SCAN-03 | Market Status | getMarketStatus() | ✅ |
| SCAN-04 | ICICI Direct | pingBackend('icici') | ✅ |
| SCAN-05 | HDFC Sky | pingBackend('hdfc') | ✅ |
| SCAN-06 | Kotak Neo | pingBackend('kotak') | ✅ |
| SCAN-07 | Zerodha Kite | pingBackend('zerodha') | ✅ |
| SCAN-08 | Position Sync | checkPositionSync() | ⚠️ |
| SCAN-09 | Order Queue | checkOrderQueue() | ⚠️ |
| SCAN-10 | Claude AI | pingAnthropic() | ⚠️ |
| SCAN-11 | Time Sync | checkTimeSync() | ⚠️ |
| SCAN-12 | WebSocket | checkWebSocket() | ⚠️ |

---

### TABLE 85

| Requirement | Status | Notes |
|-------------|--------|-------|
| CR-001 | ✅ PASS | No trading buttons, guard middleware |
| CR-002 | ⚠️ PENDING | UI not yet implemented |
| CR-003 | ✅ PASS | No recommendations in AI output |
| CR-004 | ❌ FAIL | **24h countdown instead of 6:00 AM IST** |
| CR-005 | ✅ PASS | All 7 UXMI components specified |

---

### TABLE 86

| Category | Count |
|----------|-------|
| **Valid Documents Ingested** | 30 |
| **Quarantined (Contaminated)** | 2 |
| **Total Processed** | 32 |

---

### TABLE 87

| Technology | Function |
|------------|----------|
| **Multi-Head Attention** | Parallel processing of different semantic aspects simultaneously |
| **Positional Encoding** | Preserving document order and structure |
| **Layer Normalization** | Stabilizing information flow across deep layers |
| **Feedforward Networks** | Non-linear transformation and pattern detection |
| **Softmax Distribution** | Probabilistic weighting of all context |
| **Residual Connections** | Preserving original information through transformations |

---

### TABLE 88

| Capability | Method | Status |
|------------|--------|--------|
| **Hierarchical Decomposition** | Attention-based parsing | ✅ READY |
| **Entity Extraction** | Pattern matching + semantic understanding | ✅ READY |
| **Relationship Mapping** | Cross-document attention | ✅ READY |
| **Contradiction Detection** | Comparative analysis | ✅ READY |
| **Topological Sorting** | Dependency reasoning | ✅ READY |
| **Template Generation** | Structured output | ✅ READY |
| **Traceability Matrix** | Source-to-output linking | ✅ READY |

---

### TABLE 89

| Aspect | ONLY Reference |
|--------|----------------|
| Token Expiry | **6:00 AM IST** |
| Trading API | **Kite Connect** (api.kite.trade) |
| Brokers | **ICICI Direct, HDFC Sky, Kotak Neo, Zerodha Kite** |
| Market | **NSE/BSE (India)** |

---

### TABLE 90

| Layer | What I Will Populate |
|-------|---------------------|
| Layer 1: Knowledge Representation | Build actual Knowledge Graph nodes/edges from the document |
| Layer 2: Decomposition | Extract actual atomic facts, entities, relationships |
| Layer 3: Cross-Referencing | Build actual Traceability Matrix from the content |
| Layer 4: Synthesis Algorithms | Apply actual dependency ordering from the document |
| Layer 5: Output Generation | Populate templates with real MCI data |
| Layer 6: Complete Pipeline | Show the full pipeline with actual MCI content |

---

### TABLE 91

| Layer | Title | Understanding |
|-------|-------|---------------|
| 1 | Fundamental Truth | CIA-SIE-PURE = ENGINE, MCI = COCKPIT |
| 2 | Analogies | Dashboard monitors, doesn't drive |
| 3 | 5 Phases | Token → Scan → Ignition → Telemetry → Shutdown |
| 4 | 5 CRs | Token Validity, Graceful Shutdown, Error Format, 6AM Expiry, UXMI |
| 5 | Audit Findings | 97% compliant, 3 minor cosmetic fixes |
| 6 | The Decision | RETROFIT |
| 7 | Singular Purpose | Visibility and Control |

---

### TABLE 92

| Category | Count |
|----------|-------|
| Documentation | 55 |
| Source Code | 102 |
| Configuration | 18 |
| Generated/Build | 5 |
| **TOTAL** | **180** |

---

### TABLE 93

| Component | Lines | Key Feature |
|-----------|-------|-------------|
| Button.tsx | 117 | 7 states |
| Tooltip.tsx | 128 | 300ms delay |
| Input.tsx | 185 | Validation |
| Spinner.tsx | 67 | 3 sizes |
| ProgressBar.tsx | 147 | Animated fill |
| Toast.tsx | 200 | Auto-dismiss |
| ErrorDisplay.tsx | 261 | CR-003 WHAT/WHY/HOW |

---

### TABLE 94

| Store | Lines | Key Feature |
|-------|-------|-------------|
| tokenStore.ts | 296 | CR-004: **6AM IST**, Kite token |
| ignitionStore.ts | 320 | **4 Indian brokers** |
| scannerStore.ts | 312 | **12-point NSE/BSE checks** |
| shutdownStore.ts | 288 | CR-002: 6-step shutdown |
| telemetryStore.ts | 226 | Real-time positions |

---

### TABLE 95

| Route | Lines | Status |
|-------|-------|--------|
| auth.ts | 147 | CR-004, Kite API ✓ |
| ignition.ts | 196 | P2, 4 Indian brokers ✓ |
| shutdown.ts | 144 | CR-002, 6-step ✓ |
| telemetry.ts | 189 | **⚠️ NEEDS FIX: US symbols** |

---

### TABLE 96

| Metric | Value | Status |
|--------|-------|--------|
| Files Examined | 22 | Complete |
| Quality Rating | **97%** | Excellent |
| CR Compliance | **5/5 (100%)** | Full |
| Critical Defects | 0 | None |
| Minor Fixes | 3 | Cosmetic |

---

### TABLE 97

| Factor | Fresh Build | Retrofit | Winner |
|--------|-------------|----------|--------|
| Time to Production | HIGH | LOW | ✓ Retrofit |
| Risk of Regression | MEDIUM | LOW | ✓ Retrofit |
| Code Quality | N/A | 97% | ✓ Retrofit |
| CR Compliance | REBUILD | ALREADY MET | ✓ Retrofit |

---

### TABLE 98

| Metric | Value |
|--------|-------|
| Total Nodes | 49 |
| Complete | 34 |
| Architecture Gap | **13** |
| Minor Fixes | 2 |
| Overall Score | **69%** |
| Layers | 5 |

---

### TABLE 99

| Store | CR | State | Persist |
|-------|-----|-------|---------|
| tokenStore.ts | CR-001, CR-004 | token, isValid, expiresAt | localStorage |
| scannerStore.ts | - | checks[], isScanning, allPassed | none (ephemeral) |
| ignitionStore.ts | - | backend, isIgniting, sessionId | sessionStorage |
| telemetryStore.ts | - | positions[], orders[], health, pnl | none (real-time) |
| shutdownStore.ts | CR-002 | step (1-6), isShuttingDown, completed | - |

---

### TABLE 100

|                                                                                                    |
|   KNOWLEDGE SYNTHESIS FRAMEWORK                                                                    |
|   =============================                                                                    |
|                                                                                                    |
|   Project: MCI (Mission Control Interface)                                                         |
|   Location: /Users/nevillemehta/Downloads/PROJECTS/01_MCI                                          |
|   Document: MCI_MASTER_LIFECYCLE_CONTROL_MAP.html (6,585 lines)                                    |
|   Reading Completed: 2026-01-24 (132 batches @ 50 lines)                                           |
|                                                                                                    |

---
