import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit, Trash2, X, Kanban, ListChecks } from 'lucide-react';
import { getPMContent, setPMContent } from '../../utils/haritechContent';
import type { PMContent } from '../../utils/haritechContent';

const inputClass = 'w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white';
const labelClass = 'block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide';

const iconOptions = [
  'Monitor', 'Sun', 'Ship', 'Paintbrush', 'Landmark', 'Headphones', 'UserCog', 'Kanban',
  'FileText', 'GitBranch', 'ShieldCheck', 'PackageCheck', 'Activity', 'Gauge', 'Target',
  'Rocket', 'Timer', 'ListChecks', 'Users', 'Compass',
];

const colorOptions = [
  'from-blue-500 to-indigo-600', 'from-amber-500 to-orange-600', 'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-purple-600', 'from-emerald-500 to-teal-600', 'from-rose-500 to-red-600',
  'from-teal-500 to-emerald-600', 'from-violet-500 to-indigo-600', 'from-slate-500 to-gray-600',
];

const statusOptions = ['Planning', 'In build', 'QA & Verification', 'Deploy & Handover', 'Delivered', 'Live'];

type SectionKey = keyof PMContent;

const sections: { key: SectionKey; title: string; hint: string }[] = [
  { key: 'categories', title: 'Delivery Lines', hint: 'The categories projects are filed under — name, one-line description, icon and gradient.' },
  { key: 'stages', title: 'Delivery Phases', hint: 'The phases of the board, in order. Projects are grouped by phase name, so keep the phase on a project matched to one of these.' },
  { key: 'rituals', title: 'Operating Rules', hint: 'The “six rules” cards — how the team runs every engagement.' },
  { key: 'projects', title: 'Projects', hint: 'Every engagement on the board: owner, crew, milestones, dates, progress and the last written update.' },
  { key: 'faqs', title: 'FAQ', hint: 'Questions and answers shown at the bottom of the Project Management page.' },
];

interface ItemShape {
  id?: string;
  name?: string;
  desc?: string;
  icon?: string;
  color?: string;
  sla?: string;
  title?: string;
  q?: string;
  a?: string;
  // project
  client?: string;
  categoryId?: string;
  status?: string;
  progress?: number;
  phase?: string;
  summary?: string;
  owner?: string;
  team?: string[];
  tags?: string[];
  deliverables?: string[];
  milestones?: { title: string; done: boolean }[];
  startDate?: string;
  targetDate?: string;
  lastUpdate?: string;
  [k: string]: unknown;
}

const lines = (value: string) => value.split('\n').map(s => s.trim()).filter(Boolean);
const slug = (value: unknown) =>
  String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const isProject = (key: SectionKey) => key === 'projects';
const isFaq = (key: SectionKey) => key === 'faqs';
const isCategory = (key: SectionKey) => key === 'categories';

const HaritechProjectManager: React.FC = () => {
  const [content, setContent] = useState<PMContent>(() => getPMContent());
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formSection, setFormSection] = useState<SectionKey>('categories');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ItemShape>({});

  const [teamText, setTeamText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [deliverablesText, setDeliverablesText] = useState('');
  const [milestonesText, setMilestonesText] = useState('');

  useEffect(() => { setContent(getPMContent()); }, []);

  const handleSave = () => {
    setPMContent(content);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const openAdd = (section: SectionKey) => {
    setFormSection(section);
    setEditingIndex(null);
    setTeamText('');
    setTagsText('');
    setDeliverablesText('');
    setMilestonesText('');
    if (section === 'categories') {
      setFormData({ id: '', name: '', desc: '', icon: 'Monitor', color: 'from-cyan-500 to-blue-600' });
    } else if (section === 'stages') {
      setFormData({ name: '', desc: '', sla: '1–3 days' });
    } else if (section === 'rituals') {
      setFormData({ title: '', desc: '', icon: 'ShieldCheck' });
    } else if (section === 'faqs') {
      setFormData({ q: '', a: '' });
    } else {
      const today = new Date();
      setFormData({
        id: '',
        title: '',
        client: '',
        categoryId: content.categories[0]?.id ?? 'digital',
        status: 'Planning',
        progress: 0,
        phase: content.stages[0]?.name ?? 'Discovery & Scope',
        summary: '',
        owner: '',
        startDate: today.toISOString().slice(0, 10),
        targetDate: new Date(today.getTime() + 42 * 86_400_000).toISOString().slice(0, 10),
        lastUpdate: '',
      });
    }
    setShowForm(true);
  };

  const openEdit = (section: SectionKey, index: number) => {
    const item = (content[section] as ItemShape[])[index];
    const { team, tags, deliverables, milestones, ...rest } = item;
    setFormSection(section);
    setEditingIndex(index);
    setFormData(rest);
    setTeamText((team ?? []).join('\n'));
    setTagsText((tags ?? []).join('\n'));
    setDeliverablesText((deliverables ?? []).join('\n'));
    setMilestonesText(
      (milestones ?? []).map(m => `${m.title}${m.done ? ' | done' : ''}`).join('\n')
    );
    setShowForm(true);
  };

  const saveItem = () => {
    const item: ItemShape = { ...formData };

    if (isCategory(formSection)) {
      if (!item.name?.trim()) return;
      item.id = slug(item.id) || slug(item.name);
    } else if (isFaq(formSection)) {
      if (!item.q?.trim()) return;
      item.a = String(item.a ?? '');
    } else if (isProject(formSection)) {
      if (!item.title?.trim()) return;
      item.id = slug(item.id) || slug(item.title);
      item.progress = Math.max(0, Math.min(100, Number(item.progress) || 0));
      item.team = lines(teamText);
      item.tags = lines(tagsText);
      item.deliverables = lines(deliverablesText);
      item.milestones = lines(milestonesText).map(line => {
        const [title, flag] = line.split('|');
        return { title: (title ?? '').trim(), done: (flag ?? '').trim().toLowerCase() === 'done' };
      }).filter(milestone => milestone.title.length > 0);
      item.summary = String(item.summary ?? '');
      item.lastUpdate = String(item.lastUpdate ?? '');
      item.owner = String(item.owner ?? '');
      item.client = String(item.client ?? '');
    } else if (!item.title?.trim() && !item.name?.trim()) {
      return;
    }

    const updated = (content[formSection] as unknown as ItemShape[]).slice();
    if (editingIndex !== null) updated[editingIndex] = item;
    else updated.push(item);
    setContent({ ...content, [formSection]: updated } as unknown as PMContent);
    setShowForm(false);
    setEditingIndex(null);
  };

  const deleteItem = (section: SectionKey, index: number) => {
    const updated = (content[section] as unknown[]).filter((_, i) => i !== index);
    setContent({ ...content, [section]: updated } as unknown as PMContent);
  };

  const rowPrimary = (item: ItemShape, section: SectionKey) => {
    if (isFaq(section)) return item.q;
    if (isCategory(section)) return item.name;
    return item.title ?? item.name;
  };

  const rowSecondary = (item: ItemShape, section: SectionKey) => {
    if (isFaq(section)) return item.a;
    if (isCategory(section)) return item.desc;
    if (isProject(section)) {
      const category = content.categories.find(c => c.id === item.categoryId)?.name ?? item.categoryId;
      return `${item.client ?? ''} · ${category ?? ''} · ${item.progress ?? 0}% · ${item.phase ?? ''}`;
    }
    if (section === 'stages') return `${item.sla ?? ''} · ${item.desc ?? ''}`;
    return item.desc;
  };

  const projectCount = (categoryId: string) =>
    content.projects.filter(project => project.categoryId === categoryId).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">Manage the Delivery Command Centre — delivery lines, phases, operating rules, projects and FAQs.</p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm">
          <Save className="h-4 w-4" /> Save
        </motion.button>
      </div>
      {saved && <div className="text-sm font-bold text-emerald-400">Saved successfully!</div>}

      {sections.map(section => {
        const sectionData = content[section.key] as unknown as ItemShape[];
        return (
          <div key={section.key} className="card p-6 bg-[#0e1326]/80 border-white/5 glow-border">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
                  {section.key === 'projects' ? <Kanban className="h-4 w-4 text-cyan-400" /> : <ListChecks className="h-4 w-4 text-cyan-400" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{section.title}</h4>
                  <p className="text-xs text-slate-500">{sectionData.length} items</p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => openAdd(section.key)} className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-400 transition-all hover:bg-cyan-500 hover:text-white">
                <Plus className="h-3.5 w-3.5" /> Add
              </motion.button>
            </div>
            <p className="mb-4 ml-12 text-xs text-slate-500">{section.hint}</p>
            <div className="space-y-2">
              {sectionData.map((item, i) => (
                <div key={`${section.key}-${i}`} className="flex items-center gap-3 rounded-lg bg-slate-950/40 px-3 py-2.5 text-xs text-slate-300">
                  <span className="w-1/3 shrink-0 truncate font-bold text-cyan-400">{rowPrimary(item, section.key)}</span>
                  <span className="flex-1 truncate text-slate-500">{rowSecondary(item, section.key)}</span>
                  {isCategory(section.key) && (
                    <span className="shrink-0 rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                      {projectCount(String(item.id ?? ''))} projects
                    </span>
                  )}
                  <button onClick={() => openEdit(section.key, i)} className="rounded-lg border border-white/5 bg-slate-900/50 p-1.5 text-slate-500 transition-colors hover:text-cyan-400">
                    <Edit className="h-3 w-3" />
                  </button>
                  <button onClick={() => deleteItem(section.key, i)} className="rounded-lg border border-white/5 bg-slate-900/50 p-1.5 text-slate-500 transition-colors hover:text-red-400">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {sectionData.length === 0 && <p className="px-3 py-2 text-xs text-slate-600">No items yet — click Add.</p>}
            </div>
          </div>
        );
      })}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0e1326] p-6 shadow-2xl sm:p-8" onClick={e => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {editingIndex !== null ? 'Edit' : 'Add'}{' '}
                  {formSection === 'categories' ? 'Delivery Line'
                    : formSection === 'stages' ? 'Phase'
                      : formSection === 'rituals' ? 'Operating Rule'
                        : formSection === 'projects' ? 'Project'
                          : 'FAQ'}
                </h3>
                <button onClick={() => setShowForm(false)} className="rounded-lg border border-white/5 p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={e => { e.preventDefault(); saveItem(); }} className="space-y-4">
                {formSection === 'categories' && (
                  <>
                    <div>
                      <label className={labelClass}>Name *</label>
                      <input type="text" required value={formData.name ?? ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="e.g. Digital Systems" />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea rows={2} value={formData.desc ?? ''} onChange={e => setFormData({ ...formData, desc: e.target.value })} className={`${inputClass} resize-none`} placeholder="One line on what this delivery line covers" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Icon</label>
                        <select value={formData.icon ?? 'Monitor'} onChange={e => setFormData({ ...formData, icon: e.target.value })} className={inputClass}>
                          {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Colour</label>
                        <select value={formData.color ?? ''} onChange={e => setFormData({ ...formData, color: e.target.value })} className={inputClass}>
                          {colorOptions.map(color => <option key={color} value={color}>{color.replace('from-', '').replace(' to-', ' → ')}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Slug (optional)</label>
                      <input type="text" value={formData.id ?? ''} onChange={e => setFormData({ ...formData, id: e.target.value })} className={inputClass} placeholder="Auto-filled from the name" />
                    </div>
                  </>
                )}

                {formSection === 'stages' && (
                  <>
                    <div>
                      <label className={labelClass}>Phase name *</label>
                      <input type="text" required value={formData.name ?? ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="e.g. Build & Procure" />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea rows={2} value={formData.desc ?? ''} onChange={e => setFormData({ ...formData, desc: e.target.value })} className={`${inputClass} resize-none`} />
                    </div>
                    <div>
                      <label className={labelClass}>Service level / timeline</label>
                      <input type="text" value={formData.sla ?? ''} onChange={e => setFormData({ ...formData, sla: e.target.value })} className={inputClass} placeholder="e.g. 1–12 weeks" />
                    </div>
                  </>
                )}

                {formSection === 'rituals' && (
                  <>
                    <div>
                      <label className={labelClass}>Title *</label>
                      <input type="text" required value={formData.title ?? ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputClass} placeholder="e.g. One project owner" />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea rows={3} value={formData.desc ?? ''} onChange={e => setFormData({ ...formData, desc: e.target.value })} className={`${inputClass} resize-none`} />
                    </div>
                    <div>
                      <label className={labelClass}>Icon</label>
                      <select value={formData.icon ?? 'ShieldCheck'} onChange={e => setFormData({ ...formData, icon: e.target.value })} className={inputClass}>
                        {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {formSection === 'faqs' && (
                  <>
                    <div>
                      <label className={labelClass}>Question *</label>
                      <input type="text" required value={formData.q ?? ''} onChange={e => setFormData({ ...formData, q: e.target.value })} className={inputClass} placeholder="e.g. How do I see progress?" />
                    </div>
                    <div>
                      <label className={labelClass}>Answer</label>
                      <textarea rows={4} value={formData.a ?? ''} onChange={e => setFormData({ ...formData, a: e.target.value })} className={`${inputClass} resize-none`} />
                    </div>
                  </>
                )}

                {isProject(formSection) && (
                  <>
                    <div>
                      <label className={labelClass}>Project title *</label>
                      <input type="text" required value={formData.title ?? ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputClass} placeholder="e.g. Inventory & Sales ERP" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Client</label>
                        <input type="text" value={formData.client ?? ''} onChange={e => setFormData({ ...formData, client: e.target.value })} className={inputClass} placeholder="e.g. Northgate Consumer Ltd" />
                      </div>
                      <div>
                        <label className={labelClass}>Delivery line</label>
                        <select value={formData.categoryId ?? ''} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className={inputClass}>
                          {content.categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Phase on the board</label>
                        <select value={formData.phase ?? ''} onChange={e => setFormData({ ...formData, phase: e.target.value })} className={inputClass}>
                          {content.stages.map(stage => <option key={stage.name} value={stage.name}>{stage.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Status label</label>
                        <input type="text" list="pm-status-options" value={formData.status ?? ''} onChange={e => setFormData({ ...formData, status: e.target.value })} className={inputClass} placeholder="e.g. In build" />
                        <datalist id="pm-status-options">
                          {statusOptions.map(status => <option key={status} value={status} />)}
                        </datalist>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Summary</label>
                      <textarea rows={3} value={formData.summary ?? ''} onChange={e => setFormData({ ...formData, summary: e.target.value })} className={`${inputClass} resize-none`} placeholder="What the client is getting, in one or two sentences" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className={labelClass}>Progress %</label>
                        <input type="number" min={0} max={100} value={String(formData.progress ?? 0)} onChange={e => setFormData({ ...formData, progress: Number(e.target.value) })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Start date</label>
                        <input type="date" value={formData.startDate ?? ''} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Target date</label>
                        <input type="date" value={formData.targetDate ?? ''} onChange={e => setFormData({ ...formData, targetDate: e.target.value })} className={inputClass} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Project owner</label>
                        <input type="text" value={formData.owner ?? ''} onChange={e => setFormData({ ...formData, owner: e.target.value })} className={inputClass} placeholder="e.g. Chidi Okonkwo" />
                      </div>
                      <div>
                        <label className={labelClass}>Last written update</label>
                        <input type="text" value={formData.lastUpdate ?? ''} onChange={e => setFormData({ ...formData, lastUpdate: e.target.value })} className={inputClass} placeholder="e.g. Stock module live at two depots" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Team (one name per line)</label>
                      <textarea rows={3} value={teamText} onChange={e => setTeamText(e.target.value)} className={`${inputClass} resize-none`} placeholder={'Chidi Okonkwo\nFatima Bello'} />
                    </div>
                    <div>
                      <label className={labelClass}>Tags (one per line)</label>
                      <textarea rows={2} value={tagsText} onChange={e => setTagsText(e.target.value)} className={`${inputClass} resize-none`} placeholder={'React\nPostgreSQL'} />
                    </div>
                    <div>
                      <label className={labelClass}>Deliverables (one per line)</label>
                      <textarea rows={3} value={deliverablesText} onChange={e => setDeliverablesText(e.target.value)} className={`${inputClass} resize-none`} placeholder={'Warehouse module\nManagement dashboards'} />
                    </div>
                    <div>
                      <label className={labelClass}>Milestones (one per line, append | done to tick)</label>
                      <textarea rows={4} value={milestonesText} onChange={e => setMilestonesText(e.target.value)} className={`${inputClass} resize-none`} placeholder={'Requirements sign-off | done\nDatabase & architecture\nPilot at Yaba depot'} />
                    </div>
                    <div>
                      <label className={labelClass}>Slug (optional)</label>
                      <input type="text" value={formData.id ?? ''} onChange={e => setFormData({ ...formData, id: e.target.value })} className={inputClass} placeholder="Auto-filled from the title" />
                    </div>
                  </>
                )}

                <div className="flex gap-4 pt-2">
                  <button type="submit" className="flex-1 btn-primary rounded-xl px-6 py-3 text-sm">
                    <Save className="h-4 w-4" /> {editingIndex !== null ? 'Update' : 'Add'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-white/5 px-6 py-3 text-sm text-slate-400 transition-colors hover:bg-white/5">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HaritechProjectManager;
