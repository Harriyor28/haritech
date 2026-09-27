import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, Monitor, Zap } from 'lucide-react';
import { getStoredProjects } from '../../utils/projects';
import type { ProjectData } from '../../utils/projects';

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const HaritechPortfolio: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>(() => getStoredProjects());

  useEffect(() => {
    const handler = () => setProjects(getStoredProjects());
    window.addEventListener('haritech-projects-updated', handler);
    return () => window.removeEventListener('haritech-projects-updated', handler);
  }, []);

  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

      <section className="relative pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInView>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
                <Monitor className="h-4 w-4" /> Our Portfolio
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 font-poppins">
                Projects We've <span className="gradient-text-pink">Delivered</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Browse through our portfolio of completed projects across various industries. Each project reflects our commitment to quality, creativity, and client satisfaction.
              </p>
            </FadeInView>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container mx-auto">
          {projects.length === 0 ? (
            <div className="text-center py-20">
              <Monitor className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400 mb-2">No Projects Yet</h3>
              <p className="text-slate-500">Projects will appear here once they are added via the admin panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, i) => (
                <FadeInView key={project.id} delay={i * 0.08}>
                  <div className="card group overflow-hidden h-full glow-border">
                    <div className="relative overflow-hidden">
                      <img src={project.image} alt={project.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                      <span className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-cyan-400">{project.category}</span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                      <p className="text-sm text-slate-400 mb-4 leading-relaxed line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {(project.tags ?? []).map(tag => (
                          <span key={tag} className="text-xs bg-slate-900 border border-white/5 text-slate-400 px-2.5 py-1 rounded-lg">{tag}</span>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        {project.liveDemo && (
                          <a href={project.liveDemo} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white py-2.5 px-4 rounded-xl transition-all text-xs font-bold border border-cyan-500/20 hover:border-transparent flex items-center justify-center gap-1">
                            Live Demo <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <Link to={`/project/${project.id}`} className="flex-1 text-center bg-slate-900 border border-white/5 text-slate-300 hover:text-white py-2.5 px-4 rounded-xl hover:bg-slate-800 transition-all text-xs font-bold flex items-center justify-center gap-1">
                          Details <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </FadeInView>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 relative overflow-hidden bg-slate-950/30">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/10 to-purple-600/20" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <FadeInView>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Want a Project Like These?</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">Let's create something amazing for your business. Get in touch today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/haritech/request-quote" className="btn-primary text-base px-10 py-4"><Zap className="h-5 w-5" /> Start Your Project</Link>
              <Link to="/haritech/contact" className="btn-secondary text-base px-10 py-4">Contact Us <ArrowRight className="h-4 w-4 text-cyan-400" /></Link>
            </div>
          </FadeInView>
        </div>
      </section>
    </div>
  );
};

export default HaritechPortfolio;
