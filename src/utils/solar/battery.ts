import type { BatteryResult } from './types';
import { clamp, nonNegative, positiveOrNull, roundTo } from './validation';

export interface BatteryInput {
  acBackupKwh: number;
  inverterEfficiency: number;
  depthOfDischarge: number;
  reserveMarginPct: number;
  voltage: number | null;
  moduleVoltage: number | null;
  moduleKwh: number | null;
  maxDischargeKw: number | null;
  requiredDischargeKw: number;
  existingKwh: number | null;
  inverterBatteryVoltage: number | null;
}

const emptyResult = (warning: string): BatteryResult => ({
  requiredNominalKwh: 0,
  usableKwh: 0,
  acBackupKwh: 0,
  voltage: null,
  requiredAh: null,
  seriesCount: null,
  parallelCount: null,
  actualBankKwh: null,
  configuration: 'No backup energy selected',
  powerCheck: 'unknown',
  warnings: [warning],
});

export const sizeBattery = (input: BatteryInput): BatteryResult => {
  const acBackupKwh = nonNegative(input.acBackupKwh);
  if (acBackupKwh <= 0) {
    return emptyResult(
      'No appliances are marked for backup. Select the appliances that must stay on during an outage to size a battery.',
    );
  }

  const warnings: string[] = [];
  const efficiency = clamp(input.inverterEfficiency, 0.1, 1);
  const dod = clamp(input.depthOfDischarge, 0.1, 1);
  const reserve = clamp(input.reserveMarginPct, 0, 100) / 100;
  const voltage = positiveOrNull(input.voltage);
  const moduleVoltage = positiveOrNull(input.moduleVoltage);
  const moduleKwh = positiveOrNull(input.moduleKwh);

  const requiredNominalKwh = (acBackupKwh / (efficiency * dod)) * (1 + reserve);
  const usableKwh = requiredNominalKwh * dod;
  const requiredAh = voltage === null ? null : (requiredNominalKwh * 1000) / voltage;

  const inverterMismatch =
    voltage !== null &&
    input.inverterBatteryVoltage !== null &&
    input.inverterBatteryVoltage !== voltage;

  let seriesCount: number | null = null;
  let parallelCount: number | null = null;
  let actualBankKwh: number | null = null;
  let configuration = voltage === null
    ? 'Battery voltage not specified'
    : `${voltage} V bank, at least ${roundTo(requiredNominalKwh, 1)} kWh`;

  if (inverterMismatch) {
    configuration = `Incompatible: a ${voltage} V bank cannot be connected to a ${input.inverterBatteryVoltage} V inverter battery input`;
  }

  if (!inverterMismatch && voltage !== null && moduleVoltage !== null && moduleKwh !== null) {
    const ratio = voltage / moduleVoltage;
    const series = Math.round(ratio);
    if (series < 1) {
      warnings.push('The battery module voltage is higher than the requested bank voltage. Check the module datasheet.');
    } else {
      if (Math.abs(ratio - series) > 0.05) {
        warnings.push(
          `The module voltage (${moduleVoltage} V) does not divide evenly into a ${voltage} V bank. Confirm the manufacturer's series/parallel rules.`,
        );
      }
      seriesCount = series;
      const bankPerString = series * moduleKwh;
      parallelCount = Math.max(1, Math.ceil(requiredNominalKwh / bankPerString));
      actualBankKwh = roundTo(bankPerString * parallelCount, 2);
      configuration = `${series}S${parallelCount}P · ${actualBankKwh} kWh nominal at ${voltage} V`;
    }
  }

  if (voltage === null) {
    warnings.push('Battery Ah capacity cannot be calculated until the nominal bank voltage is known.');
  }
  if (inverterMismatch) {
    warnings.push(
      `The battery bank voltage (${voltage} V) does not match the inverter battery input (${input.inverterBatteryVoltage} V). The advisor refuses to recommend this configuration; do not connect it.`,
    );
    seriesCount = null;
    parallelCount = null;
    actualBankKwh = null;
  }
  if (input.existingKwh !== null && input.existingKwh > 0 && input.existingKwh < requiredNominalKwh) {
    warnings.push(
      `The existing battery (${input.existingKwh} kWh) is below the calculated ${roundTo(requiredNominalKwh, 1)} kWh nominal requirement.`,
    );
  }

  const requiredDischargeKw = nonNegative(input.requiredDischargeKw);
  let powerCheck: BatteryResult['powerCheck'] = 'unknown';
  if (input.maxDischargeKw !== null && input.maxDischargeKw > 0) {
    if (input.maxDischargeKw < requiredDischargeKw) {
      powerCheck = 'insufficient';
      warnings.push(
        `The battery's stated continuous discharge limit (${input.maxDischargeKw} kW) is below the estimated simultaneous load (${roundTo(requiredDischargeKw, 2)} kW).`,
      );
    } else {
      powerCheck = 'ok';
    }
  } else if (requiredDischargeKw > 0) {
    warnings.push(
      `Confirm the battery BMS continuous discharge limit is at least ${roundTo(requiredDischargeKw, 2)} kW. The advisor does not assume a C-rate.`,
    );
  }

  warnings.push(
    'Usable energy depends on the battery management system, temperature, age and the manufacturer-approved depth of discharge. Confirm these before ordering.',
  );

  return {
    requiredNominalKwh: roundTo(requiredNominalKwh, 2),
    usableKwh: roundTo(usableKwh, 2),
    acBackupKwh: roundTo(acBackupKwh, 3),
    voltage,
    requiredAh: requiredAh === null ? null : roundTo(requiredAh, 0),
    seriesCount,
    parallelCount,
    actualBankKwh,
    configuration,
    powerCheck,
    warnings,
  };
};
