// Hue popover slider verification: Tier-1 law + hue-owned paint.
//
// Regression this guards: bbb1b7d renamed the markup class to
// .jx-hue-range but left the scoped rules on .jx-hue-slider — Svelte
// pruned the unmatched selectors and the slider silently fell back to
// native UA styling. The fix rides the Tier-1 .jx-range law
// (registry/files/theme/jx-pure.css (Part A)) with hue-only overrides.
//
// Usage (site must be running, e.g. `npm run site` on :5199):
//   node scripts/verify-hue.mjs            # default :5199
//   node scripts/verify-hue.mjs 5200       # vite fell back to another port
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const OUT = '/tmp/hue-range-verify';
mkdirSync(OUT, { recursive: true });

const port = process.argv[2] ?? '5199';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
// localhost (not 127.0.0.1): vite may bind IPv6 loopback only
await page.goto(`http://localhost:${port}/`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);

// open the brand hue popover from the global header
await page.locator('[popovertarget="hue-popover"]').click();
await page.waitForSelector('#hue-popover:popover-open', { timeout: 3000 });
await page.waitForTimeout(350);

const input = page.locator('#hue-popover input.jx-hue-range');

// NOTE on method: this Chrome no longer reflects author rules for range
// pseudos through getComputedStyle(el, '::-webkit-slider-*') — they come
// back as UA defaults. Truth comes from two reliable probes instead:
// (a) the served stylesheet actually contains the scoped rules (guards
//     the original bug: Svelte pruning unmatched selectors), and
// (b) pixel sampling of the element screenshot (verify-mask precedent).
const facts = await input.evaluate((el) => {
  const inputCs = getComputedStyle(el);
  let scopedTrackRule = false;
  let scopedThumbRule = false;
  // Svelte 5 dev injects scoped css via constructed sheets — they live in
  // adoptedStyleSheets, NOT document.styleSheets; scan both
  const sheets = [...document.styleSheets, ...(document.adoptedStyleSheets ?? [])];
  for (const sheet of sheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of rules) {
      // scoped selectors serialize as `.jx-hue-range.svelte-hash::pseudo`
      // — match class and pseudo separately, never as one substring
      const t = rule.selectorText ?? '';
      if (t.includes('.jx-hue-range') && t.includes('::-webkit-slider-runnable-track') && rule.cssText.includes('linear-gradient')) scopedTrackRule = true;
      if (t.includes('.jx-hue-range') && t.includes('::-webkit-slider-thumb') && rule.cssText.includes('14px')) scopedThumbRule = true;
    }
  }
  return {
    hasTier1Class: el.classList.contains('jx-range'),
    appearance: inputCs.webkitAppearance,
    scopedTrackRule,
    scopedThumbRule,
  };
});

// pixel sampling: draw the element screenshot in-page and read the track
const shot = await input.screenshot();
const rainbow = await page.evaluate(async (dataUrl) => {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const sample = (x) => {
    const d = ctx.getImageData(Math.round(x), Math.round(img.height / 2), 1, 1).data;
    return { r: d[0], g: d[1], b: d[2] };
  };
  // hue wheel 0→360: 8% ≈ red; 60% ≈ blue (the wheel wraps back to
  // magenta/red at the right end — do NOT assert blue there)
  const left = sample(img.width * 0.08);
  const midright = sample(img.width * 0.6);
  const spread = (p) => Math.max(p.r, p.g, p.b) - Math.min(p.r, p.g, p.b);
  return {
    left,
    midright,
    leftIsRed: left.r > left.b + 40 && spread(left) > 40,
    midrightIsBlue: midright.b > midright.r + 40 && spread(midright) > 40,
  };
}, `data:image/png;base64,${shot.toString('base64')}`);
facts.rainbow = rainbow;

const checks = [
  ['tier-1 class present', facts.hasTier1Class],
  ['appearance reset (not native)', facts.appearance === 'none'],
  ['scoped track rule served (not pruned)', facts.scopedTrackRule],
  ['scoped thumb rule served (not pruned)', facts.scopedThumbRule],
  ['track pixel: red at the left end', rainbow.leftIsRed],
  ['track pixel: blue at 60% of the wheel', rainbow.midrightIsBlue],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
console.log('facts:', facts);

// behavioral check: keyboard step updates the hue readout
await input.focus();
const before = await page.locator('#hue-popover .jx-hue-value').textContent();
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(150);
const after = await page.locator('#hue-popover .jx-hue-value').textContent();
const stepped = before !== after;
console.log(`${stepped ? 'PASS' : 'FAIL'}  keyboard step moves the readout (${before} → ${after})`);
if (!stepped) failed++;

await page.locator('#hue-popover').screenshot({ path: `${OUT}/panel.png` });
console.log(`screenshot: ${OUT}/panel.png`);

await browser.close();
if (failed) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log('all checks passed');
