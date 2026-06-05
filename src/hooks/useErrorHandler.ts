/**
 * Application-wide error surface: translates technical failures,
 * shows Sonner toasts, and forces logout when the session is invalid.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import i18n from '../i18n';
import { translateError } from '../lib/errorMessages';
import { logger } from '../lib/logger';
import { clearStoredUser } from '../lib/session';

export function useErrorHandler() {
  const navigate = useNavigate();

  /**
   * @param options.silent - Log only, no toast (e.g. background fetch on details page)
   * @param options.retry - Optional toast action to re-run the failed operation
   * @returns `TranslatedError` for callers that branch on category/retryable
   */
  const handleError = useCallback((error: unknown, options: {
    silent?: boolean;
    context?: string;
    retry?: () => void;
  } = {}) => {
    const translated = translateError(error);

    logger.error(options.context || 'Application Error', error);

    if (translated.requiresLogout) {
      logger.warn('Session expired, logging out user...');
      clearStoredUser();
      toast.error(translated.message);
      navigate('/login');
      return;
    }

    if (!options.silent) {
      toast.error(translated.message, {
        action: options.retry ? {
          label: i18n.t('error.retry'),
          onClick: options.retry,
        } : undefined,
        duration: 5000,
      });
    }

    return translated;
  }, [navigate]);

  /**
   * Tuple-style wrapper for async flows: `[data, error]` without try/catch in every page.
   */
  const withErrorHandling = useCallback(async <T>(
    promise: Promise<T>,
    options: { context?: string; retry?: () => void } = {},
  ): Promise<[T | null, unknown]> => {
    try {
      const data = await promise;
      return [data, null];
    } catch (error) {
      handleError(error, options);
      return [null, error];
    }
  }, [handleError]);

  return { handleError, withErrorHandling };
}
