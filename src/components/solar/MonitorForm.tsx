import React from 'react';
import { Clock, Gauge, Info } from 'lucide-react';
import type { MonitorReading, MonitorSystem } from '../../utils/solar/types';
import { hintClass, inputClass, labelClass, NumberField, StepCard } from './SolarField';

const pad = (value: number): string => String(value).padStart(2, '0');

export const toLocalDateTimeInput = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

const fromLocalDateTimeInput = (value: string): string | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

interface DateTimeFieldProps {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  hint?: string;
}

const DateTimeField: React.FC<DateTimeFieldProps> = ({ label, value, onChange, hint }) => {
  const inputId = React.useId();
  return (
    <div>
      <label htmlFor={inputId} className={labelClass}>{label}</label>
      <input
        id={inputId}
        type="datetime-local"
        className={inputClass}
        value={toLocalDateTimeInput(value)}
        onChange={(event) => {
          const iso = fromLocalDateTimeInput(event.target.value);
          if (iso) onChange(iso);
        }}
      />
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
};

interface MonitorSystemPanelProps {
  system: MonitorSystem;
  onChange: (patch: Partial<MonitorSystem>) => void;
  assessmentOptions: { id: string; label: string }[];
  onImportAssessment: (id: string) => void;
}

export const MonitorSystemPanel: React.FC<MonitorSystemPanelProps> = ({
  system,
  onChange,
  assessmentOptions,
  onImportAssessment,
}) => (
  <StepCard
    title="Battery and inverter details"
    description="These come from the battery and inverter datasheets. The monitor uses them for estimates only; it does not assume a model."
  >
    {assessmentOptions.length > 0 && (
      <div className="mb-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-3 py-2.5">
        <label htmlFor="monitor-import" className={labelClass}>
          Import battery details from a saved assessment
        </label>
        <select
          id="monitor-import"
          className={inputClass}
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) onImportAssessment(event.target.value);
          }}
        >
          <option value="" className="bg-slate-900">Choose a saved assessment…</option>
          {assessmentOptions.map((option) => (
            <option key={option.id} value={option.id} className="bg-slate-900">
              {option.label}
            </option>
          ))}
        </select>
        <p className={`${hintClass} text-cyan-100/70`}>
          Copies the battery capacity and voltage the designer calculated. Check them against the installed equipment.
        </p>
      </div>
    )}

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <NumberField
        label="Battery bank capacity"
        suffix="kWh"
        min={0}
        step={0.1}
        value={system.bankKwh}
        placeholder="From the battery datasheet"
        onChange={(value) => onChange({ bankKwh: value })}
        hint="Nominal energy, not the usable figure."
      />
      <NumberField
        label="Battery bank voltage"
        suffix="V"
        min={0}
        step={1}
        value={system.bankVoltage}
        placeholder="e.g. 48"
        onChange={(value) => onChange({ bankVoltage: value })}
      />
      <NumberField
        label="Depth of discharge"
        suffix="%"
        min={1}
        max={100}
        step={1}
        value={system.depthOfDischargePct}
        onChange={(value) => onChange({ depthOfDischargePct: value ?? 80 })}
        hint="The manufacturer-approved usable share."
      />
      <NumberField
        label="Inverter efficiency"
        suffix="%"
        min={1}
        max={100}
        step={1}
        value={system.inverterEfficiencyPct}
        onChange={(value) => onChange({ inverterEfficiencyPct: value ?? 90 })}
        hint="Used to convert DC battery power to AC load."
      />
      <NumberField
        label="Low-voltage cutoff"
        suffix="V"
        min={0}
        step={0.1}
        value={system.lowCutoffV}
        placeholder="From the inverter"
        onChange={(value) => onChange({ lowCutoffV: value })}
        hint="Required before a status band can be shown."
      />
      <NumberField
        label="Full-charge voltage"
        suffix="V"
        min={0}
        step={0.1}
        value={system.fullChargeV}
        placeholder="From the inverter"
        onChange={(value) => onChange({ fullChargeV: value })}
        hint="Must be above the low-voltage cutoff."
      />
      <NumberField
        label="Maximum inverter temperature"
        suffix="°C"
        min={0}
        max={120}
        step={1}
        value={system.maxTemperatureC}
        placeholder="From the datasheet"
        onChange={(value) => onChange({ maxTemperatureC: value })}
        hint="Only used to flag a reading above the limit you enter."
      />
    </div>
  </StepCard>
);

interface MonitorReadingPanelProps {
  reading: MonitorReading;
  onChange: (patch: Partial<MonitorReading>) => void;
  onUseNow: () => void;
  noteWarning: boolean;
}

export const MonitorReadingPanel: React.FC<MonitorReadingPanelProps> = ({
  reading,
  onChange,
  onUseNow,
  noteWarning,
}) => (
  <StepCard
    title="This reading"
    description="Type the numbers exactly as the inverter display or your clamp meter shows them. Leave a field blank if you did not measure it."
  >
    <div className="flex flex-col sm:flex-row sm:items-end gap-3">
      <div className="flex-1">
        <DateTimeField
          label="Reading taken at"
          value={reading.takenAt}
          onChange={(iso) => onChange({ takenAt: iso })}
          hint="Used to order readings and calculate the interval between them."
        />
      </div>
      <button
        type="button"
        onClick={onUseNow}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors"
      >
        <Clock className="h-3.5 w-3.5" /> Use now
      </button>
    </div>

    <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2.5 flex items-start gap-2">
      <Info className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
      <p className="text-[11px] text-amber-100/80 leading-relaxed">
        Battery current sign: <strong>positive = charging</strong>, <strong>negative = discharging</strong>. Enter it as
        the inverter shows it. If your meter only gives a magnitude, add the minus sign yourself while discharging.
      </p>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
      <NumberField
        label="Battery voltage"
        suffix="V"
        min={0}
        step={0.1}
        value={reading.batteryVoltage}
        placeholder="e.g. 51.2"
        onChange={(value) => onChange({ batteryVoltage: value })}
      />
      <NumberField
        label="Battery current"
        suffix="A"
        step={0.1}
        value={reading.batteryCurrentA}
        placeholder="−12 while discharging"
        onChange={(value) => onChange({ batteryCurrentA: value })}
        hint="Positive charging, negative discharging."
      />
      <NumberField
        label="State of charge"
        suffix="%"
        min={0}
        max={100}
        step={1}
        value={reading.socPct}
        placeholder="If the inverter shows it"
        onChange={(value) => onChange({ socPct: value })}
        hint="Needed for charge time and remaining-energy estimates."
      />
      <NumberField
        label="AC output load"
        suffix="kW"
        min={0}
        step={0.01}
        value={reading.acLoadKw}
        placeholder="e.g. 1.4"
        onChange={(value) => onChange({ acLoadKw: value })}
      />
      <NumberField
        label="PV input"
        suffix="kW"
        min={0}
        step={0.01}
        value={reading.pvInputKw}
        placeholder="e.g. 0.9"
        onChange={(value) => onChange({ pvInputKw: value })}
        hint="What the panels are producing at this moment."
      />
      <NumberField
        label="Inverter temperature"
        suffix="°C"
        min={0}
        max={120}
        step={1}
        value={reading.temperatureC}
        placeholder="If shown"
        onChange={(value) => onChange({ temperatureC: value })}
      />
      <NumberField
        label="Average load for runtime"
        suffix="kW"
        min={0}
        step={0.01}
        value={reading.runtimeLoadKw}
        placeholder="Defaults to the AC load"
        onChange={(value) => onChange({ runtimeLoadKw: value })}
        hint="The load you expect during the outage you are planning for."
      />
    </div>

    <div className="mt-4">
      <label htmlFor="monitor-note" className={labelClass}>Note (optional)</label>
      <textarea
        id="monitor-note"
        className={`${inputClass} min-h-[76px] resize-y`}
        value={reading.note}
        maxLength={500}
        placeholder="e.g. Cloudy afternoon, fridge and fans running, grid off."
        onChange={(event) => onChange({ note: event.target.value })}
      />
      <p className={hintClass}>
        Keep to what you observed. The monitor does not accept inverter passwords, API keys or access tokens.
      </p>
      {noteWarning && (
        <p className="mt-1.5 text-[11px] text-red-300 leading-relaxed">
          This note looks like it contains a password, API key or token. Remove it before saving, printing or exporting.
        </p>
      )}
    </div>

    <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
      <Gauge className="h-4 w-4 shrink-0 mt-0.5 text-slate-500" />
      <span>
        No live connection is configured. These figures are only what you type here — the page cannot read your inverter
        directly.
      </span>
    </div>
  </StepCard>
);
