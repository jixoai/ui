#!/usr/bin/env node
// probe-check.mjs — D1-12: token typo must FAIL compilation, naming
// the token; a valid file must compile clean.
//
// Mechanism: svelte-check (covers .svelte + .ts under tsconfig). The
// bad file references a typo'd VarGroup key (--probe-bgg) — defineVars
// keys are TYPES (VarGroup), so a typo is a type error naming the key.
import { spawnSync } from 'node:child_process';
import { writeFileSync, unlinkSync, existsSync } from 'node:fs';

const BAD = new URL('../src/TypoProbe.svelte', import.meta.url).pathname;

const run = () =>
  spawnSync('npx', ['svelte-check', '--tsconfig', './tsconfig.json'], {
    cwd: new URL('..', import.meta.url).pathname,
    encoding: 'utf8',
  });

// 1. valid file compiles clean (the project as-is)
const clean = run();
const cleanOut = (clean.stdout || '') + (clean.stderr || '');
console.log(`[probe-check] clean run exit=${clean.status}`);
// svelte-check exits 1 on ERRORS, 0/1? — it exits non-zero when error count > 0.
const cleanErrors = /Error:\d+/.exec(cleanOut)?.[0] ?? null;
console.log(`[probe-check] clean svelte-check tail: ${cleanOut.trim().split('\n').slice(-4).join(' | ')}`);

// 2. typo'd token ref must fail, naming the token
writeFileSync(
  BAD,
  `<script lang="ts">
  // D1-12: deliberately bogus token ref — '--probe-bgg' is a TYPO of
  // '--probe-bg'. defineVars keys are typed (VarGroup) so this must be
  // a compile error naming the key.
  import * as stylex from '@stylexjs/stylex';
  import { tokens } from './tokens.stylex';
  const styles = stylex.create({
    bad: { backgroundColor: tokens['--probe-bgg'] },
  });
</script>
<div {...stylex.attrs(styles.bad)}>typo probe</div>
`,
);
let badStatus = 0;
let badOut = '';
try {
  const bad = run();
  badStatus = bad.status ?? -1;
  badOut = (bad.stdout || '') + (bad.stderr || '');
} finally {
  unlinkSync(BAD);
}
const namesToken = /--probe-bgg|--probe-bg/.test(badOut);
console.log(`[probe-check] bad run exit=${badStatus}; names token=${namesToken}`);
console.log(`[probe-check] bad svelte-check matches: ${(badOut.match(/.*probe-bg.*/g) || []).slice(0, 3).join(' || ')}`);

const verdict = clean.status === 0 && badStatus !== 0 && namesToken ? 'PASS' : 'FAIL';
console.log(` ${verdict.padEnd(9)} D1-12 — clean exit=${clean.status} (0 required); typo exit=${badStatus} (non-zero required); output names the token: ${namesToken}`);
process.exit(verdict === 'PASS' ? 0 : 1);
