import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Code2, ChevronDown, Play, Sparkles, FolderKanban, Laptop, ArrowRight, Menu, X } from 'lucide-react';
import ServicesSection from './components/ServicesSection';
import TestimonialsSection from './components/TestimonialsSection';
import TechnologyStackSection from './components/TechnologyStackSection';
import WhyChooseSection from './components/WhyChooseSection';
import DevelopmentProcessSection from './components/DevelopmentProcessSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import Tilt3D from './components/Tilt3D';
import { getStoredSettings } from './utils/settings';
import type { SiteSettings } from './utils/settings';
import { getStoredProjects } from './utils/projects';
import type { ProjectData } from './utils/projects';
import { getStoredBrandLogo, subscribeToBrandLogo } from './utils/brand';

const App: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>(() => getStoredProjects());
  const [activeCategory, setActiveCategory] = useState('All');
  const [brandLogo, setBrandLogo] = useState(() => getStoredBrandLogo());
  const [settings, setSettings] = useState<SiteSettings>(() => getStoredSettings());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = ['Home', 'Projects', 'Services', 'Tech-Stack', 'Process', 'Contact'];

  useEffect(() => subscribeToBrandLogo(setBrandLogo), []);
  useEffect(() => {
    const handler = () => setSettings(getStoredSettings());
    window.addEventListener('storage', handler);
    window.addEventListener('haritech-settings-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('haritech-settings-updated', handler);
    };
  }, []);
  useEffect(() => {
    const handler = () => setProjects(getStoredProjects());
    window.addEventListener('storage', handler);
    window.addEventListener('haritech-projects-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('haritech-projects-updated', handler);
    };
  }, []);

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  const categories = ['All', 'Business', 'Restaurant', 'School', 'Corporate', 'E-commerce'];

  return (
    <div className="relative min-h-screen bg-[#070a13] text-slate-100 overflow-x-hidden grid-bg-overlay">
      {/* Canvas interactive animation */}
      <ParticleBackground />

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none z-0" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-slate-950/40 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
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
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="text-slate-400 hover:text-cyan-400 transition-colors font-medium text-sm tracking-wide relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full" />
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 }}
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
              <motion.a
                href="#contact"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary py-2.5 px-5 rounded-xl text-sm hidden sm:inline-flex"
              >
                Get Started
              </motion.a>
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

      {/* Mobile Menu */}
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
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
                >
                  {item}
                </a>
              ))}
              <Link
                to="/haritech"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
              >
                Haritech Services
              </Link>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary mt-3 py-3 rounded-xl text-sm text-center"
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main>
        {/* Hero Section */}
        <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
              >
                <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span className="text-sm font-semibold text-slate-300">Brand Reborn • Premium Web Architecture</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight font-poppins"
              >
                Building Powerful
                <span className="block gradient-text mt-3 pb-3 text-shadow-glow">
                  Websites That Grow
                </span>
                <span>Businesses.</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className="text-lg md:text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed"
              >
                {settings.tagline}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row gap-5 justify-center mb-20"
              >
                <motion.a
                  href="#projects"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary text-base px-8 py-4 cursor-pointer"
                >
                  <FolderKanban className="h-5 w-5 mr-2" />
                  View Portfolio
                </motion.a>
                
                <motion.a
                  href="#contact"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary text-base px-8 py-4 flex items-center justify-center cursor-pointer"
                >
                  <Play className="h-5 w-5 mr-2 text-cyan-400" />
                  Free Consultation
                </motion.a>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="relative mx-auto max-w-4xl px-2"
              >
                <Tilt3D maxTilt={6}>
                  <div className="aspect-video bg-[#0e1326]/80 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden border border-white/10 backdrop-blur-lg">
                    {/* Simulated OS header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-white/5">
                      <div className="flex space-x-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-red-500/80 inline-block" />
                        <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 inline-block" />
                        <span className="w-3.5 h-3.5 rounded-full bg-green-500/80 inline-block" />
                      </div>
                      <div className="text-xs text-slate-500 font-mono">haritech-premium-engine.sh</div>
                      <div className="w-10" />
                    </div>
                    {/* Simulator inner body */}
                    <div className="w-full h-full bg-gradient-to-br from-indigo-950/20 via-slate-950/80 to-purple-950/20 flex flex-col items-center justify-center p-8 text-center">
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                      >
                        <Laptop className="h-8 w-8 text-cyan-400" />
                      </motion.div>
                      <h4 className="text-xl font-bold text-white mb-2">Futuristic Client Portal Console</h4>
                      <p className="text-sm text-slate-500 max-w-md">3D immersive renders, micro-interactions, responsive frameworks, and ultra-high-speed indexation mechanisms active.</p>
                      <div className="mt-4 flex items-center gap-3">
                        <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1.5 font-mono"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />Online</span>
                        <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs rounded-full font-mono">Vite + React</span>
                      </div>
                    </div>
                  </div>
                </Tilt3D>
                
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[#0e1326] rounded-full p-4 shadow-lg border border-white/10 cursor-pointer"
                  onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <ChevronDown className="h-5 w-5 text-cyan-400" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="section-padding bg-slate-950/20 border-y border-white/5 relative overflow-hidden">
          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                Our Architectural <span className="gradient-text">Metrics</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                We connect structural integrity with high-performing designs to trigger scalable conversions.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: "50+", label: "Portfolios Rebranded", icon: "🏢", color: "text-cyan-400" },
                { value: "20+", label: "Niche Verticals", icon: "⚙️", color: "text-purple-400" },
                { value: "100%", label: "UX Audited", icon: "🛡️", color: "text-blue-400" },
                { value: "99%", label: "Satisfactory Return", icon: "✨", color: "text-pink-400" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Tilt3D maxTilt={8}>
                    <div className="card p-8 text-center group hover:bg-[#141b35] transition-all duration-300 relative overflow-hidden glow-border">
                      {/* Interactive hover glow dot */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent blur-xl group-hover:scale-150 transition-all duration-500" />
                      <div className={`text-4xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        {stat.icon}
                      </div>
                      <div className={`text-4xl md:text-5xl font-black text-white mb-2 font-poppins`}>
                        {stat.value}
                      </div>
                      <div className="text-slate-400 font-medium text-sm tracking-wide">
                        {stat.label}
                      </div>
                    </div>
                  </Tilt3D>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Section */}
        <section id="projects" className="section-padding relative">
          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Premium <span className="gradient-text-pink">Showcase</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                Explore our portfolio of bespoke web architectures tailored for businesses looking to scale their authority.
              </p>
            </motion.div>
            
            {/* Filter Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="flex flex-wrap justify-center gap-3 mb-16"
            >
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                    activeCategory === category
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white border-transparent shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                      : 'bg-[#0e1326]/50 text-slate-400 border-white/5 hover:border-slate-500/35 hover:text-white'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>
            
            {/* Portfolio Grid */}
            <motion.div 
              layout 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="h-full"
                  >
                    <Tilt3D maxTilt={10} className="h-full">
                      <div className="card group cursor-pointer flex flex-col h-full bg-[#0e1326]/80 hover:bg-[#141b35]/90 transition-all duration-300 relative glow-border">
                        <div className="relative overflow-hidden rounded-t-2xl">
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-300" />
                          <div className="absolute top-4 right-4">
                            <span className="bg-slate-950/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-cyan-400">
                              {project.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-400 transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-grow line-clamp-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {project.tags.map((tag) => (
                              <span key={tag} className="text-xs bg-slate-900 border border-white/5 text-slate-400 px-2.5 py-1 rounded-lg">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-3">
                            <a
                              href={project.liveDemo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white py-2.5 px-4 rounded-xl transition-all text-xs font-bold border border-cyan-500/20 hover:border-transparent flex items-center justify-center gap-1"
                            >
                              Demo <ArrowRight className="h-3 w-3" />
                            </a>
                            <Link
                              to={`/project/${project.id}`}
                              className="flex-1 text-center bg-slate-900 border border-white/5 text-slate-300 hover:text-white py-2.5 px-4 rounded-xl hover:bg-slate-800 transition-all text-xs font-bold flex items-center justify-center"
                            >
                              Case Study
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Tilt3D>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <ServicesSection />
        
        {/* Technology Stack Section */}
        <TechnologyStackSection />
        
        {/* Testimonials Section */}
        <TestimonialsSection />
        
        {/* Why Choose Section */}
        <WhyChooseSection />
        
        {/* Development Process Section */}
        <DevelopmentProcessSection />
        
        {/* Contact Section */}
        <ContactSection />
        
        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default App;