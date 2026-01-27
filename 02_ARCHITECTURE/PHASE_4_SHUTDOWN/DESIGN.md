# PHASE 4: SHUTDOWN PROTOCOL DESIGN

**Extracted from:** Session b8937bc2-ac10-4287-8ced-af96ac5f6f0b
**Classification:** ARCHITECTURE - Phase 4

---

## PURPOSE

Phase 4 handles the graceful or emergency shutdown of the trading engine. It implements CR-002 (6-Step Graceful Shutdown) to ensure clean termination.

---

## CONSTITUTIONAL REQUIREMENT

**CR-002: GRACEFUL SHUTDOWN (6-Step Sequence)** governs this phase.

---

## THE 6-STEP SHUTDOWN SEQUENCE

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHUTDOWN SEQUENCE (CR-002)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   STEP 1: Stop accepting new operations                         │
│   └── No new trades or orders accepted                          │
│                                                                  │
│   STEP 2: Complete all pending transactions                     │
│   └── Wait for in-flight operations to finish                   │
│                                                                  │
│   STEP 3: Close all WebSocket connections                       │
│   └── Clean network teardown                                    │
│                                                                  │
│   STEP 4: Clear all sensitive data from memory                  │
│   └── Security requirement - tokens, credentials                │
│                                                                  │
│   STEP 5: Log final application state                           │
│   └── Audit trail - final P&L, positions, status                │
│                                                                  │
│   STEP 6: Exit process cleanly (code 0)                         │
│   └── Clean OS-level termination                                │
│                                                                  │
│   Sequence: 1 → 2 → 3 → 4 → 5 → 6 (MUST be in order)            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## TWO SHUTDOWN MODES

### Graceful Shutdown
- Full 6-step sequence
- Waits for pending operations
- Normal end-of-day or user-initiated

### Emergency Shutdown
- Accelerated sequence
- Still follows 6 steps but with minimal wait times
- Used for critical errors or emergency situations

---

## COMPONENTS

### ShutdownPanel
- **File:** `src/client/components/phase4/ShutdownPanel.tsx`
- **Purpose:** Shutdown control interface
- **Status:** Complete
- **Features:**
  - Two-stage safety (ARM → SHUTDOWN)
  - Visual progress for each step
  - Emergency mode toggle

---

## SHUTDOWN STORE

- **File:** `src/client/stores/shutdownStore.ts`
- **Purpose:** Manage shutdown state and sequence
- **Key States:**
  - `idle` - Not in shutdown
  - `armed` - Ready to shutdown
  - `step_1` through `step_6` - Each step in progress
  - `complete` - Shutdown finished

---

## API INTERACTION

```
ARM Shutdown Click → shutdownStore.arm()
                          ↓
SHUTDOWN Click → shutdownStore.shutdown()
                          ↓
              POST /api/shutdown/initiate
                          ↓
              CIA-SIE-PURE receives STOP signal
                          ↓
              Engine executes 6-step sequence
                          ↓
              MCI receives completion confirmation
                          ↓
              Return to Phase 0 (Token Capture)
```

---

## VISUAL PROGRESS

```
┌─────────────────────────────────────────────┐
│          SHUTDOWN IN PROGRESS               │
├─────────────────────────────────────────────┤
│ [✓] Step 1: Stop new operations    COMPLETE │
│ [✓] Step 2: Complete pending       COMPLETE │
│ [●] Step 3: Close WebSockets       RUNNING  │
│ [ ] Step 4: Clear memory           PENDING  │
│ [ ] Step 5: Log final state        PENDING  │
│ [ ] Step 6: Exit cleanly           PENDING  │
├─────────────────────────────────────────────┤
│            PROGRESS: 3/6                    │
└─────────────────────────────────────────────┘
```

---

## SAFETY FEATURES

1. **Two-stage confirmation** (ARM → SHUTDOWN)
2. **Cannot bypass steps** - sequence is mandatory
3. **Emergency mode** available but still follows sequence
4. **Audit logging** at each step
5. **Timeout handling** for stuck operations

---

## TRANSITIONS

- **From:** Phase 3 (User command or token expiry)
- **To:** Phase 0 (Back to token capture for next session)
