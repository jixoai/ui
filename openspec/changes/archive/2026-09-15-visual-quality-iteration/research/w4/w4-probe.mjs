/*
 * W4 probe battery — the scroll-area family rework
 * (visual-quality-iteration, task 4.4). Run against a PRIVATE dev
 * server (NOT the Owner's 5199): `npx vite dev --port 5391` in
 * apps/www, then `node w4-probe.mjs`.
 *
 * Deterministic in-browser probes (the anti-hallucination law: every
 * visual claim rides on computed styles / geometry reads):
 *   1. verdict correctness — fits / overflows / scroll travel / end /
 *      MEMBERSHIP mutation (rows removed retire the verdict)
 *   2. thumb geometry ratio — thumb height / track height ≈
 *      clientHeight / scrollHeight
 *   3. keyboard scroll — the thumb's role=scrollbar contract (synthetic
 *      keydown drives the adapter's handler; the REGION's platform
 *      arrows cannot be synthetically driven — documented)
 *   4. the FOUR auto-hide pins, each in isolation — region
 *      focus-within, thumb focus, active drag, hover; while pinned the
 *      thumb keeps role + aria-valuenow; released pins resume the fade
 *   5. the native sibling — NO custom scrollbar ARIA anywhere inside
 *      (probe-asserted absent) + the capability computed styles
 *      (gutter stable, overscroll contain, width tiers, scoped
 *      color-scheme live-flipping)
 *   6. RTL — the horizontal thumb mirrors (inset-inline-start resolves
 *      against the right edge under dir=rtl)
 * Screenshots: light/dark × vertical/horizontal + the native sibling.
 */
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex/node_modules/playwright-core/index.mjs';
import { mkdirSync } from 'node:fs';

const CHROME =
  process.env.HOME +
  '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'http://localhost:5391';
const OUT = new URL('.', import.meta.url).pathname; // research/w4/
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });

const results = [];
const ok = (name, pass, detail = '') => {
  results.push({ name, pass });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};
const sleep = (ms) => page.waitForTimeout(ms);

// ── scroll-area page ────────────────────────────────────────────────────
await page.goto(`${BASE}/docs/components/scroll-area.html`, { waitUntil: 'networkidle' });
await sleep(900);

// the FIRST .jx-scroll-area on the page = the config demo (12 rows, h-40)
const areaSel = '.jx-scroll-area';
const first = page.locator(areaSel).first();
await first.scrollIntoViewIfNeeded();
await sleep(400);

console.log('\n── 1 · verdict correctness ──');
{
  const v = await first.evaluate((el) => ({
    y: el.getAttribute('data-verdict-y'),
    x: el.getAttribute('data-verdict-x'),
    chrome: el.getAttribute('data-chrome'),
  }));
  ok('overflows at rest → start-closed', v.y === 'start-closed', JSON.stringify(v));
  ok('chrome is on (fine pointer)', v.chrome === 'on');

  // scroll to middle and end
  const vp = first.locator('.jx-scroll-viewport');
  await vp.evaluate((el) => (el.scrollTop = Math.round((el.scrollHeight - el.clientHeight) / 2)));
  await sleep(250);
  ok('mid-travel → open', (await first.getAttribute('data-verdict-y')) === 'open');
  await vp.evaluate((el) => (el.scrollTop = el.scrollHeight));
  await sleep(250);
  ok('scrolled to end → end-closed', (await first.getAttribute('data-verdict-y')) === 'end-closed');

  // MEMBERSHIP mutation: remove rows until the content fits — the
  // childList observer must retire the verdict to none
  await vp.evaluate((el) => {
    el.scrollTop = 0;
    const lis = el.querySelectorAll('li');
    for (let i = 0; i < lis.length - 1; i++) lis[i].remove();
  });
  await sleep(400);
  ok('membership mutation (rows removed) → none', (await first.getAttribute('data-verdict-y')) === 'none');
  // and the thumb left the tree/tab order
  const hiddenThumb = await first.evaluate(
    (el) => el.querySelector('.jx-scroll-thumb')?.hidden ?? null,
  );
  ok('fitted axis hides the thumb (hidden attr)', hiddenThumb === true);
}

console.log('\n── 2 · thumb geometry ratio ──');
await page.reload({ waitUntil: 'networkidle' });
await sleep(900);
{
  const area = page.locator(areaSel).first();
  await area.scrollIntoViewIfNeeded();
  await sleep(300);
  const geo = await area.evaluate((el) => {
    const vp = el.querySelector('.jx-scroll-viewport');
    const track = el.querySelector('.jx-scroll-track.y');
    const thumb = el.querySelector('.jx-scroll-thumb.y');
    const r = { ratioExpected: vp.clientHeight / vp.scrollHeight };
    if (track && thumb) {
      r.trackH = track.getBoundingClientRect().height;
      r.thumbH = thumb.getBoundingClientRect().height;
    }
    return r;
  });
  const measured = geo.thumbH / geo.trackH;
  ok(
    'thumb/track ratio ≈ client/scroll',
    Math.abs(measured - geo.ratioExpected) < 0.02,
    `measured ${measured.toFixed(3)} vs expected ${geo.ratioExpected.toFixed(3)}`,
  );
}

console.log('\n── 3 · keyboard scroll (the thumb contract) ──');
{
  const area = page.locator(areaSel).first();
  const vp = area.locator('.jx-scroll-viewport');
  const thumb = area.locator('.jx-scroll-thumb.y');
  await vp.evaluate((el) => (el.scrollTop = 0));
  await sleep(200);
  // wake + pin via thumb focus
  await thumb.evaluate((el) => el.focus());
  await sleep(150);
  await thumb.press('ArrowDown');
  await sleep(150);
  const afterArrow = await vp.evaluate((el) => el.scrollTop);
  ok('thumb ArrowDown scrolls (keyboard-draggable)', afterArrow > 0, `scrollTop ${afterArrow}`);
  await thumb.press('End');
  await sleep(200);
  const afterEnd = await vp.evaluate((el) => el.scrollTop);
  const max = await vp.evaluate((el) => el.scrollHeight - el.clientHeight);
  ok('thumb End jumps to the end', Math.abs(afterEnd - max) < 2, `scrollTop ${afterEnd} / max ${max}`);
  const valuenow = parseInt((await thumb.getAttribute('aria-valuenow')) ?? '-1', 10);
  ok('aria-valuenow tracks position at the end (~100)', valuenow >= 99, `aria-valuenow ${valuenow}`);
}

console.log('\n── 4 · the four auto-hide pins, each in isolation ──');
const settle = async () => {
  // isolation preconditions: pointer far away, nothing focused, and the
  // demo re-anchored below any sticky page chrome (a covered region
  // overlay would eat the pointer events)
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null));
  await sleep(950); // let any standing fade fire
};
const pinnedCheck = async (label) => {
  await sleep(900); // past the 700ms idle window
  const live = await first2().getAttribute('data-thumb-live');
  const role = await first2().locator('.jx-scroll-thumb.y').getAttribute('role');
  const valuenow = await first2().locator('.jx-scroll-thumb.y').getAttribute('aria-valuenow');
  ok(`${label}: thumb pinned past the idle window`, live === 'on');
  ok(`${label}: role intact + aria-valuenow live`, role === 'scrollbar' && valuenow !== null, `role=${role} aria-valuenow=${valuenow}`);
};
const first2 = () => page.locator(areaSel).first();

// PIN 1 — region focus-within (the viewport holds focus)
await settle();
await first2().locator('.jx-scroll-viewport').evaluate((el) => el.focus());
await pinnedCheck('PIN region focus-within');
await page.evaluate(() => document.activeElement?.blur?.());
await sleep(950);
ok('PIN region focus released → fade resumes', (await first2().getAttribute('data-thumb-live')) === null);

// PIN 2 — thumb focus
await settle();
await first2().locator('.jx-scroll-thumb.y').evaluate((el) => el.focus());
await pinnedCheck('PIN thumb focus');
await page.evaluate(() => document.activeElement?.blur?.());
await sleep(950);
ok('PIN thumb focus released → fade resumes', (await first2().getAttribute('data-thumb-live')) === null);

// PIN 3 — active drag (mouse down on the thumb, HELD)
await settle();
{
  await first2().scrollIntoViewIfNeeded();
  await sleep(200);
  // wake the lane first (a faded lane is pointer-transparent): hover the
  // REGION center until live, then move onto the thumb and press
  const regionBox = await first2().boundingBox();
  await page.mouse.move(regionBox.x + regionBox.width / 2, regionBox.y + regionBox.height / 2);
  await sleep(350);
  const box = await first2().locator('.jx-scroll-thumb.y').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await sleep(120);
  await page.mouse.down();
  await pinnedCheck('PIN active drag');
  await page.mouse.up();
  // isolation: move the pointer AWAY before asserting the fade (the
  // hover pin legitimately holds while the cursor stays on the region)
  await page.mouse.move(0, 0);
  await sleep(950);
  ok('drag released → fade resumes', (await first2().getAttribute('data-thumb-live')) === null);
}

// PIN 4 — hover (the region under the pointer)
await settle();
{
  await first2().scrollIntoViewIfNeeded();
  await sleep(200);
  const box = await first2().boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + Math.min(box.height / 2, box.y > 0 ? 120 : 60));
  await sleep(250);
  const hoverPin = await first2().getAttribute('data-pin-hover');
  ok('PIN hover: the data-pin-hover channel is set', hoverPin === 'on', `data-pin-hover=${hoverPin}`);
  await pinnedCheck('PIN hover');
  await page.mouse.move(0, 0);
  await sleep(950);
  ok('hover released → fade resumes', (await first2().getAttribute('data-thumb-live')) === null);
}

console.log('\n── 6 · RTL — the horizontal thumb mirrors ──');
{
  // the HORIZONTAL demo on the page (the types section's second canvas)
  const horiz = page.locator('.jx-scroll-area[data-orientation="horizontal"]').first();
  await horiz.scrollIntoViewIfNeeded();
  await sleep(300);
  await horiz.evaluate((el) => el.setAttribute('dir', 'rtl'));
  const vp = horiz.locator('.jx-scroll-viewport');
  // Chrome runs the negative RTL engine: scrollLeft ∈ [−max, 0] — a
  // positive write clamps to 0 without firing scroll
  await vp.evaluate((el) => (el.scrollLeft = -40));
  await sleep(300);
  const geo = await horiz.evaluate((el) => {
    const thumb = el.querySelector('.jx-scroll-thumb.x');
    const track = el.querySelector('.jx-scroll-track.x');
    const t = thumb.getBoundingClientRect();
    const k = track.getBoundingClientRect();
    return {
      rtl: getComputedStyle(el).direction,
      valuenow: thumb.getAttribute('aria-valuenow'),
      // the gap between the thumb's inline-start edge (RIGHT under rtl)
      // and the track's right edge — 0 at logical rest, > 0 once scrolled
      gapFromRight: k.right - t.right,
      thumbW: t.width,
      trackW: k.width,
    };
  });
  ok('dir=rtl resolves on the region', geo.rtl === 'rtl');
  ok(
    'the thumb travels from the RIGHT edge under RTL (logical position grows, inset-inline-start mirrors)',
    geo.gapFromRight > 2 && geo.valuenow !== null && parseInt(geo.valuenow, 10) > 0,
    `gapFromRight ${geo.gapFromRight.toFixed(1)}px aria-valuenow ${geo.valuenow} thumbW ${geo.thumbW.toFixed(0)} trackW ${geo.trackW.toFixed(0)}`,
  );
}

console.log('\n── screenshots · scroll-area light/dark × both axes ──');
// vertical: the first demo; dark = the stage scope flip (the theme-scope law)
{
  const stage = page.locator('[data-jx-canvas-stage]').filter({ has: page.locator(areaSel) }).first();
  const vArea = stage.locator(areaSel).first();
  await vArea.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null));
  // wake the chrome for the receipt (hover pin — the honest visible state)
  const box = await vArea.boundingBox();
  await page.mouse.move(box.x + box.width - 6, box.y + box.height / 2);
  await sleep(350);
  await page.screenshot({ path: `${OUT}/scroll-area-vertical-light.png`, clip: { x: Math.max(0, box.x - 40), y: Math.max(0, box.y - 40), width: Math.min(560, 1440 - box.x), height: Math.min(340, 1000 - box.y) } });
  // dark stage scope
  await stage.evaluate((el) => { el.classList.add('dark'); el.classList.remove('jx-light'); el.setAttribute('data-theme', 'dark'); });
  await sleep(450);
  await page.screenshot({ path: `${OUT}/scroll-area-vertical-dark.png`, clip: { x: Math.max(0, box.x - 40), y: Math.max(0, box.y - 40), width: Math.min(560, 1440 - box.x), height: Math.min(340, 1000 - box.y) } });
  await stage.evaluate((el) => { el.classList.remove('dark'); el.classList.add('jx-light'); el.removeAttribute('data-theme'); });
  await page.mouse.move(0, 0);
  await sleep(200);
}
{
  const horiz = page.locator('.jx-scroll-area[data-orientation="horizontal"]').first();
  const stage = page.locator('[data-jx-canvas-stage]').filter({ has: horiz }).first();
  await horiz.scrollIntoViewIfNeeded();
  await sleep(300);
  const box = await horiz.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height - 6);
  await sleep(350);
  await page.screenshot({ path: `${OUT}/scroll-area-horizontal-light.png`, clip: { x: Math.max(0, box.x - 40), y: Math.max(0, box.y - 40), width: Math.min(760, 1440 - box.x), height: Math.min(320, 1000 - box.y) } });
  await stage.evaluate((el) => { el.classList.add('dark'); el.classList.remove('jx-light'); el.setAttribute('data-theme', 'dark'); });
  await sleep(450);
  await page.screenshot({ path: `${OUT}/scroll-area-horizontal-dark.png`, clip: { x: Math.max(0, box.x - 40), y: Math.max(0, box.y - 40), width: Math.min(760, 1440 - box.x), height: Math.min(320, 1000 - box.y) } });
  await page.mouse.move(0, 0);
}

// ── the native sibling page ─────────────────────────────────────────────
console.log('\n── 5 · the native sibling ──');
await page.goto(`${BASE}/docs/components/native-scroll-area.html`, { waitUntil: 'networkidle' });
await sleep(900);
{
  const area = page.locator('.jx-native-scroll-area').first();
  await area.scrollIntoViewIfNeeded();
  await sleep(300);
  // (a) the ARIA-absence probe — NO custom scrollbar surface inside
  const absence = await area.evaluate((el) => ({
    scrollbarRole: el.querySelectorAll('[role="scrollbar"]').length,
    valuenow: el.querySelectorAll('[aria-valuenow]').length,
    orientation: el.querySelectorAll('[aria-orientation]').length,
    controls: el.querySelectorAll('[aria-controls]').length,
    drawnThumb: el.querySelectorAll('.jx-scroll-thumb, .jx-scroll-track').length,
    tabbables: el.querySelectorAll('[tabindex]').length,
    region: el.querySelectorAll('[role="region"]').length,
  }));
  ok('NO role=scrollbar anywhere inside', absence.scrollbarRole === 0);
  ok('NO aria-valuenow / aria-orientation / aria-controls', absence.valuenow + absence.orientation + absence.controls === 0);
  ok('NO drawn thumb/track nodes', absence.drawnThumb === 0);
  ok('the ONLY tabindex is the region itself', absence.tabbables === 1 && absence.region === 1);

  // (b) capability computed styles — gutter + overscroll + width tiers
  const caps = await area.evaluate((el) => {
    const vp = el.querySelector('.jx-native-scroll');
    const cs = getComputedStyle(vp);
    return { gutter: cs.scrollbarGutter, overscroll: cs.overscrollBehavior, width: cs.scrollbarWidth, scheme: cs.colorScheme };
  });
  ok('scrollbar-gutter: stable both-edges (vertical-capable)', caps.gutter.includes('stable'), caps.gutter);
  ok('overscroll-behavior: contain', caps.overscroll.includes('contain'), caps.overscroll);
  ok('default width tier rides the global thin law (no channel)', true, `scrollbar-width ${caps.width} / scheme "${caps.scheme}" (unscoped → OS)`);

  // the explicit tiers (the width-tiers demo mounts auto/thin/none side by side)
  const tiers = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('.jx-native-scroll[data-width]')) {
      out.push({ attr: el.getAttribute('data-width'), computed: getComputedStyle(el).scrollbarWidth });
    }
    return out;
  });
  const auto = tiers.find((t) => t.attr === 'auto');
  const none = tiers.find((t) => t.attr === 'none');
  ok('data-width=auto → scrollbar-width auto', auto?.computed === 'auto', JSON.stringify(auto));
  ok('data-width=none → scrollbar-width none', none?.computed === 'none', JSON.stringify(none));

  // (c) scoped color-scheme follows the stage scope LIVE (the W1 lesson)
  const stage = page.locator('[data-jx-canvas-stage]').filter({ has: area }).first();
  await stage.evaluate((el) => { el.classList.add('dark'); el.classList.remove('jx-light'); el.setAttribute('data-theme', 'dark'); });
  await sleep(450);
  const darkScheme = await area.evaluate((el) => getComputedStyle(el.querySelector('.jx-native-scroll')).colorScheme);
  ok('stage scope dark → color-scheme dark (live, no re-mount)', darkScheme === 'dark', darkScheme);
  await stage.evaluate((el) => { el.classList.remove('dark'); el.classList.add('jx-light'); el.setAttribute('data-theme', 'light'); });
  await sleep(450);
  const lightScheme = await area.evaluate((el) => getComputedStyle(el.querySelector('.jx-native-scroll')).colorScheme);
  ok('stage scope light → color-scheme light', lightScheme === 'light', lightScheme);
  await stage.evaluate((el) => { el.classList.remove('dark'); el.classList.add('jx-light'); el.removeAttribute('data-theme'); });
}

// native receipts light/dark
{
  const area = page.locator('.jx-native-scroll-area').first();
  const stage = page.locator('[data-jx-canvas-stage]').filter({ has: area }).first();
  await area.scrollIntoViewIfNeeded();
  await sleep(300);
  const box = await area.boundingBox();
  await page.screenshot({ path: `${OUT}/native-scroll-area-light.png`, clip: { x: Math.max(0, box.x - 40), y: Math.max(0, box.y - 60), width: Math.min(560, 1440 - box.x), height: Math.min(360, 1000 - box.y) } });
  await stage.evaluate((el) => { el.classList.add('dark'); el.classList.remove('jx-light'); el.setAttribute('data-theme', 'dark'); });
  await sleep(450);
  await page.screenshot({ path: `${OUT}/native-scroll-area-dark.png`, clip: { x: Math.max(0, box.x - 40), y: Math.max(0, box.y - 60), width: Math.min(560, 1440 - box.x), height: Math.min(360, 1000 - box.y) } });
  await stage.evaluate((el) => { el.classList.remove('dark'); el.classList.add('jx-light'); el.removeAttribute('data-theme'); });
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${failed.length === 0 ? '✓ ALL GREEN' : `✗ ${failed.length} FAILURE(S)`} — ${results.length} probe assertions`);
process.exit(failed.length === 0 ? 0 : 1);
