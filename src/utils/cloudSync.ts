import { getSupabase, isCloudConfigured, CLOUD_TABLE } from './supabaseClient';

export interface CloudRow {
  key: string;
  value: unknown;
  updated_at: string;
}

const KEY_EVENTS: Record<string, string> = {
  'haritech-content': 'haritech-content-updated',
  'haritech-portfolio-services': 'haritech-portfolio-services-updated',
  'haritech-team': 'haritech-team-updated',
  'haritech-industries': 'haritech-industries-updated',
  'haritech-blog': 'haritech-blog-updated',
  'haritech-cac': 'haritech-cac-updated',
  'haritech-service-cats': 'haritech-services-updated',
  'haritech-faq': 'haritech-faq-updated',
  'haritech-solar': 'haritech-solar-updated',
  'haritech-solar-advisor': 'haritech-solar-advisor-updated',
  'haritech-importation': 'haritech-importation-updated',
  'haritech-epoxy': 'haritech-epoxy-updated',
  'haritech-whatwedo': 'haritech-whatwedo-updated',
  'haritech-social': 'haritech-social-updated',
  'haritech-brand-logo': 'haritech-logo-updated',
  'haritech-settings': 'haritech-settings-updated',
  'haritech-projects': 'haritech-projects-updated',
  'haritech-testimonials': 'haritech-testimonials-updated',
  'haritech-cac-services': 'haritech-cac-data-updated',
  'haritech-cac-why': 'haritech-cac-data-updated',
  'haritech-cac-docs': 'haritech-cac-data-updated',
  'haritech-cac-faq': 'haritech-cac-data-updated',
};

const CLOUD_KEYS = Object.keys(KEY_EVENTS);

export const eventForCloudKey = (key: string): string | undefined => KEY_EVENTS[key];

export const isCloudKey = (key: string): boolean => key in KEY_EVENTS;

export const cloudKeys = (): string[] => [...CLOUD_KEYS];

/** When this device last wrote a key. Cloud rows older than this must not
    overwrite what the owner has on screen — an expired admin session cannot
    silently roll their work back. */
const LOCAL_WRITE_PREFIX = 'haritech-local-write:';

const markLocalWrite = (key: string, at: number = Date.now()): void => {
  try {
    window.localStorage.setItem(LOCAL_WRITE_PREFIX + key, String(at));
  } catch {
    /* storage full or blocked — sync still works, just without the guard */
  }
};

const localWriteAt = (key: string): number => {
  try {
    return Number(window.localStorage.getItem(LOCAL_WRITE_PREFIX + key) || 0) || 0;
  } catch {
    return 0;
  }
};

const readLocal = (key: string): unknown => {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch {
    return undefined;
  }
};

const isEmptyList = (value: unknown): boolean => Array.isArray(value) && value.length === 0;

export const pushToCloud = async (key: string, value: unknown): Promise<boolean> => {
  if (!isCloudConfigured()) return false;
  if (!isCloudKey(key)) return false;
  const sb = getSupabase();
  if (!sb) return false;
  // Recorded before the attempt: if the write is rejected the local copy is
  // still the newest, and the next sync pushes it up instead of discarding it.
  markLocalWrite(key);
  try {
    const { error } = await sb
      .from(CLOUD_TABLE)
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) {
      console.warn(`[cloud] push failed for ${key}:`, error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn(`[cloud] push error for ${key}:`, e);
    return false;
  }
};

const applyRow = (row: CloudRow): void => {
  const event = KEY_EVENTS[row.key];
  if (!event) return;
  try {
    // Objects round-trip through JSON, but a plain-string value (the brand
    // logo is one) must be stored raw — stringifying it would wrap the value
    // in literal quotes and break every read of it.
    const raw =
      typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
    window.localStorage.setItem(row.key, raw);
    window.dispatchEvent(new Event(event));
  } catch (e) {
    console.warn(`[cloud] apply failed for ${row.key}:`, e);
  }
};

export const applyRemoteRow = (row: CloudRow): void => applyRow(row);

export const syncFromCloud = async (): Promise<void> => {
  if (!isCloudConfigured()) return;
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data, error } = await sb.from(CLOUD_TABLE).select('key, value, updated_at');
    if (error) {
      console.warn('[cloud] fetch failed:', error.message);
      return;
    }
    if (!data || data.length === 0) return;
    let restored = 0;
    data.forEach((raw) => {
      const row = raw as CloudRow;
      const local = readLocal(row.key);
      const cloudAt = Date.parse(row.updated_at);
      const newerLocally = localWriteAt(row.key) > (Number.isNaN(cloudAt) ? 0 : cloudAt);
      const wouldEraseLocalList = isEmptyList(row.value) && Array.isArray(local) && local.length > 0;

      if (newerLocally || wouldEraseLocalList) {
        // The device holds the owner's newer work; send it up rather than
        // replacing it with the older cloud copy.
        if (local !== undefined) {
          void pushToCloud(row.key, local);
          restored += 1;
        }
        return;
      }
      applyRow(row);
    });
    console.log(
      `[cloud] synced ${data.length} keys from Supabase${restored ? ` — kept ${restored} newer local key(s)` : ''}`
    );
  } catch (e) {
    console.warn('[cloud] sync error:', e);
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
