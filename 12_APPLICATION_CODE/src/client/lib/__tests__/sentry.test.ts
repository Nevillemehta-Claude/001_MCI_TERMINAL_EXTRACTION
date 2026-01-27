import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Sentry from '@sentry/react';

// Mock @sentry/react
vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  setTag: vi.fn(),
  setContext: vi.fn(),
  setUser: vi.fn(),
  withScope: vi.fn((callback) => {
    const mockScope = {
      setTag: vi.fn(),
      setContext: vi.fn(),
    };
    callback(mockScope);
    return mockScope;
  }),
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
  startSpan: vi.fn((_, callback) => callback()),
  browserTracingIntegration: vi.fn(() => ({ name: 'BrowserTracing' })),
  replayIntegration: vi.fn(() => ({ name: 'Replay' })),
}));

// Mock import.meta.env
const mockEnv = {
  DEV: false,
  PROD: true,
  VITE_SENTRY_DSN: undefined as string | undefined,
  VITE_APP_VERSION: undefined as string | undefined,
  VITE_SENTRY_DEBUG: undefined as string | undefined,
};

vi.stubGlobal('import', {
  meta: {
    env: mockEnv,
  },
});

describe('Sentry configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env vars
    mockEnv.DEV = false;
    mockEnv.PROD = true;
    mockEnv.VITE_SENTRY_DSN = undefined;
    mockEnv.VITE_APP_VERSION = undefined;
    mockEnv.VITE_SENTRY_DEBUG = undefined;
  });

  describe('initSentry', () => {
    it('should call Sentry.init with correct configuration', async () => {
      // Re-import to get fresh module
      vi.resetModules();
      const { initSentry } = await import('../sentry');

      initSentry();

      expect(Sentry.init).toHaveBeenCalled();
    });

    it('should use default DSN when env var not set', async () => {
      vi.resetModules();
      const { initSentry } = await import('../sentry');

      initSentry();

      const initCall = vi.mocked(Sentry.init).mock.calls[0]?.[0];
      expect(initCall?.dsn).toContain('sentry.io');
    });

    it('should configure browser tracing integration', async () => {
      vi.resetModules();
      const { initSentry } = await import('../sentry');

      initSentry();

      expect(Sentry.browserTracingIntegration).toHaveBeenCalled();
    });

    it('should configure replay integration', async () => {
      vi.resetModules();
      const { initSentry } = await import('../sentry');

      initSentry();

      expect(Sentry.replayIntegration).toHaveBeenCalledWith({
        maskAllText: true,
        blockAllMedia: true,
      });
    });
  });

  describe('setTradingMode', () => {
    it('should set trading mode tag', async () => {
      vi.resetModules();
      const { setTradingMode } = await import('../sentry');

      setTradingMode('paper');

      expect(Sentry.setTag).toHaveBeenCalledWith('trading.mode', 'paper');
    });

    it('should set trading context', async () => {
      vi.resetModules();
      const { setTradingMode } = await import('../sentry');

      setTradingMode('live');

      expect(Sentry.setContext).toHaveBeenCalledWith('trading', expect.objectContaining({
        mode: 'live',
        timestamp: expect.any(String),
      }));
    });

    it('should accept unknown mode', async () => {
      vi.resetModules();
      const { setTradingMode } = await import('../sentry');

      setTradingMode('unknown');

      expect(Sentry.setTag).toHaveBeenCalledWith('trading.mode', 'unknown');
    });
  });

  describe('setUserContext', () => {
    it('should set user with account ID', async () => {
      vi.resetModules();
      const { setUserContext } = await import('../sentry');

      setUserContext('account-123', 'active');

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'account-123',
      });
    });

    it('should set account context', async () => {
      vi.resetModules();
      const { setUserContext } = await import('../sentry');

      setUserContext('account-456', 'pending');

      expect(Sentry.setContext).toHaveBeenCalledWith('account', expect.objectContaining({
        status: 'pending',
        authenticatedAt: expect.any(String),
      }));
    });
  });

  describe('clearUserContext', () => {
    it('should clear user context', async () => {
      vi.resetModules();
      const { clearUserContext } = await import('../sentry');

      clearUserContext();

      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe('captureTradeError', () => {
    it('should capture error with scope', async () => {
      vi.resetModules();
      const { captureTradeError } = await import('../sentry');

      const testError = new Error('Test error');
      captureTradeError(testError, { action: 'ignition' });

      expect(Sentry.withScope).toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalledWith(testError);
    });

    it('should set action tag in scope', async () => {
      vi.resetModules();
      const { captureTradeError } = await import('../sentry');

      let capturedScope: { setTag: ReturnType<typeof vi.fn> } | null = null;
      vi.mocked(Sentry.withScope).mockImplementation((callback) => {
        capturedScope = {
          setTag: vi.fn(),
          setContext: vi.fn(),
        };
        callback(capturedScope as unknown as Sentry.Scope);
      });

      const testError = new Error('Test error');
      captureTradeError(testError, { action: 'shutdown' });

      expect(capturedScope?.setTag).toHaveBeenCalledWith('trade.action', 'shutdown');
    });

    it('should set phase tag when provided', async () => {
      vi.resetModules();
      const { captureTradeError } = await import('../sentry');

      let capturedScope: { setTag: ReturnType<typeof vi.fn> } | null = null;
      vi.mocked(Sentry.withScope).mockImplementation((callback) => {
        capturedScope = {
          setTag: vi.fn(),
          setContext: vi.fn(),
        };
        callback(capturedScope as unknown as Sentry.Scope);
      });

      const testError = new Error('Test error');
      captureTradeError(testError, { action: 'order', phase: 'running' });

      expect(capturedScope?.setTag).toHaveBeenCalledWith('trade.phase', 'running');
    });

    it('should set backend tag when provided', async () => {
      vi.resetModules();
      const { captureTradeError } = await import('../sentry');

      let capturedScope: { setTag: ReturnType<typeof vi.fn> } | null = null;
      vi.mocked(Sentry.withScope).mockImplementation((callback) => {
        capturedScope = {
          setTag: vi.fn(),
          setContext: vi.fn(),
        };
        callback(capturedScope as unknown as Sentry.Scope);
      });

      const testError = new Error('Test error');
      captureTradeError(testError, { action: 'scan', backend: 'paper' });

      expect(capturedScope?.setTag).toHaveBeenCalledWith('trade.backend', 'paper');
    });

    it('should set trade details context when provided', async () => {
      vi.resetModules();
      const { captureTradeError } = await import('../sentry');

      let capturedScope: { setTag: ReturnType<typeof vi.fn>; setContext: ReturnType<typeof vi.fn> } | null = null;
      vi.mocked(Sentry.withScope).mockImplementation((callback) => {
        capturedScope = {
          setTag: vi.fn(),
          setContext: vi.fn(),
        };
        callback(capturedScope as unknown as Sentry.Scope);
      });

      const testError = new Error('Test error');
      const details = { orderId: '123', symbol: 'AAPL' };
      captureTradeError(testError, { action: 'order', details });

      expect(capturedScope?.setContext).toHaveBeenCalledWith('trade_details', details);
    });
  });

  describe('logTradingBreadcrumb', () => {
    it('should add breadcrumb with message and category', async () => {
      vi.resetModules();
      const { logTradingBreadcrumb } = await import('../sentry');

      logTradingBreadcrumb('System initialized', 'ignition');

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(expect.objectContaining({
        message: 'System initialized',
        category: 'trading.ignition',
      }));
    });

    it('should include data when provided', async () => {
      vi.resetModules();
      const { logTradingBreadcrumb } = await import('../sentry');

      logTradingBreadcrumb('Order placed', 'telemetry', { orderId: 'abc123' });

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(expect.objectContaining({
        data: { orderId: 'abc123' },
      }));
    });

    it('should default to info level', async () => {
      vi.resetModules();
      const { logTradingBreadcrumb } = await import('../sentry');

      logTradingBreadcrumb('Test message', 'auth');

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(expect.objectContaining({
        level: 'info',
      }));
    });

    it('should accept custom severity level', async () => {
      vi.resetModules();
      const { logTradingBreadcrumb } = await import('../sentry');

      logTradingBreadcrumb('Error occurred', 'shutdown', undefined, 'error');

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(expect.objectContaining({
        level: 'error',
      }));
    });

    it('should include timestamp', async () => {
      vi.resetModules();
      const { logTradingBreadcrumb } = await import('../sentry');

      logTradingBreadcrumb('Test', 'scan');

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(expect.objectContaining({
        timestamp: expect.any(Number),
      }));
    });
  });

  describe('startTransaction', () => {
    it('should start a span with name and operation', async () => {
      vi.resetModules();
      const { startTransaction } = await import('../sentry');

      startTransaction('ignition-sequence', 'trading');

      expect(Sentry.startSpan).toHaveBeenCalledWith(
        { name: 'ignition-sequence', op: 'trading' },
        expect.any(Function)
      );
    });
  });

  describe('Sentry export', () => {
    it('should export Sentry module', async () => {
      vi.resetModules();
      const { Sentry: exportedSentry } = await import('../sentry');

      expect(exportedSentry).toBeDefined();
      expect(exportedSentry.init).toBeDefined();
    });
  });
});
