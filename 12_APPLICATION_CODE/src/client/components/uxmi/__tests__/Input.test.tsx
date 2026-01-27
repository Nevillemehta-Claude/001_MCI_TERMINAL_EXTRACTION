import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input component', () => {
  describe('rendering', () => {
    it('should render input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Input label="Email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter email" />);
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });

    it('should render with hint text', () => {
      render(<Input hint="This is a hint" />);
      expect(screen.getByText('This is a hint')).toBeInTheDocument();
    });

    it('should not show hint when error is present', () => {
      render(<Input hint="This is a hint" error="This is an error" />);
      expect(screen.queryByText('This is a hint')).not.toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('should apply small size', () => {
      render(<Input size="sm" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('h-8');
      expect(input.className).toContain('text-sm');
    });

    it('should apply medium size (default)', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('h-10');
      expect(input.className).toContain('text-base');
    });

    it('should apply large size', () => {
      render(<Input size="lg" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('h-12');
      expect(input.className).toContain('text-lg');
    });
  });

  describe('variants', () => {
    it('should apply default variant', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('bg-white');
    });

    it('should apply filled variant', () => {
      render(<Input variant="filled" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('bg-gray-100');
    });
  });

  describe('states', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should be disabled when loading', () => {
      render(<Input isLoading />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should show error message', () => {
      render(<Input error="Invalid email" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
    });

    it('should have error styling when error is present', () => {
      render(<Input error="Error" />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('border-red-500');
    });
  });

  describe('icons', () => {
    it('should render left icon', () => {
      render(<Input leftIcon={<span data-testid="left-icon">L</span>} />);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('should render right icon', () => {
      render(<Input rightIcon={<span data-testid="right-icon">R</span>} />);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('should show spinner instead of right icon when loading', () => {
      render(<Input isLoading rightIcon={<span data-testid="right-icon">R</span>} />);
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
      // Spinner is an SVG with animate-spin class
      const container = document.querySelector('.animate-spin');
      expect(container).toBeInTheDocument();
    });

    it('should add padding for left icon', () => {
      render(<Input leftIcon={<span>L</span>} />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('pl-10');
    });

    it('should add padding for right icon', () => {
      render(<Input rightIcon={<span>R</span>} />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('pr-10');
    });
  });

  describe('interactions', () => {
    it('should call onChange when value changes', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onFocus when focused', () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);

      fireEvent.focus(screen.getByRole('textbox'));
      expect(handleFocus).toHaveBeenCalled();
    });

    it('should call onBlur when blurred', () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper label association', () => {
      render(<Input label="Username" />);
      const input = screen.getByLabelText('Username');
      expect(input).toBeInTheDocument();
    });

    it('should set aria-invalid when error is present', () => {
      render(<Input error="Error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby for error', () => {
      render(<Input error="Error message" id="test-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
    });

    it('should have aria-describedby for hint', () => {
      render(<Input hint="Hint text" id="test-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-hint');
    });

    it('should be focusable', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      input.focus();
      expect(document.activeElement).toBe(input);
    });
  });

  describe('CR-005 UXMI compliance', () => {
    it('should have transition classes', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('transition-all');
      expect(input.className).toContain('duration-150');
    });

    it('should have rounded corners', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('rounded-md');
    });

    it('should have border', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('border');
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('custom id', () => {
    it('should use provided id', () => {
      render(<Input id="custom-id" label="Custom" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('should generate id when not provided', () => {
      render(<Input label="Generated" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id');
    });
  });
});
