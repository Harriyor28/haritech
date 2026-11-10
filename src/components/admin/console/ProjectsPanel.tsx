import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  Filter,
  FolderOpen,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type { ProjectData } from '../../../utils/projects';
import { ConfirmDialog, EmptyState, Panel, ToolbarButton, adminInput, cx } from './ui';

type SortKey = 'newest' | 'oldest' | 'title' | 'year';
type ViewMode = 'table' | 'grid';

const VIEW_KEY = 'haritech-admin-project-view';

const readViewMode = (): ViewMode => {
  if (typeof window === 'undefined') return 'table';
  return window.localStorage.getItem(VIEW_KEY) === 'grid' ? 'grid' : 'table';
};

const projectTags = (project: ProjectData): string[] => [...project.tags, ...project.technology];

const csvCell = (value: unknown): string => `"${String(value ?? '').replace(/"/g, '""')}"`;

const ProjectsPanel: React.FC<{
  projects: ProjectData[];
  onAdd: () => void;
  onEdit: (project: ProjectData) => void;
  onDelete: (ids: number[]) => Promise<void>;
  notify: (type: 'success' | 'error', message: string) => void;
}> = ({ projects, onAdd, onEdit, onDelete, notify }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [year, setYear] = useState('All');
  const [sort, setSort] = useState<SortKey>('newest');
  const [view, setView] = useState<ViewMode>(readViewMode);
  const [advanced, setAdvanced] = useState(false);
  const [tagQuery, setTagQuery] = useState('');
  const [missingImageOnly, setMissingImageOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<number[]>([]);
  const [confirmIds, setConfirmIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* preference is a nicety, not a requirement */
    }
  }, [view]);

  const categories = useMemo(
    () => ['All', ...[...new Set(projects.map((project) => project.category))].sort()],
    [projects]
  );
  const years = useMemo(
    () => ['All', ...[...new Set(projects.map((project) => project.year).filter(Boolean))].sort().reverse()],
    [projects]
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const tagNeedle = tagQuery.trim().toLowerCase();
    const rows = projects.filter((project) => {
      if (category !== 'All' && project.category !== category) return false;
      if (year !== 'All' && project.year !== year) return false;
      if (missingImageOnly && project.image) return false;
      if (tagNeedle && !projectTags(project).join(' ').toLowerCase().includes(tagNeedle)) return false;
      if (!needle) return true;
      return `${project.title} ${project.description} ${project.category} ${projectTags(project).join(' ')}`
        .toLowerCase()
        .includes(needle);
    });

    return rows.sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      if (sort === 'year') return String(b.year).localeCompare(String(a.year));
      if (sort === 'oldest') return a.id - b.id;
      return b.id - a.id;
    });
  }, [projects, query, category, year, sort, tagQuery, missingImageOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, category, year, sort, tagQuery, missingImageOnly, pageSize]);

  useEffect(() => {
    setSelected((current) => current.filter((id) => projects.some((project) => project.id === id)));
  }, [projects]);

  const allOnPageSelected =
    pageRows.length > 0 && pageRows.every((project) => selected.includes(project.id));

  const toggleSelect = (id: number) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const togglePage = () => {
    if (allOnPageSelected) {
      const ids = new Set(pageRows.map((project) => project.id));
      setSelected((current) => current.filter((id) => !ids.has(id)));
    } else {
      setSelected((current) => [...new Set([...current, ...pageRows.map((project) => project.id)])]);
    }
  };

  const exportRows = (rows: ProjectData[], filename: string) => {
    if (rows.length === 0) {
      notify('error', 'Nothing to export with the current filters.');
      return;
    }
    const head = ['id', 'title', 'category', 'year', 'technologies', 'tags', 'live_demo', 'description'];
    const body = rows.map((project) =>
      [
        project.id,
        project.title,
        project.category,
        project.year,
        project.technology.join(' | '),
        project.tags.join(' | '),
        project.liveDemo,
        project.description,
      ]
        .map(csvCell)
        .join(',')
    );
    const blob = new Blob([[head.join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    notify('success', `${rows.length} ${rows.length === 1 ? 'project' : 'projects'} exported.`);
  };

  const handleDelete = async () => {
    const ids = confirmIds;
    setConfirmIds([]);
    await onDelete(ids);
    setSelected((current) => current.filter((id) => !ids.includes(id)));
  };

  const confirmProjects = projects.filter((project) => confirmIds.includes(project.id));
  const activeFilters =
    (category !== 'All' ? 1 : 0) +
    (year !== 'All' ? 1 : 0) +
    (tagQuery ? 1 : 0) +
    (missingImageOnly ? 1 : 0);

  const resetFilters = () => {
    setQuery('');
    setCategory('All');
    setYear('All');
    setTagQuery('');
    setMissingImageOnly(false);
    setSort('newest');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Projects</h1>
          <p className="mt-1 text-xs text-slate-500">
            {projects.length} published · {filtered.length} matching your filters ·{' '}
            {categories.length - 1} {categories.length - 1 === 1 ? 'category' : 'categories'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarButton
            onClick={() => exportRows(filtered, `haritech-projects-${new Date().toISOString().slice(0, 10)}.csv`)}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </ToolbarButton>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-2 text-[11px] font-bold text-slate-950 transition-colors hover:bg-cyan-300"
          >
            <Plus className="h-3.5 w-3.5" /> New project
          </button>
        </div>
      </div>

      <Panel>
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.05] p-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, description, technology…"
              aria-label="Search projects"
              className={cx(adminInput, 'pl-9')}
            />
          </div>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
            className={cx(adminInput, 'w-auto min-w-[130px]')}
          >
            {categories.map((option) => (
              <option key={option} value={option} className="bg-[#080d18]">
                {option === 'All' ? 'All categories' : option}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(event) => setYear(event.target.value)}
            aria-label="Filter by year"
            className={cx(adminInput, 'w-auto min-w-[110px]')}
          >
            {years.map((option) => (
              <option key={option} value={option} className="bg-[#080d18]">
                {option === 'All' ? 'All years' : option}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            aria-label="Sort projects"
            className={cx(adminInput, 'w-auto min-w-[125px]')}
          >
            <option value="newest" className="bg-[#080d18]">Newest first</option>
            <option value="oldest" className="bg-[#080d18]">Oldest first</option>
            <option value="title" className="bg-[#080d18]">Title A–Z</option>
            <option value="year" className="bg-[#080d18]">Year (newest)</option>
          </select>
          <ToolbarButton
            onClick={() => setAdvanced((current) => !current)}
            active={advanced || activeFilters > 0}
            title="Advanced filters"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {activeFilters > 0 && (
              <span className="rounded bg-cyan-400/20 px-1 text-[9px] tabular-nums text-cyan-300">
                {activeFilters}
              </span>
            )}
          </ToolbarButton>
          <div className="flex items-center gap-1 rounded-lg border border-white/[0.07] p-1">
            <button
              type="button"
              onClick={() => setView('table')}
              aria-pressed={view === 'table'}
              aria-label="Table view"
              title="Table view"
              className={cx(
                'rounded-md p-1.5 transition-colors',
                view === 'table' ? 'bg-white/[0.09] text-white' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-pressed={view === 'grid'}
              aria-label="Grid view"
              title="Grid view"
              className={cx(
                'rounded-md p-1.5 transition-colors',
                view === 'grid' ? 'bg-white/[0.09] text-white' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {advanced && (
          <div className="flex flex-wrap items-end gap-3 border-b border-white/[0.05] bg-white/[0.01] p-3">
            <div className="min-w-[190px] flex-1">
              <label htmlFor="project-tag-filter" className="mb-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
                Tag or technology
              </label>
              <input
                id="project-tag-filter"
                value={tagQuery}
                onChange={(event) => setTagQuery(event.target.value)}
                placeholder="e.g. React, booking, SEO"
                className={adminInput}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/[0.07] px-3 py-2.5 text-[11px] font-semibold text-slate-400">
              <input
                type="checkbox"
                checked={missingImageOnly}
                onChange={(event) => setMissingImageOnly(event.target.checked)}
                className="h-3.5 w-3.5 accent-cyan-400"
              />
              Missing artwork only
            </label>
            <ToolbarButton onClick={resetFilters}>
              <X className="h-3.5 w-3.5" /> Reset filters
            </ToolbarButton>
          </div>
        )}

        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-cyan-400/15 bg-cyan-400/[0.04] px-3 py-2.5">
            <span className="text-[11px] font-bold text-cyan-300">
              {selected.length} selected
            </span>
            <button
              type="button"
              onClick={() =>
                exportRows(
                  projects.filter((project) => selected.includes(project.id)),
                  `haritech-projects-selection-${new Date().toISOString().slice(0, 10)}.csv`
                )
              }
              className="rounded-md border border-white/[0.08] px-2 py-1 text-[10px] font-bold text-slate-300 hover:bg-white/5"
            >
              Export selection
            </button>
            <button
              type="button"
              onClick={() => setConfirmIds(selected)}
              className="rounded-md border border-red-400/25 bg-red-400/10 px-2 py-1 text-[10px] font-bold text-red-300 hover:bg-red-400/20"
            >
              Delete selection
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

        {filtered.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="h-5 w-5" />}
            title={projects.length === 0 ? 'No projects yet' : 'No projects match those filters'}
            body={
              projects.length === 0
                ? 'Publish your first case study to start filling the public portfolio.'
                : 'Try clearing the search, category, year or tag filters.'
            }
            action={
              projects.length === 0 ? (
                <button
                  type="button"
                  onClick={onAdd}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-2 text-[11px] font-bold text-slate-950 hover:bg-cyan-300"
                >
                  <Plus className="h-3.5 w-3.5" /> Add project
                </button>
              ) : (
                <ToolbarButton onClick={resetFilters}>
                  <X className="h-3.5 w-3.5" /> Clear filters
                </ToolbarButton>
              )
            }
          />
        ) : view === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.05] text-[9px] uppercase tracking-[0.16em] text-slate-600">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={togglePage}
                      aria-label="Select all projects on this page"
                      className="h-3.5 w-3.5 accent-cyan-400"
                    />
                  </th>
                  <th className="px-2 py-3 font-bold">Project</th>
                  <th className="px-3 py-3 font-bold">Category</th>
                  <th className="px-3 py-3 font-bold">Year</th>
                  <th className="px-3 py-3 font-bold">Tech</th>
                  <th className="px-3 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {pageRows.map((project) => {
                  const checked = selected.includes(project.id);
                  return (
                    <tr
                      key={project.id}
                      className={cx('group transition-colors', checked ? 'bg-cyan-400/[0.035]' : 'hover:bg-white/[0.02]')}
                    >
                      <td className="px-4 py-3 align-top">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelect(project.id)}
                          aria-label={`Select ${project.title}`}
                          className="mt-1 h-3.5 w-3.5 accent-cyan-400"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-3">
                          {project.image ? (
                            <img
                              src={project.image}
                              alt=""
                              className="h-10 w-14 shrink-0 rounded-md border border-white/[0.06] object-cover"
                            />
                          ) : (
                            <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md border border-amber-400/20 bg-amber-400/5 text-amber-400/70">
                              <ImageIcon className="h-4 w-4" />
                            </span>
                          )}
                          <div className="min-w-0 max-w-[300px]">
                            <p className="truncate text-[12px] font-bold text-slate-200">
                              {project.title}
                            </p>
                            <p className="truncate text-[10px] text-slate-600">
                              {project.description || 'No description'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[11px] text-slate-400">{project.category}</td>
                      <td className="px-3 py-3 text-[11px] text-slate-500">{project.year || '—'}</td>
                      <td className="px-3 py-3 text-[11px] text-slate-500">
                        {project.technology.length}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-300">
                          <span className="h-1 w-1 rounded-full bg-current" /> Published
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/project/${project.id}`}
                            target="_blank"
                            className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-cyan-300"
                            title="Open case study"
                            aria-label={`Open ${project.title}`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => onEdit(project)}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-cyan-300"
                            title="Edit project"
                            aria-label={`Edit ${project.title}`}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmIds([project.id])}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                            title="Delete project"
                            aria-label={`Delete ${project.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
            {pageRows.map((project) => {
              const checked = selected.includes(project.id);
              return (
                <div
                  key={project.id}
                  className={cx(
                    'group overflow-hidden rounded-lg border transition-colors',
                    checked
                      ? 'border-cyan-400/30 bg-cyan-400/[0.04]'
                      : 'border-white/[0.06] bg-white/[0.01] hover:border-white/15'
                  )}
                >
                  <div className="relative h-32 overflow-hidden bg-[#060a14]">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-700">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <label className="absolute left-2 top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-white/15 bg-black/50 backdrop-blur">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelect(project.id)}
                        aria-label={`Select ${project.title}`}
                        className="h-3 w-3 accent-cyan-400"
                      />
                    </label>
                    <span className="absolute right-2 top-2 rounded-md border border-white/10 bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 backdrop-blur">
                      {project.category}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="truncate text-[12px] font-bold text-white">{project.title}</h3>
                    <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-slate-500">
                      {project.description || 'No description'}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-600">
                        {project.year || 'No year'} · {project.technology.length} tech
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Link
                          to={`/project/${project.id}`}
                          target="_blank"
                          className="rounded p-1 text-slate-500 hover:text-cyan-300"
                          aria-label={`Open ${project.title}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onEdit(project)}
                          className="rounded p-1 text-slate-500 hover:text-cyan-300"
                          aria-label={`Edit ${project.title}`}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmIds([project.id])}
                          className="rounded p-1 text-slate-500 hover:text-red-400"
                          aria-label={`Delete ${project.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.05] px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] text-slate-600">
              <span>Rows</span>
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                aria-label="Rows per page"
                className="rounded-md border border-white/[0.07] bg-[#060a14] px-1.5 py-1 text-[10px] text-slate-300 outline-none"
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>
                {(safePage - 1) * pageSize + 1}–
                {Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={safePage <= 1}
                aria-label="Previous page"
                className="rounded-md border border-white/[0.07] p-1.5 text-slate-400 hover:text-white disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 text-[10px] tabular-nums text-slate-500">
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={safePage >= totalPages}
                aria-label="Next page"
                className="rounded-md border border-white/[0.07] p-1.5 text-slate-400 hover:text-white disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </Panel>

      <ConfirmDialog
        open={confirmIds.length > 0}
        title={
          confirmIds.length === 1
            ? `Delete “${confirmProjects[0]?.title ?? 'this project'}”?`
            : `Delete ${confirmIds.length} projects?`
        }
        description="This removes the projects from the portfolio and from the cloud copy. It cannot be undone."
        confirmLabel={confirmIds.length === 1 ? 'Delete project' : 'Delete projects'}
        onCancel={() => setConfirmIds([])}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
};

export default ProjectsPanel;
