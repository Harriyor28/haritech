import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, Check, Palette, Type, Droplet } from 'lucide-react';
import {
  getTheme,
  setTheme,
  DEFAULT_THEME,
  AVAILABLE_FONTS,
  fontStackFor,
  DesignTheme,
} from '../../utils/designTheme';

const inputClass = "w-full px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none text-sm text-white";
const labelClass = "block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide";

const ACCENT_PRESETS = [
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Royal Blue', hex: '#3b82f6' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Gold', hex: '#eab308' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Orange', hex: '#f97316' },
];

const FontPicker: React.FC<{
  label: string;
  hint: string;
  value: string;
  onChange: (font: string) => void;
}> = ({ label, hint, value, onChange }) => (
  <div>
    <label className={labelClass}><Type className="h-3 w-3 inline mr-1 text-cyan-400" /> {label}</label>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {AVAILABLE_FONTS.map((font) => (
        <button
          key={font}
          type="button"
          onClick={() => onChange(font)}
          className={`p-3 rounded-xl border text-center transition-all ${
            value === font
              ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/10'
              : 'bg-slate-950/40 border-white/5 hover:border-white/20'
          }`}
        >
          <span
            className="block text-2xl text-white leading-none mb-1.5"
            style={{ fontFamily: fontStackFor(font) }}
          >
            Aa
          </span>
          <span className={`text-[10px] font-bold flex items-center justify-center gap-1 ${value === font ? 'text-cyan-300' : 'text-slate-400'}`}>
            {value === font && <Check className="h-3 w-3" />}
            {font}
          </span>
        </button>
      ))}
    </div>
    <p className="text-[10px] text-slate-500 mt-1">{hint}</p>
  </div>
);

const HaritechDesignManager: React.FC = () => {
  const [draft, setDraft] = useState<DesignTheme>(() => getTheme());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(getTheme());
  }, []);

  const handleSave = () => {
    if (!setTheme(draft)) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setDraft(DEFAULT_THEME);
    setTheme(DEFAULT_THEME);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Choose the site-wide fonts and accent colour. Changes apply instantly across every page once saved.</p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm">
          <Save className="h-4 w-4" /> Save Design
        </motion.button>
      </div>
      {saved && <div className="text-emerald-400 text-sm font-bold">Design saved — live across the site!</div>}

      {/* Fonts */}
      <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Type className="h-5 w-5 text-cyan-400" /> Typography</h3>
        <div className="space-y-6">
          <FontPicker
            label="Display / Headings Font"
            hint="Applies to all headings and feature titles."
            value={draft.displayFont}
            onChange={(font) => setDraft({ ...draft, displayFont: font })}
          />
          <FontPicker
            label="Body / Paragraph Font"
            hint="Applies to regular text across the whole site."
            value={draft.bodyFont}
            onChange={(font) => setDraft({ ...draft, bodyFont: font })}
          />
        </div>
      </div>

      {/* Accent colour */}
      <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Droplet className="h-5 w-5 text-cyan-400" /> Accent Colour</h3>
        <div className="space-y-5 max-w-2xl">
          <div>
            <label className={labelClass}><Palette className="h-3 w-3 inline mr-1 text-cyan-400" /> Brand Accent</label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  title={preset.name}
                  onClick={() => setDraft({ ...draft, accent: preset.hex })}
                  className={`h-12 rounded-xl border-2 transition-all flex items-center justify-center ${
                    draft.accent === preset.hex ? 'border-white scale-105' : 'border-white/10 hover:border-white/40'
                  }`}
                  style={{ background: preset.hex }}
                >
                  {draft.accent === preset.hex && <Check className="h-4 w-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(draft.accent) ? draft.accent : '#14b8a6'}
              onChange={(e) => setDraft({ ...draft, accent: e.target.value })}
              className="w-16 h-12 rounded-xl bg-slate-950/40 border border-white/5 cursor-pointer p-1"
            />
            <input
              type="text"
              value={draft.accent}
              onChange={(e) => setDraft({ ...draft, accent: e.target.value })}
              className={`${inputClass} max-w-[160px] font-mono`}
              placeholder="#14b8a6"
            />
            <span className="text-[10px] text-slate-500">Picker or hex code (e.g. #14b8a6). Drives buttons, headline gradients and card glow.</span>
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="card p-8 bg-[#0e1326]/80 border-white/5 glow-border">
        <h3 className="text-xl font-bold text-white mb-6">Preview</h3>
        <div
          className="p-8 rounded-2xl border border-white/10 bg-[#0a0f1d] text-center"
          style={{
            // scoped preview vars — mirrors what applyTheme sets globally on save
            ['--ht-font-display' as string]: fontStackFor(draft.displayFont),
            ['--ht-font-body' as string]: fontStackFor(draft.bodyFont),
            ['--ht-accent' as string]: draft.accent,
          }}
        >
          <span className="block font-black text-2xl sm:text-3xl text-white mb-2" style={{ fontFamily: 'var(--ht-font-display)' }}>
            Build Powerful Websites
          </span>
          <p className="text-sm text-slate-400 mb-5" style={{ fontFamily: 'var(--ht-font-body)' }}>
            This is how headings and body text will look across every page once you save.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-950" style={{ background: draft.accent, boxShadow: `0 0 22px ${draft.accent}55` }}>
              Get Started
            </button>
            <span className="font-black" style={{ fontFamily: 'var(--ht-font-display)', background: `linear-gradient(to right, ${draft.accent}, #ffffff)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              Gradient Text
            </span>
          </div>
        </div>
      </div>

      {/* Reset */}
      <div>
        <button onClick={handleReset} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-sm">
          <RotateCcw className="h-4 w-4" /> Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default HaritechDesignManager;
