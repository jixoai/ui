#!/usr/bin/env node
// registry dependency closure gate (2026-08-30-registry-install-integrity,
// tasks 2.1 + 2.3). The registry's ONE product promise is that every
// advertised `npx jixoai-ui add <item>` resolves — so the dependency graph
// must CLOSE, enforced in three directions, OWNERSHIP-RESOLVED through
// registry.json `files[].target` (raw alias matching is not the test):
//
//   a. dangling   every declared `@jixoai/*` edge names an EXISTING item.
//                 (the ghost class this change kills: hero-section shipped
//                 `@jixoai/reveal` for six days after the item was deleted
//                 and every hero install failed at dependency resolution)
//   b. undeclared every cross-item import of an OWNED file has a declared
//                 edge. A file is owned by the item whose `files[].target`
//                 maps to it (components.json aliases: @ui/* → ui alias,
//                 @lib/* → lib alias); an import that resolves into another
//                 item's ownership requires `@jixoai/<owner>` in the
//                 importer's registryDependencies. same-item / unowned
//                 (site chrome, bare npm) imports are not cross-item.
//   c. dead       a declared-but-unimported edge FAILS unless it is the
//                 structured install prerequisite — the theme sheet: items
//                 declare `@jixoai/jixoai-theme` to pull the token law into
//                 the consumer without importing it (canonical case: every
//                 registry:ui item; jx-pure rides the same rule).
//
// The four-fixture matrix (self-test) proves the semantics on synthetic
// registries: dangling FAIL / undeclared target-resolved import FAIL /
// theme prerequisite PASS / dead non-prerequisite FAIL. The real-registry
// run hard-fails on (a) — zero dangling is the contract — and ratchets
// (b)+(c) against a committed debt ledger (scripts/verify-deps-baseline.json):
// the 2026-08-30 registry carries standing undeclared-import debt (the
// density/popover kernel era, mirrored by the verify-shadcn-add color-picker
// pre-seed fixture); the ledger may only shrink — new violations fail, and
// healed entries must be re-recorded so the ledger stays exact.
//
// Usage:
//   node scripts/verify-deps.mjs                 # self-test + real gate
//   node scripts/verify-deps.mjs --self-test     # fixtures only
//   node scripts/verify-deps.mjs --update-baseline
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const baselinePath = join(root, 'scripts', 'verify-deps-baseline.json');
const THEME = 'jixoai-theme';

// ── ownership: registry target → consumer fs path → owner item ────────
function targetToFs(target, aliases) {
  if (target.startsWith('@ui/')) return `${aliases.ui}/${target.slice(4)}`;
  if (target.startsWith('@lib/')) return `${aliases.lib}/${target.slice(5)}`;
  return null; // vite-plugins/* and other non-consumer targets own nothing
}

// ── import-specifier extraction ───────────────────────────────────────
// Statement-anchored (line starts with import/export after optional
// whitespace) so prose + doc-comment examples never match. `import type`
// / `export type` are skipped: they erase at compile time and cannot break
// an install. CSS @import covers the theme-side wiring (e.g. jx-pure).
function extractSpecs(content, isCss) {
  if (isCss) {
    return [...content.matchAll(/@import\s+(?:url\(\s*)?["']?([^"'\s;)]+)["']?\s*\)?[^;]*;/g)].map((m) => m[1]);
  }
  const specs = [];
  for (const re of [
    /(?:^|\n)\s*import\s+(?:type\s+)?[\w*{},\s$]*?from\s*["']([^"']+)["']/g,
    /(?:^|\n)\s*import\s*["']([^"']+)["']/g,
    /\bimport\(\s*["']([^"']+)["']\s*\)/g,
    /(?:^|\n)\s*export\s+(?:type\s+)?[\w*{},\s$]*?from\s*["']([^"']+)["']/g,
  ]) {
    for (const m of content.matchAll(re)) specs.push(m[1]);
  }
  return specs;
}

const CANDIDATE_SUFFIXES = ['', '.ts', '.js', '.tsx', '.svelte', '.css', '.svelte.ts', '/index.ts', '/index.js'];

function resolveSpec(spec, importerFs, aliases, ownerOf) {
  let base = null;
  if (spec.startsWith('$lib/')) base = `${aliases.lib}/${spec.slice(5)}`;
  else if (spec.startsWith('./') || spec.startsWith('../')) base = posix.join(posix.dirname(importerFs), spec);
  if (base === null) return null; // bare specifier → npm package, not an edge
  for (const suffix of CANDIDATE_SUFFIXES) {
    const owner = ownerOf.get(base + suffix);
    if (owner) return owner;
  }
  return null;
}

/**
 * Analyze a registry's dependency closure.
 * @param {Array} items registry.json items
 * @param {(path: string) => string | null} loadSource repo-relative file loader
 * @param {Record<string, string>} aliases components.json aliases (consumer contract)
 */
export function analyze(items, loadSource, aliases) {
  const ownerOf = new Map();
  for (const item of items) {
    for (const file of item.files ?? []) {
      const fsPath = targetToFs(file.target ?? '', aliases);
      if (fsPath) ownerOf.set(fsPath, item.name);
    }
  }
  const dangling = [];
  const undeclared = new Map();
  const dead = [];
  const themePrerequisites = [];
  for (const item of items) {
    const declared = (item.registryDependencies ?? []).map((d) => d.replace(/^@jixoai\//, ''));
    for (const dep of declared) {
      if (!items.some((candidate) => candidate.name === dep)) {
        dangling.push({ item: item.name, dep });
      }
    }
    const imported = new Map(); // owner item → [{ file, spec }]
    for (const file of item.files ?? []) {
      const fsPath = targetToFs(file.target ?? '', aliases);
      const content = loadSource(file.path);
      if (!content) continue; // absent source: shadcn build / mirror own that failure
      for (const spec of extractSpecs(content, file.path.endsWith('.css'))) {
        const owner = resolveSpec(spec, fsPath ?? '', aliases, ownerOf);
        if (owner && owner !== item.name) {
          if (!imported.has(owner)) imported.set(owner, []);
          imported.get(owner).push({ file: file.path, spec });
        }
      }
    }
    for (const dep of declared) {
      if (imported.has(dep)) continue;
      if (dep === THEME) {
        themePrerequisites.push(item.name);
        continue; // the structured install prerequisite — PASS by design
      }
      dead.push({ item: item.name, dep });
    }
    for (const [owner, refs] of imported) {
      if (!declared.includes(owner)) {
        undeclared.set(`${item.name} -> @jixoai/${owner}`, { item: item.name, owner, refs });
      }
    }
  }
  return {
    dangling,
    dead,
    themePrerequisites,
    undeclared: [...undeclared.values()],
  };
}

// ── the four-fixture matrix (task 2.3) ───────────────────────────────
function fixtureRegistry(name, type, files, registryDependencies) {
  return { name, type, registryDependencies, files };
}
const file = (target, content) => ({ path: `fixture:${target}`, target, content });

function selfTest() {
  const aliases = { ui: 'src/lib/ui', lib: 'src/lib' };
  const results = [];
  const check = (name, ok, detail = '') => {
    results.push(ok);
    console.log(`${ok ? 'PASS' : 'FAIL'}  fixture — ${name}${detail ? ` — ${detail}` : ''}`);
  };
  const run = (items) => {
    const sources = new Map(items.flatMap((i) => (i.files ?? []).map((f) => [f.path, f.content])));
    return analyze(items, (p) => sources.get(p) ?? null, aliases);
  };
  const engine = [fixtureRegistry('engine', 'registry:lib', [file('@lib/engine.ts', 'export const eng = 1;\n')], [])];

  // 1. dangling edge: declared @jixoai/ghost with no such item → FAIL
  {
    const r = run([fixtureRegistry('a', 'registry:ui', [file('@ui/a/a.svelte', '<p>x</p>\n')], ['@jixoai/ghost'])]);
    check('dangling edge FAIL', r.dangling.length === 1 && r.dangling[0].item === 'a' && r.dangling[0].dep === 'ghost', JSON.stringify(r.dangling));
  }
  // 2. undeclared target-resolved import: a's owned file imports $lib/engine → FAIL naming the file
  {
    const r = run([
      fixtureRegistry('a', 'registry:ui', [file('@ui/a/a.svelte', "<script>\n  import { eng } from '$lib/engine';\n</script>\n")], []),
      ...engine,
    ]);
    const hit = r.undeclared.find((u) => u.item === 'a' && u.owner === 'engine');
    check('undeclared target-resolved import FAIL', !!hit && hit.refs[0].file.includes('a.svelte'), JSON.stringify(r.undeclared));
  }
  // 3. theme prerequisite PASS: registry:ui declares the theme without importing it
  {
    const r = run([
      fixtureRegistry('a', 'registry:ui', [file('@ui/a/a.svelte', '<p>x</p>\n')], ['@jixoai/jixoai-theme']),
      fixtureRegistry('jixoai-theme', 'registry:theme', [file('@lib/jixoai.css', ':root {}\n')], []),
    ]);
    check(
      'theme prerequisite PASS (zero violations, prerequisite recorded)',
      r.dangling.length === 0 && r.undeclared.length === 0 && r.dead.length === 0 && r.themePrerequisites.length === 1,
      JSON.stringify(r),
    );
  }
  // 4. dead non-prerequisite: declared @jixoai/icons never imported → FAIL
  {
    const r = run([
      fixtureRegistry('a', 'registry:ui', [file('@ui/a/a.svelte', '<p>x</p>\n')], ['@jixoai/icons']),
      fixtureRegistry('icons', 'registry:lib', [file('@lib/icons.ts', 'export const icons = {};\n')], []),
    ]);
    check('dead non-prerequisite dependency FAIL', r.dead.length === 1 && r.dead[0].item === 'a' && r.dead[0].dep === 'icons', JSON.stringify(r.dead));
  }
  const green = results.every(Boolean);
  console.log(green ? 'self-test: 4/4 fixtures green\n' : 'self-test: FIXTURE MATRIX BROKEN\n');
  return green;
}

// ── real-registry gate ────────────────────────────────────────────────
const loadBaseline = () => JSON.parse(readFileSync(baselinePath, 'utf8'));

function realGate(updateBaseline) {
  const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'));
  const items = registry.items ?? registry;
  const components = JSON.parse(readFileSync(join(root, 'apps', 'www', 'components.json'), 'utf8'));
  const result = analyze(items, (p) => {
    try {
      return readFileSync(join(root, p), 'utf8');
    } catch {
      return null;
    }
  }, components.aliases);

  if (updateBaseline) {
    if (result.dangling.length > 0) {
      console.error('refusing to write the ledger: dangling edges are never baselined — fix them first');
      for (const d of result.dangling) console.error(`  ${d.item} -> @jixoai/${d.dep} (item does not exist)`);
      process.exit(1);
    }
    const ledger = {
      undeclared: result.undeclared.map((u) => `${u.item} -> @jixoai/${u.owner}`).sort(),
      dead: result.dead.map((d) => `${d.item} -> @jixoai/${d.dep}`).sort(),
    };
    writeFileSync(baselinePath, `${JSON.stringify(ledger, null, 2)}\n`);
    console.log(`ledger re-recorded: ${ledger.undeclared.length} undeclared + ${ledger.dead.length} dead standing entries`);
    return true;
  }

  let failed = false;
  if (result.dangling.length > 0) {
    failed = true;
    console.error(`dangling edges (${result.dangling.length}) — declared @jixoai/* with no such item:`);
    for (const d of result.dangling) console.error(`  ${d.item} -> @jixoai/${d.dep}`);
  } else {
    console.log('✓ dangling edges: 0 — every declared @jixoai/* edge names an existing item');
  }

  const ledger = loadBaseline();
  const key = (entry) => entry;
  const currentUndeclared = result.undeclared.map((u) => `${u.item} -> @jixoai/${u.owner}`).sort();
  const currentDead = result.dead.map((d) => `${d.item} -> @jixoai/${d.dep}`).sort();
  const baselineUndeclared = new Set(ledger.undeclared.map(key));
  const baselineDead = new Set(ledger.dead.map(key));
  const newUndeclared = currentUndeclared.filter((k) => !baselineUndeclared.has(k));
  const healedUndeclared = ledger.undeclared.filter((k) => !currentUndeclared.includes(k));
  const newDead = currentDead.filter((k) => !baselineDead.has(k));
  const healedDead = ledger.dead.filter((k) => !currentDead.includes(k));

  if (newUndeclared.length > 0 || newDead.length > 0) {
    failed = true;
    for (const k of newUndeclared) {
      const u = result.undeclared.find((x) => `${x.item} -> @jixoai/${x.owner}` === k);
      console.error(`undeclared cross-item edge (NOT in the debt ledger): ${k}`);
      for (const ref of u.refs) console.error(`    ${ref.file}  (${ref.spec})`);
      console.error(`    fix: add "@jixoai/${u.owner}" to ${u.item}.registryDependencies`);
    }
    for (const k of newDead) console.error(`dead dependency (NOT in the debt ledger): ${k} — import it or drop the edge`);
  }
  if (healedUndeclared.length > 0 || healedDead.length > 0) {
    failed = true;
    for (const k of [...healedUndeclared, ...healedDead]) console.error(`ledger entry healed, re-record with --update-baseline: ${k}`);
  }
  if (!failed) {
    if (currentUndeclared.length > 0 || currentDead.length > 0) {
      console.log(
        `✓ closure: ${currentUndeclared.length} undeclared + ${currentDead.length} dead — all match the standing-debt ledger (ratchet; shrink it when you fix an edge)`,
      );
    }
    console.log(`✓ theme prerequisite: ${result.themePrerequisites.length} items declare @jixoai/jixoai-theme without importing it (structured, PASS)`);
    console.log('verify:deps GREEN');
  }
  return !failed;
}

const selfTestOnly = process.argv.includes('--self-test');
const updateBaseline = process.argv.includes('--update-baseline');

if (selfTestOnly) {
  process.exit(selfTest() ? 0 : 1);
}
const fixturesGreen = selfTest();
const gateGreen = realGate(updateBaseline);
process.exit(fixturesGreen && gateGreen ? 0 : 1);
