import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  Check,
  ChevronRight,
  Command,
  ExternalLink,
  FileText,
  FolderOpen,
  Kanban,
  LayoutDashboard,
  Mail,
  Menu,
  Palette,
  Plus,
  Search,
  Settings,
  Star,
  X,
} from 'lucide-react';
import { getSupabase } from '../utils/supabaseClient';
import type { ProjectData } from '../utils/projects';
import type { Testimonial } from '../utils/testimonials';
import AdminSidebar, { type ConsoleNavGroup } from '../components/admin/console/AdminSidebar';
import CommandPalette, { type PaletteItem } from '../components/admin/console/CommandPalette';
import DashboardOverview from '../components/admin/console/DashboardOverview';
import ProjectsPanel from '../components/admin/console/ProjectsPanel';
import TestimonialsPanel from '../components/admin/console/TestimonialsPanel';
import MessagesPanel from '../components/admin/console/MessagesPanel';
import SettingsPanel from '../components/admin/console/SettingsPanel';
import { ProjectForm, TestimonialForm } from '../components/admin/console/AdminForms';
import { useAdminData } from '../components/admin/console/useAdminData';
import { cx } from '../components/admin/console/ui';
import HaritechContentManager from '../components/admin/HaritechContentManager';
import HaritechServicesManager from '../components/admin/HaritechServicesManager';
import HaritechTeamManager from '../components/admin/HaritechTeamManager';
import HaritechBlogManager from '../components/admin/HaritechBlogManager';
import HaritechCACManager from '../components/admin/HaritechCACManager';
import HaritechCacApplicationsManager from '../components/admin/HaritechCacApplicationsManager';
import HaritechIndustriesManager from '../components/admin/HaritechIndustriesManager';
import HaritechLogoManager from '../components/admin/HaritechLogoManager';
import HaritechContactManager from '../components/admin/HaritechContactManager';
import HaritechFAQManager from '../components/admin/HaritechFAQManager';
import HaritechSolarManager from '../components/admin/HaritechSolarManager';
import HaritechSolarAdvisorManager from '../components/admin/HaritechSolarAdvisorManager';
import HaritechImportationManager from '../components/admin/HaritechImportationManager';
import HaritechProjectManager from '../components/admin/HaritechProjectManager';
import HaritechClientProjectsManager from '../components/admin/HaritechClientProjectsManager';
import HaritechPortalManager from '../components/admin/HaritechPortalManager';
import HaritechEpoxyManager from '../components/admin/HaritechEpoxyManager';
import HaritechWhatWeDoManager from '../components/admin/HaritechWhatWeDoManager';
import HaritechDesignManager from '../components/admin/HaritechDesignManager';

const TABS = [
  'dashboard',
  'projects',
  'projecthub',
  'testimonials',
  'services',
  'haritech',
  'design',
  'messages',
  'settings',
] as const;

type Tab = (typeof TABS)[number];

const isTab = (value: string | null): value is Tab =>
  value !== null && (TABS as readonly string[]).includes(value);

const TAB_LABELS: Record<Tab, string> = {
  dashboard: 'Overview',
  projects: 'Projects',
  projecthub: 'Project board',
  testimonials: 'Testimonials',
  services: 'Services',
  haritech: 'Haritech content',
  design: 'Design system',
  messages: 'Inbox',
  settings: 'Settings',
};

const SECTION_INTROS: Partial<Record<Tab, { title: string; description: string }>> = {
  projecthub: {
    title: 'Project board',
    description:
      'Delivery phases, client assignments and portal access — all in one operating board.',
  },
  haritech: {
    title: 'Haritech content',
    description: 'Every Haritech Exclusive Business page, service and application desk.',
  },
  design: {
    title: 'Design system',
    description: 'Accent colour and typography used across the public site and this console.',
  },
  services: {
    title: 'Services',
    description: 'Service cards shown across the site. Changes publish to every visitor.',
  },
};

const HARITECH_SUBTABS = [
  { id: 'content', label: 'Content' },
  { id: 'services', label: 'Services' },
  { id: 'team', label: 'Team' },
  { id: 'whatwedo', label: 'What we do' },
  { id: 'solar', label: 'Solar energy' },
  { id: 'solaradvisor', label: 'Solar advisor' },
  { id: 'import', label: 'Importation' },
  { id: 'projects', label: 'Projects' },
  { id: 'epoxy', label: 'Epoxy & décor' },
  { id: 'industries', label: 'Industries' },
  { id: 'faq', label: 'FAQ' },
  { id: 'blog', label: 'Blog' },
  { id: 'cac', label: 'CAC info' },
  { id: 'cacapplications', label: 'CAC applications' },
  { id: 'contact', label: 'Contact' },
  { id: 'logo', label: 'Logo' },
] as const;

const SIDEBAR_KEY = 'haritech-admin-sidebar-collapsed';

const AdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: Tab = isTab(tabParam) ? tabParam : 'dashboard';

  const {
    projects,
    testimonials,
    settings,
    logo,
    messages,
    messagesLoading,
    messagesError,
    applications,
    sessionEmail,
    cloudConfigured,
    newMessageCount,
    syncedAt,
    syncing,
    saveProjects,
    saveTestimonials,
    saveSettings,
    saveLogo,
    refreshMessages,
    updateMessageStatus,
    deleteMessages,
    syncNow,
  } = useAdminData();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SIDEBAR_KEY) === 'true';
  });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [haritechSubTab, setHaritechSubTab] = useState<string>('content');
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const toastTimer = useRef<number | null>(null);

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setNotification(null), 5000);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    []
  );

  const setTab = useCallback(
    (tab: string) => {
      const next = new URLSearchParams(searchParams);
      if (tab === 'dashboard') next.delete('tab');
      else next.set('tab', tab);
      setSearchParams(next, { replace: true });
      setMobileSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(SIDEBAR_KEY, String(next));
      } catch {
        /* a layout preference should never break the console */
      }
      return next;
    });
  }, []);

  const openNewProject = useCallback(() => {
    setEditingProject(null);
    setProjectModalOpen(true);
  }, []);

  const openEditProject = useCallback((project: ProjectData) => {
    setEditingProject(project);
    setProjectModalOpen(true);
  }, []);

  const openNewTestimonial = useCallback(() => {
    setEditingTestimonial(null);
    setTestimonialModalOpen(true);
  }, []);

  const openEditTestimonial = useCallback((testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setTestimonialModalOpen(true);
  }, []);

  const handleSaveProject = async (project: ProjectData) => {
    const isEdit = project.id > 0;
    const saved = isEdit
      ? project
      : { ...project, id: Date.now() };
    const updated = isEdit
      ? projects.map((item) => (item.id === project.id ? saved : item))
      : [...projects, saved];
    const pushed = await saveProjects(updated);
    setProjectModalOpen(false);
    setEditingProject(null);
    if (pushed) {
      notify('success', isEdit ? 'Project updated and published.' : 'Project published.');
    } else {
      notify(
        'error',
        'Project saved on this device only — sign in as the site owner so it reaches the live site.'
      );
    }
  };

  const handleDeleteProjects = async (ids: number[]) => {
    const pushed = await saveProjects(projects.filter((project) => !ids.includes(project.id)));
    if (pushed) {
      notify('success', `${ids.length} ${ids.length === 1 ? 'project' : 'projects'} deleted.`);
    } else {
      notify('error', 'Deleted on this device only — sign in as the site owner to remove it everywhere.');
    }
  };

  const handleSaveTestimonial = async (testimonial: Testimonial) => {
    const isEdit = testimonial.id > 0;
    const saved = isEdit ? testimonial : { ...testimonial, id: Date.now() };
    const updated = isEdit
      ? testimonials.map((item) => (item.id === testimonial.id ? saved : item))
      : [...testimonials, saved];
    const pushed = await saveTestimonials(updated);
    setTestimonialModalOpen(false);
    setEditingTestimonial(null);
    if (pushed) {
      notify('success', isEdit ? 'Testimonial updated.' : 'Testimonial published.');
    } else {
      notify(
        'error',
        'Testimonial saved on this device only — sign in as the site owner so visitors see it.'
      );
    }
  };

  const handleDeleteTestimonial = async (id: number): Promise<boolean> => {
    const pushed = await saveTestimonials(testimonials.filter((item) => item.id !== id));
    if (!pushed) {
      notify('error', 'Deleted on this device only — sign in as the site owner to remove it everywhere.');
    }
    return pushed;
  };

  const handleLogout = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
  };

  const navGroups: ConsoleNavGroup[] = useMemo(
    () => [
      {
        label: 'Workspace',
        items: [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'messages', label: 'Inbox', icon: Mail, badge: newMessageCount },
        ],
      },
      {
        label: 'Content',
        items: [
          { id: 'projects', label: 'Projects', icon: FolderOpen },
          { id: 'projecthub', label: 'Project board', icon: Kanban },
          { id: 'testimonials', label: 'Testimonials', icon: Star },
          { id: 'services', label: 'Services', icon: FileText },
        ],
      },
      {
        label: 'Haritech suite',
        items: [
          { id: 'haritech', label: 'Haritech content', icon: Building2 },
          { id: 'design', label: 'Design system', icon: Palette },
        ],
      },
      { label: 'System', items: [{ id: 'settings', label: 'Settings', icon: Settings }] },
    ],
    [newMessageCount]
  );

  const paletteItems: PaletteItem[] = useMemo(() => {
    const navigation: PaletteItem[] = navGroups
      .flatMap((group) => group.items)
      .map((item) => ({
        id: `nav-${item.id}`,
        label: item.label,
        group: 'Navigate',
        hint: 'Open this section',
        run: () => setTab(item.id),
      }));

    const actions: PaletteItem[] = [
      {
        id: 'action-add-project',
        label: 'Add a project',
        group: 'Actions',
        hint: 'Publish a new case study',
        keywords: 'new create portfolio',
        run: openNewProject,
      },
      {
        id: 'action-add-testimonial',
        label: 'Add a testimonial',
        group: 'Actions',
        hint: 'Publish real client feedback',
        keywords: 'new create review',
        run: openNewTestimonial,
      },
      {
        id: 'action-refresh',
        label: 'Refresh enquiries',
        group: 'Actions',
        hint: 'Reload messages from Supabase',
        keywords: 'sync reload inbox',
        run: () => {
          refreshMessages();
          notify('success', 'Refreshing enquiries…');
        },
      },
      {
        id: 'action-sync',
        label: 'Sync content with the cloud',
        group: 'Actions',
        hint: 'Pull the latest published rows',
        keywords: 'cloud supabase update',
        run: () => void syncNow(),
      },
      {
        id: 'action-view-site',
        label: 'Open the live site',
        group: 'Actions',
        hint: 'View the public website',
        keywords: 'preview website',
        run: () => window.open('/', '_blank', 'noopener'),
      },
    ];

    const projectItems: PaletteItem[] = projects.slice(0, 12).map((project) => ({
      id: `project-${project.id}`,
      label: project.title,
      group: 'Projects',
      hint: `${project.category}${project.year ? ` · ${project.year}` : ''}`,
      keywords: `${project.description} ${project.technology.join(' ')}`,
      run: () => openEditProject(project),
    }));

    return [...navigation, ...actions, ...projectItems];
  }, [
    navGroups,
    projects,
    setTab,
    openNewProject,
    openNewTestimonial,
    openEditProject,
    refreshMessages,
    syncNow,
    notify,
  ]);

  const intro = SECTION_INTROS[activeTab];

  return (
    <div className="relative min-h-screen bg-[#050810] text-slate-200">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(900px 380px at 18% -8%, rgba(34,211,238,0.06), transparent 60%), radial-gradient(800px 360px at 92% 4%, rgba(139,92,246,0.05), transparent 60%)',
        }}
      />

      <div className="relative flex min-h-screen">
        <AdminSidebar
          groups={navGroups}
          activeTab={activeTab}
          onSelect={setTab}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          logo={logo}
          cloudConfigured={cloudConfigured}
          sessionEmail={sessionEmail}
          onLogout={() => void handleLogout()}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-[#050810]/85 px-3 backdrop-blur-xl sm:px-5 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-lg border border-white/[0.07] p-2 text-slate-400 transition-colors hover:text-white lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="hidden min-w-0 items-center gap-1.5 text-[11px] sm:flex">
              <span className="text-slate-600">Console</span>
              <ChevronRight className="h-3 w-3 text-slate-700" />
              <span className="truncate font-bold text-slate-300">{TAB_LABELS[activeTab]}</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-slate-500 transition-colors hover:border-white/15 hover:text-slate-200"
                aria-label="Search the console"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden text-[11px] font-semibold md:inline">Search</span>
                <kbd className="hidden items-center gap-0.5 rounded border border-white/10 px-1 py-0.5 text-[9px] font-bold lg:flex">
                  <Command className="h-2.5 w-2.5" />K
                </kbd>
              </button>

              <button
                type="button"
                onClick={() => setTab('messages')}
                className="relative rounded-lg border border-white/[0.07] bg-white/[0.02] p-2 text-slate-400 transition-colors hover:text-white"
                aria-label={`Open inbox, ${newMessageCount} new`}
              >
                <Mail className="h-3.5 w-3.5" />
                {newMessageCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[8px] font-black text-slate-950">
                    {newMessageCount > 9 ? '9+' : newMessageCount}
                  </span>
                )}
              </button>

              {activeTab === 'projects' && (
                <button
                  type="button"
                  onClick={openNewProject}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-400 px-2.5 py-2 text-[11px] font-bold text-slate-950 transition-colors hover:bg-cyan-300"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">New project</span>
                </button>
              )}

              {activeTab === 'testimonials' && (
                <button
                  type="button"
                  onClick={openNewTestimonial}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-400 px-2.5 py-2 text-[11px] font-bold text-slate-950 transition-colors hover:bg-cyan-300"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">New testimonial</span>
                </button>
              )}

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-[11px] font-bold text-slate-400 transition-colors hover:text-white sm:flex"
              >
                <ExternalLink className="h-3.5 w-3.5" /> View site
              </a>
            </div>
          </header>

          <main className="min-w-0 flex-1">
            <div className="mx-auto w-full max-w-[1480px] px-3 py-5 sm:px-5 lg:px-8 lg:py-7">
              {intro && (
                <div className="mb-5">
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {intro.title}
                  </h1>
                  <p className="mt-1 text-xs text-slate-500">{intro.description}</p>
                </div>
              )}

              {activeTab === 'dashboard' && (
                <DashboardOverview
                  projects={projects}
                  testimonials={testimonials}
                  messages={messages}
                  applications={applications}
                  settings={settings}
                  logo={logo}
                  cloudConfigured={cloudConfigured}
                  sessionEmail={sessionEmail}
                  syncing={syncing}
                  syncedAt={syncedAt}
                  onNavigate={setTab}
                  onAddProject={openNewProject}
                  onEditProject={openEditProject}
                  onAddTestimonial={openNewTestimonial}
                  onRefresh={refreshMessages}
                  onSync={() => void syncNow()}
                />
              )}

              {activeTab === 'projects' && (
                <ProjectsPanel
                  projects={projects}
                  onAdd={openNewProject}
                  onEdit={openEditProject}
                  onDelete={handleDeleteProjects}
                  notify={notify}
                />
              )}

              {activeTab === 'projecthub' && (
                <div className="space-y-5">
                  <HaritechProjectManager />
                  <HaritechClientProjectsManager />
                  <HaritechPortalManager />
                </div>
              )}

              {activeTab === 'testimonials' && (
                <TestimonialsPanel
                  testimonials={testimonials}
                  onAdd={openNewTestimonial}
                  onEdit={openEditTestimonial}
                  onDelete={handleDeleteTestimonial}
                  notify={notify}
                />
              )}

              {activeTab === 'services' && <HaritechServicesManager />}

              {activeTab === 'haritech' && (
                <div className="space-y-5">
                  <div className="-mx-1 overflow-x-auto pb-1">
                    <div className="flex min-w-max items-center gap-1 border-b border-white/[0.06] px-1">
                      {HARITECH_SUBTABS.map((subtab) => {
                        const active = haritechSubTab === subtab.id;
                        return (
                          <button
                            key={subtab.id}
                            type="button"
                            onClick={() => setHaritechSubTab(subtab.id)}
                            aria-pressed={active}
                            className={cx(
                              'relative whitespace-nowrap px-3 py-2.5 text-[11px] font-bold transition-colors',
                              active ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                            )}
                          >
                            {subtab.label}
                            {active && (
                              <span className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-cyan-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {haritechSubTab === 'content' && <HaritechContentManager />}
                  {haritechSubTab === 'services' && <HaritechServicesManager />}
                  {haritechSubTab === 'team' && <HaritechTeamManager />}
                  {haritechSubTab === 'whatwedo' && <HaritechWhatWeDoManager />}
                  {haritechSubTab === 'solar' && <HaritechSolarManager />}
                  {haritechSubTab === 'solaradvisor' && <HaritechSolarAdvisorManager />}
                  {haritechSubTab === 'import' && <HaritechImportationManager />}
                  {haritechSubTab === 'projects' && (
                    <div className="space-y-5">
                      <HaritechProjectManager />
                      <HaritechClientProjectsManager />
                    </div>
                  )}
                  {haritechSubTab === 'epoxy' && <HaritechEpoxyManager />}
                  {haritechSubTab === 'industries' && <HaritechIndustriesManager />}
                  {haritechSubTab === 'faq' && <HaritechFAQManager />}
                  {haritechSubTab === 'blog' && <HaritechBlogManager />}
                  {haritechSubTab === 'cac' && <HaritechCACManager />}
                  {haritechSubTab === 'cacapplications' && <HaritechCacApplicationsManager />}
                  {haritechSubTab === 'contact' && <HaritechContactManager />}
                  {haritechSubTab === 'logo' && <HaritechLogoManager />}
                </div>
              )}

              {activeTab === 'design' && <HaritechDesignManager />}

              {activeTab === 'messages' && (
                <MessagesPanel
                  messages={messages}
                  loading={messagesLoading}
                  error={messagesError}
                  onRefresh={refreshMessages}
                  onUpdateStatus={updateMessageStatus}
                  onDelete={deleteMessages}
                  notify={notify}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsPanel
                  settings={settings}
                  logo={logo}
                  cloudConfigured={cloudConfigured}
                  sessionEmail={sessionEmail}
                  onSaveSettings={saveSettings}
                  onSaveLogo={saveLogo}
                  notify={notify}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={paletteItems} />

      {projectModalOpen && (
        <div
          className="fixed inset-0 z-[75] flex items-start justify-center overflow-y-auto bg-[#03060d]/85 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={editingProject ? 'Edit project' : 'New project'}
          onClick={() => {
            setProjectModalOpen(false);
            setEditingProject(null);
          }}
        >
          <div
            className="w-full max-w-3xl rounded-xl border border-white/10 bg-[#080d18] p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black tracking-tight text-white">
                  {editingProject ? 'Edit project' : 'New project'}
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Published immediately to the portfolio and cloud copy.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProjectModalOpen(false);
                  setEditingProject(null);
                }}
                className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"
                aria-label="Close project form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ProjectForm
              key={editingProject?.id ?? 'new'}
              project={editingProject}
              onSave={(project) => void handleSaveProject(project)}
              onCancel={() => {
                setProjectModalOpen(false);
                setEditingProject(null);
              }}
              notify={notify}
            />
          </div>
        </div>
      )}

      {testimonialModalOpen && (
        <div
          className="fixed inset-0 z-[75] flex items-start justify-center overflow-y-auto bg-[#03060d]/85 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={editingTestimonial ? 'Edit testimonial' : 'New testimonial'}
          onClick={() => {
            setTestimonialModalOpen(false);
            setEditingTestimonial(null);
          }}
        >
          <div
            className="w-full max-w-xl rounded-xl border border-white/10 bg-[#080d18] p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black tracking-tight text-white">
                  {editingTestimonial ? 'Edit testimonial' : 'New testimonial'}
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Use only feedback the client gave you permission to publish.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTestimonialModalOpen(false);
                  setEditingTestimonial(null);
                }}
                className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"
                aria-label="Close testimonial form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <TestimonialForm
              key={editingTestimonial?.id ?? 'new'}
              testimonial={editingTestimonial}
              onSave={(testimonial) => void handleSaveTestimonial(testimonial)}
              onCancel={() => {
                setTestimonialModalOpen(false);
                setEditingTestimonial(null);
              }}
              notify={notify}
            />
          </div>
        </div>
      )}

      {notification && (
        <div
          role="status"
          className={cx(
            'fixed bottom-4 right-4 z-[95] flex max-w-sm items-start gap-2.5 rounded-lg border p-3.5 shadow-2xl backdrop-blur-xl',
            notification.type === 'success'
              ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'
              : 'border-red-400/25 bg-red-400/10 text-red-200'
          )}
        >
          {notification.type === 'success' ? (
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          )}
          <p className="text-[11px] font-semibold leading-relaxed">{notification.message}</p>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="ml-1 rounded p-0.5 text-current/70 hover:text-current"
            aria-label="Dismiss notification"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
