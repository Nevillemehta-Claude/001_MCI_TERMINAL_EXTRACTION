# SILO 5: Rollback and Reversibility Playbook
## <60 Second Reversibility for Every Integration Step

**Document ID:** SILO-5-ROLLBACK-001  
**Date:** 2026-01-29  
**Classification:** PLAYBOOK ONLY — NO DEPLOYMENT AUTHORIZED  
**Execution Status:** 🔒 DOCUMENTATION ONLY

---

## Governing Constraints

| Constraint | Status |
|------------|--------|
| Deployment | ❌ PROHIBITED |
| Environment mutation | ❌ PROHIBITED |
| Code changes | ❌ PROHIBITED |

---

## 1. ROLLBACK PHILOSOPHY

### Core Principle

Every integration step MUST be reversible within 60 seconds to a known-safe state.

| Principle | Statement |
|-----------|-----------|
| **Reversibility** | Every change can be undone |
| **Speed** | Rollback completes in < 60 seconds |
| **Completeness** | No orphaned state remains |
| **Verification** | Rollback success is verifiable |

---

## 2. CURRENT INTEGRATION STATE

### Implemented (Already Reversible)

| Integration Step | Status | Rollback Time |
|------------------|--------|---------------|
| BLOCK-001: Boundary Sanitization | ✅ Implemented | < 30s |
| BLOCK-002: Health State Store | ✅ Implemented | < 30s |
| BLOCK-003: Error Translation | ✅ Implemented | < 30s |
| BLOCK-004: Deep Health Probes | ✅ Implemented | < 30s |
| Minimal Integration: Health Visibility | ✅ Implemented | < 30s |

---

## 3. ROLLBACK PROCEDURES

### 3.1 Rollback: Minimal Integration (Health Visibility)

**Step:** Remove CIA-SIE-PURE health indicator from cockpit

**Files to Modify:**

| File | Action |
|------|--------|
| `src/client/components/cockpit/StatusBar.tsx` | Remove `EngineStatusIndicator` usage |
| `src/client/components/cockpit/index.ts` | Remove `EngineStatusIndicator` export |
| `src/client/hooks/index.ts` | Remove `useCiaSieHealth` export |

**Files to Delete:**

| File | Lines |
|------|-------|
| `src/client/hooks/useCiaSieHealth.ts` | 185 |
| `src/client/hooks/useCiaSieHealth.test.ts` | 175 |
| `src/client/components/cockpit/EngineStatusIndicator.tsx` | 113 |
| `src/client/components/cockpit/EngineStatusIndicator.test.tsx` | 226 |

**Rollback Commands:**

```bash
# Step 1: Remove from StatusBar.tsx
# (Edit file to remove EngineStatusIndicator import and usage)

# Step 2: Delete new files
rm src/client/hooks/useCiaSieHealth.ts
rm src/client/hooks/useCiaSieHealth.test.ts
rm src/client/components/cockpit/EngineStatusIndicator.tsx
rm src/client/components/cockpit/EngineStatusIndicator.test.tsx

# Step 3: Update exports (edit to remove new exports)

# Step 4: Verify
npm test
```

**Verification:**
- [ ] `npm test` passes
- [ ] StatusBar renders without EngineStatusIndicator
- [ ] No TypeScript compilation errors
- [ ] No console errors in browser

**Time Estimate:** 30 seconds

---

### 3.2 Rollback: BLOCK-001 (Boundary Sanitization)

**Step:** Remove CIA-SIE-PURE sanitization functions

**Files to Modify:**

| File | Action |
|------|--------|
| `src/shared/validation/sanitize.ts` | Remove CIA-SIE-PURE functions |
| `src/shared/validation/index.ts` | Remove CIA-SIE-PURE exports |
| `src/shared/validation/sanitize.test.ts` | Remove BLOCK-001 tests |
| `src/server/services/cia-sie.ts` | Remove sanitization import and usage |

**Rollback Steps:**

1. **Edit `cia-sie.ts`:**
   - Remove import of `sanitizeCiaSieResponse`
   - Remove sanitization call in `engineRequest`
   - Restore original `return response.json();`

2. **Edit `sanitize.ts`:**
   - Remove `sanitizeCiaSieString` function
   - Remove `sanitizeCiaSieResponse` function
   - Remove `validateCiaSieString` function
   - Remove related constants

3. **Edit `index.ts`:**
   - Remove exports for CIA-SIE-PURE functions

4. **Edit `sanitize.test.ts`:**
   - Remove BLOCK-001 test section

**Verification:**
- [ ] `npm test` passes (with fewer tests)
- [ ] No TypeScript compilation errors
- [ ] Original MCI tests still pass

**Time Estimate:** 45 seconds

---

### 3.3 Rollback: BLOCK-002 (Health State Store)

**Step:** Remove CIA-SIE-PURE health state store

**Files to Delete:**

| File | Lines |
|------|-------|
| `src/client/stores/ciaSieHealthStore.ts` | 185 |
| `src/client/stores/ciaSieHealthStore.test.ts` | 212 |

**Files to Modify:**

| File | Action |
|------|--------|
| `src/client/stores/index.ts` | Remove export (if added) |

**Verification:**
- [ ] `npm test` passes
- [ ] No TypeScript compilation errors
- [ ] No imports reference deleted files

**Time Estimate:** 15 seconds

---

### 3.4 Rollback: BLOCK-003 (Error Translation)

**Step:** Remove CIA-SIE-PURE error translation layer

**Files to Delete:**

| File | Lines |
|------|-------|
| `src/shared/errors/ciaSieErrorTranslator.ts` | 209 |
| `src/shared/errors/ciaSieErrorTranslator.test.ts` | 231 |
| `src/shared/errors/index.ts` | 21 |

**Directory to Delete:**

| Directory |
|-----------|
| `src/shared/errors/` |

**Verification:**
- [ ] `npm test` passes
- [ ] No TypeScript compilation errors
- [ ] No imports reference deleted files

**Time Estimate:** 15 seconds

---

### 3.5 Rollback: BLOCK-004 (Deep Health Probes)

**Step:** Remove CIA-SIE-PURE health probe service

**Files to Delete:**

| File | Lines |
|------|-------|
| `src/server/services/ciaSieHealthProbe.ts` | 253 |
| `src/server/services/ciaSieHealthProbe.test.ts` | 196 |

**Verification:**
- [ ] `npm test` passes
- [ ] No TypeScript compilation errors
- [ ] No imports reference deleted files

**Time Estimate:** 15 seconds

---

## 4. FUTURE INTEGRATION ROLLBACK (PLANNED)

### 4.1 Rollback: Telemetry Streaming (If Implemented)

**Files to Create/Modify:**
- WebSocket connection code
- Telemetry store updates
- Dashboard component updates

**Rollback Procedure:**
1. Remove WebSocket connection code
2. Remove telemetry store updates
3. Remove dashboard data binding
4. Delete test files
5. Verify tests pass

**Time Estimate:** 45 seconds

---

### 4.2 Rollback: Signal Display (If Implemented)

**Files to Create/Modify:**
- Signal type definitions
- Signal store
- Signal display components

**Rollback Procedure:**
1. Remove signal components
2. Remove signal store
3. Remove signal type definitions
4. Delete test files
5. Verify tests pass

**Time Estimate:** 30 seconds

---

### 4.3 Rollback: Narrative Display (If Implemented)

**Files to Create/Modify:**
- Narrative type definitions
- Narrative store
- Narrative display components
- AIObservation type mapping

**Rollback Procedure:**
1. Remove narrative components
2. Remove narrative store
3. Remove type mappings
4. Delete test files
5. Verify tests pass

**Time Estimate:** 30 seconds

---

## 5. COMPLETE ROLLBACK (NUCLEAR OPTION)

### Remove All CIA-SIE-PURE Integration

**Purpose:** Return MCI to pre-integration state

**Files to Delete:**

```
src/client/hooks/useCiaSieHealth.ts
src/client/hooks/useCiaSieHealth.test.ts
src/client/components/cockpit/EngineStatusIndicator.tsx
src/client/components/cockpit/EngineStatusIndicator.test.tsx
src/client/stores/ciaSieHealthStore.ts
src/client/stores/ciaSieHealthStore.test.ts
src/shared/errors/ciaSieErrorTranslator.ts
src/shared/errors/ciaSieErrorTranslator.test.ts
src/shared/errors/index.ts
src/server/services/ciaSieHealthProbe.ts
src/server/services/ciaSieHealthProbe.test.ts
```

**Files to Modify:**

| File | Action |
|------|--------|
| `src/shared/validation/sanitize.ts` | Remove CIA-SIE-PURE section |
| `src/shared/validation/index.ts` | Remove CIA-SIE-PURE exports |
| `src/shared/validation/sanitize.test.ts` | Remove BLOCK-001 tests |
| `src/server/services/cia-sie.ts` | Remove sanitization |
| `src/client/hooks/index.ts` | Remove useCiaSieHealth export |
| `src/client/components/cockpit/index.ts` | Remove EngineStatusIndicator export |
| `src/client/components/cockpit/StatusBar.tsx` | Remove EngineStatusIndicator |

**Directory to Delete:**

```
src/shared/errors/
```

**Verification:**
- [ ] `npm test` passes
- [ ] All original tests pass
- [ ] No TypeScript compilation errors
- [ ] Application runs without CIA-SIE-PURE features
- [ ] StatusBar displays original indicators only

**Time Estimate:** 60 seconds

---

## 6. VERIFICATION CHECKLIST

### Post-Rollback Verification

| Check | Command | Expected Result |
|-------|---------|-----------------|
| Tests pass | `npm test` | All tests pass (count may be lower) |
| TypeScript compiles | `npm run typecheck` | No errors |
| Application builds | `npm run build` | Build succeeds |
| Application runs | `npm run dev` | No console errors |
| StatusBar works | Visual inspection | Original indicators visible |

### Regression Check

| Feature | Verification |
|---------|--------------|
| Token capture | Navigate to Phase 0, enter credentials |
| Pre-ignition scan | Run scanner checks |
| Backend selection | Select broker |
| Ignition | Start system (simulation) |
| Shutdown | Stop system |

---

## 7. SAFE STATE DEFINITION

### Known-Safe State

A "safe state" is defined as:

| Criterion | Definition |
|-----------|------------|
| Tests pass | `npm test` reports 100% pass |
| No compilation errors | `npm run typecheck` succeeds |
| Application runs | Browser console shows no errors |
| Original features work | All MCI phases function correctly |
| No CIA-SIE-PURE dependency | Application works without CIA-SIE-PURE running |

### Pre-Integration Baseline

| Metric | Value |
|--------|-------|
| Test count | 775 tests |
| TypeScript errors | 0 |
| Build time | ~15 seconds |
| Application size | ~X MB (TBD) |

---

## 8. ROLLBACK DECISION CRITERIA

### When to Rollback

| Trigger | Severity | Action |
|---------|----------|--------|
| Test failures | > 5% of tests fail | Investigate; rollback if not fixable in 10min |
| TypeScript errors | Any error | Rollback immediately |
| Runtime errors | Uncaught exceptions | Rollback immediately |
| Performance degradation | > 50% slower | Rollback and investigate |
| User-facing issues | Any broken feature | Rollback immediately |

### Rollback Authorization

| Severity | Authorization Required |
|----------|----------------------|
| Critical (runtime crash) | Self-authorized |
| Major (feature broken) | Self-authorized |
| Minor (cosmetic issue) | Principal notification |
| Precautionary | Principal authorization |

---

## 9. ROLLBACK EXECUTION LOG TEMPLATE

```markdown
## Rollback Execution Log

**Date:** YYYY-MM-DD HH:MM
**Reason:** [Brief description]
**Rollback Target:** [Integration step]
**Authorized By:** [Principal/Self]

### Pre-Rollback State
- Test count: XXX
- Failing tests: XXX
- Error description: [if applicable]

### Rollback Steps Executed
1. [ ] Step 1
2. [ ] Step 2
3. [ ] ...

### Post-Rollback Verification
- [ ] Tests pass: XXX/XXX
- [ ] TypeScript compiles
- [ ] Application runs
- [ ] Original features verified

### Time Elapsed
- Start: HH:MM:SS
- End: HH:MM:SS
- Total: XX seconds

### Notes
[Any observations or issues during rollback]
```

---

## 10. ASSUMPTIONS (EXPLICIT)

| Assumption | Basis | Risk |
|------------|-------|------|
| File deletion is instant | OS behavior | LOW |
| Git can revert changes | Git functionality | LOW |
| Tests verify correctness | Test coverage | MEDIUM |
| 60 seconds is sufficient | Procedure estimation | MEDIUM |

---

## 11. NON-ASSUMPTIONS (EXPLICIT)

| Non-Assumption | Statement |
|----------------|-----------|
| Rollback is rare | We do NOT assume rollback will not be needed |
| State is consistent | We do NOT assume partial rollback leaves consistent state |
| Tests catch all issues | We do NOT assume passing tests guarantee correctness |
| Rollback is trivial | We do NOT assume rollback has no risk |

---

## ATTESTATION

This Rollback and Reversibility Playbook was prepared under the Multi-Silo Execution Directive dated 2026-01-29.

**Compliance Verification:**

| Prohibition | Status |
|-------------|--------|
| ❌ No deployment | ✅ COMPLIANT |
| ❌ No environment mutation | ✅ COMPLIANT |
| ❌ No code changes | ✅ COMPLIANT |

**Playbook Summary:**

> This playbook provides detailed rollback procedures for every implemented and planned integration step. Each procedure identifies files to delete/modify, provides verification checklists, and estimates time-to-safe-state at under 60 seconds. A complete "nuclear option" rollback is documented for returning MCI to its pre-integration baseline.

---

*End of Rollback and Reversibility Playbook*
