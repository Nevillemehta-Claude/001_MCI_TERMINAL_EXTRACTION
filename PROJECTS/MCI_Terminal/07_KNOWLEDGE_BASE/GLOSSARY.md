# MCI GLOSSARY

**Extracted from:** Session b8937bc2-ac10-4287-8ced-af96ac5f6f0b
**Extraction Date:** 2026-01-25

---

## TERMS & DEFINITIONS

### A

**ARM**
The first stage of the two-stage safety mechanism. User must ARM before executing a critical action (ignition or shutdown).

### B

**Backend**
One of 4 supported Indian brokers: Zerodha Kite, ICICI Direct, HDFC Sky, or Kotak Neo.

**Bun**
JavaScript runtime used by MCI (faster than Node.js).

### C

**CIA-SIE-PURE**
The trading ENGINE. The backend system that executes actual trades. MCI is the cockpit that monitors and controls it.

**COCKPIT**
The role of MCI - it monitors and controls but does NOT execute trades (like a car dashboard).

**CR (Constitutional Requirement)**
One of 5 sacred, inviolable requirements that govern all MCI operations.

### D

**Decision-Support**
MCI's role - it provides information to support decisions but NEVER makes trading decisions itself.

### E

**ENGINE**
The trading system (CIA-SIE-PURE) that executes actual trades. MCI is the COCKPIT.

### G

**Gate**
A quality checkpoint in the development lifecycle. MCI has 6 gates.

**Graceful Shutdown**
The CR-002 mandated 6-step shutdown sequence.

### H

**Hono**
Lightweight web framework for Bun used by MCI's backend.

### I

**Ignition**
Phase 2 - the controlled startup of the trading engine.

**IST**
Indian Standard Time (UTC+5:30). Critical for token expiry at 6:00 AM IST.

### K

**Kite**
Zerodha's trading API. Primary broker integration for MCI.

### M

**MCI (Mission Control Interface)**
The NASA-grade decision-support trading dashboard. The COCKPIT.

### P

**Phase**
One of 5 runtime phases (0-4) or 12 development phases.

**Pre-Ignition**
Phase 1 - the 12-point system check before ignition.

### R

**RETROFIT**
The decision to update existing code rather than rebuild from scratch.

### S

**Scanner**
The 12-point pre-ignition check system in Phase 1.

**SSE (Server-Sent Events)**
One-way real-time communication from server to client. Fallback for WebSocket.

**Supervised**
MCI's execution model - AI suggests, user approves. NOT autonomous.

### T

**Telemetry**
Phase 3 - real-time monitoring of trading engine operations.

**Token**
The Kite access token required for API operations. Expires daily at 6:00 AM IST.

### U

**UXMI**
User Experience Micro-Interactions - the 7-component UI library implementing CR-005.

### W

**WHAT/WHY/HOW**
The CR-003 mandated error format.

### Z

**Zustand**
State management library used by MCI.

---

## ACRONYMS

| Acronym | Full Form |
|---------|-----------|
| CR | Constitutional Requirement |
| IST | Indian Standard Time |
| MCI | Mission Control Interface |
| NSE | National Stock Exchange (India) |
| BSE | Bombay Stock Exchange (India) |
| SSE | Server-Sent Events |
| UXMI | User Experience Micro-Interactions |
| WS | WebSocket |

---

## NUMBERS REFERENCE

| Number | Meaning |
|--------|---------|
| 5 | Constitutional Requirements (CR-001 to CR-005) |
| 5 | Runtime Phases (0-4) |
| 6 | Shutdown steps (CR-002) |
| 6 | Quality Gates |
| 7 | UXMI Components |
| 7 | UXMI States |
| 12 | Scanner checks |
| 12 | Development phases |
| 97% | Code quality rating after audit |
| 150ms | Hover transition timing |
| 100ms | Active press timing |
| 300ms | Tooltip delay |
| 5000ms | Toast auto-dismiss |
| 6:00 AM | Token expiry time (IST) |
