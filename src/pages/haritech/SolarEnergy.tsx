import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sun, Zap, Battery, Cpu, Shield, Star, TrendingUp, Home, Building2, Factory, Warehouse, TreePine, Smartphone, Headphones, Award, Settings, Wrench, Gauge, Droplets, LucideIcon } from 'lucide-react';
import { getWhatsAppUrl, getSolarContent } from '../../utils/haritechContent';

const iconMap: Record<string, LucideIcon> = {
  Sun, Zap, Battery, Cpu, Shield, Star, TrendingUp, Home, Building2, Factory, Warehouse,
  TreePine, Smartphone, Headphones, Award, Settings, Wrench, Gauge, Droplets,
};

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const SolarEnergy: React.FC = () => {
  const [solar, setSolar] = useState(() => getSolarContent());

  useEffect(() => {
    const handler = () => setSolar(getSolarContent());
    window.addEventListener('haritech-solar-updated', handler);
    // WhatsApp CTAs read haritech-content — re-render when it changes
    window.addEventListener('haritech-content-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('haritech-solar-updated', handler);
      window.removeEventListener('haritech-content-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const { services: solarServices, whySolar, applications, stats } = solar;
  const processSteps = [
    { step: '01', title: 'Consultation & Assessment', desc: 'We evaluate your energy needs, property, and goals.' },
    { step: '02', title: 'System Design', desc: 'Our engineers design a customized solar system for you.' },
    { step: '03', title: 'Proposal & Approval', desc: 'Receive a detailed proposal with costs and ROI projections.' },
    { step: '04', title: 'Installation', desc: 'Professional installation by certified solar technicians.' },
    { step: '05', title: 'Testing & Commissioning', desc: 'Thorough testing to ensure optimal performance.' },
    { step: '06', title: 'Monitoring & Support', desc: 'Ongoing monitoring and maintenance for peak efficiency.' },
  ];

  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-yellow-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-orange-500/10 blur-[150px] pointer-events-none" />

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center pt-20 pb-16 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <FadeInView>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium mb-8">
                <Sun className="h-4 w-4" /> Solar Energy Solutions
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight font-poppins">
                Power Your World with <span className="text-yellow-400">Clean Solar Energy</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
                From residential rooftops to industrial solar farms — Haritech provides end-to-end solar energy solutions that cut costs, ensure energy independence, and protect the environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/haritech/request-quote" className="btn-primary text-base px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/45"><Zap className="h-5 w-5" /> Get Solar Quote</Link>
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="btn-secondary text-base px-8 py-4"><Sun className="h-5 w-5 text-yellow-400" /> Free Consultation</a>
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
              const Icon = iconMap[s.icon] || Sun;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                  <Icon className="h-6 w-6 text-yellow-400 mx-auto mb-3" />
                  <div className="text-3xl md:text-4xl font-black text-white mb-1 font-poppins">{s.value}</div>
                  <div className="text-sm text-slate-500 font-medium">{s.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Our Solar <span className="text-yellow-400">Services</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Comprehensive solar energy solutions tailored to your needs.</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {solarServices.map((svc, i) => {
              const Icon = iconMap[svc.icon] || Sun;
              return (
                <FadeInView key={svc.title} delay={i * 0.05}>
                  <div className="card p-6 h-full hover:bg-[#141b35] transition-all group glow-border">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${svc.color} p-2.5 mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-full w-full text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">{svc.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{svc.desc}</p>
                  </div>
                </FadeInView>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Solar */}
      <section className="section-padding bg-slate-950/20">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Why Go <span className="text-yellow-400">Solar?</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">The benefits of switching to solar energy extend far beyond cost savings.</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whySolar.map((item, i) => {
              const Icon = iconMap[item.icon] || Sun;
              return (
                <FadeInView key={item.title} delay={i * 0.05}>
                  <div className="card p-5 h-full hover:bg-[#141b35] transition-all group glow-border">
                    <Icon className="h-8 w-8 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </FadeInView>
              );
            })}
          </div>
        </div>
      </section>

      {/* Applications */}
      <section className="section-padding">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Solar Applications <span className="text-yellow-400">We Serve</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Solar solutions for every sector and application.</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app, i) => {
              const Icon = iconMap[app.icon] || Sun;
              return (
                <FadeInView key={app.title} delay={i * 0.08}>
                  <div className="card p-6 h-full flex items-start gap-4 hover:bg-[#141b35] transition-all glow-border">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 p-2.5 shrink-0">
                      <Icon className="h-full w-full text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">{app.title}</h3>
                      <p className="text-sm text-slate-400">{app.desc}</p>
                    </div>
                  </div>
                </FadeInView>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-slate-950/20">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Our <span className="text-yellow-400">Process</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">From consultation to commissioning — we handle everything.</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {processSteps.map((step, i) => (
              <FadeInView key={step.step} delay={i * 0.08}>
                <div className="card p-6 h-full text-center hover:bg-[#141b35] transition-all glow-border">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">{step.step}</div>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.desc}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 via-orange-600/10 to-amber-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.1)_0%,transparent_70%)]" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <FadeInView>
            <Sun className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 font-poppins">Ready to Harness the Power of the Sun?</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Take control of your energy future. Contact Haritech today for a free consultation and customized solar solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link to="/haritech/request-quote" className="btn-primary text-lg px-12 py-5 bg-gradient-to-r from-yellow-500 to-orange-600 shadow-lg shadow-yellow-500/20"><Zap className="h-6 w-6" /> Get a Free Quote</Link>
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="btn-secondary text-lg px-12 py-5"><Sun className="h-5 w-5 text-yellow-400" /> Speak to an Expert</a>
            </div>
          </FadeInView>
        </div>
      </section>
    </div>
  );
};

export default SolarEnergy;
