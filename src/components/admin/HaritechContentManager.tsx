import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { getHaritechContent, setHaritechContent, HaritechSiteContent } from '../../utils/haritechContent';

const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";

const HaritechContentManager: React.FC = () => {
  const [content, setContent] = useState<HaritechSiteContent>(() => getHaritechContent());
  const [saved, setSaved] = useState(false);

  useEffect(() => { setContent(getHaritechContent()); }, []);

  const handleSave = () => {
    if (!setHaritechContent(content)) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateStat = (index: number, field: 'value' | 'label', val: string) => {
    const stats = [...content.stats];
    stats[index] = { ...stats[index], [field]: val };
    setContent({ ...content, stats });
  };

  const addStat = () => setContent({ ...content, stats: [...content.stats, { value: '', label: '' }] });
  const removeStat = (index: number) => setContent({ ...content, stats: content.stats.filter((_, i) => i !== index) });

  const updateWhy = (index: number, field: 'title' | 'desc', val: string) => {
    const why = [...content.whyChoose];
    why[index] = { ...why[index], [field]: val };
    setContent({ ...content, whyChoose: why });
  };

  const addWhy = () => setContent({ ...content, whyChoose: [...content.whyChoose, { title: '', desc: '' }] });
  const removeWhy = (index: number) => setContent({ ...content, whyChoose: content.whyChoose.filter((_, i) => i !== index) });

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border">
        <h3 className="text-xl font-bold text-white mb-6">Hero Section</h3>
        <div className="space-y-5 max-w-2xl">
          <div>
            <label className={labelClass}>Hero Title</label>
            <input type="text" value={content.heroTitle} onChange={e => setContent({ ...content, heroTitle: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Hero Subtitle</label>
            <textarea rows={3} value={content.heroSubtitle} onChange={e => setContent({ ...content, heroSubtitle: e.target.value })} className={`${inputClass} resize-none`} />
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border">
        <h3 className="text-xl font-bold text-white mb-6">About Section</h3>
        <div className="space-y-5 max-w-2xl">
          <div>
            <label className={labelClass}>Company Story</label>
            <textarea rows={5} value={content.aboutStory} onChange={e => setContent({ ...content, aboutStory: e.target.value })} className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>Mission</label>
            <textarea rows={3} value={content.mission} onChange={e => setContent({ ...content, mission: e.target.value })} className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>Vision</label>
            <textarea rows={3} value={content.vision} onChange={e => setContent({ ...content, vision: e.target.value })} className={`${inputClass} resize-none`} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Statistics</h3>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addStat} className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all">
            <Plus className="h-3 w-3" /> Add Stat
          </motion.button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-slate-950/40 rounded-xl border border-white/5">
              <GripVertical className="h-4 w-4 text-slate-600 shrink-0" />
              <input type="text" value={stat.value} onChange={e => updateStat(i, 'value', e.target.value)} className="w-24 px-3 py-2 bg-slate-900 rounded-lg border border-white/5 text-sm text-white text-center" placeholder="150+" />
              <input type="text" value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} className="flex-1 px-3 py-2 bg-slate-900 rounded-lg border border-white/5 text-sm text-white" placeholder="Projects Delivered" />
              <button onClick={() => removeStat(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose */}
      <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Why Choose Haritech</h3>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addWhy} className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all">
            <Plus className="h-3 w-3" /> Add Item
          </motion.button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.whyChoose.map((item, i) => (
            <div key={i} className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <input type="text" value={item.title} onChange={e => updateWhy(i, 'title', e.target.value)} className="flex-1 px-3 py-2 bg-slate-900 rounded-lg border border-white/5 text-sm font-bold text-white" placeholder="Title" />
                <button onClick={() => removeWhy(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-2"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              <textarea rows={2} value={item.desc} onChange={e => updateWhy(i, 'desc', e.target.value)} className="w-full px-3 py-2 bg-slate-900 rounded-lg border border-white/5 text-sm text-slate-300 resize-none" placeholder="Description" />
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm">
          <Save className="h-4 w-4" /> Save All Content
        </motion.button>
        {saved && <span className="text-emerald-400 text-sm font-bold">Saved successfully!</span>}
      </div>
    </div>
  );
};

export default HaritechContentManager;
