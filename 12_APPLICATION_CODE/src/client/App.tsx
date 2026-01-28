import React, { useState, useCallback, useEffect } from 'react';
import { useIgnitionStore, useTokenStore } from './stores';
import { TokenCaptureForm, TokenTimer, CredentialsHelper } from './components/phase0';
import { PreIgnitionScanner } from './components/phase1';
import { BackendSelector, IgnitionButton } from './components/phase2';
import { TelemetryDashboard } from './components/phase3';
import { ShutdownPanel } from './components/phase4';
import { ToastContainer } from './components/uxmi';
import { StatusBar } from './components/cockpit';

type AppPhase = 'token' | 'scan' | 'ignition' | 'running' | 'shutdown';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

/**
 * MCI Main Application
 *
 * Phase Flow:
 * 1. Token Capture → Enter API credentials
 * 2. Pre-Ignition Scan → 12-point system check
 * 3. Ignition → Select backend and launch
 * 4. Running → Telemetry dashboard
 * 5. Shutdown → Graceful system shutdown
 */
export const App: React.FC = () => {
  const { phase: ignitionPhase, reset: resetIgnition } = useIgnitionStore();
  const { clearTokens } = useTokenStore();

  const [currentPhase, setCurrentPhase] = useState<AppPhase>('token');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  // Auto-clear stale session state on app load
  useEffect(() => {
    // Check URL for ?reset=true parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === 'true') {
      console.log('[MCI] Reset requested via URL parameter');
      sessionStorage.clear();
      clearTokens();
      resetIgnition();
      // Remove the parameter from URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [clearTokens, resetIgnition]);

  // Full system reset function
  const handleFullReset = useCallback(() => {
    console.log('[MCI] Full system reset initiated');
    sessionStorage.clear();
    clearTokens();
    resetIgnition();
    setCurrentPhase('token');
    addToast({ type: 'info', title: 'System Reset', message: 'All state cleared. Starting fresh.' });
  }, [clearTokens, resetIgnition, addToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Handle token capture success
  const handleTokenSuccess = useCallback(() => {
    addToast({ type: 'success', title: 'Tokens validated', message: 'Proceeding to system check' });
    setCurrentPhase('scan');
  }, [addToast]);

  // Handle scan complete
  const handleScanComplete = useCallback(
    (canProceed: boolean) => {
      if (canProceed) {
        addToast({ type: 'success', title: 'System check passed', message: 'Ready for ignition' });
        setCurrentPhase('ignition');
      } else {
        addToast({ type: 'error', title: 'System check failed', message: 'Resolve issues before continuing' });
      }
    },
    [addToast]
  );

  // Handle ignition
  const handleIgnition = useCallback(() => {
    addToast({ type: 'success', title: 'System ignited', message: 'Trading system is now active' });
    setCurrentPhase('running');
  }, [addToast]);

  // Handle shutdown initiation
  const handleShutdownRequest = useCallback(() => {
    setCurrentPhase('shutdown');
  }, []);

  // Handle shutdown complete
  const handleShutdownComplete = useCallback(() => {
    addToast({ type: 'info', title: 'System shutdown', message: 'Returning to start' });
    setCurrentPhase('token');
  }, [addToast]);

  // Navigation helper
  const canNavigateBack = currentPhase !== 'token' && currentPhase !== 'running';

  const handleBack = useCallback(() => {
    switch (currentPhase) {
      case 'scan':
        setCurrentPhase('token');
        break;
      case 'ignition':
        setCurrentPhase('scan');
        break;
      case 'shutdown':
        setCurrentPhase('running');
        break;
    }
  }, [currentPhase]);

  // Update phase based on ignition state
  React.useEffect(() => {
    if (ignitionPhase === 'running' && currentPhase !== 'running' && currentPhase !== 'shutdown') {
      setCurrentPhase('running');
    }
  }, [ignitionPhase, currentPhase]);

  const renderPhase = () => {
    switch (currentPhase) {
      case 'token':
        return (
          <div className="flex flex-col lg:flex-row gap-8 justify-center max-w-5xl mx-auto">
            {/* Token Capture Form - Left Side */}
            <div className="flex-1 max-w-md">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm h-full">
                <TokenCaptureForm onSuccess={handleTokenSuccess} />
              </div>
            </div>
            {/* Credentials Helper - Right Side */}
            <div className="w-full lg:w-80">
              <CredentialsHelper />
            </div>
          </div>
        );

      case 'scan':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <TokenTimer compact showRefreshButton={false} />
            </div>
            <PreIgnitionScanner onComplete={handleScanComplete} autoStart />
          </div>
        );

      case 'ignition':
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="mb-6">
              <TokenTimer compact showRefreshButton={false} />
            </div>
            <BackendSelector />
            <IgnitionButton onIgnition={handleIgnition} />
          </div>
        );

      case 'running':
        return (
          <div className="h-full">
            <TelemetryDashboard />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleShutdownRequest}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Initiate Shutdown
              </button>
            </div>
          </div>
        );

      case 'shutdown':
        return (
          <div className="max-w-2xl mx-auto">
            <ShutdownPanel onComplete={handleShutdownComplete} />
          </div>
        );

      default:
        return null;
    }
  };

  const phaseLabels: Record<AppPhase, string> = {
    token: 'Token Capture',
    scan: 'Pre-Ignition Scan',
    ignition: 'Ignition Sequence',
    running: 'Mission Control',
    shutdown: 'Shutdown Protocol',
  };

  const phaseNumbers: Record<AppPhase, number> = {
    token: 0,
    scan: 1,
    ignition: 2,
    running: 3,
    shutdown: 4,
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* COCKPIT INTEGRITY: StatusBar - Always visible, always truthful */}
      <StatusBar />

      {/* Header */}
      <header className="bg-gray-900 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">🚀 MCI</h1>
            <span className="text-gray-400">Mission Control Interface</span>
          </div>

          {/* Phase indicator */}
          <div className="flex items-center gap-2">
            {(['token', 'scan', 'ignition', 'running'] as AppPhase[]).map((phase, index) => (
              <React.Fragment key={phase}>
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${
                      phaseNumbers[currentPhase] >= index
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }
                  `}
                >
                  {index}
                </div>
                {index < 3 && (
                  <div
                    className={`w-8 h-0.5 ${
                      phaseNumbers[currentPhase] > index ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Current phase label + Reset button */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Phase {phaseNumbers[currentPhase]}</div>
              <div className="font-semibold">{phaseLabels[currentPhase]}</div>
            </div>
            <button
              onClick={handleFullReset}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              title="Clear all state and start fresh"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {canNavigateBack && (
        <div className="bg-gray-200 py-2 px-6">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={handleBack}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-8 px-6">
        {renderPhase()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-4 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <span>MCI - Mission Control Interface • v1.0.0 • CR-005 Compliant</span>
          {/* COCKPIT INTEGRITY: Compact status in footer */}
          <StatusBar compact />
        </div>
      </footer>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} position="top-right" />
    </div>
  );
};

export default App;
