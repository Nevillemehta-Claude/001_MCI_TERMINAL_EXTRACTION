# PHASE 2: IGNITION SEQUENCE DESIGN

**Extracted from:** Session b8937bc2-ac10-4287-8ced-af96ac5f6f0b
**Classification:** ARCHITECTURE - Phase 2

---

## PURPOSE

Phase 2 handles the ignition sequence - the controlled startup of the trading engine. It implements a two-stage safety mechanism (ARM → IGNITE) to prevent accidental activation.

---

## TWO-STAGE SAFETY MECHANISM

```
┌─────────────────────────────────────────────┐
│            IGNITION SEQUENCE                │
├─────────────────────────────────────────────┤
│                                             │
│   STAGE 1: ARM                              │
│   └── User confirms intent to start         │
│   └── System enters ARMED state             │
│   └── Ignition button becomes active        │
│                                             │
│   STAGE 2: IGNITE                           │
│   └── User confirms ignition                │
│   └── START signal sent to CIA-SIE-PURE     │
│   └── Engine begins trading operations      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## COMPONENTS

### BackendSelector
- **File:** `src/client/components/phase2/BackendSelector.tsx`
- **Purpose:** Select trading backend (Zerodha, ICICI, HDFC, Kotak)
- **Status:** Complete
- **Features:**
  - Visual distinction for Paper/Live mode
  - 4 Indian broker options
  - Clear selection feedback

### IgnitionButton
- **File:** `src/client/components/phase2/IgnitionButton.tsx`
- **Purpose:** Two-stage ignition control
- **Status:** Complete
- **States:**
  - Disabled (scanner not passed)
  - Ready (can be armed)
  - Armed (ready to ignite)
  - Igniting (in progress)
  - Active (engine running)

---

## IGNITION STORE

- **File:** `src/client/stores/ignitionStore.ts`
- **Purpose:** Manage ignition state
- **Key States:**
  - `idle` - Not armed
  - `armed` - Ready to ignite
  - `igniting` - Sending start signal
  - `running` - Engine active

---

## BACKEND SELECTION

| Backend | Mode | Description |
|---------|------|-------------|
| Zerodha Kite | Live | Primary broker |
| ICICI Direct | Live | Alternative broker |
| HDFC Sky | Live | Alternative broker |
| Kotak Neo | Live | Alternative broker |
| Paper | Paper | Simulated trading |

---

## API INTERACTION

```
ARM Button Click → ignitionStore.arm()
                        ↓
IGNITE Button Click → ignitionStore.ignite()
                        ↓
                POST /api/ignition/start
                        ↓
                { backend: "zerodha", mode: "live" }
                        ↓
                CIA-SIE-PURE receives START signal
                        ↓
                Engine begins operations
                        ↓
                Proceed to Phase 3 (Telemetry)
```

---

## SAFETY FEATURES

1. **Two-stage confirmation** prevents accidental start
2. **Backend must be selected** before arming
3. **All scanner checks** must pass before arming
4. **Visual feedback** clearly shows current state
5. **Timeout** - ARM state expires after inactivity

---

## TRANSITIONS

- **From:** Phase 1 (All 12 checks PASS)
- **To:** Phase 3 (Telemetry) on successful ignition
