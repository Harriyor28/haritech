import { APPLIANCE_CATALOGUE } from '../config/solar/appliances';
import { DEFAULT_ASSUMPTIONS } from '../config/solar/assumptions';
import { pushToCloud } from './cloudSync';
import type {
  ApplianceTemplate,
  SolarAdvisorConfig,
  SolarAssumptions,
} from './solar/types';

export const SOLAR_ADVISOR_KEY = 'haritech-solar-advisor';
export const SOLAR_ADVISOR_EVENT = 'haritech-solar-advisor-updated';

const isTemplate = (value: unknown): value is ApplianceTemplate => {
  if (!value || typeof value !== 'object') return false;
  const item = value as ApplianceTemplate;
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.watts === 'number' &&
    typeof item.defaultHours === 'number'
  );
};

const mergeAssumptions = (value: unknown): SolarAssumptions => {
  if (!value || typeof value !== 'object') return { ...DEFAULT_ASSUMPTIONS };
  const source = value as Partial<SolarAssumptions>;
  const sizes = Array.isArray(source.inverterSizesKva)
    ? source.inverterSizesKva.filter((size) => typeof size === 'number' && size > 0)
    : [];
  return {
    inverterHeadroom: typeof source.inverterHeadroom === 'number' ? source.inverterHeadroom : DEFAULT_ASSUMPTIONS.inverterHeadroom,
    powerFactor: typeof source.powerFactor === 'number' ? source.powerFactor : DEFAULT_ASSUMPTIONS.powerFactor,
    inverterEfficiency: typeof source.inverterEfficiency === 'number' ? source.inverterEfficiency : DEFAULT_ASSUMPTIONS.inverterEfficiency,
    depthOfDischarge: typeof source.depthOfDischarge === 'number' ? source.depthOfDischarge : DEFAULT_ASSUMPTIONS.depthOfDischarge,
    reserveMarginPct: typeof source.reserveMarginPct === 'number' ? source.reserveMarginPct : DEFAULT_ASSUMPTIONS.reserveMarginPct,
    systemEfficiency: typeof source.systemEfficiency === 'number' ? source.systemEfficiency : DEFAULT_ASSUMPTIONS.systemEfficiency,
    chargeEfficiency: typeof source.chargeEfficiency === 'number' ? source.chargeEfficiency : DEFAULT_ASSUMPTIONS.chargeEfficiency,
    temperatureSafetyFactor: typeof source.temperatureSafetyFactor === 'number' ? source.temperatureSafetyFactor : DEFAULT_ASSUMPTIONS.temperatureSafetyFactor,
    monthlyDays: typeof source.monthlyDays === 'number' ? source.monthlyDays : DEFAULT_ASSUMPTIONS.monthlyDays,
    inverterSizesKva: sizes.length > 0 ? sizes.sort((a, b) => a - b) : [...DEFAULT_ASSUMPTIONS.inverterSizesKva],
  };
};

export const defaultSolarAdvisorConfig = (): SolarAdvisorConfig => ({
  version: 1,
  updatedAt: new Date(0).toISOString(),
  lastChange: 'Initial catalogue and engineering defaults.',
  appliances: APPLIANCE_CATALOGUE.map((item) => ({ ...item })),
  assumptions: { ...DEFAULT_ASSUMPTIONS },
});

export const getSolarAdvisorConfig = (): SolarAdvisorConfig => {
  try {
    const raw = window.localStorage.getItem(SOLAR_ADVISOR_KEY);
    if (!raw) return defaultSolarAdvisorConfig();
    const parsed = JSON.parse(raw) as Partial<SolarAdvisorConfig>;
    const appliances = Array.isArray(parsed.appliances)
      ? parsed.appliances.filter(isTemplate)
      : [];
    return {
      version: typeof parsed.version === 'number' ? parsed.version : 1,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date(0).toISOString(),
      lastChange: typeof parsed.lastChange === 'string' ? parsed.lastChange : 'Initial catalogue and engineering defaults.',
      appliances: appliances.length > 0 ? appliances : APPLIANCE_CATALOGUE.map((item) => ({ ...item })),
      assumptions: mergeAssumptions(parsed.assumptions),
    };
  } catch {
    return defaultSolarAdvisorConfig();
  }
};

export const setSolarAdvisorConfig = (config: SolarAdvisorConfig): boolean => {
  const next: SolarAdvisorConfig = {
    ...config,
    version: config.version + 1,
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(SOLAR_ADVISOR_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(SOLAR_ADVISOR_EVENT));
  } catch {
    return false;
  }
  void pushToCloud(SOLAR_ADVISOR_KEY, next);
  return true;
};

export const resetSolarAdvisorConfig = (): void => {
  try {
    window.localStorage.removeItem(SOLAR_ADVISOR_KEY);
    window.dispatchEvent(new Event(SOLAR_ADVISOR_EVENT));
  } catch {
    /* storage unavailable */
  }
  void pushToCloud(SOLAR_ADVISOR_KEY, defaultSolarAdvisorConfig());
};
