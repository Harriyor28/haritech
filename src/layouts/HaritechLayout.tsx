import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Code2, X, Menu, ArrowLeft, ChevronDown, Building2, Globe, Monitor, Briefcase, FileText, HelpCircle, Mail, MessageCircle, Layout, Sun, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';
import { getHaritechBrandLogo, subscribeToHaritechLogo } from '../utils/haritechBrand';
import { getWhatsAppUrl, getHaritechContent, getSocialLinks } from '../utils/haritechContent';
import type { SocialLinks } from '../utils/haritechContent';
import { getStoredSettings } from '../utils/settings';
import Underground3DBackground from '../components/Underground3DBackground';
import CrossPromo from '../components/shared/CrossPromo';

const navItems = [
  { label: 'Home', path: '/haritech', icon: Building2 },
  { label: 'About', path: '/haritech/about', icon: FileText },
  { label: 'What We Do', path: '/haritech/what-we-do', icon: Globe },
  { label: 'Our Services', path: '/haritech/services', icon: Monitor },
  { label: 'Industries', path: '/haritech/industries', icon: Layout },
  { label: 'Portfolio', path: '/haritech/portfolio', icon: Briefcase },
  { label: 'Solar Energy', path: '/haritech/solar-energy', icon: Sun },
  { label: 'CAC Registration', path: '/haritech/cac-registration', icon: FileText },
  { label: 'Blog', path: '/haritech/blog', icon: MessageCircle },
  { label: 'FAQ', path: '/haritech/faq', icon: HelpCircle },
  { label: 'Contact', path: '/haritech/contact', icon: Mail },
];

const footerSocialDefs: { key: keyof SocialLinks; icon: typeof Twitter; label: string }[] = [
  { key: 'twitter', icon: Twitter, label: 'Twitter' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
  { key: 'facebook', icon: Facebook, label: 'Facebook' },
  { key: 'instagram', icon: Instagram, label: 'Instagram' },
];

const HaritechLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(() => getHaritechBrandLogo());
  const [content, setContent] = useState(() => getHaritechContent());
  const [settings, setSettings] = useState(() => getStoredSettings());
  const [socials, setSocials] = useState<SocialLinks>(() => getSocialLinks());
  const location = useLocation();

  // Close nav/dropdown whenever the route changes (Back/Forward, programmatic nav)
  useEffect(() => {
    setSidebarOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the mobile sidebar is open; Escape closes it
  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [sidebarOpen]);

  useEffect(() => subscribeToHaritechLogo(setLogoUrl), []);

  useEffect(() => {
    const handler = () => setContent(getHaritechContent());
    window.addEventListener('haritech-content-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('haritech-content-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      setSettings(getStoredSettings());
      setSocials(getSocialLinks());
    };
    window.addEventListener('haritech-settings-updated', handler);
    window.addEventListener('haritech-social-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('haritech-settings-updated', handler);
      window.removeEventListener('haritech-social-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === '/haritech') return location.pathname === '/haritech';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100">
      <Underground3DBackground />
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-colors"
                aria-label="Open navigation menu"
                aria-expanded={sidebarOpen}
                aria-controls="mobile-sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link to="/haritech" className="flex items-center gap-2 shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Haritech" className="h-8 w-auto object-contain" />
                ) : (
                  <>
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600">
                      <Code2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent hidden sm:inline">
                      HARITECH
                    </span>
                  </>
                )}
              </Link>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              {navItems.slice(0, 5).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors relative group ${isActive(item.path) ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}
                >
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 ${isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              ))}
              <div className="relative group">
                <button
                  onClick={() => setMoreOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={moreOpen}
                  className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  More <ChevronDown className={`h-3 w-3 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 ${moreOpen ? '!opacity-100 !visible' : ''}`}>
                  {navItems.slice(5).map((item) => (
                    <Link key={item.path} to={item.path} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-colors">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/portfolio" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors">
                <ArrowLeft className="h-3 w-3" /> Portfolio
              </Link>
              <Link to="/haritech/request-quote" className="btn-primary text-xs py-2 px-4 rounded-lg whitespace-nowrap">
                Request a Quote
              </Link>
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside
              id="mobile-sidebar"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-slate-950 border-r border-white/5 z-50 overflow-y-auto"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
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
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400" aria-label="Close navigation menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(item.path) ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                  <Link to="/haritech/request-quote" onClick={() => setSidebarOpen(false)} className="btn-primary text-sm py-2.5 px-3 rounded-xl w-full justify-center">
                    Request a Quote
                  </Link>
                    <Link to="/portfolio" onClick={() => setSidebarOpen(false)} className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-cyan-400 transition-colors py-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Portfolio
                  </Link>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main className="pt-16">
        <Outlet />
      </main>

      <CrossPromo
        eyebrow="Our Portfolio"
        title="Want to see the websites we've built?"
        text="You're on the Haritech Services side — but we also design and build premium websites for businesses like yours. Check out our portfolio to see real projects, case studies and client work."
        cta="View Our Portfolio"
        to="/portfolio"
      />

      {/* Footer */}
      <footer className="bg-[#050810] border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg-overlay pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-6 py-16 relative z-10">
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
              <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-6">
                {settings.tagline}
              </p>
              <div className="flex gap-3">
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center hover:bg-green-500/20 transition-colors"><MessageCircle className="h-4 w-4" /></a>
                <a href={`mailto:${content.email}`} className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center hover:bg-cyan-500/20 transition-colors"><Mail className="h-4 w-4" /></a>
                {footerSocialDefs
                  .filter((def) => {
                    const url = (socials[def.key] || '').trim();
                    return Boolean(url) && url !== '#';
                  })
                  .map((def) => (
                    <a key={def.label} href={socials[def.key]} target="_blank" rel="noopener noreferrer" aria-label={def.label} className="w-9 h-9 rounded-lg bg-slate-900/80 border border-white/5 text-slate-400 flex items-center justify-center hover:text-cyan-400 hover:border-cyan-500/30 transition-colors">
                      <def.icon className="h-4 w-4" />
                    </a>
                  ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-5">Quick Links</h4>
              <ul className="space-y-2.5">
                {navItems.slice(0, 6).map((item) => (
                  <li key={item.path}><Link to={item.path} className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">{item.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-5">Support</h4>
              <ul className="space-y-2.5">
                {navItems.slice(6).map((item) => (
                  <li key={item.path}><Link to={item.path} className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">{item.label}</Link></li>
                ))}
                <li><Link to="/haritech/request-quote" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">Request a Quote</Link></li>
                <li><Link to="/portfolio" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">Portfolio Home</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-xs font-mono">&copy; {new Date().getFullYear()} {settings.companyName}. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/portfolio" className="text-slate-600 hover:text-cyan-400 text-xs transition-colors">Portfolio Home</Link>
              <span className="text-slate-600 text-xs">Powered by Haritech</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HaritechLayout;
