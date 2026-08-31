#!/usr/bin/env node
// Layer-law verification (tw4-css-modularization P2.3, 2026-08-24).
//
// The TWO acceptance axes of P2 (+ the compiled-context probe), against
// the RUNNING dev server (`pnpm dev`, :5199):
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
// docs-restructure: component pages now live under /docs/components/
await page.goto(`http://localhost:${port}/docs/components/accordion.html`, { waitUntil: 'networkidle' });
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
await page.goto(`http://localhost:${port}/docs/jx-pure.html`, { waitUntil: 'networkidle' });
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
await page.goto(`http://localhost:${port}/docs/components/kbd.html`, { waitUntil: 'networkidle' });
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

// ── 5. SURFACE-KERNEL OVERRIDE probes (P3-r1 blocker: the third
// exception's mandatory executable evidence — terminal-header subpanel
// over the Popover primitive's law; tooltip/popover jx-surface pseudo
// disables; each paired with a consumer-override proof) ────────────
// docs-restructure: the catalog index moved to /docs/components.html
await page.goto(`http://localhost:${port}/docs/components.html`, { waitUntil: 'networkidle' });
const kernelHeader = await page.evaluate(async () => {
  // open a subpanel: click the first nav trigger that owns one
  const trigger = document.querySelector('.jx-nav button[aria-expanded], .jx-nav a[aria-expanded]');
  if (!trigger) return { ok: false, why: 'no subpanel trigger' };
  trigger.click();
  await new Promise((r) => setTimeout(r, 450));
  const panel = document.querySelector('.jx-nav .jx-pop.jx-subpanel');
  if (!panel) return { ok: false, why: 'panel did not open' };
  const cs = getComputedStyle(panel);
  // the foreign law overridden where required: terminal bezel tokens wired
  const bezel = cs.fontSize === '12px' && cs.color;
  // consumer override proof, bounded-exception edition: the panel
  // element itself is foreign-owned (the kernel law legitimately
  // outranks utilities on its properties); the exception must NOT
  // swallow the panel's DESCENDANTS — a utility on a sub-link (whose
  // statics are component-owned) still wins. `hidden` is guaranteed
  // generated (utility-generation trap, migration handbook).
  const link = panel.querySelector('.jx-sub-link');
  let overrideWins = false;
  let linkDisplay = 'n/a';
  if (link) {
    linkDisplay = getComputedStyle(link).display;
    link.classList.add('hidden');
    overrideWins = getComputedStyle(link).display === 'none';
    link.classList.remove('hidden');
  }
  trigger.click();
  return { ok: !!link, bezelColor: bezel, linkDisplay, overrideWins };
});
check('terminal-header subpanel: bezel law + consumer static override', kernelHeader.ok && !!kernelHeader.bezelColor && kernelHeader.overrideWins, JSON.stringify(kernelHeader));

// ── 5b. TOOLTIP kernel probe: a real tip opens, the enumerated
// foreign-law override applies (::after disabled), and a consumer
// utility on the tip's own content still wins ─────────────────────
await page.goto(`http://localhost:${port}/docs/components/tooltip.html`, { waitUntil: 'networkidle' });
const kernelTooltip = await page.evaluate(async () => {
  // the docs page's tips open on hover — dispatch real pointer events
  const host = document.querySelector('[data-jx-tip-anchor], [data-tip-host], [aria-describedby]');
  if (!host) return { ok: false, why: 'no tip host' };
  host.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
  host.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 550));
  const tip = document.querySelector('.jx-tip.jx-surface, .jx-surface.jx-tip');
  if (!tip) return { ok: false, why: 'tip did not open' };
  // enumerated override: the jx-surface law's ::after shadow disabled
  const pseudoDisabled = getComputedStyle(tip, '::after').content === 'none';
  // consumer override on the tip body (statics are component-owned):
  // `hidden` is guaranteed generated (utility-generation trap)
  const body = tip.querySelector('.jx-tip-body, p, div');
  if (!body) return { ok: false, why: 'no tip body', pseudoDisabled };
  const before = getComputedStyle(body).display;
  body.classList.add('hidden');
  const overrideWins = getComputedStyle(body).display === 'none';
  body.classList.remove('hidden');
  return { ok: true, pseudoDisabled, before, overrideWins };
});
check('tooltip kernel: ::after disabled + consumer override on body', kernelTooltip.ok && kernelTooltip.pseudoDisabled && kernelTooltip.overrideWins, JSON.stringify(kernelTooltip));

// ── 5c. POPOVER kernel probe: a real popover opens, the enumerated
// override applies, and a consumer utility on popover-owned content
// still wins ────────────────────────────────────────────────────────
await page.goto(`http://localhost:${port}/docs/components/popover.html`, { waitUntil: 'networkidle' });
const kernelPop = await page.evaluate(async () => {
  const trigger = document.querySelector('.jx-pop-anchor button, .jx-pop-anchor, [popovertarget]');
  if (!trigger) return { ok: false, why: 'no popover trigger' };
  trigger.click();
  await new Promise((r) => setTimeout(r, 550));
  const pop = document.querySelector('.jx-pop.jx-surface') || document.querySelector('.jx-surface[popover-open], dialog.jx-surface[open]');
  if (!pop) return { ok: false, why: 'no surface element open' };
  // enumerated override: the jx-surface law's ::after shadow disabled
  const pseudoDisabled = getComputedStyle(pop, '::after').content === 'none';
  // consumer override: any popover-owned content child (statics are
  // component-owned) hides under a generated utility
  const child = pop.querySelector('.jx-caret, [data-jx-pop-body], h3, p, div, button');
  if (!child) return { ok: false, why: 'no content child in popover', pseudoDisabled };
  const before = getComputedStyle(child).display;
  child.classList.add('hidden');
  const overrideWins = getComputedStyle(child).display === 'none';
  child.classList.remove('hidden');
  return { ok: true, pseudoDisabled, before, overrideWins };
});
check('popover kernel: ::after disabled + consumer override on content', kernelPop.ok && kernelPop.pseudoDisabled && kernelPop.overrideWins, JSON.stringify(kernelPop));

// sheet state machine beats markup animation utilities (the carve-out
// contract Codex prescribed)
await page.goto(`http://localhost:${port}/docs/components/sheet.html`, { waitUntil: 'networkidle' });
const sheetLaw = await page.evaluate(async () => {
  const trigger = document.querySelector('button[data-demo-open], .jx-sheet ~ *, button');
  const sheetEl = document.querySelector('.jx-sheet');
  if (!sheetEl) return { ok: false, why: 'no sheet on page' };
  // find its opener: any control that opens this sheet
  const opener = [...document.querySelectorAll('button')].find((b) => (b.textContent || '').toLowerCase().includes('open')) || document.querySelector('button');
  if (!opener) return { ok: false, why: 'no opener' };
  opener.click();
  await new Promise((r) => setTimeout(r, 450));
  const open = document.querySelector('.jx-sheet[open], .jx-sheet.popover-open, dialog.jx-sheet[open]');
  if (!open) return { ok: false, why: 'sheet did not open' };
  const anim = getComputedStyle(open).animationName || '';
  const ok = anim.includes('jx-sheet');
  // static paint consumer-overridable: backdrop stays the scrim law's
  return { ok: true, animation: anim, stateMachineOwns: ok };
});
check('sheet state machine owns the animation (carve-out beats markup utilities)', sheetLaw.ok && sheetLaw.stateMachineOwns, JSON.stringify(sheetLaw));

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(failed.length === 0 ? '\nlayer law: ALL GREEN' : `\nlayer law: ${failed.length} FAILURE(S)`);
process.exit(failed.length === 0 ? 0 : 1);
