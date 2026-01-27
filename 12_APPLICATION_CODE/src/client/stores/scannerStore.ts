import { create } from 'zustand';
import {
  logTradingBreadcrumb,
  captureTradeError,
  Sentry,
} from '../lib/sentry';

export type ScanStatus = 'pending' | 'running' | 'passed' | 'failed' | 'warning' | 'skipped';

export interface ScanCheck {
  id: string;
  name: string;
  description: string;
  category: 'connection' | 'auth' | 'market' | 'system' | 'config';
  status: ScanStatus;
  message?: string;
  duration?: number; // ms
  critical: boolean; // If true, failure blocks ignition
}

export interface ScannerState {
  // Scan state
  checks: ScanCheck[];
  isScanning: boolean;
  scanStartedAt: number | null;
  scanCompletedAt: number | null;

  // Results
  passedCount: number;
  failedCount: number;
  warningCount: number;
  canProceed: boolean;

  // Actions
  initializeChecks: () => void;
  startScan: () => Promise<void>;
  updateCheck: (id: string, update: Partial<ScanCheck>) => void;
  resetScanner: () => void;
  getCheckById: (id: string) => ScanCheck | undefined;
}

/**
 * P3 REMEDIATION: 12-point pre-ignition checks for Indian markets
 * Updated from Alpaca/Polygon to Kite Connect/NSE/BSE
 */
const DEFAULT_CHECKS: Omit<ScanCheck, 'status'>[] = [
  // Connection Checks (1-3)
  {
    id: 'kite-connection',
    name: 'Kite API Connection',
    description: 'Verify connection to Kite Connect trading API',
    category: 'connection',
    critical: true,
  },
  {
    id: 'nse-bse-data',
    name: 'NSE/BSE Data Feed',
    description: 'Verify connection to Indian market data (NSE/BSE)',
    category: 'connection',
    critical: false,
  },
  {
    id: 'websocket-health',
    name: 'WebSocket Health',
    description: 'Test real-time data streaming capability',
    category: 'connection',
    critical: true,
  },

  // Authentication Checks (4-5)
  {
    id: 'token-validity',
    name: 'Kite Token Validity',
    description: 'Verify Kite tokens are valid (expires 6:00 AM IST - CR-004)',
    category: 'auth',
    critical: true,
  },
  {
    id: 'account-access',
    name: 'Account Access',
    description: 'Confirm account permissions and trading access',
    category: 'auth',
    critical: true,
  },

  // Market Checks (6-8) - Indian Markets
  {
    id: 'market-status',
    name: 'NSE/BSE Market Status',
    description: 'Check if Indian markets are open (9:15 AM - 3:30 PM IST)',
    category: 'market',
    critical: false,
  },
  {
    id: 'data-feed',
    name: 'Market Data Quality',
    description: 'Verify NSE/BSE data feed quality and latency',
    category: 'market',
    critical: false,
  },
  {
    id: 'symbol-availability',
    name: 'Symbol Availability',
    description: 'Confirm configured NSE/BSE symbols are tradeable',
    category: 'market',
    critical: true,
  },

  // System Checks (9-10)
  {
    id: 'backend-health',
    name: 'Backend Health',
    description: 'Verify CIA-SIE-PURE backend is responsive',
    category: 'system',
    critical: true,
  },
  {
    id: 'memory-resources',
    name: 'System Resources',
    description: 'Check available memory and CPU capacity',
    category: 'system',
    critical: false,
  },

  // Configuration Checks (11-12)
  {
    id: 'risk-parameters',
    name: 'Risk Parameters',
    description: 'Validate risk management configuration',
    category: 'config',
    critical: true,
  },
  {
    id: 'strategy-config',
    name: 'Strategy Configuration',
    description: 'Verify trading strategy parameters',
    category: 'config',
    critical: true,
  },
];

export const useScannerStore = create<ScannerState>()((set, get) => ({
  // Initial state
  checks: [],
  isScanning: false,
  scanStartedAt: null,
  scanCompletedAt: null,
  passedCount: 0,
  failedCount: 0,
  warningCount: 0,
  canProceed: false,

  // Actions
  initializeChecks: () => {
    logTradingBreadcrumb('Scanner initialized', 'scan', { checkCount: DEFAULT_CHECKS.length });
    const checks: ScanCheck[] = DEFAULT_CHECKS.map((check) => ({
      ...check,
      status: 'pending' as ScanStatus,
    }));
    set({
      checks,
      passedCount: 0,
      failedCount: 0,
      warningCount: 0,
      canProceed: false,
    });
  },

  startScan: async () => {
    const { checks } = get();
    logTradingBreadcrumb('Scan started', 'scan', { checkCount: checks.length });

    set({
      isScanning: true,
      scanStartedAt: Date.now(),
      scanCompletedAt: null,
    });

    return Sentry.startSpan(
      { name: 'mci.scan.full', op: 'task' },
      async () => {
        // Run checks sequentially for visual feedback
        for (const check of checks) {
          // Mark as running
          get().updateCheck(check.id, { status: 'running' });
          logTradingBreadcrumb('Check started', 'scan', {
            checkId: check.id,
            checkName: check.name,
            critical: check.critical,
          });

          const startTime = Date.now();

          try {
            // Call backend to perform actual check with Sentry span
            const result = await Sentry.startSpan(
              { name: `mci.scan.check.${check.id}`, op: 'http.client' },
              async () => {
                const response = await fetch(`/api/scan/${check.id}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                });
                return response.json();
              }
            );

            const duration = Date.now() - startTime;
            const status = result.passed ? 'passed' : result.warning ? 'warning' : 'failed';

            get().updateCheck(check.id, {
              status,
              message: result.message,
              duration,
            });

            logTradingBreadcrumb('Check completed', 'scan', {
              checkId: check.id,
              status,
              duration,
              critical: check.critical,
            }, status === 'failed' && check.critical ? 'error' : 'info');

          } catch (error) {
            const duration = Date.now() - startTime;
            get().updateCheck(check.id, {
              status: 'failed',
              message: error instanceof Error ? error.message : 'Check failed',
              duration,
            });

            // Capture error with trading context
            captureTradeError(error as Error, {
              action: 'scan',
              details: {
                checkId: check.id,
                checkName: check.name,
                critical: check.critical,
              },
            });
            logTradingBreadcrumb('Check failed with error', 'scan', {
              checkId: check.id,
              error: error instanceof Error ? error.message : 'Unknown error',
              critical: check.critical,
            }, 'error');
          }

          // Small delay for visual feedback
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        // Calculate results
        const finalChecks = get().checks;
        const passedCount = finalChecks.filter((c) => c.status === 'passed').length;
        const failedCount = finalChecks.filter((c) => c.status === 'failed').length;
        const warningCount = finalChecks.filter((c) => c.status === 'warning').length;

        // Can proceed if no critical checks failed
        const criticalFailures = finalChecks.filter(
          (c) => c.critical && c.status === 'failed'
        ).length;
        const canProceed = criticalFailures === 0;

        logTradingBreadcrumb('Scan completed', 'scan', {
          passedCount,
          failedCount,
          warningCount,
          criticalFailures,
          canProceed,
          totalDuration: Date.now() - (get().scanStartedAt || Date.now()),
        }, canProceed ? 'info' : 'warning');

        set({
          isScanning: false,
          scanCompletedAt: Date.now(),
          passedCount,
          failedCount,
          warningCount,
          canProceed,
        });
      }
    );
  },

  updateCheck: (id: string, update: Partial<ScanCheck>) => {
    set((state) => ({
      checks: state.checks.map((check) =>
        check.id === id ? { ...check, ...update } : check
      ),
    }));
  },

  resetScanner: () => {
    logTradingBreadcrumb('Scanner reset', 'scan');
    set({
      checks: [],
      isScanning: false,
      scanStartedAt: null,
      scanCompletedAt: null,
      passedCount: 0,
      failedCount: 0,
      warningCount: 0,
      canProceed: false,
    });
  },

  getCheckById: (id: string) => {
    return get().checks.find((c) => c.id === id);
  },
}));

export default useScannerStore;
