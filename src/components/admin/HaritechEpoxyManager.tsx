import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit, Trash2, X, Paintbrush, Image as ImageIcon, Sparkles, Sofa } from 'lucide-react';
import { getEpoxyContent, setEpoxyContent, EpoxyContent, InteriorStyle } from '../../utils/haritechContent';

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

const hexToRgba = (hex: string, alpha: number): string => {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

const slugify = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `style-${Date.now()}`;

type InteriorFormState = {
  name: string; tagline: string; badge: string; spaceUsage: string;
  handoverDays: string; ambientK: string;
  accentColor: string; wallTone: string; floorTone: string;
  sofaColor: string; rugColor: string; tableColor: string;
  cushionA: string; cushionB: string; glowColor: string;
  wallGradient: string; floorGradient: string;
};

const emptyInteriorForm: InteriorFormState = {
  name: '', tagline: '', badge: '', spaceUsage: '',
  handoverDays: '14', ambientK: '4000',
  accentColor: '#06b6d4', wallTone: '#16283d', floorTone: '#06b6d4',
  sofaColor: '#1e3a4a', rugColor: '#5eead4', tableColor: '#b45309',
  cushionA: '#5eead4', cushionB: '#f0fdfa', glowColor: '#38bdf8',
  wallGradient: '', floorGradient: '',
};

const buildWallGradient = (hex: string): string =>
  /^#[0-9a-fA-F]{6}$/.test(hex.trim())
    ? `linear-gradient(to bottom, ${hex.trim()} 0%, ${hex.trim()}a6 55%, ${hex.trim()}3d 100%)`
    : `linear-gradient(to bottom, #16283d 0%, rgba(22, 40, 61, 0.65) 55%, rgba(22, 40, 61, 0.24) 100%)`;

const buildFloorGradient = (hex: string): string =>
  /^#[0-9a-fA-F]{6}$/.test(hex.trim())
    ? `radial-gradient(ellipse at 50% 60%, ${hexToRgba(hex, 0.95)} 0%, ${hexToRgba(hex, 0.9)} 35%, rgba(15, 23, 42, 0.98) 85%)`
    : `radial-gradient(ellipse at 50% 60%, rgba(6,182,212,0.95) 0%, rgba(14,116,144,0.9) 35%, rgba(15,23,42,0.98) 85%)`;

const HaritechEpoxyManager: React.FC = () => {
  const [epoxy, setEpoxy] = useState<EpoxyContent>(() => getEpoxyContent());
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formSection, setFormSection] = useState<SectionKey>('works');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showInteriorForm, setShowInteriorForm] = useState(false);
  const [editingInteriorIndex, setEditingInteriorIndex] = useState<number | null>(null);
  const [interiorForm, setInteriorForm] = useState<InteriorFormState>(emptyInteriorForm);
  const [interiorGradientsAuto, setInteriorGradientsAuto] = useState(true);

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
  const interiorStyles = epoxy.interiorStyles ?? [];

  const openAddInterior = () => {
    setInteriorForm(emptyInteriorForm);
    setInteriorGradientsAuto(true);
    setEditingInteriorIndex(null);
    setShowInteriorForm(true);
  };

  const openEditInterior = (index: number) => {
    const s = interiorStyles[index];
    if (!s) return;
    // Derive "tones" from stored gradients for the color pickers when possible
    const wallTone = /#(?:[0-9a-fA-F]{6})/.exec(s.wallGradient)?.[0] ?? '#16283d';
    const floorTone = /#(?:[0-9a-fA-F]{6})/.exec(s.floorGradient)?.[0] ?? '#06b6d4';
    setInteriorForm({
      name: s.name, tagline: s.tagline, badge: s.badge, spaceUsage: s.spaceUsage,
      handoverDays: String(s.handoverDays ?? 14), ambientK: String(s.ambientK ?? 4000),
      accentColor: s.accentColor, wallTone, floorTone,
      sofaColor: /^#[0-9a-fA-F]{6}$/.test(s.sofaColor) ? s.sofaColor : '#1e3a4a',
      rugColor: /^#[0-9a-fA-F]{6}$/.test(s.rugColor) ? s.rugColor : '#5eead4',
      tableColor: /^#[0-9a-fA-F]{6}$/.test(s.tableColor) ? s.tableColor : '#b45309',
      cushionA: s.cushionA, cushionB: s.cushionB, glowColor: s.glowColor,
      wallGradient: s.wallGradient, floorGradient: s.floorGradient,
    });
    setInteriorGradientsAuto(false);
    setEditingInteriorIndex(index);
    setShowInteriorForm(true);
  };

  const deleteInterior = (index: number) => {
    setEpoxy({ ...epoxy, interiorStyles: interiorStyles.filter((_, i) => i !== index) });
  };

  const updateTone = (key: 'wallTone' | 'floorTone', hex: string) => {
    setInteriorForm((prev) => {
      const next = { ...prev, [key]: hex };
      if (interiorGradientsAuto) {
        return {
          ...next,
          wallGradient: buildWallGradient(next.wallTone),
          floorGradient: buildFloorGradient(next.floorTone),
        };
      }
      return next;
    });
  };

  const saveInterior = () => {
    const form = {
      ...interiorForm,
      wallGradient: interiorForm.wallGradient || buildWallGradient(interiorForm.wallTone),
      floorGradient: interiorForm.floorGradient || buildFloorGradient(interiorForm.floorTone),
    };
    if (!form.name.trim()) return;
    const style: InteriorStyle = {
      id: slugify(form.name),
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      badge: form.badge.trim().toUpperCase() || 'CUSTOM STYLE',
      accentColor: form.accentColor,
      wallGradient: form.wallGradient,
      floorGradient: form.floorGradient,
      sofaColor: `linear-gradient(145deg, ${form.sofaColor}, ${form.sofaColor}66)`,
      rugColor: `radial-gradient(circle, ${hexToRgba(form.rugColor, 0.35)}, ${hexToRgba(form.rugColor, 0.12)} 70%)`,
      tableColor: `linear-gradient(160deg, ${form.tableColor} 40%, ${form.tableColor}55)`,
      cushionA: form.cushionA,
      cushionB: form.cushionB,
      glowColor: hexToRgba(form.glowColor, 0.45),
      ambientK: Math.min(10000, Math.max(1800, Number(form.ambientK) || 4000)),
      spaceUsage: form.spaceUsage.trim() || 'Residential & Commercial Spaces',
      handoverDays: Math.max(1, Number(form.handoverDays) || 14),
    };
    const updated = interiorStyles.slice();
    if (editingInteriorIndex !== null) {
      updated[editingInteriorIndex] = style;
    } else {
      const clash = updated.findIndex((s) => s.id === style.id);
      if (clash >= 0) updated[clash] = style;
      else updated.push(style);
    }
    setEpoxy({ ...epoxy, interiorStyles: updated });
    setShowInteriorForm(false);
    setEditingInteriorIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Manage all content shown on the 3D Epoxy & Interior Décor page.</p>
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

      {/* Interior Décor Styles (drives the 3D Interior Studio) */}
      <div className="card p-6 bg-[#0e1326]/80 border-white/5 glow-border">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Sofa className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Interior Décor Styles</h4>
              <p className="text-xs text-slate-500">{interiorStyles.length} styles</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => openAddInterior()} className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 text-cyan-300 rounded-xl border border-cyan-500/20 text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all"><Plus className="h-3.5 w-3.5" /> Add</motion.button>
        </div>
        <p className="text-xs text-slate-500 mb-4 ml-12">Styles shown in the complete interior home decoration 3D studio — floor, walls, sofa, table & lamp palettes. Each style pairs a matching epoxy floor.</p>
        <div className="space-y-2">
          {interiorStyles.map((s, i) => (
            <div key={`${s.id}-${i}`} className="flex items-center gap-3 text-xs text-slate-300 bg-slate-950/40 rounded-lg px-3 py-2.5">
              <div className="flex shrink-0">
                <div className="w-5 h-8 rounded-l border border-white/20" style={{ background: s.floorGradient }} />
                <div className="w-5 h-8 rounded-r border border-white/20 border-l-0" style={{ background: s.wallGradient }} />
              </div>
              <span className="font-bold text-cyan-300 shrink-0 max-w-[30%] truncate">{s.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-400 shrink-0">{s.badge}</span>
              <span className="flex-1 text-slate-500 truncate">{s.tagline}</span>
              <button onClick={() => openEditInterior(i)} className="p-1.5 text-slate-500 hover:text-cyan-300 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Edit className="h-3 w-3" /></button>
              <button onClick={() => deleteInterior(i)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
          {interiorStyles.length === 0 && <p className="text-xs text-slate-600 px-3 py-2">No styles yet — click Add.</p>}
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

      {/* Interior Style Form Modal */}
      <AnimatePresence>
        {showInteriorForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowInteriorForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#0e1326] border border-white/10 rounded-2xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Sofa className="h-5 w-5 text-cyan-400" /> {editingInteriorIndex !== null ? 'Edit' : 'Add'} Interior Décor Style</h3>
                <button onClick={() => setShowInteriorForm(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white border border-white/5"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); saveInterior(); }} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Style Name *</label>
                    <input type="text" required value={interiorForm.name} onChange={e => setInteriorForm({ ...interiorForm, name: e.target.value })} className={inputClass} placeholder="e.g. Azure Lagoon Luxury" />
                  </div>
                  <div>
                    <label className={labelClass}>Badge</label>
                    <input type="text" value={interiorForm.badge} onChange={e => setInteriorForm({ ...interiorForm, badge: e.target.value })} className={inputClass} placeholder="e.g. SIGNATURE PAIRING" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Tagline</label>
                    <input type="text" value={interiorForm.tagline} onChange={e => setInteriorForm({ ...interiorForm, tagline: e.target.value })} className={inputClass} placeholder="e.g. Epoxy ocean floor paired with sand linen & walnut warmth" />
                  </div>
                  <div>
                    <label className={labelClass}>Recommended For</label>
                    <input type="text" value={interiorForm.spaceUsage} onChange={e => setInteriorForm({ ...interiorForm, spaceUsage: e.target.value })} className={inputClass} placeholder="e.g. Living Rooms, Lounges, Show Homes" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Handover (days)</label>
                      <input type="number" min={1} value={interiorForm.handoverDays} onChange={e => setInteriorForm({ ...interiorForm, handoverDays: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Ambient (Kelvin)</label>
                      <input type="number" min={1800} max={10000} value={interiorForm.ambientK} onChange={e => setInteriorForm({ ...interiorForm, ambientK: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Colours & Palettes</span>
                    <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer">
                      <input type="checkbox" checked={interiorGradientsAuto} onChange={e => setInteriorGradientsAuto(e.target.checked)} className="accent-teal-400" />
                      auto-build wall/floor gradients
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(interiorForm.accentColor) ? interiorForm.accentColor : '#06b6d4'} onChange={e => setInteriorForm({ ...interiorForm, accentColor: e.target.value })} className="w-12 h-10 rounded-lg bg-slate-950/40 border border-white/10 cursor-pointer p-1" />
                        <input type="text" value={interiorForm.accentColor} onChange={e => setInteriorForm({ ...interiorForm, accentColor: e.target.value })} className={`${inputClass} font-mono`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Floor Tone</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(interiorForm.floorTone) ? interiorForm.floorTone : '#06b6d4'} onChange={e => updateTone('floorTone', e.target.value)} className="w-12 h-10 rounded-lg bg-slate-950/40 border border-white/10 cursor-pointer p-1" />
                        <input type="text" value={interiorForm.floorTone} onChange={e => updateTone('floorTone', e.target.value)} className={`${inputClass} font-mono`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Wall Tone</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(interiorForm.wallTone) ? interiorForm.wallTone : '#16283d'} onChange={e => updateTone('wallTone', e.target.value)} className="w-12 h-10 rounded-lg bg-slate-950/40 border border-white/10 cursor-pointer p-1" />
                        <input type="text" value={interiorForm.wallTone} onChange={e => updateTone('wallTone', e.target.value)} className={`${inputClass} font-mono`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Sofa</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(interiorForm.sofaColor) ? interiorForm.sofaColor : '#1e3a4a'} onChange={e => setInteriorForm({ ...interiorForm, sofaColor: e.target.value })} className="w-12 h-10 rounded-lg bg-slate-950/40 border border-white/10 cursor-pointer p-1" />
                        <input type="text" value={interiorForm.sofaColor} onChange={e => setInteriorForm({ ...interiorForm, sofaColor: e.target.value })} className={`${inputClass} font-mono`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Table / Wood</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(interiorForm.tableColor) ? interiorForm.tableColor : '#b45309'} onChange={e => setInteriorForm({ ...interiorForm, tableColor: e.target.value })} className="w-12 h-10 rounded-lg bg-slate-950/40 border border-white/10 cursor-pointer p-1" />
                        <input type="text" value={interiorForm.tableColor} onChange={e => setInteriorForm({ ...interiorForm, tableColor: e.target.value })} className={`${inputClass} font-mono`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Rug</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(interiorForm.rugColor) ? interiorForm.rugColor : '#5eead4'} onChange={e => setInteriorForm({ ...interiorForm, rugColor: e.target.value })} className="w-12 h-10 rounded-lg bg-slate-950/40 border border-white/10 cursor-pointer p-1" />
                        <input type="text" value={interiorForm.rugColor} onChange={e => setInteriorForm({ ...interiorForm, rugColor: e.target.value })} className={`${inputClass} font-mono`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Lamp Glow</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(interiorForm.glowColor) ? interiorForm.glowColor : '#38bdf8'} onChange={e => setInteriorForm({ ...interiorForm, glowColor: e.target.value })} className="w-12 h-10 rounded-lg bg-slate-950/40 border border-white/10 cursor-pointer p-1" />
                        <input type="text" value={interiorForm.glowColor} onChange={e => setInteriorForm({ ...interiorForm, glowColor: e.target.value })} className={`${inputClass} font-mono`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Cushion 1</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(interiorForm.cushionA) ? interiorForm.cushionA : '#5eead4'} onChange={e => setInteriorForm({ ...interiorForm, cushionA: e.target.value })} className="w-12 h-10 rounded-lg bg-slate-950/40 border border-white/10 cursor-pointer p-1" />
                        <input type="text" value={interiorForm.cushionA} onChange={e => setInteriorForm({ ...interiorForm, cushionA: e.target.value })} className={`${inputClass} font-mono`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Cushion 2</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(interiorForm.cushionB) ? interiorForm.cushionB : '#f0fdfa'} onChange={e => setInteriorForm({ ...interiorForm, cushionB: e.target.value })} className="w-12 h-10 rounded-lg bg-slate-950/40 border border-white/10 cursor-pointer p-1" />
                        <input type="text" value={interiorForm.cushionB} onChange={e => setInteriorForm({ ...interiorForm, cushionB: e.target.value })} className={`${inputClass} font-mono`} />
                      </div>
                    </div>
                  </div>
                  {!interiorGradientsAuto && (
                    <div className="mt-4 space-y-2">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Advanced CSS gradients (optional — leave blank to auto-build from tones)</p>
                      <input type="text" value={interiorForm.wallGradient} onChange={e => setInteriorForm({ ...interiorForm, wallGradient: e.target.value })} className={`${inputClass} font-mono`} placeholder="wall gradient CSS" />
                      <input type="text" value={interiorForm.floorGradient} onChange={e => setInteriorForm({ ...interiorForm, floorGradient: e.target.value })} className={`${inputClass} font-mono`} placeholder="floor gradient CSS" />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="submit" className="flex-1 btn-primary px-6 py-3 rounded-xl text-sm"><Save className="h-4 w-4" /> {editingInteriorIndex !== null ? 'Update' : 'Add'}</button>
                  <button type="button" onClick={() => setShowInteriorForm(false)} className="px-6 py-3 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-sm text-slate-400">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
