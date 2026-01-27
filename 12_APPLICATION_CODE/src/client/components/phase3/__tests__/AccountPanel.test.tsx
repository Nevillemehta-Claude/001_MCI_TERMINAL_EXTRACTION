import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccountPanel } from '../AccountPanel';
import { useTelemetryStore, AccountMetrics } from '../../../stores/telemetryStore';

// Mock the telemetry store
vi.mock('../../../stores/telemetryStore', () => ({
  useTelemetryStore: vi.fn(),
}));

describe('AccountPanel component', () => {
  const mockAccountMetrics: AccountMetrics = {
    equity: 100000,
    cash: 50000,
    buyingPower: 200000,
    portfolioValue: 50000,
    dayPL: 1500,
    dayPLPercent: 1.5,
    totalPL: 5000,
    totalPLPercent: 5.0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loading spinner when accountMetrics is null', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({ accountMetrics: null });
      render(<AccountPanel />);
      // Spinner component renders label twice (visible and sr-only)
      expect(screen.getAllByText('Loading account data...').length).toBeGreaterThan(0);
    });

    it('should show Account heading in loading state', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({ accountMetrics: null });
      render(<AccountPanel />);
      expect(screen.getByText('Account')).toBeInTheDocument();
    });
  });

  describe('full mode rendering', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ accountMetrics: mockAccountMetrics });
    });

    it('should render Account Overview heading', () => {
      render(<AccountPanel />);
      expect(screen.getByText('Account Overview')).toBeInTheDocument();
    });

    it('should display equity value', () => {
      render(<AccountPanel />);
      expect(screen.getByText('$100,000.00')).toBeInTheDocument();
    });

    it('should display cash value', () => {
      render(<AccountPanel />);
      // Cash and portfolio value may both be $50,000.00
      expect(screen.getAllByText('$50,000.00').length).toBeGreaterThan(0);
    });

    it('should display buying power value', () => {
      render(<AccountPanel />);
      expect(screen.getByText('$200,000.00')).toBeInTheDocument();
    });

    it('should display Day P&L', () => {
      render(<AccountPanel />);
      expect(screen.getByText('Day P&L')).toBeInTheDocument();
      expect(screen.getByText('$1,500.00')).toBeInTheDocument();
    });

    it('should display Day P&L percentage', () => {
      render(<AccountPanel />);
      expect(screen.getByText('+1.50%')).toBeInTheDocument();
    });

    it('should display Total P&L', () => {
      render(<AccountPanel />);
      expect(screen.getByText('Total P&L')).toBeInTheDocument();
      expect(screen.getByText('$5,000.00')).toBeInTheDocument();
    });

    it('should display Total P&L percentage', () => {
      render(<AccountPanel />);
      expect(screen.getByText('+5.00%')).toBeInTheDocument();
    });
  });

  describe('compact mode rendering', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ accountMetrics: mockAccountMetrics });
    });

    it('should render Account heading in compact mode', () => {
      render(<AccountPanel compact />);
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('should display equity in compact mode', () => {
      render(<AccountPanel compact />);
      expect(screen.getByText('Equity')).toBeInTheDocument();
      expect(screen.getByText('$100,000.00')).toBeInTheDocument();
    });

    it('should display Day P&L in compact mode', () => {
      render(<AccountPanel compact />);
      expect(screen.getByText('Day P&L')).toBeInTheDocument();
    });
  });

  describe('P&L color coding', () => {
    it('should show green styling for positive day P&L', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({ accountMetrics: mockAccountMetrics });
      const { container } = render(<AccountPanel />);
      expect(container.querySelector('.text-green-600')).toBeInTheDocument();
    });

    it('should show red styling for negative day P&L', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        accountMetrics: { ...mockAccountMetrics, dayPL: -1500, dayPLPercent: -1.5 },
      });
      const { container } = render(<AccountPanel />);
      expect(container.querySelector('.text-red-600')).toBeInTheDocument();
    });

    it('should show green background for positive P&L', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({ accountMetrics: mockAccountMetrics });
      const { container } = render(<AccountPanel />);
      expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
    });

    it('should show red background for negative P&L', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        accountMetrics: { ...mockAccountMetrics, dayPL: -500, dayPLPercent: -0.5 },
      });
      const { container } = render(<AccountPanel />);
      expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
    });
  });

  describe('equity highlight', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ accountMetrics: mockAccountMetrics });
    });

    it('should apply blue highlight to equity card', () => {
      const { container } = render(<AccountPanel />);
      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
    });
  });

  describe('currency formatting', () => {
    it('should format large numbers with commas', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        accountMetrics: { ...mockAccountMetrics, equity: 1234567.89 },
      });
      render(<AccountPanel />);
      expect(screen.getByText('$1,234,567.89')).toBeInTheDocument();
    });

    it('should format negative P&L correctly', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        accountMetrics: { ...mockAccountMetrics, dayPL: -1234.56, dayPLPercent: -1.23 },
      });
      render(<AccountPanel />);
      expect(screen.getByText('-$1,234.56')).toBeInTheDocument();
      expect(screen.getByText('-1.23%')).toBeInTheDocument();
    });
  });
});
