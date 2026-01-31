/**
 * Contract Validators
 * 
 * SILO 6: Type contract validation for telemetry, errors, and health.
 * 
 * CONSTRAINT: These validators CHECK data against expected contracts.
 * They do NOT transform data. Invalid data is rejected.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Contract validation definition
 */
export interface ContractValidation {
  /** Contract name */
  name: string;
  /** Fields to validate */
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
}

/**
 * Validation result
 */
export interface ContractValidationResult {
  valid: boolean;
  contract: string;
  errors: Array<{
    field: string;
    expected: string;
    actual: string;
    message: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
  checkedAt: number;
}

// ============================================================================
// CONTRACT DEFINITIONS
// ============================================================================

/**
 * Telemetry contract definition
 */
const TELEMETRY_CONTRACT: ContractValidation = {
  name: 'CiaSieTelemetry',
  fields: [
    { name: 'status', type: 'object', required: true, description: 'Engine status' },
    { name: 'positions', type: 'array', required: true, description: 'Position list' },
    { name: 'orders', type: 'array', required: true, description: 'Order list' },
    { name: 'account', type: 'object', required: true, description: 'Account info' },
    { name: 'health', type: 'object', required: true, description: 'Health metrics' },
    { name: 'timestamp', type: 'number', required: true, description: 'Unix timestamp' },
  ],
};

/**
 * Error contract definition (WHAT/WHY/HOW)
 */
const ERROR_CONTRACT: ContractValidation = {
  name: 'MciError',
  fields: [
    { name: 'code', type: 'string', required: true, description: 'Error code' },
    { name: 'what', type: 'string', required: true, description: 'What went wrong' },
    { name: 'why', type: 'string', required: true, description: 'Why it happened' },
    { name: 'how', type: 'string', required: true, description: 'How to fix' },
    { name: 'httpStatus', type: 'number', required: true, description: 'HTTP status' },
    { name: 'isUnavailable', type: 'boolean', required: true, description: 'Unavailability flag' },
    { name: 'isRecoverable', type: 'boolean', required: true, description: 'Recoverability flag' },
  ],
};

/**
 * Health contract definition
 */
const HEALTH_CONTRACT: ContractValidation = {
  name: 'CiaSieHealthResponse',
  fields: [
    { name: 'status', type: 'string', required: true, description: 'ok or error' },
    { name: 'app', type: 'string', required: false, description: 'App name' },
    { name: 'version', type: 'string', required: false, description: 'App version' },
    { name: 'message', type: 'string', required: false, description: 'Status message' },
  ],
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate data against a contract.
 */
function validateContract(
  data: unknown,
  contract: ContractValidation
): ContractValidationResult {
  const result: ContractValidationResult = {
    valid: true,
    contract: contract.name,
    errors: [],
    warnings: [],
    checkedAt: Date.now(),
  };

  if (data === null || data === undefined) {
    result.valid = false;
    result.errors.push({
      field: '(root)',
      expected: 'object',
      actual: String(data),
      message: 'Data is null or undefined',
    });
    return result;
  }

  if (typeof data !== 'object') {
    result.valid = false;
    result.errors.push({
      field: '(root)',
      expected: 'object',
      actual: typeof data,
      message: 'Data is not an object',
    });
    return result;
  }

  const obj = data as Record<string, unknown>;

  for (const field of contract.fields) {
    const value = obj[field.name];

    // Check required fields
    if (field.required && (value === undefined || value === null)) {
      result.valid = false;
      result.errors.push({
        field: field.name,
        expected: field.type,
        actual: 'missing',
        message: `Required field '${field.name}' is missing`,
      });
      continue;
    }

    // Skip type check for missing optional fields
    if (value === undefined || value === null) {
      continue;
    }

    // Type check
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== field.type) {
      result.valid = false;
      result.errors.push({
        field: field.name,
        expected: field.type,
        actual: actualType,
        message: `Field '${field.name}' has wrong type`,
      });
    }
  }

  // Check for unexpected fields (warning only)
  const expectedFields = new Set(contract.fields.map(f => f.name));
  for (const key of Object.keys(obj)) {
    if (!expectedFields.has(key)) {
      result.warnings.push({
        field: key,
        message: `Unexpected field '${key}' in data`,
      });
    }
  }

  return result;
}

/**
 * Validate telemetry data against contract.
 * 
 * CONSTRAINT: Validates but does NOT transform.
 */
export function validateTelemetryContract(data: unknown): ContractValidationResult {
  return validateContract(data, TELEMETRY_CONTRACT);
}

/**
 * Validate error data against WHAT/WHY/HOW contract.
 * 
 * CONSTRAINT: Validates but does NOT transform.
 */
export function validateErrorContract(data: unknown): ContractValidationResult {
  return validateContract(data, ERROR_CONTRACT);
}

/**
 * Validate health response against contract.
 * 
 * CONSTRAINT: Validates but does NOT transform.
 */
export function validateHealthContract(data: unknown): ContractValidationResult {
  return validateContract(data, HEALTH_CONTRACT);
}

/**
 * Create a custom contract validator.
 */
export function createContractValidator(
  contract: ContractValidation
): (data: unknown) => ContractValidationResult {
  return (data: unknown) => validateContract(data, contract);
}
