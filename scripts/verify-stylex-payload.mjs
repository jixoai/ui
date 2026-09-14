#!/usr/bin/env node
// verify-stylex-payload — the same-build payload consistency gate
// (stylex-kernel-phase0 P0.4; spec delta: css-architecture ADDED
// "same-build payload consistency"; design §3).
//
// What the gate proves, in the spec's failure-mode order:
//
//   1. missing-rule  — every class-constant string in a classModule
//      appears as an (escaped) selector in that item's css.
//   2. cross-build   — every artifact carries the manifest's buildId
//      stamp (classModule header / css trailing comment) AND the
//      buildId recomputed from the CURRENT sources + pinned versions
//      matches — two stamps, or a stale formula hash, is a mix.
//   3. manual edit   — every artifact's sha256 equals the manifest's
//      recorded hash (and the source snapshot's).
//   4. same-build emission — the WHOLE payload re-derived through the
//      compile core (scripts/lib/stylex-payload.mjs — the generator's
//      own law) reproduces every artifact byte-for-byte.
//
// Plus the consumer spot-compile (a REAL vite build, not a string
// check): a throwaway project with ZERO styling-engine tooling imports
// a payload classModule + item css and builds green — F11's "consumers
// owe no @stylexjs/*" proven at the bundler, with the F9 statement and
// atom rules landing in the built css.
//
// Plus the three ALWAYS-ON planted-defect self-tests (the teeth
// receipt, one per failure mode): each plants its defect in a sandbox
// copy of the payload tree + a consistently-updated manifest — so ONLY
// the mode's own detector can catch it — and asserts the gate FAILS
// naming the item and the mode. The popover-probe negative-control
// precedent: teeth proven every run, not once.
//
// Usage (from repo root): node scripts/verify-stylex-payload.mjs

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  artifactBytes,
  artifactPaths,
  classConstantsOf,
  derivePayload,
  payloadRoot,
  sha256,
} from './lib/stylex-payload.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

// the F9 statement, read from the BUILT plugin dist (never re-typed)
const { STYLEX_LAYER_STATEMENT } = await import(
  pathToFileURL(join(root, 'packages/vite-plugin/dist/stylex/layer-law.js')).href
);

const die = (msg) => {
  console.error(`\n✗ verify:stylex-payload FAILED — ${msg}`);
  process.exit(1);
};

// ── the payload-tree checks (shared by main + the planted self-tests) ──

/**
 * Run failure-mode checks 1–4 of one payload tree against one manifest
 * object. Returns { failures: [{mode, item, detail}] }.
 * fresh = a prior derivePayload() result for the CURRENT sources (the
 * re-derivation baseline; omitted by nothing — always provided).
 */
function checkTree(treeDir, manifest, fresh) {
  const failures = [];
  const push = (mode, item, detail) => failures.push({ mode, item, detail });

  if (manifest.buildId !== fresh.buildId) {
    push('cross-build', '<manifest>', `manifest buildId ${manifest.buildId.slice(0, 12)}… ≠ recomputed ${fresh.buildId.slice(0, 12)}… (sources or pinned versions drifted under a stale manifest — regenerate)`);
  }

  for (const [itemKey, entry] of Object.entries(manifest.items)) {
    const cmPath = join(treeDir, entry.classModule.path.replace(/^registry\/payload\/stylex\//, ''));
    const cssPath = join(treeDir, entry.css.path.replace(/^registry\/payload\/stylex\//, ''));
    const cm = existsSync(cmPath) ? readFileSync(cmPath, 'utf8') : null;
    const css = existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : null;
    if (cm === null || css === null) {
      push('manual-edit', itemKey, `artifact missing on disk (${cm === null ? entry.classModule.path : entry.css.path})`);
      continue;
    }

    // 1. missing-rule: constants ↦ selectors
    for (const constant of classConstantsOf(cm)) {
      if (!new RegExp(`\\.${constant}(?![0-9a-z-])`).test(css)) {
        push('missing-rule', itemKey, `class constant .${constant} has no rule in ${entry.css.path}`);
      }
    }

    // 2. cross-build: the stamps
    const cmStamp = /^\/\/ buildId: ([0-9a-f]{64})$/m.exec(cm)?.[1];
    const cssStamp = /buildId: ([0-9a-f]{64})/.exec(css)?.[1];
    if (cmStamp !== manifest.buildId || cssStamp !== manifest.buildId) {
      push(
        'cross-build',
        itemKey,
        `buildId stamps disagree (classModule ${cmStamp?.slice(0, 12) ?? 'none'} / css ${cssStamp?.slice(0, 12) ?? 'none'} / manifest ${manifest.buildId.slice(0, 12)}…) — artifacts mixed from different builds`,
      );
    }

    // 3. manual edit: recorded sha256 vs bytes
    for (const [label, path, want, text] of [
      ['classModule', entry.classModule.path, entry.classModule.sha256, cm],
      ['css', entry.css.path, entry.css.sha256, css],
    ]) {
      if (sha256(text) !== want) {
        push('manual-edit', itemKey, `${label} ${path} sha256 ${sha256(text).slice(0, 12)}… ≠ recorded ${want.slice(0, 12)}… — hand-edited artifact`);
      }
    }

    // the F9 law: byte-zero canonical statement on every item css
    if (!css.startsWith(STYLEX_LAYER_STATEMENT)) {
      push('missing-rule', itemKey, `${entry.css.path} does not open with the F9 canonical layer statement at byte zero`);
    }

    // 4. same-build emission: byte-identical re-derivation
    const derived = fresh.items.get(itemKey);
    if (!derived) {
      push('cross-build', itemKey, 'the item set derivation no longer contains this item (manifest is stale)');
      continue;
    }
    const want = artifactBytes(itemKey, fresh.buildId, derived);
    if (cm !== want.classModule || css !== want.css) {
      push('manual-edit', itemKey, `re-derivation bytes differ (${cm !== want.classModule ? 'classModule' : ''}${cm !== want.classModule && css !== want.css ? ' + ' : ''}${css !== want.css ? 'css' : ''}) — the payload is not what the current sources compile to`);
    }
  }
  return { failures };
}

// ── main: the real payload tree ──────────────────────────────────────

console.log('━━ verify:stylex-payload · re-derivation (the pinned kernel pipeline) ━━━━━━━━━━━');
const fresh = await derivePayload(root);
const manifestPath = join(payloadRoot(root), 'payload-manifest.json');
if (!existsSync(manifestPath)) die('registry/payload/stylex/payload-manifest.json missing — run node scripts/gen-stylex-payload.mjs');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (manifest.version !== 1) die(`unknown manifest version ${manifest.version}`);

check('manifest item set ≡ derivation item set', JSON.stringify(Object.keys(manifest.items).sort()) === JSON.stringify([...fresh.items.keys()].sort()), `${Object.keys(manifest.items).length} item(s)`);

const { failures } = checkTree(payloadRoot(root), manifest, fresh);
for (const f of failures) console.log(`  FAIL  [${f.mode}] ${f.item}: ${f.detail}`);
check('payload tree consistent (missing-rule / cross-build / manual-edit / same-build)', failures.length === 0, failures.length === 0 ? `${Object.keys(manifest.items).length} item(s), ${Object.values(manifest.items).reduce((n, i) => n + i.sourceSnapshot.length, 0)} source(s) pinned` : `${failures.length} failure(s)`);

// ── the consumer spot-compile (F11: zero engine tooling) ────────────

console.log('━━ verify:stylex-payload · consumer spot-compile (plain vite, zero @stylexjs) ━━━━━━━━━━━');
{
  const itemKey = [...fresh.items.keys()].sort().find((k) => fresh.items.get(k).classModule.includes(': "'));
  if (!itemKey) die('no item carries an atom table — the spot-compile has nothing to prove');
  const paths = artifactPaths(root, itemKey);
  const consumerDir = join(root, '.agents/fixtures/stylex-payload-consumer');
  rmSync(consumerDir, { recursive: true, force: true });
  mkdirSync(join(consumerDir, 'src'), { recursive: true });
  // the project owes NOTHING: no dependencies, no plugins, no config —
  // the payload artifacts are imported from the payload tree directly
  writeFileSync(join(consumerDir, 'package.json'), JSON.stringify({ name: 'stylex-payload-consumer', private: true, type: 'module' }, null, 2));
  writeFileSync(join(consumerDir, 'index.html'), '<!doctype html><html><body><div id="app"></div><script type="module" src="/src/entry.js"></script></body></html>\n');
  const relCss = relative(join(consumerDir, 'src'), paths.css).split(sep).join('/');
  const relCm = relative(join(consumerDir, 'src'), paths.classModule).split(sep).join('/');
  writeFileSync(
    join(consumerDir, 'src/entry.js'),
    [
      // relative specifiers (file:// URLs are externalized in build) —
      // plain vite resolves them with zero plugins
      `import '${relCss}';`,
      `import * as atoms from '${relCm}';`,
      `const first = Object.values(atoms)[0];`,
      `document.getElementById('app').className = typeof first === 'string' ? first : '';`,
      '',
    ].join('\n'),
  );
  const wwwRequire = createRequire(join(root, 'apps/www/package.json'));
  const { build } = await import(pathToFileURL(wwwRequire.resolve('vite')).href);
  try {
    await build({ root: consumerDir, configFile: false, logLevel: 'warn', build: { outDir: 'dist', emptyOutDir: true, target: 'esnext' } });
  } catch (e) {
    die(`the zero-tooling consumer build failed: ${e?.message ?? e}`);
  }
  const distDir = join(consumerDir, 'dist');
  const findCss = (dir) => {
    const hits = [];
    for (const e of existsSync(dir) ? readdirSync(dir, { withFileTypes: true }) : []) {
      const full = join(dir, e.name);
      if (e.isDirectory()) hits.push(...findCss(full));
      else if (e.name.endsWith('.css')) hits.push(full);
    }
    return hits;
  };
  const cssHits = findCss(distDir);
  const distCss = cssHits.length > 0 ? readFileSync(cssHits[0], 'utf8') : '';
  check('consumer build green with zero engine tooling', cssHits.length > 0, cssHits.map((p) => p.split(sep).at(-1)).join(', ') || 'no css asset emitted');
  // the consumer's bundler may MERGE/normalize @layer statements
  // (lightningcss re-serializes them — css-legal); the F9 invariant
  // that survives any consumer pipeline is the layer FIRST-MENTION
  // ORDER (the comparator's own N5 law): properties < theme < base <
  // components < stylex.priority1..3 < utilities
  const firstMentions = [];
  for (const m of distCss.matchAll(/@layer\s+([^;{]+)/g)) {
    for (const name of m[1].split(',')) {
      const trimmed = name.trim();
      if (trimmed && !firstMentions.includes(trimmed)) firstMentions.push(trimmed);
    }
  }
  const canonical = ['properties', 'theme', 'base', 'components', 'stylex.priority1', 'stylex.priority2', 'stylex.priority3', 'utilities'];
  const present = canonical.filter((n) => firstMentions.includes(n));
  const ranks = present.map((n) => firstMentions.indexOf(n));
  check(
    'consumer built css keeps the F9 layer order (first-mention vector)',
    present.length >= 4 && ranks.every((r, i) => i === 0 || r > ranks[i - 1]),
    firstMentions.join(' < '),
  );
  const oneClass = classConstantsOf(readFileSync(paths.classModule, 'utf8'))[0];
  check('consumer built css carries the item rules', !!oneClass && distCss.includes(`.${oneClass}`), `.${oneClass}`);
  const projectDeps = JSON.parse(readFileSync(join(consumerDir, 'package.json'), 'utf8'));
  check('consumer package.json owes zero dependencies (no @stylexjs/stylex, @stylexjs/unplugin, @stylexjs/babel-plugin)', Object.keys(projectDeps.dependencies ?? {}).length === 0 && Object.keys(projectDeps.devDependencies ?? {}).length === 0);
}

// ── the always-on planted-defect self-tests (one per failure mode) ───

console.log('━━ verify:stylex-payload · planted-defect self-tests (the teeth) ━━━━━━━━━━━');
{
  const itemKey = [...fresh.items.keys()].sort().find((k) => fresh.items.get(k).classModule.includes(': "'));
  const paths = artifactPaths(root, itemKey);
  const sandbox = (name) => {
    const dir = join(root, `.agents/fixtures/stylex-payload-selftest-${name}`);
    rmSync(dir, { recursive: true, force: true });
    cpSync(payloadRoot(root), dir, { recursive: true });
    return dir;
  };
  const relOf = (p) => p.replace(/^.*payload\/stylex\//, '');
  const reStampManifest = (m, sha) => {
    m.items[itemKey].css.sha256 = sha;
    return m;
  };
  const expectOneFailure = (label, treeDir, manifestObj, mode) => {
    const { failures: fs } = checkTree(treeDir, manifestObj, fresh);
    const hit = fs.find((f) => f.mode === mode && f.item === itemKey);
    if (!hit) {
      check(`selftest ${label}: gate catches it as [${mode}]`, false, fs.length ? `wrong modes: ${fs.map((f) => f.mode).join(',')}` : 'gate stayed GREEN (toothless!)');
    } else {
      check(`selftest ${label}: gate catches it as [${mode}] naming the item`, true, hit.detail.slice(0, 110));
    }
  };

  // T1 missing-rule: delete ONE atom rule from the item css and make the
  // manifest internally consistent (sha updated) — only the constants↦
  // selectors reverse lookup can catch this desync
  {
    const dir = sandbox('missing-rule');
    const cssPath = join(dir, relOf(paths.css));
    const css = readFileSync(cssPath, 'utf8');
    // a plain standalone rule (`\n  .x1234 { decls }`) — never a
    // compound/:root-list selector, so the strip cannot corrupt css
    const constant = classConstantsOf(readFileSync(paths.classModule, 'utf8')).find((c) => css.includes(`\n  .${c} {`));
    if (!constant) die('selftest missing-rule: no plantable standalone rule found (the fixture lost its atoms)');
    const planted = css.replace(new RegExp(`\\n  \\.${constant} \\{[^}]*\\}\\n?`), '\n');
    writeFileSync(cssPath, planted);
    const m = JSON.parse(JSON.stringify(manifest));
    expectOneFailure('missing-rule (a rule deleted, manifest sha kept consistent)', dir, reStampManifest(m, sha256(planted)), 'missing-rule');
  }

  // T2 cross-build: recompile the item under a TWEAKED source (a real
  // second build — a new atom export changes the compiled css) and
  // plant ONLY its css: the classModule and the css then carry
  // different buildId stamps
  {
    const dir = sandbox('cross-build');
    const sourceAbs = join(root, manifest.items[itemKey].sourceSnapshot.at(-1).path); // the entry (topo order: deps first)
    const overrides = new Map([
      [sourceAbs, `${readFileSync(sourceAbs, 'utf8')}\nexport const plantedBuildB = stylex.create({ marker: { zIndex: 42 } });\n`],
    ]);
    const buildB = await derivePayload(root, overrides);
    const cssPath = join(dir, relOf(paths.css));
    const buildBCss = artifactBytes(itemKey, buildB.buildId, buildB.items.get(itemKey)).css;
    writeFileSync(cssPath, buildBCss);
    const m = JSON.parse(JSON.stringify(manifest));
    expectOneFailure('cross-build (css from build B, classModule from build A)', dir, reStampManifest(m, sha256(buildBCss)), 'cross-build');
  }

  // T3 manual edit: append a comment to the classModule (stamps stay
  // intact, manifest sha stays original) — the sha256 check catches it
  {
    const dir = sandbox('manual-edit');
    const cmPath = join(dir, relOf(paths.classModule));
    const planted = readFileSync(cmPath, 'utf8') + '\n/* hand tweak */\n';
    writeFileSync(cmPath, planted);
    expectOneFailure('manual-edit (a hand-edited constant module)', dir, JSON.parse(JSON.stringify(manifest)), 'manual-edit');
  }
}

const failed = results.filter((r) => !r.ok);
console.log(failed.length === 0 ? '\n✓ verify:stylex-payload GREEN — same-build payload consistency holds' : `\n✗ verify:stylex-payload FAILED — ${failed.length} failure(s)`);
process.exit(failed.length === 0 ? 0 : 1);
