import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Ship, Plane, Receipt, ArrowRight, MessageCircle, Info, Boxes } from 'lucide-react';
import { getWhatsAppUrl, getImportationContent } from '../../utils/haritechContent';
import type { GoodsSegment } from '../../utils/haritechContent';
import { priceOf, CLEARING_COORDINATION_ID } from '../../config/pricing';
import { formatNaira } from '../../utils/money';

/* ── Import Landed-Cost Estimator ───────────────────────────────────────
   Estimates the full Nigerian landed cost of an importation: CIF value,
   customs duty, ECOWAS levy, VAT, freight, third-party charges and the
   conditional Haritech clearing coordination fee.

   Freight is always chargeable kg × USD/kg × FX. No FX rate and no USD/kg
   rate is stored in the code: both are entered by the user and shown with
   the timestamp of the calculation.                                      */

type FreightMode = 'sea' | 'air';

interface ModeSpec {
  label: string;
  transit: string;
}

const MODES: Record<FreightMode, ModeSpec> = {
  sea: { label: 'Sea Freight (FCL/LCL)', transit: '30–45 days' },
  air: { label: 'Air Freight', transit: '3–7 days' },
};

const DUTY_BANDS = [
  { value: 5, label: '5% — Essential goods, raw materials, machinery' },
  { value: 10, label: '10% — Semi-finished goods, some inputs' },
  { value: 20, label: '20% — General finished goods (default)' },
  { value: 35, label: '35% — Specific & consumer luxuries' },
];

const VAT_RATE = 0.075;   // Nigerian VAT on (CIF + duty + levy)
const LEVY_RATE = 0.01;   // ECOWAS Common External Tariff levy on CIF
const INSURANCE_RATE = 0.0075; // Marine/air insurance on (FOB + freight)

const HARITECH_SERVICES = [
  { id: 'IMP-001', label: 'Product sourcing' },
  { id: 'IMP-002', label: 'Pre-order / order handling' },
  { id: 'IMP-003', label: 'Supplier verification' },
  { id: 'IMP-004', label: 'Cargo consolidation coordination' },
  { id: 'IMP-005', label: 'Goods inspection coordination' },
  { id: 'IMP-006', label: 'Importation consultation (per session)' },
] as const;

const CLEARING_COORDINATION_FEE = priceOf(CLEARING_COORDINATION_ID);

/* A segment carries a band like "20%" or "5–20%". Snap it to the nearest
   tariff band the calculator supports, using the top of the range so the
   estimate never under-quotes duty.                                        */
const bandFor = (band: string): number | null => {
  const nums = (band.match(/\d+/g) ?? []).map(Number).filter(n => !Number.isNaN(n));
  if (!nums.length) return null;
  const declared = Math.max(...nums);
  const supported = DUTY_BANDS.map(b => b.value);
  return supported.reduce((best, v) => (Math.abs(v - declared) < Math.abs(best - declared) ? v : best), supported[0]);
};

const ImportLandedCostEstimator: React.FC = () => {
  const [mode, setMode] = useState<FreightMode>('sea');
  const [fobUsd, setFobUsd] = useState(8_000);
  const [weightKg, setWeightKg] = useState(0);
  const [freightRateUsdPerKg, setFreightRateUsdPerKg] = useState(0);
  const [rate, setRate] = useState(0);
  const [dutyPct, setDutyPct] = useState(20);
  const [quantity, setQuantity] = useState(50);
  const [terminalNgn, setTerminalNgn] = useState(0);
  const [agentNgn, setAgentNgn] = useState(0);
  const [deliveryNgn, setDeliveryNgn] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [includeCoordination, setIncludeCoordination] = useState(false);
  const [segments] = useState<GoodsSegment[]>(() => getImportationContent().segments);
  const [segmentId, setSegmentId] = useState('');
  const [quotedAt, setQuotedAt] = useState(() => new Date());

  const segment = segments.find(s => s.id === segmentId);

  const applySegment = useCallback((id: string) => {
    setSegmentId(id);
    const seg = segments.find(s => s.id === id);
    if (!seg) return;
    const band = bandFor(seg.dutyBand);
    if (band !== null) setDutyPct(band);
    const route = (seg.mode || '').toLowerCase();
    if (route === 'air') setMode('air');
    else if (route === 'sea') setMode('sea');
  }, [segments]);

  // The goods-segment explorer above the calculator can preset both fields
  useEffect(() => {
    const handler = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (id) applySegment(id);
    };
    window.addEventListener('haritech-import-segment', handler);
    return () => window.removeEventListener('haritech-import-segment', handler);
  }, [applySegment]);

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const ready = rate > 0 && weightKg > 0 && freightRateUsdPerKg > 0;

  // Timestamp the last calculation so an FX rate is never presented as live
  useEffect(() => {
    setQuotedAt(new Date());
  }, [
    mode, fobUsd, weightKg, freightRateUsdPerKg, rate, dutyPct, quantity,
    terminalNgn, agentNgn, deliveryNgn, selectedServices, includeCoordination,
  ]);

  const r = useMemo(() => {
    const spec = MODES[mode];
    const fob = fobUsd * rate;
    const freight = weightKg * freightRateUsdPerKg * rate;
    const insurance = (fob + freight) * INSURANCE_RATE;
    const cif = fob + freight + insurance;
    const duty = cif * (dutyPct / 100);
    const levy = cif * LEVY_RATE;
    const vat = (cif + duty + levy) * VAT_RATE;
    const serviceFees = HARITECH_SERVICES
      .filter(service => selectedServices.includes(service.id))
      .reduce((sum, service) => sum + priceOf(service.id), 0);
    const coordination = includeCoordination ? CLEARING_COORDINATION_FEE : 0;
    const thirdParty = terminalNgn + agentNgn + deliveryNgn;
    const total = cif + duty + levy + vat + thirdParty + serviceFees + coordination;
    return {
      fob, freight, insurance, cif, duty, levy, vat,
      thirdParty, serviceFees, coordination, total,
      perUnit: quantity > 0 ? total / quantity : total,
      landedPremium: fob > 0 ? Math.round(((total - fob) / fob) * 100) : 0,
      transit: spec.transit,
      modeLabel: spec.label,
    };
  }, [
    mode, fobUsd, weightKg, freightRateUsdPerKg, rate, dutyPct, quantity,
    terminalNgn, agentNgn, deliveryNgn, selectedServices, includeCoordination,
  ]);

  const waMsg =
    `Hello Haritech! I used the Import Landed-Cost Estimator.\n\n` +
    (segment ? `Goods segment: ${segment.name}\n` : '') +
    `Cargo value: $${fobUsd.toLocaleString()} FOB\n` +
    `Chargeable weight: ${weightKg.toLocaleString()} kg\n` +
    `Freight rate: $${freightRateUsdPerKg.toLocaleString()}/kg (${r.modeLabel})\n` +
    `Freight: ${formatNaira(r.freight)}\n` +
    `Exchange rate: ₦${rate.toLocaleString()}/$ | Duty band: ${dutyPct}%\n` +
    `Units: ${quantity}\n` +
    `Quote timestamp: ${quotedAt.toLocaleString('en-NG')}\n\n` +
    `Estimated landed cost: ${formatNaira(r.total)} (≈ ${formatNaira(r.perUnit)}/unit)\n\n` +
    `Please send me a formal importation quotation.`;

  const rows: { label: string; note: string; value: number; bold?: boolean }[] = [
    { label: 'FOB cargo value', note: `$${fobUsd.toLocaleString()} × ₦${rate.toLocaleString()}`, value: r.fob },
    { label: 'Freight', note: `${weightKg.toLocaleString()} kg × $${freightRateUsdPerKg.toLocaleString()}/kg × ₦${rate.toLocaleString()}`, value: r.freight },
    { label: 'Marine/air insurance', note: '0.75% of FOB + freight (assumption)', value: r.insurance },
    { label: 'CIF value (customs base)', note: 'Used for duty assessment', value: r.cif, bold: true },
    { label: `Customs duty @ ${dutyPct}%`, note: 'ECOWAS common external tariff', value: r.duty },
    { label: 'ECOWAS levy @ 1%', note: 'Regional import levy', value: r.levy },
    { label: 'VAT @ 7.5%', note: 'On CIF + duty + levy', value: r.vat },
    { label: 'Terminal / port charges', note: 'Enter your forwarder or terminal quote', value: terminalNgn },
    { label: 'Clearing agent / documentation', note: 'Enter your agent quote', value: agentNgn },
    { label: 'Local delivery / trucking', note: 'Enter your haulage quote', value: deliveryNgn },
    ...(r.serviceFees > 0
      ? [{ label: 'Haritech service fees', note: `${selectedServices.length} service${selectedServices.length === 1 ? '' : 's'} selected`, value: r.serviceFees }]
      : []),
    ...(r.coordination > 0
      ? [{ label: 'Clearing coordination (authorised)', note: 'Qualifying large/complex shipments only', value: r.coordination }]
      : []),
  ];

  const field =
    'w-full px-4 py-3 bg-slate-950/50 rounded-xl border border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white';
  const label = 'block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide';

  return (
    <section id="import-estimator" className="py-20 relative scroll-mt-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.07),transparent_65%)] pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-sm font-semibold mb-4">
            <Calculator className="h-4 w-4" /> Import Landed-Cost Estimator
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 font-syne">
            What Will It <span className="text-cyan-400">Actually Cost?</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Enter your cargo value, chargeable weight, your forwarder's USD/kg rate and the FX rate.
            We calculate CIF, duty, levy, VAT, third-party charges and your true cost per unit before
            you commit to a supplier.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-cyan-950/30">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-600/20 to-blue-600/10 border-b border-white/10">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <Calculator className="h-5 w-5" /> Haritech Import Landed-Cost Engine
              </div>
              <span className="hidden sm:inline text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Nigeria · {new Date().getFullYear()}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Inputs */}
              <div className="p-6 sm:p-8 space-y-5 border-b lg:border-b-0 lg:border-r border-white/10">
                <div>
                  <label className={label}>Goods segment (optional preset)</label>
                  <div className="relative">
                    <Boxes className="h-4 w-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={segmentId}
                      onChange={e => applySegment(e.target.value)}
                      className={`${field} pl-11`}
                    >
                      <option value="">Generic — choose duty manually</option>
                      {segments.map(seg => (
                        <option key={seg.id} value={seg.id}>{seg.name} ({seg.dutyBand})</option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    {segment
                      ? `${segment.dutyBand} duty · ${segment.mode} · ${segment.permits.length} permit${segment.permits.length === 1 ? '' : 's'} — adjust below if your HS code differs.`
                      : 'Selecting a segment fills in the duty band and the usual freight mode for those goods.'}
                  </p>
                </div>

                <div>
                  <label className={label}>Cargo value (FOB, USD)</label>
                  <input
                    type="number" min={0} value={fobUsd}
                    onChange={e => setFobUsd(Math.max(0, Number(e.target.value)))}
                    className={field}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={label}>Chargeable weight (kg)</label>
                    <input
                      type="number" min={0} step={0.1} value={weightKg}
                      placeholder="e.g. 450"
                      onChange={e => setWeightKg(Math.max(0, Number(e.target.value)))}
                      className={field}
                    />
                  </div>
                  <div>
                    <label className={label}>Freight rate (USD/kg)</label>
                    <input
                      type="number" min={0} step={0.01} value={freightRateUsdPerKg}
                      placeholder="From your forwarder"
                      onChange={e => setFreightRateUsdPerKg(Math.max(0, Number(e.target.value)))}
                      className={field}
                    />
                  </div>
                </div>

                <div>
                  <label className={label}>Exchange rate (₦ per $)</label>
                  <input
                    type="number" min={0} step={1} value={rate}
                    placeholder="Enter today's rate"
                    onChange={e => setRate(Math.max(0, Number(e.target.value)))}
                    className={field}
                  />
                  <p className="mt-2 text-[11px] text-slate-500">
                    No exchange rate is stored in the calculator. The rate you enter is shown on every estimate with a timestamp.
                  </p>
                </div>

                <div>
                  <label className={label}>Mode of transport</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(MODES) as FreightMode[]).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                          mode === m
                            ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300'
                            : 'bg-slate-950/40 border-white/10 text-slate-400 hover:border-white/25'
                        }`}
                      >
                        {m === 'sea' ? <Ship className="h-4 w-4" /> : <Plane className="h-4 w-4" />}
                        {m === 'sea' ? 'Sea' : 'Air'}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">{MODES[mode].label} · typical transit {MODES[mode].transit}</p>
                </div>

                <div>
                  <label className={label}>Duty band (HS classification)</label>
                  <select value={dutyPct} onChange={e => setDutyPct(Number(e.target.value))} className={field}>
                    {DUTY_BANDS.map(b => (
                      <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={label}>Number of units</label>
                  <input
                    type="number" min={1} value={quantity}
                    onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                    className={field}
                  />
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Third-party charges (enter your quotes)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={label}>Terminal / port (₦)</label>
                      <input
                        type="number" min={0} value={terminalNgn}
                        onChange={e => setTerminalNgn(Math.max(0, Number(e.target.value)))}
                        className={field}
                      />
                    </div>
                    <div>
                      <label className={label}>Agent / docs (₦)</label>
                      <input
                        type="number" min={0} value={agentNgn}
                        onChange={e => setAgentNgn(Math.max(0, Number(e.target.value)))}
                        className={field}
                      />
                    </div>
                    <div>
                      <label className={label}>Delivery (₦)</label>
                      <input
                        type="number" min={0} value={deliveryNgn}
                        onChange={e => setDeliveryNgn(Math.max(0, Number(e.target.value)))}
                        className={field}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Pass-through costs only. Haritech does not estimate or mark these up; enter the figures from your terminal, agent and haulage quotes.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Optional Haritech services
                  </div>
                  <div className="mt-3 space-y-2">
                    {HARITECH_SERVICES.map(service => {
                      const checked = selectedServices.includes(service.id);
                      return (
                        <label
                          key={service.id}
                          className={`flex items-start justify-between gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                            checked
                              ? 'border-cyan-400/50 bg-cyan-500/10 text-white'
                              : 'border-white/10 text-slate-400 hover:border-white/25'
                          }`}
                        >
                          <span className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleService(service.id)}
                              className="mt-0.5 accent-cyan-500"
                            />
                            <span className="text-xs">{service.label}</span>
                          </span>
                          <span className="text-xs font-mono font-bold text-cyan-400 whitespace-nowrap">
                            +{formatNaira(priceOf(service.id))}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCoordination}
                    onChange={() => setIncludeCoordination(v => !v)}
                    className="mt-0.5 accent-amber-500"
                  />
                  <span className="text-xs text-slate-300">
                    Add clearing coordination ({formatNaira(CLEARING_COORDINATION_FEE)}) — only if this shipment
                    qualifies as large or complex and Haritech has authorised it in writing. It is never added automatically.
                  </span>
                </label>
              </div>

              {/* Results */}
              <div className="p-6 sm:p-8 bg-slate-950/40">
                <div className="flex items-center gap-2 mb-4 text-[11px] font-bold uppercase tracking-widest text-cyan-400">
                  <Receipt className="h-3.5 w-3.5" /> Cost breakdown
                </div>
                {ready ? (
                  <>
                    <div className="space-y-0">
                      {rows.map(row => (
                        <div
                          key={row.label}
                          className={`flex items-baseline justify-between gap-4 py-2.5 border-b border-white/5 ${
                            row.bold ? 'text-white font-semibold' : 'text-slate-400'
                          }`}
                        >
                          <div>
                            <span className={`text-sm ${row.bold ? 'text-white' : 'text-slate-300'}`}>{row.label}</span>
                            <p className="text-[10px] text-slate-600">{row.note}</p>
                          </div>
                          <span className={`text-sm font-mono shrink-0 ${row.bold ? 'text-cyan-300' : 'text-slate-300'}`}>
                            {formatNaira(row.value)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-5">
                      <p className="text-[11px] uppercase tracking-widest text-cyan-300 font-bold mb-1">Estimated landed cost</p>
                      <p className="text-3xl font-extrabold text-white font-mono">{formatNaira(r.total)}</p>
                      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-cyan-200">
                        <span><span className="font-bold">{formatNaira(r.perUnit)}</span> per unit</span>
                        <span><span className="font-bold">{r.landedPremium}%</span> above FOB value</span>
                      </div>
                      <p className="mt-3 pt-3 border-t border-cyan-400/20 text-[11px] leading-relaxed text-cyan-200/80">
                        FX ₦{rate.toLocaleString()}/$ · {weightKg.toLocaleString()} kg × ${freightRateUsdPerKg.toLocaleString()}/kg
                        · calculated {quotedAt.toLocaleString('en-NG')}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                    <p className="font-bold text-amber-300 mb-2">Three figures are needed</p>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      <li>• Chargeable weight from your forwarder, in kg.</li>
                      <li>• Freight rate in USD per kg from your freight quote.</li>
                      <li>• The exchange rate (₦ per $) you want the estimate to use.</li>
                    </ul>
                    <p className="mt-3 text-[11px] text-slate-500">
                      The calculator will not guess any of them. Freight is always chargeable kg × USD/kg × FX.
                    </p>
                  </div>
                )}

                {ready ? (
                  <a
                    href={getWhatsAppUrl(waMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 w-full btn-primary justify-center text-sm py-3.5 flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" /> Get a formal quotation
                  </a>
                ) : (
                  <p className="mt-5 text-xs text-slate-500">
                    Enter the chargeable weight, USD/kg rate and FX rate to generate a quote request.
                  </p>
                )}

                <p className="mt-4 flex gap-2 text-[11px] leading-relaxed text-slate-500">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-600" />
                  Final duty is assessed by Nigeria Customs Service on the entry date, using the prevailing
                  exchange rate and your goods' HS classification.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <a
              href={getWhatsAppUrl('Hello! I would like a landed-cost review for my importation.')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1.5"
            >
              Have a supplier quote already? Send it to us for a review <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ImportLandedCostEstimator;
