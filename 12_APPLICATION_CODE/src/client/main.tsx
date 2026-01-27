import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initSentry } from './lib/sentry';

/**
 * MCI Application Entry Point
 *
 * Mission Control Interface
 * CIA-SIE-START-STOP
 */

// Initialize Sentry error monitoring FIRST
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
