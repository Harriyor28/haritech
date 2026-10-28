import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, Trash2, X, ClipboardCheck, MessageCircle, RefreshCw, AlertCircle, Database } from 'lucide-react';
import { getSupabase, isCloudConfigured } from '../../utils/supabaseClient';
import { nairaShort } from '../../utils/haritechProperty';

const inputClass = 'w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white';
const labelClass = 'block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide';

interface ApprovalRow {
  id: number;
  client_email: string;
  project_id: number | null;
  title: string;
  detail: string;
  amount_naira: number;
  status: 'Pending' | 'Approved' | 'Declined';
  created_at: string;
  responded_at: string | null;
}

interface MessageRow {
  id: number;
  client_email: string;
  sender: 'client' | 'admin';
  body: string;
  created_at: string;
}

interface ProjectOption { id: number; title: string; client_email: string }

const approvalTone = (status: ApprovalRow['status']) =>
  status === 'Approved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  : status === 'Declined' ? 'text-red-400 bg-red-500/10 border-red-500/20'
  : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

const dayTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

/* ── Approvals ───────────────────────────────────────────────────────── */

const ApprovalsSection: React.FC<{ projects: ProjectOption[]; onChanged: () => void }> = ({ projects, onChanged }) => {
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ client_email: '', project_id: '', title: '', detail: '', amount: 0 });

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) { setLoaded(true); return; }
    const { data, error: qError } = await sb.from('client_approvals').select('*').order('created_at', { ascending: false });
    if (qError) setError(qError.message || 'Could not load approvals.');
    else { setError(''); setRows((data ?? []) as unknown as ApprovalRow[]); }
    setLoaded(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb || !form.title.trim() || !form.client_email.trim()) return;
    setBusy(true);
    const { error: insError } = await sb.from('client_approvals').insert({
      client_email: form.client_email.trim(),
      project_id: form.project_id ? Number(form.project_id) : null,
      title: form.title.trim(),
      detail: form.detail.trim(),
      amount_naira: Math.max(0, Number(form.amount) || 0),
    });
    setBusy(false);
    if (insError) { setError(insError.message || 'Could not create the approval.'); return; }
    setShowForm(false);
    setForm({ client_email: '', project_id: '', title: '', detail: '', amount: 0 });
    load();
    onChanged();
  };

  const remove = async (row: ApprovalRow) => {
    if (!window.confirm(`Delete approval "${row.title}"?`)) return;
    const sb = getSupabase();
    if (!sb) return;
    const { error: delError } = await sb.from('client_approvals').delete().eq('id', row.id);
    if (delError) setError(delError.message || 'Could not delete.');
    else load();
  };

  const pending = rows.filter(r => r.status === 'Pending').length;

  return (
    <div className="card p-6 bg-[#0e1326]/80 border-white/5 glow-border">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
            <ClipboardCheck className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Portal Approvals</h4>
            <p className="text-xs text-slate-500">{rows.length} total · {pending} pending client responses</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-400 transition-all hover:bg-cyan-500 hover:text-white">
          <Plus className="h-3.5 w-3.5" /> New Approval
        </motion.button>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {!loaded ? (
        <div className="flex justify-center py-8"><RefreshCw className="h-5 w-5 animate-spin text-cyan-400" /></div>
      ) : rows.length === 0 ? (
        <p className="py-3 text-xs text-slate-600">No approvals yet — create one to ask a client for a decision.</p>
      ) : (
        <div className="space-y-2">
          {rows.map(row => (
            <div key={row.id} className="flex items-center gap-3 rounded-lg bg-slate-950/40 px-3 py-2.5 text-xs text-slate-300">
              <span className="w-1/3 shrink-0 truncate font-bold text-cyan-400">{row.title}</span>
              <span className="flex-1 truncate text-slate-500">
                {row.client_email}{row.amount_naira ? ` · ${nairaShort(row.amount_naira)}` : ''} · {dayTime(row.created_at)}
              </span>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${approvalTone(row.status)}`}>{row.status}</span>
              <button onClick={() => remove(row)} className="rounded-lg border border-white/5 bg-slate-900/50 p-1.5 text-slate-500 transition-colors hover:text-red-400">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0e1326] p-6 shadow-2xl sm:p-8" onClick={e => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">New Approval Request</h3>
                <button onClick={() => setShowForm(false)} className="rounded-lg border border-white/5 p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={create} className="space-y-4">
                <div>
                  <label className={labelClass}>Client email *</label>
                  <input type="email" required value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })} className={inputClass} placeholder="client@example.com" list="pm-approval-clients" />
                  <datalist id="pm-approval-clients">
                    {[...new Set(projects.map(p => p.client_email))].map(email => <option key={email} value={email} />)}
                  </datalist>
                </div>
                <div>
                  <label className={labelClass}>Related project (optional)</label>
                  <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} className={inputClass}>
                    <option value="">— none —</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Title *</label>
                  <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="e.g. Roofing package quotation — ₦9.4m" />
                </div>
                <div>
                  <label className={labelClass}>Detail</label>
                  <textarea rows={3} value={form.detail} onChange={e => setForm({ ...form, detail: e.target.value })} className={`${inputClass} resize-none`} placeholder="What exactly is the client approving or declining?" />
                </div>
                <div>
                  <label className={labelClass}>Amount (₦, optional)</label>
                  <input type="number" min={0} value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} className={inputClass} />
                </div>
                <button type="submit" disabled={busy} className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-sm disabled:opacity-60">
                  <Send className="h-4 w-4" /> {busy ? 'Creating...' : 'Send to Client'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Message thread ──────────────────────────────────────────────────── */

const MessagesSection: React.FC<{ projects: ProjectOption[] }> = ({ projects }) => {
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [activeClient, setActiveClient] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) { setLoaded(true); return; }
    const { data, error: qError } = await sb.from('client_messages').select('*').order('created_at', { ascending: true });
    if (qError) setError(qError.message || 'Could not load messages.');
    else { setError(''); setRows((data ?? []) as unknown as MessageRow[]); }
    setLoaded(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  const clients = useMemo(() => {
    const set = new Map<string, { email: string; lastAt: string; unread: number }>();
    for (const row of rows) {
      const prev = set.get(row.client_email);
      set.set(row.client_email, {
        email: row.client_email,
        lastAt: row.created_at,
        unread: (prev?.unread ?? 0) + (row.sender === 'client' ? 1 : 0),
      });
    }
    // Clients known from assignments but with no messages yet
    for (const p of projects) {
      if (p.client_email && !set.has(p.client_email)) {
        set.set(p.client_email, { email: p.client_email, lastAt: '', unread: 0 });
      }
    }
    return [...set.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  }, [rows, projects]);

  useEffect(() => {
    if (!activeClient && clients.length > 0) setActiveClient(clients[0].email);
  }, [clients, activeClient]);

  const thread = rows.filter(r => r.client_email === activeClient);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    const sb = getSupabase();
    if (!sb || !body || !activeClient || sending) return;
    setSending(true);
    const { data, error: insError } = await sb
      .from('client_messages')
      .insert({ client_email: activeClient, sender: 'admin', body })
      .select('*');
    if (insError) setError(insError.message || 'Could not send the reply.');
    else {
      setError('');
      setRows(prev => [...prev, ...((data ?? []) as unknown as MessageRow[])]);
      setDraft('');
    }
    setSending(false);
  };

  return (
    <div className="card p-6 bg-[#0e1326]/80 border-white/5 glow-border">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
          <MessageCircle className="h-4 w-4 text-cyan-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Client Messages</h4>
          <p className="text-xs text-slate-500">Reply to client threads from the portal</p>
        </div>
        <button onClick={load} disabled={!loaded} className="ml-auto rounded-lg border border-white/10 bg-slate-900/50 p-2 text-slate-500 transition-colors hover:text-cyan-400 disabled:opacity-50">
          <RefreshCw className={`h-3.5 w-3.5 ${!loaded ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {!loaded ? (
        <div className="flex justify-center py-8"><RefreshCw className="h-5 w-5 animate-spin text-cyan-400" /></div>
      ) : clients.length === 0 ? (
        <p className="py-3 text-xs text-slate-600">No client threads yet — messages appear when a client writes from the portal.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className="space-y-1.5">
            {clients.map(c => (
              <button
                key={c.email}
                onClick={() => setActiveClient(c.email)}
                className={`w-full truncate rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                  activeClient === c.email
                    ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                    : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/10'
                }`}
              >
                {c.email}
                {c.unread > 0 && (
                  <span className="ml-1.5 rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">{c.unread}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex min-h-[220px] flex-col">
            <div className="max-h-72 flex-1 space-y-2 overflow-y-auto rounded-xl border border-white/5 bg-slate-950/40 p-3">
              {thread.length === 0 ? (
                <p className="py-3 text-center text-[11px] text-slate-600">No messages in this thread yet.</p>
              ) : (
                thread.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                      msg.sender === 'admin' ? 'rounded-br-sm bg-cyan-500/15 text-slate-200' : 'rounded-bl-sm bg-white/5 text-slate-300'
                    }`}>
                      <div className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        {msg.sender === 'admin' ? 'You' : 'Client'} · {dayTime(msg.created_at)}
                      </div>
                      {msg.body}
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={send} className="mt-2.5 flex gap-2">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                maxLength={4000}
                placeholder={`Reply to ${activeClient || 'client'}...`}
                className="flex-1 rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2.5 text-xs text-white outline-none transition-colors focus:border-cyan-500/50"
              />
              <button type="submit" disabled={sending || !draft.trim()} className="btn-secondary px-4 py-2.5 text-xs disabled:opacity-50">
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Wrapper ─────────────────────────────────────────────────────────── */

const HaritechPortalManager: React.FC = () => {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const loadProjects = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb.from('client_projects').select('id, title, client_email').order('created_at', { ascending: false });
    setProjects((data ?? []) as unknown as ProjectOption[]);
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects, reloadKey]);

  if (!isCloudConfigured()) {
    return (
      <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border text-center">
        <Database className="mx-auto mb-3 h-8 w-8 text-cyan-500/50" />
        <h4 className="text-sm font-bold text-white">Portal approvals & messages need Supabase</h4>
        <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
          Connect a Supabase project (and run supabase/schema.sql) to manage client approvals and threads.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ApprovalsSection projects={projects} onChanged={() => setReloadKey(k => k + 1)} />
      <MessagesSection projects={projects} />
    </div>
  );
};

export default HaritechPortalManager;