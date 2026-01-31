/**
 * SystemHealthPanel Tests
 * Tests for Phase 3 system health monitoring display
 * India-market-only compliant
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SystemHealthPanel } from '../SystemHealthPanel';

// Mock the telemetry store
const mockTelemetryStore = {
  systemHealth: null as null | {
    cpu: number;
    memory: number;
    latency: number;
    uptime: number;
    lastHeartbeat: number;
    status: 'healthy' | 'degraded' | 'critical';
  },
  lastUpdate: null as number | null,
};

vi.mock('../../../stores/telemetryStore', () => ({
  useTelemetryStore: vi.fn(() => mockTelemetryStore),
}));

// Mock UXMI components
vi.mock('../../uxmi', () => ({
  Tooltip: ({ children, content }: { children: React.ReactNode; content: string }) => (
    <div data-tooltip={content}>{children}</div>
  ),
  ProgressBar: ({ value, variant, size }: { value: number; variant: string; size: string }) => (
    <div data-testid="progress-bar" data-value={value} data-variant={variant} data-size={size}>
      Progress: {value}%
    </div>
  ),
  Spinner: ({ label }: { label?: string }) => (
    <div data-testid="spinner">{label}</div>
  ),
}));

describe('SystemHealthPanel component', () => {
  const mockSystemHealth = {
    cpu: 45,
    memory: 60,
    latency: 25,
    uptime: 3600000, // 1 hour
    lastHeartbeat: Date.now(),
    status: 'healthy' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTelemetryStore.systemHealth = null;
    mockTelemetryStore.lastUpdate = null;
  });

  describe('loading state', () => {
    it('should show loading spinner when systemHealth is null', () => {
      mockTelemetryStore.systemHealth = null;
      render(<SystemHealthPanel />);
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading system data...')).toBeInTheDocument();
    });

    it('should show System Health heading in loading state', () => {
      mockTelemetryStore.systemHealth = null;
      render(<SystemHealthPanel />);
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });
  });

  describe('full mode rendering', () => {
    beforeEach(() => {
      mockTelemetryStore.systemHealth = mockSystemHealth;
      mockTelemetryStore.lastUpdate = Date.now();
    });

    it('should render System Health heading', () => {
      render(<SystemHealthPanel />);
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });

    it('should display CPU label and value', () => {
      render(<SystemHealthPanel />);
      expect(screen.getByText('CPU')).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();
    });

    it('should display Memory label and value', () => {
      render(<SystemHealthPanel />);
      expect(screen.getByText('Memory')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('should display Latency label and value', () => {
      render(<SystemHealthPanel />);
      expect(screen.getByText('Latency')).toBeInTheDocument();
      expect(screen.getByText('25ms')).toBeInTheDocument();
    });

    it('should display Uptime label and formatted value', () => {
      render(<SystemHealthPanel />);
      expect(screen.getByText('Uptime')).toBeInTheDocument();
      expect(screen.getByText('1h 0m')).toBeInTheDocument();
    });

    it('should show Heartbeat OK when heartbeat is recent', () => {
      render(<SystemHealthPanel />);
      expect(screen.getByText('Heartbeat OK')).toBeInTheDocument();
    });

    it('should render progress bars for CPU and Memory', () => {
      render(<SystemHealthPanel />);
      const progressBars = screen.getAllByTestId('progress-bar');
      expect(progressBars.length).toBe(2); // CPU and Memory
    });
  });

  describe('status badges', () => {
    it('should show Healthy status with checkmark', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, status: 'healthy' };
      mockTelemetryStore.lastUpdate = Date.now();
      render(<SystemHealthPanel />);
      expect(screen.getByText('✓ Healthy')).toBeInTheDocument();
    });

    it('should show Degraded status with warning icon', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, status: 'degraded' };
      mockTelemetryStore.lastUpdate = Date.now();
      render(<SystemHealthPanel />);
      expect(screen.getByText('⚠ Degraded')).toBeInTheDocument();
    });

    it('should show Critical status with X icon', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, status: 'critical' };
      mockTelemetryStore.lastUpdate = Date.now();
      render(<SystemHealthPanel />);
      expect(screen.getByText('✕ Critical')).toBeInTheDocument();
    });
  });

  describe('compact mode rendering', () => {
    beforeEach(() => {
      mockTelemetryStore.systemHealth = mockSystemHealth;
      mockTelemetryStore.lastUpdate = Date.now();
    });

    it('should render System heading in compact mode', () => {
      render(<SystemHealthPanel compact />);
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('should display CPU label in compact mode', () => {
      render(<SystemHealthPanel compact />);
      expect(screen.getByText('CPU')).toBeInTheDocument();
    });

    it('should display MEM label in compact mode', () => {
      render(<SystemHealthPanel compact />);
      expect(screen.getByText('MEM')).toBeInTheDocument();
    });

    it('should display LAT label in compact mode', () => {
      render(<SystemHealthPanel compact />);
      expect(screen.getByText('LAT')).toBeInTheDocument();
    });

    it('should display values in compact mode', () => {
      render(<SystemHealthPanel compact />);
      expect(screen.getByText('45%')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('25ms')).toBeInTheDocument();
    });

    it('should display status badge in compact mode', () => {
      render(<SystemHealthPanel compact />);
      expect(screen.getByText('✓ Healthy')).toBeInTheDocument();
    });
  });

  describe('uptime formatting', () => {
    it('should format uptime in days and hours', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, uptime: 90000000 }; // ~1 day 1 hour
      mockTelemetryStore.lastUpdate = Date.now();
      render(<SystemHealthPanel />);
      expect(screen.getByText('1d 1h')).toBeInTheDocument();
    });

    it('should format uptime in hours and minutes', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, uptime: 7200000 }; // 2 hours
      mockTelemetryStore.lastUpdate = Date.now();
      render(<SystemHealthPanel />);
      expect(screen.getByText('2h 0m')).toBeInTheDocument();
    });

    it('should format uptime in minutes and seconds', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, uptime: 180000 }; // 3 minutes
      mockTelemetryStore.lastUpdate = Date.now();
      render(<SystemHealthPanel />);
      expect(screen.getByText('3m 0s')).toBeInTheDocument();
    });

    it('should format uptime in seconds for short durations', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, uptime: 45000 }; // 45 seconds
      mockTelemetryStore.lastUpdate = Date.now();
      render(<SystemHealthPanel />);
      expect(screen.getByText('45s')).toBeInTheDocument();
    });
  });

  describe('latency formatting', () => {
    it('should show <1ms for very low latency', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, latency: 0.5 };
      mockTelemetryStore.lastUpdate = Date.now();
      render(<SystemHealthPanel />);
      expect(screen.getByText('<1ms')).toBeInTheDocument();
    });

    it('should show rounded ms for normal latency', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, latency: 45.7 };
      mockTelemetryStore.lastUpdate = Date.now();
      render(<SystemHealthPanel />);
      expect(screen.getByText('46ms')).toBeInTheDocument();
    });

    it('should show exact ms for integer latency', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, latency: 100 };
      mockTelemetryStore.lastUpdate = Date.now();
      render(<SystemHealthPanel />);
      expect(screen.getByText('100ms')).toBeInTheDocument();
    });
  });

  describe('latency color coding', () => {
    it('should show green for low latency (<50ms)', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, latency: 25 };
      mockTelemetryStore.lastUpdate = Date.now();
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.text-green-600')).toBeInTheDocument();
    });

    it('should show yellow for medium latency (50-100ms)', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, latency: 75 };
      mockTelemetryStore.lastUpdate = Date.now();
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.text-yellow-600')).toBeInTheDocument();
    });

    it('should show red for high latency (>100ms)', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, latency: 150 };
      mockTelemetryStore.lastUpdate = Date.now();
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.text-red-600')).toBeInTheDocument();
    });
  });

  describe('heartbeat indicator', () => {
    it('should show green pulsing indicator when heartbeat is recent', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, lastHeartbeat: Date.now() };
      mockTelemetryStore.lastUpdate = Date.now();
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.bg-green-500.animate-pulse')).toBeInTheDocument();
    });

    it('should show red indicator when heartbeat is stale', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, lastHeartbeat: Date.now() - 10000 };
      mockTelemetryStore.lastUpdate = Date.now();
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.bg-red-500')).toBeInTheDocument();
    });

    it('should show stale heartbeat message when no recent heartbeat', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, lastHeartbeat: Date.now() - 10000 };
      mockTelemetryStore.lastUpdate = Date.now();
      render(<SystemHealthPanel />);
      expect(screen.getByText(/No heartbeat for \d+s/)).toBeInTheDocument();
    });

    it('should show green background for recent heartbeat', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, lastHeartbeat: Date.now() };
      mockTelemetryStore.lastUpdate = Date.now();
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
    });

    it('should show red background for stale heartbeat', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, lastHeartbeat: Date.now() - 10000 };
      mockTelemetryStore.lastUpdate = Date.now();
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
    });
  });

  describe('status styling', () => {
    it('should apply green styling for healthy status', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, status: 'healthy' };
      mockTelemetryStore.lastUpdate = Date.now();
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.text-green-600.bg-green-100')).toBeInTheDocument();
    });

    it('should apply yellow styling for degraded status', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, status: 'degraded' };
      mockTelemetryStore.lastUpdate = Date.now();
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.text-yellow-600.bg-yellow-100')).toBeInTheDocument();
    });

    it('should apply red styling for critical status', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, status: 'critical' };
      mockTelemetryStore.lastUpdate = Date.now();
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.text-red-600.bg-red-100')).toBeInTheDocument();
    });
  });

  describe('tooltips', () => {
    beforeEach(() => {
      mockTelemetryStore.systemHealth = mockSystemHealth;
      mockTelemetryStore.lastUpdate = Date.now();
    });

    it('should have tooltip for CPU usage', () => {
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('[data-tooltip="CPU usage: 45%"]')).toBeInTheDocument();
    });

    it('should have tooltip for Memory usage', () => {
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('[data-tooltip="Memory usage: 60%"]')).toBeInTheDocument();
    });

    it('should have tooltip for Latency', () => {
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('[data-tooltip="Network latency to trading servers"]')).toBeInTheDocument();
    });

    it('should have tooltip for Uptime', () => {
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('[data-tooltip="System uptime since last restart"]')).toBeInTheDocument();
    });
  });

  describe('progress bar variants', () => {
    it('should use success variant for low CPU usage', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, cpu: 30 };
      mockTelemetryStore.lastUpdate = Date.now();
      render(<SystemHealthPanel />);
      const progressBars = screen.getAllByTestId('progress-bar');
      expect(progressBars[0]).toHaveAttribute('data-variant', 'success');
    });

    it('should use warning variant for medium CPU usage', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, cpu: 70 };
      mockTelemetryStore.lastUpdate = Date.now();
      render(<SystemHealthPanel />);
      const progressBars = screen.getAllByTestId('progress-bar');
      expect(progressBars[0]).toHaveAttribute('data-variant', 'warning');
    });

    it('should use error variant for high CPU usage', () => {
      mockTelemetryStore.systemHealth = { ...mockSystemHealth, cpu: 90 };
      mockTelemetryStore.lastUpdate = Date.now();
      render(<SystemHealthPanel />);
      const progressBars = screen.getAllByTestId('progress-bar');
      expect(progressBars[0]).toHaveAttribute('data-variant', 'error');
    });
  });
});
