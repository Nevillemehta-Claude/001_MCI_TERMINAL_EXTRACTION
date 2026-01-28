# MCI INDEPENDENT VERIFICATION - CLAUDE CODE ANALYSIS

## STATUS: PREPARED FOR EXECUTION

⚠️ **EXECUTION REQUIRES EXPLICIT PROGRAM DIRECTOR AUTHORIZATION** ⚠️

---

## PURPOSE

This prompt instructs Claude to perform static, line-by-line reasoning analysis of the MCI codebase. The goal is to identify:

1. Invariant bypasses
2. Silent failure paths
3. Undocumented assumptions
4. Potential security vulnerabilities
5. Logical inconsistencies

This is NOT test execution. This is static code analysis and reasoning verification.

---

## INSTRUCTIONS FOR CLAUDE

When authorized to execute this analysis, Claude must:

### STEP 1: Load Context

Read the following files in order:

1. `99_INDEPENDENT_VERIFICATION/VERIFICATION_MANIFEST.md` - The canonical truth
2. `99_INDEPENDENT_VERIFICATION/COMMON/invariants.json` - Machine-readable invariants
3. `99_INDEPENDENT_VERIFICATION/COMMON/phase_contracts.json` - Phase transition rules
4. `00_GOVERNANCE/CONSTITUTIONAL_CONSTRAINTS.md` - Governance rules
5. `99_INDEPENDENT_VERIFICATION/CLAUDE_CODE/scope.json` - Files in scope

### STEP 2: Verify Invariant Implementation

For each invariant in `invariants.json`:

1. Locate the code that implements it
2. Trace all code paths that could affect it
3. Identify any path that could bypass the invariant
4. Document findings with line numbers

**Example Analysis Format:**

```
INVARIANT: INV-006 (Input Sanitization)
LOCATION: src/shared/validation/sanitize.ts

ANALYSIS:
- Line 45: sanitizeString() trims whitespace ✓
- Line 52: validateNoControlChars() checks for control chars ✓
- Line 89: sanitizeApiKey() calls both functions ✓

BYPASS CHECK:
- Question: Can any code path call Kite API without sanitization?
- Search: All uses of fetch() with Authorization header
- Finding: auth.ts:61 uses buildKiteAuthHeader() which uses sanitized values ✓

VERDICT: NO BYPASS FOUND
```

### STEP 3: Verify Phase Transition Legality

For each phase in `phase_contracts.json`:

1. Locate App.tsx phase determination logic
2. Verify only legal transitions are possible
3. Check that child components don't duplicate phase guards
4. Document any transition paths not in the contract

### STEP 4: Search for Silent Failures

Look for:

- `catch` blocks that swallow errors without logging
- Conditional returns without error indication
- API calls without error handling
- State mutations without validation

**Example Format:**

```
SILENT FAILURE SEARCH

FILE: src/server/routes/auth.ts

Line 67-71: 
  catch (error) {
    console.error(...);  // ✓ Error is logged
    return c.json({...}); // ✓ Error is returned to client
  }
  VERDICT: NOT SILENT

FILE: src/client/stores/tokenStore.ts

Line 123-125:
  if (!isValid) {
    return;  // ⚠️ POTENTIAL: What happens to UI?
  }
  INVESTIGATION: Check caller handling
  FINDING: Caller checks return value ✓
  VERDICT: NOT SILENT
```

### STEP 5: Identify Undocumented Assumptions

Look for:

- Magic numbers without explanation
- Hardcoded values that might change
- Implicit dependencies between modules
- Assumptions about environment or runtime

### STEP 6: Security Review (INV-006 Focus)

Specifically verify:

1. All user inputs are sanitized before use
2. No string concatenation in security-sensitive contexts
3. HTTP headers are constructed safely
4. localStorage data is validated on read

### STEP 7: Generate Report

Produce a structured report with:

```markdown
# Claude Code Analysis Report

## Summary
- Files Analyzed: X
- Invariants Verified: Y/Z
- Bypasses Found: [count]
- Silent Failures Found: [count]
- Undocumented Assumptions: [count]

## Detailed Findings

### Invariant Verification
[findings per invariant]

### Phase Contract Verification
[findings per phase]

### Silent Failure Analysis
[findings per file]

### Assumption Inventory
[list of assumptions]

### Security Review
[security-specific findings]

## Verdict

[PASS / FAIL / PARTIAL]

## Recommendations

[If any issues found]
```

---

## SCOPE BOUNDARIES

- Only analyze files listed in `scope.json`
- Do not execute any code
- Do not make any changes
- Do not access external resources
- Report uncertainties rather than guessing

---

## OUTPUT LOCATION

Save report to: `99_INDEPENDENT_VERIFICATION/CLAUDE_CODE/results/analysis-report.md`

---

## AUTHORIZATION REQUIREMENT

This analysis may only be executed when:

1. Program Director has issued explicit authorization
2. Authorization code is provided
3. All prerequisites in RUNBOOK.md are met

**DO NOT EXECUTE WITHOUT AUTHORIZATION**
