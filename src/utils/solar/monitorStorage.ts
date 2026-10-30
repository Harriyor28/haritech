/* Private browser storage for the Solar Power Monitor.

   Readings stay on the customer's device. They are never uploaded to
   site_data, never shown in the admin catalogue editor and never exposed to
   other visitors. The monitor stores no inverter password, API key or token. */

import type { MonitorOwner, MonitorReading, MonitorSystem } from './types';

const SYSTEM_KEY = 'haritech-solar-monitor-system';
const OWNER_KEY = 'haritech-solar-monitor-owner';
const DRAFT_KEY = 'haritech-solar-monitor-draft';
const HISTORY_KEY = 'haritech-solar-monitor-history';
const HISTORY_LIMIT = 30;

export interface SavedReading {
  id: string;
  savedAt: string;
  system: MonitorSystem;
  reading: MonitorReading;
}

const readJson = <T>(key: string): T | null => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const writeJson = (key: string, value: unknown): boolean => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const isMonitorSystem = (value: unknown): value is MonitorSystem => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as MonitorSystem;
  return (
    typeof candidate.depthOfDischargePct === 'number' &&
    typeof candidate.inverterEfficiencyPct === 'number'
  );
};

const isMonitorReading = (value: unknown): value is MonitorReading => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as MonitorReading;
  return typeof candidate.takenAt === 'string' && typeof candidate.note === 'string';
};

export const loadMonitorSystem = (): MonitorSystem | null => {
  const stored = readJson<MonitorSystem>(SYSTEM_KEY);
  return stored && isMonitorSystem(stored) ? stored : null;
};

export const saveMonitorSystem = (system: MonitorSystem): boolean =>
  writeJson(SYSTEM_KEY, system);

const emptyOwner: MonitorOwner = { name: '', location: '', contact: '' };

export const loadMonitorOwner = (): MonitorOwner => {
  const stored = readJson<MonitorOwner>(OWNER_KEY);
  if (!stored || typeof stored !== 'object') return emptyOwner;
  return {
    name: typeof stored.name === 'string' ? stored.name : '',
    location: typeof stored.location === 'string' ? stored.location : '',
    contact: typeof stored.contact === 'string' ? stored.contact : '',
  };
};

export const saveMonitorOwner = (owner: MonitorOwner): boolean =>
  writeJson(OWNER_KEY, owner);

export const loadMonitorDraft = (): MonitorReading | null => {
  const stored = readJson<MonitorReading>(DRAFT_KEY);
  return stored && isMonitorReading(stored) ? stored : null;
};

export const saveMonitorDraft = (reading: MonitorReading): boolean =>
  writeJson(DRAFT_KEY, reading);

export const clearMonitorDraft = (): void => {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* storage unavailable */
  }
};

export const listReadings = (): SavedReading[] => {
  const rows = readJson<SavedReading[]>(HISTORY_KEY);
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (row) =>
      row &&
      typeof row.id === 'string' &&
      isMonitorSystem(row.system) &&
      isMonitorReading(row.reading),
  );
};

export const saveReading = (
  system: MonitorSystem,
  reading: MonitorReading,
): SavedReading | null => {
  const row: SavedReading = {
    id: `reading-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
    system,
    reading,
  };
  const rows = [row, ...listReadings()].slice(0, HISTORY_LIMIT);
  return writeJson(HISTORY_KEY, rows) ? row : null;
};

export const deleteReading = (id: string): void => {
  writeJson(HISTORY_KEY, listReadings().filter((row) => row.id !== id));
};

/** Merge readings pulled from the cloud into this browser. Rows already
    present (same id) are left alone, so a restore never duplicates. Returns
    how many new rows were added; the local history cap still applies. */
export const adoptReadings = (rows: SavedReading[]): number => {
  const existing = listReadings();
  const known = new Set(existing.map((row) => row.id));
  const additions = rows.filter((row) => !known.has(row.id));
  if (additions.length === 0) return 0;
  const merged = [...existing, ...additions].sort(
    (a, b) => Date.parse(b.reading.takenAt) - Date.parse(a.reading.takenAt),
  );
  writeJson(HISTORY_KEY, merged.slice(0, HISTORY_LIMIT));
  return additions.length;
};

export const clearReadings = (): void => {
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* storage unavailable */
  }
};
