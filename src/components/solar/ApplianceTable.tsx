import React from 'react';
import { Copy, Plus, Trash2, Zap } from 'lucide-react';
import type { ApplianceEntry, Duty } from '../../utils/solar/types';
import { applianceBackupKwh, applianceDailyWh, roundTo } from '../../utils/solar/validation';
import { NumberField, inputClass, labelClass } from './SolarField';

interface ApplianceTableProps {
  entries: ApplianceEntry[];
  globalBackupHours: number;
  onChange: (uid: string, patch: Partial<ApplianceEntry>) => void;
  onRemove: (uid: string) => void;
  onDuplicate: (uid: string) => void;
  onAddManual: () => void;
}

const dutyOptions: { value: Duty; label: string }[] = [
  { value: 'continuous', label: 'Continuous' },
  { value: 'intermittent', label: 'Intermittent' },
  { value: 'scheduled', label: 'Scheduled' },
];

export const ApplianceTable: React.FC<ApplianceTableProps> = ({
  entries,
  globalBackupHours,
  onChange,
  onRemove,
  onDuplicate,
  onAddManual,
}) => {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-slate-950/30 px-4 py-10 text-center">
        <Zap className="h-7 w-7 text-amber-400/70 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-200">No appliances yet</p>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
          Add appliances from the catalogue above, or add a manual appliance and enter the wattage printed on its label.
        </p>
        <button
          type="button"
          onClick={onAddManual}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add manual appliance
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const dailyKwh = applianceDailyWh(entry) / 1000;
        const backupKwh = applianceBackupKwh(entry, globalBackupHours);
        return (
          <div key={entry.uid} className="rounded-xl border border-white/10 bg-slate-950/40 p-3 sm:p-4">
            <div className="flex items-start gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <label className={labelClass}>Appliance name</label>
                <input
                  className={`${inputClass} font-semibold`}
                  value={entry.name}
                  maxLength={80}
                  onChange={(event) => onChange(entry.uid, { name: event.target.value })}
                />
              </div>
              <div className="flex gap-1 pt-6 shrink-0">
                <button
                  type="button"
                  onClick={() => onDuplicate(entry.uid)}
                  className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Duplicate appliance"
                  aria-label={`Duplicate ${entry.name}`}
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(entry.uid)}
                  className="p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Remove appliance"
                  aria-label={`Remove ${entry.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <NumberField
                label="Rated power"
                suffix="W"
                min={0}
                max={100000}
                step={1}
                value={entry.watts}
                onChange={(value) => onChange(entry.uid, { watts: value ?? 0 })}
              />
              <NumberField
                label="Quantity"
                min={1}
                max={999}
                step={1}
                value={entry.quantity}
                onChange={(value) =>
                  onChange(entry.uid, { quantity: Math.max(1, Math.round(value ?? 1)) })
                }
              />
              <NumberField
                label="Hours / day"
                suffix="h"
                min={0}
                max={24}
                step={0.25}
                value={entry.hoursPerDay}
                onChange={(value) => onChange(entry.uid, { hoursPerDay: value ?? 0 })}
              />
              <NumberField
                label="Start-up surge"
                suffix="W"
                min={0}
                max={300000}
                step={10}
                value={entry.surgeWatts}
                placeholder="Not supplied"
                onChange={(value) => onChange(entry.uid, { surgeWatts: value })}
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              <div>
                <label className={labelClass}>Duty</label>
                <select
                  className={inputClass}
                  value={entry.duty}
                  onChange={(event) => onChange(entry.uid, { duty: event.target.value as Duty })}
                >
                  {dutyOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-slate-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <NumberField
                label="Schedule start"
                suffix="h"
                min={0}
                max={23}
                step={1}
                value={entry.scheduleStart}
                placeholder="—"
                onChange={(value) => onChange(entry.uid, { scheduleStart: value })}
              />
              <NumberField
                label="Schedule end"
                suffix="h"
                min={0}
                max={23}
                step={1}
                value={entry.scheduleEnd}
                placeholder="—"
                onChange={(value) => onChange(entry.uid, { scheduleEnd: value })}
              />
              <NumberField
                label="Backup hours"
                suffix="h"
                min={0}
                max={24}
                step={0.25}
                value={entry.backupHours > 0 ? entry.backupHours : null}
                placeholder={entry.backup ? String(globalBackupHours) : '—'}
                disabled={!entry.backup}
                onChange={(value) => onChange(entry.uid, { backupHours: value ?? 0 })}
                hint={entry.backup ? 'Blank uses the property backup duration.' : 'Mark for backup to set hours.'}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-slate-900 text-amber-500 focus:ring-amber-400/40"
                  checked={entry.simultaneous}
                  onChange={(event) => onChange(entry.uid, { simultaneous: event.target.checked })}
                />
                Runs together with other appliances
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-slate-900 text-amber-500 focus:ring-amber-400/40"
                  checked={entry.backup}
                  onChange={(event) => onChange(entry.uid, { backup: event.target.checked })}
                />
                Keep on during an outage
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/5 pt-2.5 text-[11px] font-mono text-slate-500">
              <span>Daily: <strong className="text-slate-300">{roundTo(dailyKwh, 3)} kWh</strong></span>
              <span>Backup: <strong className="text-slate-300">{roundTo(backupKwh, 3)} kWh</strong></span>
              <span>Running: <strong className="text-slate-300">{roundTo((entry.watts * entry.quantity) / 1000, 3)} kW</strong></span>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={onAddManual}
        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 px-3 py-3 text-xs font-bold text-slate-300 hover:bg-white/5 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" /> Add manual appliance
      </button>
    </div>
  );
};
