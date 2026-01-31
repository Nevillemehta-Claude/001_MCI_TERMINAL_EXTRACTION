/**
 * Engine Status Indicator Tests
 * 
 * MINIMAL INTEGRATION: Health visibility ONLY.
 * Tests verify the component displays correct status without any prohibited interactions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EngineStatusIndicator } from './EngineStatusIndicator';

// Mock the health hook
vi.mock('../../hooks/useCiaSieHealth', () => ({
  useCiaSieHealth: vi.fn(),
}));

import { useCiaSieHealth } from '../../hooks/useCiaSieHealth';

const mockUseCiaSieHealth = vi.mocked(useCiaSieHealth);

describe('EngineStatusIndicator - Minimal Integration Health Visibility', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Status Display', () => {
    it('displays ENGINE: CONNECTED when engine is reachable', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'CONNECTED',
        isConnected: true,
        isChecking: false,
        latencyMs: 42,
        lastCheckAt: Date.now(),
        lastError: null,
        consecutiveFailures: 0,
        checkNow: vi.fn(),
      });

      render(<EngineStatusIndicator />);

      expect(screen.getByText('ENGINE:')).toBeInTheDocument();
      expect(screen.getByText('CONNECTED')).toBeInTheDocument();
      expect(screen.getByText('42ms')).toBeInTheDocument();
    });

    it('displays ENGINE: DISCONNECTED when engine is unreachable', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'DISCONNECTED',
        isConnected: false,
        isChecking: false,
        latencyMs: null,
        lastCheckAt: Date.now(),
        lastError: 'Unreachable',
        consecutiveFailures: 3,
        checkNow: vi.fn(),
      });

      render(<EngineStatusIndicator />);

      expect(screen.getByText('ENGINE:')).toBeInTheDocument();
      expect(screen.getByText('DISCONNECTED')).toBeInTheDocument();
    });

    it('displays ENGINE: CHECKING during health check', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'CHECKING',
        isConnected: false,
        isChecking: true,
        latencyMs: null,
        lastCheckAt: null,
        lastError: null,
        consecutiveFailures: 0,
        checkNow: vi.fn(),
      });

      render(<EngineStatusIndicator />);

      expect(screen.getByText('ENGINE:')).toBeInTheDocument();
      expect(screen.getByText('CHECKING')).toBeInTheDocument();
    });

    it('displays ENGINE: UNKNOWN before first check', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'UNKNOWN',
        isConnected: false,
        isChecking: false,
        latencyMs: null,
        lastCheckAt: null,
        lastError: null,
        consecutiveFailures: 0,
        checkNow: vi.fn(),
      });

      render(<EngineStatusIndicator />);

      expect(screen.getByText('ENGINE:')).toBeInTheDocument();
      expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
    });
  });

  describe('Visual Indicators', () => {
    it('shows green indicator when connected', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'CONNECTED',
        isConnected: true,
        isChecking: false,
        latencyMs: 50,
        lastCheckAt: Date.now(),
        lastError: null,
        consecutiveFailures: 0,
        checkNow: vi.fn(),
      });

      const { container } = render(<EngineStatusIndicator />);

      const indicator = container.querySelector('.bg-green-500');
      expect(indicator).toBeInTheDocument();
    });

    it('shows red indicator when disconnected', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'DISCONNECTED',
        isConnected: false,
        isChecking: false,
        latencyMs: null,
        lastCheckAt: Date.now(),
        lastError: 'Connection refused',
        consecutiveFailures: 1,
        checkNow: vi.fn(),
      });

      const { container } = render(<EngineStatusIndicator />);

      const indicator = container.querySelector('.bg-red-500');
      expect(indicator).toBeInTheDocument();
    });

    it('shows pulsing gray indicator when checking', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'CHECKING',
        isConnected: false,
        isChecking: true,
        latencyMs: null,
        lastCheckAt: null,
        lastError: null,
        consecutiveFailures: 0,
        checkNow: vi.fn(),
      });

      const { container } = render(<EngineStatusIndicator />);

      const indicator = container.querySelector('.animate-pulse');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('renders compact version with abbreviated text', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'CONNECTED',
        isConnected: true,
        isChecking: false,
        latencyMs: 30,
        lastCheckAt: Date.now(),
        lastError: null,
        consecutiveFailures: 0,
        checkNow: vi.fn(),
      });

      render(<EngineStatusIndicator compact />);

      expect(screen.getByText('ENG')).toBeInTheDocument();
      expect(screen.queryByText('ENGINE:')).not.toBeInTheDocument();
    });

    it('shows ENG! when disconnected in compact mode', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'DISCONNECTED',
        isConnected: false,
        isChecking: false,
        latencyMs: null,
        lastCheckAt: Date.now(),
        lastError: 'Error',
        consecutiveFailures: 1,
        checkNow: vi.fn(),
      });

      render(<EngineStatusIndicator compact />);

      expect(screen.getByText('ENG!')).toBeInTheDocument();
    });

    it('shows ENG? when unknown in compact mode', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'UNKNOWN',
        isConnected: false,
        isChecking: false,
        latencyMs: null,
        lastCheckAt: null,
        lastError: null,
        consecutiveFailures: 0,
        checkNow: vi.fn(),
      });

      render(<EngineStatusIndicator compact />);

      expect(screen.getByText('ENG?')).toBeInTheDocument();
    });
  });

  describe('Latency Display', () => {
    it('shows latency when connected', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'CONNECTED',
        isConnected: true,
        isChecking: false,
        latencyMs: 123,
        lastCheckAt: Date.now(),
        lastError: null,
        consecutiveFailures: 0,
        checkNow: vi.fn(),
      });

      render(<EngineStatusIndicator />);

      expect(screen.getByText('123ms')).toBeInTheDocument();
    });

    it('does not show latency when disconnected', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'DISCONNECTED',
        isConnected: false,
        isChecking: false,
        latencyMs: null,
        lastCheckAt: Date.now(),
        lastError: 'Error',
        consecutiveFailures: 1,
        checkNow: vi.fn(),
      });

      render(<EngineStatusIndicator />);

      expect(screen.queryByText(/ms$/)).not.toBeInTheDocument();
    });
  });

  describe('Hook Configuration', () => {
    it('passes custom pollInterval to hook', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'CONNECTED',
        isConnected: true,
        isChecking: false,
        latencyMs: 50,
        lastCheckAt: Date.now(),
        lastError: null,
        consecutiveFailures: 0,
        checkNow: vi.fn(),
      });

      render(<EngineStatusIndicator pollInterval={5000} />);

      expect(mockUseCiaSieHealth).toHaveBeenCalledWith({
        pollInterval: 5000,
        enabled: true,
      });
    });

    it('always enables health checking', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'UNKNOWN',
        isConnected: false,
        isChecking: false,
        latencyMs: null,
        lastCheckAt: null,
        lastError: null,
        consecutiveFailures: 0,
        checkNow: vi.fn(),
      });

      render(<EngineStatusIndicator />);

      expect(mockUseCiaSieHealth).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: true })
      );
    });
  });

  describe('Constraints Verification', () => {
    it('does NOT render any control buttons', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'CONNECTED',
        isConnected: true,
        isChecking: false,
        latencyMs: 50,
        lastCheckAt: Date.now(),
        lastError: null,
        consecutiveFailures: 0,
        checkNow: vi.fn(),
      });

      render(<EngineStatusIndicator />);

      // No buttons should exist
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('does NOT display telemetry data', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'CONNECTED',
        isConnected: true,
        isChecking: false,
        latencyMs: 50,
        lastCheckAt: Date.now(),
        lastError: null,
        consecutiveFailures: 0,
        checkNow: vi.fn(),
      });

      render(<EngineStatusIndicator />);

      // No telemetry-related text
      expect(screen.queryByText(/position/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/order/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/PnL/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/equity/i)).not.toBeInTheDocument();
    });

    it('does NOT display lifecycle controls', () => {
      mockUseCiaSieHealth.mockReturnValue({
        status: 'CONNECTED',
        isConnected: true,
        isChecking: false,
        latencyMs: 50,
        lastCheckAt: Date.now(),
        lastError: null,
        consecutiveFailures: 0,
        checkNow: vi.fn(),
      });

      render(<EngineStatusIndicator />);

      // No lifecycle controls
      expect(screen.queryByText(/start/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/stop/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/ignite/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/shutdown/i)).not.toBeInTheDocument();
    });
  });
});
