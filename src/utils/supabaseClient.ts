import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isConfigured = Boolean(
  url &&
  anonKey &&
  url.startsWith('http') &&
  !url.includes('YOUR-PROJECT') &&
  !anonKey.includes('YOUR-ANON')
);

let client: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isConfigured) return null;
  if (!client) {
    client = createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
};

export const isCloudConfigured = (): boolean => isConfigured;

export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) || 'admin@haritech.com';

export const CLOUD_TABLE = 'site_data';
