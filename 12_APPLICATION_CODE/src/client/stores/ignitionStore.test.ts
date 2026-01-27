import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useIgnitionStore } from './ignitionStore';

describe('ignitionStore', () => {
  beforeEach(() => {
    useIgnitionStore.getState().reset();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useIgnitionStore.getState();

      expect(state.selectedBackend).toBeNull();
      expect(state.phase).toBe('idle');
      expect(state.ignitionStartedAt).toBeNull();
      expect(state.ignitionError).toBeNull();
      expect(state.isArmed).toBe(false);
      expect(state.armKeyEntered).toBe(false);
      expect(state.liveConfirmed).toBe(false);
    });

    it('should have two backend configurations', () => {
      const state = useIgnitionStore.getState();

      expect(state.backendConfigs).toHaveLength(2);
      expect(state.backendConfigs.map((c) => c.type)).toContain('paper');
      expect(state.backendConfigs.map((c) => c.type)).toContain('live');
    });

    it('should require confirmation only for live trading', () => {
      const state = useIgnitionStore.getState();

      const paperConfig = state.backendConfigs.find((c) => c.type === 'paper');
      const liveConfig = state.backendConfigs.find((c) => c.type === 'live');

      expect(paperConfig?.requiresConfirmation).toBe(false);
      expect(liveConfig?.requiresConfirmation).toBe(true);
    });
  });

  describe('selectBackend', () => {
    it('should set selected backend and transition to selecting phase', () => {
      useIgnitionStore.getState().selectBackend('paper');

      const state = useIgnitionStore.getState();
      expect(state.selectedBackend).toBe('paper');
      expect(state.phase).toBe('selecting');
    });

    it('should reset safety flags when selecting backend', () => {
      useIgnitionStore.setState({
        isArmed: true,
        armKeyEntered: true,
        liveConfirmed: true,
      });

      useIgnitionStore.getState().selectBackend('live');

      const state = useIgnitionStore.getState();
      expect(state.isArmed).toBe(false);
      expect(state.armKeyEntered).toBe(false);
      expect(state.liveConfirmed).toBe(false);
    });

    it('should clear any existing error', () => {
      useIgnitionStore.setState({ ignitionError: 'Previous error' });
      useIgnitionStore.getState().selectBackend('paper');

      expect(useIgnitionStore.getState().ignitionError).toBeNull();
    });
  });

  describe('armSystem', () => {
    it('should arm system for paper trading without confirmation', () => {
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();

      const state = useIgnitionStore.getState();
      expect(state.isArmed).toBe(true);
      expect(state.armKeyEntered).toBe(true);
      expect(state.phase).toBe('armed');
    });

    it('should require live confirmation for live trading', () => {
      useIgnitionStore.getState().selectBackend('live');
      useIgnitionStore.getState().armSystem();

      const state = useIgnitionStore.getState();
      expect(state.isArmed).toBe(false);
      expect(state.ignitionError).toContain('Live trading requires');
    });

    it('should arm for live trading after confirmation', () => {
      useIgnitionStore.getState().selectBackend('live');
      useIgnitionStore.getState().confirmLive();
      useIgnitionStore.getState().armSystem();

      const state = useIgnitionStore.getState();
      expect(state.isArmed).toBe(true);
      expect(state.phase).toBe('armed');
    });
  });

  describe('disarmSystem', () => {
    it('should disarm and return to selecting phase if backend selected', () => {
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();
      useIgnitionStore.getState().disarmSystem();

      const state = useIgnitionStore.getState();
      expect(state.isArmed).toBe(false);
      expect(state.armKeyEntered).toBe(false);
      expect(state.phase).toBe('selecting');
    });

    it('should return to idle if no backend selected', () => {
      useIgnitionStore.setState({ isArmed: true, selectedBackend: null });
      useIgnitionStore.getState().disarmSystem();

      expect(useIgnitionStore.getState().phase).toBe('idle');
    });
  });

  describe('confirmLive', () => {
    it('should set liveConfirmed flag', () => {
      useIgnitionStore.getState().confirmLive();

      expect(useIgnitionStore.getState().liveConfirmed).toBe(true);
    });
  });

  describe('ignite', () => {
    it('should fail if not armed', async () => {
      useIgnitionStore.getState().selectBackend('paper');

      await useIgnitionStore.getState().ignite();

      expect(useIgnitionStore.getState().ignitionError).toContain('must be armed');
    });

    it('should fail if no backend selected', async () => {
      await useIgnitionStore.getState().ignite();

      expect(useIgnitionStore.getState().ignitionError).toContain('must be armed');
    });

    it('should transition to igniting phase on start', async () => {
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const ignitePromise = useIgnitionStore.getState().ignite();

      // Check immediate state
      expect(useIgnitionStore.getState().phase).toBe('igniting');
      expect(useIgnitionStore.getState().ignitionStartedAt).not.toBeNull();

      await ignitePromise;
    });

    it('should transition to running phase on success', async () => {
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await useIgnitionStore.getState().ignite();

      expect(useIgnitionStore.getState().phase).toBe('running');
    });

    it('should transition to error phase on failure', async () => {
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Engine failure' }),
      });

      await useIgnitionStore.getState().ignite();

      const state = useIgnitionStore.getState();
      expect(state.phase).toBe('error');
      expect(state.ignitionError).toBe('Engine failure');
    });

    it('should handle network errors', async () => {
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();

      global.fetch = vi.fn().mockRejectedValue(new Error('Network down'));

      await useIgnitionStore.getState().ignite();

      const state = useIgnitionStore.getState();
      expect(state.phase).toBe('error');
      expect(state.ignitionError).toBe('Network down');
    });

    it('should send correct payload to backend', async () => {
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await useIgnitionStore.getState().ignite();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ignition/start',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"backend":"paper"'),
        })
      );
    });
  });

  describe('abort', () => {
    it('should reset to idle when not running', async () => {
      useIgnitionStore.getState().selectBackend('paper');
      useIgnitionStore.getState().armSystem();

      await useIgnitionStore.getState().abort();

      const state = useIgnitionStore.getState();
      expect(state.phase).toBe('idle');
      expect(state.isArmed).toBe(false);
      expect(state.selectedBackend).toBeNull();
    });

    it('should call abort API when running', async () => {
      useIgnitionStore.setState({ phase: 'running' });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await useIgnitionStore.getState().abort();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ignition/abort',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should reset state after successful abort', async () => {
      useIgnitionStore.setState({
        phase: 'running',
        isArmed: true,
        ignitionStartedAt: Date.now(),
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await useIgnitionStore.getState().abort();

      const state = useIgnitionStore.getState();
      expect(state.phase).toBe('idle');
      expect(state.isArmed).toBe(false);
      expect(state.ignitionStartedAt).toBeNull();
    });

    it('should set error on abort failure', async () => {
      useIgnitionStore.setState({ phase: 'running' });

      global.fetch = vi.fn().mockRejectedValue(new Error('Abort failed'));

      await useIgnitionStore.getState().abort();

      expect(useIgnitionStore.getState().ignitionError).toBe('Abort failed');
    });
  });

  describe('setPhase', () => {
    it('should set phase directly', () => {
      useIgnitionStore.getState().setPhase('arming');
      expect(useIgnitionStore.getState().phase).toBe('arming');
    });
  });

  describe('setError', () => {
    it('should set error and transition to error phase', () => {
      useIgnitionStore.getState().setError('Critical failure');

      const state = useIgnitionStore.getState();
      expect(state.ignitionError).toBe('Critical failure');
      expect(state.phase).toBe('error');
    });

    it('should clear error when null passed', () => {
      useIgnitionStore.setState({
        ignitionError: 'Previous error',
        phase: 'error',
      });

      useIgnitionStore.getState().setError(null);

      expect(useIgnitionStore.getState().ignitionError).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      useIgnitionStore.setState({
        selectedBackend: 'live',
        phase: 'running',
        ignitionStartedAt: Date.now(),
        ignitionError: 'Some error',
        isArmed: true,
        armKeyEntered: true,
        liveConfirmed: true,
      });

      useIgnitionStore.getState().reset();

      const state = useIgnitionStore.getState();
      expect(state.selectedBackend).toBeNull();
      expect(state.phase).toBe('idle');
      expect(state.ignitionStartedAt).toBeNull();
      expect(state.ignitionError).toBeNull();
      expect(state.isArmed).toBe(false);
      expect(state.armKeyEntered).toBe(false);
      expect(state.liveConfirmed).toBe(false);
    });
  });
});
