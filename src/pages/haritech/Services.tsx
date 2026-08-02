import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Code2, Palette, Megaphone, Briefcase, ArrowRight, CheckCircle, Zap, ChevronDown, Monitor, PaintBucket, BarChart3, Server } from 'lucide-react';
import { getServiceCategories } from '../../utils/haritechContent';
import type { ServiceCategory } from '../../utils/haritechContent';

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const iconMap: Record<string, React.FC<any>> = { Code2, Palette, Megaphone, Briefcase, Monitor, PaintBucket, BarChart3, Server };

const Services: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>(() => getServiceCategories());
  const [activeCategory, setActiveCategory] = useState('web');
  const [expandedService, setExpandedService] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setCategories(getServiceCategories());
    window.addEventListener('haritech-services-updated', handler);
    return () => window.removeEventListener('haritech-services-updated', handler);
  }, []);

  const activeCat = categories.find(c => c.id === activeCategory) || categories[0];

  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInView>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
                <Code2 className="h-4 w-4" /> Our Services
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 font-poppins">
                Everything You Need to <span className="gradient-text">Succeed Online</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                From web development to branding, marketing, and IT solutions — we offer a complete ecosystem of digital services under one roof.
              </p>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="section-padding pt-0">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.map(cat => (
              <motion.button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  activeCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-lg`
                    : 'bg-[#0e1326]/50 text-slate-400 border-white/5 hover:border-slate-500/35 hover:text-white'
                }`}
              >
                {React.createElement(iconMap[cat.icon] || Code2, { className: 'h-4 w-4' })}
                {cat.label}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCat.services.map((svc, i) => (
                  <FadeInView key={svc.name} delay={i * 0.05}>
                    <div className="card p-6 h-full hover:bg-[#141b35] transition-all group glow-border">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeCat.color} p-2 shrink-0`}>
                          <Code2 className="h-full w-full text-white" />
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">{svc.name}</h3>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed mb-4">{svc.desc}</p>
                      <button
                        onClick={() => setExpandedService(expandedService === svc.name ? null : svc.name)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                      >
                        {expandedService === svc.name ? 'Show Less' : 'View Details'} <ChevronDown className={`h-3 w-3 transition-transform ${expandedService === svc.name ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {expandedService === svc.name && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="pt-4 mt-4 border-t border-white/5 space-y-3">
                              <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Features</h4>
                                <div className="space-y-1.5">
                                  {(svc.features?.length ? svc.features : ['Responsive Design', 'SEO Optimized']).map((f: string) => (
                                    <div key={f} className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle className="h-3 w-3 text-cyan-400 shrink-0" />{f}</div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Benefits</h4>
                                <div className="space-y-1.5">
                                  {(svc.benefits?.length ? svc.benefits : ['Increased Visibility', 'Higher Engagement']).map((b: string) => (
                                    <div key={b} className="flex items-center gap-2 text-xs text-slate-400"><CheckCircle className="h-3 w-3 text-green-400 shrink-0" />{b}</div>
                                  ))}
                                </div>
                              </div>
                              <Link to="/haritech/request-quote" className="btn-primary text-xs py-2 px-4 rounded-lg w-full justify-center mt-2">Request a Quote</Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </FadeInView>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden bg-slate-950/30">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/10 to-purple-600/20" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <FadeInView>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Not Sure Which Service You Need?</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">Contact us today and our experts will help you find the perfect solution for your business.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/haritech/request-quote" className="btn-primary text-base px-10 py-4"><Zap className="h-5 w-5" /> Get a Free Consultation</Link>
              <Link to="/haritech/contact" className="btn-secondary text-base px-10 py-4">Contact Us <ArrowRight className="h-4 w-4 text-cyan-400" /></Link>
            </div>
          </FadeInView>
        </div>
      </section>
    </div>
  );
};

export default Services;
