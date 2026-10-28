import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit, Trash2, X, Ship, ListChecks } from 'lucide-react';
import { getImportationContent, setImportationContent, ImportationContent } from '../../utils/haritechContent';

const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";

const iconOptions = ['Ship', 'Plane', 'Package', 'Truck', 'Globe', 'FileText', 'Landmark', 'Search', 'ShieldCheck', 'Warehouse', 'BadgeCheck', 'Clock', 'Anchor', 'Boxes', 'Scale', 'Receipt', 'Zap'];

const colorOptions = [
  'from-cyan-500 to-blue-600', 'from-teal-500 to-emerald-600', 'from-blue-500 to-indigo-600',
  'from-amber-500 to-orange-600', 'from-purple-500 to-violet-600', 'from-rose-500 to-red-600',
  'from-green-500 to-emerald-600', 'from-slate-500 to-gray-600',
];

type SectionKey = keyof ImportationContent;

const sections: { key: SectionKey; title: string; hint: string }[] = [
  { key: 'services', title: 'Importation Services', hint: 'Service cards on the page (title, description, icon, colour, bullet features — one per line).' },
  { key: 'process', title: 'Setup Process', hint: 'The numbered importation setup phases (title, description, duration/timeline).' },
  { key: 'requirements', title: 'Setup Checklist', hint: 'Requirement groups (title, description, checklist items — one per line).' },
  { key: 'stats', title: 'Stats', hint: 'Stat counters shown near the top of the page (value, label, icon).' },
  { key: 'faqs', title: 'FAQ', hint: 'Questions and answers shown in the Importation Questions section.' },
  { key: 'segments', title: 'Goods Segments', hint: 'The “what are you importing?” explorer: duty band, permits, freight mode and lead time per goods type.' },
  { key: 'preOrders', title: 'Pre-order Groups', hint: 'Shared import pools shown in the Pre-order section. Leave the group link empty to send joiners to WhatsApp.' },
];

interface ItemShape {
  title?: string;
  desc?: string;
  icon?: string;
  color?: string;
  duration?: string;
  value?: string;
  label?: string;
  q?: string;
  a?: string;
  features?: string[];
  items?: string[];
  // goods segments
  id?: string;
  name?: string;
  tagline?: string;
  dutyBand?: string;
  mode?: string;
  leadTime?: string;
  notes?: string;
  restricted?: boolean;
  examples?: string[];
  permits?: string[];
  // pre-order groups
  product?: string;
  segment?: string;
  origin?: string;
  closingDate?: string;
  slotsTotal?: number | string;
  slotsTaken?: number | string;
  deposit?: string;
  landed?: string;
  groupUrl?: string;
  note?: string;
  [k: string]: unknown;
}

const isStats = (k: SectionKey) => k === 'stats';
const isFaq = (k: SectionKey) => k === 'faqs';
const isSegment = (k: SectionKey) => k === 'segments';
const isPreOrder = (k: SectionKey) => k === 'preOrders';
const hasList = (k: SectionKey) => k === 'services' || k === 'requirements';
const hasIcon = (k: SectionKey) => k === 'services' || k === 'stats' || k === 'segments';
const hasColor = (k: SectionKey) => k === 'services' || k === 'segments';

const slug = (value: unknown) =>
  String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const lines = (value: string) => value.split('\n').map(s => s.trim()).filter(Boolean);

const HaritechImportationManager: React.FC = () => {
  const [content, setContent] = useState<ImportationContent>(() => getImportationContent());
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formSection, setFormSection] = useState<SectionKey>('services');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ItemShape>({});
  const [listText, setListText] = useState('');
  const [examplesText, setExamplesText] = useState('');
  const [permitsText, setPermitsText] = useState('');

  useEffect(() => { setContent(getImportationContent()); }, []);

  const handleSave = () => {
    setImportationContent(content);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const saveItem = () => {
    const item: ItemShape = { ...formData };
    if (isStats(formSection)) {
      if (!item.value?.trim() || !item.label?.trim()) return;
    } else if (isFaq(formSection)) {
      if (!item.q?.trim()) return;
    } else if (isSegment(formSection)) {
      if (!item.name?.trim()) return;
    } else if (isPreOrder(formSection)) {
      if (!item.product?.trim()) return;
    } else if (!item.title?.trim()) {
      return;
    }
    if (hasList(formSection)) {
      item[formSection === 'services' ? 'features' : 'items'] = lines(listText);
    }
    if (isSegment(formSection)) {
      item.examples = lines(examplesText);
      item.permits = lines(permitsText);
      item.id = slug(item.id) || slug(item.name);
      item.restricted = Boolean(item.restricted);
      item.dutyBand = String(item.dutyBand ?? '');
      item.leadTime = String(item.leadTime ?? '');
      item.notes = String(item.notes ?? '');
      item.tagline = String(item.tagline ?? '');
    }
    if (isPreOrder(formSection)) {
      item.id = slug(item.id) || slug(item.product);
      item.slotsTotal = Math.max(0, Number(item.slotsTotal) || 0);
      item.slotsTaken = Math.max(0, Number(item.slotsTaken) || 0);
      item.closingDate = String(item.closingDate ?? '');
      item.groupUrl = String(item.groupUrl ?? '');
      item.note = String(item.note ?? '');
      item.origin = String(item.origin ?? '');
      item.segment = String(item.segment ?? '');
      item.mode = String(item.mode ?? '');
      item.deposit = String(item.deposit ?? '');
      item.landed = String(item.landed ?? '');
    }
    const updated = (content[formSection] as unknown as ItemShape[]).slice();
    if (editingIndex !== null) updated[editingIndex] = item;
    else updated.push(item);
    setContent({ ...content, [formSection]: updated });
    setShowForm(false);
    setEditingIndex(null);
  };

  const openAdd = (section: SectionKey) => {
    setFormSection(section);
    setEditingIndex(null);
    setListText('');
    setExamplesText('');
    setPermitsText('');
    setFormData(
      isStats(section)
        ? { value: '', label: '', icon: 'Package' }
        : isFaq(section)
          ? { q: '', a: '' }
          : isSegment(section)
            ? { id: '', name: '', tagline: '', icon: 'Boxes', color: 'from-cyan-500 to-blue-600', dutyBand: '20%', mode: 'Sea or Air', leadTime: '', notes: '', restricted: false }
            : isPreOrder(section)
              ? { id: '', product: '', segment: '', origin: '', mode: 'Sea LCL', closingDate: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10), slotsTotal: 20, slotsTaken: 0, deposit: '', landed: '', groupUrl: '', note: '' }
              : section === 'process'
                ? { title: '', desc: '', duration: '' }
                : { title: '', desc: '', icon: 'Ship', color: 'from-cyan-500 to-blue-600' }
    );
    setShowForm(true);
  };

  const openEdit = (section: SectionKey, index: number) => {
    const item = (content[section] as ItemShape[])[index];
    setFormSection(section);
    setEditingIndex(index);
    const { features, items, examples, permits, ...rest } = item as ItemShape & {
      features?: string[]; items?: string[]; examples?: string[]; permits?: string[];
    };
    setFormData(rest);
    setListText((features ?? items ?? []).join('\n'));
    setExamplesText((examples ?? []).join('\n'));
    setPermitsText((permits ?? []).join('\n'));
    setShowForm(true);
  };

  const deleteItem = (section: SectionKey, index: number) => {
    const updated = (content[section] as unknown[]).filter((_, i) => i !== index);
    setContent({ ...content, [section]: updated });
  };

  const rowPrimary = (item: ItemShape, section: SectionKey) =>
    isStats(section) ? item.value
      : isFaq(section) ? item.q
        : isSegment(section) ? item.name
          : isPreOrder(section) ? item.product
            : item.title;
  const rowSecondary = (item: ItemShape, section: SectionKey) =>
    isStats(section) ? item.label
      : isFaq(section) ? item.a
        : isSegment(section) ? `${item.dutyBand ?? ''} · ${item.tagline ?? ''}`
          : isPreOrder(section) ? `${item.segment ?? ''} · closes ${item.closingDate ?? ''}`
            : item.desc;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Manage all content shown on the Importation &amp; Freight Forwarding page.</p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm"><Save className="h-4 w-4" /> Save</motion.button>
      </div>
      {saved && <div className="text-emerald-400 text-sm font-bold">Saved successfully!</div>}

      {sections.map(section => {
        const sectionData = content[section.key] as unknown as ItemShape[];
        return (
          <div key={section.key} className="card p-6 bg-[#0e1326]/80 border-white/5 glow-border">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  {section.key === 'services' ? <Ship className="h-4 w-4 text-cyan-400" /> : <ListChecks className="h-4 w-4 text-cyan-400" />}
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
                  <span className="font-bold text-cyan-400 w-1/3 shrink-0 truncate">{rowPrimary(item, section.key)}</span>
                  <span className="flex-1 text-slate-500 truncate">{rowSecondary(item, section.key)}</span>
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
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#0e1326] border border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingIndex !== null ? 'Edit' : 'Add'}{' '}
                  {isStats(formSection) ? 'Stat'
                    : isFaq(formSection) ? 'FAQ'
                      : isSegment(formSection) ? 'Goods Segment'
                        : isPreOrder(formSection) ? 'Pre-order Group'
                          : formSection === 'process' ? 'Process Step'
                            : formSection === 'requirements' ? 'Requirement Group'
                              : 'Service'}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white border border-white/5"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); saveItem(); }} className="space-y-4">
                {isStats(formSection) && (
                  <>
                    <div>
                      <label className={labelClass}>Value *</label>
                      <input type="text" required value={formData.value ?? ''} onChange={e => setFormData({ ...formData, value: e.target.value })} className={inputClass} placeholder="e.g. 1,200+" />
                    </div>
                    <div>
                      <label className={labelClass}>Label *</label>
                      <input type="text" required value={formData.label ?? ''} onChange={e => setFormData({ ...formData, label: e.target.value })} className={inputClass} placeholder="e.g. Shipments Cleared" />
                    </div>
                  </>
                )}

                {isFaq(formSection) && (
                  <>
                    <div>
                      <label className={labelClass}>Question *</label>
                      <input type="text" required value={formData.q ?? ''} onChange={e => setFormData({ ...formData, q: e.target.value })} className={inputClass} placeholder="e.g. How long does clearance take?" />
                    </div>
                    <div>
                      <label className={labelClass}>Answer</label>
                      <textarea rows={4} value={formData.a ?? ''} onChange={e => setFormData({ ...formData, a: e.target.value })} className={`${inputClass} resize-none`} />
                    </div>
                  </>
                )}

                {isSegment(formSection) && (
                  <>
                    <div>
                      <label className={labelClass}>Segment name *</label>
                      <input type="text" required value={formData.name ?? ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="e.g. Electronics &amp; Gadgets" />
                    </div>
                    <div>
                      <label className={labelClass}>Tagline</label>
                      <input type="text" value={formData.tagline ?? ''} onChange={e => setFormData({ ...formData, tagline: e.target.value })} className={inputClass} placeholder="One line describing this group of goods" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Duty band</label>
                        <input type="text" value={formData.dutyBand ?? ''} onChange={e => setFormData({ ...formData, dutyBand: e.target.value })} className={inputClass} placeholder="e.g. 20% or 5–20%" />
                      </div>
                      <div>
                        <label className={labelClass}>Recommended route</label>
                        <select value={formData.mode ?? 'Sea or Air'} onChange={e => setFormData({ ...formData, mode: e.target.value })} className={inputClass}>
                          {['Sea', 'Air', 'Sea or Air'].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Typical timeline</label>
                      <input type="text" value={formData.leadTime ?? ''} onChange={e => setFormData({ ...formData, leadTime: e.target.value })} className={inputClass} placeholder="e.g. Air 5–7 days · Sea 35–45 days" />
                    </div>
                    <div>
                      <label className={labelClass}>Examples (one per line)</label>
                      <textarea rows={3} value={examplesText} onChange={e => setExamplesText(e.target.value)} className={`${inputClass} resize-none`} placeholder={'Phones & tablets\nLaptops & accessories'} />
                    </div>
                    <div>
                      <label className={labelClass}>Permits &amp; approvals (one per line)</label>
                      <textarea rows={3} value={permitsText} onChange={e => setPermitsText(e.target.value)} className={`${inputClass} resize-none`} placeholder={'SONCAP Product Certificate\nNAFDAC import permit'} />
                    </div>
                    <div>
                      <label className={labelClass}>Guidance note</label>
                      <textarea rows={3} value={formData.notes ?? ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} className={`${inputClass} resize-none`} placeholder="What an importer of these goods must know" />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-300">
                      <input type="checkbox" checked={Boolean(formData.restricted)} onChange={e => setFormData({ ...formData, restricted: e.target.checked })} className="accent-cyan-500 h-4 w-4" />
                      Regulated goods — show the warning badge
                    </label>
                  </>
                )}

                {isPreOrder(formSection) && (
                  <>
                    <div>
                      <label className={labelClass}>Product / pool name *</label>
                      <input type="text" required value={formData.product ?? ''} onChange={e => setFormData({ ...formData, product: e.target.value })} className={inputClass} placeholder="e.g. Solar Inverter &amp; Battery Pool" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Segment</label>
                        <input type="text" value={formData.segment ?? ''} onChange={e => setFormData({ ...formData, segment: e.target.value })} className={inputClass} placeholder="e.g. Electronics &amp; Gadgets" />
                      </div>
                      <div>
                        <label className={labelClass}>Origin</label>
                        <input type="text" value={formData.origin ?? ''} onChange={e => setFormData({ ...formData, origin: e.target.value })} className={inputClass} placeholder="e.g. China (Shenzhen)" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Freight mode</label>
                        <input type="text" value={formData.mode ?? ''} onChange={e => setFormData({ ...formData, mode: e.target.value })} className={inputClass} placeholder="e.g. Sea LCL" />
                      </div>
                      <div>
                        <label className={labelClass}>Closing date</label>
                        <input type="date" value={String(formData.closingDate ?? '')} onChange={e => setFormData({ ...formData, closingDate: e.target.value })} className={inputClass} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Total slots</label>
                        <input type="number" min={0} value={String(formData.slotsTotal ?? '')} onChange={e => setFormData({ ...formData, slotsTotal: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Slots taken</label>
                        <input type="number" min={0} value={String(formData.slotsTaken ?? '')} onChange={e => setFormData({ ...formData, slotsTaken: e.target.value })} className={inputClass} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Slot deposit</label>
                        <input type="text" value={formData.deposit ?? ''} onChange={e => setFormData({ ...formData, deposit: e.target.value })} className={inputClass} placeholder="e.g. ₦150,000 per slot" />
                      </div>
                      <div>
                        <label className={labelClass}>Landed estimate</label>
                        <input type="text" value={formData.landed ?? ''} onChange={e => setFormData({ ...formData, landed: e.target.value })} className={inputClass} placeholder="e.g. from ₦1.85m per kit" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Group link (WhatsApp invite)</label>
                      <input type="url" value={formData.groupUrl ?? ''} onChange={e => setFormData({ ...formData, groupUrl: e.target.value })} className={inputClass} placeholder="https://chat.whatsapp.com/…" />
                    </div>
                    <div>
                      <label className={labelClass}>Note</label>
                      <textarea rows={3} value={formData.note ?? ''} onChange={e => setFormData({ ...formData, note: e.target.value })} className={`${inputClass} resize-none`} placeholder="Why this pool saves members money" />
                    </div>
                  </>
                )}

                {!isStats(formSection) && !isFaq(formSection) && !isSegment(formSection) && !isPreOrder(formSection) && (
                  <>
                    <div>
                      <label className={labelClass}>Title *</label>
                      <input type="text" required value={formData.title ?? ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputClass} placeholder="e.g. Customs Clearing & Duty Payment" />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea rows={3} value={formData.desc ?? ''} onChange={e => setFormData({ ...formData, desc: e.target.value })} className={`${inputClass} resize-none`} />
                    </div>
                  </>
                )}

                {formSection === 'process' && (
                  <div>
                    <label className={labelClass}>Duration / timeline</label>
                    <input type="text" value={formData.duration ?? ''} onChange={e => setFormData({ ...formData, duration: e.target.value })} className={inputClass} placeholder="e.g. Day 3–10" />
                  </div>
                )}

                {hasList(formSection) && (
                  <div>
                    <label className={labelClass}>{formSection === 'services' ? 'Features (one per line)' : 'Checklist items (one per line)'}</label>
                    <textarea rows={5} value={listText} onChange={e => setListText(e.target.value)} className={`${inputClass} resize-none`} placeholder={'Line one\nLine two'} />
                  </div>
                )}

                {hasIcon(formSection) && (
                  <div>
                    <label className={labelClass}>Icon</label>
                    <select value={formData.icon ?? 'Ship'} onChange={e => setFormData({ ...formData, icon: e.target.value })} className={inputClass}>
                      {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                  </div>
                )}

                {hasColor(formSection) && (
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

export default HaritechImportationManager;
