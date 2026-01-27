import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarketDataPanel } from '../MarketDataPanel';
import { useTelemetryStore, MarketData } from '../../../stores/telemetryStore';

// Mock the telemetry store
vi.mock('../../../stores/telemetryStore', () => ({
  useTelemetryStore: vi.fn(),
}));

describe('MarketDataPanel component', () => {
  const mockMarketData: Record<string, MarketData> = {
    AAPL: {
      symbol: 'AAPL',
      price: 175.50,
      change: 2.50,
      changePercent: 1.45,
      volume: 45000000,
      high: 177.00,
      low: 173.00,
      open: 174.00,
      timestamp: Date.now(),
    },
    GOOGL: {
      symbol: 'GOOGL',
      price: 2850.00,
      change: -25.00,
      changePercent: -0.87,
      volume: 1500000,
      high: 2880.00,
      low: 2840.00,
      open: 2875.00,
      timestamp: Date.now(),
    },
    TSLA: {
      symbol: 'TSLA',
      price: 285.00,
      change: 5.00,
      changePercent: 1.79,
      volume: 25000000,
      high: 290.00,
      low: 280.00,
      open: 282.00,
      timestamp: Date.now(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loading spinner when no market data', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({ marketData: {} });
      render(<MarketDataPanel />);
      // Spinner renders label twice (visible and sr-only)
      expect(screen.getAllByText('Waiting for market data...').length).toBeGreaterThan(0);
    });

    it('should show Market Data heading in loading state', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({ marketData: {} });
      render(<MarketDataPanel />);
      expect(screen.getByText('Market Data')).toBeInTheDocument();
    });
  });

  describe('market data rendering', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ marketData: mockMarketData });
    });

    it('should display symbol count', () => {
      render(<MarketDataPanel />);
      expect(screen.getByText('3 symbols')).toBeInTheDocument();
    });

    it('should display singular "symbol" for one item', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        marketData: { AAPL: mockMarketData.AAPL },
      });
      render(<MarketDataPanel />);
      expect(screen.getByText('1 symbol')).toBeInTheDocument();
    });

    it('should display all symbols', () => {
      render(<MarketDataPanel />);
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
      expect(screen.getByText('TSLA')).toBeInTheDocument();
    });

    it('should display current prices', () => {
      render(<MarketDataPanel />);
      expect(screen.getByText('$175.50')).toBeInTheDocument();
      expect(screen.getByText('$2,850.00')).toBeInTheDocument();
      expect(screen.getByText('$285.00')).toBeInTheDocument();
    });

    it('should display price changes', () => {
      render(<MarketDataPanel />);
      expect(screen.getByText(/\$2\.50/)).toBeInTheDocument();
      expect(screen.getByText(/\$25\.00/)).toBeInTheDocument();
    });

    it('should display change percentages', () => {
      render(<MarketDataPanel />);
      expect(screen.getByText(/\+1\.45%/)).toBeInTheDocument();
      expect(screen.getByText(/-0\.87%/)).toBeInTheDocument();
    });
  });

  describe('volume formatting', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ marketData: mockMarketData });
    });

    it('should format volume in millions', () => {
      render(<MarketDataPanel />);
      expect(screen.getByText('Vol: 45.0M')).toBeInTheDocument();
    });

    it('should format volume in millions for smaller values', () => {
      render(<MarketDataPanel />);
      expect(screen.getByText('Vol: 1.5M')).toBeInTheDocument();
    });

    it('should format volume in K for thousands', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        marketData: {
          TEST: { ...mockMarketData.AAPL, symbol: 'TEST', volume: 500000 },
        },
      });
      render(<MarketDataPanel />);
      expect(screen.getByText('Vol: 500.0K')).toBeInTheDocument();
    });
  });

  describe('symbol filtering', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ marketData: mockMarketData });
    });

    it('should display only specified symbols', () => {
      render(<MarketDataPanel symbols={['AAPL', 'TSLA']} />);
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('TSLA')).toBeInTheDocument();
      expect(screen.queryByText('GOOGL')).not.toBeInTheDocument();
    });

    it('should display all symbols when no filter provided', () => {
      render(<MarketDataPanel />);
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
      expect(screen.getByText('TSLA')).toBeInTheDocument();
    });

    it('should handle symbols not in market data', () => {
      render(<MarketDataPanel symbols={['AAPL', 'NVDA']} />);
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.queryByText('NVDA')).not.toBeInTheDocument();
      expect(screen.getByText('1 symbol')).toBeInTheDocument();
    });
  });

  describe('price direction styling', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ marketData: mockMarketData });
    });

    it('should apply green styling for positive change', () => {
      const { container } = render(<MarketDataPanel />);
      expect(container.querySelector('.text-green-600')).toBeInTheDocument();
    });

    it('should apply red styling for negative change', () => {
      const { container } = render(<MarketDataPanel />);
      expect(container.querySelector('.text-red-600')).toBeInTheDocument();
    });
  });

  describe('day range indicator', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ marketData: mockMarketData });
    });

    it('should display high and low values in full mode', () => {
      render(<MarketDataPanel />);
      expect(screen.getByText('$177.00')).toBeInTheDocument();
      expect(screen.getByText('$173.00')).toBeInTheDocument();
    });

    it('should not display range in compact mode', () => {
      render(<MarketDataPanel compact />);
      expect(screen.queryByText('$177.00')).not.toBeInTheDocument();
      expect(screen.queryByText('$173.00')).not.toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ marketData: mockMarketData });
    });

    it('should apply max-height class in compact mode', () => {
      const { container } = render(<MarketDataPanel compact />);
      expect(container.querySelector('.max-h-48')).toBeInTheDocument();
    });

    it('should not apply max-height class in full mode', () => {
      const { container } = render(<MarketDataPanel compact={false} />);
      expect(container.querySelector('.max-h-48')).not.toBeInTheDocument();
    });
  });
});
