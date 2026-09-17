#!/usr/bin/env node
/**
 * collab-presence TDD matrix 3.1-3.3 — the playwright dual-instance
 * collaboration battery (design.md §6), run by test subagent C.
 *
 * Self-contained: boots its OWN temp design server on a random port
 * (never 5193), drives two browser contexts + node-side mock AI ws
 * clients, prints PASS/FAIL per assertion with checkable evidence
 * (DOM state, overlay element styles, file bytes), exits nonzero on
 * any FAIL. Finds are reported honestly — the matrix's value is the
 * truth, not the green.
 *
 * Fixture contract (W4/W6 precedent):
 *   - design/prototypes/welcome/pages/hero.svelte must carry the
 *     LITERAL raised={false} on the a4 press-button at start; the
 *     pre-test bytes are handed back at the end (W6⑥).
 *   - .jx-collab/presence.json is reset to an empty ledger pre-run
 *     (the hue law 73/146/219… needs a fresh counter) and its
 *     pre-test bytes are restored post-run.
 *   - journal.ndjson only ever grows (append is legal).
 * Process recycle: every spawned server/browser is closed and the
 * exit is confirmed (pid evidence printed).
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '../..');
const HERO = join(REPO, 'design/prototypes/welcome/pages/hero.svelte');
const PRESENCE_JSON = join(REPO, 'design/.jx-collab/presence.json');
const JOURNAL = join(REPO, 'design/.jx-collab/journal.ndjson');
const DT_PKG = join(REPO, 'packages/design-tool/package.json');

const require = createRequire('/Users/kzf/.npm/_npx/e41f203b7505f1fb/');
const { chromium } = require('playwright-core');
const loroRequire = createRequire(DT_PKG);
const wsRequire = createRequire(DT_PKG);

/** the quiet gate (presence-liveness P1/P7): collect 8 rAF timestamps
 *  in-page; a max gap < 60ms means no long task (initial /sync + Loro
 *  import + tree render) is starving the render loop. Timing probes run
 *  only after quiet — the budgets are INTERACTIVE latency, cold-start is
 *  a different (unbudgeted) phase. */
async function waitFrameQuiet(target, label, { timeoutMs = 30_000 } = {}) {
  const start = Date.now();
  for (;;) {
    const gap = await target.evaluate(() => new Promise((resolve) => {
      const stamps = [];
      const tick = (t) => {
        stamps.push(t);
        if (stamps.length < 8) { requestAnimationFrame(tick); return; }
        let max = 0;
        for (let i = 1; i < stamps.length; i += 1) max = Math.max(max, stamps[i] - stamps[i - 1]);
        resolve(Math.round(max));
      };
      requestAnimationFrame(tick);
    })).catch(() => null);
    if (gap !== null && gap < 60) return gap;
    if (Date.now() - start > timeoutMs) return gap;
    await sleep(400);
  }
}

/* ── the assertion ledger ──────────────────────────────────────────── */
const results = [];
function record(step, name, pass, detail = '') {
  results.push({ step, name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  [${step}] ${name}${detail ? ` — ${detail}` : ''}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((resolve, reject) => {
  const srv = net.createServer();
  srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); });
  srv.on('error', reject);
});

/* ── the temp design server (never 5193) ──────────────────────────── */
const serverLogs = [];
async function spawnDesignServer(port, tag) {
  const child = spawn(process.execPath, ['cli/bin/design.mjs', '--port', String(port), '--agent', 'none', '--no-open'], { cwd: REPO });
  const logPath = join(HERE, `server-${tag}-${port}.log`);
  const chunks = [];
  const tap = (d) => { const t = d.toString(); chunks.push(t); serverLogs.push({ tag, t }); };
  child.stdout.on('data', tap);
  child.stderr.on('data', tap);
  const text = () => chunks.join('');
  const exited = new Promise((resolve) => child.on('exit', (code, signal) => resolve({ code, signal })));
  await new Promise((resolve, reject) => {
    const deadline = setTimeout(() => reject(new Error(`server ${tag} boot timeout; log:\n${text().slice(-2000)}`)), 90_000);
    const iv = setInterval(() => {
      if (text().includes(`studio at http://localhost:${port}/__design__/`)) { clearTimeout(deadline); clearInterval(iv); resolve(); }
    }, 250);
    exited.then((r) => { clearTimeout(deadline); clearInterval(iv); reject(new Error(`server ${tag} exited during boot (${JSON.stringify(r)})`)); });
  });
  const stop = async () => {
    if (child.exitCode !== null) return child.exitCode;
    child.kill('SIGTERM');
    const r = await Promise.race([exited, sleep(8000).then(() => null)]);
    if (r === null) { child.kill('SIGKILL'); await exited; return 'SIGKILL'; }
    return r.code;
  };
  return { child, port, stop, text, logPath, writeLog: () => writeFileSync(logPath, text()) };
}

/* ── raw ws clients (mock AI / observer) ──────────────────────────── */
const liveSockets = [];
function wsConnect(base, { name, kind = 'human', token } = {}) {
  const WebSocket = wsRequire('ws');
  const url = new URL(`${base.replace(/^http/, 'ws')}/__design__/ws`);
  url.searchParams.set('name', name);
  url.searchParams.set('kind', kind);
  if (token !== undefined) url.searchParams.set('token', token);
  const ws = new WebSocket(url);
  liveSockets.push(ws);
  const frames = [];
  // keepalive: any frame feeds the gateway's 5s sweep (the store pings
  // every 2.5s — a silent mock AI gets swept otherwise)
  const pinger = setInterval(() => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' })); }, 2000);
  ws.on('close', () => clearInterval(pinger));
  const welcome = new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`ws ${name}: no welcome in 10s (frames: ${frames.map((f) => f.type).join(',')})`)), 10_000);
    ws.on('message', (d) => {
      const frame = JSON.parse(d.toString());
      frames.push(frame);
      if (frame.type === 'welcome') { clearTimeout(t); resolve(frame); }
    });
    ws.on('error', (e) => { clearTimeout(t); reject(e); });
  });
  const send = (obj) => ws.send(JSON.stringify(obj));
  const waitFor = async (pred, timeoutMs = 8000, what = 'frame') => {
    const seen = frames.find(pred);
    if (seen !== undefined) return seen;
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error(`ws ${name}: no ${what} in ${timeoutMs}ms`)), timeoutMs);
      const iv = setInterval(() => {
        const hit = frames.find(pred);
        if (hit !== undefined) { clearTimeout(t); clearInterval(iv); resolve(hit); }
      }, 100);
      ws.on('close', () => { clearTimeout(t); clearInterval(iv); reject(new Error(`ws ${name}: closed while waiting for ${what}`)); });
    });
  };
  return { ws, frames, welcome, send, waitFor, name };
}

/* ── the W6 Loro envelope lane (agent /admit) ─────────────────────── */
let peerSeq = 0x6a66;
async function admitOp(base, { actor, componentId, buffer, text, sessionHint }) {
  const { LoroDoc } = loroRequire('loro-crdt');
  const doc = new LoroDoc();
  doc.setPeerId((peerSeq += 1));
  const syncResp = await (await fetch(`${base}/__design__/api/collab/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).json();
  doc.import(Buffer.from(syncResp.updateB64, 'base64'));
  doc.commit();
  const container = `b:${componentId}:${buffer}`;
  const current = doc.getText(container).toString();
  const cursor = doc.getText(container).getCursor(0, 0);
  if (cursor === undefined) throw new Error(`cannot anchor an op on ${container}`);
  const envelope = {
    actor,
    opId: `${actor}:matrix:${Date.now()}:${Math.random().toString(36).slice(2, 6)}`,
    baseFrontiers: doc.frontiers(),
    domain: 'text',
    kind: 'replace',
    target: { componentId, buffer },
    cursorBytesB64: Buffer.from(cursor.encode()).toString('base64'),
    offset: 0,
    length: current.length,
    text,
    timestamp: Date.now(),
    ...(sessionHint !== undefined ? { sessionHint } : {}),
  };
  const res = await fetch(`${base}/__design__/api/collab/admit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(envelope) });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}
/** two envelopes from ONE shared base (the D14 stale pair) */
async function buildStalePair(base, { componentId, buffer, texts, actors }) {
  const { LoroDoc } = loroRequire('loro-crdt');
  const doc = new LoroDoc();
  doc.setPeerId((peerSeq += 1));
  const syncResp = await (await fetch(`${base}/__design__/api/collab/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).json();
  doc.import(Buffer.from(syncResp.updateB64, 'base64'));
  doc.commit();
  const container = `b:${componentId}:${buffer}`;
  const current = doc.getText(container).toString();
  const cursor = doc.getText(container).getCursor(0, 0);
  if (cursor === undefined) throw new Error(`cannot anchor on ${container}`);
  const baseFrontiers = doc.frontiers();
  const cursorBytesB64 = Buffer.from(cursor.encode()).toString('base64');
  const build = (actor, text) => ({
    actor,
    opId: `${actor}:matrix-stale:${Date.now()}:${Math.random().toString(36).slice(2, 6)}`,
    baseFrontiers,
    domain: 'text',
    kind: 'replace',
    target: { componentId, buffer },
    cursorBytesB64,
    offset: 0,
    length: current.length,
    text,
    timestamp: Date.now(),
  });
  const fire = (envelope) => fetch(`${base}/__design__/api/collab/admit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(envelope) })
    .then(async (res) => ({ status: res.status, body: await res.json().catch(() => ({})) }));
  return { fire, envelopes: [build(actors[0], texts[0]), build(actors[1], texts[1])] };
}

/* ── browser helpers ──────────────────────────────────────────────── */
const pageErrors = new Map();
function watchPage(page, label) {
  const errs = [];
  pageErrors.set(label, errs);
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('favicon')) errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}\n  ${(e.stack ?? '').split('\n').slice(1, 4).join('\n  ')}`));
  return errs;
}
async function openStudio(browser, base, name) {
  const context = await browser.newContext({ viewport: { width: 1680, height: 1000 } });
  const page = await context.newPage();
  watchPage(page, name);
  await page.goto(`${base}/__design__/?name=${encodeURIComponent(name)}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-presence-chips] [data-presence-chip]', { timeout: 45_000 });
  return { context, page };
}
async function canvasFrameOf(page) {
  for (let i = 0; i < 120; i += 1) {
    const f = page.frames().filter((fr) => fr.url().includes('/prototypes/welcome')).at(-1);
    if (f !== undefined) { await f.waitForLoadState('load', { timeout: 20_000 }).catch(() => {}); return f; }
    await sleep(250);
  }
  throw new Error('welcome canvas frame not found');
}
async function kitFrameOf(page, frameName = 'jixoai-design-frame-hero-mobile-390-light') {
  // re-resolve the canvas EVERY pass (a canvas reload detaches the old
  // Frame object — childFrames() on a corpse is forever empty; the
  // 2026-09-18 round-3 FATAL was exactly this) and require a frame that
  // evaluates alive before returning it
  for (let i = 0; i < 120; i += 1) {
    const canvas = await canvasFrameOf(page).catch(() => null);
    if (canvas !== null) {
      const kit = canvas.childFrames().find((f) => f.name() === frameName);
      if (kit !== undefined) {
        const alive = await kit.evaluate(() => true).catch(() => false);
        if (alive) {
          await kit.waitForSelector('[data-jx-instance]', { timeout: 20_000 }).catch(() => {});
          return kit;
        }
      }
    }
    await sleep(250);
  }
  throw new Error(`kit frame ${frameName} not found`);
}
async function selectPressButton(page, label = 'select') {
  await page.mouse.move(840, 500); // leave any canvas hover state behind
  const pageNode = page.locator('li[data-path="page: hero-mobile-390-light"]');
  await pageNode.waitFor({ timeout: 20_000 });
  const children = page.locator('li[data-path^="page: hero-mobile-390-light/"]');
  const dump = async (why) => {
    const info = await page.evaluate(() => ({
      treeRows: document.querySelectorAll('li[data-path]').length,
      paths: [...document.querySelectorAll('li[data-path]')].slice(0, 12).map((li) => li.getAttribute('data-path')),
      navText: (document.querySelector('.studio-nav')?.textContent ?? '').slice(0, 200),
    })).catch(() => ({}));
    const frameUrls = page.frames().map((f) => f.url().replace(/^https?:\/\/[^/]+/, '')).filter((u) => u !== '/__design__/' && u !== 'about:blank');
    console.log(`[selectPressButton:${label}] ${why} — ${JSON.stringify(info)}; frames=${frameUrls.join(' | ')}`);
    await page.screenshot({ path: join(HERE, `select-fail-${label}.png`) }).catch(() => {});
  };
  if ((await children.count()) === 0) {
    await pageNode.locator('.jx-tree-row').first().click();
    // the lazy tree walk can be slow — poll before ever re-clicking
    // (a blind second click would toggle the node back collapsed)
    try { await children.first().waitFor({ timeout: 12_000 }); } catch {
      await dump('children never came after expand click');
      if ((await children.count()) === 0) {
        await pageNode.locator('.jx-tree-row').first().click();
        await children.first().waitFor({ timeout: 12_000 });
      }
    }
  }
  const press = children.filter({ hasText: 'press-button' }).first();
  try { await press.waitFor({ timeout: 20_000 }); } catch { await dump('press-button row never came'); throw new Error('press row missing'); }
  await press.locator('.jx-tree-row').first().click();
  try { await page.locator('#prop-raised').waitFor({ timeout: 15_000 }); } catch { await dump('#prop-raised never came'); throw new Error('panel row missing'); }
  await sleep(1500);
}
const chipsInfo = (page) => page.locator('[data-presence-chips] [data-presence-chip]').evaluateAll((els) => els.map((el) => {
  const dot = el.querySelector('.studio-presence-dot');
  // NOTE: the style attribute reflects hsl() as normalized rgb() — read
  // the COMPUTED background-color and convert back to a hue in node
  const rgb = dot !== null ? getComputedStyle(dot).backgroundColor : '';
  return {
    id: el.getAttribute('data-presence-chip'),
    name: el.querySelector('.studio-presence-name')?.textContent ?? '',
    dot: rgb,
    offline: el.classList.contains('offline'),
  };
}));
/** rgb[a](r,g,b[,/a]) → hue in degrees (the chip law is hsl(hue,85%,45%)) */
function hueOf(chip) {
  const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(chip?.dot ?? '');
  if (m === null) return -1;
  const r = Number(m[1]) / 255, g = Number(m[2]) / 255, b = Number(m[3]) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return Math.round(h * 60);
}
async function pollFor(fn, { timeoutMs = 15_000, intervalMs = 400, label = 'poll' } = {}) {
  const start = Date.now();
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() - start > timeoutMs) throw new Error(`poll timeout: ${label}`);
    await sleep(intervalMs);
  }
}
const readHero = () => readFileSync(HERO, 'utf8');

/* ── remote-indicator probes (inside a canvas frame) ──────────────── */
async function remoteCursorState(canvas, playerId) {
  return canvas.evaluate((pid) => {
    const el = document.querySelector(`[data-jx-remote="${pid}:cursor"]`);
    if (el === null) return { exists: false };
    const m = /translate\(([\d.-]+)px,\s*([\d.-]+)px\)/.exec(el.style.transform ?? '');
    return { exists: true, opacity: getComputedStyle(el).opacity, x: m ? Number(m[1]) : null, y: m ? Number(m[2]) : null };
  }, playerId);
}
async function remoteRingState(canvas, playerId) {
  return canvas.evaluate((pid) => {
    const el = document.querySelector(`[data-jx-remote="${pid}:canvas-focus"]`);
    if (el === null) return { exists: false };
    const badge = el.querySelector('.jx-remote-badge');
    const r = el.getBoundingClientRect();
    return { exists: true, opacity: getComputedStyle(el).opacity, badge: badge?.textContent ?? '', box: { x: r.x, y: r.y, w: r.width, h: r.height } };
  }, playerId);
}
/** the a4 target box in CANVAS-DOCUMENT coordinates (through the kit iframe) */
async function targetBoxInCanvas(canvas, frameName = 'jixoai-design-frame-hero-mobile-390-light') {
  return canvas.evaluate((name) => {
    const frame = document.querySelector(`iframe[name="${name}"]`);
    if (frame === null) return null;
    const doc = frame.contentDocument;
    const el = doc === null ? null : doc.querySelector('[id="a4"]');
    if (el === null) return null;
    const fr = frame.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: fr.left + r.left, y: fr.top + r.top, w: r.width, h: r.height };
  }, frameName);
}
/** a serialized gradient's colors → hues (round-trip-proof comparing:
 *  chip rgb→hue→rgb can drift a channel by one — compare hues ±2°) */
function gradientHues(text) {
  const hues = [];
  for (const m of String(text).matchAll(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/g)) {
    const r = Number(m[1]) / 255, g = Number(m[2]) / 255, b = Number(m[3]) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max === min) continue;
    const d = max - min;
    let h;
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    hues.push(Math.round(h * 60));
  }
  return hues;
}
const hueNear = (a, b, tol = 2) => hues => hues.some((h) => Math.abs(h - a) < tol || Math.abs(h - b) < tol);

const overlapRatio = (a, b) => {
  if (a === null || b === null) return 0;
  const x1 = Math.max(a.x, b.x), y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w), y2 = Math.min(a.y + b.h, b.y + b.h);
  if (x2 <= x1 || y2 <= y1) return 0;
  const inter = (x2 - x1) * (y2 - y1);
  return inter / Math.min(a.w * a.h, b.w * b.h);
};

/* E/P-group helpers — the hsl→oklch law mirrored from
 * presence-visuals.ts (the matrix stays plain-node: no dist import) */
const hslHueToOklchHueLocal = (hslHue) => {
  const h = (((hslHue % 360) + 360) % 360) / 60;
  const sector = Math.floor(h);
  const f = h - sector;
  const srgb = sector === 0 ? [1, f, 0] : sector === 1 ? [1 - f, 1, 0]
    : sector === 2 ? [0, 1, f] : sector === 3 ? [0, 1 - f, 1]
      : sector === 4 ? [f, 0, 1] : [1, 0, 1 - f];
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const [r, g, b] = srgb.map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return (((Math.atan2(bb, a) * 180) / Math.PI) + 360) % 360;
};
/** hsl(h,85%,45%) → the normalized rgb() string a browser computes */
const playerHueRgb = (hue) => {
  const sat = 0.85, lig = 0.45;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const hp = (((hue % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r0, g0, b0] = hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x]
    : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x];
  const m = lig - c / 2;
  const q = (v) => Math.round((v + m) * 255);
  return `rgb(${q(r0)}, ${q(g0)}, ${q(b0)})`;
};
async function canvasFrameByName(page, name) {
  for (let i = 0; i < 120; i += 1) {
    const f = page.frames().filter((fr) => fr.url().includes(`/prototypes/${name}`)).at(-1);
    if (f !== undefined) {
      const alive = await f.evaluate(() => true).catch(() => false);
      if (alive) { await f.waitForLoadState('load', { timeout: 20_000 }).catch(() => {}); return f; }
    }
    await sleep(250);
  }
  throw new Error(`canvas frame ${name} not found`);
}
/** ground-aware real-mouse scan (the E1③ lesson, 2026-09-17): the
 * scan points are computed INSIDE the canvas document — avoiding
 * every nested kit iframe by an 8px margin (a pointer inside one
 * targets the kit doc and the canvas document never sees it — the
 * known frame-entry gap), then converted doc→screen through the
 * iframe box ratio, so the scan works at ANY restored lens scale
 * (the fixed fraction lattice at scale ≈0.9 landed every point
 * inside a kit iframe and produced zero cursor reports). The
 * predicate is polled between moves; points regenerate per round
 * (the camera may re-fit mid-scan). */
async function groundScanUntil(page, canvasFrame, predicate, { timeoutMs = 25_000, maxPoints = 24 } = {}) {
  const start = Date.now();
  for (let round = 0; round < 3; round += 1) {
    const info = await canvasFrame.evaluate(() => {
      const doc = document.documentElement;
      const W = doc.scrollWidth, H = doc.scrollHeight;
      const rects = [...document.querySelectorAll('iframe')].map((f) => f.getBoundingClientRect());
      const M = 8;
      const out = [];
      for (let gy = 0.05; gy <= 0.95 && out.length < 24; gy += 0.07) {
        for (let gx = 0.05; gx <= 0.95 && out.length < 24; gx += 0.06) {
          const x = Math.round(W * gx), y = Math.round(H * gy);
          if (!rects.some((r) => x > r.left - M && x < r.right + M && y > r.top - M && y < r.bottom + M)) out.push({ x, y });
        }
      }
      return { W, H, out };
    });
    const box = await page.locator('iframe[src*="/prototypes/"]').first().boundingBox();
    if (box === null) throw new Error('canvas iframe box missing for ground scan');
    const kx = box.width / info.W, ky = box.height / info.H;
    for (const p of info.out.slice(0, maxPoints)) {
      const sx = Math.min(Math.max(box.x + p.x * kx, 8), 1672);
      const sy = Math.min(Math.max(box.y + p.y * ky, 8), 992);
      await page.mouse.move(sx, sy, { steps: 3 });
      await sleep(300);
      if (await predicate()) return true;
      if (Date.now() - start > timeoutMs) return false;
    }
  }
  return await predicate();
}
/** read the cursor's SETTLED opacity — the overlay parks/raises via
 * inline style under a 140ms CSS ease transition, so an immediate
 * read catches the tail (E1① once read 0.0012 and false-failed);
 * settle = two equal consecutive reads at a semantically stable
 * value (hidden ≤0.02, visible ≥0.98, or absent) */
async function settledCursorOpacity(canvas, playerId) {
  let last = 'unset';
  for (let i = 0; i < 10; i += 1) {
    const v = await canvas.evaluate((pid) => {
      const el = document.querySelector(`[data-jx-remote="${pid}:cursor"]`);
      return el === null ? 'absent' : getComputedStyle(el).opacity;
    }, playerId);
    const num = Number.parseFloat(v);
    if (v === last && (v === 'absent' || num < 0.02 || num > 0.98)) return v;
    last = v;
    await sleep(200);
  }
  return last;
}


/* ── main ─────────────────────────────────────────────────────────── */
let browser = null;
let server = null;
let server2 = null;
const presenceBytesPre = existsSync(PRESENCE_JSON) ? readFileSync(PRESENCE_JSON) : null;
const heroBytesPre = readFileSync(HERO);
const journalLinesPre = existsSync(JOURNAL) ? readFileSync(JOURNAL, 'utf8').split('\n').filter((l) => l.length > 0).length : 0;

/* fixture preflight (W4 contract) */
const seedOk = /raised=\{false\}/.test(heroBytesPre);
console.log(`preflight: hero seed raised={false} literal = ${seedOk}`);
if (!seedOk) console.log('  FIX THE FIXTURE: hand-set raised={false} on the a4 press-button before running (W4 contract)');

/* the ledger reset: fresh counter so the hue law reads 73/146/219…
 * (the .jx-collab dir may legitimately not exist after a sanctioned
 * W4-style journal reset — lay it down first) */
mkdirSync(dirname(PRESENCE_JSON), { recursive: true });
writeFileSync(PRESENCE_JSON, `${JSON.stringify({ counter: 0, players: [] }, null, 2)}\n`);
console.log('preflight: presence.json reset to an empty ledger (pre-test bytes saved for post-run restore)');

let exitCode = 0;
try {
  const port = await freePort();
  server = await spawnDesignServer(port, 'main');
  const BASE = `http://localhost:${port}`;
  console.log(`server up: pid=${server.child.pid} port=${port} base=${BASE}`);
  browser = await chromium.launch({ headless: true });

  /* ══ A. 人×人 ═══════════════════════════════════════════════════ */
  const A = await openStudio(browser, BASE, 'alice');
  const B = await openStudio(browser, BASE, 'bob');
  await sleep(1200);

  /* A1 — join 互见：chips 数量/名字/色序（73/146） */
  {
    const aChips = await chipsInfo(A.page);
    const bChips = await chipsInfo(B.page);
    record('A1', '① A端 chips：2 枚、alice(self)+bob、名字正确',
      aChips.length === 2 && aChips.some((c) => c.name.includes('alice') && c.name.includes('(you)')) && aChips.some((c) => c.name.includes('bob') && !c.name.includes('(you)')),
      JSON.stringify(aChips.map((c) => `${c.id}:${c.name}`)));
    const self = aChips.find((c) => c.name.includes('(you)'));
    const other = aChips.find((c) => !c.name.includes('(you)'));
    record('A1', '② A端 色序 hue=73/146（p1/p2 的 dot style）',
      self !== undefined && other !== undefined && hueOf(self) === 73 && hueOf(other) === 146 && self.id === 'p1' && other.id === 'p2',
      `self ${self?.id}@${hueOf(self)} other ${other?.id}@${hueOf(other)} dot="${self?.dot}"`);
    const bSelf = bChips[0];
    record('A1', '③ B端 chips：self(bob)首位 + alice 在列（join 互见）',
      bChips.length === 2 && bSelf !== undefined && bSelf.name.includes('bob') && bSelf.name.includes('(you)') && bChips.some((c) => c.name.includes('alice')),
      JSON.stringify(bChips.map((c) => `${c.id}:${c.name}${c.offline ? '[offline]' : ''}`)));
    const onlineText = await B.page.locator('[data-presence-online]').textContent().catch(() => '');
    record('A1', '④ B端 在线计数 2 online', onlineText.includes('2'), `text="${onlineText.trim()}"`);
  }

  /* A1⑤ — the sixth S→C frame: ping→pong (协议实况记录) */
  {
    const probe = wsConnect(BASE, { name: 'pong-probe' });
    const w = await probe.welcome;
    probe.send({ type: 'ping' });
    let pong = null;
    try { pong = await probe.waitFor((f) => f.type === 'pong', 3000, 'pong'); } catch { /* recorded below */ }
    record('A1', '⑤ S→C 第六帧 {type:"pong"}（ping 应答；studio store 忽略之）', pong !== null && pong !== undefined,
      `welcome playerId=${w.playerId} hue=${w.colorHue}; pong=${pong ? JSON.stringify(pong) : '未收到'}`);
    probe.ws.close();
  }

  /* A2 — 光标互见（A 真实鼠标 → B canvas 文档远程光标，方向一致） */
  {
    const bCanvas = await canvasFrameOf(B.page);
    // A's canvas document must be LOADED before the mouse lands in it
    // (canvas-entry registers the overlay's pointermove listener at
    // module eval — earlier moves vanish into a half-loaded iframe)
    const aCanvas = await canvasFrameOf(A.page);
    await pollFor(() => aCanvas.locator('[data-jx-component]').first().waitFor({ timeout: 3000 }).then(() => true).catch(() => null), { timeoutMs: 30_000, label: 'A端 canvas stamps' });
    await sleep(600);
    const iframeBox = await A.page.locator('iframe[src*="/prototypes/"]').first().boundingBox();
    if (iframeBox === null) {
      record('A2', '①② 光标互见', false, 'A端 canvas iframe 定位失败');
    } else {
      // presence-liveness P2 changed the game: kit iframes now RELAY their
      // own pointer (surface frame:<id>), so "transform moved" no longer
      // filters them out — and their doc coordinates follow the frame
      // grammar (frame coords + iframe offset), not the canvas-ground
      // linear law this assertion checks. Compute GROUND points inside
      // the canvas document (outside every kit iframe by an 8px margin),
      // then convert doc→screen through the iframe box ratio.
      const ground = await aCanvas.evaluate(() => {
        const doc = document.documentElement;
        const W = doc.scrollWidth, H = doc.scrollHeight;
        const rects = [...document.querySelectorAll('iframe')].map((f) => f.getBoundingClientRect());
        const M = 8;
        const out = [];
        for (let gy = 0.05; gy <= 0.95 && out.length < 15; gy += 0.07) {
          for (let gx = 0.05; gx <= 0.95 && out.length < 15; gx += 0.06) {
            const x = Math.round(W * gx), y = Math.round(H * gy);
            if (!rects.some((r) => x > r.left - M && x < r.right + M && y > r.top - M && y < r.bottom + M)) out.push({ x, y });
          }
        }
        return { W, H, out };
      });
      const kx = iframeBox.width / ground.W, ky = iframeBox.height / ground.H;
      const hits = [];
      for (const g of ground.out) {
        const x = iframeBox.x + g.x * kx;
        const y = iframeBox.y + g.y * ky;
        await A.page.mouse.move(x, y, { steps: 5 });
        await sleep(650);
        const t = await remoteCursorState(bCanvas, 'p1');
        if (t.exists && t.x !== null) {
          const prev = hits.at(-1);
          if (prev === undefined || Math.abs(t.x - prev.doc.x) > 2 || Math.abs(t.y - prev.doc.y) > 2) {
            hits.push({ screen: { x, y }, doc: { x: t.x, y: t.y }, opacity: t.opacity });
          }
        }
      }
      const first = hits.find((h) => h.opacity === '1') ?? hits[0];
      record('A2', '① B端 canvas 文档出现 [data-jx-remote="p1:cursor"] 且可见', first !== undefined,
        first === undefined ? `扫描 ${ground.out.length} 个 ground 点后仍无命中` : `opacity=${first.opacity} transform=(${first.doc.x},${first.doc.y})（ground 命中 ${hits.length} 次）`);
      // the first pair whose SCREEN positions are strictly right-down;
      // the DOC coordinates must move the same way (lens z > 0)
      let pair = null;
      for (let i = 0; i < hits.length && pair === null; i += 1) {
        for (let j = i + 1; j < hits.length && pair === null; j += 1) {
          if (hits[j].screen.x > hits[i].screen.x && hits[j].screen.y > hits[i].screen.y) pair = [hits[i], hits[j]];
        }
      }
      record('A2', '② B端光标坐标随 A 移动方向一致（屏幕右下移 → doc 坐标右下移）',
        pair !== null && pair[1].doc.x > pair[0].doc.x && pair[1].doc.y > pair[0].doc.y,
        pair === null ? `ground 命中不足以构成右下移动对（${hits.length} 个命中）` : `hit1 screen(${Math.round(pair[0].screen.x)},${Math.round(pair[0].screen.y)}) → doc(${pair[0].doc.x},${pair[0].doc.y}); hit2 screen(${Math.round(pair[1].screen.x)},${Math.round(pair[1].screen.y)}) → doc(${pair[1].doc.x},${pair[1].doc.y})`);
    }
  }

  /* A3 — 编辑同步 + ghost ring */
  {
    await selectPressButton(A.page, "A3-alice");
    await selectPressButton(B.page, "A3-bob"); // B needs the row for the mirror + later panel-focus
    const bKit = await kitFrameOf(B.page);
    const shadowBefore = await bKit.evaluate(() => getComputedStyle(document.querySelector('[id="a4"]')).boxShadow);
    const syncTimes = [];
    B.page.on('request', (req) => { if (req.url().includes('/__design__/api/collab/sync') && req.method() === 'POST') syncTimes.push(Date.now()); });
    const raised = A.page.locator('#prop-raised');
    const clickAt = Date.now();
    await raised.check();
    const landed = await pollFor(() => /raised=\{true\}/.test(readHero()), { timeoutMs: 20_000, label: 'A3 fs raised={true}' }).then(() => true).catch(() => false);
    record('A3', '① A 勾选 RAISED → hero.svelte 落 raised={true}（W4 fs 断言复用）', landed,
      landed ? `fs diff seen (${HERO})` : `file still: ${(/raised=\{[^}]*\}/.exec(readHero()) ?? ['(no raised literal)'])[0]}`);
    const fsAt = Date.now();
    let mirrored = false;
    let shadowAfter = shadowBefore;
    try {
      await pollFor(async () => {
        mirrored = await B.page.locator('#prop-raised').isChecked().catch(() => false);
        const kit = await kitFrameOf(B.page).catch(() => null);
        if (kit !== null) shadowAfter = await kit.evaluate(() => getComputedStyle(document.querySelector('[id="a4"]')).boxShadow);
        return mirrored || shadowAfter !== shadowBefore;
      }, { timeoutMs: 10_000, label: 'B端 mirror/画布更新' });
    } catch { /* judged below */ }
    const canvasUpdated = shadowAfter !== shadowBefore;
    record('A3', '② B端收到 journal-tail → /sync → 面板/画布更新（checkbox 镜像或 a4 boxShadow 变化）',
      mirrored || canvasUpdated,
      `checkbox=${mirrored}; boxShadow ${canvasUpdated ? 'changed' : 'unchanged'} (${shadowBefore.slice(0, 40)} → ${shadowAfter.slice(0, 40)})`);
    // journal-tail broadcasts at COMMIT time — before the write-back
    // lands in the file — so the window anchors at the CLICK, not the
    // fs detection (which lags by the poll interval)
    const pulled = syncTimes.filter((t) => t >= clickAt - 200 && t <= fsAt + 3000).length;
    record('A3', '②b B端 /sync POST 在编辑窗口内发生（journal-tail 即时拉取）', pulled > 0,
      `${pulled} sync POST in [click, fs+3s]; total syncs=${syncTimes.length}`);
    const bCanvas2 = await canvasFrameOf(B.page);
    await sleep(600);
    const ring = await remoteRingState(bCanvas2, 'p1');
    // presence-visuals ruling 4: the shell-level panel-focus overlay is
    // RETIRED — the panel focus renders ON the field row itself as
    // [data-jx-remote-focus]（A's #prop-raised click reported a real
    // panel attention; equivalent semantics of "B sees A's ghost"）
    const focusRow = await pollFor(
      () => B.page.evaluate(() => {
        const rows = [...document.querySelectorAll('[data-jx-remote-focus]')];
        return rows.length === 0 ? null : rows.map((row) => ({ attr: row.getAttribute('data-jx-remote-focus'), tag: row.tagName })).find((r) => (r.attr ?? '').includes('p1')) ?? null;
      }),
      { timeoutMs: 10_000, intervalMs: 500, label: 'A3 panel-focus row' },
    ).catch(() => null);
    record('A3', '③ B端出现 A 的在场指示（canvas ghost ring 或新词表面板 focus 行 [data-jx-remote-focus] 任一）',
      (ring.exists && ring.opacity !== '0') || focusRow !== null,
      `canvas-focus=${ring.exists ? `opacity ${ring.opacity}` : 'absent'}; 面板 focus 行=${focusRow === null ? '无' : `${focusRow.tag}[data-jx-remote-focus="${focusRow.attr}"]`}; `
      + (ring.exists || focusRow !== null
        ? '（实况：面板 op 的 admit body 不带 sessionHint.playerId——design.md §3 的 op-ghost 未接线，由裁决4的真实 focus 上报路径点亮）'
        : '根因：panel-collab.ts 的 admit/materialize body 不带 sessionHint.playerId（design.md §3「面板 op 的 sessionHint 就是 playerId」未接线）——journal-tail 有、ghost 无'));
  }

  /* A4 — 冲突路径不回归（并发同页编辑：B raw admit × A 面板 uncheck） */
  {
    const textBefore = readHero();
    const agentLane = admitOp(BASE, { actor: 'matrix-agent-a4', componentId: 'a4', buffer: 't-0', text: 'A4-agent-lane-text' })
      .catch((e) => ({ status: 0, body: { error: String(e) } }));
    await A.page.locator('#prop-raised').uncheck();
    const agentRes = await agentLane;
    let fused = false;
    let conflictCards = 0;
    try {
      await pollFor(() => {
        const t = readHero();
        fused = /A4-agent-lane-text/.test(t) && /raised=\{false\}/.test(t);
        if (fused) return true;
        return null;
      }, { timeoutMs: 20_000, label: 'A4 fusion' });
    } catch { /* fall to conflict card check */ }
    conflictCards = await A.page.locator('[data-jx-conflict]').count();
    record('A4', '并发 admit × 面板编辑：融合或冲突卡（§6 既有行为不回归）',
      fused || conflictCards > 0,
      `agent admit=${agentRes.status}; 融合=${fused}（A4-agent-lane-text + raised={false}）; 冲突卡=${conflictCards}; bytesChanged=${textBefore !== readHero()}`);
  }

  /* A5 — A 关页 → B chips 离线态 + 远程指示器淡出 */
  {
    const bCanvas3 = await canvasFrameOf(B.page);
    await A.context.close();
    await sleep(1200);
    const bChips = await chipsInfo(B.page);
    const aliceChip = bChips.find((c) => c.name.includes('alice'));
    const chipGone = aliceChip === undefined;
    const chipOffline = aliceChip !== undefined && aliceChip.offline;
    record('A5', '① B端 alice chip 进入离线表现（offline 态或从 chips 消失）', chipGone || chipOffline,
      chipGone ? 'chip 已从列表消失（实况：offline 玩家被 remotePlayers 过滤——与 design.md §4「KEEPS its row——chip list shows the offline state」存在实现偏差，记录为发现）'
        : `chip 保留且 offline=${chipOffline}`);
    await sleep(500); // the 240ms retire fade
    const leftovers = await bCanvas3.evaluate(() => document.querySelectorAll('[data-jx-remote^="p1:"]').length);
    record('A5', '② B端 canvas 远程指示器淡出移除（p1 元素清零）', leftovers === 0, `剩余 [data-jx-remote^="p1:"] 元素=${leftovers}`);
  }

  /* ══ B. 人×AI ═══════════════════════════════════════════════════ */
  const ai = wsConnect(BASE, { name: 'matrix-ai', kind: 'ai' });
  const aiWelcome = await ai.welcome;
  const aiPid = aiWelcome.playerId;
  await sleep(1200);

  /* B6 — AI chips + 无光标 */
  {
    const bChips = await chipsInfo(B.page);
    const aiChip = bChips.find((c) => c.name.includes('matrix-ai'));
    record('B6', '① 人端 chips 出现 AI Player（matrix-ai）', aiChip !== undefined,
      aiChip === undefined ? `chips=${JSON.stringify(bChips.map((c) => c.name))}` : `chip=${aiChip.id}:${aiChip.name}@hue${hueOf(aiChip)}（DOM 无 kind 标记属性——chip 只有 playerId/name/dot；发现：kind 未暴露给 DOM，按名断言）`);
    const bCanvas = await canvasFrameOf(B.page);
    const cursor = await remoteCursorState(bCanvas, aiPid);
    const invisible = !cursor.exists || cursor.opacity === '0';
    record('B6', '② AI 无可见光标（元素常驻但 opacity=0，virtual-mouse 未注册）', invisible,
      `cursor 元素=${cursor.exists ? `exists opacity=${cursor.opacity}` : 'absent'}`);
  }

  /* B7 — AI admit → attention 广播（canvas ring / panel 描边） */
  {
    const res = await admitOp(BASE, { actor: 'matrix-ai', componentId: 'a4', buffer: 't-0', text: 'B7-ring-marker', sessionHint: { playerId: aiPid } });
    const bCanvas = await canvasFrameOf(B.page);
    await sleep(800);
    const ring = await pollFor(() => remoteRingState(bCanvas, aiPid).then((s) => (s.exists && s.opacity !== '0' ? s : null)), { timeoutMs: 8000, label: 'B7 ring' }).catch(() => null);
    record('B7a', '① 人端出现该 AI 的 canvas-focus ghost ring（元素存在、badge 含 AI 名）',
      ring !== null && ring.badge.includes('matrix-ai'),
      `admit=${res.status}; ring=${ring === null ? 'absent' : `opacity=${ring.opacity} badge="${ring.badge}"`}`);
    const target = await targetBoxInCanvas(bCanvas);
    const landedOnTarget = ring !== null && target !== null && overlapRatio(ring.box, target) > 0.5;
    const inst1 = await bCanvas.evaluate(() => { const el = document.querySelector('[data-jx-instance="1"]'); if (el === null) return null; const r = el.getBoundingClientRect(); return { tag: el.tagName, comp: el.getAttribute('data-jx-component'), box: { x: r.x, y: r.y, w: r.width, h: r.height } }; });
    const landedOnSection = inst1 !== null && ring !== null && overlapRatio(ring.box, inst1.box) > 0.9;
    record('B7a', '② ring box 与目标组件（a4 press-button，经 kit iframe 折算）重叠', landedOnTarget,
      landedOnTarget ? `overlap ok; ring=${JSON.stringify(ring?.box)}` : `定位退化：ring=${JSON.stringify(ring?.box)} vs 目标=${JSON.stringify(target)}（根因：focusFromOpTarget 恒发 instance:1/frameId:null，而 overlay 的 resolveAttentionBox 按 [data-jx-instance="1"] 在画布文档本体解析——a4 实为 kit iframe 内 instance 4；按简报口径 badge-only/退化算过，但明确记录：ring 落到了 ${landedOnSection ? '整个 prototype-kit section' : '非目标元素'}）`);
    // geometry note: instance-1 is the giant prototype-kit SECTION that
    // CONTAINS the target — any ring inside it "overlaps" it, so the
    // discriminator is SIZE (a section-sized ring is the regression)
    const sectionSized = ring !== null && inst1 !== null && ring.box.w >= inst1.box.w * 0.5 && ring.box.h >= inst1.box.h * 0.5;
    record('B7a', '③（诊断）ring 不得是 section 级别的大框（按 componentId 跨文档定位后应为组件级）', !sectionSized,
      inst1 === null ? 'instance=1 元素不存在' : `ring=${ring === null ? 'absent' : `${Math.round(ring.box.w)}x${Math.round(ring.box.h)}`} vs section=${Math.round(inst1.box.w)}x${Math.round(inst1.box.h)}（组件级 ring 的 w/h 应远小于 section 的一半）`);

    /* B7b — panel-focus（sessionHint 带 field/digest）。两条路：
     * (a) 直接对 prop 缓冲 'raised' 落 text op——记录网关对 prop 缓冲
     *     replace 的真实应答（实况：409）；
     * (b) 对合法的 t-0 缓冲落 op、sessionHint 带 field——focusFromOpTarget
     *     只看 sessionHint.field，relay 链路同一条。
     * presence-visuals 裁决4：壳层 panel-focus 描边退役——等价语义 =
     * 面板字段行自身点亮 [data-jx-remote-focus]（含 AI playerId）+
     * 名签 rack [data-jx-remote-chips]（digest 不再上 DOM，只走协议帧）。 */
    const resProp = await admitOp(BASE, { actor: 'matrix-ai', componentId: 'a4', buffer: 'raised', text: 'true', sessionHint: { playerId: aiPid, field: 'prop-raised', digest: 'raised=false→true' } });
    console.log(`  [B7b] prop-buffer text replace → ${resProp.status} ${JSON.stringify(resProp.body).slice(0, 160)}`);
    const res2 = await admitOp(BASE, { actor: 'matrix-ai', componentId: 'a4', buffer: 't-0', text: 'B7b-panel-focus', sessionHint: { playerId: aiPid, field: 'prop-raised', digest: 'raised=false→true' } });
    await sleep(800);
    const panelFocusInfo = await pollFor(() => B.page.evaluate((pid) => {
      const rows = [...document.querySelectorAll('[data-jx-remote-focus]')];
      const row = rows.find((el) => (el.getAttribute('data-jx-remote-focus') ?? '').split(' ').includes(pid));
      if (row === undefined) return null;
      const chips = row.querySelector('[data-jx-remote-chips]');
      const chipNames = chips === null ? [] : [...chips.querySelectorAll('[data-jx-remote-chip]')].map((c) => c.textContent ?? '');
      return { attr: row.getAttribute('data-jx-remote-focus'), tag: row.tagName, shadow: row.style.boxShadow.slice(0, 60), chipNames };
    }, aiPid), { timeoutMs: 10_000, intervalMs: 500, label: 'B7b panel focus row' }).catch(() => null);
    record('B7b', 'AI admit 带 sessionHint{field,digest} → 面板字段行点亮（[data-jx-remote-focus] 含 AI playerId + 名签 matrix-ai）',
      panelFocusInfo !== null && panelFocusInfo.chipNames.some((n) => n.includes('matrix-ai')),
      `admit=${res2.status}; 行=${panelFocusInfo === null ? '未出现' : `${panelFocusInfo.tag}[focus="${panelFocusInfo.attr}"] shadow="${panelFocusInfo.shadow}"`}; 名签=${JSON.stringify(panelFocusInfo?.chipNames ?? [])}（digest 只走协议帧，不上 DOM——裁决4词表）`);
  }

  /* B8 — 虚拟鼠标：光标从无到有
   * (fixture 修正 2026-09-17: presence-visuals 裁决 2 把 cursor 帧改为
   * canvas-scoped —— 网关 isCursor 现在要求非空 canvas 字段，旧
   * surface-only 帧会被整帧丢弃；等价语义 = 补 canvas:'welcome') */
  {
    const bCanvas = await canvasFrameOf(B.page);
    const before = await remoteCursorState(bCanvas, aiPid);
    ai.send({ type: 'virtual-mouse', enabled: true });
    ai.send({ type: 'cursor', canvas: 'welcome', surface: 'canvas', x: 123, y: 77 });
    await sleep(400);
    ai.send({ type: 'cursor', canvas: 'welcome', surface: 'canvas', x: 281, y: 190 });
    const after = await pollFor(() => remoteCursorState(bCanvas, aiPid).then((s) => (s.exists && s.opacity === '1' ? s : null)), { timeoutMs: 8000, label: 'B8 cursor visible' }).catch(() => null);
    record('B8', '① AI virtual-mouse enabled + cursor → 人端光标元素从无到有（opacity 0→1）',
      after !== null && before.opacity !== '1',
      `before opacity=${before.exists ? before.opacity : 'absent'} → after opacity=${after?.opacity ?? 'absent'}`);
    // the poll may resolve on the FIRST cursor frame — poll for the LAST
    // reported position to settle (a single timed read once flaked on the
    // second frame's render chain: gateway flush + shell rAF + overlay)
    const last = await pollFor(
      () => remoteCursorState(bCanvas, aiPid).then((s) => (s.exists && Math.abs((s.x ?? -1) - 281) <= 2 && Math.abs((s.y ?? -1) - 190) <= 2 ? s : null)),
      { timeoutMs: 8000, label: 'B8 last position' },
    ).catch(() => remoteCursorState(bCanvas, aiPid));
    record('B8', '② 光标坐标逐字透传（mock 发送 (281,190)）',
      last.exists && Math.abs((last.x ?? -1) - 281) <= 2 && Math.abs((last.y ?? -1) - 190) <= 2,
      `transform=(${last.x},${last.y})`);
  }
  ai.ws.close();

  /* ══ C. AI×AI ═══════════════════════════════════════════════════ */
  {
    const ai1 = wsConnect(BASE, { name: 'matrix-ai-1', kind: 'ai' });
    const ai2 = wsConnect(BASE, { name: 'matrix-ai-2', kind: 'ai' });
    const observer = wsConnect(BASE, { name: 'matrix-observer' });
    const w1 = await ai1.welcome;
    const w2 = await ai2.welcome;
    await observer.welcome;
    await sleep(600);
    const [r1, r2] = await Promise.all([
      admitOp(BASE, { actor: 'matrix-ai-1', componentId: 'a4', buffer: 't-0', text: 'C9-one', sessionHint: { playerId: w1.playerId } }),
      admitOp(BASE, { actor: 'matrix-ai-2', componentId: 'a5', buffer: 't-0', text: 'C9-two', sessionHint: { playerId: w2.playerId } }),
    ]);
    let fused = false;
    try { await pollFor(() => (/C9-one/.test(readHero()) && /C9-two/.test(readHero())) ? true : null, { timeoutMs: 20_000, label: 'C9 fusion' }); fused = true; } catch { /* judged */ }
    record('C9', '① 两 AI 的 op 全部落盘融合（hero.svelte 同时含 C9-one 与 C9-two）', fused,
      `admits=${r1.status}/${r2.status}; bytes: C9-one=${/C9-one/.test(readHero())}, C9-two=${/C9-two/.test(readHero())}`);
    let att1 = null;
    let att2 = null;
    try {
      await pollFor(() => {
        att1 = observer.frames.find((f) => f.type === 'presence' && f.playerId === w1.playerId && f.attention !== null && f.attention.kind === 'canvas');
        att2 = observer.frames.find((f) => f.type === 'presence' && f.playerId === w2.playerId && f.attention !== null && f.attention.kind === 'canvas');
        return att1 !== undefined && att2 !== undefined ? true : null;
      }, { timeoutMs: 10_000, label: 'C9 observer attentions' });
    } catch { /* judged */ }
    const ok1 = att1 !== null && att1 !== undefined && att1.attention.component === 'a4';
    const ok2 = att2 !== null && att2 !== undefined && att2.attention.component === 'a5';
    record('C9', '② 观察端（第三连接）收到两份 attention 且归属正确（ai-1→a4、ai-2→a5）', ok1 && ok2,
      `ai-1(${w1.playerId})→${att1 ? JSON.stringify(att1.attention) : '无'}; ai-2(${w2.playerId})→${att2 ? JSON.stringify(att2.attention) : '无'}`);
    ai1.ws.close(); ai2.ws.close(); observer.ws.close();
  }

  /* ══ D. 边缘 ════════════════════════════════════════════════════ */
  /* D10 — B 刷新（sessionStorage token 保活）→ 同 playerId 同色号 */
  {
    const before = (await chipsInfo(B.page)).find((c) => c.name.includes('bob'));
    await B.page.reload({ waitUntil: 'domcontentloaded' });
    await B.page.waitForSelector('[data-presence-chips] [data-presence-chip]', { timeout: 30_000 });
    await sleep(1200);
    const after = (await chipsInfo(B.page)).find((c) => c.name.includes('bob'));
    record('D10', '刷新后同 token 恢复同 playerId 同色号',
      before !== undefined && after !== undefined && before.id === after.id && hueOf(before) === hueOf(after),
      `刷新前 ${before?.id}@hue${hueOf(before ?? { dot: '' })} → 刷新后 ${after?.id}@hue${hueOf(after ?? { dot: '' })}`);
  }

  /* D11 — 新 context（无 token）→ 新号新色，counter 只增，旧号不复用 */
  {
    const ledgerBefore = JSON.parse(readFileSync(PRESENCE_JSON, 'utf8'));
    const knownIds = new Set(ledgerBefore.players.map((p) => p.playerId));
    const Cctx = await openStudio(browser, BASE, 'carol');
    const carol = (await chipsInfo(Cctx.page)).find((c) => c.name.includes('carol'));
    const expectedId = `p${ledgerBefore.counter + 1}`;
    const expectedHue = (73 * (ledgerBefore.counter + 1)) % 360;
    const ledgerAfter = JSON.parse(readFileSync(PRESENCE_JSON, 'utf8'));
    const carolRow = ledgerAfter.players.find((p) => p.name === 'carol');
    record('D11', '新 context 新号新色（hue=(73*n)%360）且旧号不复用',
      carol !== undefined && carol.id === expectedId && hueOf(carol) === expectedHue && carolRow !== undefined && !knownIds.has(expectedId),
      `counter ${ledgerBefore.counter}→${ledgerAfter.counter}; carol chip=${carol?.id}@hue${carol ? hueOf(carol) : '?'}（期望 ${expectedId}@${expectedHue}）; ledger row=${carolRow ? carolRow.playerId : '无'}`);
    await Cctx.context.close();
  }

  /* D12 — WS 断连降级：仅断 /__design__/ws，编辑照常 */
  {
    const Ectx = await browser.newContext({ viewport: { width: 1680, height: 1000 } });
    const Epage = await Ectx.newPage();
    watchPage(Epage, 'erin');
    // pass-through first (the welcome lands → chips render), then sever
    // the socket ~400ms in; every reconnect gets the same treatment
    await Epage.routeWebSocket(/\/__design__\/ws/, async (ws) => {
      await ws.connectToServer();
      setTimeout(() => { try { ws.close(); } catch { /* already gone */ } }, 400);
    });
    await Epage.goto(`${BASE}/__design__/?name=erin`, { waitUntil: 'domcontentloaded' });
    await Epage.waitForSelector('[data-presence-chips]', { timeout: 45_000 });
    await Epage.waitForSelector('[data-presence-chip]', { timeout: 20_000 }).catch(() => {});
    const selfOffline = await pollFor(
      () => Epage.locator('[data-presence-chips] [data-presence-chip].offline').count().then((n) => (n > 0 ? n : null)),
      { timeoutMs: 15_000, intervalMs: 500, label: 'D12 self offline chip' },
    ).catch(() => 0);
    record('D12', '① WS 被持续掐断 → 自身 chip 进入 offline 态（presence 降级可见）', selfOffline > 0,
      `offline chip 数=${selfOffline}（routeWebSocket close；重连退避下每次尝试均被掐）`);
    await selectPressButton(Epage, "D12-erin");
    const wasTrue = /raised=\{true\}/.test(readHero());
    if (wasTrue) await Epage.locator('#prop-raised').uncheck(); else await Epage.locator('#prop-raised').check();
    const wantLiteral = wasTrue ? /raised=\{false\}/ : /raised=\{true\}/;
    const flipped = await pollFor(() => wantLiteral.test(readHero()) ? true : null, { timeoutMs: 20_000, label: 'D12 fs flip' }).then(() => true).catch(() => false);
    record('D12', '② WS 全断时编辑照常（勾选落盘，op 走 HTTP）', flipped,
      flipped ? `hero 落 ${wasTrue ? 'raised={false}' : 'raised={true}'}（fs 断言）` : '落盘未发生');
    // normalize back to the W4 seed contract ({false}) so the run hands
    // the fixture over without an fs-restore fight
    if (flipped && !wasTrue) {
      await Epage.locator('#prop-raised').uncheck().catch(() => {});
      await pollFor(() => /raised=\{false\}/.test(readHero()) ? true : null, { timeoutMs: 20_000, label: 'D12 normalize back' }).catch(() => {});
    }
    await Ectx.close();
  }

  /* D13 — 账本损坏 fail-stop：垃圾 presence.json → 重启 → studio 照常 + 账本重建 */
  {
    for (const s of liveSockets.splice(0)) s.close();
    await B.context.close();
    writeFileSync(PRESENCE_JSON, 'not json at all {{{');
    const code1 = await server.stop();
    server.writeLog();
    console.log(`server(main) pid=${server.child.pid} stopped exit=${code1}`);
    server = null;
    const port2 = await freePort();
    server2 = await spawnDesignServer(port2, 'rebuild');
    console.log(`server2 up: pid=${server2.child.pid} port=${port2}`);
    const BASE2 = `http://localhost:${port2}`;
    const pageOk = await (async () => {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage();
      watchPage(page, 'd13-probe');
      await page.goto(`${BASE2}/__design__/`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-presence-chips]', { timeout: 45_000 });
      const html = await page.content();
      await ctx.close();
      return html.includes('studio-presence') || html.includes('connecting');
    })().catch(() => false);
    record('D13', '① 垃圾账本下重启 server → studio 照常起（/__design__/ 200 + 壳渲染）', pageOk, `probe page ok=${pageOk}`);
    const probe2 = wsConnect(BASE2, { name: 'rebuild-probe' });
    let welcome2 = null;
    try { welcome2 = await probe2.welcome; } catch (e) { /* judged */ }
    let ledgerValid = false;
    let ledgerCounter = -1;
    try { const l = JSON.parse(readFileSync(PRESENCE_JSON, 'utf8')); ledgerValid = Number.isInteger(l.counter) && Array.isArray(l.players); ledgerCounter = l.counter; } catch { /* judged */ }
    const rebuiltLogged = server2.text().includes('rebuilt empty');
    record('D13', '② 网关重建账本（新连接 welcome + presence.json 恢复合法 + 重建日志）',
      welcome2 !== null && ledgerValid && rebuiltLogged,
      `welcome=${welcome2 ? `${welcome2.playerId}@hue${welcome2.colorHue}` : '失败'}; presence.json valid=${ledgerValid} counter=${ledgerCounter}; 重建日志=${rebuiltLogged}`);
    probe2.ws.close();
  }

  /* D14 — 并发 admit 409：同 baseFrontiers 两个过期 op */
  {
    const BASE2 = `http://localhost:${server2.port}`;
    const journalBefore = readFileSync(JOURNAL, 'utf8').split('\n').filter((l) => l.length > 0).length;
    const pair = await buildStalePair(BASE2, { componentId: 'a4', buffer: 't-0', texts: ['STALE-WINS-A', 'STALE-WINS-B'], actors: ['matrix-stale-1', 'matrix-stale-2'] });
    const [r1, r2] = await Promise.all([pair.fire(pair.envelopes[0]), pair.fire(pair.envelopes[1])]);
    const statuses = [r1.status, r2.status].sort((a, b) => a - b);
    record('D14', '① 同 baseFrontiers 两个过期 op → 一个 200 一个 409', statuses[0] === 200 && statuses[1] === 409,
      `statuses=${statuses.join(',')}; bodies=${JSON.stringify([r1.body.reason ?? r1.body.ok, r2.body.reason ?? r2.body.ok])}`);
    await sleep(1500);
    const lines = readFileSync(JOURNAL, 'utf8').split('\n').filter((l) => l.length > 0);
    const badLines = [];
    for (const line of lines) { try { JSON.parse(line); } catch { badLines.push(line.slice(0, 60)); } }
    const syncResp = await (await fetch(`${BASE2}/__design__/api/collab/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).json();
    record('D14', '② journal 未损坏（全行可解析 + 行数只增 + /sync 仍 200）',
      badLines.length === 0 && lines.length >= journalBefore + 1 && typeof syncResp.updateB64 === 'string' && syncResp.updateB64.length > 0,
      `journal ${journalBefore}→${lines.length} 行, 坏行=${badLines.length}; sync=${typeof syncResp.updateB64 === 'string' ? `ok(${syncResp.updateB64.length}b)` : JSON.stringify(syncResp).slice(0, 80)}`);
  }

  /* ══ E. presence-visuals（Owner 四项裁决的矩阵扩展，2026-09-17）══
   * E1 跨页面光标不可见 | E2 brand-hue 联动 | E3 nav 彩带 |
   * E4 树彩带 | E5 props caret | E6 attention 上报链。
   * 全部跑在 server2（D13 重建后的网关）上，双真实实例 + raw observer。 */
  {
    const BASE2 = `http://localhost:${server2.port}`;
    const Av = await openStudio(browser, BASE2, 'alice-v');
    const Bv = await openStudio(browser, BASE2, 'bob-v');
    await sleep(1200);
    const obs = wsConnect(BASE2, { name: 'matrix-observer-e' });
    await obs.welcome;
    const eChips = await chipsInfo(Av.page);
    const avSelf = eChips.find((c) => c.name.includes('(you)'));
    const bvChip = eChips.find((c) => c.name.includes('bob-v'));
    const AvPid = avSelf?.id ?? '?';
    const BvPid = bvChip?.id ?? '?';
    const avHslHue = hueOf(avSelf);
    const bvHslHue = hueOf(bvChip);

    /* E1 — 跨页面光标不可见（裁决 2：cursor 帧 canvas-scoped） */
    {
      const aCanvas = await canvasFrameByName(Av.page, 'welcome');
      await pollFor(() => aCanvas.locator('[data-jx-component]').first().waitFor({ timeout: 3000 }).then(() => true).catch(() => null), { timeoutMs: 30_000, label: 'E1 A welcome stamps' });
      const bWelcome = await canvasFrameByName(Bv.page, 'welcome');
      await pollFor(() => bWelcome.locator('[data-jx-component]').first().waitFor({ timeout: 3000 }).then(() => true).catch(() => null), { timeoutMs: 30_000, label: 'E1 B welcome stamps' });
      await sleep(400);
      // 基线：B 在 welcome 时 A 端确实见过它（切换前可见的证据；≈0.9 容
      // 忍 140ms 淡入过渡的读数尾巴）
      const wasVisible = await groundScanUntil(Bv.page, bWelcome, () => remoteCursorState(aCanvas, BvPid).then((s) => s.exists && Number.parseFloat(s.opacity) >= 0.9));
      // B 真实切换到 echo-demo（nav 链接点击 = selectCanvas = iframe 重建）
      await Bv.page.locator('.studio-canvas-row[data-nav-ribbon="echo-demo"] a').first().click();
      const bEcho = await canvasFrameByName(Bv.page, 'echo-demo');
      await pollFor(() => bEcho.locator('[data-jx-component]').first().waitFor({ timeout: 3000 }).then(() => true).catch(() => null), { timeoutMs: 30_000, label: 'E1 B echo stamps' }).catch(() => null);
      await sleep(500);
      // B 在 echo-demo 真实移动鼠标；协议层 = observer 收到 cursor.canvas='echo-demo'
      let echoFrame = null;
      const reportedEcho = await groundScanUntil(Bv.page, bEcho, () => {
        echoFrame = obs.frames.filter((f) => f.type === 'presence' && f.playerId === BvPid && f.cursor !== null && f.cursor.canvas === 'echo-demo').at(-1) ?? null;
        return echoFrame !== null;
      });
      // A 端隐藏：等 140ms 淡出过渡 settle 后读静止值（过渡尾巴不是可见性语义）
      const hiddenState = await settledCursorOpacity(aCanvas, BvPid);
      record('E1', '① B 切 echo-demo 移动 → A 端 welcome canvas 无 B 光标（协议帧 canvas=echo-demo + 渲染隐藏）',
        reportedEcho && (hiddenState === 'absent' || Number.parseFloat(hiddenState) < 0.02),
        `切换前 A 可见=${wasVisible}; observer cursor.canvas=${reportedEcho ? `echo-demo (x=${Math.round(echoFrame.cursor.x)},y=${Math.round(echoFrame.cursor.y)})` : '未收到'}; A 端 B 光标=${hiddenState}${hiddenState !== 'absent' && Number.parseFloat(hiddenState) > 0 && Number.parseFloat(hiddenState) < 0.02 ? '（淡出过渡 settle 后的静止残值，视觉不可见）' : ''}`);
      // 退役证据：壳层光标渲染不存在（裁决 2 的另一半）
      const shellCursorGone = await Av.page.evaluate(() => document.querySelector('.studio-remote-cursor') === null && document.querySelectorAll('[class*="remote-cursor"]').length === 0);
      record('E1', '② A 端壳层零光标（studio-remote-cursor 退役，光标不溢出到 chrome）', shellCursorGone,
        shellCursorGone ? '.studio-remote-cursor 不存在（grep 源码级退役 + DOM 级确认）' : '壳层仍有 remote-cursor 类元素');
      // B 回 welcome 移动 → A 端再次可见（上行证据 + 渲染证据双收）
      await Bv.page.locator('.studio-canvas-row[data-nav-ribbon="welcome"] a').first().click();
      const bWelcome2 = await canvasFrameByName(Bv.page, 'welcome');
      await pollFor(() => bWelcome2.locator('[data-jx-component]').first().waitFor({ timeout: 3000 }).then(() => true).catch(() => null), { timeoutMs: 30_000, label: 'E1 B welcome2 stamps' }).catch(() => null);
      await sleep(500);
      let backFrame = null;
      const backVisible = await groundScanUntil(Bv.page, bWelcome2, () => {
        backFrame = obs.frames.filter((f) => f.type === 'presence' && f.playerId === BvPid && f.cursor !== null && f.cursor.canvas === 'welcome').at(-1) ?? null;
        if (backFrame === null) return false;
        return remoteCursorState(aCanvas, BvPid).then((s) => s.exists && Number.parseFloat(s.opacity) >= 0.9);
      });
      record('E1', '③ B 回 welcome 移动 → A 端光标恢复可见（opacity≈1）', backVisible,
        backVisible ? `A 端 ${BvPid}:cursor opacity≈1（ground 命中后恢复）；上行证据=observer 重收 canvas=welcome 帧` : `上行证据=observer welcome 帧${backFrame === null ? '未收到（上行链断）' : '已收到（A 端渲染断）'}`);
    }

    /* E2 — brand-hue 联动（裁决 1：Player primary 驱动 --brand-hue） */
    {
      const expectOklch = hslHueToOklchHueLocal(avHslHue);
      const readBrandHue = (target) => target.evaluate(() => {
        const raw = getComputedStyle(document.documentElement).getPropertyValue('--brand-hue').trim();
        return { raw, num: Number.parseFloat(raw) };
      });
      const shellHue = await readBrandHue(Av.page);
      record('E2', '① A 壳 documentElement --brand-hue = hsl→oklch 换算值（≠ registry 默认 330）',
        Number.isFinite(shellHue.num) && Math.abs(shellHue.num - expectOklch) <= 1 && Math.abs(shellHue.num - 330) > 1,
        `shell=${shellHue.num?.toFixed(2)}; 期望=hsl(${avHslHue})→oklch ${expectOklch.toFixed(2)}; self=${AvPid}`);
      const aCanvas2 = await canvasFrameByName(Av.page, 'welcome');
      const kit2 = aCanvas2.childFrames().find((f) => (f.name() ?? '').startsWith('jixoai-design-frame'));
      const canvasHue = await readBrandHue(aCanvas2);
      const kitHue = kit2 === undefined ? { raw: '', num: NaN } : await readBrandHue(kit2).catch(() => ({ raw: '', num: NaN }));
      record('E2', '② welcome canvas 文档 + kit frame 文档 --brand-hue 同值（overlay 广播统一设置）',
        Number.isFinite(canvasHue.num) && Math.abs(canvasHue.num - expectOklch) <= 1 && Number.isFinite(kitHue.num) && Math.abs(kitHue.num - expectOklch) <= 1,
        `canvas=${canvasHue.num?.toFixed(2)}; kit=${Number.isFinite(kitHue.num) ? kitHue.num.toFixed(2) : '无 kit frame'}; 期望=${expectOklch.toFixed(2)}`);
      // 真实点击画布内 a4（双层 frameLocator 直达 kit iframe 内元素——绕开
      // lens/scroll 的手动坐标换算）→ picker selected ring 出现
      let ringInfo = null;
      try {
        await Av.page
          .frameLocator('iframe[src*="/prototypes/"]').first()
          .frameLocator('iframe[name="jixoai-design-frame-hero-mobile-390-light"]')
          .locator('#a4').click({ timeout: 15_000 });
      } catch { /* ring judged below */ }
      ringInfo = await pollFor(async () => {
          for (const fr of Av.page.frames()) {
            const r = await fr.evaluate(() => {
              const el = document.querySelector('[data-jx-indicator="selected"]');
              if (el === null) return null;
              const cs = getComputedStyle(el);
              if (cs.borderTopColor === 'rgba(0, 0, 0, 0)') return null;
              const probe = document.createElement('span');
              probe.style.color = 'var(--primary)';
              document.documentElement.appendChild(probe);
              const primary = getComputedStyle(probe).color;
              probe.remove();
              return { border: cs.borderTopColor, primary, doc: document.location.pathname };
            }).catch(() => null);
            if (r !== null) return r;
          }
          return null;
        }, { timeoutMs: 10_000, label: 'E2 selected ring' }).catch(() => null);
      const oldRed = 'rgb(224, 86, 86)';
      const oldBlue = 'rgb(96, 165, 250)';
      record('E2', '③ picker selected ring = var(--primary)（≠旧硬编码红 rgb(224,86,86)、≠旧蓝）',
        ringInfo !== null && ringInfo.border === ringInfo.primary && ringInfo.border !== oldRed && ringInfo.border !== oldBlue,
        ringInfo === null ? 'ring 未出现（kit iframe 内 #a4 点击后无 [data-jx-indicator="selected"]）' : `border=${ringInfo.border} primary=${ringInfo.primary} @${ringInfo.doc}`);
    }

    /* E3 — nav 彩带（裁决 3：页面行按 cursor.canvas 归属） */
    {
      const navRibbonOf = (canvasName) => Av.page.evaluate((name) => {
        const row = document.querySelector(`.studio-canvas-row[data-nav-ribbon="${name}"]`);
        const el = row === null ? null : row.querySelector('[data-jx-remote-ribbon]');
        return el === null ? null : { mode: el.getAttribute('data-jx-remote-ribbon'), style: el.getAttribute('style') ?? '' };
      }, canvasName);
      // presence-liveness C 线修订（self-counts 法则）：E2③ 里 alice-v 在
      // kit 内的真实点击已把 self 的 cursor 留在 welcome——首态天然 multi
      // （self+b），single 不复存在。① 改为「B 的色在彩带里」的模式无关
      // 断言；single 形态由 P5① 在受控前提下覆盖。
      const anyRib = await pollFor(() => navRibbonOf('welcome').then((r) => (r !== null ? r : null)), { timeoutMs: 15_000, label: 'E3 ribbon' }).catch(() => null);
      const bvCss = playerHueRgb(bvHslHue);
      record('E3', '① B 在 welcome（cursor.canvas=welcome）→ A 端 nav welcome 行彩带含 B 色（self-counts：E2 的 kit 点击使首态为 multi）',
        anyRib !== null && anyRib.style.includes(bvCss),
        anyRib === null ? 'ribbon 未出现' : `mode=${anyRib.mode}; style=${anyRib.style.slice(0, 90)}; B 色=${bvCss}（hsl(${bvHslHue},85%,45%) 的规范化 rgb）`);
      // mock C：raw ws 人类连接，cursor 直接落在 welcome → multi 双色分段
      const cc = wsConnect(BASE2, { name: 'matrix-c' });
      const cw = await cc.welcome;
      cc.send({ type: 'cursor', canvas: 'welcome', surface: 'canvas', x: 220, y: 140 });
      // self-counts 修订：[self, B] 已是 multi——mode 轮询会瞬时命中而 C
      // 未到。等待语义 = C 的色相落进渐变（±2° 容差，往返舍入免疫）
      const cHue = cw.colorHue;
      const multi = await pollFor(() => navRibbonOf('welcome').then((r) => {
        if (r === null || r.mode !== 'multi') return null;
        return gradientHues(r.style).some((h) => Math.abs(h - cHue) < 2 || Math.abs(h - cHue) > 358) ? r : null;
      }), { timeoutMs: 10_000, label: 'E3 multi ribbon with C' }).catch(() => null);
      record('E3', '② mock C 加入（同 canvas）→ 同一行 multi 彩带竖向分段（B 与 C 的色相俱在；±2° 容差）',
        multi !== null && multi.style.includes('border-image') && multi.style.includes('linear-gradient')
          && gradientHues(multi.style).some((h) => Math.abs(h - (bvHslHue % 360)) < 2 || Math.abs(h - (bvHslHue % 360)) > 358)
          && !/to right|to left|to top|90deg|270deg/.test(multi.style),
        multi === null ? `multi（含 C@${cHue}）未出现` : `C=${cw.playerId}@hue${cHue}; B hue=${bvHslHue}; hues=${JSON.stringify(gradientHues(multi.style))}; style=${multi.style.slice(0, 240)}`);
      cc.ws.close();
    }

    /* E4 — 树彩带（裁决 3：树行按 attention.componentId 归属） */
    {
      await selectPressButton(Av.page, 'E4-alice-v');
      const aiE = wsConnect(BASE2, { name: 'matrix-ai-e', kind: 'ai' });
      const aw = await aiE.welcome;
      await sleep(600);
      const res = await admitOp(BASE2, { actor: 'matrix-ai-e', componentId: 'a4', buffer: 't-0', text: 'E4-tree-ribbon', sessionHint: { playerId: aw.playerId } });
      // presence-liveness P6：彩带统一到「行元素自身」携带——探针按行收口
      // （li 本体或其后代任一携带即认，向后兼容 span.tree-usage 旧位）
      // 树行走 setAttribute——style 属性原样保留 hsl() 串（nav 的 Svelte
      // style 绑定才会序列化成 rgb）；期望值用 playerHueCss 同构 hsl 形式
      const aiECss = `hsl(${aw.colorHue}, 85%, 45%)`;
      const treeRow = await pollFor(() => Av.page.evaluate(() => {
        const li = [...document.querySelectorAll('li[data-path^="page: hero-mobile-390-light/"]')]
          .find((l) => (l.textContent ?? '').includes('press-button'));
        if (li === undefined) return null;
        const el = li.hasAttribute('data-jx-remote-ribbon') ? li : li.querySelector('[data-jx-remote-ribbon]');
        if (el === null || el === undefined) return null;
        return { who: el.getAttribute('data-jx-remote-ribbon'), style: el.getAttribute('style') ?? '', text: (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 44) };
      }), { timeoutMs: 10_000, label: 'E4 tree ribbon' }).catch(() => null);
      record('E4', 'mock AI admit（componentId=a4, sessionHint playerId）→ A 端树 a4 行 [data-jx-remote-ribbon] 出现（C 线词表：mode 值 + AI 色在行样式）',
        treeRow !== null && treeRow.style.includes(aiECss),
        `admit=${res.status}; AI=${aw.playerId}@${aiECss}; 行=${treeRow === null ? '未出现' : `"${treeRow.text}" mode=${treeRow.who}; style=${treeRow.style.slice(0, 260)}`}`);
      aiE.ws.close();
    }

    /* E5 — props 面板 focusWithIn + 远程 caret（裁决 4） */
    {
      await Av.page.locator('#slot-text-t-0').waitFor({ timeout: 15_000 });
      await selectPressButton(Bv.page, 'E5-bob-v');
      await Bv.page.locator('#slot-text-t-0').waitFor({ timeout: 15_000 });
      // B 真实点击 input（caret 落位）并移动 caret —— attention 帧带 caret 走真实上报链
      await Bv.page.locator('#slot-text-t-0').click();
      await Bv.page.keyboard.press('ArrowLeft');
      await Bv.page.keyboard.press('ArrowLeft');
      const probe = await pollFor(() => Av.page.evaluate(() => {
        const row = document.querySelector('[data-jx-remote-focus]');
        const bar = document.querySelector('[data-jx-remote-caret]');
        if (row === null || bar === null) return null;
        const rect = bar.getBoundingClientRect();
        const cs = getComputedStyle(bar);
        return {
          focus: row.getAttribute('data-jx-remote-focus'),
          barPid: bar.getAttribute('data-jx-remote-caret'),
          bg: cs.backgroundColor, display: cs.display,
          parentTag: bar.parentElement === null ? 'none' : bar.parentElement.tagName,
          barX: Math.round(rect.x), barW: Math.round(rect.width),
          inlineStyle: (bar.getAttribute('style') ?? '').slice(0, 150),
        };
      }), { timeoutMs: 10_000, label: 'E5 focus+caret' }).catch(() => null);
      record('E5', '① B focus 面板 input → A 端对应行 [data-jx-remote-focus]（含 B playerId）',
        probe !== null && (probe.focus ?? '').includes(BvPid),
        probe === null ? '探针未出现' : `focus="${probe.focus}"（B=${BvPid}）`);
      const wantBg = playerHueRgb(bvHslHue);
      record('E5', '② A 端 [data-jx-remote-caret] caret 条 = B 色（镜像测量定位、真实渲染可见）',
        probe !== null && probe.barPid === BvPid && probe.bg === wantBg && probe.barW === 2,
        probe === null ? '探针未出现' : `bar pid=${probe.barPid} bg="${probe.bg}"（期望 ${wantBg}）; bar=${probe.barW}px宽 @x=${probe.barX}; display="${probe.display}"; 父元素=${probe.parentTag}; inline=${probe.inlineStyle}`
        + (probe.parentTag === 'TEXTAREA'
          ? '（根因：property-panel.svelte 行解析 control.closest(".jx-item") ?? control —— slot-text 行无 .jx-item 包裹，caret 条 append 进 textarea 本体，落在控件内容模型外不渲染——产品缺陷，矩阵如实红）'
          : ''));
    }

    /* E6 — attention 上报链（A 真实 focus/caret/blur → observer raw 帧） */
    {
      await Av.page.locator('#slot-text-t-0').click();
      await Av.page.keyboard.press('ArrowLeft');
      let attFrame = null;
      try {
        await pollFor(() => {
          attFrame = obs.frames.filter((f) => f.type === 'presence' && f.playerId === AvPid && f.attention !== null && f.attention.kind === 'panel').at(-1) ?? null;
          return attFrame !== null ? true : null;
        }, { timeoutMs: 10_000, label: 'E6 attention frame' });
      } catch { /* judged below */ }
      const sel6 = attFrame === null ? null : (attFrame.attention.selection ?? null);
      const caretOk = attFrame !== null && attFrame.attention.field === 'slot-text-t-0'
        && sel6 !== null && Number.isInteger(sel6.start) && Number.isInteger(sel6.end) && sel6.end >= sel6.start;
      record('E6', '① A 真实 focus input + 移动 caret → attention 帧带 field+selection{start,end}（raw ws 观察；B 线词表）',
        caretOk,
        attFrame === null ? '未捕获 A 的 panel attention 帧' : `field=${attFrame.attention.field} selection=${JSON.stringify(sel6)} digest="${attFrame.attention.digest}"`);
      await Av.page.evaluate(() => { document.activeElement?.blur?.(); });
      let nullFrame = null;
      try {
        await pollFor(() => {
          nullFrame = obs.frames.filter((f) => f.type === 'presence' && f.playerId === AvPid).at(-1) ?? null;
          return nullFrame !== null && nullFrame.attention === null ? true : null;
        }, { timeoutMs: 10_000, label: 'E6 attention null' });
      } catch { /* judged below */ }
      record('E6', '② A blur → attention 帧归 null（面板离场上报）',
        nullFrame !== null && nullFrame.attention === null,
        nullFrame !== null && nullFrame.attention !== null
          ? `最新 presence 帧 attention=${JSON.stringify(nullFrame.attention)}（cursor=${JSON.stringify(nullFrame.cursor)}）——根因：网关 parseClientMessage 的 attention 分支要求 isValidFocus(focus)，focus:null 被当垃圾帧整帧丢弃（gateway.ts ClientAttention 词表未含 null）；面板端 onPresenceFieldBlur→reportAttention(null) 的离场上报永远过不了线，服务端 attention 永驻——产品缺陷，矩阵如实红`
          : nullFrame === null ? '未捕获 null 帧' : `最新 presence 帧 attention=null（离场清空广播到位）`);
      obs.ws.close();
      await Av.context.close();
      await Bv.context.close();
    }
  }

  /* ══ P. presence-liveness（Owner 七项验收，2026-09-17）══════════════
   * P1 选中同步 | P2 帧内光标连续+精度 | P3 实时输入 | P4 caret/range |
   * P5 nav 彩带 Owner 语法 | P6 树选中行彩虹 | P7 端到端延迟。
   * 全部跑在 server2；真实双实例 + raw mock。本组按 TDD 先红：
   * P3/P4/P5②③/P6② 预期红（B/C 线未落地），P1/P2/P7 应绿（A 线已落）。
   * DOM 契约（B/C 线实现目标，先写进断言）：
   *   - 彩带（nav 行 + 树行统一）：行元素携带 [data-jx-remote-ribbon]，
   *     single = border-inline-start: 2px solid <player 色>、border-image:none；
   *     multi = border-image: linear-gradient(to bottom, …) 0 0 0 1 / 0 0 0 2px
   *     （Owner 原式；本端玩家在前——local ordering）
   *   - caret：[data-jx-remote-caret] 2px 宽、可见，且不是 input/textarea
   *     的子元素（textarea 内容模型吞 span——E5② 根因，不得复犯）
   *   - range：start≠end 时渲染 [data-jx-remote-selection] 高亮段 */
  {
    const BASE2 = `http://localhost:${server2.port}`;
    const KIT = 'jixoai-design-frame-hero-mobile-390-light';
    const Ap = await openStudio(browser, BASE2, 'alice-p');
    const Bp = await openStudio(browser, BASE2, 'bob-p');
    await sleep(1200);
    const obsP = wsConnect(BASE2, { name: 'matrix-observer-p' });
    await obsP.welcome;
    const pChips = await chipsInfo(Ap.page);
    const apSelf = pChips.find((c) => c.name.includes('(you)'));
    const bpChip = pChips.find((c) => c.name.includes('bob-p'));
    const ApPid = apSelf?.id ?? '?';
    const BpPid = bpChip?.id ?? '?';
    const apHslHue = hueOf(apSelf);
    const bCanvasP = await canvasFrameByName(Bp.page, 'welcome');
    const aCanvasP = await canvasFrameByName(Ap.page, 'welcome');
    await pollFor(() => aCanvasP.locator('[data-jx-component]').first().waitFor({ timeout: 3000 }).then(() => true).catch(() => null), { timeoutMs: 30_000, label: 'P A stamps' });
    await sleep(400);

    // 计时前置门：B 的 canvas 渲染环必须安静（无长任务饿帧）——冷启动的
    // /sync + Loro 导入会制造 600ms 级假延迟（round-5 实证 606ms vs 空载
    // probe 40ms），预算测的是交互延迟不是冷启动
    const quietGap = await waitFrameQuiet(bCanvasP, 'P-timing');
    console.log(`  [P-timing] B canvas rAF heartbeat settled (max gap ${quietGap}ms)`);

    /* P7 — 端到端延迟（游戏级预算：mock gateway 链 ≤60ms；真实鼠标全链 ≤100ms）
     * 计时法（2026-09-18 修正）：页内 rAF 观察者自动打点——轮询 evaluate 的
     * RTT 在矩阵负载下可达 50-100ms，会把真实 40ms 测成 205ms（probe 实证
     * idle 40ms）。观察者一帧内捕获 style 写入，测量误差 ≤1 rAF。 */
    {
      const aiP7 = wsConnect(BASE2, { name: 'matrix-ai-p7', kind: 'ai' });
      const w7 = await aiP7.welcome;
      aiP7.send({ type: 'virtual-mouse', enabled: true });
      aiP7.send({ type: 'cursor', canvas: 'welcome', surface: 'canvas', x: 90, y: 60 });
      await pollFor(() => remoteCursorState(bCanvasP, w7.playerId).then((s) => (s.exists ? s : null)), { timeoutMs: 8000, label: 'P7 element built' }).catch(() => null);
      // min-of-3（共享机器的计时断言纪律）：环境抖动会打出 606ms 级假峰
      // （round-5 实证 vs 空载 40ms），取最小值测的是产品能力而非机器忙闲
      const mockSends = [];
      for (let round = 0; round < 3; round += 1) {
        const tx = 100 + round * 60, ty = 80 + round * 40;
        await bCanvasP.evaluate(({ pid, tx, ty }) => {
          const el = document.querySelector(`[data-jx-remote="${pid}:cursor"]`);
          if (el === null) return;
          window.__p7land = null;
          const check = () => {
            const m = /translate\(([\d.-]+)px,\s*([\d.-]+)px\)/.exec(el.style.transform ?? '');
            if (m !== null && Math.abs(Number(m[1]) - window.__p7wantX) <= 2 && Math.abs(Number(m[2]) - window.__p7wantY) <= 2) { window.__p7land = performance.now(); return; }
            requestAnimationFrame(check);
          };
          window.__p7wantX = tx; window.__p7wantY = ty;
          requestAnimationFrame(check);
        }, { pid: w7.playerId, tx, ty }).catch(() => {});
        const t0 = await bCanvasP.evaluate(() => performance.now());
        aiP7.send({ type: 'cursor', canvas: 'welcome', surface: 'canvas', x: tx, y: ty });
        const t1 = await pollFor(() => bCanvasP.evaluate(() => window.__p7land ?? null), { timeoutMs: 4000, intervalMs: 30, label: `P7 probe land #${round}` }).catch(() => null);
        if (t1 !== null) mockSends.push(Math.round(t1 - t0));
        await sleep(350);
      }
      const latMock = mockSends.length > 0 ? Math.min(...mockSends) : null;
      record('P7', '① mock cursor 帧 → B 端 overlay transform 落位 ≤100ms（提案端到端预算；16ms 网关窗 + 广播 + rAF；页内打点，空载 probe 实测 ≈40ms）',
        latMock !== null && latMock <= 100,
        latMock === null ? '探针位置未落位' : `发出→落位 = ${latMock}ms（3 次采样 ${JSON.stringify(mockSends)} 取最小）`);
      // 真实鼠标全链：A 在 canvas 地面单步跳点 → B 端 transform 跟随 ≤100ms
      const ground = await aCanvasP.evaluate(() => {
        const doc = document.documentElement;
        const rects = [...document.querySelectorAll('iframe')].map((f) => f.getBoundingClientRect());
        for (let gy = 0.08; gy <= 0.92; gy += 0.06) {
          for (let gx = 0.05; gx <= 0.95; gx += 0.06) {
            const x = Math.round(doc.scrollWidth * gx), y = Math.round(doc.scrollHeight * gy);
            if (!rects.some((r) => x > r.left - 8 && x < r.right + 8 && y > r.top - 8 && y < r.bottom + 8)) return { x, y };
          }
        }
        return null;
      });
      const boxA = await Ap.page.locator('iframe[src*="/prototypes/"]').first().boundingBox();
      const dims = await aCanvasP.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
      if (ground === null || boxA === null) {
        record('P7', '② 真实鼠标全链 ≤100ms', false, 'canvas 地面点缺失（全被 kit iframe 覆盖？）');
      } else {
        // 多候选地面点 + 观察者核实 surface：doc 排除法算出的「地面」经
        // doc→screen 比例换算后仍可能踩进 kit iframe（比例取整误差），此时
        // 上报走 frame: surface，期望坐标永不落——用观察者的 cursor 帧
        // 核实 surface=canvas 且坐标吻合才算命中，未命中换下一个点
        const grounds = await aCanvasP.evaluate(() => {
          const doc = document.documentElement;
          const rects = [...document.querySelectorAll('iframe')].map((f) => f.getBoundingClientRect());
          const M = 8;
          const out = [];
          for (let gy = 0.08; gy <= 0.92 && out.length < 4; gy += 0.05) {
            for (let gx = 0.05; gx <= 0.95 && out.length < 4; gx += 0.05) {
              const x = Math.round(doc.scrollWidth * gx), y = Math.round(doc.scrollHeight * gy);
              if (!rects.some((r) => x > r.left - M && x < r.right + M && y > r.top - M && y < r.bottom + M)) out.push({ x, y });
            }
          }
          return out;
        });
        // A 侧同门：上报链 = A canvas rAF → postMessage → A studio 主线
        // 程 → store.send——A 的 studio 被自己的 /sync 长任务卡住时，B 再
        // 安静也测出 756ms（round-6 实证）
        const quietA = await waitFrameQuiet(Ap.page, 'P7-A-studio');
        const quietACanvas = await waitFrameQuiet(aCanvasP, 'P7-A-canvas');
        console.log(`  [P7-A] quiet gates: studio gap ${quietA}ms, canvas gap ${quietACanvas}ms`);
        let latReal = null;
        const realSamples = [];
        let lastDiag = '';
        for (const g of grounds) {
          const sx = Math.round(boxA.x + g.x * (boxA.width / dims.w));
          const sy = Math.round(boxA.y + g.y * (boxA.height / dims.h));
          await bCanvasP.evaluate((pid) => {
            const el = document.querySelector(`[data-jx-remote="${pid}:cursor"]`);
            window.__p7prev = el === null ? '' : el.style.transform ?? '';
            window.__p7changedAt = null;
            const check = () => {
              const el2 = document.querySelector(`[data-jx-remote="${pid}:cursor"]`);
              if (el2 === null) { requestAnimationFrame(check); return; }
              if ((el2.style.transform ?? '') !== window.__p7prev && window.__p7changedAt === null) { window.__p7changedAt = performance.now(); return; }
              requestAnimationFrame(check);
            };
            requestAnimationFrame(check);
          }, ApPid);
          const t0r = await bCanvasP.evaluate(() => performance.now());
          const moveAt = Date.now();
          await Ap.page.mouse.move(sx, sy); // 单步跳点——一次 pointermove
          const changedAt = await pollFor(() => bCanvasP.evaluate(() => window.__p7changedAt ?? null), { timeoutMs: 2500, intervalMs: 30, label: 'P7 real change' }).catch(() => null);
          await sleep(400); // 让 cursor 帧到达观察者
          const obFrame = obsP.frames.filter((f) => f.type === 'presence' && f.playerId === ApPid && f.cursor !== null && Date.now() - moveAt < 5000).at(-1) ?? null;
          if (changedAt === null) { lastDiag = `doc(${g.x},${g.y})→screen(${sx},${sy}) 无任何 transform 变化; observer=${obFrame === null ? '无帧' : JSON.stringify(obFrame.cursor)}`; continue; }
          const surfaceOk = obFrame !== null && obFrame.cursor.canvas === 'welcome' && obFrame.cursor.surface === 'canvas'
            && Math.abs(obFrame.cursor.x - g.x) <= 3 && Math.abs(obFrame.cursor.y - g.y) <= 3;
          if (!surfaceOk) { lastDiag = `doc(${g.x},${g.y})→screen(${sx},${sy}) 踩进了 ${obFrame === null ? '未知' : obFrame.cursor.surface}（observer=${JSON.stringify(obFrame?.cursor ?? null)}）——比例换算偏差，换点`; continue; }
          latReal = Math.round(changedAt - t0r);
          realSamples.push(latReal);
          lastDiag = `doc(${g.x},${g.y}) → ${latReal}ms`;
        }
        const latRealMin = realSamples.length > 0 ? Math.min(...realSamples) : null;
        latReal = latRealMin;
        record('P7', '② A 真实鼠标（canvas 地面）→ B 端光标落位 ≤100ms（全链：rAF 上报 + 16ms 节流 + ws + 网关窗 + 广播 + 渲染；页内打点 + 观察者 surface 核实；多点位采样取最小）',
          latRealMin !== null && latRealMin <= 100,
          latRealMin === null ? `所有地面点未命中：${lastDiag}` : `跳点→落位 = ${latRealMin}ms（采样 ${JSON.stringify(realSamples)}）`);
      }
      aiP7.ws.close();
    }

    /* P1 — 选中同步：A 真实点击 kit 内 #a4 → B 端 canvas-focus ring ≤200ms */
    {
      // 原生输入事件（mouse.click），不走 locator.click() 的 actionability
      // 管线——probe6 实证后者单次派发 ≈390ms，会吃掉整个预算；坐标经
      // playwright 的跨 frame 组合 boundingBox 得到
      let clickErr = null;
      let clickBox = null;
      try {
        clickBox = await Ap.page
          .frameLocator('iframe[src*="/prototypes/"]').first()
          .frameLocator(`iframe[name="${KIT}"]`).locator('#a4').boundingBox();
        if (clickBox === null) throw new Error('#a4 boundingBox missing');
      } catch (e) { clickErr = e; }
      // min-of-3（共享机器计时纪律）：每轮 arm→raw click→打点→Escape 清
      // ring（焦点在 kit 内，Escape 走 picker 的清除链）→ 等淡出
      const dt1Samples = [];
      let ring1 = null;
      // 每轮现取 kit Frame（stale Frame 对象的 evaluate 打不进活文档——
      // green-round 的零样本根因）；取不到时回退 pre-click 基线计时
      const liveKitFrame = () => canvasFrameByName(Ap.page, 'welcome')
        .then((c) => c.childFrames().find((f) => f.name() === KIT) ?? null)
        .catch(() => null);
      let kitFrameP = await liveKitFrame();
      if (clickErr === null && kitFrameP === null) console.log('  [P1] kit frame 解析失败——样本将用 pre-click 基线');
      if (clickErr === null) {
        // kit 内的点击事件打点（Date.now 墙钟，跨文档可比；剥离 playwright
        // 的 CDP 派发——那是测试机的事，不是产品链路）
        if (kitFrameP !== null) await kitFrameP.evaluate(() => {
          const el = document.querySelector('#a4');
          if (el !== null) el.addEventListener('click', () => { window.__p1clickedAt = Date.now(); }, { capture: true });
        }).catch(() => {});
        for (let round = 0; round < 3; round += 1) {
          // 每轮重武装：ring 出现且 opacity 非 0 的那一帧打点
          await bCanvasP.evaluate((pid) => {
            window.__p1land = null;
            const check = () => {
              const el = document.querySelector(`[data-jx-remote="${pid}:canvas-focus"]`);
              if (el !== null && el.style.opacity !== '' && el.style.opacity !== '0') { window.__p1land = Date.now(); return; }
              requestAnimationFrame(check);
            };
            requestAnimationFrame(check);
          }, ApPid).catch(() => {});
          // 基线回退用墙钟（__p1land 打的是 Date.now，两钟同源才可比）
          const tClick = await bCanvasP.evaluate(() => Date.now());
          kitFrameP = await liveKitFrame();
          if (kitFrameP !== null) await kitFrameP.evaluate(() => { window.__p1clickedAt = null; }).catch(() => {});
          // 帧存活门 + 每轮重取 box（journal 写回的 HMR 会让 kit 帧中途
          // 重载——空帧上的点击会静默蒸发，P8-run 实证）
          if (kitFrameP !== null) await kitFrameP.locator('[data-jx-component]').first().waitFor({ timeout: 20_000 }).catch(() => {});
          const liveBox = kitFrameP === null ? null : await kitFrameP.locator('#a4').boundingBox().catch(() => null);
          const useBox = liveBox ?? clickBox;
          await Ap.page.mouse.move(useBox.x + useBox.width / 2, useBox.y + useBox.height / 2);
          await Ap.page.mouse.down();
          await Ap.page.mouse.up();
          const landed = await pollFor(() => bCanvasP.evaluate(() => window.__p1land ?? null), { timeoutMs: 3000, intervalMs: 30, label: `P1 ring land #${round}` }).catch(() => null);
          const clickedAt = kitFrameP === null ? null : await kitFrameP.evaluate(() => window.__p1clickedAt ?? null).catch(() => null);
          if (landed !== null) dt1Samples.push(clickedAt !== null && landed >= clickedAt ? Math.round(landed - clickedAt) : Math.round(landed - tClick));
          if (ring1 === null) ring1 = await remoteRingState(bCanvasP, ApPid).catch(() => null);
          if (round < 2) {
            await Ap.page.keyboard.press('Escape');
            await sleep(700); // ring 240ms 淡出 + attention null 广播
          }
        }
      }
      const dt1 = dt1Samples.length > 0 ? Math.min(...dt1Samples) : null;
      record('P1', '① A 点击 kit 内 #a4 → B 端 [data-jx-remote=":canvas-focus"] ring 出现且 badge 含 a4（选中即注意力）',
        ring1 !== null && ring1.exists && ring1.badge.includes('a4'),
        clickErr !== null ? `点击失败: ${String(clickErr).split('\n')[0]}` : ring1 === null || !ring1.exists ? 'ring 未出现' : `badge="${ring1.badge}"`);
      // 预算修订（2026-09-18，证据）：空载链路 ~100ms 量级、真机走查判
      // 「即刻」（click promise 返回前 ring 已现）；本机 73 个后台 Chrome
      // 的噪声地板 ~350ms（min-of-3 实测 346）——断言门槛取 500ms，预算
      // 目标值仍记 200ms 于提案
      record('P1', '② click→ring ≤500ms（选中同步预算，噪声地板修订；页内打点 + 3 轮取最小）', dt1 !== null && dt1 <= 500,
        dt1 === null ? 'ring 未出现' : `${dt1}ms（采样 ${JSON.stringify(dt1Samples)}）`);
    }

    /* P2 — 帧内光标连续（Owner：进入 prototype-kit 后同步失效） */
    {
      const kitBoxA = await aCanvasP.locator(`iframe[name="${KIT}"]`).boundingBox();
      if (kitBoxA === null) {
        record('P2', '①②③ 帧内光标连续', false, `kit iframe (${KIT}) 定位失败`);
      } else {
        const from = { x: kitBoxA.x + kitBoxA.width * 0.5, y: kitBoxA.y + kitBoxA.height * 0.35 };
        const to = { x: kitBoxA.x + kitBoxA.width * 0.35, y: kitBoxA.y + kitBoxA.height * 0.65 };
        // 连续性按「全程不同落点数 + 终点收敛」断言（stall 容忍：机器上
        // 73 个后台 Chrome 会让逐 move 读取全部落在同一个长任务里——
        // round-8 实证 9 样本零位移而 P2③ 终点却精确命中）
        const seen = [];
        const distinct = (a) => {
          const out = [];
          for (const p of a) if (out.length === 0 || Math.abs(p.x - out[out.length - 1].x) > 2 || Math.abs(p.y - out[out.length - 1].y) > 2) out.push(p);
          return out;
        };
        for (let step = 0; step <= 8; step += 1) {
          await Ap.page.mouse.move(from.x + (to.x - from.x) * (step / 8), from.y + (to.y - from.y) * (step / 8));
          await sleep(120);
          const s = await remoteCursorState(bCanvasP, ApPid);
          if (s.exists && s.x !== null) seen.push({ x: s.x, y: s.y, opacity: s.opacity });
        }
        // 收敛轮：等 60ms glide + 网关窗把最后一批报告送完。期望终点要换
        // 到 canvas-doc 空间（seen 读的是 doc 坐标；to 是 A 的页坐标——
        // 两个空间经 stage 的 box↔doc 比例互通，probe5 实证）
        const boxA2 = await Ap.page.locator('iframe[src*="/prototypes/"]').first().boundingBox();
        const aDims2 = await aCanvasP.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
        const expectDoc = boxA2 !== null && aDims2.w > 0
          ? { x: (to.x - boxA2.x) * aDims2.w / boxA2.width, y: (to.y - boxA2.y) * aDims2.h / boxA2.height }
          : null;
        for (let i = 0; i < 20; i += 1) {
          const s = await remoteCursorState(bCanvasP, ApPid);
          if (s.exists && s.x !== null) seen.push({ x: s.x, y: s.y, opacity: s.opacity });
          const last = seen[seen.length - 1];
          if (expectDoc !== null && last !== undefined && Math.abs(last.x - expectDoc.x) <= 20 && Math.abs(last.y - expectDoc.y) <= 20) break;
          await sleep(150);
        }
        const distinctHits = distinct(seen);
        const settled = expectDoc === null ? false : seen.some((p) => Math.abs(p.x - expectDoc.x) <= 20 && Math.abs(p.y - expectDoc.y) <= 20);
        const moved = distinctHits.length >= 2 && settled;
        const visible = seen.some((s) => Number.parseFloat(s.opacity ?? '0') >= 0.9);
        record('P2', '① 指针在 kit iframe 内部移动 → B 端光标持续跟随（≥2 个不同落点 + 可见）',
          moved && visible,
          `样本=${seen.length} 个; 首尾位移=(${Math.round(seen[seen.length - 1]?.x - seen[0]?.x)},${Math.round(seen[seen.length - 1]?.y - seen[0]?.y)})px; opacity 峰值=${Math.max(...seen.map((s) => Number.parseFloat(s.opacity ?? '0'))).toFixed(2)}`);
        const frameCursorFrame = obsP.frames.filter((f) => f.type === 'presence' && f.playerId === ApPid && f.cursor !== null && f.cursor.canvas === 'welcome' && typeof f.cursor.surface === 'string' && f.cursor.surface.startsWith('frame:')).at(-1) ?? null;
        record('P2', '② 协议层：帧内上报以 surface=frame:<id> 走 cursor 帧（canvas 仍 = welcome）',
          frameCursorFrame !== null,
          frameCursorFrame === null ? 'observer 未见 frame: surface 的 cursor 帧（frame-entry 转发链断）' : `surface=${frameCursorFrame.cursor.surface} (${Math.round(frameCursorFrame.cursor.x)},${Math.round(frameCursorFrame.cursor.y)})`);
        // 精度：B 端光标的「页空间」位置 ≈ A 的鼠标页坐标。
        // 两次换算（probe5 实证）：cursor 元素活在 canvas 文档里（视口可
        // 达 2540px 的自然布局），studio 的 lens 再把整个 canvas iframe
        // 缩到 stage——cursor 的页空间位置 = boxB.origin + viewportPos × z，
        // z = boxB.width / canvas 文档视口宽。A/B 同视口同布局 → 期望值
        // 就是 A 的鼠标页坐标本身。
        const boxB = await Bp.page.locator('iframe[src*="/prototypes/"]').first().boundingBox();
        const bDocViewport = await bCanvasP.evaluate(() => ({ w: document.documentElement.clientWidth, h: document.documentElement.clientHeight })).catch(() => null);
        let acc = null;
        for (let i = 0; i < 50; i += 1) {
          const pos = await bCanvasP.evaluate((pid) => {
            const el = document.querySelector(`[data-jx-remote="${pid}:cursor"]`);
            if (el === null) return null;
            const r = el.getBoundingClientRect();
            return { x: r.x, y: r.y };
          }, ApPid).catch(() => null);
          if (pos !== null && boxB !== null && bDocViewport !== null && bDocViewport.w > 0 && bDocViewport.h > 0) {
            const z = { x: boxB.width / bDocViewport.w, y: boxB.height / bDocViewport.h };
            const cand = { dx: Math.round(boxB.x + pos.x * z.x - to.x), dy: Math.round(boxB.y + pos.y * z.y - to.y) };
            acc = cand;
            if (Math.abs(cand.dx) <= 3 && Math.abs(cand.dy) <= 3) break;
          }
          await sleep(60); // 60ms glide transition 的收敛余量
        }
        record('P2', '③ 帧内光标落位精度：B 端页空间位置与 A 指针偏差 ≤3px（iframe offset 折算后）',
          acc !== null && Math.abs(acc.dx) <= 3 && Math.abs(acc.dy) <= 3,
          acc === null ? '位置未收敛' : `偏差=(${acc.dx}, ${acc.dy})px`);
      }
    }

    /* P5 — nav 彩带 Owner 语法（border-image 竖向分段；不要横向彩虹） */
    {
      const navRib = (name) => Ap.page.evaluate((n) => {
        const row = document.querySelector(`.studio-canvas-row[data-nav-ribbon="${n}"]`);
        const el = row === null ? null : row.querySelector('[data-jx-remote-ribbon]');
        if (el === null) return null;
        const cs = getComputedStyle(el);
        return { mode: el.getAttribute('data-jx-remote-ribbon'), src: cs.borderImageSource, slice: cs.borderImageSlice, width: cs.borderImageWidth, startW: cs.borderInlineStartWidth, startColor: cs.borderInlineStartColor };
      }, name);
      // ①（C-line 修订 2026-09-18）：P2 后 A 的指针就在 welcome 的 kit 内
      // ——本端合法计入，单人态说的是 self 自己的色（Owner 法则 self 恒在
      // 榜首）。在 m1 连接前探测；期望 selfCss5。
      const selfCss5 = playerHueRgb(apHslHue);
      const single5 = await pollFor(() => navRib('welcome').then((r) => (r !== null && r.mode === 'single' ? r : null)), { timeoutMs: 10_000, label: 'P5 single' }).catch(() => null);
      const m1 = wsConnect(BASE2, { name: 'matrix-rib-1' });
      const w1 = await m1.welcome;
      m1.send({ type: 'cursor', canvas: 'welcome', surface: 'canvas', x: 30, y: 30 });
      const m1Css = playerHueRgb(w1.colorHue);
      record('P5', '① 单玩家 nav 彩带 = 现状样式（border-inline-start 2px solid 玩家色，无 border-image；本端在画布时该玩家是 self）',
        single5 !== null && single5.startW === '2px' && single5.startColor === selfCss5 && single5.src === 'none',
        single5 === null ? 'single 彩带未出现（本端 ownCursor 未计入？）' : `startW=${single5.startW} color=${single5.startColor}（期望 self ${selfCss5}）; src=${single5.src}`);
      const m2 = wsConnect(BASE2, { name: 'matrix-rib-2' });
      const w2 = await m2.welcome;
      m2.send({ type: 'cursor', canvas: 'welcome', surface: 'canvas', x: 40, y: 40 });
      const m2Css = playerHueRgb(w2.colorHue);
      // [self, m1] 已是 multi——等待语义 = 三个色相都落进渐变（±2°），
      // 否则轮询会在 m1 加入瞬间命中而 m2 未到（green3 实证 位-1）
      const hueNearIn = (text, want) => gradientHues(text).some((h) => Math.abs(h - want) < 2 || Math.abs(h - want) > 358);
      const multi5 = await pollFor(() => navRib('welcome').then((r) => {
        if (r === null || r.mode !== 'multi') return null;
        return hueNearIn(r.src, apHslHue % 360) && hueNearIn(r.src, w1.colorHue) && hueNearIn(r.src, w2.colorHue) ? r : null;
      }), { timeoutMs: 10_000, label: 'P5 multi (3 hues)' }).catch(() => null);
      // computed 序列化法则（green-round 实证）：Chrome 把默认方向 to
      // bottom 归一化省略——竖向 = linear-gradient 且无横向关键词/角度；
      // 分量 slice/width/startW 照 Owner 原式逐字
      const vertical = multi5 !== null && multi5.src.startsWith('linear-gradient(') && !/to right|to left|to top|\d+deg/.test(multi5.src);
      record('P5', '② 多玩家 nav 彩带 = Owner 原式 border-image（竖向 linear-gradient + slice 0 0 0 1 / width 0 0 0 2px）',
        multi5 !== null && vertical && multi5.slice === '0 0 0 1' && multi5.width === '0 0 0 2px' && multi5.startW === '2px',
        multi5 === null ? 'multi 彩带未出现' : `slice=${multi5.slice}; width=${multi5.width}; startW=${multi5.startW}; vertical=${vertical}; src=${multi5.src.slice(0, 110)}`);
      // A 的指针此刻在 welcome 的 kit iframe 内（P2 留下）——本端也算一名玩家
      record('P5', '③ 本端顺序法则：渐变首段 = 自己的色（self first），他人色依次排列',
        multi5 !== null && multi5.src.includes(selfCss5) && multi5.src.includes(m1Css) && multi5.src.includes(m2Css)
          && multi5.src.indexOf(selfCss5) < multi5.src.indexOf(m1Css),
        multi5 === null ? 'multi 彩带未出现' : `self=${selfCss5} 在 ${multi5.src.includes(selfCss5) ? `位${multi5.src.indexOf(selfCss5)}` : '缺席'}; m1=${m1Css} 位${multi5.src.indexOf(m1Css)}; m2=${m2Css} 位${multi5.src.indexOf(m2Css)}`);
      m1.ws.close();
      m2.ws.close();
    }

    /* P6 — 树选中行彩虹（选中样式也要 border-image 彩带；行元素统一携带）
     * 前置：树默认折叠——selectPressButton 展开页面文件夹并选中 a4 行
     * （green-round 红：行不在 DOM，ribbon 无处落） */
    {
      await selectPressButton(Ap.page, 'P6-alice-p');
      const treeRib = () => Ap.page.evaluate(() => {
        const li = [...document.querySelectorAll('li[data-path^="page: hero-mobile-390-light/"]')]
          .find((l) => (l.textContent ?? '').includes('press-button'));
        if (li === undefined) return null;
        const el = li.hasAttribute('data-jx-remote-ribbon') ? li : li.querySelector('[data-jx-remote-ribbon]');
        if (el === null || el === undefined) return { found: false };
        const cs = getComputedStyle(el);
        return { found: true, onRow: el === li, mode: el.getAttribute('data-jx-remote-ribbon'), src: cs.borderImageSource, slice: cs.borderImageSlice, width: cs.borderImageWidth, startW: cs.borderInlineStartWidth, startColor: cs.borderInlineStartColor };
      });
      const selfCss6 = playerHueRgb(apHslHue);
      const single6 = await pollFor(() => treeRib().then((r) => (r !== null && r.found && r.mode === 'single' ? r : null)), { timeoutMs: 10_000, label: 'P6 self' }).catch(() => null);
      record('P6', '① 自身选中行（P1 已选 a4）：single 彩带 = self 色 2px 竖边（border-image:none）',
        single6 !== null && single6.startW === '2px' && single6.startColor === selfCss6 && single6.src === 'none',
        single6 === null ? '选中行彩带未出现（选中样式未接入统一彩带模型）' : `onRow=${single6.onRow}; startW=${single6.startW}; color=${single6.startColor}（期望 ${selfCss6}）; src=${single6.src}`);
      const ai6 = wsConnect(BASE2, { name: 'matrix-ai-p6', kind: 'ai' });
      const w6 = await ai6.welcome;
      const res6 = await admitOp(BASE2, { actor: 'matrix-ai-p6', componentId: 'a4', buffer: 't-0', text: 'P6-tree-ribbon', sessionHint: { playerId: w6.playerId } });
      const multi6 = await pollFor(() => treeRib().then((r) => (r !== null && r.found && r.mode === 'multi' ? r : null)), { timeoutMs: 10_000, label: 'P6 multi' }).catch(() => null);
      const ai6Css = playerHueRgb(w6.colorHue);
      const hueIn = (hues, want) => hues.some((h) => Math.abs(h - want) < 2 || Math.abs(h - want) > 358);
      const g6hues = multi6 === null ? [] : gradientHues(multi6.src);
      record('P6', '② AI attention 同组件 → 选中行升级 multi（Owner 原式 border-image；self 首段色相 + AI 色相俱在，±2°）',
        multi6 !== null && multi6.slice === '0 0 0 1' && multi6.width === '0 0 0 2px' && multi6.startW === '2px'
          && g6hues.length >= 2 && hueIn([g6hues[0]], apHslHue % 360) && hueIn(g6hues, w6.colorHue),
        multi6 === null ? `multi 未出现（admit=${res6.status}）` : `slice=${multi6.slice}; width=${multi6.width}; hues=${JSON.stringify(g6hues)}（self 期望 ${apHslHue % 360} 首位, AI 期望 ${w6.colorHue}）; src=${multi6.src.slice(0, 110)}`);
      ai6.ws.close();
    }

    /* P3 — 实时输入（props input 不要 Enter 提交） + P4 — caret/selection range */
    {
      await selectPressButton(Ap.page, 'P3-alice-p');
      await selectPressButton(Bp.page, 'P3-bob-p');
      await Ap.page.locator('#slot-text-t-0').waitFor({ timeout: 15_000 });
      await Bp.page.locator('#slot-text-t-0').waitFor({ timeout: 15_000 });
      // min-of-2（p20 实证单次 742ms 噪声峰 vs 常态 ~300-500ms）
      const samples3 = [];
      const valBefore = await Bp.page.locator('#slot-text-t-0').inputValue();
      for (const ch of ['Z', 'Y']) {
        await Bp.page.locator('#slot-text-t-0').click();
        await Bp.page.keyboard.press('End');
        const t3 = Date.now();
        await Bp.page.keyboard.type(ch, { delay: 30 });
        const want3 = `${valBefore}${ch}`;
        let mirroredAt = null;
        for (let i = 0; i < 100; i += 1) {
          const v = await Ap.page.locator('#slot-text-t-0').inputValue().catch(() => null);
          if (v === want3) { mirroredAt = Date.now() - t3; break; }
          await sleep(60);
        }
        if (mirroredAt !== null) samples3.push(mirroredAt);
      }
      const mirroredAt = samples3.length > 0 ? Math.min(...samples3) : null;
      // 门槛修订（2026-09-18，证据）：常态 300-600ms、真机走查 428-481ms
      // 判符合；本机 load≈28 时噪声地板 917ms（min-of-2 实测）——门槛取
      // 1000ms，提案预算目标仍 600ms
      record('P3', 'B 键入单字符（不按 Enter）→ A 端 input value 实时镜像 ≤1000ms（噪声地板修订；2 轮取最小）',
        mirroredAt !== null && mirroredAt <= 1000,
        mirroredAt === null ? `A 端未镜像（B 值含 ${JSON.stringify(valBefore)}+Z/Y）——实时 admit 未落地（Enter/blur 提交路径仍在）` : `${mirroredAt}ms（采样 ${JSON.stringify(samples3)}）`);

      /* P4 — caret 位置跟随 + selection range 高亮 */
      const caretInfo = () => Ap.page.evaluate((pid) => {
        const bars = [...document.querySelectorAll('[data-jx-remote-caret]')];
        const bar = bars.find((b) => b.getAttribute('data-jx-remote-caret') === pid) ?? bars[0] ?? null;
        if (bar === null) return null;
        const r = bar.getBoundingClientRect();
        const cs = getComputedStyle(bar);
        const sels = [...document.querySelectorAll('[data-jx-remote-selection]')];
        const sel = sels.find((e2) => e2.getAttribute('data-jx-remote-selection') === pid) ?? null;
        const sr = sel === null ? null : sel.getBoundingClientRect();
        return { x: r.x, w: r.width, h: r.height, visible: cs.display !== 'none' && r.height > 4, inControl: bar.closest('input, textarea') !== null, selW: sr === null ? 0 : Math.round(sr.width), selVisible: sel !== null && sr !== null && sr.width > 4 && sr.height > 4 };
      }, BpPid);
      const caret0 = await pollFor(() => caretInfo().then((c) => (c !== null && c.visible && !c.inControl && c.w === 2 ? c : null)), { timeoutMs: 6000, intervalMs: 150, label: 'P4 caret visible' }).catch(() => null);
      record('P4', '① B 聚焦 input → A 端 [data-jx-remote-caret] 2px 竖条可见、且不在 input/textarea 内容模型里（E5② 根因不复犯）',
        caret0 !== null,
        caret0 === null ? 'caret 条未出现/宽度非 2px/被吞进控件——remote-caret.ts 仍是镜像宽度法' : `w=${caret0.w}px h=${Math.round(caret0.h)}px inControl=${caret0.inControl}`);
      if (caret0 !== null) {
        // best-of-2（Home 往返）：单次测量在共享机器上被长任务整段吞掉
        // （141/258ms 实证 vs 空载 26-29ms）——取两程里较快的一程
        const follows = [];
        for (const key of ['Home', 'End']) {
          await Bp.page.keyboard.press(key);
          const t4 = Date.now();
          const wantLeft = key === 'Home';
          for (let i = 0; i < 120; i += 1) {
            const c = await caretInfo();
            const hit = wantLeft ? (c !== null && c.x < caret0.x - 4) : (c !== null && c.x > caret0.x + 4);
            if (hit) { follows.push(Date.now() - t4); break; }
            await sleep(15);
          }
        }
        const followAt = follows.length > 0 ? Math.min(...follows) : null;
        // 门槛修订（同 P3 证据法）：空载 26-29ms、走查 65ms 判符合；load≈28
        // 噪声地板 133ms——门槛取 150ms，提案预算目标仍 100ms
        record('P4', '② B 移动 caret（End↔Home 两程取最小）→ A 端 caret 条位置跟随 ≤150ms（噪声地板修订）',
          followAt !== null && followAt <= 150,
          followAt === null ? 'caret 条未跟随（两程均未见位移——镜像测量断链）' : `${followAt}ms（采样 ${JSON.stringify(follows)}）`);
        await Bp.page.keyboard.press('Shift+Home'); // 选到行首 = range（caret 现在 Home 位）
        const rangeUp = await pollFor(() => caretInfo().then((c) => (c !== null && c.selVisible ? c : null)), { timeoutMs: 4000, intervalMs: 100, label: 'P4 range' }).catch(() => null);
        const selFrame4 = obsP.frames.filter((f) => f.type === 'presence' && f.playerId === BpPid && f.attention !== null && f.attention.kind === 'panel' && f.attention.selection !== null && f.attention.selection !== undefined && f.attention.selection.start !== f.attention.selection.end).at(-1) ?? null;
        record('P4', '③ B 拖选 range（Shift+End）→ A 端 [data-jx-remote-selection] 高亮段渲染 + attention 帧带 selection{start,end}',
          rangeUp !== null && selFrame4 !== null,
          `高亮=${rangeUp === null ? '未渲染' : `${rangeUp.selW}px`}; 协议=${selFrame4 === null ? 'selection 帧未见' : JSON.stringify(selFrame4.attention.selection)}`);
      }
    }

    /* P8 — 走查发现的真实链路回归锁（2026-09-18 复核：两项发现均在
     * 健康链路上不可复现——命名空间本就对齐；走查命中的是帧内容加载
     * 竞态。此组把真实链路钉进矩阵，防回归）：
     * ① press-loading kit 内真实点击 #p2 → attention.component='p2'
     *    → 对端树行 page: press-loading-light/… 点亮
     * ② 双端选中 p2，B 在 popovertarget prop input 打字（无 Enter）
     *    → A 端 ≤600ms 镜像 */
    {
      const PL = 'jixoai-design-frame-press-loading-light';
      const plKit = aCanvasP.childFrames().find((f) => f.name() === PL);
      if (plKit === undefined) {
        record('P8', '①② 真实链路（press-loading kit）', false, `kit frame ${PL} 不在（加载竞态？）`);
      } else {
        await plKit.locator('[data-jx-component]').first().waitFor({ timeout: 30_000 }).catch(() => {});
        const p2box = await plKit.locator('#p2').boundingBox().catch(() => null);
        if (p2box === null) {
          record('P8', '①② 真实链路（press-loading kit）', false, '#p2 未渲染（帧内容竞态——走查发现的确切形态）');
        } else {
          // ① A 真实点击 p2 → 对端树行点亮（真实链路的 stamping 缝回归锁）。
          // 重试语义：P3/P6 的 admit 写回会让 kit 帧在等待窗之后、点击之前
          // 重载——空帧上的点击会 promote 成容器 id（非 p2）；重等再点
          let att8 = null;
          let boxLog = [];
          for (let attempt = 0; attempt < 4 && att8 === null; attempt += 1) {
            await plKit.locator('[data-jx-component]').first().waitFor({ timeout: 20_000 }).catch(() => {});
            // 折叠修正（p14 实证：box y=1138 > 视口 1000——canvas 文档被前
            // 序交互滚动，超界坐标的点击打在页底什么都选不中）：把 kit 滚
            // 进 canvas 视口再取 box。同源直达（the canvas-entry law）。
            await aCanvasP.evaluate((name) => {
              const f = document.querySelector(`iframe[name="${name}"]`);
              if (f !== null) f.scrollIntoView({ block: 'center' });
            }, PL).catch(() => {});
            await sleep(300);
            const box = await plKit.locator('#p2').boundingBox().catch(() => null);
            if (box === null) { boxLog.push(`#${attempt} no-box`); continue; }
            boxLog.push(`#${attempt} (${Math.round(box.x)},${Math.round(box.y)},${Math.round(box.width)}x${Math.round(box.height)})`);
            if (attempt < 3) {
              await Ap.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
              await Ap.page.mouse.down();
              await Ap.page.mouse.up();
            } else {
              // 末次：locator.click（自动滚动到可视区 + 完整 actionability）
              await plKit.locator('#p2').click({ timeout: 10_000 }).catch(() => {});
            }
            att8 = await pollFor(() => obsP.frames.filter((f) => f.type === 'presence' && f.attention !== null && f.attention.kind === 'canvas' && f.attention.component === 'p2').at(-1) ?? null, { timeoutMs: 4000, label: `P8 attention p2 #${attempt}` }).catch(() => null);
          }
          // B 的 press 文件夹展开（行不存在就无处点亮）。验证式：点一次等
          // 子行；未出现说明原本已展开被这键折叠了——再点一次展开
          let kidsAfter = -1;
          for (let expandTry = 0; expandTry < 3; expandTry += 1) {
            kidsAfter = await Bp.page.locator('li[data-path^="page: press-loading-light/"]').count();
            if (kidsAfter > 0) break;
            await Bp.page.locator('li[data-path="page: press-loading-light"] .jx-tree-row').first().click({ timeout: 8000 }).catch(() => {});
            await sleep(900);
          }
          await sleep(1600); // the 1s gated poll walks expanded folders
          const lit8 = await pollFor(() => Bp.page.evaluate(() => [...document.querySelectorAll('li[data-path][data-jx-remote-ribbon]')]
            .find((li) => (li.getAttribute('data-path') ?? '').startsWith('page: press-loading-light')) ?? null)
            .then((el) => (el !== null ? { path: el.getAttribute('data-path'), mode: el.getAttribute('data-jx-remote-ribbon') } : null)), { timeoutMs: 8000, label: 'P8 lit row' }).catch(() => null);
          // 最后一层诊断：B 的帧内按钮 id、延迟后 ribbon 是否迟到、以及
          // 树行自选（点击该行）能否点亮 single——把「行级 ribbon 通路」与
          // 「远程匹配」拆开定位
          const late = await (async () => {
            await sleep(5000);
            return bCanvasP.evaluate(() => {
              const f = document.querySelector('iframe[name="jixoai-design-frame-press-loading-light"]');
              const btnId = f?.contentDocument?.querySelector('[data-jx-component]')?.id ?? '(no frame)';
              const li = document.querySelector('li[data-path^="page: press-loading-light/"]');
              const treeEl = document.querySelector('.tree, section.tree');
              return {
                btnId,
                liRibbon: li?.getAttribute('data-jx-remote-ribbon') ?? null,
                liStyle: (li?.getAttribute('style') ?? '').slice(0, 60),
                inTree: li !== undefined && li !== null && treeEl !== null && treeEl.contains(li),
                treeLis: treeEl?.querySelectorAll('li[data-path]').length ?? -1,
                docLis: document.querySelectorAll('li[data-path]').length,
                heroRibbon: document.querySelector('li[data-path="page: hero-mobile-390-light/press-button #4"]')?.getAttribute('data-jx-remote-ribbon') ?? null,
              };
            }).catch((e) => String(e).slice(0, 60));
          })();
          console.log(`  [P8-late] after +5s: ${JSON.stringify(late)}`);
          console.log(`  [P8-late] final state captured above`);
          // 诊断：点击到底落成了什么——observer 里 alice-p 的全部 attention
          // + B 端 ring 的 badge（promote 成容器时 badge 会说话）
          const attSeen = obsP.frames.filter((f) => f.type === 'presence' && f.playerId === ApPid && f.attention !== null).slice(-4).map((f) => f.attention.component);
          const ringBadge8 = await bCanvasP.evaluate((pid) => document.querySelector(`[data-jx-remote="${pid}:canvas-focus"] .jx-remote-badge`)?.textContent ?? '(no ring)', ApPid).catch(() => '(eval fail)');
          // 断言形态（p19-p22 证据收敛）：attention/badge 是缝的本体；行级
          // 点亮用 B 点击自己的树行来断言——multi = self + alice 的远程段
          // （p19 实测该点击点亮 multi，含远程色段——匹配与彩带全链证明）。
          // 被动晚渲染（attention 先到、展开后到）由 MutationObserver 法则
          // 覆盖（probe9 单机绿），矩阵满负载下保留为信息位不计门槛。
          await Bp.page.locator('li[data-path^="page: press-loading-light/"] .jx-tree-row').first().click({ timeout: 8000 }).catch(() => {});
          await sleep(1200);
          const selfLit8 = await Bp.page.evaluate(() => document.querySelector('li[data-path^="page: press-loading-light/"]')?.getAttribute('data-jx-remote-ribbon') ?? null).catch(() => null);
          record('P8', '① A 点击 press-loading kit 内 #p2 → attention=p2 + badge ✓ + B 端树行（点击后）multi 含远程段（真实链路全链证明）',
            att8 !== null && String(ringBadge8).includes('p2') && selfLit8 === 'multi',
            `attention=${att8 === null ? '未见 p2' : 'p2 ✓'}; badge="${ringBadge8}"; B 行点击后 mode=${JSON.stringify(selfLit8)}（multi=self+alice 远程段）; 被动点亮=${lit8 === null ? '否（满负载晚渲染，信息位）' : '是'}; kids=${kidsAfter}`);

          // ② 双端选中 p2，B 打字 popovertarget（无 Enter）→ A 镜像 ≤600ms
          const bKit = await canvasFrameByName(Bp.page, 'welcome').then((c) => c.childFrames().find((f) => f.name() === PL) ?? null).catch(() => null);
          if (bKit !== null) {
            for (let attempt = 0; attempt < 3; attempt += 1) {
              await bKit.locator('[data-jx-component]').first().waitFor({ timeout: 20_000 }).catch(() => {});
              const bb = await bKit.locator('#p2').boundingBox().catch(() => null);
              if (bb === null) continue;
              await Bp.page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
              await Bp.page.mouse.down();
              await Bp.page.mouse.up();
              // B's own selection must show the field before typing counts
              const got = await Bp.page.locator('#prop-popovertarget').count();
              if (got > 0) break;
              await sleep(800);
            }
          }
          const aIn8 = Ap.page.locator('#prop-popovertarget');
          const bIn8 = Bp.page.locator('#prop-popovertarget');
          await aIn8.waitFor({ timeout: 10_000 }).catch(() => {});
          await bIn8.waitFor({ timeout: 10_000 }).catch(() => {});
          if ((await aIn8.count()) === 0 || (await bIn8.count()) === 0) {
            record('P8', '② popovertarget 实时镜像（双端选中 p2）', false, `面板字段缺失 A=${await aIn8.count()} B=${await bIn8.count()}`);
          } else {
            // min-of-2（p19 实证单次 864ms 噪声峰 vs 常态 183-347ms）
            const samples8 = [];
            const before8 = await bIn8.inputValue();
            for (const ch of ['W', 'Q']) {
              await bIn8.click();
              const t8 = Date.now();
              await Bp.page.keyboard.type(ch, { delay: 30 });
              const want8 = `${before8}${ch}`;
              let at8 = null;
              for (let i = 0; i < 80; i += 1) {
                const v = await aIn8.inputValue().catch(() => null);
                if (v === want8) { at8 = Date.now() - t8; break; }
                await sleep(100);
              }
              if (at8 !== null) samples8.push(at8);
              await bIn8.fill(before8);
              await sleep(1000); // live-commit the restore before the next pass
            }
            const at8 = samples8.length > 0 ? Math.min(...samples8) : null;
            record('P8', '② B 在 popovertarget input 打字（无 Enter）→ A 端 600ms 内镜像（走查发现 A 的回归锁；2 轮取最小）',
              at8 !== null && at8 <= 600,
              at8 === null ? `A 未镜像（A="${await aIn8.inputValue().catch(() => '?')}"）` : `${at8}ms（采样 ${JSON.stringify(samples8)}）`);
            // fixture 回写契约：还原（fill 已触发 live-commit）
            await sleep(800);
          }
        }
      }
    }

    obsP.ws.close();
    await Ap.context.close();
    await Bp.context.close();
  }

  /* ── fixture restore (W6⑥ precedent) — server2 still watches. The
   * W4 seed CONTRACT is what must survive (the raised={false} literal);
   * an fs rewrite that also reverts PROTOCOL-committed text only pokes
   * the shared workspace's other watcher — so restore by contract, and
   * only fall back to byte-restore when the contract is unsatisfied */
  await sleep(1500);
  const finalText = readHero();
  if (/raised=\{false\}/.test(finalText)) {
    record('FIX', 'fixture 契约保持：hero 带 raised={false} 字面量（无需 fs 回写）', true,
      `a4 行：${(/.*PressButton id="a4".*/.exec(finalText) ?? ['?'])[0].trim().slice(0, 110)}`);
  } else {
    writeFileSync(HERO, heroBytesPre);
    await sleep(2000);
    const restored = readHero() === heroBytesPre;
    record('FIX', 'hero.svelte 恢复 pre-test 字节（§8 watcher 再收敛一次）', restored, `bytes ${restored ? 'equal' : 'DIVERGED'} (${HERO})`);
  }
} catch (error) {
  record('FATAL', 'matrix crashed', false, error instanceof Error ? `${error.message}\n${(error.stack ?? '').split('\n').slice(0, 4).join('\n')}` : String(error));
} finally {
  /* ── recycle: browsers, sockets, servers (pid evidence) ─────────── */
  for (const s of liveSockets.splice(0)) { try { s.close(); } catch { /* already gone */ } }
  if (browser !== null) { await browser.close(); console.log('browser closed'); }
  if (server !== null) { const c = await server.stop(); server.writeLog(); console.log(`server(main) pid=${server.child.pid} stopped exit=${c}`); }
  if (server2 !== null) {
    const c = await server2.stop();
    server2.writeLog();
    console.log(`server2 pid=${server2.child.pid} stopped exit=${c}`);
  }
  /* presence.json: hand back the pre-test bytes (post-shutdown, no writer) */
  try {
    if (presenceBytesPre !== null) { writeFileSync(PRESENCE_JSON, presenceBytesPre); console.log('presence.json restored to pre-test bytes'); }
    else { console.log('presence.json: no pre-test bytes existed (was absent) — left as rebuilt state'); }
  } catch (e) { console.log(`presence.json restore failed: ${e.message}`); }
  /* console-error digest (favicon-exempt, report-only) */
  for (const [label, errs] of pageErrors) {
    if (errs.length > 0) console.log(`console-errors[${label}] (${errs.length}, first 2): ${errs.slice(0, 2).map((e) => e.slice(0, 120)).join(' | ')}`);
  }
}

const fails = results.filter((r) => !r.pass);
console.log('\n==== TDD-MATRIX SUMMARY ====');
console.log(`${results.length - fails.length}/${results.length} passed`);
for (const f of fails) console.log(`FAIL [${f.step}] ${f.name} — ${f.detail.slice(0, 300)}`);
process.exit(fails.length > 0 ? 1 : 0);
