#!/usr/bin/env node
// mirror-manifest generator + drift detector
// (tw4-css-modularization P0.3, 2026-08-24).
//
// The manifest (apps/www/mirror-manifest.json) is the machine-readable
// source of truth for the registry↔mirror relationship:
//   - every registry/files/** file referenced by an item maps to its
//     apps/www mirror path + consumer target + sha256 (both sides);
//   - every `registry:ui` item has exactly one canonicalMain entry
//     (same-name .svelte derived; toast explicitly overridden);
//   - unclassified files on either side FAIL (complete drift law).
//
// Modes:
//   node scripts/gen-mirror-manifest.mjs           # write the manifest
//   node scripts/gen-mirror-manifest.mjs --check   # verify trees vs committed manifest
//
// Curated classifications (the ONLY hand-maintained part):
const SITE_ONLY = [
  // mirror files that are docs-site chrome, never registry items
  { path: 'apps/www/src/lib/ui/component-tree-nav.svelte', note: 'site secondary-nav chrome' },
  { path: 'apps/www/src/lib/catalog.ts', note: 'site catalog index' },
  { path: 'apps/www/src/lib/site.ts', note: 'site helpers' },
  { path: 'apps/www/src/lib/hue-runtime.ts', note: 'tokens-page hue lab runtime' },
  { path: 'apps/www/src/lib/code-block.svelte', note: 'site docs code surface' },
  { path: 'apps/www/src/lib/copy-command.svelte', note: 'site docs copy affordance' },
  { path: 'apps/www/src/lib/copy-icon-button.svelte', note: 'site docs copy affordance' },
  { path: 'apps/www/src/lib/overview-card.svelte', note: 'site docs overview card' },
  { path: 'apps/www/src/lib/toc.css', note: 'MIRROR ROOT COPY of the toc item css (pre-migration path mapping)' },
  { path: 'apps/www/src/lib/website-scaffold.css', note: 'MIRROR ROOT COPY of the website-scaffold item css (pre-migration path mapping)' },
];
const REGISTRY_ONLY = [
  // registry files with NO mirror and no item reference — resolved by P1
];
const UNREFERENCED_LIB = [
  // same-source pairs not referenced by any item (site-consumed)
  { path: 'registry/files/lib/color-utils.ts', note: 'site-consumed, unreferenced by items' },
  { path: 'registry/files/lib/surface-motion.ts', note: 'site-consumed, unreferenced by items' },
  { path: 'registry/files/ui/tree-view-multiselect.svelte', note: 'mirrored + unreferenced; P1 must fold into the tree-view item or remove both sides' },
];
// canonical main overrides for registry:ui items whose main file is not
// name-identical (B11/B9 ruling: manifest is the single machine source)
const CANONICAL_MAIN_OVERRIDES = {
  toast: 'registry/files/ui/toast-viewport.svelte',
};
// mirror-path overrides for files whose mirror does not follow the
// default rule (pre-migration item css living at src/lib root)
const MIRROR_PATH_OVERRIDES = {
  'registry/files/ui/toc.css': 'apps/www/src/lib/toc.css',
  'registry/files/ui/website-scaffold.css': 'apps/www/src/lib/website-scaffold.css',
};

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const checkMode = process.argv.includes('--check');
const die = (msg) => {
  console.error(`[mirror-manifest] ${msg}`);
  process.exit(1);
};

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const walk = (dir, prefix = '') =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    return e.isDirectory() ? walk(join(dir, e.name), rel) : [rel];
  });

const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'));
const items = registry.items ?? registry;

// ── build the item maps ────────────────────────────────────────────
const uiItems = items.filter((i) => i.type === 'registry:ui');
const canonicalMain = {};
for (const item of uiItems) {
  const override = CANONICAL_MAIN_OVERRIDES[item.name];
  const sameName = `registry/files/ui/${item.name}.svelte`;
  const main = override ?? (existsSync(join(root, sameName)) ? sameName : null);
  if (!main) die(`registry:ui item ${item.name} has no canonicalMain (no same-name .svelte, no override)`);
  if (!item.files.some((f) => f.path === main)) die(`canonicalMain of ${item.name} is not in its files[]: ${main}`);
  canonicalMain[item.name] = main;
}

const manifestItems = [];
const seenSources = new Map(); // source → first claiming item
for (const item of items) {
  const files = (item.files ?? []).map((f) => {
    const firstClaim = seenSources.get(f.path);
    if (firstClaim) {
      // Known shared-claim shape: native-form is jx-pure's deprecated
      // alias (see the jx-pure living spec). Recorded, not fatal; P1
      // applies the single-owner + registryDependencies ruling if the
      // shared-claim set ever grows beyond the documented aliases.
      return { sharedClaimOf: firstClaim, source: f.path };
    }
    seenSources.set(f.path, item.name);
    const mirror =
      MIRROR_PATH_OVERRIDES[f.path] ??
      f.path
        .replace(/^registry\/files\/ui\//, 'apps/www/src/lib/ui/')
        .replace(/^registry\/files\/(?:lib|theme)\//, 'apps/www/src/lib/');
    if (!existsSync(join(root, f.path))) die(`item ${item.name} references missing source: ${f.path}`);
    if (!existsSync(join(root, mirror))) die(`item ${item.name} file has no mirror: ${f.path} → ${mirror}`);
    return {
      source: f.path,
      mirror,
      target: f.target,
      sourceSha: sha(join(root, f.path)),
      mirrorSha: sha(join(root, mirror)),
    };
  });
  manifestItems.push({ itemName: item.name, type: item.type, ...(item.type === 'registry:ui' ? { canonicalMain: canonicalMain[item.name] } : {}), files });
}

// ── completeness: every file on both sides is classified ───────────
// site-only DIRECTORY prefixes under apps/www/src/lib (whole trees)
const SITE_ONLY_PREFIXES = [
  'apps/www/src/lib/blueprints/', // blueprint scene stage (site-only)
  'apps/www/src/lib/components/', // site-composed components
  'apps/www/src/lib/__probe__/', // P0 scratch (removed when the probe retires)
];

const classified = new Set([
  ...manifestItems.flatMap((i) => i.files.flatMap((f) => [f.source, f.mirror])),
  ...SITE_ONLY.map((e) => e.path),
  ...REGISTRY_ONLY.map((e) => e.path),
  ...UNREFERENCED_LIB.flatMap((e) => {
    const mirror = e.path
      .replace(/^registry\/files\/ui\//, 'apps/www/src/lib/ui/')
      .replace(/^registry\/files\/(?:lib|theme)\//, 'apps/www/src/lib/');
    return [e.path, mirror];
  }),
]);

const registryFiles = walk(join(root, 'registry/files')).map((p) => `registry/files/${p}`);
const mirrorFiles = walk(join(root, 'apps/www/src/lib')).map((p) => `apps/www/src/lib/${p}`);

const stray = [];
for (const p of registryFiles) if (!classified.has(p) && !REGISTRY_ONLY.some((e) => e.path === p) && !UNREFERENCED_LIB.some((e) => e.path === p)) stray.push(p);
for (const p of mirrorFiles) if (!classified.has(p) && !SITE_ONLY_PREFIXES.some((pre) => p.startsWith(pre))) stray.push(p);
if (stray.length) die(`unclassified file(s) — classify or fix:\n  ${stray.join('\n  ')}`);

// ── hash drift (same-source law) ───────────────────────────────────
const drifted = manifestItems.flatMap((i) => i.files.filter((f) => f.sourceSha !== f.mirrorSha).map((f) => `${i.itemName}: ${f.source}`));
if (drifted.length) die(`mirror drift (source ≠ mirror):\n  ${drifted.join('\n  ')}`);

const manifest = {
  $schema: './mirror-manifest.schema.json',
  version: 1,
  generatedAt: new Date().toISOString(),
  canonicalMain,
  items: manifestItems,
  siteOnly: SITE_ONLY,
  registryOnly: REGISTRY_ONLY,
  unreferencedLib: UNREFERENCED_LIB,
};

const outPath = join(root, 'apps/www/mirror-manifest.json');
if (checkMode) {
  const committed = readFileSync(outPath, 'utf8');
  const fresh = JSON.stringify(manifest, null, 2) + '\n';
  const committedNoTime = JSON.parse(committed);
  const freshNoTime = { ...manifest, generatedAt: committedNoTime.generatedAt };
  if (JSON.stringify(committedNoTime, null, 2) !== JSON.stringify(freshNoTime, null, 2)) {
    die('committed manifest is stale — run: node scripts/gen-mirror-manifest.mjs');
  }
  console.log('[mirror-manifest] check GREEN: trees match the committed manifest (paths + hashes)');
} else {
  writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`[mirror-manifest] wrote ${outPath}: ${manifestItems.length} items, ${manifestItems.reduce((n, i) => n + i.files.length, 0)} file pairs`);
}
