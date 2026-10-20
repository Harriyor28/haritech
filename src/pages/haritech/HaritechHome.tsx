import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, Shield, Zap, TrendingUp, Users, 
  Code2, ShoppingCart, Smartphone, Search, 
  MessageCircle, Star, Quote, Sun, Paintbrush, 
  FileText, CheckCircle2, Award, ArrowUpRight, 
  Check, Calculator
} from 'lucide-react';
import { getStoredProjects } from '../../utils/projects';
import type { ProjectData } from '../../utils/projects';
import { getStoredTestimonials, Testimonial } from '../../utils/testimonials';
import { getHaritechContent, HaritechSiteContent, getWhatsAppUrl } from '../../utils/haritechContent';
import { HaritechHeroWorkspace } from '../../components/haritech/HaritechHeroWorkspace';
import { HaritechCostEstimator } from '../../components/haritech/HaritechCostEstimator';

const featuredServices = [
  { 
    title: 'Custom Web & Cloud Systems', 
    desc: 'High-speed portals, corporate dashboards, SaaS platforms, and bespoke web apps built for maximum conversions.', 
    icon: Code2, 
    color: 'from-cyan-500 to-blue-600',
    link: '/haritech/services',
    tag: 'Digital Core'
  },
  { 
    title: 'Solar & Renewable Micro-Grids', 
    desc: 'Tier-1 hybrid solar inverters, lithium LiFePO4 battery banks, and commercial solar arrays for 24/7 power autonomy.', 
    icon: Sun, 
    color: 'from-yellow-500 to-amber-600',
    link: '/haritech/solar-energy',
    tag: 'Clean Energy'
  },
  { 
    title: '3D Epoxy & Luxury Coatings', 
    desc: 'Seamless 12,500 PSI industrial resin, Italian metallic marble effects, and artistic 3D floors that outclass tiling.', 
    icon: Paintbrush, 
    color: 'from-teal-500 to-emerald-600',
    link: '/haritech/3d-epoxy',
    tag: 'Architecture'
  },
  { 
    title: 'CAC Corporate Registration', 
    desc: 'Government-accredited business name and limited liability company (LLC) incorporation with TIN & bank resolution.', 
    icon: FileText, 
    color: 'from-purple-500 to-indigo-600',
    link: '/haritech/cac-registration',
    tag: 'Legal Compliance'
  },
  { 
    title: 'Mobile Applications (iOS/Android)', 
    desc: 'Native & cross-platform mobile apps with fluid UX, real-time push notifications, and offline capability.', 
    icon: Smartphone, 
    color: 'from-orange-500 to-red-600',
    link: '/haritech/services',
    tag: 'App Dev'
  },
  { 
    title: 'E-Commerce Infrastructure', 
    desc: 'Full-featured online stores with multi-currency payment gateways, automated inventory, and logistics hooks.', 
    icon: ShoppingCart, 
    color: 'from-blue-500 to-indigo-600',
    link: '/haritech/services',
    tag: 'Commerce'
  },
  { 
    title: 'Corporate Brand Identity', 
    desc: 'Precision logos, 3D brand guidelines, corporate profiles, and marketing collateral designed to establish dominance.', 
    icon: Sparkles, 
    color: 'from-pink-500 to-rose-600',
    link: '/haritech/services',
    tag: 'Branding'
  },
  { 
    title: 'Cybersecurity & High-Availability', 
    desc: 'Enterprise-grade SSL, penetration testing, automated database snapshots, and DDoS mitigation.', 
    icon: Shield, 
    color: 'from-emerald-500 to-teal-600',
    link: '/haritech/services',
    tag: 'Security'
  },
];

const defaultWhyIcons: Record<string, React.FC<any>> = {
  'Experienced Team': Users, 'Affordable Pricing': TrendingUp, 'Fast Delivery': Zap,
  'SEO Optimized': Search, 'Mobile Friendly': Smartphone, 'Reliable Support': MessageCircle,
  'Secure Solutions': Shield, 'Client Satisfaction': Star,
};

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }} 
    whileInView={{ opacity: 1, y: 0 }} 
    viewport={{ once: true }} 
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);

const HaritechHome: React.FC = () => {
  const [content, setContent] = useState<HaritechSiteContent>(() => getHaritechContent());
  const [projects, setProjects] = useState<ProjectData[]>(() => getStoredProjects());
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => getStoredTestimonials().slice(0, 3));
  const [activePortfolioFilter, setActivePortfolioFilter] = useState<string>('All');

  useEffect(() => {
    const handler = () => setContent(getHaritechContent());
    window.addEventListener('haritech-content-updated', handler);
    return () => window.removeEventListener('haritech-content-updated', handler);
  }, []);

  useEffect(() => {
    const handler = () => setProjects(getStoredProjects());
    window.addEventListener('haritech-projects-updated', handler);
    return () => window.removeEventListener('haritech-projects-updated', handler);
  }, []);

  useEffect(() => {
    const handler = () => setTestimonials(getStoredTestimonials().slice(0, 3));
    window.addEventListener('haritech-testimonials-updated', handler);
    return () => window.removeEventListener('haritech-testimonials-updated', handler);
  }, []);

  const triggerEstimator = () => {
    window.dispatchEvent(new CustomEvent('open-haritech-estimator'));
  };

  const triggerCacModal = () => {
    window.dispatchEvent(new CustomEvent('open-haritech-cac'));
  };

  const filteredProjects = projects.filter(p => {
    if (activePortfolioFilter === 'All') return true;
    return p.category.toLowerCase().includes(activePortfolioFilter.toLowerCase());
  }).slice(0, 6);

  return (
    <div className="relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[180px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[180px] pointer-events-none -z-10" />
      <div className="absolute top-2/3 left-10 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[180px] pointer-events-none -z-10" />

      {/* ── 1. HERO SECTION (Stone Architectural Frame + Webster 5.0 Interactive Console) ── */}
      <section className="relative pt-12 pb-20 md:pb-28">
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          
          {/* Architectural Badge Box (Stone tm-452 aesthetic) */}
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-8"
          >
            <div className="stone-frame-box px-5 py-2.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md">
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] text-slate-300 uppercase flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                HARITECH ENTERPRISE CORE • MULTI-DISCIPLINARY ARCHITECTURE
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 25 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white max-w-4xl mx-auto tracking-tight font-syne leading-[1.15] mb-5"
          >
            ENGINEERING PREMIER <span className="gradient-text">DIGITAL SYSTEMS,</span>{' '}
            <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.35)]">CLEAN SOLAR</span> &{' '}
            <span className="text-slate-300">3D EPOXY</span> SURFACES
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.15 }} 
            className="text-sm sm:text-base text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            From custom high-conversion web platforms and 24/7 off-grid solar inverters, to luxury 3D epoxy flooring and federal CAC incorporation — Haritech is your verified turnkey execution partner.
          </motion.p>

          {/* Hero Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.25 }} 
            className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-10"
          >
            <button
              onClick={triggerEstimator}
              className="btn-primary text-xs sm:text-sm px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" /> Smart Cost Estimator
            </button>

            <Link 
              to="/haritech/services" 
              className="btn-secondary text-xs sm:text-sm px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2"
            >
              <Zap className="h-4 w-4 text-slate-300" /> Explore All Divisions
            </Link>

            <a 
              href={getWhatsAppUrl('Hello Haritech Exclusive Services, I would like to consult on an upcoming enterprise project.')} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-secondary text-xs sm:text-sm px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" /> Direct WhatsApp Line
            </a>
          </motion.div>

          {/* ── WEBSTER 5.0 / STONE INTERACTIVE LIVE WORKSPACE ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            <HaritechHeroWorkspace 
              onOpenCacModal={triggerCacModal}
              onOpenEstimator={triggerEstimator}
            />
          </motion.div>

        </div>
      </section>

      {/* ── 2. MULTILEN VELOCITY METRICS BAR (Corporate High-Impact Stats) ── */}
      <section className="relative py-12 bg-gradient-to-r from-slate-950 via-[#0a0f21] to-slate-950 border-y border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono mb-1">
                450+
              </div>
              <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-0.5">
                Turnkey Projects
              </div>
              <div className="text-[11px] text-slate-400">Web, Solar & 3D Epoxy Systems</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-yellow-400 font-mono mb-1">
                99.8%
              </div>
              <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-0.5">
                Precision & Uptime
              </div>
              <div className="text-[11px] text-slate-400">Zero Blackout Guarantee</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              onClick={triggerCacModal}
              className="p-4 rounded-2xl bg-white/[0.02] border border-purple-500/20 cursor-pointer hover:border-purple-500/50 transition-colors"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono mb-1">
                BN 3829104
              </div>
              <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-0.5 flex items-center justify-center gap-1">
                <span>CAC Accredited</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              </div>
              <div className="text-[11px] text-slate-400">Federal Republic of Nigeria</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 font-mono mb-1">
                48-Hour
              </div>
              <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-0.5">
                Rapid SLA Turnaround
              </div>
              <div className="text-[11px] text-slate-400">Fast-Track Technical Dispatch</div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 3. FEATURED SERVICES MATRIX (Stone Pedestals) ── */}
      <section className="section-padding relative">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium mb-3">
                <Sparkles className="h-3.5 w-3.5" /> HARITECH INTEGRATED CAPABILITIES
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Engineering <span className="gradient-text">Without Limits</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm mt-2">
                Unified expertise spanning software technology, clean green power, durable luxury surfaces, and corporate governance.
              </p>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((svc, i) => (
              <FadeInView key={svc.title} delay={i * 0.05}>
                <div className="stone-card p-6 rounded-2xl h-full flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${svc.color} p-2.5 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <svc.icon className="h-full w-full" />
                      </div>
                      <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
                        {svc.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {svc.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                      {svc.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <Link
                      to={svc.link}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group-hover:translate-x-1 transition-all"
                    >
                      <span>Explore Division</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>

          <FadeInView>
            <div className="text-center mt-12 flex flex-wrap justify-center gap-4">
              <Link 
                to="/haritech/services" 
                className="btn-primary text-xs sm:text-sm px-8 py-3.5 rounded-xl font-bold inline-flex items-center gap-2"
              >
                <span>View Full Service Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={triggerEstimator}
                className="btn-secondary text-xs sm:text-sm px-8 py-3.5 rounded-xl font-semibold inline-flex items-center gap-2"
              >
                <Calculator className="h-4 w-4 text-cyan-400" />
                <span>Estimate Custom Requirement</span>
              </button>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* ── 4. BRAINSTORMING INLINE ESTIMATOR SECTION ── */}
      <section className="section-padding bg-slate-950/40 border-y border-white/5 relative">
        <div className="container mx-auto">
          <HaritechCostEstimator isInline={true} />
        </div>
      </section>

      {/* ── 5. MULTI-DISCIPLINE PORTFOLIO SHOWCASE ── */}
      <section className="section-padding relative">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium mb-3">
                <Award className="h-3.5 w-3.5" /> PROVEN TRACK RECORD
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Our Premier <span className="gradient-text">Showcase</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm mt-2">
                Real-world deployments engineered for industry leaders, modern residences, and enterprise operations.
              </p>

              {/* Portfolio Filters */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                {['All', 'Business', 'Corporate', 'E-commerce', 'School', 'Restaurant'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActivePortfolioFilter(filter)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activePortfolioFilter === filter
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, i) => (
              <FadeInView key={project.id} delay={i * 0.08}>
                <div className="stone-card rounded-2xl overflow-hidden group flex flex-col justify-between h-full">
                  <div className="relative overflow-hidden h-52">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <span className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-cyan-300">
                      {project.category}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {project.tags.slice(0, 3).map(t => (
                          <span key={t} className="text-[10px] font-mono bg-white/5 border border-white/5 text-slate-300 px-2 py-0.5 rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                      <a 
                        href={project.liveDemo} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 text-center bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black py-2 rounded-xl text-xs font-bold border border-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Live Preview</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                      <Link 
                        to={`/project/${project.id}`} 
                        className="flex-1 text-center bg-slate-900 border border-white/5 text-slate-300 hover:text-white py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                      >
                        Case Study
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>

          <FadeInView>
            <div className="text-center mt-12">
              <Link 
                to="/haritech/portfolio" 
                className="btn-secondary text-xs sm:text-sm px-8 py-3.5 rounded-xl font-bold inline-flex items-center gap-2"
              >
                <span>Explore Full Portfolio Archive</span>
                <ArrowRight className="h-4 w-4 text-cyan-400" />
              </Link>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* ── 6. ARCHITECTURAL 4-STAGE ENGINEERING PROCESS (Stone & Webster Blueprint) ── */}
      <section className="section-padding bg-slate-950/30 border-y border-white/5 relative">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium mb-3">
                <Shield className="h-3.5 w-3.5" /> ISO-STYLE DELIVERY DISCIPLINE
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Our Execution <span className="gradient-text">Blueprint</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm mt-2">
                How Haritech transforms complex scopes into flawless turnkey realities.
              </p>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Architectural Audit',
                desc: 'In-depth consultation, feasibility study, power audit, or codebase inspection to define exact project targets.',
                accent: 'text-cyan-400',
                border: 'border-cyan-500/20'
              },
              {
                step: '02',
                title: 'Precision Formulation',
                desc: 'Component selection, Tier-1 hardware specification, or cloud architectural wireframing with transparent pricing.',
                accent: 'text-blue-400',
                border: 'border-blue-500/20'
              },
              {
                step: '03',
                title: 'High-Velocity Build',
                desc: 'Execution by accredited specialists — certified developers, solar electricians, resin artisans, or corporate attorneys.',
                accent: 'text-yellow-400',
                border: 'border-yellow-500/20'
              },
              {
                step: '04',
                title: 'Commissioning & SLA',
                desc: 'Rigorous stress testing, official CAC document delivery, live inverter synchronization, and lifelong warranty.',
                accent: 'text-teal-400',
                border: 'border-teal-500/20'
              }
            ].map((p, i) => (
              <FadeInView key={p.step} delay={i * 0.08}>
                <div className={`p-6 rounded-2xl bg-slate-900/70 border ${p.border} h-full flex flex-col justify-between relative overflow-hidden group`}>
                  <div className="text-4xl font-black font-mono text-white/10 group-hover:text-white/20 transition-colors mb-4">
                    {p.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${p.accent.replace('text-', 'bg-')}`} />
                      {p.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${p.accent}`} />
                    <span>Guaranteed Milestone</span>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. VERIFIED CLIENT TESTIMONIALS & TRUST ── */}
      <section className="section-padding relative">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium mb-3">
                <Star className="h-3.5 w-3.5" /> VERIFIED REPUTATION
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Trusted by <span className="gradient-text">Forward-Thinking Leaders</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm mt-2">
                Hear directly from business founders, homeowners, and corporate teams powered by Haritech.
              </p>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <FadeInView key={i} delay={i * 0.1}>
                <div className="stone-card p-8 rounded-2xl h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Quote className="h-8 w-8 text-cyan-400/40" />
                      <div className="flex gap-1">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 italic">
                      "{t.content}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{t.name}</div>
                      <div className="text-[11px] text-slate-400">{t.position}</div>
                    </div>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. WHY CHOOSE HARITECH (Multilen Multipurpose Advantage) ── */}
      <section className="section-padding bg-slate-950/40 border-y border-white/5 relative">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                The Haritech <span className="gradient-text">Competitive Edge</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm mt-2">
                Why forward-thinking enterprises choose Haritech Exclusive Services over fragmented contractors.
              </p>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {content.whyChoose.map((item, i) => {
              const Icon = defaultWhyIcons[item.title] || Zap;
              return (
                <FadeInView key={item.title} delay={i * 0.05}>
                  <div className="stone-card p-5 rounded-2xl h-full flex flex-col justify-between">
                    <div>
                      <Icon className="h-7 w-7 text-cyan-400 mb-3" />
                      <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="mt-4 pt-2 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Standard Operating Procedure
                    </div>
                  </div>
                </FadeInView>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 9. PREMIER CALL TO ACTION ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/30 via-slate-950 to-indigo-900/30 -z-10" />
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <FadeInView>
            <div className="stone-frame-box p-8 md:p-12 rounded-3xl">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mb-3 inline-block">
                COMMENCE PRECISION EXECUTION
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
                Ready to Bring High-Impact Excellence to Your Enterprise?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Whether deploying a high-availability digital portal, equipping your property with uninterrupted solar energy, laying diamond-grade 3D epoxy, or securing CAC corporate registration — our team is on standby.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={triggerEstimator}
                  className="btn-primary text-xs sm:text-sm px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-cyan-500/20"
                >
                  <Calculator className="h-4 w-4" /> Calculate Project Scope Now
                </button>
                <a 
                  href={getWhatsAppUrl('Hello Haritech Exclusive Services, I am ready to get started.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs sm:text-sm px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-green-400"
                >
                  <MessageCircle className="h-4 w-4" /> Direct WhatsApp Consultation
                </a>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

    </div>
  );
};

export default HaritechHome;
