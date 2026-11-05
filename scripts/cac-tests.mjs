/* Dependency-free tests for the CAC Application Desk.
   Run with: node scripts/cac-tests.mjs

   Bundles src/utils/cac/testEntry.ts with esbuild and asserts the pure
   validation/normalisation rules. It does not touch the database, network
   or production data. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = process.cwd();
const outDir = path.join(root, '.tmp-cac');
const outFile = path.join(outDir, 'cac.mjs');

fs.mkdirSync(outDir, { recursive: true });

await build({
  entryPoints: [path.join(root, 'src/utils/cac/testEntry.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  outfile: outFile,
  logLevel: 'silent',
});

const cac = await import(`${pathToFileURL(outFile).href}?t=${Date.now()}`);

const {
  CAC_DOCUMENT_CHECKLIST,
  CAC_ENTITY_TYPES,
  CAC_STAGES,
  cacStageIndex,
  draftToPayload,
  emptyCacDraft,
  getCacEntityOption,
  getCacStageOption,
  hasCacErrors,
  isCacEntityType,
  isCacStage,
  isValidCacEmail,
  normaliseCacPhone,
  normaliseCacReference,
  safeCacDocumentUrl,
  validateCacDraft,
} = cac;

let passed = 0;
const failures = [];

const test = (name, fn) => {
  try {
    fn();
    passed += 1;
    console.log(`  PASS  ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.log(`  FAIL  ${name}`);
    console.log(`        ${error.message.split('\n')[0]}`);
  }
};

const validDraft = (overrides = {}) => ({
  ...emptyCacDraft(),
  entityType: 'limited_company',
  proposedNames: ['Haritech Solar Ltd', 'Haritech Energy Ltd'],
  natureOfBusiness: 'Solar equipment sales and installation.',
  applicantName: 'Ajayi Oluwapelumi',
  applicantEmail: 'hello@haritech.com',
  applicantPhone: '0803 123 4567',
  applicantAddress: '12 Market Road, Port Harcourt',
  businessAddress: '12 Market Road, Port Harcourt',
  members: [{ name: 'Ajayi Oluwapelumi', role: 'Director' }],
  documentsHave: [CAC_DOCUMENT_CHECKLIST[0]],
  notes: 'Please use the first name first.',
  consent: true,
  ...overrides,
});

console.log('\nCAC Application Desk tests\n');

/* ── Entity and stage vocabulary ───────────────────────────────────────── */

test('offers Business Name, Ltd, NGO and Incorporated Trustees', () => {
  assert.deepEqual(
    CAC_ENTITY_TYPES.map((item) => item.id),
    ['business_name', 'limited_company', 'ngo', 'incorporated_trustees'],
  );
});

test('every entity maps to a unique CAC package', () => {
  const ids = CAC_ENTITY_TYPES.map((item) => item.packageId);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^CAC-00[1-4]$/);
});

test('isCacEntityType accepts known ids only', () => {
  assert.equal(isCacEntityType('limited_company'), true);
  assert.equal(isCacEntityType('foreign_company'), false);
  assert.equal(isCacEntityType(null), false);
});

test('unknown entity falls back to Business Name', () => {
  assert.equal(getCacEntityOption('nope').id, 'business_name');
});

test('stages are in handling order and start at submitted', () => {
  assert.deepEqual(
    CAC_STAGES.map((stage) => stage.id),
    ['submitted', 'name_search', 'filed', 'query', 'approved', 'certificate_ready', 'closed'],
  );
  assert.equal(cacStageIndex('submitted'), 0);
  assert.equal(cacStageIndex('certificate_ready'), 5);
});

test('isCacStage accepts known stages only', () => {
  assert.equal(isCacStage('query'), true);
  assert.equal(isCacStage('lost'), false);
});

test('unknown stage falls back to Application received', () => {
  assert.equal(getCacStageOption('nope').id, 'submitted');
});

/* ── Validation ────────────────────────────────────────────────────────── */

test('a complete Ltd application passes', () => {
  assert.deepEqual(validateCacDraft(validDraft()), {});
  assert.equal(hasCacErrors(validateCacDraft(validDraft())), false);
});

test('empty draft fails with the expected fields', () => {
  const errors = validateCacDraft(emptyCacDraft());
  for (const key of [
    'proposedNames',
    'natureOfBusiness',
    'applicantName',
    'applicantEmail',
    'applicantPhone',
    'applicantAddress',
    'businessAddress',
    'consent',
  ]) {
    assert.ok(errors[key], `expected an error for ${key}`);
  }
});

test('proposed names are required', () => {
  const errors = validateCacDraft(validDraft({ proposedNames: ['', '  '] }));
  assert.ok(errors.proposedNames);
});

test('duplicate proposed names are rejected case-insensitively', () => {
  const errors = validateCacDraft(
    validDraft({ proposedNames: ['Haritech Solar Ltd', 'haritech solar ltd'] }),
  );
  assert.match(errors.proposedNames, /different/i);
});

test('more than five proposed names are rejected', () => {
  const errors = validateCacDraft(
    validDraft({ proposedNames: ['A name', 'B name', 'C name', 'D name', 'E name', 'F name'] }),
  );
  assert.ok(errors.proposedNames);
});

test('very short proposed names are rejected', () => {
  const errors = validateCacDraft(validDraft({ proposedNames: ['A'] }));
  assert.ok(errors.proposedNames);
});

test('email validation accepts normal addresses and rejects broken ones', () => {
  assert.equal(isValidCacEmail('hello@haritech.com'), true);
  assert.equal(isValidCacEmail(' hello@haritech.com '), true);
  assert.equal(isValidCacEmail('hello@haritech'), false);
  assert.equal(isValidCacEmail('hello haritech@x.com'), false);
  assert.equal(isValidCacEmail(''), false);
});

test('phone must have 7–15 digits', () => {
  assert.ok(validateCacDraft(validDraft({ applicantPhone: '12345' })).applicantPhone);
  assert.equal(validateCacDraft(validDraft({ applicantPhone: '+234 803 123 4567' })).applicantPhone, undefined);
});

test('addresses must be present', () => {
  assert.ok(validateCacDraft(validDraft({ applicantAddress: '' })).applicantAddress);
  assert.ok(validateCacDraft(validDraft({ businessAddress: 'x' })).businessAddress);
});

test('Ltd, NGO and Trustees need at least one person', () => {
  for (const entityType of ['limited_company', 'ngo', 'incorporated_trustees']) {
    const errors = validateCacDraft(validDraft({ entityType, members: [] }));
    assert.ok(errors.members, `expected members error for ${entityType}`);
  }
});

test('Business Name may be submitted without extra people', () => {
  const errors = validateCacDraft(
    validDraft({ entityType: 'business_name', members: [] }),
  );
  assert.equal(errors.members, undefined);
});

test('notes are capped at 2,000 characters', () => {
  assert.ok(validateCacDraft(validDraft({ notes: 'x'.repeat(2001) })).notes);
});

test('consent is required', () => {
  assert.ok(validateCacDraft(validDraft({ consent: false })).consent);
});

test('documents are optional at submission', () => {
  assert.deepEqual(validateCacDraft(validDraft({ documentsHave: [] })), {});
});

/* ── Payload shaping ───────────────────────────────────────────────────── */

test('payload trims names and lowercases the email', () => {
  const payload = draftToPayload(
    validDraft({
      proposedNames: ['  Haritech Solar Ltd  ', '   '],
      applicantEmail: '  HELLO@HARITECH.COM ',
      applicantName: '  Ajayi Oluwapelumi ',
    }),
  );
  assert.deepEqual(payload.proposed_names, ['Haritech Solar Ltd']);
  assert.equal(payload.applicant_email, 'hello@haritech.com');
  assert.equal(payload.applicant_name, 'Ajayi Oluwapelumi');
});

test('payload drops blank members and unknown document ticks', () => {
  const payload = draftToPayload(
    validDraft({
      members: [
        { name: '  ', role: 'Director' },
        { name: ' Ada ', role: ' Shareholder ' },
      ],
      documentsHave: [CAC_DOCUMENT_CHECKLIST[0], 'Not a real document'],
    }),
  );
  assert.deepEqual(payload.members, [{ name: 'Ada', role: 'Shareholder' }]);
  assert.deepEqual(payload.documents_have, [CAC_DOCUMENT_CHECKLIST[0]]);
});

test('payload uses snake_case keys expected by the RPC', () => {
  const payload = draftToPayload(validDraft());
  for (const key of [
    'entity_type',
    'proposed_names',
    'nature_of_business',
    'applicant_name',
    'applicant_email',
    'applicant_phone',
    'applicant_address',
    'business_address',
    'members',
    'documents_have',
    'notes',
  ]) {
    assert.ok(key in payload, `missing ${key}`);
  }
});

/* ── Reference, phone and document-link normalisation ──────────────────── */

test('references accept the three ways a visitor may type them', () => {
  assert.equal(normaliseCacReference('cac-1a2b3c4d'), 'CAC-1A2B3C4D');
  assert.equal(normaliseCacReference('CAC1A2B3C4D'), 'CAC-1A2B3C4D');
  assert.equal(normaliseCacReference(' 1a2b3c4d '), 'CAC-1A2B3C4D');
  assert.equal(normaliseCacReference(''), '');
});

test('phone normalisation keeps digits only', () => {
  assert.equal(normaliseCacPhone('+234 (803) 123-4567'), '2348031234567');
  assert.equal(normaliseCacPhone('abc'), '');
});

test('document links allow http(s) and site-relative paths only', () => {
  assert.equal(safeCacDocumentUrl('https://example.com/cert.pdf'), 'https://example.com/cert.pdf');
  assert.equal(safeCacDocumentUrl('http://example.com/cert.pdf'), 'http://example.com/cert.pdf');
  assert.equal(safeCacDocumentUrl('/uploads/cert.pdf'), '/uploads/cert.pdf');
  assert.equal(safeCacDocumentUrl('javascript:alert(1)'), null);
  assert.equal(safeCacDocumentUrl('data:text/html,hi'), null);
  assert.equal(safeCacDocumentUrl(''), null);
  assert.equal(safeCacDocumentUrl('not a link'), null);
});

console.log(`\n${passed} passed, ${failures.length} failed\n`);

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`FAILED: ${failure.name}`);
    console.error(failure.error);
  }
  process.exit(1);
}
