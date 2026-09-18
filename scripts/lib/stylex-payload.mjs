// stylex-payload — the compiled-output payload compile core
// (stylex-kernel-phase0 P0.4; scripts/gen-stylex-payload.mjs and
// scripts/verify-stylex-payload.mjs BOTH import this module — one law,
// one implementation, the css-laws slots precedent).
//
// What this module owns, each load-bearing (design §3; the spec delta
// "same-build payload consistency"):
//
//   1. THE ITEM SET (data-driven, never a hand list):
//      - every registry.json item whose files[] owns at least one
//        .stylex.ts source (today: `tokens`) — the SHIPPED payload
//        surface, keyed by item name;
//      - every OTHER module in research/migration-ledger.json (the
//        migration census) — keyed `corpus/<basename>`. Phase 0 has no
//        migrated production component yet (design §6), so the ledger
//        corpus is what keeps the payload pipeline exercising REAL
//        atoms (not a vars-only vacuous pass); phase-1 migration
//        commits move families from corpus keys to registry item keys
//        by the same derivation, no harness edit.
//   2. THE COMPILE — the pinned engine (@stylexjs/unplugin 0.19.0's
//      own vite factory) driven through its public plugin surface plus
//      the ONE internal accessor the wrapper already licenses
//      (__stylexCollectCss — stable within the pin). The babel pins
//      mirror packages/vite-plugin/src/stylex/vite-plugin.ts EXACTLY
//      (dev:false, runtimeInjection:false, debug:true,
//      propertyValidationMode:'throw', useCSSLayers with the
//      components.stylex nesting + before/after anchors, commonJS
//      moduleResolution rooted at the REPO root): same pins, same
//      serializer, same bytes as the real www build's stylex lane.
//      Per-item isolation: the unplugin's cross-instance shared store
//      (globalThis.__stylex_unplugin_store) is CLEARED between items
//      so each item's CSS is its own dependency closure only.
//   3. THE ARTIFACTS (one compilation per item — the same-build law):
//      - classModule: the compiled export tables re-serialized as
//        PLAIN STRING constants (F11: "we only ship compiled class
//        names") — atom tables become joined class strings ($$css
//        debug markers dropped), defineVars tables stay verbatim
//        (their __varGroupHash__ value IS a class constant the
//        reverse-lookup law covers);
//      - css: the F9 canonical layer statement at BYTE ZERO (dynamic
//        over the css's highest priority tier — layer-law.ts, the
//        Gate-2 P1-1 law) + the engine-collected rules for the item's
//        .stylex.ts closure.
//   4. THE buildId — the spec formula, canonical serialization:
//      UTF-8; fields joined by U+000A WITH a trailing separator;
//      paths POSIX repo-root-relative; items sorted by path BYTES;
//      source lists sorted by path BYTES; hashes lowercase hex sha256.
//      Each artifact carries the buildId as a STAMP (classModule
//      header comment; css trailing comment) so a cross-build mix is
//      mechanically decidable — two artifacts, two stamps, one FAIL.
//      ("registry root" in the spec is read as the repository root,
//      the migration ledger's established path base — recorded here so
//      a future base change is a one-function edit, not archaeology.)
//
// DETERMINISM: class names hash from content + the module path
// relative to the babel rootDir (the L3c anomaly) — rootDir is pinned
// to the repo root, so artifacts are machine-independent; rule order
// is the fixed topological transform order (imports first, ties in
// first-seen order, entries in registry/ledger order).

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const vitePluginDir = resolve(here, '../../packages/vite-plugin');
const pluginRequire = createRequire(join(vitePluginDir, 'package.json'));

/** @param {string} p absolute path → POSIX repo-root-relative */
export const toPosix = (root, p) => relative(root, p).split(sep).join('/');

/** lowercase-hex sha256 of a string's UTF-8 bytes */
export const sha256 = (text) => createHash('sha256').update(text, 'utf8').digest('hex');

/** byte-order compare (the canonical "sorted by path bytes") */
export const byBytes = (a, b) => {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  return ba.equals(bb) ? 0 : ba < bb ? -1 : 1;
};

// ── versions (the buildId's first two fields) ────────────────────────
export const GENERATOR_VERSION = `@jixoai/ui-vite-plugin@${pluginRequire(join(vitePluginDir, 'package.json')).version}`;
// the unplugin's exports map does not expose ./package.json — read the
// manifest file beside the resolved entry (stable within the pin)
const unpluginRoot = pluginRequire.resolve('@stylexjs/unplugin/vite').match(/^(.*node_modules\/@stylexjs\/unplugin)\//)?.[1];
if (!unpluginRoot) throw new Error('stylex-payload: cannot locate the @stylexjs/unplugin package root');
export const ENGINE_VERSION = `@stylexjs/unplugin@${JSON.parse(readFileSync(join(unpluginRoot, 'package.json'), 'utf8')).version}`;

/** the F9 canonical layer law — imported from the BUILT plugin dist (single source, never re-typed) */
const { canonicalLayerStatement, countCanonicalStatements, maxStylexPriority, stripCanonicalStatements, STYLEX_LAYERS_AFTER, STYLEX_LAYERS_BEFORE, STYLEX_LAYER_PREFIX } = await import(pathToFileURL(join(vitePluginDir, 'dist/stylex/layer-law.js')).href);
export { countCanonicalStatements, stripCanonicalStatements };

// ── the item set ─────────────────────────────────────────────────────

/**
 * Derive the payload item set.
 * @returns {Map<string, {kind:'registry'|'corpus', sources:string[]}>} sources = ABSOLUTE entry paths.
 */
export function deriveItemSet(root) {
  const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'));
  const items = registry.items ?? registry;
  const registryStylexFiles = new Set();
  const itemSet = new Map();

  for (const item of items) {
    const sources = (item.files ?? [])
      .map((f) => f.path)
      .filter((p) => p.endsWith('.stylex.ts'))
      .map((p) => resolve(root, p));
    if (sources.length === 0) continue;
    sources.forEach((s) => registryStylexFiles.add(s));
    itemSet.set(item.name, { kind: 'registry', sources });
  }

  const ledgerPath = join(root, 'research/migration-ledger.json');
  const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'));
  if (ledger.version !== 1) throw new Error(`stylex-payload: unknown migration-ledger version ${ledger.version}`);
  // the ledger is DUAL-KIND by schema (verify-stylex-authoring line ~183:
  // ".stylex.ts modules and stylex-touched .css sheets") — this lane
  // consumes ONLY the modules; a .css sheet has no stylex transform
  // (engine.transform returns undefined for it — first seen 2026-09-15
  // W4, when the W1 css sheets already committed to the ledger made the
  // payload publish throw on corpus/press-button.css)
  for (const file of ledger.files) {
    if (!file.endsWith('.stylex.ts')) continue; // css sheets belong to the authoring gate, not the compiled corpus
    const abs = resolve(root, file);
    if (registryStylexFiles.has(abs)) continue; // owned by a registry item above (e.g. tokens.stylex.ts)
    // SITE-SURFACE boundary (tailwindless-site P0, 2026-09-17): apps/www/
    // src/lib/surface/** modules are www-internal atom tables — authored
    // under the transform root, listed in the ledger for the AUTHORING
    // gate's scope, but owing NO consumer contract: never a payload item.
    // (Deliberately NOT the shared site-only list — the __probe__ corpus
    // IS mirror-site-only yet ships as the kernel/payload fixture.)
    if (toPosix(root, abs).startsWith('apps/www/src/lib/surface/')) continue;
    if (!existsSync(abs)) throw new Error(`stylex-payload: ledger file missing: ${file}`);
    const key = `corpus/${toPosix(root, abs).split('/').at(-1).replace(/\.stylex\.ts$/, '')}`;
    if (itemSet.has(key)) throw new Error(`stylex-payload: duplicate corpus key ${key} (two ledger modules share a basename)`);
    itemSet.set(key, { kind: 'corpus', sources: [abs] });
  }
  return itemSet;
}

/** resolve a `.stylex` import specifier the way the kernel graph does (extension-less → .ts, then .js) */
function resolveStylexSpecifier(fromDir, spec) {
  const base = resolve(fromDir, spec);
  for (const candidate of [base, `${base}.ts`, `${base}.js`]) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`stylex-payload: cannot resolve .stylex import '${spec}' from ${base}`);
}

/** the relative .stylex import specifiers of one module's source text */
const stylexImportsOf = (code) => [...code.matchAll(/(?:from\s*|import\s*)['"]([^'"]+\.stylex)['"]/g)].map((m) => m[1]);

/**
 * The .stylex.ts import closure of the entry modules, TOPOLOGICALLY
 * ordered (dependencies first). Relative specifiers only — the ssg
 * lesson: $lib aliases break the babel module resolution.
 */
export function stylexClosure(entriesAbs) {
  const codeOf = new Map();
  const depsOf = new Map();
  const visit = (abs) => {
    if (codeOf.has(abs)) return;
    const code = readFileSync(abs, 'utf8');
    codeOf.set(abs, code);
    const deps = stylexImportsOf(code).map((spec) => {
      if (!spec.startsWith('.')) {
        throw new Error(`stylex-payload: non-relative .stylex import '${spec}' in ${abs} (the ssg lesson: aliases break the babel module resolution — relative imports only)`);
      }
      return resolveStylexSpecifier(dirname(abs), spec);
    });
    depsOf.set(abs, deps);
    deps.forEach(visit);
  };
  entriesAbs.forEach(visit);
  const order = [];
  const emitted = new Set();
  const emit = (abs) => {
    if (emitted.has(abs)) return;
    emitted.add(abs);
    depsOf.get(abs).forEach(emit);
    order.push(abs);
  };
  entriesAbs.forEach(emit);
  return order;
}

// ── the compile (one engine per item, shared store cleared) ─────────

async function loadEngineFactory() {
  const mod = await import(pathToFileURL(pluginRequire.resolve('@stylexjs/unplugin/vite')).href);
  const factory = mod.default?.default ?? mod.default;
  if (typeof factory !== 'function') throw new Error('stylex-payload: @stylexjs/unplugin/vite did not export a factory');
  return factory;
}

/**
 * Compile ONE item: transform its .stylex.ts closure under the kernel
 * babel pins. Returns { entryCodes: Map<abs, compiledCode>, css } —
 * both products of the SAME transform pass (the same-build law).
 * sourceOverrides: Map<absPath, code> — the planted-defect self-tests
 * inject tweaked sources through it (the real tree is never touched).
 */
export async function compileItem(root, sources, sourceOverrides = new Map()) {
  const factory = await loadEngineFactory();
  const engine = factory({
    // the EXACT kernel pins (packages/vite-plugin/src/stylex/vite-plugin.ts, command='build')
    dev: false,
    runtimeInjection: false,
    debug: true,
    propertyValidationMode: 'throw',
    useCSSLayers: { before: [...STYLEX_LAYERS_BEFORE], prefix: STYLEX_LAYER_PREFIX, after: [...STYLEX_LAYERS_AFTER] },
    unstable_moduleResolution: { type: 'commonJS', rootDir: root },
  });
  // per-item isolation: the unplugin's cross-instance store accumulates
  // (globalThis.__stylex_unplugin_store) — clear it so collectCss sees
  // ONLY this item's closure (verified against the pinned core source)
  delete globalThis.__stylex_unplugin_store;
  await engine.buildStart?.();

  const closure = stylexClosure(sources);
  const entrySet = new Set(sources);
  const entryCodes = new Map(); // the ITEM's own modules only (deps' css rides the css artifact, deps' tables stay their own items')
  for (const abs of closure) {
    const code = sourceOverrides.get(abs) ?? readFileSync(abs, 'utf8');
    const result = await engine.transform.call({ meta: { watchMode: false } }, code, abs);
    if (entrySet.has(abs)) entryCodes.set(abs, result.code);
  }
  const css = engine.__stylexCollectCss();
  if (css.length === 0) throw new Error('stylex-payload: the item compiled to zero css (the engine collected no rules — a silent drop)');
  return { entryCodes, css };
}

// ── classModule serialization (plain strings — the F11 form) ────────

/** extract every `export const NAME = {…};` literal from compiled code, as JS values */
export function parseCompiledTables(code) {
  const tables = [];
  for (const m of code.matchAll(/^export const ([A-Za-z_$][\w$]*) = (\{[\s\S]*?\});\s*$/gm)) {
    const [, name, literal] = m;
    // grammar guard: after removing string literals, ONLY braces,
    // colons, commas, whitespace and bare identifier KEYS may remain
    // (values are always string literals in compiled output — the
    // invariant that matters: no calls, no arithmetic, no template
    // literals; shape drift fails loudly here instead of ever
    // evaluating non-data code)
    const residue = literal.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '');
    if (!/^[\s{}:,\w$]*$/.test(residue)) {
      throw new Error(`stylex-payload: compiled table '${name}' is not a pure literal (engine output shape drifted — re-audit the pin)`);
    }
    tables.push([name, Function(`"use strict"; return (${literal});`)()]);
  }
  return tables;
}

/** serialize one table to the payload classModule form (plain strings) */
export function serializeTable(name, table) {
  if (table !== null && typeof table === 'object' && !Array.isArray(table) && '__varGroupHash__' in table) {
    // defineVars table: verbatim (the vars names + var() values + the
    // theme class constant — consumers import the css, authors consumed
    // the names at OUR compile time)
    const entries = Object.entries(table).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
    return `export const ${name} = Object.freeze({\n${entries.join(',\n')},\n});`;
  }
  const atoms = Object.entries(table).map(([atom, decls]) => {
    const classes = Object.entries(decls)
      .filter(([k]) => k !== '$$css')
      .map(([, v]) => v);
    return `  ${JSON.stringify(atom)}: ${JSON.stringify(classes.join(' '))}`;
  });
  return `export const ${name} = Object.freeze({\n${atoms.join(',\n')},\n});`;
}

/** every class-constant string in a classModule's text (the reverse-lookup input) */
export function classConstantsOf(code) {
  const constants = new Set();
  for (const m of code.matchAll(/"(?:[^"\\]|\\.)*"/g)) {
    const value = JSON.parse(m[0]);
    if (typeof value !== 'string') continue;
    for (const token of value.split(/\s+/)) {
      if (/^x[0-9a-z]{4,12}$/.test(token)) constants.add(token);
    }
  }
  return [...constants];
}

// ── buildId (the spec formula, canonical serialization) ─────────────

export function computeBuildId(itemSnapshots) {
  const lines = [GENERATOR_VERSION, ENGINE_VERSION];
  const sorted = [...itemSnapshots].sort((a, b) => byBytes(a.itemPath, b.itemPath));
  for (const item of sorted) {
    lines.push(item.itemPath);
    for (const src of [...item.sources].sort((a, b) => byBytes(a.path, b.path))) lines.push(src.sha256);
  }
  return sha256(lines.join('\n') + '\n');
}

// ── the full payload derivation ──────────────────────────────────────

/** the payload tree root (OUTSIDE the byte-mirror trees — registry/files ⇄ apps/www/src/lib never sees it) */
export const payloadRoot = (root) => join(root, 'registry/payload/stylex');

/** canonical artifact paths for an item key */
export const artifactPaths = (root, itemKey) => {
  const base = join(payloadRoot(root), itemKey);
  const stem = itemKey.split('/').at(-1);
  return { classModule: join(base, `${stem}.styles.js`), css: join(base, `${stem}.css`) };
};

/** the canonical stamp block every artifact pair carries (cross-build detection) */
export const stampLines = (buildId) => [`buildId: ${buildId}`, `generator: ${GENERATOR_VERSION}`, `engine: ${ENGINE_VERSION}`];

/**
 * Derive the WHOLE payload in memory.
 * @returns {{ buildId: string, items: Map<string, {classModule: string, css: string, sourceSnapshot: {path:string, sha256:string}[]}> }}
 * sourceOverrides: Map<absPath, code> for the planted self-tests.
 */
export async function derivePayload(root, sourceOverrides = new Map()) {
  const itemSet = deriveItemSet(root);
  const items = new Map();
  for (const [key, { sources }] of itemSet) {
    const { entryCodes, css } = await compileItem(root, sources, sourceOverrides);
    const tables = [...entryCodes.entries()]
      .sort((a, b) => byBytes(a[0], b[0]))
      .flatMap(([, code]) => parseCompiledTables(code));
    if (tables.length === 0) throw new Error(`stylex-payload: item ${key} compiled to zero export tables`);
    const classModule = tables.map(([name, table]) => serializeTable(name, table)).join('\n\n');
    const sourceSnapshot = stylexClosure(sources)
      .map((abs) => ({ path: toPosix(root, abs), sha256: sha256(sourceOverrides.get(abs) ?? readFileSync(abs, 'utf8')) }));
    items.set(key, { classModule, css, sourceSnapshot });
  }
  const buildId = computeBuildId([...items].map(([key, v]) => ({ itemPath: key, sources: v.sourceSnapshot })));
  return { buildId, items };
}

/** serialize an item's two artifacts to their final committed bytes */
export function artifactBytes(itemKey, buildId, { classModule, css }) {
  const header = [
    '// @generated by scripts/gen-stylex-payload.mjs — DO NOT EDIT.',
    '// verify:stylex-payload re-derives these bytes; a hand edit fails the gate naming the artifact + mismatch.',
    `// item: ${itemKey}`,
    ...stampLines(buildId).map((l) => `// ${l}`),
  ].join('\n');
  const classModuleBytes = `${header}\n${classModule}\n`;
  // the F9 statement at BYTE ZERO (the canonical layer law, dynamic
  // over the css's highest tier; PFINAL: no utilities — the tier died
  // with the engine); the stamp rides a trailing comment. The css's
  // OWN leading canonical statement — sheet form OR tier-carrying
  // (the Codex r3 P1: corpus items that already opened with a full
  // canonical statement kept a second one under the narrow sheet-only
  // strip) — is stripped first through the ONE tolerant matcher; the
  // artifact carries EXACTLY ONE canonical statement.
  const deduped = stripCanonicalStatements(css) || css;
  const cssBytes = `${canonicalLayerStatement(maxStylexPriority(css))}\n${deduped.replace(/\s*$/, '\n')}/* ${stampLines(buildId).join(' · ')} */\n`;
  return { classModule: classModuleBytes, css: cssBytes };
}
