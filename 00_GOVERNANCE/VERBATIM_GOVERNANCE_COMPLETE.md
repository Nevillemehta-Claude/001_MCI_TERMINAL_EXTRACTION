# VERBATIM GOVERNANCE CONTENT - COMPLETE EXTRACTION

**Source:** b8937bc2-ac10-4287-8ced-af96ac5f6f0b.jsonl
**Extraction Date:** 2026-01-25
**Total Source Characters:** 1,096,292

---

## CR-001: TOKEN VALIDITY - ALL REFERENCES

- Batch 20 ingested (lines 1426-1500). CheckResult interface: id, name, status (pass/fail/warn), latency_ms, details. All 12 checks <500ms total. Step 4 State Machine: SystemState type (DORMANT, PRE_FLIGHT, READY, IGNITION, ACTIVE, SHUTDOWN). Step 5 React Dashboard components: PreIgnitionScanner, ModelSelector, IgnitionButton, TelemetryDashboard, KiteTokenCountdown. Design tokens: Background #0a0e17, Accent #06b6d4, Success #10b981, Warning #f59e0b, Error #ef4444. Step 6 Constitutional Constraints Enforcement: CR-001 (ZERO trading signal access), CR-002 (expose contradictions), CR-003 (descriptive only). Continuing.
- Batch 10 ingested (lines 676-750). C3 Component Diagram continued: API Layer routes - Telemetry Router (/api/telemetry/stream), Config Router (/api/config/*). Service Layer: PreIgnitionScanner (scanner.ts, runAllChecks(), validateCheck()), KiteTokenService (kite.ts, getTokenStatus(), getTimeToExpiry()), AnthropicService (anthropic.ts, listModels(), selectModel()). State Management: SystemStateMachine (DORMANT→ACTIVE→SHUTDOWN), TelemetryEmitter (SSE Broadcast), Constitutional box (CR-001 to CR-004, INVIOLABLE RULES). Continuing.
- Batch 8 ingested (lines 526-600). Backend Selector Card States: Default (1px border, transparent), Hover (1px #475569, tooltip), Selected (2px #3B82F6, blue tint), Disabled (opacity 0.5). 4 backends with IDs, names, icons, status options (READY/UNAVAILABLE/MAINTENANCE). Ignition Confirmation Modal with CR-001 compliance note "monitoring-only session. No trades will be executed." Phase 3 Dashboard starting. Continuing.
- Batch 1 ingested (lines 1-75). Phase 3.5 Deliverable, Version 1.0.0. Constitutional Compliance Matrix: CR-001 (no buy/sell buttons), CR-002 (equal visual weight bullish/bearish), CR-003 (neutral observation styling), CR-004 (Fresh/Recent/Stale color scale), CR-005 (7-state component styling). Primary Colors: #3B82F6 primary, #2563EB hover, #1D4ED8 active. Token Lifecycle Colors starting. Continuing.
- Phase 2 Ignition mockup: 4 backend cards (ICICI Direct, HDFC Sky, Kotak Neo, Zerodha Kite). Selected state: 2px #3B82F6 border, #3B82F610 background. Shows 2 of 4 selected. INITIATE IGNITION button (Ctrl+Enter). CR-001 reminder: "monitoring-only session. No trades will be executed."
- Tech stack continued: Hono 4.0+, React 18+, Tailwind 3.0+, SSE, Vite 5.0+. Seven-Factor Evaluation: TypeScript 8.80 vs Python 6.95. Section 5: Constitutional Constraints - CR-001 (ZERO trading access), CR-002 (display BOTH conflicting states), CR-003 begins (observational AI only).
- Error display with WHAT/WHY/HOW format example. Part IV: Constitutional Compliance Verification - CR-001 check (all screens compliant, prohibited Buy/Sell/Execute buttons). CR-002 check begins: Equal Visual Weight verification for bullish/bearish.
- **OUT OF SCOPE:** Frontend (Vite), ngrok tunnel, Mercury module, DB admin, config editing, **Trade signal access (CR-001)**, automatic token refresh
- 3. **What does "decision-support only" mean in practice?** - CR-001 mentions no buy/sell buttons, but I don't understand the full context of why.
- - **src/client/stores/** (5 files): tokenStore (CR-001/004), ignitionStore (P2), scannerStore (P3), shutdownStore (CR-002)
- - Requirements: Backend selection with UXMI toggles, connection progress indicators, CR-001 enforcement (no trading)
- Then I'll guide you through creating the first flowchart: **Authentication Sequence (CR-001, CR-004 compliant)**.
- - **CR-001 Enforcement**: Block trade execution, whitelist only view/display/show/list/get/fetch
- │                              CR-001, CR-004 COMPLIANCE                                   │
- This flowchart covers **CR-001** (Token Authentication) and **CR-004** (6:00 AM IST Expiry).
- │                           Token Valid (CR-001)                                      │    │
- - Layer 4: The actual constraint satisfaction (CR-001 through CR-005 with code snippets)
- │  All Constitutional Requirements (CR-001 to CR-005) embedded in diagrams               │
- │  2.1  Authentication Sequence      (CR-001, CR-004)                ✅                   │
- | CR-001 | Token Validity | `validateToken()` before API calls | tokenStore.ts | ✅ 100% |
- │       │  │  CR-001    │  │            │  │             │  │             │      │      │
- - **services/guard.ts**: CR-001 block trading, CR-002 format conflicts, CR-003 filter AI
- │  │ CR-001 ──────────│───│──> TokenStore    │   │ tokenStore.ts    │                │
- - Diagram 2.5: Backend State Machine beginning - IDLE (Phase 0) → Token valid (CR-001)
- │  │  │ CR-001  │ (Token Validity)   │   │  ┌─────────────────────────────────┐   │ │
- | tokenStore.ts | 296 | CR-001, CR-004 | localStorage | token, isValid, expiresAt |
- - **CR-001**: DECISION-SUPPORT, NOT DECISION-MAKING (display info, don't recommend)
- | **CR-001** | Token Validity | `validateToken()` before every API call | ✅ 100% |
- - CR-001 (Real-time Data): telemetryStore.ts, MarketDataPanel.tsx, telemetry.ts
- │ CR-001: Token   │          │    BACKEND      │          │ P1: No Assume   │
- | CR-001 | Decision-Support Only | guard.ts middleware | No trading API calls |
- │  ├── Node 1.1: CR-001 Token Validity                                        │
- │   │  C5: TradingExecution == FALSE         (CR-001)                 │       │
- │  CR-001: Token Validity     → tokenStore.ts:108 validateTokens()            │
- | CR-001 | Decision-Support, NOT Decision-Making | ZERO trading signal access |
- │  │  • 2.1 Authentication Sequence (CR-001, CR-004)                        │ │
- │       mci:implements mci:CR-001, mci:CR-004 ;                               │
- │   │  1. Phase 0: Token Capture (CR-001, CR-004)                     │       │
- │   │ guard.ts:*         │ CR-001    │ ✅ No trading functions     │          │
- - Five Constitutional Requirements (CR-001 to CR-005) govern all development
- │   │ tokenStore.ts      │ CR-001,4  │ ✅ 6AM IST implemented      │          │
- │   │ CR-001    │ Spec:101-103        │ guard.ts         │ ✅ PASS │          │
- │   │ CR-001    │ Token Validity      │ tokenStore.ts    │ ✅ PASS │          │
- | tokenStore.ts | CR-001, CR-004 | token, isValid, expiresAt | localStorage |
- | **Defines CRs** | CR-001 to CR-005 that all architecture must comply with |
- - CR-001 (Real-time): telemetryStore.ts, MarketDataPanel.tsx, telemetry.ts
- | CR-001 | Decision-Support, NOT Decision-Making | ZERO trading signals |
- CR Compliance: CR-001 (token), CR-004 (6AM IST expiry), CR-002 (shutdown)
- - CR-001: Decision-Support, NOT Decision-Making (ZERO trading signals)
- │      │    CR-001: Validate token | CR-004: Calculate 6AM IST expiry  │

---

## CR-002: GRACEFUL SHUTDOWN - ALL REFERENCES

- Batch 20 ingested (lines 1426-1500). CheckResult interface: id, name, status (pass/fail/warn), latency_ms, details. All 12 checks <500ms total. Step 4 State Machine: SystemState type (DORMANT, PRE_FLIGHT, READY, IGNITION, ACTIVE, SHUTDOWN). Step 5 React Dashboard components: PreIgnitionScanner, ModelSelector, IgnitionButton, TelemetryDashboard, KiteTokenCountdown. Design tokens: Background #0a0e17, Accent #06b6d4, Success #10b981, Warning #f59e0b, Error #ef4444. Step 6 Constitutional Constraints Enforcement: CR-001 (ZERO trading signal access), CR-002 (expose contradictions), CR-003 (descriptive only). Continuing.
- Batch 3 ingested (lines 151-225). UXMI component colors: disabled #64748B (50% opacity), skeleton #334155, shimmer #475569. CR-002 Equal Visual Weight: Bullish #22C55E and Bearish #DC2626 must have EQUAL size, weight, position. PROHIBITED: larger green than red, bullish displayed more prominently, green as CTA. Typography: Primary font "Plus Jakarta Sans", Mono font "JetBrains Mono". Font Size Scale: xs 10px, sm 12px, base 14px, md 16px, lg 18px, xl 20px, 2xl 24px, 3xl 30px, 4xl 36px. Continuing.
- Batch 9 ingested (lines 601-675). Phase 3 Telemetry Dashboard wireframe: Header with LIVE indicator and End Session button. 6 panels: Token Status (progress bar, 6:00 AM IST expiry), Backend Health (connection status + latency), Positions (CR-002 conflict display), Orders (summary + link), P&L Summary (realized/unrealized with CR-003 disclaimer), AI Observations (CR-003 descriptive only, "is showing X%"). Refresh rates: Token 1s, Health/Positions/Orders 5s, P&L/AI 10s. Continuing.
- Batch 10 ingested (lines 676-750). Real-time updates via SSE, stale data amber indicator. CR-002 compliance: show BOTH entries for same symbol on different backends, color-code by backend, NEVER auto-reconcile. CR-003 compliance: ONLY descriptive, NEVER prescriptive, ALWAYS show disclaimer. Phase 4 Shutdown Confirmation Modal: session summary (duration, backends, positions, P&L), note "positions remain on broker platforms", checkbox to clear token data. Continuing.
- Batch 1 ingested (lines 1-75). Phase 3.5 Deliverable, Version 1.0.0. Constitutional Compliance Matrix: CR-001 (no buy/sell buttons), CR-002 (equal visual weight bullish/bearish), CR-003 (neutral observation styling), CR-004 (Fresh/Recent/Stale color scale), CR-005 (7-state component styling). Primary Colors: #3B82F6 primary, #2563EB hover, #1D4ED8 active. Token Lifecycle Colors starting. Continuing.
- Phase 3 Telemetry Dashboard mockup: Token status card (CR-004), Backend health (HDFC Sky 45ms, Zerodha Kite 32ms). POSITIONS table with CR-002 compliance: "Conflicts displayed side-by-side. If same symbol on multiple backends, BOTH entries shown (never auto-merged)." Orders panel, P&L Summary (CR-003).
- Tech stack continued: Hono 4.0+, React 18+, Tailwind 3.0+, SSE, Vite 5.0+. Seven-Factor Evaluation: TypeScript 8.80 vs Python 6.95. Section 5: Constitutional Constraints - CR-001 (ZERO trading access), CR-002 (display BOTH conflicting states), CR-003 begins (observational AI only).
- Error display with WHAT/WHY/HOW format example. Part IV: Constitutional Compliance Verification - CR-001 check (all screens compliant, prohibited Buy/Sell/Execute buttons). CR-002 check begins: Equal Visual Weight verification for bullish/bearish.
- - ASCII layout with 6 panels: Token Status, Backend Health, Scanner Status, Positions (CR-002), Orders, P&L Summary, AI Observations (CR-003)
- | **PART 2A: Backend** | Auth Sequence, Ignition Sequence, Telemetry Pipeline, Shutdown (CR-002 6-step), Backend State Machine | 5 |
- | **PART 2A: Backend** | 2.1 Auth Sequence, 2.2 Ignition, 2.3 Telemetry Pipeline, 2.4 Shutdown (CR-002), 2.5 State Machine |
- - **src/client/stores/** (5 files): tokenStore (CR-001/004), ignitionStore (P2), scannerStore (P3), shutdownStore (CR-002)
- - **CR-002 Enforcement**: Side-by-side conflicts, equal visual weight, block auto-reconciliation
- │            │  (CR-002: 6-Step)        │  │                  │                 │     │    │
- │       │  │  CR-002     │                                                         │      │
- │                        CR-002: GRACEFUL SHUTDOWN (6 STEPS)                              │
- │  2.4  Shutdown Sequence            (CR-002: 6 Steps)               ✅                   │
- - **services/guard.ts**: CR-001 block trading, CR-002 format conflicts, CR-003 filter AI
- - CR-002: Expose Contradictions, NEVER Resolve (show side-by-side, never auto-fix)
- **Batch 101 (Lines 5001-5050)**: CR-002 Shutdown Sequence - Steps 1-5 of 6 visible:
- | CR-002 | Graceful Shutdown | 6-step DEFAULT_STEPS | shutdownStore.ts:47-78 | ✅ |
- | **CR-002** | Graceful Shutdown | 6-step sequence in shutdownStore.ts | ✅ 100% |
- │ CR-002: Shutdown│          │    FRONTEND     │          │ P2: Transparent │
- │   │ CR-002    │ Spec:105-107        │ (not implemented)│ ⚠️ PEND │          │
- - **CR-002**: EXPOSE CONTRADICTIONS, NEVER RESOLVE (show conflicts, don't hide)
- │   │  5. Phase 4: Graceful Shutdown (CR-002: 6 steps)                │       │
- - Requirements: Real-time WebSocket, UXMI throughout, CR-002 conflict display
- │   │  C5: ShutdownSteps == 6                (CR-002)                 │       │
- │  │ shutdownStore   │ ← CR-002: 6-step graceful shutdown                     │
- │  ├── Node 1.2: CR-002 Graceful Shutdown                                     │
- | CR-002 | Expose Contradictions | PositionsPanel.tsx | Side-by-side conflict |
- │  │  • 2.4 Shutdown Sequence (CR-002)                                      │ │
- | CR-002 | Expose Contradictions, NEVER Resolve | Display conflicting states |
- │   │ CR-002    │ Graceful Shutdown   │ shutdownStore.ts │ ✅ PASS │          │
- │  CR-002: Graceful Shutdown  → shutdownStore.ts:47-78 (6 steps)             │
- │   │ shutdownStore.ts   │ CR-002    │ ✅ 6-step shutdown          │          │
- - CR-002 (Token Persistence): tokenStore.ts, TokenCaptureForm.tsx, auth.ts
- | CR-002 | Graceful Shutdown | 6-step sequence | shutdownStore.ts | ✅ 100% |
- CR Compliance: CR-001 (token), CR-004 (6AM IST expiry), CR-002 (shutdown)
- | shutdownStore.ts | CR-002 | step (1-6), isShuttingDown, completed | - |
- | CR-002 | Expose Contradictions, NEVER Resolve | Side-by-side display |
- │      │    ShutdownPanel.tsx (CR-002: 6-step sequence)                │
- | shutdownStore.ts | 288 | CR-002 | none | step (1-6), isShuttingDown |
- - CR-002 (Shutdown): shutdownStore.ts, ShutdownPanel.tsx, shutdown.ts
- - CR-001 validates RUN, CR-002 governs RUN, CR-005 defines FRONT
- - Positions → Aggregated across backends, CR-002 conflict display
- 1. CR-002 UI Implementation - Bullish/bearish equal weight display
- - G-3: PositionsPanel.tsx (CR-002 CRITICAL - no reconciliation)
- - CR-002: Equal visual weight (no bias toward bullish/bearish)
- - **CR-002 Detail**: Show conflicts side-by-side, NEVER auto-fix

---

## CR-003: ERROR FORMAT (WHAT/WHY/HOW) - ALL REFERENCES

- Batch 20 ingested (lines 1426-1500). CheckResult interface: id, name, status (pass/fail/warn), latency_ms, details. All 12 checks <500ms total. Step 4 State Machine: SystemState type (DORMANT, PRE_FLIGHT, READY, IGNITION, ACTIVE, SHUTDOWN). Step 5 React Dashboard components: PreIgnitionScanner, ModelSelector, IgnitionButton, TelemetryDashboard, KiteTokenCountdown. Design tokens: Background #0a0e17, Accent #06b6d4, Success #10b981, Warning #f59e0b, Error #ef4444. Step 6 Constitutional Constraints Enforcement: CR-001 (ZERO trading signal access), CR-002 (expose contradictions), CR-003 (descriptive only). Continuing.
- Batch 9 ingested (lines 601-675). Phase 3 Telemetry Dashboard wireframe: Header with LIVE indicator and End Session button. 6 panels: Token Status (progress bar, 6:00 AM IST expiry), Backend Health (connection status + latency), Positions (CR-002 conflict display), Orders (summary + link), P&L Summary (realized/unrealized with CR-003 disclaimer), AI Observations (CR-003 descriptive only, "is showing X%"). Refresh rates: Token 1s, Health/Positions/Orders 5s, P&L/AI 10s. Continuing.
- Batch 10 ingested (lines 676-750). Real-time updates via SSE, stale data amber indicator. CR-002 compliance: show BOTH entries for same symbol on different backends, color-code by backend, NEVER auto-reconcile. CR-003 compliance: ONLY descriptive, NEVER prescriptive, ALWAYS show disclaimer. Phase 4 Shutdown Confirmation Modal: session summary (duration, backends, positions, P&L), note "positions remain on broker platforms", checkbox to clear token data. Continuing.
- Batch 1 ingested (lines 1-75). Phase 3.5 Deliverable, Version 1.0.0. Constitutional Compliance Matrix: CR-001 (no buy/sell buttons), CR-002 (equal visual weight bullish/bearish), CR-003 (neutral observation styling), CR-004 (Fresh/Recent/Stale color scale), CR-005 (7-state component styling). Primary Colors: #3B82F6 primary, #2563EB hover, #1D4ED8 active. Token Lifecycle Colors starting. Continuing.
- AI Observations panel with CR-003 compliance: descriptive only ("is showing X%"), no recommendations. Disclaimer: "Claude AI does NOT provide recommendations." Part II: Component State Variations - Button 7 states: DEFAULT (#3B82F6), HOVER (#2563EB, 150ms, 300ms tooltip), FOCUS (2px #06B6D4 ring), ACTIVE (#1D4ED8, scale 0.98), LOADING (spinner), DISABLED (opacity 0.5).
- CR-003 examples: "System memory at 78%" (OK) vs "You should restart" (NOT OK). CR-004: 6:00 AM IST, WARNING at T-60 (yellow), CRITICAL at T-30 (red). Section 5a: CR-005 UXMI - Seven States table: Default, Hover (300ms tooltip), Focus (2px cyan ring), Active (<100ms feedback), Loading (spinner), Disabled begins.
- Phase 3 Telemetry Dashboard mockup: Token status card (CR-004), Backend health (HDFC Sky 45ms, Zerodha Kite 32ms). POSITIONS table with CR-002 compliance: "Conflicts displayed side-by-side. If same symbol on multiple backends, BOTH entries shown (never auto-merged)." Orders panel, P&L Summary (CR-003).
- Tech stack continued: Hono 4.0+, React 18+, Tailwind 3.0+, SSE, Vite 5.0+. Seven-Factor Evaluation: TypeScript 8.80 vs Python 6.95. Section 5: Constitutional Constraints - CR-001 (ZERO trading access), CR-002 (display BOTH conflicting states), CR-003 begins (observational AI only).
- - ASCII layout with 6 panels: Token Status, Backend Health, Scanner Status, Positions (CR-002), Orders, P&L Summary, AI Observations (CR-003)
- - **CR-003 Enforcement**: Block prescriptive ("should", "recommend", "suggest"), allow only descriptive ("is", "shows", "indicates")
- | **PART 2C: Integration** | 2.10 API Contract, 2.11 WebSocket Events, 2.12 Error Propagation (CR-003), 2.13 Data Flow Lifecycle |
- | **PART 2C: Integration** | API Contract, WebSocket Events, Error Propagation (CR-003), Data Flow Lifecycle | 4 |
- - **CR-003 Detail**: Observations only ("Position is X"), NEVER recommend ("You should Y"), guard.ts enforcement
- - **services/anthropic.ts**: Claude AI, observation generation, CR-003 compliant (descriptive only)
- │                        CR-003: WHAT/WHY/HOW FORMAT                                      │
- │  2.12 Error Propagation            (CR-003: WHAT/WHY/HOW)          ✅                   │
- - **src/client/components/uxmi/** (7 files): All ✓ CR-005, ErrorDisplay.tsx also ✓ CR-003
- - **services/guard.ts**: CR-001 block trading, CR-002 format conflicts, CR-003 filter AI
- - **G-6**: AILogPanel.tsx - CR-003 CRITICAL, descriptive only, guard.ts filter applied
- - Diagram 2.12: Error Propagation (CR-003) - Error Sources: Engine, Broker, Backend
- │ CR-003: Error   │          │    INTEGRATION  │          │ P3: Checkpoint  │
- │  ├── Node 1.3: CR-003 Error Format (WHAT/WHY/HOW)                           │
- │  │  • 2.12 Error Propagation (CR-003)                                     │ │
- │   │  C6: AIRecommendations == FALSE        (CR-003)                 │       │
- │   │  C6: ErrorFormat == WHAT_WHY_HOW       (CR-003)                 │       │
- │   │ CR-003    │ Error WHAT/WHY/HOW  │ ErrorDisplay.tsx │ ✅ PASS │          │
- │   │ ErrorDisplay.tsx   │ CR-003    │ ✅ WHAT/WHY/HOW format      │          │
- │  CR-003: WHAT/WHY/HOW       → ErrorDisplay.tsx (what, why, how props)      │
- │   │ CR-003    │ Spec:109-111        │ AILogPanel.tsx   │ ✅ PASS │          │
- - CR Compliance: CR-003 (Sentry), CR-005 (UXMI tools), All CRs (Claude Code)
- - CR-003 (System Logging): ActivityLogPanel.tsx, sentry.ts (client/server)
- - **CR-003**: DESCRIPTIVE AI, NOT PRESCRIPTIVE AI (describe IS, not SHOULD)
- | **CR-003** | Error Format | WHAT/WHY/HOW via ErrorDisplay.tsx | ✅ 100% |
- | CR-003 | Descriptive AI, NOT Prescriptive AI | "Position is X" only |
- │  MONITORING       │  Sentry (CR-003 compliant)                      │
- | CR-003 | Descriptive AI Only | AILogPanel.tsx | No recommendations |
- - CR-003 (Errors): ErrorDisplay.tsx, ActivityLogPanel.tsx, sentry.ts
- | CR-003 | Error Format | ErrorDetails type | types.ts:174-179 | ✅ |
- | CR-003 | Descriptive AI, NOT Prescriptive AI | Observations only |
- | CR-003 | Error Format | WHAT/WHY/HOW | ErrorDisplay.tsx | ✅ 100% |
- - CR-003: Descriptive AI, NOT Prescriptive AI (observations only)
- - CR-003: Descriptive only ("Position is X"), NEVER prescriptive
- ### 2.3.2 ERROR PROPAGATION FLOW (Node 2.12) - CR-003 COMPLIANCE
- - Essential for CR-003 compliance (WHAT/WHY/HOW error format)
- alert:error          → { what, why, how, severity } (CR-003)
- **Batch 114 (Lines 5651-5700)**: CR-003 Error Propagation:
- 2. CR-003 AI Panel - Descriptive AI observations (Phase 3)
- ├── Requirements: CR-001, CR-002, CR-003, CR-004, CR-005
- | ErrorDisplay.tsx | WHAT/WHY/HOW | - | CR-003 errors |
- | CR-003 | ✅ PASS | No recommendations in AI output |

---

## CR-004: TOKEN EXPIRY (6:00 AM IST) - ALL REFERENCES

- Batch 2 ingested (lines 76-150). Token Lifecycle Colors (CR-004): #22C55E fresh (>1hr), #EAB308 recent (<30min, pulse), #DC2626 stale (<5min, urgent pulse). Token countdown thresholds with visual treatments. Feedback Colors: success #22C55E, error #DC2626, warning #EAB308, info #3B82F6 (all with 15% opacity backgrounds). Neutral Palette: background #0F172A, surface #1E293B, surface-elevated #334155, text-primary #F8FAFC, text-secondary #94A3B8, text-muted #64748B. UXMI Colors: focus-ring #06B6D4 cyan, tooltip-bg #1A2332. Continuing.
- Batch 10 ingested (lines 676-750). C3 Component Diagram continued: API Layer routes - Telemetry Router (/api/telemetry/stream), Config Router (/api/config/*). Service Layer: PreIgnitionScanner (scanner.ts, runAllChecks(), validateCheck()), KiteTokenService (kite.ts, getTokenStatus(), getTimeToExpiry()), AnthropicService (anthropic.ts, listModels(), selectModel()). State Management: SystemStateMachine (DORMANT→ACTIVE→SHUTDOWN), TelemetryEmitter (SSE Broadcast), Constitutional box (CR-001 to CR-004, INVIOLABLE RULES). Continuing.
- Batch 14 ingested (lines 976-1050). Error Recovery Flows continued: Token Expired at 6:00 AM IST (CR-004) - modal forces Re-Authenticate or End Session. WebSocket Disconnection - auto-reconnect 3 times, toast notifications, error modal if failed. PART XI Keyboard Shortcuts: Ctrl+Enter (Validate/Ignite), Ctrl+R (Re-run Scanner), Escape (close modal), Tab/Shift+Tab (navigate), Space (toggle/select), Ctrl+Q (End Session). All shortcuts shown in tooltips. Document Control section starting. Continuing.
- Batch 1 ingested (lines 1-75). Phase 3.5 Deliverable, Version 1.0.0. Constitutional Compliance Matrix: CR-001 (no buy/sell buttons), CR-002 (equal visual weight bullish/bearish), CR-003 (neutral observation styling), CR-004 (Fresh/Recent/Stale color scale), CR-005 (7-state component styling). Primary Colors: #3B82F6 primary, #2563EB hover, #1D4ED8 active. Token Lifecycle Colors starting. Continuing.
- Batch 5 ingested (lines 301-375). Error messages in WHAT/WHY/HOW format (Invalid URL, Missing Token, Token Expired, API Error). Token Timer Component (CR-004): Progress bar visual, 5 color states (>1hr green, 30min-1hr amber, <30min amber pulse, <5min red pulse, expired red+modal), updates every 1 second, HH:MM:SS format, NEVER 24-hour countdown. Phase 1 Scanner wireframe starting. Continuing.
- Token Timer States: FRESH (#22C55E, >1hr), RECENT WARNING (#EAB308, 30min-1hr), RECENT URGENT (#EAB308 pulse 2s, <30min), STALE CRITICAL (#DC2626 pulse 1s, <5min), EXPIRED (#DC262615 bg, modal). CR-004 SACRED: "ALWAYS counts down to 6:00 AM IST, NEVER uses generic 24-hour countdown." Part III: Interaction Specifications - Tooltip timeline begins.
- Batch 10 ingested (lines 676-750). CSS Custom Properties Export - complete :root definition with all design tokens: Colors (primary, token lifecycle CR-004, feedback, neutral, UXMI CR-005), Typography (fonts, sizes, weights, line-heights), Spacing starting. All values match previous specifications exactly. Continuing.
- CR-003 examples: "System memory at 78%" (OK) vs "You should restart" (NOT OK). CR-004: 6:00 AM IST, WARNING at T-60 (yellow), CRITICAL at T-30 (red). Section 5a: CR-005 UXMI - Seven States table: Default, Hover (300ms tooltip), Focus (2px cyan ring), Active (<100ms feedback), Loading (spinner), Disabled begins.
- Phase 3 Telemetry Dashboard mockup: Token status card (CR-004), Backend health (HDFC Sky 45ms, Zerodha Kite 32ms). POSITIONS table with CR-002 compliance: "Conflicts displayed side-by-side. If same symbol on multiple backends, BOTH entries shown (never auto-merged)." Orders panel, P&L Summary (CR-003).
- Batch 3 ingested (lines 151-225). Phase 4 Shutdown sequence (confirm, close connections, save state, return to Phase 0). Token Expiry Interrupt Flow - modal appears at 6:00 AM IST (CR-004) from any phase with Re-Authenticate or End Session options. Phase 0 Token Capture wireframe starting. Continuing.
- Token Capture mockup continued: Step 2 (callback URL instruction), Step 3 (input field - JetBrains Mono, 48px height), Validate Token button (DISABLED until URL entered). CR-004 info banner. Color palette: Background #0F172A, Surface #1E293B, Border #334155, Text #F8FAFC. Phase 1 Scanner begins.
- **Why This Matters**: Ontologies enable REASONING - inferring new facts from existing facts. A reasoner could automatically deduce: "If CR-004 is COMPLIANT AND all CRs are COMPLIANT, THEN system is RELEASE_READY."
- **CONTAMINATION FLAG**: Lines 487-488 reference `alpaca.api.*` and `polygon.api.*` - this appears to be cross-contamination from the excluded Document 24. Correct reference should be `kite.api.*` per CR-004.
- **Why This Matters**: Ontologies enable REASONING - inferring new facts from existing facts. A reasoner could automatically deduce: "If CR-004 is violated AND CR-004 is INVIOLABLE, THEN release is BLOCKED."
- **Master transcripts ingestion complete. The transcripts CONFIRM the Alpaca contamination and CR-004 violation that requires surgical correction.**
- Then I'll guide you through creating the first flowchart: **Authentication Sequence (CR-001, CR-004 compliant)**.
- ║   CORRECT REFERENCE (CR-004 SACRED):                                                               ║
- ║           correct backend (Kite Connect / Indian Brokers per CR-004)                               ║
- - **Gate E-2 continued**: calculateNext6AMIST() is SACRED (CR-004), must be hardcoded not configurable
- │                              CR-001, CR-004 COMPLIANCE                                   │
- This flowchart covers **CR-001** (Token Authentication) and **CR-004** (6:00 AM IST Expiry).
- │                                        │                   │ (CR-004)               │    │
- │     │                    │                     │  Calculate 6AM IST (CR-004)     │      │
- │  - - - - - -> Token Expiry Transition (CR-004)                                          │
- │  ⚠️ CR-004: Token MUST expire at 6:00 AM IST daily - NO EXCEPTIONS                     │
- │  │  ⏰ TOKEN EXPIRY (6 AM IST - CR-004)                                                 │
- │  2.1  Authentication Sequence      (CR-001, CR-004)                ✅                   │
- │       │  │  CR-004    │  │            │  │             │  │             │      │      │
- | CR-004 | 6AM IST Expiry | `setUTCHours(0, 30, 0, 0)` | tokenStore.ts:23-33 | ✅ 100% |
- │  │     │                           │   │  "CR-004 requires token expiry at       │ │
- │  │            │                    │   │  Resolution: CR-004 says IST            │ │
- │  │     │      │      └── Sentence  │   │  │ CR-004  │───────────>│ Token      │ │ │
- │  │  └────┬────┘                    │   │  │ C1: CR-004 = 6:00 AM IST        │   │ │
- | tokenStore.ts | 296 | CR-001, CR-004 | localStorage | token, isValid, expiresAt |
- - CR-004 (Token Capture 6-Module): ADDENDUM_001_TOKEN_CAPTURE_MODULE.md, phase0/*
- Phase 3: Telemetry Dashboard (6 panels) → Shutdown ↓ | 6AM IST (CR-004) → Phase 0
- │ CR-004: 6AM IST │          │                 │          │ P4: CR Fidelity │
- │   │  C1: TokenExpiry == 6_AM_IST           (CR-004)                 │       │
- │  CR-004 COMPLIANCE:                                                         │
- │       │       │       │       │               └── "CR-004 requires          │
- ║   ✓ CR-004: Kite Connect, 6:00 AM IST expiry                                ║
- │   THEN FLAG as potential CR-004 violation                                   │
- │   │  [CR-004]          → REQUIREMENT                                │       │
- │  │   tokenStore    │ ← CR-004: 6:00 AM IST Expiry (SACRED)                  │
- │   "CR-004 specifies that Kite tokens expire at 6:00 AM IST daily.           │
- │   │  C1: TokenExpiry == 6_AM_IST           (CR-004 SACRED)          │       │
- │   │  1. CR-004 Token Expiry Fix (foundation)                        │       │
- │   │  (tokenStore.ts) ──IMPLEMENTS──→ (CR-004)                       │       │
- │   [Phase 1 Scanner] ← depends on ← [CR-004 Token Expiry Fix]                │
- │   │  1. Phase 0: Token Capture (CR-001, CR-004)                     │       │

---

## CR-005: UXMI 7-STATE MICRO-INTERACTIONS - ALL REFERENCES

- Batch 5 ingested (lines 301-375). Animation durations continued: Toast slide 200ms/fade 150ms, Expand/Collapse 250ms, Progress bar 300ms, Page transitions 300ms, Spinner 1000ms. Easing Functions: ease-in (exiting), ease-out (entering), ease-in-out (staying on screen), linear (progress/spinners). Tooltip Timing (CR-005): 300ms appear delay, 100ms disappear delay, 150ms fade in, 100ms fade out. Border Radius: none 0, sm 4px, md 6px, lg 8px, xl 12px, 2xl 16px, full 9999px. Shadows section starting. Continuing.
- Batch 8 ingested (lines 526-600). Tooltip timing confirmed: 300ms appear, 100ms disappear, 150ms fade in, 100ms fade out. Positioning: prefer top, auto-flip. Content must answer "What happens if I click?", include keyboard shortcut, explain WHY disabled. Error Message Format (CR-005): WHAT/WHY/HOW structure with example (Token Exchange Error - 60 second validity). Toast Notification Specs: top-right 16px from edges, 320-400px width, max 3 visible with queue. Continuing.
- Batch 14 ingested (lines 976-1050). Token Capture Legend: Validation (cyan), Form/UI (blue), API Exchange (amber), Storage/Success (green), Verification (purple), Error/Fail-Safe (red). Key Points: MANDATORY before Pre-Ignition, DAILY 6:00 AM IST expiry, Operator workflow, 2-5 seconds total, Fail-Safe with WHAT/CAUSE/HOW, Reference ADDENDUM_001_TOKEN_CAPTURE_MODULE.md. CR-005 UXMI Components section starting: Seven States of Every Interactive Element. Continuing.
- Batch 6 ingested (lines 376-450). Shadow Scale: sm/md/lg/xl, tooltip (0 4px 12px), modal (0 16px 48px). Focus Ring (CR-005): 2px solid #06B6D4 cyan, 2px offset, 4px border-radius, 150ms transition. NEVER outline:none without alternative. UXMI 7 States (CR-005): State 1 DEFAULT (idle, cursor:pointer), State 2 HOVER (tooltip after 300ms, 150ms transition), State 3 FOCUS (2px cyan ring, 2px offset), State 4 ACTIVE starting. Continuing.
- Batch 4 ingested (lines 226-300). Font Weights: 400 normal, 500 medium, 600 semibold, 700 bold. Line Heights: none 1, tight 1.25, snug 1.375, normal 1.5, relaxed 1.625. Spacing Scale: 0-64px (0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64). Animation Duration Standards (CR-005): Button press 100ms, Hover 150ms, Focus ring 150ms, Tooltip appear 150ms/disappear 100ms, Modal open 200ms/close 150ms. Continuing.
- Batch 1 ingested (lines 1-75). Phase 3.5 Deliverable, Version 1.0.0. Constitutional Compliance Matrix: CR-001 (no buy/sell buttons), CR-002 (equal visual weight bullish/bearish), CR-003 (neutral observation styling), CR-004 (Fresh/Recent/Stale color scale), CR-005 (7-state component styling). Primary Colors: #3B82F6 primary, #2563EB hover, #1D4ED8 active. Token Lifecycle Colors starting. Continuing.
- Batch 10 ingested (lines 676-750). CSS Custom Properties Export - complete :root definition with all design tokens: Colors (primary, token lifecycle CR-004, feedback, neutral, UXMI CR-005), Typography (fonts, sizes, weights, line-heights), Spacing starting. All values match previous specifications exactly. Continuing.
- CR-003 examples: "System memory at 78%" (OK) vs "You should restart" (NOT OK). CR-004: 6:00 AM IST, WARNING at T-60 (yellow), CRITICAL at T-30 (red). Section 5a: CR-005 UXMI - Seven States table: Default, Hover (300ms tooltip), Focus (2px cyan ring), Active (<100ms feedback), Loading (spinner), Disabled begins.
- Batch 11 ingested (lines 826-900). CR-005 UXMI 7-State compliance verification complete - all components verified compliant. PART V Prototype Review Checklist in progress - Design System, Component Library, and Wireframes sections all checked. Continuing.
- Handoff document template continued. Appendix A: Quick Reference Cards - Pre/During/Post Selection checklists. Entity Selection Quick Guide. Document control (v1.0.0, v1.1.0 added CR-005). Approval section.
- - **UXMI Components (CR-005):** Button.tsx (117 lines, 7 states), Tooltip.tsx (128 lines), Input.tsx (185 lines), Spinner.tsx (67 lines)...
- | **PART 2B: Frontend** | 2.6 Component Hierarchy, 2.7 State Management, 2.8 Phase Progression, 2.9 User Interaction (CR-005) |
- - **CR-005 Detail**: Seven States mandatory, 300ms tooltip delay, WHAT/WHY/HOW errors, Tab/Enter/Escape keyboard support
- - **uxmi/** ← UXMI Component Library (CR-005): Tooltip, Button, Input, Spinner, ProgressBar, Toast, ErrorDisplay
- | `transitionDuration` | 150ms, 200ms, 300ms | **UXMI CR-005 compliant** - micro-interaction timing |
- ├── UXMI Library (CR-005): Button, Input, Spinner, ProgressBar, Toast, Tooltip, ErrorDisplay
- | **5** | **Integration** | **Tech Lead + PM + UX** | **UXMI Audit Checklist (CR-005)** |
- - Layer 4: The actual constraint satisfaction (CR-001 through CR-005 with code snippets)
- │  All Constitutional Requirements (CR-001 to CR-005) embedded in diagrams               │
- │  2.6  Component Hierarchy          (CR-005: UXMI)                  ✅                   │
- - **src/client/components/uxmi/** (7 files): All ✓ CR-005, ErrorDisplay.tsx also ✓ CR-003
- │       │                     🎨 UXMI LIBRARY (CR-005)                            │      │
- - Level 4: UXMI (CR-005) - Seven States, Tooltips, Loading, Errors, Keyboard, Animation
- - EXISTS: CR-005 (1,077 lines), UI Design System (780 lines), Visual Mockups (930 lines)
- - **CR-005**: USER EXPERIENCE MICRO-INTERACTIONS (7 states, tooltips, helpful errors)
- │ CR-005: UXMI    │          │  (13 Flowcharts)│          │ P5: Reversible  │
- │                    7 UXMI COMPONENTS - CR-005 COMPLIANT                      │
- │   │  C4: TooltipDelay == 300ms             (CR-005)                 │       │
- │   │  C3: ButtonStates == 7                 (CR-005 UXMI)            │       │
- │  │  • 2.6 Component Hierarchy (CR-005)                                    │ │
- │   │  C4: TooltipDelay == 300ms             (CR-005 UXMI)            │       │
- │  3. UXMI COMPONENT STATES (CR-005)                                          │
- │   │  C3: ButtonStates == 7                 (CR-005)                 │       │
- │  └── Node 1.5: CR-005 UXMI 7-State Components                               │
- | ADDENDUM_002_UX_MICRO_INTERACTIONS.md | 90 KB | CR-005: UXMI specification |
- - CR-005: UXMI - Seven States for EVERY element, Gate 5 compliance MANDATORY
- │   │ Button.tsx:*       │ CR-005    │ ✅ 7 states implemented     │          │
- │  CR-005: UXMI 7-States      → 7 components with 7 states each              │
- - Five Constitutional Requirements (CR-001 to CR-005) govern all development
- │  │   • CR-005 Compliance Demonstration                                │    │
- │   │ Button.tsx         │ CR-005    │ ✅ 7 states implemented     │          │
- │   │ CR-005    │ UXMI 7 States       │ /uxmi/*.tsx      │ ✅ PASS │          │
- │   │ CR-005    │ Spec:118-124        │ /uxmi/*.tsx      │ ✅ PASS │          │
- | CR-005 | UXMI Compliance | All components | Seven States, tooltips, errors |
- - 2026-01-17: ADDENDUM_001 (Token), CR-005 established, ADDENDUM_002 (UXMI)
- | CR-005 UXMI | `01_SOURCE_DOCUMENTS/ADDENDUM_002_UX_MICRO_INTERACTIONS.md` |
- ║   UXMI COMPONENTS (CR-005):       7/7 IMPLEMENTED (100%)                  ║
- | **Defines CRs** | CR-001 to CR-005 that all architecture must comply with |
- - CR Compliance: CR-003 (Sentry), CR-005 (UXMI tools), All CRs (Claude Code)
- | CR-005 | UXMI 7-States | All UXMI components | Button/Input/etc | ✅ 100% |

---

## CONSTITUTIONAL REQUIREMENT BLOCKS (VERBATIM)

```
Constitutional Compliance Matrix: CR-001 (no buy/sell buttons), CR-002 (equal visual weight bullish/bearish), CR-003 (neutral observation styling), CR-004 (Fresh/Recent/Stale color scale), CR-005 (7-state component styling). Primary Colors: #3B82F6 primary, #2563EB hover, #1D4ED8 active. Token Lifecycle Colors starting. Continuing.

Batch 2 ingested (lines 76-150). Token Lifecycle Colors (CR-004): #22C55E fresh (>1hr), #EAB308 recent (<30min, pulse), #DC2626 stale (<5min, urgent pulse). Token countdown thresholds with visual treatments. Feedback Colors: success #22C55E, error #DC2626, warning #EAB308, info #3B82F6 (all with 15% opacity backgrounds). Neutral Palette: background #0F172A, surface #1E293B, surface-elevated #334155, text-primary #F8FAFC, text-secondary #94A3B8, text-muted #64748B. UXMI Colors: focus-ring #06B6D4 cyan, tooltip-bg #1A2332. Continuing.

```

```
Constitutional box (CR-001 to CR-004, INVIOLABLE RULES). Continuing.

Batch 11 ingested (lines 751-825). C3 External Dependencies: CIA-SIE Backend :8000, Kite Connect API, Anthropic API. Component Interfaces: Health Router (GET /live, /ready, /backend), Ignition Router (POST /start, /abort, GET /status), Telemetry Router (GET /stream SSE, /snapshot), Config Router (GET /models, PUT /model/select). Phase 0 Token Capture Flow starting: 6-module architecture, MANDATORY prerequisite before Pre-Ignition Scanner. MCI Startup node (localhost:8080). Continuing.

```

```
CONSTITUTIONAL │          │ 🏗️ ARCHITECTURE  │          │ 🛡️ SUPERVISED   │
    │   REQUIREMENTS   │          │  DOCUMENTATION   │          │   EXECUTION     │
    └────────┬────────┘          └────────┬────────┘          └────────┬────────┘
             │                            │                            │
```

```
CONSTITUTIONAL REQUIREMENTS (ALL VERIFIED ✅)                              │
│  ═══════════════════════════════════════════                                │
│  CR-001: Token Validity     → tokenStore.ts:108 validateTokens()            │
│  CR-002: Graceful Shutdown  → shutdownStore.ts:47-78 (6 steps)             │
```

```
ConstitutionalRequirement                                             │
│       a owl:Class ;                                                         │
│       rdfs:subClassOf mci:Requirement ;                                     │
│       mci:violationSeverity "P1_CRITICAL" ;                                 │
```

```
Constitutional):    6 nodes                                        │
│  Layer 2 (Architecture):     13 nodes  ◄── NEW                               │
│  Layer 3 (Quality Gates):     6 nodes                                        │
│  Layer 4A (Dev Lifecycle):   14 nodes                                        │
```

```
CONSTITUTIONAL FOUNDATION (6 nodes)                                │
│  ══════════════════════════════════════════════                              │
│  ├── Node 1.0: Master Use Case Specification (ROOT)                         │
│  ├── Node 1.1: CR-001 Token Validity                                        │
```

```
Constitutional        6         6         0     100%  🟢           │
│  Layer 2: Architecture         13         0        13       0%  🔴           │
│  Layer 3: Quality Gates         6         6         0     100%  🟢           │
│  Layer 4A: Dev Lifecycle       14        13         1      93%  🟡           │
```

```
ConstitutionalRequirement ;                                     │
│       mci:name "Token Lifecycle Accuracy" ;                                 │
│       mci:sacredValue "6:00 AM IST" ;                                       │
│       mci:implementedBy mci:tokenStore ;                                    │
```

```
ConstitutionalRequirement ;                                     │
│       mci:name "Token Lifecycle Accuracy" ;                                 │
│       mci:sacredValue "6:00 AM IST" ;                                       │
│       mci:implementedBy mci:TokenTimer, mci:tokenStore ;                    │
```

