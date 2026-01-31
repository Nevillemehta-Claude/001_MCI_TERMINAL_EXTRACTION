# VERBATIM API REFERENCES - COMPLETE EXTRACTION

**Source:** b8937bc2-ac10-4287-8ced-af96ac5f6f0b.jsonl
**Extraction Date:** 2026-01-25

This document contains all API endpoint and route references from the MCI session.

---

## ALL API REFERENCES


### API REF 1

│      │
│     │                    │  POST /api/auth     │                   │              │      │
│     │                    │────────────────────>│                   │              │      │
│     │

---

### API REF 2

**INTEGRATION (4)** | | |
| 2.10 | API Contract | Endpoint Spec |
| 2.11 | WebSocket Events | Event Schema |
| 2.12 | Error Propagation (CR-003) | Flow Diagram |
| 2.13 | Data Flow Lifecycle | DFD |

---

**These ar

---

### API REF 3

│          │
│     │                │  POST /api/ignition │                   │              │          │
│     │                │────────────────────>│                   │              │          │
│     │

---

### API REF 4

───────────┐  │
│  │                              /api/auth                                             │  │
│  ├───────────────────────────────────────────────────────────────────────────────────┤  │
│  │

---

### API REF 5

───────────┐  │
│  │                              /api/ignition                                         │  │
│  ├───────────────────────────────────────────────────────────────────────────────────┤  │
│  │

---

### API REF 6

───────────┐  │
│  │                              /api/telemetry                                        │  │
│  ├───────────────────────────────────────────────────────────────────────────────────┤  │
│  │

---

### API REF 7

───────────┐  │
│  │                              /api/shutdown                                         │  │
│  ├───────────────────────────────────────────────────────────────────────────────────┤  │
│  │

---

### API REF 8

│          │
│     │                │  POST /shutdown     │                   │              │          │
│     │                │────────────────────>│                   │              │          │
│

---

### API REF 9

│  │
│  │  POST /validate                                                                   │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

### API REF 10

│  │
│  │  GET /status                                                                      │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

### API REF 11

│  │
│  │  POST /logout                                                                     │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

### API REF 12

│  │
│  │  POST /start                                                                      │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

### API REF 13

│  │
│  │  GET /backends                                                                    │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

### API REF 14

│  │
│  │  GET /positions                                                                   │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

### API REF 15

│  │
│  │  GET /orders                                                                      │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

### API REF 16

│  │
│  │  GET /health                                                                      │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

### API REF 17

│  │
│  │  GET /pnl                                                                         │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

### API REF 18

│  │
│  │  POST /graceful                                                                   │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

### API REF 19

│  │
│  │  POST /emergency                                                                  │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

### API REF 20

WHY:  Broker server not responding. The Kite API endpoint             │ │  │  │
│  │  │  │       returned ECONNREFUSED after 3 retry attempts.                    │ │  │  │
│  │  │  ├───────────────────────────────────────────────

---

### API REF 21

**actual schematic files** that would live in an `/architecture/` folder.

## To Close This Gap

We would need to create:

```
04_IMPLEMENTATION/mci/docs/architecture/
├── README.md                    (Architecture

---

### API REF 22

(Phases 0-4)
- All component specifications
- API endpoint definitions
- UXMI 7-state specifications (CR-005)
- Technology stack details
- File structure

**Used for:** Component hierarchy, API contracts, state managemen

---

### API REF 23

PI CONTRACT (MCI → CIA-SIE-PURE):**
- Token: POST /api/token, GET /api/token/status
- Ignition: POST /api/ignition/start, POST /api/ignition/stop, POST /api/emergency-stop
- Telemetry: GET /api/telemetry, GET /

---

### API REF 24

→ CIA-SIE-PURE):**
- Token: POST /api/token, GET /api/token/status
- Ignition: POST /api/ignition/start, POST /api/ignition/stop, POST /api/emergency-stop
- Telemetry: GET /api/telemetry, GET /api/positions, GET /api

---

### API REF 25

api/token, GET /api/token/status
- Ignition: POST /api/ignition/start, POST /api/ignition/stop, POST /api/emergency-stop
- Telemetry: GET /api/telemetry, GET /api/positions, GET /api/health, GET /api/orders

**DATA FLOW

---

### API REF 26

status
- Ignition: POST /api/ignition/start, POST /api/ignition/stop, POST /api/emergency-stop
- Telemetry: GET /api/telemetry, GET /api/positions, GET /api/health, GET /api/orders

**DATA FLOW:**
- MCI → PURE: Command

---

### API REF 27

api/ignition/start, POST /api/ignition/stop, POST /api/emergency-stop
- Telemetry: GET /api/telemetry, GET /api/positions, GET /api/health, GET /api/orders

**DATA FLOW:**
- MCI → PURE: Commands (Start, Stop), Toke

---

### API REF 28

n/stop, POST /api/emergency-stop
- Telemetry: GET /api/telemetry, GET /api/positions, GET /api/health, GET /api/orders

**DATA FLOW:**
- MCI → PURE: Commands (Start, Stop), Tokens
- PURE → MCI: Telemetry (Positions

---

### API REF 29

ergency-stop
- Telemetry: GET /api/telemetry, GET /api/positions, GET /api/health, GET /api/orders

**DATA FLOW:**
- MCI → PURE: Commands (Start, Stop), Tokens
- PURE → MCI: Telemetry (Positions, Health), Status (R

---

### API REF 30

etry: GET /api/telemetry, GET /api/positions, GET /api/health, GET /api/orders

**DATA FLOW:**
- MCI → PURE: Commands (Start, Stop), Tokens
- PURE → MCI: Telemetry (Positions, Health), Status (Running, Stopped),

---

### API REF 31

lemetry, GET /api/positions, GET /api/health, GET /api/orders

**DATA FLOW:**
- MCI → PURE: Commands (Start, Stop), Tokens
- PURE → MCI: Telemetry (Positions, Health), Status (Running, Stopped), Alerts

**KEY IN

---

### API REF 32

**API CONTRACT (MCI → CIA-SIE-PURE):**
- Token: POST /api/token, GET /api/token/status
- Ignition: POST /api/ignition/start, POST /api/ignition/stop, POST /api/emergency-stop
- Telemetry: GET /api/telemetry, GET /a

---

### API REF 33

(MCI → CIA-SIE-PURE):**
- Token: POST /api/token, GET /api/token/status
- Ignition: POST /api/ignition/start, POST /api/ignition/stop, POST /api/emergency-stop
- Telemetry: GET /api/telemetry, GET /api/positions, GET /api

---

### API REF 34

OST /api/token, GET /api/token/status
- Ignition: POST /api/ignition/start, POST /api/ignition/stop, POST /api/emergency-stop
- Telemetry: GET /api/telemetry, GET /api/positions, GET /api/health, GET /api/orders

**DATA FLOW:

---

### API REF 35

oken/status
- Ignition: POST /api/ignition/start, POST /api/ignition/stop, POST /api/emergency-stop
- Telemetry: GET /api/telemetry, GET /api/positions, GET /api/health, GET /api/orders

**DATA FLOW:**
- MCI → PURE: Commands

---

### API REF 36

OST /api/ignition/start, POST /api/ignition/stop, POST /api/emergency-stop
- Telemetry: GET /api/telemetry, GET /api/positions, GET /api/health, GET /api/orders

**DATA FLOW:**
- MCI → PURE: Commands (Start, Stop), Tokens
-

---

### API REF 37

ition/stop, POST /api/emergency-stop
- Telemetry: GET /api/telemetry, GET /api/positions, GET /api/health, GET /api/orders

**DATA FLOW:**
- MCI → PURE: Commands (Start, Stop), Tokens
- PURE → MCI: Telemetry (Positions,

---

### API REF 38

i/emergency-stop
- Telemetry: GET /api/telemetry, GET /api/positions, GET /api/health, GET /api/orders

**DATA FLOW:**
- MCI → PURE: Commands (Start, Stop), Tokens
- PURE → MCI: Telemetry (Positions, Health), Status (Ru

---

### API REF 39

elemetry: GET /api/telemetry, GET /api/positions, GET /api/health, GET /api/orders

**DATA FLOW:**
- MCI → PURE: Commands (Start, Stop), Tokens
- PURE → MCI: Telemetry (Positions, Health), Status (Running, Stopped),

---

### API REF 40

i/telemetry, GET /api/positions, GET /api/health, GET /api/orders

**DATA FLOW:**
- MCI → PURE: Commands (Start, Stop), Tokens
- PURE → MCI: Telemetry (Positions, Health), Status (Running, Stopped), Alerts

**KEY IN

---

### API REF 41

ROLS

**PHYSICAL LOCATIONS:**
- **CIA-SIE-PURE**: `/Users/nevillemehta/Downloads/CIA-SIE-PURE/` (Python, FastAPI, EXISTING, OPERATIONAL)
- **MCI**: `/Users/nevillemehta/Downloads/PROJECTS/01_MCI/` (TypeScript, React+Hono, SPECIFICATIONS COMPLETE

---

### API REF 42

Seven States, Tooltips |

**ORIGINAL MAC PATH:**
`/Users/nevillemehta/Downloads/CIA-SIE-START-STOP/`
(Now at: `/Users/nevillemehta/Downloads/PROJECTS/01_MCI/`)

**HISTORICAL NOTE:** 
- 04_IMPLEMENTATION/ was EMPTY at this time, "Ready for fresh Claud

---

### API REF 43

: Proceed to verification
- Step 3.5: Verify with GET /user/profile
- Step 3.6: Store expiry for countdown (HH:MM:SS remaining)
- Result: GO / NO-GO (with re-auth option)

**PHASE 4: ANTHROPIC CLAUDE VERIFICATION**
-

---

### API REF 44

PROACHING / EXCEEDED
- Last API Call: Timestamp + endpoint + response time
- Connection Health

**Anthropic Claude Telemetry:**
- Active Model (selected model ID)
- Budget Used (monthly)
- Budget Remaining
- Session Spend
-

---

### API REF 45

ken() - Module 6

**API Routes (auth.ts):**
- GET /api/auth/status
- GET /api/auth/login-url
- POST /api/auth/capture-token

**Environment Variables:**
- KITE_API_KEY
- KITE_API_SECRET
- MCI_TOKEN_STORAGE_PATH (~/.mc

---

### API REF 46

Routes (auth.ts):**
- GET /api/auth/status
- GET /api/auth/login-url
- POST /api/auth/capture-token

**Environment Variables:**
- KITE_API_KEY
- KITE_API_SECRET
- MCI_TOKEN_STORAGE_PATH (~/.mci/)

---

**Document 1

---

### API REF 47

/api/auth/status
- GET /api/auth/login-url
- POST /api/auth/capture-token

**Environment Variables:**
- KITE_API_KEY
- KITE_API_SECRET
- MCI_TOKEN_STORAGE_PATH (~/.mci/)

---

**Document 14 COMPLETE: END OF ADDENDUM 0

---

### API REF 48

fyToken() - Module 6

**API Routes (auth.ts):**
- GET /api/auth/status
- GET /api/auth/login-url
- POST /api/auth/capture-token

**Environment Variables:**
- KITE_API_KEY
- KITE_API_SECRET
- MCI_TOKEN_STORAGE_PATH (~/.mc

---

### API REF 49

*API Routes (auth.ts):**
- GET /api/auth/status
- GET /api/auth/login-url
- POST /api/auth/capture-token

**Environment Variables:**
- KITE_API_KEY
- KITE_API_SECRET
- MCI_TOKEN_STORAGE_PATH (~/.mci/)

---

**Document 14 CO

---

### API REF 50

GET /api/auth/status
- GET /api/auth/login-url
- POST /api/auth/capture-token

**Environment Variables:**
- KITE_API_KEY
- KITE_API_SECRET
- MCI_TOKEN_STORAGE_PATH (~/.mci/)

---

**Document 14 COMPLETE: END OF ADDENDUM 001**

---

### API REF 51

nternal components. API Layer with Health Router (/api/health/*), Ignition Router (/api/ignition/*). Continuing.

---

### API REF 52

h Health Router (/api/health/*), Ignition Router (/api/ignition/*). Continuing.

---

### API REF 53

m continued: API Layer routes - Telemetry Router (/api/telemetry/stream), Config Router (/api/config/*). Service Layer: PreIgnitionScanner (scanner.ts, runAllChecks(), validateCheck()), KiteTokenService (kite.ts, getToken

---

### API REF 54

ry Router (/api/telemetry/stream), Config Router (/api/config/*). Service Layer: PreIgnitionScanner (scanner.ts, runAllChecks(), validateCheck()), KiteTokenService (kite.ts, getTokenStatus(), getTimeToExpiry()),

---

### API REF 55

thropic API. Component Interfaces: Health Router (GET /live, /ready, /backend), Ignition Router (POST /start, /abort, GET /status), Telemetry Router (GET /stream SSE, /snapshot), Config Router (GET /models, PUT

---

### API REF 56

r (GET /live, /ready, /backend), Ignition Router (POST /start, /abort, GET /status), Telemetry Router (GET /stream SSE, /snapshot), Config Router (GET /models, PUT /model/select). Phase 0 Token Capture Flow start

---

### API REF 57

/backend), Ignition Router (POST /start, /abort, GET /status), Telemetry Router (GET /stream SSE, /snapshot), Config Router (GET /models, PUT /model/select). Phase 0 Token Capture Flow starting: 6-module architec

---

### API REF 58

T /start, /abort, GET /status), Telemetry Router (GET /stream SSE, /snapshot), Config Router (GET /models, PUT /model/select). Phase 0 Token Capture Flow starting: 6-module architecture, MANDATORY prerequisite b

---

### API REF 59

uter (GET /stream SSE, /snapshot), Config Router (GET /models, PUT /model/select). Phase 0 Token Capture Flow starting: 6-module architecture, MANDATORY prerequisite before Pre-Ignition Scanner. MCI Startup node

---

### API REF 60

ream SSE, /snapshot), Config Router (GET /models, PUT /model/select). Phase 0 Token Capture Flow starting: 6-module architecture, MANDATORY prerequisite before Pre-Ignition Scanner. MCI Startup node (localhost:8080). Co

---

### API REF 61

→ Module 4 Token Exchange (500ms-3s) → KITE API (POST /session/token) → Module 5 Token Storage (<50ms). Continuing.

---

### API REF 62

te for backend team requesting: Health Check (GET /api/health/scan), Ignition (POST /api/ignition/start), Shutdown (POST /api/shutdown/graceful), Status (GET /api/status) endpoints. Authentication query (JWT/API Key/

---

### API REF 63

alth Check (GET /api/health/scan), Ignition (POST /api/ignition/start), Shutdown (POST /api/shutdown/graceful), Status (GET /api/status) endpoints. Authentication query (JWT/API Key/OAuth), WebSocket events, rate limits

---

### API REF 64

nition (POST /api/ignition/start), Shutdown (POST /api/shutdown/graceful), Status (GET /api/status) endpoints. Authentication query (JWT/API Key/OAuth), WebSocket events, rate limits, error format. Schedule integration cal

---

### API REF 65

utdown (POST /api/shutdown/graceful), Status (GET /api/status) endpoints. Authentication query (JWT/API Key/OAuth), WebSocket events, rate limits, error format. Schedule integration call. Document to docs/cia-si

---

### API REF 66

mplate for backend team requesting: Health Check (GET /api/health/scan), Ignition (POST /api/ignition/start), Shutdown (POST /api/shutdown/graceful), Status (GET /api/status) endpoints. Authentication query (JWT/API Key/OA

---

### API REF 67

g: Health Check (GET /api/health/scan), Ignition (POST /api/ignition/start), Shutdown (POST /api/shutdown/graceful), Status (GET /api/status) endpoints. Authentication query (JWT/API Key/OAuth), WebSocket events, rate limits,

---

### API REF 68

), Ignition (POST /api/ignition/start), Shutdown (POST /api/shutdown/graceful), Status (GET /api/status) endpoints. Authentication query (JWT/API Key/OAuth), WebSocket events, rate limits, error format. Schedule integration call.

---

### API REF 69

, Shutdown (POST /api/shutdown/graceful), Status (GET /api/status) endpoints. Authentication query (JWT/API Key/OAuth), WebSocket events, rate limits, error format. Schedule integration call. Document to docs/cia-sie

---

### API REF 70

import CiaSieClient. Replace simulated checks in POST /all route with real ciaSieClient.runHealthScan(). Map CIA-SIE response to MCI format (checkId→id, passed→status, durationMs→duration). Overall status bas

---

### API REF 71

aSieClient. Replace simulated checks in POST /all route with real ciaSieClient.runHealthScan(). Map CIA-SIE response to MCI format (checkId→id, passed→status, durationMs→duration). Overall status based on critical checks. Error handling with Sentry.captureException. Add environment variables starting. Continuing.

---

### API REF 72

and .env.production. Test locally with curl POST /api/scan/all. Step 3.5 Integrate Ignition: Open ignition.ts, replace POST /start simulated ignition with real ciaSieClient.startIgnition(backend, strategy). Conti

---

### API REF 73

aging and .env.production. Test locally with curl POST /api/scan/all. Step 3.5 Integrate Ignition: Open ignition.ts, replace POST /start simulated ignition with real ciaSieClient.startIgnition(backend, strategy). Contin

---

### API REF 74

3.5 Integrate Ignition: Open ignition.ts, replace POST /start simulated ignition with real ciaSieClient.startIgnition(backend, strategy). Continuing.

---

### API REF 75

gested (lines 1498-1572). Ignition code complete: POST /start with backend (paper/live), strategy, returns status/sessionId/startedAt. Test with curl. Step 3.6 Integrate Shutdown: Open shutdown.ts, replace POST

---

### API REF 76

3.6 Integrate Shutdown: Open shutdown.ts, replace POST /full with real ciaSieClient.shutdownGraceful(closePositions, cancelOrders). Continuing.

---

### API REF 77

tch 22 ingested (lines 1573-1647). Shutdown code: POST /full with closePositions/cancelOrders (default true), returns status/completedSteps/shutdownAt. Test with curl. Step 3.7 Write Integration Tests: Claude C

---

### API REF 78

- **Token Capture Module:** Kite login workflow, POST /session/token to Kite API
- **4 Backends:** ICICI Direct, HDFC Sky, Kotak Neo, Zerodha Kite (NOT [Out-of-Scope-Broker])

**This document caused the implementation to go off-track

---

### API REF 79

Auth Failure Spike - 10 events/5 min threshold on /api/auth/validate
- Rule 5: Performance Degradation - p95 > 2000ms threshold
- Rule 6: Paper Trading Errors - lower priority, 5/hour rate limit
- Rule 7: Scanner Check

---

### API REF 80

hutdown Duration p95 (7d)
- Widget 6: Table - API Endpoint Latency (p50, p95, count)

---

### API REF 81

- `KITE_BASE_URL = 'https://api.kite.trade'`
  - Endpoint: `/user/profile` with `Authorization: token ${token}`
  - Exact TypeScript implementation provided
- **MOD-TC-5 Expiry Monitor**: 60s interval, 30min warning, 5min critical, auto-logout at expiry
- **MOD

---

### API REF 82

ASE_URL = 'https://api.kite.trade'`
  - Endpoint: `/user/profile` with `Authorization: token ${token}`
  - Exact TypeScript implementation provided
- **MOD-TC-5 Expiry Monitor**: 60s interval, 30min warning, 5min cr

---

### API REF 83

**BATCH 44 ✓** - **4 HONO SERVER ROUTES:**
| Route | Lines | Status |
|-------|-------|--------|
| auth.ts | 147 | CR-004, Kite API ✓ |
| ignition.ts | 196 | P2, 4 Indian brokers ✓ |
| shutdown.ts | 144 | CR-002, 6-step

---

### API REF 84

ines 5501-5550)**: Complete MCI API Contract:
```
/api/auth
├── POST /validate: { token } → { valid, expiresAt, error? }
├── GET /status → { isValid, expiresAt, timeRemaining }
└── POST /logout → { success }

---

### API REF 85

, timeRemaining }
└── POST /logout → { success }

/api/ignition
├── POST /start: { backend } → { success, sessionId, error? }
├── GET /status → { isRunning, sessionId, uptime }
└── GET /backends → { backends: Back

---

### API REF 86

me }
└── GET /backends → { backends: Backend[] }

/api/telemetry
├── GET /positions → { positions: Position[] }
├── GET /orders → { orders: Order[] }
├── GET /health → { cpu, memory, latency, errors }
└── GET /pnl

---

### API REF 87

}
└── GET /pnl → { realized, unrealized, total }

/api/shutdown
├── POST /graceful → { success, steps: Step[] }
├── POST /emergency → { success, timestamp }
└── GET /status → { currentStep, completed }
```

---

### API REF 88

)**: Complete MCI API Contract:
```
/api/auth
├── POST /validate: { token } → { valid, expiresAt, error? }
├── GET /status → { isValid, expiresAt, timeRemaining }
└── POST /logout → { success }

/api/ignition
├── PO

---

### API REF 89

ate: { token } → { valid, expiresAt, error? }
├── GET /status → { isValid, expiresAt, timeRemaining }
└── POST /logout → { success }

/api/ignition
├── POST /start: { backend } → { success, sessionId, error? }
├

---

### API REF 90

tatus → { isValid, expiresAt, timeRemaining }
└── POST /logout → { success }

/api/ignition
├── POST /start: { backend } → { success, sessionId, error? }
├── GET /status → { isRunning, sessionId, uptime }
└── GET

---

### API REF 91

└── POST /logout → { success }

/api/ignition
├── POST /start: { backend } → { success, sessionId, error? }
├── GET /status → { isRunning, sessionId, uptime }
└── GET /backends → { backends: Backend[] }

/api/tel

---

### API REF 92

{ backend } → { success, sessionId, error? }
├── GET /status → { isRunning, sessionId, uptime }
└── GET /backends → { backends: Backend[] }

/api/telemetry
├── GET /positions → { positions: Position[] }
├── GET

---

### API REF 93

ET /status → { isRunning, sessionId, uptime }
└── GET /backends → { backends: Backend[] }

/api/telemetry
├── GET /positions → { positions: Position[] }
├── GET /orders → { orders: Order[] }
├── GET /health → { cp

---

### API REF 94

nds → { backends: Backend[] }

/api/telemetry
├── GET /positions → { positions: Position[] }
├── GET /orders → { orders: Order[] }
├── GET /health → { cpu, memory, latency, errors }
└── GET /pnl → { realized, unrea

---

### API REF 95

── GET /positions → { positions: Position[] }
├── GET /orders → { orders: Order[] }
├── GET /health → { cpu, memory, latency, errors }
└── GET /pnl → { realized, unrealized, total }

/api/shutdown
├── POST /grac

---

### API REF 96

ion[] }
├── GET /orders → { orders: Order[] }
├── GET /health → { cpu, memory, latency, errors }
└── GET /pnl → { realized, unrealized, total }

/api/shutdown
├── POST /graceful → { success, steps: Step[] }
├──

---

### API REF 97

ET /health → { cpu, memory, latency, errors }
└── GET /pnl → { realized, unrealized, total }

/api/shutdown
├── POST /graceful → { success, steps: Step[] }
├── POST /emergency → { success, timestamp }
└── GET

---

### API REF 98

realized, unrealized, total }

/api/shutdown
├── POST /graceful → { success, steps: Step[] }
├── POST /emergency → { success, timestamp }
└── GET /status → { currentStep, completed }
```

---

### API REF 99

─ POST /graceful → { success, steps: Step[] }
├── POST /emergency → { success, timestamp }
└── GET /status → { currentStep, completed }
```

---

### API REF 100

├── POST /emergency → { success, timestamp }
└── GET /status → { currentStep, completed }
```

---

### API REF 101

disabled
```

---

## LAYER 6: API CONTRACT

```
/api/auth
├── POST /validate    → { valid, expiresAt, error? }
├── GET  /status      → { isValid, expiresAt, timeRemaining }
└── POST /logout      → { success

---

### API REF 102

eRemaining }
└── POST /logout      → { success }

/api/ignition
├── POST /start       → { success, sessionId, error? }
├── GET  /status      → { isRunning, sessionId, uptime }
└── GET  /backends    → { backends: B

---

### API REF 103

└── GET  /backends    → { backends: Backend[] }

/api/telemetry
├── GET /positions    → { positions: Position[] }
├── GET /orders       → { orders: Order[] }
├── GET /health       → { cpu, memory, latency, errors

---

### API REF 104

/pnl          → { realized, unrealized, total }

/api/shutdown
├── POST /graceful    → { success, steps: Step[] }
├── POST /emergency   → { success, timestamp }
└── GET  /status      → { currentStep, completed }

---

### API REF 105

---

## LAYER 6: API CONTRACT

```
/api/auth
├── POST /validate    → { valid, expiresAt, error? }
├── GET  /status      → { isValid, expiresAt, timeRemaining }
└── POST /logout      → { success }

/api/ignition
├─

---

### API REF 106

T /validate    → { valid, expiresAt, error? }
├── GET  /status      → { isValid, expiresAt, timeRemaining }
└── POST /logout      → { success }

/api/ignition
├── POST /start       → { success, sessionId, error?

---

### API REF 107

→ { isValid, expiresAt, timeRemaining }
└── POST /logout      → { success }

/api/ignition
├── POST /start       → { success, sessionId, error? }
├── GET  /status      → { isRunning, sessionId, uptime }
└──

---

### API REF 108

OST /logout      → { success }

/api/ignition
├── POST /start       → { success, sessionId, error? }
├── GET  /status      → { isRunning, sessionId, uptime }
└── GET  /backends    → { backends: Backend[] }

/api

---

### API REF 109

/start       → { success, sessionId, error? }
├── GET  /status      → { isRunning, sessionId, uptime }
└── GET  /backends    → { backends: Backend[] }

/api/telemetry
├── GET /positions    → { positions: Position

---

### API REF 110

tatus      → { isRunning, sessionId, uptime }
└── GET  /backends    → { backends: Backend[] }

/api/telemetry
├── GET /positions    → { positions: Position[] }
├── GET /orders       → { orders: Order[] }
├── GET /h

---

### API REF 111

→ { backends: Backend[] }

/api/telemetry
├── GET /positions    → { positions: Position[] }
├── GET /orders       → { orders: Order[] }
├── GET /health       → { cpu, memory, latency, errors }
└── GET /pnl

---

### API REF 112

GET /positions    → { positions: Position[] }
├── GET /orders       → { orders: Order[] }
├── GET /health       → { cpu, memory, latency, errors }
└── GET /pnl          → { realized, unrealized, total }

/api/sh

---

### API REF 113

}
├── GET /orders       → { orders: Order[] }
├── GET /health       → { cpu, memory, latency, errors }
└── GET /pnl          → { realized, unrealized, total }

/api/shutdown
├── POST /graceful    → { success, st

---

### API REF 114

alth       → { cpu, memory, latency, errors }
└── GET /pnl          → { realized, unrealized, total }

/api/shutdown
├── POST /graceful    → { success, steps: Step[] }
├── POST /emergency   → { success, times

---

### API REF 115

realized, unrealized, total }

/api/shutdown
├── POST /graceful    → { success, steps: Step[] }
├── POST /emergency   → { success, timestamp }
└── GET  /status      → { currentStep, completed }
```

---

## LAYER

---

### API REF 116

OST /graceful    → { success, steps: Step[] }
├── POST /emergency   → { success, timestamp }
└── GET  /status      → { currentStep, completed }
```

---

## LAYER 7: WEBSOCKET EVENTS

**Server → Client:**
```
teleme

---

### API REF 117

── POST /emergency   → { success, timestamp }
└── GET  /status      → { currentStep, completed }
```

---

## LAYER 7: WEBSOCKET EVENTS

**Server → Client:**
```
telemetry:positions  │ 1000ms │ { positions[], tim

---

### API REF 118

--|----------|------|
| ICICI Direct | `icici` | `/api/backend/icici` | 🏦 |
| HDFC Sky | `hdfc` | `/api/backend/hdfc` | 🏛️ |
| Kotak Neo | `kotak` | `/api/backend/kotak` | 🏢 |
| Zerodha Kite | `zerodha` | `/api/backend

---

### API REF 119

`/api/backend/icici` | 🏦 |
| HDFC Sky | `hdfc` | `/api/backend/hdfc` | 🏛️ |
| Kotak Neo | `kotak` | `/api/backend/kotak` | 🏢 |
| Zerodha Kite | `zerodha` | `/api/backend/zerodha` | 🪁 |

---

Now continuing with UXMI c

---

### API REF 120

api/backend/hdfc` | 🏛️ |
| Kotak Neo | `kotak` | `/api/backend/kotak` | 🏢 |
| Zerodha Kite | `zerodha` | `/api/backend/zerodha` | 🪁 |

---

Now continuing with UXMI components...

---

### API REF 121

ackend/kotak` | 🏢 |
| Zerodha Kite | `zerodha` | `/api/backend/zerodha` | 🪁 |

---

Now continuing with UXMI components...

---

### API REF 122

NDIAN BROKERS (P2 REMEDIATION)

| Broker | Type | Endpoint | Icon |
|--------|------|----------|------|
| ICICI Direct | `icici` | `/api/backend/icici` | 🏦 |
| HDFC Sky | `hdfc` | `/api/backend/hdfc` | 🏛️ |
| Kotak Ne

---

### API REF 123

---|----------|------|
| ICICI Direct | `icici` | `/api/backend/icici` | 🏦 |
| HDFC Sky | `hdfc` | `/api/backend/hdfc` | 🏛️ |
| Kotak Neo | `kotak` | `/api/backend/kotak` | 🏢 |
| Zerodha Kite | `zerodha` | `/api/backend/

---

### API REF 124

/api/backend/hdfc` | 🏛️ |
| Kotak Neo | `kotak` | `/api/backend/kotak` | 🏢 |
| Zerodha Kite | `zerodha` | `/api/backend/zerodha` | 🪁 |

---

Now continuing with UXMI components...

---

### API REF 125

backend/kotak` | 🏢 |
| Zerodha Kite | `zerodha` | `/api/backend/zerodha` | 🪁 |

---

Now continuing with UXMI components...

---

### API REF 126

───┘
```

### KiteService API Methods

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `getProfile()` | `/user/profile` | User account info |
| `getQuotes()` | `/quote` | Instrument quotes (NSE/BSE) |
|

---

### API REF 127

--------|----------|---------|
| `getProfile()` | `/user/profile` | User account info |
| `getQuotes()` | `/quote` | Instrument quotes (NSE/BSE) |
| `getLTP()` | `/quote/ltp` | Last traded prices |
| `placeOrder()`

---

### API REF 128

/profile` | User account info |
| `getQuotes()` | `/quote` | Instrument quotes (NSE/BSE) |
| `getLTP()` | `/quote/ltp` | Last traded prices |
| `placeOrder()` | `/orders/regular` | Place buy/sell order |
| `g

---

### API REF 129

e` | Instrument quotes (NSE/BSE) |
| `getLTP()` | `/quote/ltp` | Last traded prices |
| `placeOrder()` | `/orders/regular` | Place buy/sell order |
| `getOrders()` | `/orders` | Day's orders |
| `getPositions()`

---

### API REF 130

te/ltp` | Last traded prices |
| `placeOrder()` | `/orders/regular` | Place buy/sell order |
| `getOrders()` | `/orders` | Day's orders |
| `getPositions()` | `/portfolio/positions` | Open positions |
| `getHoldings()

---

### API REF 131

gular` | Place buy/sell order |
| `getOrders()` | `/orders` | Day's orders |
| `getPositions()` | `/portfolio/positions` | Open positions |
| `getHoldings()` | `/portfolio/holdings` | Long-term portfolio |
| `

---

### API REF 132

| `/orders` | Day's orders |
| `getPositions()` | `/portfolio/positions` | Open positions |
| `getHoldings()` | `/portfolio/holdings` | Long-term portfolio |
| `getMargins()` | `/user/margins` | Funds available |
| `cancel

---

### API REF 133

positions` | Open positions |
| `getHoldings()` | `/portfolio/holdings` | Long-term portfolio |
| `getMargins()` | `/user/margins` | Funds available |
| `cancelOrder()` | `/orders/regular/{id}` | Cancel order |

Continuin

---

### API REF 134

dings` | Long-term portfolio |
| `getMargins()` | `/user/margins` | Funds available |
| `cancelOrder()` | `/orders/regular/{id}` | Cancel order |

Continuing with server routes...

---

### API REF 135

│    │
│  │  Health: GET /api/health                                            │    │
│  │  SIGTERM: Graceful shutdown with Sentry flush                       │    │
│  └───────────────

---

### API REF 136

stepId │  │ /positions│      │
│  │ GET      │  │ POST /all│  │ /abort   │  │ POST     │  │ /orders   │      │
│  │ /session │  │          │  │ /status  │  │ /full    │  │ /account  │      │
│  │          │  │

---

### API REF 137

───────────────────────┘
```

### NOTE: Telemetry Route Uses US Symbols

**SURGICAL CORRECTION NEEDED** (as identified in previous session):

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `telemetry.ts` |

---

### API REF 138

on (P95) | Line Chart | CR-002 monitoring |
| API Endpoint Performance | Table | Endpoint stats |
| Recent Error Sessions | Table | With Replay |
| Errors by Action Type | Bar Chart | Action analysis |
| Errors by Environment | Bar Chart | Env bre

---

### API REF 139

bundled - unreadable |
| | Already have source in `/src` |
| | Rebuilds on every `npm run build` |

```
┌─────────────────────────────────────────────────────────────────────────┐
│  STATUS: SKIP

---

### API REF 140

AL_SOVEREIGN/` — domain-agnostic, craft-owned
  - `/ESCALATED/` — requires manual review
- **PROHIBITION**: Do NOT touch/modify/write/merge ANY existing folder
- **Declaration I (DOMAIN-INTRINSIC)**: Project-sover

---

### API REF 141

he name for the NEW folder** to be created within `/Users/nevillemehta/DOWNLOADS/`
   
   Examples:
   - `SESSION_EXPORT_2026-01-25`
   - `MCI_TERMINAL_EXTRACTION`
   - `CLASSIFIED_OUTPUT`
   - Or a name of your choosing

2. **Expli

---

### API REF 142

**✅ Destination parent path verified:** `/Users/nevillemehta/Downloads/` exists

---

## Phase 0.2: Access Source Data

Per protocol, the SOURCE is this terminal's backend JSON/conversation history. Accessing the session t

---
