/**
 * jixoai timeline spine measurement runtime
 * (registry/files/ui/timeline/timeline-spine.svelte.ts, W3 drawn-spine
 * rework, Owner 2026-09-15).
 *
 * THE ENGINE (the only lifecycle the family carries — post-hydration,
 * never in the SSR paint): one whole-list SVG spine layer measured
 * from the live item geometry. Items/content/titles/times/dots stay
 * DOM (text layout, a11y, the density contract); the spine layer is
 * painted UNDER them by source order in the one-cell grid host.
 *
 * THE GEOMETRY PAYLOAD CONTRACT (fixed — custom `spine` snippets
 * receive exactly this object):
 *
 *   - node centers in LIST-ROOT coordinates, FLOW order (the ol's
 *     border-box origin — the SVG layer overlays the same cell, so
 *     list-root space IS svg user space; no viewBox, user units map
 *     1:1 to CSS px);
 *   - axis / direction / interlaced / rtl metadata;
 *   - per-segment path data (center to center, plus the dash phase
 *     anchor at the from-node's flow-end edge);
 *   - the density scale (the resolved data-density name).
 *
 * RTL RESOLVES IN THE COORDINATE TRANSFORM (physical geometry,
 * logical chronology): the computed `direction` is the LAW (the
 * scroll-run house rule — it folds [dir], css `direction` and
 * inheritance into the used value); paths are authored in FLOW order
 * over PHYSICAL coordinates, so a horizontal RTL list draws its run
 * right-to-left with zero extra branches. A live direction flip that
 * changes no box re-measures on the next trigger (resize/membership/
 * density) — the floor lines are direction-neutral, so the boundary
 * is cosmetic, recorded here.
 *
 * Re-measure triggers: root resize (ResizeObserver), membership
 * mutation (childList observer), density/context change (the props
 * rebind the effect; the attribute observer also catches ambient
 * re-scoping). Degenerate layouts (zero-size boxes, jsdom) never
 * upgrade the floor — the no-JS contract holds.
 */

// ── the payload types (the custom-spine seam) ───────────────────────

/** a node (dot) center in list-root px coordinates */
export interface TimelineSpineNode {
  x: number;
  y: number;
}

/** one connector, node-center to node-center */
export interface TimelineSpineSegment {
  from: TimelineSpineNode;
  to: TimelineSpineNode;
  /** `M from L to` — center to center, run under the dots */
  d: string;
  length: number;
  /**
   * the dot-edge phase anchor: stroke-dashoffset value that lands a
   * dash START exactly at the from-node's flow-end edge (the
   * background-position phase law's SVG successor — computed from the
   * MEASURED dot radius, so every density scale anchors for free)
   */
  edgePhase: number;
}

/** the measured geometry, per list — the custom spine snippet payload */
export interface TimelineSpineGeometry {
  axis: 'vertical' | 'horizontal';
  direction: 'ltr' | 'revert' | 'interlaced';
  interlaced: boolean;
  /** the computed direction verdict (physical mirror knowledge) */
  rtl: boolean;
  /** the list-root box (the svg overlay's viewport), CSS px */
  width: number;
  height: number;
  /** node centers in list-root coordinates, FLOW order */
  nodes: TimelineSpineNode[];
  /** per-segment connectors, flow order */
  segments: TimelineSpineSegment[];
  /** ONE continuous center-to-center path per run (no per-item seams) */
  runPath: string;
  runLength: number;
  /** the measured dot radius (half the dot's inline size) */
  nodeRadius: number;
  /** the resolved density scale name ('' when ambient) */
  density: string;
}

/** the spine presets — names preserved from the line-preset era */
export type TimelineSpinePreset = 'plain' | 'dashed' | 'beam';

// ── the measurement core (pure: live DOM in, payload out) ───────────

/** the dash preset's period (4 on / 4 off — the floor era's rhythm) */
export const TIMELINE_DASH_PERIOD = 8;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** node centers + segment paths from the live DOM; null when degenerate */
export function measureTimelineSpine(
  host: HTMLElement,
  list: HTMLOListElement,
): TimelineSpineGeometry | null {
  const svg = host.querySelector(':scope > [data-jx-tl-spine]');
  if (!svg) return null;
  const origin = svg.getBoundingClientRect();
  if (origin.width < 1 || origin.height < 1) return null;

  const items = list.querySelectorAll(':scope > [data-jx-tl-item]');
  const nodes: TimelineSpineNode[] = [];
  let nodeRadius = 0;
  for (const li of items) {
    const dot = li.querySelector(':scope > [data-jx-tl-dot]');
    if (!dot) continue;
    const r = dot.getBoundingClientRect();
    if (r.width < 1 && r.height < 1) continue;
    nodes.push({
      x: round2(r.left + r.width / 2 - origin.left),
      y: round2(r.top + r.height / 2 - origin.top),
    });
    nodeRadius = round2(r.width / 2);
  }
  if (nodes.length === 0) return null;

  const segments: TimelineSpineSegment[] = [];
  for (let i = 0; i + 1 < nodes.length; i++) {
    const from = nodes[i]!;
    const to = nodes[i + 1]!;
    segments.push({
      from,
      to,
      d: `M ${from.x} ${from.y} L ${to.x} ${to.y}`,
      length: round2(Math.hypot(to.x - from.x, to.y - from.y)),
      // dashoffset lands pattern position 0 at the flow-end edge:
      // pos(L) = (L + offset) mod period must be 0 at L = radius
      edgePhase: round2((TIMELINE_DASH_PERIOD - (nodeRadius % TIMELINE_DASH_PERIOD)) % TIMELINE_DASH_PERIOD),
    });
  }

  const runPath =
    'M ' + nodes.map((n) => `${n.x} ${n.y}`).join(' L ');
  const ols = nodes[nodes.length - 1]!;
  const fs = nodes[0]!;
  const runLength = round2(Math.hypot(ols.x - fs.x, ols.y - fs.y));

  const axis = (host.getAttribute('data-axis') as TimelineSpineGeometry['axis']) ?? 'vertical';
  const direction =
    (host.getAttribute('data-direction') as TimelineSpineGeometry['direction']) ?? 'ltr';
  // the computed direction is the LAW (the scroll-run house rule)
  const computed = getComputedStyle(list).direction;

  return {
    axis,
    direction,
    interlaced: direction === 'interlaced',
    rtl: computed ? computed === 'rtl' : (host.getAttribute('dir') ?? 'ltr') === 'rtl',
    width: round2(origin.width),
    height: round2(origin.height),
    nodes,
    segments,
    runPath,
    runLength,
    nodeRadius,
    density: host.getAttribute('data-density') ?? '',
  };
}

// ── the mount engine (observers + the floor→drawn upgrade) ──────────

/**
 * Mounts the re-measure machinery on one timeline. Fires `emit` with
 * the measured payload (null = keep the floor), flips the host's
 * data-jx-spine to 'drawn' on the first successful measurement, and
 * returns the teardown. Zero-ResizeObserver environments (jsdom) keep
 * the floor — the no-JS contract holds under test too.
 */
export function mountTimelineSpine(
  host: HTMLElement,
  list: HTMLOListElement,
  emit: (geometry: TimelineSpineGeometry | null) => void,
): () => void {
  let raf = 0;
  const remeasure = (): void => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const geometry = measureTimelineSpine(host, list);
      if (geometry) {
        host.setAttribute('data-jx-spine', 'drawn');
        emit(geometry);
      }
    });
  };

  const ro =
    typeof ResizeObserver === 'function'
      ? new ResizeObserver(remeasure)
      : null;
  ro?.observe(list);
  // membership mutation: items added/removed re-measure (subtree too —
  // dot slots appearing inside items change node geometry)
  const mo = new MutationObserver(remeasure);
  mo.observe(list, { childList: true, subtree: true, attributeFilter: ['data-jx-tl-pending'] });
  // ambient density re-scopes (the data-density attr on the root)
  const moRoot = new MutationObserver(remeasure);
  moRoot.observe(host, { attributeFilter: ['data-density', 'data-axis', 'data-direction'] });

  remeasure();

  return () => {
    if (raf) cancelAnimationFrame(raf);
    ro?.disconnect();
    mo.disconnect();
    moRoot.disconnect();
  };
}
