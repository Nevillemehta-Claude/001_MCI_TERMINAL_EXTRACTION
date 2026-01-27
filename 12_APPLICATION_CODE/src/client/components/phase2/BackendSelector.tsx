import React from 'react';
import { useIgnitionStore, BackendType } from '../../stores/ignitionStore';
import { Tooltip } from '../uxmi';

interface BackendSelectorProps {
  disabled?: boolean;
  onSelect?: (type: BackendType) => void;
}

/**
 * Phase 2: Backend Selector (P2 REMEDIATION)
 * - 4 Indian Brokers: ICICI Direct, HDFC Sky, Kotak Neo, Zerodha Kite
 * - All connect to NSE/BSE Indian markets
 * - Each requires confirmation before connection
 * - CR-004 compliant: Works with Kite token expiry at 6:00 AM IST
 */
export const BackendSelector: React.FC<BackendSelectorProps> = ({
  disabled = false,
  onSelect,
}) => {
  const { selectedBackend, backendConfigs, selectBackend } = useIgnitionStore();

  const handleSelect = (type: BackendType) => {
    if (disabled) return;
    selectBackend(type);
    onSelect?.(type);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Select Indian Broker</h3>
      <p className="text-sm text-gray-600">
        Choose your broker to connect to NSE/BSE markets
      </p>

      <div className="grid grid-cols-2 gap-4">
        {backendConfigs.map((config) => {
          const isSelected = selectedBackend === config.type;

          return (
            <Tooltip
              key={config.type}
              content={`Connect via ${config.broker} API`}
            >
              <button
                onClick={() => handleSelect(config.type)}
                disabled={disabled}
                className={`
                  relative p-6 rounded-xl border-2 text-left transition-all duration-200
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center bg-teal-500">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}

                {/* Icon */}
                <div className="text-4xl mb-3">{config.icon}</div>

                {/* Name */}
                <h4
                  className={`text-xl font-bold ${
                    isSelected ? 'text-teal-700' : 'text-gray-900'
                  }`}
                >
                  {config.name}
                </h4>

                {/* Broker name */}
                <p className="text-xs text-gray-500 mt-1">{config.broker}</p>

                {/* Description */}
                <p className="text-sm text-gray-600 mt-2">{config.description}</p>

                {/* Connection badge */}
                <div className="mt-4 flex items-center gap-2 text-amber-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs font-medium">Requires API credentials</span>
                </div>
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* Market info banner */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Indian Markets:</strong> NSE/BSE trading hours 9:15 AM - 3:30 PM IST.
          Tokens expire at 6:00 AM IST daily (CR-004).
        </p>
      </div>
    </div>
  );
};

export default BackendSelector;
