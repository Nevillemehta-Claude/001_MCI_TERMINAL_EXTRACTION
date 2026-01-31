import React, { useEffect, useState, useMemo } from 'react';
import { useTokenStore } from '../../stores/tokenStore';
import { Tooltip, Button } from '../uxmi';

interface TokenTimerProps {
  onExpired?: () => void;
  onRefresh?: () => void;
  showRefreshButton?: boolean;
  compact?: boolean;
}

/**
 * Phase 0: Token Timer Component
 * - Displays time remaining until token expiration
 * - Visual warning states as expiration approaches
 * - Auto-callback on expiration
 * - Optional refresh button
 */
export const TokenTimer: React.FC<TokenTimerProps> = ({
  onExpired,
  onRefresh,
  showRefreshButton = true,
  compact = false,
}) => {
  const { tokenExpiresAt, isTokenValid, clearTokens } = useTokenStore();
  const [now, setNow] = useState(Date.now());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate time remaining
  const timeRemaining = useMemo(() => {
    if (!tokenExpiresAt) return null;
    return Math.max(0, tokenExpiresAt - now);
  }, [tokenExpiresAt, now]);

  // Format time remaining
  const formattedTime = useMemo(() => {
    if (timeRemaining === null) return '--:--:--';

    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  // Determine status level
  const status = useMemo(() => {
    if (timeRemaining === null || !isTokenValid) return 'invalid';
    if (timeRemaining === 0) return 'expired';
    if (timeRemaining < 5 * 60 * 1000) return 'critical'; // < 5 minutes
    if (timeRemaining < 30 * 60 * 1000) return 'warning'; // < 30 minutes
    if (timeRemaining < 60 * 60 * 1000) return 'caution'; // < 1 hour
    return 'healthy';
  }, [timeRemaining, isTokenValid]);

  // Handle expiration
  useEffect(() => {
    if (status === 'expired') {
      onExpired?.();
    }
  }, [status, onExpired]);

  const statusConfig: Record<string, { bg: string; border: string; text: string; icon: string; label: string; animate?: string }> = {
    healthy: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: '✓',
      label: 'Token Valid',
    },
    caution: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: '⏱',
      label: 'Token Active',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: '⚠',
      label: 'Expiring Soon',
    },
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: '⚠',
      label: 'Expiring!',
      animate: 'animate-pulse',
    },
    expired: {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      text: 'text-gray-700',
      icon: '✕',
      label: 'Expired',
    },
    invalid: {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      text: 'text-gray-500',
      icon: '○',
      label: 'No Token',
    },
  };

  const config = statusConfig[status];

  // Compact display
  if (compact) {
    return (
      <Tooltip content={`Token ${config.label}: ${formattedTime} remaining`}>
        <div
          className={`
            inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-mono
            ${config.bg} ${config.border} ${config.text} border
            ${config.animate || ''}
          `}
        >
          <span>{config.icon}</span>
          <span>{formattedTime}</span>
        </div>
      </Tooltip>
    );
  }

  // Full display
  return (
    <div
      className={`
        rounded-lg border p-4
        ${config.bg} ${config.border}
        ${config.animate || ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${config.bg} ${config.border} border-2
            `}
          >
            <span className={`text-lg ${config.text}`}>{config.icon}</span>
          </div>

          <div>
            <p className={`font-medium ${config.text}`}>{config.label}</p>
            <p className={`text-2xl font-mono font-bold ${config.text}`}>
              {formattedTime}
            </p>
          </div>
        </div>

        {showRefreshButton && (status === 'warning' || status === 'critical' || status === 'expired') && (
          <Button
            variant={status === 'expired' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              if (status === 'expired') {
                clearTokens();
              }
              onRefresh?.();
            }}
          >
            {status === 'expired' ? 'Re-authenticate' : 'Refresh'}
          </Button>
        )}
      </div>

      {/* Progress bar */}
      {timeRemaining !== null && status !== 'invalid' && status !== 'expired' && (
        <div className="mt-3">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                status === 'healthy'
                  ? 'bg-green-500'
                  : status === 'caution'
                  ? 'bg-blue-500'
                  : status === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{
                width: `${Math.min(100, (timeRemaining / (24 * 60 * 60 * 1000)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenTimer;
