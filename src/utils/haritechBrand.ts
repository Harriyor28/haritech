import { pushToCloud } from './cloudSync';

const HARITECH_LOGO_KEY = 'haritech-brand-logo';

/**
 * An older sync path stored string values JSON-stringified, so localStorage
 * could end up holding a quoted value like '"https://…/logo.png"'. Strip
 * that wrapping so reads (and browsers holding the stale value) self-heal.
 */
export const normalizeStoredLogo = (raw: string | null): string => {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (trimmed.length > 1 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'string') return parsed;
    } catch {
      // Not a quoted JSON string — keep the value as-is.
    }
  }
  return raw;
};

export const getHaritechBrandLogo = (): string => {
  if (typeof window === 'undefined') return '';
  return normalizeStoredLogo(window.localStorage.getItem(HARITECH_LOGO_KEY));
};

/** Returns false when localStorage rejects the write (usually quota exceeded). */
export const setHaritechBrandLogo = (url: string): boolean => {
  try {
    window.localStorage.setItem(HARITECH_LOGO_KEY, url);
  } catch (e) {
    console.warn('[logo] save failed — localStorage may be full:', e);
    return false;
  }
  void pushToCloud(HARITECH_LOGO_KEY, url);
  window.dispatchEvent(new Event('haritech-logo-updated'));
  return true;
};

export const subscribeToHaritechLogo = (cb: (url: string) => void) => {
  const handler = () => cb(getHaritechBrandLogo());
  const handleStorage = (e: StorageEvent) => {
    if (e.key === HARITECH_LOGO_KEY) cb(getHaritechBrandLogo());
  };
  window.addEventListener('haritech-logo-updated', handler);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener('haritech-logo-updated', handler);
    window.removeEventListener('storage', handleStorage);
  };
};
