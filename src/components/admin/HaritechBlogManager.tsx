import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit, Trash2, X } from 'lucide-react';
import { getBlogPosts, setBlogPosts, BlogPost } from '../../utils/haritechContent';

const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";

const blogCategories = ['All', 'Design', 'Business', 'SEO', 'AI', 'Branding', 'Marketing', 'E-commerce'];

const HaritechBlogManager: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>(() => getBlogPosts());
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState<BlogPost>({ id: 0, title: '', excerpt: '', category: 'Design', author: 'Haritech Team', date: '', readTime: '5 min', content: '' });

  useEffect(() => { setPosts(getBlogPosts()); }, []);

  const handleSave = () => {
    if (!setBlogPosts(posts)) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const savePost = (p: BlogPost) => {
    if (editing) {
      setPosts(posts.map(pp => pp.id === p.id ? p : pp));
    } else {
      setPosts([...posts, { ...p, id: Date.now(), date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }]);
    }
    setEditing(null);
    setShowForm(false);
  };

  const deletePost = (id: number) => setPosts(posts.filter(p => p.id !== id));

  const openAdd = () => { setFormData({ id: 0, title: '', excerpt: '', category: 'Design', author: 'Haritech Team', date: '', readTime: '5 min', content: '' }); setEditing(null); setShowForm(true); };
  const openEdit = (p: BlogPost) => { setFormData(p); setEditing(p); setShowForm(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Manage your blog posts and articles.</p>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm"><Save className="h-4 w-4" /> Save</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAdd} className="flex items-center gap-2 px-4 py-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-sm font-bold hover:bg-cyan-500 hover:text-white transition-all"><Plus className="h-4 w-4" /> New Post</motion.button>
        </div>
      </div>
      {saved && <div className="text-emerald-400 text-sm font-bold">Saved successfully!</div>}

      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id} className="flex items-center gap-4 p-4 bg-slate-950/40 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center text-2xl shrink-0">📝</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">{post.title}</h4>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>{post.category}</span>
                <span>•</span>
                <span>{post.readTime}</span>
                <span>•</span>
                <span>{post.date}</span>
              </div>
            </div>
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(post)} className="p-2 text-slate-600 hover:text-cyan-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Edit className="h-3.5 w-3.5" /></button>
              <button onClick={() => deletePost(post.id)} className="p-2 text-slate-600 hover:text-red-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#0e1326] border border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{editing ? 'Edit' : 'New'} Blog Post</h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white border border-white/5"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); savePost(formData); }} className="space-y-4">
                <div>
                  <label className={labelClass}>Title *</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Excerpt *</label>
                  <textarea rows={3} required value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} className={`${inputClass} resize-none`} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Category *</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className={`${inputClass} bg-slate-950/60`}>
                      {blogCategories.filter(c => c !== 'All').map(c => <option key={c} className="bg-[#0e1326]">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Read Time</label>
                    <input type="text" value={formData.readTime} onChange={e => setFormData({ ...formData, readTime: e.target.value })} className={inputClass} placeholder="5 min" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Author</label>
                  <input type="text" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Article Content</label>
                  <textarea rows={8} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className={`${inputClass} resize-none font-mono text-xs`} placeholder="Write your article content here..." />
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="submit" className="flex-1 btn-primary px-6 py-3 rounded-xl text-sm"><Save className="h-4 w-4" /> {editing ? 'Update' : 'Publish'} Post</button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-sm text-slate-400">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HaritechBlogManager;
