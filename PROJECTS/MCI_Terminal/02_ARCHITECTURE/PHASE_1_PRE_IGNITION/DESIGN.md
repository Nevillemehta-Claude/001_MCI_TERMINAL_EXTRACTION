# PHASE 1: PRE-IGNITION SCANNER DESIGN

**Extracted from:** Session b8937bc2-ac10-4287-8ced-af96ac5f6f0b
**Classification:** ARCHITECTURE - Phase 1

---

## PURPOSE

Phase 1 performs a comprehensive 12-point system check before allowing ignition. This ensures all systems are GO before the trading engine can be started.

---

## THE 12-POINT CHECK

| # | Check | Category | Purpose |
|---|-------|----------|---------|
| 1 | Kite Token Validation | Auth | Verify token is valid |
| 2 | Kite API Connectivity | Network | Verify API is reachable |
| 3 | WebSocket Test | Network | Verify WS connection possible |
| 4 | Backend Ping - Zerodha | Broker | Verify Zerodha available |
| 5 | Backend Ping - ICICI | Broker | Verify ICICI available |
| 6 | Backend Ping - HDFC | Broker | Verify HDFC available |
| 7 | Backend Ping - Kotak | Broker | Verify Kotak available |
| 8 | Market Hours Check | Market | Verify market is open (NSE/BSE) |
| 9 | System Resources | System | CPU/Memory check |
| 10 | Database Connection | System | Verify DB available |
| 11 | CIA-SIE-PURE Status | Engine | Verify trading engine online |
| 12 | Final Readiness | All | Aggregate GO/NO-GO status |

---

## COMPONENTS

### PreIgnitionScanner
- **File:** `src/client/components/phase1/PreIgnitionScanner.tsx`
- **Purpose:** Execute and display 12-point diagnostic system
- **Status:** Complete

### ScanCheckItem
- **File:** `src/client/components/phase1/ScanCheckItem.tsx`
- **Purpose:** Individual check display component
- **Status:** Complete

---

## SCANNER STORE

- **File:** `src/client/stores/scannerStore.ts`
- **Purpose:** Manage check state and results
- **Key Data:**
  - Check definitions (12 checks)
  - Check status (pending/running/pass/fail)
  - Aggregate GO/NO-GO status

---

## VISUALIZATION

```
┌─────────────────────────────────────────────┐
│          PRE-IGNITION SCANNER               │
├─────────────────────────────────────────────┤
│ [✓] Kite Token Validation        PASS       │
│ [✓] Kite API Connectivity        PASS       │
│ [✓] WebSocket Test               PASS       │
│ [✓] Backend Ping - Zerodha       PASS       │
│ [✓] Backend Ping - ICICI         PASS       │
│ [✓] Backend Ping - HDFC          PASS       │
│ [✓] Backend Ping - Kotak         PASS       │
│ [✓] Market Hours Check           PASS       │
│ [✓] System Resources             PASS       │
│ [✓] Database Connection          PASS       │
│ [✓] CIA-SIE-PURE Status          PASS       │
│ [✓] Final Readiness              PASS       │
├─────────────────────────────────────────────┤
│        ALL SYSTEMS GO - 12/12               │
└─────────────────────────────────────────────┘
```

---

## ERROR STATES

If any check fails:
- Check shows as FAIL (red)
- Aggregate status is NO-GO
- Ignition button is disabled
- User must resolve issue before proceeding

---

## TRANSITIONS

- **From:** Phase 0 (Token captured and valid)
- **To:** Phase 2 (Ignition) on all checks PASS
