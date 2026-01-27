import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityLogPanel } from '../ActivityLogPanel';
import { useTelemetryStore } from '../../../stores/telemetryStore';

// Mock the telemetry store
vi.mock('../../../stores/telemetryStore', () => ({
  useTelemetryStore: vi.fn(),
}));

describe('ActivityLogPanel component', () => {
  const mockActivityLog = [
    {
      id: 'log-1',
      timestamp: Date.now() - 60000,
      type: 'info' as const,
      message: 'System initialized successfully',
    },
    {
      id: 'log-2',
      timestamp: Date.now() - 30000,
      type: 'warning' as const,
      message: 'High latency detected',
    },
    {
      id: 'log-3',
      timestamp: Date.now() - 15000,
      type: 'error' as const,
      message: 'Connection lost temporarily',
    },
    {
      id: 'log-4',
      timestamp: Date.now() - 5000,
      type: 'trade' as const,
      message: 'Order filled: AAPL 100 shares @ $175.50',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty state', () => {
    it('should show "No activity yet" when activityLog is empty', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({ activityLog: [] });
      render(<ActivityLogPanel />);
      expect(screen.getByText('No activity yet')).toBeInTheDocument();
    });

    it('should show Activity Log heading in empty state', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({ activityLog: [] });
      render(<ActivityLogPanel />);
      expect(screen.getByText('Activity Log')).toBeInTheDocument();
    });
  });

  describe('log rendering', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ activityLog: mockActivityLog });
    });

    it('should display entry count', () => {
      render(<ActivityLogPanel />);
      expect(screen.getByText('4 entries')).toBeInTheDocument();
    });

    it('should display all log messages', () => {
      render(<ActivityLogPanel />);
      expect(screen.getByText('System initialized successfully')).toBeInTheDocument();
      expect(screen.getByText('High latency detected')).toBeInTheDocument();
      expect(screen.getByText('Connection lost temporarily')).toBeInTheDocument();
      expect(screen.getByText('Order filled: AAPL 100 shares @ $175.50')).toBeInTheDocument();
    });

    it('should display timestamps in 24-hour format', () => {
      render(<ActivityLogPanel />);
      // Just check that timestamps are rendered (format: HH:MM:SS)
      const container = screen.getByText('Activity Log').parentElement?.parentElement;
      expect(container?.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('log type styling', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ activityLog: mockActivityLog });
    });

    it('should apply blue styling for info logs', () => {
      const { container } = render(<ActivityLogPanel />);
      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
      expect(container.querySelector('.text-blue-700')).toBeInTheDocument();
    });

    it('should apply yellow styling for warning logs', () => {
      const { container } = render(<ActivityLogPanel />);
      expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
      expect(container.querySelector('.text-yellow-700')).toBeInTheDocument();
    });

    it('should apply red styling for error logs', () => {
      const { container } = render(<ActivityLogPanel />);
      expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
      expect(container.querySelector('.text-red-700')).toBeInTheDocument();
    });

    it('should apply green styling for trade logs', () => {
      const { container } = render(<ActivityLogPanel />);
      expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
      expect(container.querySelector('.text-green-700')).toBeInTheDocument();
    });

    it('should apply ring highlight to trade logs', () => {
      const { container } = render(<ActivityLogPanel />);
      // Find elements with both ring-1 and ring-green-300 classes
      const ringElements = container.querySelectorAll('[class*="ring-1"][class*="ring-green-300"]');
      expect(ringElements.length).toBeGreaterThan(0);
    });
  });

  describe('log icons', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ activityLog: mockActivityLog });
    });

    it('should render info icon for info logs', () => {
      const { container } = render(<ActivityLogPanel />);
      expect(container.querySelector('.text-blue-500')).toBeInTheDocument();
    });

    it('should render warning icon for warning logs', () => {
      const { container } = render(<ActivityLogPanel />);
      expect(container.querySelector('.text-yellow-500')).toBeInTheDocument();
    });

    it('should render error icon for error logs', () => {
      const { container } = render(<ActivityLogPanel />);
      expect(container.querySelector('.text-red-500')).toBeInTheDocument();
    });

    it('should render trade icon for trade logs', () => {
      const { container } = render(<ActivityLogPanel />);
      expect(container.querySelector('.text-green-500')).toBeInTheDocument();
    });
  });

  describe('maxItems prop', () => {
    it('should limit displayed items to maxItems', () => {
      const manyLogs = Array.from({ length: 100 }, (_, i) => ({
        id: `log-${i}`,
        timestamp: Date.now() - i * 1000,
        type: 'info' as const,
        message: `Log message ${i}`,
      }));
      vi.mocked(useTelemetryStore).mockReturnValue({ activityLog: manyLogs });
      render(<ActivityLogPanel maxItems={10} />);
      expect(screen.getByText('10 entries')).toBeInTheDocument();
    });

    it('should show all items if less than maxItems', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({ activityLog: mockActivityLog });
      render(<ActivityLogPanel maxItems={100} />);
      expect(screen.getByText('4 entries')).toBeInTheDocument();
    });

    it('should default to 50 maxItems', () => {
      const manyLogs = Array.from({ length: 100 }, (_, i) => ({
        id: `log-${i}`,
        timestamp: Date.now() - i * 1000,
        type: 'info' as const,
        message: `Log message ${i}`,
      }));
      vi.mocked(useTelemetryStore).mockReturnValue({ activityLog: manyLogs });
      render(<ActivityLogPanel />);
      expect(screen.getByText('50 entries')).toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    beforeEach(() => {
      vi.mocked(useTelemetryStore).mockReturnValue({ activityLog: mockActivityLog });
    });

    it('should apply max-height class in compact mode', () => {
      const { container } = render(<ActivityLogPanel compact />);
      expect(container.querySelector('.max-h-48')).toBeInTheDocument();
    });

    it('should not apply max-height class in full mode', () => {
      const { container } = render(<ActivityLogPanel compact={false} />);
      expect(container.querySelector('.max-h-48')).not.toBeInTheDocument();
    });
  });

  describe('log type variations', () => {
    it('should render info-only logs correctly', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        activityLog: [
          { id: 'log-1', timestamp: Date.now(), type: 'info', message: 'Info message' },
        ],
      });
      render(<ActivityLogPanel />);
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });

    it('should render warning-only logs correctly', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        activityLog: [
          { id: 'log-1', timestamp: Date.now(), type: 'warning', message: 'Warning message' },
        ],
      });
      render(<ActivityLogPanel />);
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    it('should render error-only logs correctly', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        activityLog: [
          { id: 'log-1', timestamp: Date.now(), type: 'error', message: 'Error message' },
        ],
      });
      render(<ActivityLogPanel />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should render trade-only logs correctly', () => {
      vi.mocked(useTelemetryStore).mockReturnValue({
        activityLog: [
          { id: 'log-1', timestamp: Date.now(), type: 'trade', message: 'Trade executed' },
        ],
      });
      render(<ActivityLogPanel />);
      expect(screen.getByText('Trade executed')).toBeInTheDocument();
    });
  });
});
