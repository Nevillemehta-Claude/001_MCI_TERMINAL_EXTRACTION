import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from '../Spinner';

describe('Spinner component', () => {
  describe('rendering', () => {
    it('should render with default props', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-live attribute for accessibility', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });

    it('should render SVG element', () => {
      const { container } = render(<Spinner />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should have animate-spin class for rotation', () => {
      const { container } = render(<Spinner />);
      const svg = container.querySelector('svg');
      expect(svg?.className).toContain('animate-spin');
    });

    it('should have aria-hidden on SVG', () => {
      const { container } = render(<Spinner />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('sizes', () => {
    it('should apply small size classes', () => {
      const { container } = render(<Spinner size="sm" />);
      const svg = container.querySelector('svg');
      expect(svg?.className).toContain('w-4');
      expect(svg?.className).toContain('h-4');
    });

    it('should apply medium size classes (default)', () => {
      const { container } = render(<Spinner />);
      const svg = container.querySelector('svg');
      expect(svg?.className).toContain('w-6');
      expect(svg?.className).toContain('h-6');
    });

    it('should apply large size classes', () => {
      const { container } = render(<Spinner size="lg" />);
      const svg = container.querySelector('svg');
      expect(svg?.className).toContain('w-8');
      expect(svg?.className).toContain('h-8');
    });
  });

  describe('colors', () => {
    it('should apply primary color (default)', () => {
      const { container } = render(<Spinner />);
      const svg = container.querySelector('svg');
      expect(svg?.className).toContain('text-blue-600');
    });

    it('should apply white color', () => {
      const { container } = render(<Spinner color="white" />);
      const svg = container.querySelector('svg');
      expect(svg?.className).toContain('text-white');
    });

    it('should apply gray color', () => {
      const { container } = render(<Spinner color="gray" />);
      const svg = container.querySelector('svg');
      expect(svg?.className).toContain('text-gray-400');
    });
  });

  describe('label', () => {
    it('should not display visible label when not provided', () => {
      const { container } = render(<Spinner />);
      // Should only have sr-only span, no visible label span
      const visibleLabels = container.querySelectorAll('span:not(.sr-only)');
      expect(visibleLabels.length).toBe(0);
    });

    it('should display visible label when provided', () => {
      const { container } = render(<Spinner label="Please wait" />);
      // Find the non-sr-only span
      const visibleLabel = container.querySelector('span:not(.sr-only)');
      expect(visibleLabel).toBeInTheDocument();
      expect(visibleLabel?.textContent).toBe('Please wait');
    });

    it('should have sr-only text for screen readers with default text', () => {
      render(<Spinner />);
      expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });

    it('should have sr-only text matching label when provided', () => {
      render(<Spinner label="Custom loading" />);
      const srTexts = screen.getAllByText('Custom loading');
      expect(srTexts.some(el => el.classList.contains('sr-only'))).toBe(true);
    });

    it('should apply color class to label text', () => {
      const { container } = render(<Spinner label="Loading" color="primary" />);
      // Find the visible (non-sr-only) span with the label
      const visibleLabel = container.querySelector('span:not(.sr-only)');
      expect(visibleLabel?.className).toContain('text-blue-600');
    });
  });

  describe('SVG structure', () => {
    it('should have circle element', () => {
      const { container } = render(<Spinner />);
      expect(container.querySelector('circle')).toBeInTheDocument();
    });

    it('should have path element', () => {
      const { container } = render(<Spinner />);
      expect(container.querySelector('path')).toBeInTheDocument();
    });

    it('should have correct viewBox', () => {
      const { container } = render(<Spinner />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });
  });

  describe('all size/color combinations', () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
    const colors: Array<'primary' | 'white' | 'gray'> = ['primary', 'white', 'gray'];

    sizes.forEach(size => {
      colors.forEach(color => {
        it(`should render correctly with size=${size} and color=${color}`, () => {
          const { container } = render(<Spinner size={size} color={color} />);
          const svg = container.querySelector('svg');
          expect(svg).toBeInTheDocument();
          expect(svg?.className).toContain('animate-spin');
        });
      });
    });
  });
});
