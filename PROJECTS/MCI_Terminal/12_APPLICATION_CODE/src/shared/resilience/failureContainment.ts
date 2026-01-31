/**
 * Failure Containment Implementation
 * 
 * SILO 5: Track and contain failures to prevent cascade.
 * 
 * CONSTRAINT: This module provides failure tracking and containment
 * primitives. It does NOT automatically quarantine components.
 * Consuming code decides when to use containment information.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Record of a failure event
 */
export interface FailureRecord {
  /** Unique failure ID */
  id: string;
  /** Timestamp of failure */
  timestamp: number;
  /** Source component/operation */
  source: string;
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Whether this failure is recoverable */
  recoverable: boolean;
  /** Additional context */
  context?: Record<string, unknown>;
}

/**
 * Failure containment state
 */
export interface FailureContainmentState {
  /** Recent failures (sliding window) */
  recentFailures: FailureRecord[];
  /** Failure count by source */
  failuresBySource: Map<string, number>;
  /** Sources currently in containment */
  containedSources: Set<string>;
  /** Total failure count */
  totalFailures: number;
  /** Timestamp of last failure */
  lastFailureAt: number | null;
}

/**
 * Containment configuration
 */
export interface FailureContainmentConfig {
  /** Maximum failures before containment */
  containmentThreshold: number;
  /** Window for counting failures (ms) */
  windowMs: number;
  /** Time in containment before release (ms) */
  containmentDurationMs: number;
  /** Maximum failures to track */
  maxTrackedFailures: number;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: FailureContainmentConfig = {
  containmentThreshold: 5,
  windowMs: 60000, // 1 minute
  containmentDurationMs: 300000, // 5 minutes
  maxTrackedFailures: 100,
};

// ============================================================================
// FAILURE CONTAINMENT CLASS
// ============================================================================

/**
 * Failure Containment manager.
 * 
 * Tracks failures and determines when sources should be contained.
 * Does NOT automatically prevent operations — consuming code decides.
 */
export class FailureContainment {
  private config: FailureContainmentConfig;
  private failures: FailureRecord[] = [];
  private failuresBySource: Map<string, number> = new Map();
  private containedSources: Map<string, number> = new Map(); // source → containment start time
  private totalFailures: number = 0;
  private lastFailureAt: number | null = null;

  constructor(config: Partial<FailureContainmentConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Record a failure.
   */
  recordFailure(failure: Omit<FailureRecord, 'id' | 'timestamp'>): FailureRecord {
    const record: FailureRecord = {
      ...failure,
      id: `fail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    // Add to recent failures
    this.failures.push(record);
    this.totalFailures++;
    this.lastFailureAt = record.timestamp;

    // Update source count
    const sourceCount = (this.failuresBySource.get(record.source) || 0) + 1;
    this.failuresBySource.set(record.source, sourceCount);

    // Check for containment
    this.checkContainment(record.source);

    // Prune old failures
    this.pruneOldFailures();

    return record;
  }

  /**
   * Check if a source should be contained.
   */
  private checkContainment(source: string): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Count recent failures for this source
    const recentCount = this.failures.filter(
      f => f.source === source && f.timestamp >= windowStart
    ).length;

    if (recentCount >= this.config.containmentThreshold) {
      this.containedSources.set(source, now);
      console.warn(`[FailureContainment] Source '${source}' contained after ${recentCount} failures`);
    }
  }

  /**
   * Check if a source is currently contained.
   */
  isContained(source: string): boolean {
    const containmentStart = this.containedSources.get(source);
    if (!containmentStart) {
      return false;
    }

    const now = Date.now();
    if (now - containmentStart >= this.config.containmentDurationMs) {
      // Release from containment
      this.containedSources.delete(source);
      console.info(`[FailureContainment] Source '${source}' released from containment`);
      return false;
    }

    return true;
  }

  /**
   * Get time remaining in containment for a source.
   */
  getContainmentTimeRemaining(source: string): number {
    const containmentStart = this.containedSources.get(source);
    if (!containmentStart) {
      return 0;
    }

    const elapsed = Date.now() - containmentStart;
    const remaining = this.config.containmentDurationMs - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Record a success (reduces failure count for source).
   */
  recordSuccess(source: string): void {
    const count = this.failuresBySource.get(source) || 0;
    if (count > 0) {
      this.failuresBySource.set(source, count - 1);
    }
  }

  /**
   * Manually release a source from containment.
   */
  releaseContainment(source: string): void {
    this.containedSources.delete(source);
    console.info(`[FailureContainment] Source '${source}' manually released`);
  }

  /**
   * Get current state snapshot.
   */
  getState(): FailureContainmentState {
    return {
      recentFailures: [...this.failures],
      failuresBySource: new Map(this.failuresBySource),
      containedSources: new Set(this.containedSources.keys()),
      totalFailures: this.totalFailures,
      lastFailureAt: this.lastFailureAt,
    };
  }

  /**
   * Get failures for a specific source.
   */
  getFailuresForSource(source: string): FailureRecord[] {
    return this.failures.filter(f => f.source === source);
  }

  /**
   * Get all contained sources.
   */
  getContainedSources(): string[] {
    // Check and release expired containments
    const now = Date.now();
    for (const [source, start] of this.containedSources.entries()) {
      if (now - start >= this.config.containmentDurationMs) {
        this.containedSources.delete(source);
      }
    }
    return Array.from(this.containedSources.keys());
  }

  /**
   * Reset all tracking.
   */
  reset(): void {
    this.failures = [];
    this.failuresBySource.clear();
    this.containedSources.clear();
    this.totalFailures = 0;
    this.lastFailureAt = null;
  }

  /**
   * Prune old failures outside the tracking window.
   */
  private pruneOldFailures(): void {
    const cutoff = Date.now() - this.config.windowMs;
    this.failures = this.failures
      .filter(f => f.timestamp >= cutoff)
      .slice(-this.config.maxTrackedFailures);
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a failure containment instance.
 * 
 * CONSTRAINT: Returns an instance that must be explicitly used.
 * Does NOT auto-wire to any operations.
 */
export function createFailureContainment(
  config: Partial<FailureContainmentConfig> = {}
): FailureContainment {
  return new FailureContainment(config);
}
