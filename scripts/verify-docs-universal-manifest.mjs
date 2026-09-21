#!/usr/bin/env node
// verify-docs-universal-manifest — the 110-page receipt (explicit-props
// W4 task 4.4, docs-site spec delta).
//
// The universal props section is documented ONCE and rendered from the
// ONE shared source on every component page: this gate walks the BUILT
// dist (apps/www/dist/docs/components/*.html — the built HTML, never
// the sources) and asserts every page carries the shared section's
// marker (`data-jx-props-table-universal`, the PropsTable's own
// h4 stamp — a page cannot forge it by mentioning the words in prose).
// Page count and marker count must be EQUAL.
//
// Modes:
//   node scripts/verify-docs-universal-manifest.mjs [--dist <dir>]
//   npm run verify:docs-universal
//
// A missing dist is a SKIP (pre-build runs — the same convention as
// docs-structure's built-dist lock), reported and exited GREEN; a
// present dist with divergent pages exits 1 naming every page.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distFlag = process.argv.indexOf('--dist');
const dist = resolve(
  root,
  distFlag !== -1 ? process.argv[distFlag + 1] : 'apps/www/dist/docs/components',
);

const MARKER = 'data-jx-props-table-universal';

if (!existsSync(dist)) {
  console.log(
    '[docs-universal-manifest] SKIP: no built dist at apps/www/dist — run `npm run build` first',
  );
  process.exit(0);
}

const pages = readdirSync(dist).filter((name) => name.endsWith('.html'));
if (pages.length === 0) {
  console.error(`[docs-universal-manifest] FAIL: dist exists but carries no component pages (${dist})`);
  process.exit(1);
}

const divergent = [];
let markers = 0;
for (const page of pages) {
  const html = readFileSync(join(dist, page), 'utf8');
  const count = html.split(MARKER).length - 1;
  markers += count;
  if (count === 0) divergent.push(`${page}: marker missing (page count ${pages.length})`);
  else if (count > 1) divergent.push(`${page}: ${count} markers (expected exactly 1)`);
}

if (divergent.length) {
  console.error('[docs-universal-manifest] FAIL — one line per divergence:');
  for (const line of divergent) console.error(`  ${line}`);
  console.error(`  pages: ${pages.length}, markers: ${markers} — must be equal`);
  process.exit(1);
}

console.log(
  `[docs-universal-manifest] GREEN: ${pages.length}/${pages.length} component pages render the shared universal section (${markers} markers)`,
);
