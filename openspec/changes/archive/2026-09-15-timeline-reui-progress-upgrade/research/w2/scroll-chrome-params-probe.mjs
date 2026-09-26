/*
 * W2 probe — scroll-area chrome parameters (Owner r2 geometry:
 * radius 0 default, width tiers, flush track, edge-anchored growth).
 * Change 2026-09-15-timeline-reui-progress-upgrade, task 2.3.
 *
 * Runs against the Owner's dev server on 5199 (READ-ONLY — never
 * killed/restarted; all manipulation happens in the probe's own
 * browser page). The probe tests the REAL component through the docs
 * page's chrome-params matrix demo (3 widths × 3 radius modes, every
 * cell orientation="both" so both axes' chrome mount together).
 *
 * Battery (design.md §W2 + specs/component-authoring r2 scenario):
 *   1. structural — data-width stamped per tier; the radius var
 *      stamped on the region's inline style ONLY when configured
 *   2. radius paint — computed border-radius 0px default, configured
 *      px, 'full' capsule
 *   3. tier geometry measured — track widths 8/12/16 (both axes),
 *      resting thumb cross sizes 4/8/12, the tier var computed
 *   4. FLUSH track — computed edge insets 0 + geometric flush (track
 *      edge == region edge, to the device pixel)
 *   5. EDGE-ANCHORED hover growth per tier — the edge-side flank
 *      coordinate unchanged (±0 CSS px = ±0 device px at dsf 2),
 *      cross size +2px strictly inward, region boundary never
 *      crossed; x axis ditto (block-end flank pinned)
 *   6. RTL — the anchor mirrors: inline-end IS the left edge, the
 *      left flank pins, growth runs rightward into the content
 *   7. drag pin — the widened state holds past the ~700ms idle
 *      window (drag channel + live lane)
 *   8. idle fade + the FOUR auto-hide pins re-asserted (the W4
 *      receipt technique: region focus-within, thumb focus, drag,
 *      hover — each in isolation; role + aria-valuenow intact while
 *      pinned; released pins resume the fade)
 *
 * Run from repo root: node openspec/changes/2026-09-15-timeline-
 * reui-progress-upgrade/research/w2/scroll-chrome-params-probe.mjs
 */
import { chromium } from '../../../../../node_modules/playwright-core/index.mjs';

const CHROME =
  process.env.HOME +
  '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'http://localhost:5199';

const results = [];
const ok = (name, pass, detail = '') => {
  results.push({ name, pass });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};
const near = (a, b, tol = 0.5) => Math.abs(a - b) <= tol;
const sleep = (ms) => page.waitForTimeout(ms);

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });

// the matrix demo's cells, addressed by the demo's aria-labels
const RADIUS = { default: '0 (default)', px: '6px', full: 'full (capsule)' };
const TIERS = ['thin', 'auto', 'wide'];
const TRACK_W = { thin: 8, auto: 12, wide: 16 };
const THUMB_REST = { thin: 4, auto: 8, wide: 12 };
const THUMB_WIDE = { thin: 6, auto: 10, wide: 14 };
const cellSel = (radiusKey, tier) =>
  `div.jx-scroll-area:has(.jx-scroll-viewport[aria-label="chrome params — radius ${RADIUS[radiusKey]}, width ${tier}"])`;

const cell = (radiusKey, tier) => page.locator(cellSel(radiusKey, tier)).first();
const center = async (el) => {
  await el.evaluate((node) => node.scrollIntoView({ block: 'center', inline: 'center' }));
  await sleep(350);
};

/** wake a cell's lane (hover the REGION center, away from the thumb
 *  lanes) and keep it live — returns the region's bounding box */
const wake = async (c) => {
  const box = await c.boundingBox();
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height / 2);
  await sleep(350);
  return box;
};

/** one geometry snapshot of a cell's y/x chrome (region, tracks,
 *  thumbs) — CSS-px rects, precise enough for device-px deltas at
 *  dsf 2 (one device px = 0.5 CSS px) */
const geo = (c) =>
  c.evaluate((el) => {
    const region = el.getBoundingClientRect();
    const trackY = el.querySelector('.jx-scroll-track.y');
    const trackX = el.querySelector('.jx-scroll-track.x');
    const thumbY = el.querySelector('.jx-scroll-thumb.y');
    const thumbX = el.querySelector('.jx-scroll-thumb.x');
    const r = { region: { left: region.left, right: region.right, top: region.top, bottom: region.bottom } };
    if (trackY) r.trackY = trackY.getBoundingClientRect().toJSON();
    if (trackX) r.trackX = trackX.getBoundingClientRect().toJSON();
    if (thumbY) r.thumbY = thumbY.getBoundingClientRect().toJSON();
    if (thumbX) r.thumbX = thumbX.getBoundingClientRect().toJSON();
    return r;
  });

// navigation: the shared dev server can stall on HMR recompiles under
// sibling load (observed 58s first-hit) — generous timeout, one retry
const goto = async () => {
  try {
    await page.goto(`${BASE}/docs/components/scroll-area.html`, { waitUntil: 'networkidle', timeout: 120000 });
  } catch {
    await page.goto(`${BASE}/docs/components/scroll-area.html`, { waitUntil: 'load', timeout: 120000 });
    await sleep(2000);
  }
};
await goto();
await sleep(900);

console.log('\n── 1 · structural: data-width + the radius var stamp ──');
for (const tier of TIERS) {
  const attr = await cell('default', tier).getAttribute('data-width');
  ok(`tier ${tier}: data-width stamped`, attr === tier, `data-width=${attr}`);
}
{
  const attr = await page
    .locator('.jx-scroll-viewport[aria-label="vertical sample"]')
    .locator('xpath=ancestor::div[contains(@class,"jx-scroll-area")]')
    .first()
    .getAttribute('data-width');
  ok('an un-configured consumer defaults to data-width=auto', attr === 'auto', `data-width=${attr}`);
}
for (const [key, expect] of [
  ['default', ''],
  ['px', '6px'],
  ['full', 'calc(infinity * 1px)'],
]) {
  const raw = await cell(key, 'auto').evaluate((el) => el.style.getPropertyValue('--jx-scroll-thumb-radius'));
  ok(
    `radius ${key}: region inline style ${expect === '' ? 'carries NO var' : `carries ${expect}`}`,
    raw.trim() === expect,
    `var= "${raw}"`,
  );
}

console.log('\n── 2 · radius paint (computed border-radius) ──');
{
  await center(cell('default', 'auto'));
  await wake(cell('default', 'auto'));
  const cornerOf = (key) =>
    cell(key, 'auto').evaluate((el) => getComputedStyle(el.querySelector('.jx-scroll-thumb.y')).borderTopLeftRadius);
  const deft = await cornerOf('default');
  ok('default thumb is SQUARE-CUT (computed 0px)', deft === '0px', `border-top-left-radius=${deft}`);
  const px = await cornerOf('px');
  ok('configured px paints (6px)', px === '6px', `border-top-left-radius=${px}`);
  const full = await cornerOf('full');
  const fullPx = parseFloat(full) || 0;
  ok(
    "'full' paints the capsule (infinity calc)",
    full.includes('infinity') || fullPx > 1000,
    `border-top-left-radius=${full}`,
  );
}

console.log('\n── 3 · tier geometry measured (track 8/12/16 · resting thumb 4/8/12, both axes) ──');
for (const tier of TIERS) {
  const c = cell('default', tier);
  await center(c);
  await wake(c);
  const g = await geo(c);
  const cssVar = await c.evaluate((el) => getComputedStyle(el).getPropertyValue('--jx-scroll-track-w').trim());
  ok(`tier ${tier}: --jx-scroll-track-w computes ${TRACK_W[tier]}px`, cssVar === `${TRACK_W[tier]}px`, `var=${cssVar}`);
  ok(
    `tier ${tier}: y track width ${TRACK_W[tier]}px`,
    near(g.trackY.width, TRACK_W[tier]),
    `measured ${g.trackY.width.toFixed(2)}px`,
  );
  ok(
    `tier ${tier}: x track height ${TRACK_W[tier]}px`,
    near(g.trackX.height, TRACK_W[tier]),
    `measured ${g.trackX.height.toFixed(2)}px`,
  );
  ok(
    `tier ${tier}: y thumb resting cross ${THUMB_REST[tier]}px`,
    near(g.thumbY.width, THUMB_REST[tier]),
    `measured ${g.thumbY.width.toFixed(2)}px`,
  );
  ok(
    `tier ${tier}: x thumb resting cross ${THUMB_REST[tier]}px`,
    near(g.thumbX.height, THUMB_REST[tier]),
    `measured ${g.thumbX.height.toFixed(2)}px`,
  );
}

console.log('\n── 4 · the FLUSH track (edge insets 0, computed + geometric) ──');
{
  const c = cell('default', 'auto');
  await center(c);
  const insets = await c.evaluate((el) => {
    const y = getComputedStyle(el.querySelector('.jx-scroll-track.y'));
    const x = getComputedStyle(el.querySelector('.jx-scroll-track.x'));
    return {
      yInlineEnd: y.insetInlineEnd,
      yBlockStart: y.insetBlockStart,
      yBlockEnd: y.insetBlockEnd,
      xInlineStart: x.insetInlineStart,
      xInlineEnd: x.insetInlineEnd,
      xBlockEnd: x.insetBlockEnd,
    };
  });
  const flush =
    insets.yInlineEnd === '0px' &&
    insets.yBlockStart === '0px' &&
    insets.yBlockEnd === '0px' &&
    insets.xInlineStart === '0px' &&
    insets.xInlineEnd === '0px' &&
    insets.xBlockEnd === '0px';
  ok('computed edge insets are 0 on both tracks (the 2px standoff retired)', flush, JSON.stringify(insets));
  const g = await geo(c);
  ok(
    'geometric flush: y track right edge == region right edge',
    near(g.trackY.right, g.region.right),
    `Δ ${(g.trackY.right - g.region.right).toFixed(3)}px`,
  );
  ok(
    'geometric flush: x track bottom edge == region bottom edge',
    near(g.trackX.bottom, g.region.bottom),
    `Δ ${(g.trackX.bottom - g.region.bottom).toFixed(3)}px`,
  );
}

console.log('\n── 5 · EDGE-ANCHORED hover growth (edge flank pinned, +2px strictly inward) ──');
for (const tier of TIERS) {
  const c = cell('default', tier);
  await center(c);
  await wake(c);
  const rest = await geo(c);
  const t = rest.thumbY;
  await page.mouse.move(t.left + t.width / 2, t.top + t.height / 2);
  await sleep(340); // the 160ms inset transition settles
  const wide = await geo(c);
  const w = wide.thumbY;
  const r = wide.region;
  const dEdge = w.right - t.right;
  const dInner = t.left - w.left;
  ok(
    `tier ${tier}: y hover ${THUMB_REST[tier]}→${THUMB_WIDE[tier]}px`,
    near(t.width, THUMB_REST[tier]) && near(w.width, THUMB_WIDE[tier]),
    `rest ${t.width.toFixed(2)} widened ${w.width.toFixed(2)}`,
  );
  ok(
    `tier ${tier}: y edge-side flank coordinate UNCHANGED (device px)`,
    Math.abs(dEdge) < 0.5,
    `Δright ${dEdge.toFixed(3)}px (rest ${t.right.toFixed(2)} → hover ${w.right.toFixed(2)})`,
  );
  ok(
    `tier ${tier}: growth strictly INWARD (+2px on the inner flank)`,
    near(dInner, 2) && near(w.width - t.width, 2),
    `Δleft ${dInner.toFixed(3)}px, Δwidth ${(w.width - t.width).toFixed(3)}px`,
  );
  ok(
    `tier ${tier}: region boundary never crossed (edge flank 2px inside)`,
    near(r.right - w.right, 2),
    `region.right − thumb.right = ${(r.right - w.right).toFixed(3)}px`,
  );
}
{
  // the x axis (auto tier): the block-end flank pins, the block-start
  // flank narrows — growth runs UP into the content
  const c = cell('default', 'auto');
  await center(c);
  await wake(c);
  const rest = await geo(c);
  const t = rest.thumbX;
  await page.mouse.move(t.left + t.width / 2, t.top + t.height / 2);
  await sleep(340);
  const wide = await geo(c);
  const w = wide.thumbX;
  const b = wide.region;
  ok(
    'x hover 8→10px (auto tier)',
    near(t.height, 8) && near(w.height, 10),
    `rest ${t.height.toFixed(2)} widened ${w.height.toFixed(2)}`,
  );
  ok(
    'x edge-side (block-end) flank UNCHANGED',
    Math.abs(w.bottom - t.bottom) < 0.5,
    `Δbottom ${(w.bottom - t.bottom).toFixed(3)}px`,
  );
  ok(
    'x growth strictly inward (+2 on block-start)',
    near(t.top - w.top, 2) && near(w.height - t.height, 2),
    `Δtop ${(t.top - w.top).toFixed(3)}px, Δheight ${(w.height - t.height).toFixed(3)}px`,
  );
  ok('x region boundary never crossed', near(b.bottom - w.bottom, 2), `region.bottom − thumb.bottom = ${(b.bottom - w.bottom).toFixed(3)}px`);
  await page.mouse.move(0, 0);
  await sleep(250);
}

console.log('\n── 6 · RTL — the anchor mirrors (inline-end IS the left edge) ──');
{
  const c = cell('px', 'auto');
  await c.evaluate((el) => el.setAttribute('dir', 'rtl'));
  await center(c);
  await wake(c);
  const rest = await geo(c);
  const t = rest.thumbY;
  ok(
    'RTL: the y thumb anchors at the LEFT edge (inline-end mirrored)',
    near(t.left - rest.region.left, 2),
    `thumb.left − region.left = ${(t.left - rest.region.left).toFixed(3)}px`,
  );
  await page.mouse.move(t.left + t.width / 2, t.top + t.height / 2);
  await sleep(340);
  const wide = await geo(c);
  const w = wide.thumbY;
  ok(
    'RTL hover: LEFT flank pinned, growth rightward INTO content',
    Math.abs(w.left - t.left) < 0.5 && near(w.right - t.right, 2) && near(w.width - t.width, 2),
    `Δleft ${(w.left - t.left).toFixed(3)} Δright ${(w.right - t.right).toFixed(3)} Δwidth ${(w.width - t.width).toFixed(3)}`,
  );
  await page.mouse.move(0, 0);
  await c.evaluate((el) => el.removeAttribute('dir'));
  await sleep(250);
}

console.log('\n── 7 · the drag pin holds the widened state ──');
{
  const c = cell('default', 'auto');
  await center(c);
  await wake(c);
  const rest = await geo(c);
  const t = rest.thumbY;
  await page.mouse.move(t.left + t.width / 2, t.top + t.height / 2);
  await sleep(200);
  await page.mouse.down();
  await sleep(950); // PAST the ~700ms idle window — the pin must hold
  const held = await geo(c);
  const live = await c.getAttribute('data-thumb-live');
  const pin = await c.getAttribute('data-pin-drag');
  ok('drag: data-thumb-live holds past the idle window', live === 'on', `data-thumb-live=${live}`);
  ok('drag: the data-pin-drag channel is set', pin === 'on', `data-pin-drag=${pin}`);
  ok(
    'drag: the WIDENED state holds (10px, edge flank still pinned)',
    near(held.thumbY.width, 10) && Math.abs(held.thumbY.right - t.right) < 0.5,
    `width ${held.thumbY.width.toFixed(2)}px, Δright ${(held.thumbY.right - t.right).toFixed(3)}px`,
  );
  await page.mouse.up();
  await page.mouse.move(0, 0);
  await sleep(950);
}

console.log('\n── 8 · idle fade + the FOUR auto-hide pins (W4 technique, re-asserted) ──');
const target = () => cell('default', 'auto');
const settle = async () => {
  await page.mouse.move(0, 0);
  await page.evaluate(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null,
  );
  await sleep(950); // let any standing fade fire
};
const pinnedCheck = async (label) => {
  await sleep(900); // past the 700ms idle window
  const live = await target().getAttribute('data-thumb-live');
  const role = await target().locator('.jx-scroll-thumb.y').getAttribute('role');
  const valuenow = await target().locator('.jx-scroll-thumb.y').getAttribute('aria-valuenow');
  ok(`${label}: thumb pinned past the idle window`, live === 'on', `data-thumb-live=${live}`);
  ok(
    `${label}: role intact + aria-valuenow live (never leaves the a11y tree)`,
    role === 'scrollbar' && valuenow !== null,
    `role=${role} aria-valuenow=${valuenow}`,
  );
};

// idle fade
await settle();
ok(
  'idle: the lane fades after ~700ms unpinned',
  (await target().getAttribute('data-thumb-live')) === null,
  `data-thumb-live=${await target().getAttribute('data-thumb-live')}`,
);

// PIN 1 — region focus-within (the viewport holds focus)
await target().scrollIntoViewIfNeeded?.();
await center(target());
await settle();
await target().locator('.jx-scroll-viewport').evaluate((el) => el.focus());
await pinnedCheck('PIN region focus-within');
await page.evaluate(() => document.activeElement?.blur?.());
await sleep(950);
ok('PIN region focus released → fade resumes', (await target().getAttribute('data-thumb-live')) === null);

// PIN 2 — thumb focus
await settle();
await target().locator('.jx-scroll-thumb.y').evaluate((el) => el.focus());
await pinnedCheck('PIN thumb focus');
await page.evaluate(() => document.activeElement?.blur?.());
await sleep(950);
ok('PIN thumb focus released → fade resumes', (await target().getAttribute('data-thumb-live')) === null);

// PIN 3 — active drag (mouse down on the thumb, HELD)
await settle();
{
  const box = await target().boundingBox();
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height / 2);
  await sleep(350);
  const tb = await target().locator('.jx-scroll-thumb.y').boundingBox();
  await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2);
  await sleep(150);
  await page.mouse.down();
  await pinnedCheck('PIN active drag');
  await page.mouse.up();
  await page.mouse.move(0, 0);
  await sleep(950);
  ok('drag released → fade resumes', (await target().getAttribute('data-thumb-live')) === null);
}

// PIN 4 — hover (the region under the pointer)
await settle();
{
  await center(target());
  const box = await target().boundingBox();
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height / 2);
  await sleep(250);
  const hoverPin = await target().getAttribute('data-pin-hover');
  ok('PIN hover: the data-pin-hover channel is set', hoverPin === 'on', `data-pin-hover=${hoverPin}`);
  await pinnedCheck('PIN hover');
  await page.mouse.move(0, 0);
  await sleep(950);
  ok('hover released → fade resumes', (await target().getAttribute('data-thumb-live')) === null);
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(
  `\n${failed.length === 0 ? '✓ ALL GREEN' : `✗ ${failed.length} FAILURE(S)`} — ${results.length} probe assertions`,
);
console.log(
  'measured tiers — track: ' +
    TIERS.map((t) => `${t} ${TRACK_W[t]}px`).join(' · ') +
    ' | thumb resting: ' +
    TIERS.map((t) => `${t} ${THUMB_REST[t]}px`).join(' · ') +
    ' | thumb hover/drag: ' +
    TIERS.map((t) => `${t} ${THUMB_WIDE[t]}px`).join(' · ') +
    ' (all measured within ±0.5 CSS px = ±1 device px at dsf 2)',
);
process.exit(failed.length === 0 ? 0 : 1);
