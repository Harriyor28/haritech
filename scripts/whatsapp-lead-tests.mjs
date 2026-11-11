/* Dependency-free tests for the WhatsApp lead-context helpers.
   Run with: node scripts/whatsapp-lead-tests.mjs

   Bundles src/utils/whatsappLead.ts with esbuild and asserts the pure
   message-building rules. It does not touch the network or storage. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = process.cwd();
const outDir = path.join(root, '.tmp-whatsapp-lead');
const outFile = path.join(outDir, 'whatsapp-lead.mjs');

fs.mkdirSync(outDir, { recursive: true });

await build({
  entryPoints: [path.join(root, 'src/utils/whatsappLead.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  outfile: outFile,
  logLevel: 'silent',
});

const lead = await import(`${pathToFileURL(outFile).href}?t=${Date.now()}`);

const { LEAD_PAGE_LABELS, getLeadPageLabel, buildLeadMessage, buildLeadWhatsAppUrl } = lead;

let passed = 0;
let failed = 0;
const test = (name, fn) => {
  try {
    fn();
    passed += 1;
  } catch (error) {
    failed += 1;
    console.error(`FAIL: ${name}`);
    console.error(`  ${error.message}`);
  }
};

/* ---------- getLeadPageLabel: known routes ---------- */

test('labels every /haritech route with a human name', () => {
  assert.equal(getLeadPageLabel('/haritech/solar-energy'), 'solar energy');
  assert.equal(getLeadPageLabel('/haritech/3d-epoxy'), '3D epoxy and interior decor');
  assert.equal(getLeadPageLabel('/haritech/request-quote'), 'quote request');
  assert.equal(getLeadPageLabel('/haritech/cac-registration'), 'CAC registration');
  assert.equal(getLeadPageLabel('/haritech/portfolio'), 'Portfolio');
  assert.equal(getLeadPageLabel('/'), 'Home');
  assert.equal(getLeadPageLabel('/haritech'), 'homepage');
});

test('labels the portfolio detail route', () => {
  assert.equal(getLeadPageLabel('/project/13'), 'portfolio project page');
  assert.equal(getLeadPageLabel('/project/1'), 'portfolio project page');
});

test('falls back to a prettified name for unknown routes', () => {
  assert.equal(getLeadPageLabel('/haritech/unknown-page'), 'Unknown Page');
  assert.equal(getLeadPageLabel('/some/new-route'), 'New Route');
});

test('returns an empty label when there is no path (SSR/node without window)', () => {
  assert.equal(getLeadPageLabel(''), '');
  assert.equal(getLeadPageLabel(undefined), '');
});

test('every label is non-empty and has no hyphens', () => {
  for (const [route, label] of Object.entries(LEAD_PAGE_LABELS)) {
    assert.ok(label.length > 0, `label for ${route} is empty`);
    assert.ok(!label.includes('-'), `label for ${route} still has a hyphen: ${label}`);
  }
});

/* ---------- buildLeadMessage ---------- */

test('subject message greets and appends page context', () => {
  const msg = buildLeadMessage('I need a 5kva solar system.', 'solar energy');
  assert.equal(
    msg,
    'Hello Haritech Exclusive Business! I need a 5kva solar system. Sent from the solar energy page on your website.'
  );
});

test('no-subject message still tells the desk which page the visitor was on', () => {
  const msg = buildLeadMessage(undefined, 'Contact');
  assert.equal(
    msg,
    'Hello Haritech Exclusive Business! I would like to consult about your services. Sent from the Contact page on your website.'
  );
});

test('no label means no context sentence', () => {
  assert.equal(
    buildLeadMessage('Hello there', ''),
    'Hello Haritech Exclusive Business! Hello there'
  );
});

test('subject whitespace is trimmed', () => {
  const msg = buildLeadMessage('  I have a question  ', '');
  assert.ok(msg.startsWith('Hello Haritech Exclusive Business! I have a question'));
});

/* ---------- buildLeadWhatsAppUrl ---------- */

const NUMBER = '2348168438328';

test('URL targets the Haritech WhatsApp number with encoded text', () => {
  const url = buildLeadWhatsAppUrl(NUMBER, 'I need help');
  assert.ok(url.startsWith(`https://wa.me/${NUMBER}?text=`));
  const text = decodeURIComponent(url.split('?text=')[1]);
  assert.equal(text, buildLeadMessage('I need help', ''));
});

test('unicode survives the round trip (décor)', () => {
  const url = buildLeadWhatsAppUrl(NUMBER, 'I want an epoxy décor floor');
  const text = decodeURIComponent(url.split('?text=')[1]);
  assert.ok(text.includes('décor'));
});

test('URL encodes newlines safely', () => {
  const url = buildLeadWhatsAppUrl(NUMBER, 'Line one\nLine two');
  const text = decodeURIComponent(url.split('?text=')[1]);
  assert.ok(text.includes('Line one\nLine two'));
});

/* ---------- window-context integration (guarded global) ---------- */

test('reads the page path from window.location when no argument is given', () => {
  const originalWindow = globalThis.window;
  try {
    globalThis.window = { location: { pathname: '/haritech/solar-advisor' } };
    assert.equal(getLeadPageLabel(), 'solar advisor');
    const msg = buildLeadMessage('My roof is 40sqm', getLeadPageLabel());
    assert.ok(msg.endsWith('Sent from the solar advisor page on your website.'));
  } finally {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});

test('honest copy: generated lead text never promises free services', () => {
  for (const [route] of Object.entries(LEAD_PAGE_LABELS)) {
    const msg = buildLeadMessage('I would like to book a service.', getLeadPageLabel(route));
    assert.ok(!/\bfree\b/i.test(msg), `lead text for ${route} mentions "free": ${msg}`);
  }
});

/* ---------- summary ---------- */

console.log(`${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
