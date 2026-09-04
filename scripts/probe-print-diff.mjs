#!/usr/bin/env node
// probe-print-diff — the P1 probe for print-determinism (2026-09-04).
//
// Two questions, one real Chromium:
//
//   baseline   does the SAME document print DIFFERENTLY at 800×600 vs
//              1600×1200 today? (expected RED — the Owner's report)
//   contain    does container: jx-print-viewport / inline-size on the
//              paged content area disturb fragmentation? (expected
//              GREEN — inline-size containment is theoretically safe:
//              the area's inline size is page-driven)
//
// Run: node scripts/probe-print-diff.mjs
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui/node_modules/playwright-core/index.mjs';
import { homedir } from 'node:os';
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import net from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const CHROME =
  homedir() +
  '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const PORT = process.env.PORT ?? '4173';
const URL = `http://localhost:${PORT}/docs/components/accordion.html`;

const portOpen = () =>
  new Promise((yes) => {
    const s = net.connect({ port: Number(PORT), host: '127.0.0.1' });
    s.on('connect', () => { s.destroy(); yes(true); });
    s.on('error', () => yes(false));
  });
let serverProc = null;
if (!(await portOpen())) {
  const dist = join(root, 'apps/www/dist');
  if (!existsSync(dist)) {
    console.error('no server on :' + PORT + ' and no apps/www/dist to self-serve — build first');
    process.exit(1);
  }
  serverProc = spawn('python3', ['-m', 'http.server', PORT, '--bind', '127.0.0.1', '--directory', dist], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    if (await portOpen()) break;
    await new Promise((r) => setTimeout(r, 200));
  }
}
process.on('exit', () => serverProc?.kill());

const browser = await chromium.launch({ executablePath: CHROME });

const fingerprint = async (vw, vh, injectContainer) => {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('[data-print-source] [data-jx-print-sim-toggle]', { timeout: 20000 });
  if (injectContainer) {
    await page.addStyleTag({
      content: `.pagedjs_area { container-type: inline-size; container-name: jx-print-viewport; }`,
    });
  }
  // sim on → wait for pages
  await page.click('[data-print-source] [data-jx-print-sim-toggle]');
  await page.waitForSelector('.pagedjs_page', { timeout: 30000 });
  await page.waitForTimeout(2500); // settle (folio backfill etc.)
  const fp = await page.evaluate(() => {
    const pages = [...document.querySelectorAll('.pagedjs_page')];
    return {
      count: pages.length,
      boxes: pages.map((p) => {
        const r = p.getBoundingClientRect();
        return `${Math.round(r.width)}x${Math.round(r.height)}`;
      }),
      // content signature per page: block count + inline-style stamps +
      // first/last text heads (layout-sensitive, viewport-leaking states
      // surface here as placement differences)
      content: pages.map((p) => {
        const els = [...p.querySelectorAll('.pagedjs_page_content *')];
        const stamped = els.filter((e) => e.getAttribute('style'));
        const text = (els.find((e) => e.textContent?.trim())?.textContent ?? '').trim().slice(0, 24);
        return `${els.length}/${stamped.length}/${text}`;
      }),
    };
  });
  await ctx.close();
  return fp;
};

const show = (label, fp) =>
  console.log(`${label}: pages=${fp.count} boxes=${fp.boxes.slice(0, 3).join(',')}…\n  content[0]=${fp.content[0] ?? '—'}\n  content[last]=${fp.content[fp.content.length - 1] ?? '—'}`);

// ── baseline: no container ──
const narrow = await fingerprint(800, 600, false);
const wide = await fingerprint(1600, 1200, false);
show('baseline  800×600', narrow);
show('baseline 1600×1200', wide);
const baseSame = JSON.stringify(narrow) === JSON.stringify(wide);
console.log(`baseline differential: ${baseSame ? 'IDENTICAL (unexpected — the leak may hide elsewhere)' : 'DIFFERENT (the Owner-reported bug reproduced)'}`);

// ── containment probe: container on the area, both viewports ──
const narrowC = await fingerprint(800, 600, true);
const wideC = await fingerprint(1600, 1200, true);
show('container  800×600', narrowC);
show('container 1600×1200', wideC);
const contSame = JSON.stringify(narrowC) === JSON.stringify(wideC);
const fragmented = narrowC.count >= 2 && narrowC.boxes.every((b) => !b.startsWith('0x'));
console.log(`containment probe: fragmented=${fragmented ? 'OK' : 'BROKEN'} differential=${contSame ? 'IDENTICAL' : 'DIFFERENT (expected — the re-scope pass is P2, the container alone cannot fix media queries)'}`);

await browser.close();
