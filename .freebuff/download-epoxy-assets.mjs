// Scratch tool: download the chosen CC0 epoxy work-example finals into
// public/images/ and append provenance entries to public/images/CREDITS.json.
import { readFile, writeFile } from 'node:fs/promises';

const CAND = new URL('../public/_cand/candidates.json', import.meta.url);
const IMG_DIR = new URL('../public/images/', import.meta.url);
const CREDITS = new URL('../public/images/CREDITS.json', import.meta.url);

const picks = [
  { slot: 'floor-ocean', idx: 0, name: 'epoxy-ocean' },
  { slot: 'floor-ocean', idx: 1, name: 'epoxy-lagoon' },
  { slot: 'floor-marble', idx: 2, name: 'epoxy-marble' },
  { slot: 'floor-marble', idx: 3, name: 'epoxy-metallic-green' },
  { slot: 'floor-wood', idx: 3, name: 'epoxy-timber' },
  { slot: 'interior-living', idx: 0, name: 'epoxy-living' },
  { slot: 'interior-bedroom', idx: 2, name: 'epoxy-bedroom' },
  { slot: 'office-lobby', idx: 0, name: 'epoxy-lobby' },
  { slot: 'office-lobby', idx: 1, name: 'epoxy-feature-wall' },
  { slot: 'wall-art', idx: 3, name: 'epoxy-mural' },
];

const candidates = JSON.parse(await readFile(CAND, 'utf8'));

const fetchWithRetry = async (url, tries = 4) => {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
          Referer: 'https://openverse.org/',
        },
      });
      if (res.ok) return Buffer.from(await res.arrayBuffer());
      if (res.status === 404) throw new Error('HTTP 404');
    } catch (e) {
      if (i === tries - 1) throw e;
      await new Promise(r => setTimeout(r, 900 * (i + 1)));
    }
  }
  throw new Error('all tries failed');
};

const isJpeg = (b) => b[0] === 0xff && b[1] === 0xd8;
const isPng = (b) => b[0] === 0x89 && b[1] === 0x50;
const isWebp = (b) => b.slice(8, 12).toString() === 'WEBP';

const newCredits = [];
for (const p of picks) {
  const c = candidates.find(x => x.slot === p.slot && candidates.filter(y => y.slot === p.slot).indexOf(x) === p.idx);
  if (!c) { console.error(`!! missing candidate ${p.slot}#${p.idx}`); continue; }
  let saved = false;
  for (const url of [c.full, c.thumb]) {
    if (!url || saved) continue;
    try {
      const buf = await fetchWithRetry(url);
      if (buf.length < 20000) throw new Error(`too small (${buf.length}b)`);
      if (!(isJpeg(buf) || isPng(buf) || isWebp(buf))) throw new Error('not an image');
      const ext = isPng(buf) ? 'png' : isWebp(buf) ? 'webp' : 'jpg';
      const file = `${p.name}.${ext}`;
      await writeFile(new URL(file, IMG_DIR), buf);
      console.log(`${file}: ${(buf.length / 1024).toFixed(0)}KB — ${url.slice(0, 80)}`);
      newCredits.push({ file: p.name, title: c.title || null, license: c.license, creator: c.creator || null, source: c.source || null, page: c.page });
      saved = true;
    } catch (e) {
      console.error(`  ! ${p.name} via ${String(url).slice(0, 60)}: ${e.message}`);
    }
  }
  if (!saved) console.error(`!! FAILED ${p.name}`);
}

// append credits (preserve existing entries)
let credits = [];
try { credits = JSON.parse(await readFile(CREDITS, 'utf8')); } catch { credits = []; }
for (const nc of newCredits) {
  const idx = credits.findIndex(x => x.file === nc.file);
  if (idx >= 0) credits[idx] = { ...credits[idx], ...nc };
  else credits.push(nc);
}
await writeFile(CREDITS, JSON.stringify(credits, null, 2));
console.log(`\nSaved ${newCredits.length} images; CREDITS.json now has ${credits.length} entries.`);
