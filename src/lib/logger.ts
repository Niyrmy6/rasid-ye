/**
 * Development-only console logging.
 * Production builds stay silent; use hosting dashboards for real error tracking.
 */

const isDev = import.meta.env.DEV;

const STYLES = {
  error: 'color: #ef4444; font-weight: bold; font-size: 12px;',
  warn: 'color: #f59e0b; font-weight: bold; font-size: 12px;',
  info: 'color: #3b82f6; font-weight: bold; font-size: 12px;',
  success: 'color: #22c55e; font-weight: bold; font-size: 12px;',
};

export const logger = {
  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    if (!isDev) return;
    console.groupCollapsed(`%c🚨 ERROR: ${message}`, STYLES.error);
    if (error) {
      console.error('Details:', error);
    }
    if (context) {
      console.table(context);
    }
    console.trace('Stack Trace');
    console.groupEnd();
  },

  warn(message: string, data?: unknown) {
    if (!isDev) return;
    console.log(`%c⚠️ WARN: ${message}`, STYLES.warn);
    if (data) console.log('Data:', data);
  },

  info(message: string, data?: unknown) {
    if (!isDev) return;
    console.log(`%c📋 INFO: ${message}`, STYLES.info);
    if (data) console.log('Data:', data);
  },

  success(message: string) {
    if (!isDev) return;
    console.log(`%c✅ SUCCESS: ${message}`, STYLES.success);
  },

  /** Structured label for Supabase call sites */
  supabaseError(operation: string, error: unknown) {
    this.error(`Supabase: ${operation}`, error, {
      operation,
      timestamp: new Date().toISOString(),
    });
  },
};
