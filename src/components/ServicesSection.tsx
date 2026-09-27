import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, X, Sparkles } from 'lucide-react';
import Tilt3D from './Tilt3D';
import { getStoredPortfolioServices, SERVICE_UPDATED_EVENT } from '../utils/portfolioServices';
import type { PortfolioService } from '../utils/portfolioServices';

const ServicesSection: React.FC = () => {
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [services, setServices] = useState<PortfolioService[]>(() => getStoredPortfolioServices());

  useEffect(() => {
    const handler = () => setServices(getStoredPortfolioServices());
    window.addEventListener('storage', handler);
    window.addEventListener(SERVICE_UPDATED_EVENT, handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener(SERVICE_UPDATED_EVENT, handler);
    };
  }, []);

  const selectedService = services.find(s => s.id === selectedServiceId);

  return (
    <section id="services" className="section-padding bg-[#070a13] relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none z-0" />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Our Elite <span className="gradient-text">Architectures</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Comprehensive web development solutions designed with premium standards and optimized for high business conversions.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="h-full"
            >
              <Tilt3D maxTilt={10} className="h-full">
                <div 
                  onClick={() => setSelectedServiceId(service.id)}
                  className="card group cursor-pointer h-full bg-[#0e1326]/80 hover:bg-[#141b35]/90 border-white/5 hover:border-cyan-500/35 transition-all duration-300 relative glow-border p-8 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 w-14 h-14 rounded-2xl bg-slate-950/80 flex items-center justify-center border border-white/5">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      {service.description}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                    <span>Explore Features</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Tilt3D>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modern Modal Details View */}
      <AnimatePresence>
        {selectedServiceId && selectedService && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedServiceId(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0e1326] border border-white/10 w-full max-w-xl rounded-2xl p-8 relative overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner ambient glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-cyan-500/20 blur-2xl" />

              <button 
                onClick={() => setSelectedServiceId(null)}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors border border-white/5"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-3 mb-6">
                <span className="text-4xl w-14 h-14 rounded-2xl bg-slate-950/80 flex items-center justify-center border border-white/5">
                  {selectedService.icon}
                </span>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedService.title}</h3>
                  <span className="text-xs text-cyan-400 font-bold tracking-widest uppercase">HARITECH EXCLUSIVE</span>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {selectedService.description}
              </p>

              <div className="border-t border-white/5 pt-6">
                <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  Key Specifications
                </h4>
                <ul className="space-y-3.5">
                  {(selectedService.features ?? []).map((feature, idx) => (
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={idx} 
                      className="flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-cyan-400" />
                      </span>
                      <span className="text-sm text-slate-400">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ServicesSection;