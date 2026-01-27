import React, { useState } from 'react';

/**
 * CredentialsHelper - Shows saved Kite credentials for easy reference
 * Displays alongside the Token Capture form for convenience
 */

// Your Kite credentials (for development convenience)
const SAVED_CREDENTIALS = {
  apiKey: 'ji12bxmns06gyvnk',
  accessToken: 'mNu9Fv1TgdZMxhCEJtbx4b2rmQADhc7F',
  userId: 'UYW879',
};

export const CredentialsHelper: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyAll = async () => {
    const allText = `API Key: ${SAVED_CREDENTIALS.apiKey}\nAccess Token: ${SAVED_CREDENTIALS.accessToken}\nUser ID: ${SAVED_CREDENTIALS.userId}`;
    try {
      await navigator.clipboard.writeText(allText);
      setCopied('all');
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="text-xl font-bold text-blue-900">Your Credentials</h3>
        <p className="text-sm text-blue-600 mt-1">Click to copy, then paste</p>
      </div>

      {/* Credentials List */}
      <div className="space-y-4 flex-1">
        {/* API Key */}
        <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">API Key</span>
            <button
              onClick={() => copyToClipboard(SAVED_CREDENTIALS.apiKey, 'apiKey')}
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
            {SAVED_CREDENTIALS.apiKey}
          </code>
        </div>

        {/* Access Token */}
        <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Access Token</span>
            <button
              onClick={() => copyToClipboard(SAVED_CREDENTIALS.accessToken, 'accessToken')}
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
            {SAVED_CREDENTIALS.accessToken}
          </code>
        </div>

        {/* User ID */}
        <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">User ID</span>
            <button
              onClick={() => copyToClipboard(SAVED_CREDENTIALS.userId, 'userId')}
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
            {SAVED_CREDENTIALS.userId}
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
