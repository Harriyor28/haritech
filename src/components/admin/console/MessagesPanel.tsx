import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  Inbox,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type { ContactMessageRow } from './useAdminData';
import { formatDateTime, formatRelative, statusCounts } from './insights';
import {
  Badge,
  ConfirmDialog,
  EmptyState,
  Panel,
  Segmented,
  ToolbarButton,
  adminInput,
  cx,
} from './ui';

type SortKey = 'newest' | 'oldest';

const statusTone: Record<string, 'neutral' | 'amber' | 'emerald' | 'red'> = {
  new: 'neutral',
  in_progress: 'amber',
  resolved: 'emerald',
  spam: 'red',
};

const statusLabel = (status: string): string =>
  status === 'in_progress' ? 'In progress' : status.charAt(0).toUpperCase() + status.slice(1);

const csvCell = (value: unknown): string => `"${String(value ?? '').replace(/"/g, '""')}"`;

const MessageDetail: React.FC<{
  message: ContactMessageRow;
  onClose?: () => void;
  onStatus: (status: string) => void;
  onDelete: () => void;
}> = ({ message, onClose, onStatus, onDelete }) => {
  const status = message.status ?? 'new';
  const notification = message.notification_status ?? 'pending';
  const phoneDigits = (message.phone ?? '').replace(/\D/g, '');

  return (
    <div>
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.05] p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={message.form === 'quote' ? 'violet' : 'cyan'}>
              {message.form === 'quote' ? 'Quote request' : 'Contact'}
            </Badge>
            <Badge tone={statusTone[status] ?? 'neutral'} dot>
              {statusLabel(status)}
            </Badge>
            {notification === 'failed' && <Badge tone="red">Email failed</Badge>}
          </div>
          <h2 className="mt-2 truncate text-sm font-bold text-white">
            {message.subject || 'No subject'}
          </h2>
          <p className="mt-0.5 text-[10px] text-slate-600">{formatDateTime(message.created_at)}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close message"
            className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div>
          <p className="text-[13px] font-bold text-white">{message.name || 'Anonymous'}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px]">
            {message.email && (
              <a
                href={`mailto:${message.email}`}
                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
              >
                <Mail className="h-3 w-3" /> {message.email}
              </a>
            )}
            {message.phone && (
              <a
                href={`tel:${message.phone}`}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
              >
                <Phone className="h-3 w-3" /> {message.phone}
              </a>
            )}
            {phoneDigits.length >= 8 && (
              <a
                href={`https://wa.me/${phoneDigits}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10.5px]">
          {[
            { label: 'Budget', value: message.budget },
            { label: 'Timeline', value: message.timeline },
            { label: 'Category', value: message.category },
            { label: 'Preferred contact', value: message.contact_method },
            { label: 'Source page', value: message.source_page },
            { label: 'Marketing consent', value: message.consent_marketing ? 'Given' : 'Not given' },
          ]
            .filter((row) => Boolean(row.value))
            .map((row) => (
              <div key={row.label} className="rounded-md border border-white/[0.05] bg-white/[0.02] px-2.5 py-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600">
                  {row.label}
                </p>
                <p className="mt-0.5 truncate text-slate-300" title={String(row.value)}>
                  {row.value}
                </p>
              </div>
            ))}
        </div>

        <div className="rounded-lg border border-white/[0.05] bg-[#060a14] p-3">
          <p className="whitespace-pre-line text-[11.5px] leading-relaxed text-slate-300">
            {message.message || 'No message body.'}
          </p>
        </div>

        {notification === 'failed' && message.notification_error && (
          <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-[10px] leading-relaxed text-red-300">
            <p className="mb-1 font-bold">Delivery error</p>
            <p className="font-mono">{message.notification_error}</p>
          </div>
        )}

        <div>
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
            Update status
          </p>
          <Segmented
            ariaLabel="Enquiry status"
            value={status}
            onChange={onStatus}
            options={[
              { value: 'new', label: 'New' },
              { value: 'in_progress', label: 'In progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'spam', label: 'Spam' },
            ]}
          />
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.05] pt-3">
          <span className="text-[10px] text-slate-600">
            Delivery: {notification.replace(/_/g, ' ')}
          </span>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1 rounded-md border border-red-400/20 bg-red-400/5 px-2.5 py-1.5 text-[10px] font-bold text-red-300 hover:bg-red-400/10"
          >
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const MessagesPanel: React.FC<{
  messages: ContactMessageRow[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onUpdateStatus: (ids: number[], status: string) => Promise<string | null>;
  onDelete: (ids: number[]) => Promise<string | null>;
  notify: (type: 'success' | 'error', message: string) => void;
}> = ({ messages, loading, error, onRefresh, onUpdateStatus, onDelete, notify }) => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [failedOnly, setFailedOnly] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [confirmIds, setConfirmIds] = useState<number[]>([]);

  const counts = useMemo(() => statusCounts(messages), [messages]);
  const failedCount = messages.filter((message) => message.notification_status === 'failed').length;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return messages
      .filter((message) => {
        if (statusFilter !== 'all' && (message.status ?? 'new') !== statusFilter) return false;
        if (failedOnly && message.notification_status !== 'failed') return false;
        if (!needle) return true;
        return [
          message.name,
          message.email,
          message.phone,
          message.subject,
          message.category,
          message.message,
          message.budget,
          message.timeline,
        ].some((value) => String(value ?? '').toLowerCase().includes(needle));
      })
      .sort((a, b) => {
        const first = new Date(a.created_at ?? 0).getTime();
        const second = new Date(b.created_at ?? 0).getTime();
        return sort === 'newest' ? second - first : first - second;
      });
  }, [messages, query, statusFilter, sort, failedOnly]);

  const active = messages.find((message) => message.id === activeId) ?? null;
  const confirmCount = confirmIds.length;

  const toggleSelected = (id: number) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const update = async (ids: number[], status: string) => {
    const failure = await onUpdateStatus(ids, status);
    if (failure) {
      notify('error', failure);
      return;
    }
    notify('success', `${ids.length} ${ids.length === 1 ? 'enquiry' : 'enquiries'} marked ${statusLabel(status).toLowerCase()}.`);
    setSelected([]);
  };

  const remove = async () => {
    const ids = confirmIds;
    setConfirmIds([]);
    const failure = await onDelete(ids);
    if (failure) {
      notify('error', failure);
      return;
    }
    if (activeId && ids.includes(activeId)) setActiveId(null);
    setSelected((current) => current.filter((id) => !ids.includes(id)));
    notify('success', `${ids.length} ${ids.length === 1 ? 'enquiry' : 'enquiries'} deleted.`);
  };

  const exportCsv = () => {
    if (filtered.length === 0) {
      notify('error', 'Nothing to export with the current filters.');
      return;
    }
    const head = [
      'id',
      'form',
      'category',
      'name',
      'email',
      'phone',
      'subject',
      'budget',
      'timeline',
      'contact_method',
      'consent_marketing',
      'source_page',
      'status',
      'notification_status',
      'created_at',
      'message',
    ];
    const rows = filtered.map((message) =>
      [
        message.id,
        message.form,
        message.category ?? '',
        message.name,
        message.email,
        message.phone,
        message.subject,
        message.budget,
        message.timeline,
        message.contact_method,
        message.consent_marketing ? 'yes' : 'no',
        message.source_page ?? '',
        message.status ?? 'new',
        message.notification_status ?? 'pending',
        message.created_at ? new Date(message.created_at).toISOString() : '',
        message.message,
      ]
        .map(csvCell)
        .join(',')
    );
    const blob = new Blob([[head.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `haritech-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    notify('success', `${filtered.length} enquiries exported.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Inbox</h1>
          <p className="mt-1 text-xs text-slate-500">
            {messages.length} stored · {counts.new ?? 0} new · {failedCount} delivery{' '}
            {failedCount === 1 ? 'failure' : 'failures'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarButton onClick={exportCsv}>
            <Download className="h-3.5 w-3.5" /> Export
          </ToolbarButton>
          <ToolbarButton onClick={onRefresh} disabled={loading}>
            <RefreshCw className={cx('h-3.5 w-3.5', loading && 'animate-spin')} />
            {loading ? 'Loading' : 'Refresh'}
          </ToolbarButton>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-[11px] leading-relaxed text-amber-200/90">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-3">
          <Panel>
            <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.05] p-3">
              <div className="relative min-w-[180px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, email, subject, message…"
                  aria-label="Search enquiries"
                  className={cx(adminInput, 'pl-9')}
                />
              </div>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                aria-label="Sort enquiries"
                className={cx(adminInput, 'w-auto min-w-[125px]')}
              >
                <option value="newest" className="bg-[#080d18]">Newest first</option>
                <option value="oldest" className="bg-[#080d18]">Oldest first</option>
              </select>
              <ToolbarButton
                active={failedOnly}
                onClick={() => setFailedOnly((current) => !current)}
                title="Only show enquiries whose notification email failed"
              >
                Failed only
              </ToolbarButton>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.05] px-3 py-2">
              <Segmented
                ariaLabel="Filter enquiries by status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All', count: counts.all ?? 0 },
                  { value: 'new', label: 'New', count: counts.new ?? 0 },
                  { value: 'in_progress', label: 'In progress', count: counts.in_progress ?? 0 },
                  { value: 'resolved', label: 'Resolved', count: counts.resolved ?? 0 },
                  { value: 'spam', label: 'Spam', count: counts.spam ?? 0 },
                ]}
              />
            </div>

            {selected.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-b border-cyan-400/15 bg-cyan-400/[0.04] px-3 py-2.5">
                <span className="text-[11px] font-bold text-cyan-300">{selected.length} selected</span>
                <button
                  type="button"
                  onClick={() => void update(selected, 'resolved')}
                  className="rounded-md border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-400/20"
                >
                  Mark resolved
                </button>
                <button
                  type="button"
                  onClick={() => void update(selected, 'spam')}
                  className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-bold text-slate-300 hover:bg-white/[0.06]"
                >
                  Mark spam
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmIds(selected)}
                  className="rounded-md border border-red-400/25 bg-red-400/10 px-2 py-1 text-[10px] font-bold text-red-300 hover:bg-red-400/20"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className="ml-auto rounded-md p-1 text-slate-500 hover:text-white"
                  aria-label="Clear selection"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {loading && messages.length === 0 ? (
              <div className="space-y-2 p-4">
                {[0, 1, 2, 3].map((row) => (
                  <div key={row} className="h-14 animate-pulse rounded-lg bg-white/[0.03]" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Inbox className="h-5 w-5" />}
                title={messages.length === 0 ? 'Inbox is empty' : 'No enquiries match those filters'}
                body={
                  messages.length === 0
                    ? 'Submissions from the contact and quote forms will appear here as they arrive.'
                    : 'Try clearing the search, status filter or failed-delivery toggle.'
                }
                action={
                  messages.length > 0 ? (
                    <ToolbarButton
                      onClick={() => {
                        setQuery('');
                        setStatusFilter('all');
                        setFailedOnly(false);
                      }}
                    >
                      <X className="h-3.5 w-3.5" /> Clear filters
                    </ToolbarButton>
                  ) : undefined
                }
              />
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {filtered.map((message) => {
                  const status = message.status ?? 'new';
                  const checked = selected.includes(message.id);
                  const isActive = activeId === message.id;
                  return (
                    <div
                      key={message.id}
                      className={cx(
                        'flex items-start gap-3 px-3 py-3 transition-colors',
                        isActive ? 'bg-cyan-400/[0.05]' : 'hover:bg-white/[0.02]'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelected(message.id)}
                        aria-label={`Select enquiry from ${message.name || 'anonymous'}`}
                        className="mt-1.5 h-3.5 w-3.5 shrink-0 accent-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => setActiveId(message.id)}
                        className="flex min-w-0 flex-1 items-start gap-3 text-left"
                      >
                        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[10px] font-black text-slate-400">
                          {(message.name || 'A').charAt(0).toUpperCase()}
                          {status === 'new' && (
                            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-[#080d18] bg-cyan-400" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span className={cx('truncate text-[12px] font-bold', status === 'new' ? 'text-white' : 'text-slate-300')}>
                              {message.name || 'Anonymous'}
                            </span>
                            <Badge tone={message.form === 'quote' ? 'violet' : 'cyan'}>
                              {message.form === 'quote' ? 'quote' : 'contact'}
                            </Badge>
                            <Badge tone={statusTone[status] ?? 'neutral'}>{statusLabel(status)}</Badge>
                            {message.notification_status === 'failed' && <Badge tone="red">failed</Badge>}
                          </span>
                          <span className={cx('mt-0.5 block truncate text-[11px]', status === 'new' ? 'text-slate-400' : 'text-slate-600')}>
                            {message.subject || message.message || 'No subject'}
                          </span>
                          <span className="mt-0.5 block truncate text-[10px] text-slate-700">
                            {message.email}
                            {message.category ? ` · ${message.category}` : ''}
                            {message.budget ? ` · ${message.budget}` : ''}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-[10px] text-slate-600">
                            {formatRelative(message.created_at)}
                          </span>
                          <ChevronRight className="mt-1 ml-auto h-3.5 w-3.5 text-slate-700" />
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {filtered.length > 0 && (
              <div className="flex items-center justify-between border-t border-white/[0.05] px-4 py-2.5 text-[10px] text-slate-600">
                <span>
                  Showing {filtered.length} of {messages.length}
                </span>
                <span>Click any enquiry to read it</span>
              </div>
            )}
          </Panel>
        </div>

        <div className="hidden xl:block">
          <div className="sticky top-[88px]">
            <Panel>
              {active ? (
                <MessageDetail
                  message={active}
                  onStatus={(status) => void update([active.id], status)}
                  onDelete={() => setConfirmIds([active.id])}
                />
              ) : (
                <EmptyState
                  icon={<Mail className="h-5 w-5" />}
                  title="Select an enquiry"
                  body="Open any row to read the full message, update its status or reply from your mail app."
                />
              )}
            </Panel>
          </div>
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-[65] overflow-y-auto bg-[#050810] xl:hidden">
          <MessageDetail
            message={active}
            onClose={() => setActiveId(null)}
            onStatus={(status) => void update([active.id], status)}
            onDelete={() => setConfirmIds([active.id])}
          />
        </div>
      )}

      <ConfirmDialog
        open={confirmCount > 0}
        title={confirmCount === 1 ? 'Delete this enquiry?' : `Delete ${confirmCount} enquiries?`}
        description="Deleted enquiries are removed from Supabase for good. Export a CSV first if you need a record."
        confirmLabel="Delete"
        onCancel={() => setConfirmIds([])}
        onConfirm={() => void remove()}
      />

      <div className="flex items-center gap-2 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.03] px-3 py-2 text-[10px] text-slate-500">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400/70" />
        Status changes are written straight to your database — visitors never see these fields.
      </div>
    </div>
  );
};

export default MessagesPanel;
