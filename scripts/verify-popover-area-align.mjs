#!/usr/bin/env node
// verify-popover-area-align — the ONE permanent anchored-surface
// regression probe (stylex-kernel-phase0 P0.1; design.md §5 THE PROBE
// CONTRACT; extended by visual-quality-iteration W5.1 to the four
// recorded inverted sites).
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
// PASS = both assertions; FAIL = either.
//
// W5.1 EXTENSION — the four-surface anchor sweep (dropdown-menu,
// tooltip, float-button, menubar-panel; spec "floating surfaces
// speak spec-true position-area"):
//   MATRIX     every side × align arm per surface on fixture geometry
//              that keeps the DIRECT placement inside the viewport
//              (no flip-inline / ICB-clamp rescue may mask the
//              authored alignment — the popover-fixture law);
//   COLLISION  a flip-block arm and a flip-inline arm per surface
//              (dropdown, tooltip), the mirror-corner flip
//              (float-button) and the flip-block arm (menubar) —
//              the flipped area must stay a spec-grammar area string
//              DERIVED from the same mapping (Chromium reports the
//              USED area in computed style, so the flipped grammar
//              is assertable directly);
//   NEGATIVE   the swapped-map control — the pre-sweep INVERTED table
//              planted inline on BOTH emission channels
//              (position-area + the legacy inset-area alias) with
//              position-try neutered so no rescue masks the planted
//              map. The control MUST red (≥1 failed assertion per
//              surface): two-directional proof the probe bites on
//              the component map.
// The float-button direct arm neuters position-try too (probe-side,
// browser-only): its anchor is corner-fixed by the component's law,
// so no in-viewport geometry keeps both inline alignments un-rescued
// — neutering try is the corner-anchored equivalent of the
// mid-viewport fixture geometry; the SHIPPED try behavior has its
// own arm (the mirror corner, flipped by design).
//
// The probe drives the REAL components on the built site's internal
// fixture pages (/probe-popover-area.html + the four W5.1 siblings,
// the probe-folder-css precedent), so a regression of a component's
// placement→area map flips the arms exactly like the negative
// control: the probe has teeth on the component maps, not just on
// engine semantics. Fixture roots stamp their params as data-*
// read-back guards before any click, so a dropped query param can
// never measure a stale arm.
//
// Needs a fresh www build (dist must contain the fixture pages).
// SELF-MANAGED server lifecycle (the stacking-isolation pattern):
// --url wins for standalone debug (e.g. a dev server, read-only);
// otherwise apps/www/dist is served on an OS-assigned 127.0.0.1 port
// and closed on every exit path. --shots-dir <dir> (+ optional
// --shots-tag <t>) writes one viewport screenshot per arm.
// The final line is machine JSON carrying every summary on BOTH
// outcomes.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
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
// fixture URL shape: the self-served dist pages are .html files; a
// --url dev server (SvelteKit) serves the same routes extensionless —
// detected once below (a preview of dist keeps the .html shape)
let urlShape = 'html';
function fixtureUrl(route, params) {
  const suffix = urlShape === 'html' ? '.html' : '';
  return `${BASE}/${route}${suffix}${params ? `?${params}` : ''}`;
}
{
  const argUrl = process.argv.indexOf('--url');
  if (argUrl >= 0) {
    BASE = process.argv[argUrl + 1];
    try {
      const probe = await fetch(`${BASE}/probe-popover-area.html`);
      urlShape = probe.ok ? 'html' : 'bare';
      await probe.body?.cancel();
    } catch {
      urlShape = 'bare';
    }
    if (urlShape === 'bare') {
      const probeBare = await fetch(`${BASE}/probe-popover-area`);
      if (!probeBare.ok) {
        console.error(`--url base does not serve the fixtures (${probeBare.status} on /probe-popover-area)`);
        process.exit(1);
      }
      await probeBare.body?.cancel();
    }
  } else {
    const distDir = join(root, 'apps/www/dist');
    const fixtures = [
      'probe-popover-area.html',
      'probe-dropdown-area.html',
      'probe-tooltip-area.html',
      'probe-float-button-area.html',
      'probe-menubar-area.html',
    ];
    const missing = fixtures.filter((f) => !existsSync(join(distDir, f)));
    if (missing.length > 0) {
      console.error(`apps/www/dist missing or stale (no ${missing.join(', ')}) — run the site build first`);
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
  await page.goto(fixtureUrl('probe-popover-area', `placement=${placement}`), { waitUntil: 'load' });
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
  // pin the enter-motion phase to REST: the kernel's fill-both WAAPI
  // animation of --jx-p, when created while the panel is still
  // display:none (first open), never runs and HOLDS p=0 — a stable
  // 2.5rem×0.707 diagonal slide offset that rides the `translate`
  // property (invisible to the transform gate above). Cancel + pin:
  // the geometry under test is the anchored box, not the entry pose
  // (the sweep's equivalent law, applied here too)
  await page.evaluate(() => {
    const p = document.querySelector('#probe-pop');
    if (!p) return;
    for (const a of p.getAnimations({ subtree: true })) a.cancel();
    p.style.setProperty('--jx-p', '1');
  });
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

// ── W5.1: the sweep's own tolerances + helpers ──────────────────────
const GAP_MAX = 24; // px — anchor↔panel gap band (margin: var(--jx-gap))
const EDGE_TOL = 24; // px — flush-edge band for start/end arms
const CENTER_TOL = 1.5; // px — center symmetry

const normArea = (s) => String(s ?? '').trim().split(/\s+/).filter(Boolean).sort().join(' ');

/** two consecutive identical reads (0.1px-rounded) behind an
 *  animations-finished gate — enter motions ride WAAPI/transforms and
 *  a held/paused offset pose is STABLE but wrong; the box must be
 *  still AND its animations done */
async function settleStable(page, fn, arg) {
  await page.waitForFunction(
    (sel) => {
      const p = document.querySelector(sel);
      if (!p) return false;
      const anims = p.getAnimations({ subtree: true });
      return anims.length === 0 || anims.every((a) => a.playState === 'finished');
    },
    arg.panelSel,
    { timeout: 8000 },
  ).catch(() => {}); // a stuck animation must not hang the arm — the
  // stability loop below still guards the measurement
  let last = null;
  for (let i = 0; i < 30; i++) {
    const now = await page.evaluate(fn, arg);
    const a = JSON.stringify(now);
    if (last === a && i >= 2) return now;
    last = a;
    await page.waitForTimeout(120);
  }
  return JSON.parse(last);
}

/** assert one arm's rendered truth against the corrected map */
function judgeArm(arm, m) {
  const checks = [];
  const dLeft = +(m.panel.left - m.anchor.left).toFixed(1);
  const dRight = +(m.panel.right - m.anchor.right).toFixed(1);
  const above = +(m.anchor.top - m.panel.bottom).toFixed(1);
  const below = +(m.panel.top - m.anchor.bottom).toFixed(1);
  const geo = { dLeft, dRight, above, below, panelW: +m.panel.width.toFixed(1) };

  // SIDE: the panel occupies the region the placement names (the
  // mapping law — never the inverse)
  if (arm.side === 'above') {
    checks.push({ name: 'side-above', ok: above >= -0.5 && above <= GAP_MAX && below <= 0.5, detail: `gap=${above}` });
  } else {
    checks.push({ name: 'side-below', ok: below >= -0.5 && below <= GAP_MAX && above <= 0.5, detail: `gap=${below}` });
  }
  // ALIGN: start → leading edges flush (+gap); end → trailing edges
  // flush (−gap); center → symmetric overflow on both sides
  if (arm.align === 'start') {
    checks.push({ name: 'align-start', ok: dLeft >= -0.5 && dLeft <= EDGE_TOL && dRight > EDGE_TOL, detail: `dLeft=${dLeft} dRight=${dRight}` });
  } else if (arm.align === 'end') {
    checks.push({ name: 'align-end', ok: dRight <= 0.5 && dRight >= -EDGE_TOL && dLeft < -EDGE_TOL, detail: `dRight=${dRight} dLeft=${dLeft}` });
  } else {
    checks.push({ name: 'align-center', ok: Math.abs(dLeft + dRight) <= CENTER_TOL, detail: `dLeft=${dLeft} dRight=${dRight}` });
  }
  // COMPUTED AREA: the used area is the spec-grammar string the
  // mapping derives (direct arms: the authored map; collision arms:
  // the engine-derived flip — Chromium reports the USED value)
  checks.push({ name: 'area', ok: normArea(m.area) === normArea(arm.area), detail: `computed="${m.area}" expected="${arm.area}"` });

  return { ok: checks.every((c) => c.ok), checks, geo, area: m.area };
}

// ── the sweep's arm tables — expected values are the CORRECTED map ──
const sweepSurfaces = [
  {
    name: 'dropdown',
    route: 'probe-dropdown-area',
    open: 'click',
    openSel: 'button[popovertarget="probe-dd"]',
    panelSel: '#probe-dd',
    anchorSel: '.jx-menu-anchor',
    marker: '[data-probe-dropdown-area]',
    readback: { 'data-placement': 'placement', 'data-at': 'at' },
    arms: [
      { label: 'bottom-start', params: 'placement=bottom-start', side: 'below', align: 'start', area: 'bottom span-right' },
      { label: 'bottom', params: 'placement=bottom', side: 'below', align: 'center', area: 'bottom' },
      { label: 'bottom-end', params: 'placement=bottom-end', side: 'below', align: 'end', area: 'bottom span-left' },
      { label: 'top-start', params: 'placement=top-start', side: 'above', align: 'start', area: 'top span-right' },
      { label: 'top', params: 'placement=top', side: 'above', align: 'center', area: 'top' },
      { label: 'top-end', params: 'placement=top-end', side: 'above', align: 'end', area: 'top span-left' },
      { label: 'collision-flip-block', params: 'placement=bottom-start&at=bottom', side: 'above', align: 'start', area: 'top span-right' },
      { label: 'collision-flip-inline', params: 'placement=bottom-start&at=right', side: 'below', align: 'end', area: 'bottom span-left' },
    ],
    control: { params: 'placement=bottom-start', oldArea: 'bottom span-left' },
  },
  {
    name: 'tooltip',
    route: 'probe-tooltip-area',
    open: 'hover',
    hoverSel: '[data-jx-tip-anchor]',
    panelSel: '#probe-tip',
    anchorSel: '[data-jx-tip-anchor]',
    marker: '[data-probe-tooltip-area]',
    readback: { 'data-placement': 'placement', 'data-at': 'at' },
    arms: [
      { label: 'top-start', params: 'placement=top-start', side: 'above', align: 'start', area: 'top span-right' },
      { label: 'top', params: 'placement=top', side: 'above', align: 'center', area: 'top' },
      { label: 'top-end', params: 'placement=top-end', side: 'above', align: 'end', area: 'top span-left' },
      { label: 'bottom-start', params: 'placement=bottom-start', side: 'below', align: 'start', area: 'bottom span-right' },
      { label: 'bottom', params: 'placement=bottom', side: 'below', align: 'center', area: 'bottom' },
      { label: 'bottom-end', params: 'placement=bottom-end', side: 'below', align: 'end', area: 'bottom span-left' },
      { label: 'collision-flip-block', params: 'placement=bottom-start&at=bottom', side: 'above', align: 'start', area: 'top span-right' },
      { label: 'collision-flip-inline', params: 'placement=bottom-start&at=right', side: 'below', align: 'end', area: 'bottom span-left' },
    ],
    control: { params: 'placement=top-start', oldArea: 'top span-left' },
  },
  {
    name: 'float-button',
    route: 'probe-float-button-area',
    open: 'click',
    openSel: '[data-jx-fab-stack] button[popovertarget]',
    panelSel: '.jx-fab-menu',
    anchorSel: '[data-jx-fab-stack]',
    marker: '[data-probe-fab-area]',
    readback: { 'data-corner': 'corner' },
    // try neutered on the direct arm (corner-anchored anchor — the
    // sweep header); the shipped try behavior has the mirror arm
    arms: [
      { label: 'default-corner-direct', params: 'corner=bottom-right', neuterTry: true, side: 'above', align: 'end', area: 'top span-left' },
      { label: 'mirror-corner-flip-inline', params: 'corner=bottom-left', side: 'above', align: 'start', area: 'top span-right' },
    ],
    control: { params: 'corner=bottom-right', neuterTry: true, oldArea: 'top span-right' },
  },
  {
    name: 'menubar',
    route: 'probe-menubar-area',
    open: 'click',
    openSel: '[data-jx-menubar-trigger]',
    panelSel: '#probe-mb-panel',
    anchorSel: '[data-jx-menubar-slot]',
    marker: '[data-probe-menubar-area]',
    readback: { 'data-at': 'at' },
    arms: [
      { label: 'direct', params: 'at=top', side: 'below', align: 'start', area: 'bottom span-right' },
      { label: 'collision-flip-block', params: 'at=bottom', side: 'above', align: 'start', area: 'top span-right' },
    ],
    control: { params: 'at=top', oldArea: 'bottom span-left' },
  },
];

const shotsDirIdx = process.argv.indexOf('--shots-dir');
const shotsDir = shotsDirIdx >= 0 ? process.argv[shotsDirIdx + 1] : null;
const shotsTagIdx = process.argv.indexOf('--shots-tag');
const shotsTag = shotsTagIdx >= 0 ? process.argv[shotsTagIdx + 1] : '';

const sweepSummary = {};
const controlReds = {};

/** drive one arm end-to-end and return the settled measurement */
async function runSweepArm(context, surface, arm, mode) {
  const page = await context.newPage();
  try {
    await page.goto(fixtureUrl(surface.route, arm.params), { waitUntil: 'load' });
    // read-back guard: every param the arm names must have reached
    // the fixture before any click (dropped params measure stale arms)
    const wants = Object.entries(surface.readback).map(([attr, param]) => ({
      attr,
      want: new URLSearchParams(arm.params).get(param),
    }));
    await page.waitForFunction(
      ({ sel, wants: ws }) => {
        const q = document.querySelector(sel);
        if (!q) return false;
        return ws.every((w) => w.want == null || q.getAttribute(w.attr) === w.want);
      },
      { sel: surface.marker, wants },
      { timeout: 8000 },
    );
    if (surface.open === 'click') {
      // native popovertarget surfaces open pre-hydration; JS-wired
      // triggers get a hydration cushion + one retry
      await page.click(surface.openSel);
      try {
        await page.waitForFunction((sel) => document.querySelector(sel)?.matches(':popover-open'), surface.panelSel, { timeout: 1500 });
      } catch {
        await page.waitForTimeout(350);
        await page.click(surface.openSel);
      }
    } else {
      // hover: a direct mouse move to the anchor center — page.hover's
      // actionability gate refuses the fixed-posed fixture wrapper.
      // The move AWAY first matters: a retry move to the SAME point
      // never re-fires pointerenter, and a hydration-lagged listener
      // needs a fresh entry
      const move = () =>
        page.evaluate((sel) => {
          const r = document.querySelector(sel).getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }, surface.hoverSel).then((c) => page.mouse.move(c.x, c.y));
      await page.waitForTimeout(250);
      await page.mouse.move(0, 0).catch(() => {});
      await move();
      try {
        await page.waitForFunction((sel) => document.querySelector(sel)?.matches(':popover-open'), surface.panelSel, { timeout: 2000 });
      } catch {
        await page.waitForTimeout(500);
        await page.mouse.move(0, 0).catch(() => {});
        await move();
      }
    }
    await page.waitForFunction(
      (sel) => {
        const p = document.querySelector(sel);
        return !!p && p.matches(':popover-open') && p.getBoundingClientRect().width > 0;
      },
      surface.panelSel,
      { timeout: 8000 },
    );
    if (arm.neuterTry) {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        el.style.positionTry = 'none';
        el.style.positionTryFallbacks = 'none';
      }, surface.panelSel);
    }
    if (mode === 'control') {
      // the negative control: the pre-sweep inverted value planted on
      // BOTH emission channels, position-try neutered so the planted
      // map renders direct (unmasked by any rescue)
      await page.evaluate(({ sel, area }) => {
        const el = document.querySelector(sel);
        if (!el) throw new Error(`plant: ${sel} not found`);
        el.style.positionArea = area;
        try { el.style.insetArea = area; } catch { /* legacy alias setter optional */ }
        el.style.positionTry = 'none';
        el.style.positionTryFallbacks = 'none';
      }, { sel: surface.panelSel, area: arm.oldArea });
    }
    // pin the enter-motion phase to REST (--jx-p: 1 + cancel held
    // fill-both animations): the kernel's animation, created while the
    // panel is still display:none, never runs and HOLDS p=0 — a stable
    // slide-in offset that is NOT the anchored geometry under test
    // (the popover protocol's transform gate, made phase-proof)
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return;
      for (const a of el.getAnimations({ subtree: true })) a.cancel();
      el.style.setProperty('--jx-p', '1');
    }, surface.panelSel);
    const m = await settleStable(
      page,
      ({ panelSel, anchorSel }) => {
        const panel = document.querySelector(panelSel);
        const anchor = document.querySelector(anchorSel);
        const r = (b) => ({ left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width, height: b.height });
        return { panel: r(panel.getBoundingClientRect()), anchor: r(anchor.getBoundingClientRect()), area: getComputedStyle(panel).positionArea };
      },
      { panelSel: surface.panelSel, anchorSel: surface.anchorSel },
    );
    if (shotsDir) {
      mkdirSync(shotsDir, { recursive: true });
      await page.screenshot({
        path: join(shotsDir, `${surface.name}-${arm.label}${shotsTag ? `-${shotsTag}` : ''}${mode === 'control' ? '-SWAPPED' : ''}.png`),
      });
    }
    return m;
  } finally {
    await page.close().catch(() => {});
  }
}

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

  // ── the four-surface sweep ─────────────────────────────────────
  for (const surface of sweepSurfaces) {
    const sweepContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    sweepSummary[surface.name] = { arms: 0, red: 0 };
    try {
      for (const arm of surface.arms) {
        const m = await runSweepArm(sweepContext, surface, arm, 'normal');
        const res = judgeArm(arm, m);
        sweepSummary[surface.name].arms += 1;
        if (!res.ok) {
          sweepSummary[surface.name].red += 1;
          const bad = res.checks.filter((c) => !c.ok).map((c) => `${c.name}(${c.detail})`).join('; ');
          console.log(`[${surface.name}-area] RED  ${arm.label.padEnd(24)} geo=${JSON.stringify(res.geo)} area="${res.area}" — ${bad}`);
          failures.push(`${surface.name}/${arm.label}: ${bad}`);
        } else {
          console.log(`[${surface.name}-area] ok   ${arm.label.padEnd(24)} geo=${JSON.stringify(res.geo)} area="${res.area}"`);
        }
      }
      // the swapped-map negative control: the OLD inverted map,
      // planted + unmasked, must RED the assertions
      const controlArm = { ...surface.arms.find((a) => a.params === surface.control.params) };
      const cArm = { ...controlArm, label: 'swapped-control', ...surface.control };
      const cm = await runSweepArm(sweepContext, surface, cArm, 'control');
      const cRes = judgeArm(controlArm, cm);
      controlReds[surface.name] = cRes.checks.filter((c) => !c.ok).length;
      const redNames = cRes.checks.filter((c) => !c.ok).map((c) => c.name).join(', ') || 'NOTHING';
      console.log(`[${surface.name}-area] ${cRes.ok ? '!!!  ' : 'red  '}swapped-map control (old "${surface.control.oldArea}" planted): ${redNames} red — geo=${JSON.stringify(cRes.geo)} area="${cRes.area}"`);
      if (cRes.ok) {
        pass = false;
        failures.push(`${surface.name}/swapped-control: the planted pre-sweep map did NOT red the probe — the control lost its teeth (fixture or engine broken)`);
      }
      if (sweepSummary[surface.name].red > 0) pass = false;
    } catch (err) {
      pass = false;
      failures.push(`${surface.name} sweep error: ${String(err).slice(0, 300)}`);
    } finally {
      await sweepContext.close().catch(() => {});
    }
  }
} catch (err) {
  pass = false;
  failures.push(`probe error: ${String(err).slice(0, 300)}`);
} finally {
  await browser.close().catch(() => {});
  if (selfServer) await new Promise((r) => selfServer.close(r));
}

for (const f of failures) console.error(`[popover-area] FAIL — ${f}`);
// the machine line: every summary, decidable
console.log(JSON.stringify({ probe: 'popover-area-align', primaryDelta: primary?.delta ?? null, controlDelta: control?.delta ?? null, sweep: sweepSummary, swappedControlReds: controlReds, pass }));
console.log(pass ? '\npopover-area-align: GREEN' : '\npopover-area-align: RED');
process.exit(pass ? 0 : 1);
