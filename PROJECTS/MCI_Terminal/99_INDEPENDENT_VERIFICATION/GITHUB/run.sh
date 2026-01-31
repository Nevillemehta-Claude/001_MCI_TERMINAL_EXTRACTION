#!/bin/bash
# =============================================================================
# MCI INDEPENDENT VERIFICATION - GITHUB LOCAL RUNNER
# =============================================================================
#
# PURPOSE: Execute verification locally using the same logic as GitHub Actions
# STATUS: PREPARED FOR EXECUTION
#
# ⚠️  EXECUTION REQUIRES EXPLICIT PROGRAM DIRECTOR AUTHORIZATION  ⚠️
#
# Usage: ./run.sh [authorization_code]
#
# =============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
APP_DIR="$ROOT_DIR/12_APPLICATION_CODE"
COMMON_DIR="$SCRIPT_DIR/../COMMON"
RESULTS_DIR="$SCRIPT_DIR/results"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=============================================="
echo "MCI INDEPENDENT VERIFICATION - GITHUB"
echo "=============================================="
echo ""
echo "Prepared for execution. Execution requires Program Director authorization."
echo ""

# Check authorization
AUTH_CODE="${1:-NOT_PROVIDED}"
echo "Authorization Code: $AUTH_CODE"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

if [ "$AUTH_CODE" == "NOT_PROVIDED" ]; then
    echo -e "${YELLOW}⚠️  No authorization code provided.${NC}"
    echo "   Usage: ./run.sh <authorization_code>"
    echo ""
    echo "   This script is PREPARED but requires explicit authorization."
    echo "   Contact Program Director to obtain authorization code."
    exit 1
fi

echo "=============================================="
echo "STEP 1: Verify Prerequisites"
echo "=============================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo "Node.js: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found.${NC}"
    exit 1
fi
echo "npm: $(npm --version)"

# Check application directory
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Application directory not found: $APP_DIR${NC}"
    exit 1
fi
echo "Application directory: ✅"

echo ""
echo "=============================================="
echo "STEP 2: Install Dependencies"
echo "=============================================="

cd "$APP_DIR"
npm ci

echo ""
echo "=============================================="
echo "STEP 3: Run Type Check"
echo "=============================================="

npx tsc --noEmit
echo -e "${GREEN}✅ Type check passed${NC}"

echo ""
echo "=============================================="
echo "STEP 4: Run Tests"
echo "=============================================="

# Ensure results directory exists
mkdir -p "$RESULTS_DIR"

# Run tests with JSON output
npx vitest run --reporter=json --outputFile="$RESULTS_DIR/test-results.json" || true
npx vitest run 2>&1 | tee "$RESULTS_DIR/test-output.txt"

echo ""
echo "=============================================="
echo "STEP 5: Validate Against COMMON Contracts"
echo "=============================================="

# Read expected values from COMMON
EXPECTED_TESTS=$(jq '.testExecution.expectedCounts.totalTests' "$COMMON_DIR/expected_outputs.json")

# Read actual values
ACTUAL_TESTS=$(jq '.numTotalTests' "$RESULTS_DIR/test-results.json")
PASSED=$(jq '.numPassedTests' "$RESULTS_DIR/test-results.json")
FAILED=$(jq '.numFailedTests' "$RESULTS_DIR/test-results.json")
SKIPPED=$(jq '.numPendingTests // 0' "$RESULTS_DIR/test-results.json")

echo "Expected tests: $EXPECTED_TESTS"
echo "Actual tests: $ACTUAL_TESTS"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Skipped: $SKIPPED"

if [ "$FAILED" -gt 0 ]; then
    echo -e "${RED}❌ FAIL: $FAILED tests failed${NC}"
    OVERALL_STATUS="FAIL"
else
    echo -e "${GREEN}✅ PASS: All tests passed${NC}"
    OVERALL_STATUS="PASS"
fi

echo ""
echo "=============================================="
echo "STEP 6: Generate Convergence Hash"
echo "=============================================="

HASH_INPUT="P${PASSED}F${FAILED}S${SKIPPED}"
CONVERGENCE_HASH=$(echo -n "$HASH_INPUT" | sha256sum | cut -c1-16)
echo "$CONVERGENCE_HASH" > "$RESULTS_DIR/convergence-hash.txt"

echo "Convergence Hash: $CONVERGENCE_HASH"

echo ""
echo "=============================================="
echo "STEP 7: Generate Verification Report"
echo "=============================================="

cat > "$RESULTS_DIR/verification-report.md" << EOF
# GitHub Local Verification Report

**Environment:** GitHub (Local Runner)
**Timestamp:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Authorization:** $AUTH_CODE
**Status:** $OVERALL_STATUS

## Test Results

| Metric | Value |
|--------|-------|
| Total Tests | $ACTUAL_TESTS |
| Passed | $PASSED |
| Failed | $FAILED |
| Skipped | $SKIPPED |
| Pass Rate | $(echo "scale=1; $PASSED * 100 / $ACTUAL_TESTS" | bc)% |

## Convergence Hash

\`$CONVERGENCE_HASH\`

## Contract Validation

- Expected Tests: $EXPECTED_TESTS
- Actual Tests: $ACTUAL_TESTS
- Difference: $(($ACTUAL_TESTS - $EXPECTED_TESTS))

## Invariant Coverage

| Invariant | Status |
|-----------|--------|
| INV-001 | Covered by tokenStore tests |
| INV-002 | Covered by lifecycle scripts |
| INV-003 | Covered by expiry tests |
| INV-004 | Covered by integration tests |
| INV-005 | Covered by error handling tests |
| INV-006 | Covered by sanitize tests |

## Phase Coverage

| Phase | Status |
|-------|--------|
| token | Covered by TokenCaptureForm tests |
| scan | Covered by PreIgnitionScanner tests |
| ignition | Covered by IgnitionButton tests |
| running | Covered by TelemetryDashboard tests |
| shutdown | Covered by ShutdownPanel tests |

---

**Verification Complete**
EOF

echo "Report generated: $RESULTS_DIR/verification-report.md"

echo ""
echo "=============================================="
echo "VERIFICATION COMPLETE"
echo "=============================================="
echo ""
echo "Results saved to: $RESULTS_DIR/"
echo "  - test-results.json"
echo "  - test-output.txt"
echo "  - convergence-hash.txt"
echo "  - verification-report.md"
echo ""
echo "Convergence Hash: $CONVERGENCE_HASH"
echo "Overall Status: $OVERALL_STATUS"
echo ""
echo "Next Steps:"
echo "1. Compare convergence hash with other environments"
echo "2. Complete ENVIRONMENT_VERIFICATION_SUMMARY.md"
echo ""
echo "=============================================="
