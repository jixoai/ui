/**
 * Timeline value contract + STOPS progress math lock
 * (test/timeline-value.spec.ts, W3 reui-progress upgrade, Owner
 * 2026-09-15).
 *
 * Batteries (tasks 3.4):
 *
 *   1. THE VALUE CONTRACT — reui semantics, Svelte-shaped:
 *      defaultValue seeds, decimal-first-class thresholds, controlled
 *      override read-side, setStep drives + fires onValueChange.
 *   2. ATTRIBUTE PAINT — data-completed beside data-jx-tl-pending
 *      (pending WINS, the louder channel — DOM + css source order),
 *      data-step painted only when declared.
 *   3. STEP CONSTRAINTS — the duplicate drop + dev warn.
 *   4. THE STOPS MATH — timelineProgressLength over the frozen
 *      protocol (default ladder · declared gap · duplicate-first
 *      owner mapping) + measureTimelineSpine building the deduped
 *      milestone table from data-step, and the POLYLINE-vs-CHORD
 *      fixture (pathLength is the polyline sum; the chord runLength
 *      retires from the dasharray consumers).
 *   5. THE CSS CONTRACT — the value-stroke display + 300ms
 *      dashoffset transition, reduced-motion scoping (scroll keeps
 *      the hide, the value stroke keeps its position, drops the
 *      transition).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fireEvent, render, waitFor, within } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import TimelineValueHost from './fixtures/timeline-value-host.svelte';
import {
  measureTimelineSpine,
  timelineProgressLength,
  type TimelineSpineStop,
} from '../src/lib/ui/timeline/timeline-spine.svelte';

const specDir = resolve(fileURLToPath(import.meta.url), '..');

/** the rendered items' data-completed flags, in DOM order */
function completedFlags(container: HTMLElement): string[] {
  return [...container.querySelectorAll('[data-jx-tl-item]')].map((li) =>
    li.hasAttribute('data-completed') ? '1' : '0',
  );
}

// ---------------------------------------------------------------------------
// 1 · the value contract (reui parity)
// ---------------------------------------------------------------------------
describe('timeline value contract — reui semantics', () => {
  it('defaultValue seeds the uncontrolled current step (default 1)', async () => {
    const { container } = render(TimelineValueHost);
    await waitFor(() => expect(completedFlags(container)).toEqual(['1', '0', '0']));
  });

  it('decimals are first-class: defaultValue 1.5 completes item 1, NOT item 2', async () => {
    const { container } = render(TimelineValueHost, { props: { defaultValue: 1.5 } });
    await waitFor(() => expect(completedFlags(container)).toEqual(['1', '0', '0']));
  });

  it('uncontrolled setStep moves the paint and fires onValueChange (every change)', async () => {
    const onValueChange = vi.fn();
    const { container, getByTestId } = render(TimelineValueHost, { props: { onValueChange } });
    await waitFor(() => expect(completedFlags(container)).toEqual(['1', '0', '0']));

    await fireEvent.click(getByTestId('tl-set-15'));
    await waitFor(() => expect(completedFlags(container)).toEqual(['1', '0', '0']));
    expect(getByTestId('tl-driver').getAttribute('data-current')).toBe('1.5');
    // 1.5 → item 1 (step 1 ≤ 1.5) on, item 2 (step 2 > 1.5) off — the
    // threshold pair the spec freezes
    expect(onValueChange).toHaveBeenCalledWith(1.5);

    await fireEvent.click(getByTestId('tl-set-3'));
    await waitFor(() => expect(completedFlags(container)).toEqual(['1', '1', '1']));
    expect(onValueChange).toHaveBeenCalledWith(3);

    // reui's exact semantics: setActiveStep ALWAYS reports (same-value
    // repeats included — the consumer decides what changed)
    const calls = onValueChange.mock.calls.length;
    await fireEvent.click(getByTestId('tl-set-3'));
    expect(onValueChange.mock.calls.length).toBeGreaterThan(calls);
  });

  it('controlled value overrides read-side: setStep reports, the DOM follows value only', async () => {
    const onValueChange = vi.fn();
    const { container, getByTestId } = render(TimelineValueHost, {
      props: { value: 2, onValueChange },
    });
    await waitFor(() => expect(completedFlags(container)).toEqual(['1', '1', '0']));

    await fireEvent.click(getByTestId('tl-set-15'));
    expect(onValueChange).toHaveBeenCalledWith(1.5);
    // the controlled prop still owns the read side
    expect(getByTestId('tl-driver').getAttribute('data-current')).toBe('2');
    expect(completedFlags(container)).toEqual(['1', '1', '0']);
  });

  it('the last step completes everything; a sub-first decimal completes nothing', async () => {
    const { container, getByTestId } = render(TimelineValueHost, { props: { defaultValue: 3 } });
    await waitFor(() => expect(completedFlags(container)).toEqual(['1', '1', '1']));

    await fireEvent.click(getByTestId('tl-set-1'));
    await waitFor(() => expect(completedFlags(container)).toEqual(['1', '0', '0']));
  });
});

// ---------------------------------------------------------------------------
// 2 · attribute paint (data-completed · pending · data-step)
// ---------------------------------------------------------------------------
describe('timeline value contract — attribute paint', () => {
  it('pending WINS over completed: the louder channel keeps both DOM flags + the css order', async () => {
    const css = readFileSync(resolve(specDir, '../src/lib/ui/timeline/timeline.css'), 'utf8');
    const { container } = render(TimelineValueHost, {
      props: { value: 3, pendingIndex: 1 },
    });
    await waitFor(() => expect(completedFlags(container)).toEqual(['1', '1', '1']));

    const items = [...container.querySelectorAll('[data-jx-tl-item]')];
    // the pending item carries BOTH channels — orthogonal paint
    expect(items[1]!.hasAttribute('data-jx-tl-pending')).toBe(true);
    expect(items[1]!.hasAttribute('data-completed')).toBe(true);

    // css source order: the pending paint follows the completed paint
    // for BOTH the dot (direct child) and the title (descendant)
    const dotCompleted = css.indexOf("[data-completed]) > :where([data-jx-tl-dot])");
    const dotPending = css.indexOf("[data-jx-tl-pending]) > :where([data-jx-tl-dot])");
    expect(dotCompleted).toBeGreaterThan(-1);
    expect(dotPending).toBeGreaterThan(dotCompleted);
    const titleCompleted = css.indexOf("[data-completed]) :where([data-jx-tl-title])");
    const titlePending = css.indexOf("[data-jx-tl-pending]) :where([data-jx-tl-title])");
    expect(titlePending).toBeGreaterThan(titleCompleted);
  });

  it('data-step paints ONLY when declared (the default ladder never stamps it)', async () => {
    const { container } = render(TimelineValueHost, {
      props: { steps: [2, undefined, 5] },
    });
    await waitFor(() =>
      expect(completedFlags(container)).toEqual(['0', '0', '0']),
    );
    const items = [...container.querySelectorAll('[data-jx-tl-item]')];
    expect(items[0]!.getAttribute('data-step')).toBe('2');
    expect(items[1]!.getAttribute('data-step')).toBeNull();
    expect(items[2]!.getAttribute('data-step')).toBe('5');
    // default ladder: item 2's resolved step is DOM order + 1 = 2 →
    // the declared 2 on item 1 completes it at the same value
    const second = render(TimelineValueHost, {
      props: { defaultValue: 2, steps: [2, undefined, 5] },
    });
    await waitFor(() => expect(completedFlags(second.container)).toEqual(['1', '1', '0']));
    await fireEvent.click(within(second.container).getByTestId('tl-set-3'));
    await waitFor(() => expect(completedFlags(second.container)).toEqual(['1', '1', '0']));
  });
});

// ---------------------------------------------------------------------------
// 3 · step constraints — the duplicate drop + dev warn
// ---------------------------------------------------------------------------
describe('timeline value contract — duplicate steps', () => {
  it('a duplicated step dev-warns (the later item owns the milestone)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(TimelineValueHost, { props: { steps: [1, 1, 2] } });
    await waitFor(() =>
      expect(
        warn.mock.calls.some((c) => String(c[0]).includes('duplicate step 1')),
      ).toBe(true),
    );
    warn.mockRestore();
  });

  it('the default ladder never warns (strictly ascending by construction)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(TimelineValueHost);
    await waitFor(() => expect(completedFlags(container)).toEqual(['1', '0', '0']));
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('an authored inversion [3,1,2] dev-warns (descends) and normalizes the ladder (Gate-2 r1)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(TimelineValueHost, { props: { steps: [3, 1, 2] } });
    await waitFor(() =>
      expect(
        warn.mock.calls.some((c) => String(c[0]).includes('descends')),
      ).toBe(true),
    );
    warn.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// 4 · the STOPS math — the frozen protocol
// ---------------------------------------------------------------------------
describe('timeline stops protocol — timelineProgressLength', () => {
  // the default 1,2,3… ladder over three collinear nodes (80px runs)
  const ladder: TimelineSpineStop[] = [
    { step: 1, arc: 0 },
    { step: 2, arc: 80 },
    { step: 3, arc: 160 },
  ];

  it('the default ladder: first step → 0 · 1.5 → the half connector · last → the full run', () => {
    expect(timelineProgressLength(ladder, 1)).toBe(0);
    expect(timelineProgressLength(ladder, 1.5)).toBe(40);
    expect(timelineProgressLength(ladder, 2)).toBe(80);
    expect(timelineProgressLength(ladder, 3)).toBe(160);
  });

  it('clamps: sub-first → 0, above-last → pathLength (the TOP only, in k)', () => {
    expect(timelineProgressLength(ladder, 0.5)).toBe(0);
    expect(timelineProgressLength(ladder, 0)).toBe(0);
    expect(timelineProgressLength(ladder, 5)).toBe(160);
    expect(timelineProgressLength(ladder, 99.25)).toBe(160);
  });

  it('a declared gap (2,5) interpolates across the gap arc at 3.5', () => {
    const gap: TimelineSpineStop[] = [
      { step: 2, arc: 0 },
      { step: 5, arc: 80 },
    ];
    expect(timelineProgressLength(gap, 3.5)).toBe(40);
    expect(timelineProgressLength(gap, 2)).toBe(0);
    expect(timelineProgressLength(gap, 1)).toBe(0);
    expect(timelineProgressLength(gap, 5)).toBe(80);
    // 4.25 → (4.25−2)/(5−2) = 0.75 of the gap's arc
    expect(timelineProgressLength(gap, 4.25)).toBeCloseTo(60, 10);
  });

  it('the duplicate-first ladder (1,1,2): value 1 → arc(node 2), the OWNER mapping', () => {
    const dupFirst: TimelineSpineStop[] = [
      { step: 1, arc: 80 },
      { step: 2, arc: 160 },
    ];
    expect(timelineProgressLength(dupFirst, 0.5)).toBe(0);
    expect(timelineProgressLength(dupFirst, 1)).toBe(80);
    expect(timelineProgressLength(dupFirst, 1.5)).toBe(120);
    expect(timelineProgressLength(dupFirst, 2)).toBe(160);
  });

  it('the degenerate tables: empty → 0, single stop → its own arc', () => {
    expect(timelineProgressLength([], 3)).toBe(0);
    expect(timelineProgressLength([{ step: 4, arc: 37.5 }], 1)).toBe(0);
    expect(timelineProgressLength([{ step: 4, arc: 37.5 }], 4)).toBe(37.5);
    expect(timelineProgressLength([{ step: 4, arc: 37.5 }], 9)).toBe(37.5);
  });

  it('the normalized inversion [3,1,2] (Gate-2 r1): sorted ladder, the TRUE total denominator', () => {
    // DOM order carried steps 3@0, 1@80, 2@160 — the engine warns,
    // sorts to 1@80, 2@160, 3@0, then MONOTONE-clamps the inverted
    // milestone to the running max → 3@160; pathLength (the polyline
    // total) = 160
    const inverted: TimelineSpineStop[] = [
      { step: 1, arc: 80 },
      { step: 2, arc: 160 },
      { step: 3, arc: 160 },
    ];
    // sub-first clamps to 0; 1.5 interpolates 1→2 normally
    expect(timelineProgressLength(inverted, 0.5, 160)).toBe(0);
    expect(timelineProgressLength(inverted, 1.5, 160)).toBe(120);
    expect(timelineProgressLength(inverted, 2, 160)).toBe(160);
    // the 2→3 span rides the monotone clamp: NO retraction (the r2
    // bug: the un-clamped table produced 2.5 → 80), then ends at the
    // path's TRUE total
    expect(timelineProgressLength(inverted, 2.25, 160)).toBe(160);
    expect(timelineProgressLength(inverted, 2.5, 160)).toBe(160);
    expect(timelineProgressLength(inverted, 2.75, 160)).toBe(160);
    expect(timelineProgressLength(inverted, 3, 160)).toBe(160);
    expect(timelineProgressLength(inverted, 9, 160)).toBe(160);
  });

  it('the normalized inversion is MONOTONE over the whole ladder (Gate-2 r2)', () => {
    const inverted: TimelineSpineStop[] = [
      { step: 1, arc: 80 },
      { step: 2, arc: 160 },
      { step: 3, arc: 160 },
    ];
    let prev = -1;
    for (let v = 0; v <= 4; v += 0.125) {
      const len = timelineProgressLength(inverted, v, 160);
      expect(len, `value=${v}`).toBeGreaterThanOrEqual(prev);
      prev = len;
    }
  });
});

/** the synthetic-DOM measurement helper (the spine spec's pattern), + data-step */
function synthTimeline(opts: {
  axis?: string;
  centers: Array<{ x: number; y: number }>;
  steps?: Array<number | undefined>;
  dotSize?: number;
}): { host: HTMLElement; list: HTMLOListElement } {
  const { axis = 'vertical', centers, steps = [], dotSize = 20 } = opts;
  const doc = document.implementation.createHTMLDocument('probe');
  const host = doc.createElement('div');
  host.setAttribute('data-jx-tl-host', '');
  host.setAttribute('data-jx-timeline', '');
  host.setAttribute('data-axis', axis);
  host.setAttribute('data-direction', 'ltr');
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('data-jx-tl-spine', '');
  host.appendChild(svg);
  const list = doc.createElement('ol');
  list.setAttribute('data-jx-tl-list', '');
  host.appendChild(list);
  centers.forEach((c, i) => {
    const li = doc.createElement('li');
    li.setAttribute('data-jx-tl-item', '');
    if (steps[i] !== undefined) li.setAttribute('data-step', String(steps[i]));
    const dot = doc.createElement('span');
    dot.setAttribute('data-jx-tl-dot', '');
    li.appendChild(dot);
    list.appendChild(li);
    const r = {
      left: c.x - dotSize / 2,
      top: c.y - dotSize / 2,
      width: dotSize,
      height: dotSize,
      right: c.x + dotSize / 2,
      bottom: c.y + dotSize / 2,
    };
    vi.spyOn(dot as unknown as Element, 'getBoundingClientRect').mockReturnValue(r as DOMRect);
  });
  const w = 400;
  const h = centers.length * 80 || 240;
  vi.spyOn(svg as unknown as Element, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: w,
    height: h,
    right: w,
    bottom: h,
  } as DOMRect);
  doc.body.appendChild(host);
  return { host, list };
}

describe('timeline stops protocol — the measured milestone table', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('the default ladder: stops [(1,0),(2,80),(3,160)], pathLength = stops.at(-1).arc', () => {
    const { host, list } = synthTimeline({
      centers: [
        { x: 40, y: 10 },
        { x: 40, y: 90 },
        { x: 40, y: 170 },
      ],
    });
    const g = measureTimelineSpine(host, list)!;
    // CENTER SPACE (the dash-driven layer's basis — r3-review close:
    // the flowPath stays continuous, the dot MASK subtracts the dots):
    // milestone k at node k's center, pathLength = the center polyline
    expect(g.stops).toEqual([
      { step: 1, arc: 0 },
      { step: 2, arc: 80 },
      { step: 3, arc: 160 },
    ]);
    expect(g.pathLength).toBe(160);
    // the base layer's edge subpaths + the continuous flowPath both ship
    expect(g.runPath).toBe('M 40 19 L 40 81 M 40 99 L 40 161');
    expect(g.flowPath).toBe('M 40 10 L 40 90 L 40 170');
    // stops[0].arc is 0 on the unique-first-step ladder (the default)
    expect(g.stops[0]!.arc).toBe(0);
  });

  it('the END-TO-END inversion [3,1,2] (Gate-2 r3 non-blocking): measure → normalize → clamp in one assertion', () => {
    const { host, list } = synthTimeline({
      centers: [
        { x: 40, y: 10 },
        { x: 40, y: 90 },
        { x: 40, y: 170 },
      ],
      steps: [3, 1, 2],
    });
    const g = measureTimelineSpine(host, list)!;
    // DOM carried 3@0, 1@80, 2@160 — the engine sorts AND monotone-
    // clamps: the inverted milestone 3 rides the running max (160)
    expect(g.stops).toEqual([
      { step: 1, arc: 80 },
      { step: 2, arc: 160 },
      { step: 3, arc: 160 },
    ]);
    // pathLength = the CENTER polyline's total, not the mis-ordered arc
    expect(g.pathLength).toBe(160);
  });

  it('declared data-step builds the ladder from the attribute (the 2,5 gap)', () => {
    const { host, list } = synthTimeline({
      centers: [
        { x: 40, y: 10 },
        { x: 40, y: 90 },
        { x: 40, y: 170 },
      ],
      steps: [2, undefined, 5],
    });
    // item 2 undeclared → DOM order + 1 = 2 … collides with the
    // declared 2? NO: the declared attr wins on item 1; item 2 rides
    // the default; item 3 declares 5 — the ladder is (2, 2, 5) with
    // the LATER node owning 2
    const g = measureTimelineSpine(host, list)!;
    expect(g.stops).toEqual([
      { step: 2, arc: 80 },
      { step: 5, arc: 160 },
    ]);
    expect(g.pathLength).toBe(160);
  });

  it('the duplicate-first fixture (1,1,2): later node owns step 1 — arc(node 2), not 0', () => {
    const { host, list } = synthTimeline({
      centers: [
        { x: 40, y: 10 },
        { x: 40, y: 90 },
        { x: 40, y: 170 },
      ],
      steps: [1, 1, 2],
    });
    const g = measureTimelineSpine(host, list)!;
    expect(g.stops).toEqual([
      { step: 1, arc: 80 },
      { step: 2, arc: 160 },
    ]);
    // the owner mapping through the frozen mapping: value 1 draws to
    // node 2's center (the dot MASK shows the tip at its edge), value
    // 0.5 draws nothing
    expect(timelineProgressLength(g.stops, 1)).toBe(80);
    expect(timelineProgressLength(g.stops, 0.5)).toBe(0);
  });

  it('POLYLINE vs CHORD: pathLength is the cumulative polyline, runLength keeps the chord', () => {
    // a dog-leg run: (0,0) → (80,60) → (0,120): each leg 100px, chord 120px
    const { host, list } = synthTimeline({
      centers: [
        { x: 0, y: 0 },
        { x: 80, y: 60 },
        { x: 0, y: 120 },
      ],
    });
    const g = measureTimelineSpine(host, list)!;
    // EDGE segments (the base layer, JOINT-LAP r4): each 100px leg −
    // 2×(R10−1) = 82px
    expect(g.segments.map((s) => s.length)).toEqual([82, 82]);
    expect(g.runLength).toBe(120); // the chord — kept for payload compat
    expect(g.pathLength).toBe(200); // the CENTER polyline — the dasharray basis
    expect(g.pathLength).not.toBe(g.runLength);
    expect(g.stops.at(-1)!.arc).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// 5 · the css contract (transition · reduced motion · scroll ownership)
// ---------------------------------------------------------------------------
describe('timeline value contract — the css channel', () => {
  const css = readFileSync(resolve(specDir, '../src/lib/ui/timeline/timeline.css'), 'utf8');

  it('the value stroke paints outside scroll mode with a 300ms dashoffset transition', () => {
    const rule =
      /:where\(\[data-jx-timeline\]:not\(\[data-anim='scroll'\]\) > \[data-jx-tl-spine\] > \[data-jx-tl-progress\]\)\s*\{\s*display:\s*inline;\s*transition:\s*stroke-dashoffset 300ms ease;/;
    expect(rule.test(css)).toBe(true);
  });

  it('reduced motion: the value stroke drops the transition (position stays), scroll keeps the hide', () => {
    const media = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*)\}\s*$/);
    expect(media).not.toBeNull();
    const block = media![1]!;
    expect(
      /:where\(\[data-jx-timeline\]:not\(\[data-anim='scroll'\]\)[^}]*\)\s*\{[^}]*transition:\s*none;/.test(
        block,
      ),
    ).toBe(true);
    expect(
      /:where\(\[data-jx-timeline\]\[data-anim='scroll'\][^}]*\)\s*\{[^}]*display:\s*none;/.test(
        block,
      ),
    ).toBe(true);
  });

  it('the completed token paint rides the ladder base (dot hollow → filled, title muted → ink)', () => {
    expect(css).toMatch(
      /:where\(\[data-jx-tl-dot\]\)\s*\{[^}]*min-inline-size:\s*var\(--jx-icon\);[^}]*border:\s*var\(--jx-tl-stroke-w\) solid var\(--border\);[^}]*background:\s*transparent;/s,
    );
    expect(css).toMatch(
      /:where\(\[data-jx-tl-item\]\[data-completed\]\) > :where\(\[data-jx-tl-dot\]\)\s*\{[^}]*background:\s*var\(--primary\);/,
    );
    expect(css).toMatch(/:where\(\[data-jx-tl-title\]\)\s*\{[^}]*color:\s*var\(--muted-foreground\);/);
    expect(css).toMatch(
      /:where\(\[data-jx-tl-item\]\[data-completed\]\) :where\(\[data-jx-tl-title\]\)\s*\{[^}]*color:\s*var\(--foreground\);/,
    );
    expect(css).toMatch(
      /:where\(\[data-jx-tl-item\]\[data-completed\]\) :where\(\[data-jx-tl-time\]\)\s*\{[^}]*color:\s*var\(--muted-foreground\);/,
    );
  });
});
