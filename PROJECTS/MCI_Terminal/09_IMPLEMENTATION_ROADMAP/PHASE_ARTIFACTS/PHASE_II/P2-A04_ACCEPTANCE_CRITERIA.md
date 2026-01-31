# P2-A04: Acceptance Criteria
## Phase II — Requirements Decomposition

**Artifact ID:** P2-A04
**Phase:** II — Requirements Decomposition
**Status:** CREATED
**Version:** 1.0
**Date:** 2026-01-27

---

## Purpose

This document defines acceptance criteria for each functional requirement, providing testable conditions for verification.

---

## Phase 0: Token Capture

### AC-001: Token Capture Form

**Requirement:** FR-001 (Kite Credential Input)

**Given** the user is on the Token Capture screen
**When** the screen loads
**Then:**
- [ ] API Key input field is visible and enabled
- [ ] API Secret input field is visible with password masking
- [ ] Request Token input field is visible
- [ ] Validate button is visible but disabled until all fields have content
- [ ] Kite login link is visible for obtaining request token

**Given** the user leaves a required field empty
**When** the field loses focus (blur)
**Then:**
- [ ] Error message appears below the field
- [ ] Error message follows WHAT/WHY/HOW format
- [ ] Field border changes to error color (red)

---

### AC-002: Token Validation

**Requirement:** FR-002 (Token Validation)

**Given** the user has entered valid Kite credentials
**When** the user clicks Validate
**Then:**
- [ ] Loading spinner appears
- [ ] Validate button is disabled
- [ ] API call to /api/auth/validate is made
- [ ] On success, access token is stored
- [ ] On success, phase transitions to Pre-Ignition

**Given** the user has entered invalid credentials
**When** the user clicks Validate
**Then:**
- [ ] Error displays in WHAT/WHY/HOW format
- [ ] Error explains what credential was invalid
- [ ] Error provides link to Kite Console

---

### AC-003: Token Expiry Timer

**Requirement:** FR-003 (Token Expiry Display)

**Given** a valid token exists
**When** viewing any screen
**Then:**
- [ ] Countdown timer is visible
- [ ] Timer shows hours:minutes:seconds until 6:00 AM IST
- [ ] Timer updates every second

**Given** less than 15 minutes remain
**When** timer updates
**Then:**
- [ ] Timer changes to warning state (amber)
- [ ] Warning toast may appear

**Given** less than 5 minutes remain
**When** timer updates
**Then:**
- [ ] Timer changes to critical state (red)
- [ ] Critical toast appears

**Given** token has expired
**When** any operation is attempted
**Then:**
- [ ] Operation is blocked
- [ ] User is redirected to Token Capture
- [ ] Message explains token expired at 6:00 AM IST

---

## Phase 1: Pre-Ignition Scanner

### AC-004: Scanner Display

**Requirement:** FR-004 (12-Point Scanner)

**Given** the user is on the Pre-Ignition screen
**When** the screen loads
**Then:**
- [ ] All 12 checks are listed
- [ ] Each check shows name and status (pending)
- [ ] Run Scan button is visible

**Given** the user clicks Run Scan
**When** scan is in progress
**Then:**
- [ ] Each check transitions through running state
- [ ] Duration is recorded for each check
- [ ] Progress is visible

**Given** all checks complete
**When** viewing results
**Then:**
- [ ] Summary shows passed/failed/warning counts
- [ ] Failed checks are highlighted
- [ ] Proceed button enabled only if all critical checks pass

---

### AC-005: Kite Connection Check

**Requirement:** FR-005 (Kite Connection Check)

**Given** the Kite connection check runs
**When** Kite API is reachable
**Then:**
- [ ] Check shows pass status
- [ ] Latency is displayed in milliseconds

**Given** the Kite connection check runs
**When** Kite API is unreachable
**Then:**
- [ ] Check shows fail status
- [ ] Error message in WHAT/WHY/HOW format
- [ ] Ignition is blocked

---

## Phase 2: Ignition

### AC-006: Backend Selection

**Requirement:** FR-007 (Backend Selection)

**Given** the user is on the Ignition screen
**When** viewing backend options
**Then:**
- [ ] Zerodha Kite option is visible with icon
- [ ] ICICI Direct option is visible with icon
- [ ] HDFC Sky option is visible with icon
- [ ] Kotak Neo option is visible with icon
- [ ] No US broker options are visible

**Given** the user clicks a broker option
**When** selection is made
**Then:**
- [ ] Selected broker is highlighted
- [ ] Other options are de-emphasized
- [ ] ARM button becomes available

---

### AC-007: Two-Stage Arming

**Requirement:** FR-008 (Two-Stage Arming)

**Given** a backend is selected
**When** user clicks ARM
**Then:**
- [ ] Confirmation dialog appears
- [ ] User must type "CONFIRM TRADE" exactly
- [ ] Confirm button disabled until phrase matches

**Given** user has confirmed trading
**When** ARM completes
**Then:**
- [ ] System shows ARMED status
- [ ] IGNITE button appears
- [ ] Disarm option is available

---

### AC-008: Ignition Execution

**Requirement:** FR-009 (Ignition Execution)

**Given** system is armed
**When** user clicks IGNITE
**Then:**
- [ ] Loading state shows "Ignition in progress"
- [ ] Connection to backend is established
- [ ] On success, phase transitions to Telemetry
- [ ] On failure, error in WHAT/WHY/HOW format

---

## Phase 3: Telemetry

### AC-009: Positions Panel

**Requirement:** FR-010 (Positions Display)

**Given** positions exist
**When** viewing Positions panel
**Then:**
- [ ] Each position shows Indian stock symbol (e.g., RELIANCE, TCS)
- [ ] Quantity is displayed
- [ ] Entry price is displayed
- [ ] Current price updates in real-time
- [ ] P&L is calculated and displayed
- [ ] Positive P&L is green, negative is red

---

### AC-010: System Health Panel

**Requirement:** FR-013 (System Health)

**Given** system is running
**When** viewing Health panel
**Then:**
- [ ] CPU usage percentage displayed with progress bar
- [ ] Memory usage percentage displayed with progress bar
- [ ] Latency displayed in milliseconds
- [ ] Overall status indicator (healthy = green, degraded = amber, critical = red)

---

## Phase 4: Shutdown

### AC-011: Graceful Shutdown

**Requirement:** FR-015 (Graceful Shutdown)

**Given** system is running
**When** user initiates graceful shutdown
**Then:**
- [ ] Step 1: "Cancelling orders" shows progress, then complete
- [ ] Step 2: "Closing positions" shows progress, then complete
- [ ] Step 3: "Disconnecting broker" shows progress, then complete
- [ ] Step 4: "Stopping telemetry" shows progress, then complete
- [ ] Step 5: "Clearing session" shows progress, then complete
- [ ] Step 6: "Logging completion" shows progress, then complete
- [ ] All 6 steps complete before returning to Phase 0

---

### AC-012: Emergency Shutdown

**Requirement:** FR-016 (Emergency Shutdown)

**Given** emergency shutdown is initiated
**When** shutdown executes
**Then:**
- [ ] All 6 steps still execute but faster
- [ ] Total time is less than 5 seconds
- [ ] Reason is logged
- [ ] Return to Phase 0

---

## UXMI

### AC-013: 7-State Components

**Requirement:** FR-017 (7-State Components)

**Given** any UXMI component (Button, Input, etc.)
**When** interacting with component
**Then:**
- [ ] idle: Default appearance when not interacting
- [ ] hover: Visual change within 150ms of mouse enter
- [ ] active: Press feedback within 100ms of click
- [ ] loading: Spinner/indicator during async operation
- [ ] success: Green indicator on successful completion
- [ ] error: Red indicator on failure
- [ ] disabled: Grayed out, not interactive

---

### AC-014: Error Display

**Requirement:** FR-018 (Error Display Format)

**Given** an error occurs
**When** error is displayed
**Then:**
- [ ] WHAT section is visible with brief description
- [ ] WHY section is visible with explanation
- [ ] HOW section is visible with resolution steps
- [ ] Technical details toggle is available
- [ ] Dismiss button is available

---

## Acceptance Summary

| Phase | Criteria Count | Critical |
|-------|----------------|----------|
| Phase 0 | 3 | All |
| Phase 1 | 2 | All |
| Phase 2 | 3 | All |
| Phase 3 | 2 | All |
| Phase 4 | 2 | All |
| UXMI | 2 | All |
| **Total** | **14** | **14** |

---

*P2-A04 Acceptance Criteria v1.0 | Phase II Artifact | MCI Project*
