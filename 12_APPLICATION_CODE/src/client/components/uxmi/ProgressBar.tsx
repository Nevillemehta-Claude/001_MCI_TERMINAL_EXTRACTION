import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  indeterminate?: boolean;
}

/**
 * UXMI Progress Bar Component (CR-005)
 * - Used for operations 1s-10s (per CR-005 loading indicators)
 * - Smooth animation with transition
 * - Variants for different states
 * - Indeterminate mode for unknown duration
 * - Accessibility: progressbar role with aria-valuenow
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  striped = false,
  indeterminate = false,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Animate value changes
  useEffect(() => {
    if (!indeterminate) {
      const clampedValue = Math.min(100, Math.max(0, value));
      setDisplayValue(clampedValue);
    }
  }, [value, indeterminate]);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4',
  };

  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const trackClasses = {
    default: 'bg-gray-200',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    error: 'bg-red-100',
  };

  const getStripedStyle = () => {
    if (!striped) return {};
    return {
      backgroundImage: `linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
      )`,
      backgroundSize: '1rem 1rem',
    };
  };

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {label || 'Progress'}
          </span>
          {showLabel && !indeterminate && (
            <span className="text-sm text-gray-500">{Math.round(displayValue)}%</span>
          )}
        </div>
      )}

      <div
        className={`w-full rounded-full overflow-hidden ${trackClasses[variant]} ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : displayValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={`
            h-full rounded-full
            ${variantClasses[variant]}
            ${animated && !indeterminate ? 'transition-all duration-300 ease-out' : ''}
            ${indeterminate ? 'animate-indeterminate' : ''}
            ${striped && animated ? 'animate-stripes' : ''}
          `}
          style={{
            width: indeterminate ? '30%' : `${displayValue}%`,
            ...getStripedStyle(),
          }}
        />
      </div>

      <style>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }

        @keyframes stripes {
          from {
            background-position: 1rem 0;
          }
          to {
            background-position: 0 0;
          }
        }

        .animate-indeterminate {
          animation: indeterminate 1.5s ease-in-out infinite;
        }

        .animate-stripes {
          animation: stripes 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;
