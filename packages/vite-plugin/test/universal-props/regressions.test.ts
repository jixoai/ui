// regression tests (explicit-props W5, the two Codex-suggested pins —
// mid-flight review GO 8.6): (a) query() AUTHORING-ORDER compile
// equivalence — {lg,sm} and {sm,lg} compile to IDENTICAL css (§9's
// registered-scale ruling, byte-identical at the same instance seed,
// at the emitter AND through the vite transform's virtual module);
// (b) the `@md/` empty-name FATAL diagnostic text pinned VERBATIM —
// the desugarer's parse rejection names the key and the rule, and the
// plugin surfaces it as `[jixoai:universal-props] <message>` (§9.1).
import { describe, expect, it } from 'vitest';
import type { Plugin } from 'vite';
import { createUniversalPropsPlugin } from '../../src/universal-props/vite-plugin.js';
import { desugarQueryCall, diagnoseQueryCall, scanQueryCalls, type DesugarCase } from '../../src/universal-props/desugar.js';

// ── (a) authoring-order compile equivalence ─────────────────────────
describe('regression (a): {lg,sm} ≡ {sm,lg} — authoring order never leaks', () => {
  const cases = (entries: readonly (readonly [string, string | number])[]): DesugarCase[] =>
    entries.map(([key, lane]) => ({ key, lane }));

  it('the emitter: same instance seed → BYTE-identical css (media keys)', () => {
    const a = desugarQueryCall('size', cases([['lg', 'large'], ['sm', 'small']]), 'medium', '/app/a.svelte#1');
    const b = desugarQueryCall('size', cases([['sm', 'small'], ['lg', 'large']]), 'medium', '/app/a.svelte#1');
    expect(b.css).toBe(a.css);
    expect(b.id).toBe(a.id);
    // and the ladder is the REGISTERED order, not the authored one
    expect(a.css.indexOf('(min-width: 40rem)')).toBeLessThan(a.css.indexOf('(min-width: 64rem)'));
  });

  it('the emitter: mixed media+container keys reorder to the same bytes', () => {
    const a = desugarQueryCall('radius', cases([['md', 'large'], ['@3xs', 'small'], ['sm', 'medium']]), undefined, '/app/b.svelte#1');
    const b = desugarQueryCall('radius', cases([['@3xs', 'small'], ['sm', 'medium'], ['md', 'large']]), undefined, '/app/b.svelte#1');
    expect(b.css).toBe(a.css);
    // the narrower @3xs container (16rem) precedes both media blocks
    expect(a.css.indexOf('(min-width: 16rem)')).toBeLessThan(a.css.indexOf('(min-width: 40rem)'));
  });

  it('the vite transform: the same file+call site compiles authoring orders to the SAME virtual module bytes', () => {
    const plugin: Plugin = createUniversalPropsPlugin();
    const asCtx = () => ({
      warn: () => {},
      error: (e: Error): never => {
        throw e;
      },
    });
    const transform = (code: string, id: string) =>
      plugin.transform!.call(asCtx() as never, code, id) as { code: string } | null;
    const virtualCssOf = (out: { code: string }): string => {
      const virtualId = /import '(virtual:jixoai-universal-props\/[0-9a-f]+\.css)';/.exec(out.code)![1]!;
      const resolved = plugin.resolveId!.call(undefined as never, virtualId, undefined as never) as string;
      return (plugin.load!.call(undefined as never, resolved)) as string;
    };
    // the SAME id (+ the same first call index) = the same instanceRef
    // seed = the same digest: only the AUTHORING ORDER differs
    const orderA = transform(
      `<input size={query({ lg: 'large', sm: 'small' }, 'medium')} />`,
      '/x/order-equivalence.svelte',
    )!;
    const cssA = virtualCssOf(orderA);
    const orderB = transform(
      `<input size={query({ sm: 'small', lg: 'large' }, 'medium')} />`,
      '/x/order-equivalence.svelte',
    )!;
    const cssB = virtualCssOf(orderB);
    // byte-identical, header (the module id) included
    expect(cssB).toBe(cssA);
    expect(cssA).toContain('@media (min-width: 40rem)');
    expect(cssA).toContain('@media (min-width: 64rem)');
    expect(cssA.indexOf('(min-width: 40rem)')).toBeLessThan(cssA.indexOf('(min-width: 64rem)'));
  });
});

// ── (b) the @md/ FATAL diagnostic pinned verbatim ────────────────────
describe('regression (b): the @md/ empty-name FATAL message', () => {
  // the frozen diagnostic text (desugar.ts's parse rejection): the key,
  // the grammar, the size-first rule — every fragment load-bearing
  const PINNED_MESSAGE =
    "query() key '@md/': the named-container grammar demands a NON-EMPTY name segment " +
    "(design §9 — `@<scale>/<name>`, size first); `@md/` is a parse error";

  it('the diagnostic is fatal with the message pinned BYTE-for-byte', () => {
    const call = scanQueryCalls(`<input size={query({ '@md/': 'large' })} />`)[0]!;
    const diags = diagnoseQueryCall(call, '');
    expect(diags).toHaveLength(1);
    expect(diags[0]).toMatchObject({ code: 'empty-container-name', key: '@md/', fatal: true });
    expect(diags[0]!.message).toBe(PINNED_MESSAGE);
  });

  it('the plugin surfaces it as the build ERROR with the [jixoai:universal-props] prefix', () => {
    const plugin: Plugin = createUniversalPropsPlugin();
    const asCtx = () => ({
      warn: () => {},
      error: (e: Error): never => {
        throw e;
      },
    });
    let thrown: unknown;
    try {
      plugin.transform!.call(asCtx() as never, `<input size={query({ '@md/': 'large' })} />`, '/x/bad-key.svelte');
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toBe(`[jixoai:universal-props] ${PINNED_MESSAGE}`);
  });
});
