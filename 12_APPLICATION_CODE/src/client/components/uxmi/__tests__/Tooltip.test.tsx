import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Tooltip } from '../Tooltip';

describe('Tooltip component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('should render children', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
    });

    it('should not show tooltip initially', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('hover behavior', () => {
    it('should show tooltip after 300ms hover delay', async () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));

      // Should not appear immediately
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Advance timers by 300ms (APPEAR_DELAY)
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByRole('tooltip')).toHaveTextContent('Tooltip text');
    });

    it('should hide tooltip after 100ms leave delay', async () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      // Show tooltip
      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      // Leave
      fireEvent.mouseLeave(screen.getByRole('button'));

      // Should still be visible before delay
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      // Advance by 100ms (DISAPPEAR_DELAY)
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('should cancel hide when re-entering during delay', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      // Show tooltip
      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Leave and quickly re-enter
      fireEvent.mouseLeave(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(50);
      });
      fireEvent.mouseEnter(screen.getByRole('button'));

      // Wait full delay
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Should still be visible (hide was cancelled)
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('should cancel show when leaving during delay', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      // Start hover
      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(150); // Half of appear delay
      });

      // Leave before tooltip appears
      fireEvent.mouseLeave(screen.getByRole('button'));

      // Wait for full delay
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should never have appeared
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('focus behavior', () => {
    it('should show tooltip on focus', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Focus me</button>
        </Tooltip>
      );

      fireEvent.focus(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('should hide tooltip on blur', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Focus me</button>
        </Tooltip>
      );

      fireEvent.focus(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      fireEvent.blur(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('keyboard behavior', () => {
    it('should dismiss tooltip on Escape key', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      // Show tooltip
      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('should not dismiss on other keys', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      // Show tooltip
      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Press other key
      fireEvent.keyDown(document, { key: 'Enter' });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('positions', () => {
    it('should apply top position classes by default', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.className).toContain('bottom-full');
      expect(tooltip.className).toContain('mb-2');
    });

    it('should apply bottom position classes', () => {
      render(
        <Tooltip content="Tooltip text" position="bottom">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.className).toContain('top-full');
      expect(tooltip.className).toContain('mt-2');
    });

    it('should apply left position classes', () => {
      render(
        <Tooltip content="Tooltip text" position="left">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.className).toContain('right-full');
      expect(tooltip.className).toContain('mr-2');
    });

    it('should apply right position classes', () => {
      render(
        <Tooltip content="Tooltip text" position="right">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.className).toContain('left-full');
      expect(tooltip.className).toContain('ml-2');
    });
  });

  describe('maxWidth', () => {
    it('should apply default maxWidth of 280px', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveStyle({ maxWidth: '280px' });
    });

    it('should apply custom maxWidth', () => {
      render(
        <Tooltip content="Tooltip text" maxWidth={400}>
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveStyle({ maxWidth: '400px' });
    });
  });

  describe('styling', () => {
    it('should have dark background', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.className).toContain('bg-gray-900');
    });

    it('should have white text', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.className).toContain('text-white');
    });

    it('should have rounded corners', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.className).toContain('rounded-lg');
    });

    it('should have shadow', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.className).toContain('shadow-lg');
    });
  });

  describe('arrow indicator', () => {
    it('should render arrow for top position', () => {
      render(
        <Tooltip content="Tooltip text" position="top">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole('tooltip');
      // Arrow is the last child div inside tooltip
      const arrow = tooltip.querySelector('div');
      expect(arrow).toBeInTheDocument();
      expect(arrow?.className).toContain('rotate-45');
      expect(arrow?.className).toContain('top-full');
    });

    it('should render arrow for bottom position', () => {
      render(
        <Tooltip content="Tooltip text" position="bottom">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole('tooltip');
      // Arrow is the last child div inside tooltip
      const arrow = tooltip.querySelector('div');
      expect(arrow).toBeInTheDocument();
      expect(arrow?.className).toContain('rotate-45');
      expect(arrow?.className).toContain('bottom-full');
    });
  });

  describe('accessibility', () => {
    it('should have role="tooltip"', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('should be positioned with z-50 for stacking', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));
      act(() => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.className).toContain('z-50');
    });
  });
});
