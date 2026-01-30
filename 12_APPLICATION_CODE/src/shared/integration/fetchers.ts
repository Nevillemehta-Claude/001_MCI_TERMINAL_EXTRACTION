/**
 * Dark Integration Fetchers
 * 
 * SILO 7: Fetcher interfaces and null implementations.
 * 
 * CONSTRAINT: All fetchers are NO-OP when DARK_MODE is true.
 * They define the interface but execute nothing.
 */

import { DARK_MODE } from './index';
import type { 
  CiaSieSignal, 
  CiaSieNarrative, 
  CiaSieEngineObservation 
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Telemetry fetcher interface
 */
export interface TelemetryFetcher {
  /** Fetch telemetry snapshot */
  fetch(): Promise<CiaSieEngineObservation | null>;
  /** Whether fetcher is enabled */
  isEnabled(): boolean;
}

/**
 * Signal fetcher interface
 */
export interface SignalFetcher {
  /** Fetch signals for a chart */
  fetchForChart(chartId: string): Promise<CiaSieSignal[]>;
  /** Fetch all recent signals */
  fetchRecent(limit?: number): Promise<CiaSieSignal[]>;
  /** Whether fetcher is enabled */
  isEnabled(): boolean;
}

/**
 * Narrative fetcher interface
 */
export interface NarrativeFetcher {
  /** Fetch narrative for a chart */
  fetchForChart(chartId: string): Promise<CiaSieNarrative | null>;
  /** Fetch narrative for a silo */
  fetchForSilo(siloId: string): Promise<CiaSieNarrative | null>;
  /** Whether fetcher is enabled */
  isEnabled(): boolean;
}

// ============================================================================
// NULL IMPLEMENTATIONS
// ============================================================================

/**
 * Null telemetry fetcher - returns nothing.
 */
class NullTelemetryFetcher implements TelemetryFetcher {
  async fetch(): Promise<CiaSieEngineObservation | null> {
    // No-op: Returns null observation
    return null;
  }

  isEnabled(): boolean {
    return false;
  }
}

/**
 * Null signal fetcher - returns empty arrays.
 */
class NullSignalFetcher implements SignalFetcher {
  async fetchForChart(_chartId: string): Promise<CiaSieSignal[]> {
    // No-op: Returns empty array
    return [];
  }

  async fetchRecent(_limit?: number): Promise<CiaSieSignal[]> {
    // No-op: Returns empty array
    return [];
  }

  isEnabled(): boolean {
    return false;
  }
}

/**
 * Null narrative fetcher - returns null.
 */
class NullNarrativeFetcher implements NarrativeFetcher {
  async fetchForChart(_chartId: string): Promise<CiaSieNarrative | null> {
    // No-op: Returns null
    return null;
  }

  async fetchForSilo(_siloId: string): Promise<CiaSieNarrative | null> {
    // No-op: Returns null
    return null;
  }

  isEnabled(): boolean {
    return false;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a null (disabled) fetcher.
 * 
 * CONSTRAINT: Always returns null implementations when DARK_MODE is true.
 * 
 * @param type - Type of fetcher to create
 * @returns Null fetcher
 */
export function createNullFetcher<T extends 'telemetry' | 'signal' | 'narrative'>(
  type: T
): T extends 'telemetry' ? TelemetryFetcher :
   T extends 'signal' ? SignalFetcher :
   NarrativeFetcher {
  
  if (!DARK_MODE) {
    console.warn('[Integration] Creating fetcher with DARK_MODE disabled!');
  }

  switch (type) {
    case 'telemetry':
      return new NullTelemetryFetcher() as never;
    case 'signal':
      return new NullSignalFetcher() as never;
    case 'narrative':
      return new NullNarrativeFetcher() as never;
    default:
      throw new Error(`Unknown fetcher type: ${type}`);
  }
}

/**
 * Create all null fetchers.
 * 
 * CONSTRAINT: Returns disabled fetchers only.
 */
export function createNullFetchers(): {
  telemetry: TelemetryFetcher;
  signal: SignalFetcher;
  narrative: NarrativeFetcher;
} {
  return {
    telemetry: new NullTelemetryFetcher(),
    signal: new NullSignalFetcher(),
    narrative: new NullNarrativeFetcher(),
  };
}
