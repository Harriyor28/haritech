import type { ApplianceTemplate, AssessmentInput } from './types';

export const createDefaultInput = (): AssessmentInput => ({
  buildingType: 'residential',
  intendedUse: 'essential',
  budgetNgn: null,
  ownsInverter: false,
  ownsBattery: false,
  ownsPanels: false,
  wantsBackup: true,
  wantsNightUse: true,
  wantsExpansion: false,
  backupHours: 8,
  reserveMarginPct: 10,
  powerFactor: 0.8,
  phase: 'single',
  peakSunHours: null,
  systemEfficiency: 0.75,
  inverterEfficiency: 0.9,
  depthOfDischarge: 0.8,
  batteryVoltage: null,
  batteryModuleVoltage: null,
  batteryModuleKwh: null,
  batteryMaxDischargeKw: null,
  existingInverterKva: null,
  existingInverterBatteryVoltage: null,
  existingBatteryKwh: null,
  panelWatt: null,
  panelVoc: null,
  panelVmp: null,
  panelIsc: null,
  panelImp: null,
  inverterMaxPvKw: null,
  mpptMinV: null,
  mpptMaxV: null,
  maxPvVoltage: null,
  maxChargeCurrent: null,
  appliances: [],
});

const newUid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `app-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const entryFromTemplate = (template: ApplianceTemplate) => ({
  uid: newUid(),
  templateId: template.id,
  name: template.name,
  category: template.category,
  watts: template.watts,
  quantity: 1,
  hoursPerDay: template.defaultHours,
  surgeWatts: template.surgeWatts,
  duty: template.duty,
  simultaneous: template.duty === 'continuous',
  backup: template.category === 'lighting' || template.category === 'office',
  backupHours: 0,
  scheduleStart: template.duty === 'scheduled' ? 18 : null,
  scheduleEnd: template.duty === 'scheduled' ? 6 : null,
});

export const createEmptyEntry = () => ({
  uid: newUid(),
  templateId: null,
  name: 'Custom appliance',
  category: 'other' as const,
  watts: 100,
  quantity: 1,
  hoursPerDay: 2,
  surgeWatts: null,
  duty: 'intermittent' as const,
  simultaneous: false,
  backup: false,
  backupHours: 0,
  scheduleStart: null,
  scheduleEnd: null,
});
