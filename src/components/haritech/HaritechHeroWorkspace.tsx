import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, Sun, Paintbrush, FileText, 
  ArrowRight, Zap, Shield,
  Server, Cpu, BatteryCharging,
  Layers, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWhatsAppUrl } from '../../utils/haritechContent';

export type WorkspaceTab = 'tech' | 'solar' | 'epoxy' | 'cac';

interface HaritechHeroWorkspaceProps {
  onOpenCacModal: () => void;
  onOpenEstimator: () => void;
}

export const HaritechHeroWorkspace: React.FC<HaritechHeroWorkspaceProps> = ({ 
  onOpenCacModal, 
  onOpenEstimator 
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('tech');
  const [solarSimulation, setSolarSimulation] = useState(7.4);
  const [epoxyFinish, setEpoxyFinish] = useState<'metallic' | 'marble' | 'flaked'>('metallic');

  return (
    <div className="w-full max-w-5xl mx-auto mt-10">
      {/* Upper Navigation Tabs — Sharp Executive Console */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 mb-3 rounded-2xl bg-slate-950/90 border border-white/10 backdrop-blur-2xl">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('tech')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeTab === 'tech'
                ? 'bg-white text-slate-950 font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Code2 className="h-4 w-4" />
            <span>Digital Systems & AI</span>
          </button>

          <button
            onClick={() => setActiveTab('solar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeTab === 'solar'
                ? 'bg-white text-slate-950 font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sun className="h-4 w-4" />
            <span>Solar Energy Grids</span>
          </button>

          <button
            onClick={() => setActiveTab('epoxy')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeTab === 'epoxy'
                ? 'bg-white text-slate-950 font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Paintbrush className="h-4 w-4" />
            <span>3D Epoxy Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('cac')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeTab === 'cac'
                ? 'bg-white text-slate-950 font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>CAC & Compliance</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3 px-3">
          <span className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            LIVE ENTERPRISE HUB
          </span>
        </div>
      </div>

      {/* Main Console Frame (Webster 5.0 style device showcase with Stone accents) */}
      <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-slate-950/80 backdrop-blur-2xl shadow-2xl shadow-cyan-950/20">
        {/* Device Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block border border-red-400/40" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block border border-yellow-400/40" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block border border-green-400/40" />
            </div>
            <span className="hidden sm:inline-block font-mono text-slate-400 ml-2">
              haritech-enterprise://solutions/{activeTab}.engine
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenEstimator}
              className="px-2.5 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/30 transition-colors flex items-center gap-1.5"
            >
              <Zap className="h-3 w-3" />
              <span>Instant Estimator</span>
            </button>
          </div>
        </div>

        {/* Console Workspace Content */}
        <div className="p-6 md:p-8 min-h-[380px]">
          <AnimatePresence mode="wait">
            {activeTab === 'tech' && (
              <motion.div
                key="tech"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-7 space-y-5 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium">
                    <Cpu className="h-3.5 w-3.5" /> High-Performance Enterprise Software
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Custom Web Applications, Portals & Intelligent Automation
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    We engineer enterprise-grade web applications, corporate systems, SaaS architectures, and seamless digital commerce infrastructure built for maximum conversion and speed.
                  </p>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-xl font-black text-cyan-400 font-mono">99.98%</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">Uptime SLA</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-xl font-black text-blue-400 font-mono">&lt; 25ms</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">Response Time</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-xl font-black text-purple-400 font-mono">100%</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">Mobile First</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      to="/haritech/services"
                      className="btn-primary text-xs py-2.5 px-5 rounded-xl font-semibold flex items-center gap-2"
                    >
                      Explore Tech Stack <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <a
                      href={getWhatsAppUrl('Hello Haritech, I need a consultation on custom software/web development.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs py-2.5 px-5 rounded-xl font-semibold"
                    >
                      Consult Lead Engineer
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/20 font-mono text-xs text-left space-y-3 shadow-inner">
                    <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
                      <span className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-cyan-400" />
                        <span>haritech-core.tsx</span>
                      </span>
                      <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded">ONLINE</span>
                    </div>

                    <div className="text-slate-300 space-y-1 leading-relaxed">
                      <p className="text-cyan-400">// Modular enterprise architecture</p>
                      <p><span className="text-purple-400">const</span> <span className="text-yellow-300">HaritechStack</span> = &#123;</p>
                      <p className="pl-4">frontend: <span className="text-emerald-300">['React 18', 'TypeScript', 'Tailwind']</span>,</p>
                      <p className="pl-4">infrastructure: <span className="text-emerald-300">['Edge CDN', 'Supabase', 'Cloud Sync']</span>,</p>
                      <p className="pl-4">security: <span className="text-emerald-300">['SSL TLS 1.3', 'DDoS Protection']</span>,</p>
                      <p className="pl-4">automation: <span className="text-emerald-300">['Custom Webhooks', 'CRM Integration']</span></p>
                      <p>&#125;;</p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Live Build: <strong className="text-white">v3.8 Production</strong></span>
                      <span className="text-cyan-400 font-bold">100 / 100 SEO Grade</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'solar' && (
              <motion.div
                key="solar"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-7 space-y-5 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-mono font-medium">
                    <Sun className="h-3.5 w-3.5" /> High-Efficiency Clean Energy Engineering
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Residential & Commercial Smart Solar Inverter Micro-Grids
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Eliminate blackout anxiety and spiraling fuel expenses. We engineer Tier-1 monocrystalline solar panels with lithium LiFePO4 storage to deliver 24/7 unyielding electric independence.
                  </p>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-xl font-black text-yellow-400 font-mono">0 Blackout</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">Guaranteed Uptime</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-xl font-black text-amber-400 font-mono">10+ Yrs</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">Battery Lifespan</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-xl font-black text-green-400 font-mono">75% Cut</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">Energy Overhead</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      to="/haritech/solar-energy"
                      className="btn-primary text-xs py-2.5 px-5 rounded-xl font-semibold bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center gap-2"
                    >
                      View Solar Packages <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <a
                      href={getWhatsAppUrl('Hello Haritech, I need a quote for a solar inverter installation for my home/business.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs py-2.5 px-5 rounded-xl font-semibold"
                    >
                      Request Energy Audit
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-yellow-500/20 font-mono text-xs text-left space-y-4">
                    <div className="flex items-center justify-between text-yellow-400 border-b border-white/5 pb-2">
                      <span className="flex items-center gap-2 font-bold">
                        <BatteryCharging className="h-4 w-4" />
                        <span>SMART GRID TELEMETRY</span>
                      </span>
                      <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded">NORMAL</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                          <span>PV Panel Output:</span>
                          <span className="text-yellow-400 font-bold">{solarSimulation.toFixed(1)} kW</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-yellow-500 to-amber-400"
                            style={{ width: `${(solarSimulation / 10) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                          <span>LiFePO4 Battery Reserve:</span>
                          <span className="text-green-400 font-bold">96% (48V 300Ah)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 w-[96%]" />
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-slate-300 flex justify-between">
                        <span>Grid Status: <strong className="text-green-400">Off-Grid Independent</strong></span>
                        <span>Diesel Saved: <strong className="text-yellow-400">42L / Day</strong></span>
                      </div>
                    </div>

                    <div className="pt-2 text-center">
                      <span className="text-[10px] text-slate-400">Simulate Sunlight Capacity:</span>
                      <div className="flex justify-center gap-2 mt-1.5">
                        <button 
                          onClick={() => setSolarSimulation(4.2)} 
                          className={`px-2 py-1 text-[10px] rounded border ${solarSimulation < 5 ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300' : 'border-white/10 text-slate-400'}`}
                        >
                          Overcast (4.2kW)
                        </button>
                        <button 
                          onClick={() => setSolarSimulation(7.8)} 
                          className={`px-2 py-1 text-[10px] rounded border ${solarSimulation >= 5 && solarSimulation < 9 ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300' : 'border-white/10 text-slate-400'}`}
                        >
                          Optimal (7.8kW)
                        </button>
                        <button 
                          onClick={() => setSolarSimulation(10.0)} 
                          className={`px-2 py-1 text-[10px] rounded border ${solarSimulation >= 9 ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300' : 'border-white/10 text-slate-400'}`}
                        >
                          Peak Sun (10kW)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'epoxy' && (
              <motion.div
                key="epoxy"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-7 space-y-5 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-medium">
                    <Paintbrush className="h-3.5 w-3.5" /> High-End Architectural Coatings
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Luxury 3D Epoxy, Metallic Resin & Industrial Hard-Coat Floors
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Transform interior residential, commercial lounges, and heavy-duty industrial warehouses into seamless, joint-free, mirror-polished masterpieces that outlast traditional tiles.
                  </p>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-xl font-black text-teal-400 font-mono">12,500</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">PSI Compressive</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-xl font-black text-emerald-400 font-mono">Zero VOC</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">Eco Safe Resin</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-xl font-black text-cyan-400 font-mono">100%</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">Water & Oil Proof</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      to="/haritech/3d-epoxy"
                      className="btn-primary text-xs py-2.5 px-5 rounded-xl font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center gap-2"
                    >
                      View 3D Epoxy Gallery <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <a
                      href={getWhatsAppUrl('Hello Haritech, I need an estimate for 3D Epoxy flooring installation.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs py-2.5 px-5 rounded-xl font-semibold"
                    >
                      Book Floor Inspection
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-teal-500/20 text-left space-y-4">
                    <div className="flex items-center justify-between text-teal-400 border-b border-white/5 pb-2">
                      <span className="flex items-center gap-2 font-bold font-mono text-xs">
                        <Layers className="h-4 w-4" />
                        <span>SURFACE FINISH SIMULATOR</span>
                      </span>
                      <span className="text-[10px] text-teal-300 font-bold bg-teal-500/10 px-2 py-0.5 rounded uppercase">
                        {epoxyFinish} GRADE
                      </span>
                    </div>

                    <div 
                      style={{ perspective: '900px' }}
                      className="relative h-36 rounded-xl overflow-hidden border border-teal-500/30 flex items-center justify-center group shadow-inner"
                    >
                      <motion.div
                        animate={{
                          rotateX: [20, 26, 20],
                          rotateY: [-3, 3, -3],
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        style={{ transformStyle: 'preserve-3d' }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        {epoxyFinish === 'metallic' && (
                          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-teal-900/80 to-cyan-500/50 flex flex-col items-center justify-center">
                            <span className="text-white font-black text-sm tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                              METALLIC PEARL FLOW
                            </span>
                            <span className="text-[10px] font-mono text-cyan-300 mt-1">HIGH-MIRROR 3D REFLECTION</span>
                          </div>
                        )}
                        {epoxyFinish === 'marble' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-stone-800 to-slate-950 flex flex-col items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-color-dodge" xmlns="http://www.w3.org/2000/svg">
                              <path d="M 0,20 Q 100,80 200,40 T 350,120" fill="none" stroke="#ca8a04" strokeWidth="3" filter="blur(1px)" />
                              <path d="M 30,120 Q 150,60 280,100" fill="none" stroke="#94a3b8" strokeWidth="2" />
                            </svg>
                            <span className="text-white font-black text-sm tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] relative z-10">
                              CALACATTA MARBLE RESIN
                            </span>
                            <span className="text-[10px] font-mono text-yellow-300 mt-1 relative z-10">ORGANIC VEIN DEPTH</span>
                          </div>
                        )}
                        {epoxyFinish === 'flaked' && (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col items-center justify-center">
                            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:12px_12px]" />
                            <span className="text-cyan-300 font-black text-sm tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] relative z-10">
                              INDUSTRIAL QUARTZ FLAKE
                            </span>
                            <span className="text-[10px] font-mono text-teal-300 mt-1 relative z-10">HEAVY-TRAFFIC ANTI-SLIP</span>
                          </div>
                        )}

                        {/* Animated 3D Specular Light Sweep */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer pointer-events-none" />
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setEpoxyFinish('metallic')}
                        className={`p-2 rounded-lg text-[10px] font-semibold border transition-all ${
                          epoxyFinish === 'metallic'
                            ? 'border-teal-400 bg-teal-500/20 text-teal-300'
                            : 'border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        Metallic Gloss
                      </button>
                      <button
                        onClick={() => setEpoxyFinish('marble')}
                        className={`p-2 rounded-lg text-[10px] font-semibold border transition-all ${
                          epoxyFinish === 'marble'
                            ? 'border-teal-400 bg-teal-500/20 text-teal-300'
                            : 'border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        Italian Marble
                      </button>
                      <button
                        onClick={() => setEpoxyFinish('flaked')}
                        className={`p-2 rounded-lg text-[10px] font-semibold border transition-all ${
                          epoxyFinish === 'flaked'
                            ? 'border-teal-400 bg-teal-500/20 text-teal-300'
                            : 'border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        Heavy Quartz
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      *All Haritech formulations utilize 100% solids industrial-grade epoxy primers, UV-stable topcoats, and anti-slip grit integration options.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'cac' && (
              <motion.div
                key="cac"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-7 space-y-5 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-medium">
                    <Shield className="h-3.5 w-3.5" /> Federal Republic of Nigeria Legal Entity
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Accredited Corporate Affairs Commission (CAC) Registration
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Legitimacy is everything in modern commerce. We register Nigerian business names, limited liability companies (LLC), NGOs, and assist with corporate TIN, tax compliance, and business banking enablement.
                  </p>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-xl font-black text-purple-400 font-mono">100%</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">Government Legal</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-xl font-black text-indigo-400 font-mono">3-5 Days</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">Expedited Filing</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-xl font-black text-emerald-400 font-mono">RC Verified</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">Official Stamp</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={onOpenCacModal}
                      className="btn-primary text-xs py-2.5 px-5 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center gap-2"
                    >
                      <Award className="h-3.5 w-3.5" /> Verify Haritech CAC Status
                    </button>
                    <Link
                      to="/haritech/cac-registration"
                      className="btn-secondary text-xs py-2.5 px-5 rounded-xl font-semibold"
                    >
                      Register Your Company
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-purple-500/20 text-left space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <div className="text-[10px] text-purple-300 font-mono font-bold tracking-wider">
                          FEDERAL REPUBLIC OF NIGERIA
                        </div>
                        <div className="text-xs font-bold text-white">Corporate Affairs Commission</div>
                      </div>
                      <span className="text-[10px] text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded">
                        CERTIFIED
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Entity Name:</span>
                        <span className="text-white font-bold">HARITECH EXCLUSIVE SERVICES</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">RC / BN Number:</span>
                        <span className="text-purple-400 font-bold">BN 3829104</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span className="text-green-400 font-bold">Active & In Good Standing</span>
                      </div>
                    </div>

                    <button
                      onClick={onOpenCacModal}
                      className="w-full py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Shield className="h-3.5 w-3.5" /> View Official Accreditation Docket
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
