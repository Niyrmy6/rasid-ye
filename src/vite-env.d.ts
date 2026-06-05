/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_BUILD_ID: string;
  readonly VITE_SERVICE_TYPE?: 'mock' | 'twilio';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
