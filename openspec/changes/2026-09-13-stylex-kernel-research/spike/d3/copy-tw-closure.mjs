#!/usr/bin/env node
// copy-tw-closure.mjs — D3 fixture generator: copies the transitive file
// closure of the 8 frozen TW families from registry/files into
// spike/d3/tw-baseline/src, rewriting `$lib/…` and `@ui/…` specifiers to
// RELATIVE paths (the fixture has no alias). Excludes the shiki engine
// (code-card highlight seam is trimmed separately — disclosed in
// research/d3-consumer.md). Write-then-verify: every emitted file is
// re-read and checked for residual `$lib/`/`@ui/` specifiers.
import fs from 'node:fs';
import path from 'node:path';

const REG = '/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex/registry/files';
const OUT =
  '/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex/openspec/changes/2026-09-13-stylex-kernel-research/spike/d3/tw-baseline/src';
const TRIM = new Set(['lib/highlight/shiki.ts', 'lib/shiki.ts']); // shiki engine: payload trim

function resolveFile(p) {
  for (const c of [
    p,
    p + '.ts',
    p + '.js',
    p + '.svelte',
    p + '.svelte.ts',
    p + '.css',
    path.join(p, 'index.ts'),
    path.join(p, 'index.js'),
  ]) {
    if (fs.existsSync(path.join(REG, c)) && fs.statSync(path.join(REG, c)).isFile()) return c;
  }
  return null;
}
function resolve(spec) {
  // registry layout: '$lib/<rest>' maps to www's src/lib mirror — in
  // registry/files that is EITHER 'lib/<rest>' (lib deps) OR '<rest>'
  // (the ui/ tree lives at registry/files/ui, mirrored at src/lib/ui)
  const rest = spec.startsWith('@ui/') ? 'ui/' + spec.slice(4) : spec.replace(/^\$lib\//, '');
  for (const cand of [rest, path.join('lib', rest)]) {
    const r = resolveFile(cand);
    if (r) return r;
  }
  return null;
}
function resolveRel(from, spec) {
  return spec.startsWith('.') ? resolveFile(path.join(path.dirname(from), spec)) : null;
}
const seen = new Set();
function walk(f) {
  if (seen.has(f) || TRIM.has(f)) return;
  seen.add(f);
  const src = fs.readFileSync(path.join(REG, f), 'utf8');
  const re = /from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src))) {
    const spec = m[1] || m[2];
    if (!spec) continue;
    const r = resolveRel(f, spec) ?? resolve(spec);
    if (r) walk(r);
  }
}
const fams = [
  'ui/press-button',
  'ui/range',
  'ui/popover',
  'ui/icon',
  'ui/code-card',
  'ui/prose',
  'ui/toggle',
  'ui/separator',
  'ui/button-group/button-variant-scope.svelte',
];
for (const f of fams) {
  const rf = resolveFile(f);
  if (!rf) throw new Error('missing family root ' + f);
  walk(rf);
}

let n = 0;
for (const f of [...seen].sort()) {
  let src = fs.readFileSync(path.join(REG, f), 'utf8');
  let rewrites = 0;
  src = src.replace(/(from\s+|import\s+)(['"])((?:\$lib|@ui)\/[^'"]+)\2/g, (full, pre, q, spec) => {
    const target = resolve(spec);
    if (!target || TRIM.has(target)) return full; // trimmed edge stays (code-card edit removes it)
    const rel = path.relative(path.dirname(f), target).replaceAll('\\', '/');
    rewrites++;
    return `${pre}${q}${rel}${q}`;
  });
  const dest = path.join(OUT, f);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, src);
  // verify: no residual alias specifiers except the shiki TRIM edge
  const back = fs.readFileSync(dest, 'utf8');
  const residual = back.match(/from\s+['"](?:\$lib|@ui)\/[^'"]+/g) ?? [];
  const bad = residual.filter((s) => !s.includes('$lib/highlight/shiki') && !s.includes('@ui/press-button.svelte')); // the latter is a doc-comment usage example (press-button.svelte:38)
  if (bad.length) throw new Error(`residual alias in ${f}: ${bad.join(', ')}`);
  n++;
  console.log(`copied ${f} (${rewrites} alias rewrites)`);
}
// theme sheets (byte-copy, fontsource trim applied by marker edit after)
fs.mkdirSync(path.join(OUT, 'lib'), { recursive: true });
for (const sheet of ['theme/jixoai.css', 'theme/jx-pure.css']) {
  fs.copyFileSync(path.join(REG, sheet), path.join(OUT, 'lib', path.basename(sheet)));
  console.log(`copied ${sheet} -> src/lib/${path.basename(sheet)}`);
}
console.log(`DONE ${n} closure files + 2 theme sheets`);
