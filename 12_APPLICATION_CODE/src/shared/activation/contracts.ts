/**
 * Runtime Boundary Contract Finalization
 * 
 * SILO 9: Freeze and seal all runtime contracts before activation.
 * 
 * CONSTRAINT: Contracts are DEFINED but NOT enforced until activation.
 * Unknown fields, schemas, or enums are REJECTED.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Data flow direction at runtime boundary
 */
export type DataFlowDirection = 
  | 'inbound'   // CIA-SIE-PURE → MCI
  | 'outbound'  // MCI → CIA-SIE-PURE
  | 'bidirectional';

/**
 * Runtime contract definition
 */
export interface RuntimeContract {
  /** Contract ID */
  id: string;
  /** Contract name */
  name: string;
  /** Version */
  version: string;
  /** Direction of data flow */
  direction: DataFlowDirection;
  /** Allowed fields */
  allowedFields: string[];
  /** Required fields */
  requiredFields: string[];
  /** Forbidden fields (MUST be rejected) */
  forbiddenFields: string[];
  /** Field type constraints */
  fieldTypes: Record<string, string>;
  /** Timing semantics */
  timing: {
    maxLatencyMs: number;
    timeoutMs: number;
    staleAfterMs: number;
  };
  /** Contract fingerprint (for drift detection) */
  fingerprint: string;
}

/**
 * Contract violation
 */
export interface ContractViolation {
  /** Contract that was violated */
  contractId: string;
  /** Type of violation */
  type: 'unknown_field' | 'forbidden_field' | 'missing_required' | 'type_mismatch' | 'schema_drift';
  /** Field that caused violation */
  field: string;
  /** Expected value/type */
  expected: string;
  /** Actual value/type */
  actual: string;
  /** Timestamp */
  timestamp: number;
}

// ============================================================================
// CONTRACT DEFINITIONS (FROZEN)
// ============================================================================

/**
 * Health response contract
 */
const HEALTH_CONTRACT: RuntimeContract = {
  id: 'CONTRACT-HEALTH-001',
  name: 'CIA-SIE-PURE Health Response',
  version: '1.0.0',
  direction: 'inbound',
  allowedFields: ['status', 'app', 'version', 'message', 'uptime', 'timestamp'],
  requiredFields: ['status'],
  forbiddenFields: ['_internal', '__debug', 'secrets', 'credentials'],
  fieldTypes: {
    status: 'string',
    app: 'string',
    version: 'string',
    message: 'string',
    uptime: 'number',
    timestamp: 'number',
  },
  timing: {
    maxLatencyMs: 500,
    timeoutMs: 5000,
    staleAfterMs: 30000,
  },
  fingerprint: 'HEALTH-v1.0.0-2026-01-29',
};

/**
 * Signal data contract
 */
const SIGNAL_CONTRACT: RuntimeContract = {
  id: 'CONTRACT-SIGNAL-001',
  name: 'CIA-SIE-PURE Signal Data',
  version: '1.0.0',
  direction: 'inbound',
  allowedFields: [
    'id', 'chartId', 'direction', 'timestamp', 'indicator',
    'freshness', 'confidence', 'rawPayload',
  ],
  requiredFields: ['id', 'chartId', 'direction', 'timestamp'],
  forbiddenFields: ['_raw', '__internal', 'debug', 'apiKey'],
  fieldTypes: {
    id: 'string',
    chartId: 'string',
    direction: 'string', // 'buy' | 'sell' | 'hold'
    timestamp: 'string',
    indicator: 'string',
    freshness: 'string',
    confidence: 'number',
    rawPayload: 'object',
  },
  timing: {
    maxLatencyMs: 2000,
    timeoutMs: 10000,
    staleAfterMs: 60000,
  },
  fingerprint: 'SIGNAL-v1.0.0-2026-01-29',
};

/**
 * Narrative data contract
 */
const NARRATIVE_CONTRACT: RuntimeContract = {
  id: 'CONTRACT-NARRATIVE-001',
  name: 'CIA-SIE-PURE Narrative Data',
  version: '1.0.0',
  direction: 'inbound',
  allowedFields: [
    'id', 'chartId', 'siloId', 'text', 'generatedAt',
    'model', 'tokensUsed', 'latencyMs',
  ],
  requiredFields: ['id', 'text', 'generatedAt'],
  forbiddenFields: ['apiKey', 'prompt', 'systemPrompt', '__raw'],
  fieldTypes: {
    id: 'string',
    chartId: 'string',
    siloId: 'string',
    text: 'string',
    generatedAt: 'string',
    model: 'string',
    tokensUsed: 'number',
    latencyMs: 'number',
  },
  timing: {
    maxLatencyMs: 30000,
    timeoutMs: 60000,
    staleAfterMs: 300000,
  },
  fingerprint: 'NARRATIVE-v1.0.0-2026-01-29',
};

/**
 * Error response contract
 */
const ERROR_CONTRACT: RuntimeContract = {
  id: 'CONTRACT-ERROR-001',
  name: 'CIA-SIE-PURE Error Response',
  version: '1.0.0',
  direction: 'inbound',
  allowedFields: ['detail', 'status_code', 'type', 'loc', 'msg', 'ctx'],
  requiredFields: ['detail'],
  forbiddenFields: ['stack', 'trace', 'internal'],
  fieldTypes: {
    detail: 'string',
    status_code: 'number',
    type: 'string',
    loc: 'array',
    msg: 'string',
    ctx: 'object',
  },
  timing: {
    maxLatencyMs: 500,
    timeoutMs: 5000,
    staleAfterMs: 0, // Errors don't go stale
  },
  fingerprint: 'ERROR-v1.0.0-2026-01-29',
};

/**
 * All runtime contracts (FROZEN)
 */
export const RUNTIME_CONTRACTS: RuntimeContract[] = [
  HEALTH_CONTRACT,
  SIGNAL_CONTRACT,
  NARRATIVE_CONTRACT,
  ERROR_CONTRACT,
];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate data against a runtime contract.
 * 
 * @param data - Data to validate
 * @param contract - Contract to validate against
 * @returns Validation result
 */
export function validateRuntimeContract(
  data: unknown,
  contract: RuntimeContract
): {
  valid: boolean;
  violations: ContractViolation[];
} {
  const violations: ContractViolation[] = [];

  if (data === null || data === undefined || typeof data !== 'object') {
    violations.push({
      contractId: contract.id,
      type: 'type_mismatch',
      field: '(root)',
      expected: 'object',
      actual: String(data),
      timestamp: Date.now(),
    });
    return { valid: false, violations };
  }

  const obj = data as Record<string, unknown>;
  const fields = Object.keys(obj);

  // Check for forbidden fields
  for (const field of fields) {
    if (contract.forbiddenFields.includes(field)) {
      violations.push({
        contractId: contract.id,
        type: 'forbidden_field',
        field,
        expected: 'not present',
        actual: 'present',
        timestamp: Date.now(),
      });
    }
  }

  // Check for unknown fields
  for (const field of fields) {
    if (!contract.allowedFields.includes(field)) {
      violations.push({
        contractId: contract.id,
        type: 'unknown_field',
        field,
        expected: `one of: ${contract.allowedFields.join(', ')}`,
        actual: field,
        timestamp: Date.now(),
      });
    }
  }

  // Check for required fields
  for (const field of contract.requiredFields) {
    if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
      violations.push({
        contractId: contract.id,
        type: 'missing_required',
        field,
        expected: 'present',
        actual: 'missing',
        timestamp: Date.now(),
      });
    }
  }

  // Check field types
  for (const [field, expectedType] of Object.entries(contract.fieldTypes)) {
    if (field in obj && obj[field] !== undefined && obj[field] !== null) {
      const actualType = Array.isArray(obj[field]) ? 'array' : typeof obj[field];
      if (actualType !== expectedType) {
        violations.push({
          contractId: contract.id,
          type: 'type_mismatch',
          field,
          expected: expectedType,
          actual: actualType,
          timestamp: Date.now(),
        });
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Reject data with unknown fields (strict mode).
 * 
 * @param data - Data to check
 * @param allowedFields - List of allowed fields
 * @returns Rejected fields or empty array
 */
export function rejectUnknownFields(
  data: unknown,
  allowedFields: string[]
): string[] {
  if (data === null || data === undefined || typeof data !== 'object') {
    return [];
  }

  const obj = data as Record<string, unknown>;
  const unknownFields: string[] = [];

  for (const field of Object.keys(obj)) {
    if (!allowedFields.includes(field)) {
      unknownFields.push(field);
    }
  }

  return unknownFields;
}

/**
 * Get contract fingerprint for drift detection.
 * 
 * @param contract - Contract to fingerprint
 * @returns Fingerprint string
 */
export function getContractFingerprint(contract: RuntimeContract): string {
  return contract.fingerprint;
}

/**
 * Get contract by ID.
 */
export function getContract(id: string): RuntimeContract | undefined {
  return RUNTIME_CONTRACTS.find(c => c.id === id);
}

/**
 * Verify contract fingerprint matches expected.
 */
export function verifyContractFingerprint(
  contractId: string,
  expectedFingerprint: string
): boolean {
  const contract = getContract(contractId);
  if (!contract) return false;
  return contract.fingerprint === expectedFingerprint;
}
