/**
 * Timeline drawn-spine lock (test/timeline-spine.spec.ts, W3 rework,
 * Owner 2026-09-15).
 *
 * Three batteries:
 *
 *   1. THE DOM SNAPSHOT — the structural landing points of the drawn
 *      spine: the one-cell grid HOST (the component root, rest attrs
 *      land on it), the semantic list (<ol role="list">), the spine
 *      svg layer as its grid-area:1/1 sibling (source order under the
 *      list, aria-hidden, pointer-transparent by css), and the floor
 *      lines standing pre-measurement.
 *   2. THE GEOMETRY PAYLOAD — measureTimelineSpine unit-tested on a
 *      synthetic DOM with stubbed rects (jsdom lays nothing out):
 *      node centers in flow order, per-segment path data, the
 *      dot-edge phase anchor arithmetic, axis/direction/rtl metadata,
 *      the degenerate-box floor hold.
 *   3. THE line(i) RESIDUE CANARY — the retired seam must stay
 *      retired across the shipped surface (two-directional: a planted
 *      line(i) use REDS the scanner).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import TimelineHost from './fixtures/timeline-host.svelte';
import {
  TIMELINE_DASH_PERIOD,
  measureTimelineSpine,
  type TimelineSpineGeometry,
} from '../src/lib/ui/timeline/timeline-spine.svelte';

const specDir = resolve(fileURLToPath(import.meta.url), '..');

// ---------------------------------------------------------------------------
// 1 · the DOM snapshot — the structural landing points
// ---------------------------------------------------------------------------
describe('timeline drawn spine — structural landing points', () => {
  it('the host is the component root: one-cell grid, rest attrs land on it', () => {
    const { container } = render(TimelineHost);
    // the outermost element IS the host carrying the engine identity
    const root = container.firstElementChild!;
    expect(root.getAttribute('data-jx-tl-host')).toBe('');
    expect(root.getAttribute('data-jx-timeline')).toBe('');
    // rest attributes land on the root (the fixture passes none, but the
    // identity attrs do — they ride the same {...rest} channel's element)
    expect(root.getAttribute('data-axis')).toBe('vertical');
    expect(root.getAttribute('data-direction')).toBe('ltr');
    expect(root.getAttribute('data-anim')).toBe('none');
    expect(root.getAttribute('data-jx-spine')).toBe('floor');
  });

  it('the semantic list is an <ol role="list"> — the spine svg its FIRST sibling, under it', () => {
    const { container } = render(TimelineHost);
    const root = container.firstElementChild as HTMLElement;
    const [first, second] = [...root.children];
    expect(first!.tagName).toBe('svg');
    expect(first!.getAttribute('data-jx-tl-spine')).toBe('');
    // the decorative layer law: aria-hidden + pointer-transparent (css)
    expect(first!.getAttribute('aria-hidden')).toBe('true');
    expect(second!.tagName).toBe('OL');
    expect(second!.getAttribute('data-jx-tl-list')).toBe('');
    expect(second!.getAttribute('role')).toBe('list');
    // source order paints the svg UNDER the items (the zero-z dialect);
    // the css source pins the grid-area pair + pointer-events
    const css = readFileSync(resolve(specDir, '../src/lib/ui/timeline/timeline.css'), 'utf8');
    expect(css).toMatch(
      /:where\(\[data-jx-tl-host\]\) > :where\(\[data-jx-tl-spine\]\),\s*\r?\n\s*:where\(\[data-jx-tl-host\]\) > :where\(\[data-jx-tl-list\]\)\s*\{\s*\r?\n\s*grid-area: 1 \/ 1;/,
    );
    expect(css).toMatch(/:where\(\[data-jx-tl-spine\]\)\s*\{[^}]*pointer-events: none/s);
  });
  it('the items and their parts stay DOM (li/dot/slot/content/time/title)', () => {
    const { container } = render(TimelineHost);
    const ol = container.querySelector('[data-jx-tl-list]')!;
    const items = [...ol.querySelectorAll(':scope > [data-jx-tl-item]')];
    expect(items.length).toBe(2);
    expect(items.every((li) => li.tagName === 'LI')).toBe(true);
    expect(items[0]!.querySelector('[data-jx-tl-slot][data-dir="bs"]')!.textContent).toBe('07:02');
    expect(items[0]!.querySelector('time')!.getAttribute('datetime')).toBe('2026-08-22T07:02:00Z');
  });

  it('pre-measurement the floor stands: per-item lines painted, no svg paths', () => {
    const { container } = render(TimelineHost);
    expect(container.querySelectorAll('[data-jx-tl-line]').length).toBe(2);
    expect(container.querySelector('[data-jx-tl-spine] > path')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 2 · the geometry payload (synthetic DOM, stubbed rects)
// ---------------------------------------------------------------------------
/** builds the host > svg + ol > li > dot tree with stubbed rects */
function synthTimeline(opts: {
  axis?: string;
  direction?: string;
  density?: string;
  rtl?: boolean;
  /** node centers in list-root px, FLOW order */
  centers: Array<{ x: number; y: number }>;
  dotSize?: number;
  box?: { w: number; h: number };
}): { host: HTMLElement; list: HTMLOListElement } {
  const { axis = 'vertical', direction = 'ltr', density, rtl = false, centers, dotSize = 20, box } = opts;
  const doc = document.implementation.createHTMLDocument('probe');
  const host = doc.createElement('div');
  host.setAttribute('data-jx-tl-host', '');
  host.setAttribute('data-jx-timeline', '');
  host.setAttribute('data-axis', axis);
  host.setAttribute('data-direction', direction);
  if (density) host.setAttribute('data-density', density);
  if (rtl) host.setAttribute('dir', 'rtl');
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('data-jx-tl-spine', '');
  host.appendChild(svg);
  const list = doc.createElement('ol');
  list.setAttribute('data-jx-tl-list', '');
  host.appendChild(list);
  for (const c of centers) {
    const li = doc.createElement('li');
    li.setAttribute('data-jx-tl-item', '');
    const dot = doc.createElement('span');
    dot.setAttribute('data-jx-tl-dot', '');
    li.appendChild(dot);
    list.appendChild(li);
    const r = { left: c.x - dotSize / 2, top: c.y - dotSize / 2, width: dotSize, height: dotSize, right: c.x + dotSize / 2, bottom: c.y + dotSize / 2 };
    vi.spyOn(dot as unknown as Element, 'getBoundingClientRect').mockReturnValue(r as DOMRect);
  }
  const w = box?.w ?? 400;
  const h = box?.h ?? centers.length * 80;
  const base = { left: 0, top: 0, width: w, height: h, right: w, bottom: h };
  vi.spyOn(svg as unknown as Element, 'getBoundingClientRect').mockReturnValue(base as DOMRect);
  doc.body.appendChild(host);
  return { host, list };
}

describe('timeline drawn spine — the geometry payload', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('vertical ltr: node centers in flow order, one segment per gap, continuous run path', () => {
    const { host, list } = synthTimeline({
      centers: [
        { x: 40, y: 10 },
        { x: 40, y: 90 },
        { x: 40, y: 170 },
      ],
    });
    const g = measureTimelineSpine(host, list)!;
    expect(g).toBeTruthy();
    expect(g.nodes).toEqual([
      { x: 40, y: 10 },
      { x: 40, y: 90 },
      { x: 40, y: 170 },
    ]);
    expect(g.segments.length).toBe(2);
    expect(g.segments[0]!.d).toBe('M 40 10 L 40 90');
    expect(g.segments[0]!.length).toBe(80);
    // ONE continuous run path, first-center → last-center
    expect(g.runPath).toBe('M 40 10 L 40 90 L 40 170');
    expect(g.runLength).toBe(160);
    expect(g.axis).toBe('vertical');
    expect(g.direction).toBe('ltr');
    expect(g.interlaced).toBe(false);
    expect(g.nodeRadius).toBe(10);
  });

  it('horizontal rtl: physical geometry, logical chronology — the run path starts at the FLOW-first node whatever its physical x', () => {
    const { host, list } = synthTimeline({
      axis: 'horizontal',
      direction: 'interlaced',
      rtl: true,
      // authored RTL: the chronologically-first item sits physical RIGHT
      centers: [
        { x: 360, y: 30 },
        { x: 200, y: 30 },
        { x: 40, y: 30 },
      ],
    });
    const spy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({ direction: 'rtl' } as CSSStyleDeclaration);
    const g = measureTimelineSpine(host, list)!;
    expect(g.rtl).toBe(true);
    expect(g.axis).toBe('horizontal');
    expect(g.interlaced).toBe(true);
    // flow order preserved: the path runs right → left physically
    expect(g.runPath).toBe('M 360 30 L 200 30 L 40 30');
    expect(g.runLength).toBe(320);
    spy.mockRestore();
  });

  it('the dash phase anchor: edgePhase lands a dash START at the measured flow-end edge, whatever the density scale', () => {
    for (const [dotSize, radius] of [
      [20, 10], // default density (20px icon ≡ 4 mod 8 — the old dead window)
      [16, 8], // xs (radius ≡ 0 mod 8 — edgePhase must be 0, not 8)
      [24, 12], // lg (radius ≡ 4 mod 8)
    ] as const) {
      const { host, list } = synthTimeline({
        centers: [
          { x: 40, y: 10 },
          { x: 40, y: 90 },
        ],
        dotSize,
      });
      const g = measureTimelineSpine(host, list)!;
      expect(g.nodeRadius).toBe(radius);
      const expected = (TIMELINE_DASH_PERIOD - (radius % TIMELINE_DASH_PERIOD)) % TIMELINE_DASH_PERIOD;
      expect(g.segments[0]!.edgePhase).toBe(expected);
      // pattern position at the edge must be exactly 0 (dash start):
      // pos(L) = (L + edgePhase) mod period at L = radius
      expect((radius + g.segments[0]!.edgePhase) % TIMELINE_DASH_PERIOD).toBe(0);
    }
  });

  it('the density scale rides the payload; degenerate boxes keep the floor (null)', () => {
    const dense = synthTimeline({ density: 'lg', centers: [{ x: 40, y: 10 }, { x: 40, y: 90 }] });
    expect(measureTimelineSpine(dense.host, dense.list)!.density).toBe('lg');
    // zero-size overlay: no measurement, the floor stands
    const flat = synthTimeline({
      centers: [{ x: 40, y: 10 }, { x: 40, y: 90 }],
      box: { w: 0, h: 0 },
    });
    expect(measureTimelineSpine(flat.host, flat.list)).toBeNull();
    // a dotless list measures nothing
    const bare = synthTimeline({ centers: [] });
    expect(measureTimelineSpine(bare.host, bare.list)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 3 · the line(i) residue canary (two-directional)
// ---------------------------------------------------------------------------
/** the retired seam's fingerprints */
const LINE_RESIDUE = [
  /TimelineLineDashed/,
  /TimelineLineBeam/,
  /\{#snippet line\(/,
  /line\?:\s*Snippet<\[number\]>/,
];

/** scans the SHIPPED SURFACE for retired-seam residue */
function scanLineResidue(files: Array<{ path: string; code: string }>): string[] {
  const hits: string[] = [];
  for (const { path, code } of files) {
    for (const pattern of LINE_RESIDUE) if (pattern.test(code)) hits.push(`${path}: ${pattern}`);
  }
  return hits;
}

function readTree(dir: string, base: string): Array<{ path: string; code: string }> {
  return readdirSync(resolve(base, dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return readTree(rel, base);
    if (!/\.(svelte|ts|css)$/.test(entry.name)) return [];
    return [{ path: rel, code: readFileSync(resolve(base, rel), 'utf8') }];
  });
}

describe('timeline drawn spine — the line(i) residue canary', () => {
  const wwwRoot = specDir.replace(/\/test$/, '');
  const repoRoot = resolve(specDir, '../../..');
  const shippedSurface = (): Array<{ path: string; code: string }> => [
    ...readTree('files/ui/timeline', resolve(repoRoot, 'registry')),
    ...readTree('src/lib/ui/timeline', wwwRoot),
    ...readTree('src/routes/docs/components/timeline.html', wwwRoot),
  ];

  it('zero line(i) residue across the shipped surface (registry mirrors byte-equal)', () => {
    expect(scanLineResidue(shippedSurface())).toEqual([]);
  });

  it('two-directional: a planted line(i) use REDS the scanner', () => {
    const planted = [
      { path: 'planted/timeline.svelte', code: '<Timeline {line}>\n  {#snippet line(i)}\n    <TimelineLineDashed />\n  {/snippet}\n</Timeline>' },
      ...shippedSurface(),
    ];
    const hits = scanLineResidue(planted);
    expect(hits.length).toBeGreaterThanOrEqual(2); // TimelineLineDashed + snippet line(
    expect(hits.every((h) => h.startsWith('planted/'))).toBe(true);
  });
});
