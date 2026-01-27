import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PositionsPanel } from '../PositionsPanel';
import { useTelemetryStore, Position } from '../../../stores/telemetryStore';

// Mock the telemetry store
vi.mock('../../../stores/telemetryStore', () => ({
  useTelemetryStore: vi.fn(),
}));

describe('PositionsPanel component', () => {
  const mockPositions: Position[] = [
    {
      symbol: 'AAPL',
      qty: 100,
      side: 'long',
      entryPrice: 150,
      currentPrice: 155,
      unrealizedPL: 500,
      unrealizedPLPercent: 3.33,
      marketValue: 15500,
    },
    {
      symbol: 'GOOGL',
      qty: 50,
      side: 'long',
      entryPrice: 2800,
      currentPrice: 2750,
      unrealizedPL: -2500,
      unrealizedPLPercent: -1.79,
      marketValue: 137500,
    },
    {
      symbol: 'TSLA',
      qty: 25,
      side: 'short',
      entryPrice: 300,
      currentPrice: 280,
      unrealizedPL: 500,
      unrealizedPLPercent: 6.67,
      marketValue: 7000,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty state', () => {
    it('should show "No open positions" when positions array is empty', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({ positions: [] });
      render(<PositionsPanel />);
      expect(screen.getByText('No open positions')).toBeInTheDocument();
    });

    it('should show Open Positions heading in empty state', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({ positions: [] });
      render(<PositionsPanel />);
      expect(screen.getByText('Open Positions')).toBeInTheDocument();
    });
  });

  describe('positions rendering', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ positions: mockPositions });
    });

    it('should show position count in heading', () => {
      render(<PositionsPanel />);
      expect(screen.getByText('Open Positions (3)')).toBeInTheDocument();
    });

    it('should display total market value', () => {
      render(<PositionsPanel />);
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
      // Total is sum of marketValues: 15500 + 137500 + 7000 = 160000
      expect(screen.getByText(/\$160,000\.00/)).toBeInTheDocument();
    });

    it('should display all position symbols', () => {
      render(<PositionsPanel />);
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
      expect(screen.getByText('TSLA')).toBeInTheDocument();
    });

    it('should display position quantities and sides', () => {
      render(<PositionsPanel />);
      expect(screen.getByText(/100 shares • LONG/)).toBeInTheDocument();
      expect(screen.getByText(/50 shares • LONG/)).toBeInTheDocument();
      expect(screen.getByText(/25 shares • SHORT/)).toBeInTheDocument();
    });

    it('should display unrealized P&L values', () => {
      render(<PositionsPanel />);
      // Two positions have $500 unrealized P&L (AAPL and TSLA)
      expect(screen.getAllByText('$500.00').length).toBeGreaterThan(0);
      expect(screen.getByText('-$2,500.00')).toBeInTheDocument();
    });

    it('should display unrealized P&L percentages', () => {
      render(<PositionsPanel />);
      expect(screen.getByText('+3.33%')).toBeInTheDocument();
      expect(screen.getByText('-1.79%')).toBeInTheDocument();
    });
  });

  describe('P&L color coding', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ positions: mockPositions });
    });

    it('should apply green styling for profitable positions', () => {
      const { container } = render(<PositionsPanel />);
      expect(container.querySelector('.text-green-600')).toBeInTheDocument();
    });

    it('should apply red styling for losing positions', () => {
      const { container } = render(<PositionsPanel />);
      expect(container.querySelector('.text-red-600')).toBeInTheDocument();
    });

    it('should apply green background for profitable positions', () => {
      const { container } = render(<PositionsPanel />);
      expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
    });

    it('should apply red background for losing positions', () => {
      const { container } = render(<PositionsPanel />);
      expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
    });
  });

  describe('side indicator', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ positions: mockPositions });
    });

    it('should show green indicator for long positions', () => {
      const { container } = render(<PositionsPanel />);
      const greenIndicators = container.querySelectorAll('[class*="bg-green-500"]');
      expect(greenIndicators.length).toBeGreaterThan(0);
    });

    it('should show red indicator for short positions', () => {
      const { container } = render(<PositionsPanel />);
      const redIndicators = container.querySelectorAll('[class*="bg-red-500"]');
      expect(redIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('compact mode', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ positions: mockPositions });
    });

    it('should apply max-height class in compact mode', () => {
      const { container } = render(<PositionsPanel compact />);
      expect(container.querySelector('.max-h-48')).toBeInTheDocument();
    });

    it('should not apply max-height class in full mode', () => {
      const { container } = render(<PositionsPanel compact={false} />);
      expect(container.querySelector('.max-h-48')).not.toBeInTheDocument();
    });
  });

  describe('currency formatting', () => {
    it('should format large P&L values correctly', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        positions: [
          {
            ...mockPositions[0],
            unrealizedPL: 12345.67,
            unrealizedPLPercent: 12.34,
          },
        ],
      });
      render(<PositionsPanel />);
      expect(screen.getByText('$12,345.67')).toBeInTheDocument();
    });

    it('should format negative P&L values correctly', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        positions: [
          {
            ...mockPositions[0],
            unrealizedPL: -9876.54,
            unrealizedPLPercent: -5.43,
          },
        ],
      });
      render(<PositionsPanel />);
      expect(screen.getByText('-$9,876.54')).toBeInTheDocument();
    });
  });
});
