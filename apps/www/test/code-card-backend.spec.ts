/**
 * Highlight backend suite (test/code-card-backend.spec.ts,
 * highlight-backend-pluggable, 2026-09-02).
 *
 * The Owner contract (r9 acceptance, printing §3): the default highlight
 * library is a pure runtime value — `<CodeCard backend={shiki() |
 * prismjs() | microLighter()} />`, a context-provided default
 * (createHighlightContext at any subtree root), runtime-switchable.
 *
 * Verified here:
 *   - the three backend contracts, each against a bare <pre><code> box:
 *     shiki (markup + pre editor colors), prismjs (markup + language
 *     class + unknown-lang rejection), microLighter (ZERO markup —
 *     ranges in CSS.highlights, theme attributes, multi-element
 *     re-coverage, feature gate)
 *   - CodeCard integration: backend prop, context default, prop beats
 *     context, live runtime switch through the context's set()
 *   - the kernel endorsement: a plugin targeting 'highlight' projects
 *     the provided default (before flips prism → shiki)
 *   - lazy loading: nothing of prism joins the page until a
 *     prismjs-backed paint (window.Prism marker stays unset)
 *   - failure fallback: unknown prism grammar → plain sample + warn
 *   - the stale-paint drop law under a manually gated backend (the
 *     window between reset and repaint is observable deterministically)
 *   - the microlighter print-freeze limitation, locked as documented
 *     behavior: a DOM clone keeps the text but no range of its own
 *
 * jsdom ships neither the CSS Custom Highlight API nor window.CSS —
 * the suite polyfills exactly the surface microlighter touches (a
 * Highlight with add/clear/size over a Set, and a Map as
 * CSS.highlights), nothing more. Bare <pre><code> boxes appended by
 * these specs stay in the document on purpose: microlighter rescans
 * the WHOLE document each paint (its global registry law), so leftover
 * boxes exercising that path is part of the topology under test —
 * range assertions below never assume the registry holds only the
 * current element's ranges.
 */
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CodeCard from '../src/lib/ui/code-card/code-card.svelte';
import BackendHost from './fixtures/code-card-backend-host.svelte';
import { microLighter } from '../src/lib/highlight/microlighter';
import { prismjs } from '../src/lib/highlight/prismjs';
import { DEFAULT_SHIKI_BACKEND, shiki } from '../src/lib/highlight/shiki';
import { HIGHLIGHT_DEF } from '../src/lib/highlight/context.svelte';
import type { HighlightBackend } from '../src/lib/highlight/backend';
import { definePlugin } from '../src/lib/context-plugin.svelte';

// ---- the CSS Custom Highlight API polyfill (jsdom gap) --------------------

/** the platform surface microlighter consumes; `ranges` exposed for assertions */
class HighlightFake {
  readonly ranges = new Set<Range>();
  add(range: Range): void {
    this.ranges.add(range);
  }
  clear(): void {
    this.ranges.clear();
  }
  get size(): number {
    return this.ranges.size;
  }
}

const globals = globalThis as unknown as {
  CSS?: { highlights: Map<string, HighlightFake> };
  Highlight?: unknown;
};

/** the installed registry — the assertion surface */
let registry: Map<string, HighlightFake>;

function installHighlightApi(): void {
  // `CSS.highlights` in the real platform is a registry-like object;
  // a Map provides every operation microlighter performs
  globals.Highlight ??= HighlightFake;
  globals.CSS ??= { highlights: new Map() };
  globals.CSS.highlights ??= new Map();
  registry = globals.CSS.highlights;
}

/** every text node the registry currently paints */
function paintedTextNodes(): Set<Node> {
  const containers = new Set<Node>();
  for (const highlight of registry.values()) {
    for (const range of highlight.ranges) containers.add(range.startContainer);
  }
  return containers;
}

beforeEach(() => {
  installHighlightApi();
  registry.clear();
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
// 1 · backend contracts (direct, no component)
// ===========================================================================
describe('highlight backends — the contract', () => {
  it('shiki: token markup into the code box, editor colors onto the pre', async () => {
    const { pre, code } = codeBox();
    code.textContent = SAMPLE;

    expect(shiki().id).toBe('shiki');
    await shiki().highlight(code, SAMPLE, { lang: 'ts', theme: 'github-dark' });

    // markup landed INSIDE the given element (its own <code>, not a new pre)
    expect(code.querySelector('.line')).not.toBeNull();
    expect(code.textContent).toContain('const value: number = 42;');
    // the named theme's editor colors ride along on the surrounding pre
    expect(pre.getAttribute('style')).toContain('rgb(36, 41, 46)');
  }, 20000);

  it('shiki: the jixoai css-variables default theme when none given', async () => {
    const { code } = codeBox();
    await shiki().highlight(code, SAMPLE, { lang: 'ts' });
    expect(code.querySelector('.line')).not.toBeNull();
    // the zero-download theme resolves to --tok-* variables, not colors
    expect(code.innerHTML).toContain('--tok-');
  }, 20000);

  it('prismjs: token markup + the language class', async () => {
    const { code } = codeBox();

    expect(prismjs().id).toBe('prismjs');
    await prismjs().highlight(code, SAMPLE, { lang: 'ts' });

    expect(code.className).toBe('language-typescript');
    expect(code.querySelector('.token')).not.toBeNull();
    expect(code.textContent).toContain('const value: number = 42;');
  }, 20000);

  it('prismjs: unknown language rejects with a hint, the element untouched', async () => {
    const { code } = codeBox();
    code.textContent = 'x';
    // prismjs 1.30 no longer ships svelte/vue grammars
    await expect(prismjs().highlight(code, 'x', { lang: 'svelte' })).rejects.toThrow(
      /no Prism grammar for "svelte"/,
    );
    expect(code.textContent).toBe('x');
  }, 20000);

  it('microLighter: ZERO markup — ranges over the text node, theme attributes', async () => {
    const { pre, code } = codeBox();

    expect(microLighter().id).toBe('microlighter');
    await microLighter().highlight(code, SAMPLE, { lang: 'ts' });

    // the DOM stays exactly one text node — copyable, editable
    expect(code.childNodes.length).toBe(1);
    expect(code.firstChild?.nodeType).toBe(3); // TEXT_NODE
    expect(code.textContent).toBe(SAMPLE);
    // language + theme metadata (its own channels)
    expect(code.dataset.language).toBe('ts');
    expect(pre.getAttribute('data-syntax-theme')).toBe('min');
    // ranges registered in the global registry, over OUR text node
    expect(paintedTextNodes().has(code.firstChild!)).toBe(true);
  }, 20000);

  it('microLighter: a named theme maps verbatim onto data-syntax-theme', async () => {
    const { pre, code } = codeBox();
    await microLighter().highlight(code, SAMPLE, { lang: 'ts', theme: 'github' });
    expect(pre.getAttribute('data-syntax-theme')).toBe('github');
  }, 20000);

  it('microLighter: each scan re-covers every painted element (the global registry law)', async () => {
    const boxA = codeBox();
    const boxB = codeBox();

    await microLighter().highlight(boxA.code, 'const first = 1;', { lang: 'ts' });
    await microLighter().highlight(boxB.code, 'const second = 2;', { lang: 'ts' });

    // B's scan REPLACED all range sets — A must still be covered
    const painted = paintedTextNodes();
    expect(painted.has(boxA.code.firstChild!)).toBe(true);
    expect(painted.has(boxB.code.firstChild!)).toBe(true);
  }, 20000);

  it('microLighter: rejects clearly where the Custom Highlight API is missing', async () => {
    const savedCSS = globals.CSS;
    const savedHighlight = globals.Highlight;
    globals.CSS = undefined;
    globals.Highlight = undefined;
    try {
      const { code } = codeBox();
      await expect(microLighter().highlight(code, 'x', { lang: 'ts' })).rejects.toThrow(
        /Custom Highlight API is unavailable/,
      );
    } finally {
      globals.CSS = savedCSS;
      globals.Highlight = savedHighlight;
    }
  });

  it('the def: the stock shiki default is one shared identity', () => {
    expect(HIGHLIGHT_DEF.key).toBe('highlight');
    expect(HIGHLIGHT_DEF.defaults()).toBe(DEFAULT_SHIKI_BACKEND);
    expect(HIGHLIGHT_DEF.ssrSafe).toBe(DEFAULT_SHIKI_BACKEND);
  });
});

// ===========================================================================
// 2 · CodeCard integration — prop, context default, runtime switch
// ===========================================================================
describe('CodeCard — the backend seam', () => {
  it('a backend prop drives the paint (prism)', async () => {
    const { container } = render(CodeCard, {
      props: { code: SAMPLE, lang: 'ts', backend: prismjs() },
    });

    // progressive enhancement: the plain sample paints first
    expect(container.querySelector('pre code')!.textContent).toContain(SAMPLE);
    await waitFor(() => expect(container.querySelector('.token')).not.toBeNull(), {
      timeout: 8000,
    });
    expect(container.querySelector('pre code')!.textContent).toContain(SAMPLE);
  }, 20000);

  it('the context default feeds cards without a prop; a prop beats it', async () => {
    const { container } = render(BackendHost, { props: { initial: prismjs() } });

    const cardOf = (filename: string): HTMLElement => {
      const tab = [...container.querySelectorAll('[data-jx-code-card-file]')].find(
        (el) => el.textContent === filename,
      );
      return tab!.closest('figure')!;
    };
    const contextCard = cardOf('context-default.ts');
    const propCard = cardOf('prop-override.ts');

    // the context-default card eats the provided prism default
    await waitFor(() => expect(contextCard.querySelector('.token')).not.toBeNull(), {
      timeout: 8000,
    });
    // the prop-override card keeps its explicit shiki backend
    await waitFor(() => expect(propCard.querySelector('.line')).not.toBeNull(), {
      timeout: 8000,
    });
    expect(contextCard.querySelector('.line')).toBeNull();
    expect(propCard.querySelector('.token')).toBeNull();
  }, 20000);

  it('no provider at all: the stock shiki default (the pre-pluggable behavior)', async () => {
    const { container } = render(CodeCard, { props: { code: SAMPLE, lang: 'ts' } });
    await waitFor(() => expect(container.querySelector('.line')).not.toBeNull(), {
      timeout: 8000,
    });
  }, 20000);

  it('a live context.set() repaints context-fed cards; prop-fed cards stay put', async () => {
    const { container, getByRole } = render(BackendHost, { props: { initial: prismjs() } });

    const contextCard = () =>
      [...container.querySelectorAll('[data-jx-code-card-file]')]
        .find((el) => el.textContent === 'context-default.ts')!
        .closest('figure')!;
    const propCard = () =>
      [...container.querySelectorAll('[data-jx-code-card-file]')]
        .find((el) => el.textContent === 'prop-override.ts')!
        .closest('figure')!;

    await waitFor(() => expect(contextCard().querySelector('.token')).not.toBeNull(), {
      timeout: 8000,
    });
    await waitFor(() => expect(propCard().querySelector('.line')).not.toBeNull(), {
      timeout: 8000,
    });

    // switch the default to the RANGE backend at runtime
    await fireEvent.click(getByRole('button', { name: 'microlighter' }));

    await waitFor(
      () => {
        // prism markup dropped; the plain text node is the final DOM
        expect(contextCard().querySelector('.token')).toBeNull();
        expect(contextCard().querySelector('pre code')!.textContent).toBe(SAMPLE);
        expect(contextCard().querySelector('pre')!.getAttribute('data-syntax-theme')).toBe('min');
        // ranges registered over the context card's own text node (the
        // registry may hold other elements' ranges too — the document scan)
        expect(paintedTextNodes().has(contextCard().querySelector('pre code')!.firstChild!)).toBe(
          true,
        );
      },
      { timeout: 8000 },
    );
    // the prop-fed shiki card was never touched
    expect(propCard().querySelector('.line')).not.toBeNull();
    expect(propCard().querySelector('pre')!.getAttribute('data-syntax-theme')).toBeNull();
  }, 20000);

  it('the kernel endorsement: a plugin targeting highlight projects the default', async () => {
    // an app-side intervention in the print layer's own shape: the
    // plugin root sits ABOVE the context, its before() overrides the
    // provided prism default with a markup backend — the target is the
    // CANONICAL HIGHLIGHT_DEF import (identity matching: the same
    // object createHighlightContext's pipeline builds on)
    const forceShiki = definePlugin({
      name: 'test-force-shiki',
      targets: [HIGHLIGHT_DEF],
      before: () => shiki(),
    });

    const { container } = render(BackendHost, {
      props: { initial: prismjs(), plugins: [forceShiki] },
    });

    const contextCard = () =>
      [...container.querySelectorAll('[data-jx-code-card-file]')]
        .find((el) => el.textContent === 'context-default.ts')!
        .closest('figure')!;

    await waitFor(() => expect(contextCard().querySelector('.line')).not.toBeNull(), {
      timeout: 8000,
    });
    expect(contextCard().querySelector('.token')).toBeNull();
  }, 20000);

  it('lazy: nothing of prism joins the page until a prismjs-backed paint', async () => {
    // a fresh backend module (vi.resetModules) so its core-cache is
    // empty regardless of what earlier specs loaded — the prism core
    // (or its manual-mode marker) is observable as window.Prism
    vi.resetModules();
    const { prismjs: freshPrismjs } = await import('../src/lib/highlight/prismjs');
    // the double cast keeps @types/prismjs's UMD global (which types a
    // bare non-optional `Prism`) out of this delete/write
    const win = window as unknown as { Prism?: unknown };
    delete win.Prism;

    const shikiOnly = render(CodeCard, {
      props: { code: 'const a = 1;', lang: 'ts', backend: shiki() },
    });
    await waitFor(() => expect(shikiOnly.container.querySelector('.line')).not.toBeNull(), {
      timeout: 8000,
    });
    // the prism core (and even its manual-mode marker) never loaded
    expect(win.Prism).toBeUndefined();

    const prism = render(CodeCard, {
      props: { code: 'const a = 1;', lang: 'ts', backend: freshPrismjs() },
    });
    await waitFor(() => expect(prism.container.querySelector('.token')).not.toBeNull(), {
      timeout: 8000,
    });
    expect(win.Prism).toBeDefined();
  }, 20000);

  it('a failing backend leaves the plain sample standing and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(CodeCard, {
      props: { code: '<b>not svelte</b>', lang: 'svelte', backend: prismjs() },
    });

    await waitFor(
      () =>
        expect(warn).toHaveBeenCalledWith(
          '[jixoai/code-card] plain-text fallback:',
          expect.any(Error),
        ),
      { timeout: 8000 },
    );
    const code = container.querySelector('pre code')!;
    expect(code.textContent).toBe('<b>not svelte</b>');
    expect(code.querySelector('.token')).toBeNull();
  }, 20000);

  it('drops the stale backend paint immediately when the code prop changes', async () => {
    // a manually gated backend makes the window between the reset and
    // the repaint deterministic — fast real backends repaint within
    // microtasks, hiding the interim plain paint
    let release: (() => void) | undefined;
    const gated: HighlightBackend = {
      id: 'gated',
      highlight: (el, source) =>
        new Promise<void>((resolve) => {
          release = () => {
            el.innerHTML = `<span class="token gated">${source}</span>`;
            resolve();
          };
        }),
    };

    const { container, rerender } = render(CodeCard, {
      props: { code: 'const first = 1;', lang: 'ts', backend: gated },
    });

    release!(); // the first paint lands
    await waitFor(() => expect(container.querySelector('.token')).not.toBeNull());

    await rerender({ code: 'const second = 2;' });
    // old token spans are gone synchronously; the CURRENT plain sample
    // is the interim paint — never the previous code's content
    expect(container.querySelector('.token')).toBeNull();
    expect(container.querySelector('pre code')!.textContent).toBe('const second = 2;');

    release!(); // the repaint resolves on demand
    await waitFor(() =>
      expect(container.querySelector('.token')!.textContent).toBe('const second = 2;'),
    );
  }, 20000);
});

// ===========================================================================
// 3 · the microlighter print-freeze limitation (documented, locked)
// ===========================================================================
describe('microLighter — the print-freeze limitation', () => {
  it('a DOM clone keeps the text but carries NO range of its own', async () => {
    const { pre, code } = codeBox();
    await microLighter().highlight(code, SAMPLE, { lang: 'ts' });
    await waitFor(() => expect(paintedTextNodes().has(code.firstChild!)).toBe(true));

    // what the print pipeline's freeze does to a range backend: clone
    // the DOM — the ranges registry does not come along
    const clone = pre.cloneNode(true) as HTMLElement;
    const cloneCode = clone.querySelector('code')!;

    // the text survives (the plain sample IS the DOM)
    expect(cloneCode.textContent).toBe(SAMPLE);
    // but NO registered range points inside the clone — every range
    // still belongs to the ORIGINAL tree, so the clone paints
    // unstyled. Accepted limitation (microlighter.ts): apps that must
    // print highlighted code pin a markup backend (the context seam).
    const cloneTexts = new Set<Node>([...cloneCode.childNodes]);
    let rangeCount = 0;
    for (const highlight of registry.values()) {
      for (const range of highlight.ranges) {
        rangeCount++;
        expect(cloneTexts.has(range.startContainer as Node)).toBe(false);
      }
    }
    expect(rangeCount).toBeGreaterThan(0);
  }, 20000);
});
