/**
 * The AUTO_LANG chain suite (test/code-card-lang-detector.spec.ts,
 * highlight-lang-detector, 2026-09-07).
 *
 * The contract under test (design D2.1 — three rings + a non-ring tail):
 *   langDetector prop → HIGHLIGHT_DETECT_KEY context → backend.detector
 *   → runtime reject (the frozen install + wiring template).
 * Null cascades (a ring with "no opinion" falls through); a rejecting
 * ring is TERMINAL (plain fallback + `[detect:<ring-id>]` warn); all
 * present rings null → `[detect:all]` warn; the sentinel is STRICT
 * equality — 'AUTO' / ' auto ' / 'auto\n' are ordinary lang values.
 * A successful detection feeds the normal highlight path: the resolved
 * lang lands in the backend's opts, the backend's own alias/curated/
 * reject law applies untouched.
 */
import { render, waitFor } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CodeCard from '../src/lib/ui/code-card/code-card.svelte';
import DetectHost from './fixtures/code-card-detect-host.svelte';
import DetectPluginHost from './fixtures/code-card-detect-plugin-host.svelte';
import { HIGHLIGHT_DETECT_DEF } from '../src/lib/highlight/context.svelte';
import { definePlugin } from '../src/lib/context-plugin.svelte';
import type { HighlightBackend } from '../src/lib/highlight/backend';
import type {
  DetectInput,
  DetectResult,
  LanguageDetector,
} from '../src/lib/highlight/lang-detector';

/** a backend that records the opts of every highlight call and paints
 * a deterministic marker span — the assertion surface for "what lang
 * did the chain resolve" */
function recordingBackend(): {
  backend: HighlightBackend;
  langs: Array<string | undefined>;
} {
  const langs: Array<string | undefined> = [];
  const backend: HighlightBackend = {
    id: 'recording',
    highlight: (el, source, opts) => {
      langs.push(opts.lang);
      el.textContent = source;
      el.setAttribute('data-painted', 'yes');
      return Promise.resolve();
    },
  };
  return { backend, langs };
}

/** a detector stub with call recording — ring id is the caller's label */
function stubDetector(
  id: string,
  answer: DetectResult | null | Promise<DetectResult | null> = null,
): { detector: LanguageDetector; inputs: DetectInput[] } {
  const inputs: DetectInput[] = [];
  const detector: LanguageDetector = {
    id,
    detect: (input) => {
      inputs.push(input);
      return Promise.resolve(answer).then((a) => a);
    },
  };
  return { detector, inputs };
}

const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

afterEach(() => {
  warn.mockClear();
});

describe('CodeCard — the AUTO_LANG chain', () => {
  it('a non-auto lang never runs detection: the backend receives the prop verbatim', async () => {
    const { backend, langs } = recordingBackend();
    const context = stubDetector('context', { lang: 'python', source: 'engine' });
    const { container } = await render(DetectHost, {
      props: { lang: 'ts', code: 'const v = 1;', backend, detector: context.detector },
    });
    await waitFor(() =>
      expect(container.querySelector('[data-painted="yes"]')).not.toBeNull(),
    );
    expect(langs).toEqual(['ts']);
    expect(context.inputs).toHaveLength(0);
  });

  it('the sentinel is STRICT equality: AUTO / " auto " / "auto\\n" are ordinary langs', async () => {
    const { backend, langs } = recordingBackend();
    const context = stubDetector('context', { lang: 'python', source: 'engine' });
    for (const ordinary of ['AUTO', ' auto ', 'auto\n']) {
      langs.length = 0;
      const { container } = await render(DetectHost, {
        props: { lang: ordinary, code: 'x', backend, detector: context.detector },
      });
      await waitFor(() => expect(langs).toHaveLength(1));
      expect(langs[0]).toBe(ordinary);
      container.remove();
    }
    expect(context.inputs).toHaveLength(0);
  });

  it('the prop ring wins and its result feeds the highlight path', async () => {
    const { backend, langs } = recordingBackend();
    const context = stubDetector('context', { lang: 'ignored', source: 'engine' });
    const prop = stubDetector('prop', { lang: 'ruby', source: 'filename' });
    const { container } = await render(DetectHost, {
      props: {
        lang: 'auto',
        code: 'puts 1',
        filename: 'script.rb',
        backend,
        detector: context.detector,
        langDetector: prop.detector,
      },
    });
    await waitFor(() => expect(langs).toEqual(['ruby']));
    // the input passthrough law: code + filename arrive verbatim
    expect(prop.inputs).toEqual([{ code: 'puts 1', filename: 'script.rb' }]);
    expect(context.inputs).toHaveLength(0); // the earlier ring answered
    expect(container.querySelector('[data-painted="yes"]')).not.toBeNull();
  });

  it('null cascades: a no-opinion prop falls through to the context ring', async () => {
    const { backend, langs } = recordingBackend();
    const context = stubDetector('context', { lang: 'python', source: 'structure' });
    const prop = stubDetector('prop', null);
    await render(DetectHost, {
      props: { lang: 'auto', code: 'def f(): pass', backend, detector: context.detector, langDetector: prop.detector },
    });
    await waitFor(() => expect(langs).toEqual(['python']));
    expect(prop.inputs).toHaveLength(1);
    expect(context.inputs).toHaveLength(1);
  });

  it('the backend.detector ring answers when prop and context are absent', async () => {
    const { backend, langs } = recordingBackend();
    const engine = stubDetector('engine', { lang: 'go', source: 'engine' });
    backend.detector = engine.detector;
    const { container } = await render(CodeCard, {
      props: { lang: 'auto', code: 'package main', filename: 'main.go', backend },
    });
    await waitFor(() => expect(langs).toEqual(['go']));
    expect(engine.inputs).toEqual([{ code: 'package main', filename: 'main.go' }]);
    expect(container.querySelector('[data-painted="yes"]')).not.toBeNull();
  });

  it('a non-function detector shape is skipped (the function-judgment gate)', async () => {
    const { backend, langs } = recordingBackend();
    const context = stubDetector('context', { lang: 'python', source: 'filename' });
    await render(DetectHost, {
      props: {
        lang: 'auto',
        code: 'x = 1',
        backend,
        detector: context.detector,
        // a malformed prop: not a LanguageDetector, must be ignored
        langDetector: { id: 'broken' } as unknown as LanguageDetector,
      },
    });
    await waitFor(() => expect(langs).toEqual(['python']));
    expect(context.inputs).toHaveLength(1);
  });

  it('a rejecting ring is TERMINAL: warn names the ring, later rings never run, plain text stands', async () => {
    const { backend, langs } = recordingBackend();
    const context = vi.fn().mockResolvedValue({ lang: 'python', source: 'engine' });
    const prop: LanguageDetector = {
      id: 'prop',
      detect: () => Promise.reject(new Error('wasm boom')),
    };
    const { container } = await render(DetectHost, {
      props: { lang: 'auto', code: 'const v = 1;', backend, detector: { detect: context } as LanguageDetector, langDetector: prop },
    });
    await waitFor(() => expect(warn).toHaveBeenCalled());
    expect(warn).toHaveBeenCalledWith('[detect:prop]', expect.any(Error));
    // the chain stopped: context never consulted, no highlight ran
    expect(context).not.toHaveBeenCalled();
    expect(langs).toHaveLength(0);
    expect(container.querySelector('pre code')!.textContent).toBe('const v = 1;');
  });

  it('all present rings null: the [detect:all] warn lists the ring ids, plain text stands', async () => {
    const { backend, langs } = recordingBackend();
    const context = stubDetector('context', null);
    const prop = stubDetector('prop', null);
    const { container } = await render(DetectHost, {
      props: { lang: 'auto', code: '???', backend, detector: context.detector, langDetector: prop.detector },
    });
    await waitFor(() =>
      expect(warn).toHaveBeenCalledWith('[detect:all] no language detected (rings: prop,context)'),
    );
    expect(langs).toHaveLength(0);
    expect(container.querySelector('pre code')!.textContent).toBe('???');
  });

  it('no ring at all: the frozen reject template with install + wiring guidance', async () => {
    const { backend, langs } = recordingBackend();
    const { container } = await render(CodeCard, {
      props: { lang: 'auto', code: 'const v = 1;', backend },
    });
    await waitFor(() =>
      expect(warn).toHaveBeenCalledWith(
        '[jixoai/code-card] plain-text fallback:',
        expect.objectContaining<Error>({
          message: expect.stringContaining(
            "lang='auto' needs a detector — none of prop/context/backend provided one",
          ),
        }),
      ),
    );
    // the template carries the install + wiring guidance verbatim parts
    const error = warn.mock.calls.at(-1)![1] as Error;
    expect(error.message).toContain('Install @jixoai/highlight-lang-detector');
    expect(error.message).toContain('<HighlightDetectDefault>');
    expect(error.message).toContain('setContext(HIGHLIGHT_DETECT_KEY');
    expect(langs).toHaveLength(0);
    expect(container.querySelector('pre code')!.textContent).toBe('const v = 1;');
  });
});

// ---------------------------------------------------------------------------
// the kernel projection (HIGHLIGHT_DETECT_DEF) — the site-wide plugin form
// ---------------------------------------------------------------------------
describe('CodeCard — the HIGHLIGHT_DETECT_DEF plugin projection', () => {
  it('a plugin targeting the detect def projects the subtree default detector', async () => {
    const { backend, langs } = recordingBackend();
    const projected = stubDetector('betlang', { lang: 'python', source: 'statistical' });
    const plugin = definePlugin({
      name: 'site-betlang',
      targets: [HIGHLIGHT_DETECT_DEF],
      before: () => projected.detector,
    });
    const { container } = await render(DetectPluginHost, {
      props: { plugins: [plugin], backend },
    });
    // the card has no prop: the plugin-projected detector answers
    await waitFor(() => expect(langs).toEqual(['python']));
    expect(projected.inputs).toHaveLength(1);
    expect(container.querySelector('[data-painted]')?.getAttribute('data-painted')).toBe('yes');
  });

  it('the explicit langDetector prop outranks the plugin projection', async () => {
    const { backend, langs } = recordingBackend();
    const projected = stubDetector('betlang', null);
    const prop = stubDetector('prop', { lang: 'ruby', source: 'filename' });
    const plugin = definePlugin({
      name: 'site-betlang',
      targets: [HIGHLIGHT_DETECT_DEF],
      before: () => projected.detector,
    });
    const { container } = await render(DetectPluginHost, {
      props: { plugins: [plugin], backend },
    });
    // the host's card carries no prop — mount the prop case directly
    container.remove();
    await render(DetectHost, {
      props: {
        lang: 'auto',
        code: 'puts 1',
        backend,
        detector: projected.detector,
        langDetector: prop.detector,
      },
    });
    await waitFor(() => expect(langs).toEqual(['ruby']));
    expect(prop.inputs).toHaveLength(1);
  });
});
