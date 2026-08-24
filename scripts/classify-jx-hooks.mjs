#!/usr/bin/env node
// jx-* class classifier (data-jx-hooks change inventory, 2026-08-25).
//
// Categories:
//   DEFINED  — the selector appears in some authored css (residue,
//              jx-pure, site sheets) → part of the cascade law, STAYS
//              a class (or is Tier-2 frozen vocabulary).
//   HOOK     — zero css definitions anywhere; pure semantic anchor →
//              candidate for data-jx-* conversion.
//
// Also inventories REFERENCE SITES for every HOOK (markup usage,
// site src, tests, scripts, docs routes) so the change's blast radius
// is explicit.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;

const walk = (dir, exts, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.svelte-kit', 'dist', '.git'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
};

// every authored css in the repo (registry + site)
const cssFiles = [
  ...walk(join(root, 'registry/files'), ['.css']),
  ...walk(join(root, 'apps/www/src'), ['.css']),
];
const cssText = cssFiles.map((f) => readFileSync(f, 'utf8')).join('\n');

// classes referenced by css selectors (crude but effective: any .jx-x token)
const defined = new Set();
for (const m of cssText.matchAll(/\.jx-[a-z0-9-]+/g)) defined.add(m[0].slice(1));

// every jx-* class used in component markup + site + tests + scripts
const svelteAndTs = [
  ...walk(join(root, 'registry/files'), ['.svelte', '.ts']),
  ...walk(join(root, 'apps/www/src'), ['.svelte', '.ts']),
  ...walk(join(root, 'apps/www/test'), ['.svelte', '.ts']),
  ...walk(join(root, 'scripts'), ['.mjs']),
];
const used = new Map(); // class → [files]
for (const f of svelteAndTs) {
  const t = readFileSync(f, 'utf8');
  for (const m of t.matchAll(/\bjx-[a-z0-9-]+/g)) {
    const cls = m[0];
    // skip css selector usages (lines where preceded by a dot in css-ish context)
    if (!used.has(cls)) used.set(cls, []);
    used.get(cls).push(f.replace(root, ''));
  }
}

const hooks = [...used.keys()].filter((c) => !defined.has(c)).sort();
const definedUsed = [...used.keys()].filter((c) => defined.has(c)).sort();

// hook reference sites OUTSIDE their own component folder (the risky ones)
const risky = {};
for (const h of hooks) {
  const sites = [...new Set(used.get(h))];
  const home = sites.filter((s) => s.includes(`/ui/${h.replace(/-[^-]+$/, '')}/`) || s.includes(`/${h}/`));
  const foreign = sites.filter((s) => !home.includes(s));
  if (foreign.length) risky[h] = foreign;
}

console.log(`css-DEFINED jx-* selectors: ${defined.size}`);
console.log(`classes USED in markup/code: ${used.size}`);
console.log(`  └ DEFINED (stay classes): ${definedUsed.length}`);
console.log(`  └ HOOK-ONLY (convert):    ${hooks.length}`);
console.log(`\nHOOKS with foreign reference sites (${Object.keys(risky).length}):`);
for (const [h, sites] of Object.entries(risky)) console.log(`  ${h} ← ${sites.slice(0, 4).join(', ')}${sites.length > 4 ? ` +${sites.length - 4}` : ''}`);
console.log('\nFULL HOOK LIST:');
console.log(hooks.join(' '));
