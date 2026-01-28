import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../ProgressBar';

describe('ProgressBar component', () => {
  describe('rendering', () => {
    it('should render with progressbar role', () => {
      render(<ProgressBar value={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should set aria-valuenow to current value', () => {
      render(<ProgressBar value={75} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
    });

    it('should set aria-valuemin to 0', () => {
      render(<ProgressBar value={50} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemin', '0');
    });

    it('should set aria-valuemax to 100', () => {
      render(<ProgressBar value={50} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('value clamping', () => {
    it('should clamp value below 0 to 0', () => {
      render(<ProgressBar value={-10} showLabel />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should clamp value above 100 to 100', () => {
      render(<ProgressBar value={150} showLabel />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should display exact value within range', () => {
      render(<ProgressBar value={42} showLabel />);
      expect(screen.getByText('42%')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('should apply small size class', () => {
      const { container } = render(<ProgressBar value={50} size="sm" />);
      expect(container.querySelector('.h-1')).toBeInTheDocument();
    });

    it('should apply medium size class (default)', () => {
      const { container } = render(<ProgressBar value={50} />);
      expect(container.querySelector('.h-2')).toBeInTheDocument();
    });

    it('should apply large size class', () => {
      const { container } = render(<ProgressBar value={50} size="lg" />);
      expect(container.querySelector('.h-4')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('should apply default variant (blue)', () => {
      render(<ProgressBar value={50} />);
      const progressbar = screen.getByRole('progressbar');
      const innerBar = progressbar.querySelector('div');
      expect(innerBar?.className).toContain('bg-blue-600');
    });

    it('should apply success variant (green)', () => {
      render(<ProgressBar value={50} variant="success" />);
      const progressbar = screen.getByRole('progressbar');
      const innerBar = progressbar.querySelector('div');
      expect(innerBar?.className).toContain('bg-green-500');
    });

    it('should apply warning variant (yellow)', () => {
      render(<ProgressBar value={50} variant="warning" />);
      const progressbar = screen.getByRole('progressbar');
      const innerBar = progressbar.querySelector('div');
      expect(innerBar?.className).toContain('bg-yellow-500');
    });

    it('should apply error variant (red)', () => {
      render(<ProgressBar value={50} variant="error" />);
      const progressbar = screen.getByRole('progressbar');
      const innerBar = progressbar.querySelector('div');
      expect(innerBar?.className).toContain('bg-red-500');
    });
  });

  describe('track colors', () => {
    it('should have gray track for default variant', () => {
      const { container } = render(<ProgressBar value={50} />);
      const track = container.querySelector('.bg-gray-200');
      expect(track).toBeInTheDocument();
    });

    it('should have colored track matching variant', () => {
      const { container } = render(<ProgressBar value={50} variant="success" />);
      const track = container.querySelector('.bg-green-100');
      expect(track).toBeInTheDocument();
    });
  });

  describe('labels', () => {
    it('should not show label by default', () => {
      render(<ProgressBar value={50} />);
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('should show percentage when showLabel is true', () => {
      render(<ProgressBar value={50} showLabel />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should show custom label when provided', () => {
      render(<ProgressBar value={50} label="Loading data" />);
      expect(screen.getByText('Loading data')).toBeInTheDocument();
    });

    it('should show both custom label and percentage', () => {
      render(<ProgressBar value={50} label="Loading data" showLabel />);
      expect(screen.getByText('Loading data')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should use label as default if only label is provided', () => {
      render(<ProgressBar value={50} label="Custom Progress" />);
      expect(screen.getByText('Custom Progress')).toBeInTheDocument();
    });

    it('should show "Progress" as default label with showLabel', () => {
      render(<ProgressBar value={50} showLabel />);
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    it('should have aria-label with default or custom label', () => {
      render(<ProgressBar value={50} label="Downloading" />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Downloading');
    });
  });

  describe('animation', () => {
    it('should have transition classes when animated (default)', () => {
      const { container } = render(<ProgressBar value={50} />);
      const bar = container.querySelector('.transition-all');
      expect(bar).toBeInTheDocument();
    });

    it('should not have transition classes when animated is false', () => {
      render(<ProgressBar value={50} animated={false} />);
      const progressbar = screen.getByRole('progressbar');
      const bars = progressbar.querySelectorAll('div');
      // The inner bar should not have transition classes
      const innerBar = bars[0];
      expect(innerBar?.className).not.toContain('transition-all');
    });
  });

  describe('striped mode', () => {
    it('should apply striped pattern when striped is true', () => {
      render(<ProgressBar value={50} striped />);
      // Striped pattern is applied via inline style with background-size
      const progressbar = screen.getByRole('progressbar');
      const innerBar = progressbar.querySelector('div');
      // JSDOM may not fully serialize backgroundImage, but background-size is unique to striped mode
      expect(innerBar?.getAttribute('style')).toContain('background-size: 1rem 1rem');
    });

    it('should have animate-stripes class when striped and animated', () => {
      render(<ProgressBar value={50} striped animated />);
      const progressbar = screen.getByRole('progressbar');
      const innerBar = progressbar.querySelector('div');
      expect(innerBar?.className).toContain('animate-stripes');
    });
  });

  describe('indeterminate mode', () => {
    it('should have indeterminate animation class', () => {
      render(<ProgressBar value={50} indeterminate />);
      const progressbar = screen.getByRole('progressbar');
      const bars = progressbar.querySelectorAll('div');
      const innerBar = bars[0];
      expect(innerBar?.className).toContain('animate-indeterminate');
    });

    it('should set width to 30% in indeterminate mode', () => {
      render(<ProgressBar value={80} indeterminate />);
      const progressbar = screen.getByRole('progressbar');
      const bars = progressbar.querySelectorAll('div');
      const innerBar = bars[0];
      expect(innerBar?.getAttribute('style')).toContain('width: 30%');
    });

    it('should not show percentage in indeterminate mode', () => {
      render(<ProgressBar value={50} showLabel indeterminate />);
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('should not have aria-valuenow in indeterminate mode', () => {
      render(<ProgressBar value={50} indeterminate />);
      expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
    });
  });

  describe('width calculation', () => {
    it('should set width to 0% for value 0', () => {
      render(<ProgressBar value={0} />);
      const progressbar = screen.getByRole('progressbar');
      const bars = progressbar.querySelectorAll('div');
      const innerBar = bars[0];
      expect(innerBar?.getAttribute('style')).toContain('width: 0%');
    });

    it('should set width to 100% for value 100', () => {
      render(<ProgressBar value={100} />);
      const progressbar = screen.getByRole('progressbar');
      const bars = progressbar.querySelectorAll('div');
      const innerBar = bars[0];
      expect(innerBar?.getAttribute('style')).toContain('width: 100%');
    });
  });

  describe('all size/variant combinations', () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
    const variants: Array<'default' | 'success' | 'warning' | 'error'> = [
      'default',
      'success',
      'warning',
      'error',
    ];

    sizes.forEach(size => {
      variants.forEach(variant => {
        it(`should render correctly with size=${size} and variant=${variant}`, () => {
          render(<ProgressBar value={50} size={size} variant={variant} />);
          expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
      });
    });
  });
});
