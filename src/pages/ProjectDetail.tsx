import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Check, Monitor, Tablet, Smartphone, Code2, Zap, Gauge, Sparkles } from 'lucide-react';
import Tilt3D from '../components/Tilt3D';
import { getStoredProjects } from '../utils/projects';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const allProjects = getStoredProjects();
  const project = allProjects.find(p => p.id === parseInt(id || '0'));

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070a13]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Project Not Found</h1>
          <p className="text-slate-400 mb-8">The requested project does not exist.</p>
          <Link to="/" className="btn-primary">
            Back to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  const nextProject = allProjects.find(p => p.id === project.id + 1) || allProjects[0];

  return (
    <div className="bg-[#070a13] min-h-screen text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back to Portfolio</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600">
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                HARITECH
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section - Full Bleed Parallax */}
        <section className="relative min-h-[75vh] flex items-end overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-[#070a13] z-10" />
          <div 
            className="absolute inset-0 bg-cover bg-center z-0 scale-105"
            style={{ backgroundImage: `url(${project.desktopImage})` }}
          />
          {/* Animated overlay particles */}
          <div className="absolute inset-0 z-[5] bg-gradient-to-t from-[#070a13] via-transparent to-transparent" />
          
          <div className="container mx-auto px-6 pb-16 relative z-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <span className="bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20 text-cyan-400 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {project.category}
                </span>
                <span className="text-slate-500 text-sm font-mono">• {project.year}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
                {project.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-8">
                {project.tags.map((tag) => (
                  <span key={tag} className="bg-slate-900/60 backdrop-blur-sm border border-white/5 text-slate-400 px-3 py-1 rounded-lg text-xs font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
              <motion.a
                href={project.liveDemo}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary text-sm px-8 py-3.5 inline-flex"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Live Demo
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="section-padding">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="text-3xl font-bold mb-6 text-white"
                >
                  Project Overview
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-lg text-slate-400 leading-relaxed"
                >
                  {project.description}
                </motion.p>
              </div>
              <div>
                <Tilt3D maxTilt={6}>
                  <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border">
                    <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-cyan-400" /> Client Goals
                    </h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      Create a modern digital presence that showcases the client's brand, services, and expertise while driving conversions.
                    </p>
                    <h3 className="text-lg font-bold mb-4 mt-6 text-white">Key Features</h3>
                    <ul className="space-y-3">
                      {project.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                            <Check className="h-3 w-3 text-cyan-400" />
                          </span>
                          <span className="text-slate-400 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Tilt3D>
              </div>
            </div>
          </div>
        </section>

        {/* Challenges & Solutions */}
        <section className="section-padding bg-slate-950/30">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Tilt3D maxTilt={5}>
                  <div className="card p-8 bg-[#0e1326]/80 border-white/5 h-full glow-border">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                      <Zap className="h-5 w-5 text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white">Challenges</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                      {project.challenges}
                    </p>
                  </div>
                </Tilt3D>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <Tilt3D maxTilt={5}>
                  <div className="card p-8 bg-emerald-500/5 border-emerald-500/10 h-full glow-border">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                      <Check className="h-5 w-5 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white">Solutions</h3>
                    <p className="text-slate-300 leading-relaxed text-sm">
                      {project.solutions}
                    </p>
                  </div>
                </Tilt3D>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Device Previews */}
        <section className="section-padding">
          <div className="container mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-4xl font-black text-center mb-16"
            >
              Responsive <span className="gradient-text">Showcase</span>
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Desktop Experience', icon: Monitor, image: project.desktopImage, aspect: 'aspect-video' },
                { label: 'Tablet Experience', icon: Tablet, image: project.tabletImage, aspect: 'aspect-[3/4]' },
                { label: 'Mobile Experience', icon: Smartphone, image: project.mobileImage, aspect: 'aspect-[9/16]' },
              ].map((device, index) => (
                <motion.div
                  key={device.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <Tilt3D maxTilt={8}>
                    <div className="card p-6 bg-[#0e1326]/80 border-white/5 glow-border">
                      <div className="bg-slate-950/60 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <device.icon className="h-5 w-5 text-cyan-400" />
                          <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">{device.label.split(' ')[0]}</span>
                        </div>
                        <div className={`${device.aspect} overflow-hidden rounded-lg`}>
                          <img
                            src={device.image}
                            alt={device.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <h4 className="font-bold text-white text-center text-sm">{device.label}</h4>
                    </div>
                  </Tilt3D>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="section-padding bg-slate-950/30">
          <div className="container mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-4xl font-black text-center mb-16"
            >
              Technology <span className="gradient-text-pink">Stack</span>
            </motion.h2>
            
            <div className="flex flex-wrap justify-center gap-4">
              {project.technology.map((tech, index) => (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -3, borderColor: 'rgba(6, 182, 212, 0.4)' }}
                  className="card px-6 py-3.5 bg-[#0e1326]/80 border-white/5 cursor-pointer hover:bg-[#141b35] transition-all"
                >
                  <span className="font-bold text-cyan-400 text-sm">{tech}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Performance Metrics */}
        <section className="section-padding">
          <div className="container mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-4xl font-black text-center mb-16"
            >
              Performance <span className="gradient-text">Metrics</span>
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { label: 'Load Time', value: project.metrics.loadTime, color: 'text-cyan-400', icon: Zap, glow: 'shadow-[0_0_25px_rgba(6,182,212,0.2)]' },
                { label: 'Performance Score', value: `${project.metrics.performanceScore}%`, color: 'text-emerald-400', icon: Gauge, glow: 'shadow-[0_0_25px_rgba(16,185,129,0.2)]' },
                { label: 'Mobile Score', value: `${project.metrics.mobileScore}%`, color: 'text-purple-400', icon: Smartphone, glow: 'shadow-[0_0_25px_rgba(139,92,246,0.2)]' },
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <Tilt3D maxTilt={8}>
                    <div className={`card p-8 bg-[#0e1326]/80 border-white/5 text-center glow-border ${metric.glow}`}>
                      <metric.icon className={`h-8 w-8 ${metric.color} mx-auto mb-4`} />
                      <div className={`text-5xl font-black ${metric.color} mb-3`}>
                        {metric.value}
                      </div>
                      <div className="text-slate-400 font-medium text-sm">{metric.label}</div>
                    </div>
                  </Tilt3D>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Next Project */}
        <section className="section-padding bg-slate-950/30">
          <div className="container mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-8 text-white">Next Project</h2>
              <Link to={`/project/${nextProject.id}`}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="card overflow-hidden max-w-4xl mx-auto bg-[#0e1326]/80 border-white/5 hover:border-cyan-500/25 transition-all glow-border"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={nextProject.image}
                      alt={nextProject.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070a13] via-slate-950/50 to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Up Next</span>
                      <h3 className="text-2xl font-bold text-white mt-1">{nextProject.title}</h3>
                      <p className="text-slate-400 text-sm mt-1">{nextProject.category} Project</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectDetail;