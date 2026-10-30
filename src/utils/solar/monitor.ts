/* Solar Power Monitor — interpretation of manually entered inverter readings.

   Rules this module enforces:
   - Every output is derived from an input the customer or installer supplied.
   - A missing input produces null plus a plain-language reason, never a guess.
   - kW and kWh are never mixed; A is only converted to kW when V is known.
   - A single reading is never called healthy, faulty or diagnosed.
   - No live data is read or invented here. */

import type {
  BatteryDirection,
  MonitorReading,
  MonitorResult,
  MonitorSystem,
  VoltageBandStatus,
} from './types';
import { clamp, positiveOrNull, roundTo } from './validation';

const isNumber = (value: number | null): value is number =>
  value !== null && Number.isFinite(value);

const minutesBetween = (earlier: string, later: string): number | null => {
  const start = Date.parse(earlier);
  const end = Date.parse(later);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return (end - start) / 60000;
};

const signed = (value: number, digits = 2): string => {
  const rounded = roundTo(value, digits);
  if (rounded > 0) return `+${rounded}`;
  return String(rounded);
};

const durationLabel = (minutes: number): string => {
  const rounded = Math.max(0, Math.round(minutes));
  if (rounded < 60) return `${rounded} ${rounded === 1 ? 'minute' : 'minutes'}`;
  const hours = roundTo(minutes / 60, 1);
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
};

/** Guards against a customer pasting an inverter password, API key or token
    into the free-text note. Nothing secret should ever reach storage. */
const SECRET_PATTERN = /(password|passcode|api[\s_-]?key|access[\s_-]?token|secret|bearer\s)/i;

export const noteContainsSecret = (note: string): boolean => SECRET_PATTERN.test(note);

export const evaluateReading = (
  system: MonitorSystem,
  reading: MonitorReading,
  previous: MonitorReading | null = null,
): MonitorResult => {
  const observations: string[] = [];
  const missing = new Set<string>();

  const voltage = positiveOrNull(reading.batteryVoltage);
  const current = isNumber(reading.batteryCurrentA) ? reading.batteryCurrentA : null;
  const acLoad = positiveOrNull(reading.acLoadKw);
  const pvInput = positiveOrNull(reading.pvInputKw);
  const soc = isNumber(reading.socPct) ? clamp(reading.socPct, 0, 100) : null;
  const temperature = isNumber(reading.temperatureC) ? reading.temperatureC : null;
  const efficiency =
    clamp(Number.isFinite(system.inverterEfficiencyPct) ? system.inverterEfficiencyPct : 90, 1, 100) / 100;
  const dod =
    clamp(Number.isFinite(system.depthOfDischargePct) ? system.depthOfDischargePct : 80, 1, 100) / 100;
  const bank = positiveOrNull(system.bankKwh);

  /* ── Battery power (W → kW) ───────────────────────────────────────── */
  let batteryPowerKw: number | null = null;
  let direction: BatteryDirection = 'unknown';

  if (voltage !== null && current !== null) {
    batteryPowerKw = roundTo((voltage * current) / 1000, 3);
    if (current > 0.1) direction = 'charging';
    else if (current < -0.1) direction = 'discharging';
    else direction = 'idle';
  } else if (current !== null) {
    missing.add('Battery voltage (V) is needed to turn the battery current (A) into power (kW).');
  }

  const dcDischargeKw =
    batteryPowerKw !== null && batteryPowerKw < 0 ? Math.abs(batteryPowerKw) : null;
  const acDischargeKw =
    dcDischargeKw === null ? null : roundTo(dcDischargeKw * efficiency, 3);

  /* ── Energy available in the bank ─────────────────────────────────── */
  let availableKwh: number | null = null;
  let availableBasis = '';

  if (bank !== null) {
    if (soc !== null) {
      availableKwh = roundTo((bank * soc) / 100, 3);
      availableBasis = `${roundTo(bank, 2)} kWh nominal at ${roundTo(soc, 0)}% state of charge`;
    } else {
      availableKwh = roundTo(bank * dod, 3);
      availableBasis = `${roundTo(bank, 2)} kWh nominal at the approved ${roundTo(dod * 100, 0)}% depth of discharge, assuming a full battery`;
    }
  }

  /* ── Runtime ──────────────────────────────────────────────────────── */
  const runtimeLoad = positiveOrNull(reading.runtimeLoadKw) ?? acLoad;
  const runtimeApplies = direction !== 'charging';
  let runtimeHours: number | null = null;
  let runtimeBasis = '';

  if (!runtimeApplies) {
    runtimeBasis = 'Not calculated while the battery is charging.';
    observations.push(
      'The battery is charging in this reading, so a runtime countdown would be misleading. Take a reading while it is discharging.',
    );
  } else if (availableKwh !== null && runtimeLoad !== null && runtimeLoad > 0) {
    runtimeHours = roundTo(availableKwh / runtimeLoad, 2);
    runtimeBasis = `${roundTo(availableKwh, 2)} kWh available ÷ ${roundTo(runtimeLoad, 2)} kW average load`;
  } else if (availableKwh !== null) {
    runtimeBasis = 'Add the average load you want the runtime calculated at.';
  } else {
    runtimeBasis = 'Battery capacity is required before runtime can be estimated.';
  }

  /* ── Charging ─────────────────────────────────────────────────────── */
  let chargeDeficitKwh: number | null = null;
  let chargeHours: number | null = null;
  let chargeBasis = '';

  if (bank === null || soc === null) {
    chargeBasis = 'Battery capacity and state of charge are required for a charge estimate.';
  } else if (direction !== 'charging' || batteryPowerKw === null || batteryPowerKw <= 0) {
    chargeBasis = 'A positive (charging) battery current is required for a charge estimate.';
  } else {
    chargeDeficitKwh = roundTo((bank * (100 - soc)) / 100, 3);
    chargeHours = roundTo(chargeDeficitKwh / batteryPowerKw, 2);
    chargeBasis = `${roundTo(chargeDeficitKwh, 2)} kWh to full ÷ ${roundTo(batteryPowerKw, 2)} kW charge power. Ignores the taper near full charge.`;
  }

  /* ── Voltage band ─────────────────────────────────────────────────── */
  const lowCutoff = positiveOrNull(system.lowCutoffV);
  const fullCharge = positiveOrNull(system.fullChargeV);
  let voltageStatus: VoltageBandStatus = 'unknown';
  let voltageNote =
    'Enter the inverter’s low-voltage cutoff and full-charge voltage to compare this reading with a band.';

  if (voltage === null) {
    voltageNote = 'Battery voltage is required to compare this reading with a band.';
  } else if (lowCutoff !== null && fullCharge !== null && fullCharge <= lowCutoff) {
    voltageNote = 'The full-charge voltage must be above the low-voltage cutoff. Check the datasheet figures.';
  } else if (lowCutoff !== null || fullCharge !== null) {
    if (lowCutoff !== null && voltage <= lowCutoff) {
      voltageStatus = 'low';
      voltageNote = `At or below the ${roundTo(lowCutoff, 1)} V cutoff you entered. Recharge before the inverter shuts down.`;
    } else if (fullCharge !== null && voltage >= fullCharge) {
      voltageStatus = 'full';
      voltageNote = `At or above the ${roundTo(fullCharge, 1)} V full-charge level you entered.`;
    } else {
      voltageStatus = 'within';
      const band =
        lowCutoff !== null && fullCharge !== null
          ? ` (${roundTo(lowCutoff, 1)}–${roundTo(fullCharge, 1)} V)`
          : '';
      voltageNote = `Inside the band you entered${band}. One reading cannot confirm battery health.`;
    }
  }

  /* ── Temperature ──────────────────────────────────────────────────── */
  const maxTemperature = positiveOrNull(system.maxTemperatureC);
  let temperatureState: 'hot' | 'normal' | 'unknown' = 'unknown';
  if (temperature !== null && maxTemperature !== null) {
    temperatureState = temperature > maxTemperature ? 'hot' : 'normal';
  }

  /* ── What is still missing ────────────────────────────────────────── */
  if (runtimeApplies && runtimeHours === null) {
    if (bank === null) {
      missing.add('Battery capacity (kWh) is needed for a runtime estimate.');
    } else if (runtimeLoad === null || runtimeLoad <= 0) {
      missing.add(
        'An average load (kW) — or a discharging battery current — is needed for a runtime estimate.',
      );
    }
  }
  if (chargeHours === null) {
    if (bank === null) {
      missing.add('Battery capacity (kWh) is needed for a charging estimate.');
    }
    if (soc === null) {
      missing.add('State of charge (%) is needed for a charging estimate.');
    }
    if (direction !== 'charging') {
      missing.add('A positive (charging) battery current is needed to estimate charge time.');
    }
  }
  if (voltageStatus === 'unknown' && lowCutoff === null && fullCharge === null) {
    missing.add('Low-voltage cutoff and full-charge voltage are needed before a status can be shown.');
  }

  /* ── Observations (facts about this reading, not a diagnosis) ─────── */
  if (previous) {
    const minutes = minutesBetween(previous.takenAt, reading.takenAt);
    const previousVoltage = positiveOrNull(previous.batteryVoltage);
    const previousSoc = previous.socPct === null ? null : clamp(previous.socPct, 0, 100);
    const previousLoad = positiveOrNull(previous.acLoadKw);
    const window =
      minutes !== null && minutes >= 0 ? ` over ${durationLabel(minutes)}` : '';

    if (voltage !== null && previousVoltage !== null) {
      const delta = roundTo(voltage - previousVoltage, 2);
      observations.push(
        delta === 0
          ? `Battery voltage is unchanged at ${roundTo(voltage, 2)} V${window}.`
          : `Battery voltage moved ${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)} V, from ${roundTo(previousVoltage, 2)} V to ${roundTo(voltage, 2)} V${window}.`,
      );
    }
    if (soc !== null && previousSoc !== null) {
      const delta = roundTo(soc - previousSoc, 0);
      observations.push(
        delta === 0
          ? `State of charge is unchanged at ${roundTo(previousSoc, 0)}%${window}.`
          : `State of charge moved ${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)} points${window}.`,
      );
    }
    if (acLoad !== null && previousLoad !== null) {
      const delta = roundTo(acLoad - previousLoad, 2);
      if (Math.abs(delta) >= 0.01) {
        observations.push(
          `AC load moved ${signed(delta)} kW, from ${roundTo(previousLoad, 2)} kW to ${roundTo(acLoad, 2)} kW${window}.`,
        );
      }
    }
    observations.push(
      'Two readings show a direction of travel, not a cause. A fault or battery condition still needs an installer’s test.',
    );
  } else {
    observations.push(
      'This is a single reading. A trend, a fault or battery health cannot be identified from one sample — save another reading later and compare.',
    );
  }

  if (pvInput !== null && acLoad !== null) {
    const gap = roundTo(acLoad - pvInput, 2);
    if (gap > 0.01) {
      observations.push(
        `PV input is ${roundTo(pvInput, 2)} kW against an AC load of ${roundTo(acLoad, 2)} kW, so about ${gap} kW is coming from the battery or grid at this moment.`,
      );
    } else {
      observations.push(
        `PV input covers the AC load at this moment (${roundTo(pvInput, 2)} kW against ${roundTo(acLoad, 2)} kW).`,
      );
    }
  }

  if (soc !== null && soc <= 20) {
    observations.push(
      `State of charge is ${roundTo(soc, 0)}%. Plan a recharge; deep discharges shorten battery life.`,
    );
  }

  if (temperatureState === 'hot' && temperature !== null && maxTemperature !== null) {
    observations.push(
      `Inverter temperature is ${roundTo(temperature, 0)} °C, above the ${roundTo(maxTemperature, 0)} °C limit you entered. Improve ventilation and follow the manufacturer’s guidance.`,
    );
  }

  return {
    batteryPowerKw,
    direction,
    dcDischargeKw,
    acDischargeKw,
    availableKwh,
    availableBasis,
    runtimeHours,
    runtimeBasis,
    chargeDeficitKwh,
    chargeHours,
    chargeBasis,
    voltageStatus,
    voltageNote,
    temperatureState,
    observations,
    missing: Array.from(missing),
  };
};

/** Human label for the direction of battery current. */
export const directionLabel = (direction: BatteryDirection): string => {
  switch (direction) {
    case 'charging':
      return 'Charging';
    case 'discharging':
      return 'Discharging';
    case 'idle':
      return 'Idle';
    default:
      return 'Not enough information';
  }
};

export const voltageStatusLabel = (status: VoltageBandStatus): string => {
  switch (status) {
    case 'low':
      return 'At or below cutoff';
    case 'within':
      return 'Inside the entered band';
    case 'full':
      return 'At full-charge level';
    default:
      return 'Status not available';
  }
};
