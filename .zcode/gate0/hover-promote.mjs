#!/usr/bin/env node
/* 真实鼠标探针：select 帧内按钮后，指针留在 prototype-kit 内的
 * 非组件区域（kicker/空白）——hover 应当升格到容器（修复后），
 * 现状预期复现 Owner 观察：无 hover 环，必须离开容器再回来。 */
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
  return { visible: el.style.opacity !== '0' && el.style.display !== 'none', w: Math.round(Number.parseFloat(el.style.width) || 0) };
});
const box = async (frame, selector) => {
  const el = frame.locator(selector).first();
  return el.boundingBox(); // PAGE-level coordinates — real-mouse ready
};

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

  // 1. REAL click on the frame button (pointer stays inside the kit afterwards)
  const pb1Box = await box(light, pb1);
  if (pb1Box === null) throw new Error('pb1 not found');
  await page.mouse.move(pb1Box.x + pb1Box.width / 2, pb1Box.y + pb1Box.height / 2, { steps: 6 });
  await page.mouse.down(); await page.mouse.up();
  await sleep(600);
  const chip = (await page.locator('[data-jx-chip], .chat-chip').first().innerText()).replace(/\n/g, ' ');
  check('setup: real click selected press-button #1', /PRESS-BUTTON #1/.test(chip), chip);

  // 2. pointer moves to a NON-stamped area INSIDE the same kit (the kicker line)
  const kickerBox = await box(light, '.stage-kicker');
  if (kickerBox === null) throw new Error('kicker not found');
  await page.mouse.move(kickerBox.x + kickerBox.width / 2, kickerBox.y + kickerBox.height / 2, { steps: 8 });
  await sleep(400);
  let h = await hoverRing(cf);
  check('hover PROMOTES to the kit container from a non-stamped spot inside the frame', h !== null && h.visible && h.w > 300, `hover=${JSON.stringify(h)} (expect the ~392px figure)`);

  // 3. caption still works (the canvas-owned path)
  const capBox = await box(cf, 'figure[data-jx-component][data-jx-instance="2"] figcaption');
  await page.mouse.move(capBox.x + capBox.width / 2, capBox.y + capBox.height / 2, { steps: 8 });
  await sleep(400);
  h = await hoverRing(cf);
  check('hover on the caption keeps working', h !== null && h.visible && h.w > 300, JSON.stringify(h));

  // 4. back onto the button itself — hover returns to the button (nearest ancestor)
  await page.mouse.move(pb1Box.x + pb1Box.width / 2, pb1Box.y + pb1Box.height / 2, { steps: 8 });
  await sleep(400);
  h = await hoverRing(cf);
  check('hover back on the button rings the button (~143px)', h !== null && h.visible && h.w < 250, JSON.stringify(h));

  // 5. the click twin: a REAL click on the unstamped kicker selects the kit container
  await page.mouse.move(kickerBox.x + kickerBox.width / 2, kickerBox.y + kickerBox.height / 2, { steps: 6 });
  await page.mouse.down(); await page.mouse.up();
  await sleep(600);
  const chip2 = (await page.locator('[data-jx-chip], .chat-chip').first().innerText()).replace(/\n/g, ' ');
  check('real click on unstamped frame ground SELECTS the kit container', /PROTOTYPE-KIT/.test(chip2), chip2);
  const sel = await cf.evaluate(() => {
    const el = document.querySelector('[data-jx-indicator="selected"]');
    return el === null ? null : { visible: el.style.opacity !== '0', badge: el.querySelector('.jx-indicator-badge')?.textContent ?? '' };
  });
  check('the selection ring follows the promoted container', sel !== null && sel.visible && /prototype-kit/.test(sel.badge), JSON.stringify(sel));
} catch (error) {
  console.error('PROBE FATAL:', error);
  failures += 1;
} finally {
  await browser.close();
}
console.log(`\n==== ${failures === 0 ? 'ALL GREEN' : `${failures} FAILURE(S)`} ====`);
process.exit(failures === 0 ? 0 : 1);
