import { pushToCloud } from './cloudSync';
const HARITECH_LOGO_KEY = 'haritech-brand-logo';
export const getHaritechBrandLogo = () => {
    if (typeof window === 'undefined')
        return '';
    return window.localStorage.getItem(HARITECH_LOGO_KEY) || '';
};
export const setHaritechBrandLogo = (url) => {
    window.localStorage.setItem(HARITECH_LOGO_KEY, url);
    void pushToCloud(HARITECH_LOGO_KEY, url);
    window.dispatchEvent(new Event('haritech-logo-updated'));
};
export const subscribeToHaritechLogo = (cb) => {
    const handler = () => cb(getHaritechBrandLogo());
    window.addEventListener('haritech-logo-updated', handler);
    window.addEventListener('storage', (e) => {
        if (e.key === HARITECH_LOGO_KEY)
            cb(getHaritechBrandLogo());
    });
    return () => {
        window.removeEventListener('haritech-logo-updated', handler);
        window.removeEventListener('storage', handler);
    };
};
