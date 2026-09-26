// fill-scope-token-probe.mjs — the press-effect fill auto basis,
// token-probed in the pinned Chromium (timeline-reui-progress-upgrade
// W1 task 1.2; the w1-fill-channel-probe.mjs pattern, REWRITTEN to the
// Owner's r2 correction).
//
// THE LAW UNDER TEST: auto fill (fill: undefined — shimmer sweep,
// rainbow wash) rides the SAME basis as text/border — the theme
// scope's --background TOKEN, read at the nearest theme-scope ancestor
// (self included; unscoped chain → the root element's token) and
// parsed OPAQUE through @jixoai/color-utils' oklch bridge after a
// raw-string slash-alpha pre-pass. NEVER a measured ancestor: the
// effects gallery's dark opaque glass-band (rgb(16,16,20)) sits INSIDE
// a light [data-jx-canvas-stage] scope and must NOT claim the fill.
// The OS scheme never enters the color path.
//
// Drives the Owner's dev server READ-ONLY (GET + in-page DOM; the
// server is never restarted). The REAL gallery hosts on
// /docs/effects.html are read live under an OS-dark emulation (the
// Owner's machine), then synthetic fixtures mount the REAL runtime
// (dynamic import of the live module) inside the REAL page (the
// press-button sheet is already in the page's graph). The scratch
// stage rides a FIXED overlay at the viewport top — outside the
// scroll-driven [data-reveal] machinery that dims deep content
// (probe-isolation, measured the hard way in the r1 probe).
import { chromium } from '../../../../../node_modules/playwright-core/index.mjs';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const CHROME =
  process.env.HOME +
  '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const OUT = dirname(fileURLToPath(import.meta.url));

// ── minimal PNG decoder (RGBA8/RGB8, non-interlaced — exactly what
//    Chromium screenshots emit); zlib is node's own ──────────────────
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89_50_4e_47) throw new Error('not a PNG');
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
// 'rgb(255 255 255)' | 'rgb(255, 255, 255)' → [255, 255, 255]
const parseRgb = (s) =>
  (s.match(/^rgb\(([^)]+)\)$/)?.[1] ?? '')
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);

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

// the scratch overlay (fixed, z-max, transparent — outside [data-reveal])
await page.evaluate(() => {
  const s = document.createElement('style');
  s.id = 'w1r2-probe';
  s.textContent = `.w1r2-stage { position: fixed; top: 0; left: 0; z-index: 2147483647; margin: 0; padding: 14px; }
.w1r2-host { display: inline-flex; width: 140px; height: 44px; appearance: none; border: none; }`;
  document.head.append(s);
});

// a scratch scope stage + one shimmer host + one rainbow host
const mountFixture = (scheme) =>
  page.evaluate((scheme) => {
    window.__w1r2DetachShimmer?.();
    window.__w1r2DetachRainbow?.();
    window.__w1r2Stage?.remove();
    const stage = document.createElement('div');
    stage.className = `w1r2-stage ${scheme.classes ?? ''}`;
    if (scheme.attr) stage.setAttribute(scheme.attr[0], scheme.attr[1]);
    if (scheme.token !== undefined) stage.style.setProperty('--background', scheme.token);
    const mk = (kind) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'w1r2-host';
      b.dataset.w1r2 = kind;
      return b;
    };
    window.__w1r2Shimmer = mk('shimmer');
    window.__w1r2Rainbow = mk('rainbow');
    stage.append(window.__w1r2Shimmer, window.__w1r2Rainbow);
    document.body.append(stage);
    window.__w1r2Stage = stage;
  }, scheme);

// mount BOTH kernels with auto fill through the REAL runtime module
const mountEffects = () =>
  page.evaluate(async () => {
    const rt = await import('/src/lib/ui/press-button/press-effect-runtime.ts');
    window.__w1r2Runtime = rt;
    window.__w1r2DetachShimmer = rt.applyShimmer(window.__w1r2Shimmer, {
      type: 'shimmer',
      shine: 'var(--primary)',
      ringColor: 'currentColor',
      shineWidth: '30deg',
      speed: 300000, // a near-frozen arc — pixel samples must not catch it
      ringW: '1px',
      fill: undefined,
    });
    window.__w1r2DetachRainbow = rt.applyRainbow(window.__w1r2Rainbow, {
      type: 'rainbow',
      speed: 2000,
      colors: ['hsl(0 100% 63%)', 'hsl(270 100% 63%)', 'hsl(210 100% 63%)', 'hsl(195 100% 63%)', 'hsl(90 100% 63%)'],
      ringW: '1px',
      fill: undefined,
    });
    return {
      shimmerVar: getComputedStyle(window.__w1r2Shimmer).getPropertyValue('--shimmer-fill').trim(),
      rainbowVar: getComputedStyle(window.__w1r2Rainbow).getPropertyValue('--rainbow-fill').trim(),
      contextDark: rt.contextIsDark(window.__w1r2Shimmer),
      osDark: matchMedia('(prefers-color-scheme: dark)').matches,
    };
  });
const readVars = () =>
  page.evaluate(() => ({
    shimmerVar: getComputedStyle(window.__w1r2Shimmer).getPropertyValue('--shimmer-fill').trim(),
    rainbowVar: getComputedStyle(window.__w1r2Rainbow).getPropertyValue('--rainbow-fill').trim(),
    stamped:
      window.__w1r2Shimmer.hasAttribute('data-jx-shimmer-host') &&
      window.__w1r2Rainbow.hasAttribute('data-jx-rainbow-host'),
  }));

// ── 1 · THE GALLERY CASE (the Owner's exact reported scene): the real
//      docs hosts, light canvas stage, dark OPAQUE glass-band inside,
//      OS emulated DARK — the fill must be the stage scope's LIGHT
//      token, not the band's measured rgb(16,16,20) ───────────────────
await page.emulateMedia({ colorScheme: 'dark' });
const gallery = await page.evaluate(() => {
  const out = {};
  for (const kind of ['shimmer', 'rainbow']) {
    const section = document.getElementById(kind);
    const stage = section.querySelector('[data-jx-canvas-stage]');
    const band = stage.querySelector('.glass-band');
    const hosts = [...section.querySelectorAll('[data-fx-demo]')];
    out[kind] = {
      stageTheme: stage.getAttribute('data-theme'),
      stageScopedLight: stage.classList.contains('jx-light'),
      stageToken: getComputedStyle(stage).getPropertyValue('--background').trim(),
      bandBg: getComputedStyle(band).backgroundColor,
      bandToken: getComputedStyle(band).getPropertyValue('--background').trim(),
      fills: hosts.map((h) => getComputedStyle(h).getPropertyValue(`--${kind}-fill`).trim()),
      hostsLive: hosts.map((h) => h.hasAttribute(`data-jx-${kind}-host`)),
    };
  }
  return out;
});
for (const kind of ['shimmer', 'rainbow']) {
  const g = gallery[kind];
  check(
    `gallery · the ${kind} stage is a LIGHT scope carrying the light token`,
    g.stageTheme === 'light' && g.stageScopedLight && g.stageToken === 'oklch(1 0 0)' && g.hostsLive.every(Boolean),
    `theme=${g.stageTheme} token=${g.stageToken} hosts=${g.hostsLive.filter(Boolean).length}/${g.hostsLive.length}`,
  );
  check(
    `gallery · the ${kind} band is the OPAQUE dark scenery (rgb(16,16,20), token #101014)`,
    g.bandBg === 'rgb(16, 16, 20)' && g.bandToken === '#101014',
    `bandBg=${g.bandBg} bandToken=${g.bandToken}`,
  );
  check(
    `gallery · the ${kind} hosts' painted fill layer is the scope's LIGHT token, NEVER the band`,
    g.fills.length > 0 && g.fills.every((f) => f === 'rgb(255 255 255)') && g.fills.every((f) => f !== g.bandBg),
    `fills=${JSON.stringify(g.fills)} band=${g.bandBg}`,
  );
  check(
    `gallery · the ${kind} fill parses LIGHT`,
    g.fills.every((f) => lum(parseRgb(f)) > 0.5),
    `lum=${(lum(parseRgb(g.fills[0])) || 0).toFixed(3)}`,
  );
}

// the live gallery flip: the canvas stage's own mechanism (data-theme +
// class together, the component's projection) re-resolves in place
const galleryFlip = await page.evaluate(async () => {
  const section = document.getElementById('shimmer');
  const stage = section.querySelector('[data-jx-canvas-stage]');
  const host = section.querySelector('[data-fx-demo]');
  const before = getComputedStyle(host).getPropertyValue('--shimmer-fill').trim();
  stage.setAttribute('data-theme', 'dark');
  stage.classList.remove('jx-light');
  stage.classList.add('dark');
  await new Promise((r) => setTimeout(r, 90));
  const dark = getComputedStyle(host).getPropertyValue('--shimmer-fill').trim();
  const darkToken = getComputedStyle(stage).getPropertyValue('--background').trim();
  stage.setAttribute('data-theme', 'light');
  stage.classList.remove('dark');
  stage.classList.add('jx-light');
  await new Promise((r) => setTimeout(r, 90));
  const restored = getComputedStyle(host).getPropertyValue('--shimmer-fill').trim();
  return { before, dark, darkToken, restored, sameHost: host.hasAttribute('data-jx-shimmer-host') };
});
check(
  'gallery · the live stage flip re-resolves to the DARK token without a remount',
  galleryFlip.before === 'rgb(255 255 255)' &&
    galleryFlip.dark === 'rgb(0 0 0)' &&
    galleryFlip.darkToken === 'oklch(0 0 0)' &&
    galleryFlip.sameHost,
  `before=${galleryFlip.before} dark=${galleryFlip.dark} darkToken=${galleryFlip.darkToken} sameHost=${galleryFlip.sameHost}`,
);
check('gallery · the flip back restores the light fill', galleryFlip.restored === 'rgb(255 255 255)', `restored=${galleryFlip.restored}`);

// ── 2 · scratch A: a LIGHT scope under OS-dark — the token, not the OS ─
await mountFixture({ attr: ['data-theme', 'light'], classes: 'jx-light' });
let fill = await mountEffects();
check(
  'A · light scope + OS-dark → the context is LIGHT (the scope, not the OS)',
  fill.contextDark === false && fill.osDark === true,
  `contextIsDark=${fill.contextDark} osDark=${fill.osDark}`,
);
check(
  'A · the auto fill parses the scope light token (both kernels)',
  fill.shimmerVar === 'rgb(255 255 255)' && fill.rainbowVar === 'rgb(255 255 255)',
  `shimmer=${fill.shimmerVar} rainbow=${fill.rainbowVar}`,
);
{
  const el = await page.$('[data-w1r2="shimmer"]');
  const png = decodePng(await el.screenshot());
  const px = pixelAt(png, Math.floor(png.width / 2), Math.floor(png.height / 2));
  check('A · PIXEL: the shimmer face samples LIGHT on the light scope', near(px, [255, 255, 255]) && lum(px) > 0.5, `face pixel rgb(${px.join(', ')})`);
}

// ── 3 · scratch B: a DARK scope → the dark token ─────────────────────
await mountFixture({ attr: ['data-theme', 'dark'], classes: 'dark' });
fill = await mountEffects();
check(
  'B · dark scope → dark context, the dark token (both kernels)',
  fill.contextDark === true && fill.shimmerVar === 'rgb(0 0 0)' && fill.rainbowVar === 'rgb(0 0 0)',
  `contextIsDark=${fill.contextDark} shimmer=${fill.shimmerVar} rainbow=${fill.rainbowVar}`,
);
{
  const el = await page.$('[data-w1r2="shimmer"]');
  const png = decodePng(await el.screenshot());
  const px = pixelAt(png, Math.floor(png.width / 2), Math.floor(png.height / 2));
  check('B · PIXEL: the shimmer face samples DARK on the dark scope', near(px, [0, 0, 0]) && lum(px) < 0.5, `face pixel rgb(${px.join(', ')})`);
}

// ── 4 · scratch C: the slash-alpha pre-pass, judged on the RAW token
//      (inline scoped styles on the scratch scope element) ────────────
const alphaCases = [
  { token: 'oklch(0 0 0 / 1)', expect: 'rgb(0 0 0)', label: '/ 1 proceeds' },
  { token: 'oklch(0 0 0 / 100%)', expect: 'rgb(0 0 0)', label: '/ 100% proceeds' },
  { token: 'rgb(16 16 20 / 1)', expect: 'rgb(16 16 20)', label: 'rgb() / 1 proceeds', tol: 1 },
  { token: 'rgb(16 16 20 / 100%)', expect: 'rgb(16 16 20)', label: 'rgb() / 100% proceeds', tol: 1 },
  { token: 'oklch(0 0 0 / 0.5)', expect: '#ffffff', label: '/ 0.5 falls back (light scope)' },
  { token: 'rgb(16 16 20 / 50%)', expect: '#ffffff', label: 'rgb() / 50% falls back (light scope)' },
  { token: 'oklch(0 0 0 / none)', expect: '#ffffff', label: '/ none falls back (light scope)' },
  { token: 'oklch(0 0 0 / junk)', expect: '#ffffff', label: 'unparsable alpha falls back (light scope)' },
];
for (const c of alphaCases) {
  await mountFixture({ attr: ['data-theme', 'light'], classes: 'jx-light', token: c.token });
  fill = await mountEffects();
  const ok =
    c.tol === undefined
      ? fill.shimmerVar === c.expect && fill.rainbowVar === c.expect
      : near(parseRgb(fill.shimmerVar), parseRgb(c.expect), c.tol) && near(parseRgb(fill.rainbowVar), parseRgb(c.expect), c.tol);
  check(`C · slash-alpha: ${c.label}`, ok, `token="${c.token}" shimmer=${fill.shimmerVar} rainbow=${fill.rainbowVar}`);
}
// the dark-scope converse of the fallback arm
await mountFixture({ attr: ['data-theme', 'dark'], classes: 'dark', token: 'oklch(0 0 0 / 0.5)' });
fill = await mountEffects();
check(
  'C · slash-alpha: / 0.5 falls back to the ladder BLACK arm on a dark scope',
  fill.shimmerVar === '#000000' && fill.rainbowVar === '#000000',
  `shimmer=${fill.shimmerVar} rainbow=${fill.rainbowVar}`,
);

// ── 5 · scratch D: UNSCOPED (scrubbed root) → the ROOT element's token;
//      the OS scheme never enters the color path; the hostless mint too ─
const unscoped = await page.evaluate(async () => {
  const html = document.documentElement;
  const body = document.body;
  const saved = { htmlClass: html.className, htmlTheme: html.getAttribute('data-theme'), bodyClass: body.className, bodyTheme: body.getAttribute('data-theme') };
  html.className = html.className.replace(/\b(dark|jx-light)\b/g, '').trim();
  html.removeAttribute('data-theme');
  body.className = body.className.replace(/\b(dark|jx-light)\b/g, '').trim();
  body.removeAttribute('data-theme');
  window.__w1r2DetachShimmer?.();
  window.__w1r2DetachRainbow?.();
  window.__w1r2Stage?.remove();
  const stage = document.createElement('div');
  stage.className = 'w1r2-stage'; // NO scope marker anywhere on the chain
  const shimmerHost = document.createElement('button');
  shimmerHost.type = 'button';
  shimmerHost.className = 'w1r2-host';
  shimmerHost.dataset.w1r2 = 'shimmer';
  const rainbowHost = document.createElement('button');
  rainbowHost.type = 'button';
  rainbowHost.className = 'w1r2-host';
  rainbowHost.dataset.w1r2 = 'rainbow';
  stage.append(shimmerHost, rainbowHost);
  document.body.append(stage);
  window.__w1r2Stage = stage;
  window.__w1r2Shimmer = shimmerHost;
  window.__w1r2Rainbow = rainbowHost;
  const rt = await import('/src/lib/ui/press-button/press-effect-runtime.ts');
  window.__w1r2Runtime = rt;
  window.__w1r2DetachShimmer = rt.applyShimmer(shimmerHost, { type: 'shimmer', shine: 'var(--primary)', ringColor: 'currentColor', shineWidth: '30deg', speed: 300000, ringW: '1px', fill: undefined });
  window.__w1r2DetachRainbow = rt.applyRainbow(rainbowHost, { type: 'rainbow', speed: 2000, colors: ['hsl(0 100% 63%)', 'hsl(270 100% 63%)', 'hsl(210 100% 63%)', 'hsl(195 100% 63%)', 'hsl(90 100% 63%)'], ringW: '1px', fill: undefined });
  const out = {
    rootToken: getComputedStyle(html).getPropertyValue('--background').trim(),
    contextDark: rt.contextIsDark(shimmerHost),
    osDark: matchMedia('(prefers-color-scheme: dark)').matches,
    shimmerVar: getComputedStyle(shimmerHost).getPropertyValue('--shimmer-fill').trim(),
    rainbowVar: getComputedStyle(rainbowHost).getPropertyValue('--rainbow-fill').trim(),
    hostlessCanvas: rt.contextCanvasCss(),
    hostlessMint: rt.solidFill('rgba(255, 0, 0, 0.5)'),
  };
  html.className = saved.htmlClass;
  if (saved.htmlTheme !== null) html.setAttribute('data-theme', saved.htmlTheme);
  body.className = saved.bodyClass;
  if (saved.bodyTheme !== null) body.setAttribute('data-theme', saved.bodyTheme);
  return out;
});
check(
  'D · unscoped chain → the ROOT element token (light), OS-dark notwithstanding',
  unscoped.rootToken === 'oklch(1 0 0)' &&
    unscoped.shimmerVar === 'rgb(255 255 255)' &&
    unscoped.rainbowVar === 'rgb(255 255 255)' &&
    unscoped.osDark === true,
  `rootToken=${unscoped.rootToken} shimmer=${unscoped.shimmerVar} rainbow=${unscoped.rainbowVar} osDark=${unscoped.osDark}`,
);
check(
  'D · the hostless mint rides the same ladder (contextCanvasCss/solidFill with no host)',
  unscoped.hostlessCanvas === 'rgb(255 255 255)' && unscoped.hostlessMint === ((0xff << 16) | (0x80 << 8) | 0x80),
  `canvas=${unscoped.hostlessCanvas} mint=0x${unscoped.hostlessMint.toString(16)}`,
);

// ── 6 · scratch E: live flips re-resolve through the observer ────────
// class-flip arm: jx-light → dark (the sheet flips the token with it)
await mountFixture({ classes: 'jx-light' });
fill = await mountEffects();
check('E · class-scoped light starts light', fill.shimmerVar === 'rgb(255 255 255)', `shimmer=${fill.shimmerVar}`);
let flipped = await page.evaluate(async () => {
  const stage = window.__w1r2Stage;
  stage.classList.remove('jx-light');
  stage.classList.add('dark');
  await new Promise((r) => setTimeout(r, 90));
  return {
    ...{
      shimmerVar: getComputedStyle(window.__w1r2Shimmer).getPropertyValue('--shimmer-fill').trim(),
      rainbowVar: getComputedStyle(window.__w1r2Rainbow).getPropertyValue('--rainbow-fill').trim(),
    },
    stamped: window.__w1r2Shimmer.hasAttribute('data-jx-shimmer-host'),
  };
});
check(
  'E · the CLASS flip re-resolves LIVE to the dark token, no remount (both kernels)',
  flipped.shimmerVar === 'rgb(0 0 0)' && flipped.rainbowVar === 'rgb(0 0 0)' && flipped.stamped,
  `shimmer=${flipped.shimmerVar} rainbow=${flipped.rainbowVar} hostStamped=${flipped.stamped}`,
);
// attr-channel arm (isolated): the data-theme mutation ALONE must wake
// the observer — the re-resolve reads whatever the token is THEN (here
// an inline token swapped in the same tick; if the observer ignored
// data-theme the fill would stay light)
const attrFlip = await page.evaluate(async () => {
  window.__w1r2DetachShimmer?.();
  window.__w1r2DetachRainbow?.();
  window.__w1r2Stage?.remove();
  const stage = document.createElement('div');
  stage.className = 'w1r2-stage';
  stage.setAttribute('data-theme', 'light');
  stage.style.setProperty('--background', 'oklch(1 0 0)');
  const host = document.createElement('button');
  host.type = 'button';
  host.className = 'w1r2-host';
  host.dataset.w1r2 = 'shimmer';
  stage.append(host);
  document.body.append(stage);
  window.__w1r2Stage = stage;
  window.__w1r2Shimmer = host;
  const rt = await import('/src/lib/ui/press-button/press-effect-runtime.ts');
  window.__w1r2DetachShimmer = rt.applyShimmer(host, { type: 'shimmer', shine: 'var(--primary)', ringColor: 'currentColor', shineWidth: '30deg', speed: 300000, ringW: '1px', fill: undefined });
  const before = getComputedStyle(host).getPropertyValue('--shimmer-fill').trim();
  stage.setAttribute('data-theme', 'dark'); // the ONLY observed mutation…
  stage.style.setProperty('--background', 'oklch(0 0 0)'); // …read by the re-resolve
  await new Promise((r) => setTimeout(r, 90));
  const after = getComputedStyle(host).getPropertyValue('--shimmer-fill').trim();
  return { before, after, sameHost: host.hasAttribute('data-jx-shimmer-host') };
});
check(
  'E · the DATA-THEME attr flip wakes the observer (re-resolve reads the new token)',
  attrFlip.before === 'rgb(255 255 255)' && attrFlip.after === 'rgb(0 0 0)' && attrFlip.sameHost,
  `before=${attrFlip.before} after=${attrFlip.after} sameHost=${attrFlip.sameHost}`,
);

// ── 7 · teardown: vars stripped, later flips re-stamp nothing ────────
const torn = await page.evaluate(async () => {
  window.__w1r2DetachShimmer?.();
  window.__w1r2DetachRainbow?.();
  const host = window.__w1r2Shimmer;
  window.__w1r2Stage.setAttribute('data-theme', 'light');
  window.__w1r2Stage.style.setProperty('--background', 'oklch(1 0 0)');
  await new Promise((r) => setTimeout(r, 90));
  return {
    shimmerVar: getComputedStyle(host).getPropertyValue('--shimmer-fill').trim(),
    stamped: host.hasAttribute('data-jx-shimmer-host'),
  };
});
check('F · teardown: vars stripped, later flips re-stamp nothing', torn.shimmerVar === '' && torn.stamped === false, `var="${torn.shimmerVar}" stamped=${torn.stamped}`);

// leave no probe fixtures behind
await page.evaluate(() => {
  window.__w1r2DetachShimmer?.();
  window.__w1r2DetachRainbow?.();
  window.__w1r2Stage?.remove();
  document.getElementById('w1r2-probe')?.remove();
});
await page.waitForTimeout(300);

const failed = results.filter((r) => !r.ok);
writeFileSync(
  join(OUT, 'fill-scope-token-probe-output.json'),
  JSON.stringify({ run: new Date().toISOString(), results, failed: failed.length }, null, 2),
);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
await browser.close();
process.exit(failed.length ? 1 : 0);
