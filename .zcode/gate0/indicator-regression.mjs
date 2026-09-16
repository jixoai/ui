#!/usr/bin/env node
/* 断言式回归 — acceptance-fixes 后的 indicator 行为律。
 * 覆盖：P3 主断言（重选容器 ring 必须跟随）、迟到上报不得抢占、
 * 帧内 BCR 尺寸跟随（RO）、宿主布局平移跟随（MO→rehost）。 */
import { createRequire } from 'node:module';
const require = createRequire('/Users/kzf/.npm/_npx/e41f203b7505f1fb/');
const { chromium } = require('playwright-core');

const BASE = 'http://localhost:5193';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1680, height: 1000 } });

let failures = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures += 1;
}

const ring = (cf) => cf.evaluate(() => {
  const out = {};
  for (const kind of ['hover', 'selected']) {
    const el = document.querySelector(`[data-jx-indicator="${kind}"]`);
    if (el === null) { out[kind] = null; continue; }
    const m = /translate\(([\d.]+)px, ([\d.]+)px\)/.exec(el.style.transform ?? '');
    out[kind] = {
      visible: el.style.opacity !== '0' && el.style.display !== 'none',
      x: m ? Number(m[1]) : null, y: m ? Number(m[2]) : null,
      w: Number.parseFloat(el.style.width), h: Number.parseFloat(el.style.height),
      badge: el.querySelector('.jx-indicator-badge')?.textContent ?? null,
    };
  }
  return out;
});
const chip = async () => {
  const n = await page.locator('[data-jx-chip], .chat-chip').count();
  return n > 0 ? (await page.locator('[data-jx-chip], .chat-chip').first().innerText()).replace(/\n/g, ' ') : '(none)';
};
const domClick = (frame, selector) => frame.evaluate((s) => {
  const el = document.querySelector(s);
  if (el === null) return 'no-element';
  el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  return 'ok';
}, selector);
const hoverOver = (frame, selector) => frame.evaluate((s) => {
  const el = document.querySelector(s);
  if (el === null) return 'no-element';
  el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  return 'ok';
}, selector);

try {
  await page.goto(`${BASE}/__design__/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.studio-canvas', { timeout: 30_000 });
  await page.locator('.studio-canvas', { hasText: 'destructive-demo' }).first().click();
  await page.waitForSelector('.studio-preview iframe', { timeout: 30_000 });
  let cf = null;
  for (let i = 0; i < 60 && cf === null; i++) {
    cf = page.frames().filter((f) => f.url().includes('/prototypes/destructive-demo')).at(-1) ?? null;
    if (cf !== null) await cf.waitForLoadState('load', { timeout: 20_000 }).catch(() => {});
    else await sleep(250);
  }
  if (cf === null) throw new Error('canvas doc not found');
  await sleep(1200); // frames mount + picker settle
  const fdocs = page.frames().filter((f) => f.url().includes('/__design__/frame'));
  const dark = fdocs.find((f) => f.name().includes('dark')) ?? fdocs.at(-1);
  const capSel = 'figure[data-jx-component][data-jx-instance="3"] figcaption';
  const pb1 = '[data-jx-component="press-button"][data-jx-instance="1"]';

  /* 1. initial container pick — ring follows (the "normal" Owner saw) */
  await domClick(cf, capSel); await sleep(500);
  let r = await ring(cf); let c = await chip();
  check('1 initial pick: ring on the figure', r.selected?.visible === true && /prototype-kit #3/.test(r.selected.badge ?? ''), `badge=${r.selected?.badge}`);
  check('1 chip names prototype-kit #3', /PROTOTYPE-KIT #3/.test(c), c);
  const figBox0 = { x: r.selected.x, w: r.selected.w };

  /* 2. frame-internal picks — ring follows into the frame */
  await domClick(dark, pb1); await sleep(600);
  r = await ring(cf); c = await chip();
  check('2 frame pick: ring on press-button #1', /press-button #1/.test(r.selected?.badge ?? ''), `badge=${r.selected?.badge}`);
  check('2 chip names press-button #1', /PRESS-BUTTON #1/.test(c), c);

  /* 3. THE P3 regression — re-pick the container: the ring MUST move */
  await domClick(cf, capSel); await sleep(600);
  r = await ring(cf); c = await chip();
  check('3 re-pick container: ring MOVED to the figure', r.selected?.visible === true && /prototype-kit #3/.test(r.selected?.badge ?? ''), `badge=${r.selected?.badge}`);
  check('3 chip switched to prototype-kit #3', /PROTOTYPE-KIT #3/.test(c), c);

  /* 4. the stale frame's late refresh must not steal it back */
  await darkFrameResize(dark); await sleep(400);
  r = await ring(cf);
  check('4 late frame refresh does not steal the ring', /prototype-kit #3/.test(r.selected?.badge ?? ''), `badge=${r.selected?.badge}`);

  /* 5. hover a DIFFERENT figure's caption (not the selected one — the
   * hover ring hides over the selection by #46's twin law) */
  await hoverOver(cf, 'figure[data-jx-component][data-jx-instance="2"] figcaption'); await sleep(400);
  r = await ring(cf);
  check('5 hover ring on figure #2', r.hover?.visible === true && Math.abs((r.hover.x ?? 999) - 24) < 4, `hover=${JSON.stringify(r.hover)}`);

  /* 6. BCR size follow (law: refresh on resize) — grow the selected frame button */
  await domClick(dark, pb1); await sleep(600);
  r = await ring(cf);
  const w0 = r.selected?.w ?? 0;
  await dark.evaluate((s) => { const el = document.querySelector(s); if (el) el.style.width = '260px'; }, pb1);
  await sleep(700); // RO → scheduleTrack → refresh report
  r = await ring(cf);
  check('6 frame BCR resize: ring follows (width grew)', (r.selected?.w ?? 0) > w0 + 80, `w ${w0} → ${r.selected?.w}`);
  await dark.evaluate((s) => { const el = document.querySelector(s); if (el) el.style.width = ''; }, pb1);
  await sleep(500);

  /* 7. host layout translation follow — shift the figure, frame-owned ring re-hosts */
  await domClick(cf, capSel); await sleep(400); // frame-owned → canvas-owned? no: caption pick = canvas-owned.
  // for the frame-owned path, pick the frame button first, then move the figure
  await domClick(dark, pb1); await sleep(600);
  r = await ring(cf);
  const x0 = r.selected?.x ?? 0;
  await cf.evaluate(() => {
    const fig = document.querySelector('figure[data-jx-component][data-jx-instance="3"]');
    if (fig) fig.style.marginLeft = '120px';
  });
  await sleep(800); // MO → trackIndicators → rehostFrameRings
  r = await ring(cf);
  check('7 host layout shift: frame-owned ring re-hosts', (r.selected?.x ?? 0) > x0 + 80, `x ${x0} → ${r.selected?.x}`);
} catch (error) {
  console.error('PROBE FATAL:', error);
  failures += 1;
} finally {
  await browser.close();
}
console.log(`\n==== ${failures === 0 ? 'ALL GREEN' : `${failures} FAILURE(S)`} ====`);
process.exit(failures === 0 ? 0 : 1);

async function darkFrameResize(fr) {
  await fr.evaluate(() => window.dispatchEvent(new Event('resize')));
}
