import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { App } from '../App';
import { useIgnitionStore } from '../stores';

// Mock all child components
vi.mock('../components/phase0', () => ({
  TokenCaptureForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="token-capture-form">
      <button onClick={onSuccess}>Complete Token Capture</button>
    </div>
  ),
  TokenTimer: ({ compact }: { compact?: boolean }) => (
    <div data-testid="token-timer" data-compact={compact}>Token Timer</div>
  ),
}));

vi.mock('../components/phase1', () => ({
  PreIgnitionScanner: ({ onComplete, autoStart }: { onComplete: (canProceed: boolean) => void; autoStart?: boolean }) => (
    <div data-testid="pre-ignition-scanner" data-autostart={autoStart}>
      <button onClick={() => onComplete(true)}>Pass Scan</button>
      <button onClick={() => onComplete(false)}>Fail Scan</button>
    </div>
  ),
}));

vi.mock('../components/phase2', () => ({
  BackendSelector: () => <div data-testid="backend-selector">Backend Selector</div>,
  IgnitionButton: ({ onIgnition }: { onIgnition: () => void }) => (
    <div data-testid="ignition-button">
      <button onClick={onIgnition}>Ignite</button>
    </div>
  ),
}));

vi.mock('../components/phase3', () => ({
  TelemetryDashboard: () => <div data-testid="telemetry-dashboard">Telemetry Dashboard</div>,
}));

vi.mock('../components/phase4', () => ({
  ShutdownPanel: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="shutdown-panel">
      <button onClick={onComplete}>Complete Shutdown</button>
    </div>
  ),
}));

vi.mock('../components/uxmi', () => ({
  ToastContainer: ({ toasts, onDismiss }: { toasts: Array<{ id: string; title: string }>; onDismiss: (id: string) => void }) => (
    <div data-testid="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} data-testid={`toast-${toast.id}`}>
          {toast.title}
          <button onClick={() => onDismiss(toast.id)}>Dismiss</button>
        </div>
      ))}
    </div>
  ),
}));

// Mock the ignition store
vi.mock('../stores', () => ({
  useIgnitionStore: vi.fn(),
}));

describe('App component', () => {
  beforeEach(() => {
    vi.mocked(useIgnitionStore).mockReturnValue({ phase: 'idle' });
    vi.clearAllMocks();
  });

  describe('initial render', () => {
    it('should render the MCI header', () => {
      render(<App />);
      expect(screen.getByText('🚀 MCI')).toBeInTheDocument();
    });

    it('should display Mission Control Interface subtitle', () => {
      render(<App />);
      expect(screen.getByText('Mission Control Interface')).toBeInTheDocument();
    });

    it('should show Token Capture phase initially', () => {
      render(<App />);
      expect(screen.getByText('Token Capture')).toBeInTheDocument();
    });

    it('should render TokenCaptureForm in token phase', () => {
      render(<App />);
      expect(screen.getByTestId('token-capture-form')).toBeInTheDocument();
    });

    it('should show Phase 0 indicator', () => {
      render(<App />);
      expect(screen.getByText('Phase 0')).toBeInTheDocument();
    });

    it('should render footer with version info', () => {
      render(<App />);
      expect(screen.getByText(/CIA-SIE-START-STOP.*MCI v1.0.0.*CR-005 Compliant/)).toBeInTheDocument();
    });

    it('should render ToastContainer', () => {
      render(<App />);
      expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    });
  });

  describe('phase indicator', () => {
    it('should show phase numbers 0-3 in header', () => {
      render(<App />);
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('token phase to scan phase transition', () => {
    it('should transition to scan phase when token capture succeeds', () => {
      render(<App />);

      fireEvent.click(screen.getByText('Complete Token Capture'));

      expect(screen.getByTestId('pre-ignition-scanner')).toBeInTheDocument();
      expect(screen.getByText('Pre-Ignition Scan')).toBeInTheDocument();
    });

    it('should show success toast on token validation', () => {
      render(<App />);

      fireEvent.click(screen.getByText('Complete Token Capture'));

      expect(screen.getByText('Tokens validated')).toBeInTheDocument();
    });

    it('should show TokenTimer in scan phase', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));

      expect(screen.getByTestId('token-timer')).toBeInTheDocument();
    });
  });

  describe('scan phase to ignition phase transition', () => {
    it('should transition to ignition phase when scan passes', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      fireEvent.click(screen.getByText('Pass Scan'));

      expect(screen.getByTestId('backend-selector')).toBeInTheDocument();
      expect(screen.getByTestId('ignition-button')).toBeInTheDocument();
      expect(screen.getByText('Ignition Sequence')).toBeInTheDocument();
    });

    it('should show success toast on scan pass', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      fireEvent.click(screen.getByText('Pass Scan'));

      expect(screen.getByText('System check passed')).toBeInTheDocument();
    });

    it('should show error toast when scan fails', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      fireEvent.click(screen.getByText('Fail Scan'));

      expect(screen.getByText('System check failed')).toBeInTheDocument();
    });

    it('should stay in scan phase when scan fails', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      fireEvent.click(screen.getByText('Fail Scan'));

      expect(screen.getByTestId('pre-ignition-scanner')).toBeInTheDocument();
    });
  });

  describe('ignition phase to running phase transition', () => {
    it('should transition to running phase on ignition', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      fireEvent.click(screen.getByText('Pass Scan'));
      fireEvent.click(screen.getByText('Ignite'));

      expect(screen.getByTestId('telemetry-dashboard')).toBeInTheDocument();
      expect(screen.getByText('Mission Control')).toBeInTheDocument();
    });

    it('should show success toast on ignition', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      fireEvent.click(screen.getByText('Pass Scan'));
      fireEvent.click(screen.getByText('Ignite'));

      expect(screen.getByText('System ignited')).toBeInTheDocument();
    });

    it('should show Initiate Shutdown button in running phase', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      fireEvent.click(screen.getByText('Pass Scan'));
      fireEvent.click(screen.getByText('Ignite'));

      expect(screen.getByText('Initiate Shutdown')).toBeInTheDocument();
    });
  });

  describe('running phase to shutdown phase transition', () => {
    it('should transition to shutdown phase when shutdown requested', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      fireEvent.click(screen.getByText('Pass Scan'));
      fireEvent.click(screen.getByText('Ignite'));
      fireEvent.click(screen.getByText('Initiate Shutdown'));

      expect(screen.getByTestId('shutdown-panel')).toBeInTheDocument();
      expect(screen.getByText('Shutdown Protocol')).toBeInTheDocument();
    });
  });

  describe('shutdown phase to token phase transition', () => {
    it('should return to token phase when shutdown completes', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      fireEvent.click(screen.getByText('Pass Scan'));
      fireEvent.click(screen.getByText('Ignite'));
      fireEvent.click(screen.getByText('Initiate Shutdown'));
      fireEvent.click(screen.getByText('Complete Shutdown'));

      expect(screen.getByTestId('token-capture-form')).toBeInTheDocument();
      expect(screen.getByText('Token Capture')).toBeInTheDocument();
    });

    it('should show info toast when shutdown completes', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      fireEvent.click(screen.getByText('Pass Scan'));
      fireEvent.click(screen.getByText('Ignite'));
      fireEvent.click(screen.getByText('Initiate Shutdown'));
      fireEvent.click(screen.getByText('Complete Shutdown'));

      expect(screen.getByText('System shutdown')).toBeInTheDocument();
    });
  });

  describe('back navigation', () => {
    it('should not show back button in token phase', () => {
      render(<App />);
      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });

    it('should show back button in scan phase', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('should navigate from scan to token when back clicked', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      fireEvent.click(screen.getByText('Back'));

      expect(screen.getByTestId('token-capture-form')).toBeInTheDocument();
    });

    it('should show back button in ignition phase', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      fireEvent.click(screen.getByText('Pass Scan'));
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('should navigate from ignition to scan when back clicked', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      fireEvent.click(screen.getByText('Pass Scan'));
      fireEvent.click(screen.getByText('Back'));

      expect(screen.getByTestId('pre-ignition-scanner')).toBeInTheDocument();
    });

    it('should not show back button in running phase', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      fireEvent.click(screen.getByText('Pass Scan'));
      fireEvent.click(screen.getByText('Ignite'));

      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });

    it('should show back button in shutdown phase', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      fireEvent.click(screen.getByText('Pass Scan'));
      fireEvent.click(screen.getByText('Ignite'));
      fireEvent.click(screen.getByText('Initiate Shutdown'));

      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('should navigate from shutdown to running when back clicked', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));
      fireEvent.click(screen.getByText('Pass Scan'));
      fireEvent.click(screen.getByText('Ignite'));
      fireEvent.click(screen.getByText('Initiate Shutdown'));
      fireEvent.click(screen.getByText('Back'));

      expect(screen.getByTestId('telemetry-dashboard')).toBeInTheDocument();
    });
  });

  describe('toast management', () => {
    it('should dismiss toast when dismiss button clicked', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Complete Token Capture'));

      const toastElement = screen.getByText('Tokens validated').parentElement;
      const dismissButton = toastElement?.querySelector('button');

      if (dismissButton) {
        fireEvent.click(dismissButton);
      }

      // Toast should be removed
      expect(screen.queryByText('Tokens validated')).not.toBeInTheDocument();
    });
  });

  describe('ignition store sync', () => {
    it('should sync to running phase when ignition store says running', () => {
      vi.mocked(useIgnitionStore).mockReturnValue({ phase: 'running' });

      render(<App />);

      // Should automatically be in running phase
      expect(screen.getByTestId('telemetry-dashboard')).toBeInTheDocument();
    });

    it('should stay in shutdown phase even if ignition store says running', () => {
      vi.mocked(useIgnitionStore).mockReturnValue({ phase: 'running' });

      const { rerender } = render(<App />);

      // Manually navigate to shutdown
      fireEvent.click(screen.getByText('Initiate Shutdown'));

      // Should stay in shutdown
      expect(screen.getByTestId('shutdown-panel')).toBeInTheDocument();
    });
  });
});
