import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Paintbrush, Droplets, Gem, Sofa, Brush, Wrench, Layers, Ruler, Hammer, Camera, Waves, Gauge, Sparkles, CheckCircle, ArrowRight, MessageCircle, ChevronLeft, ChevronRight, X, Maximize2, Palette, Home, Building2, Star, Shield, Zap, Eye, Fan, Flame, Truck, LucideIcon } from 'lucide-react';
import { getWhatsAppUrl, getEpoxyContent, EpoxyContent } from '../../utils/haritechContent';
import EpoxyCoverageCalculator from '../../components/haritech/EpoxyCoverageCalculator';
import Epoxy3DRoomStudio from '../../components/haritech/Epoxy3DRoomStudio';
import Interior3DRoomStudio from '../../components/haritech/Interior3DRoomStudio';
import Interactive3DTiltCard from '../../components/haritech/Interactive3DTiltCard';

/* ── 3D Epoxy & Interior Home Decoration ──────────────────────────────────
   Signature identity within the Haritech site: deep resin teal → violet
   gloss. Structure mirrors the Solar / CAC service pages, with twin 3D
   studios (epoxy surfaces + interior décor) and a work-example gallery.   */

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const ACCENT = 'text-teal-300';

/* Content (hero, gallery, offers, process, benefits) is admin-editable via
   the 3D Epoxy manager in the Admin Dashboard — stored under
   localStorage key `haritech-epoxy` and synced to the cloud.          */

const iconMap: Record<string, LucideIcon> = {
  Waves, Gem, Sofa, Brush, Layers, Wrench, Camera, Ruler, Droplets,
  Paintbrush, Hammer, Sparkles, Gauge, Palette, Home, Building2, Star,
  Shield, Zap, Eye, Fan, Flame, Truck,
};

const ThreeDEpoxy: React.FC = () => {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [epoxy, setEpoxy] = useState<EpoxyContent>(() => getEpoxyContent());

  useEffect(() => {
    const handler = () => setEpoxy(getEpoxyContent());
    window.addEventListener('haritech-epoxy-updated', handler);
    return () => window.removeEventListener('haritech-epoxy-updated', handler);
  }, []);

  const works = epoxy.works;
  const hero = epoxy.hero;

  const close = useCallback(() => setLightbox(null), []);
  const move = useCallback((dir: number) => {
    setLightbox(prev => {
      if (prev === null || works.length === 0) return prev;
      return (prev + dir + works.length) % works.length;
    });
  }, [works.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, close, move]);

  const active = lightbox === null ? null : works[lightbox] ?? null;

  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-violet-500/10 blur-[150px] pointer-events-none" />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInView>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/15 text-slate-200 text-xs font-mono font-medium mb-6">
                <Paintbrush className="h-4 w-4 text-teal-400" /> {hero.badge}
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 font-syne tracking-tight">
                {hero.title}<span className="bg-gradient-to-r from-white via-slate-100 to-teal-300 bg-clip-text text-transparent">{hero.accent}</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
                {hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/haritech/request-quote" className="btn-primary text-xs sm:text-sm px-6 py-3"><Sparkles className="h-4 w-4" /> Get an Epoxy Quote</Link>
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs sm:text-sm px-6 py-3"><MessageCircle className="h-4 w-4 text-slate-300" /> Discuss Your Space</a>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Interactive 3D Virtual Showroom Studio */}
      <section className="py-12 relative">
        <div className="container mx-auto px-6">
          <FadeInView>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-mono font-bold mb-3">
                <Sparkles className="h-3.5 w-3.5" /> INTERIOR PALETTE STUDIO
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Try <span className={ACCENT}>Finishes</span> Before You Commit
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto mt-2 text-xs sm:text-sm">
                Preview palette combinations for a room and use them as a starting point for a conversation. Palettes are illustrative — site conditions decide what can actually be installed.
              </p>
            </div>
          </FadeInView>
          <FadeInView delay={0.1}>
            <Epoxy3DRoomStudio />
          </FadeInView>
        </div>
      </section>

      {/* Interactive 3D Interior Decoration Studio */}
      <section className="py-12 relative">
        <div className="container mx-auto px-6">
          <FadeInView>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-mono font-bold mb-3">
                <Sofa className="h-3.5 w-3.5" /> COMPLETE INTERIOR HOME DECORATION
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Style Your <span className="text-cyan-300">Whole Interior</span> Around Your Floor
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto mt-2 text-xs sm:text-sm">
                Full-space decoration — furniture, wall finishes, lighting and soft décor — designed to follow the same 3D epoxy floor. Pick a style and preview it live.
              </p>
            </div>
          </FadeInView>
          <FadeInView delay={0.1}>
            <Interior3DRoomStudio />
          </FadeInView>
        </div>
      </section>

      {/* Work Examples — gallery with Interactive 3D Tilt */}
      <section className="section-padding bg-slate-950/20 border-y border-white/5">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Recent <span className={ACCENT}>Work Examples</span></h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">A selection of finished floors, walls and spaces. Hover to feel the 3D resin depth and specular gloss reflection.</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {works.length === 0 && (
              <p className="text-slate-500 text-sm col-span-full text-center py-8">Work examples coming soon — check back shortly.</p>
            )}
            {works.map((w, i) => (
              <FadeInView key={`${w.img}-${i}`} delay={(i % 3) * 0.06}>
                <Interactive3DTiltCard
                  className={`w-full ${i === 0 ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2' : ''}`}
                  onClick={() => setLightbox(i)}
                >
                  <div className="relative w-full h-full overflow-hidden rounded-2xl border border-white/10 text-left group">
                    <img
                      src={w.img}
                      alt={w.title}
                      loading="lazy"
                      className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${i === 0 ? 'h-64 lg:h-full min-h-[16rem]' : 'h-56'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />
                    
                    {/* Popping 3D Text Badge */}
                    <div
                      style={{ transform: 'translateZ(30px)' }}
                      className="absolute inset-x-0 bottom-0 p-5 pointer-events-none transition-transform duration-300"
                    >
                      <span className="inline-block text-[10px] tracking-widest uppercase font-mono font-bold text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded border border-teal-500/30 mb-2">
                        {w.tag}
                      </span>
                      <h3 className="text-white text-lg font-black drop-shadow-md">{w.title}</h3>
                    </div>

                    <span
                      style={{ transform: 'translateZ(25px)' }}
                      className="absolute top-3.5 right-3.5 p-2 rounded-xl bg-black/60 border border-white/15 text-teal-300 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </span>
                  </div>
                </Interactive3DTiltCard>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={close}
          >
            <button onClick={close} className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); move(-1); }} className="absolute left-3 md:left-6 p-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-teal-300 transition-colors" aria-label="Previous">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); move(1); }} className="absolute right-3 md:right-6 p-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-teal-300 transition-colors" aria-label="Next">
              <ChevronRight className="h-5 w-5" />
            </button>
            <motion.div
              key={active.img}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-[#0b1120] border border-white/10 rounded-2xl overflow-hidden"
            >
              <img src={active.img} alt={active.title} className="w-full max-h-[55vh] object-cover" />
              <div className="p-6">
                <span className="inline-block text-[10px] tracking-widest uppercase text-teal-300 mb-2">{active.tag}</span>
                <h3 className="text-xl font-bold text-white mb-2">{active.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">{active.detail}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/haritech/request-quote" onClick={close} className="btn-primary text-xs py-2.5 px-5 rounded-lg bg-gradient-to-r from-teal-500 to-violet-600 justify-center">Request This Look</Link>
                  <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" onClick={close} className="btn-secondary text-xs py-2.5 px-5 rounded-lg justify-center">Ask About It <ArrowRight className="h-3.5 w-3.5 text-teal-300" /></a>
                </div>
              </div>
              <div className="px-6 pb-5 text-xs text-slate-600">Project {((lightbox ?? 0) + 1)} of {works.length} — use ← → keys to browse</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* What we offer */}
      <section className="section-padding">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">What We <span className={ACCENT}>Pour</span></h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">Six resin services — from a single feature table to a full commercial floor.</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {epoxy.offers.map((o, i) => {
              const OfferIcon = iconMap[o.icon] || Sparkles;
              return (
              <FadeInView key={`${o.title}-${i}`} delay={i * 0.05}>
                <div className="card p-6 h-full hover:bg-[#141b35] transition-all group glow-border">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-violet-600 p-2.5 mb-4 group-hover:scale-110 transition-transform">
                    <OfferIcon className="h-full w-full text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">{o.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{o.desc}</p>
                  <ul className="space-y-1.5">
                    {(o.features ?? []).map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle className="h-3 w-3 text-teal-400 shrink-0" />{f}</li>
                    ))}
                  </ul>
                </div>
              </FadeInView>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-slate-950/20 border-y border-white/5">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">How We <span className={ACCENT}>Pour</span></h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">Every project follows the same disciplined six-step system.</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {epoxy.process.map((s, i) => {
              const StepIcon = iconMap[s.icon] || Sparkles;
              return (
              <FadeInView key={`${s.title}-${i}`} delay={i * 0.05}>
                <div className="relative card p-6 h-full">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center shrink-0">
                      <StepIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-3xl font-black text-white/10 font-poppins">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </FadeInView>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why epoxy */}
      <section className="section-padding">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">What to <span className={ACCENT}>Expect</span></h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">Performance depends on the resin system, the substrate and how the floor is prepared — these are the practical points to weigh.</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {epoxy.qualities.map((q, i) => {
              const QualityIcon = iconMap[q.icon] || Sparkles;
              return (
              <FadeInView key={`${q.title}-${i}`} delay={i * 0.07}>
                <div className="card p-6 h-full text-center hover:bg-[#141b35] transition-all group">
                  <QualityIcon className="h-8 w-8 text-teal-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-base font-bold text-white mb-2">{q.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{q.desc}</p>
                </div>
              </FadeInView>
              );
            })}
          </div>
        </div>
      </section>

      {/* Epoxy Coverage & Cost Calculator */}
      <EpoxyCoverageCalculator />

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 via-cyan/10 to-violet-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.1)_0%,transparent_70%)]" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <FadeInView>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 font-syne tracking-tight">Send a Photo of <span className="bg-gradient-to-r from-teal-300 to-violet-400 bg-clip-text text-transparent">Your Space</span></h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              A photo, the room size and how the space is used are enough for a first conversation. We will say whether a resin finish suits the surface before quoting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/haritech/request-quote" className="btn-primary text-xs sm:text-sm px-7 py-3.5 bg-gradient-to-r from-teal-500 to-violet-600 shadow-lg shadow-teal-500/20"><Sparkles className="h-4 w-4" /> Request a Quotation</Link>
              <a href={getWhatsAppUrl('Hello Haritech, I would like to discuss an epoxy floor or interior décor project.')} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs sm:text-sm px-7 py-3.5"><MessageCircle className="h-4 w-4 text-teal-300" /> Send the Details</a>
            </div>
          </FadeInView>
        </div>
      </section>
    </div>
  );
};

export default ThreeDEpoxy;
