import { pushToCloud, emitStorageError } from './cloudSync';

export interface PortfolioService {
  id: number;
  icon: string;
  title: string;
  description: string;
  features: string[];
}

const STORAGE_KEY = 'haritech-portfolio-services';

export const SERVICE_UPDATED_EVENT = 'haritech-portfolio-services-updated';

const defaultPortfolioServices: PortfolioService[] = [
  {
    id: 1,
    icon: '🌐',
    title: 'Website Design',
    description: 'Premium, pixel-perfect website designs that captivate visitors and drive conversions with modern aesthetics and user-friendly interfaces.',
    features: [
      'Custom design tailored to your brand',
      'Mobile-first responsive design',
      'Modern UI/UX design',
      'Prototyping & wireframing',
      'Design system implementation',
    ],
  },
  {
    id: 2,
    icon: '🏢',
    title: 'Business Websites',
    description: 'Complete business website solutions that establish credibility, showcase services, and generate leads for growth.',
    features: [
      'Business website development',
      'CMS integration',
      'Contact & inquiry forms',
      'Analytics integration',
      'SEO optimization',
    ],
  },
  {
    id: 3,
    icon: '👔',
    title: 'Corporate Websites',
    description: "Professional corporate websites that reflect your company's values and establish authority in your industry.",
    features: [
      'Corporate identity design',
      'Executive profiles',
      'Investment section',
      'Multi-location support',
      'Global accessibility',
    ],
  },
  {
    id: 4,
    icon: '🏥',
    title: 'Hospital Systems',
    description: 'Secure, compliant healthcare systems that improve patient experience and streamline medical operations.',
    features: [
      'HIPAA-compliant solutions',
      'Patient portal integration',
      'Appointment scheduling',
      'Medical records management',
      'Telemedicine support',
    ],
  },
  {
    id: 5,
    icon: '🏨',
    title: 'Hotel Booking Platforms',
    description: 'Luxury booking platforms with CRM integration, revenue management, and seamless guest experience.',
    features: [
      'OTA integration',
      'Revenue management system',
      'Guest database',
      'Package & promotion management',
      'Mobile app support',
    ],
  },
  {
    id: 6,
    icon: '⛪',
    title: 'Church Websites',
    description: 'Spiritually uplifting websites that connect with congregants and enhance community engagement.',
    features: [
      'Live streaming integration',
      'Sermon archives',
      'Giving portals',
      'Event calendar',
      'Member directory',
    ],
  },
  {
    id: 7,
    icon: '🛍️',
    title: 'E-commerce Stores',
    description: 'Complete e-commerce solutions with payment integration, inventory management, and conversion optimization.',
    features: [
      'Payment gateway integration',
      'Inventory management',
      'Customer account system',
      'Order management',
      'Tax & shipping calculations',
    ],
  },
  {
    id: 8,
    icon: '💼',
    title: 'Portfolio Websites',
    description: 'Stunning portfolio websites that showcase your work, achievements, and professional credentials.',
    features: [
      'Project galleries',
      'Case studies',
      'Client testimonials',
      'Downloadable resume',
      'International languages',
    ],
  },
  {
    id: 9,
    icon: '⚡',
    title: 'Custom Web Applications',
    description: 'Tailor-made web applications that solve unique business challenges and streamline operations.',
    features: [
      'Custom development',
      'API integration',
      'Database solutions',
      'User authentication',
      'Real-time features',
    ],
  },
];

export const getStoredPortfolioServices = (): PortfolioService[] => {
  if (typeof window === 'undefined') return defaultPortfolioServices;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) ? parsed : defaultPortfolioServices;
  } catch {
    return defaultPortfolioServices;
  }
};

export const setStoredPortfolioServices = (data: PortfolioService[]): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    emitStorageError('Could not save services — browser storage is full. Remove old images/data, then try again.');
    return false;
  }
  void pushToCloud(STORAGE_KEY, data);
  window.dispatchEvent(new Event(SERVICE_UPDATED_EVENT));
  return true;
};
