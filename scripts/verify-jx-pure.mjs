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
// docs-restructure: the jx-pure special page now lives at /docs/jx-pure.html
await page.goto(`http://localhost:${port}/docs/jx-pure.html`, { waitUntil: 'domcontentloaded' });
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
  const selDefault = scope.querySelector('select:not([multiple]):not([size])');
  const num = scope.querySelector('input[type="number"]');
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
  const skipBtn = document.querySelector('.no-jx-pure button');
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
      knobOpacity: getComputedStyle(sw, '::before').opacity,
      knobClip: getComputedStyle(sw, '::before').clipPath,
      offTrack: cs(sw, 'background-color'),
    },
    group: (() => {
      const g = document.querySelector('#forms .jx-pure label:has(> input):has(> span)');
      return g ? { border: getComputedStyle(g).borderWidth, display: getComputedStyle(g).display } : { missing: true };
    })(),
    validation: {
      errorResolved: (() => {
        const probe = (token) => {
          const el = document.createElement('span');
          el.style.cssText = 'color: var(' + token + '); position: fixed; visibility: hidden;';
          document.body.appendChild(el);
          const v = getComputedStyle(el).color;
          el.remove();
          return v;
        };
        return { error: probe('--error'), errorFg: probe('--error-foreground') };
      })(),
      badStyle: cs(badLane, 'border-style'),
      badGlyph: cs(badLane, 'background-image').includes('url'),
      okGlyph: cs(okLane, 'background-image').includes('url'),
      okBorder: cs(okLane, 'border-color'),
      badCheckBg: getComputedStyle(badCheck).backgroundColor,
      badRadioDot: getComputedStyle(document.querySelector('#validation input[type="radio"][aria-invalid="true"]:checked'), '::after').backgroundColor,
      badRangeVar: cs(badRange, '--jx-range-fill-color').trim(),
      okBorderResolved: cs(okLane, 'border-color'),
      badBorderResolved: cs(badLane, 'border-color'),
    },
    inColor: { size: cs(inColor, 'width'), appearance: cs(inColor, 'appearance').trim() },
    selDefault: {
      appearance: cs(selDefault, 'appearance').trim(),
      chevron: cs(selDefault, 'background-image').includes('linear-gradient'),
    },
    selNative: (() => {
      // the no-jx-pure island in the Forms demo — must be FULLY native
      const el = document.querySelector('#forms .no-jx-pure select');
      return el ? { appearance: getComputedStyle(el).appearance.trim(), chevron: getComputedStyle(el).backgroundImage } : { missing: true };
    })(),
    numberSpin: cs(num, 'appearance').trim(),
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
      const el = document.querySelector('.no-jx-pure .jx-input');
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
  ['range: repaint (appearance none, the 24px daisyUI pill)', facts.inRange.appearance === 'none' && facts.inRange.height === '24px'],
  ['color: locked 40px square', facts.inColor.size === '40px'],
  ['D2 · select: the jx chevron is the DEFAULT', facts.selDefault.appearance === 'none' && facts.selDefault.chevron],
  ['D2 · no-jx-pure island: fully native select', facts.selNative.appearance !== 'none' && facts.selNative.chevron === 'none'],
  ['D3 · number: platform stepper restored', facts.numberSpin !== 'textfield'],
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
  ['meter: same track family', facts.meterBox.appearance === 'none' && facts.meterBox.height === '8px'],
  ['output: mono result lane', facts.outputFont.includes('JetBrains')],
  ['figcaption: nav-font small caps voice', facts.figcapVoice.font.includes('Share Tech') && facts.figcapVoice.transform === 'uppercase'],
  ['escape hatch: skip island reverts to UA paint', facts.skipIsland.btnMinHeight !== '40px' && facts.skipIsland.btnShadow === 'none'],
  ['CustomElement: shadow root carries both style nodes + law paints inside', facts.shadowDom !== null && facts.shadowDom.styleNodes === 2 && facts.shadowDom.btnShadow !== 'none' && facts.shadowDom.btnMinHeight === '40px' && facts.shadowDom.inputMinHeight === '40px'],
  ['B rules served inside @layer components', facts.layered],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
console.log('facts:', JSON.stringify(facts, null, 2));

// ---- r8 evidence gaps: contrast audit, nested scope, keyboard ----
// (7) WCAG contrast for the semantic pairs, light + dark
const contrast = await page.evaluate(() => {
  const lum = (rgb) => {
    const [r, g, b] = rgb;
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const toRgb = (str) => (str.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).length === 3
    ? (() => { const m = str.match(/[\d.]+/g).map(Number); return [m[0], m[1], m[2]]; })()
    : null; // oklch() strings cannot convert here — fall back below
  const probe = (token) => getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  // resolve via canvas: draw a rect, read the normalized rgb
  const resolve = (token) => {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgb(255,255,255)';
    try { ctx.fillStyle = probe(token); } catch { return [255, 255, 255]; }
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
  };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const pairs = ['success', 'warning', 'info', 'error'];
  const audit = {};
  for (const t of pairs) audit[t] = Math.round(ratio(resolve('--' + t), resolve('--' + t + '-foreground')) * 100) / 100;
  return audit;
});
const contrastChecks = Object.entries(contrast).map(([t, r]) => ['r8-7 · contrast: --' + t + ' pair >= 3:1 (large/UI; ' + r + ':1)', r >= 3]);
// (6) nested no-jx-pure → inner .jx-pure does NOT resurrect the face
const nested = await page.evaluate(() => {
  const host = document.createElement('div');
  host.className = 'jx-pure';
  host.innerHTML = '<div class="no-jx-pure"><div class="jx-pure"><button type="button" id="nested-btn">x</button></div></div>';
  document.body.appendChild(host);
  const btn = host.querySelector('#nested-btn');
  const cs = getComputedStyle(btn);
  const out = { minH: cs.minHeight, shadow: cs.boxShadow, display: cs.display };
  host.remove();
  return out;
});
contrastChecks.push(['r8-6 · nested .jx-pure inside .no-jx-pure stays reverted', nested.minH !== '40px' && nested.display === 'inline-block' && nested.shadow === 'none']);
// Owner third revision (:not() law): the FACE steps aside inside the
// island but the HOST's own authoring SURVIVES — inline styles keep
// painting, and Part A opt-in classes still work (author intent)
const island = await page.evaluate(() => {
  const host = document.createElement('div');
  host.className = 'jx-pure';
  host.innerHTML = `<div class="no-jx-pure">
    <button id="isl-btn">x</button>
    <div id="isl-div" style="display: flex; color: rgb(1,2,3)">y</div>
    <input class="jx-input" id="isl-cls" type="text" /></div>`;
  document.body.appendChild(host);
  const g = (id) => getComputedStyle(host.querySelector(id));
  const out = {
    btn: { minH: g('#isl-btn').minHeight, display: g('#isl-btn').display },
    divHost: { display: g('#isl-div').display, color: g('#isl-div').color },
    partA: { minH: g('#isl-cls').minHeight, border: g('#isl-cls').borderTopWidth },
  };
  host.remove();
  return out;
});
contrastChecks.push(['not() · island: the FACE steps aside (button is UA)', island.btn.minH !== '40px' && island.btn.display === 'inline-block']);
contrastChecks.push(['not() · island: HOST inline styles SURVIVE', island.divHost.display === 'flex' && island.divHost.color === 'rgb(1, 2, 3)']);
contrastChecks.push(['not() · island: Part A opt-in classes still work', island.partA.minH === '40px' && island.partA.border === '1px']);
// r9-final blocker 1: a checkbox label with a span NEVER matches the
// group — the control keeps its own paint (no chromeless bleed)
const cbLabel = await page.evaluate(() => {
  const host = document.createElement('div');
  host.className = 'jx-pure';
  host.innerHTML = '<label><input type="checkbox"><span>remember</span></label>';
  document.body.appendChild(host);
  const cs = getComputedStyle(host.querySelector('input'));
  const label = getComputedStyle(host.querySelector('label'));
  const out = { checkboxBorder: cs.borderTopWidth, labelBorder: label.borderTopWidth, labelDisplay: label.display };
  host.remove();
  return out;
});
contrastChecks.push(['r9F1 · checkbox-label span never triggers the group', cbLabel.checkboxBorder === '1px' && cbLabel.labelBorder === '0px' && cbLabel.labelDisplay === 'inline']);
// (8) the group: label click focuses the control; Tab reaches it
await page.evaluate(() => document.querySelector('#forms .jx-pure label:has(> input):has(> span)').scrollIntoViewIfNeeded());
await page.waitForTimeout(200);
const labelFocus = await page.evaluate(() => {
  const g = document.querySelector('#forms .jx-pure label:has(> input):has(> span)');
  g.click();
  const focused = document.activeElement === g || g.contains(document.activeElement);
  return focused;
});
contrastChecks.push(['r8-8 · structural group label click focuses the control', labelFocus]);
for (const [name, c] of contrastChecks) {
  console.log((c ? 'PASS' : 'FAIL') + '  ' + name);
  if (!c) failed++;
}
console.log('contrast audit:', contrast, '| nested:', nested);

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
// r10 blocker: the auto-dark companion respects the reverse scope —
// a nested .jx-pure inside no-jx-pure keeps the UA scheme under dark
await page.emulateMedia({ colorScheme: 'dark' });
const adIsland = await page.evaluate(() => {
  const host = document.createElement('div');
  host.className = 'jx-auto-dark jx-pure';
  host.innerHTML = '<div class="no-jx-pure"><div class="jx-pure"><input id="ad-i" type="text"></div></div>';
  document.body.appendChild(host);
  const scheme = getComputedStyle(host.querySelector('#ad-i')).colorScheme;
  host.remove();
  return scheme;
});
await page.emulateMedia({ colorScheme: null });
// color-scheme INHERITS from the outer scope root (legitimately —
// outside any island), exactly like the page's theme tokens flow in;
// the :not() law excludes ELEMENT-LEVEL paint, not ancestor inheritance
const r10ok = adIsland === 'dark';
console.log((r10ok ? 'PASS' : 'FAIL') + '  r10 · page theme (tokens + scheme) flows through islands; paint does not');
if (!r10ok) failed++;
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
  ['range fill: the pill fill before the thumb (value 40)', isFilled(fillL)],
  ['range fill: the 10%-groove past the thumb', dist(fillR, fillL) > 120],
  ['range machinery: container-type + overflow clip', facts.inRange.containerType === 'inline-size' && facts.inRange.overflow === 'hidden'],
  ['daisyUI · the pill paint box (thumb-sized)', facts.inRange.height === '24px'],
  ['D4 · switch: 32×20 sm PILL, role=switch opt-in', facts.switch.w === '32px' && facts.switch.h === '20px' && parseFloat(facts.switch.radius) > 1000],
  ['D4 · switch knob VISIBLE (the B5 glyph-leak reset)', facts.switch.knobOpacity === '1' && facts.switch.knobClip === 'none'],
  ['D6 · the STRUCTURAL group (label:has(control):has(span)) takes the shell', facts.group.border === '1px' && facts.group.display === 'flex'],
  ['validation: invalid lane dashed + glyph', facts.validation.badStyle === 'dashed' && facts.validation.badGlyph],
  ['D5 · valid lane leans --success', facts.validation.okGlyph && facts.validation.okBorderResolved !== facts.validation.badBorderResolved],
  ['validation: invalid checkbox fill flips', facts.validation.badCheckBg !== 'rgba(0, 0, 0, 0)'],
  ['D5 · invalid radio DOT flips to error-foreground', facts.validation.badRadioDot === facts.validation.errorResolved.errorFg],
  ['D5 · invalid range fill flips to error (mirror)', facts.validation.badRangeVar === facts.validation.errorResolved.error],
];
// (b) form.html: the pipette glyph + the Tier-1 class fill
await page.goto(`http://localhost:${port}/docs/components/form.html`, { waitUntil: 'domcontentloaded' });
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
upChecks.push(['Tier-1 .jx-range fill (value 40)', isFilled(tier1Samples.px[0]) && dist(tier1Samples.px[1], tier1Samples.px[0]) > 120]);
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
