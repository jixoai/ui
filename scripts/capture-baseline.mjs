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
  const base = join(shotsRoot, 'baseline');
  const after = join(shotsRoot, label);
  const report = [];
  for (const r of routes) {
    const f = `${slug(r)}.png`;
    const a = join(base, f);
    const b = join(after, f);
    if (!existsSync(a) || !existsSync(b)) {
      report.push({ route: r, status: 'missing' });
      continue;
    }
    const { createHash } = await import('node:crypto');
    const ha = createHash('sha256').update(await import('node:fs').then((m) => m.readFileSync(a))).digest('hex');
    const hb = createHash('sha256').update(await import('node:fs').then((m) => m.readFileSync(b))).digest('hex');
    report.push({ route: r, status: ha === hb ? 'same' : 'CHANGED' });
  }
  const changed = report.filter((x) => x.status === 'CHANGED');
  writeFileSync(join(shotsRoot, `compare-${label}.json`), JSON.stringify(report, null, 2));
  console.log(`compare vs baseline: ${report.length} routes — ${changed.length} CHANGED, ${report.filter((x) => x.status === 'missing').length} missing (report: .agents/shots/compare-${label}.json)`);
  changed.slice(0, 30).forEach((x) => console.log(`  CHANGED ${x.route}`));
  process.exit(0);
}

const outDir = join(shotsRoot, mode);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

let n = 0;
for (const r of routes) {
  const path = r === '/' ? '/' : r.replace(/\.html$/, '');
  try {
    await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(400); // reveal animations settle
    await page.screenshot({ path: join(outDir, `${slug(r)}.png`), fullPage: true });
    n += 1;
  } catch (e) {
    console.error(`FAIL capture ${r}: ${e.message.split('\n')[0]}`);
  }
}
await browser.close();
console.log(`captured ${n}/${routes.length} routes → .agents/shots/${mode}/`);
