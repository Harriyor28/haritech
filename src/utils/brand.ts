import { pushToCloud } from './cloudSync';

export const BRAND_LOGO_STORAGE_KEY = 'haritech-brand-logo';
export const BRAND_LOGO_EVENT = 'haritech-logo-updated';

export const getStoredBrandLogo = (): string => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(BRAND_LOGO_STORAGE_KEY) || '';
};

export const setStoredBrandLogo = (logo: string): void => {
  if (typeof window === 'undefined') return;

  if (logo) {
    window.localStorage.setItem(BRAND_LOGO_STORAGE_KEY, logo);
  } else {
    window.localStorage.removeItem(BRAND_LOGO_STORAGE_KEY);
  }
  void pushToCloud(BRAND_LOGO_STORAGE_KEY, logo);

  window.dispatchEvent(new Event(BRAND_LOGO_EVENT));
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