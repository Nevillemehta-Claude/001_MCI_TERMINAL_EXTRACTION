import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useShutdownStore } from './shutdownStore';

describe('shutdownStore', () => {
  beforeEach(() => {
    useShutdownStore.getState().reset();
    // Reset options to defaults (reset() preserves user preferences)
    useShutdownStore.setState({
      closePositions: false,
      cancelOrders: true,
      saveState: true,
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useShutdownStore.getState();

      expect(state.phase).toBe('idle');
      expect(state.steps).toEqual([]);
      expect(state.isEmergency).toBe(false);
      expect(state.shutdownStartedAt).toBeNull();
      expect(state.shutdownCompletedAt).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should have default options set', () => {
      const state = useShutdownStore.getState();

      expect(state.closePositions).toBe(false);
      expect(state.cancelOrders).toBe(true);
      expect(state.saveState).toBe(true);
    });
  });

  describe('setOptions', () => {
    it('should update closePositions option', () => {
      useShutdownStore.getState().setOptions({ closePositions: true });
      expect(useShutdownStore.getState().closePositions).toBe(true);
    });

    it('should update cancelOrders option', () => {
      useShutdownStore.getState().setOptions({ cancelOrders: false });
      expect(useShutdownStore.getState().cancelOrders).toBe(false);
    });

    it('should update saveState option', () => {
      useShutdownStore.getState().setOptions({ saveState: false });
      expect(useShutdownStore.getState().saveState).toBe(false);
    });

    it('should update multiple options at once', () => {
      useShutdownStore.getState().setOptions({
        closePositions: true,
        cancelOrders: false,
        saveState: false,
      });

      const state = useShutdownStore.getState();
      expect(state.closePositions).toBe(true);
      expect(state.cancelOrders).toBe(false);
      expect(state.saveState).toBe(false);
    });
  });

  describe('updateStep', () => {
    it('should update a specific step', async () => {
      // Initialize shutdown to get steps
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      const shutdownPromise = useShutdownStore.getState().initiateShutdown();

      // Wait a bit for steps to be initialized
      await new Promise((r) => setTimeout(r, 10));

      useShutdownStore.getState().updateStep('save-state', {
        status: 'complete',
        message: 'State saved',
        duration: 150,
      });

      const step = useShutdownStore.getState().steps.find((s) => s.id === 'save-state');
      expect(step?.status).toBe('complete');
      expect(step?.message).toBe('State saved');

      await shutdownPromise;
    });
  });

  describe('reset', () => {
    it('should reset all shutdown state', () => {
      useShutdownStore.setState({
        phase: 'complete',
        steps: [{ id: '1', name: 'Test', description: '', status: 'complete' }],
        isEmergency: true,
        shutdownStartedAt: Date.now(),
        shutdownCompletedAt: Date.now(),
        error: 'Some error',
      });

      useShutdownStore.getState().reset();

      const state = useShutdownStore.getState();
      expect(state.phase).toBe('idle');
      expect(state.steps).toEqual([]);
      expect(state.isEmergency).toBe(false);
      expect(state.shutdownStartedAt).toBeNull();
      expect(state.shutdownCompletedAt).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('initiateShutdown', () => {
    it('should initialize 6 shutdown steps', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      const promise = useShutdownStore.getState().initiateShutdown();

      // Check immediately after initiating
      expect(useShutdownStore.getState().phase).toBe('initiating');
      expect(useShutdownStore.getState().shutdownStartedAt).not.toBeNull();

      await promise;

      expect(useShutdownStore.getState().steps).toHaveLength(6);
    });

    it('should skip close-positions step when option is false', async () => {
      useShutdownStore.getState().setOptions({ closePositions: false });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      await useShutdownStore.getState().initiateShutdown();

      const closePositionsStep = useShutdownStore.getState().steps.find(
        (s) => s.id === 'close-positions'
      );
      expect(closePositionsStep?.status).toBe('skipped');
    });

    it('should skip cancel-orders step when option is false', async () => {
      useShutdownStore.getState().setOptions({ cancelOrders: false });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      await useShutdownStore.getState().initiateShutdown();

      const cancelOrdersStep = useShutdownStore.getState().steps.find(
        (s) => s.id === 'cancel-orders'
      );
      expect(cancelOrdersStep?.status).toBe('skipped');
    });

    it('should skip save-state step when option is false', async () => {
      useShutdownStore.getState().setOptions({ saveState: false });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      await useShutdownStore.getState().initiateShutdown();

      const saveStateStep = useShutdownStore.getState().steps.find(
        (s) => s.id === 'save-state'
      );
      expect(saveStateStep?.status).toBe('skipped');
    });

    it('should force all steps in emergency mode', async () => {
      useShutdownStore.getState().setOptions({
        closePositions: false,
        cancelOrders: false,
        saveState: false,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      await useShutdownStore.getState().initiateShutdown(true);

      const state = useShutdownStore.getState();
      expect(state.isEmergency).toBe(true);

      // In emergency mode, close-positions and cancel-orders should run
      const closePositions = state.steps.find((s) => s.id === 'close-positions');
      const cancelOrders = state.steps.find((s) => s.id === 'cancel-orders');

      // They shouldn't be skipped in emergency
      expect(closePositions?.status).not.toBe('skipped');
      expect(cancelOrders?.status).not.toBe('skipped');
    });

    it('should complete successfully when all API calls succeed', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Step completed' }),
      });

      await useShutdownStore.getState().initiateShutdown();

      const state = useShutdownStore.getState();
      expect(state.phase).toBe('complete');
      expect(state.shutdownCompletedAt).not.toBeNull();
      expect(state.error).toBeNull();
    });

    it('should set error phase on API failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Step failed' }),
      });

      await useShutdownStore.getState().initiateShutdown();

      const state = useShutdownStore.getState();
      expect(state.phase).toBe('error');
      expect(state.error).not.toBeNull();
    });

    it('should continue on error in emergency mode', async () => {
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
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

      await useShutdownStore.getState().initiateShutdown(true);

      // Should complete despite one step failing
      expect(useShutdownStore.getState().phase).toBe('complete');

      // Should have one step with error status
      const errorSteps = useShutdownStore.getState().steps.filter(
        (s) => s.status === 'error'
      );
      expect(errorSteps.length).toBeGreaterThan(0);
    });

    it('should track step durations', async () => {
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ message: 'OK' }),
                }),
              10
            )
          )
      );

      await useShutdownStore.getState().initiateShutdown();

      const completedSteps = useShutdownStore.getState().steps.filter(
        (s) => s.status === 'complete'
      );

      completedSteps.forEach((step) => {
        expect(step.duration).toBeGreaterThanOrEqual(0);
      });
    });

    it('should call correct API endpoints for each step', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'OK' }),
      });

      await useShutdownStore.getState().initiateShutdown();

      // Check that API was called for non-skipped steps
      const expectedEndpoints = [
        '/api/shutdown/save-state',
        '/api/shutdown/cancel-orders',
        '/api/shutdown/disconnect-streams',
        '/api/shutdown/cleanup',
        '/api/shutdown/finalize',
      ];

      expectedEndpoints.forEach((endpoint) => {
        expect(global.fetch).toHaveBeenCalledWith(
          endpoint,
          expect.objectContaining({ method: 'POST' })
        );
      });
    });
  });

  describe('step definitions', () => {
    it('should have unique step IDs', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await useShutdownStore.getState().initiateShutdown();

      const ids = useShutdownStore.getState().steps.map((s) => s.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have descriptive names and descriptions', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await useShutdownStore.getState().initiateShutdown();

      useShutdownStore.getState().steps.forEach((step) => {
        expect(step.name.length).toBeGreaterThan(3);
        expect(step.description.length).toBeGreaterThan(5);
      });
    });
  });
});
