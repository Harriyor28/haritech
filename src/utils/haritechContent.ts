const HARITECH_CONTENT_KEY = 'haritech-content';
const HARITECH_TEAM_KEY = 'haritech-team';
const HARITECH_INDUSTRIES_KEY = 'haritech-industries';
const HARITECH_BLOG_KEY = 'haritech-blog';
const HARITECH_CAC_KEY = 'haritech-cac';
const HARITECH_SERVICE_CATS_KEY = 'haritech-service-cats';
const HARITECH_FAQ_KEY = 'haritech-faq';
const HARITECH_SOLAR_KEY = 'haritech-solar';
const HARITECH_WHATTWEDO_KEY = 'haritech-whatwedo';
const HARITECH_SOCIAL_KEY = 'haritech-social';

import { pushToCloud } from './cloudSync';

const persist = (key: string, value: unknown): void => {
  window.localStorage.setItem(key, JSON.stringify(value));
  void pushToCloud(key, value);
};

export interface FAQCategory {
  category: string;
  items: { q: string; a: string }[];
}

export interface SolarContent {
  services: { title: string; desc: string; icon: string; color: string }[];
  whySolar: { title: string; desc: string; icon: string }[];
  applications: { title: string; desc: string; icon: string }[];
  stats: { value: string; label: string; icon: string }[];
}

export interface WhatWeDoArea {
  title: string;
  desc: string;
  icon: string;
  color: string;
}

export interface SocialLinks {
  twitter: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  businessHours: string;
}

export interface HaritechSiteContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutStory: string;
  mission: string;
  vision: string;
  whatsapp: string;
  email: string;
  phone: string;
  address: string;
  stats: { value: string; label: string }[];
  whyChoose: { title: string; desc: string }[];
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface IndustryCard {
  id: number;
  name: string;
  desc: string;
  icon: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  content: string;
}

export interface CACInfo {
  registeredName: string;
  rcNumber: string;
  registrationDate: string;
  status: string;
  address: string;
}

export interface ServiceCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  services: { name: string; desc: string; features: string[]; benefits: string[] }[];
}

const defaultContent: HaritechSiteContent = {
  heroTitle: 'We Build Digital Solutions That Drive Business Growth',
  heroSubtitle: 'From stunning websites and powerful e-commerce platforms to business automation and CAC registration — Haritech Exclusive Services is your end-to-end digital partner.',
  aboutStory: 'Founded with a vision to democratize access to premium digital services, Haritech Exclusive Services has grown from a small team of passionate developers into a full-service digital agency serving clients across multiple industries. We recognized that many businesses, especially SMEs, struggle to establish a strong digital presence due to cost, complexity, or lack of technical expertise. Haritech was born to bridge this gap — offering world-class digital solutions at affordable rates.',
  mission: 'To empower businesses of all sizes with innovative, affordable, and reliable digital solutions that drive growth, enhance visibility, and streamline operations — enabling our clients to focus on what they do best.',
  vision: 'To become Africa\'s most trusted digital solutions partner — recognized for transforming businesses through technology, creativity, and an unwavering commitment to client success.',
  whatsapp: '234800000000',
  email: 'info@haritech.com',
  phone: '+234 XXX XXX XXXX',
  address: 'Your Office Address Here, City, State, Nigeria',
  stats: [
    { value: '150+', label: 'Projects Delivered' },
    { value: '50+', label: 'Happy Clients' },
    { value: '5+', label: 'Years Experience' },
    { value: '98%', label: 'Client Satisfaction' },
  ],
  whyChoose: [
    { title: 'Experienced Team', desc: 'Skilled professionals with years of industry expertise.' },
    { title: 'Affordable Pricing', desc: 'Premium solutions at competitive rates for every budget.' },
    { title: 'Fast Delivery', desc: 'We respect your time with timely project completion.' },
    { title: 'SEO Optimized', desc: 'Built with search engines in mind to maximize visibility.' },
    { title: 'Mobile Friendly', desc: 'Every project is fully responsive across all devices.' },
    { title: 'Reliable Support', desc: 'Dedicated support team available whenever you need us.' },
    { title: 'Secure Solutions', desc: 'Enterprise-grade security baked into every solution.' },
    { title: 'Client Satisfaction', desc: 'Your success is our success — we deliver beyond expectations.' },
  ],
};

const defaultTeam: TeamMember[] = [
  { id: 1, name: 'Team Lead', role: 'CEO / Founder', bio: 'Visionary leader with a passion for technology and business transformation.', image: '' },
  { id: 2, name: 'Lead Developer', role: 'Senior Developer', bio: 'Expert full-stack developer specializing in modern web frameworks.', image: '' },
];

const defaultServiceCategories = [
  {
    id: 'web', label: 'Website & Software Solutions', icon: 'Code2', color: 'from-cyan-500 to-blue-600',
    services: [
      { name: 'Website Design', desc: 'Beautiful, responsive designs that captivate your audience.', features: ['Responsive Design', 'SEO Optimized', 'Fast Performance'], benefits: ['Increased Visibility', 'Higher Engagement'] },
      { name: 'Website Development', desc: 'Robust, scalable websites built with modern technologies.', features: ['Custom Development', 'API Integration', 'CMS Ready'], benefits: ['Scalable Solution', 'Easy Management'] },
      { name: 'E-commerce Websites', desc: 'Full-featured online stores with payments and analytics.', features: ['Payment Gateway', 'Inventory Management', 'Order Tracking'], benefits: ['Online Sales', 'Business Growth'] },
      { name: 'Business Websites', desc: 'Professional corporate sites that establish brand authority.', features: ['Corporate Design', 'Contact Forms', 'Blog Ready'], benefits: ['Brand Credibility', 'Client Reach'] },
      { name: 'School Management Systems', desc: 'Comprehensive platforms for academic administration.', features: ['Student Portal', 'Grade Management', 'Attendance Tracking'], benefits: ['Efficient Administration', 'Parent Communication'] },
      { name: 'Restaurant Websites', desc: 'Digital storefronts with online ordering and reservations.', features: ['Menu Display', 'Online Ordering', 'Table Booking'], benefits: ['More Orders', 'Customer Reach'] },
      { name: 'Hotel Booking Systems', desc: 'Real-time booking platforms with payment integration.', features: ['Room Booking', 'Payment Gateway', 'Availability Calendar'], benefits: ['Direct Bookings', 'Revenue Growth'] },
      { name: 'Real Estate Websites', desc: 'Property listing platforms with virtual tours.', features: ['Property Listings', 'Search Filters', 'Inquiry Forms'], benefits: ['Lead Generation', 'Property Showcase'] },
    ]
  },
  {
    id: 'branding', label: 'Branding & Creative Services', icon: 'Palette', color: 'from-purple-500 to-pink-600',
    services: [
      { name: 'Logo Design', desc: 'Unique, memorable logos that capture your brand essence.', features: ['Custom Design', 'Vector Format', 'Multiple Variations'], benefits: ['Brand Recognition', 'Professional Image'] },
      { name: 'Brand Identity', desc: 'Complete brand guidelines including colors and typography.', features: ['Color Palette', 'Typography', 'Brand Guidelines'], benefits: ['Consistent Branding', 'Professional Look'] },
      { name: 'Graphic Design', desc: 'Professional graphic design for print and digital media.', features: ['Print Ready', 'Digital Optimized', 'High Resolution'], benefits: ['Visual Appeal', 'Engaging Content'] },
      { name: 'Social Media Designs', desc: 'Engaging graphics for all social media platforms.', features: ['Platform Optimized', 'Brand Consistent', 'Template Based'], benefits: ['Social Presence', 'Audience Engagement'] },
    ]
  },
  {
    id: 'marketing', label: 'Digital Marketing', icon: 'Megaphone', color: 'from-green-500 to-teal-600',
    services: [
      { name: 'Search Engine Optimization', desc: 'Improve search rankings and drive organic traffic.', features: ['Keyword Research', 'On-Page SEO', 'Analytics'], benefits: ['Higher Rankings', 'More Traffic'] },
      { name: 'Social Media Management', desc: 'Strategic management to grow your following.', features: ['Content Calendar', 'Engagement', 'Analytics'], benefits: ['Brand Awareness', 'Customer Engagement'] },
    ]
  },
  {
    id: 'business', label: 'Business & IT Solutions', icon: 'Briefcase', color: 'from-amber-500 to-orange-600',
    services: [
      { name: 'Business Consultation', desc: 'Expert guidance on digital strategy.', features: ['Strategy Planning', 'Tech Assessment', 'Roadmap'], benefits: ['Clear Direction', 'Informed Decisions'] },
      { name: 'Website Security', desc: 'Enterprise-grade security to protect digital assets.', features: ['SSL Setup', 'Firewall', 'Malware Protection'], benefits: ['Data Protection', 'Customer Trust'] },
      { name: 'Domain Registration', desc: 'Secure the perfect domain for your business.', features: ['Domain Search', 'Registration', 'DNS Management'], benefits: ['Online Identity', 'Brand Protection'] },
      { name: 'Web Hosting', desc: 'Fast, reliable hosting for maximum performance.', features: ['SSD Storage', '99.9% Uptime', '24/7 Support'], benefits: ['Fast Loading', 'Reliable Service'] },
    ]
  }
];

const defaultIndustries: IndustryCard[] = [
  { id: 1, name: 'Small Businesses', desc: 'Digital solutions tailored for small and micro businesses to establish online presence.', icon: 'Building2' },
  { id: 2, name: 'Startups', desc: 'Scalable digital foundations for emerging startups ready to disrupt markets.', icon: 'Rocket' },
  { id: 3, name: 'Corporate Organizations', desc: 'Enterprise-grade solutions for large organizations with complex requirements.', icon: 'Briefcase' },
  { id: 4, name: 'Restaurants', desc: 'Digital storefronts, online ordering, and reservation systems for food businesses.', icon: 'Utensils' },
  { id: 5, name: 'Hotels', desc: 'Comprehensive booking platforms and digital experiences for hospitality brands.', icon: 'Hotel' },
  { id: 6, name: 'Schools', desc: 'Complete school management systems and educational platforms.', icon: 'BookOpen' },
  { id: 7, name: 'Churches', desc: 'Digital solutions for religious organizations to connect with their community.', icon: 'Church' },
  { id: 8, name: 'Hospitals', desc: 'Secure healthcare platforms and patient management systems.', icon: 'Heart' },
  { id: 9, name: 'Fashion Brands', desc: 'E-commerce and brand experiences for fashion and lifestyle businesses.', icon: 'Shirt' },
  { id: 10, name: 'Agricultural Businesses', desc: 'Agri-tech solutions for farm management, supply chain, and market access.', icon: 'Sprout' },
  { id: 11, name: 'Manufacturing', desc: 'Digital tools for production management, inventory, and B2B operations.', icon: 'Factory' },
  { id: 12, name: 'NGOs', desc: 'Impact-focused digital platforms for non-profit organizations.', icon: 'Users' },
  { id: 13, name: 'Financial Institutions', desc: 'Secure fintech solutions including dashboards, portals, and payment systems.', icon: 'Landmark' },
  { id: 14, name: 'Real Estate', desc: 'Property listing platforms with virtual tours and CRM integrations.', icon: 'Home' },
  { id: 15, name: 'Government', desc: 'Secure, compliant digital solutions for public sector entities.', icon: 'Building' },
];

const defaultBlog: BlogPost[] = [
  { id: 1, title: 'Top 10 Website Design Trends for 2026', excerpt: 'Discover the latest website design trends that are shaping the digital landscape in 2026.', category: 'Design', author: 'Haritech Team', date: 'July 25, 2026', readTime: '5 min', content: '' },
  { id: 2, title: 'Why Your Business Needs a Professional Website', excerpt: 'Learn why having a professional website is crucial for business success in today\'s digital age.', category: 'Business', author: 'Haritech Team', date: 'July 20, 2026', readTime: '4 min', content: '' },
  { id: 3, title: 'The Complete Guide to SEO for Small Businesses', excerpt: 'A comprehensive guide to help small businesses improve their search engine rankings.', category: 'SEO', author: 'Haritech Team', date: 'July 15, 2026', readTime: '8 min', content: '' },
];

const defaultCAC: CACInfo = {
  registeredName: 'Haritech Exclusive Services',
  rcNumber: 'RC / BN / 2024 / XXXXX',
  registrationDate: 'January 2024',
  status: 'Active / Compliant',
  address: 'Your Business Address Here',
};

export function getHaritechContent(): HaritechSiteContent {
  if (typeof window === 'undefined') return defaultContent;
  const stored = window.localStorage.getItem(HARITECH_CONTENT_KEY);
  return stored ? { ...defaultContent, ...JSON.parse(stored) } : defaultContent;
}

export function setHaritechContent(data: HaritechSiteContent): void {
  persist(HARITECH_CONTENT_KEY, data);
  window.dispatchEvent(new Event('haritech-content-updated'));
}

export function getTeamMembers(): TeamMember[] {
  if (typeof window === 'undefined') return defaultTeam;
  const stored = window.localStorage.getItem(HARITECH_TEAM_KEY);
  return stored ? JSON.parse(stored) : defaultTeam;
}

export function setTeamMembers(data: TeamMember[]): void {
  persist(HARITECH_TEAM_KEY, data);
  window.dispatchEvent(new Event('haritech-team-updated'));
}

export function getIndustries(): IndustryCard[] {
  if (typeof window === 'undefined') return defaultIndustries;
  const stored = window.localStorage.getItem(HARITECH_INDUSTRIES_KEY);
  return stored ? JSON.parse(stored) : defaultIndustries;
}

export function setIndustries(data: IndustryCard[]): void {
  persist(HARITECH_INDUSTRIES_KEY, data);
  window.dispatchEvent(new Event('haritech-industries-updated'));
}

export function getBlogPosts(): BlogPost[] {
  if (typeof window === 'undefined') return defaultBlog;
  const stored = window.localStorage.getItem(HARITECH_BLOG_KEY);
  return stored ? JSON.parse(stored) : defaultBlog;
}

export function setBlogPosts(data: BlogPost[]): void {
  persist(HARITECH_BLOG_KEY, data);
  window.dispatchEvent(new Event('haritech-blog-updated'));
}

export function getCACInfo(): CACInfo {
  if (typeof window === 'undefined') return defaultCAC;
  const stored = window.localStorage.getItem(HARITECH_CAC_KEY);
  return stored ? { ...defaultCAC, ...JSON.parse(stored) } : defaultCAC;
}

export function setCACInfo(data: CACInfo): void {
  persist(HARITECH_CAC_KEY, data);
  window.dispatchEvent(new Event('haritech-cac-updated'));
}

export function getServiceCategories(): ServiceCategory[] {
  if (typeof window === 'undefined') return defaultServiceCategories;
  const stored = window.localStorage.getItem(HARITECH_SERVICE_CATS_KEY);
  return stored ? JSON.parse(stored) : defaultServiceCategories;
}

export function setServiceCategories(data: ServiceCategory[]): void {
  persist(HARITECH_SERVICE_CATS_KEY, data);
  window.dispatchEvent(new Event('haritech-services-updated'));
}

export function getWhatsAppUrl(): string {
  const num = getHaritechContent().whatsapp.replace(/[^0-9]/g, '');
  return `https://wa.me/${num}`;
}

const defaultFAQ: FAQCategory[] = [
  {
    category: 'General',
    items: [
      { q: 'What is Haritech Exclusive Services?', a: 'Haritech Exclusive Services is a full-service digital agency offering web development, branding, digital marketing, business automation, CAC registration, and IT consulting services.' },
      { q: 'Where are you located?', a: 'We are based in Nigeria and serve clients both locally and internationally through our remote delivery model.' },
      { q: 'What industries do you serve?', a: 'We serve a wide range of industries including small businesses, startups, corporate organizations, restaurants, hotels, schools, healthcare, real estate, and more.' },
    ]
  },
  {
    category: 'Services',
    items: [
      { q: 'How long does it take to build a website?', a: 'Timelines vary by project complexity. A standard business website typically takes 2-4 weeks, while more complex projects like e-commerce platforms may take 4-8 weeks.' },
      { q: 'Do you offer website maintenance?', a: 'Yes, we offer ongoing maintenance packages to keep your website secure, updated, and performing at its best.' },
      { q: 'Can I update my website myself after it\'s built?', a: 'Absolutely! We build websites with user-friendly content management systems that allow you to make updates easily.' },
      { q: 'Do you provide hosting services?', a: 'Yes, we offer reliable web hosting solutions optimized for performance and security.' },
    ]
  },
  {
    category: 'Pricing',
    items: [
      { q: 'How much does a website cost?', a: 'Our pricing varies based on project requirements. Contact us for a personalized quote tailored to your specific needs.' },
      { q: 'Do you offer payment plans?', a: 'Yes, we offer flexible payment plans to accommodate different budgets. Contact us to discuss options.' },
      { q: 'Are there any hidden fees?', a: 'No, we believe in complete transparency. All costs are communicated upfront with no hidden charges.' },
    ]
  },
  {
    category: 'CAC Registration',
    items: [
      { q: 'How long does CAC registration take?', a: 'Business name registration typically takes 1-2 weeks. Limited liability company registration takes 2-4 weeks.' },
      { q: 'What documents are needed?', a: 'You need proposed business names, valid ID, passport photograph, residential/business address, email, and phone number.' },
      { q: 'Can foreigners register a business in Nigeria?', a: 'Yes, but additional requirements apply. Contact us for guidance on the process.' },
    ]
  },
  {
    category: 'Support',
    items: [
      { q: 'How can I contact support?', a: 'You can reach us via WhatsApp, email, phone, or through our contact form. We typically respond within 24 hours.' },
      { q: 'Do you provide after-launch support?', a: 'Yes, we provide comprehensive post-launch support to ensure everything runs smoothly.' },
    ]
  }
];

export function getFAQCategories(): FAQCategory[] {
  if (typeof window === 'undefined') return defaultFAQ;
  const stored = window.localStorage.getItem(HARITECH_FAQ_KEY);
  return stored ? JSON.parse(stored) : defaultFAQ;
}

export function setFAQCategories(data: FAQCategory[]): void {
  persist(HARITECH_FAQ_KEY, data);
  window.dispatchEvent(new Event('haritech-faq-updated'));
}

const defaultSolar: SolarContent = {
  services: [
    { title: 'Solar Panel Installation', desc: 'High-efficiency solar panels for residential, commercial, and industrial properties.', icon: 'Sun', color: 'from-yellow-500 to-orange-600' },
    { title: 'Solar Inverters', desc: 'Advanced inverter systems that convert solar energy into usable power for your property.', icon: 'Zap', color: 'from-cyan-500 to-blue-600' },
    { title: 'Battery Storage', desc: 'Lithium-ion and deep-cycle battery solutions for reliable energy storage and backup power.', icon: 'Battery', color: 'from-green-500 to-emerald-600' },
    { title: 'Hybrid Solar Systems', desc: 'Integrated systems combining solar, battery, and grid connectivity for maximum efficiency.', icon: 'Cpu', color: 'from-purple-500 to-violet-600' },
    { title: 'Solar Water Pumps', desc: 'Solar-powered water pumping solutions for agriculture, irrigation, and community water supply.', icon: 'Droplets', color: 'from-blue-500 to-indigo-600' },
    { title: 'Commercial Solar Farms', desc: 'Large-scale solar installations for businesses, factories, and industrial complexes.', icon: 'Factory', color: 'from-amber-500 to-orange-600' },
    { title: 'Solar Security Lights', desc: 'Energy-efficient solar-powered security lighting for homes, businesses, and public spaces.', icon: 'Shield', color: 'from-red-500 to-rose-600' },
    { title: 'Maintenance & Repairs', desc: 'Expert maintenance, repair, and optimization services for all solar installations.', icon: 'Wrench', color: 'from-slate-500 to-gray-600' },
    { title: 'Energy Audit & Consultation', desc: 'Professional energy assessment and consultation to design the perfect solar solution.', icon: 'Gauge', color: 'from-teal-500 to-cyan-600' },
  ],
  whySolar: [
    { title: 'Cut Electricity Costs', desc: 'Reduce or eliminate your monthly electricity bills with reliable solar power.', icon: 'TrendingUp' },
    { title: 'Energy Independence', desc: 'Never worry about power outages or grid instability again.', icon: 'Zap' },
    { title: 'Environmentally Friendly', desc: 'Reduce your carbon footprint with clean, renewable solar energy.', icon: 'TreePine' },
    { title: 'Low Maintenance', desc: 'Solar systems require minimal maintenance and last 25+ years.', icon: 'Settings' },
    { title: 'Government Incentives', desc: 'Take advantage of tax credits and renewable energy incentives.', icon: 'Award' },
    { title: 'Increase Property Value', desc: 'Solar installations significantly increase your property value.', icon: 'Home' },
    { title: '24/7 Monitoring', desc: 'Monitor your energy production and consumption in real-time.', icon: 'Smartphone' },
    { title: 'Expert Support', desc: 'Professional installation and dedicated after-sales support.', icon: 'Headphones' },
  ],
  applications: [
    { title: 'Residential Homes', desc: 'Complete solar solutions for homes — from rooftop panels to battery backup systems.', icon: 'Home' },
    { title: 'Commercial Buildings', desc: 'Solar installations for offices, malls, and commercial complexes.', icon: 'Building2' },
    { title: 'Industrial Facilities', desc: 'Large-scale solar solutions for factories, warehouses, and manufacturing plants.', icon: 'Factory' },
    { title: 'Agriculture & Farms', desc: 'Solar water pumps, irrigation systems, and farm electrification.', icon: 'Warehouse' },
    { title: 'Educational Institutions', desc: 'Solar power solutions for schools, universities, and training centers.', icon: 'Award' },
    { title: 'Healthcare Facilities', desc: 'Reliable backup power for hospitals, clinics, and health centers.', icon: 'Shield' },
  ],
  stats: [
    { value: '500+', label: 'Solar Systems Installed', icon: 'Sun' },
    { value: '10MW+', label: 'Peak Capacity Deployed', icon: 'Zap' },
    { value: '98%', label: 'Customer Satisfaction', icon: 'Star' },
    { value: '25+', label: 'Years Warranty Offered', icon: 'Shield' },
  ],
};

export function getSolarContent(): SolarContent {
  if (typeof window === 'undefined') return defaultSolar;
  const stored = window.localStorage.getItem(HARITECH_SOLAR_KEY);
  return stored ? { ...defaultSolar, ...JSON.parse(stored) } : defaultSolar;
}

export function setSolarContent(data: SolarContent): void {
  persist(HARITECH_SOLAR_KEY, data);
  window.dispatchEvent(new Event('haritech-solar-updated'));
}

const defaultWhatWeDo: WhatWeDoArea[] = [
  { title: 'Website Design', desc: 'Beautiful, user-centric designs that captivate and convert.', icon: 'Palette', color: 'from-pink-500 to-rose-600' },
  { title: 'Website Development', desc: 'Robust, scalable websites built with modern technologies.', icon: 'Code2', color: 'from-cyan-500 to-blue-600' },
  { title: 'E-commerce Solutions', desc: 'Full-featured online stores with seamless payment integrations.', icon: 'ShoppingCart', color: 'from-green-500 to-teal-600' },
  { title: 'Business Websites', desc: 'Professional corporate sites that establish your brand authority.', icon: 'Building2', color: 'from-blue-500 to-indigo-600' },
  { title: 'Portfolio Websites', desc: 'Stunning personal and agency portfolio showcases.', icon: 'Layout', color: 'from-purple-500 to-violet-600' },
  { title: 'School Management Systems', desc: 'Comprehensive platforms for academic administration.', icon: 'BookOpen', color: 'from-orange-500 to-amber-600' },
  { title: 'Hotel Booking Systems', desc: 'Real-time reservation platforms with payment gateways.', icon: 'Hotel', color: 'from-cyan-500 to-teal-600' },
  { title: 'Restaurant Websites', desc: 'Digital storefronts with menus, orders, and reservations.', icon: 'Utensils', color: 'from-red-500 to-rose-600' },
  { title: 'Real Estate Websites', desc: 'Property listing platforms with virtual tours and inquiries.', icon: 'Home', color: 'from-emerald-500 to-green-600' },
  { title: 'Business Automation', desc: 'Streamline workflows with custom automation solutions.', icon: 'Zap', color: 'from-amber-500 to-yellow-600' },
  { title: 'AI Solutions', desc: 'Leverage artificial intelligence for smarter business operations.', icon: 'Cpu', color: 'from-indigo-500 to-purple-600' },
  { title: 'Mobile Applications', desc: 'Native and cross-platform apps for iOS and Android.', icon: 'Smartphone', color: 'from-sky-500 to-blue-600' },
  { title: 'Branding & Identity', desc: 'Complete brand identity from logo to full visual guidelines.', icon: 'Layers', color: 'from-pink-500 to-fuchsia-600' },
  { title: 'Graphic Design', desc: 'Professional designs for print, digital, and social media.', icon: 'Sparkles', color: 'from-rose-500 to-red-600' },
  { title: 'SEO Services', desc: 'Optimize your online presence for search engines.', icon: 'Search', color: 'from-blue-500 to-cyan-600' },
  { title: 'Website Maintenance', desc: 'Keep your website secure, updated, and performing optimally.', icon: 'Settings', color: 'from-slate-500 to-gray-600' },
  { title: 'Website Security', desc: 'Protect your digital assets with enterprise-grade security.', icon: 'Shield', color: 'from-red-500 to-orange-600' },
  { title: 'Domain Registration', desc: 'Secure the perfect domain name for your brand.', icon: 'Globe2', color: 'from-teal-500 to-cyan-600' },
  { title: 'Web Hosting', desc: 'Reliable, fast hosting solutions for your website.', icon: 'Server', color: 'from-gray-500 to-slate-600' },
  { title: 'Professional Email Setup', desc: 'Corporate email solutions that build trust and credibility.', icon: 'Mail', color: 'from-violet-500 to-purple-600' },
  { title: 'Technical Support', desc: 'Dedicated support to keep your business running smoothly.', icon: 'Headphones', color: 'from-green-500 to-emerald-600' },
  { title: 'Business Consultation', desc: 'Strategic guidance for your digital transformation journey.', icon: 'Briefcase', color: 'from-blue-600 to-indigo-600' },
  { title: 'Digital Transformation', desc: 'Comprehensive digital overhaul for modern business success.', icon: 'Monitor', color: 'from-cyan-500 to-blue-600' },
];

export function getWhatWeDoAreas(): WhatWeDoArea[] {
  if (typeof window === 'undefined') return defaultWhatWeDo;
  const stored = window.localStorage.getItem(HARITECH_WHATTWEDO_KEY);
  return stored ? JSON.parse(stored) : defaultWhatWeDo;
}

export function setWhatWeDoAreas(data: WhatWeDoArea[]): void {
  persist(HARITECH_WHATTWEDO_KEY, data);
  window.dispatchEvent(new Event('haritech-whatwedo-updated'));
}

const defaultSocial: SocialLinks = {
  twitter: '#',
  linkedin: '#',
  facebook: '#',
  instagram: '#',
  businessHours: 'Monday - Friday: 8:00 AM - 6:00 PM',
};

export function getSocialLinks(): SocialLinks {
  if (typeof window === 'undefined') return defaultSocial;
  const stored = window.localStorage.getItem(HARITECH_SOCIAL_KEY);
  return stored ? { ...defaultSocial, ...JSON.parse(stored) } : defaultSocial;
}

export function setSocialLinks(data: SocialLinks): void {
  persist(HARITECH_SOCIAL_KEY, data);
  window.dispatchEvent(new Event('haritech-social-updated'));
}
