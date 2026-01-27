import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TokenCaptureForm } from '../TokenCaptureForm';
import { useTokenStore } from '../../../stores/tokenStore';

// Mock the token store
vi.mock('../../../stores/tokenStore', () => ({
  useTokenStore: vi.fn(),
}));

describe('TokenCaptureForm component', () => {
  const mockStore = {
    setAlpacaCredentials: vi.fn(),
    setPolygonKey: vi.fn(),
    validateTokens: vi.fn(),
    isCapturing: false,
    captureError: null,
    setCaptureError: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useTokenStore).mockReturnValue(mockStore);
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render form with heading', () => {
      render(<TokenCaptureForm />);
      expect(screen.getByText('Token Capture')).toBeInTheDocument();
    });

    it('should render description text', () => {
      render(<TokenCaptureForm />);
      expect(
        screen.getByText(/Enter your API credentials to initialize the trading system/)
      ).toBeInTheDocument();
    });

    it('should render Alpaca API Key input', () => {
      render(<TokenCaptureForm />);
      expect(screen.getByLabelText(/Alpaca API Key/)).toBeInTheDocument();
    });

    it('should render Alpaca Secret Key input', () => {
      render(<TokenCaptureForm />);
      expect(screen.getByLabelText(/Alpaca Secret Key/)).toBeInTheDocument();
    });

    it('should render Polygon API Key input', () => {
      render(<TokenCaptureForm />);
      expect(screen.getByLabelText(/Polygon API Key/)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<TokenCaptureForm />);
      expect(screen.getByRole('button', { name: /Capture Tokens/i })).toBeInTheDocument();
    });

    it('should not render cancel button when onCancel is not provided', () => {
      render(<TokenCaptureForm />);
      expect(screen.queryByRole('button', { name: /Cancel/i })).not.toBeInTheDocument();
    });

    it('should render cancel button when onCancel is provided', () => {
      render(<TokenCaptureForm onCancel={vi.fn()} />);
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('should render security notice', () => {
      render(<TokenCaptureForm />);
      expect(
        screen.getByText(/Your credentials are encrypted and stored securely/)
      ).toBeInTheDocument();
    });
  });

  describe('password visibility toggle', () => {
    it('should have password inputs hidden by default', () => {
      render(<TokenCaptureForm />);
      const alpacaKeyInput = screen.getByLabelText(/Alpaca API Key/);
      const alpacaSecretInput = screen.getByLabelText(/Alpaca Secret Key/);
      const polygonKeyInput = screen.getByLabelText(/Polygon API Key/);

      expect(alpacaKeyInput).toHaveAttribute('type', 'password');
      expect(alpacaSecretInput).toHaveAttribute('type', 'password');
      expect(polygonKeyInput).toHaveAttribute('type', 'password');
    });

    it('should toggle Alpaca Key visibility', async () => {
      render(<TokenCaptureForm />);
      const toggleButton = screen.getByLabelText('Show API key');
      const input = screen.getByLabelText(/Alpaca API Key/);

      expect(input).toHaveAttribute('type', 'password');

      fireEvent.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');

      fireEvent.click(screen.getByLabelText('Hide API key'));
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should toggle Secret Key visibility', async () => {
      render(<TokenCaptureForm />);
      const toggleButton = screen.getByLabelText('Show secret');
      const input = screen.getByLabelText(/Alpaca Secret Key/);

      expect(input).toHaveAttribute('type', 'password');

      fireEvent.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');
    });
  });

  describe('field validation', () => {
    it('should show error when Alpaca API Key is empty on blur', async () => {
      render(<TokenCaptureForm />);
      const input = screen.getByLabelText(/Alpaca API Key/);

      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Alpaca API Key is required')).toBeInTheDocument();
      });
    });

    it('should show error when Alpaca API Key is too short', async () => {
      render(<TokenCaptureForm />);
      const input = screen.getByLabelText(/Alpaca API Key/);

      fireEvent.change(input, { target: { value: 'ABC' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('API Key appears too short')).toBeInTheDocument();
      });
    });

    it('should show error when Alpaca API Key has invalid characters', async () => {
      render(<TokenCaptureForm />);
      const input = screen.getByLabelText(/Alpaca API Key/);

      fireEvent.change(input, { target: { value: 'INVALID@KEY#123456' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('API Key contains invalid characters')).toBeInTheDocument();
      });
    });

    it('should show error when Alpaca Secret Key is empty on blur', async () => {
      render(<TokenCaptureForm />);
      const input = screen.getByLabelText(/Alpaca Secret Key/);

      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Alpaca Secret Key is required')).toBeInTheDocument();
      });
    });

    it('should show error when Alpaca Secret Key is too short', async () => {
      render(<TokenCaptureForm />);
      const input = screen.getByLabelText(/Alpaca Secret Key/);

      fireEvent.change(input, { target: { value: 'short' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Secret Key appears too short')).toBeInTheDocument();
      });
    });

    it('should show error when Polygon Key is provided but too short', async () => {
      render(<TokenCaptureForm />);
      const input = screen.getByLabelText(/Polygon API Key/);

      fireEvent.change(input, { target: { value: 'short' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Polygon Key appears too short')).toBeInTheDocument();
      });
    });

    it('should not show error when Polygon Key is empty (optional)', async () => {
      render(<TokenCaptureForm />);
      const input = screen.getByLabelText(/Polygon API Key/);

      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByText(/Polygon Key/)).not.toBeInTheDocument();
      });
    });

    it('should clear error when typing in field', async () => {
      render(<TokenCaptureForm />);
      const input = screen.getByLabelText(/Alpaca API Key/);

      // Trigger error
      fireEvent.blur(input);
      await waitFor(() => {
        expect(screen.getByText('Alpaca API Key is required')).toBeInTheDocument();
      });

      // Type in field - should clear error
      fireEvent.change(input, { target: { value: 'ABC' } });
      await waitFor(() => {
        expect(screen.queryByText('Alpaca API Key is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('form submission', () => {
    it('should prevent submission when required fields are empty', async () => {
      const user = userEvent.setup();
      render(<TokenCaptureForm />);

      await user.click(screen.getByRole('button', { name: /Capture Tokens/i }));

      await waitFor(() => {
        expect(screen.getByText('Alpaca API Key is required')).toBeInTheDocument();
        expect(screen.getByText('Alpaca Secret Key is required')).toBeInTheDocument();
      });

      expect(mockStore.setAlpacaCredentials).not.toHaveBeenCalled();
    });

    it('should call store methods when form is valid', async () => {
      const user = userEvent.setup();
      mockStore.validateTokens.mockResolvedValue(true);

      render(<TokenCaptureForm />);

      await user.type(screen.getByLabelText(/Alpaca API Key/), 'PKABCDEFGHIJ123456');
      await user.type(screen.getByLabelText(/Alpaca Secret Key/), 'SKABCDEFGHIJ1234567890ABCD');

      await user.click(screen.getByRole('button', { name: /Capture Tokens/i }));

      await waitFor(() => {
        expect(mockStore.setAlpacaCredentials).toHaveBeenCalledWith(
          'PKABCDEFGHIJ123456',
          'SKABCDEFGHIJ1234567890ABCD'
        );
      });
    });

    it('should call setPolygonKey when polygon key is provided', async () => {
      const user = userEvent.setup();
      mockStore.validateTokens.mockResolvedValue(true);

      render(<TokenCaptureForm />);

      await user.type(screen.getByLabelText(/Alpaca API Key/), 'PKABCDEFGHIJ123456');
      await user.type(screen.getByLabelText(/Alpaca Secret Key/), 'SKABCDEFGHIJ1234567890ABCD');
      await user.type(screen.getByLabelText(/Polygon API Key/), 'POLYGONKEY12345');

      await user.click(screen.getByRole('button', { name: /Capture Tokens/i }));

      await waitFor(() => {
        expect(mockStore.setPolygonKey).toHaveBeenCalledWith('POLYGONKEY12345');
      });
    });

    it('should call validateTokens after storing credentials', async () => {
      const user = userEvent.setup();
      mockStore.validateTokens.mockResolvedValue(true);

      render(<TokenCaptureForm />);

      await user.type(screen.getByLabelText(/Alpaca API Key/), 'PKABCDEFGHIJ123456');
      await user.type(screen.getByLabelText(/Alpaca Secret Key/), 'SKABCDEFGHIJ1234567890ABCD');

      await user.click(screen.getByRole('button', { name: /Capture Tokens/i }));

      await waitFor(() => {
        expect(mockStore.validateTokens).toHaveBeenCalled();
      });
    });

    it('should call onSuccess when validation succeeds', async () => {
      const user = userEvent.setup();
      mockStore.validateTokens.mockResolvedValue(true);
      const onSuccess = vi.fn();

      render(<TokenCaptureForm onSuccess={onSuccess} />);

      await user.type(screen.getByLabelText(/Alpaca API Key/), 'PKABCDEFGHIJ123456');
      await user.type(screen.getByLabelText(/Alpaca Secret Key/), 'SKABCDEFGHIJ1234567890ABCD');

      await user.click(screen.getByRole('button', { name: /Capture Tokens/i }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should not call onSuccess when validation fails', async () => {
      const user = userEvent.setup();
      mockStore.validateTokens.mockResolvedValue(false);
      const onSuccess = vi.fn();

      render(<TokenCaptureForm onSuccess={onSuccess} />);

      await user.type(screen.getByLabelText(/Alpaca API Key/), 'PKABCDEFGHIJ123456');
      await user.type(screen.getByLabelText(/Alpaca Secret Key/), 'SKABCDEFGHIJ1234567890ABCD');

      await user.click(screen.getByRole('button', { name: /Capture Tokens/i }));

      await waitFor(() => {
        expect(mockStore.validateTokens).toHaveBeenCalled();
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should show loading state when isCapturing is true', () => {
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        isCapturing: true,
      });

      render(<TokenCaptureForm />);

      // Button component shows "Loading..." when loading=true
      expect(screen.getByRole('button', { name: /Loading/i })).toBeDisabled();
    });

    it('should disable submit button when loading', () => {
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        isCapturing: true,
      });

      render(<TokenCaptureForm />);

      // Button component shows "Loading..." when loading=true
      expect(screen.getByRole('button', { name: /Loading/i })).toBeDisabled();
    });
  });

  describe('error display', () => {
    it('should show error display when captureError exists', () => {
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        captureError: 'Invalid API credentials',
      });

      render(<TokenCaptureForm />);

      expect(screen.getByText('Token validation failed')).toBeInTheDocument();
      expect(screen.getByText(/Invalid API credentials/)).toBeInTheDocument();
    });

    it('should dismiss error when dismiss button clicked', () => {
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        captureError: 'Invalid API credentials',
      });

      render(<TokenCaptureForm />);

      fireEvent.click(screen.getByText('Dismiss'));
      expect(mockStore.setCaptureError).toHaveBeenCalledWith(null);
    });

    it('should clear global error when typing in any field', () => {
      vi.mocked(useTokenStore).mockReturnValue({
        ...mockStore,
        captureError: 'Some error',
      });

      render(<TokenCaptureForm />);

      fireEvent.change(screen.getByLabelText(/Alpaca API Key/), {
        target: { value: 'test' },
      });

      expect(mockStore.setCaptureError).toHaveBeenCalledWith(null);
    });
  });

  describe('cancel button', () => {
    it('should call onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn();
      render(<TokenCaptureForm onCancel={onCancel} />);

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(onCancel).toHaveBeenCalled();
    });
  });
});
