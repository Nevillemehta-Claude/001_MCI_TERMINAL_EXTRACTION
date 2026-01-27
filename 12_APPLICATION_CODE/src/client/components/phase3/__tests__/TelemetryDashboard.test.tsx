import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TelemetryDashboard } from '../TelemetryDashboard';
import { useTelemetryStore } from '../../../stores/telemetryStore';
import { useIgnitionStore } from '../../../stores/ignitionStore';

// Mock the stores
vi.mock('../../../stores/telemetryStore', () => ({
  useTelemetryStore: vi.fn(),
}));

vi.mock('../../../stores/ignitionStore', () => ({
  useIgnitionStore: vi.fn(),
}));

// Mock child components to simplify testing
vi.mock('../PositionsPanel', () => ({
  PositionsPanel: () => <div data-testid="positions-panel">Positions Panel</div>,
}));

vi.mock('../OrdersPanel', () => ({
  OrdersPanel: () => <div data-testid="orders-panel">Orders Panel</div>,
}));

vi.mock('../AccountPanel', () => ({
  AccountPanel: () => <div data-testid="account-panel">Account Panel</div>,
}));

vi.mock('../SystemHealthPanel', () => ({
  SystemHealthPanel: () => <div data-testid="system-health-panel">System Health Panel</div>,
}));

vi.mock('../MarketDataPanel', () => ({
  MarketDataPanel: ({ symbols }: { symbols: string[] }) => (
    <div data-testid="market-data-panel">Market Data Panel: {symbols.join(', ')}</div>
  ),
}));

vi.mock('../ActivityLogPanel', () => ({
  ActivityLogPanel: () => <div data-testid="activity-log-panel">Activity Log Panel</div>,
}));

describe('TelemetryDashboard component', () => {
  const mockTelemetryStore = {
    isConnected: false,
    setConnected: vi.fn(),
  };

  const mockIgnitionStore = {
    phase: 'idle',
    selectedBackend: 'paper',
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(useTelemetryStore).mockReturnValue(mockTelemetryStore);
    vi.mocked(useIgnitionStore).mockReturnValue(mockIgnitionStore);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('idle state rendering', () => {
    it('should show placeholder when phase is not running', () => {
      render(<TelemetryDashboard />);
      expect(screen.getByText('Telemetry Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Start the system to view telemetry data')).toBeInTheDocument();
    });

    it('should show dashboard icon when idle', () => {
      render(<TelemetryDashboard />);
      expect(screen.getByText('📊')).toBeInTheDocument();
    });

    it('should not render panels when phase is not running', () => {
      render(<TelemetryDashboard />);
      expect(screen.queryByTestId('positions-panel')).not.toBeInTheDocument();
      expect(screen.queryByTestId('orders-panel')).not.toBeInTheDocument();
      expect(screen.queryByTestId('account-panel')).not.toBeInTheDocument();
    });
  });

  describe('running state - disconnected', () => {
    beforeEach(() => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockIgnitionStore,
        phase: 'running',
      });
    });

    it('should show Mission Control header', () => {
      render(<TelemetryDashboard />);
      expect(screen.getByText('Mission Control')).toBeInTheDocument();
    });

    it('should show PAPER badge for paper backend', () => {
      render(<TelemetryDashboard />);
      expect(screen.getByText('📋 PAPER')).toBeInTheDocument();
    });

    it('should show LIVE badge for live backend', () => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockIgnitionStore,
        phase: 'running',
        selectedBackend: 'live',
      });
      render(<TelemetryDashboard />);
      expect(screen.getByText('🔴 LIVE')).toBeInTheDocument();
    });

    it('should show Disconnected status initially', () => {
      render(<TelemetryDashboard />);
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });

    it('should show loading spinner when not connected', () => {
      render(<TelemetryDashboard />);
      expect(screen.getAllByText('Connecting to telemetry stream...').length).toBeGreaterThan(0);
    });

    it('should not render panels when disconnected', () => {
      render(<TelemetryDashboard />);
      expect(screen.queryByTestId('positions-panel')).not.toBeInTheDocument();
    });
  });

  describe('running state - connected', () => {
    beforeEach(() => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockIgnitionStore,
        phase: 'running',
      });
      vi.mocked(useTelemetryStore).mockReturnValue({
        ...mockTelemetryStore,
        isConnected: true,
      });
    });

    it('should show Connected status', () => {
      render(<TelemetryDashboard />);
      // There may be multiple "Connected" texts (one in status indicator, one in toast)
      expect(screen.getAllByText('Connected').length).toBeGreaterThan(0);
    });

    it('should render all 6 panels when connected', () => {
      render(<TelemetryDashboard />);
      expect(screen.getByTestId('positions-panel')).toBeInTheDocument();
      expect(screen.getByTestId('orders-panel')).toBeInTheDocument();
      expect(screen.getByTestId('account-panel')).toBeInTheDocument();
      expect(screen.getByTestId('system-health-panel')).toBeInTheDocument();
      expect(screen.getByTestId('market-data-panel')).toBeInTheDocument();
      expect(screen.getByTestId('activity-log-panel')).toBeInTheDocument();
    });

    it('should pass default watchlist to MarketDataPanel', () => {
      render(<TelemetryDashboard />);
      expect(screen.getByText(/AAPL, GOOGL, MSFT, TSLA, SPY/)).toBeInTheDocument();
    });

    it('should pass custom watchlist to MarketDataPanel', () => {
      render(<TelemetryDashboard watchlist={['NVDA', 'AMD']} />);
      expect(screen.getByText(/NVDA, AMD/)).toBeInTheDocument();
    });
  });

  describe('connection simulation', () => {
    beforeEach(() => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockIgnitionStore,
        phase: 'running',
      });
    });

    it('should call setConnected(true) after timeout when running', () => {
      render(<TelemetryDashboard />);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(mockTelemetryStore.setConnected).toHaveBeenCalledWith(true);
    });

    it('should call setConnected(false) on unmount', () => {
      const { unmount } = render(<TelemetryDashboard />);

      act(() => {
        vi.advanceTimersByTime(600);
      });

      unmount();

      expect(mockTelemetryStore.setConnected).toHaveBeenCalledWith(false);
    });
  });

  describe('backend styling', () => {
    beforeEach(() => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockIgnitionStore,
        phase: 'running',
      });
      vi.mocked(useTelemetryStore).mockReturnValue({
        ...mockTelemetryStore,
        isConnected: true,
      });
    });

    it('should have blue styling for paper backend badge', () => {
      const { container } = render(<TelemetryDashboard />);
      const badge = screen.getByText('📋 PAPER');
      expect(badge.className).toContain('bg-blue-600');
    });

    it('should have red styling for live backend badge', () => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockIgnitionStore,
        phase: 'running',
        selectedBackend: 'live',
      });
      const { container } = render(<TelemetryDashboard />);
      const badge = screen.getByText('🔴 LIVE');
      expect(badge.className).toContain('bg-red-600');
    });
  });

  describe('connection indicator styling', () => {
    beforeEach(() => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockIgnitionStore,
        phase: 'running',
      });
    });

    it('should have green styling when connected', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        ...mockTelemetryStore,
        isConnected: true,
      });
      const { container } = render(<TelemetryDashboard />);
      expect(container.querySelector('.bg-green-900\\/50')).toBeInTheDocument();
    });

    it('should have red styling when disconnected', () => {
      const { container } = render(<TelemetryDashboard />);
      expect(container.querySelector('.bg-red-900\\/50')).toBeInTheDocument();
    });
  });
});
