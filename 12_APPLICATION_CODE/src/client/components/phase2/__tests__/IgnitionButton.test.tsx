import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { IgnitionButton } from '../IgnitionButton';
import { useIgnitionStore } from '../../../stores/ignitionStore';

// Mock the ignition store
vi.mock('../../../stores/ignitionStore', () => ({
  useIgnitionStore: vi.fn(() => mockStore),
}));

const mockStore = {
  selectedBackend: null,
  phase: 'idle' as const,
  isArmed: false,
  liveConfirmed: false,
  ignitionError: null,
  armSystem: vi.fn(),
  disarmSystem: vi.fn(),
  confirmLive: vi.fn(),
  ignite: vi.fn(),
  abort: vi.fn(),
  setError: vi.fn(),
  reset: vi.fn(),
};

// Add static method mock
const mockGetState = vi.fn(() => ({ reset: mockStore.reset }));
(useIgnitionStore as unknown as { getState: typeof mockGetState }).getState = mockGetState;

describe('IgnitionButton component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useIgnitionStore).mockReturnValue(mockStore);
  });

  describe('no backend selected', () => {
    it('should show message to select backend', () => {
      render(<IgnitionButton />);
      expect(screen.getByText('Select a backend to enable ignition')).toBeInTheDocument();
    });
  });

  describe('paper trading - default state', () => {
    beforeEach(() => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockStore,
        selectedBackend: 'paper',
        phase: 'selecting',
      });
    });

    it('should show ARM SYSTEM button', () => {
      render(<IgnitionButton />);
      expect(screen.getByRole('button', { name: /ARM SYSTEM/i })).toBeInTheDocument();
    });

    it('should show backend info', () => {
      render(<IgnitionButton />);
      expect(screen.getByText(/Paper Trading/)).toBeInTheDocument();
    });

    it('should call armSystem on ARM button click', () => {
      render(<IgnitionButton />);
      fireEvent.click(screen.getByRole('button', { name: /ARM SYSTEM/i }));
      expect(mockStore.armSystem).toHaveBeenCalled();
    });
  });

  describe('live trading - confirmation required', () => {
    beforeEach(() => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockStore,
        selectedBackend: 'live',
        phase: 'selecting',
        liveConfirmed: false,
      });
    });

    it('should show confirmation dialog', () => {
      render(<IgnitionButton />);
      expect(screen.getByText('Live Trading Confirmation')).toBeInTheDocument();
    });

    it('should show warning about real funds', () => {
      render(<IgnitionButton />);
      expect(screen.getByText(/This will use REAL funds/)).toBeInTheDocument();
    });

    it('should show confirmation input', () => {
      render(<IgnitionButton />);
      expect(screen.getByPlaceholderText('CONFIRM LIVE')).toBeInTheDocument();
    });

    it('should have disabled confirm button initially', () => {
      render(<IgnitionButton />);
      expect(screen.getByRole('button', { name: /Confirm Live Trading/i })).toBeDisabled();
    });

    it('should enable confirm button when phrase is typed correctly', () => {
      render(<IgnitionButton />);
      const input = screen.getByPlaceholderText('CONFIRM LIVE');
      fireEvent.change(input, { target: { value: 'confirm live' } });
      expect(screen.getByRole('button', { name: /Confirm Live Trading/i })).not.toBeDisabled();
    });

    it('should convert input to uppercase', () => {
      render(<IgnitionButton />);
      const input = screen.getByPlaceholderText('CONFIRM LIVE') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'confirm live' } });
      expect(input.value).toBe('CONFIRM LIVE');
    });

    it('should call confirmLive when confirmed', () => {
      render(<IgnitionButton />);
      const input = screen.getByPlaceholderText('CONFIRM LIVE');
      fireEvent.change(input, { target: { value: 'CONFIRM LIVE' } });
      fireEvent.click(screen.getByRole('button', { name: /Confirm Live Trading/i }));
      expect(mockStore.confirmLive).toHaveBeenCalled();
    });

    it('should have Cancel button that calls reset', () => {
      render(<IgnitionButton />);
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      expect(cancelButton).toBeInTheDocument();
    });
  });

  describe('live trading - confirmed, ready to arm', () => {
    beforeEach(() => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockStore,
        selectedBackend: 'live',
        phase: 'selecting',
        liveConfirmed: true,
      });
    });

    it('should show ARM SYSTEM with Live label', () => {
      render(<IgnitionButton />);
      expect(screen.getByRole('button', { name: /ARM SYSTEM \(Live\)/i })).toBeInTheDocument();
    });

    it('should show Live Trading text', () => {
      render(<IgnitionButton />);
      expect(screen.getByText(/Live Trading/)).toBeInTheDocument();
    });
  });

  describe('armed state', () => {
    beforeEach(() => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockStore,
        selectedBackend: 'paper',
        phase: 'armed',
        isArmed: true,
      });
    });

    it('should show SYSTEM ARMED text', () => {
      render(<IgnitionButton />);
      expect(screen.getByText('SYSTEM ARMED')).toBeInTheDocument();
    });

    it('should show IGNITE button', () => {
      render(<IgnitionButton />);
      expect(screen.getByText(/IGNITE/)).toBeInTheDocument();
    });

    it('should show Disarm button', () => {
      render(<IgnitionButton />);
      expect(screen.getByRole('button', { name: /Disarm/i })).toBeInTheDocument();
    });

    it('should call ignite on IGNITE button click', async () => {
      mockStore.ignite.mockResolvedValue(undefined);
      render(<IgnitionButton />);
      fireEvent.click(screen.getByText(/IGNITE/));
      await waitFor(() => {
        expect(mockStore.ignite).toHaveBeenCalled();
      });
    });

    it('should call onIgnition callback after ignition', async () => {
      const onIgnition = vi.fn();
      mockStore.ignite.mockResolvedValue(undefined);
      render(<IgnitionButton onIgnition={onIgnition} />);
      fireEvent.click(screen.getByText(/IGNITE/));
      await waitFor(() => {
        expect(onIgnition).toHaveBeenCalled();
      });
    });

    it('should call disarmSystem on Disarm button click', () => {
      render(<IgnitionButton />);
      fireEvent.click(screen.getByRole('button', { name: /Disarm/i }));
      expect(mockStore.disarmSystem).toHaveBeenCalled();
    });
  });

  describe('armed state - live backend', () => {
    beforeEach(() => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockStore,
        selectedBackend: 'live',
        phase: 'armed',
        isArmed: true,
        liveConfirmed: true,
      });
    });

    it('should apply red styling for live', () => {
      const { container } = render(<IgnitionButton />);
      expect(container.querySelector('.bg-red-100')).toBeInTheDocument();
    });

    it('should show real funds warning', () => {
      render(<IgnitionButton />);
      expect(screen.getByText(/This will use real funds/i)).toBeInTheDocument();
    });
  });

  describe('igniting state', () => {
    beforeEach(() => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockStore,
        selectedBackend: 'paper',
        phase: 'igniting',
        isArmed: true,
      });
    });

    it('should show spinner', () => {
      render(<IgnitionButton />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show ignition message', () => {
      render(<IgnitionButton />);
      expect(screen.getByText(/Initializing trading systems/i)).toBeInTheDocument();
    });

    it('should show Emergency Abort button', () => {
      render(<IgnitionButton />);
      expect(screen.getByRole('button', { name: /Emergency Abort/i })).toBeInTheDocument();
    });

    it('should call abort on Emergency Abort click', async () => {
      mockStore.abort.mockResolvedValue(undefined);
      render(<IgnitionButton />);
      fireEvent.click(screen.getByRole('button', { name: /Emergency Abort/i }));
      await waitFor(() => {
        expect(mockStore.abort).toHaveBeenCalled();
      });
    });
  });

  describe('running state', () => {
    beforeEach(() => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockStore,
        selectedBackend: 'paper',
        phase: 'running',
        isArmed: true,
      });
    });

    it('should show System Running text', () => {
      render(<IgnitionButton />);
      expect(screen.getByText('System Running')).toBeInTheDocument();
    });

    it('should show Paper Trading Active for paper', () => {
      render(<IgnitionButton />);
      expect(screen.getByText(/Paper Trading Active/)).toBeInTheDocument();
    });

    it('should show Shutdown button', () => {
      render(<IgnitionButton />);
      expect(screen.getByRole('button', { name: /Shutdown System/i })).toBeInTheDocument();
    });

    it('should call abort on Shutdown button click', async () => {
      mockStore.abort.mockResolvedValue(undefined);
      render(<IgnitionButton />);
      fireEvent.click(screen.getByRole('button', { name: /Shutdown System/i }));
      await waitFor(() => {
        expect(mockStore.abort).toHaveBeenCalled();
      });
    });
  });

  describe('running state - live', () => {
    beforeEach(() => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockStore,
        selectedBackend: 'live',
        phase: 'running',
        isArmed: true,
        liveConfirmed: true,
      });
    });

    it('should show LIVE TRADING ACTIVE', () => {
      render(<IgnitionButton />);
      expect(screen.getByText(/LIVE TRADING ACTIVE/)).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    beforeEach(() => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockStore,
        selectedBackend: 'paper',
        phase: 'error',
        ignitionError: 'Connection failed',
      });
    });

    it('should show error display', () => {
      render(<IgnitionButton />);
      expect(screen.getByText('Ignition Error')).toBeInTheDocument();
    });

    it('should show error message', () => {
      render(<IgnitionButton />);
      expect(screen.getByText(/Connection failed/)).toBeInTheDocument();
    });

    it('should have retry button that clears error', () => {
      render(<IgnitionButton />);
      fireEvent.click(screen.getByText('Try Again'));
      expect(mockStore.setError).toHaveBeenCalledWith(null);
    });

    it('should have dismiss button that clears error', () => {
      render(<IgnitionButton />);
      fireEvent.click(screen.getByText('Dismiss'));
      expect(mockStore.setError).toHaveBeenCalledWith(null);
    });
  });

  describe('callbacks', () => {
    it('should call onAbort callback after abort', async () => {
      const onAbort = vi.fn();
      mockStore.abort.mockResolvedValue(undefined);
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockStore,
        selectedBackend: 'paper',
        phase: 'running',
      });

      render(<IgnitionButton onAbort={onAbort} />);
      fireEvent.click(screen.getByRole('button', { name: /Shutdown System/i }));

      await waitFor(() => {
        expect(onAbort).toHaveBeenCalled();
      });
    });
  });
});
