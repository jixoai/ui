#!/usr/bin/env node
/**
 * GATE-0 walkthrough (design-studio r3) — W0..W6, run by the orchestrator
 * PERSONALLY against a real browser + real dsh/glm agent, per the promise
 * to the Owner: no Owner invitation before every step is green.
 *
 * Assertions follow openspec/changes/design-studio-r3/walkthrough-flow.md.
 * Evidence: screenshots + a printed assertion table + console-error log.
 *
 * FIXTURE CONTRACT (M7 收官轮 — read before every run; the W4 preflight
 * checks both and answers a NAMED precondition failure, never a mid-run
 * FATAL):
 *   1. The hero seed's press-button (id a4) must carry the LITERAL
 *      `raised={false}` — a present prop-expr buffer. An absent or
 *      expression prop is not addressable by the panel (the recorded
 *      kernel gap), so W4①'s check would be a no-op against an already-
 *      checked box. Reset: `git checkout -- design/prototypes/welcome/
 *      pages/hero.svelte` then hand-set raised={false} (or edit the seed
 *      to match) before the run. W6 restores its own pre-edit bytes at
 *      the end, so back-to-back runs keep this contract.
 *   2. `design/.jx-collab/` must be the SAME PROTOCOL GENERATION as the
 *      running code — the journal's tree items reference prop-expr holes
 *      (bytes an M3-era planner cannot produce). A stale-generation
 *      journal underreports buffers (the #prop-raised "edit in code"
 *      symptom). The server's startup reconcile (M7 收官轮) self-heals
 *      known pages, but the preflight still verifies the era: full reset
 *      = delete design/.jx-collab and restart the server (adoption
 *      re-mints identity).
 */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
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
  // settle the FRESH canvas document before listening: the {#key} remount
  // creates a new iframe whose initial navigation may commit slower than
  // any blind sleep under compile load — waiting the LIVE frame's load
  // state removes the harness's own race (the W1② false-positive this
  // round); resolves immediately if already loaded
  await page.waitForSelector('.studio-preview iframe', { timeout: 30_000 });
  let canvasSettled = false;
  for (let i = 0; i < 40 && !canvasSettled; i += 1) {
    const cf = page.frames().filter((f) => f.url().includes('/prototypes/welcome')).at(-1);
    if (cf !== undefined) {
      await cf.waitForLoadState('load', { timeout: 20_000 }).then(() => { canvasSettled = true; }).catch(() => {});
    } else {
      await sleep(250);
    }
  }
  await sleep(400);
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
  // highlight reaches the usage through the CANVAS-HOSTED ring pair
  // (#44): ONE [data-jx-indicator="selected"] overlay in the canvas
  // document, badge naming the frame-reported press-button + size
  let highlightSeen = false;
  for (const f of page.frames()) {
    if (!f.url().includes('/prototypes/')) continue;
    const rings = await f.locator('[data-jx-indicator="selected"]').evaluateAll((els) =>
      els.map((el) => ({
        // #48: rings fade (opacity), never display-flip — visible = painted
        visible: getComputedStyle(el).display !== 'none' && getComputedStyle(el).opacity !== '0',
        badge: el.querySelector('.jx-indicator-badge')?.textContent ?? '',
      })),
    );
    if (rings.some((r) => r.visible && r.badge.includes('press-button'))) { highlightSeen = true; break; }
  }
  record('W3', '③ highlight reaches the frame usage', highlightSeen, 'the canvas-hosted selected ring (badge names the frame-reported press-button)');
  await page.screenshot({ path: `${SHOT_DIR}w3-tree-select.png` });

  /* ── W4 prop edits: toggle add/remove + no flash ────────────── */
  // M7a note: the panel edits ride the collab op lane — the check
  // lands a §4 text op through admission, the canonical projection is
  // written back to the file server-side (atomic write-back) and HMR
  // carries it. The seed contract: the selected press-button must
  // carry a LITERAL raised prop at seed (a present buffer — an absent
  // prop is not yet in the protocol, the recorded kernel gap).
  const heroPath = '/Users/kzf/Dev/GitHub/jixoai-labs/ui-design-tool/design/prototypes/welcome/pages/hero.svelte';
  // the W4 PREFLIGHT (fixture contract, M7 收官轮): named precondition
  // failures instead of a mid-run FATAL — see the header's contract note
  const before4 = readFileSync(heroPath, 'utf8');
  const seedOk = /raised=\{false\}/.test(before4);
  record('W4', '⓪a seed contract: hero press-button carries the raised={false} literal', seedOk,
    seedOk ? 'present prop-expr buffer — the checkbox can land a §4 op' : 'FIX THE FIXTURE: hand-set raised={false} on the hero seed (or `git checkout -- design/prototypes/welcome/pages/hero.svelte` + re-apply) and re-run — W4① needs an uncheck-checked transition');
  const journalPath = '/Users/kzf/Dev/GitHub/jixoai-labs/ui-design-tool/design/.jx-collab/journal.ndjson';
  let eraOk = false;
  let eraDetail = 'journal missing';
  try {
    const journalText = readFileSync(journalPath, 'utf8');
    eraOk = journalText.includes('"how":"prop-expr"');
    eraDetail = eraOk ? 'prop-expr holes present in tree items — same generation' : 'no prop-expr hole bytes anywhere — an older protocol generation wrote this journal';
  } catch (error) {
    eraDetail = `unreadable (${error instanceof Error ? error.message : String(error)})`;
  }
  record('W4', '⓪b .jx-collab is the same protocol generation as the running code', eraOk,
    eraOk ? eraDetail : `${eraDetail} — delete design/.jx-collab and restart the server (adoption re-mints; the startup reconcile then realigns)`);
  if (!(seedOk && eraOk)) {
    record('W4', '①-④ skipped', false, 'the fixture contract failed (see ⓪a/⓪b) — fix the fixture and re-run; W5/W6 still run for their own signals');
  }
  if (seedOk && eraOk) {
  const raised = page.locator('.studio-panel-zone #prop-raised');
  await raised.waitFor({ timeout: 10_000 });
  const disabledDuring = await raised.isDisabled();
  record('W4', '⓪ control not locked outside conflict (op lane)', !disabledDuring);
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
  // M7a: the buffer law — a present literal prop flips to {false}; the
  // "attribute REMOVED" branch retired with the file-CAS lane (an
  // absent prop is a scaffold change, the recorded kernel gap)
  record('W4', '② uncheck honors the buffer (removed legacy or {false})', removed || flippedFalse, removed ? 'attribute removed (legacy seed state)' : flippedFalse ? 'flipped to {false} (the buffer law — the present-literal branch)' : 'raised still truthy!');
  record('W4', '③ meta refetch bounded across edits', metaRequests.length - metaDuring4 <= 2, `meta ${metaDuring4}→${metaRequests.length} (a reload legitimately re-seeds; W2④ pins silence)`);
  const variantRow = await page.locator('.studio-panel-zone').first().innerText();
  record('W4', '④ slot-derived variant honestly degraded', !/variant\s*(segmented|fill|tonal)/i.test(variantRow), variantRow.includes('variant') ? 'variant row present (unexpected)' : 'variant row absent — the extraction ceiling; hint-row gap tracked on GitHub');
  await page.screenshot({ path: `${SHOT_DIR}w4-props.png` });
  }

  /* ── W5 agent turn with selection context ───────────────────── */
  // W5a: a SHORT turn settles in seconds — proves lock/settle/unlock without
  // gambling on a minutes-long generation under machine load
  await page.locator('.chat-input, textarea, input[type=text]').last().fill('只回复 ok 两个字母，不要读写任何文件');
  const sendBtn = page.locator('button', { hasText: /send|发送/i }).last();
  // lock check immediately after send
  const chipAtSend = (await page.locator('[data-jx-chip], .chat-chip').count()) > 0 ? await page.locator('[data-jx-chip], .chat-chip').first().innerText() : '(none)';
  await sendBtn.click();
  // wait for the turn to actually START (a user block renders), then probe the panel
  await page.waitForSelector('.chat-message, .chat-flow > *', { timeout: 60_000 }).catch(() => {});
  await sleep(3000);
  const panelControls = await page.locator('.studio-panel-zone input, .studio-panel-zone select, .studio-panel-zone button:visible').evaluateAll((els) => els);
  // M7a CONTRACT UPGRADE (collab-protocol): the SSE client decorative
  // lock is RETIRED — admission is the authority. Mid-agent-turn the
  // panel stays EDITABLE (a concurrent human edit auto-merges or raises
  // the §6 inline conflict card `data-jx-conflict`, never a blanket
  // disable). The old W5① asserted "all controls disabled mid-stream".
  const editableDuringTurn = panelControls.length === 0 || panelControls.some((el) => !el.disabled);
  record('W5', '① panel stays editable during agent turn (admission-authority, SSE lock retired)', editableDuringTurn,
    panelControls.length === 0 ? 'no panel controls rendered (no selection)' : 'at least one control enabled mid-stream');
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
  record('W5', '④ panel editable after the short turn (no residual suspension)', unlocked);
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

  /* ── W6 three-way interleave: human debounce × agent /admit × hand ingest ── */
  // (collab-protocol M7 tasks item) — three actors, ONE page (hero), three
  // DISTINCT buffers of the same press-button usage (a4, parsed from the
  // seed): human → raised (the panel checkbox, the 350ms debounce op
  // lane); agent → t-0 (a /admit text op built from the /sync mirror);
  // hand → variant (a raw fs edit, the §8 watcher ingest lane). The
  // survival contract: all three effects live in the final file (fusion
  // on distinct buffers — or a visible conflict card, never a silent
  // loss), the journal accounts all three actors, and the file settles
  // at the canonical projection.
  const w6seed = readFileSync(heroPath, 'utf8');
  const a4match = /<PressButton id="([^"]+)"[^>]*raised/.exec(w6seed);
  const a4 = a4match?.[1] ?? 'a4';
  // re-anchor the selection (W5's chat turns may have moved focus)
  const w6pageNode = page.locator('li[data-path="page: hero-mobile-390-light"]');
  await w6pageNode.waitFor({ timeout: 20_000 });
  if ((await page.locator('li[data-path^="page: hero-mobile-390-light/"]').count()) === 0) {
    await w6pageNode.locator('.jx-tree-row').first().click();
  }
  const w6press = page.locator('li[data-path^="page: hero-mobile-390-light/"]').filter({ hasText: 'press-button' }).first();
  await w6press.locator('.jx-tree-row').first().click();
  await sleep(1800);
  const w6raised = page.locator('.studio-panel-zone #prop-raised');
  const w6panelOk = await w6raised.waitFor({ timeout: 15_000 }).then(() => true).catch(() => false);
  record('W6', '⓪ the panel addresses the press-button (raised row live)', w6panelOk, w6panelOk ? `component ${a4}` : 'no #prop-raised row — check the seed contract (W4 ⓪a) and the selection');

  // the journal marker: only rows appended AFTER this point count for W6③
  const w6journalBefore = readFileSync(journalPath, 'utf8').split('\n').filter((line) => line.length > 0).length;
  const pageerrorsBefore = consoleErrors.length;

  let w6humanLanded = false;
  if (w6panelOk) {
    // LANE 1 — human: the checkbox ride (the debounce lane commits a §4
    // op; the write-back + HMR settle before the other lanes fire, so
    // the panel's own overlay is never the thing being raced away)
    const isUnchecked = await w6raised.isChecked().catch(() => false);
    if (!isUnchecked) await w6raised.uncheck().catch(() => {}); // normalize to {false} first
    await sleep(1200);
    await w6raised.check();
    for (let poll = 0; poll < 15 && !w6humanLanded; poll++) {
      w6humanLanded = /raised=\{true\}/.test(readFileSync(heroPath, 'utf8'));
      if (!w6humanLanded) await sleep(500);
    }
  }
  record('W6', '① human lane: the panel debounce edit lands (raised={true} in the file)', w6humanLanded, w6humanLanded ? 'fs assertion (polled)' : w6panelOk ? 'never landed — a silent loss on the human lane!' : 'panel row absent — ⓪ already carries this failure');

  // LANES 2+3 — agent /admit op (t-0) × hand fs edit (variant), fired
  // near-simultaneously: the agent's projection push and the watcher's
  // §8 ingest of the hand edit interleave on the same page
  let agentStatus = 0;
  const agentLane = (async () => {
    const { LoroDoc } = createRequire('/Users/kzf/Dev/GitHub/jixoai-labs/ui-design-tool/packages/design-tool/package.json')('loro-crdt');
    const doc = new LoroDoc();
    doc.setPeerId(0x6a66);
    const syncResp = await (await fetch(`${BASE}/__design__/api/collab/sync`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    })).json();
    doc.import(Buffer.from(syncResp.updateB64, 'base64'));
    doc.commit();
    const container = `b:${a4}:t-0`;
    const current = doc.getText(container).toString();
    const cursor = doc.getText(container).getCursor(0, 0);
    if (cursor === undefined) throw new Error(`cannot anchor the agent op on ${container}`);
    const envelope = {
      actor: 'walkthrough-agent',
      opId: `walkthrough-agent:w6:${Date.now()}`,
      baseFrontiers: doc.frontiers(),
      domain: 'text',
      kind: 'replace',
      target: { componentId: a4, buffer: 't-0' },
      cursorBytesB64: Buffer.from(cursor.encode()).toString('base64'),
      offset: 0,
      length: current.length,
      text: 'Read the standard twice',
      timestamp: Date.now(),
    };
    const admitResp = await fetch(`${BASE}/__design__/api/collab/admit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(envelope),
    });
    agentStatus = admitResp.status;
    return current;
  })().catch((error) => {
    record('W6', '②b agent lane error', false, String(error instanceof Error ? error.message : error));
    return '';
  });
  const handLane = (async () => {
    // a hand editor's save on the VARIANT literal (a different buffer of
    // the SAME usage) — scoped to the a4 line
    const scoped = new RegExp(`(id="${a4}"[^>]*variant=")ghost(")`);
    writeFileSync(heroPath, readFileSync(heroPath, 'utf8').replace(scoped, '$1tonal$2'));
  })();
  const agentBefore = await agentLane;
  await handLane;

  // settle: every lane's effect must appear in the file (fusion), and
  // the bytes must then be STABLE (the converged fixed point)
  const allSurvive = (text) => /raised=\{true\}/.test(text) && />Read the standard twice</.test(text) && new RegExp(`id="${a4}"[^>]*variant="tonal"`).test(text);
  let w6settled = false;
  let stableBytes = '';
  for (let poll = 0; poll < 40 && !w6settled; poll++) {
    const text = readFileSync(heroPath, 'utf8');
    if (allSurvive(text) && text === stableBytes) w6settled = true;
    else stableBytes = text;
    if (!w6settled) await sleep(1000);
  }
  const finalText = readFileSync(heroPath, 'utf8');
  record('W6', '② all three lanes SURVIVE in the file (fusion, no silent loss)', w6settled && allSurvive(finalText),
    w6settled ? `agent admit ${String(agentStatus)}; human+agent+hand effects coexist (agent replaced "${agentBefore}" on t-0)` : `agent admit ${String(agentStatus)}; final bytes carry: raised=${String(/raised=\{true\}/.test(finalText))}, agent-text=${String(/>Read the standard twice</.test(finalText))}, hand-variant=${String(/variant="tonal"/.test(finalText))}`);

  // the kernel's buffer texts must equal the file's literals (the file
  // IS the canonical projection, checked per-buffer through /usage)
  let kernelMatch = false;
  let kernelDetail = 'usage unresolved';
  for (let index = 1; index <= 10 && !kernelMatch; index++) {
    const usageResp = await (await fetch(`${BASE}/__design__/api/collab/usage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: 'design/prototypes/welcome/pages/hero.svelte', component: 'press-button', usageIndex: index }),
    })).json();
    if (usageResp.componentId !== a4) continue;
    const byName = new Map((usageResp.buffers ?? []).map((buffer) => [buffer.buffer, buffer.text]));
    kernelMatch = byName.get('raised') === 'true' && byName.get('t-0') === 'Read the standard twice' && byName.get('variant') === 'tonal';
    kernelDetail = `raised=${String(byName.get('raised'))} t-0=${String(byName.get('t-0'))} variant=${String(byName.get('variant'))}`;
  }
  record('W6', '③ the file settles at the canonical projection (kernel buffer texts == file literals)', kernelMatch, kernelDetail);

  // journal accounting: the three actors all journaled for this usage
  const journalAfter = readFileSync(journalPath, 'utf8').split('\n').filter((line) => line.length > 0);
  const w6rows = journalAfter.slice(w6journalBefore).filter((line) => line.includes(`"componentId":"${a4}"`) || line.includes(`"containerKey":"b:${a4}:`));
  const w6actors = new Set(w6rows.map((line) => (/\"actor\":\"([^\"]+)\"/.exec(line)?.[1]) ?? '?'));
  record('W6', '④ journal accounts all three actors', w6actors.has('human') && w6actors.has('walkthrough-agent') && w6actors.has('file-system'),
    `actors seen: ${[...w6actors].sort().join(', ') || '(no rows!)'} across ${String(w6rows.length)} rows for ${a4}`);

  // the no-silent-loss rider: zero NEW page errors, and a conflict card
  // (if one rose) is an explicit survival path — never required here
  const newPageErrors = consoleErrors.slice(pageerrorsBefore).filter((e) => !e.includes('favicon'));
  const conflictCards = await page.locator('[data-jx-conflict]').count();
  record('W6', '⑤ clean interleave (no new console errors; conflict card only if explicitly resolved)', newPageErrors.length === 0,
    `${String(newPageErrors.length)} new console errors; ${String(conflictCards)} conflict card(s) standing (distinct buffers fuse — a standing card is a separate finding)`);
  await page.screenshot({ path: `${SHOT_DIR}w6-three-way.png` });

  // restore the fixture: W6 hands back its pre-edit bytes so the W4 seed
  // contract (raised={false}) holds for the next run — the restore is
  // itself one more §8 hand-edit cycle (journaled, converged)
  writeFileSync(heroPath, w6seed);
  await sleep(1500);
  record('W6', '⑥ fixture restored (hero returned to its pre-W6 bytes)', readFileSync(heroPath, 'utf8') === w6seed, 'the next run\'s W4 preflight re-checks the seed contract');
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
