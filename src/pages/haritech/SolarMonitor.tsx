import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  BatteryCharging,
  CheckCircle2,
  Gauge,
  History,
  Info,
  Radio,
  Sun,
  Trash2,
  Zap,
} from 'lucide-react';
import type {
  MonitorOwner,
  MonitorReading,
  MonitorSystem,
  SolarAssumptions,
} from '../../utils/solar/types';
import { evaluateReading, noteContainsSecret, voltageStatusLabel } from '../../utils/solar/monitor';
import {
  clearMonitorDraft,
  clearReadings,
  deleteReading,
  listReadings,
  loadMonitorDraft,
  loadMonitorOwner,
  loadMonitorSystem,
  saveMonitorDraft,
  saveMonitorOwner,
  saveMonitorSystem,
  saveReading,
  type SavedReading,
} from '../../utils/solar/monitorStorage';
import { listAssessments } from '../../utils/solar/storage';
import { runAssessment } from '../../utils/solar/engine';
import { getSolarAdvisorConfig, SOLAR_ADVISOR_EVENT } from '../../utils/solarConfig';
import {
  buildMonitorReportHtml,
  downloadJson,
  openReportWindow,
} from '../../utils/solar/report';
import { MonitorReadingPanel, MonitorSystemPanel } from '../../components/solar/MonitorForm';
import { MonitorResults } from '../../components/solar/MonitorResults';
import { StepCard, TextField } from '../../components/solar/SolarField';

import { CloudHistoryPanel } from '../../components/solar/CloudHistoryPanel';
import {
  backupReadings,
  deleteCloudReadings,
  restoreReadings,
} from '../../utils/solar/historySync';
import { isCloudHistoryEnabled } from '../../utils/solar/cloudHistory';

const makeSystem = (assumptions: SolarAssumptions): MonitorSystem => ({
  bankKwh: null,
  bankVoltage: null,
  depthOfDischargePct: Math.round(assumptions.depthOfDischarge * 100),
  inverterEfficiencyPct: Math.round(assumptions.inverterEfficiency * 100),
  lowCutoffV: null,
  fullChargeV: null,
  maxTemperatureC: null,
});

const makeReading = (): MonitorReading => ({
  takenAt: new Date().toISOString(),
  batteryVoltage: null,
  batteryCurrentA: null,
  acLoadKw: null,
  pvInputKw: null,
  socPct: null,
  temperatureC: null,
  runtimeLoadKw: null,
  note: '',
});

const statusChip: Record<string, string> = {
  low: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
  within: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  full: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
  unknown: 'border-white/10 bg-white/5 text-slate-400',
};

const num = (value: number, digits = 2): string =>
  value.toLocaleString('en-NG', { maximumFractionDigits: digits });

const SolarMonitor: React.FC = () => {
  const [config, setConfig] = useState(() => getSolarAdvisorConfig());
  const [system, setSystem] = useState<MonitorSystem>(
    () => loadMonitorSystem() ?? makeSystem(getSolarAdvisorConfig().assumptions),
  );
  const [owner, setOwner] = useState<MonitorOwner>(() => loadMonitorOwner());
  const [reading, setReading] = useState<MonitorReading>(() => loadMonitorDraft() ?? makeReading());
  const [history, setHistory] = useState<SavedReading[]>(() => listReadings());
  const [assessmentRows] = useState(() => listAssessments());
  const [toast, setToast] = useState('');
  const cloudEnabled = isCloudHistoryEnabled();

  useEffect(() => {
    const handler = () => setConfig(getSolarAdvisorConfig());
    window.addEventListener(SOLAR_ADVISOR_EVENT, handler);
    return () => window.removeEventListener(SOLAR_ADVISOR_EVENT, handler);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => saveMonitorDraft(reading), 350);
    return () => window.clearTimeout(timer);
  }, [reading]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveMonitorSystem(system);
      saveMonitorOwner(owner);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [system, owner]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const previous = useMemo(() => {
    const current = Date.parse(reading.takenAt);
    if (!Number.isFinite(current)) return null;
    const row = history.find((item) => {
      const taken = Date.parse(item.reading.takenAt);
      return Number.isFinite(taken) && taken < current;
    });
    return row ? row.reading : null;
  }, [history, reading.takenAt]);

  const result = useMemo(
    () => evaluateReading(system, reading, previous),
    [system, reading, previous],
  );

  const patchSystem = useCallback((patch: Partial<MonitorSystem>) => {
    setSystem((value) => ({ ...value, ...patch }));
  }, []);

  const patchOwner = useCallback((patch: Partial<MonitorOwner>) => {
    setOwner((value) => ({ ...value, ...patch }));
  }, []);

  const patchReading = useCallback((patch: Partial<MonitorReading>) => {
    setReading((value) => ({ ...value, ...patch }));
  }, []);

  const canSave =
    reading.batteryVoltage !== null ||
    reading.batteryCurrentA !== null ||
    reading.acLoadKw !== null ||
    reading.pvInputKw !== null;

  const noteWarning = noteContainsSecret(reading.note);

  const importAssessment = useCallback(
    (id: string) => {
      const row = assessmentRows.find((item) => item.id === id);
      if (!row) return;
      const computed = runAssessment(row.input, config.assumptions);
      const installed =
        row.input.ownsBattery &&
        row.input.existingBatteryKwh !== null &&
        row.input.existingBatteryKwh > 0
          ? row.input.existingBatteryKwh
          : computed.battery.requiredNominalKwh > 0
            ? computed.battery.requiredNominalKwh
            : null;
      const voltage =
        row.input.batteryVoltage ?? row.input.existingInverterBatteryVoltage ?? null;
      setSystem((value) => ({
        ...value,
        bankKwh: installed === null ? value.bankKwh : Math.round(installed * 100) / 100,
        bankVoltage: voltage === null ? value.bankVoltage : voltage,
        depthOfDischargePct: Math.round(config.assumptions.depthOfDischarge * 100),
        inverterEfficiencyPct: Math.round(config.assumptions.inverterEfficiency * 100),
      }));
      setToast(
        installed === null
          ? 'That assessment has no battery capacity to copy. Enter the installed capacity from the label.'
          : 'Battery details copied from the saved assessment. Check them against the installed equipment.',
      );
    },
    [assessmentRows, config.assumptions],
  );

  const handleSave = useCallback(() => {
    if (!canSave) {
      setToast('Enter at least one measurement before saving.');
      return;
    }
    if (noteWarning) {
      setToast('Remove the password, API key or token from the note before saving.');
      return;
    }
    saveMonitorSystem(system);
    saveMonitorOwner(owner);
    const row = saveReading(system, reading);
    if (!row) {
      setToast('The reading could not be saved. Browser storage may be full or blocked.');
      return;
    }
    setHistory(listReadings());
    setToast('Reading saved in this browser. Compare it with the next one you take.');
  }, [canSave, noteWarning, owner, reading, system]);

  const handleLoad = useCallback((row: SavedReading) => {
    setSystem(row.system);
    setReading(row.reading);
    setToast(`Loaded the reading from ${new Date(row.reading.takenAt).toLocaleString('en-NG')}.`);
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteReading(id);
    setHistory(listReadings());
    setToast('Saved reading deleted from this browser.');
  }, []);

  const handleClear = useCallback(() => {
    setReading(makeReading());
    clearMonitorDraft();
    setToast('Reading form cleared. Saved readings are not deleted.');
  }, []);

  const handleClearHistory = useCallback(() => {
    if (!window.confirm('Delete every saved reading in this browser? This cannot be undone.')) return;
    clearReadings();
    setHistory([]);
    setToast('All saved readings were deleted from this browser.');
  }, []);

  const handlePrint = useCallback(() => {
    if (noteWarning) {
      setToast('Remove the password, API key or token from the note before printing.');
      return;
    }
    const html = buildMonitorReportHtml(system, reading, result, history, {
      ...owner,
      generatedAt: new Date().toLocaleString('en-NG'),
    });
    if (!openReportWindow(html)) {
      setToast('The report window was blocked. Allow pop-ups for this site and try again.');
    }
  }, [history, noteWarning, owner, reading, result, system]);

  const handleExport = useCallback(() => {
    if (noteWarning) {
      setToast('Remove the password, API key or token from the note before exporting.');
      return;
    }
    downloadJson(`haritech-solar-monitor-${Date.now()}.json`, {
      owner,
      generatedAt: new Date().toISOString(),
      system,
      reading,
      result,
      history,
    });
    setToast('Monitor data exported as JSON.');
  }, [history, noteWarning, owner, reading, result, system]);

  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />

      <section className="pt-4 pb-14 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 mb-4">
              <Link to="/haritech/solar-energy" className="hover:text-cyan-300 transition-colors">
                Solar Energy
              </Link>
              <span>/</span>
              <Link to="/haritech/solar-advisor" className="hover:text-cyan-300 transition-colors">
                Smart Solar Advisor
              </Link>
              <span>/</span>
              <span className="text-slate-300">Power Monitor</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/25 text-cyan-200 text-[11px] font-mono font-medium mb-4">
              <Radio className="h-3.5 w-3.5" /> Solar Power Monitor
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-syne">
              Read your system without <span className="text-cyan-300">guessing</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-3 max-w-2xl leading-relaxed">
              Type in what the inverter display shows. The monitor explains the numbers, estimates runtime and charge
              time only when the inputs allow it, and compares readings you save over time. It never invents a reading
              and never diagnoses a fault from one sample.
            </p>

            <div className="flex flex-wrap gap-2 mt-4 text-[10px] font-mono">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-400">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Saved in this browser only
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-400">
                <AlertTriangle className="h-3 w-3 text-amber-300" /> Manual readings, not live data
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-400">
                <Info className="h-3 w-3 text-cyan-300" /> Not a diagnosis
              </span>
            </div>

            <div className="flex gap-2 mt-5">
              <Link
                to="/haritech/solar-advisor"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0b101c]/70 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:border-white/20 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Designer
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/50 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-white">
                <Gauge className="h-3.5 w-3.5" /> Monitor
              </span>
            </div>
          </div>

          <div className="mt-5 card p-4 bg-[#0b101c]/90 border-amber-400/20 flex items-start gap-3">
            <Radio className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white">Live data is not connected</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-3xl">
                This page works only from readings you type in. No inverter is linked here: the model, protocol or API,
                credentials and written authorisation must be confirmed first, and any live link must run through a
                secure server-side connection. Do not type an inverter password, API key or token into this page — it
                does not ask for one and does not store one.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] gap-5 mt-5 items-start">
            <div className="space-y-4 min-w-0">
              <StepCard
                title="Report details"
                description="Optional. Used only on the printable reading record you generate."
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  <TextField
                    label="Full name"
                    value={owner.name}
                    onChange={(value) => patchOwner({ name: value })}
                    placeholder="e.g. Ada Okafor"
                    maxLength={120}
                  />
                  <TextField
                    label="Location"
                    value={owner.location}
                    onChange={(value) => patchOwner({ location: value })}
                    placeholder="City / area"
                    maxLength={120}
                  />
                  <div className="sm:col-span-2">
                    <TextField
                      label="Phone or email"
                      value={owner.contact}
                      onChange={(value) => patchOwner({ contact: value })}
                      placeholder="How Haritech should reach you"
                      maxLength={160}
                    />
                  </div>
                </div>
              </StepCard>

              <MonitorSystemPanel
                system={system}
                onChange={patchSystem}
                assessmentOptions={assessmentRows.map((row) => ({ id: row.id, label: row.label }))}
                onImportAssessment={importAssessment}
              />

              <MonitorReadingPanel
                reading={reading}
                onChange={patchReading}
                onUseNow={() => patchReading({ takenAt: new Date().toISOString() })}
                noteWarning={noteWarning}
              />
            </div>

            <div className="min-w-0">
              <MonitorResults
                system={system}
                reading={reading}
                result={result}
                comparedWith={previous ? previous.takenAt : null}
                canSave={canSave}
                onSave={handleSave}
                onPrint={handlePrint}
                onExport={handleExport}
                onClear={handleClear}
              />
            </div>
          </div>

          <section className="card p-5 sm:p-6 bg-[#0b101c]/90 border-white/10 mt-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-cyan-300" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Saved readings ({history.length})
                </h2>
              </div>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-2.5 py-1.5 text-[11px] font-bold text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Delete all
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl">
                No saved readings yet. Take a reading, then use{' '}
                <span className="text-slate-300">Save reading</span> to keep it. Save a second reading later to see how
                the battery voltage, state of charge and load moved.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {history.map((row) => {
                  const rowResult = evaluateReading(row.system, row.reading);
                  return (
                    <li
                      key={row.id}
                      className="rounded-xl border border-white/10 bg-slate-950/40 p-3 flex flex-col sm:flex-row sm:items-center gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">
                            {new Date(row.reading.takenAt).toLocaleString('en-NG')}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                              statusChip[rowResult.voltageStatus] ?? statusChip.unknown
                            }`}
                          >
                            {voltageStatusLabel(rowResult.voltageStatus)}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-500">
                          <span>V: {row.reading.batteryVoltage === null ? '—' : `${num(row.reading.batteryVoltage, 1)} V`}</span>
                          <span>A: {row.reading.batteryCurrentA === null ? '—' : `${num(row.reading.batteryCurrentA, 1)} A`}</span>
                          <span>SOC: {row.reading.socPct === null ? '—' : `${num(row.reading.socPct, 0)}%`}</span>
                          <span>Load: {row.reading.acLoadKw === null ? '—' : `${num(row.reading.acLoadKw)} kW`}</span>
                          <span>PV: {row.reading.pvInputKw === null ? '—' : `${num(row.reading.pvInputKw)} kW`}</span>
                        </div>
                        {row.reading.note.trim() && (
                          <p className="text-[11px] text-slate-500 mt-1 truncate">{row.reading.note.trim()}</p>
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLoad(row)}
                          className="rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1.5 text-[10px] font-bold text-cyan-200 hover:bg-cyan-400/20 transition-colors"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="rounded-md border border-red-500/20 px-2 py-1.5 text-red-300 hover:bg-red-500/10 transition-colors"
                          aria-label={`Delete reading from ${new Date(row.reading.takenAt).toLocaleString('en-NG')}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <p className="text-[10px] text-slate-600 leading-relaxed mt-3 flex items-start gap-1.5">
              <BatteryCharging className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              History stays in this browser. It is not written to the public site data and is not shown in the admin
              catalogue editor. No inverter credentials are stored.
            </p>
            {cloudEnabled && (
              <div className="mt-2">
                <CloudHistoryPanel
                  noun="reading"
                  onBackup={backupReadings}
                  onRestore={restoreReadings}
                  onDeleteCloud={deleteCloudReadings}
                  onChanged={() => setHistory(listReadings())}
                  onMessage={setToast}
                />
              </div>
            )}
          </section>

          <section className="card p-5 bg-[#0b101c]/90 border-white/10 mt-5">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="h-4 w-4 text-amber-300" />
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
                Connecting the two modules
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-3xl">
              The Designer works out the battery capacity a system needs. The Monitor reads what the installed system is
              actually doing. Use <span className="text-slate-200">Import battery details from a saved assessment</span>{' '}
              to carry the capacity and voltage across, then check them against the equipment labels. The two tools
              share the same engineering assumptions, but neither one replaces a site assessment.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link to="/haritech/solar-advisor" className="btn-secondary text-xs py-2.5 px-4">
                <Zap className="h-3.5 w-3.5" /> Open the Designer
              </Link>
              <Link
                to="/haritech/request-quote?service=Solar%20Energy%20Installation"
                className="btn-primary text-xs py-2.5 px-4"
              >
                <Sun className="h-3.5 w-3.5" /> Request a check
              </Link>
            </div>
          </section>
        </div>
      </section>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] max-w-[92vw] rounded-xl border border-cyan-400/30 bg-[#04141a] px-4 py-2.5 text-xs text-cyan-100 shadow-2xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
};

export default SolarMonitor;
