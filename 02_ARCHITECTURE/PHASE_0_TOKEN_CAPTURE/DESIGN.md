# PHASE 0: TOKEN CAPTURE DESIGN

**Extracted from:** Session b8937bc2-ac10-4287-8ced-af96ac5f6f0b
**Classification:** ARCHITECTURE - Phase 0

---

## PURPOSE

Phase 0 is the entry point for MCI operations. It handles the acquisition and validation of broker authentication tokens, specifically Kite (Zerodha) tokens.

---

## CONSTITUTIONAL REQUIREMENTS

- **CR-001:** Token Validity - GOVERNS THIS PHASE
- **CR-004:** Token Expiry at 6:00 AM IST - ENFORCED IN THIS PHASE

---

## COMPONENTS

### TokenCaptureForm
- **File:** `src/client/components/phase0/TokenCaptureForm.tsx`
- **Purpose:** Capture Kite access token from user
- **Status:** Complete

### TokenTimer
- **File:** `src/client/components/phase0/TokenTimer.tsx`
- **Purpose:** Display countdown to token expiry (6:00 AM IST)
- **Status:** Complete

---

## TOKEN STORE

- **File:** `src/client/stores/tokenStore.ts`
- **Purpose:** Manage token state with daily credential continuity
- **Persistence:** localStorage (credentials persist across browser/system restarts)
- **Key Fields:**
  - `kiteApiKey` - Kite Connect API key
  - `kiteAccessToken` - The actual access token
  - `kiteUserId` - Zerodha user ID
  - `tokenExpiresAt` - Timestamp of expiry (6:00 AM IST)
  - `isTokenValid` - Current validity status

### Daily Credential Continuity (INV-001)

Credentials persist in localStorage within the daily validity window:
- **Survives:** Browser close, tab close, system reboot
- **Cleared:** At 6:00 AM IST (CR-004 enforcement on rehydration)
- **No Backend Storage:** Credentials remain client-side only

---

## DATA FLOW

```
User enters token → TokenCaptureForm
                           ↓
              Token validation against Kite API
                           ↓
              Calculate expiry (6:00 AM IST next day)
                           ↓
              Store in tokenStore (Zustand)
                           ↓
              TokenTimer displays countdown
                           ↓
              Proceed to Phase 1 (Scanner)
```

---

## EXPIRY HANDLING

- **Expiry Time:** 6:00 AM IST = 00:30 UTC (IST is UTC+5:30)
- **At Expiry:** Automatic logout/redirect to token capture
- **No Operations:** Permitted with expired token

---

## TRANSITIONS

- **From:** Initial load / Token expired state
- **To:** Phase 1 (Pre-Ignition Scanner) on valid token
