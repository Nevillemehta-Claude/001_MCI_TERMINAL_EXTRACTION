/**
 * MCI State Management (Zustand)
 *
 * Stores:
 * - tokenStore: API credential management
 * - scannerStore: Pre-ignition check state
 * - ignitionStore: Backend selection and ignition control
 * - telemetryStore: Real-time system data
 * - shutdownStore: Shutdown procedure state
 */

export { useTokenStore } from './tokenStore';
export { useScannerStore } from './scannerStore';
export { useIgnitionStore } from './ignitionStore';
export { useTelemetryStore } from './telemetryStore';
export { useShutdownStore } from './shutdownStore';

// Re-export types
export type { TokenState } from './tokenStore';
export type { ScannerState, ScanCheck, ScanStatus } from './scannerStore';
export type { IgnitionState, IgnitionPhase, BackendType, BackendConfig } from './ignitionStore';
export type {
  TelemetryState,
  Position,
  Order,
  AccountMetrics,
  SystemHealth,
  MarketData,
} from './telemetryStore';
export type { ShutdownState, ShutdownPhase, ShutdownStep } from './shutdownStore';
