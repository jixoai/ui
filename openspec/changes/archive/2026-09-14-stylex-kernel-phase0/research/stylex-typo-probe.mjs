#!/usr/bin/env node
// stylex-typo-probe.mjs — the P0.3 type-safety probe (phase 0, tasks
// P0.3 "Type-safety probe: a typo'd token fails the kernel build
// (compiles green otherwise)"; the research D1-12 mechanism, transposed
// onto THIS repo's kernel typecheck).
//
// Mechanism: the www typecheck (vitest --typecheck, checker tsc) is
// the kernel's compile gate. The probe PLANTS a spec-d fixture that
// consumes the typed token layer (apps/www/src/lib/tokens.stylex —
// the mirror of the canonical registry/files/lib copy) and runs the
// typecheck scoped to that file twice:
//
//   1. CLEAN  — a correctly-spelled VarGroup member access compiles
//      GREEN (exit 0).
//   2. TYPO   — '--jx-primry' (a typo of '--jx-primary') must FAIL
//      the typecheck (exit non-zero) NAMING the token in the error
//      text — defineVars keys are TYPES (Readonly<{…StyleXVar…}>), so
//      a typo is a compile error, exactly the D1-12 receipt
//      ("Property '--probe-bgg' does not exist…").
//
// The planted file is removed in finally — the tree is left clean.
//
// Usage: node openspec/changes/2026-09-14-stylex-kernel-phase0/research/stylex-typo-probe.mjs
import { spawnSync } from 'node:child_process';
import { unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const wwwDir = join(repoRoot, 'apps', 'www');
const PROBE = join(wwwDir, 'test', 'stylex-typo-probe.spec-d.ts');

const cleanFixture = `import { expectTypeOf } from 'vitest';
// PLANTED by stylex-typo-probe.mjs (P0.3 type-safety probe) — this file
// is deleted by the probe's finally; do not commit.
import { tokens } from '../src/lib/tokens.stylex';

expectTypeOf(tokens['--jx-primary']).not.toBeNever();
`;

const typoFixture = cleanFixture.replace(
  "tokens['--jx-primary']",
  "tokens['--jx-primry']",
);

const runTypecheck = () => {
  const res = spawnSync(
    process.execPath,
    ['node_modules/vitest/vitest.mjs', '--typecheck', 'run', 'test/stylex-typo-probe.spec-d.ts'],
    { cwd: wwwDir, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  );
  return { status: res.status ?? -1, out: `${res.stdout ?? ''}\n${res.stderr ?? ''}` };
};

let verdict = 'FAIL';
let cleanStatus = -1;
let typoStatus = -1;
let typoNamesToken = false;
try {
  // 1. the clean consumption compiles green
  writeFileSync(PROBE, cleanFixture);
  const clean = runTypecheck();
  cleanStatus = clean.status;
  console.log(`[typo-probe] clean run exit=${cleanStatus}`);
  if (clean.status !== 0) {
    console.log(clean.out.trim().split('\n').slice(-12).join('\n'));
  }

  // 2. the typo'd key fails the kernel typecheck, naming the token
  writeFileSync(PROBE, typoFixture);
  const typo = runTypecheck();
  typoStatus = typo.status;
  typoNamesToken = typo.out.includes('--jx-primry');
  console.log(`[typo-probe] typo run exit=${typoStatus}; names token=${typoNamesToken}`);
  const naming = typo.out.split('\n').filter((l) => l.includes('--jx-primry')).slice(0, 3);
  for (const line of naming) console.log(`[typo-probe]   ${line.trim()}`);

  verdict = cleanStatus === 0 && typoStatus !== 0 && typoNamesToken ? 'PASS' : 'FAIL';
  console.log(
    ` ${verdict.padEnd(9)} P0.3 type-safety probe — clean exit=${cleanStatus} (0 required); ` +
      `typo exit=${typoStatus} (non-zero required); output names the token: ${typoNamesToken}`,
  );
} finally {
  try {
    unlinkSync(PROBE);
  } catch {}
}

process.exit(verdict === 'PASS' ? 0 : 1);
