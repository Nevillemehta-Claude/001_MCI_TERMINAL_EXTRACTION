import React, { useState } from 'react';
import { useShutdownStore, ShutdownStep } from '../../stores/shutdownStore';
import { useIgnitionStore } from '../../stores/ignitionStore';
import { Button, ProgressBar, ErrorDisplay, Spinner, Tooltip } from '../uxmi';

interface ShutdownPanelProps {
  onComplete?: () => void;
}

/**
 * Phase 4: Shutdown Panel
 * - Graceful shutdown with configurable options
 * - Emergency shutdown capability
 * - Step-by-step progress tracking
 * - Position and order handling options
 */
export const ShutdownPanel: React.FC<ShutdownPanelProps> = ({ onComplete }) => {
  const {
    phase,
    steps,
    isEmergency,
    shutdownStartedAt,
    shutdownCompletedAt,
    error,
    closePositions,
    cancelOrders,
    saveState,
    initiateShutdown,
    setOptions,
    reset,
  } = useShutdownStore();

  const { phase: ignitionPhase, reset: resetIgnition } = useIgnitionStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'normal' | 'emergency'>('normal');

  const isRunning = ignitionPhase === 'running';
  const isShuttingDown = phase !== 'idle' && phase !== 'complete' && phase !== 'error';

  const handleShutdown = (emergency: boolean) => {
    setConfirmType(emergency ? 'emergency' : 'normal');
    setShowConfirm(true);
  };

  const confirmShutdown = async () => {
    setShowConfirm(false);
    await initiateShutdown(confirmType === 'emergency');
  };

  const handleComplete = () => {
    resetIgnition();
    reset();
    onComplete?.();
  };

  // Calculate progress
  const completedSteps = steps.filter(
    (s) => s.status === 'complete' || s.status === 'skipped'
  ).length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  // Duration
  const duration = shutdownStartedAt
    ? (shutdownCompletedAt || Date.now()) - shutdownStartedAt
    : 0;

  const StepItem: React.FC<{ step: ShutdownStep }> = ({ step }) => {
    const statusConfig = {
      pending: {
        icon: <div className="w-4 h-4 rounded-full border-2 border-gray-300" />,
        color: 'text-gray-500',
      },
      running: {
        icon: <Spinner size="sm" color="primary" />,
        color: 'text-blue-600',
      },
      complete: {
        icon: (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ),
        color: 'text-green-600',
      },
      error: {
        icon: (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        ),
        color: 'text-red-600',
      },
      skipped: {
        icon: (
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        ),
        color: 'text-gray-400',
      },
    };

    const config = statusConfig[step.status];

    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg ${
          step.status === 'running' ? 'bg-blue-50' : 'bg-gray-50'
        }`}
      >
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="flex-1">
          <div className={`font-medium ${config.color}`}>{step.name}</div>
          <div className="text-xs text-gray-500">
            {step.message || step.description}
          </div>
        </div>
        {step.duration !== undefined && (
          <div className="text-xs font-mono text-gray-400">{step.duration}ms</div>
        )}
      </div>
    );
  };

  // Idle state - show shutdown options
  if (phase === 'idle' && !showConfirm) {
    return (
      <div className="space-y-6 p-6 bg-gray-50 rounded-xl">
        <h3 className="text-xl font-bold text-gray-800">Shutdown Options</h3>

        <div className="space-y-4">
          <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-gray-400 transition-colors">
            <input
              type="checkbox"
              checked={cancelOrders}
              onChange={(e) => setOptions({ cancelOrders: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <div>
              <div className="font-medium">Cancel Pending Orders</div>
              <div className="text-sm text-gray-500">Cancel all unfilled orders</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-gray-400 transition-colors">
            <input
              type="checkbox"
              checked={closePositions}
              onChange={(e) => setOptions({ closePositions: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <div>
              <div className="font-medium">Close All Positions</div>
              <div className="text-sm text-gray-500">Sell all holdings at market price</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-gray-400 transition-colors">
            <input
              type="checkbox"
              checked={saveState}
              onChange={(e) => setOptions({ saveState: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <div>
              <div className="font-medium">Save System State</div>
              <div className="text-sm text-gray-500">Persist state for next session</div>
            </div>
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={() => handleShutdown(false)}
            disabled={!isRunning}
            className="flex-1"
          >
            Graceful Shutdown
          </Button>
          <Tooltip content="Immediately stops all operations and closes positions">
            <Button
              variant="danger"
              onClick={() => handleShutdown(true)}
              disabled={!isRunning}
              className="flex-1"
            >
              ⚠️ Emergency Stop
            </Button>
          </Tooltip>
        </div>
      </div>
    );
  }

  // Confirmation dialog
  if (showConfirm) {
    return (
      <div className="p-6 bg-white rounded-xl border-2 border-gray-300">
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
              confirmType === 'emergency' ? 'bg-red-100' : 'bg-yellow-100'
            }`}
          >
            <span className="text-4xl">{confirmType === 'emergency' ? '🚨' : '⚠️'}</span>
          </div>
          <h3 className="text-xl font-bold mt-4">
            {confirmType === 'emergency' ? 'Emergency Shutdown' : 'Confirm Shutdown'}
          </h3>
          <p className="text-gray-600 mt-2">
            {confirmType === 'emergency'
              ? 'This will immediately stop all operations and close all positions.'
              : 'Are you sure you want to shut down the trading system?'}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowConfirm(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            variant={confirmType === 'emergency' ? 'danger' : 'primary'}
            onClick={confirmShutdown}
            className="flex-1"
          >
            {confirmType === 'emergency' ? 'EMERGENCY STOP' : 'Shutdown'}
          </Button>
        </div>
      </div>
    );
  }

  // Shutdown in progress
  if (isShuttingDown) {
    return (
      <div className="space-y-6 p-6 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {isEmergency ? '🚨 Emergency Shutdown' : 'Shutting Down...'}
          </h3>
          <span className="text-sm font-mono text-gray-500">{duration}ms</span>
        </div>

        <ProgressBar
          value={progress}
          variant={isEmergency ? 'error' : 'default'}
          showLabel
          animated
          striped={isEmergency}
        />

        <div className="space-y-2">
          {steps.map((step) => (
            <StepItem key={step.id} step={step} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (phase === 'error') {
    return (
      <div className="space-y-6 p-6 bg-gray-50 rounded-xl">
        <ErrorDisplay
          what="Shutdown failed"
          why={error || 'Unknown error'}
          how="Try emergency shutdown or check system logs"
          severity="error"
          onRetry={() => initiateShutdown(true)}
          actions={[{ label: 'Reset', onClick: reset }]}
        />
      </div>
    );
  }

  // Complete state
  if (phase === 'complete') {
    return (
      <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-green-800">Shutdown Complete</h3>
        <p className="text-green-600 mt-2">System has been safely shut down</p>
        <p className="text-sm text-gray-500 mt-1">Duration: {duration}ms</p>

        <Button variant="primary" onClick={handleComplete} className="mt-6">
          Return to Start
        </Button>
      </div>
    );
  }

  return null;
};

export default ShutdownPanel;
