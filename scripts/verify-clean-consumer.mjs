#!/usr/bin/env node
// Clean-consumer entry/theme gate (tw4 P3.2, r4 B13 + r5 B14, 2026-08-24).
//
// The harshest consumer fixture: starts from an EMPTY scratch project,
// installs ONLY via the public contract —
//   1. canonical entry setup: `@import 'tailwindcss'` → jixoai theme;
//   2. `shadcn add @jixoai/kbd` (utility-authored item carrying
//      registryDependencies @jixoai/utils + @jixoai/jixoai-theme);
//   3. the package manifest MUST gain the theme's fontsource npm deps
//      (the B14 closure);
//   4. the real vite build resolves @lib/jixoai.css;
//   5. the COMPILED output carries dark:*, border-border,
//      bg-background AND the component's utilities.
//
// Usage: node scripts/verify-clean-consumer.mjs   (from repo root)

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const scratch = join(root, '.agents/fixtures/2026-08-24-tw4-clean-consumer');
const registryRoot = join(scratch, 'registry');
const registryDir = join(registryRoot, 'r');
const consumerDir = join(scratch, 'consumer');
const PORT = 5498;
const BASE = `http://127.0.0.1:${PORT}/r`;

const die = (m) => { console.error(`[clean-consumer] ${m}`); process.exit(1); };
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};
const source = (p) => readFileSync(join(root, p), 'utf8');

// ── 1. temp registry: kbd + utils + jixoai-theme (folder shape) ────
rmSync(scratch, { recursive: true, force: true });
mkdirSync(join(registryDir, 'colors'), { recursive: true });
const item = (o) => writeFileSync(join(registryDir, `${o.name}.json`), JSON.stringify(o, null, 2));

item({
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'kbd',
  type: 'registry:ui',
  title: 'Kbd',
  description: 'probe item',
  registryDependencies: ['@jixoai/utils', '@jixoai/jixoai-theme'],
  files: [
    { path: 'registry/files/ui/kbd/kbd.svelte', content: source('registry/files/ui/kbd/kbd.svelte'), type: 'registry:file', target: '@ui/kbd/kbd.svelte' },
    { path: 'index.ts', content: "export { default } from './kbd.svelte';\nexport * from './kbd.svelte';\n", type: 'registry:file', target: '@ui/kbd/index.ts' },
  ],
});
item({
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'utils',
  type: 'registry:lib',
  title: 'cn',
  description: 'probe item',
  dependencies: ['clsx', 'tailwind-merge'],
  files: [{ path: 'registry/files/lib/utils.ts', content: source('registry/files/lib/utils.ts'), type: 'registry:file', target: '@lib/utils.ts' }],
});
item({
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'jixoai-theme',
  type: 'registry:theme',
  title: 'jixoai theme',
  description: 'probe item',
  dependencies: ['@fontsource-variable/jetbrains-mono', '@fontsource/share-tech-mono'],
  files: [{ path: 'registry/files/theme/jixoai.css', content: source('registry/files/theme/jixoai.css'), type: 'registry:file', target: '@lib/jixoai.css' }],
});
const neutral = spawnSync('curl', ['-s', '-m', '15', 'https://ui.shadcn.com/r/colors/neutral.json'], { encoding: 'utf8' });
if (neutral.status !== 0 || !neutral.stdout.trim().startsWith('{')) die('cannot cache r/colors/neutral.json (offline?)');
writeFileSync(join(registryDir, 'colors', 'neutral.json'), neutral.stdout);

// ── 2. local registry server ──────────────────────────────────────
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', registryRoot], { stdio: 'ignore' });
for (let i = 0; i < 50; i++) {
  const probe = spawnSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', `${BASE}/kbd.json`], { encoding: 'utf8' });
  if (probe.stdout.trim() === '200') break;
  await new Promise((r) => setTimeout(r, 200));
}

// ── 3. EMPTY scratch consumer + the PUBLIC setup only ─────────────
mkdirSync(join(consumerDir, 'src/lib/ui'), { recursive: true });
mkdirSync(join(consumerDir, 'public'), { recursive: true });
const versions = JSON.parse(source('apps/www/package.json')).devDependencies;
const write = (p, c) => writeFileSync(join(consumerDir, p), c);

write('package.json', JSON.stringify({
  name: 'tw4-clean-consumer',
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
  style: 'new-york', rsc: false, tsx: true,
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
// THE canonical entry setup — the whole public contract in two lines
write('src/app.css', `@import 'tailwindcss';
@import './lib/jixoai.css';
`);
write('index.html', `<!doctype html>
<html><head><meta charset="utf-8" /><title>clean consumer</title></head>
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
  import Kbd from '$lib/ui/kbd';
</script>

<main class="bg-background text-foreground p-8 dark:bg-black">
  <p class="border border-border mb-4"><Kbd>⌘</Kbd> + <Kbd>K</Kbd></p>
</main>
`,
);

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { cwd: consumerDir, encoding: 'utf8', stdio: 'pipe', ...opts });
  if (r.status !== 0) {
    console.error(`command failed: ${cmd} ${args.join(' ')}\n${r.stdout}\n${r.stderr}`);
    process.exit(1);
  }
  return r;
};

console.log('npm install (base toolchain)…');
run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error']);

console.log('shadcn add @jixoai/kbd (public contract only)…');
run('npx', ['shadcn', 'add', '@jixoai/kbd', '--yes', '--overwrite'], {
  env: { ...process.env, REGISTRY_URL: BASE, NO_PROXY: 'localhost,127.0.0.1', no_proxy: 'localhost,127.0.0.1' },
});

// ── 4. assertions ─────────────────────────────────────────────────
const pkg = JSON.parse(readFileSync(join(consumerDir, 'package.json'), 'utf8'));
const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
check('theme fontsource deps installed (B14 closure)', !!allDeps['@fontsource-variable/jetbrains-mono'] && !!allDeps['@fontsource/share-tech-mono'], JSON.stringify(Object.keys(allDeps).filter((d) => d.includes('fontsource'))));
check('utils npm deps installed', !!allDeps.clsx && !!allDeps['tailwind-merge']);
check('kbd folder + barrel installed', existsSync(join(consumerDir, 'src/lib/ui/kbd/kbd.svelte')) && existsSync(join(consumerDir, 'src/lib/ui/kbd/index.ts')));
check('theme sheet at @lib/jixoai.css', existsSync(join(consumerDir, 'src/lib/jixoai.css')));

console.log('vite build (entry resolves the theme css)…');
try {
  run('npx', ['vite', 'build']);
  check('consumer vite build passes', true);
} catch {
  check('consumer vite build passes', false);
}

// compiled-output assertions: scan the built css assets
const builtCss = [];
const walkDist = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walkDist(full);
    else if (e.name.endsWith('.css')) builtCss.push(readFileSync(full, 'utf8'));
  }
};
walkDist(join(consumerDir, 'dist'));
const css = builtCss.join('\n');
check('compiled css exists', css.length > 0, `${builtCss.length} asset(s)`);
check('bg-background compiled', /\.bg-background/.test(css));
check('border-border compiled', /\.border-border/.test(css));
check('dark variant compiled', /\.dark\b/.test(css));
check('kbd utilities compiled (bg-muted + shadow)', /\.bg-muted/.test(css) && /shadow/.test(css));

server.kill();
const failed = results.filter((r) => !r.ok);
console.log(failed.length === 0 ? '\nclean-consumer gate: ALL GREEN' : `\nclean-consumer gate: ${failed.length} FAILURE(S)`);
process.exit(failed.length === 0 ? 0 : 1);
