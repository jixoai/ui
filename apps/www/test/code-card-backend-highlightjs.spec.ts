/**
 * Highlight backend suite — the highlight.js engine
 * (test/code-card-backend-highlightjs.spec.ts, highlight-engine-matrix,
 * 2026-09-06). Same skeleton as code-card-backend.spec.ts (codeBox +
 * SAMPLE), kept in its OWN file so parallel engine work never shares a
 * write surface.
 *
 * Verified here (design D3 + D7):
 *   - lazy loading by vi.mock COUNT: the zero-language kernel joins the
 *     page only at the first highlightJs()-backed paint (construct =
 *     0 loads; first paint = 1; later paints stay 1 — the cached
 *     kernel). hljs has no window global to mark like Prism, so the
 *     mock factory's invocation count IS the observable. This suite
 *     runs FIRST in the file on purpose: vitest 4 caches mock-factory
 *     results across vi.resetModules, so the 0→1 transition is only
 *     observable before anything paints (engine never loaded yet).
 *   - the markup contract: token spans land INSIDE the painted <code>,
 *     with the two classes hljs themes key on (`hljs` +
 *     `language-<id>`), and the class swap survives re-paints
 *   - alias canonicalization onto hljs ids (html/htm → xml)
 *   - the language boundary: tsx/svelte (and friends) reject with the
 *     hint pointing at the shiki backend — the plain-text fallback law
 *   - the per-instance langs allowlist: outside rejects, aliases
 *     canonicalize INTO the set
 *   - theme semantics: the jixoai default loads the item-embedded css
 *     sheet exactly once per document (vi.mock count); unknown names
 *     warn and stay unstyled
 *   - CodeCard integration: a backend prop drives the card's paint
 *     (progressive enhancement: plain sample first, spans later)
 */
import { render, waitFor } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CodeCard from '../src/lib/ui/code-card/code-card.svelte';
import { highlightJs } from '../src/lib/highlight/highlight-js';

// ---- the load counters (hoisted: referenced inside mock factories) --------

const hljsCoreLoads = vi.hoisted(() => ({ count: 0 }));
vi.mock('highlight.js/lib/core', async (importOriginal) => {
  hljsCoreLoads.count++;
  return await importOriginal<typeof import('highlight.js/lib/core')>();
});

// the runtime-slimming proof (final-review blocker fix, 2026-09-06): a
// langs-allowlisted instance may only ever import the SELECTED language
// modules — unselected curated grammars stay at zero loads even when a
// paint requests them (the reject fires before the loader runs)
const tsLangLoads = vi.hoisted(() => ({ count: 0 }));
vi.mock('highlight.js/lib/languages/typescript', async (importOriginal) => {
  tsLangLoads.count++;
  return await importOriginal<typeof import('highlight.js/lib/languages/typescript')>();
});
const cssLangLoads = vi.hoisted(() => ({ count: 0 }));
vi.mock('highlight.js/lib/languages/css', async (importOriginal) => {
  cssLangLoads.count++;
  return await importOriginal<typeof import('highlight.js/lib/languages/css')>();
});

const jixoaiThemeLoads = vi.hoisted(() => ({ count: 0 }));
vi.mock('../src/lib/highlight/highlight-js-jixoai.css', () => {
  jixoaiThemeLoads.count++;
  return {};
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
// 1 · the highlight.js backend contract
// ===========================================================================
describe('highlight backends — the contract', () => {
  // FIRST, before any paint in this file: the lazy-loading count is only
  // observable from zero while the engine has never loaded (see header)
  it('lazy: nothing of highlight.js joins the page until a highlightJs-backed paint', async () => {
    // the static imports above (factory + CodeCard) loaded no engine code
    expect(hljsCoreLoads.count).toBe(0);

    const backend = highlightJs();
    expect(backend.id).toBe('highlightjs');
    // constructing the backend is free — zero engine code loaded
    expect(hljsCoreLoads.count).toBe(0);

    const { code } = codeBox();
    await backend.highlight(code, SAMPLE, { lang: 'ts' });
    // the first paint loads the zero-language kernel — exactly once —
    // and rides the jixoai default theme sheet along (also exactly once)
    expect(hljsCoreLoads.count).toBe(1);
    expect(jixoaiThemeLoads.count).toBe(1);
    expect(code.querySelector('span')).not.toBeNull();

    // later paints share the cached kernel and the loaded theme
    await backend.highlight(code, 'const second = 2;', { lang: 'ts' });
    expect(hljsCoreLoads.count).toBe(1);
    expect(jixoaiThemeLoads.count).toBe(1);
  }, 20000);

  it('slimming: a langs allowlisted instance only ever loads the SELECTED language modules', async () => {
    // NOTE: module-load counts are once-per-process (the mock factory
    // runs on first import only) — the assertion shape is "selected
    // module loaded at least once, unselected module NEVER"
    const { code } = codeBox();
    await highlightJs({ langs: ['ts'] }).highlight(code, 'const v: number = 1;', { lang: 'typescript' });
    expect(tsLangLoads.count).toBeGreaterThanOrEqual(1);

    // a curated-but-unselected request rejects BEFORE its module ever
    // loads — the runtime load closure is exactly the selection
    const { code: cssBox } = codeBox();
    await expect(
      highlightJs({ langs: ['ts'] }).highlight(cssBox, 'a { color: red }', { lang: 'css' }),
    ).rejects.toThrow(/outside this instance's langs set/);
    expect(cssLangLoads.count).toBe(0);
  }, 20000);

  it('highlightJs: token markup + the language/hljs theme classes', async () => {
    const { code } = codeBox();
    code.textContent = SAMPLE;

    await highlightJs().highlight(code, SAMPLE, { lang: 'ts' });

    // markup landed INSIDE the given element (spans, not a new pre)
    expect(code.querySelector('span')).not.toBeNull();
    expect(code.textContent).toContain('const value: number = 42;');
    // the two classes hljs themes key on
    expect(code.classList.contains('hljs')).toBe(true);
    expect(code.classList.contains('language-typescript')).toBe(true);
  }, 20000);

  it('highlightJs: aliases canonicalize onto hljs ids (html → xml markup)', async () => {
    const { code } = codeBox();
    await highlightJs().highlight(code, '<div class="x">hi</div>', { lang: 'html' });
    expect(code.classList.contains('language-xml')).toBe(true);
    expect(code.querySelector('.hljs-name')).not.toBeNull();
  }, 20000);

  it('highlightJs: tsx and svelte reject pointing at the shiki backend', async () => {
    const { code } = codeBox();
    code.textContent = 'x';

    // highlight.js 11.12 ships no tsx/jsx/svelte/vue module
    await expect(highlightJs().highlight(code, 'x', { lang: 'tsx' })).rejects.toThrow(
      /no highlight\.js grammar for "tsx".*use the shiki backend/,
    );
    await expect(highlightJs().highlight(code, 'x', { lang: 'svelte' })).rejects.toThrow(
      /use the shiki backend/,
    );
    // the element was never touched — the plain-text fallback law
    expect(code.textContent).toBe('x');
  }, 20000);

  it('highlightJs: a langs allowlist rejects outside languages, aliases resolve inside it', async () => {
    const { code } = codeBox();
    code.textContent = 'x';
    const slim = highlightJs({ langs: ['bash'] });
    // 'ts' is a real hljs grammar but outside THIS instance's set
    await expect(slim.highlight(code, 'x', { lang: 'ts' })).rejects.toThrow(
      /outside this instance's langs set/,
    );
    expect(code.textContent).toBe('x');
    // an alias entry ('ts') canonicalizes into the set's terms and paints
    const { code: aliasBox } = codeBox();
    const tsAllowed = highlightJs({ langs: ['ts'] });
    await tsAllowed.highlight(aliasBox, SAMPLE, { lang: 'typescript' });
    expect(aliasBox.classList.contains('language-typescript')).toBe(true);
  }, 20000);

  it('the jixoai default theme never loads the embedded css twice per document', async () => {
    // the lazy suite above already painted with the default theme — the
    // observable here is the per-document law itself: the sheet IS
    // loaded (count ≥ 1, via the mock) and NO further paint reloads it
    const { code } = codeBox();
    await highlightJs().highlight(code, SAMPLE, { lang: 'ts' });
    const after = jixoaiThemeLoads.count;
    expect(after).toBeGreaterThanOrEqual(1);
    const { code: second } = codeBox();
    await highlightJs().highlight(second, 'const other = 1;', { lang: 'ts' });
    expect(jixoaiThemeLoads.count).toBe(after);
  }, 20000);

  it('an unknown theme name warns and stays unstyled (markup still lands)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { code } = codeBox();
    await highlightJs().highlight(code, SAMPLE, { lang: 'ts', theme: 'vitesse-dark' });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('no highlight.js theme "vitesse-dark"'),
    );
    expect(code.querySelector('span')).not.toBeNull();
  }, 20000);

  it('a backend prop drives the card paint (progressive enhancement)', async () => {
    const { container } = render(CodeCard, {
      props: { code: SAMPLE, lang: 'ts', backend: highlightJs() },
    });

    // progressive enhancement: the plain sample paints first
    expect(container.querySelector('pre code')!.textContent).toContain(SAMPLE);
    await waitFor(
      () => expect(container.querySelector('pre code .hljs-keyword')).not.toBeNull(),
      { timeout: 8000 },
    );
    expect(container.querySelector('pre code')!.textContent).toContain(SAMPLE);
    expect(container.querySelector('pre code')!.classList.contains('hljs')).toBe(true);
  }, 20000);
});

// ===========================================================================
// 2 · the engine-borne detector (highlight-lang-detector D7, 2026-09-07)
// ===========================================================================
describe('highlightJs — the detector slot', () => {
  it('the full curated set is the default candidate pool: a TS sample reports typescript', async () => {
    const backend = highlightJs();
    const result = await backend.detector!.detect({ code: SAMPLE });
    expect(result).toEqual({ lang: 'typescript', source: 'engine' });
    // no confidence on the engine ring — hljs relevance is uncalibrated
    expect(result?.confidence).toBeUndefined();
  });

  it('langs subsets the candidates: a css-restricted instance never reports typescript', async () => {
    const cssOnly = highlightJs({ langs: ['css'] });
    const result = await cssOnly.detector!.detect({ code: SAMPLE });
    // only the css grammar sits in its private registry — a TS sample
    // cannot come back as typescript (isolation, not accuracy)
    expect(result?.lang).not.toBe('typescript');
  });

  it('instance isolation: sibling factories never widen each other', async () => {
    const tsOnly = highlightJs({ langs: ['ts'] });
    const cssOnly = highlightJs({ langs: ['css'] });
    // the css instance answers css; the ts instance CANNOT (its private
    // registry holds one grammar) — two-factory mutual invisibility
    const cssHit = await cssOnly.detector!.detect({ code: 'a { color: red }' });
    expect(cssHit?.lang).toBe('css');
    const tsMiss = await tsOnly.detector!.detect({ code: 'a { color: red }' });
    expect(tsMiss?.lang ?? null).toBe(null);
  });

  it('langs: [] is no candidates — null, never a guess', async () => {
    const empty = highlightJs({ langs: [] });
    await expect(empty.detector!.detect({ code: SAMPLE })).resolves.toBeNull();
  });

  it('construction is inert; detection narrows to the candidate grammars', async () => {
    // vi.mock counts module EVALUATIONS (file-global, earlier suites may
    // have loaded core/ts/css already) — the honest shapes are: counts
    // frozen across construction (the lazy law), and an UNSELECTED
    // grammar never evaluating for a restricted instance (the slimming
    // law's detector twin)
    const before = { core: hljsCoreLoads.count, ts: tsLangLoads.count, css: cssLangLoads.count };
    const backend = highlightJs({ langs: ['ts'] });
    expect(hljsCoreLoads.count).toBe(before.core);
    expect(tsLangLoads.count).toBe(before.ts);
    expect(cssLangLoads.count).toBe(before.css);
    await backend.detector!.detect({ code: SAMPLE });
    expect(tsLangLoads.count).toBeGreaterThanOrEqual(before.ts);
    expect(cssLangLoads.count).toBe(before.css); // never an unselected grammar
  });

  it('the filename input is ignored by the engine ring (code-only heuristic)', async () => {
    const backend = highlightJs();
    const bare = await backend.detector!.detect({ code: SAMPLE });
    const named = await backend.detector!.detect({ code: SAMPLE, filename: 'main.py' });
    expect(named?.lang).toBe(bare?.lang);
  });
});
