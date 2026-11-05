/* Plain-language answering for the whole Haritech website — the site-wide
   version of the solar FAQ pattern.

   Deliberately a curated knowledge base with a keyword matcher, not a
   free-text generator: every answer is written here, in the repository, and
   checked against the site's standing rules:

   - Prices quote ONLY the approved price book (src/config/pricing.ts,
     customer-facing approvals dated 2026-10-28). Where a price is
     "starting" or per-session, the answer says so honestly.
   - Scope details are "confirmed in the quotation" — never invented.
   - Importation is a consultation/coordination service: Haritech helps
     source, verify, ship and clear, but it does not sell goods.
   - Solar-specific questions hand over to the solar FAQ (deeper knowledge:
     sizing, batteries, fault handling) so the two KBs stay consistent.
   - No statistics, client names or guarantees are invented. */

import { PRICE_BOOK } from '../../config/pricing';
import {
  answerQuestion as answerSolarQuestion,
  displayQuestion as displaySolarQuestion,
  matchFaq as matchSolarFaq,
  SOLAR_FAQ,
} from '../solar/solarFaq';

export interface FaqEntry {
  id: string;
  /** The questions visitors actually ask, plain and spoken. */
  questions: string[];
  keywords: string[];
  /** Plain-language answer. Paragraphs separated by '\n\n'. */
  answer: string;
  /** Optional internal link shown under the answer. */
  link?: { to: string; label: string };
  /** Follow-up questions offered as chips. Reference FaqEntry ids. */
  related?: string[];
}

export const HARI_FAQ_ENTRY_IDS = [
  'about-company',
  'services-overview',
  'quote-process',
  'contact-human',
  'price-guide',
  'web-costs',
  'cac-registration',
  'cac-costs',
  'cac-application-desk',
  'importation-overview',
  'importation-duty',
  'project-management',
  'epoxy-costs',
  'interior-design',
  'cyber-services',
  'printing-costs',
  'business-consultation',
  'tech-sourcing',
  'solar-packages',
  'solar-sizes',
  'client-portal',
  'book-a-service',
  'delivery-time',
  'where-is',
] as const;

export type HaritechFaqEntryId = (typeof HARI_FAQ_ENTRY_IDS)[number];

const ngn = (value: number): string => `₦${value.toLocaleString('en-NG')}`;

const HARI_VERSION =
  'Answers are plain-language estimates from the published Haritech guide. Final scope and price are confirmed in a quotation.';

/** Question chips the widget offers before anything is typed. */
export const HARI_STARTER_QUESTIONS = [
  'What does Haritech do?',
  'How much does a website cost?',
  'How do I register a CAC business name?',
  'How much does solar cost?',
];

/* Solar package prices are read from the price book so the two KBs can
   never drift apart. */
const solarPackage = (id: string, label: string): string => {
  const row = PRICE_BOOK.find((item) => item.id === id);
  return `${label} — ${row?.priceNgn !== null && row?.priceNgn !== undefined ? ngn(row.priceNgn) : 'quote'}`;
};

const SOLAR_PACKAGE_LINES = [
  solarPackage('SOL-001', '1.5 kVA Essential'),
  solarPackage('SOL-002', '3.5 kVA Home Pro'),
  solarPackage('SOL-003', '5 kVA Executive'),
  solarPackage('SOL-004', '10 kVA Commercial'),
  solarPackage('SOL-005', '20 kVA Industrial'),
].join('; ');

export const HARI_FAQ: FaqEntry[] = [
  {
    id: 'about-company',
    questions: [
      'who is haritech',
      'what is haritech',
      'about haritech',
      'which company',
      'tell me about haritech',
    ],
    keywords: ['haritech', 'about', 'who are you', 'company background', 'registered'],
    answer:
      'Haritech Exclusive Business is a registered Nigerian multi-service company (CAC RC 9733717), based around Port Harcourt, Rivers State.\n\nThe business runs eight divisions that all live on this one website: solar energy, laptop & tech accessories, cyber café & online registration, printing & branding, importation consultation, business consultation, project management & property monitoring, and 3D epoxy & interior décor.',
    link: { to: '/haritech/about', label: 'About Haritech' },
    related: ['services-overview', 'contact-human'],
  },
  {
    id: 'services-overview',
    questions: [
      'what does haritech do',
      'what services do you offer',
      'list of services',
      'what can haritech help me with',
      'your services',
      'what do you people do',
    ],
    keywords: ['services', 'what do you do', 'offer', 'divisions', 'help me'],
    answer:
      'Haritech runs eight divisions:\n\n• Solar energy — assess, size, source and coordinate complete systems (the Solar Advisor tools on this site do the first part with you).\n• Laptop & tech accessories — sourcing and guidance to match your spec and budget.\n• Cyber café & online registration — typing, printing, scanning, internet and online registration assistance.\n• Printing & branding — business documents, stationery and branded items.\n• Importation consultation — sourcing, supplier verification, freight, documentation and customs coordination.\n• Business consultation — planning, digital presence and operations guidance.\n• Project management & property monitoring — planning, budgeting and verified progress reports.\n• 3D epoxy & interior décor — decorative floors, wall finishes and styling.',
    link: { to: '/haritech/services', label: 'See all services' },
    related: ['price-guide', 'quote-process'],
  },
  {
    id: 'quote-process',
    questions: [
      'how do i get a quote',
      'how to request a quotation',
      'how do i make an enquiry',
      'how do i pay',
      'payment methods',
    ],
    keywords: ['quote', 'quotation', 'enquiry', 'request', 'payment', 'pay'],
    answer:
      'Open the quote request form, choose the service, tick your budget range and timeline, and describe the project. It reaches Haritech directly and you get a reference for follow-up. WhatsApp is the backup route if anything stalls.\n\nA quotation then confirms the exact scope, price and timeline — that document, not the price guide, is the binding figure.',
    link: { to: '/haritech/request-quote', label: 'Request a quote' },
    related: ['book-a-service', 'delivery-time'],
  },
  {
    id: 'contact-human',
    questions: [
      'how do i contact haritech',
      'talk to a human',
      'speak with someone',
      'your phone number',
      'whatsapp number',
      'office address',
      'where are you located',
      'working hours',
      'are you open',
    ],
    keywords: ['contact', 'phone', 'number', 'whatsapp', 'address', 'location', 'human', 'person', 'hours', 'open today'],
    answer:
      'The Contact page lists the current WhatsApp, phone and email details and business hours, and has a short enquiry form that is tracked with a reference number. WhatsApp is the fastest route for anything urgent.\n\nFor solar faults (beeping, smoke, shutdown): stop using the equipment if unsafe, keep clear, and contact a qualified installer — a chat cannot diagnose a fault.',
    link: { to: '/haritech/contact', label: 'Contact page' },
    related: ['book-a-service'],
  },
  {
    id: 'price-guide',
    questions: [
      'where are your prices',
      'price list',
      'how much do you charge',
      'show me prices',
      'price guide',
    ],
    keywords: ['price', 'prices', 'cost', 'charge', 'pricing', 'guide', 'rate', 'fee', 'how much'],
    answer:
      'There is a public price guide on this website with the current approved prices for every priced service, from web development to solar, epoxy, CAC and importation fees. Solar package prices include installation; other prices are for Haritech service fees only unless stated.\n\nAnything not in the guide is quote-only: the quotation confirms it.',
    link: { to: '/haritech/price-guide', label: 'Open the price guide' },
    related: ['web-costs', 'quote-process'],
  },
  {
    id: 'web-costs',
    questions: [
      'how much is a website',
      'how much is web design',
      'website development cost',
      'can you build a website',
      'web design price',
      'do you design websites',
      'ecommerce website cost',
      'how much for a website',
    ],
    keywords: ['website', 'web design', 'web development', 'landing page', 'ecommerce', 'e-commerce', 'saas', 'seo', 'logo'],
    answer:
      `Published website packages:\n\n• Business landing page / brand website — ${ngn(350000)} per project\n• Dynamic corporate portal / e-commerce website — ${ngn(600000)} per project\n• Custom SaaS / cloud architecture — ${ngn(750000)} per project\n• Advanced SEO add-on — ${ngn(50000)}\n• Brand identity / logo kit add-on — ${ngn(50000)}\n• Maintenance & server backups — ${ngn(25000)} per month\n\nDomain, hosting, payment-gateway and cloud costs are billed separately. Final scope, page count and revisions are confirmed in the quotation.`,
    link: { to: '/haritech/price-guide', label: 'Price guide' },
    related: ['quote-process', 'price-guide'],
  },
  {
    id: 'cac-registration',
    questions: [
      'how do i register a cac business name',
      'cac registration',
      'register my business',
      'register a company',
      'business name registration',
      'how to register ltd',
      'ngo registration',
      'cac',
    ],
    keywords: ['cac', 'register', 'registration', 'business name', 'llc', 'ltd', 'ngo', 'trustees', 'incorporate'],
    answer:
      'Haritech handles the whole CAC filing for you — name search, submission and follow-up — and has a public CAC page with a fee estimator and an Application Desk.\n\nThe desk is a six-step guided form that issues a CAC-XXXXXXXX reference number. You can then track the file with that reference plus the phone number or email you applied with, and download any documents the desk publishes — no sign-in needed.\n\nRegistration package prices (each includes the official CAC fee and the ₦20,000 assistance fee):\n\n• Business Name — ₦30,000\n• Limited Liability Company (Ltd) — ₦55,000\n• NGO — ₦95,000\n• Incorporated Trustees — ₦120,000\n• Foreign company assistance — ₦150,000\n• Express processing add-on — ₦30,000 (it speeds up Haritech handling, not the CAC itself)\n\nThe express add-on cannot legally speed up the registry.',
    link: { to: '/haritech/cac-registration', label: 'CAC registration & estimator' },
    related: ['cac-costs', 'quote-process'],
  },
  {
    id: 'cac-costs',
    questions: [
      'how much is cac registration',
      'cac fee',
      'cac price',
      'how long does cac take',
      'cac duration',
    ],
    keywords: ['cac', 'how long', 'duration', 'timeline', 'status', 'approved', 'certificate'],
    answer:
      'CAC package prices are on the CAC page: Business Name ₦30,000, Ltd ₦55,000, NGO ₦95,000, Trustees ₦120,000, foreign company ₦150,000 — the official registry fee plus assistance is inside each package.\n\nProcessing time depends on the registry queue; the express add-on only speeds up Haritech’s side of the work. If you already applied, check progress on the same page under “Track an application” with your reference number and the phone number or email used on the file. The tracker shows Haritech’s handling stages — no assistant can peek into the Commission’s internal system.',
    link: { to: '/haritech/cac-registration', label: 'CAC page' },
    related: ['cac-registration', 'cac-application-desk', 'contact-human'],
  },
  {
    id: 'cac-application-desk',
    questions: [
      'track my cac application',
      'check cac application status',
      'cac application status',
      'where is my cac certificate',
      'download cac certificate',
      'cac reference number',
      'is my cac approved',
      'start a cac application',
    ],
    keywords: ['track', 'tracking', 'status', 'reference', 'certificate', 'download', 'approved', 'application desk', 'application'],
    answer:
      'The CAC page has an Application Desk at /haritech/cac-registration#application-desk.\n\nStart an application in six guided steps — registration type, proposed names, applicant details, directors or trustees, documents and review — and the desk issues a CAC-XXXXXXXX reference number when you submit. Keep that reference.\n\nTo track it, open “Track an application” and enter the reference together with the same phone number or email used on the application. No sign-in is needed, and the reference alone is not enough. When the desk publishes documents, such as the certificate, they appear there as download links.\n\nThe stages describe how Haritech is handling your file; they are not a live feed from the Corporate Affairs Commission’s internal system. The Commission decides the application.',
    link: { to: '/haritech/cac-registration', label: 'CAC application desk' },
    related: ['cac-registration', 'cac-costs', 'contact-human'],
  },
  {
    id: 'importation-overview',
    questions: [
      'how does importation work',
      'can you import goods for me',
      'importation service',
      'how do i order from china',
      'supplier sourcing',
      'freight forwarding',
      'customs clearing',
    ],
    keywords: ['import', 'importation', 'china', 'supplier', 'freight', 'clearing', 'goods', 'form m', 'soncap', 'nafdac', 'paar'],
    answer:
      'Importation is run as a consultation-plus-coordination service: Haritech sources and verifies suppliers, helps with documentation (Form M, PAAR, SONCAP, NAFDAC where the goods need it), coordinates sea or air freight (including consolidation), and works with the clearing chain through to delivery.\n\nPublished Haritech service fees: product sourcing ₦10,000, pre-order handling ₦5,000, supplier verification ₦10,000, cargo consolidation coordination ₦50,000, inspection coordination ₦20,000, consultation session ₦20,000. Goods, freight, duty and warehouse charges are separate real costs, quoted case by case.',
    link: { to: '/haritech/importation', label: 'Importation page' },
    related: ['importation-duty', 'quote-process'],
  },
  {
    id: 'importation-duty',
    questions: [
      'how much is duty',
      'customs duty on my goods',
      'duty rate',
      'landed cost',
      'how much will clearance cost',
      'exchange rate',
    ],
    keywords: ['duty', 'customs', 'clearance cost', 'landed cost', 'tariff', 'exchange rate', 'dollar rate'],
    answer:
      'Duty depends on the item category, value and freight mode — there is no single honest number before the actual goods and shipping figures exist. The importation page shows the goods categories Haritech handles with general duty bands, and the consultation produces a landed-cost estimate before you commit.\n\nWhat the price guide does publish are Haritech coordination fees, not the customs amount.',
    link: { to: '/haritech/importation', label: 'Importation process & duties' },
    related: ['importation-overview'],
  },
  {
    id: 'project-management',
    questions: [
      'can you manage my project',
      'property monitoring',
      'project management service',
      'can you supervise my building',
      'progress report',
    ],
    keywords: ['project management', 'supervise', 'supervision', 'monitoring', 'building', 'property', 'progress', 'procurement'],
    answer:
      'Yes — Haritech plans and schedules projects, supports budget control, coordinates procurement, and does site monitoring visits that come back with photos and a written condition report you can hold on to.\n\nStarting prices: supervision, procurement coordination, feasibility, planning and site visits from ₦20,000–₦50,000 depending on unit (day, visit, report or project). Exact arrangement is confirmed when you enquire; ongoing clients track progress in the client portal.',
    link: { to: '/haritech/project-management', label: 'Project management hub' },
    related: ['client-portal', 'quote-process'],
  },
  {
    id: 'epoxy-costs',
    questions: [
      'how much is epoxy per square meter',
      'epoxy flooring price',
      '3d floor cost',
      'epoxy',
      'does epoxy cover scratches',
    ],
    keywords: ['epoxy', 'floor', 'floors', '3d epoxy', 'metallic', 'marble', 'per square', 'm2'],
    answer:
      `Published epoxy finish prices (per m², including surface preparation and UV topcoat):\n\n• Solid Colour Gloss — ${ngn(35000)}\n• Decorative Flake — ${ngn(40000)}\n• Metallic Sheen — ${ngn(30000)}\n• 3D Marble Vein — ${ngn(35000)}\n• Glow-in-the-Dark — ${ngn(40000)}\n• 3D Art / Mural — ${ngn(65000)}\n\nComplex 3D artwork can carry a separate design fee, and moisture or damage repairs are quoted separately. A site check fixes the final area and price.`,
    link: { to: '/haritech/3d-epoxy', label: '3D epoxy studio' },
    related: ['interior-design', 'quote-process'],
  },
  {
    id: 'interior-design',
    questions: [
      'interior decoration price',
      'interior design services',
      'can you decorate my home',
      'wall decor',
      'space planning',
    ],
    keywords: ['interior', 'decor', 'decoration', 'wall', 'furniture', 'space planning', 'visualisation', 'rendering'],
    answer:
      'Interior work sits with the epoxy & interior division: space planning, 3D visualisations, wall feature design, and coordination of materials and installation alongside the floor finish.\n\nStarting prices: consultation ₦10,000, space planning ₦10,000, 3D rendering ₦20,000, installation coordination ₦20,000 — each confirmed per room or per project before booking.',
    link: { to: '/haritech/3d-epoxy', label: 'Interior & epoxy page' },
    related: ['epoxy-costs'],
  },
  {
    id: 'cyber-services',
    questions: [
      'cyber cafe services',
      'typing price',
      'photocopy price',
      'printing and scanning price',
      'online registration help',
      'cv writing price',
    ],
    keywords: ['cyber', 'typing', 'photocopy', 'photocopies', 'scan', 'scanning', 'internet service', 'online registration', 'cv'],
    answer:
      'Cyber café services (starting references — unit confirmed before quoting):\n\n• Typing from ₦500\n• Black & white printing/photocopying from ₦300 per page\n• Colour printing from ₦500 per page\n• Scanning from ₦500\n• Internet/computer use from ₦2,000\n• Online registration assistance ₦3,000 (Haritech fee only — official portal fees are separate and itemised)\n• CV preparation ₦5,000\n\nCyber café assistance means helping you fill and submit forms correctly; it is not the same as an authorised agency service.',
    link: { to: '/haritech/services', label: 'Services page' },
    related: ['contact-human'],
  },
  {
    id: 'printing-costs',
    questions: [
      'printing price',
      'branded tshirt cost',
      'how much are flyers',
      'business card price',
      'banner price',
      'logo design cost',
      'branding services',
    ],
    keywords: ['printing', 'flyer', 'business card', 'banner', 't-shirt', 'tshirt', 'shirt', 'poster', 'branding', 'logo'],
    answer:
      'Printing & branding starting references (quantity, size and material confirm the final figure):\n\n• Business cards from ₦500\n• Flyers from ₦200 each\n• Posters from ₦1,000\n• Banners from ₦1,000 (usually quoted per square metre)\n• Branded T-shirts from ₦2,500\n• Logo design ₦20,000 (a fixed package price)\n\nLarge-format work starts from ₦20,000 depending on area and material.',
    link: { to: '/haritech/services', label: 'Services page' },
    related: ['business-consultation'],
  },
  {
    id: 'business-consultation',
    questions: [
      'business consultation',
      'can you help my business plan',
      'business advice price',
      'business proposal',
      'how do i start a business',
    ],
    keywords: ['consultation', 'consulting', 'business plan', 'business advice', 'proposal', 'start a business', 'register'],
    answer:
      'Business consultation covers planning, digital presence and operations guidance. Published rates: a consultation session ₦20,000, business plan preparation ₦20,000, importation advisory ₦20,000, full business documents/proposals from ₦150,000.\n\nWritten deliverables and the number of sessions are confirmed in the quotation before work starts.',
    link: { to: '/haritech/services', label: 'Services page' },
    related: ['quote-process', 'price-guide'],
  },
  {
    id: 'tech-sourcing',
    questions: [
      'do you sell laptops',
      'laptop price',
      'can you help me buy a laptop',
      'tech accessories',
      'buy computers',
    ],
    keywords: ['laptop', 'laptops', 'computer', 'pc', 'accessories', 'tech', 'spec'],
    answer:
      'Haritech sources laptops and tech accessories and helps you match the specification to your budget — you get honest guidance on what a given budget realistically buys, and help checking completeness and compatibility before you buy.\n\nBecause laptop models, stock and pricing move constantly, there is no fixed published set: the ask is handled as an enquiry with the current market confirmed in writing.',
    link: { to: '/haritech/services', label: 'Services page' },
    related: ['contact-human', 'quote-process'],
  },
  {
    id: 'solar-packages',
    questions: [
      'how much does solar cost',
      'solar package price',
      'solar energy price',
      'cost of installing solar',
      'solar packages',
      'solar energy cost',
      'how much is your solar',
    ],
    keywords: ['solar', 'package', 'packages', 'kva', 'price', 'cost', 'install'],
    answer: `The published Haritech solar packages (installation included; battery, inverter and panel specification confirmed in the quotation):\n\n${SOLAR_PACKAGE_LINES}\n\nExtras: site survey ₦10,000; maintenance ₦50,000; lithium battery upgrade ₦500,000; inverter upgrade ₦500,000; panel upgrade ₦200,000.\n\nTo get a tailored figure, use the Solar System Designer on this website — it sizes a system from your actual appliances and generates a designer's report.`,
    link: { to: '/haritech/solar-advisor', label: 'Solar System Designer' },
    related: ['solar-sizes', 'quote-process'],
  },
  {
    id: 'solar-sizes',
    questions: [
      'what solar package for my house',
      'which kva do i need',
      'how many panels do i need',
      'can it power my ac',
      'what size solar system',
      'will it carry my fridge and freezer',
    ],
    keywords: ['kva do i need', 'which package', 'size system', 'how many panels', 'power my', 'carry my', 'air conditioner', 'freezer', 'fridge'],
    answer:
      'System size is an appliance-sums question, not a guess: add up what you will actually run and for how many hours, then the inverter rating follows (kVA ≥ load with headroom) and the battery/panel counts follow the runtime you want.\n\nThe Solar System Designer on this site walks you through it in plain language and produces a report a qualified installer confirms on site. Battery specs, panel wattages and inverter models are only ever confirmed in the quotation — not in chat.',
    link: { to: '/haritech/solar-advisor', label: 'Size a system now' },
    related: ['solar-packages', 'contact-human'],
  },
  {
    id: 'client-portal',
    questions: [
      'client portal',
      'how do i log in',
      'where do i see my project',
      'project status',
      'can i track my project',
    ],
    keywords: ['portal', 'login', 'log in', 'sign in', 'track', 'my project', 'status', 'update'],
    answer:
      'The Client Portal is where active Haritech project clients see their phases, progress, milestones, documents and updates. Access is by the sign-in you were given — the portal itself never asks for anything beyond that, and support for portal access goes through WhatsApp.',
    link: { to: '/haritech/client-portal', label: 'Client portal' },
    related: ['project-management', 'contact-human'],
  },
  {
    id: 'book-a-service',
    questions: [
      'how do i book',
      'book a service',
      'can you come to my site',
      'site visit',
      'inspection visit',
      'schedule',
    ],
    keywords: ['book', 'booking', 'visit', 'appointment', 'come to', 'schedule', 'inspection', 'enquiry form'],
    answer:
      'Service bookings start with an enquiry: the request-quote form (with service, budget and timeline) or WhatsApp. Solar, epoxy and interior jobs start with a site assessment before a confirmed date; the price guide lists site visits and surveys.\n\nYou get an instant reference for form submissions, and the team confirms the schedule directly with you.',
    link: { to: '/haritech/request-quote', label: 'Book a service' },
    related: ['delivery-time', 'contact-human'],
  },
  {
    id: 'delivery-time',
    questions: [
      'how long does it take',
      'delivery time',
      'how fast',
      'when can you deliver',
      'timeline',
    ],
    keywords: ['how long', 'duration', 'time', 'delivery', 'fast', 'timeline', 'when', 'weeks'],
    answer:
      'It depends entirely on the service: solar and epoxy start with a site survey; most projects are planned within 1–4 weeks of scope confirmation; CAC filings run on the registry queue; importation depends on supplier and shipping lead times, which the consultation sets out honestly before you commit.\n\nNo assistant promises a date: the quotation and the consultant on your case confirm the timeline, because real production and third parties are involved.',
    link: { to: '/haritech/request-quote', label: 'Start an enquiry' },
    related: ['quote-process', 'contact-human'],
  },
  {
    id: 'where-is',
    questions: [
      'where is the price guide',
      'where is solar advisor',
      'where can i find',
      'where is the monitor',
      'navigate the site',
      'what pages do you have',
      'i cannot find it',
    ],
    keywords: ['where', 'find', 'page', 'monitor', 'navigate', 'menu', 'link', 'lost'],
    answer:
      'Main destinations on this website:\n\n• Price guide — every approved price\n• Solar Energy → Solar System Designer (size a system) → Power Monitor (readings)\n• Importation, Project & Property, 3D Epoxy, CAC Registration — division pages\n• Request a Quote and Contact — enquiries\n• Blog & FAQ — extra reading\n\nThis helper cannot click for you, but every answer below can carry a direct button to the right page.',
    link: { to: '/haritech', label: 'Home' },
    related: ['price-guide', 'solar-packages'],
  },
];

/** Version / disclaimer string. */
export const HARI_FAQ_VERSION = HARI_VERSION;

export const HARI_FALLBACK_ANSWER =
  'I answer questions about Haritech — services, published prices, solar, importation, CAC, booking and the tools on this site. I could not match that question with confidence, so I will not guess.\n\nWhatsApp or the Contact page reaches a human for anything specific to your own situation.';

const norm = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9\s.]/g, ' ').replace(/\s+/g, ' ').trim();

export interface HarichMatch {
  entry: FaqEntry;
  score: number;
}

/** Score every entry by keyword hits in the normalised question. Multi-word
    keywords count double; an exact phrase match from `questions` wins outright. */
export const matchHaritechFaq = (question: string): HarichMatch | null => {
  const text = norm(question);
  if (!text) return null;

  let best: HarichMatch | null = null;
  for (const entry of HARI_FAQ) {
    let score = 0;
    for (const q of entry.questions) {
      if (text.includes(norm(q))) {
        score += 100;
      }
    }
    for (const keyword of entry.keywords) {
      if (text.includes(norm(keyword))) {
        score += norm(keyword).includes(' ') ? 2 : 1;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }
  return best;
};

export interface HaritechAnswer {
  answer: string;
  entryId: HaritechFaqEntryId | null;
  link?: { to: string; label: string };
  related: string[];
  /** True when the answer came from the solar knowledge base. */
  fromSolar: boolean;
}

/** Answer a site-wide question: the Haritech KB first, then the deeper solar
    KB for the technical solar questions, then an honest fallback. */
export const answerAnyQuestion = (question: string): HaritechAnswer => {
  const match = matchHaritechFaq(question);
  if (match && match.score >= 2) {
    const entry = match.entry;
    const related: string[] = entry.related ?? [];
    if (entry.link) {
      return { answer: entry.answer, entryId: entry.id as HaritechFaqEntryId, link: entry.link, related, fromSolar: false };
    }
    return { answer: entry.answer, entryId: entry.id as HaritechFaqEntryId, related, fromSolar: false };
  }

  const solar = answerSolarQuestion(question);
  if (solar.entryId !== null) {
    const route = { answer: solar.answer, entryId: null, related: solar.related, fromSolar: true as const };
    return solar.link ? { ...route, link: solar.link } : route;
  }

  return { answer: HARI_FALLBACK_ANSWER, entryId: null, related: ['services-overview', 'price-guide', 'solar-packages'], fromSolar: false };
};

/** Follow-up chips resolve across both knowledge bases. */
export const displayAnyQuestion = (id: string, isSolar: boolean): string => {
  if (isSolar) {
    const found = SOLAR_FAQ.find((row) => row.id === id);
    if (!found) return id;
    return displaySolarQuestion(found.questions[0]);
  }
  const found = HARI_FAQ.find((row) => row.id === id);
  if (!found) return id;
  const body = found.questions[0];
  const handled = body.charAt(0).toUpperCase() + body.slice(1).replace(/\bi\b/g, 'I');
  return /[?.]$/.test(handled) ? handled : `${handled}?`;
};

/** Exposed so tests (and future tooling) can assert coverage. */
export const HARI_KB_VERSION = 'haritech-faq-v1';

/* ── Retrieval context for the live LLM ──────────────────────────────── */

const CONTEXT_TOTAL_LIMIT = 3500;
const CONTEXT_ENTRY_LIMIT = 1300;

/** Best-matching knowledge-base excerpt for a question, or null when nothing
    matches confidently. Both KBs contribute: the site-wide entries for
    services/prices/routes and the deep solar entries for the technical
    questions, so the live AI answers with the site's exact grounded facts. */
export const buildRemoteContext = (question: string): string | null => {
  const parts: string[] = [];
  const hari = matchHaritechFaq(question);
  if (hari && hari.score >= 2) {
    parts.push(`Haritech knowledge base — topic "${hari.entry.id}":\n${hari.entry.answer}`);
  }
  const sol = matchSolarFaq(question);
  if (sol && sol.score >= 2) {
    parts.push(`Solar knowledge base — topic "${sol.entry.id}":\n${sol.entry.answer}`);
  }
  if (parts.length === 0) return null;

  let remaining = CONTEXT_TOTAL_LIMIT;
  const blocks: string[] = [];
  for (const part of parts) {
    if (remaining <= 0) break;
    blocks.push(part.slice(0, Math.min(CONTEXT_ENTRY_LIMIT, remaining)));
    remaining -= CONTEXT_ENTRY_LIMIT;
  }
  return blocks.join('\n\n');
};
