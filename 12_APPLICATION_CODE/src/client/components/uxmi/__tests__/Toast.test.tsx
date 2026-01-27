import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Toast, ToastContainer } from '../Toast';

describe('Toast component', () => {
  let rafCallback: FrameRequestCallback | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    // Mock requestAnimationFrame to capture the callback
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb;
      return 1;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    rafCallback = null;
  });

  // Helper to trigger the animation frame
  const triggerAnimationFrame = () => {
    if (rafCallback) {
      act(() => {
        rafCallback!(performance.now());
      });
    }
  };

  const defaultProps = {
    id: 'test-toast',
    type: 'info' as const,
    title: 'Test Title',
    onDismiss: vi.fn(),
  };

  describe('rendering', () => {
    it('should render with role="alert"', () => {
      render(<Toast {...defaultProps} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have aria-live="polite"', () => {
      render(<Toast {...defaultProps} />);
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('should render title', () => {
      render(<Toast {...defaultProps} title="Important Notice" />);
      expect(screen.getByText('Important Notice')).toBeInTheDocument();
    });

    it('should render message when provided', () => {
      render(<Toast {...defaultProps} message="This is a message" />);
      expect(screen.getByText('This is a message')).toBeInTheDocument();
    });

    it('should not render message when not provided', () => {
      render(<Toast {...defaultProps} />);
      expect(screen.queryByText('This is a message')).not.toBeInTheDocument();
    });
  });

  describe('types', () => {
    it('should apply success styling', () => {
      render(<Toast {...defaultProps} type="success" />);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-green-50');
      expect(alert.className).toContain('border-green-200');
    });

    it('should apply error styling', () => {
      render(<Toast {...defaultProps} type="error" />);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-red-50');
      expect(alert.className).toContain('border-red-200');
    });

    it('should apply warning styling', () => {
      render(<Toast {...defaultProps} type="warning" />);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-yellow-50');
      expect(alert.className).toContain('border-yellow-200');
    });

    it('should apply info styling', () => {
      render(<Toast {...defaultProps} type="info" />);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-blue-50');
      expect(alert.className).toContain('border-blue-200');
    });

    it('should render icon for each type', () => {
      const { container } = render(<Toast {...defaultProps} type="success" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('auto-dismiss', () => {
    it('should auto-dismiss after default duration (5000ms)', () => {
      const onDismiss = vi.fn();
      render(<Toast {...defaultProps} onDismiss={onDismiss} />);

      // Before duration
      act(() => {
        vi.advanceTimersByTime(4999);
      });
      expect(onDismiss).not.toHaveBeenCalled();

      // After duration (5000ms + 200ms animation)
      act(() => {
        vi.advanceTimersByTime(201);
      });
      expect(onDismiss).toHaveBeenCalledWith('test-toast');
    });

    it('should auto-dismiss after custom duration', () => {
      const onDismiss = vi.fn();
      render(<Toast {...defaultProps} duration={2000} onDismiss={onDismiss} />);

      act(() => {
        vi.advanceTimersByTime(2200);
      });
      expect(onDismiss).toHaveBeenCalledWith('test-toast');
    });

    it('should not auto-dismiss when duration is 0 (persistent)', () => {
      const onDismiss = vi.fn();
      render(<Toast {...defaultProps} duration={0} onDismiss={onDismiss} />);

      act(() => {
        vi.advanceTimersByTime(60000); // Wait a long time
      });
      expect(onDismiss).not.toHaveBeenCalled();
    });
  });

  describe('manual dismiss', () => {
    it('should call onDismiss when X button is clicked', () => {
      const onDismiss = vi.fn();
      render(<Toast {...defaultProps} onDismiss={onDismiss} />);

      fireEvent.click(screen.getByLabelText('Dismiss notification'));

      act(() => {
        vi.advanceTimersByTime(200); // Animation duration
      });

      expect(onDismiss).toHaveBeenCalledWith('test-toast');
    });

    it('should have accessible dismiss button', () => {
      render(<Toast {...defaultProps} />);
      expect(screen.getByLabelText('Dismiss notification')).toBeInTheDocument();
    });
  });

  describe('action button', () => {
    it('should render action button when provided', () => {
      const action = { label: 'Undo', onClick: vi.fn() };
      render(<Toast {...defaultProps} action={action} />);

      expect(screen.getByText('Undo')).toBeInTheDocument();
    });

    it('should call action onClick when clicked', () => {
      const onClick = vi.fn();
      const action = { label: 'Undo', onClick };
      render(<Toast {...defaultProps} action={action} />);

      fireEvent.click(screen.getByText('Undo'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not render action button when not provided', () => {
      render(<Toast {...defaultProps} />);
      expect(screen.queryByRole('button', { name: /undo/i })).not.toBeInTheDocument();
    });
  });

  describe('animation', () => {
    it('should start with slide-in animation (translate-x-full opacity-0)', () => {
      render(<Toast {...defaultProps} />);
      const alert = screen.getByRole('alert');
      // Initially not visible
      expect(alert.className).toContain('translate-x-full');
      expect(alert.className).toContain('opacity-0');
    });

    it('should animate in after requestAnimationFrame', () => {
      render(<Toast {...defaultProps} />);

      // Trigger the requestAnimationFrame callback
      triggerAnimationFrame();

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('translate-x-0');
      expect(alert.className).toContain('opacity-100');
    });

    it('should animate out on dismiss', () => {
      const onDismiss = vi.fn();
      render(<Toast {...defaultProps} onDismiss={onDismiss} />);

      // First animate in
      triggerAnimationFrame();

      fireEvent.click(screen.getByLabelText('Dismiss notification'));

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('translate-x-full');
      expect(alert.className).toContain('opacity-0');
    });
  });
});

describe('ToastContainer component', () => {
  const defaultToasts = [
    { id: '1', type: 'success' as const, title: 'Success' },
    { id: '2', type: 'error' as const, title: 'Error' },
  ];

  describe('rendering', () => {
    it('should render all toasts', () => {
      render(<ToastContainer toasts={defaultToasts} onDismiss={vi.fn()} />);
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should have aria-label for notifications', () => {
      const { container } = render(
        <ToastContainer toasts={defaultToasts} onDismiss={vi.fn()} />
      );
      expect(container.querySelector('[aria-label="Notifications"]')).toBeInTheDocument();
    });

    it('should render empty when no toasts', () => {
      const { container } = render(<ToastContainer toasts={[]} onDismiss={vi.fn()} />);
      expect(container.querySelector('[aria-label="Notifications"]')?.children.length).toBe(0);
    });
  });

  describe('positioning', () => {
    it('should apply top-right position (default)', () => {
      const { container } = render(
        <ToastContainer toasts={defaultToasts} onDismiss={vi.fn()} />
      );
      const containerEl = container.querySelector('[aria-label="Notifications"]');
      expect(containerEl?.className).toContain('top-4');
      expect(containerEl?.className).toContain('right-4');
    });

    it('should apply top-left position', () => {
      const { container } = render(
        <ToastContainer toasts={defaultToasts} onDismiss={vi.fn()} position="top-left" />
      );
      const containerEl = container.querySelector('[aria-label="Notifications"]');
      expect(containerEl?.className).toContain('top-4');
      expect(containerEl?.className).toContain('left-4');
    });

    it('should apply bottom-right position', () => {
      const { container } = render(
        <ToastContainer toasts={defaultToasts} onDismiss={vi.fn()} position="bottom-right" />
      );
      const containerEl = container.querySelector('[aria-label="Notifications"]');
      expect(containerEl?.className).toContain('bottom-4');
      expect(containerEl?.className).toContain('right-4');
    });

    it('should apply bottom-left position', () => {
      const { container } = render(
        <ToastContainer toasts={defaultToasts} onDismiss={vi.fn()} position="bottom-left" />
      );
      const containerEl = container.querySelector('[aria-label="Notifications"]');
      expect(containerEl?.className).toContain('bottom-4');
      expect(containerEl?.className).toContain('left-4');
    });
  });

  describe('styling', () => {
    it('should have fixed positioning', () => {
      const { container } = render(
        <ToastContainer toasts={defaultToasts} onDismiss={vi.fn()} />
      );
      const containerEl = container.querySelector('[aria-label="Notifications"]');
      expect(containerEl?.className).toContain('fixed');
    });

    it('should have z-50 for stacking', () => {
      const { container } = render(
        <ToastContainer toasts={defaultToasts} onDismiss={vi.fn()} />
      );
      const containerEl = container.querySelector('[aria-label="Notifications"]');
      expect(containerEl?.className).toContain('z-50');
    });

    it('should have flex column layout', () => {
      const { container } = render(
        <ToastContainer toasts={defaultToasts} onDismiss={vi.fn()} />
      );
      const containerEl = container.querySelector('[aria-label="Notifications"]');
      expect(containerEl?.className).toContain('flex');
      expect(containerEl?.className).toContain('flex-col');
    });

    it('should have gap between toasts', () => {
      const { container } = render(
        <ToastContainer toasts={defaultToasts} onDismiss={vi.fn()} />
      );
      const containerEl = container.querySelector('[aria-label="Notifications"]');
      expect(containerEl?.className).toContain('gap-2');
    });

    it('should have max width', () => {
      const { container } = render(
        <ToastContainer toasts={defaultToasts} onDismiss={vi.fn()} />
      );
      const containerEl = container.querySelector('[aria-label="Notifications"]');
      expect(containerEl?.className).toContain('w-80');
    });
  });

  describe('dismiss handling', () => {
    it('should pass onDismiss to each toast', () => {
      vi.useFakeTimers();
      const onDismiss = vi.fn();
      render(<ToastContainer toasts={defaultToasts} onDismiss={onDismiss} />);

      const dismissButtons = screen.getAllByLabelText('Dismiss notification');
      fireEvent.click(dismissButtons[0]);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(onDismiss).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});
