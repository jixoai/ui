#!/usr/bin/env node
/* 3a/3b 复现探针 — destructive-demo 上 Owner 的操作序列，逐步取证：
 * 每阶段的 ring 归属（hover/selected 的 box+badge）、chip（面板选中）、
 * 各点位的 elementFromPoint 归属。只派发 DOM 事件（等价于真实指针的事件
 * 路径），不改任何文件，不写 journal（选中不产生 op）。 */
import { createRequire } from 'node:module';
const require = createRequire('/Users/kzf/.npm/_npx/e41f203b7505f1fb/');
const { chromium } = require('playwright-core');

const BASE = 'http://localhost:5193';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1680, height: 1000 } });
const log = (...a) => console.log(...a);

async function ringState(cf) {
  return cf.evaluate(() => {
    const out = {};
    for (const kind of ['hover', 'selected']) {
      const el = document.querySelector(`[data-jx-indicator="${kind}"]`);
      if (el === null) { out[kind] = 'no-element'; continue; }
      out[kind] = {
        visible: el.style.opacity !== '0' && el.style.display !== 'none',
        at: el.style.transform, size: `${el.style.width}x${el.style.height}`,
        badge: el.querySelector('.jx-indicator-badge')?.textContent ?? null,
      };
    }
    return out;
  });
}
async function chip(page) {
  const n = await page.locator('[data-jx-chip], .chat-chip').count();
  return n > 0 ? (await page.locator('[data-jx-chip], .chat-chip').first().innerText()).replace(/\n/g, ' ') : '(none)';
}
const showRing = async (cf, tag) => { log(`   [ring] ${tag}:`, JSON.stringify(await ringState(cf))); };

/* DOM-event probes (equivalent to real pointer paths for the event-driven picker) */
const hoverOver = (frame, selector) => frame.evaluate((s) => {
  const el = document.querySelector(s);
  if (el === null) return 'no-element';
  el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  return 'ok';
}, selector);
const hoverLeave = (frame, selector) => frame.evaluate((s) => {
  const el = document.querySelector(s);
  if (el === null) return 'no-element';
  el.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: null }));
  return 'ok';
}, selector);
const domClick = (frame, selector) => frame.evaluate((s) => {
  const el = document.querySelector(s);
  if (el === null) return 'no-element';
  el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
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
  await sleep(1000); // let frames mount + picker settle

  const map = await cf.evaluate(() =>
    Array.from(document.querySelectorAll('[data-jx-component]')).map((el) => {
      const r = el.getBoundingClientRect();
      return { tag: el.tagName.toLowerCase(), comp: el.getAttribute('data-jx-component'),
        inst: el.getAttribute('data-jx-instance'), box: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}` };
    }));
  log('== canvas-doc stamped elements ==');
  for (const m of map) log(`   ${m.comp} #${m.inst} <${m.tag}> @${m.box}`);
  const fdocs = page.frames().filter((f) => f.url().includes('/__design__/frame'));
  log('== frame docs ==', fdocs.length);
  for (const f of fdocs) {
    const inner = await f.evaluate(() => Array.from(document.querySelectorAll('[data-jx-component]')).map((el) =>
      `${el.getAttribute('data-jx-component')} #${el.getAttribute('data-jx-instance')}`).join(', ')).catch(() => '(eval fail)');
    log(`   ${f.name()} → ${inner}`);
  }

  /* point attribution: who owns each canvas-doc point */
  const attr = await cf.evaluate(() => {
    const figs = Array.from(document.querySelectorAll('figure[data-jx-component]'));
    const dark = figs.find((f) => f.getAttribute('data-jx-instance') === '3') ?? figs.at(-1);
    const cap = dark.querySelector('figcaption')?.getBoundingClientRect();
    const ifr = dark.querySelector('iframe')?.getBoundingClientRect();
    const own = (x, y) => { const el = document.elementFromPoint(x, y); return el === null ? 'null' : `${el.tagName.toLowerCase()}${el.getAttribute?.('data-jx-component') ? `[${el.getAttribute('data-jx-component')}]` : ''}`; };
    return {
      inst: dark.getAttribute('data-jx-instance'),
      caption: cap && { pt: `${Math.round(cap.left + cap.width / 2)},${Math.round(cap.top + cap.height / 2)}`, owner: own(cap.left + cap.width / 2, cap.top + cap.height / 2) },
      iframeCenter: ifr && { pt: `${Math.round(ifr.left + ifr.width / 2)},${Math.round(ifr.top + ifr.height / 2)}`, owner: own(ifr.left + ifr.width / 2, ifr.top + ifr.height / 2) },
    };
  });
  log('== point attribution (canvas doc) ==', JSON.stringify(attr));

  const darkSel = 'figure[data-jx-component][data-jx-instance="3"]';
  const capSel = `${darkSel} figcaption`;

  log('\n== P0a: initial hover on dark-figure caption ==');
  log('   dispatch:', await hoverOver(cf, capSel)); await sleep(350); await showRing(cf, 'after caption hover');

  log('== P0b: initial CLICK on caption (select prototype-kit#3?) ==');
  log('   dispatch:', await domClick(cf, capSel)); await sleep(500);
  await showRing(cf, 'after caption click');
  log('   [chip ]', await chip(page));

  log('\n== P0c: hover on frame-internal UNSTAMPED area (kicker text) ==');
  const darkFrame = fdocs.find((f) => f.name().includes('dark')) ?? fdocs.at(-1);
  log('   dispatch:', await hoverOver(darkFrame, '.stage-kicker')); await sleep(350); await showRing(cf, 'after unstamped hover');
  log('   dispatch:', await hoverLeave(darkFrame, '.stage-kicker'));

  log('\n== P1: select press-button#1 inside dark frame ==');
  log('   dispatch:', await domClick(darkFrame, '[data-jx-component="press-button"][data-jx-instance="1"]'));
  await sleep(600); await showRing(cf, 'after pb#1 click');
  log('   [chip ]', await chip(page));

  log('\n== P2: select press-button#2 ==');
  log('   dispatch:', await domClick(darkFrame, '[data-jx-component="press-button"][data-jx-instance="2"]'));
  await sleep(600); await showRing(cf, 'after pb#2 click');
  log('   [chip ]', await chip(page));

  log('\n== P3: Owner\'s failing move — hover then click the dark-figure caption ==');
  log('   dispatch:', await hoverOver(cf, capSel)); await sleep(350); await showRing(cf, 'after caption hover');
  log('   dispatch:', await domClick(cf, capSel)); await sleep(600);
  await showRing(cf, 'after caption click');
  log('   [chip ]', await chip(page));

  log('\n== P4: a frame-doc resize (the adaptive-height path) — does the ring get stolen back? ==');
  await darkFrame.evaluate(() => window.dispatchEvent(new Event('resize')));
  await sleep(400); await showRing(cf, 'after frame resize');
  log('   [chip ]', await chip(page));

  log('\n== P5: caption hover once more after the steal ==');
  log('   dispatch:', await hoverOver(cf, capSel)); await sleep(350); await showRing(cf, 'after caption hover');
} catch (error) {
  console.error('PROBE FATAL:', error);
} finally {
  await browser.close();
}
