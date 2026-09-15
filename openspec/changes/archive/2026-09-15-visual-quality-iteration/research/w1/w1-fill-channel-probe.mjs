// w1-fill-channel-probe.mjs — the press-effect fill channel's scope law,
// pixel-probed in the pinned Chromium (visual-quality-iteration W1,
// task 1.3; the timeline-probe.mjs pattern).
//
// The Owner's symptom, inverted: a LIGHT [data-theme] stage on an
// OS-dark machine must paint a LIGHT auto sweep — the context resolves
// from the HOST's ancestor chain (nearest scope wins, OS only when the
// whole chain is unscoped), and the auto fill color is the nearest
// OPAQUE ancestor backgroundColor (the CSS Canvas keyword retired).
//
// Drives the Owner's dev server READ-ONLY (GET + in-page DOM; the
// server is never restarted). Synthetic fixtures mount the REAL
// runtime (dynamic import of the live module) inside the REAL page
// (the press-button sheet is already in the page's graph), then the
// sweep's FACE is PIXEL-SAMPLED from element screenshots (PNG decoded
// with node's own zlib — no image deps). The docs demo hosts on the
// effects page are then read live in BOTH stage themes (task 1.4's
// receipts ride the same run).
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex/node_modules/playwright-core/index.mjs';
import { writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const CHROME =
  process.env.HOME +
  '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const OUT =
  '/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex/openspec/changes/2026-09-15-visual-quality-iteration/research/w1';

// ── minimal PNG decoder (RGBA8, non-interlaced — exactly what
//    Chromium screenshots emit); zlib is node's own ──────────────────
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let pos = 8;
  let width = 0;
  let height = 0;
  let pngBpp = 4;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const bitDepth = data[8];
      const colorType = data[9];
      const interlace = data[12];
      // playwright emits 6 (RGBA) for page shots and 2 (RGB) when the
      // capture is fully opaque (element shots) — support both
      if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2) || interlace !== 0)
        throw new Error(`unsupported PNG shape (depth=${bitDepth} color=${colorType} interlace=${interlace})`);
      pngBpp = colorType === 6 ? 4 : 3;
    } else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
    if (type === 'IEND') break;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const bpp = pngBpp;
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      let v = line[i];
      if (filter === 1) v = (v + a) & 0xff;
      else if (filter === 2) v = (v + b) & 0xff;
      else if (filter === 3) v = (v + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
      }
      cur[i] = v;
    }
    prev = cur;
  }
  return { width, height, bpp, data: out };
}
const pixelAt = (png, x, y) => {
  const i = (y * png.width + x) * png.bpp;
  return [png.data[i], png.data[i + 1], png.data[i + 2]];
};
const near = (actual, expected, tol = 4) =>
  actual.every((v, i) => Math.abs(v - expected[i]) <= tol);
const lum = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

// ── the run ──────────────────────────────────────────────────────────
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 2400 }, deviceScaleFactor: 1 });
await page.goto('http://localhost:5199/docs/effects.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

// mount the REAL runtime into the real page: synthetic stages + hosts.
// The fixture rides a FIXED overlay at the viewport top: the effects
// page's scroll-driven [data-reveal] machinery leaves deep-below-fold
// content partially dimmed (measured ~34% over the page base), which
// would poison pixel samples — the overlay is outside that timeline
// and paints deterministically (probe-isolation, measured the hard
// way: stagePad==hostFace==base exactly).
await page.evaluate(() => {
  const s = document.createElement('style');
  s.id = 'w1-probe';
  s.textContent = `.w1-stage { position: fixed; top: 0; left: 0; z-index: 2147483647; margin: 0; padding: 14px; }
.w1-host { display: inline-flex; width: 140px; height: 44px; appearance: none; border: none; }`;
  document.head.append(s);
});
const mountFixture = async (scheme) => {
  // scheme: { attr?: [name, value], classes?: string, bg: cssColor }
  await page.evaluate((scheme) => {
    window.__w1DetachShimmer?.();
    window.__w1DetachRainbow?.();
    window.__w1Stage?.remove();
    const stage = document.createElement('div');
    stage.className = `w1-stage ${scheme.classes ?? ''}`;
    if (scheme.attr) stage.setAttribute(scheme.attr[0], scheme.attr[1]);
    if (scheme.bg) stage.style.backgroundColor = scheme.bg;
    const host = document.createElement('button');
    host.type = 'button';
    host.className = 'w1-host';
    host.dataset.w1 = 'shimmer';
    stage.append(host);
    const rainbowHost = document.createElement('button');
    rainbowHost.type = 'button';
    rainbowHost.className = 'w1-host';
    rainbowHost.dataset.w1 = 'rainbow';
    stage.append(rainbowHost);
    document.body.append(stage);
    window.__w1Stage = stage;
    window.__w1Shimmer = host;
    window.__w1Rainbow = rainbowHost;
  }, scheme);
};

// ── A: the Owner's symptom inverted — light stage + OS dark ─────────
await page.emulateMedia({ colorScheme: 'dark' });
await mountFixture({ attr: ['data-theme', 'light'], bg: '#f8fafc' });
let fill = await page.evaluate(async () => {
  const rt = await import('/src/lib/ui/press-button/press-effect-runtime.ts');
  const fx = { type: 'shimmer', shine: 'var(--primary)', ringColor: 'currentColor', shineWidth: '30deg', speed: 3000, ringW: '1px', fill: undefined };
  window.__w1DetachShimmer = rt.applyShimmer(window.__w1Shimmer, fx);
  window.__w1DetachRainbow = rt.applyRainbow(window.__w1Rainbow, { type: 'rainbow', speed: 2000, colors: ['hsl(0 100% 63%)', 'hsl(270 100% 63%)', 'hsl(210 100% 63%)', 'hsl(195 100% 63%)', 'hsl(90 100% 63%)'], ringW: '1px', fill: undefined });
  return {
    shimmerVar: getComputedStyle(window.__w1Shimmer).getPropertyValue('--shimmer-fill').trim(),
    rainbowVar: getComputedStyle(window.__w1Rainbow).getPropertyValue('--rainbow-fill').trim(),
    osDark: matchMedia('(prefers-color-scheme: dark)').matches,
    contextDark: rt.contextIsDark(window.__w1Shimmer),
    sheetLive: getComputedStyle(window.__w1Shimmer).backgroundImage.includes('conic-gradient'),
  };
});
check(
  'A · light stage + OS-dark → the context is LIGHT (the scope, not the OS)',
  fill.contextDark === false && fill.osDark === true,
  `contextIsDark=${fill.contextDark} osDark=${fill.osDark}`
);
check(
  'A · the auto fill var resolves the STAGE base, Canvas retired',
  fill.shimmerVar === 'rgb(248, 250, 252)' && fill.rainbowVar === 'rgb(248, 250, 252)',
  `shimmer=${fill.shimmerVar} rainbow=${fill.rainbowVar}`
);
check('A · the sheet paints the mounted host (conic live)', fill.sheetLive, '');
const shimmerEl = await page.$('[data-w1="shimmer"]');
const rainbowEl = await page.$('[data-w1="rainbow"]');
let png = decodePng(await shimmerEl.screenshot());
let px = pixelAt(png, Math.floor(png.width / 2), Math.floor(png.height / 2));
check(
  'A · PIXEL: the shimmer face samples LIGHT on the light stage (the Owner symptom inverted)',
  near(px, [248, 250, 252]) && lum(px) > 0.5,
  `face pixel rgb(${px.join(', ')})`
);
png = decodePng(await rainbowEl.screenshot());
// sample the UPPER face: the under-glow bar (bottom 20%, blur 0.8rem)
// bleeds upward and would tint a dead-center sample of this 44px host
px = pixelAt(png, Math.floor(png.width / 2), Math.floor(png.height * 0.25));
check(
  'E · PIXEL: rainbow rides the same channel — light fill on the light stage',
  near(px, [248, 250, 252]),
  `face pixel rgb(${px.join(', ')})`
);
await page.screenshot({ path: `${OUT}/w1-a-light-stage-os-dark.png`, fullPage: false, clip: await shimmerEl.boundingBox().then((b) => ({ x: Math.max(0, b.x - 30), y: Math.max(0, b.y - 30), width: b.width + 400, height: b.height + 90 })) });

// ── B: the converse — dark stage + OS light ─────────────────────────
await page.emulateMedia({ colorScheme: 'light' });
await mountFixture({ attr: ['data-theme', 'dark'], bg: '#101014' });
fill = await page.evaluate(async () => {
  const rt = await import('/src/lib/ui/press-button/press-effect-runtime.ts');
  window.__w1DetachShimmer = rt.applyShimmer(window.__w1Shimmer, { type: 'shimmer', shine: 'var(--primary)', ringColor: 'currentColor', shineWidth: '30deg', speed: 3000, ringW: '1px', fill: undefined });
  return {
    var: getComputedStyle(window.__w1Shimmer).getPropertyValue('--shimmer-fill').trim(),
    osDark: matchMedia('(prefers-color-scheme: dark)').matches,
    contextDark: rt.contextIsDark(window.__w1Shimmer),
  };
});
check(
  'B · dark stage + OS-light → dark context, dark base',
  fill.contextDark === true && fill.osDark === false && fill.var === 'rgb(16, 16, 20)',
  `contextIsDark=${fill.contextDark} osDark=${fill.osDark} fill=${fill.var}`
);
const elB = await page.$('[data-w1="shimmer"]');
png = decodePng(await elB.screenshot());
px = pixelAt(png, Math.floor(png.width / 2), Math.floor(png.height / 2));
check('B · PIXEL: the face samples DARK on the dark stage', near(px, [16, 16, 20]) && lum(px) < 0.5, `face pixel rgb(${px.join(', ')})`);

// ── C: live CLASS flip (jx-light → dark) without a remount ──────────
await page.emulateMedia({ colorScheme: 'dark' }); // Owner machine
await mountFixture({ classes: 'jx-light', bg: '#f8fafc' });
fill = await page.evaluate(async () => {
  const rt = await import('/src/lib/ui/press-button/press-effect-runtime.ts');
  window.__w1DetachShimmer = rt.applyShimmer(window.__w1Shimmer, { type: 'shimmer', shine: 'var(--primary)', ringColor: 'currentColor', shineWidth: '30deg', speed: 3000, ringW: '1px', fill: undefined });
  return getComputedStyle(window.__w1Shimmer).getPropertyValue('--shimmer-fill').trim();
});
check('C · class-scoped light stage starts light', fill === 'rgb(248, 250, 252)', fill);
fill = await page.evaluate(async () => {
  const stage = window.__w1Stage;
  stage.classList.remove('jx-light');
  stage.classList.add('dark');
  stage.style.backgroundColor = '#101014'; // the token-driven base flips with the scope
  await new Promise((r) => setTimeout(r, 50)); // the observer's microtask checkpoint
  return {
    var: getComputedStyle(window.__w1Shimmer).getPropertyValue('--shimmer-fill').trim(),
    sameHost: window.__w1Shimmer.hasAttribute('data-jx-shimmer-host'),
  };
});
check('C · the class flip re-resolves LIVE, no remount', fill.var === 'rgb(16, 16, 20)' && fill.sameHost, `fill=${fill.var} hostStamped=${fill.sameHost}`);
const elC = await page.$('[data-w1="shimmer"]');
png = decodePng(await elC.screenshot());
px = pixelAt(png, Math.floor(png.width / 2), Math.floor(png.height / 2));
check('C · PIXEL: the face flipped dark live', near(px, [16, 16, 20]), `face pixel rgb(${px.join(', ')})`);
await page.screenshot({ path: `${OUT}/w1-c-live-class-flip.png`, clip: await elC.boundingBox().then((b) => ({ x: Math.max(0, b.x - 30), y: Math.max(0, b.y - 30), width: b.width + 400, height: b.height + 90 })) });

// ── D: live DATA-THEME flip (light → dark) without a remount ────────
await mountFixture({ attr: ['data-theme', 'light'], bg: '#f8fafc' });
await page.evaluate(async () => {
  const rt = await import('/src/lib/ui/press-button/press-effect-runtime.ts');
  window.__w1DetachShimmer = rt.applyShimmer(window.__w1Shimmer, { type: 'shimmer', shine: 'var(--primary)', ringColor: 'currentColor', shineWidth: '30deg', speed: 3000, ringW: '1px', fill: undefined });
});
fill = await page.evaluate(async () => {
  window.__w1Stage.setAttribute('data-theme', 'dark');
  window.__w1Stage.style.backgroundColor = '#101014';
  await new Promise((r) => setTimeout(r, 50));
  return getComputedStyle(window.__w1Shimmer).getPropertyValue('--shimmer-fill').trim();
});
check('D · the data-theme flip re-resolves LIVE (the docs stages\' mechanism)', fill === 'rgb(16, 16, 20)', fill);

// ── F: teardown disconnects (the observer's cleanup law) ────────────
fill = await page.evaluate(async () => {
  window.__w1DetachShimmer?.();
  window.__w1Stage.setAttribute('data-theme', 'light');
  window.__w1Stage.style.backgroundColor = '#f8fafc';
  await new Promise((r) => setTimeout(r, 50));
  return {
    var: getComputedStyle(window.__w1Shimmer).getPropertyValue('--shimmer-fill').trim(),
    stamped: window.__w1Shimmer.hasAttribute('data-jx-shimmer-host'),
  };
});
check('F · teardown: vars stripped, later flips re-stamp nothing', fill.var === '' && fill.stamped === false, `var="${fill.var}" stamped=${fill.stamped}`);

// ── unscoped: the OS scheme answers (scrubbed root, restored after) ─
await mountFixture({}); // a FRESH unscoped, bg-less stage — no leftover scope
fill = await page.evaluate(async () => {
  const html = document.documentElement;
  const body = document.body;
  const stage = window.__w1Stage;
  const saved = {
    htmlClass: html.className,
    htmlTheme: html.getAttribute('data-theme'),
    bodyClass: body.className,
    bodyTheme: body.getAttribute('data-theme'),
  };
  html.className = html.className.replace(/\b(dark|jx-light)\b/g, '').trim();
  html.removeAttribute('data-theme');
  body.className = body.className.replace(/\b(dark|jx-light)\b/g, '').trim();
  body.removeAttribute('data-theme');
  stage.removeAttribute('data-theme');
  stage.className = 'w1-stage';
  const rt = await import('/src/lib/ui/press-button/press-effect-runtime.ts');
  const hostEl = window.__w1Shimmer;
  const detach = rt.applyShimmer(hostEl, { type: 'shimmer', shine: 'var(--primary)', ringColor: 'currentColor', shineWidth: '30deg', speed: 3000, ringW: '1px', fill: undefined });
  const dark = rt.contextIsDark(hostEl);
  const base = rt.contextBaseCss(hostEl);
  const bodyBg = getComputedStyle(body).backgroundColor;
  const stamped = getComputedStyle(hostEl).getPropertyValue('--shimmer-fill').trim();
  detach();
  html.className = saved.htmlClass;
  if (saved.htmlTheme !== null) html.setAttribute('data-theme', saved.htmlTheme);
  body.className = saved.bodyClass;
  if (saved.bodyTheme !== null) body.setAttribute('data-theme', saved.bodyTheme);
  return { dark, base, bodyBg, stamped };
});
check(
  'G · no scope anywhere → the OS scheme answers (dark under emulateMedia dark)',
  fill.dark === true,
  `contextIsDark=${fill.dark}`
);
check(
  'G · the unscoped base = the measured page base (body background)',
  fill.base === fill.bodyBg && fill.stamped === fill.bodyBg,
  `base=${fill.base} bodyBg=${fill.bodyBg} stamped=${fill.stamped}`
);

// ── task 1.4: the docs demo hosts, both stage themes, OS-dark ───────
await page.emulateMedia({ colorScheme: 'dark' });
await page.evaluate(() => {
  window.__w1DetachShimmer?.();
  window.__w1DetachRainbow?.();
  window.__w1Stage?.remove();
  delete window.__w1Stage;
});
// the shimmer canvas stage + rainbow canvas stage on the page
const docsRead = await page.evaluate(async () => {
  const out = {};
  for (const kind of ['shimmer', 'rainbow']) {
    const section = document.getElementById(kind);
    const stage = section?.querySelector('[data-jx-canvas-stage]');
    if (!stage) continue;
    const hosts = [...section.querySelectorAll('[data-fx-demo]')];
    const read = () => hosts.map((h) => ({
      demo: h.getAttribute('data-fx-demo'),
      fill: getComputedStyle(h).getPropertyValue(`--${kind}-fill`).trim(),
    }));
    const flips = {};
    // light stage first (data-theme + jx-light — the canvas's own projection)
    stage.setAttribute('data-theme', 'light');
    stage.classList.remove('dark');
    stage.classList.add('jx-light');
    await new Promise((r) => setTimeout(r, 50));
    flips.light = read();
    // dark stage
    stage.setAttribute('data-theme', 'dark');
    stage.classList.remove('jx-light');
    stage.classList.add('dark');
    await new Promise((r) => setTimeout(r, 50));
    flips.dark = read();
    // restore the page's own light state
    stage.setAttribute('data-theme', 'light');
    stage.classList.remove('dark');
    stage.classList.add('jx-light');
    await new Promise((r) => setTimeout(r, 50));
    out[kind] = { band: getComputedStyle(stage.querySelector('.glass-band')).backgroundColor, flips };
  }
  return out;
});
for (const kind of ['shimmer', 'rainbow']) {
  const d = docsRead[kind];
  const fillsOk = [...d.flips.light, ...d.flips.dark].every((h) => h.fill === 'rgb(16, 16, 20)');
  check(
    `docs · the ${kind} demo hosts resolve the BAND base (#101014) in BOTH stage themes on an OS-dark machine`,
    fillsOk,
    `band=${d.band} light=${JSON.stringify(d.flips.light.map((h) => h.fill))} dark=${JSON.stringify(d.flips.dark.map((h) => h.fill))}`
  );
}
// screenshots: the shimmer + rainbow demo bands in both stage themes
const setStageTheme = (kind, theme) =>
  page.evaluate(async ([kind, theme]) => {
    const stage = document.getElementById(kind).querySelector('[data-jx-canvas-stage]');
    stage.setAttribute('data-theme', theme);
    stage.classList.remove('dark', 'jx-light');
    stage.classList.add(theme === 'dark' ? 'dark' : 'jx-light');
    await new Promise((r) => setTimeout(r, 120));
  }, [kind, theme]);
for (const kind of ['shimmer', 'rainbow']) {
  // FULL entry, not minimal-visibility: the scroll-driven reveal
  // settles only once the section is properly in view
  await page.evaluate((kind) => {
    document.getElementById(kind).scrollIntoView({ block: 'start' });
  }, kind);
  await page.waitForTimeout(500);
  // the demo band itself is the receipt subject — an ELEMENT shot owns
  // its own geometry (the docs shell scrolls in a nested .jx-shell-body,
  // where page-absolute clip coordinates are not addressable)
  const band = await page.$(`#${kind} .glass-band`);
  await setStageTheme(kind, 'light');
  await band.screenshot({ path: `${OUT}/docs-${kind}-stage-light-os-dark.png` });
  await setStageTheme(kind, 'dark');
  await band.screenshot({ path: `${OUT}/docs-${kind}-stage-dark-os-dark.png` });
  await setStageTheme(kind, 'light'); // restore the page's own state
}
// leave no probe fixtures behind
await page.evaluate(() => {
  window.__w1DetachShimmer?.();
  window.__w1DetachRainbow?.();
  window.__w1Stage?.remove();
  document.getElementById('w1-probe')?.remove();
});
await page.waitForTimeout(300);

const failed = results.filter((r) => !r.ok);
writeFileSync(
  `${OUT}/w1-fill-channel-probe-output.json`,
  JSON.stringify({ run: new Date().toISOString(), results, failed: failed.length }, null, 2)
);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
await browser.close();
process.exit(failed.length ? 1 : 0);
