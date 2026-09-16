#!/usr/bin/env node
// probe-tailwindless-consumer — the CLEAN CONSUMER receipt
// (tailwindless-site P0 task 2.3, 2026-09-17; proposal: "the CLEAN
// CONSUMER receipt — a plain-vite spot project, ZERO Tailwind and
// zero @stylexjs, installing the migrated separator item + the theme
// sheet and rendering it").
//
// What the probe proves, end to end (F11 — consumers owe no engine):
//
//   1. the THROWAWAY project owes NOTHING: package.json with zero
//      dependencies (no tailwindcss, no @stylexjs/*), no plugins, no
//      config — the spot-compile machinery of verify:stylex-payload
//      (vite resolved from apps/www's install, driven headless).
//   2. it consumes the SHIPPED payload artifacts as files copied into
//      the project (the installed-item shape): the separator item's
//      compiled class module + css, the tokens projection css, and
//      the jixoai theme sheet — plain strings + css, never a
//      `.stylex.ts` source, never an @stylexjs import.
//   3. a REAL browser renders the migrated family's horizontal /
//      vertical / solid postures and the probe asserts NON-TRIVIAL
//      drawing programmatically (pixel deltas against the undisturbed
//      backdrop + computed geometry) — no vision model in the loop
//      (the black-image hallucination law: pixel math first).
//   4. the probe SELF-CONVERGES: browser + server processes exit
//      (pid evidence), the fixture dir is removed.
//
// Usage (from repo root): node scripts/probe-tailwindless-consumer.mjs
// (browser discovery: CHROME_PATH wins, then the playwright cache's
// chromium-* dirs newest-first, then system installs)

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer as createHttpServer } from 'node:http';
import { createRequire } from 'node:module';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { homedir, tmpdir } from 'node:os';
import { readdirSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const fixtureDir = join(root, '.agents/fixtures/tailwindless-consumer');
const receiptPath = join(root, 'openspec/changes/2026-09-17-tailwindless-site/research/consumer-receipt.json');
const screenshotPath = join(root, 'openspec/changes/2026-09-17-tailwindless-site/research/consumer-separator.png');

const fail = (msg) => {
  console.error(`\n✗ probe-tailwindless-consumer FAILED — ${msg}`);
  process.exitCode = 1;
};
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

// ── browser discovery (the popover-probe contract, verbatim) ─────────
function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const caches = [
    join(homedir(), 'Library/Caches/ms-playwright'),
    process.env.XDG_CACHE_HOME ? join(process.env.XDG_CACHE_HOME, 'ms-playwright') : join(homedir(), '.cache/ms-playwright'),
  ];
  for (const cache of caches) {
    if (!existsSync(cache)) continue;
    const versions = readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().reverse();
    for (const v of versions) {
      for (const name of [
        // the pinned cache layout (chromium-1243): the Testing bundle
        // sits UNDER chrome-mac-arm64/ — the upstream verify script's
        // first candidate misses the intermediate dir and falls
        // through to the SYSTEM Chrome; ours pins the real path first
        'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
        'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
        'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium',
        'chrome-linux64/chrome',
        'chrome-linux/chrome',
      ]) {
        const p = join(cache, v, name);
        if (existsSync(p)) return p;
      }
    }
  }
  const system = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];
  for (const p of system) if (existsSync(p)) return p;
  return null;
}

// ── minimal PNG decode (8-bit RGB/RGBA, non-interlaced) — the pixel
//    assertions' substrate; node:zlib inflates the IDAT stream, the
//    scanline filters (0..4) unfilter per the PNG spec ────────────────
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('probe: not a PNG');
  let pos = 8;
  let width = 0, height = 0, colorType = 0, interlace = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
    if (type === 'IEND') break;
  }
  if (interlace !== 0) throw new Error('probe: interlaced PNG unsupported');
  if (colorType !== 2 && colorType !== 6) throw new Error(`probe: PNG colorType ${colorType} unsupported`);
  const channels = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);
  const bpp = channels; // 8-bit depth: bytes per pixel
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[src++];
    const row = raw.subarray(src, (src += stride));
    const prevBase = (y - 1) * stride;
    const base = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[base + x - bpp] : 0;
      const b = y > 0 ? out[prevBase + x] : 0;
      const c = x >= bpp && y > 0 ? out[prevBase + x - bpp] : 0;
      let v = row[x];
      if (filter === 1) v = (v + a) & 0xff;
      else if (filter === 2) v = (v + b) & 0xff;
      else if (filter === 3) v = (v + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
      }
      out[base + x] = v;
    }
  }
  return { width, height, channels, pixels: out };
}

const pixelOf = (img, x, y) => {
  const i = (y * img.width + x) * img.channels;
  return [img.pixels[i], img.pixels[i + 1], img.pixels[i + 2]];
};

// ── process evidence: the browser launches through
//    launchPersistentContext with a UNIQUE user-data-dir marker — every
//    Chromium process in the tree carries the marker on its command
//    line, so a ps scan keyed on it names exactly OUR processes (this
//    machine runs other playwright sessions; executable names and
//    pipe flags would collide, the per-launch marker cannot) ─────────
let browserMarker = null;
const browserPids = () => {
  if (!browserMarker) return [];
  const out = execFileSync('ps', ['-eo', 'pid=,command='], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  return out
    .split('\n')
    .filter((l) => l.includes(browserMarker))
    .map((l) => l.trim().split(/\s+/)[0]);
};

// ── the fixture: a zero-dependency consumer project ──────────────────

const payloadDir = join(root, 'registry/payload/stylex');
const sourceDirs = {
  separatorCss: join(payloadDir, 'separator/separator.css'),
  separatorJs: join(payloadDir, 'separator/separator.styles.js'),
  tokensCss: join(payloadDir, 'tokens/tokens.css'),
  themeCss: join(root, 'registry/files/theme/jixoai.css'),
};
for (const p of Object.values(sourceDirs)) {
  if (!existsSync(p)) {
    fail(`payload/theme artifact missing: ${p} — run node scripts/gen-stylex-payload.mjs first`);
    process.exit(process.exitCode ?? 1);
  }
}

rmSync(fixtureDir, { recursive: true, force: true });
mkdirSync(join(fixtureDir, 'src/installed/separator'), { recursive: true });
mkdirSync(join(fixtureDir, 'src/installed/tokens'), { recursive: true });
mkdirSync(join(fixtureDir, 'public/theme'), { recursive: true });

// the project owes NOTHING: no dependencies, no devDependencies
const packageJson = { name: 'tailwindless-consumer', private: true, type: 'module' };
writeFileSync(join(fixtureDir, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');

// the theme sheet rides as a RAW asset (public/ + <link>): its
// @fontsource imports are install-time-only concerns of full site
// installs — the browser drops the unresolvable imports and the token
// declarations (what the separator consumes) apply unchanged
cpSync(sourceDirs.themeCss, join(fixtureDir, 'public/theme/jixoai.css'));
cpSync(sourceDirs.tokensCss, join(fixtureDir, 'src/installed/tokens/tokens.css'));
cpSync(sourceDirs.separatorCss, join(fixtureDir, 'src/installed/separator/separator.css'));
cpSync(sourceDirs.separatorJs, join(fixtureDir, 'src/installed/separator/separator.styles.js'));

writeFileSync(
  join(fixtureDir, 'index.html'),
  [
    '<!doctype html><html><head><meta charset="utf-8">',
    '<link rel="stylesheet" href="/theme/jixoai.css">',
    '</head><body style="margin:0">',
    '<div id="app"></div>',
    '<script type="module" src="/src/entry.js"></script>',
    '</body></html>',
    '',
  ].join('\n'),
);

// the consumer page: the payload's own consumption form (F11) — plain
// string constants + css imports, composed as the payload ships them
// (base + variant class strings; size overrides resolve by the
// engine's own emission order, base first)
writeFileSync(
  join(fixtureDir, 'src/entry.js'),
  [
    "import './installed/tokens/tokens.css';",
    "import './installed/separator/separator.css';",
    "import { separatorStyles } from './installed/separator/separator.styles.js';",
    '',
    'const app = document.getElementById("app");',
    'app.style.cssText = "font-family: ui-monospace, monospace; padding: 24px;";',
    '',
    '// panel A — horizontal gradient (to right): the ghost strip over it',
    '// shifts tones; the probe compares the strip against the undisturbed',
    '// backdrop 20px BELOW (same x column, same base color)',
    'const panelA = document.createElement("div");',
    'panelA.style.cssText = "position:relative;width:320px;height:96px;background:linear-gradient(to right,#e8e8e8,#101010)";',
    'const sepH = document.createElement("hr");',
    'sepH.id = "sep-h";',
    'sepH.className = separatorStyles.horizontal;',
    'sepH.style.position = "absolute";',
    'sepH.style.top = "24px";',
    'panelA.appendChild(sepH);',
    'app.appendChild(panelA);',
    '',
    '// panel B — uniform white: the solid escape paints var(--border)',
    'const panelB = document.createElement("div");',
    'panelB.style.cssText = "position:relative;width:320px;height:64px;background:#ffffff;margin-top:24px";',
    'const sepSolid = document.createElement("hr");',
    'sepSolid.id = "sep-solid";',
    'sepSolid.className = separatorStyles.horizontal + " " + separatorStyles.solidHorizontal;',
    'sepSolid.style.position = "absolute";',
    'sepSolid.style.top = "32px";',
    'panelB.appendChild(sepSolid);',
    'app.appendChild(panelB);',
    '',
    '// panel C — vertical gradient (to bottom): the vertical ghost in a',
    '// flex row stretches the cross axis; compare against 20px RIGHT.',
    '// a BARE instance (plain block context) proves the inline-block',
    '// posture — flex children are blockified by spec, so the display',
    '// assertion needs the non-flex context',
    'const panelC = document.createElement("div");',
    'panelC.style.cssText = "width:320px;height:200px;background:linear-gradient(to bottom,#e8e8e8,#101010);margin-top:24px";',
    'const row = document.createElement("div");',
    'row.id = "v-row";',
    'row.style.cssText = "display:flex;align-items:stretch;gap:12px;height:96px";',
    'const colA = document.createElement("span");',
    'colA.textContent = "first";',
    'const sepV = document.createElement("div");',
    'sepV.id = "sep-v";',
    'sepV.className = separatorStyles.vertical;',
    'const colB = document.createElement("span");',
    'colB.textContent = "second";',
    'row.append(colA, sepV, colB);',
    'panelC.appendChild(row);',
    'const bareWrap = document.createElement("div");',
    'bareWrap.style.cssText = "margin-top:24px";',
    'const sepVBare = document.createElement("div");',
    'sepVBare.id = "sep-v-bare";',
    'sepVBare.className = separatorStyles.vertical;',
    'sepVBare.style.height = "48px";',
    'bareWrap.appendChild(sepVBare);',
    'panelC.appendChild(bareWrap);',
    'app.appendChild(panelC);',
    '',
  ].join('\n'),
);

// ── the build: plain vite, zero plugins/config ────────────────────────

const wwwRequire = createRequire(join(root, 'apps/www/package.json'));
const vitePath = wwwRequire.resolve('vite');
const vite = await import(pathToFileURL(vitePath).href);

let browserPid = null;
let serverPort = null;
let browser = null;
let server = null;
const teardown = { browserPid: null, browserGone: null, serverPort: null, serverRefused: null, fixtureDirRemoved: false };
let receipt = null;

try {
  console.log('━━ probe-tailwindless-consumer · build (plain vite, zero engine tooling) ━━━━━━━━━━━');
  await vite.build({ root: fixtureDir, configFile: false, logLevel: 'warn', build: { outDir: 'dist', emptyOutDir: true, target: 'esnext' } });
  const distDir = join(fixtureDir, 'dist');
  const cssAssets = readdirSync(join(distDir, 'assets')).filter((f) => f.endsWith('.css'));
  check('the zero-tooling consumer builds green', cssAssets.length > 0, cssAssets.join(', '));

  const distCss = cssAssets.map((f) => readFileSync(join(distDir, 'assets', f), 'utf8')).join('\n');
  const { separatorStyles } = await import(pathToFileURL(sourceDirs.separatorJs).href);
  const firstClass = separatorStyles.horizontal.split(' ')[0];
  check('the built css carries the separator atom rules', distCss.includes(`.${firstClass}`), `.${firstClass}`);
  check('the built css carries the ghost rule', /backdrop-filter:\s*contrast\((?:\.|0\.)?5\)/.test(distCss));
  const deps = { ...JSON.parse(readFileSync(join(fixtureDir, 'package.json'), 'utf8')) };
  check(
    'consumer package.json owes zero dependencies (no tailwindcss, no @stylexjs/*)',
    Object.keys(deps.dependencies ?? {}).length === 0 && Object.keys(deps.devDependencies ?? {}).length === 0,
    JSON.stringify(deps),
  );

  // ── serve the built artifact (the static-deploy shape) ──────────────
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
  server = createHttpServer((req, res) => {
    const url = (req.url ?? '/').split('?')[0];
    let file = url === '/' ? '/index.html' : url;
    const candidate = join(distDir, file);
    if (!candidate.startsWith(distDir) || !existsSync(candidate)) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': types[extname(candidate)] ?? 'application/octet-stream' });
    res.end(readFileSync(candidate));
  });
  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
  serverPort = server.address().port;
  const base = `http://127.0.0.1:${serverPort}`;

  // ── the browser arm: computed geometry + programmatic pixels ───────
  console.log('━━ probe-tailwindless-consumer · render (real Chromium, pixel + computed assertions) ━━━━━━━━━━━');
  const CHROME = findChrome();
  if (!CHROME) {
    fail('no Chromium found (CHROME_PATH, playwright cache, system installs)');
    process.exit(1);
  }
  browserMarker = `jixoai-tailwindless-probe-${process.pid}`;
  browser = await chromium.launchPersistentContext(join(tmpdir(), browserMarker), {
    executablePath: CHROME,
    headless: true,
    viewport: { width: 480, height: 720 },
    deviceScaleFactor: 2,
  });
  const launchedPids = browserPids();
  browserPid = launchedPids.length > 0 ? launchedPids.join(',') : null;
  teardown.browserPid = browserPid;
  teardown.serverPort = serverPort;

  const page = browser.pages()[0] ?? (await browser.newPage());
  await page.goto(`${base}/`);
  await page.waitForLoadState('load');

  const computed = await page.evaluate(() => {
    const cs = (id) => getComputedStyle(document.getElementById(id));
    const h = cs('sep-h'), v = cs('sep-v'), vb = cs('sep-v-bare'), s = cs('sep-solid');
    const box = (id) => {
      const r = document.getElementById(id).getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    return {
      horizontal: { backdropFilter: h.backdropFilter, margin: h.margin, borderWidth: h.borderWidth, box: box('sep-h') },
      vertical: { display: vb.display, backdropFilter: v.backdropFilter, box: box('sep-v'), rowHeight: box('v-row').height },
      solid: { backgroundColor: s.backgroundColor, backdropFilter: s.backdropFilter, box: box('sep-solid') },
    };
  });

  check('horizontal: the ghost is live (backdrop-filter contrast(0.5))', /contrast\((?:\.|0\.)?5\)/.test(computed.horizontal.backdropFilter), computed.horizontal.backdropFilter);
  check('horizontal: the hr reset is atomic (margin 0, border 0)', computed.horizontal.margin === '0px' && computed.horizontal.borderWidth === '0px', `margin ${computed.horizontal.margin} · border ${computed.horizontal.borderWidth}`);
  check('horizontal: full panel width, 1px lane', Math.round(computed.horizontal.box.width) === 320 && computed.horizontal.box.height === 1, `${computed.horizontal.box.width}×${computed.horizontal.box.height}`);
  check('vertical: the inline-block posture (bare, non-flex context)', computed.vertical.display === 'inline-block', computed.vertical.display);
  check('vertical: stretches the row cross axis at 1px width', Math.round(computed.vertical.box.height) === Math.round(computed.vertical.rowHeight) && computed.vertical.box.width === 1, `${computed.vertical.box.width}×${Math.round(computed.vertical.box.height)} (row ${Math.round(computed.vertical.rowHeight)})`);
  check('vertical: the ghost is live', /contrast\((?:\.|0\.)?5\)/.test(computed.vertical.backdropFilter), computed.vertical.backdropFilter);
  check('solid: paints the --border token (not transparent, ghost off)', computed.solid.backgroundColor !== 'rgba(0, 0, 0, 0)' && computed.solid.backgroundColor !== 'transparent' && computed.solid.backdropFilter === 'none', `${computed.solid.backgroundColor} · filter ${computed.solid.backdropFilter}`);

  // pixel receipts — decode the PNG ONCE, crop by element boxes
  const shot = await page.screenshot({ fullPage: true });
  writeFileSync(screenshotPath, shot);
  const img = decodePng(shot);
  const px = (el, dx, dy) => {
    const x = Math.round((computed[el].box.x + dx) * 2);
    const y = Math.round((computed[el].box.y + dy) * 2);
    return pixelOf(img, x, y);
  };
  const distance = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);

  // horizontal ghost: strip(x) vs undisturbed backdrop 20px below (same x)
  let paintedH = 0, sampledH = 0;
  for (let x = 4; x < 316; x += 2) {
    sampledH++;
    if (distance(px('horizontal', x, 0), px('horizontal', x, 20)) > 12) paintedH++;
  }
  const ratioH = paintedH / sampledH;
  check('horizontal: the ghost PAINTS (pixel deltas vs the undisturbed backdrop)', ratioH > 0.3, `${paintedH}/${sampledH} columns differ (${(ratioH * 100).toFixed(0)}%)`);

  // vertical ghost: strip(y) vs undisturbed backdrop 20px right (same y)
  let paintedV = 0, sampledV = 0;
  const vBox = computed.vertical.box;
  for (let y = 2; y < vBox.height - 2; y += 2) {
    sampledV++;
    const onStrip = [Math.round((vBox.x) * 2), Math.round((vBox.y + y) * 2)];
    const beside = [Math.round((vBox.x + 20) * 2), Math.round((vBox.y + y) * 2)];
    if (distance(pixelOf(img, onStrip[0], onStrip[1]), pixelOf(img, beside[0], beside[1])) > 12) paintedV++;
  }
  const ratioV = paintedV / sampledV;
  check('vertical: the ghost PAINTS', ratioV > 0.3, `${paintedV}/${sampledV} rows differ (${(ratioV * 100).toFixed(0)}%)`);

  // solid: uniform white panel — the strip must differ from white
  let paintedS = 0, sampledS = 0;
  for (let x = 4; x < 316; x += 2) {
    sampledS++;
    const p = px('solid', x, 0);
    if (Math.abs(p[0] - 255) + Math.abs(p[1] - 255) + Math.abs(p[2] - 255) > 9) paintedS++;
  }
  const ratioS = paintedS / sampledS;
  check('solid: the --border fill PAINTS over white', ratioS > 0.8, `${paintedS}/${sampledS} columns differ (${(ratioS * 100).toFixed(0)}%)`);

  // non-trivial image guard (the black-image law): the page screenshot
  // must carry real variance across the three panels
  let minL = 255, maxL = 0;
  for (let i = 0; i < img.pixels.length; i += img.channels * 97) {
    const l = (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2]) / 3;
    if (l < minL) minL = l;
    if (l > maxL) maxL = l;
  }
  check('the screenshot is non-trivial (gradient panels present, not a black frame)', maxL - minL > 150, `luma span ${minL.toFixed(0)}..${maxL.toFixed(0)}`);

  // ── the receipt ──────────────────────────────────────────────────────
  receipt = {
    what: 'clean consumer receipt — tailwindless-site P0 task 2.3 (separator, the first migrated registry family)',
    generatedAt: new Date().toISOString(),
    fixture: {
      dir: fixtureDir,
      packageJson: deps,
      vite: { version: vite.version ?? 'unknown', resolvedFrom: 'apps/www/node_modules (the spot-compile precedent — the CONSUMER project itself owes no tooling)' },
      installed: {
        'public/theme/jixoai.css': 'the jixoai-theme item sheet (raw asset — tokens live here)',
        'src/installed/tokens/tokens.css': 'the payload token projection (registry/payload/stylex/tokens/)',
        'src/installed/separator/separator.css': 'the payload item css (registry/payload/stylex/separator/)',
        'src/installed/separator/separator.styles.js': 'the payload class module — plain string constants (F11)',
      },
      zeroStyleEngineImports: true,
    },
    assertions: Object.fromEntries(results.map((r) => [r.name, { ok: r.ok, detail: r.detail }])),
    computed,
    pixels: {
      horizontalGhostColumnRatio: ratioH,
      verticalGhostRowRatio: ratioV,
      solidFillColumnRatio: ratioS,
    },
    screenshot: { path: screenshotPath, bytes: shot.length },
    teardown,
  };
  console.log(`\n  screenshot: ${screenshotPath} (${shot.length} bytes)`);
} finally {
  // ── self-convergence: every process exits, the fixture goes away ────
  if (browser) {
    await browser.close().catch(() => {});
    // every pid the launch scan found must be GONE — the marker scan
    // returning empty is playwright's tree-exit receipt
    const survivors = browserPids();
    teardown.browserGone = browserPid == null ? null : survivors.length === 0;
    if (browserMarker) rmSync(join(tmpdir(), browserMarker), { recursive: true, force: true });
  }
  if (server) {
    await new Promise((resolveClose) => server.close(resolveClose));
    if (serverPort != null) {
      try {
        await fetch(`http://127.0.0.1:${serverPort}/`);
        teardown.serverRefused = false;
      } catch {
        teardown.serverRefused = true; // ECONNREFUSED — the port is free
      }
    }
  }
  rmSync(fixtureDir, { recursive: true, force: true });
  teardown.fixtureDirRemoved = !existsSync(fixtureDir);
  console.log(`  teardown: browser pid ${teardown.browserPid} gone=${teardown.browserGone} · server port ${teardown.serverPort} refused=${teardown.serverRefused} · fixture removed=${teardown.fixtureDirRemoved}`);
  // the receipt lands ONLY with the teardown evidence in it (written
  // after the finally block collected it — an earlier write would
  // freeze stale nulls)
  if (receipt) {
    writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n');
    console.log(`  receipt: ${receiptPath}`);
  }
}

const failed = results.filter((r) => !r.ok);
console.log(failed.length === 0 ? '\n✓ probe-tailwindless-consumer GREEN — the clean consumer receipt holds' : `\n✗ probe-tailwindless-consumer FAILED — ${failed.length} failure(s)`);
process.exit(failed.length === 0 ? 0 : 1);
