#!/usr/bin/env node
/**
 * Four-budget gate (ui-plugin-followup A3, 2026-08-28; consumer budget
 * split into vite/icons entries by merge-alignment C3/A1, 2026-08-29).
 *
 *   B-source    gzip(registry/files/theme/jixoai.css)
 *             + gzip(registry/files/theme/jx-pure.css)
 *               — the weight of the source sheets a registry consumer
 *                 pulls in (the standard layer + the face).
 *
 *   B-face      gzip of the jx-pure-related rules extracted from the
 *               BUILT site CSS (apps/www dist) — the face compiles
 *               behind the consumer's tailwind entry, so this is the
 *               canonical-pipeline compiled footprint. Extraction =
 *               every rule (inside @media/@supports/… wrappers) whose
 *               selector mentions `.jx-pure` or any `.jx-*` class
 *               token defined in the jx-pure.css source. That is a
 *               deliberate SUPERSET (component CSS reusing face
 *               vocabulary is attributed to the face) — fine for a
 *               regression gate, which only needs consistency.
 *
 *   B-consumer-vite  gzip(packages/vite-plugin/dist/index.js) — the
 *                    umbrella entry (ghostty feature + icons feature
 *                    wiring; provider code stays in ./icons chunks).
 *   B-consumer-icons gzip(packages/vite-plugin/dist/icons.js) — the
 *                    icon-system sub-entry barrel.
 *
 *   (merge-alignment C3/A1, 2026-08-29: the single B-consumer budget
 *   tracked the now-deleted @jixoai/ui-plugin dist. It is replaced by
 *   the two @jixoai/vite-plugin entry budgets above; their aggregate is
 *   printed for observation only — never gated.)
 *
 * Threshold = baseline × 1.05. A measurement collapsing to <60% of
 * baseline FAILS too — that means the gate broke (renamed vocabulary,
 * moved files), not that the CSS got smaller.
 *
 * Usage (from repo root):
 *   node scripts/verify-budgets.mjs                  # measure + gate
 *   node scripts/verify-budgets.mjs --update         # print fresh baselines
 *   node scripts/verify-budgets.mjs --build-site     # force vite build first
 *   node scripts/verify-budgets.mjs --build-package  # force tsdown build first
 *
 * Missing build outputs are built automatically (site: `vite build` in
 * apps/www — the canonical pipeline; package: `npm run build` in
 * packages/vite-plugin). Pass the --build-* flags to force a rebuild on
 * top of existing artifacts.
 */

import { spawnSync } from 'node:child_process';
import {
  existsSync,
  readdirSync,
  readFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

// ── baselines (re-recorded 2026-08-28 for the css-laws V3 cutover;
// regenerate with --update) ─────────────────────────────────────────
// The +17% source / +23% face growth is the DELIBERATE cost of the
// single-declaration-source architecture: law composition flattens
// in TS (textarea/select/radio inline their base law's declarations
// — the @apply chain is retired), and the Tier-2 alias classes carry
// full generated rule-sets where they were 3-line @apply rules.
// Rendering identity is proven by verify:parity (305 comparisons +
// 19 DOM-AST assertions GREEN before and after the cutover).

const BASELINES = {
  // re-recorded 2026-09-02 (range orientation + ruler round): B-face
  // 11405->12519 (+9.8%) — the range law gains the [orient="vertical"]
  // face (writing-mode branch, width-axis geometry tokens, the
  // block-axis fill and its rtl guard) projected across every mounting
  // surface, and the ruler's RangeTick strips carry per-scale
  // repeating-gradient faces. B-source unchanged (34850 measured under
  // the old ceiling). Justified growth: law + component css and their
  // documentation, zero utility-layer leakage (B-consumer rows
  // unchanged).
  'B-source': 34353,
  'B-face': 12519,
  'B-consumer-vite': 1695,
  'B-consumer-icons': 253,
};
const THRESHOLD_FACTOR = 1.05;
const COLLAPSE_FACTOR = 0.6;

// ── helpers ────────────────────────────────────────────────────────

const die = (message) => {
  console.error(`[budgets] ${message}`);
  process.exit(1);
};

/** deterministic gzip byte count (node zlib default level, pinned) */
const gzipSize = (bytes) => gzipSync(bytes, { level: 6 }).length;

const gzipOfFile = (path) => gzipSize(readFileSync(path));

// ── B-source ───────────────────────────────────────────────────────

const THEME_SHEETS = [
  'registry/files/theme/jixoai.css',
  'registry/files/theme/jx-pure.css',
];

function measureSource() {
  return THEME_SHEETS.reduce((sum, path) => sum + gzipOfFile(join(root, path)), 0);
}

// ── B-face: extract face rules from the built site CSS ─────────────

/**
 * brace-aware rule walker over (minified) CSS. pushes {context, prelude,
 * body} for every style rule; @media/@supports/@layer/@container/@scope
 * blocks recurse and contribute their prelude to the context (other
 * at-rules — @font-face/@keyframes/@property — are skipped: the face
 * defines no such blocks).
 */
function parseRules(css, context, out) {
  let i = 0;
  const text = css.trim();
  while (i < text.length) {
    const braceStart = text.indexOf('{', i);
    if (braceStart < 0) break;
    const prelude = text.slice(i, braceStart).trim();
    let depth = 1;
    let j = braceStart + 1;
    while (j < text.length && depth > 0) {
      const c = text[j];
      if (c === '{') depth += 1;
      else if (c === '}') depth -= 1;
      j += 1;
    }
    const body = text.slice(braceStart + 1, j - 1);
    if (/^@(media|supports|layer|container|scope)\b/i.test(prelude)) {
      parseRules(body, `${context}${prelude}{`, out);
    } else if (!prelude.startsWith('@')) {
      out.push({ context, prelude, body });
    }
    i = j;
  }
}

/** class vocabulary defined by the face source (".jx-…" tokens) */
function faceVocabulary() {
  const source = readFileSync(join(root, 'registry/files/theme/jx-pure.css'), 'utf8');
  return new Set([...source.matchAll(/\.(jx-[a-z0-9-]+)/g)].map((m) => m[1]));
}

const siteDist = join(root, 'apps/www', 'dist');

function buildSite() {
  const require = createRequire(import.meta.url);
  const wwwDir = join(root, 'apps/www');
  const packageDir = dirname(
    require.resolve('vite/package.json', { paths: [wwwDir] }),
  );
  const viteBin = join(packageDir, 'bin', 'vite.js');
  if (!existsSync(viteBin)) die('cannot locate the vite binary in apps/www');
  console.log('[budgets] building apps/www (vite build)…');
  const result = spawnSync(process.execPath, [viteBin, 'build'], {
    cwd: wwwDir,
    stdio: 'inherit',
  });
  if (result.status !== 0) die('apps/www build failed');
}

function collectBuiltCss() {
  const assetsDir = join(siteDist, '_app', 'immutable', 'assets');
  if (!existsSync(assetsDir)) return [];
  return readdirSync(assetsDir)
    .filter((name) => name.endsWith('.css'))
    .map((name) => readFileSync(join(assetsDir, name), 'utf8'));
}

function measureFace() {
  const vocab = faceVocabulary();
  const isFaceRule = (prelude) =>
    prelude.includes('jx-pure') ||
    [...vocab].some((token) => prelude.includes(`.${token}`));

  const rules = [];
  for (const css of collectBuiltCss()) parseRules(css, '', rules);
  const faceRules = rules.filter((rule) => isFaceRule(rule.prelude));

  // vite may duplicate a rule across chunks — dedupe on full identity
  const faceCss = [
    ...new Set(faceRules.map((rule) => `${rule.context}${rule.prelude}{${rule.body}}`)),
  ].join('');
  return {
    bytes: gzipSize(Buffer.from(faceCss, 'utf8')),
    ruleCount: new Set(faceRules.map((rule) => `${rule.context}${rule.prelude}`)).size,
  };
}

// ── B-consumer-vite / B-consumer-icons ─────────────────────────────

const vitePluginDir = join(root, 'packages/vite-plugin');
const viteDistEntry = join(vitePluginDir, 'dist', 'index.js');
const iconsDistEntry = join(vitePluginDir, 'dist', 'icons.js');

function buildPackage() {
  console.log('[budgets] building packages/vite-plugin (tsdown)…');
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: vitePluginDir,
    stdio: 'inherit',
  });
  if (result.status !== 0) die('packages/vite-plugin build failed');
}

// ── gate ───────────────────────────────────────────────────────────

const flags = new Set(process.argv.slice(2));
if (flags.has('--build-site')) buildSite();
else if (collectBuiltCss().length === 0) buildSite();

if (flags.has('--build-package')) buildPackage();
else if (!existsSync(viteDistEntry) || !existsSync(iconsDistEntry)) buildPackage();

for (const path of THEME_SHEETS) {
  if (!existsSync(join(root, path))) die(`missing source sheet: ${path}`);
}

const face = measureFace();
const measured = {
  'B-source': measureSource(),
  'B-face': face.bytes,
  'B-consumer-vite': gzipOfFile(viteDistEntry),
  'B-consumer-icons': gzipOfFile(iconsDistEntry),
};

if (flags.has('--update')) {
  console.log('fresh baselines (paste into BASELINES in scripts/verify-budgets.mjs):');
  console.log(JSON.stringify(measured, null, 2));
  process.exit(0);
}

const rows = [];
let failed = false;
for (const [name, baseline] of Object.entries(BASELINES)) {
  const current = measured[name];
  const threshold = Math.round(baseline * THRESHOLD_FACTOR);
  const collapseFloor = Math.round(baseline * COLLAPSE_FACTOR);
  let status;
  if (current > threshold) {
    status = 'FAIL';
    failed = true;
  } else if (current < collapseFloor) {
    status = 'FAIL (collapsed measurement — gate broken?)';
    failed = true;
  } else {
    status = 'PASS';
  }
  rows.push({ name, baseline, current, threshold, status });
}

console.log('budget               baseline   current  threshold(+5%)  status');
for (const row of rows) {
  console.log(
    `${row.name.padEnd(20)} ${String(row.baseline).padStart(8)} ${String(row.current).padStart(9)} ${String(row.threshold).padStart(14)}  ${row.status}`,
  );
}
console.log(
  `[budgets] B-face extracted ${face.ruleCount} face rules from apps/www/dist`,
);
console.log(
  `[budgets] aggregate (observational, NOT gated): B-consumer-vite + B-consumer-icons = ` +
    `${measured['B-consumer-vite'] + measured['B-consumer-icons']}`,
);

if (failed) process.exit(1);
console.log('[budgets] all four budgets within threshold');
