import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Zap, TrendingUp, Users, Code2, Palette, ShoppingCart, Smartphone, Search, BarChart3, MessageCircle, Star, Quote } from 'lucide-react';
import { getStoredProjects } from '../../utils/projects';
import type { ProjectData } from '../../utils/projects';
import { getStoredTestimonials, Testimonial } from '../../utils/testimonials';
import { getHaritechContent, HaritechSiteContent, getWhatsAppUrl } from '../../utils/haritechContent';

const iconMap: Record<string, React.FC<any>> = { Code2, Users, TrendingUp, Star, Zap, Shield, MessageCircle, Smartphone, Search };

const featuredServices = [
  { title: 'Web Development', desc: 'Custom websites, e-commerce, portals & web apps built with modern stacks.', icon: Code2, color: 'from-cyan-500 to-blue-600' },
  { title: 'UI/UX Design', desc: 'Stunning interfaces with seamless user experiences that convert.', icon: Palette, color: 'from-purple-500 to-pink-600' },
  { title: 'Mobile Apps', desc: 'Native & cross-platform mobile applications for iOS and Android.', icon: Smartphone, color: 'from-orange-500 to-red-600' },
  { title: 'Digital Marketing', desc: 'SEO, social media, and content strategies to grow your reach.', icon: BarChart3, color: 'from-green-500 to-teal-600' },
  { title: 'Branding', desc: 'Complete brand identity — logos, profiles, and visual guidelines.', icon: Sparkles, color: 'from-pink-500 to-rose-600' },
  { title: 'Business Automation', desc: 'Streamline operations with custom automation & AI solutions.', icon: Zap, color: 'from-amber-500 to-orange-600' },
  { title: 'E-commerce', desc: 'Full-featured online stores with payments, inventory & analytics.', icon: ShoppingCart, color: 'from-blue-500 to-indigo-600' },
  { title: 'Web Security', desc: 'Secure your digital assets with enterprise-grade protection.', icon: Shield, color: 'from-red-500 to-rose-600' },
];

const defaultWhyIcons: Record<string, React.FC<any>> = {
  'Experienced Team': Users, 'Affordable Pricing': TrendingUp, 'Fast Delivery': Zap,
  'SEO Optimized': Search, 'Mobile Friendly': Smartphone, 'Reliable Support': MessageCircle,
  'Secure Solutions': Shield, 'Client Satisfaction': Star,
};

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const HaritechHome: React.FC = () => {
  const [content, setContent] = useState<HaritechSiteContent>(() => getHaritechContent());
  const [projects, setProjects] = useState<ProjectData[]>(() => getStoredProjects().slice(0, 6));
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => getStoredTestimonials().slice(0, 3));

  useEffect(() => {
    const handler = () => setContent(getHaritechContent());
    window.addEventListener('haritech-content-updated', handler);
    return () => window.removeEventListener('haritech-content-updated', handler);
  }, []);

  useEffect(() => {
    const handler = () => setProjects(getStoredProjects().slice(0, 6));
    window.addEventListener('haritech-projects-updated', handler);
    return () => window.removeEventListener('haritech-projects-updated', handler);
  }, []);

  useEffect(() => {
    const handler = () => setTestimonials(getStoredTestimonials().slice(0, 3));
    window.addEventListener('haritech-testimonials-updated', handler);
    return () => window.removeEventListener('haritech-testimonials-updated', handler);
  }, []);

  const statsWithIcons = content.stats.map(s => ({ ...s, icon: iconMap[s.label] || TrendingUp }));

  return (
    <div className="relative overflow-x-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-16 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" /> Your Digital Success Partner
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight font-poppins">
              {content.heroTitle}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-lg md:text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              {content.heroSubtitle}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35 }} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/haritech/request-quote" className="btn-primary text-base px-8 py-4"><Zap className="h-5 w-5" /> Get Started</Link>
              <Link to="/haritech/portfolio" className="btn-secondary text-base px-8 py-4"><ArrowRight className="h-5 w-5 text-cyan-400" /> View Portfolio</Link>
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="btn-secondary text-base px-8 py-4"><MessageCircle className="h-5 w-5 text-green-400" /> WhatsApp Us</a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-950/20 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {statsWithIcons.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                  <Icon className="h-6 w-6 text-cyan-400 mx-auto mb-3" />
                  <div className="text-3xl md:text-4xl font-black text-white mb-1 font-poppins">{stat.value}</div>
                  <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="section-padding">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Our <span className="gradient-text">Services</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Comprehensive digital solutions tailored to elevate your business.</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((svc, i) => (
              <FadeInView key={svc.title} delay={i * 0.05}>
                <div className="card p-6 h-full hover:bg-[#141b35] transition-all duration-300 group glow-border">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${svc.color} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <svc.icon className="h-full w-full text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{svc.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{svc.desc}</p>
                </div>
              </FadeInView>
            ))}
          </div>
          <FadeInView>
            <div className="text-center mt-10">
              <Link to="/haritech/services" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5">View All Services <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="section-padding bg-slate-950/20">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Our <span className="gradient-text-pink">Portfolio</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Discover the projects we've delivered with passion and precision.</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, i) => (
              <FadeInView key={project.id} delay={i * 0.08}>
                <div className="card group overflow-hidden h-full glow-border">
                  <div className="relative overflow-hidden">
                    <img src={project.image} alt={project.title} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-cyan-400">{project.category}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tags.slice(0, 3).map(t => <span key={t} className="text-xs bg-slate-900 border border-white/5 text-slate-400 px-2 py-1 rounded-lg">{t}</span>)}
                    </div>
                    <div className="flex gap-2">
                      <a href={project.liveDemo} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white py-2 rounded-xl text-xs font-bold border border-cyan-500/20 hover:border-transparent transition-all">Live Demo</a>
                      <Link to={`/project/${project.id}`} className="flex-1 text-center bg-slate-900 border border-white/5 text-slate-300 hover:text-white py-2 rounded-xl hover:bg-slate-800 text-xs font-bold transition-all">Details</Link>
                    </div>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
          <FadeInView>
            <div className="text-center mt-10">
              <Link to="/haritech/portfolio" className="btn-secondary inline-flex items-center gap-2 px-8 py-3.5">View Full Portfolio <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">What <span className="gradient-text">Clients Say</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Trusted by businesses across industries.</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <FadeInView key={i} delay={i * 0.1}>
                <div className="card p-8 h-full glow-border">
                  <Quote className="h-8 w-8 text-cyan-400/30 mb-4" />
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">{t.content}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">{t.name[0]}</div>
                    <div>
                      <div className="text-sm font-bold text-white">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.position}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3">
                    {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-cyan-400 text-cyan-400" />)}
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="section-padding bg-slate-950/20">
        <div className="container mx-auto">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Why Choose <span className="gradient-text-pink">Haritech?</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">We combine expertise, creativity, and technology to deliver exceptional results.</p>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {content.whyChoose.map((item, i) => {
              const Icon = defaultWhyIcons[item.title] || Zap;
              return (
                <FadeInView key={item.title} delay={i * 0.05}>
                  <div className="card p-5 h-full hover:bg-[#141b35] transition-all group glow-border">
                    <Icon className="h-8 w-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </FadeInView>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/10 to-purple-600/20" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <FadeInView>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Ready to Transform Your Business?</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">Let's discuss your project and create something extraordinary together.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/haritech/request-quote" className="btn-primary text-base px-10 py-4"><Zap className="h-5 w-5" /> Get Started Today</Link>
              <Link to="/haritech/contact" className="btn-secondary text-base px-10 py-4"><MessageCircle className="h-5 w-5 text-cyan-400" /> Contact Us</Link>
            </div>
          </FadeInView>
        </div>
      </section>
    </div>
  );
};

export default HaritechHome;
