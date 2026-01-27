# MCI SYSTEM ARCHITECTURE OVERVIEW

**Extracted from:** Session b8937bc2-ac10-4287-8ced-af96ac5f6f0b
**Extraction Date:** 2026-01-25
**Classification:** ARCHITECTURE

---

## FUNDAMENTAL PRINCIPLE: ENGINE vs COCKPIT

### The Core Distinction

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MCI DOES NOT TRADE                                │
│                    MCI DOES NOT EXECUTE ORDERS                       │
│                    MCI WATCHES THE ENGINE                            │
│                                                                      │
│   CIA-SIE-PURE = ENGINE        MCI = COCKPIT                         │
│   ─────────────────────────────────────────────────────────────────  │
│   Executes trades              Monitors & Controls                   │
│   DOES the work                WATCHES the work                      │
│   Python/FastAPI               TypeScript/React                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Analogy: Car Dashboard

- **Dashboard shows** speed, fuel, RPM - but dashboard does NOT drive
- **Engine does** the actual work - dashboard can only START/STOP and MONITOR
- **MCI is the dashboard** - CIA-SIE-PURE is the engine

---

## TECHNOLOGY STACK

### Frontend (MCI - The Cockpit)

| Category | Technology | Purpose |
|----------|------------|---------|
| Runtime | **Bun** | JavaScript runtime (faster than Node.js) |
| Build | **Vite** | Build tool and dev server |
| Language | **TypeScript** | Type-safe JavaScript (strict mode) |
| Framework | **React 18** | UI component framework |
| State | **Zustand** | State management (stores) |
| Styling | **Tailwind CSS** | Utility-first styling |

### Backend (MCI Server)

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | **Hono** | Lightweight web framework for Bun |

### Testing Frameworks

| Category | Technology | Purpose |
|----------|------------|---------|
| Unit Tests | **Vitest** | Jest-compatible test runner |
| E2E Tests | **Playwright** | Browser automation |
| Mutation | **Stryker** | Mutation testing |
| Mocking | **MSW** | Mock Service Worker |
| Load | **Artillery** | Performance testing |

### Backend Engine (CIA-SIE-PURE - The Engine)

| Category | Technology | Purpose |
|----------|------------|---------|
| Language | **Python** | Core trading logic |
| Framework | **FastAPI** | API framework |
| Purpose | Execute algorithmic trades | The actual trading work |

---

## THE 5 RUNTIME PHASES

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MCI RUNTIME PHASES                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   PHASE 0: TOKEN CAPTURE                                             │
│   └── User enters token → Validation → Expiry calculated            │
│                                                                      │
│   PHASE 1: SCANNER (Pre-Ignition)                                    │
│   └── Network check → API test → WebSocket test → Backend           │
│                                                                      │
│   PHASE 2: IGNITION                                                  │
│   └── Initialize systems → Start WebSocket → Load data              │
│                                                                      │
│   PHASE 3: TELEMETRY                                                 │
│   └── Real-time data → P&L tracking → Position monitoring           │
│                                                                      │
│   PHASE 4: SHUTDOWN                                                  │
│   └── CR-002 6-step graceful termination                            │
│                                                                      │
│   Flow: 0 → 1 → 2 → 3 → 4 → (back to 0 next day)                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## BROKER BACKENDS

MCI supports 4 Indian broker backends (NOT Alpaca/Polygon):

| Broker | API Base | WebSocket |
|--------|----------|-----------|
| **Zerodha Kite** (Primary) | `api.kite.trade` | `wss://ws.kite.trade` |
| **ICICI Direct** | ICICI APIs | ICICI WS |
| **HDFC Sky** | HDFC APIs | HDFC WS |
| **Kotak Neo** | Kotak APIs | Kotak WS |

### Token Management
- **Token Expiry:** 6:00 AM IST daily (CR-004 SACRED)
- **Token Type:** `kiteAccessToken`
- **Validation:** Required before ALL operations (CR-001)

---

## STATE MANAGEMENT ARCHITECTURE

### Zustand Stores (5 Core Stores)

```
Store Flow:
tokenStore → scannerStore → ignitionStore → telemetryStore → shutdownStore
```

| Store | Phase | Purpose |
|-------|-------|---------|
| `tokenStore.ts` | Phase 0 | Token capture and validation |
| `scannerStore.ts` | Phase 1 | 12-point check management |
| `ignitionStore.ts` | Phase 2 | Ignition sequence control |
| `telemetryStore.ts` | Phase 3 | Real-time data management |
| `shutdownStore.ts` | Phase 4 | Shutdown sequence (CR-002) |

---

## COMPONENT ARCHITECTURE

### Directory Structure

```
src/
├── client/                     ← React Frontend
│   ├── components/
│   │   ├── phase0/             ← Token Capture
│   │   ├── phase1/             ← Scanner
│   │   ├── phase2/             ← Ignition prep
│   │   ├── phase3/             ← Telemetry Dashboard
│   │   ├── phase4/             ← Shutdown
│   │   ├── uxmi/               ← UXMI Components (Phase 3.5)
│   │   │   ├── Button.tsx
│   │   │   ├── ErrorDisplay.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── shutdown/           ← Shutdown sequence
│   │   ├── dashboard/
│   │   ├── ignition/
│   │   ├── scanner/
│   │   └── token/
│   └── stores/                 ← State management
│
├── server/                     ← Backend
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── scanner.ts
│   │   ├── ignition.ts
│   │   └── telemetry.ts
│   └── services/
│       └── kite.ts             ← Kite API integration
│
└── App.tsx                     ← Main entry
```

### Key Components by Phase

| Phase | Components | Status |
|-------|------------|--------|
| Phase 0 | TokenCaptureForm, TokenTimer | Complete |
| Phase 1 | PreIgnitionScanner, ScanCheckItem | Complete |
| Phase 2 | BackendSelector, IgnitionButton | Complete |
| Phase 3 | TelemetryDashboard, PositionsPanel, OrdersPanel, AccountPanel | Complete |
| Phase 4 | ShutdownPanel | Complete |
| UXMI | Button, ErrorDisplay, Input, ProgressBar, Spinner, Toast, Tooltip | Complete |

---

## INTEGRATION PATTERNS

### API Contract

MCI communicates with CIA-SIE-PURE via:
- REST API for commands (START, STOP)
- WebSocket for real-time telemetry (SSE updates)

### Data Flow

```
User Input → MCI Frontend → MCI Backend → CIA-SIE-PURE
                                              ↓
User Display ← MCI Frontend ← MCI Backend ← WebSocket Telemetry
```

---

## QUALITY GATES (6 Gates)

| Gate | Name | Status |
|------|------|--------|
| Gate 0 | Requirements Complete | PASSED |
| Gate 1 | Planning Complete | PASSED |
| Gate 2 | Architecture Approved | PASSED |
| Gate 3 | Implementation Complete | PASSED |
| Gate 4 | Testing Complete | PASSED |
| Gate 5 | Deployment Ready | PASSED |

---

## LIFECYCLE PHASES (12 Development Phases)

| Phase | Name | Status |
|-------|------|--------|
| Phase 0 | Ideation & Vision | COMPLETE |
| Phase 1 | Planning & Requirements | COMPLETE |
| Phase 2 | Architecture Design | COMPLETE |
| Phase 3 | UI/UX Foundation | COMPLETE |
| Phase 3.5 | UXMI (Micro-Interactions) | COMPLETE (Review needed?) |
| Phase 4 | Core Implementation | COMPLETE |
| Phase 5 | Feature Implementation | COMPLETE |
| Phase 6 | Testing & QA | COMPLETE |
| Phase 7 | Integration | COMPLETE |
| Phase 8 | Deployment | COMPLETE |
| Phase 9 | Monitoring | COMPLETE |
| Phase 10 | Maintenance Framework | COMPLETE |
| Phase 11 | Evolution Planning | COMPLETE |
| Phase 12 | Operations Handoff | COMPLETE |

---

## CROSS-REFERENCES

- **Constitutional Constraints:** See `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md`
- **Phase Details:** See `02_ARCHITECTURE/PHASE_*` directories
- **UXMI Components:** See `02_ARCHITECTURE/UXMI/`
- **Implementation:** See `04_IMPLEMENTATION/`
