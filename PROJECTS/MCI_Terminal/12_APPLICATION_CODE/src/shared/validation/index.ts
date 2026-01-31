/**
 * Validation Module - Central Export
 * INV-006: Input Sanitization & Boundary Cleanliness
 */

export {
  // Core sanitization
  sanitizeString,
  sanitizeRequiredString,
  validateNoControlChars,
  validateHeaderSafe,

  // Credential-specific
  sanitizeApiKey,
  sanitizeAccessToken,
  sanitizeUserId,
  sanitizeKiteCredentials,

  // HTTP helpers
  buildKiteAuthHeader,

  // API boundary helpers
  sanitizeCredentialsFromRequest,

  // CIA-SIE-PURE boundary sanitization (BLOCK-001)
  sanitizeCiaSieString,
  sanitizeCiaSieResponse,
  validateCiaSieString,
} from './sanitize';
