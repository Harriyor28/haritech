import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit, Trash2, X } from 'lucide-react';
import { getIndustries, setIndustries, IndustryCard } from '../../utils/haritechContent';

const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";

const iconOptions = ['Building2', 'Rocket', 'Briefcase', 'Utensils', 'Hotel', 'BookOpen', 'Church', 'Heart', 'Shirt', 'Sprout', 'Factory', 'Users', 'Landmark', 'Home', 'Building', 'Globe', 'Monitor', 'Zap', 'Shield', 'Award'];

const HaritechIndustriesManager: React.FC = () => {
  const [industries, setIndustriesState] = useState<IndustryCard[]>(() => getIndustries());
  const [editing, setEditing] = useState<IndustryCard | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState<IndustryCard>({ id: 0, name: '', desc: '', icon: 'Building2' });

  useEffect(() => { setIndustriesState(getIndustries()); }, []);

  const handleSave = () => {
    if (!setIndustries(industries)) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const saveItem = (item: IndustryCard) => {
    if (editing) {
      setIndustriesState(industries.map(ii => ii.id === item.id ? item : ii));
    } else {
      setIndustriesState([...industries, { ...item, id: Date.now() }]);
    }
    setEditing(null);
    setShowForm(false);
  };

  const deleteItem = (id: number) => setIndustriesState(industries.filter(i => i.id !== id));

  const openAdd = () => { setFormData({ id: 0, name: '', desc: '', icon: 'Building2' }); setEditing(null); setShowForm(true); };
  const openEdit = (item: IndustryCard) => { setFormData(item); setEditing(item); setShowForm(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Manage the industries you serve on the Industries page.</p>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm"><Save className="h-4 w-4" /> Save</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAdd} className="flex items-center gap-2 px-4 py-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-sm font-bold hover:bg-cyan-500 hover:text-white transition-all"><Plus className="h-4 w-4" /> Add Industry</motion.button>
        </div>
      </div>
      {saved && <div className="text-emerald-400 text-sm font-bold">Saved successfully!</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {industries.map(ind => (
          <div key={ind.id} className="card p-5 bg-[#0e1326]/80 border-white/5 glow-border group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-2">
                <span className="text-white text-xs font-bold">{ind.icon.replace(/[a-z]/g, '')}</span>
              </div>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(ind)} className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Edit className="h-3 w-3" /></button>
                <button onClick={() => deleteItem(ind.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
            <h4 className="font-bold text-white text-sm mb-1">{ind.name}</h4>
            <p className="text-xs text-slate-400 line-clamp-2">{ind.desc}</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#0e1326] border border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{editing ? 'Edit' : 'Add'} Industry</h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white border border-white/5"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); saveItem(formData); }} className="space-y-4">
                <div>
                  <label className={labelClass}>Industry Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Description *</label>
                  <textarea rows={3} required value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label className={labelClass}>Icon</label>
                  <select value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} className={`${inputClass} bg-slate-950/60`}>
                    {iconOptions.map(ic => <option key={ic} className="bg-[#0e1326]">{ic}</option>)}
                  </select>
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="submit" className="flex-1 btn-primary px-6 py-3 rounded-xl text-sm"><Save className="h-4 w-4" /> {editing ? 'Update' : 'Add'} Industry</button>
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

export default HaritechIndustriesManager;
