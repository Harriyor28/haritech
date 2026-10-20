import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit, Trash2, X, Paintbrush, Image as ImageIcon, Sparkles } from 'lucide-react';
import { getEpoxyContent, setEpoxyContent, EpoxyContent } from '../../utils/haritechContent';

const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 outline-none text-sm text-white";
const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";

const iconOptions = ['Waves', 'Gem', 'Sofa', 'Brush', 'Layers', 'Wrench', 'Camera', 'Ruler', 'Droplets', 'Paintbrush', 'Hammer', 'Sparkles', 'Gauge', 'Palette', 'Home', 'Building2', 'Star', 'Shield', 'Zap', 'Eye', 'Fan', 'Flame', 'Truck'];

const imageOptions = [
  '/images/epoxy-ocean.jpg',
  '/images/epoxy-lagoon.jpg',
  '/images/epoxy-marble.jpg',
  '/images/epoxy-metallic-green.jpg',
  '/images/epoxy-timber.webp',
  '/images/epoxy-living.webp',
  '/images/epoxy-bedroom.jpg',
  '/images/epoxy-lobby.webp',
  '/images/epoxy-feature-wall.webp',
  '/images/epoxy-mural.jpg',
];

type SectionKey = 'works' | 'offers' | 'process' | 'qualities';

type EpoxyItem = Record<string, unknown>;

const sections: { key: SectionKey; title: string; hint: string; singular: string }[] = [
  { key: 'works', title: 'Work Examples', hint: 'Gallery photos on the page — image, title, category tag and the detail shown in the lightbox.', singular: 'Work Example' },
  { key: 'offers', title: 'What We Pour', hint: 'The six resin service cards (icon, title, description, bullet features — one per line).', singular: 'Offer' },
  { key: 'process', title: 'How We Pour', hint: 'Process steps — numbered automatically from their order (icon, title, description).', singular: 'Process Step' },
  { key: 'qualities', title: 'Why Epoxy?', hint: 'Benefit tiles at the bottom of the page (icon, title, description).', singular: 'Benefit' },
];

const HaritechEpoxyManager: React.FC = () => {
  const [epoxy, setEpoxy] = useState<EpoxyContent>(() => getEpoxyContent());
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formSection, setFormSection] = useState<SectionKey>('works');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => { setEpoxy(getEpoxyContent()); }, []);

  const handleSave = () => {
    try {
      window.localStorage.setItem('haritech-epoxy-probe', '1');
      window.localStorage.removeItem('haritech-epoxy-probe');
      setEpoxyContent(epoxy);
      setSaveError('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaved(false);
      setSaveError('Could not save — browser storage is full. Try using smaller images.');
    }
  };

  const saveItem = () => {
    const item: Record<string, unknown> = { ...formData };
    if (formSection === 'works') {
      if (!item.img?.toString().trim() || !item.title?.toString().trim()) return;
      item.title = item.title.toString().trim();
      item.tag = (item.tag ?? '').toString();
      item.detail = (item.detail ?? '').toString();
    } else {
      if (!item.title?.toString().trim()) return;
      item.title = item.title.toString().trim();
      item.desc = (item.desc ?? '').toString();
      item.icon = item.icon || 'Sparkles';
      if (formSection === 'offers') {
        item.features = String(item.featuresText ?? '')
          .split('\n')
          .map((f: string) => f.trim())
          .filter(Boolean);
        delete item.featuresText;
      }
    }
    const updated = (epoxy[formSection] as EpoxyItem[]).slice();
    if (editingIndex !== null) {
      updated[editingIndex] = item;
    } else {
      updated.push(item);
    }
    setEpoxy({ ...epoxy, [formSection]: updated });
    setShowForm(false);
    setEditingIndex(null);
  };

  const openAdd = (section: SectionKey) => {
    setFormSection(section);
    setEditingIndex(null);
    setFormData(section === 'works'
      ? { img: '', title: '', tag: '', detail: '' }
      : { title: '', desc: '', icon: 'Sparkles', featuresText: '' });
    setShowForm(true);
  };

  const openEdit = (section: SectionKey, index: number) => {
    const item = (epoxy[section] as Record<string, unknown>[])[index];
    setFormSection(section);
    setEditingIndex(index);
    if (section === 'works') {
      setFormData({
        img: String(item.img ?? ''),
        title: String(item.title ?? ''),
        tag: String(item.tag ?? ''),
        detail: String(item.detail ?? ''),
      });
    } else {
      setFormData({
        title: String(item.title ?? ''),
        desc: String(item.desc ?? ''),
        icon: String(item.icon ?? 'Sparkles'),
        featuresText: Array.isArray(item.features) ? (item.features as string[]).join('\n') : '',
      });
    }
    setShowForm(true);
  };

  const deleteItem = (section: SectionKey, index: number) => {
    const updated = (epoxy[section] as unknown[]).filter((_, i) => i !== index);
    setEpoxy({ ...epoxy, [section]: updated });
  };

  const hero = epoxy.hero;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Manage all content shown on the 3D Epoxy page.</p>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm"><Save className="h-4 w-4" /> Save</motion.button>
        </div>
      </div>
      {saved && <div className="text-emerald-400 text-sm font-bold">Saved successfully!</div>}
      {saveError && <div className="text-red-400 text-sm font-bold">{saveError}</div>}

      {/* Hero copy */}
      <div className="card p-6 bg-[#0e1326]/80 border-white/5 glow-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <Paintbrush className="h-4 w-4 text-teal-400" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Hero</h4>
            <p className="text-xs text-slate-500">Badge, headline and intro paragraph at the top of the page.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Badge</label>
            <input type="text" value={hero.badge} onChange={e => setEpoxy({ ...epoxy, hero: { ...hero, badge: e.target.value } })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Headline Accent (gradient text)</label>
            <input type="text" value={hero.accent} onChange={e => setEpoxy({ ...epoxy, hero: { ...hero, accent: e.target.value } })} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Headline (before the accent)</label>
            <input type="text" value={hero.title} onChange={e => setEpoxy({ ...epoxy, hero: { ...hero, title: e.target.value } })} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Intro Paragraph</label>
            <textarea rows={3} value={hero.subtitle} onChange={e => setEpoxy({ ...epoxy, hero: { ...hero, subtitle: e.target.value } })} className={`${inputClass} resize-none`} />
          </div>
        </div>
      </div>

      {/* List sections */}
      {sections.map(section => {
        const sectionData = epoxy[section.key] as EpoxyItem[];
        const isWorks = section.key === 'works';
        return (
          <div key={section.key} className="card p-6 bg-[#0e1326]/80 border-white/5 glow-border">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  {isWorks ? <ImageIcon className="h-4 w-4 text-teal-400" /> : <Sparkles className="h-4 w-4 text-teal-400" />}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{section.title}</h4>
                  <p className="text-xs text-slate-500">{sectionData.length} items</p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => openAdd(section.key)} className="flex items-center gap-2 px-3 py-2 bg-teal-500/10 text-teal-300 rounded-xl border border-teal-500/20 text-xs font-bold hover:bg-teal-500 hover:text-white transition-all"><Plus className="h-3.5 w-3.5" /> Add</motion.button>
            </div>
            <p className="text-xs text-slate-500 mb-4 ml-12">{section.hint}</p>
            <div className="space-y-2">
              {sectionData.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-slate-300 bg-slate-950/40 rounded-lg px-3 py-2.5">
                  {isWorks && typeof item.img === 'string' && item.img ? (
                    <img src={item.img} alt="" className="w-10 h-8 object-cover rounded border border-white/10 shrink-0" />
                  ) : null}
                  <span className="font-bold text-teal-300 shrink-0 max-w-[40%] truncate">{String(item.title ?? '')}</span>
                  <span className="flex-1 text-slate-500 truncate">{isWorks ? String(item.tag ?? '') : String(item.desc ?? '')}</span>
                  {!isWorks && <span className="text-[10px] text-slate-600 uppercase shrink-0">{String(item.icon ?? '')}</span>}
                  <button onClick={() => openEdit(section.key, i)} className="p-1.5 text-slate-500 hover:text-teal-300 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Edit className="h-3 w-3" /></button>
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
                <h3 className="text-xl font-bold text-white">{editingIndex !== null ? 'Edit' : 'Add'} {sections.find(s => s.key === formSection)?.singular}</h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white border border-white/5"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); saveItem(); }} className="space-y-4">
                {formSection === 'works' ? (
                  <>
                    <div>
                      <label className={labelClass}>Image *</label>
                      <select
                        value={imageOptions.includes(formData.img ?? '') ? formData.img : ''}
                        onChange={e => e.target.value && setFormData({ ...formData, img: e.target.value })}
                        className={`${inputClass} mb-2`}
                      >
                        <option value="">— pick an uploaded site image —</option>
                        {imageOptions.map(img => <option key={img} value={img}>{img.replace('/images/', '')}</option>)}
                      </select>
                      <input type="text" required value={formData.img ?? ''} onChange={e => setFormData({ ...formData, img: e.target.value })} className={inputClass} placeholder="or type a path, e.g. /images/epoxy-ocean.jpg" />
                    </div>
                    <div>
                      <label className={labelClass}>Title *</label>
                      <input type="text" required value={formData.title ?? ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputClass} placeholder="e.g. Ocean Depth Floor" />
                    </div>
                    <div>
                      <label className={labelClass}>Category Tag</label>
                      <input type="text" value={formData.tag ?? ''} onChange={e => setFormData({ ...formData, tag: e.target.value })} className={inputClass} placeholder="e.g. 3D Epoxy Flooring" />
                    </div>
                    <div>
                      <label className={labelClass}>Detail (shown in the lightbox)</label>
                      <textarea rows={4} value={formData.detail ?? ''} onChange={e => setFormData({ ...formData, detail: e.target.value })} className={`${inputClass} resize-none`} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className={labelClass}>Title *</label>
                      <input type="text" required value={formData.title ?? ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputClass} placeholder="e.g. 3D Epoxy Flooring" />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea rows={3} value={formData.desc ?? ''} onChange={e => setFormData({ ...formData, desc: e.target.value })} className={`${inputClass} resize-none`} />
                    </div>
                    {formSection === 'offers' && (
                      <div>
                        <label className={labelClass}>Features (one per line)</label>
                        <textarea rows={4} value={formData.featuresText ?? ''} onChange={e => setFormData({ ...formData, featuresText: e.target.value })} className={`${inputClass} resize-none`} placeholder={'Custom 3D artwork\nSelf-levelling system'} />
                      </div>
                    )}
                    <div>
                      <label className={labelClass}>Icon</label>
                      <select value={formData.icon ?? 'Sparkles'} onChange={e => setFormData({ ...formData, icon: e.target.value })} className={inputClass}>
                        {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                      </select>
                    </div>
                  </>
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

export default HaritechEpoxyManager;
