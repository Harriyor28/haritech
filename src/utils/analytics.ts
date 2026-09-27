import { getSupabase, isCloudConfigured } from './supabaseClient';

const TABLE = 'page_views';
const MAX_PATH_LEN = 200;

let lastTrackedPath = '';
let lastTrackedAt = 0;

/** Record one page view. Fire-and-forget, safe to call on every route change. */
export const trackPageView = (path: string): void => {
  if (!isCloudConfigured()) return;
  const clean = (path.split('?')[0].split('#')[0] || '/').slice(0, MAX_PATH_LEN);
  const now = Date.now();
  // Guard against React StrictMode double-firing the same view in dev
  if (clean === lastTrackedPath && now - lastTrackedAt < 10000) return;
  lastTrackedPath = clean;
  lastTrackedAt = now;
  const sb = getSupabase();
  if (!sb) return;
  void sb
    .from(TABLE)
    .insert({ path: clean })
    .then(({ error }) => {
      if (error) console.warn('[analytics] track failed:', error.message);
    });
};

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

/** Aggregate the last 30 days of views into dashboard numbers. Returns null when unavailable. */
export const getAnalyticsSummary = async (): Promise<AnalyticsSummary | null> => {
  if (!isCloudConfigured()) return null;
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
      console.warn('[analytics] fetch failed:', error?.message);
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
