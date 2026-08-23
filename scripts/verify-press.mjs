#!/usr/bin/env node
// Press law + effect-loop probe (2026-08-23).
// Drives the press-button demo page in a REAL Chromium (the IAB guest
// throttles rendering for background tabs and freezes CSS transitions
// at their start values — computed colors there are not evidence).
//
// Locks in, per the 2026-08-23 rulings (r2 law, r3 effects):
//   press law   hover NEVER moves the body (the box-shadow alone grows
//               xs → sm); active slides the body +1px,+1px while the
//               box-shadow's own offsets counter-shrink 1px (the
//               *-press poses) — the shadow paint stays anchored
//   effects     typed builders (module-script exports): shimmer
//               perimeter spark, pulse sonar rings, rainbow border
//               gradient flow, ripple press-point ink
//
// Requires the built site on :4173 — `cd apps/www && npx vite build &&
// npx vite preview --port 4173` (or PORT=… to retarget).
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui/node_modules/playwright-core/index.mjs';
import { homedir } from 'node:os';

const PORT = process.env.PORT ?? '4173';
const CHROME =
  homedir() +
  '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1280, height: 1080 } });
await page.goto(`http://localhost:${PORT}/components/press-button.html`);
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(1200);

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const PRIMARY = 'button.bg-primary';

// ---- press law: hover → active on the primary demo button ----
await page.hover(PRIMARY);
await page.waitForTimeout(300);
const hoverState = await page.evaluate((sel) => {
  const el = document.querySelector(sel);
  const shadow = getComputedStyle(el).boxShadow;
  return {
    translate: getComputedStyle(el).translate,
    shadow,
    // each layer opens exactly one color function (rgb()/rgba()); the
    // halo's alpha serializes as rgba — count color functions, not commas
    layers: (shadow.match(/rgba?\(/g) ?? []).length,
    matchesHover: el.matches(':hover'),
  };
}, PRIMARY);
check(
  'hover: body never moves',
  hoverState.translate === 'none' || hoverState.translate === '0px 0px',
  `translate=${hoverState.translate} hover=${hoverState.matchesHover}`,
);
// shadow-xs is ONE offset layer; shadow-sm is the two-layer composite —
// the grow is observable as the layer count (plus the halo color mix)
check(
  'hover: shadow grows (xs → sm)',
  hoverState.layers >= 2 && hoverState.matchesHover,
  `layers=${hoverState.layers} shadow=${hoverState.shadow.slice(0, 80)}`,
);

// active: hold the press — the body slides +1px while the box-shadow's
// own offsets counter-shrink 1px (the *-press pose), so the shadow
// paint stays anchored on screen
await page.mouse.down();
await page.waitForTimeout(300);
const activeState = await page.evaluate((sel) => {
  const el = document.querySelector(sel);
  const cs = getComputedStyle(el);
  return {
    bodyTranslate: cs.translate,
    shadow: cs.boxShadow,
    matchesActive: el.matches(':active'),
  };
}, PRIMARY);
await page.mouse.up();
const pressPose = / 1px 1px/.test(activeState.shadow);
check(
  'active: body +1px,+1px on the counter-shrunk (1px 1px…) press pose',
  activeState.bodyTranslate === '1px 1px' && pressPose && activeState.matchesActive,
  JSON.stringify(activeState),
);

// ---- primary paint is ALIVE in a real engine (chroma > 0.1) ----
const primaryBg = await page.evaluate((sel) => {
  const m = getComputedStyle(document.querySelector(sel)).backgroundColor;
  const lch = m.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)/);
  const lab = m.match(/oklab\(([\d.]+) ([\d.e+-]+) ([\d.e+-]+)/);
  return lch
    ? { c: +lch[2], raw: m }
    : lab
      ? { c: Math.hypot(+lab[2], +lab[3]), raw: m }
      : { c: -1, raw: m };
}, PRIMARY);
check('primary surface carries real chroma', primaryBg.c > 0.1, primaryBg.raw);

// ---- effects (component-local, animation-svelte reference) ----
const shimmer = await page.evaluate(() => {
  const host = document.querySelector('.jx-shimmer-host');
  const slide = host?.querySelector('.jx-shimmer-slide');
  const cover = host?.querySelector('.jx-shimmer-cover');
  return {
    slideAnim: slide ? getComputedStyle(slide).animationName : 'none',
    coverBg: cover ? getComputedStyle(cover).background : 'none',
  };
});
check(
  'shimmer: perimeter spark slides (container-query sweep armed)',
  /shimmer-slide/.test(shimmer.slideAnim) && shimmer.coverBg !== 'none',
  JSON.stringify(shimmer),
);

const pulse = await page.evaluate(() => {
  const layer = document.querySelector('.jx-pulse-layer');
  const ring = layer ? getComputedStyle(layer).boxShadow : 'none';
  // the ring color mid-interpolation must carry real chroma (a
  // white-on-white ring was the r1 invisibility bug)
  const lab = ring.match(/oklab\(([\d.]+) ([\d.e+-]+) ([\d.e+-]+)/);
  const lch = ring.match(/oklch\(([\d.]+) ([\d.]+)/);
  const chroma = lab ? Math.hypot(+lab[2], +lab[3]) : lch ? +lch[2] : -1;
  return {
    anim: layer ? getComputedStyle(layer).animationName : 'none',
    ring,
    chroma,
  };
});
check(
  'pulse: sonar ring armed with live chroma (visible on both themes)',
  /pulse/.test(pulse.anim) && pulse.chroma > 0.05,
  JSON.stringify(pulse),
);

const rainbow = await page.evaluate(() => {
  const host = document.querySelector('.jx-rainbow-host');
  const cs = host ? getComputedStyle(host) : null;
  const ring = host ? getComputedStyle(host, '::after') : null;
  const anims = ring ? ring.animationName : '';
  return {
    x: /rainbow-x/.test(anims),
    y: /rainbow-y/.test(anims),
    p1: /rainbow-p1/.test(anims),
    p2: /rainbow-p2/.test(anims),
    p3: /rainbow-p3/.test(anims),
    p4: /rainbow-p4/.test(anims),
    layers: ring ? (ring.backgroundImage.match(/gradient\(/g) ?? []).length : 0,
    layerBlend: ring ? ring.backgroundBlendMode : 'none',
    layerSizes: ring ? ring.backgroundSize : 'none',
    blur: ring ? ring.filter : 'none',
    inset: ring ? ring.top : 'none',
    blend: ring ? ring.mixBlendMode : 'none',
  };
});
check(
  'rainbow: aurora wash — 4 layers panned independently, 6 prime timelines, blur 1rem, inset -0.2rem',
  rainbow.x &&
    rainbow.y &&
    rainbow.p1 &&
    rainbow.p2 &&
    rainbow.p3 &&
    rainbow.p4 &&
    rainbow.layers === 4 &&
    rainbow.layerBlend.includes('screen') &&
    rainbow.layerBlend.includes('soft-light') &&
    /220%/.test(rainbow.layerSizes) &&
    rainbow.blur === 'blur(16px)' &&
    rainbow.inset === '-3.2px' &&
    rainbow.blend === 'color',
  JSON.stringify(rainbow),
);

// pulse ring must BREATHE, not blink: sample the layer's shadow spread
// over ~1.7 cycles — consecutive deltas stay small (no teleports) and
// the spread spends time away from 0 (the ease-out dwell-at-zero blink)
const ringSamples = await page.evaluate(async () => {
  const layer = document.querySelector('.jx-pulse-layer.jx-pulse-ring');
  const spreads = [];
  for (let i = 0; i < 17; i++) {
    const m = getComputedStyle(layer).boxShadow.match(/0px 0px 0px ([\d.]+)px/);
    spreads.push(m ? +m[1] : -1);
    await new Promise((r) => setTimeout(r, 100));
  }
  const deltas = spreads.slice(1).map((v, i) => Math.abs(v - spreads[i]));
  return {
    spreads: spreads.map((v) => +v.toFixed(2)),
    maxDelta: Math.max(...deltas),
    avgSpread: spreads.reduce((a, b) => a + b, 0) / spreads.length,
  };
});
check(
  'pulse ring: continuous breathing (no blink teleports, lives away from 0)',
  ringSamples.maxDelta < 2.5 && ringSamples.avgSpread > 1.5,
  JSON.stringify(ringSamples),
);

// the variant paint must survive the effect: primary + rainbow keeps a
// chromatic fill with a contrasting foreground (r1 painted the fill in
// --background and the white primary-foreground vanished on it)
const rainbowPrimary = await page.evaluate(() => {
  const host = document.querySelector('button.bg-primary.jx-rainbow-host');
  const cs = getComputedStyle(host);
  const chromaOf = (raw) => {
    const lab = (raw ?? '').match(/oklab\(([\d.]+) ([\d.e+-]+) ([\d.e+-]+)/);
    const lch = (raw ?? '').match(/oklch\(([\d.]+) ([\d.]+)/);
    return lab ? Math.hypot(+lab[2], +lab[3]) : lch ? +lch[2] : -1;
  };
  return {
    bg: cs.backgroundColor,
    fg: cs.color,
    bgChroma: chromaOf(cs.backgroundColor),
    fgDiffers: cs.color !== cs.backgroundColor,
    blend: getComputedStyle(host, '::after').mixBlendMode,
  };
});
check(
  'rainbow on primary: variant paint preserved, aurora blends SCREEN',
  rainbowPrimary.bgChroma > 0.1 && rainbowPrimary.fgDiffers && rainbowPrimary.blend === 'screen',
  JSON.stringify(rainbowPrimary),
);

// a REAL pointer click (detail 1, trusted coordinates) — Element.click()
// would be detail 0 and legitimately ripple from the center (keyboard path)
await page.click('.jx-ripple-host');
const ripple = await page.evaluate(() => {
  const host = document.querySelector('.jx-ripple-host');
  const r = host.getBoundingClientRect();
  const dot = host.querySelector('.jx-ripple-dot');
  const dotCs = dot ? getComputedStyle(dot) : null;
  return {
    dots: host.querySelectorAll('.jx-ripple-dot').length,
    left: dot ? dot.style.left : 'none',
    anim: dotCs ? dotCs.animationName : 'none',
    expectLeft: `${Math.round(r.width / 2 - Math.max(r.width, r.height) / 2)}px`,
  };
});
check(
  'ripple: press-point ink spawns and expands',
  ripple.dots >= 1 &&
    Math.abs(Number.parseFloat(ripple.left) - Number.parseFloat(ripple.expectLeft)) < 1 &&
    /rippling/.test(ripple.anim),
  JSON.stringify(ripple),
);

// ---- variant × effect paint matrix (the r1/r2 bug class) ----
// Effects must NEVER fight the variant's paint: for every variant we
// snapshot bg/fg with no effect, then require every effect to preserve
// both computed values exactly, with fg ≠ bg (readable text). r1
// rainbow replaced the fill (white text on white fill) — this matrix
// is the net that catches that class of regression. The playground's
// two selects drive the "driven by the playground" instance through
// every combo.
//
// The site's hue runtime (apps/www/src/lib/hue-runtime.ts) spins the
// brand hue through a full 360° in the first 5s after load, then
// cruises on the wall clock — a drifting hue would fake "fill
// changed" between reads. Wait out the entry spin, then PIN the hue
// inline before every read (the cruising writer only fires on integer
// changes, ~once per 2.4 minutes, so the pin holds for the whole run).
await page.waitForTimeout(5300);
// the variant swap itself rides the press law's 150ms background-color
// transition — a baseline read can catch its tail (transparent at
// 99.98% of white serializes as oklab(1 0 0 / 0.0002)) and fake a
// "fill changed". Transitions are irrelevant to this matrix — kill
// them for its duration.
await page.addStyleTag({ content: '* { transition: none !important; }' });
const frozenHue = await page.evaluate(() => {
  const m = (document.documentElement.getAttribute('style') ?? '').match(
    /--brand-hue:\s*([\d.]+)/,
  );
  return m ? m[1] : '330';
});
const matrixFailures = [];
const setSelect = async (name, value) => {
  await page.evaluate(
    ({ name, value }) => {
      const label = [...document.querySelectorAll('label')].find(
        (l) => l.textContent.trim() === name,
      );
      const sel = document.getElementById(label.getAttribute('for'));
      sel.value = value;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    },
    { name, value },
  );
  await page.waitForTimeout(180);
};
const readDriven = () =>
  page.evaluate((hue) => {
    document.documentElement.style.setProperty('--brand-hue', hue);
    const span = [...document.querySelectorAll('span')].find((s) =>
      s.textContent.includes('driven by the playground'),
    );
    const btn = span.parentElement.querySelector('button');
    const cs = getComputedStyle(btn);
    return {
      bg: cs.backgroundColor,
      fg: cs.color,
      shimmer: btn.classList.contains('jx-shimmer-host'),
      pulseAnim: btn.querySelector('.jx-pulse-layer')
        ? getComputedStyle(btn.querySelector('.jx-pulse-layer')).animationName
        : 'none',
      rainbowAnim: btn.classList.contains('jx-rainbow-host')
        ? getComputedStyle(btn, '::after').animationName
        : 'none',
      rippleLayer: !!btn.querySelector('.jx-ripple-layer'),
    };
  }, frozenHue);

const matrixVariants = ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'copied', 'link'];
const matrixEffects = ['shimmer', 'pulse', 'rainbow', 'ripple'];
for (const variant of matrixVariants) {
  await setSelect('effect', 'none');
  await setSelect('variant', variant);
  const baseline = await readDriven();
  if (baseline.fg === baseline.bg) {
    matrixFailures.push(`${variant}/none: baseline fg === bg (${baseline.fg})`);
  }
  for (const effect of matrixEffects) {
    await setSelect('effect', effect);
    const withEffect = await readDriven();
    const combo = `${variant}/${effect}`;
    if (withEffect.bg !== baseline.bg) {
      matrixFailures.push(`${combo}: fill changed ${baseline.bg} → ${withEffect.bg}`);
    }
    if (withEffect.fg !== baseline.fg) {
      matrixFailures.push(`${combo}: foreground changed ${baseline.fg} → ${withEffect.fg}`);
    }
    if (withEffect.fg === withEffect.bg) {
      matrixFailures.push(`${combo}: fg === bg (${withEffect.fg}) — invisible text`);
    }
    const armed =
      effect === 'shimmer'
        ? withEffect.shimmer
        : effect === 'pulse'
          ? /pulse/.test(withEffect.pulseAnim)
          : effect === 'rainbow'
            ? /rainbow/.test(withEffect.rainbowAnim)
            : withEffect.rippleLayer;
    if (!armed) {
      matrixFailures.push(`${combo}: effect not armed`);
    }
  }
  const fails = matrixFailures.length;
  console.log(`${fails ? 'FAIL' : 'PASS'}  matrix ${variant}: ${fails ? 'see below' : 'paint preserved across all effects'}`);
}
check(
  'variant × effect matrix: paint preserved, text readable, loops armed',
  matrixFailures.length === 0,
  matrixFailures.slice(0, 6).join(' | ') || 'clean',
);

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
