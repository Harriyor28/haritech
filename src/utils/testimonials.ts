import { pushToCloud } from './cloudSync';

const STORAGE_KEY = 'haritech-testimonials';

export interface Testimonial {
  /** Set when a testimonial is saved through the admin dashboard. Anything
      without it predates the content correction and is not published. */
  approved?: boolean;
  id: number;
  name: string;
  company: string;
  position: string;
  content: string;
  rating: number;
  image: string;
}

/* No testimonials are published until the owner supplies real ones. */
const defaultTestimonials: Testimonial[] = [];


export const getStoredTestimonials = (): Testimonial[] => {
  if (typeof window === 'undefined') return defaultTestimonials;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultTestimonials;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return defaultTestimonials;
    return (parsed as Testimonial[]).filter(item => item && item.approved === true);
  } catch {
    return defaultTestimonials;
  }
};

export const setStoredTestimonials = (data: Testimonial[]): void => {
  if (typeof window === 'undefined') return;
  const approved = data.map(item => ({ ...item, approved: true }));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(approved));
  void pushToCloud(STORAGE_KEY, approved);
  window.dispatchEvent(new Event('haritech-testimonials-updated'));
};
