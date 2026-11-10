import React from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  ExternalLink,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react';
import { cx } from './ui';

export interface ConsoleNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export interface ConsoleNavGroup {
  label: string;
  items: ConsoleNavItem[];
}

const AdminSidebar: React.FC<{
  groups: ConsoleNavGroup[];
  activeTab: string;
  onSelect: (id: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  logo: string;
  cloudConfigured: boolean;
  sessionEmail: string | null;
  onLogout: () => void;
}> = ({
  groups,
  activeTab,
  onSelect,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
  logo,
  cloudConfigured,
  sessionEmail,
  onLogout,
}) => (
  <>
    {mobileOpen && (
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        onClick={onCloseMobile}
        aria-hidden="true"
      />
    )}

    <aside
      className={cx(
        'fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-white/[0.06] bg-[#050810] transition-[transform,width] duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        collapsed ? 'lg:w-[78px]' : 'lg:w-[272px]'
      )}
      aria-label="Admin navigation"
    >
      <div
        className={cx(
          'flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.06] px-4',
          collapsed && 'lg:justify-center lg:px-0'
        )}
      >
        <Link
          to="/"
          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-cyan-400/20 bg-gradient-to-br from-cyan-400/20 to-violet-500/20"
          title="HARITECH home"
        >
          {logo ? (
            <img src={logo} alt="HARITECH" className="h-full w-full object-contain p-1" />
          ) : (
            <Code2 className="h-4.5 w-4.5 text-cyan-300" />
          )}
        </Link>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-[13px] font-black tracking-[0.16em] text-white">
              HARITECH
            </p>
            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-600">
              Control Console
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={onCloseMobile}
          className="ml-auto rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.label}>
            <p
              className={cx(
                'mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-700',
                collapsed && 'lg:hidden'
              )}
            >
              {group.label}
            </p>
            {collapsed && <div className="mx-3 mb-2 hidden h-px bg-white/[0.06] lg:block" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={cx(
                      'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12.5px] font-semibold transition-colors',
                      active
                        ? 'bg-white/[0.06] text-white'
                        : 'text-slate-500 hover:bg-white/[0.025] hover:text-slate-200',
                      collapsed && 'lg:justify-center lg:px-0'
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-cyan-400" />
                    )}
                    <item.icon
                      className={cx(
                        'h-4 w-4 shrink-0 transition-colors',
                        active ? 'text-cyan-300' : 'text-slate-600 group-hover:text-slate-300'
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && typeof item.badge === 'number' && item.badge > 0 && (
                      <span
                        className={cx(
                          'ml-auto rounded-md border px-1.5 py-0.5 text-[9px] font-bold tabular-nums',
                          active
                            ? 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300'
                            : 'border-amber-400/20 bg-amber-400/10 text-amber-300'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {collapsed && typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="absolute right-2 top-2 hidden h-1.5 w-1.5 rounded-full bg-amber-400 lg:block" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={cx('shrink-0 border-t border-white/[0.06] p-3', collapsed && 'lg:px-2')}>
        {!collapsed && (
          <div className="mb-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2">
              <span
                className={cx(
                  'h-1.5 w-1.5 rounded-full',
                  cloudConfigured ? 'bg-emerald-400' : 'bg-amber-400'
                )}
              />
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {cloudConfigured ? 'Cloud connected' : 'Local only'}
              </p>
            </div>
            <p className="mt-1.5 truncate text-[10px] text-slate-600" title={sessionEmail ?? undefined}>
              {sessionEmail ?? 'No owner session'}
            </p>
            <Link
              to="/"
              className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-cyan-400/80 hover:text-cyan-300"
            >
              <ExternalLink className="h-3 w-3" /> Open live site
            </Link>
          </div>
        )}

        <div className={cx('flex items-center gap-2', collapsed && 'lg:flex-col')}>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[11px] font-black text-slate-300">
              {(sessionEmail ?? 'A').charAt(0).toUpperCase()}
            </span>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-slate-300">Site owner</p>
                <p className="flex items-center gap-1 text-[9px] text-emerald-400/80">
                  <ShieldCheck className="h-2.5 w-2.5" /> Signed in
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-md border border-white/[0.07] p-2 text-slate-500 transition-colors hover:border-red-500/25 hover:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapsed}
            title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            className="hidden rounded-md border border-white/[0.07] p-2 text-slate-500 transition-colors hover:text-white lg:block"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {collapsed && (
          <div className="mt-2 hidden justify-center lg:flex">
            <Database className="h-3.5 w-3.5 text-slate-700" />
          </div>
        )}
      </div>
    </aside>
  </>
);

export default AdminSidebar;
