import React, { useEffect } from 'react';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { useIgnitionStore } from '../../stores/ignitionStore';
import { PositionsPanel } from './PositionsPanel';
import { OrdersPanel } from './OrdersPanel';
import { AccountPanel } from './AccountPanel';
import { SystemHealthPanel } from './SystemHealthPanel';
import { MarketDataPanel } from './MarketDataPanel';
import { ActivityLogPanel } from './ActivityLogPanel';
import { Spinner, ToastContainer, Tooltip } from '../uxmi';
import { SimulationBadge } from '../cockpit';
import { useBackendHealth } from '../../hooks';

interface TelemetryDashboardProps {
  watchlist?: string[];
}

/**
 * Phase 3: Telemetry Dashboard
 * - 6-panel layout for complete system monitoring
 * - Real-time data updates via WebSocket (or simulation if not integrated)
 * - Responsive grid layout
 * - TRUTHFUL connection status indicator (COCKPIT INTEGRITY)
 * 
 * COCKPIT INTEGRITY NOTES:
 * - Connection status now reflects REAL backend health, not simulated
 * - Mock data panels are marked with SIMULATION badge
 * - Token timer is visible via StatusBar (always on screen)
 */

// Flag to indicate if real telemetry integration exists
// Set to true when CIA-SIE-PURE WebSocket is integrated
const IS_REAL_TELEMETRY_INTEGRATED = false;
export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({
  watchlist = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'],
}) => {
  const { setConnected } = useTelemetryStore();
  const { selectedBackend, backendConfigs } = useIgnitionStore();
  const selectedConfig = backendConfigs.find((c) => c.type === selectedBackend);
  const [toasts, setToasts] = React.useState<
    Array<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }>
  >([]);

  // COCKPIT INTEGRITY (GAP-01, GAP-03): Use REAL backend health, not simulated
  // NOTE: Always enabled when this component renders - App.tsx controls when to render TelemetryDashboard
  const backendHealth = useBackendHealth({ pollInterval: 5000, enabled: true });

  // Sync backend health to telemetry store
  useEffect(() => {
    setConnected(backendHealth.isReachable);
  }, [backendHealth.isReachable, setConnected]);

  const addToast = (toast: Omit<(typeof toasts)[0], 'id'>) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Connection status effect - notify on real connectivity changes
  const prevReachable = React.useRef<boolean | null>(null);
  useEffect(() => {
    if (prevReachable.current === null) {
      prevReachable.current = backendHealth.isReachable;
      return;
    }
    
    if (backendHealth.isReachable && !prevReachable.current) {
      addToast({
        type: 'success',
        title: 'Backend Connected',
        message: `API is reachable (${backendHealth.latency}ms latency)`,
      });
    } else if (!backendHealth.isReachable && prevReachable.current) {
      addToast({
        type: 'error',
        title: 'Backend Disconnected',
        message: backendHealth.lastError || 'Check if server is running',
      });
    }
    
    prevReachable.current = backendHealth.isReachable;
  }, [backendHealth.isReachable, backendHealth.latency, backendHealth.lastError]);

  // NOTE: Removed phase !== 'running' guard. App.tsx controls when this component renders.
  // The TelemetryDashboard is ONLY rendered when currentPhase === 'running' in App.tsx.
  // This eliminates the race condition where ignitionStore.phase might not be 'running' yet.

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-900 rounded-t-xl">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">Mission Control</h2>
          <span
            className="px-3 py-1 rounded-full text-sm font-medium bg-green-600 text-white"
          >
            {selectedConfig?.icon || '🔌'} {selectedConfig?.name || selectedBackend?.toUpperCase()}
          </span>
          {/* COCKPIT INTEGRITY (GAP-04): Mark as simulation if not real telemetry */}
          {!IS_REAL_TELEMETRY_INTEGRATED && (
            <SimulationBadge type="telemetry" size="sm" />
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* COCKPIT INTEGRITY (GAP-01): TRUTHFUL connection status based on real backend health */}
          <Tooltip content={
            backendHealth.isReachable
              ? `Backend API responding. Latency: ${backendHealth.latency}ms. Last check: ${backendHealth.timeSinceLastCheck ? Math.floor(backendHealth.timeSinceLastCheck / 1000) + 's ago' : 'now'}`
              : `Backend API NOT responding. ${backendHealth.lastError || 'Server may be down.'}`
          }>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                backendHealth.isReachable ? 'bg-green-900/50' : 'bg-red-900/50'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  backendHealth.isReachable ? 'bg-green-400 animate-pulse' : 'bg-red-400 animate-pulse'
                }`}
              />
              <span className={`text-sm font-medium ${backendHealth.isReachable ? 'text-green-400' : 'text-red-400'}`}>
                {backendHealth.isReachable ? 'API Connected' : 'API Disconnected'}
              </span>
              {backendHealth.isReachable && backendHealth.latency !== null && (
                <span className="text-gray-400 text-xs">{backendHealth.latency}ms</span>
              )}
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Loading state - only when backend is NOT reachable */}
      {!backendHealth.isReachable && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" color="primary" label="Waiting for backend connection..." />
          <div className="text-center text-gray-600">
            <p className="font-medium">Backend API is not responding</p>
            <p className="text-sm text-gray-500 mt-1">
              {backendHealth.lastError || 'Checking http://localhost:3000/api/health'}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Retrying every 5 seconds...
            </p>
          </div>
        </div>
      )}

      {/* Dashboard Grid - shows when backend is reachable */}
      {backendHealth.isReachable && (
        <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-4 p-4 bg-gray-100 rounded-b-xl overflow-hidden">
          {/* Row 1 */}
          {/* COCKPIT INTEGRITY (GAP-04): Each panel marked if using mock data */}
          <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden relative">
            {!IS_REAL_TELEMETRY_INTEGRATED && <SimulationBadge type="data" size="sm" floating />}
            <PositionsPanel />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden relative">
            {!IS_REAL_TELEMETRY_INTEGRATED && <SimulationBadge type="data" size="sm" floating />}
            <OrdersPanel />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden relative">
            {!IS_REAL_TELEMETRY_INTEGRATED && <SimulationBadge type="data" size="sm" floating />}
            <AccountPanel />
          </div>

          {/* Row 2 */}
          <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden relative">
            {!IS_REAL_TELEMETRY_INTEGRATED && <SimulationBadge type="data" size="sm" floating />}
            <SystemHealthPanel />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden relative">
            {!IS_REAL_TELEMETRY_INTEGRATED && <SimulationBadge type="data" size="sm" floating />}
            <MarketDataPanel symbols={watchlist} />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden relative">
            {/* Activity log can show real logs, no simulation badge needed */}
            <ActivityLogPanel />
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} position="bottom-right" />
    </div>
  );
};

export default TelemetryDashboard;
