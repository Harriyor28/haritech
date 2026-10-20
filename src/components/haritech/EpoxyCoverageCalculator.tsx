import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ruler, Calculator, Layers, Home,
  MessageCircle, ArrowRight,
  ChevronDown, Sparkles, CheckCircle, Droplets, Gem,
  LucideIcon
} from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/haritechContent';

/* ── 3D Epoxy Coverage & Material Cost Calculator ────────────────────────
   Helps customers estimate material requirements and total cost for
   their epoxy flooring / surface project before requesting a quote.    */

type SpaceType = 'floor' | 'wall' | 'countertop' | 'furniture';
type FinishType = 'metallic' | 'marble' | 'flaked' | 'solid' | 'glow' | '3d_art';
type Location = 'home' | 'office' | 'commercial' | 'industrial';

interface FinishSpec {
  label: string;
  emoji: string;
  pricePerSqm: number;    // ₦ / m²
  coats: number;
  dryHours: number;
  durabilityYrs: number;
  description: string;
}

const FINISHES: Record<FinishType, FinishSpec> = {
  metallic:  { label: 'Metallic Sheen',    emoji: '✨', pricePerSqm: 18_000, coats: 3, dryHours: 48, durabilityYrs: 10, description: 'Mirror-effect liquid metal pour' },
  marble:    { label: '3D Marble Vein',    emoji: '🌊', pricePerSqm: 22_000, coats: 3, dryHours: 72, durabilityYrs: 12, description: 'Realistic marble & stone veining' },
  flaked:    { label: 'Decorative Flake',  emoji: '❄️', pricePerSqm: 12_000, coats: 2, dryHours: 36, durabilityYrs: 8,  description: 'Vinyl flake broadcast system' },
  solid:     { label: 'Solid Colour Gloss',emoji: '🎨', pricePerSqm: 9_000,  coats: 2, dryHours: 24, durabilityYrs: 7,  description: 'Clean, durable colour finish' },
  glow:      { label: 'Glow-in-Dark',      emoji: '🌙', pricePerSqm: 28_000, coats: 4, dryHours: 96, durabilityYrs: 8,  description: 'Photoluminescent premium pour' },
  '3d_art':  { label: '3D Art / Mural',    emoji: '🖼️', pricePerSqm: 45_000, coats: 4, dryHours: 120,durabilityYrs: 10, description: 'Custom 3D illusion artwork' },
};

const SPACE_ICONS: Record<SpaceType, LucideIcon> = {
  floor: Home, wall: Layers, countertop: Ruler, furniture: Gem,
};

const LOCATION_MULTIPLIER: Record<Location, number> = {
  home: 1, office: 1.1, commercial: 1.2, industrial: 1.35,
};

function fmt(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${Math.round(n)}`;
}

const EpoxyCoverageCalculator: React.FC = () => {
  const [space, setSpace] = useState<SpaceType>('floor');
  const [finish, setFinish] = useState<FinishType>('metallic');
  const [location, setLocation] = useState<Location>('home');
  const [length, setLength] = useState(6);
  const [width, setWidth]   = useState(4);
  const [showResult, setShowResult] = useState(false);

  const finishSpec = FINISHES[finish];
  const area = length * width;

  const result = useMemo(() => {
    const basePrice    = area * finishSpec.pricePerSqm;
    const locMult      = LOCATION_MULTIPLIER[location];
    const surfacePrep  = area * 2_500;       // surface grinding & prep
    const topcoat      = area * 1_500;       // UV top coat
    const total        = (basePrice + surfacePrep + topcoat) * locMult;
    const materialKg   = area * 0.8 * finishSpec.coats;  // approx kg of resin
    const daysToComplete = Math.ceil(finishSpec.dryHours / 24) + 1;
    const pricePerSqm  = total / area;

    return {
      area,
      basePrice:    Math.round(basePrice * locMult),
      surfacePrep:  Math.round(surfacePrep * locMult),
      topcoat:      Math.round(topcoat * locMult),
      total:        Math.round(total),
      materialKg:   Math.round(materialKg),
      daysToComplete,
      pricePerSqm:  Math.round(pricePerSqm),
    };
  }, [area, finishSpec, location]);

  const waMsg = `Hello Haritech 3D Epoxy Team! I used the Coverage Calculator.\n\n` +
    `Space: ${space} — ${location}\nFinish: ${finishSpec.label}\n` +
    `Area: ${length}m × ${width}m = ${area}m²\n` +
    `Estimated Cost: ${fmt(result.total)}\nTimeline: ~${result.daysToComplete} days\n\n` +
    `Please send me a detailed quote.`;

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.12)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.10)_0%,transparent_60%)] pointer-events-none" />

      {/* Floating orb decorations */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width:  `${60 + i * 30}px`,
            height: `${60 + i * 30}px`,
            top:    `${10 + i * 15}%`,
            left:   `${5 + i * 18}%`,
            background: i % 2 === 0
              ? 'radial-gradient(circle, rgba(20,184,166,0.15), transparent)'
              : 'radial-gradient(circle, rgba(139,92,246,0.12), transparent)',
          }}
          animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
        />
      ))}

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-sm font-semibold mb-4">
            <Calculator className="h-4 w-4" /> Coverage & Cost Calculator
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 font-syne">
            How Much for Your <span className="bg-gradient-to-r from-teal-300 to-violet-400 bg-clip-text text-transparent">Epoxy Project?</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Enter your room dimensions and finish type to get an instant, detailed cost and materials estimate.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-teal-950/20">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-600/20 to-violet-600/10 border-b border-white/10">
              <div className="flex items-center gap-2 text-teal-300 font-bold">
                <Droplets className="h-5 w-5" />
                <span>Haritech 3D Epoxy Cost Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-xs text-teal-400 font-mono">INSTANT ESTIMATE</span>
              </div>
            </div>

            <div className="p-6 md:p-8 grid md:grid-cols-5 gap-8">
              {/* Inputs — 3 cols */}
              <div className="md:col-span-3 space-y-6">
                {/* Space Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Surface / Space Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['floor', 'wall', 'countertop', 'furniture'] as SpaceType[]).map(s => {
                      const Icon = SPACE_ICONS[s];
                      return (
                        <button
                          key={s}
                          onClick={() => { setSpace(s); setShowResult(false); }}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                            space === s
                              ? 'bg-teal-500/20 border-teal-500/60 text-teal-300'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-semibold text-slate-300">Length</label>
                      <span className="text-teal-400 font-bold font-mono">{length}m</span>
                    </div>
                    <input
                      type="range" min={1} max={50} step={0.5} value={length}
                      onChange={e => { setLength(+e.target.value); setShowResult(false); }}
                      className="w-full accent-teal-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-semibold text-slate-300">Width</label>
                      <span className="text-teal-400 font-bold font-mono">{width}m</span>
                    </div>
                    <input
                      type="range" min={1} max={30} step={0.5} value={width}
                      onChange={e => { setWidth(+e.target.value); setShowResult(false); }}
                      className="w-full accent-teal-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Total area display */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <Ruler className="h-5 w-5 text-teal-400" />
                  <div>
                    <span className="text-white font-bold text-lg">{area.toFixed(1)} m²</span>
                    <span className="text-slate-400 text-sm ml-2">total surface area</span>
                  </div>
                  <div className="ml-auto text-slate-400 text-sm">{(area * 10.764).toFixed(0)} sq.ft</div>
                </div>

                {/* Finish Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Finish / Design Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.entries(FINISHES) as [FinishType, FinishSpec][]).map(([key, f]) => (
                      <button
                        key={key}
                        onClick={() => { setFinish(key); setShowResult(false); }}
                        className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                          finish === key
                            ? 'bg-violet-500/20 border-violet-500/60'
                            : 'bg-white/5 border-white/10 hover:border-white/25'
                        }`}
                      >
                        <span className="text-lg">{f.emoji}</span>
                        <span className={`text-xs font-bold ${finish === key ? 'text-violet-300' : 'text-white'}`}>{f.label}</span>
                        <span className="text-xs text-slate-500">{fmt(f.pricePerSqm)}/m²</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500 italic">{finishSpec.description}</p>
                </div>

                {/* Location / Use */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Location / Use Type</label>
                  <div className="relative">
                    <select
                      value={location}
                      onChange={e => { setLocation(e.target.value as Location); setShowResult(false); }}
                      className="w-full appearance-none bg-slate-800 border border-white/15 text-white px-4 py-3 rounded-xl pr-10 focus:outline-none focus:border-teal-500/60 text-sm font-semibold"
                    >
                      <option value="home">Residential / Home</option>
                      <option value="office">Office / Corporate</option>
                      <option value="commercial">Commercial / Retail</option>
                      <option value="industrial">Industrial / Warehouse</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowResult(true)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-violet-600 text-white font-bold text-base shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-5 w-5" /> Calculate My Project Cost
                </motion.button>
              </div>

              {/* Results — 2 cols */}
              <div className="md:col-span-2">
                <AnimatePresence mode="wait">
                  {showResult ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col gap-3"
                    >
                      {/* Finish badge */}
                      <div className="rounded-xl bg-gradient-to-br from-teal-600/20 to-violet-600/15 border border-teal-500/25 p-4 text-center">
                        <div className="text-3xl mb-1">{finishSpec.emoji}</div>
                        <div className="text-white font-bold">{finishSpec.label}</div>
                        <div className="text-xs text-slate-400">{finishSpec.coats} coat system • {finishSpec.durabilityYrs}yr durability</div>
                      </div>

                      {/* Cost breakdown */}
                      <div className="rounded-xl bg-slate-800/60 border border-white/10 p-4">
                        <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-3">Cost Breakdown</div>
                        <div className="space-y-2 text-sm">
                          {[
                            { label: 'Epoxy Materials & Application', value: result.basePrice },
                            { label: 'Surface Grinding & Prep',        value: result.surfacePrep },
                            { label: 'UV Protective Top Coat',         value: result.topcoat },
                          ].map((item, i) => (
                            <div key={i} className="flex justify-between text-slate-400">
                              <span>{item.label}</span>
                              <span className="text-white font-semibold">{fmt(item.value)}</span>
                            </div>
                          ))}
                          <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                            <span className="font-bold text-white">Project Total</span>
                            <span className="text-xl font-black text-teal-400">{fmt(result.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Key stats */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Area', value: `${area.toFixed(1)}m²`, color: 'text-white' },
                          { label: 'Rate/m²', value: fmt(result.pricePerSqm), color: 'text-teal-400' },
                          { label: 'Material', value: `~${result.materialKg}kg`, color: 'text-violet-400' },
                          { label: 'Timeline', value: `~${result.daysToComplete}d`, color: 'text-yellow-400' },
                        ].map((s, i) => (
                          <div key={i} className="rounded-xl bg-slate-800/60 border border-white/10 p-3 text-center">
                            <div className={`text-base font-black ${s.color}`}>{s.value}</div>
                            <div className="text-xs text-slate-500">{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Quality badges */}
                      <div className="rounded-xl bg-slate-800/40 border border-white/10 p-3">
                        {['Premium Italian resin compounds', 'Certified epoxy technicians', 'Free design consultation'].map((b, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                            <CheckCircle className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                            {b}
                          </div>
                        ))}
                      </div>

                      {/* WhatsApp CTA */}
                      <motion.a
                        href={getWhatsAppUrl(waMsg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold shadow-lg shadow-teal-900/30"
                      >
                        <MessageCircle className="h-5 w-5" />
                        Get My Epoxy Quote
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
                      {/* 3D pour animation */}
                      <div className="relative w-24 h-24">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500/30 to-violet-500/30 animate-pulse" />
                        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-teal-400/20 to-violet-400/20" />
                        <Droplets className="absolute inset-0 m-auto h-10 w-10 text-teal-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold text-lg mb-2">Design Your Surface</p>
                        <p className="text-slate-400 text-sm max-w-xs">
                          Drag the sliders, pick your finish, then click <strong className="text-teal-400">Calculate</strong> for an instant project estimate.
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 text-xs text-slate-500 text-center">
                        <span className="flex items-center gap-2 justify-center"><span className="text-teal-400">✓</span> All finishes available</span>
                        <span className="flex items-center gap-2 justify-center"><span className="text-teal-400">✓</span> Includes surface prep</span>
                        <span className="flex items-center gap-2 justify-center"><span className="text-teal-400">✓</span> Free design consultation</span>
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

export default EpoxyCoverageCalculator;
