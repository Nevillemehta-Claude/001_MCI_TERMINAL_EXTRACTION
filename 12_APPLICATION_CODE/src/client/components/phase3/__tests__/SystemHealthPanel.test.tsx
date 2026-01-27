import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SystemHealthPanel } from '../SystemHealthPanel';
import { useTelemetryStore, SystemHealth } from '../../../stores/telemetryStore';

// Mock the telemetry store
vi.mock('../../../stores/telemetryStore', () => ({
  useTelemetryStore: vi.fn(),
}));

describe('SystemHealthPanel component', () => {
  const mockSystemHealth: SystemHealth = {
    cpu: 45,
    memory: 60,
    latency: 25,
    uptime: 3600000, // 1 hour
    lastHeartbeat: Date.now(),
    status: 'healthy',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loading spinner when systemHealth is null', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({ systemHealth: null, lastUpdate: null });
      render(<SystemHealthPanel />);
      // Spinner renders label twice (visible and sr-only)
      expect(screen.getAllByText('Loading system data...').length).toBeGreaterThan(0);
    });

    it('should show System Health heading in loading state', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({ systemHealth: null, lastUpdate: null });
      render(<SystemHealthPanel />);
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });
  });

  describe('full mode rendering', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: mockSystemHealth,
        lastUpdate: Date.now(),
      });
    });

    it('should render System Health heading', () => {
      render(<SystemHealthPanel />);
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });

    it('should display CPU usage', () => {
      render(<SystemHealthPanel />);
      expect(screen.getByText('CPU')).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();
    });

    it('should display memory usage', () => {
      render(<SystemHealthPanel />);
      expect(screen.getByText('Memory')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('should display latency', () => {
      render(<SystemHealthPanel />);
      expect(screen.getByText('Latency')).toBeInTheDocument();
      expect(screen.getByText('25ms')).toBeInTheDocument();
    });

    it('should display uptime', () => {
      render(<SystemHealthPanel />);
      expect(screen.getByText('Uptime')).toBeInTheDocument();
      expect(screen.getByText('1h 0m')).toBeInTheDocument();
    });

    it('should show Heartbeat OK when heartbeat is recent', () => {
      render(<SystemHealthPanel />);
      expect(screen.getByText('Heartbeat OK')).toBeInTheDocument();
    });
  });

  describe('status badges', () => {
    it('should show Healthy status badge', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, status: 'healthy' },
        lastUpdate: Date.now(),
      });
      render(<SystemHealthPanel />);
      expect(screen.getByText(/✓.*Healthy/)).toBeInTheDocument();
    });

    it('should show Degraded status badge', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, status: 'degraded' },
        lastUpdate: Date.now(),
      });
      render(<SystemHealthPanel />);
      expect(screen.getByText(/⚠.*Degraded/)).toBeInTheDocument();
    });

    it('should show Critical status badge', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, status: 'critical' },
        lastUpdate: Date.now(),
      });
      render(<SystemHealthPanel />);
      expect(screen.getByText(/✕.*Critical/)).toBeInTheDocument();
    });
  });

  describe('compact mode rendering', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: mockSystemHealth,
        lastUpdate: Date.now(),
      });
    });

    it('should render System heading in compact mode', () => {
      render(<SystemHealthPanel compact />);
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('should display CPU in compact mode', () => {
      render(<SystemHealthPanel compact />);
      expect(screen.getByText('CPU')).toBeInTheDocument();
    });

    it('should display MEM in compact mode', () => {
      render(<SystemHealthPanel compact />);
      expect(screen.getByText('MEM')).toBeInTheDocument();
    });

    it('should display LAT in compact mode', () => {
      render(<SystemHealthPanel compact />);
      expect(screen.getByText('LAT')).toBeInTheDocument();
    });
  });

  describe('uptime formatting', () => {
    it('should format uptime in days and hours', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, uptime: 90000000 }, // ~1 day
        lastUpdate: Date.now(),
      });
      render(<SystemHealthPanel />);
      expect(screen.getByText('1d 1h')).toBeInTheDocument();
    });

    it('should format uptime in hours and minutes', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, uptime: 7200000 }, // 2 hours
        lastUpdate: Date.now(),
      });
      render(<SystemHealthPanel />);
      expect(screen.getByText('2h 0m')).toBeInTheDocument();
    });

    it('should format uptime in minutes and seconds', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, uptime: 180000 }, // 3 minutes
        lastUpdate: Date.now(),
      });
      render(<SystemHealthPanel />);
      expect(screen.getByText('3m 0s')).toBeInTheDocument();
    });

    it('should format uptime in seconds for short durations', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, uptime: 45000 }, // 45 seconds
        lastUpdate: Date.now(),
      });
      render(<SystemHealthPanel />);
      expect(screen.getByText('45s')).toBeInTheDocument();
    });
  });

  describe('latency formatting', () => {
    it('should show <1ms for very low latency', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, latency: 0.5 },
        lastUpdate: Date.now(),
      });
      render(<SystemHealthPanel />);
      expect(screen.getByText('<1ms')).toBeInTheDocument();
    });

    it('should show rounded ms for normal latency', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, latency: 45.7 },
        lastUpdate: Date.now(),
      });
      render(<SystemHealthPanel />);
      expect(screen.getByText('46ms')).toBeInTheDocument();
    });
  });

  describe('latency color coding', () => {
    it('should show green for low latency (<50ms)', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, latency: 25 },
        lastUpdate: Date.now(),
      });
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.text-green-600')).toBeInTheDocument();
    });

    it('should show yellow for medium latency (50-100ms)', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, latency: 75 },
        lastUpdate: Date.now(),
      });
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.text-yellow-600')).toBeInTheDocument();
    });

    it('should show red for high latency (>100ms)', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, latency: 150 },
        lastUpdate: Date.now(),
      });
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.text-red-600')).toBeInTheDocument();
    });
  });

  describe('heartbeat indicator', () => {
    it('should show green heartbeat when recent', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, lastHeartbeat: Date.now() },
        lastUpdate: Date.now(),
      });
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.bg-green-500.animate-pulse')).toBeInTheDocument();
    });

    it('should show red heartbeat when stale', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, lastHeartbeat: Date.now() - 10000 },
        lastUpdate: Date.now(),
      });
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.bg-red-500')).toBeInTheDocument();
    });

    it('should show stale heartbeat message when no heartbeat', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, lastHeartbeat: Date.now() - 10000 },
        lastUpdate: Date.now(),
      });
      render(<SystemHealthPanel />);
      expect(screen.getByText(/No heartbeat for \d+s/)).toBeInTheDocument();
    });
  });

  describe('status styling', () => {
    it('should apply green styling for healthy status', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, status: 'healthy' },
        lastUpdate: Date.now(),
      });
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.text-green-600')).toBeInTheDocument();
    });

    it('should apply yellow styling for degraded status', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, status: 'degraded' },
        lastUpdate: Date.now(),
      });
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.text-yellow-600')).toBeInTheDocument();
    });

    it('should apply red styling for critical status', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        systemHealth: { ...mockSystemHealth, status: 'critical' },
        lastUpdate: Date.now(),
      });
      const { container } = render(<SystemHealthPanel />);
      expect(container.querySelector('.text-red-600')).toBeInTheDocument();
    });
  });
});
