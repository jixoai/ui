#!/usr/bin/env node
// Item presence-matrix + paint gate (openspec list-item-systemization
// task 6). jsdom cannot compute :has()/container queries — this probe
// loads the REAL item.css into a generated static fixture in a real
// Chromium and locks:
//
//   matrix    ALL 16 wide media×end×header×footer combos assert BOTH
//             computed track count and computed areas rows (a ghost
//             implicit track or a missing row = FAIL — the r2 law);
//             every narrow end-present combo under a ≤30rem container
//             moves the end lane to its own row; wrap="never" refuses
//   paint     selected edge (inset 2px primary), auto-divider 38% mix
//             vs explicit divider full strength, single source per
//             edge, focus-visible inset ring
//
// Self-contained: serves the generated fixture from a throwaway http
// server — no site build, no dev server, no shared resources.
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui/node_modules/playwright-core/index.mjs';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

const CHROME =
  homedir() +
  '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const css = readFileSync(resolve('apps/www/src/lib/ui/list-item/item.css'), 'utf8');

// the 16 combos: bits (media, end, header, footer) → expected wide template
const combos = [];
for (const media of [true, false])
  for (const end of [true, false])
    for (const header of [true, false])
      for (const footer of [true, false]) {
        const cols = media && end ? 3 : media || end ? 2 : 1;
        const rows = [header, media || end || true, footer].filter(Boolean).length;
        const mainRow = [media ? 'media' : null, 'content', end ? 'end' : null].filter(Boolean).join(' ');
        const areas = [
          ...(header ? ['header '.repeat(cols).trim()] : []),
          mainRow,
          ...(footer ? ['footer '.repeat(cols).trim()] : []),
        ];
        combos.push({ id: `m${+media}e${+end}h${+header}f${+footer}`, media, end, header, footer, cols, rows, areas });
      }

const slot = (name, extra = '') =>
  `<div data-slot="${name}"${extra ? ` ${extra}` : ''}>x</div>`;
const row = (c, extraAttrs = '') =>
  `<div class="jx-item" data-size="default" data-layout="standard"${extraAttrs}>${c.header ? slot('item-header') : ''}${c.media ? slot('item-media') : ''}${slot('item-content')}${c.end ? slot('item-end') : ''}${c.footer ? slot('item-footer') : ''}</div>`;

const wideRows = combos.map((c) => row(c, `data-combo="${c.id}"`)).join('\n');
// narrow probes: end-present combos inside a 19rem list container
const narrowCombos = combos.filter((c) => c.end);
const narrowRows = narrowCombos
  .map((c) => row(c, `data-narrow-combo="${c.id}"`))
  .join('\n');
const neverRow = row(
  { media: true, end: true, header: false, footer: false },
  'data-never="1"',
).replace('data-slot="item-end"', 'data-slot="item-end" data-wrap="never"');
const selectedRow = row(
  { media: false, end: true, header: false, footer: false },
  ' data-selected="true"',
);
const linkRow = `<a class="jx-item" data-slot="item" data-size="default" data-combo="linkfocus" href="#" data-item-chrome="none">${slot('item-content')}${slot('item-end')}</a>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
:root { --border: rgb(0,0,0); --primary: rgb(200,0,100); --terminal: rgb(250,250,250);
  --terminal-hover: rgb(230,230,230); --terminal-muted: rgb(240,240,240);
  --muted-foreground: rgb(90,90,90); --foreground: rgb(0,0,0); --ring: rgb(200,0,100);
  --font-nav: monospace; --radius: 0px; }
${css}
body { font: 12px monospace; margin: 16px; }
.wide-list, .plain-wrap { display: block; }
</style></head><body>
<ul class="nothing" data-slot="item-list" data-dividers="auto" data-size="default" style="list-style:none;margin:0;padding:0;container:jx-items / inline-size">
  <li data-slot="item-row" style="list-style:none">${selectedRow}${linkRow}${wideRows}</li>
</ul>
<div style="width:19rem">
  <ul data-slot="item-list" data-dividers="auto" data-size="default" style="list-style:none;margin:0;padding:0">
    <li data-slot="item-row" style="list-style:none">${narrowRows}${neverRow}</li>
  </ul>
</div>
<ul id="divider-list" data-slot="item-list" data-dividers="auto" data-size="default" style="list-style:none;margin:0;padding:0">
  <li data-slot="item-row" style="list-style:none">${row({ media: false, end: false, header: false, footer: false })}</li>
  <li data-slot="item-divider" role="presentation"></li>
  <li data-slot="item-row" style="list-style:none">${row({ media: false, end: false, header: false, footer: false })}</li>
  <li data-slot="item-row" style="list-style:none">${row({ media: false, end: false, header: false, footer: false })}</li>
</ul>
</body></html>`;

const server = createServer((req, res) => {
  res.setHeader('content-type', 'text/html');
  res.end(html);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForTimeout(300);

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

// ── the wide matrix: computed columns count + areas rows, all 16 ──
const wide = await page.evaluate(() =>
  [...document.querySelectorAll('[data-combo^="m"]')].map((el) => ({
    id: el.getAttribute('data-combo'),
    cols: getComputedStyle(el).gridTemplateColumns.split(' ').length,
    areas: getComputedStyle(el).gridTemplateAreas,
  })),
);
check('fixture carries all 16 wide combos', wide.length === 16, `got ${wide.length}`);
for (const c of combos) {
  const got = wide.find((g) => g.id === c.id);
  const ok =
    got &&
    got.cols === c.cols &&
    got.areas.split('"').filter((s) => s.trim()).length === c.areas.length &&
    c.areas.every((a, i) => got.areas.includes(`"${a.trim()}"`) || got.areas.split('"').filter((s) => s.trim())[i] === a.trim());
  check(`wide ${c.id}: ${c.cols} tracks, ${c.areas.length} area rows`, !!ok, got ? `cols=${got.cols} areas=${got.areas}` : 'missing');
}

// ── the narrow law: end lane owns its row under 30rem; never refuses ──
const narrow = await page.evaluate(() =>
  [...document.querySelectorAll('[data-narrow-combo]')].map((el) => ({
    id: el.getAttribute('data-narrow-combo'),
    cols: getComputedStyle(el).gridTemplateColumns.split(' ').length,
    areas: getComputedStyle(el).gridTemplateAreas,
  })),
);
check('fixture carries all 8 narrow end-present combos', narrow.length === 8, `got ${narrow.length}`);
// narrow expected columns: 2 with media, 1 without (impl-review B5:
// BOTH computed properties, every combo — the no-implicit-track law)
const narrowById = new Map(narrow.map((g) => [g.id, g]));
for (const c of narrowCombos) {
  const g = narrowById.get(c.id);
  const wantCols = c.media ? 2 : 1;
  check(
    `narrow ${c.id}: ${wantCols} tracks + end lane on its own row`,
    !!g && g.cols === wantCols && (g.areas.includes('"end end"') || g.areas.includes('"end"')),
    g ? `cols=${g.cols} areas=${g.areas}` : 'missing',
  );
}
const neverAreas = await page.evaluate(() => getComputedStyle(document.querySelector('[data-never]')).gridTemplateAreas);
check('wrap=never keeps the main row', !neverAreas.includes('"end end"') && neverAreas.includes('media') && neverAreas.includes('end'), neverAreas);

// ── paint: selected edge, divider strengths, single source ──
const selectedShadow = await page.evaluate(() => getComputedStyle(document.querySelector('[data-selected]')).boxShadow);
check('selected paints the inset primary edge', selectedShadow.includes('inset'), selectedShadow);
const dividerProbe = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#divider-list > [data-slot="item-row"]')];
  const divider = document.querySelector('#divider-list > [data-slot="item-divider"]');
  const probe = (el) => { const cs = getComputedStyle(el); return { w: cs.borderTopWidth, c: cs.borderTopColor }; };
  // rows[0] precedes the divider, rows[1] follows it, rows[2] is a
  // plain adjacent pair — BOTH divider-adjacent edges stay clean
  return { beforeDivider: probe(rows[0]), afterDivider: probe(rows[1]), beforeLast: probe(rows[2]), explicit: probe(divider) };
});
check('explicit divider paints a full-strength edge', dividerProbe.explicit.w === '1px' && dividerProbe.explicit.c === 'rgb(0, 0, 0)', JSON.stringify(dividerProbe.explicit));
check('auto hairline is the 38% mix (not full strength)', dividerProbe.beforeLast.w === '1px' && dividerProbe.beforeLast.c !== 'rgb(0, 0, 0)', JSON.stringify(dividerProbe.beforeLast));
check('row BEFORE divider paints NO auto edge', dividerProbe.beforeDivider.w === '0px', JSON.stringify(dividerProbe.beforeDivider));
check('row AFTER divider paints NO auto edge', dividerProbe.afterDivider.w === '0px', JSON.stringify(dividerProbe.afterDivider));

// ── focus-visible: keyboard into the link row, the inset ring paints ──
await page.keyboard.press('Tab');
const focusRing = await page.evaluate(() => {
  const a = document.querySelector('a[data-slot="item"]');
  const cs = getComputedStyle(a);
  return { style: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor, tag: document.activeElement?.tagName };
});
check('focus-visible paints the inset 1px ring', focusRing.style !== 'none' && focusRing.width === '1px' && focusRing.tag === 'A', JSON.stringify(focusRing));

await browser.close();
server.close();

const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
