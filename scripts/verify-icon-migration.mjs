#!/usr/bin/env node
// icon-migration inventory gate (2026-09-06-icon-component-pipeline,
// task C0 — design §8 "the auditable inventory").
//
// The old icon API (`$lib/icons` + `{@html icons.x}` + the
// `@jixoai/icons` registry item + `scripts/gen-icons.mjs`) is retired
// with NO compat layer. This script makes that migration AUDITABLE:
// the authoritative consumer inventory is a machine-generated,
// COMMITTED artifact — never prose.
//
// Modes:
//   node scripts/verify-icon-migration.mjs --write   # (re)generate the snapshot
//   node scripts/verify-icon-migration.mjs --check   # gate (default): live hits === snapshot
//
// Snapshot semantics ("snapshot is truth"): the JSON holds the live hit
// list at generation time; --check FAILS whenever live ≠ committed —
// both directions: new hits appeared, or committed hits vanished
// without a snapshot refresh. Progress = shrink + re-commit;
// completion (task C5) = snapshot `[]` AND zero live hits.
//
// Scope — implementation surfaces only:
//   dirs:  registry/files, apps/www/src, apps/www/test, registry/test,
//          scripts, packages
//   files: package.json, registry.json
//
// Fixed exclusions (never scanned — the verifier must never match its
// own patterns): `**/node_modules/**`, `openspec/**`, `.agents/**`,
// `**/.svelte-kit/**`, THIS script's own source, and the inventory file
// itself. Additionally, gitignore-declared droppings that can appear
// INSIDE scope dirs are skipped by hand: `registry/files/routes/`
// (dev-syncer transport droppings) and `scripts/blueprints/.cache.json`
// (derived cache). The design's reference "real rg sweep" honors
// .gitignore implicitly; a pure-JS walker replicates that by rule so
// the gate never trips on uncommitted machine state.
//
// Hits inside prose COMMENTS count BY DESIGN: a comment (or TODO)
// teaching the old API is an implementation-surface hit — the
// migration cleans it together with the code around it.
//
// No dependencies beyond the node stdlib; pure-JS matching only.
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const writeMode = process.argv.includes('--write');
const die = (msg) => {
  console.error(`[icon-migration] ${msg}`);
  process.exit(1);
};

// ── patterns ────────────────────────────────────────────────────────
// Boundary reasoning (verified against the real tree, 2026-09-06):
//  - `$lib/icons` needs no lookahead: the `s` is the discriminator —
//    `$lib/icon-table/…` and the incoming `$lib/icon-set.gen` have `-`
//    (not `s`) right after `icon`, so the literal never matches them.
//    All 97 live occurrences are the bare `$lib/icons` form.
//  - `@jixoai/icons` likewise: the incoming `@jixoai/icon` and
//    `@jixoai/icon-set` packages continue with `-`/quote after `icon`,
//    never `s` — no match. All 31 live occurrences are bare.
//  - path literals pin the retired files exactly. The relative form
//    catches test-side imports the $lib pattern cannot see (the
//    jx-pure-parity gap, C0 friction 2): `../src/lib/icons` in
//    apps/www/test — the trailing `/icons` boundary (`['";]` or EOS
//    after optional `.ts`) keeps `../src/lib/icon-set.gen` out.
const PATTERNS = [
  /\$lib\/icons/,
  /@html icons\./,
  /@jixoai\/icons/,
  /registry\/files\/lib\/icons\.ts/,
  /apps\/www\/src\/lib\/icons\.ts/,
  /scripts\/gen-icons\.mjs/,
  /\.\.\/src\/lib\/icons(\.ts)?['"]/,
];

// ── scope + fixed exclusions ────────────────────────────────────────
const SCOPE_DIRS = [
  'registry/files',
  'apps/www/src',
  'apps/www/test',
  'registry/test',
  'scripts',
  'packages',
];
const SCOPE_FILES = ['package.json', 'registry.json'];

const SELF = 'scripts/verify-icon-migration.mjs';
const INVENTORY = 'scripts/icon-migration-inventory.json';
const inventoryPath = join(root, INVENTORY);

// directory names excluded at ANY depth (fixed rule)
const SKIPPED_DIR_NAMES = new Set(['node_modules', 'openspec', '.agents', '.svelte-kit', 'dist']);
// gitignore-declared droppings reachable inside scope dirs (see header)
const SKIPPED_RELPATHS = new Set([
  'registry/files/routes', // dev-syncer droppings (gitignored)
  'scripts/blueprints/.cache.json', // derived blueprint cache (gitignored)
]);

// hand-rolled recursive walk — sorted for a deterministic hit order
function walk(dir, prefix = '') {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out; // unreadable corner: no hits from it
  }
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const e of entries) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (SKIPPED_RELPATHS.has(rel)) continue;
    if (e.isDirectory()) {
      if (SKIPPED_DIR_NAMES.has(e.name)) continue;
      out.push(...walk(join(dir, e.name), rel));
    } else if (e.isFile()) {
      if (rel === SELF || rel === INVENTORY) continue; // fixed self-exclusion
      out.push(rel);
    }
  }
  return out;
}

// ── the live sweep ──────────────────────────────────────────────────
function scan() {
  const hits = [];
  const consider = (rel) => {
    let content;
    try {
      content = readFileSync(join(root, rel), 'utf8');
    } catch {
      return; // vanished mid-walk / unreadable: no hits from it
    }
    if (content.includes('\0')) return; // binary guard
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (PATTERNS.some((re) => re.test(lines[i]))) {
        hits.push({ file: rel, line: i + 1, text: lines[i].trim() });
      }
    }
  };
  for (const dir of SCOPE_DIRS) {
    const abs = join(root, dir);
    if (!existsSync(abs) || !statSync(abs).isDirectory()) continue;
    for (const rel of walk(abs, dir)) consider(rel);
  }
  for (const rel of SCOPE_FILES) {
    if (existsSync(join(root, rel))) consider(rel);
  }
  hits.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line));
  return hits;
}

// ── write / check ───────────────────────────────────────────────────
if (writeMode) {
  const hits = scan();
  const snapshot = {
    generatedAt: new Date().toISOString(),
    patterns: PATTERNS.map((re) => re.source),
    hits,
  };
  writeFileSync(inventoryPath, JSON.stringify(snapshot, null, 2) + '\n');
  const files = new Set(hits.map((h) => h.file));
  const top = [...files]
    .map((f) => [f, hits.filter((h) => h.file === f).length])
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, 5);
  console.log(`[icon-migration] wrote ${INVENTORY}: ${files.size} files, ${hits.length} hits`);
  for (const [f, n] of top) console.log(`  ${String(n).padStart(3)}  ${f}`);
  process.exit(0);
}

// --check (default)
let snapshot;
try {
  snapshot = JSON.parse(readFileSync(inventoryPath, 'utf8'));
} catch {
  die(`missing or unreadable snapshot ${INVENTORY} — run: npm run gen:migration`);
}

const livePatterns = PATTERNS.map((re) => re.source).join('\u0000');
if ((snapshot.patterns ?? []).join('\u0000') !== livePatterns) {
  die('snapshot patterns are stale (the script regexes changed) — rerun: npm run gen:migration');
}

const live = scan();
const keyOf = (h) => `${h.file}:${h.line}`;
const snapshotByKey = new Map((snapshot.hits ?? []).map((h) => [keyOf(h), h]));
const liveByKey = new Map(live.map((h) => [keyOf(h), h]));

const added = live.filter((h) => !snapshotByKey.has(keyOf(h)));
const vanished = (snapshot.hits ?? []).filter((h) => !liveByKey.has(keyOf(h)));

if (added.length > 0 || vanished.length > 0) {
  const countByFile = (hs) => {
    const m = new Map();
    for (const h of hs) m.set(h.file, (m.get(h.file) ?? 0) + 1);
    return m;
  };
  if (added.length > 0) {
    console.error(`new hits appeared (${added.length}) — migrate them or refresh the snapshot:`);
    for (const [f, n] of countByFile(added)) console.error(`  ${n}x ${f}`);
    for (const h of added.slice(0, 20)) console.error(`    + ${h.file}:${h.line}  ${h.text}`);
    if (added.length > 20) console.error(`    … and ${added.length - 20} more`);
  }
  if (vanished.length > 0) {
    console.error(`committed hits vanished (${vanished.length}) without a snapshot update — rerun: npm run gen:migration`);
    for (const [f, n] of countByFile(vanished)) console.error(`  ${n}x ${f}`);
    for (const h of vanished.slice(0, 20)) console.error(`    - ${h.file}:${h.line}  ${h.text}`);
    if (vanished.length > 20) console.error(`    … and ${vanished.length - 20} more`);
  }
  die('live hits ≠ committed snapshot');
}

const files = new Set(live.map((h) => h.file));
if (live.length === 0 && (snapshot.hits ?? []).length === 0) {
  console.log('[icon-migration] check GREEN: migration complete — zero live hits, snapshot empty');
} else {
  console.log(`[icon-migration] check GREEN: ${live.length} hits across ${files.size} files match the committed snapshot (progress = shrink + re-run gen:migration)`);
}
