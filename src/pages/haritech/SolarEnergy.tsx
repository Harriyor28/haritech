import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sun, Zap, Battery, Cpu, Shield, Star, TrendingUp, Home, Building2, Factory, Warehouse, TreePine, Smartphone, Headphones, Award, Settings, Wrench, Gauge, Droplets, LucideIcon } from 'lucide-react';
import { getWhatsAppUrl, getSolarContent } from '../../utils/haritechContent';
import SolarSavingsCalculator from '../../components/haritech/SolarSavingsCalculator';

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
    return () => window.removeEventListener('haritech-solar-updated', handler);
  }, []);

  const { services: solarServices, whySolar, applications, stats } = solar;
  const processSteps = [
    { step: '01', title: 'Enquiry & Load List', desc: 'You list the appliances you run, for how long, and what must stay on during an outage.' },
    { step: '02', title: 'Assessment', desc: 'The load is totalled and your backup priorities are agreed in writing.' },
    { step: '03', title: 'Options & Budget', desc: 'System options are compared, with costs and the assumptions behind them stated.' },
    { step: '04', title: 'Sourcing', desc: 'Equipment specifications are reviewed before any purchase is made.' },
    { step: '05', title: 'Installation Coordination', desc: 'Where installation is needed, it is coordinated with qualified installers and responsibilities are agreed up front.' },
    { step: '06', title: 'Handover & Checks', desc: 'The installed system is checked and basic operating and maintenance guidance is given.' },
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/15 text-slate-200 text-xs font-mono font-medium mb-8">
                <Sun className="h-4 w-4 text-amber-400" /> Solar Energy Solutions
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight font-syne">
                Solar Energy <span className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">Consultation & Guidance</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed font-normal">
                We start with what you actually want to power: the appliances, how long you need them to run, and your budget. From there we help you understand the size of system that would suit it, compare equipment options, and coordinate installation \u2014 and we say plainly when something falls outside what we can support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/haritech/request-quote" className="btn-primary text-xs sm:text-sm px-6 py-3"><Zap className="h-4 w-4" /> Get Solar Quote</Link>
                <a href={getWhatsAppUrl('Hello Haritech, I would like to discuss a solar energy requirement.')} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs sm:text-sm px-6 py-3"><Sun className="h-4 w-4 text-slate-300" /> Discuss Your Requirement</a>
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
                  <Icon className="h-5 w-5 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1 font-mono">{s.value}</div>
                  <div className="text-xs text-slate-400 font-medium">{s.label}</div>
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">What We <span className="text-yellow-400">Help With</span></h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">Sizing, equipment guidance and installation coordination — with the limits of each stage stated.</p>
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">What Solar <span className="text-yellow-400">Can and Cannot Do</span></h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">Realistic expectations, including the costs and maintenance that come with a system.</p>
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Typical <span className="text-yellow-400">Use Cases</span></h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">Where a solar assessment usually starts — nothing here is a claim of completed installations.</p>
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">How an Enquiry <span className="text-yellow-400">Proceeds</span></h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">Each step is confirmed before the next one begins.</p>
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

      {/* Solar Savings Calculator */}
      <SolarSavingsCalculator />

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 via-orange-600/10 to-amber-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.1)_0%,transparent_70%)]" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <FadeInView>
            <Sun className="h-10 w-10 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 font-syne tracking-tight">Start With Your Load List</h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Send the appliances you run and what must stay on during an outage. We will come back with an indicative size range, equipment options and the assumptions behind the numbers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/haritech/request-quote" className="btn-primary text-xs sm:text-sm px-7 py-3.5 bg-gradient-to-r from-yellow-500 to-orange-600 shadow-lg shadow-yellow-500/20"><Zap className="h-4 w-4" /> Send Your Load List</Link>
              <a href={getWhatsAppUrl('Hello Haritech, I would like to discuss a solar energy requirement.')} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs sm:text-sm px-7 py-3.5"><Sun className="h-4 w-4 text-yellow-400" /> Ask a Question</a>
            </div>
          </FadeInView>
        </div>
      </section>
    </div>
  );
};

export default SolarEnergy;
