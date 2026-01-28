# FORENSIC REVIEW: Frontend UI State Visibility Audit

**Date:** 2026-01-28  
**Scope:** All UI components and Zustand stores in `/src/client/`  
**Objective:** Identify visible states, hidden states, and state visibility gaps

---

## EXECUTIVE SUMMARY

This audit examines all UI components and state management stores to identify:
- ✅ **Visible States**: States that are displayed to the operator
- ⚠️ **Hidden States**: States that exist in code but are NOT visible to the operator
- 🔄 **Phase Transitions**: How phase changes are communicated
- 📊 **Loading/Error/Success States**: Visibility of async operation states

---

## PHASE 0: TOKEN CAPTURE

### Component: `TokenCaptureForm.tsx`

#### ✅ VISIBLE STATES:
- **Form Input States**: `kiteApiKey`, `kiteAccessToken`, `kiteUserId` (with show/hide toggle)
- **Field Validation Errors**: Per-field error messages displayed inline
- **Global Error**: `captureError` displayed via `ErrorDisplay` component
- **Loading State**: `isCapturing` shown as button loading state ("Validating...")
- **Success State**: Implicit via `onSuccess` callback (toast notification in App.tsx)

#### ⚠️ HIDDEN STATES:
- **`tokenCapturedAt`**: Timestamp when tokens were captured (NOT displayed)
- **`tokenExpiresAt`**: Expiry timestamp (NOT displayed in form, only in TokenTimer)
- **`isTokenValid`**: Validation status (NOT displayed in form, only in CredentialsHelper)
- **Form State**: `showSecrets` toggle state (visible via UI, but state itself not shown)
- **Field-level validation state**: Individual field error state (visible via error messages, but state tracking not shown)

#### 🔄 PHASE TRANSITIONS:
- ✅ Clear: Success callback triggers phase transition to 'scan'
- ✅ Toast notification: "Tokens validated - Proceeding to system check"

---

### Component: `TokenTimer.tsx`

#### ✅ VISIBLE STATES:
- **Time Remaining**: Countdown timer displayed prominently
- **Token Status**: Visual status indicators (healthy/caution/warning/critical/expired/invalid)
- **Expiry Status**: Color-coded status with icons
- **Progress Bar**: Visual progress indicator (in full display mode)

#### ⚠️ HIDDEN STATES:
- **`tokenExpiresAt`**: Raw timestamp (NOT displayed, only calculated time remaining)
- **`isTokenValid`**: Boolean validity state (NOT directly shown, inferred from status)
- **Current Time**: `now` state updated every second (NOT displayed, used for calculations)

#### 🔄 PHASE TRANSITIONS:
- ✅ Auto-callback on expiration via `onExpired` prop
- ⚠️ **ISSUE**: Expiration callback may trigger phase change, but no visual warning before expiration

---

### Component: `CredentialsHelper.tsx`

#### ✅ VISIBLE STATES:
- **Credentials Display**: All three credentials shown (API Key, Access Token, User ID)
- **Token Validity**: `isTokenValid` shown via checkmark/warning icon
- **Expiry Time**: `tokenExpiresAt` formatted and displayed ("Expires: HH:MM IST")
- **Copy State**: Visual feedback when credentials are copied

#### ⚠️ HIDDEN STATES:
- **`tokenCapturedAt`**: Capture timestamp (NOT displayed)
- **Credential Values**: Access token is masked (only first 8 and last 4 chars shown)

---

### Store: `tokenStore.ts`

#### ✅ SURFACED IN UI:
- `kiteApiKey`, `kiteAccessToken`, `kiteUserId` → TokenCaptureForm, CredentialsHelper
- `isCapturing` → TokenCaptureForm loading state
- `captureError` → TokenCaptureForm error display
- `tokenExpiresAt` → TokenTimer, CredentialsHelper
- `isTokenValid` → CredentialsHelper, TokenTimer (inferred)

#### ⚠️ NOT SURFACED IN UI:
- **`tokenCapturedAt`**: Capture timestamp (exists in store, never displayed)
- **`getTokenAge()`**: Helper function returns token age (NOT used in UI)
- **`getTimeUntilExpiry()`**: Returns ms until expiry (used internally by TokenTimer, but raw value not shown)
- **`isTokenExpired()`**: Boolean check (used internally, not displayed)

---

## PHASE 1: PRE-IGNITION SCANNER

### Component: `PreIgnitionScanner.tsx`

#### ✅ VISIBLE STATES:
- **Scan Progress**: Progress bar with percentage
- **Individual Check States**: All 12 checks displayed with status (pending/running/passed/failed/warning/skipped)
- **Summary Stats**: Passed/Failed/Warnings count displayed
- **Scan Duration**: Total scan time displayed
- **GO/NO-GO Status**: Large visual indicator
- **Critical Failures**: ErrorDisplay component for critical failures
- **Scan Status**: `isScanning` shown via progress bar and check states

#### ⚠️ HIDDEN STATES:
- **`scanStartedAt`**: Start timestamp (NOT displayed, only used for duration calculation)
- **`scanCompletedAt`**: Completion timestamp (NOT displayed, only used for duration calculation)
- **Individual Check Durations**: Shown in ScanCheckItem, but not aggregated anywhere
- **Check Categories**: Displayed in ScanCheckItem, but category-level summaries NOT shown

#### 🔄 PHASE TRANSITIONS:
- ✅ Clear: `onComplete` callback with `canProceed` boolean
- ✅ Toast notification: "System check passed - Ready for ignition" or "System check failed"

---

### Component: `ScanCheckItem.tsx`

#### ✅ VISIBLE STATES:
- **Check Status**: Visual status icon (pending/running/passed/failed/warning/skipped)
- **Check Name**: Displayed prominently
- **Check Description**: Shown below name
- **Check Message**: Error/warning messages displayed
- **Check Duration**: Displayed in milliseconds
- **Critical Indicator**: "CRITICAL" badge shown for critical checks
- **Category Badge**: Color-coded category indicator

#### ⚠️ HIDDEN STATES:
- **Check ID**: Internal identifier (NOT displayed)
- **Category Enum**: Displayed as badge, but raw enum value not shown

---

### Store: `scannerStore.ts`

#### ✅ SURFACED IN UI:
- `checks` → PreIgnitionScanner (all checks displayed)
- `isScanning` → PreIgnitionScanner progress bar
- `passedCount`, `failedCount`, `warningCount` → PreIgnitionScanner summary stats
- `canProceed` → PreIgnitionScanner GO/NO-GO indicator
- `scanCompletedAt` → Used for duration calculation (displayed)

#### ⚠️ NOT SURFACED IN UI:
- **`scanStartedAt`**: Start timestamp (used for calculation, but raw value not shown)
- **`getCheckById()`**: Helper function (NOT used in UI components)

---

## PHASE 2: IGNITION SEQUENCE

### Component: `BackendSelector.tsx`

#### ✅ VISIBLE STATES:
- **Selected Backend**: Visual selection indicator (checkmark, border highlight)
- **Backend Configs**: All 4 backends displayed with icons, names, descriptions
- **Selection State**: Clear visual feedback when backend is selected

#### ⚠️ HIDDEN STATES:
- **`selectedBackend`**: Raw enum value (NOT displayed, only visual selection shown)
- **Backend Config Details**: `endpoint`, `requiresConfirmation` (NOT displayed)
- **Disabled State**: `disabled` prop affects interaction but state not explicitly shown

---

### Component: `IgnitionButton.tsx`

#### ✅ VISIBLE STATES:
- **Ignition Phase**: Visual states for each phase:
  - Not Ready: "Select a backend to enable ignition"
  - Live Confirmation Required: Red warning panel with confirmation input
  - Error State: ErrorDisplay component
  - Igniting: Spinner with "Ignition sequence in progress..."
  - Running: Green success panel with "System Running"
  - Armed: Yellow/Red "SYSTEM ARMED" panel
  - Default: "ARM SYSTEM" button
- **Live Trading Confirmation**: `liveConfirmed` state shown via confirmation dialog
- **Error State**: `ignitionError` displayed via ErrorDisplay
- **Backend Type**: Shown in running state ("LIVE TRADING ACTIVE" vs "Simulation Mode")

#### ⚠️ HIDDEN STATES:
- **`isArmed`**: Boolean armed state (shown via "SYSTEM ARMED" panel, but boolean not displayed)
- **`armKeyEntered`**: Boolean state (NOT displayed, internal tracking)
- **`ignitionStartedAt`**: Start timestamp (NOT displayed)
- **`selectedBackend`**: Raw enum value (NOT displayed, only inferred from UI)
- **`phase`**: Raw phase enum (NOT displayed, only inferred from UI state)

#### 🔄 PHASE TRANSITIONS:
- ✅ Clear: Visual phase changes with distinct UI states
- ✅ Toast notification: "System ignited - Trading system is now active"

---

### Store: `ignitionStore.ts`

#### ✅ SURFACED IN UI:
- `selectedBackend` → BackendSelector (visual selection), IgnitionButton (shown in running state)
- `phase` → IgnitionButton (determines UI state), TelemetryDashboard (checks if 'running')
- `isArmed` → IgnitionButton (shown via "SYSTEM ARMED" panel)
- `liveConfirmed` → IgnitionButton (shown via confirmation dialog)
- `ignitionError` → IgnitionButton (ErrorDisplay component)
- `backendConfigs` → BackendSelector (all configs displayed)

#### ⚠️ NOT SURFACED IN UI:
- **`ignitionStartedAt`**: Start timestamp (NOT displayed)
- **`armKeyEntered`**: Boolean state (NOT displayed, internal tracking)
- **`selecting` phase**: Intermediate phase between idle and armed (NOT explicitly shown)

---

## PHASE 3: TELEMETRY DASHBOARD

### Component: `TelemetryDashboard.tsx`

#### ✅ VISIBLE STATES:
- **Connection Status**: `isConnected` shown via status indicator (green/red dot)
- **Backend Info**: Selected backend name and icon displayed
- **Loading State**: Spinner shown when `!isConnected`
- **Phase Check**: Shows placeholder if `phase !== 'running'`

#### ⚠️ HIDDEN STATES:
- **`phase`**: Raw phase value (NOT displayed, only checked for conditional rendering)
- **`selectedBackend`**: Raw enum value (NOT displayed, only shown via config name)
- **Toast State**: Local `toasts` state (displayed via ToastContainer, but state not shown)
- **WebSocket Connection Details**: Connection state exists but details not shown

---

### Component: `AccountPanel.tsx`

#### ✅ VISIBLE STATES:
- **Account Metrics**: All metrics displayed:
  - Equity, Cash, Buying Power, Portfolio Value
  - Day P&L (with percentage)
  - Total P&L (with percentage)
- **Loading State**: Spinner shown when `accountMetrics === null`
- **Empty State**: "Loading account data..." message

#### ⚠️ HIDDEN STATES:
- **`lastUpdate`**: Timestamp of last update (NOT displayed)
- **Raw Metric Values**: All values formatted, raw numbers not shown

---

### Component: `PositionsPanel.tsx`

#### ✅ VISIBLE STATES:
- **Positions List**: All positions displayed with:
  - Symbol, Quantity, Side (long/short)
  - Unrealized P&L (with percentage)
  - Entry price, Current price (via tooltip)
- **Empty State**: "No open positions" message
- **Total Value**: Sum of all position market values

#### ⚠️ HIDDEN STATES:
- **`lastUpdate`**: Timestamp of last update (NOT displayed)
- **Position Timestamps**: Entry time, last update time (NOT displayed)

---

### Component: `OrdersPanel.tsx`

#### ✅ VISIBLE STATES:
- **Orders List**: All orders displayed with:
  - Symbol, Side, Type
  - Quantity, Filled Quantity, Price
  - Status (new/partially_filled/filled/canceled/rejected)
  - Created time, Filled time (via tooltip)
- **Status Counts**: Filled count, Active count displayed
- **Empty State**: "No active orders" message

#### ⚠️ HIDDEN STATES:
- **`lastUpdate`**: Timestamp of last update (NOT displayed)
- **Canceled/Rejected Orders**: Hidden by default (unless `showCanceled=true`)
- **Order IDs**: Internal IDs not displayed

---

### Component: `SystemHealthPanel.tsx`

#### ✅ VISIBLE STATES:
- **System Health Status**: Overall status (healthy/degraded/critical) with icon
- **CPU Usage**: Percentage with progress bar
- **Memory Usage**: Percentage with progress bar
- **Latency**: Network latency in milliseconds
- **Uptime**: System uptime formatted (days/hours/minutes/seconds)
- **Heartbeat Status**: Visual indicator with time since last heartbeat
- **Last Update Time**: Displayed in heartbeat section

#### ⚠️ HIDDEN STATES:
- **`lastHeartbeat`**: Raw timestamp (NOT displayed, only time since shown)
- **Raw Metrics**: CPU/memory percentages shown, but thresholds not displayed

---

### Component: `MarketDataPanel.tsx`

#### ✅ VISIBLE STATES:
- **Market Data**: For each symbol:
  - Symbol, Price, Change (with percentage)
  - Volume, High, Low, Open (via tooltip)
  - Day range indicator
- **Empty State**: "Waiting for market data..." spinner
- **Symbol Count**: Number of symbols displayed

#### ⚠️ HIDDEN STATES:
- **`lastUpdate`**: Timestamp of last update (NOT displayed)
- **Market Data Timestamps**: Individual symbol timestamps (NOT displayed)
- **Update Frequency**: `updateInterval` from store (NOT displayed)

---

### Component: `ActivityLogPanel.tsx`

#### ✅ VISIBLE STATES:
- **Activity Log Entries**: All entries displayed with:
  - Type (info/warning/error/trade) with color coding
  - Message text
  - Timestamp (formatted time)
- **Entry Count**: Number of entries displayed
- **Empty State**: "No activity yet" message

#### ⚠️ HIDDEN STATES:
- **Log IDs**: Internal IDs not displayed
- **Max Items**: Truncation limit (100 items) not shown to user
- **Raw Timestamps**: Only formatted time shown, not full timestamp

---

### Store: `telemetryStore.ts`

#### ✅ SURFACED IN UI:
- `positions` → PositionsPanel
- `orders` → OrdersPanel
- `accountMetrics` → AccountPanel
- `systemHealth` → SystemHealthPanel
- `marketData` → MarketDataPanel
- `activityLog` → ActivityLogPanel
- `isConnected` → TelemetryDashboard connection indicator
- `lastUpdate` → SystemHealthPanel (displayed)

#### ⚠️ NOT SURFACED IN UI:
- **`updateInterval`**: Update frequency setting (NOT displayed, default 1000ms)
- **Raw Timestamps**: Most timestamps formatted, raw values not shown
- **Data Age**: Time since last update not shown for most panels (only SystemHealthPanel shows it)

---

## PHASE 4: SHUTDOWN PANEL

### Component: `ShutdownPanel.tsx`

#### ✅ VISIBLE STATES:
- **Shutdown Options**: Checkboxes for:
  - Cancel Pending Orders
  - Close All Positions
  - Save System State
- **Shutdown Phase**: Visual states:
  - Idle: Options selection
  - Confirmation: Confirmation dialog
  - Shutting Down: Progress bar with step list
  - Complete: Success panel
  - Error: ErrorDisplay component
- **Shutdown Steps**: All steps displayed with status (pending/running/complete/error/skipped)
- **Progress**: Progress bar showing completion percentage
- **Duration**: Shutdown duration displayed
- **Emergency Flag**: Visual indicator for emergency shutdown

#### ⚠️ HIDDEN STATES:
- **`shutdownStartedAt`**: Start timestamp (NOT displayed, only used for duration)
- **`shutdownCompletedAt`**: Completion timestamp (NOT displayed, only used for duration)
- **Step IDs**: Internal step identifiers (NOT displayed)
- **Step Durations**: Individual step durations shown, but not aggregated summary

#### 🔄 PHASE TRANSITIONS:
- ✅ Clear: `onComplete` callback triggers return to 'token' phase
- ✅ Toast notification: "System shutdown - Returning to start"

---

### Store: `shutdownStore.ts`

#### ✅ SURFACED IN UI:
- `phase` → ShutdownPanel (determines UI state)
- `steps` → ShutdownPanel (all steps displayed)
- `isEmergency` → ShutdownPanel (visual indicator)
- `error` → ShutdownPanel (ErrorDisplay component)
- `closePositions`, `cancelOrders`, `saveState` → ShutdownPanel (checkboxes)
- `shutdownStartedAt`, `shutdownCompletedAt` → Used for duration calculation

#### ⚠️ NOT SURFACED IN UI:
- **Raw Timestamps**: Start/completion timestamps not displayed, only duration shown
- **Step Details**: Step IDs, descriptions shown, but internal structure not visible

---

## APP.TSX: MAIN APPLICATION

### Component: `App.tsx`

#### ✅ VISIBLE STATES:
- **Current Phase**: Phase indicator in header (0-3 dots with labels)
- **Phase Label**: "Phase N" and phase name displayed
- **Phase Transitions**: Visual phase changes
- **Toast Notifications**: Toast system for phase transitions
- **Navigation**: Back button (when applicable)
- **Reset Button**: Full system reset button

#### ⚠️ HIDDEN STATES:
- **`currentPhase`**: Raw phase enum (NOT displayed, only inferred from UI)
- **`toasts`**: Toast state array (displayed via ToastContainer, but state not shown)
- **`ignitionPhase`**: From ignitionStore (NOT displayed, only used for phase sync)
- **URL Reset Parameter**: `?reset=true` handled but not shown to user

#### 🔄 PHASE TRANSITIONS:
- ✅ Clear: Visual phase indicator updates
- ✅ Toast notifications for each transition:
  - Token → Scan: "Tokens validated - Proceeding to system check"
  - Scan → Ignition: "System check passed - Ready for ignition"
  - Ignition → Running: "System ignited - Trading system is now active"
  - Running → Shutdown: (via button click)
  - Shutdown → Token: "System shutdown - Returning to start"

---

## CRITICAL FINDINGS: HIDDEN STATES

### 🔴 HIGH PRIORITY - States that should be visible:

1. **Token Capture Timestamp** (`tokenCapturedAt`)
   - **Location**: `tokenStore.ts`
   - **Impact**: Operator cannot see when tokens were captured
   - **Recommendation**: Display in CredentialsHelper or TokenTimer

2. **Scan Start/End Timestamps**
   - **Location**: `scannerStore.ts`
   - **Impact**: Operator cannot see exact scan timing
   - **Recommendation**: Display in PreIgnitionScanner header

3. **Ignition Start Timestamp** (`ignitionStartedAt`)
   - **Location**: `ignitionStore.ts`
   - **Impact**: Operator cannot see when system was ignited
   - **Recommendation**: Display in TelemetryDashboard header

4. **Telemetry Update Frequency** (`updateInterval`)
   - **Location**: `telemetryStore.ts`
   - **Impact**: Operator cannot see data refresh rate
   - **Recommendation**: Display in TelemetryDashboard header

5. **Data Age Indicators**
   - **Location**: Multiple panels (AccountPanel, PositionsPanel, OrdersPanel, MarketDataPanel)
   - **Impact**: Operator cannot see how fresh the data is
   - **Recommendation**: Show "Last updated: X seconds ago" in each panel

6. **Phase Transition Timestamps**
   - **Location**: `App.tsx`
   - **Impact**: Operator cannot see phase transition history
   - **Recommendation**: Add phase transition log to ActivityLogPanel

### ⚠️ MEDIUM PRIORITY - States that could be useful:

1. **Token Age** (`getTokenAge()`)
   - **Location**: `tokenStore.ts`
   - **Impact**: Operator cannot see how long tokens have been active
   - **Recommendation**: Display in TokenTimer or CredentialsHelper

2. **Check Category Summaries**
   - **Location**: `PreIgnitionScanner.tsx`
   - **Impact**: Operator cannot see category-level scan results
   - **Recommendation**: Add category summary cards

3. **Backend Configuration Details**
   - **Location**: `BackendSelector.tsx`
   - **Impact**: Operator cannot see endpoint URLs or confirmation requirements
   - **Recommendation**: Show in tooltip or details panel

4. **Order IDs**
   - **Location**: `OrdersPanel.tsx`
   - **Impact**: Operator cannot reference specific orders
   - **Recommendation**: Show order IDs in tooltip or details view

5. **Position Entry Timestamps**
   - **Location**: `PositionsPanel.tsx`
   - **Impact**: Operator cannot see when positions were opened
   - **Recommendation**: Show in tooltip or details view

---

## STATE VISIBILITY SUMMARY

### ✅ WELL-VISUALIZED STATES:
- Phase transitions (clear visual indicators)
- Loading states (spinners, progress bars)
- Error states (ErrorDisplay components)
- Success states (toast notifications, visual indicators)
- Real-time telemetry data (all panels show current values)
- Scan progress (progress bar, individual check states)

### ⚠️ PARTIALLY VISIBLE STATES:
- Timestamps (formatted times shown, but raw timestamps hidden)
- Durations (calculated and shown, but start/end times hidden)
- Connection status (shown, but connection details hidden)

### 🔴 HIDDEN STATES (Should be visible):
- Token capture timestamp
- Scan start/end timestamps
- Ignition start timestamp
- Telemetry update frequency
- Data age indicators (time since last update)
- Phase transition history

---

## RECOMMENDATIONS

### Immediate Actions:
1. **Add timestamp displays** to all major state changes
2. **Add data age indicators** to all telemetry panels
3. **Add phase transition log** to ActivityLogPanel
4. **Display token capture time** in CredentialsHelper

### Future Enhancements:
1. **Add system state history** panel showing all state transitions
2. **Add detailed tooltips** showing raw state values
3. **Add debug panel** (dev mode only) showing all store state
4. **Add state export** functionality for troubleshooting

---

## CONCLUSION

The UI provides **good visibility** for most operational states, with clear phase transitions, loading states, and error handling. However, **temporal metadata** (timestamps, durations, data age) is largely hidden, which limits the operator's ability to:
- Debug timing issues
- Understand system state history
- Verify data freshness
- Track phase transition timing

**Recommendation**: Add timestamp and data age indicators to improve operational visibility and debugging capabilities.

---

**Audit Completed:** 2026-01-28  
**Files Reviewed:** 20+ components, 5 stores  
**Hidden States Identified:** 15+ critical states not visible to operator
