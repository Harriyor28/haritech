import React from 'react';
import { motion } from 'framer-motion';
import { Search, PenTool, Code, CheckCircle, Rocket, Shield, MessageCircle } from 'lucide-react';
import Tilt3D from './Tilt3D';

const processSteps = [
  {
    id: 1,
    title: "Discovery Phase",
    description: "We audit your business model, targets, and competition parameters to draft a cohesive digital blueprint.",
    icon: Search,
    duration: "1-2 Weeks",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)] border-cyan-500/20"
  },
  {
    id: 2,
    title: "Layout Blueprint",
    description: "We detail wireframes, structure custom sitemaps, and establish coding schemas for fast indexation.",
    icon: PenTool,
    duration: "1 Week",
    glow: "shadow-[0_0_20px_rgba(139,92,246,0.15)] border-purple-500/20"
  },
  {
    id: 3,
    title: "Bespoke UI Design",
    description: "Our artists construct pixel-perfect, custom design mockups utilizing modern glassmorphic details.",
    icon: Code,
    duration: "2-3 Weeks",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)] border-blue-500/20"
  },
  {
    id: 4,
    title: "Elite Codebase Build",
    description: "We write clean, semantic React/Next code optimized for fast indexation speed and structural safety.",
    icon: CheckCircle,
    duration: "3-4 Weeks",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)] border-emerald-500/20"
  },
  {
    id: 5,
    title: "Diagnostics & Testing",
    description: "Rigorous performance tests, SEO schema audits, and device responsive checks ensure flawless launching.",
    icon: Rocket,
    duration: "1-2 Weeks",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.15)] border-red-500/20"
  },
  {
    id: 6,
    title: "Production Launch",
    description: "Zero-downtime deployment, DNS mappings, CDN configuration, and active metric collection start.",
    icon: Shield,
    duration: "1 Week",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)] border-amber-500/20"
  },
  {
    id: 7,
    title: "Ongoing Maintenance",
    description: "Speed monitoring, security scans, indexation updates, and 24/7 client portal diagnostics.",
    icon: MessageCircle,
    duration: "Ongoing Cycles",
    glow: "shadow-[0_0_20px_rgba(236,72,153,0.15)] border-pink-500/20"
  }
];

const DevelopmentProcessSection: React.FC = () => {
  return (
    <section id="process" className="section-padding bg-[#070a13] relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Our Development <span className="gradient-text">Engine</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            A secure, transparent development cycle engineered to launch high-conversion platforms.
          </p>
        </motion.div>
        
        <div className="relative max-w-4xl mx-auto px-4">
          {/* Timeline center line */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute left-6 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_8px_rgba(6,182,212,0.4)] origin-top"
          />
          
          <div className="space-y-16">
            {processSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: index * 0.1 }}
                  className={`flex flex-col md:flex-row items-start ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12`}
                >
                  {/* Card Section */}
                  <div className="flex-1 w-full md:max-w-md pl-12 md:pl-0">
                    <Tilt3D maxTilt={6}>
                      <div className={`p-8 card bg-[#0e1326]/80 hover:bg-[#141b35]/90 transition-all duration-300 relative glow-border ${step.glow}`}>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-950/80 border border-white/5 text-cyan-400 mb-6 shadow-md">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">{step.description}</p>
                        <div className="inline-flex items-center text-xs text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                          {step.duration}
                        </div>
                      </div>
                    </Tilt3D>
                  </div>
                  
                  {/* Timeline Node Circle */}
                  <div className="absolute left-6 md:static w-12 h-12 flex-shrink-0 flex items-center justify-center z-10 md:transform md:-translate-x-1.5">
                    <motion.div
                      whileInView={{ scale: [1, 1.3, 1] }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="w-5 h-5 rounded-full bg-slate-950 border-4 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                    />
                    <div className="absolute hidden md:block mt-14 bg-slate-900 border border-white/5 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 font-mono">
                      STEP 0{index + 1}
                    </div>
                  </div>
                  
                  {/* Spacer for layout symmetry */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DevelopmentProcessSection;