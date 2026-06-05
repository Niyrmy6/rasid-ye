/**
 * Typed Supabase browser client (anon key).
 * RLS on the database enforces row access; service role is only used in Edge Functions.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { logger } from './logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  logger.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
