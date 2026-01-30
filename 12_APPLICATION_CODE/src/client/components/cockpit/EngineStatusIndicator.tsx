/**
 * Engine Status Indicator Component
 * 
 * MINIMAL INTEGRATION: Health visibility ONLY.
 * 
 * Displays truthful CIA-SIE-PURE connection status:
 * - ENGINE: CONNECTED (green) - Process reachable, API responsive
 * - ENGINE: DISCONNECTED (red) - Process unreachable or API unresponsive
 * - ENGINE: CHECKING (gray pulsing) - Health check in progress
 * - ENGINE: UNKNOWN (gray) - No check performed yet
 * 
 * EXPLICITLY PROHIBITED:
 * - ❌ No telemetry display
 * - ❌ No start/stop controls
 * - ❌ No lifecycle interactions
 * - ❌ No state synchronization
 * 
 * This component is TRUTHFUL — it shows exactly what is known.
 */

import React from 'react';
import { useCiaSieHealth } from '../../hooks/useCiaSieHealth';
import { Tooltip } from '../uxmi';

// ============================================================================
// TYPES
// ============================================================================

interface EngineStatusIndicatorProps {
  /** Whether to show compact version (icon only) */
  compact?: boolean;
  /** Custom polling interval in ms (default: 10000) */
  pollInterval?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Truthful engine connection status indicator.
 * 
 * Shows ENGINE: CONNECTED or ENGINE: DISCONNECTED based on
 * actual health check results from CIA-SIE-PURE.
 */
export const EngineStatusIndicator: React.FC<EngineStatusIndicatorProps> = ({
  compact = false,
  pollInterval = 10000,
}) => {
  const health = useCiaSieHealth({ pollInterval, enabled: true });

  // Determine indicator color
  const getStatusColor = (): string => {
    switch (health.status) {
      case 'CONNECTED':
        return 'bg-green-500';
      case 'DISCONNECTED':
        return 'bg-red-500';
      case 'CHECKING':
        return 'bg-gray-400 animate-pulse';
      case 'UNKNOWN':
      default:
        return 'bg-gray-500';
    }
  };

  // Determine text color
  const getTextColor = (): string => {
    switch (health.status) {
      case 'CONNECTED':
        return 'text-green-400';
      case 'DISCONNECTED':
        return 'text-red-400 font-bold';
      case 'CHECKING':
        return 'text-gray-400';
      case 'UNKNOWN':
      default:
        return 'text-gray-500';
    }
  };

  // Build tooltip content
  const getTooltipContent = (): string => {
    switch (health.status) {
      case 'CONNECTED':
        return `CIA-SIE-PURE engine is reachable and responding. Latency: ${health.latencyMs}ms`;
      case 'DISCONNECTED':
        return `CIA-SIE-PURE engine is NOT reachable. ${health.lastError || 'Check if the engine is running.'}${
          health.consecutiveFailures > 1 ? ` (${health.consecutiveFailures} consecutive failures)` : ''
        }`;
      case 'CHECKING':
        return 'Checking CIA-SIE-PURE engine status...';
      case 'UNKNOWN':
      default:
        return 'CIA-SIE-PURE engine status has not been checked yet.';
    }
  };

  if (compact) {
    return (
      <Tooltip content={getTooltipContent()}>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <span className={`text-xs font-mono ${getTextColor()}`}>
            {health.status === 'CONNECTED' ? 'ENG' : health.status === 'DISCONNECTED' ? 'ENG!' : 'ENG?'}
          </span>
        </div>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={getTooltipContent()}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-gray-400">ENGINE:</span>
        <span className={`font-mono font-bold ${getTextColor()}`}>
          {health.status}
        </span>
        {health.isConnected && health.latencyMs !== null && (
          <span className="text-gray-500 text-xs">{health.latencyMs}ms</span>
        )}
        {health.isChecking && (
          <span className="text-gray-500 text-xs animate-pulse">...</span>
        )}
      </div>
    </Tooltip>
  );
};

export default EngineStatusIndicator;
