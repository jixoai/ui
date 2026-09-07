#!/usr/bin/env node
/**
 * Icon set generator — the ROOT-SCRIPT adapter (icon-component-pipeline
 * B2/B3, design §1/§5/§6).
 *
 * Intent list:
 * 1. single writer — `npm run gen:icons` (THIS script) is the ONLY
 *    in-repo writer of the canonical artifact
 *    registry/files/lib/icon-set.gen.ts; the www copy arrives through
 *    the mirror tooling, never through this script.
 * 2. thin by law — every piece of logic (the 38-built-in manifest,
 *    source resolution, svgo, safety, packing, serialization) lives in
 *    @jixoai/vite-plugin's icons library face; this file only drives
 *    its root-script adapter. PREREQUISITE: packages/vite-plugin must
 *    be BUILT (dist/ is imported — `npm run build` inside the package
 *    after any plugin change, or this script serves stale logic).
 * 3. freshness gate — `--check` regenerates in memory and exits 1 when
 *    the committed artifact differs, so CI catches post-edit drift
 *    (no vite, no dev server — design §5).
 *
 * Usage: npm run gen:icons          write the canonical artifact
 *        npm run verify:icons       freshness gate (exit 1 on drift)
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkIconLibraryArtifact, writeIconLibraryArtifact } from '../packages/vite-plugin/dist/icons.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// The canonical config: the 38 built-ins under default packing (auto
// chunking, inline first chunk, 20480-byte budget, svgo on) PLUS the
// preset dogfood (2026-09-07, Owner direction: the docs site ITSELF
// exercises the preset + scanner lanes so its source is the reference
// an AI can read). MUST stay byte-equivalent to the www app config's
// library face (apps/www/vite.config.ts) — same generator, same
// inputs, same scanned set (SCAN_ROOT below = the vite build's walk
// root), so the dev drift-warns and the committed artifact never
// diverge.
const LIBRARY_OPTIONS = { includeDefaults: true, presets: ['material', 'phosphor', 'remix'] };
// The scanner's project root: the www app's tree — exactly what the
// vite buildStart walk sees when building apps/www (the docs pages'
// own <Icon name="md:…"> literals are the collected set).
const SCAN_ROOT = resolve(repoRoot, 'apps/www');
const TARGET = resolve(repoRoot, 'registry/files/lib/icon-set.gen.ts');
const REL_TARGET = 'registry/files/lib/icon-set.gen.ts';

if (process.argv.includes('--check')) {
  const { fresh, report } = await checkIconLibraryArtifact(LIBRARY_OPTIONS, TARGET, undefined, SCAN_ROOT);
  for (const warning of report.warnings) console.warn(warning);
  if (!fresh) {
    console.error(`stale: ${REL_TARGET} differs from the generator output — run \`npm run gen:icons\``);
    process.exit(1);
  }
  console.log(`fresh: ${REL_TARGET} matches the generator (${report.iconCount} icons, ${report.chunkCount} chunk(s))`);
} else {
  const { changed, report } = await writeIconLibraryArtifact(LIBRARY_OPTIONS, TARGET, undefined, SCAN_ROOT);
  for (const warning of report.warnings) console.warn(warning);
  console.log(
    `${changed ? 'wrote' : 'unchanged'}: ${REL_TARGET} (${report.iconCount} icons, ${report.chunkCount} chunk(s), ${report.lazyChunks.length} lazy)`,
  );
}
