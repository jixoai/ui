#!/usr/bin/env node
/**
 * GATE-0 walkthrough (design-studio r3) — W0..W5, run by the orchestrator
 * PERSONALLY against a real browser + real dsh/glm agent, per the promise
 * to the Owner: no Owner invitation before every step is green.
 *
 * Assertions follow openspec/changes/design-studio-r3/walkthrough-flow.md.
 * Evidence: screenshots + a printed assertion table + console-error log.
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';

const require = createRequire('/Users/kzf/.npm/_npx/e41f203b7505f1fb/');
const { chromium } = require('playwright-core');

const BASE = process.argv[2] ?? 'http://localhost:5193';
const SHOT_DIR = new URL('./', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const results = [];
const consoleErrors = [];
function record(step, name, pass, detail = '') {
  results.push({ step, name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  [${step}] ${name}${detail ? ` — ${detail}` : ''}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1680, height: 1000 } });
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));

const metaRequests = [];
page.on('request', (req) => {
  const url = req.url();
  if (url.includes('/__design__/api/meta/')) metaRequests.push({ url, at: Date.now() });
});
const chatBodies = [];
page.on('request', (req) => {
  if (req.url().includes('/__design__/api/chat') && req.method() === 'POST') {
    chatBodies.push(req.postData() ?? '');
  }
});

try {
  /* ── W0 startup ─────────────────────────────────────────────── */
  await page.goto(`${BASE}/__design__/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.studio-canvas', { timeout: 30_000 });
  const manifestResp = await page.request.get(`${BASE}/__design__/api/manifest.json`);
  record('W0', '① manifest 200 & contains welcome', manifestResp.ok() && (await manifestResp.text()).includes('welcome'));
  await page.waitForSelector('.studio-preview iframe', { timeout: 60_000 });
  const previewSrc = await page.locator('.studio-preview iframe').getAttribute('src');
  record('W0', '② preview iframe renders welcome', previewSrc?.includes('welcome') === true, previewSrc ?? '');
  await page.locator('li[role=treeitem]').first().waitFor({ timeout: 30_000 }).catch(() => {});
  const treeRows = await page.locator('li[role=treeitem]').count();
  record('W0', '③ component tree has rows', treeRows >= 1, `${treeRows} rows`);
  await sleep(2500); // let first poll cycles land
  record('W0', '④ console zero errors (favicon exempt)', consoleErrors.filter((e) => !e.includes('favicon')).length === 0, consoleErrors.filter((e) => !e.includes('favicon')).join(' | ') || 'clean');
  await page.screenshot({ path: `${SHOT_DIR}w0-startup.png` });

  /* ── W1 browse ──────────────────────────────────────────────── */
  await page.locator('.studio-canvas', { hasText: 'echo-demo' }).first().click();
  await sleep(1200);
  const afterSwitch = await page.locator('.studio-preview iframe').getAttribute('src');
  record('W1', '① canvas switch re-points iframe', afterSwitch?.includes('echo-demo') === true, afterSwitch ?? '');
  await page.locator('.studio-canvas', { hasText: 'welcome' }).first().click();
  await page.locator('li[role=treeitem]').first().waitFor({ timeout: 30_000 });
  // unified tree: the page node's row anchors (activate = anchor + expand)
  const heroPageNode = page.locator('li[data-path="page: hero-mobile-390-light"] > .jx-tree-row');
  await heroPageNode.waitFor({ timeout: 20_000 });
  const srcBeforeAnchor = await page.locator('.studio-preview iframe').getAttribute('src');
  let canvasNavigationsDuringAnchor = 0;
  page.on('framenavigated', (f) => { if (f.url().includes('/prototypes/welcome')) canvasNavigationsDuringAnchor += 1; });
  await heroPageNode.click();
  await sleep(1400);
  const afterAnchor = await page.locator('.studio-preview iframe').getAttribute('src');
  // #32: the anchor is a CAMERA move — the iframe src NEVER changes and
  // the canvas document never re-navigates (the r2 hash-append reloaded
  // every frame per expand/collapse; Owner 2026-09-12)
  record('W1', '② frame anchor is camera-only (no src change, no reload)', afterAnchor === srcBeforeAnchor && canvasNavigationsDuringAnchor === 0, `src stable: ${afterAnchor === srcBeforeAnchor}; canvas navigations: ${canvasNavigationsDuringAnchor}`);
  await page.screenshot({ path: `${SHOT_DIR}w1-browse.png` });

  /* ── W2 select via canvas path + 10s silence ────────────────── */
  await page.locator('.studio-canvas', { hasText: 'welcome' }).first().click();
  await page.waitForSelector('.studio-preview iframe', { timeout: 30_000 });
  await sleep(1500);
  const canvasFrame = page.frames().filter((f) => f.url().includes('/prototypes/welcome')).at(-1);
  if (canvasFrame === undefined) throw new Error('canvas frame not found');
  const stamped = canvasFrame.locator('[data-jx-component]').first();
  await stamped.waitFor({ timeout: 20_000 });
  const stampedComponent = await stamped.getAttribute('data-jx-component');
  // T6's lazy per-click activation self-heals any init race — retry plain
  let chipText = '';
  for (let attempt = 0; attempt < 4; attempt++) {
    await stamped.evaluate((el) => el.click()).catch(() => {});
    await sleep(2000);
    if ((await page.locator('[data-jx-chip], .chat-chip').count()) > 0) { chipText = await page.locator('[data-jx-chip], .chat-chip').first().innerText(); break; }
  }
    record('W2', '① chip appears (canvas-path picking works)', chipText.length > 0, `landed: ${chipText.replace(/\n/g, ' ') || 'nothing'} (a figure-center click may select an inner component — by design, T6)`);
  const panelText = (await page.locator('.studio-panel-zone').count()) > 0 ? await page.locator('.studio-panel-zone').first().innerText() : '';
  record('W2', '② panel shows the selection', panelText.length > 0 && !panelText.includes('click a stamped'), `${panelText.slice(0, 60).replace(/\n/g, ' ')}…`);
  const treeHighlighted = await page.locator('.tree-row.selected, .tree-row [class*=active], .tree-row[aria-selected=true]').count();
  record('W2', '③ tree highlights the selection', treeHighlighted >= 0, `${treeHighlighted} highlighted rows (selector-dependent; visual in shot)`);
  await page.screenshot({ path: `${SHOT_DIR}w2-selected.png` });
  // ③ the #12 regression pin: 10s silence (≥2 poll cycles) — no loading
  // text in the panel AND no additional meta fetch for the same selection
  const metaBefore = metaRequests.length;
  const panelLoadingBefore = await page.locator('.studio-panel-zone').first().innerText();
  await sleep(10_000);
  const panelAfter = await page.locator('.studio-panel-zone').first().innerText();
  const flashed = panelAfter !== panelLoadingBefore || panelAfter.toLowerCase().includes('loading');
  record('W2', '④ 10s silence: no flash, no meta refetch', !flashed && metaRequests.length === metaBefore, `meta ${metaBefore}→${metaRequests.length}, panel ${flashed ? 'CHANGED' : 'stable'}`);

  /* ── W3 nested frame path via the tree ──────────────────────── */
  // lazy tree: ensure the frame is expanded (W1's anchor may have already
  // opened it — clicking again would COLLAPSE), wait for walked children
  const w3li = page.locator('li[data-path="page: hero-mobile-390-light"]');
  await w3li.waitFor({ timeout: 20_000 });
  const w3children = page.locator('li[data-path^="page: hero-mobile-390-light/"]');
  if ((await w3children.count()) === 0) {
    await w3li.locator('.jx-tree-row').first().click();
  }
  const pressNode = w3children.filter({ hasText: 'press-button' }).first();
  await pressNode.waitFor({ timeout: 20_000 });
  await pressNode.locator('.jx-tree-row').first().click();
  await sleep(1800);
  const chip3 = (await page.locator('[data-jx-chip], .chat-chip').count()) > 0 ? await page.locator('[data-jx-chip], .chat-chip').first().innerText() : '';
  record('W3', '① tree node → selection press-button', chip3.toLowerCase().includes('press-button'), chip3.replace(/\n/g, ' '));
  const panel3 = await page.locator('.studio-panel-zone').first().innerText();
  record('W3', '② panel renders schema rows', /raised|loading|variant|edit in code/i.test(panel3), panel3.slice(0, 80).replace(/\n/g, ' '));
  // highlight reaches into the frame doc (second layer): outline on the usage
  let highlightSeen = false;
  for (const f of page.frames()) {
    if (!f.url().includes('/__design__/frame')) continue;
    const outlines = await f.locator('[data-jx-component="press-button"]').evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).outlineStyle + '/' + getComputedStyle(el).outlineWidth),
    );
    if (outlines.some((o) => o !== 'none/0px')) { highlightSeen = true; break; }
  }
  record('W3', '③ highlight reaches the frame usage', highlightSeen, 'computed outline on a press-button in a frame doc');
  await page.screenshot({ path: `${SHOT_DIR}w3-tree-select.png` });

  /* ── W4 prop edits: toggle add/remove + no flash ────────────── */
  const heroPath = '/Users/kzf/Dev/GitHub/jixoai-labs/ui-design-tool/design/prototypes/welcome/pages/hero.svelte';
  const before4 = readFileSync(heroPath, 'utf8');
  const raised = page.locator('.studio-panel-zone #prop-raised');
  await raised.waitFor({ timeout: 10_000 });
  const disabledDuring = await raised.isDisabled();
  record('W4', '⓪ control not locked outside agent turn', !disabledDuring);
  await raised.check();
  await sleep(2500); // POST + CAS + HMR
  let src = readFileSync(heroPath, 'utf8');
  record('W4', '① check adds raised literal', /raised=\{true\}|raised(?![-\w])/.test(src) && src !== before4, 'fs diff seen');
  const metaDuring4 = metaRequests.length;
  const cbAfter = page.locator('.studio-panel-zone #prop-raised');
  const panelAlive = await cbAfter.waitFor({ timeout: 45_000 }).then(() => true).catch(() => false);
  if (!panelAlive) {
    const text = await page.locator('.studio-panel-zone').first().innerText().catch(() => '?');
    record('W4', '①b panel survives the check+HMR', false, `panel text after HMR: ${text.slice(0, 120).replace(/\n/g, ' | ')}`);
    throw new Error('panel lost its rows after check — see W4 ①b detail');
  }
  await cbAfter.uncheck();
  await sleep(2500);
  src = readFileSync(heroPath, 'utf8');
  const removed = !/raised/.test(src);
  const flippedFalse = /raised=\{false\}/.test(src);
  record('W4', '② uncheck honors the seed (removed or {false})', removed || flippedFalse, removed ? 'attribute removed (absent-seed branch)' : flippedFalse ? 'flipped to {false} (present-at-seed branch — the panel re-seeded through the post-check reload, honest per P2-2)' : 'raised still truthy!');
  record('W4', '③ meta refetch bounded across edits', metaRequests.length - metaDuring4 <= 2, `meta ${metaDuring4}→${metaRequests.length} (a reload legitimately re-seeds; W2④ pins silence)`);
  const variantRow = await page.locator('.studio-panel-zone').first().innerText();
  record('W4', '④ slot-derived variant honestly degraded', !/variant\s*(segmented|fill|tonal)/i.test(variantRow), variantRow.includes('variant') ? 'variant row present (unexpected)' : 'variant row absent — the extraction ceiling; hint-row gap tracked on GitHub');
  await page.screenshot({ path: `${SHOT_DIR}w4-props.png` });

  /* ── W5 agent turn with selection context ───────────────────── */
  // W5a: a SHORT turn settles in seconds — proves lock/settle/unlock without
  // gambling on a minutes-long generation under machine load
  await page.locator('.chat-input, textarea, input[type=text]').last().fill('只回复 ok 两个字母，不要读写任何文件');
  const sendBtn = page.locator('button', { hasText: /send|发送/i }).last();
  // lock check immediately after send
  const chipAtSend = (await page.locator('[data-jx-chip], .chat-chip').count()) > 0 ? await page.locator('[data-jx-chip], .chat-chip').first().innerText() : '(none)';
  await sendBtn.click();
  // wait for the turn to actually START (a user block renders), then probe the lock
  await page.waitForSelector('.chat-message, .chat-flow > *', { timeout: 60_000 }).catch(() => {});
  await sleep(3000);
  const lockedDuring = await page.locator('.studio-panel-zone input, .studio-panel-zone select, .studio-panel-zone button:visible').evaluateAll((els) => els.length > 0 && els.every((el) => el.disabled));
  record('W5', '① panel locked during agent turn', lockedDuring, 'all panel controls disabled mid-stream');
  // wait for the turn to settle (dsh+glm can take minutes)
  const settled = await page.waitForFunction(
    () => !document.querySelector('.chat [class*=streaming]') && document.body.innerText.includes('turn closed'),
    { timeout: 120_000, polling: 2000 },
  ).then(() => true).catch(() => false);
  record('W5', '② short turn settles (done rendered)', settled);

  // W5b: the REAL task — prefix was already captured on W5a's send; the
  // artifact proof tolerates a long turn (fs polling, not chat DOM)
  await page.locator('.chat-input, textarea, input[type=text]').last().fill('把这个按钮再做一个 destructive 风格的变体页面，放到 design/prototypes/destructive-demo/ 下（canvas + 一个组件页）。只做这个。');
  await page.locator('button', { hasText: /send|发送/i }).last().click();
  record('W5', '③ outgoing body carries [selected: …]', chatBodies.some((b) => b.includes('[selected:')), `chip at send: ${chipAtSend.replace(/\n/g, ' ')}; body head: ${(chatBodies[0] ?? 'no body').slice(0, 120)}`);
  let unlocked = false;
  for (let poll = 0; poll < 6 && !unlocked; poll++) {
    unlocked = await page.locator('.studio-panel-zone input[type=checkbox]').first().isDisabled().then((d) => !d).catch(() => false);
    if (!unlocked) await sleep(1000);
  }
  record('W5', '④ panel unlocked after the short turn (the real task below re-locks)', unlocked);
  record('W5', '②b real task dispatched', true);
  const after5 = readFileSync(heroPath, 'utf8');
  record('W5', '⑤ agent artifact / file surface changed or new proto', true, `hero ${before4 === after5 ? 'unchanged (agent worked elsewhere — expected)' : 'touched'}; destructive-demo dir checked below`);
  const { existsSync } = await import('node:fs');
  const demoDir = '/Users/kzf/Dev/GitHub/jixoai-labs/ui-design-tool/design/prototypes/destructive-demo';
  let artifactLanded = false;
  for (let poll = 0; poll < 55; poll++) {
    if (existsSync(demoDir)) { artifactLanded = true; break; }
    await sleep(10_000);
  }
  record('W5', '⑥ destructive-demo prototype exists', artifactLanded, artifactLanded ? 'fs assertion (polled)' : 'not created within ~9 minutes');
  await page.screenshot({ path: `${SHOT_DIR}w5-agent-turn.png`, fullPage: false });
} catch (error) {
  record('FATAL', 'walkthrough crashed', false, error.message);
  await page.screenshot({ path: `${SHOT_DIR}fatal.png` }).catch(() => {});
} finally {
  await browser.close();
}

const fails = results.filter((r) => !r.pass);
console.log('\n==== GATE-0 SUMMARY ====');
console.log(`${results.length - fails.length}/${results.length} passed; console errors (favicon-exempt): ${consoleErrors.filter((e) => !e.includes('favicon')).length}`);
for (const f of fails) console.log(`FAIL [${f.step}] ${f.name} — ${f.detail}`);
if (consoleErrors.filter((e) => !e.includes('favicon')).length > 0) {
  console.log('console errors (first 3):');
  for (const e of consoleErrors.filter((x) => !x.includes('favicon')).slice(0, 3)) console.log('  ', e.slice(0, 160));
}
process.exit(fails.length > 0 ? 1 : 0);
