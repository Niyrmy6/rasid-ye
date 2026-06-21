/**
 * Typed Supabase browser client with flexible environment switching.
 *
 * Supports three modes controlled by `VITE_SUPABASE_MODE`:
 *   - `cloud`  → always use the remote Supabase project
 *   - `local`  → always use the local Docker instance (supabase start)
 *   - `auto`   → try cloud first; fall back to local if offline
 *
 * Manual override from DevTools console:
 *   switchSupabase('local')   // switch to local
 *   switchSupabase('cloud')   // switch to cloud
 *   switchSupabase('auto')    // back to auto-detection
 *   getSupabaseMode()         // see current active mode
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { logger } from './logger';

// ---------------------------------------------------------------------------
// Environment credentials
// ---------------------------------------------------------------------------
type SupabaseMode = 'cloud' | 'local' | 'auto';

const CLOUD_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const CLOUD_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
const LOCAL_URL = import.meta.env.VITE_SUPABASE_LOCAL_URL ?? 'http://127.0.0.1:54321';
const LOCAL_KEY =
  import.meta.env.VITE_SUPABASE_LOCAL_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const STORAGE_KEY = 'supabase_mode_override';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getConfiguredMode(): SupabaseMode {
  const raw = (import.meta.env.VITE_SUPABASE_MODE ?? 'cloud').toLowerCase();
  if (raw === 'local' || raw === 'auto') return raw;
  return 'cloud';
}

/** Returns the user's manual override (if any), otherwise the .env setting. */
function getEffectiveMode(): SupabaseMode {
  try {
    const override = localStorage.getItem(STORAGE_KEY) as SupabaseMode | null;
    if (override === 'cloud' || override === 'local' || override === 'auto') {
      return override;
    }
  } catch {
    /* SSR or blocked localStorage – ignore */
  }
  return getConfiguredMode();
}

function buildClient(url: string, key: string): SupabaseClient<Database> {
  return createClient<Database>(url, key);
}

// ---------------------------------------------------------------------------
// Client creation
// ---------------------------------------------------------------------------
let activeMode: 'cloud' | 'local';
let supabase: SupabaseClient<Database>;

function initClient(): SupabaseClient<Database> {
  const mode = getEffectiveMode();

  if (mode === 'local') {
    activeMode = 'local';
    logger.info(`[Supabase] 🟢 Mode: LOCAL → ${LOCAL_URL}`);
    return buildClient(LOCAL_URL, LOCAL_KEY);
  }

  if (mode === 'cloud') {
    if (!CLOUD_URL || !CLOUD_KEY) {
      logger.warn('[Supabase] Missing cloud credentials — falling back to local');
      activeMode = 'local';
      return buildClient(LOCAL_URL, LOCAL_KEY);
    }
    activeMode = 'cloud';
    logger.info(`[Supabase] ☁️ Mode: CLOUD → ${CLOUD_URL}`);
    return buildClient(CLOUD_URL, CLOUD_KEY);
  }

  // auto: prefer cloud, fall back to local
  if (CLOUD_URL && CLOUD_KEY) {
    activeMode = 'cloud';
    logger.info(`[Supabase] ☁️ Mode: AUTO (starting with cloud) → ${CLOUD_URL}`);
    return buildClient(CLOUD_URL, CLOUD_KEY);
  }

  activeMode = 'local';
  logger.info(`[Supabase] 🟢 Mode: AUTO (no cloud creds → local) → ${LOCAL_URL}`);
  return buildClient(LOCAL_URL, LOCAL_KEY);
}

supabase = initClient();

// ---------------------------------------------------------------------------
// Auto-mode: cloud health-check with local fallback
// ---------------------------------------------------------------------------
if (getEffectiveMode() === 'auto' && activeMode === 'cloud') {
  // Fire a lightweight request to verify cloud connectivity
  fetch(`${CLOUD_URL}/rest/v1/`, {
    method: 'HEAD',
    headers: { apikey: CLOUD_KEY },
    signal: AbortSignal.timeout(5000),
  }).catch(() => {
    logger.warn('[Supabase] ⚠️ Cloud unreachable — switching to LOCAL');
    activeMode = 'local';
    supabase = buildClient(LOCAL_URL, LOCAL_KEY);
  });
}

// ---------------------------------------------------------------------------
// Manual switch from DevTools console
// ---------------------------------------------------------------------------
function switchSupabase(mode: SupabaseMode): string {
  try {
    if (mode === 'cloud' || mode === 'local' || mode === 'auto') {
      localStorage.setItem(STORAGE_KEY, mode);
      // Apply immediately without full page reload
      if (mode === 'local') {
        supabase = buildClient(LOCAL_URL, LOCAL_KEY);
        activeMode = 'local';
      } else if (mode === 'cloud') {
        supabase = buildClient(CLOUD_URL, CLOUD_KEY);
        activeMode = 'cloud';
      } else {
        // auto – re-init
        supabase = initClient();
      }
      return `✅ Switched to ${mode.toUpperCase()} mode (${activeMode === 'local' ? LOCAL_URL : CLOUD_URL}). Reload to apply everywhere.`;
    }
    return '❌ Invalid mode. Use: switchSupabase("cloud") | switchSupabase("local") | switchSupabase("auto")';
  } catch {
    return '❌ localStorage not available';
  }
}

function getSupabaseMode(): { configured: SupabaseMode; active: 'cloud' | 'local'; url: string } {
  return {
    configured: getEffectiveMode(),
    active: activeMode,
    url: activeMode === 'local' ? LOCAL_URL : CLOUD_URL,
  };
}

// Expose to browser console (window.switchSupabase / window.getSupabaseMode)
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).switchSupabase = switchSupabase;
  (window as unknown as Record<string, unknown>).getSupabaseMode = getSupabaseMode;
}

export { supabase };

