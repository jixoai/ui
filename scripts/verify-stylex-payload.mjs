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
// precedent: teeth proven every run, not once. A FOURTH plant (Gate-2
// P1-1) shapes the layer-law escape itself — a css whose priority
// tiers escape past `utilities` (top-level stylex.* blocks after a
// short statement) — caught by BOTH the tree detector and the REAL
// browser arm below.
//
// Plus the DUAL-ORDER BROWSER ASSERTION (Gate-2 P1-1, the teeth the
// first-mention text check never had): a self-managed static server +
// headless Chromium (the popover-probe pattern) loads one payload item
// css against a Tailwind-shaped consumer stylesheet in BOTH orders —
// kernel→consumer AND consumer→kernel — and asserts the consumer
// utility's COMPUTED value wins in both (the spec scenario's
// mechanical form). The planted escape css runs the same two pages and
// must show the ATOM winning (the failure the law exists to prevent,
// observed live) — the negative control.
//
// Usage (from repo root): node scripts/verify-stylex-payload.mjs
// (browser discovery: CHROME_PATH wins, then the playwright cache's
// chromium-* dirs newest-first, then system installs)

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { createServer as createHttpServer } from 'node:http';
import { createRequire } from 'node:module';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
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

// the F9 canonical layer law — from the BUILT plugin dist (never re-typed)
const { canonicalLayerStatement, maxStylexPriority, parseCanonicalStatement } = await import(
  pathToFileURL(join(root, 'packages/vite-plugin/dist/stylex/layer-law.js')).href
);

// ── browser discovery: CHROME_PATH, then the playwright cache, then
//    system installs (the popover-probe contract, verbatim) ──────────
function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const caches = [
    join(homedir(), 'Library/Caches/ms-playwright'),
    process.env.XDG_CACHE_HOME ? join(process.env.XDG_CACHE_HOME, 'ms-playwright') : join(homedir(), '.cache/ms-playwright'),
  ];
  for (const cache of caches) {
    if (!existsSync(cache)) continue;
    const versions = readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().reverse();
    for (const v of versions) {
      for (const name of [
        'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
        'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium',
        'chrome-linux64/chrome',
        'chrome-linux/chrome',
      ]) {
        const p = join(cache, v, name);
        if (existsSync(p)) return p;
      }
    }
  }
  const system = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];
  for (const p of system) if (existsSync(p)) return p;
  return null;
}

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

    // the F9 law (Gate-2 P1-1): byte-zero canonical statement covering
    // EVERY tier the css carries, tiers nested under components, no
    // top-level stylex.* escape
    const parsed = parseCanonicalStatement(css);
    if (!parsed) {
      push('missing-rule', itemKey, `${entry.css.path} does not open with the canonical layer statement at byte zero`);
    } else if (parsed.maxPriority < maxStylexPriority(css)) {
      push('missing-rule', itemKey, `${entry.css.path}: the statement covers priority1..${parsed.maxPriority} but the css carries stylex.priority${maxStylexPriority(css)} — the uncovered tier escapes past utilities`);
    }
    if (/(?:^|\n)@layer stylex\.priority/.test(css)) {
      push('missing-rule', itemKey, `${entry.css.path}: a TOP-LEVEL @layer stylex.priorityN block — tiers must nest under components (components.stylex.*) or they sort after the consumer's utilities`);
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
  // components < components.stylex.priority1..N < utilities — the
  // canonical vector for THIS item's tier count
  const firstMentions = [];
  for (const m of distCss.matchAll(/@layer\s+([^;{]+)/g)) {
    for (const name of m[1].split(',')) {
      const trimmed = name.trim();
      if (trimmed && !firstMentions.includes(trimmed)) firstMentions.push(trimmed);
    }
  }
  const itemTiers = maxStylexPriority(readFileSync(paths.css, 'utf8'));
  const canonical = [
    'properties',
    'theme',
    'base',
    'components',
    ...Array.from({ length: itemTiers }, (_, i) => `components.stylex.priority${i + 1}`),
    'utilities',
  ];
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

// ── the dual-order browser assertion (Gate-2 P1-1 — the teeth) ──────

console.log('━━ verify:stylex-payload · dual-order browser assertion (real Chromium, both import orders) ━━━━━━━━━━━');
await (async () => {
  const CHROME = findChrome();
  if (!CHROME) die('no Chromium found for the dual-order assertion (CHROME_PATH, playwright cache, system installs) — the F9 law cannot be verified as text alone');

  // the kernel css: the payload item carrying a display atom in a HIGH
  // tier (≥4 — the tier class that escaped utilities in the Gate-2
  // finding); the atom class + its value are DISCOVERED from the css,
  // never hand-pinned
  const pick = [...fresh.items.keys()]
    .sort()
    .map((key) => {
      const paths = artifactPaths(root, key);
      const css = readFileSync(paths.css, 'utf8');
      let tier = 0;
      for (const block of css.matchAll(/@layer components\.stylex\.priority(\d+) \{([\s\S]*?)(?=\n@layer |\n\/\* buildId:|$)/g)) {
        if (Number(block[1]) < 4) continue;
        const rule = /\.([a-z0-9]+) \{[^}]*display: ([a-z-]+)/.exec(block[2]);
        if (rule) {
          tier = Number(block[1]);
          return { key, paths, css, atomClass: rule[1], atomDisplay: rule[2], tier };
        }
      }
      return null;
    })
    .find(Boolean);
  if (!pick) die('no payload item carries a display atom in a tier ≥ 4 — the dual-order fixture lost its probe atom (regenerate the payload)');

  // the consumer stylesheet: Tailwind-shaped (the prelude registers
  // properties…utilities; the utility rides @layer utilities) — the
  // spec scenario's consumer page shape
  const consumerCss = [
    '@layer properties, theme, base, components, utilities;',
    '@layer utilities { .consumer-grid { display: grid; } }',
    '',
  ].join('\n');

  // the PLANTED ESCAPE (the negative control): the css as it was at the
  // Gate-2 finding — statement stopping at priority3 + TOP-LEVEL
  // stylex.* tier blocks, the shape that sorts after the consumer's
  // utilities and beats them
  const escapeCss = `${canonicalLayerStatement(3)}\n${pick.css.split('\n').slice(1).join('\n').replaceAll('@layer components.stylex.priority', '@layer stylex.priority')}`;

  const server = createHttpServer((req, res) => {
    const [path, query] = (req.url ?? '').split('?');
    const planted = new URLSearchParams(query ?? '').get('planted') === '1';
    const kernel = planted ? escapeCss : pick.css;
    const html = (kernelFirst) =>
      `<!doctype html><html><head>${
        kernelFirst
          ? `<link rel="stylesheet" href="/kernel.css?planted=${planted ? 1 : 0}"><link rel="stylesheet" href="/consumer.css">`
          : `<link rel="stylesheet" href="/consumer.css"><link rel="stylesheet" href="/kernel.css?planted=${planted ? 1 : 0}">`
      }</head><body><div id="probe" class="${pick.atomClass} consumer-grid">x</div></body></html>`;
    if (path === '/kernel.css') {
      res.writeHead(200, { 'content-type': 'text/css' });
      res.end(kernel);
    } else if (path === '/consumer.css') {
      res.writeHead(200, { 'content-type': 'text/css' });
      res.end(consumerCss);
    } else if (path === '/kernel-first.html' || path === '/consumer-first.html') {
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(html(path === '/kernel-first.html'));
    } else {
      res.writeHead(404);
      res.end('not found');
    }
  });
  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
  const base = `http://127.0.0.1:${server.address().port}`;

  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const measure = async (url) => {
      const page = await browser.newPage();
      await page.goto(url);
      const value = await page.evaluate(() => getComputedStyle(document.getElementById('probe')).display);
      await page.close();
      return value;
    };
    const detail = `${pick.key} · atom .${pick.atomClass} (tier ${pick.tier}, display:${pick.atomDisplay}) vs consumer .consumer-grid (layer utilities, display:grid)`;
    const kernelFirst = await measure(`${base}/kernel-first.html`);
    check('kernel css first → the consumer utility wins (computed)', kernelFirst === 'grid', `display=${kernelFirst} · ${detail}`);
    const consumerFirst = await measure(`${base}/consumer-first.html`);
    check('consumer css first → the consumer utility wins (computed)', consumerFirst === 'grid', `display=${consumerFirst} · ${detail}`);
    const escaped = await measure(`${base}/consumer-first.html?planted=1`);
    check(
      'negative control: the escaped-tier css (top-level stylex.*, statement stuck at priority3) lets the ATOM win — the exact failure the law forbids',
      escaped !== 'grid' && escaped === pick.atomDisplay,
      `display=${escaped} (the atom's value — the escape is observable, so the green arms above are meaningful)`,
    );
  } finally {
    await browser.close().catch(() => {});
    await new Promise((resolveClose) => server.close(resolveClose));
  }
})();


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

  // T4 layer-law escape (Gate-2 P1-1): the css exactly as the Gate-2
  // finding shaped it — canonical statement stopping at priority3 +
  // TOP-LEVEL stylex.* tier blocks (shas consistent, stamps intact) —
  // only the F9 detectors can name it (the uncovered tier + the
  // top-level block). The browser arm above proves the same plant's
  // computed-style failure is REAL; this arm proves the TREE check
  // catches it without a browser.
  {
    const dir = sandbox('layer-escape');
    const cssPath = join(dir, relOf(paths.css));
    const original = readFileSync(cssPath, 'utf8');
    const planted = `${canonicalLayerStatement(3)}\n${original.split('\n').slice(1).join('\n').replaceAll('@layer components.stylex.priority', '@layer stylex.priority')}`;
    writeFileSync(cssPath, planted);
    const m = JSON.parse(JSON.stringify(manifest));
    expectOneFailure('layer-escape (top-level stylex.* tiers past a priority3 statement)', dir, reStampManifest(m, sha256(planted)), 'missing-rule');
  }
}

const failed = results.filter((r) => !r.ok);
console.log(failed.length === 0 ? '\n✓ verify:stylex-payload GREEN — same-build payload consistency holds' : `\n✗ verify:stylex-payload FAILED — ${failed.length} failure(s)`);
process.exit(failed.length === 0 ? 0 : 1);
