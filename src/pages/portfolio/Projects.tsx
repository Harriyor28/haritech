import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Tilt3D from '../../components/Tilt3D';
import { getStoredProjects } from '../../utils/projects';
import type { ProjectData } from '../../utils/projects';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>(() => getStoredProjects());
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const handler = () => setProjects(getStoredProjects());
    window.addEventListener('storage', handler);
    window.addEventListener('haritech-projects-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('haritech-projects-updated', handler);
    };
  }, []);

  const filteredProjects =
    activeCategory === 'All' ? projects : projects.filter((p) => p.category === activeCategory);

  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];

  // Keep the active filter valid when the project list changes
  useEffect(() => {
    if (!categories.includes(activeCategory)) setActiveCategory('All');
  }, [projects]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="pt-24">
      <section className="section-padding relative">
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
              Premium <span className="gradient-text-pink">Showcase</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              Explore our portfolio of bespoke web architectures tailored for businesses looking to scale their authority.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
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

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                          {(project.tags ?? []).map((tag) => (
                            <span key={tag} className="text-xs bg-slate-900 border border-white/5 text-slate-400 px-2.5 py-1 rounded-lg">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          {project.liveDemo ? (
                            <a
                              href={project.liveDemo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white py-2.5 px-4 rounded-xl transition-all text-xs font-bold border border-cyan-500/20 hover:border-transparent flex items-center justify-center gap-1"
                            >
                              Demo <ArrowRight className="h-3 w-3" />
                            </a>
                          ) : (
                            <Link
                              to={`/project/${project.id}`}
                              className="flex-1 text-center bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white py-2.5 px-4 rounded-xl transition-all text-xs font-bold border border-cyan-500/20 hover:border-transparent flex items-center justify-center gap-1"
                            >
                              Demo <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
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

          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 card max-w-xl mx-auto"
            >
              <p className="text-slate-400 mb-1 text-sm">No projects found</p>
              <p className="text-slate-600 text-xs">
                {projects.length === 0
                  ? 'Projects will appear here once they are added.'
                  : 'Try another category.'}
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Projects;
