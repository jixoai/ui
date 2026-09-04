/**
 * jixoai scroll-run (registry/files/ui/scroll-run/scroll-run.svelte.ts,
 * Owner 2026-09-04 — "统一成一套 utils，未来所有可滚动区域复用").
 *
 * THE ONE scroll-run machine, extracted from the two same-law copies
 * (tabs-list invented it 2026-09-01, hardened 2026-09-02; button-group
 * ported it 2026-09-04 and carried the acceptance rulings: the
 * background-tab wake restamp, the eased consumption, the frosted
 * chip). Every scrollable region in the registry rides THIS file +
 * scroll-run.css — the consumers keep only their own tuning (band
 * width overrides, snap, their ramp audiences).
 *
 * Orthogonal intents:
 *   1. THE RTL ENGINE — the three scrollLeft engines a browser may
 *      run, funneled through ONE canonical [−max, 0] inline space
 *      (2026-09-02 hardening, tabs' source law)
 *   2. THE STAMP MACHINE — the scroll-state verdict, the host
 *      progress var, and the per-member edge factors; one truth the
 *      css keys the chevrons, the veils and the ramps on
 *   3. THE NUDGE — the chevron's page step (lane-derived)
 *   4. THE EFFECT BUILDERS — the typed scrollEffect descriptors
 *      (slide/blur/blurSlide/shadow/progressBlur; the paint laws live
 *      in scroll-run.css)
 */

// ── 1 · the RTL engine ───────────────────────────────────────────────

/** the three RTL scrollLeft engines: spec-negative (0→−max, every
 *  modern engine), positive-ascending (0→+max, legacy WebKit) and
 *  positive-descending (+max→0, legacy IE/Edge) */
export type RtlScrollModel = 'negative' | 'positive-ascending' | 'positive-descending';

/** the engine probe's decision core (pure — rest value + probe read
 *  in, engine out): at rest a negative engine reports ≤0 and a
 *  descending one parks at its +max; only a 0 rest is ambiguous, and
 *  the −1 write separates it (spec engines keep −1, ascending clamps
 *  to 0) */
export function detectRtlScrollModel(rest: number, probe: () => number): RtlScrollModel {
  if (rest < 0) return 'negative';
  if (rest > 0) return 'positive-descending';
  return probe() < 0 ? 'negative' : 'positive-ascending';
}

/** raw engine scrollLeft → the CANONICAL inline space [−max, 0] (0 =
 *  inline start): one arithmetic for state, progress and the physical
 *  window origin (origin = max + canon holds on EVERY engine) */
export function rtlScrollToCanonical(model: RtlScrollModel, raw: number, max: number): number {
  if (model === 'positive-ascending') return -raw;
  if (model === 'positive-descending') return raw - max;
  return raw;
}

/** canonical → the engine's raw scrollLeft (the write path; scrollBy
 *  deltas ride the same mapping — the ±max offsets cancel in a delta) */
export function rtlScrollFromCanonical(model: RtlScrollModel, canon: number, max: number): number {
  if (model === 'positive-ascending') return -canon;
  if (model === 'positive-descending') return canon + max;
  return canon;
}

/** ONE direction truth: the computed direction is the LAW (it resolves
 *  [dir], css `direction` and inheritance into the used value — pure-
 *  css rtl included); the nearest [dir] attribute stands in only where
 *  the cascade reports nothing */
export function isRtlDirection(computed: string, dirAttr: string | null | undefined): boolean {
  if (computed) return computed === 'rtl';
  return (dirAttr ?? 'ltr') === 'rtl';
}

/** probed engines, per run element — the probe WRITES scrollLeft, so
 *  it must run at most once per element */
const rtlScrollModels = new WeakMap<HTMLElement, RtlScrollModel>();

/** the element-level rtl verdict (computed-direction law) */
export function isRtlElement(el: HTMLElement | null | undefined): boolean {
  if (!el) return false;
  return isRtlDirection(getComputedStyle(el).direction, (el.closest('[dir]') as HTMLElement | null)?.dir);
}

function rtlScrollModel(run: HTMLElement, max: number): RtlScrollModel {
  if (max <= 1) return 'negative';
  let model = rtlScrollModels.get(run);
  if (model) return model;
  // scroll-behavior:smooth SMOOTHS EVEN ASSIGNMENTS — neutralize it
  // for the probe's lifetime, restore after (browser-proven re-attack:
  // the sync read-back would misclassify engines)
  const savedBehavior = run.style.scrollBehavior;
  run.style.scrollBehavior = 'auto';
  const saved = run.scrollLeft;
  if (saved === 0) run.scrollLeft = -1;
  model = detectRtlScrollModel(saved, () => run.scrollLeft);
  run.scrollLeft = saved;
  run.style.scrollBehavior = savedBehavior;
  rtlScrollModels.set(run, model);
  return model;
}

// ── 2 · the stamp machine ────────────────────────────────────────────

/** the canonical factor read: every geometric query happens in the
 *  READ phase, every style write in the WRITE phase (no interleaved
 *  forced layout) */
export interface ScrollStampOptions {
  /** the scroller — the run (its offsetLeft space is the members') */
  readonly run: HTMLElement;
  /** the progress var's host — the run's non-scrolling wrapper (a var
   *  on the run never reaches the overlay siblings); null = no
   *  progress var (the verdict still lands on the run) */
  readonly host: HTMLElement | null;
  /** the ramp audience: the VISIBLE painted members (buttons AND
   *  separators — the ramp css keys `> *`, an un-stamped member would
   *  float at full opacity between its fading neighbors) */
  readonly members: () => HTMLElement[];
  /** whether the per-member edge factors stamp (the veil effects never
   *  pay the stamp loop — explicit enumeration) */
  readonly ramps: boolean;
  /** the progress var name (default --jx-scroll-progress) */
  readonly progressVar?: string;
  /** mirror stamps: targets carrying ANOTHER element's factors (tabs'
   *  selection indicator rides its ACTIVE trigger's edge factors, so
   *  an exiting selected tab takes its bar with it) */
  readonly mirrors?: () => { target: HTMLElement; source: HTMLElement }[];
}

export interface ScrollStamp {
  /** re-run the stamp by hand (selection moves, remeasures) */
  update(): void;
  destroy(): void;
}

/**
 * The ONE scroll-state machine: on every scroll trigger it stamps the
 * run's VERDICT (data-jx-scroll-state: none | start-closed |
 * end-closed | open — the single truth the css keys the chevrons and
 * the veil layer on; no verdict — no chrome), the host's progress var
 * (0–1 inline travel, RTL-normalized — the one number the chevron
 * fade and the veil entrance calc from), and the per-member edge
 * factors (--jx-edge-start/end, the clipped fraction of each member's
 * own width; rest stamps 0 = the natural self, by arithmetic — no
 * stale factor survives a scroll back). Listens to scroll (passive),
 * content growth (ResizeObserver on the run + the current first/last
 * members), the document font set, and the page's return to the
 * foreground (a backgrounded tab pauses the rendering pipeline —
 * scroll events queue UNDELIVERED and the stamps go stale while the
 * box keeps its position; the wake restamp closes the hole).
 */
export function createScrollStamp(options: ScrollStampOptions): ScrollStamp {
  const { run, host, members, ramps, mirrors } = options;
  const progressVar = options.progressVar ?? '--jx-scroll-progress';
  const stamp = (el: HTMLElement, name: string, v: number) => {
    if (v > 0) el.style.setProperty(name, v.toFixed(3));
    else el.style.removeProperty(name);
  };
  // content growth re-verdicts: watch the run + the first/last
  // members (observed once per element — re-observing inside the
  // callback would recurse on the jsdom sync-fire polyfill)
  const observed = new WeakSet<HTMLElement>();
  const update = () => {
    const kids = members();
    const max = run.scrollWidth - run.clientWidth;
    // RTL normalization: the raw scrollLeft maps through the run's
    // probed engine into the canonical inline space; the PHYSICAL
    // window origin the offset* geometry measures against is max+canon,
    // identically on all three engines. offsetLeft/offsetWidth stay
    // physical; only the state/progress math normalizes
    const rtl = isRtlElement(run);
    const canon = rtl
      ? rtlScrollToCanonical(rtlScrollModel(run, max), run.scrollLeft, max)
      : run.scrollLeft;
    const pos = rtl ? -canon : canon;
    const state =
      max <= 1 ? 'none' : pos <= 1 ? 'start-closed' : pos >= max - 1 ? 'end-closed' : 'open';
    const w = run.clientWidth;
    const xL = rtl ? max + canon : canon;
    // clipped fractions against the physical window [xL, xL+w]; the
    // slot NAMES are the LTR documentary bias — the stamps are
    // physical left/right, which keeps the css slide calc exit-ward
    // under RTL too (a member slides toward the edge clipping it)
    const factors = (x: number, tw: number): [number, number] =>
      max <= 1 || tw <= 0
        ? [0, 0]
        : [
            Math.min(tw, Math.max(0, xL - x)) / tw,
            Math.min(tw, Math.max(0, x + tw - (xL + w))) / tw,
          ];
    // READ pass — every geometry query before the first style write
    const rows: { t: HTMLElement; s: number; e: number }[] = [];
    if (ramps) {
      for (const t of kids) {
        const [s, e] = factors(t.offsetLeft, t.offsetWidth);
        rows.push({ t, s, e });
      }
      for (const { target, source } of mirrors?.() ?? []) {
        const [s, e] = factors(source.offsetLeft, source.offsetWidth);
        rows.push({ t: target, s, e });
      }
    }
    // WRITE pass
    run.setAttribute('data-jx-scroll-state', state);
    host?.style.setProperty(progressVar, max > 1 ? String(pos / max) : '0');
    for (const { t, s, e } of rows) {
      stamp(t, '--jx-edge-start', s);
      stamp(t, '--jx-edge-end', e);
    }
    for (const t of [kids[0], kids.at(-1)]) {
      if (t && !observed.has(t)) {
        observed.add(t);
        ro?.observe(t);
      }
    }
  };
  const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => update());
  update();
  run.addEventListener('scroll', update, { passive: true });
  ro?.observe(run);
  // the wake: a backgrounded tab's queued scroll events never
  // deliver — restamp when the page returns
  const onWake = () => update();
  document.addEventListener('visibilitychange', onWake);
  window.addEventListener('focus', onWake);
  // late fonts re-widen labels: one quiet restamp when the font set
  // settles
  let alive = true;
  document.fonts?.ready.then(() => {
    if (alive) update();
  });
  return {
    update,
    destroy() {
      alive = false;
      run.removeEventListener('scroll', update);
      document.removeEventListener('visibilitychange', onWake);
      window.removeEventListener('focus', onWake);
      ro?.disconnect();
    },
  };
}

// ── 3 · the nudge ────────────────────────────────────────────────────

/** the chevron's scroll step: one viewport minus the two lanes (the
 *  lane width IS the run's own scroll-padding, derived — no second
 *  constant); smooth comes from the run's scroll-behavior. RTL writes
 *  go through ABSOLUTE canonical targets (a bare delta mis-maps on
 *  descending engines — the ±max offset only cancels between two
 *  mapped absolutes) */
export function nudgeRun(run: HTMLElement, direction: -1 | 1): void {
  const rtl = isRtlElement(run);
  const lane = parseFloat(getComputedStyle(run).scrollPaddingInlineStart || '0') || 0;
  const step = Math.max(1, run.clientWidth - lane * 2);
  const max = run.scrollWidth - run.clientWidth;
  if (!rtl || max <= 1) {
    // LTR, or a run with no scroll distance (jsdom/degenerate): the
    // plain delta is the honest write
    run.scrollBy({ left: direction * step });
    return;
  }
  const model = rtlScrollModel(run, max);
  const curCanon = rtlScrollToCanonical(model, run.scrollLeft, max);
  const targetCanon = Math.min(0, Math.max(-max, curCanon - direction * step));
  run.scrollTo({ left: rtlScrollFromCanonical(model, targetCanon, max) });
}

// ── 4 · the effect builders ──────────────────────────────────────────

/** edge treatment while a scroll run scrolls — built by the typed
 *  builders (options stay typed and discoverable). slide is the
 *  DEFAULT, the cheapest: translate+opacity only, no filter:
 *  - slide() / blur() / blurSlide(): each member ramps as it clips
 *    under a run edge — scroll-following per-member factors
 *    (--jx-edge-start/end, the clipped fraction of the member's own
 *    width) stamped by the machine and calc'd in css; rest is factor 0
 *    by arithmetic (view() timelines were tried and rejected:
 *    Chromium resolves named ranges garbage at rest — the
 *    stuck-first-button bug)
 *  - shadow() / progressBlur(): the veil layer over the run's edges —
 *    shadow is the separator INK law's contrast ghost (backdrop
 *    contrast() subtracts color toward mid, never adds black);
 *    progressBlur mounts the ProgressiveBlur ladder. width overrides
 *    the band width (--jx-scroll-veil) */
export type ScrollEffect =
  | SlideEffect
  | BlurEffect
  | BlurSlideEffect
  | ShadowEffect
  | ProgressBlurEffect;

export interface SlideOptions {
  /** how far a crossing member offsets along the inline axis */
  distance?: string;
}
export interface SlideEffect {
  readonly type: 'slide';
  distance: string;
}
export function slide({ distance = '8px' }: SlideOptions = {}): SlideEffect {
  return { type: 'slide', distance };
}

export interface BlurOptions {
  /** the blur radius a crossing member ramps to */
  radius?: string;
}
export interface BlurEffect {
  readonly type: 'blur';
  radius: string;
}
export function blur({ radius = '4px' }: BlurOptions = {}): BlurEffect {
  return { type: 'blur', radius };
}

export interface BlurSlideOptions extends BlurOptions, SlideOptions {}
export interface BlurSlideEffect {
  readonly type: 'blur+slide';
  radius: string;
  distance: string;
}
export function blurSlide({ radius = '4px', distance = '8px' }: BlurSlideOptions = {}): BlurSlideEffect {
  return { type: 'blur+slide', radius, distance };
}

export interface ShadowOptions {
  /** the band width (any css length) — overrides the --jx-scroll-veil default */
  width?: string;
}
export interface ShadowEffect {
  readonly type: 'shadow';
  width?: string;
}
/** the contrast-ghost veil: backdrop-filter contrast() subtracts
 *  color toward mid tone (the separator's INK law) — one layer, no
 *  ladder, theme-agnostic by construction */
export function shadow({ width }: ShadowOptions = {}): ShadowEffect {
  return { type: 'shadow', width };
}

export interface ProgressBlurOptions {
  /** per-layer blur px of the edge veil, inner-edge first (≥2 levels);
   *  the DEFAULT ladder is the restraint ruling's — a compact row's
   *  height is limited, so the peak caps at 4px */
  blurLevels?: number[];
  /** the band width (any css length) — overrides the --jx-scroll-veil default */
  width?: string;
}
export interface ProgressBlurEffect {
  readonly type: 'progressBlur';
  blurLevels: number[];
  width?: string;
}
export function progressBlur({
  blurLevels = [0.25, 0.5, 1, 1.5, 2.5, 4],
  width,
}: ProgressBlurOptions = {}): ProgressBlurEffect {
  return { type: 'progressBlur', blurLevels, width };
}
