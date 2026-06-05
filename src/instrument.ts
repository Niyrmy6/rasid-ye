/**
 * Sentry must initialize before any other application code runs.
 * Import this file first from main.tsx.
 *
 * VITE_SENTRY_DSN must be set at build time (Vercel Environment Variables + redeploy).
 */
import * as Sentry from '@sentry/react';
import React from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();

/** Stable release id for Sentry grouping (Vercel can set VITE_BUILD_ID). */
const release =
  import.meta.env.VITE_BUILD_ID?.trim() ||
  `rasidna@${import.meta.env.MODE}`;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release,

    // Health app: avoid sending IP/username by default; set user context explicitly if needed.
    sendDefaultPii: false,

    integrations: [
      // react-router-dom v7 — v6 tracing integration is the supported hook-based setup
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/rasidna\.vercel\.app/,
      /^https:\/\/.*\.vercel\.app/,
      /^https:\/\/.*\.supabase\.co/,
    ],

    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    enableLogs: true,

    beforeSend(event) {
      // Drop events that might contain credentials from form breadcrumbs
      const msg = event.exception?.values?.[0]?.value ?? event.message ?? '';
      if (/password|otp|token/i.test(String(msg))) {
        return null;
      }
      return event;
    },
  });

  // Dev-only: manual capture in Console — not exposed in production
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    (window as Window & { Sentry?: typeof Sentry }).Sentry = Sentry;
  }
}

export const isSentryEnabled = Boolean(dsn);
