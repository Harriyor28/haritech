// Scratch tool: gather CC0 candidates (Openverse: rawpixel/stocksnap) for the
// 3D Epoxy page work-example slots. Writes thumbnails + a contact sheet into
// public/_cand/ for visual review.
import { mkdir, writeFile } from 'node:fs/promises';

const OUT = new URL('../public/_cand/', import.meta.url);
await mkdir(OUT, { recursive: true });

const slots = [
  { key: 'floor-ocean', label: '1. Ocean / water 3D floor', queries: ['ocean water surface', 'sea water top view', 'blue water texture'] },
  { key: 'floor-marble', label: '2. Marble / metallic floor', queries: ['marble floor', 'marble texture luxury', 'granite stone floor'] },
  { key: 'floor-wood', label: '3. Wood / live-edge finish', queries: ['wood floor parquet', 'wooden table live edge', 'wood plank texture'] },
  { key: 'interior-living', label: '4. Finished living space', queries: ['modern living room interior', 'luxury living room', 'apartment interior design'] },
  { key: 'interior-bedroom', label: '5. Finished bedroom', queries: ['modern bedroom interior', 'hotel bedroom luxury'] },
  { key: 'table-resin', label: '6. Epoxy / river table', queries: ['wooden table furniture', 'office desk wooden'] },
  { key: 'wall-art', label: '7. Wall art / mural', queries: ['abstract wall art painting', 'abstract fluid art acrylic'] },
  { key: 'office-lobby', label: '8. Office / lobby floor', queries: ['office lobby interior', 'office building interior hallway'] },
];

const results = [];
for (const slot of slots) {
  let found = 0;
  for (const q of slot.queries) {
    if (found >= 4) break;
    try {
      const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license=cc0,pdm&source=rawpixel,stocksnap&page_size=12`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) { console.error(`  ! ${slot.key} "${q}" -> HTTP ${res.status}`); continue; }
      const data = await res.json();
      for (const r of data.results || []) {
        if (found >= 4) break;
        if (!r.thumbnail && !r.url) continue;
        if (results.some(x => x.id === r.id)) continue;
        results.push({ slot: slot.key, label: slot.label, id: r.id, title: r.title, license: r.license, creator: r.creator, source: r.source, page: r.url, full: r.url, thumb: r.thumbnail || r.url });
        found++;
      }
    } catch (e) {
      console.error(`  ! ${slot.key} "${q}" -> ${e.message}`);
    }
  }
  console.log(`${slot.key}: ${found} candidates`);
}

// download thumbs with retry
const fetchWithRetry = async (url, tries = 3) => {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (i === tries - 1) throw e;
      await new Promise(r => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw new Error('all tries failed');
};

const ok = [];
for (const r of results) {
  try {
    const buf = await fetchWithRetry(r.thumb, 3);
    if (buf.length < 3000) continue;
    const file = `t-${r.slot}-${ok.filter(x => x.slot === r.slot).length}.jpg`;
    await mkdir(new URL('../public/_cand/', import.meta.url), { recursive: true });
    await writeFile(new URL('../public/_cand/' + file, import.meta.url), buf);
    r.file = file;
    ok.push(r);
  } catch (e) {
    console.error(`  ! thumb failed ${r.slot} ${r.id}: ${e.message}`);
  }
}

// contact sheet grouped by slot
const bySlot = {};
for (const r of ok) (bySlot[r.slot] ||= []).push(r);
const sheet = `<!doctype html><html><head><meta charset="utf8"><style>
body{background:#111;color:#eee;font-family:system-ui;margin:0;padding:16px}
h2{font-size:14px;color:#67e8f9;margin:18px 0 6px}
.grid{display:flex;flex-wrap:wrap;gap:8px}
figure{margin:0;width:220px}
img{width:220px;height:150px;object-fit:cover;border-radius:6px;background:#222}
figcaption{font-size:10px;color:#aaa;margin-top:2px;word-break:break-all}
b{color:#fbbf24}
</style></head><body>
${Object.entries(bySlot).map(([slot, items]) => `<h2>${items[0].label}</h2><div class="grid">${items.map(r => `<figure><img src="/_cand/${r.file}"><figcaption><b>${r.file}</b> — ${String(r.title).slice(0, 60)}<br>${r.source} · ${r.license}</figcaption></figure>`).join('')}</div>`).join('')}
</body></html>`;
await writeFile(new URL('../public/_cand/sheet.html', import.meta.url), sheet);
await writeFile(new URL('../public/_cand/candidates.json', import.meta.url), JSON.stringify(ok, null, 2));
console.log(`\nTotal usable: ${ok.length} -> public/_cand/sheet.html`);
