import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Code2, X, Menu, ArrowLeft, ChevronDown, Building2, Globe, Monitor, Briefcase, FileText, HelpCircle, Mail, MessageCircle, Layout, Sun, Paintbrush, Zap, Ship, Calculator, Kanban, Lock } from 'lucide-react';
import { getHaritechBrandLogo, subscribeToHaritechLogo } from '../utils/haritechBrand';
import { getWhatsAppUrl, getHaritechContent } from '../utils/haritechContent';
import Underground3DBackground from '../components/Underground3DBackground';
import Ambient3DLayer from '../components/haritech/Ambient3DLayer';
import { HaritechCostEstimator } from '../components/haritech/HaritechCostEstimator';
import { CacVerificationModal } from '../components/haritech/CacVerificationModal';
import { PremierFloatingDock } from '../components/haritech/PremierFloatingDock';

/* Two tight groups instead of one long list, so the header and the mobile
   drawer stay readable on phones and tablets:
     · Company    — Home → Industries (who we are, what we do)
     · Portfolio  — Portfolio → Contact (the divisions, the work, the ways in)
   ------------------------------------------------------------------------ */
interface NavItem {
  label: string;
  path: string;
  icon: typeof Building2;
  hint?: string;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: 'company',
    label: 'Haritech',
    items: [
      { label: 'Home', path: '/haritech', icon: Building2 },
      { label: 'About', path: '/haritech/about', icon: FileText },
      { label: 'What We Do', path: '/haritech/what-we-do', icon: Globe },
      { label: 'Our Services', path: '/haritech/services', icon: Monitor },
      { label: 'Industries', path: '/haritech/industries', icon: Layout },
    ],
  },
  {
    id: 'portfolio',
    label: 'Portfolio & Divisions',
    items: [
      { label: 'Portfolio', path: '/haritech/portfolio', icon: Briefcase, hint: 'Client work' },
      { label: 'Solar Energy', path: '/haritech/solar-energy', icon: Sun, hint: 'Inverters & micro-grids' },
      { label: 'Importation', path: '/haritech/importation', icon: Ship, hint: 'Freight & clearing' },
      { label: 'Project & Property', path: '/haritech/project-management', icon: Kanban, hint: 'Management hub' },
      { label: 'Client Portal', path: '/haritech/client-portal', icon: Lock, hint: 'Client sign-in' },
      { label: 'Epoxy & Décor', path: '/haritech/3d-epoxy', icon: Paintbrush, hint: '3D floors' },
      { label: 'CAC Registration', path: '/haritech/cac-registration', icon: FileText, hint: 'Company filings' },
      { label: 'Blog', path: '/haritech/blog', icon: MessageCircle },
      { label: 'FAQ', path: '/haritech/faq', icon: HelpCircle },
      { label: 'Contact', path: '/haritech/contact', icon: Mail },
    ],
  },
];

const [primaryGroup, secondaryGroup] = navGroups;

const HaritechLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(primaryGroup.id);
  const [divisionsOpen, setDivisionsOpen] = useState(false);
  const divisionsRef = useRef<HTMLDivElement | null>(null);
  const [logoUrl, setLogoUrl] = useState(() => getHaritechBrandLogo());
  const [content, setContent] = useState(() => getHaritechContent());
  const [estimatorOpen, setEstimatorOpen] = useState(false);
  const [cacModalOpen, setCacModalOpen] = useState(false);
  const location = useLocation();
  // Thin reading-progress rail under the header — works with the smooth-scroll
  // engine because it reads the real document scroll position.
  const { scrollYProgress } = useScroll();
  const scrollProgress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });

  useEffect(() => subscribeToHaritechLogo(setLogoUrl), []);

  // Close the header’s division menu whenever the route changes
  useEffect(() => { setDivisionsOpen(false); }, [location.pathname]);

  // …and when the pointer lands anywhere outside it
  useEffect(() => {
    if (!divisionsOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (divisionsRef.current && !divisionsRef.current.contains(event.target as Node)) {
        setDivisionsOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [divisionsOpen]);

  useEffect(() => {
    const handler = () => setContent(getHaritechContent());
    window.addEventListener('haritech-content-updated', handler);
    return () => window.removeEventListener('haritech-content-updated', handler);
  }, []);

  useEffect(() => {
    const openEstHandler = () => setEstimatorOpen(true);
    const openCacHandler = () => setCacModalOpen(true);
    window.addEventListener('open-haritech-estimator', openEstHandler);
    window.addEventListener('open-haritech-cac', openCacHandler);
    return () => {
      window.removeEventListener('open-haritech-estimator', openEstHandler);
      window.removeEventListener('open-haritech-cac', openCacHandler);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === '/haritech') return location.pathname === '/haritech';
    return location.pathname.startsWith(path);
  };

  const activeGroupId =
    navGroups.find(group => group.items.some(item => isActive(item.path)))?.id ?? primaryGroup.id;

  const openDrawer = () => {
    setOpenGroup(activeGroupId);
    setSidebarOpen(true);
  };

  return (
    <div className="min-h-screen ht-screen-height bg-[#04060a] text-slate-100 selection:bg-white selection:text-black">
      <Underground3DBackground />
      <Ambient3DLayer />

      {/* Keyboard users on any OS can jump the fixed header */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-slate-950"
      >
        Skip to content
      </a>

      {/* Stone Architectural Top Ribbon / Status Ticker
          Hidden on phones: 32px of a 667px screen belongs to the content. */}
      <div className="hidden sm:flex fixed top-0 left-0 right-0 z-50 h-8 bg-slate-950/90 border-b border-white/10 text-[11px] overflow-hidden items-center backdrop-blur-md">
        <div className="animate-marquee whitespace-nowrap text-slate-400 font-mono flex items-center gap-8">
          <span className="flex items-center gap-1.5 text-white font-bold tracking-tight">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            HARITECH EXCLUSIVE BUSINESS — SMART TECH, SMART LIVING.
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-medium">
            💻 Laptops, accessories and practical computer services
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-medium">
            🖨️ Printing, branding and online registration assistance
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-medium">
            🚢 Importation consultation with landed-cost planning
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-medium">
            🎨 3D epoxy and interior décor consultation
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-medium">
            ☀️ Solar energy planning and project management support
          </span>
        </div>
      </div>

      {/* Top Navigation */}
      <nav className="ht-nav-font fixed top-0 sm:top-8 w-full z-40 bg-slate-950/85 backdrop-blur-2xl border-b border-white/10 transition-all">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button 
                onClick={openDrawer} 
                className="ht-tap lg:hidden p-2 -ml-1 rounded-xl hover:bg-white/5 text-slate-400 transition-colors flex items-center justify-center"
                aria-label="Toggle navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link to="/haritech" className="flex items-center gap-2.5 shrink-0 group">
                {logoUrl ? (
                  <img src={logoUrl} alt="Haritech" className="h-8 w-auto object-contain" />
                ) : (
                  <>
                    <div className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-white shadow-lg group-hover:bg-white/20 transition-all">
                      <Code2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-lg font-black tracking-widest text-white font-syne">
                        HARITECH
                      </span>
                      <span className="text-[9px] block font-mono text-slate-400 tracking-[0.25em] uppercase -mt-0.5 font-bold">
                        EXCLUSIVE BUSINESS
                      </span>
                    </div>
                  </>
                )}
              </Link>
            </div>

            <div className="hidden lg:flex items-center gap-5 xl:gap-6">
              {primaryGroup.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-semibold transition-colors relative group py-1 ${isActive(item.path) ? 'text-cyan-400' : 'text-slate-300 hover:text-cyan-300'}`}
                >
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 ${isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              ))}

              <div className="relative group" ref={divisionsRef}>
                <button
                  onClick={() => setDivisionsOpen(open => !open)}
                  aria-expanded={divisionsOpen}
                  aria-haspopup="true"
                  className={`text-sm font-semibold transition-colors flex items-center gap-1 py-1 ${secondaryGroup.items.some(i => isActive(i.path)) ? 'text-cyan-400' : 'text-slate-300 hover:text-cyan-300'}`}
                >
                  Portfolio <ChevronDown className={`h-3.5 w-3.5 transition-transform ${divisionsOpen ? 'rotate-180' : 'group-hover:rotate-180'}`} />
                </button>
                <div className={`absolute top-full right-0 mt-2 w-[24rem] bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-200 p-2 z-50 ${divisionsOpen ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'}`}>
                  <div className="grid grid-cols-2 gap-0.5">
                    {secondaryGroup.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-white/5 transition-colors"
                      >
                        <item.icon className="h-4 w-4 text-cyan-400 shrink-0 mt-px" />
                        <span className="min-w-0">
                          <span className="block leading-tight">{item.label}</span>
                          {item.hint && <span className="block text-[10px] text-slate-500 leading-tight mt-0.5">{item.hint}</span>}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-white/5 mt-1.5 pt-1.5 px-1">
                    <button
                      onClick={() => { setDivisionsOpen(false); setCacModalOpen(true); }}
                      className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-xs text-purple-300 hover:text-purple-200 font-semibold"
                    >
                      <Building2 className="h-3.5 w-3.5 text-purple-400" /> Business details
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setEstimatorOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
              >
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span>Estimator</span>
              </button>

              <Link to="/haritech/request-quote" className="btn-primary text-xs py-2 px-4 rounded-xl whitespace-nowrap font-bold shadow-md shadow-cyan-500/20">
                Get Quote
              </Link>

              <a 
                href={getWhatsAppUrl('Hello Haritech Exclusive Business, I would like to consult with your team.')} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="ht-tap p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors flex items-center justify-center"
                title="Direct WhatsApp"
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        {/* Reading progress — accent-coloured, sits on the header's bottom edge */}
        <motion.div
          aria-hidden="true"
          style={{ scaleX: scrollProgress }}
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
        >
          <div className="h-full w-full" style={{ background: 'linear-gradient(90deg, var(--ht-accent), var(--ht-accent-bright))' }} />
        </motion.div>
      </nav>


      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="ht-nav-font fixed top-0 left-0 bottom-0 w-72 max-w-[86vw] bg-slate-950 border-r border-white/5 z-50 overflow-y-auto"
            >
              <div className="ht-safe-top p-4 border-b border-white/5 flex items-center justify-between">
                <Link to="/haritech" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Haritech" className="h-7 w-auto object-contain" />
                  ) : (
                    <>
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600">
                        <Code2 className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-bold">HARITECH</span>
                    </>
                  )}
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="ht-tap p-2 rounded-xl hover:bg-white/5 text-slate-400 flex items-center justify-center" aria-label="Close navigation">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-3.5 space-y-3">
                {/* Primary actions first — always one tap away on a phone */}
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/haritech/request-quote" onClick={() => setSidebarOpen(false)} className="btn-primary text-xs py-2.5 px-2 rounded-xl justify-center">
                    <FileText className="h-3.5 w-3.5" /> Get Quote
                  </Link>
                  <a href={getWhatsAppUrl('Hello Haritech Exclusive Business, I would like to consult with your team.')} target="_blank" rel="noopener noreferrer" onClick={() => setSidebarOpen(false)} className="btn-secondary text-xs py-2.5 px-2 rounded-xl justify-center">
                    <MessageCircle className="h-3.5 w-3.5 text-green-400" /> WhatsApp
                  </a>
                </div>

                {/* Grouped navigation — two collapsible sections, never a wall of links */}
                {navGroups.map(group => {
                  const expanded = openGroup === group.id;
                  const groupActive = group.items.some(item => isActive(item.path));
                  return (
                    <div key={group.id} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                      <button
                        onClick={() => setOpenGroup(expanded ? null : group.id)}
                        aria-expanded={expanded}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left"
                      >
                        <span className="min-w-0">
                          <span className="block text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-slate-400">
                            {group.label}
                          </span>
                          <span className="block text-[10px] text-slate-600 mt-0.5">
                            {group.items.length} pages{groupActive ? ' · you are here' : ''}
                          </span>
                        </span>
                        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${expanded ? 'rotate-180 text-cyan-400' : 'text-slate-500'} ${groupActive && !expanded ? 'text-cyan-400' : ''}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="overflow-hidden"
                          >
                            <div className="px-2 pb-2 space-y-0.5">
                              {group.items.map(item => (
                                <Link
                                  key={item.path}
                                  to={item.path}
                                  onClick={() => setSidebarOpen(false)}
                                  className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(item.path) ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                                >
                                  <item.icon className="h-4 w-4 shrink-0" />
                                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                                  {isActive(item.path) && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                <div className="pt-3 border-t border-white/5 space-y-1">
                  <button
                    onClick={() => { setSidebarOpen(false); setEstimatorOpen(true); }}
                    className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
                  >
                    <Calculator className="h-4 w-4 shrink-0 text-cyan-400" /> Smart Cost Estimator
                  </button>
                  <button
                    onClick={() => { setSidebarOpen(false); setCacModalOpen(true); }}
                    className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-purple-300 hover:bg-white/5 transition-colors"
                  >
                    <Building2 className="h-4 w-4 shrink-0 text-purple-400" /> Business details
                  </button>
                  <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-cyan-400 hover:bg-white/5 transition-colors">
                    <ArrowLeft className="h-4 w-4 shrink-0" /> Back to Portfolio Hub
                  </Link>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Page Content — smaller top offset on phones, where the ribbon is hidden */}
      <main id="main-content" className="pt-20 sm:pt-28 pb-16">
        <Outlet />
      </main>

      {/* Premier Interactive Modals & Floating Dock */}
      <HaritechCostEstimator 
        isOpen={estimatorOpen} 
        onClose={() => setEstimatorOpen(false)} 
      />

      <CacVerificationModal 
        isOpen={cacModalOpen} 
        onClose={() => setCacModalOpen(false)} 
      />

      <PremierFloatingDock 
        onOpenEstimator={() => setEstimatorOpen(true)} 
        onOpenCacModal={() => setCacModalOpen(true)} 
      />

      {/* Footer */}
      <footer className="ht-safe-bottom bg-[#050810] border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg-overlay pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 blur-[120px] pointer-events-none" />
        {/* Bottom padding keeps the floating dock from covering the legal row */}
        <div className="container mx-auto px-6 pt-16 pb-24 sm:pb-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-2">
              <Link to="/haritech" className="flex items-center gap-2 mb-4">
                {logoUrl ? (
                  <img src={logoUrl} alt="Haritech" className="h-9 w-auto object-contain" />
                ) : (
                  <>
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600">
                      <Code2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">HARITECH</span>
                  </>
                )}
              </Link>
              <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-6">
                A Nigerian multi-service business: laptop and tech accessories, cyber café and online registration assistance, printing and branding, importation consultation, 3D epoxy and interior décor, solar energy guidance, project management and business consultation.
              </p>
              <div className="flex gap-3">
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="ht-tap w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center hover:bg-green-500/20 transition-colors" title="WhatsApp" aria-label="Chat on WhatsApp"><MessageCircle className="h-4 w-4" /></a>
                <a href={`mailto:${content.email}`} className="ht-tap w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center hover:bg-cyan-500/20 transition-colors" title="Email" aria-label="Email Haritech"><Mail className="h-4 w-4" /></a>
                <button onClick={() => setCacModalOpen(true)} className="px-3 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center gap-1.5 text-xs font-semibold hover:bg-purple-500/20 transition-colors">
                  <Building2 className="h-3.5 w-3.5" /> Business details
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-5">Service Divisions</h4>
              <ul className="space-y-2.5">
                <li><Link to="/haritech/services" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Laptops & Tech Accessories</Link></li>
                <li><Link to="/haritech/services" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Cyber Café & Online Registration</Link></li>
                <li><Link to="/haritech/services" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Printing & Branding</Link></li>
                <li><Link to="/haritech/importation" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Importation Consultation</Link></li>
                <li><Link to="/haritech/3d-epoxy" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">3D Epoxy & Interior Décor</Link></li>
                <li><Link to="/haritech/solar-energy" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Solar Energy</Link></li>
                <li><Link to="/haritech/project-management" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Project Management</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-5">Quick Tools & Hub</h4>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={() => setEstimatorOpen(true)} className="text-sm text-slate-400 hover:text-cyan-400 transition-colors text-left">
                    Smart Cost Estimator
                  </button>
                </li>
                <li>
                  <button onClick={() => setCacModalOpen(true)} className="text-sm text-slate-400 hover:text-purple-400 transition-colors text-left">
                    Business details
                  </button>
                </li>
                <li><Link to="/haritech/portfolio" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Client Portfolio</Link></li>
                <li><Link to="/haritech/request-quote" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Request Formal Proposal</Link></li>
                <li><Link to="/haritech/faq" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">FAQs</Link></li>
                <li><Link to="/haritech/client-portal" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Client Portal Sign-In</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs font-mono">&copy; {new Date().getFullYear()} Haritech Exclusive Business. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <button onClick={() => setCacModalOpen(true)} className="text-slate-500 hover:text-purple-400 text-xs transition-colors font-mono">
                Federal Republic of Nigeria Certified
              </button>
              <Link to="/" className="text-slate-500 hover:text-cyan-400 text-xs transition-colors">
                Portfolio Hub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HaritechLayout;
