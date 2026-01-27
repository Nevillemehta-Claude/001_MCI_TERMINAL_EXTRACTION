import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrdersPanel } from '../OrdersPanel';
import { useTelemetryStore, Order } from '../../../stores/telemetryStore';

// Mock the telemetry store
vi.mock('../../../stores/telemetryStore', () => ({
  useTelemetryStore: vi.fn(),
}));

describe('OrdersPanel component', () => {
  const mockOrders: Order[] = [
    {
      id: 'order-1',
      symbol: 'AAPL',
      side: 'buy',
      type: 'limit',
      qty: 100,
      filledQty: 100,
      price: 150,
      status: 'filled',
      createdAt: Date.now() - 60000,
      filledAt: Date.now() - 30000,
    },
    {
      id: 'order-2',
      symbol: 'GOOGL',
      side: 'sell',
      type: 'market',
      qty: 50,
      filledQty: 25,
      status: 'partially_filled',
      createdAt: Date.now() - 30000,
    },
    {
      id: 'order-3',
      symbol: 'TSLA',
      side: 'buy',
      type: 'stop',
      qty: 10,
      filledQty: 0,
      price: 280,
      status: 'new',
      createdAt: Date.now() - 10000,
    },
    {
      id: 'order-4',
      symbol: 'NVDA',
      side: 'sell',
      type: 'limit',
      qty: 20,
      filledQty: 0,
      price: 500,
      status: 'canceled',
      createdAt: Date.now() - 120000,
    },
    {
      id: 'order-5',
      symbol: 'AMD',
      side: 'buy',
      type: 'limit',
      qty: 30,
      filledQty: 0,
      price: 100,
      status: 'rejected',
      createdAt: Date.now() - 90000,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty state', () => {
    it('should show "No active orders" when orders array is empty', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({ orders: [] });
      render(<OrdersPanel />);
      expect(screen.getByText('No active orders')).toBeInTheDocument();
    });

    it('should show Orders heading in empty state', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({ orders: [] });
      render(<OrdersPanel />);
      expect(screen.getByText('Orders')).toBeInTheDocument();
    });
  });

  describe('order filtering', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ orders: mockOrders });
    });

    it('should filter out canceled and rejected orders by default', () => {
      render(<OrdersPanel />);
      expect(screen.queryByText('NVDA')).not.toBeInTheDocument();
      expect(screen.queryByText('AMD')).not.toBeInTheDocument();
    });

    it('should show canceled and rejected orders when showCanceled is true', () => {
      render(<OrdersPanel showCanceled />);
      expect(screen.getByText('NVDA')).toBeInTheDocument();
      expect(screen.getByText('AMD')).toBeInTheDocument();
    });

    it('should show correct count excluding canceled/rejected', () => {
      render(<OrdersPanel />);
      expect(screen.getByText('Orders (3)')).toBeInTheDocument();
    });

    it('should show correct count including canceled/rejected', () => {
      render(<OrdersPanel showCanceled />);
      expect(screen.getByText('Orders (5)')).toBeInTheDocument();
    });
  });

  describe('order rendering', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ orders: mockOrders });
    });

    it('should display order symbols', () => {
      render(<OrdersPanel />);
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
      expect(screen.getByText('TSLA')).toBeInTheDocument();
    });

    it('should display order sides', () => {
      render(<OrdersPanel />);
      expect(screen.getAllByText('BUY').length).toBeGreaterThan(0);
      expect(screen.getAllByText('SELL').length).toBeGreaterThan(0);
    });

    it('should display order types', () => {
      render(<OrdersPanel />);
      expect(screen.getByText('limit')).toBeInTheDocument();
      expect(screen.getByText('market')).toBeInTheDocument();
      expect(screen.getByText('stop')).toBeInTheDocument();
    });

    it('should display fill progress', () => {
      render(<OrdersPanel />);
      expect(screen.getByText(/100\/100/)).toBeInTheDocument();
      expect(screen.getByText(/25\/50/)).toBeInTheDocument();
      // 0/10 appears in multiple places (TSLA order), use getAllByText
      expect(screen.getAllByText(/0\/10/).length).toBeGreaterThan(0);
    });

    it('should display price or MKT for market orders', () => {
      render(<OrdersPanel />);
      expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
      expect(screen.getByText(/MKT/)).toBeInTheDocument();
    });
  });

  describe('status badges', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ orders: mockOrders });
    });

    it('should show Filled status badge', () => {
      render(<OrdersPanel />);
      expect(screen.getByText('Filled')).toBeInTheDocument();
    });

    it('should show Partial status badge', () => {
      render(<OrdersPanel />);
      expect(screen.getByText('Partial')).toBeInTheDocument();
    });

    it('should show New status badge', () => {
      render(<OrdersPanel />);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should show Canceled status badge when showCanceled is true', () => {
      render(<OrdersPanel showCanceled />);
      expect(screen.getByText('Canceled')).toBeInTheDocument();
    });

    it('should show Rejected status badge when showCanceled is true', () => {
      render(<OrdersPanel showCanceled />);
      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });
  });

  describe('order counts', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ orders: mockOrders });
    });

    it('should display filled count', () => {
      render(<OrdersPanel />);
      expect(screen.getByText('1 filled')).toBeInTheDocument();
    });

    it('should display active count', () => {
      render(<OrdersPanel />);
      expect(screen.getByText('2 active')).toBeInTheDocument();
    });
  });

  describe('side styling', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ orders: mockOrders });
    });

    it('should apply green styling for buy orders', () => {
      const { container } = render(<OrdersPanel />);
      expect(container.querySelector('.text-green-700')).toBeInTheDocument();
    });

    it('should apply red styling for sell orders', () => {
      const { container } = render(<OrdersPanel />);
      expect(container.querySelector('.text-red-700')).toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ orders: mockOrders });
    });

    it('should apply max-height class in compact mode', () => {
      const { container } = render(<OrdersPanel compact />);
      expect(container.querySelector('.max-h-48')).toBeInTheDocument();
    });

    it('should not apply max-height class in full mode', () => {
      const { container } = render(<OrdersPanel compact={false} />);
      expect(container.querySelector('.max-h-48')).not.toBeInTheDocument();
    });
  });

  describe('status icons', () => {
    it('should show spinner for partially filled orders', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        orders: [mockOrders[1]], // partially_filled order
      });
      render(<OrdersPanel />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show checkmark icon for filled orders', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        orders: [mockOrders[0]], // filled order
      });
      const { container } = render(<OrdersPanel />);
      expect(container.querySelector('.text-green-500')).toBeInTheDocument();
    });
  });
});
