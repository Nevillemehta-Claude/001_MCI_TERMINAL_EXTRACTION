/**
 * Client Hooks - Central Export
 * 
 * COCKPIT INTEGRITY: These hooks provide REAL system state to UI components.
 */

export { useBackendHealth } from './useBackendHealth';
export type { BackendHealthStatus } from './useBackendHealth';

export { useNetworkStatus } from './useNetworkStatus';
export type { NetworkStatus } from './useNetworkStatus';

export { useErrorAggregator } from './useErrorAggregator';
export type { ErrorAggregation, ErrorEntry } from './useErrorAggregator';

// CIA-SIE-PURE Health - MINIMAL INTEGRATION (health visibility only)
export { useCiaSieHealth } from './useCiaSieHealth';
export type { CiaSieHealthState, EngineConnectionStatus, UseCiaSieHealthOptions } from './useCiaSieHealth';
