import { getSupabase, isCloudConfigured } from './supabaseClient';

const TABLE = 'page_views';
const MAX_PATH_LEN = 200;
/** Back off after the table is missing so we don't fire a 404 on every navigation. */
const RETRY_AFTER_MS = 5 * 60 * 1000;
const DISABLE_KEY = 'haritech:analytics-unavailable-until';

/** Reads the shared back-off stamp (per tab; survives reloads, cleared on tab close). */
const unavailableUntil = (): number => {
  try {
    return Number(sessionStorage.getItem(DISABLE_KEY)) || 0;
  } catch {
    return 0;
  }
};

const suppressTracking = (): void => {
  try {
    sessionStorage.setItem(DISABLE_KEY, String(Date.now() + RETRY_AFTER_MS));
  } catch {
    /* storage unavailable (private mode) — fall back to in-memory only */
  }
};

/** PostgREST signals an unknown table with PGRST205 "Could not find the table ..." */
const isMissingTable = (message: string): boolean =>
  message.includes('Could not find the table') && message.includes(TABLE);

const reportUnavailable = (): void => {
  if (typeof window === 'undefined') return;
  console.warn(
    `[analytics] paused: table public.${TABLE} does not exist yet. ` +
      'Run supabase/schema.sql (analytics section) in the Supabase SQL editor, then reload.'
  );
};

/** Wait for the router to settle before recording — <Navigate> redirects change the path twice. */
const TRACK_DEBOUNCE_MS = 400;
const DEDUPE_MS = 10000;

let lastSentPath = '';
let lastSentAt = 0;
let pendingTimer: ReturnType<typeof setTimeout> | undefined;

const sendView = (clean: string): void => {
  const now = Date.now();
  // Guard against React StrictMode double-firing the same view in dev
  if (clean === lastSentPath && now - lastSentAt < DEDUPE_MS) return;
  lastSentPath = clean;
  lastSentAt = now;
  const sb = getSupabase();
  if (!sb) return;
  void sb
    .from(TABLE)
    .insert({ path: clean })
    .then(({ error }) => {
      if (!error) return;
      if (isMissingTable(error.message)) {
        suppressTracking();
        reportUnavailable();
        return;
      }
      console.warn('[analytics] track failed:', error.message);
    });
};

/** Record one page view. Fire-and-forget, safe to call on every route change. */
export const trackPageView = (path: string): void => {
  if (!isCloudConfigured()) return;
  if (Date.now() < unavailableUntil()) return;
  const clean = (path.split('?')[0].split('#')[0] || '/').slice(0, MAX_PATH_LEN);
  if (pendingTimer !== undefined) clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => {
    pendingTimer = undefined;
    sendView(clean);
  }, TRACK_DEBOUNCE_MS);
};

/* ── Aggregate events (chat opened, whatsapp clicked, enquiry submitted …) ── */

const EVENTS_TABLE = 'site_events';
const EVENT_DUP_MS = 5000;
let lastEventKey = '';
let lastEventAt = 0;

/** Anonymous, privacy-safe event counters — no message content or contact details. */
export const trackEvent = (event: string, label?: string): void => {
  if (typeof window === 'undefined') return;
  if (!isCloudConfigured()) return;
  const key = `${event}:${label ?? ''}`;
  const now = Date.now();
  if (key === lastEventKey && now - lastEventAt < EVENT_DUP_MS) return;
  lastEventKey = key;
  lastEventAt = now;
  const safeEvent = String(event).slice(0, 60);
  if (!/^[a-z0-9_.:-]+$/i.test(safeEvent)) return;
  const sb = getSupabase();
  if (!sb) return;
  void sb
    .from(EVENTS_TABLE)
    .insert({ event: safeEvent, label: (label ?? '').slice(0, 60) })
    .then(({ error }) => {
      if (error && isMissingEventTable(error.message)) {
        console.warn(
          `[analytics] paused: table public.${EVENTS_TABLE} does not exist yet. ` +
            'Run supabase/schema.sql (site_events section) in the Supabase SQL editor, then reload.'
        );
      }
    });
};

const isMissingEventTable = (message: string): boolean =>
  message.includes('Could not find the table') && message.includes(EVENTS_TABLE);

export interface AnalyticsSummary {
  total: number;
  today: number;
  yesterday: number;
  week: number;
  prevWeek: number;
  topPath: string;
  topCount: number;
}

interface ViewRow {
  path: string;
  created_at: string;
}

const DAY_MS = 86400000;

const startOfDay = (d: Date): number => {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c.getTime();
};

/** Aggregate the last 30 days of views into dashboard numbers. Returns null when unavailable. */export const getAnalyticsSummary = async (): Promise<AnalyticsSummary | null> => {
  if (!isCloudConfigured()) return null;
  if (Date.now() < unavailableUntil()) return null;
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const since = new Date(Date.now() - 30 * DAY_MS).toISOString();
    const { data, error } = await sb
      .from(TABLE)
      .select('path, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(10000);
    if (error || !data) {
      if (error && isMissingTable(error.message)) {
        suppressTracking();
        reportUnavailable();
      } else {
        console.warn('[analytics] fetch failed:', error?.message);
      }
      return null;
    }
    const rows = data as ViewRow[];
    const now = Date.now();
    const todayStart = startOfDay(new Date());
    let today = 0;
    let yesterday = 0;
    let week = 0;
    let prevWeek = 0;
    const perPath: Record<string, number> = {};
    for (const row of rows) {
      const t = new Date(row.created_at).getTime();
      if (Number.isNaN(t)) continue;
      if (t >= todayStart) today += 1;
      else if (t >= todayStart - DAY_MS) yesterday += 1;
      if (t >= now - 7 * DAY_MS) week += 1;
      else if (t >= now - 14 * DAY_MS) prevWeek += 1;
      perPath[row.path] = (perPath[row.path] || 0) + 1;
    }
    let topPath = '/';
    let topCount = 0;
    for (const [p, c] of Object.entries(perPath)) {
      if (c > topCount) {
        topPath = p;
        topCount = c;
      }
    }
    // Total is all-time: ask the DB for an exact count (head query, no rows)
    let total = rows.length;
    const { count } = await sb.from(TABLE).select('id', { count: 'exact', head: true });
    if (typeof count === 'number') total = count;
    return { total, today, yesterday, week, prevWeek, topPath, topCount };
  } catch (e) {
    console.warn('[analytics] summary error:', e);
    return null;
  }
};
