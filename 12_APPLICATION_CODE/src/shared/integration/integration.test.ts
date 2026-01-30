/**
 * Dark Integration Module Tests
 * 
 * SILO 7: Tests verifying all integration is OFF by default
 */

import { describe, it, expect } from 'vitest';
import {
  // Core flags
  DARK_MODE,
  INTEGRATION_FLAGS,
} from './index';

import {
  // Adapters
  createDarkAdapter,
  isAdapterEnabled,
} from './adapters';

import {
  // Hooks
  useIntegrationStatus,
  useDarkModeGuard,
  createDisabledHook,
  createGuardedHook,
} from './hooks';

import {
  // Fetchers
  createNullFetcher,
  createNullFetchers,
} from './fetchers';

import {
  // Guards
  isIntegrationEnabled,
  assertDarkMode,
  guardedExecution,
  guardedSync,
  websocketGuard,
  sseGuard,
  getIntegrationStatus,
} from './guards';

// ============================================================================
// SILO 7: DARK MODE VERIFICATION
// ============================================================================

describe('SILO 7: Dark Integration Scaffolding', () => {
  describe('DARK_MODE flag', () => {
    it('DARK_MODE is true', () => {
      expect(DARK_MODE).toBe(true);
    });

    it('DARK_MODE is const (cannot be changed)', () => {
      // TypeScript enforces this at compile time
      // This test documents the expectation
      expect(DARK_MODE).toBe(true);
    });
  });

  describe('INTEGRATION_FLAGS', () => {
    it('all flags are false', () => {
      expect(INTEGRATION_FLAGS.HEALTH_POLLING_ENABLED).toBe(false);
      expect(INTEGRATION_FLAGS.TELEMETRY_ENABLED).toBe(false);
      expect(INTEGRATION_FLAGS.SIGNALS_ENABLED).toBe(false);
      expect(INTEGRATION_FLAGS.NARRATIVES_ENABLED).toBe(false);
    });

    it('WebSocket is NEVER enabled', () => {
      expect(INTEGRATION_FLAGS.WEBSOCKET_ENABLED).toBe(false);
    });

    it('SSE is NEVER enabled', () => {
      expect(INTEGRATION_FLAGS.SSE_ENABLED).toBe(false);
    });
  });
});

// ============================================================================
// SILO 7: ADAPTER TESTS
// ============================================================================

describe('SILO 7: Dark Adapters', () => {
  describe('createDarkAdapter', () => {
    it('returns disabled adapter', () => {
      const adapter = createDarkAdapter();
      expect(adapter.isEnabled()).toBe(false);
      expect(adapter.getStatus()).toBe('disabled');
    });

    it('healthCheck returns unhealthy', async () => {
      const adapter = createDarkAdapter();
      const result = await adapter.healthCheck();
      expect(result.healthy).toBe(false);
    });

    it('initialize is no-op', async () => {
      const adapter = createDarkAdapter();
      await expect(adapter.initialize()).resolves.toBeUndefined();
    });

    it('shutdown is no-op', async () => {
      const adapter = createDarkAdapter();
      await expect(adapter.shutdown()).resolves.toBeUndefined();
    });
  });

  describe('isAdapterEnabled', () => {
    it('returns false when DARK_MODE is true', () => {
      expect(isAdapterEnabled()).toBe(false);
    });
  });
});

// ============================================================================
// SILO 7: HOOK TESTS
// ============================================================================

describe('SILO 7: Integration Hooks', () => {
  describe('useIntegrationStatus', () => {
    it('returns disabled status', () => {
      const status = useIntegrationStatus();
      expect(status.status).toBe('disabled');
      expect(status.darkMode).toBe(true);
    });

    it('all features are disabled', () => {
      const status = useIntegrationStatus();
      expect(status.features.healthPolling).toBe(false);
      expect(status.features.telemetry).toBe(false);
      expect(status.features.signals).toBe(false);
      expect(status.features.narratives).toBe(false);
    });
  });

  describe('useDarkModeGuard', () => {
    it('does not throw when DARK_MODE is true', () => {
      expect(() => useDarkModeGuard()).not.toThrow();
    });
  });

  describe('createDisabledHook', () => {
    it('returns hook with disabled state', () => {
      const useDisabled = createDisabledHook<string>();
      const result = useDisabled();
      expect(result.data).toBeNull();
      expect(result.isEnabled).toBe(false);
      expect(result.isLoading).toBe(false);
    });

    it('refresh is no-op', () => {
      const useDisabled = createDisabledHook<string>();
      const result = useDisabled();
      expect(() => result.refresh()).not.toThrow();
    });
  });

  describe('createGuardedHook', () => {
    it('returns disabled hook when DARK_MODE is true', () => {
      const enabledHook = () => ({
        data: 'should not see this',
        isLoading: false,
        error: null,
        isEnabled: true,
        refresh: () => {},
      });
      
      const useGuarded = createGuardedHook(enabledHook);
      const result = useGuarded();
      
      expect(result.data).toBeNull();
      expect(result.isEnabled).toBe(false);
    });
  });
});

// ============================================================================
// SILO 7: FETCHER TESTS
// ============================================================================

describe('SILO 7: Null Fetchers', () => {
  describe('createNullFetcher', () => {
    it('creates disabled telemetry fetcher', async () => {
      const fetcher = createNullFetcher('telemetry');
      expect(fetcher.isEnabled()).toBe(false);
      const result = await fetcher.fetch();
      expect(result).toBeNull();
    });

    it('creates disabled signal fetcher', async () => {
      const fetcher = createNullFetcher('signal');
      expect(fetcher.isEnabled()).toBe(false);
      const result = await fetcher.fetchRecent();
      expect(result).toEqual([]);
    });

    it('creates disabled narrative fetcher', async () => {
      const fetcher = createNullFetcher('narrative');
      expect(fetcher.isEnabled()).toBe(false);
      const result = await fetcher.fetchForChart('any');
      expect(result).toBeNull();
    });
  });

  describe('createNullFetchers', () => {
    it('returns all disabled fetchers', () => {
      const fetchers = createNullFetchers();
      expect(fetchers.telemetry.isEnabled()).toBe(false);
      expect(fetchers.signal.isEnabled()).toBe(false);
      expect(fetchers.narrative.isEnabled()).toBe(false);
    });
  });
});

// ============================================================================
// SILO 7: GUARD TESTS
// ============================================================================

describe('SILO 7: Integration Guards', () => {
  describe('isIntegrationEnabled', () => {
    it('returns false when DARK_MODE is true', () => {
      expect(isIntegrationEnabled()).toBe(false);
    });
  });

  describe('assertDarkMode', () => {
    it('does not throw when DARK_MODE is true', () => {
      expect(() => assertDarkMode()).not.toThrow();
    });
  });

  describe('guardedExecution', () => {
    it('returns fallback when DARK_MODE is true', async () => {
      const guardedFn = guardedExecution(
        async () => 'should not see this',
        'fallback'
      );
      const result = await guardedFn();
      expect(result).toBe('fallback');
    });
  });

  describe('guardedSync', () => {
    it('returns fallback when DARK_MODE is true', () => {
      const guardedFn = guardedSync(
        () => 'should not see this',
        'fallback'
      );
      const result = guardedFn();
      expect(result).toBe('fallback');
    });
  });

  describe('websocketGuard', () => {
    it('ALWAYS returns false', () => {
      expect(websocketGuard()).toBe(false);
    });
  });

  describe('sseGuard', () => {
    it('ALWAYS returns false', () => {
      expect(sseGuard()).toBe(false);
    });
  });

  describe('getIntegrationStatus', () => {
    it('returns disabled status', () => {
      const status = getIntegrationStatus();
      expect(status.darkMode).toBe(true);
      expect(status.integrationEnabled).toBe(false);
      expect(status.message).toContain('disabled');
    });
  });
});

// ============================================================================
// SILO 7: CONSTRAINT VERIFICATION
// ============================================================================

describe('SILO 7: Constraint Verification', () => {
  it('no WebSocket code can activate', () => {
    // WebSocket guard always returns false
    expect(websocketGuard()).toBe(false);
    expect(INTEGRATION_FLAGS.WEBSOCKET_ENABLED).toBe(false);
  });

  it('no SSE code can activate', () => {
    // SSE guard always returns false
    expect(sseGuard()).toBe(false);
    expect(INTEGRATION_FLAGS.SSE_ENABLED).toBe(false);
  });

  it('no lifecycle commands exist', () => {
    const adapter = createDarkAdapter();
    // Verify adapter has no start/stop commands for engine
    // (only has initialize/shutdown for adapter itself)
    expect(typeof (adapter as never)['startEngine']).toBe('undefined');
    expect(typeof (adapter as never)['stopEngine']).toBe('undefined');
    expect(typeof (adapter as never)['restartEngine']).toBe('undefined');
  });

  it('all fetchers return empty/null', async () => {
    const fetchers = createNullFetchers();
    expect(await fetchers.telemetry.fetch()).toBeNull();
    expect(await fetchers.signal.fetchRecent()).toEqual([]);
    expect(await fetchers.narrative.fetchForChart('x')).toBeNull();
  });

  it('integration status reports disabled', () => {
    const status = getIntegrationStatus();
    expect(status.integrationEnabled).toBe(false);
  });
});
