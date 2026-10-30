import type { ApplianceEntry } from './types';

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const clampInt = (value: number, min: number, max: number): number =>
  Math.round(clamp(value, min, max));

export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const nonNegative = (value: number, fallback = 0): number =>
  isFiniteNumber(value) ? Math.max(0, value) : fallback;

export const positiveOrNull = (value: number | null): number | null =>
  isFiniteNumber(value) && value > 0 ? value : null;

export const percentToFactor = (value: number): number =>
  clamp(isFiniteNumber(value) ? value : 0, 0, 100) / 100;

export const roundTo = (value: number, decimals = 2): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/** Hours in a daily schedule. A start equal to the end is treated as 24 hours. */
export const scheduledHours = (start: number | null, end: number | null): number[] => {
  if (start === null || end === null) return [];
  const s = clampInt(start, 0, 23);
  const e = clampInt(end, 0, 23);
  if (s === e) return Array.from({ length: 24 }, (_, i) => i);
  const hours: number[] = [];
  let hour = s;
  for (let guard = 0; guard < 24; guard += 1) {
    hours.push(hour);
    hour = (hour + 1) % 24;
    if (hour === e) break;
  }
  return hours;
};

export const applianceDailyWh = (entry: ApplianceEntry): number => {
  const watts = nonNegative(entry.watts);
  const quantity = Math.max(1, Math.floor(nonNegative(entry.quantity, 1)));
  const hours = clamp(nonNegative(entry.hoursPerDay), 0, 24);
  return watts * quantity * hours;
};

export const applianceBackupKwh = (entry: ApplianceEntry, globalBackupHours: number): number => {
  if (!entry.backup) return 0;
  const watts = nonNegative(entry.watts);
  const quantity = Math.max(1, Math.floor(nonNegative(entry.quantity, 1)));
  const dailyHours = clamp(nonNegative(entry.hoursPerDay), 0, 24);
  const requested = entry.backupHours > 0 ? entry.backupHours : globalBackupHours;
  const hours = clamp(nonNegative(requested), 0, dailyHours);
  return (watts * quantity * hours) / 1000;
};
