#!/usr/bin/env node
/**
 * Builds a static review sheet and a sign-off CSV from the draft register.
 * Reads  pricing/drafts/proposed-prices.json
 * Writes pricing/drafts/review-sheet.html
 *        pricing/drafts/signoff.csv
 *
 * No network, no dependencies, no application imports.
 * Usage: node pricing/drafts/build-review.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(here, 'proposed-prices.json'), 'utf8'));
const services = data.services;

const naira = n => `₦${Math.round(n).toLocaleString('en-NG')}`;
const esc = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const badgeClass = status => ({
  'DRAFT': 'b-draft',
  'COST EVIDENCE NEEDED': 'b-cost',
  'OFFICIAL FEE VERIFICATION NEEDED': 'b-official',
  'COMPETITOR REFERENCE ONLY': 'b-comp',
  'READY FOR OWNER REVIEW': 'b-ready',
  'APPROVED': 'b-approved',
}[status] ?? 'b-draft');

const categories = [...new Set(services.map(s => s.category))];
const evidenceStatuses = [...new Set(services.map(s => s.evidence_status))];
const priced = services.filter(s => s.proposed_price_ngn !== null).length;
const unpriced = services.length - priced;

const rows = services.map(item => {
  const current = item.current?.display ?? '—';
  const proposed = item.proposed_price_ngn === null
    ? '<span class="missing">OWNER PRICE REQUIRED</span>'
    : `<strong>${esc(naira(item.proposed_price_ngn))}</strong>`;
  const unit = item.unit_confirmed && item.unit
    ? esc(item.unit)
    : '<span class="warn">unconfirmed</span>';
  const notes = (item.risk_notes ?? []).map(n => `<li>${esc(n)}</li>`).join('');
  const questions = (item.owner_confirmation ?? []).map(n => `<li>${esc(n)}</li>`).join('');

  return `<tr data-cat="${esc(item.category)}" data-status="${esc(item.evidence_status)}" data-text="${esc(`${item.id} ${item.service} ${item.category}`.toLowerCase())}">
    <td class="id">${esc(item.id)}</td>
    <td><div class="svc">${esc(item.service)}</div><div class="cat">${esc(item.category)}</div></td>
    <td class="now">${esc(current)}</td>
    <td class="prop">${proposed}</td>
    <td>${unit}</td>
    <td><span class="badge ${badgeClass(item.evidence_status)}">${esc(item.evidence_status)}</span></td>
    <td class="notes">
      <details><summary>Notes &amp; questions</summary>
        <ul>${notes}</ul>
        <div class="qtitle">Owner confirmation</div>
        <ul>${questions}</ul>
      </details>
    </td>
  </tr>`;
}).join('');

const categoryOptions = categories
  .map(c => `<option value="${esc(c)}">${esc(c)}</option>`)
  .join('');
const statusOptions = evidenceStatuses
  .map(s => `<option value="${esc(s)}">${esc(s)}</option>`)
  .join('');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Haritech — Draft Price Register Review</title>
<style>
  :root {
    --ink: #10231b; --muted: #5d6f66; --line: #d8e2dc;
    --gold: #9a7b1f; --gold-soft: #f4ecd6; --bg: #f7f9f8;
    --green: #14532d; --green-soft: #dcfce7;
    --amber: #92400e; --amber-soft: #fef3c7;
    --red: #991b1b; --red-soft: #fee2e2;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink);
    font: 15px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
  header { background: #0e2a20; color: #f6f3e8; padding: 28px 24px 22px; }
  header h1 { margin: 0 0 4px; font-size: 26px; letter-spacing: .2px; }
  header p { margin: 0; color: #c8d5c6; }
  .banner { background: var(--gold-soft); border-bottom: 1px solid #e3d3a2;
    color: #5c4708; padding: 10px 24px; font-weight: 600; font-size: 14px; }
  main { max-width: 1400px; margin: 0 auto; padding: 22px 20px 60px; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 12px; margin-bottom: 20px; }
  .card { background: #fff; border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; }
  .card .n { font-size: 26px; font-weight: 700; line-height: 1.1; }
  .card .l { color: var(--muted); font-size: 13px; margin-top: 2px; }
  .conflicts { background: #fff; border: 1px solid var(--line); border-left: 4px solid var(--gold);
    border-radius: 8px; padding: 16px 18px; margin-bottom: 20px; }
  .conflicts h2 { margin: 0 0 8px; font-size: 17px; }
  .conflicts ul { margin: 0; padding-left: 20px; }
  .conflicts li { margin: 4px 0; }
  .controls { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;
    position: sticky; top: 0; background: var(--bg); padding: 10px 0; z-index: 2; }
  .controls input, .controls select { padding: 9px 11px; border: 1px solid #b9c8c0;
    border-radius: 7px; background: #fff; color: var(--ink); font: inherit; }
  .controls input { flex: 1 1 260px; }
  .count { align-self: center; color: var(--muted); font-size: 13px; }
  table { width: 100%; border-collapse: collapse; background: #fff;
    border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
  thead th { background: #eef3f0; text-align: left; font-size: 12px; letter-spacing: .4px;
    text-transform: uppercase; color: #40544a; padding: 11px 12px; border-bottom: 1px solid var(--line); }
  tbody td { padding: 12px; border-bottom: 1px solid #e8efeb; vertical-align: top; }
  tbody tr:hover { background: #fbfdfc; }
  .id { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12.5px;
    color: var(--muted); white-space: nowrap; }
  .svc { font-weight: 600; }
  .cat { color: var(--muted); font-size: 12.5px; margin-top: 2px; }
  .now { color: var(--muted); font-size: 13px; min-width: 150px; }
  .prop { white-space: nowrap; }
  .prop strong { font-size: 15.5px; }
  .badge { display: inline-block; padding: 3px 9px; border-radius: 999px;
    font-size: 11.5px; font-weight: 700; white-space: nowrap; }
  .b-cost { background: var(--amber-soft); color: var(--amber); }
  .b-official { background: var(--red-soft); color: var(--red); }
  .b-ready { background: var(--green-soft); color: var(--green); }
  .b-draft { background: #e5e7eb; color: #374151; }
  .b-approved { background: #dbeafe; color: #1e40af; }
  .warn { color: var(--amber); font-size: 12.5px; font-weight: 600; }
  .missing { color: var(--red); font-weight: 700; font-size: 12.5px; }
  .notes { max-width: 420px; color: var(--muted); font-size: 12.5px; }
  details summary { cursor: pointer; color: #315b49; font-weight: 600; }
  details ul { margin: 6px 0 8px; padding-left: 18px; }
  details li { margin: 3px 0; }
  .qtitle { font-weight: 700; color: var(--ink); font-size: 12px; text-transform: uppercase;
    letter-spacing: .3px; margin-top: 8px; }
  .hidden { display: none; }
  footer { max-width: 1400px; margin: 0 auto; padding: 0 20px 40px;
    color: var(--muted); font-size: 12.5px; }
  @media (max-width: 900px) {
    thead { display: none; }
    table, tbody, tr, td { display: block; width: 100%; }
    tr { border-bottom: 3px solid #e8efeb; padding: 6px 0; }
    td { border: 0; padding: 6px 12px; }
    td::before { content: attr(data-label); display: block; font-size: 11px;
      text-transform: uppercase; letter-spacing: .4px; color: #7a8c82; margin-bottom: 2px; }
    .notes { max-width: none; }
  }
  @media print {
    .controls { display: none; }
    body { background: #fff; }
    tr { break-inside: avoid; }
    details { display: block; }
  }
</style>
</head>
<body>
<header>
  <h1>Haritech Exclusive Business — Draft Price Register</h1>
  <p>Owner review sheet · generated ${esc(data.generated_on)} · currency ${esc(data.currency)} · source: owner Phase 3 register</p>
</header>
<div class="banner">DRAFT — NOT ACTIVE. No price on this sheet is approved or published. No effective date is set.</div>
<main>
  <section class="cards">
    <div class="card"><div class="n">${services.length}</div><div class="l">Services in register</div></div>
    <div class="card"><div class="n">${priced}</div><div class="l">Priced</div></div>
    <div class="card"><div class="n">${unpriced}</div><div class="l">Awaiting an owner price</div></div>
    <div class="card"><div class="n">${services.filter(s => !s.unit_confirmed).length}</div><div class="l">Units unconfirmed</div></div>
    <div class="card"><div class="n">0</div><div class="l">Approved</div></div>
  </section>

  <section class="conflicts">
    <h2>Decisions to settle before any activation</h2>
    <ul>
      <li><strong>Epoxy inversion:</strong> Solid ₦35,000/m² now exceeds Metallic ₦30,000/m²; Flake ₦40,000/m² exceeds Marble ₦35,000/m² — confirm intent.</li>
      <li><strong>SCUML:</strong> declared separate but no price supplied — it cannot be published as free.</li>
      <li><strong>CAC stamp, courier and MFB registration</strong> have no replacement price.</li>
      <li><strong>Solar maintenance ₦50,000</strong> conflicts with the existing “2-Year Free Maintenance Contract” claim.</li>
      <li><strong>Import consultation (IMP-006) and business advisory (BUS-003)</strong> are both ₦20,000/session.</li>
      <li><strong>Epoxy standalone rates</strong> ₦45,000 prep / ₦55,000 topcoat are valid only outside a standard finish.</li>
      <li><strong>Budget bands</strong> still top out at ₦2.5m, below the ₦6.7m and ₦12m solar packages.</li>
    </ul>
  </section>

  <div class="controls">
    <input id="q" type="search" placeholder="Search by ID, service or category…" aria-label="Search" />
    <select id="cat" aria-label="Category"><option value="">All categories</option>${categoryOptions}</select>
    <select id="stat" aria-label="Evidence status"><option value="">All statuses</option>${statusOptions}</select>
    <span class="count" id="count"></span>
  </div>

  <table>
    <thead>
      <tr>
        <th>ID</th><th>Service</th><th>Current</th><th>Proposed</th>
        <th>Unit</th><th>Evidence status</th><th>Notes</th>
      </tr>
    </thead>
    <tbody id="rows">${rows}</tbody>
  </table>
</main>
<footer>
  Generated from <code>pricing/drafts/proposed-prices.json</code>. This page is static and is not part of the website build.
  Prices are reproduced exactly from the owner register and remain unapproved until signed off service by service.
</footer>
<script>
  const q = document.getElementById('q');
  const cat = document.getElementById('cat');
  const stat = document.getElementById('stat');
  const count = document.getElementById('count');
  const rows = [...document.querySelectorAll('#rows tr')];
  function apply() {
    const term = q.value.trim().toLowerCase();
    let shown = 0;
    for (const row of rows) {
      const okText = !term || row.dataset.text.includes(term);
      const okCat = !cat.value || row.dataset.cat === cat.value;
      const okStat = !stat.value || row.dataset.status === stat.value;
      const ok = okText && okCat && okStat;
      row.classList.toggle('hidden', !ok);
      if (ok) shown++;
    }
    count.textContent = shown + ' of ' + rows.length + ' shown';
  }
  q.addEventListener('input', apply);
  cat.addEventListener('change', apply);
  stat.addEventListener('change', apply);
  apply();
</script>
</body>
</html>`;

writeFileSync(join(here, 'review-sheet.html'), html, 'utf8');

const csvHeader = [
  'service_id', 'category', 'service', 'proposed_price_ngn', 'currency',
  'unit', 'unit_confirmed', 'evidence_status', 'decision_run_1', 'decision_run_2',
  'owner_note', 'amended_price_ngn',
];
const csvEscape = value => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const csvRows = services.map(s => [
  s.id, s.category, s.service,
  s.proposed_price_ngn === null ? '' : s.proposed_price_ngn,
  s.currency, s.unit ?? '', s.unit_confirmed ? 'yes' : 'no',
  s.evidence_status, '', '', '', '',
].map(csvEscape).join(','));

writeFileSync(
  join(here, 'signoff.csv'),
  [csvHeader.join(','), ...csvRows].join('\r\n') + '\r\n',
  'utf8',
);

console.log(`Built review-sheet.html (${services.length} services)`);
console.log('Built signoff.csv (decision columns left blank)');
