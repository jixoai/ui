#!/usr/bin/env node
// Density kernel gate — serves the compiled CSS with a probe page and
// locks the four-row computed table + scope inheritance.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui/node_modules/playwright-core/index.mjs';

const CHROME = homedir() + '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const TABLE_ONLY = process.argv.includes('--table-only');

const TABLE = {
  xs: [11, 16, 8, 4, 8, 28, 44, 16, 32, 2, 10, 15],
  sm: [12, 18, 8, 4, 8, 32, 44, 18, 36, 2, 11, 16.5],
  default: [13, 20, 12, 8, 12, 40, 44, 20, 40, 4, 12, 18],
  lg: [15, 24, 16, 8, 16, 48, 48, 24, 48, 4, 14, 21],
};
const KEYS = ['text', 'line', 'gap', 'stack', 'inset', 'row-min', 'hit', 'icon', 'image', 'gap-content', 'text-secondary', 'line-secondary'];

const pub = resolve('public');
const cssDir = resolve(pub, '_app/immutable/assets');
const cssFile = '0.z_3UKwe6.css';
// properly strip @import/@layer/@theme from the SOURCE (at-rules that bare
// Chromium can't resolve in a fixture); tokens are preserved
// pre-process: strip at-rules bare Chromium can't resolve
function stripAtRules(css) {
  let result = '';
  let i = 0;
  while (i < css.length) {
    if (css.substring(i).startsWith('@import')) {
      const end = css.indexOf(';', i);
      i = end + 1;
    } else if (css.substring(i).match(/^@(layer|theme)/)) {
      const brace = css.indexOf('{', i);
      if (brace === -1) { result += css[i]; i++; continue; }
      let depth = 1;
      let j = brace + 1;
      while (j < css.length && depth > 0) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}') depth--;
        j++;
      }
      i = j;
    } else {
      result += css[i];
      i++;
    }
  }
  return result;
}
const rawCss = readFileSync(resolve('apps/www/src/lib/jixoai.css'), 'utf8');
const cssContent = stripAtRules(rawCss);

const probeHtml = `<!doctype html><html><head><meta charset="utf-8">
<style>${cssContent}
.p-text { font-size: var(--jx-text); }
.p-line { line-height: var(--jx-line); font-size: var(--jx-text); }
.p-gap { display: flex; column-gap: var(--jx-gap); }
.p-stack { display: flex; row-gap: var(--jx-stack); }
.p-inset { padding-inline-start: var(--jx-inset); }
.p-rowmin { min-height: var(--jx-row-min); }
.p-hitmin { min-height: var(--jx-hit); }
.p-micon { width: var(--jx-icon); }
.p-mimage { width: var(--jx-image); }
.p-cgap { display: flex; row-gap: var(--jx-gap-content); }
.p-stext { font-size: var(--jx-text-secondary); }
.p-sline { line-height: var(--jx-line-secondary); font-size: var(--jx-text-secondary); }
</style></head><body>
${Object.keys(TABLE).map((d) => `<div data-density="${d}" id="probe-${d}"><span class="p-text"></span><span class="p-line"></span><div class="p-gap"></div><div class="p-stack"></div><div class="p-inset"></div><div class="p-rowmin"></div><div class="p-hitmin"></div><div class="p-micon"></div><div class="p-mimage"></div><div class="p-cgap"></div><span class="p-stext"></span><span class="p-sline"></span></div>`).join('\n')}
<div data-jx-chrome id="probe-chrome"><span class="p-text"></span><span class="p-line"></span><div class="p-gap"></div><div class="p-stack"></div><div class="p-inset"></div><div class="p-rowmin"></div><div class="p-hitmin"></div><div class="p-micon"></div><div class="p-mimage"></div></div>
<div data-density="sm" id="probe-outer"><div data-density="xs" id="probe-inner"><span class="p-text" id="probe-nested"></span></div></div>
<span class="p-text" id="probe-root"></span>
</body></html>`;

const server = createServer((_, res) => {
  res.setHeader('content-type', 'text/html');
  res.end(probeHtml);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-proxy-server'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(500);

const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const read = await page.evaluate(() => {
  const px = (v) => parseFloat(v) || 0;
  const readOne = (id, cls) => {
    const el = document.querySelector(`#${id} .${cls}`) || document.getElementById(id);
    const cs = getComputedStyle(el);
    return { fs: cs.fontSize, lh: cs.lineHeight, cg: cs.columnGap, rg: cs.rowGap, pis: cs.paddingInlineStart, mh: cs.minHeight, w: cs.width };
  };
  const out = {};
  for (const scope of ['xs', 'sm', 'default', 'lg']) {
    const id = `probe-${scope}`;
    out[scope] = {
      text: px(readOne(id, 'p-text').fs),
      line: px(readOne(id, 'p-line').lh),
      gap: px(readOne(id, 'p-gap').cg),
      stack: px(readOne(id, 'p-stack').rg),
      inset: px(readOne(id, 'p-inset').pis),
      'row-min': px(readOne(id, 'p-rowmin').mh),
      hit: px(readOne(id, 'p-hitmin').mh),
      icon: px(readOne(id, 'p-micon').w),
      image: px(readOne(id, 'p-mimage').w),
      'gap-content': px(readOne(id, 'p-cgap').rg),
      'text-secondary': px(readOne(id, 'p-stext').fs),
      'line-secondary': px(readOne(id, 'p-sline').lh),
    };
  }
  // the chrome scope (chrome-density-tier): its OWN pinned band, not a
  // density TABLE row — hit is 2×icon and image == hit here, NOT the
  // density rows' icon == line / image == 2×line laws
  out.chrome = {
    text: px(readOne('probe-chrome', 'p-text').fs),
    line: px(readOne('probe-chrome', 'p-line').lh),
    gap: px(readOne('probe-chrome', 'p-gap').cg),
    stack: px(readOne('probe-chrome', 'p-stack').rg),
    inset: px(readOne('probe-chrome', 'p-inset').pis),
    'row-min': px(readOne('probe-chrome', 'p-rowmin').mh),
    hit: px(readOne('probe-chrome', 'p-hitmin').mh),
    icon: px(readOne('probe-chrome', 'p-micon').w),
    image: px(readOne('probe-chrome', 'p-mimage').w),
  };
  out.nested = px(getComputedStyle(document.getElementById('probe-nested')).fontSize);
  out.root = px(getComputedStyle(document.getElementById('probe-root')).fontSize);
  out.unit = getComputedStyle(document.documentElement).getPropertyValue('--jx-unit').trim();
  return out;
});

check('ruler unit computes', read.unit === '0.25rem', read.unit);
for (const [density, row] of Object.entries(TABLE)) {
  for (let i = 0; i < KEYS.length; i++) {
    const got = read[density][KEYS[i]];
    check(`${density} ${KEYS[i]} = ${row[i]}px`, got === row[i], `got ${got}`);
  }
}
for (const d of Object.keys(TABLE)) {
  check(`${d} image == 2x line`, read[d].image === 2 * read[d].line);
  check(`${d} icon == line`, read[d].icon === read[d].line);
}
// chrome band: pinned pointer-modality values + its own invariants
const CHROME_BAND = { text: 12, line: 18, gap: 8, stack: 4, inset: 8, hit: 32, icon: 16, image: 32 };
for (const [k, v] of Object.entries(CHROME_BAND)) {
  check(`chrome ${k} = ${v}px`, read.chrome[k] === v, `got ${read.chrome[k]}`);
}
check('chrome hit == 2x icon', read.chrome.hit === 2 * read.chrome.icon);
check('chrome image == hit (the one band)', read.chrome.image === read.chrome.hit);
// unpinned aliases fall through to the ambient density scope (default at root)
check('chrome row-min falls through to ambient (40)', read.chrome['row-min'] === 40, `got ${read.chrome['row-min']}`);
check('nested scope overrides', read.nested === 11, `got ${read.nested}`);
check('root defaults to 13px', read.root === 13, `got ${read.root}`);

if (!TABLE_ONLY) {
  const itemCss = readFileSync(resolve('apps/www/src/lib/ui/list-item/item.css'), 'utf8');
  const stripped = itemCss.replace(/\/\*[\s\S]*?\*\//g, '');
  check('no [data-density]/[data-size] in list-item css', !/\[data-(density|size)=/.test(stripped));
  check('list-item consumes --jx-* tokens', /var\(--jx-(text|gap|inset|hit|icon|image|row)/.test(stripped));
}

await browser.close();
server.close();
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed${TABLE_ONLY ? ' (table section)' : ''}`);
process.exit(failed ? 1 : 0);
