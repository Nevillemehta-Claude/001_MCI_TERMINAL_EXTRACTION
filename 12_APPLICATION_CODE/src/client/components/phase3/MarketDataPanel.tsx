import React from 'react';
import { useTelemetryStore, MarketData } from '../../stores/telemetryStore';
import { Tooltip, Spinner } from '../uxmi';

interface MarketDataPanelProps {
  symbols?: string[];
  compact?: boolean;
}

/**
 * Phase 3: Market Data Panel
 * - Real-time price updates
 * - Price change indicators
 * - Volume and range data
 * - Watchlist functionality
 */
export const MarketDataPanel: React.FC<MarketDataPanelProps> = ({
  symbols,
  compact = false,
}) => {
  const { marketData } = useTelemetryStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const dataToDisplay = symbols
    ? symbols.map((s) => marketData[s]).filter(Boolean)
    : Object.values(marketData);

  const MarketRow: React.FC<{ data: MarketData }> = ({ data }) => {
    const isUp = data.change >= 0;
    const pricePosition = ((data.price - data.low) / (data.high - data.low)) * 100;

    return (
      <Tooltip
        content={`High: ${formatCurrency(data.high)} | Low: ${formatCurrency(data.low)} | Open: ${formatCurrency(data.open)}`}
      >
        <div className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-gray-900">{data.symbol}</div>
              <div className="text-xs text-gray-500">
                Vol: {formatVolume(data.volume)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(data.price)}
              </div>
              <div
                className={`text-sm font-medium flex items-center justify-end gap-1 ${
                  isUp ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isUp ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span>
                  {formatCurrency(Math.abs(data.change))} ({formatPercent(data.changePercent)})
                </span>
              </div>
            </div>
          </div>

          {/* Day range indicator */}
          {!compact && (
            <div className="mt-2">
              <div className="h-1 bg-gray-200 rounded-full relative">
                <div
                  className={`absolute w-2 h-2 rounded-full -top-0.5 ${
                    isUp ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ left: `calc(${pricePosition}% - 4px)` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatCurrency(data.low)}</span>
                <span>{formatCurrency(data.high)}</span>
              </div>
            </div>
          )}
        </div>
      </Tooltip>
    );
  };

  if (dataToDisplay.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Market Data</h3>
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Spinner size="md" color="gray" label="Waiting for market data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Market Data</h3>
        <span className="text-xs text-gray-500">
          {dataToDisplay.length} symbol{dataToDisplay.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className={`flex-1 overflow-y-auto space-y-2 ${compact ? 'max-h-48' : ''}`}>
        {dataToDisplay.map((data) => (
          <MarketRow key={data.symbol} data={data} />
        ))}
      </div>
    </div>
  );
};

export default MarketDataPanel;
