import { create } from 'zustand';
import {
  logTradingBreadcrumb,
  captureTradeError,
  Sentry,
} from '../lib/sentry';

export type ShutdownPhase =
  | 'idle'
  | 'initiating'
  | 'closing_positions'
  | 'canceling_orders'
  | 'disconnecting'
  | 'complete'
  | 'error';

export interface ShutdownStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'complete' | 'error' | 'skipped';
  message?: string;
  duration?: number;
}

export interface ShutdownState {
  // State
  phase: ShutdownPhase;
  steps: ShutdownStep[];
  isEmergency: boolean;
  shutdownStartedAt: number | null;
  shutdownCompletedAt: number | null;
  error: string | null;

  // Options
  closePositions: boolean;
  cancelOrders: boolean;
  saveState: boolean;

  // Actions
  initiateShutdown: (emergency?: boolean) => Promise<void>;
  setOptions: (options: Partial<Pick<ShutdownState, 'closePositions' | 'cancelOrders' | 'saveState'>>) => void;
  updateStep: (id: string, update: Partial<ShutdownStep>) => void;
  reset: () => void;
}

const DEFAULT_STEPS: Omit<ShutdownStep, 'status'>[] = [
  {
    id: 'save-state',
    name: 'Save System State',
    description: 'Persisting current system state to storage',
  },
  {
    id: 'cancel-orders',
    name: 'Cancel Pending Orders',
    description: 'Canceling all open orders',
  },
  {
    id: 'close-positions',
    name: 'Close Positions',
    description: 'Closing all open positions at market',
  },
  {
    id: 'disconnect-streams',
    name: 'Disconnect Data Streams',
    description: 'Closing WebSocket connections',
  },
  {
    id: 'cleanup',
    name: 'Cleanup Resources',
    description: 'Releasing system resources',
  },
  {
    id: 'finalize',
    name: 'Finalize Shutdown',
    description: 'Final shutdown procedures',
  },
];

export const useShutdownStore = create<ShutdownState>()((set, get) => ({
  // Initial state
  phase: 'idle',
  steps: [],
  isEmergency: false,
  shutdownStartedAt: null,
  shutdownCompletedAt: null,
  error: null,

  // Default options
  closePositions: false,
  cancelOrders: true,
  saveState: true,

  // Actions
  initiateShutdown: async (emergency = false) => {
    const { closePositions, cancelOrders, saveState } = get();

    // Log shutdown initiation to Sentry
    logTradingBreadcrumb(
      emergency ? 'EMERGENCY shutdown initiated' : 'Shutdown initiated',
      'shutdown',
      { isEmergency: emergency, closePositions, cancelOrders, saveState },
      emergency ? 'error' : 'warning'
    );

    // Initialize steps based on options
    const steps: ShutdownStep[] = DEFAULT_STEPS.map((step) => {
      let status: ShutdownStep['status'] = 'pending';

      // Skip steps based on options
      if (step.id === 'close-positions' && !closePositions && !emergency) {
        status = 'skipped';
      }
      if (step.id === 'cancel-orders' && !cancelOrders && !emergency) {
        status = 'skipped';
      }
      if (step.id === 'save-state' && !saveState) {
        status = 'skipped';
      }

      return { ...step, status };
    });

    set({
      phase: 'initiating',
      steps,
      isEmergency: emergency,
      shutdownStartedAt: Date.now(),
      shutdownCompletedAt: null,
      error: null,
    });

    return Sentry.startSpan(
      {
        name: emergency ? 'mci.shutdown.emergency' : 'mci.shutdown.normal',
        op: 'task',
        attributes: { emergency, closePositions, cancelOrders, saveState },
      },
      async () => {
        try {
          // Execute each step
          for (const step of steps) {
            if (step.status === 'skipped') {
              logTradingBreadcrumb('Shutdown step skipped', 'shutdown', {
                stepId: step.id,
                stepName: step.name,
              });
              continue;
            }

            // Update step to running
            get().updateStep(step.id, { status: 'running' });
            logTradingBreadcrumb('Shutdown step started', 'shutdown', {
              stepId: step.id,
              stepName: step.name,
            });

            const startTime = Date.now();

            try {
              // Call backend for each step with Sentry span
              const result = await Sentry.startSpan(
                { name: `mci.shutdown.step.${step.id}`, op: 'http.client' },
                async () => {
                  const response = await fetch(`/api/shutdown/${step.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ emergency }),
                  });

                  if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.message || `${step.name} failed`);
                  }

                  return response.json().catch(() => ({}));
                }
              );

              const duration = Date.now() - startTime;

              get().updateStep(step.id, {
                status: 'complete',
                message: result.message,
                duration,
              });

              logTradingBreadcrumb('Shutdown step completed', 'shutdown', {
                stepId: step.id,
                stepName: step.name,
                duration,
              });
            } catch (error) {
              const duration = Date.now() - startTime;

              // Capture error to Sentry
              captureTradeError(error as Error, {
                action: 'shutdown',
                phase: step.id,
                details: {
                  isEmergency: emergency,
                  stepName: step.name,
                },
              });
              logTradingBreadcrumb('Shutdown step failed', 'shutdown', {
                stepId: step.id,
                stepName: step.name,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration,
              }, 'error');

              // For emergency shutdown, continue even on error
              if (emergency) {
                get().updateStep(step.id, {
                  status: 'error',
                  message: error instanceof Error ? error.message : 'Step failed',
                  duration,
                });
              } else {
                throw error;
              }
            }

            // Small delay for visual feedback (skip in emergency)
            if (!emergency) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          }

          const totalDuration = Date.now() - (get().shutdownStartedAt || Date.now());
          logTradingBreadcrumb('Shutdown completed successfully', 'shutdown', {
            isEmergency: emergency,
            totalDuration,
            stepsCompleted: steps.filter((s) => s.status !== 'skipped').length,
          });

          set({
            phase: 'complete',
            shutdownCompletedAt: Date.now(),
          });
        } catch (error) {
          captureTradeError(error as Error, {
            action: 'shutdown',
            phase: 'fatal',
            details: { isEmergency: emergency },
          });
          logTradingBreadcrumb('Shutdown FAILED', 'shutdown', {
            isEmergency: emergency,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, 'error');

          set({
            phase: 'error',
            error: error instanceof Error ? error.message : 'Shutdown failed',
          });
        }
      }
    );
  },

  setOptions: (options) => {
    set(options);
  },

  updateStep: (id: string, update: Partial<ShutdownStep>) => {
    set((state) => ({
      steps: state.steps.map((step) =>
        step.id === id ? { ...step, ...update } : step
      ),
    }));
  },

  reset: () => {
    logTradingBreadcrumb('Shutdown state reset', 'shutdown');
    set({
      phase: 'idle',
      steps: [],
      isEmergency: false,
      shutdownStartedAt: null,
      shutdownCompletedAt: null,
      error: null,
      // Note: Options are NOT reset - they are user preferences
    });
  },
}));

export default useShutdownStore;
