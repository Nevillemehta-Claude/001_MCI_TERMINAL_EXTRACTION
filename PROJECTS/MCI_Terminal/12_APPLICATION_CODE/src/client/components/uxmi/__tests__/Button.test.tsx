import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button component', () => {
  describe('rendering', () => {
    it('should render children correctly', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('should apply default variant (primary)', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-blue-600');
    });

    it('should apply secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-gray-200');
    });

    it('should apply danger variant', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-red-600');
    });

    it('should apply success variant', () => {
      render(<Button variant="success">Success</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-green-600');
    });
  });

  describe('sizes', () => {
    it('should apply small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('px-3');
      expect(button.className).toContain('text-sm');
    });

    it('should apply medium size (default)', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('px-4');
      expect(button.className).toContain('text-base');
    });

    it('should apply large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('px-6');
      expect(button.className).toContain('text-lg');
    });
  });

  describe('states', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be disabled when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show loading spinner and text when loading', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getAllByText('Loading...').length).toBeGreaterThanOrEqual(1);
    });

    it('should set aria-busy when loading', () => {
      render(<Button loading>Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('icons', () => {
    it('should render left icon', () => {
      render(
        <Button leftIcon={<span data-testid="left-icon">L</span>}>
          With Icon
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('should render right icon', () => {
      render(
        <Button rightIcon={<span data-testid="right-icon">R</span>}>
          With Icon
        </Button>
      );
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('should not render icons when loading', () => {
      render(
        <Button
          loading
          leftIcon={<span data-testid="left-icon">L</span>}
          rightIcon={<span data-testid="right-icon">R</span>}
        >
          Loading
        </Button>
      );
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} loading>
          Click me
        </Button>
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('tooltip', () => {
    it('should show tooltip when tooltip prop is provided', async () => {
      const user = userEvent.setup();
      render(<Button tooltip="Click to submit">Submit</Button>);
      const button = screen.getByRole('button');
      
      await user.hover(button);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
      expect(screen.getByRole('tooltip')).toHaveTextContent('Click to submit');
    });

    it('should not show tooltip when button is disabled', async () => {
      const user = userEvent.setup();
      render(<Button tooltip="Click to submit" disabled>Submit</Button>);
      const button = screen.getByRole('button');
      
      await user.hover(button);
      
      // Tooltip should not appear for disabled buttons
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('should not show tooltip when button is loading', async () => {
      const user = userEvent.setup();
      render(<Button tooltip="Click to submit" loading>Submit</Button>);
      const button = screen.getByRole('button');
      
      await user.hover(button);
      
      // Tooltip should not appear for loading buttons
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should be focusable', async () => {
      const user = userEvent.setup();
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      await user.click(button);
      expect(button).toHaveFocus();
    });

    it('should have focus ring class', () => {
      render(<Button>Focus Ring</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('focus:ring-2');
    });

    it('should support custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });

    it('should pass through native button attributes', () => {
      render(
        <Button type="submit" name="submit-btn">
          Submit
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('name', 'submit-btn');
    });
  });

  describe('CR-005 UXMI compliance', () => {
    it('should have transition classes for hover state', () => {
      render(<Button>Hover</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('transition-all');
      expect(button.className).toContain('duration-150');
    });

    it('should have active state scale transform', () => {
      render(<Button>Active</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('active:scale-[0.98]');
    });

    it('should have disabled state opacity', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('disabled:opacity-50');
    });
  });
});
