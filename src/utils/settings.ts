import { pushToCloud, emitStorageError } from './cloudSync';
import { getHaritechContent } from './haritechContent';

const SETTINGS_STORAGE_KEY = 'haritech-settings';

export interface SiteSettings {
  companyName: string;
  tagline: string;
  contactEmail: string;
  phoneNumber: string;
  address: string;
}

const defaultSettings: SiteSettings = {
  companyName: 'HARITECH EXCLUSIVE SERVICES',
  tagline: 'Building Powerful Websites That Grow Businesses',
  contactEmail: 'hello@haritech.com',
  phoneNumber: '+1 (555) 123-4567',
  address: '123 Tech Street, San Francisco, CA'
};

export const getStoredSettings = (): SiteSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return defaultSettings;
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return defaultSettings;
    // Strip null/undefined so bad values can't override defaults
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (v !== null && v !== undefined) clean[k] = v;
    }
    return { ...defaultSettings, ...clean };
  } catch {
    return defaultSettings;
  }
};

export const SETTINGS_UPDATED_EVENT = 'haritech-settings-updated';

// Contact fields live in two stores (settings for Footer/portfolio, haritech-content for
// the Contact page). Mirror content -> settings after every content save so both sides
// always show the same email/phone/address. No-op when already in sync.
export const syncSettingsFromContent = (): boolean => {
  const hc = getHaritechContent();
  const s = getStoredSettings();
  if (hc.email === s.contactEmail && hc.phone === s.phoneNumber && hc.address === s.address) return true;
  return setStoredSettings({
    ...s,
    contactEmail: hc.email || s.contactEmail,
    phoneNumber: hc.phone || s.phoneNumber,
    address: hc.address || s.address,
  });
};

export const setStoredSettings = (settings: SiteSettings): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    emitStorageError('Could not save settings — browser storage is full. Remove old images/data, then try again.');
    return false;
  }
  void pushToCloud(SETTINGS_STORAGE_KEY, settings);
  window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
  return true;
};
