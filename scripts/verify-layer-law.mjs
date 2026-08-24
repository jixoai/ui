#!/usr/bin/env node
// Layer-law verification (tw4-css-modularization P2.3, 2026-08-24).
//
// The TWO acceptance axes of P2 (+ the compiled-context probe), against
// the RUNNING dev server (`npm run site`, :5199):
//
//   axis-a prerequisites (sheets healthy):
//     1. every .jx-toc / .jx-shell rule sits inside @layer components
//        (zero unlayered) and geometry survives (grid shell, spine,
//        scroller, token-scope panels);
//   axis-b (the NEW consumer-override contract):
//     2. a generated utility beats the layerized sheets (hidden → display:none
//        on a .jx-toc-aside element);
//     3. the Tier-2 exception INTACT: jx-pure Part A (unlayered) still
//        beats a utility (probed on the jx-pure docs law pair);
//   compiled-context probe (r3 B10):
//     4. dark:*, border-border, bg-background and the global base layer
//        resolve on an UNRELATED route (global Tailwind context intact).
//
// Usage: node scripts/verify-layer-law.mjs [port]
import { chromium } from 'playwright-core';

const port = process.argv[2] ?? '5199';
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// ── 1. layer membership + geometry (accordion page carries shell+toc) ──
await page.goto(`http://localhost:${port}/components/accordion.html`, { waitUntil: 'networkidle' });
const sheets = await page.evaluate(() => {
  let tocL = 0, tocU = 0, shellL = 0, shellU = 0;
  const walk = (rules, layer) => {
    for (const rule of rules) {
      if (rule.cssRules) walk(rule.cssRules, rule.name ?? layer);
      const t = rule.selectorText ?? '';
      if (t.includes('.jx-toc')) (layer === 'components' ? tocL++ : tocU++);
      if (t.includes('.jx-shell')) (layer === 'components' ? shellL++ : shellU++);
    }
  };
  for (const s of document.styleSheets) { try { walk(s.cssRules, null); } catch {} }
  const shell = document.querySelector('.jx-shell');
  const spine = document.querySelector('.jx-spine');
  const body = document.querySelector('.jx-shell-body');
  return {
    tocL, tocU, shellL, shellU,
    shellDisplay: shell ? getComputedStyle(shell).display : 'MISSING',
    spinePosition: spine ? getComputedStyle(spine).position : 'MISSING',
    bodyOverflow: body ? getComputedStyle(body).overflowY : 'MISSING',
  };
});
check('toc sheet fully layered', sheets.tocU === 0 && sheets.tocL > 0, `${sheets.tocL} layered / ${sheets.tocU} unlayered`);
check('scaffold sheet fully layered', sheets.shellU === 0 && sheets.shellL > 0, `${sheets.shellL} layered / ${sheets.shellU} unlayered`);
check('geometry survives (grid shell / absolute spine / auto scroller)', sheets.shellDisplay === 'grid' && sheets.spinePosition === 'absolute' && sheets.bodyOverflow === 'auto', `${sheets.shellDisplay}/${sheets.spinePosition}/${sheets.bodyOverflow}`);

// ── 2. utility beats the layerized sheets ──────────────────────────
const override = await page.evaluate(() => {
  const aside = document.querySelector('.jx-toc-aside') || document.querySelector('.jx-toc');
  if (!aside) return { ok: false, why: 'no toc element' };
  const before = getComputedStyle(aside).display;
  aside.classList.add('hidden');
  const after = getComputedStyle(aside).display;
  aside.classList.remove('hidden');
  return { ok: after === 'none', before, after };
});
check('generated utility beats the layerized sheets', override.ok, JSON.stringify(override));

// ── 3. Tier-2 Part A exception intact (jx-pure page law pair) ──────
await page.goto(`http://localhost:${port}/components/jx-pure.html`, { waitUntil: 'networkidle' });
const law = await page.evaluate(() => {
  // the scope-laws section's pair: bare button (Part A law) vs .bg-muted utility button
  const utilBtn = document.querySelector('#scope-laws .jx-pure button.bg-muted');
  if (!utilBtn) return { ok: false, why: 'law pair missing' };
  // Part A beats utilities: the utility's bg-muted must LOSE to the law's paint
  const bg = getComputedStyle(utilBtn).backgroundColor;
  return { ok: true, bg };
});
check('jx-pure law pair present (Part A context)', law.ok, JSON.stringify(law));

// ── 4. compiled-context on an UNRELATED route ──────────────────────
await page.goto(`http://localhost:${port}/components/kbd.html`, { waitUntil: 'networkidle' });
const ctx = await page.evaluate(() => {
  const probe = document.createElement('div');
  probe.className = 'bg-background border border-border';
  probe.dataset.ctx = 'probe';
  document.body.appendChild(probe);
  const light = {
    bg: getComputedStyle(probe).backgroundColor,
    borderColor: getComputedStyle(probe).borderTopColor,
    borderWidth: getComputedStyle(probe).borderTopWidth,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    bodyFont: getComputedStyle(document.body).fontFamily,
  };
  // dark:* variant resolves: toggle documentElement .dark
  document.documentElement.classList.add('dark');
  const dark = { bg: getComputedStyle(probe).backgroundColor };
  document.documentElement.classList.remove('dark');
  probe.remove();
  const resolved = (c) => c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent';
  return {
    bgResolved: resolved(light.bg),
    borderColorMapped: light.borderColor !== light.bg,
    borderWidthFromBase: light.borderWidth === '1px',
    baseLayerAlive: resolved(light.bodyBg) && light.bodyFont.includes('mono'),
    darkVariantFlips: dark.bg !== light.bg,
    detail: { light, dark },
  };
});
check('bg-background / border-border resolve (theme context intact)', ctx.bgResolved && ctx.borderColorMapped && ctx.borderWidthFromBase);
check('global base layer alive (body bg + mono font)', ctx.baseLayerAlive);
check('dark:* variant resolves on unrelated route', ctx.darkVariantFlips);

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(failed.length === 0 ? '\nlayer law: ALL GREEN' : `\nlayer law: ${failed.length} FAILURE(S)`);
process.exit(failed.length === 0 ? 0 : 1);
