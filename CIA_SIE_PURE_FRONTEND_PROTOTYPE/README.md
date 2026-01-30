# CIA-SIE-PURE FRONTEND PROTOTYPE

**Authority:** PAD-FX1 — FRONTEND FORENSIC RECONSTITUTION, RETROFIT & CERTIFICATION DIRECTIVE
**Classification:** TRUTH-DEMONSTRATIVE · OPERATOR-CENTRIC · DECISION-SUPPORT ONLY
**Execution Date:** 2026-01-29

---

## CLASSIFICATION

This prototype is:
- ✅ **TRUTH-DEMONSTRATIVE** — Shows real system state without distortion
- ✅ **OPERATOR-CENTRIC** — Designed for human judgment, not automation
- ✅ **DECISION-SUPPORT ONLY** — Informs, never decides

---

## CONSTITUTIONAL COMPLIANCE

| Requirement | Compliance | Verification |
|-------------|------------|--------------|
| CR-001: Token Validity | ✅ ENFORCED | Token must be valid before any operation |
| CR-002: Graceful Shutdown | ✅ ENFORCED | 6-step shutdown sequence with progress |
| CR-003: Error Format | ✅ ENFORCED | All errors use WHAT/WHY/HOW format |
| CR-004: Token Expiry | ✅ ENFORCED | Countdown to 6:00 AM IST |
| CR-005: UXMI 7-States | ✅ ENFORCED | All components implement 7 states |

---

## WHAT THIS PROTOTYPE SHOWS

| Display | Purpose | Constitutional Basis |
|---------|---------|---------------------|
| **Token Status** | Time remaining until 6:00 AM IST expiry | CR-004 |
| **System Health** | Backend connectivity, API status | PP-001 (inform) |
| **Scan Results** | 12 pre-ignition checks with pass/fail | PP-002 (expose) |
| **Ignition Controls** | Start/Stop with confirmation | CR-002 |
| **Error States** | WHAT happened, WHY, HOW to fix | CR-003 |

---

## WHAT THIS PROTOTYPE MUST NOT IMPLY

| Prohibited Implication | Reason | Constitutional Basis |
|------------------------|--------|---------------------|
| Trading recommendations | System is decision-support, not decision-making | PP-001 |
| Market predictions | Descriptive only, not prescriptive | PP-003 |
| Resolved contradictions | Contradictions must be exposed, not hidden | PP-002 |
| Automated decision confidence | No scores, probabilities, or percentages that imply certainty | PP-001 |

---

## SIMULATION vs REALITY MARKING

### MANDATORY SIMULATION BADGE

When running without connection to live CIA-SIE-PURE engine:

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ SIMULATED DATA                                      │
│  This prototype is NOT connected to live trading engine │
│  All displayed data is for demonstration purposes only  │
└─────────────────────────────────────────────────────────┘
```

### LIVE CONNECTION INDICATOR

When connected to actual engine:

```
┌─────────────────────────────────────────────────────────┐
│  🟢 LIVE                                                │
│  Connected to CIA-SIE-PURE Engine                       │
│  Data reflects real system state                        │
└─────────────────────────────────────────────────────────┘
```

---

## PROTOTYPE TYPE

- ☑️ **STANDALONE** — Can run independently for demonstration
- ☐ EMBEDDED — Not embedded in another system
- ☑️ **READ-ONLY** — No write operations to trading systems

---

## BUILD INSTRUCTIONS

### Prerequisites
- Node.js 18+ or Bun runtime
- npm or bun package manager

### Installation
```bash
cd /Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/12_APPLICATION_CODE
npm install  # or: bun install
```

### Development
```bash
npm run dev  # or: bun run dev
```

### Production Build
```bash
npm run build  # or: bun run build
```

---

## DIRECTORY STRUCTURE

```
12_APPLICATION_CODE/
├── src/
│   ├── client/
│   │   ├── App.tsx                    # Main application
│   │   ├── components/
│   │   │   ├── uxmi/                  # 7 UXMI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── ErrorDisplay.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   └── Tooltip.tsx
│   │   │   ├── phase0/               # Token Capture
│   │   │   ├── phase1/               # Pre-Ignition Scanner
│   │   │   ├── phase2/               # Ignition Controls
│   │   │   ├── phase3/               # Telemetry Dashboard
│   │   │   └── phase4/               # Shutdown Panel
│   │   └── stores/                   # Zustand state
│   └── server/
│       ├── routes/                   # API endpoints
│       └── services/                 # Backend services
├── package.json
├── vite.config.ts
└── vitest.config.ts
```

---

## MANDATORY DISCLAIMER (CONSTITUTIONAL REQUIREMENT)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚖️ CONSTITUTIONAL DISCLAIMER                                       │
│                                                                     │
│  This interface is for DECISION-SUPPORT only.                      │
│  It does NOT make trading decisions.                                │
│  It does NOT recommend actions.                                     │
│  It does NOT predict market movements.                              │
│                                                                     │
│  All trading decisions are the sole responsibility of the          │
│  human operator. The system displays information; you decide.       │
│                                                                     │
│  [CR-001] [CR-002] [CR-003] [CR-004] [CR-005] [PP-001] [PP-002] [PP-003] │
└─────────────────────────────────────────────────────────────────────┘
```

---

## VERIFICATION CHECKLIST

Before any demonstration:

- [ ] Simulation badge displayed if not connected to live engine
- [ ] Token timer shows accurate countdown to 6:00 AM IST
- [ ] All errors use WHAT/WHY/HOW format
- [ ] No recommendation language visible anywhere
- [ ] Contradictions are displayed, not resolved
- [ ] All interactive elements have 7 states
- [ ] Tooltips appear after 300ms delay
- [ ] Constitutional disclaimer is visible

---

## ATTESTATION

This prototype is authorized for:
- ✅ Human inspection
- ✅ Trust calibration
- ✅ Truth visibility testing
- ✅ Operator validation exercises

This prototype is NOT authorized for:
- ❌ Live trading
- ❌ Production deployment without full certification
- ❌ Automated decision-making integration

**Signed:** Claude Opus 4.5
**Date:** 2026-01-29
**Authority:** PAD-FX1 SUPREME EXECUTION AUTHORIZATION

---

*This document fulfills PAD-FX1 Section 5 requirements.*
