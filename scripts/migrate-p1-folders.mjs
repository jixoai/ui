#!/usr/bin/env node
// P1 mechanical folder migration (tw4-css-modularization, 2026-08-24).
//
// One-shot, zero-visual-delta restructure (design D4, r2 B7 option 1):
//   1. every `registry:ui` item's component-local files move into
//      `registry/files/ui/<item>/` — INCLUDING its companion css
//      (toc.css, website-scaffold.css) in the SAME batch;
//   2. pure-barrel index.ts per folder (default of the canonical main
//      + named sub-component defaults + `export *` for module types);
//   3. registry.json files[] paths/targets rewritten (+ index.ts
//      shipped as registry:file; item css targets its folder);
//   4. the apps/www mirror restructured identically (git mv);
//   5. import graph rewritten by PURE PATH MAPPING (no import-form
//      changes): `$lib/ui/<file>` → `$lib/ui/<folder>/<file>`;
//   6. css single-load path: toc.svelte imports './toc.css'
//      relatively; website-scaffold.svelte gains './website-scaffold.css';
//      the +layout.svelte manual import is removed.
//
// Gates run afterwards (tasks 1.5). Refuses to run twice.

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const die = (m) => { console.error(`[migrate-p1] ${m}`); process.exit(1); };
const sh = (cmd) => execSync(cmd, { cwd: root, encoding: 'utf8' });
const pascal = (s) => s.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');

// ── inputs ─────────────────────────────────────────────────────────
const manifest = JSON.parse(readFileSync(join(root, 'apps/www/mirror-manifest.json'), 'utf8'));
const registryPath = join(root, 'registry.json');
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
const items = registry.items ?? registry;
const uiItems = manifest.items.filter((i) => i.type === 'registry:ui');
if (uiItems.length !== 73) die(`expected 73 ui items, got ${uiItems.length}`);
if (existsSync(join(root, 'registry/files/ui/accordion/accordion.svelte'))) die('already migrated');

// file base → owning item (from the manifest, the machine source)
const fileToFolder = new Map();
for (const item of uiItems) {
  for (const f of item.files) {
    if (!('mirror' in f)) continue; // shared-claim record (native-form)
    fileToFolder.set(f.source.replace(/^registry\/files\/ui\//, ''), item.itemName);
  }
}

// ── 1+4. git mv both sides ────────────────────────────────────────
const folderFiles = new Map(); // folder → [file bases]
for (const [file, folder] of fileToFolder) {
  const rSrc = `registry/files/ui/${file}`;
  const rDst = `registry/files/ui/${folder}/${file}`;
  const mSrc = `apps/www/src/lib/ui/${file}`; // toc.css/website-scaffold.css mirrors live at src/lib root
  const mSrcActual = existsSync(join(root, mSrc)) ? mSrc : `apps/www/src/lib/${file}`;
  const mDst = `apps/www/src/lib/ui/${folder}/${file}`;
  mkdirSync(join(root, `registry/files/ui/${folder}`), { recursive: true });
  mkdirSync(join(root, `apps/www/src/lib/ui/${folder}`), { recursive: true });
  if (existsSync(join(root, rSrc))) sh(`git mv ${rSrc} ${rDst}`);
  if (existsSync(join(root, mSrcActual))) sh(`git mv ${mSrcActual} ${mDst}`);
  if (!folderFiles.has(folder)) folderFiles.set(folder, []);
  folderFiles.get(folder).push(file);
}
console.log(`moved ${fileToFolder.size} files into ${folderFiles.size} folders (registry + mirror)`);

// ── 2. index.ts barrels ───────────────────────────────────────────
for (const [folder, files] of folderFiles) {
  const main = manifest.canonicalMain[folder].replace(/^.*\//, '');
  const svelteFiles = files.filter((f) => f.endsWith('.svelte')).sort();
  const lines = [
    `// ${folder} — pure barrel (tw4-css-modularization D3): default =`,
    `// the canonical main; sub-components as named defaults; export *`,
    `// carries module-level named exports/types. No logic lives here.`,
    `export { default } from './${main}';`,
    `export * from './${main}';`,
  ];
  for (const f of svelteFiles) {
    if (f === main) continue;
    lines.push(`export { default as ${pascal(f.replace(/\.svelte$/, ''))} } from './${f}';`);
    lines.push(`export * from './${f}';`);
  }
  for (const side of ['registry/files/ui', 'apps/www/src/lib/ui']) {
    writeFileSync(join(root, side, folder, 'index.ts'), lines.join('\n') + '\n');
  }
}
console.log(`wrote ${folderFiles.size} index.ts barrels (registry + mirror)`);

// ── 3. registry.json rewrite ─────────────────────────────────────
for (const item of items) {
  if (item.type !== 'registry:ui') continue;
  const folder = item.itemName;
  for (const f of item.files ?? []) {
    if (!f.path.startsWith('registry/files/ui/')) continue;
    const base = f.path.replace(/^registry\/files\/ui\//, '');
    f.path = `registry/files/ui/${folder}/${base}`;
    if (f.target.startsWith('@ui/')) f.target = `@ui/${folder}/${base}`;
  }
  item.files.push({ path: `registry/files/ui/${folder}/index.ts`, target: `@ui/${folder}/index.ts`, type: 'registry:file' });
}
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
console.log('registry.json rewritten (folder paths/targets + index.ts files)');

// ── 5. import-graph rewrite (pure path mapping) ───────────────────
const rewrites = [];
for (const [file, folder] of fileToFolder) {
  rewrites.push([new RegExp(`\\$lib/ui/${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'), `$lib/ui/${folder}/${file}`]);
}
// companion css: site-side $lib root references (raw importers, layout)
rewrites.push([/\$lib\/toc\.css/g, '$lib/ui/toc/toc.css']);
rewrites.push([/\$lib\/website-scaffold\.css/g, '$lib/ui/website-scaffold/website-scaffold.css']);
rewrites.push([/@ui\/website-scaffold\.css/g, '@ui/website-scaffold/website-scaffold.css']);
// registry-path labels shown in docs pages
rewrites.push([/'registry\/files\/ui\/(toc|website-scaffold)\.css'/g, "'registry/files/ui/$1/$1.css'"]);

const editTree = (dir, exts) => {
  let n = 0;
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === '.svelte-kit' || e.name === 'dist') continue;
      const full = join(d, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      if (!exts.some((x) => e.name.endsWith(x))) continue;
      let s = readFileSync(full, 'utf8');
      const before = s;
      for (const [re, to] of rewrites) s = s.replace(re, to);
      if (s !== before) { writeFileSync(full, s); n += 1; }
    }
  };
  walk(dir);
  return n;
};
const edited = editTree(join(root, 'apps/www/src'), ['.svelte', '.ts', '.css']) + editTree(join(root, 'apps/www/test'), ['.svelte', '.ts']);
console.log(`rewrote imports in ${edited} site files`);

// ── 6. css single-load path ──────────────────────────────────────
const patchFile = (p, fn) => {
  const full = join(root, p);
  let s = readFileSync(full, 'utf8');
  const out = fn(s);
  if (out !== s) writeFileSync(full, out);
};
// toc.svelte: relative import (both sides; the $lib path-mapping above
// already rewrote it to the folder path — make it RELATIVE now)
for (const side of ['registry/files/ui/toc/toc.svelte', 'apps/www/src/lib/ui/toc/toc.svelte']) {
  patchFile(side, (s) => s.replace("import '$lib/ui/toc/toc.css';", "import './toc.css';"));
}
// website-scaffold.svelte: gains the relative import (single load path)
for (const side of ['registry/files/ui/website-scaffold/website-scaffold.svelte', 'apps/www/src/lib/ui/website-scaffold/website-scaffold.svelte']) {
  patchFile(side, (s) => s.replace("import { onMount, setContext } from 'svelte';", "import { onMount, setContext } from 'svelte';\n  import './website-scaffold.css';"));
}
// +layout.svelte: manual css import removed
patchFile('apps/www/src/routes/+layout.svelte', (s) => s.replace(/\s*import '\$lib\/ui\/website-scaffold\/website-scaffold\.css';/, ''));
console.log('css single-load path wired (component-relative imports; layout import removed)');

console.log('P1 migration DONE — run the gates (tasks 1.5).');
