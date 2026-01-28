/**
 * useErrorAggregator Hook
 * 
 * COCKPIT INTEGRITY: Aggregates and exposes error counts to the operator.
 * 
 * GAP-05: Surfaces error accumulation during runtime.
 */

import { useState, useCallback, useEffect } from 'react';

export interface ErrorEntry {
  id: string;
  timestamp: number;
  message: string;
  source: string;
}

export interface ErrorAggregation {
  /** Total errors in the current session */
  totalCount: number;
  /** Errors in the last N minutes */
  recentCount: number;
  /** Time window for "recent" errors (ms) */
  recentWindow: number;
  /** Most recent error */
  lastError: ErrorEntry | null;
  /** All errors (up to limit) */
  errors: ErrorEntry[];
  /** Error rate (errors per minute) */
  errorRate: number;
}

interface UseErrorAggregatorOptions {
  /** Time window for "recent" errors in ms (default: 5 minutes) */
  recentWindow?: number;
  /** Maximum errors to keep in memory (default: 100) */
  maxErrors?: number;
}

/**
 * Hook to aggregate and track errors for cockpit visibility.
 */
export function useErrorAggregator(options: UseErrorAggregatorOptions = {}) {
  const {
    recentWindow = 5 * 60 * 1000, // 5 minutes
    maxErrors = 100,
  } = options;

  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [sessionStart] = useState(() => Date.now());

  const addError = useCallback((message: string, source: string = 'unknown') => {
    const entry: ErrorEntry = {
      id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      message,
      source,
    };

    setErrors(prev => [entry, ...prev].slice(0, maxErrors));
  }, [maxErrors]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Calculate aggregation
  const now = Date.now();
  const recentErrors = errors.filter(e => now - e.timestamp < recentWindow);
  const sessionDurationMinutes = Math.max(1, (now - sessionStart) / 60000);
  const errorRate = errors.length / sessionDurationMinutes;

  const aggregation: ErrorAggregation = {
    totalCount: errors.length,
    recentCount: recentErrors.length,
    recentWindow,
    lastError: errors[0] || null,
    errors,
    errorRate: Math.round(errorRate * 100) / 100,
  };

  // Global error listener
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      addError(event.message, 'window');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addError(
        event.reason?.message || 'Unhandled promise rejection',
        'promise'
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [addError]);

  return {
    ...aggregation,
    addError,
    clearErrors,
  };
}

export default useErrorAggregator;
