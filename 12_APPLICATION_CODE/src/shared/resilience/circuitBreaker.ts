/**
 * Circuit Breaker Implementation
 * 
 * SILO 5: Failure containment through circuit breaking.
 * 
 * CONSTRAINT: This circuit breaker is IMPLEMENTED but NOT ACTIVATED.
 * It must be explicitly instantiated and wired by consuming code.
 * By default, nothing uses it.
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Failing, requests are rejected immediately
 * - HALF_OPEN: Testing if service has recovered
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Circuit breaker states
 */
export type CircuitState = 'closed' | 'open' | 'half_open';

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in ms before attempting recovery */
  recoveryTimeout: number;
  /** Number of successes in half-open to close */
  successThreshold: number;
  /** Optional name for logging */
  name?: string;
}

/**
 * Circuit breaker state snapshot
 */
export interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: number | null;
  lastSuccess: number | null;
  lastStateChange: number;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

/**
 * Default circuit breaker configuration.
 * Conservative settings for external service calls.
 */
export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,      // Open after 5 failures
  recoveryTimeout: 30000,   // Try recovery after 30 seconds
  successThreshold: 2,      // Close after 2 successes in half-open
  name: 'default',
};

// ============================================================================
// CIRCUIT BREAKER CLASS
// ============================================================================

/**
 * Circuit Breaker implementation.
 * 
 * USAGE: 
 * ```typescript
 * const breaker = new CircuitBreaker({ name: 'cia-sie' });
 * 
 * // Wrap operations
 * const result = await breaker.execute(() => fetchFromEngine());
 * ```
 * 
 * CONSTRAINT: Must be explicitly instantiated. Does NOT auto-wrap anything.
 */
export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitState = 'closed';
  private failures: number = 0;
  private successes: number = 0;
  private lastFailure: number | null = null;
  private lastSuccess: number | null = null;
  private lastStateChange: number = Date.now();

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
  }

  /**
   * Get current state snapshot.
   */
  getState(): CircuitBreakerState {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      lastSuccess: this.lastSuccess,
      lastStateChange: this.lastStateChange,
    };
  }

  /**
   * Check if the circuit allows requests.
   */
  isAllowed(): boolean {
    if (this.state === 'closed') {
      return true;
    }

    if (this.state === 'open') {
      // Check if recovery timeout has passed
      const now = Date.now();
      if (now - this.lastStateChange >= this.config.recoveryTimeout) {
        this.transitionTo('half_open');
        return true;
      }
      return false;
    }

    // half_open - allow limited requests
    return true;
  }

  /**
   * Record a successful operation.
   */
  recordSuccess(): void {
    this.lastSuccess = Date.now();

    if (this.state === 'half_open') {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.transitionTo('closed');
      }
    } else if (this.state === 'closed') {
      // Reset failure count on success
      this.failures = 0;
    }
  }

  /**
   * Record a failed operation.
   */
  recordFailure(): void {
    this.lastFailure = Date.now();
    this.failures++;

    if (this.state === 'half_open') {
      // Any failure in half-open goes back to open
      this.transitionTo('open');
    } else if (this.state === 'closed') {
      if (this.failures >= this.config.failureThreshold) {
        this.transitionTo('open');
      }
    }
  }

  /**
   * Execute an operation through the circuit breaker.
   * 
   * @param operation - Async operation to execute
   * @returns Result of the operation
   * @throws CircuitOpenError if circuit is open
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.isAllowed()) {
      throw new CircuitOpenError(
        `Circuit breaker '${this.config.name}' is open`,
        this.getState()
      );
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Force the circuit to a specific state.
   * Used for testing or manual intervention.
   */
  forceState(state: CircuitState): void {
    this.transitionTo(state);
  }

  /**
   * Reset the circuit breaker to initial state.
   */
  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
    this.lastFailure = null;
    this.lastSuccess = null;
    this.lastStateChange = Date.now();
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.lastStateChange = Date.now();

    if (newState === 'closed') {
      this.failures = 0;
      this.successes = 0;
    } else if (newState === 'half_open') {
      this.successes = 0;
    }

    // Log state transition (observable but not enforced)
    console.debug(
      `[CircuitBreaker:${this.config.name}] ${oldState} → ${newState}`
    );
  }
}

// ============================================================================
// ERROR CLASS
// ============================================================================

/**
 * Error thrown when circuit is open.
 */
export class CircuitOpenError extends Error {
  readonly state: CircuitBreakerState;

  constructor(message: string, state: CircuitBreakerState) {
    super(message);
    this.name = 'CircuitOpenError';
    this.state = state;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a circuit breaker with the given configuration.
 * 
 * CONSTRAINT: Factory returns an INACTIVE circuit breaker.
 * It must be explicitly used by consuming code.
 */
export function createCircuitBreaker(
  config: Partial<CircuitBreakerConfig> = {}
): CircuitBreaker {
  return new CircuitBreaker(config);
}
