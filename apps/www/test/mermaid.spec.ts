/**
 * Mermaid surface behavior suite (test/mermaid.spec.ts, 2026-09-06
 * katex-mermaid).
 *
 * The REAL engine facade runs against a `vi.mock`-ed mermaid module (a
 * ~1MB DOM-bound renderer is not a jsdom citizen — design §8): jsdom's
 * computed styles cannot resolve var(), so the engine's un-stubbed token
 * reads degrade to the committed LIGHT safe-hex oracle by design — a
 * deterministic palette the assertions key on. The suite pins: the floor
 * → SVG swap (data-state machine), the render-id collision contract, the
 * code-card generation discipline (late resolutions no-op), theme
 * following (auto effective-scope observer: document-root flips, scoped
 * ancestor flips, sibling negatives, cleanup disconnect; explicit pins
 * observe nothing), error state + floor survival, rest passthrough with
 * the component's own stamps winning their fields, the no-chrome
 * viewport exemption, zoom as a pure transform, the accessible-name
 * trimmed ladder, and the css-source laws (min-height reserve,
 * reduced-motion kill) the jsdom stylesheet engine cannot compute.
 */
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const mermaidMock = vi.hoisted(() => {
  const state = {
    renderImpl: null as null | ((id: string, text: string) => Promise<{ svg: string }>),
  };
  const initialize = vi.fn();
  const render = vi.fn((id: string, _text: string) =>
    state.renderImpl
      ? state.renderImpl(id, _text)
      : Promise.resolve({ svg: `<svg data-render-id="${id}"></svg>` }),
  );
  return { state, initialize, render };
});

vi.mock('mermaid', () => ({
  default: { initialize: mermaidMock.initialize, render: mermaidMock.render },
}));

import Mermaid from '../src/lib/ui/mermaid/mermaid.svelte';
import MermaidHost from './fixtures/mermaid-host.svelte';

const mermaidCss = readFileSync(
  resolve(process.cwd(), 'src/lib/ui/mermaid/mermaid.css'),
  'utf8',
);

// jsdom ships no clipboard (the copy path falls back) and no execCommand
document.execCommand = vi.fn(() => true) as unknown as typeof document.execCommand;

const figureOf = (container: HTMLElement): HTMLElement =>
  container.querySelector('figure[data-jx-mermaid]')!;
const stateOf = (container: HTMLElement): string | null =>
  figureOf(container).getAttribute('data-state');
const renderedIds = (): string[] => mermaidMock.render.mock.calls.map((call) => call[0]);
const lastInitializePayload = (): Record<string, unknown> & { themeVariables?: Record<string, string> } =>
  mermaidMock.initialize.mock.calls.at(-1)![0];

describe('Mermaid surface', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // jsdom cannot resolve var() — engine reads degrade to the safe floor
    // by design; keep the console quiet while still recording
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    document.documentElement.classList.remove('dark');
  });
  afterEach(() => {
    warnSpy.mockRestore();
    vi.restoreAllMocks();
    mermaidMock.state.renderImpl = null;
  });

  // ---- the floor → SVG swap ────────────────────────────────────────────

  it('paints the escaped source floor first, then swaps the rendered SVG in the same box', async () => {
    const { container } = render(Mermaid, {
      props: { source: 'graph TD; A-->B', name: 'flow' },
    });

    const figure = figureOf(container);
    expect(figure.getAttribute('data-kind')).toBe('diagram');
    // the floor paints synchronously at mount (zero-JS prerender parity)
    expect(container.querySelector('[data-jx-mermaid-floor] code')!.textContent).toBe(
      'graph TD; A-->B',
    );
    expect(container.querySelector('figcaption [data-jx-mermaid-file]')!.textContent).toBe('flow');

    await waitFor(() => expect(stateOf(container)).toBe('rendered'));
    expect(container.querySelector('[data-jx-mermaid-viewport] svg')).not.toBeNull();
    expect(container.querySelector('[data-jx-mermaid-floor]')).toBeNull(); // swapped out
  });

  it('hands the consumer config to the engine ladder — protected fields survive an adversarial config', async () => {
    const { container } = render(Mermaid, {
      props: {
        source: 'graph TD; X',
        config: { securityLevel: 'loose', startOnLoad: true, theme: 'dark' },
      },
    });
    await waitFor(() => expect(stateOf(container)).toBe('rendered'));

    const payload = lastInitializePayload();
    expect(payload.startOnLoad).toBe(false);
    expect(payload.securityLevel).toBe('strict');
    expect(payload.theme).toBe('base');
    // the light safe-hex oracle (jsdom degradation is deterministic)
    expect(payload.themeVariables!.primaryColor).toBe('#d945d1');
  });

  // ---- the render-id collision contract ────────────────────────────────

  it('renders with collision-free ids: two instances, same names, all distinct', async () => {
    const before = renderedIds().length;
    const one = render(Mermaid, { props: { source: 'graph TD; 1', name: 'flow' } });
    const two = render(Mermaid, { props: { source: 'graph TD; 2', name: 'flow' } });
    await waitFor(() => expect(stateOf(one.container)).toBe('rendered'));
    await waitFor(() => expect(stateOf(two.container)).toBe('rendered'));

    const ids = renderedIds().slice(before); // only this test's mounts
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(ids.length); // same-name instances never collide
    expect(ids.every((id) => /^flow-\d+-\d+$/.test(id))).toBe(true); // sanitized bases
  });

  it('consecutive re-renders of one instance never reuse a live id', async () => {
    const { container, getByRole } = render(MermaidHost);
    await waitFor(() => expect(stateOf(container)).toBe('rendered'));
    const first = renderedIds().at(-1)!;

    await fireEvent.click(getByRole('button', { name: 'swap' }));
    await waitFor(() => expect(renderedIds().length).toBeGreaterThan(1));
    const second = renderedIds().at(-1)!;
    expect(second).not.toBe(first);
    expect(second.startsWith(first.slice(0, first.lastIndexOf('-')))).toBe(true); // same base
  });

  // ---- generation discipline ───────────────────────────────────────────

  it('drops the previous booking: a late resolution no-ops and the floor shows the CURRENT source', async () => {
    const gates: Record<string, (result: { svg: string }) => void> = {};
    mermaidMock.state.renderImpl = (id) =>
      new Promise((resolve) => {
        gates[id] = resolve;
      });

    const { container, getByRole } = render(MermaidHost);
    await waitFor(() => expect(Object.keys(gates).length).toBe(1));
    const firstId = Object.keys(gates)[0];

    await fireEvent.click(getByRole('button', { name: 'swap' }));
    flushSync();
    // the CURRENT source paints as the floor while the new render is in
    // flight — never the previous diagram, never a blank
    expect(container.querySelector('[data-jx-mermaid-floor] code')!.textContent).toBe(
      'graph TD; C-->D',
    );
    expect(stateOf(container)).toBe('rendering');

    // the FIRST (late) resolution settles after the booking was dropped
    gates[firstId]({ svg: '<svg data-stale="1"></svg>' });
    await waitFor(() => expect(Object.keys(gates).length).toBe(2));
    expect(container.querySelector('[data-stale]')).toBeNull(); // the stale paint no-ops

    const secondId = Object.keys(gates).find((id) => id !== firstId)!;
    gates[secondId]({ svg: '<svg data-current="1"></svg>' });
    await waitFor(() => expect(container.querySelector('[data-current]')).not.toBeNull());
    expect(stateOf(container)).toBe('rendered');
  });

  // ---- theme following ─────────────────────────────────────────────────

  it('theme auto follows the document-root flip: re-render with the dark palette', async () => {
    const { container } = render(Mermaid, { props: { source: 'graph TD; T' } });
    await waitFor(() => expect(stateOf(container)).toBe('rendered'));
    const rendersBefore = mermaidMock.render.mock.calls.length;

    document.documentElement.classList.add('dark');
    await waitFor(
      () => expect(mermaidMock.render.mock.calls.length).toBeGreaterThan(rendersBefore),
      { timeout: 2000 },
    );
    await waitFor(() => expect(stateOf(container)).toBe('rendered'));
    // re-derived from the dark column — the SVG's baked colors change
    expect(lastInitializePayload().themeVariables!.primaryColor).toBe('#d970dd');
  });

  it('explicit pins never observe: a document-root flip under theme="dark" triggers nothing', async () => {
    const { container } = render(Mermaid, { props: { source: 'graph TD; P', theme: 'dark' } });
    await waitFor(() => expect(stateOf(container)).toBe('rendered'));
    // the dark pin on a light page still renders the DARK palette
    expect(lastInitializePayload().themeVariables!.primaryColor).toBe('#d970dd');

    const rendersBefore = mermaidMock.render.mock.calls.length;
    document.documentElement.classList.add('dark');
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(mermaidMock.render.mock.calls.length).toBe(rendersBefore); // no observer armed
    expect(document.querySelector('.dark')).not.toBeNull(); // the page's own class stands
  });

  it('auto watches the EFFECTIVE SCOPE: a scoped ancestor .jx-light\u2192dark flip re-initializes with changed colors', async () => {
    const host = render(MermaidHost);
    const stage = host.container.querySelector('.stage')!;
    await waitFor(() => expect(stateOf(host.container)).toBe('rendered'));
    expect(lastInitializePayload().themeVariables!.primaryColor).toBe('#d945d1'); // light read

    // scoped tokens: the stage's own class decides what its probes resolve
    const gcs = vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (element) =>
        ({
          color: stage.classList.contains('dark') ? 'rgb(217, 112, 221)' : 'rgb(217, 69, 209)',
          fontFamily: '',
        }) as unknown as CSSStyleDeclaration,
    );
    try {
      const rendersBefore = mermaidMock.render.mock.calls.length;
      stage.classList.replace('jx-light', 'dark'); // the ancestor flips, root never mutates
      await waitFor(
        () => expect(mermaidMock.render.mock.calls.length).toBeGreaterThan(rendersBefore),
        { timeout: 2000 },
      );
      await waitFor(() => expect(stateOf(host.container)).toBe('rendered'));
      // the palette re-derived from the flipped scope's tokens
      expect(lastInitializePayload().themeVariables!.primaryColor).toBe('#d970dd');
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // an unrelated sibling's class change triggers NOTHING
      const afterFlip = mermaidMock.render.mock.calls.length;
      const bystander = host.container.querySelector('.bystander')!;
      bystander.classList.add('moved');
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(mermaidMock.render.mock.calls.length).toBe(afterFlip);

      // cleanup disconnects every observer: after unmount, flips trigger nothing
      host.unmount();
      const afterUnmount = mermaidMock.render.mock.calls.length;
      stage.classList.replace('dark', 'jx-light');
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(mermaidMock.render.mock.calls.length).toBe(afterUnmount);
    } finally {
      gcs.mockRestore();
    }
  });

  // ---- error state ─────────────────────────────────────────────────────

  it('a parse failure paints the error strip above the STANDING floor — never a blank', async () => {
    mermaidMock.state.renderImpl = () =>
      Promise.reject(new Error('Parse error on line 2:\nexpected node near " broken"'));
    const { container } = render(Mermaid, { props: { source: 'broken ((' } });

    await waitFor(() => expect(stateOf(container)).toBe('error'));
    const strip = container.querySelector('[data-jx-mermaid-error]')!;
    expect(strip.getAttribute('role')).toBe('status');
    expect(strip.textContent).toContain('render error');
    // the diagnostic's FIRST line only
    expect(container.querySelector('[data-jx-mermaid-diagnostic]')!.textContent).toContain(
      'Parse error on line 2',
    );
    expect(container.querySelector('[data-jx-mermaid-diagnostic]')!.textContent).not.toContain(
      'expected node',
    );
    // the source floor never disappears on failure
    expect(container.querySelector('[data-jx-mermaid-floor] code')!.textContent).toBe('broken ((');
  });

  // ---- rest passthrough + component stamps ─────────────────────────────

  it('spreads consumer rest attributes onto the figure; the component\u2019s own stamps win their fields', async () => {
    let clicked = false;
    const { container } = render(Mermaid, {
      props: {
        source: 'graph TD; R',
        'data-testid': 'diagram-card',
        title: 'deploy flow',
        'data-jx-mermaid': 'consumer-value', // conflict: the component's stamp wins
        'data-state': 'zzz', // conflict: the state machine owns it
        onclick: () => {
          clicked = true;
        },
      },
    });

    const figure = container.querySelector('[data-testid="diagram-card"]')!;
    expect(figure.tagName).toBe('FIGURE');
    expect(figure.getAttribute('title')).toBe('deploy flow');
    // rest first, the component's stamp after: the consumer's value loses
    // (the stamp's own serialization — Svelte renders a bare attribute as
    // its boolean — is not this test's concern)
    expect(figure.getAttribute('data-jx-mermaid')).not.toBe('consumer-value');
    expect(figure.matches('figure[data-jx-mermaid]')).toBe(true);
    expect(figure.getAttribute('data-state')).not.toBe('zzz');

    await fireEvent.click(figure);
    expect(clicked).toBe(true); // consumer handlers ride through
  });

  // ---- the viewport exemption ──────────────────────────────────────────

  it('mounts NO shared scroll chrome inside the viewport (the recorded exemption)', async () => {
    const { container } = render(Mermaid, { props: { source: 'graph TD; N' } });
    await waitFor(() => expect(stateOf(container)).toBe('rendered'));

    const viewport = container.querySelector('[data-jx-mermaid-viewport]')!;
    expect(viewport.getAttribute('role')).toBe('img');
    for (const selector of [
      '[data-jx-scroll-run]',
      '[data-jx-scroll-state]',
      '[data-jx-scroll-chevron]',
      '.jx-scroll-host',
      '.jx-scroll-veil-layer',
      '.jx-scroll-veil',
    ]) {
      expect(viewport.querySelector(selector)).toBeNull();
    }
  });

  // ---- zoom: pure transform ────────────────────────────────────────────

  it('zooms by pure transform — clamped \u00b10.25 steps, reset, NO engine call', async () => {
    const { container } = render(Mermaid, { props: { source: 'graph TD; Z' } });
    await waitFor(() => expect(stateOf(container)).toBe('rendered'));
    const rendersBefore = mermaidMock.render.mock.calls.length;

    const zoomEl = () => container.querySelector('[data-jx-mermaid-zoom]')!;
    const press = (id: string) =>
      fireEvent.click(container.querySelector(`[data-jx-mermaid-zoom-${id}]`)!);

    expect(zoomEl().getAttribute('style')).toContain('scale(1)');
    await press('in');
    expect(zoomEl().getAttribute('style')).toContain('scale(1.25)');
    await press('out');
    expect(zoomEl().getAttribute('style')).toContain('scale(1)');

    for (let i = 0; i < 9; i += 1) await press('in'); // 1 + 2.25 > 3 → clamped
    expect(zoomEl().getAttribute('style')).toContain('scale(3)');
    await press('reset');
    expect(zoomEl().getAttribute('style')).toContain('scale(1)');

    // zoom never re-rendered: no engine call, no svg regeneration
    expect(mermaidMock.render.mock.calls.length).toBe(rendersBefore);
  });

  // ---- accessible name ─────────────────────────────────────────────────

  it('keeps a NON-EMPTY accessible name at all times — the trimmed ladder', async () => {
    const blank = render(Mermaid, {
      props: { source: 'x', name: '   ', labels: { diagram: '' } },
    });
    expect(
      blank.container.querySelector('[data-jx-mermaid-viewport]')!.getAttribute('aria-label'),
    ).toBe('Diagram'); // whitespace name AND empty localized label fall through

    const named = render(Mermaid, { props: { source: 'x', name: ' flow ' } });
    expect(
      named.container.querySelector('[data-jx-mermaid-viewport]')!.getAttribute('aria-label'),
    ).toBe('flow'); // trimmed

    const localized = render(Mermaid, { props: { source: 'x', labels: { diagram: 'Diagrama' } } });
    expect(
      localized.container.querySelector('[data-jx-mermaid-viewport]')!.getAttribute('aria-label'),
    ).toBe('Diagrama');

    // let the mounts' engine reads settle INSIDE this test's warn spy
    await waitFor(() => expect(stateOf(blank.container)).toBe('rendered'));
    await waitFor(() => expect(stateOf(named.container)).toBe('rendered'));
    await waitFor(() => expect(stateOf(localized.container)).toBe('rendered'));
  });

  // ---- copy control + localization payload ─────────────────────────────

  it('copies the raw source (clipboard fallback) and localizes the control vocabulary', async () => {
    const { container } = render(Mermaid, {
      props: {
        source: 'graph TD; C',
        labels: {
          copy: '复制',
          copied: '已复制',
          zoomIn: '放大',
          zoomOut: '缩小',
          zoomReset: '重置',
        },
      },
    });
    await waitFor(() => expect(stateOf(container)).toBe('rendered'));

    expect(
      container.querySelector('[data-jx-mermaid-zoom-in]')!.getAttribute('aria-label'),
    ).toBe('放大');
    expect(
      container.querySelector('[data-jx-mermaid-zoom-out]')!.getAttribute('aria-label'),
    ).toBe('缩小');
    expect(
      container.querySelector('[data-jx-mermaid-zoom-reset]')!.getAttribute('aria-label'),
    ).toBe('重置');

    const copyButton = container.querySelector('.jx-mermaid-copy')!;
    expect(copyButton.textContent).toContain('复制');
    await fireEvent.click(copyButton);
    await waitFor(() => expect(copyButton.textContent).toContain('已复制'));
    expect(document.execCommand).toHaveBeenCalled(); // the jsdom fallback path
  });

  it('honors copyable/zoomable opt-outs (the foot disappears entirely)', async () => {
    const { container } = render(Mermaid, {
      props: { source: 'graph TD; B', copyable: false, zoomable: false },
    });
    await waitFor(() => expect(stateOf(container)).toBe('rendered'));
    expect(container.querySelector('[data-jx-mermaid-foot]')).toBeNull();
  });

  // ---- css-source laws (jsdom cannot compute them) ─────────────────────

  it('reserves the floor min-height through the documented token; the fade dies under reduced motion', () => {
    expect(mermaidCss).toContain('@layer theme, base, components, utilities;');
    expect(mermaidCss).toContain('--jx-mermaid-floor-min: 6rem'); // consumer-tunable default
    expect(mermaidCss).toContain('min-height: var(--jx-mermaid-floor-min)');
    expect(mermaidCss).toMatch(/data-state='floor'/);
    expect(mermaidCss).toMatch(/data-state='rendering'/);
    expect(mermaidCss).toContain('@keyframes jx-mermaid-fade');
    expect(mermaidCss).toMatch(/prefers-reduced-motion[\s\S]*?animation: none/);
    // the pan viewport: overscroll containment, the scrollbar-token law
    expect(mermaidCss).toContain('overscroll-behavior: contain');
  });

  // ── the crossed-pin canvas (Owner acceptance, 2026-09-07) ────────────
  it('a CROSSED pin brings its own canvas — the viewport paints the target sheet background + ink; auto and same-direction pins stay page-owned', async () => {
    document.documentElement.classList.remove('dark'); // a LIGHT page

    // dark pin against the light page: the dark sheet's safe-hex pair
    const dark = render(Mermaid, { props: { theme: 'dark', source: 'flowchart LR\n  a-->b' } });
    await vi.waitFor(() => {
      const viewport = dark.container.querySelector('[data-jx-mermaid-viewport]') as HTMLElement;
      expect(viewport.style.backgroundColor).toBe('rgb(0, 0, 0)'); // dark --background (jsdom normalizes hex)
      expect(viewport.style.color).toBe('rgb(255, 255, 255)'); // dark --foreground
    });
    dark.unmount();

    // same-direction pin: page canvas keeps ownership (no inline paint)
    const same = render(Mermaid, { props: { theme: 'light', source: 'flowchart LR\n  a-->b' } });
    await vi.waitFor(() => {
      const viewport = same.container.querySelector('[data-jx-mermaid-viewport]') as HTMLElement;
      expect(viewport.style.backgroundColor).toBe('');
    });
    same.unmount();

    // auto: never its own canvas
    const auto = render(Mermaid, { props: { source: 'flowchart LR\n  a-->b' } });
    await vi.waitFor(() => {
      const viewport = auto.container.querySelector('[data-jx-mermaid-viewport]') as HTMLElement;
      expect(viewport.style.backgroundColor).toBe('');
    });
    auto.unmount();
  });

});
