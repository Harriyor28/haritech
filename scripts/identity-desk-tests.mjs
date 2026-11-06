/* Dependency-free tests for the NIN / BVN Application Desk.
   Run with: node scripts/identity-desk-tests.mjs

   Bundles src/utils/identity/deskTestEntry.ts with esbuild and asserts the
   pure validation/normalisation rules. It does not touch the database,
   network or production data. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = process.cwd();
const outDir = path.join(root, '.tmp-identity-desk');
const outFile = path.join(outDir, 'identity-desk.mjs');

fs.mkdirSync(outDir, { recursive: true });

await build({
  entryPoints: [path.join(root, 'src/utils/identity/deskTestEntry.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  outfile: outFile,
  logLevel: 'silent',
});

const sessionKey = `?t=${Date.now()}`;
const desk = await import(`${pathToFileURL(outFile).href}${sessionKey}`);

const {
  IDENTITY_SERVICES,
  IDENTITY_STAGES,
  IDENTITY_DOCUMENT_CHECKLIST,
  EXISTING_NUMBER_OPTIONS,
  cleanCheckReference,
  draftToPayload,
  emptyIdentityDraft,
  getIdentityService,
  hasIdentityErrors,
  identityStageIndex,
  isExistingNumberStatus,
  isIdentityDeskStage,
  isIdentityServiceId,
  isValidIdentityEmail,
  normaliseIdentityPhone,
  normaliseIdentityReference,
  validateIdentityDraft,
} = desk;

let passed = 0;
const failures = [];
const test = (name, fn) => {
  try {
    fn();
    passed += 1;
    console.log(`  PASS  ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`  FAIL  ${name}`);
    console.log(String(error?.message ?? error).split('\n').slice(0, 8).map((l) => `        ${l}`).join('\n'));
  }
};

/* ── Service catalogue ───────────────────────────────────────────────── */

test('the desk covers five services across NIN and BVN', () => {
  assert.equal(IDENTITY_SERVICES.length, 5);
  assert.deepEqual(
    IDENTITY_SERVICES.map((s) => s.id),
    [
      'nin_registration',
      'nin_modification',
      'nin_retrieval',
      'bvn_correction',
      'bvn_retrieval',
    ],
  );
});

test('registration does not need an existing number; modifications do', () => {
  assert.equal(getIdentityService('nin_registration').existingNumberRequired, false);
  assert.equal(getIdentityService('bvn_retrieval').existingNumberRequired, false);
  assert.equal(getIdentityService('nin_modification').existingNumberRequired, true);
  assert.equal(getIdentityService('nin_retrieval').existingNumberRequired, true);
  assert.equal(getIdentityService('bvn_correction').existingNumberRequired, true);
});

test('every service is honest about Haritech not issuing the record', () => {
  for (const service of IDENTITY_SERVICES) {
    assert.match(
      service.involvement,
      /(NIMC|NIBSS|bank|authority|Haritech guides|desk cannot)/i,
      service.id,
    );
    assert.ok(service.involvement.length > 20, service.id);
  }
});

test('every service lists a requirements checklist', () => {
  for (const service of IDENTITY_SERVICES) {
    assert.ok(service.requirements.length >= 3, service.id);
  }
});

test('the checklist never contains a field that stores a number', () => {
  // The desk collects documents, never the digits themselves.
  for (const item of IDENTITY_DOCUMENT_CHECKLIST) {
    assert.ok(!/^(NIN|BVN) number$/i.test(item), item);
  }
});

/* ── Existing-number vocabulary ──────────────────────────────────────── */

test('existing-number options never include a data field for the number', () => {
  assert.equal(EXISTING_NUMBER_OPTIONS.length, 3);
  assert.ok(EXISTING_NUMBER_OPTIONS.some((o) => o.id === 'none'));
  assert.ok(EXISTING_NUMBER_OPTIONS.some((o) => o.id === 'verified_here'));
  assert.ok(EXISTING_NUMBER_OPTIONS.some((o) => o.id === 'have_unverified'));
  // The verified-here option promises masking.
  const verified = EXISTING_NUMBER_OPTIONS.find((o) => o.id === 'verified_here');
  assert.match(verified.hint, /never/);
});

test('isExistingNumberStatus accepts only the three declared states', () => {
  assert.equal(isExistingNumberStatus('none'), true);
  assert.equal(isExistingNumberStatus('verified_here'), true);
  assert.equal(isExistingNumberStatus('have_unverified'), true);
  assert.equal(isExistingNumberStatus('01234567890'), false);
  assert.equal(isExistingNumberStatus(false), false);
});

/* ── Reference normalisation ─────────────────────────────────────────── */

test('identity references normalise to NID-XXXXXXXX', () => {
  assert.equal(normaliseIdentityReference('NID-1A2B3C4D'), 'NID-1A2B3C4D');
  assert.equal(normaliseIdentityReference('nid1a2b3c4d'), 'NID-1A2B3C4D');
  assert.equal(normaliseIdentityReference('1a2b3c4d'), 'NID-1A2B3C4D');
  assert.equal(normaliseIdentityReference('  nid - 1a2b3c4d '), 'NID-1A2B3C4D');
  // Unrecognised text is not silently reshaped into a reference.
  assert.equal(normaliseIdentityReference('garbage!'), 'GARBAGE!');
});

/* ── Payload conversion ─────────────────────────────────────────────── */

test('the payload never contains a field named like a NIN/BVN', () => {
  const draft = emptyIdentityDraft();
  const payload = draftToPayload(draft);
  const keys = Object.keys(payload);
  for (const key of keys) {
    assert.ok(!/\b(nin|bvn)\b/i.test(key), key);
  }
  // And the values start empty for every number-ish key.
  assert.equal(payload.check_reference, '');
  assert.equal(payload.existing_number, 'none');
});

test('payload conversion cleans contact details and lists', () => {
  const draft = {
    ...emptyIdentityDraft(),
    holderName: '  Pelumi Ajayi ',
    holderEmail: ' Pelumi@Example.COM ',
    holderPhone: ' 0803-123-4567 ',
    requestDetails: '  change of surname  ',
    documentsHave: ['NIN slip', 'Made-up document'],
    notes: ' hello ',
  };
  const payload = draftToPayload(draft);
  assert.equal(payload.holder_name, 'Pelumi Ajayi');
  assert.equal(payload.holder_email, 'pelumi@example.com');
  assert.equal(payload.holder_phone, '08031234567');
  assert.deepEqual(payload.documents_have, ['NIN slip']);
  assert.equal(payload.notes, 'hello');
  assert.equal(payload.existing_number, 'none');
  assert.equal(payload.check_reference, '');
});

/* ── Validation ─────────────────────────────────────────────────────── */

test('an empty draft fails with helpful per-field errors', () => {
  const errors = validateIdentityDraft(emptyIdentityDraft());
  assert.ok(hasIdentityErrors(errors));
  assert.ok(errors.holderName);
  assert.ok(errors.holderEmail);
  assert.ok(errors.holderPhone);
  assert.ok(errors.holderDob);
  assert.ok(errors.stateOfResidence);
  assert.ok(errors.consent);
});

test('a complete registration draft passes', () => {
  const draft = {
    ...emptyIdentityDraft(),
    holderName: 'Pelumi Ajayi',
    holderEmail: 'pelumi@example.com',
    holderPhone: '08031234567',
    holderDob: '1994-01-15',
    stateOfResidence: 'Lagos',
    holderAddress: '12 Awolowo Road, Ikoyi',
    service: 'nin_registration',
    existingNumber: 'none',
    consent: true,
  };
  assert.deepEqual(validateIdentityDraft(draft), {});
});

test('a registration draft with a filled address passes even with details empty', () => {
  const draft = {
    ...emptyIdentityDraft(),
    holderName: 'Pelumi Ajayi',
    holderEmail: 'pelumi@example.com',
    holderPhone: '08031234567',
    holderDob: '1994-01-15',
    stateOfResidence: 'Lagos',
    holderAddress: '12 Awolowo Road, Ikoyi',
    consent: true,
  };
  assert.deepEqual(validateIdentityDraft(draft), {});
});

test('modification requires the number and the change details', () => {
  const base = {
    ...emptyIdentityDraft(),
    service: 'nin_modification',
    holderName: 'Pelumi Ajayi',
    holderEmail: 'pelumi@example.com',
    holderPhone: '08031234567',
    holderDob: '1994-01-15',
    stateOfResidence: 'Lagos',
    consent: true,
  };
  const errors = validateIdentityDraft(base);
  assert.match(errors.existingNumber, /already hold/);

  const withNumberProvided = {
    ...base,
    existingNumber: 'verified_here',
  };
  const errors2 = validateIdentityDraft(withNumberProvided);
  assert.match(errors2.requestDetails, /exactly what needs to change/);

  const complete = {
    ...withNumberProvided,
    requestDetails: 'Surname change from Okafor to Ajayi after marriage',
  };
  assert.deepEqual(validateIdentityDraft(complete), {});
});

test('correction services need the request details too', () => {
  const draft = {
    ...emptyIdentityDraft(),
    service: 'bvn_correction',
    existingNumber: 'have_unverified',
    holderName: 'Pelumi Ajayi',
    holderEmail: 'pelumi@example.com',
    holderPhone: '08031234567',
    holderDob: '1994-01-15',
    stateOfResidence: 'Lagos',
    requestDetails: 'Date of birth correction, bank says 1995',
    consent: true,
  };
  assert.deepEqual(validateIdentityDraft(draft), {});
});

test('retrieval without the number is still allowed when details are given', () => {
  const draft = {
    ...emptyIdentityDraft(),
    service: 'nin_retrieval',
    existingNumber: 'none',
    holderName: 'Pelumi Ajayi',
    holderEmail: 'pelumi@example.com',
    holderPhone: '08031234567',
    holderDob: '1994-01-15',
    stateOfResidence: 'Lagos',
    requestDetails: 'Lost the slip, enrolled in Ibadan in 2019',
    consent: true,
  };
  // nin_retrieval requires the number...
  assert.equal(getIdentityService('nin_retrieval').existingNumberRequired, true);
  const errors = validateIdentityDraft(draft);
  assert.match(errors.existingNumber, /already hold/);
});

test('bvn_retrieval accepts no number and no details', () => {
  const draft = {
    ...emptyIdentityDraft(),
    service: 'bvn_retrieval',
    existingNumber: 'none',
    holderName: 'Pelumi Ajayi',
    holderEmail: 'pelumi@example.com',
    holderPhone: '08031234567',
    holderDob: '1994-01-15',
    stateOfResidence: 'Lagos',
    consent: true,
  };
  assert.deepEqual(validateIdentityDraft(draft), {});
});

test('an address is required for registration but not for modifications', () => {
  const registration = {
    ...emptyIdentityDraft(),
    service: 'nin_registration',
    holderName: 'Pelumi Ajayi',
    holderEmail: 'pelumi@example.com',
    holderPhone: '08031234567',
    holderDob: '1994-01-15',
    stateOfResidence: 'Lagos',
    consent: true,
  };
  assert.match(validateIdentityDraft(registration).holderAddress, /residential/);

  const modification = {
    ...registration,
    service: 'nin_modification',
    existingNumber: 'verified_here',
    requestDetails: 'Change of phone number on the record',
    holderAddress: '',
  };
  assert.equal(validateIdentityDraft(modification).holderAddress, undefined);
});

test('dob must be a real past date', () => {
  const base = {
    ...emptyIdentityDraft(),
    holderName: 'Pelumi Ajayi',
    holderEmail: 'pelumi@example.com',
    holderPhone: '08031234567',
    stateOfResidence: 'Lagos',
    consent: true,
  };
  assert.match(validateIdentityDraft({ ...base, holderDob: 'not-a-date' }).holderDob, /date of birth/);
  const future = new Date();
  future.setFullYear(future.getFullYear() + 2);
  assert.ok(
    validateIdentityDraft({ ...base, holderDob: future.toISOString().slice(0, 10) }).holderDob,
  );
  assert.equal(validateIdentityDraft({ ...base, holderDob: '1994-01-15' }).holderDob, undefined);
});

test('names cannot contain digits', () => {
  const base = {
    ...emptyIdentityDraft(),
    holderEmail: 'pelumi@example.com',
    holderPhone: '08031234567',
    holderDob: '1994-01-15',
    stateOfResidence: 'Lagos',
    consent: true,
  };
  assert.ok(validateIdentityDraft({ ...base, holderName: 'Pelumi 123' }).holderName);
  assert.equal(validateIdentityDraft({ ...base, holderName: 'Pelumi Ajayi' }).holderName, undefined);
});

test('a malformed check reference is rejected, not silently fixed', () => {
  const base = {
    ...emptyIdentityDraft(),
    service: 'nin_registration',
    holderName: 'Pelumi Ajayi',
    holderEmail: 'pelumi@example.com',
    holderPhone: '08031234567',
    holderDob: '1994-01-15',
    stateOfResidence: 'Lagos',
    holderAddress: '12 Awolowo Road, Ikoyi',
    consent: true,
  };
  assert.ok(validateIdentityDraft({ ...base, checkReference: 'NIN-01234567890' }).checkReference);
  assert.equal(validateIdentityDraft({ ...base, checkReference: '1A2B3C4D' }).checkReference, undefined);
});

/* ── Reference and misc helpers ─────────────────────────────────────── */

test('check references keep only plain reference bodies', () => {
  assert.equal(cleanCheckReference('1a2b3c4d'), '1A2B3C4D');
  assert.equal(cleanCheckReference('  ABC12345  '), 'ABC12345');
  assert.equal(cleanCheckReference('08031234567'), '');
  assert.equal(cleanCheckReference(''), '');
});

test('phone normalisation keeps digits only', () => {
  assert.equal(normaliseIdentityPhone('+234 803 123 4567'), '2348031234567');
  assert.equal(normaliseIdentityPhone('(0803) 123-4567'), '08031234567');
});

test('emails follow the shared honest pattern', () => {
  assert.equal(isValidIdentityEmail('p@example.com'), true);
  assert.equal(isValidIdentityEmail('p@'), false);
  assert.equal(isValidIdentityEmail('p example.com'), false);
  assert.equal(isValidIdentityEmail('p<@example.com'), false);
});

/* ── Stages ─────────────────────────────────────────────────────────── */

test('the desk uses six Haritech handling stages', () => {
  assert.equal(IDENTITY_STAGES.length, 6);
  assert.deepEqual(
    IDENTITY_STAGES.map((s) => s.id),
    ['submitted', 'review', 'appointment', 'query', 'completed', 'closed'],
  );
});

test('no stage claims to be a NIMC/NIBSS feed', () => {
  for (const stage of IDENTITY_STAGES) {
    assert.ok(!/nimc (says|reports|confirms)/i.test(stage.label));
    assert.ok(stage.description.length > 20, stage.id);
  }
});

test('the query stage flags for attention', () => {
  const query = IDENTITY_STAGES.find((s) => s.id === 'query');
  assert.equal(query?.attention, true);
});

test('stage index and guard behave', () => {
  assert.equal(identityStageIndex('submitted'), 0);
  assert.equal(identityStageIndex('closed'), 5);
  assert.equal(isIdentityDeskStage('completed'), true);
  assert.equal(isIdentityDeskStage('approved'), false);
  assert.equal(isIdentityServiceId('bvn_correction'), true);
  assert.equal(isIdentityServiceId('fake_service'), false);
});

/* ── localStorage draft persistence (browser-only, guarded) ─────────── */

test('load falls back to an empty draft when storage is unavailable', () => {
  const originalWindow = globalThis.window;
  delete globalThis.window;
  try {
    const draft = desk.loadIdentityDraft();
    assert.equal(draft.service, 'nin_registration');
    assert.equal(draft.consent, false);
  } finally {
    if (originalWindow) globalThis.window = originalWindow;
  }
});

console.log(`\n${passed} passed, ${failures.length} failed\n`);
if (failures.length > 0) process.exitCode = 1;
