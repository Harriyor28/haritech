import { pushToCloud } from './cloudSync';

const STORAGE_KEY = 'haritech-testimonials';

export interface Testimonial {
  id: number;
  name: string;
  company: string;
  position: string;
  content: string;
  rating: number;
  image: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: 1, name: 'John Anderson', company: 'TechFlow Solutions', position: 'CEO & Founder',
    content: 'Working with HARITECH was a game-changer for our business. They transformed our outdated website into a modern, high-converting digital experience.',
    rating: 5, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60'
  },
  {
    id: 2, name: 'Sarah Martinez', company: 'GreenLeaf Hospital', position: 'Marketing Director',
    content: 'The new hospital website not only looks stunning but also significantly improved our patient booking system.',
    rating: 5, image: 'https://images.unsplash.com/photo-1494790108755-519df4a18ad1?w=150&auto=format&fit=crop&q=60'
  },
  {
    id: 3, name: 'Michael Chen', company: 'Harmony Music Academy', position: 'Academic Director',
    content: 'HARITECH delivered a website that perfectly captures our school\'s essence. The online booking system and student management features have streamlined our operations.',
    rating: 5, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60'
  },
  {
    id: 4, name: 'Emily Rodriguez', company: 'Sunset Suites', position: 'General Manager',
    content: 'The hospitality website exceeded our expectations. The booking system integration with our CRM was seamless.',
    rating: 5, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad4bc0?w=150&auto=format&fit=crop&q=60'
  },
  {
    id: 5, name: 'David Thompson', company: 'Divine Worship Center', position: 'Head Pastor',
    content: 'Our church\'s website has become a powerful tool for connecting with our congregation. The live streaming feature works perfectly.',
    rating: 5, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43d?w=150&auto=format&fit=crop&q=60'
  }
];

export const getStoredTestimonials = (): Testimonial[] => {
  if (typeof window === 'undefined') return defaultTestimonials;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultTestimonials;
  } catch {
    return defaultTestimonials;
  }
};

export const setStoredTestimonials = (data: Testimonial[]): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  void pushToCloud(STORAGE_KEY, data);
  window.dispatchEvent(new Event('haritech-testimonials-updated'));
};
