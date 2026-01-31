/**
 * Verification Module Tests
 * 
 * SILO 6: Gate-7 verification machinery tests
 */

import { describe, it, expect } from 'vitest';
import {
  // Gate-7
  VERIFICATION_CATEGORIES,
  INVARIANT_TESTS,
  createVerificationSuite,
  formatVerificationResult,
  generateGate7Certificate,
  getTestsForInvariant,
  getCriticalTests,
  type VerificationResult,
} from './gate7';

import {
  // Invariants
  INVARIANT_DEFINITIONS,
  checkInvariant,
  checkAllInvariants,
  getInvariant,
  getCriticalInvariants,
} from './invariants';

import {
  // Contracts
  validateTelemetryContract,
  validateErrorContract,
  validateHealthContract,
} from './contracts';

// ============================================================================
// SILO 6: GATE-7 TESTS
// ============================================================================

describe('SILO 6: Gate-7 Verification Machinery', () => {
  describe('VERIFICATION_CATEGORIES', () => {
    it('defines all 9 categories', () => {
      const categories = Object.keys(VERIFICATION_CATEGORIES);
      expect(categories).toHaveLength(9);
      expect(categories).toContain('boundary_sanitization');
      expect(categories).toContain('lifecycle_contamination');
      expect(categories).toContain('invariant_regression');
    });

    it('each category has required metadata', () => {
      for (const [key, value] of Object.entries(VERIFICATION_CATEGORIES)) {
        expect(value.name).toBeTruthy();
        expect(value.description).toBeTruthy();
        expect(value.testPrefix).toBeTruthy();
        expect(Array.isArray(value.invariants)).toBe(true);
      }
    });
  });

  describe('INVARIANT_TESTS', () => {
    it('contains multiple tests', () => {
      expect(INVARIANT_TESTS.length).toBeGreaterThan(10);
    });

    it('all tests have required fields', () => {
      for (const test of INVARIANT_TESTS) {
        expect(test.id).toBeTruthy();
        expect(test.description).toBeTruthy();
        expect(test.category).toBeTruthy();
        expect(test.passCriteria).toBeTruthy();
        expect(Array.isArray(test.invariantsCovered)).toBe(true);
        expect(typeof test.critical).toBe('boolean');
      }
    });

    it('test IDs follow prefix convention', () => {
      for (const test of INVARIANT_TESTS) {
        const category = VERIFICATION_CATEGORIES[test.category];
        expect(test.id.startsWith(category.testPrefix)).toBe(true);
      }
    });
  });

  describe('createVerificationSuite', () => {
    it('creates suite with selected categories', () => {
      const suite = createVerificationSuite('Test Suite', ['boundary_sanitization']);
      expect(suite.name).toBe('Test Suite');
      expect(suite.categories).toContain('boundary_sanitization');
      expect(suite.tests.length).toBeGreaterThan(0);
      expect(suite.tests.every(t => t.category === 'boundary_sanitization')).toBe(true);
    });

    it('includes timestamp', () => {
      const before = Date.now();
      const suite = createVerificationSuite('Test', ['boundary_sanitization']);
      const after = Date.now();
      expect(suite.createdAt).toBeGreaterThanOrEqual(before);
      expect(suite.createdAt).toBeLessThanOrEqual(after);
    });
  });

  describe('formatVerificationResult', () => {
    it('formats pass result', () => {
      const result: VerificationResult = {
        test: INVARIANT_TESTS[0],
        status: 'pass',
        durationMs: 50,
        timestamp: Date.now(),
      };
      const formatted = formatVerificationResult(result);
      expect(formatted).toContain('[PASS]');
      expect(formatted).toContain(INVARIANT_TESTS[0].id);
      expect(formatted).toContain('50ms');
    });

    it('formats fail result with message', () => {
      const result: VerificationResult = {
        test: INVARIANT_TESTS[0],
        status: 'fail',
        message: 'Assertion failed',
        timestamp: Date.now(),
      };
      const formatted = formatVerificationResult(result);
      expect(formatted).toContain('[FAIL]');
      expect(formatted).toContain('Assertion failed');
    });
  });

  describe('generateGate7Certificate', () => {
    it('generates certificate with execution flag false', () => {
      const cert = generateGate7Certificate(false);
      expect(cert.executionAuthorized).toBe(false);
      expect(cert.passedTests).toBe(-1); // Not executed
      expect(cert.gateResult).toBe('FAIL'); // Default to fail
    });

    it('generates certificate with valid ID', () => {
      const cert = generateGate7Certificate(false);
      expect(cert.id).toMatch(/^GATE7-\d+$/);
    });

    it('includes current date', () => {
      const cert = generateGate7Certificate(false);
      const today = new Date().toISOString().split('T')[0];
      expect(cert.date).toBe(today);
    });

    it('includes total test count', () => {
      const cert = generateGate7Certificate(false);
      expect(cert.totalTests).toBe(INVARIANT_TESTS.length);
    });
  });

  describe('getTestsForInvariant', () => {
    it('returns tests for INV-006', () => {
      const tests = getTestsForInvariant('INV-006');
      expect(tests.length).toBeGreaterThan(0);
      expect(tests.every(t => t.invariantsCovered.includes('INV-006'))).toBe(true);
    });
  });

  describe('getCriticalTests', () => {
    it('returns only critical tests', () => {
      const critical = getCriticalTests();
      expect(critical.every(t => t.critical)).toBe(true);
    });
  });
});

// ============================================================================
// SILO 6: INVARIANT TESTS
// ============================================================================

describe('SILO 6: Invariant Definitions', () => {
  describe('INVARIANT_DEFINITIONS', () => {
    it('defines all 6 invariants', () => {
      expect(INVARIANT_DEFINITIONS).toHaveLength(6);
    });

    it('all invariants have required fields', () => {
      for (const inv of INVARIANT_DEFINITIONS) {
        expect(inv.id).toMatch(/^INV-\d{3}$/);
        expect(inv.name).toBeTruthy();
        expect(inv.description).toBeTruthy();
        expect(inv.verificationMethod).toBeTruthy();
        expect(inv.violationCriteria).toBeTruthy();
        expect(['critical', 'high', 'medium']).toContain(inv.severity);
      }
    });
  });

  describe('checkInvariant', () => {
    it('returns result for valid invariant', () => {
      const result = checkInvariant('INV-001');
      expect(result.invariant.id).toBe('INV-001');
      expect(result.passed).toBe(false); // Declarative mode
      expect(result.message).toContain('requires verification');
    });

    it('throws for unknown invariant', () => {
      expect(() => checkInvariant('INV-999')).toThrow('Unknown invariant');
    });
  });

  describe('checkAllInvariants', () => {
    it('returns results for all invariants', () => {
      const results = checkAllInvariants();
      expect(results).toHaveLength(6);
    });
  });

  describe('getInvariant', () => {
    it('returns invariant by ID', () => {
      const inv = getInvariant('INV-006');
      expect(inv?.name).toBe('Input Sanitization');
    });

    it('returns undefined for unknown ID', () => {
      expect(getInvariant('INV-999')).toBeUndefined();
    });
  });

  describe('getCriticalInvariants', () => {
    it('returns only critical invariants', () => {
      const critical = getCriticalInvariants();
      expect(critical.every(i => i.severity === 'critical')).toBe(true);
    });
  });
});

// ============================================================================
// SILO 6: CONTRACT VALIDATION TESTS
// ============================================================================

describe('SILO 6: Contract Validation', () => {
  describe('validateErrorContract', () => {
    it('validates valid error', () => {
      const validError = {
        code: 'CIA_SIE_VALIDATION_ERROR',
        what: 'Request validation failed',
        why: 'Missing field',
        how: 'Add the missing field',
        httpStatus: 400,
        isUnavailable: false,
        isRecoverable: false,
      };
      const result = validateErrorContract(validError);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails for missing required fields', () => {
      const invalidError = {
        code: 'ERR',
        // missing what, why, how
      };
      const result = validateErrorContract(invalidError);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('fails for wrong types', () => {
      const invalidError = {
        code: 123, // should be string
        what: 'test',
        why: 'test',
        how: 'test',
        httpStatus: '400', // should be number
        isUnavailable: 'false', // should be boolean
        isRecoverable: false,
      };
      const result = validateErrorContract(invalidError);
      expect(result.valid).toBe(false);
    });

    it('warns about unexpected fields', () => {
      const errorWithExtra = {
        code: 'ERR',
        what: 'test',
        why: 'test',
        how: 'test',
        httpStatus: 400,
        isUnavailable: false,
        isRecoverable: false,
        extraField: 'unexpected',
      };
      const result = validateErrorContract(errorWithExtra);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].field).toBe('extraField');
    });
  });

  describe('validateHealthContract', () => {
    it('validates valid health response', () => {
      const valid = {
        status: 'ok',
        app: 'cia-sie-pure',
        version: '1.0.0',
      };
      const result = validateHealthContract(valid);
      expect(result.valid).toBe(true);
    });

    it('accepts minimal response', () => {
      const minimal = { status: 'ok' };
      const result = validateHealthContract(minimal);
      expect(result.valid).toBe(true);
    });

    it('fails for null input', () => {
      const result = validateHealthContract(null);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateTelemetryContract', () => {
    it('validates valid telemetry', () => {
      const valid = {
        status: { running: true },
        positions: [],
        orders: [],
        account: { equity: 100000 },
        health: { cpu: 50 },
        timestamp: Date.now(),
      };
      const result = validateTelemetryContract(valid);
      expect(result.valid).toBe(true);
    });

    it('fails for missing required fields', () => {
      const invalid = {
        status: { running: true },
        // missing positions, orders, etc.
      };
      const result = validateTelemetryContract(invalid);
      expect(result.valid).toBe(false);
    });
  });
});
