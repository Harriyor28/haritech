/* One-tap starter appliance lists for customers who are not technicians.

   A bundle is only a shortcut into the same editable appliance list used
   everywhere else: every entry is built from the normal catalogue templates
   and every value afterwards (quantity, hours, watts, surge) can still be
   edited on step 2. Bundles never add equipment the catalogue does not have,
   and they
   never touch sizing assumptions. */

import type { ApplianceEntry, AssessmentInput, BuildingType, IntendedUse } from './types';
import { entryFromTemplate } from './defaults';
import { APPLIANCE_CATALOGUE } from '../../config/solar/appliances';

export type QuickStartBundleId = 'essentials' | 'family' | 'shop' | 'office';

export interface QuickStartItem {
  /** Must exist in APPLIANCE_CATALOGUE. */
  templateId: string;
  quantity: number;
  /** Optional hours override for this bundle; otherwise the catalogue default. */
  hoursPerDay?: number;
}

export interface QuickStartBundle {
  id: QuickStartBundleId;
  /** How the picker presents it — spoken, not technical. */
  title: string;
  description: string;
  /** Short list of what is included, for the picker. */
  includes: string[];
  buildingType: BuildingType;
  intendedUse: IntendedUse;
  items: QuickStartItem[];
}

export const QUICK_START_BUNDLES: QuickStartBundle[] = [
  {
    id: 'essentials',
    title: 'Just the basics',
    description: 'Lights, a fan, the TV and your internet — the small things you miss first when power goes off.',
    includes: ['4 bulbs', 'fan', 'television', 'internet router'],
    buildingType: 'residential',
    intendedUse: 'essential',
    items: [
      { templateId: 'led-bulb', quantity: 4 },
      { templateId: 'fan', quantity: 1 },
      { templateId: 'television', quantity: 1 },
      { templateId: 'router', quantity: 1 },
    ],
  },
  {
    id: 'family',
    title: 'Family home',
    description: 'The everyday house list — lights, fans, TV, fridge and freezer, plus charging for a laptop.',
    includes: ['6 bulbs', 'fans', 'television', 'fridge', 'freezer', 'laptop', 'router'],
    buildingType: 'residential',
    intendedUse: 'whole-home',
    items: [
      { templateId: 'led-bulb', quantity: 6 },
      { templateId: 'fan', quantity: 3 },
      { templateId: 'television', quantity: 1 },
      { templateId: 'decoder', quantity: 1 },
      { templateId: 'refrigerator', quantity: 1 },
      { templateId: 'freezer', quantity: 1 },
      { templateId: 'laptop', quantity: 1 },
      { templateId: 'router', quantity: 1 },
      { templateId: 'security-light', quantity: 2 },
    ],
  },
  {
    id: 'shop',
    title: 'Small shop',
    description: 'Keep a shop open: lights, a fan, the POS and a display fridge that must stay cold.',
    includes: ['4 bulbs', 'fan', 'POS terminal', 'display fridge', 'television'],
    buildingType: 'commercial',
    intendedUse: 'shop',
    items: [
      { templateId: 'led-bulb', quantity: 4 },
      { templateId: 'fan', quantity: 1 },
      { templateId: 'pos', quantity: 1 },
      { templateId: 'display-fridge', quantity: 1 },
      { templateId: 'television', quantity: 1 },
      { templateId: 'security-light', quantity: 2 },
    ],
  },
  {
    id: 'office',
    title: 'Work office',
    description: 'A few people working: laptops, a printer, internet, lights and a fan or two.',
    includes: ['laptops', 'printer', 'router', '6 bulbs', 'fans'],
    buildingType: 'commercial',
    intendedUse: 'office',
    items: [
      { templateId: 'laptop', quantity: 4 },
      { templateId: 'printer', quantity: 1 },
      { templateId: 'router', quantity: 1 },
      { templateId: 'led-bulb', quantity: 6 },
      { templateId: 'fan', quantity: 2 },
    ],
  },
];

const CATALOGUE_BY_ID = new Map(APPLIANCE_CATALOGUE.map((template) => [template.id, template]));

/** Build the editable appliance entries for one bundle. Every template id is
    checked against the catalogue so a typo can never create a fictional item. */
export const buildBundleEntries = (bundle: QuickStartBundle): ApplianceEntry[] => {
  const entries: ApplianceEntry[] = [];
  for (const item of bundle.items) {
    const template = CATALOGUE_BY_ID.get(item.templateId);
    if (!template || !(item.quantity >= 1)) continue;
    const entry = { ...entryFromTemplate(template) };
    entry.quantity = item.quantity;
    if (typeof item.hoursPerDay === 'number' && item.hoursPerDay > 0) {
      entry.hoursPerDay = item.hoursPerDay;
    }
    entries.push(entry);
  }
  return entries;
};

/** A full replacement for the appliance list plus the property answers that
    match the bundle. Callers apply it as a patch on AssessmentInput. */
export const buildBundleInput = (bundle: QuickStartBundle): Pick<AssessmentInput, 'buildingType' | 'intendedUse' | 'appliances'> => ({
  buildingType: bundle.buildingType,
  intendedUse: bundle.intendedUse,
  appliances: buildBundleEntries(bundle),
});
