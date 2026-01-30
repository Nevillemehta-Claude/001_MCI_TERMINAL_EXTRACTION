/**
 * Retry Policy Implementation
 * 
 * SILO 5: Declarative retry policies with exponential backoff.
 * 
 * CONSTRAINT: These policies are DECLARED but NOT automatically USED.
 * Consuming code must explicitly wrap operations with retry logic.
 * Nothing is auto-retried.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial delay in milliseconds */
  initialDelayMs: number;
  /** Maximum delay in milliseconds */
  maxDelayMs: number;
  /** Backoff multiplier */
  backoffMultiplier: number;
  /** Whether to add jitter */
  jitter: boolean;
  /** Function to determine if error is retryable */
  isRetryable?: (error: Error) => boolean;
}

/**
 * Result of a retry operation
 */
export interface RetryResult<T> {
  /** Whether the operation eventually succeeded */
  success: boolean;
  /** The result if successful */
  result?: T;
  /** The final error if all retries failed */
  error?: Error;
  /** Total number of attempts */
  attempts: number;
  /** Total time spent in milliseconds */
  totalTimeMs: number;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

/**
 * Default retry configuration.
 * Conservative settings with exponential backoff.
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * Retry configurations by operation type.
 * DECLARED but NOT automatically applied.
 */
export const RETRY_CONFIGS = {
  healthCheck: {
    maxAttempts: 2,
    initialDelayMs: 500,
    maxDelayMs: 2000,
    backoffMultiplier: 2,
    jitter: false,
  },
  telemetryFetch: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    jitter: true,
  },
  aiNarrative: {
    maxAttempts: 1, // AI retries are handled by CIA-SIE-PURE
    initialDelayMs: 0,
    maxDelayMs: 0,
    backoffMultiplier: 1,
    jitter: false,
  },
} as const;

// ============================================================================
// BACKOFF CALCULATION
// ============================================================================

/**
 * Calculate delay for a specific retry attempt.
 * 
 * @param attempt - Current attempt number (1-based)
 * @param config - Retry configuration
 * @returns Delay in milliseconds
 */
export function calculateBackoff(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  // Exponential backoff
  const exponentialDelay = config.initialDelayMs * 
    Math.pow(config.backoffMultiplier, attempt - 1);
  
  // Cap at maximum
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);
  
  // Add jitter if enabled (±25%)
  if (config.jitter) {
    const jitterFactor = 0.75 + Math.random() * 0.5; // 0.75 to 1.25
    return Math.round(cappedDelay * jitterFactor);
  }
  
  return Math.round(cappedDelay);
}

/**
 * Determine if an error should trigger a retry.
 * 
 * @param error - The error that occurred
 * @param config - Retry configuration
 * @returns Whether to retry
 */
export function shouldRetry(
  error: Error,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): boolean {
  // Use custom function if provided
  if (config.isRetryable) {
    return config.isRetryable(error);
  }
  
  // Default: retry network and timeout errors
  const retryablePatterns = [
    /network/i,
    /timeout/i,
    /timed out/i,
    /connection/i,
    /ECONNREFUSED/,
    /ENOTFOUND/,
    /503/,
    /502/,
    /504/,
  ];
  
  return retryablePatterns.some(pattern => 
    pattern.test(error.message) || pattern.test(error.name)
  );
}

// ============================================================================
// RETRY WRAPPER
// ============================================================================

/**
 * Wrap an async operation with retry logic.
 * 
 * CONSTRAINT: This is an explicit wrapper. It does NOT auto-apply
 * to any operations. Consuming code must explicitly use it.
 * 
 * @param operation - Async function to retry
 * @param config - Retry configuration
 * @returns Retry result
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<RetryResult<T>> {
  const startTime = performance.now();
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const result = await operation();
      
      return {
        success: true,
        result,
        attempts: attempt,
        totalTimeMs: Math.round(performance.now() - startTime),
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry
      const isLastAttempt = attempt === config.maxAttempts;
      const canRetry = !isLastAttempt && shouldRetry(lastError, config);
      
      if (!canRetry) {
        break;
      }
      
      // Wait before next attempt
      const delay = calculateBackoff(attempt, config);
      await sleep(delay);
    }
  }
  
  return {
    success: false,
    error: lastError,
    attempts: config.maxAttempts,
    totalTimeMs: Math.round(performance.now() - startTime),
  };
}

/**
 * Sleep for the specified duration.
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a retryable version of an async function.
 * 
 * CONSTRAINT: Returns a wrapped function that is NOT called automatically.
 * 
 * @param fn - Async function to wrap
 * @param config - Retry configuration
 * @returns Wrapped function with retry logic
 */
export function createRetryable<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): (...args: Parameters<T>) => Promise<RetryResult<Awaited<ReturnType<T>>>> {
  return async (...args: Parameters<T>) => {
    return withRetry(() => fn(...args) as Promise<Awaited<ReturnType<T>>>, config);
  };
}
