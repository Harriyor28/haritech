import { pushToCloud } from './cloudSync';
const SETTINGS_STORAGE_KEY = 'haritech-settings';
const defaultSettings = {
    companyName: 'HARITECH EXCLUSIVE SERVICES',
    tagline: 'Building Powerful Websites That Grow Businesses',
    contactEmail: 'hello@haritech.com',
    phoneNumber: '+1 (555) 123-4567',
    whatsappNumber: '+15551234567',
    address: '123 Tech Street, San Francisco, CA'
};
export const getStoredSettings = () => {
    if (typeof window === 'undefined')
        return defaultSettings;
    try {
        const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
        return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    }
    catch {
        return defaultSettings;
    }
};
export const SETTINGS_UPDATED_EVENT = 'haritech-settings-updated';
export const setStoredSettings = (settings) => {
    if (typeof window === 'undefined')
        return;
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    void pushToCloud(SETTINGS_STORAGE_KEY, settings);
    window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
};
