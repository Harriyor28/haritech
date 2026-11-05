import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Database,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from 'lucide-react';
import { getSupabase, isCloudConfigured } from '../../utils/supabaseClient';
import {
  CAC_STAGES,
  getCacEntityOption,
  isCacStage,
  type CacDocumentLink,
  type CacEntityType,
  type CacMember,
  type CacStage,
} from '../../utils/cac/cacTypes';
import { safeCacDocumentUrl } from '../../utils/cac/cacValidation';

const inputClass =
  'w-full px-3 py-2.5 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white placeholder:text-slate-600';
const labelClass = 'block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide';

interface CacApplicationRow {
  id: number;
  reference: string;
  entity_type: CacEntityType;
  proposed_names: string[];
  nature_of_business: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  applicant_address: string;
  business_address: string;
  members: CacMember[];
  documents_have: string[];
  notes: string;
  stage: CacStage;
  stage_note: string;
  documents: CacDocumentLink[];
  created_at: string;
  updated_at: string;
}

interface EditForm {
  stage: CacStage;
  stageNote: string;
  documents: CacDocumentLink[];
}

const stageBadgeClass = (stage: CacStage): string => {
  if (stage === 'query') return 'bg-red-500/10 text-red-400 border-red-500/20';
  if (stage === 'certificate_ready' || stage === 'approved') {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  }
  if (stage === 'closed') return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
};

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
};

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => String(item ?? '')).filter(Boolean) : [];

const asMembers = (value: unknown): CacMember[] =>
  Array.isArray(value)
    ? value
        .map((item) => item as { name?: unknown; role?: unknown } | null)
        .map((item) => ({ name: String(item?.name ?? ''), role: String(item?.role ?? '') }))
        .filter((item) => item.name.length > 0)
    : [];

const asDocuments = (value: unknown): CacDocumentLink[] =>
  Array.isArray(value)
    ? value
        .map((item) => item as { name?: unknown; url?: unknown } | null)
        .map((item) => ({ name: String(item?.name ?? ''), url: String(item?.url ?? '') }))
        .filter((item) => item.name.length > 0)
    : [];

const HaritechCacApplicationsManager: React.FC = () => {
  const [rows, setRows] = useState<CacApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<EditForm>({ stage: 'submitted', stageNote: '', documents: [] });

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const { data, error: queryError } = await sb
      .from('cac_applications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300);

    if (queryError) {
      setError(
        queryError.message.includes('permission')
          ? 'Sign in with the admin account to read CAC applications.'
          : queryError.message,
      );
      setRows([]);
    } else {
      setRows(
        (data ?? []).map((row) => ({
          ...(row as CacApplicationRow),
          entity_type: (row.entity_type as CacEntityType) ?? 'business_name',
          proposed_names: asStringArray(row.proposed_names),
          members: asMembers(row.members),
          documents_have: asStringArray(row.documents_have),
          documents: asDocuments(row.documents),
          stage: isCacStage(row.stage) ? row.stage : 'submitted',
        })),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      [
        row.reference,
        row.applicant_name,
        row.applicant_email,
        row.applicant_phone,
        row.entity_type,
        ...row.proposed_names,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [rows, search]);

  const openRow = (row: CacApplicationRow) => {
    if (editingId === row.id) {
      setEditingId(null);
      return;
    }
    setEditingId(row.id);
    setForm({
      stage: row.stage,
      stageNote: row.stage_note ?? '',
      documents: row.documents.length > 0 ? row.documents.map((doc) => ({ ...doc })) : [],
    });
    setSaved(false);
    setError('');
  };

  const updateDocument = (index: number, patch: Partial<CacDocumentLink>) => {
    setForm((previous) => ({
      ...previous,
      documents: previous.documents.map((doc, docIndex) =>
        docIndex === index ? { ...doc, ...patch } : doc,
      ),
    }));
  };

  const save = async () => {
    const sb = getSupabase();
    if (!sb || editingId === null) return;

    const documents = form.documents
      .map((doc) => ({ name: doc.name.trim(), url: doc.url.trim() }))
      .filter((doc) => doc.name.length > 0);

    const invalid = documents.find((doc) => !safeCacDocumentUrl(doc.url));
    if (invalid) {
      setError(`Document "${invalid.name}" needs an http(s) link or a site-relative path.`);
      return;
    }

    setBusy(true);
    setError('');
    setSaved(false);
    const { error: updateError } = await sb
      .from('cac_applications')
      .update({
        stage: form.stage,
        stage_note: form.stageNote.trim(),
        documents,
      })
      .eq('id', editingId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      setRows((previous) =>
        previous.map((row) =>
          row.id === editingId
            ? { ...row, stage: form.stage, stage_note: form.stageNote.trim(), documents }
            : row,
        ),
      );
      window.setTimeout(() => setSaved(false), 3000);
    }
    setBusy(false);
  };

  const remove = async (row: CacApplicationRow) => {
    if (!window.confirm(`Delete application ${row.reference}? This cannot be undone.`)) return;
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    setError('');
    const { error: deleteError } = await sb.from('cac_applications').delete().eq('id', row.id);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      setRows((previous) => previous.filter((item) => item.id !== row.id));
      if (editingId === row.id) setEditingId(null);
    }
    setBusy(false);
  };

  if (!isCloudConfigured()) {
    return (
      <div className="card p-6 bg-[#0e1326]/80 border-white/5">
        <div className="flex items-start gap-3 text-amber-300">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold text-white mb-1">Cloud database not configured</h3>
            <p className="text-sm text-slate-400">
              Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to manage CAC applications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" /> CAC Applications
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Advance the handling stage, add a note, and publish documents for the applicant.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 text-sm text-slate-300 hover:text-white hover:border-white/10 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="border border-red-500/30 bg-red-500/10 text-red-300 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}
      {saved && (
        <div className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> Application updated. The applicant sees the new stage
          and documents when they track it.
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          className={`${inputClass} pl-10`}
          placeholder="Search by reference, name, email, phone or proposed name…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-8">
          <RefreshCw className="h-4 w-4 animate-spin" /> Loading applications…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 bg-[#0e1326]/80 border-white/5 text-center">
          <p className="text-slate-400 text-sm">
            {rows.length === 0
              ? 'No applications yet. Submissions from the CAC page appear here.'
              : 'No application matches that search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((row) => {
            const entity = getCacEntityOption(row.entity_type);
            const open = editingId === row.id;
            return (
              <div key={row.id} className="card bg-[#0e1326]/80 border-white/5 overflow-hidden">
                <button
                  type="button"
                  onClick={() => openRow(row)}
                  aria-expanded={open}
                  className="w-full text-left p-4 flex flex-wrap items-center gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="font-mono text-xs text-cyan-400">{row.reference}</code>
                      <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full border ${stageBadgeClass(row.stage)}`}>
                        {CAC_STAGES.find((stage) => stage.id === row.stage)?.label ?? row.stage}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white mt-1 truncate">{row.applicant_name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {entity.label} · {row.proposed_names.join(' · ')}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500 hidden sm:block">
                    <p>{row.applicant_phone}</p>
                    <p>{formatDate(row.created_at)}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                  <div className="border-t border-white/5 p-4 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="bg-slate-950/40 rounded-xl border border-white/5 p-3">
                        <p className={labelClass}>Applicant</p>
                        <p className="text-white">{row.applicant_name}</p>
                        <p className="text-slate-400 text-xs mt-1">{row.applicant_email}</p>
                        <p className="text-slate-400 text-xs">{row.applicant_phone}</p>
                        <p className="text-slate-400 text-xs mt-2">{row.applicant_address}</p>
                      </div>
                      <div className="bg-slate-950/40 rounded-xl border border-white/5 p-3">
                        <p className={labelClass}>Business</p>
                        <p className="text-white">{entity.label}</p>
                        <p className="text-slate-400 text-xs mt-1">{row.proposed_names.join(' · ')}</p>
                        <p className="text-slate-400 text-xs mt-2">{row.nature_of_business}</p>
                        <p className="text-slate-400 text-xs mt-2">{row.business_address}</p>
                      </div>
                      {row.members.length > 0 && (
                        <div className="bg-slate-950/40 rounded-xl border border-white/5 p-3">
                          <p className={labelClass}>{entity.memberLabel}s</p>
                          <ul className="space-y-1">
                            {row.members.map((member, index) => (
                              <li key={`${member.name}-${index}`} className="text-xs text-slate-300">
                                {member.name}
                                {member.role && <span className="text-slate-500"> — {member.role}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="bg-slate-950/40 rounded-xl border border-white/5 p-3">
                        <p className={labelClass}>Documents the applicant has</p>
                        {row.documents_have.length === 0 ? (
                          <p className="text-xs text-slate-500">None ticked yet.</p>
                        ) : (
                          <ul className="space-y-1">
                            {row.documents_have.map((doc) => (
                              <li key={doc} className="text-xs text-slate-300">• {doc}</li>
                            ))}
                          </ul>
                        )}
                        {row.notes && (
                          <>
                            <p className={`${labelClass} mt-3`}>Applicant notes</p>
                            <p className="text-xs text-slate-300 whitespace-pre-wrap">{row.notes}</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass} htmlFor={`stage-${row.id}`}>Handling stage</label>
                        <select
                          id={`stage-${row.id}`}
                          className={inputClass}
                          value={form.stage}
                          onChange={(event) =>
                            setForm((previous) => ({
                              ...previous,
                              stage: isCacStage(event.target.value) ? event.target.value : 'submitted',
                            }))
                          }
                        >
                          {CAC_STAGES.map((stage) => (
                            <option key={stage.id} value={stage.id}>{stage.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass} htmlFor={`note-${row.id}`}>Note for the applicant</label>
                        <textarea
                          id={`note-${row.id}`}
                          rows={2}
                          className={`${inputClass} resize-none`}
                          placeholder="What is happening, or what do you need from them?"
                          value={form.stageNote}
                          onChange={(event) =>
                            setForm((previous) => ({ ...previous, stageNote: event.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className={labelClass}>Published documents</p>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((previous) => ({
                              ...previous,
                              documents: [...previous.documents, { name: '', url: '' }],
                            }))
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20 text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all"
                        >
                          <Plus className="h-3 w-3" /> Add document
                        </button>
                      </div>
                      {form.documents.length === 0 ? (
                        <p className="text-xs text-slate-500">No documents published yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {form.documents.map((doc, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_auto] gap-2 items-center">
                              <input
                                className={inputClass}
                                placeholder="Document name"
                                value={doc.name}
                                onChange={(event) => updateDocument(index, { name: event.target.value })}
                              />
                              <input
                                className={inputClass}
                                placeholder="https://… or /uploads/file.pdf"
                                value={doc.url}
                                onChange={(event) => updateDocument(index, { url: event.target.value })}
                              />
                              <button
                                type="button"
                                aria-label={`Remove document ${index + 1}`}
                                onClick={() =>
                                  setForm((previous) => ({
                                    ...previous,
                                    documents: previous.documents.filter((_, docIndex) => docIndex !== index),
                                  }))
                                }
                                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-[11px] text-slate-500 mt-2">
                        Links must be http(s) or a site-relative path. Applicants only see these after
                        you save.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => void save()}
                          disabled={busy}
                          className="flex items-center gap-2 btn-primary px-5 py-2.5 rounded-xl text-sm disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" /> {busy ? 'Saving…' : 'Save changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(row)}
                          disabled={busy}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Created {formatDate(row.created_at)} · Updated {formatDate(row.updated_at)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HaritechCacApplicationsManager;
