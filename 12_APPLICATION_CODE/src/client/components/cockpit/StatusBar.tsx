/**
 * StatusBar Component
 * 
 * COCKPIT INTEGRITY: This component displays TRUTHFUL system status at all times.
 * 
 * Resolves:
 * - GAP-01: Real backend connectivity (not simulated)
 * - GAP-02: Persistent token timer visibility
 * - GAP-03: Backend health indicator
 * - GAP-05: Error aggregation indicator
 * - GAP-06: Network connectivity indicator
 * - MINIMAL INTEGRATION: CIA-SIE-PURE engine health visibility
 * 
 * PRINCIPLE: No indicator may imply readiness, connectivity, or health 
 * unless it is verifiably true.
 */

import React from 'react';
import { useTokenStore } from '../../stores/tokenStore';
import { useBackendHealth, useNetworkStatus, useErrorAggregator } from '../../hooks';
import { Tooltip } from '../uxmi';
import { EngineStatusIndicator } from './EngineStatusIndicator';

interface StatusBarProps {
  /** Whether to show the compact version */
  compact?: boolean;
}

/**
 * Truthful status bar - always visible, never lies.
 */
export const StatusBar: React.FC<StatusBarProps> = ({ compact = false }) => {
  const { tokenExpiresAt, kiteAccessToken } = useTokenStore();
  const backendHealth = useBackendHealth({ pollInterval: 5000, enabled: true });
  const networkStatus = useNetworkStatus();
  const errorAggregator = useErrorAggregator();

  // Calculate time until token expiry
  const getTimeUntilExpiry = (): { text: string; urgent: boolean; critical: boolean } => {
    if (!tokenExpiresAt || !kiteAccessToken) {
      return { text: 'No Token', urgent: false, critical: true };
    }

    const now = Date.now();
    const remaining = tokenExpiresAt - now;

    if (remaining <= 0) {
      return { text: 'EXPIRED', urgent: true, critical: true };
    }

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    // Urgent: less than 30 minutes
    // Critical: less than 5 minutes
    const urgent = remaining < 30 * 60 * 1000;
    const critical = remaining < 5 * 60 * 1000;

    if (hours > 0) {
      return { text: `${hours}h ${minutes}m`, urgent, critical };
    }
    if (minutes > 0) {
      return { text: `${minutes}m ${seconds}s`, urgent, critical };
    }
    return { text: `${seconds}s`, urgent, critical };
  };

  const tokenExpiry = getTimeUntilExpiry();

  // Force re-render every second for countdown
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        {/* Network */}
        <Tooltip content={networkStatus.isOnline ? 'Network: Online' : 'Network: OFFLINE'}>
          <div className={`w-2 h-2 rounded-full ${networkStatus.isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
        </Tooltip>

        {/* Backend */}
        <Tooltip content={backendHealth.isReachable ? `Backend: Healthy (${backendHealth.latency}ms)` : `Backend: ${backendHealth.lastError || 'Unreachable'}`}>
          <div className={`w-2 h-2 rounded-full ${backendHealth.isReachable ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
        </Tooltip>

        {/* Token */}
        <Tooltip content={`Token expires in ${tokenExpiry.text}`}>
          <span className={`font-mono ${tokenExpiry.critical ? 'text-red-500 font-bold' : tokenExpiry.urgent ? 'text-yellow-500' : 'text-gray-400'}`}>
            {tokenExpiry.text}
          </span>
        </Tooltip>

        {/* Errors */}
        {errorAggregator.recentCount > 0 && (
          <Tooltip content={`${errorAggregator.recentCount} errors in last 5 minutes`}>
            <span className="text-red-500 font-bold">⚠ {errorAggregator.recentCount}</span>
          </Tooltip>
        )}

        {/* CIA-SIE-PURE Engine Status - MINIMAL INTEGRATION */}
        <EngineStatusIndicator compact pollInterval={10000} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-800 text-white text-sm">
      {/* Network Status */}
      <Tooltip content={
        networkStatus.isOnline 
          ? 'Browser network connection is online' 
          : 'Browser network connection is OFFLINE - check your internet'
      }>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${networkStatus.isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
          <span className={networkStatus.isOnline ? 'text-gray-300' : 'text-red-400 font-bold'}>
            {networkStatus.isOnline ? 'Online' : 'OFFLINE'}
          </span>
        </div>
      </Tooltip>

      <div className="w-px h-4 bg-gray-600" />

      {/* Backend Health */}
      <Tooltip content={
        backendHealth.isReachable
          ? `Backend API is reachable. Latency: ${backendHealth.latency}ms. Status: ${backendHealth.backendStatus}`
          : `Backend API is NOT reachable. ${backendHealth.lastError || 'Check if server is running.'}`
      }>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            backendHealth.isReachable 
              ? backendHealth.backendStatus === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
              : 'bg-red-500 animate-pulse'
          }`} />
          <span className={backendHealth.isReachable ? 'text-gray-300' : 'text-red-400 font-bold'}>
            {backendHealth.isReachable 
              ? `API ${backendHealth.backendStatus === 'healthy' ? 'OK' : 'Degraded'}`
              : 'API DOWN'
            }
          </span>
          {backendHealth.isReachable && backendHealth.latency !== null && (
            <span className="text-gray-500 text-xs">{backendHealth.latency}ms</span>
          )}
        </div>
      </Tooltip>

      <div className="w-px h-4 bg-gray-600" />

      {/* Token Expiry - ALWAYS VISIBLE */}
      <Tooltip content={
        tokenExpiry.critical
          ? 'TOKEN EXPIRING SOON! Re-authenticate immediately.'
          : tokenExpiry.urgent
          ? 'Token expiring within 30 minutes. Prepare to re-authenticate.'
          : `Token expires at 6:00 AM IST. Time remaining: ${tokenExpiry.text}`
      }>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Token:</span>
          <span className={`font-mono font-bold ${
            tokenExpiry.critical 
              ? 'text-red-500 animate-pulse' 
              : tokenExpiry.urgent 
              ? 'text-yellow-400' 
              : 'text-green-400'
          }`}>
            {tokenExpiry.text}
          </span>
          {tokenExpiry.critical && <span className="text-red-500">⚠</span>}
        </div>
      </Tooltip>

      <div className="w-px h-4 bg-gray-600" />

      {/* Error Count */}
      <Tooltip content={
        errorAggregator.recentCount === 0
          ? 'No errors in the last 5 minutes'
          : `${errorAggregator.recentCount} errors in last 5 minutes. Last: ${errorAggregator.lastError?.message || 'Unknown'}`
      }>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Errors:</span>
          <span className={`font-bold ${
            errorAggregator.recentCount > 10 
              ? 'text-red-500' 
              : errorAggregator.recentCount > 0 
              ? 'text-yellow-400' 
              : 'text-green-400'
          }`}>
            {errorAggregator.recentCount}
          </span>
          {errorAggregator.recentCount > 0 && (
            <span className="text-gray-500 text-xs">(total: {errorAggregator.totalCount})</span>
          )}
        </div>
      </Tooltip>

      {/* Backend Health Check Indicator */}
      {backendHealth.isChecking && (
        <span className="text-gray-500 text-xs animate-pulse">checking...</span>
      )}

      <div className="w-px h-4 bg-gray-600" />

      {/* CIA-SIE-PURE Engine Status - MINIMAL INTEGRATION */}
      <EngineStatusIndicator pollInterval={10000} />
    </div>
  );
};

export default StatusBar;
