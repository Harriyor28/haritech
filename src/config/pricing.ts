/* ── Haritech price book ──────────────────────────────────────────────────
   Single source of truth for customer-facing prices approved for the site
   on 2026-10-28. Never duplicate a number in a component: import it here.

   Rules encoded in this file:
   - Solar package prices include installation. Do not add it again.
   - CAC package prices include the ₦20,000 registration assistance fee.
   - Standard epoxy finish prices include surface preparation and UV topcoat.
     The standalone preparation/topcoat rates apply only outside a package.
   - Freight is variable. No exchange rate or USD/kg rate is stored here.
   - Items the owner has not priced stay null or are marked quote-only.
   ------------------------------------------------------------------------ */

export const CURRENCY = 'NGN' as const;

export type PricingType =
  | 'fixed'
  | 'starting'
  | 'variable'
  | 'per_session'
  | 'per_project'
  | 'quote_required'
  | 'conditional';

export interface PriceEntry {
  readonly id: string;
  readonly category: string;
  readonly service: string;
  readonly priceNgn: number | null;
  readonly unit: string | null;
  readonly pricingType: PricingType;
  readonly startingAt: boolean;
  readonly note: string;
}

export const CATEGORIES = {
  web: 'Web & Digital Services',
  cac: 'Business Registration & CAC Assistance',
  solar: 'Solar Energy',
  epoxy: 'Epoxy Flooring',
  import: 'Importation & Pre-order',
  business: 'Business Consultation',
  printing: 'Printing & Branding',
  cyber: 'Computer Services & Cyber Café',
  interior: 'Interior Design & Décor',
  project: 'Project Supervision & Procurement',
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export const CATEGORY_ORDER: CategoryKey[] = [
  'web', 'cac', 'solar', 'epoxy', 'import',
  'business', 'printing', 'cyber', 'interior', 'project',
];

const entry = (
  id: string,
  category: string,
  service: string,
  priceNgn: number | null,
  unit: string | null,
  pricingType: PricingType,
  note: string,
  startingAt = false,
): PriceEntry => ({ id, category, service, priceNgn, unit, pricingType, note, startingAt });

export const PRICE_BOOK: PriceEntry[] = [
  // Web & Digital
  entry('WEB-001', CATEGORIES.web, 'Business landing page / brand website', 350000, 'project', 'fixed', 'Scope, page count and revisions confirmed in the quotation. Domain and hosting are not included.'),
  entry('WEB-002', CATEGORIES.web, 'Dynamic corporate portal / e-commerce website', 600000, 'project', 'fixed', 'Final scope depends on integrations and product volume. Gateway and licence fees are separate.'),
  entry('WEB-003', CATEGORIES.web, 'Custom SaaS / cloud architecture', 750000, 'project', 'fixed', 'Discovery and change control required. Cloud consumption is billed separately.'),
  entry('WEB-004', CATEGORIES.web, 'Advanced SEO / Google indexing add-on', 50000, null, 'fixed', 'Optional add-on. No ranking or indexing outcome is guaranteed.'),
  entry('WEB-005', CATEGORIES.web, 'Brand identity / logo kit add-on', 50000, null, 'fixed', 'Optional add-on. Trademark filing and print production are separate.'),
  entry('WEB-006', CATEGORIES.web, 'Maintenance and server backups', 25000, 'month', 'fixed', 'Billed monthly. Support hours, response time and backup frequency are confirmed in the agreement.'),
  entry('WEB-007', CATEGORIES.web, 'Fast-track priority delivery add-on', 60000, null, 'fixed', 'Buys a compressed Haritech schedule, not faster third-party processing.'),

  // CAC
  entry('CAC-001', CATEGORIES.cac, 'Business Name registration package', 30000, 'package', 'fixed', 'Includes the official CAC fee and the ₦20,000 Haritech assistance fee. TIN assistance included where applicable.'),
  entry('CAC-002', CATEGORIES.cac, 'Limited Liability Company (LLC/Ltd) registration package', 55000, 'package', 'fixed', 'Includes the official CAC fee and the ₦20,000 Haritech assistance fee. TIN assistance included where applicable. SCUML is separate.'),
  entry('CAC-003', CATEGORIES.cac, 'NGO registration package', 95000, 'package', 'fixed', 'Includes the official CAC fee and assistance. Mandatory newspaper publication is charged separately.'),
  entry('CAC-004', CATEGORIES.cac, 'Incorporated Trustees registration package', 120000, 'package', 'fixed', 'Includes the official CAC fee and assistance. Publication where required is separate.'),
  entry('CAC-005', CATEGORIES.cac, 'Foreign company registration assistance package', 150000, 'package', 'fixed', 'Eligibility confirmed before payment. Notarisation, registered office and NIPC/NESREA fees are separate.'),
  entry('CAC-006', CATEGORIES.cac, 'Express processing add-on', 30000, null, 'fixed', 'Covers expedited Haritech handling. It cannot speed up CAC itself.'),

  // Solar
  entry('SOL-001', CATEGORIES.solar, '1.5 kVA Essential solar package', 950000, 'package', 'fixed', 'Installation included. Battery, inverter, panel and warranty specification confirmed in the quotation.'),
  entry('SOL-002', CATEGORIES.solar, '3.5 kVA Home Pro solar package', 2500000, 'package', 'fixed', 'Installation included. Site survey may be required before confirmation.'),
  entry('SOL-003', CATEGORIES.solar, '5 kVA Executive solar package', 3400000, 'package', 'fixed', 'Installation included. Three-phase work is excluded unless specified.'),
  entry('SOL-004', CATEGORIES.solar, '10 kVA Commercial solar package', 6700000, 'package', 'fixed', 'Installation included. Switchgear, transformer and permit costs are separate.'),
  entry('SOL-005', CATEGORIES.solar, '20 kVA Industrial solar package', 12000000, 'package', 'fixed', 'Installation included. Structural and switchgear work is quoted after survey.'),
  entry('SOL-006', CATEGORIES.solar, 'Site survey / energy assessment', 10000, null, 'fixed', 'Confirmed per visit or system before booking. Travel outside the service area is separate.'),
  entry('SOL-007', CATEGORIES.solar, 'Solar system maintenance', 50000, null, 'fixed', 'Per visit, system or contract as confirmed in the service agreement.'),
  entry('SOL-008', CATEGORIES.solar, 'Lithium battery upgrade', 500000, null, 'fixed', 'Hardware inclusion, capacity and compatibility confirmed before payment.'),
  entry('SOL-009', CATEGORIES.solar, 'Inverter upgrade / replacement service', 500000, null, 'fixed', 'Hardware inclusion and rating confirmed before payment.'),
  entry('SOL-010', CATEGORIES.solar, 'Solar panel upgrade / addition', 200000, null, 'fixed', 'Panel count, wattage and mounting confirmed before payment.'),

  // Epoxy
  entry('EPO-001', CATEGORIES.epoxy, 'Solid Colour Gloss finish', 35000, 'm²', 'fixed', 'Includes surface preparation and UV topcoat. Repairs, moisture mitigation and travel are separate.'),
  entry('EPO-002', CATEGORIES.epoxy, 'Decorative Flake finish', 40000, 'm²', 'fixed', 'Includes surface preparation and UV topcoat.'),
  entry('EPO-003', CATEGORIES.epoxy, 'Metallic Sheen finish', 30000, 'm²', 'fixed', 'Includes surface preparation and UV topcoat.'),
  entry('EPO-004', CATEGORIES.epoxy, '3D Marble Vein finish', 35000, 'm²', 'fixed', 'Includes surface preparation and UV topcoat. Design revisions are confirmed in the quotation.'),
  entry('EPO-005', CATEGORIES.epoxy, 'Glow-in-the-Dark finish', 40000, 'm²', 'fixed', 'Includes surface preparation and UV topcoat.'),
  entry('EPO-006', CATEGORIES.epoxy, '3D Art / Mural finish', 65000, 'm²', 'fixed', 'Includes surface preparation and UV topcoat. Complex artwork may require a separate design fee.'),
  entry('EPO-007', CATEGORIES.epoxy, 'Surface grinding / preparation (standalone)', 45000, 'm²', 'fixed', 'Only when requested outside a standard finish. Never added to a finish price.'),
  entry('EPO-008', CATEGORIES.epoxy, 'UV topcoat (standalone)', 55000, 'm²', 'fixed', 'Only when requested outside a standard finish. Never added to a finish price.'),

  // Importation
  entry('IMP-001', CATEGORIES.import, 'Product sourcing service', 10000, null, 'fixed', 'Haritech service fee. Goods, freight and duty are separate.'),
  entry('IMP-002', CATEGORIES.import, 'Pre-order / order handling', 5000, null, 'fixed', 'Haritech service fee per order or slot as confirmed.'),
  entry('IMP-003', CATEGORIES.import, 'Supplier verification', 10000, null, 'fixed', 'Verification support only; it is not a guarantee of supplier performance.'),
  entry('IMP-004', CATEGORIES.import, 'Cargo consolidation coordination', 50000, null, 'fixed', 'Coordination fee. Warehouse and freight charges are separate.'),
  entry('IMP-005', CATEGORIES.import, 'Goods inspection coordination', 20000, null, 'fixed', 'Coordination fee. Third-party inspection charges are separate.'),
  entry('IMP-006', CATEGORIES.import, 'Importation consultation / advisory', 20000, 'session', 'per_session', 'One advisory session. Written reports and clearing work are separate.'),
  entry('IMP-007', CATEGORIES.import, 'Clearing coordination for large or complex shipments', 500000, null, 'conditional', 'Only added when the shipment qualifies and a coordinator approves it. Never automatic.'),

  // Business consultation
  entry('BUS-001', CATEGORIES.business, 'Basic business consultation', 20000, 'session', 'per_session', 'One session. Written deliverables are confirmed in the quotation.'),
  entry('BUS-002', CATEGORIES.business, 'Business plan preparation', 20000, 'plan', 'fixed', 'Scope, page count and financial-model depth confirmed before work starts.'),
  entry('BUS-003', CATEGORIES.business, 'Importation advisory', 20000, 'session', 'per_session', 'One advisory session. Confirm it is not booked together with IMP-006 for the same session.'),
  entry('BUS-004', CATEGORIES.business, 'Business documents / proposal preparation', 150000, null, 'fixed', 'Document scope, page count and revisions confirmed in the quotation.'),
  entry('BUS-005', CATEGORIES.business, 'Online consultation', null, 'session', 'quote_required', 'Owner price not yet supplied. Do not default to the standard rate.'),

  // Printing — starting prices
  entry('PRT-001', CATEGORIES.printing, 'Business card design/printing', 500, null, 'starting', 'Starting reference only. Unit, quantity and whether design is included must be confirmed.', true),
  entry('PRT-002', CATEGORIES.printing, 'Flyer design/printing', 200, null, 'starting', 'Starting reference only. Unit and quantity must be confirmed.', true),
  entry('PRT-003', CATEGORIES.printing, 'Poster design/printing', 1000, null, 'starting', 'Starting reference only. Size and quantity affect the final price.', true),
  entry('PRT-004', CATEGORIES.printing, 'Banner design/printing', 1000, null, 'starting', 'Starting reference only. Banners are usually priced per square metre.', true),
  entry('PRT-005', CATEGORIES.printing, 'Branded T-shirt', 2500, null, 'starting', 'Starting reference only. Garment quality, print method and quantity affect the price.', true),
  entry('PRT-006', CATEGORIES.printing, 'Logo design', 20000, null, 'fixed', 'Concept count and revisions confirmed before work starts. Trademark filing is separate.'),
  entry('PRT-007', CATEGORIES.printing, 'Large-format printing', 20000, null, 'starting', 'Starting reference only. Area, material and finishing affect the price.', true),

  // Cyber café — units unconfirmed
  entry('CYB-001', CATEGORIES.cyber, 'Typing', 500, null, 'starting', 'Unit (page or document) confirmed before quoting.', true),
  entry('CYB-002', CATEGORIES.cyber, 'Black-and-white printing / photocopying', 300, null, 'starting', 'Unit (page or side) confirmed before quoting.', true),
  entry('CYB-003', CATEGORIES.cyber, 'Colour printing', 500, null, 'starting', 'Unit (page or side) confirmed before quoting.', true),
  entry('CYB-004', CATEGORIES.cyber, 'Scanning', 500, null, 'starting', 'Unit (page or document) confirmed before quoting.', true),
  entry('CYB-005', CATEGORIES.cyber, 'Internet / computer use', 2000, null, 'starting', 'Unit (hour or session) confirmed before quoting.', true),
  entry('CYB-006', CATEGORIES.cyber, 'Online registration assistance', 3000, null, 'fixed', 'Haritech assistance fee only. Official registration fees are separate and itemised.'),
  entry('CYB-007', CATEGORIES.cyber, 'CV preparation', 5000, null, 'fixed', 'One CV. Revision rounds and cover letters confirmed before work starts.'),

  // Interior — starting prices
  entry('INT-001', CATEGORIES.interior, 'Interior design consultation', 10000, null, 'starting', 'Starting reference only. Per session or room confirmed before booking.', true),
  entry('INT-002', CATEGORIES.interior, 'Space planning / layout design', 10000, null, 'starting', 'Starting reference only. Per room or project confirmed before booking.', true),
  entry('INT-003', CATEGORIES.interior, '3D interior visualisation / rendering', 20000, null, 'starting', 'Starting reference only. Number of views and revisions confirmed before booking.', true),
  entry('INT-004', CATEGORIES.interior, 'Interior installation / project coordination', 20000, null, 'starting', 'Starting reference only. Materials, furniture and contractor fees are separate.', true),
  entry('INT-005', CATEGORIES.interior, 'Wall décor / feature-wall design', 20000, null, 'starting', 'Starting reference only. Materials and installation are separate.', true),

  // Project services — starting prices
  entry('PRJ-001', CATEGORIES.project, 'Project supervision', 50000, null, 'starting', 'Starting reference only. Unit (day, visit, report or project) confirmed before booking.', true),
  entry('PRJ-002', CATEGORIES.project, 'Procurement coordination', 50000, null, 'starting', 'Starting reference only. Goods, supplier payments and delivery are separate.', true),
  entry('PRJ-003', CATEGORIES.project, 'Feasibility study', 50000, null, 'starting', 'Starting reference only. Report depth and site visits confirmed before booking.', true),
  entry('PRJ-004', CATEGORIES.project, 'Project planning / scheduling', 50000, null, 'starting', 'Starting reference only. Deliverable format confirmed before booking.', true),
  entry('PRJ-005', CATEGORIES.project, 'Site visit / inspection', 20000, null, 'starting', 'Starting reference only. Travel outside the agreed area is separate.', true),
];

export function findPrice(id: string): PriceEntry {
  const found = PRICE_BOOK.find(item => item.id === id);
  if (!found) throw new Error(`Unknown price id: ${id}`);
  return found;
}

/** Returns the approved number or throws. Use only where a price is required. */
export function priceOf(id: string): number {
  const item = findPrice(id);
  if (item.priceNgn === null) throw new Error(`Price not supplied for ${id}`);
  return item.priceNgn;
}

export function pricesByCategory(key: CategoryKey): PriceEntry[] {
  const category = CATEGORIES[key];
  return PRICE_BOOK.filter(item => item.category === category);
}

export const IMPORT_SERVICE_IDS = ['IMP-001', 'IMP-002', 'IMP-003', 'IMP-004', 'IMP-005', 'IMP-006'] as const;
export const CLEARING_COORDINATION_ID = 'IMP-007';
export const EXPRESS_ID = 'CAC-006';
export const STAMP_NGN = 5000;
export const COURIER_NGN = 8000;
export const EPOXY_STANDALONE_PREP_ID = 'EPO-007';
export const EPOXY_STANDALONE_TOPCOAT_ID = 'EPO-008';
