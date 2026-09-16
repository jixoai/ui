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
 *   - per-segment path data (dot-EDGE to dot-edge, Owner r3, plus
 *     the dash phase anchor at the from-node's flow-end edge);
 *   - the STOPS table — the DEDUPED milestone ladder: one
 *     { step, arc } per unique step, arc = the milestone's OWNING
 *     node's cumulative polyline length (the item's declared
 *     `data-step`, defaulting to DOM order + 1; a duplicated step is
 *     OWNED by its LATER node — the earlier one is a pass-through
 *     point, never a milestone); `pathLength` = the polyline's true
 *     cumulative total (= stops.at(-1).arc under the ascending
 *     contract);
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

/** one connector, dot-edge to dot-edge (Owner r3: the axis never
 * crosses a dot — the subpath stops at both nodes' edges) */
export interface TimelineSpineSegment {
  from: TimelineSpineNode;
  to: TimelineSpineNode;
  /** `M from L to` — the EDGE-to-EDGE gap connector (the base layer) */
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

/**
 * one milestone of the STOPS table: the unique step and its OWNING
 * node's cumulative polyline length (arc 0 at the first milestone on
 * the unique-first-step ladder — non-zero only when the first step
 * duplicates, the owner then being a later node)
 */
export interface TimelineSpineStop {
  step: number;
  arc: number;
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
  /** ONE path element per run, per-gap edge-to-edge subpaths (Owner r3:
   *  the axis never crosses a dot; no per-item seams) — the BASE layer */
  runPath: string;
  /** ONE CONTINUOUS center-to-center path per run — the DASH-DRIVEN
   *  layer (progress stroke + beam): Chromium restarts the dash phase
   *  at every M subpath, so the draw-on/beam math needs a single
   *  subpath; the Owner r3 gaps come from the dot MASK the template
   *  applies to these strokes, never from the path data */
  flowPath: string;
  /**
   * the first↔last CHORD (kept for payload compatibility with custom
   * spine snippets) — RETIRED from every dasharray consumer: the
   * scroll-progress stroke and the beam ride `pathLength`, the
   * cumulative polyline length, which is the correct dash basis on
   * non-collinear runs (the standing chord bug, W3 2026-09-15)
   */
  runLength: number;
  /** the DEDUPED milestone table — later node owns a duplicated step */
  stops: TimelineSpineStop[];
  /** the CENTER polyline's cumulative total (the flowPath's length) —
   *  the dasharray basis for every dash-driven stroke (progress, beam);
   *  identical to stops.at(-1).arc under the ascending contract, and
   *  the honest denominator when an authored inversion normalizes
   *  (Gate-2 r3). The BASE layer's edge subpaths are SHORTER — the
   *  dots' diameters never enter the dash math */
  pathLength: number;
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
  const steps: number[] = [];
  let nodeRadius = 0;
  let itemIndex = 0;
  for (const li of items) {
    itemIndex++;
    const dot = li.querySelector(':scope > [data-jx-tl-dot]');
    if (!dot) continue;
    const r = dot.getBoundingClientRect();
    if (r.width < 1 && r.height < 1) continue;
    nodes.push({
      x: round2(r.left + r.width / 2 - origin.left),
      y: round2(r.top + r.height / 2 - origin.top),
    });
    // the milestone ladder: the item's DECLARED data-step, defaulting
    // to DOM order + 1 among the timeline's items (the default ladder
    // is strictly ascending by construction)
    const declared = Number.parseFloat(li.getAttribute('data-step') ?? '');
    steps.push(Number.isFinite(declared) ? declared : itemIndex);
    nodeRadius = round2(r.width / 2);
  }
  if (nodes.length === 0) return null;

  // EDGE-TO-EDGE segments (Owner r3: the axis NEVER crosses a dot):
  // each gap's subpath runs from node i's OUTGOING edge to node i+1's
  // INCOMING edge (the center-line direction, offset nodeRadius at
  // both ends) — a gap of the dot's diameter interrupts the stroke at
  // every node, exactly like the no-JS floor's ground cutouts
  const segments: TimelineSpineSegment[] = [];
  const edgeSubpaths: string[] = [];
  for (let i = 0; i + 1 < nodes.length; i++) {
    const from = nodes[i]!;
    const to = nodes[i + 1]!;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    const ux = dist > 0 ? dx / dist : 0;
    const uy = dist > 0 ? dy / dist : 0;
    const edgeLen = Math.max(0, dist - 2 * nodeRadius);
    const a = { x: round2(from.x + ux * nodeRadius), y: round2(from.y + uy * nodeRadius) };
    const b = { x: round2(to.x - ux * nodeRadius), y: round2(to.y - uy * nodeRadius) };
    segments.push({
      from: a,
      to: b,
      d: `M ${a.x} ${a.y} L ${b.x} ${b.y}`,
      length: round2(edgeLen),
      // dashoffset lands pattern position 0 at the flow-end edge:
      // pos(L) = (L + offset) mod period must be 0 at L = radius
      edgePhase: round2((TIMELINE_DASH_PERIOD - (nodeRadius % TIMELINE_DASH_PERIOD)) % TIMELINE_DASH_PERIOD),
    });
    if (edgeLen > 0) edgeSubpaths.push(`M ${a.x} ${a.y} L ${b.x} ${b.y}`);
  }

  // ONE path element, per-gap subpaths (the r3 supersession of the W3
  // center-to-center freeze: continuity of ELEMENT, gaps at nodes)
  const runPath = edgeSubpaths.join(' ');
  // the CONTINUOUS center polyline — the dash-driven layer's path
  // (Chromium restarts dash phase at every M; the gaps come from the
  // template's dot mask instead)
  const flowPath = 'M ' + nodes.map((n) => `${n.x} ${n.y}`).join(' L ');
  const ols = nodes[nodes.length - 1]!;
  const fs = nodes[0]!;
  const runLength = round2(Math.hypot(ols.x - fs.x, ols.y - fs.y));

  // THE STOPS TABLE in CENTER space (the dash-driven layer's basis —
  // milestone k at node k's CENTER on the continuous flowPath; the dot
  // MASK makes the visual tip land at the dot's edge for free): deduped
  // over steps with the LATER node owning a duplicated step (an
  // earlier duplicate is a pass-through point, never a milestone), then
  // NORMALIZED to ascending step order (Gate-2 r1: an authored
  // inversion like [3,1,2] must never yield a non-monotone ladder —
  // warn once naming the offending sequence, sort the table)
  const stops: TimelineSpineStop[] = [];
  let cumulative = 0;
  const domOrdered: TimelineSpineStop[] = [];
  for (let i = 0; i < nodes.length; i++) {
    if (i > 0) cumulative += Math.hypot(nodes[i]!.x - nodes[i - 1]!.x, nodes[i]!.y - nodes[i - 1]!.y);
    const stop: TimelineSpineStop = { step: steps[i]!, arc: round2(cumulative) };
    const claimed = domOrdered.findIndex((s) => s.step === stop.step);
    if (claimed >= 0) domOrdered[claimed] = stop;
    else domOrdered.push(stop);
  }
  for (let i = 0; i + 1 < domOrdered.length; i++) {
    if (domOrdered[i]!.step >= domOrdered[i + 1]!.step) {
      console.warn(
        `[timeline] steps must be strictly ascending in DOM order — got [${domOrdered
          .map((s) => s.step)
          .join(', ')}]; the milestone table is normalized to ascending order (arcs stay bound to their owning nodes)`,
      );
      break;
    }
  }
  stops.push(...domOrdered.sort((a, b) => a.step - b.step));
  // the MONOTONE clamp (Gate-2 r2): sorting by step can leave an arc
  // BELOW its predecessor (the [3,1,2] inversion: 3@0 after 2@160) —
  // the interpolation would RETRACT mid-range. Each stop's arc clamps
  // to the running max (weakly increasing), so the value→arc map is
  // monotone and total; the inverted milestone rides the highest arc
  // reached on the ladder
  let runningMaxArc = -Infinity;
  for (const stop of stops) {
    if (stop.arc < runningMaxArc) stop.arc = runningMaxArc;
    else runningMaxArc = stop.arc;
  }
  // pathLength = the CENTER polyline's cumulative total (the
  // flowPath's length) — the dash basis; the chord stays retired; an
  // inversion keeps the honest denominator
  const pathLength = round2(cumulative);

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
    flowPath,
    runLength,
    stops,
    pathLength,
    nodeRadius,
    density: host.getAttribute('data-density') ?? '',
  };
}

// ── the value → arc mapping (the frozen STOPS protocol, W3 r3) ───────

/**
 * The drawn length the value maps to on the measured run — the frozen
 * step-space interpolation:
 *
 *     k   = min(value, stops.at(-1).step)        // clamp the TOP only
 *     len = value < stops[0].step
 *             ? 0                                // sub-first → nothing
 *             : k === stops[0].step
 *                 ? stops[0].arc                 // the first owner's arc
 *                 : a.arc + (k − a.step)/(b.step − a.step) × (b.arc − a.arc)
 *
 * (a, b) = the bracketing stops pair (a.step < k ≤ b.step); a
 * fractional value inside a DECLARED gap interpolates across that
 * gap's arc — the path is the truth, the steps are its milestones.
 * `stroke-dasharray = pathLength; stroke-dashoffset = pathLength −
 * len` completes the arithmetic at the consumer. Decimals are
 * first-class; nothing rounds.
 */
export function timelineProgressLength(
  stops: TimelineSpineStop[],
  value: number,
  pathLength?: number,
): number {
  if (stops.length === 0) return 0;
  const first = stops[0]!;
  const last = stops[stops.length - 1]!;
  if (value < first.step) return 0;
  // the full-run denominator: the caller's measured polyline total —
  // under the ascending contract it IS stops.at(-1).arc; an authored
  // inversion (warned, normalized) still ends the stroke at the
  // path's TRUE end, not at a mis-ordered milestone's arc
  const total = pathLength ?? last.arc;
  if (value >= last.step) return total;
  const k = Math.min(value, last.step);
  if (k === first.step) return first.arc;
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1]!;
    const b = stops[i]!;
    if (k <= b.step) {
      const span = b.step - a.step;
      if (span <= 0) return b.arc;
      return a.arc + ((k - a.step) / span) * (b.arc - a.arc);
    }
  }
  return total;
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
  // dot slots appearing inside items change node geometry; data-step
  // flips re-ladder the milestone table)
  const mo = new MutationObserver(remeasure);
  mo.observe(list, { childList: true, subtree: true, attributeFilter: ['data-jx-tl-pending', 'data-step'] });
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
