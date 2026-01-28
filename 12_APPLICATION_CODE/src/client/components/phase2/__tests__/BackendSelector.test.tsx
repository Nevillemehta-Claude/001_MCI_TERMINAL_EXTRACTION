/**
 * BackendSelector Tests
 * Tests for Indian broker backend selection
 * Phase 2: Ignition - Backend Selection
 * 
 * India-market-only compliant: Only 4 Indian brokers supported
 * - Zerodha Kite, ICICI Direct, HDFC Sky, Kotak Neo
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BackendSelector } from '../BackendSelector';
import { useIgnitionStore } from '../../../stores/ignitionStore';

// Mock the ignition store
vi.mock('../../../stores/ignitionStore', () => ({
  useIgnitionStore: vi.fn(),
}));

// Mock the Tooltip component to render children directly
vi.mock('../../uxmi', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockSelectBackend = vi.fn();

const defaultMockState = {
  selectedBackend: null,
  backendConfigs: [
    {
      type: 'zerodha',
      name: 'Zerodha Kite',
      broker: 'Zerodha',
      description: 'Connect via Kite Connect API for NSE/BSE trading.',
      icon: '🪁',
      requiresConfirmation: true,
    },
    {
      type: 'icici',
      name: 'ICICI Direct',
      broker: 'ICICI Securities',
      description: 'Connect via ICICI Direct Breeze API for NSE/BSE trading.',
      icon: '🏦',
      requiresConfirmation: true,
    },
    {
      type: 'hdfc',
      name: 'HDFC Sky',
      broker: 'HDFC Securities',
      description: 'Connect via HDFC Sky API for NSE/BSE trading.',
      icon: '🏛️',
      requiresConfirmation: true,
    },
    {
      type: 'kotak',
      name: 'Kotak Neo',
      broker: 'Kotak Securities',
      description: 'Connect via Kotak Neo Trade API for NSE/BSE trading.',
      icon: '🏢',
      requiresConfirmation: true,
    },
  ],
  selectBackend: mockSelectBackend,
};

describe('BackendSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useIgnitionStore as any).mockReturnValue(defaultMockState as ReturnType<typeof useIgnitionStore>);
  });

  describe('rendering', () => {
    it('should render all 4 Indian broker options', () => {
      render(<BackendSelector />);

      expect(screen.getByText('Zerodha Kite')).toBeInTheDocument();
      expect(screen.getByText('ICICI Direct')).toBeInTheDocument();
      expect(screen.getByText('HDFC Sky')).toBeInTheDocument();
      expect(screen.getByText('Kotak Neo')).toBeInTheDocument();
    });

    it('should render broker icons', () => {
      render(<BackendSelector />);

      expect(screen.getByText('🪁')).toBeInTheDocument();
      expect(screen.getByText('🏦')).toBeInTheDocument();
      expect(screen.getByText('🏛️')).toBeInTheDocument();
      expect(screen.getByText('🏢')).toBeInTheDocument();
    });

    it('should only render Indian broker options (no unsupported brokers)', () => {
      render(<BackendSelector />);

      // Verify only supported Indian brokers are shown
      expect(screen.getByText('Zerodha Kite')).toBeInTheDocument();
      expect(screen.getByText('ICICI Direct')).toBeInTheDocument();
      expect(screen.getByText('HDFC Sky')).toBeInTheDocument();
      expect(screen.getByText('Kotak Neo')).toBeInTheDocument();

      // Verify no unsupported broker options exist (no Alpaca, Polygon, etc.)
      expect(screen.queryByText(/Alpaca/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Polygon/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Interactive Brokers/i)).not.toBeInTheDocument();
    });

    it('should render the header text for Indian broker selection', () => {
      render(<BackendSelector />);

      expect(screen.getByText('Select Indian Broker')).toBeInTheDocument();
      expect(screen.getByText(/NSE\/BSE markets/i)).toBeInTheDocument();
    });

    it('should display broker company names', () => {
      render(<BackendSelector />);

      expect(screen.getByText('Zerodha')).toBeInTheDocument();
      expect(screen.getByText('ICICI Securities')).toBeInTheDocument();
      expect(screen.getByText('HDFC Securities')).toBeInTheDocument();
      expect(screen.getByText('Kotak Securities')).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('should call selectBackend when Zerodha is clicked', async () => {
      render(<BackendSelector />);

      const zerodhaOption = screen.getByText('Zerodha Kite').closest('button');
      await userEvent.click(zerodhaOption!);

      expect(mockSelectBackend).toHaveBeenCalledWith('zerodha');
    });

    it('should call selectBackend when ICICI is clicked', async () => {
      render(<BackendSelector />);

      const iciciOption = screen.getByText('ICICI Direct').closest('button');
      await userEvent.click(iciciOption!);

      expect(mockSelectBackend).toHaveBeenCalledWith('icici');
    });

    it('should call selectBackend when HDFC is clicked', async () => {
      render(<BackendSelector />);

      const hdfcOption = screen.getByText('HDFC Sky').closest('button');
      await userEvent.click(hdfcOption!);

      expect(mockSelectBackend).toHaveBeenCalledWith('hdfc');
    });

    it('should call selectBackend when Kotak is clicked', async () => {
      render(<BackendSelector />);

      const kotakOption = screen.getByText('Kotak Neo').closest('button');
      await userEvent.click(kotakOption!);

      expect(mockSelectBackend).toHaveBeenCalledWith('kotak');
    });

    it('should call onSelect callback when provided', async () => {
      const onSelect = vi.fn();
      render(<BackendSelector onSelect={onSelect} />);

      const zerodhaOption = screen.getByText('Zerodha Kite').closest('button');
      await userEvent.click(zerodhaOption!);

      expect(onSelect).toHaveBeenCalledWith('zerodha');
    });
  });

  describe('selected state', () => {
    it('should highlight selected backend with teal border', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        selectedBackend: 'zerodha',
      } as ReturnType<typeof useIgnitionStore>);

      render(<BackendSelector />);

      const zerodhaOption = screen.getByText('Zerodha Kite').closest('button');
      expect(zerodhaOption).toHaveClass('border-teal-500');
    });

    it('should show checkmark icon for selected backend', () => {
      (useIgnitionStore as any).mockReturnValue({
        ...defaultMockState,
        selectedBackend: 'zerodha',
      } as ReturnType<typeof useIgnitionStore>);

      const { container } = render(<BackendSelector />);

      // Check for the checkmark SVG in the selected broker
      const checkmark = container.querySelector('.bg-teal-500 svg');
      expect(checkmark).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should not call selectBackend when disabled', async () => {
      render(<BackendSelector disabled />);

      const zerodhaOption = screen.getByText('Zerodha Kite').closest('button');
      await userEvent.click(zerodhaOption!);

      expect(mockSelectBackend).not.toHaveBeenCalled();
    });

    it('should show reduced opacity when disabled', () => {
      render(<BackendSelector disabled />);

      const zerodhaOption = screen.getByText('Zerodha Kite').closest('button');
      expect(zerodhaOption).toHaveClass('opacity-50');
    });
  });

  describe('broker descriptions', () => {
    it('should display NSE/BSE in broker descriptions', () => {
      render(<BackendSelector />);

      const descriptions = screen.getAllByText(/NSE\/BSE/i);
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('should indicate API credentials required for all brokers', () => {
      render(<BackendSelector />);

      const credentialIndicators = screen.getAllByText(/Requires API credentials/i);
      expect(credentialIndicators.length).toBe(4); // All 4 brokers require credentials
    });
  });

  describe('market info banner', () => {
    it('should display Indian market trading hours', () => {
      render(<BackendSelector />);

      expect(screen.getByText(/9:15 AM - 3:30 PM IST/i)).toBeInTheDocument();
    });

    it('should display token expiry time (CR-004)', () => {
      render(<BackendSelector />);

      expect(screen.getByText(/6:00 AM IST/i)).toBeInTheDocument();
    });
  });
});
