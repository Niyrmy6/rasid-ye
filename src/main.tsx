import './instrument';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { reactErrorHandler } from '@sentry/react';
import App from './App.tsx';
import './index.css';
import './i18n';
import { isSentryEnabled } from './instrument';
import { logger } from './lib/logger';
import { registerServiceWorker } from './lib/registerServiceWorker';

registerServiceWorker();

// Sentry.init() already hooks global errors; only add logger in development
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection', event.reason);
});

window.addEventListener('error', (event) => {
  logger.error('Global Error', event.error || event.message);
});

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found');
}

createRoot(rootEl, {
  onUncaughtError: reactErrorHandler((error, errorInfo) => {
    if (!isSentryEnabled) {
      logger.error('React uncaught error', error, { errorInfo });
    }
  }),
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
