/**
 * Errors Module - Central Export
 * 
 * BLOCK-003: Error translation layer for CIA-SIE-PURE
 * SILO 2: Enhanced error semantics with audience classification
 */

export {
  // Types
  type CiaSieNativeError,
  type MciError,
  type ErrorAudience,
  type ErrorSeverity,
  
  // Translation functions (original)
  translateCiaSieError,
  translateNetworkError,
  translateError,
  
  // SILO 2: Enhanced translation functions
  translateCiaSieErrorEnhanced,
  getUserFacingMessage,
  getErrorSeverity,
  formatErrorForOperatorLog,
  
  // Formatting utilities
  formatMciErrorForLog,
  formatMciErrorForDisplay,
  
  // Decision utilities
  shouldEnterDegradedMode,
  getRetryDelay,
} from './ciaSieErrorTranslator';
