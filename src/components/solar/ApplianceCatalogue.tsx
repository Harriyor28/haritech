import React, { useMemo, useState } from 'react';
import { Plus, Search, Info } from 'lucide-react';
import type { ApplianceCategory, ApplianceTemplate } from '../../utils/solar/types';
import { APPLIANCE_CATEGORY_LABELS, APPLIANCE_NOTE } from '../../config/solar/appliances';
import { inputClass } from './SolarField';

interface ApplianceCatalogueProps {
  templates: ApplianceTemplate[];
  onAdd: (template: ApplianceTemplate) => void;
}

const categories: ApplianceCategory[] = ['lighting', 'home', 'office', 'business', 'other'];

export const ApplianceCatalogue: React.FC<ApplianceCatalogueProps> = ({ templates, onAdd }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ApplianceCategory | 'all'>('all');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return templates.filter((template) => {
      const matchesCategory = category === 'all' || template.category === category;
      const matchesQuery =
        needle.length === 0 ||
        template.name.toLowerCase().includes(needle) ||
        template.note.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [templates, query, category]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search appliances (fridge, fan, laptop…)"
            className={`${inputClass} pl-9`}
            aria-label="Search appliance catalogue"
          />
        </div>
        <select
          className={`${inputClass} sm:w-48`}
          value={category}
          onChange={(event) => setCategory(event.target.value as ApplianceCategory | 'all')}
          aria-label="Filter by category"
        >
          <option value="all" className="bg-slate-900">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item} className="bg-slate-900">
              {APPLIANCE_CATEGORY_LABELS[item]}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2.5 mb-3 flex items-start gap-2">
        <Info className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-100/80 leading-relaxed">{APPLIANCE_NOTE}</p>
      </div>

      <div className="max-h-72 overflow-y-auto rounded-xl border border-white/10 divide-y divide-white/5">
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-slate-500">
            No catalogue item matches that search. Add a manual appliance below and enter its label rating.
          </p>
        )}
        {filtered.map((template) => (
          <div key={template.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.03] transition-colors">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-200">{template.name}</span>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">
                  {APPLIANCE_CATEGORY_LABELS[template.category]}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {template.watts} W · {template.defaultHours} h/day default
                {template.surgeWatts !== null ? ` · ${template.surgeWatts} W surge` : ''}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onAdd(template)}
              className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1.5 text-[11px] font-bold text-amber-200 hover:bg-amber-400/20 transition-colors"
              aria-label={`Add ${template.name}`}
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
