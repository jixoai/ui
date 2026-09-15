/**
 * jixoai scroll-area-kit — THE SHARED CORE
 * (registry/files/lib/scroll-area-kit/core.ts, Owner 2026-09-15: the
 * scroll-area family rework — one hand-drawn law + a platform sibling
 * + one shared kit).
 *
 * SPLIT BY CONCERN (the Gate-1 r1 ruling: one monolithic state machine
 * would force the platform sibling to mount custom-thumb ARIA it
 * cannot honestly carry). THIS FILE IS PART (a) — the shared CORE:
 * overflow verdict, thumb geometry math, theme-scope resolution. It
 * is PURE: zero paint (no style writes), zero ARIA (no attribute
 * writes) — a new consumer adopts it with no CSS of the kit's look
 * and no ARIA it did not author. The hand-drawn INTERACTION ADAPTER
 * lives in hand-drawn.svelte.ts (consumed ONLY by scroll-area); the
 * platform CAPABILITY STYLES live in native-capability.css (consumed
 * ONLY by native-scroll-area).
 *
 * Boundary: `scroll-run` (registry/files/ui/scroll-run — tabs,
 * button-group, the linear strip edge system) is a DIFFERENT shared
 * system and is untouched. This kit models BOXED-REGION scrollbars:
 * one axis pair per region, a thumb ratio per axis. Where the two
 * families share arithmetic (the RTL engine funnel, the verdict
 * shape), the kit carries its OWN copy attributed below — the two
 * systems must not absorb each other.
 */

// ── the overflow verdict ─────────────────────────────────────────────

/**
 * The scrollability verdict — the scroll-run verdict's SHAPE
 * (data-jx-scroll-state's vocabulary, one per axis here instead of one
 * per strip): `none` when the content fits (no affordance, ever),
 * `start-closed` at the logical start edge, `end-closed` at the far
 * edge, `open` mid-travel. The 1px grace is the same tolerance the
 * strip system uses (fractional layout rounding must not flip a
 * verdict on fitted content).
 */
export type OverflowVerdict = 'none' | 'start-closed' | 'end-closed' | 'open';

/** the axis pair a boxed region carries */
export type ScrollAxis = 'x' | 'y';

/** one READ phase's measure of a single axis (client/scroll port sizes
 * + the current scroll offset along the axis) */
export interface AxisMeasure {
  client: number;
  scroll: number;
  offset: number;
}

/** the pure verdict core: sizes + offset in, verdict out */
export function overflowVerdict(client: number, scroll: number, offset: number): OverflowVerdict {
  const max = scroll - client;
  if (max <= 1) return 'none';
  if (offset <= 1) return 'start-closed';
  if (offset >= max - 1) return 'end-closed';
  return 'open';
}

/** read one axis of a real scrollport (the READ half of the sync —
 * callers batch every read before their first write, the scroll-run
 * no-interleaved-layout law) */
export function measureAxis(el: HTMLElement, axis: ScrollAxis): AxisMeasure {
  return axis === 'y'
    ? { client: el.clientHeight, scroll: el.scrollHeight, offset: el.scrollTop }
    : { client: el.clientWidth, scroll: el.scrollWidth, offset: el.scrollLeft };
}

/** both axes of a region, one verdict each — the pair the component
 * stamps (data-verdict-y / data-verdict-x) and the chrome gates on */
export function regionVerdicts(el: HTMLElement): Record<ScrollAxis, OverflowVerdict> {
  const y = measureAxis(el, 'y');
  const x = inlineMeasure(el);
  return {
    y: overflowVerdict(y.client, y.scroll, y.offset),
    x: overflowVerdict(x.client, x.scroll, x.offset),
  };
}

// ── thumb geometry ───────────────────────────────────────────────────

/** the thumb's geometry as PURE fractions: `shown` (the axis overflows
 * — no verdict, no chrome), `ratio` (thumb size / track size =
 * client/scroll), `position` (0..1 logical travel). Consumers turn the
 * fractions into paint (inline sizes, logical inset) and value
 * (aria-valuenow) — the math never leaves this core */
export interface ThumbGeometry {
  readonly shown: boolean;
  readonly ratio: number;
  readonly position: number;
}

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

export function thumbGeometry(client: number, scroll: number, offset: number): ThumbGeometry {
  const max = scroll - client;
  if (client <= 0 || scroll <= 0 || max <= 1) return { shown: false, ratio: 1, position: 0 };
  return { shown: true, ratio: clamp01(client / scroll), position: clamp01(offset / max) };
}

// ── the RTL inline engine ────────────────────────────────────────────
// The kit's own funnel — arithmetic-identical to the scroll-run trio
// (2026-09-02 tabs hardening, empirically proven) but carried as this
// kit's copy: the two shared systems stay disjoint. Inline axis only;
// the block axis has no engine split (scrollTop is canonical on every
// engine).

/** the three RTL scrollLeft engines: spec-negative (0→−max, every
 * modern engine), positive-ascending (0→+max, legacy WebKit) and
 * positive-descending (+max→0, legacy IE/Edge) */
export type RtlScrollModel = 'negative' | 'positive-ascending' | 'positive-descending';

/** the engine probe's decision core (pure — rest value + probe read
 * in, engine out); the caller OWNS the probe write (it mutates
 * scrollLeft and must run at most once per element) */
export function detectRtlScrollModel(rest: number, probe: () => number): RtlScrollModel {
  if (rest < 0) return 'negative';
  if (rest > 0) return 'positive-descending';
  return probe() < 0 ? 'negative' : 'positive-ascending';
}

/** raw engine scrollLeft → the CANONICAL inline space [−max, 0]
 * (0 = inline start) on every engine */
export function rtlScrollToCanonical(model: RtlScrollModel, raw: number, max: number): number {
  if (model === 'positive-ascending') return -raw;
  if (model === 'positive-descending') return raw - max;
  return raw;
}

/** ONE direction truth: the computed direction is the LAW (it folds
 * [dir], css `direction` and inheritance); the nearest [dir] attribute
 * stands in only where the cascade reports nothing */
export function isRtlElement(el: HTMLElement | null | undefined): boolean {
  if (!el) return false;
  const computed = getComputedStyle(el).direction;
  if (computed) return computed === 'rtl';
  return (el.closest('[dir]') as HTMLElement | null)?.dir === 'rtl';
}

const rtlModels = new WeakMap<HTMLElement, RtlScrollModel>();

function rtlModel(el: HTMLElement, max: number): RtlScrollModel {
  let model = rtlModels.get(el);
  if (model) return model;
  // neutralize scroll-behavior:smooth for the probe's lifetime — it
  // smooths even assignments and the sync read-back would misclassify
  const savedBehavior = el.style.scrollBehavior;
  el.style.scrollBehavior = 'auto';
  const saved = el.scrollLeft;
  if (saved === 0) el.scrollLeft = -1;
  model = detectRtlScrollModel(saved, () => el.scrollLeft);
  el.scrollLeft = saved;
  el.style.scrollBehavior = savedBehavior;
  rtlModels.set(el, model);
  return model;
}

/** the inline axis measure with the offset NORMALIZED to logical
 * travel [0..max] (distance from the inline START — right edge under
 * RTL): LTR reads scrollLeft directly, RTL funnels the raw engine
 * value through the canonical space (pos = −canon on every engine) */
export function inlineMeasure(el: HTMLElement): AxisMeasure {
  const client = el.clientWidth;
  const scroll = el.scrollWidth;
  const max = scroll - client;
  if (max <= 1) return { client, scroll, offset: 0 };
  if (!isRtlElement(el)) return { client, scroll, offset: el.scrollLeft };
  const canon = rtlScrollToCanonical(rtlModel(el, max), el.scrollLeft, max);
  return { client, scroll, offset: -canon };
}

/** write the LOGICAL inline offset (the inlineMeasure space) back to
 * the engine's raw scrollLeft — the write-path counterpart, ABSOLUTE
 * writes only (a bare delta mis-maps on descending engines; the ±max
 * offsets only cancel between two mapped absolutes) */
export function scrollInlineTo(el: HTMLElement, logical: number): void {
  const max = el.scrollWidth - el.clientWidth;
  if (max <= 1) return;
  if (!isRtlElement(el)) {
    el.scrollLeft = logical;
    return;
  }
  const model = rtlModel(el, max);
  const canon = -Math.min(0, Math.max(-max, logical));
  el.scrollLeft =
    model === 'positive-ascending' ? -canon : model === 'positive-descending' ? canon + max : canon;
}

/** pointer travel → scroll travel for a drag: the factor mapping thumb
 * pixels to scroll units. thumbPx is the thumb's RENDERED size (the
 * consumer's min-size paint may exceed the raw ratio — measure, never
 * recompute) */
export function dragFactor(trackPx: number, client: number, scroll: number, thumbPx: number): number {
  const range = scroll - client;
  if (range <= 0 || trackPx <= 0) return 0;
  const lane = Math.max(1, trackPx - thumbPx);
  return range / lane;
}

// ── theme-scope resolution ───────────────────────────────────────────

/** the theme scope vocabulary: a scope answers light/dark; `null` =
 * the whole ancestor chain carries no scope (the OS scheme is then
 * the honest answer — an unthemed page follows the user) */
export type ThemeScope = 'light' | 'dark';

/**
 * Resolve the nearest theme scope around an element (SELF INCLUDED —
 * the scoped element itself counts): `[data-theme="light"|"dark"]`,
 * `.dark`, `.jx-light`, first hit walking up. This is the W1 lesson
 * made reusable: a stage's theme is a scoped attribute/class on an
 * ancestor, and `html.dark` is merely the root-most scope in the same
 * walk. PURE — callers decide what to do with the answer (the native
 * sibling aligns `color-scheme`; consumers may restyle); no observer
 * lives here.
 */
export function resolveThemeScope(el: HTMLElement | null | undefined): ThemeScope | null {
  let node: HTMLElement | null = el;
  while (node) {
    const theme = node.getAttribute('data-theme');
    if (theme === 'dark') return 'dark';
    if (theme === 'light') return 'light';
    if (node.classList.contains('dark')) return 'dark';
    if (node.classList.contains('jx-light')) return 'light';
    node = node.parentElement;
  }
  return null;
}
