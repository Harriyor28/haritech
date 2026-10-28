import { pushToCloud } from './cloudSync';
import { applyScrollFeel, type ScrollFeel } from './smoothScroll';

// Admin-controlled site design: display font, body font, accent color.
// Applied via CSS variables on :root so every page picks it up instantly.

const THEME_STORAGE_KEY = 'haritech-design-theme';
export const THEME_UPDATED_EVENT = 'haritech-theme-updated';

export interface DesignTheme {
  displayFont: string;
  bodyFont: string;
  /** Site header / mobile drawer font. Falls back to bodyFont when unset. */
  navFont: string;
  /** Primary & secondary button font. Falls back to bodyFont when unset. */
  buttonFont: string;
  accent: string;
  /** Site-wide scrolling feel. Falls back to 'smooth' when unset. */
  scrollFeel: ScrollFeel;
}

export const DEFAULT_THEME: DesignTheme = {
  displayFont: 'Syne',
  bodyFont: 'Plus Jakarta Sans',
  navFont: 'Plus Jakarta Sans',
  buttonFont: 'Plus Jakarta Sans',
  accent: '#14b8a6',
  scrollFeel: 'smooth',
};

// Fonts loaded in index.html — only these are selectable in the admin panel.
// Three families (Object Sans, Soria, Sreda) are not freely served by Google
// Fonts, so they are mapped to the closest freely-available visual match.
export const AVAILABLE_FONTS = [
  // Sans-serif
  'Inter',
  'Josefin Sans',
  'Roboto',
  'Roboto Condensed',
  'Open Sans',
  'Rubik',
  'DM Sans',
  'Poppins',
  'Lato',
  'Libre Franklin',
  'Nunito',
  'Ubuntu',
  'Source Sans Pro',
  'Work Sans',
  'Manrope',
  'Object Sans',
  'Raleway',
  'Montserrat',
  // Serif
  'Playfair Display',
  'Libre Baskerville',
  'Roboto Slab',
  'Soria',
  'Neuton',
  'Lora',
  'Sreda',
  'Arvo',
  // Existing brand / display fonts
  'Syne',
  'Space Grotesk',
  'Cinzel',
  'Plus Jakarta Sans',
] as const;

const FONT_STACKS: Record<string, string> = {
  Inter: "'Inter', sans-serif",
  'Josefin Sans': "'Josefin Sans', sans-serif",
  Roboto: "'Roboto', sans-serif",
  'Roboto Condensed': "'Roboto Condensed', sans-serif",
  'Open Sans': "'Open Sans', sans-serif",
  Rubik: "'Rubik', sans-serif",
  'DM Sans': "'DM Sans', sans-serif",
  Poppins: "'Poppins', sans-serif",
  Lato: "'Lato', sans-serif",
  'Libre Franklin': "'Libre Franklin', sans-serif",
  Nunito: "'Nunito', sans-serif",
  Ubuntu: "'Ubuntu', sans-serif",
  'Source Sans Pro': "'Source Sans 3', 'Source Sans Pro', sans-serif",
  'Work Sans': "'Work Sans', sans-serif",
  Manrope: "'Manrope', sans-serif",
  'Object Sans': "'Manrope', sans-serif",
  Raleway: "'Raleway', sans-serif",
  Montserrat: "'Montserrat', sans-serif",
  'Playfair Display': "'Playfair Display', serif",
  'Libre Baskerville': "'Libre Baskerville', serif",
  'Roboto Slab': "'Roboto Slab', serif",
  Soria: "'Cinzel', serif",
  Neuton: "'Neuton', serif",
  Lora: "'Lora', serif",
  Sreda: "'Arvo', serif",
  Arvo: "'Arvo', serif",
  Syne: "'Syne', sans-serif",
  'Space Grotesk': "'Space Grotesk', sans-serif",
  Cinzel: "'Cinzel', serif",
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
    // Themes saved before navFont/buttonFont existed fall back to bodyFont,
    // so nav and buttons keep the look they had at the time.
    const bodyFont = typeof parsed.bodyFont === 'string' && parsed.bodyFont ? parsed.bodyFont : DEFAULT_THEME.bodyFont;
    return {
      displayFont: typeof parsed.displayFont === 'string' && parsed.displayFont ? parsed.displayFont : DEFAULT_THEME.displayFont,
      bodyFont,
      navFont: typeof parsed.navFont === 'string' && parsed.navFont ? parsed.navFont : bodyFont,
      buttonFont: typeof parsed.buttonFont === 'string' && parsed.buttonFont ? parsed.buttonFont : bodyFont,
      accent: typeof parsed.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(parsed.accent) ? parsed.accent : DEFAULT_THEME.accent,
      scrollFeel:
        parsed.scrollFeel === 'instant' || parsed.scrollFeel === 'smooth' || parsed.scrollFeel === 'cinematic'
          ? parsed.scrollFeel
          : DEFAULT_THEME.scrollFeel,
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
  root.style.setProperty('--ht-font-nav', fontStackFor(theme.navFont));
  root.style.setProperty('--ht-font-button', fontStackFor(theme.buttonFont));
  root.style.setProperty('--ht-accent', theme.accent);
  root.style.setProperty('--ht-accent-bright', shade(theme.accent, 0.45));
  root.style.setProperty('--ht-accent-deep', shade(theme.accent, -0.45));
  // glow-border::after reads these (they were never defined before — latent bug now fixed)
  root.style.setProperty('--neon-cyan', theme.accent);
  root.style.setProperty('--neon-purple', shade(theme.accent, -0.45));
  // Scroll interpolation lives in JS, so the saved feel is applied here too.
  applyScrollFeel(theme.scrollFeel);
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
