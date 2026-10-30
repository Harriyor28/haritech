import type { ApplianceEntry, ApplianceResult, EnergyResult, SimultaneousBasis } from './types';
import {
  applianceBackupKwh,
  applianceDailyWh,
  nonNegative,
  roundTo,
  scheduledHours,
} from './validation';

const runningKw = (entry: ApplianceEntry): number =>
  (nonNegative(entry.watts) * Math.max(1, Math.floor(nonNegative(entry.quantity, 1)))) / 1000;

const schedulePeak = (appliances: ApplianceEntry[]): number => {
  const slots = new Array<number>(24).fill(0);
  let scheduled = false;
  for (const entry of appliances) {
    const hours = scheduledHours(entry.scheduleStart, entry.scheduleEnd);
    if (hours.length === 0) continue;
    scheduled = true;
    const kw = runningKw(entry);
    for (const hour of hours) slots[hour] += kw;
  }
  if (!scheduled) return 0;
  return Math.max(...slots);
};

const surgeFor = (appliances: ApplianceEntry[], basis: SimultaneousBasis): number | null => {
  const contributing =
    basis === 'declared'
      ? appliances.filter((entry) => entry.simultaneous)
      : basis === 'schedule'
        ? appliances.filter((entry) => entry.scheduleStart !== null && entry.scheduleEnd !== null)
        : basis === 'continuous'
          ? appliances.filter((entry) => entry.duty === 'continuous')
          : [];
  let largestDelta = 0;
  for (const entry of contributing) {
    if (entry.surgeWatts === null) continue;
    const surge = nonNegative(entry.surgeWatts);
    const running = nonNegative(entry.watts);
    if (surge > running) largestDelta = Math.max(largestDelta, surge - running);
  }
  return largestDelta > 0 ? largestDelta / 1000 : null;
};

export const calculateEnergy = (
  appliances: ApplianceEntry[],
  backupHours: number,
  monthlyDays: number,
): EnergyResult => {
  const applianceResults: ApplianceResult[] = appliances.map((entry) => {
    const dailyWh = applianceDailyWh(entry);
    return {
      uid: entry.uid,
      name: entry.name,
      dailyWh,
      dailyKwh: dailyWh / 1000,
      backupKwh: applianceBackupKwh(entry, backupHours),
    };
  });

  const totalDailyWh = applianceResults.reduce((sum, item) => sum + item.dailyWh, 0);
  const totalDailyKwh = totalDailyWh / 1000;
  const backupAcKwh = applianceResults.reduce((sum, item) => sum + item.backupKwh, 0);

  const declaredSimultaneousKw = appliances
    .filter((entry) => entry.simultaneous)
    .reduce((sum, entry) => sum + runningKw(entry), 0);
  const schedulePeakKw = schedulePeak(appliances);
  const continuousKw = appliances
    .filter((entry) => entry.duty === 'continuous')
    .reduce((sum, entry) => sum + runningKw(entry), 0);

  let simultaneousKw = 0;
  let simultaneousBasis: SimultaneousBasis = 'none';
  if (declaredSimultaneousKw > 0 || schedulePeakKw > 0) {
    if (declaredSimultaneousKw >= schedulePeakKw) {
      simultaneousKw = declaredSimultaneousKw;
      simultaneousBasis = declaredSimultaneousKw > 0 ? 'declared' : 'schedule';
    } else {
      simultaneousKw = schedulePeakKw;
      simultaneousBasis = 'schedule';
    }
  } else if (continuousKw > 0) {
    simultaneousKw = continuousKw;
    simultaneousBasis = 'continuous';
  }

  const surgeDeltaKw = surgeFor(appliances, simultaneousBasis);
  const surgeDemandKw = surgeDeltaKw === null ? null : simultaneousKw + surgeDeltaKw;

  const warnings: string[] = [];
  if (appliances.length === 0) {
    warnings.push('No appliances have been added yet. Add at least one appliance to calculate energy use.');
  }
  if (totalDailyKwh > 0 && simultaneousBasis === 'continuous') {
    warnings.push(
      'No appliances were marked as running together and no operating schedules were supplied, so the simultaneous load is estimated from continuous appliances only.',
    );
  }
  if (totalDailyKwh > 0 && simultaneousBasis === 'none') {
    warnings.push('The simultaneous running load could not be estimated from the current inputs.');
  }
  if (totalDailyKwh > 0 && surgeDemandKw === null) {
    warnings.push(
      'No starting or surge figures were supplied. Motor-driven appliances can draw several times their running load at start-up.',
    );
  }
  if (appliances.some((entry) => /refriger|freezer|air condition/i.test(entry.name))) {
    warnings.push(
      'Refrigerators, freezers and air conditioners cycle on and off. Their real consumption may differ from a simple watts × hours estimate.',
    );
  }
  if (appliances.some((entry) => entry.hoursPerDay > 24 || entry.hoursPerDay < 0)) {
    warnings.push('One or more operating hours were outside 0–24 and have been clamped.');
  }
  if (appliances.some((entry) => entry.watts <= 0)) {
    warnings.push('One or more appliances have a wattage of zero. Check the appliance label.');
  }

  return {
    totalDailyWh: roundTo(totalDailyWh, 0),
    totalDailyKwh: roundTo(totalDailyKwh, 3),
    weeklyKwh: roundTo(totalDailyKwh * 7, 3),
    monthlyKwh: roundTo(totalDailyKwh * monthlyDays, 3),
    declaredSimultaneousKw: roundTo(declaredSimultaneousKw, 3),
    schedulePeakKw: roundTo(schedulePeakKw, 3),
    simultaneousKw: roundTo(simultaneousKw, 3),
    simultaneousBasis,
    surgeDemandKw: surgeDemandKw === null ? null : roundTo(surgeDemandKw, 3),
    backupAcKwh: roundTo(backupAcKwh, 3),
    applianceResults,
    warnings,
  };
};
