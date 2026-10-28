import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Ship, Plane, Package, Truck, Globe, FileText, Landmark, Search,
  ShieldCheck, Warehouse, BadgeCheck, Clock, Anchor, ChevronDown,
  CheckCircle, Zap, Boxes, Scale, Receipt, LucideIcon,
} from 'lucide-react';
import { getWhatsAppUrl, getImportationContent } from '../../utils/haritechContent';
import ImportLandedCostEstimator from '../../components/haritech/ImportLandedCostEstimator';
import ImportGoodsSegments from '../../components/haritech/ImportGoodsSegments';
import ImportPreOrderGroups from '../../components/haritech/ImportPreOrderGroups';

/* Importation & Freight Forwarding — Haritech's trade division.
   Dark glass identity shared with the Solar page, tuned to a
   cyan/teal logistics palette.                                        */

const iconMap: Record<string, LucideIcon> = {
  Ship, Plane, Package, Truck, Globe, FileText, Landmark, Search,
  ClipboardCheck: ShieldCheck, ShieldCheck, Warehouse, BadgeCheck, Clock,
  Anchor, Boxes, Scale, Receipt, Zap,
};

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const LANES = [
  'China → Lagos (Apapa/Tin Can)',
  'UAE → Onne',
  'Europe → Lagos',
  'USA → Lagos',
  'India → Calabar',
  'Turkey → Tin Can',
  'Air freight → MMIA',
];

const Importation: React.FC = () => {
  const [content, setContent] = useState(() => getImportationContent());
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handler = () => setContent(getImportationContent());
    window.addEventListener('haritech-importation-updated', handler);
    return () => window.removeEventListener('haritech-importation-updated', handler);
  }, []);

  const { services, process, requirements, stats, faqs } = content;

  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-teal-500/10 blur-[150px] pointer-events-none" />

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center pt-20 pb-16 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <FadeInView>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/15 text-slate-200 text-xs font-mono font-medium mb-8">
                <Ship className="h-4 w-4 text-cyan-400" /> Importation Consultation
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight font-syne">
                Plan the Import <span className="text-white drop-shadow-[0_0_25px_rgba(6,182,212,0.35)]">Before You Pay</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed font-normal">
                Guidance for Nigerian importers — what a supplier quotation should state, which documents the goods
                will need, how freight and duty add to the factory price, and where the risks sit. Final cost and
                timing depend on the supplier, rates and clearance at the time of import.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/haritech/request-quote" className="btn-primary text-xs sm:text-sm px-6 py-3"><Zap className="h-4 w-4" /> Start an Importation</Link>
                <a href="#import-preorder" className="btn-secondary text-xs sm:text-sm px-6 py-3"><Package className="h-4 w-4 text-cyan-400" /> Join a Pre-order Group</a>
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs sm:text-sm px-6 py-3"><Ship className="h-4 w-4 text-slate-300" /> Free Trade Consultation</a>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-mono text-slate-500">
                <a href="#import-segments" className="hover:text-cyan-300 transition-colors">Goods segments →</a>
                <a href="#import-estimator" className="hover:text-cyan-300 transition-colors">Landed-cost calculator →</a>
                <a href="#import-preorder" className="hover:text-cyan-300 transition-colors">Shared shipments →</a>
              </div>
            </FadeInView>

            <FadeInView delay={0.15}>
              <div className="mt-10 flex flex-wrap justify-center gap-2">
                {LANES.map(lane => (
                  <span key={lane} className="px-3 py-1.5 rounded-full bg-slate-950/60 border border-white/10 text-[11px] font-mono text-slate-400">
                    {lane}
                  </span>
                ))}
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-950/20 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => {
              const Icon = iconMap[s.icon] || Package;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                  <Icon className="h-5 w-5 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1 font-mono">{s.value}</div>
                  <div className="text-xs text-slate-400 font-medium">{s.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What are you importing? — goods segments */}
      <ImportGoodsSegments />

      {/* Services */}
      <section className="section-padding bg-slate-950/20 border-y border-white/5">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Complete Importation <span className="text-cyan-400">Services</span></h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">Every stage of the import chain — sourced, documented, shipped, cleared and delivered.</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => {
              const Icon = iconMap[svc.icon] || Package;
              return (
                <FadeInView key={svc.title} delay={i * 0.05}>
                  <div className="card p-6 h-full hover:bg-[#141b35] transition-all group glow-border">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${svc.color} p-2.5 mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-full w-full text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{svc.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">{svc.desc}</p>
                    {svc.features?.length > 0 && (
                      <ul className="space-y-1.5 border-t border-white/5 pt-3">
                        {svc.features.map(f => (
                          <li key={f} className="flex items-start gap-2 text-xs text-slate-400">
                            <CheckCircle className="h-3 w-3 text-cyan-400 shrink-0 mt-0.5" /> {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </FadeInView>
              );
            })}
          </div>
        </div>
      </section>

      {/* The complete importation setup process */}
      <section className="section-padding">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">The Complete Importation <span className="text-cyan-400">Setup Process</span></h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
                Seven managed phases from first quotation to audit-ready records — with a timeline at every milestone.
              </p>
            </div>
          </FadeInView>

          <div className="max-w-4xl mx-auto">
            {process.map((step, i) => (
              <FadeInView key={step.title} delay={i * 0.06}>
                <div className="flex gap-5 sm:gap-7">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold font-mono text-sm ring-4 ring-cyan-500/10">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    {i < process.length - 1 && <div className="w-px flex-1 bg-gradient-to-b from-cyan-500/50 to-white/5 min-h-[1.5rem]" />}
                  </div>
                  <div className="pb-10 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1.5">
                      <h3 className="text-lg font-bold text-white">{step.title}</h3>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                        <Clock className="h-3 w-3" /> {step.duration}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">{step.desc}</p>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements & compliance */}
      <section className="section-padding">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Importation Setup <span className="text-cyan-400">Checklist</span></h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
                What you need in place before your first consignment moves — we handle every item on this list for you.
              </p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {requirements.map((group, i) => (
              <FadeInView key={group.title} delay={i * 0.08}>
                <div className="card p-6 h-full hover:bg-[#141b35] transition-all glow-border">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 p-2.5 mb-4">
                    {i === 0 ? <Scale className="h-full w-full text-white" /> : i === 1 ? <ShieldCheck className="h-full w-full text-white" /> : <FileText className="h-full w-full text-white" />}
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">{group.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{group.desc}</p>
                  <ul className="space-y-2 border-t border-white/5 pt-3">
                    {group.items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeInView>
            ))}
          </div>

          {/* What we take off your desk */}
          <FadeInView>
            <div className="mt-10 card p-6 sm:p-8 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 border-cyan-500/20">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Warehouse className="h-5 w-5 text-cyan-400" /> Storage, warehousing &amp; distribution
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    If goods are cleared but not ready for collection, storage and release can be arranged and
                    discussed per consignment. Delivery arrangements, charges and responsibility are confirmed
                    in writing before goods move.
                  </p>
                </div>
                <a href={getWhatsAppUrl('Hello! I would like to discuss importation, clearing and warehousing.')} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-3 px-6 shrink-0 justify-center">
                  <Boxes className="h-4 w-4" /> Discuss Storage
                </a>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Landed-cost estimator */}
      <div className="bg-slate-950/20 border-y border-white/5">
        <ImportLandedCostEstimator />
      </div>

      {/* Pre-order pools */}
      <ImportPreOrderGroups />

      {/* FAQ */}
      <section className="section-padding">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Importation <span className="text-cyan-400">Questions</span></h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">Straight answers on duty, timelines, permits and port logistics.</p>
            </div>
          </FadeInView>
          <div className="max-w-3xl mx-auto border-t border-white/10">
            {faqs.map((faq, i) => (
              <FadeInView key={i} delay={i * 0.04}>
                <div className="border-b border-white/10">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full py-5 flex items-center justify-between text-left gap-6 group"
                  >
                    <span className="text-sm sm:text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-cyan-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="pb-5 pr-6">
                          <p className="text-sm text-slate-400 leading-relaxed border-l-2 border-cyan-500/50 pl-4">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-teal-600/10 to-blue-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <FadeInView>
            <Ship className="h-10 w-10 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 font-syne tracking-tight">Send Your Supplier Quote</h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Send the supplier quotation or product list. We will explain what the landed cost is likely to include,
              which documents the goods usually need, and what to confirm with the supplier before paying a deposit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/haritech/request-quote" className="btn-primary text-xs sm:text-sm px-7 py-3.5">              <Zap className="h-4 w-4" /> Request Import Guidance</Link>
              <a href={getWhatsAppUrl('Hello! I would like to discuss an importation enquiry with Haritech.')} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs sm:text-sm px-7 py-3.5">
                <Receipt className="h-4 w-4 text-cyan-400" /> Send a Supplier Quote
              </a>
            </div>
            <p className="mt-6 text-[11px] font-mono text-slate-500 flex items-center justify-center gap-2">
              <Landmark className="h-3.5 w-3.5" /> Guidance only — not a clearing agent
              <Anchor className="h-3.5 w-3.5" /> Ports and routes discussed per consignment
            </p>
          </FadeInView>
        </div>
      </section>
    </div>
  );
};

export default Importation;
