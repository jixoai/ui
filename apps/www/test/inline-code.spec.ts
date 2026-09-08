/**
 * InlineCode behavior suite (test/inline-code.spec.ts; rewritten for
 * the engine + fused rework, inline-code-engine-and-text-modifiers
 * Lane B / design D1/D2/D4/D6, 2026-09-08).
 *
 * The chip promises: a native <code> whose first paint is the plain
 * children text (the SSR contract — no async dependency), the ladder's
 * fused/tonal/outline utilities (fused own: transparent ground,
 * border-transparent width frame, backdrop contrast; tonal keeps the
 * arbitrary early-slot neutral injection — the frozen consumer-wins
 * contract), the density radius token (--jx-chip-radius, never the
 * global --radius), the padding-inline formula (ONE css rule in
 * inline-code.css over --jx-code-fs/--jx-code-line custom properties
 * with token fallbacks; explicit modifier props mirror onto the style
 * vars), the six modifier props through the shared
 * kernel (with conditional base-utility emission), the backend seam
 * (prop → HIGHLIGHT_KEY context → the stock microlighter singleton)
 * behind the CSS.highlights PRE-GATE (jsdom: no call, chip stays
 * plain), and the zero-download fingerprint heuristic exported pure
 * (detectInlineLang) over the candidate set (INLINE_LANGS).
 * Assertions read the DOM only.
 */
import { render, waitFor } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { DEFAULT_MICROLIGHTER_BACKEND } from '../src/lib/highlight/microlighter';
import type { HighlightBackend } from '../src/lib/highlight/backend';
import { INLINE_LANGS, detectInlineLang } from '../src/lib/ui/inline-code/inline-code.svelte';
import InlineCodeHost from './fixtures/inline-code-host.svelte';

// ---- the CSS Custom Highlight API stub (the pre-gate's open state) --
// jsdom ships neither CSS.highlights nor Highlight; the chip's PRE-GATE
// then keeps it plain (asserted below). Installing this minimal surface
// opens the gate so the backend contract is observable in jsdom — the
// code-card-backend.spec precedent (nothing more than the gate reads).
type HighlightGlobals = { CSS?: { highlights?: unknown }; Highlight?: unknown };
let restoreApi: (() => void) | undefined;

function installHighlightApi(): void {
  const globals = globalThis as HighlightGlobals;
  const prevCSS = globals.CSS;
  const prevHighlight = globals.Highlight;
  globals.CSS = { ...(prevCSS as Record<string, unknown> ?? {}), highlights: new Map() };
  globals.Highlight = function HighlightStub() {};
  restoreApi = () => {
    globals.CSS = prevCSS;
    globals.Highlight = prevHighlight;
  };
}

/** records every call — the prop/context lanes of the engine seam */
interface RecordingBackend
  extends HighlightBackend {
  calls: { el: HTMLElement; code: string; opts: { lang?: string; theme?: string } }[];
}
function recordingBackend(id = 'fake'): RecordingBackend {
  const calls: RecordingBackend['calls'] = [];
  return {
    id,
    calls,
    async highlight(el, code, opts) {
      calls.push({ el, code, opts });
    },
  };
}

/** let any (wrongly scheduled) async work settle before asserting absence */
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 20));

describe('InlineCode', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    restoreApi?.();
    restoreApi = undefined;
  });

  it('renders a native <code> with the plain children text and no token spans', () => {
    const { container } = render(InlineCodeHost, {
      props: { text: '--jx-tonal', lang: 'text' },
    });
    const code = container.querySelector('code[data-jx-inline-code]');
    expect(code).not.toBeNull();
    expect(code!.getAttribute('data-density')).toBeNull();
    expect(code!.textContent).toBe('--jx-tonal');
    // plain path: no grammar ever loads, no span ever mounts
    expect(code!.querySelector('span')).toBeNull();
  });

  it('default variant is fused: transparent ground, invisible frame, backdrop contrast — zero own color', () => {
    const { container } = render(InlineCodeHost, { props: { text: 'x', lang: 'text' } });
    const code = container.querySelector('code')!;
    expect(code.getAttribute('data-jx-inline-code')).toBe('fused');
    expect(code.className).toContain('bg-transparent');
    // the width-only base border must be PAINTED transparent here
    // (currentColor would leak through a colorless border)
    expect(code.className).toContain('border-transparent');
    expect(code.className).toContain('backdrop-contrast-[85%]');
    expect(code.className).toContain('text-foreground');
    // the fusion IS the frame: forced-colors keeps a visible border
    expect(code.className).toContain('forced-colors:border-[color:CanvasText]');
    // no tonal paint survives on the default rung
    expect(code.className).not.toContain('[--jx-tonal:');
    expect(code.className).not.toContain('bg-[color-mix');
  });

  it('tonal and outline stay available with their frozen recipes', () => {
    const tonal = render(InlineCodeHost, {
      props: { text: 'x', lang: 'text', variant: 'tonal' },
    });
    const tonalEl = tonal.container.querySelector('code')!;
    expect(tonalEl.getAttribute('data-jx-inline-code')).toBe('tonal');
    expect(tonalEl.className).toContain('[--jx-tonal:var(--muted-foreground)]');
    expect(tonalEl.className).toContain('bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)]');
    expect(tonalEl.className).toContain(
      'border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)]',
    );

    const outline = render(InlineCodeHost, {
      props: { text: 'x', lang: 'text', variant: 'outline' },
    });
    const outlineEl = outline.container.querySelector('code')!;
    expect(outlineEl.getAttribute('data-jx-inline-code')).toBe('outline');
    expect(outlineEl.className).toContain('bg-transparent');
    expect(outlineEl.className).toContain('border-[color:var(--jx-outline)]');
    expect(outlineEl.className).not.toContain('[--jx-tonal:');
  });

  it('radius rides the density chip token, never the fleet corner', () => {
    const { container } = render(InlineCodeHost, { props: { text: 'x', lang: 'text' } });
    const code = container.querySelector('code')!;
    expect(code.className).toContain('rounded-(--jx-chip-radius)');
    expect(code.className).not.toContain('rounded-(--radius)');
  });

  it('padding-inline is owned by the css rule: no utility emitted, the formula lives in inline-code.css', () => {
    const { container } = render(InlineCodeHost, { props: { text: 'x', lang: 'text' } });
    const code = container.querySelector('code')!;
    // the vision-pass pivot: the arbitrary-utility calc never survived
    // Tailwind's scanner — the formula rides the folder css now, and
    // the class list carries NO padding declaration at all
    expect(code.className).not.toContain('padding-inline');
    expect(code.getAttribute('style')).toBeNull();
    const css = readFileSync(
      resolve(import.meta.dirname, '../src/lib/ui/inline-code/inline-code.css'),
      'utf8',
    );
    expect(css).toContain('padding-inline: calc(');
    expect(css).toContain('var(--jx-chip-radius)');
    expect(css).toContain('var(--jx-code-line, var(--jx-line-secondary))');
    expect(css).toContain('var(--jx-code-fs, var(--jx-text-secondary))');
  });

  it('explicit fontSize+lineHeight mirror onto the style vars (12px/1.5 ⇒ calc((12px) * 1.5))', () => {
    const { container } = render(InlineCodeHost, {
      props: { text: 'x', lang: 'text', mods: { fontSize: '12px', lineHeight: 1.5 } },
    });
    const code = container.querySelector('code')!;
    // the DOM normalizes the style serialization (": " + trailing ";")
    expect(code.getAttribute('style')).toBe(
      '--jx-code-fs: 12px; --jx-code-line: calc((12px) * 1.5);',
    );
  });

  it('half-pairs mirror only the provided half; absent props emit no style at all', () => {
    const fsOnly = render(InlineCodeHost, {
      props: { text: 'x', lang: 'text', mods: { fontSize: '12px' } },
    });
    expect(fsOnly.container.querySelector('code')!.getAttribute('style')).toBe(
      '--jx-code-fs: 12px;',
    );

    const lhOnly = render(InlineCodeHost, {
      props: { text: 'x', lang: 'text', mods: { lineHeight: 1.5 } },
    });
    expect(lhOnly.container.querySelector('code')!.getAttribute('style')).toBe(
      '--jx-code-line: calc((var(--jx-text-secondary)) * 1.5);',
    );

    const lhString = render(InlineCodeHost, {
      props: { text: 'x', lang: 'text', mods: { lineHeight: '2rem' } },
    });
    // a string lineHeight IS the line-box length — verbatim
    expect(lhString.container.querySelector('code')!.getAttribute('style')).toBe(
      '--jx-code-line: 2rem;',
    );
  });

  it('the six modifier props land through the shared kernel and drop the base token twins', () => {
    const { container } = render(InlineCodeHost, {
      props: {
        text: 'x',
        lang: 'text',
        mods: {
          lineHeight: 1.75,
          weight: '450',
          italic: true,
          tracking: '-0.01em',
          family: 'IBM Plex Mono',
          fontSize: '12px',
        },
      },
    });
    const code = container.querySelector('code')!;
    expect(code.className).toContain('leading-[1.75]');
    expect(code.className).toContain('font-[450]');
    expect(code.className).toContain('italic');
    expect(code.className).toContain('tracking-[-0.01em]');
    expect(code.className).toContain('[font-family:IBM_Plex_Mono]');
    expect(code.className).toContain('[font-size:12px]');
    // conditional emission: the explicit utility must not race the
    // base token twin — the twin is DROPPED, not outranked
    expect(code.className).not.toContain('[font-size:var(--jx-text-secondary)]');
    expect(code.className).not.toContain('[line-height:var(--jx-line-secondary)]');

    const plain = render(InlineCodeHost, { props: { text: 'x', lang: 'text' } });
    const plainEl = plain.container.querySelector('code')!;
    expect(plainEl.className).toContain('[font-size:var(--jx-text-secondary)]');
    expect(plainEl.className).toContain('[line-height:var(--jx-line-secondary)]');
  });

  it("consumer ARBITRARY injection dedupes the tonal neutral default (cn same-form last-wins)", () => {
    const { container } = render(InlineCodeHost, {
      props: {
        text: 'x',
        lang: 'text',
        variant: 'tonal',
        consumerClass: '[--jx-tonal:var(--error)]',
      },
    });
    const code = container.querySelector('code')!;
    expect(code.className).toContain('[--jx-tonal:var(--error)]');
    expect(code.className).not.toContain('[--jx-tonal:var(--muted-foreground)]');
  });

  it("consumer jx-hue-* utility coexists with the tonal default (sheet-order winner — the browser gate's call)", () => {
    const { container } = render(InlineCodeHost, {
      props: { text: 'x', lang: 'text', variant: 'tonal', consumerClass: 'jx-hue-error' },
    });
    const code = container.querySelector('code')!;
    // utilities sort AFTER arbitrary properties in the sheet, so the
    // consumer's hue wins the PAINT; jsdom asserts coexistence only
    expect(code.className).toContain('jx-hue-error');
    expect(code.className).toContain('[--jx-tonal:var(--muted-foreground)]');
  });

  // ── the engine seam (design D1) ─────────────────────────────────

  it('backend prop: highlight(el, source, { lang }) — auto-detection resolves before the call, no theme passed', async () => {
    installHighlightApi();
    const backend = recordingBackend();
    const { container } = render(InlineCodeHost, {
      props: { text: 'const value: number = 42', lang: 'auto', backend },
    });
    const code = container.querySelector('code')!;
    await waitFor(() => expect(backend.calls.length).toBe(1));
    const call = backend.calls[0]!;
    expect(call.el).toBe(code);
    expect(call.code).toBe('const value: number = 42');
    // auto → the heuristic's CANONICAL id (not the 'auto' sentinel)
    expect(call.opts.lang).toBe('typescript');
    // undefined theme ⇒ the jixoai default, whose --syntax-* bridge
    // resolves onto the chip's own --tok-* palette
    expect(call.opts.theme).toBeUndefined();
  });

  it('HIGHLIGHT_KEY context beats the microlighter stock (the app-layer provider lane)', async () => {
    installHighlightApi();
    const stockSpy = vi.spyOn(DEFAULT_MICROLIGHTER_BACKEND, 'highlight');
    const contextBackend = recordingBackend('context');
    const { container } = render(InlineCodeHost, {
      props: { text: 'const value: number = 42', lang: 'ts', contextBackend },
    });
    const code = container.querySelector('code')!;
    await waitFor(() => expect(contextBackend.calls.length).toBe(1));
    expect(contextBackend.calls[0]!.el).toBe(code);
    expect(contextBackend.calls[0]!.opts.lang).toBe('ts');
    expect(stockSpy).not.toHaveBeenCalled();
  });

  it('PRE-GATE: without the CSS Custom Highlight API the stock backend is never called and the chip stays plain', async () => {
    // jsdom: no CSS.highlights, no Highlight — exactly the gate's
    // missing-API posture (restoreApi from earlier tests guarantees it)
    const stockSpy = vi.spyOn(DEFAULT_MICROLIGHTER_BACKEND, 'highlight');
    const { container } = render(InlineCodeHost, {
      props: { text: 'const value: number = 42', lang: 'ts' },
    });
    await settle();
    expect(stockSpy).not.toHaveBeenCalled();
    const code = container.querySelector('code')!;
    expect(code.textContent).toBe('const value: number = 42'); // children verbatim
    expect(code.querySelector('span')).toBeNull(); // zero spans
  });

  it("PLAIN_LANGS short-circuit: 'text' never reaches a backend even with the API open", async () => {
    installHighlightApi();
    const backend = recordingBackend();
    render(InlineCodeHost, {
      props: { text: '--jx-tonal', lang: 'text', backend },
    });
    await settle();
    expect(backend.calls.length).toBe(0);
  });

  it('a rejecting backend stays plain and warns (code-card parity)', async () => {
    installHighlightApi();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const backend: HighlightBackend = {
      id: 'boom',
      highlight: () => Promise.reject(new Error('engine down')),
    };
    const { container } = render(InlineCodeHost, {
      props: { text: 'const value: number = 42', lang: 'ts', backend },
    });
    await waitFor(() => expect(warn).toHaveBeenCalled());
    expect(warn.mock.calls[0]![0]).toContain('[jixoai/inline-code] plain-text fallback:');
    const code = container.querySelector('code')!;
    expect(code.textContent).toBe('const value: number = 42');
    expect(code.querySelector('span')).toBeNull();
  });

  describe('detectInlineLang (the pure fingerprint heuristic)', () => {
    it.each([
      ['css', 'color: var(--jx-tonal)'],
      ['svelte', '{#each list as item (item.id)}{/each}'],
      ['typescript', 'const value: number = 42'],
      ['bash', 'npm install @jixoai/ui'],
      ['json', '{"name": "jixoai", "private": true}'],
      ['', 'Ctrl + C'],
    ])('detects %s', (expected, code) => {
      expect(detectInlineLang(code)).toBe(expected);
    });
  });

  it('exports the detection candidate set (ids + aliases)', () => {
    expect(INLINE_LANGS.length).toBeGreaterThan(0);
    expect([...INLINE_LANGS]).toContain('typescript');
    expect([...INLINE_LANGS]).toContain('ts'); // alias rides along
    expect([...INLINE_LANGS]).toContain('svelte');
    expect([...INLINE_LANGS]).toContain('shell');
  });
});
