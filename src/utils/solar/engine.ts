import type {
  AdvisorResult,
  AssessmentInput,
  PackageRecommendation,
  SolarAssumptions,
} from './types';
import { calculateEnergy } from './energy';
import { sizeInverter } from './inverter';
import { sizeBattery } from './battery';
import { sizePv } from './pv';
import { PACKAGE_CONTENTS_NOTE, SOLAR_PACKAGES } from '../../config/solar/packages';
import { roundTo } from './validation';

const recommendPackage = (requiredKva: number, recommendedKva: number | null): PackageRecommendation => {
  const target = recommendedKva ?? requiredKva;
  if (!(target > 0)) {
    return {
      id: null,
      label: 'No package selected',
      priceNgn: null,
      kva: null,
      fits: false,
      note:
        'Add appliances and mark which ones run together before a published package can be matched.',
    };
  }
  const match = SOLAR_PACKAGES.find((item) => item.kva >= target);
  if (!match) {
    return {
      id: null,
      label: 'Custom system',
      priceNgn: null,
      kva: null,
      fits: false,
      note:
        'The calculated requirement is above the published 20 kVA package. A custom quotation and site assessment are required.',
    };
  }
  return {
    id: match.id,
    label: match.label,
    priceNgn: match.priceNgn,
    kva: match.kva,
    fits: recommendedKva === null ? match.kva >= requiredKva : match.kva >= recommendedKva,
    note: PACKAGE_CONTENTS_NOTE,
  };
};

export const runAssessment = (
  input: AssessmentInput,
  assumptions: SolarAssumptions,
): AdvisorResult => {
  const energy = calculateEnergy(input.appliances, input.backupHours, assumptions.monthlyDays);

  const inverter = sizeInverter({
    simultaneousKw: energy.simultaneousKw,
    surgeKw: energy.surgeDemandKw,
    powerFactor: input.powerFactor || assumptions.powerFactor,
    headroom: assumptions.inverterHeadroom,
    sizesKva: assumptions.inverterSizesKva,
    existingKva: input.existingInverterKva,
    phase: input.phase,
  });

  const battery = sizeBattery({
    acBackupKwh: energy.backupAcKwh,
    inverterEfficiency: input.inverterEfficiency || assumptions.inverterEfficiency,
    depthOfDischarge: input.depthOfDischarge || assumptions.depthOfDischarge,
    reserveMarginPct: input.reserveMarginPct,
    voltage: input.batteryVoltage,
    moduleVoltage: input.batteryModuleVoltage,
    moduleKwh: input.batteryModuleKwh,
    maxDischargeKw: input.batteryMaxDischargeKw,
    requiredDischargeKw: energy.simultaneousKw,
    existingKwh: input.existingBatteryKwh,
    inverterBatteryVoltage: input.existingInverterBatteryVoltage,
  });

  const pv = sizePv({
    dailyKwh: energy.totalDailyKwh,
    batteryUsableKwh: battery.usableKwh,
    chargeEfficiency: assumptions.chargeEfficiency,
    peakSunHours: input.peakSunHours,
    systemEfficiency: input.systemEfficiency || assumptions.systemEfficiency,
    panelWatt: input.panelWatt,
    panelVoc: input.panelVoc,
    panelVmp: input.panelVmp,
    panelImp: input.panelImp,
    inverterMaxPvKw: input.inverterMaxPvKw,
    mpptMinV: input.mpptMinV,
    mpptMaxV: input.mpptMaxV,
    maxPvVoltage: input.maxPvVoltage,
    maxChargeCurrent: input.maxChargeCurrent,
    batteryVoltage: input.batteryVoltage,
    temperatureSafetyFactor: assumptions.temperatureSafetyFactor,
  });

  const packageRecommendation = recommendPackage(inverter.requiredKva, inverter.recommendedKva);

  const warnings = [
    ...energy.warnings,
    ...inverter.warnings,
    ...battery.warnings,
    ...pv.warnings,
  ];

  if (input.wantsBackup && energy.backupAcKwh <= 0) {
    warnings.push('You asked for backup power, but no appliance is marked for backup. Select the appliances that must stay on during an outage.');
  }
  if (input.wantsNightUse && battery.requiredNominalKwh <= 0) {
    warnings.push('Night-time use needs a battery. Mark the appliances you need at night as backup appliances.');
  }
  if (input.ownsInverter && input.wantsExpansion && input.existingInverterKva === null) {
    warnings.push('Enter the existing inverter rating so the advisor can check whether it is large enough for the expanded load.');
  }
  if (input.budgetNgn !== null && packageRecommendation.priceNgn !== null && input.budgetNgn < packageRecommendation.priceNgn) {
    warnings.push(
      'The nearest published package is above the budget entered. The advisor will not invent a cheaper system; a smaller scope or staged installation can be discussed.',
    );
  }
  if (input.buildingType === 'industrial' && inverter.recommendedKva === null) {
    warnings.push('Industrial loads usually need a three-phase design and a professional site assessment.');
  }

  const assumptionsList = [
    `Inverter headroom: ${Math.round((assumptions.inverterHeadroom - 1) * 100)}% above the estimated simultaneous load.`,
    `Power factor: ${roundTo(input.powerFactor || assumptions.powerFactor, 2)} (kW → kVA). Confirm the selected inverter's datasheet.`,
    `Inverter efficiency: ${Math.round((input.inverterEfficiency || assumptions.inverterEfficiency) * 100)}%.`,
    `Battery depth of discharge: ${Math.round((input.depthOfDischarge || assumptions.depthOfDischarge) * 100)}%.`,
    `Battery reserve margin: ${roundTo(input.reserveMarginPct, 0)}%.`,
    `PV system efficiency: ${Math.round((input.systemEfficiency || assumptions.systemEfficiency) * 100)}%.`,
    input.peakSunHours === null
      ? 'Peak sun hours: not supplied, so no PV capacity is recommended.'
      : `Peak sun hours: ${roundTo(input.peakSunHours, 2)} h/day, supplied by the customer or installer.`,
    `Monthly energy uses ${assumptions.monthlyDays} days.`,
    'Appliance wattages are planning estimates; check each appliance label or datasheet.',
    'Published package prices include installation. Battery, panel and inverter models are confirmed in the quotation.',
  ];

  return {
    energy,
    inverter,
    battery,
    pv,
    package: packageRecommendation,
    warnings,
    assumptions: assumptionsList,
  };
};
