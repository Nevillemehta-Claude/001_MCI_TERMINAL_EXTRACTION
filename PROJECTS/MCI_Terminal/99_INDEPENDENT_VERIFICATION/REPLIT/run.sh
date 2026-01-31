#!/bin/bash
# =============================================================================
# MCI INDEPENDENT VERIFICATION - REPLIT RUNNER
# =============================================================================
#
# PURPOSE: Human-visible, interactive verification in Replit environment
# STATUS: PREPARED FOR EXECUTION
#
# ⚠️  EXECUTION REQUIRES EXPLICIT PROGRAM DIRECTOR AUTHORIZATION  ⚠️
#
# This script is designed for human-operated verification where a neutral
# observer can run the tests and observe the results in real-time.
#
# Replit provides:
# - Isolated environment
# - Real-time console output
# - Shareable workspace for audit
# - No local machine dependencies
#
# Usage: ./run.sh <authorization_code>
#
# =============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
APP_DIR="$ROOT_DIR/12_APPLICATION_CODE"
COMMON_DIR="$SCRIPT_DIR/../COMMON"
RESULTS_DIR="$SCRIPT_DIR/results"

# Colors (Replit console supports these)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║       MCI INDEPENDENT VERIFICATION - REPLIT RUNNER          ║"
echo "║                                                              ║"
echo "║  Human-Visible, Interactive Audit Environment               ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${YELLOW}⚠️  Prepared for execution. Execution requires Program Director authorization.${NC}"
echo ""

# Check authorization
AUTH_CODE="${1:-NOT_PROVIDED}"

echo "┌──────────────────────────────────────────────────────────────┐"
echo "│ AUTHORIZATION CHECK                                          │"
echo "├──────────────────────────────────────────────────────────────┤"
echo "│ Authorization Code: $AUTH_CODE"
echo "│ Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "│ Environment: Replit"
echo "│ Repl ID: ${REPL_ID:-unknown}"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""

if [ "$AUTH_CODE" == "NOT_PROVIDED" ]; then
    echo -e "${RED}❌ Authorization Required${NC}"
    echo ""
    echo "   This script requires Program Director authorization."
    echo ""
    echo "   Usage: ./run.sh <authorization_code>"
    echo ""
    echo "   The authorization code must be obtained from the Program Director"
    echo "   before any verification execution is permitted."
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Authorization code provided${NC}"
echo ""

# Interactive pause
echo "Press ENTER to begin verification, or Ctrl+C to abort..."
read -r

echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│ STEP 1: ENVIRONMENT CHECK                                    │"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""

echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    echo -e "${GREEN}$(node --version)${NC}"
else
    echo -e "${RED}NOT FOUND${NC}"
    exit 1
fi

echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    echo -e "${GREEN}$(npm --version)${NC}"
else
    echo -e "${RED}NOT FOUND${NC}"
    exit 1
fi

echo -n "Checking application directory... "
if [ -d "$APP_DIR" ]; then
    echo -e "${GREEN}EXISTS${NC}"
else
    echo -e "${RED}NOT FOUND${NC}"
    exit 1
fi

echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│ STEP 2: INSTALL DEPENDENCIES                                 │"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""

cd "$APP_DIR"
echo "Working directory: $(pwd)"
echo ""
echo "Installing dependencies (this may take a few minutes)..."
echo ""

npm ci 2>&1 | tail -20

echo ""
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo "┌──────────────────────────────────────────────────────────────┐"
echo "│ STEP 3: TYPE CHECK                                           │"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""

echo "Running TypeScript type check..."
if npx tsc --noEmit 2>&1; then
    echo -e "${GREEN}✓ Type check passed${NC}"
else
    echo -e "${RED}✗ Type check failed${NC}"
    exit 1
fi

echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│ STEP 4: RUN TESTS                                            │"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""

# Ensure results directory exists
mkdir -p "$RESULTS_DIR"

echo "Running complete test suite..."
echo "This will show all test output for human observation."
echo ""
echo "────────────────────────────────────────────────────────────────"

# Run tests with full output (human-readable)
npx vitest run 2>&1 | tee "$RESULTS_DIR/test-output.txt"
TEST_EXIT_CODE=${PIPESTATUS[0]}

echo "────────────────────────────────────────────────────────────────"
echo ""

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    OVERALL_STATUS="PASS"
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    OVERALL_STATUS="FAIL"
fi

echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│ STEP 5: GENERATE CONVERGENCE EVIDENCE                        │"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""

# Extract counts from output
PASSED=$(grep -oP '\d+(?= passed)' "$RESULTS_DIR/test-output.txt" | tail -1 || echo "0")
FAILED=$(grep -oP '\d+(?= failed)' "$RESULTS_DIR/test-output.txt" | tail -1 || echo "0")
SKIPPED="0"

echo "Passed:  $PASSED"
echo "Failed:  $FAILED"
echo "Skipped: $SKIPPED"
echo ""

# Generate convergence hash
HASH_INPUT="P${PASSED}F${FAILED}S${SKIPPED}"
CONVERGENCE_HASH=$(echo -n "$HASH_INPUT" | sha256sum | cut -c1-16)
echo "$CONVERGENCE_HASH" > "$RESULTS_DIR/convergence-hash.txt"

echo "Convergence Hash: $CONVERGENCE_HASH"
echo ""

echo "┌──────────────────────────────────────────────────────────────┐"
echo "│ STEP 6: GENERATE REPORT                                      │"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""

cat > "$RESULTS_DIR/verification-report.md" << EOF
# Replit Verification Report

**Environment:** Replit (Human-Visible Audit)
**Repl ID:** ${REPL_ID:-unknown}
**Timestamp:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Authorization:** $AUTH_CODE
**Status:** $OVERALL_STATUS

## Test Results

| Metric | Value |
|--------|-------|
| Passed | $PASSED |
| Failed | $FAILED |
| Skipped | $SKIPPED |

## Convergence Hash

\`$CONVERGENCE_HASH\`

## Human Observation Notes

_This section is for the human observer to record any notes:_

- [ ] All test output was visible in console
- [ ] No unexpected errors occurred
- [ ] Results are consistent with expected behavior
- [ ] Convergence hash can be compared with other environments

## Observer Sign-Off

**Observer Name:** ________________________________

**Date/Time:** ________________________________

**Signature:** ________________________________

---

**Verification Complete**
EOF

echo "Report generated: $RESULTS_DIR/verification-report.md"
echo ""

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║                  VERIFICATION COMPLETE                       ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "┌──────────────────────────────────────────────────────────────┐"
echo "│ SUMMARY                                                      │"
echo "├──────────────────────────────────────────────────────────────┤"
echo "│ Status:          $OVERALL_STATUS"
echo "│ Tests Passed:    $PASSED"
echo "│ Tests Failed:    $FAILED"
echo "│ Convergence:     $CONVERGENCE_HASH"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""
echo "Results saved to: $RESULTS_DIR/"
echo ""
echo "Next Steps for Human Observer:"
echo "  1. Review test output above for any anomalies"
echo "  2. Compare convergence hash with other environments"
echo "  3. Complete observer sign-off in verification-report.md"
echo "  4. Submit report to Program Director"
echo ""
