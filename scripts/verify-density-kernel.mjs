#!/usr/bin/env node
// Density kernel gate (design-language-kernel §8 / P5a+P2). Loads the
// REAL theme sheet into a generated static page in real Chromium and
// locks the four-row computed table + scope inheritance. `--table-only`
// scopes the run to the computed-table section (the P2 gate, before
// list-item migration lands); the full run adds the §7 grep pass over
// list-item css (P5b).
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui/node_modules/playwright-core/index.mjs';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

const CHROME =
  homedir() +
  '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const TABLE_ONLY = process.argv.includes('--table-only');

const css = readFileSync(resolve('apps/www/src/lib/jixoai.css'), 'utf8');

// the four-row contract (design §1) — text/line/inline-gap/stack-gap/
// inset/row-min/hit-min/icon/image, in px at the 16px root
const TABLE = {
  // text line inline stack inset rowmin hit icon image cGap secText secLine
  xs: [11, 16, 8, 4, 8, 28, 44, 16, 32, 2, 10, 15],
  sm: [12, 18, 8, 4, 8, 32, 44, 18, 36, 2, 11, 16.5],
  default: [13, 20, 12, 8, 12, 40, 44, 20, 40, 4, 12, 18],
  lg: [15, 24, 16, 8, 16, 48, 48, 24, 48, 4, 14, 21],
};
const KEYS = [
  'text', 'line', 'inline-gap', 'stack-gap', 'inline-inset', 'row-min', 'hit-min',
  'media-icon', 'media-image', 'content-gap', 'secondary-text', 'secondary-line',
];

const probe = (density) => `<div data-density="${density}">
  <span class="p-text"></span>
  <span class="p-line"></span>
  <div class="p-gap"></div>
  <div class="p-stack"></div>
  <div class="p-inset"></div>
  <div class="p-rowmin"></div>
  <div class="p-hitmin"></div>
  <div class="p-micon"></div>
  <div class="p-mimage"></div>
  <div class="p-cgap"></div>
  <span class="p-stext"></span>
  <span class="p-sline"></span>
</div>`;
const probeCss = `
.p-text { font-size: var(--jx-d-text); }
.p-line { line-height: var(--jx-d-line); font-size: var(--jx-d-text); }
.p-gap { display: flex; column-gap: var(--jx-d-inline-gap); }
.p-stack { display: flex; row-gap: var(--jx-d-stack-gap); }
.p-inset { padding-inline-start: var(--jx-d-inline-inset); }
.p-rowmin { min-height: var(--jx-d-row-min); }
.p-hitmin { min-height: var(--jx-d-hit-min); }
.p-micon { width: var(--jx-d-media-icon); }
.p-mimage { width: var(--jx-d-media-image); }
.p-cgap { display: flex; row-gap: var(--jx-d-content-gap); }
.p-stext { font-size: var(--jx-d-secondary-text); }
.p-sline { line-height: var(--jx-d-secondary-line); font-size: var(--jx-d-secondary-text); }
`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}${probeCss}</style></head><body>
${Object.keys(TABLE).map(probe).join('\n')}
<div data-density="sm" id="outer"><div data-density="xs" id="inner"><span class="p-text" id="nested-text"></span></div></div>
<span class="p-text" id="root-text"></span>
</body></html>`;

const server = createServer((_, res) => { res.setHeader('content-type', 'text/html'); res.end(html); });
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-proxy-server'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await page.goto(`http://127.0.0.1:${server.address().port}/`);
await page.waitForTimeout(300);

const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

// ── the four-row table on real elements ──
const read = await page.evaluate(() => {
  const px = (v) => parseFloat(v) || 0;
  const readOne = (scope, cls) => {
    const el = document.querySelector(`[data-density="${scope}"] .${cls}`);
    const cs = getComputedStyle(el);
    return { fs: cs.fontSize, lh: cs.lineHeight, cg: cs.columnGap, rg: cs.rowGap, pis: cs.paddingInlineStart, mh: cs.minHeight, w: cs.width };
  };
  const out = {};
  for (const scope of ['xs', 'sm', 'default', 'lg']) {
    out[scope] = {
      text: px(readOne(scope, 'p-text').fs),
      line: px(readOne(scope, 'p-line').lh),
      'inline-gap': px(readOne(scope, 'p-gap').cg),
      'stack-gap': px(readOne(scope, 'p-stack').rg),
      'inline-inset': px(readOne(scope, 'p-inset').pis),
      'row-min': px(readOne(scope, 'p-rowmin').mh),
      'hit-min': px(readOne(scope, 'p-hitmin').mh),
      'media-icon': px(readOne(scope, 'p-micon').w),
      'media-image': px(readOne(scope, 'p-mimage').w),
      'content-gap': px(readOne(scope, 'p-cgap').rg),
      'secondary-text': px(readOne(scope, 'p-stext').fs),
      'secondary-line': px(readOne(scope, 'p-sline').lh),
    };
  }
  out.nested = px(getComputedStyle(document.getElementById('nested-text')).fontSize);
  out.root = px(getComputedStyle(document.getElementById('root-text')).fontSize);
  out.unit = getComputedStyle(document.documentElement).getPropertyValue('--jx-ruler-unit').trim();
  return out;
});

check('ruler unit computes', read.unit === '0.25rem', read.unit);
for (const [density, row] of Object.entries(TABLE)) {
  for (let i = 0; i < KEYS.length; i++) {
    const got = read[density][KEYS[i]];
    check(`${density} ${KEYS[i]} = ${row[i]}px`, got === row[i], `got ${got}`);
  }
}
// media derives from the line: image == 2×line, icon == line, seam excluded
for (const d of Object.keys(TABLE)) {
  check(`${d} mediaImage == 2×line`, read[d]['media-image'] === 2 * read[d].line);
  check(`${d} mediaIcon == line`, read[d]['media-icon'] === read[d].line);
}
// scope inheritance: nested xs overrides outer sm; :root publishes default
check('nested scope overrides (xs inside sm)', read.nested === 11, `got ${read.nested}`);
check('root defaults to 13px scope', read.root === 13, `got ${read.root}`);

// ── the §7 grep pass (full run only — red until P4 lands) ──
if (!TABLE_ONLY) {
  const { execSync } = await import('node:child_process');
  const itemCss = readFileSync(resolve('apps/www/src/lib/ui/list-item/item.css'), 'utf8');
  const stripped = itemCss
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((l) => !l.trim().startsWith('@container') && !l.trim().startsWith('@supports'))
    .join('\n');
  const forbiddenSelector = /\[data-(density|size)=/;
  const densityOwned = /(padding(-inline|-block|-top|-bottom|-left|-right)?|gap|row-gap|column-gap|font-size|line-height|min-height|min-block-size|width|height)\s*:\s*[^;]*;/g;
  let literalViolations = [];
  const exceptions = /^(1px|-1px|0|0px|100%|auto|inherit|initial|none|0%)$/;
  for (const m of stripped.matchAll(densityOwned)) {
    const decl = m[0];
    const value = decl.split(':')[1].trim().replace(/;$/, '');
    if (decl.startsWith('border') || decl.startsWith('outline')) continue;
    if (decl.includes('box-shadow')) continue;
    if (value.startsWith('var(')) continue;
    if (exceptions.test(value)) continue;
    // grid track indices / area strings are placement, not density paint
    if (decl.startsWith('grid-')) continue;
    literalViolations.push(decl);
  }
  check('no [data-density]/[data-size] selectors in list-item css', !forbiddenSelector.test(stripped));
  check('no density-literal declarations (§7)', literalViolations.length === 0, literalViolations.slice(0, 3).join(' | ') || 'clean');
}

await browser.close();
server.close();
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed${TABLE_ONLY ? ' (table section)' : ''}`);
process.exit(failed ? 1 : 0);
