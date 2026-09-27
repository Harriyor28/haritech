import { getSupabase, isCloudConfigured, CLOUD_TABLE } from './supabaseClient';

export interface CloudRow {
  key: string;
  value: unknown;
  updated_at: string;
}

const KEY_EVENTS: Record<string, string> = {
  'haritech-content': 'haritech-content-updated',
  'haritech-team': 'haritech-team-updated',
  'haritech-industries': 'haritech-industries-updated',
  'haritech-blog': 'haritech-blog-updated',
  'haritech-cac': 'haritech-cac-updated',
  'haritech-service-cats': 'haritech-services-updated',
  'haritech-faq': 'haritech-faq-updated',
  'haritech-solar': 'haritech-solar-updated',
  'haritech-whatwedo': 'haritech-whatwedo-updated',
  'haritech-social': 'haritech-social-updated',
  'haritech-brand-logo': 'haritech-logo-updated',
  'haritech-settings': 'haritech-settings-updated',
  'haritech-projects': 'haritech-projects-updated',
  'haritech-testimonials': 'haritech-testimonials-updated',
  'haritech-portfolio-services': 'haritech-portfolio-services-updated',
  'haritech-cac-services': 'haritech-cac-data-updated',
  'haritech-cac-why': 'haritech-cac-data-updated',
  'haritech-cac-docs': 'haritech-cac-data-updated',
  'haritech-cac-faq': 'haritech-cac-data-updated',
};

const CLOUD_KEYS = Object.keys(KEY_EVENTS);

export const CLOUD_ERROR_EVENT = 'haritech-cloud-error';
const LOCAL_TS_SUFFIX = ':updated_at';

export const eventForCloudKey = (key: string): string | undefined => KEY_EVENTS[key];

export const isCloudKey = (key: string): boolean => key in KEY_EVENTS;

export const cloudKeys = (): string[] => [...CLOUD_KEYS];

const emitCloudError = (message: string): void => {
  try {
    window.dispatchEvent(new CustomEvent<string>(CLOUD_ERROR_EVENT, { detail: message }));
  } catch {
    /* non-browser environment */
  }
};

export const subscribeToCloudErrors = (handler: (message: string) => void): (() => void) => {
  const listener = (e: Event) => handler((e as CustomEvent<string>).detail || 'Cloud sync failed.');
  window.addEventListener(CLOUD_ERROR_EVENT, listener);
  return () => window.removeEventListener(CLOUD_ERROR_EVENT, listener);
};

/** Surface a local (quota / storage) failure through the same channel as cloud errors,
 *  so the admin dashboard shows it as a toast + banner. */
export const emitStorageError = (message: string): void => emitCloudError(message);

const readLocalTimestamp = (key: string): number => {
  try {
    const raw = window.localStorage.getItem(key + LOCAL_TS_SUFFIX);
    const t = raw ? Date.parse(raw) : NaN;
    return Number.isNaN(t) ? 0 : t;
  } catch {
    return 0;
  }
};

const stampLocal = (key: string, when: string): void => {
  try {
    window.localStorage.setItem(key + LOCAL_TS_SUFFIX, when);
  } catch {
    /* storage full or unavailable */
  }
};

export const pushToCloud = async (key: string, value: unknown): Promise<boolean> => {
  if (!isCloudConfigured()) return false;
  if (!isCloudKey(key)) return false;
  const sb = getSupabase();
  if (!sb) return false;
  // Mark local data fresh FIRST, so a later cloud fetch can never
  // overwrite these just-saved edits with older cloud rows.
  const now = new Date().toISOString();
  stampLocal(key, now);
  try {
    const { error } = await sb
      .from(CLOUD_TABLE)
      .upsert({ key, value, updated_at: now }, { onConflict: 'key' });
    if (error) {
      console.warn(`[cloud] push failed for ${key}:`, error.message);
      const rls =
        error.code === '42501' || error.message.includes('row-level security');
      emitCloudError(
        rls
          ? `Cloud save blocked for "${key}": you are not signed in as the admin (Row Level Security). Sign in at /admin, then retry the save. Change kept in this browser only.`
          : `Cloud save failed for "${key}": ${error.message}. Your change is kept in this browser only.`
      );
      return false;
    }
    return true;
  } catch (e) {
    console.warn(`[cloud] push error for ${key}:`, e);
    emitCloudError(`Cloud save failed for "${key}": no connection to Supabase. Your change is kept in this browser only.`);
    return false;
  }
};

const applyRow = (row: CloudRow): void => {
  const event = KEY_EVENTS[row.key];
  if (!event) return;
  try {
    // Never let a STALE cloud row wipe FRESHER local edits
    const rowTime = row.updated_at ? Date.parse(row.updated_at) : 0;
    const localTime = readLocalTimestamp(row.key);
    const localRaw = window.localStorage.getItem(row.key);
    let localParsed: unknown = null;
    let hasLocal = false;
    if (localRaw !== null) {
      try {
        localParsed = JSON.parse(localRaw);
      } catch {
        // Raw (non-JSON) values — e.g. the logo is stored as a bare data URL
        localParsed = localRaw;
      }
      hasLocal = true;
    }
    if (hasLocal && localTime > 0 && !Number.isNaN(rowTime) && rowTime <= localTime) {
      // Equal timestamps = same write already present → do nothing.
      // Strictly older cloud row → push our fresher local copy instead.
      if (rowTime < localTime) void pushToCloud(row.key, localParsed);
      return;
    }
    // Strings are stored raw (logo); objects/arrays are JSON
    const serialized =
      typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
    window.localStorage.setItem(row.key, serialized);
    if (row.updated_at) stampLocal(row.key, row.updated_at);
    window.dispatchEvent(new Event(event));
  } catch (e) {
    console.warn(`[cloud] apply failed for ${row.key}:`, e);
  }
};

export const applyRemoteRow = (row: CloudRow): void => applyRow(row);

/** Push every key this browser has stored locally to the cloud.
 *  Callers must only run this when an admin session exists — it heals
 *  earlier failed pushes and fills an empty/missing table. */
export const pushAllLocal = async (): Promise<void> => {
  if (!isCloudConfigured()) return;
  for (const key of CLOUD_KEYS) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) continue;
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = raw; // raw values (logo data URL)
      }
      await pushToCloud(key, parsed);
    } catch {
      /* keep going for the remaining keys */
    }
  }
};

export const syncFromCloud = async (): Promise<void> => {
  if (!isCloudConfigured()) return;
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data, error } = await sb.from(CLOUD_TABLE).select('key, value, updated_at');
    if (error) {
      console.warn('[cloud] fetch failed:', error.message);
      emitCloudError(`Could not load cloud content: ${error.message}. Showing this browser's saved content instead.`);
      return;
    }
    if (!data || data.length === 0) return;
    data.forEach((row) => {
      // Skip cloud rows that are older than local edits
      const rowTime = row.updated_at ? Date.parse(row.updated_at) : 0;
      const localTime = readLocalTimestamp(row.key);
      if (localTime > 0 && rowTime > 0 && rowTime <= localTime) return;
      applyRow(row as CloudRow);
    });
  } catch (e) {
    console.warn('[cloud] sync error:', e);
    emitCloudError('Could not reach Supabase. Showing this browser\'s saved content instead.');
  }
};

export interface CloudHealth {
  ok: boolean;
  message: string;
}

/** Diagnose whether the site_data table is reachable, readable and writable. */
export const checkCloudHealth = async (): Promise<CloudHealth> => {
  if (!isCloudConfigured()) {
    return { ok: false, message: 'Supabase keys are missing from the .env file.' };
  }
  const sb = getSupabase();
  if (!sb) {
    return { ok: false, message: 'Supabase client could not be created.' };
  }
  try {
    const { error: readError } = await sb.from(CLOUD_TABLE).select('key').limit(1);
    if (readError) {
      if (readError.code === '42P01' || readError.message.includes('does not exist')) {
        return { ok: false, message: `Table "${CLOUD_TABLE}" does not exist. Run supabase/schema.sql in the Supabase SQL Editor.` };
      }
      return { ok: false, message: `Cannot read cloud content: ${readError.message}` };
    }

    // 2. Are we signed in? RLS only lets the admin account write.
    const { data: sessionData } = await sb.auth.getSession();
    if (!sessionData.session) {
      return {
        ok: false,
        message:
          'Connected, but you are not signed in — visitors can read content, but admin saves are blocked by Row Level Security. Sign in at the login screen.',
      };
    }

    // 3. Write probe: can we actually save?
    const probeKey = '__health__';
    const { error: writeError } = await sb
      .from(CLOUD_TABLE)
      .upsert(
        { key: probeKey, value: { t: Date.now() }, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    if (writeError) {
      if (writeError.code === '42501' || writeError.message.includes('row-level security')) {
        return {
          ok: false,
          message:
            'Reads work but writes are blocked by Row Level Security — your session may have expired. Sign out and back in at /admin.',
        };
      }
      return { ok: false, message: `Cannot write to the cloud: ${writeError.message}` };
    }
    await sb.from(CLOUD_TABLE).delete().eq('key', probeKey);

    return { ok: true, message: 'Cloud sync is connected and writable.' };
  } catch {
    return { ok: false, message: 'Cannot reach Supabase. Check internet connection, ad-blocker, or whether the project is paused.' };
  }
};

export const subscribeToCloud = (): (() => void) => {
  if (!isCloudConfigured()) return () => {};
  const sb = getSupabase();
  if (!sb) return () => {};
  const channel = sb
    .channel('haritech-site-data')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: CLOUD_TABLE },
      (payload) => {
        const row = payload.new as CloudRow;
        if (row && row.key) applyRow(row);
      }
    )
    .subscribe();
  return () => {
    void sb.removeChannel(channel);
  };
};
