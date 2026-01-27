import React, { useEffect } from 'react';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { useIgnitionStore } from '../../stores/ignitionStore';
import { PositionsPanel } from './PositionsPanel';
import { OrdersPanel } from './OrdersPanel';
import { AccountPanel } from './AccountPanel';
import { SystemHealthPanel } from './SystemHealthPanel';
import { MarketDataPanel } from './MarketDataPanel';
import { ActivityLogPanel } from './ActivityLogPanel';
import { Spinner, ToastContainer } from '../uxmi';

interface TelemetryDashboardProps {
  watchlist?: string[];
}

/**
 * Phase 3: Telemetry Dashboard
 * - 6-panel layout for complete system monitoring
 * - Real-time data updates via WebSocket
 * - Responsive grid layout
 * - Connection status indicator
 */
export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({
  watchlist = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'SPY'],
}) => {
  const { isConnected, setConnected } = useTelemetryStore();
  const { phase, selectedBackend, backendConfigs } = useIgnitionStore();
  const selectedConfig = backendConfigs.find((c) => c.type === selectedBackend);
  const [toasts, setToasts] = React.useState<
    Array<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }>
  >([]);

  // Simulate WebSocket connection (replace with real implementation)
  useEffect(() => {
    if (phase !== 'running') return;

    // Simulated connection
    const connectTimeout = setTimeout(() => {
      setConnected(true);
    }, 500);

    // Cleanup on unmount
    return () => {
      clearTimeout(connectTimeout);
      setConnected(false);
    };
  }, [phase, setConnected]);

  const addToast = (toast: Omit<(typeof toasts)[0], 'id'>) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Connection status effect
  useEffect(() => {
    if (isConnected) {
      addToast({
        type: 'success',
        title: 'Connected',
        message: 'Telemetry stream established',
      });
    }
  }, [isConnected]);

  if (phase !== 'running') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl p-8">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Telemetry Dashboard</h2>
        <p className="text-gray-500">Start the system to view telemetry data</p>
      </div>
    );
  }

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
        </div>

        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isConnected ? 'bg-green-900/50' : 'bg-red-900/50'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`}
            />
            <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {!isConnected && (
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" color="primary" label="Connecting to telemetry stream..." />
        </div>
      )}

      {/* Dashboard Grid */}
      {isConnected && (
        <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-4 p-4 bg-gray-100 rounded-b-xl overflow-hidden">
          {/* Row 1 */}
          <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden">
            <PositionsPanel />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden">
            <OrdersPanel />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden">
            <AccountPanel />
          </div>

          {/* Row 2 */}
          <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden">
            <SystemHealthPanel />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden">
            <MarketDataPanel symbols={watchlist} />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden">
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
