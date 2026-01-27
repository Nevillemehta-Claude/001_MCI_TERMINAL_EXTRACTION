import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDisplay } from '../ErrorDisplay';

describe('ErrorDisplay component', () => {
  describe('rendering', () => {
    it('should render with role="alert"', () => {
      render(<ErrorDisplay what="Something went wrong" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should render WHAT message', () => {
      render(<ErrorDisplay what="Connection failed" />);
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });

    it('should render WHY message when provided', () => {
      render(<ErrorDisplay what="Error" why="Server is down" />);
      expect(screen.getByText(/Server is down/)).toBeInTheDocument();
    });

    it('should render HOW message when provided', () => {
      render(<ErrorDisplay what="Error" how="Try again later" />);
      expect(screen.getByText(/Try again later/)).toBeInTheDocument();
    });

    it('should render error code when provided', () => {
      render(<ErrorDisplay what="Error" code="ERR_001" />);
      expect(screen.getByText('ERR_001')).toBeInTheDocument();
    });
  });

  describe('severity levels', () => {
    it('should apply error styling (default)', () => {
      render(<ErrorDisplay what="Error" />);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-red-50');
      expect(alert.className).toContain('border-red-200');
    });

    it('should apply warning styling', () => {
      render(<ErrorDisplay what="Warning" severity="warning" />);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-yellow-50');
      expect(alert.className).toContain('border-yellow-200');
    });

    it('should apply info styling', () => {
      render(<ErrorDisplay what="Info" severity="info" />);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-blue-50');
      expect(alert.className).toContain('border-blue-200');
    });

    it('should render appropriate icon for each severity', () => {
      const { container } = render(<ErrorDisplay what="Error" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('should render inline in compact mode', () => {
      render(<ErrorDisplay what="Error" compact />);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('flex');
      expect(alert.className).toContain('items-center');
    });

    it('should not render WHY in compact mode', () => {
      render(<ErrorDisplay what="Error" why="Reason" compact />);
      expect(screen.queryByText(/Reason/)).not.toBeInTheDocument();
    });

    it('should not render HOW in compact mode', () => {
      render(<ErrorDisplay what="Error" how="Fix it" compact />);
      expect(screen.queryByText(/Fix it/)).not.toBeInTheDocument();
    });

    it('should render dismiss button in compact mode when onDismiss provided', () => {
      render(<ErrorDisplay what="Error" compact onDismiss={vi.fn()} />);
      expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
    });

    it('should use compact icon', () => {
      const { container } = render(<ErrorDisplay what="Error" compact />);
      const icon = container.querySelector('svg');
      expect(icon?.className).toContain('w-5');
      expect(icon?.className).toContain('h-5');
    });
  });

  describe('actions', () => {
    it('should render Retry button when onRetry is provided', () => {
      render(<ErrorDisplay what="Error" onRetry={vi.fn()} />);
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should call onRetry when Retry button is clicked', () => {
      const onRetry = vi.fn();
      render(<ErrorDisplay what="Error" onRetry={onRetry} />);

      fireEvent.click(screen.getByText('Try Again'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should render Dismiss button when onDismiss is provided', () => {
      render(<ErrorDisplay what="Error" onDismiss={vi.fn()} />);
      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });

    it('should call onDismiss when Dismiss button is clicked', () => {
      const onDismiss = vi.fn();
      render(<ErrorDisplay what="Error" onDismiss={onDismiss} />);

      fireEvent.click(screen.getByText('Dismiss'));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should render custom action buttons', () => {
      const actions = [
        { label: 'Contact Support', onClick: vi.fn() },
        { label: 'View Logs', onClick: vi.fn() },
      ];
      render(<ErrorDisplay what="Error" actions={actions} />);

      expect(screen.getByText('Contact Support')).toBeInTheDocument();
      expect(screen.getByText('View Logs')).toBeInTheDocument();
    });

    it('should call custom action onClick', () => {
      const onClick = vi.fn();
      const actions = [{ label: 'Custom Action', onClick }];
      render(<ErrorDisplay what="Error" actions={actions} />);

      fireEvent.click(screen.getByText('Custom Action'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should apply variant to custom action buttons', () => {
      const actions = [{ label: 'Danger Action', onClick: vi.fn(), variant: 'danger' as const }];
      render(<ErrorDisplay what="Error" actions={actions} />);

      const button = screen.getByText('Danger Action');
      expect(button.className).toContain('bg-red-600');
    });
  });

  describe('technical details', () => {
    it('should render expand button when technicalDetails is provided', () => {
      render(<ErrorDisplay what="Error" technicalDetails="Stack trace here" />);
      expect(screen.getByText('Technical details')).toBeInTheDocument();
    });

    it('should not show technical details by default', () => {
      render(<ErrorDisplay what="Error" technicalDetails="Stack trace here" />);
      expect(screen.queryByText('Stack trace here')).not.toBeInTheDocument();
    });

    it('should show technical details when expanded', () => {
      render(<ErrorDisplay what="Error" technicalDetails="Stack trace here" />);

      fireEvent.click(screen.getByText('Technical details'));
      expect(screen.getByText('Stack trace here')).toBeInTheDocument();
    });

    it('should hide technical details when collapsed', () => {
      render(<ErrorDisplay what="Error" technicalDetails="Stack trace here" />);

      // Expand
      fireEvent.click(screen.getByText('Technical details'));
      expect(screen.getByText('Stack trace here')).toBeInTheDocument();

      // Collapse
      fireEvent.click(screen.getByText('Technical details'));
      expect(screen.queryByText('Stack trace here')).not.toBeInTheDocument();
    });

    it('should render technical details in preformatted text', () => {
      render(<ErrorDisplay what="Error" technicalDetails="Stack trace" />);

      fireEvent.click(screen.getByText('Technical details'));
      const pre = screen.getByText('Stack trace');
      expect(pre.tagName).toBe('PRE');
    });

    it('should have rotate animation on expand icon', () => {
      const { container } = render(
        <ErrorDisplay what="Error" technicalDetails="Stack trace" />
      );

      const expandButton = screen.getByText('Technical details');
      const icon = expandButton.querySelector('svg');
      expect(icon?.className).toContain('transition-transform');

      fireEvent.click(expandButton);
      expect(icon?.className).toContain('rotate-90');
    });
  });

  describe('accessibility', () => {
    it('should have aria-live="assertive" for full display', () => {
      render(<ErrorDisplay what="Error" />);
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
    });

    it('should render WHY with strong label', () => {
      render(<ErrorDisplay what="Error" why="Reason" />);
      expect(screen.getByText('Why:')).toBeInTheDocument();
    });

    it('should render HOW with strong label', () => {
      render(<ErrorDisplay what="Error" how="Solution" />);
      expect(screen.getByText('How to fix:')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have rounded corners', () => {
      render(<ErrorDisplay what="Error" />);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('rounded-lg');
    });

    it('should have border', () => {
      render(<ErrorDisplay what="Error" />);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('border');
    });

    it('should have overflow hidden', () => {
      render(<ErrorDisplay what="Error" />);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('overflow-hidden');
    });
  });

  describe('all severity/mode combinations', () => {
    const severities: Array<'error' | 'warning' | 'info'> = ['error', 'warning', 'info'];

    severities.forEach(severity => {
      it(`should render ${severity} in full mode`, () => {
        render(<ErrorDisplay what="Message" severity={severity} />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      it(`should render ${severity} in compact mode`, () => {
        render(<ErrorDisplay what="Message" severity={severity} compact />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('complex scenarios', () => {
    it('should render all elements together', () => {
      render(
        <ErrorDisplay
          what="Connection Error"
          why="The server is not responding"
          how="Check your internet connection and try again"
          code="ERR_NETWORK"
          severity="error"
          onRetry={vi.fn()}
          onDismiss={vi.fn()}
          actions={[{ label: 'Contact Support', onClick: vi.fn() }]}
          technicalDetails="Error: ECONNREFUSED"
        />
      );

      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText(/The server is not responding/)).toBeInTheDocument();
      expect(screen.getByText(/Check your internet connection/)).toBeInTheDocument();
      expect(screen.getByText('ERR_NETWORK')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Dismiss')).toBeInTheDocument();
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
      expect(screen.getByText('Technical details')).toBeInTheDocument();
    });

    it('should not render action area when no actions provided', () => {
      const { container } = render(<ErrorDisplay what="Error" />);
      // Actions are in a flex container with gap-2
      const flexContainers = container.querySelectorAll('.flex-wrap.gap-2');
      expect(flexContainers.length).toBe(0);
    });
  });
});
