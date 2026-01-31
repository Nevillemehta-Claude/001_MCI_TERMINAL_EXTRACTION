# P2-A02: Non-Functional Requirements
## Phase II — Requirements Decomposition

**Artifact ID:** P2-A02
**Phase:** II — Requirements Decomposition
**Status:** CREATED
**Version:** 1.0
**Date:** 2026-01-27

---

## Purpose

This document defines non-functional requirements (quality attributes) for MCI.

---

## Performance Requirements

### NFR-001: Page Load Time

**Description:** Initial page load shall complete within 2 seconds.

**Source:** P1-A03 (Success Metrics)

**Measurement:** Lighthouse Performance Score, Performance API

**Target:** < 2 seconds

**Critical Threshold:** 5 seconds

---

### NFR-002: First Contentful Paint

**Description:** First contentful paint shall occur within 1 second.

**Source:** P1-A03

**Measurement:** Lighthouse FCP metric

**Target:** < 1 second

**Critical Threshold:** 2 seconds

---

### NFR-003: Time to Interactive

**Description:** Application shall be interactive within 3 seconds.

**Source:** P1-A03

**Measurement:** Lighthouse TTI metric

**Target:** < 3 seconds

**Critical Threshold:** 5 seconds

---

### NFR-004: API Response Time

**Description:** Backend API responses shall complete within 200ms (p95).

**Source:** P1-A03

**Measurement:** Server-side metrics, X-Response-Time header

**Target:** < 200ms (p95)

**Critical Threshold:** 500ms

---

### NFR-005: WebSocket Latency

**Description:** WebSocket message latency shall not exceed 50ms.

**Source:** P1-A03

**Measurement:** Ping/pong measurement

**Target:** < 50ms

**Critical Threshold:** 200ms

---

### NFR-006: Telemetry Update Rate

**Description:** Telemetry data shall update at specified frequencies.

**Source:** P1-A03

**Measurement:** Update event count per second

**Targets:**
- Positions: 1 update/second
- Orders: On change (< 100ms)
- Account: Every 5 seconds
- Health: Every 5 seconds
- Market: 1 update/second

---

## Reliability Requirements

### NFR-007: System Availability

**Description:** System shall be available 99.9% during market hours.

**Source:** P1-A03, P1-A05 (Risk)

**Measurement:** Uptime monitoring

**Target:** 99.9% (9:15 AM - 3:30 PM IST)

**Calculation:** (Total time - Downtime) / Total time

---

### NFR-008: WebSocket Reconnection

**Description:** WebSocket shall automatically reconnect on disconnection.

**Source:** P1-A05 (Risk R-T02)

**Measurement:** Reconnection success rate

**Target:** 99% successful reconnections within 5 attempts

**Strategy:** Exponential backoff (1s, 2s, 4s, 8s, 16s)

---

### NFR-009: Graceful Degradation

**Description:** System shall degrade gracefully on partial failures.

**Source:** P1-A05

**Behavior:**
- WebSocket failure → Fall back to REST polling
- Single panel failure → Other panels remain functional
- Broker timeout → Show stale data indicator

---

## Usability Requirements

### NFR-010: UXMI Timing Compliance

**Description:** All micro-interactions shall comply with CR-005 timing.

**Source:** P1-A04 (Constraints)

**CR Link:** CR-005 (SACRED)

**Targets:**
- Hover transition: 150ms
- Active press: 100ms
- Tooltip delay: 300ms
- Toast duration: 5000ms

---

### NFR-011: Error Clarity

**Description:** All errors shall be human-readable and actionable.

**Source:** P1-A04

**CR Link:** CR-003 (SACRED)

**Measurement:** User comprehension testing

**Target:** 95% of users understand error and can take action

---

### NFR-012: Status Visibility

**Description:** System status shall be immediately apparent.

**Source:** P1-A01 (Decision-support)

**PP Link:** PP-001 (Decision-Support)

**Requirements:**
- Connection status always visible
- Token expiry countdown visible
- Phase indicator visible
- Health status visible

---

## Security Requirements

### NFR-013: Credential Protection

**Description:** API credentials shall be protected in transit and at rest.

**Source:** P1-A04, P1-A05 (Risk)

**Requirements:**
- HTTPS for all API calls
- Credentials not logged
- Session storage (not localStorage)
- Cleared on logout/expiry

---

### NFR-014: Token Lifecycle

**Description:** Token lifecycle shall comply with CR-004.

**Source:** P1-A04

**CR Link:** CR-004 (SACRED)

**Requirements:**
- Token expires at 6:00 AM IST
- Expired tokens rejected immediately
- No operations with expired token
- Clear redirect to re-authentication

---

### NFR-015: Session Security

**Description:** Sessions shall be secure and properly managed.

**Source:** P1-A05

**Requirements:**
- Session bound to browser tab
- beforeunload warning during active trading
- Session cleared on shutdown
- No persistent credentials

---

## Maintainability Requirements

### NFR-016: Code Coverage

**Description:** Unit test coverage shall meet minimum thresholds.

**Source:** P1-A03

**Targets:**
- Unit tests: > 80%
- E2E tests: > 70%
- Mutation score: > 70%

---

### NFR-017: TypeScript Strictness

**Description:** Codebase shall use strict TypeScript.

**Source:** Development standards

**Requirements:**
- strict: true in tsconfig
- No `any` types
- All functions typed
- No implicit returns

---

### NFR-018: Linting Compliance

**Description:** Code shall pass all linting rules.

**Source:** Development standards

**Target:** 0 ESLint errors, 0 warnings

---

## Accessibility Requirements

### NFR-019: WCAG Compliance

**Description:** UI shall comply with WCAG 2.1 AA.

**Source:** P1-A01 (Professional standard)

**Requirements:**
- Color contrast 4.5:1 minimum
- Keyboard navigation for all functions
- Screen reader compatibility
- Focus management

---

### NFR-020: ARIA Attributes

**Description:** Interactive elements shall have proper ARIA attributes.

**Source:** Accessibility standards

**Requirements:**
- role attributes where needed
- aria-live for dynamic content
- aria-label for icon buttons
- aria-describedby for errors

---

## Compatibility Requirements

### NFR-021: Browser Support

**Description:** Application shall support modern browsers.

**Source:** P1-A01

**Supported Browsers:**
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

---

### NFR-022: Responsive Design

**Description:** Application shall be usable on desktop and tablet.

**Source:** P1-A01

**Breakpoints:**
- Desktop: 1280px+
- Tablet: 768px - 1279px
- Mobile: Not required (trading interface)

---

## Observability Requirements

### NFR-023: Error Tracking

**Description:** Errors shall be captured and reported to Sentry.

**Source:** P1-A05 (Risk monitoring)

**Requirements:**
- All unhandled exceptions captured
- Trading errors captured with context
- Source maps for stack traces
- User ID attached (anonymized)

---

### NFR-024: Performance Monitoring

**Description:** Performance metrics shall be collected.

**Source:** P1-A03

**Metrics:**
- Page load times
- API response times
- WebSocket latency
- Component render times

---

## Summary

| Category | Count |
|----------|-------|
| Performance | 6 |
| Reliability | 3 |
| Usability | 3 |
| Security | 3 |
| Maintainability | 3 |
| Accessibility | 2 |
| Compatibility | 2 |
| Observability | 2 |
| **Total** | **24** |

---

*P2-A02 Non-Functional Requirements v1.0 | Phase II Artifact | MCI Project*
