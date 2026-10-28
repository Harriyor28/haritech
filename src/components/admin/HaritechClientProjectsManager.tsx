import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Edit, Trash2, X, Users, RefreshCw, AlertCircle, Database } from 'lucide-react';
import { getSupabase, isCloudConfigured } from '../../utils/supabaseClient';
import { nairaShort } from '../../utils/haritechProperty';

const inputClass = 'w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white';
const labelClass = 'block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide';

const statusOptions = ['Active', 'Completed', 'On hold', 'Cancelled'];
const phaseOptions = ['Discovery & Scope', 'Design & Planning', 'Build & Procure', 'QA & Verification', 'Deploy & Handover', 'Delivered'];

interface Milestone { title: string; done: boolean }
interface DocumentRow { name: string; status: string }
interface UpdateRow { date: string; text: string }

export interface ClientProjectRow {
  id: number;
  client_email: string;
  title: string;
  client: string;
  category: string;
  phase: string;
  status: string;
  progress: number;
  planned: number;
  summary: string;
  owner: string;
  target_date: string | null;
  budget_naira: number;
  spent_naira: number;
  next_milestone: string;
  milestones: Milestone[];
  documents: DocumentRow[];
  updates: UpdateRow[];
  created_at?: string;
}

type FormShape = Omit<ClientProjectRow, 'id' | 'created_at' | 'milestones' | 'documents' | 'updates'> & {
  milestonesText: string;
  documentsText: string;
  updatesText: string;
};

const emptyForm = (): FormShape => ({
  client_email: '',
  title: '',
  client: '',
  category: '',
  phase: phaseOptions[0],
  status: 'Active',
  progress: 0,
  planned: 0,
  summary: '',
  owner: '',
  target_date: null,
  budget_naira: 0,
  spent_naira: 0,
  next_milestone: '',
  milestonesText: '',
  documentsText: '',
  updatesText: '',
});

const rowToForm = (row: ClientProjectRow): FormShape => ({
  client_email: row.client_email,
  title: row.title,
  client: row.client,
  category: row.category,
  phase: row.phase,
  status: row.status,
  progress: row.progress,
  planned: row.planned,
  summary: row.summary,
  owner: row.owner,
  target_date: row.target_date,
  budget_naira: row.budget_naira,
  spent_naira: row.spent_naira,
  next_milestone: row.next_milestone,
  milestonesText: (row.milestones ?? []).map(m => `${m.title}${m.done ? ' | done' : ''}`).join('\n'),
  documentsText: (row.documents ?? []).map(d => `${d.name} | ${d.status}`).join('\n'),
  updatesText: (row.updates ?? []).map(u => `${u.date} | ${u.text}`).join('\n'),
});

const lines = (value: string) => value.split('\n').map(s => s.trim()).filter(Boolean);

const parseMilestones = (value: string): Milestone[] =>
  lines(value).map(line => {
    const [title, flag] = line.split('|');
    return { title: (title ?? '').trim(), done: (flag ?? '').trim().toLowerCase() === 'done' };
  }).filter(m => m.title.length > 0);

const parseDocuments = (value: string): DocumentRow[] =>
  lines(value).map(line => {
    const [name, status] = line.split('|');
    return { name: (name ?? '').trim(), status: (status ?? 'Shared').trim() };
  }).filter(d => d.name.length > 0);

const parseUpdates = (value: string): UpdateRow[] =>
  lines(value).map(line => {
    const [date, text] = line.split('|');
    return { date: (date ?? '').trim(), text: (text ?? '').trim() };
  }).filter(u => u.text.length > 0);

const HaritechClientProjectsManager: React.FC = () => {
  const [rows, setRows] = useState<ClientProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormShape>(emptyForm);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }
    setLoading(true);
    setError('');
    const { data, error: qError } = await sb
      .from('client_projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (qError) setError(qError.message || 'Could not load client assignments.');
    setRows((data ?? []) as unknown as ClientProjectRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const flashSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const openAdd = () => { setEditingId(null); setForm(emptyForm()); setShowForm(true); };
  const openEdit = (row: ClientProjectRow) => { setEditingId(row.id); setForm(rowToForm(row)); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    if (!form.title.trim() || !form.client_email.trim()) return;
    setBusy(true);
    setError('');
    const payload = {
      client_email: form.client_email.trim(),
      title: form.title.trim(),
      client: form.client.trim(),
      category: form.category.trim(),
      phase: form.phase,
      status: form.status,
      progress: Math.max(0, Math.min(100, Number(form.progress) || 0)),
      planned: Math.max(0, Math.min(100, Number(form.planned) || 0)),
      summary: form.summary.trim(),
      owner: form.owner.trim(),
      target_date: form.target_date || null,
      budget_naira: Math.max(0, Number(form.budget_naira) || 0),
      spent_naira: Math.max(0, Number(form.spent_naira) || 0),
      next_milestone: form.next_milestone.trim(),
      milestones: parseMilestones(form.milestonesText),
      documents: parseDocuments(form.documentsText),
      updates: parseUpdates(form.updatesText),
    };
    const { error: writeError } = editingId === null
      ? await sb.from('client_projects').insert(payload)
      : await sb.from('client_projects').update(payload).eq('id', editingId);
    setBusy(false);
    if (writeError) {
      setError(writeError.message || 'Could not save the assignment.');
      return;
    }
    setShowForm(false);
    setEditingId(null);
    flashSaved();
    load();
  };

  const handleDelete = async (row: ClientProjectRow) => {
    if (!window.confirm(`Remove "${row.title}" from ${row.client_email}? The client will no longer see it.`)) return;
    const sb = getSupabase();
    if (!sb) return;
    setError('');
    const { error: delError } = await sb.from('client_projects').delete().eq('id', row.id);
    if (delError) setError(delError.message || 'Could not delete the assignment.');
    else load();
  };

  if (!isCloudConfigured()) {
    return (
      <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border text-center">
        <Database className="mx-auto mb-3 h-8 w-8 text-cyan-500/50" />
        <h4 className="text-sm font-bold text-white">Client assignments need Supabase</h4>
        <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
          Connect a Supabase project (and run supabase/schema.sql) to assign client projects.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          Assign projects to client accounts — signed-in clients see only their own rows, enforced by Row Level Security.
        </p>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={load} disabled={loading} className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-300 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAdd} className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-xs font-bold text-cyan-400 transition-all hover:bg-cyan-500 hover:text-white">
            <Plus className="h-3.5 w-3.5" /> Assign Project
          </motion.button>
        </div>
      </div>

      {saved && <div className="text-sm font-bold text-emerald-400">Saved successfully!</div>}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="card p-6 bg-[#0e1326]/80 border-white/5 glow-border">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Client Assignments</h4>
            <p className="text-xs text-slate-500">{rows.length} assigned {rows.length === 1 ? 'project' : 'projects'}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <RefreshCw className="h-5 w-5 animate-spin text-cyan-400" />
          </div>
        ) : rows.length === 0 ? (
          <p className="px-1 py-4 text-xs text-slate-600">
            No client projects yet — click Assign Project to give a client their first dashboard record.
          </p>
        ) : (
          <div className="space-y-2">
            {rows.map(row => (
              <div key={row.id} className="flex items-center gap-3 rounded-lg bg-slate-950/40 px-3 py-2.5 text-xs text-slate-300">
                <span className="w-1/3 shrink-0 truncate font-bold text-cyan-400">{row.title}</span>
                <span className="flex-1 truncate text-slate-500">
                  {row.client_email} · {row.client || '—'} · {row.status} · {row.progress}%
                  {row.budget_naira ? ` · ${nairaShort(row.budget_naira)}` : ''}
                </span>
                <button onClick={() => openEdit(row)} className="rounded-lg border border-white/5 bg-slate-900/50 p-1.5 text-slate-500 transition-colors hover:text-cyan-400">
                  <Edit className="h-3 w-3" />
                </button>
                <button onClick={() => handleDelete(row)} className="rounded-lg border border-white/5 bg-slate-900/50 p-1.5 text-slate-500 transition-colors hover:text-red-400">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0e1326] p-6 shadow-2xl sm:p-8" onClick={e => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{editingId !== null ? 'Edit' : 'Assign'} Client Project</h3>
                <button onClick={() => setShowForm(false)} className="rounded-lg border border-white/5 p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Client email *</label>
                    <input type="email" required value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })} className={inputClass} placeholder="client@example.com" />
                    <p className="mt-1 text-[10px] text-slate-600">Must match the email they sign in with.</p>
                  </div>
                  <div>
                    <label className={labelClass}>Organisation / household</label>
                    <input type="text" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} className={inputClass} placeholder="e.g. Adeyemi Family" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Project title *</label>
                  <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="e.g. 4-Bedroom Duplex — Lekki" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Category</label>
                    <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass} placeholder="e.g. Construction" />
                  </div>
                  <div>
                    <label className={labelClass}>Project lead</label>
                    <input type="text" value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} className={inputClass} placeholder="e.g. Engr. Balogun" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>Phase</label>
                    <select value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })} className={inputClass}>
                      {phaseOptions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputClass}>
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Target date</label>
                    <input type="date" value={form.target_date ?? ''} onChange={e => setForm({ ...form, target_date: e.target.value || null })} className={inputClass} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Progress % ({form.progress})</label>
                    <input type="range" min={0} max={100} value={form.progress} onChange={e => setForm({ ...form, progress: Number(e.target.value) })} className="w-full accent-cyan-500" />
                  </div>
                  <div>
                    <label className={labelClass}>Planned % ({form.planned})</label>
                    <input type="range" min={0} max={100} value={form.planned} onChange={e => setForm({ ...form, planned: Number(e.target.value) })} className="w-full accent-cyan-500" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>Budget (₦)</label>
                    <input type="number" min={0} value={form.budget_naira} onChange={e => setForm({ ...form, budget_naira: Number(e.target.value) })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Spent (₦)</label>
                    <input type="number" min={0} value={form.spent_naira} onChange={e => setForm({ ...form, spent_naira: Number(e.target.value) })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Next milestone</label>
                    <input type="text" value={form.next_milestone} onChange={e => setForm({ ...form, next_milestone: e.target.value })} className={inputClass} placeholder="e.g. Roofing complete" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Summary</label>
                  <textarea rows={2} value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} className={`${inputClass} resize-none`} placeholder="What the client should know about where this stands" />
                </div>

                <div>
                  <label className={labelClass}>Milestones — one per line, append " | done" when finished</label>
                  <textarea rows={3} value={form.milestonesText} onChange={e => setForm({ ...form, milestonesText: e.target.value })} className={`${inputClass} resize-none font-mono text-xs`} placeholder={'Foundation | done\nRoofing\nSnagging'} />
                </div>

                <div>
                  <label className={labelClass}>Documents — one per line as "name | status"</label>
                  <textarea rows={3} value={form.documentsText} onChange={e => setForm({ ...form, documentsText: e.target.value })} className={`${inputClass} resize-none font-mono text-xs`} placeholder={'Building plan v3 | Approved\nInvoice #0142 | Shared'} />
                </div>

                <div>
                  <label className={labelClass}>Updates — one per line as "YYYY-MM-DD | text"</label>
                  <textarea rows={3} value={form.updatesText} onChange={e => setForm({ ...form, updatesText: e.target.value })} className={`${inputClass} resize-none font-mono text-xs`} placeholder={'2026-10-20 | First-floor slab poured and cured.'} />
                </div>

                <button type="submit" disabled={busy} className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-sm disabled:opacity-60">
                  <Save className="h-4 w-4" /> {busy ? 'Saving...' : editingId !== null ? 'Save Changes' : 'Assign Project'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HaritechClientProjectsManager;