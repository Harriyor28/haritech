import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isConfigured = Boolean(url &&
    anonKey &&
    url.startsWith('http') &&
    !url.includes('YOUR-PROJECT') &&
    !anonKey.includes('YOUR-ANON'));
let client = null;
export const getSupabase = () => {
    if (!isConfigured)
        return null;
    if (!client) {
        client = createClient(url, anonKey, {
            auth: { persistSession: true, autoRefreshToken: true },
        });
    }
    return client;
};
export const isCloudConfigured = () => isConfigured;
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@haritech.com';
export const CLOUD_TABLE = 'site_data';
