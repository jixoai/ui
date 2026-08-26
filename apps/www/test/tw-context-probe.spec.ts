/**
 * tw-context-probe — the @apply boundary, empirically locked
 * (native-contract-fusion Phase 1, 2026-08-27).
 *
 * A registry folder css is a STANDALONE sheet: it has no Tailwind
 * context of its own. This probe compiles fixture sheets through the
 * REAL consumer pipeline (vite + @tailwindcss/vite, entry importing
 * tailwindcss + the jixoai theme) and pins the four-form boundary
 * the native-contract spec's mirror law depends on:
 *
 *   named theme utility   (bg-background / border-border) → MUST FAIL
 *   arbitrary utility     (min-h-[var(--jx-hit)])        → compiles
 *   core utility          (flex / sr-only / cursor-*)    → compiles
 *   variant-bearing       (last:border-r-0)              → compiles
 *                         into variant-scoped rules
 *
 * The named-form failure is the standing evidence for the ban
 * (token paint = plain CSS declarations or arbitrary utilities);
 * if a Tailwind upgrade ever changes this behavior, this test is
 * what tells us the law needs re-examining.
 *
 * The build runs in a child process (fixtures/tw-context-probe-runner.mjs)
 * — vitest's virtual module runner breaks rolldown's tsconfig
 * discovery inside an in-process vite build.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = resolve(fileURLToPath(import.meta.url), '..');
const FIXTURE = resolve(here, '../.tw-probe-fixture');
const RUNNER = resolve(here, 'fixtures/tw-context-probe-runner.mjs');
const LAYER_STATEMENT = '@layer theme, base, components, utilities;';

function runBuild(folderCss: string): { ok: boolean; css: string; error: string } {
  writeFileSync(
    resolve(FIXTURE, 'folder.css'),
    `${LAYER_STATEMENT}\n${folderCss}\n`,
  );
  const res = spawnSync('node', [RUNNER, FIXTURE, 'dist-out'], {
    cwd: resolve(here, '..'),
    encoding: 'utf8',
    timeout: 90_000,
  });
  if (res.status !== 0) {
    return { ok: false, css: '', error: res.stderr || `exit ${res.status}` };
  }
  return JSON.parse(res.stdout);
}

beforeAll(() => {
  rmSync(FIXTURE, { recursive: true, force: true });
  mkdirSync(FIXTURE, { recursive: true });
  writeFileSync(
    resolve(FIXTURE, 'entry.css'),
    `@import 'tailwindcss';\n@import '../src/lib/jixoai.css';\n`,
  );
  writeFileSync(resolve(FIXTURE, 'main.js'), `import './entry.css';\nimport './folder.css';\n`);
});

afterAll(() => {
  rmSync(FIXTURE, { recursive: true, force: true });
});

describe('the @apply boundary in standalone folder css', () => {
  it('rejects named theme utilities (no Tailwind context in a standalone sheet)', () => {
    const r = runBuild(`.jx-probe-named { @apply border-border bg-background; }`);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/Cannot apply unknown utility class `border-border`/);
  }, 120_000);

  it('compiles arbitrary utilities against tokens', () => {
    const r = runBuild(
      `.jx-probe-arbitrary { @apply min-h-[var(--jx-hit)] text-[length:var(--jx-text)]; }`,
    );
    expect(r.ok).toBe(true);
    expect(r.css).toContain('.jx-probe-arbitrary{min-height:var(--jx-hit);font-size:var(--jx-text)}');
  }, 120_000);

  it('compiles context-free core utilities', () => {
    const r = runBuild(
      `.jx-probe-core { @apply flex items-center box-border appearance-none sr-only; }`,
    );
    expect(r.ok).toBe(true);
    const rule = r.css.match(/\.jx-probe-core\{[^}]*\}/)?.[0] ?? '';
    expect(rule).toContain('display:flex');
    expect(rule).toContain('appearance:none');
    expect(rule).toContain('position:absolute'); // sr-only build
  }, 120_000);

  it('compiles variant-bearing utilities into variant-scoped rules', () => {
    const r = runBuild(
      `.jx-probe-variant { @apply last:border-r-0 disabled:cursor-not-allowed; }`,
    );
    expect(r.ok).toBe(true);
    expect(r.css).toMatch(/\.jx-probe-variant:last-child\{[^}]*border-right-width:0/);
    expect(r.css).toMatch(/\.jx-probe-variant:disabled\{[^}]*cursor:not-allowed/);
  }, 120_000);
});
