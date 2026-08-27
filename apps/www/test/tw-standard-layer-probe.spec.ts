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
/* the tgroup shape: a SUBTREE law inside one @utility */
@utility jx-probe-tgroup {
  display: inline-flex;
  & > label {
    min-block-size: var(--jx-hit);
    &:has(input:checked) {
      background: var(--primary);
    }
  }
}
/* the switch shape: pseudo carriers. The DESCENDANT spelling
   (&:checked &::before) desugars to a self-descendant selector that
   never matches — the compound spelling is the law. */
@utility jx-probe-switch {
  appearance: none;
  &::before {
    content: '';
    display: block;
    background: var(--background);
  }
  &:checked::before {
    background: var(--primary-foreground);
  }
}
@utility jx-probe-switch-bad {
  &::before {
    content: '';
  }
  &:checked &::before {
    background: var(--primary-foreground);
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
.probe-face-tgroup {
  @apply jx-probe-tgroup;
}
.probe-face-switch {
  @apply jx-probe-switch;
}
.probe-face-switch-bad {
  @apply jx-probe-switch-bad;
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

  it('P3: variant blocks nested in the @utility transfer through @apply (NON-vacuous)', () => {
    const r = runBuild();
    expect(r.ok, r.error).toBe(true);
    // the base declarations must land on the applying selector…
    const base = r.css.match(/\.probe-face-states\{[^}]*\}/)?.[0] ?? '';
    expect(base).toContain('background:var(--muted)');
    // …and the :hover block MUST follow (single-source states) —
    // r0 review: the old `typeof === 'string'` assert was vacuous
    const hover = r.css.match(/\.probe-face-states:hover\{[^}]*\}/)?.[0] ?? '';
    expect(hover, 'the :hover block must transfer through @apply').toContain('background:var(--primary)');
  }, 120_000);

  it('P4: subtree laws (&>label, :has()) and pseudo carriers (::before) transfer with correct selector shapes', () => {
    const r = runBuild();
    expect(r.ok, r.error).toBe(true);
    // the tgroup subtree: the child rule lands as a descendant of the
    // applying selector, :has() intact
    const seg = r.css.match(/\.probe-face-tgroup>label\{[^}]*\}/)?.[0] ?? '';
    expect(seg).toContain('min-block-size:var(--jx-hit)');
    const active = r.css.match(/\.probe-face-tgroup>label:has\(input:checked\)\{[^}]*\}/)?.[0] ?? '';
    expect(active, 'the :has() active law must transfer').toContain('background:var(--primary)');
    // the switch pseudo carrier: compound pseudo after the pseudo-class.
    // SERIALIZATION NOTE (grammar law): lightningcss emits single-colon
    // :before and double-quoted content:"" — assertions match both
    // spellings; the canonical grammar records the emitted form.
    const knob = r.css.match(/\.probe-face-switch:{1,2}before\{[^}]*\}/)?.[0] ?? '';
    expect(knob).toMatch(/content:("|'){2}/);
    const knobOn = r.css.match(/\.probe-face-switch:checked:{1,2}before\{[^}]*\}/)?.[0] ?? '';
    expect(knobOn, 'the COMPOUND spelling &:checked::before is the law').toContain('background:var(--primary-foreground)');
  }, 120_000);

  it('P5: the DESCENDANT spelling (&:checked &::before) is wrong — locked as the anti-shape', () => {
    const r = runBuild();
    expect(r.ok, r.error).toBe(true);
    // the bad spelling desugars to a self-descendant selector that can
    // never match an input — it must NOT produce the compound form
    const bad = r.css.match(/\.probe-face-switch-bad:checked[^{]*::before\{[^}]*\}/)?.[0] ?? '';
    expect(bad).not.toContain('background:var(--primary-foreground)');
    const compound = r.css.match(/\.probe-face-switch-bad:checked::before\{/);
    expect(compound, 'the descendant spelling must not emit the compound selector').toBeNull();
  }, 120_000);
});
