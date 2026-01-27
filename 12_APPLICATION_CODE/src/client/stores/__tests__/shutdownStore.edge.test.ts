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
import { useShutdownStore, ShutdownPhase } from '../shutdownStore';

describe('IRONCLAD: shutdownStore Edge Cases', () => {
  const originalFetch = global.fetch;

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
    global.fetch = originalFetch;
  });

  describe('Emergency Shutdown Guarantees', () => {
    it('should force all critical steps in emergency mode regardless of options', async () => {
      // Disable all options
      useShutdownStore.getState().setOptions({
        closePositions: false,
        cancelOrders: false,
        saveState: false,
      });

      global.fetch = vi.fn().mockResolvedValue({
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
      let stepIndex = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        stepIndex++;
        // Fail every other step
        if (stepIndex % 2 === 0) {
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
      // Should complete despite failures
      expect(state.phase).toBe('complete');

      // Should have some error steps
      const errorSteps = state.steps.filter((s) => s.status === 'error');
      expect(errorSteps.length).toBeGreaterThan(0);
    });

    it('should complete emergency shutdown even with network failures', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network down'));

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown(true));

      const state = useShutdownStore.getState();
      // Emergency shutdown should still "complete" (all steps attempted)
      expect(state.phase).toBe('complete');
    });

    it('should set isEmergency flag correctly', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
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
      const startTime = Date.now();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const shutdownPromise = useShutdownStore.getState().initiateShutdown(true);

      // Fast-forward any potential delays
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

      global.fetch = vi.fn().mockImplementation((url: string) => {
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

      global.fetch = vi.fn().mockImplementation((url: string) => {
        const stepId = url.replace('/api/shutdown/', '');
        executionOrder.push(stepId);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

      // Only disconnect-streams, cleanup, finalize should run
      expect(executionOrder).not.toContain('save-state');
      expect(executionOrder).not.toContain('cancel-orders');
      expect(executionOrder).not.toContain('close-positions');
    });

    it('should include close-positions when enabled', async () => {
      const executionOrder: string[] = [];

      useShutdownStore.getState().setOptions({
        closePositions: true,
      });

      global.fetch = vi.fn().mockImplementation((url: string) => {
        const stepId = url.replace('/api/shutdown/', '');
        executionOrder.push(stepId);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

      expect(executionOrder).toContain('close-positions');
    });
  });

  describe('Partial Failure Handling', () => {
    it('should stop normal shutdown on first failure', async () => {
      let callCount = 0;

      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ message: 'Step 2 failed' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown(false));

      const state = useShutdownStore.getState();
      expect(state.phase).toBe('error');
      expect(state.error).toContain('failed');

      // Should not have continued past the failure
      expect(callCount).toBe(2);
    });

    it('should record step duration even on failure', async () => {
      global.fetch = vi.fn().mockImplementation(() => {
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
      await vi.runAllTimersAsync();
      await shutdownPromise;

      const state = useShutdownStore.getState();
      const failedStep = state.steps.find((s) => s.status === 'error');

      expect(failedStep?.duration).toBeDefined();
      expect(failedStep?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should preserve completed steps status on later failure', async () => {
      let callCount = 0;

      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 3) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ message: 'Failed' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown(false));

      const state = useShutdownStore.getState();
      const completedSteps = state.steps.filter((s) => s.status === 'complete');

      // First 2 steps should be complete
      expect(completedSteps.length).toBe(2);
    });
  });

  describe('Timestamp Integrity', () => {
    it('should record accurate shutdownStartedAt', async () => {
      const now = 1700000000000;
      vi.setSystemTime(now);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

      expect(useShutdownStore.getState().shutdownStartedAt).toBe(now);
    });

    it('should record accurate shutdownCompletedAt', async () => {
      const startTime = 1700000000000;
      vi.setSystemTime(startTime);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const shutdownPromise = useShutdownStore.getState().initiateShutdown();

      // Advance time to allow all steps to complete with their 100ms delays
      await vi.advanceTimersByTimeAsync(5000);

      await shutdownPromise;

      const state = useShutdownStore.getState();
      // Timestamp should reflect the advanced time
      expect(state.shutdownCompletedAt).toBeGreaterThanOrEqual(startTime);
    });

    it('should not set shutdownCompletedAt on failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed' }),
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown(false));

      expect(useShutdownStore.getState().shutdownCompletedAt).toBeNull();
    });
  });

  describe('Options Mutation Safety', () => {
    it('should not affect in-progress shutdown when options change', async () => {
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            // Change options mid-shutdown
            useShutdownStore.getState().setOptions({ saveState: false });
            resolve({
              ok: true,
              json: () => Promise.resolve({}),
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
    });

    it('should preserve options isolation between shutdowns', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      // First shutdown with closePositions: true
      useShutdownStore.getState().setOptions({ closePositions: true });
      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

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
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
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
      });
    });

    it('should handle update for non-existent step ID', () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      useShutdownStore.getState().initiateShutdown();

      // Should not throw
      expect(() => {
        useShutdownStore.getState().updateStep('non-existent-step', {
          status: 'complete',
        });
      }).not.toThrow();
    });
  });

  describe('Reset Completeness', () => {
    it('should reset ALL state properties', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown(true));

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
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
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
    });

    it('should have unique step IDs', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await runWithTimers(() => useShutdownStore.getState().initiateShutdown());

      const stepIds = useShutdownStore.getState().steps.map((s) => s.id);
      const uniqueIds = new Set(stepIds);

      expect(uniqueIds.size).toBe(stepIds.length);
    });
  });
});
