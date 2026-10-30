import React from 'react';
import {
  AlertTriangle,
  BatteryCharging,
  CheckCircle2,
  Download,
  FileText,
  Info,
  Printer,
  Save,
  Send,
  Sun,
  Zap,
} from 'lucide-react';
import type { AdvisorResult, CustomerDetails } from '../../utils/solar/types';
import { Metric } from './SolarField';

interface ResultsPanelProps {
  result: AdvisorResult;
  customer: CustomerDetails;
  onPrint: () => void;
  onDownload: () => void;
  onSave: () => void;
  onQuote: () => void;
  onSiteAssessment: () => void;
}

const naira = (value: number): string =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value);

const num = (value: number, digits = 1): string =>
  value.toLocaleString('en-NG', { maximumFractionDigits: digits });

const basisLabel: Record<AdvisorResult['energy']['simultaneousBasis'], string> = {
  declared: 'Appliances marked as running together',
  schedule: 'Overlapping operating schedules',
  continuous: 'Continuous appliances only',
  none: 'Not enough information',
};

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
  customer,
  onPrint,
  onDownload,
  onSave,
  onQuote,
  onSiteAssessment,
}) => {
  const { energy, inverter, battery, pv, package: pkg } = result;
  const noLoad = energy.totalDailyKwh <= 0;
  const customerLabel = customer.name.trim() || 'Unnamed assessment';

  return (
    <div className="space-y-4">
      <section className="card p-5 sm:p-6 bg-[#0b101c]/90 border-white/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-amber-300">
              Preliminary assessment
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              {customerLabel}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {[customer.location.trim(), customer.contact.trim()].filter(Boolean).join(' · ') ||
                'No location or contact supplied'}
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
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> JSON
            </button>
            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 transition-colors"
            >
              <Save className="h-3.5 w-3.5" /> Save
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-5">
          <Metric
            label="Daily energy"
            value={`${num(energy.totalDailyKwh, 2)} kWh`}
            detail={`${num(energy.weeklyKwh, 1)} kWh/week · ${num(energy.monthlyKwh, 1)} kWh/month`}
          />
          <Metric
            label="Simultaneous load"
            value={`${num(energy.simultaneousKw, 2)} kW`}
            detail={basisLabel[energy.simultaneousBasis]}
            tone={energy.simultaneousBasis === 'none' ? 'warn' : 'default'}
          />
          <Metric
            label="Starting surge"
            value={energy.surgeDemandKw === null ? 'Not supplied' : `${num(energy.surgeDemandKw, 2)} kW`}
            detail={energy.surgeDemandKw === null ? 'Enter motor start-up figures' : 'Largest motor added to running load'}
            tone={energy.surgeDemandKw === null ? 'warn' : 'default'}
          />
          <Metric
            label="Backup energy"
            value={`${num(energy.backupAcKwh, 2)} kWh`}
            detail="AC energy selected for outage use"
          />
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="card p-5 bg-[#0b101c]/90 border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-amber-300" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Inverter</h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Metric label="Continuous requirement" value={`${num(inverter.requiredContinuousKw, 2)} kW`} />
            <Metric label="Apparent power" value={`${num(inverter.requiredKva, 2)} kVA`} detail="kW ÷ power factor" />
            <Metric
              label="Recommended nominal size"
              value={inverter.recommendedKva === null ? 'Custom design' : `${num(inverter.recommendedKva, 1)} kVA`}
              detail={inverter.recommendedContinuousKw === null ? 'Above modelled sizes' : `≈ ${num(inverter.recommendedContinuousKw, 1)} kW continuous`}
              tone={inverter.recommendedKva === null ? 'warn' : 'good'}
            />
            <Metric
              label="Surge to confirm"
              value={inverter.surgeRequiredKw === null ? 'Not supplied' : `${num(inverter.surgeRequiredKw, 2)} kW`}
              detail="Check the model datasheet"
              tone={inverter.surgeRequiredKw === null ? 'warn' : 'default'}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
            kW and kVA are different quantities. The kVA figure uses the power factor shown in the assumptions.
          </p>
        </section>

        <section className="card p-5 bg-[#0b101c]/90 border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <BatteryCharging className="h-4 w-4 text-emerald-300" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Battery</h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Metric
              label="Nominal capacity"
              value={battery.requiredNominalKwh > 0 ? `${num(battery.requiredNominalKwh, 2)} kWh` : 'Not required'}
              detail="AC backup ÷ (efficiency × DoD)"
              tone={battery.requiredNominalKwh > 0 ? 'good' : 'warn'}
            />
            <Metric
              label="Usable energy"
              value={battery.requiredNominalKwh > 0 ? `${num(battery.usableKwh, 2)} kWh` : '—'}
              detail="At the approved depth of discharge"
            />
            <Metric
              label="Bank voltage / Ah"
              value={
                battery.voltage === null
                  ? 'Voltage not supplied'
                  : `${num(battery.voltage, 1)} V / ${battery.requiredAh === null ? '—' : `${num(battery.requiredAh, 0)} Ah`}`
              }
              detail={battery.voltage === null ? 'Ah cannot be calculated without voltage' : 'Ah from nominal kWh and bank voltage'}
              tone={battery.voltage === null ? 'warn' : 'default'}
            />
            <Metric
              label="Discharge power"
              value={
                battery.powerCheck === 'ok'
                  ? 'Within stated limit'
                  : battery.powerCheck === 'insufficient'
                    ? 'Below load'
                    : 'Confirm BMS limit'
              }
              detail="Continuous discharge, not surge"
              tone={battery.powerCheck === 'insufficient' ? 'warn' : 'default'}
            />
          </div>
          <p className="text-[11px] text-slate-300 mt-3 leading-relaxed">
            <span className="font-semibold">Configuration:</span> {battery.configuration}
          </p>
        </section>

        <section className="card p-5 bg-[#0b101c]/90 border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="h-4 w-4 text-yellow-300" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Solar array</h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Metric
              label="Energy to generate"
              value={`${num(pv.requiredSolarKwh, 2)} kWh/day`}
              detail="Daily load plus battery recharge"
            />
            <Metric
              label="Array capacity"
              value={pv.pvKwp === null ? 'Peak sun hours required' : `${num(pv.pvKwp, 2)} kWp`}
              detail={pv.pvKwp === null ? 'No national default is assumed' : 'Preliminary, before final string design'}
              tone={pv.pvKwp === null ? 'warn' : 'good'}
            />
            <Metric
              label="Panel count"
              value={
                pv.panelCount === null
                  ? 'Panel wattage required'
                  : `${pv.panelCount} ${pv.panelCount === 1 ? 'panel' : 'panels'}`
              }
              detail={pv.panelCount === null ? 'Enter the panel rated power' : 'Rounded up to whole panels'}
              tone={pv.panelCount === null ? 'warn' : 'default'}
            />
            <Metric
              label="String window"
              value={
                pv.maxSeries === null || pv.minSeries === null
                  ? 'Specifications required'
                  : `${pv.minSeries}–${pv.maxSeries} per string`
              }
              detail={
                pv.stringCheck === 'ok'
                  ? 'Within the supplied voltage limits'
                  : pv.stringCheck === 'warning'
                    ? 'Check the warnings below'
                    : 'Enter Voc, Vmp and MPPT limits'
              }
              tone={pv.stringCheck === 'warning' ? 'warn' : pv.stringCheck === 'ok' ? 'good' : 'default'}
            />
          </div>
        </section>

        <section className="card p-5 bg-[#0b101c]/90 border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-cyan-300" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Published package</h3>
          </div>
          <p className="text-lg font-bold text-white">{pkg.label}</p>
          <p className="text-2xl font-black text-amber-300 mt-1">
            {pkg.priceNgn === null ? 'Custom quotation' : naira(pkg.priceNgn)}
          </p>
          {pkg.kva !== null && (
            <p className="text-[11px] font-mono text-slate-500 mt-1">{num(pkg.kva, 1)} kVA nominal · installation included</p>
          )}
          <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">{pkg.note}</p>
          {noLoad && (
            <p className="text-[11px] text-amber-300 mt-2 leading-relaxed">
              Add appliances before using this package match.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button type="button" onClick={onQuote} className="btn-primary text-xs py-2.5 px-4 flex-1">
              <Send className="h-3.5 w-3.5" /> Request quotation
            </button>
            <button type="button" onClick={onSiteAssessment} className="btn-secondary text-xs py-2.5 px-4 flex-1">
              <FileText className="h-3.5 w-3.5" /> Book site assessment
            </button>
          </div>
        </section>
      </div>

      <section className="card p-5 bg-[#0b101c]/90 border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-amber-300" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">
            Warnings and limitations ({result.warnings.length})
          </h3>
        </div>
        {result.warnings.length === 0 ? (
          <p className="text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            No calculation warnings were raised from the current inputs. This does not replace a site assessment.
          </p>
        ) : (
          <ul className="space-y-2">
            {result.warnings.map((warning, index) => (
              <li key={`${index}-${warning.slice(0, 24)}`} className="flex items-start gap-2 text-xs text-amber-100/90 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5 bg-[#0b101c]/90 border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-cyan-300" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">Assumptions used</h3>
        </div>
        <ul className="grid sm:grid-cols-2 gap-x-5 gap-y-1.5">
          {result.assumptions.map((item, index) => (
            <li key={`${index}-${item.slice(0, 20)}`} className="text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-slate-600 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-slate-500 mt-4 leading-relaxed border-t border-white/5 pt-3">
          This is a preliminary estimate for discussion, not a final design or a binding quotation. Battery, inverter and
          panel models, protection and installation must be confirmed by a qualified installer after a site assessment.
          The advisor never diagnoses a fault from a single reading.
        </p>
      </section>
    </div>
  );
};
