#!/usr/bin/env node
/**
 * Spin set generator — the ROOT-SCRIPT adapter (spin-ora-svg-lane C4,
 * design §5/§6).
 *
 * Intent list:
 * 1. single writer — `npm run gen:spins` (THIS script) is the ONLY
 *    in-repo writer of the canonical artifact
 *    registry/files/lib/spin-set.gen.ts; the www copy arrives through
 *    the mirror tooling, never through this script.
 * 2. thin by law — every piece of logic (the vendored blocks-wave
 *    manifest, source resolution, RAW safety, serialization) lives in
 *    @jixoai/ui-vite-plugin's spinners face; this file only drives its
 *    root-script adapter. PREREQUISITE: packages/vite-plugin must be
 *    BUILT (dist/ is imported — `npm run build` inside the package
 *    after any plugin change, or this script serves stale logic).
 * 3. freshness gate — `--check` regenerates in memory and exits 1 when
 *    the committed artifact differs, so CI catches post-edit drift
 *    (no vite, no dev server — design §5).
 *
 * Spinners carry NO scanner lane (design §5), so the script stands
 * alone — no scan root, unlike gen-icon-set.mjs.
 *
 * Usage: npm run gen:spins          write the canonical artifact
 *        npm run verify:spins       freshness gate (exit 1 on drift)
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSpinSetArtifact, writeSpinSetArtifact } from '../packages/vite-plugin/dist/spinners.js';
import { magecdnSpinners } from '../packages/vite-plugin/dist/spinners/magecdn.js';
import { svgLoadersSpinners } from '../packages/vite-plugin/dist/spinners/svg-loaders.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// The canonical config: the built-in blocks-wave manifest PLUS a curated
// few from the two vendored loader packs (review R2 dogfood — the docs
// page demos the packs through the real artifact). MUST stay equivalent
// to the app configs' spinners option (apps/www/vite.config.ts AND
// registry/vite.config.ts pick the SAME names — the icons
// CONFIG-PARITY law).
const pick = (pack, names) => Object.fromEntries(names.map((name) => [name, pack[name]]));
const SPINNERS_OPTIONS = {
  spinners: {
    ...pick(magecdnSpinners, ['3-dots-bounce', 'bars-scale', 'clock']),
    ...pick(svgLoadersSpinners, ['tail-spin', 'spinning-circles']),
  },
};
const TARGET = resolve(repoRoot, 'registry/files/lib/spin-set.gen.ts');
const REL_TARGET = 'registry/files/lib/spin-set.gen.ts';

if (process.argv.includes('--check')) {
  const { fresh, report } = await checkSpinSetArtifact(SPINNERS_OPTIONS, TARGET);
  for (const warning of report.warnings) console.warn(warning);
  if (!fresh) {
    console.error(`stale: ${REL_TARGET} differs from the generator output — run \`npm run gen:spins\``);
    process.exit(1);
  }
  console.log(`fresh: ${REL_TARGET} matches the generator (${report.spinnerCount} spinner(s))`);
} else {
  const { changed, report } = await writeSpinSetArtifact(SPINNERS_OPTIONS, TARGET);
  for (const warning of report.warnings) console.warn(warning);
  console.log(`${changed ? 'wrote' : 'unchanged'}: ${REL_TARGET} (${report.spinnerCount} spinner(s))`);
}
