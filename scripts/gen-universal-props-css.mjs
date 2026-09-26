#!/usr/bin/env node
/**
 * universal-props.css generator + drift detector (explicit-props W2
 * tasks 2.1/2.2/2.7, design §12; the registry spec: "universal-props.css
 * is GENERATED from the schema").
 *
 * Reads the ONE shared artifact (apps/www/src/lib/universal-props.schema.ts
 * — transpiled and imported as a data module, the component-metadata-gen
 * precedent; the generator never re-declares the rows), runs the plugin
 * layer's generator (packages/vite-plugin/src/universal-props — via the
 * BUILT dist, the gen-stylex-payload precedent: node-side imports read
 * dist, never src), and writes the byte-identical mirror pair
 *   apps/www/src/lib/universal-props.css
 *   registry/files/lib/universal-props.css
 *
 * Modes:
 *   node scripts/gen-universal-props-css.mjs          # write both files
 *   node scripts/gen-universal-props-css.mjs --check  # verify trees vs disk
 *
 * npm scripts: gen:universal-props / verify:universal-props.
 */
import ts from 'typescript';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { generateUniversalPropsCss } from '../packages/vite-plugin/dist/universal-props.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const checkMode = process.argv.includes('--check');
const die = (msg) => {
  console.error(`[gen-universal-props-css] ${msg}`);
  process.exit(1);
};

const SCHEMA_PATH = join(root, 'apps/www/src/lib/universal-props.schema.ts');
const OUT_PATHS = [
  join(root, 'apps/www/src/lib/universal-props.css'),
  join(root, 'registry/files/lib/universal-props.css'),
];

// ── the schema artifact → generator input (the metadata-gen precedent) ──
if (!existsSync(SCHEMA_PATH)) die(`schema artifact missing: ${SCHEMA_PATH}`);
const schemaJs = ts.transpileModule(readFileSync(SCHEMA_PATH, 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const schemaModule = await import(
  'data:text/javascript;base64,' + Buffer.from(schemaJs).toString('base64')
);
const UNIVERSAL_AXES = schemaModule.UNIVERSAL_AXES;
if (!Array.isArray(UNIVERSAL_AXES) || UNIVERSAL_AXES.length !== 8) {
  die(`universal-props.schema.ts did not yield the eight-axis table (got ${typeof UNIVERSAL_AXES})`);
}

const css = generateUniversalPropsCss({ axes: UNIVERSAL_AXES });
if (!css.includes('--jx-radius-factor-squircle') || !css.includes('@supports (corner-shape: bevel)')) {
  die('generator output is missing the §14 ladder — refusing to write a broken sheet');
}

if (checkMode) {
  const drifted = OUT_PATHS.filter((p) => !existsSync(p) || readFileSync(p, 'utf8') !== css);
  if (drifted.length > 0) {
    die(`drifted (run: npm run gen:universal-props):\n  ${drifted.join('\n  ')}`);
  }
  const pairSha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 12);
  console.log(
    `[gen-universal-props-css] check GREEN: both trees match the generator (sha ${pairSha(OUT_PATHS[0])})`,
  );
} else {
  for (const p of OUT_PATHS) writeFileSync(p, css, 'utf8');
  console.log(`[gen-universal-props-css] wrote ${OUT_PATHS.length} mirror files (${css.length} bytes each)`);
}
