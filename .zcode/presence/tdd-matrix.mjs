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
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));
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
  const canvas = await canvasFrameOf(page);
  const kit = canvas.childFrames().find((f) => f.name() === frameName);
  if (kit === undefined) throw new Error(`kit frame ${frameName} not found`);
  await kit.waitForSelector('[data-jx-instance]', { timeout: 20_000 }).catch(() => {});
  return kit;
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
const overlapRatio = (a, b) => {
  if (a === null || b === null) return 0;
  const x1 = Math.max(a.x, b.x), y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w), y2 = Math.min(a.y + b.h, b.y + b.h);
  if (x2 <= x1 || y2 <= y1) return 0;
  const inter = (x2 - x1) * (y2 - y1);
  return inter / Math.min(a.w * a.h, b.w * b.h);
};

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
      // CAUTION (the known frame-entry gap, per the brief): the canvas
      // document contains NESTED kit iframes — a pointer INSIDE one
      // targets the kit document (events never cross frames), so the
      // canvas overlay only reports moves on canvas-doc GROUND (gaps,
      // padding, below-matrix). Scan an ordered right-down lattice of
      // points and keep the GROUND HITS (transform actually moved).
      const fracs = [[0.05, 0.08], [0.18, 0.22], [0.32, 0.38], [0.45, 0.5], [0.58, 0.62], [0.7, 0.74], [0.82, 0.85], [0.92, 0.94], [0.5, 0.9], [0.25, 0.95], [0.75, 0.92], [0.6, 0.45], [0.85, 0.6], [0.15, 0.75], [0.4, 0.15]];
      const hits = [];
      for (const [fx, fy] of fracs) {
        const x = iframeBox.x + iframeBox.width * fx;
        const y = iframeBox.y + iframeBox.height * fy;
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
        first === undefined ? `扫描 ${fracs.length} 点后仍无 ground 命中（指针均落入嵌套 kit iframe——帧内上报是已知缺口）` : `opacity=${first.opacity} transform=(${first.doc.x},${first.doc.y})（ground 命中 ${hits.length} 次）`);
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
        pair === null ? `ground 命中不足以构成右下移动对（${hits.length} 个命中）——其余点位落入嵌套 kit iframe（帧内光标上报为已知缺口，简报明示不测）` : `hit1 screen(${Math.round(pair[0].screen.x)},${Math.round(pair[0].screen.y)}) → doc(${pair[0].doc.x},${pair[0].doc.y}); hit2 screen(${Math.round(pair[1].screen.x)},${Math.round(pair[1].screen.y)}) → doc(${pair[1].doc.x},${pair[1].doc.y})`);
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
    /* E-group local helpers — the hsl→oklch law mirrored from
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
      const single = await pollFor(() => navRibbonOf('welcome').then((r) => (r !== null && r.mode === 'single' ? r : null)), { timeoutMs: 15_000, label: 'E3 single ribbon' }).catch(() => null);
      // the style ATTRIBUTE is browser-normalized: the template's
      // hsl(h, 85%, 45%) serializes back as rgb(r, g, b) — the fixture
      // compares against the SAME hsl→rgb law the chip probe uses
      const bvCss = playerHueRgb(bvHslHue);
      record('E3', '① B 在 welcome（cursor.canvas=welcome）→ A 端 nav welcome 行 single 彩带（B 色）',
        single !== null && single.style.includes(bvCss),
        single === null ? 'ribbon 未出现' : `mode=${single.mode}; style=${single.style.slice(0, 90)}; B 色=${bvCss}（hsl(${bvHslHue},85%,45%) 的规范化 rgb）`);
      // mock C：raw ws 人类连接，cursor 直接落在 welcome → multi 双色分段
      const cc = wsConnect(BASE2, { name: 'matrix-c' });
      const cw = await cc.welcome;
      cc.send({ type: 'cursor', canvas: 'welcome', surface: 'canvas', x: 220, y: 140 });
      const multi = await pollFor(() => navRibbonOf('welcome').then((r) => (r !== null && r.mode === 'multi' ? r : null)), { timeoutMs: 10_000, label: 'E3 multi ribbon' }).catch(() => null);
      const cCss = playerHueRgb(cw.colorHue);
      record('E3', '② mock C 加入（同 canvas）→ 同一行 multi 彩带（border-image 双色分段）',
        multi !== null && multi.style.includes('border-image') && multi.style.includes('linear-gradient') && multi.style.includes(bvCss) && multi.style.includes(cCss),
        multi === null ? 'multi ribbon 未出现' : `mode=${multi.mode}; C=${cw.playerId}@hue${cw.colorHue}; style=${multi.style.slice(0, 120)}`);
      cc.ws.close();
    }

    /* E4 — 树彩带（裁决 3：树行按 attention.componentId 归属） */
    {
      await selectPressButton(Av.page, 'E4-alice-v');
      const aiE = wsConnect(BASE2, { name: 'matrix-ai-e', kind: 'ai' });
      const aw = await aiE.welcome;
      await sleep(600);
      const res = await admitOp(BASE2, { actor: 'matrix-ai-e', componentId: 'a4', buffer: 't-0', text: 'E4-tree-ribbon', sessionHint: { playerId: aw.playerId } });
      const treeRow = await pollFor(() => Av.page.evaluate(() => [...document.querySelectorAll('span.tree-usage[data-jx-remote-ribbon]')]
        .map((el) => ({ who: el.getAttribute('data-jx-remote-ribbon'), text: el.textContent.replace(/\s+/g, ' ').trim().slice(0, 44) }))
        .find((r) => r.text.includes('press-button')) ?? null), { timeoutMs: 10_000, label: 'E4 tree ribbon' }).catch(() => null);
      record('E4', 'mock AI admit（componentId=a4, sessionHint playerId）→ A 端树 a4 行 [data-jx-remote-ribbon] 出现',
        treeRow !== null && (treeRow.who ?? '').includes(aw.playerId),
        `admit=${res.status}; AI=${aw.playerId}; 行=${treeRow === null ? '未出现' : `"${treeRow.text}" ribbon=${treeRow.who}`}`);
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
      const caretOk = attFrame !== null && attFrame.attention.field === 'slot-text-t-0' && typeof attFrame.attention.caret === 'number';
      record('E6', '① A 真实 focus input + 移动 caret → attention 帧带 field+caret（raw ws 观察）',
        caretOk,
        attFrame === null ? '未捕获 A 的 panel attention 帧' : `field=${attFrame.attention.field} caret=${attFrame.attention.caret} digest="${attFrame.attention.digest}"`);
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
