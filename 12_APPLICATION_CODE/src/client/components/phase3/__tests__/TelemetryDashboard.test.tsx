/**
 * TelemetryDashboard Tests
 * Tests for Phase 3 real-time telemetry display
 * Indian market symbols: RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TelemetryDashboard } from '../TelemetryDashboard';

// Mock the telemetry store
const mockTelemetryStore = {
  isConnected: true,
  setConnected: vi.fn(),
  positions: [],
  orders: [],
  accountMetrics: null,
  systemHealth: null,
  marketData: {},
  activityLog: [],
  lastUpdate: null,
};

vi.mock('../../../stores/telemetryStore', () => ({
  useTelemetryStore: vi.fn(() => mockTelemetryStore),
}));

// Mock the ignition store
const mockIgnitionStore: {
  phase: string;
  selectedBackend: string;
  backendConfigs: Array<{
    type: string;
    name: string;
    broker: string;
    description: string;
    endpoint: string;
    requiresConfirmation: boolean;
    icon: string;
  }>;
} = {
  phase: 'running',
  selectedBackend: 'zerodha',
  backendConfigs: [
    {
      type: 'zerodha',
      name: 'Zerodha Kite',
      broker: 'Zerodha',
      description: 'Connect via Kite Connect API for NSE/BSE trading.',
      endpoint: '/api/backend/zerodha',
      requiresConfirmation: true,
      icon: '🪁',
    },
  ],
};

vi.mock('../../../stores/ignitionStore', () => ({
  useIgnitionStore: vi.fn(() => mockIgnitionStore),
}));

// Mock child components to simplify testing
vi.mock('../PositionsPanel', () => ({
  PositionsPanel: () => <div data-testid="positions-panel">Positions</div>,
}));

vi.mock('../OrdersPanel', () => ({
  OrdersPanel: () => <div data-testid="orders-panel">Orders</div>,
}));

vi.mock('../AccountPanel', () => ({
  AccountPanel: () => <div data-testid="account-panel">Account</div>,
}));

vi.mock('../SystemHealthPanel', () => ({
  SystemHealthPanel: () => <div data-testid="system-health-panel">System Health</div>,
}));

vi.mock('../MarketDataPanel', () => ({
  MarketDataPanel: ({ symbols }: { symbols?: string[] }) => (
    <div data-testid="market-data-panel">
      Market Data: {symbols?.join(', ')}
    </div>
  ),
}));

vi.mock('../ActivityLogPanel', () => ({
  ActivityLogPanel: () => <div data-testid="activity-log-panel">Activity Log</div>,
}));

// Mock UXMI components
vi.mock('../../uxmi', () => ({
  Spinner: ({ label }: { label?: string }) => <div data-testid="spinner">{label}</div>,
  ToastContainer: () => <div data-testid="toast-container" />,
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock cockpit components
vi.mock('../../cockpit', () => ({
  SimulationBadge: () => <div data-testid="simulation-badge">SIMULATION</div>,
}));

// Mock useBackendHealth hook (COCKPIT INTEGRITY)
const mockBackendHealth = {
  isReachable: true,
  latency: 10,
  lastError: null,
  timeSinceLastCheck: 0,
  isChecking: false,
  checkNow: vi.fn(),
};

vi.mock('../../../hooks', () => ({
  useBackendHealth: vi.fn(() => mockBackendHealth),
}));

describe('TelemetryDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Reset mock values
    mockTelemetryStore.isConnected = true;
    mockIgnitionStore.phase = 'running';
    mockBackendHealth.isReachable = true;
    mockBackendHealth.latency = 10;
    mockBackendHealth.lastError = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering when running', () => {
    it('should render Mission Control header', () => {
      render(<TelemetryDashboard />);
      expect(screen.getByText('Mission Control')).toBeInTheDocument();
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

    it('should display backend name in header', () => {
      render(<TelemetryDashboard />);
      expect(screen.getByText(/Zerodha Kite/i)).toBeInTheDocument();
    });
  });

  describe('connection status (COCKPIT INTEGRITY - uses real backend health)', () => {
    it('should show API Connected status when backend is reachable', () => {
      mockBackendHealth.isReachable = true;
      render(<TelemetryDashboard />);
      expect(screen.getByText('API Connected')).toBeInTheDocument();
    });

    it('should show API Disconnected status when backend is not reachable', () => {
      mockBackendHealth.isReachable = false;
      render(<TelemetryDashboard />);
      expect(screen.getByText('API Disconnected')).toBeInTheDocument();
    });

    it('should show loading spinner when backend is not reachable', () => {
      mockBackendHealth.isReachable = false;
      render(<TelemetryDashboard />);
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.getByText('Waiting for backend connection...')).toBeInTheDocument();
    });

    it('should display latency when backend is reachable', () => {
      mockBackendHealth.isReachable = true;
      mockBackendHealth.latency = 15;
      render(<TelemetryDashboard />);
      expect(screen.getByText('15ms')).toBeInTheDocument();
    });
  });

  describe('phase orchestration pattern (BUG-007 fix)', () => {
    // NOTE: TelemetryDashboard no longer checks ignitionStore.phase internally.
    // App.tsx is the AUTHORITATIVE phase controller and only renders TelemetryDashboard
    // when currentPhase === 'running'. This eliminates race conditions.
    // See: 02_ARCHITECTURE/SYSTEM_OVERVIEW.md "PHASE ORCHESTRATION PATTERN"
    // See: 05_PROBLEMS_SOLVED/BUG_REGISTRY.md BUG-007
    
    it('should always render full dashboard regardless of ignitionStore.phase', () => {
      // Even if ignitionStore.phase is 'idle', TelemetryDashboard renders
      // because App.tsx controls when to render it, not the component itself
      mockIgnitionStore.phase = 'idle';
      render(<TelemetryDashboard />);
      
      // Should still render Mission Control header and panels
      expect(screen.getByText('Mission Control')).toBeInTheDocument();
      expect(screen.getByTestId('positions-panel')).toBeInTheDocument();
    });

    it('should trust App.tsx as the authoritative phase controller', () => {
      // TelemetryDashboard is only rendered by App.tsx when currentPhase === 'running'
      // The component should not have its own phase guard
      mockIgnitionStore.phase = 'idle';
      render(<TelemetryDashboard />);
      
      // Should NOT show "Start the system" placeholder anymore
      expect(screen.queryByText('Start the system to view telemetry data')).not.toBeInTheDocument();
    });
  });

  describe('watchlist with Indian symbols', () => {
    it('should pass default Indian symbols to MarketDataPanel', () => {
      render(<TelemetryDashboard />);
      expect(screen.getByText(/RELIANCE/)).toBeInTheDocument();
      expect(screen.getByText(/TCS/)).toBeInTheDocument();
      expect(screen.getByText(/INFY/)).toBeInTheDocument();
      expect(screen.getByText(/HDFCBANK/)).toBeInTheDocument();
      expect(screen.getByText(/ICICIBANK/)).toBeInTheDocument();
    });

    it('should pass custom watchlist to MarketDataPanel', () => {
      render(<TelemetryDashboard watchlist={['RELIANCE', 'TCS', 'INFY']} />);
      expect(screen.getByText(/RELIANCE, TCS, INFY/)).toBeInTheDocument();
    });

    it('should not include any US market symbols', () => {
      render(<TelemetryDashboard />);
      // Verify no US symbols appear
      expect(screen.queryByText(/AAPL/)).not.toBeInTheDocument();
      expect(screen.queryByText(/GOOGL/)).not.toBeInTheDocument();
      expect(screen.queryByText(/MSFT/)).not.toBeInTheDocument();
    });
  });

  describe('backend display', () => {
    it('should display backend icon', () => {
      render(<TelemetryDashboard />);
      expect(screen.getByText(/🪁/)).toBeInTheDocument();
    });
  });

  describe('toast container', () => {
    it('should render toast container', () => {
      render(<TelemetryDashboard />);
      expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    });
  });
});
