const HARITECH_CONTENT_KEY = 'haritech-content';
const HARITECH_TEAM_KEY = 'haritech-team';
const HARITECH_INDUSTRIES_KEY = 'haritech-industries';
const HARITECH_BLOG_KEY = 'haritech-blog';
const HARITECH_CAC_KEY = 'haritech-cac';
const HARITECH_SERVICE_CATS_KEY = 'haritech-service-cats';
const HARITECH_FAQ_KEY = 'haritech-faq';
const HARITECH_SOLAR_KEY = 'haritech-solar';
const HARITECH_WHATTWEDO_KEY = 'haritech-whatwedo';
const HARITECH_EPOXY_KEY = 'haritech-epoxy';
const HARITECH_SOCIAL_KEY = 'haritech-social';
const HARITECH_IMPORTATION_KEY = 'haritech-importation';
const HARITECH_PM_KEY = 'haritech-pm';

import { pushToCloud } from './cloudSync';
import { getSupabase } from './supabaseClient';

/**
 * One-time retirement of content seeded by earlier versions of the site.
 *
 * Those seeds included invented testimonials, projects, blog posts and
 * statistics. They are copied to a backup key first, then removed, so a
 * browser that cached them cannot keep showing them to visitors. Contact
 * details the owner entered are carried over rather than discarded.
 */
const LEGACY_BACKUP_KEY = 'haritech-legacy-content-backup';
const LEGACY_MIGRATION_KEY = 'haritech-content-migration';
const LEGACY_MIGRATION_VERSION = '4';

const LEGACY_SEEDED_KEYS = [
  'haritech-team',
  'haritech-industries',
  'haritech-blog',
  'haritech-cac',
  'haritech-service-cats',
  'haritech-faq',
  'haritech-solar',
  'haritech-importation',
  'haritech-epoxy',
  'haritech-whatwedo',
  'haritech-pm',
  'haritech-projects',
  'haritech-testimonials',
  'haritech-cac-services',
  'haritech-cac-why',
  'haritech-cac-docs',
  'haritech-cac-faq',
];

/**
 * Replaces the site rows that still hold pre-correction content in Supabase.
 *
 * `site_data` writes are restricted to the signed-in admin, so this only does
 * anything when an admin session exists; otherwise it is a no-op and the
 * read-time guards keep the old rows off the page. Contact fields the owner
 * entered are carried into the new content row rather than reset.
 */
const REPUBLISH_FLAG = 'haritech-cloud-republish';

export async function republishCorrectedHaritechContent(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.localStorage.getItem(REPUBLISH_FLAG) === LEGACY_MIGRATION_VERSION) return;
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data: sessionData } = await sb.auth.getSession();
    if (!sessionData.session) return;

    const { data: existing } = await sb
      .from('site_data')
      .select('value')
      .eq('key', HARITECH_CONTENT_KEY)
      .maybeSingle();    const previous = (existing?.value || {}) as Partial<HaritechSiteContent>;
    // A garbled address should not be carried forward just because it exists.
    const previousAddress = previous.address && !/harcult|elememem/i.test(previous.address)
      ? previous.address
      : defaultContent.address;

    const rows: { key: string; value: unknown }[] = [
      {
        key: HARITECH_CONTENT_KEY,
        value: {
          ...defaultContent,
          email: previous.email || defaultContent.email,
          phone: previous.phone || defaultContent.phone,
          whatsapp: previous.whatsapp || defaultContent.whatsapp,
          address: previousAddress,
        },
      },
      { key: HARITECH_BLOG_KEY, value: defaultBlog.map(post => ({ ...post, approved: true })) },
      { key: 'haritech-projects', value: [] },
      { key: 'haritech-testimonials', value: [] },
      { key: HARITECH_CAC_KEY, value: { ...defaultCAC, confirmed: true } },
    ];

    for (const row of rows) {
      const { error } = await sb
        .from('site_data')
        .upsert({ key: row.key, value: row.value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
    }

    const legacyLists = [
      'haritech-cac-services',
      'haritech-cac-why',
      'haritech-cac-docs',
      'haritech-cac-faq',
    ];
    await sb.from('site_data').delete().in('key', legacyLists);
    legacyLists.forEach(key => window.localStorage.removeItem(key));

    window.localStorage.setItem(REPUBLISH_FLAG, LEGACY_MIGRATION_VERSION);
    console.log('[content] corrected content published to Supabase');
  } catch (error) {
    console.warn('[content] cloud republish skipped:', error);
  }
}

export function migrateLegacyHaritechContent(): void {
  if (typeof window === 'undefined') return;
  try {
    if (window.localStorage.getItem(LEGACY_MIGRATION_KEY) === LEGACY_MIGRATION_VERSION) return;

    const backup: Record<string, string | null> = {};
    LEGACY_SEEDED_KEYS.concat(['haritech-content']).forEach(key => {
      backup[key] = window.localStorage.getItem(key);
    });
    if (!window.localStorage.getItem(LEGACY_BACKUP_KEY)) {
      window.localStorage.setItem(LEGACY_BACKUP_KEY, JSON.stringify(backup));
    }

    // Keep the owner's saved contact fields, replace the narrative content.
    const storedContent = window.localStorage.getItem(HARITECH_CONTENT_KEY);
    if (storedContent) {
      const parsed = JSON.parse(storedContent) as Partial<HaritechSiteContent>;
      const kept: HaritechSiteContent = {
        ...defaultContent,
        email: parsed.email || defaultContent.email,
        phone: parsed.phone || defaultContent.phone,
        whatsapp: parsed.whatsapp || defaultContent.whatsapp,
        address: parsed.address || defaultContent.address,
      };
      window.localStorage.setItem(HARITECH_CONTENT_KEY, JSON.stringify(kept));
    }

    LEGACY_SEEDED_KEYS.forEach(key => window.localStorage.removeItem(key));
    window.localStorage.setItem(LEGACY_MIGRATION_KEY, LEGACY_MIGRATION_VERSION);
  } catch (error) {
    console.warn('[content] legacy migration skipped:', error);
  }
}

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

export interface InteriorStyle {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  accentColor: string;
  wallGradient: string;
  floorGradient: string;
  sofaColor: string;
  rugColor: string;
  tableColor: string;
  cushionA: string;
  cushionB: string;
  glowColor: string;
  ambientK: number;
  spaceUsage: string;
  handoverDays: number;
}

/* Palette presets for the 3D interior studio. These are design palettes the
   owner can edit or replace — not a claim of completed installations.     */
export const defaultInteriorStyles: InteriorStyle[] = [
  {
    id: 'coastal-calm',
    name: 'Coastal Calm',
    tagline: 'Soft sand tones over an ocean-blue epoxy floor',
    badge: 'COASTAL SERIES',
    accentColor: '#06b6d4',
    wallGradient: 'linear-gradient(to bottom, #16283d 0%, #16283da6 55%, #16283d3d 100%)',
    floorGradient: 'radial-gradient(ellipse at 50% 60%, #06b6d4f2 0%, #0e7490e6 35%, #0f172afa 85%)',
    sofaColor: 'linear-gradient(145deg, #1e3a4a, #1e3a4a66)',
    rugColor: 'radial-gradient(circle, rgba(94,234,212,0.35), rgba(94,234,212,0.12) 70%)',
    tableColor: 'linear-gradient(160deg, #b45309 40%, #b4530955)',
    cushionA: '#5eead4',
    cushionB: '#f0fdfa',
    glowColor: 'rgba(56,189,248,0.45)',
    ambientK: 4000,
    spaceUsage: 'Living rooms & lounges',
    handoverDays: 14,
  },
  {
    id: 'sable-brass',
    name: 'Sable & Brass',
    tagline: 'Warm neutrals with a bronze metallic floor',
    badge: 'SIGNATURE SERIES',
    accentColor: '#f59e0b',
    wallGradient: 'linear-gradient(to bottom, #2a2118 0%, #2a2118a6 55%, #2a21183d 100%)',
    floorGradient: 'radial-gradient(ellipse at 50% 60%, #b45309f2 0%, #78350fe6 35%, #0f172afa 85%)',
    sofaColor: 'linear-gradient(145deg, #3f3327, #3f332766)',
    rugColor: 'radial-gradient(circle, rgba(245,158,11,0.28), rgba(245,158,11,0.1) 70%)',
    tableColor: 'linear-gradient(160deg, #92400e 40%, #92400e55)',
    cushionA: '#fbbf24',
    cushionB: '#fef3c7',
    glowColor: 'rgba(251,191,36,0.4)',
    ambientK: 3000,
    spaceUsage: 'Reception areas & lounges',
    handoverDays: 16,
  },
  {
    id: 'jade-terrace',
    name: 'Jade Terrace',
    tagline: 'Cool greens with a marble-effect epoxy floor',
    badge: 'MARBLE SERIES',
    accentColor: '#10b981',
    wallGradient: 'linear-gradient(to bottom, #13261f 0%, #13261fa6 55%, #13261f3d 100%)',
    floorGradient: 'radial-gradient(ellipse at 50% 60%, #10b981f2 0%, #065f46e6 35%, #0f172afa 85%)',
    sofaColor: 'linear-gradient(145deg, #243b33, #243b3366)',
    rugColor: 'radial-gradient(circle, rgba(16,185,129,0.3), rgba(16,185,129,0.1) 70%)',
    tableColor: 'linear-gradient(160deg, #334155 40%, #33415555)',
    cushionA: '#6ee7b7',
    cushionB: '#ecfdf5',
    glowColor: 'rgba(16,185,129,0.4)',
    ambientK: 4500,
    spaceUsage: 'Dining areas & studies',
    handoverDays: 14,
  },
];

export interface EpoxyContent {
  hero: { badge: string; title: string; accent: string; subtitle: string };
  works: { img: string; title: string; tag: string; detail: string }[];
  offers: { icon: string; title: string; desc: string; features: string[] }[];
  process: { icon: string; title: string; desc: string }[];
  qualities: { icon: string; title: string; desc: string }[];
  interiorStyles?: InteriorStyle[];
  [key: string]: any;
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

export interface GoodsSegment {
  id: string;
  name: string;
  tagline: string;
  dutyBand: string;
  mode: string;
  leadTime: string;
  notes: string;
  icon: string;
  color: string;
  examples: string[];
  permits: string[];
  restricted?: boolean;
}

export interface PreOrderGroup {
  id?: string;
  product: string;
  segment: string;
  mode?: string;
  origin: string;
  closingDate: string;
  slotsTotal: number;
  slotsTaken: number;
  deposit: string;
  landed: string;
  groupUrl?: string;
  note?: string;
}

export interface ImportationContent {
  services: { title: string; desc: string; icon: string; color: string; features: string[] }[];
  process: { title: string; desc: string; duration: string }[];
  requirements: { title: string; desc: string; items: string[] }[];
  stats: { value: string; label: string; icon: string }[];
  faqs: { q: string; a: string }[];
  segments: GoodsSegment[];
  preOrders: PreOrderGroup[];
}

export interface ProjectCategory {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
}

export interface DeliveryStage {
  name: string;
  desc: string;
  sla: string;
}

export interface DeliveryRitual {
  title: string;
  desc: string;
  icon: string;
}

export interface ManagedProject {
  id: string;
  title: string;
  client: string;
  categoryId: string;
  status: string;
  progress: number;
  phase: string;
  summary: string;
  owner: string;
  team: string[];
  tags: string[];
  deliverables: string[];
  milestones: { title: string; done: boolean }[];
  startDate: string;
  targetDate: string;
  lastUpdate: string;
}

export interface PMContent {
  categories: ProjectCategory[];
  stages: DeliveryStage[];
  rituals: DeliveryRitual[];
  projects: ManagedProject[];
  faqs: { q: string; a: string }[];
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
  heroTitle: 'Technology, business support, and practical solutions for everyday life.',
  heroSubtitle: 'Haritech Exclusive Business is a Nigerian multi-service company built around a simple vision: making technology more accessible, helping businesses grow, and bringing useful services together under one roof.',
  aboutStory: 'Haritech Exclusive Business was established around the idea that access to useful technology, reliable services, and practical business support can make a difference in people\u2019s lives.\nWe bring together different service areas under one business: technology products and computer services, online registration assistance, printing and branding, importation consultation, business consultation, solar energy, project management and property monitoring, and epoxy and interior d\u00e9cor.\nOur approach is to understand what customers need and help them explore appropriate solutions. Whether an individual needs technology-related assistance or a business is looking for support with its operations, sourcing, or development, we aim to make the process more accessible and straightforward.\nOur vision extends beyond providing individual services. We aspire to build a technology-driven company that serves multiple industries, creates opportunities, supports business development, and eventually reaches international markets.\nAt Haritech, we believe that useful technology should be accessible, business growth should be supported, and practical solutions should be easier to find.',
  mission: 'To make technology accessible, help businesses grow, and provide several useful services through one company \u2014 bringing practical solutions together under one roof.',
  vision: 'To grow beyond individual services into a technology-driven company serving multiple industries and expanding into international markets.',
  whatsapp: '234800000000',
  email: 'info@haritech.com',
  phone: '+234 XXX XXX XXXX',
  address: 'Port Harcourt, Rivers State',
  stats: [
    { value: '—', label: 'Service Divisions' },
    { value: '—', label: 'Enquiries Handled' },
    { value: '—', label: 'Projects' },
    { value: '—', label: 'Clients' },
  ],
  whyChoose: [
    { title: 'Pragmatic Advice', desc: 'Clear explanations of what a service involves and what to expect.' },
    { title: 'One Place, Multiple Services', desc: 'Technology, importation guidance, printing/branding, interiors, solar and project support under one business.' },
    { title: 'Nigerian-Focused', desc: 'Practical guidance tailored to common needs in Nigeria.' },
    { title: 'Transparency', desc: 'Costs, timelines and requirements depend on specifics — we explain tradeoffs clearly.' },
    { title: 'Enquiry-First', desc: 'We help you clarify needs before committing to a specific approach.' },
    { title: 'Pragmatic Solutions', desc: 'Focus on practical outcomes rather than overpromising.' },
    { title: 'Clear Communication', desc: 'Straightforward answers about what is available now vs under development.' },
    { title: 'Customer-Focused', desc: 'Guidance oriented to your actual requirements.' },
  ],
};

const defaultTeam: TeamMember[] = [];


const defaultServiceCategories = [
  {
    id: 'tech', label: 'Laptop & Tech Accessories', icon: 'Monitor', color: 'from-cyan-500 to-blue-600',
    services: [
      { name: 'Laptops & Computers', desc: 'Guidance on sourcing laptops and computing equipment based on your needs and budget.', features: ['Product sourcing guidance', 'Specification advice', 'Budget planning'], benefits: ['Informed purchase decisions', 'Fit-for-purpose recommendations'] },
      { name: 'Computer Accessories & Peripherals', desc: 'Assistance with accessories, peripherals and related tech items.', features: ['Accessory sourcing', 'Compatibility checks', 'Pragmatic recommendations'], benefits: ['Right parts for your setup', 'Avoid unnecessary spend'] },
    ]
  },
  {
    id: 'cyber', label: 'Cyber Café & Online Registration Services', icon: 'Globe', color: 'from-indigo-500 to-purple-600',
    services: [
      { name: 'Internet & Computer Services', desc: 'Practical computer and internet-based assistance for common tasks.', features: ['Document preparation assistance', 'Printing/scanning guidance', 'Internet access support'], benefits: ['Pragmatic help for routine tasks', 'Local support'] },
      { name: 'Online Registration Assistance', desc: 'General assistance with online registration processes. We clarify requirements and guide you through forms; where official authorisation is required, we distinguish general assistance from authorised services.', features: ['Requirement clarification', 'Form guidance', 'Document checklist'], benefits: ['Fewer errors', 'Clear understanding of requirements'] },
    ]
  },
  {
    id: 'printing', label: 'Printing & Branding', icon: 'Palette', color: 'from-purple-500 to-pink-600',
    services: [
      { name: 'Business Documents & Stationery', desc: 'Printing and branding for business documents and basic stationery as capabilities allow.', features: ['Document printing', 'Basic branding', 'Enquiry-based quotation'], benefits: ['Professional presentation', 'Fit to budget'] },
      { name: 'Promotional Materials & Branded Items', desc: 'Assistance with branded items and promotional materials subject to available equipment and suppliers.', features: ['Design guidance', 'Supplier coordination', 'Quotation on request'], benefits: ['Brand visibility', 'Tailored to needs'] },
    ]
  },
  {
    id: 'import', label: 'Importation Consultation', icon: 'Briefcase', color: 'from-amber-500 to-orange-600',
    services: [
      { name: 'Product Sourcing Guidance', desc: 'Consultation on sourcing products, supplier communication, and purchase considerations.', features: ['Sourcing advice', 'Supplier vetting questions', 'Specification review'], benefits: ['Informed decisions', 'Reduced risk'] },
      { name: 'Shipping, Duties & Landed Cost Planning', desc: 'Guidance on shipping options, duties, exchange rates and total landed cost. Final costs and timelines depend on product, supplier, shipping and applicable charges.', features: ['Landed cost breakdown guidance', 'Documentation checklist', 'Risk awareness'], benefits: ['Realistic budgeting', 'Fewer surprises'] },
    ]
  },
  {
    id: 'business', label: 'Business Consultation Services', icon: 'Briefcase', color: 'from-blue-500 to-indigo-600',
    services: [
      { name: 'Business Planning & Guidance', desc: 'Pragmatic business planning support where genuinely available.', features: ['Idea validation', 'Practical roadmap', 'Actionable steps'], benefits: ['Clearer direction', 'Focused next steps'] },
      { name: 'Digital Presence & Operations Guidance', desc: 'Advice on practical digital presence and operational improvements for small businesses.', features: ['Needs assessment', 'Pragmatic recommendations', 'Referral guidance where needed'], benefits: ['Pragmatic improvements', 'Right-sized solutions'] },
    ]
  },
  {
    id: 'solar', label: 'Solar Energy', icon: 'Sun', color: 'from-yellow-500 to-amber-600',
    services: [
      { name: 'Energy Needs Assessment', desc: 'We look at what you want to power, for how long, and work out the size of system that would suit it.', features: ['Load estimate', 'Usage questions', 'Budget range'], benefits: ['Right-sized system', 'Fewer costly mistakes'] },
      { name: 'System Planning & Equipment Sourcing', desc: 'Planning panels, inverter and battery options, and helping you compare equipment before you buy.', features: ['Component options', 'Sourcing guidance', 'Specification checks'], benefits: ['Comparable options', 'Informed purchase'] },
      { name: 'Installation Coordination', desc: 'Coordinating installation with technicians, plus advice on basic care and servicing of the system.', features: ['Installer coordination', 'Site requirements', 'Care advice'], benefits: ['One point of contact', 'Clear expectations'] },
    ]
  },
  {
    id: 'projects', label: 'Project Management & Property Monitoring', icon: 'ClipboardList', color: 'from-cyan-500 to-teal-600',
    services: [
      { name: 'Project Planning & Scheduling', desc: 'Turning a requirement into a sequence of steps with dates, responsibilities and dependencies.', features: ['Scope outline', 'Schedule', 'Responsibilities'], benefits: ['Clear sequence', 'Fewer delays'] },
      { name: 'Budget Support & Coordination', desc: 'Support with budgeting, quotes comparison and coordinating the trades or suppliers involved.', features: ['Budget structure', 'Quote comparison', 'Supplier coordination'], benefits: ['Visible costs', 'Coordinated work'] },
      { name: 'Progress Reporting & Property Monitoring', desc: 'Scheduled visits, photographic records and written progress or condition reports for owners who are not on site.', features: ['Monitoring visits', 'Photo records', 'Written reports'], benefits: ['Up-to-date information', 'Documented condition'] },
    ]
  },
  {
    id: 'epoxy', label: '3D Epoxy & Interior Décor', icon: 'PaintBucket', color: 'from-teal-500 to-emerald-600',
    services: [
      { name: '3D Epoxy Flooring', desc: 'Consultation and coordination for bespoke epoxy floors. Examples shown are illustrative concepts until confirmed projects exist.', features: ['Design consultation', 'Surface assessment', 'Quotation on request'], benefits: ['Custom finishes', 'Pragmatic advice on suitability'] },
      { name: 'Metallic & Marble Effects', desc: 'Guidance on metallic/marble resin finishes with clear explanation of process and considerations.', features: ['Finish selection', 'Material guidance', 'Site assessment'], benefits: ['Distinctive finishes', 'Realistic expectations'] },
      { name: 'Interior Décor & Wall Finishes', desc: 'Interior décor consultation including wall finishes and feature surfaces where applicable.', features: ['Design consultation', 'Material selection', 'Project coordination'], benefits: ['Cohesive spaces', 'Pragmatic planning'] },
    ]
  }
];

/* Customer groups Haritech actually deals with. Written as who the services
   suit, not as a claim of completed industry projects or partnerships.     */
const defaultIndustries: IndustryCard[] = [
  { id: 1, name: 'Individuals & Households', desc: 'Laptops, accessories, printing, epoxy floors and solar questions for home use.', icon: 'Users' },
  { id: 2, name: 'Small Businesses & Retailers', desc: 'Everyday tech support, branded materials and practical business guidance.', icon: 'Building2' },
  { id: 3, name: 'Entrepreneurs & Start-ups', desc: 'Early-stage planning, documentation and digital presence questions.', icon: 'Rocket' },
  { id: 4, name: 'Importer & Traders', desc: 'Sourcing questions, duty and landed-cost planning, and shipping options.', icon: 'Briefcase' },
  { id: 5, name: 'Offices & Corporate Teams', desc: 'Device sourcing, printing, branding and project coordination enquiries.', icon: 'Building' },
  { id: 6, name: 'Hospitality Businesses', desc: 'Interior finishes, décor consultation and branded materials for guest spaces.', icon: 'Hotel' },
  { id: 7, name: 'Schools & Training Centres', desc: 'Computer access, printing support and equipment sourcing guidance.', icon: 'BookOpen' },
  { id: 8, name: 'Property Owners & Developers', desc: 'Epoxy floor and wall finishes, surface assessment and project coordination.', icon: 'Home' },
  { id: 9, name: 'Farmers & Agribusiness', desc: 'Solar water and power planning questions, plus equipment sourcing guidance.', icon: 'Sprout' },
  { id: 10, name: 'Churches & Associations', desc: 'Printing, branding and online registration assistance for community organisations.', icon: 'Church' },
];

const defaultBlog: BlogPost[] = [
  { id: 1, title: 'Buying a laptop in Nigeria: what to check before you pay', excerpt: 'Processor, memory, storage, warranty and battery health — the checks that matter more than the sticker, plus what to ask a seller before parting with money.', category: 'Technology', author: 'Haritech Editorial', date: 'August 2, 2026', readTime: '5 min', content: '' },
  { id: 2, title: 'What to prepare before an importation consultation', excerpt: 'Product specification, quantity, budget, destination and supplier details. A short checklist that makes the first conversation far more useful.', category: 'Importation', author: 'Haritech Editorial', date: 'July 26, 2026', readTime: '4 min', content: '' },
  { id: 3, title: 'Epoxy or tiles? What to weigh before choosing a floor finish', excerpt: 'Surface condition, traffic, moisture, repair options and cost of ownership — how to compare a resin floor with tiles without being sold on shine alone.', category: 'Interiors', author: 'Haritech Editorial', date: 'July 18, 2026', readTime: '6 min', content: '' },
  { id: 4, title: 'Briefing a printing job so the quote matches the result', excerpt: 'Paper, size, quantity, finish and artwork format determine price. What to specify up front to avoid reprints and surprises.', category: 'Printing', author: 'Haritech Editorial', date: 'July 9, 2026', readTime: '4 min', content: '' },
  { id: 5, title: 'Estimating a solar requirement without over-buying', excerpt: 'List the appliances you actually run, how long you run them and when. A practical way to size a system before anyone quotes you.', category: 'Solar', author: 'Haritech Editorial', date: 'June 30, 2026', readTime: '6 min', content: '' },
];

/* Confirmed by the owner: registration name, number, date, status and address
   as supplied. The certificate itself is still requested directly by customers,
   and registration is not presented as authorising regulated activities. */
const defaultCAC: CACInfo = {
  registeredName: 'Haritech Exclusive Business',
  rcNumber: 'RC 9733717',
  registrationDate: 'January 2024',
  status: 'Active',
  address: 'Around Port Harcourt',
};


/** Sentences from the pre-correction site. If any survive a cloud sync they
    are ignored, so a stale row cannot put invented history back on the page. */
const LEGACY_CONTENT_MARKERS = [
  'democratize access to premium digital services',
  'We Build Digital Solutions That Drive Business Growth',
  'Projects Delivered',
  'Exclusive Services',
];

const looksLegacy = (value: unknown): boolean => {
  try {
    const text = JSON.stringify(value);
    return LEGACY_CONTENT_MARKERS.some(marker => text.includes(marker));
  } catch {
    return false;
  }
};

export function getHaritechContent(): HaritechSiteContent {
  if (typeof window === 'undefined') return defaultContent;
  const stored = window.localStorage.getItem(HARITECH_CONTENT_KEY);
  if (!stored) return defaultContent;
  try {
    const parsed = JSON.parse(stored) as Partial<HaritechSiteContent>;
    if (looksLegacy(parsed)) {
      return {
        ...defaultContent,
        email: parsed.email || defaultContent.email,
        phone: parsed.phone || defaultContent.phone,
        whatsapp: parsed.whatsapp || defaultContent.whatsapp,
        address: parsed.address || defaultContent.address,
      };
    }
    return { ...defaultContent, ...parsed };
  } catch {
    return defaultContent;
  }
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
  if (!stored) return defaultBlog;
  try {
    const parsed = JSON.parse(stored) as BlogPost[];
    // Posts saved through the admin dashboard are stamped as approved. Older
    // rows were not reviewed, so they are not published.
    const approved = Array.isArray(parsed) ? parsed.filter(post => post && (post as BlogPost & { approved?: boolean }).approved === true) : [];
    return approved.length ? approved : defaultBlog;
  } catch {
    return defaultBlog;
  }
}

export function setBlogPosts(data: BlogPost[]): void {
  persist(HARITECH_BLOG_KEY, data.map(post => ({ ...post, approved: true })));
  window.dispatchEvent(new Event('haritech-blog-updated'));
}

export function getCACInfo(): CACInfo {
  if (typeof window === 'undefined') return defaultCAC;
  const stored = window.localStorage.getItem(HARITECH_CAC_KEY);
  if (!stored) return defaultCAC;
  try {
    const parsed = JSON.parse(stored) as CACInfo & { confirmed?: boolean };
    // Registration details stay unpublished until the owner confirms them.
    return parsed.confirmed === true ? { ...defaultCAC, ...parsed } : defaultCAC;
  } catch {
    return defaultCAC;
  }
}

export function setCACInfo(data: CACInfo): void {
  persist(HARITECH_CAC_KEY, { ...data, confirmed: true });
  window.dispatchEvent(new Event('haritech-cac-updated'));
}

export function getServiceCategories(): ServiceCategory[] {
  if (typeof window === 'undefined') return defaultServiceCategories;
  const stored = window.localStorage.getItem(HARITECH_SERVICE_CATS_KEY);
  if (!stored) return defaultServiceCategories;
  try {
    const parsed = JSON.parse(stored);
    // An empty stored array (e.g. an admin reset) must fall back to the
    // defaults rather than rendering a services page with no categories.
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultServiceCategories;
  } catch {
    return defaultServiceCategories;
  }
}

export function setServiceCategories(data: ServiceCategory[]): void {
  persist(HARITECH_SERVICE_CATS_KEY, data);
  window.dispatchEvent(new Event('haritech-services-updated'));
}

export function getWhatsAppUrl(text?: string): string {
  const num = getHaritechContent().whatsapp.replace(/[^0-9]/g, '');
  if (text) {
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/${num}`;
}

const defaultFAQ: FAQCategory[] = [
  {
    category: 'General',
    items: [
      { q: 'What is Haritech Exclusive Business?', a: 'A Nigerian multi-service company built around making technology more accessible and helping businesses grow. We bring technology products and computer services, online registration assistance, printing and branding, importation consultation, business consultation, solar energy, project management and property monitoring, and epoxy and interior décor together under one business.' },
      { q: 'Are you a physical shop or an online business?', a: 'Both. Haritech Exclusive Business serves customers in person and online. Contact us before travelling or sending an item so we can confirm the current arrangement for your enquiry.' },
      { q: 'Which service divisions do you have?', a: 'Eight: Laptop and Tech Accessories; Cyber Café and Online Registration Assistance; Printing and Branding; Importation Consultation; Business Consultation; Solar Energy; Project Management and Property Monitoring; Epoxy and Interior Décor.' },
      { q: 'Do you serve customers outside Nigeria?', a: 'The business currently operates in Nigeria. Serving customers in other countries is a long-term ambition, not something we offer today.' },
    ]
  },
  {
    category: 'Cyber Café & Online Registration',
    items: [
      { q: 'Which online registration services can you legitimately assist with?', a: 'General assistance: explaining what an application requires, helping you prepare details and documents, and guiding you through the online forms. Where a step needs an accreditation, licence or official approval that Haritech does not hold, we tell you and explain what you have to do directly with the relevant body.' },
      { q: 'Can you complete a government application for me?', a: 'We can help you prepare and submit information you provide, but we do not claim to be an accredited agent for any agency and we do not sign declarations on your behalf.' },
    ]
  },
  {
    category: 'Tech & Accessories',
    items: [
      { q: 'How can I enquire about a laptop or computer accessory?', a: 'Use the Contact or Request Quote page and specify the item, use case, budget and preferred specifications so we can advise on sourcing options.' },
      { q: 'Do you have products in stock?', a: 'Availability varies. Enquire with details of what you need and we will advise on current options.' },
    ]
  },
  {
    category: 'Importation Consultation',
    items: [
      { q: 'What information should I provide when requesting importation consultation?', a: 'Product name/specifications, quantity, target budget, preferred shipping method (if known), destination and any specific requirements. This helps us give practical guidance.' },
      { q: 'Do you guarantee final costs or delivery dates?', a: 'No. Final costs and timelines depend on the product, supplier, shipping, exchange rates, duties and other charges. We explain these factors so you can budget realistically.' },
    ]
  },
  {
    category: 'Printing & Branding',
    items: [
      { q: 'Which printing or branding services are currently available?', a: 'Availability depends on current equipment and suppliers. Enquire with your specific needs (items, quantities, specs) and we will advise what is possible.' },
    ]
  },
  {
    category: '3D Epoxy & Interior Décor',
    items: [
      { q: 'What should I consider before choosing an epoxy finish?', a: 'Consider the space use, traffic, surface condition, design preference and budget. We assess suitability during consultation and explain care requirements.' },
      { q: 'Do you have a portfolio of completed projects?', a: 'Portfolio details are being confirmed. Where examples are shown, they may be illustrative concepts until verified projects are available.' },
    ]
  },
  {
    category: 'Solar Energy & Project Management',
    items: [
      { q: 'What details are needed to assess a solar energy requirement?', a: 'Power needs (appliances/load), usage pattern, location, budget range and whether grid connection exists. We use this to discuss suitable approaches.' },
      { q: 'Can you handle full project management?', a: 'We support projects with planning, scheduling, budget support, coordination and progress reporting. Whether we take on a scope depends on the work involved; describe it and we will say plainly what we can and cannot coordinate.' },
      { q: 'What is property monitoring?', a: 'Scheduled visits to a property you own, with photographs and a written report on its condition or the progress of work there. It is useful when you are not on site; it is not a valuation, survey or structural inspection.' },
      { q: 'Can I request a quotation before starting a project?', a: 'Yes. Give us the scope, location, timing and any drawings or quotes you already have, and we will set out what the work involves and what it is likely to cost before anything starts.' },
    ]
  },
  {
    category: 'Business Consultation',
    items: [
      { q: 'What information should I provide when requesting business consultation?', a: 'Describe your business, the challenge or goal, timeline, and any constraints. This helps us give practical, relevant advice.' },
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
    { title: 'Energy Needs Assessment', desc: 'We list the appliances you actually run, for how long, and which ones must stay on during an outage — the basis for any honest sizing.', icon: 'Gauge', color: 'from-teal-500 to-cyan-600' },
    { title: 'System Planning', desc: 'Panel, inverter and battery capacity discussed against your load, budget, roof or mounting space and backup priorities.', icon: 'Cpu', color: 'from-purple-500 to-violet-600' },
    { title: 'Equipment Sourcing Guidance', desc: 'What to check on panels, inverters and batteries — ratings, warranty terms, documentation and what the datasheet actually says.', icon: 'Shield', color: 'from-red-500 to-rose-600' },
    { title: 'Installation Coordination', desc: 'Where installation is needed, we coordinate with qualified installers and set out who is responsible for what before work starts.', icon: 'Wrench', color: 'from-slate-500 to-gray-600' },
    { title: 'Maintenance & Servicing Advice', desc: 'Routine checks a system needs, plus how to spot failing batteries or panels producing below their rating.', icon: 'Settings', color: 'from-blue-500 to-indigo-600' },
    { title: 'Solar Water Pumping Enquiries', desc: 'Requirements for irrigation or water supply reviewed, with sourcing guidance for pumps and panels suited to the duty.', icon: 'Droplets', color: 'from-cyan-500 to-blue-600' },
  ],
  whySolar: [
    { title: 'Lower Running Costs', desc: 'Solar can cut daytime draw from the grid or a generator — how much depends on your load and how the system is sized.', icon: 'TrendingUp' },
    { title: 'Backup During Outages', desc: 'A battery-backed system keeps selected circuits running when the grid fails; the duration depends on load and battery size.', icon: 'Zap' },
    { title: 'Cleaner Power', desc: 'Solar generation produces no exhaust on site, which matters where generators sit close to living or working space.', icon: 'TreePine' },
    { title: 'Predictable Maintenance', desc: 'Panels need cleaning and occasional checks; batteries are consumables with a finite life and should be budgeted for.', icon: 'Settings' },
    { title: 'Less Generator Noise', desc: 'Fewer generator hours means less noise and fuel handling, particularly for homes and small offices.', icon: 'Home' },
    { title: 'Plan Before You Buy', desc: 'Sizing against your real load avoids paying for capacity you will never use — or discovering the system is too small.', icon: 'Headphones' },
  ],
  applications: [
    { title: 'Homes', desc: 'Lighting, fans, television, fridge and phone charging — the usual starting point for a home assessment.', icon: 'Home' },
    { title: 'Small Businesses', desc: 'Point-of-sale, lighting, fans and computers where outage cover protects trading hours.', icon: 'Building2' },
    { title: 'Offices', desc: 'Workstations, internet equipment and lighting, with backup scoped to the roles that must keep working.', icon: 'Factory' },
    { title: 'Farms & Water Supply', desc: 'Irrigation and water pumping duties, where panels can run the pump during daylight hours.', icon: 'Warehouse' },
    { title: 'Schools & Training Centres', desc: 'Classroom lighting, fans and computer-room power, sized to the teaching day.', icon: 'Award' },
    { title: 'Clinics & Health Posts', desc: 'Vaccine refrigeration, lighting and essential equipment where continuity matters most.', icon: 'Shield' },
  ],
  stats: [
    { value: 'Assess', label: 'Load review first', icon: 'Gauge' },
    { value: 'Plan', label: 'Sizing & costing', icon: 'Cpu' },
    { value: 'Source', label: 'Equipment guidance', icon: 'Shield' },
    { value: 'Coordinate', label: 'Installation support', icon: 'Wrench' },
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

const defaultEpoxy: EpoxyContent = {
  hero: {
    badge: '3D Epoxy & Interior Décor',
    title: 'Walk On Art. Live In ',
    accent: 'Considered Spaces.',
    subtitle: 'Epoxy floors, metallic resin finishes, wall treatments and interior décor consultation for homes, offices and hospitality spaces in Nigeria. The images below are illustrative design references unless a specific project is confirmed.',
  },
  works: [
    { img: '/images/epoxy-ocean.jpg', title: 'Ocean Depth Floor', tag: 'Concept reference', detail: 'Illustrative concept: a three-layer pour — pigment base, painted water detail, then a clear UV-stable top coat. Feasibility depends on the surface and the space.' },
    { img: '/images/epoxy-lagoon.jpg', title: 'Lagoon Water-Effect Floor', tag: 'Concept reference', detail: 'Illustrative concept: flowing water effect across a continuous floor. Seamless finishes suit open-plan rooms but need a sound, dry substrate.' },
    { img: '/images/epoxy-marble.jpg', title: 'Emerald Marble Reception', tag: 'Concept reference', detail: 'Illustrative concept: dark metallic pigment worked into self-levelling resin to suggest marble. No two pours come out identical.' },
    { img: '/images/epoxy-metallic-green.jpg', title: 'Metallic Pigment Pour', tag: 'Concept reference', detail: 'Illustrative concept: pearlescent pigment feathered by hand before curing, producing soft movement across the surface.' },
    { img: '/images/epoxy-timber.webp', title: 'High-Gloss Timber Seal', tag: 'Concept reference', detail: 'Illustrative concept: timber sealed under a clear coat that lifts the grain and adds protection against spills and scuffs.' },
    { img: '/images/epoxy-living.webp', title: 'Coordinated Living Space', tag: 'Concept reference', detail: 'Illustrative concept: floor, wall and furniture finishes planned together for one cohesive room.' },
    { img: '/images/epoxy-bedroom.jpg', title: 'Panelled Bedroom', tag: 'Concept reference', detail: 'Illustrative concept: wood-panelled walls with concealed warm lighting and a satin floor finish.' },
    { img: '/images/epoxy-lobby.webp', title: 'Lobby Floor Finish', tag: 'Concept reference', detail: 'Illustrative concept: a light reflective floor for a busy entrance. Slip rating and cleaning routine should be agreed before specifying.' },
    { img: '/images/epoxy-feature-wall.webp', title: 'Veined Feature Wall', tag: 'Concept reference', detail: 'Illustrative concept: stone-look wall panels with veining detail, sealed to protect the finish.' },
    { img: '/images/epoxy-mural.jpg', title: 'Hand-Painted Mural', tag: 'Concept reference', detail: 'Illustrative concept: a line-art mural painted on site and sealed under a protective coat.' },
  ],
  offers: [
    { icon: 'Waves', title: '3D Epoxy Flooring', desc: 'Design consultation and installation coordination for resin floors featuring artwork, water or stone effects.', features: ['Design consultation', 'Self-levelling systems', 'Slip-resistant options'] },
    { icon: 'Gem', title: 'Metallic & Marble Effects', desc: 'Pigmented resin finishes that suggest stone or metal, with the sheen and texture agreed before work starts.', features: ['Colour matching', 'Seamless surface', 'Gloss or satin top coat'] },
    { icon: 'Sofa', title: 'Interior Décor Consultation', desc: 'Space planning, colour direction and finish selection based on how the room is actually used.', features: ['Space planning', 'Colour consultation', 'Finish selection'] },
    { icon: 'Brush', title: 'Wall Finishes & Murals', desc: 'Accent walls, feature panels and painted murals, with the seal coat matched to the location.', features: ['Custom designs', 'Protective seal', 'Interior & sheltered exterior'] },
    { icon: 'Layers', title: 'Tables & Furniture Finishing', desc: 'Resin finishing for furniture and counters, subject to the piece and the finish it can take.', features: ['Surface assessment', 'Resin finishing', 'Food-safe options where suitable'] },
    { icon: 'Wrench', title: 'Repair & Recoating', desc: 'Assessment and recoating of cracked, dull or yellowing resin surfaces where the substrate allows.', features: ['Crack & chip assessment', 'Colour refresh', 'Recoat planning'] },
  ],
  process: [
    { icon: 'Camera', title: 'Consultation & Design', desc: 'We discuss the look you want, inspect the space and set out what the surface can realistically take.' },
    { icon: 'Ruler', title: 'Surface Preparation', desc: 'Floors are ground, cleaned and checked for moisture and level — the foundation of any durable finish.' },
    { icon: 'Droplets', title: 'Primer & Base Coat', desc: 'A bonding primer and pigment base coat seal the surface and set the depth of the finish.' },
    { icon: 'Paintbrush', title: 'Artwork & Pigment Pour', desc: 'Artwork or metallic pigment is worked into the resin while it flows, to the agreed design.' },
    { icon: 'Hammer', title: 'Clear Top Coat', desc: 'A clear top coat protects the design and gives the gloss or satin level specified in the quotation.' },
    { icon: 'Sparkles', title: 'Cure & Handover', desc: 'The surface cures, then the finish is checked and the space handed back with care instructions.' },
  ],
  qualities: [
    { icon: 'Gauge', title: 'Durable When Specified Correctly', desc: 'Service life depends on the resin system, traffic and preparation — these are discussed before quoting.' },
    { icon: 'Droplets', title: 'Easy to Clean', desc: 'A seamless surface has fewer joints to trap dirt, so routine cleaning is straightforward.' },
    { icon: 'Sparkles', title: 'Distinctive Finish', desc: 'Pigment, depth and sheen can be tuned to the room rather than picked from a fixed range.' },
    { icon: 'Wrench', title: 'Repairable in Sections', desc: 'Damaged areas can often be reworked without replacing the whole floor, depending on the system used.' },
  ],
};

export function getEpoxyContent(): EpoxyContent {
  if (typeof window === 'undefined') return defaultEpoxy;
  const stored = window.localStorage.getItem(HARITECH_EPOXY_KEY);
  return stored ? { ...defaultEpoxy, ...JSON.parse(stored) } : defaultEpoxy;
}

export function setEpoxyContent(data: EpoxyContent): void {
  persist(HARITECH_EPOXY_KEY, data);
  window.dispatchEvent(new Event('haritech-epoxy-updated'));
}

const defaultWhatWeDo: WhatWeDoArea[] = [
  { title: 'Laptop & Tech Accessories', desc: 'Sourcing guidance for laptops, accessories and peripherals — specifications, compatibility and budget, with stock confirmed per enquiry.', icon: 'Monitor', color: 'from-cyan-500 to-blue-600' },
  { title: 'Cyber Café & Online Registration', desc: 'Computer and internet assistance for everyday tasks, plus guidance on online registration requirements, forms and document checklists.', icon: 'Globe', color: 'from-indigo-500 to-purple-600' },
  { title: 'Printing & Branding', desc: 'Business documents, promotional materials and branded items, quoted per job and subject to the equipment and suppliers available.', icon: 'Palette', color: 'from-purple-500 to-pink-600' },
  { title: 'Importation Consultation', desc: 'Sourcing questions, supplier communication, freight options, duty and total landed-cost planning, with the risks explained before you commit.', icon: 'Briefcase', color: 'from-amber-500 to-orange-600' },
  { title: '3D Epoxy & Interior Décor', desc: 'Surface assessment, finish selection and installation coordination for epoxy floors, metallic resin, wall finishes and interior décor.', icon: 'Layers', color: 'from-teal-500 to-emerald-600' },
  { title: 'Solar Energy', desc: 'Energy needs assessment, system planning and equipment sourcing guidance, with installation coordination where the scope is confirmed.', icon: 'Zap', color: 'from-yellow-500 to-amber-600' },
  { title: 'Project Management & Property Monitoring', desc: 'Planning, scheduling, budgeting support, coordination and progress reporting for projects, plus scheduled monitoring visits and condition reports for property owners.', icon: 'Settings', color: 'from-blue-500 to-indigo-600' },
  { title: 'Business Consultation', desc: 'Practical guidance on planning, operations and digital presence — with a clear statement of what we can and cannot advise on.', icon: 'Headphones', color: 'from-rose-500 to-red-600' },
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

const IMPORT_BANDS_NOTE = 'Indicative ranges only — confirm the current tariff for your HS code and the actual transit time for your route before ordering.';

const defaultImportation: ImportationContent = {
  services: [
    { title: 'Supplier & Product Sourcing', desc: 'We help you clarify specifications, compare supplier quotations and understand what to confirm before paying a deposit.', icon: 'Search', color: 'from-cyan-500 to-blue-600', features: ['Specification review', 'Quotation comparison', 'Supplier verification questions'] },
    { title: 'Freight & Shipping Options', desc: 'Sea and air freight explained, including consolidation. Final rates depend on the carrier, volume, weight and season.', icon: 'Ship', color: 'from-teal-500 to-emerald-600', features: ['Sea vs air comparison', 'Consolidation explained', 'Tracking expectations'] },
    { title: 'Documentation Guidance', desc: 'Which documents a consignment usually needs — Form M, PAAR, SONCAP and packing lists where they apply. Requirements depend on the goods.', icon: 'FileText', color: 'from-blue-500 to-indigo-600', features: ['Document checklist', 'Permit guidance', 'Record keeping'] },
    { title: 'Duty & Landed Cost Planning', desc: 'Breakdown of duty, levies, VAT and clearing charges so you can plan the full cost, not just the factory price.', icon: 'Receipt', color: 'from-amber-500 to-orange-600', features: ['Landed cost breakdown', 'Exchange-rate planning', 'Budget scenarios'] },
    { title: 'Clearance Coordination', desc: 'Coordination with clearing agents on arrival. Clearing time depends on the terminal, documentation and any inspection.', icon: 'Landmark', color: 'from-purple-500 to-violet-600', features: ['Agent coordination', 'Terminal charges explained', 'Delivery planning'] },
    { title: 'Storage & Delivery Arrangement', desc: 'Short-term storage and delivery arrangements for cleared goods, released in the quantities you need.', icon: 'Warehouse', color: 'from-slate-500 to-gray-600', features: ['Short-term storage', 'Delivery planning', 'Dispatch records'] },
  ],
  process: [
    { title: 'Brief & specification', desc: 'You share the product, quantity, target budget and destination. We list the details that still need confirming before any payment.', duration: '1–2 working days' },
    { title: 'Sourcing & quotation review', desc: 'We discuss supplier options and what a quotation should state: unit price, minimum order quantity, packaging and trade terms.', duration: '3–7 days' },
    { title: 'Cost & timeline planning', desc: 'A landed-cost breakdown covering freight, insurance, duty, levies and clearing, with the assumptions written down.', duration: '1–3 days' },
    { title: 'Shipping & documentation', desc: 'Documentation and shipping arrangements proceed once the order and payment terms are agreed.', duration: 'Transit varies by route' },
    { title: 'Clearance & collection', desc: 'Coordination on arrival, then collection or delivery of the cleared goods.', duration: 'Depends on terminal and documents' },
  ],
  requirements: [
    { title: 'Product details', desc: 'What we need before sourcing can be meaningful.', items: ['Product name, model and specification', 'Quantity and packaging preference', 'Target budget and currency', 'Reference photos or supplier links'] },
    { title: 'Documents to expect', desc: 'Documents commonly requested for an import consignment.', items: ['Supplier proforma invoice', 'Form M / PAAR where applicable', 'SONCAP or product certificates where required', 'Packing list and bill of lading or airway bill'] },
    { title: 'Planning checks', desc: 'Points worth settling before you commit money.', items: ['Total landed cost, not only the factory price', 'Whether the goods are restricted for your category', 'How exchange-rate movement affects the budget', 'Storage or delivery plan on arrival'] },
  ],
  stats: [
    { value: '8', label: 'Service divisions', icon: 'Boxes' },
    { value: 'Sea & air', label: 'Freight modes', icon: 'Ship' },
    { value: 'Consultation', label: 'Engagement type', icon: 'FileText' },
    { value: 'Quote-based', label: 'Costing', icon: 'Receipt' },
  ],
  faqs: [
    { q: 'What information should I prepare before starting an importation consultation?', a: 'Product name and specification, quantity, target budget, destination and any reference supplier links or photos. The more precise the details, the more useful the guidance.' },
    { q: 'Do you guarantee final costs or delivery dates?', a: 'No. Final cost and timing depend on the supplier, freight rates, exchange rate, duty assessment and terminal clearance. We explain each factor so you can plan with realistic ranges.' },
    { q: 'Can you tell me the exact duty I will pay?', a: 'Duty depends on the HS code classification and the assessed value at the time of import. We help you understand the likely band, but the assessment is made by customs.' },
    { q: 'Is every product allowed to be imported?', a: 'No. Some goods are restricted or prohibited. We flag categories that usually need extra permits or approval before you commit to a purchase.' },
    { q: 'How do I start?', a: 'Send the product details through the contact form, request a quote, or message us on WhatsApp. We will reply with the questions needed to move to a quotation.' },
  ],
  segments: [
    { id: 'electronics', name: 'Laptops & Electronics', tagline: 'Computing hardware and consumer electronics', dutyBand: '5–20%', mode: 'air', leadTime: '5–12 days by air', notes: IMPORT_BANDS_NOTE, icon: 'Monitor', color: 'from-cyan-500 to-blue-600', examples: ['Laptops', 'Monitors', 'Keyboards', 'Networking gear'], permits: ['SONCAP certificate for regulated electronics', 'Product invoice and packing list'] },
    { id: 'phones', name: 'Phones & Accessories', tagline: 'Handsets, chargers and small accessories', dutyBand: '10–20%', mode: 'air', leadTime: '5–12 days by air', notes: IMPORT_BANDS_NOTE, icon: 'Boxes', color: 'from-blue-500 to-indigo-600', examples: ['Handsets', 'Chargers', 'Cables', 'Cases'], permits: ['SONCAP certificate where applicable', 'NCC type approval for handsets'] },
    { id: 'machinery', name: 'Machinery & Spare Parts', tagline: 'Production and workshop equipment', dutyBand: '5–15%', mode: 'sea', leadTime: '30–45 days by sea', notes: IMPORT_BANDS_NOTE, icon: 'Factory', color: 'from-slate-500 to-gray-600', examples: ['Workshop machines', 'Spare parts', 'Tools', 'Generators'], permits: ['Machine specification sheet', 'Packing list for heavy items'] },
    { id: 'building', name: 'Building Materials & Tiles', tagline: 'Heavy goods normally moved by sea', dutyBand: '10–20%', mode: 'sea', leadTime: '30–50 days by sea', notes: IMPORT_BANDS_NOTE, icon: 'Home', color: 'from-amber-500 to-orange-600', examples: ['Tiles', 'Sanitary ware', 'Fittings', 'Hardware'], permits: ['SONCAP for regulated building products', 'Weight and volume declaration'] },
    { id: 'apparel', name: 'Apparel & Textiles', tagline: 'Clothing, fabric and uniforms', dutyBand: '10–20%', mode: 'sea', leadTime: '25–40 days by sea', notes: IMPORT_BANDS_NOTE, icon: 'Shirt', color: 'from-purple-500 to-violet-600', examples: ['Clothing', 'Fabric rolls', 'Uniforms', 'Bags'], permits: ['Fabric composition details', 'Quantity per style and size'] },
    { id: 'personal-care', name: 'Cosmetics & Personal Care', tagline: 'Regulated consumer products', dutyBand: '10–20%', mode: 'sea', leadTime: '30–45 days by sea', notes: IMPORT_BANDS_NOTE + ' NAFDAC registration is commonly required.', icon: 'Pill', color: 'from-rose-500 to-red-600', examples: ['Skincare', 'Hair products', 'Fragrance', 'Makeup'], permits: ['NAFDAC registration', 'Manufacturer details and batch information'] },
    { id: 'food', name: 'Food Items & Supplements', tagline: 'Consumables with strict documentation', dutyBand: '10–20%', mode: 'sea', leadTime: '30–45 days by sea', notes: IMPORT_BANDS_NOTE + ' NAFDAC and expiry requirements apply.', icon: 'Utensils', color: 'from-emerald-500 to-teal-600', examples: ['Packaged foods', 'Supplements', 'Beverages', 'Ingredients'], permits: ['NAFDAC registration', 'Expiry and batch records', 'Health certificates where required'] },
    { id: 'solar', name: 'Solar & Power Equipment', tagline: 'Panels, inverters, batteries and fittings', dutyBand: '5–15%', mode: 'sea', leadTime: '30–45 days by sea', notes: IMPORT_BANDS_NOTE, icon: 'Sun', color: 'from-yellow-500 to-orange-600', examples: ['Panels', 'Inverters', 'Batteries', 'Mounting kits'], permits: ['SONCAP for regulated electrical items', 'Technical datasheets'] },
    { id: 'baby', name: 'Toys & Baby Items', tagline: 'Goods with safety requirements', dutyBand: '10–20%', mode: 'sea', leadTime: '30–45 days by sea', notes: IMPORT_BANDS_NOTE, icon: 'Baby', color: 'from-teal-500 to-cyan-600', examples: ['Toys', 'Baby care items', 'Nursery products'], permits: ['SONCAP where applicable', 'Age and safety labelling'] },
    { id: 'general', name: 'Packaging & General Cargo', tagline: 'Mixed consignments and packaging supplies', dutyBand: '10–20%', mode: 'sea', leadTime: '30–45 days by sea', notes: IMPORT_BANDS_NOTE, icon: 'Package', color: 'from-slate-500 to-slate-700', examples: ['Bags and cartons', 'Labels', 'Mixed goods'], permits: ['Detailed packing list', 'Itemised invoice per product line'] },
  ],
  preOrders: [],
};

export function getImportationContent(): ImportationContent {
  if (typeof window === 'undefined') return defaultImportation;
  const stored = window.localStorage.getItem(HARITECH_IMPORTATION_KEY);
  if (!stored) return defaultImportation;
  try {
    return { ...defaultImportation, ...JSON.parse(stored) };
  } catch {
    return defaultImportation;
  }
}

export function setImportationContent(data: ImportationContent): void {
  persist(HARITECH_IMPORTATION_KEY, data);
  window.dispatchEvent(new Event('haritech-importation-updated'));
}

const defaultPM: PMContent = {
  categories: [
    { id: 'tech', name: 'Tech & Digital Support', desc: 'Laptop sourcing, accessories and digital assistance requests.', icon: 'Monitor', color: 'from-cyan-500 to-blue-600' },
    { id: 'solar', name: 'Solar Energy', desc: 'Energy needs assessment, system planning and sourcing coordination.', icon: 'Sun', color: 'from-yellow-500 to-orange-600' },
    { id: 'import', name: 'Importation', desc: 'Sourcing, documentation, freight and landed-cost planning.', icon: 'Ship', color: 'from-teal-500 to-emerald-600' },
    { id: 'epoxy', name: 'Epoxy & Interior Décor', desc: 'Surface assessment, finish selection and installation coordination.', icon: 'Paintbrush', color: 'from-fuchsia-500 to-purple-600' },
    { id: 'printing', name: 'Printing & Branding', desc: 'Documents, promotional items and branded materials.', icon: 'FileText', color: 'from-blue-500 to-indigo-600' },
    { id: 'business', name: 'Business Consultation', desc: 'Planning, operations and digital presence guidance.', icon: 'Landmark', color: 'from-rose-500 to-red-600' },
  ],
  stages: [
    { name: 'Enquiry & Scope', desc: 'Requirements captured, open questions listed and the scope confirmed in writing.', sla: '1–3 days' },
    { name: 'Planning', desc: 'Plan, budget range, materials or equipment list and a dated schedule agreed.', sla: '2–5 days' },
    { name: 'Execution', desc: 'Work carried out against the agreed plan, with written updates at each milestone.', sla: 'Scope-dependent' },
    { name: 'Verification & Handover', desc: 'Quality check, documentation and handover of the completed work.', sla: '1–3 days' },
    { name: 'Aftercare', desc: 'Follow-up window for questions, adjustments and support.', sla: 'As agreed' },
  ],
  rituals: [
    { title: 'Scope in writing', desc: 'What is included, what is excluded and what triggers a variation are all written down before work starts.', icon: 'FileText' },
    { title: 'One named contact', desc: 'Every engagement has a single person answerable for updates, so you are not routed between desks.', icon: 'UserCog' },
    { title: 'Progress you can see', desc: 'Milestones and dates are shared in advance, and changes are explained rather than buried.', icon: 'ListChecks' },
    { title: 'Costs before commitment', desc: 'Quotations list the assumptions behind the figures, so a change in rate or quantity is visible.', icon: 'Receipt' },
    { title: 'Documented handover', desc: 'Delivered work comes with the documents, records and instructions you need to keep using it.', icon: 'PackageCheck' },
    { title: 'Honest availability', desc: 'If a service or item is not available yet, we say so instead of accepting a job we cannot deliver.', icon: 'ShieldCheck' },
  ],
  projects: [
    {
      id: 'illustrative-plan',
      title: 'Illustrative delivery plan (example)',
      client: 'Example entry — replaced by your engagement once work begins',
      categoryId: 'tech',
      status: 'Planning',
      progress: 0,
      phase: 'Enquiry & Scope',
      summary: 'This card shows how an engagement appears on the board. Requirements are captured first, then a dated plan and quotation are agreed before any work starts.',
      owner: 'Project lead assigned at kickoff',
      team: [],
      tags: ['Example', 'No live data'],
      deliverables: ['Written scope and assumptions', 'Dated milestone plan', 'Quotation with assumptions listed', 'Handover documentation'],
      milestones: [
        { title: 'Requirements captured', done: false },
        { title: 'Scope and quotation agreed', done: false },
        { title: 'Execution against plan', done: false },
        { title: 'Verification and handover', done: false },
      ],
      startDate: '2026-01-05',
      targetDate: '2026-02-16',
      lastUpdate: 'Example only — no live engagement is shown here.',
    },
  ],
  faqs: [
    { q: 'What does Haritech need from me before a project starts?', a: 'A description of the problem or goal, the location or context, your target budget range and any deadline. We reply with the questions still open before quoting.' },
    { q: 'How is progress reported?', a: 'Each engagement is broken into milestones with dates. Progress is updated against those milestones, and any change to scope or timing is explained in writing.' },
    { q: 'Can I get a quotation before committing?', a: 'Yes. Requests are quoted before work starts, and the quotation lists the assumptions behind the figures.' },
    { q: 'Do you handle projects outside the service divisions listed?', a: 'Only where the capability is genuinely available. If a request falls outside what we can deliver, we say so rather than accepting it.' },
    { q: 'Why does the board show an example entry?', a: 'The example explains how an engagement is tracked. It is replaced by your own project once work begins, and no client details are published without permission.' },
  ],
};

export function getPMContent(): PMContent {
  if (typeof window === 'undefined') return defaultPM;
  const stored = window.localStorage.getItem(HARITECH_PM_KEY);
  if (!stored) return defaultPM;
  try {
    return { ...defaultPM, ...JSON.parse(stored) };
  } catch {
    return defaultPM;
  }
}

export function setPMContent(data: PMContent): void {
  persist(HARITECH_PM_KEY, data);
  window.dispatchEvent(new Event('haritech-pm-updated'));
}
