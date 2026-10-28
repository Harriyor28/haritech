import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Building2, Rocket, Briefcase, Utensils, Hotel, BookOpen, Church, Heart, Shirt, Sprout, Factory, Users as UsersIcon, Landmark, Home, Globe, ArrowRight, Zap, Building } from 'lucide-react';
import { getIndustries, IndustryCard } from '../../utils/haritechContent';

const iconMap: Record<string, React.FC<any>> = { Building2, Rocket, Briefcase, Utensils, Hotel, BookOpen, Church, Heart, Shirt, Sprout, Factory, Users: UsersIcon, Landmark, Home, Building, Globe };

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const Industries: React.FC = () => {
  const [industries, setIndustries] = useState<IndustryCard[]>(() => getIndustries());
  useEffect(() => {
    const handler = () => setIndustries(getIndustries());
    window.addEventListener('haritech-industries-updated', handler);
    return () => window.removeEventListener('haritech-industries-updated', handler);
  }, []);
  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />

      <section className="relative pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInView>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
                <Globe className="h-4 w-4" /> Who We Work With
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 font-syne tracking-tight">
                The Customers Each <span className="gradient-text">Division</span> Serves
              </h1>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Haritech is a small multi-service business, so these are the customer groups its services are built for — not a claim of large corporate accounts or industry partnerships.
              </p>
            </FadeInView>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {industries.map((ind, i) => {
              const IndIcon = iconMap[ind.icon] || Building2;
              return (
                <FadeInView key={ind.name} delay={i * 0.05}>
                  <div className="card p-6 h-full hover:bg-[#141b35] transition-all group glow-border">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 mb-4 group-hover:scale-110 transition-transform">
                      <IndIcon className="h-full w-full text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{ind.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{ind.desc}</p>
                  </div>
                </FadeInView>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden bg-slate-950/30">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/10 to-purple-600/20" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <FadeInView>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4">Not Listed?</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">Describe your situation and we will say whether a division fits — and if it does not, we will tell you rather than take the job.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/haritech/request-quote" className="btn-primary text-base px-10 py-4"><Zap className="h-5 w-5" /> Get Started</Link>
              <Link to="/haritech/contact" className="btn-secondary text-base px-10 py-4">Contact Us <ArrowRight className="h-4 w-4 text-cyan-400" /></Link>
            </div>
          </FadeInView>
        </div>
      </section>
    </div>
  );
};

export default Industries;
