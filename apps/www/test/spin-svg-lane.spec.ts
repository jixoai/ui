/**
 * spin-ora-svg-lane www battery (V1, design §6, 2026-09-11).
 *
 * The measured-acceptance locks for the rewritten spin family:
 *   - frame-0 SSR markup — the bracket cursor is dead (pinned byte
 *     assertions: no [ or ] anywhere in the rendered region)
 *   - the spinner prop union — text catalog lane + svg artifact lane
 *     (owned root attrs, animate children present through the {@html}
 *     sink)
 *   - size resolution through SpinDefaults' open literal slot
 *   - reduced-motion paths (mocked matchMedia): the interval never
 *     starts / restarts on un-reduce (LIVE semantics, design §2) and
 *     the svg root freezes via pauseAnimations (design §3 channel one)
 *   - wrapping posture regression (scrim/aria-busy/pill law unchanged)
 *   - catalog snapshot — names count + verbatim frames spot-checked
 *     against the cli-spinners devDep corpus data (design §1)
 *
 * jsdom gaps (probed: both undefined): window.matchMedia and the SMIL
 * SVGSVGElement#pauseAnimations/unpauseAnimations pair — the component
 * guards matchMedia the house way (motion-on default), the tests stub
 * whichever surface the case needs.
 */
import { render } from '@testing-library/svelte';
import { createRawSnippet, flushSync } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Spin from '../src/lib/ui/spin/spin.svelte';
import { SPINNER_CATALOG } from '../src/lib/ui/spin/spin-catalog';
import { getSpin } from '../src/lib/spin-set.gen';
import cliSpinnersJson from 'cli-spinners/spinners.json';

// the corpus data arrives as an untyped JSON module — the boundary
// cast of the snapshot lane (cli-spinners ships no json types)
const cliSpinners = cliSpinnersJson as Record<string, { frames: string[]; interval: number }>;

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete (SVGSVGElement.prototype as Partial<Record<'pauseAnimations' | 'unpauseAnimations', unknown>>)
    .pauseAnimations;
  delete (SVGSVGElement.prototype as Partial<Record<'pauseAnimations' | 'unpauseAnimations', unknown>>)
    .unpauseAnimations;
});

/** controllable matchMedia stub — fire() flips `matches` and delivers
 *  the change event to every subscriber (the LIVE-semantics probe) */
function stubMatchMedia(initial: boolean) {
  const listeners = new Set<(event: { matches: boolean }) => void>();
  const mql = {
    matches: initial,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => {
      listeners.delete(listener);
    },
  };
  const factory = vi.fn(() => mql);
  vi.stubGlobal('matchMedia', factory);
  return { mql, factory, fire: (matches: boolean) => {
    mql.matches = matches;
    for (const listener of listeners) listener({ matches });
  } };
}

/** jsdom ships no SMIL clock control — stub both prototype methods */
function stubSmilClock() {
  const pause = vi.fn();
  const unpause = vi.fn();
  Object.defineProperty(SVGSVGElement.prototype, 'pauseAnimations', {
    value: pause,
    configurable: true,
  });
  Object.defineProperty(SVGSVGElement.prototype, 'unpauseAnimations', {
    value: unpause,
    configurable: true,
  });
  return { pause, unpause };
}

// ---------------------------------------------------------------------------
// text posture — frame 0, no brackets (design §1/§2)
// ---------------------------------------------------------------------------
describe('spin — text posture', () => {
  it('renders frame 0 of the dots default with no bracket cursor anywhere', () => {
    const { container } = render(Spin);
    const cursor = container.querySelector('[data-jx-spin-cursor]')!;
    // the cursor is a one-cell grid (ghosts + the live frame) — the frame
    // span is the glyph; whitespace-pre keeps markup noise out of the box
    expect(cursor.querySelector('[data-jx-spin-frame]')!.textContent).toBe('⠋');
    expect(cursor.className).toContain('whitespace-pre');
    // the wrapping decoration this change kills (Owner ruling #1) —
    // pinned on the whole rendered region, nbsp included
    expect(container.textContent).not.toContain('[');
    expect(container.textContent).not.toContain(']');
    expect(container.innerHTML).not.toContain('&nbsp;');
    // the status wrapper law survives the rewrite
    const status = container.querySelector('[data-jx-spin-inline]')!;
    expect(status.getAttribute('role')).toBe('status');
    expect(status.getAttribute('aria-label')).toBe('loading');
  });

  it('spinner="line" renders the line corpus frame 0 (the retired /—\\| cycle)', () => {
    const { container } = render(Spin, { props: { spinner: 'line' } });
    expect(container.querySelector('[data-jx-spin-frame]')!.textContent).toBe('-');
  });

  it('the frame engine cycles at the catalog interval (dots 80ms)', async () => {
    vi.useFakeTimers();
    stubMatchMedia(false);
    const { container } = render(Spin);
    flushSync();
    await vi.advanceTimersByTimeAsync(160); // two ticks: ⠋ → ⠙ → ⠹
    flushSync();
    expect(container.querySelector('[data-jx-spin-frame]')!.textContent).toBe('⠹');
  });
});

// ---------------------------------------------------------------------------
// svg posture — the artifact lane (design §3)
// ---------------------------------------------------------------------------
describe('spin — svg posture', () => {
  it('spinner="blocks-wave": owned root attrs + the SMIL payload through {@html}', () => {
    const { container } = render(Spin, { props: { spinner: 'blocks-wave' } });
    const svg = container.querySelector('svg[data-jx-spin-svg]')!;
    expect(svg.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('fill')).toBe('currentColor'); // fill nature
    expect(svg.getAttribute('stroke')).toBe('none');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    // the payload: NINE rects, each carrying its four animate elements
    expect(svg.querySelectorAll('rect').length).toBe(9);
    expect(svg.querySelectorAll('rect > animate').length).toBe(36);
    expect(svg.innerHTML).toContain('spinner_oJFS');
    // the glyph sits inside the status wrapper; the text cursor is gone
    expect(svg.closest('[role="status"]')!.getAttribute('aria-label')).toBe('loading');
    expect(container.querySelector('[data-jx-spin-cursor]')).toBeNull();
  });

  it('size resolves through SpinDefaults: ABSENT rides the density ruler var; explicit values pin attributes (review R1)', () => {
    const explicit = render(Spin, { props: { spinner: 'blocks-wave', size: 24 } });
    const svg = explicit.container.querySelector('svg[data-jx-spin-svg]')!;
    expect(svg.getAttribute('width')).toBe('24px'); // numeric sizes px-coerce (the icon law)
    expect(svg.getAttribute('height')).toBe('24px');
    expect(svg.getAttribute('style')).toBeNull();
    const str = render(Spin, { props: { spinner: 'blocks-wave', size: '2em' } });
    expect(str.container.querySelector('svg[data-jx-spin-svg]')!.getAttribute('width')).toBe('2em');
    // ABSENT: no width/height attributes — presentation attributes cannot
    // carry var(), so the ruler rides a CSS style instead
    const absent = render(Spin, { props: { spinner: 'blocks-wave' } });
    const absentSvg = absent.container.querySelector('svg[data-jx-spin-svg]')!;
    expect(absentSvg.getAttribute('width')).toBeNull();
    expect(absentSvg.getAttribute('height')).toBeNull();
    expect(absentSvg.getAttribute('style')!.replace(/;$/, '')).toBe('width: var(--jx-icon); height: var(--jx-icon)');
    // the text posture paints the ruler's text size (review R1)
    const text = render(Spin);
    expect(text.container.querySelector('[data-jx-spin-cursor]')!.className).toContain('var(--jx-text)');
  });

  it('reduced motion: the SMIL clock freezes via pauseAnimations (channel one, design §3)', () => {
    stubMatchMedia(true);
    const { pause, unpause } = stubSmilClock();
    render(Spin, { props: { spinner: 'blocks-wave' } });
    flushSync();
    expect(pause).toHaveBeenCalledTimes(1);
    expect(unpause).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// reduced motion — the LIVE frame-engine semantics (design §2)
// ---------------------------------------------------------------------------
describe('spin — reduced motion', () => {
  it('the interval never starts under reduce (fake timers advance, frame stays 0)', async () => {
    vi.useFakeTimers();
    const { factory } = stubMatchMedia(true);
    const { container } = render(Spin);
    flushSync();
    expect(factory).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    await vi.advanceTimersByTimeAsync(10_000);
    flushSync();
    expect(container.querySelector('[data-jx-spin-frame]')!.textContent).toBe('⠋');
  });

  it('LIVE semantics: change events tear down and restart the engine mid-flight', async () => {
    vi.useFakeTimers();
    const { fire } = stubMatchMedia(false);
    const { container } = render(Spin);
    flushSync();
    await vi.advanceTimersByTimeAsync(160);
    flushSync();
    expect(container.querySelector('[data-jx-spin-frame]')!.textContent).toBe('⠹');
    // reduce mid-animation: interval cleared, frame rests on 0
    fire(true);
    flushSync();
    expect(container.querySelector('[data-jx-spin-frame]')!.textContent).toBe('⠋');
    await vi.advanceTimersByTimeAsync(10_000);
    expect(container.querySelector('[data-jx-spin-frame]')!.textContent).toBe('⠋');
    // un-reduce: the engine restarts (one 80ms tick → frame 1)
    fire(false);
    await vi.advanceTimersByTimeAsync(80);
    flushSync();
    expect(container.querySelector('[data-jx-spin-frame]')!.textContent).toBe('⠙');
  });
});

// ---------------------------------------------------------------------------
// unknown names — the dev-warn lane (design §4)
// ---------------------------------------------------------------------------
describe('spin — unknown spinner names', () => {
  it('renders dots frame 0 and warns once per name per session', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const first = render(Spin, { props: { spinner: 'no-such-spinner' as never } });
    flushSync();
    expect(first.container.querySelector('[data-jx-spin-frame]')!.textContent).toBe('⠋');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no-such-spinner'));
    // repeated mounts of the same name stay silent (warnedNames dedup)
    render(Spin, { props: { spinner: 'no-such-spinner' as never } });
    flushSync();
    expect(warn).toHaveBeenCalledTimes(1);
    // a different unknown name warns again — the region never blanks
    render(Spin, { props: { spinner: 'also-not-real' as never } });
    flushSync();
    expect(warn).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// the two timings — interval override + the linger trail (review R6/R7
// + round 2: ghost renamed linger, type number | 'auto')
// ---------------------------------------------------------------------------
describe('spin — the two timings', () => {
  it('interval overrides the catalog step (dots re-timed to 200ms; 0 and undefined mean absent)', async () => {
    vi.useFakeTimers();
    stubMatchMedia(false);
    const { container } = render(Spin, { props: { interval: 200 } });
    flushSync();
    await vi.advanceTimersByTimeAsync(199);
    flushSync();
    // 199ms < one 200ms step: still frame 0
    expect(container.querySelector('[data-jx-spin-frame]')!.textContent).toBe('⠋');
    await vi.advanceTimersByTimeAsync(1);
    flushSync();
    expect(container.querySelector('[data-jx-spin-frame]')!.textContent).toBe('⠙');
  });

  it('interval=0 falls back to the catalog value (the playground 0 convention)', async () => {
    vi.useFakeTimers();
    stubMatchMedia(false);
    const { container } = render(Spin, { props: { interval: 0 } });
    flushSync();
    await vi.advanceTimersByTimeAsync(80); // dots catalog step
    flushSync();
    expect(container.querySelector('[data-jx-spin-frame]')!.textContent).toBe('⠙');
  });

  it('linger spawns one entry per retired frame at the steady state and sets the CSS var', async () => {
    vi.useFakeTimers();
    stubMatchMedia(false);
    const { container } = render(Spin, { props: { linger: 240 } });
    const cursor = container.querySelector('[data-jx-spin-cursor]')!;
    expect(cursor.getAttribute('style')).toBe('--jx-linger-ms: 240ms;'); // jsdom appends the trailing ;
    flushSync();
    await vi.advanceTimersByTimeAsync(240); // ticks at 80/160/240 → three lingered entries (each lives 240ms past its spawn)
    flushSync();
    const lingers = [...cursor.querySelectorAll('[data-jx-spin-linger]')];
    expect(lingers.length).toBe(3); // the trail's steady state = linger / interval = 240/80
    // the linger utility carries the linear fade over the var
    expect(lingers[0]!.className).toContain('animate-[jx-spin-linger_var(--jx-linger-ms)_linear_forwards]');
    expect(lingers[0]!.className).toContain('[grid-area:1/1]');
    // teardown clears everything (reduce fires below); the per-entry expiry
    // is covered by the reduce-clears test + the real-browser walkthrough
  });

  it("linger 'auto' (the default) = (frames − 1) × interval / 2 — half the cycle lingers (review round 3)", async () => {
    vi.useFakeTimers();
    stubMatchMedia(false);
    const { container } = render(Spin); // no linger prop — 'auto' default
    const cursor = container.querySelector('[data-jx-spin-cursor]')!;
    // dots carries 10 frames: (10 − 1) × 80 / 2 = 360ms
    expect(cursor.getAttribute('style')).toBe('--jx-linger-ms: 360ms;');
    flushSync();
    await vi.advanceTimersByTimeAsync(80 * 10); // ten ticks: spawns at 80..800
    flushSync();
    // alive = spawns in (T−360, T] = (440, 800] → 480,560,640,720,800 = 5
    expect(cursor.querySelectorAll('[data-jx-spin-linger]').length).toBe(5);
  });

  it('linger 0 hides at the handoff — no residue entries ever', async () => {
    vi.useFakeTimers();
    stubMatchMedia(false);
    const { container } = render(Spin, { props: { linger: 0 } });
    const cursor = container.querySelector('[data-jx-spin-cursor]')!;
    expect(cursor.getAttribute('style')).toBeNull();
    flushSync();
    await vi.advanceTimersByTimeAsync(800);
    flushSync();
    expect(cursor.querySelectorAll('[data-jx-spin-linger]').length).toBe(0);
  });

  it('lingered frames never spawn under reduce and clear on the change (review R6)', async () => {
    vi.useFakeTimers();
    const { fire } = stubMatchMedia(false);
    const { container } = render(Spin, { props: { linger: 400 } });
    const cursor = container.querySelector('[data-jx-spin-cursor]')!;
    flushSync();
    await vi.advanceTimersByTimeAsync(160);
    flushSync();
    expect(cursor.querySelectorAll('[data-jx-spin-linger]').length).toBeGreaterThan(0);
    fire(true); // reduce mid-flight
    flushSync();
    expect(cursor.querySelectorAll('[data-jx-spin-linger]').length).toBe(0);
  });

  it('the svg posture spawns no lingered frames (the trail is text-only)', async () => {
    vi.useFakeTimers();
    stubMatchMedia(false);
    stubSmilClock(); // jsdom ships no SMIL methods — the effect calls unpause
    const { container } = render(Spin, { props: { spinner: 'blocks-wave', linger: 400 } });
    flushSync();
    await vi.advanceTimersByTimeAsync(500);
    expect(container.querySelector('[data-jx-spin-linger]')).toBeNull();
  });

  it('the ghost trail never moves layout: cursor width holds across frames (simpleDots, review R3/R4)', async () => {
    vi.useFakeTimers();
    stubMatchMedia(false);
    const { container } = render(Spin, { props: { spinner: 'simpleDots' } });
    const cursor = container.querySelector('[data-jx-spin-cursor]')!;
    for (let i = 0; i < 8; i++) {
      await vi.advanceTimersByTimeAsync(100); // corpus step is 400ms; probes land mid-frame
      flushSync();
      // the box-stability invariants: pre whitespace + every child pinned
      // to the ONE grid cell (the live-browser probe pinned the constant
      // 23.41px advance width across the blank '   ' frame)
      expect(cursor.className).toContain('whitespace-pre');
      expect(cursor.className).toContain('inline-grid');
      for (const child of [...cursor.children]) {
        expect((child as HTMLElement).className).toContain('[grid-area:1/1]');
      }
    }
  });
});

// ---------------------------------------------------------------------------
// wrapping posture — the unchanged container law
// ---------------------------------------------------------------------------
describe('spin — wrapping posture regression', () => {
  it('children snippet: aria-busy grid host, z-[1] status pill, scrim over the content', () => {
    const children = createRawSnippet(() => ({
      render: () => '<b data-testid="spin-wrapped">payload</b>',
    }));
    const { container } = render(Spin, { props: { label: 'syncing', children } });
    const wrap = container.querySelector('[data-jx-spin-wrap]')!;
    expect(wrap.getAttribute('aria-busy')).toBe('true');
    expect(wrap.className).toContain('grid');
    const pill = container.querySelector('[data-jx-spin-live]')!;
    expect(pill.getAttribute('role')).toBe('status');
    expect(pill.getAttribute('aria-label')).toBe('syncing');
    expect(pill.querySelector('[data-jx-spin-frame]')!.textContent).toBe('⠋');
    expect(container.querySelector('[data-jx-spin-scrim]')).toBeTruthy();
    expect(container.querySelector('[data-testid="spin-wrapped"]')).toBeTruthy();
    expect(container.querySelector('[data-jx-spin-inline]')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// catalog + artifact snapshots (design §1 — verbatim corpus law)
// ---------------------------------------------------------------------------
describe('spin catalog snapshot', () => {
  it('carries exactly the 60 curated names; bouncingBar is excluded by name', () => {
    expect(Object.keys(SPINNER_CATALOG).length).toBe(60);
    expect(Object.hasOwn(SPINNER_CATALOG, 'bouncingBar')).toBe(false);
    // the exclusion is ours, not the corpus's absence
    expect(Object.hasOwn(cliSpinners, 'bouncingBar')).toBe(true);
  });

  it('frames and intervals ride VERBATIM from cli-spinners@2.9.2 (spot checks)', () => {
    for (const name of ['dots', 'line', 'simpleDots', 'star', 'pong', 'aesthetic']) {
      expect(SPINNER_CATALOG[name as keyof typeof SPINNER_CATALOG].frames)
        .toEqual(cliSpinners[name]!.frames);
      expect(SPINNER_CATALOG[name as keyof typeof SPINNER_CATALOG].interval)
        .toBe(cliSpinners[name]!.interval);
    }
    // pinned bytes the JSON round-trip could silently mangle: trailing
    // spaces inside simpleDots frames, the em-dash family in line2
    expect(SPINNER_CATALOG.simpleDots.frames).toEqual(['.  ', '.. ', '...', '   ']);
    expect(SPINNER_CATALOG.line.interval).toBe(130);
    expect(SPINNER_CATALOG.dots.interval).toBe(80);
  });
});

describe('spin-set artifact snapshot', () => {
  it("getSpin('blocks-wave'): syncbase id + nine rects in the payload", () => {
    const data = getSpin('blocks-wave');
    expect(data).not.toBeNull();
    expect(data!.v).toBe('0 0 24 24');
    expect(data!.n).toBe('fill');
    expect(data!.d).toContain('spinner_oJFS');
    expect(data!.d.match(/<rect /g)?.length).toBe(9);
    expect(data!.d.match(/<animate /g)?.length).toBe(36);
  });

  it("artifact-first resolution: text names miss the artifact lane (getSpin → null)", () => {
    expect(getSpin('dots')).toBeNull();
    expect(getSpin('line')).toBeNull();
  });

  it('the loader-pack picks ride the artifact (review R2 dogfood)', () => {
    for (const name of ['3-dots-bounce', 'bars-scale', 'clock', 'tail-spin', 'spinning-circles']) {
      const data = getSpin(name as Parameters<typeof getSpin>[0]);
      expect(data, name).not.toBeNull();
      expect(data!.v.length).toBeGreaterThan(0);
      expect(data!.d.length).toBeGreaterThan(0);
    }
  });
});
