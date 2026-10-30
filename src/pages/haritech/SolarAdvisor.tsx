import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  History,
  Info,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Sun,
  Trash2,
  Zap,
} from 'lucide-react';
import type {
  ApplianceEntry,
  ApplianceTemplate,
  AssessmentInput,
  CustomerDetails,
} from '../../utils/solar/types';
import { createDefaultInput, createEmptyEntry, entryFromTemplate } from '../../utils/solar/defaults';
import {
  QUICK_START_BUNDLES,
  buildBundleInput,
  type QuickStartBundleId,
} from '../../utils/solar/quickStart';
import { runAssessment } from '../../utils/solar/engine';
import { getSolarAdvisorConfig, SOLAR_ADVISOR_EVENT } from '../../utils/solarConfig';
import {
  clearDraft,
  deleteAssessment,
  listAssessments,
  loadDraft,
  saveAssessment,
  saveDraft,
  type SavedAssessment,
} from '../../utils/solar/storage';
import { buildAssessmentReportHtml, downloadJson, openReportWindow } from '../../utils/solar/report';
import { ApplianceCatalogue } from '../../components/solar/ApplianceCatalogue';
import { ApplianceTable } from '../../components/solar/ApplianceTable';
import { PropertyStep, SystemStep } from '../../components/solar/AssessmentForm';
import { ResultsPanel } from '../../components/solar/ResultsPanel';
import { QuoteModal } from '../../components/solar/QuoteModal';
import { Metric, StepCard } from '../../components/solar/SolarField';

import { CloudHistoryPanel } from '../../components/solar/CloudHistoryPanel';
import {
  backupAssessments,
  deleteCloudAssessments,
  restoreAssessments,
} from '../../utils/solar/historySync';
import { isCloudHistoryEnabled } from '../../utils/solar/cloudHistory';

type Step = 1 | 2 | 3 | 4;

const steps: { id: Step; label: string; short: string; icon: typeof ClipboardList }[] = [
  { id: 1, label: 'Property & requirements', short: 'Property', icon: ClipboardList },
  { id: 2, label: 'Appliances & energy', short: 'Appliances', icon: Zap },
  { id: 3, label: 'System details', short: 'System', icon: SlidersHorizontal },
  { id: 4, label: 'Results & report', short: 'Results', icon: BarChart3 },
];

const makeUid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `app-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const num = (value: number, digits = 1): string =>
  value.toLocaleString('en-NG', { maximumFractionDigits: digits });

const naira = (value: number): string =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value);

const emptyCustomer: CustomerDetails = { name: '', location: '', contact: '' };

const SolarAdvisor: React.FC = () => {
  const [config, setConfig] = useState(() => getSolarAdvisorConfig());
  const [input, setInput] = useState<AssessmentInput>(() => loadDraft() ?? createDefaultInput());
  const [customer, setCustomer] = useState<CustomerDetails>(emptyCustomer);
  const [step, setStep] = useState<Step>(1);
  const [saved, setSaved] = useState<SavedAssessment[]>(() => listAssessments());
  const [toast, setToast] = useState('');
  const [modalMode, setModalMode] = useState<'quote' | 'assessment' | null>(null);
  const cloudEnabled = isCloudHistoryEnabled();

  useEffect(() => {
    const handler = () => setConfig(getSolarAdvisorConfig());
    window.addEventListener(SOLAR_ADVISOR_EVENT, handler);
    return () => window.removeEventListener(SOLAR_ADVISOR_EVENT, handler);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveDraft(input);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const result = useMemo(
    () => runAssessment(input, config.assumptions),
    [input, config.assumptions],
  );

  const patchInput = useCallback((patch: Partial<AssessmentInput>) => {
    setInput((previous) => ({ ...previous, ...patch }));
  }, []);

  const patchCustomer = useCallback((patch: Partial<CustomerDetails>) => {
    setCustomer((previous) => ({ ...previous, ...patch }));
  }, []);

  const addTemplate = useCallback((template: ApplianceTemplate) => {
    setInput((previous) => ({
      ...previous,
      appliances: [...previous.appliances, entryFromTemplate(template)],
    }));
    setToast(`${template.name} added. Check its wattage against the label.`);
  }, []);

  const addManual = useCallback(() => {
    setInput((previous) => ({
      ...previous,
      appliances: [...previous.appliances, createEmptyEntry()],
    }));
  }, []);

  const updateEntry = useCallback((uid: string, patch: Partial<ApplianceEntry>) => {
    setInput((previous) => ({
      ...previous,
      appliances: previous.appliances.map((entry) =>
        entry.uid === uid ? { ...entry, ...patch } : entry,
      ),
    }));
  }, []);

  const removeEntry = useCallback((uid: string) => {
    setInput((previous) => ({
      ...previous,
      appliances: previous.appliances.filter((entry) => entry.uid !== uid),
    }));
  }, []);

  const duplicateEntry = useCallback((uid: string) => {
    setInput((previous) => {
      const found = previous.appliances.find((entry) => entry.uid === uid);
      if (!found) return previous;
      const copy: ApplianceEntry = {
        ...found,
        uid: makeUid(),
        name: `${found.name} (copy)`,
      };
      return { ...previous, appliances: [...previous.appliances, copy] };
    });
  }, []);

  /** One-tap starter list from step 1. Replaces the current appliance list,
      confirmed first when something is already on it, and jumps to step 2
      where every item can still be edited. */
  const applyBundle = useCallback(
    (bundleId: QuickStartBundleId) => {
      const bundle = QUICK_START_BUNDLES.find((row) => row.id === bundleId);
      if (!bundle) return;
      if (input.appliances.length > 0) {
        const answer = window.confirm(
          `Replace the ${input.appliances.length} item${input.appliances.length === 1 ? '' : 's'} currently listed with the “${bundle.title}” starter list?`,
        );
        if (!answer) return;
      }
      setInput((previous) => ({ ...previous, ...buildBundleInput(bundle) }));
      setStep(2);
      setToast(`“${bundle.title}” starter list loaded — check each appliance against its label, then continue.`);
    },
    [input.appliances.length],
  );

  const resetTechnical = useCallback(() => {    patchInput({
      reserveMarginPct: config.assumptions.reserveMarginPct,
      powerFactor: config.assumptions.powerFactor,
      systemEfficiency: config.assumptions.systemEfficiency,
      inverterEfficiency: config.assumptions.inverterEfficiency,
      depthOfDischarge: config.assumptions.depthOfDischarge,
    });
    setToast('Engineering assumptions restored to the Haritech defaults.');
  }, [config.assumptions, patchInput]);

  const startOver = useCallback(() => {
    if (!window.confirm('Clear this assessment and start again? Saved assessments in this browser are not deleted.')) {
      return;
    }
    setInput(createDefaultInput());
    setCustomer(emptyCustomer);
    setStep(1);
    clearDraft();
    setToast('New assessment started.');
  }, []);

  const handleSave = useCallback(() => {
    const label = customer.name.trim() || customer.location.trim() || 'Solar assessment';
    const row = saveAssessment(input, `${label} — ${new Date().toLocaleDateString('en-NG')}`);
    if (row) {
      setSaved(listAssessments());
      setToast('Assessment saved in this browser.');
    } else {
      setToast('The assessment could not be saved. Browser storage may be full or blocked.');
    }
  }, [customer, input]);

  const loadSaved = useCallback((row: SavedAssessment) => {
    setInput(row.input);
    setStep(4);
    setToast(`Loaded “${row.label}”.`);
  }, []);

  const removeSaved = useCallback((id: string) => {
    deleteAssessment(id);
    setSaved(listAssessments());
    setToast('Saved assessment deleted from this browser.');
  }, []);

  const handlePrint = useCallback(() => {
    const html = buildAssessmentReportHtml(input, result, {
      ...customer,
      generatedAt: new Date().toLocaleString('en-NG'),
    });
    if (!openReportWindow(html)) {
      setToast('The report window was blocked. Allow pop-ups for this site and try again.');
    }
  }, [customer, input, result]);

  const handleDownload = useCallback(() => {
    downloadJson(`haritech-solar-assessment-${Date.now()}.json`, {
      customer,
      generatedAt: new Date().toISOString(),
      input,
      result,
    });
    setToast('Assessment JSON downloaded.');
  }, [customer, input, result]);

  const summary = useMemo(() => {
    const lines = [
      `Customer: ${customer.name.trim() || 'Not supplied'}`,
      `Location: ${customer.location.trim() || 'Not supplied'}`,
      `Contact: ${customer.contact.trim() || 'Not supplied'}`,
      `Building: ${input.buildingType} · use: ${input.intendedUse} · phase: ${input.phase}`,
      `Daily energy: ${num(result.energy.totalDailyKwh, 2)} kWh`,
      `Simultaneous load: ${num(result.energy.simultaneousKw, 2)} kW`,
      `Recommended inverter: ${result.inverter.recommendedKva === null ? 'custom design' : `${num(result.inverter.recommendedKva, 1)} kVA`}`,
      `Battery: ${result.battery.requiredNominalKwh > 0 ? `${num(result.battery.requiredNominalKwh, 2)} kWh nominal` : 'not selected'}`,
      `Solar array: ${result.pv.pvKwp === null ? 'peak sun hours not supplied' : `${num(result.pv.pvKwp, 2)} kWp`}`,
      `Published package: ${result.package.label}${result.package.priceNgn === null ? '' : ` (${naira(result.package.priceNgn)})`}`,
      `Warnings raised: ${result.warnings.length}`,
    ];
    return lines.join('\n');
  }, [customer, input, result]);

  const goNext = () => setStep((previous) => (previous < 4 ? ((previous + 1) as Step) : previous));
  const goBack = () => setStep((previous) => (previous > 1 ? ((previous - 1) as Step) : previous));

  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-orange-500/10 blur-[150px] pointer-events-none" />

      <section className="pt-4 pb-14 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 mb-4">
              <Link to="/haritech/solar-energy" className="hover:text-amber-300 transition-colors">
                Solar Energy
              </Link>
              <span>/</span>
              <span className="text-slate-300">Smart Solar Advisor</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-200 text-[11px] font-mono font-medium mb-4">
              <Sun className="h-3.5 w-3.5" /> Solar System Designer
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-syne">
              Design a system around <span className="text-amber-300">what you actually run</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-3 max-w-2xl leading-relaxed">
              List your appliances, mark what must stay on during an outage, and see the energy, inverter, battery and
              panel requirements that follow. Every figure is an estimate with its assumptions shown — never a guaranteed
              daily consumption or a final equipment specification.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 text-[10px] font-mono">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-400">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Saved in this browser only
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-400">
                <Info className="h-3 w-3 text-cyan-300" /> No live inverter connection
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-400">
                <AlertTriangle className="h-3 w-3 text-amber-300" /> Preliminary, not a quotation
              </span>
            </div>
          </div>

          {/* Step navigation */}
          <nav aria-label="Assessment steps" className="mt-7 grid grid-cols-2 lg:grid-cols-4 gap-2">
            {steps.map((item) => {
              const active = step === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStep(item.id)}
                  aria-current={active ? 'step' : undefined}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                    active
                      ? 'border-amber-400/50 bg-amber-400/10 text-white'
                      : 'border-white/10 bg-[#0b101c]/70 text-slate-400 hover:border-white/20 hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                      active ? 'bg-amber-400 text-slate-950' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {item.id}
                  </span>
                  <span className="min-w-0">
                    <span className="hidden sm:block text-[10px] font-mono uppercase tracking-wide text-slate-500">
                      Step {item.id}
                    </span>
                    <span className="block text-xs font-semibold truncate">
                      <Icon className="inline h-3.5 w-3.5 mr-1 -mt-0.5 sm:hidden" />
                      {item.short}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-5 mt-5 items-start">
            <div className="min-w-0">
              {step === 1 && (
                <PropertyStep
                  input={input}
                  customer={customer}
                  onChange={patchInput}
                  onCustomerChange={patchCustomer}
                  onApplyBundle={applyBundle}
                />
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <StepCard
                    title="Appliance catalogue"
                    description="Search the estimate catalogue and add what you run. Catalogue wattages are planning estimates — edit every figure against the appliance label."
                  >
                    <ApplianceCatalogue templates={config.appliances} onAdd={addTemplate} />
                  </StepCard>

                  <StepCard
                    title={`Your appliance list (${input.appliances.length})`}
                    description="Set the quantity, daily hours, start-up surge and which appliances run together or need backup power."
                  >
                    <ApplianceTable
                      entries={input.appliances}
                      globalBackupHours={input.backupHours}
                      onChange={updateEntry}
                      onRemove={removeEntry}
                      onDuplicate={duplicateEntry}
                      onAddManual={addManual}
                    />
                  </StepCard>
                </div>
              )}

              {step === 3 && (
                <SystemStep
                  input={input}
                  onChange={patchInput}
                  onResetTechnical={resetTechnical}
                />
              )}

              {step === 4 && (
                <ResultsPanel
                  result={result}
                  customer={customer}
                  onPrint={handlePrint}
                  onDownload={handleDownload}
                  onSave={handleSave}
                  onQuote={() => setModalMode('quote')}
                  onSiteAssessment={() => setModalMode('assessment')}
                />
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mt-4">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 1}
                  className="btn-secondary text-xs py-2.5 px-4 disabled:opacity-40"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={startOver}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Start over
                  </button>
                  {step < 4 ? (
                    <button type="button" onClick={goNext} className="btn-primary text-xs py-2.5 px-5">
                      Continue <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button type="button" onClick={handleSave} className="btn-primary text-xs py-2.5 px-5">
                      <Save className="h-3.5 w-3.5" /> Save assessment
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Live summary */}
            <aside className="lg:sticky lg:top-28 space-y-4">
              <section className="card p-4 bg-[#0b101c]/95 border-white/10">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-300">Live summary</h2>
                  <span className="text-[10px] font-mono text-slate-500">Step {step} of 4</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Metric label="Daily" value={`${num(result.energy.totalDailyKwh, 2)} kWh`} />
                  <Metric label="Peak load" value={`${num(result.energy.simultaneousKw, 2)} kW`} />
                  <Metric
                    label="Inverter"
                    value={result.inverter.recommendedKva === null ? '—' : `${num(result.inverter.recommendedKva, 1)} kVA`}
                    tone={result.inverter.recommendedKva === null ? 'warn' : 'good'}
                  />
                  <Metric
                    label="Battery"
                    value={result.battery.requiredNominalKwh > 0 ? `${num(result.battery.requiredNominalKwh, 1)} kWh` : '—'}
                  />
                  <Metric
                    label="Solar"
                    value={result.pv.pvKwp === null ? 'Needs sun hours' : `${num(result.pv.pvKwp, 2)} kWp`}
                    tone={result.pv.pvKwp === null ? 'warn' : 'good'}
                  />
                  <Metric
                    label="Warnings"
                    value={String(result.warnings.length)}
                    tone={result.warnings.length > 0 ? 'warn' : 'good'}
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-3">
                  Draft saves automatically in this browser. Values update as you edit.
                </p>
                {step !== 4 && (
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="w-full mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[11px] font-bold text-amber-200 hover:bg-amber-400/20 transition-colors"
                  >
                    <BarChart3 className="h-3.5 w-3.5" /> View results
                  </button>
                )}
              </section>

              <section className="card p-4 bg-[#0b101c]/95 border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <History className="h-4 w-4 text-cyan-300" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-300">Saved assessments</h2>
                </div>
                {saved.length === 0 ? (
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    No saved assessments yet. Use <span className="text-slate-300">Save</span> on the results step to keep
                    one in this browser.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {saved.map((row) => (
                      <li key={row.id} className="rounded-lg border border-white/10 bg-slate-950/40 px-2.5 py-2">
                        <p className="text-[11px] font-semibold text-slate-200 truncate">{row.label}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {new Date(row.savedAt).toLocaleString('en-NG')}
                        </p>
                        <div className="flex gap-1.5 mt-1.5">
                          <button
                            type="button"
                            onClick={() => loadSaved(row)}
                            className="flex-1 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2 py-1 text-[10px] font-bold text-cyan-200 hover:bg-cyan-400/20 transition-colors"
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSaved(row.id)}
                            className="rounded-md border border-red-500/20 px-2 py-1 text-red-300 hover:bg-red-500/10 transition-colors"
                            aria-label={`Delete ${row.label}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-[10px] text-slate-600 leading-relaxed mt-2">
                  History stays in this browser. It is not written to the public site data and is not visible to
                  other visitors.
                </p>
                {cloudEnabled && (
                  <div className="mt-2">
                    <CloudHistoryPanel
                      noun="assessment"
                      compact
                      onBackup={backupAssessments}
                      onRestore={restoreAssessments}
                      onDeleteCloud={deleteCloudAssessments}
                      onChanged={() => setSaved(listAssessments())}
                      onMessage={setToast}
                    />
                  </div>
                )}
              </section>

              <section className="card p-4 bg-[#0b101c]/95 border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-slate-400" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-300">What this tool does not do</h2>
                </div>
                <ul className="space-y-1.5 text-[10px] text-slate-500 leading-relaxed">
                  <li>It does not invent inverter, battery or panel specifications.</li>
                  <li>It does not diagnose a fault from one reading.</li>
                  <li>It does not claim a package includes a battery or panel model.</li>
                  <li>It does not replace a site assessment or a written quotation.</li>
                </ul>
                <Link
                  to="/haritech/solar-advisor/monitor"
                  className="mt-3 block rounded-lg border border-cyan-400/25 bg-cyan-400/5 px-2.5 py-2 hover:bg-cyan-400/10 transition-colors"
                >
                  <p className="text-[10px] font-mono uppercase tracking-wide text-cyan-300">Now available</p>
                  <p className="text-[11px] font-semibold text-slate-200 mt-0.5">Solar Power Monitor</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                    Manual inverter readings, runtime estimates and private history. Live data stays off until the
                    inverter model, protocol and credentials are confirmed.
                  </p>
                </Link>
              </section>
            </aside>
          </div>
        </div>
      </section>

      <QuoteModal
        open={modalMode !== null}
        mode={modalMode ?? 'quote'}
        customer={customer}
        summary={summary}
        onClose={() => setModalMode(null)}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] max-w-[92vw] rounded-xl border border-amber-400/30 bg-[#141004] px-4 py-2.5 text-xs text-amber-100 shadow-2xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
};

export default SolarAdvisor;
