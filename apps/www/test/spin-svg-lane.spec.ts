/**
 * spin-ora-svg-lane www battery (V1, design §6, 2026-09-11; the CSS
 * flat-engine rewrite, review round 4, 2026-09-12).
 *
 * The measured-acceptance locks for the rewritten spin family:
 *   - the FLAT CSS ENGINE: every frame rendered once as its own cell
 *     span, phased by a NEGATIVE per-frame delay; one injected
 *     keyframes rule per parameter set; NO JS clock (the timing tests
 *     assert the animation parameters, not timer-driven DOM churn)
 *   - frame-0 static face — the bracket cursor is dead (pinned byte
 *     assertions: no [ or ] anywhere in the rendered region)
 *   - the spinner prop union — text catalog lane + svg artifact lane
 *     (owned root attrs, animate children present through the {@html}
 *     sink)
 *   - size resolution through SpinDefaults' absent slot (the density
 *     ruler var vs pinned attributes)
 *   - the svg posture's reduced-motion path (mocked matchMedia +
 *     pauseAnimations stub — the TEXT lane's kill is static CSS)
 *   - wrapping posture regression (scrim/aria-busy/pill law unchanged)
 *   - catalog snapshot — names count + verbatim frames spot-checked
 *     against the cli-spinners devDep corpus data + the HAND-TUNED
 *     timing pairs (the Owner's five pinned)
 *
 * jsdom gaps (probed): window.matchMedia and the SMIL
 * SVGSVGElement#pauseAnimations/unpauseAnimations pair are undefined —
 * the component guards matchMedia the house way (motion-on default),
 * the tests stub whichever surface the case needs. jsdom does not
 * RUN animations — the engine is asserted through its parameters and
 * the injected <style> content; real motion is the browser
 * walkthrough's evidence.
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
  it('renders EVERY frame flat — no bracket cursor anywhere (the CSS engine, review round 4)', () => {
    const { container } = render(Spin);
    const cursor = container.querySelector('[data-jx-spin-cursor]')!;
    // ALL ten dots frames rendered ONCE, in DOM order, each in its own
    // cell span — no JS adds or removes elements ever again
    const frames = [...cursor.querySelectorAll('[data-jx-spin-frame]')];
    expect(frames.length).toBe(SPINNER_CATALOG.dots.frames.length);
    expect(frames.map((f) => f.textContent)).toEqual([...SPINNER_CATALOG.dots.frames]);
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

  it('every frame carries the animation params: shared keyframes name, cycle duration, negative phase delay', () => {
    const { container } = render(Spin); // dots: 10 frames × 80ms = 800ms cycle
    const frames = [...container.querySelectorAll('[data-jx-spin-frame]')];
    const readVar = (el: Element, name: string): string | undefined =>
      (el.getAttribute('style') ?? '').match(new RegExp(`--${name}: ([^;]+)`))?.[1];
    for (const [i, f] of frames.entries()) {
      expect(readVar(f, 'kf')).toBe('jx-spin-f10-i80-l160-end'); // frames × interval × linger × type
      expect(readVar(f, 'dur')).toBe('800ms'); // 10 × 80
      // frame i's slot starts at i×80 → the negative delay phases it in
      expect(readVar(f, 'd')).toBe(`${-((SPINNER_CATALOG.dots.frames.length - i) * 80)}ms`);
    }
    // the shared keyframes rule IS injected (one style tag, idempotent)
    const style = document.head.querySelector('style[data-jx-spin-frames]');
    expect(style?.textContent).toContain('@keyframes jx-spin-f10-i80-l160-end');
    // the slot shape: duty 10% hold, fade landing at (80+160)/800 = 30%
    expect(style?.textContent).toContain('0%{opacity:1}10%{opacity:1}30%{opacity:0}100%{opacity:0}');
  });

  it('explicit interval/linger change the parameter set — a second keyframes rule joins the sheet', () => {
    const first = render(Spin);
    expect(document.head.querySelector('style[data-jx-spin-frames]')?.textContent).toContain('jx-spin-f10-i80-l160-end');
    first.unmount();
    const { container } = render(Spin, { props: { interval: 100, linger: 0 } });
    const style = document.head.querySelector('style[data-jx-spin-frames]')!;
    expect(style.textContent).toContain('jx-spin-f10-i100-l0-end');
    // linger 0 → the DISCRETE hide: steps(1,start) on the duty stop
    // (two stops at the same percentage would MERGE — the silent
    // whole-window-fade bug the Owner caught in review round 5)
    expect(style.textContent).toContain('@keyframes jx-spin-f10-i100-l0-end{0%{opacity:1}10%{opacity:1;animation-timing-function:steps(1,start)}100%{opacity:0}}');
    const frames = [...container.querySelectorAll('[data-jx-spin-frame]')];
    expect((frames[1]!.getAttribute('style') ?? '')).toContain('--dur: 1000ms'); // 10 × 100
  });

  it('lingerType shapes the keyframes: start fades in discretely-out, both breathes (round 5)', () => {
    const start = render(Spin, { props: { spinner: 'simpleDots' } }); // 160/160 'start', 4 frames
    expect(
      (start.container.querySelector('[data-jx-spin-frame]')!.getAttribute('style') ?? '').match(/--kf: ([^;]+)/)?.[1],
    ).toBe('jx-spin-f4-i160-l160-start');
    start.unmount();
    const both = render(Spin, { props: { spinner: 'arc' } }); // 120/120 'both', 6 frames + font math
    expect(
      (both.container.querySelector('[data-jx-spin-frame]')!.getAttribute('style') ?? '').match(/--kf: ([^;]+)/)?.[1],
    ).toBe('jx-spin-f6-i120-l120-both');
    // arc's cursor rides the math font hint
    expect(both.container.querySelector('[data-jx-spin-cursor]')!.getAttribute('style')).toBe('font-family: math;'); // jsdom appends the trailing ;
    const sheet = document.head.querySelector('style[data-jx-spin-frames]')!.textContent!;
    // start: fade-in to 1 by 160/640=25%, hold, steps-out at duty 25%… simpleDots duty = 160/640 = 25%
    expect(sheet).toContain('@keyframes jx-spin-f4-i160-l160-start{0%{opacity:0}25%{opacity:1}25%{opacity:1;animation-timing-function:steps(1,start)}100%{opacity:0}}');
    // both: fade-in 0→1 by 120/720≈16.667%, hold, fade-out by 240/720≈33.333%
    expect(sheet).toContain('@keyframes jx-spin-f6-i120-l120-both{0%{opacity:0}16.667%{opacity:1}16.667%{opacity:1}33.333%{opacity:0}100%{opacity:0}}');
  });

  it("spinner='line' renders the line corpus flat (the retired /—\\| cycle, tuned 160/0)", () => {
    const { container } = render(Spin, { props: { spinner: 'line' } });
    const frames = [...container.querySelectorAll('[data-jx-spin-frame]')];
    expect(frames.map((f) => f.textContent)).toEqual(['-', '\\', '|', '/']);
    expect((frames[0]!.getAttribute('style') ?? '')).toContain('--dur: 640ms'); // 4 × 160
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
// the timing pairs — hand-tuned catalog + explicit overrides (round 4)
// ---------------------------------------------------------------------------
describe('spin — the timing pairs', () => {
  it("the Owner's tuned pairs ride the catalog verbatim (rounds 4-5)", () => {
    const pairs: [keyof typeof SPINNER_CATALOG, number, number, 'end' | 'start' | 'both' | undefined][] = [
      ['dots', 80, 160, undefined],
      ['dots2', 120, 0, undefined],
      ['pipe', 120, 120, undefined],
      ['line', 160, 0, undefined],
      ['simpleDots', 160, 160, 'start'],
      // round-5 retunes
      ['arrow', 120, 0, undefined],
      ['bounce', 160, 20, undefined],
      ['star', 160, 80, undefined],
      ['toggle3', 1000, 500, 'both'],
      ['growVertical', 120, 120, 'both'],
      ['arc', 120, 120, 'both'],
    ];
    for (const [name, interval, linger, lingerType] of pairs) {
      expect(SPINNER_CATALOG[name].interval, `${name} interval`).toBe(interval);
      expect(SPINNER_CATALOG[name].linger, `${name} linger`).toBe(linger);
      expect(SPINNER_CATALOG[name].lingerType, `${name} lingerType`).toBe(lingerType);
    }
    // arc rides font-family: math (round 5: its six glyphs only sit a
    // true circle in math fonts)
    expect(SPINNER_CATALOG.arc.font).toBe('math');
  });

  it("every catalog entry carries a tuning pair (the build's TUNINGS law)", () => {
    for (const [name, entry] of Object.entries(SPINNER_CATALOG)) {
      expect(Number.isFinite(entry.interval), `${name} interval`).toBe(true);
      expect(Number.isFinite(entry.linger), `${name} linger`).toBe(true);
      expect(entry.interval, `${name} interval > 0`).toBeGreaterThan(0);
      expect(entry.linger, `${name} linger >= 0`).toBeGreaterThanOrEqual(0);
    }
  });

  it("'auto' (the default) resolves the tuned pair; explicit numbers override", () => {
    const auto = render(Spin, { props: { spinner: 'dots' } });
    expect((auto.container.querySelector('[data-jx-spin-frame]')!.getAttribute('style') ?? '')).toContain(
      'jx-spin-f10-i80-l160-end',
    );
    auto.unmount();
    const custom = render(Spin, { props: { spinner: 'dots', interval: 120, linger: 60 } });
    expect((custom.container.querySelector('[data-jx-spin-frame]')!.getAttribute('style') ?? '')).toContain(
      'jx-spin-f10-i120-l60-end',
    );
  });
});

// ---------------------------------------------------------------------------
// reduced motion — the svg lane's LIVE SMIL freeze (the text lane's kill
// is the static media rule in spin.css, browser-walkthrough evidence)
// ---------------------------------------------------------------------------
describe('spin — reduced motion', () => {
  it('the SMIL clock freezes via pauseAnimations (channel one, design §3)', () => {
    stubMatchMedia(true);
    const { pause, unpause } = stubSmilClock();
    render(Spin, { props: { spinner: 'blocks-wave' } });
    flushSync();
    expect(pause).toHaveBeenCalledTimes(1);
    expect(unpause).not.toHaveBeenCalled();
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
  it('carries exactly the 59 curated names; bouncingBar and circle are excluded by name', () => {
    expect(Object.keys(SPINNER_CATALOG).length).toBe(59);
    expect(Object.hasOwn(SPINNER_CATALOG, 'bouncingBar')).toBe(false);
    // circle: the Owner removal (round 5) — the corpus still carries it
    expect(Object.hasOwn(SPINNER_CATALOG, 'circle')).toBe(false);
    expect(Object.hasOwn(cliSpinners, 'circle')).toBe(true);
    // the exclusions are ours, not the corpus's absence
    expect(Object.hasOwn(cliSpinners, 'bouncingBar')).toBe(true);
  });

  it('frames ride VERBATIM from cli-spinners@2.9.2; timings are the HAND-TUNED pairs (round 4)', () => {
    for (const name of ['dots', 'line', 'star', 'pong', 'aesthetic']) {
      expect(SPINNER_CATALOG[name as keyof typeof SPINNER_CATALOG].frames)
        .toEqual(cliSpinners[name]!.frames);
    }
    // simpleDots' frames are the ROUND-5 · override — verbatim EXCEPT the glyph
    // pinned bytes the JSON round-trip could silently mangle: trailing
    // spaces inside simpleDots frames
    // the ROUND-5 Owner glyph override: · instead of . (trailing spaces intact)
    expect(SPINNER_CATALOG.simpleDots.frames).toEqual(['\u00b7  ', '\u00b7\u00b7 ', '\u00b7\u00b7\u00b7', '   ']);
    // the tuning pairs deliberately diverge from the corpus intervals
    // (dots keeps 80; line tunes 130→160, simpleDots 400→160)
    expect(SPINNER_CATALOG.dots.interval).toBe(80);
    expect(SPINNER_CATALOG.line.interval).toBe(160);
    expect(SPINNER_CATALOG.simpleDots.interval).toBe(160);
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
