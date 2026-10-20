import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Play, Sparkles, FolderKanban, Laptop, ArrowRight } from 'lucide-react';
import Tilt3D from '../../components/Tilt3D';
import TestimonialsSection from '../../components/TestimonialsSection';
import { getStoredSettings } from '../../utils/settings';
import type { SiteSettings } from '../../utils/settings';
import { getStoredProjects } from '../../utils/projects';
import type { ProjectData } from '../../utils/projects';

const Home: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(() => getStoredSettings());
  const [projects, setProjects] = useState<ProjectData[]>(() => getStoredProjects());
  const navigate = useNavigate();

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

  const featuredProjects = projects.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
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
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight font-syne"
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
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/portfolio/projects"
                  className="btn-primary text-base px-8 py-4 cursor-pointer inline-flex items-center"
                >
                  <FolderKanban className="h-5 w-5 mr-2" />
                  View Portfolio
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/portfolio/contact"
                  className="btn-secondary text-base px-8 py-4 flex items-center justify-center cursor-pointer"
                >
                  <Play className="h-5 w-5 mr-2 text-cyan-400" />
                  Free Consultation
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative mx-auto max-w-4xl px-2"
            >
              <Tilt3D maxTilt={6}>
                <div className="aspect-video bg-[#0e1326]/80 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden border border-white/10 backdrop-blur-lg">
                  <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-white/5">
                    <div className="flex space-x-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-red-500/80 inline-block" />
                      <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 inline-block" />
                      <span className="w-3.5 h-3.5 rounded-full bg-green-500/80 inline-block" />
                    </div>
                    <div className="text-xs text-slate-500 font-mono">haritech-premium-engine.sh</div>
                    <div className="w-10" />
                  </div>
                  <div className="w-full h-full bg-gradient-to-br from-indigo-950/20 via-slate-950/80 to-purple-950/20 flex flex-col items-center justify-center p-8 text-center">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
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
                onClick={() => navigate('/portfolio/projects')}
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
              Our Architectural <span className="gradient-text">Metrics</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              We connect structural integrity with high-performing designs to trigger scalable conversions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '50+', label: 'Portfolios Rebranded', icon: '🏢' },
              { value: '20+', label: 'Niche Verticals', icon: '⚙️' },
              { value: '100%', label: 'UX Audited', icon: '🛡️' },
              { value: '99%', label: 'Satisfactory Return', icon: '✨' },
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
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent blur-xl group-hover:scale-150 transition-all duration-500" />
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-white mb-2 font-syne">
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

      {/* Featured Projects Preview */}
      <section className="section-padding relative">
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
              Featured <span className="gradient-text-pink">Work</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              A taste of our bespoke web architectures tailored for businesses looking to scale.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProjects.map((project) => (
              <Tilt3D key={project.id} maxTilt={10} className="h-full">
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
                    <Link
                      to={`/project/${project.id}`}
                      className="flex-1 text-center bg-slate-900 border border-white/5 text-slate-300 hover:text-white py-2.5 px-4 rounded-xl hover:bg-slate-800 transition-all text-xs font-bold flex items-center justify-center"
                    >
                      Case Study
                    </Link>
                  </div>
                </div>
              </Tilt3D>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/portfolio/projects"
              className="btn-primary text-base px-8 py-4 inline-flex items-center"
            >
              View All Projects <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <TestimonialsSection />
    </div>
  );
};

export default Home;
