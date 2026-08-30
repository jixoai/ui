#!/usr/bin/env node
// Real-consumer clean-install proof harness
// (tw4-css-modularization P0.2 → data-driven rewrite, 2026-08-30
// registry-install-integrity tasks 2b.1 + 2b.2).
//
// Proves the FOLDER-SHAPED install contract with real consumers —
// not inferred from `shadcn build` output (r1 B3 / r4 B12 rulings).
// The harness is DATA-DRIVEN: a case is a plain object (item list +
// App.svelte + optional overrides), so later changes (chart,
// input-group, button-group, patterns) register themselves by adding
// one CASES entry — no harness edits.
//
// Per case, the SAME pipeline runs:
//   1. a FRESH Vite consumer is materialized (template copy: the base
//      dependency tree installs ONCE, each case still gets a virgin
//      source tree),
//   2. `shadcn add @jixoai/…` installs from the GENERATED public/r/
//      payloads (step 0 re-runs `shadcn build` — CI calls this harness
//      before build-site, so the harness must produce its own input),
//   3. GENERIC assertions, derived from registry.json — no hand lists:
//      every file the case's items own (files[].target, alias-mapped)
//      lands at its canonical consumer path; every declared npm
//      dependency arrives in package.json; a case's `forbidden` tokens
//      appear in no payload edge and no installed file,
//   4. the case's App.svelte imports the CANONICAL entry (folder
//      barrel) and `vite build` must pass.
//
// Standing cases:
//   workbench          multi-item install (accordion/toast/code-card/
//                      progressive-blur/list-item) + chain assertions
//   isolated-list-item ONLY list-item: closure must self-deliver,
//                      every canonical target exactly once tree-wide
//   ghostty-term       clean install, zero wasm payloads, virtual-module
//                      stub keeps the data contract (design D7 6a)
//   color-picker       pre-seeded consumer mirrors the standing
//                      undeclared-import debt; $lib/color-utils.ts must
//                      arrive (regression lock, design D7 6b)
//   hero-section       resolves its dependency closure AND requests no
//                      @jixoai/reveal (the 2026-08-30 ghost — task 2b.2)
//
// Usage (from repo root):
//   node scripts/verify-shadcn-add.mjs
// Scratch lives under .agents/fixtures/ (gitignored), wiped per run.

import { spawn, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const scratch = join(root, '.agents/fixtures/2026-08-30-registry-install-integrity');
const registryDir = join(scratch, 'registry', 'r');
const publicR = join(root, 'public', 'r');
const templateDir = join(scratch, 'consumer-template');
// A FREE port, probed at runtime: a fixed port gets squatted by a stale
// fixture server (observed: an old run's python http.server survived on
// 5399 and served its own dead registry — silent wrong-registry adds).
const PORT = await new Promise((resolve, reject) => {
  const probe = createServer();
  probe.unref();
  probe.on('error', reject);
  probe.listen(0, '127.0.0.1', () => {
    const port = probe.address().port;
    probe.close(() => resolve(port));
  });
});
const BASE = `http://127.0.0.1:${PORT}/r`;

const die = (msg) => { console.error(`[verify-shadcn-add] ${msg}`); process.exit(1); };
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const source = (p) => readFileSync(join(root, p), 'utf8');
const readdirSafe = (dir) => {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
};
const countTree = (dir, basename) => {
  let hits = 0;
  for (const entry of readdirSafe(dir)) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) hits += countTree(full, basename);
    else if (entry.name === basename) hits += 1;
  }
  return hits;
};
const walkFilesNamed = (dir, predicate, hits = []) => {
  for (const entry of readdirSafe(dir)) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkFilesNamed(full, predicate, hits);
    else if (predicate(entry.name, readFileSync(full, 'utf8'))) hits.push(full);
  }
  return hits;
};

// ── 0. the payload under test: generated public/r/ ─────────────────
// `shadcn build` re-emits public/r/*.json from registry.json — the exact
// bytes a real consumer fetches from https://ui.jixoai.com/r/. CI runs
// this harness BEFORE build-site, so generating here keeps it
// self-sufficient; build-site later re-runs the same build for publish.
if (!existsSync(join(root, 'node_modules', 'shadcn'))) {
  die('root node_modules/shadcn missing; run `npm install` at the repo root first');
}
console.log('shadcn build (generate public/r payloads)…');
{
  const build = spawnSync('npm', ['run', 'build'], { cwd: root, encoding: 'utf8', stdio: 'pipe' });
  if (build.status !== 0) die(`shadcn build failed:\n${build.stdout}\n${build.stderr}`);
}
if (!existsSync(join(publicR, 'registry.json'))) die('public/r/registry.json missing after shadcn build');

// ── 1. scratch registry = the generated public/r payloads ──────────
rmSync(scratch, { recursive: true, force: true });
mkdirSync(join(registryDir, 'colors'), { recursive: true });
cpSync(publicR, registryDir, { recursive: true });

// the CLI resolves its default base (incl. r/colors/neutral.json)
// from REGISTRY_URL — cache the palette locally so the fixture never
// depends on ui.shadcn.com reachability (cached across runs in
// gitignored .agents/ so repeat runs work offline)
const neutralCache = join(root, '.agents', 'fixtures', 'colors-neutral.cache.json');
mkdirSync(dirname(neutralCache), { recursive: true });
if (!existsSync(neutralCache)) {
  const neutral = spawnSync('curl', ['-s', '-m', '15', 'https://ui.shadcn.com/r/colors/neutral.json'], { encoding: 'utf8' });
  if (neutral.status !== 0 || !neutral.stdout.trim().startsWith('{')) die('cannot cache r/colors/neutral.json (offline?)');
  writeFileSync(neutralCache, neutral.stdout);
}
cpSync(neutralCache, join(registryDir, 'colors', 'neutral.json'));

// ── 2. local HTTP registry ─────────────────────────────────────────
// python's http.server over node's: the shadcn CLI's undici fetch hit
// Headers Timeout against a bare node keep-alive server; python's
// battle-tested static server (same one build-site documents) does not.
const registryRoot = join(scratch, 'registry');
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', registryRoot], { stdio: 'ignore' });
// wait until the registry answers — die loudly if it never does (a silent
// proceed once made every add fail against an unrelated stale server)
{
  let up = false;
  for (let i = 0; i < 50; i++) {
    const probe = spawnSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', `${BASE}/accordion.json`], { encoding: 'utf8' });
    if (probe.stdout.trim() === '200') {
      up = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  if (!up) die(`local registry server did not come up on ${BASE}`);
}

// ── 3. registry.json projection: canonical targets per item ────────
// Components.json aliases are the consumer contract: @ui/* lands under
// the ui alias, @lib/* under the lib alias. THE generic assertion set
// derives from this — hand-written file lists drifted twice (P3-r1).
const registryItems = JSON.parse(source('registry.json')).items ?? JSON.parse(source('registry.json'));
const byName = new Map(registryItems.map((i) => [i.name, i]));
const wwwComponents = JSON.parse(source('apps/www/components.json'));
const aliases = wwwComponents.aliases;
const targetToConsumer = (target) => {
  if (target.startsWith('@ui/')) return `${aliases.ui}/${target.slice(4)}`;
  if (target.startsWith('@lib/')) return `${aliases.lib}/${target.slice(5)}`;
  return null;
};
const canonicalTargets = (itemNames) =>
  itemNames.flatMap((name) => {
    const item = byName.get(name);
    if (!item) die(`registry.json has no item ${name}`);
    return (item.files ?? []).map((f) => targetToConsumer(f.target ?? '')).filter(Boolean);
  });

// ── 4. the CASES (data — extend by adding an entry) ────────────────
const CASES = [
  {
    id: 'workbench',
    items: ['accordion', 'toast', 'code-card', 'progressive-blur', 'list-item'],
    app: `<script lang="ts">
  // THE import-resolution probe: folder entries via the index barrels
  import Accordion, { AccordionItem } from '$lib/ui/accordion';
  import ToastViewport from '$lib/ui/toast';
  import CodeCard from '$lib/ui/code-card';
  import ProgressiveBlur from '$lib/ui/progressive-blur';
  import { Item, ItemGroup, ItemContent, ItemTitle, ItemEnd, ItemChevron, ItemToggle } from '$lib/ui/list-item';
</script>

<Accordion>
  <AccordionItem summary="one">first</AccordionItem>
</Accordion>
<ToastViewport />
<div class="relative h-32 overflow-auto">
  <ProgressiveBlur position="top" reveal="scroll" height="3rem" />
  <p>scrolling content</p>
</div>
<ItemGroup label="consumer probe">
  <Item href="#x">
    <ItemContent><ItemTitle>row</ItemTitle></ItemContent>
    <ItemEnd><ItemChevron /></ItemEnd>
  </Item>
  <ItemToggle label="Fast builds" />
</ItemGroup>
`,
    extraChecks(ctx) {
      // toast: non-identical main + item-shipped canonical lib
      check('toast non-identical main in folder', ctx.exists('src/lib/ui/toast/toast-viewport.svelte') && !ctx.exists('src/lib/ui/toast/toast.svelte'));
      check('toast canonical @lib file at root (exactly once)', ctx.exists('src/lib/toast-store.ts') && !ctx.exists('src/lib/ui/toast/toast-store.ts'));
      const storeHits = walkFilesNamed(join(ctx.dir, 'src'), (name) => name === 'toast-store.ts');
      check('toast-store.ts appears exactly once tree-wide', storeHits.length === 1, `${storeHits.length} hit(s)`);
      // code-card chain: exactly-once @lib files + npm dep arrival
      check('code-card chain: shiki.ts exactly once at canonical @lib', ctx.exists('src/lib/shiki.ts') && !ctx.exists('src/lib/ui/code-card/shiki.ts'));
      check('code-card chain: jixoai.css (theme) arrived', ctx.exists('src/lib/jixoai.css'));
      const pkg = JSON.parse(ctx.read('package.json'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      check('code-card chain: npm shiki installed', !!deps.shiki);
    },
  },
  {
    id: 'isolated-list-item',
    items: ['list-item'],
    app: `<script lang="ts">
  import { Item, ItemGroup, ItemContent, ItemTitle, ItemEnd, ItemChevron, ItemDivider, ItemAfter, ItemToggle, ItemCheckbox, ItemRadio, ItemSelect, ItemInput } from '$lib/ui/list-item';
  let channel = $state('stable');
  let on = $state(false);
  let density = $state('default');
  let name = $state('');
</script>

<ItemGroup label="isolated">
  <Item href="#x">
    <ItemContent><ItemTitle>row</ItemTitle></ItemContent>
    <ItemEnd><ItemAfter>2</ItemAfter></ItemEnd>
  </Item>
  <ItemDivider />
  <ItemToggle label="Fast builds" bind:checked={on} />
  <ItemCheckbox label="Telemetry" />
  <ItemRadio name="channel" value="stable" label="Stable" bind:group={channel} />
  <ItemSelect label="Density" bind:value={density}><option value="default">default</option></ItemSelect>
  <ItemInput label="Project name" bind:value={name} />
</ItemGroup>
`,
    extraChecks(ctx) {
      check('list-item: item-separator absent', !ctx.exists('src/lib/ui/list-item/item-separator.svelte'));
      // closure delivery on a CLEAN consumer: every control folder +
      // frozen kernel exactly once tree-wide (impl-review blocker 6)
      const exactOnce = [
        'src/lib/ui/toggle/toggle.svelte',
        'src/lib/ui/checkbox/checkbox.svelte',
        'src/lib/ui/radio/radio.svelte',
        'src/lib/ui/native-select/native-select.svelte',
        'src/lib/ui/input/input.svelte',
        'src/lib/icons.ts',
        'src/lib/jx-pure.css',
        'src/lib/jixoai.css',
        'src/lib/utils.ts',
      ];
      for (const target of exactOnce) {
        const base = target.split('/').at(-1);
        check(`isolated: ${base} exactly once tree-wide`, ctx.exists(target) && countTree(join(ctx.dir, 'src'), base) === 1);
      }
    },
  },
  {
    id: 'ghostty-term',
    items: ['ghostty-term'],
    // The real plugin resolves wasm bytes at build time — the wrong tool
    // for an INSTALL fixture. This stub keeps only the plugin's public
    // data contract (pure-data virtual module, design D3).
    viteConfig: `import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const ghosttyVirtualStub = {
  name: 'fixture-ghostty-virtual-stub',
  resolveId(id) { return id === 'virtual:jixoai-ghostty' ? '\\0virtual:jixoai-ghostty' : null; },
  load(id) {
    if (id !== '\\0virtual:jixoai-ghostty') return null;
    return [
      "export const url = '/fixture/ghostty-vt.wasm';",
      "export const sha256 = '${'0'.repeat(64)}';",
      "export const variant = 'full';",
      "export const buildInfo = 'fixture-stub';",
      // named exports only — mirrors the REAL plugin contract
      // (impl-r2 #4): the stub must not ship a default export either.
    ].join('\\n');
  },
};

export default defineConfig({
  plugins: [ghosttyVirtualStub, svelte(), tailwindcss()],
  resolve: { alias: { $lib: fileURLToPath(new URL('./src/lib', import.meta.url)) } },
  build: { target: 'esnext' },
});
`,
    app: `<script lang="ts">
  import GhosttyTerm from '$lib/ui/ghostty-term';
</script>

<GhosttyTerm />
`,
    extraChecks(ctx) {
      // zero wasm payloads in the installed tree — binaries ride the
      // vite-plugin supply chain (pin manifest + resolver), never the registry
      const wasmHits = walkFilesNamed(join(ctx.dir, 'src'), (name) => name.endsWith('.wasm'));
      check('ghostty-term: zero wasm payloads in src/', wasmHits.length === 0, wasmHits.map((p) => p.slice(ctx.dir.length)).join(', ') || 'none');
      const frozen = ['src/lib/ghostty-vt.ts', 'src/lib/jixoai.css', 'src/lib/utils.ts', 'src/lib/color-utils.ts', 'src/lib/density.svelte.ts'];
      const missing = frozen.filter((f) => !ctx.exists(f));
      check('ghostty-term: frozen dependency closure arrived', missing.length === 0, missing.join(', ') || 'complete');
    },
    postBuild(ctx) {
      // impl-r2 #4: the virtual-module contract is named-exports-only —
      // the bundled consumer output must carry the named url and no default face
      const bundled = walkFilesNamed(join(ctx.dir, 'dist', 'assets'), (name) => name.endsWith('.js'))
        .map((f) => readFileSync(f, 'utf8'))
        .join('\n');
      check(
        'ghostty-term: virtual module named-only (url present, no default face)',
        bundled.includes('ghostty-vt.wasm') && !/export\s+default\s*\{\s*url/.test(bundled),
      );
    },
  },
  {
    id: 'color-picker',
    items: ['color-picker'],
    // Pre-seed at canonical targets from the registry sources — exactly
    // what an older jixoai-ui install (or the www tree) carries: the
    // folders color-picker imports but does not declare, plus the kernels
    // those imports lean on (the standing registry debt, mirrors the www
    // tree). The regression lock: $lib/color-utils.ts MUST still arrive.
    preseed: [
      ['registry/files/ui/input/input.svelte', 'src/lib/ui/input/input.svelte'],
      ['registry/files/ui/input/index.ts', 'src/lib/ui/input/index.ts'],
      ['registry/files/ui/input/input.css', 'src/lib/ui/input/input.css'],
      ['registry/files/ui/native-select/native-select.svelte', 'src/lib/ui/native-select/native-select.svelte'],
      ['registry/files/ui/native-select/index.ts', 'src/lib/ui/native-select/index.ts'],
      // native-select ships no css (the preseed list once assumed parity —
      // merge-alignment A3 caught the phantom file)
      ['registry/files/ui/press-button/press-button.svelte', 'src/lib/ui/press-button/press-button.svelte'],
      ['registry/files/ui/press-button/index.ts', 'src/lib/ui/press-button/index.ts'],
      ['registry/files/ui/press-button/press-button.css', 'src/lib/ui/press-button/press-button.css'],
      ['registry/files/ui/press-button/ripple.svelte.ts', 'src/lib/ui/press-button/ripple.svelte.ts'],
      ['registry/files/lib/surface-motion.ts', 'src/lib/surface-motion.ts'],
      ['registry/files/lib/density.svelte.ts', 'src/lib/density.svelte.ts'],
      ['registry/files/lib/icons.ts', 'src/lib/icons.ts'],
    ],
    app: `<script lang="ts">
  import ColorPicker from '$lib/ui/color-picker';
</script>

<ColorPicker />
`,
    extraChecks(ctx) {
      check('color-picker: $lib/color-utils.ts arrived (regression lock)', ctx.exists('src/lib/color-utils.ts'));
      check(
        'color-picker: declared deps arrived (utils/jixoai-theme/jx-pure)',
        ctx.exists('src/lib/utils.ts') && ctx.exists('src/lib/jixoai.css') && ctx.exists('src/lib/jx-pure.css'),
      );
      for (const target of ['src/lib/ui/input/input.svelte', 'src/lib/ui/native-select/native-select.svelte', 'src/lib/ui/press-button/press-button.svelte']) {
        const base = target.split('/').at(-1);
        check(`color-picker: pre-seeded ${base} untouched (exactly once)`, ctx.exists(target) && countTree(join(ctx.dir, 'src'), base) === 1);
      }
      check(
        'color-picker: pre-seeded kernels exactly once (surface-motion/density)',
        countTree(join(ctx.dir, 'src'), 'surface-motion.ts') === 1 && countTree(join(ctx.dir, 'src'), 'density.svelte.ts') === 1,
      );
    },
  },
  {
    id: 'hero-section',
    // registry-install-integrity task 2b.2: the hero must resolve its
    // dependency closure AND request no @jixoai/reveal — the ghost edge
    // that made every hero install fail (deleted item, live declaration).
    items: ['hero-section'],
    forbidden: ['reveal'],
    app: `<script lang="ts">
  import HeroSection from '$lib/ui/hero-section';
</script>

<HeroSection eyebrow="clean-install probe" summary="the hero composes from the registry payload" copyCommand="npx jixoai-ui add hero-section">
  {#snippet terminal()}<pre>probe</pre>{/snippet}
</HeroSection>
`,
    extraChecks(ctx) {
      const missing = ['src/lib/jixoai.css', 'src/lib/icons.ts'].filter((f) => !ctx.exists(f));
      check('hero-section: theme + icons closure arrived', missing.length === 0, missing.join(', ') || 'complete');
    },
  },
];

// ── 5. consumer template (written once, npm-installed once) ────────
const versions = JSON.parse(source('apps/www/package.json')).devDependencies;
mkdirSync(join(templateDir, 'src/lib/ui'), { recursive: true });
mkdirSync(join(templateDir, 'public'), { recursive: true });
const writeAt = (dir, p, c) => writeFileSync(join(dir, p), c);
const consumerFiles = {
  'package.json': JSON.stringify({
    name: 'jixoai-clean-install-consumer',
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
  }, null, 2),
  'components.json': JSON.stringify({
    $schema: 'https://ui.shadcn.com/schema.json',
    style: 'new-york',
    rsc: false,
    tsx: true,
    tailwind: { config: '', css: 'src/app.css', baseColor: 'neutral', cssVariables: true, prefix: '' },
    iconLibrary: 'lucide',
    aliases: { components: 'src/lib', utils: 'src/lib/utils', ui: 'src/lib/ui', lib: 'src/lib', hooks: 'src/lib/hooks' },
    registries: { '@jixoai': `${BASE}/{name}.json` },
  }, null, 2),
  'vite.config.ts': `import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  resolve: { alias: { $lib: fileURLToPath(new URL('./src/lib', import.meta.url)) } },
  build: { target: 'esnext' },
});
`,
  'tsconfig.json': JSON.stringify({
    compilerOptions: {
      target: 'esnext', module: 'esnext', moduleResolution: 'bundler',
      verbatimModuleSyntax: true, strict: true, noEmit: true,
      paths: { '$lib': ['./src/lib'], '$lib/*': ['./src/lib/*'] },
      types: ['svelte', 'vite/client'],
    },
    include: ['src/**/*.ts', 'src/**/*.svelte', 'vite.config.ts'],
  }, null, 2),
  'svelte.config.js': `import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
export default { preprocess: vitePreprocess() };
`,
  'src/app.css': `@import 'tailwindcss';
`,
  'index.html': `<!doctype html>
<html><head><meta charset="utf-8" /><title>clean-install consumer</title></head>
<body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>
`,
  'src/main.ts': `import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';
mount(App, { target: document.getElementById('app')! });
`,
};
for (const [p, c] of Object.entries(consumerFiles)) writeAt(templateDir, p, c);

console.log('npm install (consumer template deps — installs once)…');
{
  const r = spawnSync('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'], { cwd: templateDir, encoding: 'utf8', stdio: 'pipe' });
  if (r.status !== 0) die(`npm install failed:\n${r.stdout}\n${r.stderr}`);
}

// ── 6. run the cases ───────────────────────────────────────────────
const runIn = (dir, cmd, args, env = {}) => {
  const r = spawnSync(cmd, args, {
    cwd: dir,
    encoding: 'utf8',
    stdio: 'pipe',
    // The local base stays OFF any proxy (the machine proxy black-holes
    // localhost — the earlier curl 502).
    env: { ...process.env, REGISTRY_URL: BASE, NO_PROXY: 'localhost,127.0.0.1', no_proxy: 'localhost,127.0.0.1', ...env },
  });
  return r;
};

for (const testCase of CASES) {
  console.log(`\n━━ case: ${testCase.id} (add ${testCase.items.map((i) => `@jixoai/${i}`).join(' ')}) ━━━━━━━━━━━━━━━`);
  const dir = join(scratch, `consumer-${testCase.id}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dirname(dir), { recursive: true });
  cpSync(templateDir, dir, { recursive: true });
  if (testCase.viteConfig) writeAt(dir, 'vite.config.ts', testCase.viteConfig);
  for (const [src, dest] of testCase.preseed ?? []) {
    mkdirSync(dirname(join(dir, dest)), { recursive: true });
    writeFileSync(join(dir, dest), source(src));
  }
  writeAt(dir, 'src/App.svelte', testCase.app);

  const ctx = {
    dir,
    exists: (p) => existsSync(join(dir, p)),
    read: (p) => readFileSync(join(dir, p), 'utf8'),
  };

  const add = runIn(dir, 'npx', ['shadcn', 'add', ...testCase.items.map((i) => `@jixoai/${i}`), '--yes', '--overwrite']);
  check('shadcn add resolves from public/r payloads', add.status === 0, add.status === 0 ? '' : `${add.stdout}\n${add.stderr}`.slice(-800));
  if (add.status !== 0) continue; // later assertions are moot for this case

  // GENERIC: every canonical target of every case item landed
  const missing = canonicalTargets(testCase.items).filter((p) => !ctx.exists(p));
  check('canonical target files landed', missing.length === 0, missing.join(', ') || 'complete');

  // GENERIC: declared npm dependencies arrive in package.json
  // (registry `dependencies` may be an object map OR an array of names)
  {
    const pkg = JSON.parse(ctx.read('package.json'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const depNames = (d) => (d == null ? [] : Array.isArray(d) ? d : Object.keys(d));
    const wanted = testCase.items.flatMap((name) => depNames(byName.get(name).dependencies));
    const absent = [...new Set(wanted)].filter((d) => !deps[d]);
    check('declared npm dependencies installed', absent.length === 0, absent.join(', ') || 'complete');
  }

  // GENERIC: forbidden tokens ride no edge, no import, and no filename
  // (prose mentions in comments are fine — the contract is about module
  // resolution, e.g. hero-section's css comments discuss the retired
  // reveal era without importing it)
  const IMPORT_OF = (token) => new RegExp(`(?:import|from|require)\\s*\\(?\\s*['"][^'"]*${token}[^'"]*['"]`);
  for (const token of testCase.forbidden ?? []) {
    const payloadEdges = testCase.items
      .map((name) => JSON.parse(readFileSync(join(registryDir, `${name}.json`), 'utf8')))
      .flatMap((payload) => payload.registryDependencies ?? []);
    check(`forbidden token not requested: ${token}`, !payloadEdges.some((e) => e.includes(token)), payloadEdges.join(', ') || 'no edges');
    const hits = walkFilesNamed(join(dir, 'src'), (name, content) => name.includes(token) || IMPORT_OF(token).test(content));
    check(`forbidden token imported nowhere: ${token}`, hits.length === 0, hits.map((p) => p.slice(dir.length)).join(', ') || 'none');
  }

  testCase.extraChecks?.(ctx);

  console.log('  vite build (import resolution + svelte compile gate)…');
  const build = runIn(dir, 'npx', ['vite', 'build']);
  check('consumer vite build passes', build.status === 0, build.status === 0 ? '' : `${build.stdout}\n${build.stderr}`.slice(-800));
  if (build.status === 0) testCase.postBuild?.(ctx);
}

server.kill();

// keep the scratch tree for inspection; next run wipes it
const failed = results.filter((r) => !r.ok);
console.log(
  failed.length === 0
    ? `\nclean-install cases (${CASES.length}): ALL GREEN`
    : `\nclean-install cases (${CASES.length}): ${failed.length} FAILURE(S)`,
);
process.exit(failed.length === 0 ? 0 : 1);
