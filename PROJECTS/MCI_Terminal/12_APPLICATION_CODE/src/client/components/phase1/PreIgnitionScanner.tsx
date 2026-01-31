import React, { useEffect, useMemo } from 'react';
import { useScannerStore } from '../../stores/scannerStore';
import { Button, ProgressBar, ErrorDisplay } from '../uxmi';
import { ScanCheckItem } from './ScanCheckItem';

interface PreIgnitionScannerProps {
  onComplete?: (canProceed: boolean) => void;
  autoStart?: boolean;
}

/**
 * Phase 1: Pre-Ignition Scanner
 * - 12-point diagnostic system
 * - Target: Complete all checks in <500ms
 * - Visual progress with real-time updates
 * - GO/NO-GO status determination
 */
export const PreIgnitionScanner: React.FC<PreIgnitionScannerProps> = ({
  onComplete,
  autoStart = false,
}) => {
  const {
    checks,
    isScanning,
    scanStartedAt,
    scanCompletedAt,
    passedCount,
    failedCount,
    warningCount,
    canProceed,
    initializeChecks,
    startScan,
    resetScanner,
  } = useScannerStore();

  // Initialize checks on mount
  useEffect(() => {
    initializeChecks();
    if (autoStart) {
      startScan();
    }
  }, [initializeChecks, autoStart, startScan]);

  // Notify on completion
  useEffect(() => {
    if (scanCompletedAt && !isScanning) {
      onComplete?.(canProceed);
    }
  }, [scanCompletedAt, isScanning, canProceed, onComplete]);

  // Calculate progress
  const progress = useMemo(() => {
    if (checks.length === 0) return 0;
    const completed = checks.filter(
      (c) => c.status !== 'pending' && c.status !== 'running'
    ).length;
    return (completed / checks.length) * 100;
  }, [checks]);

  // Calculate scan duration
  const scanDuration = useMemo(() => {
    if (!scanStartedAt) return null;
    const endTime = scanCompletedAt || Date.now();
    return endTime - scanStartedAt;
  }, [scanStartedAt, scanCompletedAt]);

  // Group checks by category
  const checksByCategory = useMemo(() => {
    const grouped: Record<string, typeof checks> = {};
    checks.forEach((check) => {
      if (!grouped[check.category]) {
        grouped[check.category] = [];
      }
      grouped[check.category].push(check);
    });
    return grouped;
  }, [checks]);

  const categoryLabels = {
    connection: 'Connection Checks',
    auth: 'Authentication Checks',
    market: 'Market Checks',
    system: 'System Checks',
    config: 'Configuration Checks',
  };

  const handleStartScan = () => {
    resetScanner();
    initializeChecks();
    startScan();
  };

  const isComplete = scanCompletedAt !== null && !isScanning;
  const criticalFailures = checks.filter(
    (c) => c.critical && c.status === 'failed'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pre-Ignition Scan</h2>
          <p className="text-gray-600 mt-1">
            Running {checks.length}-point diagnostic check
          </p>
        </div>

        {!isScanning && (
          <Button
            variant={isComplete ? 'secondary' : 'primary'}
            onClick={handleStartScan}
          >
            {isComplete ? 'Rescan' : 'Start Scan'}
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {isScanning && (
        <ProgressBar
          value={progress}
          variant="default"
          showLabel
          label="Scanning..."
          animated
        />
      )}

      {/* Summary Stats */}
      {isComplete && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{passedCount}</div>
            <div className="text-sm text-green-700">Passed</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{failedCount}</div>
            <div className="text-sm text-red-700">Failed</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{warningCount}</div>
            <div className="text-sm text-yellow-700">Warnings</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {scanDuration ? `${scanDuration}ms` : '--'}
            </div>
            <div className="text-sm text-blue-700">Duration</div>
          </div>
        </div>
      )}

      {/* Critical Failure Warning */}
      {isComplete && criticalFailures.length > 0 && (
        <ErrorDisplay
          what="Critical checks failed - Ignition blocked"
          why={`${criticalFailures.length} critical check(s) did not pass`}
          how="Resolve the critical failures before proceeding to ignition"
          severity="error"
          technicalDetails={criticalFailures
            .map((c) => `${c.name}: ${c.message || 'Failed'}`)
            .join('\n')}
        />
      )}

      {/* GO/NO-GO Status */}
      {isComplete && (
        <div
          className={`
            p-6 rounded-xl text-center font-bold text-2xl
            ${
              canProceed
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : 'bg-red-100 text-red-800 border-2 border-red-300'
            }
          `}
        >
          {canProceed ? '✓ GO FOR IGNITION' : '✕ NO-GO - RESOLVE FAILURES'}
        </div>
      )}

      {/* Check List by Category */}
      <div className="space-y-6">
        {Object.entries(checksByCategory).map(([category, categoryChecks]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>
            <div className="space-y-2">
              {categoryChecks.map((check) => (
                <ScanCheckItem key={check.id} check={check} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreIgnitionScanner;
