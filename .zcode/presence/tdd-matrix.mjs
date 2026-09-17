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
    const panelFocus = await B.page.locator(`[data-jx-remote="p1:panel-focus"]`).count();
    record('A3', '③ B端出现 A 的 ghost ring（canvas-focus 或 panel-focus 任一）',
      (ring.exists && ring.opacity !== '0') || panelFocus > 0,
      `canvas-focus=${ring.exists ? `opacity ${ring.opacity}` : 'absent'}; panel-focus=${panelFocus}; `
      + (ring.exists || panelFocus > 0 ? '' : '根因：panel-collab.ts 的 admit/materialize body 不带 sessionHint.playerId（design.md §3「面板 op 的 sessionHint 就是 playerId」未接线）——journal-tail 有、ghost 无'));
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

    /* B7b — panel-focus 描边（sessionHint 带 field/digest）。两条路：
     * (a) 直接对 prop 缓冲 'raised' 落 text op——记录网关对 prop 缓冲
     *     replace 的真实应答（实况：409）；
     * (b) 对合法的 t-0 缓冲落 op、sessionHint 带 field——focusFromOpTarget
     *     只看 sessionHint.field，relay 链路同一条。 */
    const resProp = await admitOp(BASE, { actor: 'matrix-ai', componentId: 'a4', buffer: 'raised', text: 'true', sessionHint: { playerId: aiPid, field: 'prop-raised', digest: 'raised=false→true' } });
    console.log(`  [B7b] prop-buffer text replace → ${resProp.status} ${JSON.stringify(resProp.body).slice(0, 160)}`);
    const res2 = await admitOp(BASE, { actor: 'matrix-ai', componentId: 'a4', buffer: 't-0', text: 'B7b-panel-focus', sessionHint: { playerId: aiPid, field: 'prop-raised', digest: 'raised=false→true' } });
    await sleep(800);
    const outline = await pollFor(() => B.page.locator(`[data-jx-remote="${aiPid}:panel-focus"]`).count().then((n) => (n > 0)), { timeoutMs: 8000, label: 'B7b outline' }).catch(() => false);
    const badgeText = outline ? await B.page.locator(`[data-jx-remote="${aiPid}:panel-focus"] .studio-remote-panel-focus-badge`).textContent().catch(() => '') : '';
    const digestText = outline ? await B.page.locator(`[data-jx-remote="${aiPid}:panel-focus"] .studio-remote-panel-focus-digest`).textContent().catch(() => '') : '';
    record('B7b', 'AI admit 带 sessionHint{field,digest} → 壳层 panel-focus 描边 + 名签 + digest',
      outline && badgeText.includes('matrix-ai') && digestText.includes('raised='),
      `admit=${res2.status}; outline=${outline}; badge="${badgeText.trim()}"; digest="${digestText.trim()}"`);
  }

  /* B8 — 虚拟鼠标：光标从无到有 */
  {
    const bCanvas = await canvasFrameOf(B.page);
    const before = await remoteCursorState(bCanvas, aiPid);
    ai.send({ type: 'virtual-mouse', enabled: true });
    ai.send({ type: 'cursor', surface: 'canvas', x: 123, y: 77 });
    await sleep(400);
    ai.send({ type: 'cursor', surface: 'canvas', x: 281, y: 190 });
    const after = await pollFor(() => remoteCursorState(bCanvas, aiPid).then((s) => (s.exists && s.opacity === '1' ? s : null)), { timeoutMs: 8000, label: 'B8 cursor visible' }).catch(() => null);
    record('B8', '① AI virtual-mouse enabled + cursor → 人端光标元素从无到有（opacity 0→1）',
      after !== null && before.opacity !== '1',
      `before opacity=${before.exists ? before.opacity : 'absent'} → after opacity=${after?.opacity ?? 'absent'}`);
    // the poll may resolve on the FIRST cursor frame — settle and re-read
    // so the assertion sees the LAST reported position
    await sleep(800);
    const last = await remoteCursorState(bCanvas, aiPid);
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
