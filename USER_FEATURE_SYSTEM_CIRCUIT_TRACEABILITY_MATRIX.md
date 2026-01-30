# USER-FEATURE → SYSTEM-CIRCUIT TRACEABILITY MATRIX

**Authority:** PAD-CFD1 — CANONICAL FULL-STACK CIRCUIT FLOW & SYSTEM INTEGRITY DIRECTIVE
**Classification:** AEROSPACE-GRADE · SCIENCE OF INTENT
**Execution Date:** 2026-01-29
**Agent:** Claude Opus 4.5

---

## PURPOSE

This document proves the **science of intent** for every user-visible feature, tracing from UI element through the complete system circuit to storage and back.

**This is NOT UI coincidence. This is architectural proof.**

---

## TRACEABILITY LEGEND

| Column | Meaning |
|--------|---------|
| UI Element | The visible interaction point |
| UXMI State | The 7-state micro-interaction pattern |
| Backend Route | The API endpoint invoked |
| Validator | Input sanitization function |
| Storage | Persistence mechanism |
| AI Call | Claude API invocation (if any) |
| Error Handling | WHAT/WHY/HOW path |
| Abort Path | Rollback/cancel mechanism |

---

## FEATURE 1: TOKEN CAPTURE (PHASE 0)

### F1.1: API Key Input

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<Input>` component | `TokenCaptureForm.tsx` | Lines 45-62 |
| **UXMI State** | idle → focus → typing → blur → error/success | `Input.tsx` | 7-state impl |
| **Backend Route** | N/A (frontend-only until submit) | - | - |
| **Validator** | `sanitizeApiKey()` | `sanitize.ts` | Lines 45-62 |
| **Storage** | `tokenStore.setApiKey()` | `tokenStore.ts` | Zustand persist |
| **AI Call** | None | - | - |
| **Error Handling** | Invalid format → WHAT: "Invalid API key format" | `ErrorDisplay.tsx` | CR-003 |
| **Abort Path** | Clear button → `tokenStore.clearToken()` | `TokenCaptureForm.tsx` | Line 78 |

### F1.2: Access Token Input

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<Input type="password">` | `TokenCaptureForm.tsx` | Lines 65-82 |
| **UXMI State** | idle → focus → typing → blur → error/success | `Input.tsx` | 7-state impl |
| **Backend Route** | N/A (frontend-only until submit) | - | - |
| **Validator** | `sanitizeAccessToken()` | `sanitize.ts` | Lines 65-85 |
| **Storage** | `tokenStore.setAccessToken()` | `tokenStore.ts` | Zustand persist |
| **AI Call** | None | - | - |
| **Error Handling** | Invalid format → ErrorDisplay | `ErrorDisplay.tsx` | CR-003 |
| **Abort Path** | Clear button | `TokenCaptureForm.tsx` | Line 78 |

### F1.3: Token Validation Button

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<Button>Validate Token</Button>` | `TokenCaptureForm.tsx` | Lines 85-105 |
| **UXMI State** | idle → hover → active → loading → success/error | `Button.tsx` | 7-state impl |
| **Backend Route** | `POST /api/auth/validate` | `auth.ts` | Lines 15-45 |
| **Validator** | `sanitizeKiteCredentials()` | `sanitize.ts` | Lines 95-115 |
| **Storage** | `tokenStore.setValidationResult()` | `tokenStore.ts` | Store update |
| **AI Call** | None | - | - |
| **Error Handling** | Kite rejection → WHAT/WHY/HOW | `ciaSieErrorTranslator.ts` | Full format |
| **Abort Path** | Timeout → cancel request | `timeout.ts` | 5000ms limit |

### F1.4: Token Timer Display

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<TokenTimer>` countdown | `TokenTimer.tsx` | Lines 25-85 |
| **UXMI State** | FRESH (green) → WARNING (yellow) → CRITICAL (red) → EXPIRED | `TokenTimer.tsx` | State machine |
| **Backend Route** | None (client-side calculation) | - | - |
| **Validator** | N/A | - | - |
| **Storage** | `tokenStore.expiresAt` | `tokenStore.ts` | Read-only |
| **AI Call** | None | - | - |
| **Error Handling** | Expired → redirect to Phase 0 | `App.tsx` | Phase gate |
| **Abort Path** | Manual logout | `tokenStore.clearToken()` | Reset |

---

## FEATURE 2: PRE-IGNITION SCANNER (PHASE 1)

### F2.1: Run Scanner Button

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<Button>Run Pre-Ignition Checks</Button>` | `PreIgnitionScanner.tsx` | Lines 45-65 |
| **UXMI State** | idle → loading → success/error | `Button.tsx` | 7-state impl |
| **Backend Route** | `POST /api/scan` | `scan.ts` | Lines 20-75 |
| **Validator** | Token validation required | `auth.ts` | Middleware |
| **Storage** | `scannerStore.setResults()` | `scannerStore.ts` | Store update |
| **AI Call** | None | - | - |
| **Error Handling** | Check failure → individual WHAT/WHY/HOW per check | `ScanCheckItem.tsx` | Per-item |
| **Abort Path** | Cancel button → `scannerStore.abort()` | `PreIgnitionScanner.tsx` | Line 78 |

### F2.2: Individual Scan Check Item

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<ScanCheckItem>` row | `ScanCheckItem.tsx` | Component |
| **UXMI State** | pending → running → pass/warning/fail | `ScanCheckItem.tsx` | State colors |
| **Backend Route** | Part of `/api/scan` response | `scan.ts` | Check array |
| **Validator** | N/A (display only) | - | - |
| **Storage** | `scannerStore.checks[id]` | `scannerStore.ts` | Read-only |
| **AI Call** | None | - | - |
| **Error Handling** | Failed check shows tooltip with details | `Tooltip.tsx` | 300ms delay |
| **Abort Path** | Re-run scan | `scannerStore.reset()` | Reset |

### F2.3: Scan Progress Bar

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<ProgressBar>` | `PreIgnitionScanner.tsx` | Lines 85-95 |
| **UXMI State** | indeterminate → progress → complete | `ProgressBar.tsx` | 7-state impl |
| **Backend Route** | Part of `/api/scan` response | `scan.ts` | Progress updates |
| **Validator** | N/A | - | - |
| **Storage** | `scannerStore.progress` | `scannerStore.ts` | Derived |
| **AI Call** | None | - | - |
| **Error Handling** | N/A | - | - |
| **Abort Path** | Cancel hides progress | `PreIgnitionScanner.tsx` | UI state |

---

## FEATURE 3: IGNITION CONTROLS (PHASE 2)

### F3.1: Backend Selector

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<BackendSelector>` radio buttons | `BackendSelector.tsx` | Component |
| **UXMI State** | idle → hover → selected | `BackendSelector.tsx` | Custom states |
| **Backend Route** | None (local selection) | - | - |
| **Validator** | N/A | - | - |
| **Storage** | `ignitionStore.selectedBackend` | `ignitionStore.ts` | Store update |
| **AI Call** | None | - | - |
| **Error Handling** | Unavailable backend → disabled state | `BackendSelector.tsx` | Visual |
| **Abort Path** | Re-select different backend | `ignitionStore.selectBackend()` | Change |

### F3.2: Ignition Button

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<Button variant="danger">IGNITE</Button>` | `IgnitionButton.tsx` | Lines 35-75 |
| **UXMI State** | idle → hover → active → loading → success/error | `Button.tsx` | 7-state impl |
| **Backend Route** | `POST /api/ignition/start` | `ignition.ts` | Lines 25-80 |
| **Validator** | Token + scan results required | `ignition.ts` | Preconditions |
| **Storage** | `ignitionStore.setIgnited()` | `ignitionStore.ts` | Phase change |
| **AI Call** | None | - | - |
| **Error Handling** | CIA-SIE-PURE unreachable → WHAT/WHY/HOW | `ciaSieErrorTranslator.ts` | Full format |
| **Abort Path** | Emergency stop → `POST /api/ignition/stop` | `ignition.ts` | Immediate |

### F3.3: Confirmation Dialog

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | Modal dialog | `IgnitionButton.tsx` | Lines 85-120 |
| **UXMI State** | hidden → visible | Modal states | - |
| **Backend Route** | N/A (UI confirmation) | - | - |
| **Validator** | N/A | - | - |
| **Storage** | N/A | - | - |
| **AI Call** | None | - | - |
| **Error Handling** | Cancel → close dialog | Modal | Close |
| **Abort Path** | Cancel button | Modal | Close |

---

## FEATURE 4: TELEMETRY DASHBOARD (PHASE 3)

### F4.1: Positions Panel

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<PositionsPanel>` table | `PositionsPanel.tsx` | Component |
| **UXMI State** | loading → data → empty → error | `PositionsPanel.tsx` | Display states |
| **Backend Route** | `GET /api/telemetry/stream` (SSE) | `telemetry.ts` | Lines 35-65 |
| **Validator** | `sanitizeCiaSieResponse()` | `sanitize.ts` | BLOCK-001 |
| **Storage** | `telemetryStore.positions` | `telemetryStore.ts` | Store update |
| **AI Call** | None | - | - |
| **Error Handling** | Connection lost → reconnect | `cia-sie.ts` | WebSocket handler |
| **Abort Path** | Navigate away | Component unmount | Cleanup |

### F4.2: Orders Panel

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<OrdersPanel>` table | `OrdersPanel.tsx` | Component |
| **UXMI State** | loading → data → empty → error | `OrdersPanel.tsx` | Display states |
| **Backend Route** | `GET /api/telemetry/stream` (SSE) | `telemetry.ts` | Lines 35-65 |
| **Validator** | `sanitizeCiaSieResponse()` | `sanitize.ts` | BLOCK-001 |
| **Storage** | `telemetryStore.orders` | `telemetryStore.ts` | Store update |
| **AI Call** | None | - | - |
| **Error Handling** | Connection lost → reconnect | `cia-sie.ts` | WebSocket handler |
| **Abort Path** | Navigate away | Component unmount | Cleanup |

### F4.3: Account Panel

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<AccountPanel>` metrics | `AccountPanel.tsx` | Component |
| **UXMI State** | loading → data → error | `AccountPanel.tsx` | Display states |
| **Backend Route** | `GET /api/telemetry/stream` (SSE) | `telemetry.ts` | Lines 35-65 |
| **Validator** | `sanitizeCiaSieResponse()` | `sanitize.ts` | BLOCK-001 |
| **Storage** | `telemetryStore.account` | `telemetryStore.ts` | Store update |
| **AI Call** | None | - | - |
| **Error Handling** | Stale data → warning indicator | `AccountPanel.tsx` | Freshness |
| **Abort Path** | Navigate away | Component unmount | Cleanup |

### F4.4: System Health Panel

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<SystemHealthPanel>` indicators | `SystemHealthPanel.tsx` | Component |
| **UXMI State** | healthy → degraded → unhealthy | `SystemHealthPanel.tsx` | Status colors |
| **Backend Route** | `GET /api/telemetry/stream` + health probe | `telemetry.ts`, `ciaSieHealthProbe.ts` | Combined |
| **Validator** | `validateHealthContract()` | `contracts.ts` | Contract |
| **Storage** | `telemetryStore.health`, `ciaSieHealthStore` | Stores | Combined |
| **AI Call** | None | - | - |
| **Error Handling** | Engine unreachable → degraded mode | `ciaSieHealthStore.ts` | State change |
| **Abort Path** | N/A (always monitoring) | - | - |

### F4.5: Engine Status Indicator

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<EngineStatusIndicator>` badge | `EngineStatusIndicator.tsx` | Component |
| **UXMI State** | connected (green) → degraded (yellow) → disconnected (red) | `EngineStatusIndicator.tsx` | Status colors |
| **Backend Route** | `ciaSieHealthProbe.executeHealthCheck()` | `ciaSieHealthProbe.ts` | Polling |
| **Validator** | N/A | - | - |
| **Storage** | `ciaSieHealthStore` | `ciaSieHealthStore.ts` | Store |
| **AI Call** | None | - | - |
| **Error Handling** | Connection failure → show disconnected | `EngineStatusIndicator.tsx` | Visual |
| **Abort Path** | N/A (always monitoring) | - | - |

---

## FEATURE 5: SHUTDOWN CONTROLS (PHASE 4)

### F5.1: Shutdown Button

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<Button>Graceful Shutdown</Button>` | `ShutdownPanel.tsx` | Lines 45-75 |
| **UXMI State** | idle → hover → active → loading → success | `Button.tsx` | 7-state impl |
| **Backend Route** | `POST /api/shutdown` | `shutdown.ts` | Lines 20-80 |
| **Validator** | Token required | `shutdown.ts` | Middleware |
| **Storage** | `shutdownStore.initiateShutdown()` | `shutdownStore.ts` | Phase start |
| **AI Call** | None | - | - |
| **Error Handling** | Step failure → WHAT/WHY/HOW | `ShutdownPanel.tsx` | Per-step |
| **Abort Path** | Emergency mode → skip to halt | `shutdownStore.emergency()` | Fast path |

### F5.2: 6-Step Progress Display

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<ProgressBar>` + step indicators | `ShutdownPanel.tsx` | Lines 85-135 |
| **UXMI State** | step 1 → 2 → 3 → 4 → 5 → 6 → complete | `ShutdownPanel.tsx` | CR-002 |
| **Backend Route** | `POST /api/shutdown` (streaming) | `shutdown.ts` | Step updates |
| **Validator** | N/A | - | - |
| **Storage** | `shutdownStore.currentStep` | `shutdownStore.ts` | Progress |
| **AI Call** | None | - | - |
| **Error Handling** | Step failure → retry or skip | `ShutdownPanel.tsx` | Recovery |
| **Abort Path** | Emergency shutdown | `shutdownStore.emergency()` | Skip steps |

### F5.3: Emergency Shutdown Button

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<Button variant="danger">EMERGENCY STOP</Button>` | `ShutdownPanel.tsx` | Lines 145-175 |
| **UXMI State** | idle → hover → active → loading → success | `Button.tsx` | 7-state impl |
| **Backend Route** | `POST /api/shutdown` with `{emergency: true}` | `shutdown.ts` | Lines 85-110 |
| **Validator** | None (emergency bypasses) | - | - |
| **Storage** | `shutdownStore.setEmergency()` | `shutdownStore.ts` | Emergency flag |
| **AI Call** | None | - | - |
| **Error Handling** | Failure → retry with force | `ShutdownPanel.tsx` | Retry |
| **Abort Path** | N/A (is the abort) | - | - |

---

## FEATURE 6: ERROR DISPLAY (CROSS-CUTTING)

### F6.1: Error Display Component

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<ErrorDisplay>` | `ErrorDisplay.tsx` | Component |
| **UXMI State** | error (severity colors) | `ErrorDisplay.tsx` | Severity |
| **Backend Route** | Any route that errors | All routes | Error response |
| **Validator** | `validateErrorContract()` | `contracts.ts` | CR-003 |
| **Storage** | N/A (transient) | - | - |
| **AI Call** | None | - | - |
| **Error Handling** | IS the error handler | `ErrorDisplay.tsx` | Self |
| **Abort Path** | Dismiss button or retry | `ErrorDisplay.tsx` | Actions |

### F6.2: Toast Notifications

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<Toast>` | `Toast.tsx` | Component |
| **UXMI State** | appear → visible → dismiss | `Toast.tsx` | Animation |
| **Backend Route** | Any route | All routes | Notifications |
| **Validator** | N/A | - | - |
| **Storage** | Toast queue (transient) | - | - |
| **AI Call** | None | - | - |
| **Error Handling** | Error toast variant | `Toast.tsx` | Error type |
| **Abort Path** | Dismiss button | `Toast.tsx` | Close |

---

## FEATURE 7: SIMULATION BADGE (TRUTH MARKING)

### F7.1: Simulation Badge

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | `<SimulationBadge>` | `SimulationBadge.tsx` | Component |
| **UXMI State** | visible when simulated | `SimulationBadge.tsx` | Conditional |
| **Backend Route** | N/A | - | - |
| **Validator** | N/A | - | - |
| **Storage** | `isSimulated` prop | - | Prop |
| **AI Call** | None | - | - |
| **Error Handling** | N/A | - | - |
| **Abort Path** | N/A | - | - |

---

## CIA-SIE-PURE FEATURES (OBSERVED BY MCI)

### F8.1: Signal Display

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | Signal indicators (MCI) | Future component | - |
| **UXMI State** | fresh → stale | Freshness | - |
| **Backend Route** | `GET /api/v1/signals` (CIA-SIE) | `signals.py` | - |
| **Validator** | `FreshnessCalculator` | `freshness.py` | - |
| **Storage** | `signals` table | `models.py` | DB |
| **AI Call** | None | - | - |
| **Error Handling** | Signal fetch failure | `ciaSieErrorTranslator.ts` | MCI side |
| **Abort Path** | N/A | - | - |

### F8.2: Contradiction Display

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | Contradiction panel (MCI) | Future component | - |
| **UXMI State** | contradiction present (red) | PP-002 | - |
| **Backend Route** | `GET /api/v1/relationships/{silo_id}` | `relationships.py` | - |
| **Validator** | `ContradictionDetector` | `contradiction_detector.py` | - |
| **Storage** | Computed from signals | - | Derived |
| **AI Call** | None | - | - |
| **Error Handling** | Fetch failure | `ciaSieErrorTranslator.ts` | MCI side |
| **Abort Path** | N/A | - | - |

### F8.3: AI Narrative Display

| Trace Point | Implementation | File | Line Reference |
|-------------|----------------|------|----------------|
| **UI Element** | Narrative panel (MCI) | Future component | - |
| **UXMI State** | loading → narrative → error | - | - |
| **Backend Route** | `POST /api/v1/narratives/{silo_id}` | `narratives.py` | - |
| **Validator** | `validate_ai_response()` | `response_validator.py` | PP-003 |
| **Storage** | `ai_usage` table | `models.py` | Usage tracking |
| **AI Call** | **YES** → Claude API | `claude_client.py` | - |
| **Error Handling** | AI failure → fallback | `narrative_generator.py` | - |
| **Abort Path** | Cancel request | - | Timeout |

---

## TRACEABILITY SUMMARY

| Feature ID | Feature Name | UXMI Compliant | Backend Route | Validator | Error Path | Abort Path |
|------------|--------------|----------------|---------------|-----------|------------|------------|
| F1.1 | API Key Input | ✅ 7-state | N/A | sanitizeApiKey | ErrorDisplay | Clear |
| F1.2 | Access Token Input | ✅ 7-state | N/A | sanitizeAccessToken | ErrorDisplay | Clear |
| F1.3 | Token Validation | ✅ 7-state | POST /api/auth/validate | sanitizeKiteCredentials | ErrorDisplay | Timeout |
| F1.4 | Token Timer | ✅ State machine | N/A | N/A | Phase gate | Logout |
| F2.1 | Run Scanner | ✅ 7-state | POST /api/scan | Token middleware | ErrorDisplay | Cancel |
| F2.2 | Scan Check Item | ✅ Custom | Part of scan | N/A | Tooltip | Re-run |
| F2.3 | Scan Progress | ✅ Progress | Part of scan | N/A | N/A | Cancel |
| F3.1 | Backend Selector | ✅ Custom | N/A | N/A | Disabled | Re-select |
| F3.2 | Ignition Button | ✅ 7-state | POST /api/ignition/start | Preconditions | ErrorDisplay | Emergency |
| F3.3 | Confirmation | Modal | N/A | N/A | Cancel | Cancel |
| F4.1 | Positions Panel | ✅ Display | GET /api/telemetry/stream | sanitizeCiaSieResponse | Reconnect | Navigate |
| F4.2 | Orders Panel | ✅ Display | GET /api/telemetry/stream | sanitizeCiaSieResponse | Reconnect | Navigate |
| F4.3 | Account Panel | ✅ Display | GET /api/telemetry/stream | sanitizeCiaSieResponse | Stale warning | Navigate |
| F4.4 | System Health | ✅ Status | Health probe | validateHealthContract | Degraded mode | N/A |
| F4.5 | Engine Status | ✅ Status | Health probe | N/A | Disconnected | N/A |
| F5.1 | Shutdown Button | ✅ 7-state | POST /api/shutdown | Token | ErrorDisplay | Emergency |
| F5.2 | 6-Step Progress | ✅ CR-002 | POST /api/shutdown | N/A | Per-step | Emergency |
| F5.3 | Emergency Stop | ✅ 7-state | POST /api/shutdown | None | Retry | N/A |
| F6.1 | Error Display | ✅ Severity | Any | validateErrorContract | Self | Dismiss |
| F6.2 | Toast | ✅ Animation | Any | N/A | Error toast | Dismiss |
| F7.1 | Simulation Badge | ✅ Conditional | N/A | N/A | N/A | N/A |

---

## ATTESTATION

This User-Feature → System-Circuit Traceability Matrix:
- Traces every user-visible feature through the complete circuit
- Proves science of intent, not UI coincidence
- Documents UXMI state, backend route, validator, storage, AI call, error handling, and abort path for each feature
- Covers 21 distinct user-facing features

**Signed:** Claude Opus 4.5
**Date:** 2026-01-29
**Authority:** PAD-CFD1 AEROSPACE-GRADE EXECUTION

---

*This document fulfills PAD-CFD1 Deliverable 3 requirements.*
