import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Cloud,
  CloudOff,
  Database,
  Eye,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import type { ProjectData } from '../../../utils/projects';
import type { Testimonial } from '../../../utils/testimonials';
import type { SiteSettings } from '../../../utils/settings';
import type { ApplicationSummary, ContactMessageRow } from './useAdminData';
import {
  enquirySeries,
  countWithinDays,
  formatDateTime,
  formatRelative,
  percent,
  statusCounts,
} from './insights';
import {
  Badge,
  ChartBars,
  EmptyState,
  Panel,
  PanelHeader,
  ProgressBar,
  SectionLabel,
  Segmented,
  Sparkline,
  StatTile,
  cx,
} from './ui';

type View = 'overview' | 'analytics' | 'operations';

const statusTone: Record<string, 'neutral' | 'amber' | 'emerald' | 'red'> = {
  new: 'neutral',
  in_progress: 'amber',
  resolved: 'emerald',
  spam: 'red',
};

const DashboardOverview: React.FC<{
  projects: ProjectData[];
  testimonials: Testimonial[];
  messages: ContactMessageRow[];
  applications: ApplicationSummary | null;
  settings: SiteSettings;
  logo: string;
  cloudConfigured: boolean;
  sessionEmail: string | null;
  syncing: boolean;
  syncedAt: Date;
  onNavigate: (tab: string) => void;
  onAddProject: () => void;
  onEditProject: (project: ProjectData) => void;
  onAddTestimonial: () => void;
  onRefresh: () => void;
  onSync: () => void;
}> = ({
  projects,
  testimonials,
  messages,
  applications,
  settings,
  logo,
  cloudConfigured,
  sessionEmail,
  syncing,
  syncedAt,
  onNavigate,
  onAddProject,
  onEditProject,
  onAddTestimonial,
  onRefresh,
  onSync,
}) => {
  const [view, setView] = useState<View>('overview');

  const series = useMemo(() => enquirySeries(messages, 14), [messages]);
  const thisWeek = useMemo(() => countWithinDays(messages, 7), [messages]);
  const lastWeek = useMemo(() => countWithinDays(messages, 7, 7), [messages]);
  const counts = useMemo(() => statusCounts(messages), [messages]);
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach((project) => {
      map.set(project.category, (map.get(project.category) ?? 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [projects]);

  const averageRating = testimonials.length
    ? testimonials.reduce((total, item) => total + (item.rating || 0), 0) / testimonials.length
    : 0;
  const missingImages = projects.filter((project) => !project.image).length;
  const newEnquiries = counts.new ?? 0;
  const queryApplications = applications?.queries ?? 0;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const attention = [
    {
      id: 'enquiries',
      title: `${newEnquiries} ${newEnquiries === 1 ? 'enquiry is' : 'enquiries are'} waiting`,
      detail: 'Unread contact and quote requests from the live site.',
      tone: 'amber' as const,
      icon: <Mail className="h-4 w-4" />,
      action: () => onNavigate('messages'),
      cta: 'Open inbox',
    },
    {
      id: 'queries',
      title: `${queryApplications} CAC ${queryApplications === 1 ? 'query' : 'queries'}`,
      detail: 'Applications the desk flagged for more information.',
      tone: 'red' as const,
      icon: <AlertCircle className="h-4 w-4" />,
      action: () => onNavigate('haritech'),
      cta: 'Review',
    },
    {
      id: 'images',
      title: `${missingImages} ${missingImages === 1 ? 'project has' : 'projects have'} no image`,
      detail: 'Cards without artwork cannot be published cleanly.',
      tone: 'amber' as const,
      icon: <ImageIcon className="h-4 w-4" />,
      action: () => onNavigate('projects'),
      cta: 'Fix projects',
    },
    {
      id: 'testimonials',
      title: 'No client feedback published',
      detail: 'Add real testimonials to fill the portfolio feedback section.',
      tone: 'cyan' as const,
      icon: <Star className="h-4 w-4" />,
      action: onAddTestimonial,
      cta: 'Add feedback',
    },
    {
      id: 'local',
      title: 'Cloud sync is local only',
      detail: 'Connect Supabase so visitor devices see your content.',
      tone: 'red' as const,
      icon: <CloudOff className="h-4 w-4" />,
      action: () => onNavigate('settings'),
      cta: 'Check setup',
    },
  ].filter((item) => {
    if (item.id === 'enquiries') return newEnquiries > 0;
    if (item.id === 'queries') return queryApplications > 0;
    if (item.id === 'images') return missingImages > 0;
    if (item.id === 'testimonials') return testimonials.length === 0;
    return !cloudConfigured;
  });

  const checklist = [
    { label: 'Brand logo uploaded', done: Boolean(logo), tab: 'settings' },
    {
      label: 'Contact email set',
      done: Boolean(settings.contactEmail && !settings.contactEmail.includes('example')),
      tab: 'settings',
    },
    { label: 'Office address set', done: Boolean(settings.address), tab: 'settings' },
    { label: 'Portfolio projects published', done: projects.length > 0, tab: 'projects' },
    { label: 'Client feedback published', done: testimonials.length > 0, tab: 'testimonials' },
    { label: 'Owner session signed in', done: Boolean(sessionEmail), tab: 'settings' },
  ];
  const checklistDone = checklist.filter((item) => item.done).length;

  return (
    <div className="space-y-6">
      {/* Page intro */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <SectionLabel>Operations console</SectionLabel>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {greeting}, owner
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}{' '}
            · everything here is measured from your stored content and enquiries.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={cloudConfigured ? 'emerald' : 'amber'} dot>
            {cloudConfigured ? 'Cloud connected' : 'Local only'}
          </Badge>
          <Badge tone="neutral" dot>
            {sessionEmail ? 'Owner session' : 'No session'}
          </Badge>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-[11px] font-bold text-slate-400 transition-colors hover:text-white"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      </div>

      <Segmented
        ariaLabel="Dashboard view"
        value={view}
        onChange={(next) => setView(next as View)}
        options={[
          { value: 'overview', label: 'Overview' },
          { value: 'analytics', label: 'Analytics' },
          { value: 'operations', label: 'Operations' },
        ]}
      />

      {view === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Published projects"
              value={projects.length}
              hint={`${categories.length} ${categories.length === 1 ? 'category' : 'categories'} represented`}
              icon={<FolderOpen className="h-4 w-4" />}
              accent="cyan"
              onSelect={() => onNavigate('projects')}
            />
            <StatTile
              label="New enquiries"
              value={newEnquiries}
              hint={`${thisWeek} received in the last 7 days`}
              icon={<Mail className="h-4 w-4" />}
              accent="amber"
              trend={{
                value: `${thisWeek - lastWeek >= 0 ? '+' : ''}${thisWeek - lastWeek} wk`,
                positive: thisWeek - lastWeek >= 0,
              }}
              onSelect={() => onNavigate('messages')}
            />
            <StatTile
              label="Testimonials"
              value={testimonials.length}
              hint={
                testimonials.length
                  ? `${averageRating.toFixed(1)} / 5 average rating`
                  : 'None published yet'
              }
              icon={<Star className="h-4 w-4" />}
              accent="violet"
              onSelect={() => onNavigate('testimonials')}
            />
            <StatTile
              label="CAC applications"
              value={applications?.total ?? '—'}
              hint={
                applications
                  ? `${applications.queries} open ${applications.queries === 1 ? 'query' : 'queries'}`
                  : 'Not connected'
              }
              icon={<FileText className="h-4 w-4" />}
              accent="emerald"
              onSelect={() => onNavigate('haritech')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Panel className="xl:col-span-2">
              <PanelHeader
                icon={<Activity className="h-4 w-4" />}
                title="Recent projects"
                hint="The newest additions to your public portfolio."
                actions={
                  <button
                    type="button"
                    onClick={() => onNavigate('projects')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    Manage all <ArrowRight className="h-3 w-3" />
                  </button>
                }
              />
              {projects.length === 0 ? (
                <EmptyState
                  icon={<FolderOpen className="h-5 w-5" />}
                  title="No projects published"
                  body="Add your first case study so visitors can see the work."
                  action={
                    <button
                      type="button"
                      onClick={onAddProject}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-2 text-[11px] font-bold text-slate-950 hover:bg-cyan-300"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add project
                    </button>
                  }
                />
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {projects.slice(0, 5).map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => onEditProject(project)}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-white/[0.02]"
                    >
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="h-10 w-10 shrink-0 rounded-lg border border-white/[0.06] object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-600">
                          <ImageIcon className="h-4 w-4" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-bold text-slate-200">
                          {project.title}
                        </span>
                        <span className="block truncate text-[10px] text-slate-600">
                          {project.category} · {project.year || 'Year not set'}
                        </span>
                      </span>
                      <Badge tone="neutral">{project.technology.length} tech</Badge>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                    </button>
                  ))}
                </div>
              )}
            </Panel>

            <Panel>
              <PanelHeader
                icon={<AlertCircle className="h-4 w-4" />}
                title="Needs attention"
                hint={`${attention.length} ${attention.length === 1 ? 'item' : 'items'} found`}
              />
              {attention.length === 0 ? (
                <div className="flex flex-col items-center px-5 py-10 text-center">
                  <CheckCircle2 className="mb-3 h-8 w-8 text-emerald-400/70" />
                  <p className="text-xs font-bold text-slate-300">Everything looks handled</p>
                  <p className="mt-1 text-[11px] text-slate-600">
                    No unread enquiries, missing artwork or sync problems.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {attention.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 px-5 py-3">
                      <span
                        className={cx(
                          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border',
                          item.tone === 'red'
                            ? 'border-red-400/20 bg-red-400/10 text-red-300'
                            : item.tone === 'amber'
                              ? 'border-amber-400/20 bg-amber-400/10 text-amber-300'
                              : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300'
                        )}
                      >
                        {item.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11.5px] font-bold text-slate-200">{item.title}</p>
                        <p className="mt-0.5 text-[10.5px] leading-relaxed text-slate-600">
                          {item.detail}
                        </p>
                        <button
                          type="button"
                          onClick={item.action}
                          className="mt-1.5 text-[10px] font-bold text-cyan-400 hover:text-cyan-300"
                        >
                          {item.cta} →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Panel className="xl:col-span-2">
              <PanelHeader
                icon={<Mail className="h-4 w-4" />}
                title="Latest enquiries"
                hint="Contact, quote and service requests as they arrive."
                actions={
                  <button
                    type="button"
                    onClick={() => onNavigate('messages')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    Inbox <ArrowRight className="h-3 w-3" />
                  </button>
                }
              />
              {messages.length === 0 ? (
                <EmptyState
                  icon={<Mail className="h-5 w-5" />}
                  title="No enquiries yet"
                  body="Requests from the contact and quote forms will appear here."
                />
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {messages.slice(0, 5).map((message) => (
                    <button
                      key={message.id}
                      type="button"
                      onClick={() => onNavigate('messages')}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-white/[0.02]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[10px] font-black text-slate-400">
                        {(message.name || 'A').charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[12px] font-bold text-slate-200">
                            {message.name || 'Anonymous'}
                          </span>
                          <Badge tone={statusTone[message.status ?? 'new'] ?? 'neutral'}>
                            {(message.status ?? 'new').replace('_', ' ')}
                          </Badge>
                        </span>
                        <span className="mt-0.5 block truncate text-[10.5px] text-slate-600">
                          {message.subject || message.message || 'No subject'}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-600">
                        {formatRelative(message.created_at)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </Panel>

            <Panel>
              <PanelHeader
                icon={<Sparkles className="h-4 w-4" />}
                title="Quick actions"
                hint="Shortcuts to the work you do most."
              />
              <div className="grid grid-cols-2 gap-2 p-4">
                {[
                  {
                    label: 'Add project',
                    icon: <Plus className="h-3.5 w-3.5" />,
                    run: onAddProject,
                  },
                  {
                    label: 'Add feedback',
                    icon: <Star className="h-3.5 w-3.5" />,
                    run: onAddTestimonial,
                  },
                  {
                    label: 'Open inbox',
                    icon: <Mail className="h-3.5 w-3.5" />,
                    run: () => onNavigate('messages'),
                  },
                  {
                    label: 'Haritech suite',
                    icon: <FileText className="h-3.5 w-3.5" />,
                    run: () => onNavigate('haritech'),
                  },
                  {
                    label: 'Project board',
                    icon: <BarChart3 className="h-3.5 w-3.5" />,
                    run: () => onNavigate('projecthub'),
                  },
                  {
                    label: 'Settings',
                    icon: <Settings className="h-3.5 w-3.5" />,
                    run: () => onNavigate('settings'),
                  },
                ].map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.run}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left text-[11px] font-bold text-slate-300 transition-colors hover:border-cyan-400/20 hover:text-white"
                  >
                    <span className="text-cyan-400/80">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {view === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <PanelHeader
                icon={<TrendingUp className="h-4 w-4" />}
                title="Enquiry volume — last 14 days"
                hint={`${series.reduce((total, point) => total + point.value, 0)} enquiries in this period · ${thisWeek} in the last 7 days`}
                actions={<Sparkline data={series.map((point) => point.value)} />}
              />
              <div className="px-5 pb-5 pt-4">
                <ChartBars series={series} />
                <div className="mt-2 flex justify-between text-[9px] font-medium text-slate-600">
                  <span>{series[0]?.label}</span>
                  <span>{series[Math.floor(series.length / 2)]?.label}</span>
                  <span>{series[series.length - 1]?.label}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/[0.04] pt-4 text-[11px]">
                  <span className="text-slate-500">
                    This week <strong className="ml-1 text-white">{thisWeek}</strong>
                  </span>
                  <span className="text-slate-500">
                    Previous week <strong className="ml-1 text-white">{lastWeek}</strong>
                  </span>
                  <span className="text-slate-500">
                    Change{' '}
                    <strong
                      className={cx(
                        'ml-1',
                        thisWeek - lastWeek >= 0 ? 'text-emerald-400' : 'text-red-400'
                      )}
                    >
                      {thisWeek - lastWeek >= 0 ? '+' : ''}
                      {thisWeek - lastWeek}
                    </strong>
                  </span>
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeader icon={<Mail className="h-4 w-4" />} title="Enquiry pipeline" hint="Status of every stored request." />
              <div className="space-y-4 p-5">
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
                  {[
                    { key: 'new', color: '#94a3b8' },
                    { key: 'in_progress', color: '#fbbf24' },
                    { key: 'resolved', color: '#34d399' },
                    { key: 'spam', color: '#f87171' },
                  ].map((status) => {
                    const value = counts[status.key] ?? 0;
                    const width = percent(value, Math.max(1, messages.length));
                    return (
                      <span
                        key={status.key}
                        style={{ width: `${width}%`, backgroundColor: status.color }}
                        title={`${status.key.replace('_', ' ')}: ${value}`}
                      />
                    );
                  })}
                </div>
                <div className="space-y-2.5">
                  {[
                    { key: 'new', label: 'New', color: '#94a3b8' },
                    { key: 'in_progress', label: 'In progress', color: '#fbbf24' },
                    { key: 'resolved', label: 'Resolved', color: '#34d399' },
                    { key: 'spam', label: 'Spam', color: '#f87171' },
                  ].map((status) => {
                    const value = counts[status.key] ?? 0;
                    return (
                      <div key={status.key} className="flex items-center gap-2 text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                        <span className="text-slate-400">{status.label}</span>
                        <span className="ml-auto font-bold tabular-nums text-slate-200">{value}</span>
                        <span className="w-9 text-right text-[10px] tabular-nums text-slate-600">
                          {percent(value, Math.max(1, messages.length))}%
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="border-t border-white/[0.04] pt-3 text-[10px] leading-relaxed text-slate-600">
                  Visitor traffic and page-view analytics are not connected. These figures come only
                  from enquiries stored in Supabase — nothing is estimated.
                </p>
              </div>
            </Panel>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel>
              <PanelHeader
                icon={<FolderOpen className="h-4 w-4" />}
                title="Portfolio mix by category"
                hint={`${projects.length} published ${projects.length === 1 ? 'project' : 'projects'}`}
              />
              {categories.length === 0 ? (
                <EmptyState
                  icon={<FolderOpen className="h-5 w-5" />}
                  title="No project data"
                  body="Add projects to see how your portfolio is distributed."
                />
              ) : (
                <div className="space-y-3 p-5">
                  {categories.map(([category, count]) => (
                    <div key={category}>
                      <div className="mb-1.5 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-300">{category}</span>
                        <span className="tabular-nums text-slate-500">
                          {count} · {percent(count, projects.length)}%
                        </span>
                      </div>
                      <ProgressBar value={count} max={projects.length} />
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel>
              <PanelHeader
                icon={<Star className="h-4 w-4" />}
                title="Client rating distribution"
                hint={
                  testimonials.length
                    ? `${averageRating.toFixed(1)} average from ${testimonials.length} published`
                    : 'No testimonials published'
                }
              />
              {testimonials.length === 0 ? (
                <EmptyState
                  icon={<Star className="h-5 w-5" />}
                  title="No ratings to chart"
                  body="Only real, approved client feedback is used here."
                  action={
                    <button
                      type="button"
                      onClick={onAddTestimonial}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-2 text-[11px] font-bold text-slate-950 hover:bg-cyan-300"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add testimonial
                    </button>
                  }
                />
              ) : (
                <div className="space-y-3 p-5">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = testimonials.filter((item) => item.rating === rating).length;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="w-10 text-[10px] font-bold text-slate-500">{rating} star</span>
                        <div className="flex-1">
                          <ProgressBar value={count} max={testimonials.length} color="#fbbf24" />
                        </div>
                        <span className="w-6 text-right text-[10px] tabular-nums text-slate-500">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {view === 'operations' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Panel>
            <PanelHeader
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Publishing checklist"
              hint={`${checklistDone} of ${checklist.length} complete`}
              actions={<Badge tone={checklistDone === checklist.length ? 'emerald' : 'amber'}>{percent(checklistDone, checklist.length)}%</Badge>}
            />
            <div className="p-5">
              <ProgressBar value={checklistDone} max={checklist.length} color="#34d399" />
              <div className="mt-4 space-y-1">
                {checklist.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onNavigate(item.tab)}
                    className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-2 text-left transition-colors hover:bg-white/[0.02]"
                  >
                    {item.done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400/80" />
                    )}
                    <span
                      className={cx(
                        'flex-1 text-[11px]',
                        item.done ? 'text-slate-500 line-through' : 'text-slate-300'
                      )}
                    >
                      {item.label}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-700" />
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              icon={cloudConfigured ? <Cloud className="h-4 w-4" /> : <CloudOff className="h-4 w-4" />}
              title="Cloud & sync"
              hint="Where your content is actually stored right now."
              actions={
                <button
                  type="button"
                  onClick={onSync}
                  disabled={syncing}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[10px] font-bold text-slate-300 hover:bg-white/5 disabled:opacity-50"
                >
                  <RefreshCw className={cx('h-3 w-3', syncing && 'animate-spin')} /> Sync
                </button>
              }
            />
            <div className="space-y-3 p-5 text-[11px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Database</span>
                <span className={cloudConfigured ? 'font-bold text-emerald-400' : 'font-bold text-amber-400'}>
                  {cloudConfigured ? 'Supabase connected' : 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Owner session</span>
                <span className="max-w-[190px] truncate font-bold text-slate-300" title={sessionEmail ?? undefined}>
                  {sessionEmail ?? 'Signed out'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Last checked</span>
                <span className="font-bold text-slate-300">{formatDateTime(syncedAt.toISOString())}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Enquiries loaded</span>
                <span className="font-bold text-slate-300">{messages.length}</span>
              </div>
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 text-[10px] leading-relaxed text-slate-500">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400/70" />
                <span>
                  Saves made without an owner session stay in this browser only. Sign in before
                  editing so changes reach the live site.
                </span>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              icon={<Database className="h-4 w-4" />}
              title="Content at a glance"
              hint="What is currently served to visitors."
            />
            <div className="divide-y divide-white/[0.04]">
              {[
                { label: 'Projects', value: projects.length, tab: 'projects' },
                { label: 'Testimonials', value: testimonials.length, tab: 'testimonials' },
                { label: 'Enquiries stored', value: messages.length, tab: 'messages' },
                { label: 'CAC applications', value: applications?.total ?? 0, tab: 'haritech' },
              ].map((row) => (
                <button
                  key={row.label}
                  type="button"
                  onClick={() => onNavigate(row.tab)}
                  className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <span className="text-[11px] text-slate-400">{row.label}</span>
                  <span className="flex items-center gap-2 text-[12px] font-bold text-white">
                    {row.value} <Eye className="h-3 w-3 text-slate-600" />
                  </span>
                </button>
              ))}
            </div>
            <div className="p-4">
              <button
                type="button"
                onClick={() => onNavigate('settings')}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.07] py-2 text-[11px] font-bold text-slate-300 hover:bg-white/5"
              >
                <Settings className="h-3.5 w-3.5" /> Open settings
              </button>
            </div>
          </Panel>

          <Panel className="xl:col-span-3">
            <PanelHeader
              icon={<MessageSquare className="h-4 w-4" />}
              title="How this console reports numbers"
              hint="Honest-by-default metrics."
            />
            <div className="grid grid-cols-1 gap-4 p-5 text-[11px] leading-relaxed text-slate-500 sm:grid-cols-3">
              <div>
                <p className="mb-1 font-bold text-slate-300">Enquiries are real</p>
                Every count comes from the <code className="text-cyan-400/80">contact_messages</code>{' '}
                table in your Supabase project, filtered to the dates shown.
              </div>
              <div>
                <p className="mb-1 font-bold text-slate-300">Content is real</p>
                Project, testimonial and application counts are read from the same records visitors
                receive — no sample data is shown.
              </div>
              <div>
                <p className="mb-1 font-bold text-slate-300">No invented traffic</p>
                Visitor and page-view analytics need a provider; until one is connected this console
                leaves those figures out instead of faking them.
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
