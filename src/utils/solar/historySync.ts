/* Bridges the browser copies of solar history with the optional cloud copy.

   The browser is always the source of truth. These functions only run when the
   customer presses Back up or Restore, so energy data is never uploaded
   silently. Every result says what actually happened, including the case where
   the database step has not been applied yet. */

import type { AssessmentInput, MonitorReading, MonitorSystem } from './types';
import {
  adoptAssessments,
  listAssessments,
  type SavedAssessment,
} from './storage';
import {
  adoptReadings,
  listReadings,
  type SavedReading,
} from './monitorStorage';
import {
  deleteAllCloudRecords,
  fetchCloudRecords,
  saveCloudRecord,
  type CloudRecord,
} from './cloudHistory';

export interface BackupResult {
  uploaded: number;
  skipped: number;
  failed: number;
  /** True when the cloud could not be reached at all. */
  unreachable: boolean;
}

export interface RestoreResult {
  added: number;
  unreachable: boolean;
}

export interface DeleteCloudResult {
  deleted: number;
  failed: boolean;
}

const localIdOf = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null;
  const value = (payload as { localId?: unknown }).localId;
  return typeof value === 'string' ? value : null;
};

const isAssessmentInput = (value: unknown): value is AssessmentInput => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as AssessmentInput;
  return (
    Array.isArray(candidate.appliances) &&
    typeof candidate.backupHours === 'number'
  );
};

const isSystem = (value: unknown): value is MonitorSystem => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as MonitorSystem;
  return (
    typeof candidate.depthOfDischargePct === 'number' &&
    typeof candidate.inverterEfficiencyPct === 'number'
  );
};

const isReading = (value: unknown): value is MonitorReading => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as MonitorReading;
  return typeof candidate.takenAt === 'string' && typeof candidate.note === 'string';
};

const knownLocalIds = (records: CloudRecord[]): Set<string> => {
  const ids = new Set<string>();
  records.forEach((record) => {
    const id = localIdOf(record.payload);
    if (id) ids.add(id);
  });
  return ids;
};

/* ── Assessments ─────────────────────────────────────────────────────── */

export const backupAssessments = async (): Promise<BackupResult> => {
  const rows = listAssessments();
  if (rows.length === 0) {
    return { uploaded: 0, skipped: 0, failed: 0, unreachable: false };
  }
  const cloud = await fetchCloudRecords('assessment');
  if (!cloud.ok) {
    return { uploaded: 0, skipped: 0, failed: rows.length, unreachable: true };
  }
  const known = knownLocalIds(cloud.records);
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  for (const row of rows) {
    if (known.has(row.id)) {
      skipped += 1;
      continue;
    }
    const id = await saveCloudRecord('assessment', row.label, {
      localId: row.id,
      savedAt: row.savedAt,
      input: row.input,
    });
    if (id === null) failed += 1;
    else uploaded += 1;
  }
  return { uploaded, skipped, failed, unreachable: false };
};

export const restoreAssessments = async (): Promise<RestoreResult> => {
  const cloud = await fetchCloudRecords('assessment');
  if (!cloud.ok) return { added: 0, unreachable: true };
  const rows: SavedAssessment[] = [];
  for (const record of cloud.records) {
    if (!record.payload || typeof record.payload !== 'object') continue;
    const data = record.payload as {
      localId?: unknown;
      savedAt?: unknown;
      input?: unknown;
    };
    if (!isAssessmentInput(data.input)) continue;
    rows.push({
      id: typeof data.localId === 'string' ? data.localId : `assessment-cloud-${record.id}`,
      label: record.label || 'Solar assessment',
      savedAt: typeof data.savedAt === 'string' ? data.savedAt : record.createdAt,
      input: data.input,
    });
  }
  return { added: adoptAssessments(rows), unreachable: false };
};

export const deleteCloudAssessments = async (): Promise<DeleteCloudResult> => {
  const deleted = await deleteAllCloudRecords('assessment');
  return { deleted: deleted < 0 ? 0 : deleted, failed: deleted < 0 };
};

/* ── Monitor readings ────────────────────────────────────────────────── */

export const backupReadings = async (): Promise<BackupResult> => {
  const rows = listReadings();
  if (rows.length === 0) {
    return { uploaded: 0, skipped: 0, failed: 0, unreachable: false };
  }
  const cloud = await fetchCloudRecords('reading');
  if (!cloud.ok) {
    return { uploaded: 0, skipped: 0, failed: rows.length, unreachable: true };
  }
  const known = knownLocalIds(cloud.records);
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  for (const row of rows) {
    if (known.has(row.id)) {
      skipped += 1;
      continue;
    }
    const id = await saveCloudRecord('reading', row.reading.note.trim() || 'Solar reading', {
      localId: row.id,
      savedAt: row.savedAt,
      system: row.system,
      reading: row.reading,
    });
    if (id === null) failed += 1;
    else uploaded += 1;
  }
  return { uploaded, skipped, failed, unreachable: false };
};

export const restoreReadings = async (): Promise<RestoreResult> => {
  const cloud = await fetchCloudRecords('reading');
  if (!cloud.ok) return { added: 0, unreachable: true };
  const rows: SavedReading[] = [];
  for (const record of cloud.records) {
    if (!record.payload || typeof record.payload !== 'object') continue;
    const data = record.payload as {
      localId?: unknown;
      savedAt?: unknown;
      system?: unknown;
      reading?: unknown;
    };
    if (!isSystem(data.system) || !isReading(data.reading)) continue;
    rows.push({
      id: typeof data.localId === 'string' ? data.localId : `reading-cloud-${record.id}`,
      savedAt: typeof data.savedAt === 'string' ? data.savedAt : record.createdAt,
      system: data.system,
      reading: data.reading,
    });
  }
  return { added: adoptReadings(rows), unreachable: false };
};

export const deleteCloudReadings = async (): Promise<DeleteCloudResult> => {
  const deleted = await deleteAllCloudRecords('reading');
  return { deleted: deleted < 0 ? 0 : deleted, failed: deleted < 0 };
};
