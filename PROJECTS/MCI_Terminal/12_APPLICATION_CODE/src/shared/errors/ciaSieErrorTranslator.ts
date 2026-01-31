/**
 * CIA-SIE-PURE Error Translation Layer
 * 
 * BLOCK-003 Resolution + SILO 2 Enhancement:
 * Translates CIA-SIE-PURE native errors to MCI's CR-003 compliant WHAT/WHY/HOW format.
 * 
 * CIA-SIE-PURE returns errors in format: { detail: string }
 * MCI requires errors in format: { code, what, why, how, details }
 * 
 * This translator bridges that gap at the MCI boundary.
 * 
 * SILO 2 Enhancement: Complete exception taxonomy mapping with:
 * - User-facing vs operator-facing classification
 * - Degraded mode triggers
 * - Constitutional violation handling
 * 
 * See: 00_GOVERNANCE/LIVE_ERROR_SEMANTICS_SPEC.md
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * CIA-SIE-PURE native error format (as received from HTTP responses)
 */
export interface CiaSieNativeError {
  detail: string;
  status: number;
}

/**
 * MCI CR-003 compliant error format
 * Implements WHAT/WHY/HOW structure for truthful cockpit display.
 */
export interface MciError {
  /** Machine-readable error code for programmatic handling */
  code: string;
  /** WHAT went wrong (brief statement) */
  what: string;
  /** WHY it went wrong (explanation) */
  why: string;
  /** HOW to fix it (actionable guidance) */
  how: string;
  /** Additional structured details */
  details?: Record<string, unknown>;
  /** Original HTTP status code */
  httpStatus: number;
  /** Whether this error indicates CIA-SIE-PURE is unavailable */
  isUnavailable: boolean;
  /** Whether this error is recoverable (retry might succeed) */
  isRecoverable: boolean;
}

// ============================================================================
// ERROR CODE MAPPINGS
// ============================================================================

/**
 * HTTP status to error code mapping
 */
const STATUS_TO_CODE: Record<number, string> = {
  400: 'CIA_SIE_VALIDATION_ERROR',
  401: 'CIA_SIE_AUTH_FAILED',
  403: 'CIA_SIE_FORBIDDEN',
  404: 'CIA_SIE_NOT_FOUND',
  409: 'CIA_SIE_CONFLICT',
  429: 'CIA_SIE_RATE_LIMITED',
  500: 'CIA_SIE_INTERNAL_ERROR',
  502: 'CIA_SIE_BAD_GATEWAY',
  503: 'CIA_SIE_UNAVAILABLE',
  504: 'CIA_SIE_TIMEOUT',
};

/**
 * WHAT templates by error code
 */
const WHAT_TEMPLATES: Record<string, string> = {
  CIA_SIE_VALIDATION_ERROR: 'Request validation failed',
  CIA_SIE_AUTH_FAILED: 'Authentication failed',
  CIA_SIE_FORBIDDEN: 'Access denied',
  CIA_SIE_NOT_FOUND: 'Resource not found',
  CIA_SIE_CONFLICT: 'Resource conflict',
  CIA_SIE_RATE_LIMITED: 'Rate limit exceeded',
  CIA_SIE_INTERNAL_ERROR: 'CIA-SIE-PURE internal error',
  CIA_SIE_BAD_GATEWAY: 'CIA-SIE-PURE connection failed',
  CIA_SIE_UNAVAILABLE: 'CIA-SIE-PURE is unavailable',
  CIA_SIE_TIMEOUT: 'CIA-SIE-PURE request timed out',
  CIA_SIE_NETWORK_ERROR: 'Network connection failed',
  CIA_SIE_UNKNOWN_ERROR: 'Unknown error occurred',
};

/**
 * HOW templates by error code (actionable remediation guidance)
 */
const HOW_TEMPLATES: Record<string, string> = {
  CIA_SIE_VALIDATION_ERROR: 'Check the request format against API documentation. Ensure all required fields are provided with valid values.',
  CIA_SIE_AUTH_FAILED: 'Verify webhook credentials are correctly configured. Check that the HMAC signature is computed correctly.',
  CIA_SIE_FORBIDDEN: 'This operation is not permitted. Contact system administrator if you believe this is an error.',
  CIA_SIE_NOT_FOUND: 'Verify the requested resource (instrument, silo, chart) exists in CIA-SIE-PURE. Check IDs and names.',
  CIA_SIE_CONFLICT: 'The resource already exists or is in a conflicting state. Try with a different identifier or resolve the conflict.',
  CIA_SIE_RATE_LIMITED: 'Wait at least 60 seconds before retrying. Consider reducing request frequency to avoid hitting limits.',
  CIA_SIE_INTERNAL_ERROR: 'This is a server-side issue. Try again in a few minutes. If the problem persists, check CIA-SIE-PURE logs.',
  CIA_SIE_BAD_GATEWAY: 'CIA-SIE-PURE may be restarting or unreachable. Verify the service is running and network connectivity is available.',
  CIA_SIE_UNAVAILABLE: 'CIA-SIE-PURE is temporarily unavailable. MCI is operating in degraded mode. Wait for the service to recover.',
  CIA_SIE_TIMEOUT: 'The request took too long to complete. This may indicate high load. Retry with a simpler request or wait.',
  CIA_SIE_NETWORK_ERROR: 'Unable to reach CIA-SIE-PURE. Check network connectivity and verify the service URL is correct.',
  CIA_SIE_UNKNOWN_ERROR: 'An unexpected error occurred. Review the error details and check CIA-SIE-PURE logs for more information.',
};

/**
 * Error codes that indicate CIA-SIE-PURE is unavailable
 */
const UNAVAILABLE_CODES = new Set([
  'CIA_SIE_BAD_GATEWAY',
  'CIA_SIE_UNAVAILABLE',
  'CIA_SIE_TIMEOUT',
  'CIA_SIE_NETWORK_ERROR',
]);

/**
 * Error codes that are recoverable (retry might succeed)
 */
const RECOVERABLE_CODES = new Set([
  'CIA_SIE_RATE_LIMITED',
  'CIA_SIE_INTERNAL_ERROR',
  'CIA_SIE_BAD_GATEWAY',
  'CIA_SIE_UNAVAILABLE',
  'CIA_SIE_TIMEOUT',
  'CIA_SIE_NETWORK_ERROR',
  'CIA_SIE_AI_UNAVAILABLE',
  'CIA_SIE_CONSTITUTIONAL_VIOLATION',
]);

// ============================================================================
// SILO 2: EXCEPTION-SPECIFIC MAPPINGS
// ============================================================================

/**
 * CIA-SIE-PURE exception class to error code mapping
 * These are detected from the error detail text patterns
 */
const EXCEPTION_PATTERNS: Array<{ pattern: RegExp; code: string }> = [
  { pattern: /instrument.*not found/i, code: 'CIA_SIE_INSTRUMENT_NOT_FOUND' },
  { pattern: /validation.*error|invalid.*field|missing.*required/i, code: 'CIA_SIE_VALIDATION_ERROR' },
  { pattern: /webhook.*invalid|signature.*verification.*failed|hmac/i, code: 'CIA_SIE_WEBHOOK_INVALID' },
  { pattern: /webhook.*not.*registered|unknown.*webhook/i, code: 'CIA_SIE_WEBHOOK_NOT_FOUND' },
  { pattern: /database.*error|db.*connection|sqlite/i, code: 'CIA_SIE_DATABASE_ERROR' },
  { pattern: /ai.*provider|claude.*api|anthropic|budget.*exhausted/i, code: 'CIA_SIE_AI_UNAVAILABLE' },
  { pattern: /constitutional.*violation|prohibited.*content/i, code: 'CIA_SIE_CONSTITUTIONAL_VIOLATION' },
  { pattern: /aggregation.*attempt|aggregate.*signals/i, code: 'CIA_SIE_AGGREGATION_BLOCKED' },
  { pattern: /recommendation.*attempt|prescriptive|you.*should/i, code: 'CIA_SIE_RECOMMENDATION_BLOCKED' },
  { pattern: /contradiction.*resolution|resolve.*contradiction/i, code: 'CIA_SIE_CONTRADICTION_RESOLUTION_BLOCKED' },
];

/**
 * Extended WHAT templates for exception-specific errors
 */
const EXCEPTION_WHAT_TEMPLATES: Record<string, string> = {
  CIA_SIE_INSTRUMENT_NOT_FOUND: 'Instrument not found',
  CIA_SIE_WEBHOOK_INVALID: 'Invalid webhook payload',
  CIA_SIE_WEBHOOK_NOT_FOUND: 'Webhook not registered',
  CIA_SIE_DATABASE_ERROR: 'Database operation failed',
  CIA_SIE_AI_UNAVAILABLE: 'AI service unavailable',
  CIA_SIE_CONSTITUTIONAL_VIOLATION: 'AI response validation failed',
  CIA_SIE_AGGREGATION_BLOCKED: 'Aggregation attempt blocked',
  CIA_SIE_RECOMMENDATION_BLOCKED: 'Recommendation attempt blocked',
  CIA_SIE_CONTRADICTION_RESOLUTION_BLOCKED: 'Contradiction resolution attempt blocked',
};

/**
 * Extended HOW templates for exception-specific errors
 */
const EXCEPTION_HOW_TEMPLATES: Record<string, string> = {
  CIA_SIE_INSTRUMENT_NOT_FOUND: 'Verify the instrument symbol and exchange are correct. Check that the instrument exists in CIA-SIE-PURE.',
  CIA_SIE_WEBHOOK_INVALID: 'Verify webhook configuration and HMAC secret. Ensure the payload signature is computed correctly.',
  CIA_SIE_WEBHOOK_NOT_FOUND: 'Register the webhook source in CIA-SIE-PURE configuration before sending signals.',
  CIA_SIE_DATABASE_ERROR: 'Check CIA-SIE-PURE database connectivity and integrity. The SQLite database may need recovery.',
  CIA_SIE_AI_UNAVAILABLE: 'Check AI service configuration and budget allocation. Claude API may be temporarily unavailable.',
  CIA_SIE_CONSTITUTIONAL_VIOLATION: 'Automatic retry will occur. If persistent, check prompt configuration in CIA-SIE-PURE.',
  CIA_SIE_AGGREGATION_BLOCKED: 'This is expected behavior. CR-001 requires signals to be displayed individually, not aggregated.',
  CIA_SIE_RECOMMENDATION_BLOCKED: 'This is expected behavior. CR-001 prohibits prescriptive language. Only observations are provided.',
  CIA_SIE_CONTRADICTION_RESOLUTION_BLOCKED: 'This is expected behavior. CR-002 requires contradictions to be exposed, not resolved.',
};

/**
 * Error audience classification
 */
export type ErrorAudience = 'user' | 'operator' | 'both';

/**
 * Extended error codes that are user-facing (shown in cockpit)
 */
const USER_FACING_CODES = new Set([
  'CIA_SIE_VALIDATION_ERROR',
  'CIA_SIE_NOT_FOUND',
  'CIA_SIE_RATE_LIMITED',
  'CIA_SIE_UNAVAILABLE',
  'CIA_SIE_TIMEOUT',
  'CIA_SIE_INSTRUMENT_NOT_FOUND',
]);

/**
 * Error codes that are operator-facing only (logs/Sentry)
 */
const OPERATOR_ONLY_CODES = new Set([
  'CIA_SIE_INTERNAL_ERROR',
  'CIA_SIE_DATABASE_ERROR',
  'CIA_SIE_CONSTITUTIONAL_VIOLATION',
  'CIA_SIE_AGGREGATION_BLOCKED',
  'CIA_SIE_RECOMMENDATION_BLOCKED',
  'CIA_SIE_CONTRADICTION_RESOLUTION_BLOCKED',
]);

/**
 * Error codes that should NOT trigger user notification
 * (constitutional violations are internal quality control)
 */
const SILENT_TO_USER_CODES = new Set([
  'CIA_SIE_CONSTITUTIONAL_VIOLATION',
  'CIA_SIE_AGGREGATION_BLOCKED',
  'CIA_SIE_RECOMMENDATION_BLOCKED',
  'CIA_SIE_CONTRADICTION_RESOLUTION_BLOCKED',
]);

// ============================================================================
// TRANSLATION FUNCTIONS
// ============================================================================

/**
 * Translate a CIA-SIE-PURE native error to MCI format.
 * 
 * @param native - The native error from CIA-SIE-PURE
 * @returns MCI CR-003 compliant error
 */
export function translateCiaSieError(native: CiaSieNativeError): MciError {
  const code = STATUS_TO_CODE[native.status] || 'CIA_SIE_UNKNOWN_ERROR';
  
  return {
    code,
    what: WHAT_TEMPLATES[code] || `CIA-SIE-PURE error (${native.status})`,
    why: native.detail || 'No additional details available',
    how: HOW_TEMPLATES[code] || 'Review the error details and retry the operation.',
    details: {
      originalStatus: native.status,
      originalDetail: native.detail,
    },
    httpStatus: native.status,
    isUnavailable: UNAVAILABLE_CODES.has(code),
    isRecoverable: RECOVERABLE_CODES.has(code),
  };
}

/**
 * Translate a network/fetch error to MCI format.
 * Use this when the request fails before receiving an HTTP response.
 * 
 * @param error - The JavaScript Error object
 * @returns MCI CR-003 compliant error
 */
export function translateNetworkError(error: Error): MciError {
  const code = 'CIA_SIE_NETWORK_ERROR';
  
  // Detect timeout errors
  const isTimeout = error.name === 'AbortError' || 
                    error.message.toLowerCase().includes('timeout') ||
                    error.message.toLowerCase().includes('timed out');
  
  const actualCode = isTimeout ? 'CIA_SIE_TIMEOUT' : code;
  
  return {
    code: actualCode,
    what: WHAT_TEMPLATES[actualCode],
    why: error.message || 'Unable to connect to CIA-SIE-PURE',
    how: HOW_TEMPLATES[actualCode],
    details: {
      errorName: error.name,
      errorMessage: error.message,
    },
    httpStatus: 0, // No HTTP response received
    isUnavailable: true,
    isRecoverable: true,
  };
}

/**
 * Create an MCI error from a raw Error thrown during CIA-SIE-PURE operations.
 * Attempts to parse as HTTP error first, falls back to network error.
 * 
 * @param error - Any error from CIA-SIE-PURE operations
 * @param defaultStatus - Default HTTP status if not determinable
 * @returns MCI CR-003 compliant error
 */
export function translateError(error: unknown, defaultStatus = 500): MciError {
  if (error instanceof Error) {
    // Check if it looks like an HTTP error message
    const statusMatch = error.message.match(/(\d{3})/);
    if (statusMatch) {
      return translateCiaSieError({
        detail: error.message,
        status: parseInt(statusMatch[1], 10),
      });
    }
    
    // Treat as network error
    return translateNetworkError(error);
  }
  
  // Unknown error type
  return translateCiaSieError({
    detail: String(error),
    status: defaultStatus,
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format an MCI error for console/log output.
 * 
 * @param error - The MCI error
 * @returns Formatted string for logging
 */
export function formatMciErrorForLog(error: MciError): string {
  return `[${error.code}] ${error.what}: ${error.why}`;
}

/**
 * Format an MCI error for user display (UI toast/modal).
 * 
 * @param error - The MCI error
 * @returns Object with title and body for display
 */
export function formatMciErrorForDisplay(error: MciError): { title: string; body: string; action: string } {
  return {
    title: error.what,
    body: error.why,
    action: error.how,
  };
}

/**
 * Check if an error should trigger degraded mode.
 * 
 * @param error - The MCI error
 * @returns true if MCI should enter degraded mode
 */
export function shouldEnterDegradedMode(error: MciError): boolean {
  return error.isUnavailable;
}

/**
 * Get retry delay in milliseconds based on error type.
 * 
 * @param error - The MCI error
 * @returns Recommended retry delay in ms, or 0 if should not retry
 */
export function getRetryDelay(error: MciError): number {
  if (!error.isRecoverable) {
    return 0;
  }
  
  switch (error.code) {
    case 'CIA_SIE_RATE_LIMITED':
      return 60000; // 60 seconds
    case 'CIA_SIE_TIMEOUT':
      return 5000; // 5 seconds
    case 'CIA_SIE_UNAVAILABLE':
    case 'CIA_SIE_BAD_GATEWAY':
      return 10000; // 10 seconds
    case 'CIA_SIE_INTERNAL_ERROR':
    case 'CIA_SIE_DATABASE_ERROR':
      return 30000; // 30 seconds
    case 'CIA_SIE_AI_UNAVAILABLE':
      return 15000; // 15 seconds
    case 'CIA_SIE_CONSTITUTIONAL_VIOLATION':
      return 0; // Automatic retry handled by CIA-SIE-PURE
    default:
      return 5000; // Default 5 seconds
  }
}

// ============================================================================
// SILO 2: EXTENDED TRANSLATION FUNCTIONS
// ============================================================================

/**
 * Detect exception type from error detail text.
 * CIA-SIE-PURE embeds exception information in the detail message.
 * 
 * @param detail - The error detail string
 * @returns Detected error code or null
 */
function detectExceptionType(detail: string): string | null {
  for (const { pattern, code } of EXCEPTION_PATTERNS) {
    if (pattern.test(detail)) {
      return code;
    }
  }
  return null;
}

/**
 * Enhanced translation with exception-specific handling.
 * 
 * @param native - The native error from CIA-SIE-PURE
 * @returns MCI CR-003 compliant error with enhanced classification
 */
export function translateCiaSieErrorEnhanced(native: CiaSieNativeError): MciError & { 
  audience: ErrorAudience;
  isSilentToUser: boolean;
} {
  // First, try to detect specific exception type from detail
  const detectedCode = detectExceptionType(native.detail);
  const code = detectedCode || STATUS_TO_CODE[native.status] || 'CIA_SIE_UNKNOWN_ERROR';
  
  // Get WHAT template (exception-specific or status-based)
  const what = EXCEPTION_WHAT_TEMPLATES[code] || 
               WHAT_TEMPLATES[code] || 
               `CIA-SIE-PURE error (${native.status})`;
  
  // Get HOW template (exception-specific or status-based)
  const how = EXCEPTION_HOW_TEMPLATES[code] || 
              HOW_TEMPLATES[code] || 
              'Review the error details and retry the operation.';
  
  // Determine audience
  let audience: ErrorAudience;
  if (USER_FACING_CODES.has(code) && !OPERATOR_ONLY_CODES.has(code)) {
    audience = 'user';
  } else if (OPERATOR_ONLY_CODES.has(code) && !USER_FACING_CODES.has(code)) {
    audience = 'operator';
  } else {
    audience = 'both';
  }
  
  return {
    code,
    what,
    why: native.detail || 'No additional details available',
    how,
    details: {
      originalStatus: native.status,
      originalDetail: native.detail,
      detectedExceptionType: detectedCode,
    },
    httpStatus: native.status,
    isUnavailable: UNAVAILABLE_CODES.has(code),
    isRecoverable: RECOVERABLE_CODES.has(code),
    audience,
    isSilentToUser: SILENT_TO_USER_CODES.has(code),
  };
}

/**
 * Get user-facing message for an error.
 * For silent errors, returns a generic "processing" message.
 * 
 * @param error - The enhanced MCI error
 * @returns User-facing message object
 */
export function getUserFacingMessage(error: MciError & { isSilentToUser?: boolean }): {
  title: string;
  body: string;
  action: string;
} | null {
  // Silent errors don't show to user
  if (error.isSilentToUser) {
    return null;
  }
  
  // Constitutional violations get special handling
  if (error.code === 'CIA_SIE_CONSTITUTIONAL_VIOLATION') {
    return {
      title: 'AI narrative is being regenerated',
      body: 'The initial response required refinement to meet quality standards.',
      action: 'Please wait a moment; this is automatic.',
    };
  }
  
  return {
    title: error.what,
    body: error.why,
    action: error.how,
  };
}

/**
 * Determine error severity for logging/alerting
 */
export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info';

/**
 * Get error severity for operator alerting.
 * 
 * @param error - The MCI error
 * @returns Severity level
 */
export function getErrorSeverity(error: MciError): ErrorSeverity {
  if (error.isUnavailable) {
    return 'critical';
  }
  
  switch (error.code) {
    case 'CIA_SIE_DATABASE_ERROR':
    case 'CIA_SIE_INTERNAL_ERROR':
      return 'error';
    case 'CIA_SIE_AI_UNAVAILABLE':
    case 'CIA_SIE_RATE_LIMITED':
      return 'warning';
    case 'CIA_SIE_CONSTITUTIONAL_VIOLATION':
    case 'CIA_SIE_AGGREGATION_BLOCKED':
    case 'CIA_SIE_RECOMMENDATION_BLOCKED':
    case 'CIA_SIE_CONTRADICTION_RESOLUTION_BLOCKED':
      return 'info'; // Expected behavior, not an error
    default:
      return 'warning';
  }
}

/**
 * Format error for operator logging with structured context.
 * 
 * @param error - The MCI error
 * @param context - Additional context
 * @returns Formatted log entry
 */
export function formatErrorForOperatorLog(
  error: MciError,
  context?: { endpoint?: string; requestId?: string }
): string {
  const severity = getErrorSeverity(error);
  const lines = [
    `[${severity.toUpperCase()}] [${error.code}] ${error.what}`,
    `  → Status: ${error.httpStatus}`,
    `  → Detail: ${error.why}`,
  ];
  
  if (context?.endpoint) {
    lines.push(`  → Endpoint: ${context.endpoint}`);
  }
  if (context?.requestId) {
    lines.push(`  → Request ID: ${context.requestId}`);
  }
  lines.push(`  → Timestamp: ${new Date().toISOString()}`);
  
  return lines.join('\n');
}
