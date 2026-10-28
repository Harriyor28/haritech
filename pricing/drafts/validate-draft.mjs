#!/usr/bin/env node
/**
 * Dependency-free validator for the proposed Haritech price register.
 *
 * Usage:  node pricing/drafts/validate-draft.mjs
 * Exit:   0 = valid draft, 1 = validation errors
 *
 * This script only reads pricing/drafts/proposed-prices.json. It is not
 * imported by the application and has no effect on the live site.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const file = join(here, 'proposed-prices.json');

const ALLOWED_STATUS = new Set([
  'DRAFT',
  'COST EVIDENCE NEEDED',
  'OFFICIAL FEE VERIFICATION NEEDED',
  'COMPETITOR REFERENCE ONLY',
  'READY FOR OWNER REVIEW',
  'APPROVED',
]);

const ALLOWED_PRICING_TYPE = new Set([
  'fixed',
  'starting_price',
  'variable',
  'per_session',
  'per_project',
  'quote_required',
  'conditional',
]);

const REQUIRED_FIELDS = [
  'id', 'category', 'service', 'proposed_price_ngn', 'currency', 'unit',
  'unit_confirmed', 'pricing_type', 'status', 'evidence_status',
  'effective_date', 'inclusions', 'exclusions', 'optional_addons',
  'third_party_costs_separate', 'current', 'owner_confirmation', 'risk_notes',
];

const errors = [];
const warnings = [];

let data;
try {
  data = JSON.parse(readFileSync(file, 'utf8'));
} catch (error) {
  console.error(`FAIL  Cannot parse ${file}\n${error.message}`);
  process.exit(1);
}

if (data.activation?.active !== false) {
  errors.push('activation.active must be false in a draft register');
}

if (!Array.isArray(data.services) || data.services.length === 0) {
  errors.push('services must be a non-empty array');
}

const services = Array.isArray(data.services) ? data.services : [];
const ids = new Set();

for (const [index, item] of services.entries()) {
  const where = item?.id ? item.id : `services[${index}]`;

  for (const field of REQUIRED_FIELDS) {
    if (!(field in item)) errors.push(`${where}: missing field "${field}"`);
  }

  if (typeof item.id !== 'string' || !/^[A-Z]{3}-\d{3}$/.test(item.id)) {
    errors.push(`${where}: id must look like ABC-001`);
  }
  if (ids.has(item.id)) errors.push(`${where}: duplicate id`);
  ids.add(item.id);

  if (!item.category) errors.push(`${where}: category is required`);
  if (!item.service) errors.push(`${where}: service is required`);

  if (item.currency !== 'NGN') {
    errors.push(`${where}: currency must be "NGN"`);
  }

  if (!ALLOWED_STATUS.has(item.status)) {
    errors.push(`${where}: invalid status "${item.status}"`);
  }
  if (!ALLOWED_STATUS.has(item.evidence_status)) {
    errors.push(`${where}: invalid evidence_status "${item.evidence_status}"`);
  }

  if (!ALLOWED_PRICING_TYPE.has(item.pricing_type)) {
    errors.push(`${where}: invalid pricing_type "${item.pricing_type}"`);
  }

  const price = item.proposed_price_ngn;
  if (price === null) {
    if (!item.owner_price_required) {
      errors.push(`${where}: null price must set owner_price_required true`);
    }
    if (item.pricing_type !== 'quote_required') {
      errors.push(`${where}: null price must use pricing_type "quote_required"`);
    }
    if (item.evidence_status !== 'DRAFT') {
      errors.push(`${where}: null price must stay in DRAFT until the owner supplies a price`);
    }
  } else if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    errors.push(`${where}: proposed_price_ngn must be null or a positive number`);
  } else if (!Number.isInteger(price)) {
    warnings.push(`${where}: price is not a whole naira value (${price})`);
  }

  if (!Array.isArray(item.inclusions)) errors.push(`${where}: inclusions must be an array`);
  if (!Array.isArray(item.exclusions)) errors.push(`${where}: exclusions must be an array`);
  if (!Array.isArray(item.optional_addons)) errors.push(`${where}: optional_addons must be an array`);
  if (!Array.isArray(item.owner_confirmation)) errors.push(`${where}: owner_confirmation must be an array`);
  if (!Array.isArray(item.risk_notes)) errors.push(`${where}: risk_notes must be an array`);

  if (typeof item.unit_confirmed !== 'boolean') {
    errors.push(`${where}: unit_confirmed must be boolean`);
  }
  if (item.unit_confirmed === true && (!item.unit || typeof item.unit !== 'string')) {
    errors.push(`${where}: unit_confirmed is true but unit is empty`);
  }
  if (item.unit_confirmed === false && item.unit !== null) {
    warnings.push(`${where}: unit is set but unit_confirmed is false`);
  }

  if (typeof item.third_party_costs_separate !== 'boolean') {
    errors.push(`${where}: third_party_costs_separate must be boolean`);
  }

  if (item.status !== 'APPROVED' && item.effective_date !== null) {
    errors.push(`${where}: effective_date must be null until status is APPROVED`);
  }
  if (item.status === 'APPROVED') {
    if (!data.activation?.approved_by || !data.activation?.approved_at) {
      errors.push(`${where}: APPROVED requires an approval record in activation`);
    }
    if (item.effective_date) {
      const parsed = Date.parse(item.effective_date);
      if (Number.isNaN(parsed)) errors.push(`${where}: effective_date is not a valid date`);
    }
  }

  if (item.addon === true && item.optional_addons.length > 0) {
    warnings.push(`${where}: add-ons usually do not carry their own add-ons`);
  }
}

for (const item of services) {
  for (const ref of item.optional_addons ?? []) {
    if (!ids.has(ref)) errors.push(`${item.id}: optional_addons references unknown id "${ref}"`);
  }
}

const priced = services.filter(s => s.proposed_price_ngn !== null).length;
const unpriced = services.length - priced;

const byCategory = {};
const byEvidence = {};
for (const item of services) {
  byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
  byEvidence[item.evidence_status] = (byEvidence[item.evidence_status] ?? 0) + 1;
}

console.log(`File: ${file}`);
console.log(`Services: ${services.length} (priced ${priced}, unpriced ${unpriced})`);
console.log('');
console.log('By category:');
for (const [name, count] of Object.entries(byCategory)) {
  console.log(`  ${String(count).padStart(3)}  ${name}`);
}
console.log('');
console.log('By evidence status:');
for (const [name, count] of Object.entries(byEvidence)) {
  console.log(`  ${String(count).padStart(3)}  ${name}`);
}
console.log('');

if (warnings.length) {
  console.log(`Warnings (${warnings.length}):`);
  for (const message of warnings) console.log(`  ! ${message}`);
  console.log('');
}

if (errors.length) {
  console.error(`FAIL — ${errors.length} error(s):`);
  for (const message of errors) console.error(`  x ${message}`);
  process.exit(1);
}

console.log('PASS — draft register is internally consistent.');
console.log('Nothing is approved and nothing is active.');
