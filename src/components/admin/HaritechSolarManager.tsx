import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit, Trash2, X, Sun, Zap } from 'lucide-react';
import { getSolarContent, setSolarContent, SolarContent } from '../../utils/haritechContent';

const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";

const iconOptions = ['Sun', 'Zap', 'Battery', 'Cpu', 'Shield', 'Star', 'TrendingUp', 'Home', 'Building2', 'Factory', 'Warehouse', 'TreePine', 'Smartphone', 'Headphones', 'Award', 'Settings', 'Wrench', 'Gauge', 'Droplets'];

const colorOptions = [
  'from-yellow-500 to-orange-600', 'from-cyan-500 to-blue-600', 'from-green-500 to-emerald-600',
  'from-purple-500 to-violet-600', 'from-blue-500 to-indigo-600', 'from-amber-500 to-orange-600',
  'from-red-500 to-rose-600', 'from-slate-500 to-gray-600', 'from-teal-500 to-cyan-600',
];

type SectionKey = 'services' | 'whySolar' | 'applications' | 'stats';

const sections: { key: SectionKey; title: string; hint: string }[] = [
  { key: 'services', title: 'Solar Services', hint: 'Service cards shown in the Our Solar Services section (title, description, icon, color).' },
  { key: 'whySolar', title: 'Why Go Solar?', hint: 'Benefit cards shown in the Why Go Solar section (title, description, icon).' },
  { key: 'applications', title: 'Applications', hint: 'Application cards shown in the Solar Applications We Serve section (title, description, icon).' },
  { key: 'stats', title: 'Stats', hint: 'Stat counters shown near the top of the page (value, label, icon).' },
];

const HaritechSolarManager: React.FC = () => {
  const [solar, setSolar] = useState<SolarContent>(() => getSolarContent());
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formSection, setFormSection] = useState<SectionKey>('services');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => { setSolar(getSolarContent()); }, []);

  const handleSave = () => {
    setSolarContent(solar);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const saveItem = () => {
    const isStats = formSection === 'stats';
    const item: Record<string, string> = { ...formData };
    if (isStats) {
      if (!item.value.trim() || !item.label.trim()) return;
    } else {
      if (!item.title.trim()) return;
    }
    const updated = (solar[formSection] as Record<string, string>[]).slice();
    if (editingIndex !== null) {
      updated[editingIndex] = item;
    } else {
      updated.push(item);
    }
    setSolar({ ...solar, [formSection]: updated });
    setShowForm(false);
    setEditingIndex(null);
  };

  const openAdd = (section: SectionKey) => {
    setFormSection(section);
    setEditingIndex(null);
    setFormData(section === 'stats' ? { value: '', label: '', icon: 'Sun' } : { title: '', desc: '', icon: 'Sun', color: 'from-yellow-500 to-orange-600' });
    setShowForm(true);
  };

  const openEdit = (section: SectionKey, index: number) => {
    const item = (solar[section] as Record<string, string>[])[index];
    setFormSection(section);
    setEditingIndex(index);
    setFormData({ ...item });
    setShowForm(true);
  };

  const deleteItem = (section: SectionKey, index: number) => {
    const sectionData = solar[section] as unknown[];
    const updated = sectionData.filter((_, i) => i !== index);
    setSolar({ ...solar, [section]: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Manage all content shown on the Solar Energy page.</p>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm"><Save className="h-4 w-4" /> Save</motion.button>
        </div>
      </div>
      {saved && <div className="text-emerald-400 text-sm font-bold">Saved successfully!</div>}

      {sections.map(section => {
        const sectionData = solar[section.key] as Record<string, string>[];
        const isStats = section.key === 'stats';
        return (
          <div key={section.key} className="card p-6 bg-[#0e1326]/80 border-white/5 glow-border">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  {section.key === 'services' ? <Zap className="h-4 w-4 text-yellow-400" /> : <Sun className="h-4 w-4 text-yellow-400" />}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{section.title}</h4>
                  <p className="text-xs text-slate-500">{sectionData.length} items</p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => openAdd(section.key)} className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all"><Plus className="h-3.5 w-3.5" /> Add</motion.button>
            </div>
            <p className="text-xs text-slate-500 mb-4 ml-12">{section.hint}</p>
            <div className="space-y-2">
              {sectionData.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-slate-300 bg-slate-950/40 rounded-lg px-3 py-2.5">
                  <span className="font-bold text-yellow-400 w-6 shrink-0">{isStats ? item.value : item.title}</span>
                  <span className="flex-1 text-slate-500 truncate">{isStats ? item.label : item.desc}</span>
                  <span className="text-[10px] text-slate-600 uppercase shrink-0">{item.icon}</span>
                  <button onClick={() => openEdit(section.key, i)} className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Edit className="h-3 w-3" /></button>
                  <button onClick={() => deleteItem(section.key, i)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
              {sectionData.length === 0 && <p className="text-xs text-slate-600 px-3 py-2">No items yet — click Add.</p>}
            </div>
          </div>
        );
      })}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#0e1326] border border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{editingIndex !== null ? 'Edit' : 'Add'} {formSection === 'stats' ? 'Stat' : formSection === 'whySolar' ? 'Benefit' : formSection === 'applications' ? 'Application' : 'Service'}</h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white border border-white/5"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); saveItem(); }} className="space-y-4">
                {formSection === 'stats' ? (
                  <>
                    <div>
                      <label className={labelClass}>Value *</label>
                      <input type="text" required value={formData.value ?? ''} onChange={e => setFormData({ ...formData, value: e.target.value })} className={inputClass} placeholder="e.g. 500+" />
                    </div>
                    <div>
                      <label className={labelClass}>Label *</label>
                      <input type="text" required value={formData.label ?? ''} onChange={e => setFormData({ ...formData, label: e.target.value })} className={inputClass} placeholder="e.g. Solar Systems Installed" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className={labelClass}>Title *</label>
                      <input type="text" required value={formData.title ?? ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputClass} placeholder="e.g. Solar Panel Installation" />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea rows={3} value={formData.desc ?? ''} onChange={e => setFormData({ ...formData, desc: e.target.value })} className={`${inputClass} resize-none`} />
                    </div>
                  </>
                )}
                <div>
                  <label className={labelClass}>Icon</label>
                  <select value={formData.icon ?? 'Sun'} onChange={e => setFormData({ ...formData, icon: e.target.value })} className={inputClass}>
                    {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                </div>
                {formSection === 'services' && (
                  <div>
                    <label className={labelClass}>Color</label>
                    <select value={formData.color ?? ''} onChange={e => setFormData({ ...formData, color: e.target.value })} className={inputClass}>
                      {colorOptions.map(color => <option key={color} value={color}>{color.replace('from-', '').replace(' to-', ' → ')}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex gap-4 pt-2">
                  <button type="submit" className="flex-1 btn-primary px-6 py-3 rounded-xl text-sm"><Save className="h-4 w-4" /> {editingIndex !== null ? 'Update' : 'Add'}</button>
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

export default HaritechSolarManager;
