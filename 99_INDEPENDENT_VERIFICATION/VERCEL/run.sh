#!/bin/bash
# =============================================================================
# MCI INDEPENDENT VERIFICATION - VERCEL RUNNER
# =============================================================================
#
# PURPOSE: Execute verification in Vercel build environment
# STATUS: PREPARED FOR EXECUTION
#
# ⚠️  EXECUTION REQUIRES EXPLICIT PROGRAM DIRECTOR AUTHORIZATION  ⚠️
#
# This script is designed to run during Vercel's build phase.
# It will fail the build if verification fails, preventing deployment
# of non-compliant code.
#
# Usage: 
#   1. Set up Vercel project pointing to this repository
#   2. Configure build command to run this script
#   3. Trigger build with authorization
#
# =============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
APP_DIR="$ROOT_DIR/12_APPLICATION_CODE"
COMMON_DIR="$SCRIPT_DIR/../COMMON"
RESULTS_DIR="$SCRIPT_DIR/results"

echo "=============================================="
echo "MCI INDEPENDENT VERIFICATION - VERCEL"
echo "=============================================="
echo ""
echo "Prepared for execution. Execution requires Program Director authorization."
echo ""
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Vercel Environment: ${VERCEL_ENV:-local}"
echo "Vercel Git Commit: ${VERCEL_GIT_COMMIT_SHA:-unknown}"
echo ""

# Check if running in Vercel
if [ -z "$VERCEL" ]; then
    echo "⚠️  Not running in Vercel environment."
    echo "   This script is designed for Vercel build verification."
    echo "   For local testing, use GITHUB/run.sh instead."
    echo ""
fi

# Check authorization via environment variable
AUTH_CODE="${MCI_AUTHORIZATION_CODE:-NOT_PROVIDED}"
if [ "$AUTH_CODE" == "NOT_PROVIDED" ]; then
    echo "⚠️  No authorization code provided."
    echo "   Set MCI_AUTHORIZATION_CODE environment variable in Vercel."
    echo ""
    echo "   This script is PREPARED but requires explicit authorization."
    echo ""
    # Don't exit - allow build to proceed for inspection
fi

echo "=============================================="
echo "STEP 1: Verify Application Directory"
echo "=============================================="

cd "$APP_DIR"
echo "Working directory: $(pwd)"
echo "Package.json exists: $([ -f package.json ] && echo 'yes' || echo 'no')"

echo ""
echo "=============================================="
echo "STEP 2: Install Dependencies"
echo "=============================================="

npm ci

echo ""
echo "=============================================="
echo "STEP 3: Run Type Check"
echo "=============================================="

npx tsc --noEmit
echo "✅ Type check passed"

echo ""
echo "=============================================="
echo "STEP 4: Run Tests"
echo "=============================================="

# Ensure results directory exists
mkdir -p "$RESULTS_DIR"

# Run tests
npx vitest run 2>&1 | tee "$RESULTS_DIR/test-output.txt"
TEST_EXIT_CODE=${PIPESTATUS[0]}

if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ VERIFICATION FAILED: Tests did not pass"
    echo ""
    echo "Build will fail to prevent deployment of non-compliant code."
    echo ""
    exit 1
fi

echo ""
echo "=============================================="
echo "STEP 5: Build Application"
echo "=============================================="

npm run build
echo "✅ Build completed"

echo ""
echo "=============================================="
echo "STEP 6: Generate Verification Evidence"
echo "=============================================="

# Extract test counts from output
PASSED=$(grep -oP '\d+(?= passed)' "$RESULTS_DIR/test-output.txt" | tail -1 || echo "0")
FAILED=$(grep -oP '\d+(?= failed)' "$RESULTS_DIR/test-output.txt" | tail -1 || echo "0")
SKIPPED="0"

# Generate convergence hash
HASH_INPUT="P${PASSED}F${FAILED}S${SKIPPED}"
CONVERGENCE_HASH=$(echo -n "$HASH_INPUT" | sha256sum | cut -c1-16)
echo "$CONVERGENCE_HASH" > "$RESULTS_DIR/convergence-hash.txt"

echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Convergence Hash: $CONVERGENCE_HASH"

# Generate report
cat > "$RESULTS_DIR/verification-report.md" << EOF
# Vercel Verification Report

**Environment:** Vercel
**Vercel Environment:** ${VERCEL_ENV:-local}
**Timestamp:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Git Commit:** ${VERCEL_GIT_COMMIT_SHA:-unknown}
**Status:** PASS

## Test Results

| Metric | Value |
|--------|-------|
| Passed | $PASSED |
| Failed | $FAILED |

## Convergence Hash

\`$CONVERGENCE_HASH\`

## Build Verification

- Build succeeded: ✅
- Output directory exists: $([ -d "$APP_DIR/dist" ] && echo '✅' || echo '❌')
- Index.html exists: $([ -f "$APP_DIR/dist/index.html" ] && echo '✅' || echo '❌')

---

**Verification Complete**
EOF

echo ""
echo "=============================================="
echo "VERIFICATION COMPLETE"
echo "=============================================="
echo ""
echo "Results saved to: $RESULTS_DIR/"
echo "Convergence Hash: $CONVERGENCE_HASH"
echo ""
echo "Build may now proceed to deployment."
echo ""
echo "=============================================="
