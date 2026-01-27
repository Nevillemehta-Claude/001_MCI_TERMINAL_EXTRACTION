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
