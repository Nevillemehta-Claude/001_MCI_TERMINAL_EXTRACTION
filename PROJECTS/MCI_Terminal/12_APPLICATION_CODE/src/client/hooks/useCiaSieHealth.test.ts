/**
 * CIA-SIE-PURE Health Hook Tests
 * 
 * MINIMAL INTEGRATION: Health visibility ONLY.
 * Tests verify the hook provides correct connection status without
 * any lifecycle coupling or prohibited functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCiaSieHealth } from './useCiaSieHealth';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useCiaSieHealth - Minimal Integration Health Visibility', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Connection Status', () => {
    it('returns UNKNOWN initially before first check', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const { result } = renderHook(() => useCiaSieHealth({ enabled: false }));
      
      expect(result.current.status).toBe('UNKNOWN');
      expect(result.current.isConnected).toBe(false);
      expect(result.current.lastCheckAt).toBe(null);
    });

    it('returns CONNECTED when health endpoint responds OK', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const { result } = renderHook(() => useCiaSieHealth({ pollInterval: 60000 }));

      await waitFor(() => {
        expect(result.current.status).toBe('CONNECTED');
      }, { timeout: 5000 });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.latencyMs).toBeGreaterThanOrEqual(0);
      expect(result.current.lastError).toBe(null);
    });

    it('returns DISCONNECTED when health endpoint fails', async () => {
      mockFetch.mockRejectedValue(new Error('Failed to fetch'));

      const { result } = renderHook(() => useCiaSieHealth({ pollInterval: 60000 }));

      await waitFor(() => {
        expect(result.current.status).toBe('DISCONNECTED');
      }, { timeout: 5000 });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.lastError).toBeTruthy();
    });

    it('returns DISCONNECTED when health endpoint returns non-OK status', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 503 });

      const { result } = renderHook(() => useCiaSieHealth({ pollInterval: 60000 }));

      await waitFor(() => {
        expect(result.current.status).toBe('DISCONNECTED');
      }, { timeout: 5000 });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.lastError).toContain('503');
    });
  });

  describe('Polling Behavior', () => {
    it('does not poll when disabled', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      renderHook(() => useCiaSieHealth({ enabled: false }));

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('stops polling on unmount', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const { unmount } = renderHook(() => useCiaSieHealth({ pollInterval: 60000 }));

      // Wait for initial check
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const callsBeforeUnmount = mockFetch.mock.calls.length;
      unmount();

      // Wait to ensure no more calls
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockFetch.mock.calls.length).toBe(callsBeforeUnmount);
    });
  });

  describe('Manual Check', () => {
    it('provides checkNow function for manual refresh', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const { result } = renderHook(() => useCiaSieHealth({ enabled: false }));

      expect(result.current.isConnected).toBe(false);

      await act(async () => {
        await result.current.checkNow();
      });

      expect(result.current.isConnected).toBe(true);
    });
  });

  describe('Request Configuration', () => {
    it('calls only the /health endpoint', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      renderHook(() => useCiaSieHealth({ pollInterval: 60000 }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({
          method: 'GET',
          mode: 'cors',
          cache: 'no-store',
        })
      );
    });

    it('does NOT call any command endpoints', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      renderHook(() => useCiaSieHealth({ pollInterval: 60000 }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const calledUrls = mockFetch.mock.calls.map(call => call[0] as string);
      
      // Verify NO prohibited endpoints are called
      calledUrls.forEach(url => {
        expect(url).not.toContain('/start');
        expect(url).not.toContain('/stop');
        expect(url).not.toContain('/ignition');
        expect(url).not.toContain('/shutdown');
        expect(url).not.toContain('/telemetry');
        expect(url).not.toContain('/stream');
        expect(url).not.toContain('/ws');
      });
    });

    it('only uses GET method (read-only)', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      renderHook(() => useCiaSieHealth({ pollInterval: 60000 }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      mockFetch.mock.calls.forEach(call => {
        const options = call[1] as RequestInit;
        expect(options.method).toBe('GET');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles timeout errors', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValue(abortError);

      const { result } = renderHook(() => useCiaSieHealth({ pollInterval: 60000 }));

      await waitFor(() => {
        expect(result.current.lastError).toBe('Timeout');
      }, { timeout: 5000 });
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Failed to fetch'));

      const { result } = renderHook(() => useCiaSieHealth({ pollInterval: 60000 }));

      await waitFor(() => {
        expect(result.current.lastError).toBe('Unreachable');
      }, { timeout: 5000 });
    });
  });

  describe('Integration Constraints Verification', () => {
    it('does NOT establish WebSocket connections', async () => {
      // WebSocket should not be used
      const mockWebSocket = vi.fn();
      const originalWebSocket = global.WebSocket;
      global.WebSocket = mockWebSocket as unknown as typeof WebSocket;

      mockFetch.mockResolvedValue({ ok: true });

      const { unmount } = renderHook(() => useCiaSieHealth({ pollInterval: 60000 }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(mockWebSocket).not.toHaveBeenCalled();

      unmount();
      global.WebSocket = originalWebSocket;
    });

    it('does NOT use EventSource/SSE', async () => {
      const mockEventSource = vi.fn();
      const originalEventSource = global.EventSource;
      global.EventSource = mockEventSource as unknown as typeof EventSource;

      mockFetch.mockResolvedValue({ ok: true });

      const { unmount } = renderHook(() => useCiaSieHealth({ pollInterval: 60000 }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(mockEventSource).not.toHaveBeenCalled();

      unmount();
      global.EventSource = originalEventSource;
    });
  });
});
