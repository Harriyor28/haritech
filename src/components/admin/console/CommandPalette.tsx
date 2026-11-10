import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Command, CornerDownLeft, Search } from 'lucide-react';
import { cx } from './ui';

export interface PaletteItem {
  id: string;
  label: string;
  group: string;
  hint?: string;
  keywords?: string;
  run: () => void;
}

const CommandPalette: React.FC<{
  open: boolean;
  onClose: () => void;
  items: PaletteItem[];
}> = ({ open, onClose, items }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      `${item.label} ${item.group} ${item.hint ?? ''} ${item.keywords ?? ''}`
        .toLowerCase()
        .includes(needle)
    );
  }, [items, query]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  if (!open) return null;

  const grouped = filtered.reduce<Record<string, PaletteItem[]>>((acc, item) => {
    acc[item.group] = acc[item.group] ?? [];
    acc[item.group].push(item);
    return acc;
  }, {});

  let flatIndex = -1;

  const select = (item: PaletteItem) => {
    onClose();
    item.run();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-[#03060d]/80 p-4 pt-[12vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-[#080d18] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-slate-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveIndex((current) => Math.min(current + 1, filtered.length - 1));
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveIndex((current) => Math.max(current - 1, 0));
              } else if (event.key === 'Enter' && filtered[activeIndex]) {
                event.preventDefault();
                select(filtered[activeIndex]);
              }
            }}
            placeholder="Search pages, projects and actions…"
            aria-label="Search pages, projects and actions"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />
          <kbd className="hidden items-center gap-1 rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[9px] font-bold text-slate-500 sm:flex">
            ESC
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-xs font-bold text-slate-400">No matches for “{query}”</p>
              <p className="mt-1 text-[11px] text-slate-600">
                Try a page name, a project title, or an action like “add”.
              </p>
            </div>
          )}

          {Object.entries(grouped).map(([group, groupItems]) => (
            <div key={group} className="mb-1">
              <p className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
                {group}
              </p>
              {groupItems.map((item) => {
                flatIndex += 1;
                const index = flatIndex;
                const active = index === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => select(item)}
                    className={cx(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                      active ? 'bg-white/[0.07]' : 'hover:bg-white/[0.03]'
                    )}
                  >
                    <span
                      className={cx(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[9px] font-black',
                        active
                          ? 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300'
                          : 'border-white/[0.07] bg-white/[0.02] text-slate-500'
                      )}
                    >
                      <ArrowRight className="h-3 w-3" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold text-slate-200">
                        {item.label}
                      </span>
                      {item.hint && (
                        <span className="block truncate text-[10px] text-slate-600">{item.hint}</span>
                      )}
                    </span>
                    {active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-slate-500" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5 text-[10px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <Command className="h-3 w-3" /> K to open anywhere in the console
          </span>
          <span className="hidden items-center gap-2 sm:flex">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
