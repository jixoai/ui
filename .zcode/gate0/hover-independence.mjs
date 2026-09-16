#!/usr/bin/env node
/* hover 独立性探针：Owner 场景——select 容器后再 hover 帧内两个按钮，
 * 断言修复后两个按钮都必须能 hover（指示器独立工作）。 */
import { createRequire } from 'node:module';
const require = createRequire('/Users/kzf/.npm/_npx/e41f203b7505f1fb/');
const { chromium } = require('playwright-core');

const BASE = 'http://localhost:5193';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1680, height: 1000 } });
let failures = 0;
const check = (name, ok, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`); if (!ok) failures += 1; };

const hoverRing = (cf) => cf.evaluate(() => {
  const el = document.querySelector('[data-jx-indicator="hover"]');
  if (el === null) return null;
  return { visible: el.style.opacity !== '0' && el.style.display !== 'none', w: Number.parseFloat(el.style.width), x: Number.parseFloat((/translate\(([\d.]+)px/.exec(el.style.transform) ?? [])[1] ?? '0') };
});
const domClick = (frame, selector) => frame.evaluate((s) => { const el = document.querySelector(s); if (el === null) return 'no-element'; el.dispatchEvent(new MouseEvent('click', { bubbles: true })); return 'ok'; }, selector);
const hoverOver = (frame, selector) => frame.evaluate((s) => { const el = document.querySelector(s); if (el === null) return 'no-element'; el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); return 'ok'; }, selector);

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
  await sleep(1200);
  const light = page.frames().filter((f) => f.url().includes('/__design__/frame')).find((f) => f.name().includes('light'));
  const pb1 = '[data-jx-component="press-button"][data-jx-instance="1"]';
  const pb2 = '[data-jx-component="press-button"][data-jx-instance="2"]';
  const cap2 = 'figure[data-jx-component][data-jx-instance="2"] figcaption';

  // Owner's sequence: pick the button FIRST (the frame remembers it as selected),
  // then re-select the container — the frame's stale record is the poison
  await domClick(light, pb1); await sleep(500);
  await domClick(cf, cap2); await sleep(500);   // now the panel shows prototype-kit #2
  const chip = (await page.locator('[data-jx-chip], .chat-chip').first().innerText()).replace(/\n/g, ' ');
  check('setup: selection is prototype-kit #2 (container)', /PROTOTYPE-KIT #2/.test(chip), chip);

  await hoverOver(light, pb1); await sleep(350);
  const h1 = await hoverRing(cf);
  check('hover on Start designing (a formerly-selected button) PRESENTS the hover ring', h1 !== null && h1.visible, JSON.stringify(h1));

  await hoverOver(light, pb2); await sleep(350);
  const h2 = await hoverRing(cf);
  check('hover on Read the standard presents the hover ring', h2 !== null && h2.visible, JSON.stringify(h2));

  // and over the currently-selected container itself — independent indicators
  await hoverOver(cf, cap2); await sleep(350);
  const h3 = await hoverRing(cf);
  const sel = await cf.evaluate(() => document.querySelector('[data-jx-indicator="selected"]')?.getAttribute('style') ?? '');
  check('hover over the SELECTED container still presents the hover ring (independent indicators)', h3 !== null && h3.visible, `hover=${JSON.stringify(h3)} selectedRing=${sel.includes('opacity: 1') ? 'visible' : 'hidden'}`);
} catch (error) {
  console.error('PROBE FATAL:', error);
  failures += 1;
} finally {
  await browser.close();
}
console.log(`\n==== ${failures === 0 ? 'ALL GREEN' : `${failures} FAILURE(S)`} ====`);
process.exit(failures === 0 ? 0 : 1);
