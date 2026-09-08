#!/usr/bin/env node
// Stacking-isolation verification (stacking-isolation, 2026-09-09).
//
// The hard, browser-computed half of the z-ladder law: every ladder
// owner shipped in the change carries `isolation: isolate` on its
// computed style, on the LIVE rendered pages that exercise it — plus
// the incident regression itself: when a scroll-run chevron chip's
// box intersects the canvas dock, the dock (not the chip) wins the
// overlap point.
//
// SELF-MANAGED server lifecycle (2026-09-09, third gate iteration):
// with no --url, the probe serves apps/www/dist itself on an
// OS-assigned port and closes it on every exit path — it does NOT
// ride verify-km's managed server (page-load behavior differed
// between the two static-server contexts; a self-contained probe
// owns its whole environment, the verify-print lesson).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { createServer as createHttpServer } from 'node:http';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ── browser discovery: CHROME_PATH, then the playwright cache, then
//    system installs (the verify-katex-mermaid contract, verbatim) ──
function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const caches = [
    join(homedir(), 'Library/Caches/ms-playwright'),
    process.env.XDG_CACHE_HOME ? join(process.env.XDG_CACHE_HOME, 'ms-playwright') : join(homedir(), '.cache/ms-playwright'),
  ];
  for (const cache of caches) {
    if (!existsSync(cache)) continue;
    const versions = readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().reverse();
    for (const v of versions) {
      for (const name of [
        'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
        'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium',
        'chrome-linux64/chrome',
        'chrome-linux/chrome',
      ]) {
        const p = join(cache, v, name);
        if (existsSync(p)) return p;
      }
    }
  }
  const system = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];
  for (const p of system) if (existsSync(p)) return p;
  console.error('No Chromium found (CHROME_PATH, playwright cache, or system installs). Run: npx playwright install chromium');
  process.exit(1);
}

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(` ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

// ── the base: --url wins (standalone debug); otherwise the probe
//    self-serves apps/www/dist on an OS-assigned port ────────────────
let BASE = null;
let selfServer = null;
{
  const argUrl = process.argv.indexOf('--url');
  if (argUrl >= 0) {
    BASE = process.argv[argUrl + 1];
  } else {
    const distDir = join(root, 'apps/www/dist');
    if (!existsSync(join(distDir, 'docs', 'components', 'scroll-run.html'))) {
      console.error('apps/www/dist missing or stale — run the site build first');
      process.exit(1);
    }
    const MIME = {
      '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
      '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
      '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon',
      '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.txt': 'text/plain',
    };
    const server = createHttpServer((req, res) => {
      let pathname;
      try {
        pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://127.0.0.1').pathname);
      } catch {
        res.writeHead(400);
        res.end('bad url');
        return;
      }
      let file = resolve(join(distDir, pathname === '/' ? 'index.html' : `.${pathname}`));
      if (!file.startsWith(distDir)) {
        res.writeHead(403);
        res.end('forbidden');
        return;
      }
      if (!existsSync(file) || statSync(file).isDirectory()) {
        const flat = join(distDir, pathname.replace(/\/+$/, '').replace(/^\//, ''));
        if (existsSync(flat) && statSync(flat).isFile()) file = flat;
        else {
          res.writeHead(404);
          res.end(`not found: ${pathname}`);
          return;
        }
      }
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
      res.end(readFileSync(file));
    });
    const port = await new Promise((resolvePort, rejectPort) => {
      server.once('error', rejectPort);
      server.listen(0, '127.0.0.1', () => resolvePort(server.address().port));
    });
    BASE = `http://127.0.0.1:${port}`;
    selfServer = server;
  }
}

const browser = await chromium.launch({ headless: true, executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

// isolation of every element matching a selector on a page — with a
// live-element floor (display:none hosts still carry computed style,
// but a page that renders ZERO matches is a broken fixture, not a pass)
async function expectIsolation(pagePath, selector, label) {
  // 'load' (never 'networkidle' — the docs pages keep a socket warm and
  // idle never settles on the static dist; the isolation assertions
  // need styles applied, which 'load' guarantees)
  await page.goto(`${BASE}${pagePath}`, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  const found = await page.evaluate((sel) => {
    const els = [...document.querySelectorAll(sel)];
    return els.map((el) => ({
      isolation: getComputedStyle(el).isolation,
      live: el.getBoundingClientRect().width > 0 || el.getBoundingClientRect().height > 0,
    }));
  }, selector);
  const live = found.filter((f) => f.live);
  if (!live.length) {
    check(`${label} (${pagePath})`, false, `no live elements match ${selector}`);
    return;
  }
  const bad = live.filter((f) => f.isolation !== 'isolate');
  check(`${label} (${pagePath})`, bad.length === 0, `${live.length - bad.length}/${live.length} isolated${bad.length ? ` — ${bad.length} NOT isolated` : ''}`);
}

// the ladder owners shipped in stacking-isolation, on their pages
await expectIsolation('/docs/components/scroll-run.html', '.jx-scroll-host', 'scroll-run host (veil/chip ladder)');
await expectIsolation('/docs/components/scroll-run.html', '[data-jx-canvas-stage-row]', 'canvas stage-row (dock ladder)');
await expectIsolation('/docs/components/scroll-run.html', '[data-jx-canvas-scroll]', 'canvas scroll layer (demo ceiling)');
await expectIsolation('/docs/components/timeline.html', '[data-jx-timeline]', 'timeline ol (cross-item ladder)');
await expectIsolation('/docs/components/table.html', '.jx-table', 'table frame (sticky ladder)');
await expectIsolation('/docs/components/spin.html', '[data-jx-spin-wrap]', 'spin wrap (badge ladder)');
await expectIsolation('/docs/components/terminal-header.html', '.jx-nav', 'terminal-header bezel');
await expectIsolation('/docs/components/accordion.html', '.jx-shell-host', 'website-scaffold shell-host');

// the incident regression: on the scroll-run page the demo chip's box
// intersects the canvas dock — the overlap point must belong to the
// dock's subtree (demo chrome never paints above canvas chrome)
{
  await page.goto(`${BASE}/docs/components/scroll-run.html`, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  // all inline (no playwright actionability — dead chips are
  // display:none and would hang scrollIntoViewIfNeeded): scan every
  // live chip, and where one's box intersects the dock, scroll it
  // center-viewport instantly and hit-test the overlap point
  const verdict = await page.evaluate(() => {
    const dock = document.querySelector('[data-jx-canvas-dock]');
    if (!dock) return { state: 'no-dock' };
    for (const chip of document.querySelectorAll("[data-jx-scroll-chevron='start'], [data-jx-scroll-chevron='end']")) {
      let c = chip.getBoundingClientRect();
      if (c.width === 0) continue;
      // the boxes may overlap in PAGE coords while the overlap point
      // sits below the fold — always center the chip first (instant,
      // no smooth-behavior races), then measure
      chip.scrollIntoView({ block: 'center', behavior: 'instant' });
      c = chip.getBoundingClientRect();
      const dr = dock.getBoundingClientRect();
      const overlap = !(c.left >= dr.right || c.right <= dr.left || c.top >= dr.bottom || c.bottom <= dr.top);
      if (!overlap) continue;
      const px = (Math.max(c.left, dr.left) + Math.min(c.right, dr.right)) / 2;
      const py = c.top + c.height / 2;
      const hit = document.elementFromPoint(px, py);
      return {
        state: 'overlap',
        dockWins: hit === dock || dock.contains(hit),
        hit: hit ? hit.tagName : 'null',
        probe: [Math.round(px), Math.round(py)],
      };
    }
    return { state: 'no-overlap' };
  });
  if (verdict.state === 'overlap') {
    check('incident regression: chip under the dock at the overlap', verdict.dockWins, `hit ${verdict.hit} @ ${verdict.probe}`);
  } else if (verdict.state === 'no-dock') {
    check('incident regression: chip under the dock at the overlap', false, 'no dock on the fixture page');
  } else {
    check('incident regression: chip under the dock at the overlap', true, 'no chip/dock overlap on this layout — fixture skipped (page layout changed; re-pin the fixture page)');
  }
}

// the dock's own rung: still z 1 over the demo unit (the order the
// ladder encodes, now inside the isolated stage-row)
{
  const z = await page.evaluate(() => getComputedStyle(document.querySelector('[data-jx-canvas-dock]')).zIndex);
  check('dock z-index (the chrome rung)', z === '1', `computed ${z}`);
}

await browser.close();
if (selfServer) await new Promise((r) => selfServer.close(r));
const failed = results.filter((r) => !r.ok);
console.log(failed.length === 0 ? '\nstacking-isolation: ALL GREEN' : `\nstacking-isolation: ${failed.length} FAILURE(S)`);
process.exit(failed.length ? 1 : 0);
