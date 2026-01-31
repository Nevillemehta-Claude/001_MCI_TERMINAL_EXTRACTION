# VERBATIM SHUTDOWN CONTENT - COMPLETE EXTRACTION

**Source:** b8937bc2-ac10-4287-8ced-af96ac5f6f0b.jsonl
**Extraction Date:** 2026-01-25

This document contains all Graceful Shutdown content (CR-002).

**6-Step Shutdown Sequence:**
1. User initiates shutdown
2. Confirm with user (are you sure?)
3. Notify CIA-SIE-PURE engine
4. Wait for engine acknowledgment
5. Close all connections
6. Display shutdown complete

---

## ALL SHUTDOWN REFERENCES


### SHUTDOWN REF 1

### Session 03 Ended Mid-Task:
The session terminated while Claude was verifying LTT design from JSON against HTML. This verification was not completed.

---

### SHUTDOWN REF 2

## DIAGRAM 1: THE SINGULARITY OF PURPOSE
```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                        THE SINGULARITY OF PURPOSE                             ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   MCI exists for ONE reason:                                                  ║
║   To give the operator VISIBILITY and CONTROL over CIA-SIE-PURE.              ║
║                                                                               ║
║   MCI provides:                                                               ║
║   1. A way to AUTHENTICATE (Token Capture)                                    ║
║   2. A way to VERIFY readiness (Pre-Ignition Scan)                            ║
║   3. A way to START safely (Ignition)                                         ║
║   4. A way to SEE what's happening (Telemetry)                                ║
║   5. A way to STOP safely (Shutdown)                                          ║
║                                                                               ║
║   MCI does NOT provide:                                                       ║
║   • Trading algorithms                                                        ║
║   • Order execution                                                           ║
║   • Position management                                    

---

### SHUTDOWN REF 3

## DIAGRAM 4: 7-LAYER REVIEW FRAMEWORK
```
┌───────┬──────────────────────────────────────────────────────────────────────────┐
│ Layer │                              Understanding                               │
├───────┼──────────────────────────────────────────────────────────────────────────┤
│ 1     │ CIA-SIE-PURE is the ENGINE, MCI is the COCKPIT                           │
├───────┼──────────────────────────────────────────────────────────────────────────┤
│ 2     │ Car/Airplane analogies - Dashboard monitors and controls, does not drive │
├───────┼──────────────────────────────────────────────────────────────────────────┤
│ 3     │ 5 Phases: Token → Scan → Ignition → Telemetry → Shutdown                 │
├───────┼──────────────────────────────────────────────────────────────────────────┤
│ 4     │ 5 CRs: Token Validity, Graceful Shutdown, Error Format, 6AM Expiry, UXMI │
├───────┼──────────────────────────────────────────────────────────────────────────┤
│ 5     │ Audit: 97% compliant, 3 minor fixes needed                               │
├───────┼──────────────────────────────────────────────────────────────────────────┤
│ 6     │ Decision: RETROFIT (code already aligns with design)                     │
├───────┼──────────────────────────────────────────────────────────────────────────┤
│ 7     │ Singular Purpose: Visibility and Control over the trading engine         │
└───────┴──────────────────────────────────────────────────────────────────────────┘
```

---

### SHUTDOWN REF 4

## DIAGRAM 7: APPLICATION RUNTIME FLOW (5 PHASES)
```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION RUNTIME FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│   │   PHASE 0    │    │   PHASE 1    │    │   PHASE 2    │    │   PHASE 3    │          │
│   │    TOKEN     │───>│   SCANNER    │───>│   IGNITION   │───>│  TELEMETRY   │          │
│   │   CAPTURE    │    │ (Pre-flight) │    │   (Start)    │    │ (Dashboard)  │          │
│   └──────────────┘    └──────────────┘    └──────────────┘    └──────┬───────┘          │
│          ▲                                                           │                   │
│          │                                                           ▼                   │
│          │                                                   ┌──────────────┐           │
│          │                                                   │   PHASE 4    │           │
│          │                                                   │   SHUTDOWN   │           │
│          │                                                   │  (Graceful)  │           │
│          │                                                  

---

### SHUTDOWN REF 5

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

### SHUTDOWN REF 6

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     LIFECYCLE TRACEABILITY TREE - NODE MAP                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  LAYER 1: CONSTITUTIONAL FOUNDATION (6 nodes)                                │
│  ══════════════════════════════════════════════                              │
│  ├── Node 1.0: Master Use Case Specification (ROOT)                         │
│  ├── Node 1.1: CR-001 Token Validity                                        │
│  ├── Node 1.2: CR-002 Graceful Shutdown                                     │
│  ├── Node 1.3: CR-003 Error Format (WHAT/WHY/HOW)                           │
│  ├── Node 1.4: CR-004 Token Expiry 6AM IST                                  │
│  └── Node 1.5: CR-005 UXMI 7-State Components                               │
│                                                                               │
│  LAYER 2: ARCHITECTURE DOCUMENTATION (13 nodes) ◄── NEW LAYER               │
│  ═══════════════════════════════════════════════                             │
│  ├── Node 2.0: Architecture Root                                            │
│  │                                                                           │
│  ├── BACKEND FLOWCHARTS (5 nodes)                                           │
│  │   ├── Node 2.1: Authentication Sequence   

---

### SHUTDOWN REF 7

```
                            ┌─────────────────────────────┐
                            │   📜 MASTER USE CASE SPEC   │
                            │      (The Constitution)     │
                            └──────────────┬──────────────┘
                                           │
              ┌────────────────────────────┼────────────────────────────┐
              │                            │                            │
              ▼                            ▼                            ▼
    ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
    │ ⚖️ CONSTITUTIONAL │          │ 🏗️ ARCHITECTURE  │          │ 🛡️ SUPERVISED   │
    │   REQUIREMENTS   │          │  DOCUMENTATION   │          │   EXECUTION     │
    └────────┬────────┘          └────────┬────────┘          └────────┬────────┘
             │                            │                            │
    ┌────────┴────────┐          ┌────────┴────────┐          ┌────────┴────────┐
    │ CR-001: Token   │          │    BACKEND      │          │ P1: No Assume   │
    │ CR-002: Shutdown│          │    FRONTEND     │          │ P2: Transparent │
    │ CR-003: Error   │          │    INTEGRATION  │          │ P3: Checkpoint  │
    │ CR-004: 6AM IST │          │                 │          │ P4: CR Fidelity │
    │ CR-005: UXMI    │          │  (13 Flowcharts)│          │ P5: Reversible  │
    └─────────────────┘          └────────┬────────┘          └─────────────────┘
          

---

### SHUTDOWN REF 8

### 2.1.4 SHUTDOWN SEQUENCE (Node 2.4) - CR-002 COMPLIANCE

---

### SHUTDOWN REF 9

| Section | Diagrams |
|---------|----------|
| **PART 1: LTT Design** | 1.1 Node Inventory (49 nodes), 1.2 Tree Structure, 1.3 Health Scorecard |
| **PART 2A: Backend** | 2.1 Auth Sequence, 2.2 Ignition, 2.3 Telemetry Pipeline, 2.4 Shutdown (CR-002), 2.5 State Machine |
| **PART 2B: Frontend** | 2.6 Component Hierarchy, 2.7 State Management, 2.8 Phase Progression, 2.9 User Interaction (CR-005) |
| **PART 2C: Integration** | 2.10 API Contract, 2.11 WebSocket Events, 2.12 Error Propagation (CR-003), 2.13 Data Flow Lifecycle |

---

### SHUTDOWN REF 10

```
04_IMPLEMENTATION/mci/docs/architecture/
├── README.md                    (Architecture Root - Node 2.0)
├── backend/
│   ├── 01_authentication.md     (Node 2.1)
│   ├── 02_ignition.md           (Node 2.2)
│   ├── 03_telemetry.md          (Node 2.3)
│   ├── 04_shutdown.md           (Node 2.4)
│   └── 05_state_machine.md      (Node 2.5)
├── frontend/
│   ├── 06_component_hierarchy.md (Node 2.6)
│   ├── 07_state_management.md    (Node 2.7)
│   ├── 08_phase_progression.md   (Node 2.8)
│   └── 09_user_interaction.md    (Node 2.9)
└── integration/
    ├── 10_api_contract.md        (Node 2.10)
    ├── 11_websocket_events.md    (Node 2.11)
    ├── 12_error_propagation.md   (Node 2.12)
    └── 13_data_flow.md           (Node 2.13)
```

---

### SHUTDOWN REF 11

### Flowcharts Included:
1. **2.1 Authentication Sequence** - CR-001, CR-004 compliant
2. **2.2 Ignition Sequence** - ARM → IGNITE safety
3. **2.3 Telemetry Pipeline** - Real-time data flow
4. **2.4 Shutdown Sequence** - CR-002 6-step protocol
5. **2.5 Backend State Machine** - Complete state diagram

---

### SHUTDOWN REF 12

### Flowchart Inventory:
1. 2.1 Authentication Sequence (CR-001, CR-004)
2. 2.2 Ignition Sequence
3. 2.3 Telemetry Pipeline
4. 2.4 Shutdown Sequence (CR-002)
5. 2.5 Backend State Machine
6. 2.6 Component Hierarchy
7. 2.7 State Management Flow
8. 2.8 Phase Progression Flow
9. 2.9 User Interaction Flow (CR-005)
10. 2.10 API Contract
11. 2.11 WebSocket Events
12. 2.12 Error Propagation (CR-003)
13. 2.13 Data Flow Lifecycle

---

### SHUTDOWN REF 13

| Section | Flowcharts | CR Compliance |
|---------|------------|---------------|
| **BACKEND** | 5 diagrams | CR-001, CR-002, CR-004 |
| **FRONTEND** | 4 diagrams | CR-005 |
| **INTEGRATION** | 4 diagrams | CR-003 |
| **TOTAL** | **13 flowcharts** | All 5 CRs covered |

---

### SHUTDOWN REF 14

1. **It has 5 operational phases:**
   - Phase 0: Token Capture (Kite API credentials)
   - Phase 1: Pre-Ignition Scanner (12-point system checks)
   - Phase 2: Ignition (Paper/Live mode selection, ARM → IGNITE)
   - Phase 3: Telemetry Dashboard (6 panels monitoring trading)
   - Phase 4: Shutdown (6-step graceful shutdown)

---

### SHUTDOWN REF 15

2. **5 Constitutional Requirements (CRs):**
   - CR-001: Token-based authentication
   - CR-002: Equal visual weight (no bias toward bullish/bearish)
   - CR-003: WHAT/WHY/HOW error format
   - CR-004: 6:00 AM IST token expiry (SACRED)
   - CR-005: UXMI 7-state micro-interactions

---

### SHUTDOWN REF 16

**Phase Color Coding:**
- Phase 0: Token Capture (Red)
- Phase 1: Pre-Ignition (Orange)
- Phase 2: Architecture (Yellow)
- Phase 3: Telemetry (Green)
- Phase 3.5: UXMI/CR-005 (Cyan)
- Phase 4: Shutdown (Blue)
- Phase 4-5: Implementation (Indigo)
- Phase 6: QA/Audits (Purple)
- Phase 9: Sentry (Brown)

---

### SHUTDOWN REF 17

**CR Impact Map:**
- CR-001 (Real-time): telemetryStore.ts, MarketDataPanel.tsx, telemetry.ts
- CR-002 (Shutdown): shutdownStore.ts, ShutdownPanel.tsx, shutdown.ts
- CR-003 (Errors): ErrorDisplay.tsx, ActivityLogPanel.tsx, sentry.ts
- CR-004 (Tokens): tokenStore.ts, TokenCaptureForm.tsx, auth.ts
- CR-005 (UXMI): uxmi/*.tsx (7 components)

---

### SHUTDOWN REF 18

**PHASES:**
- Phase 0: Token Capture
- Phase 1: Pre-Ignition Scanner
- Phase 2: Ignition Control
- Phase 3: Telemetry Dashboard
- Phase 3.5: UXMI (CR-005) - **MUST BE BUILT FIRST**
- Phase 4: Shutdown Protocol

---

### SHUTDOWN REF 19

**MANDATORY BUILD ORDER:**
1. UXMI Component Library (7 components × 7 states) - FOUNDATION
2. Token Capture Module
3. Pre-Ignition Scanner
4. Ignition Control
5. Telemetry Dashboard
6. Shutdown Protocol

---

### SHUTDOWN REF 20

**6 QUALITY GATES:**
- QG-1: UXMI Complete
- QG-2: Token Capture
- QG-3: Pre-Ignition Scanner
- QG-4: Ignition Control
- QG-5: Telemetry Dashboard
- QG-6: Shutdown Protocol → PRODUCTION READY

---

### SHUTDOWN REF 21

**5 CONSTITUTIONAL REQUIREMENTS (REDEFINED):**
- **CR-001**: DECISION-SUPPORT, NOT DECISION-MAKING (display info, don't recommend)
- **CR-002**: EXPOSE CONTRADICTIONS, NEVER RESOLVE (show conflicts, don't hide)
- **CR-003**: DESCRIPTIVE AI, NOT PRESCRIPTIVE AI (describe IS, not SHOULD)
- **CR-004**: TOKEN LIFECYCLE ACCURACY (accurate state, expiry tracking)
- **CR-005**: USER EXPERIENCE MICRO-INTERACTIONS (7 states, tooltips, helpful errors)

---

### SHUTDOWN REF 22

**MCI RESPONSIBILITIES (Cockpit):**
- IGNITION: Start/Stop Trading Engine, Emergency Shutdown, Mode Selection
- MONITORING: Engine Health, Position Telemetry, Order Status, Error States
- DISPLAY: Real-time Gauges, Position Meters, P&L Dashboard, Alert Notifications
- TOKEN MANAGEMENT: Kite Token Capture, Validation, Session Monitoring, Expiry Alerts

---

### SHUTDOWN REF 23

**CONSTITUTIONAL CONSTRAINTS (confirmed again):**
| ID | Constraint | Enforcement |
|----|------------|-------------|
| CR-001 | Decision-Support, NOT Decision-Making | ZERO trading signal access |
| CR-002 | Expose Contradictions, NEVER Resolve | Display conflicting states |
| CR-003 | Descriptive AI, NOT Prescriptive AI | Observations only |
| CR-004 | Token Lifecycle Accuracy | **6:00 AM IST hardcoded** |
| CR-005 | User Experience Micro-Interactions | Seven States, Tooltips |

---

### SHUTDOWN REF 24

- **COMPLETE FILE COUNT SUMMARY - 178 TOTAL FILES**
  - Governance: 12
  - Phase 0 (Token): 14
  - Phase 1 (Scanner): 14
  - Phase 2 (Architecture/Ignition): 14
  - Phase 3 (Telemetry): 21
  - Phase 3.5 (UXMI): 19
  - Phase 4 (Shutdown): 9
  - Phase 4-5 (Implementation): 3
  - Phase 6 (QA): 6
  - Phase 8 (Deployment): 1
  - Phase 9 (Sentry): 10
  - Shared/Cross-Phase: 13
  - Infrastructure/Build: 18
  - Historical/Archives: 13
  - External/Reference: 10

---

### SHUTDOWN REF 25

- **CR File Mapping** beginning:
  - CR-001 (Real-time Data): telemetryStore.ts, MarketDataPanel.tsx, telemetry.ts
  - CR-002 (Token Persistence): tokenStore.ts, TokenCaptureForm.tsx, auth.ts

---

### SHUTDOWN REF 26

**Category C: CRITICAL GAP - Layer 2 Architecture 0%**
- 13 nodes missing: Nodes 2.1-2.13
- Auth Sequence, Ignition Sequence, Telemetry Pipeline, Shutdown Sequence
- Backend State Machine, Component Hierarchy, State Management
- Phase Progression, User Interaction Flow, API Contract
- WebSocket Events, Error Propagation, Data Flow Lifecycle
- **KEY INSIGHT:** Flowcharts EXIST in Tab 7 but NOT marked complete in Tab 6 LTT - SYNCHRONIZATION ISSUE

---

### SHUTDOWN REF 27

- **MERMAID DIAGRAMS:**
  - **6.1 Document Component Relationships** - Shows hierarchy:
    - ROOT: Master Use Case Spec
    - GOVERNANCE: CR-001 through CR-005
    - ARCHITECTURE: LTT 49 Nodes, Backend/Frontend/Integration Flowcharts
    - EXECUTION: Dev Lifecycle 14 Phases, Runtime 5 Phases, 9-Tool Arsenal
    - KNOWLEDGE: 16 Q&A Entries, 7-Layer Framework
    - Flow: MUS → GOV → EXEC, MUS → ARCH → EXEC → KNOW
    - CR-001 validates RUN, CR-002 governs RUN, CR-005 defines FRONT

---

### SHUTDOWN REF 28

Key content:
- **MCI PROVIDES:**
  - IGNITION: Start/Stop with safety interlocks
  - TELEMETRY: Real-time visibility into positions, health, performance
  - ALERTING: Immediate notification of errors, warnings, anomalies
  - TOKEN MGMT: Secure capture and validation of Kite authentication
  - EMERGENCY: One-click shutdown with position closure

---

### SHUTDOWN REF 29

- **WHY MCI EXISTS (5 branches):**
  1. SAFETY: Cannot operate blind, emergency shutdown, health monitoring, financial risk mitigation
  2. VISIBILITY: Position awareness, performance tracking, error detection, system health
  3. CONTROL: Start/stop operations, mode selection, configuration
  4. COMPLIANCE: Audit trail, token management, session tracking, constitutional requirements
  5. HUMAN FACTORS: Reduce cognitive load, single point of control, intuitive interface, stress reduction

---

### SHUTDOWN REF 30

- **COMPLETE USE CASE INVENTORY:**
  - UC-001: Capture Kite Token (Operator, P0, CRITICAL)
  - UC-002: Validate Token (System, P0, CRITICAL)
  - UC-003: Monitor Token Expiry (Clock, P1, HIGH)
  - UC-004: Start Trading Engine (Operator, P0, CRITICAL)
  - UC-005: Stop Trading Engine (Operator, P0, CRITICAL)
  - UC-006: Emergency Shutdown (Operator, P0, CRITICAL)
  - UC-007: View Positions (Operator, P0, CRITICAL)
  - UC-008: View Health Status (Operator, P0, CRITICAL)
  - UC-009: View P&L (Operator, P1, HIGH)

---

### SHUTDOWN REF 31

  **PHASE 4: SHUTDOWN**
  - Operator Clicks SHUTDOWN → Confirmation → Close Positions → Disconnect Broker → STOPPED
  - Restart possible back to Phase 0

---

### SHUTDOWN REF 32

- **KEY INSIGHT:** Shutdown can occur "At Any Time" during telemetry phase

---

### SHUTDOWN REF 33

Key content:
- **USER JOURNEY MAP (4 sections):**
  - Morning Preparation: Open MCI, Check Token, Capture Token, Validate
  - Pre-Trading: Review Pre-Ignition, Verify Green, Click Ignition, Confirm Running
  - Active Trading: Monitor Positions, Check Health, Receive Alerts, Acknowledge
  - End of Day: Shutdown, Confirm, Verify Closed, Stopped

---

### SHUTDOWN REF 34

- **FAILURE MODE AND EFFECTS ANALYSIS (FMEA):**
  | Component | Failure Mode | Effect | Severity | Mitigation |
  |-----------|--------------|--------|----------|------------|
  | Token Capture | Rejected | Cannot start | CRITICAL | Retry + Help |
  | Token Capture | Expires | Engine stops | HIGH | Expiry alert |
  | Ignition | Won't start | No trading | CRITICAL | Error display |
  | Ignition | Partial start | Undefined state | CRITICAL | Rollback |
  | Telemetry | Data stale | Wrong decisions | HIGH | Staleness indicator |
  | Telemetry | Connection lost | No visibility | CRITICAL | Reconnect |
  | Positions | Display wrong | Wrong perception | CRITICAL | Validation |
  | Health | False positive | Unnecessary panic | MEDIUM | Thresholds |
  | Health | False negative | Missed problem | CRITICAL | Redundancy |
  | Shutdown | Unresponsive | Cannot stop | CRITICAL | Fallback |
  | Shutdown | Incomplete | Orphan positions | CRITICAL | Verification |
  | Alerts | Not delivered | Missed errors | CRITICAL | Multi-channel |
  | UI | Freezes | No interaction | HIGH | Watchdog |

---

### SHUTDOWN REF 35

- **CRITICAL PATH (7 steps):**
  Token Capture → Token Validation → Ignition Command → Engine Response → Telemetry Loop → Shutdown Command → Position Closure

---

### SHUTDOWN REF 36

- **TO BE BUILT NEW:**
  - Fresh 04_IMPLEMENTATION/
  - UXMI Component Library
  - Token Capture Module
  - Ignition Control
  - Telemetry Dashboard
  - Alert System
  - Shutdown Protocol

---

### SHUTDOWN REF 37

Key content:
- **PHASE 4: SHUTDOWN**
  - Shutdown Protocol
  - Position Closure
  - Implementation

---

### SHUTDOWN REF 38

Key content:
- **MANDATORY BUILD ORDER (continued):**
  - STEP 3: Build Pre-Ignition Scanner (using UXMI)
  - STEP 4: Build Ignition Control (ignition button, backend selector)
  - STEP 5: Build Telemetry Dashboard (positions, health gauges, P&L)
  - STEP 6: Build Shutdown Protocol (shutdown button, confirmation, status)

---

### SHUTDOWN REF 39

  **CR-002: EXPOSE CONTRADICTIONS, NEVER RESOLVE**
  - If positions conflict, SHOW both
  - Do NOT hide or average
  - Transparency is sacred

---

### SHUTDOWN REF 40

- **SHUTDOWN LAYER:**
  - ShutdownButton
  - ShutdownConfirmation
  - PositionClosureStatus
  - ShutdownComplete

---

### SHUTDOWN REF 41

- **UXMI DEPENDENCIES (which UXMI component feeds which feature):**
  - Tooltip → TokenHelpTooltip
  - Button → TokenCaptureForm, IgnitionButton, ShutdownButton
  - Input → TokenPasteInput
  - Spinner → TokenValidationStatus, ReadinessIndicator, IgnitionStatus
  - ProgressBar → TokenTimer, PositionClosureStatus
  - Toast → TokenExpiryAlert, AlertNotifications
  - ErrorDisplay → BlockerDisplay

---

### SHUTDOWN REF 42

- **LAYER DEPENDENCIES:**
  TOKEN → SCANNER → IGNITION → TELEMETRY → SHUTDOWN

---

### SHUTDOWN REF 43

Key content:
- **QUALITY GATES (continued):**
  - QG-6: Shutdown Protocol
  - Flow: QG-1 → QG-2 → QG-3 → QG-4 → QG-5 → QG-6 → PRODUCTION READY

---

### SHUTDOWN REF 44

- **GATE CRITERIA:**
  | Gate | Component | Criteria | Evidence |
  |------|-----------|----------|----------|
  | QG-1 | UXMI | All 7 components, all 7 states | Unit tests, visual review |
  | QG-2 | Token | Capture, validation, timer, alert | Integration test with mock |
  | QG-3 | Scanner | All system checks implemented | Readiness verification |
  | QG-4 | Ignition | Start/stop commands with Engine | End-to-end test |
  | QG-5 | Telemetry | All panels display accurate data | Data validation tests |
  | QG-6 | Shutdown | Complete shutdown with position closure | Full cycle test |

---

### SHUTDOWN REF 45

- **PROCESS (What We Do):**
  1. ERADICATE Previous Code
  2. BUILD UXMI Library
  3. BUILD Token Capture
  4. BUILD Scanner
  5. BUILD Ignition
  6. BUILD Telemetry
  7. BUILD Shutdown
  8. INTEGRATE & TEST

---

### SHUTDOWN REF 46

  **WHAT MUST BE DONE?**
  1. ERADICATE all previous implementations ([Out-of-Scope-Broker], current code)
  2. BUILD UXMI component library FIRST (CR-005)
  3. BUILD each module in order: Token → Scanner → Ignition → Telemetry → Shutdown
  4. PASS each Quality Gate before proceeding
  5. INTEGRATE with CIA-SIE-PURE
  6. DEPLOY production-ready application

---

### SHUTDOWN REF 47

**Summary of Document 9 (905 lines):**
- **TIER 1 MISSION CRITICAL** document - THE definitive specification
- **THE PROBLEM:** CIA-SIE-PURE is a headless trading engine - no visibility, no control
- **THE SOLUTION:** MCI is the COCKPIT - EYES and HANDS, not the BRAIN
- **13 Use Cases:** UC-001 to UC-013 across 4 groups (Token, Ignition, Telemetry, Alerts)
- **5 Operational Phases:** Token Capture → Pre-Ignition → Ignition → Telemetry → Shutdown
- **FMEA (Failure Mode Analysis):** 13 failure modes identified with mitigations
- **CLEAN SLATE PROTOCOL:** Eradicate all previous implementations including [Out-of-Scope-Broker] code
- **MANDATORY BUILD ORDER:** UXMI FIRST → Token → Scanner → Ignition → Telemetry → Shutdown
- **5 Constitutional Requirements:** CR-001 to CR-005 (NON-NEGOTIABLE)
- **6 Quality Gates:** QG-1 to QG-6, must PASS each before proceeding
- **15 Mermaid diagrams** documenting architecture and workflows
- **SUPERSEDES all previous understanding** of MCI purpose and scope

---

### SHUTDOWN REF 48

**Key Memory Block from Document 9:**
- This is THE BIBLE for MCI development
- MCI = COCKPIT (observes/controls), CIA-SIE-PURE = ENGINE (executes)
- Build order: UXMI → Token → Scanner → Ignition → Telemetry → Shutdown
- Clean Slate = DELETE all previous code in 04_IMPLEMENTATION/mci/
- BUT PRESERVE: 00-03, 05, _SESSION_CHECKPOINTS, and this specification
- Deviation from this document requires FORMAL AMENDMENT

---

### SHUTDOWN REF 49

**LEVEL 1: CONSTITUTIONAL FRAMEWORK**
- 1.1 INVIOLABLE CONSTRAINTS (CR-001 to CR-005)
  - CR-001: Decision-Support, NOT Decision-Making (ZERO trading signals)
  - CR-002: Expose Contradictions, NEVER Resolve (show side-by-side, never auto-fix)
  - CR-003: Descriptive AI, NOT Prescriptive AI (observations only)
  - CR-004: Token Lifecycle Accuracy (6:00 AM IST SACRED, to-the-second)
  - CR-005: UXMI - Seven States for EVERY element, Gate 5 compliance MANDATORY

---

### SHUTDOWN REF 50

**PHASE 1: PRE-IGNITION SCANNER**
- PURPOSE: System health verification before market operations
- PREREQUISITE: Valid Kite token from Phase 0
- **12 SCANNER CHECKS (<500ms total):**
  1. Token Validity - Kite token present & not expired
  2. API Connectivity - Kite API reachable, <100ms
  3. Market Status - NSE/BSE open/closed
  4. Backend Health - All 4 backends responding
  5. Position Sync - Positions match across backends
  6. Order Queue - No stuck orders
  7. PnL Calculation - Intraday PnL correct
  8. Risk Limits - Within thresholds
  9. Claude AI - Anthropic API accessible
  10. Local Time Sync - Clock within tolerance
  11. WebSocket - Real-time feed connection
  12. Watchlist - Instruments loaded

---

### SHUTDOWN REF 51

**PHASE 4: SHUTDOWN PROTOCOL**
- PURPOSE: Graceful termination of monitoring session
- **SHUTDOWN SEQUENCE (5 steps):**
  1. User initiates → "End Session" button (confirmation required)
  2. Stream close → WebSocket connections terminated
  3. State snapshot → Final positions/P&L logged
  4. Token clear → Optionally clear stored token
  5. Session end → Return to Token Capture (Phase 0)

---

### SHUTDOWN REF 52

- **AUTO-SHUTDOWN TRIGGERS:**
  - Token expiry (6:00 AM IST)
  - All backends disconnected
  - Critical error (fail-safe)

---

### SHUTDOWN REF 53

Key content:
**PHASE 3: TELEMETRY DASHBOARD (continued)**
- **DASHBOARD PANELS:**
  - Token Status → Countdown timer, validity badge
  - Backend Health → 4-card grid with connection status
  - Positions → Aggregated across backends, CR-002 conflict display
  - Orders → Open/executed/cancelled, filtered view
  - P&L → Intraday calculation with charts
  - AI Log → Claude observations (CR-003 compliant)

---

### SHUTDOWN REF 54

- **STEP 7: PHASE 4 - SHUTDOWN PROTOCOL**
  - Location: src/components/shutdown/
  - **BUILD ORDER:**
    1. ShutdownButton.tsx (end session trigger)
    2. ShutdownModal.tsx (confirmation dialog)
    3. shutdownService.ts (cleanup logic)
  - Requirements: Confirmation required, graceful close, return to Phase 0

---

### SHUTDOWN REF 55

- **STEP 6: PHASE 3 - TELEMETRY DASHBOARD**
  - Location: src/components/dashboard/
  - **BUILD ORDER:**
    1. DashboardLayout.tsx (panel arrangement)
    2. TokenPanel.tsx (Phase 0 integration)
    3. BackendPanel.tsx (health cards)
    4. PositionsPanel.tsx (CR-002 conflict display)
    5. OrdersPanel.tsx (order tracking)
    6. PnLPanel.tsx (P&L calculation)
    7. AILogPanel.tsx (CR-003 Claude observations)
  - Requirements: Real-time WebSocket, UXMI throughout, CR-002 conflict display

---

### SHUTDOWN REF 56

**PART III: CONSTITUTIONAL CONSTRAINT ENFORCEMENT**
| ID | Constraint | Enforcement Point | Verification |
|----|------------|-------------------|--------------|
| CR-001 | Decision-Support Only | guard.ts middleware | No trading API calls |
| CR-002 | Expose Contradictions | PositionsPanel.tsx | Side-by-side conflict |
| CR-003 | Descriptive AI Only | AILogPanel.tsx | No recommendations |
| CR-004 | Token Accuracy | TokenTimer.tsx | 6:00 AM IST hardcoded |
| CR-005 | UXMI Compliance | All components | Seven States, tooltips, errors |

---

### SHUTDOWN REF 57

**Summary of Document 10 (699 lines):**
- **Master Execution Manifest** - Complete contextual rehydration document
- **6 LEVELS of Production Lifecycle Tree:**
  - Level 0: Genesis (concept, codename)
  - Level 1: Constitutional Framework (5 CRs)
  - Level 2: Technology Foundation (TypeScript, Bun, Hono, React, Tailwind, Zustand)
  - Level 3: Operational Phases (0-4: Token, Scanner, Ignition, Telemetry, Shutdown)
  - Level 4: UXMI (CR-005) - Seven States, Tooltips, Loading, Errors, Keyboard, Animation
  - Level 5: Architecture & Specification Documents hierarchy
  - Level 6: Execution Authority Matrix (User, Cowork, Claude Code)

---

### SHUTDOWN REF 58

- **8-STEP Implementation Sequence:**
  1. Project Init → 2. UXMI Library → 3. Token → 4. Scanner → 5. Ignition → 6. Dashboard → 7. Shutdown → 8. Testing

---

### SHUTDOWN REF 59

Final content - **QUICK REFERENCE CARD:**
- **CONSTITUTIONAL CONSTRAINTS (INVIOLABLE):**
  - CR-001: Decision-SUPPORT only
  - CR-002: Show conflicts, don't fix
  - CR-003: Observe, don't recommend
  - CR-004: 6:00 AM IST sacred
  - CR-005: UXMI mandatory

---

### SHUTDOWN REF 60

**PHASE 1: REQUIREMENTS & SPECIFICATIONS [COMPLETE]**
- 1.1 Project Brief ✅ → COWORK
  - PROJECT_BRIEF_BCI_001.md (146 KB)
  - Pre-Ignition, Model Selection, Ignition, Dashboard, Telemetry, Shutdown - all SPECIFIED

---

### SHUTDOWN REF 61

- 4.8 Phase 4: Shutdown Protocol ⏳ → **CLAUDE CODE**
  - ShutdownButton, ShutdownModal, graceful close

---

### SHUTDOWN REF 62

**IMMEDIATE: Claude Code Implementation (9 Steps):**
1. Read Master Documents (Manifest + Claude Code Instruction)
2. Project Initialization (cd 04_IMPLEMENTATION, bun init, install deps)
3. UXMI Component Library (**BUILD FIRST**) - 7 components, Seven States, 300ms tooltips
4. Phase 0 - Token Capture (6-module, 5-step workflow)
5. Phase 1 - Pre-Ignition Scanner (12 checks in <500ms)
6. Phase 2 - Ignition Sequence (4-backend selection)
7. Phase 3 - Telemetry Dashboard (real-time panels)
8. Phase 4 - Shutdown Protocol (graceful termination)
9. Testing & Gate 5 Audit (UXMI compliance)

---

### SHUTDOWN REF 63

**CR-002: Expose Contradictions, NEVER Resolve**
- Show conflicting states side-by-side with EQUAL visual weight
- NEVER auto-fix or auto-reconcile
- Both bullish and bearish displayed identically
- VERIFICATION GATE: Gate G (PositionsPanel review)

---

### SHUTDOWN REF 64

**Required Structure:**
```
src/
├── client/
│   ├── components/
│   │   ├── uxmi/          (7 UXMI components)
│   │   ├── token/         (TokenCaptureForm, TokenTimer)
│   │   ├── scanner/       (ScannerPanel)
│   │   ├── ignition/      (BackendSelector, IgnitionButton)
│   │   ├── dashboard/     (6 panels: Token, Backend, Positions, Orders, PnL, AILog)
│   │   └── shutdown/      (ShutdownButton, ShutdownModal)
│   ├── hooks/
│   │   ├── useTokenState.ts
```

---

### SHUTDOWN REF 65

Key content:
- **Gate E-5**: Expiry Monitor - 60-second check, 30-min warning, 5-min critical, auto-transition
- **Gate E-6**: Fail-Safe Handler - network recovery, graceful degradation
- **GATE F: CONSTITUTIONAL GUARD** - CRITICAL GATE for guard.ts
- **CR-001 Enforcement**: Block trade execution, whitelist only view/display/show/list/get/fetch

---

### SHUTDOWN REF 66

Key content:
- **CR-002 Enforcement**: Side-by-side conflicts, equal visual weight, block auto-reconciliation
- **CR-003 Enforcement**: Block prescriptive ("should", "recommend", "suggest"), allow only descriptive ("is", "shows", "indicates")
- **GATE G: DASHBOARD PANELS** - Multiple sub-checkpoints
  - G-1: TokenPanel.tsx
  - G-2: BackendPanel.tsx (4 Indian brokers)
  - G-3: PositionsPanel.tsx (CR-002 CRITICAL - no reconciliation)

---

### SHUTDOWN REF 67

Key content:
- **Completion file structure**: Gate passage record, CR verification, files list, deviations
- **PART VII: EMERGENCY PROCEDURES**
  - HALT: Stop, report state, await instruction
  - ABORT: Stop, provide rollback options, terminate
  - Constitutional Violation: HALT immediately, report, document
- **FINAL DECLARATION**: Supervised execution commitments, REVOKES autonomous directive

---

### SHUTDOWN REF 68

**Emergency Commands:**
- `HALT` - Stop, report state, await instruction
- `ABORT` - Stop, provide rollback, terminate

---

### SHUTDOWN REF 69

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

### SHUTDOWN REF 70

**KEY SPECS:**
- Pre-ignition scan: <500ms (target <200ms)
- Token countdown: Accurate to 6:00 AM IST ±1 minute
- Memory: <150MB
- CPU idle: <5%
- Startup: <3 seconds
- Shutdown: <10 seconds

---

### SHUTDOWN REF 71

**CONSTITUTIONAL CONSTRAINTS (CR-001 to CR-004):**
- CR-001: Decision-Support, NOT Decision-Making
- CR-002: Expose Contradictions, NEVER Resolve
- CR-003: Descriptive AI, NOT Prescriptive AI
- CR-004: 6 AM IST Token Lifecycle (SACRED)

---

### SHUTDOWN REF 72

**IN SCOPE:** Pre-ignition verification, model selection, visual launch, telemetry, Kite token lifecycle, Anthropic budget monitoring, MET counter, activity log, graceful shutdown, error recovery, session persistence

---

### SHUTDOWN REF 73

**PHASE 5: OPERATIONAL STATUS DECLARATION**
- Step 5.1: Verify all four GO statuses
- Step 5.2: Calculate metrics (token expiry, budget, MET start)
- Step 5.3: Transition to OPERATIONAL state
- Step 5.4: Update UI (disable IGNITE, enable SHUTDOWN, show dashboard)
- **MISSION STATUS: GO - ALL SYSTEMS OPERATIONAL**

---

### SHUTDOWN REF 74

**4.3 ABORT SEQUENCE:**
- Displays failure location (e.g., Phase 3 - Kite Zerodha Authentication)
- Shows reason (e.g., Token expired at 6:00 AM IST)
- Lists completed phases with timing
- **RECOVERY OPTIONS:**
  - RE-AUTHENTICATE (Open Kite OAuth)
  - RETRY IGNITION (From beginning)
  - SHUTDOWN PARTIAL (Clean up started components)

---

### SHUTDOWN REF 75

**CONTROL BUTTONS:**
- SHUTDOWN (Graceful, 10s max)
- EMERGENCY STOP (Immediate SIGKILL)

---

### SHUTDOWN REF 76

**7.1 GRACEFUL SHUTDOWN SEQUENCE - 7 Steps:**
1. Stop accepting new requests ● DONE 0.1s
2. Complete pending requests ● DONE 1.2s
3. Flush activity logs ● DONE 0.3s
4. Close database connections ● DONE 0.2s
5. Send SIGTERM to uvicorn ◐ IN PROGRESS
6. Verify process terminated ○ PENDING
7. Clean up PID files ○ PENDING

---

### SHUTDOWN REF 77

**7.2 EMERGENCY STOP:**
- Immediately terminates ALL processes without graceful shutdown
- Use only when:
  - System is unresponsive
  - Graceful shutdown timed out
  - Critical error requires immediate halt
- WARNING: Pending operations will be lost

---

### SHUTDOWN REF 78

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

### SHUTDOWN REF 79

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

### SHUTDOWN REF 80

**9.8 SOUND EFFECTS (OPTIONAL, TOGGLEABLE):**
- [ ] Enable sound effects
- Ignition countdown: Subtle beeps
- Launch success: Triumphant chime
- Shutdown complete: Soft power-down sound
- Error/Alert: Attention-getting tone
- Token warning: Gentle reminder chime
- All sounds: Subtle, professional, non-intrusive

---

### SHUTDOWN REF 81

**9.9 SCHEDULED OPERATIONS:**
- Schedule automatic shutdown:
  - At specific time
  - After duration (hours)
  - Before token expiry (minutes)
- [Schedule] [Cancel Scheduled] buttons

---

### SHUTDOWN REF 82

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

### SHUTDOWN REF 83

**1.1 PROBLEM STATEMENT:**
- CIA-SIE-PURE requires coordinated initialization of 4 subsystems
- 7 Operational Challenges identified:
  1. No pre-flight verification → Systems may fail after start
  2. No port availability check → Conflicts cause silent failures
  3. No model selection option → Locked to single AI model
  4. No visual startup feedback → User uncertainty during launch
  5. No unified status dashboard → Multiple terminals required
  6. **Kite tokens expire at 6 AM IST** → Unexpected auth failures
  7. No graceful degradation visibility → Partial failures go unnoticed

---

### SHUTDOWN REF 84

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

### SHUTDOWN REF 85

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

### SHUTDOWN REF 86

**2.3 CONFLICT RESOLUTION OPTIONS:**
- TERMINATE EXISTING (Kill and restart)
- ATTACH TO EXISTING (Monitor only)
- USE ALTERNATE PORT (Specify new port)

---

### SHUTDOWN REF 87

**CR-002: Expose Contradictions, NEVER Resolve Them**
- If multiple system states conflict:
  - Display ALL states with equal prominence
  - Do NOT auto-resolve or prioritize
  - Let user decide action

---

### SHUTDOWN REF 88

**Revised MCI Operational Phases:**
- PHASE 0: TOKEN CAPTURE (NEW - This Addendum)
- PHASE 1: PRE-IGNITION SCANNER
- PHASE 2: MODEL SELECTION
- PHASE 3: IGNITION SEQUENCE
- PHASE 4: OPERATIONAL MONITORING
- PHASE 5: SHUTDOWN

---

### SHUTDOWN REF 89

**Complete Operational Flow (6 Phases):**
1. **PHASE 0: TOKEN CAPTURE** - 6-module auth sequence, SUCCESS required
2. **PHASE 1: PRE-IGNITION SCANNER** - 12 checks, Kite token check (#4) now GUARANTEED valid, <500ms, ALL GREEN required
3. **PHASE 2: MODEL SELECTION** - Select Anthropic model, view budget
4. **PHASE 3: IGNITION SEQUENCE** - 3-second countdown, sequential subsystem startup
5. **PHASE 4: OPERATIONAL MONITORING** - Real-time telemetry, token countdown timer
6. **PHASE 5: SHUTDOWN** - Graceful/Emergency, cleanup, logging

---

### SHUTDOWN REF 90

**Required Components:**
- Tooltip
- Button (all 7 states, loading, disabled tooltips)
- Input (validation, help text, error states)
- Spinner (various sizes)
- ProgressBar (determinate and indeterminate)
- StepIndicator (multi-step)
- Toast (notification system)
- Modal (focus trapping, escape handling)
- Skeleton (loading placeholder)
- ErrorBoundary (graceful error handling)
- EmptyState (guidance when no data)
- ConfirmDialog (destructive action confirmation)
- HelpPopover (contextual help)
- StatusBadge (visual status with tooltip)
- FocusRing (consistent focus styling)

---

### SHUTDOWN REF 91

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

### SHUTDOWN REF 92

**Keyboard Functions:**
- Tab: Next element
- Shift+Tab: Previous element
- Enter: Activate button/link
- Space: Toggle checkboxes
- Arrow Keys: Navigate within components
- Escape: Close modals, cancel, clear focus
- Home/End: Jump to first/last item

---

### SHUTDOWN REF 93

**Constitutional Constraints Registry (Complete):**
- CR-001: Decision-Support, NOT Decision-Making
- CR-002: Expose Contradictions, NEVER Resolve
- CR-003: Descriptive AI, NOT Prescriptive AI
- CR-004: Token Lifecycle Accuracy (6 AM IST)
- CR-005: User Experience Micro-Interactions (UXMI) ← THIS DOCUMENT

---

### SHUTDOWN REF 94

Steps 5-10:
- Step 5: Phase 1 Pre-Ignition Scanner (12 checks in <500ms)
- Step 6: Phase 2 Ignition (BackendSelector, IgnitionButton)
- Step 7: Phase 3 Telemetry Dashboard (SSE real-time)
- Step 8: Phase 4 Shutdown (ShutdownButton, ShutdownModal)
- Step 9: Backend Services (server/index.ts, kite.ts, anthropic.ts, guard.ts)
- Step 10: Config files (package.json, tsconfig.json, tailwind.config.js)

---

### SHUTDOWN REF 95

Part V: Verification Checklist - 3 categories:
1. UXMI Compliance: 7 states, 300ms tooltips, loading indicators, WHAT/WHY/HOW, keyboard nav, standard timing
2. Constitutional Compliance: All 5 CRs verified
3. Functional Verification: Token capture, validation, countdown, scanner <500ms, backend selection, ignition, dashboard real-time, shutdown

---

### SHUTDOWN REF 96

**T-Minus Execution Sequence:**
- T-10 to T-5: Setup (navigate, init, dependencies, TypeScript, Tailwind, directories)
- T-4: UXMI Component Library (CRITICAL FOUNDATION)
- T-3: Phase 0 Token Capture (6 modules)
- T-2: Phases 1-4 (Scanner, Ignition, Dashboard, Shutdown)
- T-1: Backend Services
- T-0: LAUNCH verification

---

### SHUTDOWN REF 97

Part III: Constitutional Constraints (INVIOLABLE) - All 5 CRs restated:
- CR-001: Decision-Support only, ZERO trading
- CR-002: Expose contradictions side-by-side
- CR-003: Descriptive only ("Position is X"), NEVER prescriptive
- CR-004: 6:00 AM IST expiry SACRED, to-the-second accurate
- CR-005: Seven States, 300ms tooltips, WHAT/WHY/HOW errors

---

### SHUTDOWN REF 98

System states: READY (green), IGNITION (blue 3-sec countdown), ACTIVE (cyan glow), SHUTDOWN (red). Section 3: AI Entity Assignment - Cowork (docs/architecture, Phases 2-4), Claude Code (file system/code, Phases 5-7), Cursor (IDE support).

---

### SHUTDOWN REF 99

Tech stack continued: Hono 4.0+, React 18+, Tailwind 3.0+, SSE, Vite 5.0+. Seven-Factor Evaluation: TypeScript 8.80 vs Python 6.95. Section 5: Constitutional Constraints - CR-001 (ZERO trading access), CR-002 (display BOTH conflicting states), CR-003 begins (observational AI only).

---

### SHUTDOWN REF 100

Ignition timeline: 0-1s VALIDATING, 1-2s INITIALIZING, 2-3s CONNECTING, 3.0s ACTIVE. Abort conditions (4 types). Section 8: Telemetry Dashboard layout diagram with token countdown, uptime, model, CPU/MEM/DISK/NET metrics, emergency stop and graceful shutdown buttons.

---
