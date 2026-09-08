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

// ── B3 (ADVISORY): the z-ladder census (stacking-isolation, 2026-09-09)
// Every static z-index / z-[n] in the registry sources — sheets AND
// markup utilities — printed with its file:line so drift surfaces on
// every gate run. ADVISORY by design this round: the full
// host-resolution linter (resolve each ladder's common parent, require
// a stacking-context proof or a category annotation, accept var-keyed
// calc, flag static-z no-ops) is the recorded follow-up; the HARD half
// of the law is browser-computed in verify-stacking-isolation.
{
  const registryFiles = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(css|svelte)$/.test(name)) registryFiles.push(p);
    }
  };
  walk(resolve(root, 'registry/files'));
  const census = [];
  for (const p of registryFiles) {
    const rel = p.slice(root.length + 1);
    const lines = readFileSync(p, 'utf8').split('\n');
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/z-index:\s*([^;]+);?|z-\[(-?[a-z0-9]+)\]/g)) {
        const value = (m[1] ?? m[2]).trim();
        if (/var\(/.test(value)) continue; // var-keyed z (toast's calc ladder) — dynamic by design
        census.push(`${rel}:${i + 1}  z=${value}`);
      }
    });
  }
  console.log(`ℹ B3 z-ladder census (advisory): ${census.length} static z assignments across registry sheets + markup`);
  console.log('  ' + census.join('\n  '));
  console.log('  law: every ladder owner roots its ladder (isolation: isolate / relative z-0) or carries a category annotation — stacking-isolation design');
}

if (failures) {
  console.error(`\n[verify-standards] ${failures} violation(s)`);
  process.exit(1);
}
console.log('[verify-standards] GREEN — the alignment laws hold');
