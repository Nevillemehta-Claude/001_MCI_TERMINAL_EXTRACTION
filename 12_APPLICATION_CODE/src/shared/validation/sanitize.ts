/**
 * Centralized Input Sanitization Module
 * INV-006: Input Sanitization & Boundary Cleanliness
 *
 * This module provides the AUTHORITATIVE sanitization functions for all
 * externally supplied inputs. No raw user input may be used without
 * passing through these functions.
 *
 * INVARIANT GUARANTEES:
 * 1. All string inputs are trimmed of leading/trailing whitespace
 * 2. Control characters are rejected
 * 3. Empty-after-trim values are explicitly handled
 * 4. Protocol-unsafe characters are validated before use in headers/URLs
 */

/**
 * Control character regex (ASCII 0-31 and 127)
 */
const CONTROL_CHAR_REGEX = /[\x00-\x1F\x7F]/;

/**
 * Valid credential character regex (alphanumeric only)
 */
const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/;

/**
 * Valid user ID regex (2-3 letters followed by numbers)
 */
const USER_ID_REGEX = /^[A-Za-z]{2,3}[0-9]+$/;

// ============================================================================
// CORE SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Sanitize any string input by trimming whitespace.
 * This is the base sanitization applied to ALL string inputs.
 *
 * @param value - The input value (may be any type)
 * @returns Trimmed string, or empty string if input is not a string
 */
export function sanitizeString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

/**
 * Sanitize and validate that the result is non-empty.
 *
 * @param value - The input value
 * @param fieldName - Name of the field for error messages
 * @returns Sanitized non-empty string
 * @throws Error if value is empty after sanitization
 */
export function sanitizeRequiredString(value: unknown, fieldName: string): string {
  const sanitized = sanitizeString(value);
  if (!sanitized) {
    throw new Error(`${fieldName} is required and cannot be empty`);
  }
  return sanitized;
}

/**
 * Validate that a string contains no control characters.
 *
 * @param value - The string to validate
 * @param fieldName - Name of the field for error messages
 * @throws Error if control characters are found
 */
export function validateNoControlChars(value: string, fieldName: string): void {
  if (CONTROL_CHAR_REGEX.test(value)) {
    throw new Error(`${fieldName} contains invalid control characters`);
  }
}

/**
 * Validate that a string is safe for use in HTTP headers.
 * Headers must not contain control characters or leading/trailing whitespace.
 *
 * @param value - The string to validate
 * @param fieldName - Name of the field for error messages
 * @throws Error if value is unsafe for headers
 */
export function validateHeaderSafe(value: string, fieldName: string): void {
  // Check for leading/trailing whitespace (should already be trimmed, but verify)
  if (value !== value.trim()) {
    throw new Error(`${fieldName} contains leading or trailing whitespace`);
  }

  // Check for control characters
  validateNoControlChars(value, fieldName);

  // Check for newlines (could allow header injection)
  if (value.includes('\n') || value.includes('\r')) {
    throw new Error(`${fieldName} contains newline characters`);
  }
}

// ============================================================================
// CREDENTIAL-SPECIFIC SANITIZATION
// ============================================================================

/**
 * Sanitize and validate a Kite API Key.
 *
 * @param value - The raw API key input
 * @returns Sanitized API key
 * @throws Error if invalid
 */
export function sanitizeApiKey(value: unknown): string {
  const sanitized = sanitizeString(value);

  if (!sanitized) {
    throw new Error('API Key is required');
  }

  // Validate no control characters
  validateNoControlChars(sanitized, 'API Key');

  // Validate alphanumeric only
  if (!ALPHANUMERIC_REGEX.test(sanitized)) {
    throw new Error('API Key must contain only alphanumeric characters');
  }

  // Validate header-safe
  validateHeaderSafe(sanitized, 'API Key');

  return sanitized;
}

/**
 * Sanitize and validate a Kite Access Token.
 *
 * @param value - The raw access token input
 * @returns Sanitized access token
 * @throws Error if invalid
 */
export function sanitizeAccessToken(value: unknown): string {
  const sanitized = sanitizeString(value);

  if (!sanitized) {
    throw new Error('Access Token is required');
  }

  // Validate no control characters
  validateNoControlChars(sanitized, 'Access Token');

  // Validate alphanumeric only
  if (!ALPHANUMERIC_REGEX.test(sanitized)) {
    throw new Error('Access Token must contain only alphanumeric characters');
  }

  // Validate header-safe
  validateHeaderSafe(sanitized, 'Access Token');

  return sanitized;
}

/**
 * Sanitize and validate a Kite User ID.
 *
 * @param value - The raw user ID input
 * @returns Sanitized user ID
 * @throws Error if invalid
 */
export function sanitizeUserId(value: unknown): string {
  const sanitized = sanitizeString(value);

  if (!sanitized) {
    throw new Error('User ID is required');
  }

  // Validate no control characters
  validateNoControlChars(sanitized, 'User ID');

  // Validate format (2-3 letters + numbers, e.g., UYW879)
  if (!USER_ID_REGEX.test(sanitized)) {
    throw new Error('User ID format is invalid (expected format: AB1234 or ABC1234)');
  }

  return sanitized;
}

/**
 * Sanitize all Kite credentials at once.
 * Convenience function for validating a complete credential set.
 *
 * @param credentials - Object containing raw credentials
 * @returns Object with sanitized credentials
 * @throws Error if any credential is invalid
 */
export function sanitizeKiteCredentials(credentials: {
  apiKey: unknown;
  accessToken: unknown;
  userId: unknown;
}): {
  apiKey: string;
  accessToken: string;
  userId: string;
} {
  return {
    apiKey: sanitizeApiKey(credentials.apiKey),
    accessToken: sanitizeAccessToken(credentials.accessToken),
    userId: sanitizeUserId(credentials.userId),
  };
}

// ============================================================================
// HTTP PROTOCOL CONSTRUCTION HELPERS
// ============================================================================

/**
 * Construct a Kite Authorization header value safely.
 * This ensures the header is properly formatted with no whitespace issues.
 *
 * @param apiKey - Sanitized API key
 * @param accessToken - Sanitized access token
 * @returns Properly formatted Authorization header value
 */
export function buildKiteAuthHeader(apiKey: string, accessToken: string): string {
  // Re-validate inputs even though they should be sanitized
  // (defense in depth - never trust upstream)
  const cleanApiKey = apiKey.trim();
  const cleanToken = accessToken.trim();

  if (!cleanApiKey || !cleanToken) {
    throw new Error('Cannot build auth header with empty credentials');
  }

  // Construct header with exactly one space after 'token'
  return `token ${cleanApiKey}:${cleanToken}`;
}

// ============================================================================
// DEFENSIVE WRAPPERS FOR API BOUNDARIES
// ============================================================================

/**
 * Sanitize credentials received at an API boundary.
 * Use this at the entry point of any API route that receives credentials.
 *
 * @param body - The request body (may be any shape)
 * @returns Sanitized credentials or throws
 * 
 * NOTE: kiteUserId is optional for validation requests.
 * If provided, it must match the format; if not provided, returns empty string.
 */
export function sanitizeCredentialsFromRequest(body: unknown): {
  kiteApiKey: string;
  kiteAccessToken: string;
  kiteUserId: string;
} {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Invalid request body');
  }

  const rawBody = body as Record<string, unknown>;

  // User ID is optional - if not provided, return empty string
  // If provided, it must be valid
  let userId = '';
  if (rawBody.kiteUserId) {
    userId = sanitizeUserId(rawBody.kiteUserId);
  }

  return {
    kiteApiKey: sanitizeApiKey(rawBody.kiteApiKey),
    kiteAccessToken: sanitizeAccessToken(rawBody.kiteAccessToken),
    kiteUserId: userId,
  };
}
