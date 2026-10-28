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
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 font-syne tracking-tight">
                Eight <span className="gradient-text">Service Divisions</span> Under One Business
              </h1>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Haritech Exclusive Business covers practical technology, digital support, printing and branding, importation consultation, 3D epoxy and interior décor, solar energy, project management and business consultation. Each division is explained on its own page, with the details and limits written plainly.
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
                Start with the problem you actually have — a laptop that needs sourcing, documents to print, goods to bring in, a floor to finish, power to plan or a project to coordinate. We explain what the work involves, what information we need from you, and what it will cost before anything starts.
              </p>
              <div className="mt-8">
                <Link to="/haritech/request-quote" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5">Describe Your Enquiry <ArrowRight className="h-4 w-4" /></Link>
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">Our <span className="gradient-text-pink">Divisions</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">What each part of the business handles, and what a customer can expect</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {expertiseAreas.map((area, i) => {
              const Icon = iconMap[area.icon] || Code2;
              return (
                <FadeInView key={area.title} delay={i * 0.03}>
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4">Not Sure Which Division Fits?</h2>
              <p className="text-lg text-slate-300 mb-8">Describe the need and we will point you to the right service — or say plainly if it is outside what we can do.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/haritech/request-quote" className="btn-primary text-base px-10 py-4">Make an Enquiry</Link>
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
