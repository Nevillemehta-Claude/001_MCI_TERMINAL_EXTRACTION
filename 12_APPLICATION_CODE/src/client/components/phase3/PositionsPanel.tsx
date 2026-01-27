import React from 'react';
import { useTelemetryStore, Position } from '../../stores/telemetryStore';
import { Tooltip } from '../uxmi';

interface PositionsPanelProps {
  compact?: boolean;
}

/**
 * Phase 3: Positions Panel
 * - Real-time position monitoring
 * - P&L tracking with color coding
 * - Position details on hover
 */
export const PositionsPanel: React.FC<PositionsPanelProps> = ({ compact = false }) => {
  const { positions } = useTelemetryStore();

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

  const PositionRow: React.FC<{ position: Position }> = ({ position }) => {
    const isProfit = position.unrealizedPL >= 0;

    return (
      <Tooltip
        content={`Entry: ${formatCurrency(position.entryPrice)} | Current: ${formatCurrency(position.currentPrice)}`}
      >
        <div
          className={`
            flex items-center justify-between p-3 rounded-lg border
            ${isProfit ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
            transition-all duration-200 hover:shadow-sm
          `}
        >
          <div className="flex items-center gap-3">
            <div
              className={`
                w-2 h-8 rounded-full
                ${position.side === 'long' ? 'bg-green-500' : 'bg-red-500'}
              `}
            />
            <div>
              <div className="font-bold text-gray-900">{position.symbol}</div>
              <div className="text-xs text-gray-500">
                {position.qty} shares • {position.side.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className={`font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(position.unrealizedPL)}
            </div>
            <div className={`text-xs ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercent(position.unrealizedPLPercent)}
            </div>
          </div>
        </div>
      </Tooltip>
    );
  };

  if (positions.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Open Positions</h3>
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No open positions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Open Positions ({positions.length})
        </h3>
        <div className="text-sm text-gray-500">
          Total: {formatCurrency(positions.reduce((sum, p) => sum + p.marketValue, 0))}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto space-y-2 ${compact ? 'max-h-48' : ''}`}>
        {positions.map((position) => (
          <PositionRow key={position.symbol} position={position} />
        ))}
      </div>
    </div>
  );
};

export default PositionsPanel;
