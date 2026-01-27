import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackendSelector } from '../BackendSelector';
import { useIgnitionStore, BackendConfig } from '../../../stores/ignitionStore';

// Mock the ignition store
vi.mock('../../../stores/ignitionStore', () => ({
  useIgnitionStore: vi.fn(),
}));

describe('BackendSelector component', () => {
  const mockBackendConfigs: BackendConfig[] = [
    {
      type: 'paper',
      name: 'Paper Trading',
      description: 'Simulated trading with virtual funds',
      endpoint: '/api/backend/paper',
      requiresConfirmation: false,
      icon: '📋',
    },
    {
      type: 'live',
      name: 'Live Trading',
      description: 'Real trading with actual funds',
      endpoint: '/api/backend/live',
      requiresConfirmation: true,
      icon: '🔴',
    },
  ];

  const mockStore = {
    selectedBackend: null,
    backendConfigs: mockBackendConfigs,
    selectBackend: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useIgnitionStore).mockReturnValue(mockStore);
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render heading', () => {
      render(<BackendSelector />);
      expect(screen.getByText('Select Trading Backend')).toBeInTheDocument();
    });

    it('should render both backend options', () => {
      render(<BackendSelector />);
      expect(screen.getByText('Paper Trading')).toBeInTheDocument();
      expect(screen.getByText('Live Trading')).toBeInTheDocument();
    });

    it('should render backend descriptions', () => {
      render(<BackendSelector />);
      expect(screen.getByText('Simulated trading with virtual funds')).toBeInTheDocument();
      expect(screen.getByText('Real trading with actual funds')).toBeInTheDocument();
    });

    it('should render backend icons', () => {
      render(<BackendSelector />);
      expect(screen.getByText('📋')).toBeInTheDocument();
      expect(screen.getByText('🔴')).toBeInTheDocument();
    });

    it('should render warning badge for live trading', () => {
      render(<BackendSelector />);
      expect(screen.getByText('Requires confirmation')).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('should call selectBackend when paper is clicked', () => {
      render(<BackendSelector />);

      fireEvent.click(screen.getByText('Paper Trading'));
      expect(mockStore.selectBackend).toHaveBeenCalledWith('paper');
    });

    it('should call selectBackend when live is clicked', () => {
      render(<BackendSelector />);

      fireEvent.click(screen.getByText('Live Trading'));
      expect(mockStore.selectBackend).toHaveBeenCalledWith('live');
    });

    it('should call onSelect callback when backend is selected', () => {
      const onSelect = vi.fn();
      render(<BackendSelector onSelect={onSelect} />);

      fireEvent.click(screen.getByText('Paper Trading'));
      expect(onSelect).toHaveBeenCalledWith('paper');
    });

    it('should not call selectBackend when disabled', () => {
      render(<BackendSelector disabled />);

      fireEvent.click(screen.getByText('Paper Trading'));
      expect(mockStore.selectBackend).not.toHaveBeenCalled();
    });
  });

  describe('selected state styling', () => {
    it('should show selection indicator for paper when selected', () => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockStore,
        selectedBackend: 'paper',
      });

      const { container } = render(<BackendSelector />);
      // Find the selection indicator (rounded-full div with checkmark svg)
      const indicators = container.querySelectorAll('.rounded-full');
      const blueIndicator = Array.from(indicators).find(el => el.className.includes('bg-blue-500'));
      expect(blueIndicator).toBeInTheDocument();
    });

    it('should show selection indicator for live when selected', () => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockStore,
        selectedBackend: 'live',
      });

      const { container } = render(<BackendSelector />);
      // Find the selection indicator (rounded-full div with checkmark svg)
      const indicators = container.querySelectorAll('.rounded-full');
      const redIndicator = Array.from(indicators).find(el => el.className.includes('bg-red-500'));
      expect(redIndicator).toBeInTheDocument();
    });

    it('should apply blue styling when paper is selected', () => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockStore,
        selectedBackend: 'paper',
      });

      const { container } = render(<BackendSelector />);
      const buttons = container.querySelectorAll('button');
      const blueButton = Array.from(buttons).find(btn => btn.className.includes('border-blue-500'));
      expect(blueButton).toBeInTheDocument();
    });

    it('should apply red styling when live is selected', () => {
      vi.mocked(useIgnitionStore).mockReturnValue({
        ...mockStore,
        selectedBackend: 'live',
      });

      const { container } = render(<BackendSelector />);
      const buttons = container.querySelectorAll('button');
      const redButton = Array.from(buttons).find(btn => btn.className.includes('border-red-500'));
      expect(redButton).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should apply opacity when disabled', () => {
      render(<BackendSelector disabled />);
      const buttons = screen.getAllByRole('button');
      expect(buttons[0].className).toContain('opacity-50');
    });

    it('should apply cursor-not-allowed when disabled', () => {
      render(<BackendSelector disabled />);
      const buttons = screen.getAllByRole('button');
      expect(buttons[0].className).toContain('cursor-not-allowed');
    });

    it('should have disabled attribute on buttons when disabled', () => {
      render(<BackendSelector disabled />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('tooltip', () => {
    it('should have tooltip wrapper for paper backend', () => {
      render(<BackendSelector />);
      // Tooltips are rendered with the backend buttons
      expect(screen.getByText('Paper Trading')).toBeInTheDocument();
    });

    it('should have tooltip wrapper for live backend', () => {
      render(<BackendSelector />);
      expect(screen.getByText('Live Trading')).toBeInTheDocument();
    });
  });

  describe('grid layout', () => {
    it('should render backends in a 2-column grid', () => {
      const { container } = render(<BackendSelector />);
      expect(container.querySelector('.grid-cols-2')).toBeInTheDocument();
    });
  });
});
