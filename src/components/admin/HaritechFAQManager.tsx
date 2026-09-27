import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit, Trash2, X, HelpCircle, ChevronDown } from 'lucide-react';
import { getFAQCategories, setFAQCategories, FAQCategory } from '../../utils/haritechContent';

const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";

interface FaqItemForm { q: string; a: string }
interface CategoryForm { category: string; items: FaqItemForm[] }

const emptyCategory: CategoryForm = { category: '', items: [{ q: '', a: '' }] };

const HaritechFAQManager: React.FC = () => {
  const [categories, setCategories] = useState<FAQCategory[]>(() => getFAQCategories());
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<CategoryForm>(emptyCategory);

  useEffect(() => { setCategories(getFAQCategories()); }, []);

  const handleSave = () => {
    if (!setFAQCategories(categories)) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const saveCategory = () => {
    const clean = {
      category: formData.category.trim(),
      items: formData.items.filter(i => i.q.trim() && i.a.trim()),
    };
    if (!clean.category) return;
    if (editingIndex !== null) {
      setCategories(categories.map((c, i) => i === editingIndex ? clean : c));
    } else {
      setCategories([...categories, clean]);
    }
    setShowForm(false);
    setEditingIndex(null);
  };

  const openAdd = () => { setFormData(emptyCategory); setEditingIndex(null); setShowForm(true); };
  const openEdit = (index: number) => {
    const c = categories[index];
    setFormData({ category: c.category, items: c.items.map(i => ({ ...i })) });
    setEditingIndex(index);
    setShowForm(true);
  };
  const deleteCategory = (index: number) => setCategories(categories.filter((_, i) => i !== index));

  const updateItem = (itemIndex: number, field: keyof FaqItemForm, value: string) => {
    setFormData(prev => ({ ...prev, items: prev.items.map((it, i) => i === itemIndex ? { ...it, [field]: value } : it) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Manage FAQ categories and questions shown on the FAQ page.</p>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm"><Save className="h-4 w-4" /> Save</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAdd} className="flex items-center gap-2 px-4 py-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-sm font-bold hover:bg-cyan-500 hover:text-white transition-all"><Plus className="h-4 w-4" /> Add Category</motion.button>
        </div>
      </div>
      {saved && <div className="text-emerald-400 text-sm font-bold">Saved successfully!</div>}

      <div className="space-y-4">
        {categories.map((cat, ci) => (
          <div key={cat.category} className="card p-6 bg-[#0e1326]/80 border-white/5 glow-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{cat.category}</h4>
                  <p className="text-xs text-slate-500">{cat.items.length} questions</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(ci)} className="p-2 text-slate-500 hover:text-cyan-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Edit className="h-3.5 w-3.5" /></button>
                <button onClick={() => deleteCategory(ci)} className="p-2 text-slate-500 hover:text-red-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="space-y-2">
              {cat.items.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400 bg-slate-950/40 rounded-lg px-3 py-2">
                  <ChevronDown className="h-3.5 w-3.5 text-slate-600 mt-0.5 shrink-0" />
                  <span>{item.q}</span>
                </div>
              ))}
              {cat.items.length > 4 && <p className="text-xs text-slate-600">+{cat.items.length - 4} more...</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#0e1326] border border-white/10 rounded-2xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{editingIndex !== null ? 'Edit' : 'Add'} FAQ Category</h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white border border-white/5"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); saveCategory(); }} className="space-y-5">
                <div>
                  <label className={labelClass}>Category Name *</label>
                  <input type="text" required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className={inputClass} placeholder="e.g. General, Services, Pricing" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass}>Questions</label>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, items: [...prev.items, { q: '', a: '' }] }))} className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-white transition-colors"><Plus className="h-3.5 w-3.5" /> Add Question</button>
                  </div>
                  <div className="space-y-4">
                    {formData.items.map((item, i) => (
                      <div key={i} className="bg-slate-950/40 rounded-xl border border-white/5 p-4 space-y-3 relative">
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, items: prev.items.filter((_, j) => j !== i) }))} className="absolute top-3 right-3 p-1 text-slate-600 hover:text-red-400 transition-colors"><X className="h-3.5 w-3.5" /></button>
                        <div>
                          <label className={labelClass}>Question {i + 1} *</label>
                          <input type="text" required value={item.q} onChange={e => updateItem(i, 'q', e.target.value)} className={inputClass} placeholder="What is Haritech Exclusive Services?" />
                        </div>
                        <div>
                          <label className={labelClass}>Answer *</label>
                          <textarea rows={2} required value={item.a} onChange={e => updateItem(i, 'a', e.target.value)} className={`${inputClass} resize-none`} placeholder="Answer text..." />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="submit" className="flex-1 btn-primary px-6 py-3 rounded-xl text-sm"><Save className="h-4 w-4" /> {editingIndex !== null ? 'Update' : 'Add'} Category</button>
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

export default HaritechFAQManager;
