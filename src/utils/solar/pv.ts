import type { PvResult } from './types';
import { clamp, nonNegative, positiveOrNull, roundTo } from './validation';

export interface PvInput {
  dailyKwh: number;
  batteryUsableKwh: number;
  chargeEfficiency: number;
  peakSunHours: number | null;
  systemEfficiency: number;
  panelWatt: number | null;
  panelVoc: number | null;
  panelVmp: number | null;
  panelImp: number | null;
  inverterMaxPvKw: number | null;
  mpptMinV: number | null;
  mpptMaxV: number | null;
  maxPvVoltage: number | null;
  maxChargeCurrent: number | null;
  batteryVoltage: number | null;
  temperatureSafetyFactor: number;
}

export const sizePv = (input: PvInput): PvResult => {
  const warnings: string[] = [];
  const dailyKwh = nonNegative(input.dailyKwh);
  const batteryUsableKwh = nonNegative(input.batteryUsableKwh);
  const chargeEfficiency = clamp(input.chargeEfficiency, 0.1, 1);
  const systemEfficiency = clamp(input.systemEfficiency, 0.1, 1);
  const psh = positiveOrNull(input.peakSunHours);

  const rechargeKwh = batteryUsableKwh > 0 ? batteryUsableKwh / chargeEfficiency : 0;
  const requiredSolarKwh = dailyKwh + rechargeKwh;

  if (dailyKwh <= 0) {
    return {
      requiredSolarKwh: 0,
      pvKwp: null,
      panelCount: null,
      maxSeries: null,
      minSeries: null,
      stringCheck: 'unknown',
      warnings: ['Add appliances to estimate the solar panel capacity.'],
    };
  }

  if (psh === null) {
    return {
      requiredSolarKwh: roundTo(requiredSolarKwh, 2),
      pvKwp: null,
      panelCount: null,
      maxSeries: null,
      minSeries: null,
      stringCheck: 'unknown',
      warnings: [
        'Peak sun hours are required to estimate panel capacity. Enter the figure supplied by your installer or a verified local source.',
      ],
    };
  }

  const pvKwp = requiredSolarKwh / (psh * systemEfficiency);
  const panelWatt = positiveOrNull(input.panelWatt);
  const panelCount = panelWatt === null ? null : Math.ceil((pvKwp * 1000) / panelWatt);

  const panelVoc = positiveOrNull(input.panelVoc);
  const panelVmp = positiveOrNull(input.panelVmp);
  const panelImp = positiveOrNull(input.panelImp);
  const maxPvVoltage = positiveOrNull(input.maxPvVoltage);
  const mpptMinV = positiveOrNull(input.mpptMinV);
  const mpptMaxV = positiveOrNull(input.mpptMaxV);
  const inverterMaxPvKw = positiveOrNull(input.inverterMaxPvKw);
  const maxChargeCurrent = positiveOrNull(input.maxChargeCurrent);
  const batteryVoltage = positiveOrNull(input.batteryVoltage);

  const maxSeries =
    maxPvVoltage !== null && panelVoc !== null
      ? Math.floor(maxPvVoltage / (panelVoc * clamp(input.temperatureSafetyFactor, 1, 1.5)))
      : null;
  const minSeries =
    mpptMinV !== null && panelVmp !== null ? Math.ceil(mpptMinV / panelVmp) : null;

  let stringCheck: PvResult['stringCheck'] = 'unknown';

  if (inverterMaxPvKw !== null && pvKwp > inverterMaxPvKw) {
    warnings.push(
      `The estimated ${roundTo(pvKwp, 2)} kWp array is above the inverter's stated maximum PV input of ${inverterMaxPvKw} kW. Do not connect it without confirming the datasheet.`,
    );
  }

  if (panelWatt === null) {
    warnings.push('Enter the panel wattage to estimate how many panels are needed.');
  }

  if (maxSeries === null || minSeries === null) {
    warnings.push(
      'Panel and inverter specifications (Voc, Vmp, maximum PV voltage and MPPT window) are needed before any series/parallel wiring can be checked.',
    );
  } else {
    stringCheck = 'ok';
    if (maxSeries < 1) {
      stringCheck = 'warning';
      warnings.push('The panel open-circuit voltage is too high for the inverter maximum PV voltage, even with one panel per string.');
    }
    if (minSeries > maxSeries) {
      stringCheck = 'warning';
      warnings.push('The MPPT start voltage cannot be reached within the maximum PV voltage using this panel. A different panel or inverter is needed.');
    }
    if (mpptMaxV !== null && minSeries * (panelVmp ?? 0) > mpptMaxV) {
      stringCheck = 'warning';
      warnings.push('The minimum string voltage is above the MPPT operating window. Confirm the inverter MPPT range.');
    }
    if (panelImp !== null && maxChargeCurrent !== null && batteryVoltage !== null) {
      const estimatedChargeCurrent = (pvKwp * 1000) / batteryVoltage;
      if (estimatedChargeCurrent > maxChargeCurrent) {
        stringCheck = 'warning';
        warnings.push(
          `Estimated charge current (${roundTo(estimatedChargeCurrent, 0)} A) is above the inverter's stated maximum of ${maxChargeCurrent} A. The array may need to be split or limited.`,
        );
      }
    }
  }

  warnings.push(
    'Panel capacity is a preliminary estimate. Final string design, cable sizing, isolators and protection must be confirmed by a qualified installer using the actual panel and inverter datasheets.',
  );

  return {
    requiredSolarKwh: roundTo(requiredSolarKwh, 2),
    pvKwp: roundTo(pvKwp, 2),
    panelCount,
    maxSeries,
    minSeries,
    stringCheck,
    warnings,
  };
};
