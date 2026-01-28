/**
 * TokenCaptureForm Tests
 * Tests for Kite Connect credential capture
 * CR-001: Token Validity | CR-004: Token Expiry
 * INV-006: Input Sanitization
 * India-market-only compliant (Kite Connect)
 * 
 * NOTE: Test credentials must be alphanumeric per INV-006 sanitization rules.
 * Real Kite credentials are alphanumeric (e.g., "Dl81D7apaLi3mpCCx0vrTa3gJeRRZ5GO").
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TokenCaptureForm } from '../TokenCaptureForm';
import { useTokenStore } from '../../../stores/tokenStore';

// Mock the token store
vi.mock('../../../stores/tokenStore', () => ({
  useTokenStore: vi.fn(),
}));

// Valid test credentials (INV-006 compliant: alphanumeric only)
const VALID_API_KEY = 'testApiKey12345';
const VALID_ACCESS_TOKEN = 'Dl81D7apaLi3mpCCx0vrTa3gJeRRZ5GO';
const VALID_USER_ID = 'AB1234';

describe('TokenCaptureForm', () => {
  const mockStore = {
    setKiteCredentials: vi.fn(),
    validateTokens: vi.fn().mockResolvedValue(true),
    isCapturing: false,
    captureError: null,
    setCaptureError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useTokenStore as any).mockReturnValue(mockStore);
  });

  describe('rendering', () => {
    it('should render the form', () => {
      render(<TokenCaptureForm />);
      expect(screen.getByRole('heading', { name: /Kite Token Capture/i })).toBeInTheDocument();
    });

    it('should render Kite API Key input', () => {
      render(<TokenCaptureForm />);
      expect(screen.getByLabelText(/Kite API Key/i)).toBeInTheDocument();
    });

    it('should render Kite Access Token input', () => {
      render(<TokenCaptureForm />);
      expect(screen.getByLabelText(/Kite Access Token/i)).toBeInTheDocument();
    });

    it('should render Kite User ID input', () => {
      render(<TokenCaptureForm />);
      expect(screen.getByLabelText(/Kite User ID/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<TokenCaptureForm />);
      expect(screen.getByRole('button', { name: /Capture Tokens/i })).toBeInTheDocument();
    });

    it('should display CR-004 expiry notice', () => {
      render(<TokenCaptureForm />);
      expect(screen.getByText(/Tokens expire daily at 6:00 AM IST/i)).toBeInTheDocument();
    });
  });

  describe('input fields', () => {
    it('should have password type for API Key by default', () => {
      render(<TokenCaptureForm />);
      const apiKeyInput = screen.getByLabelText(/Kite API Key/i);
      expect(apiKeyInput).toHaveAttribute('type', 'password');
    });

    it('should have password type for Access Token by default', () => {
      render(<TokenCaptureForm />);
      const tokenInput = screen.getByLabelText(/Kite Access Token/i);
      expect(tokenInput).toHaveAttribute('type', 'password');
    });

    it('should have password type for User ID by default', () => {
      render(<TokenCaptureForm />);
      const userIdInput = screen.getByLabelText(/Kite User ID/i);
      expect(userIdInput).toHaveAttribute('type', 'password');
    });

    it('should allow toggling API Key visibility', async () => {
      const user = userEvent.setup();
      render(<TokenCaptureForm />);
      const apiKeyInput = screen.getByLabelText(/Kite API Key/i);
      const toggleButton = screen.getByLabelText(/Show API key/i);

      expect(apiKeyInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);

      expect(apiKeyInput).toHaveAttribute('type', 'text');
    });

    it('should allow toggling Access Token visibility', async () => {
      const user = userEvent.setup();
      render(<TokenCaptureForm />);
      const tokenInput = screen.getByLabelText(/Kite Access Token/i);
      const toggleButton = screen.getByLabelText(/Show token/i);

      expect(tokenInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);

      expect(tokenInput).toHaveAttribute('type', 'text');
    });
  });

  describe('validation', () => {
    it('should show error for empty API Key on blur', async () => {
      render(<TokenCaptureForm />);
      const input = screen.getByLabelText(/Kite API Key/i);

      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/Kite API Key is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty Access Token on blur', async () => {
      render(<TokenCaptureForm />);
      const input = screen.getByLabelText(/Kite Access Token/i);

      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/Kite Access Token is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty User ID on blur', async () => {
      render(<TokenCaptureForm />);
      const input = screen.getByLabelText(/Kite User ID/i);

      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/Kite User ID is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for short API Key', async () => {
      const user = userEvent.setup();
      render(<TokenCaptureForm />);
      const input = screen.getByLabelText(/Kite API Key/i);

      await user.type(input, 'short');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/API Key appears too short/i)).toBeInTheDocument();
      });
    });

    it('should show error for short Access Token', async () => {
      const user = userEvent.setup();
      render(<TokenCaptureForm />);
      const input = screen.getByLabelText(/Kite Access Token/i);

      await user.type(input, 'short');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/Access Token appears too short/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid User ID format', async () => {
      const user = userEvent.setup();
      render(<TokenCaptureForm />);
      const input = screen.getByLabelText(/Kite User ID/i);

      await user.type(input, 'invalid');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/User ID format appears invalid/i)).toBeInTheDocument();
      });
    });

    it('should clear error when valid input provided', async () => {
      const user = userEvent.setup();
      render(<TokenCaptureForm />);
      const input = screen.getByLabelText(/Kite API Key/i);

      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/Kite API Key is required/i)).toBeInTheDocument();
      });

      await user.type(input, 'valid_api_key_12345');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByText(/Kite API Key is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('form submission', () => {
    it('should not submit with empty fields', async () => {
      const user = userEvent.setup();
      render(<TokenCaptureForm />);

      const submitButton = screen.getByRole('button', { name: /Capture Tokens/i });
      await user.click(submitButton);

      expect(mockStore.setKiteCredentials).not.toHaveBeenCalled();
    });

    it('should call setKiteCredentials and validateTokens when form is valid', async () => {
      const user = userEvent.setup();
      render(<TokenCaptureForm />);

      await user.type(screen.getByLabelText(/Kite API Key/i), VALID_API_KEY);
      await user.type(screen.getByLabelText(/Kite Access Token/i), VALID_ACCESS_TOKEN);
      await user.type(screen.getByLabelText(/Kite User ID/i), VALID_USER_ID);

      const submitButton = screen.getByRole('button', { name: /Capture Tokens/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockStore.setKiteCredentials).toHaveBeenCalledWith(
          VALID_API_KEY,
          VALID_ACCESS_TOKEN,
          VALID_USER_ID
        );
        expect(mockStore.validateTokens).toHaveBeenCalled();
      });
    });

    it('should call onSuccess when validation succeeds', async () => {
      const validateTokensMock = vi.fn().mockResolvedValue(true);
      (useTokenStore as any).mockReturnValue({
        ...mockStore,
        validateTokens: validateTokensMock,
      });

      const onSuccess = vi.fn();
      const user = userEvent.setup();
      render(<TokenCaptureForm onSuccess={onSuccess} />);

      await user.type(screen.getByLabelText(/Kite API Key/i), VALID_API_KEY);
      await user.type(screen.getByLabelText(/Kite Access Token/i), VALID_ACCESS_TOKEN);
      await user.type(screen.getByLabelText(/Kite User ID/i), VALID_USER_ID);

      const submitButton = screen.getByRole('button', { name: /Capture Tokens/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(validateTokensMock).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should not call onSuccess when validation fails', async () => {
      const validateTokensMock = vi.fn().mockResolvedValue(false);
      (useTokenStore as any).mockReturnValue({
        ...mockStore,
        validateTokens: validateTokensMock,
      });

      const onSuccess = vi.fn();
      const user = userEvent.setup();
      render(<TokenCaptureForm onSuccess={onSuccess} />);

      await user.type(screen.getByLabelText(/Kite API Key/i), VALID_API_KEY);
      await user.type(screen.getByLabelText(/Kite Access Token/i), VALID_ACCESS_TOKEN);
      await user.type(screen.getByLabelText(/Kite User ID/i), VALID_USER_ID);

      const submitButton = screen.getByRole('button', { name: /Capture Tokens/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(validateTokensMock).toHaveBeenCalled();
      });

      // Give time for any async operations to complete
      await waitFor(() => {
        expect(onSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe('loading state', () => {
    it('should show loading indicator during validation', () => {
      (useTokenStore as any).mockReturnValue({
        ...mockStore,
        isCapturing: true,
      });

      render(<TokenCaptureForm />);

      // Button shows "Loading..." text when in loading state (via UXMI Button component)
      const submitButton = screen.getByRole('button', { name: /Loading/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button during capture', () => {
      (useTokenStore as any).mockReturnValue({
        ...mockStore,
        isCapturing: true,
      });

      render(<TokenCaptureForm />);

      // The submit button should be disabled and show loading state
      // Find by submit type since the button text changes to "Loading..."
      const submitButton = screen.getByRole('button', { name: /Loading/i });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('error display', () => {
    it('should display capture error when present', () => {
      (useTokenStore as any).mockReturnValue({
        ...mockStore,
        captureError: 'Invalid Kite credentials',
      });

      render(<TokenCaptureForm />);
      expect(screen.getByText(/Invalid Kite credentials/i)).toBeInTheDocument();
    });

    it('should call setCaptureError(null) when error is dismissed', async () => {
      const user = userEvent.setup();
      (useTokenStore as any).mockReturnValue({
        ...mockStore,
        captureError: 'Invalid Kite credentials',
      });

      render(<TokenCaptureForm />);

      // Find and click dismiss button (usually an X or close button in ErrorDisplay)
      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(dismissButton);

      expect(mockStore.setCaptureError).toHaveBeenCalledWith(null);
    });
  });

  describe('cancel button', () => {
    it('should render cancel button when onCancel is provided', () => {
      render(<TokenCaptureForm onCancel={() => {}} />);
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('should not render cancel button when onCancel is not provided', () => {
      render(<TokenCaptureForm />);
      expect(screen.queryByRole('button', { name: /Cancel/i })).not.toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const onCancel = vi.fn();
      const user = userEvent.setup();
      render(<TokenCaptureForm onCancel={onCancel} />);

      await user.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(onCancel).toHaveBeenCalled();
    });
  });
});
