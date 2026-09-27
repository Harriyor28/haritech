export interface HaritechService {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  color: string;
  has3D: boolean;
}

export const haritechServices: HaritechService[] = [
  {
    id: 'laptops',
    title: 'Laptop & Tech Accessories',
    description: 'Premium quality laptops, chargers, and essential tech gadgets. We provide expert repair services and comprehensive device setup for your convenience.',
    icon: 'Laptop',
    features: ['Quality Laptops', 'Tech Accessories', 'Gadget Repairs', 'Device Setup'],
    color: 'from-cyan-500 to-blue-600',
    has3D: true
  },
  {
    id: 'cyber-cafe',
    title: 'Cyber Café & Online Registration',
    description: 'Fast and reliable internet services, professional online registrations, seamless form filling, and digital document processing solutions.',
    icon: 'Monitor',
    features: ['High-Speed Internet', 'Online Registration', 'Document Processing', 'Digital Services'],
    color: 'from-purple-500 to-violet-600',
    has3D: false
  },
  {
    id: 'printing',
    title: 'Printing & Branding',
    description: 'Professional printing services including business cards, banners, and branded materials to elevate your corporate identity.',
    icon: 'Printer',
    features: ['Business Cards', 'Banners & Posters', 'Branded Materials', 'Large Format Printing'],
    color: 'from-pink-500 to-rose-600',
    has3D: false
  },
  {
    id: 'epoxy',
    title: '3D Epoxy & Interior Design',
    description: 'Stunning 3D epoxy flooring and modern interior design services that transform your spaces into breathtaking environments.',
    icon: 'Paintbrush',
    features: ['3D Epoxy Flooring', 'Interior Design', 'Wall Art & Murals', 'Space Planning'],
    color: 'from-amber-500 to-orange-600',
    has3D: true
  },
  {
    id: 'consultation',
    title: 'Business Consultation',
    description: 'Expert business advice, strategy planning, and digital transformation services tailored to scale your enterprise efficiently.',
    icon: 'Briefcase',
    features: ['Business Strategy', 'Digital Transformation', 'Market Analysis', 'Growth Planning'],
    color: 'from-emerald-500 to-green-600',
    has3D: false
  },
  {
    id: 'smart-home',
    title: 'Smart Home Technology',
    description: 'Advanced home automation, smart devices integration, and cutting-edge IoT solutions for a connected and convenient lifestyle.',
    icon: 'Home',
    features: ['Home Automation', 'Smart Lighting', 'IoT Integration', 'Voice Control'],
    color: 'from-blue-500 to-indigo-600',
    has3D: true
  },
  {
    id: 'solar',
    title: 'Solar Solutions',
    description: 'Reliable solar panel installation, durable inverters, and high-capacity battery storage systems for uninterrupted clean energy.',
    icon: 'Sun',
    features: ['Solar Panels', 'Inverter Systems', 'Battery Storage', 'Energy Audit'],
    color: 'from-yellow-500 to-amber-600',
    has3D: false
  },
  {
    id: 'cctv',
    title: 'CCTV & Security Systems',
    description: 'Comprehensive surveillance systems, advanced access control, and robust security solutions to protect what matters most.',
    icon: 'Shield',
    features: ['CCTV Installation', 'Access Control', 'Alarm Systems', 'Remote Monitoring'],
    color: 'from-red-500 to-rose-600',
    has3D: false
  }
];
