import { pushToCloud } from './cloudSync';

// Admin-controlled site design: display font, body font, accent color.
// Applied via CSS variables on :root so every page picks it up instantly.

const THEME_STORAGE_KEY = 'haritech-design-theme';
export const THEME_UPDATED_EVENT = 'haritech-theme-updated';

export interface DesignTheme {
  displayFont: string;
  bodyFont: string;
  accent: string;
}

export const DEFAULT_THEME: DesignTheme = {
  displayFont: 'Syne',
  bodyFont: 'Plus Jakarta Sans',
  accent: '#14b8a6',
};

// Fonts loaded in index.html — only these are selectable in the admin panel
export const AVAILABLE_FONTS = [
  'Syne',
  'Space Grotesk',
  'Cinzel',
  'Inter',
  'Playfair Display',
  'Plus Jakarta Sans',
] as const;

const FONT_STACKS: Record<string, string> = {
  Syne: "'Syne', sans-serif",
  'Space Grotesk': "'Space Grotesk', sans-serif",
  Cinzel: "'Cinzel', serif",
  Inter: "'Inter', sans-serif",
  'Playfair Display': "'Playfair Display', serif",
  'Plus Jakarta Sans': "'Plus Jakarta Sans', sans-serif",
};

export const fontStackFor = (name: string): string =>
  FONT_STACKS[name] || "'Syne', sans-serif";

export const getTheme = (): DesignTheme => {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_THEME;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return DEFAULT_THEME;
    return {
      displayFont: typeof parsed.displayFont === 'string' && parsed.displayFont ? parsed.displayFont : DEFAULT_THEME.displayFont,
      bodyFont: typeof parsed.bodyFont === 'string' && parsed.bodyFont ? parsed.bodyFont : DEFAULT_THEME.bodyFont,
      accent: typeof parsed.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(parsed.accent) ? parsed.accent : DEFAULT_THEME.accent,
    };
  } catch {
    return DEFAULT_THEME;
  }
};

export const setTheme = (theme: DesignTheme): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch {
    // Storage full — theme still applies live for this session, just not persisted
  }
  void pushToCloud(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new Event(THEME_UPDATED_EVENT));
  return true;
};

/** Mix a hex color toward white (factor > 0) or black (factor < 0). Factor range: -1..1 */
const shade = (hex: string, factor: number): string => {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  const mix = (c: number) =>
    Math.round(factor >= 0 ? c + (255 - c) * factor : c * (1 + factor));
  const to2 = (c: number) => c.toString(16).padStart(2, '0');
  return `#${to2(mix(r))}${to2(mix(g))}${to2(mix(b))}`;
};

export const applyTheme = (theme: DesignTheme = getTheme()): void => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--ht-font-display', fontStackFor(theme.displayFont));
  root.style.setProperty('--ht-font-body', fontStackFor(theme.bodyFont));
  root.style.setProperty('--ht-accent', theme.accent);
  root.style.setProperty('--ht-accent-bright', shade(theme.accent, 0.45));
  root.style.setProperty('--ht-accent-deep', shade(theme.accent, -0.45));
  // glow-border::after reads these (they were never defined before — latent bug now fixed)
  root.style.setProperty('--neon-cyan', theme.accent);
  root.style.setProperty('--neon-purple', shade(theme.accent, -0.45));
};

// Apply immediately on import, keep live on same-tab save events, and
// re-apply cross-tab via the native storage event (no bridge needed).
if (typeof window !== 'undefined') {
  applyTheme();
  window.addEventListener(THEME_UPDATED_EVENT, () => applyTheme());
  window.addEventListener('storage', (e) => {
    if (e.key === THEME_STORAGE_KEY) applyTheme();
  });
}
