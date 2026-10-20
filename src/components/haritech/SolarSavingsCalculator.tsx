import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Zap, TrendingUp, Battery, Calculator,
  Home, Building2, Factory, ChevronDown, MessageCircle, ArrowRight,
  LucideIcon
} from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/haritechContent';

/* ── Solar Savings Calculator ────────────────────────────────────────────
   Interactive tool that estimates monthly savings, payback period, and
   25-year ROI based on property type, monthly bill, and load profile.  */

type PropertyType = 'home' | 'office' | 'shop' | 'factory';
type SystemSize = '1.5kva' | '3.5kva' | '5kva' | '10kva' | '20kva';

interface SystemSpec {
  label: string;
  kva: number;
  basePriceNgn: number;
  avgDailyKwh: number;  // kWh generated daily on avg
  panelCount: number;
  batteryKwh: number;
}

const SYSTEMS: Record<SystemSize, SystemSpec> = {
  '1.5kva': { label: '1.5kVA Essential', kva: 1.5, basePriceNgn: 480_000,  avgDailyKwh: 5,  panelCount: 4,  batteryKwh: 2.4 },
  '3.5kva': { label: '3.5kVA Home Pro',  kva: 3.5, basePriceNgn: 950_000,  avgDailyKwh: 12, panelCount: 8,  batteryKwh: 5   },
  '5kva':   { label: '5kVA Executive',   kva: 5,   basePriceNgn: 1_400_000, avgDailyKwh: 18, panelCount: 12, batteryKwh: 10  },
  '10kva':  { label: '10kVA Commercial', kva: 10,  basePriceNgn: 2_200_000, avgDailyKwh: 35, panelCount: 20, batteryKwh: 20  },
  '20kva':  { label: '20kVA Industrial', kva: 20,  basePriceNgn: 3_800_000, avgDailyKwh: 70, panelCount: 40, batteryKwh: 40  },
};

const PROPERTY_ICONS: Record<PropertyType, LucideIcon> = {
  home: Home, office: Building2, shop: Zap, factory: Factory,
};

const DISCOM_RATE = 100; // ₦ per kWh (approximate NEPA/distribution rate)

function fmt(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n.toFixed(0)}`;
}

const SolarSavingsCalculator: React.FC = () => {
  const [property, setProperty] = useState<PropertyType>('home');
  const [monthlyBill, setMonthlyBill] = useState(15_000);
  const [systemSize, setSystemSize] = useState<SystemSize>('3.5kva');
  const [genCostPerMonth, setGenCostPerMonth] = useState(25_000);
  const [showResult, setShowResult] = useState(false);

  const spec = SYSTEMS[systemSize];

  const result = useMemo(() => {
    const monthlyKwhUsage    = monthlyBill / DISCOM_RATE;
    const solarMonthlyKwh    = spec.avgDailyKwh * 30;
    const coverageRatio      = Math.min(1, solarMonthlyKwh / Math.max(1, monthlyKwhUsage));
    const billSaving         = monthlyBill * coverageRatio;
    const genSaving          = genCostPerMonth * Math.min(1, coverageRatio * 1.2);
    const totalMonthlySaving = billSaving + genSaving;
    const annualSaving       = totalMonthlySaving * 12;
    const paybackYears       = spec.basePriceNgn / Math.max(1, annualSaving);
    const roi25              = annualSaving * 25 - spec.basePriceNgn;
    const co2Saved           = solarMonthlyKwh * 12 * 0.48; // kg CO2 / kWh Nigerian grid

    return {
      coveragePct: Math.round(coverageRatio * 100),
      billSaving:  Math.round(billSaving),
      genSaving:   Math.round(genSaving),
      totalMonthly: Math.round(totalMonthlySaving),
      annualSaving: Math.round(annualSaving),
      paybackYears: Math.max(0.5, paybackYears).toFixed(1),
      roi25:        Math.round(roi25),
      co2Saved:     Math.round(co2Saved),
    };
  }, [monthlyBill, genCostPerMonth, spec]);

  const waMsg = `Hello Haritech! I used the Solar Savings Calculator.\n\n` +
    `Property: ${property}\nSystem: ${spec.label}\nMonthly Bill: ${fmt(monthlyBill)}\n` +
    `Estimated Monthly Saving: ${fmt(result.totalMonthly)}\nPayback: ${result.paybackYears} years\n\n` +
    `Please send me a detailed quote.`;

  return (
    <section className="py-20 relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(234,179,8,0.07)_0%,transparent_65%)] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-300 text-sm font-semibold mb-4">
            <Calculator className="h-4 w-4" /> Solar Savings Calculator
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 font-syne">
            How Much Will You <span className="text-yellow-400">Save?</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Fill in your details and instantly see your projected savings, payback period, and 25-year ROI.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-yellow-950/20">
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-yellow-600/20 to-orange-600/10 border-b border-white/10">
              <div className="flex items-center gap-2 text-yellow-300 font-bold">
                <Sun className="h-5 w-5 animate-spin-slow" />
                <span>Haritech Solar ROI Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-xs text-yellow-400 font-mono">LIVE ESTIMATE</span>
              </div>
            </div>

            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="space-y-6">
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Property Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['home', 'office', 'shop', 'factory'] as PropertyType[]).map(p => {
                      const Icon = PROPERTY_ICONS[p];
                      return (
                        <button
                          key={p}
                          onClick={() => setProperty(p)}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                            property === p
                              ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-300'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Monthly NEPA Bill */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-300">Monthly NEPA Bill</label>
                    <span className="text-yellow-400 font-bold font-mono">{fmt(monthlyBill)}</span>
                  </div>
                  <input
                    type="range"
                    min={3000} max={200_000} step={1000}
                    value={monthlyBill}
                    onChange={e => setMonthlyBill(+e.target.value)}
                    className="w-full accent-yellow-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>₦3k</span><span>₦200k</span>
                  </div>
                </div>

                {/* Monthly Generator Cost */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-300">Monthly Generator Cost (fuel + maintenance)</label>
                    <span className="text-orange-400 font-bold font-mono">{fmt(genCostPerMonth)}</span>
                  </div>
                  <input
                    type="range"
                    min={0} max={150_000} step={1000}
                    value={genCostPerMonth}
                    onChange={e => setGenCostPerMonth(+e.target.value)}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>₦0</span><span>₦150k</span>
                  </div>
                </div>

                {/* System Size */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Recommended System</label>
                  <div className="relative">
                    <select
                      value={systemSize}
                      onChange={e => setSystemSize(e.target.value as SystemSize)}
                      className="w-full appearance-none bg-slate-800 border border-white/15 text-white px-4 py-3 rounded-xl pr-10 focus:outline-none focus:border-yellow-500/60 text-sm font-semibold"
                    >
                      {(Object.entries(SYSTEMS) as [SystemSize, SystemSpec][]).map(([key, s]) => (
                        <option key={key} value={key}>{s.label} — {fmt(s.basePriceNgn)}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-400">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="text-white font-bold">{spec.panelCount}</div>
                      <div>Panels</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="text-white font-bold">{spec.batteryKwh}kWh</div>
                      <div>Battery</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="text-white font-bold">{spec.avgDailyKwh}kWh</div>
                      <div>Daily gen</div>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowResult(true)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-base shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                >
                  <Calculator className="h-5 w-5" /> Calculate My Savings
                </motion.button>
              </div>

              {/* Results panel */}
              <div>
                <AnimatePresence mode="wait">
                  {showResult ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="h-full flex flex-col gap-4"
                    >
                      {/* Coverage meter */}
                      <div className="rounded-xl bg-gradient-to-br from-yellow-600/15 to-orange-600/10 border border-yellow-500/20 p-5">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-semibold text-slate-300">Solar Coverage</span>
                          <span className="text-2xl font-black text-yellow-400">{result.coveragePct}%</span>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.coveragePct}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">of your current power needs covered by solar</p>
                      </div>

                      {/* Monthly savings */}
                      <div className="rounded-xl bg-slate-800/60 border border-white/10 p-5">
                        <div className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">Monthly Savings</div>
                        <div className="text-3xl font-black text-green-400 mb-1">{fmt(result.totalMonthly)}</div>
                        <div className="flex gap-4 text-xs text-slate-400">
                          <span>NEPA: <span className="text-green-300">{fmt(result.billSaving)}</span></span>
                          <span>Gen: <span className="text-orange-300">{fmt(result.genSaving)}</span></span>
                        </div>
                      </div>

                      {/* Key metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-800/60 border border-white/10 p-4 text-center">
                          <TrendingUp className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
                          <div className="text-lg font-black text-white">{result.paybackYears}yrs</div>
                          <div className="text-xs text-slate-400">Payback Period</div>
                        </div>
                        <div className="rounded-xl bg-slate-800/60 border border-white/10 p-4 text-center">
                          <Battery className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                          <div className="text-lg font-black text-white">{fmt(result.annualSaving)}</div>
                          <div className="text-xs text-slate-400">Annual Saving</div>
                        </div>
                        <div className="rounded-xl bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 p-4 text-center">
                          <div className="text-lg font-black text-emerald-400">{fmt(result.roi25)}</div>
                          <div className="text-xs text-slate-400">25-yr Net ROI</div>
                        </div>
                        <div className="rounded-xl bg-gradient-to-br from-sky-600/10 to-blue-600/10 border border-sky-500/20 p-4 text-center">
                          <div className="text-lg font-black text-sky-400">{result.co2Saved.toLocaleString()}kg</div>
                          <div className="text-xs text-slate-400">CO₂ Saved/yr</div>
                        </div>
                      </div>

                      {/* CTA */}
                      <motion.a
                        href={getWhatsAppUrl(waMsg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg shadow-green-900/30"
                      >
                        <MessageCircle className="h-5 w-5" />
                        Get My Solar Quote on WhatsApp
                        <ArrowRight className="h-4 w-4" />
                      </motion.a>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center gap-6 py-8"
                    >
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-yellow-500/10 flex items-center justify-center">
                          <Sun className="h-12 w-12 text-yellow-400 animate-spin-slow" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                          <Zap className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold text-lg mb-2">Your Savings Await</p>
                        <p className="text-slate-400 text-sm max-w-xs">
                          Fill in your property details and click <strong className="text-yellow-400">Calculate</strong> to see your personalized solar ROI.
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 text-xs text-slate-500 text-center">
                        <span className="flex items-center gap-2"><span className="text-yellow-400">✓</span> No signup required</span>
                        <span className="flex items-center gap-2"><span className="text-yellow-400">✓</span> Instant results</span>
                        <span className="flex items-center gap-2"><span className="text-yellow-400">✓</span> Free quote on WhatsApp</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SolarSavingsCalculator;
