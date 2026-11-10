import React, { useMemo, useState } from 'react';
import { Edit, Plus, Search, Star, Trash2, X } from 'lucide-react';
import type { Testimonial } from '../../../utils/testimonials';
import {
  Badge,
  ConfirmDialog,
  EmptyState,
  Panel,
  StatTile,
  ToolbarButton,
  adminInput,
  cx,
} from './ui';

type SortKey = 'newest' | 'rating' | 'name';

const TestimonialsPanel: React.FC<{
  testimonials: Testimonial[];
  onAdd: () => void;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (id: number) => Promise<boolean>;
  notify: (type: 'success' | 'error', message: string) => void;
}> = ({ testimonials, onAdd, onEdit, onDelete, notify }) => {
  const [query, setQuery] = useState('');
  const [rating, setRating] = useState('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const average = testimonials.length
    ? testimonials.reduce((total, item) => total + (item.rating || 0), 0) / testimonials.length
    : 0;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return testimonials
      .filter((item) => {
        if (rating !== 'all' && String(item.rating) !== rating) return false;
        if (!needle) return true;
        return `${item.name} ${item.company} ${item.position} ${item.content}`
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => {
        if (sort === 'rating') return b.rating - a.rating;
        if (sort === 'name') return a.name.localeCompare(b.name);
        return b.id - a.id;
      });
  }, [testimonials, query, rating, sort]);

  const confirmItem = testimonials.find((item) => item.id === confirmId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Testimonials</h1>
          <p className="mt-1 text-xs text-slate-500">
            Real, approved client feedback only — the public site never shows invented reviews.
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-2 text-[11px] font-bold text-slate-950 transition-colors hover:bg-cyan-300"
        >
          <Plus className="h-3.5 w-3.5" /> New testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Published"
          value={testimonials.length}
          hint="Visible on the portfolio"
          icon={<Star className="h-4 w-4" />}
          accent="violet"
        />
        <StatTile
          label="Average rating"
          value={testimonials.length ? average.toFixed(1) : '—'}
          hint="Out of 5 stars"
          icon={<Star className="h-4 w-4" />}
          accent="amber"
        />
        <StatTile
          label="Five-star"
          value={testimonials.filter((item) => item.rating === 5).length}
          hint="Perfect client scores"
          icon={<Star className="h-4 w-4" />}
          accent="emerald"
        />
        <StatTile
          label="With photo"
          value={testimonials.filter((item) => Boolean(item.image)).length}
          hint="Profiles with a portrait"
          icon={<Star className="h-4 w-4" />}
          accent="cyan"
        />
      </div>

      <Panel>
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.05] p-3">
          <div className="relative min-w-[190px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search client, company or quote…"
              aria-label="Search testimonials"
              className={cx(adminInput, 'pl-9')}
            />
          </div>
          <select
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            aria-label="Filter by rating"
            className={cx(adminInput, 'w-auto min-w-[120px]')}
          >
            <option value="all" className="bg-[#080d18]">All ratings</option>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={String(value)} className="bg-[#080d18]">
                {value} star{value === 1 ? '' : 's'}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            aria-label="Sort testimonials"
            className={cx(adminInput, 'w-auto min-w-[130px]')}
          >
            <option value="newest" className="bg-[#080d18]">Newest first</option>
            <option value="rating" className="bg-[#080d18]">Highest rating</option>
            <option value="name" className="bg-[#080d18]">Name A–Z</option>
          </select>
          {(query || rating !== 'all' || sort !== 'newest') && (
            <ToolbarButton
              onClick={() => {
                setQuery('');
                setRating('all');
                setSort('newest');
              }}
            >
              <X className="h-3.5 w-3.5" /> Reset
            </ToolbarButton>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Star className="h-5 w-5" />}
            title={
              testimonials.length === 0 ? 'No testimonials published' : 'No testimonials match'
            }
            body={
              testimonials.length === 0
                ? 'Add a real client comment with their permission. The feedback section stays honest until then.'
                : 'Try a different search term or rating filter.'
            }
            action={
              testimonials.length === 0 ? (
                <button
                  type="button"
                  onClick={onAdd}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-2 text-[11px] font-bold text-slate-950 hover:bg-cyan-300"
                >
                  <Plus className="h-3.5 w-3.5" /> Add testimonial
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-2">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-white/[0.06] bg-white/[0.01] p-4 transition-colors hover:border-white/[0.12]"
              >
                <div className="flex items-start gap-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-10 w-10 shrink-0 rounded-full border border-white/10 object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-[12px] font-black text-slate-300">
                      {item.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-[12.5px] font-bold text-white">{item.name}</p>
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                        {Array.from({ length: item.rating }).map((_, index) => (
                          <span key={index}>★</span>
                        ))}
                      </span>
                    </div>
                    <p className="truncate text-[10px] text-slate-600">
                      {[item.position, item.company].filter(Boolean).join(' · ') || 'No company'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="rounded p-1.5 text-slate-500 hover:bg-white/5 hover:text-cyan-300"
                      aria-label={`Edit testimonial from ${item.name}`}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(item.id)}
                      className="rounded p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                      aria-label={`Delete testimonial from ${item.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-[11.5px] leading-relaxed text-slate-400">“{item.content}”</p>
                <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-2">
                  <Badge tone="emerald" dot>
                    Published
                  </Badge>
                  {item.image ? (
                    <span className="text-[9px] text-slate-600">Portrait attached</span>
                  ) : (
                    <span className="text-[9px] text-slate-600">No portrait</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="border-t border-white/[0.05] px-4 py-2.5 text-[10px] text-slate-600">
            Showing {filtered.length} of {testimonials.length}
          </div>
        )}
      </Panel>

      <ConfirmDialog
        open={confirmId !== null}
        title={`Delete “${confirmItem?.name ?? 'this testimonial'}”`}
        description="This removes the testimonial from the public site and the cloud copy. Export first if you need to keep the wording."
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          const id = confirmId;
          setConfirmId(null);
          if (id !== null) {
            void onDelete(id).then((deleted) => {
              if (deleted) notify('success', 'Testimonial deleted.');
            });
          }
        }}
      />
    </div>
  );
};

export default TestimonialsPanel;
