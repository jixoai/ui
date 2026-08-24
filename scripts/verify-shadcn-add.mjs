#!/usr/bin/env node
// Real-consumer `shadcn add` fixtures (tw4-css-modularization P0.2, 2026-08-24).
//
// Proves the FOLDER-SHAPED install contract with a real consumer —
// not inferred from `shadcn build` output (r1 B3 / r4 B12 rulings):
//
//   fixture A — accordion (multi-file item):
//     files land under src/lib/ui/accordion/**, the index.ts barrel
//     resolves via `$lib/ui/accordion` (default = canonical main),
//     relative imports compile, the consumer's vite build passes.
//
//   fixture B — toast (non-identical main + item-shipped canonical lib):
//     toast-viewport.svelte is the canonical main (folder ui/toast/),
//     toast-store.ts lands EXACTLY once at its canonical `@lib` root.
//
// Staged input (r6 ruling): a TEMP folder-shaped registry generated
// here — the current flat public/r payloads are NOT the input. The
// temp payloads embed the exact registry/files sources + generated
// index.ts barrels, served over a local HTTP registry.
//
// Usage (from repo root):
//   node scripts/verify-shadcn-add.mjs
// Scratch lives under .agents/fixtures/ (gitignored), wiped per run.

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const scratch = join(root, '.agents/fixtures/2026-08-24-tw4-p0-consumer');
const registryDir = join(scratch, 'registry', 'r');
const consumerDir = join(scratch, 'consumer');
const PORT = 5399;
const BASE = `http://127.0.0.1:${PORT}/r`;

const die = (msg) => { console.error(`[verify-shadcn-add] ${msg}`); process.exit(1); };
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const source = (p) => readFileSync(join(root, p), 'utf8');

// ── 1. temp folder-shaped registry ─────────────────────────────────
rmSync(scratch, { recursive: true, force: true });
mkdirSync(registryDir, { recursive: true });

const barrel = (main, named = []) =>
  [`export { default } from './${main}';`, ...named.map(([n, f]) => `export { default as ${n} } from './${f}';`), ''].join('\n');

const payload = (item) =>
  JSON.stringify(
    {
      $schema: 'https://ui.shadcn.com/schema/registry-item.json',
      name: item.name,
      type: item.type,
      title: item.title,
      description: `P0.2 folder-shape probe for ${item.name}`,
      files: item.files,
    },
    null,
    2,
  );

writeFileSync(
  join(registryDir, 'accordion.json'),
  payload({
    name: 'accordion',
    type: 'registry:ui',
    title: 'Accordion',
    files: [
      { path: 'registry/files/ui/accordion.svelte', content: source('registry/files/ui/accordion.svelte'), type: 'registry:file', target: '@ui/accordion/accordion.svelte' },
      { path: 'registry/files/ui/accordion-item.svelte', content: source('registry/files/ui/accordion-item.svelte'), type: 'registry:file', target: '@ui/accordion/accordion-item.svelte' },
      { path: 'index.ts', content: barrel('accordion.svelte', [['AccordionItem', 'accordion-item.svelte']]), type: 'registry:file', target: '@ui/accordion/index.ts' },
    ],
  }),
);

writeFileSync(
  join(registryDir, 'toast.json'),
  payload({
    name: 'toast',
    type: 'registry:ui',
    title: 'Toast',
    files: [
      { path: 'registry/files/ui/toast-viewport.svelte', content: source('registry/files/ui/toast-viewport.svelte'), type: 'registry:file', target: '@ui/toast/toast-viewport.svelte' },
      { path: 'registry/files/lib/toast-store.ts', content: source('registry/files/lib/toast-store.ts'), type: 'registry:file', target: '@lib/toast-store.ts' },
      { path: 'index.ts', content: barrel('toast-viewport.svelte'), type: 'registry:file', target: '@ui/toast/index.ts' },
    ],
  }),
);

// the CLI resolves its default base (incl. r/colors/neutral.json)
// from REGISTRY_URL — cache the palette locally so the fixture never
// depends on ui.shadcn.com reachability
const neutral = spawnSync('curl', ['-s', '-m', '15', 'https://ui.shadcn.com/r/colors/neutral.json'], { encoding: 'utf8' });
if (neutral.status !== 0 || !neutral.stdout.trim().startsWith('{')) die('cannot cache r/colors/neutral.json (offline?)');
mkdirSync(join(registryDir, 'colors'), { recursive: true });
writeFileSync(join(registryDir, 'colors', 'neutral.json'), neutral.stdout);

// ── 2. local HTTP registry ─────────────────────────────────────────
// python's http.server over node's: the shadcn CLI's undici fetch hit
// Headers Timeout against a bare node keep-alive server; python's
// battle-tested static server (same one build-site documents) does not.
const registryRoot = join(scratch, 'registry');
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', registryRoot], { stdio: 'ignore' });
// wait until the registry answers
for (let i = 0; i < 50; i++) {
  const probe = spawnSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', `http://127.0.0.1:${PORT}/r/accordion.json`], { encoding: 'utf8' });
  if (probe.stdout.trim() === '200') break;
  await new Promise((r) => setTimeout(r, 200));
}

// ── 3. scratch consumer (vite + svelte plugin, $lib alias) ────────
mkdirSync(join(consumerDir, 'src/lib/ui'), { recursive: true });
mkdirSync(join(consumerDir, 'src/routes'), { recursive: true });
mkdirSync(join(consumerDir, 'public'), { recursive: true });

const versions = JSON.parse(source('apps/www/package.json')).devDependencies;
const write = (p, c) => writeFileSync(join(consumerDir, p), c);

write('package.json', JSON.stringify({
  name: 'tw4-p0-consumer',
  private: true,
  type: 'module',
  scripts: { build: 'vite build' },
  devDependencies: {
    svelte: versions.svelte,
    '@sveltejs/vite-plugin-svelte': versions['@sveltejs/vite-plugin-svelte'],
    vite: versions.vite,
    typescript: versions.typescript,
    '@tailwindcss/vite': versions['@tailwindcss/vite'],
    tailwindcss: versions.tailwindcss,
    shadcn: '^4.18.0',
  },
}, null, 2));

write('components.json', JSON.stringify({
  $schema: 'https://ui.shadcn.com/schema.json',
  style: 'new-york',
  rsc: false,
  tsx: true,
  tailwind: { config: '', css: 'src/app.css', baseColor: 'neutral', cssVariables: true, prefix: '' },
  iconLibrary: 'lucide',
  aliases: { components: 'src/lib', utils: 'src/lib/utils', ui: 'src/lib/ui', lib: 'src/lib', hooks: 'src/lib/hooks' },
  registries: { '@jixoai': `${BASE}/{name}.json` },
}, null, 2));

write('vite.config.ts', `import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
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
write('src/app.css', `@import 'tailwindcss';
`);
write('index.html', `<!doctype html>
<html><head><meta charset="utf-8" /><title>p0 consumer</title></head>
<body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>
`);
write('src/main.ts', `import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';
mount(App, { target: document.getElementById('app')! });
`);
write(
  'src/App.svelte',
  `<script lang="ts">
  // THE import-resolution probe: folder entries via the index barrels
  import Accordion, { AccordionItem } from '$lib/ui/accordion';
  import ToastViewport from '$lib/ui/toast';
</script>

<Accordion>
  <AccordionItem summary="one">first</AccordionItem>
</Accordion>
<ToastViewport />
`,
);

// ── 4. install + real shadcn add ──────────────────────────────────
const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { cwd: consumerDir, encoding: 'utf8', stdio: 'pipe', ...opts });
  if (r.status !== 0) {
    console.error(`command failed: ${cmd} ${args.join(' ')}\n${r.stdout}\n${r.stderr}`);
    process.exit(1);
  }
  return r;
};

console.log('npm install (consumer deps)…');
run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error']);

console.log('shadcn add @jixoai/accordion @jixoai/toast …');
// The CLI's default base (REGISTRY_URL) also points at the local
// registry — colors/neutral.json is served from the cache above, so
// nothing needs ui.shadcn.com. The local base stays OFF any proxy
// (the machine proxy black-holes localhost — the earlier curl 502).
run('npx', ['shadcn', 'add', '@jixoai/accordion', '@jixoai/toast', '--yes', '--overwrite'], {
  env: { ...process.env, REGISTRY_URL: BASE, NO_PROXY: 'localhost,127.0.0.1', no_proxy: 'localhost,127.0.0.1' },
});

// ── 5. assertions ─────────────────────────────────────────────────
const exists = (p) => existsSync(join(consumerDir, p));
check('accordion folder layout', exists('src/lib/ui/accordion/accordion.svelte') && exists('src/lib/ui/accordion/accordion-item.svelte'));
check('accordion index.ts barrel shipped', exists('src/lib/ui/accordion/index.ts'));
check('toast non-identical main in folder', exists('src/lib/ui/toast/toast-viewport.svelte') && !exists('src/lib/ui/toast/toast.svelte'));
check('toast canonical @lib file at root (exactly once)', exists('src/lib/toast-store.ts') && !exists('src/lib/ui/toast/toast-store.ts'));

const readdirSafe = (dir) => {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
};
const storeHits = [];
const walkFiles = (dir) => {
  for (const entry of readdirSafe(dir)) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full);
    else if (entry.name === 'toast-store.ts') storeHits.push(full);
  }
};
walkFiles(join(consumerDir, 'src'));
check('toast-store.ts appears exactly once tree-wide', storeHits.length === 1, `${storeHits.length} hit(s)`);

console.log('vite build (import resolution + svelte compile gate)…');
try {
  run('npx', ['vite', 'build']);
  check('consumer vite build passes', true);
} catch {
  check('consumer vite build passes', false);
}

server.kill();

// keep the scratch tree for inspection; next run wipes it
const failed = results.filter((r) => !r.ok);
console.log(failed.length === 0 ? '\nP0.2 shadcn-add fixtures: ALL GREEN' : `\nP0.2 shadcn-add fixtures: ${failed.length} FAILURE(S)`);
process.exit(failed.length === 0 ? 0 : 1);
