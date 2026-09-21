// desugarer tests (explicit-props W2 task 2.5): the static cases
// (media / container / named container / ladder-order / base-default
// / media-first same-width composition) and ALL FOUR diagnostics —
// the §9.1 test matrix (desugar snapshots × {media, container, named,
// ladder-order, base-default} + the no-container warning; `@md/` is
// §9's parse ERROR).
import { describe, expect, it } from 'vitest';
import {
  carrierDeclarationsFor,
  desugarQueryCall,
  diagnoseQueryCall,
  parseLaneLiteral,
  scanQueryCalls,
  type DesugarCase,
} from '../../src/universal-props/desugar.js';

describe('the scanner', () => {
  it('finds literal query() calls with keys + base + axis context', () => {
    const src = `<press-button size={query({ sm: 'small', '@md/card': 42 }, 'large')}>go</press-button>`;
    const calls = scanQueryCalls(src);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ keys: ['sm', '@md/card'], base: "'large'", axis: 'size', dynamic: false });
  });
  it('ignores member calls (x.query) and bare identifiers', () => {
    const src = `const a = foo.query({ sm: 1 }); const b = queryx({ sm: 1 });`;
    expect(scanQueryCalls(src)).toHaveLength(0);
  });
  it('marks non-object first arguments dynamic', () => {
    const calls = scanQueryCalls(`const q = query(props.cases, 'auto');`);
    expect(calls[0]).toMatchObject({ dynamic: true, axis: null });
  });
  it('handles quoted keys and nested braces in values', () => {
    const calls = scanQueryCalls(`size={query({ '@sm/card': 'small', md: { deep: 1 } })}`);
    expect(calls[0]?.keys).toEqual(['@sm/card', 'md']);
  });
});

describe('the four key diagnostics (§9/§9.1)', () => {
  const diagnose = (obj: string, file = ''): string[] => {
    const call = scanQueryCalls(`size={query(${obj})}`)[0]!;
    return diagnoseQueryCall(call, file);
  };

  it('unknown-scale — names the key and the registered tables', () => {
    const diags = diagnose("{ xl: 'small', '@2xl': 2 }");
    expect(diags.filter((d) => d.code === 'unknown-scale')).toHaveLength(2);
    expect(diags[0]).toMatchObject({ fatal: false });
    expect(diags[0]!.message).toContain("'xl'");
  });
  it('duplicate-key — textual duplicates, later wins', () => {
    const diags = diagnose("{ sm: 'small', sm: 'large' }");
    expect(diags).toHaveLength(1);
    expect(diags[0]).toMatchObject({ code: 'duplicate-key', key: 'sm', fatal: false });
  });
  it('empty-container-name — @md/ is §9\'s FATAL parse rejection', () => {
    const diags = diagnose("{ '@md/': 'large' }");
    expect(diags).toHaveLength(1);
    expect(diags[0]).toMatchObject({ code: 'empty-container-name', fatal: true });
    expect(diags[0]!.message).toContain('NON-EMPTY name segment');
  });
  it('missing-container-ancestor — an @ key with no container supply in the file', () => {
    const bare = diagnose("{ '@sm': 'small' }", `<main>nothing here</main>`);
    expect(bare.some((d) => d.code === 'missing-container-ancestor' && d.fatal === false)).toBe(true);
    const supplied = diagnose("{ '@sm': 'small' }", `<style>.card { container-type: inline-size; }</style>`);
    expect(supplied.some((d) => d.code === 'missing-container-ancestor')).toBe(false);
    // a NAMED key whose name the file declares also silences the heuristic
    const named = diagnose("{ '@sm/card': 'small' }", `<div style="container-name: card"></div>`);
    expect(named.some((d) => d.code === 'missing-container-ancestor')).toBe(false);
  });
  it('media-only calls raise nothing', () => {
    expect(diagnose("{ sm: 'small', lg: 'large' }")).toHaveLength(0);
  });
});

describe('the carrier declarations (the stampCarriers build twin)', () => {
  it('size named → var indirection + font-size; number → px', () => {
    expect(carrierDeclarationsFor('size', 'small')).toEqual([
      '--jx-size-effective: var(--jx-size-small)',
      'font-size: var(--jx-size-effective, 1rem)',
    ]);
    expect(carrierDeclarationsFor('size', 20)).toContain('--jx-size-effective: 20px');
  });
  it('shape stamps the alias + the per-shape factor (§14\'s frozen chain)', () => {
    expect(carrierDeclarationsFor('shape', 'squircle')).toEqual([
      '--jx-shape-effective: var(--jx-shape-squircle)',
      '--jx-radius-factor-effective: var(--jx-radius-factor-squircle)',
    ]);
  });
  it('density: named → coefficient 1; number → the coefficient', () => {
    expect(carrierDeclarationsFor('density', 'sm')).toEqual(['--jx-density-coefficient: 1']);
    expect(carrierDeclarationsFor('density', 0.75)).toEqual(['--jx-density-coefficient: 0.75']);
  });
  it('color: named → var; number → the oklch hue formula with load-bearing fallbacks; raw → passthrough', () => {
    expect(carrierDeclarationsFor('color', 'primary')).toEqual(['--jx-color-effective: var(--jx-color-primary)']);
    const hue = carrierDeclarationsFor('color', 260)![0]!;
    expect(hue).toContain('oklch(var(--jx-color-formula-l, 0.6489)');
    expect(hue).toContain('calc(260 + var(--jx-color-formula-drift, 0))');
    expect(carrierDeclarationsFor('color', 'var(--accent)')).toEqual([
      '--jx-color-effective: var(--accent)',
    ]);
  });
  it('theme is NEVER a var (the .dark class bridge) — un-desugarable by construction', () => {
    expect(carrierDeclarationsFor('theme', 'dark')).toBeNull();
  });
  it('elevation named resolves §0.1\'s dp table; number is verbatim', () => {
    expect(carrierDeclarationsFor('elevation', 'level-1')).toEqual(['--jx-elevation-effective: -1']);
    expect(carrierDeclarationsFor('elevation', 'level3')).toEqual(['--jx-elevation-effective: 6']);
    expect(carrierDeclarationsFor('elevation', 9)).toEqual(['--jx-elevation-effective: 9']);
  });
});

describe('the emitter (§9.1 compile output)', () => {
  const cases = (entries: readonly (readonly [string, string | number])[]): DesugarCase[] =>
    entries.map(([key, lane]) => ({ key, lane }));

  it('media keys → @media (min-width: …rem) on the instance selector', () => {
    const r = desugarQueryCall('size', cases([['sm', 'small']]), undefined, 'seed');
    expect(r.css).toBe(
      [
        '@media (min-width: 40rem) {',
        "  [data-jx-q-size='" + r.id + "'] {",
        '    --jx-size-effective: var(--jx-size-small);',
        '    font-size: var(--jx-size-effective, 1rem);',
        '  }',
        '}',
      ].join('\n'),
    );
  });
  it('named container keys → @container <name> (min-width: …rem)', () => {
    const r = desugarQueryCall('size', cases([['@md/card', 42]]), undefined, 'seed');
    expect(r.css).toContain('@container card (min-width: 28rem) {');
    expect(r.css).toContain('--jx-size-effective: 42px;');
  });
  it('bare container keys → @container (min-width: …rem)', () => {
    const r = desugarQueryCall('radius', cases([['@sm', 'large']]), undefined, 'seed');
    expect(r.css).toContain('@container (min-width: 24rem) {');
  });

  it('AUTHORING-ORDER INDEPENDENCE: {lg,sm} and {sm,lg} compile to IDENTICAL css', () => {
    const a = desugarQueryCall('size', cases([['lg', 'large'], ['sm', 'small']]), 'medium', 'seed-a');
    const b = desugarQueryCall('size', cases([['sm', 'small'], ['lg', 'large']]), 'medium', 'seed-b');
    // ids differ (seeded); the css body differs only by the id — normalize it
    const norm = (s: string) => s.replace(/'[\da-f]{8}'/g, "'ID'");
    expect(norm(a.css)).toBe(norm(b.css));
    // and the emission order is the REGISTERED scale order (sm block first)
    expect(a.css.indexOf('(min-width: 40rem)')).toBeLessThan(a.css.indexOf('(min-width: 64rem)'));
  });

  it('emission follows the THRESHOLD ladder: @sm (24rem) before md (48rem)', () => {
    // the default tables share no width, so pure ladder order holds —
    // the same-width media-first tie law is pinned in alias-tables
    // (compareQueryKeyOrder); here the NARROWER container block emits
    // first and the wider media block overrides where both match
    const r = desugarQueryCall('size', cases([['md', 'small'], ['@sm', 'large']]), undefined, 'seed');
    expect(r.css.indexOf('@container (min-width: 24rem)')).toBeLessThan(
      r.css.indexOf('@media (min-width: 48rem)'),
    );
  });

  it('base-default: no base block is emitted (the runtime stamps base inline — SSR first paint)', () => {
    const r = desugarQueryCall('size', cases([['sm', 'small']]), 'large', 'seed');
    expect(r.css).not.toContain('medium');
    expect(r.css).not.toMatch(/:root|--jx-size-medium/);
  });

  it('theme-axis queries and unknown-scale keys emit nothing (reasons recorded)', () => {
    expect(desugarQueryCall('theme', cases([['sm', 'dark']]), 'auto', 's').reason).toBe('theme-axis');
    expect(desugarQueryCall('size', cases([['badkey', 'small']]), undefined, 's').reason).toBe('no-cases');
    expect(desugarQueryCall(null, cases([['sm', 'small']]), undefined, 's').reason).toBe('no-axis');
  });
});

describe('parseLaneLiteral', () => {
  it('strings, numbers, and anything else', () => {
    expect(parseLaneLiteral("'small'")).toBe('small');
    expect(parseLaneLiteral('42')).toBe(42);
    expect(parseLaneLiteral('-1')).toBe(-1);
    expect(parseLaneLiteral('0.75')).toBe(0.75);
    expect(parseLaneLiteral('null')).toBe('null');
    expect(parseLaneLiteral(null)).toBeUndefined();
  });
});
