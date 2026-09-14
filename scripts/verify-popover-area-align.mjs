#!/usr/bin/env node
// verify-popover-area-align — the ONE permanent popover regression
// probe (stylex-kernel-phase0 P0.1; design.md §5 THE PROBE CONTRACT).
//
// Protocol of record (research/p0-bug-probes.md §Appendix):
//   viewport 1440×900 headless Chromium;
//   ONE metric: panelLeft − pillLeft, read from the REAL rendered
//   geometry (getBoundingClientRect on the settled panel) — never
//   from CSS text;
//   PRIMARY  : the start-aligned placement (bottom-start → authored
//              `bottom span-right`) asserts |delta| ≤ 0.5px;
//   NEGATIVE CONTROL: the swapped placement (bottom-end → authored
//              `bottom span-left`) on the SAME metric, asserts
//              |control − primary| ≥ 1px (historical observation:
//              −146px, p0-results.json probe2.matrix[0]).
// PASS = both assertions; FAIL = either. The final line is machine
// JSON carrying primaryDelta + controlDelta (+pass) on BOTH outcomes.
//
// The probe drives the REAL Popover component on the built site's
// internal fixture page (/probe-popover-area.html?placement=…, the
// probe-folder-css precedent), so a regression of popover.svelte's
// placement→area map — the span-suffix inversion this gate exists
// for — flips the primary arm exactly like the negative control:
// the probe has teeth on the component map, not just on engine
// semantics. The fixture's geometry keeps both arms inside the
// viewport (no flip-inline / ICB-clamp rescue may mask the authored
// alignment); the fixture root's data-placement is read back before
// clicking, so a dropped query param can never measure a stale arm.
//
// Needs a fresh www build (dist must contain the fixture page).
// SELF-MANAGED server lifecycle (the stacking-isolation pattern):
// --url wins for standalone debug; otherwise apps/www/dist is served
// on an OS-assigned 127.0.0.1 port and closed on every exit path.
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
    if (!existsSync(join(distDir, 'probe-popover-area.html'))) {
      console.error('apps/www/dist missing or stale (no probe-popover-area.html) — run the site build first');
      process.exit(1);
    }
    const MIME = {
      '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
      '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
      '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
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

// open the fixture at a placement, settle, and measure the ONE metric
async function measureArm(page, placement) {
  await page.goto(`${BASE}/probe-popover-area.html?placement=${placement}`, { waitUntil: 'load' });
  // read-back guard: the param must have reached the component before
  // any click (a dropped param would silently measure a stale arm)
  await page.waitForFunction(
    (want) => document.querySelector('[data-probe-popover-area]')?.getAttribute('data-placement') === want,
    placement,
    { timeout: 8000 },
  );
  await page.click('button[popovertarget="probe-pop"]');
  // settled = logically open + enter motion done + a real box
  await page.waitForFunction(
    () => {
      const p = document.querySelector('#probe-pop');
      return !!p && p.matches(':popover-open') && getComputedStyle(p).transform === 'none' && p.getBoundingClientRect().width > 0;
    },
    null,
    { timeout: 8000 },
  );
  await page.waitForTimeout(60);
  return page.evaluate(() => {
    const panel = document.querySelector('#probe-pop');
    const pill = document.querySelector('button[popovertarget="probe-pop"]');
    const pr = panel.getBoundingClientRect();
    const tr = pill.getBoundingClientRect();
    return {
      delta: Math.round((pr.left - tr.left) * 100) / 100,
      area: getComputedStyle(panel).positionArea ?? '',
      pill: [Math.round(tr.left * 100) / 100, Math.round(tr.right * 100) / 100],
      panel: [Math.round(pr.left * 100) / 100, Math.round(pr.right * 100) / 100],
      panelW: Math.round(pr.width * 100) / 100,
    };
  });
}

const PRIMARY_TOL = 0.5; // px — protocol of record
const CONTROL_GAP = 1; // px — |control − primary| floor

let pass = true;
const failures = [];
let primary = null;
let control = null;

const browser = await chromium.launch({ headless: true, executablePath: findChrome() });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  primary = await measureArm(page, 'bottom-start');
  control = await measureArm(page, 'bottom-end');
  await context.close();

  console.log(`[popover-area] primary  bottom-start (authored span-right, expect LEFT edges): delta=${primary.delta}px  computed="${primary.area}"  pill=[${primary.pill}] panel=[${primary.panel}] w=${primary.panelW}`);
  console.log(`[popover-area] control  bottom-end   (authored span-left,  expect RIGHT edges): delta=${control.delta}px  computed="${control.area}"  pill=[${control.pill}] panel=[${control.panel}] w=${control.panelW}`);

  if (!(Math.abs(primary.delta) <= PRIMARY_TOL)) {
    pass = false;
    failures.push(`PRIMARY |delta| ${Math.abs(primary.delta)} > ${PRIMARY_TOL}px — the start-aligned arm does not render start-aligned (map regression or engine semantics flip)`);
  }
  if (!(Math.abs(control.delta - primary.delta) >= CONTROL_GAP)) {
    pass = false;
    failures.push(`CONTROL |control − primary| ${Math.abs(control.delta - primary.delta)} < ${CONTROL_GAP}px — the swapped placement does not discriminate (fixture or engine broken)`);
  }
} catch (err) {
  pass = false;
  failures.push(`probe error: ${String(err).slice(0, 300)}`);
} finally {
  await browser.close().catch(() => {});
  if (selfServer) await new Promise((r) => selfServer.close(r));
}

for (const f of failures) console.error(`[popover-area] FAIL — ${f}`);
// the machine line: ONE metric, both arms, decidable
console.log(JSON.stringify({ probe: 'popover-area-align', primaryDelta: primary?.delta ?? null, controlDelta: control?.delta ?? null, pass }));
console.log(pass ? '\npopover-area-align: GREEN' : '\npopover-area-align: RED');
process.exit(pass ? 0 : 1);
