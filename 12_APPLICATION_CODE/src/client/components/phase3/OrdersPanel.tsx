import React from 'react';
import { useTelemetryStore, Order } from '../../stores/telemetryStore';
import { Tooltip, Spinner } from '../uxmi';

interface OrdersPanelProps {
  compact?: boolean;
  showCanceled?: boolean;
}

/**
 * Phase 3: Orders Panel
 * - Real-time order tracking
 * - Status indicators with animations
 * - Order type and fill information
 */
export const OrdersPanel: React.FC<OrdersPanelProps> = ({
  compact = false,
  showCanceled = false,
}) => {
  const { orders } = useTelemetryStore();

  const filteredOrders = showCanceled
    ? orders
    : orders.filter((o) => o.status !== 'canceled' && o.status !== 'rejected');

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined) return 'MKT';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const statusConfig = {
    new: {
      label: 'New',
      color: 'text-blue-600 bg-blue-100',
      icon: <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />,
    },
    partially_filled: {
      label: 'Partial',
      color: 'text-yellow-600 bg-yellow-100',
      icon: <Spinner size="sm" color="primary" />,
    },
    filled: {
      label: 'Filled',
      color: 'text-green-600 bg-green-100',
      icon: (
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    canceled: {
      label: 'Canceled',
      color: 'text-gray-600 bg-gray-100',
      icon: (
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    rejected: {
      label: 'Rejected',
      color: 'text-red-600 bg-red-100',
      icon: (
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  };

  const OrderRow: React.FC<{ order: Order }> = ({ order }) => {
    const config = statusConfig[order.status];
    const isBuy = order.side === 'buy';

    return (
      <Tooltip
        content={`${order.type.toUpperCase()} | Created: ${formatTime(order.createdAt)}${
          order.filledAt ? ` | Filled: ${formatTime(order.filledAt)}` : ''
        }`}
      >
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200">
          {/* Status icon */}
          <div className="flex-shrink-0">{config.icon}</div>

          {/* Order info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">{order.symbol}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${
                  isBuy ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                }`}
              >
                {order.side.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">{order.type}</span>
            </div>
            <div className="text-sm text-gray-600">
              {order.filledQty}/{order.qty} @ {formatCurrency(order.price)}
            </div>
          </div>

          {/* Status badge */}
          <div className={`text-xs px-2 py-1 rounded ${config.color}`}>
            {config.label}
          </div>
        </div>
      </Tooltip>
    );
  };

  if (filteredOrders.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Orders</h3>
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No active orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Orders ({filteredOrders.length})
        </h3>
        <div className="flex gap-2 text-xs">
          <span className="text-green-600">
            {filteredOrders.filter((o) => o.status === 'filled').length} filled
          </span>
          <span className="text-blue-600">
            {filteredOrders.filter((o) => o.status === 'new' || o.status === 'partially_filled').length} active
          </span>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto space-y-2 ${compact ? 'max-h-48' : ''}`}>
        {filteredOrders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default OrdersPanel;
