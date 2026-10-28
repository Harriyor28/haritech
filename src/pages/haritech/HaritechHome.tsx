import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, Shield, Zap, TrendingUp, Users, 
  Code2, Smartphone, Search, 
  MessageCircle, Star, Quote, Sun, Paintbrush, 
  FileText, CheckCircle2, Award, ArrowUpRight, 
  Check, Calculator, Ship, Briefcase
} from 'lucide-react';
import { getStoredProjects } from '../../utils/projects';
import type { ProjectData } from '../../utils/projects';
import { getStoredTestimonials, Testimonial } from '../../utils/testimonials';
import { getHaritechContent, HaritechSiteContent, getWhatsAppUrl } from '../../utils/haritechContent';
import { HaritechHeroWorkspace } from '../../components/haritech/HaritechHeroWorkspace';
import { HaritechCostEstimator } from '../../components/haritech/HaritechCostEstimator';

const featuredServices = [
  { 
    title: 'Laptop & Tech Accessories', 
    desc: 'Guidance on sourcing laptops, computers and tech accessories based on your needs and budget.', 
    icon: Smartphone, 
    color: 'from-cyan-500 to-blue-600',
    link: '/haritech/services',
    tag: 'Tech'
  },
  { 
    title: 'Cyber Café & Online Registration', 
    desc: 'Practical computer and internet assistance, plus guidance on online registration processes with clear requirements.', 
    icon: Code2, 
    color: 'from-indigo-500 to-purple-600',
    link: '/haritech/services',
    tag: 'Digital Support'
  },
  { 
    title: 'Printing & Branding', 
    desc: 'Printing and branding for business documents, promotional materials and branded items as capabilities allow.', 
    icon: Sparkles, 
    color: 'from-purple-500 to-pink-600',
    link: '/haritech/services',
    tag: 'Branding'
  },
  { 
    title: 'Importation Consultation', 
    desc: 'Guidance on sourcing, supplier communication, shipping options, duties and total landed cost planning.', 
    icon: Ship, 
    color: 'from-teal-500 to-cyan-600',
    link: '/haritech/importation',
    tag: 'Importation'
  },
  { 
    title: '3D Epoxy & Interior Décor', 
    desc: 'Consultation and coordination for bespoke epoxy finishes and interior décor projects.', 
    icon: Paintbrush, 
    color: 'from-teal-500 to-emerald-600',
    link: '/haritech/3d-epoxy',
    tag: 'Interiors'
  },
  { 
    title: 'Business Consultation', 
    desc: 'Pragmatic business planning and guidance to help small businesses make informed decisions.', 
    icon: Briefcase, 
    color: 'from-amber-500 to-orange-600',
    link: '/haritech/services',
    tag: 'Consultation'
  },
  { 
    title: 'Solar Energy', 
    desc: 'Guidance on solar energy requirements, system planning and equipment sourcing where applicable.', 
    icon: Sun, 
    color: 'from-yellow-500 to-amber-600',
    link: '/haritech/solar-energy',
    tag: 'Solar'
  },
  { 
    title: 'Project Management', 
    desc: 'Project support including planning, coordination, budgeting guidance and progress tracking within confirmed capabilities.', 
    icon: FileText, 
    color: 'from-blue-500 to-indigo-600',
    link: '/haritech/project-management',
    tag: 'Projects'
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
                HARITECH EXCLUSIVE BUSINESS • Smart Tech, Smart Living.
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
            Technology, Business Support & Practical Solutions for Everyday Life
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.15 }} 
            className="text-sm sm:text-base text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Haritech Exclusive Business is a Nigerian multi-service company built around a simple vision: making technology more accessible, helping businesses grow, and bringing useful services together under one roof — from laptops and computer services to importation consultation, printing and branding, business support, solar energy, project management and interior décor.
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
              href={getWhatsAppUrl('Hello Haritech Exclusive Business, I would like to ask about one of your services.')} 
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
                8
              </div>
              <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-0.5">
                Service Divisions
              </div>
              <div className="text-[11px] text-slate-400">Tech, Cyber Café, Printing, Importation, Business, Solar, Projects, Epoxy</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-yellow-400 font-mono mb-1">
                —
              </div>
              <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-0.5">
                Projects
              </div>
              <div className="text-[11px] text-slate-400">Ask for examples</div>
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
                CAC
              </div>
              <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-0.5 flex items-center justify-center gap-1">
                <span>Registration</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              </div>
              <div className="text-[11px] text-slate-400">Ask for current details</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 font-mono mb-1">
                Enquiry
              </div>
              <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-0.5">
                First Approach
              </div>
              <div className="text-[11px] text-slate-400">Tell us your needs</div>
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
                Eight Services, One Business
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm mt-2">
                Technology products and computer services, online registration assistance, printing and branding, importation consultation, business consultation, solar energy, project management and property monitoring, and epoxy and interior décor — each service has its own page explaining what it involves and how to enquire.
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
                <span>Open the Cost Estimator</span>
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
                <Award className="h-3.5 w-3.5" /> WORK & EXAMPLES
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Selected <span className="gradient-text">Examples</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm mt-2">
                Work appears here only when the customer agrees and the details can be checked. Nothing is published as a completed project until then.
              </p>

              {/* Portfolio Filters */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                {['All', 'Tech', 'Importation', 'Interiors', 'Printing', 'Solar'].map(filter => (
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
            {filteredProjects.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 stone-card rounded-2xl p-8 text-center">
                <h3 className="text-base font-bold text-white mb-2">Nothing published in this category yet</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                  Completed work is added only with the customer's permission and verifiable details. Ask us directly for examples relevant to your enquiry.
                </p>
              </div>
            )}
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
                <Shield className="h-3.5 w-3.5" /> HOW AN ENQUIRY WORKS
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                How an Enquiry <span className="gradient-text">Runs</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm mt-2">
                The same four steps whichever division you contact — with nothing started before the previous step is agreed.
              </p>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Enquiry & Scope',
                desc: 'You describe the need — a device, a print run, goods to import, a floor, a power requirement or a project. We list the questions still open.',
                accent: 'text-cyan-400',
                border: 'border-cyan-500/20'
              },
              {
                step: '02',
                title: 'Options & Quotation',
                desc: 'Options are compared with the costs and assumptions written down, so the figure you receive can be checked against the work.',
                accent: 'text-blue-400',
                border: 'border-blue-500/20'
              },
              {
                step: '03',
                title: 'Delivery & Coordination',
                desc: 'Work is carried out or coordinated with the right trades, with progress reported as the agreed milestones are reached.',
                accent: 'text-yellow-400',
                border: 'border-yellow-500/20'
              },
              {
                step: '04',
                title: 'Handover & Follow-up',
                desc: 'You receive the documents, records and care instructions for what was delivered, plus a named contact for questions afterwards.',
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
                    <span>Agreed before the next step</span>
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
                <Star className="h-3.5 w-3.5" /> CUSTOMER FEEDBACK
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Reviews, <span className="gradient-text">Only With Permission</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm mt-2">
                Customer comments are published only with consent and in their own words.
              </p>
            </div>
          </FadeInView>            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.length === 0 && (
              <div className="md:col-span-3 stone-card p-8 rounded-2xl text-center">
                <Quote className="h-8 w-8 text-cyan-400/40 mx-auto mb-4" />
                <h3 className="text-base font-bold text-white mb-2">No testimonials published yet</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                  We publish a review only with the customer's permission and after checking the wording. Until then this space stays empty rather than filled with invented quotes.
                </p>
              </div>
            )}
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
                How We <span className="gradient-text">Work</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm mt-2">
                The working habits behind every division — no claim of scale, just how enquiries are handled.
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
                      <Check className="h-3 w-3" /> How enquiries are handled
                    </div>
                  </div>
                </FadeInView>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 8b. LONG-TERM VISION ── */}
      <section className="py-10 border-y border-white/5 bg-slate-950/30">
        <div className="container mx-auto px-6">
          <FadeInView>
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">Where We Are Going</span>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Haritech Exclusive Business is currently operating and serving customers in Nigeria, both in person and online.
                Our long-term vision is to grow beyond individual services into a technology-driven company serving multiple industries
                and expanding into international markets.
              </p>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* ── 9. PREMIER CALL TO ACTION ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/30 via-slate-950 to-indigo-900/30 -z-10" />
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <FadeInView>
            <div className="stone-frame-box p-8 md:p-12 rounded-3xl">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mb-3 inline-block">
                START AN ENQUIRY
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
                Tell Us What You Need
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                A laptop sourced, documents printed, goods imported, a floor finished, a solar requirement sized or a project coordinated — describe the need and we will explain what is involved, what it costs and whether we can deliver it.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={triggerEstimator}
                  className="btn-primary text-xs sm:text-sm px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-cyan-500/20"
                >
                  <Calculator className="h-4 w-4" /> Open the Cost Estimator
                </button>
                <a 
                  href={getWhatsAppUrl('Hello Haritech, I would like to make an enquiry.')}
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
