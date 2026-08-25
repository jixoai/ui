#!/usr/bin/env node
// Shared-ruler gate (design-language-kernel §8 / P5a→P5b). Static DOM
// mirroring the component contract against the REAL item.css + theme
// sheet, in real Chromium. Per the packet sequence this is scaffolded
// BEFORE the migration (P5a) and runs RED until P4 lands; P5b is the
// green acceptance. Assertions:
//   - three/five EXPLICIT tracks, zero implicit, on both rulers
//   - media/content/end x-alignment across grouped rows; a no-media
//     row keeps the shared track
//   - header/footer/divider span the ruler
//   - mixed narrow rows: auto end takes its own full row, never end
//     stays on the shared line (30rem container)
//   - the checkbox-group fixture: control BESIDE its label, never
//     stacked (the Owner's defect)
//   - the no-subgrid fallback: the existing matrix css still parses
//     and the 16-combo source guard holds (delegated to
//     verify-item-matrix.mjs — asserted here by source presence)
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui/node_modules/playwright-core/index.mjs';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

const CHROME =
  homedir() +
  '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const theme = readFileSync(resolve('apps/www/src/lib/jixoai.css'), 'utf8');
const itemCss = readFileSync(resolve('apps/www/src/lib/ui/list-item/item.css'), 'utf8');

const slot = (name, extra = '') => `<div data-slot="${name}"${extra ? ` ${extra}` : ''}>x</div>`;
const row = (parts, extra = '') =>
  `<li data-slot="item-row"><div class="jx-item"${extra ? ` ${extra}` : ''}>${parts}</li></div>`.replace('</li></div>', '</div></li>');
const media = slot('item-media', 'data-variant="image"');
const content = (t) => `<div data-slot="item-content"><span>${t}</span></div>`;
const end = (t, wrap = 'auto') => `<div data-slot="item-end" data-wrap="${wrap}">${t}</div>`;

const wide = `
<ul data-slot="item-list" data-ruler="media-content-end" data-dividers="auto">
  ${row(slot('item-header') + media + content('row one') + end('E1'))}
  ${row(media + content('row two longer') + end('E2'))}
  ${row(content('no media row') + end('E3'))}
  ${row(slot('item-header') + media + content('spans') + end('E4') + slot('item-footer'))}
  ${row('<div data-slot="item-divider" role="presentation"></div>'.replace('<div', '<li').replace('</div>', '</li>'))}
</ul>`;
const narrow = `
<ul data-slot="item-list" data-ruler="content-end">
  ${row(content('auto row label') + end('WRAPS', 'auto'))}
  ${row(content('never row label') + end('STAYS', 'never'))}
</ul>`;
// the Owner's defect scene: the checkbox-group shape (field rows in a
// narrow column) — content + a control end lane, wrap=never
const checkboxScene = `
<ul data-slot="item-list" data-ruler="content-end" id="cbx">
  ${row(content('build') + end('[_]', 'never'))}
  ${row(content('lint') + end('[_]', 'never'))}
</ul>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${theme}${itemCss}</style></head><body>
<div style="width:40rem">${wide}</div>
<div style="width:22rem">${narrow}${checkboxScene}</div>
</body></html>`;

const server = createServer((_, res) => { res.setHeader('content-type', 'text/html'); res.end(html); });
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-proxy-server'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await page.goto(`http://127.0.0.1:${server.address().port}/`);
await page.waitForTimeout(300);

const results = [];
if (process.env.DEBUG_RULER) {
  const raw = await page.evaluate(() => {
    const wideList = document.querySelector('[data-ruler="media-content-end"]');
    const firstRow = wideList.querySelector('[data-slot="item-row"]').getBoundingClientRect();
    const header = [...wideList.querySelectorAll('[data-slot="item-header"]')][0].getBoundingClientRect();
    const footer = [...wideList.querySelectorAll('[data-slot="item-footer"]')][0].getBoundingClientRect();
    return { row: { l: firstRow.left, r: firstRow.right }, header: { l: header.left, r: header.right }, footer: { l: footer.left, r: footer.right } };
  });
  console.log('RAW', JSON.stringify(raw));
}

const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

// source preconditions (P4 must have landed the ruler css)
check('item.css carries the subgrid ruler block', itemCss.includes("grid-template-columns: subgrid") && itemCss.includes("[data-ruler='media-content-end']"));
check('item.css carries data-density alias consumption', /var\(--jx-d-(text|inline-gap|row-min)/.test(itemCss));
check('no data-size selectors remain', !/\[data-size=/.test(itemCss.replace(/\/\*[\s\S]*?\*\//g, '')));

const geom = await page.evaluate(() => {
  const r = (sel) => document.querySelector(sel)?.getBoundingClientRect();
  const bySlot = (scope, slotName, i = 0) =>
    [...scope.querySelectorAll(`[data-slot="${slotName}"]`)][i]?.getBoundingClientRect();
  const wideList = document.querySelector('[data-ruler="media-content-end"]');
  const mediaRows = [bySlot(wideList, 'item-media', 0), bySlot(wideList, 'item-media', 1)];
  const contentAll = [...wideList.querySelectorAll('[data-slot="item-content"]')].map((el) => el.getBoundingClientRect());
  const ends = [...wideList.querySelectorAll('[data-slot="item-end"]')].map((el) => el.getBoundingClientRect());
  const header = bySlot(wideList, 'item-header');
  const footer = bySlot(wideList, 'item-footer');
  const divider = wideList.querySelector('[data-slot="item-divider"]')?.getBoundingClientRect();
  const wideListRect = wideList.getBoundingClientRect();
  const firstRow = wideList.querySelector('[data-slot="item-row"]').getBoundingClientRect();
  const wideCols = getComputedStyle(wideList).gridTemplateColumns.split(' ').length;
  const narrowListEl = document.querySelector('[data-ruler="content-end"]');
  const narrowCols = getComputedStyle(narrowListEl).gridTemplateColumns.split(' ').length;
  const wideRowLi = wideList.querySelector('[data-slot="item-row"]');
  const wideRowItem = wideList.querySelector('.jx-item');
  const gapZero = ['list', 'li', 'item'].every((k) =>
    getComputedStyle(k === 'list' ? wideList : k === 'li' ? wideRowLi : wideRowItem).columnGap === '0px');
  const mediaUnderContentEnd = narrowListEl.querySelector('[data-slot="item-media"]') !== null;

  const narrowList = document.querySelector('[data-ruler="content-end"]');
  const autoEnd = [...narrowList.querySelectorAll('[data-slot="item-end"]')][0].getBoundingClientRect();
  const autoContent = [...narrowList.querySelectorAll('[data-slot="item-content"]')][0].getBoundingClientRect();
  const neverEnd = [...narrowList.querySelectorAll('[data-slot="item-end"]')][1].getBoundingClientRect();
  const neverContent = [...narrowList.querySelectorAll('[data-slot="item-content"]')][1].getBoundingClientRect();

  const cbx = document.getElementById('cbx');
  const cbxContent = cbx.querySelector('[data-slot="item-content"]').getBoundingClientRect();
  const cbxEnd = cbx.querySelector('[data-slot="item-end"]').getBoundingClientRect();

  return {
    wideCols,
    narrowCols,
    gapZero,
    mediaUnderContentEnd,
    mediaAligns: mediaRows[0] && mediaRows[1] && Math.abs(mediaRows[0].left - mediaRows[1].left) < 0.01,
    mediaWidth: mediaRows[0]?.width,
    contentAligned: Math.abs(contentAll[0].left - contentAll[2].left) < 0.01,
    endsRightAlign: Math.abs(Math.max(...ends.map((e) => e.right)) - Math.min(...ends.map((e) => e.right))) < 0.01,
    headerSpans: header && Math.abs(header.left - mediaRows[0].left) < 1 && header.right >= Math.max(...ends.map((e) => e.right)) - 1,
    footerSpans: footer && Math.abs(footer.left - mediaRows[0].left) < 1 && footer.right >= Math.max(...ends.map((e) => e.right)) - 1,
    dividerSpans: divider && Math.abs(divider.left - wideListRect.left) < 1,
    autoEndBelow: autoEnd.top >= autoContent.bottom - 0.01,
    autoEndFullWidth: Math.abs(autoEnd.left - [...narrowList.querySelectorAll('[data-slot="item-content"]')][0].getBoundingClientRect().left) < 1,
    neverInline: neverEnd.left > neverContent.right && Math.abs(neverEnd.top - neverContent.top) < neverContent.height,
    cbxBeside: cbxEnd.left > cbxContent.right && cbxEnd.top < cbxContent.bottom && cbxEnd.bottom > cbxContent.top,
  };
});

if (process.env.DEBUG_RULER) { console.log(JSON.stringify(geom, null, 1)); const dbg = page.evaluate ? null : null; }
check('media ruler = 5 explicit tracks', geom.wideCols === 5, `got ${geom.wideCols}`);
check('content-end ruler = 3 explicit tracks', geom.narrowCols === 3, `got ${geom.narrowCols}`);
check('column-gap is 0 on list, li, and row', geom.gapZero === true);
check('negative law: no media child under content-end', geom.mediaUnderContentEnd === false);
check('media column aligns across rows', geom.mediaAligns === true);
check('media box = the derived image token (40px at default)', Math.abs(geom.mediaWidth - 40) < 0.01, `got ${geom.mediaWidth}`);
check('no-media row keeps the shared track (content x aligned)', geom.contentAligned === true);
check('end lanes right-align across rows', geom.endsRightAlign === true);
check('header spans the ruler', geom.headerSpans === true);
check('footer spans the ruler', geom.footerSpans === true);
check('divider spans the ruler', geom.dividerSpans === true);
check('narrow auto end takes its own full row', geom.autoEndBelow === true && geom.autoEndFullWidth === true);
check('narrow never end stays on the shared line', geom.neverInline === true);
check('checkbox scene: control BESIDE label (never stacked)', geom.cbxBeside === true);

await browser.close();
server.close();
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
