import type {
  AdvisorResult,
  AssessmentInput,
  MonitorReading,
  MonitorResult,
  MonitorSystem,
} from './types';
import type { SavedReading } from './monitorStorage';
import { directionLabel, voltageStatusLabel } from './monitor';

export interface ReportMeta {
  name: string;
  location: string;
  contact: string;
  generatedAt: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const naira = (value: number): string =>
  `₦${Math.round(value).toLocaleString('en-NG')}`;

const num = (value: number, digits = 1): string =>
  value.toLocaleString('en-NG', { maximumFractionDigits: digits });

const signedKw = (value: number): string => {
  const rounded = Math.round(value * 100) / 100;
  return rounded > 0 ? `+${rounded}` : String(rounded);
};

const list = (items: string[]): string =>
  items.length === 0
    ? '<p class="muted">None recorded.</p>'
    : `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;

export const buildAssessmentReportHtml = (
  input: AssessmentInput,
  result: AdvisorResult,
  meta: ReportMeta,
): string => {
  const applianceRows = result.energy.applianceResults
    .map((row) => {
      const entry = input.appliances.find((item) => item.uid === row.uid);
      return `<tr>
        <td>${escapeHtml(row.name)}</td>
        <td>${entry ? entry.quantity : ''}</td>
        <td>${entry ? num(entry.watts, 0) : ''} W</td>
        <td>${entry ? num(entry.hoursPerDay, 1) : ''} h</td>
        <td>${num(row.dailyKwh, 2)} kWh</td>
        <td>${num(row.backupKwh, 2)} kWh</td>
      </tr>`;
    })
    .join('');

  const packageLine = result.package.priceNgn === null
    ? `${escapeHtml(result.package.label)} — custom quotation`
    : `${escapeHtml(result.package.label)} — ${naira(result.package.priceNgn)} (published package price)`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Haritech Solar Assessment</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 32px; color: #111827; background: #fff; font-size: 12px; line-height: 1.5; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 14px; margin: 22px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #d1d5db; }
  p { margin: 0 0 8px; }
  .brand { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: #0f766e; font-weight: 700; }
  .muted { color: #6b7280; }
  .meta { margin: 12px 0 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 20px; }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 24px; margin: 10px 0; }
  .metric { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; }
  .metric span { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: #6b7280; }
  .metric strong { display: block; font-size: 16px; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  th, td { text-align: left; border-bottom: 1px solid #e5e7eb; padding: 6px 4px; vertical-align: top; }
  th { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; }
  ul { margin: 4px 0 8px 18px; padding: 0; }
  li { margin: 0 0 3px; }
  .note { border-left: 3px solid #f59e0b; background: #fffbeb; padding: 8px 12px; margin: 10px 0; }
  .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #d1d5db; font-size: 10px; color: #6b7280; }
  @media print { body { padding: 16px; } .no-print { display: none; } }
</style>
</head>
<body>
  <div class="brand">Haritech Exclusive Business — Smart Tech, Smart Living.</div>
  <h1>Solar System Assessment</h1>
  <p class="muted">Preliminary estimate for discussion. Not a final design or a binding quotation.</p>

  <div class="meta">
    <div><strong>Name:</strong> ${escapeHtml(meta.name || 'Not supplied')}</div>
    <div><strong>Location:</strong> ${escapeHtml(meta.location || 'Not supplied')}</div>
    <div><strong>Contact:</strong> ${escapeHtml(meta.contact || 'Not supplied')}</div>
    <div><strong>Generated:</strong> ${escapeHtml(meta.generatedAt)}</div>
  </div>

  <h2>Property and requirements</h2>
  <p><strong>Building:</strong> ${escapeHtml(input.buildingType)} · <strong>Intended use:</strong> ${escapeHtml(input.intendedUse)} · <strong>Phase:</strong> ${escapeHtml(input.phase)}</p>
  <p><strong>Backup requested:</strong> ${input.wantsBackup ? 'Yes' : 'No'} · <strong>Backup duration:</strong> ${num(input.backupHours, 1)} h · <strong>Night use:</strong> ${input.wantsNightUse ? 'Yes' : 'No'} · <strong>Expand existing system:</strong> ${input.wantsExpansion ? 'Yes' : 'No'}</p>
  <p><strong>Existing equipment:</strong> ${[input.ownsInverter ? 'inverter' : '', input.ownsBattery ? 'battery' : '', input.ownsPanels ? 'panels' : ''].filter(Boolean).join(', ') || 'None declared'}</p>

  <h2>Energy estimate</h2>
  <div class="grid">
    <div class="metric"><span>Daily energy</span><strong>${num(result.energy.totalDailyKwh, 2)} kWh</strong></div>
    <div class="metric"><span>Weekly energy</span><strong>${num(result.energy.weeklyKwh, 1)} kWh</strong></div>
    <div class="metric"><span>Monthly energy (30 days)</span><strong>${num(result.energy.monthlyKwh, 1)} kWh</strong></div>
    <div class="metric"><span>Simultaneous running load</span><strong>${num(result.energy.simultaneousKw, 2)} kW</strong></div>
  </div>

  <table>
    <thead><tr><th>Appliance</th><th>Qty</th><th>Rated power</th><th>Hours/day</th><th>Daily</th><th>Backup</th></tr></thead>
    <tbody>${applianceRows || '<tr><td colspan="6">No appliances recorded.</td></tr>'}</tbody>
  </table>
  <p class="muted">Simultaneous-load basis: ${escapeHtml(result.energy.simultaneousBasis)}. Surge demand: ${result.energy.surgeDemandKw === null ? 'not supplied' : `${num(result.energy.surgeDemandKw, 2)} kW`}.</p>

  <h2>Recommended equipment</h2>
  <div class="grid">
    <div class="metric"><span>Inverter continuous requirement</span><strong>${num(result.inverter.requiredContinuousKw, 2)} kW</strong></div>
    <div class="metric"><span>Inverter apparent power</span><strong>${num(result.inverter.requiredKva, 2)} kVA</strong></div>
    <div class="metric"><span>Recommended nominal inverter</span><strong>${result.inverter.recommendedKva === null ? 'Custom design' : `${num(result.inverter.recommendedKva, 1)} kVA`}</strong></div>
    <div class="metric"><span>Battery nominal capacity</span><strong>${num(result.battery.requiredNominalKwh, 1)} kWh</strong></div>
    <div class="metric"><span>Battery usable energy</span><strong>${num(result.battery.usableKwh, 1)} kWh</strong></div>
    <div class="metric"><span>Battery voltage / Ah</span><strong>${result.battery.voltage === null ? 'Voltage not supplied' : `${num(result.battery.voltage, 1)} V / ${result.battery.requiredAh === null ? '—' : `${num(result.battery.requiredAh, 0)} Ah`}`}</strong></div>
    <div class="metric"><span>Solar array</span><strong>${result.pv.pvKwp === null ? 'Peak sun hours required' : `${num(result.pv.pvKwp, 2)} kWp`}</strong></div>
    <div class="metric"><span>Panel count</span><strong>${result.pv.panelCount === null ? 'Panel wattage required' : `${result.pv.panelCount} ${result.pv.panelCount === 1 ? 'panel' : 'panels'}`}</strong></div>
  </div>
  <p><strong>Battery configuration:</strong> ${escapeHtml(result.battery.configuration)}</p>
  <p><strong>Published package:</strong> ${packageLine}</p>
  <p class="muted">${escapeHtml(result.package.note)}</p>

  <h2>Assumptions</h2>
  ${list(result.assumptions)}

  <h2>Warnings and limitations</h2>
  ${list(result.warnings)}

  <div class="note">
    This assessment is preliminary. Appliance wattages are estimates unless checked against the label. Battery, inverter and panel models, string design, protection and installation must be confirmed by a qualified installer after a site assessment. Haritech does not diagnose a fault from a single reading.
  </div>

  <div class="footer">
    Haritech Exclusive Business · Smart Tech, Smart Living. · Generated ${escapeHtml(meta.generatedAt)} · Prices are indicative and subject to written quotation.
  </div>

  <p class="no-print" style="margin-top:16px"><button onclick="window.print()">Print / Save as PDF</button></p>
</body>
</html>`;
};

export interface MonitorReportMeta {
  name: string;
  location: string;
  contact: string;
  generatedAt: string;
}

const monitorValue = (value: number | null, unit: string, digits = 2): string =>
  value === null ? 'Not supplied' : `${num(value, digits)} ${unit}`;

export const buildMonitorReportHtml = (
  system: MonitorSystem,
  reading: MonitorReading,
  result: MonitorResult,
  history: SavedReading[],
  meta: MonitorReportMeta,
): string => {
  const historyRows = history
    .slice(0, 10)
    .map(
      (row) => `<tr>
        <td>${escapeHtml(new Date(row.reading.takenAt).toLocaleString('en-NG'))}</td>
        <td>${monitorValue(row.reading.batteryVoltage, 'V', 1)}</td>
        <td>${monitorValue(row.reading.batteryCurrentA, 'A', 1)}</td>
        <td>${row.reading.socPct === null ? '—' : `${num(row.reading.socPct, 0)}%`}</td>
        <td>${monitorValue(row.reading.acLoadKw, 'kW')}</td>
        <td>${monitorValue(row.reading.pvInputKw, 'kW')}</td>
      </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Haritech Solar Power Monitor</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 32px; color: #111827; background: #fff; font-size: 12px; line-height: 1.5; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 14px; margin: 22px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #d1d5db; }
  p { margin: 0 0 8px; }
  .brand { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: #0f766e; font-weight: 700; }
  .muted { color: #6b7280; }
  .meta { margin: 12px 0 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 20px; }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 24px; margin: 10px 0; }
  .metric { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; }
  .metric span { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: #6b7280; }
  .metric strong { display: block; font-size: 16px; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  th, td { text-align: left; border-bottom: 1px solid #e5e7eb; padding: 6px 4px; vertical-align: top; }
  th { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; }
  ul { margin: 4px 0 8px 18px; padding: 0; }
  li { margin: 0 0 3px; }
  .note { border-left: 3px solid #f59e0b; background: #fffbeb; padding: 8px 12px; margin: 10px 0; }
  .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #d1d5db; font-size: 10px; color: #6b7280; }
  @media print { body { padding: 16px; } .no-print { display: none; } }
</style>
</head>
<body>
  <div class="brand">Haritech Exclusive Business — Smart Tech, Smart Living.</div>
  <h1>Solar Power Monitor — reading record</h1>
  <p class="muted">Manual reading. No live inverter connection. Not a diagnosis.</p>

  <div class="meta">
    <div><strong>Name:</strong> ${escapeHtml(meta.name || 'Not supplied')}</div>
    <div><strong>Location:</strong> ${escapeHtml(meta.location || 'Not supplied')}</div>
    <div><strong>Contact:</strong> ${escapeHtml(meta.contact || 'Not supplied')}</div>
    <div><strong>Generated:</strong> ${escapeHtml(meta.generatedAt)}</div>
  </div>

  <h2>System details</h2>
  <p><strong>Battery bank:</strong> ${system.bankKwh === null ? 'capacity not supplied' : `${num(system.bankKwh, 2)} kWh`}${system.bankVoltage === null ? '' : ` at ${num(system.bankVoltage, 1)} V`} · <strong>Depth of discharge:</strong> ${num(system.depthOfDischargePct, 0)}% · <strong>Inverter efficiency:</strong> ${num(system.inverterEfficiencyPct, 0)}%</p>
  <p><strong>Voltage band:</strong> ${system.lowCutoffV === null ? 'cutoff not supplied' : `${num(system.lowCutoffV, 1)} V cutoff`}${system.fullChargeV === null ? '' : ` / ${num(system.fullChargeV, 1)} V full charge`} · <strong>Temperature limit:</strong> ${system.maxTemperatureC === null ? 'not supplied' : `${num(system.maxTemperatureC, 0)} °C`}</p>

  <h2>Reading</h2>
  <p><strong>Taken:</strong> ${escapeHtml(new Date(reading.takenAt).toLocaleString('en-NG'))}</p>
  <div class="grid">
    <div class="metric"><span>Battery voltage</span><strong>${monitorValue(reading.batteryVoltage, 'V', 1)}</strong></div>
    <div class="metric"><span>Battery current</span><strong>${monitorValue(reading.batteryCurrentA, 'A', 1)}</strong></div>
    <div class="metric"><span>State of charge</span><strong>${reading.socPct === null ? 'Not supplied' : `${num(reading.socPct, 0)}%`}</strong></div>
    <div class="metric"><span>AC load</span><strong>${monitorValue(reading.acLoadKw, 'kW')}</strong></div>
    <div class="metric"><span>PV input</span><strong>${monitorValue(reading.pvInputKw, 'kW')}</strong></div>
    <div class="metric"><span>Inverter temperature</span><strong>${reading.temperatureC === null ? 'Not supplied' : `${num(reading.temperatureC, 0)} °C`}</strong></div>
  </div>
  ${reading.note.trim() ? `<p><strong>Note:</strong> ${escapeHtml(reading.note.trim())}</p>` : ''}

  <h2>Interpretation</h2>
  <div class="grid">
    <div class="metric"><span>Battery power</span><strong>${result.batteryPowerKw === null ? 'Not enough information' : `${signedKw(result.batteryPowerKw)} kW`}</strong></div>
    <div class="metric"><span>Direction</span><strong>${escapeHtml(directionLabel(result.direction))}</strong></div>
    <div class="metric"><span>Energy available</span><strong>${result.availableKwh === null ? 'Not enough information' : `${num(result.availableKwh, 2)} kWh`}</strong></div>
    <div class="metric"><span>Runtime estimate</span><strong>${result.runtimeHours === null ? 'Not enough information' : `${num(result.runtimeHours, 1)} h`}</strong></div>
    <div class="metric"><span>Charge time estimate</span><strong>${result.chargeHours === null ? 'Not enough information' : `${num(result.chargeHours, 1)} h`}</strong></div>
    <div class="metric"><span>Voltage status</span><strong>${escapeHtml(voltageStatusLabel(result.voltageStatus))}</strong></div>
  </div>
  <p class="muted">${escapeHtml(result.availableBasis || 'Energy available was not calculated.')}</p>
  <p class="muted">${escapeHtml(result.runtimeBasis || 'Runtime was not calculated.')}</p>
  <p class="muted">${escapeHtml(result.chargeBasis || 'Charge time was not calculated.')}</p>
  <p>${escapeHtml(result.voltageNote)}</p>

  <h2>Observations</h2>
  ${list(result.observations)}

  <h2>What is still missing</h2>
  ${list(result.missing)}

  <h2>Recent saved readings</h2>
  <table>
    <thead><tr><th>Taken</th><th>Voltage</th><th>Current</th><th>SOC</th><th>AC load</th><th>PV input</th></tr></thead>
    <tbody>${historyRows || '<tr><td colspan="6">No saved readings.</td></tr>'}</tbody>
  </table>

  <div class="note">
    This record contains readings typed in by the customer or installer. It is not live inverter data and it is not a
    diagnosis. A single reading cannot confirm battery health or identify a fault. Only a qualified installer using
    approved test equipment and the manufacturer’s datasheet can do that.
  </div>

  <div class="footer">
    Haritech Exclusive Business · Smart Tech, Smart Living. · Generated ${escapeHtml(meta.generatedAt)} · No inverter password, API key or token is stored in this report.
  </div>

  <p class="no-print" style="margin-top:16px"><button onclick="window.print()">Print / Save as PDF</button></p>
</body>
</html>`;
};

export const openReportWindow = (html: string): boolean => {
  // Do not pass "noopener" here: browsers return null for that window handle,
  // so the report could not be written. Open the blank window, detach its
  // opener immediately, then write the self-contained report into it.
  const win = window.open('', '_blank');
  if (!win) return false;
  try {
    win.opener = null;
  } catch {
    /* some browsers expose a read-only opener — the report still works */
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
};

export const downloadJson = (filename: string, data: unknown): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
