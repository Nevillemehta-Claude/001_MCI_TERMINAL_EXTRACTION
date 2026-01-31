/**
 * ShutdownPanel Tests
 * Tests for Phase 4 shutdown functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShutdownPanel } from '../ShutdownPanel';
import { useShutdownStore, ShutdownStep } from '../../../stores/shutdownStore';
import { useIgnitionStore } from '../../../stores/ignitionStore';

// Mock the stores
vi.mock('../../../stores/shutdownStore', () => ({
  useShutdownStore: vi.fn(),
}));

vi.mock('../../../stores/ignitionStore', () => ({
  useIgnitionStore: vi.fn(),
}));

// Mock UXMI components
vi.mock('../../uxmi', () => ({
  Button: ({ children, onClick, disabled, variant, className }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
    >
      {children}
    </button>
  ),
  ProgressBar: ({ value, variant, showLabel, animated, striped }: any) => (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      data-variant={variant}
      data-animated={animated}
      data-striped={striped}
    >
      {showLabel && `${value}%`}
    </div>
  ),
  ErrorDisplay: ({ what, why, how, severity, onRetry, actions }: any) => (
    <div data-testid="error-display" data-severity={severity}>
      <div>{what}</div>
      <div>{why}</div>
      <div>{how}</div>
      {onRetry && <button onClick={onRetry}>Try Again</button>}
      {actions?.map((action: any, idx: number) => (
        <button key={idx} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </div>
  ),
  Spinner: ({ size, color }: any) => (
    <div role="status" data-size={size} data-color={color} />
  ),
  Tooltip: ({ content, children }: any) => (
    <div data-testid="tooltip" data-content={content}>
      {children}
    </div>
  ),
}));

describe('ShutdownPanel component', () => {
  const mockShutdownStore = {
    phase: 'idle' as const,
    steps: [] as ShutdownStep[],
    isEmergency: false,
    shutdownStartedAt: null as number | null,
    shutdownCompletedAt: null as number | null,
    error: null as string | null,
    closePositions: false,
    cancelOrders: true,
    saveState: true,
    initiateShutdown: vi.fn().mockResolvedValue(undefined),
    setOptions: vi.fn(),
    reset: vi.fn(),
  };

  const mockIgnitionStore = {
    phase: 'running' as const,
    reset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock functions for each test
    mockShutdownStore.setOptions = vi.fn();
    mockShutdownStore.initiateShutdown = vi.fn().mockResolvedValue(undefined);
    mockShutdownStore.reset = vi.fn();
    mockIgnitionStore.reset = vi.fn();

    // Reset default state
    mockShutdownStore.phase = 'idle';
    mockShutdownStore.steps = [];
    mockShutdownStore.isEmergency = false;
    mockShutdownStore.shutdownStartedAt = null;
    mockShutdownStore.shutdownCompletedAt = null;
    mockShutdownStore.error = null;
    mockShutdownStore.closePositions = false;
    mockShutdownStore.cancelOrders = true;
    mockShutdownStore.saveState = true;
    mockIgnitionStore.phase = 'running';

    (useShutdownStore as any).mockReturnValue(mockShutdownStore);
    (useIgnitionStore as any).mockReturnValue(mockIgnitionStore);
  });

  describe('idle state', () => {
    it('should render Shutdown Options heading', () => {
      render(<ShutdownPanel />);
      expect(screen.getByText('Shutdown Options')).toBeInTheDocument();
    });

    it('should render Cancel Pending Orders checkbox', () => {
      render(<ShutdownPanel />);
      expect(screen.getByText('Cancel Pending Orders')).toBeInTheDocument();
    });

    it('should render Close All Positions checkbox', () => {
      render(<ShutdownPanel />);
      expect(screen.getByText('Close All Positions')).toBeInTheDocument();
    });

    it('should render Save System State checkbox', () => {
      render(<ShutdownPanel />);
      expect(screen.getByText('Save System State')).toBeInTheDocument();
    });

    it('should render Graceful Shutdown button', () => {
      render(<ShutdownPanel />);
      expect(screen.getByText('Graceful Shutdown')).toBeInTheDocument();
    });

    it('should render Emergency Stop button', () => {
      render(<ShutdownPanel />);
      expect(screen.getByText('⚠️ Emergency Stop')).toBeInTheDocument();
    });

    it('should show checkboxes with correct initial state', () => {
      render(<ShutdownPanel />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
      // cancelOrders is true by default
      expect(checkboxes[0]).toBeChecked();
      // closePositions is false by default
      expect(checkboxes[1]).not.toBeChecked();
      // saveState is true by default
      expect(checkboxes[2]).toBeChecked();
    });
  });

  describe('checkbox interactions', () => {
    it('should call setOptions when Cancel Pending Orders is toggled', async () => {
      const user = userEvent.setup();
      render(<ShutdownPanel />);
      const checkboxes = screen.getAllByRole('checkbox');

      await user.click(checkboxes[0]);
      expect(mockShutdownStore.setOptions).toHaveBeenCalledWith({
        cancelOrders: false,
      });
    });

    it('should call setOptions when Close All Positions is toggled', async () => {
      const user = userEvent.setup();
      render(<ShutdownPanel />);
      const checkboxes = screen.getAllByRole('checkbox');

      await user.click(checkboxes[1]);
      expect(mockShutdownStore.setOptions).toHaveBeenCalledWith({
        closePositions: true,
      });
    });

    it('should call setOptions when Save System State is toggled', async () => {
      const user = userEvent.setup();
      render(<ShutdownPanel />);
      const checkboxes = screen.getAllByRole('checkbox');

      await user.click(checkboxes[2]);
      expect(mockShutdownStore.setOptions).toHaveBeenCalledWith({
        saveState: false,
      });
    });
  });

  describe('button states', () => {
    // NOTE: ShutdownPanel allows shutdown even when ignitionPhase is 'idle'
    // because App.tsx only renders ShutdownPanel when currentPhase === 'shutdown',
    // meaning the user navigated here intentionally (system was running).
    // See ShutdownPanel.tsx line 37-39 for design rationale.
    
    it('should enable buttons when shutdown panel is shown (system implicitly running)', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...mockIgnitionStore,
        phase: 'idle',  // ignitionPhase is idle but we're on shutdown screen
      });
      render(<ShutdownPanel />);

      // Buttons are enabled because being on shutdown screen implies system was running
      expect(screen.getByText('Graceful Shutdown')).not.toBeDisabled();
      expect(screen.getByText('⚠️ Emergency Stop')).not.toBeDisabled();
    });

    it('should enable buttons when system is explicitly running', () => {
      render(<ShutdownPanel />);

      expect(screen.getByText('Graceful Shutdown')).not.toBeDisabled();
      expect(screen.getByText('⚠️ Emergency Stop')).not.toBeDisabled();
    });
  });

  describe('confirmation dialog', () => {
    it('should show normal confirmation when Graceful Shutdown clicked', () => {
      render(<ShutdownPanel />);

      fireEvent.click(screen.getByText('Graceful Shutdown'));

      expect(screen.getByText('Confirm Shutdown')).toBeInTheDocument();
      expect(
        screen.getByText('Are you sure you want to shut down the trading system?')
      ).toBeInTheDocument();
    });

    it('should show emergency confirmation when Emergency Stop clicked', () => {
      render(<ShutdownPanel />);

      fireEvent.click(screen.getByText('⚠️ Emergency Stop'));

      expect(screen.getByText('Emergency Shutdown')).toBeInTheDocument();
      expect(
        screen.getByText(
          'This will immediately stop all operations and close all positions.'
        )
      ).toBeInTheDocument();
    });

    it('should show Cancel button in confirmation dialog', () => {
      render(<ShutdownPanel />);

      fireEvent.click(screen.getByText('Graceful Shutdown'));

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('should hide confirmation when Cancel clicked', () => {
      render(<ShutdownPanel />);

      fireEvent.click(screen.getByText('Graceful Shutdown'));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.queryByText('Confirm Shutdown')).not.toBeInTheDocument();
      expect(screen.getByText('Shutdown Options')).toBeInTheDocument();
    });

    it('should call initiateShutdown(false) when normal shutdown confirmed', async () => {
      render(<ShutdownPanel />);

      fireEvent.click(screen.getByText('Graceful Shutdown'));
      fireEvent.click(screen.getByRole('button', { name: 'Shutdown' }));

      expect(mockShutdownStore.initiateShutdown).toHaveBeenCalledWith(false);
    });

    it('should call initiateShutdown(true) when emergency shutdown confirmed', async () => {
      render(<ShutdownPanel />);

      fireEvent.click(screen.getByText('⚠️ Emergency Stop'));
      fireEvent.click(screen.getByRole('button', { name: 'EMERGENCY STOP' }));

      expect(mockShutdownStore.initiateShutdown).toHaveBeenCalledWith(true);
    });
  });

  describe('shutdown in progress', () => {
    const mockSteps: ShutdownStep[] = [
      {
        id: 'step-1',
        name: 'Cancel Orders',
        description: 'Canceling pending orders',
        status: 'complete',
        duration: 100,
      },
      {
        id: 'step-2',
        name: 'Close Positions',
        description: 'Closing positions',
        status: 'running',
      },
      {
        id: 'step-3',
        name: 'Save State',
        description: 'Saving state',
        status: 'pending',
      },
    ];

    beforeEach(() => {
      (useShutdownStore as any).mockReturnValue({
        ...mockShutdownStore,
        phase: 'initiating', // Valid phase for shutdown in progress
        steps: mockSteps,
        shutdownStartedAt: Date.now() - 500,
      });
    });

    it('should show Shutting Down heading for normal shutdown', () => {
      render(<ShutdownPanel />);
      expect(screen.getByText('Shutting Down...')).toBeInTheDocument();
    });

    it('should show Emergency Shutdown heading for emergency', () => {
      (useShutdownStore as any).mockReturnValue({
        ...mockShutdownStore,
        phase: 'initiating',
        steps: mockSteps,
        isEmergency: true,
        shutdownStartedAt: Date.now() - 500,
      });
      render(<ShutdownPanel />);
      expect(screen.getByText('🚨 Emergency Shutdown')).toBeInTheDocument();
    });

    it('should display progress bar', () => {
      render(<ShutdownPanel />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should display step names', () => {
      render(<ShutdownPanel />);
      expect(screen.getByText('Cancel Orders')).toBeInTheDocument();
      expect(screen.getByText('Close Positions')).toBeInTheDocument();
      expect(screen.getByText('Save State')).toBeInTheDocument();
    });

    it('should display step descriptions', () => {
      render(<ShutdownPanel />);
      expect(screen.getByText('Canceling pending orders')).toBeInTheDocument();
    });

    it('should display step duration when available', () => {
      render(<ShutdownPanel />);
      expect(screen.getByText('100ms')).toBeInTheDocument();
    });

    it('should show spinner for running step', () => {
      render(<ShutdownPanel />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should display duration in milliseconds', () => {
      const startTime = Date.now() - 500;
      (useShutdownStore as any).mockReturnValue({
        ...mockShutdownStore,
        phase: 'initiating',
        steps: mockSteps,
        shutdownStartedAt: startTime,
      });
      render(<ShutdownPanel />);
      // Should show duration (approximately 500ms) - check for the overall duration span
      const durationElements = screen.getAllByText(/ms/);
      expect(durationElements.length).toBeGreaterThan(0);
      // The overall duration should be in a span with specific classes
      const overallDuration = durationElements.find((el) =>
        el.className.includes('text-sm font-mono text-gray-500')
      );
      expect(overallDuration).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    beforeEach(() => {
      (useShutdownStore as any).mockReturnValue({
        ...mockShutdownStore,
        phase: 'error',
        error: 'Connection lost during shutdown',
      });
    });

    it('should display error message', () => {
      render(<ShutdownPanel />);
      expect(screen.getByText('Shutdown failed')).toBeInTheDocument();
      expect(screen.getByText('Connection lost during shutdown')).toBeInTheDocument();
    });

    it('should display recovery instructions', () => {
      render(<ShutdownPanel />);
      expect(
        screen.getByText('Try emergency shutdown or check system logs')
      ).toBeInTheDocument();
    });

    it('should show Try Again button', () => {
      render(<ShutdownPanel />);
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should show Reset button', () => {
      render(<ShutdownPanel />);
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should call initiateShutdown(true) when Try Again clicked', () => {
      render(<ShutdownPanel />);
      fireEvent.click(screen.getByText('Try Again'));
      expect(mockShutdownStore.initiateShutdown).toHaveBeenCalledWith(true);
    });

    it('should call reset when Reset clicked', () => {
      render(<ShutdownPanel />);
      fireEvent.click(screen.getByText('Reset'));
      expect(mockShutdownStore.reset).toHaveBeenCalled();
    });
  });

  describe('complete state', () => {
    beforeEach(() => {
      (useShutdownStore as any).mockReturnValue({
        ...mockShutdownStore,
        phase: 'complete',
        shutdownStartedAt: Date.now() - 1000,
        shutdownCompletedAt: Date.now(),
      });
    });

    it('should display Shutdown Complete message', () => {
      render(<ShutdownPanel />);
      expect(screen.getByText('Shutdown Complete')).toBeInTheDocument();
    });

    it('should display success message', () => {
      render(<ShutdownPanel />);
      expect(
        screen.getByText('System has been safely shut down')
      ).toBeInTheDocument();
    });

    it('should display duration', () => {
      render(<ShutdownPanel />);
      expect(screen.getByText(/Duration:/)).toBeInTheDocument();
    });

    it('should display Return to Start button', () => {
      render(<ShutdownPanel />);
      expect(screen.getByText('Return to Start')).toBeInTheDocument();
    });

    it('should call reset functions when Return to Start clicked', () => {
      render(<ShutdownPanel />);
      fireEvent.click(screen.getByText('Return to Start'));

      expect(mockIgnitionStore.reset).toHaveBeenCalled();
      expect(mockShutdownStore.reset).toHaveBeenCalled();
    });

    it('should call onComplete callback when Return to Start clicked', () => {
      const onComplete = vi.fn();
      render(<ShutdownPanel onComplete={onComplete} />);
      fireEvent.click(screen.getByText('Return to Start'));

      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('step styling', () => {
    it('should apply blue background for running step', () => {
      (useShutdownStore as any).mockReturnValue({
        ...mockShutdownStore,
        phase: 'initiating',
        steps: [
          {
            id: 'step-1',
            name: 'Test Step',
            description: 'Testing',
            status: 'running',
          },
        ],
        shutdownStartedAt: Date.now(),
      });
      const { container } = render(<ShutdownPanel />);
      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
    });

    it('should apply gray background for pending step', () => {
      (useShutdownStore as any).mockReturnValue({
        ...mockShutdownStore,
        phase: 'initiating',
        steps: [
          {
            id: 'step-1',
            name: 'Test Step',
            description: 'Testing',
            status: 'pending',
          },
        ],
        shutdownStartedAt: Date.now(),
      });
      const { container } = render(<ShutdownPanel />);
      expect(container.querySelector('.bg-gray-50')).toBeInTheDocument();
    });
  });

  describe('progress calculation', () => {
    it('should calculate progress based on completed and skipped steps', () => {
      (useShutdownStore as any).mockReturnValue({
        ...mockShutdownStore,
        phase: 'initiating',
        steps: [
          {
            id: 'step-1',
            name: 'Step 1',
            description: '',
            status: 'complete',
          },
          {
            id: 'step-2',
            name: 'Step 2',
            description: '',
            status: 'skipped',
          },
          {
            id: 'step-3',
            name: 'Step 3',
            description: '',
            status: 'running',
          },
          {
            id: 'step-4',
            name: 'Step 4',
            description: '',
            status: 'pending',
          },
        ],
        shutdownStartedAt: Date.now(),
      });
      render(<ShutdownPanel />);
      // 2 out of 4 complete = 50%
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    });
  });

  describe('other shutdown phases', () => {
    it('should show shutdown progress for closing_positions phase', () => {
      (useShutdownStore as any).mockReturnValue({
        ...mockShutdownStore,
        phase: 'closing_positions',
        steps: [
          {
            id: 'step-1',
            name: 'Close Positions',
            description: 'Closing',
            status: 'running',
          },
        ],
        shutdownStartedAt: Date.now(),
      });
      render(<ShutdownPanel />);
      expect(screen.getByText('Shutting Down...')).toBeInTheDocument();
    });

    it('should show shutdown progress for canceling_orders phase', () => {
      (useShutdownStore as any).mockReturnValue({
        ...mockShutdownStore,
        phase: 'canceling_orders',
        steps: [
          {
            id: 'step-1',
            name: 'Cancel Orders',
            description: 'Canceling',
            status: 'running',
          },
        ],
        shutdownStartedAt: Date.now(),
      });
      render(<ShutdownPanel />);
      expect(screen.getByText('Shutting Down...')).toBeInTheDocument();
    });

    it('should show shutdown progress for disconnecting phase', () => {
      (useShutdownStore as any).mockReturnValue({
        ...mockShutdownStore,
        phase: 'disconnecting',
        steps: [
          {
            id: 'step-1',
            name: 'Disconnect',
            description: 'Disconnecting',
            status: 'running',
          },
        ],
        shutdownStartedAt: Date.now(),
      });
      render(<ShutdownPanel />);
      expect(screen.getByText('Shutting Down...')).toBeInTheDocument();
    });
  });
});
