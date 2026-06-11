/**
 * Catches render-time React errors and shows a recoverable fallback
 * instead of a blank screen (messages use i18n / Arabic copy in UI).
 */

import * as Sentry from '@sentry/react';
import React, { ErrorInfo, ReactNode } from 'react';
import i18n from '../i18n';
import { logger } from '../lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  declare readonly props: Readonly<Props>;

  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error', error, { errorInfo });
    Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  public render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div
          className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6 text-center"
          dir={i18n.dir()}
        >
          <div className="max-w-md w-full bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-xl space-y-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-text-main font-almarai">
                {i18n.t('errorBoundary.title')}
              </h1>
              <p className="text-text-muted">
                {i18n.t('errorBoundary.description')}
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold font-almarai shadow-lg transition-transform active:scale-[0.98]"
              >
                {i18n.t('errorBoundary.reload')}
              </button>

              <button
                onClick={() => { window.location.href = '/'; }}
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-text-main rounded-2xl font-medium transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {i18n.t('errorBoundary.goHome')}
              </button>
            </div>

            {import.meta.env.DEV && (
              <div
                className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-left font-mono text-[10px] text-red-800 dark:text-red-300 overflow-auto max-h-32"
                dir="ltr"
              >
                <span className="font-bold">Error:</span> {error?.message}
                <br />
                <span className="font-bold">Stack:</span> {error?.stack}
              </div>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
