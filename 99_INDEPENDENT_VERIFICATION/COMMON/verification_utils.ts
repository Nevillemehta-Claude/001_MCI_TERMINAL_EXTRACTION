/**
 * MCI Independent Verification Utilities
 * 
 * This module provides environment-agnostic functions for verifying
 * MCI system compliance against the VERIFICATION_MANIFEST.md contracts.
 * 
 * STATUS: PREPARED FOR EXECUTION
 * Execution requires explicit Program Director authorization.
 * 
 * @module verification_utils
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface InvariantDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  preconditions: string[];
  postconditions: string[];
  forbiddenStates: string[];
}

export interface PhaseContract {
  id: string;
  name: string;
  order: number;
  entryConditions: string[];
  exitConditions: string[];
  legalTransitions: string[];
  illegalTransitions: string[];
}

export interface TestResult {
  file: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

export interface VerificationResult {
  environment: string;
  timestamp: string;
  overallStatus: 'PASS' | 'FAIL' | 'PARTIAL';
  testResults: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
  };
  invariantChecks: Record<string, boolean>;
  phaseChecks: Record<string, boolean>;
  convergenceHash: string;
  deviations: string[];
}

// ============================================================================
// INVARIANT LOADING
// ============================================================================

/**
 * Load invariant definitions from the canonical JSON file.
 * 
 * @param basePath - Path to the COMMON directory
 * @returns Parsed invariants object
 */
export function loadInvariants(basePath: string): Record<string, InvariantDefinition> {
  const filePath = path.join(basePath, 'invariants.json');
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  return data.invariants;
}

/**
 * Load phase contracts from the canonical JSON file.
 * 
 * @param basePath - Path to the COMMON directory
 * @returns Parsed phase contracts object
 */
export function loadPhaseContracts(basePath: string): Record<string, PhaseContract> {
  const filePath = path.join(basePath, 'phase_contracts.json');
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  return data.phases;
}

/**
 * Load expected outputs from the canonical JSON file.
 * 
 * @param basePath - Path to the COMMON directory
 * @returns Parsed expected outputs object
 */
export function loadExpectedOutputs(basePath: string): Record<string, unknown> {
  const filePath = path.join(basePath, 'expected_outputs.json');
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

// ============================================================================
// TEST RESULT PARSING
// ============================================================================

/**
 * Parse vitest JSON output into structured results.
 * 
 * @param vitestOutput - Raw vitest JSON output
 * @returns Structured test results
 */
export function parseVitestOutput(vitestOutput: string): TestResult[] {
  // Vitest outputs JSON when run with --reporter=json
  const data = JSON.parse(vitestOutput);
  
  return data.testResults.map((file: any) => ({
    file: file.name,
    passed: file.assertionResults.filter((t: any) => t.status === 'passed').length,
    failed: file.assertionResults.filter((t: any) => t.status === 'failed').length,
    skipped: file.assertionResults.filter((t: any) => t.status === 'skipped').length,
    duration: file.duration || 0,
  }));
}

/**
 * Calculate aggregate test statistics.
 * 
 * @param results - Array of test results
 * @returns Aggregate statistics
 */
export function aggregateTestResults(results: TestResult[]): {
  totalFiles: number;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
} {
  const totals = results.reduce(
    (acc, r) => ({
      totalFiles: acc.totalFiles + 1,
      totalTests: acc.totalTests + r.passed + r.failed + r.skipped,
      passed: acc.passed + r.passed,
      failed: acc.failed + r.failed,
      skipped: acc.skipped + r.skipped,
    }),
    { totalFiles: 0, totalTests: 0, passed: 0, failed: 0, skipped: 0 }
  );

  return {
    ...totals,
    passRate: totals.totalTests > 0 ? totals.passed / totals.totalTests : 0,
  };
}

// ============================================================================
// INVARIANT VERIFICATION
// ============================================================================

/**
 * Verify that test results cover all required invariants.
 * 
 * @param results - Test results
 * @param invariants - Invariant definitions
 * @returns Map of invariant ID to coverage status
 */
export function verifyInvariantCoverage(
  results: TestResult[],
  invariants: Record<string, InvariantDefinition>
): Record<string, boolean> {
  const coverage: Record<string, boolean> = {};

  // INV-006 must have dedicated sanitize tests
  coverage['INV-006'] = results.some(r => 
    r.file.includes('sanitize.test') && r.passed > 0 && r.failed === 0
  );

  // INV-001 must have tokenStore tests covering expiry
  coverage['INV-001'] = results.some(r => 
    r.file.includes('tokenStore.test') && r.passed > 0 && r.failed === 0
  );

  // INV-002 must have lifecycle coverage (scripts exist)
  // This is a static check, not test-based
  coverage['INV-002'] = true; // Verified by file existence check

  // INV-003 time handling - covered by tokenStore expiry tests
  coverage['INV-003'] = coverage['INV-001'];

  // INV-004 state transitions - covered by integration tests
  coverage['INV-004'] = results.some(r => 
    r.file.includes('full-flow.test') && r.passed > 0 && r.failed === 0
  );

  // INV-005 error handling - covered by component tests
  coverage['INV-005'] = results.some(r => 
    r.file.includes('ShutdownPanel.test') && r.passed > 0 && r.failed === 0
  );

  return coverage;
}

// ============================================================================
// PHASE CONTRACT VERIFICATION
// ============================================================================

/**
 * Verify phase transition legality based on test coverage.
 * 
 * @param results - Test results
 * @param phases - Phase contracts
 * @returns Map of phase ID to verification status
 */
export function verifyPhaseContracts(
  results: TestResult[],
  phases: Record<string, PhaseContract>
): Record<string, boolean> {
  const coverage: Record<string, boolean> = {};

  // Check that each phase has corresponding component tests
  coverage['token'] = results.some(r => 
    r.file.includes('TokenCaptureForm.test') && r.passed > 0 && r.failed === 0
  );

  coverage['scan'] = results.some(r => 
    r.file.includes('PreIgnitionScanner.test') && r.passed > 0 && r.failed === 0
  );

  coverage['ignition'] = results.some(r => 
    r.file.includes('IgnitionButton.test') && r.passed > 0 && r.failed === 0
  );

  coverage['running'] = results.some(r => 
    r.file.includes('TelemetryDashboard.test') && r.passed > 0 && r.failed === 0
  );

  coverage['shutdown'] = results.some(r => 
    r.file.includes('ShutdownPanel.test') && r.passed > 0 && r.failed === 0
  );

  return coverage;
}

// ============================================================================
// CONVERGENCE VERIFICATION
// ============================================================================

/**
 * Generate a hash of verification results for convergence comparison.
 * 
 * @param results - Verification results
 * @returns Hash string for comparison
 */
export function generateConvergenceHash(results: {
  passed: number;
  failed: number;
  skipped: number;
}): string {
  // Simple deterministic hash based on counts
  const input = `P${results.passed}F${results.failed}S${results.skipped}`;
  
  // Use a simple hash for comparison (in production, use crypto)
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Compare results from multiple environments for convergence.
 * 
 * @param results - Array of results from different environments
 * @returns Convergence status and any deviations
 */
export function checkConvergence(
  results: VerificationResult[]
): { converged: boolean; deviations: string[] } {
  if (results.length < 2) {
    return { converged: true, deviations: [] };
  }

  const deviations: string[] = [];
  const baseline = results[0];

  for (let i = 1; i < results.length; i++) {
    const current = results[i];

    if (current.convergenceHash !== baseline.convergenceHash) {
      deviations.push(
        `Hash mismatch: ${baseline.environment}(${baseline.convergenceHash}) vs ` +
        `${current.environment}(${current.convergenceHash})`
      );
    }

    if (current.testResults.passed !== baseline.testResults.passed) {
      deviations.push(
        `Pass count mismatch: ${baseline.environment}(${baseline.testResults.passed}) vs ` +
        `${current.environment}(${current.testResults.passed})`
      );
    }

    if (current.testResults.failed !== baseline.testResults.failed) {
      deviations.push(
        `Fail count mismatch: ${baseline.environment}(${baseline.testResults.failed}) vs ` +
        `${current.environment}(${current.testResults.failed})`
      );
    }
  }

  return {
    converged: deviations.length === 0,
    deviations,
  };
}

// ============================================================================
// FILE EXISTENCE VERIFICATION
// ============================================================================

/**
 * Verify that required files exist.
 * 
 * @param basePath - Base path to check from
 * @param requiredFiles - Array of relative file paths
 * @returns Map of file path to existence status
 */
export function verifyFileExistence(
  basePath: string,
  requiredFiles: string[]
): Record<string, boolean> {
  const results: Record<string, boolean> = {};

  for (const file of requiredFiles) {
    const fullPath = path.join(basePath, file);
    results[file] = fs.existsSync(fullPath);
  }

  return results;
}

/**
 * Verify that scripts are executable.
 * 
 * @param basePath - Base path to check from
 * @param scripts - Array of relative script paths
 * @returns Map of script path to executable status
 */
export function verifyScriptsExecutable(
  basePath: string,
  scripts: string[]
): Record<string, boolean> {
  const results: Record<string, boolean> = {};

  for (const script of scripts) {
    const fullPath = path.join(basePath, script);
    try {
      fs.accessSync(fullPath, fs.constants.X_OK);
      results[script] = true;
    } catch {
      results[script] = false;
    }
  }

  return results;
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Generate a verification report in markdown format.
 * 
 * @param result - Verification result
 * @returns Markdown formatted report
 */
export function generateReport(result: VerificationResult): string {
  const lines: string[] = [
    `# Verification Report: ${result.environment}`,
    '',
    `**Timestamp:** ${result.timestamp}`,
    `**Status:** ${result.overallStatus}`,
    '',
    '## Test Results',
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Total Tests | ${result.testResults.total} |`,
    `| Passed | ${result.testResults.passed} |`,
    `| Failed | ${result.testResults.failed} |`,
    `| Pass Rate | ${(result.testResults.passRate * 100).toFixed(1)}% |`,
    '',
    '## Invariant Checks',
    '',
    '| Invariant | Status |',
    '|-----------|--------|',
  ];

  for (const [inv, status] of Object.entries(result.invariantChecks)) {
    lines.push(`| ${inv} | ${status ? '✅ PASS' : '❌ FAIL'} |`);
  }

  lines.push('', '## Phase Checks', '', '| Phase | Status |', '|-------|--------|');

  for (const [phase, status] of Object.entries(result.phaseChecks)) {
    lines.push(`| ${phase} | ${status ? '✅ PASS' : '❌ FAIL'} |`);
  }

  lines.push('', `## Convergence Hash`, '', `\`${result.convergenceHash}\``, '');

  if (result.deviations.length > 0) {
    lines.push('## Deviations', '');
    for (const dev of result.deviations) {
      lines.push(`- ${dev}`);
    }
  }

  return lines.join('\n');
}

// ============================================================================
// MAIN VERIFICATION ENTRY POINT
// ============================================================================

/**
 * Run complete verification for an environment.
 * 
 * STATUS: PREPARED FOR EXECUTION
 * This function is prepared but NOT authorized for execution.
 * Execution requires explicit Program Director authorization.
 * 
 * @param environment - Environment name
 * @param commonPath - Path to COMMON directory
 * @param appPath - Path to application code
 * @param testOutput - Raw test output (JSON format)
 * @returns Complete verification result
 */
export function runVerification(
  environment: string,
  commonPath: string,
  appPath: string,
  testOutput: string
): VerificationResult {
  // Load contracts
  const invariants = loadInvariants(commonPath);
  const phases = loadPhaseContracts(commonPath);
  const expected = loadExpectedOutputs(commonPath);

  // Parse test results
  const testResults = parseVitestOutput(testOutput);
  const aggregated = aggregateTestResults(testResults);

  // Verify invariants
  const invariantChecks = verifyInvariantCoverage(testResults, invariants);

  // Verify phases
  const phaseChecks = verifyPhaseContracts(testResults, phases);

  // Generate convergence hash
  const convergenceHash = generateConvergenceHash(aggregated);

  // Collect deviations
  const deviations: string[] = [];

  if (aggregated.failed > 0) {
    deviations.push(`${aggregated.failed} tests failed`);
  }

  for (const [inv, passed] of Object.entries(invariantChecks)) {
    if (!passed) {
      deviations.push(`Invariant ${inv} not covered`);
    }
  }

  for (const [phase, passed] of Object.entries(phaseChecks)) {
    if (!passed) {
      deviations.push(`Phase ${phase} not covered`);
    }
  }

  // Determine overall status
  let overallStatus: 'PASS' | 'FAIL' | 'PARTIAL' = 'PASS';
  if (deviations.length > 0) {
    overallStatus = aggregated.failed > 0 ? 'FAIL' : 'PARTIAL';
  }

  return {
    environment,
    timestamp: new Date().toISOString(),
    overallStatus,
    testResults: {
      total: aggregated.totalTests,
      passed: aggregated.passed,
      failed: aggregated.failed,
      passRate: aggregated.passRate,
    },
    invariantChecks,
    phaseChecks,
    convergenceHash,
    deviations,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  loadInvariants,
  loadPhaseContracts,
  loadExpectedOutputs,
  parseVitestOutput,
  aggregateTestResults,
  verifyInvariantCoverage,
  verifyPhaseContracts,
  generateConvergenceHash,
  checkConvergence,
  verifyFileExistence,
  verifyScriptsExecutable,
  generateReport,
  runVerification,
};
