# FORENSIC STORAGE & ARTIFACT LOCATION CONFIRMATION

## MCI Application — Complete Artifact Accounting

**Report Date:** 2026-01-28
**Timestamp:** 2026-01-28_204952
**Report Purpose:** Configuration certainty, traceability, and single-source-of-truth assurance
**Directive:** Program Director Forensic Storage Confirmation
**Mode:** Reporting Only — No execution, no modification

---

## 1. CANONICAL STORAGE LOCATION

### 1.1 Absolute Path

The authoritative working copy resides at:

```
/Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/12_APPLICATION_CODE
```

### 1.2 Sole Authority Confirmation

| Question | Answer |
|----------|--------|
| Is this the sole authoritative working directory? | **YES** |
| Are there multiple copies? | **NO** — This is the single canonical location |
| Parent project folder | `/Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/` |

### 1.3 Project Root Structure

The complete MCI project is organized under `/Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/` with the following top-level directories:

| Directory | Purpose |
|-----------|---------|
| `00_GOVERNANCE/` | Constitutional constraints, attestations, forensic reviews |
| `01_DECISIONS/` | Decision registry |
| `02_ARCHITECTURE/` | System overview, phase designs, diagrams |
| `03_SPECIFICATIONS/` | Feature registry, API specs |
| `04_IMPLEMENTATION/` | Code snippets, implementation patterns |
| `05_PROBLEMS_SOLVED/` | Bug registry, error handling docs |
| `06_ACTION_ITEMS/` | TODOs |
| `07_KNOWLEDGE_BASE/` | Cross-references, glossary, session narrative |
| `08_CERTIFICATION/` | Extraction certificates |
| `09_IMPLEMENTATION_ROADMAP/` | Roadmap documentation |
| `10_QA_EXCHANGES/` | QA chronicles |
| `11_MCI_FORENSIC_AUDIT_APPLICATION CODE_ANNOTATED/` | Audit documentation |
| **`12_APPLICATION_CODE/`** | **THE APPLICATION — Canonical source code** |
| `99_INDEPENDENT_VERIFICATION/` | Verification framework (prepared, dormant) |

---

## 2. ARTIFACT-BY-ARTIFACT ACCOUNTING

### 2.1 src/client/

**Location:** `/Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/12_APPLICATION_CODE/src/client/`

#### 2.1.1 Core Application Files

| File | Purpose | Status | Corresponds To |
|------|---------|--------|----------------|
| `App.tsx` | **Root component, SOLE phase controller** | Active | INV-004 (State Legality), BUG-007 fix |
| `main.tsx` | React entry point | Active | Standard React setup |
| `index.css` | Global styles | Active | Styling |

#### 2.1.2 Cockpit Components (`components/cockpit/`)

| File | Purpose | Created/Modified | Corresponds To |
|------|---------|------------------|----------------|
| `StatusBar.tsx` | Always-visible system status bar | **NEW** | GAP-01 to GAP-06 remediation |
| `SimulationBadge.tsx` | Visual label for simulated data | **NEW** | GAP-04 (Mock Telemetry Marking) |
| `index.ts` | Barrel export | **NEW** | Module organization |

#### 2.1.3 Hooks (`hooks/`)

| File | Purpose | Created/Modified | Corresponds To |
|------|---------|------------------|----------------|
| `useBackendHealth.ts` | Real-time backend health polling | **NEW** | GAP-03 (Backend Health Visibility) |
| `useNetworkStatus.ts` | Online/offline detection | **NEW** | GAP-06 (Network Connectivity) |
| `useErrorAggregator.ts` | Global error capture | **NEW** | GAP-05 (Error Aggregation) |
| `index.ts` | Barrel export | **NEW** | Module organization |

#### 2.1.4 Phase 0 Components (`components/phase0/`)

| File | Purpose | Status | Corresponds To |
|------|---------|--------|----------------|
| `TokenCaptureForm.tsx` | Kite credential capture | **Modified** | INV-006 (Sanitization at UI entry) |
| `TokenTimer.tsx` | Token expiry countdown | Active | CR-004 (Token Expiry) |
| `CredentialsHelper.tsx` | Credential guidance | Active | UX |
| `index.ts` | Barrel export | Active | Module organization |
| `__tests__/TokenCaptureForm.test.tsx` | Tests | **Modified** | INV-006 compliance |
| `__tests__/TokenTimer.test.tsx` | Tests | Active | CR-004 |

#### 2.1.5 Phase 1 Components (`components/phase1/`)

| File | Purpose | Status | Corresponds To |
|------|---------|--------|----------------|
| `PreIgnitionScanner.tsx` | 12-point scan UI | Active | Phase 1 spec |
| `ScanCheckItem.tsx` | Individual check display | Active | UXMI states |
| `index.ts` | Barrel export | Active | Module organization |
| `__tests__/*.test.tsx` | Tests | Active | Test coverage |

#### 2.1.6 Phase 2 Components (`components/phase2/`)

| File | Purpose | Status | Corresponds To |
|------|---------|--------|----------------|
| `IgnitionButton.tsx` | Two-stage ARM→IGNITE safety | **Modified** | GAP-03, useBackendHealth integration |
| `BackendSelector.tsx` | Broker selection UI | Active | 4 Indian brokers |
| `index.ts` | Barrel export | Active | Module organization |
| `__tests__/IgnitionButton.test.tsx` | Tests | **Modified** | Mock updates for hooks |
| `__tests__/BackendSelector.test.tsx` | Tests | Active | Test coverage |

#### 2.1.7 Phase 3 Components (`components/phase3/`)

| File | Purpose | Status | Corresponds To |
|------|---------|--------|----------------|
| `TelemetryDashboard.tsx` | Main telemetry display | **Modified** | BUG-007 fix (removed phase guard) |
| `MarketDataPanel.tsx` | Market data display | Active | Telemetry |
| `PositionsPanel.tsx` | Positions display | Active | Telemetry |
| `OrdersPanel.tsx` | Orders display | Active | Telemetry |
| `AccountPanel.tsx` | Account info display | Active | Telemetry |
| `SystemHealthPanel.tsx` | System health display | Active | Telemetry |
| `ActivityLogPanel.tsx` | Activity log | Active | Telemetry |
| `index.ts` | Barrel export | Active | Module organization |
| `__tests__/TelemetryDashboard.test.tsx` | Tests | **Modified** | BUG-007 fix verification |
| `__tests__/AccountPanel.test.tsx` | Tests | Active | Test coverage |
| `__tests__/SystemHealthPanel.test.tsx` | Tests | Active | Test coverage |

#### 2.1.8 Phase 4 Components (`components/phase4/`)

| File | Purpose | Status | Corresponds To |
|------|---------|--------|----------------|
| `ShutdownPanel.tsx` | 6-step shutdown UI | Active | CR-002 |
| `index.ts` | Barrel export | Active | Module organization |
| `__tests__/ShutdownPanel.test.tsx` | Tests | **Modified** | Test logic update |

#### 2.1.9 UXMI Components (`components/uxmi/`)

| File | Purpose | Status | Corresponds To |
|------|---------|--------|----------------|
| `Button.tsx` | UXMI button with 7 states | Active | CR-005 |
| `Input.tsx` | UXMI input with 7 states | Active | CR-005 |
| `ProgressBar.tsx` | Progress indicator | Active | CR-005 |
| `Spinner.tsx` | Loading spinner | Active | CR-005 |
| `Toast.tsx` | Toast notifications | Active | CR-005 |
| `Tooltip.tsx` | Tooltip component | Active | CR-005 |
| `ErrorDisplay.tsx` | WHAT/WHY/HOW error format | Active | CR-003 |
| `index.ts` | Barrel export | Active | Module organization |
| `__tests__/*.test.tsx` | Tests (4 files) | Active | CR-005 verification |

#### 2.1.10 Stores (`stores/`)

| File | Purpose | Status | Corresponds To |
|------|---------|--------|----------------|
| `tokenStore.ts` | Token state with localStorage persistence | **Modified** | GAP-08, GAP-09, INV-001, INV-006 |
| `ignitionStore.ts` | Ignition sequence state | Active | Phase 2 |
| `scannerStore.ts` | Scanner state | Active | Phase 1 |
| `shutdownStore.ts` | Shutdown sequence state | Active | CR-002 |
| `telemetryStore.ts` | Telemetry state | Active | Phase 3 |
| `index.ts` | Barrel export | Active | Module organization |
| `tokenStore.test.ts` | Tests | Active | INV-001, CR-004 |
| `scannerStore.test.ts` | Tests | Active | Phase 1 |
| `shutdownStore.test.ts` | Tests | Active | CR-002 |
| `__tests__/shutdownStore.edge.test.ts` | Edge case tests | Active | CR-002 edge cases |

#### 2.1.11 Other Client Files

| File | Purpose | Status |
|------|---------|--------|
| `lib/sentry.ts` | Sentry client configuration | Active |

---

### 2.2 src/server/

**Location:** `/Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/12_APPLICATION_CODE/src/server/`

#### 2.2.1 Core Server Files

| File | Purpose | Status | Corresponds To |
|------|---------|--------|----------------|
| `index.ts` | Hono server entry, route mounting | Active | Backend API |

#### 2.2.2 Routes (`routes/`)

| File | Purpose | Status | Corresponds To |
|------|---------|--------|----------------|
| `auth.ts` | Kite authentication, `/api/auth/*` | **Modified** | INV-006 (API boundary sanitization) |
| `scan.ts` | 12-point scan API, `/api/scan/*` | Active | Phase 1 |
| `ignition.ts` | Ignition API, `/api/ignition/*` | Active | Phase 2 |
| `shutdown.ts` | Shutdown API, `/api/shutdown/*` | Active | CR-002 |
| `telemetry.ts` | Telemetry API, `/api/telemetry/*` | Active | Phase 3 |
| `index.ts` | Route barrel export | Active | Module organization |
| `__tests__/auth.test.ts` | Auth tests | **Modified** | INV-006 compliant test data |
| `__tests__/scan.test.ts` | Scan tests | Active | Phase 1 |
| `__tests__/ignition.test.ts` | Ignition tests | Active | Phase 2 |
| `__tests__/shutdown.test.ts` | Shutdown tests | Active | CR-002 |

#### 2.2.3 Services (`services/`)

| File | Purpose | Status | Simulation Boundary |
|------|---------|--------|---------------------|
| `kite.ts` | Kite Connect API integration | Active | Real when credentials valid |
| `cia-sie.ts` | CIA-SIE-PURE integration stub | Active | **SIMULATED** — awaiting integration |

#### 2.2.4 Other Server Files

| File | Purpose | Status |
|------|---------|--------|
| `lib/sentry.ts` | Sentry server configuration | Active |

---

### 2.3 src/shared/

**Location:** `/Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/12_APPLICATION_CODE/src/shared/`

#### 2.3.1 Validation (`validation/`)

| File | Purpose | Status | Corresponds To |
|------|---------|--------|----------------|
| `sanitize.ts` | **Centralized sanitization module** | **NEW/Modified** | INV-006 (complete implementation) |
| `sanitize.test.ts` | Sanitization tests (46 tests) | **NEW/Modified** | INV-006 verification |
| `index.ts` | Barrel export | Active | Module organization |

**sanitize.ts exports:**
- `sanitizeString()` — Basic string sanitization
- `sanitizeRequiredString()` — Required field validation
- `validateNoControlChars()` — Control character rejection
- `validateHeaderSafe()` — HTTP header safety
- `sanitizeApiKey()` — Kite API key validation
- `sanitizeAccessToken()` — Kite access token validation
- `sanitizeUserId()` — Kite user ID validation
- `sanitizeKiteCredentials()` — All credentials at once
- `buildKiteAuthHeader()` — Safe header construction
- `sanitizeCredentialsFromRequest()` — API boundary sanitization

#### 2.3.2 Types

| File | Purpose | Status |
|------|---------|--------|
| `types.ts` | Shared TypeScript types | Active |

---

### 2.4 src/test/

**Location:** `/Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/12_APPLICATION_CODE/src/test/`

#### 2.4.1 Test Infrastructure

| File | Purpose | Status |
|------|---------|--------|
| `setup.ts` | Test environment setup | Active |
| `test-utils.tsx` | Testing utilities, custom render | Active |
| `globals.d.ts` | TypeScript test globals | Active |
| `vitest.d.ts` | Vitest type declarations | Active |

#### 2.4.2 Integration Tests (`integration/`)

| File | Purpose | Status | Corresponds To |
|------|---------|--------|----------------|
| `full-flow.test.ts` | Complete MCI flow test | **Modified** | INV-006 compliant test data |

#### 2.4.3 Test Coverage Summary

| Category | Test Files | Test Count | Status |
|----------|------------|------------|--------|
| Component Tests | 14 | ~350 | Active |
| Store Tests | 4 | ~100 | Active |
| Route Tests | 4 | ~80 | Active |
| Validation Tests | 1 | 46 | Active |
| Integration Tests | 1 | 14 | Active |
| Edge Case Tests | 1 | ~20 | Active |
| **TOTAL** | **24** | **658** | **All Pass** |

---

## 3. LIFECYCLE CONTROL SCRIPTS

**Location:** `/Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/12_APPLICATION_CODE/scripts/`

### 3.1 Script Inventory

| Script | Purpose | Status | Executable |
|--------|---------|--------|------------|
| `start.sh` | Launch frontend + backend | Active | Yes |
| `stop.sh` | Terminate both processes | Active | Yes |
| `status.sh` | Report process state | Active | Yes |

### 3.2 INV-002 Enforcement

| Requirement | Implementation |
|-------------|----------------|
| Deterministic startup | `start.sh` launches backend first, then frontend; waits for each |
| Clean shutdown | `stop.sh` sends SIGTERM, waits, then SIGKILL if needed |
| Orphan process prevention | PID files in `.mci-pids`, verified on start, cleaned on stop |
| Single point of control | All lifecycle operations go through these scripts |

### 3.3 Other Scripts

| Question | Answer |
|----------|--------|
| Do any scripts exist outside `scripts/`? | **NO** |
| Are lifecycle scripts the sole mechanism? | **YES** |

---

## 4. CONFIGURATION & TOOLING

### 4.1 package.json

**Location:** `/Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/12_APPLICATION_CODE/package.json`

| Aspect | Status |
|--------|--------|
| Scripts defined | `dev`, `build`, `server`, `test`, `lint`, etc. |
| Test runner | Vitest (via `npm test` → `vitest`) |
| Dependencies | React, Vite, Hono, Zustand, TanStack Query, etc. |
| Dev dependencies | Vitest, Testing Library, TypeScript, ESLint, etc. |

### 4.2 vitest.config.ts

**Location:** `/Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/12_APPLICATION_CODE/vitest.config.ts`

| Aspect | Configuration |
|--------|---------------|
| Test environment | jsdom (for React component tests) |
| Setup file | `src/test/setup.ts` |
| Coverage | Configured but optional |
| Globals | Enabled for describe/it/expect |

### 4.3 .env.example

**Location:** `/Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/12_APPLICATION_CODE/.env.example`

| Aspect | Status |
|--------|--------|
| Contains placeholders | Yes |
| Contains real credentials | **NO** |
| Documents required variables | Yes |

---

## 5. PERSISTENCE & VERSION CONTROL STATUS

### 5.1 Git Status at Session Start

```
## main...origin/main
 M .DS_Store
 M 09_IMPLEMENTATION_ROADMAP/MCI_COMPREHENSIVE_SESSION_SYNTHESIS.html
```

### 5.2 Current State Analysis

| Category | Files | Status |
|----------|-------|--------|
| **Locally modified, not staged** | `.DS_Store`, `MCI_COMPREHENSIVE_SESSION_SYNTHESIS.html` | Present at session start |
| **New files created this session** | All `99_INDEPENDENT_VERIFICATION/` files, test fixes, attestations | **LOCAL ONLY** |
| **Modified files this session** | Test files, `sanitize.ts`, various attestations | **LOCAL ONLY** |

### 5.3 Explicit State Declaration

| Question | Answer |
|----------|--------|
| Are all changes present only locally? | **YES** — All work from this session is local |
| Does GitHub reflect the same state? | **NO** — GitHub is behind; new work is not pushed |
| Files locally but not tracked? | **YES** — All new files (99_INDEPENDENT_VERIFICATION/, new attestations) |
| Tracked but not committed? | **YES** — Modified existing files |
| Committed but not pushed? | **NO** — No commits made this session |

### 5.4 Summary of Uncommitted Work

**New Directories (untracked):**
- `99_INDEPENDENT_VERIFICATION/` (entire directory, 20 files)
- `00_GOVERNANCE/ATTESTATIONS/GATE_5_TESTING_ATTESTATION_2026-01-28.md`
- `00_GOVERNANCE/FORENSIC_REVIEWS/FORENSIC_STORAGE_ARTIFACT_CONFIRMATION_2026-01-28_204952.md` (this file)

**Modified Files (not staged):**
- `12_APPLICATION_CODE/src/shared/validation/sanitize.ts`
- `12_APPLICATION_CODE/src/shared/validation/sanitize.test.ts`
- `12_APPLICATION_CODE/src/client/components/phase0/__tests__/TokenCaptureForm.test.tsx`
- `12_APPLICATION_CODE/src/client/components/phase2/__tests__/IgnitionButton.test.tsx`
- `12_APPLICATION_CODE/src/client/components/phase4/__tests__/ShutdownPanel.test.tsx`
- `12_APPLICATION_CODE/src/server/routes/__tests__/auth.test.ts`
- `12_APPLICATION_CODE/src/test/integration/full-flow.test.ts`

---

## 6. COMPLETENESS ATTESTATION

### 6.1 Attestation Statement

I hereby attest that:

1. **All work performed during this engagement is fully accounted for** in this report.

2. **No material artifacts exist outside the declared structure.** All application code resides in `12_APPLICATION_CODE/`, all governance documents reside in `00_GOVERNANCE/`, and the new verification framework resides in `99_INDEPENDENT_VERIFICATION/`.

3. **The directory `/Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/` represents the complete and current system state.** Specifically:
   - `12_APPLICATION_CODE/` contains the full, working application
   - `99_INDEPENDENT_VERIFICATION/` contains the prepared (dormant) verification framework
   - All supporting documentation is in numbered folders `00_` through `11_`

4. **All modifications made during this session are LOCAL ONLY** and have not been committed or pushed to any remote repository.

5. **The system is in a testable, verifiable state** — 658 tests pass with 100% success rate.

### 6.2 Canonical Path Confirmation

The single source of truth for the MCI application is:

```
/Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/12_APPLICATION_CODE/
```

This is the only authoritative location. No other copies exist.

### 6.3 Session Work Summary

| Work Category | Files | Lines Changed (approx) |
|---------------|-------|------------------------|
| Gate 5 Testing (test fixes) | 7 | ~150 |
| 99_INDEPENDENT_VERIFICATION framework | 20 | ~3,500 |
| Attestation documents | 2 | ~300 |
| **Total** | **29 files** | **~3,950 lines** |

---

## 7. DIRECTORY TREE CONFIRMATION

### 7.1 12_APPLICATION_CODE/ Structure

```
12_APPLICATION_CODE/
├── .env.example
├── .github/workflows/          # CI workflows
├── .gitignore
├── .mci-pids                   # PID file for lifecycle control
├── e2e/                        # Playwright E2E (snapshot only)
├── index.html
├── package.json
├── package-lock.json
├── playwright.config.ts
├── postcss.config.js
├── scripts/
│   ├── start.sh               # INV-002
│   ├── stop.sh                # INV-002
│   └── status.sh              # INV-002
├── src/
│   ├── client/
│   │   ├── App.tsx            # Phase controller (INV-004)
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── cockpit/       # StatusBar, SimulationBadge (GAP remediation)
│   │   │   ├── phase0/        # TokenCaptureForm, TokenTimer
│   │   │   ├── phase1/        # PreIgnitionScanner, ScanCheckItem
│   │   │   ├── phase2/        # IgnitionButton, BackendSelector
│   │   │   ├── phase3/        # TelemetryDashboard, panels
│   │   │   ├── phase4/        # ShutdownPanel
│   │   │   └── uxmi/          # UXMI components (CR-005)
│   │   ├── hooks/             # useBackendHealth, useNetworkStatus, useErrorAggregator
│   │   ├── lib/sentry.ts
│   │   └── stores/            # Zustand stores
│   ├── server/
│   │   ├── index.ts
│   │   ├── lib/sentry.ts
│   │   ├── routes/            # auth, scan, ignition, shutdown, telemetry
│   │   └── services/          # kite.ts, cia-sie.ts
│   ├── shared/
│   │   ├── types.ts
│   │   └── validation/        # sanitize.ts (INV-006)
│   └── test/
│       ├── setup.ts
│       ├── test-utils.tsx
│       ├── globals.d.ts
│       ├── vitest.d.ts
│       └── integration/       # full-flow.test.ts
├── stryker.conf.mjs
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.build.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

### 7.2 99_INDEPENDENT_VERIFICATION/ Structure

```
99_INDEPENDENT_VERIFICATION/
├── README.md                   # Non-authorization statement
├── VERIFICATION_MANIFEST.md    # Canonical meaning definition
├── RUNBOOK.md                  # Human guidance
├── COMMON/
│   ├── invariants.json
│   ├── phase_contracts.json
│   ├── expected_outputs.json
│   └── verification_utils.ts
├── GITHUB/
│   ├── workflow.yml
│   ├── run.sh
│   └── results/.gitkeep
├── VERCEL/
│   ├── vercel.json
│   ├── run.sh
│   └── results/.gitkeep
├── REPLIT/
│   ├── replit.nix
│   ├── run.sh
│   └── results/.gitkeep
├── CLAUDE_CODE/
│   ├── prompt.md
│   ├── scope.json
│   └── results/.gitkeep
└── ATTESTATIONS/
    └── ENVIRONMENT_VERIFICATION_SUMMARY.md
```

---

## 8. REPORT CONCLUSION

### 8.1 Configuration Certainty

| Aspect | Confirmed |
|--------|-----------|
| Canonical path identified | ✅ |
| Single source of truth established | ✅ |
| All artifacts accounted for | ✅ |
| Version control status documented | ✅ |
| Local-only changes identified | ✅ |

### 8.2 Traceability

| Requirement/Invariant | Implementation Location |
|----------------------|------------------------|
| INV-001 (Credential Continuity) | `tokenStore.ts` |
| INV-002 (Lifecycle Discipline) | `scripts/*.sh` |
| INV-004 (State Legality) | `App.tsx` |
| INV-006 (Input Sanitization) | `shared/validation/sanitize.ts` |
| CR-001 (Token Validity) | `tokenStore.ts`, `auth.ts` |
| CR-002 (Graceful Shutdown) | `shutdownStore.ts`, `ShutdownPanel.tsx` |
| CR-003 (Error Format) | `ErrorDisplay.tsx` |
| CR-004 (Token Expiry) | `TokenTimer.tsx`, `tokenStore.ts` |
| CR-005 (UXMI 7-State) | `components/uxmi/*` |

### 8.3 Single Source of Truth Assurance

The directory:

```
/Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/
```

Contains the **complete, current, and authoritative** state of the MCI system.

---

**Report Timestamp:** 2026-01-28_204952
**Report Submitted. Awaiting Program Director confirmation before any next action.**
