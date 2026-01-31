import React from 'react';
import { Tooltip, Spinner } from '../uxmi';
import type { ScanCheck } from '../../stores/scannerStore';

interface ScanCheckItemProps {
  check: ScanCheck;
  showDetails?: boolean;
}

/**
 * Phase 1: Individual Scan Check Item
 * - Visual status indicator
 * - Animated transitions between states
 * - Duration display for completed checks
 * - Critical indicator for blocking checks
 */
export const ScanCheckItem: React.FC<ScanCheckItemProps> = ({
  check,
  showDetails = true,
}) => {
  const statusConfig = {
    pending: {
      icon: (
        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
      ),
      bg: 'bg-gray-50',
      text: 'text-gray-500',
      label: 'Pending',
    },
    running: {
      icon: <Spinner size="sm" color="primary" />,
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      label: 'Running',
    },
    passed: {
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bg: 'bg-green-50',
      text: 'text-green-700',
      label: 'Passed',
    },
    failed: {
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bg: 'bg-red-50',
      text: 'text-red-700',
      label: 'Failed',
    },
    warning: {
      icon: (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      label: 'Warning',
    },
    skipped: {
      icon: (
        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bg: 'bg-gray-100',
      text: 'text-gray-500',
      label: 'Skipped',
    },
  };

  const config = statusConfig[check.status];

  const categoryColors = {
    connection: 'text-purple-600 bg-purple-100',
    auth: 'text-indigo-600 bg-indigo-100',
    market: 'text-cyan-600 bg-cyan-100',
    system: 'text-orange-600 bg-orange-100',
    config: 'text-pink-600 bg-pink-100',
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg border transition-all duration-200
        ${config.bg} border-transparent
        ${check.status === 'running' ? 'ring-2 ring-blue-200' : ''}
      `}
    >
      {/* Status Icon */}
      <div className="flex-shrink-0">{config.icon}</div>

      {/* Check Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium ${config.text}`}>{check.name}</span>
          {check.critical && (
            <Tooltip content="Critical check - failure blocks ignition">
              <span className="text-xs font-bold text-red-500">CRITICAL</span>
            </Tooltip>
          )}
        </div>

        {showDetails && (
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${categoryColors[check.category]}`}
            >
              {check.category}
            </span>
            <span className="text-xs text-gray-500">{check.description}</span>
          </div>
        )}

        {check.message && (
          <p
            className={`text-sm mt-1 ${
              check.status === 'failed'
                ? 'text-red-600'
                : check.status === 'warning'
                ? 'text-yellow-600'
                : 'text-gray-600'
            }`}
          >
            {check.message}
          </p>
        )}
      </div>

      {/* Duration */}
      {check.duration !== undefined && (
        <div className="flex-shrink-0 text-right">
          <span className="text-xs font-mono text-gray-500">
            {check.duration}ms
          </span>
        </div>
      )}
    </div>
  );
};

export default ScanCheckItem;
