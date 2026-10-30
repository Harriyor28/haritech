import type { AssessmentInput } from './types';

const DRAFT_KEY = 'haritech-solar-assessment-draft';
const HISTORY_KEY = 'haritech-solar-assessment-history';
const HISTORY_LIMIT = 12;

export interface SavedAssessment {
  id: string;
  label: string;
  savedAt: string;
  input: AssessmentInput;
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

const isAssessmentInput = (value: unknown): value is AssessmentInput => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as AssessmentInput;
  return Array.isArray(candidate.appliances) && typeof candidate.backupHours === 'number';
};

export const loadDraft = (): AssessmentInput | null => {
  const draft = readJson<AssessmentInput>(DRAFT_KEY);
  return draft && isAssessmentInput(draft) ? draft : null;
};

export const saveDraft = (input: AssessmentInput): boolean => writeJson(DRAFT_KEY, input);

export const clearDraft = (): void => {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* storage unavailable */
  }
};

export const listAssessments = (): SavedAssessment[] => {
  const rows = readJson<SavedAssessment[]>(HISTORY_KEY);
  return Array.isArray(rows) ? rows.filter((row) => row && isAssessmentInput(row.input)) : [];
};

export const saveAssessment = (input: AssessmentInput, label: string): SavedAssessment | null => {
  const row: SavedAssessment = {
    id: `assessment-${Date.now()}`,
    label: label.trim() || 'Solar assessment',
    savedAt: new Date().toISOString(),
    input,
  };
  const rows = [row, ...listAssessments()].slice(0, HISTORY_LIMIT);
  return writeJson(HISTORY_KEY, rows) ? row : null;
};

export const deleteAssessment = (id: string): void => {
  writeJson(HISTORY_KEY, listAssessments().filter((row) => row.id !== id));
};

/** Merge assessments pulled from the cloud into this browser. Rows already
    present (same id) are left alone, so a restore never duplicates. Returns
    how many new rows were added; the local history cap still applies. */
export const adoptAssessments = (rows: SavedAssessment[]): number => {
  const existing = listAssessments();
  const known = new Set(existing.map((row) => row.id));
  const additions = rows.filter((row) => !known.has(row.id));
  if (additions.length === 0) return 0;
  const merged = [...existing, ...additions].sort(
    (a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt),
  );
  writeJson(HISTORY_KEY, merged.slice(0, HISTORY_LIMIT));
  return additions.length;
};

export const clearAssessmentHistory = (): void => {
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* storage unavailable */
  }
};
