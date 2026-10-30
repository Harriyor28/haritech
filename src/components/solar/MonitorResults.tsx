import React from 'react';
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Info,
  Printer,
  Save,
  Sun,
  Trash2,
  Zap,
} from 'lucide-react';
import type { MonitorReading, MonitorResult, MonitorSystem } from '../../utils/solar/types';
import { directionLabel, voltageStatusLabel } from '../../utils/solar/monitor';
import { Metric } from './SolarField';

interface MonitorResultsProps {
  system: MonitorSystem;
  reading: MonitorReading;
  result: MonitorResult;
  comparedWith: string | null;
  canSave: boolean;
  onSave: () => void;
  onPrint: () => void;
  onExport: () => void;
  onClear: () => void;
}

const num = (value: number, digits = 2): string =>
  value.toLocaleString('en-NG', { maximumFractionDigits: digits });

const signedKw = (value: number): string => {
  const rounded = Math.round(value * 100) / 100;
  return rounded > 0 ? `+${rounded}` : String(rounded);
};

const statusTone: Record<
  MonitorResult['voltageStatus'],
  { border: string; text: string; label: string }
> = {
  low: { border: 'border-amber-400/40 bg-amber-400/10', text: 'text-amber-200', label: 'Low voltage' },
  within: { border: 'border-emerald-400/30 bg-emerald-400/10', text: 'text-emerald-200', label: 'Inside band' },
  full: { border: 'border-cyan-400/30 bg-cyan-400/10', text: 'text-cyan-200', label: 'Full charge' },
  unknown: { border: 'border-white/10 bg-slate-950/40', text: 'text-slate-300', label: 'No status' },
};

export const MonitorResults: React.FC<MonitorResultsProps> = ({
  system,
  reading,
  result,
  comparedWith,
  canSave,
  onSave,
  onPrint,
  onExport,
  onClear,
}) => {
  const tone = statusTone[result.voltageStatus];
  const temperatureText =
    result.temperatureState === 'unknown'
      ? reading.temperatureC === null
        ? 'Not measured'
        : 'No limit entered'
      : result.temperatureState === 'hot'
        ? 'Above entered limit'
        : 'Within entered limit';

  return (
    <div className="space-y-4">
      <section className="card p-5 sm:p-6 bg-[#0b101c]/90 border-white/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-amber-300">
              Manual reading · not live data
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Reading interpretation
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(reading.takenAt).toLocaleString('en-NG')}
              {reading.note.trim() ? ` · ${reading.note.trim()}` : ''}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {comparedWith
                ? `Compared with the saved reading from ${new Date(comparedWith).toLocaleString('en-NG')}.`
                : 'No earlier saved reading to compare with yet.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" /> Print / PDF
            </button>
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Export JSON
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!canSave}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-400/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="h-3.5 w-3.5" /> Save reading
            </button>
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </div>

        {!canSave && (
          <p className="mt-3 text-[11px] text-amber-200/90 leading-relaxed">
            Enter at least one measurement — battery voltage, battery current, AC load or PV input — before saving.
          </p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 mt-5">
          <Metric
            label="Battery power"
            value={result.batteryPowerKw === null ? 'Not enough information' : `${signedKw(result.batteryPowerKw)} kW`}
            detail={directionLabel(result.direction)}
            tone={result.batteryPowerKw === null ? 'warn' : result.direction === 'discharging' ? 'default' : 'good'}
          />
          <Metric
            label="DC discharge"
            value={result.dcDischargeKw === null ? '—' : `${num(result.dcDischargeKw)} kW`}
            detail="Battery side, from V × A"
          />
          <Metric
            label="AC equivalent"
            value={result.acDischargeKw === null ? '—' : `${num(result.acDischargeKw)} kW`}
            detail={`DC × ${num(system.inverterEfficiencyPct, 0)}% inverter efficiency`}
          />
          <Metric
            label="Energy available"
            value={result.availableKwh === null ? 'Not enough information' : `${num(result.availableKwh)} kWh`}
            detail={result.availableBasis || 'Battery capacity required'}
            tone={result.availableKwh === null ? 'warn' : 'default'}
          />
          <Metric
            label="Runtime estimate"
            value={result.runtimeHours === null ? 'Not enough information' : `${num(result.runtimeHours, 1)} h`}
            detail={result.runtimeBasis}
            tone={result.runtimeHours === null ? 'warn' : 'good'}
          />
          <Metric
            label="Charge time estimate"
            value={result.chargeHours === null ? 'Not enough information' : `${num(result.chargeHours, 1)} h`}
            detail={result.chargeBasis}
            tone={result.chargeHours === null ? 'warn' : 'good'}
          />
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <section className={`card p-5 border ${tone.border}`}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className={`h-4 w-4 ${tone.text}`} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Voltage status</h3>
          </div>
          <p className={`text-lg font-bold ${tone.text}`}>{voltageStatusLabel(result.voltageStatus)}</p>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{result.voltageNote}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-500">
            <span>Reading: {reading.batteryVoltage === null ? '—' : `${num(reading.batteryVoltage, 1)} V`}</span>
            <span>Cutoff: {system.lowCutoffV === null ? '—' : `${num(system.lowCutoffV, 1)} V`}</span>
            <span>Full: {system.fullChargeV === null ? '—' : `${num(system.fullChargeV, 1)} V`}</span>
          </div>
        </section>

        <section className="card p-5 bg-[#0b101c]/90 border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="h-4 w-4 text-yellow-300" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Solar and temperature</h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Metric
              label="PV input"
              value={reading.pvInputKw === null ? 'Not measured' : `${num(reading.pvInputKw)} kW`}
              tone={reading.pvInputKw === null ? 'warn' : 'default'}
            />
            <Metric
              label="Inverter temperature"
              value={reading.temperatureC === null ? 'Not measured' : `${num(reading.temperatureC, 0)} °C`}
              detail={temperatureText}
              tone={result.temperatureState === 'hot' ? 'warn' : 'default'}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
            PV input is what the panels produced at the moment of the reading, not a daily total.
          </p>
        </section>
      </div>

      <section className="card p-5 bg-[#0b101c]/90 border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <BatteryCharging className="h-4 w-4 text-cyan-300" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">What this reading shows</h3>
        </div>
        <ul className="space-y-2">
          {result.observations.map((observation, index) => (
            <li
              key={`${index}-${observation.slice(0, 20)}`}
              className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed"
            >
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
              {observation}
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5 bg-[#0b101c]/90 border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-amber-300" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">
            Not enough information yet ({result.missing.length})
          </h3>
        </div>
        {result.missing.length === 0 ? (
          <p className="text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            Every estimate this page can make is available from the values supplied. That still does not confirm the
            battery is healthy.
          </p>
        ) : (
          <ul className="space-y-2">
            {result.missing.map((item, index) => (
              <li
                key={`${index}-${item.slice(0, 20)}`}
                className="flex items-start gap-2 text-xs text-amber-100/90 leading-relaxed"
              >
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5 bg-[#0b101c]/90 border-white/10">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-400 leading-relaxed space-y-1.5">
            <p className="font-bold text-slate-300 uppercase tracking-wide text-[10px]">Limitations</p>
            <p>
              This page explains the numbers you typed in. It is not a diagnosis and it is not live inverter data. A
              single reading cannot confirm battery health, remaining life or a fault.
            </p>
            <p>
              Runtime and charge time are arithmetic estimates. Real performance depends on load changes, temperature,
              battery age, the BMS, inverter derating and the taper near full charge.
            </p>
            <p>
              If the inverter reports a fault code, a hot smell, swelling or a shutdown, stop using it and contact a
              qualified installer. Do not rely on this page for a safety decision.
            </p>
            <p className="inline-flex items-center gap-1.5 text-slate-500">
              <Zap className="h-3 w-3" /> kW ≠ kVA · kWh ≠ kW · Ah is only meaningful with a known voltage
            </p>
            <p className="inline-flex items-center gap-1.5 text-slate-500">
              <Clock className="h-3 w-3" /> No password, API key or token is stored by this page.
            </p>
          </div>
        </div>
      </section>

      <p className="text-[10px] text-slate-600 leading-relaxed flex items-start gap-1.5">
        <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        Saved readings stay in this browser unless you choose to back them up. They are never visible to other
        visitors.
      </p>
    </div>
  );
};
