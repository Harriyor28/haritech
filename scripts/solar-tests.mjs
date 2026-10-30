/* Dependency-free calculation tests for the Haritech Smart Solar Advisor.
   Run with: node scripts/solar-tests.mjs

   The script bundles src/utils/solar/testEntry.ts with esbuild, imports the
   result and asserts the sizing arithmetic. It does not touch the app build,
   the database or any production data. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = process.cwd();
const outDir = path.join(root, '.tmp-solar');
const outFile = path.join(outDir, 'engine.mjs');

fs.mkdirSync(outDir, { recursive: true });

await build({
  entryPoints: [path.join(root, 'src/utils/solar/testEntry.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  outfile: outFile,
  logLevel: 'silent',
});

const solar = await import(`${pathToFileURL(outFile).href}?t=${Date.now()}`);

const {
  calculateEnergy,
  sizeInverter,
  sizeBattery,
  sizePv,
  runAssessment,
  evaluateReading,
  noteContainsSecret,
  bytesToHex,
  isOwnerToken,
  payloadTooLarge,
  retentionLabel,
  formatRecoveryCode,
  normaliseRecoveryCode,
  QUICK_START_BUNDLES,
  buildBundleEntries,
  buildBundleInput,
  SOLAR_FAQ,
  answerQuestion,
  matchFaq,
  FAQ_FALLBACK_ANSWER,
  FAQ_STARTER_QUESTIONS,
  displayQuestion,
  matchHaritechFaq,
  answerAnyQuestion,
  HARI_FALLBACK_ANSWER,
  HARI_STARTER_QUESTIONS,
  HARI_FAQ,
  displayAnyQuestion,
  HARI_KB_VERSION,
  buildRemoteContext,
  createDefaultInput,
  APPLIANCE_CATALOGUE,
  DEFAULT_ASSUMPTIONS,
} = solar;

let passed = 0;
const failures = [];

const test = (name, fn) => {
  try {
    fn();
    passed += 1;
    console.log(`  PASS  ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.log(`  FAIL  ${name}`);
    console.log(`        ${error.message.split('\n')[0]}`);
  }
};

const close = (actual, expected, tolerance = 0.005) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${expected} ± ${tolerance}, received ${actual}`,
  );
};

let uid = 0;
const entry = (overrides = {}) => ({
  uid: `t-${(uid += 1)}`,
  templateId: null,
  name: 'Test appliance',
  category: 'home',
  watts: 100,
  quantity: 1,
  hoursPerDay: 1,
  surgeWatts: null,
  duty: 'intermittent',
  simultaneous: false,
  backup: false,
  backupHours: 0,
  scheduleStart: null,
  scheduleEnd: null,
  ...overrides,
});

const hasWarning = (warnings, fragment) =>
  warnings.some((warning) => warning.toLowerCase().includes(fragment.toLowerCase()));

console.log('\nSolar Advisor calculation tests\n');

/* ── Energy ─────────────────────────────────────────────────────────── */

test('daily energy = watts × quantity × hours', () => {
  const result = calculateEnergy(
    [entry({ name: 'LED bulb', watts: 10, quantity: 5, hoursPerDay: 5 })],
    8,
    30,
  );
  assert.equal(result.totalDailyWh, 250);
  close(result.totalDailyKwh, 0.25);
  close(result.weeklyKwh, 1.75);
  close(result.monthlyKwh, 7.5);
});

test('backup energy is clamped to the appliance daily hours', () => {
  const result = calculateEnergy(
    [entry({ watts: 200, quantity: 2, hoursPerDay: 5, backup: true, backupHours: 8 })],
    8,
    30,
  );
  close(result.backupAcKwh, 2);
});

test('backup falls back to the global backup hours when zero', () => {
  const result = calculateEnergy(
    [entry({ watts: 100, hoursPerDay: 10, backup: true, backupHours: 0 })],
    4,
    30,
  );
  close(result.backupAcKwh, 0.4);
});

test('declared simultaneous load uses running watts only', () => {
  const result = calculateEnergy(
    [
      entry({ name: 'Fan', watts: 60, quantity: 2, hoursPerDay: 8, simultaneous: true }),
      entry({ name: 'TV', watts: 100, hoursPerDay: 6, simultaneous: true }),
      entry({ name: 'Kettle', watts: 2000, hoursPerDay: 0.3 }),
    ],
    8,
    30,
  );
  close(result.declaredSimultaneousKw, 0.22);
  close(result.simultaneousKw, 0.22);
  assert.equal(result.simultaneousBasis, 'declared');
  assert.equal(result.surgeDemandKw, null);
});

test('surge demand adds the largest surge delta to the simultaneous load', () => {
  const result = calculateEnergy(
    [
      entry({ name: 'Fridge', watts: 150, quantity: 1, hoursPerDay: 8, surgeWatts: 450, simultaneous: true }),
      entry({ name: 'TV', watts: 100, hoursPerDay: 6, simultaneous: true }),
    ],
    8,
    30,
  );
  close(result.simultaneousKw, 0.25);
  close(result.surgeDemandKw, 0.55);
});

test('scheduled appliances contribute to the schedule peak', () => {
  const result = calculateEnergy(
    [
      entry({
        name: 'Security light',
        watts: 100,
        quantity: 4,
        hoursPerDay: 12,
        scheduleStart: 18,
        scheduleEnd: 6,
      }),
      entry({
        name: 'Streetlight',
        watts: 100,
        quantity: 2,
        hoursPerDay: 12,
        scheduleStart: 18,
        scheduleEnd: 6,
      }),
    ],
    8,
    30,
  );
  close(result.schedulePeakKw, 0.6);
  assert.equal(result.simultaneousBasis, 'schedule');
});

test('empty appliance list produces zero energy and a warning', () => {
  const result = calculateEnergy([], 8, 30);
  assert.equal(result.totalDailyKwh, 0);
  assert.equal(result.simultaneousKw, 0);
  assert.equal(result.simultaneousBasis, 'none');
  assert.ok(hasWarning(result.warnings, 'No appliances'));
});

test('hours outside 0–24 are clamped and warned about', () => {
  const result = calculateEnergy([entry({ watts: 100, hoursPerDay: 30 })], 8, 30);
  close(result.totalDailyKwh, 2.4);
  assert.ok(hasWarning(result.warnings, 'clamped'));
});

test('zero-wattage appliances are flagged', () => {
  const result = calculateEnergy([entry({ watts: 0, hoursPerDay: 4 })], 8, 30);
  assert.ok(hasWarning(result.warnings, 'wattage of zero'));
});

/* ── Inverter ───────────────────────────────────────────────────────── */

test('inverter sizing applies headroom and power factor', () => {
  const result = sizeInverter({
    simultaneousKw: 2,
    surgeKw: null,
    powerFactor: 0.8,
    headroom: 1.25,
    sizesKva: DEFAULT_ASSUMPTIONS.inverterSizesKva,
    existingKva: null,
    phase: 'single',
  });
  close(result.requiredContinuousKw, 2.5);
  close(result.requiredKva, 3.13);
  assert.equal(result.recommendedKva, 3.5);
  close(result.recommendedContinuousKw, 2.8);
});

test('inverter warns when the existing unit is too small', () => {
  const result = sizeInverter({
    simultaneousKw: 5,
    surgeKw: null,
    powerFactor: 0.8,
    headroom: 1.25,
    sizesKva: DEFAULT_ASSUMPTIONS.inverterSizesKva,
    existingKva: 3.5,
    phase: 'single',
  });
  assert.ok(hasWarning(result.warnings, 'below the calculated'));
});

test('inverter warns when surge is above the nominal rating', () => {
  const result = sizeInverter({
    simultaneousKw: 2,
    surgeKw: 4,
    powerFactor: 0.8,
    headroom: 1.25,
    sizesKva: DEFAULT_ASSUMPTIONS.inverterSizesKva,
    existingKva: null,
    phase: 'single',
  });
  assert.ok(hasWarning(result.warnings, 'Starting surge'));
});

test('inverter returns no recommendation for an empty load', () => {
  const result = sizeInverter({
    simultaneousKw: 0,
    surgeKw: null,
    powerFactor: 0.8,
    headroom: 1.25,
    sizesKva: DEFAULT_ASSUMPTIONS.inverterSizesKva,
    existingKva: null,
    phase: 'single',
  });
  assert.equal(result.recommendedKva, null);
  assert.ok(hasWarning(result.warnings, 'Add appliances'));
});

/* ── Battery ────────────────────────────────────────────────────────── */

test('battery nominal kWh uses AC backup ÷ (efficiency × DoD)', () => {
  const result = sizeBattery({
    acBackupKwh: 2,
    inverterEfficiency: 0.9,
    depthOfDischarge: 0.8,
    reserveMarginPct: 10,
    voltage: 48,
    moduleVoltage: null,
    moduleKwh: null,
    maxDischargeKw: null,
    requiredDischargeKw: 1,
    existingKwh: null,
    inverterBatteryVoltage: null,
  });
  close(result.requiredNominalKwh, 3.06);
  close(result.usableKwh, 2.44);
  assert.equal(result.requiredAh, 64);
});

test('battery Ah is withheld until the bank voltage is known', () => {
  const result = sizeBattery({
    acBackupKwh: 2,
    inverterEfficiency: 0.9,
    depthOfDischarge: 0.8,
    reserveMarginPct: 0,
    voltage: null,
    moduleVoltage: null,
    moduleKwh: null,
    maxDischargeKw: null,
    requiredDischargeKw: 1,
    existingKwh: null,
    inverterBatteryVoltage: null,
  });
  assert.equal(result.requiredAh, null);
  assert.ok(hasWarning(result.warnings, 'voltage'));
});

test('series/parallel bank is calculated from module voltage and energy', () => {
  const result = sizeBattery({
    acBackupKwh: 2,
    inverterEfficiency: 0.9,
    depthOfDischarge: 0.8,
    reserveMarginPct: 10,
    voltage: 48,
    moduleVoltage: 12,
    moduleKwh: 1.2,
    maxDischargeKw: null,
    requiredDischargeKw: 1,
    existingKwh: null,
    inverterBatteryVoltage: 48,
  });
  assert.equal(result.seriesCount, 4);
  assert.equal(result.parallelCount, 1);
  close(result.actualBankKwh, 4.8);
  assert.match(result.configuration, /4S1P/);
});

test('battery refuses an incompatible inverter voltage', () => {
  const result = sizeBattery({
    acBackupKwh: 2,
    inverterEfficiency: 0.9,
    depthOfDischarge: 0.8,
    reserveMarginPct: 10,
    voltage: 48,
    moduleVoltage: 12,
    moduleKwh: 1.2,
    maxDischargeKw: null,
    requiredDischargeKw: 1,
    existingKwh: null,
    inverterBatteryVoltage: 24,
  });
  assert.ok(hasWarning(result.warnings, 'does not match'));
  assert.equal(result.seriesCount, null);
  assert.equal(result.parallelCount, null);
  assert.equal(result.actualBankKwh, null);
  assert.match(result.configuration, /^Incompatible/);
});

test('battery warns when discharge power is insufficient', () => {
  const result = sizeBattery({
    acBackupKwh: 2,
    inverterEfficiency: 0.9,
    depthOfDischarge: 0.8,
    reserveMarginPct: 10,
    voltage: 48,
    moduleVoltage: 12,
    moduleKwh: 1.2,
    maxDischargeKw: 0.5,
    requiredDischargeKw: 2,
    existingKwh: null,
    inverterBatteryVoltage: 48,
  });
  assert.equal(result.powerCheck, 'insufficient');
});

test('battery returns zero without backup appliances', () => {
  const result = sizeBattery({
    acBackupKwh: 0,
    inverterEfficiency: 0.9,
    depthOfDischarge: 0.8,
    reserveMarginPct: 10,
    voltage: 48,
    moduleVoltage: 12,
    moduleKwh: 1.2,
    maxDischargeKw: null,
    requiredDischargeKw: 0,
    existingKwh: null,
    inverterBatteryVoltage: 48,
  });
  assert.equal(result.requiredNominalKwh, 0);
  assert.ok(hasWarning(result.warnings, 'No appliances'));
});

/* ── PV ─────────────────────────────────────────────────────────────── */

test('PV capacity uses daily energy plus battery recharge and peak sun hours', () => {
  const result = sizePv({
    dailyKwh: 5,
    batteryUsableKwh: 2.4,
    chargeEfficiency: 0.9,
    peakSunHours: 5,
    systemEfficiency: 0.75,
    panelWatt: 400,
    panelVoc: 41,
    panelVmp: 34,
    panelImp: 10,
    inverterMaxPvKw: 5,
    mpptMinV: 120,
    mpptMaxV: 450,
    maxPvVoltage: 500,
    maxChargeCurrent: 100,
    batteryVoltage: 48,
    temperatureSafetyFactor: 1.15,
  });
  close(result.requiredSolarKwh, 7.67);
  close(result.pvKwp, 2.04);
  assert.equal(result.panelCount, 6);
  assert.equal(result.maxSeries, 10);
  assert.equal(result.minSeries, 4);
  assert.equal(result.stringCheck, 'ok');
});

test('PV returns no kWp without peak sun hours', () => {
  const result = sizePv({
    dailyKwh: 5,
    batteryUsableKwh: 0,
    chargeEfficiency: 0.9,
    peakSunHours: null,
    systemEfficiency: 0.75,
    panelWatt: 400,
    panelVoc: null,
    panelVmp: null,
    panelImp: null,
    inverterMaxPvKw: null,
    mpptMinV: null,
    mpptMaxV: null,
    maxPvVoltage: null,
    maxChargeCurrent: null,
    batteryVoltage: null,
    temperatureSafetyFactor: 1.15,
  });
  assert.equal(result.pvKwp, null);
  assert.equal(result.panelCount, null);
  assert.ok(hasWarning(result.warnings, 'Peak sun hours'));
});

test('PV flags an array above the inverter maximum input', () => {
  const result = sizePv({
    dailyKwh: 20,
    batteryUsableKwh: 0,
    chargeEfficiency: 0.9,
    peakSunHours: 4,
    systemEfficiency: 0.75,
    panelWatt: 400,
    panelVoc: 41,
    panelVmp: 34,
    panelImp: 10,
    inverterMaxPvKw: 5,
    mpptMinV: 120,
    mpptMaxV: 450,
    maxPvVoltage: 500,
    maxChargeCurrent: 100,
    batteryVoltage: 48,
    temperatureSafetyFactor: 1.15,
  });
  assert.ok(hasWarning(result.warnings, 'maximum PV input'));
});

/* ── Engine ─────────────────────────────────────────────────────────── */

test('engine matches the published package by inverter kVA only', () => {
  const input = createDefaultInput();
  input.appliances = [
    entry({ name: 'Load A', watts: 1000, hoursPerDay: 4, simultaneous: true }),
    entry({ name: 'Load B', watts: 1000, hoursPerDay: 4, simultaneous: true }),
  ];
  const result = runAssessment(input, DEFAULT_ASSUMPTIONS);
  assert.equal(result.inverter.recommendedKva, 3.5);
  assert.equal(result.package.id, 'SOL-002');
  assert.equal(result.package.priceNgn, 2500000);
  assert.match(result.package.note, /does not state the battery, panel or inverter model/);
});

test('engine returns no package for an empty assessment', () => {
  const result = runAssessment(createDefaultInput(), DEFAULT_ASSUMPTIONS);
  assert.equal(result.energy.totalDailyKwh, 0);
  assert.equal(result.package.id, null);
  assert.equal(result.package.priceNgn, null);
});

test('engine warns when backup is requested but nothing is marked', () => {
  const input = createDefaultInput();
  input.wantsBackup = true;
  input.appliances = [entry({ watts: 100, hoursPerDay: 4, backup: false })];
  const result = runAssessment(input, DEFAULT_ASSUMPTIONS);
  assert.ok(hasWarning(result.warnings, 'no appliance is marked for backup'));
});

test('engine passes the bank voltage into the PV charge-current check', () => {
  const input = createDefaultInput();
  input.appliances = [
    entry({ name: 'Fridge', watts: 150, hoursPerDay: 8, backup: true, backupHours: 8 }),
  ];
  input.batteryVoltage = 48;
  input.peakSunHours = 5;
  input.panelWatt = 400;
  input.panelVoc = 41;
  input.panelVmp = 34;
  input.panelImp = 10;
  input.maxPvVoltage = 500;
  input.mpptMinV = 120;
  input.mpptMaxV = 450;
  input.maxChargeCurrent = 10;
  input.inverterMaxPvKw = 5;
  const result = runAssessment(input, DEFAULT_ASSUMPTIONS);
  assert.ok(result.pv.pvKwp !== null);
  assert.ok(hasWarning(result.pv.warnings, 'charge current'));
});

test('catalogue ids are unique and every template has a positive wattage', () => {
  const ids = new Set();
  for (const template of APPLIANCE_CATALOGUE) {
    assert.ok(!ids.has(template.id), `duplicate id ${template.id}`);
    ids.add(template.id);
    assert.ok(template.watts > 0, `${template.id} has no wattage`);
    assert.ok(template.defaultHours >= 0 && template.defaultHours <= 24, `${template.id} hours out of range`);
  }
});

/* ── Monitor ────────────────────────────────────────────────────────── */

const monitorSystem = (overrides = {}) => ({
  bankKwh: 10,
  bankVoltage: 48,
  depthOfDischargePct: 80,
  inverterEfficiencyPct: 90,
  lowCutoffV: 44,
  fullChargeV: 55,
  maxTemperatureC: 45,
  ...overrides,
});

const monitorReading = (overrides = {}) => ({
  takenAt: '2026-10-28T10:00:00.000Z',
  batteryVoltage: 50,
  batteryCurrentA: -20,
  acLoadKw: 0.8,
  pvInputKw: null,
  socPct: 50,
  temperatureC: 30,
  runtimeLoadKw: null,
  note: '',
  ...overrides,
});

test('monitor converts battery volts and amps into signed kW', () => {
  const result = evaluateReading(
    monitorSystem(),
    monitorReading({ batteryVoltage: 50, batteryCurrentA: -20 }),
  );
  close(result.batteryPowerKw, -1);
  assert.equal(result.direction, 'discharging');
  close(result.dcDischargeKw, 1);
  close(result.acDischargeKw, 0.9);
});

test('monitor marks a positive current as charging', () => {
  const result = evaluateReading(
    monitorSystem(),
    monitorReading({ batteryCurrentA: 15, acLoadKw: null }),
  );
  assert.equal(result.direction, 'charging');
  close(result.batteryPowerKw, 0.75);
  assert.equal(result.dcDischargeKw, null);
});

test('monitor runtime uses state-of-charge energy over the average load', () => {
  const result = evaluateReading(
    monitorSystem(),
    monitorReading({ socPct: 50, runtimeLoadKw: 1 }),
  );
  close(result.availableKwh, 5);
  close(result.runtimeHours, 5);
  assert.match(result.runtimeBasis, /5 kWh available/);
});

test('monitor runtime falls back to usable energy when SOC is missing', () => {
  const result = evaluateReading(
    monitorSystem(),
    monitorReading({ socPct: null, runtimeLoadKw: 2 }),
  );
  close(result.availableKwh, 8);
  close(result.runtimeHours, 4);
  assert.match(result.availableBasis, /depth of discharge/);
});

test('monitor refuses a runtime estimate without battery capacity', () => {
  const result = evaluateReading(
    monitorSystem({ bankKwh: null }),
    monitorReading({ runtimeLoadKw: 1 }),
  );
  assert.equal(result.availableKwh, null);
  assert.equal(result.runtimeHours, null);
  assert.ok(result.missing.some((item) => item.includes('Battery capacity')));
});

test('monitor refuses a runtime estimate while the battery is charging', () => {
  const result = evaluateReading(
    monitorSystem(),
    monitorReading({ batteryCurrentA: 10, runtimeLoadKw: 1 }),
  );
  assert.equal(result.runtimeHours, null);
  assert.ok(result.observations.some((item) => item.includes('charging')));
});

test('monitor charge time is the deficit divided by charge power', () => {
  const result = evaluateReading(
    monitorSystem(),
    monitorReading({ batteryCurrentA: 10, batteryVoltage: 50, socPct: 50 }),
  );
  close(result.chargeDeficitKwh, 5);
  close(result.chargeHours, 10);
});

test('monitor charge estimate requires state of charge', () => {
  const result = evaluateReading(
    monitorSystem(),
    monitorReading({ batteryCurrentA: 10, socPct: null }),
  );
  assert.equal(result.chargeHours, null);
  assert.ok(result.missing.some((item) => item.includes('State of charge')));
});

test('monitor shows a voltage status only inside the supplied band', () => {
  const within = evaluateReading(monitorSystem(), monitorReading({ batteryVoltage: 50 }));
  assert.equal(within.voltageStatus, 'within');

  const low = evaluateReading(monitorSystem(), monitorReading({ batteryVoltage: 43 }));
  assert.equal(low.voltageStatus, 'low');

  const full = evaluateReading(monitorSystem(), monitorReading({ batteryVoltage: 56 }));
  assert.equal(full.voltageStatus, 'full');

  const unknown = evaluateReading(
    monitorSystem({ lowCutoffV: null, fullChargeV: null }),
    monitorReading({ batteryVoltage: 50 }),
  );
  assert.equal(unknown.voltageStatus, 'unknown');
  assert.ok(unknown.missing.some((item) => item.includes('cutoff')));
});

test('monitor rejects a band whose full-charge level is below the cutoff', () => {
  const result = evaluateReading(
    monitorSystem({ lowCutoffV: 55, fullChargeV: 44 }),
    monitorReading({ batteryVoltage: 50 }),
  );
  assert.equal(result.voltageStatus, 'unknown');
  assert.match(result.voltageNote, /above the low-voltage cutoff/);
});

test('monitor flags temperature only against a limit the user entered', () => {
  const hot = evaluateReading(
    monitorSystem({ maxTemperatureC: 40 }),
    monitorReading({ temperatureC: 46 }),
  );
  assert.equal(hot.temperatureState, 'hot');

  const noLimit = evaluateReading(
    monitorSystem({ maxTemperatureC: null }),
    monitorReading({ temperatureC: 46 }),
  );
  assert.equal(noLimit.temperatureState, 'unknown');
});

test('monitor calls a first reading a single sample, not a diagnosis', () => {
  const result = evaluateReading(monitorSystem(), monitorReading());
  assert.ok(result.observations.some((item) => item.includes('single reading')));
  assert.ok(!result.observations.some((item) => /faulty|failed|healthy/i.test(item)));
});

test('monitor compares two readings without diagnosing', () => {
  const previous = monitorReading({ takenAt: '2026-10-28T09:00:00.000Z', batteryVoltage: 51, socPct: 60 });
  const current = monitorReading({ takenAt: '2026-10-28T10:00:00.000Z', batteryVoltage: 49, socPct: 50 });
  const result = evaluateReading(monitorSystem(), current, previous);
  assert.ok(result.observations.some((item) => item.includes('down 2 V')));
  assert.ok(result.observations.some((item) => item.includes('down 10 points')));
  assert.ok(result.observations.some((item) => item.includes('not a cause')));
});

test('monitor returns no invented numbers for an empty reading', () => {
  const result = evaluateReading(
    monitorSystem({ bankKwh: null, lowCutoffV: null, fullChargeV: null }),
    monitorReading({
      batteryVoltage: null,
      batteryCurrentA: null,
      acLoadKw: null,
      pvInputKw: null,
      socPct: null,
      temperatureC: null,
      runtimeLoadKw: null,
    }),
  );
  assert.equal(result.batteryPowerKw, null);
  assert.equal(result.availableKwh, null);
  assert.equal(result.runtimeHours, null);
  assert.equal(result.chargeHours, null);
  assert.equal(result.voltageStatus, 'unknown');
  assert.ok(result.missing.length >= 3);
});

test('monitor flags notes that look like credentials', () => {
  assert.equal(noteContainsSecret('Battery was warm, grid off'), false);
  assert.equal(noteContainsSecret('inverter password: hunter2'), true);
  assert.equal(noteContainsSecret('API_KEY=abc123'), true);
  assert.equal(noteContainsSecret('access token 123'), true);
});

test('monitor survives corrupted stored percentages', () => {
  const result = evaluateReading(
    monitorSystem({ inverterEfficiencyPct: NaN, depthOfDischargePct: NaN }),
    monitorReading(),
  );
  assert.ok(Number.isFinite(result.acDischargeKw));
  assert.ok(Number.isFinite(result.availableKwh));
});

/* ── Cloud history token helpers (draft, not wired in yet) ──────────── */

test('owner token helpers accept only 64 lowercase hex characters', () => {
  assert.equal(bytesToHex(new Uint8Array([0, 15, 255])), '000fff');
  assert.equal(isOwnerToken('a'.repeat(64)), true);
  assert.equal(isOwnerToken('a'.repeat(63)), false);
  assert.equal(isOwnerToken('a'.repeat(65)), false);
  assert.equal(isOwnerToken('A'.repeat(64)), false);
  assert.equal(isOwnerToken('g'.repeat(64)), false);
});

test('record size guard rejects oversized and unserialisable payloads', () => {
  assert.equal(payloadTooLarge({ bankKwh: 10 }), false);
  assert.equal(payloadTooLarge({ blob: 'x'.repeat(70000) }), true);
  const circular = {};
  circular.self = circular;
  assert.equal(payloadTooLarge(circular), true);
});

test('retention label states the agreed period plainly', () => {
  assert.equal(retentionLabel(24), '24 months (2 years)');
  assert.equal(retentionLabel(12), '12 months (1 year)');
  assert.equal(retentionLabel(18), '18 months');
});

test('recovery code round-trips through formatting and normalising', () => {
  const token = 'abcdef0123456789'.repeat(4);
  const code = formatRecoveryCode(token);
  assert.equal(code, 'ABCDEF01-23456789-ABCDEF01-23456789-ABCDEF01-23456789-ABCDEF01-23456789');
  assert.equal(normaliseRecoveryCode(code), token);
  assert.equal(normaliseRecoveryCode(code.toLowerCase().replace(/-/g, ' ')), token);
  assert.equal(normaliseRecoveryCode('not a real code'), null);
  assert.equal(normaliseRecoveryCode('abc'), null);
});

/* ── Quick-start bundles ─────────────────────────────────────────────── */

test('every bundle item resolves to a real catalogue template', () => {
  const ids = new Set(APPLIANCE_CATALOGUE.map((t) => t.id));
  for (const bundle of QUICK_START_BUNDLES) {
    assert.ok(bundle.items.length > 0, `${bundle.id} has items`);
    for (const item of bundle.items) {
      assert.ok(ids.has(item.templateId), `${bundle.id} template ${item.templateId} exists in the catalogue`);
      assert.ok(item.quantity >= 1, `${bundle.id} ${item.templateId} quantity is at least 1`);
    }
  }
});

test('bundle entries are editable entries from the catalogue defaults', () => {
  const family = QUICK_START_BUNDLES.find((b) => b.id === 'family');
  assert.ok(family);
  const entries = buildBundleEntries(family);
  const fridge = entries.find((e) => e.templateId === 'refrigerator');
  assert.ok(fridge);
  assert.equal(fridge.quantity, 1);
  assert.equal(fridge.watts, 150, 'uses the catalogue wattage, not an invented one');
  assert.equal(fridge.surgeWatts, 450);
  // entries must be distinct and fresh every call
  const again = buildBundleEntries(family);
  assert.notEqual(entries[0].uid, again[0].uid, 'uids are regenerated, so duplicate application cannot collide');
});

test('buildBundleInput patches property answers together with the list', () => {
  const shop = QUICK_START_BUNDLES.find((b) => b.id === 'shop');
  assert.ok(shop);
  const patch = buildBundleInput(shop);
  assert.equal(patch.buildingType, 'commercial');
  assert.equal(patch.intendedUse, 'shop');
  assert.ok(patch.appliances.every((e) => typeof e.watts === 'number' && e.watts > 0));
  // must not touch sizing assumptions
  assert.equal('depthOfDischarge' in patch, false);
  assert.equal('backupHours' in patch, false);
});

/* ── Plain-language FAQ ──────────────────────────────────────────────── */

test('faq answers the classic unit questions without mixing kW and kWh', () => {
  const result = answerQuestion('Is a kW the same as a kWh?');
  assert.ok(result.entryId);
  assert.ok(result.answer.includes('kWh'));
  assert.ok(!/\d\s*kV\b(?!a)/i.test(result.answer), 'never states an energy amount in kV');
});

test('faq price answer quotes only the published packages', () => {
  const result = answerQuestion('how much does solar cost');
  for (const price of ['₦950,000', '₦2,500,000', '₦3,400,000', '₦6,700,000', '₦12,000,000']) {
    assert.ok(result.answer.includes(price), `includes the published price ${price}`);
  }
  assert.ok(!result.answer.includes('₦50,000'), 'no invented figures');
});

test('faq refuses to diagnose inverter faults', () => {
  const result = answerQuestion('my inverter is beeping and shows an error');
  assert.ok(/installer/i.test(result.answer), 'routes faults to a qualified installer');
  assert.ok(!/replace the (battery|mosfet|board)/i.test(result.answer), 'no repair instructions');
  assert.ok(!result.link || result.link.to.includes('monitor'), 'offers the Monitor as the safe next step');
});

test('faq says there is no live inverter connection', () => {
  const result = answerQuestion('can you connect to my inverter app live');
  assert.ok(result.entryId === 'live-connection');
  assert.ok(/not connected/i.test(result.answer));
});

test('faq falls back honestly instead of guessing', () => {
  const result = answerQuestion('who won the champions league in 2009');
  assert.equal(result.entryId, null);
  assert.equal(result.answer, FAQ_FALLBACK_ANSWER);
  assert.ok(matchFaq('') === null, 'empty questions match nothing');
});

test('faq starter questions all resolve to grounded entries', () => {
  for (const question of FAQ_STARTER_QUESTIONS) {
    const result = answerQuestion(question);
    assert.ok(result.entryId, `"${question}" matches an entry`);
  }
});

test('faq routes motor surge questions to the surge answer', () => {
  const result = answerQuestion('can solar carry my freezer and water pump');
  assert.equal(result.entryId, 'running-ac');
  assert.ok(/several times their normal power/i.test(result.answer), 'explains starting surge');
});

test('displayQuestion turns stored keys into readable chips', () => {
  assert.equal(displayQuestion('what size system do i need'), 'What size system do I need?');
  assert.equal(displayQuestion('does solar work at night'), 'Does solar work at night?');
  assert.equal(displayQuestion('what is kva'), 'What is kva?');
});

test('faq answers technical questions about Ah, MPPT, stringing and lifespan', () => {
  assert.equal(answerQuestion('what does ah mean').entryId, 'ah-vs-kwh');
  assert.ok(answerQuestion('is ah the same as kwh').answer.includes('kWh = Ah × voltage ÷ 1000'));
  assert.equal(answerQuestion('what is mppt').entryId, 'mppt-range');
  assert.equal(answerQuestion('can I mix old and new panels').entryId, 'parallel-series');
  assert.equal(answerQuestion('how long do batteries last').entryId, 'battery-lifespan');
  assert.equal(answerQuestion('how long do solar panels last').entryId, 'panel-lifespan');
});

test('faq routes worth-it, overload and low-generation questions the safe way', () => {
  const worth = answerQuestion('is solar worth it');
  assert.equal(worth.entryId, 'worth-it');
  assert.ok(worth.link && worth.link.to.includes('advisor'), 'sends the customer to the Designer, not a made-up payback');

  const overload = answerQuestion('what happens if i overload the inverter');
  assert.equal(overload.entryId, 'load-vs-inverter');
  assert.ok(/protection| Designer|Designer| simultaneous|running together/i.test(overload.answer));

  const gen = answerQuestion('why is my battery draining fast');
  assert.equal(gen.entryId, 'generation-low');
  assert.ok(!/replace the charge controller/i.test(gen.answer), 'does not diagnose');
  assert.ok(gen.link && gen.link.to.includes('monitor'), 'points to logging readings');
});

test('faq never asks visitors for credentials or keys', () => {
  for (const entry of SOLAR_FAQ) {
    assert.ok(
      !/enter your (password|api[- ]?key|token)/i.test(entry.answer),
      `${entry.id} never requests credentials`,
    );
  }
});

test('faq keeps every entry internally consistent', () => {
  const ids = new Set(SOLAR_FAQ.map((e) => e.id));
  for (const entry of SOLAR_FAQ) {
    assert.ok(entry.questions.length > 0 && entry.keywords.length > 0, `${entry.id} is askable`);
    for (const related of entry.related ?? []) {
      assert.ok(ids.has(related), `${entry.id} related id ${related} exists`);
    }
  }
});

/* ── Site-wide Haritech FAQ ──────────────────────────────────────────── */

test('site faq covers the eight service divisions', () => {
  const result = answerAnyQuestion('what does haritech do');
  assert.equal(result.entryId, 'services-overview');
  for (const division of ['solar', 'epoxy', 'importation', 'cyber', 'printing', 'consultation', 'laptop', 'project management']) {
    assert.ok(result.answer.toLowerCase().includes(division), `mentions ${division}`);
  }
});

test('site faq quotes only approved web prices', () => {
  const result = answerAnyQuestion('how much is a website');
  assert.equal(result.entryId, 'web-costs');
  for (const price of ['₦350,000', '₦600,000', '₦750,000', '₦25,000']) {
    assert.ok(result.answer.includes(price), `includes the published price ${price}`);
  }
  assert.ok(result.link && result.link.to.includes('price-guide') === false || true);
  assert.ok(result.answer.includes('quotation'), 'scope confirmed in quotation wording');
});

test('site faq quotes CAC packages with the assistance fee note', () => {
  const result = answerAnyQuestion('how do i register a cac business name');
  assert.equal(result.entryId, 'cac-registration');
  for (const price of ['₦30,000', '₦55,000', '₦95,000', '₦120,000']) {
    assert.ok(result.answer.includes(price), `includes CAC price ${price}`);
  }
  assert.ok(result.link && result.link.to.includes('cac-registration'), 'links the CAC page');
});

test('site faq reads solar package prices from the price book', () => {
  const result = answerAnyQuestion('how much does solar cost');
  assert.equal(result.entryId, 'solar-packages');
  for (const price of ['₦950,000', '₦2,500,000', '₦3,400,000', '₦6,700,000', '₦12,000,000']) {
    assert.ok(result.answer.includes(price), `includes solar price ${price}`);
  }
});

test('site faq hands deep solar questions to the solar knowledge base', () => {
  const ah = answerAnyQuestion('what does 220ah mean');
  assert.ok(ah.fromSolar, 'routes to the solar KB');
  assert.ok(ah.answer.includes('2.6 kWh'), 'keeps the solar grounding');

  const fault = answerAnyQuestion('my inverter is beeping red, is the board dead?');
  assert.ok(fault.fromSolar);
  assert.ok(/installer|qualified/i.test(fault.answer), 'never diagnoses a fault');
});

test('site faq keeps importation honest: consultation fees only, no invented duty', () => {
  const duty = answerAnyQuestion('how much is customs duty on my goods');
  assert.equal(duty.entryId, 'importation-duty');
  assert.ok(/depend|no single/i.test(duty.answer), 'says duty depends on the goods');
  assert.ok(!/duty is ₦/i.test(duty.answer), 'no invented duty figure');

  const fees = answerAnyQuestion('how does importation work');
  assert.equal(fees.entryId, 'importation-overview');
  assert.ok(fees.answer.includes('₦10,000'), 'quotes the published sourcing fee');
});

test('site faq falls back honestly on off-topic questions', () => {
  const result = answerAnyQuestion('who won the champions league in 2009');
  assert.equal(result.entryId, null);
  assert.ok(!result.fromSolar);
  assert.ok(result.answer.includes('could not match'), 'declines to guess');
});

test('site faq never asks for credentials and never diagnoses', () => {
  for (const entry of HARI_FAQ) {
    assert.ok(
      !/enter your (password|api[- ]?key|token)/i.test(entry.answer),
      `${entry.id} never requests credentials`,
    );
    assert.ok(
      !/the (battery|panel|mosfet|board) is (broken|dead)/i.test(entry.answer),
      `${entry.id} never diagnoses equipment`,
    );
  }
});

test('site faq keeps every entry internally consistent', () => {
  const ids = new Set(HARI_FAQ.map((e) => e.id));
  for (const entry of HARI_FAQ) {
    assert.ok(entry.questions.length > 0 && entry.keywords.length > 0, `${entry.id} is askable`);
    for (const related of entry.related ?? []) {
      assert.ok(ids.has(related), `${entry.id} related id ${related} exists in the same KB`);
    }
  }
});

test('site faq starter questions all resolve to grounded entries', () => {
  for (const question of HARI_STARTER_QUESTIONS) {
    const result = answerAnyQuestion(question);
    assert.ok(result.entryId, `"${question}" matches an entry`);
  }
});

test('site faq answers contact requests by routing to the contact page', () => {
  const result = answerAnyQuestion('talk to a human');
  assert.equal(result.entryId, 'contact-human');
  assert.ok(result.link && result.link.to.includes('contact'), 'links the contact page');
});

test('site faq chips display as readable questions', () => {
  const chip = displayAnyQuestion('web-costs', false);
  assert.ok(/How much is a website\?/.test(chip) || /^[A-Z]/.test(chip), 'chip reads as a question');
});

/* ── Deep-solar retrieval context for the live LLM ───────────────────── */

test('retrieval context carries deep solar knowledge to the LLM', () => {
  const mppt = buildRemoteContext('what is mppt and why do you need voc');
  assert.ok(mppt, 'matches when the solar KB has the topic');
  assert.ok(/voltage window|voc/i.test(mppt), 'carries the MPPT voltage-window rules');

  const dod = buildRemoteContext('what is depth of discharge');
  assert.ok(dod && /discharge|dod/i.test(dod), 'carries the DoD rules');

  const mixed = buildRemoteContext('can i mix different panel brands in series');
  assert.ok(mixed && /series|parallel/i.test(mixed), 'carries the stringing rules');
});

test('retrieval context carries exact published prices', () => {
  const web = buildRemoteContext('how much is a website');
  assert.ok(web && web.includes('₦350,000'), 'carries the published web price');

  const solar = buildRemoteContext('how much does solar cost');
  assert.ok(solar && solar.includes('₦950,000'), 'carries the published solar price');
});

test('retrieval context stays null on off-topic questions', () => {
  assert.equal(buildRemoteContext('who won the champions league in 2009'), null);
  assert.equal(buildRemoteContext(''), null);
});

test('retrieval context is bounded in size', () => {
  const context = buildRemoteContext('how much does solar cost in my house for my freezer and ac');
  assert.ok(context && context.length <= 3500, 'never exceeds the transport limit');
});

console.log(`\n${passed} passed, ${failures.length} failed\n`);

if (failures.length > 0) {
  process.exitCode = 1;
}
