# PHASE 3: TELEMETRY DASHBOARD DESIGN

**Extracted from:** Session b8937bc2-ac10-4287-8ced-af96ac5f6f0b
**Classification:** ARCHITECTURE - Phase 3

---

## PURPOSE

Phase 3 is the main operational phase where MCI displays real-time telemetry from the running trading engine. This is the MONITORING phase - MCI watches but does NOT trade.

---

## CRITICAL PRINCIPLE

```
╔═══════════════════════════════════════════════════════════════════╗
║                      MCI WATCHES                                   ║
║                      MCI DOES NOT TRADE                            ║
║                      MCI DOES NOT EXECUTE ORDERS                   ║
║                                                                    ║
║   All trading is done by CIA-SIE-PURE (the ENGINE)                 ║
║   MCI is the COCKPIT - display and control only                    ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## DASHBOARD COMPONENTS

### TelemetryDashboard
- **File:** `src/client/components/phase3/TelemetryDashboard.tsx`
- **Purpose:** Main dashboard container with 6 panels
- **Status:** Complete

### 6 Dashboard Panels

| Panel | File | Purpose |
|-------|------|---------|
| PositionsPanel | `PositionsPanel.tsx` | Real-time P&L tracking |
| OrdersPanel | `OrdersPanel.tsx` | Order status and history |
| AccountPanel | `AccountPanel.tsx` | Account balance and margin |
| MarketPanel | `MarketPanel.tsx` | Market data and indices |
| AlertsPanel | `AlertsPanel.tsx` | System alerts and notifications |
| ControlPanel | `ControlPanel.tsx` | Engine control interface |

---

## TELEMETRY STORE

- **File:** `src/client/stores/telemetryStore.ts`
- **Purpose:** Manage real-time data streams
- **Data Sources:**
  - WebSocket connection to CIA-SIE-PURE
  - SSE (Server-Sent Events) updates
  - Polling fallback

---

## DATA FLOW

```
CIA-SIE-PURE (Engine)
        ↓
   WebSocket / SSE
        ↓
   MCI Backend (Hono)
        ↓
   telemetryStore (Zustand)
        ↓
   Dashboard Components
        ↓
   User Display
```

---

## REAL-TIME METRICS

| Metric | Update Frequency | Source |
|--------|-----------------|--------|
| Positions | Real-time | WebSocket |
| P&L | Real-time | Calculated |
| Orders | On change | WebSocket |
| Market Data | 1 second | SSE |
| Account | 5 seconds | Polling |

---

## DASHBOARD LAYOUT

```
┌─────────────────────────────────────────────────────────────────┐
│                    MCI TELEMETRY DASHBOARD                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │   POSITIONS PANEL    │  │    ORDERS PANEL      │            │
│  │   Real-time P&L      │  │    Order Status      │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │   ACCOUNT PANEL      │  │    MARKET PANEL      │            │
│  │   Balance/Margin     │  │    Indices/Data      │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │   ALERTS PANEL       │  │    CONTROL PANEL     │            │
│  │   Notifications      │  │    Engine Control    │            │
│  └──────────────────────┘  └──────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## CONTROL CAPABILITIES

From the Control Panel, users can:
- **STOP** the engine (initiates Phase 4)
- **Emergency STOP** (fast shutdown)
- **View** engine status
- **Monitor** connection health

---

## TRANSITIONS

- **From:** Phase 2 (Ignition successful)
- **To:** Phase 4 (Shutdown) on user command or token expiry
