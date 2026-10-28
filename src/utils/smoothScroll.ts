import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * Site-wide scrolling feel.
 *  · instant   — plain native scrolling (no interpolation)
 *  · smooth    — the default, lightly interpolated wheel/trackpad scrolling
 *  · cinematic — longer, slower glide for a premium showcase feel
 *
 * Touch devices always keep native scrolling: the OS already supplies momentum
 * and rubber-banding, and overriding it with JS makes phones feel laggy.
 * `prefers-reduced-motion` always wins over the saved preference.
 */
export type ScrollFeel = 'instant' | 'smooth' | 'cinematic';

export const SCROLL_FEELS: { id: ScrollFeel; label: string; hint: string }[] = [
  { id: 'instant', label: 'Instant', hint: 'Native scrolling — the page follows your input exactly.' },
  { id: 'smooth', label: 'Smooth', hint: 'Default. A light glide on mouse wheel and trackpad.' },
  { id: 'cinematic', label: 'Cinematic', hint: 'A slower, longer glide for showcase pages.' },
];

const FEEL_DURATION: Record<Exclude<ScrollFeel, 'instant'>, number> = {
  smooth: 1.05,
  cinematic: 1.6,
};

let instance: Lenis | null = null;
let currentFeel: ScrollFeel = 'smooth';

const matches = (query: string): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(query).matches;

export const prefersReducedMotion = (): boolean => matches('(prefers-reduced-motion: reduce)');
export const isCoarsePointer = (): boolean => matches('(pointer: coarse)');

const destroy = () => {
  instance?.destroy();
  instance = null;
};

/** Apply the saved scroll feel. Safe to call repeatedly (e.g. after a save). */
export const applyScrollFeel = (feel: ScrollFeel = 'smooth'): void => {
  currentFeel = feel;
  if (typeof window === 'undefined') return;

  destroy();
  const root = document.documentElement;

  if (feel === 'instant' || prefersReducedMotion() || isCoarsePointer()) {
    root.classList.remove('ht-smooth-scroll');
    return;
  }

  root.classList.add('ht-smooth-scroll');
  instance = new Lenis({
    autoRaf: true,
    duration: FEEL_DURATION[feel],
    smoothWheel: true,
    // Native momentum on touch screens; nested scrollers (modals, drawers,
    // horizontal chip rows) keep their own scrolling.
    syncTouch: false,
    allowNestedScroll: true,
    anchors: false,
  });
};

/** Re-applies the current feel when the OS motion preference changes. */
export const initSmoothScroll = (feel: ScrollFeel = currentFeel): void => {
  applyScrollFeel(feel);
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onChange = () => applyScrollFeel(currentFeel);
  media.addEventListener?.('change', onChange);
};

export const getScrollFeel = (): ScrollFeel => currentFeel;

/** Jump (or glide) back to the top — used on route changes and the dock button. */
export const scrollToTop = (immediate = false): void => {
  if (typeof window === 'undefined') return;
  if (instance) {
    instance.scrollTo(0, { immediate, force: true });
    return;
  }
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth',
  });
};

/**
 * Scroll to an element or selector, clearing the fixed header.
 * Returns false when the target does not exist so callers can fall back.
 */
export const scrollToElement = (target: string | HTMLElement, offset = 96): boolean => {
  if (typeof document === 'undefined') return false;
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return false;

  if (instance) {
    instance.scrollTo(el, { offset: -offset });
    return true;
  }
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  return true;
};
