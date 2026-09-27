import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, Code2, ShoppingCart, Layout, Monitor, BookOpen, Building2, Hotel, Utensils, Home, Zap, Cpu, Smartphone, Palette, Search, Settings, Shield, Globe2, Server, Mail, Headphones, Briefcase, ArrowRight, Sparkles, Layers, LucideIcon } from 'lucide-react';
import { getWhatWeDoAreas } from '../../utils/haritechContent';

const iconMap: Record<string, LucideIcon> = {
  Globe, Code2, ShoppingCart, Layout, Monitor, BookOpen, Building2, Hotel, Utensils, Home,
  Zap, Cpu, Smartphone, Palette, Search, Settings, Shield, Globe2, Server, Mail,
  Headphones, Briefcase, Sparkles, Layers,
};

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const WhatWeDo: React.FC = () => {
  const [expertiseAreas, setExpertiseAreas] = useState(() => getWhatWeDoAreas());

  useEffect(() => {
    const handler = () => setExpertiseAreas(getWhatWeDoAreas());
    window.addEventListener('haritech-whatwedo-updated', handler);
    return () => window.removeEventListener('haritech-whatwedo-updated', handler);
  }, []);

  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInView>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                <Globe className="h-4 w-4" /> What We Do
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 font-poppins">
                Comprehensive <span className="gradient-text">Digital Solutions</span> for Modern Businesses
              </h1>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                At Haritech Exclusive Services, we help businesses establish, grow, and manage their digital presence by providing professional, end-to-end technology solutions tailored to your unique needs.
              </p>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="section-padding bg-slate-950/20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInView>
              <p className="text-xl text-slate-300 leading-relaxed">
                From concept to launch and beyond — we provide everything you need to build a powerful digital presence. Our team of skilled designers, developers, and strategists work collaboratively to deliver solutions that not only look great but drive measurable results.
              </p>
              <div className="mt-8">
                <Link to="/haritech/request-quote" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5">Start Your Project <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Expertise Grid */}
      <section className="section-padding">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Our <span className="gradient-text-pink">Expertise</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">{expertiseAreas.length} specialized areas of digital excellence</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {expertiseAreas.map((area, i) => {
              const Icon = iconMap[area.icon] || Code2;
              return (
                <FadeInView key={`${area.title}-${i}`} delay={i * 0.03}>
                  <div className="card p-5 h-full hover:bg-[#141b35] transition-all group glow-border">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${area.color} p-2 mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-full w-full text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">{area.title}</h3>
                    <p className="text-xs text-slate-400">{area.desc}</p>
                  </div>
                </FadeInView>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden bg-slate-950/30">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/10 to-purple-600/20" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <FadeInView>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Need a Specific Solution?</h2>
              <p className="text-lg text-slate-300 mb-8">We tailor every project to your unique requirements. Let's discuss how we can help.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/haritech/request-quote" className="btn-primary text-base px-10 py-4">Request a Quote</Link>
                <Link to="/haritech/services" className="btn-secondary text-base px-10 py-4">View All Services <ArrowRight className="h-4 w-4 text-cyan-400" /></Link>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhatWeDo;
