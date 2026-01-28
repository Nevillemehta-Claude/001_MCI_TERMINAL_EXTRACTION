# P2-A01: Functional Requirements
## Phase II — Requirements Decomposition

**Artifact ID:** P2-A01
**Phase:** II — Requirements Decomposition
**Status:** CREATED
**Version:** 1.0
**Date:** 2026-01-27

---

## Purpose

This document decomposes the MCI mission into specific, testable functional requirements.

---

## Requirements Structure

Each requirement follows the format:
- **ID**: FR-XXX (Functional Requirement)
- **Description**: What the system must do
- **Source**: Phase I artifact reference
- **CR/PP Link**: Constitutional requirement or principle
- **Priority**: Must / Should / Could
- **Acceptance Criteria**: Testable conditions

---

## Phase 0: Token Capture

### FR-001: Kite Credential Input

**Description:** The system shall provide input fields for Kite API Key, API Secret, and Request Token.

**Source:** P1-A01 (Mission Charter), P1-A03 (Success Metrics)

**CR/PP Link:** CR-001 (Token Validity)

**Priority:** Must

**Acceptance Criteria:**
- [ ] API Key input field present and functional
- [ ] API Secret input field present with visibility toggle
- [ ] Request Token input field present
- [ ] All fields validate on blur
- [ ] Empty field validation messages display

---

### FR-002: Token Validation

**Description:** The system shall validate credentials against Kite Connect API and obtain access token.

**Source:** P1-A01, P1-A04 (Constraints)

**CR/PP Link:** CR-001 (Token Validity)

**Priority:** Must

**Acceptance Criteria:**
- [ ] Valid credentials return access token
- [ ] Invalid credentials display WHAT/WHY/HOW error
- [ ] Validation completes within 30 seconds
- [ ] Loading state displayed during validation

---

### FR-003: Token Expiry Display

**Description:** The system shall display countdown timer showing time until 6:00 AM IST expiry.

**Source:** P1-A04 (Constraints)

**CR/PP Link:** CR-004 (Token Expiry - SACRED)

**Priority:** Must

**Acceptance Criteria:**
- [ ] Countdown timer visible when token is valid
- [ ] Timer updates every second
- [ ] Warning state at 15 minutes remaining
- [ ] Critical state at 5 minutes remaining
- [ ] Auto-redirect to Phase 0 on expiry

---

## Phase 1: Pre-Ignition Scanner

### FR-004: 12-Point Scanner

**Description:** The system shall execute 12 pre-ignition checks before allowing ignition.

**Source:** P1-A01, P1-A05 (Risk Register)

**CR/PP Link:** CR-001 (Token Validity)

**Priority:** Must

**Acceptance Criteria:**
- [ ] All 12 checks listed on screen
- [ ] Each check shows pending/running/pass/warning/fail status
- [ ] Duration displayed for each check
- [ ] Summary shows total passed/failed
- [ ] Ignition blocked if critical checks fail

---

### FR-005: Kite Connection Check

**Description:** The system shall verify Kite API connectivity.

**Source:** P1-A04 (Indian broker constraint)

**CR/PP Link:** CR-001

**Priority:** Must

**Acceptance Criteria:**
- [ ] Kite API ping successful
- [ ] Latency measured and displayed
- [ ] Failure shows WHAT/WHY/HOW error

---

### FR-006: Market Status Check

**Description:** The system shall verify NSE/BSE market status.

**Source:** P1-A01 (Indian market focus)

**CR/PP Link:** None (operational requirement)

**Priority:** Must

**Acceptance Criteria:**
- [ ] Market hours verified (9:15 AM - 3:30 PM IST)
- [ ] Holiday calendar checked
- [ ] Warning if outside market hours

---

## Phase 2: Ignition

### FR-007: Backend Selection

**Description:** The system shall allow selection from 4 Indian brokers.

**Source:** P1-A01, P1-A04

**CR/PP Link:** None (feature requirement)

**Priority:** Must

**Acceptance Criteria:**
- [ ] Zerodha Kite option available
- [ ] ICICI Direct option available
- [ ] HDFC Sky option available
- [ ] Kotak Neo option available
- [ ] Only one broker selectable at a time

---

### FR-008: Two-Stage Arming

**Description:** The system shall require ARM then IGNITE sequence for safety.

**Source:** P1-A05 (Risk mitigation)

**CR/PP Link:** PP-001 (Decision-Support)

**Priority:** Must

**Acceptance Criteria:**
- [ ] ARM button requires broker selection first
- [ ] Real trading requires confirmation phrase
- [ ] IGNITE button only available after ARM
- [ ] Disarm option available
- [ ] Emergency abort available

---

### FR-009: Ignition Execution

**Description:** The system shall connect to selected broker backend on ignition.

**Source:** P1-A01

**CR/PP Link:** None

**Priority:** Must

**Acceptance Criteria:**
- [ ] Connection established with backend
- [ ] Connection ID returned
- [ ] WebSocket URL provided for telemetry
- [ ] Phase transitions to Telemetry on success

---

## Phase 3: Telemetry

### FR-010: Positions Display

**Description:** The system shall display current positions with P&L.

**Source:** P1-A01 (Decision-support)

**CR/PP Link:** PP-001 (Decision-Support NOT Decision-Making)

**Priority:** Must

**Acceptance Criteria:**
- [ ] Symbol displayed (Indian stocks)
- [ ] Quantity displayed
- [ ] Entry price displayed
- [ ] Current price updated real-time
- [ ] Unrealized P&L calculated and displayed
- [ ] P&L percentage displayed

---

### FR-011: Orders Display

**Description:** The system shall display active and recent orders.

**Source:** P1-A01

**CR/PP Link:** PP-001

**Priority:** Must

**Acceptance Criteria:**
- [ ] Order ID displayed
- [ ] Symbol, side, type displayed
- [ ] Status updated real-time
- [ ] Filled/pending quantity shown

---

### FR-012: Account Summary

**Description:** The system shall display account metrics.

**Source:** P1-A01, P1-A03 (Success Metrics)

**CR/PP Link:** PP-001

**Priority:** Must

**Acceptance Criteria:**
- [ ] Equity displayed in INR
- [ ] Cash balance displayed
- [ ] Day P&L displayed
- [ ] Total P&L displayed

---

### FR-013: System Health

**Description:** The system shall display backend health metrics.

**Source:** P1-A05 (Risk monitoring)

**CR/PP Link:** PP-002 (Expose Contradictions)

**Priority:** Must

**Acceptance Criteria:**
- [ ] CPU usage displayed
- [ ] Memory usage displayed
- [ ] Latency displayed
- [ ] Overall status indicator (healthy/degraded/critical)

---

### FR-014: Market Data

**Description:** The system shall display watchlist market data.

**Source:** P1-A01

**CR/PP Link:** PP-001

**Priority:** Must

**Acceptance Criteria:**
- [ ] Indian stock symbols (RELIANCE, TCS, etc.)
- [ ] Current price displayed
- [ ] Change and change percent displayed
- [ ] Updates every second

---

## Phase 4: Shutdown

### FR-015: Graceful Shutdown

**Description:** The system shall execute 6-step graceful shutdown sequence.

**Source:** P1-A04 (Constraints)

**CR/PP Link:** CR-002 (Graceful Shutdown - SACRED)

**Priority:** Must

**Acceptance Criteria:**
- [ ] Step 1: Cancel orders executed
- [ ] Step 2: Close positions executed
- [ ] Step 3: Disconnect broker executed
- [ ] Step 4: Stop telemetry executed
- [ ] Step 5: Clear session executed
- [ ] Step 6: Log complete executed
- [ ] All steps complete before exit
- [ ] Progress displayed for each step

---

### FR-016: Emergency Shutdown

**Description:** The system shall provide emergency shutdown capability.

**Source:** P1-A05 (Risk mitigation)

**CR/PP Link:** CR-002

**Priority:** Must

**Acceptance Criteria:**
- [ ] Emergency button always visible during Phase 3
- [ ] Executes faster than graceful shutdown
- [ ] Still follows 6-step sequence
- [ ] Logs emergency shutdown reason

---

## UXMI Requirements

### FR-017: 7-State Components

**Description:** All interactive components shall implement 7 UXMI states.

**Source:** P1-A04 (Constraints)

**CR/PP Link:** CR-005 (UXMI 7-States - SACRED)

**Priority:** Must

**Acceptance Criteria:**
- [ ] idle state implemented
- [ ] hover state with 150ms transition
- [ ] active state with 100ms feedback
- [ ] loading state implemented
- [ ] success state implemented
- [ ] error state implemented
- [ ] disabled state implemented

---

### FR-018: Error Display Format

**Description:** All errors shall display in WHAT/WHY/HOW format.

**Source:** P1-A04 (Constraints)

**CR/PP Link:** CR-003 (Error Format - SACRED)

**Priority:** Must

**Acceptance Criteria:**
- [ ] WHAT section shows brief description
- [ ] WHY section shows explanation
- [ ] HOW section shows resolution steps
- [ ] Technical details toggle available

---

## Requirements Summary

| Phase | Count | Must | Should | Could |
|-------|-------|------|--------|-------|
| Phase 0 | 3 | 3 | 0 | 0 |
| Phase 1 | 3 | 3 | 0 | 0 |
| Phase 2 | 3 | 3 | 0 | 0 |
| Phase 3 | 5 | 5 | 0 | 0 |
| Phase 4 | 2 | 2 | 0 | 0 |
| UXMI | 2 | 2 | 0 | 0 |
| **Total** | **18** | **18** | **0** | **0** |

---

*P2-A01 Functional Requirements v1.0 | Phase II Artifact | MCI Project*
