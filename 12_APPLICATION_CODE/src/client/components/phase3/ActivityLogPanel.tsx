import React, { useRef, useEffect } from 'react';
import { useTelemetryStore } from '../../stores/telemetryStore';

interface ActivityLogPanelProps {
  maxItems?: number;
  autoScroll?: boolean;
  compact?: boolean;
}

/**
 * Phase 3: Activity Log Panel
 * - Real-time activity stream
 * - Color-coded log types
 * - Auto-scroll to latest
 * - Trade execution highlights
 */
export const ActivityLogPanel: React.FC<ActivityLogPanelProps> = ({
  maxItems = 50,
  autoScroll = true,
  compact = false,
}) => {
  const { activityLog } = useTelemetryStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activityLog, autoScroll]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const typeConfig = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: (
        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: (
        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: (
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    trade: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: (
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  };

  const displayLogs = activityLog.slice(0, maxItems);

  if (displayLogs.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Activity Log</h3>
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No activity yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Activity Log</h3>
        <span className="text-xs text-gray-500">{displayLogs.length} entries</span>
      </div>

      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto space-y-1 ${compact ? 'max-h-48' : ''}`}
      >
        {displayLogs.map((log) => {
          const config = typeConfig[log.type];

          return (
            <div
              key={log.id}
              className={`
                flex items-start gap-2 p-2 rounded border text-sm
                ${config.bg} ${config.border}
                transition-all duration-200
                ${log.type === 'trade' ? 'ring-1 ring-green-300' : ''}
              `}
            >
              <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
              <div className="flex-1 min-w-0">
                <p className={`${config.text} break-words`}>{log.message}</p>
              </div>
              <div className="flex-shrink-0 text-xs text-gray-400 font-mono">
                {formatTime(log.timestamp)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityLogPanel;
