import { create } from 'zustand';
import {
  setTradingMode,
  logTradingBreadcrumb,
  captureTradeError,
} from '../lib/sentry';

export type IgnitionPhase =
  | 'idle'
  | 'selecting'
  | 'arming'
  | 'armed'
  | 'igniting'
  | 'running'
  | 'error';

/**
 * P2 REMEDIATION: Indian Broker Backends
 * Changed from Alpaca paper/live to 4 Indian brokers
 */
export type BackendType = 'icici' | 'hdfc' | 'kotak' | 'zerodha';

export interface BackendConfig {
  type: BackendType;
  name: string;
  description: string;
  endpoint: string;
  requiresConfirmation: boolean;
  icon: string;
  broker: string; // Full broker name
}

export interface IgnitionState {
  // Backend selection
  selectedBackend: BackendType | null;
  backendConfigs: BackendConfig[];

  // Ignition state
  phase: IgnitionPhase;
  ignitionStartedAt: number | null;
  ignitionError: string | null;

  // Safety
  isArmed: boolean;
  armKeyEntered: boolean;
  liveConfirmed: boolean;

  // Actions
  selectBackend: (type: BackendType) => void;
  armSystem: () => void;
  disarmSystem: () => void;
  confirmLive: () => void;
  ignite: () => Promise<void>;
  abort: () => Promise<void>;
  setPhase: (phase: IgnitionPhase) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * P2 REMEDIATION: 4 Indian Broker Configurations
 * Each broker connects to Indian stock markets (NSE/BSE)
 */
const BACKEND_CONFIGS: BackendConfig[] = [
  {
    type: 'icici',
    name: 'ICICI Direct',
    broker: 'ICICI Securities',
    description: 'Connect via ICICI Direct Breeze API for NSE/BSE trading.',
    endpoint: '/api/backend/icici',
    requiresConfirmation: true,
    icon: '🏦',
  },
  {
    type: 'hdfc',
    name: 'HDFC Sky',
    broker: 'HDFC Securities',
    description: 'Connect via HDFC Sky API for NSE/BSE trading.',
    endpoint: '/api/backend/hdfc',
    requiresConfirmation: true,
    icon: '🏛️',
  },
  {
    type: 'kotak',
    name: 'Kotak Neo',
    broker: 'Kotak Securities',
    description: 'Connect via Kotak Neo Trade API for NSE/BSE trading.',
    endpoint: '/api/backend/kotak',
    requiresConfirmation: true,
    icon: '🏢',
  },
  {
    type: 'zerodha',
    name: 'Zerodha Kite',
    broker: 'Zerodha',
    description: 'Connect via Kite Connect API for NSE/BSE trading.',
    endpoint: '/api/backend/zerodha',
    requiresConfirmation: true,
    icon: '🪁',
  },
];

// Helper to get a fresh copy of backend configs
const getDefaultBackendConfigs = (): BackendConfig[] =>
  BACKEND_CONFIGS.map((config) => ({ ...config }));

export const useIgnitionStore = create<IgnitionState>()((set, get) => ({
  // Initial state
  selectedBackend: null,
  backendConfigs: getDefaultBackendConfigs(),
  phase: 'idle',
  ignitionStartedAt: null,
  ignitionError: null,
  isArmed: false,
  armKeyEntered: false,
  liveConfirmed: false,

  // Actions
  selectBackend: (type: BackendType) => {
    // Set Sentry trading mode context
    setTradingMode(type);
    logTradingBreadcrumb('Backend selected', 'ignition', { backend: type });

    set({
      selectedBackend: type,
      phase: 'selecting',
      isArmed: false,
      armKeyEntered: false,
      liveConfirmed: false,
      ignitionError: null,
    });
  },

  armSystem: () => {
    const { selectedBackend, liveConfirmed, backendConfigs } = get();

    // Check if selected backend requires confirmation (all Indian brokers do)
    const selectedConfig = backendConfigs.find((c) => c.type === selectedBackend);
    const requiresConfirmation = selectedConfig?.requiresConfirmation ?? false;

    // For real trading, require explicit confirmation
    if (requiresConfirmation && !liveConfirmed) {
      logTradingBreadcrumb('Arm rejected - real trading not confirmed', 'ignition', { backend: selectedBackend }, 'warning');
      set({ ignitionError: 'Real trading requires explicit confirmation' });
      return;
    }

    logTradingBreadcrumb('System armed', 'ignition', { backend: selectedBackend });

    set({
      isArmed: true,
      armKeyEntered: true,
      phase: 'armed',
      ignitionError: null,
    });
  },

  disarmSystem: () => {
    logTradingBreadcrumb('System disarmed', 'ignition');
    set({
      isArmed: false,
      armKeyEntered: false,
      liveConfirmed: false, // Must re-confirm after disarming
      phase: get().selectedBackend ? 'selecting' : 'idle',
    });
  },

  confirmLive: () => {
    logTradingBreadcrumb('Live trading confirmed', 'ignition', {}, 'warning');
    set({ liveConfirmed: true });
  },

  ignite: async () => {
    const { selectedBackend, isArmed, backendConfigs } = get();

    if (!selectedBackend || !isArmed) {
      logTradingBreadcrumb('Ignition rejected - not armed', 'ignition', {}, 'warning');
      set({ ignitionError: 'System must be armed before ignition' });
      return;
    }

    const config = backendConfigs.find((c) => c.type === selectedBackend);
    if (!config) {
      logTradingBreadcrumb('Ignition rejected - invalid config', 'ignition', {}, 'error');
      set({ ignitionError: 'Invalid backend configuration' });
      return;
    }

    logTradingBreadcrumb('Ignition started', 'ignition', { backend: selectedBackend });

    set({
      phase: 'igniting',
      ignitionStartedAt: Date.now(),
      ignitionError: null,
    });

    // FIX: Removed Sentry.startSpan wrapper - was interfering with fetch (same bug as tokenStore)
    try {
      // Call backend to start the system
      const response = await fetch('/api/ignition/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backend: selectedBackend,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Ignition failed');
      }

      logTradingBreadcrumb('Ignition completed - system running', 'ignition', {
        backend: selectedBackend,
        duration: Date.now() - (get().ignitionStartedAt || Date.now()),
      });

      set({ phase: 'running' });
    } catch (error) {
      // Capture error to Sentry with full trading context
      captureTradeError(error as Error, {
        action: 'ignition',
        backend: selectedBackend,
        phase: 'igniting',
        details: {
          isArmed,
          configEndpoint: config.endpoint,
        },
      });
      logTradingBreadcrumb('Ignition failed', 'ignition', {
        backend: selectedBackend,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'error');

      set({
        phase: 'error',
        ignitionError: error instanceof Error ? error.message : 'Ignition failed',
      });
    }
  },

  abort: async () => {
    const { phase, selectedBackend } = get();

    logTradingBreadcrumb('Abort requested', 'ignition', { currentPhase: phase });

    if (phase !== 'running' && phase !== 'igniting') {
      logTradingBreadcrumb('Abort - resetting to idle', 'ignition');
      set({
        phase: 'idle',
        isArmed: false,
        selectedBackend: null,
      });
      return;
    }

    try {
      await fetch('/api/ignition/abort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      logTradingBreadcrumb('Ignition aborted successfully', 'ignition', {
        previousPhase: phase,
        backend: selectedBackend,
      }, 'warning');

      set({
        phase: 'idle',
        isArmed: false,
        ignitionStartedAt: null,
      });
    } catch (error) {
      captureTradeError(error as Error, {
        action: 'ignition',
        backend: selectedBackend || undefined,
        phase: 'aborting',
      });
      logTradingBreadcrumb('Abort failed', 'ignition', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'error');

      set({
        ignitionError: error instanceof Error ? error.message : 'Abort failed',
      });
    }
  },

  setPhase: (phase: IgnitionPhase) => {
    set({ phase });
  },

  setError: (error: string | null) => {
    set({
      ignitionError: error,
      phase: error ? 'error' : get().phase,
    });
  },

  reset: () => {
    // Reset Sentry trading mode context
    setTradingMode('unknown');
    logTradingBreadcrumb('Ignition state reset', 'ignition');

    set({
      selectedBackend: null,
      backendConfigs: getDefaultBackendConfigs(),
      phase: 'idle',
      ignitionStartedAt: null,
      ignitionError: null,
      isArmed: false,
      armKeyEntered: false,
      liveConfirmed: false,
    });
  },
}));

export default useIgnitionStore;
