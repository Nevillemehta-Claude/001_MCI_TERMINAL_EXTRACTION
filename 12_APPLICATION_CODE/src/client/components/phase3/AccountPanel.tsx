import React from 'react';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { Tooltip, Spinner } from '../uxmi';

interface AccountPanelProps {
  compact?: boolean;
}

/**
 * Phase 3: Account Panel
 * - Real-time account metrics
 * - P&L display with color coding
 * - Buying power and equity tracking
 */
export const AccountPanel: React.FC<AccountPanelProps> = ({ compact = false }) => {
  const { accountMetrics } = useTelemetryStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (!accountMetrics) {
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Account</h3>
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Spinner size="md" color="gray" label="Loading account data..." />
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Equity',
      value: formatCurrency(accountMetrics.equity),
      tooltip: 'Total account equity',
      highlight: true,
    },
    {
      label: 'Cash',
      value: formatCurrency(accountMetrics.cash),
      tooltip: 'Available cash balance',
    },
    {
      label: 'Buying Power',
      value: formatCurrency(accountMetrics.buyingPower),
      tooltip: 'Available buying power (with margin)',
    },
    {
      label: 'Portfolio Value',
      value: formatCurrency(accountMetrics.portfolioValue),
      tooltip: 'Current value of holdings',
    },
  ];

  const dayProfit = accountMetrics.dayPL >= 0;
  const totalProfit = accountMetrics.totalPL >= 0;

  if (compact) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Account</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500">Equity</div>
            <div className="text-lg font-bold">{formatCurrency(accountMetrics.equity)}</div>
          </div>
          <div className={`p-3 rounded-lg ${dayProfit ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="text-xs text-gray-500">Day P&L</div>
            <div className={`text-lg font-bold ${dayProfit ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(accountMetrics.dayPL)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Account Overview</h3>

      {/* Main metrics grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {metrics.map((metric) => (
          <Tooltip key={metric.label} content={metric.tooltip}>
            <div
              className={`p-4 rounded-lg border ${
                metric.highlight ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
              <div
                className={`text-xl font-bold ${metric.highlight ? 'text-blue-700' : 'text-gray-900'}`}
              >
                {metric.value}
              </div>
            </div>
          </Tooltip>
        ))}
      </div>

      {/* P&L Section */}
      <div className="grid grid-cols-2 gap-3">
        <Tooltip content="Profit/Loss for today">
          <div
            className={`p-4 rounded-lg border ${
              dayProfit ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">Day P&L</div>
            <div className={`text-xl font-bold ${dayProfit ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(accountMetrics.dayPL)}
            </div>
            <div className={`text-sm ${dayProfit ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercent(accountMetrics.dayPLPercent)}
            </div>
          </div>
        </Tooltip>

        <Tooltip content="Total profit/loss">
          <div
            className={`p-4 rounded-lg border ${
              totalProfit ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">Total P&L</div>
            <div className={`text-xl font-bold ${totalProfit ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(accountMetrics.totalPL)}
            </div>
            <div className={`text-sm ${totalProfit ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercent(accountMetrics.totalPLPercent)}
            </div>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default AccountPanel;
