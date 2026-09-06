/**
 * Sugar High backend suite (test/code-card-backend-sugar-high.spec.ts,
 * highlight-engine-matrix, 2026-09-06).
 *
 * The engine-matrix contract for the sugar-high item, verified against a
 * bare <pre><code> box (the codeBox skeleton from
 * code-card-backend.spec.ts):
 *   - lazy loading FIRST (see that suite's note): a passthrough vi.mock
 *     counts engine loads — zero on construction, one on first paint,
 *     still one on later paints (the shared cached promise)
 *   - the markup contract: sh__line wrappers + sh__token-- spans land
 *     INSIDE the given element, sample text preserved, the engine's own
 *     entity escaping (raw sample markup never leaks as elements), the
 *     "\n" line join surviving innerHTML
 *   - the output form locked as measured (2.3.1, node): the inline style
 *     is an UNRESOLVED color:var(--sh-*) reference — the pairing
 *     sugar-high-jixoai.css resolves (jsdom does not load stylesheets,
 *     so this spec asserts the reference form; the resolution mapping
 *     and its rationale live in that file's own header)
 *   - language laws: aliases canonicalize before the engine call
 *     (ts→typescript, bash→shell); tsx rejects with the shiki hint; an
 *     unknown lang rejects listing the 29-name canonical set; rejects
 *     leave the plain sample standing
 *   - theme semantics: an unknown theme name warns and stays on the
 *     engine's default form
 *
 * The passthrough mock wraps the REAL engine (every behavior asserted
 * below is sugar-high's own, not a hand-rolled stand-in) while exposing
 * the factory-invocation count and the highlight call log.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { sugarHigh } from '../src/lib/highlight/sugar-high';

/**
 * Engine-load counter — increments each time the mocked specifier is
 * (re)materialized, i.e. each time the backend's dynamic
 * import('sugar-high') actually runs (vi.resetModules clears the
 * registry, so the lazy spec below can observe a fresh load).
 */
let engineLoads = 0;

vi.mock('sugar-high', async (importOriginal) => {
  engineLoads++;
  const actual = await importOriginal<typeof import('sugar-high')>();
  return { highlight: vi.fn(actual.highlight) };
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** a bare <pre><code> box, the shape every backend paints into */
function codeBox(): { pre: HTMLElement; code: HTMLElement } {
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  pre.append(code);
  document.body.append(pre);
  return { pre, code };
}

const SAMPLE = 'const value: number = 42;';

// ===========================================================================
// 1 · lazy loading (nothing of sugar-high joins the page until a paint)
// ===========================================================================
describe('sugarHigh — lazy loading', () => {
  it('zero engine loads on construction, one on first paint, cached after', async () => {
    // THIS SUITE RUNS FIRST on purpose: the engine-load counter is the
    // mock factory's invocation count, and vitest caches a factory's
    // result for the file's whole module graph — the one shared load is
    // observable exactly once, before any other spec has painted. The
    // backend module's own engine cache (module-scoped libPromise) is
    // equally untouched at this point, so no resetModules dance is
    // needed: construction and paints below exercise the real caches.
    expect(engineLoads).toBe(0);

    sugarHigh(); // construct only — no paint
    expect(engineLoads).toBe(0);

    const first = codeBox();
    await sugarHigh().highlight(first.code, 'const a = 1;', { lang: 'ts' });
    expect(engineLoads).toBe(1);
    expect(first.code.querySelector('.sh__line')).not.toBeNull();

    // the shared cached promise: a second paint loads nothing more
    const second = codeBox();
    await sugarHigh().highlight(second.code, 'const b = 2;', { lang: 'ts' });
    expect(engineLoads).toBe(1);
    expect(second.code.querySelector('.sh__line')).not.toBeNull();
  });
});

// ===========================================================================
// 2 · the markup contract (the real engine through the passthrough mock)
// ===========================================================================
describe('sugarHigh — the markup contract', () => {
  it('sh__line/sh__token spans land inside the box, text preserved', async () => {
    const { code } = codeBox();

    expect(sugarHigh().id).toBe('sugar-high');
    await sugarHigh().highlight(code, SAMPLE, { lang: 'ts' });

    // markup landed INSIDE the given element (its own <code>, not a new pre)
    expect(code.querySelector('span.sh__line')).not.toBeNull();
    expect(code.querySelector('span[class^="sh__token--"]')).not.toBeNull();
    expect(code.textContent).toContain('const value: number = 42;');
  });

  it('the inline style is the measured var(--sh-*) reference form', async () => {
    const { code } = codeBox();
    await sugarHigh().highlight(code, SAMPLE, { lang: 'ts' });
    // the empirical 2.3.1 output: class + UNRESOLVED color reference —
    // sugar-high-jixoai.css is the file that resolves it
    expect(code.innerHTML).toContain('class="sh__token--keyword"');
    expect(code.innerHTML).toContain('color:var(--sh-keyword)');
  });

  it('the engine escapes token values itself — sample markup never leaks as elements', async () => {
    const { code } = codeBox();
    const raw = 'const s = "<b>&amp;</b>";';
    await sugarHigh().highlight(code, raw, { lang: 'typescript' });
    expect(code.querySelector('b')).toBeNull();
    expect(code.textContent).toContain('<b>&amp;</b>');
  });

  it('multi-line samples keep one sh__line per line (the \\n join survives)', async () => {
    const { code } = codeBox();
    await sugarHigh().highlight(code, 'const a = 1;\nconst b = 2;', { lang: 'ts' });
    expect(code.querySelectorAll('.sh__line')).toHaveLength(2);
    expect(code.textContent).toContain('const a = 1;');
    expect(code.textContent).toContain('const b = 2;');
  });
});

// ===========================================================================
// 3 · language laws (D4: alias convergence, tsx posture, reject hints)
// ===========================================================================
describe('sugarHigh — language laws', () => {
  it('aliases canonicalize before the engine call (ts→typescript, bash→shell)', async () => {
    const { highlight } = await import('sugar-high');
    const { code } = codeBox();
    await sugarHigh().highlight(code, 'x = 1', { lang: 'bash' });
    // the shell family converges on 'shell' (bash is an alias there, not
    // a canonical) — the engine received the canonical name
    expect(highlight).toHaveBeenCalledWith('x = 1', { lang: 'shell' });

    const { code: tsBox } = codeBox();
    await sugarHigh().highlight(tsBox, 'const a = 1;', { lang: 'ts' });
    expect(highlight).toHaveBeenCalledWith('const a = 1;', { lang: 'typescript' });
  });

  it('tsx rejects with the shiki hint (no tsx canonical), the element untouched', async () => {
    const { code } = codeBox();
    code.textContent = 'const el = <div />;';
    await expect(
      sugarHigh().highlight(code, 'const el = <div />;', { lang: 'tsx' }),
    ).rejects.toThrow(/use the shiki backend/);
    expect(code.textContent).toBe('const el = <div />;');
  });

  it('unknown languages reject listing the canonical set, the element untouched', async () => {
    const { code } = codeBox();
    code.textContent = 'x';
    await expect(sugarHigh().highlight(code, 'x', { lang: 'svelte' })).rejects.toThrow(
      /no sugar-high language for "svelte".*typescript.*lua/s,
    );
    expect(code.textContent).toBe('x');
  });
});

// ===========================================================================
// 4 · theme semantics (no theme system — warn and stay on the default form)
// ===========================================================================
describe('sugarHigh — theme semantics', () => {
  it('an unknown theme name warns and stays on the engine default form', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { code } = codeBox();
    await sugarHigh().highlight(code, SAMPLE, { lang: 'ts', theme: 'github-dark' });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('no sugar-high theme "github-dark"'),
    );
    // the default form still painted
    expect(code.querySelector('.sh__line')).not.toBeNull();
    expect(code.textContent).toContain(SAMPLE);
  });

  it("the jixoai default (and no theme at all) paints without any warning", async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const jixoai = codeBox();
    await sugarHigh().highlight(jixoai.code, SAMPLE, { lang: 'ts', theme: 'jixoai' });
    const bare = codeBox();
    await sugarHigh().highlight(bare.code, SAMPLE, { lang: 'ts' });
    expect(warn).not.toHaveBeenCalled();
    expect(jixoai.code.querySelector('.sh__line')).not.toBeNull();
    expect(bare.code.querySelector('.sh__line')).not.toBeNull();
  });
});
