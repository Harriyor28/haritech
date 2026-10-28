import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Code2, Menu, X } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import Footer from '../components/Footer';
import CrossPromo from '../components/shared/CrossPromo';
import { getStoredBrandLogo, subscribeToBrandLogo } from '../utils/brand';

const navItems = [
  { label: 'Home', path: '/portfolio' },
  { label: 'Projects', path: '/portfolio/projects' },
  { label: 'Services', path: '/portfolio/services' },
  { label: 'Tech-Stack', path: '/portfolio/tech-stack' },
  { label: 'Process', path: '/portfolio/process' },
  { label: 'Testimonials', path: '/portfolio/testimonials' },
  { label: 'Contact', path: '/portfolio/contact' },
];

const PortfolioLayout: React.FC = () => {
  const [brandLogo, setBrandLogo] = useState(() => getStoredBrandLogo());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => subscribeToBrandLogo(setBrandLogo), []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/portfolio') return location.pathname === '/portfolio';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="relative min-h-screen ht-screen-height bg-[#070a13] text-slate-100 overflow-x-hidden grid-bg-overlay">
      <ParticleBackground />

      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none z-0" />

      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-slate-950/40 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Link to="/portfolio" className="flex items-center space-x-2">
                {brandLogo ? (
                  <img src={brandLogo} alt="HARITECH" className="max-h-10 max-w-48 object-contain" />
                ) : (
                  <>
                    <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-md">
                      <Code2 className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                      HARITECH
                    </span>
                  </>
                )}
              </Link>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Link
                    to={item.path}
                    className={`text-sm font-medium tracking-wide transition-colors relative group ${
                      isActive(item.path) ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 ${
                        isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.56 }}
              >
                <Link
                  to="/haritech"
                  className="text-slate-400 hover:text-cyan-400 transition-colors font-medium text-sm tracking-wide relative group"
                >
                  Haritech Services
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full" />
                </Link>
              </motion.div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/portfolio/contact"
                  className="btn-primary py-2.5 px-5 rounded-xl text-sm hidden sm:inline-flex"
                >
                  Get Started
                </Link>
              </motion.div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 inset-x-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                    isActive(item.path)
                      ? 'text-cyan-400 bg-cyan-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/haritech"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
              >
                Haritech Services
              </Link>
              <Link
                to="/portfolio/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary mt-3 py-3 rounded-xl text-sm text-center"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10">
        <Outlet />
      </main>

      <CrossPromo
        eyebrow="Haritech Exclusive Business"
        title="Need more than a website for your business?"
        text="You're browsing our portfolio — but Haritech Exclusive Business also offers laptops and tech accessories, computer services, printing and branding, importation consultation, business consultation, solar energy, project management and interior décor. See everything we do on the Haritech side."
        cta="Explore Haritech Services"
        to="/haritech"
      />

      <Footer />
    </div>
  );
};

export default PortfolioLayout;
