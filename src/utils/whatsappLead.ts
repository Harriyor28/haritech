/**
 * WhatsApp lead context helpers.
 *
 * Kept free of Supabase/browser imports (same convention as cacTypes.ts and
 * identityDeskTypes.ts) so scripts/whatsapp-lead-tests.mjs can bundle this
 * file directly into a dependency-free test harness. The only browser API
 * touched is `window.location.pathname`, and only through a guarded read.
 */

/** Friendly page names for the "sent from the … page" line so every WhatsApp
    lead tells the desk which service the visitor was looking at. */
export const LEAD_PAGE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/haritech': 'homepage',
  '/haritech/about': 'About',
  '/haritech/what-we-do': 'What we do',
  '/haritech/services': 'Services',
  '/haritech/price-guide': 'price guide',
  '/haritech/industries': 'Industries',
  '/haritech/portfolio': 'Portfolio',
  '/haritech/cac-registration': 'CAC registration',
  '/haritech/blog': 'Blog',
  '/haritech/faq': 'FAQ',
  '/haritech/contact': 'Contact',
  '/haritech/request-quote': 'quote request',
  '/haritech/solar-energy': 'solar energy',
  '/haritech/solar-advisor': 'solar advisor',
  '/haritech/solar-advisor/monitor': 'solar monitoring',
  '/haritech/importation': 'importation',
  '/haritech/project-management': 'project management',
  '/haritech/client-portal': 'client portal',
  '/haritech/3d-epoxy': '3D epoxy and interior decor',
  '/admin': 'admin console',
};

/** Label for the page a visitor is on when they tap a WhatsApp button. */
export function getLeadPageLabel(pathname?: string): string {
  const path = pathname ?? (typeof window === 'undefined' ? '' : window.location.pathname);
  if (!path) return '';
  if (LEAD_PAGE_LABELS[path]) return LEAD_PAGE_LABELS[path];
  if (path.startsWith('/project/')) return 'portfolio project page';
  const last = path.split('/').filter(Boolean).pop() || '';
  if (!last) return '';
  return last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Message body a WhatsApp opener should carry: the greeting, whatever the
    visitor is asking about, and the page they came from. */
export function buildLeadMessage(subject: string | undefined, label: string): string {
  const context = label ? ` Sent from the ${label} page on your website.` : '';
  return subject
    ? `Hello Haritech Exclusive Business! ${subject.trim()}${context}`
    : `Hello Haritech Exclusive Business! I would like to consult about your services.${context}`;
}

/** Full wa.me URL for a lead opener. `number` must already be digits only. */
export function buildLeadWhatsAppUrl(number: string, subject?: string): string {
  const label = getLeadPageLabel();
  return `https://wa.me/${number}?text=${encodeURIComponent(buildLeadMessage(subject, label))}`;
}
