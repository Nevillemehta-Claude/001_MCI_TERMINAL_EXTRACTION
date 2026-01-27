import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TokenTimer } from '../TokenTimer';
import { useTokenStore } from '../../../stores/tokenStore';

// Mock the token store
vi.mock('../../../stores/tokenStore', () => ({
  useTokenStore: vi.fn(),
}));

describe('TokenTimer component', () => {
  const mockStore = {
    tokenExpiresAt: null as number | null,
    isTokenValid: false,
    clearTokens: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(useTokenStore).mockReturnValue(mockStore);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('should render in compact mode', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 60 * 60 * 1000, // 1 hour
        isTokenValid: true,
      });

      render(<TokenTimer compact />);
      expect(screen.getByText('01:00:00')).toBeInTheDocument();
    });

    it('should render in full mode by default', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 60 * 60 * 1000,
        isTokenValid: true,
      });

      render(<TokenTimer />);
      expect(screen.getByText('Token Valid')).toBeInTheDocument();
    });

    it('should show placeholder time when no token', () => {
      render(<TokenTimer />);
      expect(screen.getByText('--:--:--')).toBeInTheDocument();
    });
  });

  describe('time formatting', () => {
    it('should format time with hours, minutes, seconds', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 2 * 60 * 60 * 1000 + 30 * 60 * 1000 + 45 * 1000, // 2:30:45
        isTokenValid: true,
      });

      render(<TokenTimer />);
      expect(screen.getByText('02:30:45')).toBeInTheDocument();
    });

    it('should pad single digits with zeros', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 5 * 60 * 1000 + 9 * 1000, // 0:05:09
        isTokenValid: true,
      });

      render(<TokenTimer />);
      expect(screen.getByText('00:05:09')).toBeInTheDocument();
    });
  });

  describe('countdown updates', () => {
    it('should update time every second', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 5 * 1000, // 5 seconds
        isTokenValid: true,
      });

      render(<TokenTimer />);
      expect(screen.getByText('00:00:05')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('00:00:04')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('00:00:03')).toBeInTheDocument();
    });

    it('should not go below zero', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 1000, // 1 second
        isTokenValid: true,
      });

      render(<TokenTimer />);

      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByText('00:00:00')).toBeInTheDocument();
    });
  });

  describe('status levels', () => {
    it('should show healthy status for > 1 hour', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 2 * 60 * 60 * 1000, // 2 hours
        isTokenValid: true,
      });

      render(<TokenTimer />);
      expect(screen.getByText('Token Valid')).toBeInTheDocument();
    });

    it('should show caution status for 30-60 minutes', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 45 * 60 * 1000, // 45 minutes
        isTokenValid: true,
      });

      render(<TokenTimer />);
      expect(screen.getByText('Token Active')).toBeInTheDocument();
    });

    it('should show warning status for 5-30 minutes', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 20 * 60 * 1000, // 20 minutes
        isTokenValid: true,
      });

      render(<TokenTimer />);
      expect(screen.getByText('Expiring Soon')).toBeInTheDocument();
    });

    it('should show critical status for < 5 minutes', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 3 * 60 * 1000, // 3 minutes
        isTokenValid: true,
      });

      render(<TokenTimer />);
      expect(screen.getByText('Expiring!')).toBeInTheDocument();
    });

    it('should show expired status when time is 0', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now, // Expired
        isTokenValid: true,
      });

      render(<TokenTimer />);
      expect(screen.getByText('Expired')).toBeInTheDocument();
    });

    it('should show invalid status when isTokenValid is false', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 60 * 60 * 1000,
        isTokenValid: false,
      });

      render(<TokenTimer />);
      expect(screen.getByText('No Token')).toBeInTheDocument();
    });

    it('should show invalid status when tokenExpiresAt is null', () => {
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: null,
        isTokenValid: false,
      });

      render(<TokenTimer />);
      expect(screen.getByText('No Token')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should apply green styling for healthy status', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 2 * 60 * 60 * 1000,
        isTokenValid: true,
      });

      const { container } = render(<TokenTimer />);
      expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
    });

    it('should apply blue styling for caution status', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 45 * 60 * 1000,
        isTokenValid: true,
      });

      const { container } = render(<TokenTimer />);
      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
    });

    it('should apply yellow styling for warning status', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 20 * 60 * 1000,
        isTokenValid: true,
      });

      const { container } = render(<TokenTimer />);
      expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
    });

    it('should apply red styling and pulse animation for critical status', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 2 * 60 * 1000,
        isTokenValid: true,
      });

      const { container } = render(<TokenTimer />);
      const wrapper = container.querySelector('.rounded-lg');
      expect(wrapper?.className).toContain('bg-red-50');
      expect(wrapper?.className).toContain('animate-pulse');
    });
  });

  describe('refresh button', () => {
    it('should not show refresh button for healthy status', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 2 * 60 * 60 * 1000,
        isTokenValid: true,
      });

      render(<TokenTimer />);
      expect(screen.queryByRole('button', { name: /Refresh/i })).not.toBeInTheDocument();
    });

    it('should not show refresh button for caution status', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 45 * 60 * 1000,
        isTokenValid: true,
      });

      render(<TokenTimer />);
      expect(screen.queryByRole('button', { name: /Refresh/i })).not.toBeInTheDocument();
    });

    it('should show refresh button for warning status', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 20 * 60 * 1000,
        isTokenValid: true,
      });

      render(<TokenTimer showRefreshButton />);
      expect(screen.getByRole('button', { name: /Refresh/i })).toBeInTheDocument();
    });

    it('should show refresh button for critical status', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 2 * 60 * 1000,
        isTokenValid: true,
      });

      render(<TokenTimer showRefreshButton />);
      expect(screen.getByRole('button', { name: /Refresh/i })).toBeInTheDocument();
    });

    it('should show Re-authenticate button for expired status', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now,
        isTokenValid: true,
      });

      render(<TokenTimer showRefreshButton />);
      expect(screen.getByRole('button', { name: /Re-authenticate/i })).toBeInTheDocument();
    });

    it('should not show refresh button when showRefreshButton is false', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 2 * 60 * 1000,
        isTokenValid: true,
      });

      render(<TokenTimer showRefreshButton={false} />);
      expect(screen.queryByRole('button', { name: /Refresh/i })).not.toBeInTheDocument();
    });

    it('should call onRefresh when refresh button is clicked', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 2 * 60 * 1000,
        isTokenValid: true,
      });
      const onRefresh = vi.fn();

      render(<TokenTimer showRefreshButton onRefresh={onRefresh} />);
      fireEvent.click(screen.getByRole('button', { name: /Refresh/i }));

      expect(onRefresh).toHaveBeenCalled();
    });

    it('should clear tokens and call onRefresh when expired and button clicked', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now,
        isTokenValid: true,
      });
      const onRefresh = vi.fn();

      render(<TokenTimer showRefreshButton onRefresh={onRefresh} />);
      fireEvent.click(screen.getByRole('button', { name: /Re-authenticate/i }));

      expect(mockStore.clearTokens).toHaveBeenCalled();
      expect(onRefresh).toHaveBeenCalled();
    });
  });

  describe('callbacks', () => {
    it('should call onExpired when status becomes expired', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      const onExpired = vi.fn();
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 2000, // 2 seconds
        isTokenValid: true,
      });

      render(<TokenTimer onExpired={onExpired} />);

      expect(onExpired).not.toHaveBeenCalled();

      // Advance to expiration
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(onExpired).toHaveBeenCalled();
    });
  });

  describe('progress bar', () => {
    it('should show progress bar for valid tokens', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 12 * 60 * 60 * 1000, // 12 hours
        isTokenValid: true,
      });

      const { container } = render(<TokenTimer />);
      // Progress bar is a div with specific color classes
      expect(container.querySelector('.bg-green-500')).toBeInTheDocument();
    });

    it('should not show progress bar for invalid status', () => {
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: null,
        isTokenValid: false,
      });

      const { container } = render(<TokenTimer />);
      // Progress bar shouldn't exist
      expect(container.querySelector('.bg-gray-200.rounded-full')).not.toBeInTheDocument();
    });

    it('should not show progress bar for expired status', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now,
        isTokenValid: true,
      });

      const { container } = render(<TokenTimer />);
      // No green/yellow/red progress bar colors
      expect(container.querySelector('.h-1\\.5.bg-gray-200')).not.toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('should render with tooltip in compact mode', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 60 * 60 * 1000,
        isTokenValid: true,
      });

      render(<TokenTimer compact />);
      // Tooltip wrapper is present
      expect(screen.getByText('01:00:00').closest('[class*="rounded-full"]')).toBeInTheDocument();
    });

    it('should show icon in compact mode', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        tokenExpiresAt: now + 2 * 60 * 60 * 1000,
        isTokenValid: true,
      });

      render(<TokenTimer compact />);
      expect(screen.getByText('✓')).toBeInTheDocument();
    });
  });
});
