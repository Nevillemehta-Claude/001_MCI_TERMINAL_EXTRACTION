import React, { useState } from 'react';
import { useTokenStore } from '../../stores/tokenStore';

/**
 * CredentialsHelper - Shows current session Kite credentials for reference
 * Sources values EXCLUSIVELY from runtime tokenStore
 * NO hardcoded credentials - CR-004 compliant
 */

export const CredentialsHelper: React.FC = () => {
  const { kiteApiKey, kiteAccessToken, kiteUserId, isTokenValid, tokenExpiresAt, tokenCapturedAt } = useTokenStore();
  const [copied, setCopied] = useState<string | null>(null);

  // Check if credentials are available
  const hasCredentials = kiteApiKey && kiteAccessToken && kiteUserId;

  const copyToClipboard = async (text: string, field: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyAll = async () => {
    if (!hasCredentials) return;
    const allText = `API Key: ${kiteApiKey}\nAccess Token: ${kiteAccessToken}\nUser ID: ${kiteUserId}`;
    try {
      await navigator.clipboard.writeText(allText);
      setCopied('all');
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Format expiry time for display
  const formatExpiry = () => {
    if (!tokenExpiresAt) return 'Not set';
    const expiry = new Date(tokenExpiresAt);
    return expiry.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    }) + ' IST';
  };

  // COCKPIT INTEGRITY: Surface hidden tokenCapturedAt timestamp
  const formatCapturedAt = () => {
    if (!tokenCapturedAt) return null;
    const captured = new Date(tokenCapturedAt);
    return captured.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata'
    }) + ' IST';
  };

  // If no credentials entered yet, show placeholder state
  if (!hasCredentials) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-3">
            <span className="text-2xl">🔐</span>
          </div>
          <h3 className="text-xl font-bold text-gray-600">No Credentials</h3>
          <p className="text-sm text-gray-500 mt-2">
            Enter your Kite credentials in the form to see them here.
          </p>
          <p className="text-xs text-amber-600 mt-3">
            Tokens must be provided fresh daily (expire at 6:00 AM IST)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
          <span className="text-2xl">{isTokenValid ? '✅' : '⚠️'}</span>
        </div>
        <h3 className="text-xl font-bold text-blue-900">Current Session</h3>
        <p className="text-sm text-blue-600 mt-1">
          {isTokenValid ? 'Token validated' : 'Pending validation'}
        </p>
        {/* COCKPIT INTEGRITY: Surface previously hidden timestamps */}
        {formatCapturedAt() && (
          <p className="text-xs text-gray-500 mt-1">
            Captured: {formatCapturedAt()}
          </p>
        )}
        <p className="text-xs text-amber-600 mt-1">
          Expires: {formatExpiry()}
        </p>
      </div>

      {/* Credentials List */}
      <div className="space-y-4 flex-1">
        {/* API Key */}
        <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">API Key</span>
            <button
              onClick={() => copyToClipboard(kiteApiKey, 'apiKey')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                copied === 'apiKey'
                  ? 'bg-green-500 text-white scale-105'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {copied === 'apiKey' ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <code className="text-sm font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded block">
            {kiteApiKey}
          </code>
        </div>

        {/* Access Token */}
        <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Access Token</span>
            <button
              onClick={() => copyToClipboard(kiteAccessToken, 'accessToken')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                copied === 'accessToken'
                  ? 'bg-green-500 text-white scale-105'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {copied === 'accessToken' ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <code className="text-sm font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded block break-all">
            {kiteAccessToken.substring(0, 8)}••••••••{kiteAccessToken.substring(kiteAccessToken.length - 4)}
          </code>
        </div>

        {/* User ID */}
        <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">User ID</span>
            <button
              onClick={() => copyToClipboard(kiteUserId, 'userId')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                copied === 'userId'
                  ? 'bg-green-500 text-white scale-105'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {copied === 'userId' ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <code className="text-sm font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded block">
            {kiteUserId}
          </code>
        </div>
      </div>

      {/* Copy All Button */}
      <button
        onClick={copyAll}
        className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold transition-all ${
          copied === 'all'
            ? 'bg-green-500 text-white scale-[1.02]'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.01]'
        }`}
      >
        {copied === 'all' ? '✓ All Copied!' : 'Copy All Credentials'}
      </button>
    </div>
  );
};

export default CredentialsHelper;
