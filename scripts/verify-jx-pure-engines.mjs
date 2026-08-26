// Cross-engine verification: Firefox + WebKit evidence for the
// openspec change 2026-08-24-jx-pure-owner-round-2 (r8 gap 5: the
// risk list demands REAL cross-engine runs — Chromium-only probes
// were ruled insufficient for D1/D4/:has()/forced-colors).
//
// Honest-probe policy: pseudo-element computed styles are not
// reflectable cross-engine, so the assertions ride ELEMENT-level
// computed styles + pixel sampling + :has() feature detection.
// Usage: node scripts/verify-jx-pure-engines.mjs [port]
import { chromium, firefox, webkit } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const OUT = '/tmp/jx-pure-engines';
mkdirSync(OUT, { recursive: true });
const port = process.argv[2] ?? '5199';

const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
const white = [255, 255, 255];

async function samplePx(page, locator, points) {
  const buf = await locator.screenshot();
  return page.evaluate(async ({ b64, points }) => {
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

async function runEngine(name, launch) {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  const failed = [];
  const ok = (n, c) => { console.log(`${c ? 'PASS' : 'FAIL'}  [${name}] ${n}`); if (!c) failed.push(n); };

  // docs-restructure: the jx-pure page now lives at /docs/jx-pure.html
  await page.goto(`http://localhost:${port}/docs/jx-pure.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);

  // ---- D1: thin rail + fill + (engine-specific) thumb visibility ----
  const range = await page.evaluate(() => {
    const r = document.querySelector('#forms .jx-pure input[type="range"]');
    const cs = getComputedStyle(r);
    return { h: cs.height, container: cs.containerType, overflow: cs.overflow };
  });
  const iconPx = await page.evaluate(() => {
    const scope = document.querySelector('#forms .jx-pure');
    const el = document.createElement('div');
    el.style.minHeight = 'var(--jx-icon)';
    el.style.position = 'absolute';
    scope.appendChild(el);
    const px = getComputedStyle(el).minHeight;
    el.remove();
    return px;
  });
  // density adoption: the pill rides --jx-icon (was a hard 24px)
  ok(`range: the DERIVED daisyUI pill paint box (${iconPx})`, range.h === iconPx);
  ok('range: container-type + overflow clip machinery', range.container === 'inline-size' && range.overflow === 'hidden');

  await page.locator('#forms .jx-pure input[type="range"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const dims = await samplePx(page, page.locator('#forms .jx-pure input[type="range"]'), [[0, 4]]);
  const fill = await samplePx(page, page.locator('#forms .jx-pure input[type="range"]'), [
    [dims.w * 0.15, dims.h / 2],
    [dims.w * 0.9, dims.h / 2],
    // the BIG thumb: sample the row ABOVE the rail (webkit outline overhang)
    [dims.w * 0.4 - 14, 2],
    [dims.w * 0.4 - 14, dims.h - 3],
  ]);
  // value=40 → thumb center ≈ 40% — sample ±14px around it at rail-edge rows
  // the ringed disc at the thumb position (value 40 → ~40% width)
  const thumbProbe = await samplePx(page, page.locator('#forms .jx-pure input[type="range"]'), [
    [dims.w * 0.4, dims.h / 2],
  ]);
  ok('range: fill present before the thumb (pixel)', dist(fill.px[0], white) > 120);
  ok('range: the 10%-groove past the thumb (pixel)', dist(fill.px[1], fill.px[0]) > 100);
  ok('range: the light disc ON a primary ring at the thumb (pixel)', dist(thumbProbe.px[0], fill.px[0]) > 90);

  // ---- D4: switch geometry + on/off contrast (pixels) ----
  const sw = await page.evaluate(() => {
    const el = document.querySelector('#switch input[role="switch"]');
    return { w: getComputedStyle(el).width, h: getComputedStyle(el).height };
  });
  ok('switch: 32×20 sm track', sw.w === '32px' && sw.h === '20px');
  // :has() label posture (feature detection)
  const hasLabel = await page.evaluate(() => {
    const l = document.querySelector('#switch label');
    return getComputedStyle(l).display === 'flex';
  });
  ok('switch: :has() label posture', hasLabel);
  await page.locator('#switch input[role="switch"]').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const swShot = await samplePx(page, page.locator('#switch input[role="switch"]').first(), [
    [4, 10],   // knob zone (off: knob at left, background-colored)
    [28, 10],  // empty track zone right
  ]);
  ok('switch: off knob paints at inline-start', dist(swShot.px[0], swShot.px[1]) > 40);

  // ---- D2: select chevron pixels (default jx) ----
  await page.locator('#forms .jx-pure select').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const selShot = await samplePx(page, page.locator('#forms .jx-pure select').first(), [
    [0, 20], [0, 20], // placeholder replaced below
  ]);
  const selDims = await page.evaluate(async () => {
    const el = document.querySelector('#forms .jx-pure select');
    const r = el.getBoundingClientRect();
    return { w: r.width, h: r.height };
  });
  // per-engine law: Chromium/WebKit paint the jx chevron; Firefox
  // keeps its PLATFORM arrow (author bg-images don't paint on select)
  const selAppearance = await page.evaluate(() => getComputedStyle(document.querySelector('#forms .jx-pure select:not([multiple])')).appearance);
  if (name === 'firefox') {
    ok('select: Firefox keeps the platform arrow (bg-image finding)', selAppearance !== 'none');
  } else {
    const chev = await samplePx(page, page.locator('#forms .jx-pure select').first(), [
      [selDims.w - 18, selDims.h / 2],
      [selDims.w - 4, selDims.h / 2],
    ]);
    ok('select: chevron zone differs from the far edge', dist(chev.px[0], chev.px[1]) > 24 || dist(chev.px[0], white) > 60);
  }

  // ---- forced-colors: custom paint reverts (emulated) ----
  await page.emulateMedia({ forcedColors: 'active' });
  await page.waitForTimeout(300);
  const fc = await page.evaluate(() => {
    const r = document.querySelector('#forms .jx-pure input[type="range"]');
    const sel = document.querySelector('#forms .jx-pure select:not([multiple])');
    return { range: getComputedStyle(r).appearance, select: getComputedStyle(sel).appearance };
  });
  ok('forced-colors: range reverts to native', fc.range !== 'none');
  ok('forced-colors: select reverts to native', fc.select !== 'none');
  await page.emulateMedia({ forcedColors: null });

  await page.screenshot({ path: `${OUT}/${name}-page.png` });
  await browser.close();
  return failed;
}

const total = [];
const ran = [];
// the cache carries slightly older builds than this playwright-core
// expects — point executablePath at what exists (protocol-compatible)
// ENGINES=firefox / ENGINES=webkit filters the run (a hung engine can
// be rerun standalone instead of re-walking the healthy one)
const wanted = (process.env.ENGINES ?? 'firefox,webkit').split(',');
for (const [name, launch] of [
  // the machine proxy black-holes localhost (verify-jx-pure's Chrome
  // lesson): firefox must go DIRECT (proxy.type 0) or every goto dies
  // with NS_ERROR_NET_ERROR_RESPONSE; webkit's soup stack honors no_proxy
  ['firefox', () => firefox.launch({ executablePath: `${process.env.HOME}/Library/Caches/ms-playwright/firefox-1532/firefox/Nightly.app/Contents/MacOS/firefox`, firefoxUserPrefs: { 'network.proxy.type': 0 } })],
  ['webkit', () => webkit.launch({ executablePath: process.env.WEBKIT_PATH ?? `${process.env.HOME}/Library/Caches/ms-playwright/webkit-2311/pw_run.sh`, env: { ...process.env, no_proxy: 'localhost,127.0.0.1', NO_PROXY: 'localhost,127.0.0.1' } })],
]) {
  if (!wanted.includes(name)) continue;
  let browser = null;
  try {
    // a mismatched cached build can hang at the protocol handshake —
    // race the LAUNCH with a timeout and skip cleanly on hang. A hung
    // launch never yields a handle (the child leaks until the host
    // reaps it — the ENGINES filter exists so reruns skip the bad one)
    const withTimeout = (ms, label) => {
      let t;
      const guard = new Promise((_, rej) => { t = setTimeout(() => rej(new Error(label + ' launch hang')), ms); });
      return (promise) => Promise.race([promise, guard]).finally(() => clearTimeout(t));
    };
    browser = await withTimeout(45000, name)(launch());
  } catch (e) {
    console.log(`SKIP  [${name}] engine unavailable: ${e.message.split('\n')[0]}`);
    continue;
  }
  // runEngine failures are FAILURES, not skips (r4: the old catch
  // conflated them and let zero-engine runs report success)
  try {
    total.push(...(await runEngine(name, () => Promise.resolve(browser))));
    ran.push(name);
  } catch (e) {
    console.log(`FAIL  [${name}] engine run aborted: ${e.message.split('\n')[0]}`);
    total.push(`[${name}] engine run aborted`);
  } finally {
    await browser.close().catch(() => {});
  }
}
console.log(`screenshots: ${OUT}/`);
if (ran.length === 0) {
  // r4 ruling: a run with ZERO engines that executed is not a pass —
  // fail loudly (release mode requires at least one engine's evidence)
  console.error('no engine ran (all skipped/failed) — zero-engine runs are failures');
  process.exit(1);
}
if (total.length) {
  console.error(`${total.length} cross-engine check(s) failed`);
  process.exit(1);
}
console.log(`cross-engine checks passed (engines that ran: ${ran.join(', ')})`);
