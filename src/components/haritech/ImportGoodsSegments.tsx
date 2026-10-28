import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor, Factory, Car, Home, Shirt, Pill, Utensils, Hammer, Stethoscope,
  Sun, Baby, Boxes, Package, Search, ShieldCheck, Clock, Ship, Plane,
  Calculator, Users, AlertTriangle, CheckCircle, ArrowRight, MessageCircle,
  LucideIcon,
} from 'lucide-react';
import { getImportationContent, getWhatsAppUrl } from '../../utils/haritechContent';
import type { GoodsSegment } from '../../utils/haritechContent';

/* ── Goods segment explorer ─────────────────────────────────────────────
   Importers rarely think in HS codes. They think "I am bringing in
   phones" or "I am bringing in tiles". This explorer turns that instinct
   into duty band, permit list, freight recommendation and a first
   landing point for the estimator and the pre-order pools.             */

const segmentIcons: Record<string, LucideIcon> = {
  Monitor, Factory, Car, Home, Shirt, Pill, Utensils, Hammer,
  Stethoscope, Sun, Baby, Boxes, Package, Ship, Plane,
};

const jumpTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const ImportGoodsSegments: React.FC = () => {
  const [segments, setSegments] = useState<GoodsSegment[]>(() => getImportationContent().segments);
  const [selectedId, setSelectedId] = useState<string>(() => getImportationContent().segments[0]?.id ?? '');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = () => setSegments(getImportationContent().segments);
    window.addEventListener('haritech-importation-updated', handler);
    return () => window.removeEventListener('haritech-importation-updated', handler);
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return segments;
    return segments.filter(s =>
      [s.name, s.tagline, s.notes, ...(s.examples ?? []), ...(s.permits ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [segments, query]);

  const active = visible.find(s => s.id === selectedId) ?? visible[0];

  const estimate = (seg: GoodsSegment) => {
    window.dispatchEvent(new CustomEvent('haritech-import-segment', { detail: seg.id }));
    jumpTo('import-estimator');
  };

  const talkToOfficer = (seg: GoodsSegment) =>
    getWhatsAppUrl(
      `Hello Haritech! I am importing ${seg.name.toLowerCase()} — ${seg.examples.slice(0, 2).join(', ')}.\n\n` +
        `Please confirm the duty band (${seg.dutyBand}), the permits I need and the best freight mode.`
    );

  return (
    <section id="import-segments" className="section-padding scroll-mt-24">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-sm font-semibold mb-4">
            <Boxes className="h-4 w-4" /> What are you importing?
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
            Pick Your <span className="text-cyan-400">Goods Segment</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Every category of goods imports differently — a different duty band, a different permit set,
            a different best route. Choose your segment and see exactly what applies before you commit.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
          {/* Segment picker */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="h-4 w-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search a product, e.g. laptops, tiles…"
                aria-label="Search goods segments"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/50 rounded-xl border border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                {visible.length} segment{visible.length === 1 ? '' : 's'}
              </span>
              {query && (
                <button onClick={() => setQuery('')} className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300">
                  Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 lg:max-h-[560px] lg:overflow-y-auto lg:pr-1">
              {visible.map(seg => {
                const Icon = segmentIcons[seg.icon] || Package;
                const isActive = active?.id === seg.id;
                return (
                  <button
                    key={seg.id}
                    onClick={() => setSelectedId(seg.id)}
                    aria-pressed={isActive}
                    className={`text-left w-full rounded-xl border p-3 transition-all flex items-center gap-3 ${
                      isActive
                        ? 'bg-cyan-500/10 border-cyan-400/50 shadow-lg shadow-cyan-950/30'
                        : 'bg-slate-950/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className={`w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br ${seg.color} p-2`}>
                      <Icon className="h-full w-full text-white" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {seg.name}
                      </span>
                      <span className="block text-[10px] text-slate-500 font-mono">duty {seg.dutyBand}</span>
                    </span>
                  </button>
                );
              })}
              {visible.length === 0 && (
                <div className="col-span-full rounded-xl border border-white/5 bg-slate-950/40 p-5 text-center">
                  <p className="text-xs text-slate-400 mb-3">No segment matches “{query}”.</p>
                  <a
                    href={getWhatsAppUrl(`Hello Haritech! I want to import ${query}. What duty band and permits apply?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    Ask about “{query}” →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Segment detail */}
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="card p-6 sm:p-8 bg-[#0e1326]/80 border-white/5"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${active.color} p-3.5`}>
                    {React.createElement(segmentIcons[active.icon] || Package, { className: 'h-full w-full text-white' })}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">{active.name}</h3>
                      {active.restricted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          <AlertTriangle className="h-3 w-3" /> Regulated
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{active.tagline}</p>
                  </div>
                </div>

                {active.examples?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {active.examples.map(ex => (
                      <span key={ex} className="px-2.5 py-1 rounded-full bg-slate-950/60 border border-white/10 text-[11px] text-slate-400">
                        {ex}
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Duty band', value: active.dutyBand, icon: Calculator },
                    { label: 'Best route', value: active.mode, icon: active.mode === 'Air' ? Plane : Ship },
                    { label: 'Typical timeline', value: active.leadTime, icon: Clock },
                    { label: 'Permits to hold', value: `${active.permits?.length ?? 0}`, icon: ShieldCheck },
                  ].map(tile => (
                    <div key={tile.label} className="rounded-xl bg-slate-950/50 border border-white/5 p-3">
                      <tile.icon className="h-3.5 w-3.5 text-cyan-400 mb-1.5" />
                      <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">{tile.label}</p>
                      <p className="text-xs font-bold text-white leading-snug">{tile.value}</p>
                    </div>
                  ))}
                </div>

                {active.permits?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Permits &amp; approvals we secure</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {active.permits.map(p => (
                        <li key={p} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {active.notes && (
                  <p className="text-xs text-slate-400 leading-relaxed border-l-2 border-cyan-500/50 pl-4 mb-6">
                    {active.notes}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 border-t border-white/5 pt-5">
                  <button onClick={() => estimate(active)} className="btn-primary text-xs py-3 px-5 justify-center">
                    <Calculator className="h-4 w-4" /> Estimate landed cost
                  </button>
                  <button onClick={() => jumpTo('import-preorder')} className="btn-secondary text-xs py-3 px-5 justify-center">
                    <Users className="h-4 w-4 text-cyan-400" /> Join a pre-order group
                  </button>
                  <a
                    href={talkToOfficer(active)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center justify-center gap-1.5 px-2 py-3"
                  >
                    <MessageCircle className="h-4 w-4" /> Talk to a trade officer <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ImportGoodsSegments;
