/**
 * disclosure-motion (registry/files/lib/disclosure-motion.ts,
 * the wedge round, 2026-09-19).
 *
 * The 0fr→1fr disclosure animator — the drawer law's motion lane,
 * driven by rAF INTERPOLATION instead of the CSS transition engine.
 *
 * WHY THIS EXISTS (the Chrome 146 clock-freeze receipt): the
 * grid-template-rows fr-transition on disclosed elements inside
 * scroll-revealed ([data-reveal], animation-timeline: view())
 * sections randomly freezes — the CSSTransition object starts,
 * reports playState 'running', and its currentTime stays 0 FOREVER
 * (measured live on the canvas dock: state flips, classes correct,
 * the used track pinned at the start value; the wedge persists
 * after the reveal animation completes; a display-flip re-arm
 * recovers it). WAAPI animate() showed the SAME frozen-clock
 * signature under the same conditions. The bug is in the web-
 * animations clock layer, below anything our css can steer — so the
 * disclosure motion leaves that clock entirely: a rAF loop writes
 * the interpolated track size INLINE (definite px, mathematically
 * equal to the fr values at both endpoints), and the element's
 * CLASSES keep carrying the semantic 0fr/1fr endpoints (no-JS and
 * reduced-motion users get the same instant toggle they always had).
 *
 * THE CONTRACT: animateGridDisclosure(el, open) interpolates from
 * the element's CURRENT computed track size to the disclosure
 * endpoint — open measures the content row (the child's natural
 * height), closed goes to 0px. At motion end the inline override is
 * CLEARED so the class-level 0fr/1fr owns the resting state
 * (resize-proof: a cleared inline lets the 1fr track re-track its
 * content). Cancellation is per-element (rapid toggles retarget
 * from wherever the motion stands). prefers-reduced-motion: no
 * frames — the call is a no-op leaving the class state instant.
 */

/** the motion-ease-nav curve (the sheet's --motion-ease-nav), in JS */
const easeNav = cubicBezier(0.22, 1, 0.36, 1);

/** cubic-bezier as a pure function (the canonical 1-D solve) */
function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  // the parametric Bezier with a Newton solve for x→t
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 6; i++) {
      const dx = sampleX(t) - x;
      if (Math.abs(dx) < 1e-6) return sampleY(t);
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    // bisection fallback for the flat-curve edge
    let lo = 0;
    let hi = 1;
    t = x;
    while (lo < hi) {
      const dx = sampleX(t) - x;
      if (Math.abs(dx) < 1e-6) break;
      if (dx > 0) hi = t;
      else lo = t;
      t = (lo + hi) / 2;
    }
    return sampleY(t);
  };
}

interface MotionState {
  raf: number;
}

/** per-element cancellation registry (rapid toggles retarget mid-flight) */
const live = new WeakMap<HTMLElement, MotionState>();

const reducedMotion = (): boolean =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** the element's current first-track size, as px (fr/px/auto all resolve) */
const currentTrackPx = (el: HTMLElement): number => {
  const rows = getComputedStyle(el).gridTemplateRows;
  const first = rows.split(' ')[0] ?? '0px';
  const px = Number.parseFloat(first);
  return Number.isFinite(px) ? px : 0;
};

/** the open endpoint: the content row's natural height (what 1fr resolves to) */
const contentHeight = (el: HTMLElement): number => {
  const kid = el.firstElementChild;
  if (kid instanceof HTMLElement) return kid.scrollHeight;
  return el.scrollHeight;
};

/**
 * Animate a grid-disclosure element between its 0fr/1fr endpoints.
 * The element's CLASSES must carry the semantic endpoint (the
 * grid-family rowsCollapse/rowsOpen atoms or equivalent); this lane
 * only interpolates inline and clears itself at rest.
 */
export function animateGridDisclosure(
  el: HTMLElement,
  open: boolean,
  opts: { duration?: number } = {},
): void {
  const duration = opts.duration ?? 200; // the --motion-200 law

  // cancel any in-flight motion for this element
  live.get(el)?.raf !== undefined && cancelAnimationFrame(live.get(el)!.raf);
  live.delete(el);

  // reduced motion: no frames — the class state IS the resting state
  if (reducedMotion()) {
    el.style.gridTemplateRows = '';
    return;
  }

  const from = currentTrackPx(el);
  const to = open ? contentHeight(el) : 0;
  if (from === to) {
    el.style.gridTemplateRows = '';
    return;
  }

  const start = performance.now();
  const state: MotionState = { raf: 0 };
  live.set(el, state);

  const frame = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = easeNav(t);
    const px = from + (to - from) * eased;
    el.style.gridTemplateRows = `${px.toFixed(2)}px`;
    if (t < 1) {
      state.raf = requestAnimationFrame(frame);
    } else {
      // rest: clear the inline override — the class endpoint owns it
      el.style.gridTemplateRows = '';
      live.delete(el);
    }
  };
  state.raf = requestAnimationFrame(frame);
}
