import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Plus,
  RotateCcw,
  Save,
  Sun,
  Trash2,
} from 'lucide-react';
import {
  defaultSolarAdvisorConfig,
  getSolarAdvisorConfig,
  resetSolarAdvisorConfig,
  setSolarAdvisorConfig,
} from '../../utils/solarConfig';
import { APPLIANCE_CATEGORY_LABELS } from '../../config/solar/appliances';
import type {
  ApplianceCategory,
  ApplianceTemplate,
  Duty,
  SolarAssumptions,
} from '../../utils/solar/types';

const inputClass =
  'w-full px-3 py-2.5 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white placeholder:text-slate-600';
const labelClass = 'block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide';

const categories: ApplianceCategory[] = ['lighting', 'home', 'office', 'business', 'other'];
const duties: Duty[] = ['continuous', 'intermittent', 'scheduled'];

const percent = (value: number): number => Math.round(value * 1000) / 10;

const HaritechSolarAdvisorManager: React.FC = () => {
  const [config, setConfig] = useState(() => getSolarAdvisorConfig());
  const [sizesText, setSizesText] = useState(() =>
    config.assumptions.inverterSizesKva.join(', '),
  );
  const [changeNote, setChangeNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const updateTemplate = (index: number, patch: Partial<ApplianceTemplate>) => {
    setConfig((previous) => ({
      ...previous,
      appliances: previous.appliances.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
    setSaved(false);
  };

  const updateAssumption = (patch: Partial<SolarAssumptions>) => {
    setConfig((previous) => ({
      ...previous,
      assumptions: { ...previous.assumptions, ...patch },
    }));
    setSaved(false);
  };

  const addTemplate = () => {
    const template: ApplianceTemplate = {
      id: `custom-${Date.now()}`,
      name: 'New appliance',
      category: 'other',
      watts: 100,
      surgeWatts: null,
      defaultHours: 1,
      duty: 'intermittent',
      note: 'Confirm the wattage on the appliance label.',
    };
    setConfig((previous) => ({ ...previous, appliances: [...previous.appliances, template] }));
    setSaved(false);
  };

  const removeTemplate = (index: number) => {
    setConfig((previous) => ({
      ...previous,
      appliances: previous.appliances.filter((_, itemIndex) => itemIndex !== index),
    }));
    setSaved(false);
  };

  const validate = (): string => {
    const ids = new Set<string>();
    for (const item of config.appliances) {
      if (!item.id.trim()) return 'Every catalogue item needs an id.';
      if (ids.has(item.id)) return `Duplicate catalogue id: ${item.id}`;
      ids.add(item.id);
      if (!item.name.trim()) return 'Every catalogue item needs a name.';
      if (!(item.watts > 0)) return `${item.name}: wattage must be greater than zero.`;
      if (item.defaultHours < 0 || item.defaultHours > 24) return `${item.name}: default hours must be 0–24.`;
      if (item.surgeWatts !== null && item.surgeWatts < item.watts) {
        return `${item.name}: start-up surge cannot be below the running wattage.`;
      }
    }
    if (config.appliances.length === 0) return 'Keep at least one catalogue item.';
    const sizes = sizesText
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (sizes.length === 0) return 'Enter at least one inverter size in kVA.';
    const a = config.assumptions;
    if (a.inverterHeadroom < 1) return 'Inverter headroom must be at least 1.0.';
    if (a.powerFactor <= 0 || a.powerFactor > 1) return 'Power factor must be above 0 and at most 1.';
    if (a.inverterEfficiency <= 0 || a.inverterEfficiency > 1) return 'Inverter efficiency must be above 0 and at most 100%.';
    if (a.depthOfDischarge <= 0 || a.depthOfDischarge > 1) return 'Depth of discharge must be above 0 and at most 100%.';
    if (a.systemEfficiency <= 0 || a.systemEfficiency > 1) return 'PV system efficiency must be above 0 and at most 100%.';
    if (a.chargeEfficiency <= 0 || a.chargeEfficiency > 1) return 'Charge efficiency must be above 0 and at most 100%.';
    if (a.reserveMarginPct < 0 || a.reserveMarginPct > 100) return 'Reserve margin must be 0–100%.';
    if (a.monthlyDays < 1 || a.monthlyDays > 31) return 'Monthly days must be 1–31.';
    return '';
  };

  const handleSave = () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSaved(false);
      return;
    }
    const sizes = sizesText
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value) && value > 0)
      .sort((left, right) => left - right);
    const ok = setSolarAdvisorConfig({
      ...config,
      lastChange: changeNote.trim() || 'Catalogue or assumptions updated by an administrator.',
      assumptions: { ...config.assumptions, inverterSizesKva: sizes },
    });
    if (!ok) {
      setError('The configuration could not be saved. Browser storage may be full or blocked.');
      return;
    }
    const next = getSolarAdvisorConfig();
    setConfig(next);
    setSizesText(next.assumptions.inverterSizesKva.join(', '));
    setChangeNote('');
    setError('');
    setSaved(true);
  };

  const handleReset = () => {
    if (!window.confirm('Restore the default catalogue and engineering assumptions? Customer assessments are not affected.')) {
      return;
    }
    resetSolarAdvisorConfig();
    const next = defaultSolarAdvisorConfig();
    setConfig(next);
    setSizesText(next.assumptions.inverterSizesKva.join(', '));
    setChangeNote('');
    setError('');
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-[#0e1326]/80 border-white/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-400" /> Smart Solar Advisor
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
              Edit the appliance estimate catalogue and the engineering assumptions used by the public designer. Every
              save increments the version and records the change note.
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-wide text-slate-500">Version</div>
            <div className="text-lg font-bold text-white font-mono">v{config.version}</div>
            <div className="text-[10px] text-slate-500">
              {config.updatedAt === new Date(0).toISOString()
                ? 'Never saved'
                : new Date(config.updatedAt).toLocaleString('en-NG')}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
          <div className="text-[10px] font-mono uppercase tracking-wide text-slate-500">Last recorded change</div>
          <p className="text-xs text-slate-300 mt-0.5">{config.lastChange}</p>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Change note for this save</label>
          <input
            className={inputClass}
            value={changeNote}
            maxLength={240}
            placeholder="e.g. Updated refrigerator estimate after label check"
            onChange={(event) => {
              setChangeNote(event.target.value);
              setSaved(false);
            }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
        <div className="text-[11px] text-amber-100/80 leading-relaxed">
          <p className="font-bold text-amber-200">Catalogue wattages are estimates, not specifications.</p>
          <p className="mt-1">
            The designer tells visitors to check the appliance label and edit the figure. Do not enter a manufacturer
            rating you have not verified, and do not describe a package as including a battery or panel model the price
            register does not state.
          </p>
        </div>
      </div>

      <div className="card p-6 bg-[#0e1326]/80 border-white/5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Appliance catalogue</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {config.appliances.length} items · shown in the public appliance picker
            </p>
          </div>
          <button
            type="button"
            onClick={addTemplate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add item
          </button>
        </div>

        <div className="space-y-3">
          {config.appliances.map((item, index) => (
            <div key={`${item.id}-${index}`} className="rounded-xl border border-white/10 bg-slate-950/30 p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono text-slate-500 truncate">{item.id}</span>
                <button
                  type="button"
                  onClick={() => removeTemplate(index)}
                  className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="lg:col-span-2">
                  <label className={labelClass}>Name</label>
                  <input
                    className={inputClass}
                    value={item.name}
                    maxLength={80}
                    onChange={(event) => updateTemplate(index, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    className={inputClass}
                    value={item.category}
                    onChange={(event) =>
                      updateTemplate(index, { category: event.target.value as ApplianceCategory })
                    }
                  >
                    {categories.map((category) => (
                      <option key={category} value={category} className="bg-slate-900">
                        {APPLIANCE_CATEGORY_LABELS[category]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Duty</label>
                  <select
                    className={inputClass}
                    value={item.duty}
                    onChange={(event) => updateTemplate(index, { duty: event.target.value as Duty })}
                  >
                    {duties.map((duty) => (
                      <option key={duty} value={duty} className="bg-slate-900">
                        {duty}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Rated watts</label>
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={item.watts}
                    onChange={(event) => updateTemplate(index, { watts: Number(event.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Default hours</label>
                  <input
                    type="number"
                    min={0}
                    max={24}
                    step={0.25}
                    className={inputClass}
                    value={item.defaultHours}
                    onChange={(event) =>
                      updateTemplate(index, { defaultHours: Number(event.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Surge watts (blank = none)</label>
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={item.surgeWatts === null ? '' : item.surgeWatts}
                    placeholder="Not supplied"
                    onChange={(event) =>
                      updateTemplate(index, {
                        surgeWatts: event.target.value.trim() === '' ? null : Number(event.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Item id</label>
                  <input
                    className={`${inputClass} font-mono text-xs opacity-70`}
                    value={item.id}
                    readOnly
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-4">
                  <label className={labelClass}>Label / estimate note</label>
                  <input
                    className={inputClass}
                    value={item.note}
                    maxLength={240}
                    onChange={(event) => updateTemplate(index, { note: event.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 bg-[#0e1326]/80 border-white/5">
        <h3 className="text-lg font-bold text-white mb-1">Engineering assumptions</h3>
        <p className="text-[11px] text-slate-500 mb-4">
          These are planning assumptions, not manufacturer specifications. They are shown to the visitor in every
          assessment.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className={labelClass}>Inverter headroom (×)</label>
            <input
              type="number"
              min={1}
              step={0.05}
              className={inputClass}
              value={config.assumptions.inverterHeadroom}
              onChange={(event) =>
                updateAssumption({ inverterHeadroom: Number(event.target.value) || 1 })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Power factor</label>
            <input
              type="number"
              min={0.1}
              max={1}
              step={0.05}
              className={inputClass}
              value={config.assumptions.powerFactor}
              onChange={(event) =>
                updateAssumption({ powerFactor: Number(event.target.value) || 0 })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Inverter efficiency (%)</label>
            <input
              type="number"
              min={10}
              max={100}
              className={inputClass}
              value={percent(config.assumptions.inverterEfficiency)}
              onChange={(event) =>
                updateAssumption({ inverterEfficiency: (Number(event.target.value) || 0) / 100 })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Depth of discharge (%)</label>
            <input
              type="number"
              min={10}
              max={100}
              className={inputClass}
              value={percent(config.assumptions.depthOfDischarge)}
              onChange={(event) =>
                updateAssumption({ depthOfDischarge: (Number(event.target.value) || 0) / 100 })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Reserve margin (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              className={inputClass}
              value={config.assumptions.reserveMarginPct}
              onChange={(event) =>
                updateAssumption({ reserveMarginPct: Number(event.target.value) || 0 })
              }
            />
          </div>
          <div>
            <label className={labelClass}>PV system efficiency (%)</label>
            <input
              type="number"
              min={10}
              max={100}
              className={inputClass}
              value={percent(config.assumptions.systemEfficiency)}
              onChange={(event) =>
                updateAssumption({ systemEfficiency: (Number(event.target.value) || 0) / 100 })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Charge efficiency (%)</label>
            <input
              type="number"
              min={10}
              max={100}
              className={inputClass}
              value={percent(config.assumptions.chargeEfficiency)}
              onChange={(event) =>
                updateAssumption({ chargeEfficiency: (Number(event.target.value) || 0) / 100 })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Monthly days</label>
            <input
              type="number"
              min={1}
              max={31}
              className={inputClass}
              value={config.assumptions.monthlyDays}
              onChange={(event) =>
                updateAssumption({ monthlyDays: Number(event.target.value) || 30 })
              }
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className={labelClass}>Inverter sizes modelled (kVA, comma separated)</label>
            <input
              className={inputClass}
              value={sizesText}
              onChange={(event) => {
                setSizesText(event.target.value);
                setSaved(false);
              }}
            />
            <p className="text-[10px] text-slate-500 mt-1">
              The advisor picks the smallest listed size that covers the calculated kVA requirement.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6 bg-[#0e1326]/80 border-white/5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Database className="h-4 w-4 text-slate-400" /> Customer records
        </h3>
        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed max-w-3xl">
          Customer assessments and inverter readings are private. They stay in the customer’s browser unless the
          customer chooses <span className="text-slate-300">Back up</span>, which writes an optional copy to
          <span className="font-mono text-slate-300"> solar_customer_records</span>. That table has row-level security
          with no policies and no visitor privileges: every read and write goes through a token-checked function, and
          the device token is stored only as a SHA-256 hash. Nothing is written to the public
          <span className="font-mono text-slate-300"> site_data </span> key that stores this catalogue, and nothing is
          displayed here. Quotation and site-assessment enquiries arrive through the existing Messages tab.
        </p>
        <p className="text-[10px] text-slate-500 mt-2">
          Calculation warnings are defined in the sizing modules and are intentionally not editable here, so a safety
          message cannot be removed by accident. No database migration, production deployment or price change is
          performed by this screen.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Restore defaults
        </button>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> Saved
            </span>
          )}
          <button type="button" onClick={handleSave} className="btn-primary text-xs py-2.5 px-5">
            <Save className="h-3.5 w-3.5" /> Save catalogue & assumptions
          </button>
        </div>
      </div>
    </div>
  );
};

export default HaritechSolarAdvisorManager;
