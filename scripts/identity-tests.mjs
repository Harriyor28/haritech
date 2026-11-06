/* Dependency-free tests for the NIN / BVN identity checks.
   Run with: node scripts/identity-tests.mjs

   Bundles the pure helpers with esbuild and asserts validation, masking,
   provider-response extraction and provider request shaping. No network,
   database or production data is touched. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = process.cwd();
const outDir = path.join(root, '.tmp-identity');
const coreFile = path.join(outDir, 'core.mjs');
const functionFile = path.join(outDir, 'function.mjs');

fs.mkdirSync(outDir, { recursive: true });

await build({
  entryPoints: [path.join(root, 'src/utils/identity/testEntry.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  outfile: coreFile,
  logLevel: 'silent',
});

await build({
  entryPoints: [path.join(root, 'supabase/functions/identity-verify/index.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  outfile: functionFile,
  logLevel: 'silent',
});

const core = await import(`${pathToFileURL(coreFile).href}?t=${Date.now()}`);
const fn = await import(`${pathToFileURL(functionFile).href}?t=${Date.now()}`);

const {
  IDENTITY_KINDS,
  extractIdentityRecord,
  getIdentityKind,
  isIdentityKind,
  isProviderSuccess,
  isValidIdentityNumber,
  maskIdentityNumber,
  normaliseIdentityNumber,
  redactIdentityNumber,
} = core;

const { resolveProviderRequest } = fn;

let passed = 0;
const failures = [];

const test = (name, run) => {
  try {
    run();
    passed += 1;
    console.log(`  PASS  ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.log(`  FAIL  ${name}`);
    console.log(`        ${error.message.split('\n')[0]}`);
  }
};

const envFrom = (values) => (key) => values[key];

console.log('\nNIN / BVN identity check tests\n');

/* ── Vocabulary and validation ─────────────────────────────────────────── */

test('offers exactly NIN and BVN', () => {
  assert.deepEqual(IDENTITY_KINDS.map((item) => item.id), ['nin', 'bvn']);
});

test('both documents are 11 digits', () => {
  for (const item of IDENTITY_KINDS) assert.equal(item.digits, 11);
});

test('isIdentityKind accepts known ids only', () => {
  assert.equal(isIdentityKind('nin'), true);
  assert.equal(isIdentityKind('bvn'), true);
  assert.equal(isIdentityKind('passport'), false);
  assert.equal(isIdentityKind(null), false);
});

test('unknown kind falls back to NIN', () => {
  assert.equal(getIdentityKind('passport').id, 'nin');
});

test('normalisation keeps digits only', () => {
  assert.equal(normaliseIdentityNumber('123 456-789 01'), '12345678901');
  assert.equal(normaliseIdentityNumber('abc'), '');
});

test('validation requires exactly 11 digits', () => {
  assert.equal(isValidIdentityNumber('nin', '12345678901'), true);
  assert.equal(isValidIdentityNumber('nin', '1234567890'), false);
  assert.equal(isValidIdentityNumber('nin', '123456789012'), false);
  assert.equal(isValidIdentityNumber('bvn', '12345678901'), true);
  assert.equal(isValidIdentityNumber('bvn', '1234567890a'), false);
});

test('validation accepts formatted input', () => {
  assert.equal(isValidIdentityNumber('nin', '123 456 789 01'), true);
});

/* ── Masking and redaction ─────────────────────────────────────────────── */

test('masking shows only the last four digits', () => {
  assert.equal(maskIdentityNumber('12345678901'), '•••••••8901');
});

test('short values are fully masked', () => {
  assert.equal(maskIdentityNumber('123'), '••••');
  assert.equal(maskIdentityNumber(''), '••••');
});

test('redaction removes a full number from text', () => {
  const text = 'Provider rejected 12345678901 for NIN check';
  assert.equal(redactIdentityNumber(text, '12345678901'), 'Provider rejected [redacted] for NIN check');
});

test('redaction leaves unrelated text alone', () => {
  assert.equal(redactIdentityNumber('Network timeout', '12345678901'), 'Network timeout');
});

/* ── Provider response extraction ──────────────────────────────────────── */

test('extracts a Prembly-style detail record', () => {
  const record = extractIdentityRecord({
    status: true,
    detail: {
      firstname: 'Ada',
      middlename: 'Ngozi',
      lastname: 'Okafor',
      dob: '1990-01-02',
      gender: 'Female',
      reference: 'prembly-ref-1',
    },
  });
  assert.equal(record.fullName, 'Ada Ngozi Okafor');
  assert.equal(record.firstName, 'Ada');
  assert.equal(record.lastName, 'Okafor');
  assert.equal(record.dateOfBirth, '1990-01-02');
  assert.equal(record.gender, 'Female');
  assert.equal(record.reference, 'prembly-ref-1');
});

test('extracts a Dojah-style entity record', () => {
  const record = extractIdentityRecord({
    entity: {
      first_name: 'Chidi',
      last_name: 'Eze',
      dob: '1988-05-06',
    },
  });
  assert.equal(record.fullName, 'Chidi Eze');
  assert.equal(record.firstName, 'Chidi');
  assert.equal(record.lastName, 'Eze');
});

test('extracts a nested generic record', () => {
  const record = extractIdentityRecord({
    data: { record: { full_name: 'Musa Ibrahim', gender: 'Male' } },
  });
  assert.equal(record.fullName, 'Musa Ibrahim');
  assert.equal(record.gender, 'Male');
});

test('prefers an explicit full name', () => {
  const record = extractIdentityRecord({
    data: { firstName: 'Ada', lastName: 'Okafor', fullName: 'Ada N. Okafor' },
  });
  assert.equal(record.fullName, 'Ada N. Okafor');
});

test('returns null when no name is present', () => {
  assert.equal(extractIdentityRecord({ status: true, detail: { dob: '1990-01-02' } }), null);
  assert.equal(extractIdentityRecord(null), null);
});

test('never copies the number into the reference field', () => {
  const record = extractIdentityRecord({
    data: { fullName: 'Ada Okafor', nin: '12345678901', bvn: '12345678901' },
  });
  assert.equal(record.reference, '');
  assert.ok(!JSON.stringify(record).includes('12345678901'));
});

test('provider success is true when status is silent', () => {
  assert.equal(isProviderSuccess({ entity: { first_name: 'Ada' } }), true);
  assert.equal(isProviderSuccess({ status: true }), true);
  assert.equal(isProviderSuccess({ status: 'success' }), true);
});

test('provider success is false on explicit failure', () => {
  assert.equal(isProviderSuccess({ status: false }), false);
  assert.equal(isProviderSuccess({ success: false }), false);
  assert.equal(isProviderSuccess({ status: 'failed' }), false);
  assert.equal(isProviderSuccess({ status: 'not_found' }), false);
  assert.equal(isProviderSuccess(null), false);
});

/* ── Provider request shaping ──────────────────────────────────────────── */

test('generic provider needs a key and a base URL', () => {
  assert.equal(resolveProviderRequest('nin', '12345678901', envFrom({})), null);
  assert.equal(
    resolveProviderRequest('nin', '12345678901', envFrom({ IDENTITY_API_KEY: 'key' })),
    null,
  );
});

test('generic provider posts to the configured path by default', () => {
  const request = resolveProviderRequest(
    'nin',
    '12345678901',
    envFrom({
      IDENTITY_API_KEY: 'secret',
      IDENTITY_API_BASE_URL: 'https://kyc.example.com/',
      IDENTITY_NIN_PATH: '/v1/nin',
    }),
  );
  assert.equal(request.provider, 'generic');
  assert.equal(request.url, 'https://kyc.example.com/v1/nin');
  assert.equal(request.init.method, 'POST');
  assert.deepEqual(JSON.parse(request.init.body), { number: '12345678901' });
  assert.equal(request.init.headers.Authorization, 'Bearer secret');
});

test('generic provider can use GET and a custom field', () => {
  const request = resolveProviderRequest(
    'bvn',
    '12345678901',
    envFrom({
      IDENTITY_API_KEY: 'secret',
      IDENTITY_API_BASE_URL: 'https://kyc.example.com',
      IDENTITY_BVN_PATH: '/v1/bvn',
      IDENTITY_HTTP_METHOD: 'GET',
      IDENTITY_NUMBER_FIELD: 'idNumber',
      IDENTITY_API_AUTH_HEADER: 'x-api-key',
      IDENTITY_API_AUTH_SCHEME: '',
    }),
  );
  assert.equal(request.init.method, 'GET');
  assert.equal(request.url, 'https://kyc.example.com/v1/bvn?idNumber=12345678901');
  assert.equal(request.init.headers['x-api-key'], 'secret');
});

test('prembly preset uses its own paths and headers', () => {
  const request = resolveProviderRequest(
    'bvn',
    '12345678901',
    envFrom({ IDENTITY_PROVIDER: 'prembly', IDENTITY_API_KEY: 'pk', IDENTITY_API_APP_ID: 'app' }),
  );
  assert.equal(request.url, 'https://api.prembly.com/verification/bvn');
  assert.equal(request.init.headers['x-api-key'], 'pk');
  assert.equal(request.init.headers['app-id'], 'app');
  assert.deepEqual(JSON.parse(request.init.body), { number: '12345678901' });
});

test('dojah preset uses GET query parameters', () => {
  const request = resolveProviderRequest(
    'nin',
    '12345678901',
    envFrom({ IDENTITY_PROVIDER: 'dojah', IDENTITY_API_KEY: 'dk', IDENTITY_API_APP_ID: 'app' }),
  );
  assert.equal(request.url, 'https://api.dojah.io/api/v1/kyc/nin?number=12345678901');
  assert.equal(request.init.method, 'GET');
  assert.equal(request.init.headers.Authorization, 'dk');
  assert.equal(request.init.headers.AppId, 'app');
});

test('explicit base URL and path override a preset', () => {
  const request = resolveProviderRequest(
    'nin',
    '12345678901',
    envFrom({
      IDENTITY_PROVIDER: 'prembly',
      IDENTITY_API_KEY: 'pk',
      IDENTITY_API_BASE_URL: 'https://sandbox.example.com',
      IDENTITY_NIN_PATH: '/sandbox/nin',
    }),
  );
  assert.equal(request.url, 'https://sandbox.example.com/sandbox/nin');
});

test('generic provider refuses a missing path', () => {
  assert.equal(
    resolveProviderRequest(
      'bvn',
      '12345678901',
      envFrom({ IDENTITY_API_KEY: 'secret', IDENTITY_API_BASE_URL: 'https://kyc.example.com' }),
    ),
    null,
  );
});

console.log(`\n${passed} passed, ${failures.length} failed\n`);

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`FAILED: ${failure.name}`);
    console.error(failure.error);
  }
  process.exit(1);
}
