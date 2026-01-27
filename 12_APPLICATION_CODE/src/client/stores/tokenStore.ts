import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  setUserContext,
  clearUserContext,
  logTradingBreadcrumb,
  captureTradeError,
} from '../lib/sentry';

export interface TokenState {
  // Token data (Kite/Zerodha credentials)
  kiteApiKey: string;
  kiteAccessToken: string;
  kiteUserId: string;

  // Token metadata
  tokenCapturedAt: number | null;
  tokenExpiresAt: number | null; // Always 6:00 AM IST next day (CR-004 SACRED)
  isTokenValid: boolean;

  // UI state
  isCapturing: boolean;
  captureError: string | null;

  // Actions
  setKiteCredentials: (apiKey: string, accessToken: string, userId: string) => void;
  validateTokens: () => Promise<boolean>;
  clearTokens: () => void;
  setCapturing: (isCapturing: boolean) => void;
  setCaptureError: (error: string | null) => void;
  getTokenAge: () => number | null;
  getTimeUntilExpiry: () => number | null; // Returns ms until 6:00 AM IST
  isTokenExpired: () => boolean;
}

/**
 * CR-004 SACRED CONSTRAINT: Token Expiry at 6:00 AM IST
 * ======================================================
 * Kite tokens expire at 6:00 AM IST daily (when Indian markets reset).
 * 6:00 AM IST = 00:30 UTC (IST is UTC+5:30)
 *
 * This is a CONSTITUTIONAL REQUIREMENT - DO NOT MODIFY.
 */
const calculateNext6AMIST = (): number => {
  const now = new Date();
  const expiry = new Date();

  // Set to 00:30 UTC which is 6:00 AM IST
  expiry.setUTCHours(0, 30, 0, 0);

  // If current time is past today's 6:00 AM IST, set expiry to tomorrow
  if (now.getTime() >= expiry.getTime()) {
    expiry.setUTCDate(expiry.getUTCDate() + 1);
  }

  return expiry.getTime();
};

export const useTokenStore = create<TokenState>()(
  persist(
    (set, get) => ({
      // Initial state (Kite credentials)
      kiteApiKey: '',
      kiteAccessToken: '',
      kiteUserId: '',
      tokenCapturedAt: null,
      tokenExpiresAt: null, // Will be set to 6:00 AM IST (CR-004)
      isTokenValid: false,
      isCapturing: false,
      captureError: null,

      // Actions
      setKiteCredentials: (apiKey: string, accessToken: string, userId: string) => {
        logTradingBreadcrumb('Kite credentials entered', 'auth');
        const now = Date.now();
        const expiresAt = calculateNext6AMIST();

        // DEBUG: Log credential lengths and expiry calculation
        console.log('[TokenStore] setKiteCredentials called:', {
          apiKeyLength: apiKey?.length || 0,
          accessTokenLength: accessToken?.length || 0,
          userId: userId,
          expiresAt: new Date(expiresAt).toISOString(),
          expiresAtMs: expiresAt,
          nowMs: now,
          msUntilExpiry: expiresAt - now,
        });

        set({
          kiteApiKey: apiKey,
          kiteAccessToken: accessToken,
          kiteUserId: userId,
          tokenCapturedAt: now,
          tokenExpiresAt: expiresAt, // CR-004: 6:00 AM IST expiry
          captureError: null,
        });

        // DEBUG: Verify state was set correctly
        const verifyState = get();
        console.log('[TokenStore] After set - state verified:', {
          hasApiKey: !!verifyState.kiteApiKey,
          hasAccessToken: !!verifyState.kiteAccessToken,
          userId: verifyState.kiteUserId,
          tokenExpiresAt: verifyState.tokenExpiresAt,
        });
      },

      validateTokens: async () => {
        set({ isCapturing: true, captureError: null });
        logTradingBreadcrumb('Kite token validation started', 'auth');

        // FIX: Removed Sentry.startSpan wrapper - was interfering with fetch
        try {
          // IMPORTANT: Always get FRESH state before each check
          const currentState = get();
          const { kiteApiKey, kiteAccessToken, kiteUserId, tokenExpiresAt } = currentState;

          // DEBUG: Log state at validation time
          const debugNow = Date.now();
          console.log('[TokenStore] validateTokens - current state:', {
            hasApiKey: !!kiteApiKey,
            apiKeyLength: kiteApiKey?.length || 0,
            hasAccessToken: !!kiteAccessToken,
            accessTokenLength: kiteAccessToken?.length || 0,
            userId: kiteUserId,
            tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt).toISOString() : null,
            nowMs: debugNow,
            tokenExpiresAtMs: tokenExpiresAt,
            isExpiredCheck: tokenExpiresAt !== null ? debugNow >= tokenExpiresAt : 'N/A (null)',
          });

          // Check if Kite tokens exist
          if (!kiteApiKey || !kiteAccessToken) {
            logTradingBreadcrumb('Token validation failed - missing Kite credentials', 'auth', {}, 'warning');
            set({ isTokenValid: false, isCapturing: false });
            return false;
          }

          // Check expiration (CR-004: 6:00 AM IST)
          const now = Date.now();
          if (tokenExpiresAt !== null && now >= tokenExpiresAt) {
            logTradingBreadcrumb('Token validation failed - expired (past 6:00 AM IST)', 'auth', {}, 'warning');
            set({
              isTokenValid: false,
              isCapturing: false,
              captureError: 'Kite tokens have expired (6:00 AM IST). Please re-authenticate via Kite Connect.',
            });
            return false;
          }

          // Validate with backend (Kite API) - DIRECT FETCH, no Sentry wrapper
          console.log('[TokenStore] Sending to /api/auth/validate:', {
            kiteApiKeyPrefix: kiteApiKey?.substring(0, 4) + '...',
            kiteAccessTokenPrefix: kiteAccessToken?.substring(0, 4) + '...',
            kiteUserId: kiteUserId,
          });

          const response = await fetch('/api/auth/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              kiteApiKey,
              kiteAccessToken,
              kiteUserId,
            }),
          });

          // DEBUG: Log response status
          console.log('[TokenStore] Backend response:', {
            status: response.status,
            ok: response.ok,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Token validation failed');
          }

          const data = await response.json().catch(() => ({ accountId: 'unknown', status: 'active' }));

          // Set Sentry user context on successful validation
          setUserContext(data.accountId || 'unknown', data.status || 'active');
          logTradingBreadcrumb('Token validation success', 'auth', {
            accountId: data.accountId,
            accountStatus: data.status,
          });

          set({ isTokenValid: true, isCapturing: false });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';

          // Capture error to Sentry with trading context
          captureTradeError(error as Error, {
            action: 'scan',
            details: { stage: 'token_validation' },
          });
          logTradingBreadcrumb('Token validation failed', 'auth', {
            error: errorMessage,
          }, 'error');

          set({
            isTokenValid: false,
            isCapturing: false,
            captureError: errorMessage,
          });
          return false;
        }
      },

      clearTokens: () => {
        // Clear Sentry user context
        clearUserContext();
        logTradingBreadcrumb('Session cleared - Kite tokens removed', 'auth');

        set({
          kiteApiKey: '',
          kiteAccessToken: '',
          kiteUserId: '',
          tokenCapturedAt: null,
          tokenExpiresAt: null,
          isTokenValid: false,
          captureError: null,
        });
      },

      setCapturing: (isCapturing: boolean) => {
        set({ isCapturing });
      },

      setCaptureError: (error: string | null) => {
        set({ captureError: error });
      },

      getTokenAge: () => {
        const { tokenCapturedAt } = get();
        if (tokenCapturedAt === null) return null;
        return Date.now() - tokenCapturedAt;
      },

      /**
       * CR-004: Returns milliseconds until 6:00 AM IST expiry
       * Used for countdown timer display
       */
      getTimeUntilExpiry: () => {
        const { tokenExpiresAt } = get();
        if (tokenExpiresAt === null) return null;
        const remaining = tokenExpiresAt - Date.now();
        return remaining > 0 ? remaining : 0;
      },

      isTokenExpired: () => {
        const { tokenExpiresAt } = get();
        if (tokenExpiresAt === null) return true;
        // CR-004: At exact 6:00 AM IST boundary, token IS expired
        return Date.now() >= tokenExpiresAt;
      },
    }),
    {
      name: 'mci-token-storage',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for security
      partialize: (state: TokenState) => ({
        // Only persist token metadata, not actual secrets
        tokenCapturedAt: state.tokenCapturedAt,
        tokenExpiresAt: state.tokenExpiresAt,
        isTokenValid: state.isTokenValid,
      }),
      // FIX: When rehydrating, check if persisted tokenExpiresAt is already expired
      // If so, reset to null to force fresh validation
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<TokenState>;
        const now = Date.now();

        // If persisted tokenExpiresAt is in the past, clear it
        // This prevents stale expired state from blocking new credentials
        if (persisted.tokenExpiresAt && now >= persisted.tokenExpiresAt) {
          console.log('[TokenStore] Clearing expired persisted tokenExpiresAt');
          return {
            ...currentState,
            tokenCapturedAt: null,
            tokenExpiresAt: null,
            isTokenValid: false,
          };
        }

        return {
          ...currentState,
          ...persisted,
        };
      },
    }
  )
);

export default useTokenStore;
