import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle, ArrowRight, CheckCircle2, ClipboardCheck, Database, FileText,
  LayoutDashboard, Lock, LogOut, Mail, MessageCircle, RefreshCw, Send, Wallet, XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSupabase, isCloudConfigured } from '../../utils/supabaseClient';
import { getWhatsAppUrl } from '../../utils/haritechContent';
import { naira, nairaShort } from '../../utils/haritechProperty';
import type { Session } from '@supabase/supabase-js';

const inputClass = 'w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white';

interface Milestone { title: string; done: boolean }
interface DocumentRow { name: string; status: string }
interface UpdateRow { date: string; text: string }

interface ClientProject {
  id: number;
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
}

const DOC_TONE: Record<string, string> = {
  Approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Shared: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  Draft: 'text-slate-400 bg-white/5 border-white/10',
  Pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

const statusTone = (status: string) =>
  status === 'Completed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  : status === 'On hold' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  : status === 'Cancelled' ? 'text-red-400 bg-red-500/10 border-red-500/20'
  : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';

const shortDay = (value: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ── Sign-in ──────────────────────────────────────────────────────────── */

const SignInForm: React.FC<{ onSignedIn: () => void }> = ({ onSignedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const sb = getSupabase();
    if (!sb) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }
    const { error: signInError } = await sb.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message || 'Sign in failed. Check your credentials.');
      return;
    }
    onSignedIn();
  };

  return (
    <div className="rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/5 to-transparent p-6 sm:p-8">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Client Sign In</h1>
          <p className="mt-2 text-sm text-slate-500">
            Access your projects, budgets, documents and approvals. Accounts are issued
            during onboarding — there is no public sign-up.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
              <Mail className="mr-1 inline h-3 w-3 text-cyan-400" /> Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
              <Lock className="mr-1 inline h-3 w-3 text-cyan-400" /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Your password"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-sm disabled:opacity-60">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          No account yet?{' '}
          <Link to="/haritech/contact" className="text-cyan-400 hover:text-cyan-300">Contact us during onboarding</Link>
        </p>
      </div>
    </div>
  );
};

/* ── Dashboard ────────────────────────────────────────────────────────── */

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4">
    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
      {icon} {label}
    </div>
    <div className="font-mono text-lg font-bold text-white">{value}</div>
  </div>
);

const ProjectCard: React.FC<{ project: ClientProject }> = ({ project }) => {
  const doneMilestones = project.milestones.filter(m => m.done).length;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/5 to-transparent p-4 sm:p-5"
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white">{project.title}</h3>
          <p className="text-[11px] text-slate-500">
            {project.category || 'Project'} · lead {project.owner || 'assigned manager'}
          </p>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusTone(project.status)}`}>{project.status}</span>
      </div>

      <div className="mb-1 flex items-center justify-between text-[10px]">
        <span className="text-slate-500">{project.phase}</span>
        <span className="font-mono text-slate-300">{project.progress}% complete{project.planned ? ` · planned ${project.planned}%` : ''}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${project.progress >= project.planned ? 'from-emerald-500 to-teal-500' : 'from-cyan-500 to-blue-500'}`}
          style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }}
        />
      </div>

      {project.summary && <p className="mt-3 text-xs leading-relaxed text-slate-400">{project.summary}</p>}

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
        <div><div className="text-slate-500">Next milestone</div><div className="truncate text-slate-300">{project.next_milestone || '—'}</div></div>
        <div><div className="text-slate-500">Target</div><div className="font-mono text-slate-300">{shortDay(project.target_date)}</div></div>
        <div><div className="text-slate-500">Budget</div><div className="font-mono text-slate-300">{project.budget_naira ? nairaShort(project.budget_naira) : '—'}</div></div>
        <div><div className="text-slate-500">Spent</div><div className="font-mono text-slate-300">{project.spent_naira ? nairaShort(project.spent_naira) : '—'}</div></div>
      </div>

      {project.milestones.length > 0 && (
        <div className="mt-3 border-t border-white/5 pt-3">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Milestones · {doneMilestones}/{project.milestones.length}
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {project.milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px]">
                {m.done
                  ? <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                  : <span className="h-3 w-3 shrink-0 rounded-full border border-slate-600" />}
                <span className={m.done ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-300'}>{m.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {project.documents.length > 0 && (
        <div className="mt-3 border-t border-white/5 pt-3">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Documents</div>
          <div className="space-y-1">
            {project.documents.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <FileText className="h-3 w-3 shrink-0 text-slate-500" />
                <span className="min-w-0 flex-1 truncate text-slate-300">{doc.name}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${DOC_TONE[doc.status] ?? DOC_TONE.Draft}`}>{doc.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {project.updates.length > 0 && (
        <div className="mt-3 border-t border-white/5 pt-3">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Latest updates</div>
          <div className="space-y-1.5">
            {project.updates.slice(0, 4).map((u, i) => (
              <div key={i} className="flex gap-2 text-[11px]">
                <span className="shrink-0 font-mono text-slate-600">{shortDay(u.date)}</span>
                <span className="text-slate-400">{u.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

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

const approvalTone = (status: ApprovalRow['status']) =>
  status === 'Approved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  : status === 'Declined' ? 'text-red-400 bg-red-500/10 border-red-500/20'
  : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

/* ── Approvals waiting on the client ────────────────────────────────── */

const ApprovalsPanel: React.FC = () => {
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) { setLoaded(true); return; }
    const { data, error: qError } = await sb
      .from('client_approvals')
      .select('*')
      .order('created_at', { ascending: false });
    if (qError) setError(qError.message || 'Could not load approvals.');
    else { setError(''); setRows((data ?? []) as unknown as ApprovalRow[]); }
    setLoaded(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  const respond = async (id: number, decision: 'Approved' | 'Declined') => {
    const sb = getSupabase();
    if (!sb) return;
    setBusyId(id);
    const { error: rpcError } = await sb.rpc('respond_to_approval', { p_id: id, p_decision: decision });
    if (rpcError) setError(rpcError.message || 'Could not save your response.');
    else setRows(prev => prev.map(r => (r.id === id ? { ...r, status: decision, responded_at: new Date().toISOString() } : r)));
    setBusyId(null);
  };

  const pending = rows.filter(r => r.status === 'Pending');
  const decided = rows.filter(r => r.status !== 'Pending');
  if (loaded && rows.length === 0) return null;

  const renderRow = (row: ApprovalRow) => (
    <div key={row.id} className="rounded-xl border border-white/5 bg-slate-950/40 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            <h4 className="text-xs font-bold text-white">{row.title}</h4>
          </div>
          {row.detail && <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{row.detail}</p>}
          <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-slate-500">
            <span>Requested {shortDay(row.created_at)}</span>
            {row.amount_naira > 0 && <span className="font-mono text-slate-300">{naira(row.amount_naira)}</span>}
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${approvalTone(row.status)}`}>{row.status}</span>
      </div>
      {row.status === 'Pending' && (
        <div className="mt-2.5 flex gap-2">
          <button
            onClick={() => respond(row.id, 'Approved')}
            disabled={busyId === row.id}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
          </button>
          <button
            onClick={() => respond(row.id, 'Declined')}
            disabled={busyId === row.id}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11px] font-bold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            <XCircle className="h-3.5 w-3.5" /> Decline
          </button>
        </div>
      )}
    </div>
  );

  return (
    <section className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/5 to-transparent p-4">
      <div className="mb-3 flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-bold text-white">Approvals</h3>
        {pending.length > 0 && (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
            {pending.length} waiting on you
          </span>
        )}
      </div>
      {error && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
        </div>
      )}
      {!loaded ? (
        <div className="flex justify-center py-6"><RefreshCw className="h-4 w-4 animate-spin text-amber-400" /></div>
      ) : (
        <div className="space-y-2">
          {pending.map(renderRow)}
          {decided.map(renderRow)}
        </div>
      )}
    </section>
  );
};

/* ── Message thread with the project team ────────────────────────────── */

const MessageThread: React.FC<{ email: string }> = ({ email }) => {
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) { setLoaded(true); return; }
    const { data, error: qError } = await sb
      .from('client_messages')
      .select('*')
      .order('created_at', { ascending: true });
    if (qError) setError(qError.message || 'Could not load messages.');
    else { setError(''); setRows((data ?? []) as unknown as MessageRow[]); }
    setLoaded(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    const sb = getSupabase();
    if (!sb || !body || sending) return;
    setSending(true);
    const { data, error: insError } = await sb
      .from('client_messages')
      .insert({ client_email: email, sender: 'client', body })
      .select('*');
    if (insError) {
      setError(insError.message || 'Could not send your message.');
    } else {
      setError('');
      setRows(prev => [...prev, ...((data ?? []) as unknown as MessageRow[])]);
      setDraft('');
    }
    setSending(false);
  };

  return (
    <section className="rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/5 to-transparent p-4">
      <div className="mb-3 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-white">Message your project team</h3>
      </div>
      {error && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
        </div>
      )}
      <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-white/5 bg-slate-950/40 p-3">
        {!loaded ? (
          <div className="flex justify-center py-4"><RefreshCw className="h-4 w-4 animate-spin text-cyan-400" /></div>
        ) : rows.length === 0 ? (
          <p className="py-3 text-center text-[11px] text-slate-600">
            No messages yet — start the conversation below.
          </p>
        ) : (
          rows.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                msg.sender === 'client'
                  ? 'rounded-br-sm bg-cyan-500/15 text-slate-200'
                  : 'rounded-bl-sm bg-white/5 text-slate-300'
              }`}>
                <div className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  {msg.sender === 'client' ? 'You' : 'Haritech'} · {shortDay(msg.created_at)}
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
          placeholder="Type a message for your project team..."
          className="flex-1 rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2.5 text-xs text-white outline-none transition-colors focus:border-cyan-500/50"
        />
        <button type="submit" disabled={sending || !draft.trim()} className="btn-secondary px-4 py-2.5 text-xs disabled:opacity-50">
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </section>
  );
};

const Dashboard: React.FC<{ session: Session; onSignOut: () => void }> = ({ session, onSignOut }) => {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }
    setLoading(true);
    setError('');
    const email = session.user.email?.toLowerCase() ?? '';
    const { data, error: qError } = await sb
      .from('client_projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (qError) {
      setError(qError.message || 'Could not load your projects.');
      setProjects([]);
    } else {
      // RLS already restricts rows to this account; filter again client-side as defence in depth.
      setProjects(((data ?? []) as unknown as ClientProject[])
        .filter(p => (p as unknown as { client_email?: string }).client_email?.toLowerCase() === email));
    }
    setLoading(false);
  }, [session.user.email]);

  useEffect(() => { load(); }, [load]);

  const active = projects.filter(p => p.status === 'Active').length;
  const budget = projects.reduce((sum, p) => sum + (p.budget_naira || 0), 0);
  const spent = projects.reduce((sum, p) => sum + (p.spent_naira || 0), 0);
  const docCount = projects.reduce((sum, p) => sum + p.documents.length, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            <LayoutDashboard className="h-3 w-3" /> Client Dashboard
          </div>
          <h1 className="text-2xl font-black text-white">Welcome back</h1>
          <p className="text-xs text-slate-500">{session.user.email}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="btn-secondary px-3 py-2 text-xs disabled:opacity-60">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={onSignOut} className="btn-secondary px-3 py-2 text-xs">
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<ClipboardCheck className="h-3 w-3" />} label="Active projects" value={String(active)} />
        <StatCard icon={<Wallet className="h-3 w-3" />} label="Total budget" value={budget ? nairaShort(budget) : '—'} />
        <StatCard icon={<ArrowRight className="h-3 w-3" />} label="Spent to date" value={spent ? nairaShort(spent) : '—'} />
        <StatCard icon={<FileText className="h-3 w-3" />} label="Documents" value={String(docCount)} />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <ApprovalsPanel />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-10 text-center">
          <Database className="mx-auto mb-3 h-8 w-8 text-slate-600" />
          <h3 className="text-sm font-bold text-white">No projects assigned yet</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
            Your project manager assigns projects to your account during onboarding. Once
            assigned, budgets, milestones, documents and approvals appear here instantly.
          </p>
          <a href={getWhatsAppUrl('Hello Haritech! I am signed in to the client portal but I do not see my projects yet.')} target="_blank" rel="noopener noreferrer" className="btn-secondary mx-auto mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs">
            <MessageCircle className="h-3.5 w-3.5 text-cyan-400" /> Message your project manager
          </a>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map(project => <ProjectCard key={project.id} project={project} />)}
        </div>
      )}

      <MessageThread email={session.user.email ?? ''} />
    </div>
  );
};

/* ── Page ─────────────────────────────────────────────────────────────── */

const ClientPortal: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isCloudConfigured()) { setLoading(false); return; }
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
  };

  if (!isCloudConfigured()) {
    return (
      <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-10 text-center">
        <Database className="mx-auto mb-4 h-10 w-10 text-cyan-500/50" />
        <h1 className="text-2xl font-black text-white">Portal Not Configured</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
          The client portal is locked until the site owner connects a Supabase project.
          If you are the owner, add your keys to the <code className="text-cyan-400">.env</code> file and redeploy.
        </p>
        <Link to="/haritech" className="btn-secondary mx-auto mt-6 inline-flex items-center gap-2 px-5 py-3 text-sm">
          <ArrowRight className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {session ? <Dashboard session={session} onSignOut={signOut} /> : <SignInForm onSignedIn={() => {}} />}
    </div>
  );
};

export default ClientPortal;