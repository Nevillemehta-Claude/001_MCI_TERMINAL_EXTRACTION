# MCI FEATURE REGISTRY

**Extracted from:** Session b8937bc2-ac10-4287-8ced-af96ac5f6f0b
**Extraction Date:** 2026-01-25
**Classification:** SPECIFICATIONS

---

## CORE FEATURES

### F-001: Token Capture (Phase 0)

**Status:** COMPLETE

| Component | Status | Description |
|-----------|--------|-------------|
| TokenCaptureForm | Complete | Kite credential capture |
| TokenTimer | Complete | Countdown to 6:00 AM IST expiry |
| tokenStore | Complete | Zustand state with daily persistence (INV-001) |

**CR Compliance:** CR-001, CR-004

---

### F-002: Pre-Ignition Scanner (Phase 1)

**Status:** COMPLETE

| Component | Status | Description |
|-----------|--------|-------------|
| PreIgnitionScanner | Complete | 12-point diagnostic system |
| ScanCheckItem | Complete | Individual check display |
| scannerStore | Complete | Check state management |

**12-Point Checks:**
1. Kite Token Validation
2. Kite API Connectivity
3. WebSocket Test
4. Backend Ping - Zerodha
5. Backend Ping - ICICI
6. Backend Ping - HDFC
7. Backend Ping - Kotak
8. Market Hours Check (NSE/BSE)
9. System Resources
10. Database Connection
11. CIA-SIE-PURE Status
12. Final Readiness

---

### F-003: Ignition Sequence (Phase 2)

**Status:** COMPLETE

| Component | Status | Description |
|-----------|--------|-------------|
| BackendSelector | Complete | Paper/Live selection with 4 brokers |
| IgnitionButton | Complete | Two-stage safety (ARM → IGNITE) |
| ignitionStore | Complete | Ignition state management |

**Safety Features:**
- Two-stage confirmation (ARM → IGNITE)
- Backend must be selected before arming
- All scanner checks must pass

---

### F-004: Telemetry Dashboard (Phase 3)

**Status:** COMPLETE

| Panel | Status | Description |
|-------|--------|-------------|
| PositionsPanel | Complete | Real-time P&L tracking |
| OrdersPanel | Complete | Order status and history |
| AccountPanel | Complete | Account balance and margin |
| MarketPanel | Complete | Market data and indices |
| AlertsPanel | Complete | System alerts |
| ControlPanel | Complete | Engine control interface |

**Data Sources:**
- WebSocket for real-time
- SSE for updates
- Polling fallback

---

### F-005: Shutdown Protocol (Phase 4)

**Status:** COMPLETE

| Component | Status | Description |
|-----------|--------|-------------|
| ShutdownPanel | Complete | Graceful and emergency shutdown |
| shutdownStore | Complete | 6-step sequence management |

**CR Compliance:** CR-002 (6-Step Graceful Shutdown)

---

### F-006: UXMI Component Library

**Status:** COMPLETE

| Component | File | Purpose |
|-----------|------|---------|
| Button | Button.tsx | 7-state interactive button |
| ErrorDisplay | ErrorDisplay.tsx | WHAT/WHY/HOW error display |
| Input | Input.tsx | 7-state input fields |
| ProgressBar | ProgressBar.tsx | 3-size progress bar |
| Spinner | Spinner.tsx | Animated loading indicator |
| Toast | Toast.tsx | Auto-dismiss notifications |
| Tooltip | Tooltip.tsx | 300ms delay contextual help |

**CR Compliance:** CR-005 (7 States × 7 Components)

---

## API SPECIFICATIONS

### Endpoints

| Route | Status | Endpoints |
|-------|--------|-----------|
| `/api/auth` | Complete | Token validation, expiry check |
| `/api/scanner` | Complete | 12-point check execution |
| `/api/ignition` | Complete | Start/stop engine control |
| `/api/telemetry` | Complete | Real-time data stream |
| `/api/shutdown` | Complete | 6-step shutdown sequence |

---

## DATA MODELS

### Token Model
```typescript
interface Token {
  kiteAccessToken: string;
  expiresAt: Date;  // Always 6:00 AM IST
  isValid: boolean;
}
```

### Check Model
```typescript
interface ScanCheck {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'pass' | 'fail';
  category: 'auth' | 'network' | 'broker' | 'market' | 'system';
}
```

### Telemetry Model
```typescript
interface Telemetry {
  positions: Position[];
  orders: Order[];
  account: AccountInfo;
  market: MarketData;
  alerts: Alert[];
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected';
}
```

---

## UI/UX SPECIFICATIONS

### Timing Constants
| Element | Timing | Purpose |
|---------|--------|---------|
| Hover transition | 150ms | Visual feedback |
| Active press | 100ms | Click feedback |
| Tooltip delay | 300ms | Prevent accidental show |
| Toast duration | 5000ms | Auto-dismiss |

### Color Scheme
- Primary: Mission Control blue/dark theme
- Success: Green indicators
- Error: Red indicators
- Warning: Amber indicators

### Layout
- NASA-grade mission control aesthetic
- 6-panel dashboard layout
- Real-time data updates
- Clear phase transitions
