import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PreIgnitionScanner } from '../PreIgnitionScanner';
import { useScannerStore } from '../../../stores/scannerStore';
import type { ScanCheck } from '../../../stores/scannerStore';

// Mock the scanner store
vi.mock('../../../stores/scannerStore', () => ({
  useScannerStore: vi.fn(),
}));

describe('PreIgnitionScanner component', () => {
  const mockChecks: ScanCheck[] = [
    {
      id: 'check-1',
      name: 'Connection Check',
      description: 'Test connection',
      category: 'connection',
      status: 'pending',
      critical: true,
    },
    {
      id: 'check-2',
      name: 'Auth Check',
      description: 'Test auth',
      category: 'auth',
      status: 'pending',
      critical: false,
    },
    {
      id: 'check-3',
      name: 'Market Check',
      description: 'Test market',
      category: 'market',
      status: 'pending',
      critical: true,
    },
  ];

  const mockStore = {
    checks: mockChecks,
    isScanning: false,
    scanStartedAt: null,
    scanCompletedAt: null,
    passedCount: 0,
    failedCount: 0,
    warningCount: 0,
    canProceed: false,
    initializeChecks: vi.fn(),
    startScan: vi.fn(),
    resetScanner: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useScannerStore).mockReturnValue(mockStore);
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render heading', () => {
      render(<PreIgnitionScanner />);
      expect(screen.getByText('Pre-Ignition Scan')).toBeInTheDocument();
    });

    it('should render check count description', () => {
      render(<PreIgnitionScanner />);
      expect(screen.getByText(/Running 3-point diagnostic check/)).toBeInTheDocument();
    });

    it('should render Start Scan button', () => {
      render(<PreIgnitionScanner />);
      expect(screen.getByRole('button', { name: /Start Scan/i })).toBeInTheDocument();
    });

    it('should initialize checks on mount', () => {
      render(<PreIgnitionScanner />);
      expect(mockStore.initializeChecks).toHaveBeenCalled();
    });
  });

  describe('autoStart', () => {
    it('should call startScan when autoStart is true', () => {
      render(<PreIgnitionScanner autoStart />);
      expect(mockStore.startScan).toHaveBeenCalled();
    });

    it('should not call startScan when autoStart is false', () => {
      render(<PreIgnitionScanner autoStart={false} />);
      expect(mockStore.startScan).not.toHaveBeenCalled();
    });
  });

  describe('scanning state', () => {
    it('should not show scan button when scanning', () => {
      vi.mocked(useScannerStore).mockReturnValue({
        ...mockStore,
        isScanning: true,
      });

      render(<PreIgnitionScanner />);
      expect(screen.queryByRole('button', { name: /Start Scan/i })).not.toBeInTheDocument();
    });

    it('should show progress bar when scanning', () => {
      vi.mocked(useScannerStore).mockReturnValue({
        ...mockStore,
        isScanning: true,
      });

      render(<PreIgnitionScanner />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show "Scanning..." label on progress bar', () => {
      vi.mocked(useScannerStore).mockReturnValue({
        ...mockStore,
        isScanning: true,
      });

      render(<PreIgnitionScanner />);
      expect(screen.getByText('Scanning...')).toBeInTheDocument();
    });
  });

  describe('progress calculation', () => {
    it('should show 0% when no checks are completed', () => {
      vi.mocked(useScannerStore).mockReturnValue({
        ...mockStore,
        isScanning: true,
        checks: mockChecks,
      });

      render(<PreIgnitionScanner />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    });

    it('should calculate progress based on completed checks', () => {
      vi.mocked(useScannerStore).mockReturnValue({
        ...mockStore,
        isScanning: true,
        checks: [
          { ...mockChecks[0], status: 'passed' },
          { ...mockChecks[1], status: 'running' },
          { ...mockChecks[2], status: 'pending' },
        ],
      });

      render(<PreIgnitionScanner />);
      const progressbar = screen.getByRole('progressbar');
      // 1 out of 3 = 33.33...%
      const value = parseFloat(progressbar.getAttribute('aria-valuenow') || '0');
      expect(value).toBeCloseTo(33.33, 0);
    });
  });

  describe('completion state', () => {
    const completedStore = {
      ...mockStore,
      isScanning: false,
      scanStartedAt: 1000,
      scanCompletedAt: 1500,
      passedCount: 2,
      failedCount: 0,
      warningCount: 1,
      canProceed: true,
      checks: [
        { ...mockChecks[0], status: 'passed' as const },
        { ...mockChecks[1], status: 'warning' as const },
        { ...mockChecks[2], status: 'passed' as const },
      ],
    };

    it('should show summary stats when scan is complete', () => {
      vi.mocked(useScannerStore).mockReturnValue(completedStore);

      render(<PreIgnitionScanner />);
      expect(screen.getByText('2')).toBeInTheDocument(); // passed
      expect(screen.getByText('0')).toBeInTheDocument(); // failed
      expect(screen.getByText('1')).toBeInTheDocument(); // warnings
    });

    it('should show duration when scan is complete', () => {
      vi.mocked(useScannerStore).mockReturnValue(completedStore);

      render(<PreIgnitionScanner />);
      expect(screen.getByText('500ms')).toBeInTheDocument();
    });

    it('should show Rescan button when complete', () => {
      vi.mocked(useScannerStore).mockReturnValue(completedStore);

      render(<PreIgnitionScanner />);
      expect(screen.getByRole('button', { name: /Rescan/i })).toBeInTheDocument();
    });

    it('should show GO FOR IGNITION when canProceed is true', () => {
      vi.mocked(useScannerStore).mockReturnValue(completedStore);

      render(<PreIgnitionScanner />);
      expect(screen.getByText(/GO FOR IGNITION/)).toBeInTheDocument();
    });

    it('should show NO-GO when canProceed is false', () => {
      vi.mocked(useScannerStore).mockReturnValue({
        ...completedStore,
        canProceed: false,
      });

      render(<PreIgnitionScanner />);
      expect(screen.getByText(/NO-GO/)).toBeInTheDocument();
    });
  });

  describe('critical failures', () => {
    it('should show error display for critical failures', () => {
      vi.mocked(useScannerStore).mockReturnValue({
        ...mockStore,
        isScanning: false,
        scanCompletedAt: 1500,
        canProceed: false,
        checks: [
          { ...mockChecks[0], status: 'failed' as const, critical: true },
          { ...mockChecks[1], status: 'passed' as const },
          { ...mockChecks[2], status: 'passed' as const },
        ],
      });

      render(<PreIgnitionScanner />);
      expect(screen.getByText('Critical checks failed - Ignition blocked')).toBeInTheDocument();
    });

    it('should show count of critical failures', () => {
      vi.mocked(useScannerStore).mockReturnValue({
        ...mockStore,
        isScanning: false,
        scanCompletedAt: 1500,
        canProceed: false,
        checks: [
          { ...mockChecks[0], status: 'failed' as const, critical: true },
          { ...mockChecks[1], status: 'passed' as const },
          { ...mockChecks[2], status: 'failed' as const, critical: true },
        ],
      });

      render(<PreIgnitionScanner />);
      expect(screen.getByText(/2 critical check\(s\) did not pass/)).toBeInTheDocument();
    });
  });

  describe('check grouping', () => {
    it('should group checks by category', () => {
      render(<PreIgnitionScanner />);
      expect(screen.getByText('Connection Checks')).toBeInTheDocument();
      expect(screen.getByText('Authentication Checks')).toBeInTheDocument();
      expect(screen.getByText('Market Checks')).toBeInTheDocument();
    });

    it('should render all check items', () => {
      render(<PreIgnitionScanner />);
      expect(screen.getByText('Connection Check')).toBeInTheDocument();
      expect(screen.getByText('Auth Check')).toBeInTheDocument();
      expect(screen.getByText('Market Check')).toBeInTheDocument();
    });
  });

  describe('button interactions', () => {
    it('should call startScan on Start Scan button click', () => {
      render(<PreIgnitionScanner />);

      fireEvent.click(screen.getByRole('button', { name: /Start Scan/i }));

      expect(mockStore.resetScanner).toHaveBeenCalled();
      expect(mockStore.initializeChecks).toHaveBeenCalled();
      expect(mockStore.startScan).toHaveBeenCalled();
    });

    it('should call reset and restart on Rescan button click', () => {
      vi.mocked(useScannerStore).mockReturnValue({
        ...mockStore,
        isScanning: false,
        scanCompletedAt: 1500,
      });

      render(<PreIgnitionScanner />);

      fireEvent.click(screen.getByRole('button', { name: /Rescan/i }));

      expect(mockStore.resetScanner).toHaveBeenCalled();
      expect(mockStore.initializeChecks).toHaveBeenCalled();
      expect(mockStore.startScan).toHaveBeenCalled();
    });
  });

  describe('onComplete callback', () => {
    it('should call onComplete with canProceed when scan completes', async () => {
      const onComplete = vi.fn();

      // Initial render with incomplete scan
      const { rerender } = render(<PreIgnitionScanner onComplete={onComplete} />);

      expect(onComplete).not.toHaveBeenCalled();

      // Update to completed scan
      vi.mocked(useScannerStore).mockReturnValue({
        ...mockStore,
        isScanning: false,
        scanCompletedAt: 1500,
        canProceed: true,
      });

      rerender(<PreIgnitionScanner onComplete={onComplete} />);

      expect(onComplete).toHaveBeenCalledWith(true);
    });

    it('should call onComplete with false when scan fails', async () => {
      const onComplete = vi.fn();

      vi.mocked(useScannerStore).mockReturnValue({
        ...mockStore,
        isScanning: false,
        scanCompletedAt: 1500,
        canProceed: false,
      });

      render(<PreIgnitionScanner onComplete={onComplete} />);

      expect(onComplete).toHaveBeenCalledWith(false);
    });
  });

  describe('styling', () => {
    it('should apply green styling for GO status', () => {
      vi.mocked(useScannerStore).mockReturnValue({
        ...mockStore,
        isScanning: false,
        scanCompletedAt: 1500,
        canProceed: true,
      });

      const { container } = render(<PreIgnitionScanner />);
      expect(container.querySelector('.bg-green-100')).toBeInTheDocument();
    });

    it('should apply red styling for NO-GO status', () => {
      vi.mocked(useScannerStore).mockReturnValue({
        ...mockStore,
        isScanning: false,
        scanCompletedAt: 1500,
        canProceed: false,
      });

      const { container } = render(<PreIgnitionScanner />);
      expect(container.querySelector('.bg-red-100')).toBeInTheDocument();
    });
  });
});
