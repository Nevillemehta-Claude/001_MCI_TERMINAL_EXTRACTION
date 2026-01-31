/**
 * Timeout Configuration & Enforcement
 * 
 * SILO 4: Production-grade timeout handling for all external operations.
 * 
 * CONSTRAINT: Timeout wrappers are provided but operations are NOT
 * automatically wrapped. Consuming code decides when to apply timeouts.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
  /** Timeout duration in milliseconds */
  timeoutMs: number;
  /** Optional abort signal to chain */
  signal?: AbortSignal;
}

/**
 * Result of a timeout-wrapped operation
 */
export interface TimeoutResult<T> {
  /** Whether the operation completed before timeout */
  success: boolean;
  /** The result if successful */
  result?: T;
  /** Error if failed or timed out */
  error?: Error;
  /** Whether this was a timeout */
  timedOut: boolean;
  /** Actual duration in milliseconds */
  durationMs: number;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default timeout configuration for health checks
 */
export const DEFAULT_TIMEOUT_CONFIG: TimeoutConfig = {
  timeoutMs: 5000, // 5 seconds
};

/**
 * Timeout configurations by operation type
 */
export const TIMEOUT_CONFIGS = {
  healthCheck: { timeoutMs: 5000 },
  telemetryFetch: { timeoutMs: 10000 },
  aiNarrative: { timeoutMs: 60000 },
  signalFetch: { timeoutMs: 10000 },
} as const;

// ============================================================================
// TIMEOUT UTILITIES
// ============================================================================

/**
 * Create an AbortController with automatic timeout.
 * 
 * @param timeoutMs - Timeout duration in milliseconds
 * @returns Object with controller, signal, and cleanup function
 */
export function createTimeoutController(timeoutMs: number): {
  controller: AbortController;
  signal: AbortSignal;
  cleanup: () => void;
} {
  const controller = new AbortController();
  
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Operation timed out after ${timeoutMs}ms`));
  }, timeoutMs);
  
  const cleanup = () => {
    clearTimeout(timeoutId);
  };
  
  return {
    controller,
    signal: controller.signal,
    cleanup,
  };
}

/**
 * Wrap an async operation with a timeout.
 * 
 * USAGE NOTE: This is a utility function. It does NOT automatically
 * apply to any operations. Consuming code must explicitly wrap operations.
 * 
 * @param operation - Async function to wrap
 * @param config - Timeout configuration
 * @returns Promise that rejects on timeout
 */
export async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  config: TimeoutConfig = DEFAULT_TIMEOUT_CONFIG
): Promise<TimeoutResult<T>> {
  const startTime = performance.now();
  const { controller, signal, cleanup } = createTimeoutController(config.timeoutMs);
  
  // Chain with external signal if provided
  if (config.signal) {
    config.signal.addEventListener('abort', () => {
      controller.abort(config.signal!.reason);
    });
  }
  
  try {
    const result = await operation(signal);
    cleanup();
    
    return {
      success: true,
      result,
      timedOut: false,
      durationMs: Math.round(performance.now() - startTime),
    };
  } catch (error) {
    cleanup();
    const durationMs = Math.round(performance.now() - startTime);
    const isTimeout = signal.aborted && 
      (error instanceof Error && error.message.includes('timed out'));
    
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      timedOut: isTimeout,
      durationMs,
    };
  }
}

/**
 * Create a timeout-aware fetch wrapper.
 * 
 * CONSTRAINT: This is a factory function. It does NOT replace fetch globally.
 * Consuming code must explicitly use the returned function.
 * 
 * @param defaultTimeoutMs - Default timeout for all fetches
 * @returns Fetch function with timeout
 */
export function createTimeoutFetch(defaultTimeoutMs: number = 5000) {
  return async function timeoutFetch(
    url: string,
    options: RequestInit & { timeoutMs?: number } = {}
  ): Promise<Response> {
    const { timeoutMs = defaultTimeoutMs, ...fetchOptions } = options;
    const { signal, cleanup } = createTimeoutController(timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal,
      });
      cleanup();
      return response;
    } catch (error) {
      cleanup();
      throw error;
    }
  };
}
