import { pushToCloud } from './cloudSync';

// Single site-wide logo — shared by the portfolio side and the Haritech
// side. Change it once (Admin → Settings, or Haritech → Logo) and it
// updates everywhere.
export const BRAND_LOGO_STORAGE_KEY = 'haritech-brand-logo';
export const BRAND_LOGO_EVENT = 'haritech-logo-updated';

export const getStoredBrandLogo = (): string => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(BRAND_LOGO_STORAGE_KEY) || '';
};

/** Returns true when the logo was persisted locally. Storage-quota failures return false. */
export const setStoredBrandLogo = (logo: string): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    if (logo) {
      window.localStorage.setItem(BRAND_LOGO_STORAGE_KEY, logo);
    } else {
      window.localStorage.removeItem(BRAND_LOGO_STORAGE_KEY);
    }
  } catch {
    console.warn('[brand] logo not saved: browser storage is full (image too large?)');
    return false;
  }
  void pushToCloud(BRAND_LOGO_STORAGE_KEY, logo);

  window.dispatchEvent(new Event(BRAND_LOGO_EVENT));
  return true;
};

export const subscribeToBrandLogo = (onChange: (logo: string) => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleChange = () => onChange(getStoredBrandLogo());
  window.addEventListener(BRAND_LOGO_EVENT, handleChange);
  window.addEventListener('storage', handleChange);

  return () => {
    window.removeEventListener(BRAND_LOGO_EVENT, handleChange);
    window.removeEventListener('storage', handleChange);
  };
};
