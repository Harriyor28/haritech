import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, MessageSquare, Settings, Plus, Edit, Trash2, Eye, Search, Save, X, Check, AlertCircle, BarChart3, FileText, Code2, TrendingUp, Activity, ArrowUpRight, Upload, Image as ImageIcon, Building2, Menu, LogOut } from 'lucide-react';
import { getStoredProjects, setStoredProjects } from '../utils/projects';
import type { ProjectData } from '../utils/projects';
import { getStoredBrandLogo, setStoredBrandLogo } from '../utils/brand';
import { getStoredSettings, setStoredSettings } from '../utils/settings';
import type { SiteSettings } from '../utils/settings';
import { getStoredTestimonials, setStoredTestimonials } from '../utils/testimonials';
import { getSupabase, isCloudConfigured } from '../utils/supabaseClient';
import type { Testimonial } from '../utils/testimonials';
import HaritechContentManager from '../components/admin/HaritechContentManager';
import HaritechServicesManager from '../components/admin/HaritechServicesManager';
import HaritechTeamManager from '../components/admin/HaritechTeamManager';
import HaritechBlogManager from '../components/admin/HaritechBlogManager';
import HaritechCACManager from '../components/admin/HaritechCACManager';
import HaritechIndustriesManager from '../components/admin/HaritechIndustriesManager';
import HaritechLogoManager from '../components/admin/HaritechLogoManager';
import HaritechContactManager from '../components/admin/HaritechContactManager';
import HaritechFAQManager from '../components/admin/HaritechFAQManager';
import HaritechSolarManager from '../components/admin/HaritechSolarManager';
import HaritechWhatWeDoManager from '../components/admin/HaritechWhatWeDoManager';

type Tab = 'dashboard' | 'projects' | 'testimonials' | 'services' | 'settings' | 'haritech';

// Mini SVG Chart Component
const MiniChart: React.FC<{ data: number[]; color: string; height?: number }> = ({ data, color, height = 40 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 120;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#grad-${color})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const AdminDashboard: React.FC = () => {
  console.log('AdminDashboard RENDERED');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [projects, setProjects] = useState<ProjectData[]>(() => getStoredProjects());
  const [isEditing, setIsEditing] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

const handleLogout = async () => {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
};
  const [logoUrl, setLogoUrl] = useState<string>(() => getStoredBrandLogo());
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(() => getStoredSettings());
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => getStoredTestimonials());
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [haritechSubTab, setHaritechSubTab] = useState('content');

  useEffect(() => {
    setLogoUrl(getStoredBrandLogo());
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteTestimonial = (id: number) => {
    const updated = testimonials.filter(t => t.id !== id);
    setTestimonials(updated);
    setStoredTestimonials(updated);
    showNotification('success', 'Testimonial deleted successfully');
  };

  const handleSaveTestimonial = (t: Testimonial) => {
    let updated: Testimonial[];
    if (editingTestimonial) {
      updated = testimonials.map(item => item.id === t.id ? t : item);
      showNotification('success', 'Testimonial updated successfully');
    } else {
      updated = [...testimonials, { ...t, id: Date.now() }];
      showNotification('success', 'Testimonial added successfully');
    }
    setTestimonials(updated);
    setStoredTestimonials(updated);
    setEditingTestimonial(null);
    setIsAddingTestimonial(false);
  };

  const persistProjects = (updated: ProjectData[]) => {
    setProjects(updated);
    setStoredProjects(updated);
  };

  const handleDeleteProject = (id: number) => {
    persistProjects(projects.filter(p => p.id !== id));
    showNotification('success', 'Project deleted successfully');
  };

  const handleSaveProject = (project: any) => {
    let updated: ProjectData[];
    if (editingProject) {
      updated = projects.map(p => p.id === editingProject.id ? { ...project, id: editingProject.id } : p);
      showNotification('success', 'Project updated successfully');
    } else {
      updated = [...projects, { ...project, id: Date.now() }];
      showNotification('success', 'Project added successfully');
    }
    persistProjects(updated);
    setIsEditing(false);
    setEditingProject(null);
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderOpen, color: 'from-cyan-500 to-blue-600', trend: '+12%', chartData: [3, 5, 4, 7, 6, 8, projects.length], chartColor: '#06b6d4' },
    { label: 'Categories', value: new Set(projects.map(p => p.category)).size, icon: BarChart3, color: 'from-emerald-500 to-teal-600', trend: '+8%', chartData: [2, 3, 3, 4, 5, 5, new Set(projects.map(p => p.category)).size], chartColor: '#10b981' },
    { label: 'Testimonials', value: 12, icon: MessageSquare, color: 'from-purple-500 to-violet-600', trend: '+24%', chartData: [4, 6, 5, 8, 9, 10, 12], chartColor: '#8b5cf6' },
    { label: 'Active Services', value: 16, icon: FileText, color: 'from-orange-500 to-pink-600', trend: '+5%', chartData: [8, 10, 12, 11, 14, 15, 16], chartColor: '#f97316' }
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'services', label: 'Services', icon: Settings },
    { id: 'haritech', label: 'Haritech', icon: Building2 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#070a13] text-white">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-[60] px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl border ${
              notification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {notification.type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="text-sm font-bold">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Mobile Sidebar Backdrop */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'} w-72 bg-[#0a0e1a] min-h-screen p-6 fixed border-r border-white/5 transition-all duration-300 z-50 lg:z-40 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} overflow-y-auto`}>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-white font-bold text-lg tracking-tight">HARITECH</h1>
                  <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em] font-mono">Admin Console</p>
                </div>
              )}
            </div>
            <button onClick={() => setMobileSidebarOpen(false)} className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-colors" aria-label="Close sidebar">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as Tab); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/5 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && item.label}
              </button>
            ))}
          </nav>

          {!sidebarCollapsed && (
            <div className="absolute bottom-6 left-6 right-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border border-white/5">
                <p className="text-xs text-slate-500 font-mono mb-2">System Status</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-bold">All Systems Operational</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className={`${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'} flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 min-w-0`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-10 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2.5 bg-slate-900/50 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight truncate">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 font-mono">Manage your portfolio content and configuration</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-2.5 bg-slate-900/50 border border-white/5 rounded-xl text-slate-500 hover:text-white hover:border-white/10 transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
              </button>
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2.5 text-slate-400 hover:text-cyan-400 transition-colors border border-white/5 hover:border-cyan-500/20 rounded-xl text-sm bg-slate-900/30"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">View Site</span>
              </Link>
              {isCloudConfigured() && (
                <button
                  onClick={handleLogout}
                  className="p-2.5 bg-slate-900/50 border border-white/5 rounded-xl text-slate-500 hover:text-red-400 hover:border-red-500/20 transition-all"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                  >
                    <div className="card p-6 bg-[#0e1326]/80 border-white/5 hover:border-cyan-500/15 transition-all glow-border relative overflow-hidden">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                          <stat.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3" />
                          {stat.trend}
                        </span>
                      </div>
                      <h3 className="text-3xl font-black text-white mb-1">{stat.value}</h3>
                      <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">{stat.label}</p>
                      <div className="mt-4 opacity-60">
                        <MiniChart data={stat.chartData} color={stat.chartColor} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Activity & Recent Projects */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-6 bg-[#0e1326]/80 border-white/5 glow-border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Activity className="h-4 w-4 text-cyan-400" /> Recent Projects
                    </h3>
                    <button onClick={() => setActiveTab('projects')} className="text-xs text-cyan-400 hover:text-cyan-300 font-bold">View All →</button>
                  </div>
                  <div className="space-y-3">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex items-center gap-4 p-4 bg-slate-950/40 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                        <img src={project.image} alt={project.title} className="w-14 h-14 rounded-xl object-cover border border-white/5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors truncate">{project.title}</h4>
                          <p className="text-xs text-slate-500 font-mono">{project.category}</p>
                        </div>
                        <span className="text-xs text-slate-600 font-mono flex-shrink-0">{project.year}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats Sidebar */}
                <div className="card p-6 bg-[#0e1326]/80 border-white/5 glow-border">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-400" /> Quick Stats
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Site Visitors', value: '2.4K', trend: '+18%', color: 'text-cyan-400' },
                      { label: 'Page Views', value: '8.1K', trend: '+32%', color: 'text-purple-400' },
                      { label: 'Bounce Rate', value: '24%', trend: '-8%', color: 'text-emerald-400' },
                      { label: 'Avg. Session', value: '3m 42s', trend: '+12%', color: 'text-orange-400' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-white/5">
                        <div>
                          <p className="text-xs text-slate-500 font-mono">{item.label}</p>
                          <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{item.trend}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-3 bg-slate-950/60 rounded-xl border border-white/5 focus:border-cyan-500/50 outline-none text-sm text-white"
                >
                  {['All', 'Business', 'Restaurant', 'School', 'Hospital', 'Hotel', 'Church', 'E-commerce', 'Corporate'].map(cat => (
                    <option key={cat} value={cat} className="bg-[#0e1326]">{cat}</option>
                  ))}
                </select>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setIsEditing(true); setEditingProject(null); }}
                  className="flex items-center gap-2 px-6 py-3 btn-primary rounded-xl text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Project
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="card bg-[#0e1326]/80 border-white/5 hover:border-cyan-500/15 overflow-hidden transition-all glow-border"
                    >
                      <div className="relative">
                        <img src={project.image} alt={project.title} className="w-full h-44 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1326] to-transparent opacity-60" />
                      </div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-white text-sm">{project.title}</h3>
                          <span className="px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-[10px] text-cyan-400 font-bold uppercase">{project.category}</span>
                        </div>
                        <p className="text-slate-500 text-xs mb-5 line-clamp-2">{project.description}</p>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { setIsEditing(true); setEditingProject(project); }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-white transition-all text-xs font-bold border border-cyan-500/20 hover:border-transparent"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleDeleteProject(project.id)}
                            className="px-4 py-2.5 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Testimonials Tab */}
          {activeTab === 'testimonials' && (
            <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border">
              <h3 className="text-xl font-bold mb-6 text-white">Manage Testimonials</h3>
              <p className="text-slate-400 text-sm mb-8">Add, edit, or remove client testimonials from your portfolio.</p>
              <div className="space-y-3">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="flex items-center gap-4 p-4 bg-slate-950/40 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">{testimonial.company}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-500 text-sm">{'\u2605'}</span>
                      ))}
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingTestimonial(testimonial)} className="p-2 text-slate-600 hover:text-cyan-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Edit className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDeleteTestimonial(testimonial.id)} className="p-2 text-slate-600 hover:text-red-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setEditingTestimonial(null); setIsAddingTestimonial(true); }}
                className="mt-6 flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Testimonial
              </motion.button>
            </div>
          )}

          {/* Testimonial Edit Modal */}
          <AnimatePresence>
            {(editingTestimonial || isAddingTestimonial) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                onClick={() => { setEditingTestimonial(null); setIsAddingTestimonial(false); }}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-[#0e1326] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-white">{editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
                    <button onClick={() => { setEditingTestimonial(null); setIsAddingTestimonial(false); }} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white border border-white/5">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <TestimonialForm
                    testimonial={editingTestimonial}
                    onSave={handleSaveTestimonial}
                    onCancel={() => { setEditingTestimonial(null); setIsAddingTestimonial(false); }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border">
              <h3 className="text-xl font-bold mb-6 text-white">Manage Services</h3>
              <p className="text-slate-400 text-sm mb-8">Update your service offerings and descriptions.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Website Design', 'Business Websites', 'E-commerce Stores', 'School Systems', 'Hospital Systems', 'Hotel Platforms', 'Church Websites', 'Custom Web Apps'].map((service, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-slate-950/40 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-sm">{service}</h4>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-600 hover:text-cyan-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Edit className="h-3.5 w-3.5" /></button>
                      <button className="p-2 text-slate-600 hover:text-red-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Haritech Tab */}
          {activeTab === 'haritech' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Haritech Management</h1>
                <p className="text-slate-500 text-sm mt-1 font-mono">Manage all Haritech Exclusive Services content</p>
              </div>

              {/* Sub-tabs */}
              <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
                {[
                  { id: 'content', label: 'Content' },
                  { id: 'services', label: 'Services' },
                  { id: 'team', label: 'Team' },
                  { id: 'whatwedo', label: 'What We Do' },
                  { id: 'solar', label: 'Solar Energy' },
                  { id: 'industries', label: 'Industries' },
                  { id: 'faq', label: 'FAQ' },
                  { id: 'blog', label: 'Blog' },
                  { id: 'cac', label: 'CAC Info' },
                  { id: 'contact', label: 'Contact' },
                  { id: 'logo', label: 'Logo' },
                ].map(sub => (
                  <button key={sub.id} onClick={() => setHaritechSubTab(sub.id)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${haritechSubTab === sub.id ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white bg-[#0e1326]/50 border border-white/5 hover:border-white/10'}`}>
                    {sub.label}
                  </button>
                ))}
              </div>

              {haritechSubTab === 'content' && <HaritechContentManager />}
              {haritechSubTab === 'services' && <HaritechServicesManager />}
              {haritechSubTab === 'team' && <HaritechTeamManager />}
              {haritechSubTab === 'whatwedo' && <HaritechWhatWeDoManager />}
              {haritechSubTab === 'solar' && <HaritechSolarManager />}
              {haritechSubTab === 'industries' && <HaritechIndustriesManager />}
              {haritechSubTab === 'faq' && <HaritechFAQManager />}
              {haritechSubTab === 'blog' && <HaritechBlogManager />}
              {haritechSubTab === 'cac' && <HaritechCACManager />}
              {haritechSubTab === 'contact' && <HaritechContactManager />}
              {haritechSubTab === 'logo' && <HaritechLogoManager />}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              {/* Logo & Brand Identity Card */}
              <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-cyan-400" /> Logo & Brand Identity
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">Upload or change the primary website logo, dark/light variations, and brand emblem.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Current Logo Preview Box */}
                  <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Active Logo Preview</p>
                    
                    <div className="w-full h-32 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center p-4 relative overflow-hidden group">
                      {logoPreview || logoUrl ? (
                        <img src={logoPreview || logoUrl} alt="Website Logo" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-md">
                            <Code2 className="h-7 w-7 text-white" />
                          </div>
                          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            HARITECH
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 font-mono mt-4">Recommended format: PNG, SVG, or WebP (transparent background)</p>
                  </div>

                  {/* Logo Upload Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                        Upload New Logo File
                      </label>
                      <div className="relative border-2 border-dashed border-white/10 hover:border-cyan-500/40 rounded-xl p-6 text-center transition-all bg-slate-950/30 cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setLogoPreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <Upload className="h-8 w-8 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-xs text-slate-300 font-medium">Click or drag & drop image file</p>
                        <p className="text-[10px] text-slate-500 mt-1">SVG, PNG, JPG up to 5MB</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                        Or Enter Logo Image URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={logoUrl}
                        onChange={(e) => {
                          setLogoUrl(e.target.value);
                          setLogoPreview(null);
                        }}
                        className="w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const logo = logoPreview || logoUrl;
                          if (!logo) {
                            showNotification('error', 'Choose a logo file or enter an image URL first');
                            return;
                          }

                          setStoredBrandLogo(logo);
                          setLogoUrl(logo);
                          setLogoPreview(null);
                          showNotification('success', 'Logo updated successfully!');
                        }}
                        className="flex-1 btn-primary py-2.5 px-4 rounded-xl text-xs font-bold"
                      >
                        <Save className="h-4 w-4" /> Save Logo
                      </motion.button>
                      
                      {(logoPreview || logoUrl) && (
                        <button
                          onClick={() => {
                            setLogoPreview(null);
                            setLogoUrl('');
                            setStoredBrandLogo('');
                          }}
                          className="px-4 py-2.5 border border-white/10 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* General Configuration */}
              <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border">
                <h3 className="text-xl font-bold mb-6 text-white">General Configuration</h3>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Company Name</label>
                  <input type="text" value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} className="w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Tagline</label>
                  <input type="text" value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className="w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Contact Email</label>
                  <input type="email" value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} className="w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Phone Number</label>
                  <input type="tel" value={settings.phoneNumber} onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })} className="w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">WhatsApp Number</label>
                  <input type="tel" value={settings.whatsappNumber} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} className="w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Address</label>
                  <input type="text" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setStoredSettings(settings);
                    window.dispatchEvent(new Event('haritech-settings-updated'));
                    showNotification('success', 'Configuration saved successfully!');
                  }}
                  className="flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm"
                >
                  <Save className="h-4 w-4" />
                  Save Configuration
                </motion.button>
              </div>
            </div>
            </div>
          )}
        </main>
      </div>

      {/* Project Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#0e1326] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white border border-white/5">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <ProjectForm
                project={editingProject}
                onSave={handleSaveProject}
                onCancel={() => setIsEditing(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProjectForm: React.FC<{ project: any; onSave: (p: any) => void; onCancel: () => void }> = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState(project || {
    title: '',
    category: 'Business',
    description: '',
    image: '',
    tags: [],
    year: new Date().getFullYear().toString(),
    liveDemo: '',
    challenges: '',
    solutions: '',
    features: [''],
    technology: [''],
    metrics: { loadTime: '1.5s', performanceScore: 95, mobileScore: 98 }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
  const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClass}>Project Title *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={inputClass}
          placeholder="Elegant Bistro"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className={`${inputClass} bg-slate-950/60`}
          >
            {['Business', 'Restaurant', 'School', 'Hospital', 'Hotel', 'Church', 'E-commerce', 'Corporate', 'Real Estate', 'Portfolio'].map(cat => (
              <option key={cat} value={cat} className="bg-[#0e1326] text-white">{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Year</label>
          <input
            type="text"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      
      <div>
        <label className={labelClass}>Description *</label>
        <textarea
          required
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={`${inputClass} resize-none`}
          placeholder="A modern restaurant website..."
        />
      </div>
      
      <div>
        <label className={labelClass}>Image URL *</label>
        <input
          type="url"
          required
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className={inputClass}
          placeholder="https://..."
        />
      </div>
      
      <div>
        <label className={labelClass}>Live Demo URL</label>
        <input
          type="url"
          value={formData.liveDemo}
          onChange={(e) => setFormData({ ...formData, liveDemo: e.target.value })}
          className={inputClass}
          placeholder="https://..."
        />
      </div>
      
      <div>
        <label className={labelClass}>Technologies (comma-separated)</label>
        <input
          type="text"
          value={formData.technology.join(', ')}
          onChange={(e) => setFormData({ ...formData, technology: e.target.value.split(',').map((t: string) => t.trim()) })}
          className={inputClass}
          placeholder="React, Node.js, MongoDB"
        />
      </div>
      
      <div>
        <label className={labelClass}>Tags (comma-separated)</label>
        <input
          type="text"
          value={formData.tags.join(', ')}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map((t: string) => t.trim()) })}
          className={inputClass}
          placeholder="Modern, Responsive, Fast"
        />
      </div>
      
      <div className="flex gap-4 pt-4">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 btn-primary px-6 py-3 rounded-xl text-sm"
        >
          <Save className="h-4 w-4" />
          {project ? 'Update Project' : 'Add Project'}
        </motion.button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-sm text-slate-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const TestimonialForm: React.FC<{ testimonial: Testimonial | null; onSave: (t: Testimonial) => void; onCancel: () => void }> = ({ testimonial, onSave, onCancel }) => {
  const [formData, setFormData] = useState(testimonial || {
    id: 0, name: '', company: '', position: '', content: '', rating: 5, image: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Testimonial);
  };

  const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
  const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Name *</label>
        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="John Anderson" />
      </div>
      <div>
        <label className={labelClass}>Company *</label>
        <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className={inputClass} placeholder="TechFlow Solutions" />
      </div>
      <div>
        <label className={labelClass}>Position</label>
        <input type="text" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className={inputClass} placeholder="CEO &amp; Founder" />
      </div>
      <div>
        <label className={labelClass}>Testimonial *</label>
        <textarea required rows={4} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className={`${inputClass} resize-none`} placeholder="Working with HARITECH was..." />
      </div>
      <div>
        <label className={labelClass}>Image URL</label>
        <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className={inputClass} placeholder="https://..." />
      </div>
      <div>
        <label className={labelClass}>Rating</label>
        <select value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })} className={`${inputClass} bg-slate-950/60`}>
          {[5, 4, 3, 2, 1].map(r => <option key={r} value={r} className="bg-[#0e1326]">{r} Star{r > 1 ? 's' : ''}</option>)}
        </select>
      </div>
      <div className="flex gap-4 pt-4">
        <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 btn-primary px-6 py-3 rounded-xl text-sm">
          <Save className="h-4 w-4" />
          {testimonial ? 'Update' : 'Add'} Testimonial
        </motion.button>
        <button type="button" onClick={onCancel} className="px-6 py-3 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-sm text-slate-400">Cancel</button>
      </div>
    </form>
  );
};

export default AdminDashboard;