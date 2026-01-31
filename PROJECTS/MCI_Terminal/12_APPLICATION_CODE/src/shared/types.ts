/**
 * MCI Shared Types
 * Constitutional Compliance: All types enforce CR-001 through CR-005
 */

// ============================================================================
// TOKEN TYPES (CR-004: Token Lifecycle Accuracy)
// ============================================================================

export type TokenStatus = 'absent' | 'validating' | 'valid' | 'warning' | 'critical' | 'expired';

export interface TokenState {
  token: string | null;
  status: TokenStatus;
  validatedAt: number | null;
  expiresAt: number | null; // 6:00 AM IST - SACRED (CR-004)
  remainingMs: number | null;
}

export interface TokenValidationResult {
  valid: boolean;
  expiresAt: number;
  message: string;
  error?: {
    what: string;
    why: string;
    how: string;
  };
}

// ============================================================================
// SCANNER TYPES (Phase 1: Pre-Ignition Scanner)
// ============================================================================

export type ScanStatus = 'pending' | 'running' | 'pass' | 'warning' | 'fail';

export interface ScanCheck {
  id: string;
  name: string;
  status: ScanStatus;
  message?: string;
  duration?: number;
}

export interface ScannerState {
  checks: ScanCheck[];
  isRunning: boolean;
  allPassed: boolean;
  lastRunAt: number | null;
  totalDuration: number | null;
}

// ============================================================================
// BACKEND TYPES (Phase 2: Ignition)
// ============================================================================

export type BackendId = 'icici' | 'hdfc' | 'kotak' | 'zerodha';

export interface Backend {
  id: BackendId;
  name: string;
  displayName: string;
  logo: string;
  status: 'online' | 'offline' | 'degraded';
  selected: boolean;
  lastPingAt: number | null;
  latencyMs: number | null;
}

export interface IgnitionState {
  backends: Backend[];
  phase: 'pre-ignition' | 'igniting' | 'running' | 'shutdown';
  ignitedAt: number | null;
}

// ============================================================================
// DASHBOARD TYPES (Phase 3: Telemetry)
// ============================================================================

// CR-002: Expose Contradictions - Position can have conflicts
export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  backend: BackendId;
  hasConflict?: boolean;
  conflictDetails?: string;
}

export interface Order {
  orderId: string;
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'sl' | 'sl-m';
  quantity: number;
  price: number;
  status: 'open' | 'executed' | 'cancelled' | 'rejected';
  backend: BackendId;
  placedAt: number;
  executedAt?: number;
}

export interface PnLSummary {
  realizedPnL: number;
  unrealizedPnL: number;
  totalPnL: number;
  charges: number;
  netPnL: number;
  lastUpdatedAt: number;
}

// CR-003: Descriptive AI Only - Observations, NOT recommendations
export interface AIObservation {
  id: string;
  timestamp: number;
  type: 'observation' | 'status' | 'alert';
  message: string; // MUST be descriptive only, NEVER prescriptive
}

export interface DashboardState {
  positions: Position[];
  orders: Order[];
  pnl: PnLSummary | null;
  aiObservations: AIObservation[];
  lastUpdatedAt: number;
}

// ============================================================================
// SYSTEM TYPES
// ============================================================================

export type SystemPhase = 
  | 'token-capture'      // Phase 0
  | 'pre-ignition'       // Phase 1
  | 'ignition'           // Phase 2
  | 'telemetry'          // Phase 3
  | 'shutdown';          // Phase 4

export interface SystemState {
  phase: SystemPhase;
  startedAt: number | null;
  lastActivityAt: number;
}

// ============================================================================
// UXMI TYPES (CR-005: User Experience Micro-Interactions)
// ============================================================================

export type ButtonState = 
  | 'default'
  | 'hover'
  | 'focus'
  | 'active'
  | 'loading'
  | 'disabled'
  | 'success'
  | 'error';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// WHAT/WHY/HOW Error Format (CR-005)
export interface ErrorDetails {
  what: string;
  why: string;
  how: string;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorDetails;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  checks: {
    name: string;
    status: 'pass' | 'fail';
    message?: string;
  }[];
}

// ============================================================================
// CIA-SIE-PURE TELEMETRY TYPES (SILO 1: Canonical Contract)
// ============================================================================
// These types define the CANONICAL telemetry contract between MCI and CIA-SIE-PURE.
// All fields are explicitly labeled with their alignment status.
// See: 00_GOVERNANCE/TELEMETRY_CONTRACT_ALIGNMENT.md

/**
 * Signal direction from CIA-SIE-PURE
 * ALIGNMENT: VERIFIED — Matches CIA-SIE-PURE SignalDirection enum
 */
export type CiaSieSignalDirection = 'buy' | 'sell' | 'neutral';

/**
 * Signal freshness status from CIA-SIE-PURE
 * ALIGNMENT: VERIFIED — Matches CIA-SIE-PURE SignalFreshness enum
 */
export type CiaSieSignalFreshness = 'fresh' | 'stale';

/**
 * Signal data from CIA-SIE-PURE
 * ALIGNMENT: CANONICAL — This is the authoritative MCI-side representation
 */
export interface CiaSieSignal {
  /** Unique signal identifier (UUID from CIA-SIE-PURE) */
  id: string;
  /** Parent chart identifier */
  chartId: string;
  /** Signal direction */
  direction: CiaSieSignalDirection;
  /** Signal timestamp (ISO 8601 string from CIA-SIE-PURE) */
  timestamp: string;
  /** Indicator name (e.g., 'RSI', 'MACD') */
  indicator: string;
  /** Signal freshness status */
  freshness: CiaSieSignalFreshness;
  /** Raw TradingView payload (opaque to MCI) */
  rawPayload?: Record<string, unknown>;
}

/**
 * Chart data from CIA-SIE-PURE
 * ALIGNMENT: CANONICAL — Represents a TradingView chart configuration
 */
export interface CiaSieChart {
  /** Unique chart identifier (UUID) */
  id: string;
  /** Chart name (user-defined) */
  name: string;
  /** Trading instrument symbol */
  symbol: string;
  /** Exchange identifier */
  exchange: string;
  /** Timeframe (e.g., '1m', '5m', '1h', '1d') */
  timeframe: string;
  /** Silo this chart belongs to */
  siloId: string;
  /** Most recent signals for this chart */
  signals: CiaSieSignal[];
  /** Chart creation timestamp */
  createdAt: string;
  /** Last signal received timestamp */
  lastSignalAt: string | null;
}

/**
 * Silo data from CIA-SIE-PURE
 * ALIGNMENT: CANONICAL — Represents a logical grouping of charts
 */
export interface CiaSieSilo {
  /** Unique silo identifier (UUID) */
  id: string;
  /** Silo name (user-defined) */
  name: string;
  /** Silo description */
  description: string | null;
  /** Charts in this silo */
  charts: CiaSieChart[];
  /** Silo creation timestamp */
  createdAt: string;
}

/**
 * AI-generated narrative from CIA-SIE-PURE
 * ALIGNMENT: CANONICAL — Represents AI observation (CR-003 compliant)
 * 
 * NOTE: MCI MUST NOT display narratives that contain prescriptive language.
 * Constitutional validation is performed by CIA-SIE-PURE before emission.
 */
export interface CiaSieNarrative {
  /** The AI-generated narrative text (descriptive only) */
  narrative: string;
  /** Constitutional disclaimer (MUST be displayed) */
  disclaimer: string;
  /** AI model used for generation */
  modelUsed: string;
  /** Token usage for budgeting */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Generation timestamp */
  generatedAt: string;
}

/**
 * Contradiction detection result from CIA-SIE-PURE
 * ALIGNMENT: CANONICAL — Implements CR-002 (Expose Contradictions)
 * 
 * IMPORTANT: Contradictions are EXPOSED, not resolved.
 * MCI displays contradictions truthfully; it does NOT aggregate or reconcile.
 */
export interface CiaSieContradiction {
  /** Chart A identifier */
  chartAId: string;
  /** Chart A name */
  chartAName: string;
  /** Chart A direction */
  chartADirection: CiaSieSignalDirection;
  /** Chart B identifier */
  chartBId: string;
  /** Chart B name */
  chartBName: string;
  /** Chart B direction */
  chartBDirection: CiaSieSignalDirection;
  /** Whether this is a direct contradiction (BUY vs SELL) */
  isDirectContradiction: boolean;
  /** Detection timestamp */
  detectedAt: string;
}

/**
 * Engine observable state (SILO 3: Handshake Model)
 * ALIGNMENT: MCI-DEFINED — MCI observation of CIA-SIE-PURE state
 * 
 * CONSTRAINT: MCI OBSERVES only. MCI does NOT control lifecycle.
 * All lifecycle operations (start/stop/restart) are delegated to external supervision.
 */
export type CiaSieEngineStatus = 'connected' | 'disconnected' | 'degraded' | 'unknown' | 'checking';

/**
 * Engine latency classification (SILO 4: Latency Policy)
 * ALIGNMENT: MCI-DEFINED — MCI classification of observed latency
 */
export type CiaSieLatencyStatus = 'ok' | 'warn' | 'slow' | 'fail' | 'timeout';

/**
 * Complete engine observability state
 * ALIGNMENT: MCI-DEFINED — Composite observation for cockpit display
 * 
 * This type represents MCI's OBSERVATION of CIA-SIE-PURE, not control over it.
 */
export interface CiaSieEngineObservation {
  /** Connection status */
  status: CiaSieEngineStatus;
  /** Last successful health check timestamp */
  lastSeenAt: number | null;
  /** Current health check latency in milliseconds */
  latencyMs: number | null;
  /** Latency classification */
  latencyStatus: CiaSieLatencyStatus;
  /** Consecutive health check failures */
  consecutiveFailures: number;
  /** Whether MCI is in degraded mode due to engine unavailability */
  isDegradedMode: boolean;
  /** Human-readable status message for cockpit */
  statusMessage: string;
  /** Subsystem availability */
  subsystems: {
    process: boolean;
    database: boolean;
    ai: boolean;
    webhook: boolean;
  };
}

/**
 * Health check result from CIA-SIE-PURE /health endpoint
 * ALIGNMENT: VERIFIED — Matches CIA-SIE-PURE health response
 */
export interface CiaSieHealthResponse {
  status: 'ok' | 'error';
  app?: string;
  version?: string;
  message?: string;
}

// ============================================================================
// TELEMETRY TRANSFORM UTILITIES
// ============================================================================

/**
 * Transform CIA-SIE-PURE signal to MCI AIObservation format
 * ALIGNMENT: TRANSFORM — Converts between type systems
 * 
 * @param signal - Signal from CIA-SIE-PURE
 * @returns AIObservation for dashboard display
 */
export function signalToObservation(signal: CiaSieSignal): AIObservation {
  return {
    id: signal.id,
    timestamp: new Date(signal.timestamp).getTime(),
    type: 'observation',
    message: `${signal.indicator} signal: ${signal.direction.toUpperCase()} (${signal.freshness})`,
  };
}

/**
 * Transform CIA-SIE-PURE narrative to MCI AIObservation format
 * ALIGNMENT: TRANSFORM — Converts between type systems
 * 
 * @param narrative - Narrative from CIA-SIE-PURE
 * @param id - Generated ID for the observation
 * @returns AIObservation for dashboard display
 */
export function narrativeToObservation(narrative: CiaSieNarrative, id: string): AIObservation {
  return {
    id,
    timestamp: new Date(narrative.generatedAt).getTime(),
    type: 'observation',
    message: `${narrative.narrative}\n\n${narrative.disclaimer}`,
  };
}

/**
 * Classify latency based on thresholds
 * ALIGNMENT: SILO 4 — Latency policy implementation
 * 
 * @param latencyMs - Latency in milliseconds
 * @returns Latency classification
 */
export function classifyLatency(latencyMs: number | null): CiaSieLatencyStatus {
  if (latencyMs === null) return 'timeout';
  if (latencyMs <= 100) return 'ok';
  if (latencyMs <= 500) return 'warn';
  if (latencyMs <= 2000) return 'slow';
  return 'fail';
}

/**
 * Generate human-readable latency status message
 * ALIGNMENT: SILO 4 — User impact statement
 * 
 * @param status - Latency classification
 * @returns User-facing message
 */
export function getLatencyMessage(status: CiaSieLatencyStatus): string {
  switch (status) {
    case 'ok':
      return 'System is responding normally.';
    case 'warn':
      return 'System is slightly slower than usual.';
    case 'slow':
      return 'System is experiencing delays.';
    case 'fail':
      return 'System is very slow. Data may be significantly delayed.';
    case 'timeout':
      return 'Cannot reach CIA-SIE-PURE. Some features are unavailable.';
  }
}
