import React, { useState, useCallback } from 'react';
import { useIgnitionStore } from '../../stores/ignitionStore';
import { Button, ErrorDisplay, Spinner } from '../uxmi';

interface IgnitionButtonProps {
  onIgnition?: () => void;
  onAbort?: () => void;
}

/**
 * Phase 2: Ignition Button
 * - Two-stage safety: ARM then IGNITE
 * - Live trading requires explicit confirmation
 * - Clear visual states for each phase
 * - Emergency abort capability
 */
export const IgnitionButton: React.FC<IgnitionButtonProps> = ({
  onIgnition,
  onAbort,
}) => {
  const {
    selectedBackend,
    backendConfigs,
    phase,
    isArmed,
    liveConfirmed,
    ignitionError,
    armSystem,
    disarmSystem,
    confirmLive,
    ignite,
    abort,
    setError,
  } = useIgnitionStore();

  const [confirmText, setConfirmText] = useState('');
  // P2 REMEDIATION: Check if selected backend requires confirmation
  const selectedConfig = backendConfigs.find((c) => c.type === selectedBackend);
  const requiresConfirmation = selectedConfig?.requiresConfirmation ?? false;
  const CONFIRM_PHRASE = 'CONFIRM TRADE';

  const handleArm = useCallback(() => {
    if (requiresConfirmation && !liveConfirmed) {
      // Show confirmation dialog
      return;
    }
    armSystem();
  }, [requiresConfirmation, liveConfirmed, armSystem]);

  const handleIgnite = useCallback(async () => {
    await ignite();
    onIgnition?.();
  }, [ignite, onIgnition]);

  const handleAbort = useCallback(async () => {
    await abort();
    onAbort?.();
  }, [abort, onAbort]);

  const handleConfirmLive = useCallback(() => {
    if (confirmText === CONFIRM_PHRASE) {
      confirmLive();
      setConfirmText('');
    }
  }, [confirmText, confirmLive]);

  // Not ready state
  if (!selectedBackend) {
    return (
      <div className="p-6 bg-gray-100 rounded-xl text-center">
        <p className="text-gray-500">Select a backend to enable ignition</p>
      </div>
    );
  }

  // Live confirmation required
  if (requiresConfirmation && !liveConfirmed && phase !== 'running') {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-bold text-red-800">Live Trading Confirmation</h4>
              <p className="text-sm text-red-600">This will use REAL funds. Proceed with caution.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-red-700">
              Type "{CONFIRM_PHRASE}" to enable live trading:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder={CONFIRM_PHRASE}
              className="w-full px-4 py-3 border-2 border-red-300 rounded-lg font-mono text-center text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => useIgnitionStore.getState().reset()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmLive}
                disabled={confirmText !== CONFIRM_PHRASE}
                className="flex-1"
              >
                Confirm Live Trading
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (ignitionError) {
    return (
      <div className="space-y-4">
        <ErrorDisplay
          what="Ignition Error"
          why={ignitionError}
          how="Check the error details and try again"
          severity="error"
          onRetry={() => setError(null)}
          onDismiss={() => setError(null)}
        />
      </div>
    );
  }

  // Igniting state
  if (phase === 'igniting') {
    return (
      <div className="p-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl text-center border-2 border-orange-300">
        <Spinner size="lg" color="primary" label="Ignition sequence in progress..." />
        <p className="text-orange-800 font-medium mt-4">Initializing trading systems...</p>
        <Button variant="danger" onClick={handleAbort} className="mt-4">
          Emergency Abort
        </Button>
      </div>
    );
  }

  // Running state
  if (phase === 'running') {
    return (
      <div className="p-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl text-center border-2 border-green-300">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-green-800">System Running</h3>
        <p className="text-green-700 mt-2">
          {requiresConfirmation ? '🔴 LIVE TRADING ACTIVE' : '📋 Paper Trading Active'}
        </p>
        <Button variant="danger" onClick={handleAbort} className="mt-6">
          Shutdown System
        </Button>
      </div>
    );
  }

  // Armed state - ready to ignite
  if (isArmed && phase === 'armed') {
    return (
      <div className="space-y-4">
        <div
          className={`
            p-6 rounded-xl text-center border-2
            ${requiresConfirmation ? 'bg-red-100 border-red-400' : 'bg-yellow-100 border-yellow-400'}
          `}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className={`w-3 h-3 rounded-full animate-pulse ${
                requiresConfirmation ? 'bg-red-500' : 'bg-yellow-500'
              }`}
            />
            <span className={`font-bold text-lg ${requiresConfirmation ? 'text-red-700' : 'text-yellow-700'}`}>
              SYSTEM ARMED
            </span>
          </div>

          <p className="text-gray-600 mb-6">
            {requiresConfirmation
              ? 'Ready to initiate LIVE trading. This will use real funds.'
              : 'Ready to initiate paper trading simulation.'}
          </p>

          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={disarmSystem}>
              Disarm
            </Button>
            <button
              onClick={handleIgnite}
              className={`
                px-8 py-4 rounded-xl font-bold text-xl text-white
                transition-all duration-200 transform hover:scale-105
                ${
                  requiresConfirmation
                    ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 shadow-lg shadow-red-300'
                    : 'bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 shadow-lg shadow-green-300'
                }
              `}
            >
              🚀 IGNITE
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default - arm button
  return (
    <div className="space-y-4">
      <div className="p-6 bg-gray-50 rounded-xl text-center border-2 border-gray-200">
        <p className="text-gray-600 mb-4">
          Backend selected: <strong>{requiresConfirmation ? 'Real Trading' : 'Paper Trading'}</strong>
        </p>
        <Button
          variant={requiresConfirmation ? 'danger' : 'primary'}
          size="lg"
          onClick={handleArm}
        >
          {requiresConfirmation ? '⚠️ ARM SYSTEM (Live)' : '🔒 ARM SYSTEM'}
        </Button>
      </div>
    </div>
  );
};

export default IgnitionButton;
