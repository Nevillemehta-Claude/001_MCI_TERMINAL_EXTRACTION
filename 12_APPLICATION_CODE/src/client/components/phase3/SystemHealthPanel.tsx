import React from 'react';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { Tooltip, ProgressBar, Spinner } from '../uxmi';

interface SystemHealthPanelProps {
  compact?: boolean;
}

/**
 * Phase 3: System Health Panel
 * - CPU and memory usage monitoring
 * - Latency tracking
 * - Uptime and heartbeat status
 * - Health status indicators
 */
export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({ compact = false }) => {
  const { systemHealth, lastUpdate } = useTelemetryStore();

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatLatency = (ms: number) => {
    if (ms < 1) return '<1ms';
    return `${ms.toFixed(0)}ms`;
  };

  const getHealthColor = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return 'success';
    if (value < thresholds[1]) return 'warning';
    return 'error';
  };

  if (!systemHealth) {
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">System Health</h3>
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Spinner size="md" color="gray" label="Loading system data..." />
        </div>
      </div>
    );
  }

  const statusConfig = {
    healthy: {
      label: 'Healthy',
      color: 'text-green-600 bg-green-100',
      icon: '✓',
    },
    degraded: {
      label: 'Degraded',
      color: 'text-yellow-600 bg-yellow-100',
      icon: '⚠',
    },
    critical: {
      label: 'Critical',
      color: 'text-red-600 bg-red-100',
      icon: '✕',
    },
  };

  const status = statusConfig[systemHealth.status];
  const timeSinceHeartbeat = Date.now() - systemHealth.lastHeartbeat;
  const heartbeatOk = timeSinceHeartbeat < 5000; // 5 seconds threshold

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">System</h3>
          <span className={`text-xs px-2 py-1 rounded ${status.color}`}>
            {status.icon} {status.label}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-500">CPU</div>
            <div className="font-bold">{systemHealth.cpu}%</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-500">MEM</div>
            <div className="font-bold">{systemHealth.memory}%</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-500">LAT</div>
            <div className="font-bold">{formatLatency(systemHealth.latency)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">System Health</h3>
        <span className={`text-sm px-3 py-1 rounded-full ${status.color}`}>
          {status.icon} {status.label}
        </span>
      </div>

      <div className="space-y-4">
        {/* CPU Usage */}
        <Tooltip content={`CPU usage: ${systemHealth.cpu}%`}>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">CPU</span>
              <span className="font-medium">{systemHealth.cpu}%</span>
            </div>
            <ProgressBar
              value={systemHealth.cpu}
              variant={getHealthColor(systemHealth.cpu, [60, 85])}
              size="sm"
            />
          </div>
        </Tooltip>

        {/* Memory Usage */}
        <Tooltip content={`Memory usage: ${systemHealth.memory}%`}>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Memory</span>
              <span className="font-medium">{systemHealth.memory}%</span>
            </div>
            <ProgressBar
              value={systemHealth.memory}
              variant={getHealthColor(systemHealth.memory, [70, 90])}
              size="sm"
            />
          </div>
        </Tooltip>

        {/* Latency and Uptime */}
        <div className="grid grid-cols-2 gap-3">
          <Tooltip content="Network latency to trading servers">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Latency</div>
              <div
                className={`text-xl font-bold ${
                  systemHealth.latency < 50
                    ? 'text-green-600'
                    : systemHealth.latency < 100
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {formatLatency(systemHealth.latency)}
              </div>
            </div>
          </Tooltip>

          <Tooltip content="System uptime since last restart">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Uptime</div>
              <div className="text-xl font-bold text-gray-900">
                {formatUptime(systemHealth.uptime)}
              </div>
            </div>
          </Tooltip>
        </div>

        {/* Heartbeat indicator */}
        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${
            heartbeatOk ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full ${
              heartbeatOk ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className={`text-sm ${heartbeatOk ? 'text-green-700' : 'text-red-700'}`}>
            {heartbeatOk
              ? 'Heartbeat OK'
              : `No heartbeat for ${Math.floor(timeSinceHeartbeat / 1000)}s`}
          </span>
          {lastUpdate && (
            <span className="ml-auto text-xs text-gray-500">
              Last update: {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemHealthPanel;
