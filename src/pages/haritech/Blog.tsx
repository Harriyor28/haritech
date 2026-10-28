import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle, Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { getBlogPosts } from '../../utils/haritechContent';
import type { BlogPost } from '../../utils/haritechContent';

const categories = ['All', 'Technology', 'Importation', 'Interiors', 'Printing', 'Solar'];

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>(() => getBlogPosts());
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const handler = () => setPosts(getBlogPosts());
    window.addEventListener('haritech-blog-updated', handler);
    return () => window.removeEventListener('haritech-blog-updated', handler);
  }, []);

  const filteredPosts = activeCategory === 'All' ? posts : posts.filter(p => p.category === activeCategory);

  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

      <section className="relative pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInView>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
                <MessageCircle className="h-4 w-4" /> Notes & Guides
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 font-syne tracking-tight">
                Practical <span className="gradient-text">Guides</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Short, practical notes on buying tech, preparing an importation enquiry, choosing a floor finish, briefing a print job and sizing a solar requirement — written to be useful before you spend money.
              </p>
            </FadeInView>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${activeCategory === cat ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-lg' : 'bg-[#0e1326]/50 text-slate-400 border-white/5 hover:border-slate-500/35 hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, i) => (
              <FadeInView key={post.title} delay={i * 0.06}>
                <div className="card group overflow-hidden h-full glow-border">
                  <div className="h-48 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 flex items-center justify-center border-b border-white/5">
                    <MessageCircle className="h-16 w-16 text-cyan-400/30 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full font-semibold">{post.category}</span>
                      <span className="text-xs text-slate-600 flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-slate-400 mb-4 leading-relaxed line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <User className="h-3 w-3" /> {post.author}
                        <span className="mx-1">•</span>
                        <Calendar className="h-3 w-3" /> {post.date}
                      </div>
                      <Link to="/haritech/contact" className="text-xs text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">Ask about this <ArrowRight className="h-3 w-3" /></Link>
                    </div>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <MessageCircle className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400 mb-2">No Articles Found</h3>
              <p className="text-slate-500">Check back soon for new articles in this category.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 relative overflow-hidden bg-slate-950/30">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/10 to-purple-600/20" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <FadeInView>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4">New Guides by Email</h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">Occasional practical notes only — unsubscribe whenever you like. If a guide misses your situation, use the contact page and we will answer directly.</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" className="flex-1 px-5 py-3.5 rounded-xl bg-slate-950/60 border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-white placeholder-slate-600 text-sm" required />
              <button type="submit" className="btn-primary px-8 py-3.5 rounded-xl text-sm whitespace-nowrap">Subscribe</button>
            </form>
          </FadeInView>
        </div>
      </section>
    </div>
  );
};

export default Blog;
