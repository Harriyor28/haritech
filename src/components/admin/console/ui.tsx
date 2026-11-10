import React, { useId } from 'react';
import { AlertCircle, X } from 'lucide-react';

export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

export const adminInput =
  'w-full px-3.5 py-2.5 bg-[#060a14] rounded-lg border border-white/[0.07] focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 outline-none text-sm text-white placeholder:text-slate-600 transition-colors';

export const adminLabel =
  'block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-[0.14em]';

export type Tone = 'neutral' | 'cyan' | 'emerald' | 'amber' | 'red' | 'violet';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-white/[0.04] text-slate-300 border-white/10',
  cyan: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',
  emerald: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  amber: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
  red: 'bg-red-400/10 text-red-300 border-red-400/20',
  violet: 'bg-violet-400/10 text-violet-300 border-violet-400/20',
};

export const Badge: React.FC<{
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}> = ({ children, tone = 'neutral', dot = false, className }) => (
  <span
    className={cx(
      'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap',
      toneClasses[tone],
      className
    )}
  >
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
    {children}
  </span>
);

export const SectionLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <p className={cx('text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600', className)}>
    {children}
  </p>
);

export const Panel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={cx(
      'rounded-xl border border-white/[0.06] bg-[#080d18] shadow-[0_24px_70px_-40px_rgba(0,0,0,0.9)]',
      className
    )}
  >
    {children}
  </div>
);

export const PanelHeader: React.FC<{
  title: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}> = ({ title, hint, icon, actions, className }) => (
  <div
    className={cx(
      'flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.05] px-5 py-4',
      className
    )}
  >
    <div className="flex items-start gap-3 min-w-0">
      {icon && (
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-cyan-300">
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
        {hint && <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{hint}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

const accentClasses = {
  cyan: 'from-cyan-400/20 to-cyan-400/0 text-cyan-300 border-cyan-400/20',
  emerald: 'from-emerald-400/20 to-emerald-400/0 text-emerald-300 border-emerald-400/20',
  violet: 'from-violet-400/20 to-violet-400/0 text-violet-300 border-violet-400/20',
  amber: 'from-amber-400/20 to-amber-400/0 text-amber-300 border-amber-400/20',
};

export const StatTile: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ReactNode;
  accent?: keyof typeof accentClasses;
  trend?: { value: string; positive: boolean };
  onSelect?: () => void;
}> = ({ label, value, hint, icon, accent = 'cyan', trend, onSelect }) => {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cx(
            'flex h-9 w-9 items-center justify-center rounded-lg border bg-gradient-to-br',
            accentClasses[accent]
          )}
        >
          {icon}
        </span>
        {trend && (
          <span
            className={cx(
              'rounded-md border px-1.5 py-0.5 text-[10px] font-bold',
              trend.positive
                ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                : 'border-white/10 bg-white/[0.03] text-slate-400'
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-5 text-[26px] font-black leading-none tracking-tight text-white">{value}</p>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      {hint && <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{hint}</p>}
    </>
  );

  const base =
    'group w-full rounded-xl border border-white/[0.06] bg-[#080d18] p-4 text-left transition-colors';

  return onSelect ? (
    <button
      type="button"
      onClick={onSelect}
      className={cx(base, 'hover:border-cyan-400/20 hover:bg-[#0b1220]')}
    >
      {inner}
    </button>
  ) : (
    <div className={base}>{inner}</div>
  );
};

export const Segmented: React.FC<{
  options: Array<{ value: string; label: string; count?: number }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
}> = ({ options, value, onChange, className, ariaLabel }) => (
  <div
    role="tablist"
    aria-label={ariaLabel}
    className={cx(
      'inline-flex flex-wrap items-center gap-1 rounded-lg border border-white/[0.07] bg-[#060a14] p-1',
      className
    )}
  >
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(option.value)}
          className={cx(
            'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-bold transition-colors',
            active
              ? 'bg-white/[0.09] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-200'
          )}
        >
          {option.label}
          {typeof option.count === 'number' && (
            <span
              className={cx(
                'rounded px-1 text-[9px] font-bold tabular-nums',
                active ? 'bg-cyan-400/15 text-cyan-300' : 'bg-white/[0.04] text-slate-500'
              )}
            >
              {option.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export const Sparkline: React.FC<{
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}> = ({ data, color = '#22d3ee', width = 120, height = 34 }) => {
  const gradientId = useId().replace(/:/g, '');
  const series = data.length > 1 ? data : [0, 0];
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const points = series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <linearGradient id={`spark-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${points} ${width},${height}`} fill={`url(#spark-${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon, title, body, action, className }) => (
  <div className={cx('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-slate-500">
      {icon}
    </div>
    <p className="text-sm font-bold text-slate-300">{title}</p>
    {body && <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">{body}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const ToolbarButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  title?: string;
  ariaLabel?: string;
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, active = false, title, ariaLabel, type = 'button', className, disabled }) => (
  <button
    type={type}
    onClick={onClick}
    title={title}
    aria-label={ariaLabel}
    aria-pressed={active}
    disabled={disabled}
    className={cx(
      'inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
      active
        ? 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300'
        : 'border-white/[0.07] bg-white/[0.02] text-slate-400 hover:border-white/15 hover:text-white',
      className
    )}
  >
    {children}
  </button>
);

export const ProgressBar: React.FC<{
  value: number;
  max: number;
  color?: string;
  height?: string;
}> = ({ value, max, color = '#22d3ee', height = 'h-1.5' }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={cx('w-full overflow-hidden rounded-full bg-white/[0.05]', height)}>
      <div
        className={cx('h-full rounded-full transition-[width] duration-500', height)}
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
};

export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  tone?: 'danger' | 'primary';
}> = ({ open, title, description, confirmLabel = 'Delete', onCancel, onConfirm, tone = 'danger' }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#03060d]/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-xl border border-white/10 bg-[#0a101d] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span
            className={cx(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
              tone === 'danger'
                ? 'border-red-400/20 bg-red-400/10 text-red-300'
                : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300'
            )}
          >
            <AlertCircle className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{description}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="ml-auto rounded-md p-1 text-slate-500 hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/[0.08] px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cx(
              'rounded-lg px-4 py-2 text-xs font-bold transition-colors',
              tone === 'danger'
                ? 'bg-red-500/90 text-white hover:bg-red-500'
                : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ChartBars: React.FC<{
  series: Array<{ label: string; value: number; title?: string }>;
  color?: string;
  height?: number;
}> = ({ series, color = '#22d3ee', height = 132 }) => {
  const max = Math.max(1, ...series.map((point) => point.value));
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {series.map((point, index) => (
        <div key={`${point.label}-${index}`} className="group flex h-full flex-1 flex-col justify-end">
          <div
            title={point.title ?? `${point.label}: ${point.value}`}
            className="w-full rounded-t-[3px] transition-all duration-300 group-hover:opacity-80"
            style={{
              height: point.value === 0 ? '3px' : `${Math.max(6, (point.value / max) * 100)}%`,
              backgroundColor: point.value === 0 ? 'rgba(255,255,255,0.07)' : color,
              opacity: point.value === 0 ? 1 : 0.35 + (point.value / max) * 0.65,
            }}
          />
        </div>
      ))}
    </div>
  );
};
