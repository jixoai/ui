/**
 * tw-standard-layer-probe — the .jx-html-* architecture, empirically
 * (native-contract-fusion V2 / jx-html standard layer, 2026-08-27).
 *
 * The Owner-pinned architecture: ONE declaration source —
 * `.jx-html-*` standard classes authored as @apply/@utility — with
 * two applications: the registry consumes the classes, and jx-pure's
 * bare-element rules APPLY them (`input { @apply jx-html-input }`).
 *
 * Preconditions, all probed through the REAL pipeline (vite +
 * @tailwindcss/vite, child process — vitest's virtual runner breaks
 * rolldown's tsconfig discovery):
 *
 *   P1  a custom @utility is consumable as a markup class
 *   P2  a sheet in the entry @import chain can @apply it
 *   P3  variant blocks transfer (non-vacuous)
 *   P4  subtree laws (&>label, :has()) and pseudo carriers transfer
 *       with the COMPOUND spelling; the descendant anti-shape is P5
 *   P6  @media degradation laws transfer (single-source reduced-motion)
 *   P7  @supports engine gates transfer (the select chevron branch)
 *
 * SERIALIZATION GRAMMAR (lightningcss, recorded in design §11.3):
 * single-colon :before, double-quoted content:"", durations
 * minimized (150ms → .15s), media features without inner spaces
 * (prefers-reduced-motion:reduce).
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

  writeFileSync(
    resolve(FIXTURE, 'entry.css'),
    `@import 'tailwindcss';
@import '../src/lib/jixoai.css';
@import './standard.css';
@import './face.css';
`,
  );

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
/* the degradation laws — @media inside @utility (single-source
   reduced-motion / forced-colors) */
@utility jx-probe-degrade {
  transition: background-color 150ms ease-out;
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}
/* engine gates — @supports inside @utility (the select chevron's
   Firefox branch depends on this transfer) */
@utility jx-probe-supports {
  appearance: none;
  @supports not selector(::-moz-range-progress) {
    background-image: linear-gradient(45deg, transparent 50%, var(--muted-foreground) 50%);
  }
}
`,
  );

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
.probe-face-degrade {
  @apply jx-probe-degrade;
}
.probe-face-supports {
  @apply jx-probe-supports;
}
`,
  );

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
    const base = r.css.match(/\.probe-face-states\{[^}]*\}/)?.[0] ?? '';
    expect(base).toContain('background:var(--muted)');
    const hover = r.css.match(/\.probe-face-states:hover\{[^}]*\}/)?.[0] ?? '';
    expect(hover, 'the :hover block must transfer through @apply').toContain('background:var(--primary)');
  }, 120_000);

  it('P4: subtree laws (&>label, :has()) and pseudo carriers transfer with correct selector shapes', () => {
    const r = runBuild();
    expect(r.ok, r.error).toBe(true);
    const seg = r.css.match(/\.probe-face-tgroup>label\{[^}]*\}/)?.[0] ?? '';
    expect(seg).toContain('min-block-size:var(--jx-hit)');
    const active = r.css.match(/\.probe-face-tgroup>label:has\(input:checked\)\{[^}]*\}/)?.[0] ?? '';
    expect(active, 'the :has() active law must transfer').toContain('background:var(--primary)');
    // SERIALIZATION: single-colon :before, double-quoted content:""
    const knob = r.css.match(/\.probe-face-switch:{1,2}before\{[^}]*\}/)?.[0] ?? '';
    expect(knob).toMatch(/content:("|'){2}/);
    const knobOn = r.css.match(/\.probe-face-switch:checked:{1,2}before\{[^}]*\}/)?.[0] ?? '';
    expect(knobOn, 'the COMPOUND spelling &:checked::before is the law').toContain('background:var(--primary-foreground)');
  }, 120_000);

  it('P5: the DESCENDANT spelling (&:checked &::before) is wrong — locked as the anti-shape', () => {
    const r = runBuild();
    expect(r.ok, r.error).toBe(true);
    const bad = r.css.match(/\.probe-face-switch-bad:checked[^{]*::before\{[^}]*\}/)?.[0] ?? '';
    expect(bad).not.toContain('background:var(--primary-foreground)');
    const compound = r.css.match(/\.probe-face-switch-bad:checked::before\{/);
    expect(compound, 'the descendant spelling must not emit the compound selector').toBeNull();
  }, 120_000);

  it('P6: @media degradation laws nested in the @utility transfer through @apply', () => {
    const r = runBuild();
    expect(r.ok, r.error).toBe(true);
    // SERIALIZATION: durations minimized (150ms → .15s)
    const base = r.css.match(/\.probe-face-degrade\{[^}]*\}/)?.[0] ?? '';
    expect(base).toMatch(/transition:background-color\s+\.?\d+m?s/);
    // SERIALIZATION: media features have no inner space
    const idx = r.css.indexOf('@media (prefers-reduced-motion:reduce)');
    expect(idx).toBeGreaterThan(-1);
    const scoped = r.css.slice(idx);
    expect(scoped, 'the reduced-motion kill must transfer through @apply').toMatch(
      /\.probe-face-degrade\{transition:none\}/,
    );
  }, 120_000);

  it('P7: @supports engine gates nested in the @utility transfer through @apply', () => {
    const r = runBuild();
    expect(r.ok, r.error).toBe(true);
    const idx = r.css.indexOf('@supports not selector(');
    expect(idx).toBeGreaterThan(-1);
    const scoped = r.css.slice(idx);
    expect(scoped, 'the @supports branch must transfer to the applying selector').toMatch(
      /\.probe-face-supports\{[^}]*background-image/,
    );
  }, 120_000);
});
