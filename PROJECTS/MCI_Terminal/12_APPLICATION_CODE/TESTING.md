# MCI Testing Protocol

**Document Type:** Program Control
**Classification:** INTEGRITY SAFEGUARD
**Effective Date:** 2026-01-28

---

## AUTHORITATIVE TEST EXECUTION COMMAND

The **only** valid command for program validation is:

```bash
bun run test
```

This executes `vitest run` as defined in `package.json`, which:
- Uses the configuration in `vitest.config.ts`
- Sets `environment: 'jsdom'` for React component tests
- Runs setup files that mock browser APIs (localStorage, sessionStorage, fetch, etc.)
- Validates all 611 tests across 23 test files

---

## PROHIBITED COMMANDS

The following commands **MUST NOT** be used for program validation:

| Command | Why Prohibited |
|---------|----------------|
| `bun test` | Invokes Bun's native test runner, bypasses Vitest configuration, no jsdom environment |

Using `bun test` will produce false failures (e.g., `ReferenceError: document is not defined`) because the jsdom environment is not activated.

---

## AVAILABLE TEST COMMANDS

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `bun run test` | Run all tests once | CI/CD, validation gates |
| `bun run test:watch` | Run tests in watch mode | Development |
| `bun run test:coverage` | Run tests with coverage report | Quality gates |
| `bun run test:ui` | Open Vitest UI | Debugging |
| `bun run test:e2e` | Run Playwright E2E tests | Integration validation |

---

## TEST SUITE STRUCTURE

| Category | Location | Count |
|----------|----------|-------|
| Unit Tests (Stores) | `src/client/stores/*.test.ts` | 5 files |
| Edge Tests (Stores) | `src/client/stores/__tests__/*.edge.test.ts` | 1 file |
| Component Tests | `src/client/components/**/__tests__/*.test.tsx` | 13 files |
| Route Tests | `src/server/routes/__tests__/*.test.ts` | 4 files |
| Integration Tests | `src/test/integration/*.test.ts` | 1 file |
| E2E Tests | `e2e/*.spec.ts` | 1 file |

**Total:** 23 test files, 611 tests

---

## COVERAGE THRESHOLDS

Per `vitest.config.ts`, the following thresholds are enforced:

| Metric | Threshold |
|--------|-----------|
| Statements | 85% |
| Branches | 80% |
| Functions | 85% |
| Lines | 85% |

---

## CR COMPLIANCE VALIDATION

The test suite validates all Constitutional Requirements:

| CR | Validation Location |
|----|---------------------|
| CR-001: Token Validity | `tokenStore.test.ts`, `auth.test.ts` |
| CR-002: Graceful Shutdown | `shutdownStore.test.ts`, `shutdown.test.ts`, `ShutdownPanel.test.tsx` |
| CR-003: Error Format | Component tests verify WHAT/WHY/HOW format |
| CR-004: Token Expiry | `tokenStore.test.ts` (6:00 AM IST expiry) |
| CR-005: UXMI 7-States | All UXMI component tests |

---

## INCIDENT RECORD

**Date:** 2026-01-28
**Issue:** False test failure signal (464 failures reported)
**Root Cause:** Invocation of `bun test` instead of `bun run test`
**Resolution:** Documented correct protocol; no code changes required
**Classification:** Process execution discrepancy (not software defect)

---

*This document is a program control artifact. Violations of this protocol will produce invalid validation results.*
