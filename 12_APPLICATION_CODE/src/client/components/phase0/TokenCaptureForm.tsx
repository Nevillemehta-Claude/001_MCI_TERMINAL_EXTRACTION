import React, { useState, useCallback } from 'react';
import { Input, Button, ErrorDisplay, Tooltip } from '../uxmi';
import { useTokenStore } from '../../stores/tokenStore';
import { sanitizeKiteCredentials } from '../../../shared/validation';

interface TokenCaptureFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Phase 0: Token Capture Form (Kite Connect)
 * - Captures Kite API Key, Access Token, and User ID
 * - Real-time validation feedback
 * - Secure input handling (password fields)
 * - CR-004 compliant: Tokens expire at 6:00 AM IST
 * - CR-005 compliant UI interactions
 * - INV-006 compliant: Input sanitization at entry point
 */
export const TokenCaptureForm: React.FC<TokenCaptureFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const {
    setKiteCredentials,
    validateTokens,
    isCapturing,
    captureError,
    setCaptureError,
  } = useTokenStore();

  const [formData, setFormData] = useState({
    kiteApiKey: '',
    kiteAccessToken: '',
    kiteUserId: '',
  });

  const [showSecrets, setShowSecrets] = useState({
    kiteApiKey: false,
    kiteAccessToken: false,
    kiteUserId: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((field: string, value: string): string | null => {
    switch (field) {
      case 'kiteApiKey':
        if (!value.trim()) return 'Kite API Key is required';
        if (value.length < 8) return 'API Key appears too short';
        return null;

      case 'kiteAccessToken':
        if (!value.trim()) return 'Kite Access Token is required';
        if (value.length < 20) return 'Access Token appears too short';
        return null;

      case 'kiteUserId':
        if (!value.trim()) return 'Kite User ID is required';
        if (!/^[A-Z]{2,3}[0-9]+$/i.test(value)) return 'User ID format appears invalid (e.g., AB1234 or UYW879)';
        return null;

      default:
        return null;
    }
  }, []);

  const handleInputChange = useCallback(
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear field error on change
      if (fieldErrors[field]) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }

      // Clear global error
      if (captureError) {
        setCaptureError(null);
      }
    },
    [fieldErrors, captureError, setCaptureError]
  );

  const handleBlur = useCallback(
    (field: keyof typeof formData) => () => {
      const error = validateField(field, formData[field]);
      if (error) {
        setFieldErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [formData, validateField]
  );

  const toggleShowSecret = useCallback(
    (field: keyof typeof showSecrets) => () => {
      setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const errors: Record<string, string> = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) errors[field] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // INV-006: Sanitize credentials using centralized module at entry point
    try {
      const sanitized = sanitizeKiteCredentials({
        apiKey: formData.kiteApiKey,
        accessToken: formData.kiteAccessToken,
        userId: formData.kiteUserId,
      });

      // Store Kite credentials (CR-004: expiry will be set to 6:00 AM IST)
      setKiteCredentials(
        sanitized.apiKey,
        sanitized.accessToken,
        sanitized.userId
      );
    } catch (sanitizeError) {
      setCaptureError(
        sanitizeError instanceof Error
          ? sanitizeError.message
          : 'Invalid credential format'
      );
      return;
    }

    // Validate with backend
    const isValid = await validateTokens();

    if (isValid) {
      onSuccess?.();
    }
  };

  const EyeIcon = ({ open }: { open: boolean }) => (
    <svg
      className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      {open ? (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </>
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
        />
      )}
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Kite Token Capture</h2>
        <p className="mt-2 text-gray-600">
          Enter your Kite Connect credentials to initialize the trading system
        </p>
        <p className="mt-1 text-xs text-amber-600">
          Note: Tokens expire daily at 6:00 AM IST (CR-004)
        </p>
      </div>

      {captureError && (
        <ErrorDisplay
          what="Kite token validation failed"
          why={captureError}
          how="Please check your Kite credentials and try again. Tokens may have expired at 6:00 AM IST."
          severity="error"
          onDismiss={() => setCaptureError(null)}
        />
      )}

      <div className="space-y-4">
        {/* Kite API Key */}
        <div className="relative">
          <Tooltip content="Your Kite Connect API Key from the developer console" position="right">
            <Input
              label="Kite API Key"
              type={showSecrets.kiteApiKey ? 'text' : 'password'}
              value={formData.kiteApiKey}
              onChange={handleInputChange('kiteApiKey')}
              onBlur={handleBlur('kiteApiKey')}
              error={fieldErrors.kiteApiKey}
              placeholder="your_api_key"
              autoComplete="off"
              rightIcon={
                <button
                  type="button"
                  onClick={toggleShowSecret('kiteApiKey')}
                  className="focus:outline-none"
                  aria-label={showSecrets.kiteApiKey ? 'Hide API key' : 'Show API key'}
                >
                  <EyeIcon open={showSecrets.kiteApiKey} />
                </button>
              }
            />
          </Tooltip>
        </div>

        {/* Kite Access Token */}
        <div className="relative">
          <Tooltip content="Your Kite Access Token - generated after login, expires at 6:00 AM IST" position="right">
            <Input
              label="Kite Access Token"
              type={showSecrets.kiteAccessToken ? 'text' : 'password'}
              value={formData.kiteAccessToken}
              onChange={handleInputChange('kiteAccessToken')}
              onBlur={handleBlur('kiteAccessToken')}
              error={fieldErrors.kiteAccessToken}
              placeholder="••••••••••••••••"
              autoComplete="off"
              rightIcon={
                <button
                  type="button"
                  onClick={toggleShowSecret('kiteAccessToken')}
                  className="focus:outline-none"
                  aria-label={showSecrets.kiteAccessToken ? 'Hide token' : 'Show token'}
                >
                  <EyeIcon open={showSecrets.kiteAccessToken} />
                </button>
              }
            />
          </Tooltip>
        </div>

        {/* Kite User ID */}
        <div className="relative">
          <Tooltip content="Your Kite User ID (e.g., AB1234)" position="right">
            <Input
              label="Kite User ID"
              type={showSecrets.kiteUserId ? 'text' : 'password'}
              value={formData.kiteUserId}
              onChange={handleInputChange('kiteUserId')}
              onBlur={handleBlur('kiteUserId')}
              error={fieldErrors.kiteUserId}
              placeholder="AB1234"
              autoComplete="off"
              hint="Your Zerodha client ID"
              rightIcon={
                <button
                  type="button"
                  onClick={toggleShowSecret('kiteUserId')}
                  className="focus:outline-none"
                  aria-label={showSecrets.kiteUserId ? 'Hide ID' : 'Show ID'}
                >
                  <EyeIcon open={showSecrets.kiteUserId} />
                </button>
              }
            />
          </Tooltip>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isCapturing}
          disabled={isCapturing}
          className="flex-1"
        >
          {isCapturing ? 'Validating...' : 'Capture Tokens'}
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Your Kite credentials are stored securely in session storage.
        They are never transmitted to third parties. Tokens expire at 6:00 AM IST daily.
      </p>
    </form>
  );
};

export default TokenCaptureForm;
