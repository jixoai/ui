#!/usr/bin/env node
/**
 * Auto-dark variant generator (scripts/gen-jx-auto-dark.mjs).
 *
 * Owner goal (2026-08-24, completion round): a TRULY zero-JS static
 * page must be able to follow the OS dark mode. Codex r1 D4 rejected
 * hand-copying the .dark token block into jx-pure.css (drift); the
 * sanctioned path was "build a generative single source first" — this
 * script IS that generator.
 *
 * Pipeline (single source → generated region, idempotent):
 *
 *   registry/files/theme/jixoai.css  `.dark { … }` block   (the ONLY
 *     hand-maintained dark token source — edit it, never the output)
 *        ↓ extract declarations verbatim
 *   registry/files/theme/jx-pure.css  Part D between the BEGIN/END
 *     markers: a prefers-color-scheme:dark gate on
 *     :where(.jx-auto-dark) (mount on <html>, or any subtree) that
 *     never fires when an explicit .dark exists or inside .jx-light
 *     islands, plus the .jx-pure scope-root color-scheme companion.
 *
 * Usage:  node scripts/gen-jx-auto-dark.mjs
 * Then:   cp registry/files/theme/jx-pure.css apps/www/src/lib/jx-pure.css
 *         (test/jx-pure-parity.spec.ts FAILS the suite on drift —
 *          rerun this script whenever jixoai.css's .dark block moves)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokenPath = resolve(repoRoot, 'registry/files/theme/jixoai.css');
const sheetPath = resolve(repoRoot, 'registry/files/theme/jx-pure.css');

const BEGIN = '/* ==== BEGIN GENERATED · jx-auto-dark — scripts/gen-jx-auto-dark.mjs (do not hand-edit) ==== */';
const END = '/* ==== END GENERATED · jx-auto-dark ==== */';

/** extract the balanced-brace body of the first top-level `.dark {` rule */
function extractDarkDeclarations(css) {
  const start = css.indexOf('\n.dark {');
  if (start === -1) throw new Error('jixoai.css: no top-level .dark { block found');
  const open = css.indexOf('{', start);
  let depth = 1;
  let i = open + 1;
  while (depth > 0 && i < css.length) {
    const ch = css[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    i++;
  }
  if (depth !== 0) throw new Error('jixoai.css: unbalanced .dark block');
  return css.slice(open + 1, i - 1).trim();
}

const tokens = readFileSync(tokenPath, 'utf8');
const declarations = extractDarkDeclarations(tokens);

const block = `${BEGIN}
/* Derived 1:1 from jixoai.css's .dark block (single source). The gate
   rides :where() so the whole variant stays maximally overridable; it
   never fires where an explicit .dark already owns the theme, nor
   inside .jx-light islands. Mount: <html class="jx-pure jx-auto-dark"> */
@media (prefers-color-scheme: dark) {
  :where(.jx-auto-dark):not(.dark, .jx-light *) {
${declarations
  .split('\n')
  .map((line) => (line.trim() ? `    ${line}` : line))
  .join('\n')}
    color-scheme: dark;
  }
  /* the scope-root companion: without it B0's color-scheme: light would
     out-shout the inherited root scheme and native pickers/scrollbars
     would stay light under dark tokens (the inverted-A2 bug) */
  :where(.jx-auto-dark) :where(.jx-pure):not(.jx-light, .jx-light *):not(.no-jx-pure, .no-jx-pure *) {
    color-scheme: dark;
  }
}
${END}`;

const sheet = readFileSync(sheetPath, 'utf8');
let next;
if (sheet.includes(BEGIN)) {
  const from = sheet.indexOf(BEGIN);
  const to = sheet.indexOf(END) + END.length;
  next = sheet.slice(0, from) + block + sheet.slice(to);
} else {
  next = `${sheet.trimEnd()}\n\n${block}\n`;
}
writeFileSync(sheetPath, next);
console.log('jx-auto-dark region regenerated (%d declaration lines)', declarations.split('\n').filter((l) => l.trim().startsWith('--')).length);
