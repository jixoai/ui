/**
 * lib/mermaid-engine contract suite (test/mermaid-engine.spec.ts,
 * 2026-09-06 katex-mermaid).
 *
 * The engine is `vi.mock`-ed (a ~1MB ESM engine with a DOM-bound
 * renderer is not a jsdom citizen — design §8); these tests assert the
 * CONTRACT, not renders: the initialize payload ladder (protected
 * fields survive adversarial config, derived hex palette, field-wise
 * user themeVariables), the lazy singleton (one import), the probe
 * pipeline (parseColor on RESOLVED strings, probes inside the passed
 * root, the committed per-theme safe-hex oracle, the separate
 * fontFamily probe), the serial queue (fingerprint over the final
 * merged payload, rejection-recovery), the render-id contract, the
 * explicit-pin local wrapper, scoped theme roots, and the SSR guard.
 * getComputedStyle is stubbed per test to play the browser's resolver.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mermaidMock = vi.hoisted(() => {
  const state = {
    /** dynamic-import invocations the mock factory served (singleton check) */
    imports: 0,
    /** swap per test for deferred / failing renders; null = happy path */
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

vi.mock('mermaid', () => {
  mermaidMock.state.imports++;
  return { default: { initialize: mermaidMock.initialize, render: mermaidMock.render } };
});

// parseColor spy: delegates to the real parser, records the resolved
// strings the probe pipeline hands it (partial mock, behavior unchanged)
const colorMock = vi.hoisted(() => ({ parseColor: undefined as unknown as ReturnType<typeof vi.fn> }));
vi.mock('$lib/color-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/color-utils')>();
  colorMock.parseColor = vi.fn(actual.parseColor);
  return { ...actual, parseColor: colorMock.parseColor };
});

import type { MermaidConfig } from 'mermaid';
import {
  createRenderIdMinter,
  deriveThemeVariables,
  MermaidRenderError,
  readThemeTokens,
  renderDiagram,
  resolveTheme,
  SAFE_HEX,
  sanitizeRenderIdBase,
  stableStringify,
  type ThemeTokens,
} from '$lib/mermaid-engine';

/** play the browser's computed-style resolver for the probe pipeline. */
function stubComputed(style: { color: string; fontFamily: string }) {
  return vi
    .spyOn(window, 'getComputedStyle')
    .mockImplementation(() => ({ ...style }) as unknown as CSSStyleDeclaration);
}

const lastPayload = (): MermaidConfig & Record<string, unknown> =>
  mermaidMock.initialize.mock.calls.at(-1)![0];

/** the sheet's own values as ThemeTokens (the safe-hex oracle's sources). */
const sheetTokens: ThemeTokens = {
  background: '#ffffff',
  foreground: '#000000',
  primary: '#d945d1',
  secondary: '#ffff00',
  accent: '#0066ff',
  muted: '#f0f0f0',
  border: '#000000',
  error: '#de3b3d',
  chart: ['#d945d1', '#11a22f', '#008cdf', '#f9b800', '#de3b3d'],
};

describe('lib/mermaid-engine', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // jsdom cannot resolve var() — un-stubbed reads degrade to the safe
    // floor by design; keep the console quiet while still recording
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    document.documentElement.classList.remove('dark');
  });
  afterEach(() => {
    warnSpy.mockRestore();
    vi.restoreAllMocks();
  });

  // ---- resolveTheme ────────────────────────────────────────────────────

  it('resolveTheme: auto follows the document root .dark class; explicit modes pass through', () => {
    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('dark')).toBe('dark');
    expect(resolveTheme('auto')).toBe('light');
    document.documentElement.classList.add('dark');
    expect(resolveTheme('auto')).toBe('dark');
    document.documentElement.classList.remove('dark');
  });

  // ---- initialize payload ladder ───────────────────────────────────────

  it('initializes startOnLoad:false / securityLevel strict / theme base with the derived hex palette', async () => {
    const gcs = stubComputed({ color: 'rgb(255, 0, 0)', fontFamily: '"X Font", monospace' });
    await renderDiagram('graph TD; A-->B', { id: 'ladder-1' });
    gcs.mockRestore();

    const payload = lastPayload();
    expect(payload.startOnLoad).toBe(false);
    expect(payload.securityLevel).toBe('strict');
    expect(payload.theme).toBe('base');
    // the derived tier: every field from its ONE token source
    expect(payload.themeVariables).toEqual(
      expect.objectContaining({
        primaryColor: '#ff0000',
        primaryBorderColor: '#ff0000',
        mainBkg: '#ff0000',
        background: '#ff0000',
      }),
    );
    // the separate fontFamily probe rode ThemeTokens into themeVariables
    expect(payload.themeVariables.fontFamily).toBe('"X Font", monospace');
    expect(payload.themeVariables.cScale0).toBe('#ff0000');
  });

  it('protected fields survive an adversarial config; user themeVariables ride FIELD-WISE over derived', async () => {
    const gcs = stubComputed({ color: 'rgb(255, 0, 0)', fontFamily: '' });
    await renderDiagram('graph TD; X', {
      id: 'ladder-2',
      config: {
        securityLevel: 'loose',
        startOnLoad: true,
        theme: 'dark',
        fontFamily: 'Comic Sans',
        flowchart: { curve: 'basis' },
        themeVariables: { lineColor: '#00ff00' },
      } as MermaidConfig,
    });
    gcs.mockRestore();

    const payload = lastPayload();
    expect(payload.startOnLoad).toBe(false);
    expect(payload.securityLevel).toBe('strict');
    expect(payload.theme).toBe('base');
    // user themeVariables override ONE field; the untouched derived spine
    // stays token-driven
    expect(payload.themeVariables.lineColor).toBe('#00ff00');
    expect(payload.themeVariables.nodeBorder).toBe('#ff0000');
    // the rest of the user config deep-merges at the bottom tier
    expect(payload.flowchart).toEqual({ curve: 'basis' });
    expect(payload.fontFamily).toBe('Comic Sans');
  });

  // ---- the lazy singleton ──────────────────────────────────────────────

  it('loads the engine exactly once — repeated renders share the memoized import', async () => {
    const before = mermaidMock.state.imports;
    await renderDiagram('graph TD; S1', { id: 'singleton-1' });
    await renderDiagram('graph TD; S2', { id: 'singleton-2' });
    expect(mermaidMock.state.imports).toBe(before);
    expect(mermaidMock.state.imports).toBe(1); // one import for the whole file
  });

  // ---- the probe pipeline ──────────────────────────────────────────────

  it('reads tokens through probes INSIDE the passed root and funnels RESOLVED strings through parseColor', () => {
    const root = document.createElement('div');
    document.body.append(root);
    // containment is observable AT READ TIME (the probes remove themselves
    // after each read — by design), so the spy records it per call
    const inRoot: boolean[] = [];
    const gcs = vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (element) =>
        ((inRoot.push(root.contains(element as Node)),
        {
          color: 'oklch(0.6489 0.237 330)',
          fontFamily: 'var(--font-sans)',
        }) as unknown as CSSStyleDeclaration),
    );

    const tokens = readThemeTokens(root);

    // parseColor ran on the browser-resolved (serialized) string, once per
    // color token
    expect(colorMock.parseColor).toHaveBeenCalledWith('oklch(0.6489 0.237 330)');
    expect(colorMock.parseColor.mock.calls.length).toBeGreaterThanOrEqual(13);
    // and the pipeline converted it to the mermaid-safe hex
    expect(tokens.primary).toBe('#d945d1');
    // every computed-style subject sat inside the passed root's subtree
    // (13 color probes + the fontFamily probe)
    expect(inRoot).toHaveLength(14);
    expect(inRoot.every(Boolean)).toBe(true);
    // an unresolvable fontFamily omits font (the separate probe, silent)
    expect(tokens.font).toBeUndefined();

    gcs.mockRestore();
    root.remove();
  });

  it('resolves --font-sans through the SEPARATE fontFamily probe — verbatim, never through the color pipeline', () => {
    const gcs = stubComputed({ color: 'rgb(1,2,3)', fontFamily: '"JetBrains Mono Variable", monospace' });
    const tokens = readThemeTokens(document.createElement('div'));
    expect(tokens.font).toBe('"JetBrains Mono Variable", monospace');
    // the color probe's parseColor never sees the font string
    expect(colorMock.parseColor).not.toHaveBeenCalledWith('"JetBrains Mono Variable", monospace');
    gcs.mockRestore();
  });

  it('degrades unparseable tokens to the committed per-theme safe hex — one warn per token per root, never a raw string', () => {
    const root = document.createElement('div');
    document.body.append(root);
    const gcs = stubComputed({ color: 'var(--primary)', fontFamily: '' });

    const degraded = () =>
      warnSpy.mock.calls.filter(([message]) => String(message).includes('unparseable')).length;

    const light = readThemeTokens(root);
    // the documented oracle, light column
    expect(light.background).toBe(SAFE_HEX.background.light);
    expect(light.primary).toBe(SAFE_HEX.primary.light);
    expect(light.border).toBe(SAFE_HEX.border.light);
    expect(light.chart).toEqual([
      SAFE_HEX['chart-1'].light,
      SAFE_HEX['chart-2'].light,
      SAFE_HEX['chart-3'].light,
      SAFE_HEX['chart-4'].light,
      SAFE_HEX['chart-5'].light,
    ]);
    const afterFirstRead = degraded();
    expect(afterFirstRead).toBe(13); // one per color token, exactly once

    readThemeTokens(root); // second read: SAME warns suppressed (not per render)
    expect(degraded()).toBe(afterFirstRead);

    document.documentElement.classList.add('dark');
    const dark = readThemeTokens(root);
    expect(dark.primary).toBe(SAFE_HEX.primary.dark); // the dark column
    expect(dark.chart[1]).toBe(SAFE_HEX['chart-2'].dark);
    document.documentElement.classList.remove('dark');
    expect(degraded()).toBe(afterFirstRead + 13); // the dark column warned its own set

    gcs.mockRestore();
    root.remove();
  });

  it('derives themeVariables through the one-source-per-field table (font optional)', () => {
    const withoutFont = deriveThemeVariables(sheetTokens, 'light');
    expect(withoutFont).toEqual({
      background: '#ffffff',
      mainBkg: '#ffffff',
      primaryTextColor: '#000000',
      textColor: '#000000',
      primaryColor: '#d945d1',
      primaryBorderColor: '#d945d1',
      lineColor: '#000000',
      nodeBorder: '#000000',
      clusterBkg: '#f0f0f0',
      clusterBorder: '#f0f0f0',
      secondaryColor: '#ffff00',
      tertiaryColor: '#0066ff',
      cScale0: '#d945d1',
      cScale1: '#11a22f',
      cScale2: '#008cdf',
      cScale3: '#f9b800',
      cScale4: '#de3b3d',
      errorBkgColor: '#de3b3d',
    });
    expect('fontFamily' in withoutFont).toBe(false);

    const withFont = deriveThemeVariables({ ...sheetTokens, font: 'F, monospace' }, 'dark');
    expect(withFont.fontFamily).toBe('F, monospace');
  });

  // ---- the serial queue + fingerprint ──────────────────────────────────

  it('fingerprints the FINAL merged payload: identical payload skips initialize; a token change INSIDE the theme mode re-initializes', async () => {
    const gcs = stubComputed({ color: 'rgb(255, 0, 0)', fontFamily: '' });
    await renderDiagram('graph TD; F1', { id: 'fp-1' });
    const baseline = mermaidMock.initialize.mock.calls.length;

    // same theme + same tokens + a fresh-but-identical config object:
    // object identity never participates
    await renderDiagram('graph TD; F2', { id: 'fp-2', config: { flowchart: { curve: 'basis' } } });
    await renderDiagram('graph TD; F3', { id: 'fp-3', config: { flowchart: { curve: 'basis' } } });
    const withConfig = mermaidMock.initialize.mock.calls.length;
    expect(withConfig).toBe(baseline + 1); // the config CHANGE initialized once…

    await renderDiagram('graph TD; F4', { id: 'fp-4', config: { flowchart: { curve: 'basis' } } });
    expect(mermaidMock.initialize.mock.calls.length).toBe(withConfig); // …its repeat skipped

    // same theme mode, changed token VALUE → the fingerprint flips → re-init
    gcs.mockImplementation(
      () => ({ color: 'rgb(0, 0, 255)', fontFamily: '' }) as unknown as CSSStyleDeclaration,
    );
    await renderDiagram('graph TD; F5', { id: 'fp-5', config: { flowchart: { curve: 'basis' } } });
    expect(mermaidMock.initialize.mock.calls.length).toBe(withConfig + 1);
    expect(lastPayload().themeVariables!.primaryColor).toBe('#0000ff');

    gcs.mockRestore();
  });

  it('stableStringify: sorted keys, undefined omitted, non-JSON via String(), identity-blind, circular → TypeError', () => {
    expect(stableStringify({ b: 1, a: { d: 2, c: [3, 'x'] } })).toBe('{"a":{"c":[3,"x"],"d":2},"b":1}');
    expect(stableStringify({ a: undefined, b: null })).toBe('{"b":null}');
    // NaN is non-JSON → String(v); true/'q' keep their JSON forms
    expect(stableStringify({ n: Number.NaN, t: true, s: 'q' })).toBe('{"n":NaN,"s":"q","t":true}');
    expect(stableStringify({ o: { x: 1 } })).toBe(stableStringify({ o: { x: 1 } }));
    const circular: Record<string, unknown> = { name: 'cfg' };
    circular.self = circular;
    expect(() => stableStringify(circular)).toThrow(TypeError);
  });

  it('serializes concurrent different-theme renders — each comes out in its own theme, poison-free', async () => {
    const gates: Record<string, (result: { svg: string }) => void> = {};
    mermaidMock.state.renderImpl = (id) =>
      new Promise((resolve) => {
        gates[id] = resolve;
      });
    try {
      const initialized = mermaidMock.initialize.mock.calls.length;
      const lightPromise = renderDiagram('graph TD; L', { id: 'conc-light' });
      // the queue runs light's initialize+render first; dark's pair has NOT
      // started (the mutex serializes init/render pairs)
      await vi.waitFor(() => expect(gates['conc-light']).toBeDefined());
      expect(gates['conc-dark']).toBeUndefined();

      gates['conc-light']({ svg: 'L-SVG' });
      const darkPromise = renderDiagram('graph TD; D', { id: 'conc-dark', theme: 'dark' });
      await vi.waitFor(() => expect(gates['conc-dark']).toBeDefined());

      gates['conc-dark']({ svg: 'D-SVG' });
      const [light, dark] = await Promise.all([lightPromise, darkPromise]);
      expect(light).toEqual({ svg: 'L-SVG', theme: 'light' });
      expect(dark).toEqual({ svg: 'D-SVG', theme: 'dark' });

      // the two initialize payloads each carried their own sheet
      // (un-stubbed jsdom degradation is THEME-KEYED: the oracle columns)
      const calls = mermaidMock.initialize.mock.calls;
      expect(calls.length).toBe(initialized + 2);
      expect(calls.at(-2)![0].themeVariables.primaryColor).toBe(SAFE_HEX.primary.light);
      expect(calls.at(-1)![0].themeVariables.primaryColor).toBe(SAFE_HEX.primary.dark);
    } finally {
      mermaidMock.state.renderImpl = null;
    }
  });

  it('a REJECTED render never poisons the chain — the next render succeeds and the caller keeps its own error', async () => {
    let fail = true;
    mermaidMock.state.renderImpl = (id) =>
      fail
        ? Promise.reject(new Error(`parse error near "${id}"`))
        : Promise.resolve({ svg: `<svg data-render-id="${id}"></svg>` });
    try {
      const poisoned = renderDiagram('broken ((', { id: 'poison-1' });
      await expect(poisoned).rejects.toBeInstanceOf(MermaidRenderError);
      await expect(poisoned).rejects.toThrow(/parse error near "poison-1"/);

      fail = false;
      const next = await renderDiagram('graph TD; A-->B', { id: 'poison-2' });
      expect(next.svg).toBe('<svg data-render-id="poison-2"></svg>');
      expect(next.theme).toBe('light');
    } finally {
      mermaidMock.state.renderImpl = null;
    }
  });

  // ---- the render-id contract ──────────────────────────────────────────

  it('mints collision-free render ids: default base never empty, same-name instances and consecutive renders all distinct', () => {
    expect(sanitizeRenderIdBase(undefined)).toBe('jx-mermaid');
    expect(sanitizeRenderIdBase('   ')).toBe('jx-mermaid');
    expect(sanitizeRenderIdBase('中文')).toBe('jx-mermaid'); // fully illegal → the default
    expect(sanitizeRenderIdBase('My Flow! #2')).toBe('my-flow-2');

    const first = createRenderIdMinter('flow');
    const second = createRenderIdMinter('flow'); // SAME name, distinct instance
    expect(first.next()).toMatch(/^flow-\d+-0$/);
    expect(first.next()).not.toBe(first.next());
    expect(first.next()).not.toBe(second.next());
  });

  // ---- theme flips, pins, scoped roots ─────────────────────────────────

  it('a root .dark flip re-derives: the fingerprint changes and initialize re-runs with the dark palette', async () => {
    await renderDiagram('graph TD; F', { id: 'flip-1' });
    const before = mermaidMock.initialize.mock.calls.length;

    document.documentElement.classList.add('dark');
    try {
      await renderDiagram('graph TD; F', { id: 'flip-2' });
      expect(mermaidMock.initialize.mock.calls.length).toBe(before + 1);
      expect(lastPayload().themeVariables!.primaryColor).toBe(SAFE_HEX.primary.dark);
      expect(lastPayload().themeVariables!.background).toBe(SAFE_HEX.background.dark);
    } finally {
      document.documentElement.classList.remove('dark');
    }
  });

  it('explicit pins read the TARGET sheet both directions (light root + dark pin, dark root + light pin)', async () => {
    // light page + dark pin → the DARK oracle column
    await renderDiagram('graph TD; P', { id: 'pin-1', theme: 'dark' });
    expect(lastPayload().themeVariables!.primaryColor).toBe(SAFE_HEX.primary.dark);

    // dark page + light pin → the LIGHT column, read through the local wrapper
    document.documentElement.classList.add('dark');
    try {
      await renderDiagram('graph TD; P', { id: 'pin-2', theme: 'light' });
      expect(lastPayload().themeVariables!.primaryColor).toBe(SAFE_HEX.primary.light);
    } finally {
      document.documentElement.classList.remove('dark');
    }
  });

  it('reads explicit pins through a TEMPORARY local wrapper under the SAME root — removed after, global root untouched', () => {
    const root = document.createElement('div');
    document.body.append(root);
    const original = window.getComputedStyle.bind(window);
    // observable AT READ TIME (probes remove themselves; the wrapper too)
    const trace: { dark: boolean; light: boolean; inRoot: boolean }[] = [];
    const gcs = vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      const probe = element as Element;
      trace.push({
        dark: probe.closest('.dark') !== null,
        light: probe.closest('.jx-light') !== null,
        inRoot: root.contains(probe),
      });
      return original(probe);
    });
    const htmlClassesBefore = document.documentElement.className;

    trace.length = 0;
    readThemeTokens(root, 'dark');
    expect(trace.length).toBeGreaterThan(0);
    expect(trace.every((row) => row.dark && row.inRoot)).toBe(true); // the .dark wrapper carried the sheet, under the SAME root
    expect(root.querySelector('.dark')).toBeNull(); // the wrapper is GONE after the read

    trace.length = 0;
    readThemeTokens(root, 'light');
    expect(trace.every((row) => row.light && row.inRoot)).toBe(true); // the .jx-light wrapper ditto
    expect(root.querySelector('.jx-light')).toBeNull();

    expect(document.documentElement.className).toBe(htmlClassesBefore); // never a global mutation
    gcs.mockRestore();
    root.remove();
  });

  it('scoped theme roots resolve THEIR own tokens — two containers, two palettes, never the page root\u2019s', async () => {
    const rootA = document.createElement('div');
    const rootB = document.createElement('div');
    document.body.append(rootA, rootB);
    const gcs = vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (element) =>
        ({
          color: rootA.contains(element as Node) ? 'rgb(217, 69, 209)' : 'rgb(0, 66, 255)',
          fontFamily: '',
        }) as unknown as CSSStyleDeclaration,
    );
    try {
      await renderDiagram('graph TD; A', { id: 'scope-a', themeRoot: rootA });
      await renderDiagram('graph TD; B', { id: 'scope-b', themeRoot: rootB });
      const [paletteA, paletteB] = mermaidMock.initialize.mock.calls
        .slice(-2)
        .map((call) => call[0].themeVariables);
      expect(paletteA.primaryColor).toBe('#d945d1'); // rootA's scoped value
      expect(paletteB.primaryColor).toBe('#0042ff'); // rootB's OWN value
    } finally {
      gcs.mockRestore();
      rootA.remove();
      rootB.remove();
    }
  });

  // ---- SSR + error normalization ───────────────────────────────────────

  it('rejects SSR calls with a browser-only MermaidRenderError diagnostic (and documentless reads degrade to the safe floor)', async () => {
    vi.stubGlobal('document', undefined);
    try {
      await expect(renderDiagram('graph TD; S', { id: 'ssr-1' })).rejects.toSatisfy(
        (error: unknown) =>
          error instanceof MermaidRenderError && /browser-only/.test(error.diagnostic),
      );
      // the pure read stays usable without a document: the committed floor
      expect(readThemeTokens().primary).toBe(SAFE_HEX.primary.light);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('normalizes non-Error failures into MermaidRenderError diagnostics', async () => {
    mermaidMock.state.renderImpl = () => Promise.reject('string failure');
    try {
      await expect(renderDiagram('x', { id: 'norm-1' })).rejects.toSatisfy(
        (error: unknown) =>
          error instanceof MermaidRenderError && /string failure/.test(error.diagnostic),
      );
    } finally {
      mermaidMock.state.renderImpl = null;
    }
  });
});
