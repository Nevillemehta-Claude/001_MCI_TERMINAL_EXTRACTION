import React from 'react';
import { Button } from './Button';

interface ErrorDisplayProps {
  /** WHAT happened - Brief description of the error */
  what: string;
  /** WHY it happened - Technical or contextual reason */
  why?: string;
  /** HOW to fix it - Actionable steps for the user */
  how?: string;
  /** Error code for reference */
  code?: string;
  /** Severity level */
  severity?: 'error' | 'warning' | 'info';
  /** Retry action */
  onRetry?: () => void;
  /** Dismiss action */
  onDismiss?: () => void;
  /** Additional actions */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  /** Show technical details (expandable) */
  technicalDetails?: string;
  /** Compact mode for inline errors */
  compact?: boolean;
}

/**
 * UXMI Error Display Component (CR-005)
 * - WHAT/WHY/HOW format for clear error communication
 * - Severity levels: error (red), warning (yellow), info (blue)
 * - Optional retry and dismiss actions
 * - Expandable technical details
 * - Accessible with proper ARIA attributes
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  what,
  why,
  how,
  code,
  severity = 'error',
  onRetry,
  onDismiss,
  actions = [],
  technicalDetails,
  compact = false,
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  const severityConfig = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      iconCompact: (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      textColor: 'text-red-800',
      subtextColor: 'text-red-700',
      codeColor: 'text-red-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: (
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      iconCompact: (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      textColor: 'text-yellow-800',
      subtextColor: 'text-yellow-700',
      codeColor: 'text-yellow-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      iconCompact: (
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
      textColor: 'text-blue-800',
      subtextColor: 'text-blue-700',
      codeColor: 'text-blue-600',
    },
  };

  const config = severityConfig[severity];

  // Compact mode for inline errors
  if (compact) {
    return (
      <div
        role="alert"
        className={`flex items-center gap-2 p-2 rounded-md ${config.bg} ${config.border} border`}
      >
        {config.iconCompact}
        <span className={`text-sm ${config.textColor}`}>{what}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-auto p-1 rounded hover:bg-black/5 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }

  // Full error display
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`rounded-lg border ${config.bg} ${config.border} overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{config.icon}</div>

          <div className="flex-1 min-w-0">
            {/* WHAT happened */}
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold ${config.textColor}`}>{what}</h3>
              {code && (
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${config.bg} ${config.codeColor} border ${config.border}`}>
                  {code}
                </span>
              )}
            </div>

            {/* WHY it happened */}
            {why && (
              <p className={`mt-1 text-sm ${config.subtextColor}`}>
                <strong>Why:</strong> {why}
              </p>
            )}

            {/* HOW to fix it */}
            {how && (
              <p className={`mt-1 text-sm ${config.subtextColor}`}>
                <strong>How to fix:</strong> {how}
              </p>
            )}

            {/* Technical details (expandable) */}
            {technicalDetails && (
              <div className="mt-3">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={`text-sm ${config.textColor} hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded flex items-center gap-1`}
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Technical details
                </button>
                {showDetails && (
                  <pre className="mt-2 p-2 bg-black/5 rounded text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                    {technicalDetails}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            {(onRetry || onDismiss || actions.length > 0) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {onRetry && (
                  <Button size="sm" variant="primary" onClick={onRetry}>
                    Try Again
                  </Button>
                )}
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={action.variant || 'secondary'}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                ))}
                {onDismiss && (
                  <Button size="sm" variant="secondary" onClick={onDismiss}>
                    Dismiss
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
