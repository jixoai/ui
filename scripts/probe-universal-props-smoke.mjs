#!/usr/bin/env node
/**
 * universal-props ENGINE SMOKE (explicit-props W2 gate, task 2.5's
 * engine face): a real Chrome page where a STAMPED query flips a var
 * at media AND container boundaries, live, through the kernel engine's
 * reactive chain (matchMedia listeners + ResizeObserver ticks + a
 * consumer $derived re-resolving in the same frame).
 *
 * The harness compiles the REAL artifacts — no fixture copies:
 *   · apps/www/src/lib/universal-props-query.svelte.ts via svelte's
 *     compileModule (runes preserved, client runtime)
 *   · a 12-line App.svelte via svelte.compile — the W3 family wiring
 *     in miniature: $derived(resolveQueryLane(query(...), host)) +
 *     $effect stamping the §11 carrier var, exactly the slot path
 *   · the GENERATED universal-props.css inlined into the page so
 *     computed font-size resolves through --jx-size-* (the alias
 *     var-indirection, §12)
 *
 * Boundaries asserted (ladder: @sm 24rem · sm 40rem · lg 64rem;
 * base 'large'):
 *   500×800 viewport, 300px container → base large → 18px
 *   container 300→500px (≥384px)      → @sm medium → 16px
 *   viewport 500→700px (≥640px)       → sm small   → 14px (wider key overrides)
 *   viewport 700→1100px (≥1024px)     → lg large   → 18px
 *
 * Usage: node scripts/probe-universal-props-smoke.mjs
 * (CHROME_PATH overrides the Chrome executable; the server is killed
 * and every PID listed at exit.)
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import svelteCompiler from '../apps/www/node_modules/svelte/compiler/index.js';
const { compile, compileModule } = svelteCompiler;

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const enginePath = join(root, 'apps/www/src/lib/universal-props-query.svelte.ts');
const cssPath = join(root, 'apps/www/src/lib/universal-props.css');
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const started = [];
const die = (msg) => {
  console.error(`[smoke] FAIL: ${msg}`);
  for (const fn of teardown) void fn();
  process.exit(1);
};
const teardown = [];

// bare-specifier vendoring shared by every compiled/served module —
// the shipped svelte runtime graph is source-shaped (src/ + bare
// deps: esm-env, clsx, svelte/<subpath>); this server maps the whole
// class onto /vendor/**, with internal/client's dir entry gaining
// index.js and the package root mapping to the browser entry
const vendorize = (code) =>
  code
    .replaceAll("'esm-env'", "'/vendor/esm-env.js'")
    .replaceAll("'clsx'", "'/vendor/clsx.mjs'")
    .replaceAll("'svelte/internal/client'", "'/vendor/svelte/internal/client/index.js'")
    .replaceAll("from 'svelte'", "from '/vendor/svelte/index-client.js'")
    .replace(/'svelte\/([a-z-/]+)'/g, "'/vendor/svelte/$1.js'")
    .replaceAll("'#client/constants'", "'/vendor/svelte/internal/client/constants.js'");

// ── compile the real artifacts ────────────────────────────────────
const engineSrc = await readFile(enginePath, 'utf8');
// compileModule takes RUNES-JS only (TS is the vite-svelte
// preprocessor's job) — strip types with the repo's own typescript,
// then compile the runes
const { transpileModule } = await import('typescript');
const engineJs = transpileModule(engineSrc, {
  compilerOptions: { target: 99, module: 99 },
}).outputText;
const engineOut = vendorize(compileModule(engineJs, { generate: 'client' }).js.code);

const appSrc = `
<script>
  import { resolveQueryLane, watchContainer, query } from '/engine.js';
  let host;
  const sizeQuery = query({ '@sm': 'medium', sm: 'small', lg: 'large' }, 'large');
  const lane = $derived(resolveQueryLane(sizeQuery, host));
  $effect(() => {
    if (!host) return;
    const value = typeof lane === 'number' ? lane + 'px' : 'var(--jx-size-' + lane + ')';
    host.style.setProperty('--jx-size-effective', value);
  });
  // the family wiring's §11 container duty in miniature: watch the
  // qualifying ancestor so a container resize bumps the engine's
  // reactivity tick and the $derived above re-resolves in-frame
  $effect(() => {
    const container = host?.parentElement;
    return container ? watchContainer(container) : undefined;
  });
</script>

<div bind:this={host} style="font-size: var(--jx-size-effective, 1rem)">smoke</div>
`;
const appOut = vendorize(compile(appSrc, { generate: 'client', name: 'SmokeApp' }).js.code);

const generatedCss = await readFile(cssPath, 'utf8');

// ── the server ────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  try {
    if (req.url === '/' || req.url === '/index.html') {
      res.setHeader('content-type', 'text/html');
      res.end(`<!doctype html><meta charset="utf-8">
<style>${generatedCss}</style>
<div id="card" style="container-type: inline-size; container-name: card; width: 300px; padding: 8px; border: 1px solid #888">
  <div id="seat"></div>
</div>
<script type="module">
  import { mount } from '/vendor/svelte/index-client.js';
  import SmokeApp from '/app-component.js';
  mount(SmokeApp, { target: document.getElementById('seat') });
  window.__ready = true;
</script>`);
      return;
    }
    if (req.url === '/engine.js') {
      res.setHeader('content-type', 'text/javascript');
      res.end(engineOut);
      return;
    }
    if (req.url === '/app-component.js') {
      res.setHeader('content-type', 'text/javascript');
      res.end(appOut);
      return;
    }
    if (req.url === '/vendor/esm-env.js') {
      // svelte's runtime reads its environment flags from esm-env —
      // the browser+development triple, verbatim
      res.setHeader('content-type', 'text/javascript');
      res.end('export const DEV = true; export const BROWSER = true; export const PROD = false; export const NODE = false;');
      return;
    }
    if (req.url === '/vendor/clsx.mjs') {
      // svelte's shipped runtime sources import clsx (attributes.js)
      res.setHeader('content-type', 'text/javascript');
      res.end(await readFile(join(root, 'apps/www/node_modules/clsx/dist/clsx.mjs'), 'utf8'));
      return;
    }
    if (req.url.startsWith('/vendor/svelte/')) {
      const rel = req.url.slice('/vendor/svelte/'.length);
      const file = join(root, 'apps/www/node_modules/svelte/src', rel);
      const code = vendorize(await readFile(file, 'utf8'));
      res.setHeader('content-type', 'text/javascript');
      res.end(code);
      return;
    }
    res.statusCode = 404;
    res.end('not found');
  } catch (err) {
    res.statusCode = 500;
    res.end(String(err));
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
started.push(`http-server pid=${process.pid} port=${port}`);

// ── the browser ───────────────────────────────────────────────────
const browser = await chromium.launch({ executablePath: CHROME, headless: true }).catch((err) => {
  die(`chrome launch failed (${err.message}) — set CHROME_PATH`);
});
const page = await browser.newPage({ viewport: { width: 500, height: 800 } });
page.on('pageerror', (err) => die(`page error: ${err.message}`));
page.on('requestfailed', (req) => die(`request failed: ${req.url()} (${req.failure()?.errorText})`));
const consoleErrors = [];
page.on('response', (res) => {
  if (res.status() >= 400) consoleErrors.push(`http ${res.status()} for ${res.url()}`);
});
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(`console: ${msg.text()}`);
});
page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
await page.goto(`http://127.0.0.1:${port}/`);
try {
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 15000 });
} catch {
  die(`__ready never fired; browser errors: ${consoleErrors.join(' | ') || '(none)'}`);
}
await page.waitForFunction(() => {
  const host = document.querySelector('#seat > div');
  return host && host.style.getPropertyValue('--jx-size-effective') !== '';
});

const fontSize = () =>
  page.evaluate(() => getComputedStyle(document.querySelector('#seat > div')).fontSize);
const expectFont = async (px, label) => {
  const got = await fontSize();
  if (got !== px) die(`${label}: expected font-size ${px}, got ${got}`);
  console.log(`[smoke] ✓ ${label}: font-size ${got}`);
};

// the ladder: @sm 24rem(384px) · sm 40rem(640px) · lg 64rem(1024px); base large
await expectFont('18px', '500px viewport · 300px container → base large');

await page.evaluate(() => { document.getElementById('card').style.width = '500px'; });
await page.waitForFunction(() => getComputedStyle(document.querySelector('#seat > div')).fontSize === '16px');
await expectFont('16px', 'container 300→500px (≥384px) → @sm medium (the ResizeObserver tick re-derived)');

await page.setViewportSize({ width: 700, height: 800 });
await page.waitForFunction(() => getComputedStyle(document.querySelector('#seat > div')).fontSize === '14px');
await expectFont('14px', 'viewport 500→700px (≥640px) → sm small (the WIDER key overrides the container)');

await page.setViewportSize({ width: 1100, height: 800 });
await page.waitForFunction(() => getComputedStyle(document.querySelector('#seat > div')).fontSize === '18px');
await expectFont('18px', 'viewport 700→1100px (≥1024px) → lg large');

// ── teardown (every process accounted for) ────────────────────────
await browser.close();
await new Promise((resolve) => server.close(resolve));
console.log('[smoke] GREEN: media + container boundaries flip the stamped var through the real engine chain');
console.log(`[smoke] processes started/killed: ${started.join('; ')}; chromium (playwright-launched, closed with browser.close())`);
process.exit(0);
