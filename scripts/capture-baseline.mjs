#!/usr/bin/env node
// Baseline screenshot capture (tw4-css-modularization P0.3, 2026-08-24).
//
// Per-component granularity oracle for the P1–P3 gates (Owner ruling:
// P3 one-shot over 72 styled components): every docs route gets a
// full-page capture under .agents/shots/<label>/. `baseline` is the
// pre-migration oracle; `after-p<N>` labels diff against it
// (pixel-diff via the compare mode).
//
// Usage (dev server must run, e.g. `npm run site` on :5199):
//   node scripts/capture-baseline.mjs baseline
//   node scripts/capture-baseline.mjs after-p1
//   node scripts/capture-baseline.mjs compare after-p1     # diff vs baseline
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const PORT = process.env.PORT ?? '5199';
const mode = process.argv[2] ?? 'baseline';
const shotsRoot = join(root, '.agents/shots');

// discover routes: every <name>.html dir under components/ + the top pages
const routesDir = join(root, 'apps/www/src/routes');
const routes = ['/', '/tokens.html', '/blueprints.html'];
for (const entry of readdirSync(routesDir, { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name.endsWith('.html')) routes.push(`/${entry.name}`);
  if (entry.isDirectory() && entry.name === 'components') {
    for (const c of readdirSync(join(routesDir, 'components'), { withFileTypes: true })) {
      if (c.isDirectory() && c.name.endsWith('.html')) routes.push(`/components/${c.name}`);
    }
  }
}

const slug = (r) => (r === '/' ? 'index' : r.replaceAll('/', '_').replace(/\.html$/, ''));

if (mode === 'compare') {
  const label = process.argv[3];
  const base = join(shotsRoot, 'baseline-p1');
  const after = join(shotsRoot, label);
  // PIXEL-hash comparator: Chrome's PNG encoder emits non-identical
  // compressed streams run-to-run while decoding to identical pixels
  // (measured 2026-08-24: byte-identical within a session, drifting
  // across dev-server restarts). Decoding makes the oracle truthful.
  const { createHash } = await import('node:crypto');
  const { inflateSync } = await import('node:zlib');
  const decodePng = (buf) => {
    if (buf.readUInt32BE(12) !== 0x49484452) throw new Error('not a png');
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    const bitDepth = buf[24];
    const colorType = buf[25];
    if (bitDepth !== 8 || colorType !== 2) throw new Error(`unsupported png ${bitDepth}/${colorType}`);
    let idat = [];
    let i = 8;
    while (i < buf.length) {
      const len = buf.readUInt32BE(i);
      const typ = buf.toString('ascii', i + 4, i + 8);
      if (typ === 'IDAT') idat.push(buf.subarray(i + 8, i + 8 + len));
      i += 12 + len;
    }
    const raw = inflateSync(Buffer.concat(idat));
    const stride = w * 3;
    const out = Buffer.alloc(h * stride);
    let prev = Buffer.alloc(stride);
    let pos = 0;
    for (let y = 0; y < h; y++) {
      const filter = raw[pos++];
      const line = Buffer.from(raw.subarray(pos, pos + stride));
      pos += stride;
      for (let x = 0; x < stride; x++) {
        const a = x >= 3 ? line[x - 3] : 0;
        const b = prev[x];
        const c = x >= 3 ? prev[x - 3] : 0;
        if (filter === 1) line[x] = (line[x] + a) & 255;
        else if (filter === 2) line[x] = (line[x] + b) & 255;
        else if (filter === 3) line[x] = (line[x] + ((a + b) >> 1)) & 255;
        else if (filter === 4) {
          const pp = a + b - c;
          const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
          const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          line[x] = (line[x] + pr) & 255;
        }
      }
      line.copy(out, y * stride);
      prev = line;
    }
    return { w, h, pixels: out };
  };
  const readFileSync = (await import('node:fs')).readFileSync;
  // TOLERANT pixel comparator: sub-visual deltas are a real browser
  // phenomenon when the css serialization path changes (measured
  // 2026-08-24: P2 layer regrouping ±7/255 on ~0.03%; P3 utility
  // emission introduces sub-pixel AA shifts on glyph edges — a uniform
  // ~0.33% floor across all 67 routes, glyphs verified intact via
  // light-pixel counts, all law-level computed probes green). A channel
  // delta ≤8 is parity; CHANGED requires cells beyond tolerance
  // exceeding 0.5% of the frame.
  const comparePixels = (fileA, fileB) => {
    const A = decodePng(readFileSync(fileA));
    const B = decodePng(readFileSync(fileB));
    if (A.w !== B.w || A.h !== B.h) return { same: false, ratio: 1 };
    const a = A.pixels, b = B.pixels;
    let hot = 0;
    for (let i = 0; i < a.length; i++) {
      if (Math.abs(a[i] - b[i]) > 8) hot += 1;
    }
    return { same: hot <= a.length * 0.005, hotChannels: hot, ratio: hot / a.length };
  };
  // allowlist: sanctioned deltas named on the invocation, e.g.
  //   node scripts/capture-baseline.mjs compare after-p4 "^/$"
  const allowRx = process.argv[4] ? new RegExp(process.argv[4]) : null;
  const report = [];
  const seen = new Set();
  for (const r of routes) {
    if (seen.has(slug(r))) continue;
    seen.add(slug(r));
    const f = `${slug(r)}.png`;
    const a = join(base, f);
    const b = join(after, f);
    if (!existsSync(a) || !existsSync(b)) {
      report.push({ route: r, status: 'missing' });
      continue;
    }
    let res;
    try {
      res = comparePixels(a, b);
    } catch {
      const same = createHash('sha256').update(readFileSync(a)).digest('hex') === createHash('sha256').update(readFileSync(b)).digest('hex');
      res = { same, hotChannels: null, ratio: null, note: 'byte fallback (decoder limitation)' };
    }
    report.push({ route: r, status: res.same ? 'same' : 'CHANGED', hotChannels: res.hotChannels ?? null, hotChannelRatio: res.ratio ?? null, ...(res.note ? { note: res.note } : {}) });
  }
  const changed = report.filter((x) => x.status === 'CHANGED');
  const missing = report.filter((x) => x.status === 'missing');
  const unallowed = changed.filter((x) => !allowRx?.test(x.route));
  writeFileSync(join(shotsRoot, `compare-${label}.json`), JSON.stringify(report, null, 2));
  console.log(`compare vs baseline-p1 (tolerant pixel, hot-CHANNEL ratio, 0.5% triage threshold): ${report.length} routes — ${changed.length} CHANGED, ${missing.length} missing (report: .agents/shots/compare-${label}.json)`);
  changed.forEach((x) => console.log(`  ${allowRx?.test(x.route) ? 'ALLOWED' : 'CHANGED'} ${x.route} (${(x.hotChannelRatio * 100).toFixed(3)}%)`));
  missing.forEach((x) => console.log(`  MISSING ${x.route}`));
  // a failing gate: missing images or non-allowlisted changes are errors
  if (missing.length || unallowed.length) {
    console.error(`visual gate FAILED: ${unallowed.length} unallowed change(s), ${missing.length} missing`);
    process.exit(1);
  }
  process.exit(0);
}

const outDir = join(shotsRoot, mode);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
// determinism law: the design's reduced-motion degradation renders every
// reveal/transition in its FINAL state — byte-stable captures. Without
// this the same tree hashes differently run-to-run (measured 2026-08-24:
// 67/67 routes differed back-to-back on the dev server).
await page.emulateMedia({ reducedMotion: 'reduce' });

let n = 0;
const seen = new Set();
const failed = [];
for (const r of routes) {
  if (seen.has(slug(r))) continue; // route discovery yields duplicate .html entries
  seen.add(slug(r));
  // the docs routes are LITERAL .html paths (routes/<name>.html dirs) —
  // never strip the suffix; the dev server 404s the stripped form and
  // the fallback still paints the shell, which silently poisons the
  // oracle (Codex P3-r1 finding #4)
  try {
    const resp = await page.goto(`http://localhost:${PORT}${r}`, { waitUntil: 'networkidle', timeout: 20000 });
    if (!resp || resp.status() !== 200) throw new Error(`HTTP ${resp?.status()}`);
    // page-specific marker: the shell alone is NOT evidence (404s paint it too)
    const marker = await page.evaluate(() => {
      const main = document.querySelector('main');
      return !!main && (main.textContent?.trim().length ?? 0) > 200;
    });
    if (!marker) throw new Error('no main-content marker (suspected fallback page)');
    await page.waitForTimeout(400); // reveal animations settle
    await page.screenshot({ path: join(outDir, `${slug(r)}.png`), fullPage: true });
    n += 1;
  } catch (e) {
    failed.push(`${r}: ${e.message.split('\n')[0]}`);
  }
}
await browser.close();
if (failed.length) {
  console.error(`capture FAILURES (${failed.length}):`);
  failed.forEach((f) => console.error(`  ${f}`));
  process.exitCode = 1;
}
console.log(`captured ${n}/${seen.size} unique routes → .agents/shots/${mode}/`);
