import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit, Trash2, X, Layers } from 'lucide-react';
import { getWhatWeDoAreas, setWhatWeDoAreas, WhatWeDoArea } from '../../utils/haritechContent';

const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";

const iconOptions = [
  'Globe', 'Code2', 'ShoppingCart', 'Layout', 'Monitor', 'BookOpen', 'Building2', 'Hotel', 'Utensils', 'Home',
  'Zap', 'Cpu', 'Smartphone', 'Palette', 'Search', 'Settings', 'Shield', 'Globe2', 'Server', 'Mail',
  'Headphones', 'Briefcase', 'Sparkles', 'Layers', 'ArrowRight',
];

const colorOptions = [
  'from-pink-500 to-rose-600', 'from-cyan-500 to-blue-600', 'from-green-500 to-teal-600', 'from-blue-500 to-indigo-600',
  'from-purple-500 to-violet-600', 'from-orange-500 to-amber-600', 'from-red-500 to-rose-600', 'from-emerald-500 to-green-600',
  'from-amber-500 to-yellow-600', 'from-indigo-500 to-purple-600', 'from-sky-500 to-blue-600', 'from-pink-500 to-fuchsia-600',
  'from-rose-500 to-red-600', 'from-slate-500 to-gray-600', 'from-teal-500 to-cyan-600', 'from-violet-500 to-purple-600',
  'from-blue-600 to-indigo-600', 'from-cyan-500 to-blue-600', 'from-gray-500 to-slate-600', 'from-green-500 to-emerald-600',
];

const emptyArea: WhatWeDoArea = { title: '', desc: '', icon: 'Code2', color: 'from-cyan-500 to-blue-600' };

const HaritechWhatWeDoManager: React.FC = () => {
  const [areas, setAreas] = useState<WhatWeDoArea[]>(() => getWhatWeDoAreas());
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<WhatWeDoArea>(emptyArea);

  useEffect(() => { setAreas(getWhatWeDoAreas()); }, []);

  const handleSave = () => {
    setWhatWeDoAreas(areas);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const saveArea = () => {
    if (!formData.title.trim()) return;
    const clean = { ...formData, title: formData.title.trim(), desc: formData.desc.trim() };
    if (editingIndex !== null) {
      setAreas(areas.map((a, i) => i === editingIndex ? clean : a));
    } else {
      setAreas([...areas, clean]);
    }
    setShowForm(false);
    setEditingIndex(null);
  };

  const openAdd = () => { setFormData(emptyArea); setEditingIndex(null); setShowForm(true); };
  const openEdit = (index: number) => { setFormData({ ...areas[index] }); setEditingIndex(index); setShowForm(true); };
  const deleteArea = (index: number) => setAreas(areas.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Manage expertise areas shown on the What We Do page.</p>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm"><Save className="h-4 w-4" /> Save</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAdd} className="flex items-center gap-2 px-4 py-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-sm font-bold hover:bg-cyan-500 hover:text-white transition-all"><Plus className="h-4 w-4" /> Add Area</motion.button>
        </div>
      </div>
      {saved && <div className="text-emerald-400 text-sm font-bold">Saved successfully!</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas.map((area, i) => (
          <div key={i} className="card p-6 bg-[#0e1326]/80 border-white/5 glow-border">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${area.color} p-2 flex items-center justify-center`}>
                <Layers className="h-full w-full text-white" />
              </div>
              <h4 className="font-bold text-white text-sm flex-1">{area.title}</h4>
            </div>
            <p className="text-xs text-slate-500 mb-4 line-clamp-2">{area.desc}</p>
            <div className="flex gap-2">
              <button onClick={() => openEdit(i)} className="p-2 text-slate-500 hover:text-cyan-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Edit className="h-3.5 w-3.5" /></button>
              <button onClick={() => deleteArea(i)} className="p-2 text-slate-500 hover:text-red-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#0e1326] border border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{editingIndex !== null ? 'Edit' : 'Add'} Expertise Area</h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white border border-white/5"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); saveArea(); }} className="space-y-4">
                <div>
                  <label className={labelClass}>Title *</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputClass} placeholder="e.g. Website Design" />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea rows={3} value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className={`${inputClass} resize-none`} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Icon</label>
                    <select value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} className={inputClass}>
                      {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Color</label>
                    <select value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className={inputClass}>
                      {colorOptions.map(color => <option key={color} value={color}>{color.replace('from-', '').replace(' to-', ' → ')}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="submit" className="flex-1 btn-primary px-6 py-3 rounded-xl text-sm"><Save className="h-4 w-4" /> {editingIndex !== null ? 'Update' : 'Add'} Area</button>
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

export default HaritechWhatWeDoManager;
