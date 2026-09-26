#!/usr/bin/env node
// verify:shadcn-add-universal — the §12 clean-consumer receipt
// (explicit-props W5 task 5.4, design §12 + the registry spec's
// three-way receipt, 2026-09-21).
//
// WHAT RAN (fidelity, documented per the task text): a REAL
// `shadcn add @jixoai/heading` — not a payload mock — over the SAME
// input contract verify:shadcn-add uses: this gate rebuilds the
// public/r payloads itself (shadcn build → gen-stylex-payload
// --publish → registry-stylex-swap; 1.4s measured), serves them from
// a local http server with the cached neutral palette (no
// ui.shadcn.com dependency), materializes an EMPTY Vite+Svelte
// consumer, and runs the public CLI against it. The npm registry is
// the only network surface (the scratch install), same as every
// standing consumer gate.
//
// The THREE-WAY RECEIPT, verbatim per the registry spec (Codex r4 B8:
// computed style resolves vars, it never preserves authored var()
// text — each layer proves what it can):
//   (1) FILESYSTEM — the add lands the kernel lib item's files at the
//       @lib targets (universal-props.schema.ts + universal-props.css,
//       pulled transitively through @jixoai/defaults →
//       @jixoai/universal-props) beside the heading family at @ui;
//   (2) TEXTUAL + COMPUTED — the landed css DEFINES --jx-size-large
//       (the §12 var indirection: named steps never inline values at
//       use sites — the landed defaults machinery stamps
//       var(--jx-size-<alias>)), and the RENDERED element's computed
//       font-size equals the alias's defined px (real Chrome over the
//       built dist);
//   (3) THE OVERRIDE — a consumer css override of --jx-size-large
//       FLIPS the computed px with ZERO js movement (the second build
//       re-emits byte-identical js assets; only css moves): a remap
//       is a var override, PURE CSS, no resolver runtime (the
//       consumer's package.json owes no @jixoai/* runtime, no
//       @stylexjs/*, no vite plugin).
//
// Usage: node scripts/verify-shadcn-add-universal.mjs  (from repo root)
// CHROME_PATH overrides the Chrome executable (the smoke-probe
// convention). Every long-lived child is reaped via ChildRegistry;
// PIDs are listed at exit.

import { spawn, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ChildRegistry } from './lib/child-lifecycle.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const scratch = join(root, '.agents/fixtures/2026-09-21-universal-clean-consumer');
const registryRoot = join(scratch, 'registry');
const registryDir = join(registryRoot, 'r');
const consumerDir = join(scratch, 'consumer');
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const CHILDREN = new ChildRegistry();
const started = [];
const die = (msg) => { console.error(`[universal-receipt] ✗ ${msg}`); finish(1); };
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};
const source = (p) => readFileSync(join(root, p), 'utf8');

function finish(code) {
  for (const fn of teardown) void fn();
  void CHILDREN.reap({ graceMs: 2000 });
  const leftover = CHILDREN.aliveEntries().map((c) => `${c.pid} (${c.command})`);
  console.log(`[universal-receipt] processes started: ${started.join(', ') || 'none'} — reaped via ChildRegistry${leftover.length ? `; STILL ALIVE: ${leftover.join(', ')}` : ' (none left alive)'}`);
  const failed = results.filter((r) => !r.ok).length;
  const ok = (code ?? (failed === 0 ? 0 : 1)) === 0 && failed === 0;
  console.log(ok ? '\nuniversal clean-consumer receipt: ALL GREEN' : `\nuniversal clean-consumer receipt: FAILED (${failed} assertion failure(s))`);
  process.exit(ok ? 0 : 1);
}
const teardown = [];

// ── 0. rebuild the payload input (the same contract verify:shadcn-add
//      consumes — the gate produces its own input; nothing stale) ──
console.log('rebuilding public/r payloads (shadcn build → stylex payload → registry swap)…');
{
  const t0 = Date.now();
  const steps = [
    ['shadcn build', ['npx', ['shadcn', 'build']]],
    ['gen-stylex-payload --publish public', [process.execPath, ['scripts/gen-stylex-payload.mjs', '--publish', 'public']]],
  ];
  for (const [label, [cmd, args]] of steps) {
    const r = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', stdio: 'pipe' });
    if (r.status !== 0) die(`${label} failed:\n${r.stdout}\n${r.stderr}`);
  }
  // the swap is async
  const swap = await import('./lib/registry-stylex-swap.mjs');
  const { swapped } = await swap.swapRegistryPayloads(root, 'public/r');
  if (swapped.length === 0) die('registry stylex swap touched ZERO payloads');
  console.log(`  payloads rebuilt in ${((Date.now() - t0) / 1000).toFixed(1)}s (${swapped.length} swapped)`);
}
const publicR = join(root, 'public/r');
for (const need of ['heading.json', 'defaults.json', 'universal-props.json', 'utils.json', 'jixoai-theme.json']) {
  if (!existsSync(join(publicR, need))) die(`payload ${need} missing after rebuild`);
}

// ── 1. scratch registry + local server ────────────────────────────
rmSync(scratch, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
mkdirSync(join(registryDir, 'colors'), { recursive: true });
cpSync(publicR, registryDir, { recursive: true });
// the neutral palette cache (the verify-shadcn-add convention: cached
// in gitignored .agents/, fetched once; never a live ui.shadcn.com dep)
const neutralCache = join(root, '.agents/fixtures/colors-neutral.cache.json');
if (!existsSync(neutralCache)) {
  const neutral = spawnSync('curl', ['-s', '-m', '15', 'https://ui.shadcn.com/r/colors/neutral.json'], { encoding: 'utf8' });
  if (neutral.status !== 0 || !neutral.stdout.trim().startsWith('{')) die('cannot cache r/colors/neutral.json (offline?)');
  mkdirSync(dirname(neutralCache), { recursive: true });
  writeFileSync(neutralCache, neutral.stdout);
}
cpSync(neutralCache, join(registryDir, 'colors', 'neutral.json'));

const PORT = await new Promise((res, rej) => {
  const srv = createServer();
  srv.on('error', rej);
  srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => res(p)); });
});
const BASE = `http://127.0.0.1:${PORT}/r`;
// python's http.server (the standing convention: the shadcn CLI's
// undici fetch times out against bare node keep-alive servers)
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', registryRoot], { stdio: 'ignore', detached: true });
CHILDREN.add(server.pid, 'python3 http.server (scratch registry)');
started.push(server.pid);
teardown.push(() => { try { process.kill(-server.pid, 'SIGTERM'); } catch { /* already gone */ } });
{
  let up = false;
  for (let i = 0; i < 50; i++) {
    const probe = spawnSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', `${BASE}/heading.json`], { encoding: 'utf8' });
    if (probe.stdout.trim() === '200') { up = true; break; }
    await new Promise((r) => setTimeout(r, 200));
  }
  if (!up) die(`local registry server did not come up on ${BASE}`);
}

// ── 2. the EMPTY consumer (the verify-shadcn-add template shape) ──
const versions = JSON.parse(source('apps/www/package.json')).devDependencies;
mkdirSync(join(consumerDir, 'src/lib/ui'), { recursive: true });
mkdirSync(join(consumerDir, 'public'), { recursive: true });
const write = (p, c) => writeFileSync(join(consumerDir, p), c);
write('package.json', JSON.stringify({
  name: 'universal-clean-consumer',
  private: true,
  type: 'module',
  scripts: { build: 'vite build' },
  devDependencies: {
    svelte: versions.svelte,
    '@sveltejs/vite-plugin-svelte': versions['@sveltejs/vite-plugin-svelte'],
    vite: versions.vite,
    typescript: versions.typescript,
    shadcn: '4.19.0',
  },
}, null, 2));
write('components.json', JSON.stringify({
  $schema: 'https://ui.shadcn.com/schema.json',
  style: 'new-york', rsc: false, tsx: true,
  tailwind: { config: '', css: 'src/app.css', baseColor: 'neutral', cssVariables: true, prefix: '' },
  iconLibrary: 'lucide',
  aliases: { components: '$lib', utils: '$lib/utils', ui: '$lib/ui', lib: '$lib', hooks: '$lib/hooks' },
  registries: { '@jixoai': `${BASE}/{name}.json` },
}, null, 2));
write('vite.config.ts', `import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [svelte()], // ZERO engine, ZERO jixoai plugin: pure css resolution
  resolve: { alias: { $lib: fileURLToPath(new URL('./src/lib', import.meta.url)) } },
  build: { target: 'esnext' },
});
`);
write('tsconfig.json', JSON.stringify({
  compilerOptions: {
    target: 'esnext', module: 'esnext', moduleResolution: 'bundler',
    verbatimModuleSyntax: true, strict: true, noEmit: true,
    paths: { '$lib': ['./src/lib'], '$lib/*': ['./src/lib/*'] },
    types: ['svelte', 'vite/client'],
  },
  include: ['src/**/*.ts', 'src/**/*.svelte', 'vite.config.ts'],
}, null, 2));
write('svelte.config.js', `import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
export default { preprocess: vitePreprocess() };
`);
// the consumer's css: the kernel ladder + the theme (both landed by the
// add at @lib) — a named step resolves through the LADDER file
write('src/app.css', `@import './lib/universal-props.css';
@import './lib/jixoai.css';
`);
write('index.html', `<!doctype html>
<html><head><meta charset="utf-8" /><title>universal clean consumer</title></head>
<body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>
`);
write('src/main.ts', `import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';
mount(App, { target: document.getElementById('app')! });
`);
write('src/App.svelte', `<script lang="ts">
  import Heading from '$lib/ui/heading';
</script>

<main style="padding: 24px">
  <Heading level={1} size="large">Receipt</Heading>
</main>
`);

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { cwd: consumerDir, encoding: 'utf8', stdio: 'pipe', ...opts });
  if (r.status !== 0) {
    console.error(`command failed: ${cmd} ${args.join(' ')}\n${r.stdout}\n${r.stderr}`);
    die(`${cmd} ${args[0] ?? ''} failed (exit ${r.status})`);
  }
  return r;
};

console.log('npm install (consumer base toolchain)…');
run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error']);

console.log(`shadcn add @jixoai/heading (public CLI against ${BASE})…`);
run('npx', ['shadcn', 'add', '@jixoai/heading', '--yes', '--overwrite'], {
  env: { ...process.env, REGISTRY_URL: BASE, NO_PROXY: 'localhost,127.0.0.1', no_proxy: 'localhost,127.0.0.1' },
});

// ── (1) the FILESYSTEM layer ──────────────────────────────────────
check('(1) universal-props.css landed at @lib', existsSync(join(consumerDir, 'src/lib/universal-props.css')));
check('(1) universal-props.schema.ts landed at @lib', existsSync(join(consumerDir, 'src/lib/universal-props.schema.ts')));
check('(1) defaults.svelte.ts landed at @lib (the slot seam)', existsSync(join(consumerDir, 'src/lib/defaults.svelte.ts')));
check('(1) the heading family landed at @ui (svelte + defaults + barrel)',
  existsSync(join(consumerDir, 'src/lib/ui/heading/heading.svelte'))
  && existsSync(join(consumerDir, 'src/lib/ui/heading/heading-defaults.svelte.ts'))
  && existsSync(join(consumerDir, 'src/lib/ui/heading/index.ts')));
check('(1) the theme sheet landed at @lib/jixoai.css', existsSync(join(consumerDir, 'src/lib/jixoai.css')));

// ── (2) the TEXTUAL layer (the §12 var indirection) ───────────────
const ladderCss = readFileSync(join(consumerDir, 'src/lib/universal-props.css'), 'utf8');
const largeDef = /^\s*--jx-size-large:\s*([^;]+);/m.exec(ladderCss);
check('(2) the landed css DEFINES --jx-size-large', !!largeDef, largeDef?.[1]?.trim() ?? 'missing');
const aliasPx = parseFloat(largeDef?.[1] ?? '');
const defaultsSrc = readFileSync(join(consumerDir, 'src/lib/defaults.svelte.ts'), 'utf8');
check('(2) the landed machinery resolves named steps through var(--jx-size-<alias>) — never inline px at the stamp',
  defaultsSrc.includes('var(--jx-size-${size})') && !/--jx-size-effective:\s*18px/.test(defaultsSrc));

// ── build + serve + real-Chrome computed checks ───────────────────
console.log('vite build (first: the alias px)…');
run('npx', ['vite', 'build']);
const assetNames = () => readdirSync(join(consumerDir, 'dist/assets')).sort();
// vite's chunk FILENAME hash rides dependency metadata (the css chunk's
// own hash), so a css-only change renames the js file while its BYTES
// stand still — the zero-movement receipt compares CONTENT
const contentDigest = (suffix) => {
  const names = assetNames().filter((n) => n.endsWith(suffix));
  return names.map((n) => createHash('sha256').update(readFileSync(join(consumerDir, 'dist/assets', n))).digest('hex')).sort();
};
const jsBefore = contentDigest('.js');
const cssBefore = assetNames().filter((n) => n.endsWith('.css'));

const distServer = spawn('python3', ['-m', 'http.server', String(PORT + 1), '--bind', '127.0.0.1', '--directory', join(consumerDir, 'dist')], { stdio: 'ignore', detached: true });
CHILDREN.add(distServer.pid, 'python3 http.server (dist)');
started.push(distServer.pid);
teardown.push(() => { try { process.kill(-distServer.pid, 'SIGTERM'); } catch { /* already gone */ } });
const DIST = `http://127.0.0.1:${PORT + 1}`;
{
  let up = false;
  for (let i = 0; i < 50; i++) {
    const probe = spawnSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', `${DIST}/`], { encoding: 'utf8' });
    if (probe.stdout.trim() === '200') { up = true; break; }
    await new Promise((r) => setTimeout(r, 200));
  }
  if (!up) die('dist server did not come up');
}

if (!existsSync(CHROME)) die(`Chrome not found at ${CHROME} (set CHROME_PATH)`);
const { chromium } = await import('playwright-core');
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
teardown.push(() => { void browser.close(); });

const computedFontSize = async () => {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  try {
    await page.goto(`${DIST}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts?.ready);
    return await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? getComputedStyle(h1).fontSize : null;
    });
  } finally {
    await page.close();
  }
};

const before = await computedFontSize();
check(`(2) computed font-size = the alias's defined px (${aliasPx}px)`, before === `${aliasPx}px`, `computed ${before}`);

// ── (3) the OVERRIDE layer (pure css, no resolver runtime) ────────
const OVERRIDE_PX = aliasPx + 6; // 18 → 24: unambiguous flip
write('src/app.css', `@import './lib/universal-props.css';
@import './lib/jixoai.css';

/* the consumer's remap: an alias override is a VAR override (§12) */
:root {
  --jx-size-large: ${OVERRIDE_PX}px;
}
`);
console.log('vite build (second: ONLY the consumer css changed)…');
run('npx', ['vite', 'build']);
const jsAfter = contentDigest('.js');
const cssAfter = assetNames().filter((n) => n.endsWith('.css'));
check('(3) the override build re-emitted byte-identical JS content (zero js movement — filenames rehash, bytes do not)',
  JSON.stringify(jsAfter) === JSON.stringify(jsBefore), `${jsBefore.length} js asset(s), ${jsBefore[0]?.slice(0, 8) ?? '-'}… digest-set unchanged`);
const cssMoved = cssBefore.length !== cssAfter.length || cssBefore.some((n, i) => n !== cssAfter[i]);
check('(3) the css asset moved (the flip rode the cascade, not code)', cssMoved, `${cssBefore.join(',')} → ${cssAfter.join(',')}`);

const after = await computedFontSize();
check(`(3) the --jx-size-large override FLIPPED the computed px (${aliasPx} → ${OVERRIDE_PX})`, after === `${OVERRIDE_PX}px`, `computed ${after}`);

// no resolver runtime: the consumer's package tree owes nothing beyond
// the base toolchain + clsx (the utils item's declared npm dep)
const pkg = JSON.parse(readFileSync(join(consumerDir, 'package.json'), 'utf8'));
const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
const resolverDeps = Object.keys(allDeps).filter((d) => d.startsWith('@jixoai/') || d.startsWith('@stylexjs/'));
check('(3) ZERO resolver-runtime deps in the consumer package.json', resolverDeps.length === 0, resolverDeps.join(', ') || 'clean');

finish();
