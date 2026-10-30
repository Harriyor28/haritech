import React from 'react';

/* Small, shared form controls for the Solar Advisor.
   They keep units visible next to every number so kW, kWh, V, A and Ah are
   never confused in the interface. */

export const inputClass =
  'w-full px-3 py-2.5 bg-slate-950/50 rounded-xl border border-white/10 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 outline-none text-sm text-white placeholder:text-slate-600';

export const labelClass =
  'block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide';

export const hintClass = 'text-[11px] text-slate-500 leading-relaxed mt-1.5';

interface NumberFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  id?: string;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  placeholder,
  hint,
  disabled,
  id,
}) => {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  return (
    <div>
      <label htmlFor={inputId} className={labelClass}>{label}</label>
      <div className="relative">
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          className={`${inputClass} ${suffix ? 'pr-14' : ''}`}
          value={value === null ? '' : String(value)}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw.trim() === '') {
              onChange(null);
              return;
            }
            const parsed = Number(raw);
            if (Number.isFinite(parsed)) onChange(parsed);
          }}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[11px] font-mono text-slate-500">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
};

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  type?: 'text' | 'email' | 'tel';
  maxLength?: number;
  required?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = 'text',
  maxLength,
  required,
}) => {
  const inputId = React.useId();
  return (
    <div>
      <label htmlFor={inputId} className={labelClass}>{label}</label>
      <input
        id={inputId}
        type={type}
        className={inputClass}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
};

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  hint?: string;
}

export const SelectField = <T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: SelectFieldProps<T>): React.ReactElement => {
  const selectId = React.useId();
  return (
    <div>
      <label htmlFor={selectId} className={labelClass}>{label}</label>
      <select
        id={selectId}
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-900">
            {option.label}
          </option>
        ))}
      </select>
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
};

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, hint }) => (
  <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3 cursor-pointer hover:border-white/20 transition-colors">
    <input
      type="checkbox"
      className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900 text-amber-500 focus:ring-amber-400/40"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-slate-200">{label}</span>
      {hint && <span className="block text-[11px] text-slate-500 leading-relaxed mt-0.5">{hint}</span>}
    </span>
  </label>
);

interface StepCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const StepCard: React.FC<StepCardProps> = ({ title, description, children }) => (
  <section className="card p-5 sm:p-6 bg-[#0b101c]/90 border-white/10">
    <div className="mb-5">
      <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{title}</h2>
      <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">{description}</p>
    </div>
    {children}
  </section>
);

interface MetricProps {
  label: string;
  value: string;
  detail?: string;
  tone?: 'default' | 'warn' | 'good';
}

export const Metric: React.FC<MetricProps> = ({ label, value, detail, tone = 'default' }) => {
  const valueTone =
    tone === 'warn' ? 'text-amber-300' : tone === 'good' ? 'text-emerald-300' : 'text-white';
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.12em] font-mono text-slate-500">{label}</div>
      <div className={`text-lg font-bold mt-1 leading-tight ${valueTone}`}>{value}</div>
      {detail && <div className="text-[11px] text-slate-500 mt-1 leading-snug">{detail}</div>}
    </div>
  );
};
