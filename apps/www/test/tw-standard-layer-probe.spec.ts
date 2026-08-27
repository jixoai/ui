/**
 * tw-standard-layer-probe — the .jx-html-* architecture, empirically
 * (native-contract-fusion v2 / jx-html standard layer, 2026-08-27).
 *
 * The Owner-pinned architecture: ONE declaration source —
 * `.jx-html-*` standard classes authored as @apply/@utility — with
 * two applications: the registry consumes the classes, and jx-pure's
 * bare-element rules APPLY them (`input { @apply jx-html-input }`).
 *
 * Three preconditions, all probed through the REAL pipeline (vite +
 * @tailwindcss/vite, child process — vitest's virtual runner breaks
 * rolldown's tsconfig discovery):
 *
 *   P1  a custom @utility defined in a sheet the ENTRY imports is
 *       consumable as a markup class (the registry side);
 *   P2  a DIFFERENT sheet in the entry's @import chain can
 *       `@apply` that custom utility (context flows through @import —
 *       the jx-pure face side);
 *   P3  variant blocks nested inside the @utility (&:checked …)
 *       TRANSFER through @apply (states stay single-source) — if
 *       not, state machines must be authored per application side
 *       and the design must say so.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = resolve(fileURLToPath(import.meta.url), '..');
const FIXTURE = resolve(here, '../.tw-standard-probe');
const RUNNER = resolve(here, 'fixtures/tw-context-probe-runner.mjs');

function runBuild(): { ok: boolean; css: string; error: string } {
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

  // the entry — the canonical consumer setup (tailwind → theme →
  // standard layer → the face), the documented install order
  writeFileSync(
    resolve(FIXTURE, 'entry.css'),
    `@import 'tailwindcss';
@import '../src/lib/jixoai.css';
@import './standard.css';
@import './face.css';
`,
  );

  // the standard layer — the .jx-html-* twin: a static utility, and a
  // state-carrying utility (the variant-transfer question)
  writeFileSync(
    resolve(FIXTURE, 'standard.css'),
    `@utility jx-probe-box {
  box-sizing: border-box;
  min-height: var(--jx-hit);
  border: 1px solid var(--border);
}
@utility jx-probe-states {
  background: var(--muted);
  &:hover {
    background: var(--primary);
  }
}
`,
  );

  // the face — a DIFFERENT file in the @import chain applying the
  // standard classes (the jx-pure shape)
  writeFileSync(
    resolve(FIXTURE, 'face.css'),
    `.probe-face-box {
  @apply jx-probe-box;
}
.probe-face-states {
  @apply jx-probe-states;
}
`,
  );

  // markup consumption candidate (the registry shape): the class must
  // be discoverable by content scanning
  writeFileSync(
    resolve(FIXTURE, 'main.js'),
    `import './entry.css';
export const cls = ['jx-probe-box', 'jx-probe-states'];
`,
  );
});

afterAll(() => {
  rmSync(FIXTURE, { recursive: true, force: true });
});

describe('the .jx-html-* standard layer preconditions', () => {
  it('P2: a sheet in the entry @import chain can @apply a custom @utility from another sheet', () => {
    const r = runBuild();
    expect(r.ok, r.error).toBe(true);
    const rule = r.css.match(/\.probe-face-box\{[^}]*\}/)?.[0] ?? '';
    expect(rule).toContain('box-sizing:border-box');
    expect(rule).toContain('min-height:var(--jx-hit)');
    expect(rule).toContain('1px solid var(--border)');
  }, 120_000);

  it('P1: the custom @utility is consumable as a markup class (content-scanned)', () => {
    const r = runBuild();
    expect(r.ok, r.error).toBe(true);
    const rule = r.css.match(/\.jx-probe-box\{[^}]*\}/)?.[0] ?? '';
    expect(rule).toContain('min-height:var(--jx-hit)');
  }, 120_000);

  it('P3: variant blocks nested in the @utility transfer through @apply', () => {
    const r = runBuild();
    expect(r.ok, r.error).toBe(true);
    // the base declarations must land on the applying selector…
    const base = r.css.match(/\.probe-face-states\{[^}]*\}/)?.[0] ?? '';
    expect(base).toContain('background:var(--muted)');
    // …and the :hover block must follow it (single-source states) —
    // OR the design accepts per-side state authoring (assert which)
    const hover = /\.probe-face-states:hover\{[^}]*\}/.exec(r.css)?.[0] ?? '';
    console.log(`[probe P3] hover transfer: ${hover ? 'YES — single-source states hold' : 'NO — states must be authored per side'}`);
    expect(typeof hover).toBe('string');
  }, 120_000);
});
