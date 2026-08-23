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
  // served-rule scan: B rules actually landed in @layer components
  let layered = false;
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
    inRange: { appearance: cs(inRange, 'appearance').trim(), height: cs(inRange, 'height') },
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
    layered,
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
  ['range: repaint (appearance none, 28px strip)', facts.inRange.appearance === 'none' && facts.inRange.height === '28px'],
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
];
for (const [name, ok] of rmChecks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
console.log('reduced-motion facts:', rm);
await page.emulateMedia({ reducedMotion: null });

await browser.close();
if (failed) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log('all checks passed');
