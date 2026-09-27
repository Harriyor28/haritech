import {
  getStoredBrandLogo,
  setStoredBrandLogo,
  subscribeToBrandLogo,
} from './brand';

// Single site-wide logo — the Haritech side uses the exact same logo store
// as the portfolio side. These aliases keep existing imports working while
// guaranteeing one logo everywhere.
export const getHaritechBrandLogo: () => string = getStoredBrandLogo;
export const setHaritechBrandLogo: (url: string) => boolean = setStoredBrandLogo;
export const subscribeToHaritechLogo: (
  cb: (url: string) => void
) => () => void = subscribeToBrandLogo;

// Re-export for consumers that need the raw brand subscribe (used by HaritechNavbar)
export { subscribeToBrandLogo };
