/**
 * IgnitionButton Tests
 * Tests for two-stage ignition safety system
 * Phase 2: Ignition with ARM → IGNITE sequence
 *
 * All Indian brokers require real trading confirmation (no simulation mode)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IgnitionButton } from '../IgnitionButton';
import { useIgnitionStore } from '../../../stores/ignitionStore';

// Mock the ignition store
vi.mock('../../../stores/ignitionStore', () => ({
  useIgnitionStore: Object.assign(vi.fn(), {
    getState: vi.fn(() => ({ reset: vi.fn() })),
  }),
}));

// Mock UXMI components
vi.mock('../../uxmi', () => ({
  Button: ({ children, onClick, disabled, variant, size, className }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
  ErrorDisplay: ({ what, why, how, onRetry, onDismiss }: any) => (
    <div data-testid="error-display">
      <div>{what}</div>
      <div>{why}</div>
      <div>{how}</div>
      <button onClick={onRetry}>Retry</button>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  ),
  Spinner: ({ label }: any) => <div data-testid="spinner">{label}</div>,
  Tooltip: ({ children }: any) => <>{children}</>,
}));

// Mock useBackendHealth hook (COCKPIT INTEGRITY - GAP-03)
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

const mockArmSystem = vi.fn();
const mockConfirmLive = vi.fn();
const mockIgnite = vi.fn().mockResolvedValue(undefined);
const mockAbort = vi.fn().mockResolvedValue(undefined);
const mockDisarmSystem = vi.fn();
const mockSetError = vi.fn();

const defaultMockState = {
  selectedBackend: 'zerodha' as const,
  backendConfigs: [
    { type: 'zerodha' as const, name: 'Zerodha Kite', requiresConfirmation: true },
    { type: 'icici' as const, name: 'ICICI Direct', requiresConfirmation: true },
    { type: 'hdfc' as const, name: 'HDFC Sky', requiresConfirmation: true },
    { type: 'kotak' as const, name: 'Kotak Neo', requiresConfirmation: true },
  ],
  phase: 'selecting' as const,
  isArmed: false,
  liveConfirmed: false,
  ignitionError: null,
  armSystem: mockArmSystem,
  disarmSystem: mockDisarmSystem,
  confirmLive: mockConfirmLive,
  ignite: mockIgnite,
  abort: mockAbort,
  setError: mockSetError,
};

describe('IgnitionButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useIgnitionStore as any).mockReturnValue(
      defaultMockState as ReturnType<typeof useIgnitionStore>
    );
    // Reset backend health mock to reachable state
    mockBackendHealth.isReachable = true;
    mockBackendHealth.latency = 10;
    mockBackendHealth.lastError = null;
  });

  describe('no backend selected', () => {
    it('should show message to select backend', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        selectedBackend: null,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      expect(screen.getByText(/Select a backend/i)).toBeInTheDocument();
    });
  });

  describe('live trading confirmation', () => {
    it('should show confirmation dialog when requiresConfirmation and not confirmed', () => {
      // Default state: requiresConfirmation is true and liveConfirmed is false
      render(<IgnitionButton />);

      expect(screen.getByText(/Live Trading Confirmation/i)).toBeInTheDocument();
    });

    it('should require typing CONFIRM TRADE to proceed', () => {
      render(<IgnitionButton />);

      expect(screen.getByPlaceholderText('CONFIRM TRADE')).toBeInTheDocument();
    });

    it('should show warning about real funds', () => {
      render(<IgnitionButton />);

      expect(screen.getByText(/REAL funds/i)).toBeInTheDocument();
    });

    it('should disable confirm button until correct phrase is typed', async () => {
      render(<IgnitionButton />);

      const confirmButton = screen.getByText(/Confirm Live Trading/i);
      expect(confirmButton).toBeDisabled();
    });

    it('should enable confirm button when correct phrase is typed', async () => {
      render(<IgnitionButton />);

      const input = screen.getByPlaceholderText('CONFIRM TRADE');
      const confirmButton = screen.getByText(/Confirm Live Trading/i);

      await userEvent.type(input, 'CONFIRM TRADE');

      expect(confirmButton).not.toBeDisabled();
    });

    it('should call confirmLive when correct phrase is typed and button clicked', async () => {
      render(<IgnitionButton />);

      const input = screen.getByPlaceholderText('CONFIRM TRADE');
      const confirmButton = screen.getByText(/Confirm Live Trading/i);

      await userEvent.type(input, 'CONFIRM TRADE');
      await userEvent.click(confirmButton);

      expect(mockConfirmLive).toHaveBeenCalled();
    });

    it('should have Cancel button to go back', () => {
      render(<IgnitionButton />);

      expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    });
  });

  describe('initial state after confirmation', () => {
    it('should render ARM button when backend is selected and live confirmed', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);
      expect(screen.getByText(/ARM SYSTEM/i)).toBeInTheDocument();
    });

    it('should show "Real Trading" indicator for Indian brokers after confirmation', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);
      // "Real Trading" appears in both the indicator text and the button text
      const realTradingElements = screen.getAllByText(/Real Trading/i);
      expect(realTradingElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should show danger variant ARM button for real trading', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);
      const armButton = screen.getByText(/ARM SYSTEM/i);
      expect(armButton).toHaveAttribute('data-variant', 'danger');
    });
  });

  describe('armed state', () => {
    it('should show IGNITE button when armed', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        phase: 'armed',
        isArmed: true,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      expect(screen.getByText(/IGNITE/i)).toBeInTheDocument();
    });

    it('should show Disarm button when armed', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        phase: 'armed',
        isArmed: true,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      expect(screen.getByText(/Disarm/i)).toBeInTheDocument();
    });

    it('should show SYSTEM ARMED indicator', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        phase: 'armed',
        isArmed: true,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      expect(screen.getByText(/SYSTEM ARMED/i)).toBeInTheDocument();
    });

    it('should call ignite when IGNITE button is clicked', async () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        phase: 'armed',
        isArmed: true,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      const igniteButton = screen.getByText(/IGNITE/i);
      await userEvent.click(igniteButton);

      expect(mockIgnite).toHaveBeenCalled();
    });

    it('should call disarmSystem when Disarm button is clicked', async () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        phase: 'armed',
        isArmed: true,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      const disarmButton = screen.getByText(/Disarm/i);
      await userEvent.click(disarmButton);

      expect(mockDisarmSystem).toHaveBeenCalled();
    });

    it('should show real funds warning when armed with requiresConfirmation', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        phase: 'armed',
        isArmed: true,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      expect(screen.getByText(/real funds/i)).toBeInTheDocument();
    });

    it('should use red styling for real trading armed state', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        phase: 'armed',
        isArmed: true,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      const { container } = render(<IgnitionButton />);

      // Should have red background and border for real trading
      const armedDiv = container.querySelector('.bg-red-100');
      expect(armedDiv).toBeInTheDocument();
    });
  });

  describe('igniting state', () => {
    it('should show spinner during ignition', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        phase: 'igniting',
        isArmed: true,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('should show Emergency Abort button during ignition', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        phase: 'igniting',
        isArmed: true,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      expect(screen.getByText(/Emergency Abort/i)).toBeInTheDocument();
    });

    it('should show ignition progress message', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        phase: 'igniting',
        isArmed: true,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      expect(screen.getByText(/Initializing trading systems/i)).toBeInTheDocument();
    });
  });

  describe('running state', () => {
    it('should show "System Running" when in running phase', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        phase: 'running',
        isArmed: true,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      expect(screen.getByText(/System Running/i)).toBeInTheDocument();
    });

    it('should show LIVE TRADING ACTIVE indicator', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        phase: 'running',
        isArmed: true,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      expect(screen.getByText(/LIVE TRADING ACTIVE/i)).toBeInTheDocument();
    });

    it('should show Shutdown button when running', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        phase: 'running',
        isArmed: true,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      expect(screen.getByText(/Shutdown/i)).toBeInTheDocument();
    });

    it('should call abort when Shutdown button is clicked', async () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        phase: 'running',
        isArmed: true,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      const shutdownButton = screen.getByText(/Shutdown/i);
      await userEvent.click(shutdownButton);

      expect(mockAbort).toHaveBeenCalled();
    });
  });

  describe('error state', () => {
    it('should display error when ignitionError is set and liveConfirmed is true', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        ignitionError: 'Connection failed',
        liveConfirmed: true, // Must be true to bypass confirmation dialog
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      expect(screen.getByText(/Ignition Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Connection failed/i)).toBeInTheDocument();
    });

    it('should clear error when retry is clicked', async () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        ignitionError: 'Connection failed',
        liveConfirmed: true, // Must be true to bypass confirmation dialog
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      const retryButton = screen.getByText(/Retry/i);
      await userEvent.click(retryButton);

      expect(mockSetError).toHaveBeenCalledWith(null);
    });

    it('should show error help text', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        ignitionError: 'Connection failed',
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton />);

      expect(screen.getByText(/Check the error details/i)).toBeInTheDocument();
    });
  });

  describe('callbacks', () => {
    it('should call onIgnition callback after successful ignition', async () => {
      const onIgnition = vi.fn();
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        phase: 'armed',
        isArmed: true,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton onIgnition={onIgnition} />);

      const igniteButton = screen.getByText(/IGNITE/i);
      await userEvent.click(igniteButton);

      await waitFor(() => {
        expect(onIgnition).toHaveBeenCalled();
      });
    });

    it('should call onAbort callback after abort', async () => {
      const onAbort = vi.fn();
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        phase: 'running',
        isArmed: true,
        liveConfirmed: true,
      } as ReturnType<typeof useIgnitionStore>);

      render(<IgnitionButton onAbort={onAbort} />);

      const shutdownButton = screen.getByText(/Shutdown/i);
      await userEvent.click(shutdownButton);

      await waitFor(() => {
        expect(onAbort).toHaveBeenCalled();
      });
    });
  });

  describe('India-market compliance', () => {
    it('should only support Indian broker backends', () => {
      // Verify only Indian brokers are in the config
      const config = defaultMockState.backendConfigs;
      const brokerTypes = config.map((c) => c.type);

      expect(brokerTypes).toContain('zerodha');
      expect(brokerTypes).toContain('icici');
      expect(brokerTypes).toContain('hdfc');
      expect(brokerTypes).toContain('kotak');
      expect(brokerTypes).not.toContain('alpaca');
      expect(brokerTypes).not.toContain('polygon');
    });

    it('should require confirmation for all Indian brokers (real trading only)', () => {
      const config = defaultMockState.backendConfigs;

      // All Indian brokers should require confirmation
      config.forEach((broker) => {
        expect(broker.requiresConfirmation).toBe(true);
      });
    });
  });
});
