/**
 * Build CLI — generate the three projections into the theme sheets,
 * mirror-sync to apps/www, and refresh the mirror manifest.
 *
 * Run: npx tsx src/build.ts          (generate + sync + manifest)
 *      npx tsx src/build.ts --check  (verify committed sheets are fresh)
 */
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { run, repoRoot, generateAll } from './generate';
import { allLaws } from './laws/all';

const checkMode = process.argv.includes('--check');

if (checkMode) {
  // freshness: the committed sheet content between markers must equal
  // a fresh generation from the current law sources
  const { utilitySheet, faceSheet, aliasSheet } = generateAll(allLaws);
  const jixoai = readFileSync(resolve(repoRoot, 'registry/files/theme/jixoai.css'), 'utf8');
  const jxPure = readFileSync(resolve(repoRoot, 'registry/files/theme/jx-pure.css'), 'utf8');
  const slotOf = (css: string, slot: string) => {
    const bMarker = `/* @jixoai/css-laws:begin:${slot}`;
    const eMarker = `/* @jixoai/css-laws:end:${slot}`;
    const nB = css.split(bMarker).length - 1;
    const nE = css.split(eMarker).length - 1;
    if (nB !== 1 || nE !== 1) {
      throw new Error(`slot ${slot}: expected exactly one begin/end pair (found ${nB}/${nE}) — run: npx tsx src/build.ts`);
    }
    const b = css.indexOf(bMarker);
    const e = css.indexOf(eMarker);
    if (e < b) throw new Error(`slot ${slot}: end precedes begin — corrupted sheet`);
    return css.slice(b, e);
  };
  const expectUtility = `/* @jixoai/css-laws:begin:jx-html-utility — GENERATED, do not edit (source: packages/css-laws/src/laws) */\n${utilitySheet}\n`;
  if (slotOf(jixoai, 'jx-html-utility').trim() !== expectUtility.trim()) {
    console.error('[css-laws] jixoai.css generated slot is STALE — run: npx tsx src/build.ts');
    process.exit(1);
  }
  const expectFace = `/* @jixoai/css-laws:begin:jx-html-face — GENERATED, do not edit (source: packages/css-laws/src/laws) */\n${faceSheet}\n`;
  const expectAlias = `/* @jixoai/css-laws:begin:jx-html-alias — GENERATED, do not edit (source: packages/css-laws/src/laws) */\n${aliasSheet}\n`;
  if (slotOf(jxPure, 'jx-html-face').trim() !== expectFace.trim()) {
    console.error('[css-laws] jx-pure.css face slot is STALE — run: npx tsx src/build.ts');
    process.exit(1);
  }
  if (slotOf(jxPure, 'jx-html-alias').trim() !== expectAlias.trim()) {
    console.error('[css-laws] jx-pure.css alias slot is STALE — run: npx tsx src/build.ts');
    process.exit(1);
  }
  console.log('[css-laws] check GREEN: committed slots match the law sources');
  process.exit(0);
}

// 1. write the registry sheets
run();

// 2. mirror-sync to apps/www (byte-identical law: registry → mirror)
copyFileSync(
  resolve(repoRoot, 'registry/files/theme/jixoai.css'),
  resolve(repoRoot, 'apps/www/src/lib/jixoai.css'),
);
copyFileSync(
  resolve(repoRoot, 'registry/files/theme/jx-pure.css'),
  resolve(repoRoot, 'apps/www/src/lib/jx-pure.css'),
);
console.log('✓ mirrors synced (apps/www/src/lib/{jixoai,jx-pure}.css)');

// 3. refresh the mirror manifest (paths + hashes)
execFileSync('node', [resolve(repoRoot, 'scripts/gen-mirror-manifest.mjs')], {
  stdio: 'inherit',
});
console.log('✓ mirror manifest regenerated');
