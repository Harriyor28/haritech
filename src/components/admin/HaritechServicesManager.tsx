import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Edit, Trash2 } from 'lucide-react';
import { getServiceCategories, setServiceCategories, ServiceCategory } from '../../utils/haritechContent';

const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";

const HaritechServicesManager: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>(() => getServiceCategories());
  const [editingCat, setEditingCat] = useState<ServiceCategory | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setCategories(getServiceCategories()); }, []);

  const handleSave = () => {
    if (!setServiceCategories(categories)) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const saveCategory = (cat: ServiceCategory) => {
    setCategories(categories.map(c => c.id === cat.id ? cat : c));
    setEditingCat(null);
  };

  const updateService = (catId: string, index: number, field: string, value: any) => {
    setCategories(categories.map(c => c.id === catId ? { ...c, services: c.services.map((s, i) => i === index ? { ...s, [field]: value } : s) } : c));
  };

  const deleteService = (catId: string, index: number) => {
    setCategories(categories.map(c => c.id === catId ? { ...c, services: c.services.filter((_, i) => i !== index) } : c));
  };

  const removeCategory = (id: string) => setCategories(categories.filter(c => c.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Manage service categories and their services.</p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm">
          <Save className="h-4 w-4" /> Save All
        </motion.button>
      </div>
      {saved && <div className="text-emerald-400 text-sm font-bold">Saved successfully!</div>}

      {categories.map(cat => (
        <div key={cat.id} className="card p-6 bg-[#0e1326]/80 border-white/5 glow-border">
          {/* Category Header */}
          {editingCat?.id === cat.id ? (
            <div className="flex items-center gap-3 mb-6">
              <input type="text" value={editingCat.label} onChange={e => setEditingCat({ ...editingCat, label: e.target.value })} className={`${inputClass} flex-1`} />
              <select value={editingCat.icon} onChange={e => setEditingCat({ ...editingCat, icon: e.target.value })} className={`${inputClass} w-40`}>
                {['Code2', 'Palette', 'Megaphone', 'Briefcase', 'Monitor', 'PaintBucket', 'BarChart3', 'Server'].map(ic => <option key={ic} className="bg-[#0e1326]">{ic}</option>)}
              </select>
              <button onClick={() => saveCategory(editingCat)} className="px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all">Save</button>
              <button onClick={() => setEditingCat(null)} className="px-4 py-2 border border-white/10 text-slate-400 rounded-xl text-xs hover:bg-white/5 transition-all">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} p-2`}>
                  <span className="text-white text-xs font-bold">{cat.icon.replace(/[a-z]/g, '')}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{cat.label}</h3>
                <span className="text-xs text-slate-500 font-mono">({cat.services.length} services)</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingCat(cat)} className="p-2 text-slate-500 hover:text-cyan-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Edit className="h-3.5 w-3.5" /></button>
                <button onClick={() => removeCategory(cat.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          )}

          {/* Services List */}
          <div className="space-y-3">
            {cat.services.map((svc, i) => (
              <div key={i} className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <input type="text" value={svc.name} onChange={e => updateService(cat.id, i, 'name', e.target.value)} className="w-full px-3 py-2 bg-slate-900 rounded-lg border border-white/5 text-sm font-bold text-white" placeholder="Service name" />
                    <textarea rows={2} value={svc.desc} onChange={e => updateService(cat.id, i, 'desc', e.target.value)} className="w-full px-3 py-2 bg-slate-900 rounded-lg border border-white/5 text-sm text-slate-300 resize-none" placeholder="Description" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">Features (comma-separated)</label>
                        <input type="text" value={svc.features.join(', ')} onChange={e => updateService(cat.id, i, 'features', e.target.value.split(',').map((s: string) => s.trim()))} className="w-full px-3 py-2 bg-slate-900 rounded-lg border border-white/5 text-xs text-white" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">Benefits (comma-separated)</label>
                        <input type="text" value={svc.benefits.join(', ')} onChange={e => updateService(cat.id, i, 'benefits', e.target.value.split(',').map((s: string) => s.trim()))} className="w-full px-3 py-2 bg-slate-900 rounded-lg border border-white/5 text-xs text-white" />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteService(cat.id, i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => {
            setCategories(categories.map(c => c.id === cat.id ? { ...c, services: [...c.services, { name: '', desc: '', features: [''], benefits: [''] }] } : c));
          }} className="mt-4 flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            <Plus className="h-4 w-4" /> Add Service to {cat.label}
          </button>
        </div>
      ))}
    </div>
  );
};

export default HaritechServicesManager;
