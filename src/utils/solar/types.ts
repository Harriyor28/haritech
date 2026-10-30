/* Shared types for the Haritech Smart Solar Advisor.
   These are type-only exports: the calculation modules and their tests can
   import them without creating a runtime dependency. */

export type ApplianceCategory = 'lighting' | 'home' | 'office' | 'business' | 'other';

export type Duty = 'continuous' | 'intermittent' | 'scheduled';

export type BuildingType = 'residential' | 'commercial' | 'industrial' | 'other';

export type IntendedUse =
  | 'essential'
  | 'whole-home'
  | 'office'
  | 'shop'
  | 'business'
  | 'industrial';

export type PhaseType = 'single' | 'three';

export interface ApplianceTemplate {
  id: string;
  name: string;
  category: ApplianceCategory;
  watts: number;
  surgeWatts: number | null;
  defaultHours: number;
  duty: Duty;
  note: string;
}

export interface ApplianceEntry {
  uid: string;
  templateId: string | null;
  name: string;
  category: ApplianceCategory;
  watts: number;
  quantity: number;
  hoursPerDay: number;
  surgeWatts: number | null;
  duty: Duty;
  simultaneous: boolean;
  backup: boolean;
  backupHours: number;
  scheduleStart: number | null;
  scheduleEnd: number | null;
}

export interface CustomerDetails {
  name: string;
  location: string;
  contact: string;
}

export interface AssessmentInput {
  buildingType: BuildingType;
  intendedUse: IntendedUse;
  budgetNgn: number | null;
  ownsInverter: boolean;
  ownsBattery: boolean;
  ownsPanels: boolean;
  wantsBackup: boolean;
  wantsNightUse: boolean;
  wantsExpansion: boolean;
  backupHours: number;
  reserveMarginPct: number;
  powerFactor: number;
  phase: PhaseType;
  peakSunHours: number | null;
  systemEfficiency: number;
  inverterEfficiency: number;
  depthOfDischarge: number;
  batteryVoltage: number | null;
  batteryModuleVoltage: number | null;
  batteryModuleKwh: number | null;
  batteryMaxDischargeKw: number | null;
  existingInverterKva: number | null;
  existingInverterBatteryVoltage: number | null;
  existingBatteryKwh: number | null;
  panelWatt: number | null;
  panelVoc: number | null;
  panelVmp: number | null;
  panelIsc: number | null;
  panelImp: number | null;
  inverterMaxPvKw: number | null;
  mpptMinV: number | null;
  mpptMaxV: number | null;
  maxPvVoltage: number | null;
  maxChargeCurrent: number | null;
  appliances: ApplianceEntry[];
}

export interface ApplianceResult {
  uid: string;
  name: string;
  dailyWh: number;
  dailyKwh: number;
  backupKwh: number;
}

export type SimultaneousBasis = 'declared' | 'schedule' | 'continuous' | 'none';

export interface EnergyResult {
  totalDailyWh: number;
  totalDailyKwh: number;
  weeklyKwh: number;
  monthlyKwh: number;
  declaredSimultaneousKw: number;
  schedulePeakKw: number;
  simultaneousKw: number;
  simultaneousBasis: SimultaneousBasis;
  surgeDemandKw: number | null;
  backupAcKwh: number;
  applianceResults: ApplianceResult[];
  warnings: string[];
}

export interface InverterResult {
  requiredContinuousKw: number;
  requiredKva: number;
  recommendedKva: number | null;
  recommendedContinuousKw: number | null;
  surgeRequiredKw: number | null;
  warnings: string[];
}

export interface BatteryResult {
  requiredNominalKwh: number;
  usableKwh: number;
  acBackupKwh: number;
  voltage: number | null;
  requiredAh: number | null;
  seriesCount: number | null;
  parallelCount: number | null;
  actualBankKwh: number | null;
  configuration: string;
  powerCheck: 'ok' | 'insufficient' | 'unknown';
  warnings: string[];
}

export interface PvResult {
  requiredSolarKwh: number;
  pvKwp: number | null;
  panelCount: number | null;
  maxSeries: number | null;
  minSeries: number | null;
  stringCheck: 'ok' | 'warning' | 'unknown';
  warnings: string[];
}

export interface PackageRecommendation {
  id: string | null;
  label: string;
  priceNgn: number | null;
  kva: number | null;
  fits: boolean;
  note: string;
}

export interface AdvisorResult {
  energy: EnergyResult;
  inverter: InverterResult;
  battery: BatteryResult;
  pv: PvResult;
  package: PackageRecommendation;
  warnings: string[];
  assumptions: string[];
}

export interface SolarAssumptions {
  inverterHeadroom: number;
  powerFactor: number;
  inverterEfficiency: number;
  depthOfDischarge: number;
  reserveMarginPct: number;
  systemEfficiency: number;
  chargeEfficiency: number;
  temperatureSafetyFactor: number;
  monthlyDays: number;
  inverterSizesKva: number[];
}

export interface SolarAdvisorConfig {
  version: number;
  updatedAt: string;
  lastChange: string;
  appliances: ApplianceTemplate[];
  assumptions: SolarAssumptions;
}

/* ── Solar Power Monitor ──────────────────────────────────────────────
   The monitor works from readings a customer or installer types in. It has
   no live inverter connection, so every field is nullable: a missing value
   must produce "not enough information", never an invented number. */

export type BatteryDirection = 'charging' | 'discharging' | 'idle' | 'unknown';

export type VoltageBandStatus = 'low' | 'within' | 'full' | 'unknown';

export interface MonitorSystem {
  bankKwh: number | null;
  bankVoltage: number | null;
  depthOfDischargePct: number;
  inverterEfficiencyPct: number;
  lowCutoffV: number | null;
  fullChargeV: number | null;
  maxTemperatureC: number | null;
}

export interface MonitorOwner {
  name: string;
  location: string;
  contact: string;
}

export interface MonitorReading {
  takenAt: string;
  batteryVoltage: number | null;
  /** Positive = charging, negative = discharging, as shown on the inverter. */
  batteryCurrentA: number | null;
  acLoadKw: number | null;
  pvInputKw: number | null;
  socPct: number | null;
  temperatureC: number | null;
  /** Average load the customer wants the runtime estimate calculated at. */
  runtimeLoadKw: number | null;
  note: string;
}

export interface MonitorResult {
  batteryPowerKw: number | null;
  direction: BatteryDirection;
  dcDischargeKw: number | null;
  acDischargeKw: number | null;
  availableKwh: number | null;
  availableBasis: string;
  runtimeHours: number | null;
  runtimeBasis: string;
  chargeDeficitKwh: number | null;
  chargeHours: number | null;
  chargeBasis: string;
  voltageStatus: VoltageBandStatus;
  voltageNote: string;
  temperatureState: 'hot' | 'normal' | 'unknown';
  observations: string[];
  missing: string[];
}
