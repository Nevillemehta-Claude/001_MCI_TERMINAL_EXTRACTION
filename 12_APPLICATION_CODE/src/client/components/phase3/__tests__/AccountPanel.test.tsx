/**
 * AccountPanel Tests
 * Tests for Phase 3 account metrics display
 * Uses INR currency (₹) and en-IN locale for Indian market
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccountPanel } from '../AccountPanel';

// Mock the telemetry store
const mockTelemetryStore = {
  accountMetrics: null as null | {
    equity: number;
    cash: number;
    buyingPower: number;
    portfolioValue: number;
    dayPL: number;
    dayPLPercent: number;
    totalPL: number;
    totalPLPercent: number;
  },
};

vi.mock('../../../stores/telemetryStore', () => ({
  useTelemetryStore: vi.fn(() => mockTelemetryStore),
}));

// Mock UXMI components
vi.mock('../../uxmi', () => ({
  Tooltip: ({ children, content }: { children: React.ReactNode; content: string }) => (
    <div data-tooltip={content}>{children}</div>
  ),
  Spinner: ({ label }: { label?: string }) => (
    <div data-testid="spinner">{label}</div>
  ),
}));

describe('AccountPanel component', () => {
  const mockAccountMetrics = {
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
    mockTelemetryStore.accountMetrics = null;
  });

  describe('loading state', () => {
    it('should show loading spinner when accountMetrics is null', () => {
      mockTelemetryStore.accountMetrics = null;
      render(<AccountPanel />);
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading account data...')).toBeInTheDocument();
    });

    it('should show Account heading in loading state', () => {
      mockTelemetryStore.accountMetrics = null;
      render(<AccountPanel />);
      expect(screen.getByText('Account')).toBeInTheDocument();
    });
  });

  describe('full mode rendering', () => {
    beforeEach(() => {
      mockTelemetryStore.accountMetrics = mockAccountMetrics;
    });

    it('should render Account Overview heading', () => {
      render(<AccountPanel />);
      expect(screen.getByText('Account Overview')).toBeInTheDocument();
    });

    it('should display equity value in INR', () => {
      render(<AccountPanel />);
      // en-IN format: ₹1,00,000.00
      expect(screen.getByText('₹1,00,000.00')).toBeInTheDocument();
    });

    it('should display cash value in INR', () => {
      render(<AccountPanel />);
      // Cash: ₹50,000.00
      const cashValues = screen.getAllByText('₹50,000.00');
      expect(cashValues.length).toBeGreaterThan(0);
    });

    it('should display buying power value in INR', () => {
      render(<AccountPanel />);
      expect(screen.getByText('₹2,00,000.00')).toBeInTheDocument();
    });

    it('should display Day P&L label', () => {
      render(<AccountPanel />);
      expect(screen.getByText('Day P&L')).toBeInTheDocument();
    });

    it('should display Day P&L value in INR', () => {
      render(<AccountPanel />);
      expect(screen.getByText('₹1,500.00')).toBeInTheDocument();
    });

    it('should display Day P&L percentage', () => {
      render(<AccountPanel />);
      expect(screen.getByText('+1.50%')).toBeInTheDocument();
    });

    it('should display Total P&L label', () => {
      render(<AccountPanel />);
      expect(screen.getByText('Total P&L')).toBeInTheDocument();
    });

    it('should display Total P&L value in INR', () => {
      render(<AccountPanel />);
      expect(screen.getByText('₹5,000.00')).toBeInTheDocument();
    });

    it('should display Total P&L percentage', () => {
      render(<AccountPanel />);
      expect(screen.getByText('+5.00%')).toBeInTheDocument();
    });

    it('should display Equity label', () => {
      render(<AccountPanel />);
      expect(screen.getByText('Equity')).toBeInTheDocument();
    });

    it('should display Cash label', () => {
      render(<AccountPanel />);
      expect(screen.getByText('Cash')).toBeInTheDocument();
    });

    it('should display Buying Power label', () => {
      render(<AccountPanel />);
      expect(screen.getByText('Buying Power')).toBeInTheDocument();
    });

    it('should display Portfolio Value label', () => {
      render(<AccountPanel />);
      expect(screen.getByText('Portfolio Value')).toBeInTheDocument();
    });
  });

  describe('compact mode rendering', () => {
    beforeEach(() => {
      mockTelemetryStore.accountMetrics = mockAccountMetrics;
    });

    it('should render Account heading in compact mode', () => {
      render(<AccountPanel compact />);
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('should display Equity label in compact mode', () => {
      render(<AccountPanel compact />);
      expect(screen.getByText('Equity')).toBeInTheDocument();
    });

    it('should display equity value in compact mode', () => {
      render(<AccountPanel compact />);
      expect(screen.getByText('₹1,00,000.00')).toBeInTheDocument();
    });

    it('should display Day P&L label in compact mode', () => {
      render(<AccountPanel compact />);
      expect(screen.getByText('Day P&L')).toBeInTheDocument();
    });

    it('should display Day P&L value in compact mode', () => {
      render(<AccountPanel compact />);
      expect(screen.getByText('₹1,500.00')).toBeInTheDocument();
    });
  });

  describe('P&L color coding', () => {
    it('should show green styling for positive day P&L', () => {
      mockTelemetryStore.accountMetrics = mockAccountMetrics;
      const { container } = render(<AccountPanel />);
      expect(container.querySelector('.text-green-600')).toBeInTheDocument();
    });

    it('should show red styling for negative day P&L', () => {
      mockTelemetryStore.accountMetrics = { 
        ...mockAccountMetrics, 
        dayPL: -1500, 
        dayPLPercent: -1.5 
      };
      const { container } = render(<AccountPanel />);
      expect(container.querySelector('.text-red-600')).toBeInTheDocument();
    });

    it('should show green background for positive P&L', () => {
      mockTelemetryStore.accountMetrics = mockAccountMetrics;
      const { container } = render(<AccountPanel />);
      expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
    });

    it('should show red background for negative P&L', () => {
      mockTelemetryStore.accountMetrics = { 
        ...mockAccountMetrics, 
        dayPL: -500, 
        dayPLPercent: -0.5 
      };
      const { container } = render(<AccountPanel />);
      expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
    });
  });

  describe('equity highlight', () => {
    beforeEach(() => {
      mockTelemetryStore.accountMetrics = mockAccountMetrics;
    });

    it('should apply blue highlight to equity card', () => {
      const { container } = render(<AccountPanel />);
      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
    });

    it('should apply blue text to equity value', () => {
      const { container } = render(<AccountPanel />);
      expect(container.querySelector('.text-blue-700')).toBeInTheDocument();
    });
  });

  describe('INR currency formatting', () => {
    it('should format large numbers in Indian numbering system', () => {
      mockTelemetryStore.accountMetrics = { 
        ...mockAccountMetrics, 
        equity: 1234567.89 
      };
      render(<AccountPanel />);
      // en-IN format: ₹12,34,567.89
      expect(screen.getByText('₹12,34,567.89')).toBeInTheDocument();
    });

    it('should format negative P&L correctly in INR', () => {
      mockTelemetryStore.accountMetrics = { 
        ...mockAccountMetrics, 
        dayPL: -1234.56, 
        dayPLPercent: -1.23 
      };
      render(<AccountPanel />);
      expect(screen.getByText('-₹1,234.56')).toBeInTheDocument();
      expect(screen.getByText('-1.23%')).toBeInTheDocument();
    });

    it('should format crore values correctly', () => {
      mockTelemetryStore.accountMetrics = { 
        ...mockAccountMetrics, 
        equity: 10000000 // 1 crore
      };
      render(<AccountPanel />);
      // en-IN format: ₹1,00,00,000.00
      expect(screen.getByText('₹1,00,00,000.00')).toBeInTheDocument();
    });
  });

  describe('tooltips', () => {
    beforeEach(() => {
      mockTelemetryStore.accountMetrics = mockAccountMetrics;
    });

    it('should have tooltip for equity', () => {
      const { container } = render(<AccountPanel />);
      expect(container.querySelector('[data-tooltip="Total account equity"]')).toBeInTheDocument();
    });

    it('should have tooltip for cash', () => {
      const { container } = render(<AccountPanel />);
      expect(container.querySelector('[data-tooltip="Available cash balance"]')).toBeInTheDocument();
    });

    it('should have tooltip for buying power', () => {
      const { container } = render(<AccountPanel />);
      expect(container.querySelector('[data-tooltip="Available buying power (with margin)"]')).toBeInTheDocument();
    });

    it('should have tooltip for Day P&L', () => {
      const { container } = render(<AccountPanel />);
      expect(container.querySelector('[data-tooltip="Profit/Loss for today"]')).toBeInTheDocument();
    });

    it('should have tooltip for Total P&L', () => {
      const { container } = render(<AccountPanel />);
      expect(container.querySelector('[data-tooltip="Total profit/loss"]')).toBeInTheDocument();
    });
  });
});
