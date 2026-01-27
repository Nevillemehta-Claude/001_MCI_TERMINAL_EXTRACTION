import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ScanCheckItem } from '../ScanCheckItem';
import type { ScanCheck } from '../../../stores/scannerStore';

describe('ScanCheckItem component', () => {
  const baseCheck: ScanCheck = {
    id: 'test-check',
    name: 'Test Check',
    description: 'A test check description',
    category: 'connection',
    status: 'pending',
    critical: false,
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('should render check name', () => {
      render(<ScanCheckItem check={baseCheck} />);
      expect(screen.getByText('Test Check')).toBeInTheDocument();
    });

    it('should render check description when showDetails is true', () => {
      render(<ScanCheckItem check={baseCheck} showDetails />);
      expect(screen.getByText('A test check description')).toBeInTheDocument();
    });

    it('should not render description when showDetails is false', () => {
      render(<ScanCheckItem check={baseCheck} showDetails={false} />);
      expect(screen.queryByText('A test check description')).not.toBeInTheDocument();
    });

    it('should render category badge', () => {
      render(<ScanCheckItem check={baseCheck} />);
      expect(screen.getByText('connection')).toBeInTheDocument();
    });

    it('should render duration when provided', () => {
      render(<ScanCheckItem check={{ ...baseCheck, duration: 150 }} />);
      expect(screen.getByText('150ms')).toBeInTheDocument();
    });

    it('should not render duration when not provided', () => {
      render(<ScanCheckItem check={baseCheck} />);
      expect(screen.queryByText('ms')).not.toBeInTheDocument();
    });

    it('should render message when provided', () => {
      render(<ScanCheckItem check={{ ...baseCheck, message: 'Check successful' }} />);
      expect(screen.getByText('Check successful')).toBeInTheDocument();
    });
  });

  describe('status icons', () => {
    it('should render pending status with circle icon', () => {
      const { container } = render(<ScanCheckItem check={{ ...baseCheck, status: 'pending' }} />);
      expect(container.querySelector('.rounded-full.border-gray-300')).toBeInTheDocument();
    });

    it('should render running status with spinner', () => {
      render(<ScanCheckItem check={{ ...baseCheck, status: 'running' }} />);
      // Spinner has role="status"
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render passed status with green checkmark', () => {
      const { container } = render(<ScanCheckItem check={{ ...baseCheck, status: 'passed' }} />);
      expect(container.querySelector('.text-green-500')).toBeInTheDocument();
    });

    it('should render failed status with red X', () => {
      const { container } = render(<ScanCheckItem check={{ ...baseCheck, status: 'failed' }} />);
      expect(container.querySelector('.text-red-500')).toBeInTheDocument();
    });

    it('should render warning status with yellow warning icon', () => {
      const { container } = render(<ScanCheckItem check={{ ...baseCheck, status: 'warning' }} />);
      expect(container.querySelector('.text-yellow-500')).toBeInTheDocument();
    });

    it('should render skipped status with gray icon', () => {
      const { container } = render(<ScanCheckItem check={{ ...baseCheck, status: 'skipped' }} />);
      expect(container.querySelector('.text-gray-400')).toBeInTheDocument();
    });
  });

  describe('background colors', () => {
    it('should apply gray background for pending', () => {
      const { container } = render(<ScanCheckItem check={{ ...baseCheck, status: 'pending' }} />);
      expect(container.querySelector('.bg-gray-50')).toBeInTheDocument();
    });

    it('should apply blue background for running', () => {
      const { container } = render(<ScanCheckItem check={{ ...baseCheck, status: 'running' }} />);
      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
    });

    it('should apply green background for passed', () => {
      const { container } = render(<ScanCheckItem check={{ ...baseCheck, status: 'passed' }} />);
      expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
    });

    it('should apply red background for failed', () => {
      const { container } = render(<ScanCheckItem check={{ ...baseCheck, status: 'failed' }} />);
      expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
    });

    it('should apply yellow background for warning', () => {
      const { container } = render(<ScanCheckItem check={{ ...baseCheck, status: 'warning' }} />);
      expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
    });

    it('should apply gray background for skipped', () => {
      const { container } = render(<ScanCheckItem check={{ ...baseCheck, status: 'skipped' }} />);
      expect(container.querySelector('.bg-gray-100')).toBeInTheDocument();
    });
  });

  describe('critical indicator', () => {
    it('should show CRITICAL badge for critical checks', () => {
      render(<ScanCheckItem check={{ ...baseCheck, critical: true }} />);
      expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    });

    it('should not show CRITICAL badge for non-critical checks', () => {
      render(<ScanCheckItem check={{ ...baseCheck, critical: false }} />);
      expect(screen.queryByText('CRITICAL')).not.toBeInTheDocument();
    });

    it('should have tooltip on CRITICAL badge', async () => {
      render(<ScanCheckItem check={{ ...baseCheck, critical: true }} />);

      // The tooltip wrapper should exist
      const criticalBadge = screen.getByText('CRITICAL');
      expect(criticalBadge).toBeInTheDocument();
    });
  });

  describe('running state styling', () => {
    it('should apply ring styling when running', () => {
      const { container } = render(<ScanCheckItem check={{ ...baseCheck, status: 'running' }} />);
      const wrapper = container.querySelector('.rounded-lg');
      expect(wrapper?.className).toContain('ring-2');
      expect(wrapper?.className).toContain('ring-blue-200');
    });

    it('should not apply ring styling when not running', () => {
      const { container } = render(<ScanCheckItem check={{ ...baseCheck, status: 'pending' }} />);
      const wrapper = container.querySelector('.rounded-lg');
      expect(wrapper?.className).not.toContain('ring-2');
    });
  });

  describe('category colors', () => {
    it('should apply purple for connection category', () => {
      const { container } = render(
        <ScanCheckItem check={{ ...baseCheck, category: 'connection' }} />
      );
      expect(container.querySelector('.text-purple-600')).toBeInTheDocument();
    });

    it('should apply indigo for auth category', () => {
      const { container } = render(<ScanCheckItem check={{ ...baseCheck, category: 'auth' }} />);
      expect(container.querySelector('.text-indigo-600')).toBeInTheDocument();
    });

    it('should apply cyan for market category', () => {
      const { container } = render(
        <ScanCheckItem check={{ ...baseCheck, category: 'market' }} />
      );
      expect(container.querySelector('.text-cyan-600')).toBeInTheDocument();
    });

    it('should apply orange for system category', () => {
      const { container } = render(
        <ScanCheckItem check={{ ...baseCheck, category: 'system' }} />
      );
      expect(container.querySelector('.text-orange-600')).toBeInTheDocument();
    });

    it('should apply pink for config category', () => {
      const { container } = render(
        <ScanCheckItem check={{ ...baseCheck, category: 'config' }} />
      );
      expect(container.querySelector('.text-pink-600')).toBeInTheDocument();
    });
  });

  describe('message color based on status', () => {
    it('should apply red color for failed message', () => {
      const { container } = render(
        <ScanCheckItem check={{ ...baseCheck, status: 'failed', message: 'Error occurred' }} />
      );
      expect(container.querySelector('.text-red-600')).toBeInTheDocument();
    });

    it('should apply yellow color for warning message', () => {
      const { container } = render(
        <ScanCheckItem check={{ ...baseCheck, status: 'warning', message: 'Caution' }} />
      );
      expect(container.querySelector('.text-yellow-600')).toBeInTheDocument();
    });

    it('should apply gray color for other status messages', () => {
      const { container } = render(
        <ScanCheckItem check={{ ...baseCheck, status: 'passed', message: 'Success' }} />
      );
      expect(container.querySelector('.text-gray-600')).toBeInTheDocument();
    });
  });

  describe('all status types', () => {
    const statuses: ScanCheck['status'][] = ['pending', 'running', 'passed', 'failed', 'warning', 'skipped'];

    statuses.forEach(status => {
      it(`should render correctly with status=${status}`, () => {
        const { container } = render(<ScanCheckItem check={{ ...baseCheck, status }} />);
        expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
      });
    });
  });

  describe('all category types', () => {
    const categories: ScanCheck['category'][] = ['connection', 'auth', 'market', 'system', 'config'];

    categories.forEach(category => {
      it(`should render correctly with category=${category}`, () => {
        render(<ScanCheckItem check={{ ...baseCheck, category }} />);
        expect(screen.getByText(category)).toBeInTheDocument();
      });
    });
  });
});
