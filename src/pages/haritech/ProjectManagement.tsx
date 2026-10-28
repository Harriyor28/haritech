import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Activity, AlertTriangle, BarChart3, CalendarDays, CheckCircle2, ChevronDown,
  CircleDot, ClipboardList, Clock, Compass, FileText, Filter,  Gauge, GitBranch, Kanban, Landmark, ListChecks, MessageCircle, Monitor, PackageCheck, Paintbrush, Rocket, Search,
  ShieldCheck, Ship, Sparkles, Sun, Target, Timer, TrendingUp, UserCog, Users, Workflow,
  Headphones, X, Zap, HardHat, LayoutDashboard, LucideIcon,
} from 'lucide-react';
import { getPMContent, getWhatsAppUrl } from '../../utils/haritechContent';
import type { ManagedProject, PMContent, ProjectCategory } from '../../utils/haritechContent';
import { HUB_MODULES, HubModule } from '../../components/haritech/ProjectHubModules';
import { getPropertyHub } from '../../utils/haritechProperty';
import type { PropertyHubContent } from '../../utils/haritechProperty';

/* ── Delivery Command Centre ────────────────────────────────────────────
   The public operations page: every live engagement, the delivery line it
   belongs to, the phase it sits in, the person accountable for it and a
   health score derived from the plan — not from opinion. Clients can then
   build their own indicative delivery plan and send it to us.

   Health is computed: remaining work is compared with remaining calendar
   time, so a project that is 40% done with 20% of its window left reads as
   healthy, while one that is 40% done with 5% of its window left does not.
   ---------------------------------------------------------------------- */

const MS = 86_400_000;

const iconMap: Record<string, LucideIcon> = {
  Monitor, Sun, Ship, Paintbrush, Landmark, Headphones,
  UserCog, Kanban, FileText, GitBranch, ShieldCheck, PackageCheck,
  Activity, Gauge, Target, Rocket, Timer, ListChecks, Users, Compass,
  BarChart3, TrendingUp, Workflow, ClipboardList,
};

type HealthKey = 'delivered' | 'ontrack' | 'watch' | 'risk' | 'overdue';

const HEALTH: Record<HealthKey, { label: string; text: string; bg: string; border: string; dot: string }> = {
  delivered: { label: 'Delivered', text: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', dot: 'bg-emerald-400' },
  ontrack: { label: 'On track', text: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/25', dot: 'bg-cyan-400' },
  watch: { label: 'Watch', text: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/25', dot: 'bg-amber-400' },
  risk: { label: 'At risk', text: 'text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-500/25', dot: 'bg-rose-400' },
  overdue: { label: 'Needs recovery', text: 'text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-500/25', dot: 'bg-rose-400' },
};

const HEALTH_WEIGHT: Record<HealthKey, number> = {
  delivered: 100, ontrack: 100, watch: 70, risk: 40, overdue: 20,
};

const toTime = (value: string): number | null => {
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
};

const shortDate = (value: string): string => {
  const t = toTime(value);
  if (t === null) return '—';
  return new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const dayMonth = (value: number): string =>
  new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

interface Health {
  key: HealthKey;
  days: number;
  expected: number;
}

const healthOf = (project: ManagedProject): Health => {
  const start = toTime(project.startDate);
  const target = toTime(project.targetDate);
  const now = Date.now();
  if (project.progress >= 100) return { key: 'delivered', days: target ? Math.round((target - now) / MS) : 0, expected: 100 };
  if (start === null || target === null || target <= start) return { key: 'ontrack', days: 0, expected: 0 };

  const expected = clamp(((now - start) / (target - start)) * 100, 0, 100);
  const days = Math.round((target - now) / MS);
  if (target < now) return { key: 'overdue', days, expected };
  const delta = project.progress - expected;
  if (delta >= -7) return { key: 'ontrack', days, expected };
  if (delta >= -18) return { key: 'watch', days, expected };
  return { key: 'risk', days, expected };
};

const milestonesDone = (project: ManagedProject) =>
  project.milestones.filter(m => m.done).length;

const FadeInView: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
    {children}
  </motion.div>
);

const HealthPill: React.FC<{ health: Health; compact?: boolean }> = ({ health, compact }) => {
  const tone = HEALTH[health.key];
  const suffix = health.key === 'delivered'
    ? ''
    : health.key === 'overdue'
      ? ` · ${Math.abs(health.days)}d late`
      : ` · ${health.days}d left`;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider ${tone.bg} ${tone.border} ${tone.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {tone.label}{compact ? '' : suffix}
    </span>
  );
};

const Bar: React.FC<{ value: number; tone?: string }> = ({ value, tone = 'from-cyan-500 to-blue-500' }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
    <div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${clamp(value, 0, 100)}%` }} />
  </div>
);

const ProjectCard: React.FC<{ project: ManagedProject; category: ProjectCategory | undefined; onOpen: () => void }> = ({ project, category, onOpen }) => {
  const health = healthOf(project);
  const CatIcon = category ? iconMap[category.icon] || Monitor : Monitor;
  const done = milestonesDone(project);
  return (
    <button
      onClick={onOpen}
      className="group w-full rounded-xl border border-white/5 bg-slate-950/50 p-3.5 text-left transition-all hover:border-cyan-500/30 hover:bg-slate-900/60"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className={`inline-flex items-center gap-1 rounded-md border border-white/5 bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-300`}>
          <CatIcon className="h-2.5 w-2.5" /> {category?.name ?? 'Project'}
        </span>
        <span className="text-[10px] font-mono text-slate-500">{project.progress}%</span>
      </div>
      <h4 className="mb-1 line-clamp-2 text-sm font-bold leading-snug text-white group-hover:text-cyan-300">{project.title}</h4>
      <p className="mb-2.5 truncate text-[11px] text-slate-500">{project.client}</p>
      <Bar value={project.progress} />
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-mono text-slate-500">{done}/{project.milestones.length} milestones</span>
        <HealthPill health={health} compact />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/5 pt-2">
        <span className="truncate text-[10px] text-slate-500">{project.owner}</span>
        <span className="shrink-0 font-mono text-[10px] text-slate-600">{shortDate(project.targetDate)}</span>
      </div>
    </button>
  );
};

const ProjectDrawer: React.FC<{ project: ManagedProject | null; category: ProjectCategory | undefined; onClose: () => void }> = ({ project, category, onClose }) => (
  <AnimatePresence>
    {project && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.aside
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 260 }}
          className="h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-[#070b16] p-5 sm:p-8"
          onClick={e => e.stopPropagation()}
        >
          {(() => {
            const health = healthOf(project);
            const CatIcon = category ? iconMap[category.icon] || Monitor : Monitor;
            const done = milestonesDone(project);
            return (
              <>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <span className="mb-3 inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-300">
                      <CatIcon className="h-3 w-3" /> {category?.name ?? 'Project'}
                    </span>
                    <h3 className="font-syne text-xl font-extrabold leading-tight text-white sm:text-2xl">{project.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{project.client}</p>
                  </div>
                  <button onClick={onClose} className="shrink-0 rounded-lg border border-white/5 p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <HealthPill health={health} />
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-300">
                    <Workflow className="h-3 w-3" /> {project.phase}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-300">
                    <CircleDot className="h-3 w-3" /> {project.status}
                  </span>
                </div>

                <p className="mb-6 text-sm leading-relaxed text-slate-300">{project.summary}</p>

                <div className="mb-6 rounded-xl border border-white/5 bg-slate-950/40 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Delivery progress</span>
                    <span className="font-mono text-cyan-300">{project.progress}%</span>
                  </div>
                  <Bar value={project.progress} />
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Started</div>
                      <div className="mt-0.5 text-[11px] font-semibold text-white">{shortDate(project.startDate)}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Target</div>
                      <div className="mt-0.5 text-[11px] font-semibold text-white">{shortDate(project.targetDate)}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Milestones</div>
                      <div className="mt-0.5 text-[11px] font-semibold text-white">{done}/{project.milestones.length}</div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <ListChecks className="h-3.5 w-3.5 text-cyan-400" /> Milestone trail
                  </h4>
                  <div className="space-y-1.5">
                    {project.milestones.map((milestone, i) => (
                      <div key={`${milestone.title}-${i}`} className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-xs ${milestone.done ? 'border-emerald-500/20 bg-emerald-500/5 text-slate-300' : 'border-white/5 bg-slate-950/40 text-slate-500'}`}>
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${milestone.done ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300' : 'border-white/10 text-slate-600'}`}>
                          {milestone.done ? <CheckCircle2 className="h-3 w-3" /> : <CircleDot className="h-2.5 w-2.5" />}
                        </span>
                        <span className="flex-1">{milestone.title}</span>
                        {i === 0 && <span className="font-mono text-[9px] uppercase tracking-wider text-slate-600">first</span>}
                        {i === project.milestones.length - 1 && <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-500/70">final</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <PackageCheck className="h-3.5 w-3.5 text-cyan-400" /> What the client receives
                  </h4>
                  <ul className="space-y-1.5">
                    {project.deliverables.map(item => (
                      <li key={item} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Users className="h-3.5 w-3.5 text-cyan-400" /> Team on this engagement
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.team.map((member, i) => (
                      <span key={`${member}-${i}`} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-[10px] font-bold text-white">
                          {member.split(' ').map(w => w[0]).slice(0, 2).join('')}
                        </span>
                        <span className="text-[11px] text-slate-300">{member}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <div className="mb-1 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-cyan-300">
                    <Activity className="h-3 w-3" /> Last written update
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">{project.lastUpdate}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="rounded-lg border border-white/5 bg-slate-900 px-2 py-1 text-[10px] font-mono text-slate-400">{tag}</span>
                  ))}
                </div>

                <div className="mt-7 flex flex-col gap-2 border-t border-white/5 pt-5 sm:flex-row">
                  <a
                    href={getWhatsAppUrl(`Hello Haritech! I saw the "${project.title}" project board. I would like to discuss a similar engagement.`)}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-primary flex-1 justify-center text-xs"
                  >
                    <MessageCircle className="h-4 w-4" /> Ask about similar work
                  </a>
                  <Link to="/haritech/request-quote?service=Project%20Management" className="btn-secondary flex-1 justify-center text-xs">
                    <FileText className="h-4 w-4 text-cyan-400" /> Scope my project
                  </Link>
                </div>
              </>
            );
          })()}
        </motion.aside>
      </motion.div>
    )}
  </AnimatePresence>
);

const SCOPE_FACTOR = { small: 0.6, standard: 1, enterprise: 1.55 } as const;
const BASE_DAYS = [4, 5, 30, 6, 4, 0];

const CREW: Record<string, string[]> = {
  digital: ['Delivery manager', 'Product designer', '2× full-stack engineers', 'QA analyst'],
  solar: ['Energy engineer', 'Installation lead', '2× field technicians', 'Safety officer'],
  import: ['Trade officer', 'Licensed clearing agent', 'Logistics coordinator'],
  epoxy: ['Floor systems specialist', '2× applicators', 'Finishing lead'],
  compliance: ['Corporate counsel', 'CAC filing officer', 'Compliance clerk'],
  support: ['Account manager', '2× support engineers', 'Field service technician'],
};

const ProjectManagement: React.FC = () => {
  const [content, setContent] = useState<PMContent>(() => getPMContent());
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskOnly, setRiskOnly] = useState(false);
  const [selected, setSelected] = useState<ManagedProject | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [hubData, setHubData] = useState<PropertyHubContent>(() => getPropertyHub());
  const [activeModule, setActiveModule] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return HUB_MODULES.some(module => module.id === hash) ? hash : 'overview';
  });

  // Plan builder
  const [planCategory, setPlanCategory] = useState('digital');
  const [planScope, setPlanScope] = useState<keyof typeof SCOPE_FACTOR>('standard');
  const [planUrgency, setPlanUrgency] = useState<'standard' | 'accelerated'>('standard');
  const [planStart, setPlanStart] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const handler = () => setContent(getPMContent());
    window.addEventListener('haritech-pm-updated', handler);
    return () => window.removeEventListener('haritech-pm-updated', handler);
  }, []);

  useEffect(() => {
    const handler = () => setHubData(getPropertyHub());
    window.addEventListener('haritech-property-hub-updated', handler);
    return () => window.removeEventListener('haritech-property-hub-updated', handler);
  }, []);

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace('#', '');
      setActiveModule(HUB_MODULES.some(module => module.id === hash) ? hash : 'overview');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const selectModule = (id: string) => {
    setActiveModule(id);
    window.history.replaceState(null, '', `#${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { categories, stages, rituals, projects, faqs } = content;

  const categoryById = useMemo(() => {
    const map = new Map<string, ProjectCategory>();
    categories.forEach(category => map.set(category.id, category));
    return map;
  }, [categories]);

  const stats = useMemo(() => {
    const total = projects.length;
    const delivered = projects.filter(p => p.progress >= 100).length;
    const live = projects.filter(p => p.progress < 100).length;
    const confidence = total
      ? Math.round(projects.reduce((sum, p) => sum + HEALTH_WEIGHT[healthOf(p).key], 0) / total)
      : 0;
    const members = new Set<string>();
    projects.forEach(p => p.team.forEach(m => members.add(m)));
    const allMilestones = projects.reduce((sum, p) => sum + p.milestones.length, 0);
    const closedMilestones = projects.reduce((sum, p) => sum + milestonesDone(p), 0);
    return { total, delivered, live, confidence, members: members.size, allMilestones, closedMilestones };
  }, [projects]);

  const healthMix = useMemo(() => {
    const counts: Record<HealthKey, number> = { delivered: 0, ontrack: 0, watch: 0, risk: 0, overdue: 0 };
    projects.forEach(p => { counts[healthOf(p).key] += 1; });
    const order: HealthKey[] = ['ontrack', 'watch', 'risk', 'overdue', 'delivered'];
    const colors: Record<HealthKey, string> = {
      ontrack: '#22d3ee', watch: '#fbbf24', risk: '#fb7185', overdue: '#f43f5e', delivered: '#34d399',
    };
    let cursor = 0;
    const stops = order
      .filter(key => counts[key] > 0)
      .map(key => {
        const pct = (counts[key] / Math.max(projects.length, 1)) * 100;
        const from = cursor;
        cursor += pct;
        return `${colors[key]} ${from}% ${cursor}%`;
      });
    return { counts, order, colors, gradient: stops.length ? `conic-gradient(${stops.join(', ')})` : 'conic-gradient(#1e293b 0% 100%)' };
  }, [projects]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects
      .filter(project => categoryFilter === 'all' || project.categoryId === categoryFilter)
      .filter(project => statusFilter === 'all' || project.status === statusFilter)
      .filter(project => !riskOnly || ['risk', 'overdue'].includes(healthOf(project).key))
      .filter(project => {
        if (!needle) return true;
        const haystack = [project.title, project.client, project.owner, project.summary, project.phase, ...project.tags, ...project.team]
          .join(' ').toLowerCase();
        return haystack.includes(needle);
      })
      .sort((a, b) => (toTime(a.targetDate) ?? 0) - (toTime(b.targetDate) ?? 0));
  }, [projects, query, categoryFilter, statusFilter, riskOnly]);

  const boardColumns = useMemo(() => {
    const known = new Set(stages.map(stage => stage.name));
    const extras = Array.from(new Set(filtered.map(project => project.phase))).filter(phase => !known.has(phase));
    return [...stages, ...extras.map(name => ({ name, desc: 'Project-defined phase', sla: '' }))]
      .map(stage => ({ ...stage, items: filtered.filter(project => project.phase === stage.name) }));
  }, [stages, filtered]);

  const teamLoad = useMemo(() => {
    const map = new Map<string, { name: string; projects: ManagedProject[] }>();
    projects.forEach(project => {
      project.team.forEach(member => {
        const entry = map.get(member) ?? { name: member, projects: [] };
        entry.projects.push(project);
        map.set(member, entry);
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.projects.length - a.projects.length || a.name.localeCompare(b.name))
      .map(entry => ({
        ...entry,
        average: Math.round(entry.projects.reduce((sum, p) => sum + p.progress, 0) / entry.projects.length),
        categories: Array.from(new Set(entry.projects.map(p => categoryById.get(p.categoryId)?.name ?? 'Project'))),
        isOwner: entry.projects.some(p => p.owner === entry.name),
      }));
  }, [projects, categoryById]);

  const plan = useMemo(() => {
    const factor = SCOPE_FACTOR[planScope] * (planUrgency === 'accelerated' ? 0.75 : 1);
    let cursor = toTime(planStart) ?? Date.now();
    const start = cursor;
    const rows = stages.map((stage, i) => {
      const base = BASE_DAYS[i] ?? 5;
      const days = base === 0 ? 0 : Math.max(2, Math.round(base * factor));
      const from = cursor;
      const to = days === 0 ? from : from + days * MS;
      if (days > 0) cursor = to;
      return { name: stage.name, desc: stage.desc, sla: stage.sla, days, from, to };
    });
    const totalDays = rows.reduce((sum, row) => sum + row.days, 0);
    return {
      rows,
      totalDays,
      weeks: Math.max(1, Math.ceil(totalDays / 7)),
      start,
      end: cursor,
      crew: CREW[planCategory] ?? CREW.digital,
      categoryName: categoryById.get(planCategory)?.name ?? 'Digital Systems',
    };
  }, [stages, planScope, planUrgency, planStart, planCategory, categoryById]);

  const planMessage =
    `Hello Haritech! I built an indicative delivery plan on your site.\n\n` +
    `Delivery line: ${plan.categoryName}\n` +
    `Scope: ${planScope} | Pace: ${planUrgency} | Start: ${shortDate(planStart)}\n` +
    `Indicative duration: ${plan.weeks} weeks (${plan.totalDays} working days), finishing ${shortDate(new Date(plan.end).toISOString())}\n` +
    `Phases: ${plan.rows.map(row => `${row.name} (${row.days || 'ongoing'}d)`).join(' → ')}\n` +
    `Suggested crew: ${plan.crew.join(', ')}\n\n` +
    `Please review this plan with me and confirm a fixed quotation.`;

  const statuses = Array.from(new Set(projects.map(project => project.status))).sort();

  const scrollToBoard = () => {
    document.getElementById('delivery-board')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative overflow-x-clip">
      <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[150px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-indigo-500/10 blur-[150px]" />

      {/* Hero */}
      <section className="relative flex items-center justify-center overflow-hidden pb-14 pt-16 sm:pt-20">
        <div className="container relative z-10 mx-auto px-5 sm:px-6">
          <div className="mx-auto max-w-5xl text-center">
            <FadeInView>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-[11px] font-medium text-slate-200 sm:text-xs">
                <LayoutDashboard className="h-4 w-4 text-cyan-400" /> Project Management &amp; Property Monitoring
              </div>
              <h1 className="mb-4 font-syne text-2xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
                Practical Project Support, <span className="text-white drop-shadow-[0_0_25px_rgba(6,182,212,0.35)]">Planned and Tracked.</span>
              </h1>
              <p className="mx-auto mb-4 max-w-2xl text-xs font-normal leading-relaxed text-slate-400 sm:text-sm md:text-base">
                Planning, scheduling, budgeting support, coordination, progress reporting and documentation for projects,
                plus scheduled monitoring visits and written condition reports for property owners who are not on site.
                The panels below are reference models showing how a project is structured — they are illustrative, not live
                client records.
              </p>
              <p className="mb-7 font-mono text-[10px] uppercase tracking-wider text-slate-600">
                Reference models only · no live client data, no claimed licences
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/haritech/request-quote?service=Project%20Management" className="btn-primary text-xs sm:text-sm">
                  <Zap className="h-4 w-4" /> Request a Proposal
                </Link>
                <button onClick={() => selectModule('construction')} className="btn-secondary text-xs sm:text-sm">
                  <HardHat className="h-4 w-4 text-cyan-400" /> See the Reference Models
                </button>
                <a href={getWhatsAppUrl('Hello Haritech, I would like to discuss project planning and coordination.')} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs sm:text-sm">
                  <MessageCircle className="h-4 w-4 text-slate-300" /> Discuss a Project
                </a>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Hub module switcher */}
      <div id="hub-modules" className="sticky top-[97px] z-30 border-y border-white/5 bg-[#04060a]/95 backdrop-blur-md">
        <div className="container mx-auto px-3 sm:px-6">
          <div className="flex items-center gap-2 py-2.5 sm:hidden">
            <LayoutDashboard className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
            <select
              value={activeModule}
              onChange={e => selectModule(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/5 bg-slate-950/70 px-3 py-2 text-[11px] font-semibold text-white outline-none focus:border-cyan-500/40"
            >
              {HUB_MODULES.map(module => <option key={module.id} value={module.id}>{module.label}</option>)}
            </select>
          </div>
          <div className="hidden gap-1.5 overflow-x-auto py-2.5 sm:flex">
            {HUB_MODULES.map(module => {
              const Icon = module.icon;
              const active = module.id === activeModule;
              return (
                <button
                  key={module.id}
                  onClick={() => selectModule(module.id)}
                  title={module.blurb}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[10px] font-bold transition-colors lg:text-[11px] ${active ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' : 'border-white/5 bg-slate-950/50 text-slate-400 hover:text-white'}`}
                >
                  <Icon className="h-3 w-3" /> {module.short}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scope disclaimer for every reference model shown below */}
      <div className="border-b border-white/5 bg-amber-500/5">
        <div className="container mx-auto px-5 py-2.5 sm:px-6">
          <p className="text-center text-[10px] leading-relaxed text-amber-100/70 sm:text-[11px]">
            These are planning and reporting models, not a live client platform. Haritech is not presented as a licensed
            construction, engineering, surveying or property-management firm; where a project needs those services we say
            so and coordinate with the appropriate professionals.
          </p>
        </div>
      </div>

      {activeModule === 'overview' ? (
        <>
      {/* Telemetry */}
      <section className="border-y border-white/5 bg-slate-950/20 py-10">
        <div className="container mx-auto px-5 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { label: 'Reference plans shown', value: String(stats.total), icon: ClipboardList, tone: 'text-cyan-400' },
                { label: 'Illustrative (not live)', value: String(stats.live), icon: Activity, tone: 'text-amber-400' },
                { label: 'Example plan progress', value: `${stats.confidence}%`, icon: Gauge, tone: 'text-emerald-400' },
                { label: 'Named on the example', value: String(stats.members), icon: Users, tone: 'text-indigo-400' },
              ].map((tile, i) => {
                const Icon = tile.icon;
                return (
                  <motion.div key={tile.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    className="rounded-xl border border-white/5 bg-slate-950/40 p-3.5 sm:p-4">
                    <Icon className={`mb-1.5 h-4 w-4 ${tile.tone}`} />
                    <div className="font-mono text-xl font-extrabold text-white sm:text-2xl">{tile.value}</div>
                    <div className="mt-0.5 text-[10px] leading-snug text-slate-500 sm:text-xs">{tile.label}</div>
                  </motion.div>
                );
              })}
            </div>

            <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4">
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 shrink-0 rounded-full" style={{ background: healthMix.gradient }}>
                  <div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-full bg-[#070b16]">
                    <span className="font-mono text-lg font-extrabold text-white">{stats.confidence}%</span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">healthy</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    <BarChart3 className="h-3 w-3 text-cyan-400" /> Portfolio health mix
                  </div>
                  <div className="space-y-1">
                    {healthMix.order.map(key => (
                      <div key={key} className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: healthMix.colors[key] }} />
                          {HEALTH[key].label}
                        </span>
                        <span className="font-mono text-slate-300">{healthMix.counts[key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-3 border-t border-white/5 pt-2.5 text-[10px] leading-relaxed text-slate-500">
                {stats.closedMilestones} of {stats.allMilestones} milestones closed across the portfolio. Health compares
                progress made against time elapsed on each plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery lines / categories */}
      <section id="delivery-lines" className="section-padding scroll-mt-24">
        <div className="container mx-auto">
          <FadeInView>
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
                Six <span className="text-cyan-400">Delivery Lines</span>
              </h2>
              <p className="mx-auto max-w-2xl text-xs text-slate-400 sm:text-sm">
                Every engagement is filed under one line, so a client with a website, a solar array and a consignment
                can see all three without them blurring into one another. Pick a line to filter the board.
              </p>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, i) => {
              const CatIcon = iconMap[category.icon] || Monitor;
              const inLine = projects.filter(project => project.categoryId === category.id);
              const live = inLine.filter(project => project.progress < 100).length;
              const average = inLine.length ? Math.round(inLine.reduce((sum, p) => sum + p.progress, 0) / inLine.length) : 0;
              const active = categoryFilter === category.id;
              return (
                <FadeInView key={category.id} delay={i * 0.05}>
                  <button
                    onClick={() => { setCategoryFilter(active ? 'all' : category.id); scrollToBoard(); }}
                    className={`card group h-full w-full p-5 text-left transition-all ${active ? 'border-cyan-500/40 bg-[#141b35]' : 'hover:bg-[#141b35] glow-border'}`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className={`rounded-xl bg-gradient-to-br p-2.5 ${category.color}`}>
                        <CatIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className={`rounded-full border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${active ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' : 'border-white/5 bg-slate-900 text-slate-400'}`}>
                        {inLine.length} projects
                      </span>
                    </div>
                    <h3 className="mb-1 text-base font-bold text-white group-hover:text-cyan-300">{category.name}</h3>
                    <p className="mb-4 text-xs leading-relaxed text-slate-400">{category.desc}</p>
                    <div className="mb-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      <span>{live} live · {inLine.length - live} closed</span>
                      <span>{average}% avg</span>
                    </div>
                    <Bar value={average} tone="from-cyan-500 to-indigo-500" />
                  </button>
                </FadeInView>
              );
            })}
          </div>
        </div>
      </section>

      {/* Delivery board */}
      <section id="delivery-board" className="section-padding scroll-mt-24 border-y border-white/5 bg-slate-950/20">
        <div className="container mx-auto">
          <FadeInView>
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="mb-2 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
                  The <span className="text-cyan-400">Delivery Board</span>
                </h2>
                <p className="max-w-2xl text-xs text-slate-400 sm:text-sm">
                  Work is grouped by the phase it is actually in — not by what was sold. Tap any card for the milestone
                  trail, the team on it and the last written update.
                </p>
              </div>
              <div className="font-mono text-[11px] text-slate-500">
                {filtered.length} of {projects.length} projects shown
              </div>
            </div>
          </FadeInView>

          {/* Controls */}
          <FadeInView>
            <div className="mb-6 space-y-3 rounded-xl border border-white/5 bg-[#0b101d]/80 p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search project, client, owner or tag…"
                    className="w-full rounded-xl border border-white/5 bg-slate-950/60 py-2.5 pl-9 pr-3 text-xs text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-500/40"
                  />
                </div>
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/5 bg-slate-950/60 py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-cyan-500/40"
                  >
                    <option value="all">All delivery lines</option>
                    {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/40"
                >
                  <option value="all">Any status</option>
                  {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
                <button
                  onClick={() => setRiskOnly(v => !v)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors ${riskOnly ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : 'border-white/5 bg-slate-950/60 text-slate-400 hover:text-white'}`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> Attention only
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => { setCategoryFilter('all'); setStatusFilter('all'); setQuery(''); setRiskOnly(false); }}
                  className="rounded-lg border border-white/5 bg-slate-900 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
                >
                  Reset
                </button>
                {stages.map(stage => {
                  const count = filtered.filter(project => project.phase === stage.name).length;
                  return (
                    <span key={stage.name} className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-slate-950/40 px-2.5 py-1 text-[10px] text-slate-500">
                      <span className="h-1 w-1 rounded-full bg-cyan-500/70" />
                      {stage.name}
                      <span className="font-mono text-slate-400">{count}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </FadeInView>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-slate-950/40 py-16 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-slate-700" />
              <p className="text-sm font-bold text-slate-400">No projects match those filters</p>
              <p className="mt-1 text-xs text-slate-600">Try another delivery line, clear the search, or reset the board.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {boardColumns.map((column, index) => {
                const stage = stages[index];
                return (
                  <motion.div key={column.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}
                    className="rounded-2xl border border-white/5 bg-[#0b101d]/60 p-3">
                    <div className="mb-3 flex items-start justify-between gap-2 px-1">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 font-mono text-[10px] font-bold text-cyan-300">
                            {index + 1}
                          </span>
                          <h3 className="truncate text-xs font-bold text-white">{column.name}</h3>
                        </div>
                        <p className="mt-1 line-clamp-2 pl-8 text-[10px] leading-snug text-slate-500">{column.desc}</p>
                      </div>
                      <span className="shrink-0 rounded-full border border-white/5 bg-slate-950/60 px-2 py-0.5 font-mono text-[10px] text-slate-400">
                        {column.items.length}
                      </span>
                    </div>
                    {stage?.sla && (
                      <div className="mb-2 ml-1 inline-flex items-center gap-1 rounded-md bg-slate-950/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                        <Timer className="h-2.5 w-2.5" /> {stage.sla}
                      </div>
                    )}
                    <div className="space-y-2">
                      {column.items.map(project => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          category={categoryById.get(project.categoryId)}
                          onOpen={() => setSelected(project)}
                        />
                      ))}
                      {column.items.length === 0 && (
                        <p className="rounded-lg border border-dashed border-white/5 px-3 py-5 text-center text-[10px] text-slate-600">
                          Nothing in this phase
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Team load */}
      <section id="team-load" className="section-padding scroll-mt-24">
        <div className="container mx-auto">
          <FadeInView>
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
                How the Team <span className="text-cyan-400">Carries the Load</span>
              </h2>
              <p className="mx-auto max-w-2xl text-xs text-slate-400 sm:text-sm">
                No one is spread across everything. Each engagement has one accountable owner, a small named crew and a
                named QA gate — which is why a Friday update can always name the person behind the delay.
              </p>
            </div>
          </FadeInView>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
            <FadeInView>
              <div className="card h-full p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Live allocation</h3>
                  <span className="ml-auto font-mono text-[10px] text-slate-500">{teamLoad.length} specialists</span>
                </div>
                <div className="space-y-3">
                  {teamLoad.map(member => (
                    <div key={member.name} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-[11px] font-bold text-white">
                        {member.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-xs font-semibold text-white">
                            {member.name}
                            {member.isOwner && <span className="ml-1.5 rounded bg-cyan-500/15 px-1 py-0.5 font-mono text-[8px] uppercase tracking-wider text-cyan-300">owner</span>}
                          </span>
                          <span className="shrink-0 font-mono text-[10px] text-slate-500">{member.projects.length} proj · {member.average}%</span>
                        </div>
                        <div className="mt-1"><Bar value={member.average} tone="from-cyan-500/80 to-indigo-500/80" /></div>
                        <p className="mt-0.5 truncate text-[10px] text-slate-600">{member.categories.join(' · ')}</p>
                      </div>
                    </div>
                  ))}
                  {teamLoad.length === 0 && <p className="text-xs text-slate-600">No team assignments recorded yet.</p>}
                </div>
              </div>
            </FadeInView>

            <FadeInView delay={0.1}>
              <div className="card h-full p-5">
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">The six rules we run by</h3>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {rituals.map(ritual => {
                    const Icon = iconMap[ritual.icon] || ShieldCheck;
                    return (
                      <div key={ritual.title} className="rounded-xl border border-white/5 bg-slate-950/40 p-3">
                        <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
                          <Icon className="h-3.5 w-3.5 text-cyan-300" />
                        </div>
                        <h4 className="text-[11px] font-bold text-white">{ritual.title}</h4>
                        <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{ritual.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeInView>
          </div>

          {/* Stage SLAs */}
          <FadeInView>
            <div className="mt-8 card p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Workflow className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Delivery pipeline &amp; service levels</h3>
                <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-slate-500">{stages.length} phases</span>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {stages.map((stage, i) => (
                  <div key={stage.name} className="rounded-xl border border-white/5 bg-slate-950/40 p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-cyan-400">{String(i + 1).padStart(2, '0')}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-400">
                        <Clock className="h-2.5 w-2.5" /> {stage.sla}
                      </span>
                    </div>
                    <h4 className="text-[11px] font-bold text-white">{stage.name}</h4>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{stage.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Plan builder */}
      <section id="plan-builder" className="section-padding scroll-mt-24 border-y border-white/5 bg-slate-950/20">
        <div className="container mx-auto">
          <FadeInView>
            <div className="mb-10 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                <Sparkles className="h-3 w-3" /> Interactive
              </div>
              <h2 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
                Build Your <span className="text-cyan-400">Delivery Plan</span>
              </h2>
              <p className="mx-auto max-w-2xl text-xs text-slate-400 sm:text-sm">
                Tell it what you are building and how fast you need it. It returns the phase schedule, the crew we would
                assign and the date the final milestone would close — the same model our PMO starts from.
              </p>
            </div>
          </FadeInView>

          <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
            <FadeInView>
              <div className="card p-5">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Delivery line</label>
                    <select
                      value={planCategory}
                      onChange={e => setPlanCategory(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/40"
                    >
                      {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Scope size</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['small', 'standard', 'enterprise'] as const).map(scope => (
                        <button
                          key={scope}
                          onClick={() => setPlanScope(scope)}
                          className={`rounded-xl border px-2 py-2.5 text-[11px] font-bold capitalize transition-colors ${planScope === scope ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' : 'border-white/5 bg-slate-950/60 text-slate-400 hover:text-white'}`}
                        >
                          {scope}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Pace</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['standard', 'accelerated'] as const).map(pace => (
                        <button
                          key={pace}
                          onClick={() => setPlanUrgency(pace)}
                          className={`rounded-xl border px-2 py-2.5 text-[11px] font-bold capitalize transition-colors ${planUrgency === pace ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' : 'border-white/5 bg-slate-950/60 text-slate-400 hover:text-white'}`}
                        >
                          {pace === 'accelerated' ? 'Accelerated (−25%)' : 'Standard'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Start date</label>
                    <input
                      type="date"
                      value={planStart}
                      onChange={e => setPlanStart(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4">
                    <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3">
                      <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Duration</div>
                      <div className="mt-0.5 font-mono text-lg font-extrabold text-white">{plan.weeks}w</div>
                      <div className="text-[10px] text-slate-500">{plan.totalDays} working days</div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3">
                      <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Final milestone</div>
                      <div className="mt-0.5 font-mono text-lg font-extrabold text-cyan-300">{dayMonth(plan.end)}</div>
                      <div className="text-[10px] text-slate-500">{new Date(plan.end).getFullYear()}</div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                      <Users className="h-3 w-3" /> Crew we would assign
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.crew.map(role => (
                        <span key={role} className="rounded-lg border border-white/5 bg-slate-950/60 px-2 py-1 text-[10px] text-slate-300">{role}</span>
                      ))}
                    </div>
                  </div>

                  <a
                    href={getWhatsAppUrl(planMessage)}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-primary w-full justify-center text-xs"
                  >
                    <MessageCircle className="h-4 w-4" /> Send this plan for a fixed quote
                  </a>
                  <p className="text-center text-[10px] leading-relaxed text-slate-600">
                    Indicative only — final durations are confirmed after the discovery call and written into the scope of work.
                  </p>
                </div>
              </div>
            </FadeInView>

            <FadeInView delay={0.1}>
              <div className="card h-full p-5">
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Generated schedule</h3>
                  <span className="ml-auto font-mono text-[10px] text-slate-500">{plan.categoryName}</span>
                </div>
                <div className="relative">
                  <div className="absolute bottom-3 left-[7px] top-3 w-px bg-gradient-to-b from-cyan-500/50 via-cyan-500/20 to-transparent" />
                  <div className="space-y-3">
                    {plan.rows.map((row, i) => (
                      <div key={row.name} className="relative flex gap-3">
                        <span className={`relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${row.days === 0 ? 'border-slate-600 bg-[#0b101d]' : 'border-cyan-500/60 bg-cyan-500/20'}`}>
                          <span className={`h-1 w-1 rounded-full ${row.days === 0 ? 'bg-slate-600' : 'bg-cyan-300'}`} />
                        </span>
                        <div className="min-w-0 flex-1 rounded-xl border border-white/5 bg-slate-950/40 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                            <h4 className="text-[11px] font-bold text-white">{row.name}</h4>
                            <span className="font-mono text-[10px] text-cyan-300">
                              {row.days === 0 ? 'Ongoing' : `${dayMonth(row.from)} → ${dayMonth(row.to)}`}
                            </span>
                          </div>
                          <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{row.desc}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-400">
                              {row.days === 0 ? 'warranty' : `${row.days} days`}
                            </span>
                            <span className="font-mono text-[9px] text-slate-600">phase {i + 1}/{plan.rows.length}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
                    <ShieldCheck className="h-3 w-3" /> What this plan locks in
                  </div>
                  <ul className="space-y-1">
                    {[
                      'A named project owner from day one',
                      'A written Friday update against these phases',
                      'Priced change control before any extra work',
                      'Internal QA gate before each handover',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-2.5 w-2.5 shrink-0 text-emerald-400" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Assurance strip */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Gauge, title: 'Health, not adjectives', body: 'Every card scores progress against the time left on its plan. A slipping milestone shows up the same day, with the reason and the revised date — not in a month-end summary.' },
              { icon: GitBranch, title: 'Change control in writing', body: 'Scope changes are priced and approved before work starts. That is why final invoices match quotations, and why the board never quietly grows.' },
              { icon: Headphones, title: 'Nobody disappears at handover', body: 'Each delivery ends with documentation, credentials, training and warranty terms — then an aftercare period where the same owner still answers.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeInView key={item.title} delay={i * 0.08}>
                  <div className="card h-full p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                      <Icon className="h-4 w-4 text-cyan-300" />
                    </div>
                    <h3 className="mb-1.5 text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs leading-relaxed text-slate-400">{item.body}</p>
                  </div>
                </FadeInView>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto">
          <FadeInView>
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
                Managing Projects, <span className="text-cyan-400">Explained</span>
              </h2>
              <p className="mx-auto max-w-2xl text-xs text-slate-400 sm:text-sm">How progress is reported, what happens when something slips, and what you get at the end.</p>
            </div>
          </FadeInView>
          <div className="mx-auto max-w-3xl border-t border-white/10">
            {faqs.map((faq, i) => (
              <FadeInView key={faq.q} delay={i * 0.04}>
                <div className="border-b border-white/10">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="group flex w-full items-center justify-between gap-6 py-5 text-left"
                  >
                    <span className="text-sm font-semibold text-white transition-colors group-hover:text-cyan-400 sm:text-base">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-cyan-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="pb-5 pr-6">
                          <p className="border-l-2 border-cyan-500/50 pl-4 text-sm leading-relaxed text-slate-400">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-indigo-600/10 to-blue-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]" />
        <div className="container relative z-10 mx-auto px-5 text-center sm:px-6">
          <FadeInView>
            <Rocket className="mx-auto mb-4 h-9 w-9 text-cyan-400" />
            <h2 className="mb-4 font-syne text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl">Put Your Project on the Board</h2>
            <p className="mx-auto mb-8 max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
              Send the brief — or just the problem. We reply with the questions still open, then a phase plan and a
              written quotation stating its assumptions. Timelines are agreed with you rather than promised in advance.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/haritech/request-quote?service=Project%20Management" className="btn-primary text-xs sm:text-sm">
                <Zap className="h-4 w-4" /> Request a Scope &amp; Quote
              </Link>
              <a href={getWhatsAppUrl('Hello Haritech! I would like to start a project and meet my project owner.')} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs sm:text-sm">
                <MessageCircle className="h-4 w-4 text-cyan-400" /> Message the PMO
              </a>
            </div>
            <p className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> {stats.confidence}% portfolio confidence</span>
              <span className="inline-flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> {stats.closedMilestones}/{stats.allMilestones} milestones closed</span>
              <span className="inline-flex items-center gap-1.5"><Compass className="h-3.5 w-3.5" /> Enquiries handled remotely and by appointment</span>
            </p>
          </FadeInView>
        </div>
      </section>
        </>
      ) : (
        <div className="section-padding">
          <div className="container mx-auto">
            <HubModule slug={activeModule} data={hubData} />
          </div>
        </div>
      )}

      <ProjectDrawer project={selected} category={selected ? categoryById.get(selected.categoryId) : undefined} onClose={() => setSelected(null)} />
    </div>
  );
};

export default ProjectManagement;
