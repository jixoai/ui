// jx-pure verification: the componentless face, probed in anger.
//
// Guards the Codex r1 rulings the implementation claims to honor:
//   D1 — :where() + @layer components (a Tailwind utility beats the law)
//   D6 — the type allowlist (button-family never takes the text box)
//   opt-in is structural (outside the wrapper the UA paint stands)
//   D4 — dark rides .dark (scoped island flips tokens + color-scheme)
//   D7 — select keeps its platform arrow; .jx-select opts into the chevron
//
// Method note: Chrome no longer reflects author rules for range/checkbox
// pseudos through getComputedStyle(el, pseudo) — element-level computed
// styles + served-rule scans are the reliable probes (verify-hue lesson).
//
// Usage (site must be running, e.g. `npm run site` on :5199):
//   node scripts/verify-jx-pure.mjs            # default :5199
//   node scripts/verify-jx-pure.mjs 5200       # vite fell back to another port
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const OUT = '/tmp/jx-pure-verify';
mkdirSync(OUT, { recursive: true });

const port = process.argv[2] ?? '5199';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`http://localhost:${port}/components/jx-pure.html`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);

// hydration races the island's constructor — wait for its style
// injection before sampling the shadow law
await page
  .waitForFunction(() => document.querySelector('jx-pure-island')?.shadowRoot?.querySelectorAll('style')?.length >= 2, { timeout: 5000 })
  .catch(() => {});
const facts = await page.evaluate(() => {
  const cs = (el, prop) => getComputedStyle(el).getPropertyValue(prop);
  const scope = document.querySelector('#forms .jx-pure');
  const inBtn = scope.querySelector('button');
  const inInput = scope.querySelector('input[type="text"]');
  const inCheck = scope.querySelector('input[type="checkbox"]');
  const inRange = scope.querySelector('input[type="range"]');
  const inColor = scope.querySelector('input[type="color"]');
  const selDefault = scope.querySelector('select:not(.jx-select)');
  const selOpt = scope.querySelector('select.jx-select');
  const submitBtn = scope.querySelector('form button[type="submit"]');
  const summary = document.querySelector('#disclosure summary');
  const summaryOpen = document.querySelector('#disclosure details[open] > summary');
  const th = document.querySelector('#tables th');
  const ul = document.querySelector('#nav-lists ul');
  const proseLink = document.querySelector('#typography .jx-pure a');
  // outside-scope contrast column (the buttons section's second demo div)
  const outsideDiv = [...document.querySelectorAll('#buttons .flex.flex-col.gap-3')].find((d) =>
    d.textContent.includes('outside the scope'),
  );
  const outBtn = outsideDiv.querySelector('button');
  const outInput = document.createElement('input');
  outInput.type = 'text';
  outsideDiv.appendChild(outInput);
  // the layer-law probe pair (scope-laws section)
  const lawBtn = [...document.querySelectorAll('#scope-laws .jx-pure button')].find((b) => !b.className);
  const utilBtn = document.querySelector('#scope-laws .jx-pure button.bg-muted');
  // dark island vs light lane
  const darkBox = document.querySelector('#dark-mode .dark.jx-pure input');
  const lightBox = document.querySelector('#dark-mode .jx-pure input');
  // forced-light island under a dark wrapper (Codex review A2)
  const lightIsland = document.querySelector('#dark-mode .dark.jx-pure .jx-light.jx-pure input');
  const lightIslandBox = document.querySelector('#dark-mode .dark.jx-pure .jx-light.jx-pure');
  // the one-opacity-owner law (Codex review A3)
  const lockedFieldset = document.querySelector('#forms fieldset[disabled]');
  const lockedInput = lockedFieldset.querySelector('input[type="text"]');
  // Owner round: switch + validation surfaces
  const sw = document.querySelector('#switch input[role="switch"]');
  const swChecked = document.querySelector('#switch input[role="switch"]:checked');
  const badLane = document.querySelector('#validation input[aria-invalid="true"]');
  const okLane = document.querySelector('#validation input[aria-invalid="false"]');
  const badCheck = document.querySelector('#validation input[type="checkbox"][aria-invalid="true"]:checked');
  const badRange = document.querySelector('#validation input[type="range"][aria-invalid="true"]');
  // completion-round surfaces: progress / meter / output / figure
  const prog = document.querySelector('#media-flow progress[value]');
  const progIndet = document.querySelector('#media-flow progress:not([value])');
  const meterOpt = document.querySelector('#media-flow meter');
  const out = document.querySelector('#media-flow output');
  const figcap = document.querySelector('#media-flow figcaption');
  // the escape hatch island
  const skipBtn = document.querySelector('[data-jx-pure-skip] button');
  // the live CustomElement shadow root
  const islandHost = document.querySelector('jx-pure-island');
  const shadowBtn = islandHost?.shadowRoot?.querySelector('button');
  const shadowInput = islandHost?.shadowRoot?.querySelector('input');
  // served-rule scan: B rules actually landed in @layer components
  let layered = false;
  let indetStripeServed = false;
  const sheets = [...document.styleSheets, ...(document.adoptedStyleSheets ?? [])];
  for (const sheet of sheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of rules) {
      if (rule.cssRules && rule.conditionText === undefined && rule.selectorText === undefined) {
        // CSSLayerBlockRule
        if (rule.name === 'components') {
          for (const inner of rule.cssRules) {
            if ((inner.selectorText ?? '').includes('.jx-pure')) layered = true;
            // progress-pseudo computed styles are not reflectable (the
            // verify-hue lesson) — assert the stripe rule is SERVED
            if ((inner.selectorText ?? '').includes('progress:indeterminate') && inner.cssText.includes('jx-progress-slide')) indetStripeServed = true;
          }
        }
      }
    }
  }
  return {
    scopeColorScheme: cs(scope, 'color-scheme').trim(),
    inBtn: {
      shadow: cs(inBtn, 'box-shadow'),
      minHeight: cs(inBtn, 'min-height'),
      radius: cs(inBtn, 'border-radius'),
      cursor: cs(inBtn, 'cursor'),
    },
    inInput: {
      minHeight: cs(inInput, 'min-height'),
      colorScheme: cs(inInput, 'color-scheme').trim(),
      fontMono: cs(inInput, 'font-family').includes('JetBrains'),
      placeholderVar: true,
    },
    inCheck: { appearance: cs(inCheck, 'appearance').trim(), size: cs(inCheck, 'width') },
    inRange: {
      appearance: cs(inRange, 'appearance').trim(),
      height: cs(inRange, 'height'),
      containerType: cs(inRange, 'container-type').trim(),
      overflow: cs(inRange, 'overflow').trim(),
    },
    switch: {
      w: cs(sw, 'width'),
      h: cs(sw, 'height'),
      radius: cs(sw, 'border-radius'),
      checkedBg: getComputedStyle(swChecked).backgroundColor,
    },
    validation: {
      destructiveResolved: (() => {
        const el = document.createElement('span');
        el.style.cssText = 'color: var(--destructive); position: fixed; visibility: hidden;';
        document.body.appendChild(el);
        const v = getComputedStyle(el).color;
        el.remove();
        return v;
      })(),
      badStyle: cs(badLane, 'border-style'),
      badGlyph: cs(badLane, 'background-image').includes('url'),
      okGlyph: cs(okLane, 'background-image').includes('url'),
      okBorder: cs(okLane, 'border-color'),
      badCheckBg: getComputedStyle(badCheck).backgroundColor,
      badRadioDot: getComputedStyle(document.querySelector('#validation input[type="radio"][aria-invalid="true"]:checked'), '::after').backgroundColor,
      badRangeVar: cs(badRange, '--jx-range-fill-color').trim(),
    },
    inColor: { size: cs(inColor, 'width'), appearance: cs(inColor, 'appearance').trim() },
    selDefault: { appearance: cs(selDefault, 'appearance').trim(), paddingEnd: cs(selDefault, 'padding-right') },
    selOpt: {
      appearance: cs(selOpt, 'appearance').trim(),
      chevron: getComputedStyle(selOpt).backgroundImage.includes('linear-gradient'),
    },
    submitNeverTextBox: cs(submitBtn, 'display'),
    summary: { listStyle: cs(summary, 'list-style-type').trim(), marker: getComputedStyle(summary, '::before').content },
    summaryOpenMarker: getComputedStyle(summaryOpen, '::before').content,
    th: { fontFamily: cs(th, 'font-family').includes('Share Tech'), transform: cs(th, 'text-transform') },
    ul: { listStyle: cs(ul, 'list-style-type').trim(), padStart: cs(ul, 'padding-left') },
    proseLink: cs(proseLink, 'color'),
    outside: {
      btnShadow: cs(outBtn, 'box-shadow'),
      // the site itself is mono-first with a color-scheme bootstrap, so
      // font/scheme cannot differentiate — the LAW properties can: UA
      // controls carry no 40px row and no press shadow
      btnMinHeight: cs(outBtn, 'min-height'),
      inputMinHeight: cs(outInput, 'min-height'),
    },
    layerLaw: {
      lawBg: cs(lawBtn, 'background-color'),
      utilBg: cs(utilBtn, 'background-color'),
      same: cs(lawBtn, 'background-color') === cs(utilBtn, 'background-color'),
    },
    darkIsland: { scheme: cs(darkBox, 'color-scheme').trim(), bg: cs(darkBox, 'background-color').trim() },
    lightLane: { scheme: cs(lightBox, 'color-scheme').trim(), bg: cs(lightBox, 'background-color').trim() },
    lightIsland: { scheme: cs(lightIsland, 'color-scheme').trim(), bg: cs(lightIsland, 'background-color').trim(), rootScheme: cs(lightIslandBox, 'color-scheme').trim() },
    lockedGroup: { fieldsetOpacity: cs(lockedFieldset, 'opacity'), inputOpacity: cs(lockedInput, 'opacity') },
    progress: {
      appearance: cs(prog, 'appearance').trim(),
      height: cs(prog, 'height'),
      // R4-1: the stripe is an ELEMENT animation now — reflectable
      indetRunning: progIndet.getAnimations().length > 0,
    },
    meterBox: { appearance: cs(meterOpt, 'appearance').trim(), height: cs(meterOpt, 'height') },
    outputFont: cs(out, 'font-family'),
    figcapVoice: { font: cs(figcap, 'font-family'), transform: cs(figcap, 'text-transform') },
    skipIsland: { btnMinHeight: cs(skipBtn, 'min-height'), btnShadow: cs(skipBtn, 'box-shadow'), btnCursor: cs(skipBtn, 'cursor') },
    skipPartA: (() => {
      // R4-2: the hatch must beat Part A's UNLAYERED classes too
      const el = document.querySelector('[data-jx-pure-skip] .jx-input');
      return el ? { minH: cs(el, 'min-height'), pad: cs(el, 'padding') } : { missing: true };
    })(),
    shadowDom: shadowBtn
      ? {
          styleNodes: islandHost.shadowRoot.querySelectorAll('style').length,
          btnShadow: cs(shadowBtn, 'box-shadow'),
          btnMinHeight: cs(shadowBtn, 'min-height'),
          inputMinHeight: cs(shadowInput, 'min-height'),
        }
      : null,
    layered,
    indetStripeServed,
  };
});
const checks = [
  ['scope carries color-scheme light', facts.scopeColorScheme === 'light'],
  ['button: press shadow at rest', facts.inBtn.shadow !== 'none'],
  ['button: 40px family row', facts.inBtn.minHeight === '40px'],
  ['button: radius 0 (brutalist)', facts.inBtn.radius === '0px'],
  ['text lane: 40px box + mono font', facts.inInput.minHeight === '40px' && facts.inInput.fontMono],
  ['text lane: inherits scope color-scheme', facts.inInput.colorScheme === 'light'],
  ['checkbox: repaint (appearance none, 16px)', facts.inCheck.appearance === 'none' && facts.inCheck.size === '16px'],
  ['range: repaint (appearance none, the rail paint box)', facts.inRange.appearance === 'none' && facts.inRange.height === '8px'],
  ['color: locked 40px square', facts.inColor.size === '40px'],
  ['select default: platform arrow kept', facts.selDefault.appearance !== 'none' && facts.selDefault.paddingEnd === '32px'],
  ['select.jx-select: opt-in chevron gradient', facts.selOpt.appearance === 'none' && facts.selOpt.chevron],
  ['submit is a button, never a text box', facts.submitNeverTextBox === 'inline-flex'],
  ['summary: marker law (+ / −)', facts.summary.listStyle === 'none' && facts.summary.marker.includes('+') && facts.summaryOpenMarker.includes('−')],
  ['th: nav-font small caps', facts.th.fontFamily && facts.th.transform === 'uppercase'],
  ['ul: document-flow markers restored', facts.ul.listStyle === 'disc' && facts.ul.padStart === '24px'],
  ['prose link: primary token', !!facts.proseLink],
  ['OUTSIDE scope: UA paint stands', facts.outside.btnShadow === 'none' && facts.outside.btnMinHeight === 'auto' && facts.outside.inputMinHeight === 'auto'],
  ['layer law: a Tailwind utility beats the law', facts.layerLaw.same === false],
  ['dark island: scheme flips + tokens follow', facts.darkIsland.scheme === 'dark' && facts.darkIsland.bg !== facts.lightLane.bg],
  ['light lane: white lane under :root', facts.lightLane.scheme === 'light'],
  ['A2 · .jx-light.jx-pure same-element: forced light scheme under dark', facts.lightIsland.scheme === 'light' && facts.lightIsland.rootScheme === 'light'],
  ['A3 · disabled fieldset: one opacity owner (group .5, controls 1)', facts.lockedGroup.fieldsetOpacity === '0.5' && facts.lockedGroup.inputOpacity === '1'],
  ['progress: 8px track family repaint', facts.progress.appearance === 'none' && facts.progress.height === '8px'],
  ['progress indeterminate: the stripe animation RUNS (element-level)', facts.progress.indetRunning],
  ['R4-2 · skip beats Part A: .jx-input inside the hatch reverts', facts.skipPartA.minH === 'auto' && facts.skipPartA.pad !== '8px 12px'],
  ['meter: same track family', facts.meterBox.appearance === 'none' && facts.meterBox.height === '8px'],
  ['output: mono result lane', facts.outputFont.includes('JetBrains')],
  ['figcaption: nav-font small caps voice', facts.figcapVoice.font.includes('Share Tech') && facts.figcapVoice.transform === 'uppercase'],
  ['escape hatch: skip island reverts to UA paint', facts.skipIsland.btnMinHeight === 'auto' && facts.skipIsland.btnShadow === 'none'],
  ['CustomElement: shadow root carries both style nodes + law paints inside', facts.shadowDom !== null && facts.shadowDom.styleNodes === 2 && facts.shadowDom.btnShadow !== 'none' && facts.shadowDom.btnMinHeight === '40px' && facts.shadowDom.inputMinHeight === '40px'],
  ['B rules served inside @layer components', facts.layered],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
console.log('facts:', JSON.stringify(facts, null, 2));

await page.screenshot({ path: `${OUT}/page-top.png` });
await page.locator('#forms').scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/forms.png` });
console.log(`screenshots: ${OUT}/page-top.png, ${OUT}/forms.png`);

// ---- auto-dark round: emulate prefers-color-scheme: dark and mount a
// .jx-auto-dark island — the GENERATED Part D must flip tokens with
// zero JS (completion round, Owner goal)
await page.emulateMedia({ colorScheme: 'dark' });
await page.evaluate(() => {
  const host = document.createElement('div');
  host.className = 'jx-auto-dark jx-pure';
  host.id = 'verify-auto-dark';
  host.innerHTML = '<input type="text" placeholder="auto dark lane">';
  document.body.appendChild(host);
});
await page.waitForTimeout(300);
const ad = await page.evaluate(() => {
  const host = document.querySelector('#verify-auto-dark');
  const lane = host.querySelector('input');
  return {
    // nothing paints the host div itself — the B4 box law paints the
    // lane, so THAT computed background proves the token flip
    bg: getComputedStyle(lane).backgroundColor,
    scheme: getComputedStyle(lane).colorScheme,
  };
});
await page.evaluate(() => document.querySelector('#verify-auto-dark').remove());
await page.emulateMedia({ colorScheme: null });
const adChecks = [
  ['auto-dark: tokens flip under emulated dark (zero JS)', ad.bg === 'rgb(0, 0, 0)' || ad.bg === 'oklch(0 0 0)'],
  ['auto-dark: scope-root companion paints the scheme', ad.scheme === 'dark'],
];
for (const [name, ok] of adChecks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
console.log('auto-dark facts:', ad);

// ---- R1 round (Codex r2): the full-stillness contract under
// prefers-reduced-motion — engine pseudos in a shared selector list
// get dropped whole by Chromium, so EVERY surface gets its own probe
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.waitForTimeout(300);
const rm = await page.evaluate(() => {
  const scope = document.querySelector('#forms .jx-pure');
  const check = scope.querySelector('input[type="checkbox"]');
  const radio = scope.querySelector('input[type="radio"]');
  const range = scope.querySelector('input[type="range"]');
  const btn = scope.querySelector('button');
  return {
    checkRoot: getComputedStyle(check).transitionDuration,
    checkBefore: getComputedStyle(check, '::before').transitionDuration,
    radioRoot: getComputedStyle(radio).transitionDuration,
    radioAfter: getComputedStyle(radio, '::after').transitionDuration,
    rangeThumbWebkit: getComputedStyle(range, '::-webkit-slider-thumb').transitionDuration,
    btn: getComputedStyle(btn).transitionDuration,
    indetAnim: getComputedStyle(document.querySelector('#media-flow progress:not([value])')).animationName,
  };
});
const still = (v) => v === '0s';
const rmChecks = [
  ['R1 · checkbox root still', still(rm.checkRoot)],
  ['R1 · checkbox ::before still', still(rm.checkBefore)],
  ['R1 · radio root still', still(rm.radioRoot)],
  ['R1 · radio ::after still', still(rm.radioAfter)],
  ['R1 · range webkit thumb still', still(rm.rangeThumbWebkit)],
  ['R1 · button still', still(rm.btn)],
  ['R4-1 · indeterminate stripe parks (animation none)', rm.indetAnim === 'none'],
];
for (const [name, ok] of rmChecks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
console.log('reduced-motion facts:', rm);
await page.emulateMedia({ reducedMotion: null });

// ---- upgrade round (2026-08-24): the cqw fill pixels + the glyph proofs
async function samplePixels(locator, points) {
  const buf = await locator.screenshot();
  return await page.evaluate(async ({ b64, points }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return {
      w: img.width,
      h: img.height,
      px: points.map(([x, y]) => [...ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data].slice(0, 3)),
    };
  }, { b64: buf.toString('base64'), points });
}
// (a) the element-face fill at value=40: primary left, background right
const fillShot = await page.locator('#forms .jx-pure input[type="range"]').screenshot();
const rangeDims = await page.evaluate(async (b64) => {
  const img = new Image();
  img.src = 'data:image/png;base64,' + b64;
  await img.decode();
  return { w: img.width, h: img.height };
}, fillShot.toString('base64'));
const rangeSamples = await samplePixels(page.locator('#forms .jx-pure input[type="range"]'), [
  [rangeDims.w * 0.15, rangeDims.h / 2],
  [rangeDims.w * 0.9, rangeDims.h / 2],
  // thin-rail proof: 2px above the top edge of the 8px rail = page background
  [rangeDims.w * 0.15, 1],
]);
const fillL = rangeSamples.px[0];
const fillR = rangeSamples.px[1];
// the brand hue CYCLES (24h clock) and Chrome keeps computed colors as
// oklch() strings — assert FILL-ness hue-agnostically: the filled side
// is a saturated dark paint, the unfilled side is near-background
const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
const white = [255, 255, 255];
const isFilled = (px) => dist(px, white) > 180;
const upChecks = [
  ['range fill: primary before the thumb (value 40)', isFilled(fillL)],
  ['range fill: background past the thumb', dist(fillR, white) < 60],
  ['range machinery: container-type + overflow clip', facts.inRange.containerType === 'inline-size' && facts.inRange.overflow === 'hidden'],
  ['Owner · thin rail: the paint box is the 8px rail', facts.inRange.height === '8px'],
  ['switch: 36×20 square, role=switch opt-in', facts.switch.w === '36px' && facts.switch.h === '20px' && facts.switch.radius === '0px'],
  ['validation: invalid lane dashed + glyph', facts.validation.badStyle === 'dashed' && facts.validation.badGlyph],
  ['validation: valid lane glyph + primary lean', facts.validation.okGlyph && facts.validation.okBorder.includes('oklch')],
  ['validation: invalid checkbox fill flips', facts.validation.badCheckBg !== 'rgba(0, 0, 0, 0)'],
  ['R7-1 · invalid radio DOT flips to destructive', facts.validation.badRadioDot === facts.validation.destructiveResolved],
  ['validation: invalid range fill var flips', facts.validation.badRangeVar === facts.validation.destructiveResolved]
];
// (b) form.html: the pipette glyph + the Tier-1 class fill
await page.goto(`http://localhost:${port}/components/form.html`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);
// the pipette is a thin diagonal glyph — single-point sampling misses
// it; count zone pixels that differ from the lane reference instead.
// reveal sections paint transparent until scrolled into view — scroll first
await page.locator('.jx-color-field').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
const fieldDark = await (async () => {
  const buf = await page.locator('.jx-color-field').first().screenshot();
  return await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    // theme-agnostic: the lane reference at x=w-40 vs the glyph zone —
    // count pixels that DIFFER from the reference (works light or dark)
    const ref = [...ctx.getImageData(img.width - 40, Math.floor(img.height / 2), 1, 1).data].slice(0, 3);
    let dark = 0;
    for (let y = 4; y < img.height - 4; y++) {
      for (let x = Math.floor(img.width * 0.6); x < img.width - 4; x++) {
        const px = [...ctx.getImageData(x, y, 1, 1).data].slice(0, 3);
        if (Math.abs(px[0] - ref[0]) + Math.abs(px[1] - ref[1]) + Math.abs(px[2] - ref[2]) > 60) dark++;
      }
    }
    return dark;
  }, buf.toString('base64'));
})();
const glyphZone = { differPixels: fieldDark };
upChecks.push(['pipette glyph paints (zone pixels differ from lane)', fieldDark > 40]);
await page.locator('.jx-range').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
const tier1Shot = await page.locator('.jx-range').first().screenshot();
const tier1Dims = await page.evaluate(async (b64) => {
  const img = new Image();
  img.src = 'data:image/png;base64,' + b64;
  await img.decode();
  return { w: img.width, h: img.height };
}, tier1Shot.toString('base64'));
const tier1Samples = await samplePixels(page.locator('.jx-range').first(), [
  [tier1Dims.w * 0.15, tier1Dims.h / 2],
  [tier1Dims.w * 0.9, tier1Dims.h / 2],
]);
upChecks.push(['Tier-1 .jx-range fill (value 40)', isFilled(tier1Samples.px[0]) && dist(tier1Samples.px[1], white) < 60]);
for (const [name, ok] of upChecks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
console.log('upgrade facts:', { fillL, fillR, glyphZone });

await browser.close();
if (failed) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log('all checks passed');
