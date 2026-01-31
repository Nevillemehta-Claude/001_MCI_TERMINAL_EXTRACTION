# VERBATIM IMPLEMENTATION CONTENT - COMPLETE EXTRACTION

**Source:** b8937bc2-ac10-4287-8ced-af96ac5f6f0b.jsonl
**Extraction Date:** 2026-01-25

---

## ZUSTAND STORES - ALL REFERENCES

### tokenStore

- - **src/client/stores/** (5 files): tokenStore (CR-001/004), ignitionStore (P2), scannerStore (P3), shutdownStore (CR-002)
- | `src/client/stores/` | telemetryStore.ts, shutdownStore.ts, scannerStore.ts, tokenStore.ts, ignitionStore.ts |
- - **Gate E-3**: tokenStore.ts - 6 states: ABSENT, VALIDATING, VALID, EXPIRING, EXPIRED, INVALID
- │       │  │ tokenStore │  │scannerStore│  │ignitionStore│  │telemetryStore│      │      │
- └── Zustand Stores: tokenStore, scannerStore, ignitionStore, telemetryStore, shutdownStore
- | CR-001 | Token Validity | `validateToken()` before API calls | tokenStore.ts | ✅ 100% |
- | CR-004 | 6AM IST Expiry | `setUTCHours(0, 30, 0, 0)` | tokenStore.ts:23-33 | ✅ 100% |
- │  │ CR-001 ──────────│───│──> TokenStore    │   │ tokenStore.ts    │                │
- | tokenStore.ts | 296 | CR-001, CR-004 | localStorage | token, isValid, expiresAt |
- └── Stores: tokenStore, ignitionStore, scannerStore, shutdownStore, telemetryStore
- │   Source: tokenStore.ts                                                     │
- │   │  **Location**: src/client/stores/tokenStore.ts:38               │       │
- |  ├── client/stores/tokenStore.ts (296 lines) ✅                              |
- │  ├── 5 Zustand Stores (tokenStore, scannerStore, ignitionStore,             │
- │   │  (tokenStore.ts) ──IMPLEMENTS──→ (CR-004)                       │       │
- │  CR-001: Token Validity     → tokenStore.ts:108 validateTokens()            │
- │   mci:tokenStore                                                            │
- - **MOD-TC-3 Token Storage (tokenStore.ts)**: Zustand, localStorage persistence
- │   Fact B: "tokenStore uses setUTCHours(0, 30, 0, 0)"                        │
- │   mci:tokenStore_line38                                                     │

### scannerStore

- - **src/client/stores/** (5 files): tokenStore (CR-001/004), ignitionStore (P2), scannerStore (P3), shutdownStore (CR-002)
- | `src/client/stores/` | telemetryStore.ts, shutdownStore.ts, scannerStore.ts, tokenStore.ts, ignitionStore.ts |
- └── Zustand Stores: tokenStore, scannerStore, ignitionStore, telemetryStore, shutdownStore
- │       │  │ tokenStore │  │scannerStore│  │ignitionStore│  │telemetryStore│      │      │
- └── Stores: tokenStore, ignitionStore, scannerStore, shutdownStore, telemetryStore
- │  │  scannerStore   │ ← 12-point pre-ignition checks                         │
- │  ├── 5 Zustand Stores (tokenStore, scannerStore, ignitionStore,             │
- |  └── client/stores/scannerStore.ts (312 lines) ✅                            |
- | scannerStore.ts | - | checks[], isScanning, allPassed | none (ephemeral) |
- | scannerStore.ts | 312 | - | none | checks[], isScanning, allPassed |
- - L776-780: Examining scannerStore and TelemetryDashboard
- | scannerStore.ts | 312 | **12-point NSE/BSE checks** |
- | 58 | scannerStore.ts | 312 | 12-point pre-ignition |
- | 58 | scannerStore.ts | 312 | Store |
- 3. scannerStore.ts (state)
- │   │   ├── scannerStore.ts

### ignitionStore

- - **src/client/stores/** (5 files): tokenStore (CR-001/004), ignitionStore (P2), scannerStore (P3), shutdownStore (CR-002)
- | `src/client/stores/` | telemetryStore.ts, shutdownStore.ts, scannerStore.ts, tokenStore.ts, ignitionStore.ts |
- └── Zustand Stores: tokenStore, scannerStore, ignitionStore, telemetryStore, shutdownStore
- │       │  │ tokenStore │  │scannerStore│  │ignitionStore│  │telemetryStore│      │      │
- └── Stores: tokenStore, ignitionStore, scannerStore, shutdownStore, telemetryStore
- | ignitionStore.ts | 320 | - | sessionStorage | backend, isIgniting, sessionId |
- |  ├── client/stores/ignitionStore.ts (320 lines) ✅                           |
- │  │ ignitionStore   │ ← 4 Indian Brokers                                     │
- │  ├── 5 Zustand Stores (tokenStore, scannerStore, ignitionStore,             │
- | ignitionStore.ts | - | backend, isIgniting, sessionId | sessionStorage |
- | 59 | ignitionStore.ts | 320 | 4 Indian brokers |
- | ignitionStore.ts | 320 | **4 Indian brokers** |
- 3. ignitionStore.ts (connection state)
- | 59 | ignitionStore.ts | 320 | Store |

### telemetryStore

- Batch 8 ingested (lines 525-599). WebSocket test continued: error/close handlers, heartbeat every 30 seconds. Test trading events via paper-api.[out-of-scope-broker].markets. Troubleshooting: connection refused → check keys, auth failed → verify paper keys. Step 2.2 Design WebSocket Manager Architecture: Claude prompt for production-grade manager with exponential backoff (1s→2s→4s→8s→max 30s), multiple streams (trade_updates, account_updates), heartbeat, graceful shutdown, Zustand telemetryStore integration. Continuing.
- Batch 10 ingested (lines 675-749). Step 2.3 continued: Test compilation with bun run typecheck. Step 2.4 Integrate WebSocket with telemetryStore: Import WebSocketManager, add wsManager instance to store state, add methods (connectWebSocket, disconnectWebSocket, subscribeToStreams), add message handlers (handleTradeUpdate, handleAccountUpdate), register handlers with wsManager.on('message'). Cursor Cmd+K inline edit instructions. Continuing.
- Batch 14 ingested (lines 975-1048). Run tests: 10 tests expected, 92.5% coverage. Coverage targets: Statements >90%, Branches >85%, Functions >90%. Step 2.8 Commit WebSocket Integration: git status shows 4 files changed (websocketManager.ts, test file, telemetryStore.ts, TelemetryDashboard.tsx). Run full test suite, commit with detailed message. Continuing.
- - **Phase 2 (4-5 days):** WebSocket integration with [Out-of-Scope-Broker] (wss://paper-api.[out-of-scope-broker].markets/stream), exponential backoff, telemetryStore integration, 92% test coverage
- | `src/client/stores/` | telemetryStore.ts, shutdownStore.ts, scannerStore.ts, tokenStore.ts, ignitionStore.ts |
- └── Zustand Stores: tokenStore, scannerStore, ignitionStore, telemetryStore, shutdownStore
- │       │  │ tokenStore │  │scannerStore│  │ignitionStore│  │telemetryStore│      │      │
- └── Stores: tokenStore, ignitionStore, scannerStore, shutdownStore, telemetryStore
- - CR-001 (Real-time Data): telemetryStore.ts, MarketDataPanel.tsx, telemetry.ts
- | telemetryStore.ts | - | positions[], orders[], health, pnl | none (real-time) |
- |  ├── client/stores/telemetryStore.ts (226 lines) ✅                          |
- │  │ telemetryStore  │ ← Positions, Orders, Metrics                           │
- │  │                     telemetryStore, shutdownStore)                       │
- | telemetryStore.ts | 226 | - | none | positions[], orders[], health, pnl |
- - CR-001 (Real-time): telemetryStore.ts, MarketDataPanel.tsx, telemetry.ts
- | telemetryStore.ts | 226 | Real-time positions |
- | 60 | telemetryStore.ts | 226 | Dashboard data |
- | 60 | telemetryStore.ts | 226 | Store |

### shutdownStore

- - **src/client/stores/** (5 files): tokenStore (CR-001/004), ignitionStore (P2), scannerStore (P3), shutdownStore (CR-002)
- | `src/client/stores/` | telemetryStore.ts, shutdownStore.ts, scannerStore.ts, tokenStore.ts, ignitionStore.ts |
- │       │  │shutdownStore│                                                         │      │
- └── Zustand Stores: tokenStore, scannerStore, ignitionStore, telemetryStore, shutdownStore
- | CR-002 | Graceful Shutdown | 6-step DEFAULT_STEPS | shutdownStore.ts:47-78 | ✅ |
- └── Stores: tokenStore, ignitionStore, scannerStore, shutdownStore, telemetryStore
- | **CR-002** | Graceful Shutdown | 6-step sequence in shutdownStore.ts | ✅ 100% |
- │  │                     telemetryStore, shutdownStore)                       │
- |  └── client/stores/shutdownStore.ts (288 lines) ✅                           |
- │  │ shutdownStore   │ ← CR-002: 6-step graceful shutdown                     │
- │   │ shutdownStore.ts   │ CR-002    │ ✅ 6-step shutdown          │          │
- │  CR-002: Graceful Shutdown  → shutdownStore.ts:47-78 (6 steps)             │
- │   │ CR-002    │ Graceful Shutdown   │ shutdownStore.ts │ ✅ PASS │          │
- | CR-002 | Graceful Shutdown | 6-step sequence | shutdownStore.ts | ✅ 100% |
- | shutdownStore.ts | CR-002 | step (1-6), isShuttingDown, completed | - |
- | shutdownStore.ts | 288 | CR-002 | none | step (1-6), isShuttingDown |
- - CR-002 (Shutdown): shutdownStore.ts, ShutdownPanel.tsx, shutdown.ts
- | 61 | shutdownStore.ts | 288 | CR-002 6-step shutdown |
- | shutdownStore.ts | 288 | CR-002: 6-step shutdown |
- | 61 | shutdownStore.ts | 288 | Store |


---

## FILE REFERENCES WITH LINE NUMBERS

- **25.md**: Lines 6
- **ADDENDUM_001_TOKEN_CAPTURE_MODULE.md**: Lines 5
- **ADDENDUM_002_UX_MICRO_INTERACTIONS.md**: Lines 6
- **ADVANCED_TECHNOLOGIES_FOR_KNOWLEDGE_SYNTHESIS.md**: Lines 67
- **App.tsx**: Lines 294
- **BATCH_PROCESSING_EXECUTION_DIRECTIVE_v2.md**: Lines 04
- **BIFURCATION_CLASSIFICATION_DECLARATIONS_v2.md**: Lines 03
- **CLAUDE_CODE_INSTRUCTION_v2.md**: Lines 4
- **FILE_INDEX.md**: Lines 7
- **MASTER_CONTEXT.md**: Lines 3
- **MCI_PRODUCTION_LIFECYCLE_MASTER_MANIFEST.md**: Lines 2
- **PROJECT_STATUS_EXECUTION_AUTHORITY.md**: Lines 3
- **README.md**: Lines 11
- **SESSION_COMPLETE_READABLE.md**: Lines 3
- **SIE_ECOSYSTEM_ARCHITECTURE.md**: Lines 6
- **TelemetryDashboard.tsx**: Lines 25
- **UNIVERSAL_FILE_GOVERNANCE_PROTOCOL_v3.md**: Lines 07
- **auth.ts**: Lines 35, 38
- **shutdownStore.ts**: Lines 47
- **telemetry.ts**: Lines 31
- **tokenStore.ts**: Lines 23, 38, 49, 75, 108
- **types.ts**: Lines 152, 174

---

## SERVER ROUTES - ALL REFERENCES

### /api/auth

- │  │                              /api/auth                                             │  │
- │     │                    │  POST /api/auth     │                   │              │      │
- - Rule 4: Auth Failure Spike - 10 events/5 min threshold on /api/auth/validate
- - POST /api/auth/capture-token
- - GET /api/auth/login-url
- - GET /api/auth/status

### /api/scanner


### /api/ignition

- Batch 16 ingested (lines 1123-1197). Email template for backend team requesting: Health Check (GET /api/health/scan), Ignition (POST /api/ignition/start), Shutdown (POST /api/shutdown/graceful), Status (GET /api/status) endpoints. Authentication query (JWT/API Key/OAuth), WebSocket events, rate limits, error format. Schedule integration call. Document to docs/cia-sie-pure-api.md. Step 3.2 Create API Client starting. Continuing.
- Batch 9 ingested (lines 601-675). C2 Legend: React 18+ SPA, Hono 4.0+, Pre-Ignition Scanner, Kite Token Manager, Anthropic Model Selector. Container Responsibilities: 60fps UI, SSE streams, 12 checks in <500ms, token warnings at T-60/T-30/T-5 minutes. C3 Component Diagram starting: Hono API Server internal components. API Layer with Health Router (/api/health/*), Ignition Router (/api/ignition/*). Continuing.
- │  │                              /api/ignition                                         │  │
- │     │                │  POST /api/ignition │                   │              │          │
- - Ignition: POST /api/ignition/start, POST /api/ignition/stop, POST /api/emergency-stop

### /api/telemetry

- Batch 10 ingested (lines 676-750). C3 Component Diagram continued: API Layer routes - Telemetry Router (/api/telemetry/stream), Config Router (/api/config/*). Service Layer: PreIgnitionScanner (scanner.ts, runAllChecks(), validateCheck()), KiteTokenService (kite.ts, getTokenStatus(), getTimeToExpiry()), AnthropicService (anthropic.ts, listModels(), selectModel()). State Management: SystemStateMachine (DORMANT→ACTIVE→SHUTDOWN), TelemetryEmitter (SSE Broadcast), Constitutional box (CR-001 to CR-004, INVIOLABLE RULES). Continuing.
- │  │                              /api/telemetry                                        │  │
- - Telemetry: GET /api/telemetry, GET /api/positions, GET /api/health, GET /api/orders

### /api/shutdown

- Batch 16 ingested (lines 1123-1197). Email template for backend team requesting: Health Check (GET /api/health/scan), Ignition (POST /api/ignition/start), Shutdown (POST /api/shutdown/graceful), Status (GET /api/status) endpoints. Authentication query (JWT/API Key/OAuth), WebSocket events, rate limits, error format. Schedule integration call. Document to docs/cia-sie-pure-api.md. Step 3.2 Create API Client starting. Continuing.
- │  │                              /api/shutdown                                         │  │


---

## COMPONENT FILES - ALL REFERENCES

### TokenCaptureForm

- Directory structure: server (routes: auth, health, ignition, telemetry; services: scanner, kite, anthropic), client (App.tsx, components/TokenCaptureForm.tsx). CRs embedded in prompt. Phase 0 requirements. Cursor supporting prompt. Appendix A: Traceability Matrix begins.
- - TOKEN LAYER: TokenCaptureForm, TokenPasteInput, TokenValidationStatus, TokenTimer, TokenExpiryAlert
- - **Phase 0:** TokenCaptureForm.tsx (293 lines, Kite), TokenTimer.tsx (6AM IST), CredentialsHelper.tsx
- - Phase 0 modules: TokenCaptureForm, TokenTimer (6:00 AM IST), Token Storage Service
- - **MOD-TC-1 TokenCaptureForm.tsx**: Large text input, "Validate Token" button
- │  Phase 0: Token Capture    → TokenCaptureForm, CredentialsHelper           │
- - CR-002 (Token Persistence): tokenStore.ts, TokenCaptureForm.tsx, auth.ts
- │      │    TokenCaptureForm.tsx                                       │
- - `/src/client/components/phase0/__tests__/TokenCaptureForm.test.tsx`
- - `/src/client/components/phase0/TokenCaptureForm.tsx` - Line 120

### TokenTimer

- - TOKEN LAYER: TokenCaptureForm, TokenPasteInput, TokenValidationStatus, TokenTimer, TokenExpiryAlert
- - **Phase 0:** TokenCaptureForm.tsx (293 lines, Kite), TokenTimer.tsx (6AM IST), CredentialsHelper.tsx
- - Phase 0 modules: TokenCaptureForm, TokenTimer (6:00 AM IST), Token Storage Service
- │       mci:implementedBy mci:TokenTimer, mci:tokenStore ;                    │
- | CR-004 | Token Accuracy | TokenTimer.tsx | 6:00 AM IST hardcoded |
- - **MOD-TC-2 TokenTimer.tsx**: 6:00 AM IST target, HH:MM:SS format
- - TokenCaptureForm.tsx, TokenTimer.tsx, kite.ts, tokenStore.ts
- - `/src/client/components/phase0/TokenTimer.tsx` - Lines 60-61
- ├── Components: TokenTimer, tokenStore, IgnitionButton, etc.
- │   │   ├── token/         (TokenCaptureForm, TokenTimer)

### PreIgnitionScanner

- Batch 20 ingested (lines 1426-1500). CheckResult interface: id, name, status (pass/fail/warn), latency_ms, details. All 12 checks <500ms total. Step 4 State Machine: SystemState type (DORMANT, PRE_FLIGHT, READY, IGNITION, ACTIVE, SHUTDOWN). Step 5 React Dashboard components: PreIgnitionScanner, ModelSelector, IgnitionButton, TelemetryDashboard, KiteTokenCountdown. Design tokens: Background #0a0e17, Accent #06b6d4, Success #10b981, Warning #f59e0b, Error #ef4444. Step 6 Constitutional Constraints Enforcement: CR-001 (ZERO trading signal access), CR-002 (expose contradictions), CR-003 (descriptive only). Continuing.
- Batch 10 ingested (lines 676-750). C3 Component Diagram continued: API Layer routes - Telemetry Router (/api/telemetry/stream), Config Router (/api/config/*). Service Layer: PreIgnitionScanner (scanner.ts, runAllChecks(), validateCheck()), KiteTokenService (kite.ts, getTokenStatus(), getTimeToExpiry()), AnthropicService (anthropic.ts, listModels(), selectModel()). State Management: SystemStateMachine (DORMANT→ACTIVE→SHUTDOWN), TelemetryEmitter (SSE Broadcast), Constitutional box (CR-001 to CR-004, INVIOLABLE RULES). Continuing.
- │  Phase 1: Pre-Ignition     → PreIgnitionScanner (12 checks)                │
- │      │    PreIgnitionScanner.tsx (12 health checks)                  │
- - **Phase 1:** PreIgnitionScanner.tsx (203 lines, 12-point check)
- ├── phase1/PreIgnitionScanner.tsx

### ScanCheckItem


### BackendSelector

- - **Phase 2:** BackendSelector.tsx (4 Indian brokers), IgnitionButton.tsx (255 lines, ARM→IGNITE)
- Phase 2: Ignition (BackendSelector + IgnitionButton) → Ignited ↓ | Token Expired → Phase 0
- │  Phase 2: Ignition         → BackendSelector, IgnitionButton               │
- - **BackendSelector.tsx**: 4 backends with icons (🏦 ICICI, 🏛️ HDFC, 🏢 Kotak)
- │      │    BackendSelector.tsx + IgnitionButton.tsx                   │
- - **Phase 2**: BackendSelector (4 Indian Brokers), IgnitionButton
- - **BackendSelector.tsx complete**: Zerodha Kite with 🪁 icon
- - Step 6: Phase 2 Ignition (BackendSelector, IgnitionButton)
- │   │   ├── ignition/      (BackendSelector, IgnitionButton)
- ├── phase2/BackendSelector.tsx + IgnitionBtn.tsx

### IgnitionButton

- Batch 20 ingested (lines 1426-1500). CheckResult interface: id, name, status (pass/fail/warn), latency_ms, details. All 12 checks <500ms total. Step 4 State Machine: SystemState type (DORMANT, PRE_FLIGHT, READY, IGNITION, ACTIVE, SHUTDOWN). Step 5 React Dashboard components: PreIgnitionScanner, ModelSelector, IgnitionButton, TelemetryDashboard, KiteTokenCountdown. Design tokens: Background #0a0e17, Accent #06b6d4, Success #10b981, Warning #f59e0b, Error #ef4444. Step 6 Constitutional Constraints Enforcement: CR-001 (ZERO trading signal access), CR-002 (expose contradictions), CR-003 (descriptive only). Continuing.
- - **IgnitionButton.tsx**: 1+ backend selected, all checks passed, confirmation dialog, UXMI Button with loading
- - **Phase 2:** BackendSelector.tsx (4 Indian brokers), IgnitionButton.tsx (255 lines, ARM→IGNITE)
- Phase 2: Ignition (BackendSelector + IgnitionButton) → Ignited ↓ | Token Expired → Phase 0
- │  Phase 2: Ignition         → BackendSelector, IgnitionButton               │
- │      │    BackendSelector.tsx + IgnitionButton.tsx                   │
- - **Phase 2**: BackendSelector (4 Indian Brokers), IgnitionButton
- - Button → TokenCaptureForm, IgnitionButton, ShutdownButton
- - Step 6: Phase 2 Ignition (BackendSelector, IgnitionButton)
- │   │   ├── ignition/      (BackendSelector, IgnitionButton)

### TelemetryDashboard

- Batch 20 ingested (lines 1426-1500). CheckResult interface: id, name, status (pass/fail/warn), latency_ms, details. All 12 checks <500ms total. Step 4 State Machine: SystemState type (DORMANT, PRE_FLIGHT, READY, IGNITION, ACTIVE, SHUTDOWN). Step 5 React Dashboard components: PreIgnitionScanner, ModelSelector, IgnitionButton, TelemetryDashboard, KiteTokenCountdown. Design tokens: Background #0a0e17, Accent #06b6d4, Success #10b981, Warning #f59e0b, Error #ef4444. Step 6 Constitutional Constraints Enforcement: CR-001 (ZERO trading signal access), CR-002 (expose contradictions), CR-003 (descriptive only). Continuing.
- Batch 14 ingested (lines 975-1048). Run tests: 10 tests expected, 92.5% coverage. Coverage targets: Statements >90%, Branches >85%, Functions >90%. Step 2.8 Commit WebSocket Integration: git status shows 4 files changed (websocketManager.ts, test file, telemetryStore.ts, TelemetryDashboard.tsx). Run full test suite, commit with detailed message. Continuing.
- Batch 11 ingested (lines 750-824). Step 2.5 Update TelemetryDashboard Component: Replace simulated connection with real WebSocket. useEffect pattern: connectWebSocket() → subscribeToStreams(['trade_updates', 'account_updates']) → cleanup on unmount with disconnectWebSocket(). Cursor Cmd+K replacement instructions. Add reconnection UI starting. Continuing.
- │  Phase 3: Running          → TelemetryDashboard                            │
- │  2  │  TelemetryDashboard.tsx  │  ~25   │  US symbols → Indian symbols │
- │      │    TelemetryDashboard.tsx (6 panels)                          │
- │  FIX #2: TelemetryDashboard.tsx Line 25                              │
- - **Phase 3:** TelemetryDashboard.tsx **⚠️ NEEDS FIX: US symbols**
- | 2 | TelemetryDashboard.tsx | ~25 | US symbols | Indian symbols |
- | 2 | TelemetryDashboard.tsx | ~25 | US symbols → Indian symbols |

### ShutdownPanel

- │  Phase 4: Shutdown         → ShutdownPanel (6 steps)                       │
- │      │    ShutdownPanel.tsx (CR-002: 6-step sequence)                │
- - CR-002 (Shutdown): shutdownStore.ts, ShutdownPanel.tsx, shutdown.ts
- ├── phase4/ShutdownPanel.tsx

### PositionsPanel

- │       │            │            │             │   │ PositionsPanel   │  │              │
- | CR-002 | Expose Contradictions | PositionsPanel.tsx | Side-by-side conflict |
- - TokenPanel, BackendPanel, PositionsPanel, OrdersPanel, PnLPanel, AILogPanel
- │   └── PositionsPanel, OrdersPanel, AcctPanel, MktData, HealthPanel
- - G-3: PositionsPanel.tsx (CR-002 CRITICAL - no reconciliation)
- - VERIFICATION GATE: Gate G (PositionsPanel review)
- 4. PositionsPanel.tsx (CR-002 conflict display)

### OrdersPanel

- │       │            │            │             │   │ OrdersPanel      │  │              │
- - TokenPanel, BackendPanel, PositionsPanel, OrdersPanel, PnLPanel, AILogPanel
- - **G-4**: OrdersPanel.tsx - Display only, NO action buttons (CR-001)
- │   └── PositionsPanel, OrdersPanel, AcctPanel, MktData, HealthPanel
- 5. OrdersPanel.tsx (order tracking)

### AccountPanel

- │       │            │            │             │   │ AccountPanel     │  │              │

### App.tsx

- Directory structure: server (routes: auth, health, ignition, telemetry; services: scanner, kite, anthropic), client (App.tsx, components/TokenCaptureForm.tsx). CRs embedded in prompt. Phase 0 requirements. Cursor supporting prompt. Appendix A: Traceability Matrix begins.
- │                              │      App.tsx        │                                     │
- │  ├── App.tsx, main.tsx                                                      │
- │  PHASE FLOW (App.tsx)                                                       │
- │   ├── client/          (React components, stores, App.tsx)    ~50 files    │
- - Client Core: App.tsx, main.tsx, index.css, stores/index.ts, App.test.tsx
- │  3  │  App.tsx                 │  294   │  CIA-SIE-START-STOP → MCI    │
- │  FIX #3: App.tsx Line 294                                            │
- - Diagram 2.6: Component Hierarchy - App.tsx as Phase Router
- | 3 | App.tsx | 294 | CIA-SIE-START-STOP → MCI | MEDIUM |

