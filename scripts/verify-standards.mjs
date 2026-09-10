#!/usr/bin/env node
// verify-standards — the frozen alignment laws, statically enforced
// (merge-alignment B1/B2, Codex ruling 2026-08-29).
//
//   B1  native form-control laws are TS-law-generated ONLY: outside
//       the css-laws marker slots, neither theme sheet may author
//       `@utility jx-html-*` or `@apply jx-html-*` (the retired chain
//       must never creep back by hand). The jx-hue-*/jx-pair-*
//       intent utilities are OUT OF SCOPE (a different, legal layer).
//
//   B2  icon paints ride the slot system: every data-URI glyph in the
//       theme sheets must be either a slot DEFINITION
//       (`--jx-icon-x: url(...)`) or a slot USE
//       (`var(--jx-icon-x, url(...))`) — a bare `url("data:image/svg`
//       in any other position is an untracked duplicate paint.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sheets = [
  ['jixoai.css', readFileSync(resolve(root, 'registry/files/theme/jixoai.css'), 'utf8')],
  ['jx-pure.css', readFileSync(resolve(root, 'registry/files/theme/jx-pure.css'), 'utf8')],
];

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error(`✗ ${msg}`);
};

// ── B1: the retired @utility/@apply chain stays retired ─────────────
for (const [name, css] of sheets) {
  // strip the generated slots first — the laws themselves live there
  const stripped = css.replace(
    /\/\* @jixoai\/css-laws:begin:[\s\S]*?\/\* @jixoai\/css-laws:end:[a-z-]+ \*\//g,
    '',
  );
  const handUtility = [...stripped.matchAll(/@utility\s+(jx-html-[a-z-]+)/g)].map((m) => m[1]);
  const handApply = [...stripped.matchAll(/@apply\s+(jx-html-[a-z-]+)/g)].map((m) => m[1]);
  if (handUtility.length) fail(`${name}: hand-authored @utility outside the law slots: ${handUtility.join(', ')}`);
  if (handApply.length) fail(`${name}: hand-authored @apply of jx-html-* outside the law slots: ${handApply.join(', ')}`);
}
console.log('✓ B1: no hand-authored jx-html-* @utility/@apply outside the generated slots');

// ── B2: every glyph paint rides a --jx-icon-* slot ──────────────────
for (const [name, css] of sheets) {
  for (const line of css.split('\n')) {
    if (!line.includes('url("data:image/svg') && !line.includes("url('data:image/svg")) continue;
    const isDefinition = /--jx-icon-[a-z-]+\s*:\s*url\(/.test(line);
    const isSlotUse = /var\(--jx-icon-[a-z-]+\s*,\s*url\(/.test(line);
    if (!isDefinition && !isSlotUse) {
      const snippet = line.trim().slice(0, 90);
      fail(`${name}: data-URI glyph outside the slot system (define --jx-icon-* or use var(--jx-icon-*, fallback)): "${snippet}…"`);
    }
  }
}
console.log('✓ B2: every data-URI glyph is a slot definition or a slotted use');

// ── B3 (HARD): the z-ladder host-resolution linter (stacking-isolation
// 2026-09-09; hardened followups T5, 2026-09-09). Every static
// z-index / z-[n] in the registry sources — sheets AND markup
// utilities — must clear ONE of four exits:
//   1. var-keyed z — dynamic by design (toast's calc ladder), skipped;
//   2. z=0 — the relative-z-0 rooting idiom IS the proof;
//   3. the page-terminal calibrated plane — seeds.json's whitelisted
//      values in the whitelisted files (40/80/90/100);
//   4. a HOSTS entry in stacking-ladder.seeds.json whose evidence
//      needle exists in the evidence file AT GATE TIME (isolation
//      declarations, rooting idioms, category annotations — so a
//      refactor that drops the proof fails even when the seed
//      survives).
// The registry asserts BIDIRECTIONALLY: an entry whose file yields no
// census site is STALE (the owner was deleted — prune the seed); a
// site with no exit is UNREGISTERED (root the ladder or annotate its
// category, then seed it). The browser-computed half of the law stays
// in verify-stacking-isolation; this is its static twin.
{
  const seeds = JSON.parse(readFileSync(join(root, 'scripts', 'stacking-ladder.seeds.json'), 'utf8'));
  const planeValues = new Set(seeds.terminalPlane.values);
  const planeFiles = new Set(seeds.terminalPlane.files);
  const registryFiles = [];
  // registry/files/routes/** is the gitignored dev-syncer mirror lane
  // (the icon-migration precedent: "dev-syncer droppings") — CI never
  // checks it out, so censusing it makes the gate environment-dependent
  // (the 2026-09-10 deploy failures: locally 42 sites via stale mirrors
  // vs CI's 37, and a route-mirror hosts entry STALE in CI from birth).
  // The committed law surface is tracked files only.
  const skippedLane = join(root, 'registry/files/routes');
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) {
        if (p === skippedLane) continue;
        walk(p);
      } else if (/\.(css|svelte)$/.test(name)) registryFiles.push(p);
    }
  };
  walk(resolve(root, 'registry/files'));
  const sites = []; // {rel, line, value}
  const fileHasSite = new Set();
  for (const p of registryFiles) {
    const rel = p.slice(root.length + 1);
    const lines = readFileSync(p, 'utf8').split('\n');
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/z-index:\s*([^;]+);?|z-\[(-?[a-z0-9]+)\]/g)) {
        const value = (m[1] ?? m[2]).trim();
        if (/var\(/.test(value)) continue; // exit 1: var-keyed — dynamic
        sites.push({ rel, line: i + 1, value });
        fileHasSite.add(rel);
      }
    });
  }
  const violations = [];
  const seededFiles = new Set(Object.keys(seeds.hosts));
  for (const site of sites) {
    if (site.value === '0') continue; // exit 2: the rooting idiom itself
    if (planeValues.has(site.value) && planeFiles.has(site.rel)) continue; // exit 3
    const host = seeds.hosts[site.rel];
    if (host === undefined) {
      violations.push(`UNREGISTERED ladder owner — ${site.rel}:${site.line} z=${site.value} (root the ladder: isolation / relative z-0, or annotate its category — then seed scripts/stacking-ladder.seeds.json)`);
      continue;
    }
    const evidence = readFileSync(join(root, host.evidence.file), 'utf8'); // exit 4
    if (!evidence.includes(host.evidence.needle)) {
      violations.push(`HOST PROOF GONE — ${site.rel}:${site.line} z=${site.value} seeds expect "${host.evidence.needle}" in ${host.evidence.file} (the refactor dropped the stacking-context evidence; restore it or re-seed)`);
    }
  }
  for (const rel of seededFiles) {
    if (!fileHasSite.has(rel)) {
      violations.push(`STALE seed — ${rel} carries no static z site anymore (prune its hosts entry)`);
    }
  }
  console.log(`ℹ B3 z-ladder host-resolution: ${sites.length} static z sites, ${seededFiles.size} seeded owners, ${planeFiles.size} terminal-plane files`);
  if (violations.length) {
    console.error('  ' + violations.join('\n  '));
    failures += violations.length;
  } else {
    console.log('  every static z cleared an exit (var-keyed / z-0 rooting / terminal plane / seeded host proof)');
  }
}

if (failures) {
  console.error(`\n[verify-standards] ${failures} violation(s)`);
  process.exit(1);
}
console.log('[verify-standards] GREEN — the alignment laws hold');
