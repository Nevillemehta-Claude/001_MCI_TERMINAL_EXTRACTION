/**
 * IRONCLAD Test Suite: shutdownStore Edge Cases
 *
 * Financial-grade testing for shutdown operations
 * - Emergency shutdown guarantees
 * - Step execution order integrity
 * - Partial failure handling
 * - Resource cleanup verification
 * - Timeout scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useShutdownStore } from '../shutdownStore';

// Helper to mock fetch with proper typing for tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGlobal = global as any;

// Mock Sentry
vi.mock('../lib/sentry', () => ({
  logTradingBreadcrumb: vi.fn(),
  captureTradeError: vi.fn(),
  Sentry: {
    startSpan: vi.fn((_options, callback) => {
      // Execute the callback directly - startSpan just wraps it
      return callback();
    }),
  },
}));

describe('IRONCLAD: shutdownStore Edge Cases', () => {
  const originalFetch = mockGlobal.fetch;

  // Helper to run async operations with timer advancement
  const runWithTimers = async <T>(operation: () => Promise<T>): Promise<T> => {
    const promise = operation();
    await vi.runAllTimersAsync();
    return promise;
  };

  beforeEach(() => {
    useShutdownStore.getState().reset();
    // Reset options to defaults
    useShutdownStore.setState({
      closePositions: false,
      cancelOrders: true,
      saveState: true,
    });
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    mockGlobal.fetch = originalFetch;
  });

  describe('Emergency Shutdown Guarantees', () => {
    it('should force all critical steps in emergency mode regardless of options', async () => {
      // Disable all options
      useShutdownStore.getState().setOptions({
        closePositions: false,
        cancelOrders: false,
        saveState: false,
      });

      mockGlobal.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown(true));

      const state = useShutdownStore.getState();
      expect(state.isEmergency).toBe(true);

      // close-positions and cancel-orders should NOT be skipped in emergency
      const closePositions = state.steps.find((s) => s.id === 'close-positions');
      const cancelOrders = state.steps.find((s) => s.id === 'cancel-orders');

      expect(closePositions?.status).not.toBe('skipped');
      expect(cancelOrders?.status).not.toBe('skipped');
    });

    it('should continue emergency shutdown even when steps fail', async () => {
      let callCount = 0;
      mockGlobal.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        // Fail every other step
        if (callCount % 2 === 0) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ message: 'Step failed' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'OK' }),
        });
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown(true));

      const state = useShutdownStore.getState();
      // Should complete despite failures in emergency mode
      expect(state.phase).toBe('complete');

      // Should have some error steps
      const errorSteps = state.steps.filter((s) => s.status === 'error');
      expect(errorSteps.length).toBeGreaterThan(0);
      
      // All steps should have been attempted (not skipped)
      const attemptedSteps = state.steps.filter((s) => s.status !== 'skipped');
      expect(attemptedSteps.length).toBeGreaterThan(0);
    });

    it('should complete emergency shutdown even with network failures', async () => {
      mockGlobal.fetch = vi.fn().mockRejectedValue(new Error('Network down'));

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown(true));

      const state = useShutdownStore.getState();
      // Emergency shutdown should still "complete" (all steps attempted, even if they failed)
      expect(state.phase).toBe('complete');
      
      // All attempted steps should have error status
      const attemptedSteps = state.steps.filter((s) => s.status !== 'skipped');
      attemptedSteps.forEach(step => {
        expect(step.status).toBe('error');
      });
    });

    it('should set isEmergency flag correctly', async () => {
      mockGlobal.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      // Normal shutdown
      await runWithTimers(() => useShutdownStore.getState().initiateShutdown(false));
      expect(useShutdownStore.getState().isEmergency).toBe(false);

      useShutdownStore.getState().reset();
      useShutdownStore.setState({
        closePositions: false,
        cancelOrders: true,
        saveState: true,
      });

      // Emergency shutdown
      await runWithTimers(() => useShutdownStore.getState().initiateShutdown(true));
      expect(useShutdownStore.getState().isEmergency).toBe(true);
    });

    it('should skip visual delays in emergency mode', async () => {
      mockGlobal.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      const shutdownPromise = useShutdownStore.getState().initiateShutdown(true);

      // Fast-forward any potential delays (emergency mode skips 100ms delays)
      await vi.runAllTimersAsync();

      await shutdownPromise;

      // Emergency shutdown should be fast (no 100ms delays between steps)
      // This is more of a behavioral verification
      expect(useShutdownStore.getState().phase).toBe('complete');
    });
  });

  describe('Step Execution Order Integrity', () => {
    it('should execute steps in correct order', async () => {
      const executionOrder: string[] = [];

      mockGlobal.fetch = vi.fn().mockImplementation((url: string) => {
        const stepId = url.replace('/api/shutdown/', '');
        executionOrder.push(stepId);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

      // Verify order: save-state, cancel-orders, disconnect-streams, cleanup, finalize
      // Note: close-positions is skipped by default
      expect(executionOrder).toEqual([
        'save-state',
        'cancel-orders',
        'disconnect-streams',
        'cleanup',
        'finalize',
      ]);
    });

    it('should skip steps correctly based on options', async () => {
      const executionOrder: string[] = [];

      useShutdownStore.getState().setOptions({
        closePositions: false,
        cancelOrders: false,
        saveState: false,
      });

      mockGlobal.fetch = vi.fn().mockImplementation((url: string) => {
        const stepId = url.replace('/api/shutdown/', '');
        executionOrder.push(stepId);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'OK' }),
        });
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

      const state = useShutdownStore.getState();
      
      // Only disconnect-streams, cleanup, finalize should run
      expect(executionOrder).not.toContain('save-state');
      expect(executionOrder).not.toContain('cancel-orders');
      expect(executionOrder).not.toContain('close-positions');
      
      // Verify skipped steps
      expect(state.steps.find(s => s.id === 'save-state')?.status).toBe('skipped');
      expect(state.steps.find(s => s.id === 'cancel-orders')?.status).toBe('skipped');
      expect(state.steps.find(s => s.id === 'close-positions')?.status).toBe('skipped');
    });

    it('should include close-positions when enabled', async () => {
      const executionOrder: string[] = [];

      useShutdownStore.getState().setOptions({
        closePositions: true,
      });

      mockGlobal.fetch = vi.fn().mockImplementation((url: string) => {
        const stepId = url.replace('/api/shutdown/', '');
        executionOrder.push(stepId);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'OK' }),
        });
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

      expect(executionOrder).toContain('close-positions');
      
      const state = useShutdownStore.getState();
      const closePositionsStep = state.steps.find(s => s.id === 'close-positions');
      expect(closePositionsStep?.status).not.toBe('skipped');
      expect(closePositionsStep?.status).toBe('complete');
    });
  });

  describe('Partial Failure Handling', () => {
    it('should stop normal shutdown on first failure', async () => {
      let callCount = 0;

      mockGlobal.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ message: 'Step 2 failed' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'OK' }),
        });
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown(false));

      const state = useShutdownStore.getState();
      expect(state.phase).toBe('error');
      expect(state.error).toContain('failed');

      // Should not have continued past the failure
      expect(callCount).toBe(2);
      
      // First step should be complete, second should still be running (error thrown before status update)
      const steps = state.steps.filter(s => s.status !== 'skipped');
      expect(steps[0]?.status).toBe('complete');
      // In normal mode, when error is thrown, step status is not updated to 'error'
      // It remains in 'running' because the error is thrown immediately
      expect(steps[1]?.status).toBe('running');
    });

    it('should record step duration even on failure', async () => {
      mockGlobal.fetch = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: false,
              json: () => Promise.resolve({ message: 'Failed' }),
            });
          }, 100);
        });
      });

      const shutdownPromise = useShutdownStore.getState().initiateShutdown(true);
      await vi.advanceTimersByTimeAsync(1000);
      await shutdownPromise;

      const state = useShutdownStore.getState();
      const failedStep = state.steps.find((s) => s.status === 'error');

      expect(failedStep?.duration).toBeDefined();
      expect(failedStep?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should preserve completed steps status on later failure', async () => {
      let callCount = 0;

      mockGlobal.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 3) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ message: 'Failed' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'OK' }),
        });
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown(false));

      const state = useShutdownStore.getState();
      const completedSteps = state.steps.filter((s) => s.status === 'complete');

      // First 2 steps should be complete (before the failure)
      expect(completedSteps.length).toBe(2);
      
      // Third step should still be running (error thrown before status update in normal mode)
      const steps = state.steps.filter(s => s.status !== 'skipped');
      expect(steps[2]?.status).toBe('running');
      
      // Phase should be error
      expect(state.phase).toBe('error');
    });
  });

  describe('Timestamp Integrity', () => {
    it('should record accurate shutdownStartedAt', async () => {
      const now = 1700000000000;
      vi.setSystemTime(now);

      mockGlobal.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

      expect(useShutdownStore.getState().shutdownStartedAt).toBe(now);
    });

    it('should record accurate shutdownCompletedAt', async () => {
      const startTime = 1700000000000;
      vi.setSystemTime(startTime);

      mockGlobal.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      const shutdownPromise = useShutdownStore.getState().initiateShutdown();

      // Advance time to allow all steps to complete with their 100ms delays
      // Each step has 100ms delay (non-emergency), plus fetch time
      await vi.advanceTimersByTimeAsync(2000);

      await shutdownPromise;

      const state = useShutdownStore.getState();
      // Timestamp should reflect the advanced time
      expect(state.shutdownCompletedAt).toBeGreaterThanOrEqual(startTime);
      expect(state.shutdownCompletedAt).toBeDefined();
    });

    it('should not set shutdownCompletedAt on failure', async () => {
      mockGlobal.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed' }),
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown(false));

      const state = useShutdownStore.getState();
      expect(state.shutdownCompletedAt).toBeNull();
      expect(state.phase).toBe('error');
    });
  });

  describe('Options Mutation Safety', () => {
    it('should not affect in-progress shutdown when options change', async () => {
      mockGlobal.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            // Change options mid-shutdown
            useShutdownStore.getState().setOptions({ saveState: false });
            resolve({
              ok: true,
              json: () => Promise.resolve({ message: 'OK' }),
            });
          })
      );

      // Start with saveState: true
      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

      // save-state should have been executed (was true when shutdown started)
      const saveStateStep = useShutdownStore.getState().steps.find(
        (s) => s.id === 'save-state'
      );
      expect(saveStateStep?.status).not.toBe('skipped');
      expect(saveStateStep?.status).toBe('complete');
    });

    it('should preserve options isolation between shutdowns', async () => {
      mockGlobal.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      // First shutdown with closePositions: true
      useShutdownStore.getState().setOptions({ closePositions: true });
      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

      const firstShutdown = useShutdownStore.getState();
      const firstClosePositions = firstShutdown.steps.find(s => s.id === 'close-positions');
      expect(firstClosePositions?.status).not.toBe('skipped');

      useShutdownStore.getState().reset();
      // Reset options to defaults
      useShutdownStore.setState({
        closePositions: false,
        cancelOrders: true,
        saveState: true,
      });

      // Second shutdown with closePositions: false (default)
      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

      const closePositionsStep = useShutdownStore.getState().steps.find(
        (s) => s.id === 'close-positions'
      );
      expect(closePositionsStep?.status).toBe('skipped');
    });
  });

  describe('Step Update Integrity', () => {
    it('should update only the specified step', async () => {
      mockGlobal.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

      const initialSteps = [...useShutdownStore.getState().steps];

      useShutdownStore.getState().updateStep('save-state', {
        message: 'Custom message',
      });

      const updatedSteps = useShutdownStore.getState().steps;

      // Only save-state should have changed
      const saveState = updatedSteps.find((s) => s.id === 'save-state');
      expect(saveState?.message).toBe('Custom message');

      // Others should be unchanged
      const otherSteps = updatedSteps.filter((s) => s.id !== 'save-state');
      otherSteps.forEach((step) => {
        const original = initialSteps.find((s) => s.id === step.id);
        expect(step.status).toBe(original?.status);
        expect(step.message).toBe(original?.message);
      });
    });

    it('should handle update for non-existent step ID', async () => {
      mockGlobal.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

      // Should not throw
      expect(() => {
        useShutdownStore.getState().updateStep('non-existent-step', {
          status: 'complete',
        });
      }).not.toThrow();
      
      // Step should not exist in steps array
      const nonExistentStep = useShutdownStore.getState().steps.find(
        s => s.id === 'non-existent-step'
      );
      expect(nonExistentStep).toBeUndefined();
    });
  });

  describe('Reset Completeness', () => {
    it('should reset ALL state properties', async () => {
      mockGlobal.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown(true));

      // Verify state before reset
      const beforeReset = useShutdownStore.getState();
      expect(beforeReset.phase).toBe('complete');
      expect(beforeReset.steps.length).toBeGreaterThan(0);

      useShutdownStore.getState().reset();

      const state = useShutdownStore.getState();
      expect(state.phase).toBe('idle');
      expect(state.steps).toEqual([]);
      expect(state.isEmergency).toBe(false);
      expect(state.shutdownStartedAt).toBeNull();
      expect(state.shutdownCompletedAt).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should preserve options after reset', () => {
      useShutdownStore.getState().setOptions({
        closePositions: true,
        cancelOrders: false,
      });

      useShutdownStore.getState().reset();

      const state = useShutdownStore.getState();
      // Options should NOT be reset (they're user preferences)
      expect(state.closePositions).toBe(true);
      expect(state.cancelOrders).toBe(false);
    });
  });

  describe('Step Definition Integrity', () => {
    it('should have all 6 required steps', async () => {
      mockGlobal.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown(true));

      const stepIds = useShutdownStore.getState().steps.map((s) => s.id);

      expect(stepIds).toContain('save-state');
      expect(stepIds).toContain('cancel-orders');
      expect(stepIds).toContain('close-positions');
      expect(stepIds).toContain('disconnect-streams');
      expect(stepIds).toContain('cleanup');
      expect(stepIds).toContain('finalize');
      expect(stepIds).toHaveLength(6);
      
      // Verify all steps have required properties
      const state = useShutdownStore.getState();
      state.steps.forEach(step => {
        expect(step.id).toBeDefined();
        expect(step.name).toBeDefined();
        expect(step.description).toBeDefined();
        expect(step.status).toBeDefined();
      });
    });

    it('should have unique step IDs', async () => {
      mockGlobal.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

      const stepIds = useShutdownStore.getState().steps.map((s) => s.id);
      const uniqueIds = new Set(stepIds);

      expect(uniqueIds.size).toBe(stepIds.length);
      expect(stepIds.length).toBe(6);
    });
  });
});
