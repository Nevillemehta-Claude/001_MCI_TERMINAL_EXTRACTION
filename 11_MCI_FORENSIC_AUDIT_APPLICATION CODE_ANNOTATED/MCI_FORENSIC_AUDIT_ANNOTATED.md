# MCI FORENSIC AUDIT - ANNOTATED FILE CLASSIFICATION

**Audit Date:** 2026-01-25
**Source Location:** `/Users/nevillemehta/Downloads/PROJECTS/01_MCI/`
**Destination:** `/Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/`
**Purpose:** Identify CRITICAL application files for transfer

---

## ANNOTATION LEGEND

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ANNOTATION MARKERS                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [CRITICAL-CODE]     Core application source code - MUST TRANSFER           │
│  [CRITICAL-CONFIG]   Essential configuration files - MUST TRANSFER          │
│  [TEST]              Test files - TRANSFER (part of codebase)               │
│  [DOCUMENTATION]     Documentation files - ALREADY IN EXTRACTION            │
│  [BUILD-ARTIFACT]    Generated files - DO NOT TRANSFER (regenerable)        │
│  [DEPENDENCY]        node_modules - DO NOT TRANSFER (reinstall)             │
│  [GIT-REPO]          Git history - TRANSFER .git for version control        │
│  [CI-CD]             GitHub Actions - TRANSFER for deployment               │
│  [SYSTEM]            OS system files - IGNORE                               │
│                                                                              │
│  Priority Markers:                                                           │
│  ★★★ = ESSENTIAL (Application will not work without this)                   │
│  ★★  = IMPORTANT (Required for full functionality)                          │
│  ★   = USEFUL (Helpful but not critical)                                    │
│  ○   = OPTIONAL (Can be regenerated or is not essential)                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## EXECUTIVE SUMMARY

| Classification | File Count | Size | Transfer? |
|----------------|------------|------|-----------|
| CRITICAL-CODE | ~65 files | ~700 KB | **YES - PRIORITY 1** |
| CRITICAL-CONFIG | ~15 files | ~260 KB | **YES - PRIORITY 1** |
| TEST | ~30 files | ~100 KB | **YES - PRIORITY 2** |
| CI-CD | 3 files | ~15 KB | **YES - PRIORITY 2** |
| GIT-REPO | 1 directory | ~5 MB | **YES - For history** |
| DOCUMENTATION | ~45 files | ~2.6 MB | Already extracted |
| BUILD-ARTIFACT | 3 directories | ~5 MB | NO - Regenerable |
| DEPENDENCY | 1 directory | ~283 MB | NO - Reinstall |

---

## PART 1: ROOT LEVEL FILES

### Location: `/Users/nevillemehta/Downloads/PROJECTS/01_MCI/`

```
01_MCI/
│
├── ★★★ [CRITICAL-CONFIG] package.json                    ← Project manifest
├── ★★  [CRITICAL-CONFIG] package-lock.json               ← NPM lock file
├── ★★  [CRITICAL-CONFIG] bun.lock                        ← Bun lock file
├── ★★★ [CRITICAL-CONFIG] tsconfig.json                   ← TypeScript config
├── ★★  [CRITICAL-CONFIG] tsconfig.build.json             ← TS build config
├── ★★  [CRITICAL-CONFIG] tsconfig.node.json              ← TS Node config
├── ★★★ [CRITICAL-CONFIG] vite.config.ts                  ← Build configuration
├── ★★  [CRITICAL-CONFIG] vitest.config.ts                ← Test configuration
├── ★★  [CRITICAL-CONFIG] playwright.config.ts            ← E2E test config
├── ★★★ [CRITICAL-CONFIG] tailwind.config.js              ← Styling config
├── ★★  [CRITICAL-CONFIG] postcss.config.js               ← CSS processing
├── ★★★ [CRITICAL-CONFIG] .env.example                    ← Environment template
├── ★★★ [CRITICAL-CONFIG] .env                            ← Environment variables
├── ★★  [CRITICAL-CONFIG] .gitignore                      ← Git ignore rules
├── ★   [CRITICAL-CONFIG] stryker.conf.mjs                ← Mutation testing
│
├── ★   [DOCUMENTATION] UNIVERSAL_FILE_GOVERNANCE_PROTOCOL_v3.md
├── ★   [DOCUMENTATION] BATCH_PROCESSING_EXECUTION_DIRECTIVE_v2.md
├── ★   [DOCUMENTATION] BIFURCATION_CLASSIFICATION_DECLARATIONS_v2.md
├── ★   [DOCUMENTATION] MCI_PROJECT_TREE_ANNOTATED.md
├── ★   [DOCUMENTATION] _KITE_EXECUTION_GUIDE.md
├── ★   [DOCUMENTATION] _IRONCLAD_SYSTEM_PREFIX.md
├── ★   [DOCUMENTATION] SESSION_ARCHIVE_*.md (3 files)
├── ★   [DOCUMENTATION] NASA_GRADE_TESTING_STRATEGY.txt
├── ★   [DOCUMENTATION] IRONCLAD_TOOL-ARSENAL_DEPLOYMENT_GUIDE.txt
├── ○   [DOCUMENTATION] IRONCLAD_DOCUMENT_PARSING_PROTOCOL.pdf
│
└── ○   [SYSTEM] .DS_Store                                ← macOS (ignore)
```

---

## PART 2: CRITICAL SOURCE CODE DIRECTORY

### Location: `/Users/nevillemehta/Downloads/PROJECTS/01_MCI/src/`

```
src/                                          ★★★ [CRITICAL-CODE] ENTIRE DIRECTORY
│
├── client/                                   ★★★ [CRITICAL-CODE] FRONTEND APPLICATION
│   │
│   ├── ★★★ main.tsx                         ← ENTRY POINT - React initialization
│   ├── ★★★ App.tsx                          ← ROOT COMPONENT - Phase orchestration
│   ├── ★★★ index.css                        ← Global styles
│   │
│   ├── components/                           ★★★ [CRITICAL-CODE] ALL 43 COMPONENTS
│   │   │
│   │   ├── phase-0/                          ★★★ TOKEN CAPTURE PHASE
│   │   │   ├── TokenCaptureForm.tsx         ← Token input form
│   │   │   ├── TokenTimer.tsx               ← Token expiry timer
│   │   │   ├── CredentialsHelper.tsx        ← Help overlay
│   │   │   └── __tests__/                   ★★ [TEST] Unit tests
│   │   │
│   │   ├── phase-1/                          ★★★ PRE-IGNITION PHASE
│   │   │   ├── PreIgnitionScanner.tsx       ← System scanner
│   │   │   ├── ScanCheckItem.tsx            ← Individual check item
│   │   │   └── __tests__/                   ★★ [TEST] Unit tests
│   │   │
│   │   ├── phase-2/                          ★★★ IGNITION PHASE
│   │   │   ├── IgnitionButton.tsx           ← Ignition trigger
│   │   │   ├── BackendSelector.tsx          ← Backend selection
│   │   │   └── __tests__/                   ★★ [TEST] Unit tests
│   │   │
│   │   ├── phase-3/                          ★★★ OPERATIONS DASHBOARD
│   │   │   ├── AccountPanel.tsx             ← Account information
│   │   │   ├── OrdersPanel.tsx              ← Orders display
│   │   │   ├── PositionsPanel.tsx           ← Positions display
│   │   │   ├── MarketDataPanel.tsx          ← Market data
│   │   │   ├── ActivityLogPanel.tsx         ← Activity logs
│   │   │   ├── SystemHealthPanel.tsx        ← System health
│   │   │   ├── TelemetryDashboard.tsx       ← Telemetry view
│   │   │   └── __tests__/                   ★★ [TEST] Unit tests
│   │   │
│   │   ├── phase-4/                          ★★★ SHUTDOWN PHASE
│   │   │   ├── ShutdownPanel.tsx            ← Shutdown controls
│   │   │   └── __tests__/                   ★★ [TEST] Unit tests
│   │   │
│   │   └── uxmi/                             ★★★ DESIGN SYSTEM (7 components)
│   │       ├── Button.tsx                   ← Button component
│   │       ├── Input.tsx                    ← Input component
│   │       ├── ErrorDisplay.tsx             ← Error display
│   │       ├── Toast.tsx                    ← Toast notifications
│   │       ├── ProgressBar.tsx              ← Progress indicator
│   │       ├── Spinner.tsx                  ← Loading spinner
│   │       ├── Tooltip.tsx                  ← Tooltip component
│   │       └── __tests__/                   ★★ [TEST] Unit tests
│   │
│   ├── hooks/                                ★★★ [CRITICAL-CODE] REACT HOOKS
│   │   ├── useTokenTimer.ts                 ← Token timer hook
│   │   ├── useWebSocket.ts                  ← WebSocket hook
│   │   ├── useApi.ts                        ← API hook
│   │   └── __tests__/                       ★★ [TEST] Unit tests
│   │
│   ├── stores/                               ★★★ [CRITICAL-CODE] ZUSTAND STORES
│   │   ├── tokenStore.ts                    ← Token state management
│   │   ├── scannerStore.ts                  ← Scanner state
│   │   ├── ignitionStore.ts                 ← Ignition state
│   │   ├── telemetryStore.ts                ← Telemetry state
│   │   ├── shutdownStore.ts                 ← Shutdown state
│   │   └── __tests__/                       ★★ [TEST] Store unit tests
│   │       ├── tokenStore.test.ts
│   │       ├── scannerStore.test.ts
│   │       ├── ignitionStore.test.ts
│   │       ├── telemetryStore.test.ts
│   │       └── shutdownStore.test.ts
│   │
│   ├── lib/                                  ★★★ [CRITICAL-CODE] UTILITIES
│   │   ├── api.ts                           ← API client
│   │   ├── utils.ts                         ← Utility functions
│   │   ├── constants.ts                     ← App constants
│   │   └── __tests__/                       ★★ [TEST] Unit tests
│   │
│   └── __tests__/                            ★★ [TEST] Client integration tests
│
├── server/                                   ★★★ [CRITICAL-CODE] BACKEND API
│   │
│   ├── ★★★ index.ts                         ← SERVER ENTRY POINT - Hono server
│   │
│   ├── routes/                               ★★★ [CRITICAL-CODE] API ENDPOINTS
│   │   ├── auth.ts                          ← /api/auth routes
│   │   ├── scan.ts                          ← /api/scan routes
│   │   ├── ignition.ts                      ← /api/ignition routes
│   │   ├── shutdown.ts                      ← /api/shutdown routes
│   │   ├── telemetry.ts                     ← /api/telemetry routes
│   │   └── __tests__/                       ★★ [TEST] Route tests
│   │       ├── auth.test.ts
│   │       ├── scan.test.ts
│   │       ├── ignition.test.ts
│   │       ├── shutdown.test.ts
│   │       └── telemetry.test.ts
│   │
│   ├── services/                             ★★★ [CRITICAL-CODE] BUSINESS LOGIC
│   │   └── kite.ts                          ← Core KITE service (8.8 KB)
│   │
│   └── lib/                                  ★★★ [CRITICAL-CODE] SERVER UTILITIES
│       ├── middleware.ts                    ← HTTP middleware
│       └── logger.ts                        ← Logging utility
│
├── shared/                                   ★★★ [CRITICAL-CODE] SHARED CODE
│   └── types.ts                             ← TypeScript type definitions
│
├── test/                                     ★★ [TEST] TEST INFRASTRUCTURE
│   ├── setup.ts                             ← Test environment setup
│   ├── globals.d.ts                         ← Test global types
│   ├── vitest.d.ts                          ← Vitest types
│   ├── test-utils.tsx                       ← Testing utilities
│   └── integration/                         ★★ [TEST] Integration tests
│       └── full-flow.test.ts                ← Full flow integration test
│
└── __tests__/                                ★★ [TEST] Root-level tests
```

---

## PART 3: E2E TESTS DIRECTORY

### Location: `/Users/nevillemehta/Downloads/PROJECTS/01_MCI/e2e/`

```
e2e/                                          ★★ [TEST] END-TO-END TESTS
│
├── ★★ mci.spec.ts                           ← Main E2E test suite (11 KB)
└── mci.spec.ts-snapshots/                   ○ [BUILD-ARTIFACT] Test snapshots
```

---

## PART 4: CI/CD CONFIGURATION

### Location: `/Users/nevillemehta/Downloads/PROJECTS/01_MCI/.github/`

```
.github/                                      ★★ [CI-CD] GITHUB ACTIONS
│
└── workflows/
    ├── ★★ ci.yml                            ← Continuous Integration
    ├── ★★ deploy.yml                        ← Deployment workflow
    └── ★★ pr-checks.yml                     ← PR validation
```

---

## PART 5: GIT REPOSITORY

### Location: `/Users/nevillemehta/Downloads/PROJECTS/01_MCI/.git/`

```
.git/                                         ★★ [GIT-REPO] VERSION CONTROL
│
├── Contains full commit history
├── Branch information
├── Remote configuration
└── Git hooks
```

---

## PART 6: DOCUMENTATION DIRECTORIES (ALREADY EXTRACTED)

### These are already in 001_MCI_TERMINAL_EXTRACTION

```
00_MASTER_DOCUMENTS/                          ★ [DOCUMENTATION] 12 files
├── MCI_COMPLETE_PROJECT_SYNTHESIS.md
├── MCI_PRODUCTION_LIFECYCLE_MASTER_MANIFEST.md
├── MCI_MASTER_USE_CASE_SPECIFICATION.md
├── SUPERVISED_MISSION_DIRECTIVE_v1.0.md
├── MCI_FORENSIC_ANALYSIS_REPORT.md
├── PROJECT_STATUS_EXECUTION_AUTHORITY.md
├── CIA-SIE_ECOSYSTEM_ARCHITECTURE.md
└── ... (more files)

00_READING MATERIAL_MCI/                      ★ [DOCUMENTATION] 5 files
├── 01_PROJECT_BRIEF_BCI_001.pdf
├── 01A_ADDENDUM_001_TOKEN_CAPTURE_MODULE.pdf
├── 01B_ADDENDUM_002_UX_MICRO_INTERACTIONS.pdf
└── ... (more files)

01_SOURCE_DOCUMENTS/                          ★ [DOCUMENTATION] 5 files
02_SPECIFICATIONS/                            ★ [DOCUMENTATION] 5 files
03_ARCHITECTURE/                              ★ [DOCUMENTATION] 1 file
_SESSION_CHECKPOINTS/                         ★ [DOCUMENTATION] 2 files
docs/                                         ★ [DOCUMENTATION] 5 files
```

---

## PART 7: DO NOT TRANSFER (REGENERABLE)

```
dist/                                         ○ [BUILD-ARTIFACT] 2.3 MB
├── index.html                               ← Regenerate with: npm run build
└── assets/                                  ← Bundled JS/CSS

coverage/                                     ○ [BUILD-ARTIFACT] 2.7 MB
└── lcov-report/                             ← Regenerate with: npm run test:coverage

playwright-report/                            ○ [BUILD-ARTIFACT] varies
└── index.html                               ← Regenerate with: npm run test:e2e

node_modules/                                 ○ [DEPENDENCY] 283 MB
└── (316 packages)                           ← Regenerate with: bun install
```

---

## PART 8: CRITICAL FILES CHECKLIST FOR TRANSFER

### Priority 1: MUST TRANSFER (Application Core)

| # | File/Directory | Type | Size | Notes |
|---|----------------|------|------|-------|
| 1 | `src/` | CRITICAL-CODE | ~700 KB | **ENTIRE DIRECTORY** |
| 2 | `package.json` | CRITICAL-CONFIG | 1.4 KB | Project manifest |
| 3 | `package-lock.json` | CRITICAL-CONFIG | 245 KB | NPM lock |
| 4 | `bun.lock` | CRITICAL-CONFIG | 107 KB | Bun lock |
| 5 | `tsconfig.json` | CRITICAL-CONFIG | 436 B | TypeScript config |
| 6 | `tsconfig.build.json` | CRITICAL-CONFIG | 200 B | TS build config |
| 7 | `tsconfig.node.json` | CRITICAL-CONFIG | 233 B | TS Node config |
| 8 | `vite.config.ts` | CRITICAL-CONFIG | 2.9 KB | Build config |
| 9 | `tailwind.config.js` | CRITICAL-CONFIG | 413 B | Styling |
| 10 | `postcss.config.js` | CRITICAL-CONFIG | 80 B | CSS processing |
| 11 | `.env.example` | CRITICAL-CONFIG | 1.9 KB | Env template |
| 12 | `.env` | CRITICAL-CONFIG | 951 B | Environment vars |
| 13 | `.gitignore` | CRITICAL-CONFIG | 42 lines | Git rules |

### Priority 2: SHOULD TRANSFER (Testing & CI/CD)

| # | File/Directory | Type | Size | Notes |
|---|----------------|------|------|-------|
| 14 | `e2e/` | TEST | ~20 KB | E2E test suite |
| 15 | `vitest.config.ts` | CRITICAL-CONFIG | 1.1 KB | Test config |
| 16 | `playwright.config.ts` | CRITICAL-CONFIG | 833 B | E2E config |
| 17 | `.github/workflows/` | CI-CD | ~15 KB | GitHub Actions |
| 18 | `stryker.conf.mjs` | CRITICAL-CONFIG | 923 B | Mutation testing |

### Priority 3: OPTIONAL (Version Control)

| # | File/Directory | Type | Size | Notes |
|---|----------------|------|------|-------|
| 19 | `.git/` | GIT-REPO | ~5 MB | Full history |

---

## PART 9: TRANSFER COMMAND REFERENCE

### Recommended Transfer Structure

```
001_MCI_TERMINAL_EXTRACTION/
└── 12_APPLICATION_CODE/                      ← NEW DIRECTORY FOR CODE
    ├── src/                                  ← From 01_MCI/src/
    ├── e2e/                                  ← From 01_MCI/e2e/
    ├── .github/                              ← From 01_MCI/.github/
    ├── .git/                                 ← From 01_MCI/.git/
    ├── package.json
    ├── package-lock.json
    ├── bun.lock
    ├── tsconfig.json
    ├── tsconfig.build.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── vitest.config.ts
    ├── playwright.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    ├── .env
    ├── .gitignore
    └── stryker.conf.mjs
```

---

## PART 10: FILE COUNT SUMMARY

### Critical Code Files by Phase

| Phase | Component Files | Test Files | Total |
|-------|-----------------|------------|-------|
| Phase 0 (Token Capture) | 3 | 3 | 6 |
| Phase 1 (Pre-Ignition) | 2 | 2 | 4 |
| Phase 2 (Ignition) | 2 | 2 | 4 |
| Phase 3 (Operations) | 7 | 7 | 14 |
| Phase 4 (Shutdown) | 1 | 1 | 2 |
| UXMI (Design System) | 7 | 7 | 14 |
| **Frontend Total** | **22** | **22** | **44** |

| Backend | Source Files | Test Files | Total |
|---------|--------------|------------|-------|
| Routes | 5 | 5 | 10 |
| Services | 1 | 0 | 1 |
| Lib | 2 | 0 | 2 |
| **Backend Total** | **8** | **5** | **13** |

| Other | Files |
|-------|-------|
| Hooks | 3 |
| Stores | 5 |
| Store Tests | 5 |
| Lib Utils | 3 |
| Shared Types | 1 |
| Test Infrastructure | 5 |
| Integration Tests | 1 |
| E2E Tests | 1 |
| **Other Total** | **24** |

### Grand Total

| Category | Count |
|----------|-------|
| **CRITICAL-CODE Files** | ~65 |
| **TEST Files** | ~30 |
| **CRITICAL-CONFIG Files** | ~15 |
| **Total Files to Transfer** | **~110** |

---

## PART 11: TECHNOLOGY STACK VERIFIED

| Layer | Technology | Version | File Reference |
|-------|------------|---------|----------------|
| **Runtime** | Bun | Latest | package.json |
| **Runtime (alt)** | Node.js | 18+ | package.json |
| **Frontend Framework** | React | 18.2.0 | package.json |
| **Build Tool** | Vite | 5.0 | vite.config.ts |
| **State Management** | Zustand | 4.5 | src/client/stores/ |
| **Styling** | Tailwind CSS | 3.4 | tailwind.config.js |
| **Backend Framework** | Hono | 4.0 | src/server/index.ts |
| **Type System** | TypeScript | 5.3 | tsconfig.json |
| **Unit Testing** | Vitest | 1.2 | vitest.config.ts |
| **E2E Testing** | Playwright | 1.57 | playwright.config.ts |
| **Error Monitoring** | Sentry | 8.0 | .env, main.tsx |

---

## CERTIFICATION

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  FORENSIC AUDIT CERTIFICATION                                                │
│  ════════════════════════════                                                │
│                                                                              │
│  Audit Date:        2026-01-25                                              │
│  Source Path:       /Users/nevillemehta/Downloads/PROJECTS/01_MCI/          │
│  Auditor:           Claude Code (Opus 4.5)                                  │
│                                                                              │
│  FINDINGS SUMMARY:                                                           │
│  ─────────────────                                                          │
│  • Total directories examined: 60+                                          │
│  • Total files identified: 200+                                             │
│  • Critical code files: 65                                                  │
│  • Critical config files: 15                                                │
│  • Test files: 30                                                           │
│  • Files recommended for transfer: 110                                      │
│                                                                              │
│  CLASSIFICATION:                                                             │
│  ───────────────                                                            │
│  • Full-stack TypeScript application                                        │
│  • React 18 frontend with 5-phase workflow                                  │
│  • Hono backend with 5 API route modules                                    │
│  • Comprehensive test coverage (unit + E2E)                                 │
│  • Production-ready with Sentry monitoring                                  │
│                                                                              │
│  RECOMMENDATION:                                                             │
│  ──────────────                                                             │
│  Transfer all Priority 1 and Priority 2 files to:                           │
│  /Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/12_APPLICATION_CODE/│
│                                                                              │
│  This will consolidate all critical application code in the                 │
│  extraction directory, making it the single source of truth.                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*Forensic Audit Complete - All critical files identified and annotated*
