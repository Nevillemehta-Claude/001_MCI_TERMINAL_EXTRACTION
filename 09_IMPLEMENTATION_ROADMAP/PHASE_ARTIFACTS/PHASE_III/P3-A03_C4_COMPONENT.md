# P3-A03: C4 Model — Component Diagram
## Phase III — System Architecture

**Artifact ID:** P3-A03
**Phase:** III — System Architecture
**Status:** CREATED
**Version:** 1.0
**Date:** 2026-01-27

---

## Purpose

This document defines the Component (Level 3) of the C4 model, showing internal structure of MCI containers.

---

## Frontend Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND CONTAINER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  App.tsx ─────────────────────────────────────────────────────────────────  │
│       │                                                                     │
│       ├── Phase 0: Token Capture                                           │
│       │   ├── TokenCaptureForm.tsx ──────► tokenStore                      │
│       │   ├── TokenTimer.tsx ────────────► tokenStore                      │
│       │   └── CredentialsHelper.tsx                                        │
│       │                                                                     │
│       ├── Phase 1: Pre-Ignition                                            │
│       │   ├── PreIgnitionScanner.tsx ────► scannerStore                    │
│       │   └── ScanCheckItem.tsx                                            │
│       │                                                                     │
│       ├── Phase 2: Ignition                                                │
│       │   ├── BackendSelector.tsx ───────► ignitionStore                   │
│       │   └── IgnitionButton.tsx ────────► ignitionStore                   │
│       │                                                                     │
│       ├── Phase 3: Telemetry                                               │
│       │   ├── TelemetryDashboard.tsx ────► telemetryStore                  │
│       │   ├── PositionsPanel.tsx                                           │
│       │   ├── OrdersPanel.tsx                                              │
│       │   ├── AccountPanel.tsx                                             │
│       │   ├── SystemHealthPanel.tsx                                        │
│       │   ├── MarketDataPanel.tsx                                          │
│       │   └── ActivityLogPanel.tsx                                         │
│       │                                                                     │
│       ├── Phase 4: Shutdown                                                │
│       │   └── ShutdownPanel.tsx ─────────► shutdownStore                   │
│       │                                                                     │
│       └── UXMI Library                                                     │
│           ├── Button.tsx          (7 states)                               │
│           ├── ErrorDisplay.tsx    (WHAT/WHY/HOW)                           │
│           ├── Input.tsx           (7 states)                               │
│           ├── ProgressBar.tsx                                              │
│           ├── Spinner.tsx                                                  │
│           ├── Toast.tsx           (5000ms auto-dismiss)                    │
│           └── Tooltip.tsx         (300ms delay)                            │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                           ZUSTAND STORES                             │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  tokenStore.ts     ─► Token state, validation, expiry (CR-001, CR-004)│  │
│  │  scannerStore.ts   ─► 12 checks, run status, results                 │  │
│  │  ignitionStore.ts  ─► Backend selection, ARM/IGNITE, phase           │  │
│  │  telemetryStore.ts ─► Positions, orders, account, health, market     │  │
│  │  shutdownStore.ts  ─► 6-step sequence, progress (CR-002)             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Backend Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND CONTAINER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  index.ts (Hono App) ───────────────────────────────────────────────────── │
│       │                                                                     │
│       ├── Routes                                                           │
│       │   ├── auth.ts ──────────────► KiteService                          │
│       │   │   ├── POST /validate     Validate credentials                  │
│       │   │   ├── GET  /status       Get auth status                       │
│       │   │   └── POST /logout       Clear session                         │
│       │   │                                                                 │
│       │   ├── scan.ts ──────────────► Scan checks                          │
│       │   │   ├── POST /             Run all checks                        │
│       │   │   └── GET  /check/:id    Get single check                      │
│       │   │                                                                 │
│       │   ├── ignition.ts ──────────► Engine control                       │
│       │   │   ├── POST /start        Start with backend                    │
│       │   │   ├── GET  /status       Get ignition status                   │
│       │   │   └── POST /abort        Abort ignition                        │
│       │   │                                                                 │
│       │   ├── telemetry.ts ─────────► Data endpoints                       │
│       │   │   ├── GET /positions     Current positions                     │
│       │   │   ├── GET /orders        Active orders                         │
│       │   │   ├── GET /account       Account metrics                       │
│       │   │   ├── GET /health        System health                         │
│       │   │   ├── GET /market        Market data                           │
│       │   │   └── GET /snapshot      Full snapshot                         │
│       │   │                                                                 │
│       │   └── shutdown.ts ──────────► Shutdown sequence (CR-002)           │
│       │       ├── POST /             Execute shutdown                      │
│       │       └── GET  /status       Get shutdown progress                 │
│       │                                                                     │
│       └── Services                                                         │
│           ├── kite.ts ──────────────► Kite Connect API wrapper             │
│           │   ├── validateToken()    Validate credentials                  │
│           │   ├── getPositions()     Fetch positions                       │
│           │   ├── getOrders()        Fetch orders                          │
│           │   └── getQuotes()        Fetch market data                     │
│           │                                                                 │
│           └── sentry.ts ────────────► Error tracking                       │
│               ├── captureError()     Report error                          │
│               └── logBreadcrumb()    Log breadcrumb                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Interactions

| Component | Depends On | Provides To |
|-----------|------------|-------------|
| TokenCaptureForm | tokenStore, Button, Input, ErrorDisplay | Token to all phases |
| PreIgnitionScanner | scannerStore, ScanCheckItem | Scan results to Phase 2 |
| BackendSelector | ignitionStore, Button | Backend selection to IgnitionButton |
| IgnitionButton | ignitionStore, Button, ErrorDisplay | Ignition control |
| TelemetryDashboard | telemetryStore, all panels | Real-time display |
| ShutdownPanel | shutdownStore, Button, ProgressBar | Shutdown control |

---

## Store Dependencies

| Store | Used By | Persisted |
|-------|---------|-----------|
| tokenStore | TokenCaptureForm, TokenTimer, all phases | localStorage (INV-001: daily continuity, cleared at 6:00 AM IST) |
| scannerStore | PreIgnitionScanner, ScanCheckItem | No |
| ignitionStore | BackendSelector, IgnitionButton | sessionStorage |
| telemetryStore | TelemetryDashboard, all panels | No |
| shutdownStore | ShutdownPanel | No |

---

## CR Compliance Points

| CR | Component | Implementation |
|----|-----------|----------------|
| CR-001 | tokenStore, auth.ts | Token validation before operations |
| CR-002 | shutdownStore, shutdown.ts | 6-step sequence |
| CR-003 | ErrorDisplay | WHAT/WHY/HOW format |
| CR-004 | tokenStore, TokenTimer | 6:00 AM IST expiry |
| CR-005 | All UXMI components | 7 states each |

---

*P3-A03 C4 Component v1.0 | Phase III Artifact | MCI Project*
