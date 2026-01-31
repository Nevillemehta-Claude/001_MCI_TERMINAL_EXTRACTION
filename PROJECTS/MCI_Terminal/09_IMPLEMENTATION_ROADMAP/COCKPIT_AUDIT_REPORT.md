# MCI Cockpit Indicators Audit Report
**Date:** 2026-01-28  
**Scope:** Interface components in `/12_APPLICATION_CODE/src/client/`  
**Purpose:** Evaluate MCI as a cockpit control panel for mission-critical trading operations

---

## EXECUTIVE SUMMARY

The MCI interface provides **5 core indicators** but is missing **6 critical cockpit metrics** required for real-time mission control. While existing indicators are well-implemented, the absence of backend API health, error aggregation, and network connectivity status creates blind spots in operational awareness.

**Overall Status:** ⚠️ **PARTIAL** - Core indicators present, critical gaps identified

---

## 1. EXISTING INDICATORS - VERIFICATION

### ✅ 1.1 Token Validity Indicator (`TokenTimer.tsx`)

**Location:** `components/phase0/TokenTimer.tsx`  
**Status:** ✅ **FULLY IMPLEMENTED**

**What it shows:**
- Token validity status (valid/invalid/expired)
- Visual status badges with color coding
- Icon indicators (✓, ⚠, ✕, ○)

**Verification:**
- ✅ **Always visible when relevant:** Yes - displayed in Phase 0, 1, and 2 (compact mode)
- ✅ **Real-time updates:** Yes - updates every 1 second via `setInterval`
- ✅ **Accurate:** Yes - reads from `tokenStore.isTokenValid` and `tokenExpiresAt` (CR-004: 6:00 AM IST expiry)

**Implementation Quality:** Excellent
- Status levels: healthy → caution → warning → critical → expired
- Visual feedback: color-coded backgrounds, borders, icons
- Animation: pulse effect on critical state
- Progress bar: visual countdown representation

**Gap:** Not visible in Phase 3 (running) or Phase 4 (shutdown) - token status should persist across all phases.

---

### ✅ 1.2 Token Expiry Countdown (`TokenTimer.tsx`)

**Location:** `components/phase0/TokenTimer.tsx`  
**Status:** ✅ **FULLY IMPLEMENTED**

**What it shows:**
- Time remaining until 6:00 AM IST expiry (HH:MM:SS format)
- Visual countdown with color-coded urgency levels

**Verification:**
- ✅ **Always visible when relevant:** Yes - shown in TokenTimer component
- ✅ **Real-time updates:** Yes - updates every second
- ✅ **Accurate:** Yes - calculates from `tokenExpiresAt` (CR-004 compliant)

**Implementation Quality:** Excellent
- Format: `HH:MM:SS` with proper zero-padding
- Thresholds: < 5 min (critical), < 30 min (warning), < 1 hour (caution)
- Visual: Large monospace font for readability

**Gap:** Same as 1.1 - not visible during Phase 3/4 when system is running.

---

### ✅ 1.3 System Health Status (`SystemHealthPanel.tsx`)

**Location:** `components/phase3/SystemHealthPanel.tsx`  
**Status:** ✅ **FULLY IMPLEMENTED**

**What it shows:**
- Overall health status: Healthy / Degraded / Critical
- CPU usage percentage with progress bar
- Memory usage percentage with progress bar
- Network latency to trading servers
- System uptime since last restart
- Heartbeat status (last heartbeat timestamp)

**Verification:**
- ✅ **Always visible when relevant:** Yes - displayed in TelemetryDashboard (Phase 3)
- ✅ **Real-time updates:** Yes - updates via `telemetryStore.lastUpdate` timestamp
- ⚠️ **Accurate:** Partial - depends on backend providing accurate `systemHealth` data

**Implementation Quality:** Good
- Color-coded status badges
- Progress bars with threshold-based coloring
- Heartbeat indicator with pulse animation
- Last update timestamp displayed

**Gaps:**
1. Only visible in Phase 3 - should be visible in header during all phases
2. No backend API health check - only shows telemetry system health
3. Heartbeat threshold (5 seconds) is hardcoded - should be configurable

---

### ✅ 1.4 Connection Status (`TelemetryDashboard.tsx`)

**Location:** `components/phase3/TelemetryDashboard.tsx`  
**Status:** ✅ **PARTIALLY IMPLEMENTED**

**What it shows:**
- WebSocket telemetry stream connection status (Connected/Disconnected)
- Visual indicator: green pulsing dot (connected) or red dot (disconnected)

**Verification:**
- ✅ **Always visible when relevant:** Yes - shown in TelemetryDashboard header
- ⚠️ **Real-time updates:** Partial - updates via `telemetryStore.setConnected()`, but connection logic is **simulated** (line 34-46)
- ⚠️ **Accurate:** Partial - shows WebSocket status, but **NOT backend API connection status**

**Implementation Quality:** Good (but incomplete)
- Clear visual indicator with color coding
- Animated pulse on connected state
- Loading spinner when disconnected

**Critical Gaps:**
1. **SIMULATED CONNECTION** - Line 34-46 uses `setTimeout` to fake connection - no real WebSocket implementation
2. Only shows telemetry WebSocket, not backend API health
3. Not visible outside Phase 3

---

### ✅ 1.5 Phase Indicator (`App.tsx`)

**Location:** `src/client/App.tsx` (lines 221-246)  
**Status:** ✅ **FULLY IMPLEMENTED**

**What it shows:**
- Current phase: Token Capture (0) → Pre-Ignition Scan (1) → Ignition Sequence (2) → Mission Control (3)
- Visual progress indicator with numbered circles
- Phase label and number in header

**Verification:**
- ✅ **Always visible when relevant:** Yes - always visible in header
- ✅ **Real-time updates:** Yes - updates immediately on phase change
- ✅ **Accurate:** Yes - reflects `currentPhase` state

**Implementation Quality:** Excellent
- Clear visual progression
- Color-coded active vs inactive phases
- Phase labels and numbers

**Gap:** No indication of "idle" vs "running" state within Phase 3.

---

## 2. MISSING INDICATORS - CRITICALITY ANALYSIS

### ❌ 2.1 Running vs Idle Indication

**What it should show:**
- Clear distinction between system being actively trading vs idle/standby
- Visual indicator: "RUNNING" vs "IDLE" or "STANDBY"
- Possibly show last trade timestamp or activity status

**Why it's missing:**
- Phase indicator shows "running" but doesn't distinguish active trading from idle
- No state tracking for "actively executing trades" vs "monitoring only"

**Criticality:** 🔴 **HIGH**

**Impact:**
- Operator cannot tell if system is actively trading or just monitoring
- Critical for understanding system state during Phase 3
- Required for operational awareness

**Recommendation:**
- Add `isActive` state to `ignitionStore` or `telemetryStore`
- Display prominent indicator in header: "🟢 ACTIVE" or "🟡 IDLE"
- Show last trade timestamp or "No trades in last X minutes"

---

### ❌ 2.2 Backend Connection Status

**What it should show:**
- Connection status to selected backend API (ICICI/HDFC/Kotak/Zerodha)
- Health check status: API reachable, authenticated, responding
- Last successful API call timestamp
- Connection latency to backend API

**Why it's missing:**
- Only WebSocket telemetry connection is shown
- No health check endpoint for backend APIs
- No monitoring of backend API connectivity

**Criticality:** 🔴 **HIGH**

**Impact:**
- Operator cannot verify backend API is actually reachable
- Critical for troubleshooting connection issues
- Required before attempting trades

**Recommendation:**
- Add `/api/health` or `/api/backend/{type}/health` endpoint
- Poll health endpoint every 5-10 seconds
- Display in header: "Backend: 🟢 Connected" or "Backend: 🔴 Disconnected"
- Show backend-specific connection details (broker name, endpoint)

---

### ❌ 2.3 API Health Status

**What it should show:**
- Overall API health: all endpoints responding
- Individual endpoint health: `/api/auth`, `/api/ignition`, `/api/telemetry`, etc.
- Response time metrics
- Error rate (successful vs failed requests)

**Why it's missing:**
- No health check aggregation
- No API endpoint monitoring
- No request/response tracking

**Criticality:** 🟡 **MEDIUM**

**Impact:**
- Cannot identify which API endpoints are failing
- Difficult to diagnose API-level issues
- No visibility into API performance degradation

**Recommendation:**
- Implement health check endpoint that tests all critical APIs
- Add API health panel or indicator
- Track request success rates and response times
- Display in SystemHealthPanel or separate API Health panel

---

### ⚠️ 2.4 Error Count/Status

**What it should show:**
- Total error count (last hour, last 24 hours)
- Error rate trend
- Critical errors vs warnings
- Error breakdown by category (auth, trading, API, etc.)

**Why it's missing:**
- Errors are logged in ActivityLogPanel but not aggregated
- No error count indicator
- No error rate calculation

**Criticality:** 🟡 **MEDIUM**

**Impact:**
- Cannot quickly assess error frequency
- Difficult to spot error trends
- No at-a-glance error status

**Recommendation:**
- Add error aggregation to `telemetryStore`
- Display error count badge in header: "Errors: 0" or "Errors: 3 (last hour)"
- Add error rate chart or trend indicator
- Color-code: green (0 errors), yellow (1-5), red (>5)

---

### ⚠️ 2.5 Last Successful Operation Timestamp

**What it should show:**
- Timestamp of last successful API call
- Time since last successful operation
- "Last update: 2 seconds ago" or "No updates in 30 seconds"

**Why it's missing:**
- `telemetryStore.lastUpdate` exists but not prominently displayed
- No "time since last update" calculation
- Not visible in header or main UI

**Criticality:** 🟡 **MEDIUM**

**Impact:**
- Cannot verify system is actively receiving updates
- Difficult to detect stale data
- No indication of data freshness

**Recommendation:**
- Display "Last update: X seconds ago" in header or SystemHealthPanel
- Color-code: green (< 5s), yellow (5-30s), red (> 30s)
- Show timestamp in human-readable format
- Alert when updates stop for extended period

---

### ❌ 2.6 Network Connectivity Status

**What it should show:**
- Browser-level network connectivity (online/offline)
- Internet connectivity status
- Network quality indicator (if available)

**Why it's missing:**
- No browser `navigator.onLine` API usage
- No network status monitoring
- No offline detection

**Criticality:** 🟡 **MEDIUM**

**Impact:**
- Cannot detect when browser loses internet connection
- May attempt API calls when offline
- No warning before network issues affect trading

**Recommendation:**
- Use `navigator.onLine` API
- Listen to `online`/`offline` events
- Display network status in header: "🌐 Online" or "📡 Offline"
- Disable trading operations when offline
- Show warning toast when network disconnects

---

## 3. COCKPIT LAYOUT ANALYSIS

### Current Layout

**Header (App.tsx):**
- MCI logo and title
- Phase indicator (0-3)
- Phase label and number
- Reset button

**Phase 3 Dashboard (TelemetryDashboard.tsx):**
- Backend selector badge
- WebSocket connection status
- 6-panel grid: Positions, Orders, Account, System Health, Market Data, Activity Log

### Recommended Cockpit Layout

**Header (Enhanced):**
```
[MCI Logo] [Phase Indicator] [Phase Label]
[Token Timer (compact)] [Backend Status] [API Health] [Network Status] [Error Count] [Reset]
```

**Status Bar (New - Always Visible):**
```
🟢 Token: Valid (2h 15m) | 🟢 Backend: ICICI Connected | 🟢 API: Healthy | 🌐 Online | Errors: 0 | Last Update: 2s ago
```

**Phase 3 Dashboard:**
- Keep existing 6-panel layout
- Add "Running/Idle" indicator prominently
- Enhance SystemHealthPanel with API health

---

## 4. IMPLEMENTATION PRIORITY

### Priority 1 (Critical - Implement Immediately)
1. **Backend Connection Status** - Required for trading operations
2. **Running vs Idle Indication** - Required for operational awareness

### Priority 2 (High - Implement Soon)
3. **Error Count/Status** - Important for monitoring
4. **Last Successful Operation Timestamp** - Important for data freshness

### Priority 3 (Medium - Nice to Have)
5. **API Health Status** - Useful for diagnostics
6. **Network Connectivity Status** - Useful for offline detection

---

## 5. VERIFICATION CHECKLIST

### For Each Indicator:
- [ ] Is it always visible when relevant?
- [ ] Does it update in real-time?
- [ ] Is it accurate (reflects backend truth)?
- [ ] Is it visually distinct (color, icon, animation)?
- [ ] Does it provide actionable information?

### Current Status:
- ✅ Token Validity: 5/5
- ✅ Token Expiry: 5/5
- ⚠️ System Health: 3/5 (accuracy depends on backend)
- ⚠️ Connection Status: 2/5 (simulated, not real)
- ✅ Phase Indicator: 5/5

---

## 6. RECOMMENDATIONS

### Immediate Actions:
1. **Fix simulated connection** - Replace `setTimeout` in TelemetryDashboard with real WebSocket implementation
2. **Add backend health check** - Implement `/api/backend/{type}/health` endpoint and polling
3. **Add running/idle indicator** - Track active trading state vs monitoring state
4. **Persist TokenTimer** - Show token status in all phases, not just 0-2

### Short-term Enhancements:
5. **Error aggregation** - Add error counting and rate calculation
6. **Last update display** - Show "time since last update" prominently
7. **Network status** - Add browser-level connectivity monitoring
8. **API health panel** - Add dedicated API health monitoring

### Long-term Improvements:
9. **Cockpit header redesign** - Consolidate all indicators in always-visible header
10. **Status bar** - Add persistent status bar below header
11. **Alert system** - Add visual/audio alerts for critical status changes
12. **Historical trends** - Add charts for health metrics over time

---

## 7. CONCLUSION

The MCI interface has a **solid foundation** with 5 core indicators, but lacks **critical operational awareness metrics** required for mission-critical trading operations. The most critical gaps are:

1. **Backend API connection status** (HIGH)
2. **Running vs idle indication** (HIGH)
3. **Error aggregation** (MEDIUM)
4. **Data freshness indicators** (MEDIUM)

**Recommendation:** Implement Priority 1 items immediately, then proceed with Priority 2 items. The current implementation is functional but needs these enhancements for production-ready cockpit control.

---

**Report Generated:** 2026-01-28  
**Reviewed Components:** 8 files  
**Indicators Evaluated:** 11 (5 existing, 6 missing)  
**Criticality Ratings:** 2 HIGH, 4 MEDIUM
